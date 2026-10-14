import { NextRequest } from 'next/server';
import { validateContactForm } from '@/lib/api/contact-schema';
import { forwardContactForm } from '@/lib/api/forward';
import { getClientIp } from '@/lib/api/client-ip';
import { isContactRateLimited } from '@/lib/api/rate-limit';

const RATE_LIMIT_MESSAGE = 'Vui lòng thử lại sau.';
const INVALID_JSON_MESSAGE = 'Dữ liệu không hợp lệ';
const FORWARD_ERROR_MESSAGE = 'Không thể gửi yêu cầu lúc này.';

export async function POST(request: NextRequest): Promise<Response> {
  if (isContactRateLimited(getClientIp(request))) {
    return Response.json(
      { status: 'error', message: RATE_LIMIT_MESSAGE },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { status: 'error', errors: { form: INVALID_JSON_MESSAGE } },
      { status: 400 },
    );
  }

  const validation = validateContactForm(body);
  if (!validation.success) {
    return Response.json({ status: 'error', errors: validation.errors }, { status: 400 });
  }

  if (validation.data.honeypot.length > 0) {
    return Response.json({ status: 'ok' });
  }

  try {
    await forwardContactForm(validation.data);
    return Response.json({ status: 'ok' });
  } catch {
    return Response.json(
      { status: 'error', message: FORWARD_ERROR_MESSAGE },
      { status: 500 },
    );
  }
}
