'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';

const RADIUS = 20;
const CIRC = 2 * Math.PI * RADIUS;

/**
 * Nút "lên đầu trang" nổi góc phải (trang tham chiếu có `trx_addons_scroll_to_top`),
 * kèm vòng tiến độ cuộn. Hiện sau khi cuộn quá 600px.
 */
export function ScrollTopButton() {
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      setVisible(window.scrollY > 600);
      ringRef.current?.setAttribute('stroke-dashoffset', String(CIRC * (1 - progress)));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  return (
    <button
      aria-label={locale === 'vi' ? 'Lên đầu trang' : 'Back to top'}
      className={`group fixed bottom-5 right-5 z-sticky flex size-12 items-center justify-center rounded-full bg-surface text-primary-active shadow-md transition-[opacity,transform,box-shadow] duration-slow ease-out-expo hover:shadow-lg md:bottom-8 md:right-8 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      onClick={toTop}
      tabIndex={visible ? 0 : -1}
      type="button"
    >
      <svg aria-hidden="true" className="absolute inset-0 size-12 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" fill="none" r={RADIUS} stroke="var(--color-border)" strokeWidth="2" />
        <circle cx="24" cy="24" fill="none" r={RADIUS} ref={ringRef} stroke="var(--color-primary)" strokeDasharray={CIRC} strokeDashoffset={CIRC} strokeLinecap="round" strokeWidth="2" />
      </svg>
      <svg aria-hidden="true" className="relative size-5 transition-transform duration-base ease-out-expo group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}
