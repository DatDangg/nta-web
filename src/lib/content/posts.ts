import type { Locale, MdxDocument, Post } from '@/content/types';
import { assertRequiredFields, loadMdxDirectory } from './load-mdx';
import { isLocale } from './slug';

export async function getAllPosts(locale: Locale): Promise<Post[]> {
  const posts = await loadMdxDirectory<Post>('blog', locale);
  return posts.map((post) => assertRequiredFields(post, ['slug', 'title', 'date', 'category', 'excerpt', 'cover', 'body'], `src/content/blog/${locale}/${post.slug}.mdx`))
    .sort((first, second) => second.date.localeCompare(first.date));
}

export async function getPostBySlug(locale: Locale, slug: string): Promise<Post | null> {
  return (await getAllPosts(locale)).find((post) => post.slug === slug) ?? null;
}

export async function getMdxDocument(locale: string, slug: string): Promise<MdxDocument | null> {
  if (!isLocale(locale) || !/^[a-z0-9-]+$/.test(slug)) return null;
  const post = await getPostBySlug(locale, slug);
  if (!post) return null;
  const { body, ...frontmatter } = post;
  return { frontmatter, source: body };
}
