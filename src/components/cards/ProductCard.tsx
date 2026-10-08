import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { Product } from '@/content/types';
import { cardImageClass, cardImageSizes, cardLinkClass } from './cardStyles';

interface ProductCardProps {
  product: Product;
  imageAlt: string;
}

export function ProductCard({ product, imageAlt }: ProductCardProps) {
  const image = product.screenshots[0];
  return (
    <Link aria-label={product.title} className={`${cardLinkClass} p-4`} href={`/products/${product.slug}`}>
      {image ? <Image alt={imageAlt} className={cardImageClass} height={600} sizes={cardImageSizes} src={image} width={960} /> : <div aria-hidden="true" className={cardImageClass} />}
      <h3 className="mt-5 text-h3 font-semibold leading-tight">{product.title}</h3>
      <p className="mt-2 line-clamp-2 text-text-secondary">{product.description}</p>
    </Link>
  );
}
