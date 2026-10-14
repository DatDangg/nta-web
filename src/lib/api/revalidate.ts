import { createHash, timingSafeEqual } from 'node:crypto';
import { isContentCollection, type ContentCollection } from '@/db/schema';
import { ALL_CONTENT_TAG, collectionTag, entryTag } from '@/lib/content/cache-tags';

// Logic POST /api/revalidate (CR-031 P3-T03, spec R-15a) — tách khỏi route.ts để test không cần Next server:
// route truyền revalidateTag thật của next/cache, test truyền hàm giả.

export const REVALIDATE_SECRET_HEADER = 'x-revalidate-secret';

// Slug không có ký tự lạ/quá dài: tag Next tối đa 256 ký tự và slug đi thẳng vào tên tag.
const SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

type RevalidateTarget = { all: true } | { collection: ContentCollection; slug?: string };

export interface RevalidateDeps {
  expectedSecret: string | undefined;
  clientKey: string;
  isRateLimited: (key: string) => boolean;
  revalidateTag: (tag: string) => void;
  log: Pick<Console, 'error' | 'info'>;
}

function jsonNoStore(body: object, status: number): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

// So sánh constant-time: băm SHA-256 hai phía → buffer cùng 32 byte, timingSafeEqual không ném khi độ dài khác
// và thời gian không phụ thuộc độ dài/nội dung secret gửi lên.
function secretMatches(provided: string | null, expected: string): boolean {
  if (provided === null) return false;
  const digest = (value: string) => createHash('sha256').update(value, 'utf8').digest();
  return timingSafeEqual(digest(provided), digest(expected));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Body chỉ nhận đúng 2 dạng {all:true} hoặc {collection, slug?} — key thừa/trộn 2 dạng → null (400).
export function parseRevalidateTarget(body: unknown): RevalidateTarget | 'unknown_collection' | null {
  if (!isPlainObject(body)) return null;
  const keys = Object.keys(body);
  if ('all' in body) return keys.length === 1 && body.all === true ? { all: true } : null;
  if (keys.some((key) => key !== 'collection' && key !== 'slug')) return null;
  const { collection, slug } = body;
  if (typeof collection !== 'string') return null;
  if (!isContentCollection(collection)) return 'unknown_collection';
  if (slug === undefined) return { collection };
  return typeof slug === 'string' && SLUG_PATTERN.test(slug) ? { collection, slug } : null;
}

// Sửa 1 bản ghi phải làm mới cả tag collection (danh sách chỉ gắn tag collection — xem cache-tags.ts).
export function tagsForTarget(target: RevalidateTarget): string[] {
  if ('all' in target) return [ALL_CONTENT_TAG];
  const tags = [collectionTag(target.collection)];
  if (target.slug !== undefined) tags.push(entryTag(target.collection, target.slug));
  return tags;
}

async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false };
  }
}

export async function handleRevalidateRequest(request: Request, deps: RevalidateDeps): Promise<Response> {
  if (deps.isRateLimited(deps.clientKey)) return jsonNoStore({ status: 'error', message: 'too_many_requests' }, 429);

  // Thiếu secret ở server = cấu hình sai: từ chối mọi request (503, không lộ chi tiết), log rõ cho người vận hành.
  const expectedSecret = deps.expectedSecret?.trim();
  if (!expectedSecret) {
    deps.log.error('[revalidate] REVALIDATE_SECRET chưa đặt — endpoint từ chối mọi request');
    return jsonNoStore({ status: 'error', message: 'unavailable' }, 503);
  }
  // Trim cả 2 phía (env có thể dính khoảng trắng/\r cuối dòng) → so cùng một chuẩn.
  if (!secretMatches(request.headers.get(REVALIDATE_SECRET_HEADER)?.trim() ?? null, expectedSecret)) {
    return jsonNoStore({ status: 'error', message: 'unauthorized' }, 401);
  }

  // Chỉ đọc body sau khi xác thực xong.
  const parsed = await readJson(request);
  if (!parsed.ok) return jsonNoStore({ status: 'error', message: 'invalid_json' }, 400);
  const target = parseRevalidateTarget(parsed.body);
  if (target === 'unknown_collection') return jsonNoStore({ status: 'error', message: 'unknown_collection' }, 400);
  if (target === null) return jsonNoStore({ status: 'error', message: 'invalid_body' }, 400);

  const tags = tagsForTarget(target);
  for (const tag of tags) deps.revalidateTag(tag);
  deps.log.info(`[revalidate] ${tags.join(', ')}`);
  return jsonNoStore({ status: 'ok', revalidated: tags }, 200);
}
