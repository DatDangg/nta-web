import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CaseStudyLink } from '@/components/solutions/CaseStudyLink';
import { FeatureList } from '@/components/solutions/FeatureList';
import { UseCases } from '@/components/solutions/UseCases';
import { BenefitList } from '@/components/solutions/BenefitList';
import { SolutionSections } from '@/components/solutions/SolutionSections';
import { SolutionHighlights } from '@/components/solutions/SolutionHighlights';
import { FaqList } from '@/components/solutions/FaqList';
import { ScreenshotSection } from '@/components/solutions/ScreenshotSection';
import { CTAForm } from '@/components/contact/CTAForm';
import { SolutionHero } from '@/components/solutions/SolutionHero';
import { detailTiles } from '@/content/listings';
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
  const [t, common, solution] = await Promise.all([
    getTranslations('solutions.ai'), getTranslations('common.cta'), getSolutionBySlug(locale, slug),
  ]);
  if (!solution || solution.category !== 'ai') notFound();
  const relatedCase = solution.relatedCases?.[0]
    ? await getCaseStudyBySlug(locale, solution.relatedCases[0])
    : null;

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/ai` }, { name: solution.title, path: `${locale === 'en' ? '/en' : ''}/solutions/ai/${slug}` }])} />
      <SolutionHero
        breadcrumbs={[{ label: t('title'), href: '/solutions/ai' }, { label: brandNames[slug] }]}
        description={solution.description}
        image={solution.cardImage?.src}
        imageAlt={solution.cardImage?.alt}
        imageRatio={solution.cardImage?.ratio}
        primaryCta={{ href: '/contact', label: common('contact') }}
        secondaryCta={{ href: '#features', label: t('featuresTitle') }}
        tiles={detailTiles(locale, slug)}
        title={solution.title}
      />
      <div>
        <FeatureList id="features" features={solution.features.map((f) => (typeof f === 'string' ? f : f.title))} title={t('featuresTitle')} />
        {solution.benefits.length > 0 && <BenefitList benefits={solution.benefits} title={t('benefitsTitle')} />}
        <SolutionSections sections={solution.sections ?? []} />
        <SolutionHighlights highlights={solution.highlights ?? []} title={t('highlightsTitle')} />
        <UseCases cases={solution.useCases ?? []} title={t('useCasesTitle')} />
        <FaqList faq={solution.faq ?? []} title={t('faqTitle')} />
        <ScreenshotSection imageAlt={solution.title} images={solution.screenshots ?? []} title={t('screenshotsTitle')} />
      </div>
      <CaseStudyLink caseStudy={relatedCase} linkLabel={t('caseStudyLink')} title={t('relatedCaseTitle')} />
      <CTAForm />
    </>
  );
}
