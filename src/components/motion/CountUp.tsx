'use client';

import { useEffect, useRef } from 'react';

type Parsed = {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  decimalSep: string;
  groupSep: string;
};

/**
 * Tách "+86%", "2.000+", "3,5x", "40%" … thành tiền tố / số / hậu tố, giữ đúng dấu phân cách gốc.
 * - `^\d{1,3}([.,]\d{3})+$` → dấu là phân cách hàng nghìn (vd "2.000" kiểu VI = 2000).
 * - còn lại một dấu `.`/`,` → dấu thập phân.
 */
function parse(value: string): Parsed | null {
  const match = value.match(/^(\D*?)(\d[\d.,]*\d|\d)(\D.*)?$/);
  if (!match) return null;
  const [, prefix, raw, suffix = ''] = match;
  const grouped = raw.match(/^\d{1,3}([.,])\d{3}(\1\d{3})*$/);
  if (grouped) {
    return { prefix, suffix, target: Number(raw.replace(/[.,]/g, '')), decimals: 0, decimalSep: '', groupSep: grouped[1] };
  }
  const decimal = raw.match(/^(\d+)([.,])(\d+)$/);
  if (decimal) {
    return { prefix, suffix, target: Number(`${decimal[1]}.${decimal[3]}`), decimals: decimal[3].length, decimalSep: decimal[2], groupSep: '' };
  }
  if (/^\d+$/.test(raw)) return { prefix, suffix, target: Number(raw), decimals: 0, decimalSep: '', groupSep: '' };
  return null;
}

function format(n: number, p: Parsed) {
  const [int, frac] = n.toFixed(p.decimals).split('.');
  const grouped = p.groupSep ? int.replace(/\B(?=(\d{3})+(?!\d))/g, p.groupSep) : int;
  return `${p.prefix}${grouped}${frac ? p.decimalSep + frac : ''}${p.suffix}`;
}

/**
 * Số liệu đếm lên khi cuộn tới (counter của trang tham chiếu Helpdesk).
 * SSR/không JS/reduced-motion → hiện đúng giá trị cuối. Trình đọc màn hình đọc bản `sr-only`
 * (giá trị cuối), bản đang chạy số là `aria-hidden`.
 */
export function CountUp({ value, duration = 1800, className = '' }: { value: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parsed = parse(value);
    if (!el || !parsed || parsed.target === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    let frame = 0;
    el.textContent = format(0, parsed);
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
        el.textContent = format(parsed.target * eased, parsed);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        io.disconnect();
        run();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [value, duration]);

  return (
    <span className={className}>
      <span aria-hidden="true" className="tabular-nums" ref={ref}>{value}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
