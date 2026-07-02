<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = withDefaults(
  defineProps<{
    src: string;
    alt: string;
    size?: number;
  }>(),
  { size: 72 },
);

const root = ref<HTMLElement | null>(null);
const visible = ref(false);
let observer: IntersectionObserver | null = null;

/**
 * 进入视口后再加载缩略图，避免画廊一次性打满 API
 */
onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        visible.value = true;
        observer?.disconnect();
      }
    },
    { rootMargin: '160px' },
  );
  if (root.value) {
    observer.observe(root.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <div
    ref="root"
    class="lazy-gallery-img"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img
      v-if="visible"
      :src="src"
      :alt="alt"
      :width="size"
      :height="size"
      loading="lazy"
      decoding="async"
      class="lazy-gallery-img__img"
    />
    <div v-else class="lazy-gallery-img__ph" aria-hidden="true" />
  </div>
</template>

<style scoped>
.lazy-gallery-img {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lazy-gallery-img__img {
  border-radius: 6px;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lazy-gallery-img__ph {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background: color-mix(in srgb, var(--vp-c-divider) 55%, var(--vp-c-bg-soft));
}
</style>
