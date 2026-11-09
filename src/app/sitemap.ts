import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/content/types';
import { getAllPosts } from '@/lib/content/posts';
import { getAllCaseStudies } from '@/lib/content/case-studies';
import { getAllSolutions } from '@/lib/content/solutions';
import { getRegistrySlugs } from '@/lib/content/registry';
import { localizedPath } from '@/lib/seo';

// Render theo request (không build lúc next build — build không truy cập DB); chế độ db lấy dữ liệu từ data cache có tag (store.ts).
export const dynamic = 'force-dynamic';

const ROUTES = ['', 'about', 'solutions/enterprise', 'solutions/ai', 'products', 'case-studies', 'blog', 'contact'];

/**
 * Mỗi path chỉ phát URL + hreflang cho locale THỰC SỰ có trang (review P2-T02 MINOR #3): bài chỉ có ở 1 locale
 * (vd tin AI chỉ sinh ja) không sinh URL 404 ở locale khác. Trang tĩnh + sản phẩm (registry) có ở mọi locale.
 * `x-default` = bản vi; path không có bản vi → bỏ x-default.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const localesByPath = new Map<string, Set<Locale>>();
  const addPath = (path: string, locales: readonly Locale[]) => {
    const existing = localesByPath.get(path) ?? new Set<Locale>();
    for (const locale of locales) existing.add(locale);
    localesByPath.set(path, existing);
  };

  for (const path of ROUTES) addPath(path, routing.locales);
  for (const slug of await getRegistrySlugs('product')) addPath(`products/${slug}`, routing.locales);
  for (const locale of routing.locales) {
    const [posts, studies, solutions] = await Promise.all([
      getAllPosts(locale), getAllCaseStudies(locale), getAllSolutions(locale),
    ]);
    for (const { slug } of posts) addPath(`blog/${slug}`, [locale]);
    for (const { slug } of studies) addPath(`case-studies/${slug}`, [locale]);
    for (const { slug, category } of solutions) addPath(`solutions/${category === 'ai' ? 'ai' : 'enterprise'}/${slug}`, [locale]);
  }

  return [...localesByPath].flatMap(([path, locales]) => {
    const present = routing.locales.filter((locale) => locales.has(locale));
    const languages: Record<string, string> = {};
    for (const locale of present) languages[locale] = localizedPath(locale, path);
    if (languages.vi) languages['x-default'] = languages.vi;
    return present.map((locale) => ({ url: languages[locale], alternates: { languages } }));
  });
}
