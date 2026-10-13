import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GlassVisual } from '@/components/listing/GlassVisual';
import { ListingExplorer } from '@/components/listing/ListingExplorer';
import { ListingHero } from '@/components/listing/ListingHero';
import type { ListingItem } from '@/components/listing/types';
import { CTABanner } from '@/components/shared/CTABanner';
import { compareCaseStudies, getAllCaseStudies } from '@/lib/content/case-studies';
import { listingCtas, listingItems, listingLabels, listingPages } from '@/content/listings';
import type { Locale } from '@/content/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const pageMetadata: Record<Locale, Metadata> = {
  vi: { title: 'Case Study | NTA', description: 'Khám phá các dự án số hóa NTA đã triển khai cho doanh nghiệp và tổ chức, từ quản lý vận hành đến chuyển đổi số quy trình làm việc thực tế tại Việt Nam.' },
  en: { title: 'Case Studies | NTA', description: 'Explore digital projects delivered by NTA for businesses and organizations, from operations management to real-world digital transformation of workflows.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  return { ...pageMetadata[locale], alternates: { canonical: localizedPath(locale, 'case-studies'), ...createLocaleAlternates('case-studies') } };
}

export default async function CaseStudiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const [t, studies, cta] = await Promise.all([getTranslations('caseStudies'), getAllCaseStudies(locale), getTranslations('solutions.ai')]);
  studies.sort(compareCaseStudies);
  const copy = listingPages[locale].caseStudies;

  const items: ListingItem[] = studies.map((study) => {
    const meta = listingItems[locale][study.slug];
    const hero = study.showcase?.hero;
    const cover = study.cover ?? hero?.image.src ?? study.gallery[0]?.src;
    const categoryLabel = t(`categories.${study.category}`);
    return {
      id: study.slug,
      href: `/case-studies/${study.slug}`,
      title: study.title,
      subtitle: hero?.subtitle ?? study.client,
      description: hero?.description ?? study.result,
      chips: [categoryLabel, study.sector, String(study.year)].filter((chip): chip is string => Boolean(chip)),
      icon: meta?.icon ?? 'building',
      theme: meta?.theme ?? 'teal',
      categories: [study.category],
      status: hero?.eyebrow,
      keywords: [study.client, study.challenge, study.solution].filter(Boolean).join(' '),
      linkLabel: `${t('title')}: ${study.title}`,
      media: cover ? { kind: 'photo', src: cover, alt: t('imageAlt', { title: study.title }), width: hero?.image.width ?? 1590, height: hero?.image.height ?? 989 } : undefined,
    };
  });

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/case-studies` }])} />
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
          cta={{ ...listingCtas[locale].caseStudies, href: '/contact', icon: 'chat' }}
          items={items}
          labels={{ ...listingLabels[locale], searchPlaceholder: copy.searchPlaceholder }}
        />
      </ListingHero>
      <CTABanner description={cta('ctaDescription')} title={cta('ctaTitle')} variant="alt" />
    </>
  );
}
