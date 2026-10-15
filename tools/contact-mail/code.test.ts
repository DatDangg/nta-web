// Test Apps Script tools/contact-mail/Code.gs (CR-039, R-13a 4.7.0) ngoài Google: nạp bằng node:vm với stub dịch vụ Apps Script.
// Không stub SpreadsheetApp/LockService/UrlFetchApp: script mà gọi tới sẽ ném ReferenceError → test bắt được.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import vm from "node:vm";
import { CONTACT_NEEDS } from "../../src/lib/contact/company-info";

const SCRIPT_SOURCE = readFileSync(path.join(__dirname, "Code.gs"), "utf8");
const SECRET = "s".repeat(40);
const ADMIN = "admin@example.com";

interface MailCall {
  to: string;
  replyTo: string;
  subject: string;
  body: string;
  name: string;
  htmlBody?: string;
}

interface Harness {
  context: vm.Context;
  props: Record<string, string | null>;
  mails: MailCall[];
  errors: string[];
  post: (body: unknown) => { status: string; code?: string };
}

interface HarnessOptions {
  props?: Record<string, string | null>;
  sendError?: Error;
}

function vnTime(date: Date): string {
  const shifted = new Date(date.getTime() + 7 * 3600 * 1000);
  return shifted.toISOString().slice(0, 19).replace("T", " ");
}

function createHarness(options: HarnessOptions = {}): Harness {
  const props: Record<string, string | null> = { SECRET_TOKEN: SECRET, ADMIN_EMAIL: ADMIN, ...options.props };
  const mails: MailCall[] = [];
  const errors: string[] = [];
  const context = vm.createContext({
    console: { error: (...args: unknown[]) => errors.push(args.map(String).join(" ")), log: () => undefined },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key: string) => props[key] ?? null }) },
    MailApp: {
      sendEmail: (message: MailCall) => {
        if (options.sendError) throw options.sendError;
        mails.push({ ...message }); // object tạo trong vm khác realm → copy để deepEqual so được
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
  return { context, props, mails, errors, post };
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

describe("Code.gs doPost — gửi mail", () => {
  it("token đúng → đúng 1 mail tới ADMIN_EMAIL, replyTo = email khách, tiêu đề + nội dung đủ 8 thông tin, trả ok", () => {
    const h = createHarness();
    assert.deepEqual(h.post(validPayload()), { status: "ok" });
    assert.equal(h.mails.length, 1);
    const mail = h.mails[0];
    assert.equal(mail.to, ADMIN);
    assert.equal(mail.replyTo, "a@example.com");
    assert.equal(mail.subject, "[NTA] Liên hệ mới — Nguyễn Văn A");
    assert.equal(mail.name, "NTA Website");
    assert.equal("htmlBody" in mail, false);
    assert.equal(
      mail.body,
      [
        "Thời gian (giờ VN): 2026-10-15 15:00:00",
        "Ngôn ngữ: vi",
        "Tên: Nguyễn Văn A",
        "Email: a@example.com",
        "SĐT: 0901234567",
        "Công ty: Công ty B",
        "Nhu cầu: Phần mềm CRM",
        "",
        "Nội dung:",
        "Cần tư vấn CRM",
      ].join("\n"),
    );
    assert.ok(!mail.body.includes(SECRET));
  });

  for (const empty of [null, "", undefined]) {
    it(`phone/company/need = ${JSON.stringify(empty)} → ghi "-"`, () => {
      const h = createHarness();
      assert.deepEqual(h.post(validPayload({ phone: empty, company: empty, need: empty })), { status: "ok" });
      const body = h.mails[0].body;
      assert.ok(body.includes("SĐT: -\n"));
      assert.ok(body.includes("Công ty: -\n"));
      assert.ok(body.includes("Nhu cầu: -\n"));
    });
  }

  it("need lạ → ghi nguyên key, vẫn ok", () => {
    const h = createHarness();
    assert.deepEqual(h.post(validPayload({ need: "new-product" })), { status: "ok" });
    assert.ok(h.mails[0].body.includes("Nhu cầu: new-product\n"));
  });

  it("locale en → dòng Ngôn ngữ: en", () => {
    const h = createHarness();
    h.post(validPayload({ locale: "en" }));
    assert.ok(h.mails[0].body.includes("Ngôn ngữ: en\n"));
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
    const written = h.mails[0].body.split("\n")[0].replace("Thời gian (giờ VN): ", "");
    assert.ok(written >= before && written <= after, `${written} ngoài [${before}, ${after}]`);
  });

  it("nội dung chứa thẻ HTML → nằm nguyên văn trong body plain text, không htmlBody", () => {
    const h = createHarness();
    const message = "<script>alert(1)</script> <b>đậm</b>";
    h.post(validPayload({ message }));
    assert.ok(h.mails[0].body.endsWith(`Nội dung:\n${message}`));
    assert.equal("htmlBody" in h.mails[0], false);
  });

  it("đổi ADMIN_EMAIL giữa 2 request → mail 2 tới địa chỉ mới (không cache)", () => {
    const h = createHarness();
    h.post(validPayload());
    h.props.ADMIN_EMAIL = "new-admin@example.com";
    h.post(validPayload());
    assert.deepEqual(
      h.mails.map((mail) => mail.to),
      [ADMIN, "new-admin@example.com"],
    );
  });

  it("ADMIN_EMAIL có khoảng trắng đầu/cuối → trim", () => {
    const h = createHarness({ props: { ADMIN_EMAIL: `  ${ADMIN}  ` } });
    h.post(validPayload());
    assert.equal(h.mails[0].to, ADMIN);
  });
});

describe("Code.gs doPost — tiêu đề", () => {
  for (const name of ["Tên\r\nBcc: x@evil.com", "Tên\tcó\ttab", "Tên\u0000\u007Flạ"]) {
    it(`tên ${JSON.stringify(name)} → tiêu đề 1 dòng, không ký tự điều khiển`, () => {
      const h = createHarness();
      assert.deepEqual(h.post(validPayload({ name })), { status: "ok" });
      const subject = h.mails[0].subject;
      assert.ok(subject.startsWith("[NTA] Liên hệ mới — Tên"));
      assert.equal(/[\u0000-\u001F\u007F]/.test(subject), false);
    });
  }

  it("tên chỉ có ký tự điều khiển (qua validate vì trim() không bỏ \\u0001) → tiêu đề ghi -", () => {
    const h = createHarness();
    assert.deepEqual(h.post(validPayload({ name: "\u0001\u0002" })), { status: "ok" });
    assert.equal(h.mails[0].subject, "[NTA] Liên hệ mới — -");
  });

  it("tên 300 ký tự → tiêu đề cắt ≤ 100 ký tự tên, kết thúc bằng …", () => {
    const h = createHarness();
    h.post(validPayload({ name: "a".repeat(300) }));
    const subject = h.mails[0].subject;
    const namePart = subject.replace("[NTA] Liên hệ mới — ", "");
    assert.equal(namePart.length, 100);
    assert.ok(namePart.endsWith("…"));
  });
});

describe("Code.gs doPost — token", () => {
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
    it(`${label} → unauthorized, không gửi mail`, () => {
      const h = createHarness({ props });
      assert.deepEqual(h.post(validPayload(overrides)), { status: "error", code: "unauthorized" });
      assert.equal(h.mails.length, 0);
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
    ["email có khoảng trắng", validPayload({ email: "a b@example.com" })],
    ["email có xuống dòng", validPayload({ email: "a@example.com\nBcc: x@evil.com" })],
    ["email có ký tự điều khiển", validPayload({ email: "a\u0001@example.com" })],
    ["email thiếu @", validPayload({ email: "a.example.com" })],
    ["email 2 dấu @", validPayload({ email: "a@b@example.com" })],
    ["email nhiều địa chỉ (dấu phẩy)", validPayload({ email: "a@example.com,b@example.com" })],
    ["email nhiều địa chỉ (chấm phẩy)", validPayload({ email: "a@example.com;b@example.com" })],
    ["email dạng tên <địa chỉ>", validPayload({ email: "A<a@example.com>" })],
    ["email có dấu nháy kép", validPayload({ email: '"a"@example.com' })],
  ];
  for (const [label, body] of badRequestCases) {
    it(`${label} → bad_request, không gửi mail`, () => {
      const h = createHarness();
      assert.deepEqual(h.post(body), { status: "error", code: "bad_request" });
      assert.equal(h.mails.length, 0);
    });
  }

  it("doPost không có postData → bad_request", () => {
    const h = createHarness();
    const output = h.context.doPost(undefined) as { text: string };
    assert.deepEqual(JSON.parse(output.text), { status: "error", code: "bad_request" });
  });
});

describe("Code.gs doPost — lỗi cấu hình / gửi", () => {
  for (const adminEmail of [null, "", "   "]) {
    it(`ADMIN_EMAIL = ${JSON.stringify(adminEmail)} → server_error, không gửi, log mã cố định`, () => {
      const h = createHarness({ props: { ADMIN_EMAIL: adminEmail } });
      assert.deepEqual(h.post(validPayload()), { status: "error", code: "server_error" });
      assert.equal(h.mails.length, 0);
      assert.deepEqual(h.errors, ["contact-mail: admin_email_missing"]);
    });
  }

  it("sendEmail ném lỗi chứa email khách → server_error, log chỉ mã cố định", () => {
    const h = createHarness({ sendError: new Error("Service invoked too many times: email a@example.com") });
    assert.deepEqual(h.post(validPayload()), { status: "error", code: "server_error" });
    assert.deepEqual(h.errors, ["contact-mail: send_failed"]);
    for (const line of h.errors) {
      assert.ok(!line.includes("a@example.com"));
      assert.ok(!line.includes(ADMIN));
      assert.ok(!line.includes(SECRET));
    }
  });
});

describe("Code.gs — doGet, testSendMail, bảng nhãn, nguồn", () => {
  it("doGet → method_not_allowed", () => {
    const h = createHarness();
    const output = h.context.doGet() as { text: string };
    assert.deepEqual(JSON.parse(output.text), { status: "error", code: "method_not_allowed" });
  });

  it("testSendMail → gửi 1 mail thử tới ADMIN_EMAIL", () => {
    const h = createHarness();
    assert.equal(h.context.testSendMail(), "ok");
    assert.equal(h.mails.length, 1);
    assert.equal(h.mails[0].to, ADMIN);
    assert.ok(h.mails[0].subject.startsWith("[NTA] Liên hệ mới — "));
  });

  it("testSendMail thiếu ADMIN_EMAIL → ném lỗi, không gửi", () => {
    const h = createHarness({ props: { ADMIN_EMAIL: null } });
    assert.throws(() => h.context.testSendMail(), /admin_email_missing/);
    assert.equal(h.mails.length, 0);
  });

  it("NEED_LABELS_ có đúng tập key của CONTACT_NEEDS", () => {
    const h = createHarness();
    const labels = h.context.NEED_LABELS_ as Record<string, string>;
    assert.deepEqual(Object.keys(labels).sort(), [...CONTACT_NEEDS].sort());
  });

  it("nguồn không còn Sheet/Telegram/HTML mail", () => {
    assert.equal(/SpreadsheetApp|UrlFetchApp|LockService|SHEET_NAME|TELEGRAM_|htmlBody/.test(SCRIPT_SOURCE), false);
  });
});
