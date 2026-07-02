<script setup lang="ts">
import { ref, computed } from 'vue';
import ApiPlaygroundShell from './ApiPlaygroundShell.vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

const variants = [
  { id: '404', label: '404 页面不存在' },
  { id: 'empty', label: '空状态' },
  { id: 'network', label: '网络错误' },
  { id: 'search', label: '搜索无结果' },
] as const;

const variant = ref<(typeof variants)[number]['id']>('404');
const w = ref(480);
const h = ref(320);
const copied = ref(false);

const apiUrl = computed(() => {
  const params = new URLSearchParams({ w: String(w.value), h: String(h.value) });
  return `${API_BASE}/scene/${variant.value}?${params.toString()}`;
});

const htmlSnippet = computed(
  () => `<img src="${apiUrl.value}" alt="scene ${variant.value}" width="${w.value}" height="${h.value}" />`,
);

async function copyPreview(): Promise<void> {
  try {
    await navigator.clipboard.writeText(apiUrl.value);
    copied.value = true;
    window.setTimeout(() => { copied.value = false; }, 1600);
  } catch { /* ignore */ }
}
</script>

<template>
  <ApiPlaygroundShell
    :api-url="apiUrl"
    :html-snippet="htmlSnippet"
    :copied="copied"
    hint="场景插画适用于 404、空状态等 UI。快捷路由 /404 等价 /scene/404。"
    @copy-preview="copyPreview"
  >
    <template #preview>
      <img
        :src="apiUrl"
        :alt="variant"
        :width="w"
        :height="h"
        style="max-width:100%;height:auto;border-radius:8px"
      />
    </template>
    <template #controls>
      <label class="pg-field">
        <span>场景 variant</span>
        <select v-model="variant" class="pg-input">
          <option v-for="item in variants" :key="item.id" :value="item.id">{{ item.label }}</option>
        </select>
      </label>
      <label class="pg-field">
        <span>宽 w / 高 h</span>
        <div class="pg-row">
          <input v-model.number="w" type="number" min="10" max="4000" class="pg-input" />
          <input v-model.number="h" type="number" min="10" max="4000" class="pg-input" />
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
</style>
