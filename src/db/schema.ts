// Schema PostgreSQL cho nội dung website (CR-031, spec R-16/R-16a/R-16c).
// Mô hình "document store": mỗi bản ghi nội dung (1 file MDX hoặc 1 object TS hiện tại) = 1 hàng,
// frontmatter/object giữ nguyên trong `data` (jsonb) — xem .context/decisions.md (CR-031).
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// Whitelist collection chỉ kiểm ở tầng app (không CHECK ở DB) để mở rộng phạm vi sau
// mà không cần migration đổi constraint.
export const CONTENT_COLLECTIONS = [
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
] as const;

export type ContentCollection = (typeof CONTENT_COLLECTIONS)[number];

export function isContentCollection(value: string): value is ContentCollection {
  return (CONTENT_COLLECTIONS as readonly string[]).includes(value);
}

export const CONTENT_LOCALES = ["vi", "en"] as const;
export type ContentLocale = (typeof CONTENT_LOCALES)[number];

export const CONTENT_VERSION_OPS = ["create", "update", "delete", "rollback"] as const;
export type ContentVersionOp = (typeof CONTENT_VERSION_OPS)[number];

export const contentEntries = pgTable(
  "content_entries",
  {
    id: serial("id").primaryKey(),
    collection: text("collection").notNull(),
    // Singleton (about, home…) dùng key cố định làm slug.
    slug: text("slug").notNull(),
    locale: text("locale").$type<ContentLocale>().notNull(),
    data: jsonb("data").notNull(),
    body: text("body"),
    // Thay thứ tự mảng trong src/lib/content/slug.ts.
    sortOrder: integer("sort_order"),
    version: integer("version").notNull().default(1),
    // Xoá mềm: hàng còn lại để rollback được.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: text("updated_by").notNull(),
  },
  (table) => [
    unique("content_entries_collection_slug_locale_unique").on(
      table.collection,
      table.slug,
      table.locale,
    ),
    index("content_entries_collection_locale_live_idx")
      .on(table.collection, table.locale)
      .where(sql`${table.deletedAt} IS NULL`),
    check("content_entries_locale_check", sql`${table.locale} IN ('vi', 'en')`),
    check("content_entries_version_check", sql`${table.version} >= 1`),
  ],
);

// Append-only: mỗi lần ghi entry thêm 1 hàng (ghi ở tầng app trong cùng transaction).
export const contentVersions = pgTable(
  "content_versions",
  {
    id: serial("id").primaryKey(),
    entryId: integer("entry_id")
      .notNull()
      .references(() => contentEntries.id),
    version: integer("version").notNull(),
    op: text("op").$type<ContentVersionOp>().notNull(),
    data: jsonb("data").notNull(),
    body: text("body"),
    // `seed`, `cli:<user>`, `bot:<telegram-id>`
    actor: text("actor").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("content_versions_entry_id_version_unique").on(table.entryId, table.version),
    check(
      "content_versions_op_check",
      sql`${table.op} IN ('create', 'update', 'delete', 'rollback')`,
    ),
  ],
);

export type ContentEntry = typeof contentEntries.$inferSelect;
export type NewContentEntry = typeof contentEntries.$inferInsert;
export type ContentVersion = typeof contentVersions.$inferSelect;
export type NewContentVersion = typeof contentVersions.$inferInsert;
