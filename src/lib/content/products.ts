import type { Locale, Product } from '@/content/types';
import { assertRequiredFields, loadMdxDirectory } from './load-mdx';
import { isProductSlug } from './slug';

export async function getAllProducts(locale: Locale): Promise<Product[]> {
  const items = await loadMdxDirectory<Product>('products', locale);
  return items.map((item) => assertRequiredFields(item, ['slug', 'title', 'description', 'screenshots'], `src/content/products/${locale}/${item.slug}.mdx`));
}

export async function getProductBySlug(locale: Locale, slug: string): Promise<Product | null> {
  if (!isProductSlug(slug)) return null;
  return (await getAllProducts(locale)).find((item) => item.slug === slug) ?? null;
}
