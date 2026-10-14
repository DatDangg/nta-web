const CONTACT_RATE_LIMIT = 5;
const CONTACT_WINDOW_MS = 10 * 60 * 1000;
// /api/revalidate: bot/CLI gọi sau mỗi lần sửa nội dung → ngưỡng rộng hơn contact, vẫn chặn dò secret hàng loạt.
const REVALIDATE_RATE_LIMIT = 30;
const REVALIDATE_WINDOW_MS = 60 * 1000;

// This in-memory window is per application instance; use shared storage if scaling horizontally.
function createRateLimiter(limit: number, windowMs: number): (key: string, now?: number) => boolean {
  const requestsByKey = new Map<string, number[]>();

  return (key, now = Date.now()) => {
    for (const [address, timestamps] of requestsByKey) {
      const activeTimestamps = timestamps.filter(
        (requestTime) => now - requestTime < windowMs,
      );
      if (activeTimestamps.length === 0) {
        requestsByKey.delete(address);
      } else if (activeTimestamps.length !== timestamps.length) {
        requestsByKey.set(address, activeTimestamps);
      }
    }

    const recentRequests = (requestsByKey.get(key) ?? []).filter(
      (requestTime) => now - requestTime < windowMs,
    );

    if (recentRequests.length >= limit) {
      requestsByKey.set(key, recentRequests);
      return true;
    }

    recentRequests.push(now);
    requestsByKey.set(key, recentRequests);
    return false;
  };
}

export const isContactRateLimited = createRateLimiter(CONTACT_RATE_LIMIT, CONTACT_WINDOW_MS);
export const isRevalidateRateLimited = createRateLimiter(REVALIDATE_RATE_LIMIT, REVALIDATE_WINDOW_MS);
