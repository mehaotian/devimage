<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import LazyGalleryImg from './LazyGalleryImg.vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

interface CategoryMeta {
  slug: string;
  label: string;
  tier?: string;
  scenes: string[];
}

interface SceneOption {
  id: string;
  label: string;
}

interface PhotoPreset {
  label: string;
  mode: 'scene' | 'cat';
  scene?: string;
  cat?: string;
  random: boolean;
  seed: string;
  w?: number;
  h?: number;
}

interface CodeRecipe {
  title: string;
  path: string;
}

const SCENES: SceneOption[] = [
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
  { id: 'gallery', label: '通用' },
];

const TIER_LABELS: Record<string, string> = {
  'A-product': '商品',
  'B-food': '餐饮',
  'C-content': '内容',
  'D-travel': '出行',
  'E-vertical': '垂直',
  'F-decor': '装饰',
};

const TIER_ORDER = ['A-product', 'B-food', 'C-content', 'D-travel', 'E-vertical', 'F-decor'];

const PLAY_PRESETS: PhotoPreset[] = [
  {
    label: '商品主图',
    mode: 'scene',
    scene: 'product',
    random: false,
    seed: 'product-5',
    w: 400,
    h: 400,
  },
  {
    label: '资讯列表',
    mode: 'scene',
    scene: 'news',
    random: true,
    seed: '',
    w: 320,
    h: 200,
  },
  {
    label: '首页 Banner',
    mode: 'scene',
    scene: 'banner',
    random: false,
    seed: 'hero-1',
    w: 1200,
    h: 400,
  },
  {
    label: '美食专题',
    mode: 'cat',
    cat: '美食',
    random: false,
    seed: 'banner-1',
    w: 640,
    h: 480,
  },
];

const SIZE_PRESETS = [
  { label: '1:1', w: 400, h: 400 },
  { label: '4:3', w: 640, h: 480 },
  { label: '16:9', w: 640, h: 360 },
  { label: 'Banner', w: 1200, h: 400 },
] as const;

const CODE_RECIPES: CodeRecipe[] = [
  { title: '商品主图（固定）', path: '/photo/400/400?scene=product&seed=product-5' },
  { title: '资讯列表（随机）', path: '/photo/320/200?scene=news' },
  { title: '首页 Banner（固定）', path: '/photo/1200/400?scene=banner&seed=hero-1' },
  { title: '餐饮封面（固定）', path: '/photo/480/320?scene=food&seed=store-1' },
  { title: '美食题材（固定）', path: '/photo/640/480?cat=美食&seed=banner-1' },
  { title: '咖啡题材（随机）', path: '/photo/800/600?cat=咖啡' },
];

const MIN_SIZE = 10;
const MAX_SIZE = 4000;
const PREVIEW_MAX_W = 480;
const PREVIEW_MAX_H = 360;
const SIZE_DEBOUNCE_MS = 400;
const THUMB_W = 96;
const THUMB_H = 72;
const GALLERY_THUMB = 72;

type PlaygroundTab = 'play' | 'browse' | 'code';
type PickMode = 'scene' | 'cat';

const activeTab = ref<PlaygroundTab>('play');
const showMore = ref(false);
const showCatPicker = ref(false);
const useCat = ref(false);
const isRandom = ref(false);
const scene = ref('product');
const cat = ref('美食');
const seed = ref('product-5');
const width = ref(400);
const height = ref(400);
const debouncedW = ref(400);
const debouncedH = ref(400);
const grayscale = ref(false);
const blur = ref<number | ''>('');
const format = ref<'webp' | 'jpeg' | 'png'>('webp');
const randomNonce = ref(0);
const copied = ref(false);
const loading = ref(true);
const loadError = ref('');

let sizeTimer: ReturnType<typeof setTimeout> | null = null;

const categories = ref<CategoryMeta[]>([]);
const showBrowseCats = ref(false);

const pickMode = computed<PickMode>(() => (useCat.value ? 'cat' : 'scene'));

const effectiveSeed = computed(() => (isRandom.value ? '' : seed.value.trim()));

const effectiveBlur = computed(() => {
  const n = typeof blur.value === 'number' ? blur.value : Number.parseInt(String(blur.value), 10);
  if (!Number.isFinite(n) || n < 1) {
    return undefined;
  }
  return Math.min(10, Math.round(n));
});

/**
 * 当前生效的 URL 查询参数（与复制链接一致，不含预览专用 _）
 */
const activeQueryParams = computed(() => {
  const params = new URLSearchParams();
  if (pickMode.value === 'cat' && cat.value) {
    params.set('cat', cat.value);
  } else {
    params.set('scene', scene.value);
  }
  if (effectiveSeed.value) {
    params.set('seed', effectiveSeed.value);
  }
  if (grayscale.value) {
    params.set('grayscale', '1');
  }
  if (effectiveBlur.value !== undefined) {
    params.set('blur', String(effectiveBlur.value));
  }
  if (format.value !== 'webp') {
    params.set('format', format.value);
  }
  return params;
});

/**
 * 将尺寸 clamp 到 API 允许范围（10–4000）
 */
function clampSize(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_SIZE;
  }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(value)));
}

/**
 * 构建 /photo URL
 */
function buildPhotoUrl(
  opts: {
    w: number;
    h: number;
    mode: PickMode;
    scene?: string;
    cat?: string;
    seed?: string;
    grayscale?: boolean;
    blur?: number;
    format?: 'webp' | 'jpeg' | 'png';
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
  }
  if (opts.grayscale) {
    params.set('grayscale', '1');
  }
  if (opts.blur !== undefined && opts.blur >= 1) {
    params.set('blur', String(opts.blur));
  }
  if (opts.format && opts.format !== 'webp') {
    params.set('format', opts.format);
  }
  if (opts.cacheBust && !seedValue) {
    params.set('_', String(randomNonce.value || Date.now()));
  }
  const qs = params.toString();
  return qs
    ? `${API_BASE}/photo/${opts.w}/${opts.h}?${qs}`
    : `${API_BASE}/photo/${opts.w}/${opts.h}`;
}

/**
 * 组装 buildPhotoUrl 的公共选项
 */
function urlOpts(cacheBust = false): {
  w: number;
  h: number;
  mode: PickMode;
  scene: string;
  cat: string;
  seed: string;
  grayscale: boolean;
  blur: number | undefined;
  format: 'webp' | 'jpeg' | 'png';
  cacheBust: boolean;
} {
  return {
    w: debouncedW.value,
    h: debouncedH.value,
    mode: pickMode.value,
    scene: scene.value,
    cat: cat.value,
    seed: effectiveSeed.value,
    grayscale: grayscale.value,
    blur: effectiveBlur.value,
    format: format.value,
    cacheBust,
  };
}

/**
 * 将相对路径转为完整 API URL
 */
function toFullUrl(path: string): string {
  return `${API_BASE}${path}`;
}

const previewUrl = computed(() => buildPhotoUrl(urlOpts(isRandom.value)));

const apiUrl = computed(() => buildPhotoUrl(urlOpts(false)));

const relativeApiPath = computed(() => {
  const qs = activeQueryParams.value.toString();
  return qs
    ? `/photo/${debouncedW.value}/${debouncedH.value}?${qs}`
    : `/photo/${debouncedW.value}/${debouncedH.value}`;
});

const htmlSnippet = computed(
  () =>
    `<img src="${apiUrl.value}" alt="" width="${debouncedW.value}" height="${debouncedH.value}" />`,
);

/**
 * 预览区显示尺寸（等比缩放至面板内）
 */
const previewDisplaySize = computed(() => {
  const w = debouncedW.value;
  const h = debouncedH.value;
  const scale = Math.min(PREVIEW_MAX_W / w, PREVIEW_MAX_H / h, 1);
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
});

const activeScene = computed(() => SCENES.find((item) => item.id === scene.value));

const previewCaption = computed(() => {
  const sizeLabel = `${debouncedW.value}×${debouncedH.value}`;
  const modeLabel = isRandom.value ? '随机' : '固定';
  if (pickMode.value === 'cat') {
    return `${sizeLabel} · ${cat.value} · ${modeLabel}`;
  }
  return `${sizeLabel} · ${activeScene.value?.label ?? scene.value} · ${modeLabel}`;
});

/**
 * 预览区展示的 query 参数标签（与复制链接一致）
 */
const previewParamTags = computed(() =>
  [...activeQueryParams.value.entries()].map(([key, value]) => `${key}=${value}`),
);

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
 * 应用快捷预设
 */
function applyPlayPreset(preset: PhotoPreset): void {
  useCat.value = preset.mode === 'cat';
  showMore.value = false;
  showCatPicker.value = preset.mode === 'cat';
  isRandom.value = preset.random;
  if (preset.mode === 'scene' && preset.scene) {
    scene.value = preset.scene;
  }
  if (preset.mode === 'cat' && preset.cat) {
    cat.value = preset.cat;
  }
  seed.value = preset.seed || 'demo';
  if (preset.w !== undefined) {
    width.value = preset.w;
  }
  if (preset.h !== undefined) {
    height.value = preset.h;
  }
  randomNonce.value = Date.now();
  copied.value = false;
  activeTab.value = 'play';
}

/**
 * 应用常用宽高比
 */
function applySizePreset(w: number, h: number): void {
  width.value = w;
  height.value = h;
  copied.value = false;
}

/**
 * 从浏览区选中用途
 */
function selectSceneFromBrowse(slug: string): void {
  useCat.value = false;
  showMore.value = false;
  scene.value = slug;
  isRandom.value = false;
  seed.value = `${slug}-demo`;
  copied.value = false;
  activeTab.value = 'play';
}

/**
 * 构建题材缩略图 URL
 */
function buildCatThumbUrl(catSlug: string): string {
  return buildPhotoUrl({
    w: THUMB_W,
    h: THUMB_H,
    mode: 'cat',
    cat: catSlug,
    seed: `${catSlug}-demo`,
  });
}

/**
 * 从试玩区题材列表选中
 */
function selectCatFromPicker(slug: string): void {
  useCat.value = true;
  cat.value = slug;
  if (!isRandom.value) {
    seed.value = `${slug}-demo`;
  }
  copied.value = false;
}

/**
 * 从浏览区选中题材
 */
function selectCatFromBrowse(slug: string): void {
  selectCatFromPicker(slug);
  isRandom.value = false;
  seed.value = `${slug}-demo`;
  showCatPicker.value = false;
  activeTab.value = 'play';
}

/**
 * 切换随机模式并刷新预览
 */
function setRandomMode(random: boolean): void {
  isRandom.value = random;
  if (random) {
    shuffleRandom();
  } else if (!seed.value.trim()) {
    seed.value = 'demo';
  }
  copied.value = false;
}

/**
 * 随机模式下换一张预览图
 */
function shuffleRandom(): void {
  randomNonce.value = Date.now();
  copied.value = false;
}

/**
 * 拉取题材列表（更多选项用）
 */
async function fetchCategories(): Promise<void> {
  loading.value = true;
  loadError.value = '';
  try {
    const res = await fetch(`${API_BASE}/photo/categories`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('HTTP error');
    }
    const data = (await res.json()) as { categories: CategoryMeta[] };
    categories.value = data.categories ?? [];
    if (!categories.value.some((item) => item.slug === cat.value)) {
      cat.value = categories.value[0]?.slug ?? '美食';
    }
  } catch {
    loadError.value = '预览加载失败，请确认本地服务已启动';
  } finally {
    loading.value = false;
  }
}

watch([width, height], () => {
  if (sizeTimer) {
    clearTimeout(sizeTimer);
  }
  sizeTimer = setTimeout(() => {
    debouncedW.value = clampSize(width.value);
    debouncedH.value = clampSize(height.value);
  }, SIZE_DEBOUNCE_MS);
}, { immediate: true });

watch([useCat, scene, cat, seed, isRandom, grayscale, blur, format], () => {
  copied.value = false;
  if (isRandom.value) {
    shuffleRandom();
  }
});

watch(useCat, (catMode) => {
  if (!catMode) {
    showCatPicker.value = false;
  }
});

onMounted(() => {
  void fetchCategories();
});

onUnmounted(() => {
  if (sizeTimer) {
    clearTimeout(sizeTimer);
  }
});
</script>

<template>
  <div class="photo-playground">
    <div class="photo-playground__tabs" role="tablist" aria-label="真实照片试玩">
      <button
        type="button"
        role="tab"
        class="photo-playground__tab"
        :class="{ 'photo-playground__tab--active': activeTab === 'play' }"
        :aria-selected="activeTab === 'play'"
        @click="setPlaygroundTab('play')"
      >
        试玩
      </button>
      <button
        type="button"
        role="tab"
        class="photo-playground__tab"
        :class="{ 'photo-playground__tab--active': activeTab === 'browse' }"
        :aria-selected="activeTab === 'browse'"
        @click="setPlaygroundTab('browse')"
      >
        浏览
      </button>
      <button
        type="button"
        role="tab"
        class="photo-playground__tab"
        :class="{ 'photo-playground__tab--active': activeTab === 'code' }"
        :aria-selected="activeTab === 'code'"
        @click="setPlaygroundTab('code')"
      >
        复制代码
      </button>
    </div>

    <div v-show="activeTab === 'play'" class="photo-playground__pane" role="tabpanel">
      <div class="photo-playground__main">
        <div class="photo-playground__panel photo-playground__preview">
          <button
            type="button"
            class="photo-playground__image-btn"
            :title="copied ? '已复制' : '点击复制链接'"
            @click="copyText(apiUrl)"
          >
            <img
              :key="previewUrl"
              :src="previewUrl"
              :alt="previewCaption"
              :width="previewDisplaySize.w"
              :height="previewDisplaySize.h"
              class="photo-playground__image"
            />
            <span v-if="copied" class="photo-playground__copied">已复制</span>
          </button>
          <p class="photo-playground__preview-caption">{{ previewCaption }}</p>
          <div v-if="previewParamTags.length" class="photo-playground__param-tags" aria-label="当前 URL 参数">
            <code v-for="tag in previewParamTags" :key="tag" class="photo-playground__param-tag">{{ tag }}</code>
          </div>
          <code class="photo-playground__preview-path">{{ relativeApiPath }}</code>
        </div>

        <div class="photo-playground__panel photo-playground__controls">
          <div class="photo-playground__presets">
            <span class="photo-playground__label">快捷示例</span>
            <div class="photo-playground__presets-row">
              <button
                v-for="preset in PLAY_PRESETS"
                :key="preset.label"
                type="button"
                class="photo-playground__preset"
                @click="applyPlayPreset(preset)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <label class="photo-playground__field">
            <span class="photo-playground__label">宽 × 高</span>
            <div class="photo-playground__size-row">
              <input
                v-model.number="width"
                type="number"
                min="10"
                max="4000"
                class="photo-playground__input"
                aria-label="宽度"
              />
              <span class="photo-playground__size-sep">×</span>
              <input
                v-model.number="height"
                type="number"
                min="10"
                max="4000"
                class="photo-playground__input"
                aria-label="高度"
              />
            </div>
            <div class="photo-playground__presets-row photo-playground__presets-row--size">
              <button
                v-for="item in SIZE_PRESETS"
                :key="item.label"
                type="button"
                class="photo-playground__preset"
                @click="applySizePreset(item.w, item.h)"
              >
                {{ item.label }}
              </button>
            </div>
          </label>

          <div class="photo-playground__field">
            <span class="photo-playground__label">选图方式</span>
            <div class="photo-playground__pick-row">
              <div class="photo-playground__radio-row">
                <label class="photo-playground__radio">
                  <input
                    type="radio"
                    name="photo-pick-mode"
                    :checked="!isRandom"
                    @change="setRandomMode(false)"
                  />
                  固定这张
                </label>
                <label class="photo-playground__radio">
                  <input
                    type="radio"
                    name="photo-pick-mode"
                    :checked="isRandom"
                    @change="setRandomMode(true)"
                  />
                  每次随机
                </label>
              </div>
              <button
                v-if="isRandom"
                type="button"
                class="photo-playground__shuffle"
                title="换一张随机图"
                @click="shuffleRandom"
              >
                🎲 换一张
              </button>
            </div>
            <input
              v-if="!isRandom"
              v-model="seed"
              type="text"
              class="photo-playground__input"
              maxlength="64"
              placeholder="标识（同标识同一张图）"
            />
          </div>

          <template v-if="!useCat">
            <label class="photo-playground__field">
              <span class="photo-playground__label">用途</span>
              <div class="photo-playground__select-wrap">
                <select v-model="scene" class="photo-playground__select">
                  <option v-for="item in SCENES" :key="item.id" :value="item.id">
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </label>
          </template>
          <p v-else class="photo-playground__current-cat">
            当前题材：<strong>{{ cat }}</strong>
            <button type="button" class="photo-playground__link-btn" @click="useCat = false">
              改回按用途
            </button>
          </p>

          <div class="photo-playground__cat-picker-wrap">
            <button
              type="button"
              class="photo-playground__more-toggle"
              :aria-expanded="showCatPicker"
              @click="showCatPicker = !showCatPicker"
            >
              <span>
                具体题材（cat）
                <span v-if="categories.length" class="photo-playground__cat-count">{{ categories.length }} 项</span>
              </span>
              <span class="photo-playground__more-chevron">{{ showCatPicker ? '▾' : '▸' }}</span>
            </button>

            <div v-show="showCatPicker" class="photo-playground__cat-picker">
              <p v-if="loading" class="photo-playground__cat-picker-hint">加载题材列表…</p>
              <p v-else-if="!categories.length" class="photo-playground__cat-picker-hint">暂无题材数据</p>
              <div v-else class="photo-playground__cat-picker-scroll">
                <div
                  v-for="group in categoriesByTier"
                  :key="`picker-${group.id}`"
                  class="photo-playground__cat-picker-group"
                >
                  <h5 class="photo-playground__cat-picker-group-title">{{ group.title }}</h5>
                  <div class="photo-playground__gallery-grid">
                    <button
                      v-for="item in group.items"
                      :key="`picker-${item.slug}`"
                      type="button"
                      class="photo-playground__gallery-item"
                      :class="{ 'photo-playground__gallery-item--active': useCat && cat === item.slug }"
                      :title="item.slug"
                      @click="selectCatFromPicker(item.slug)"
                    >
                      <LazyGalleryImg
                        :src="buildCatThumbUrl(item.slug)"
                        :alt="item.slug"
                        :size="GALLERY_THUMB"
                      />
                      <span class="photo-playground__gallery-label">{{ item.slug }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="photo-playground__more-toggle"
            :aria-expanded="showMore"
            @click="showMore = !showMore"
          >
            {{ showMore ? '收起更多选项' : '更多选项' }}
            <span class="photo-playground__more-chevron">{{ showMore ? '▾' : '▸' }}</span>
          </button>

          <div v-show="showMore" class="photo-playground__more">
            <label class="photo-playground__field">
              <span class="photo-playground__label">输出格式 format</span>
              <div class="photo-playground__select-wrap">
                <select v-model="format" class="photo-playground__select">
                  <option value="webp">webp（默认）</option>
                  <option value="jpeg">jpeg</option>
                  <option value="png">png</option>
                </select>
              </div>
            </label>

            <label class="photo-playground__check">
              <input v-model="grayscale" type="checkbox" />
              灰度 grayscale=1
            </label>

            <label class="photo-playground__field">
              <span class="photo-playground__label">模糊 blur（1–10，留空关闭）</span>
              <input
                v-model.number="blur"
                type="number"
                min="1"
                max="10"
                class="photo-playground__input"
                placeholder="留空"
              />
            </label>
          </div>

          <p v-if="loadError" class="photo-playground__error">{{ loadError }}</p>
        </div>
      </div>

      <div class="photo-playground__url-bar">
        <code class="photo-playground__url-text">{{ apiUrl }}</code>
        <button type="button" class="photo-playground__copy" @click="copyText(apiUrl)">复制链接</button>
        <button type="button" class="photo-playground__copy" @click="copyText(htmlSnippet)">复制 HTML</button>
      </div>
    </div>

    <section
      v-if="activeTab === 'browse'"
      class="photo-playground__pane photo-playground__catalog"
      role="tabpanel"
    >
      <p class="photo-playground__catalog-desc">点击缩略图即可回到试玩区预览。</p>

      <h4 class="photo-playground__catalog-title">按用途</h4>
      <div class="photo-playground__gallery-grid">
        <button
          v-for="item in SCENES"
          :key="`scene-${item.id}`"
          type="button"
          class="photo-playground__gallery-item"
          :class="{ 'photo-playground__gallery-item--active': !useCat && scene === item.id }"
          @click="selectSceneFromBrowse(item.id)"
        >
          <LazyGalleryImg
            :src="buildPhotoUrl({ w: THUMB_W, h: THUMB_H, mode: 'scene', scene: item.id, seed: `${item.id}-demo` })"
            :alt="item.label"
            :size="GALLERY_THUMB"
          />
          <span class="photo-playground__gallery-label">{{ item.label }}</span>
        </button>
      </div>

      <button
        type="button"
        class="photo-playground__more-toggle photo-playground__browse-cat-toggle"
        :aria-expanded="showBrowseCats"
        @click="showBrowseCats = !showBrowseCats"
      >
        <span>
          按题材
          <span v-if="categories.length" class="photo-playground__cat-count">{{ categories.length }} 项</span>
        </span>
        <span class="photo-playground__more-chevron">{{ showBrowseCats ? '▾' : '▸' }}</span>
      </button>

      <div v-show="showBrowseCats">
        <p v-if="loading" class="photo-playground__catalog-desc">加载题材列表…</p>
        <div
          v-for="group in categoriesByTier"
          :key="group.id"
          class="photo-playground__cat-picker-group"
        >
          <h5 class="photo-playground__cat-picker-group-title">{{ group.title }}</h5>
          <div class="photo-playground__gallery-grid">
            <button
              v-for="item in group.items"
              :key="item.slug"
              type="button"
              class="photo-playground__gallery-item"
              :class="{ 'photo-playground__gallery-item--active': useCat && cat === item.slug }"
              @click="selectCatFromBrowse(item.slug)"
            >
              <LazyGalleryImg
                :src="buildCatThumbUrl(item.slug)"
                :alt="item.slug"
                :size="GALLERY_THUMB"
              />
              <span class="photo-playground__gallery-label">{{ item.slug }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <div v-show="activeTab === 'code'" class="photo-playground__pane photo-playground__panel photo-playground__refs" role="tabpanel">
      <div class="photo-playground__ref-block">
        <div class="photo-playground__ref-head">
          <span>当前链接</span>
          <button type="button" class="photo-playground__copy" @click="copyText(apiUrl)">复制</button>
        </div>
        <code class="photo-playground__code">{{ apiUrl }}</code>
      </div>

      <div class="photo-playground__ref-block">
        <div class="photo-playground__ref-head">
          <span>当前 HTML</span>
          <button type="button" class="photo-playground__copy" @click="copyText(htmlSnippet)">复制</button>
        </div>
        <code class="photo-playground__code">{{ htmlSnippet }}</code>
      </div>

      <div class="photo-playground__recipes">
        <h4 class="photo-playground__recipes-title">常用示例</h4>
        <div v-for="recipe in CODE_RECIPES" :key="recipe.path" class="photo-playground__recipe">
          <div class="photo-playground__recipe-head">
            <strong class="photo-playground__recipe-title">{{ recipe.title }}</strong>
            <button type="button" class="photo-playground__copy" @click="copyText(toFullUrl(recipe.path))">
              复制
            </button>
          </div>
          <code class="photo-playground__code">{{ toFullUrl(recipe.path) }}</code>
        </div>
      </div>
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
  max-width: 100%;
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

.photo-playground__param-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  width: 100%;
}

.photo-playground__param-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-text-2);
  font-size: 11px;
}

.photo-playground__preview-path {
  display: block;
  width: 100%;
  font-size: 11px;
  word-break: break-all;
  text-align: center;
  color: var(--vp-c-text-3);
}

.photo-playground__controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-playground__presets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo-playground__presets-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.photo-playground__presets-row--size {
  margin-top: 6px;
}

.photo-playground__preset {
  padding: 5px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 11px;
  cursor: pointer;
}

.photo-playground__preset:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
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

.photo-playground__pick-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.photo-playground__radio-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.photo-playground__shuffle {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  font-size: 12px;
  cursor: pointer;
}

.photo-playground__shuffle:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.photo-playground__check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.photo-playground__radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.photo-playground__current-cat {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.photo-playground__current-cat strong {
  color: var(--vp-c-text-1);
}

.photo-playground__cat-picker-wrap {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.photo-playground__cat-picker-wrap .photo-playground__more-toggle {
  padding: 10px 12px;
  border-radius: 0;
}

.photo-playground__cat-count {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.photo-playground__cat-picker {
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.photo-playground__cat-picker-hint {
  margin: 0;
  padding: 12px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.photo-playground__cat-picker-scroll {
  max-height: 320px;
  overflow-y: auto;
  padding: 10px 12px 12px;
}

.photo-playground__cat-picker-group + .photo-playground__cat-picker-group {
  margin-top: 14px;
}

.photo-playground__cat-picker-group-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.photo-playground__browse-cat-toggle {
  width: 100%;
  margin-top: 20px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.photo-playground__more-chevron {
  color: var(--vp-c-text-3);
}

.photo-playground__more {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.photo-playground__link-btn {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  cursor: pointer;
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

.photo-playground__size-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.photo-playground__size-row .photo-playground__input {
  flex: 1;
  min-width: 0;
}

.photo-playground__size-sep {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.photo-playground__select {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
}

.photo-playground__url-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.photo-playground__url-text {
  flex: 1;
  min-width: 200px;
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
  flex-shrink: 0;
}

.photo-playground__catalog {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
}

.photo-playground__catalog-desc {
  margin: 0 0 16px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.photo-playground__catalog-title {
  margin: 16px 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.photo-playground__catalog-title:first-of-type {
  margin-top: 0;
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

.photo-playground__more-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  text-align: left;
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
  align-items: center;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.photo-playground__recipes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.photo-playground__recipes-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.photo-playground__recipe {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.photo-playground__recipe-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.photo-playground__recipe-title {
  font-size: 13px;
  color: var(--vp-c-text-1);
}

.photo-playground__code {
  display: block;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 12px;
  word-break: break-all;
  white-space: pre-wrap;
}

.photo-playground__error {
  margin: 0;
  font-size: 12px;
  color: #ef4444;
}

@media (max-width: 768px) {
  .photo-playground__main {
    grid-template-columns: 1fr;
  }
}
</style>
