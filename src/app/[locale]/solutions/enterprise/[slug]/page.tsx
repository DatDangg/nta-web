import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BenefitList } from '@/components/solutions/BenefitList';
import { FaqList } from '@/components/solutions/FaqList';
import { FeatureZigZag, FeatureImageRow } from '@/components/solutions/FeatureZigZag';
import { RelatedSolutions } from '@/components/solutions/RelatedSolutions';
import { ScreenshotSection } from '@/components/solutions/ScreenshotSection';
import { SolutionHero } from '@/components/solutions/SolutionHero';
import { SolutionSections } from '@/components/solutions/SolutionSections';
import { UseCases } from '@/components/solutions/UseCases';
import { BentoCompliance } from '@/components/solutions/BentoCompliance';
import { AiSection } from '@/components/solutions/AiSection';
import { AudienceCards } from '@/components/solutions/AudienceCards';
import { FaqAccordion } from '@/components/solutions/FaqAccordion';
import { normalizeFeatures } from '@/components/solutions/features';
import { Link } from '@/i18n/navigation';
import { Section } from '@/components/ui/Section';
import { buttonStyles } from '@/components/ui/Button';
import { CTAForm } from '@/components/contact/CTAForm';
import { getAllSolutions, getSolutionBySlug } from '@/lib/content/solutions';
import { enterpriseSlugs, getEnterpriseStaticParams, isEnterpriseSlug, isLocale } from '@/lib/content/slug';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';
import { detailTiles } from '@/content/listings';

type EnterpriseSlug = (typeof enterpriseSlugs)[number];

const enterpriseBrandNames: Record<EnterpriseSlug, string> = {
  crm: 'CRM',
  hrm: 'HRM',
  lms: 'LMS',
  dentgo: 'DentGo',
};

/**
 * Link demo trực tiếp của từng giải pháp — có link thì nút CTA chính thành "Xem demo"
 * (mở tab mới); chưa có (HRM) thì giữ "Đăng ký demo" → /contact.
 */
const enterpriseDemoUrls: Partial<Record<EnterpriseSlug, string>> = {
  crm: 'https://cms.dragonhotpotvietnam.com/',
  dentgo: 'http://demo1.76.13.214.188.sslip.io:8080/',
  lms: 'http://187.52.119.50:3002/',
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
  const extended = solution.renderExtendedContent === true;
  const hasRelated = relatedSolutions.length > 0;
  const isLmsLayout = solution.layout === 'lms';
  const demoUrl = isEnterpriseSlug(solution.slug) ? enterpriseDemoUrls[solution.slug] : undefined;
  const crumbs = [{ label: t('title'), href: '/solutions/enterprise' }, { label: isEnterpriseSlug(solution.slug) ? enterpriseBrandNames[solution.slug] : solution.title }];

  const jsonLd = (
    <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/enterprise` }, { name: solution.title, path: `${locale === 'en' ? '/en' : ''}/solutions/enterprise/${slug}` }])} />
  );

  // Hero dùng chung cho cả 2 nhánh layout (spec §3).
  const hero = (
    <SolutionHero
      breadcrumbs={crumbs}
      caption={solution.imageCaption}
      description={solution.description}
      image={solution.heroShot?.src}
      imageAlt={solution.heroShot?.alt}
      imageMaxW={solution.heroShot?.maxWidth ?? 'max-w-full'}
      imageRatio={solution.heroShot?.ratio}
      primaryCta={demoUrl ? { href: demoUrl, label: t('viewDemoCta'), external: true } : { href: '/contact', label: t('demoCta') }}
      tiles={detailTiles(locale, solution.slug)}
      secondaryCta={{
        ariaLabel: t('featuresCtaAria'),
        href: '#features',
        label: t('featuresCta'),
      }}
      title={solution.title}
    />
  );

  // ── LMS: layout riêng 8 block theo đúng thứ tự spec §5, copy §11. ──
  // BỎ render benefits/useCases/sections/screenshots — data GIỮ NGUYÊN trong mdx (R2).
  if (isLmsLayout) {
    const features = normalizeFeatures(solution.features);
    const rowFeature = features[3];
    const { compliance, aiSection, audience, cta } = solution;

    return (
      <>
        {jsonLd}
        {hero}
        <FeatureZigZag features={features.slice(0, 3)} id="features" />
        {rowFeature ? <FeatureImageRow feature={rowFeature} /> : null}
        {compliance ? <BentoCompliance items={compliance.items} title={compliance.title} /> : null}
        {aiSection ? (
          <AiSection
            description={aiSection.description}
            panel={aiSection.panel}
            suggestions={aiSection.suggestions}
            title={aiSection.title}
          />
        ) : null}
        {audience ? <AudienceCards cards={audience.cards} title={audience.title} /> : null}
        <FaqAccordion items={solution.faq ?? []} title={t('faqTitle')} />
        {cta ? <LmsCtaBlock button={cta.button} demoUrl={demoUrl} description={cta.description} title={cta.title} /> : null}
        <CTAForm />
      </>
    );
  }

  // ── CRM / HRM / DentGo: layout chung (SolutionHero + zig-zag + sections mở rộng). ──
  return (
    <>
      {jsonLd}
      {hero}
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
          <FeatureZigZag caption={solution.imageCaption} features={solution.features} id="features" />
          <BenefitList benefits={solution.benefits} title={t('benefitsTitle')} />
          <SolutionSections sections={extended ? solution.sections ?? [] : []} />
          <UseCases cases={extended ? solution.useCases ?? [] : []} title={t('useCasesTitle')} />
          <FaqList faq={extended ? solution.faq ?? [] : []} title={t('faqTitle')} />
          <ScreenshotSection
            caption={solution.imageCaption}
            imageAlt={solution.title}
            images={solution.screenshots ?? []}
            shotFrame
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

/**
 * CTA cuối của layout LMS (spec §5.6): nền `background`, căn giữa, **1 nút** duy nhất
 * cho mỗi intent. Nút full-width ở mobile. Đặt TRƯỚC `CTAForm` (form tư vấn — intent khác).
 *
 * `Link` của next-intl + href tương đối: giữ đúng domain khi xem preview (Vercel), không
 * nhảy sang production như `localizedPath()`.
 */
function LmsCtaBlock({ title, description, button, demoUrl }: { title: string; description: string; button: string; demoUrl?: string }) {
  const className = `${buttonStyles('primary', 'lg')} w-full sm:w-auto`;
  return (
    <Section spacing="large">
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-h2 font-bold">{title}</h2>
        <p className="max-w-[52ch] text-body-lg text-text-secondary">{description}</p>
        {demoUrl ? (
          <a className={className} href={demoUrl} rel="noopener noreferrer" target="_blank">
            {button}
          </a>
        ) : (
          <Link className={className} href="/contact">
            {button}
          </Link>
        )}
      </div>
    </Section>
  );
}
