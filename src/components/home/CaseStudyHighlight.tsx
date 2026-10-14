import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/Container';
import type { ListingItemMeta } from '@/content/listings';
import { compareCaseStudies } from '@/lib/content/case-studies';
import { getListingItems } from '@/lib/content/registry';
import type { CaseStudy, Locale } from '@/content/types';
import { CaseStudyCarousel } from './CaseStudyCarousel';
import { HomeCaseStudyCard, type HomeCaseStudy } from './HomeCaseStudyCard';

/** Số thẻ tối đa của khối case study trang chủ (CR-016, R-03b). */
const MAX_HOME_CASE_STUDIES = 3;

function toHomeCaseStudy(study: CaseStudy, listingItems: Record<string, ListingItemMeta>, fallbackAlt: string): HomeCaseStudy {
  const galleryImage = study.cover ? undefined : study.gallery[0];
  return {
    slug: study.slug,
    title: study.title,
    // Cùng nguồn mô tả với thẻ ở trang /case-studies để 2 nơi không lệch nhau.
    description: study.showcase?.hero.description ?? study.result,
    sector: study.sector,
    icon: listingItems[study.slug]?.icon ?? 'building',
    image: study.cover ?? galleryImage?.src,
    // Ảnh lấy từ gallery thì dùng alt riêng của ảnh đó; ảnh cover dùng alt i18n chung.
    alt: galleryImage?.alt || fallbackAlt,
  };
}

/** Khối "Câu chuyện khách hàng" trang chủ theo mockup CR-016 `3.webp`: tối đa 3 thẻ, nút ←/→, "Xem tất cả". */
export async function CaseStudyHighlight({ studies, locale }: { studies: CaseStudy[]; locale: Locale }) {
  const [t, tCases, listingItems] = await Promise.all([getTranslations('home'), getTranslations('caseStudies'), getListingItems(locale)]);
  // Sort trên bản copy để khớp thứ tự trang /case-studies, không đổi mảng của caller.
  const cards = [...studies]
    .sort(compareCaseStudies)
    .slice(0, MAX_HOME_CASE_STUDIES)
    .map((study) => toHomeCaseStudy(study, listingItems, tCases('imageAlt', { title: study.title })));

  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="home-cases-title" className="bg-background-alt py-12 md:py-16 xl:py-24">
      <Container>
        <CaseStudyCarousel
          description={t('caseStudyLead')}
          eyebrow={t('caseStudyEyebrow')}
          titleAccent={t('caseStudyTitleAccent')}
          titleLead={t('caseStudyTitleLead')}
        >
          {cards.map((study) => (
            <HomeCaseStudyCard
              className="w-[85%] shrink-0 snap-start md:w-[calc(50%-0.75rem)] lg:w-[calc((100%-3rem)/3)]"
              key={study.slug}
              study={study}
              viewDetailLabel={t('viewDetail')}
            />
          ))}
        </CaseStudyCarousel>
      </Container>
    </section>
  );
}
