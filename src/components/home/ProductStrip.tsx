'use client';

import { useTranslations } from 'next-intl';
import { ListingCtaCard } from '@/components/listing/ListingCard';
import type { ListingCta } from '@/components/listing/types';
import { Reveal } from '@/components/ui/Reveal';
import { HomeProductCard, type HomeFeaturedProduct } from './HomeProductCard';
import { HomeScrollArrows } from './HomeScrollArrows';
import { HomeSectionHeader } from './HomeSectionHeader';
import { scrollStripClass, useScrollButtons } from './useScrollButtons';

type ProductStripProps = {
  products: HomeFeaturedProduct[];
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  description: string;
  /** Thẻ CTA viền đứt cuối dải (CR-021) — cùng nội dung thẻ cuối lưới /products. */
  cta: ListingCta;
};

/** Khối "Sản phẩm tiêu biểu" trang chủ theo mockup CR-016 (header `2.webp` nửa dưới, thẻ dọc `1.webp`). */
export function ProductStrip({ products, cta, eyebrow, titleLead, titleAccent, description }: ProductStripProps) {
  const t = useTranslations('home');
  const { stripRef, canPrev, canNext, scrollStrip, handleStripKeyDown } = useScrollButtons();

  if (products.length === 0) return null;
  const regionLabel = `${titleLead} ${titleAccent}`;

  return (
    <section aria-labelledby="home-products-title" className="bg-background py-12 md:py-16 xl:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1040px]">
          <Reveal>
            <HomeSectionHeader
              actions={
                <HomeScrollArrows
                  canNext={canNext}
                  canPrev={canPrev}
                  nextLabel={t('nextProducts')}
                  onScroll={scrollStrip}
                  previousLabel={t('previousProducts')}
                />
              }
              description={description}
              eyebrow={eyebrow}
              headingId="home-products-title"
              titleAccent={titleAccent}
              titleLead={titleLead}
            />
          </Reveal>
          <Reveal className="mt-8 lg:mt-10">
            <div
              aria-label={regionLabel}
              className={scrollStripClass}
              onKeyDown={handleStripKeyDown}
              ref={stripRef}
              role="region"
              tabIndex={0}
            >
              {products.map((product) => (
                <HomeProductCard
                  className="w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)]"
                  key={product.slug}
                  product={product}
                />
              ))}
              <div className="grid w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)]">
                <ListingCtaCard cta={cta} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
