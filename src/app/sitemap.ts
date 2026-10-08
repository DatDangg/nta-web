import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getAllPosts } from '@/lib/content/posts';
import { getAllCaseStudies } from '@/lib/content/case-studies';
import { getAllSolutions } from '@/lib/content/solutions';
import { BASE_URL } from '@/lib/seo';

const ROUTES = ['', 'about', 'solutions/enterprise', 'solutions/ai', 'products', 'case-studies', 'blog', 'contact'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = new Set(ROUTES);
  for (const locale of routing.locales) {
    const [posts, studies, solutions] = await Promise.all([
      getAllPosts(locale), getAllCaseStudies(locale), getAllSolutions(locale),
    ]);
    for (const { slug } of posts) paths.add(`blog/${slug}`);
    for (const { slug } of studies) paths.add(`case-studies/${slug}`);
    for (const { slug, category } of solutions) paths.add(`solutions/${category === 'ai' ? 'ai' : 'enterprise'}/${slug}`);
  }
  return [...paths].flatMap((path) => {
    const languages = {
      vi: `${BASE_URL}${path ? `/${path}` : ''}`,
      en: `${BASE_URL}/en${path ? `/${path}` : ''}`,
    };
    return routing.locales.map((locale) => ({
      url: languages[locale],
      alternates: { languages: { ...languages, 'x-default': languages.vi } },
    }));
  });
}
