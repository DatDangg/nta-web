'use client';

import { useTranslations } from 'next-intl';
import { ListingCtaCard } from '@/components/listing/ListingCard';
import type { ListingCta } from '@/components/listing/types';
import { Container } from '@/components/ui/Container';
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

/** Độ rộng 1 thẻ trong dải: mobile 85%, tablet ½ dải (luôn cuộn ngang). */
const cardWidthBaseClass = 'w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)]';
/** Đúng 3 thẻ → từ lg mỗi thẻ ⅓ dải (2 gap `md:gap-6` = 3rem) để hiện đủ 1 hàng, không cuộn (CR-022). */
const cardWidthThreeUpClass = 'w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)] lg:w-[calc((100%-3rem)/3)]';
const productImageSizesThreeUp = '(min-width: 1024px) 400px, (min-width: 768px) 45vw, 85vw';

/** Khối "Sản phẩm tiêu biểu" trang chủ theo mockup CR-016 (header `2.webp` nửa dưới, thẻ dọc `1.webp`). */
export function ProductStrip({ products, cta, eyebrow, titleLead, titleAccent, description }: ProductStripProps) {
  const t = useTranslations('home');
  const { stripRef, canPrev, canNext, scrollStrip, handleStripKeyDown } = useScrollButtons();

  if (products.length === 0) return null;
  const regionLabel = `${titleLead} ${titleAccent}`;
  // Thẻ CTA luôn đứng cuối dải; ≤ 3 thẻ vừa 1 hàng ở lg+ nên ẩn cặp ←/→ ở đó (không còn gì để cuộn).
  const cardCount = products.length + 1;
  const isThreeUp = cardCount === 3;
  const cardWidthClass = isThreeUp ? cardWidthThreeUpClass : cardWidthBaseClass;
  const scrollArrows = (
    <HomeScrollArrows
      canNext={canNext}
      canPrev={canPrev}
      nextLabel={t('nextProducts')}
      onScroll={scrollStrip}
      previousLabel={t('previousProducts')}
    />
  );

  return (
    <section aria-labelledby="home-products-title" className="bg-background py-12 md:py-16 xl:py-24">
      <Container>
        <Reveal>
          <HomeSectionHeader
            actions={cardCount <= 3 ? <div className="flex gap-3 lg:hidden">{scrollArrows}</div> : scrollArrows}
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
                className={cardWidthClass}
                imageSizes={isThreeUp ? productImageSizesThreeUp : undefined}
                key={product.slug}
                product={product}
              />
            ))}
            <div className={`grid ${cardWidthClass}`}>
              <ListingCtaCard cta={cta} />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
