<script setup lang="ts">
/**
 * 首页功能性图标（仅复制 / 已复制两种状态，不含装饰性图标）
 */
withDefaults(
  defineProps<{
    name: string;
    size?: number;
  }>(),
  { size: 16 },
);
</script>

<template>
  <!-- 复制 -->
  <svg
    v-if="name === 'icon-copy'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.6" />
    <path
      d="M6 16H5a2 2 0 01-2-2V5a2 2 0 012-2h9a2 2 0 012 2v1"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
    />
  </svg>

  <!-- 已复制 -->
  <svg
    v-else-if="name === 'icon-check'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 12.5l4.5 4.5L19 7"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
