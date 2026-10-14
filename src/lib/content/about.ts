import type { AboutData, Locale } from '@/content/types';
import { ABOUT_SLUG, assertCollectionFields, describeMdxRecord, loadMdxCollection } from './load-mdx';

export async function getAboutData(locale: Locale): Promise<AboutData | null> {
  const items = await loadMdxCollection<AboutData>('about', locale);
  const item = items[0];
  if (!item) return null;
  return assertCollectionFields(item, 'about', describeMdxRecord('about', locale, ABOUT_SLUG));
}
