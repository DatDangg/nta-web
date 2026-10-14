import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutPeople } from '@/components/about/AboutPeople';
import { AboutValues } from '@/components/about/AboutValues';
import { MilestoneTimeline } from '@/components/about/MilestoneTimeline';
import { PartnerLogos } from '@/components/about/PartnerLogos';
import { CTABanner } from '@/components/shared/CTABanner';
import { getAboutData } from '@/lib/content/about';
import type { Locale } from '@/content/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const aboutMetadata: Record<Locale, { title: string; description: string }> = {
  vi: {
    title: 'Về NTA | NTA',
    description: 'Tìm hiểu về NTA và năng lực phát triển giải pháp doanh nghiệp, trí tuệ nhân tạo cùng ứng dụng di động thực tế cho doanh nghiệp và tổ chức tại Việt Nam.',
  },
  en: {
    title: 'About NTA | NTA',
    description: 'Learn about NTA and our expertise in enterprise solutions, artificial intelligence and practical mobile apps for businesses and organizations across Vietnam.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  const metadata = aboutMetadata[locale];
  return {
    title: metadata.title,
    description: metadata.description,
    alternates: { canonical: localizedPath(locale, 'about'), ...createLocaleAlternates('about') },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const [t, about] = await Promise.all([getTranslations('about'), getAboutData(locale)]);
  if (!about) notFound();

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/about` }])} />
      <AboutHero />
      <AboutValues />
      <AboutPeople />
      <MilestoneTimeline milestones={about.milestones} title={t('milestonesTitle')} />
      <PartnerLogos partners={about.partners} title={t('partnersTitle')} />
      <CTABanner description={t('ctaDescription')} title={t('ctaTitle')} variant="alt" />
    </>
  );
}
