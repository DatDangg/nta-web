import Image from 'next/image';
import { ListingIcon, type ListingIconName } from '@/components/listing/icons';
import { Link } from '@/i18n/navigation';

/** Dữ liệu 1 thẻ case study trang chủ — dựng từ `getAllCaseStudies` + icon `listingItems` (CaseStudyHighlight). */
export type HomeCaseStudy = {
  slug: string;
  title: string;
  description: string;
  sector?: string;
  icon: ListingIconName;
  image?: string;
  alt: string;
};

/**
 * Thẻ case study của trang chủ (mockup CR-016 `3.webp`) — không dùng `CaseStudyCard` dùng chung
 * (thẻ đó phục vụ `/case-studies` + RelatedStudies). Cả thẻ là 1 link; nút tròn mũi tên chỉ trang trí.
 */
export function HomeCaseStudyCard({ study, viewDetailLabel, className = '' }: { study: HomeCaseStudy; viewDetailLabel: string; className?: string }) {
  return (
    <Link
      className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus ${className}`}
      href={`/case-studies/${study.slug}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-sunken">
        {study.image ? (
          <Image
            alt={study.alt}
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02]"
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 1024px) 31vw, (min-width: 768px) 45vw, 85vw"
            src={study.image}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        {study.sector ? (
          <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-background-alt px-3 py-1 text-xs font-medium text-text-secondary">
            <ListingIcon className="size-4 text-primary-active" name={study.icon} strokeWidth={2} />
            {study.sector}
          </p>
        ) : null}
        <h3 className="mt-4 text-xl font-bold leading-tight text-text-primary">{study.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary md:text-base">{study.description}</p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <span className="inline-flex items-center gap-2 font-medium text-primary-active">
            {viewDetailLabel}
            <ListingIcon className="size-4" name="arrow" strokeWidth={2} />
          </span>
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-active">
            <ListingIcon className="size-5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" name="arrow" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
