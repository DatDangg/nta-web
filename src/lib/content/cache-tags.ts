import type { ContentCollection } from '@/db/schema';

// Tag data cache nội dung DB (CR-031) — dùng chung store.ts (gắn tag lúc đọc) và /api/revalidate (làm mới, P3-T03):
//   `content` = toàn bộ · `content:<collection>` = mọi bản ghi + danh sách của collection · `content:<collection>:<slug>` = 1 bản ghi.
export const ALL_CONTENT_TAG = 'content';

export function collectionTag(collection: ContentCollection): string {
  return `${ALL_CONTENT_TAG}:${collection}`;
}

export function entryTag(collection: ContentCollection, slug: string): string {
  return `${collectionTag(collection)}:${slug}`;
}

// Danh sách chỉ gắn tag collection (lúc đọc chưa biết slug) → sửa 1 bản ghi phải revalidate cả tag collection để danh sách mới.
export function contentTags(collection: ContentCollection, slug?: string): string[] {
  const tags = [ALL_CONTENT_TAG, collectionTag(collection)];
  if (slug !== undefined) tags.push(entryTag(collection, slug));
  return tags;
}
