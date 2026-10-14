import { serveUpload } from '@/lib/uploads/serve-upload';

// GET /uploads/<sha256>.<jpg|png|webp> (spec R-16d): ảnh upload đọc từ volume UPLOAD_DIR lúc chạy, không cần build lại.
// Middleware next-intl không chạy cho đường có dấu chấm (matcher loại `.*\..*`). next/image tối ưu qua images.localPatterns.
// Chỉ export GET → method ghi trả 405; không có API upload HTTP (ghi ảnh qua saveImage: CLI / bot CR-030).
export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path } = await context.params;
  return serveUpload(path, process.env.UPLOAD_DIR);
}
