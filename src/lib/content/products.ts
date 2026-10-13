import type { Locale, Product, WithShowcase } from '@/content/types';
import { assertRequiredFields, loadMdxDirectory } from './load-mdx';
import { isProductSlug } from './slug';

export async function getAllProducts(locale: Locale): Promise<WithShowcase<Product>[]> {
  const items = await loadMdxDirectory<WithShowcase<Product>>('products', locale);
  return items.map((item) => assertRequiredFields(item, ['slug', 'title', 'description', 'screenshots', 'showcase'], `src/content/products/${locale}/${item.slug}.mdx`));
}

export async function getProductBySlug(locale: Locale, slug: string): Promise<WithShowcase<Product> | null> {
  if (!isProductSlug(slug)) return null;
  return (await getAllProducts(locale)).find((item) => item.slug === slug) ?? null;
}
