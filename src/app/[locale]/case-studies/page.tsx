import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CaseStudyFilter } from '@/components/case-studies/CaseStudyFilter';
import { CaseStudyCard } from '@/components/cards/CaseStudyCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { getAllCaseStudies } from '@/lib/content/case-studies';
import type { Locale } from '@/content/types';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

const pageMetadata: Record<Locale, Metadata> = {
  vi: { title: 'Case Study | NTA', description: 'Khám phá các dự án số hóa NTA đã triển khai cho doanh nghiệp và tổ chức, từ quản lý vận hành đến chuyển đổi số quy trình làm việc thực tế tại Việt Nam.' },
  en: { title: 'Case Studies | NTA', description: 'Explore digital projects delivered by NTA for businesses and organizations, from operations management to real-world digital transformation of workflows.' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  return { ...pageMetadata[locale], alternates: { canonical: localizedPath(locale, 'case-studies'), ...createLocaleAlternates('case-studies') } };
}

export default async function CaseStudiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== 'vi' && locale !== 'en') notFound();
  setRequestLocale(locale);
  const [t, studies] = await Promise.all([getTranslations('caseStudies'), getAllCaseStudies(locale)]);
  studies.sort((left, right) => left.slug.localeCompare(right.slug));
  const defaultStudies = studies.slice(0, 9);
  return <><JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/case-studies` }])} /><PageHeader breadcrumbs={[{ label: t('title') }]} description={t('intro')} title={t('title')} variant="centered" /><section aria-label={t('title')} className="bg-background-alt py-12 md:py-16 xl:py-24"><div className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8"><Suspense fallback={<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{defaultStudies.map((study) => <li key={study.slug}><CaseStudyCard caseStudy={study} categoryLabel={t(`categories.${study.category}`)} imageAlt={t('imageAlt', { title: study.title })} /></li>)}</ul>}><CaseStudyFilter studies={studies} /></Suspense></div></section></>;
}
