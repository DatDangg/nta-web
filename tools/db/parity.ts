// Parity DB ↔ file: deep-equal từng bản ghi (vi + en) + ràng buộc I-1..I-6. Exit 1 nếu lệch/thiếu/thừa.
// Chỉ đọc DB (SELECT). Dùng lại ở cutover P4-T01.
//   DATABASE_URL=... npm run db:parity
import { closeDb, getDb } from "../../src/db/client";
import { countByCollection, formatCountTable, readFileSource } from "./file-source";
import { checkInvariants, compareRecords } from "./parity-check";
import { readDatabaseRecords } from "./seed-db";

async function main(): Promise<number> {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return 2;
  }
  const fileRecords = await readFileSource();
  try {
    const dbRecords = await readDatabaseRecords(getDb());
    const issues = [
      ...compareRecords(fileRecords, dbRecords),
      ...checkInvariants(dbRecords).map((issue) => ({ ...issue, key: `db:${issue.key}` })),
    ];
    console.log(formatCountTable(countByCollection(dbRecords)));
    console.log(`file: ${fileRecords.length} bản ghi · DB: ${dbRecords.length} bản ghi`);
    for (const issue of issues) console.error(`[parity] ${issue.key}: ${issue.problem}`);
    if (issues.length > 0) {
      console.error(`[parity] FAIL — ${issues.length} lỗi`);
      return 1;
    }
    console.log("[parity] PASS — DB khớp file mọi collection/locale, I-1..I-6 OK");
    return 0;
  } finally {
    await closeDb();
  }
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[parity] FAIL", error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
