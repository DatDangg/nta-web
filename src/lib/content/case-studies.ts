import type { CaseStudy, Locale } from '@/content/types';
import { assertRequiredFields, loadMdxDirectory } from './load-mdx';

/** Thứ tự hiển thị case study dùng chung (trang /case-studies + trang chủ): năm giảm dần, rồi slug. */
export function compareCaseStudies(left: CaseStudy, right: CaseStudy): number {
  return right.year - left.year || left.slug.localeCompare(right.slug);
}

export async function getAllCaseStudies(locale: Locale): Promise<CaseStudy[]> {
  const items = await loadMdxDirectory<CaseStudy>('case-studies', locale);
  return items.map((item) => assertRequiredFields(item, ['slug', 'title', 'category', 'year', 'challenge', 'solution', 'result', 'gallery', 'related'], `src/content/case-studies/${locale}/${item.slug}.mdx`));
}

export async function getCaseStudyBySlug(locale: Locale, slug: string): Promise<CaseStudy | null> {
  return (await getAllCaseStudies(locale)).find((item) => item.slug === slug) ?? null;
}
