import Image from 'next/image';
import { ListingIcon, type ListingIconName } from '@/components/listing/icons';
import { listingThemes, type ListingTheme } from '@/components/listing/themes';
import { Link } from '@/i18n/navigation';

/** Dữ liệu 1 thẻ sản phẩm trang chủ: `featuredProducts` (home.ts) ghép với `listingItems` theo slug. */
export type HomeFeaturedProduct = {
  slug: string;
  title: string;
  image: string;
  alt: string;
  icon: ListingIconName;
  theme: ListingTheme;
  subtitle: string;
  chips: string[];
};

/**
 * Thẻ sản phẩm dọc của trang chủ (mockup CR-016 `1.webp`) — không dùng `ProductCard` dùng chung.
 * Poster 9:16 cắt `object-top` về khung 6:7 để giữ phần chữ thương hiệu nằm ở đầu ảnh; không phủ chữ lên poster.
 */
export function HomeProductCard({ product, className = '' }: { product: HomeFeaturedProduct; className?: string }) {
  const theme = listingThemes[product.theme];

  return (
    <Link
      className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus ${className}`}
      href={`/products/${product.slug}`}
    >
      <div className="relative aspect-[6/7] overflow-hidden">
        <Image
          alt={product.alt}
          className="object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.02]"
          fill
          sizes="(min-width: 1024px) 508px, (min-width: 768px) 45vw, 85vw"
          src={product.image}
        />
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className={`flex size-12 shrink-0 items-center justify-center rounded-xl md:size-14 ${theme.chip}`}>
            <ListingIcon className="size-6 md:size-7" name={product.icon} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold leading-tight text-text-primary">{product.title}</h3>
            <p className="mt-1 line-clamp-1 text-sm text-text-secondary">{product.subtitle}</p>
          </div>
          <span aria-hidden="true" className={`flex size-11 shrink-0 items-center justify-center rounded-full ${theme.chip}`}>
            <ListingIcon className="size-5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" name="arrow" strokeWidth={2} />
          </span>
        </div>

        {product.chips.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {product.chips.map((chip) => (
              <li className={`rounded-full px-3 py-1 text-xs font-medium ${theme.chip}`} key={chip}>
                {chip}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
