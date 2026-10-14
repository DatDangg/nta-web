// Khoá rate-limit theo IP client — dùng chung /api/contact và /api/revalidate (chuyển nguyên văn từ contact/route.ts, CR-031 P3-T03).
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

export function getClientIp(request: Request): string {
  // nginx (VPS) appends the real client IP rightmost via X-Forwarded-For; rate-limit state is in-memory per instance.
  const trustedIp = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  return trustedIp && isValidIpAddress(trustedIp) ? trustedIp : SHARED_FALLBACK_KEY;
}
