'use client';

import Image from 'next/image';
import { useId, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { CaseStudyShowcase } from '@/content/types';
import { Container } from '@/components/ui/Container';
import { Lightbox } from '@/components/ui/Lightbox';
import { Eyebrow } from './icons';

type Props = { photos: NonNullable<CaseStudyShowcase['photos']> };

const ARROW_CLASS = 'flex size-11 items-center justify-center rounded-full border border-border bg-white text-text-primary shadow-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus';

/**
 * Carousel ảnh khu di tích: scroll-snap ngang + 2 nút trước/sau (bàn phím/touch vẫn cuộn được).
 * `caption` (BR-004) hiển thị dưới dải ảnh khi ảnh là minh hoạ, chưa phải ảnh chụp thực tế.
 * Bấm ảnh → `Lightbox` phóng to tại ảnh đó; đóng xong focus quay về đúng nút ảnh đã bấm.
 */
export function ShowcasePhotos({ photos }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const titleId = useId();
  const t = useTranslations('common.lightbox');
  if (photos.items.length === 0) return null;
  const isScreen = photos.variant === 'screen';
  const isPhone = photos.variant === 'phone';
  const itemClass = isPhone
    ? 'w-[46%] rounded-2xl border border-border bg-white shadow-sm sm:w-[30%] lg:w-[calc((100%-5rem)/6)]'
    : `aspect-[4/3] w-[78%] rounded-xl sm:w-[46%] lg:w-[calc((100%-3rem)/4)] ${isScreen ? 'border border-border bg-white shadow-sm' : ''}`;
  const imageSizes = isPhone ? '(min-width: 1024px) 200px, (min-width: 640px) 30vw, 46vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 46vw, 78vw';

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
  };

  const openLightbox = (index: number, event: MouseEvent<HTMLButtonElement>) => {
    openerRef.current = event.currentTarget;
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    openerRef.current?.focus();
  };

  return (
    <section aria-labelledby={titleId} className="py-10 md:py-12">
      <Container className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>{photos.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.75rem,1.4rem+1.3vw,2.375rem)] font-bold leading-tight text-text-primary" id={titleId}>{photos.title}</h2>
        </div>
        <div className="hidden shrink-0 gap-3 sm:flex">
          <button aria-label={photos.prevLabel} className={ARROW_CLASS} onClick={() => scrollBy(-1)} type="button">
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </button>
          <button aria-label={photos.nextLabel} className={ARROW_CLASS} onClick={() => scrollBy(1)} type="button">
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </Container>
      <Container>
        <ul
          aria-labelledby={titleId}
          className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
          ref={trackRef}
          tabIndex={0}
        >
          {photos.items.map((photo, index) => (
            <li className={`relative shrink-0 snap-start overflow-hidden ${itemClass}`} key={photo.src} style={isPhone ? { aspectRatio: photos.aspect ?? '9/16' } : undefined}>
              <button
                aria-label={t('open', { alt: photo.alt })}
                className="absolute inset-0 block cursor-zoom-in rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
                onClick={(event) => openLightbox(index, event)}
                type="button"
              >
                <Image alt={photo.alt} className={`object-cover transition-transform duration-slow hover:scale-[1.03] ${isScreen ? 'object-left-top' : ''} ${isPhone ? 'object-top' : ''}`} fill sizes={imageSizes} src={photo.src} />
              </button>
            </li>
          ))}
        </ul>
        {photos.caption && <p className="mt-3 text-xs text-text-secondary">{photos.caption}</p>}
      </Container>
      <Lightbox index={lightboxIndex} items={photos.items} onClose={closeLightbox} onIndexChange={setLightboxIndex} />
    </section>
  );
}
