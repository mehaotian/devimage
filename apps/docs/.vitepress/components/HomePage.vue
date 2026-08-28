<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useReveal } from '../composables/useReveal';
import HomeIcon from './HomeIcon.vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

const rootRef = ref<HTMLElement | null>(null);
useReveal(rootRef);

const heroBadges = ['无需注册', '国内 CDN', '路径即参数'];

const stats = [
  {
    icon: 'stat-link',
    value: '7',
    label: '资源类型',
    hint: '占位 · 头像 · 照片 · Mock',
    color: 'purple',
  },
  {
    icon: 'stat-bolt',
    value: '50+',
    label: '头像风格',
    hint: '图即算法与开源接入',
    color: 'amber',
  },
  {
    icon: 'stat-tools',
    value: 'SVG',
    label: '默认输出',
    hint: '亦可 WebP / PNG',
    color: 'slate',
  },
  {
    icon: 'stat-free',
    value: '0',
    label: 'SDK / API Key',
    hint: '复制 URL 即可调用',
    color: 'blue',
  },
];

const highlights = [
  {
    icon: 'highlight-api',
    color: 'blue',
    badge: '接口',
    title: '开发常用占位集中在同一域名',
    desc: '色块与纹理占位、真实照片、多风格头像、骨架屏、空状态场景图、伪码形，以及中文 Mock JSON。',
    points: ['占位图 / 骨架屏 / 场景图', '头像与真实照片', 'Mock 用户、文章、商品'],
  },
  {
    icon: 'highlight-fast',
    color: 'green',
    badge: '输出',
    title: '默认 SVG，需要位图时可转码',
    desc: '占位、头像、场景与码形默认返回 SVG，便于缩放。小程序等场景可使用 WebP 或 PNG。',
    points: ['默认 image/svg+xml', '后缀或 format 指定栅格', 'seed 路由可长期缓存'],
  },
  {
    icon: 'highlight-check',
    color: 'purple',
    badge: '接入',
    title: '无需注册，兼容常见 URL 习惯',
    desc: '不发放 API Key。支持 placehold 的宽x高写法、picsum 的 seed / id 路径，以及 JSONPlaceholder 风格的 Mock 前缀。',
    points: ['/800x600 与路径配色', '/seed、/id、/v2/list', '/mock/users、/posts、/products'],
  },
  {
    icon: 'highlight-clipboard',
    color: 'orange',
    badge: '确定',
    title: '同一 URL 可得到稳定结果',
    desc: '占位、头像、照片、码形均支持 seed。相同参数返回相同画面，适合列表占位与 UI 回归。',
    points: ['/seed/:seed/:w/:h', '头像 style + 标识', '照片 scene / cat + seed'],
  },
];

const resources = [
  { icon: 'res-placeholder', title: '占位图', desc: '色块、纹理、边框与文字', route: '/800/600', link: '/api/placeholder', count: '10–4000 px' },
  { icon: 'res-seed', title: 'Seed 占位', desc: '相同 seed 固定配色', route: '/seed/demo/800/600', link: '/api/placeholder', count: 'immutable' },
  { icon: 'res-avatar', title: '头像', desc: '中文首字与 50 余种风格', route: '/avatar/devimg/张三/128', link: '/api/avatar', count: '50+ 风格' },
  { icon: 'res-scene', title: '场景占位', desc: '404、空数据、断网、搜索无结果', route: '/scene/404', link: '/api/scene', count: '4 种 variant' },
  { icon: 'res-404', title: '骨架屏', desc: '列表、卡片、网格加载态', route: '/skeleton/375/812', link: '/api/skeleton', count: '4 种布局' },
  { icon: 'res-posts', title: '真实照片', desc: '按用途或题材取图，可固定 seed', route: '/photo/400/400?scene=product&seed=demo', link: '/api/photo', count: 'scene / cat' },
  { icon: 'res-products', title: '码形占位', desc: '伪 QR、伪条码，仅作 UI 占位', route: '/qr/demo/128', link: '/api/qr', count: '不可扫描' },
  { icon: 'res-users', title: 'Mock 数据', desc: '用户、文章、商品，含分页与单条', route: '/mock/users', link: '/api/mock', count: '每类 100 条' },
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
  { id: 'avatar', label: '头像', path: '/avatar/devimg/张三/128', img: '/avatar/devimg/%E5%BC%A0%E4%B8%89/128' },
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
  const avatar = `${API_BASE}/avatar/devimg/张三/64`;
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
          <h1 class="dh-hero-title">国内开发者的<br />占位图 CDN</h1>
          <p class="dh-hero-desc">
            图即（devimg）按 URL 返回占位图、头像、真实照片、骨架屏、场景图与 Mock JSON。
            无需 SDK 与 API Key，将地址写入 <code>img</code> 或 <code>fetch</code> 即可。
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
        <h2>已开放的资源</h2>
        <p>下列接口均可直接调用，参数与示例见各 API 文档。</p>
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
        <a href="/guide/dev-spec">查看已上线路由与后期规划 →</a>
      </div>
    </section>

    <!-- 使用场景 + 代码 -->
    <section class="dh-section">
      <div class="dh-section-head reveal">
        <h2>在页面与接口中引用</h2>
        <p>Web、H5、小程序与组件库均可直接使用 CDN 地址，无需安装依赖。</p>
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
        <h2>从一条 URL 开始</h2>
        <p>无需注册。将占位地址写入页面，或按迁移指南替换 picsum / placehold 域名。</p>
        <a href="/guide/quick-start" class="dh-btn dh-btn-white">
          查看快速开始 →
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
              <p>图即 — 国内开发者占位图 CDN</p>
            </div>
          </a>
        </div>
        <div class="dh-footer-col">
          <h4>产品</h4>
          <a href="/api/placeholder">占位图</a>
          <a href="/api/avatar">头像</a>
          <a href="/api/photo">真实照片</a>
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
          <a href="/guide/fair-use">使用规范</a>
          <a href="/guide/avatar-licenses">头像许可</a>
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
