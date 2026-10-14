import 'server-only';

import { unstable_cache } from 'next/cache';
import { getDb } from '@/db/client';
import { readLiveEntries, readLiveEntry, type StoredEntry } from '@/db/content-read';
import type { ContentCollection, ContentLocale } from '@/db/schema';
import { contentTags } from './cache-tags';

export type { StoredEntry } from '@/db/content-read';

// Tag data cache: xem ./cache-tags.ts (dùng chung với /api/revalidate).

// Lỗi DB phải NÉM ra (không trả rỗng): unstable_cache không lưu kết quả bị reject và Next không cache trang lỗi,
// nên trang đã cache vẫn được phục vụ còn trang chưa cache báo lỗi rõ (R-16). Không đưa DATABASE_URL vào message.
async function readOrThrow<T>(what: string, read: () => Promise<T>): Promise<T> {
  try {
    return await read();
  } catch (error) {
    throw new Error(`[content-store] Không đọc được nội dung ${what} từ DB`, { cause: error });
  }
}

export function getEntries(collection: ContentCollection, locale: ContentLocale): Promise<StoredEntry[]> {
  const cached = unstable_cache(
    () => readOrThrow(`${collection}/${locale}`, () => readLiveEntries(getDb(), collection, locale)),
    ['content-entries', collection, locale],
    { tags: contentTags(collection) },
  );
  return cached();
}

export function getEntry(collection: ContentCollection, slug: string, locale: ContentLocale): Promise<StoredEntry | null> {
  const cached = unstable_cache(
    () => readOrThrow(`${collection}/${locale}/${slug}`, () => readLiveEntry(getDb(), collection, slug, locale)),
    ['content-entry', collection, locale, slug],
    { tags: contentTags(collection, slug) },
  );
  return cached();
}
