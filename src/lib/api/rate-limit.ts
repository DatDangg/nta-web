const CONTACT_RATE_LIMIT = 5;
const CONTACT_WINDOW_MS = 10 * 60 * 1000;

const requestsByIp = new Map<string, number[]>();

// This in-memory window is per application instance; use shared storage if scaling horizontally.
export function isContactRateLimited(ipAddress: string, now = Date.now()): boolean {
  for (const [address, timestamps] of requestsByIp) {
    const activeTimestamps = timestamps.filter(
      (requestTime) => now - requestTime < CONTACT_WINDOW_MS,
    );
    if (activeTimestamps.length === 0) {
      requestsByIp.delete(address);
    } else if (activeTimestamps.length !== timestamps.length) {
      requestsByIp.set(address, activeTimestamps);
    }
  }

  const recentRequests = (requestsByIp.get(ipAddress) ?? []).filter(
    (requestTime) => now - requestTime < CONTACT_WINDOW_MS,
  );

  if (recentRequests.length >= CONTACT_RATE_LIMIT) {
    requestsByIp.set(ipAddress, recentRequests);
    return true;
  }

  recentRequests.push(now);
  requestsByIp.set(ipAddress, recentRequests);
  return false;
}
