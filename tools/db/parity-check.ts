// So khớp DB ↔ file (thuần, không I/O) + ràng buộc toàn vẹn I-1..I-6 (quy tắc từng bản ghi ở src/db/content-rules.ts) (docs/content-bot/08-data-model.md §4).
import { isDeepStrictEqual } from "node:util";
import { checkRecord, registryProblem, registryTargetCollection } from "../../src/db/content-rules";
import { CONTENT_LOCALES } from "../../src/db/schema";
import { recordKey, type SeedRecord } from "./file-source";

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

// Unique (I-5) + quy tắc từng bản ghi dùng chung với write-path (whitelist, required fields, I-2, I-6).
function checkEachRecord(records: readonly SeedRecord[]): ParityIssue[] {
  const issues: ParityIssue[] = [];
  const seen = new Set<string>();
  for (const record of records) {
    const key = recordKey(record);
    if (seen.has(key)) issues.push({ key, problem: "I-5 slug trùng trong collection/locale" });
    seen.add(key);
    for (const problem of checkRecord(record)) issues.push({ key, problem });
  }
  return issues;
}

// I-3/I-4 hai chiều: solution/product phải có trong registry đúng nhóm; hàng registry phải có bản ghi nội dung.
function checkSlugRegistry(records: readonly SeedRecord[]): ParityIssue[] {
  const groupByKey = new Map<string, unknown>();
  const contentKeys = new Set<string>();
  for (const record of records) {
    if (record.collection === "slug_registry") groupByKey.set(`${record.locale}/${record.slug}`, record.data.group);
    else contentKeys.add(recordKey(record));
  }
  const issues: ParityIssue[] = [];
  for (const record of records) {
    const problem = registryProblem(record, groupByKey.get(`${record.locale}/${record.slug}`));
    if (problem) issues.push({ key: recordKey(record), problem });
    const target = record.collection === "slug_registry" ? registryTargetCollection(record.data.group) : null;
    if (target && !contentKeys.has(recordKey({ ...record, collection: target }))) {
      issues.push({ key: recordKey(record), problem: `I-3 registry trỏ tới ${target} chưa có bản ghi` });
    }
  }
  return issues;
}

export function checkInvariants(records: readonly SeedRecord[]): ParityIssue[] {
  return [...checkLocalePairs(records), ...checkSlugRegistry(records), ...checkEachRecord(records)];
}
