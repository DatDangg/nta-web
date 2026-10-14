// Kết nối PostgreSQL dùng chung cho web + script tools/db.
// Không `import "server-only"` ở đây vì script chạy bằng node/tsx ngoài Next; guard server-only
// đặt ở src/lib/content/store.ts. Import file này không mở kết nối và không đòi DATABASE_URL
// (để `next build` chạy được khi không có DB) — chỉ lỗi khi gọi getDb().
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

let pool: Pool | undefined;
let db: Database | undefined;

export function getDb(): Database {
  if (db) return db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Không đưa giá trị env vào message để tránh lộ secret qua log.
    throw new Error("DATABASE_URL is not set");
  }
  pool = new Pool({ connectionString });
  db = drizzle(pool, { schema });
  return db;
}

// Dùng ở cuối script CLI để process thoát được.
export async function closeDb(): Promise<void> {
  const current = pool;
  pool = undefined;
  db = undefined;
  await current?.end();
}
