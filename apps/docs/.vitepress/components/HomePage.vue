<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useReveal } from '../composables/useReveal';
import HomeIcon from './HomeIcon.vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

const rootRef = ref<HTMLElement | null>(null);
useReveal(rootRef);

/** Hero 请求台的 tab：每项对应一条真实路由及其真实缓存策略 */
interface DemoTab {
  id: string;
  label: string;
  /** wh = 宽高两个输入；size = 单一边长输入 */
  param: 'wh' | 'size';
  cacheControl: string;
  build: (a: number, b: number) => string;
}

const demoTabs: DemoTab[] = [
  {
    id: 'placeholder',
    label: '占位图',
    param: 'wh',
    cacheControl: 'public, max-age=3600',
    build: (w, h) => `/${w}/${h}`,
  },
  {
    id: 'seed',
    label: 'Seed',
    param: 'wh',
    cacheControl: 'public, max-age=31536000, immutable',
    build: (w, h) => `/seed/demo/${w}/${h}`,
  },
  {
    id: 'avatar',
    label: '头像',
    param: 'size',
    cacheControl: 'public, max-age=31536000, immutable',
    build: (s) => `/avatar/devimg/张三/${s}`,
  },
  {
    id: 'scene',
    label: '场景图',
    param: 'wh',
    cacheControl: 'public, max-age=86400',
    build: (w, h) => `/scene/404?w=${w}&h=${h}`,
  },
];

/**
 * 头像墙滚动轨道的重复份数。
 * 轨道每次平移一份的宽度实现无缝循环，因此剩余的 (COPIES - 1) 份
 * 必须能铺满视口，否则右侧会露白。与 CSS 里的 -25% 位移保持一致。
 */
const WALL_COPIES = 4;

/** 头像墙：两行反向滚动，取自 59 种风格中视觉差异最大的一批 */
const wallRowA = [
  ['devimg', '张三'],
  ['devimg-mandala', 'Luna'],
  ['bottts', 'Nova'],
  ['devimg-topo', '李四'],
  ['open-peeps', 'Kai'],
  ['devimg-matrix', 'Iris'],
  ['notionists', 'Milo'],
  ['devimg-pixel', '王五'],
  ['fun-emoji', 'Zed'],
  ['devimg-neon', 'Ada'],
];

const wallRowB = [
  ['adventurer', 'Rin'],
  ['devimg-bubbles', '赵六'],
  ['lorelei', 'Sora'],
  ['devimg-riso', 'Juno'],
  ['micah', 'Elio'],
  ['devimg-flower', '孙七'],
  ['shapes', 'Remy'],
  ['devimg-hash', 'Vega'],
  ['toon-head', 'Onyx'],
  ['devimg-bot', '周八'],
];

/** 轨道实际渲染的序列：重复多份，重复项命中缓存不产生额外请求 */
const wallTrackA = computed(() => Array.from({ length: WALL_COPIES }, () => wallRowA).flat());
const wallTrackB = computed(() => Array.from({ length: WALL_COPIES }, () => wallRowB).flat());

/** 画廊：全部为真实接口输出，caption 即可直接请求的路径 */
const gallery = [
  { path: '/scene/404?w=480&h=320', route: '/scene/404', label: '404 页' },
  { path: '/scene/empty?w=480&h=320', route: '/scene/empty', label: '空数据' },
  { path: '/scene/network?w=480&h=320', route: '/scene/network', label: '网络异常' },
  { path: '/scene/search?w=480&h=320', route: '/scene/search', label: '无搜索结果' },
  { path: '/skeleton/480/320?type=card', route: '/skeleton/:w/:h?type=card', label: '卡片骨架' },
  { path: '/skeleton/480/320?type=grid', route: '/skeleton/:w/:h?type=grid', label: '网格骨架' },
  { path: '/qr/demo/480/320', route: '/qr/:seed/:w/:h', label: '码形占位' },
  { path: '/photo/480/320?scene=product&seed=demo', route: '/photo/:w/:h?scene=', label: '真实照片' },
];

/** 工程规格：数值均取自线上限额与参数约束 */
const specs = [
  { value: '1000', unit: 'req/min', label: '默认限额（SVG / JSON）' },
  { value: '59', unit: '种风格', label: '头像风格总数' },
  { value: '0', unit: '', label: 'SDK 与 API Key' },
  { value: '10–4000', unit: 'px', label: '尺寸范围' },
];

/** 已开放路由，route 为真实路径模板 */
const routes = [
  { route: '/:w/:h', name: '占位图', desc: '色块、纹理、边框与文字', link: '/api/placeholder' },
  { route: '/seed/:seed/:w/:h', name: 'Seed 占位', desc: '相同 seed 固定配色，immutable', link: '/api/placeholder' },
  { route: '/avatar/:style/:seed/:size', name: '头像', desc: '中文首字与 59 种风格', link: '/api/avatar' },
  { route: '/scene/:variant', name: '场景占位', desc: '404、空数据、断网、搜索无结果', link: '/api/scene' },
  { route: '/skeleton/:w/:h', name: '骨架屏', desc: 'page、card、row、grid 四种布局', link: '/api/skeleton' },
  { route: '/photo/:w/:h', name: '真实照片', desc: '按用途或题材取图，可固定 seed', link: '/api/photo' },
  { route: '/qr/:seed/:size', name: '码形占位', desc: '伪 QR、伪条码，不可扫描', link: '/api/qr' },
  { route: '/mock/:resource', name: 'Mock 数据', desc: '用户、文章、商品，含分页与单条', link: '/api/mock' },
];

const notes = [
  {
    kicker: '范围',
    title: '开发期要用的占位集中在同一域名',
    desc: '色块与纹理占位、真实照片、多风格头像、骨架屏、空状态场景图、码形占位，以及中文 Mock JSON。不必为每一类各找一个第三方服务。',
  },
  {
    kicker: '输出',
    title: '默认 SVG，需要位图时再转码',
    desc: '占位、头像、场景与码形默认返回 image/svg+xml，缩放不失真。小程序等必须位图的场景，用 .webp / .png 后缀取栅格图。',
  },
  {
    kicker: '确定性',
    title: '同一条 URL 得到同一张图',
    desc: '占位、头像、照片、码形均支持 seed。相同参数返回相同画面，适合列表占位与 UI 回归对比，也能被 CDN 长期缓存。',
  },
  {
    kicker: '兼容',
    title: '沿用 picsum 与 placehold 的写法',
    desc: '支持 placehold 的 800x600 尺寸写法与路径配色，picsum 的 /seed、/id、/v2/list 路径，以及 JSONPlaceholder 风格的 Mock 前缀。改域名即可迁移。',
  },
];

const platformTabs = [
  { id: 'web', label: 'Web' },
  { id: 'mobile', label: 'H5' },
  { id: 'mini', label: '小程序' },
  { id: 'component', label: '组件库' },
];

const codeLangTabs = [
  { id: 'html', label: 'HTML' },
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
  { id: 'js', label: 'JS' },
];

const activeTab = ref('placeholder');
const activePlatform = ref('web');
const activeLang = ref('html');
const width = ref(800);
const height = ref(600);
const size = ref(128);
const copied = ref(false);
const codeCopied = ref(false);
let copyTimer: ReturnType<typeof setTimeout> | null = null;
let codeCopyTimer: ReturnType<typeof setTimeout> | null = null;

const currentTab = computed(
  () => demoTabs.find((t) => t.id === activeTab.value) ?? demoTabs[0],
);

/** tab 指示条位置，配合等宽 tab 实现滑动 */
const demoIndex = computed(() => demoTabs.findIndex((t) => t.id === activeTab.value));
const platformIndex = computed(() => platformTabs.findIndex((t) => t.id === activePlatform.value));
const langIndex = computed(() => codeLangTabs.findIndex((t) => t.id === activeLang.value));

/**
 * 将输入值收敛到接口允许的尺寸区间（10–4000）
 */
function clampSize(v: number, fallback: number): number {
  if (!Number.isFinite(v)) return fallback;
  return Math.min(4000, Math.max(10, Math.round(v)));
}

const currentPath = computed(() => {
  const tab = currentTab.value;
  return tab.param === 'size'
    ? tab.build(clampSize(size.value, 128), 0)
    : tab.build(clampSize(width.value, 800), clampSize(height.value, 600));
});

const displayUrl = computed(() => `${API_BASE}${currentPath.value}`);
const imgSrc = computed(() => encodeURI(displayUrl.value));

/**
 * 拼接头像 URL，路径中的中文标识需要转义
 */
function avatarSrc(style: string, seed: string, px = 72): string {
  return encodeURI(`${API_BASE}/avatar/${style}/${seed}/${px}`);
}

const codeExamples = computed(() => {
  const url = `${API_BASE}/800/600`;
  const avatar = `${API_BASE}/avatar/devimg/张三/64`;
  const map: Record<string, string> = {
    html: `<img src="${url}" alt="placeholder" width="800" height="600" />`,
    vue: `<template>\n  <img src="${url}" alt="placeholder" />\n</template>`,
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
    map.vue = `<Avatar name="张三" :size="64" />\n<!-- 缺省图 -->\n<img src="${avatar}" />`;
  }
  return map[activeLang.value] ?? map.html;
});

/**
 * 复制 Hero 请求台当前 URL
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
 * 复制多端接入代码示例
 */
async function copyCode(): Promise<void> {
  try {
    await navigator.clipboard.writeText(codeExamples.value);
    codeCopied.value = true;
    if (codeCopyTimer) clearTimeout(codeCopyTimer);
    codeCopyTimer = setTimeout(() => { codeCopied.value = false; }, 2000);
  } catch { /* noop */ }
}

onMounted(() => {
  document.querySelector('.vp-doc')?.classList.add('_devimg-home');
});
</script>

<template>
  <div ref="rootRef" class="devimg-home">
    <!-- Hero -->
    <section class="dh-hero">
      <div class="dh-dots" aria-hidden="true" />
      <div class="dh-hero-split">
        <div class="dh-hero-left" data-reveal>
          <a href="/" class="dh-hero-brand">
            <img
              src="/logo.png"
              alt="devimg"
              class="dh-hero-logo"
              width="40"
              height="40"
              loading="eager"
            />
            <span class="dh-hero-brand-name">devimg</span>
            <span class="dh-hero-brand-cn">图即</span>
          </a>

          <h1 class="dh-hero-title">
            缺张图，<br />写一条 <span class="dh-mark">URL</span> 就够了
          </h1>
          <p class="dh-hero-desc">
            图即（devimg）是国内开发者的占位图 CDN。占位图、头像、真实照片、骨架屏、场景图与
            Mock JSON 均按 URL 返回，把地址写进
            <code>img</code> 或 <code>fetch</code> 即可，无需 SDK、API Key 或注册。
          </p>

          <ul class="dh-hero-facts">
            <li>无需注册</li>
            <li>0 SDK</li>
            <li>image/svg+xml</li>
            <li>国内 CDN</li>
          </ul>

          <div class="dh-hero-actions">
            <a href="/guide/quick-start" class="dh-btn dh-btn-primary">快速开始</a>
            <a href="/api/placeholder" class="dh-btn dh-btn-ghost">API 文档</a>
          </div>
        </div>

        <!-- 请求台：参数 → 请求 → 响应头 → 图片 -->
        <div class="dh-demo" data-reveal>
          <div class="dh-demo-plate" aria-hidden="true" />
          <div class="dh-console">
            <div class="dh-tabs" :style="{ '--i': demoIndex, '--n': demoTabs.length }">
              <button
                v-for="tab in demoTabs"
                :key="tab.id"
                type="button"
                class="dh-tab"
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
              <span class="dh-tab-bar" aria-hidden="true" />
            </div>

            <div class="dh-console-params">
              <template v-if="currentTab.param === 'wh'">
                <label class="dh-field">
                  <span>width</span>
                  <input v-model.number="width" type="number" min="10" max="4000" step="10" />
                </label>
                <label class="dh-field">
                  <span>height</span>
                  <input v-model.number="height" type="number" min="10" max="4000" step="10" />
                </label>
              </template>
              <label v-else class="dh-field">
                <span>size</span>
                <input v-model.number="size" type="number" min="10" max="4000" step="8" />
              </label>
            </div>

            <div class="dh-term">
              <div class="dh-winbar">
                <span class="dh-light dh-light-r" aria-hidden="true" />
                <span class="dh-light dh-light-y" aria-hidden="true" />
                <span class="dh-light dh-light-g" aria-hidden="true" />
                <span class="dh-win-title">devimg — curl</span>
              </div>
              <div class="dh-term-body">
                <div class="dh-req">
                  <code>$ curl -i {{ displayUrl }}</code>
                  <button
                    type="button"
                    class="dh-copy"
                    :class="{ ok: copied }"
                    :aria-label="copied ? '已复制' : '复制 URL'"
                    @click="copyUrl"
                  >
                    <HomeIcon :name="copied ? 'icon-check' : 'icon-copy'" :size="15" />
                  </button>
                </div>
                <div class="dh-res">
                  <span class="dh-res-line">
                    <em>HTTP/1.1</em> <b class="dh-ok">200 OK</b>
                  </span>
                  <span class="dh-res-line"><em>content-type:</em> image/svg+xml; charset=utf-8</span>
                  <span class="dh-res-line"><em>cache-control:</em> {{ currentTab.cacheControl }}</span>
                </div>
              </div>
            </div>

            <div class="dh-console-preview">
              <Transition name="dh-swap" mode="out-in">
                <img :key="activeTab" :src="imgSrc" :alt="currentTab.label" />
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 头像墙：全部为 /avatar 实时输出 -->
    <section class="dh-wall">
      <div class="dh-wall-head">
        <h2>59 种头像风格，同一标识永远同一张脸</h2>
        <p>
          下面每一张都是
          <code>/avatar/:style/:seed/:size</code>
          的实时输出，不是贴图。
        </p>
      </div>

      <div class="dh-wall-rows">
        <div class="dh-wall-row">
          <div class="dh-wall-track">
            <img
              v-for="(a, i) in wallTrackA"
              :key="`a-${i}`"
              :src="avatarSrc(a[0], a[1])"
              :alt="a[0]"
              :title="`/avatar/${a[0]}/${a[1]}/72`"
              width="72"
              height="72"
            />
          </div>
        </div>
        <div class="dh-wall-row dh-wall-row-rev">
          <div class="dh-wall-track">
            <img
              v-for="(a, i) in wallTrackB"
              :key="`b-${i}`"
              :src="avatarSrc(a[0], a[1])"
              :alt="a[0]"
              :title="`/avatar/${a[0]}/${a[1]}/72`"
              width="72"
              height="72"
            />
          </div>
        </div>
      </div>

      <p class="dh-wall-more">
        <a href="/api/avatar">查看全部风格与参数 →</a>
      </p>
    </section>

    <!-- 工程规格 -->
    <section class="dh-specs">
      <dl class="dh-specs-inner">
        <div v-for="s in specs" :key="s.label" class="dh-spec" data-reveal>
          <dt>{{ s.value }}<i v-if="s.unit">{{ s.unit }}</i></dt>
          <dd>{{ s.label }}</dd>
        </div>
      </dl>
    </section>

    <!-- 路由表 -->
    <section class="dh-section">
      <div class="dh-section-head" data-reveal>
        <h2>已开放的路由</h2>
        <p>下列路径均可直接请求，参数与响应说明见各 API 文档。</p>
      </div>
      <ul class="dh-routes" data-reveal>
        <li v-for="r in routes" :key="r.route">
          <a :href="r.link">
            <code class="dh-route-path">{{ r.route }}</code>
            <span class="dh-route-name">{{ r.name }}</span>
            <span class="dh-route-desc">{{ r.desc }}</span>
            <span class="dh-route-go" aria-hidden="true">→</span>
          </a>
        </li>
      </ul>
      <p class="dh-section-more">
        <a href="/guide/dev-spec">查看完整参数与后期规划 →</a>
      </p>
    </section>

    <!-- 画廊 -->
    <section class="dh-section dh-section-alt">
      <div class="dh-section-head" data-reveal>
        <h2>不只有灰色方块</h2>
        <p>空状态、骨架屏、码形与真实照片都由同一套接口返回，每一张都能改参数。</p>
      </div>
      <div class="dh-gallery">
        <figure v-for="g in gallery" :key="g.path" data-reveal>
          <div class="dh-gallery-img">
            <img :src="`${API_BASE}${g.path}`" :alt="g.label" loading="lazy" />
          </div>
          <figcaption>
            <span>{{ g.label }}</span>
            <code>{{ g.route }}</code>
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- 多端接入 -->
    <section class="dh-section">
      <div class="dh-section-head" data-reveal>
        <h2>在页面与接口中引用</h2>
        <p>Web、H5、小程序与组件库都用同一条地址，不需要安装依赖。</p>
      </div>

      <div class="dh-usage" data-reveal>
        <div class="dh-mock-ui">
          <div class="dh-winbar">
            <span class="dh-light dh-light-r" aria-hidden="true" />
            <span class="dh-light dh-light-y" aria-hidden="true" />
            <span class="dh-light dh-light-g" aria-hidden="true" />
            <span class="dh-win-title">shop.example.com</span>
          </div>
          <div class="dh-mock-content">
            <div class="dh-mock-sidebar" />
            <div class="dh-mock-main">
              <div class="dh-mock-banner">
                <img :src="`${API_BASE}/800/200?text=Banner&bg=3b5bdb&fg=ffffff`" alt="" loading="lazy" />
              </div>
              <div class="dh-mock-grid">
                <div v-for="n in 6" :key="n" class="dh-mock-card">
                  <img :src="`${API_BASE}/seed/card-${n}/160/120`" alt="" loading="lazy" />
                  <div class="dh-mock-line" />
                  <div class="dh-mock-line short" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dh-code-panel">
          <div class="dh-winbar">
            <span class="dh-light dh-light-r" aria-hidden="true" />
            <span class="dh-light dh-light-y" aria-hidden="true" />
            <span class="dh-light dh-light-g" aria-hidden="true" />
            <span class="dh-win-title">devimg — 接入示例</span>
          </div>
          <div class="dh-tabs dh-tabs-dark" :style="{ '--i': platformIndex, '--n': platformTabs.length }">
            <button
              v-for="p in platformTabs"
              :key="p.id"
              type="button"
              class="dh-tab"
              :class="{ active: activePlatform === p.id }"
              @click="activePlatform = p.id"
            >
              {{ p.label }}
            </button>
            <span class="dh-tab-bar" aria-hidden="true" />
          </div>
          <div class="dh-code-langs">
            <button
              v-for="lang in codeLangTabs"
              :key="lang.id"
              type="button"
              class="dh-code-lang"
              :class="{ active: activeLang === lang.id }"
              @click="activeLang = lang.id"
            >
              {{ lang.label }}
            </button>
            <button type="button" class="dh-code-copy" :class="{ ok: codeCopied }" @click="copyCode">
              {{ codeCopied ? '已复制' : '复制' }}
            </button>
          </div>
          <div class="dh-code-body">
            <Transition name="dh-swap" mode="out-in">
              <pre :key="`${activePlatform}-${activeLang}`"><code>{{ codeExamples }}</code></pre>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- 说明 -->
    <section class="dh-section dh-section-tight">
      <div class="dh-notes">
        <div v-for="n in notes" :key="n.title" class="dh-note" data-reveal>
          <span class="dh-note-kicker">{{ n.kicker }}</span>
          <h3>{{ n.title }}</h3>
          <p>{{ n.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 结尾 -->
    <section class="dh-end">
      <div class="dh-dots" aria-hidden="true" />
      <div class="dh-end-inner" data-reveal>
        <h2>从一条 URL 开始</h2>
        <p>无需注册。把占位地址写进页面，或按迁移指南替换 picsum / placehold 域名。</p>
        <div class="dh-hero-actions">
          <a href="/guide/quick-start" class="dh-btn dh-btn-light">快速开始</a>
          <a href="/migrate/from-picsum" class="dh-btn dh-btn-outline">迁移指南</a>
        </div>
      </div>
    </section>

    <footer class="dh-footer">
      <div class="dh-footer-inner">
        <div class="dh-footer-brand">
          <a href="/" class="dh-footer-brand-link">
            <img src="/logo-nav.png" alt="devimg" class="dh-footer-logo-img" width="32" height="32" />
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
