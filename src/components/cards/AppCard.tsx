import type { ReactNode } from 'react';
import Image from 'next/image';
import type { Product } from '@/content/types';
import { getProductTheme } from '@/components/products/productThemes';
import { cardImageClass } from './cardStyles';

interface AppCardProps {
  product: Product;
  imageAlt: string;
  media?: ReactNode;
  /** Thứ tự hiển thị (bắt đầu từ 1) — in thành "01", "02" và quyết định đảo trái/phải. */
  index?: number;
  /** Nhãn trạng thái cạnh số thứ tự (vd "Sắp ra mắt"). */
  status?: ReactNode | null;
  downloadLinks?: ReactNode | null;
}

/**
 * Thẻ showcase app (trang /products) — 1 hàng full-width, so le trái/phải theo `index`.
 * Sân khấu ảnh dùng màu riêng của từng app (`productThemes`) để hợp tông với poster.
 */
export function AppCard({ product, imageAlt, media, index = 1, status = null, downloadLinks = null }: AppCardProps) {
  const image = product.screenshots[0];
  const theme = getProductTheme(product.slug);
  const reversed = index % 2 === 0;

  return (
    <article className="grid overflow-hidden rounded-[32px] bg-surface shadow-sm ring-1 ring-black/5 lg:grid-cols-2">
      <div className={`relative isolate flex items-center justify-center overflow-hidden px-4 pb-4 pt-10 sm:px-8 lg:py-14 ${theme.stage} ${reversed ? 'lg:order-2' : ''}`}>
        <div aria-hidden="true" className={`absolute -left-20 -top-24 -z-10 h-72 w-72 rounded-full opacity-25 blur-3xl ${theme.glowA}`} />
        <div aria-hidden="true" className={`absolute -bottom-28 -right-16 -z-10 h-80 w-80 rounded-full opacity-25 blur-3xl ${theme.glowB}`} />
        {media ?? (image ? <Image alt={imageAlt} className={cardImageClass} height={600} sizes="(min-width: 1024px) 50vw, 100vw" src={image} width={960} /> : <div aria-hidden="true" className={cardImageClass} />)}
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14 xl:p-16">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm font-medium tracking-widest text-text-secondary">{String(index).padStart(2, '0')}</span>
          <span aria-hidden="true" className="h-px w-8 bg-border" />
          {status}
        </div>
        <h2 className="mt-5 text-h2 font-semibold leading-tight tracking-tight text-text-primary">{product.title}</h2>
        <p className="mt-4 max-w-md text-body-lg leading-relaxed text-text-secondary">{product.description}</p>
        {product.features && product.features.length > 0 && (
          <ul className="mt-8 space-y-4">
            {product.features.map((feature) => (
              <li className="flex items-center gap-3 text-text-primary" key={feature}>
                <span aria-hidden="true" className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${theme.check}`}>
                  <svg fill="none" height="13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" width="13"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
        {downloadLinks && <div className="mt-10">{downloadLinks}</div>}
      </div>
    </article>
  );
}
