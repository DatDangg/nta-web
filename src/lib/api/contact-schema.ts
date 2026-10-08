export type ContactForm = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  honeypot: string;
};

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
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const honeypot = typeof body.honeypot === 'string' ? body.honeypot : undefined;

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
  if (message.length < 10 || message.length > 2000) {
    errors.message = 'Nội dung phải có từ 10 đến 2000 ký tự';
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
      message,
      honeypot: honeypot ?? '',
    },
  };
}
