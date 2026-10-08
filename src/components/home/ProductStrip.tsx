'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ProductCard } from '@/components/cards/ProductCard';
import type { KeyboardEvent } from 'react';
import { Reveal } from '@/components/ui/Reveal';

type FeaturedProduct = {
  slug: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

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

export function ProductStrip({ products, title }: { products: FeaturedProduct[]; title: string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('home');
  if (products.length === 0) return null;

  const scrollStrip = (direction: -1 | 1) => {
    stripRef.current?.scrollBy({ left: direction * stripRef.current.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="bg-background py-12 md:py-16 xl:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <Reveal className="flex items-center justify-between gap-4">
          <h2 className="text-h2 font-bold leading-tight">{title}</h2>
          <div className="hidden gap-2 lg:flex">
            <button aria-label={t('previousProducts')} className="min-h-11 min-w-11 rounded-full border border-border" onClick={() => scrollStrip(-1)} type="button">←</button>
            <button aria-label={t('nextProducts')} className="min-h-11 min-w-11 rounded-full border border-border" onClick={() => scrollStrip(1)} type="button">→</button>
          </div>
        </Reveal>
        <Reveal className="mt-8">
          <div
            aria-label={title}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus sm:[&>*]:basis-[calc(66.666%-1rem)] md:[&>*]:basis-[calc(40%-1rem)] lg:[&>*]:basis-[calc(33.333%-1rem)]"
            onKeyDown={(event) => handleStripKeyDown(event, scrollStrip)}
            ref={stripRef}
            role="region"
            tabIndex={0}
          >
            {products.map((product) => (
              <ProductCard
                className="min-w-[82%] snap-start sm:min-w-0"
                imageAlt={product.alt}
                imageSrc={product.image}
                key={product.slug}
                product={{ ...product, screenshots: [product.image] }}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
