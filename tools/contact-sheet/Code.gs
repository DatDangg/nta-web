/**
 * NTA — form Liên hệ → Google Sheet + báo Telegram (CR-037, spec R-13a).
 * Dán file này vào Apps Script gắn với Sheet (Tiện ích mở rộng → Apps Script), triển khai dạng Ứng dụng web.
 * Hướng dẫn: tools/contact-sheet/README.md. Test ngoài Google: tools/contact-sheet/code.test.ts (node:vm).
 *
 * Script Properties: SECRET_TOKEN (bắt buộc), TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (tuỳ chọn), SHEET_NAME (tuỳ chọn).
 * Hợp đồng: POST JSON {token, submittedAt, locale, name, email, phone, company, need, message}
 *   → {"status":"ok"} khi đã ghi Sheet, {"status":"error","code":"unauthorized|bad_request|server_error"} khi không ghi.
 */

var MAX_FIELD_LENGTH_ = 5000;
var TELEGRAM_MAX_LENGTH_ = 4000;
var LOCK_TIMEOUT_MS_ = 10000;
var TIME_ZONE_ = 'Asia/Ho_Chi_Minh';
var SHEET_HEADER_ = ['Thời gian', 'Ngôn ngữ', 'Tên', 'Email', 'SĐT', 'Công ty', 'Nhu cầu', 'Nội dung'];
// Khớp CONTACT_NEEDS (src/lib/contact/company-info.ts) + nhãn vi `contact.needs.*`. Test kiểm đúng tập key.
var NEED_LABELS_ = {
  crm: 'Phần mềm CRM',
  dentgo: 'Phần mềm nha khoa DentGo',
  lms: 'Hệ thống đào tạo trực tuyến LMS',
  hrm: 'Quản trị nhân sự HRM',
  boxai: 'BoxAI',
  'custom-ai': 'Giải pháp AI theo yêu cầu',
  flycam: 'Flycam',
  'custom-software': 'Phát triển phần mềm theo yêu cầu',
  other: 'Khác',
};
var REQUIRED_FIELDS_ = ['name', 'email', 'message'];
var OPTIONAL_FIELDS_ = ['phone', 'company', 'need'];

function doPost(e) {
  var payload;
  try {
    payload = JSON.parse(e && e.postData ? e.postData.contents : '');
  } catch (err) {
    return jsonResponse_({ status: 'error', code: 'bad_request' });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return jsonResponse_({ status: 'error', code: 'bad_request' });
  }

  var props = PropertiesService.getScriptProperties();
  if (!isValidToken_(payload.token, props.getProperty('SECRET_TOKEN'))) {
    return jsonResponse_({ status: 'error', code: 'unauthorized' });
  }
  if (!validatePayload_(payload)) {
    return jsonResponse_({ status: 'error', code: 'bad_request' });
  }

  if (!appendContactRow_(props.getProperty('SHEET_NAME'), buildRow_(payload, new Date()))) {
    return jsonResponse_({ status: 'error', code: 'server_error' });
  }
  notifyTelegram_(props.getProperty('TELEGRAM_BOT_TOKEN'), props.getProperty('TELEGRAM_CHAT_ID'), payload);
  return jsonResponse_({ status: 'ok' });
}

function doGet() {
  return jsonResponse_({ status: 'error', code: 'method_not_allowed' });
}

function jsonResponse_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

/** So token theo thời gian không phụ thuộc vị trí ký tự sai đầu tiên (không short-circuit). */
function isValidToken_(given, expected) {
  if (typeof given !== 'string' || typeof expected !== 'string' || expected.length === 0) return false;
  var diff = given.length ^ expected.length;
  for (var i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ (given.charCodeAt(i) | 0);
  }
  return diff === 0;
}

/** Chốt an toàn LỎNG hơn validate của web (G5): mọi payload web chấp nhận thì ở đây phải chấp nhận. */
function validatePayload_(p) {
  if (p.locale !== 'vi' && p.locale !== 'en') return false;
  for (var i = 0; i < REQUIRED_FIELDS_.length; i++) {
    var required = p[REQUIRED_FIELDS_[i]];
    if (typeof required !== 'string' || required.trim() === '' || required.length > MAX_FIELD_LENGTH_) return false;
  }
  for (var j = 0; j < OPTIONAL_FIELDS_.length; j++) {
    var optional = p[OPTIONAL_FIELDS_[j]];
    if (optional === null || optional === undefined) continue;
    if (typeof optional !== 'string' || optional.length > MAX_FIELD_LENGTH_) return false;
  }
  return true;
}

/**
 * Ô dữ liệu người dùng luôn ghi dạng văn bản: tiền tố ' cho mọi chuỗi không rỗng.
 * Lý do: appendRow parse chuỗi như gõ tay — SĐT "0901234567" mất số 0, "1/2" / "2026-10-15" / "TRUE"
 * thành ngày/số/boolean, chuỗi bắt đầu bằng = + - @ thành công thức. Một dấu ' chặn cả hai;
 * Sheet không hiển thị dấu ' đầu.
 */
function sanitizeCell_(value) {
  if (value === null || value === undefined) return '';
  var text = String(value);
  return text === '' ? '' : "'" + text;
}

function needLabel_(need) {
  if (!need) return '';
  return Object.prototype.hasOwnProperty.call(NEED_LABELS_, need) ? NEED_LABELS_[need] : need;
}

function formatSubmittedAt_(submittedAt, receivedAt) {
  var parsed = typeof submittedAt === 'string' ? new Date(submittedAt) : null;
  var when = parsed && !isNaN(parsed.getTime()) ? parsed : receivedAt;
  return Utilities.formatDate(when, TIME_ZONE_, 'yyyy-MM-dd HH:mm:ss');
}

/** Thứ tự cột = SHEET_HEADER_. Cột thời gian để Sheet parse thành ngày; cột 2–8 ép văn bản. */
function buildRow_(p, receivedAt) {
  return [formatSubmittedAt_(p.submittedAt, receivedAt)].concat([
    p.locale,
    p.name,
    p.email,
    p.phone,
    p.company,
    needLabel_(p.need),
    p.message,
  ].map(sanitizeCell_));
}

/** Ghi 1 dòng dưới script lock. Trả false khi không ghi được (lock timeout, sheet không tồn tại, lỗi Sheet). */
function appendContactRow_(sheetName, row) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(LOCK_TIMEOUT_MS_);
  } catch (err) {
    console.error('contact-sheet: lock_timeout');
    return false;
  }
  try {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = sheetName ? spreadsheet.getSheetByName(sheetName) : spreadsheet.getSheets()[0];
    if (!sheet) {
      console.error('contact-sheet: sheet_not_found');
      return false;
    }
    if (sheet.getLastRow() === 0) sheet.appendRow(SHEET_HEADER_);
    sheet.appendRow(row);
    return true;
  } catch (err) {
    console.error('contact-sheet: sheet_write_failed');
    return false;
  } finally {
    lock.releaseLock();
  }
}

function buildTelegramText_(p) {
  var lines = [
    'Liên hệ mới từ website (' + p.locale + ')',
    'Tên: ' + p.name,
    'Email: ' + p.email,
    'SĐT: ' + (p.phone || '-'),
    'Công ty: ' + (p.company || '-'),
    'Nhu cầu: ' + (needLabel_(p.need) || '-'),
    'Nội dung:',
    p.message,
  ];
  var text = lines.join('\n');
  return text.length > TELEGRAM_MAX_LENGTH_ ? text.slice(0, TELEGRAM_MAX_LENGTH_ - 1) + '…' : text;
}

/** Báo Telegram sau khi đã ghi Sheet; mọi lỗi bị nuốt — log chỉ mã cố định (exception có thể chứa URL kèm token bot). */
function notifyTelegram_(botToken, chatId, p) {
  if (!botToken || !chatId) return;
  try {
    var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
      method: 'post',
      payload: { chat_id: chatId, text: buildTelegramText_(p), disable_web_page_preview: true },
      muteHttpExceptions: true,
    });
    var status = response.getResponseCode();
    if (status < 200 || status >= 300) console.error('contact-sheet: telegram_http_' + status);
  } catch (err) {
    console.error('contact-sheet: telegram_failed');
  }
}
