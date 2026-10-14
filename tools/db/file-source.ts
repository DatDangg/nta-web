// Nguồn nội dung dạng file hiện tại → danh sách bản ghi theo mô hình content_entries (CR-031 R-16, quyết định #9).
// Đọc bằng CHÍNH loader/hằng mà web đang dùng (không parse lại) để dữ liệu import khớp đúng cái web render.
// Quy ước slug cho bản ghi không phải file MDX: xem .context/decisions.md (CR-031 P2-T01).
import { isDeepStrictEqual } from "node:util";
import type { Locale } from "../../src/content/types";
import { getHomeContent } from "../../src/content/home";
import { listingCtas, listingItems, listingLabels, listingPages } from "../../src/content/listings";
import { solutionOverview } from "../../src/content/solutions/overview";
import { COMPANY_CONTACT } from "../../src/lib/contact/company-info";
import { ABOUT_SLUG, MDX_COLLECTION_DIRECTORIES, readMdxFiles, type MdxCollection } from "../../src/lib/content/mdx-files";
import { aiSlugs, enterpriseSlugs, productSlugs } from "../../src/lib/content/slug";
import { CONTENT_LOCALES, type ContentCollection } from "../../src/db/schema";
import enMessages from "../../src/i18n/messages/en.json";
import viMessages from "../../src/i18n/messages/vi.json";

export interface SeedRecord {
  collection: ContentCollection;
  slug: string;
  locale: Locale;
  data: Record<string, unknown>;
  body: string | null;
  sortOrder: number | null;
}

// Collection do import seed quản lý (asset chưa có nguồn file — ảnh upload bắt đầu ở P3-T05).
export const SEED_COLLECTIONS = [
  "post",
  "solution",
  "product",
  "case_study",
  "about",
  "listing_page",
  "listing_item",
  "listing_cta",
  "listing_labels",
  "home",
  "solution_overview",
  "slug_registry",
  "ui_messages",
  "company_info",
] as const satisfies readonly ContentCollection[];

// Dùng chung với loader web (src/lib/content/load-mdx.ts) → khoá collection/thư mục không lệch.
export { ABOUT_SLUG, MDX_COLLECTION_DIRECTORIES };

export const HOME_SLUG = "home";
export const LISTING_LABELS_SLUG = "labels";
export const COMPANY_INFO_SLUG = "contact";

export type SlugRegistryGroup = "enterprise" | "ai" | "product";

const SLUG_REGISTRY: Record<SlugRegistryGroup, readonly string[]> = {
  enterprise: enterpriseSlugs,
  ai: aiSlugs,
  product: productSlugs,
};

const UI_MESSAGES: Record<Locale, Record<string, unknown>> = { vi: viMessages, en: enMessages };

// jsonb chỉ giữ được giá trị JSON: Date/undefined/hàm sẽ đổi hoặc mất khi ghi → chặn ngay ở nguồn.
function toJsonObject(value: unknown, where: string): Record<string, unknown> {
  const roundTripped: unknown = JSON.parse(JSON.stringify(value));
  if (!isDeepStrictEqual(roundTripped, value) || roundTripped === null || typeof roundTripped !== "object") {
    throw new Error(`${where}: dữ liệu không phải object JSON thuần (Date/undefined/...)`);
  }
  return roundTripped as Record<string, unknown>;
}

function keyedRecords(
  collection: ContentCollection,
  locale: Locale,
  source: Record<string, unknown>,
): SeedRecord[] {
  return Object.entries(source).map(([slug, value], index) => ({
    collection,
    slug,
    locale,
    data: toJsonObject(value, `${collection}/${locale}/${slug}`),
    body: null,
    sortOrder: index,
  }));
}

function singletonRecord(collection: ContentCollection, slug: string, locale: Locale, value: unknown): SeedRecord {
  return {
    collection,
    slug,
    locale,
    data: toJsonObject(value, `${collection}/${locale}/${slug}`),
    body: null,
    sortOrder: null,
  };
}

async function readMdxCollection(collection: MdxCollection, locale: Locale): Promise<SeedRecord[]> {
  const directory = MDX_COLLECTION_DIRECTORIES[collection];
  const files = await readMdxFiles(directory, locale);
  return files.map((file) => ({
    collection,
    // Khoá = tên file (loader web tìm theo frontmatter.slug; I-2 kiểm hai giá trị này khớp nhau).
    slug: collection === "about" ? ABOUT_SLUG : file.fileName.replace(/\.mdx$/, ""),
    locale,
    data: toJsonObject(file.frontmatter, `src/content/${directory}/${locale}/${file.fileName}`),
    body: file.body,
    sortOrder: null,
  }));
}

// Registry slug không theo ngôn ngữ nhưng locale là NOT NULL → ghi cùng dữ liệu cho vi và en.
function slugRegistryRecords(locale: Locale): SeedRecord[] {
  return Object.entries(SLUG_REGISTRY).flatMap(([group, slugs]) =>
    slugs.map((slug, index) => ({
      collection: "slug_registry" as const,
      slug,
      locale,
      data: { group },
      body: null,
      sortOrder: index,
    })),
  );
}

function registryRecords(locale: Locale): SeedRecord[] {
  return [
    ...keyedRecords("listing_page", locale, listingPages[locale]),
    ...keyedRecords("listing_item", locale, listingItems[locale]),
    ...keyedRecords("listing_cta", locale, listingCtas[locale]),
    singletonRecord("listing_labels", LISTING_LABELS_SLUG, locale, listingLabels[locale]),
    singletonRecord("home", HOME_SLUG, locale, getHomeContent(locale)),
    ...keyedRecords("solution_overview", locale, solutionOverview[locale]),
    ...slugRegistryRecords(locale),
    ...keyedRecords("ui_messages", locale, UI_MESSAGES[locale]),
    // company-info.ts không theo ngôn ngữ → cùng dữ liệu cho vi và en (decisions.md).
    singletonRecord("company_info", COMPANY_INFO_SLUG, locale, COMPANY_CONTACT),
  ];
}

export async function readFileSource(): Promise<SeedRecord[]> {
  const records: SeedRecord[] = [];
  for (const locale of CONTENT_LOCALES) {
    for (const collection of Object.keys(MDX_COLLECTION_DIRECTORIES) as MdxCollection[]) {
      records.push(...(await readMdxCollection(collection, locale)));
    }
    records.push(...registryRecords(locale));
  }
  return records;
}

export function recordKey(record: Pick<SeedRecord, "collection" | "slug" | "locale">): string {
  return `${record.collection}/${record.locale}/${record.slug}`;
}

// Bảng đếm "collection → {vi, en}" theo thứ tự SEED_COLLECTIONS (dùng cho --dry-run và báo cáo).
export function countByCollection(records: readonly SeedRecord[]): Map<string, Record<Locale, number>> {
  const counts = new Map<string, Record<Locale, number>>();
  for (const collection of SEED_COLLECTIONS) counts.set(collection, { vi: 0, en: 0 });
  for (const record of records) {
    const row = counts.get(record.collection) ?? { vi: 0, en: 0 };
    row[record.locale] += 1;
    counts.set(record.collection, row);
  }
  return counts;
}

export function formatCountTable(counts: Map<string, Record<Locale, number>>): string {
  const lines = ["collection           vi    en"];
  for (const [collection, row] of counts) {
    lines.push(`${collection.padEnd(20)} ${String(row.vi).padStart(3)}   ${String(row.en).padStart(3)}`);
  }
  return lines.join("\n");
}
