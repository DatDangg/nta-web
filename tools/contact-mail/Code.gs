/**
 * NTA — form Liên hệ → 1 email tới admin (CR-039, spec R-13a 4.7.0). Không ghi Google Sheet, không báo Telegram.
 * Dán file này vào một dự án Apps Script (dùng lại dự án cũ để giữ URL /exec, hoặc tạo dự án mới), triển khai dạng Ứng dụng web.
 * Hướng dẫn: tools/contact-mail/README.md. Test ngoài Google: tools/contact-mail/code.test.ts (node:vm).
 *
 * Script Properties: SECRET_TOKEN (bắt buộc), ADMIN_EMAIL (bắt buộc — người nhận, đọc lại mỗi request).
 * Hợp đồng: POST JSON {token, submittedAt, locale, name, email, phone, company, need, message}
 *   → {"status":"ok"} khi đã gửi mail, {"status":"error","code":"unauthorized|bad_request|server_error"} khi không gửi.
 * Lần đầu: chạy testSendMail trong editor để cấp quyền gửi mail (thiếu quyền → Google trả trang HTML lỗi → web báo 500).
 */

var MAX_FIELD_LENGTH_ = 5000;
var MAX_SUBJECT_NAME_LENGTH_ = 100;
var TIME_ZONE_ = 'Asia/Ho_Chi_Minh';
var MAIL_SUBJECT_PREFIX_ = '[NTA] Liên hệ mới — ';
var MAIL_SENDER_NAME_ = 'NTA Website';
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
// Email khách dùng làm replyTo → đúng 1 địa chỉ dạng x@y: cấm khoảng trắng/ký tự điều khiển (chèn header) và , ; < > " (nhiều
// người nhận / dạng "Tên <địa chỉ>"). Vẫn lỏng hơn zod email của web (G5) — zod cũng từ chối các ký tự này.
var REPLY_TO_PATTERN_ = /^[^\s@,;<>"\u0000-\u001F\u007F]+@[^\s@,;<>"\u0000-\u001F\u007F]+$/;
var CONTROL_CHARS_ = /[\u0000-\u001F\u007F]/g;

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

  // Đọc mỗi request (không cache) → đổi ADMIN_EMAIL có hiệu lực ngay, không cần triển khai lại.
  var adminEmail = readAdminEmail_(props);
  if (!adminEmail) {
    console.error('contact-mail: admin_email_missing');
    return jsonResponse_({ status: 'error', code: 'server_error' });
  }
  if (!sendContactMail_(adminEmail, payload, new Date())) {
    return jsonResponse_({ status: 'error', code: 'server_error' });
  }
  return jsonResponse_({ status: 'ok' });
}

function doGet() {
  return jsonResponse_({ status: 'error', code: 'method_not_allowed' });
}

/**
 * Chạy tay trong editor Apps Script: lần đầu Google hỏi quyền "Gửi email thay bạn" (bắt buộc trước khi doPost gửi được),
 * sau đó gửi 1 mail thử tới ADMIN_EMAIL. Web App không gọi được hàm này (chỉ doGet/doPost).
 */
function testSendMail() {
  var adminEmail = readAdminEmail_(PropertiesService.getScriptProperties());
  if (!adminEmail) throw new Error('contact-mail: admin_email_missing — đặt Script Property ADMIN_EMAIL trước');
  var sample = {
    submittedAt: new Date().toISOString(),
    locale: 'vi',
    name: 'Thử cấu hình',
    email: 'test@example.com',
    phone: null,
    company: null,
    need: 'other',
    message: 'Mail thử từ testSendMail — cấu hình gửi mail form Liên hệ đã hoạt động.',
  };
  if (!sendContactMail_(adminEmail, sample, new Date())) throw new Error('contact-mail: send_failed — xem Executions');
  return 'ok';
}

function jsonResponse_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function readAdminEmail_(props) {
  var value = props.getProperty('ADMIN_EMAIL');
  return typeof value === 'string' ? value.trim() : '';
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
  return REPLY_TO_PATTERN_.test(p.email);
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

function orDash_(value) {
  return value === null || value === undefined || String(value).trim() === '' ? '-' : String(value);
}

/** Tiêu đề 1 dòng: bỏ ký tự điều khiển (\r \n \t…) khỏi tên để không chèn được header, cắt độ dài; còn rỗng → "-". */
function buildMailSubject_(p) {
  var name = String(p.name).replace(CONTROL_CHARS_, ' ').replace(/\s+/g, ' ').trim();
  if (name.length > MAX_SUBJECT_NAME_LENGTH_) name = name.slice(0, MAX_SUBJECT_NAME_LENGTH_ - 1) + '…';
  return MAIL_SUBJECT_PREFIX_ + orDash_(name);
}

/** Nội dung plain text (không HTML) — dữ liệu khách nằm nguyên văn, mail client không render thẻ. */
function buildMailBody_(p, receivedAt) {
  return [
    'Thời gian (giờ VN): ' + formatSubmittedAt_(p.submittedAt, receivedAt),
    'Ngôn ngữ: ' + orDash_(p.locale),
    'Tên: ' + orDash_(p.name),
    'Email: ' + orDash_(p.email),
    'SĐT: ' + orDash_(p.phone),
    'Công ty: ' + orDash_(p.company),
    'Nhu cầu: ' + orDash_(needLabel_(p.need)),
    '',
    'Nội dung:',
    orDash_(p.message),
  ].join('\n');
}

/** Gửi 1 mail tới admin. Trả false khi lỗi (hết hạn mức, chưa cấp quyền…); log chỉ mã cố định — exception có thể chứa email khách. */
function sendContactMail_(adminEmail, p, receivedAt) {
  try {
    MailApp.sendEmail({
      to: adminEmail,
      replyTo: p.email,
      subject: buildMailSubject_(p),
      body: buildMailBody_(p, receivedAt),
      name: MAIL_SENDER_NAME_,
    });
    return true;
  } catch (err) {
    console.error('contact-mail: send_failed');
    return false;
  }
}
