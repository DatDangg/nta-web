import type { Locale, Product, WithShowcase } from '@/content/types';
import { assertCollectionFields, describeMdxRecord, loadMdxCollection } from './load-mdx';
import { isProductSlug } from './slug';

export async function getAllProducts(locale: Locale): Promise<WithShowcase<Product>[]> {
  const items = await loadMdxCollection<WithShowcase<Product>>('product', locale);
  return items.map((item) => assertCollectionFields(item, 'product', describeMdxRecord('product', locale, item.slug)));
}

export async function getProductBySlug(locale: Locale, slug: string): Promise<WithShowcase<Product> | null> {
  if (!isProductSlug(slug)) return null;
  return (await getAllProducts(locale)).find((item) => item.slug === slug) ?? null;
}
