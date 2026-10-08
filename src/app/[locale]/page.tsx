import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CaseStudyHighlight } from '@/components/home/CaseStudyHighlight';
import { Hero } from '@/components/home/Hero';
import { ProductStrip } from '@/components/home/ProductStrip';
import { SolutionGridHome } from '@/components/home/SolutionGridHome';
import { CTABanner } from '@/components/shared/CTABanner';
import { getHomeContent } from '@/content/home';
import type { Locale } from '@/content/types';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const homeMetadata: Record<Locale, { title: string; description: string }> = {
  vi: {
    title: 'NTA | Giải pháp Doanh nghiệp, AI và Ứng dụng AI',
    description: 'NTA cung cấp giải pháp số hóa về quản trị, AI và ứng dụng di động cho doanh nghiệp, cơ quan nhà nước, tối ưu vận hành và cải thiện trải nghiệm người dùng.',
  },
  en: {
    title: 'NTA | Enterprise, AI and App Solutions',
    description: 'NTA provides digital solutions in management, AI and mobile apps for businesses and government agencies to improve daily workflows and user experiences.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  const metadata = homeMetadata[locale];

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: { canonical: localizedPath(locale), ...createLocaleAlternates('') },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);

  const [t, home] = await Promise.all([
    getTranslations('home'),
    Promise.resolve(getHomeContent(locale)),
  ]);

  return (
    <>
      <Hero />
      <SolutionGridHome solutions={home.solutionCards} title={t('solutionsTitle')} />
      <ProductStrip products={home.featuredProducts} title={t('productsTitle')} />
      <CaseStudyHighlight study={home.featuredCase} title={t('caseStudyTitle')} />
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="primary" />
    </>
  );
}
