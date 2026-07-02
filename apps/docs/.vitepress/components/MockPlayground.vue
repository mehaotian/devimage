<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import ApiPlaygroundShell from './ApiPlaygroundShell.vue';

const API_BASE =
  typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3000';

const resources = [
  { id: 'users', label: '用户 /mock/users' },
  { id: 'posts', label: '文章 /mock/posts' },
  { id: 'products', label: '商品 /mock/products' },
] as const;

const resource = ref<(typeof resources)[number]['id']>('users');
const count = ref(3);
const userId = ref(1);
const useSingle = ref(false);
const jsonPreview = ref('');
const loading = ref(false);
const error = ref('');
const copied = ref(false);

let timer: ReturnType<typeof setTimeout> | null = null;

const apiUrl = computed(() => {
  if (useSingle.value && resource.value === 'users') {
    return `${API_BASE}/mock/users/${userId.value}`;
  }
  return `${API_BASE}/mock/${resource.value}?count=${count.value}`;
});

const htmlSnippet = computed(
  () => `const data = await fetch('${apiUrl.value}').then(r => r.json());`,
);

/**
 * 拉取 Mock JSON 预览
 */
async function fetchPreview(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch(apiUrl.value);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    jsonPreview.value = JSON.stringify(data, null, 2);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '请求失败';
    jsonPreview.value = '';
  } finally {
    loading.value = false;
  }
}

watch([resource, count, userId, useSingle], () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void fetchPreview(); }, 400);
}, { immediate: true });

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
    @copy-preview="copyPreview"
  >
    <template #preview>
      <pre class="mock-json">{{ loading ? '加载中…' : jsonPreview || error || '{}' }}</pre>
    </template>
    <template #controls>
      <label class="pg-field">
        <span>资源</span>
        <select v-model="resource" class="pg-input">
          <option v-for="item in resources" :key="item.id" :value="item.id">{{ item.label }}</option>
        </select>
      </label>
      <label v-if="resource === 'users'" class="pg-check">
        <input v-model="useSingle" type="checkbox" />
        单条 GET /mock/users/:id
      </label>
      <label v-if="useSingle && resource === 'users'" class="pg-field">
        <span>用户 id（1–100）</span>
        <input v-model.number="userId" type="number" min="1" max="100" class="pg-input" />
      </label>
      <label v-else class="pg-field">
        <span>count（最大 100）</span>
        <input v-model.number="count" type="number" min="1" max="100" class="pg-input" />
      </label>
    </template>
    <template #hint>
      <p class="api-playground__hint">
        Mock 为 JSON 接口，请勿高频轮询；开发阶段可缓存响应。详见
        <a href="/guide/fair-use">使用规范</a>。
      </p>
    </template>
  </ApiPlaygroundShell>
</template>

<style scoped>
.pg-field { display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--vp-c-text-2); }
.pg-input {
  padding:8px 10px; border:1px solid var(--vp-c-divider);
  border-radius:8px; background:var(--vp-c-bg); color:var(--vp-c-text-1); font-size:13px;
}
.pg-check { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--vp-c-text-2); }
.mock-json {
  width:100%; max-height:280px; overflow:auto; margin:0; padding:12px;
  font-size:11px; line-height:1.5; text-align:left;
  background:var(--vp-c-bg); border-radius:8px; color:var(--vp-c-text-1);
}
</style>
