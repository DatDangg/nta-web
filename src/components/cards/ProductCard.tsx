import { Link } from '@/i18n/navigation';
import type { Product } from '@/content/types';
import { CARD_IMAGE_RATIO, cardImageClass, cardImageSizes, cardLinkClass } from './cardStyles';
import { HomeImage } from '@/components/shared/HomeImage';

interface ProductCardProps {
  product: Product;
  imageAlt: string;
  imageSrc?: string;
  className?: string;
}

export function ProductCard({ product, imageAlt, imageSrc, className = '' }: ProductCardProps) {
  const image = imageSrc ?? product.screenshots[0];
  return (
    <Link className={`${cardLinkClass} p-4 ${className}`} href="/products">
      {image ? <HomeImage alt={imageAlt} className={cardImageClass} height={CARD_IMAGE_RATIO.height} sizes={cardImageSizes} src={image} width={CARD_IMAGE_RATIO.width} /> : <div aria-hidden="true" className={cardImageClass} />}
      <h3 className="mt-5 text-h3 font-semibold leading-tight">{product.title}</h3>
      <p className="mt-2 line-clamp-2 text-text-secondary">{product.description}</p>
    </Link>
  );
}
