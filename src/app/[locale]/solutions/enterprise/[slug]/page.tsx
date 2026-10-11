import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BenefitList } from '@/components/solutions/BenefitList';
import { FaqList } from '@/components/solutions/FaqList';
import { FeatureList } from '@/components/solutions/FeatureList';
import { FeatureZigZag } from '@/components/solutions/FeatureZigZag';
import { RelatedSolutions } from '@/components/solutions/RelatedSolutions';
import { ScreenshotSection } from '@/components/solutions/ScreenshotSection';
import { SolutionHero } from '@/components/solutions/SolutionHero';
import { SolutionSections } from '@/components/solutions/SolutionSections';
import { UseCases } from '@/components/solutions/UseCases';
import { CTAForm } from '@/components/contact/CTAForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { getAllSolutions, getSolutionBySlug } from '@/lib/content/solutions';
import { enterpriseSlugs, getEnterpriseStaticParams, isEnterpriseSlug, isLocale } from '@/lib/content/slug';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

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
    alternates: { canonical: localizedPath(locale, path), ...createLocaleAlternates(path) },
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
  // Opt-in per solution so CRM/LMS/DentGo keep their current layout while HRM gains the written content.
  const extended = solution.renderExtendedContent === true;
  const hasRelated = relatedSolutions.length > 0;
  // T4: 3 trang CRM/HRM/DentGo chuyển layout mới (SolutionHero + FeatureZigZag).
  // LMS set `layout: 'lms'` → giữ nhánh cũ, T5 sẽ thay bằng layout 8 block (spec §5).
  const useLegacyLayout = solution.layout === 'lms';
  const crumbs = [{ label: t('title'), href: '/solutions/enterprise' }, { label: solution.title }];

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/enterprise` }, { name: solution.title, path: `${locale === 'en' ? '/en' : ''}/solutions/enterprise/${slug}` }])} />
      {useLegacyLayout ? (
        <PageHeader breadcrumbs={crumbs} description={solution.description} title={solution.title} />
      ) : (
        <SolutionHero
          breadcrumbs={crumbs}
          caption={solution.imageCaption}
          description={solution.description}
          image={solution.heroShot?.src}
          imageAlt={solution.heroShot?.alt}
          imageMaxW={solution.heroShot?.maxWidth ?? 'max-w-full'}
          imageRatio={solution.heroShot?.ratio}
          primaryCta={{ href: localizedPath(locale, '/contact'), label: t('demoCta') }}
          secondaryCta={{
            ariaLabel: t('featuresCtaAria'),
            href: '#features',
            label: t('featuresCta'),
          }}
          title={solution.title}
        />
      )}
      {/* Chỉ chia 2 cột khi THỰC SỰ có related — giữ cột phải rỗng sẽ làm nội dung lệch trái.
          KHÔNG bọc Container ở cấp này: nó sẽ giới hạn bề rộng của mọi <Section> bên trong,
          khiến nền xen kẽ không tràn full-width (spec §1 L2). Container thuộc về từng Section.
          Nhánh 2 cột chỉ cần padding cho cột sidebar (nội dung chính tự có Container trong Section). */}
      <div
        className={
          hasRelated
            ? 'grid grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18.75rem] lg:px-8 xl:gap-16'
            : ''
        }
      >
        <div className="min-w-0">
          {useLegacyLayout ? (
            <FeatureList
              features={solution.features.map((f) => (typeof f === 'string' ? f : f.description ? `${f.title} — ${f.description}` : f.title))}
              title={t('featuresTitle')}
            />
          ) : (
            <FeatureZigZag caption={solution.imageCaption} features={solution.features} id="features" />
          )}
          <BenefitList benefits={solution.benefits} title={t('benefitsTitle')} />
          <SolutionSections sections={extended ? solution.sections ?? [] : []} />
          <UseCases cases={extended ? solution.useCases ?? [] : []} title={t('useCasesTitle')} />
          <FaqList faq={extended ? solution.faq ?? [] : []} title={t('faqTitle')} />
          <ScreenshotSection
            caption={useLegacyLayout ? undefined : solution.imageCaption}
            imageAlt={solution.title}
            images={solution.screenshots ?? []}
            shotFrame={!useLegacyLayout}
            title={t('screenshotsTitle')}
          />
        </div>
        {hasRelated && (
          <div className="pb-12 lg:py-12">
            <RelatedSolutions solutions={relatedSolutions} title={t('relatedTitle')} />
          </div>
        )}
      </div>
      <CTAForm />
    </>
  );
}
