import type { ReactNode } from 'react';
import { AccentText } from '@/components/listing/ListingHero';

type HomeSectionHeaderProps = {
  /** Gắn vào H2 để `<section aria-labelledby>` trỏ tới. */
  headingId: string;
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  /** `true` → phần nhấn (màu brand) xuống dòng riêng, như khối "Giải pháp" (mockup CR-016). */
  accentOnNewLine?: boolean;
  description?: string;
  /**
   * `right` → mô tả nằm cột phải cạnh tiêu đề (Giải pháp, Sản phẩm).
   * `below` → mô tả nằm dưới tiêu đề bên trái, cột phải chỉ còn `actions` (Case study).
   */
  descriptionPlacement?: 'right' | 'below';
  /** Nút ←/→, link "Xem tất cả"… — luôn nằm bên phải trên `lg`, xếp dưới chữ ở mobile. */
  actions?: ReactNode;
};

/**
 * Header dùng chung cho các khối trang chủ (mockup CR-016): eyebrow chữ hoa + gạch ngang,
 * H2 2 phần (lead + accent màu brand), mô tả và slot `actions`. Server-safe, không state.
 */
export function HomeSectionHeader({
  headingId,
  eyebrow,
  titleLead,
  titleAccent,
  accentOnNewLine = false,
  description,
  descriptionPlacement = 'right',
  actions,
}: HomeSectionHeaderProps) {
  const descriptionNode = description ? (
    <p className="max-w-[56ch] text-base leading-relaxed text-text-secondary">{description}</p>
  ) : null;
  const rightDescription = descriptionPlacement === 'right' ? descriptionNode : null;
  const hasRightColumn = rightDescription != null || actions != null;

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
      <div className="min-w-0">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary-active">
          {eyebrow}
          <span aria-hidden="true" className="h-px w-6 bg-primary" />
        </p>
        <h2
          className="mt-3 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-text-primary"
          id={headingId}
        >
          {titleLead}
          {accentOnNewLine ? <br /> : ' '}
          <AccentText>{titleAccent}</AccentText>
        </h2>
        {descriptionPlacement === 'below' && descriptionNode ? <div className="mt-3">{descriptionNode}</div> : null}
      </div>
      {hasRightColumn ? (
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center lg:max-w-[46%] lg:shrink-0 lg:gap-8">
          {rightDescription}
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
