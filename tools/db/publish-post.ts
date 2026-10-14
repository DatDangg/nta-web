// Đăng 1 bài blog từ file seed vào DB — CHỈ chèn (CR-034). Dùng cho workflow AI news (job publish-db) qua content-cli `publish-post`.
// Đọc src/content/blog/{vi,en}/<slug>.mdx bằng parser chung của web/seed (parseMdxSource), validate CẢ HAI locale
// trước khi ghi bản đầu tiên, rồi createEntry (write-path chuẩn: version 1 + content_versions op create + actor).
// Bản ghi đã có (kể cả đã sửa / đã xoá mềm) → "exists", không bao giờ ghi đè hay khôi phục.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Database } from "../../src/db/client";
import { ContentNotFoundError, ContentValidationError, createEntry, findNewEntryProblems, getEntryByKey } from "../../src/db/content-repo";
import { CONTENT_LOCALES, type ContentLocale } from "../../src/db/schema";
import { MDX_COLLECTION_DIRECTORIES, parseMdxSource } from "../../src/lib/content/mdx-files";
import { toJsonObject } from "./file-source";

export const PUBLISH_POST_ACTOR = "workflow:ai-news";

// Chặn slug lạ trước khi ghép đường dẫn file (slug đi từ input workflow/CLI).
const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type PublishStatus = "missing" | "exists" | "created";

export interface PublishPostOptions {
  slug: string;
  // true = chỉ báo missing/exists (+ validate bản missing), không ghi — workflow dùng để quyết định có backup không.
  dryRun: boolean;
  actor: string;
  note: string;
  // Mặc định <cwd>/src/content/blog và <cwd>/public (test truyền thư mục tạm).
  blogDir?: string;
  publicDir?: string;
}

export interface PublishLocaleResult {
  locale: ContentLocale;
  key: string;
  status: PublishStatus;
  warnings: string[];
}

interface PostFile {
  locale: ContentLocale;
  data: Record<string, unknown>;
  body: string;
}

export function defaultPublishNote(slug: string, runId: string | undefined): string {
  return runId ? `ai-news ${slug} run ${runId}` : `ai-news ${slug}`;
}

async function readPostFile(blogDir: string, locale: ContentLocale, slug: string): Promise<PostFile> {
  const filePath = path.join(blogDir, locale, `${slug}.mdx`);
  const source = await readFile(filePath, "utf8").catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") throw new ContentNotFoundError(`file ${filePath}`);
    throw error;
  });
  const { frontmatter, body } = parseMdxSource(source);
  return { locale, data: toJsonObject(frontmatter, filePath), body };
}

export async function publishPost(db: Database, options: PublishPostOptions): Promise<PublishLocaleResult[]> {
  const { slug } = options;
  if (!POST_SLUG_PATTERN.test(slug)) throw new ContentValidationError([`slug "${slug}" phải dạng a-z0-9 nối bằng '-'`]);
  const blogDir = options.blogDir ?? path.join(process.cwd(), "src/content", MDX_COLLECTION_DIRECTORIES.post);
  // Đọc cả hai file trước: thiếu 1 locale → lỗi ngay, không ghi locale còn lại.
  const files = await Promise.all(CONTENT_LOCALES.map((locale) => readPostFile(blogDir, locale, slug)));

  const results: PublishLocaleResult[] = [];
  const problems: string[] = [];
  for (const file of files) {
    const key = `post/${file.locale}/${slug}`;
    const existing = await getEntryByKey(db, { collection: "post", locale: file.locale, slug }, { includeDeleted: true });
    results.push({ locale: file.locale, key, status: existing ? "exists" : "missing", warnings: [] });
    if (existing) continue;
    const check = { collection: "post", slug, locale: file.locale, data: file.data, body: file.body, publicDir: options.publicDir };
    for (const problem of await findNewEntryProblems(db, check)) problems.push(`${key}: ${problem}`);
  }
  if (problems.length > 0) throw new ContentValidationError(problems);
  if (options.dryRun) return results;

  // results[i] tương ứng files[i] (cùng thứ tự CONTENT_LOCALES).
  for (const [index, result] of results.entries()) {
    if (result.status !== "missing") continue;
    const file = files[index];
    const created = await createEntry(db, {
      collection: "post",
      slug,
      locale: file.locale,
      data: file.data,
      body: file.body,
      actor: options.actor,
      note: options.note,
      publicDir: options.publicDir,
    });
    result.status = "created";
    // I-1 (thiếu bản ngôn ngữ kia) luôn bật ở locale chèn trước — sai sau khi cả cặp đã chèn xong trong cùng lệnh này.
    result.warnings = created.warnings.filter((warning) => !warning.startsWith("I-1 "));
  }
  return results;
}
