// Phần chạm DB của import seed + parity. CHỈ INSERT (ON CONFLICT DO NOTHING) và SELECT —
// không UPDATE/DELETE/TRUNCATE: bản ghi đã có (kể cả đã sửa qua bot/CLI) không bao giờ bị ghi đè.
import { and, inArray, isNull } from "drizzle-orm";
import type { Database } from "../../src/db/client";
import { contentEntries, contentVersions, type ContentLocale } from "../../src/db/schema";
import { SEED_COLLECTIONS, type SeedRecord } from "./file-source";

export const SEED_ACTOR = "seed";

export interface ImportResult {
  inserted: SeedRecord[];
  skipped: SeedRecord[];
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

// Prod = container `nta-db` / database `nta_web` / host không phải loopback (vd VPS). Chỉ cho chạy khi có --confirm-prod.
export function isProductionDatabaseUrl(connectionString: string): boolean {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return true;
  }
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  return url.hostname === "nta-db" || database === "nta_web" || !LOOPBACK_HOSTS.has(url.hostname);
}

// 1 transaction / bản ghi: entry version 1 + content_versions op create cùng thành công hoặc cùng huỷ.
export async function importRecords(db: Database, records: readonly SeedRecord[]): Promise<ImportResult> {
  const result: ImportResult = { inserted: [], skipped: [] };
  for (const record of records) {
    const created = await db.transaction(async (tx) => {
      const [entry] = await tx
        .insert(contentEntries)
        .values({
          collection: record.collection,
          slug: record.slug,
          locale: record.locale,
          data: record.data,
          body: record.body,
          sortOrder: record.sortOrder,
          version: 1,
          updatedBy: SEED_ACTOR,
        })
        .onConflictDoNothing({
          target: [contentEntries.collection, contentEntries.slug, contentEntries.locale],
        })
        .returning({ id: contentEntries.id });
      if (!entry) return false;
      await tx.insert(contentVersions).values({
        entryId: entry.id,
        version: 1,
        op: "create",
        data: record.data,
        body: record.body,
        actor: SEED_ACTOR,
        note: "import-seed",
      });
      return true;
    });
    (created ? result.inserted : result.skipped).push(record);
  }
  return result;
}

// Hàng còn sống của các collection seed, đổi về cùng dạng SeedRecord để so với file.
export async function readDatabaseRecords(db: Database): Promise<SeedRecord[]> {
  const rows = await db
    .select({
      collection: contentEntries.collection,
      slug: contentEntries.slug,
      locale: contentEntries.locale,
      data: contentEntries.data,
      body: contentEntries.body,
      sortOrder: contentEntries.sortOrder,
    })
    .from(contentEntries)
    .where(and(inArray(contentEntries.collection, [...SEED_COLLECTIONS]), isNull(contentEntries.deletedAt)));
  return rows.map((row) => ({
    collection: row.collection as SeedRecord["collection"],
    slug: row.slug,
    locale: row.locale as ContentLocale,
    data: row.data as Record<string, unknown>,
    body: row.body,
    sortOrder: row.sortOrder,
  }));
}
