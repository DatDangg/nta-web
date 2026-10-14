// Quy tắc nội dung dùng CHUNG cho write-path (src/db/content-repo.ts) và parity (tools/db/parity-check.ts):
// whitelist collection/locale, required fields theo collection, I-2 slug, I-3/I-4 registry, I-6 enum, I-7 trích đường dẫn ảnh.
// Thuần (không I/O) — phần cần DB/đĩa do người gọi cung cấp. Ràng buộc: docs/content-bot/08-data-model.md §4.
import type { ShowcaseIcon, ShowcaseNodeIcon } from "../content/types";
import { BLOG_CATEGORIES } from "../lib/blog/categories";
import { assertRequiredFields } from "../lib/content/mdx-files";
import { CONTENT_LOCALES, isContentCollection, type ContentCollection } from "./schema";

export interface ContentRecord {
  collection: string;
  slug: string;
  locale: string;
  data: Record<string, unknown>;
  body: string | null;
  sortOrder: number | null;
}

// Nguồn DUY NHẤT của required fields: loader web (src/lib/content/{posts,solutions,products,case-studies,about}.ts)
// đọc danh sách này qua assertCollectionFields (load-mdx.ts) — content-rules.test.ts bắt loader nào hardcode lại danh sách.
export const REQUIRED_FIELDS: Partial<Record<ContentCollection, readonly string[]>> = {
  post: ["slug", "title", "date", "category", "excerpt", "cover", "body"],
  solution: ["slug", "title", "description", "features", "benefits", "category", "showcase"],
  product: ["slug", "title", "description", "screenshots", "showcase"],
  case_study: ["slug", "title", "category", "year", "challenge", "solution", "result", "gallery", "related"],
  about: ["mission", "milestones", "partners"],
};

// Khoá (slug) cố định của bản ghi singleton dạng object — dùng chung web (registry.ts) và seed (tools/db/file-source.ts).
export const HOME_SLUG = "home";
export const LISTING_LABELS_SLUG = "labels";

// Collection có URL công khai theo slug (`/blog/[slug]`, `/solutions/...`, `/products/[slug]`, `/case-studies/[slug]`):
// I-2 (frontmatter slug = khoá) và I-8 (xoá → cần redirect 301).
export const PUBLIC_URL_COLLECTIONS = ["post", "solution", "product", "case_study"] as const;

export function isPublicUrlCollection(collection: string): boolean {
  return (PUBLIC_URL_COLLECTIONS as readonly string[]).includes(collection);
}

export const SLUG_REGISTRY_GROUPS = ["enterprise", "ai", "product"] as const;
export const SOLUTION_CATEGORIES = ["enterprise", "ai"] as const;
export const CASE_STUDY_CATEGORIES = ["enterprise", "ai", "app-ai"] as const;

// Record<Union, true> buộc liệt kê đủ và không thừa so với type TS → danh sách runtime không lệch type.
const SHOWCASE_ICON_SET: Record<ShowcaseIcon, true> = {
  area: true, camera: true, calendar: true, challenge: true, solution: true, result: true, modules: true,
};
const SHOWCASE_NODE_ICON_SET: Record<ShowcaseNodeIcon, true> = {
  camera: true, drone: true, vms: true, calendar: true, records: true, inventory: true, photo: true, ai: true, music: true, share: true,
};
export const SHOWCASE_ICONS = Object.keys(SHOWCASE_ICON_SET) as ShowcaseIcon[];
export const SHOWCASE_NODE_ICONS = Object.keys(SHOWCASE_NODE_ICON_SET) as ShowcaseNodeIcon[];

const URL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isOneOf(values: readonly string[], value: unknown): boolean {
  return typeof value === "string" && values.includes(value);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function requiredFieldProblem(record: ContentRecord, collection: ContentCollection): string | null {
  const fields = REQUIRED_FIELDS[collection];
  if (!fields) return null;
  try {
    // `body` của MDX nằm ở cột body, loader gộp nó vào record → gộp y như vậy trước khi kiểm.
    const merged: Record<string, unknown> = { ...record.data, body: record.body ?? undefined };
    assertRequiredFields(merged, [...fields], `${collection}/${record.locale}/${record.slug}`);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

function showcaseIconProblems(showcase: Record<string, unknown> | undefined): string[] {
  if (!showcase) return [];
  const icons = [
    ...asArray(showcase.stats).map((item) => asRecord(item)?.icon),
    ...asArray(showcase.pillars).map((item) => asRecord(item)?.icon),
    ...asArray(asRecord(showcase.features)?.items).map((item) => asRecord(item)?.icon).filter((icon) => icon !== undefined),
  ];
  const nodeIcons = asArray(asRecord(showcase.technology)?.nodes)
    .map((node) => asRecord(node)?.icon)
    .filter((icon) => icon !== undefined);
  return [
    ...icons.filter((icon) => !isOneOf(SHOWCASE_ICONS, icon)).map((icon) => `I-6 icon showcase không hợp lệ: ${String(icon)}`),
    ...nodeIcons.filter((icon) => !isOneOf(SHOWCASE_NODE_ICONS, icon)).map((icon) => `I-6 icon nút công nghệ không hợp lệ: ${String(icon)}`),
  ];
}

function enumProblems(record: ContentRecord): string[] {
  const { collection, data } = record;
  const problems: string[] = [];
  if (collection === "post" && !isOneOf(BLOG_CATEGORIES, data.category)) {
    problems.push(`I-6 category blog không hợp lệ: ${String(data.category)}`);
  }
  if (collection === "solution" && !isOneOf(SOLUTION_CATEGORIES, data.category)) {
    problems.push(`I-6 category giải pháp không hợp lệ: ${String(data.category)}`);
  }
  if (collection === "case_study" && !isOneOf(CASE_STUDY_CATEGORIES, data.category)) {
    problems.push(`I-6 category case study không hợp lệ: ${String(data.category)}`);
  }
  if (collection === "slug_registry" && !isOneOf(SLUG_REGISTRY_GROUPS, data.group)) {
    problems.push(`I-6 nhóm slug_registry không hợp lệ: ${String(data.group)}`);
  }
  return [...problems, ...showcaseIconProblems(asRecord(data.showcase))];
}

// Kiểm 1 bản ghi độc lập (không cần bản ghi khác): whitelist, locale, slug, required fields, I-2, I-6.
export function checkRecord(record: ContentRecord): string[] {
  if (!isContentCollection(record.collection)) return ["I-6 collection ngoài whitelist"];
  const problems: string[] = [];
  if (!(CONTENT_LOCALES as readonly string[]).includes(record.locale)) problems.push("I-6 locale không hợp lệ");
  if (record.slug.trim() === "") problems.push("slug rỗng");
  if (isPublicUrlCollection(record.collection)) {
    if (!URL_SLUG_PATTERN.test(record.slug)) problems.push(`I-2 slug "${record.slug}" phải dạng a-z0-9 nối bằng '-'`);
    if (record.data.slug !== record.slug) {
      problems.push(`I-2 frontmatter slug "${String(record.data.slug)}" ≠ khoá "${record.slug}"`);
    }
  }
  const required = requiredFieldProblem(record, record.collection);
  if (required) problems.push(required);
  return [...problems, ...enumProblems(record)];
}

// I-3/I-4: solution/product phải có trong slug_registry cùng locale, đúng nhóm. `registryGroup` = data.group của
// hàng registry còn sống (undefined = không có).
export function registryProblem(record: Pick<ContentRecord, "collection" | "data">, registryGroup: unknown): string | null {
  if (record.collection !== "solution" && record.collection !== "product") return null;
  if (registryGroup === undefined) return "I-3 slug không có trong slug_registry";
  if (record.collection === "product" && registryGroup !== "product") {
    return `I-3 sản phẩm nằm ở nhóm registry "${String(registryGroup)}"`;
  }
  if (record.collection === "solution" && registryGroup !== record.data.category) {
    return `I-4 category "${String(record.data.category)}" ≠ nhóm registry "${String(registryGroup)}"`;
  }
  return null;
}

// Chiều ngược I-3: hàng registry nhóm `group` phải có bản ghi nội dung tương ứng (thiếu → URL trong menu 404).
export function registryTargetCollection(group: unknown): "solution" | "product" | null {
  if (group === "product") return "product";
  if (group === "enterprise" || group === "ai") return "solution";
  return null;
}

const IMAGE_PATH_PATTERN = /(?:^|(?<=["'(\s=]))(\/[^\s"'()<>?#]+\.(?:png|jpe?g|webp|gif|svg|avif))(?=$|["')\s>])/gi;

function collectStrings(value: unknown, into: string[]): void {
  if (typeof value === "string") into.push(value);
  else if (Array.isArray(value)) for (const item of value) collectStrings(item, into);
  else if (value !== null && typeof value === "object") for (const item of Object.values(value)) collectStrings(item, into);
}

// I-7: đường dẫn ảnh nội bộ ("/images/...", "/uploads/...") trong data + body. URL ngoài (https://...) không kiểm.
export function collectImagePaths(record: Pick<ContentRecord, "data" | "body">): string[] {
  const strings: string[] = [];
  collectStrings(record.data, strings);
  if (record.body) strings.push(record.body);
  const paths = new Set<string>();
  for (const text of strings) {
    for (const match of text.matchAll(IMAGE_PATH_PATTERN)) paths.add(match[1]);
  }
  return [...paths];
}
