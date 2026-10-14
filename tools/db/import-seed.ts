// Import 1 lần nội dung file (vi + en) vào DB rỗng — CR-031 P2-T01, chạy prod ở P4-T01.
//   npm run db:import-seed -- --dry-run        → chỉ in số bản ghi theo collection/locale, không kết nối DB
//   npm run db:import-seed                     → chèn (ON CONFLICT DO NOTHING); chạy lại = 0 bản ghi mới
//   npm run db:import-seed -- --confirm-prod   → bắt buộc khi DATABASE_URL trỏ DB prod (nta-db / nta_web / host không phải loopback)
// Không in DATABASE_URL ra log.
import { closeDb, getDb } from "../../src/db/client";
import { countByCollection, formatCountTable, readFileSource } from "./file-source";
import { checkInvariants } from "./parity-check";
import { importRecords, isProductionDatabaseUrl } from "./seed-db";

const KNOWN_FLAGS = new Set(["--dry-run", "--confirm-prod"]);

async function main(): Promise<number> {
  const flags = process.argv.slice(2);
  const unknown = flags.filter((flag) => !KNOWN_FLAGS.has(flag));
  if (unknown.length > 0) {
    console.error(`cờ không hợp lệ: ${unknown.join(" ")} (dùng --dry-run, --confirm-prod)`);
    return 2;
  }

  const records = await readFileSource();
  const invariantIssues = checkInvariants(records);
  if (invariantIssues.length > 0) {
    for (const issue of invariantIssues) console.error(`[invariant] ${issue.key}: ${issue.problem}`);
    console.error("[import] FAIL — nội dung file vi phạm ràng buộc toàn vẹn, không import");
    return 1;
  }
  console.log(formatCountTable(countByCollection(records)));
  console.log(`tổng: ${records.length} bản ghi`);

  if (flags.includes("--dry-run")) {
    console.log("[import] --dry-run: không ghi DB");
    return 0;
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    return 2;
  }
  if (isProductionDatabaseUrl(connectionString) && !flags.includes("--confirm-prod")) {
    console.error("[import] từ chối: DATABASE_URL trỏ DB prod — cần cờ --confirm-prod (chỉ dùng ở cutover P4-T01 khi user đã duyệt)");
    return 2;
  }

  try {
    const result = await importRecords(getDb(), records);
    console.log(`[import] OK — chèn ${result.inserted.length}, bỏ qua (đã có) ${result.skipped.length}`);
    if (result.inserted.length > 0) {
      console.log(formatCountTable(countByCollection(result.inserted)));
    }
    return 0;
  } finally {
    await closeDb();
  }
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error("[import] FAIL", error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
