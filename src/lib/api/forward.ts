import type { ContactForm } from './contact-schema';

// Apps Script Web App (R-13a): cold start 1–3 s + gửi mail qua MailApp → 5 s không đủ.
const FORWARD_TIMEOUT_MS = 10000;

/**
 * Gửi form liên hệ tới Apps Script Web App (hợp đồng: tasks/feature-contact-form-email-only/phase-1-task-01.md, script tools/contact-mail/Code.gs).
 * Server-only: URL + token chỉ đọc từ env runtime, không bao giờ có trong message lỗi.
 * Web App trả 302 → script.googleusercontent.com; fetch Node theo redirect (đổi sang GET) để lấy JSON kết quả.
 */
export async function forwardContactForm(contact: ContactForm, now: () => Date = () => new Date()): Promise<void> {
  const target = process.env.CONTACT_FORM_TARGET;
  const token = process.env.CONTACT_FORM_TOKEN;
  if (
    !target ||
    !token ||
    process.env.NEXT_PUBLIC_CONTACT_FORM_TARGET ||
    process.env.NEXT_PUBLIC_CONTACT_FORM_TOKEN
  ) {
    throw new Error('Contact forwarding is not configured');
  }

  const response = await postToWebApp(target, token, contact, now());

  if (!response.ok) {
    throw new Error('Contact forwarding failed');
  }
  // Google trả trang HTML khi deploy sai quyền / script lỗi → json() ném lỗi; chỉ {status:"ok"} mới là đã gửi mail.
  const result: unknown = await response.json().catch(() => null);
  if (typeof result !== 'object' || result === null || !('status' in result) || result.status !== 'ok') {
    throw new Error('Contact forwarding failed');
  }
}

async function postToWebApp(target: string, token: string, contact: ContactForm, submittedAt: Date): Promise<Response> {
  try {
    return await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        submittedAt: submittedAt.toISOString(),
        locale: contact.locale,
        name: contact.name,
        email: contact.email,
        // Schema giữ phone '' khi khách bỏ trống → gửi null cho đúng hợp đồng.
        phone: contact.phone || null,
        company: contact.company ?? null,
        need: contact.need ?? null,
        message: contact.message,
      }),
      redirect: 'follow',
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
  } catch {
    // Lỗi mạng/timeout của fetch có thể kèm URL Web App (chứa deployment id) → thay bằng message chung.
    throw new Error('Contact forwarding failed');
  }
}
