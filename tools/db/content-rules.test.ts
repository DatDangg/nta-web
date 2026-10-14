import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { readFileSource } from "./file-source";
import { COMPANY_CONTACT } from "../../src/lib/contact/company-info";
import {
  REQUIRED_FIELDS,
  SHOWCASE_ICONS,
  checkRecord,
  collectImagePaths,
  registryProblem,
  type ContentRecord,
} from "../../src/db/content-rules";

const post: ContentRecord = {
  collection: "post",
  slug: "bai-moi",
  locale: "vi",
  data: { slug: "bai-moi", title: "T", date: "2026-10-14", category: "ai-tech", excerpt: "E", cover: "/images/blog/ai-weekly-cover.svg" },
  body: "Nội dung",
  sortOrder: null,
};

test("toàn bộ nội dung file hiện tại qua quy tắc từng bản ghi + ảnh tồn tại (không báo nhầm)", async () => {
  const records = await readFileSource();
  for (const record of records) assert.deepEqual(checkRecord(record), [], `${record.collection}/${record.locale}/${record.slug}`);
  const missing = [...new Set(records.flatMap(collectImagePaths))].filter((image) => !existsSync(path.join("public", image)));
  assert.deepEqual(missing, []);
});

test("loader web lấy required fields từ REQUIRED_FIELDS (không hardcode danh sách riêng)", () => {
  const loaders: Record<string, string> = {
    post: "posts.ts",
    solution: "solutions.ts",
    product: "products.ts",
    case_study: "case-studies.ts",
    about: "about.ts",
  };
  for (const [collection, file] of Object.entries(loaders)) {
    const source = readFileSync(path.join("src/lib/content", file), "utf8");
    // Loader lấy danh sách qua assertCollectionFields(record, '<collection>', …) → REQUIRED_FIELDS là nguồn duy nhất.
    assert.ok(REQUIRED_FIELDS[collection as keyof typeof REQUIRED_FIELDS], collection);
    assert.match(source, new RegExp(`assertCollectionFields\\(\\w+,\\s*'${collection}'`), file);
    assert.doesNotMatch(source, /assertRequiredFields\(/, file);
  }
});

test("bản ghi hợp lệ → không lỗi", () => {
  assert.deepEqual(checkRecord(post), []);
});

test("thiếu field bắt buộc (kể cả body MDX) → lỗi", () => {
  const { title: _title, ...withoutTitle } = post.data;
  assert.match(checkRecord({ ...post, data: withoutTitle }).join(), /missing title/);
  assert.match(checkRecord({ ...post, body: null }).join(), /missing body/);
});

test("I-2: frontmatter slug khác khoá / slug sai định dạng → lỗi", () => {
  assert.match(checkRecord({ ...post, data: { ...post.data, slug: "khac" } }).join(), /I-2 frontmatter slug/);
  assert.match(checkRecord({ ...post, slug: "Bai Moi", data: { ...post.data, slug: "Bai Moi" } }).join(), /I-2 slug/);
});

test("I-6: collection/locale/category/icon ngoài danh sách → lỗi", () => {
  assert.deepEqual(checkRecord({ ...post, collection: "khac" }), ["I-6 collection ngoài whitelist"]);
  assert.match(checkRecord({ ...post, locale: "fr" }).join(), /I-6 locale/);
  assert.match(checkRecord({ ...post, data: { ...post.data, category: "x" } }).join(), /I-6 category blog/);
  const showcase = { stats: [{ icon: "rocket" }], pillars: [{ icon: SHOWCASE_ICONS[0] }], technology: { nodes: ["a", { label: "b", icon: "zzz" }] } };
  const problems = checkRecord({ ...post, collection: "about", slug: "about", data: { mission: 1, milestones: [], partners: [], showcase } });
  assert.deepEqual(problems, ["I-6 icon showcase không hợp lệ: rocket", "I-6 icon nút công nghệ không hợp lệ: zzz"]);
  assert.match(checkRecord({ ...post, collection: "slug_registry", slug: "x", data: { group: "y" } }).join(), /I-6 nhóm slug_registry/);
});

test("I-3/I-4: solution/product so với nhóm registry", () => {
  const solution = { collection: "solution", data: { category: "ai" } };
  assert.match(String(registryProblem(solution, undefined)), /I-3/);
  assert.match(String(registryProblem(solution, "enterprise")), /I-4/);
  assert.equal(registryProblem(solution, "ai"), null);
  assert.match(String(registryProblem({ collection: "product", data: {} }, "ai")), /I-3/);
  assert.equal(registryProblem({ collection: "post", data: {} }, undefined), null);
});

test("I-7: trích đường dẫn ảnh nội bộ trong data + body, bỏ URL ngoài", () => {
  const paths = collectImagePaths({
    data: { cover: "/images/a.jpg", gallery: [{ src: "/uploads/2026/b.webp" }], link: "https://cdn.example.com/c.png", href: "/blog" },
    body: '![x](/images/d.png) và <img src="/images/e.svg" />',
  });
  assert.deepEqual(paths, ["/images/a.jpg", "/uploads/2026/b.webp", "/images/d.png", "/images/e.svg"]);
});

test("I-6 company_info: URL phải đúng scheme (tel/mailto/https) + bản đồ nhúng chỉ Google Maps", () => {
  const record = (data: unknown): ContentRecord => ({ collection: "company_info", slug: "contact", locale: "vi", data: data as Record<string, unknown>, body: null, sortOrder: null });
  const contact = structuredClone(COMPANY_CONTACT);
  assert.deepEqual(checkRecord(record(contact)), []);
  const bad = {
    ...contact,
    phone: { ...contact.phone, href: "javascript:alert(1)" },
    email: { ...contact.email, href: "https://evil.example" },
    map: { embedUrl: "https://evil.example/maps?q=x", openUrl: "http://www.google.com/maps" },
  };
  assert.deepEqual(checkRecord(record(bad)), [
    "I-6 company_info phone.href phải bắt đầu bằng tel:",
    "I-6 company_info email.href phải bắt đầu bằng mailto:",
    "I-6 company_info map.embedUrl phải là https Google Maps (maps.google.com|www.google.com/maps)",
    "I-6 company_info map.openUrl phải là https Google Maps (maps.google.com|www.google.com/maps)",
  ]);
  assert.match(checkRecord(record({ ...contact, map: { ...contact.map, embedUrl: "http://maps.google.com/maps?q=x" } })).join(), /map\.embedUrl/);
  assert.match(checkRecord(record({ ...contact, map: undefined })).join(), /map\.embedUrl.*map\.openUrl/);
});
