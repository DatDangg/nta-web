'use client';

import Image from 'next/image';
import { type KeyboardEvent, useRef, useState } from 'react';
import { CARD_POSTER_IMAGE_RATIO } from '@/components/cards/cardStyles';

interface ScreenshotCarouselProps {
  screenshots: string[];
  title: string;
  imageAlt: string;
  previousLabel: string;
  nextLabel: string;
  ariaRoleDescription?: string;
}

export function ScreenshotCarousel({ screenshots, title, imageAlt, previousLabel, nextLabel, ariaRoleDescription = 'carousel' }: ScreenshotCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const slidesRef = useRef<HTMLDivElement>(null);

  function showPrevious() {
    scrollToIndex((activeIndex - 1 + screenshots.length) % screenshots.length);
  }

  function showNext() {
    scrollToIndex((activeIndex + 1) % screenshots.length);
  }

  function scrollToIndex(index: number) {
    const slide = slidesRef.current?.children.item(index);
    if (!slide) return;
    setActiveIndex(index);
    const container = slidesRef.current;
    if (!container) return;
    const left = container.scrollLeft + slide.getBoundingClientRect().left - container.getBoundingClientRect().left;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    container.scrollTo({ left, behavior });
  }

  function updateActiveIndex() {
    const slides = slidesRef.current;
    if (!slides) return;
    const nearestIndex = Array.from(slides.children).reduce((nearest, child, index) => {
      const nearestSlide = slides.children.item(nearest);
      if (!nearestSlide) return index;
      return Math.abs(child.getBoundingClientRect().left - slides.getBoundingClientRect().left) <
        Math.abs(nearestSlide.getBoundingClientRect().left - slides.getBoundingClientRect().left) ? index : nearest;
    }, 0);
    setActiveIndex(nearestIndex);
  }

  function markImageFailed(source: string) {
    setFailedImages((current) => current.includes(source) ? current : [...current, source]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (screenshots.length < 2 || event.target !== event.currentTarget) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPrevious(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showNext(); }
  }

  if (screenshots.length === 0) return null;
  const hasMultiple = screenshots.length > 1;

  return (
    <section aria-label={title} aria-roledescription={ariaRoleDescription} className="rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus" onKeyDown={handleKeyDown} role="region" tabIndex={0}>
      <div className="flex items-center justify-center gap-2 sm:gap-5">
        {hasMultiple ? <ArrowButton direction="previous" label={previousLabel} onClick={showPrevious} /> : <span aria-hidden="true" className="w-11 shrink-0" />}
        <div className="w-[200px] shrink-0 overflow-hidden rounded-[28px] bg-surface-sunken shadow-[0_40px_80px_-24px_rgb(17_24_39/0.35)] ring-1 ring-black/5 sm:w-[260px] lg:w-[280px]">
          <div className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] motion-reduce:snap-none motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden" onScroll={updateActiveIndex} ref={slidesRef}>
            {screenshots.map((screenshot) => (
              <div className="w-full shrink-0 snap-start" key={screenshot}>
                {failedImages.includes(screenshot) ? (
                  <div aria-label={imageAlt} className={phoneImageClass} role="img" />
                ) : (
                  <Image alt={imageAlt} className={phoneImageClass} height={CARD_POSTER_IMAGE_RATIO.height} loading="lazy" onError={() => markImageFailed(screenshot)} sizes="(min-width: 1024px) 280px, 260px" src={screenshot} width={CARD_POSTER_IMAGE_RATIO.width} />
                )}
              </div>
            ))}
          </div>
        </div>
        {hasMultiple ? <ArrowButton direction="next" label={nextLabel} onClick={showNext} /> : <span aria-hidden="true" className="w-11 shrink-0" />}
      </div>
      {hasMultiple && <div className="mt-4 flex min-h-11 items-center justify-center">
        {screenshots.map((screenshot, index) => (
          <button
            aria-current={index === activeIndex ? 'true' : undefined}
            aria-label={`${title} ${index + 1}`}
            className="group/dot flex min-h-11 min-w-8 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
            key={screenshot}
            onClick={() => scrollToIndex(index)}
            type="button"
          >
            <span aria-hidden="true" className={`block h-2 rounded-full motion-safe:transition-all motion-safe:duration-base ${index === activeIndex ? 'w-6 bg-text-primary' : 'w-2 bg-black/15 group-hover/dot:bg-black/30'}`} />
          </button>
        ))}
      </div>}
    </section>
  );
}

const phoneImageClass = 'aspect-[9/16] w-full bg-surface-sunken object-cover';

function ArrowButton({ direction, label, onClick }: { direction: 'previous' | 'next'; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background/80 text-text-primary shadow-sm ring-1 ring-black/5 backdrop-blur motion-safe:transition-[background-color,transform] motion-safe:duration-fast hover:bg-background motion-safe:hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      onClick={onClick}
      type="button"
    >
      <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" viewBox="0 0 24 24" width="18">
        <path d={direction === 'previous' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
      </svg>
    </button>
  );
}
