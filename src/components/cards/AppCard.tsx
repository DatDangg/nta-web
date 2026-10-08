import type { ReactNode } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { Product } from '@/content/types';
import { cardImageClass, cardLinkClass } from './cardStyles';

interface AppCardProps {
  product: Product;
  imageAlt: string;
  media?: ReactNode;
  downloadLinks?: ReactNode | null;
}

export function AppCard({ product, imageAlt, media, downloadLinks = null }: AppCardProps) {
  const image = product.screenshots[0];
  return (
    <div className="rounded-lg p-5 md:p-8">
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        {media ?? (image ? <Image alt={imageAlt} className={cardImageClass} height={600} sizes="(min-width: 1024px) 50vw, 100vw" src={image} width={960} /> : <div aria-hidden="true" className={cardImageClass} />)}
        <Link className={cardLinkClass} href="/products">
          <h2 className="text-h2 font-semibold leading-tight">{product.title}</h2>
        <p className="mt-3 text-text-secondary">{product.description}</p>
        {product.features && product.features.length > 0 && (
          <ul className="mt-5 list-disc space-y-2 ps-5">
            {product.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
        )}
        </Link>
      </div>
      {downloadLinks && <div className="mt-6">{downloadLinks}</div>}
    </div>
  );
}
