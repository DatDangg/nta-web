import type { Locale, Solution, WithShowcase } from '@/content/types';
import { assertCollectionFields, describeMdxRecord, loadMdxCollection } from './load-mdx';
import { isAiSlug, isEnterpriseSlug } from './slug';

export async function getAllSolutions(locale: Locale): Promise<WithShowcase<Solution>[]> {
  const items = await loadMdxCollection<WithShowcase<Solution>>('solution', locale);
  return items.map((item) => assertCollectionFields(item, 'solution', describeMdxRecord('solution', locale, item.slug)));
}

export async function getSolutionBySlug(locale: Locale, slug: string): Promise<WithShowcase<Solution> | null> {
  if (!isEnterpriseSlug(slug) && !isAiSlug(slug)) return null;
  return (await getAllSolutions(locale)).find((item) => item.slug === slug) ?? null;
}
