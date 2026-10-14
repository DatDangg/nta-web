// So khớp DB ↔ file (thuần, không I/O) + ràng buộc toàn vẹn I-1..I-6 (docs/content-bot/08-data-model.md §4).
import { isDeepStrictEqual } from "node:util";
import { BLOG_CATEGORIES } from "../../src/lib/blog/categories";
import { CONTENT_LOCALES, isContentCollection } from "../../src/db/schema";
import { MDX_COLLECTION_DIRECTORIES, recordKey, type SeedRecord } from "./file-source";

export interface ParityIssue {
  key: string;
  problem: string;
}

// Đường dẫn field đầu tiên khác nhau, để diff in ra đọc được (vd `data.showcase.hero.title`).
export function firstDifference(left: unknown, right: unknown, path: string): string | null {
  if (isDeepStrictEqual(left, right)) return null;
  const bothObjects =
    left !== null && right !== null && typeof left === "object" && typeof right === "object" &&
    Array.isArray(left) === Array.isArray(right);
  if (!bothObjects) return `${path}: file=${JSON.stringify(left)} db=${JSON.stringify(right)}`;
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const keys = new Set([...Object.keys(leftRecord), ...Object.keys(rightRecord)]);
  for (const key of keys) {
    const found = firstDifference(leftRecord[key], rightRecord[key], `${path}.${key}`);
    if (found) return found;
  }
  return `${path}: khác nhau`;
}

// `dbRecords` = các hàng còn sống (deleted_at IS NULL) thuộc collection seed.
export function compareRecords(fileRecords: readonly SeedRecord[], dbRecords: readonly SeedRecord[]): ParityIssue[] {
  const issues: ParityIssue[] = [];
  const dbByKey = new Map(dbRecords.map((record) => [recordKey(record), record]));
  const fileKeys = new Set<string>();

  for (const fileRecord of fileRecords) {
    const key = recordKey(fileRecord);
    fileKeys.add(key);
    const dbRecord = dbByKey.get(key);
    if (!dbRecord) {
      issues.push({ key, problem: "thiếu trong DB" });
      continue;
    }
    const difference =
      firstDifference(fileRecord.data, dbRecord.data, "data") ??
      firstDifference(fileRecord.body, dbRecord.body, "body") ??
      firstDifference(fileRecord.sortOrder, dbRecord.sortOrder, "sort_order");
    if (difference) issues.push({ key, problem: `lệch ${difference}` });
  }
  for (const key of dbByKey.keys()) {
    if (!fileKeys.has(key)) issues.push({ key, problem: "thừa trong DB (không có trong file)" });
  }
  return issues;
}

function checkLocalePairs(records: readonly SeedRecord[]): ParityIssue[] {
  const localesBySlug = new Map<string, Set<string>>();
  for (const record of records) {
    const key = `${record.collection}/${record.slug}`;
    localesBySlug.set(key, (localesBySlug.get(key) ?? new Set()).add(record.locale));
  }
  const issues: ParityIssue[] = [];
  for (const [key, locales] of localesBySlug) {
    const missing = CONTENT_LOCALES.filter((locale) => !locales.has(locale));
    if (missing.length > 0) issues.push({ key, problem: `I-1 thiếu bản ${missing.join(", ")}` });
  }
  return issues;
}

function checkUniqueAndEnums(records: readonly SeedRecord[]): ParityIssue[] {
  const issues: ParityIssue[] = [];
  const seen = new Set<string>();
  for (const record of records) {
    const key = recordKey(record);
    if (seen.has(key)) issues.push({ key, problem: "I-5 slug trùng trong collection/locale" });
    seen.add(key);
    if (!isContentCollection(record.collection)) issues.push({ key, problem: "I-6 collection ngoài whitelist" });
    if (!(CONTENT_LOCALES as readonly string[]).includes(record.locale)) {
      issues.push({ key, problem: "I-6 locale không hợp lệ" });
    }
    const category = record.data.category;
    if (record.collection === "post" && !(BLOG_CATEGORIES as readonly unknown[]).includes(category)) {
      issues.push({ key, problem: `I-6 category blog không hợp lệ: ${String(category)}` });
    }
    if (record.collection === "solution" && category !== "enterprise" && category !== "ai") {
      issues.push({ key, problem: `I-6 category giải pháp không hợp lệ: ${String(category)}` });
    }
  }
  return issues;
}

function checkSlugField(records: readonly SeedRecord[]): ParityIssue[] {
  const issues: ParityIssue[] = [];
  for (const record of records) {
    const isMdx = record.collection !== "about" && record.collection in MDX_COLLECTION_DIRECTORIES;
    if (isMdx && record.data.slug !== record.slug) {
      issues.push({
        key: recordKey(record),
        problem: `I-2 frontmatter slug "${String(record.data.slug)}" ≠ khoá "${record.slug}"`,
      });
    }
  }
  return issues;
}

function checkSlugRegistry(records: readonly SeedRecord[]): ParityIssue[] {
  const groupByKey = new Map<string, unknown>();
  for (const record of records) {
    if (record.collection === "slug_registry") groupByKey.set(`${record.locale}/${record.slug}`, record.data.group);
  }
  const issues: ParityIssue[] = [];
  for (const record of records) {
    if (record.collection !== "solution" && record.collection !== "product") continue;
    const group = groupByKey.get(`${record.locale}/${record.slug}`);
    const key = recordKey(record);
    if (group === undefined) {
      issues.push({ key, problem: "I-3 slug không có trong slug_registry" });
    } else if (record.collection === "product" && group !== "product") {
      issues.push({ key, problem: `I-3 sản phẩm nằm ở nhóm registry "${String(group)}"` });
    } else if (record.collection === "solution" && group !== record.data.category) {
      issues.push({ key, problem: `I-4 category "${String(record.data.category)}" ≠ nhóm registry "${String(group)}"` });
    }
  }
  return issues;
}

export function checkInvariants(records: readonly SeedRecord[]): ParityIssue[] {
  return [
    ...checkLocalePairs(records),
    ...checkSlugField(records),
    ...checkSlugRegistry(records),
    ...checkUniqueAndEnums(records),
  ];
}
