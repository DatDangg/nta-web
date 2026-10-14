import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { checkMigrationSql, selectPendingMigrations, splitStatements } from "./migration-gate";

const MARKER = "-- HIGH_RISK_MIGRATION: approved 2026-10-14 by user";

function rulesOf(sql: string): string[] {
  return checkMigrationSql(sql).findings.map((finding) => finding.rule);
}

describe("checkMigrationSql — chặn thao tác phá hoại trên dữ liệu cũ", () => {
  const destructive: Array<[string, string]> = [
    ["DROP TABLE", 'DROP TABLE "content_entries";'],
    ["DROP COLUMN", 'ALTER TABLE "content_entries" DROP COLUMN "body";'],
    ["DROP TYPE", 'DROP TYPE "public"."content_op";'],
    ["ALTER COLUMN TYPE", 'ALTER TABLE "content_entries" ALTER COLUMN "slug" SET DATA TYPE varchar(64);'],
    ["SET NOT NULL", 'ALTER TABLE "content_entries" ALTER COLUMN "body" SET NOT NULL;'],
    ["ADD UNIQUE", 'ALTER TABLE "content_entries" ADD CONSTRAINT "x_unique" UNIQUE("slug");'],
    [
      "ADD FOREIGN KEY trên bảng cũ",
      'ALTER TABLE "content_versions" ADD CONSTRAINT "fk" FOREIGN KEY ("entry_id") REFERENCES "public"."content_entries"("id");',
    ],
    ["CREATE UNIQUE INDEX trên bảng cũ", 'CREATE UNIQUE INDEX "u" ON "content_entries" USING btree ("slug");'],
    ["UPDATE hàng loạt", "UPDATE content_entries SET locale = 'vi';"],
    ["DELETE", "DELETE FROM content_versions;"],
    ["TRUNCATE", "TRUNCATE content_versions;"],
    ["ALTER TYPE RENAME VALUE", "ALTER TYPE \"op\" RENAME VALUE 'a' TO 'b';"],
    ["RENAME cột", 'ALTER TABLE "content_entries" RENAME COLUMN "body" TO "content";'],
  ];
  for (const [name, sql] of destructive) {
    it(`${name} → blocked`, () => {
      const result = checkMigrationSql(sql);
      assert.equal(result.blocked, true, JSON.stringify(result));
      assert.equal(result.findings.length, 1);
    });
  }

  it("'--' trong literal chuỗi không nuốt statement DROP phía sau", () => {
    const sql = [
      "ALTER TABLE \"a\" ADD COLUMN \"x\" text DEFAULT '--x';",
      'DROP TABLE "c";',
      "ALTER TABLE \"a\" ADD COLUMN \"y\" text DEFAULT 'it''s -- ok';",
    ].join("\n");
    assert.deepEqual(rulesOf(sql), ["DROP"]);
  });

  const manualReview: Array<[string, string]> = [
    ["DO $$ … DELETE", "DO $$ BEGIN DELETE FROM content_versions; END $$;"],
    ["DO $tag$ … $tag$", "DO $body$ BEGIN UPDATE content_entries SET body = NULL; END $body$;"],
    ["WITH … DELETE", "WITH old AS (SELECT id FROM content_versions) DELETE FROM content_versions WHERE id IN (SELECT id FROM old);"],
    ["WITH … UPDATE", "WITH x AS (SELECT 1) UPDATE content_entries SET locale = 'vi';"],
    ["INSERT … SELECT (backfill)", "INSERT INTO content_versions (entry_id, version, op, data, actor) SELECT id, 2, 'update', data, 'm' FROM content_entries;"],
    ["CREATE OR REPLACE FUNCTION", "CREATE OR REPLACE FUNCTION f() RETURNS void AS $$ SELECT 1 $$ LANGUAGE sql;"],
  ];
  for (const [name, sql] of manualReview) {
    it(`${name} → blocked (fail-closed)`, () => {
      const result = checkMigrationSql(sql);
      assert.equal(result.blocked, true, JSON.stringify(result));
      assert.equal(result.findings.length, 1);
    });
  }

  it("statement phá hoại nằm sau statement additive vẫn bị bắt", () => {
    const sql = 'ALTER TABLE "a" ADD COLUMN "x" text;--> statement-breakpoint\nDROP TABLE "b";';
    assert.deepEqual(rulesOf(sql), ["DROP"]);
  });
});

describe("checkMigrationSql — cho qua migration additive", () => {
  it("CREATE TABLE + ADD COLUMN nullable + CREATE INDEX + DROP NOT NULL/DEFAULT → pass", () => {
    const sql = [
      'CREATE TABLE "assets" ("id" serial PRIMARY KEY NOT NULL, "path" text NOT NULL);',
      'ALTER TABLE "content_entries" ADD COLUMN "note" text;',
      'CREATE INDEX "assets_path_idx" ON "assets" USING btree ("path");',
      'ALTER TABLE "content_entries" ALTER COLUMN "body" DROP NOT NULL;',
      'ALTER TABLE "content_entries" ALTER COLUMN "body" DROP DEFAULT;',
      "INSERT INTO assets (path) VALUES ('a');",
    ].join("\n--> statement-breakpoint\n");
    const result = checkMigrationSql(sql);
    assert.deepEqual(result, { approved: false, findings: [], blocked: false });
  });

  it("từ khoá phá hoại trong comment hoặc chuỗi không bị bắt", () => {
    const sql = "-- DROP TABLE x; sẽ làm ở migration sau\n/* DELETE FROM y; */\nINSERT INTO notes (t) VALUES ('DROP TABLE z; UPDATE w');";
    assert.equal(checkMigrationSql(sql).blocked, false);
  });

  it("FOREIGN KEY / UNIQUE INDEX trên bảng CREATE trong cùng file → pass", () => {
    const sql = [
      'CREATE TABLE "parents" ("id" serial PRIMARY KEY NOT NULL);',
      'CREATE TABLE IF NOT EXISTS "public"."children" ("id" serial PRIMARY KEY NOT NULL, "parent_id" integer NOT NULL);',
      'ALTER TABLE "children" ADD CONSTRAINT "fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id");',
      'CREATE UNIQUE INDEX "u" ON "public"."children" USING btree ("parent_id");',
    ].join("\n");
    assert.equal(checkMigrationSql(sql).blocked, false);
  });

  it("migration thật drizzle/0000 (FK trên bảng vừa tạo) → pass", () => {
    const sql = readFileSync(path.join(process.cwd(), "drizzle", "0000_empty_supernaut.sql"), "utf8");
    const result = checkMigrationSql(sql);
    assert.equal(splitStatements(sql).length, 4);
    assert.deepEqual(result.findings, []);
    assert.equal(result.blocked, false);
  });

  it("migration thật drizzle/0001 (ADD COLUMN sort_order nullable trên bảng cũ) → pass không cần marker", () => {
    const sql = readFileSync(path.join(process.cwd(), "drizzle", "0001_aromatic_rattler.sql"), "utf8");
    const result = checkMigrationSql(sql);
    assert.deepEqual(splitStatements(sql), ['ALTER TABLE "content_versions" ADD COLUMN "sort_order" integer']);
    assert.deepEqual(result.findings, []);
    assert.equal(result.approved, false);
    assert.equal(result.blocked, false);
  });
});

describe("checkMigrationSql — dòng duyệt HIGH_RISK_MIGRATION", () => {
  it("có marker hợp lệ → pass nhưng vẫn liệt kê finding", () => {
    const result = checkMigrationSql(`${MARKER}\nDROP TABLE "legacy";`);
    assert.equal(result.approved, true);
    assert.equal(result.blocked, false);
    assert.deepEqual(result.findings.map((finding) => finding.rule), ["DROP"]);
  });

  const invalidMarkers = [
    "-- HIGH_RISK_MIGRATION",
    "-- HIGH_RISK_MIGRATION: approved by user",
    "-- HIGH_RISK_MIGRATION: approved 14/10/2026 by user",
    "-- HIGH_RISK_MIGRATION: approved 2026-10-14 by",
    "SELECT 1; -- HIGH_RISK_MIGRATION: approved 2026-10-14 by user",
  ];
  for (const marker of invalidMarkers) {
    it(`marker sai định dạng "${marker}" → vẫn blocked`, () => {
      assert.equal(checkMigrationSql(`${marker}\nDROP TABLE "legacy";`).blocked, true);
    });
  }
});

describe("selectPendingMigrations — cùng điều kiện với drizzle migrator", () => {
  const entries = [
    { idx: 0, when: 100, tag: "0000_a" },
    { idx: 1, when: 200, tag: "0001_b" },
  ];
  it("DB chưa có bảng __drizzle_migrations → mọi migration đều pending", () => {
    assert.deepEqual(selectPendingMigrations(entries, null), entries);
  });
  it("đã apply 0000 → chỉ 0001 pending", () => {
    assert.deepEqual(selectPendingMigrations(entries, 100).map((entry) => entry.tag), ["0001_b"]);
  });
  it("đã apply hết → rỗng", () => {
    assert.deepEqual(selectPendingMigrations(entries, 200), []);
  });
});
