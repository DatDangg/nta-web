'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { ListingIcon } from '@/components/listing/icons';
import { Reveal } from '@/components/ui/Reveal';
import { HomeProductCard, type HomeFeaturedProduct } from './HomeProductCard';
import { HomeSectionHeader } from './HomeSectionHeader';

type ProductStripProps = {
  products: HomeFeaturedProduct[];
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  description: string;
};

const arrowButtonBase =
  'flex size-12 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-40';

function handleStripKeyDown(event: KeyboardEvent<HTMLDivElement>, scrollStrip: (direction: -1 | 1) => void) {
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    scrollStrip(1);
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    scrollStrip(-1);
  }
}

/**
 * Theo dõi strip có cuộn được về trước/sau không — để disable nút ←/→.
 * Cần cả `scroll` (người dùng vuốt) lẫn `ResizeObserver` (đổi breakpoint làm strip hết/bắt đầu tràn).
 */
function useScrollEdges(stripRef: RefObject<HTMLDivElement | null>) {
  const [edges, setEdges] = useState({ canPrev: false, canNext: false });

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    // Sai số 1px: scrollLeft có thể là số lẻ trên màn hình HiDPI.
    const update = () => {
      setEdges({
        canPrev: strip.scrollLeft > 1,
        canNext: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1,
      });
    };
    update();
    strip.addEventListener('scroll', update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(strip);
    return () => {
      strip.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, [stripRef]);

  return edges;
}

/** Khối "Sản phẩm tiêu biểu" trang chủ theo mockup CR-016 (header `2.webp` nửa dưới, thẻ dọc `1.webp`). */
export function ProductStrip({ products, eyebrow, titleLead, titleAccent, description }: ProductStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('home');
  const { canPrev, canNext } = useScrollEdges(stripRef);

  // Cuộn đúng 1 thẻ (+ khoảng gap) để snap không kéo về thẻ cũ.
  const scrollStrip = useCallback((direction: -1 | 1) => {
    const strip = stripRef.current;
    const firstCard = strip?.firstElementChild;
    if (!strip || !(firstCard instanceof HTMLElement)) return;
    const gap = Number.parseFloat(getComputedStyle(strip).columnGap) || 0;
    strip.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: 'smooth' });
  }, []);

  if (products.length === 0) return null;
  const regionLabel = `${titleLead} ${titleAccent}`;

  return (
    <section aria-labelledby="home-products-title" className="bg-background py-12 md:py-16 xl:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1040px]">
          <Reveal>
            <HomeSectionHeader
              actions={
                <>
                  <button
                    aria-label={t('previousProducts')}
                    className={`${arrowButtonBase} border border-border bg-surface text-text-primary enabled:hover:bg-background-alt`}
                    disabled={!canPrev}
                    onClick={() => scrollStrip(-1)}
                    type="button"
                  >
                    <ListingIcon className="size-5 rotate-180" name="arrow" strokeWidth={2} />
                  </button>
                  <button
                    aria-label={t('nextProducts')}
                    className={`${arrowButtonBase} bg-primary-light text-primary-active enabled:hover:bg-primary enabled:hover:text-white`}
                    disabled={!canNext}
                    onClick={() => scrollStrip(1)}
                    type="button"
                  >
                    <ListingIcon className="size-5" name="arrow" strokeWidth={2} />
                  </button>
                </>
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
              className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-1 pb-4 pt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus md:gap-6"
              onKeyDown={(event) => handleStripKeyDown(event, scrollStrip)}
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
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
