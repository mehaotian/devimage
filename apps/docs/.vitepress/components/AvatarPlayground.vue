<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';

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
}

const DEFAULT_STYLE = 'devimg-gradient';
const DEFAULT_SEED = 'Luna';
const PREVIEW_SIZE = 240;
const SEED_DEBOUNCE_MS = 400;

const styles = ref<StyleMeta[]>([]);
const selectedStyle = ref(DEFAULT_STYLE);
const seed = ref(DEFAULT_SEED);
/** 防抖后的 seed，避免输入时每个字符都请求 API */
const debouncedSeed = ref(DEFAULT_SEED);
const copied = ref(false);
const loading = ref(true);
const loadError = ref('');

let seedTimer: ReturnType<typeof setTimeout> | null = null;

const engineLabels: Record<string, string> = {
  native: '图即自研',
  partner: '开源接入（DiceBear）',
};

/**
 * 构建多风格头像 URL
 */
function buildAvatarUrl(style: string, seedValue: string, size = PREVIEW_SIZE): string {
  return `${API_BASE}/avatar/${encodeURIComponent(style)}/${encodeURIComponent(seedValue)}/${size}`;
}

const effectiveSeed = computed(() => debouncedSeed.value.trim() || DEFAULT_SEED);

const previewUrl = computed(() =>
  buildAvatarUrl(selectedStyle.value, effectiveSeed.value),
);

const apiUrl = computed(() =>
  buildAvatarUrl(selectedStyle.value, effectiveSeed.value, 128),
);

const htmlSnippet = computed(
  () =>
    `<img src="${apiUrl.value}" alt="${selectedStyle.value} avatar" width="128" height="128" />`,
);

const groupedByEngine = computed(() => {
  const map = new Map<string, StyleMeta[]>();
  for (const item of styles.value) {
    const list = map.get(item.engine) ?? [];
    list.push(item);
    map.set(item.engine, list);
  }
  return map;
});

/**
 * 随机 seed（类似 DiceBear 骰子按钮）
 */
function randomizeSeed(): void {
  const pool = ['Luna', 'Felix', 'Aneka', 'Milo', '张三', 'DevImage', '图即'];
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? 'Luna';
  seed.value = `${pick}-${Math.random().toString(36).slice(2, 6)}`;
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
    styles.value = [{ id: 'devimg-gradient', title: '渐变圆', group: 'gradient', engine: 'native', license: 'DevImage' }];
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

watch(selectedStyle, () => {
  copied.value = false;
});

onMounted(() => {
  debouncedSeed.value = seed.value.trim() || DEFAULT_SEED;
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
              v-for="[engine, items] in groupedByEngine"
              :key="engine"
              :label="engineLabels[engine] ?? engine"
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
        同一 <code>style</code> + <code>seed</code> 始终生成相同头像；点击左侧预览图可快速复制 URL。
        几何风格含
        <a href="/guide/avatar-licenses">自研与第三方许可说明</a>。
      </p>
    </div>
  </div>
</template>

<style scoped>
.avatar-playground {
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
  gap: 20px;
  margin: 24px 0;
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

@media (max-width: 768px) {
  .avatar-playground {
    grid-template-columns: 1fr;
  }
}
</style>
