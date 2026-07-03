<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import LazyGalleryImg from './LazyGalleryImg.vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

interface CategoryMeta {
  slug: string;
  label: string;
  tier?: string;
  count: number;
  scenes: string[];
}

interface SceneMeta {
  slug: string;
  label: string;
  categories: string[];
  photo_count: number;
  mock_pool_count: number;
  mock_field?: string;
}

const SCENES = [
  { id: 'product', label: '商品' },
  { id: 'food', label: '餐饮' },
  { id: 'news', label: '新闻资讯' },
  { id: 'article', label: '文章博客' },
  { id: 'travel', label: '出行' },
  { id: 'hotel', label: '酒店民宿' },
  { id: 'banner', label: '首页轮播' },
  { id: 'social', label: '社交动态' },
  { id: 'education', label: '教育' },
  { id: 'health', label: '健康医疗' },
  { id: 'realestate', label: '房产家居' },
  { id: 'business', label: '商务金融' },
  { id: 'game', label: '游戏' },
  { id: 'promo', label: '促销活动' },
  { id: 'gallery', label: '图集混排' },
] as const;

const TIER_LABELS: Record<string, string> = {
  'A-product': 'A · 商品 Product',
  'B-food': 'B · 餐饮 Food',
  'C-content': 'C · 内容 Content',
  'D-travel': 'D · 出行 Travel',
  'E-vertical': 'E · 垂直 Vertical',
  'F-decor': 'F · 装饰 Decor',
};

const TIER_ORDER = ['A-product', 'B-food', 'C-content', 'D-travel', 'E-vertical', 'F-decor'];

const PREVIEW_W = 480;
const PREVIEW_H = 360;
const THUMB_W = 96;
const THUMB_H = 72;
const GALLERY_THUMB = 72;

type PlaygroundTab = 'play' | 'catalog' | 'code';
type PickMode = 'scene' | 'cat';

const activeTab = ref<PlaygroundTab>('play');
const pickMode = ref<PickMode>('scene');
const scene = ref<(typeof SCENES)[number]['id']>('product');
const cat = ref('美食');
const seed = ref('demo');
const randomNonce = ref(0);
const copied = ref(false);
const loading = ref(true);
const loadError = ref('');

const categories = ref<CategoryMeta[]>([]);
const scenesMeta = ref<SceneMeta[]>([]);

/**
 * 构建 /photo URL（与占位图相同 seed 语义）
 */
function buildPhotoUrl(
  opts: {
    w: number;
    h: number;
    mode: PickMode;
    scene?: string;
    cat?: string;
    seed?: string;
    cacheBust?: boolean;
  },
): string {
  const params = new URLSearchParams();
  if (opts.mode === 'cat' && opts.cat) {
    params.set('cat', opts.cat);
  } else {
    params.set('scene', opts.scene ?? 'product');
  }
  const seedValue = opts.seed?.trim();
  if (seedValue) {
    params.set('seed', seedValue);
  } else if (opts.cacheBust) {
    params.set('_', String(randomNonce.value || Date.now()));
  }
  return `${API_BASE}/photo/${opts.w}/${opts.h}?${params.toString()}`;
}

const previewUrl = computed(() =>
  buildPhotoUrl({
    w: PREVIEW_W,
    h: PREVIEW_H,
    mode: pickMode.value,
    scene: scene.value,
    cat: cat.value,
    seed: seed.value,
    cacheBust: !seed.value.trim(),
  }),
);

const apiUrl = computed(() =>
  buildPhotoUrl({
    w: 800,
    h: 600,
    mode: pickMode.value,
    scene: scene.value,
    cat: cat.value,
    seed: seed.value,
  }),
);

const htmlSnippet = computed(
  () => `<img src="${apiUrl.value}" alt="DevImage photo" width="800" height="600" />`,
);

const previewCaption = computed(() => {
  const seedLabel = seed.value.trim() || '随机';
  if (pickMode.value === 'cat') {
    return `cat ${cat.value} · seed ${seedLabel}`;
  }
  return `scene ${scene.value} · seed ${seedLabel}`;
});

const categoriesByTier = computed(() => {
  const map = new Map<string, CategoryMeta[]>();
  for (const item of categories.value) {
    const tier = item.tier ?? 'F-decor';
    const list = map.get(tier) ?? [];
    list.push(item);
    map.set(tier, list);
  }
  return TIER_ORDER.filter((tier) => map.has(tier)).map((tier) => ({
    id: `photo-tier-${tier}`,
    tier,
    title: TIER_LABELS[tier] ?? tier,
    items: (map.get(tier) ?? []).sort((a, b) => a.slug.localeCompare(b.slug, 'zh-CN')),
  }));
});

const catalogNavItems = computed(() => [
  { id: 'photo-scenes', label: `scene 场景 (${scenesMeta.value.length})` },
  ...categoriesByTier.value.map((group) => ({
    id: group.id,
    label: `${group.title} (${group.items.length})`,
  })),
]);

/**
 * 切换主 Tab
 */
function setPlaygroundTab(tab: PlaygroundTab): void {
  activeTab.value = tab;
  copied.value = false;
}

/**
 * 复制文本
 */
async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    window.setTimeout(() => { copied.value = false; }, 1600);
  } catch { /* ignore */ }
}

/**
 * 从目录选中分类
 */
function selectCatFromCatalog(slug: string): void {
  pickMode.value = 'cat';
  cat.value = slug;
  seed.value = `${slug}-demo`;
  copied.value = false;
  activeTab.value = 'play';
}

/**
 * 从目录选中 scene
 */
function selectSceneFromCatalog(slug: string): void {
  pickMode.value = 'scene';
  scene.value = slug as (typeof SCENES)[number]['id'];
  seed.value = `${slug}-demo`;
  copied.value = false;
  activeTab.value = 'play';
}

/**
 * 清空 seed，预览随机图
 */
function randomizePhoto(): void {
  seed.value = '';
  randomNonce.value = Date.now();
}

/**
 * 滚动到目录分组
 */
function scrollToCatalogSection(sectionId: string): void {
  if (activeTab.value !== 'catalog') {
    activeTab.value = 'catalog';
  }
  window.requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/**
 * 拉取分类与 scene 元数据
 */
async function fetchCatalog(): Promise<void> {
  loading.value = true;
  loadError.value = '';
  try {
    const [catRes, sceneRes] = await Promise.all([
      fetch(`${API_BASE}/photo/categories`, { cache: 'no-store' }),
      fetch(`${API_BASE}/photo/scenes`, { cache: 'no-store' }),
    ]);
    if (!catRes.ok || !sceneRes.ok) {
      throw new Error('HTTP error');
    }
    const catData = (await catRes.json()) as { categories: CategoryMeta[] };
    const sceneData = (await sceneRes.json()) as { scenes: SceneMeta[] };
    categories.value = catData.categories ?? [];
    scenesMeta.value = sceneData.scenes ?? [];
    if (!categories.value.some((item) => item.slug === cat.value)) {
      cat.value = categories.value[0]?.slug ?? '美食';
    }
  } catch (err) {
    loadError.value =
      err instanceof Error ? err.message : '无法加载目录，请确认 API 已启动且 COS 已配置';
  } finally {
    loading.value = false;
  }
}

watch([pickMode, scene, cat, seed], () => {
  copied.value = false;
});

onMounted(() => {
  void fetchCatalog();
});

onUnmounted(() => { /* noop */ });
</script>

<template>
  <div class="photo-playground">
    <div class="photo-playground__tabs" role="tablist" aria-label="真实图库试玩">
      <button
        type="button"
        role="tab"
        class="photo-playground__tab"
        :class="{ 'photo-playground__tab--active': activeTab === 'play' }"
        :aria-selected="activeTab === 'play'"
        @click="setPlaygroundTab('play')"
      >
        快速试玩
      </button>
      <button
        type="button"
        role="tab"
        class="photo-playground__tab"
        :class="{ 'photo-playground__tab--active': activeTab === 'catalog' }"
        :aria-selected="activeTab === 'catalog'"
        @click="setPlaygroundTab('catalog')"
      >
        目录
        <span class="photo-playground__tab-badge">{{ categories.length || 82 }}</span>
      </button>
      <button
        type="button"
        role="tab"
        class="photo-playground__tab"
        :class="{ 'photo-playground__tab--active': activeTab === 'code' }"
        :aria-selected="activeTab === 'code'"
        @click="setPlaygroundTab('code')"
      >
        代码参考
      </button>
    </div>

    <div v-show="activeTab === 'play'" class="photo-playground__pane" role="tabpanel">
      <div class="photo-playground__main">
        <div class="photo-playground__panel photo-playground__preview">
          <button
            type="button"
            class="photo-playground__image-btn"
            :title="copied ? '已复制链接' : '点击复制 URL'"
            @click="copyText(apiUrl)"
          >
            <img
              :key="previewUrl"
              :src="previewUrl"
              :alt="previewCaption"
              :width="PREVIEW_W"
              :height="PREVIEW_H"
              class="photo-playground__image"
            />
            <span v-if="copied" class="photo-playground__copied">已复制 URL</span>
          </button>
          <p class="photo-playground__preview-caption">{{ previewCaption }}</p>
        </div>

        <div class="photo-playground__panel photo-playground__controls">
          <label class="photo-playground__field">
            <span class="photo-playground__label">mode 选取方式</span>
            <div class="photo-playground__select-wrap">
              <select v-model="pickMode" class="photo-playground__select">
                <option value="scene">scene 业务场景（英文 slug）</option>
                <option value="cat">cat 中文分类</option>
              </select>
            </div>
          </label>

          <label class="photo-playground__field">
            <span class="photo-playground__label">seed（留空则随机）</span>
            <div class="photo-playground__seed-row">
              <input v-model="seed" type="text" class="photo-playground__input" maxlength="64" placeholder="demo" />
              <button type="button" class="photo-playground__dice" title="随机选图" @click="randomizePhoto">
                🎲
              </button>
            </div>
          </label>

          <label v-if="pickMode === 'scene'" class="photo-playground__field">
            <span class="photo-playground__label">scene 场景</span>
            <div class="photo-playground__select-wrap">
              <select v-model="scene" class="photo-playground__select">
                <option v-for="item in SCENES" :key="item.id" :value="item.id">
                  {{ item.id }} · {{ item.label }}
                </option>
              </select>
            </div>
          </label>

          <label v-if="pickMode === 'cat'" class="photo-playground__field">
            <span class="photo-playground__label">cat 分类（中文 slug）</span>
            <div class="photo-playground__select-wrap">
              <select v-model="cat" class="photo-playground__select" :disabled="loading">
                <option v-for="item in categories" :key="item.slug" :value="item.slug">
                  {{ item.slug }}（{{ item.count }}）
                </option>
              </select>
            </div>
          </label>

          <div class="photo-playground__quick-links">
            <button type="button" class="photo-playground__quick-link" @click="setPlaygroundTab('catalog')">
              浏览目录 →
            </button>
            <button type="button" class="photo-playground__quick-link" @click="setPlaygroundTab('code')">
              查看 API / HTML →
            </button>
          </div>

          <p v-if="loadError" class="photo-playground__error">{{ loadError }}</p>
        </div>
      </div>

      <div class="photo-playground__url-bar">
        <code class="photo-playground__url-text">{{ apiUrl }}</code>
        <button type="button" class="photo-playground__copy" @click="copyText(apiUrl)">复制 URL</button>
      </div>
    </div>

    <section
      v-if="activeTab === 'catalog'"
      class="photo-playground__pane photo-playground__catalog"
      role="tabpanel"
    >
      <div class="photo-playground__catalog-head">
        <p class="photo-playground__catalog-desc">
          共 {{ categories.length || 82 }} 个中文分类 · {{ scenesMeta.length || 15 }} 个英文 scene · 缩略图懒加载
        </p>
        <nav class="photo-playground__catalog-nav" aria-label="目录分组跳转">
          <button
            v-for="item in catalogNavItems"
            :key="item.id"
            type="button"
            class="photo-playground__catalog-nav-btn"
            @click="scrollToCatalogSection(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>
      </div>

      <div id="photo-scenes" class="photo-playground__catalog-group">
        <h4 class="photo-playground__catalog-group-title">scene 业务场景（英文 slug · 中文 label）</h4>
        <div class="photo-playground__scene-table-wrap">
          <table class="photo-playground__scene-table">
            <thead>
              <tr>
                <th>slug</th>
                <th>label</th>
                <th>photos</th>
                <th>Mock 字段</th>
                <th>预览</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in scenesMeta" :key="item.slug">
                <td><code>{{ item.slug }}</code></td>
                <td>{{ item.label }}</td>
                <td>{{ item.photo_count }}</td>
                <td>{{ item.mock_field ?? '—' }}</td>
                <td>
                  <button type="button" class="photo-playground__table-btn" @click="selectSceneFromCatalog(item.slug)">
                    试玩
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="photo-playground__gallery-grid">
          <button
            v-for="item in scenesMeta.slice(0, 15)"
            :key="`scene-${item.slug}`"
            type="button"
            class="photo-playground__gallery-item"
            :title="`${item.slug} · ${item.label}`"
            @click="selectSceneFromCatalog(item.slug)"
          >
            <LazyGalleryImg
              :src="buildPhotoUrl({ w: THUMB_W, h: THUMB_H, mode: 'scene', scene: item.slug, seed: `${item.slug}-demo` })"
              :alt="item.slug"
              :size="GALLERY_THUMB"
            />
            <span class="photo-playground__gallery-label">{{ item.slug }}</span>
          </button>
        </div>
      </div>

      <div
        v-for="group in categoriesByTier"
        :id="group.id"
        :key="group.id"
        class="photo-playground__catalog-group"
      >
        <h4 class="photo-playground__catalog-group-title">{{ group.title }}</h4>
        <div class="photo-playground__gallery-grid">
          <button
            v-for="item in group.items"
            :key="item.slug"
            type="button"
            class="photo-playground__gallery-item"
            :class="{ 'photo-playground__gallery-item--active': pickMode === 'cat' && cat === item.slug }"
            :title="`${item.slug} · ${item.count} 张`"
            @click="selectCatFromCatalog(item.slug)"
          >
            <LazyGalleryImg
              :src="buildPhotoUrl({ w: THUMB_W, h: THUMB_H, mode: 'cat', cat: item.slug, seed: `${item.slug}-demo` })"
              :alt="item.slug"
              :size="GALLERY_THUMB"
            />
            <span class="photo-playground__gallery-label">{{ item.slug }}</span>
          </button>
        </div>
      </div>
    </section>

    <div v-show="activeTab === 'code'" class="photo-playground__pane photo-playground__panel photo-playground__refs" role="tabpanel">
      <div class="photo-playground__ref-block">
        <div class="photo-playground__ref-head">
          <span>HTTP API</span>
          <button type="button" class="photo-playground__copy" @click="copyText(apiUrl)">复制</button>
        </div>
        <code class="photo-playground__code">{{ apiUrl }}</code>
      </div>

      <div class="photo-playground__ref-block">
        <div class="photo-playground__ref-head">
          <span>HTML</span>
          <button type="button" class="photo-playground__copy" @click="copyText(htmlSnippet)">复制</button>
        </div>
        <code class="photo-playground__code">{{ htmlSnippet }}</code>
      </div>

      <p class="photo-playground__hint">
        本地预览：根目录 <code>pnpm dev</code>；有 <code>seed</code> 时同 URL 永远同图，无 seed 时每次随机。
        picsum 迁移仍可用 <code>/id/:id/:w/:h</code>（目录专用，非占位语义）。
      </p>
    </div>
  </div>
</template>

<style scoped>
.photo-playground {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
}

.photo-playground__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.photo-playground__tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.photo-playground__tab--active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.photo-playground__tab-badge {
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 600;
}

.photo-playground__main {
  display: grid;
  grid-template-columns: minmax(240px, 320px) 1fr;
  gap: 20px;
  align-items: start;
}

.photo-playground__panel {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
}

.photo-playground__preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.photo-playground__image-btn {
  position: relative;
  display: flex;
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  cursor: pointer;
}

.photo-playground__image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.photo-playground__copied {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  color: #fff;
  font-size: 12px;
}

.photo-playground__preview-caption {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-align: center;
}

.photo-playground__controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-playground__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.photo-playground__label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.photo-playground__select-wrap {
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.photo-playground__input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
}

.photo-playground__seed-row {
  display: flex;
  gap: 8px;
}

.photo-playground__dice {
  width: 42px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-size: 18px;
}

.photo-playground__select {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
}

.photo-playground__quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.photo-playground__quick-link {
  padding: 6px 12px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  cursor: pointer;
}

.photo-playground__url-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.photo-playground__url-text {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  word-break: break-all;
  color: var(--vp-c-text-2);
}

.photo-playground__copy {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  font-size: 12px;
  cursor: pointer;
}

.photo-playground__catalog {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
}

.photo-playground__catalog-desc {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.photo-playground__catalog-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.photo-playground__catalog-nav-btn {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  font-size: 12px;
  cursor: pointer;
}

.photo-playground__catalog-group {
  margin-top: 20px;
  scroll-margin-top: 72px;
}

.photo-playground__catalog-group-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.photo-playground__scene-table-wrap {
  overflow-x: auto;
  margin-bottom: 12px;
}

.photo-playground__scene-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.photo-playground__scene-table th,
.photo-playground__scene-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
}

.photo-playground__table-btn {
  padding: 2px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 11px;
  cursor: pointer;
}

.photo-playground__gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 10px;
}

.photo-playground__gallery-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  cursor: pointer;
}

.photo-playground__gallery-item--active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--vp-c-brand-1) 25%, transparent);
}

.photo-playground__gallery-label {
  font-size: 10px;
  line-height: 1.2;
  text-align: center;
  color: var(--vp-c-text-2);
  word-break: break-all;
}

.photo-playground__refs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.photo-playground__ref-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo-playground__ref-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.photo-playground__code {
  display: block;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 12px;
  word-break: break-all;
  white-space: pre-wrap;
}

.photo-playground__hint,
.photo-playground__error {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.photo-playground__error {
  color: #ef4444;
}

@media (max-width: 768px) {
  .photo-playground__main {
    grid-template-columns: 1fr;
  }

  .photo-playground__url-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
