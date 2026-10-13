'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

/**
 * Sai số (px) khi xét strip đã ở đầu/cuối. Strip có padding chừa chỗ cho focus ring nên snap có thể
 * dừng lệch vài px (vd mobile `scrollLeft = 4` ở thẻ đầu) — dưới ngưỡng này coi như đã chạm mép.
 */
const SCROLL_EDGE_TOLERANCE = 8;

/**
 * Logic dải thẻ cuộn ngang có nút ←/→ (khối Sản phẩm + Case study trang chủ, CR-016):
 * trạng thái disable nút, cuộn đúng 1 thẻ, và phím ←/→ khi strip đang focus.
 */
export function useScrollButtons() {
  const stripRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ canPrev: false, canNext: false });

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const update = () => {
      const maxScrollLeft = strip.scrollWidth - strip.clientWidth;
      setEdges({
        canPrev: strip.scrollLeft > SCROLL_EDGE_TOLERANCE,
        canNext: strip.scrollLeft < maxScrollLeft - SCROLL_EDGE_TOLERANCE,
      });
    };
    update();
    // Cần cả `scroll` (người dùng vuốt) lẫn `ResizeObserver` (đổi breakpoint làm strip hết/bắt đầu tràn).
    strip.addEventListener('scroll', update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(strip);
    return () => {
      strip.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, []);

  // Cuộn đúng 1 thẻ (+ khoảng gap) để snap không kéo về thẻ cũ.
  const scrollStrip = useCallback((direction: -1 | 1) => {
    const strip = stripRef.current;
    const firstCard = strip?.firstElementChild;
    if (!strip || !(firstCard instanceof HTMLElement)) return;
    const gap = Number.parseFloat(getComputedStyle(strip).columnGap) || 0;
    strip.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: 'smooth' });
  }, []);

  const handleStripKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollStrip(1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollStrip(-1);
      }
    },
    [scrollStrip],
  );

  return { stripRef, canPrev: edges.canPrev, canNext: edges.canNext, scrollStrip, handleStripKeyDown };
}

/**
 * Class dải cuộn dùng chung. `px-2/pt-2` (+ `-mx-2`) chừa chỗ cho focus ring của thẻ — `overflow-x-auto`
 * cắt cả 2 trục; `scroll-px-2` để snap-start dừng đúng mép padding (scrollLeft = 0 ở thẻ đầu).
 */
export const scrollStripClass =
  '-mx-2 flex snap-x snap-mandatory scroll-px-2 gap-4 overflow-x-auto overscroll-x-contain px-2 pb-4 pt-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus md:gap-6';
