import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SolutionCard } from '@/components/cards/SolutionCard';
import { CaseStudyTeaser } from '@/components/solutions/CaseStudyTeaser';
import { CTABanner } from '@/components/shared/CTABanner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import type { Locale } from '@/content/types';
import { getAllCaseStudies } from '@/lib/content/case-studies';
import { getAllSolutions } from '@/lib/content/solutions';
import { aiSlugs } from '@/lib/content/slug';
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
  const [t, allSolutions, caseStudies] = await Promise.all([
    getTranslations('solutions.ai'), getAllSolutions(locale), getAllCaseStudies(locale),
  ]);
  const aiSolutions = allSolutions.filter((solution) => solution.category === 'ai');
  const solutions = aiSlugs.flatMap((slug) => {
    const solution = aiSolutions.find((candidate) => candidate.slug === slug);
    return solution ? [solution] : [];
  });
  const caseStudy = caseStudies.find((item) => item.slug === 'oc-eo-learning') ?? null;

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/ai` }])} />
      <PageHeader breadcrumbs={[{ label: t('title') }]} description={t('description')} title={t('title')} variant="centered" />
      <section aria-labelledby="ai-solutions-list-title" className="bg-background-alt py-12 md:py-16 xl:py-24">
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only" id="ai-solutions-list-title">{t('title')}</h2>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution, index) => (
              <li className={solutions.length === 3 && index === 2 ? 'md:col-span-2 lg:col-span-1' : ''} key={solution.slug}>
                <Reveal><SolutionCard imageAlt={t('imageAlt', { title: solution.title })} solution={solution} /></Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CaseStudyTeaser caseStudy={caseStudy} linkLabel={t('caseStudyLink')} title={t('caseStudyTitle')} />
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
    </>
  );
}
