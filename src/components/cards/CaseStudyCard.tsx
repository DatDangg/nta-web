import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { CaseStudy } from '@/content/types';
import { Badge } from '@/components/ui/Badge';
import { cardImageClass, cardImageSizes, cardLinkClass } from './cardStyles';

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  imageAlt: string;
  categoryLabel: string;
}

export function CaseStudyCard({ caseStudy, imageAlt, categoryLabel }: CaseStudyCardProps) {
  const locale = useLocale();
  const image = caseStudy.gallery[0];
  return (
    <Link aria-label={caseStudy.title} className={`${cardLinkClass} p-4`} href={`/case-studies/${caseStudy.slug}`}>
      {image ? <Image alt={imageAlt} className={cardImageClass} height={600} sizes={cardImageSizes} src={image.src} width={960} /> : <div aria-hidden="true" className={cardImageClass} />}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><Badge>{categoryLabel}</Badge><time className="text-sm text-text-secondary" dateTime={String(caseStudy.year)}>{new Intl.NumberFormat(locale, { useGrouping: false }).format(caseStudy.year)}</time></div>
      <h3 className="mt-4 text-h3 font-semibold leading-tight">{caseStudy.title}</h3>
      <p className="mt-2 line-clamp-2 text-text-secondary">{caseStudy.result}</p>
    </Link>
  );
}
