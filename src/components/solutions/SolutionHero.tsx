import { Link } from '@/i18n/navigation';
import { buttonStyles } from '@/components/ui/Button';
import { DetailHero, splitTitle } from '@/components/listing/DetailHero';
import type { GlassTile } from '@/components/listing/GlassVisual';
import { ListingIcon } from '@/components/listing/icons';
import { ratioToSize } from '@/content/listings';

export interface HeroBreadcrumb {
  label: string;
  href?: string;
}

type SolutionHeroProps = {
  /** Đường dẫn breadcrumb đầy đủ (không cần `Trang chủ` — `Breadcrumb` tự thêm icon nhà). */
  breadcrumbs: HeroBreadcrumb[];
  title: string;
  description: string;
  /** Ảnh sản phẩm. Rỗng → hero chỉ có chữ + CTA, không để khung rỗng. */
  image?: string;
  imageAlt?: string;
  /** Tỉ lệ ảnh đo sẵn — dùng tính kích thước nội tại cho next/image. */
  imageRatio?: number;
  /** Giữ để tương thích chỗ gọi cũ — khung kính mới tự giới hạn bề rộng. */
  imageMaxW?: string;
  /** Chú thích dưới ảnh hero — chỉ HRM dùng ("Giao diện minh hoạ", spec §7). */
  caption?: string;
  /**
   * Đường dẫn TƯƠNG ĐỐI, không có tiền tố locale — `Link` của next-intl tự thêm.
   * KHÔNG truyền URL tuyệt đối (preview sẽ nhảy sang domain production) — trừ khi
   * `external: true` (vd. link demo): khi đó render `<a>` mở tab mới.
   */
  primaryCta: { label: string; href: string; external?: boolean };
  secondaryCta: { label: string; href: string; ariaLabel?: string };
  /** Ô icon trôi quanh ảnh (thiếu → bộ mặc định). */
  tiles?: GlassTile[];
};

const defaultTiles: GlassTile[] = [
  { icon: 'sparkles', theme: 'teal' },
  { icon: 'chart', theme: 'sky' },
  { icon: 'shield', theme: 'violet' },
];

/**
 * Hero trang chi tiết giải pháp (Doanh nghiệp + AI) — cùng phong cách trang danh sách:
 * chữ trái (tiêu đề tách phần nhấn), ảnh giao diện trong khung kính bên phải.
 */
export function SolutionHero({ breadcrumbs, title, description, image, imageAlt, imageRatio, caption, primaryCta, secondaryCta, tiles = defaultTiles }: SolutionHeroProps) {
  const { lead, accent } = splitTitle(title);
  const isAnchor = secondaryCta.href.startsWith('#');
  const primaryClass = `${buttonStyles('primary', 'lg')} w-full gap-2 shadow-[0_10px_24px_-6px_rgb(0_158_135/0.55)] sm:w-auto`;
  const secondaryClass = `${buttonStyles('outline', 'lg')} w-full bg-white/70 backdrop-blur sm:w-auto`;

  return (
    <DetailHero
      actions={(
        <>
          {primaryCta.external ? (
            <a className={primaryClass} href={primaryCta.href} rel="noopener noreferrer" target="_blank">
              {primaryCta.label}
              <ListingIcon className="size-4" name="arrow" strokeWidth={2.2} />
            </a>
          ) : (
            <Link className={primaryClass} href={primaryCta.href}>
              {primaryCta.label}
              <ListingIcon className="size-4" name="arrow" strokeWidth={2.2} />
            </Link>
          )}
          {isAnchor ? (
            <a aria-label={secondaryCta.ariaLabel} className={secondaryClass} href={secondaryCta.href}>{secondaryCta.label}</a>
          ) : (
            <Link aria-label={secondaryCta.ariaLabel} className={secondaryClass} href={secondaryCta.href}>{secondaryCta.label}</Link>
          )}
        </>
      )}
      breadcrumbs={breadcrumbs}
      caption={caption}
      description={description}
      media={image ? { src: image, alt: imageAlt ?? '', ...ratioToSize(imageRatio ?? 1.6), frame: 'window', alignTop: true } : undefined}
      tiles={tiles}
      titleAccent={accent}
      titleLead={lead}
    />
  );
}
