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

const pageMetadata: Record<Locale, Metadata> = {
  vi: { title: 'Giải pháp Doanh nghiệp | NTA', description: 'Các giải pháp quản trị khách hàng, nhân sự, đào tạo và vận hành nha khoa dành cho doanh nghiệp.' },
  en: { title: 'Enterprise Solutions | NTA', description: 'Customer, HR, learning and dental operations solutions for businesses.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  return {
    ...pageMetadata[locale],
    alternates: { languages: { vi: 'https://ntasolution.vn/solutions/enterprise', en: 'https://ntasolution.vn/en/solutions/enterprise', 'x-default': 'https://ntasolution.vn/solutions/enterprise' } },
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
      <PageHeader breadcrumbs={[{ label: t('title') }]} description={t('description')} title={t('title')} variant="centered" />
      <section aria-label={t('title')} className="bg-background-alt py-12 md:py-16 xl:py-24">
        <div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
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
