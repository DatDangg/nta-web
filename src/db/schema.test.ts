import assert from "node:assert/strict";
import { test } from "node:test";
import { getTableConfig } from "drizzle-orm/pg-core";
import {
  CONTENT_COLLECTIONS,
  CONTENT_LOCALES,
  SEED_LOCALES,
  contentEntries,
  contentVersions,
  isContentCollection,
  isSeedLocale,
} from "./schema";

test("collection whitelist covers current content types and rejects unknown values", () => {
  assert.equal(CONTENT_COLLECTIONS.length, 15);
  for (const collection of [
    "post",
    "solution",
    "case_study",
    "slug_registry",
    "ui_messages",
    "company_info",
    "asset",
  ]) {
    assert.equal(isContentCollection(collection), true, collection);
  }
  assert.equal(isContentCollection("Post"), false);
  assert.equal(isContentCollection("users"), false);
  assert.equal(isContentCollection(""), false);
});

test("content_entries has expected columns and constraints", () => {
  const config = getTableConfig(contentEntries);
  assert.equal(config.name, "content_entries");
  assert.deepEqual(
    config.columns.map((column) => column.name).sort(),
    [
      "body",
      "collection",
      "created_at",
      "data",
      "deleted_at",
      "id",
      "locale",
      "slug",
      "sort_order",
      "updated_at",
      "updated_by",
      "version",
    ],
  );
  assert.deepEqual(
    config.uniqueConstraints[0].columns.map((column) => column.name),
    ["collection", "slug", "locale"],
  );
  const checkNames = config.checks.map((item) => item.name).sort();
  // Không có CHECK cho collection: whitelist chỉ ở tầng app.
  assert.deepEqual(checkNames, ["content_entries_locale_check", "content_entries_version_check"]);
  assert.equal(config.indexes.length, 1);
});

test("content_versions references content_entries and is unique per (entry_id, version)", () => {
  const config = getTableConfig(contentVersions);
  assert.equal(config.name, "content_versions");
  assert.equal(config.foreignKeys.length, 1);
  const reference = config.foreignKeys[0].reference();
  assert.equal(getTableConfig(reference.foreignTable).name, "content_entries");
  assert.deepEqual(
    config.uniqueConstraints[0].columns.map((column) => column.name),
    ["entry_id", "version"],
  );
  assert.deepEqual(config.checks.map((item) => item.name), ["content_versions_op_check"]);
  // MINOR-1 (phase 1): rollback phải khôi phục cả thứ tự → snapshot sort_order, nullable (migration additive).
  const sortOrder = config.columns.find((column) => column.name === "sort_order");
  assert.ok(sortOrder);
  assert.equal(sortOrder.notNull, false);
  assert.equal(sortOrder.hasDefault, false);
});

// CR-044 (R-20a mục 9/10): DB nhận vi/en/ja; file seed + cặp I-1 chỉ vi/en.
test("locale: CHECK content_entries nhận vi/en/ja, SEED_LOCALES chỉ vi/en", () => {
  assert.deepEqual([...CONTENT_LOCALES], ["vi", "en", "ja"]);
  assert.deepEqual([...SEED_LOCALES], ["vi", "en"]);
  assert.equal(isSeedLocale("ja"), false);
  assert.equal(isSeedLocale("vi"), true);
  const localeCheck = getTableConfig(contentEntries).checks.find((item) => item.name === "content_entries_locale_check");
  assert.ok(localeCheck);
  const chunks = (localeCheck.value as unknown as { queryChunks: unknown[] }).queryChunks;
  const text = chunks.map((chunk) => (typeof chunk === "object" && chunk !== null && "value" in chunk ? String(chunk.value) : "")).join("");
  assert.match(text, /IN \('vi', 'en', 'ja'\)/);
});
