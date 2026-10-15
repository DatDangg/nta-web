import { COMPANY_MAX_LENGTH, isContactNeed, type ContactNeed } from '@/lib/contact/company-info';

export type ContactForm = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  need?: ContactNeed;
  message: string;
  honeypot: string;
  /** Ngôn ngữ trang khách gửi form (R-13a) — luôn có sau validate, mặc định `vi`. */
  locale: ContactLocale;
};

export type ContactLocale = 'vi' | 'en';

export type ContactValidation =
  | { success: true; data: ContactForm }
  | { success: false; errors: Record<string, string> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{9,15}$/;

export function validateContactForm(input: unknown): ContactValidation {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { success: false, errors: { form: 'Dữ liệu không hợp lệ' } };
  }

  const body = input as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone : undefined;
  const company = typeof body.company === 'string' ? body.company.trim() : undefined;
  const need = typeof body.need === 'string' ? body.need : undefined;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const honeypot = typeof body.honeypot === 'string' ? body.honeypot : undefined;
  const locale = body.locale === undefined || body.locale === '' ? 'vi' : body.locale;

  if (name.length < 2 || name.length > 100) {
    errors.name = 'Tên phải có từ 2 đến 100 ký tự';
  }
  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Email không hợp lệ';
  }
  if (
    body.phone !== undefined &&
    body.phone !== '' &&
    (phone === undefined || !PHONE_PATTERN.test(phone))
  ) {
    errors.phone = 'Số điện thoại phải có từ 9 đến 15 chữ số';
  }
  if (body.company !== undefined && (company === undefined || company.length > COMPANY_MAX_LENGTH)) {
    errors.company = `Tên doanh nghiệp tối đa ${COMPANY_MAX_LENGTH} ký tự`;
  }
  if (body.need !== undefined && body.need !== '' && (need === undefined || !isContactNeed(need))) {
    errors.need = 'Nhu cầu không hợp lệ';
  }
  if (message.length < 10 || message.length > 2000) {
    errors.message = 'Nội dung phải có từ 10 đến 2000 ký tự';
  }
  if (locale !== 'vi' && locale !== 'en') {
    errors.locale = 'Ngôn ngữ không hợp lệ';
  }
  if (honeypot === undefined) {
    errors.honeypot = 'Trường xác minh không hợp lệ';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      email,
      phone,
      company: company || undefined,
      need: need && isContactNeed(need) ? need : undefined,
      message,
      honeypot: honeypot ?? '',
      locale: locale === 'en' ? 'en' : 'vi',
    },
  };
}
