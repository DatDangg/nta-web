import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ShowcaseLayout } from '@/components/case-studies/showcase/ShowcaseLayout';
import { RelatedSolutions } from '@/components/solutions/RelatedSolutions';
import { CTAForm } from '@/components/contact/CTAForm';
import { Container } from '@/components/ui/Container';
import { getAllSolutions, getSolutionBySlug } from '@/lib/content/solutions';
import { getEnterpriseStaticParams, isLocale } from '@/lib/content/slug';
import { JsonLd } from '@/components/seo/JsonLd';
import { createBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { createLocaleAlternates, localizedPath } from '@/lib/seo';
import { detailTiles } from '@/content/listings';

export function generateStaticParams() {
  return getEnterpriseStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const solution = await getSolutionBySlug(locale, slug);
  if (!solution || solution.category !== 'enterprise') notFound();
  const brandName = solution.brandName ?? solution.title;
  const metadataTitle = locale === 'vi' ? `Giải pháp ${brandName} | NTA` : `${brandName} Solution | NTA`;
  const path = `/solutions/enterprise/${solution.slug}`;

  return {
    title: metadataTitle,
    description: solution.description,
    alternates: { canonical: localizedPath(locale, path), ...createLocaleAlternates(path) },
  };
}

/**
 * Trang chi tiết giải pháp enterprise — khung chi tiết dùng chung (`ShowcaseLayout`, R-08c).
 * Toàn bộ nội dung (hero, demo, số liệu, pillar, ảnh, tính năng, tình huống sử dụng, FAQ, CTA)
 * nằm trong block `showcase` của frontmatter MDX; thiếu block → build lỗi thay vì render trang rỗng.
 */
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
  if (!solution.showcase) {
    throw new Error(`src/content/solutions/${locale}/${solution.slug}.mdx: thiếu block "showcase" (R-08c).`);
  }
  const relatedSolutions = solution.relatedCases?.length
    ? allSolutions.filter((candidate) => candidate.category === 'enterprise' && candidate.slug !== solution.slug && candidate.relatedCases?.some((relatedCase) => solution.relatedCases?.includes(relatedCase)))
    : [];
  const crumbs = [{ label: t('title'), href: '/solutions/enterprise' }, { label: solution.brandName ?? solution.title }];

  return (
    <>
      <JsonLd data={createBreadcrumbJsonLd([{ name: locale === 'en' ? 'Home' : 'Trang chủ', path: locale === 'en' ? '/en' : '/' }, { name: t('title'), path: `${locale === 'en' ? '/en' : ''}/solutions/enterprise` }, { name: solution.title, path: `${locale === 'en' ? '/en' : ''}/solutions/enterprise/${slug}` }])} />
      <ShowcaseLayout breadcrumbs={crumbs} showcase={solution.showcase} tiles={detailTiles(locale, solution.slug)} />
      {relatedSolutions.length > 0 && (
        <Container className="pb-12">
          <RelatedSolutions solutions={relatedSolutions} title={t('relatedTitle')} />
        </Container>
      )}
      <CTAForm />
    </>
  );
}
