// Đăng 1 bài blog từ file seed vào DB — CHỈ chèn (CR-034). Dùng cho workflow AI news (job publish-db) qua content-cli `publish-post`.
// Đọc src/content/blog/{vi,en}/<slug>.mdx bằng parser chung của web/seed (parseMdxSource), validate CẢ HAI locale
// trước khi ghi bản đầu tiên, rồi createEntry (write-path chuẩn: version 1 + content_versions op create + actor).
// Bản ghi đã có (kể cả đã sửa / đã xoá mềm) → "exists", không bao giờ ghi đè hay khôi phục.
// CR-035: --images-dir = thư mục ảnh tin + manifest.json do tools/ai-news/generate.py sinh. Ảnh /uploads/* mà bài còn thiếu
// chưa có trong DB được kiểm (có trong manifest, không symlink, inspectImage, sha256 thật == tên file) rồi lưu bằng saveImage
// TRƯỚC khi chèn bài — dry-run coi các ảnh đó là hợp lệ cho I-7.
import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import type { Database } from "../../src/db/client";
import { ContentNotFoundError, ContentValidationError, createEntry, findNewEntryProblems, getEntryByKey } from "../../src/db/content-repo";
import { collectImagePaths } from "../../src/db/content-rules";
import { CONTENT_LOCALES, type ContentLocale } from "../../src/db/schema";
import { MDX_COLLECTION_DIRECTORIES, parseMdxSource } from "../../src/lib/content/mdx-files";
import { ImageRejectedError, MAX_UPLOAD_BYTES, UPLOAD_FILE_NAME_PATTERN, UPLOAD_URL_PREFIX, inspectImage } from "../../src/lib/uploads/image-file";
import { saveImage, type ImageAlt, type SaveImageResult } from "../../src/lib/uploads/save-image";
import { toJsonObject } from "./file-source";

export const PUBLISH_POST_ACTOR = "workflow:ai-news";

// Chặn slug lạ trước khi ghép đường dẫn file (slug đi từ input workflow/CLI).
const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Đúng chữ lỗi I-7 của content-repo (imageProblems) — ảnh nằm trong danh sách sẽ upload thì lỗi này được gỡ.
const I7_MISSING_UPLOAD = "I-7 ảnh upload không có trong DB: ";

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
  // Thư mục ảnh + manifest.json (CR-035). Không có → bài tham chiếu /uploads/* chưa có asset bị từ chối như CR-034.
  imagesDir?: string;
  // Mặc định process.env.UPLOAD_DIR (như saveImage).
  uploadDir?: string;
}

export interface PublishLocaleResult {
  locale: ContentLocale;
  key: string;
  status: PublishStatus;
  warnings: string[];
}

// missing/exists = trạng thái trước khi ghi; created/reused/restored = kết quả saveImage.
export type PublishImageStatus = "missing" | "exists" | SaveImageResult["status"];

export interface PublishImageResult {
  path: string;
  status: PublishImageStatus;
}

export interface PublishPostResult {
  posts: PublishLocaleResult[];
  images: PublishImageResult[];
  warnings: string[];
}

interface PostFile {
  locale: ContentLocale;
  data: Record<string, unknown>;
  body: string;
}

interface ManifestImage {
  alt: ImageAlt;
  sourceHost?: string;
}

interface PreparedImage extends ManifestImage {
  urlPath: string;
  bytes: Buffer;
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function manifestEntryProblem(entry: unknown): string | null {
  if (!isPlainObject(entry) || typeof entry.file !== "string") return "mục manifest phải là object có file";
  const match = UPLOAD_FILE_NAME_PATTERN.exec(entry.file);
  if (!match) return `tên file manifest không hợp lệ: ${entry.file}`;
  if (entry.sha256 !== match[1] || entry.ext !== match[2]) return `manifest ${entry.file}: sha256/ext không khớp tên file`;
  return null;
}

async function readManifestJson(imagesDir: string): Promise<unknown> {
  const manifestPath = path.join(imagesDir, "manifest.json");
  const text = await readFile(manifestPath, "utf8").catch((error: NodeJS.ErrnoException) => {
    throw new ContentValidationError([`--images-dir: không đọc được ${manifestPath} (${error.code ?? error.message})`]);
  });
  try {
    return JSON.parse(text);
  } catch {
    throw new ContentValidationError([`--images-dir: ${manifestPath} không phải JSON hợp lệ`]);
  }
}

// Manifest là danh sách ảnh DUY NHẤT được nhận (không quét thư mục — có thể còn file <sha>.<ext> của lần chạy trước).
async function readManifest(imagesDir: string, slug: string): Promise<Map<string, ManifestImage>> {
  const parsed = await readManifestJson(imagesDir);
  if (!isPlainObject(parsed) || !Array.isArray(parsed.images)) throw new ContentValidationError(["--images-dir: manifest phải là { slug, images: [] }"]);
  if (parsed.slug !== slug) throw new ContentValidationError([`--images-dir: manifest slug "${String(parsed.slug)}" khác "${slug}"`]);
  const images = new Map<string, ManifestImage>();
  const problems: string[] = [];
  for (const entry of parsed.images) {
    const problem = manifestEntryProblem(entry);
    if (problem !== null || !isPlainObject(entry)) {
      problems.push(`--images-dir: ${problem}`);
      continue;
    }
    const alt = isPlainObject(entry.alt) ? { vi: optionalString(entry.alt.vi), en: optionalString(entry.alt.en) } : {};
    images.set(String(entry.file), { alt, sourceHost: optionalString(entry.sourceHost) });
  }
  if (problems.length > 0) throw new ContentValidationError(problems);
  return images;
}

// Kiểm 1 ảnh trước mọi ghi; trả chuỗi = lý do từ chối. Tên file là sha256 nội dung → dù file bị tráo giữa lstat và
// readFile, hash check vẫn chặn mọi bytes khác bytes đã đặt tên.
async function prepareImage(imagesDir: string, urlPath: string, manifest: Map<string, ManifestImage>): Promise<PreparedImage | string> {
  const fileName = urlPath.slice(UPLOAD_URL_PREFIX.length);
  const match = UPLOAD_FILE_NAME_PATTERN.exec(fileName);
  if (!match) return `ảnh ${urlPath}: tên không phải <sha256>.<jpg|png|webp>`;
  const entry = manifest.get(fileName);
  if (!entry) return `ảnh ${urlPath}: không có trong manifest.json của --images-dir`;
  const filePath = path.join(imagesDir, fileName);
  const stats = await lstat(filePath).catch(() => undefined);
  if (!stats) return `ảnh ${urlPath}: thiếu file ${fileName} trong --images-dir`;
  if (stats.isSymbolicLink() || !stats.isFile()) return `ảnh ${urlPath}: ${fileName} không phải file thường (symlink/thư mục bị từ chối)`;
  if (stats.size > MAX_UPLOAD_BYTES) return `ảnh ${urlPath}: quá ${MAX_UPLOAD_BYTES} byte (${stats.size})`;
  const bytes = await readFile(filePath);
  try {
    const info = inspectImage(bytes);
    if (info.extension !== match[2]) return `ảnh ${urlPath}: nội dung là ${info.extension}, đuôi tên file là ${match[2]}`;
  } catch (error) {
    if (error instanceof ImageRejectedError) return `ảnh ${urlPath}: ${error.message}`;
    throw error;
  }
  if (createHash("sha256").update(bytes).digest("hex") !== match[1]) return `ảnh ${urlPath}: sha256 nội dung khác tên file`;
  return { urlPath, bytes, alt: entry.alt, sourceHost: entry.sourceHost };
}

interface LocaleProblem {
  key: string;
  problem: string;
}

// Validate các locale còn thiếu (CR-034) — giữ problem thô để gỡ đúng lỗi I-7 của ảnh sẽ upload.
async function checkLocales(db: Database, slug: string, files: PostFile[], publicDir: string | undefined) {
  const posts: PublishLocaleResult[] = [];
  const problems: LocaleProblem[] = [];
  for (const file of files) {
    const key = `post/${file.locale}/${slug}`;
    const existing = await getEntryByKey(db, { collection: "post", locale: file.locale, slug }, { includeDeleted: true });
    posts.push({ locale: file.locale, key, status: existing ? "exists" : "missing", warnings: [] });
    if (existing) continue;
    const check = { collection: "post", slug, locale: file.locale, data: file.data, body: file.body, publicDir };
    for (const problem of await findNewEntryProblems(db, check)) problems.push({ key, problem });
  }
  return { posts, problems };
}

function uploadPathsOf(files: PostFile[]): string[] {
  const paths = new Set(files.flatMap((file) => collectImagePaths({ data: file.data, body: file.body })));
  return [...paths].filter((imagePath) => imagePath.startsWith(UPLOAD_URL_PREFIX));
}

interface ImagePlan {
  images: PublishImageResult[];
  prepared: PreparedImage[];
  problems: string[];
  warnings: string[];
}

// files = cả 2 locale (để cảnh báo ảnh thừa); missingFiles = locale sẽ chèn; needUpload = ảnh I-7 báo chưa có asset sống.
async function planImages(files: PostFile[], missingFiles: PostFile[], needUpload: Set<string>, options: PublishPostOptions): Promise<ImagePlan> {
  const plan: ImagePlan = { images: [], prepared: [], problems: [], warnings: [] };
  for (const imagePath of uploadPathsOf(missingFiles)) plan.images.push({ path: imagePath, status: needUpload.has(imagePath) ? "missing" : "exists" });
  if (!options.imagesDir) {
    if (needUpload.size > 0) plan.problems.push("ảnh /uploads/* chưa có trong DB — chạy kèm --images-dir <thư mục ảnh + manifest.json>");
    return plan;
  }
  const manifest = await readManifest(options.imagesDir, options.slug);
  for (const imagePath of needUpload) {
    const prepared = await prepareImage(options.imagesDir, imagePath, manifest);
    if (typeof prepared === "string") plan.problems.push(prepared);
    else plan.prepared.push(prepared);
  }
  const referenced = new Set(uploadPathsOf(files).map((imagePath) => imagePath.slice(UPLOAD_URL_PREFIX.length)));
  for (const fileName of manifest.keys()) {
    if (!referenced.has(fileName)) plan.warnings.push(`ảnh ${fileName} có trong manifest nhưng bài không dùng — bỏ qua`);
  }
  if (plan.prepared.length > 0 && !options.dryRun && !(options.uploadDir ?? process.env.UPLOAD_DIR)) {
    plan.problems.push("UPLOAD_DIR chưa đặt — không biết lưu ảnh vào đâu");
  }
  return plan;
}

export async function publishPost(db: Database, options: PublishPostOptions): Promise<PublishPostResult> {
  const { slug } = options;
  if (!POST_SLUG_PATTERN.test(slug)) throw new ContentValidationError([`slug "${slug}" phải dạng a-z0-9 nối bằng '-'`]);
  const blogDir = options.blogDir ?? path.join(process.cwd(), "src/content", MDX_COLLECTION_DIRECTORIES.post);
  // Đọc cả hai file trước: thiếu 1 locale → lỗi ngay, không ghi locale còn lại.
  const files = await Promise.all(CONTENT_LOCALES.map((locale) => readPostFile(blogDir, locale, slug)));

  const { posts: results, problems: localeProblems } = await checkLocales(db, slug, files, options.publicDir);
  const needUpload = new Set<string>();
  for (const { problem } of localeProblems) if (problem.startsWith(I7_MISSING_UPLOAD)) needUpload.add(problem.slice(I7_MISSING_UPLOAD.length));
  const missingFiles = files.filter((_, index) => results[index].status === "missing");
  const plan = await planImages(files, missingFiles, needUpload, options);
  const resolved = new Set(plan.prepared.map((image) => `${I7_MISSING_UPLOAD}${image.urlPath}`));
  const problems: string[] = [];
  for (const { key, problem } of localeProblems) if (!resolved.has(problem)) problems.push(`${key}: ${problem}`);
  problems.push(...plan.problems);
  if (problems.length > 0) throw new ContentValidationError(problems);
  const output: PublishPostResult = { posts: results, images: plan.images, warnings: plan.warnings };
  if (options.dryRun) return output;

  // Ảnh trước, bài sau: chèn bài lỗi chỉ để lại asset mồ côi vô hại (chạy lại → reused). createEntry tự kiểm lại I-7.
  for (const image of plan.prepared) {
    const saved = await saveImage(db, { bytes: image.bytes, originalName: image.sourceHost, alt: image.alt, actor: options.actor, uploadDir: options.uploadDir });
    const result = plan.images.find((item) => item.path === image.urlPath);
    if (result) result.status = saved.status;
  }
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
  return output;
}
