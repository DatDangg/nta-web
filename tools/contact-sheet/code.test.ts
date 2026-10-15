// Test Apps Script tools/contact-sheet/Code.gs (CR-037, R-13a) ngoài Google: nạp bằng node:vm với stub dịch vụ Apps Script.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import vm from "node:vm";
import { CONTACT_NEEDS } from "../../src/lib/contact/company-info";

const SCRIPT_SOURCE = readFileSync(path.join(__dirname, "Code.gs"), "utf8");
const SECRET = "s".repeat(40);
const BOT_TOKEN = "123456:BOT-TOKEN-SECRET";

interface FetchCall {
  url: string;
  options: { method: string; payload: { chat_id: string; text: string; disable_web_page_preview: boolean } };
}

interface Harness {
  context: vm.Context;
  rows: unknown[][];
  fetches: FetchCall[];
  errors: string[];
  post: (body: unknown) => { status: string; code?: string };
}

interface HarnessOptions {
  props?: Record<string, string | null>;
  fetchImpl?: (url: string) => { getResponseCode: () => number };
  existingRows?: number;
}

function vnTime(date: Date): string {
  const shifted = new Date(date.getTime() + 7 * 3600 * 1000);
  return shifted.toISOString().slice(0, 19).replace("T", " ");
}

function createHarness(options: HarnessOptions = {}): Harness {
  const props: Record<string, string | null> = {
    SECRET_TOKEN: SECRET,
    TELEGRAM_BOT_TOKEN: BOT_TOKEN,
    TELEGRAM_CHAT_ID: "999",
    ...options.props,
  };
  const rows: unknown[][] = [];
  const fetches: FetchCall[] = [];
  const errors: string[] = [];
  let lastRow = options.existingRows ?? 1;
  const sheet = {
    getLastRow: () => lastRow,
    appendRow: (row: unknown[]) => {
      rows.push(Array.from(row)); // mảng tạo trong vm khác realm → copy để deepEqual so được
      lastRow += 1;
    },
  };
  const context = vm.createContext({
    console: { error: (...args: unknown[]) => errors.push(args.map(String).join(" ")), log: () => undefined },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key: string) => props[key] ?? null }) },
    LockService: { getScriptLock: () => ({ waitLock: () => undefined, releaseLock: () => undefined }) },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({ getSheets: () => [sheet], getSheetByName: (name: string) => (name === "Liên hệ" ? sheet : null) }),
    },
    UrlFetchApp: {
      fetch: (url: string, fetchOptions: FetchCall["options"]) => {
        fetches.push({ url, options: fetchOptions });
        return options.fetchImpl ? options.fetchImpl(url) : { getResponseCode: () => 200 };
      },
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput: (text: string) => ({ text, setMimeType: () => ({ text }) }),
    },
    Utilities: {
      formatDate: (date: Date, timeZone: string, pattern: string) => {
        assert.equal(timeZone, "Asia/Ho_Chi_Minh");
        assert.equal(pattern, "yyyy-MM-dd HH:mm:ss");
        return vnTime(date);
      },
    },
  });
  vm.runInContext(SCRIPT_SOURCE, context, { filename: "Code.gs" });
  const post = (body: unknown) => {
    const contents = typeof body === "string" ? body : JSON.stringify(body);
    const output = context.doPost({ postData: { contents } }) as { text: string };
    return JSON.parse(output.text) as { status: string; code?: string };
  };
  return { context, rows, fetches, errors, post };
}

function validPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    token: SECRET,
    submittedAt: "2026-10-15T08:00:00.000Z",
    locale: "vi",
    name: "Nguyễn Văn A",
    email: "a@example.com",
    phone: "0901234567",
    company: "Công ty B",
    need: "crm",
    message: "Cần tư vấn CRM",
    ...overrides,
  };
}

describe("Code.gs doPost — token", () => {
  it("token đúng → 1 dòng đúng thứ tự cột, 1 lần gọi sendMessage, trả ok", () => {
    const h = createHarness();
    assert.deepEqual(h.post(validPayload()), { status: "ok" });
    assert.deepEqual(h.rows, [
      ["2026-10-15 15:00:00", "'vi", "'Nguyễn Văn A", "'a@example.com", "'0901234567", "'Công ty B", "'Phần mềm CRM", "'Cần tư vấn CRM"],
    ]);
    assert.equal(h.fetches.length, 1);
    assert.equal(h.fetches[0].url, `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`);
    assert.equal(h.fetches[0].options.method, "post");
    assert.equal(h.fetches[0].options.payload.chat_id, "999");
    assert.equal(h.fetches[0].options.payload.disable_web_page_preview, true);
    assert.equal("parse_mode" in h.fetches[0].options.payload, false);
  });

  const unauthorizedCases: [string, Record<string, unknown>, Record<string, string | null>][] = [
    ["token sai", { token: "x".repeat(40) }, {}],
    ["token sai 1 ký tự cuối", { token: "s".repeat(39) + "t" }, {}],
    ["token dài hơn", { token: SECRET + "s" }, {}],
    ["thiếu token", { token: undefined }, {}],
    ["token không phải chuỗi", { token: 123 }, {}],
    ["property SECRET_TOKEN rỗng", { token: "" }, { SECRET_TOKEN: "" }],
    ["thiếu property SECRET_TOKEN", {}, { SECRET_TOKEN: null }],
  ];
  for (const [label, overrides, props] of unauthorizedCases) {
    it(`${label} → unauthorized, không ghi, không Telegram`, () => {
      const h = createHarness({ props });
      assert.deepEqual(h.post(validPayload(overrides)), { status: "error", code: "unauthorized" });
      assert.equal(h.rows.length, 0);
      assert.equal(h.fetches.length, 0);
    });
  }
});

describe("Code.gs doPost — validate", () => {
  const badRequestCases: [string, unknown][] = [
    ["JSON hỏng", "{not json"],
    ["body rỗng", ""],
    ["JSON là mảng", [1, 2]],
    ["locale lạ", validPayload({ locale: "fr" })],
    ["name rỗng", validPayload({ name: "  " })],
    ["thiếu email", validPayload({ email: undefined })],
    ["message không phải chuỗi", validPayload({ message: 5 })],
    ["chuỗi quá 5000 ký tự", validPayload({ message: "a".repeat(5001) })],
    ["phone sai kiểu", validPayload({ phone: 123 })],
  ];
  for (const [label, body] of badRequestCases) {
    it(`${label} → bad_request, không ghi`, () => {
      const h = createHarness();
      assert.deepEqual(h.post(body), { status: "error", code: "bad_request" });
      assert.equal(h.rows.length, 0);
      assert.equal(h.fetches.length, 0);
    });
  }

  it("doPost không có postData → bad_request", () => {
    const h = createHarness();
    const output = h.context.doPost(undefined) as { text: string };
    assert.deepEqual(JSON.parse(output.text), { status: "error", code: "bad_request" });
  });

  for (const empty of [null, ""]) {
    it(`phone/company/need = ${JSON.stringify(empty)} được nhận`, () => {
      const h = createHarness();
      assert.deepEqual(h.post(validPayload({ phone: empty, company: empty, need: empty })), { status: "ok" });
      assert.deepEqual(h.rows[0].slice(4, 7), ["", "", ""]);
    });
  }

  it("need lạ → ghi nguyên key, vẫn ok", () => {
    const h = createHarness();
    assert.deepEqual(h.post(validPayload({ need: "new-product" })), { status: "ok" });
    assert.equal(h.rows[0][6], "'new-product");
  });

  it("chuỗi đúng 5000 ký tự được nhận", () => {
    const h = createHarness();
    assert.deepEqual(h.post(validPayload({ message: "a".repeat(5000) })), { status: "ok" });
  });

  it("submittedAt không hợp lệ → dùng giờ nhận của script", () => {
    const h = createHarness();
    const before = vnTime(new Date());
    h.post(validPayload({ submittedAt: "không phải ngày" }));
    const after = vnTime(new Date());
    const written = String(h.rows[0][0]);
    assert.ok(written >= before && written <= after, `${written} ngoài [${before}, ${after}]`);
  });
});

describe("Code.gs — sheet", () => {
  it("sheet rỗng → tạo header trước dòng dữ liệu", () => {
    const h = createHarness({ existingRows: 0 });
    h.post(validPayload());
    assert.deepEqual(h.rows[0], ["Thời gian", "Ngôn ngữ", "Tên", "Email", "SĐT", "Công ty", "Nhu cầu", "Nội dung"]);
    assert.equal(h.rows.length, 2);
  });

  it("SHEET_NAME trỏ sheet không tồn tại → server_error, không Telegram", () => {
    const h = createHarness({ props: { SHEET_NAME: "Không có" } });
    assert.deepEqual(h.post(validPayload()), { status: "error", code: "server_error" });
    assert.equal(h.fetches.length, 0);
  });

  it("SHEET_NAME đúng → ghi vào sheet đó", () => {
    const h = createHarness({ props: { SHEET_NAME: "Liên hệ" } });
    assert.deepEqual(h.post(validPayload()), { status: "ok" });
    assert.equal(h.rows.length, 1);
  });

  const injections = ["=HYPERLINK(\"http://x\",\"y\")", "+1", "-2", "@x", "\tab", "\rcr"];
  for (const value of injections) {
    it(`chống formula injection: ${JSON.stringify(value)} có tiền tố '`, () => {
      const h = createHarness();
      h.post(validPayload({ name: value, company: value, message: value }));
      assert.equal(h.rows[0][2], `'${value}`);
      assert.equal(h.rows[0][5], `'${value}`);
      assert.equal(h.rows[0][7], `'${value}`);
    });
  }

  it("SĐT 0901234567 ghi dạng văn bản, giữ số 0 đầu", () => {
    const h = createHarness();
    h.post(validPayload({ phone: "0901234567" }));
    assert.equal(h.rows[0][4], "'0901234567");
  });

  // Sheet parse chuỗi không có ' thành ngày/boolean/số → mọi ô người dùng phải có đúng 1 tiền tố '.
  for (const value of ["2026-10-15", "TRUE", "1/2", "1e5"]) {
    it(`${JSON.stringify(value)} ghi dạng văn bản, không bị đổi kiểu`, () => {
      const h = createHarness();
      h.post(validPayload({ name: value, company: value, message: value }));
      assert.equal(h.rows[0][2], `'${value}`);
      assert.equal(h.rows[0][5], `'${value}`);
      assert.equal(h.rows[0][7], `'${value}`);
    });
  }

  it("chuỗi thường có đúng 1 tiền tố ', chuỗi rỗng/null giữ rỗng", () => {
    const h = createHarness();
    assert.equal(h.context.sanitizeCell_("Xin chào = bạn"), "'Xin chào = bạn");
    assert.equal(h.context.sanitizeCell_("=1+1"), "'=1+1");
    assert.equal(h.context.sanitizeCell_(""), "");
    assert.equal(h.context.sanitizeCell_(null), "");
  });

  it("cột thời gian không có tiền tố '", () => {
    const h = createHarness();
    h.post(validPayload());
    assert.equal(h.rows[0][0], "2026-10-15 15:00:00");
  });
});

describe("Code.gs — Telegram", () => {
  it("text thuần đủ tên/email/SĐT/công ty/nhu cầu/nội dung/ngôn ngữ, không chứa token", () => {
    const h = createHarness();
    h.post(validPayload({ locale: "en" }));
    const text = h.fetches[0].options.payload.text;
    for (const part of ["Nguyễn Văn A", "a@example.com", "0901234567", "Công ty B", "Phần mềm CRM", "Cần tư vấn CRM", "(en)"]) {
      assert.ok(text.includes(part), `thiếu ${part}`);
    }
    assert.ok(!text.includes(SECRET));
    assert.ok(!text.includes(BOT_TOKEN));
  });

  it("text cắt ≤ 4000 ký tự", () => {
    const h = createHarness();
    h.post(validPayload({ message: "a".repeat(5000) }));
    assert.ok(h.fetches[0].options.payload.text.length <= 4000);
  });

  it("Telegram ném lỗi chứa token → vẫn 1 dòng + ok, console.error không lộ token", () => {
    const h = createHarness({
      fetchImpl: (url) => {
        throw new Error(`Exception: request failed for ${url}`);
      },
    });
    assert.deepEqual(h.post(validPayload()), { status: "ok" });
    assert.equal(h.rows.length, 1);
    assert.ok(h.errors.length > 0);
    for (const line of h.errors) {
      assert.ok(!line.includes(BOT_TOKEN));
      assert.ok(!line.includes("a@example.com"));
    }
  });

  it("Telegram trả 4xx → vẫn 1 dòng + ok, log chỉ mã HTTP", () => {
    const h = createHarness({ fetchImpl: () => ({ getResponseCode: () => 403 }) });
    assert.deepEqual(h.post(validPayload()), { status: "ok" });
    assert.equal(h.rows.length, 1);
    assert.deepEqual(h.errors, ["contact-sheet: telegram_http_403"]);
  });

  it("thiếu TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID → bỏ qua Telegram, vẫn ok", () => {
    const missingTelegramProps: Record<string, string | null>[] = [{ TELEGRAM_BOT_TOKEN: null }, { TELEGRAM_CHAT_ID: "" }];
    for (const props of missingTelegramProps) {
      const h = createHarness({ props });
      assert.deepEqual(h.post(validPayload()), { status: "ok" });
      assert.equal(h.rows.length, 1);
      assert.equal(h.fetches.length, 0);
    }
  });

  it("không gọi URL nào khác ngoài sendMessage", () => {
    const h = createHarness();
    h.post(validPayload());
    assert.ok(h.fetches.every((call) => call.url.endsWith("/sendMessage")));
  });
});

describe("Code.gs — doGet + bảng nhãn", () => {
  it("doGet → method_not_allowed", () => {
    const h = createHarness();
    const output = h.context.doGet() as { text: string };
    assert.deepEqual(JSON.parse(output.text), { status: "error", code: "method_not_allowed" });
  });

  it("NEED_LABELS_ có đúng tập key của CONTACT_NEEDS", () => {
    const h = createHarness();
    const labels = h.context.NEED_LABELS_ as Record<string, string>;
    assert.deepEqual(Object.keys(labels).sort(), [...CONTACT_NEEDS].sort());
  });
});
