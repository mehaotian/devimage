<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  apiUrl: string;
  htmlSnippet: string;
  copied?: boolean;
  hint?: string;
}>();

const emit = defineEmits<{
  copyPreview: [];
}>();

const copyLabel = ref('复制');

/**
 * 复制文本到剪贴板
 */
async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    copyLabel.value = '已复制';
    window.setTimeout(() => {
      copyLabel.value = '复制';
    }, 1600);
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div class="api-playground">
    <div class="api-playground__main">
      <div class="api-playground__panel api-playground__preview-col">
        <button
          type="button"
          class="api-playground__image-btn"
          title="点击复制 URL"
          @click="emit('copyPreview')"
        >
          <slot name="preview" />
          <span v-if="copied" class="api-playground__copied">已复制 URL</span>
        </button>
      </div>

      <div class="api-playground__panel api-playground__controls-col">
        <slot name="controls" />
      </div>
    </div>

    <div class="api-playground__refs">
      <div class="api-playground__ref-block">
        <div class="api-playground__ref-head">
          <span>HTTP API</span>
          <button type="button" class="api-playground__copy" @click="copyText(apiUrl)">
            {{ copyLabel }}
          </button>
        </div>
        <code class="api-playground__code">{{ apiUrl }}</code>
      </div>

      <div class="api-playground__ref-block">
        <div class="api-playground__ref-head">
          <span>HTML / 代码</span>
          <button type="button" class="api-playground__copy" @click="copyText(htmlSnippet)">
            {{ copyLabel }}
          </button>
        </div>
        <code class="api-playground__code">{{ htmlSnippet }}</code>
      </div>

      <p v-if="hint" class="api-playground__hint">{{ hint }}</p>
      <slot name="hint" />
    </div>
  </div>
</template>

<style scoped>
.api-playground {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 24px 0;
  min-width: 0;
}

.api-playground__main {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 20px;
  align-items: start;
}

.api-playground__panel {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
  min-width: 0;
}

.api-playground__preview-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.api-playground__controls-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.api-playground__image-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 120px;
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

.dark .api-playground__image-btn {
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

.api-playground__copied {
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

.api-playground__refs {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
}

.api-playground__ref-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.api-playground__ref-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.api-playground__copy {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  cursor: pointer;
}

.api-playground__code {
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

.api-playground__hint {
  margin: 0;
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .api-playground__main {
    grid-template-columns: 1fr;
  }
}
</style>
