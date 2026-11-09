import 'server-only';

import { unstable_cache } from 'next/cache';
import { getDb } from '@/db/client';
import type { Locale } from '@/content/types';
import { compareStoredEntries, readLiveEntries, readLiveEntry, type StoredEntry } from '@/db/content-read';
import type { ContentCollection, ContentLocale } from '@/db/schema';
import { contentTags } from './cache-tags';
import { FALLBACK_LOCALE, readWithFallback } from './locale-fallback';
import { warnOncePerProcess } from './ui-data';

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

/**
 * Như getEntries nhưng áp fallback en theo bản ghi cho locale chưa đủ nội dung (ja — R-20a.2). vi/en = getEntries y nguyên.
 * Hai lần đọc (ja + en) đều qua data cache tag `content:<collection>` → revalidate collection làm mới cả hai.
 * KHÔNG dùng cho `ui_messages`: chữ giao diện ja dự phòng bằng ja.json (src/i18n/request.ts), không bằng bản en.
 */
export function getLocalizedEntries(collection: ContentCollection, locale: Locale): Promise<StoredEntry[]> {
  return readWithFallback(
    locale,
    (readLocale) => getEntries(collection, readLocale),
    (entry) => entry.slug,
    compareStoredEntries,
    () => warnOncePerProcess(`[content-store] ${collection}/${locale} thiếu bản ghi → dùng bản ${FALLBACK_LOCALE} (R-20a.2)`),
  );
}
