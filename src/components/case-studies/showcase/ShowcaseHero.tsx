import { Link } from '@/i18n/navigation';
import type { BreadcrumbItem } from '@/components/shared/Breadcrumb';
import { buttonStyles } from '@/components/ui/Button';
import { DetailHero } from '@/components/listing/DetailHero';
import type { GlassTile } from '@/components/listing/GlassVisual';
import type { CaseStudyShowcase } from '@/content/types';
import { ArrowRight } from './icons';

type Props = { hero: CaseStudyShowcase['hero']; breadcrumbs: BreadcrumbItem[]; tiles?: GlassTile[] };

const defaultTiles: GlassTile[] = [
  { icon: 'landmark', theme: 'teal' },
  { icon: 'chart', theme: 'sky' },
  { icon: 'shield', theme: 'violet' },
];

/**
 * Hero landing case study — cùng phong cách trang danh sách: nền sóng teal, breadcrumb viên
 * thuốc, eyebrow, tiêu đề 2 dòng (dòng 2 nhấn gradient), ảnh lớn trong khung kính bên phải.
 * Mobile: chữ trước, ảnh xếp dưới.
 */
export function ShowcaseHero({ hero, breadcrumbs, tiles = defaultTiles }: Props) {
  const isAnchor = hero.primaryCta.href.startsWith('#');
  const primaryClass = `${buttonStyles('primary', 'lg')} w-full gap-2 shadow-[0_10px_24px_-6px_rgb(0_158_135/0.55)] sm:w-auto`;
  return (
    <DetailHero
      actions={(
        <>
          {isAnchor ? (
            <a className={primaryClass} href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <ArrowRight />
            </a>
          ) : (
            <Link className={primaryClass} href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <ArrowRight />
            </Link>
          )}
          {hero.video && (
            <a className="group inline-flex min-h-11 items-center gap-3 font-medium text-text-primary" href={hero.video.href} rel="noopener noreferrer" target="_blank">
              <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-primary shadow-sm transition-colors group-hover:border-primary">
                <svg className="ml-0.5 size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5-13-7.5Z" /></svg>
              </span>
              {hero.video.label}
            </a>
          )}
        </>
      )}
      breadcrumbs={breadcrumbs}
      description={hero.description}
      eyebrow={hero.eyebrow}
      media={{ src: hero.image.src, alt: hero.image.alt, width: hero.image.width ?? 1590, height: hero.image.height ?? 989, frame: 'photo' }}
      subtitle={hero.subtitle}
      tiles={tiles}
      titleAccent={hero.titleAccent}
      titleLead={hero.titleLead}
    />
  );
}
