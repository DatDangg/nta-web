import assert from "node:assert/strict";
import { test } from "node:test";
import { listingItems, listingPages } from "../../src/content/listings";
import { aiSlugs, enterpriseSlugs, productSlugs } from "../../src/lib/content/slug";
import viMessages from "../../src/i18n/messages/vi.json";
import { countByCollection, readFileSource, recordKey, SEED_COLLECTIONS, type SeedRecord } from "./file-source";
import { checkInvariants, compareRecords } from "./parity-check";
import { isProductionDatabaseUrl } from "./seed-db";

test("file source maps every collection with matching vi/en counts", async () => {
  const records = await readFileSource();
  const counts = countByCollection(records);
  assert.deepEqual([...counts.keys()], [...SEED_COLLECTIONS]);
  for (const [collection, row] of counts) {
    assert.ok(row.vi > 0, `${collection} có bản ghi vi`);
    assert.equal(row.vi, row.en, `${collection} đủ cặp vi/en`);
  }
  assert.equal(counts.get("solution")?.vi, enterpriseSlugs.length + aiSlugs.length);
  assert.equal(counts.get("product")?.vi, productSlugs.length);
  assert.equal(counts.get("listing_page")?.vi, Object.keys(listingPages.vi).length);
  assert.equal(counts.get("listing_item")?.vi, Object.keys(listingItems.vi).length);
  assert.equal(counts.get("ui_messages")?.vi, Object.keys(viMessages).length);
  assert.equal(counts.get("company_info")?.vi, 1);
  assert.equal(new Set(records.map(recordKey)).size, records.length, "khoá duy nhất");
  assert.deepEqual(checkInvariants(records), []);
});

test("slug_registry keeps slug.ts array order in sort_order", async () => {
  const records = await readFileSource();
  for (const locale of ["vi", "en"] as const) {
    for (const [group, slugs] of [["enterprise", enterpriseSlugs], ["ai", aiSlugs], ["product", productSlugs]] as const) {
      const rows = records
        .filter((record) => record.collection === "slug_registry" && record.locale === locale && record.data.group === group)
        .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
      assert.deepEqual(rows.map((record) => record.slug), [...slugs], `${locale}/${group}`);
      assert.deepEqual(rows.map((record) => record.sortOrder), slugs.map((_, index) => index));
    }
  }
});

test("MDX records keep frontmatter as data and source as body", async () => {
  const records = await readFileSource();
  const crm = records.find((record) => recordKey(record) === "solution/vi/crm");
  assert.ok(crm);
  assert.equal(crm.data.slug, "crm");
  assert.equal(typeof crm.body, "string");
  assert.equal("body" in crm.data, false);
  const messages = records.find((record) => recordKey(record) === "ui_messages/vi/home");
  assert.deepEqual(messages?.data, viMessages.home);
});

const sample: SeedRecord = {
  collection: "solution",
  slug: "crm",
  locale: "vi",
  data: { slug: "crm", category: "enterprise", showcase: { hero: { title: "A" } } },
  body: "x",
  sortOrder: null,
};

test("compareRecords reports changed, missing and extra records", () => {
  assert.deepEqual(compareRecords([sample], [structuredClone(sample)]), []);
  const changed = structuredClone(sample);
  changed.data = { ...changed.data, showcase: { hero: { title: "B" } } };
  assert.match(compareRecords([sample], [changed])[0].problem, /data\.showcase\.hero\.title/);
  assert.equal(compareRecords([sample], [])[0].problem, "thiếu trong DB");
  const extra = { ...sample, slug: "hrm" };
  assert.match(compareRecords([sample], [sample, extra])[0].problem, /thừa trong DB/);
});

test("checkInvariants flags missing locale, slug mismatch, registry, enum and required-field problems", () => {
  const problems = checkInvariants([
    { ...sample, data: { ...sample.data, slug: "other", category: "weird" } },
  ]).map((issue) => issue.problem.slice(0, 3));
  // "Inv" = thiếu field bắt buộc (sample không đủ field loader yêu cầu) — quy tắc chung với write-path (content-rules.ts).
  assert.deepEqual(problems.sort(), ["I-1", "I-2", "I-3", "I-6", "Inv"]);
});

test("production database URLs are refused without --confirm-prod", () => {
  assert.equal(isProductionDatabaseUrl("postgres://nta:x@nta-db:5432/nta_web"), true);
  assert.equal(isProductionDatabaseUrl("postgres://nta:x@127.0.0.1:5432/nta_web"), true);
  assert.equal(isProductionDatabaseUrl("postgres://nta:x@187.52.119.50:5432/other"), true);
  assert.equal(isProductionDatabaseUrl("not a url"), true);
  assert.equal(isProductionDatabaseUrl("postgres://nta:x@127.0.0.1:55432/nta_seed_test"), false);
  assert.equal(isProductionDatabaseUrl("postgres://nta:x@localhost/nta_dev"), false);
});
