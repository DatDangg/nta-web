import type { BlogCategory } from '@/content/types';

/** Thứ tự chip trên trang `/blog` (R-09a, theo mockup). */
export const BLOG_CATEGORIES = ['ai-tech', 'practical', 'customer-stories', 'nta-news', 'trends', 'guides'] as const satisfies readonly BlogCategory[];

export function isBlogCategory(value: unknown): value is BlogCategory {
  return typeof value === 'string' && (BLOG_CATEGORIES as readonly string[]).includes(value);
}
