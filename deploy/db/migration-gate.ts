// Gate chặn migration phá hoại trước khi deploy chạy migrate (AGENTS.md § Migration safety, R-16c).
// Chỉ phân tích chuỗi SQL — không kết nối DB. migrate.ts gọi gate cho các file migration CHƯA apply.
//
// Nguyên tắc: thao tác trên bảng/kiểu ĐÃ TỒN TẠI có thể mất/biến đổi dữ liệu → chặn, trừ khi file có dòng duyệt
//   -- HIGH_RISK_MIGRATION: approved YYYY-MM-DD by <người duyệt>
// ALTER/CREATE UNIQUE INDEX trên bảng được CREATE TABLE trong CÙNG file thì bỏ qua: bảng mới tạo chưa có dữ liệu
// (vd migration 0000 thêm FOREIGN KEY ngay sau CREATE TABLE).

export const APPROVAL_MARKER_PATTERN =
  /^--[ \t]*HIGH_RISK_MIGRATION:[ \t]*approved[ \t]+\d{4}-\d{2}-\d{2}[ \t]+by[ \t]+\S.*$/im;

export type GateFinding = {
  statementIndex: number;
  rule: string;
  statement: string;
};

export type GateResult = {
  approved: boolean;
  findings: GateFinding[];
  blocked: boolean;
};

type StatementRule = {
  rule: string;
  pattern: RegExp;
  // true = chỉ chặn khi bảng đích KHÔNG được tạo trong cùng file.
  onlyExistingTable: boolean;
};

const STATEMENT_RULES: StatementRule[] = [
  { rule: "DROP", pattern: /^DROP\s/, onlyExistingTable: false },
  { rule: "TRUNCATE", pattern: /^TRUNCATE\s/, onlyExistingTable: false },
  { rule: "UPDATE", pattern: /^UPDATE\s/, onlyExistingTable: false },
  { rule: "DELETE", pattern: /^DELETE\s/, onlyExistingTable: false },
  { rule: "ALTER TYPE ... RENAME/DROP", pattern: /^ALTER\s+TYPE\s.*\s(RENAME|DROP)\s/, onlyExistingTable: false },
  // DROP DEFAULT / DROP NOT NULL không mất dữ liệu → không chặn.
  { rule: "ALTER TABLE ... DROP", pattern: /^ALTER\s+TABLE\s.*\sDROP\s+(?!DEFAULT|NOT\s+NULL)/, onlyExistingTable: true },
  { rule: "ALTER COLUMN ... TYPE", pattern: /^ALTER\s+TABLE\s.*\sALTER\s+(COLUMN\s+)?\S+\s+(SET\s+DATA\s+)?TYPE\s/, onlyExistingTable: true },
  { rule: "SET NOT NULL", pattern: /^ALTER\s+TABLE\s.*\sSET\s+NOT\s+NULL/, onlyExistingTable: true },
  { rule: "ADD CONSTRAINT UNIQUE/FOREIGN KEY/PRIMARY KEY", pattern: /^ALTER\s+TABLE\s.*\sADD\s+(CONSTRAINT\s+\S+\s+)?(UNIQUE|FOREIGN\s+KEY|PRIMARY\s+KEY)/, onlyExistingTable: true },
  { rule: "RENAME", pattern: /^ALTER\s+TABLE\s.*\sRENAME\s/, onlyExistingTable: true },
  { rule: "CREATE UNIQUE INDEX", pattern: /^CREATE\s+UNIQUE\s+INDEX\s/, onlyExistingTable: true },
  // Fail-closed: dạng gate không phân tích được bên trong (procedural / CTE / backfill) → luôn cần duyệt tay.
  { rule: "DO/FUNCTION/PROCEDURE/COPY/CALL (cần duyệt tay)", pattern: /^(DO\s|CREATE\s+(OR\s+REPLACE\s+)?(FUNCTION|PROCEDURE)\s|COPY\s|CALL\s)/, onlyExistingTable: false },
  { rule: "WITH ... (CTE, cần duyệt tay)", pattern: /^WITH\s/, onlyExistingTable: false },
  { rule: "dollar-quote $$ (cần duyệt tay)", pattern: /\$\$/, onlyExistingTable: false },
  { rule: "INSERT ... SELECT (backfill)", pattern: /^INSERT\s.*\sSELECT\s/, onlyExistingTable: false },
];

// Một lượt quét trái → phải: chuỗi '...' (kể cả '' escape), dollar-quote $tag$...$tag$, comment -- và /* */.
// Phải cùng một regex để "--" nằm trong chuỗi không bị coi là comment (và ngược lại).
// Dollar-quote thay bằng "$$" để rule fail-closed vẫn thấy.
const LEXICAL_TOKEN = /'(?:[^']|'')*'|\$([A-Za-z_][A-Za-z0-9_]*)?\$[\s\S]*?\$\1\$|--[^\n]*|\/\*[\s\S]*?\*\//g;

function stripCommentsAndStrings(sql: string): string {
  return sql.replace(LEXICAL_TOKEN, (token) => {
    if (token.startsWith("'")) return "''";
    if (token.startsWith("$")) return " $$ ";
    return " ";
  });
}

export function splitStatements(sql: string): string[] {
  return stripCommentsAndStrings(sql)
    .split(";")
    .map((statement) => statement.replace(/\s+/g, " ").trim())
    .filter((statement) => statement.length > 0);
}

// "public"."content_entries" | public.content_entries | "content_entries" → content_entries
function normalizeTableName(raw: string): string {
  const parts = raw.split(".");
  return parts[parts.length - 1].replace(/"/g, "").toLowerCase();
}

const TABLE_NAME = `((?:"[^"]+"|[\\w$]+)(?:\\.(?:"[^"]+"|[\\w$]+))?)`;
const CREATE_TABLE_PATTERN = new RegExp(`^CREATE\\s+(?:UNLOGGED\\s+)?TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${TABLE_NAME}`, "i");
const ALTER_TABLE_PATTERN = new RegExp(`^ALTER\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?(?:ONLY\\s+)?${TABLE_NAME}`, "i");
const INDEX_ON_PATTERN = new RegExp(`\\sON\\s+(?:ONLY\\s+)?${TABLE_NAME}`, "i");

function targetTable(statement: string): string | null {
  const match = ALTER_TABLE_PATTERN.exec(statement) ?? INDEX_ON_PATTERN.exec(statement);
  return match ? normalizeTableName(match[1]) : null;
}

export function checkMigrationSql(sql: string): GateResult {
  const statements = splitStatements(sql);
  const createdTables = new Set<string>();
  for (const statement of statements) {
    const match = CREATE_TABLE_PATTERN.exec(statement);
    if (match) createdTables.add(normalizeTableName(match[1]));
  }

  const findings: GateFinding[] = [];
  statements.forEach((statement, statementIndex) => {
    const upper = statement.toUpperCase();
    const rule = STATEMENT_RULES.find((candidate) => candidate.pattern.test(upper));
    if (!rule) return;
    if (rule.onlyExistingTable) {
      const table = targetTable(statement);
      if (table && createdTables.has(table)) return;
    }
    findings.push({ statementIndex, rule: rule.rule, statement: statement.slice(0, 200) });
  });

  const approved = APPROVAL_MARKER_PATTERN.test(sql);
  return { approved, findings, blocked: findings.length > 0 && !approved };
}

export type JournalEntry = { idx: number; when: number; tag: string };

// Cùng điều kiện với drizzle-orm migrator (pg-core/dialect.js): migration được apply khi
// chưa có bản ghi nào, hoặc created_at mới nhất < folderMillis (`when` trong meta/_journal.json).
export function selectPendingMigrations(entries: JournalEntry[], lastAppliedMillis: number | null): JournalEntry[] {
  if (lastAppliedMillis === null) return entries;
  return entries.filter((entry) => lastAppliedMillis < entry.when);
}
