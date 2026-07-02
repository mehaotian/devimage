<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import LazyGalleryImg from './LazyGalleryImg.vue';
import {
  EXPECTED_PATTERN_COUNT,
  PATTERN_CATALOG,
  mergePatternCatalog,
  toPatternGroupOptions,
  type PatternGroupOption,
} from '../data/pattern-catalog';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

interface StyleMeta {
  id: string;
  title: string;
  group: string;
  engine: string;
  license: string;
  provider?: string;
  attribution?: string;
  aliasOf?: string;
  queryParams?: string[];
}

const DEVIMG_FAMILY = new Set([
  'devimg',
  'devimg-gradient',
  'devimg-mesh',
  'devimg-initials',
  'devimg-pattern',
]);

const DEFAULT_STYLE = 'devimg';
const DEFAULT_SEED = '张三';
const PREVIEW_SIZE = 240;
const STYLE_GALLERY_SIZE = 72;
const PATTERN_GALLERY_SIZE = 64;
const SEED_DEBOUNCE_MS = 400;

const DEVIMG_CORE_IDS = ['devimg', 'devimg-geo', 'devimg-pattern'];

/** 已从 catalog 移除的风格（过滤浏览器缓存的旧 /avatar/styles 响应） */
const REMOVED_STYLE_IDS = new Set(['devimg-planet', 'devimg-zodiac']);

const GROUP_LABELS: Record<string, string> = {
  gradient: '渐变',
  geometric: '几何',
  text: '文字',
  pixel: '像素',
  character: '角色',
  icon: '图标',
  abstract: '抽象',
  retro: '复古',
  symbol: '符号',
  filter: '滤镜',
};

const DEVIMG_ALGO_GROUP_ORDER = ['abstract', 'geometric', 'text', 'retro', 'filter', 'symbol'];
const DICEBEAR_GROUP_ORDER = ['geometric', 'pixel', 'text', 'icon', 'character'];

const styles = ref<StyleMeta[]>([]);
const selectedStyle = ref(DEFAULT_STYLE);
const seed = ref(DEFAULT_SEED);
/** 防抖后的 seed，避免输入时每个字符都请求 API */
const debouncedSeed = ref(DEFAULT_SEED);
const bgColor = ref('');
const fgColor = ref('');
const variant = ref<'gradient' | 'mesh' | 'pattern'>('gradient');
const patternId = ref('');
const showText = ref(true);
const avatarShape = ref<'circle' | 'square'>('circle');
const copied = ref(false);
const loading = ref(true);
const loadError = ref('');
const patternGroups = ref<PatternGroupOption[]>(toPatternGroupOptions(PATTERN_CATALOG));
const patternCatalogStale = ref(false);

type PlaygroundTab = 'play' | 'gallery' | 'code';
const activeTab = ref<PlaygroundTab>('play');
const patternsExpanded = ref(false);

let seedTimer: ReturnType<typeof setTimeout> | null = null;

const providerLabels: Record<string, string> = {
  devimage: '图即风格',
  dicebear: 'DiceBear',
  jdenticon: 'Jdenticon',
  minidenticons: 'Minidenticons',
};

/**
 * 规范化 hex 输入（去掉 #，仅保留 6 位）
 */
function normalizeHex(value: string): string {
  return value.replace(/^#/, '').trim().slice(0, 6);
}

/**
 * 转为 color input 所需的 #rrggbb 格式
 */
function toColorPickerValue(hex: string, fallback: string): string {
  const normalized = normalizeHex(hex);
  const value = normalized.length === 6 ? normalized : fallback;
  return `#${value}`;
}

/**
 * 构建多风格头像 URL（含 devimg query）
 */
function buildAvatarUrl(
  style: string,
  seedValue: string,
  size = PREVIEW_SIZE,
  query?: {
    variant?: string;
    text?: boolean;
    shape?: 'circle' | 'square';
    bg?: string;
    fg?: string;
    pattern?: string;
  },
): string {
  const base = `${API_BASE}/avatar/${encodeURIComponent(style)}/${encodeURIComponent(seedValue)}/${size}`;
  const params = new URLSearchParams();

  if (DEVIMG_FAMILY.has(style)) {
    const variantValue = query?.variant ?? 'gradient';
    const textValue = query?.text ?? true;
    if (style === 'devimg') {
      params.set('variant', variantValue);
      params.set('text', textValue ? '1' : '0');
    } else if (style === 'devimg-mesh' && variantValue !== 'mesh') {
      params.set('variant', variantValue);
    } else if (style === 'devimg-gradient' && variantValue !== 'gradient') {
      params.set('variant', variantValue);
    } else if (style === 'devimg-pattern') {
      // devimg-pattern 固定纹理，无需 variant query
    } else if (style !== 'devimg-gradient' && style !== 'devimg-mesh') {
      if (variantValue !== 'gradient') {
        params.set('variant', variantValue);
      }
    }
    const defaultText =
      style === 'devimg-gradient' || style === 'devimg-mesh' || style === 'devimg-pattern'
        ? false
        : true;
    if (textValue !== defaultText) {
      params.set('text', textValue ? '1' : '0');
    }
    const shapeValue = query?.shape ?? 'circle';
    if (shapeValue === 'square') {
      params.set('shape', 'square');
    }
    const patternValue = query?.pattern?.trim() ?? '';
    if (patternValue) {
      params.set('pattern', patternValue);
    }
  }

  const bg = normalizeHex(query?.bg ?? '');
  const fg = normalizeHex(query?.fg ?? '');
  const skipBg =
    style === 'devimg-pattern' || (style === 'devimg' && (query?.variant ?? 'gradient') === 'pattern');
  if (bg.length === 6 && !skipBg) {
    params.set('bg', bg);
  }
  if (fg.length === 6) {
    params.set('fg', fg);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

const effectiveSeed = computed(() => debouncedSeed.value.trim() || DEFAULT_SEED);

const activeStyleMeta = computed(() =>
  styles.value.find((item) => item.id === selectedStyle.value),
);

const isDevimgFamily = computed(() => DEVIMG_FAMILY.has(selectedStyle.value));

const supportsColorQuery = computed(
  () =>
    isDevimgFamily.value ||
    activeStyleMeta.value?.queryParams?.some((item) => item === 'bg' || item === 'fg'),
);

const isPatternMode = computed(
  () => selectedStyle.value === 'devimg-pattern' || variant.value === 'pattern',
);

const showVariantPicker = computed(
  () => isDevimgFamily.value && selectedStyle.value !== 'devimg-pattern',
);

const showPatternPicker = computed(() => isDevimgFamily.value && isPatternMode.value);

const showBgControl = computed(() => isDevimgFamily.value && !isPatternMode.value);

const showFgControl = computed(() => isDevimgFamily.value && showText.value);

const showColorSection = computed(() => showBgControl.value || showFgControl.value);

const devimgQuery = computed(() => ({
  variant: variant.value,
  text: showText.value,
  shape: avatarShape.value,
  bg: isPatternMode.value ? '' : bgColor.value,
  fg: fgColor.value,
  pattern: patternId.value,
}));

const previewUrl = computed(() =>
  buildAvatarUrl(selectedStyle.value, effectiveSeed.value, PREVIEW_SIZE, devimgQuery.value),
);

const apiUrl = computed(() =>
  buildAvatarUrl(selectedStyle.value, effectiveSeed.value, 128, devimgQuery.value),
);

const htmlSnippet = computed(
  () =>
    `<img src="${apiUrl.value}" alt="${effectiveSeed.value} avatar" width="128" height="128" />`,
);

const groupedByProvider = computed(() => {
  const map = new Map<string, StyleMeta[]>();
  for (const item of styles.value) {
    if (item.provider === 'devimage' && item.aliasOf) {
      continue;
    }
    const key = item.provider ?? item.engine;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
});

/**
 * 构建风格画廊缩略图 URL
 */
function buildStyleThumbUrl(styleId: string, seedValue: string): string {
  if (styleId === 'devimg-pattern') {
    return buildAvatarUrl(styleId, seedValue, STYLE_GALLERY_SIZE, {
      variant: 'pattern',
      text: false,
      shape: avatarShape.value,
    });
  }
  if (DEVIMG_FAMILY.has(styleId)) {
    if (styleId === 'devimg-geo') {
      return buildAvatarUrl(styleId, seedValue, STYLE_GALLERY_SIZE);
    }
    return buildAvatarUrl('devimg', seedValue, STYLE_GALLERY_SIZE, {
      variant: 'gradient',
      text: true,
      shape: avatarShape.value,
    });
  }
  return buildAvatarUrl(styleId, seedValue, STYLE_GALLERY_SIZE);
}

/**
 * 构建纹理画廊缩略图 URL（每个 pattern 独立 seed，展示配色差异）
 */
function buildPatternThumbUrl(seedValue: string, pattern: string, shape: 'circle' | 'square'): string {
  const gallerySeed = `${seedValue}:${pattern}`;
  return buildAvatarUrl('devimg-pattern', gallerySeed, PATTERN_GALLERY_SIZE, {
    variant: 'pattern',
    text: false,
    shape,
    pattern,
  });
}

/**
 * 切换 Playground 主 Tab
 */
function setPlaygroundTab(tab: PlaygroundTab): void {
  activeTab.value = tab;
  copied.value = false;
}

/**
 * 从画廊选中某个 style
 */
function selectStyleFromGallery(styleId: string): void {
  selectedStyle.value = styleId;
  syncDevimgControls(styleId);
  copied.value = false;
  activeTab.value = 'play';
}

/**
 * 从画廊选中某个 pattern
 */
function selectPatternFromGallery(id: string): void {
  selectedStyle.value = 'devimg-pattern';
  variant.value = 'pattern';
  patternId.value = id;
  showText.value = false;
  bgColor.value = '';
  copied.value = false;
  activeTab.value = 'play';
}

/**
 * 切换 style 时同步 devimg 控件默认值
 */
function syncDevimgControls(styleId: string): void {
  switch (styleId) {
    case 'devimg-gradient':
      variant.value = 'gradient';
      showText.value = false;
      break;
    case 'devimg-mesh':
      variant.value = 'mesh';
      showText.value = false;
      break;
    case 'devimg-pattern':
      variant.value = 'pattern';
      showText.value = false;
      patternId.value = '';
      bgColor.value = '';
      break;
    case 'devimg-initials':
      variant.value = 'gradient';
      showText.value = true;
      break;
    case 'devimg':
      variant.value = 'gradient';
      showText.value = true;
      break;
    default:
      break;
  }
}

/**
 * 随机 seed（类似 DiceBear 骰子按钮）
 */
function randomizeSeed(): void {
  const pool = ['Luna', 'Felix', 'Aneka', 'Milo', '张三', 'DevImage', '图即'];
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? 'Luna';
  seed.value = `${pick}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * 应用预设品牌色
 */
function applyPreset(bg: string, fg: string): void {
  bgColor.value = bg;
  fgColor.value = fg;
}

/**
 * 清除自定义配色，回到 seed 默认色
 */
function clearColors(): void {
  bgColor.value = '';
  fgColor.value = '';
}

/**
 * 复制文本到剪贴板
 */
async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    /* ignore */
  }
}

/**
 * 点击预览图复制固定 seed 链接
 */
function copyPreviewLink(): void {
  void copyText(apiUrl.value);
}

const patternCount = computed(() =>
  patternGroups.value.reduce((total, group) => total + group.options.length, 0),
);

const galleryStyleCount = computed(() => styles.value.filter((item) => !item.aliasOf).length);

const galleryTotalCount = computed(() => galleryStyleCount.value + patternCount.value);

const devimgCoreStyles = computed(() =>
  DEVIMG_CORE_IDS.map((id) => styles.value.find((item) => item.id === id)).filter(
    (item): item is StyleMeta => Boolean(item),
  ),
);

const devimgAlgoGroups = computed(() => {
  const algo = styles.value.filter(
    (item) =>
      item.provider === 'devimage' &&
      !item.aliasOf &&
      !DEVIMG_CORE_IDS.includes(item.id),
  );
  const byGroup = new Map<string, StyleMeta[]>();
  for (const item of algo) {
    const list = byGroup.get(item.group) ?? [];
    list.push(item);
    byGroup.set(item.group, list);
  }
  return DEVIMG_ALGO_GROUP_ORDER.filter((groupId) => byGroup.has(groupId)).map((groupId) => ({
    id: `devimg-${groupId}`,
    title: `图即 · ${GROUP_LABELS[groupId] ?? groupId}`,
    items: byGroup.get(groupId) ?? [],
  }));
});

const partnerGallerySections = computed(() => {
  const sections: { id: string; title: string; items: StyleMeta[] }[] = [];
  const dicebearItems = styles.value.filter((item) => item.provider === 'dicebear' && !item.aliasOf);
  const byGroup = new Map<string, StyleMeta[]>();
  for (const item of dicebearItems) {
    const list = byGroup.get(item.group) ?? [];
    list.push(item);
    byGroup.set(item.group, list);
  }
  for (const groupId of DICEBEAR_GROUP_ORDER) {
    const items = byGroup.get(groupId);
    if (items?.length) {
      sections.push({
        id: `dicebear-${groupId}`,
        title: `DiceBear · ${GROUP_LABELS[groupId] ?? groupId}`,
        items,
      });
    }
  }
  for (const provider of ['jdenticon', 'minidenticons'] as const) {
    const items = styles.value.filter((item) => item.provider === provider && !item.aliasOf);
    if (items.length) {
      sections.push({
        id: provider,
        title: providerLabels[provider] ?? provider,
        items,
      });
    }
  }
  return sections;
});

const galleryNavItems = computed(() => {
  const items: { id: string; label: string }[] = [
    { id: 'gallery-devimg-core', label: '图即 · 基础' },
    ...devimgAlgoGroups.value.map((group) => ({ id: group.id, label: group.title })),
    ...partnerGallerySections.value.map((section) => ({ id: section.id, label: section.title })),
    { id: 'gallery-patterns', label: `纹理 pattern (${patternCount.value})` },
  ];
  if (patternGroups.value.length) {
    for (const group of patternGroups.value) {
      items.push({ id: `pattern-group-${group.id}`, label: group.title });
    }
  }
  return items;
});

/**
 * 滚动到画廊指定分组（需先切到画廊 Tab）
 */
function scrollToGallerySection(sectionId: string): void {
  if (sectionId === 'gallery-patterns' && !patternsExpanded.value) {
    patternsExpanded.value = true;
  }
  if (activeTab.value !== 'gallery') {
    activeTab.value = 'gallery';
  }
  window.requestAnimationFrame(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/**
 * 从 API 拉取 pattern 目录（禁用浏览器缓存，并与静态目录合并）
 */
async function fetchPatternCatalog(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/avatar/patterns`, { cache: 'no-store' });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as {
      count?: number;
      groups: { id?: string; title: string; patterns: { id: string; title: string }[] }[];
    };
    if (!data.groups?.length) {
      return;
    }
    patternGroups.value = mergePatternCatalog(data.groups);
    patternCatalogStale.value =
      (data.count ?? data.groups.reduce((n, g) => n + g.patterns.length, 0)) < EXPECTED_PATTERN_COUNT;
  } catch {
    /* 保留静态目录 */
  }
}

/**
 * 从 API 拉取风格列表
 */
async function fetchStyles(): Promise<void> {
  loading.value = true;
  loadError.value = '';
  try {
    const res = await fetch(`${API_BASE}/avatar/styles`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as { styles: StyleMeta[] };
    styles.value = (data.styles ?? []).filter((item) => !REMOVED_STYLE_IDS.has(item.id));
    if (!styles.value.some((item) => item.id === selectedStyle.value)) {
      selectedStyle.value = styles.value[0]?.id ?? DEFAULT_STYLE;
    }
  } catch (err) {
    loadError.value =
      err instanceof Error ? err.message : '无法加载风格列表，请确认 API 已启动';
    styles.value = [
      {
        id: 'devimg',
        title: '图即头像',
        group: 'gradient',
        engine: 'native',
        license: 'DevImage',
        provider: 'devimage',
        queryParams: ['variant', 'text', 'shape', 'bg', 'fg'],
      },
    ];
  } finally {
    loading.value = false;
  }
}

watch(seed, (value) => {
  if (seedTimer) {
    clearTimeout(seedTimer);
  }
  seedTimer = setTimeout(() => {
    debouncedSeed.value = value;
  }, SEED_DEBOUNCE_MS);
});

watch(selectedStyle, (styleId) => {
  copied.value = false;
  syncDevimgControls(styleId);
  if (!supportsColorQuery.value) {
    clearColors();
  }
});

watch(variant, (value) => {
  if (value === 'pattern') {
    bgColor.value = '';
  }
});

onMounted(() => {
  debouncedSeed.value = seed.value.trim() || DEFAULT_SEED;
  syncDevimgControls(selectedStyle.value);
  void fetchPatternCatalog();
  void fetchStyles();
});

onUnmounted(() => {
  if (seedTimer) {
    clearTimeout(seedTimer);
  }
});
</script>

<template>
  <div class="avatar-playground">
    <div class="avatar-playground__tabs" role="tablist" aria-label="头像试玩">
      <button
        type="button"
        role="tab"
        class="avatar-playground__tab"
        :class="{ 'avatar-playground__tab--active': activeTab === 'play' }"
        :aria-selected="activeTab === 'play'"
        @click="setPlaygroundTab('play')"
      >
        快速试玩
      </button>
      <button
        type="button"
        role="tab"
        class="avatar-playground__tab"
        :class="{ 'avatar-playground__tab--active': activeTab === 'gallery' }"
        :aria-selected="activeTab === 'gallery'"
        @click="setPlaygroundTab('gallery')"
      >
        画廊
        <span class="avatar-playground__tab-badge">{{ galleryTotalCount }}</span>
      </button>
      <button
        type="button"
        role="tab"
        class="avatar-playground__tab"
        :class="{ 'avatar-playground__tab--active': activeTab === 'code' }"
        :aria-selected="activeTab === 'code'"
        @click="setPlaygroundTab('code')"
      >
        代码参考
      </button>
    </div>

    <div v-show="activeTab === 'play'" class="avatar-playground__pane" role="tabpanel">
      <div class="avatar-playground__main">
        <div class="avatar-playground__panel avatar-playground__preview">
          <button
            type="button"
            class="avatar-playground__image-btn"
            :title="copied ? '已复制链接' : '点击复制固定 seed 链接'"
            @click="copyPreviewLink"
          >
            <img
              :src="previewUrl"
              :alt="`${selectedStyle} · ${effectiveSeed}`"
              width="240"
              height="240"
              class="avatar-playground__image"
            />
            <span v-if="copied" class="avatar-playground__copied">已复制 URL</span>
          </button>
          <p class="avatar-playground__preview-caption">
            {{ selectedStyle }} · {{ effectiveSeed }}
          </p>
        </div>

        <div class="avatar-playground__panel avatar-playground__controls">
          <label class="avatar-playground__field">
            <span class="avatar-playground__label">风格</span>
            <div class="avatar-playground__select-wrap">
              <select
                v-model="selectedStyle"
                class="avatar-playground__select"
                :disabled="loading"
              >
                <optgroup
                  v-for="[provider, items] in groupedByProvider"
                  :key="provider"
                  :label="providerLabels[provider] ?? provider"
                >
                  <option v-for="item in items" :key="item.id" :value="item.id">
                    {{ item.title }}
                  </option>
                </optgroup>
              </select>
            </div>
          </label>

          <label class="avatar-playground__field">
            <span class="avatar-playground__label">Seed</span>
            <div class="avatar-playground__seed-row">
              <input v-model="seed" type="text" class="avatar-playground__input" maxlength="64" />
              <button type="button" class="avatar-playground__dice" title="随机 seed" @click="randomizeSeed">
                🎲
              </button>
            </div>
          </label>

          <div v-if="isDevimgFamily" class="avatar-playground__devimg">
            <label class="avatar-playground__field">
              <span class="avatar-playground__label">shape 形状</span>
              <div class="avatar-playground__select-wrap">
                <select v-model="avatarShape" class="avatar-playground__select">
                  <option value="circle">circle 圆形</option>
                  <option value="square">square 方形</option>
                </select>
              </div>
            </label>

            <label v-if="showVariantPicker" class="avatar-playground__field">
              <span class="avatar-playground__label">variant 背景</span>
              <div class="avatar-playground__select-wrap">
                <select v-model="variant" class="avatar-playground__select">
                  <option value="gradient">gradient 渐变圆</option>
                  <option value="mesh">mesh 网格渐变</option>
                  <option value="pattern">pattern 纹理</option>
                </select>
              </div>
            </label>

            <label v-if="showPatternPicker" class="avatar-playground__field">
              <span class="avatar-playground__label">pattern 纹理</span>
              <div class="avatar-playground__select-wrap">
                <select v-model="patternId" class="avatar-playground__select">
                  <option value="">seed 自动</option>
                  <optgroup v-for="group in patternGroups" :key="group.id" :label="group.title">
                    <option v-for="item in group.options" :key="item.id" :value="item.id">
                      {{ item.label }}
                    </option>
                  </optgroup>
                </select>
              </div>
            </label>

            <label class="avatar-playground__toggle">
              <input v-model="showText" type="checkbox" />
              <span>text 显示首字（中文首字 / 英文首字母）</span>
            </label>
          </div>

          <div v-if="showColorSection" class="avatar-playground__colors">
            <p class="avatar-playground__colors-title">
              {{ showBgControl ? '品牌色（bg / fg）' : '文字色（fg）' }}
            </p>

            <div class="avatar-playground__color-row">
              <label v-if="showBgControl" class="avatar-playground__color-field">
                <span class="avatar-playground__label">bg 背景</span>
                <div class="avatar-playground__color-input-wrap">
                  <input
                    type="color"
                    class="avatar-playground__color-picker"
                    :value="toColorPickerValue(bgColor, '6366f1')"
                    @input="bgColor = normalizeHex(($event.target as HTMLInputElement).value)"
                  />
                  <input
                    v-model="bgColor"
                    type="text"
                    class="avatar-playground__input avatar-playground__hex"
                    placeholder="6366f1"
                    maxlength="7"
                  />
                </div>
              </label>

              <label v-if="showFgControl" class="avatar-playground__color-field">
                <span class="avatar-playground__label">fg 文字</span>
                <div class="avatar-playground__color-input-wrap">
                  <input
                    type="color"
                    class="avatar-playground__color-picker"
                    :value="toColorPickerValue(fgColor, 'ffffff')"
                    @input="fgColor = normalizeHex(($event.target as HTMLInputElement).value)"
                  />
                  <input
                    v-model="fgColor"
                    type="text"
                    class="avatar-playground__input avatar-playground__hex"
                    placeholder="ffffff"
                    maxlength="7"
                  />
                </div>
              </label>
            </div>

            <div v-if="showBgControl" class="avatar-playground__presets">
              <button type="button" class="avatar-playground__preset" @click="applyPreset('6366f1', 'ffffff')">
                靛蓝
              </button>
              <button type="button" class="avatar-playground__preset" @click="applyPreset('0ea5e9', 'ffffff')">
                天蓝
              </button>
              <button type="button" class="avatar-playground__preset" @click="applyPreset('10b981', 'ffffff')">
                翡翠
              </button>
              <button type="button" class="avatar-playground__preset" @click="clearColors()">
                默认
              </button>
            </div>
          </div>

          <div v-if="isDevimgFamily" class="avatar-playground__quick-links">
            <button type="button" class="avatar-playground__quick-link" @click="setPlaygroundTab('gallery')">
              浏览画廊 →
            </button>
            <button type="button" class="avatar-playground__quick-link" @click="setPlaygroundTab('code')">
              查看 API / HTML →
            </button>
          </div>

          <p v-if="loadError" class="avatar-playground__error">{{ loadError }}</p>
        </div>
      </div>

      <div class="avatar-playground__url-bar">
        <code class="avatar-playground__url-text">{{ apiUrl }}</code>
        <button type="button" class="avatar-playground__copy" @click="copyText(apiUrl)">复制 URL</button>
      </div>
    </div>

    <section
      v-if="activeTab === 'gallery'"
      id="gallery"
      class="avatar-playground__pane avatar-playground__gallery"
      role="tabpanel"
    >
      <div class="avatar-playground__gallery-head">
        <p class="avatar-playground__gallery-desc">
          共 {{ galleryStyleCount }} 种风格 + {{ patternCount }} 种纹理 · seed：<code>{{ effectiveSeed }}</code> · 点击缩略图试玩
        </p>
        <p class="avatar-playground__gallery-warn">
          缩略图按滚动懒加载；纹理 pattern 默认折叠。请勿批量爬取，详见
          <a href="/guide/fair-use">公平使用</a>。
        </p>
        <p v-if="patternCatalogStale" class="avatar-playground__gallery-warn">
          API 返回的 pattern 目录偏旧（可能为浏览器缓存）。画廊已用内置完整 {{ EXPECTED_PATTERN_COUNT }} 种列表；请硬刷新或重启 API。
        </p>
        <nav class="avatar-playground__gallery-nav" aria-label="画廊分组跳转">
          <button
            v-for="item in galleryNavItems"
            :key="item.id"
            type="button"
            class="avatar-playground__gallery-nav-btn"
            @click="scrollToGallerySection(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>
      </div>

      <div
        id="gallery-devimg-core"
        class="avatar-playground__gallery-group"
      >
        <h4 class="avatar-playground__gallery-group-title">图即 · 基础</h4>
        <div class="avatar-playground__gallery-grid">
          <button
            v-for="item in devimgCoreStyles"
            :key="item.id"
            type="button"
            class="avatar-playground__gallery-item"
            :class="{ 'avatar-playground__gallery-item--active': selectedStyle === item.id && !isPatternMode }"
            :title="item.title"
            @click="selectStyleFromGallery(item.id)"
          >
            <LazyGalleryImg
              :src="buildStyleThumbUrl(item.id, effectiveSeed)"
              :alt="item.id"
              :size="STYLE_GALLERY_SIZE"
            />
            <span class="avatar-playground__gallery-label">{{ item.id }}</span>
          </button>
        </div>
      </div>

      <div
        v-for="group in devimgAlgoGroups"
        :id="group.id"
        :key="group.id"
        class="avatar-playground__gallery-group"
      >
        <h4 class="avatar-playground__gallery-group-title">{{ group.title }}</h4>
        <div class="avatar-playground__gallery-grid">
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="avatar-playground__gallery-item"
            :class="{ 'avatar-playground__gallery-item--active': selectedStyle === item.id }"
            :title="item.title"
            @click="selectStyleFromGallery(item.id)"
          >
            <LazyGalleryImg
              :src="buildStyleThumbUrl(item.id, effectiveSeed)"
              :alt="item.id"
              :size="STYLE_GALLERY_SIZE"
            />
            <span class="avatar-playground__gallery-label">{{ item.id }}</span>
          </button>
        </div>
      </div>

      <div
        v-for="section in partnerGallerySections"
        :id="section.id"
        :key="section.id"
        class="avatar-playground__gallery-group"
      >
        <h4 class="avatar-playground__gallery-group-title">{{ section.title }}</h4>
        <div class="avatar-playground__gallery-grid">
          <button
            v-for="item in section.items"
            :key="item.id"
            type="button"
            class="avatar-playground__gallery-item"
            :class="{ 'avatar-playground__gallery-item--active': selectedStyle === item.id }"
            :title="item.title"
            @click="selectStyleFromGallery(item.id)"
          >
            <LazyGalleryImg
              :src="buildStyleThumbUrl(item.id, effectiveSeed)"
              :alt="item.id"
              :size="STYLE_GALLERY_SIZE"
            />
            <span class="avatar-playground__gallery-label">{{ item.id }}</span>
          </button>
        </div>
      </div>

      <div id="gallery-patterns" class="avatar-playground__gallery-group">
        <button
          type="button"
          class="avatar-playground__gallery-collapse"
          :aria-expanded="patternsExpanded"
          @click="patternsExpanded = !patternsExpanded"
        >
          <span class="avatar-playground__gallery-group-title avatar-playground__gallery-group-title--btn">
            图即 · 纹理 pattern（{{ patternCount }} 种）
          </span>
          <span class="avatar-playground__gallery-collapse-hint">
            {{ patternsExpanded ? '收起' : '展开预览' }}
          </span>
        </button>

        <template v-if="patternsExpanded">
          <div
            v-for="group in patternGroups"
            :id="`pattern-group-${group.id}`"
            :key="group.id"
            class="avatar-playground__gallery-subgroup"
          >
            <h5 class="avatar-playground__gallery-subtitle">{{ group.title }}</h5>
            <div class="avatar-playground__gallery-grid">
              <button
                v-for="item in group.options"
                :key="item.id"
                type="button"
                class="avatar-playground__gallery-item"
                :class="{ 'avatar-playground__gallery-item--active': patternId === item.id && isPatternMode }"
                :title="item.label"
                @click="selectPatternFromGallery(item.id)"
              >
                <LazyGalleryImg
                  :src="buildPatternThumbUrl(effectiveSeed, item.id, avatarShape)"
                  :alt="item.id"
                  :size="PATTERN_GALLERY_SIZE"
                />
                <span class="avatar-playground__gallery-label">{{ item.id }}</span>
              </button>
            </div>
          </div>
        </template>
      </div>
    </section>

    <div v-show="activeTab === 'code'" class="avatar-playground__pane avatar-playground__panel avatar-playground__refs" role="tabpanel">
      <div class="avatar-playground__ref-block">
        <div class="avatar-playground__ref-head">
          <span>HTTP API</span>
          <button type="button" class="avatar-playground__copy" @click="copyText(apiUrl)">
            复制
          </button>
        </div>
        <code class="avatar-playground__code">{{ apiUrl }}</code>
      </div>

      <div class="avatar-playground__ref-block">
        <div class="avatar-playground__ref-head">
          <span>HTML</span>
          <button type="button" class="avatar-playground__copy" @click="copyText(htmlSnippet)">
            复制
          </button>
        </div>
        <code class="avatar-playground__code">{{ htmlSnippet }}</code>
      </div>

      <p class="avatar-playground__hint">
        同一 <code>style</code> + <code>seed</code>（及 devimg 的 <code>variant</code> / <code>text</code> / <code>shape</code> / <code>bg</code> / <code>fg</code>）始终生成相同头像；
        在「快速试玩」中点击预览图也可复制 URL。
        许可说明见
        <a href="/guide/avatar-licenses">图即风格与三方许可</a>。
      </p>
    </div>
  </div>
</template>

<style scoped>
.avatar-playground {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
}

.avatar-playground__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.avatar-playground__tab {
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
  transition: background 0.15s, color 0.15s;
}

.avatar-playground__tab:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.avatar-playground__tab--active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.avatar-playground__tab-badge {
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 600;
}

.avatar-playground__pane {
  min-width: 0;
}

.avatar-playground__main {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 20px;
}

.avatar-playground__panel {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
}

.avatar-playground__preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.avatar-playground__preview-caption {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-align: center;
  word-break: break-all;
}

.avatar-playground__controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-playground__quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 4px;
}

.avatar-playground__quick-link {
  padding: 6px 12px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  cursor: pointer;
}

.avatar-playground__quick-link:hover {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}

.avatar-playground__url-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.avatar-playground__url-text {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-all;
  color: var(--vp-c-text-2);
}

.avatar-playground__image-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 12px;
  background:
    linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
    linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
  background-size: 16px 16px;
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
  cursor: pointer;
}

.dark .avatar-playground__image-btn {
  background:
    linear-gradient(45deg, #334155 25%, transparent 25%),
    linear-gradient(-45deg, #334155 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #334155 75%),
    linear-gradient(-45deg, transparent 75%, #334155 75%);
  background-size: 16px 16px;
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
}

.avatar-playground__image {
  border-radius: 8px;
}

.avatar-playground__copied {
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

.avatar-playground__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.avatar-playground__label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.avatar-playground__select-wrap {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.avatar-playground__select {
  flex: 1;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
}

.avatar-playground__seed-row {
  display: flex;
  gap: 8px;
}

.avatar-playground__input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.avatar-playground__dice {
  width: 42px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-size: 18px;
}

.avatar-playground__devimg {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.avatar-playground__toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.avatar-playground__colors {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.avatar-playground__colors-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.avatar-playground__color-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avatar-playground__color-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.avatar-playground__color-input-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
}

.avatar-playground__color-picker {
  width: 42px;
  height: 38px;
  padding: 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  cursor: pointer;
}

.avatar-playground__hex {
  flex: 1;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.avatar-playground__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.avatar-playground__preset {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
}

.avatar-playground__refs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.avatar-playground__ref-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avatar-playground__ref-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.avatar-playground__copy {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
}

.avatar-playground__code {
  display: block;
  padding: 12px;
  border-radius: 10px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
}

.avatar-playground__hint {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.avatar-playground__error {
  margin: 0;
  font-size: 12px;
  color: #ef4444;
}

.avatar-playground__gallery {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
  overflow: visible;
}

.avatar-playground__gallery-head {
  margin-bottom: 16px;
}

.avatar-playground__gallery-desc {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.avatar-playground__gallery-warn {
  margin: 10px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #f59e0b66;
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.avatar-playground__gallery-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.avatar-playground__gallery-nav-btn {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
}

.avatar-playground__gallery-nav-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.avatar-playground__gallery-group {
  margin-bottom: 18px;
  scroll-margin-top: 72px;
}

.avatar-playground__gallery-group:last-child {
  margin-bottom: 0;
}

.avatar-playground__gallery-group-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.avatar-playground__gallery-group-title--btn {
  margin: 0;
}

.avatar-playground__gallery-collapse {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  cursor: pointer;
  text-align: left;
}

.avatar-playground__gallery-collapse:hover {
  border-color: var(--vp-c-brand-1);
}

.avatar-playground__gallery-collapse-hint {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--vp-c-brand-1);
}

.avatar-playground__gallery-subgroup {
  margin-bottom: 16px;
  scroll-margin-top: 72px;
}

.avatar-playground__gallery-subtitle {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.avatar-playground__gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 10px;
}

.avatar-playground__gallery-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.avatar-playground__gallery-item:hover {
  border-color: var(--vp-c-brand-1);
}

.avatar-playground__gallery-item--active {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--vp-c-brand-1) 25%, transparent);
}

.avatar-playground__gallery-img {
  border-radius: 6px;
  width: 64px;
  height: 64px;
}

.avatar-playground__gallery-label {
  font-size: 10px;
  line-height: 1.2;
  text-align: center;
  color: var(--vp-c-text-2);
  word-break: break-all;
}

@media (max-width: 768px) {
  .avatar-playground__main {
    grid-template-columns: 1fr;
  }

  .avatar-playground__url-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
