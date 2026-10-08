import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BenefitList } from '@/components/solutions/BenefitList';
import { FeatureList } from '@/components/solutions/FeatureList';
import { RelatedSolutions } from '@/components/solutions/RelatedSolutions';
import { ScreenshotSection } from '@/components/solutions/ScreenshotSection';
import { CTABanner } from '@/components/shared/CTABanner';
import { PageHeader } from '@/components/shared/PageHeader';
import { getAllSolutions, getSolutionBySlug } from '@/lib/content/solutions';
import { enterpriseSlugs, getEnterpriseStaticParams, isEnterpriseSlug, isLocale } from '@/lib/content/slug';

type EnterpriseSlug = (typeof enterpriseSlugs)[number];

const enterpriseBrandNames: Record<EnterpriseSlug, string> = {
  crm: 'CRM',
  hrm: 'HRM',
  lms: 'LMS',
  dentgo: 'DentGo',
};

export function generateStaticParams() {
  return getEnterpriseStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const solution = await getSolutionBySlug(locale, slug);
  if (!solution || solution.category !== 'enterprise') notFound();
  const brandName = isEnterpriseSlug(solution.slug) ? enterpriseBrandNames[solution.slug] : solution.slug;
  const metadataTitle = locale === 'vi' ? `Giải pháp ${brandName} | NTA` : `${brandName} Solution | NTA`;
  const path = `/solutions/enterprise/${solution.slug}`;

  return {
    title: metadataTitle,
    description: solution.description,
    alternates: { languages: { vi: `https://ntasolution.vn${path}`, en: `https://ntasolution.vn/en${path}`, 'x-default': `https://ntasolution.vn${path}` } },
  };
}

export default async function EnterpriseSolutionDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const [t, solution, allSolutions] = await Promise.all([
    getTranslations('solutions.enterprise'),
    getSolutionBySlug(locale, slug),
    getAllSolutions(locale),
  ]);
  if (!solution || solution.category !== 'enterprise') notFound();
  const relatedSolutions = solution.relatedCases?.length
    ? allSolutions.filter((candidate) => candidate.category === 'enterprise' && candidate.slug !== solution.slug && candidate.relatedCases?.some((relatedCase) => solution.relatedCases?.includes(relatedCase)))
    : [];

  return (
    <>
      <PageHeader breadcrumbs={[{ label: t('title'), href: '/solutions/enterprise' }, { label: solution.title }]} description={solution.description} title={solution.title} />
      <div className="mx-auto grid w-full max-w-container grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18.75rem] lg:px-8 xl:gap-16">
        <div className="min-w-0 xl:max-w-[720px]">
          <FeatureList features={solution.features} title={t('featuresTitle')} />
          <BenefitList benefits={solution.benefits} title={t('benefitsTitle')} />
          <ScreenshotSection imageAlt={solution.title} images={solution.screenshots ?? []} title={t('screenshotsTitle')} />
        </div>
        <div className="pb-12 lg:py-12">
          <RelatedSolutions solutions={relatedSolutions} title={t('relatedTitle')} />
        </div>
      </div>
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
    </>
  );
}
