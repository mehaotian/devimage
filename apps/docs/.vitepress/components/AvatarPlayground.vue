<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
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
const SEED_DEBOUNCE_MS = 400;

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

let seedTimer: ReturnType<typeof setTimeout> | null = null;

const providerLabels: Record<string, string> = {
  devimage: '图即自研',
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

const PATTERN_GALLERY_SIZE = 64;

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
 * 从画廊选中某个 pattern
 */
function selectPatternFromGallery(id: string): void {
  selectedStyle.value = 'devimg-pattern';
  variant.value = 'pattern';
  patternId.value = id;
  showText.value = false;
  bgColor.value = '';
  copied.value = false;
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

/**
 * 滚动到画廊指定分组
 */
function scrollToPatternGroup(groupId: string): void {
  document.getElementById(`pattern-group-${groupId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    const res = await fetch(`${API_BASE}/avatar/styles`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as { styles: StyleMeta[] };
    styles.value = data.styles ?? [];
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

      <p v-if="loadError" class="avatar-playground__error">{{ loadError }}</p>
    </div>

    <div class="avatar-playground__panel avatar-playground__refs">
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
        点击左侧预览图可快速复制 URL。
        许可说明见
        <a href="/guide/avatar-licenses">自研与第三方许可</a>。
      </p>
    </div>
    </div>

    <section v-if="patternGroups.length" class="avatar-playground__gallery">
      <div class="avatar-playground__gallery-head">
        <h3 class="avatar-playground__gallery-title">纹理画廊</h3>
        <p class="avatar-playground__gallery-desc">
          共 {{ patternCount }} 种 · 当前 seed：<code>{{ effectiveSeed }}</code> · 点击切换
        </p>
        <p v-if="patternCatalogStale" class="avatar-playground__gallery-warn">
          API 返回的 pattern 目录偏旧（可能为浏览器缓存）。画廊已用内置完整 {{ EXPECTED_PATTERN_COUNT }} 种列表；请硬刷新或重启 API。
        </p>
        <nav class="avatar-playground__gallery-nav" aria-label="纹理分组跳转">
          <button
            v-for="group in patternGroups"
            :key="group.id"
            type="button"
            class="avatar-playground__gallery-nav-btn"
            @click="scrollToPatternGroup(group.id)"
          >
            {{ group.title }}
          </button>
        </nav>
      </div>

      <div
        v-for="group in patternGroups"
        :id="`pattern-group-${group.id}`"
        :key="group.id"
        class="avatar-playground__gallery-group"
      >
        <h4 class="avatar-playground__gallery-group-title">{{ group.title }}</h4>
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
            <img
              :src="buildPatternThumbUrl(effectiveSeed, item.id, avatarShape)"
              :alt="item.id"
              width="64"
              height="64"
              loading="lazy"
              class="avatar-playground__gallery-img"
            />
            <span class="avatar-playground__gallery-label">{{ item.id }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.avatar-playground {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: 24px 0;
}

.avatar-playground__main {
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
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
  gap: 14px;
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

.avatar-playground__gallery-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
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
}
</style>
