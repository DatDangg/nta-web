'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ListingIcon } from '@/components/listing/icons';
import { Reveal } from '@/components/ui/Reveal';
import { Link } from '@/i18n/navigation';
import { HomeScrollArrows } from './HomeScrollArrows';
import { HomeSectionHeader } from './HomeSectionHeader';
import { scrollStripClass, useScrollButtons } from './useScrollButtons';

type CaseStudyCarouselProps = {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  description: string;
  /** Các thẻ đã render ở server — mỗi phần tử là 1 con trực tiếp của dải cuộn. */
  children: ReactNode;
};

/** Phần client của khối "Câu chuyện khách hàng": header có nút ←/→ + "Xem tất cả" và dải thẻ cuộn ngang. */
export function CaseStudyCarousel({ eyebrow, titleLead, titleAccent, description, children }: CaseStudyCarouselProps) {
  const t = useTranslations('home');
  const { stripRef, canPrev, canNext, scrollStrip, handleStripKeyDown } = useScrollButtons();

  return (
    <>
      <Reveal>
        <HomeSectionHeader
          actions={
            <>
              <HomeScrollArrows
                canNext={canNext}
                canPrev={canPrev}
                nextLabel={t('nextCases')}
                onScroll={scrollStrip}
                previousLabel={t('previousCases')}
              />
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-medium text-primary-active transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                href="/case-studies"
              >
                {t('viewAllCaseStudies')}
                <ListingIcon className="size-4" name="arrow" strokeWidth={2} />
              </Link>
            </>
          }
          description={description}
          descriptionPlacement="below"
          eyebrow={eyebrow}
          headingId="home-cases-title"
          titleAccent={titleAccent}
          titleLead={titleLead}
        />
      </Reveal>
      <Reveal className="mt-8 lg:mt-10">
        <div
          aria-label={`${titleLead} ${titleAccent}`}
          className={scrollStripClass}
          onKeyDown={handleStripKeyDown}
          ref={stripRef}
          role="region"
          tabIndex={0}
        >
          {children}
        </div>
      </Reveal>
    </>
  );
}
