import type { Locale, Solution } from '@/content/types';
import { assertRequiredFields, loadMdxDirectory } from './load-mdx';
import { isAiSlug, isEnterpriseSlug } from './slug';

export async function getAllSolutions(locale: Locale): Promise<Solution[]> {
  const items = await loadMdxDirectory<Solution>('solutions', locale);
  return items.map((item) => assertRequiredFields(item, ['slug', 'title', 'description', 'features', 'benefits', 'category'], `src/content/solutions/${locale}/${item.slug}.mdx`));
}

export async function getSolutionBySlug(locale: Locale, slug: string): Promise<Solution | null> {
  if (!isEnterpriseSlug(slug) && !isAiSlug(slug)) return null;
  return (await getAllSolutions(locale)).find((item) => item.slug === slug) ?? null;
}
