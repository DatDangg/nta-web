'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { CaseStudyShowcase } from '@/content/types';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from './icons';

type Props = { photos: CaseStudyShowcase['photos'] };

/** Carousel ảnh khu di tích: scroll-snap ngang + 2 nút trước/sau (bàn phím/touch vẫn cuộn được). */
export function ShowcasePhotos({ photos }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  if (photos.items.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
  };

  const arrowClass = 'flex size-11 items-center justify-center rounded-full border border-border bg-white text-text-primary shadow-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus';

  return (
    <section aria-label={photos.title} className="py-10 md:py-12">
      <Container className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>{photos.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.75rem,1.4rem+1.3vw,2.375rem)] font-bold leading-tight text-text-primary">{photos.title}</h2>
        </div>
        <div className="hidden shrink-0 gap-3 sm:flex">
          <button aria-label={photos.prevLabel} className={arrowClass} onClick={() => scrollBy(-1)} type="button">
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
          </button>
          <button aria-label={photos.nextLabel} className={arrowClass} onClick={() => scrollBy(1)} type="button">
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </Container>
      <Container>
        <ul
          className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
          ref={trackRef}
          tabIndex={0}
        >
          {photos.items.map((photo) => (
            <li className="relative aspect-[4/3] w-[78%] shrink-0 snap-start overflow-hidden rounded-xl sm:w-[46%] lg:w-[calc((100%-3rem)/4)]" key={photo.src}>
              <Image alt={photo.alt} className="object-cover transition-transform duration-slow hover:scale-[1.03]" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 46vw, 78vw" src={photo.src} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
