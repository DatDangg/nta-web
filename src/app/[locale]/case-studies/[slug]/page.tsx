import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ChallengeBlock } from '@/components/case-studies/ChallengeBlock';
import { ImageGallery } from '@/components/case-studies/ImageGallery';
import { MetaBar } from '@/components/case-studies/MetaBar';
import { RelatedStudies } from '@/components/case-studies/RelatedStudies';
import { ResultBlock } from '@/components/case-studies/ResultBlock';
import { SolutionBlock } from '@/components/case-studies/SolutionBlock';
import { CTABanner } from '@/components/shared/CTABanner';
import { PageHeader } from '@/components/shared/PageHeader';
import { getAllCaseStudies, getCaseStudyBySlug } from '@/lib/content/case-studies';
import { isLocale } from '@/lib/content/slug';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

export async function generateStaticParams() {
  return (await getAllCaseStudies('vi')).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const study = await getCaseStudyBySlug(locale, slug);
  if (!study) notFound();
  const path = `/case-studies/${slug}`;
  return {
    title: `${study.title} | Case Study | NTA`,
    description: study.result,
    alternates: { canonical: localizedPath(locale, path), ...createLocaleAlternates(path) },
  };
}

export default async function CaseStudyDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const [t, study, allStudies] = await Promise.all([getTranslations('caseStudies'), getCaseStudyBySlug(locale, slug), getAllCaseStudies(locale)]);
  if (!study) notFound();
  const related = study.related.flatMap((relatedSlug) => {
    const item = allStudies.find((candidate) => candidate.slug === relatedSlug);
    return item ? [item] : [];
  });
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: study.title, description: study.result, inLanguage: locale === 'en' ? 'en-US' : 'vi-VN',
    author: { '@type': 'Organization', name: 'NTA' }, publisher: { '@type': 'Organization', name: 'NTA' },
  };
  const labels = {
    client: t('meta.client'), sector: t('meta.sector'), year: t('meta.year'),
  };
  const cta = await getTranslations('solutions.ai');

  return <>
    <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/case-studies` }, { name: study.title, path: `${locale === 'en' ? '/en' : ''}/case-studies/${slug}` }])} />
    <PageHeader breadcrumbs={[{ label: t('title'), href: '/case-studies' }, { label: study.title }]} description={study.result} title={study.title} />
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} type="application/ld+json" />
    <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
      <MetaBar caseStudy={study} labels={labels} />
      <div className="mx-auto xl:max-w-[720px]">
        <ChallengeBlock content={study.challenge} title={t('challenge')} />
        <SolutionBlock content={study.solution} title={t('solution')} />
        <ResultBlock content={study.result} metrics={study.metrics ?? []} title={t('result')} />
      </div>
      <ImageGallery images={study.gallery} title={t('gallery')} />
    </div>
    <RelatedStudies categoryLabel={(item) => t(`categories.${item.category}`)} imageAlt={(item) => t('imageAlt', { title: item.title })} studies={related} title={t('related')} />
    <CTABanner description={cta('ctaDescription')} title={cta('ctaTitle')} variant="alt" />
  </>;
}
