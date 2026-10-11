import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Solution } from '@/content/types';
import { CARD_IMAGE_RATIO, cardImageClass, cardImageSizes, cardLinkClass } from './cardStyles';
import { HomeImage } from '@/components/shared/HomeImage';

interface SolutionCardProps {
  solution: Solution;
  imageAlt: string;
  href?: string;
  imageSrc?: string;
}

export function SolutionCard({ solution, imageAlt, href, imageSrc }: SolutionCardProps) {
  const t = useTranslations('common.cta');
  // `screenshots` nhận cả chuỗi lẫn `{src, alt, ratio}` (spec §7) — card chỉ cần src.
  const firstShot = solution.screenshots?.[0];
  const firstShotSrc = typeof firstShot === 'string' ? firstShot : firstShot?.src;
  const image = imageSrc ?? solution.image ?? firstShotSrc;
  return (
    <Link className={`${cardLinkClass} p-4`} href={href ?? `/solutions/${solution.category}/${solution.slug}`}>
      {image ? <HomeImage alt={imageAlt} className={cardImageClass} height={CARD_IMAGE_RATIO.height} sizes={cardImageSizes} src={image} width={CARD_IMAGE_RATIO.width} /> : <div aria-hidden="true" className={cardImageClass} />}
      <h3 className="mt-5 text-h3 font-semibold leading-tight">{solution.title}</h3>
      <p className="mt-2 line-clamp-2 text-text-secondary">{solution.description}</p>
      <span aria-hidden="true" className="mt-4 inline-flex min-h-11 items-center gap-2 text-primary-active">{t('learnMore')} <span className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1">→</span></span>
    </Link>
  );
}
