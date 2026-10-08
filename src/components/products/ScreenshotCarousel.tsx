'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

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

  if (screenshots.length === 0) return null;

  return (
    <section aria-label={title} aria-roledescription={ariaRoleDescription} role="region" tabIndex={0}>
      <div className="relative">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth motion-reduce:snap-none motion-reduce:scroll-auto" onScroll={updateActiveIndex} ref={slidesRef}>
          {screenshots.map((screenshot) => (
            <div className="w-full shrink-0 snap-start md:w-1/2 lg:w-1/3" key={screenshot}>
              {failedImages.includes(screenshot) ? (
                <div aria-label={imageAlt} className="aspect-[16/10] rounded-lg bg-surface-sunken xl:aspect-[4/5]" role="img" />
              ) : (
                <Image alt={imageAlt} className="aspect-[16/10] w-full rounded-lg bg-surface-sunken object-cover xl:aspect-[4/5]" height={1200} loading="lazy" onError={() => markImageFailed(screenshot)} sizes="(min-width: 1024px) 17vw, (min-width: 768px) 50vw, 100vw" src={screenshot} width={960} />
              )}
            </div>
          ))}
        </div>
        {screenshots.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between">
            <button aria-label={previousLabel} className="min-h-11 min-w-11 rounded-full bg-background text-text-primary shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" onClick={showPrevious} type="button">‹</button>
            <button aria-label={nextLabel} className="min-h-11 min-w-11 rounded-full bg-background text-text-primary shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus" onClick={showNext} type="button">›</button>
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {screenshots.map((screenshot, index) => (
          <button
            aria-current={index === activeIndex ? 'true' : undefined}
            aria-label={`${title} ${index + 1}`}
            className="min-h-11 min-w-11 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
            key={screenshot}
            onClick={() => scrollToIndex(index)}
            type="button"
          >
            <span aria-hidden="true" className={`block h-2 w-2 rounded-full ${index === activeIndex ? 'bg-primary' : 'bg-border'}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
