import type { AboutData, Locale } from '@/content/types';
import { assertRequiredFields, loadMdxDirectory } from './load-mdx';

export async function getAboutData(locale: Locale): Promise<AboutData | null> {
  const items = await loadMdxDirectory<AboutData>('about', locale);
  const item = items[0];
  if (!item) return null;
  return assertRequiredFields(item, ['mission', 'milestones', 'partners'], `src/content/about/${locale}/about.mdx`);
}
