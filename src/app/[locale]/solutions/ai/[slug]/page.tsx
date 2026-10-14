import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ShowcaseLayout } from '@/components/case-studies/showcase/ShowcaseLayout';
import { CaseStudyLink } from '@/components/solutions/CaseStudyLink';
import { CTAForm } from '@/components/contact/CTAForm';
import { getCaseStudyBySlug } from '@/lib/content/case-studies';
import { getSolutionBySlug } from '@/lib/content/solutions';
import { isLocale } from '@/lib/content/slug';
import { getDetailTiles, isRegisteredSlug } from '@/lib/content/registry';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';

// Không prerender slug lúc build (build không truy cập DB — decisions.md CR-031 P3-T02): render lần đầu theo yêu cầu rồi cache.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [isAi, solution] = await Promise.all([isRegisteredSlug('ai', slug), getSolutionBySlug(locale, slug)]);
  if (!isAi || !solution || solution.category !== 'ai') notFound();
  const path = `/solutions/ai/${slug}`;
  return {
    title: `${solution.brandName ?? solution.title} | NTA`,
    description: solution.description,
    alternates: { canonical: localizedPath(locale, path), ...createLocaleAlternates(path) },
  };
}

/**
 * Trang chi tiết giải pháp AI — khung chi tiết dùng chung (`ShowcaseLayout`, R-08c).
 * Nội dung nằm trong block `showcase` của frontmatter MDX; thiếu block → loader báo lỗi lúc build.
 */
export default async function AiSolutionDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const [t, isAi, solution, tiles] = await Promise.all([
    getTranslations('solutions.ai'), isRegisteredSlug('ai', slug), getSolutionBySlug(locale, slug), getDetailTiles(locale, slug),
  ]);
  if (!isAi || !solution || solution.category !== 'ai') notFound();
  const relatedCase = solution.relatedCases?.[0]
    ? await getCaseStudyBySlug(locale, solution.relatedCases[0])
    : null;

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/ai` }, { name: solution.title, path: `${locale === 'en' ? '/en' : ''}/solutions/ai/${slug}` }])} />
      <ShowcaseLayout breadcrumbs={[{ label: t('title'), href: '/solutions/ai' }, { label: solution.brandName ?? solution.title }]} showcase={solution.showcase} tiles={tiles} />
      <CaseStudyLink caseStudy={relatedCase} linkLabel={t('caseStudyLink')} title={t('relatedCaseTitle')} />
      <CTAForm />
    </>
  );
}
