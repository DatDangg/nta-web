'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { HomeContent } from '@/content/home';

const HERO_SRC = '/images/home/hero-banner.jpg';

type HeroPanels = HomeContent['heroPanels'];

// Panel kính chung: nền trắng mờ + blur + viền sáng + bóng nhẹ (khớp ảnh mẫu ảnh 2).
const GLASS =
  'absolute rounded-xl border border-white/70 bg-white/85 shadow-lg backdrop-blur-sm';

type ListPanelProps = {
  className: string;
  icon: React.ReactNode;
  itemIcon: 'dot' | 'check';
  items: string[];
  title: string;
};

// Panel danh sách (Trí tuệ nhân tạo / Quản trị doanh nghiệp / Ứng dụng di động).
function ListPanel({ className, icon, itemIcon, items, title }: ListPanelProps) {
  return (
    <div className={`${GLASS} ${className} p-3`}>
      <p className="flex items-center gap-1.5 text-[13px] font-semibold leading-tight">
        <span aria-hidden className="shrink-0 text-primary">{icon}</span>
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-[11px] leading-tight">
            {itemIcon === 'check' ? (
              <svg aria-hidden className="h-3 w-3 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            ) : (
              <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-primary" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Panel AI + biểu đồ cột (cột phụ dùng `bg-primary opacity-40` —
// `bg-primary/40` KHÔNG sinh CSS vì color là var() thiếu <alpha-value>).
function ChartPanel({ className, subtitle, title }: { className: string; subtitle: string; title: string }) {
  return (
    <div className={`${GLASS} ${className} p-3`}>
      <p className="text-2xl font-bold leading-none text-text-primary">{title}</p>
      <p className="mt-1 text-[10px] text-text-secondary">{subtitle}</p>
      <div aria-hidden className="mt-2 flex h-12 items-end gap-1">
        {[38, 62, 48, 78, 92, 70].map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={`flex-1 rounded-sm bg-primary ${i === 4 ? '' : 'opacity-40'}`}
          />
        ))}
      </div>
    </div>
  );
}

// Panel hiệu suất: số liệu lớn + biểu đồ đường.
function StatPanel({ className, value }: { className: string; value: string }) {
  return (
    <div className={`${GLASS} ${className} p-3`}>
      <p className="text-2xl font-bold leading-none text-primary">{value}</p>
      <svg aria-hidden viewBox="0 0 100 36" className="mt-1 w-full text-primary">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points="0,30 18,22 36,26 54,14 72,18 100,4"
        />
        <path d="M96 4h6v6" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const ICON_CLASS = 'h-4 w-4';
const iconProps = {
  'aria-hidden': true,
  className: ICON_CLASS,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  viewBox: '0 0 24 24',
} as const;

function ListIconGrid() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}

function ListIconPhone() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

function ListIconBrain() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75A3.75 3.75 0 0 0 6 7.5c-1.03.2-1.9 1-2.3 2.1-.4 1.1-.2 2.3.5 3.2-.7.8-1 1.9-.7 3 .3 1 1.1 1.8 2.1 2.1.3 1.3 1.4 2.4 2.9 2.4 1 0 1.9-.4 2.5-1.1m-5.9-15A3.75 3.75 0 0 1 18 7.5c1.03.2 1.9 1 2.3 2.1.4 1.1.2 2.3-.5 3.2.7.8 1 1.9.7 3-.3 1-1.1 1.8-2.1 2.1-.3 1.3-1.4 2.4-2.9 2.4-1 0-1.9-.4-2.5-1.1" />
    </svg>
  );
}

type HeroVisualProps = {
  panels: HeroPanels;
  imageAlt: string;
};

export function HeroVisual({ panels, imageAlt }: HeroVisualProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Fallback giữ tỉ lệ khung (khớp aspect 6/5), không sập layout.
    return <div aria-label={imageAlt} className="aspect-[6/5] w-full" role="img" />;
  }

  return (
    // Crop 2:1 → 6/5 (1.2:1) tập trung vào robot + panel, bỏ phần thành phố bên trái
    // (giống ảnh mẫu ảnh 2: phần ảnh gần vuông, robot lớn giữa khung).
    // `overflow-hidden` + `object-cover` cắt mềm; `object-[70%_50%]` giữ robot lệch phải.
    <div className="relative aspect-[6/5] w-full overflow-hidden">
      <Image
        alt={imageAlt}
        className="object-cover object-[70%_50%]"
        fill
        onError={() => setFailed(true)}
        priority
        sizes="(min-width: 768px) 60vw, 100vw"
        src={HERO_SRC}
      />

      {/* Lớp phủ sáng mờ dịu hologram baked-in trong ảnh 1, nâng ảnh theo phong cách ảnh 2.
          Gradient trái→phải: trái (nơi panel) sáng hơn. */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-white/55 via-white/20 to-white/5" />

      {/* 5 panel kính nổi + wordmark NTA — CHỈ desktop (lg+), decorative (aria-hidden).
          Vị trí là % của khung ảnh (tương đối), tinh chỉnh theo ảnh mẫu ảnh 2. */}
      <div aria-hidden className="absolute inset-0 hidden text-text-primary lg:block">
        <ListPanel
          className="left-[6%] top-[10%] w-[27%]"
          icon={<ListIconBrain />}
          itemIcon="dot"
          items={panels.ai.items}
          title={panels.ai.title}
        />
        <ChartPanel className="left-[38%] top-[7%] w-[30%]" subtitle={panels.chart.subtitle} title={panels.chart.title} />
        <ListPanel
          className="left-[5%] top-[47%] w-[27%]"
          icon={<ListIconGrid />}
          itemIcon="check"
          items={panels.management.items}
          title={panels.management.title}
        />
        <StatPanel className="left-[71%] top-[26%] w-[25%]" value={panels.performance.value} />
        <ListPanel
          className="left-[70%] top-[54%] w-[28%]"
          icon={<ListIconPhone />}
          itemIcon="dot"
          items={panels.apps.items}
          title={panels.apps.title}
        />

        {/* Wordmark NTA trên đế robot (giữa) */}
        <p className="absolute left-1/2 top-[54%] -translate-x-1/2 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_6px_rgb(0_0_0/0.45)]">
          {panels.wordmark}
        </p>
      </div>
    </div>
  );
}
