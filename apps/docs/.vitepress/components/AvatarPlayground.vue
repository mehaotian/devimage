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
const SIZE_DEBOUNCE_MS = 400;
const MIN_AVATAR_SIZE = 16;
const MAX_AVATAR_SIZE = 4000;
const PREVIEW_MAX = 240;

interface AvatarPreset {
  label: string;
  style: string;
  seed: string;
  size?: number;
  text?: boolean;
  variant?: 'gradient' | 'mesh' | 'pattern';
  shape?: 'circle' | 'square';
  bg?: string;
  fg?: string;
}

const PLAY_PRESETS: AvatarPreset[] = [
  { label: '中文首字', style: 'devimg', seed: '张三', size: 128 },
  { label: '卡通风格', style: 'lorelei', seed: 'Luna', size: 128 },
  { label: '纯图案', style: 'devimg', seed: 'Luna', size: 128, text: false },
  { label: '方形', style: 'devimg', seed: '张三', size: 128, shape: 'square' },
];

const SIZE_PRESETS = [32, 64, 128, 256] as const;

const CODE_RECIPES = [
  { title: '中文首字', path: '/avatar/devimg/张三/128' },
  { title: '纯图案无字', path: '/avatar/devimg/Luna/128?text=0' },
  { title: '品牌色', path: '/avatar/devimg/张三/128?bg=6366f1&fg=ffffff' },
  { title: '卡通 Lorelei', path: '/avatar/lorelei/Luna/128' },
  { title: '方形', path: '/avatar/devimg/张三/128?shape=square' },
  { title: 'WebP 位图', path: '/avatar/devimg/张三/128.webp' },
] as const;

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
const avatarSize = ref(128);
const debouncedAvatarSize = ref(128);
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
const showMore = ref(false);

let seedTimer: ReturnType<typeof setTimeout> | null = null;
let sizeTimer: ReturnType<typeof setTimeout> | null = null;

const providerLabels: Record<string, string> = {
  devimage: '图即',
  dicebear: 'DiceBear',
  jdenticon: 'Jdenticon',
  minidenticons: 'Minidenticons',
};

interface StyleSelectGroup {
  id: string;
  label: string;
  items: StyleMeta[];
}

const DEVIMG_SELECT_GROUP_ORDER = [
  'gradient',
  'text',
  'geometric',
  'abstract',
  'symbol',
  'retro',
  'filter',
  'pixel',
  'character',
  'icon',
];

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
  } else if (style.startsWith('devimg-')) {
    const shapeValue = query?.shape ?? 'circle';
    if (shapeValue === 'square') {
      params.set('shape', 'square');
    }
  }

  const bg = normalizeHex(query?.bg ?? '');
  const fg = normalizeHex(query?.fg ?? '');
  const skipBg =
    style === 'devimg-pattern' || (style === 'devimg' && (query?.variant ?? 'gradient') === 'pattern');
  if (DEVIMG_FAMILY.has(style) && bg.length === 6 && !skipBg) {
    params.set('bg', bg);
  }
  if (DEVIMG_FAMILY.has(style) && fg.length === 6) {
    params.set('fg', fg);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * 判断是否为图即自研风格（与三方接入区分，便于版权展示）
 */
function isDevimageStyle(item: StyleMeta): boolean {
  return item.provider === 'devimage' || item.engine === 'native';
}

const effectiveSeed = computed(() => debouncedSeed.value.trim() || DEFAULT_SEED);

const activeStyleMeta = computed(() =>
  styles.value.find((item) => item.id === selectedStyle.value),
);

const isDevimgFamily = computed(() => DEVIMG_FAMILY.has(selectedStyle.value));

const isActiveNativeDevimage = computed(
  () => Boolean(activeStyleMeta.value && isDevimageStyle(activeStyleMeta.value)),
);

const supportsColorQuery = computed(
  () =>
    isDevimgFamily.value ||
    activeStyleMeta.value?.queryParams?.some((item) => item === 'bg' || item === 'fg'),
);

const isPatternMode = computed(
  () => selectedStyle.value === 'devimg-pattern' || variant.value === 'pattern',
);

const showShapeControl = computed(() => isActiveNativeDevimage.value);

const showVariantPicker = computed(
  () => isDevimgFamily.value && selectedStyle.value !== 'devimg-pattern',
);

const showPatternPicker = computed(() => isDevimgFamily.value && isPatternMode.value);

const showTextToggle = computed(() => isDevimgFamily.value);

const showBgControl = computed(() => isDevimgFamily.value && !isPatternMode.value);

const showFgControl = computed(() => isDevimgFamily.value && showText.value);

const showColorSection = computed(() => showBgControl.value || showFgControl.value);

const showDevimgAdvancedControls = computed(
  () => showVariantPicker.value || showPatternPicker.value || showTextToggle.value,
);

const hasMoreOptions = computed(
  () =>
    showShapeControl.value ||
    showDevimgAdvancedControls.value ||
    showColorSection.value,
);

const devimgQuery = computed(() => ({
  variant: variant.value,
  text: showText.value,
  shape: avatarShape.value,
  bg: isPatternMode.value ? '' : bgColor.value,
  fg: fgColor.value,
  pattern: patternId.value,
}));

const previewUrl = computed(() =>
  buildAvatarUrl(selectedStyle.value, effectiveSeed.value, debouncedAvatarSize.value, devimgQuery.value),
);

const apiUrl = computed(() =>
  buildAvatarUrl(selectedStyle.value, effectiveSeed.value, debouncedAvatarSize.value, devimgQuery.value),
);

const relativeApiPath = computed(() => apiUrl.value.replace(API_BASE, ''));

/**
 * 预览区展示的 query 参数标签
 */
const previewParamTags = computed(() => {
  try {
    const params = new URL(apiUrl.value).searchParams;
    return [...params.entries()].map(([key, value]) => `${key}=${value}`);
  } catch {
    return [];
  }
});

const previewDisplaySize = computed(() =>
  Math.min(debouncedAvatarSize.value, PREVIEW_MAX),
);

const previewCaption = computed(() => {
  const title = activeStyleMeta.value?.title ?? selectedStyle.value;
  return `${debouncedAvatarSize.value}px · ${title} · ${effectiveSeed.value}`;
});

const htmlSnippet = computed(
  () =>
    `<img src="${apiUrl.value}" alt="${effectiveSeed.value}" width="${debouncedAvatarSize.value}" height="${debouncedAvatarSize.value}" />`,
);

/**
 * 将可见风格按「来源 · 题材」拆成下拉 optgroup，内置与三方不混排
 */
function buildStyleSelectGroups(
  items: StyleMeta[],
  groupOrder: readonly string[],
  providerKey: string,
  providerLabel: string,
): StyleSelectGroup[] {
  const filtered = items.filter((item) => !item.aliasOf);
  const byGroup = new Map<string, StyleMeta[]>();
  for (const item of filtered) {
    const list = byGroup.get(item.group) ?? [];
    list.push(item);
    byGroup.set(item.group, list);
  }
  return groupOrder
    .filter((groupId) => byGroup.has(groupId))
    .map((groupId) => ({
      id: `${providerKey}-${groupId}`,
      label: `${providerLabel} · ${GROUP_LABELS[groupId] ?? groupId}`,
      items: byGroup.get(groupId) ?? [],
    }));
}

const styleSelectGroups = computed((): StyleSelectGroup[] => {
  const visible = styles.value.filter((item) => !item.aliasOf);
  const groups: StyleSelectGroup[] = [];

  groups.push(
    ...buildStyleSelectGroups(
      visible.filter(isDevimageStyle),
      DEVIMG_SELECT_GROUP_ORDER,
      'devimg',
      providerLabels.devimage,
    ),
  );

  groups.push(
    ...buildStyleSelectGroups(
      visible.filter((item) => item.provider === 'dicebear'),
      DICEBEAR_GROUP_ORDER,
      'dicebear',
      providerLabels.dicebear,
    ),
  );

  for (const provider of ['jdenticon', 'minidenticons'] as const) {
    const partnerItems = visible.filter((item) => item.provider === provider);
    if (partnerItems.length) {
      groups.push({
        id: provider,
        label: providerLabels[provider],
        items: partnerItems,
      });
    }
  }

  return groups;
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
 * 将尺寸 clamp 到 API 允许范围
 */
function clampAvatarSize(value: number): number {
  if (!Number.isFinite(value)) {
    return 128;
  }
  return Math.min(MAX_AVATAR_SIZE, Math.max(MIN_AVATAR_SIZE, Math.round(value)));
}

/**
 * 应用快捷预设
 */
function applyPlayPreset(preset: AvatarPreset): void {
  selectedStyle.value = preset.style;
  seed.value = preset.seed;
  debouncedSeed.value = preset.seed;
  if (preset.size !== undefined) {
    avatarSize.value = preset.size;
    debouncedAvatarSize.value = preset.size;
  }
  syncDevimgControls(preset.style);
  if (preset.text !== undefined) {
    showText.value = preset.text;
  }
  if (preset.variant !== undefined) {
    variant.value = preset.variant;
  }
  if (preset.shape !== undefined) {
    avatarShape.value = preset.shape;
  }
  if (preset.bg) {
    bgColor.value = preset.bg;
  } else {
    bgColor.value = '';
  }
  if (preset.fg) {
    fgColor.value = preset.fg;
  } else {
    fgColor.value = '';
  }
  showMore.value = false;
  copied.value = false;
  activeTab.value = 'play';
}

/**
 * 应用常用尺寸
 */
function applySizePreset(size: number): void {
  avatarSize.value = size;
  debouncedAvatarSize.value = clampAvatarSize(size);
  copied.value = false;
}

/**
 * 将相对路径转为完整 API URL
 */
function toFullUrl(path: string): string {
  return `${API_BASE}${path}`;
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
    title: GROUP_LABELS[groupId] ?? groupId,
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
        title: `${providerLabels.dicebear} · ${GROUP_LABELS[groupId] ?? groupId}`,
        items,
      });
    }
  }
  for (const provider of ['jdenticon', 'minidenticons'] as const) {
    const items = styles.value.filter((item) => item.provider === provider && !item.aliasOf);
    if (items.length) {
      sections.push({
        id: provider,
        title: providerLabels[provider],
        items,
      });
    }
  }
  return sections;
});

const galleryNavItems = computed(() => {
  const items: { id: string; label: string; divider?: boolean }[] = [
    { id: 'gallery-devimg-core', label: '图即 · 推荐' },
    ...devimgAlgoGroups.value.map((group) => ({
      id: group.id,
      label: `${providerLabels.devimage} · ${group.title}`,
    })),
  ];
  if (partnerGallerySections.value.length) {
    items.push({ id: 'gallery-partner-divider', label: '开源接入', divider: true });
    items.push(
      ...partnerGallerySections.value.map((section) => ({ id: section.id, label: section.title })),
    );
  }
  items.push({ id: 'gallery-patterns', label: '图即 · 纹理' });
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
    const targetId =
      sectionId === 'gallery-partner-divider' ? 'gallery-partner-divider' : sectionId;
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

watch([avatarSize], () => {
  if (sizeTimer) {
    clearTimeout(sizeTimer);
  }
  sizeTimer = setTimeout(() => {
    debouncedAvatarSize.value = clampAvatarSize(avatarSize.value);
  }, SIZE_DEBOUNCE_MS);
}, { immediate: true });

watch(selectedStyle, (styleId) => {
  copied.value = false;
  syncDevimgControls(styleId);
  if (!supportsColorQuery.value) {
    clearColors();
  }
  if (!hasMoreOptions.value) {
    showMore.value = false;
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
  if (sizeTimer) {
    clearTimeout(sizeTimer);
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
        试玩
      </button>
      <button
        type="button"
        role="tab"
        class="avatar-playground__tab"
        :class="{ 'avatar-playground__tab--active': activeTab === 'gallery' }"
        :aria-selected="activeTab === 'gallery'"
        @click="setPlaygroundTab('gallery')"
      >
        浏览
      </button>
      <button
        type="button"
        role="tab"
        class="avatar-playground__tab"
        :class="{ 'avatar-playground__tab--active': activeTab === 'code' }"
        :aria-selected="activeTab === 'code'"
        @click="setPlaygroundTab('code')"
      >
        复制代码
      </button>
    </div>

    <div v-show="activeTab === 'play'" class="avatar-playground__pane" role="tabpanel">
      <div class="avatar-playground__main">
        <div class="avatar-playground__panel avatar-playground__preview">
          <button
            type="button"
            class="avatar-playground__image-btn"
            :title="copied ? '已复制' : '点击复制链接'"
            @click="copyPreviewLink"
          >
            <img
              :src="previewUrl"
              :alt="previewCaption"
              :width="previewDisplaySize"
              :height="previewDisplaySize"
              class="avatar-playground__image"
            />
            <span v-if="copied" class="avatar-playground__copied">已复制</span>
          </button>
          <p class="avatar-playground__preview-caption">{{ previewCaption }}</p>
          <div v-if="previewParamTags.length" class="avatar-playground__param-tags" aria-label="当前 URL 参数">
            <code v-for="tag in previewParamTags" :key="tag" class="avatar-playground__param-tag">{{ tag }}</code>
          </div>
          <code class="avatar-playground__preview-path">{{ relativeApiPath }}</code>
        </div>

        <div class="avatar-playground__panel avatar-playground__controls">
          <div class="avatar-playground__presets">
            <span class="avatar-playground__label">快捷示例</span>
            <div class="avatar-playground__presets-row">
              <button
                v-for="preset in PLAY_PRESETS"
                :key="preset.label"
                type="button"
                class="avatar-playground__preset"
                @click="applyPlayPreset(preset)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <label class="avatar-playground__field">
            <span class="avatar-playground__label">尺寸（边长 px）</span>
            <div class="avatar-playground__size-row">
              <input
                v-model.number="avatarSize"
                type="number"
                min="16"
                max="4000"
                class="avatar-playground__input"
                aria-label="头像尺寸"
              />
            </div>
            <div class="avatar-playground__presets-row">
              <button
                v-for="size in SIZE_PRESETS"
                :key="size"
                type="button"
                class="avatar-playground__preset"
                @click="applySizePreset(size)"
              >
                {{ size }}
              </button>
            </div>
          </label>

          <label class="avatar-playground__field">
            <span class="avatar-playground__label">风格</span>
            <div class="avatar-playground__select-wrap">
              <select
                v-model="selectedStyle"
                class="avatar-playground__select"
                :disabled="loading"
              >
                <optgroup
                  v-for="group in styleSelectGroups"
                  :key="group.id"
                  :label="group.label"
                >
                  <option v-for="item in group.items" :key="item.id" :value="item.id">
                    {{ item.title }}
                  </option>
                </optgroup>
              </select>
            </div>
          </label>

          <label class="avatar-playground__field">
            <span class="avatar-playground__label">标识（名字 / 用户名）</span>
            <div class="avatar-playground__seed-row">
              <input v-model="seed" type="text" class="avatar-playground__input" maxlength="64" placeholder="张三" />
              <button type="button" class="avatar-playground__dice" title="随机标识" @click="randomizeSeed">
                🎲
              </button>
            </div>
          </label>

          <button
            v-if="hasMoreOptions"
            type="button"
            class="avatar-playground__more-toggle"
            :aria-expanded="showMore"
            @click="showMore = !showMore"
          >
            {{ showMore ? '收起更多选项' : '更多选项' }}
            <span class="avatar-playground__more-chevron">{{ showMore ? '▾' : '▸' }}</span>
          </button>

          <div v-show="showMore && hasMoreOptions" class="avatar-playground__more">
          <label v-if="showShapeControl" class="avatar-playground__field">
            <span class="avatar-playground__label">形状</span>
            <div class="avatar-playground__select-wrap">
              <select v-model="avatarShape" class="avatar-playground__select">
                <option value="circle">圆形</option>
                <option value="square">方形</option>
              </select>
            </div>
          </label>

          <div v-if="showDevimgAdvancedControls" class="avatar-playground__devimg">
            <label v-if="showVariantPicker" class="avatar-playground__field">
              <span class="avatar-playground__label">背景类型</span>
              <div class="avatar-playground__select-wrap">
                <select v-model="variant" class="avatar-playground__select">
                  <option value="gradient">渐变</option>
                  <option value="mesh">网格光斑</option>
                  <option value="pattern">纹理</option>
                </select>
              </div>
            </label>

            <label v-if="showPatternPicker" class="avatar-playground__field">
              <span class="avatar-playground__label">纹理样式</span>
              <div class="avatar-playground__select-wrap">
                <select v-model="patternId" class="avatar-playground__select">
                  <option value="">自动</option>
                  <optgroup v-for="group in patternGroups" :key="group.id" :label="group.title">
                    <option v-for="item in group.options" :key="item.id" :value="item.id">
                      {{ item.label }}
                    </option>
                  </optgroup>
                </select>
              </div>
            </label>

            <label v-if="showTextToggle" class="avatar-playground__toggle">
              <input v-model="showText" type="checkbox" />
              <span>显示首字</span>
            </label>
          </div>

          <div v-if="showColorSection" class="avatar-playground__colors">
            <p class="avatar-playground__colors-title">
              {{ showBgControl ? '背景色 / 文字色' : '文字色' }}
            </p>

            <div class="avatar-playground__color-row">
              <label v-if="showBgControl" class="avatar-playground__color-field">
                <span class="avatar-playground__label">背景</span>
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
                <span class="avatar-playground__label">文字</span>
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
          </div>

          <p v-if="loadError" class="avatar-playground__error">{{ loadError }}</p>
        </div>
      </div>

      <div class="avatar-playground__url-bar">
        <code class="avatar-playground__url-text">{{ apiUrl }}</code>
        <button type="button" class="avatar-playground__copy" @click="copyText(apiUrl)">复制链接</button>
        <button type="button" class="avatar-playground__copy" @click="copyText(htmlSnippet)">复制 HTML</button>
      </div>
    </div>

    <section
      v-if="activeTab === 'gallery'"
      id="gallery"
      class="avatar-playground__pane avatar-playground__gallery"
      role="tabpanel"
    >
      <div class="avatar-playground__gallery-head">
        <p class="avatar-playground__gallery-desc">点击缩略图即可回到试玩区预览。</p>
        <p v-if="patternCatalogStale" class="avatar-playground__gallery-warn">
          纹理列表可能不是最新，请刷新页面后重试。
        </p>
        <nav class="avatar-playground__gallery-nav" aria-label="浏览分组跳转">
          <button
            v-for="item in galleryNavItems"
            :key="item.id"
            type="button"
            class="avatar-playground__gallery-nav-btn"
            :class="{ 'avatar-playground__gallery-nav-btn--divider': item.divider }"
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
        <h4 class="avatar-playground__gallery-group-title">图即 · 推荐</h4>
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
            <span class="avatar-playground__gallery-label">{{ item.title }}</span>
          </button>
        </div>
      </div>

      <div
        v-for="group in devimgAlgoGroups"
        :id="group.id"
        :key="group.id"
        class="avatar-playground__gallery-group"
      >
        <h4 class="avatar-playground__gallery-group-title">
          {{ providerLabels.devimage }} · {{ group.title }}
        </h4>
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
            <span class="avatar-playground__gallery-label">{{ item.title }}</span>
          </button>
        </div>
      </div>

      <div
        v-if="partnerGallerySections.length"
        id="gallery-partner-divider"
        class="avatar-playground__gallery-divider"
      >
        <span class="avatar-playground__gallery-divider-label">开源接入</span>
        <span class="avatar-playground__gallery-divider-hint">
          以下风格由第三方项目提供，许可见
          <a href="/guide/avatar-licenses">头像许可</a>
        </span>
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
            <span class="avatar-playground__gallery-label">{{ item.title }}</span>
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
            纹理样式
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
                <span class="avatar-playground__gallery-label">{{ item.label }}</span>
              </button>
            </div>
          </div>
        </template>
      </div>
    </section>

    <div v-show="activeTab === 'code'" class="avatar-playground__pane avatar-playground__panel avatar-playground__refs" role="tabpanel">
      <div class="avatar-playground__ref-block">
        <div class="avatar-playground__ref-head">
          <span>当前链接</span>
          <button type="button" class="avatar-playground__copy" @click="copyText(apiUrl)">
            复制
          </button>
        </div>
        <code class="avatar-playground__code">{{ apiUrl }}</code>
      </div>

      <div class="avatar-playground__ref-block">
        <div class="avatar-playground__ref-head">
          <span>当前 HTML</span>
          <button type="button" class="avatar-playground__copy" @click="copyText(htmlSnippet)">
            复制
          </button>
        </div>
        <code class="avatar-playground__code">{{ htmlSnippet }}</code>
      </div>

      <div class="avatar-playground__recipes">
        <h4 class="avatar-playground__recipes-title">常用示例</h4>
        <div v-for="recipe in CODE_RECIPES" :key="recipe.path" class="avatar-playground__recipe">
          <div class="avatar-playground__recipe-head">
            <strong class="avatar-playground__recipe-title">{{ recipe.title }}</strong>
            <button type="button" class="avatar-playground__copy" @click="copyText(toFullUrl(recipe.path))">
              复制
            </button>
          </div>
          <code class="avatar-playground__code">{{ toFullUrl(recipe.path) }}</code>
        </div>
      </div>

      <p class="avatar-playground__hint">
        同一链接始终生成相同头像。许可说明见
        <a href="/guide/avatar-licenses">头像许可</a>。
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
  align-items: start;
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

.avatar-playground__param-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  width: 100%;
}

.avatar-playground__param-tag {
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-text-2);
  font-size: 11px;
}

.avatar-playground__preview-path {
  display: block;
  width: 100%;
  font-size: 11px;
  word-break: break-all;
  text-align: center;
  color: var(--vp-c-text-3);
}

.avatar-playground__presets-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.avatar-playground__presets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avatar-playground__size-row {
  display: flex;
  gap: 8px;
}

.avatar-playground__more-toggle {
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

.avatar-playground__more-chevron {
  color: var(--vp-c-text-3);
}

.avatar-playground__more {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.avatar-playground__recipes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-playground__recipes-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.avatar-playground__recipe {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.avatar-playground__recipe-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.avatar-playground__recipe-title {
  font-size: 13px;
  color: var(--vp-c-text-1);
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
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
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

.avatar-playground__gallery-nav-btn--divider {
  border-style: dashed;
  color: var(--vp-c-text-3);
  cursor: default;
  pointer-events: auto;
}

.avatar-playground__gallery-divider {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 8px 0 16px;
  padding: 12px 14px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  scroll-margin-top: 72px;
}

.avatar-playground__gallery-divider-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.avatar-playground__gallery-divider-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  line-height: 1.5;
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
