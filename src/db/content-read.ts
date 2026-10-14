// Đọc bản ghi nội dung còn sống (deleted_at IS NULL) cho web — phần thuần nhận `db` để test được ngoài Next.
// Bọc cache + guard server-only nằm ở src/lib/content/store.ts.
import { and, eq, isNull } from "drizzle-orm";
import type { Database } from "./client";
import { contentEntries, type ContentCollection, type ContentLocale } from "./schema";

export interface StoredEntry {
  slug: string;
  data: Record<string, unknown>;
  body: string | null;
  sortOrder: number | null;
}

const entryColumns = {
  slug: contentEntries.slug,
  data: contentEntries.data,
  body: contentEntries.body,
  sortOrder: contentEntries.sortOrder,
};

function toStoredEntry(row: { slug: string; data: unknown; body: string | null; sortOrder: number | null }): StoredEntry {
  return { slug: row.slug, data: row.data as Record<string, unknown>, body: row.body, sortOrder: row.sortOrder };
}

// Thứ tự xác định, không phụ thuộc collation của Postgres: sort_order (null cuối) rồi slug so theo code point.
export function compareStoredEntries(left: StoredEntry, right: StoredEntry): number {
  if (left.sortOrder !== right.sortOrder) {
    if (left.sortOrder === null) return 1;
    if (right.sortOrder === null) return -1;
    return left.sortOrder - right.sortOrder;
  }
  if (left.slug === right.slug) return 0;
  return left.slug < right.slug ? -1 : 1;
}

export async function readLiveEntries(db: Database, collection: ContentCollection, locale: ContentLocale): Promise<StoredEntry[]> {
  const rows = await db
    .select(entryColumns)
    .from(contentEntries)
    .where(and(eq(contentEntries.collection, collection), eq(contentEntries.locale, locale), isNull(contentEntries.deletedAt)));
  return rows.map(toStoredEntry).sort(compareStoredEntries);
}

export async function readLiveEntry(db: Database, collection: ContentCollection, slug: string, locale: ContentLocale): Promise<StoredEntry | null> {
  const [row] = await db
    .select(entryColumns)
    .from(contentEntries)
    .where(
      and(
        eq(contentEntries.collection, collection),
        eq(contentEntries.slug, slug),
        eq(contentEntries.locale, locale),
        isNull(contentEntries.deletedAt),
      ),
    )
    .limit(1);
  return row ? toStoredEntry(row) : null;
}
