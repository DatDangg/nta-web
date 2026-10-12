'use client';

import { useEffect } from 'react';
import {
  AUTO_MOTION_SELECTOR,
  MOTION_DURATION_MS,
  MOTION_IMAGE_WAIT_MS,
  MOTION_MAX_STAGGER_STEPS,
  MOTION_STAGGER_MS,
} from '@/lib/motion/auto-motion';

/**
 * Bộ điều phối auto-motion toàn site (gắn 1 lần ở layout, không render gì).
 *
 * - Quét `#main` theo `AUTO_MOTION_SELECTOR`, quan sát bằng IntersectionObserver.
 * - Các phần tử cùng vào viewport trong 1 lượt được xếp theo thứ tự DOM và trễ dần
 *   (`--motion-delay`, giống "batch" của GSAP ScrollTrigger ở trang tham chiếu).
 * - MutationObserver bắt nội dung mới (đổi route client-side, lọc blog/case study, …).
 * - Dùng thuộc tính `data-*` + CSS custom property — React không quản lý nên không bị ghi đè khi re-render.
 * - Cụm có ảnh: CHỜ ảnh tải xong (tối đa `MOTION_IMAGE_WAIT_MS`) rồi cả cụm mới xuất hiện cùng nhịp —
 *   tránh fade-in một khung trống rồi ảnh mới "bật" ra sau (cảm giác ảnh tải chậm).
 * - Tải trước: ảnh lazy nằm trong ~1 màn hình phía dưới được chuyển sang `eager` để kịp tải
 *   trước khi người dùng cuộn tới (Safari/Firefox có ngưỡng lazy-load hẹp hơn Chrome).
 */
export function MotionRoot() {
  useEffect(() => {
    const html = document.documentElement;
    const main = document.getElementById('main');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!main || reduced || !('IntersectionObserver' in window)) {
      html.classList.add('motion-off');
      return;
    }
    html.classList.add('motion-ready');

    const observed = new WeakSet<Element>();
    const timers = new Set<number>();
    let disposed = false;

    const imagesOf = (el: Element): HTMLImageElement[] =>
      el instanceof HTMLImageElement ? [el] : Array.from(el.querySelectorAll('img'));

    const whenLoaded = (img: HTMLImageElement) =>
      new Promise<void>((resolve) => {
        if (img.complete) return resolve();
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      });

    // Tải trước ảnh lazy sắp vào viewport (1 màn hình phía dưới).
    const preload = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          preload.unobserve(entry.target);
          imagesOf(entry.target).forEach((img) => {
            if (img.loading === 'lazy') img.loading = 'eager';
          });
        });
      },
      { rootMargin: '0px 0px 100% 0px', threshold: 0 },
    );

    const reveal = (el: HTMLElement, index: number) => {
      const delay = Math.min(index, MOTION_MAX_STAGGER_STEPS) * MOTION_STAGGER_MS;
      el.style.setProperty('--motion-delay', `${delay}ms`);
      el.setAttribute('data-inview', '');
      const timer = window.setTimeout(() => {
        el.setAttribute('data-motion-done', '');
        el.style.removeProperty('--motion-delay');
        timers.delete(timer);
      }, delay + MOTION_DURATION_MS + 100);
      timers.add(timer);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        if (!entering.length) return;
        entering.forEach((el) => io.unobserve(el));

        const pending = entering.flatMap(imagesOf).filter((img) => !img.complete);
        if (!pending.length) {
          entering.forEach((el, index) => reveal(el, index));
          return;
        }

        // Cả cụm (tiêu đề + chữ + ảnh) chờ ảnh rồi xuất hiện cùng lúc, giữ nguyên thứ tự stagger.
        let started = false;
        const start = () => {
          if (started || disposed) return;
          started = true;
          window.clearTimeout(cap);
          timers.delete(cap);
          entering.forEach((el, index) => reveal(el, index));
        };
        const cap = window.setTimeout(start, MOTION_IMAGE_WAIT_MS);
        timers.add(cap);
        void Promise.all(pending.map(whenLoaded)).then(start);
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );

    const scan = () => {
      main.querySelectorAll(AUTO_MOTION_SELECTOR).forEach((el) => {
        if (observed.has(el) || el.hasAttribute('data-inview')) return;
        observed.add(el);
        io.observe(el);
        if (el.querySelector('img') || el instanceof HTMLImageElement) preload.observe(el);
      });
    };

    let frame = 0;
    const scheduleScan = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    };

    // Quét lần đầu khi trình duyệt rảnh (tối đa 250ms): các vùng Suspense/streaming có thể hydrate
    // SAU effect này — gắn `data-*` vào DOM chưa hydrate sẽ gây cảnh báo hydration mismatch.
    const mo = new MutationObserver(scheduleScan);
    const start = () => {
      scan();
      mo.observe(main, { childList: true, subtree: true });
    };
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const startId = hasIdle ? window.requestIdleCallback(start, { timeout: 250 }) : window.setTimeout(start, 120);

    return () => {
      disposed = true;
      preload.disconnect();
      if (hasIdle) window.cancelIdleCallback(startId);
      else window.clearTimeout(startId);
      io.disconnect();
      mo.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return null;
}
