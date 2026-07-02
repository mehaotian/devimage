<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import ApiPlaygroundShell from './ApiPlaygroundShell.vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

const width = ref(800);
const height = ref(600);
const text = ref('');
const bg = ref('');
const fg = ref('');
const useSeed = ref(false);
const seed = ref('demo');
const copied = ref(false);

const debounced = ref({ w: 800, h: 600, text: '', bg: '', fg: '', seed: 'demo', useSeed: false });
let timer: ReturnType<typeof setTimeout> | null = null;

watch([width, height, text, bg, fg, seed, useSeed], () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    debounced.value = {
      w: width.value,
      h: height.value,
      text: text.value,
      bg: bg.value,
      fg: fg.value,
      seed: seed.value,
      useSeed: useSeed.value,
    };
  }, 400);
}, { immediate: true });

/**
 * 构建占位图 URL
 */
function buildUrl(): string {
  const d = debounced.value;
  const params = new URLSearchParams();
  if (d.text) params.set('text', d.text);
  if (d.bg) params.set('bg', d.bg.replace(/^#/, ''));
  if (d.fg) params.set('fg', d.fg.replace(/^#/, ''));
  const qs = params.toString();
  const base = d.useSeed
    ? `${API_BASE}/seed/${encodeURIComponent(d.seed)}/${d.w}/${d.h}`
    : `${API_BASE}/${d.w}/${d.h}`;
  return qs ? `${base}?${qs}` : base;
}

const apiUrl = computed(() => buildUrl());
const htmlSnippet = computed(
  () => `<img src="${apiUrl.value}" alt="placeholder" width="${debounced.value.w}" height="${debounced.value.h}" />`,
);

function randomizeSeed(): void {
  seed.value = `seed-${Math.random().toString(36).slice(2, 8)}`;
}

async function copyPreview(): Promise<void> {
  try {
    await navigator.clipboard.writeText(apiUrl.value);
    copied.value = true;
    window.setTimeout(() => { copied.value = false; }, 1600);
  } catch { /* ignore */ }
}

onUnmounted(() => { if (timer) clearTimeout(timer); });
</script>

<template>
  <ApiPlaygroundShell
    :api-url="apiUrl"
    :html-snippet="htmlSnippet"
    :copied="copied"
    hint="推荐浏览器直连 URL；固定 seed 适合 UI 回归。详见使用规范。"
    @copy-preview="copyPreview"
  >
    <template #preview>
      <img
        :src="apiUrl"
        :alt="`${debounced.w}×${debounced.h}`"
        :width="Math.min(debounced.w, 480)"
        :height="Math.min(debounced.h, 360)"
        style="max-width:100%;height:auto;border-radius:8px"
      />
    </template>
    <template #controls>
      <label class="pg-field">
        <span>宽 × 高</span>
        <div class="pg-row">
          <input v-model.number="width" type="number" min="10" max="4000" class="pg-input" />
          <input v-model.number="height" type="number" min="10" max="4000" class="pg-input" />
        </div>
      </label>
      <label class="pg-field">
        <span>文字 text</span>
        <input v-model="text" type="text" class="pg-input" placeholder="默认 宽×高" maxlength="50" />
      </label>
      <label class="pg-field">
        <span>背景 bg / 文字 fg（hex 不含 #）</span>
        <div class="pg-row">
          <input v-model="bg" type="text" class="pg-input" placeholder="6366f1" />
          <input v-model="fg" type="text" class="pg-input" placeholder="ffffff" />
        </div>
      </label>
      <label class="pg-check">
        <input v-model="useSeed" type="checkbox" />
        固定 seed（/seed/:seed/:w/:h）
      </label>
      <label v-if="useSeed" class="pg-field">
        <span>Seed</span>
        <div class="pg-row">
          <input v-model="seed" type="text" class="pg-input" />
          <button type="button" class="pg-btn" @click="randomizeSeed">🎲</button>
        </div>
      </label>
    </template>
  </ApiPlaygroundShell>
</template>

<style scoped>
.pg-field { display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--vp-c-text-2); }
.pg-row { display:flex; gap:8px; }
.pg-input {
  flex:1; padding:8px 10px; border:1px solid var(--vp-c-divider);
  border-radius:8px; background:var(--vp-c-bg); color:var(--vp-c-text-1); font-size:13px;
}
.pg-btn { width:40px; border:1px solid var(--vp-c-divider); border-radius:8px; background:var(--vp-c-bg); cursor:pointer; }
.pg-check { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--vp-c-text-2); }
</style>
