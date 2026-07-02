import { onMounted, onUnmounted, type Ref } from 'vue';

/**
 * 为首页区块绑定 IntersectionObserver，进入视口时添加 reveal 类触发动画
 */
export function useReveal(rootRef: Ref<HTMLElement | null>): void {
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!rootRef.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    rootRef.value.querySelectorAll('.reveal').forEach((el) => {
      observer?.observe(el);
    });
  });

  onUnmounted(() => {
    observer?.disconnect();
  });
}
