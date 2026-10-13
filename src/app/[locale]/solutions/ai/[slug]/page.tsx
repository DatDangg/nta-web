import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ShowcaseLayout } from '@/components/case-studies/showcase/ShowcaseLayout';
import { CaseStudyLink } from '@/components/solutions/CaseStudyLink';
import { CTAForm } from '@/components/contact/CTAForm';
import { detailTiles } from '@/content/listings';
import { getCaseStudyBySlug } from '@/lib/content/case-studies';
import { getSolutionBySlug } from '@/lib/content/solutions';
import { getAiStaticParams, isAiSlug, isLocale } from '@/lib/content/slug';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

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
    title: `${solution.brandName ?? solution.title} | NTA`,
    description: solution.description,
    alternates: { canonical: localizedPath(locale, path), ...createLocaleAlternates(path) },
  };
}

/**
 * Trang chi tiết giải pháp AI — khung chi tiết dùng chung (`ShowcaseLayout`, R-08c).
 * Nội dung nằm trong block `showcase` của frontmatter MDX; thiếu block → build lỗi.
 */
export default async function AiSolutionDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isAiSlug(slug)) notFound();
  setRequestLocale(locale);
  const [t, solution] = await Promise.all([getTranslations('solutions.ai'), getSolutionBySlug(locale, slug)]);
  if (!solution || solution.category !== 'ai') notFound();
  if (!solution.showcase) {
    throw new Error(`src/content/solutions/${locale}/${slug}.mdx: thiếu block "showcase" (R-08c).`);
  }
  const relatedCase = solution.relatedCases?.[0]
    ? await getCaseStudyBySlug(locale, solution.relatedCases[0])
    : null;

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/ai` }, { name: solution.title, path: `${locale === 'en' ? '/en' : ''}/solutions/ai/${slug}` }])} />
      <ShowcaseLayout breadcrumbs={[{ label: t('title'), href: '/solutions/ai' }, { label: solution.brandName ?? solution.title }]} showcase={solution.showcase} tiles={detailTiles(locale, slug)} />
      <CaseStudyLink caseStudy={relatedCase} linkLabel={t('caseStudyLink')} title={t('relatedCaseTitle')} />
      <CTAForm />
    </>
  );
}
