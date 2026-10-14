import 'server-only';

import type { Locale } from '@/content/types';
import { REQUIRED_FIELDS } from '@/db/content-rules';
import { assertRequiredFields, loadMdxDirectory, MDX_COLLECTION_DIRECTORIES, type MdxCollection } from './mdx-files';
import { getContentSource } from './source';
import { getEntries, type StoredEntry } from './store';

// Phần đọc file nằm ở mdx-files.ts (không server-only) để tools/db dùng lại đúng logic này.
export { ABOUT_SLUG, assertRequiredFields, loadMdxDirectory } from './mdx-files';
export type { MdxCollection } from './mdx-files';

// Bản ghi DB → cùng hình dạng loader file trả (`{ ...frontmatter, body }`), cùng thứ tự readdir (tên file `<slug>.mdx`).
// Không dựa vào thứ tự key trong jsonb: code dùng record theo tên field, không theo Object.keys.
function toMdxRecord<T>(entry: StoredEntry): T {
  return { ...entry.data, body: entry.body } as T;
}

function compareByFileName(left: StoredEntry, right: StoredEntry): number {
  const leftName = `${left.slug}.mdx`;
  const rightName = `${right.slug}.mdx`;
  if (leftName === rightName) return 0;
  return leftName < rightName ? -1 : 1;
}

/** Bản ghi MDX của 1 collection theo cờ CONTENT_SOURCE (file = src/content, db = PostgreSQL). Lỗi DB được ném ra, không trả rỗng. */
export async function loadMdxCollection<T>(collection: MdxCollection, locale: Locale): Promise<T[]> {
  if (getContentSource() === 'file') return loadMdxDirectory<T>(MDX_COLLECTION_DIRECTORIES[collection], locale);
  const entries = await getEntries(collection, locale);
  return [...entries].sort(compareByFileName).map((entry) => toMdxRecord<T>(entry));
}

/** Nhãn bản ghi trong lỗi validate: đường dẫn file (như trước) ở chế độ file, khoá DB ở chế độ db. */
export function describeMdxRecord(collection: MdxCollection, locale: Locale, slug: string): string {
  if (getContentSource() === 'file') return `src/content/${MDX_COLLECTION_DIRECTORIES[collection]}/${locale}/${slug}.mdx`;
  return `content_entries ${collection}/${locale}/${slug}`;
}

/** Required fields lấy từ REQUIRED_FIELDS (src/db/content-rules.ts) — cùng nguồn với write-path + parity, không lệch. */
export function assertCollectionFields<T extends object>(record: T, collection: MdxCollection, recordLabel: string): T {
  const fields = REQUIRED_FIELDS[collection];
  if (!fields) throw new Error(`REQUIRED_FIELDS thiếu collection ${collection}`);
  // REQUIRED_FIELDS là string[] dùng chung cho mọi collection; tên field khớp type T được test content-rules bảo đảm.
  return assertRequiredFields(record, [...fields] as (keyof T)[], recordLabel);
}
