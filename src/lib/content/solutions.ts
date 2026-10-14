import type { Locale, Solution, WithShowcase } from '@/content/types';
import { assertCollectionFields, describeMdxRecord, loadMdxCollection } from './load-mdx';
import { isRegisteredSlug } from './registry';

export async function getAllSolutions(locale: Locale): Promise<WithShowcase<Solution>[]> {
  const items = await loadMdxCollection<WithShowcase<Solution>>('solution', locale);
  return items.map((item) => assertCollectionFields(item, 'solution', describeMdxRecord('solution', locale, item.slug)));
}

export async function getSolutionBySlug(locale: Locale, slug: string): Promise<WithShowcase<Solution> | null> {
  const [inEnterprise, inAi, solutions] = await Promise.all([isRegisteredSlug('enterprise', slug), isRegisteredSlug('ai', slug), getAllSolutions(locale)]);
  if (!inEnterprise && !inAi) return null;
  return solutions.find((item) => item.slug === slug) ?? null;
}
