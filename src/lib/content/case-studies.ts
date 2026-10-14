import type { CaseStudy, Locale } from '@/content/types';
import { assertCollectionFields, describeMdxRecord, loadMdxCollection } from './load-mdx';

/** Thứ tự hiển thị case study dùng chung (trang /case-studies + trang chủ): năm giảm dần, rồi slug. */
export function compareCaseStudies(left: CaseStudy, right: CaseStudy): number {
  return right.year - left.year || left.slug.localeCompare(right.slug);
}

export async function getAllCaseStudies(locale: Locale): Promise<CaseStudy[]> {
  const items = await loadMdxCollection<CaseStudy>('case_study', locale);
  return items.map((item) => assertCollectionFields(item, 'case_study', describeMdxRecord('case_study', locale, item.slug)));
}

export async function getCaseStudyBySlug(locale: Locale, slug: string): Promise<CaseStudy | null> {
  return (await getAllCaseStudies(locale)).find((item) => item.slug === slug) ?? null;
}
