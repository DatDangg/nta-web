import type { Locale, MdxDocument, Post } from '@/content/types';
import { isBlogCategory } from '@/lib/blog/categories';
import { assertCollectionFields, describeMdxRecord, loadMdxCollection } from './load-mdx';
import { isLocale } from './slug';

type PostFile = Omit<Post, 'readingMinutes'>;

const WORDS_PER_MINUTE = 200;

/** Token tách theo khoảng trắng (tiếng Việt: mỗi âm tiết = 1 token), ceil(tokens/200), tối thiểu 1 phút. */
export function estimateReadingMinutes(body: string): number {
  const tokenCount = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(tokenCount / WORDS_PER_MINUTE));
}

function toPost(file: PostFile, filePath: string): Post {
  assertCollectionFields(file, 'post', filePath);
  if (!isBlogCategory(file.category)) {
    throw new Error(`Invalid content file ${filePath}: unknown category "${String(file.category)}"`);
  }
  return { ...file, readingMinutes: estimateReadingMinutes(file.body) };
}

export async function getAllPosts(locale: Locale): Promise<Post[]> {
  const files = await loadMdxCollection<PostFile>('post', locale);
  return files.map((file) => toPost(file, describeMdxRecord('post', locale, file.slug)))
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
