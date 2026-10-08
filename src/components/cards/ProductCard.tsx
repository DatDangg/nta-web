import { Link } from '@/i18n/navigation';
import type { Product } from '@/content/types';
import { cardImageClass, cardImageSizes, cardLinkClass } from './cardStyles';
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
    <Link aria-label={product.title} className={`${cardLinkClass} p-4 ${className}`} href="/products">
      {image ? <HomeImage alt={imageAlt} className={cardImageClass} sizes={cardImageSizes} src={image} /> : <div aria-hidden="true" className={cardImageClass} />}
      <h3 className="mt-5 text-h3 font-semibold leading-tight">{product.title}</h3>
      <p className="mt-2 line-clamp-2 text-text-secondary">{product.description}</p>
    </Link>
  );
}
