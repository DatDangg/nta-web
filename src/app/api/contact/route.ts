import { NextRequest } from 'next/server';
import { validateContactForm } from '@/lib/api/contact-schema';
import { forwardContactForm } from '@/lib/api/forward';
import { isContactRateLimited } from '@/lib/api/rate-limit';

const RATE_LIMIT_MESSAGE = 'Vui lòng thử lại sau.';
const INVALID_JSON_MESSAGE = 'Dữ liệu không hợp lệ';
const FORWARD_ERROR_MESSAGE = 'Không thể gửi yêu cầu lúc này.';
const SHARED_FALLBACK_KEY = 'unknown';

function isValidIpAddress(value: string): boolean {
  const ipv4Parts = value.split('.');
  if (ipv4Parts.length === 4) {
    return ipv4Parts.every((part) => {
      if (!/^\d{1,3}$/.test(part)) return false;
      const octet = Number(part);
      return octet >= 0 && octet <= 255;
    });
  }

  if (!value.includes(':')) return false;
  let ipv6Address = value;
  const embeddedIpv4 = value.match(/(?:^|:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (embeddedIpv4) {
    if (!isValidIpAddress(embeddedIpv4[1])) return false;
    ipv6Address = `${value.slice(0, -embeddedIpv4[1].length)}0:0`;
  }
  if (!/^[\da-f:]+$/i.test(ipv6Address) || ipv6Address.includes(':::')) return false;
  const halves = ipv6Address.split('::');
  if (halves.length > 2) return false;
  const groups = ipv6Address.split(':').filter(Boolean);
  if (!groups.every((group) => group.length <= 4)) return false;
  return halves.length === 2 ? groups.length < 8 : groups.length === 8;
}

function getClientIp(request: NextRequest): string {
  // nginx (VPS) appends the real client IP rightmost via X-Forwarded-For; rate-limit state is in-memory per instance.
  const trustedIp = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  return trustedIp && isValidIpAddress(trustedIp) ? trustedIp : SHARED_FALLBACK_KEY;
}

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
