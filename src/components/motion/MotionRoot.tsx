'use client';

import { useEffect } from 'react';
import {
  AUTO_MOTION_SELECTOR,
  MOTION_DURATION_MS,
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
        entering.forEach((el, index) => {
          io.unobserve(el);
          reveal(el, index);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 },
    );

    const scan = () => {
      main.querySelectorAll(AUTO_MOTION_SELECTOR).forEach((el) => {
        if (observed.has(el) || el.hasAttribute('data-inview')) return;
        observed.add(el);
        io.observe(el);
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
