import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { Breadcrumb, type BreadcrumbItem } from '@/components/shared/Breadcrumb';
import { SplitText } from '@/components/motion/SplitText';
import { Container } from '@/components/ui/Container';
import { ListingIcon, type ListingIconName } from './icons';

export const HERO_WAVES_SRC = '/images/shared/hero-waves.jpg';

export interface ListingHighlight {
  icon: ListingIconName;
  title: string;
  text: string;
}

interface ListingHeroProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  /** Dòng 2 (tagline lớn): phần thường + phần nhấn màu thương hiệu. */
  lead: string;
  accent: string;
  description: string;
  highlights: ListingHighlight[];
  /** Hình minh hoạ bên phải (ẩn dưới `lg` — chỉ trang trí). */
  visual?: ReactNode;
  /** Nội dung nằm chung nền sóng (thanh lọc + lưới thẻ). */
  children?: ReactNode;
}

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/** Nền sóng teal dùng chung cho hero danh sách + hero chi tiết. Phủ trên cùng, mờ dần xuống nền trang. */
export function HeroWaves({ className = 'h-[780px]', fadeTo = 'to-[#f7fbfb]' }: { className?: string; fadeTo?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden ${className}`}>
      <Image alt="" className="size-full object-cover object-center" fill priority sizes="100vw" src={HERO_WAVES_SRC} />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255/0.72)_0%,rgb(255_255_255/0.35)_45%,transparent_70%)]" />
      <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent ${fadeTo}`} />
    </div>
  );
}

/** Tiêu đề dòng 2 có phần nhấn gradient teal (dùng lại ở hero chi tiết). */
export function AccentText({ children }: { children: ReactNode }) {
  return <span className="bg-gradient-to-r from-[#00a58c] via-[#0b9f8a] to-[#22b07d] bg-clip-text pb-[0.08em] text-transparent">{children}</span>;
}

/**
 * Hero trang danh sách (sản phẩm · giải pháp · case study) theo ảnh mẫu "Ứng dụng AI":
 * breadcrumb dạng viên thuốc, tiêu đề 2 dòng có phần nhấn, mô tả, 3 điểm nhấn có icon tròn,
 * hình kính 3D bên phải. `children` (thanh lọc + lưới) nằm chung nền sóng.
 */
export function ListingHero({ breadcrumbs, title, lead, accent, description, highlights, visual, children }: ListingHeroProps) {
  return (
    <div className="relative isolate bg-[#f7fbfb]">
      <HeroWaves />
      <header className="pb-10 pt-8 md:pb-12 lg:pt-10">
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-4">
          <div>
            <div className="motion-load" data-motion-off style={delay(0)}>
              <Breadcrumb items={breadcrumbs} variant="pill" />
            </div>
            <h1 className="mt-7 text-[clamp(2.5rem,1.6rem+3.4vw,4.25rem)] font-bold leading-[1.05] tracking-[-0.03em] text-text-primary" data-motion-off>
              <SplitText text={title} />
            </h1>
            <p className="motion-load mt-3 text-[clamp(1.625rem,1.15rem+1.9vw,2.6rem)] font-bold leading-[1.15] tracking-[-0.02em] text-text-primary" data-motion-off style={delay(200)}>
              {lead} <AccentText>{accent}</AccentText>
            </p>
            <p className="motion-load mt-5 max-w-[62ch] text-body-lg leading-relaxed text-text-secondary" data-motion-off style={delay(350)}>
              {description}
            </p>
            {highlights.length > 0 && (
              <ul className="motion-load mt-8 grid gap-5 sm:grid-cols-3 sm:gap-4" data-motion-off style={delay(500)}>
                {highlights.map((item) => (
                  <li className="flex items-start gap-3.5" key={item.title}>
                    <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#cdeee6] bg-white/90 text-primary shadow-[0_8px_20px_-10px_rgb(0_158_135/0.55)] sm:size-14">
                      <ListingIcon className="size-6" name={item.icon} strokeWidth={2} />
                    </span>
                    <span className="pt-1">
                      <span className="block font-semibold leading-snug text-text-primary">{item.title}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-text-secondary">{item.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {visual && <div className="hidden lg:block">{visual}</div>}
        </Container>
      </header>
      {children}
    </div>
  );
}
