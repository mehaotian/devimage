<script setup lang="ts">
/**
 * 首页彩色 SVG 图标集
 */
withDefaults(
  defineProps<{
    name: string;
    size?: number;
  }>(),
  { size: 24 },
);
</script>

<template>
  <!-- stat: API 路由 -->
  <svg
    v-if="name === 'stat-link'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L10.5 6.5"
      stroke="#6366f1"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M14 11a5 5 0 00-7.07 0L5.52 12.41a5 5 0 007.07 7.07L13.5 17.5"
      stroke="#8b5cf6"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>

  <!-- stat: SVG 矢量 -->
  <svg
    v-else-if="name === 'stat-bolt'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
      fill="url(#bolt-grad)"
    />
    <defs>
      <linearGradient id="bolt-grad" x1="4" y1="2" x2="20" y2="22">
        <stop stop-color="#fbbf24" />
        <stop offset="1" stop-color="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>

  <!-- stat: SDK -->
  <svg
    v-else-if="name === 'stat-tools'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      stroke="url(#tools-grad)"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <defs>
      <linearGradient id="tools-grad" x1="2" y1="2" x2="22" y2="22">
        <stop stop-color="#64748b" />
        <stop offset="1" stop-color="#475569" />
      </linearGradient>
    </defs>
  </svg>

  <!-- stat: 免费额度 -->
  <svg
    v-else-if="name === 'stat-free'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="3" fill="url(#stat-free-bg)" />
    <text
      x="12"
      y="14.5"
      text-anchor="middle"
      fill="#fff"
      font-size="6"
      font-weight="800"
      font-family="system-ui,sans-serif"
      letter-spacing="0.5"
    >
      FREE
    </text>
    <defs>
      <linearGradient id="stat-free-bg" x1="3" y1="5" x2="21" y2="19">
        <stop stop-color="#3b82f6" />
        <stop offset="1" stop-color="#6366f1" />
      </linearGradient>
    </defs>
  </svg>

  <!-- highlight: 丰富 API -->
  <svg
    v-else-if="name === 'highlight-api'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
      fill="url(#box-grad)"
      opacity="0.2"
    />
    <path
      d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
      stroke="#3b82f6"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12 12l8.73 5.04M12 12L3.27 6.96"
      stroke="#6366f1"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <defs>
      <linearGradient id="box-grad" x1="3" y1="2" x2="21" y2="22">
        <stop stop-color="#3b82f6" />
        <stop offset="1" stop-color="#6366f1" />
      </linearGradient>
    </defs>
  </svg>

  <!-- highlight: 轻量响应 -->
  <svg
    v-else-if="name === 'highlight-fast'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" fill="#dcfce7" />
    <path
      d="M13 7l-5 7h4l-1 5 6-8h-4l0-4z"
      fill="url(#fast-grad)"
    />
    <defs>
      <linearGradient id="fast-grad" x1="8" y1="7" x2="16" y2="19">
        <stop stop-color="#22c55e" />
        <stop offset="1" stop-color="#16a34a" />
      </linearGradient>
    </defs>
  </svg>

  <!-- highlight: 开发可用 -->
  <svg
    v-else-if="name === 'highlight-check'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" fill="#ede9fe" />
    <path
      d="M8 12.5l2.5 2.5L16 9"
      stroke="url(#check-grad)"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <defs>
      <linearGradient id="check-grad" x1="8" y1="9" x2="16" y2="15">
        <stop stop-color="#8b5cf6" />
        <stop offset="1" stop-color="#6366f1" />
      </linearGradient>
    </defs>
  </svg>

  <!-- highlight: 简单易用 -->
  <svg
    v-else-if="name === 'highlight-clipboard'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="5" y="4" width="14" height="17" rx="2" fill="#ffedd5" />
    <rect x="8" y="2" width="8" height="4" rx="1" fill="url(#clip-grad)" />
    <path d="M9 10h6M9 14h6M9 18h4" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" />
    <defs>
      <linearGradient id="clip-grad" x1="8" y1="2" x2="16" y2="6">
        <stop stop-color="#fb923c" />
        <stop offset="1" stop-color="#f97316" />
      </linearGradient>
    </defs>
  </svg>

  <!-- resource: 占位图 -->
  <svg
    v-else-if="name === 'res-placeholder'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5" />
    <circle cx="8.5" cy="10" r="2" fill="#818cf8" />
    <path d="M3 16l5-4 3 3 4-5 6 6" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <!-- resource: Seed -->
  <svg
    v-else-if="name === 'res-seed'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" stroke="#e2e8f0" stroke-width="1.5" />
    <circle cx="12" cy="12" r="5" stroke="#6366f1" stroke-width="1.5" />
    <circle cx="12" cy="12" r="1.5" fill="#ef4444" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
  </svg>

  <!-- resource: 头像 -->
  <svg
    v-else-if="name === 'res-avatar'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" fill="url(#avatar-grad)" />
    <circle cx="12" cy="9" r="3" fill="#fff" opacity="0.9" />
    <path d="M6 19c0-3.3 2.7-5 6-5s6 1.7 6 5" fill="#fff" opacity="0.9" />
    <defs>
      <linearGradient id="avatar-grad" x1="3" y1="3" x2="21" y2="21">
        <stop stop-color="#6366f1" />
        <stop offset="1" stop-color="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>

  <!-- resource: 场景 -->
  <svg
    v-else-if="name === 'res-scene'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M4 7h7v7H4z" fill="#818cf8" rx="1" />
    <path d="M13 4h7v4h-7z" fill="#22d3ee" />
    <path d="M13 10h7v10h-7z" fill="#a78bfa" />
    <path d="M4 16h7v4H4z" fill="#6366f1" />
  </svg>

  <!-- resource: Mock 用户 -->
  <svg
    v-else-if="name === 'res-users'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="9" cy="8" r="3" fill="#6366f1" />
    <circle cx="16" cy="9" r="2.5" fill="#8b5cf6" />
    <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" />
    <path d="M16 14c2.5 0 5 1.2 5 5" stroke="#8b5cf6" stroke-width="1.5" stroke-linecap="round" />
  </svg>

  <!-- resource: Mock 文章 -->
  <svg
    v-else-if="name === 'res-posts'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="4" y="3" width="16" height="18" rx="2" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" />
  </svg>

  <!-- resource: Mock 商品 -->
  <svg
    v-else-if="name === 'res-products'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M6 6h15l-1.5 9h-12L6 6z" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round" />
    <circle cx="9" cy="20" r="1.5" fill="#f59e0b" />
    <circle cx="18" cy="20" r="1.5" fill="#f59e0b" />
    <path d="M6 6L5 3H2" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round" />
  </svg>

  <!-- resource: 404 -->
  <svg
    v-else-if="name === 'res-404'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5" />
    <text x="12" y="15" text-anchor="middle" fill="#ef4444" font-size="7" font-weight="700" font-family="system-ui,sans-serif">404</text>
  </svg>

  <!-- deco: 图片 -->
  <svg
    v-else-if="name === 'deco-image'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="16" rx="3" fill="url(#deco-img-grad)" />
    <circle cx="8" cy="10" r="2" fill="#fff" opacity="0.8" />
    <path d="M2 16l6-5 4 4 3-3 7 6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.9" />
    <defs>
      <linearGradient id="deco-img-grad" x1="2" y1="4" x2="22" y2="20">
        <stop stop-color="#6366f1" />
        <stop offset="1" stop-color="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>

  <!-- deco: 代码 -->
  <svg
    v-else-if="name === 'deco-code'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="2" y="4" width="20" height="16" rx="3" fill="#0f172a" />
    <path d="M8 10l-3 2 3 2M16 10l3 2-3 2M13 8l-2 8" stroke="#22d3ee" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <!-- deco: 头像 -->
  <svg
    v-else-if="name === 'deco-avatar'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" fill="url(#deco-av-grad)" />
    <text x="12" y="16" text-anchor="middle" fill="#fff" font-size="10" font-weight="600" font-family="system-ui,sans-serif">A</text>
    <defs>
      <linearGradient id="deco-av-grad" x1="2" y1="2" x2="22" y2="22">
        <stop stop-color="#8b5cf6" />
        <stop offset="1" stop-color="#6366f1" />
      </linearGradient>
    </defs>
  </svg>

  <!-- 按钮: 闪电 -->
  <svg
    v-else-if="name === 'icon-bolt'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="#fff" />
  </svg>

  <!-- 复制 -->
  <svg
    v-else-if="name === 'icon-copy'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="8" y="8" width="12" height="12" rx="2" stroke="#94a3b8" stroke-width="1.5" />
    <path d="M6 16H5a2 2 0 01-2-2V5a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
  </svg>

  <!-- 勾选（小） -->
  <svg
    v-else-if="name === 'icon-check-sm'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
    <path
      d="M8 12l3 3 5-6"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <!-- 勾选 -->
  <svg
    v-else-if="name === 'icon-check'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M6 12l4 4 8-8" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

  <!-- 火箭 CTA -->
  <svg
    v-else-if="name === 'icon-rocket'"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M12 2c0 0-5 3-5 9v4l-2 2v2h14v-2l-2-2v-4c0-6-5-9-5-9z" fill="url(#rocket-grad)" />
    <circle cx="12" cy="10" r="2" fill="#fff" opacity="0.9" />
    <path d="M9 22h6M10 18h4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.8" />
    <path d="M5 14l-2 2M19 14l2 2" stroke="#fcd34d" stroke-width="1.5" stroke-linecap="round" />
    <defs>
      <linearGradient id="rocket-grad" x1="7" y1="2" x2="17" y2="17">
        <stop stop-color="#fff" />
        <stop offset="1" stop-color="#e0e7ff" />
      </linearGradient>
    </defs>
  </svg>
</template>
