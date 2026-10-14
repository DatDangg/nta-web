import assert from "node:assert/strict";
import { test } from "node:test";
import { getTableConfig } from "drizzle-orm/pg-core";
import {
  CONTENT_COLLECTIONS,
  contentEntries,
  contentVersions,
  isContentCollection,
} from "./schema";

test("collection whitelist covers current content types and rejects unknown values", () => {
  assert.equal(CONTENT_COLLECTIONS.length, 12);
  for (const collection of ["post", "solution", "case_study", "slug_registry"]) {
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
});
