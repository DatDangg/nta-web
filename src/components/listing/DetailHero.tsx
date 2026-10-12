import type { CSSProperties, ReactNode } from 'react';
import { Breadcrumb, type BreadcrumbItem } from '@/components/shared/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { GlassVisual, type GlassMedia, type GlassTile } from './GlassVisual';
import { AccentText, HeroWaves } from './ListingHero';

interface DetailHeroProps {
  breadcrumbs: BreadcrumbItem[];
  /** Nhãn nhỏ phía trên tiêu đề (vd "Phương án đề xuất · 2026"). */
  eyebrow?: string;
  titleLead: string;
  /** Phần tiêu đề nhấn màu, xuống dòng riêng. */
  titleAccent?: string;
  subtitle?: string;
  description: string;
  actions?: ReactNode;
  media?: GlassMedia;
  /** Chú thích dưới ảnh (vd HRM: "Giao diện minh hoạ"). */
  caption?: string;
  tiles: GlassTile[];
}

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/**
 * Tách tiêu đề giải pháp thành phần thường + phần nhấn:
 * "Quản trị khách hàng (CRM)" → ["Quản trị khách hàng", "(CRM)"],
 * "BoxAI — camera AI tại biên" → ["BoxAI", "camera AI tại biên"]. Không tách được → nguyên tiêu đề.
 */
export function splitTitle(title: string): { lead: string; accent?: string } {
  const dash = title.split(/\s+[—–]\s+/);
  if (dash.length === 2) return { lead: dash[0], accent: dash[1] };
  const paren = title.match(/^(.*\S)\s*(\([^)]+\))$/);
  if (paren) return { lead: paren[1], accent: paren[2] };
  return { lead: title };
}

/**
 * Hero trang chi tiết (giải pháp · case study) cùng ngôn ngữ với ảnh mẫu trang danh sách:
 * nền sóng teal, breadcrumb viên thuốc, tiêu đề 2 tầng có phần nhấn, ảnh trong khung kính
 * kèm ô icon trôi nhẹ. Mobile: chữ trước, ảnh xếp dưới.
 */
export function DetailHero({ breadcrumbs, eyebrow, titleLead, titleAccent, subtitle, description, actions, media, caption, tiles }: DetailHeroProps) {
  return (
    <header className="relative isolate overflow-hidden bg-white pb-12 pt-8 md:pb-16 lg:pt-10">
      <HeroWaves className="h-full" fadeTo="to-white" />
      <Container className={`grid items-center gap-10 ${media ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-12' : ''}`}>
        <div>
          <div className="motion-load" data-motion-off style={delay(0)}>
            <Breadcrumb items={breadcrumbs} variant="pill" />
          </div>
          {eyebrow && (
            <p className="motion-load mt-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-3.5 py-1.5 text-sm font-medium text-primary-active" data-motion-off style={delay(100)}>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
              {eyebrow}
            </p>
          )}
          <h1 className={`${eyebrow ? 'mt-4' : 'mt-7'} text-[clamp(2.25rem,1.5rem+2.6vw,3.6rem)] font-bold leading-[1.1] tracking-[-0.025em] text-text-primary`} data-motion-off>
            <span className="split-line block">{titleLead}</span>
            {titleAccent && (
              <span className="split-line block" style={{ '--split-delay': '120ms' } as CSSProperties}>
                <AccentText>{titleAccent}</AccentText>
              </span>
            )}
          </h1>
          {subtitle && <p className="motion-load mt-4 text-lg font-semibold leading-snug text-text-primary" data-motion-off style={delay(250)}>{subtitle}</p>}
          <p className="motion-load mt-4 max-w-[60ch] text-body-lg leading-relaxed text-text-secondary" data-motion-off style={delay(350)}>{description}</p>
          {actions && (
            <div className="motion-load mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" data-motion-off style={delay(500)}>
              {actions}
            </div>
          )}
        </div>
        {media ? (
          <div>
            <GlassVisual media={media} tiles={tiles} />
            {caption && <p className="mt-2 text-center text-sm text-text-secondary">{caption}</p>}
          </div>
        ) : null}
      </Container>
    </header>
  );
}
