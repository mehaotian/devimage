<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useReveal } from '../composables/useReveal';
import HomeIcon from './HomeIcon.vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

const rootRef = ref<HTMLElement | null>(null);
useReveal(rootRef);

const heroBadges = ['稳定可靠', '开发者友好', 'URL 即用'];

const stats = [
  {
    icon: 'stat-link',
    value: '9+',
    label: 'API 路由',
    hint: '占位 · 头像 · Mock',
    color: 'purple',
  },
  {
    icon: 'stat-bolt',
    value: 'SVG',
    label: '矢量实时输出',
    hint: 'img 直出，可缩放',
    color: 'amber',
  },
  {
    icon: 'stat-tools',
    value: '0',
    label: 'SDK / 配置项',
    hint: 'URL 复制即用',
    color: 'slate',
  },
  {
    icon: 'stat-free',
    value: '100/min',
    label: '免费额度',
    hint: '开发阶段够用',
    color: 'blue',
  },
];

const highlights = [
  {
    icon: 'highlight-api',
    color: 'blue',
    badge: '全覆盖',
    title: '丰富 API',
    desc: '占位图、头像、场景插画、Mock 数据 — 开发阶段常用的都在这。',
    points: ['/:w/:h 占位图', '/avatar 字母头像', '/mock 假 REST'],
  },
  {
    icon: 'highlight-fast',
    color: 'green',
    badge: '轻量',
    title: '轻量响应',
    desc: 'SVG 和 JSON 实时生成，img 和 fetch 直接调用，没有额外依赖。',
    points: ['SVG 毫秒级', 'JSON 可缓存', '无 npm 包'],
  },
  {
    icon: 'highlight-check',
    color: 'purple',
    badge: '零门槛',
    title: '开发可用',
    desc: '占位资源随便用，不用注册，先把页面搭起来再说。',
    points: ['无需账号', '免费额度', '文档有示例'],
  },
  {
    icon: 'highlight-clipboard',
    color: 'orange',
    badge: '即拷即用',
    title: '简单易用',
    desc: '复制 URL 到项目里就行，路径即参数，文档有示例照着写。',
    points: ['路径即 API', 'Query 可选', '兼容常见写法'],
  },
];

const resources = [
  { icon: 'res-placeholder', title: '占位图', desc: '随机色块 SVG', route: '/800/600', link: '/api/placeholder', count: '任意尺寸' },
  { icon: 'res-seed', title: 'Seed 固定图', desc: '确定性配色', route: '/seed/demo/800/600', link: '/api/placeholder', count: 'UI 回归' },
  { icon: 'res-avatar', title: '字母头像', desc: '中文首字 / 英文首字母', route: '/avatar/张三/128', link: '/api/avatar', count: '圆形 SVG' },
  { icon: 'res-scene', title: '场景插画', desc: '404 / 空状态 / 断网', route: '/scene/404', link: '/api/scene', count: '4 种 variant' },
  { icon: 'res-users', title: 'Mock 用户', desc: '中文姓名 + 头像', route: '/mock/users', link: '/api/mock', count: '最多 100 条' },
  { icon: 'res-posts', title: 'Mock 文章', desc: '标题 + 正文', route: '/mock/posts', link: '/api/mock', count: '列表数据' },
  { icon: 'res-products', title: 'Mock 商品', desc: '名称 + 价格 + 图', route: '/mock/products', link: '/api/mock', count: '列表数据' },
  { icon: 'res-404', title: '404 快捷', desc: '等价 /scene/404', route: '/404', link: '/api/scene', count: '快捷路由' },
];

const platformTabs = [
  { id: 'web', label: 'Web 开发' },
  { id: 'mobile', label: '移动 H5' },
  { id: 'mini', label: '小程序' },
  { id: 'component', label: '组件库' },
];

const codeLangTabs = [
  { id: 'html', label: 'HTML' },
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
  { id: 'js', label: 'JavaScript' },
];

const previewTabs = [
  { id: 'placeholder', label: '占位图', path: '/800/600', img: '/800/600' },
  { id: 'avatar', label: '头像', path: '/avatar/张三/128', img: '/avatar/%E5%BC%A0%E4%B8%89/128' },
  { id: 'seed', label: 'Seed', path: '/seed/demo/400/300', img: '/seed/demo/400/300' },
  { id: 'scene', label: '场景图', path: '/scene/404?w=480&h=320', img: '/scene/404?w=480&h=320' },
];

const activeTab = ref('placeholder');
const activePlatform = ref('web');
const activeLang = ref('html');
const copied = ref(false);
const codeCopied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;
let codeCopyTimer: ReturnType<typeof setTimeout> | null = null;
let autoRotateTimer: ReturnType<typeof setInterval> | null = null;
let userInteracted = false;

const currentTab = computed(
  () => previewTabs.find((t) => t.id === activeTab.value) ?? previewTabs[0],
);

const displayUrl = computed(() => `${API_BASE}${currentTab.value.path}`);
const imgSrc = computed(() => `${API_BASE}${currentTab.value.img}`);

const codeExamples = computed(() => {
  const url = `${API_BASE}/800/600`;
  const avatar = `${API_BASE}/avatar/张三/64`;
  const map: Record<string, string> = {
    html: `<img src="${url}" alt="placeholder" width="800" height="600" />`,
    vue: `<template>\n  <img :src="'${url}'" alt="placeholder" />\n</template>`,
    react: `export function Banner() {\n  return (\n    <img src="${url}" alt="placeholder" />\n  );\n}`,
    js: `const img = document.createElement('img');\nimg.src = '${url}';\nimg.alt = 'placeholder';\ndocument.body.appendChild(img);`,
  };
  if (activePlatform.value === 'mobile') {
    map.html = `<img src="${url}" style="width:100%;height:auto" />`;
  }
  if (activePlatform.value === 'mini') {
    map.html = `<image src="${url}" mode="aspectFill" />`;
  }
  if (activePlatform.value === 'component') {
    map.vue = `<Avatar name="张三" :size="64" />\n<!-- 缺省图 -->\n<img :src="'${avatar}'" />`;
  }
  return map[activeLang.value] ?? map.html;
});

/**
 * 切换 Hero 预览 Tab
 */
function selectTab(id: string): void {
  userInteracted = true;
  activeTab.value = id;
  stopAutoRotate();
}

/**
 * 复制 Hero 演示 URL
 */
async function copyUrl(): Promise<void> {
  try {
    await navigator.clipboard.writeText(displayUrl.value);
    copied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copied.value = false; }, 2000);
  } catch { /* noop */ }
}

/**
 * 复制场景代码示例
 */
async function copyCode(): Promise<void> {
  try {
    await navigator.clipboard.writeText(codeExamples.value);
    codeCopied.value = true;
    if (codeCopyTimer) clearTimeout(codeCopyTimer);
    codeCopyTimer = setTimeout(() => { codeCopied.value = false; }, 2000);
  } catch { /* noop */ }
}

function startAutoRotate(): void {
  autoRotateTimer = setInterval(() => {
    if (userInteracted) return;
    const idx = previewTabs.findIndex((t) => t.id === activeTab.value);
    activeTab.value = previewTabs[(idx + 1) % previewTabs.length].id;
  }, 4500);
}

function stopAutoRotate(): void {
  if (autoRotateTimer) {
    clearInterval(autoRotateTimer);
    autoRotateTimer = null;
  }
}

onMounted(() => {
  document.querySelector('.vp-doc')?.classList.add('_devimg-home');
  startAutoRotate();
});

onUnmounted(() => {
  stopAutoRotate();
  if (copyTimer) clearTimeout(copyTimer);
  if (codeCopyTimer) clearTimeout(codeCopyTimer);
});
</script>

<template>
  <div ref="rootRef" class="devimg-home">
    <!-- Hero 左右分栏 -->
    <section class="dh-hero">
      <div class="dh-hero-bg" aria-hidden="true">
        <div class="dh-orb dh-orb-1" />
        <div class="dh-orb dh-orb-2" />
        <div class="dh-orb dh-orb-3" />
        <div class="dh-grid" />
      </div>

      <div class="dh-hero-split">
        <!-- 左侧文案 -->
        <div class="dh-hero-left reveal">
          <a href="/" class="dh-hero-brand">
            <img
              src="/logo.png"
              alt="devimg"
              class="dh-hero-logo"
              width="80"
              height="80"
              loading="eager"
            />
            <div class="dh-hero-brand-text">
              <span class="dh-hero-brand-name">devimg</span>
              <span class="dh-hero-brand-cn">图即</span>
            </div>
          </a>
          <div class="dh-badges">
            <span v-for="b in heroBadges" :key="b" class="dh-badge-pill">{{ b }}</span>
          </div>
          <h1 class="dh-hero-title">开发者的<br />图片基础设施</h1>
          <p class="dh-hero-desc">
            devimg（图即）提供占位图、字母头像、场景插画和 Mock 数据的 URL API。
            常用的占位图服务多在海外，devimg 把它们收到一个域名下，复制链接就能用。
          </p>
          <div class="dh-hero-actions">
            <a href="/guide/quick-start" class="dh-btn dh-btn-primary">
              <HomeIcon name="icon-bolt" :size="18" />
              快速开始
            </a>
            <a href="/api/placeholder" class="dh-btn dh-btn-ghost">查看文档</a>
          </div>
        </div>

        <!-- 右侧演示卡片 -->
        <div class="dh-hero-demo reveal" style="--d: 0.12s">
          <div class="dh-deco dh-deco-1" aria-hidden="true">
            <HomeIcon name="deco-image" :size="28" />
          </div>
          <div class="dh-deco dh-deco-2" aria-hidden="true">
            <HomeIcon name="deco-code" :size="28" />
          </div>
          <div class="dh-deco dh-deco-3" aria-hidden="true">
            <HomeIcon name="deco-avatar" :size="28" />
          </div>

          <div class="dh-demo-card">
            <div class="dh-demo-card-tabs">
              <button
                v-for="tab in previewTabs"
                :key="tab.id"
                type="button"
                class="dh-card-tab"
                :class="{ active: activeTab === tab.id }"
                @click="selectTab(tab.id)"
              >
                {{ tab.label }}
              </button>
            </div>
            <div class="dh-demo-card-url">
              <span class="dh-url-text">{{ displayUrl }}</span>
              <button type="button" class="dh-copy" @click="copyUrl">
                <HomeIcon v-if="copied" name="icon-check" :size="16" />
                <HomeIcon v-else name="icon-copy" :size="16" />
              </button>
            </div>
            <div class="dh-demo-card-label">响应示例</div>
            <div class="dh-demo-card-preview">
              <Transition name="dh-fade" mode="out-in">
                <img :key="activeTab" :src="imgSrc" :alt="currentTab.label" />
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据 + 核心优势（合并区块） -->
    <section class="dh-value">
      <div class="dh-value-bg" aria-hidden="true">
        <div class="dh-value-orb dh-value-orb-1" />
        <div class="dh-value-orb dh-value-orb-2" />
      </div>

      <div class="dh-value-inner">
        <!-- 统计卡片 -->
        <div class="dh-value-stats">
          <div
            v-for="(s, i) in stats"
            :key="s.label"
            class="dh-stat-card reveal"
            :class="`dh-stat-card-${s.color}`"
            :style="{ '--d': `${i * 0.08}s` }"
          >
            <div class="dh-stat-icon-wrap">
              <HomeIcon :name="s.icon" :size="32" />
            </div>
            <div class="dh-stat-body">
              <span class="dh-stat-value">{{ s.value }}</span>
              <span class="dh-stat-label">{{ s.label }}</span>
              <span class="dh-stat-hint">{{ s.hint }}</span>
            </div>
            <div class="dh-stat-shine" aria-hidden="true" />
          </div>
        </div>

        <!-- 核心优势 -->
        <div class="dh-highlights">
          <div
            v-for="(h, i) in highlights"
            :key="h.title"
            class="dh-highlight reveal"
            :class="`dh-highlight-${h.color}`"
            :style="{ '--d': `${0.15 + i * 0.08}s` }"
          >
            <div class="dh-highlight-head">
              <div class="dh-highlight-icon-wrap">
                <HomeIcon :name="h.icon" :size="32" />
              </div>
              <span class="dh-highlight-badge">{{ h.badge }}</span>
            </div>
            <h3>{{ h.title }}</h3>
            <p>{{ h.desc }}</p>
            <ul class="dh-highlight-points">
              <li v-for="pt in h.points" :key="pt">
                <HomeIcon name="icon-check-sm" :size="14" />
                {{ pt }}
              </li>
            </ul>
            <div class="dh-highlight-glow" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>

    <!-- 图片资源 8 宫格 -->
    <section class="dh-section dh-section-alt">
      <div class="dh-section-head reveal">
        <h2>丰富的图片资源</h2>
        <p>覆盖开发阶段常见的占位需求，每个资源都有独立 API 文档。</p>
      </div>
      <div class="dh-resources">
        <a
          v-for="(r, i) in resources"
          :key="r.title"
          :href="r.link"
          class="dh-resource reveal"
          :style="{ '--d': `${i * 0.06}s` }"
        >
          <span class="dh-resource-icon">
            <HomeIcon :name="r.icon" :size="32" />
          </span>
          <div class="dh-resource-body">
            <h3>{{ r.title }}</h3>
            <p>{{ r.desc }}</p>
          </div>
          <span class="dh-resource-count">{{ r.count }}</span>
        </a>
      </div>
      <div class="dh-resources-more reveal">
        <a href="/guide/dev-spec">浏览完整 API 列表 →</a>
      </div>
    </section>

    <!-- 使用场景 + 代码 -->
    <section class="dh-section">
      <div class="dh-section-head reveal">
        <h2>适用于各种开发场景</h2>
        <p>不管你用什么框架，用法都是一行 URL。</p>
      </div>

      <div class="dh-scenario-tabs reveal">
        <button
          v-for="p in platformTabs"
          :key="p.id"
          type="button"
          class="dh-scenario-tab"
          :class="{ active: activePlatform === p.id }"
          @click="activePlatform = p.id"
        >
          {{ p.label }}
        </button>
      </div>

      <div class="dh-scenario-split reveal" style="--d: 0.1s">
        <!-- 左侧 UI Mock -->
        <div class="dh-mock-ui">
          <div class="dh-mock-bar">
            <span /><span /><span />
          </div>
          <div class="dh-mock-content">
            <div class="dh-mock-sidebar" />
            <div class="dh-mock-main">
              <div class="dh-mock-banner">
                <img :src="`${API_BASE}/800/200?text=Banner&bg=6366f1&fg=ffffff`" alt="" />
              </div>
              <div class="dh-mock-grid">
                <div v-for="n in 6" :key="n" class="dh-mock-card">
                  <img :src="`${API_BASE}/160/120`" alt="" />
                  <div class="dh-mock-line" />
                  <div class="dh-mock-line short" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧代码 -->
        <div class="dh-code-panel">
          <div class="dh-code-tabs">
            <button
              v-for="lang in codeLangTabs"
              :key="lang.id"
              type="button"
              class="dh-code-tab"
              :class="{ active: activeLang === lang.id }"
              @click="activeLang = lang.id"
            >
              {{ lang.label }}
            </button>
            <button type="button" class="dh-code-copy-btn" @click="copyCode">
              {{ codeCopied ? '已复制' : '复制代码' }}
            </button>
          </div>
          <div class="dh-code-body">
            <Transition name="dh-slide" mode="out-in">
              <pre :key="`${activePlatform}-${activeLang}`"><code>{{ codeExamples }}</code></pre>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- 全宽 CTA -->
    <section class="dh-cta-banner reveal">
      <div class="dh-cta-banner-inner">
        <span class="dh-cta-rocket">
          <HomeIcon name="icon-rocket" :size="48" />
        </span>
        <h2>准备好提升开发效率了吗？</h2>
        <p>不用注册，复制 URL 贴进项目，先把页面搭起来。</p>
        <a href="/guide/quick-start" class="dh-btn dh-btn-white">
          免费开始使用 →
        </a>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="dh-footer">
      <div class="dh-footer-inner">
        <div class="dh-footer-brand">
          <a href="/" class="dh-footer-brand-link">
            <img src="/logo-nav.png" alt="devimg" class="dh-footer-logo-img" width="40" height="40" />
            <div>
              <span class="dh-footer-logo">devimg</span>
              <p>图即 — 开发用的占位图 CDN</p>
            </div>
          </a>
        </div>
        <div class="dh-footer-col">
          <h4>产品</h4>
          <a href="/api/placeholder">占位图</a>
          <a href="/api/avatar">头像</a>
          <a href="/api/scene">场景图</a>
          <a href="/api/mock">Mock 数据</a>
        </div>
        <div class="dh-footer-col">
          <h4>文档</h4>
          <a href="/guide/quick-start">快速开始</a>
          <a href="/guide/dev-spec">功能一览</a>
          <a href="/migrate/from-picsum">从 picsum 迁移</a>
          <a href="/migrate/from-placehold">从 placehold 迁移</a>
        </div>
        <div class="dh-footer-col">
          <h4>资源</h4>
          <a :href="`${API_BASE}/api/docs`" target="_blank">Swagger</a>
          <a :href="`${API_BASE}/health`" target="_blank">健康检查</a>
        </div>
      </div>
      <div class="dh-footer-bottom">
        <span>Copyright © 2026 devimg</span>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
declare const __API_BASE__: string;
</script>
