import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CaseStudyLink } from '@/components/solutions/CaseStudyLink';
import { FeatureList } from '@/components/solutions/FeatureList';
import { UseCases } from '@/components/solutions/UseCases';
import { CTAForm } from '@/components/contact/CTAForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { getCaseStudyBySlug } from '@/lib/content/case-studies';
import { getSolutionBySlug } from '@/lib/content/solutions';
import { getAiStaticParams, isAiSlug, isLocale } from '@/lib/content/slug';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const brandNames = { boxai: 'BoxAI', flycam: 'Flycam', 'custom-ai': 'Custom AI' };

export function generateStaticParams() {
  return getAiStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isAiSlug(slug)) notFound();
  const solution = await getSolutionBySlug(locale, slug);
  if (!solution || solution.category !== 'ai') notFound();
  const path = `/solutions/ai/${slug}`;
  return {
    title: `${brandNames[slug]} | NTA`,
    description: solution.description,
    alternates: { canonical: localizedPath(locale, path), ...createLocaleAlternates(path) },
  };
}

export default async function AiSolutionDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isAiSlug(slug)) notFound();
  setRequestLocale(locale);
  const [t, solution] = await Promise.all([
    getTranslations('solutions.ai'), getSolutionBySlug(locale, slug),
  ]);
  if (!solution || solution.category !== 'ai') notFound();
  const relatedCase = solution.relatedCases?.[0]
    ? await getCaseStudyBySlug(locale, solution.relatedCases[0])
    : null;

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/ai` }, { name: solution.title, path: `${locale === 'en' ? '/en' : ''}/solutions/ai/${slug}` }])} />
      <PageHeader breadcrumbs={[{ label: t('title'), href: '/solutions/ai' }, { label: solution.title }]} description={solution.description} title={t('detailTitle', { title: solution.title })} />
      <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 xl:max-w-[720px]">
          <FeatureList features={solution.features} title={t('featuresTitle')} />
          <UseCases cases={solution.useCases ?? []} title={t('useCasesTitle')} />
        </div>
      </div>
      <CaseStudyLink caseStudy={relatedCase} linkLabel={t('caseStudyLink')} title={t('relatedCaseTitle')} />
      <CTAForm />
    </>
  );
}
