import type { Locale, Solution, WithShowcase } from '@/content/types';
import { assertRequiredFields, loadMdxDirectory } from './load-mdx';
import { isAiSlug, isEnterpriseSlug } from './slug';

export async function getAllSolutions(locale: Locale): Promise<WithShowcase<Solution>[]> {
  const items = await loadMdxDirectory<WithShowcase<Solution>>('solutions', locale);
  return items.map((item) => assertRequiredFields(item, ['slug', 'title', 'description', 'features', 'benefits', 'category', 'showcase'], `src/content/solutions/${locale}/${item.slug}.mdx`));
}

export async function getSolutionBySlug(locale: Locale, slug: string): Promise<WithShowcase<Solution> | null> {
  if (!isEnterpriseSlug(slug) && !isAiSlug(slug)) return null;
  return (await getAllSolutions(locale)).find((item) => item.slug === slug) ?? null;
}
