<script setup lang="ts">
import { ref, computed } from 'vue';
import ApiPlaygroundShell from './ApiPlaygroundShell.vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

const types = [
  { id: 'page', label: '整页 page' },
  { id: 'card', label: '卡片 card' },
  { id: 'row', label: '列表行 row' },
  { id: 'grid', label: '网格 grid' },
] as const;

const type = ref<(typeof types)[number]['id']>('card');
const theme = ref<'light' | 'dark'>('light');
const w = ref(350);
const h = ref(120);
const cols = ref(3);
const animate = ref(false);
const copied = ref(false);

const apiUrl = computed(() => {
  const params = new URLSearchParams({
    type: type.value,
    theme: theme.value,
  });
  if (type.value === 'grid') {
    params.set('cols', String(cols.value));
  }
  if (animate.value) {
    params.set('animate', '1');
  }
  return `${API_BASE}/skeleton/${w.value}/${h.value}?${params.toString()}`;
});

const htmlSnippet = computed(
  () => `<img src="${apiUrl.value}" alt="skeleton" width="${w.value}" height="${h.value}" />`,
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
    hint="骨架屏适用于加载态占位；animate=1 启用 shimmer。"
    @copy-preview="copyPreview"
  >
    <template #preview>
      <img
        :src="apiUrl"
        alt="skeleton preview"
        :width="w"
        :height="h"
        style="max-width:100%;height:auto;border-radius:8px"
      />
    </template>
    <template #controls>
      <label class="pg-field">
        <span>布局 type</span>
        <select v-model="type" class="pg-input">
          <option v-for="item in types" :key="item.id" :value="item.id">{{ item.label }}</option>
        </select>
      </label>
      <label class="pg-field">
        <span>主题 theme</span>
        <select v-model="theme" class="pg-input">
          <option value="light">light</option>
          <option value="dark">dark</option>
        </select>
      </label>
      <label class="pg-field">
        <span>宽 w / 高 h</span>
        <div class="pg-row">
          <input v-model.number="w" type="number" min="10" max="4000" class="pg-input" />
          <input v-model.number="h" type="number" min="10" max="4000" class="pg-input" />
        </div>
      </label>
      <label v-if="type === 'grid'" class="pg-field">
        <span>列数 cols</span>
        <input v-model.number="cols" type="number" min="1" max="6" class="pg-input" />
      </label>
      <label class="pg-field pg-check">
        <input v-model="animate" type="checkbox" />
        <span>animate shimmer</span>
      </label>
    </template>
  </ApiPlaygroundShell>
</template>

<style scoped>
.pg-field { display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--vp-c-text-2); }
.pg-row { display:flex; gap:8px; }
.pg-check { flex-direction:row; align-items:center; gap:8px; }
.pg-input {
  flex:1; padding:8px 10px; border:1px solid var(--vp-c-divider);
  border-radius:8px; background:var(--vp-c-bg); color:var(--vp-c-text-1); font-size:13px;
}
</style>
