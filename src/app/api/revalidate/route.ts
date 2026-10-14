import { revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';
import { getClientIp } from '@/lib/api/client-ip';
import { isRevalidateRateLimited } from '@/lib/api/rate-limit';
import { handleRevalidateRequest } from '@/lib/api/revalidate';

// POST /api/revalidate (spec R-15a): làm mới data cache nội dung DB theo tag sau khi bot/CLI sửa nội dung.
// Chỉ export POST → method khác Next trả 405. Middleware next-intl không chạy cho /api/* (matcher loại `api`).
export async function POST(request: NextRequest): Promise<Response> {
  return handleRevalidateRequest(request, {
    expectedSecret: process.env.REVALIDATE_SECRET,
    clientKey: getClientIp(request),
    isRateLimited: isRevalidateRateLimited,
    revalidateTag,
    log: console,
  });
}
