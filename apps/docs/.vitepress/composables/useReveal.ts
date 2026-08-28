import { onMounted, onUnmounted, type Ref } from 'vue';

/**
 * 为区块绑定 IntersectionObserver，进入视口时加上 is-in 类。
 * 位移与时长都刻意压得很小，只做"内容到位"的提示，不做逐个错峰的入场表演。
 * 用户开启「减少动态效果」时直接标记为已到位，不播放动画。
 */
export function useReveal(rootRef: Ref<HTMLElement | null>): void {
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const root = rootRef.value;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    // 加上标记后 CSS 才会把目标设为初始隐藏，脚本未执行时内容照常显示
    root.classList.add('dh-anim');
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer?.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );

    targets.forEach((el) => observer?.observe(el));
  });

  onUnmounted(() => {
    observer?.disconnect();
    observer = null;
  });
}
