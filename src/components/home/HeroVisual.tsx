import Image from 'next/image';
import { CountUp } from '@/components/motion/CountUp';
import type { CSSProperties, ReactNode } from 'react';
import type { HomeContent } from '@/content/home';

const HERO_SRC = '/images/home/hero-bg.webp';

/** Độ trễ cho hiệu ứng bật-lên + trôi nhẹ của panel kính (`.hero-pop` trong globals.css). */
const popDelay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

type HeroPanels = HomeContent['heroPanels'];

/*
 * Hero dùng TOÀN BỘ ảnh hero-bg (1916×821) làm nền full-bleed (kích thước khung: xem `HeroBackground`).
 *
 * Khung ảnh luôn giữ đúng tỉ lệ ảnh gốc nên robot + khối NTA luôn ở cùng vị trí tương đối trong khung, và các panel
 * kính đặt bằng % của hộp panel (trong khung) khớp đúng lên ảnh ở mọi bề rộng màn hình.
 *
 * Cỡ chữ/padding trong panel dùng đơn vị `cqw` (container query) theo bề rộng hộp panel, để panel co
 * giãn cùng ảnh thay vì vỡ chữ.
 */

// Panel kính chung: nền trắng mờ + blur + viền sáng + bóng nhẹ.
const GLASS =
  'absolute rounded-[0.9cqw] border border-white/80 bg-white/80 p-[0.85cqw] shadow-[0_0.6cqw_2cqw_rgb(15_60_70/0.12)] backdrop-blur-md';

const iconProps = {
  'aria-hidden': true,
  className: 'h-[1.25cqw] w-[1.25cqw] shrink-0',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  viewBox: '0 0 24 24',
} as const;

function IconBrain() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75A3.75 3.75 0 0 0 6 7.5c-1.03.2-1.9 1-2.3 2.1-.4 1.1-.2 2.3.5 3.2-.7.8-1 1.9-.7 3 .3 1 1.1 1.8 2.1 2.1.3 1.3 1.4 2.4 2.9 2.4 1 0 1.9-.4 2.5-1.1m-5.9-15A3.75 3.75 0 0 1 18 7.5c1.03.2 1.9 1 2.3 2.1.4 1.1.2 2.3-.5 3.2.7.8 1 1.9.7 3-.3 1-1.1 1.8-2.1 2.1-.3 1.3-1.4 2.4-2.9 2.4-1 0-1.9-.4-2.5-1.1" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg {...iconProps}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  );
}

type ListPanelProps = {
  className: string;
  delay: number;
  icon: ReactNode;
  items: string[];
  title: string;
};

// Panel danh sách (Trí tuệ nhân tạo / Quản trị doanh nghiệp / Ứng dụng di động).
function ListPanel({ className, delay, icon, items, title }: ListPanelProps) {
  return (
    <div className={`${GLASS} hero-pop ${className}`} style={popDelay(delay)}>
      <p className="flex items-center gap-[0.5cqw] text-[0.95cqw] font-semibold leading-tight">
        <span className="text-primary">{icon}</span>
        {title}
      </p>
      <ul className="mt-[0.7cqw] space-y-[0.45cqw]">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-[0.5cqw] rounded-[0.4cqw] bg-white/70 px-[0.5cqw] py-[0.35cqw] text-[0.75cqw] leading-tight text-text-secondary"
          >
            <span className="h-[0.4cqw] w-[0.4cqw] shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Panel "AI" + biểu đồ cột (cột phụ dùng `opacity-40` — `bg-primary/40` không sinh CSS vì
// color là var() thiếu <alpha-value>).
function ChartPanel({ className, delay, subtitle, title }: { className: string; delay: number; subtitle: string; title: string }) {
  return (
    <div className={`${GLASS} hero-pop ${className}`} style={popDelay(delay)}>
      <p className="text-[3cqw] font-bold leading-none text-text-primary">{title}</p>
      <p className="mt-[0.4cqw] text-[0.85cqw] text-text-secondary">{subtitle}</p>
      <div className="mt-[1cqw] flex h-[9cqw] items-end gap-[0.5cqw]">
        {[30, 44, 38, 58, 50, 72, 100].map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%`, '--i': i } as CSSProperties}
            className={`hero-bar flex-1 rounded-t-[0.25cqw] bg-gradient-to-t from-primary to-accent ${i === 6 ? '' : 'opacity-60'}`}
          />
        ))}
      </div>
    </div>
  );
}

// Panel hiệu suất: số liệu lớn + đường tăng trưởng.
function StatPanel({ className, delay, label, value }: { className: string; delay: number; label: string; value: string }) {
  return (
    <div className={`${GLASS} hero-pop ${className}`} style={popDelay(delay)}>
      <p className="text-[0.75cqw] text-text-secondary">{label}</p>
      <p className="mt-[0.2cqw] text-[1.7cqw] font-bold leading-none text-primary"><CountUp value={value} /></p>
      <svg viewBox="0 0 100 40" className="mt-[0.6cqw] w-full text-primary">
        <polyline
          className="hero-line"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          points="0,34 20,28 38,31 56,20 74,22 100,6"
        />
      </svg>
    </div>
  );
}

type HeroBackgroundProps = {
  panels: HeroPanels;
  imageAlt: string;
};

/**
 * Nền ảnh + panel kính (chỉ lg+). Decorative với panel; ảnh có alt.
 *
 * Ảnh hero-bg (1916×821) phủ FULL-BLEED kiểu `background-size: cover` (R-01b, CR-043): nửa trái là thành phố + cửa kính +
 * cây (nền sau chữ, phủ trắng nhẹ), nửa phải robot/khối xanh. Wrapper là size container (`cqw`/`cqh` = bề rộng/cao section)
 * để khung ảnh tự tính kích thước bằng CSS:
 * - rộng = max(bề rộng section, cao section × 1916/821), tối đa 2048px; neo mép phải, neo dọc 35% (giữ vùng panel trong khung);
 * - viewport hẹp → cắt bớt thành phố bên trái; > 2048 → khung căn giữa, không phóng tiếp (panel không to dần/bị cắt),
 *   hai cạnh ảnh mask mờ sang nền trắng của section;
 * - khi khung rộng hơn viewport (< ~1545), lùi khung sang phải tối đa 56px (chỉ trong phần ảnh thừa, không hở mép trái) để
 *   panel kính không chồng cột chữ ở 1024–1100 và giữ khe chữ ↔ panel ở 1280–1440 (review CR-043 M1/m1).
 */
export function HeroBackground({ panels, imageAlt }: HeroBackgroundProps) {
  return (
    <div className="absolute inset-0 -z-10 hidden [container-type:size] lg:block">
      <div className="absolute right-[calc(max(0px,(100cqw_-_2048px)/2)_-_min(max(0px,100cqh*1916/821_-_100cqw),56px))] top-[calc((100cqh_-_min(max(100cqh,100cqw*821/1916),877.6px))*0.35)] aspect-[1916/821] w-[min(max(100cqw,calc(100cqh*1916/821)),2048px)]">
        {/* sizes = bề rộng thật của khung = min(max(100vw, cao × 1916/821), 2048): ≥ 2048 → 2048px; 1545–2048 → 100vw;
            1440–1545 cao 662 → 1545px; 1174–1440 cao 46vw → ~108vw; 1024–1174 cao 540 → 1260px. */}
        <Image
          alt={imageAlt}
          className="motion-load-zoom object-cover min-[2049px]:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
          fill
          priority
          sizes="(min-width: 2048px) 2048px, (min-width: 1545px) 100vw, (min-width: 1440px) 1545px, (min-width: 1174px) 108vw, (min-width: 1024px) 1260px, 1px"
          src={HERO_SRC}
        />

        {/* Hộp panel: vùng robot/khối xanh trên ảnh. 5 panel kính + wordmark NTA đặt % theo hộp này, đè khớp panel vẽ sẵn trong ảnh. */}
        <div aria-hidden className="absolute left-[17%] top-[7%] h-[80.4%] w-[69.9%] text-text-primary [container-type:inline-size]">
          <ListPanel className="left-[46.2%] top-[25.8%] w-[15.5%]" delay={300} icon={<IconBrain />} items={panels.ai.items} title={panels.ai.title} />
          <ChartPanel className="left-[69.9%] top-[15.8%] w-[17%]" delay={450} subtitle={panels.chart.subtitle} title={panels.chart.title} />
          <StatPanel className="left-[87.7%] top-[35.2%] w-[9%]" delay={600} label={panels.performance.label} value={panels.performance.value} />
          <ListPanel className="left-[46.2%] top-[52.7%] w-[16%]" delay={750} icon={<IconGrid />} items={panels.management.items} title={panels.management.title} />
          <ListPanel className="left-[82.8%] top-[54.2%] w-[14.5%]" delay={900} icon={<IconPhone />} items={panels.apps.items} title={panels.apps.title} />

          <p className="absolute left-[73%] top-[56%] -translate-x-1/2 text-[4cqw] font-black tracking-tight text-white drop-shadow-[0_0.2cqw_0.6cqw_rgb(0_80_70/0.55)]">
            {panels.wordmark}
          </p>
        </div>
      </div>

      {/* Phủ trắng NHẸ vùng chữ bên trái: vẫn thấy thành phố/cây phía sau (bản mẫu CR-043), chữ vẫn đủ tương phản. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255/0.85)_0%,rgb(255_255_255/0.72)_30%,rgb(255_255_255/0.35)_45%,rgb(255_255_255/0)_58%)]"
      />
      {/* Mờ đáy chuyển sang section kế tiếp. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

/** Mobile/tablet (< lg): ảnh xếp dưới chữ, crop vào robot, mờ mép trên. */
export function HeroMobileImage({ imageAlt }: { imageAlt: string }) {
  return (
    <div className="relative aspect-[4/3] w-full [mask-image:linear-gradient(to_bottom,transparent,black_20%)] md:aspect-[16/9] lg:hidden">
      <Image alt={imageAlt} className="object-cover object-[75%_50%]" fill sizes="100vw" src={HERO_SRC} />
    </div>
  );
}
