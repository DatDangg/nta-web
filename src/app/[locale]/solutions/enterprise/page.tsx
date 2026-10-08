import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SolutionCard } from '@/components/cards/SolutionCard';
import { CTABanner } from '@/components/shared/CTABanner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Reveal } from '@/components/ui/Reveal';
import { solutionOverview } from '@/content/solutions/overview';
import type { Locale } from '@/content/types';
import { getAllSolutions } from '@/lib/content/solutions';
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
  const [t, solutions] = await Promise.all([getTranslations('solutions.enterprise'), getAllSolutions(locale)]);
  const enterpriseSolutions = solutions.filter((solution) => solution.category === 'enterprise');

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/enterprise` }])} />
      <PageHeader breadcrumbs={[{ label: t('title') }]} description={t('description')} title={t('title')} variant="centered" />
      <section aria-labelledby="enterprise-solutions-list-title" className="bg-background-alt py-12 md:py-16 xl:py-24">
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only" id="enterprise-solutions-list-title">{t('title')}</h2>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {enterpriseSolutions.map((solution) => (
              <li key={solution.slug}>
                <Reveal>
                  <SolutionCard imageAlt={t('imageAlt', { title: solution.title })} solution={solution} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
    </>
  );
}
