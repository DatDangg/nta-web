import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Solution } from '@/content/types';
import { cardImageClass, cardImageSizes, cardLinkClass } from './cardStyles';

interface SolutionCardProps {
  solution: Solution;
  imageAlt: string;
}

export function SolutionCard({ solution, imageAlt }: SolutionCardProps) {
  const t = useTranslations('common.cta');
  const image = solution.image ?? solution.screenshots?.[0];
  return (
    <Link aria-label={`${solution.title}, ${t('learnMore')}`} className={`${cardLinkClass} p-4`} href={`/solutions/${solution.category}/${solution.slug}`}>
      {image ? <Image alt={imageAlt} className={cardImageClass} height={600} sizes={cardImageSizes} src={image} width={960} /> : <div aria-hidden="true" className={cardImageClass} />}
      <h3 className="mt-5 text-h3 font-semibold leading-tight">{solution.title}</h3>
      <p className="mt-2 line-clamp-2 text-text-secondary">{solution.description}</p>
      <span aria-hidden="true" className="mt-4 inline-flex min-h-11 items-center gap-2 text-primary">{t('learnMore')} <span className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1">→</span></span>
    </Link>
  );
}
