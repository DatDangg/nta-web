import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Solution } from '@/content/types';
import { CARD_IMAGE_RATIO, cardImageClass, cardImageSizes, cardLinkClass, cardShotFrameClass } from './cardStyles';
import { CardShotImage } from './CardShotImage';
import { HomeImage } from '@/components/shared/HomeImage';

interface SolutionCardProps {
  solution: Solution;
  imageAlt: string;
  href?: string;
  imageSrc?: string;
  /**
   * Thẻ có **ảnh giao diện thật** (`solution.cardImage`, hoặc `imageSrc` do trang truyền).
   *
   * Bật → ảnh bám mép trên khung 16/10, phần dư đáy fade, không cắt 2 bên, thẻ bỏ padding
   * ngoài để ảnh dính mép trên. Tắt (mặc định) → giữ nguyên placeholder + `p-4` + `object-cover`.
   */
  shot?: boolean;
}

export function SolutionCard({ solution, imageAlt, href, imageSrc, shot = false }: SolutionCardProps) {
  const t = useTranslations('common.cta');
  // `screenshots` nhận cả chuỗi lẫn `{src, alt, ratio}` (spec §7) — card chỉ cần src.
  const firstShot = solution.screenshots?.[0];
  const firstShotSrc = typeof firstShot === 'string' ? firstShot : firstShot?.src;
  const placeholder = imageSrc ?? solution.image ?? firstShotSrc;

  // Ảnh thật: `cardImage` trong mdx (kèm alt riêng theo rule §7) — hoặc `imageSrc` do trang truyền
  // kèm (thẻ nhóm ở trang chủ), lúc đó alt lấy từ prop `imageAlt` của trang.
  const shotSrc = solution.cardImage?.src ?? imageSrc;
  const usesCardImage = shotSrc != null && solution.cardImage?.src === shotSrc;
  const shotAlt = usesCardImage ? solution.cardImage!.alt : imageAlt;
  const shotRatio = usesCardImage ? solution.cardImage!.ratio : undefined;

  const body = (
    <>
      <h3 className="text-h3 font-semibold leading-tight">{solution.title}</h3>
      <p className="mt-2 line-clamp-2 text-text-secondary">{solution.description}</p>
      <span aria-hidden="true" className="mt-auto pt-4 inline-flex min-h-11 items-center gap-2 text-primary-active">{t('learnMore')} <span className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1">→</span></span>
    </>
  );

  if (shot && shotSrc) {
    return (
      <Link className={`${cardLinkClass} flex h-full flex-col overflow-hidden p-0`} href={href ?? `/solutions/${solution.category}/${solution.slug}`}>
        <CardShotImage alt={shotAlt} frameClassName={cardShotFrameClass} ratio={shotRatio} sizes={cardImageSizes} src={shotSrc} />
        <div className="flex flex-1 flex-col p-4">{body}</div>
      </Link>
    );
  }

  return (
    <Link className={`${cardLinkClass} flex h-full flex-col p-4`} href={href ?? `/solutions/${solution.category}/${solution.slug}`}>
      {placeholder ? (
        <HomeImage alt={imageAlt} className={cardImageClass} height={CARD_IMAGE_RATIO.height} sizes={cardImageSizes} src={placeholder} width={CARD_IMAGE_RATIO.width} />
      ) : (
        <div aria-hidden="true" className={cardImageClass} />
      )}
      <div className="flex flex-1 flex-col">{body}</div>
    </Link>
  );
}
