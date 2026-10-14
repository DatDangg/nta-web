import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GlassVisual } from '@/components/listing/GlassVisual';
import { ListingExplorer } from '@/components/listing/ListingExplorer';
import { ListingHero } from '@/components/listing/ListingHero';
import type { ListingCta } from '@/components/listing/types';
import { CTABanner } from '@/components/shared/CTABanner';
import { getListingCtas, getListingLabels, getListingPages } from '@/lib/content/registry';
import type { Locale } from '@/content/types';
import { getAllCaseStudies } from '@/lib/content/case-studies';
import { getAllSolutions } from '@/lib/content/solutions';
import { toSolutionItems } from '@/lib/content/solution-listing';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const overviewMetadata: Record<Locale, Metadata> = {
  vi: { title: 'Giải pháp AI | NTA', description: 'Các giải pháp trí tuệ nhân tạo của NTA, từ trợ lý nội bộ, phân tích hình ảnh đến AI tùy chỉnh, giúp doanh nghiệp khai thác dữ liệu và tự động hóa vận hành.' },
  en: { title: 'AI Solutions | NTA', description: 'NTA artificial intelligence solutions, from internal assistants and image analysis to custom AI, help businesses harness data and automate operations.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  return {
    ...overviewMetadata[locale],
    alternates: { canonical: localizedPath(locale, 'solutions/ai'), ...createLocaleAlternates('solutions/ai') },
  };
}

export default async function AiSolutionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const [t, allSolutions, caseStudies, listingPages, listingCtas, listingLabels] = await Promise.all([
    getTranslations('solutions.ai'), getAllSolutions(locale), getAllCaseStudies(locale),
    getListingPages(locale), getListingCtas(locale), getListingLabels(locale),
  ]);
  const copy = listingPages.ai;
  const items = await toSolutionItems(locale, allSolutions, 'ai', (title) => t('imageAlt', { title }));
  const caseStudy = caseStudies.find((item) => item.slug === 'heritage-site-ai-camera');
  // Thẻ cuối lưới dẫn sang case study khu di tích (thay khối CaseStudyTeaser cũ); không có → mời liên hệ.
  const cta: ListingCta = caseStudy
    ? { ...listingCtas.ai, description: caseStudy.title, href: `/case-studies/${caseStudy.slug}`, icon: 'landmark' }
    : { title: t('ctaTitle'), description: t('ctaDescription'), label: locale === 'en' ? 'Contact us' : 'Liên hệ tư vấn', href: '/contact', icon: 'chat' };

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/ai` }])} />
      <ListingHero
        accent={copy.accent}
        breadcrumbs={copy.crumbs.map((label) => ({ label }))}
        description={copy.description}
        highlights={copy.highlights}
        lead={copy.lead}
        title={copy.title}
        visual={<GlassVisual card={copy.glassCard} tiles={copy.tiles} />}
      >
        <ListingExplorer
          ariaLabel={copy.ariaLabel}
          categories={copy.categories}
          columns={2}
          cta={cta}
          items={items}
          labels={{ ...listingLabels, searchPlaceholder: copy.searchPlaceholder }}
        />
      </ListingHero>
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
    </>
  );
}
