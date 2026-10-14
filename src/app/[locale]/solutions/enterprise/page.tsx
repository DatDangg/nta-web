import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GlassVisual } from '@/components/listing/GlassVisual';
import { ListingExplorer } from '@/components/listing/ListingExplorer';
import { ListingHero } from '@/components/listing/ListingHero';
import { CTABanner } from '@/components/shared/CTABanner';
import { getListingCtas, getListingLabels, getListingPages } from '@/lib/content/registry';
import type { Locale } from '@/content/types';
import { getAllSolutions } from '@/lib/content/solutions';
import { toSolutionItems } from '@/lib/content/solution-listing';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const pageMetadata: Record<Locale, Metadata> = {
  vi: { title: 'Giải pháp Doanh nghiệp | NTA', description: 'Các giải pháp quản trị khách hàng, nhân sự, đào tạo và vận hành nha khoa toàn diện của NTA giúp doanh nghiệp chuẩn hóa quy trình và tăng hiệu suất vận hành.' },
  en: { title: 'Enterprise Solutions | NTA', description: 'NTA enterprise solutions for customer management, HR, learning and dental operations help businesses standardize processes and improve operational efficiency.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  return {
    ...pageMetadata[locale],
    alternates: { canonical: localizedPath(locale, 'solutions/enterprise'), ...createLocaleAlternates('solutions/enterprise') },
  };
}

export default async function EnterpriseSolutionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const [t, solutions, listingPages, listingCtas, listingLabels] = await Promise.all([
    getTranslations('solutions.enterprise'), getAllSolutions(locale), getListingPages(locale), getListingCtas(locale), getListingLabels(locale),
  ]);
  const copy = listingPages.enterprise;
  const items = await toSolutionItems(locale, solutions, 'enterprise', (title) => t('imageAlt', { title }));

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/enterprise` }])} />
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
          cta={{ ...listingCtas.enterprise, href: '/solutions/ai', icon: 'sparkles' }}
          items={items}
          labels={{ ...listingLabels, searchPlaceholder: copy.searchPlaceholder }}
        />
      </ListingHero>
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
    </>
  );
}
