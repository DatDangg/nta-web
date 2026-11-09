// Fallback nội dung theo locale (R-20a.2, CR-044) — MỘT chỗ cho mọi nguồn (file + db), không rải trong page.
// Locale `ja` thiếu bản ghi → dùng bản `en` cùng collection/slug, theo TỪNG BẢN GHI: có bản ja thì dùng nguyên bản ja
// (không trộn field en vào). vi/en không có fallback → đi thẳng đường cũ, output không đổi.
// Không server-only để test được; phần đọc DB/đĩa truyền vào qua tham số `read`.
import type { Locale, LocaleRecord, RequiredContentLocale } from '@/content/types';

export const FALLBACK_LOCALE = 'en' satisfies RequiredContentLocale;

/** Locale có thể thiếu nội dung (chưa seed) → cần fallback en. */
export function needsContentFallback(locale: Locale): boolean {
  return locale === 'ja';
}

/** Chọn bản theo locale trong object TS `LocaleRecord`; thiếu (ja) → bản en. */
export function pickLocale<T>(record: LocaleRecord<T>, locale: Locale): T {
  return record[locale] ?? record[FALLBACK_LOCALE];
}

export interface FallbackMerge<T> {
  items: T[];
  /** Số bản ghi lấy từ fallback (bản locale chính không có). */
  fallbackCount: number;
}

/**
 * Gộp theo khoá: mỗi bản fallback được thay bằng bản cùng khoá của locale chính nếu có; bản chỉ có ở locale chính giữ nguyên.
 * Thứ tự trả về chưa sắp — caller sắp theo quy tắc của nguồn (sort_order/slug ở DB, tên file ở MDX).
 */
export function mergeByKey<T>(primary: readonly T[], fallback: readonly T[], keyOf: (item: T) => string): FallbackMerge<T> {
  const primaryByKey = new Map(primary.map((item) => [keyOf(item), item]));
  const fallbackKeys = new Set(fallback.map(keyOf));
  let fallbackCount = 0;
  const items: T[] = [];
  for (const item of fallback) {
    const own = primaryByKey.get(keyOf(item));
    if (own === undefined) fallbackCount += 1;
    items.push(own ?? item);
  }
  for (const item of primary) {
    if (!fallbackKeys.has(keyOf(item))) items.push(item);
  }
  return { items, fallbackCount };
}

/**
 * Đọc danh sách bản ghi của `locale`, áp fallback en theo bản ghi khi locale cần (ja).
 * `warn` chỉ được gọi khi thực sự dùng bản en — caller truyền hàm cảnh báo 1 lần/process (message cố định theo collection).
 */
export async function readWithFallback<T>(
  locale: Locale,
  read: (locale: Locale) => Promise<T[]>,
  keyOf: (item: T) => string,
  compare: (left: T, right: T) => number,
  warn: () => void,
): Promise<T[]> {
  if (!needsContentFallback(locale)) return read(locale);
  const [own, fallback] = await Promise.all([read(locale), read(FALLBACK_LOCALE)]);
  const { items, fallbackCount } = mergeByKey(own, fallback, keyOf);
  if (fallbackCount > 0) warn();
  return items.sort(compare);
}
