<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

type CodeTab = 'qr' | 'barcode';
type PlaygroundTab = 'play' | 'code';
type QrShape = 'square' | 'rect';
type RasterFormat = 'svg' | 'webp' | 'png';

interface VariantOption {
  id: string;
  label: string;
}

interface CodeStylesResponse {
  qr?: {
    variants?: { id: string; title: string; description: string }[];
    queryParams?: string[];
  };
  barcode?: {
    variants?: { id: string; title: string; description: string }[];
    queryParams?: string[];
  };
}

const PREVIEW_MAX = 240;
const DEFAULT_API_SIZE = 128;

/** Playground 离线回退 variant 列表 */
const FALLBACK_QR_VARIANTS: VariantOption[] = [
  { id: 'matrix', label: 'matrix · 标准矩阵' },
  { id: 'minimal', label: 'minimal · 极简模块' },
  { id: 'dots', label: 'dots · 圆点矩阵' },
];

const FALLBACK_BARCODE_VARIANTS: VariantOption[] = [
  { id: 'code128', label: 'code128 · Code128 外形' },
  { id: 'ean13', label: 'ean13 · EAN-13 外形' },
];

const activeTab = ref<PlaygroundTab>('play');
const codeType = ref<CodeTab>('qr');
const seed = ref('demo');
const qrShape = ref<QrShape>('square');
const size = ref(DEFAULT_API_SIZE);
const w = ref(320);
const h = ref(80);
const qrVariant = ref('matrix');
const barcodeVariant = ref('code128');
const radius = ref(0);
const fg = ref('');
const bg = ref('');
const accent = ref('');
const format = ref<RasterFormat>('svg');
const copied = ref(false);
const stylesLoadedFromApi = ref(false);
const qrVariants = ref<VariantOption[]>([...FALLBACK_QR_VARIANTS]);
const barcodeVariants = ref<VariantOption[]>([...FALLBACK_BARCODE_VARIANTS]);
const qrQueryParams = ref<string[]>(['fg', 'bg', 'accent', 'variant', 'radius']);
const barcodeQueryParams = ref<string[]>(['fg', 'bg', 'variant']);

const activeQueryParams = computed(() =>
  codeType.value === 'qr' ? qrQueryParams.value : barcodeQueryParams.value,
);

/**
 * 将 API variant 转为下拉选项
 */
function toVariantOption(item: { id: string; title: string; description: string }): VariantOption {
  const suffix =
    item.id === 'matrix' || item.id === 'code128'
      ? item.title
      : (item.description.split('，')[0] ?? item.title);
  return { id: item.id, label: `${item.id} · ${suffix}` };
}

/**
 * 若当前选中 variant 不在列表中，回退到首项
 */
function ensureVariantSelection(
  current: { value: string },
  options: VariantOption[],
  fallbackId: string,
): void {
  if (!options.some((item) => item.id === current.value)) {
    current.value = options[0]?.id ?? fallbackId;
  }
}

/**
 * 从 API 拉取码形 variant 目录（与 GET /code/styles 同步）
 */
async function fetchCodeStyles(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/code/styles`, { cache: 'no-store' });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as CodeStylesResponse;
    if (data.qr?.variants?.length) {
      qrVariants.value = data.qr.variants.map(toVariantOption);
      ensureVariantSelection(qrVariant, qrVariants.value, 'matrix');
    }
    if (data.qr?.queryParams?.length) {
      qrQueryParams.value = [...data.qr.queryParams];
    }
    if (data.barcode?.variants?.length) {
      barcodeVariants.value = data.barcode.variants.map(toVariantOption);
      ensureVariantSelection(barcodeVariant, barcodeVariants.value, 'code128');
    }
    if (data.barcode?.queryParams?.length) {
      barcodeQueryParams.value = [...data.barcode.queryParams];
    }
    stylesLoadedFromApi.value = true;
  } catch {
    /* 保留静态回退列表 */
  }
}

onMounted(() => {
  void fetchCodeStyles();
});

/**
 * 将输出尺寸缩放到预览区上限内
 */
function scaleToPreview(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(PREVIEW_MAX / width, PREVIEW_MAX / height, 1);
  return {
    width: Math.max(10, Math.round(width * scale)),
    height: Math.max(10, Math.round(height * scale)),
  };
}

/**
 * 组装 query 字符串（仅非空参数）
 */
function buildQuery(params: Record<string, string | number>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === '' || value === 0) {
      continue;
    }
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * 规范化 hex 输入
 */
function normalizeHex(value: string): string {
  return value.replace(/^#/, '').trim().slice(0, 6);
}

/**
 * 转为 color input 所需的 #rrggbb
 */
function toColorPickerValue(hex: string, fallback: string): string {
  const normalized = normalizeHex(hex);
  const value = normalized.length === 6 ? normalized : fallback;
  return `#${value}`;
}

const encodedSeed = computed(() => encodeURIComponent(seed.value.trim() || 'demo'));

const formatSuffix = computed(() => (format.value === 'svg' ? '' : `.${format.value}`));

const apiDimensions = computed(() => {
  if (codeType.value === 'barcode') {
    return { width: w.value, height: h.value };
  }
  if (qrShape.value === 'square') {
    return { width: size.value, height: size.value };
  }
  return { width: w.value, height: h.value };
});

const previewDimensions = computed(() =>
  scaleToPreview(apiDimensions.value.width, apiDimensions.value.height),
);

const queryString = computed(() => {
  if (codeType.value === 'barcode') {
    return buildQuery({
      variant: barcodeVariant.value === 'code128' ? '' : barcodeVariant.value,
      fg: fg.value,
      bg: bg.value,
    });
  }
  return buildQuery({
    variant: qrVariant.value === 'matrix' ? '' : qrVariant.value,
    radius: radius.value,
    fg: fg.value,
    bg: bg.value,
    accent: accent.value,
  });
});

/**
 * 构建码形占位 URL
 */
function buildCodeUrl(width: number, height: number): string {
  const s = encodedSeed.value;
  const query = queryString.value;

  if (codeType.value === 'barcode') {
    return `${API_BASE}/barcode/${s}/${width}/${height}${formatSuffix.value}${query}`;
  }
  if (qrShape.value === 'square' && width === height) {
    return `${API_BASE}/qr/${s}/${width}${formatSuffix.value}${query}`;
  }
  return `${API_BASE}/qr/${s}/${width}/${height}${formatSuffix.value}${query}`;
}

const previewUrl = computed(() =>
  buildCodeUrl(previewDimensions.value.width, previewDimensions.value.height),
);

const apiUrl = computed(() => buildCodeUrl(apiDimensions.value.width, apiDimensions.value.height));

const previewCaption = computed(() => {
  const { width, height } = apiDimensions.value;
  const typeLabel = codeType.value === 'qr' ? '伪 QR' : '伪条码';
  return `${typeLabel} · ${seed.value.trim() || 'demo'} · ${width}×${height}`;
});

const htmlSnippet = computed(
  () =>
    `<img src="${apiUrl.value}" alt="pseudo ${codeType.value}" width="${apiDimensions.value.width}" height="${apiDimensions.value.height}" />`,
);

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
    window.setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    /* ignore */
  }
}

/**
 * 点击预览复制 URL
 */
function copyPreviewLink(): void {
  void copyText(apiUrl.value);
}
</script>

<template>
  <div class="code-playground">
    <div class="code-playground__tabs" role="tablist" aria-label="码形占位试玩">
      <button
        type="button"
        role="tab"
        class="code-playground__tab"
        :class="{ 'code-playground__tab--active': activeTab === 'play' }"
        :aria-selected="activeTab === 'play'"
        @click="setPlaygroundTab('play')"
      >
        快速试玩
      </button>
      <button
        type="button"
        role="tab"
        class="code-playground__tab"
        :class="{ 'code-playground__tab--active': activeTab === 'code' }"
        :aria-selected="activeTab === 'code'"
        @click="setPlaygroundTab('code')"
      >
        代码参考
      </button>
    </div>

    <div v-show="activeTab === 'play'" class="code-playground__pane" role="tabpanel">
      <div class="code-playground__main">
        <div class="code-playground__panel code-playground__preview">
          <button
            type="button"
            class="code-playground__image-btn"
            :title="copied ? '已复制链接' : '点击复制 URL'"
            @click="copyPreviewLink"
          >
            <img
              :src="previewUrl"
              :alt="previewCaption"
              :width="previewDimensions.width"
              :height="previewDimensions.height"
              class="code-playground__image"
            />
            <span v-if="copied" class="code-playground__copied">已复制 URL</span>
          </button>
          <p class="code-playground__preview-caption">{{ previewCaption }}</p>
          <p class="code-playground__preview-hint">
            图案不可扫描，仅作 UI 占位
            <span v-if="stylesLoadedFromApi" class="code-playground__sync-hint"> · variant 已同步 API</span>
          </p>
        </div>

        <div class="code-playground__panel code-playground__controls">
          <div class="code-playground__type-switch" role="group" aria-label="码形类型">
            <button
              type="button"
              class="code-playground__type-btn"
              :class="{ 'code-playground__type-btn--active': codeType === 'qr' }"
              @click="codeType = 'qr'"
            >
              伪 QR
            </button>
            <button
              type="button"
              class="code-playground__type-btn"
              :class="{ 'code-playground__type-btn--active': codeType === 'barcode' }"
              @click="codeType = 'barcode'"
            >
              伪条码
            </button>
          </div>

          <label class="code-playground__field">
            <span class="code-playground__label">Seed</span>
            <input v-model="seed" type="text" maxlength="50" class="code-playground__input" placeholder="demo" />
          </label>

          <label class="code-playground__field">
            <span class="code-playground__label">输出格式</span>
            <div class="code-playground__select-wrap">
              <select v-model="format" class="code-playground__select">
                <option value="svg">SVG</option>
                <option value="webp">WebP（栅格 ≤1024）</option>
                <option value="png">PNG（栅格 ≤1024）</option>
              </select>
            </div>
          </label>

          <div v-if="codeType === 'qr'" class="code-playground__section">
            <label class="code-playground__field">
              <span class="code-playground__label">比例</span>
              <div class="code-playground__select-wrap">
                <select v-model="qrShape" class="code-playground__select">
                  <option value="square">正方形 /qr/:seed/:size</option>
                  <option value="rect">矩形 /qr/:seed/:w/:h</option>
                </select>
              </div>
            </label>

            <label v-if="qrShape === 'square'" class="code-playground__field">
              <span class="code-playground__label">边长 size</span>
              <input v-model.number="size" type="number" min="10" max="4000" class="code-playground__input" />
            </label>

            <template v-else>
              <label class="code-playground__field">
                <span class="code-playground__label">宽 w</span>
                <input v-model.number="w" type="number" min="10" max="4000" class="code-playground__input" />
              </label>
              <label class="code-playground__field">
                <span class="code-playground__label">高 h</span>
                <input v-model.number="h" type="number" min="10" max="4000" class="code-playground__input" />
              </label>
            </template>

            <label class="code-playground__field">
              <span class="code-playground__label">variant</span>
              <div class="code-playground__select-wrap">
                <select v-model="qrVariant" class="code-playground__select">
                  <option v-for="item in qrVariants" :key="item.id" :value="item.id">
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </label>

            <label class="code-playground__field">
              <span class="code-playground__label">radius（0–50）</span>
              <input v-model.number="radius" type="number" min="0" max="50" class="code-playground__input" />
            </label>
          </div>

          <div v-else class="code-playground__section">
            <label class="code-playground__field">
              <span class="code-playground__label">宽 w</span>
              <input v-model.number="w" type="number" min="10" max="4000" class="code-playground__input" />
            </label>
            <label class="code-playground__field">
              <span class="code-playground__label">高 h</span>
              <input v-model.number="h" type="number" min="10" max="4000" class="code-playground__input" />
            </label>
            <label class="code-playground__field">
              <span class="code-playground__label">variant</span>
              <div class="code-playground__select-wrap">
                <select v-model="barcodeVariant" class="code-playground__select">
                  <option v-for="item in barcodeVariants" :key="item.id" :value="item.id">
                    {{ item.label }}
                  </option>
                </select>
              </div>
            </label>
          </div>

          <div class="code-playground__colors">
            <p class="code-playground__colors-title">配色（可选）</p>
            <div class="code-playground__color-row">
              <label class="code-playground__color-field">
                <span class="code-playground__label">fg 前景</span>
                <div class="code-playground__color-input-wrap">
                  <input
                    type="color"
                    class="code-playground__color-picker"
                    :value="toColorPickerValue(fg, '111111')"
                    @input="fg = normalizeHex(($event.target as HTMLInputElement).value)"
                  />
                  <input
                    v-model="fg"
                    type="text"
                    class="code-playground__input code-playground__hex"
                    placeholder="111111"
                    maxlength="7"
                  />
                </div>
              </label>
              <label class="code-playground__color-field">
                <span class="code-playground__label">bg 背景</span>
                <div class="code-playground__color-input-wrap">
                  <input
                    type="color"
                    class="code-playground__color-picker"
                    :value="toColorPickerValue(bg, 'f5f5f5')"
                    @input="bg = normalizeHex(($event.target as HTMLInputElement).value)"
                  />
                  <input
                    v-model="bg"
                    type="text"
                    class="code-playground__input code-playground__hex"
                    placeholder="f5f5f5"
                    maxlength="7"
                  />
                </div>
              </label>
              <label v-if="codeType === 'qr'" class="code-playground__color-field">
                <span class="code-playground__label">accent 强调</span>
                <div class="code-playground__color-input-wrap">
                  <input
                    type="color"
                    class="code-playground__color-picker"
                    :value="toColorPickerValue(accent, '6366f1')"
                    @input="accent = normalizeHex(($event.target as HTMLInputElement).value)"
                  />
                  <input
                    v-model="accent"
                    type="text"
                    class="code-playground__input code-playground__hex"
                    placeholder="6366f1"
                    maxlength="7"
                  />
                </div>
              </label>
            </div>
          </div>

          <button type="button" class="code-playground__quick-link" @click="setPlaygroundTab('code')">
            查看 API / HTML →
          </button>

          <p v-if="stylesLoadedFromApi" class="code-playground__query-hint">
            可用 query：<code>{{ activeQueryParams.join(', ') }}</code>
          </p>
        </div>
      </div>

      <div class="code-playground__url-bar">
        <code class="code-playground__url-text">{{ apiUrl }}</code>
        <button type="button" class="code-playground__copy" @click="copyText(apiUrl)">复制 URL</button>
      </div>
    </div>

    <div v-show="activeTab === 'code'" class="code-playground__pane code-playground__refs" role="tabpanel">
      <div class="code-playground__ref-block">
        <div class="code-playground__ref-head">
          <span>HTTP API</span>
          <button type="button" class="code-playground__copy" @click="copyText(apiUrl)">复制</button>
        </div>
        <code class="code-playground__code">{{ apiUrl }}</code>
      </div>

      <div class="code-playground__ref-block">
        <div class="code-playground__ref-head">
          <span>HTML</span>
          <button type="button" class="code-playground__copy" @click="copyText(htmlSnippet)">复制</button>
        </div>
        <code class="code-playground__code">{{ htmlSnippet }}</code>
      </div>

      <p class="code-playground__hint">
        生成的图案<strong>不是</strong>有效二维码或条形码，请勿用于支付、登录或物流扫码。
        固定 seed URL 适合 CDN 缓存；详见
        <a href="/guide/fair-use">公平使用</a>。
      </p>
    </div>
  </div>
</template>

<style scoped>
.code-playground {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
}

.code-playground__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.code-playground__tab {
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

.code-playground__tab:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.code-playground__tab--active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.code-playground__pane {
  min-width: 0;
}

.code-playground__main {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 20px;
  align-items: start;
}

.code-playground__panel {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
  min-width: 0;
}

.code-playground__preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.code-playground__preview-caption {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-align: center;
  word-break: break-all;
}

.code-playground__preview-hint {
  margin: 0;
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-align: center;
}

.code-playground__sync-hint {
  color: var(--vp-c-brand-2);
}

.code-playground__controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.code-playground__type-switch {
  display: flex;
  gap: 8px;
  padding: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.code-playground__type-btn {
  flex: 1;
  padding: 8px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
}

.code-playground__type-btn--active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.code-playground__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.code-playground__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.code-playground__label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.code-playground__select-wrap {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.code-playground__select {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 14px;
  outline: none;
}

.code-playground__input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.code-playground__colors {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.code-playground__colors-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.code-playground__color-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.code-playground__color-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.code-playground__color-input-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.code-playground__color-picker {
  flex-shrink: 0;
  width: 42px;
  height: 38px;
  padding: 2px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  cursor: pointer;
}

.code-playground__hex {
  flex: 1;
  min-width: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.code-playground__quick-link {
  align-self: flex-start;
  padding: 6px 12px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  cursor: pointer;
}

.code-playground__quick-link:hover {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}

.code-playground__query-hint {
  margin: 0;
  font-size: 11px;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}

.code-playground__query-hint code {
  font-size: 11px;
  color: var(--vp-c-text-2);
}

.code-playground__url-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.code-playground__url-text {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  line-height: 1.4;
  word-break: break-all;
  color: var(--vp-c-text-2);
}

.code-playground__image-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 160px;
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

.dark .code-playground__image-btn {
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

.code-playground__image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.code-playground__copied {
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

.code-playground__copy {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
}

.code-playground__refs {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
}

.code-playground__ref-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.code-playground__ref-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.code-playground__code {
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

.code-playground__hint {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .code-playground__main {
    grid-template-columns: 1fr;
  }

  .code-playground__url-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
