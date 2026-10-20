# Design Specification — NTA Website

> Design notes cho website NTA. Agent extract design tokens + screen specs từ file này.
> ⚠️ Chưa có Figma/brand chính thức — bảng dưới là **đề xuất tạm (light minimal kiểu Apple)**, sẽ cập nhật khi có brand kit.
> ✅ Đã chốt (08/10/2026): phong cách **simple nhưng ấn tượng kiểu Apple** — sáng, nhiều whitespace, typography lớn, animation subtle.

---

## Design References

**Figma Link:** _(chưa có — cập nhật sau)_
**Design Tool:** Figma (dự kiến)

**Reference Images:**
- _(chưa có — anh gửi screenshot tham chiếu nếu muốn hướng khác)_

---

## Brand & Visual Identity

### Color Palette (NTA teal — light minimal)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#009E87` | CTA, link, accent (NTA teal) |
| Primary Hover | `#007C6B` | Hover CTA/link (đậm hơn) |
| Primary Active | `#00695A` | Pressed/active |
| Primary Light | `#E6F8F3` | Tint nền nhạt (badge/section nhấn) |
| Accent | `#21D9AD` | Accent sáng — nổi bật trên nền tối (`accent-ink`) |
| Background | `#FFFFFF` | Nền trang (trắng) |
| Background Alt | `#F5F5F7` | Section xen kẽ (xám nhạt) |
| Surface | `#FFFFFF` | Card, panel |
| Text Primary | `#111827` | Heading, body (`--foreground`) |
| Text Secondary | `#6E6E73` | Label, caption (xám) |
| Border | `#D2D2D7` | Divider, viền input |
| Error | `#FF3B30` | Trạng thái lỗi |
| Success | `#34C759` | Trạng thái thành công |
| Warning | `#FF9500` | Cảnh báo |

> Gradient chủ đạo (nếu dùng): `linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)` — rất nhẹ, không lòe loẹt.

### Typography

| Token | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| Heading 1 | Inter / system | 48–64px (clamp) | 700 | Hero title |
| Heading 2 | Inter | 32–40px | 700 | Section title |
| Heading 3 | Inter | 22–24px | 600 | Card title |
| Body | Inter | 16–18px | 400 | Nội dung |
| Small | Inter | 14px | 400 | Label, caption |
| XSmall | Inter | 12px | 400 | Meta, hint |

Font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` (SF Pro trước cho vibe Apple, Inter fallback hỗ trợ tiếng Việt).

### Spacing Scale

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |
| 4xl | 96px |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 4px | Input, tag |
| md | 8px | Card |
| lg | 16px | Section card, modal |
| full | 9999px | Pill, avatar, badge |

---

## Screen Inventory

### Screen: Trang chủ
- **Route:** `/`
- **Layout:** Full width; hero → 3 mảng → sản phẩm → case study → CTA
- **Components:** Header sticky, Hero (title + subtitle + 2 CTA), SolutionCards ×3, ProductGrid, CaseStudyHighlight, CTABanner, Footer
- **States:** Default, Loading (nếu fetch), Error
- **Notes:** Hiệu ứng subtle (fade/slide-in) khi scroll; ảnh hero tối ưu.
- **Khung chung (as-built, R-01b, CR-040):** mọi section trang chủ (header, giải pháp, sản phẩm tiêu biểu, case study, CTA, footer) dùng `Container` 1280 (`src/components/ui/Container.tsx`) → mép trái/phải nội dung thẳng một đường ở mọi viewport; không còn khung riêng 1400px (giải pháp) hay 1040px (sản phẩm). Link logo header bù `-ml-2` để chữ logo thẳng mép nội dung.
- **Hero desktop (as-built, R-01b, CR-043):** lg+ ảnh `hero-bg.webp` (1916×821) phủ full-bleed (`HeroBackground`, wrapper `container-type:size`): khung `aspect-[1916/821]` rộng `min(max(100cqw, 100cqh×1916/821), 2048px)`, neo phải (> 2048 căn giữa; khi khung rộng hơn viewport — < ~1545 — lùi sang phải tối đa 56px trong phần ảnh thừa để panel không chồng cột chữ ở 1024–1100), neo dọc 35%; > 2048 ảnh mask hai cạnh (`transparent → black 12% … 88% → transparent`) sang nền trắng. Panel kính + wordmark trong hộp panel `left 17% / top 7% / 69.9% × 80.4%` của khung (cỡ chữ `cqw` theo hộp). Lớp phủ chữ `white/0.85 → 0.72 (30%) → 0.35 (45%) → 0 (58%)` để thấy thành phố/cây phía sau. Section cao `clamp(540px,46vw,662px)`, h1 max `4.46rem`. `sizes` khớp bề rộng khung thật. Hero < lg (`HeroMobileImage`) dùng cùng ảnh, `object-[75%_50%]` crop vào robot.

### Screen: Về NTA
- **Route:** `/about`
- **Layout:** Full width, các section xếp dọc
- **Components:** AboutHero, AboutValues, AboutPeople, MilestoneTimeline, PartnerLogos, CTABanner _(cập nhật CR-014/CR-020: PageHeader, MissionBlock, CapabilityGrid, TeamGrid đã bỏ)_
- **States:** Default
- **Notes:** Timeline milestones theo mốc năm; logo đối tác dạng grayscale → màu khi hover.

### Screen: Giải pháp Doanh nghiệp (tổng quan)
- **Route:** `/solutions/enterprise`
- **Components:** PageHeader, SolutionIntro, SolutionGrid (CRM/HRM/LMS/DentGo), CTABanner

### Screen: Chi tiết giải pháp doanh nghiệp
- **Route:** `/solutions/enterprise/[slug]` (`crm` | `hrm` | `lms` | `dentgo`)
- **Components:** PageHeader, FeatureList, BenefitList, SolutionSections, UseCases, FaqList, ScreenshotSection, RelatedSolutions, CTAForm
- **States:** Default, 404 (slug sai)
- **Notes:** SolutionSections/UseCases/FaqList chỉ render khi giải pháp bật cờ opt-in `renderExtendedContent: true` (hiện bật cho HRM/CRM/LMS/DentGo); ScreenshotSection ẩn khi không có `screenshots`.

### Screen: Giải pháp AI (tổng quan)
- **Route:** `/solutions/ai`
- **Components:** PageHeader, SolutionIntro, SolutionGrid (BoxAI / Flycam / AI tùy chỉnh), CaseStudyTeaser, CTABanner

### Screen: Chi tiết giải pháp AI
- **Route:** `/solutions/ai/[slug]` (`boxai` | `flycam` | `custom-ai`)
- **Components:** PageHeader, FeatureList, BenefitList, SolutionSections, SolutionHighlights, UseCases, FaqList, ScreenshotSection, CaseStudyLink, CTAForm
- **Content data (MDX VI/EN):** `sections` / `highlights` / `faq` optional fields render bởi SolutionSections/SolutionHighlights/FaqList (rỗng → ẩn). Nội dung 3 trang: Talvra (custom-ai), BoxAI (định tính), Flycam — theo spec delta R-06a..e.

### Screen: Sản phẩm App
- **Route:** `/products`
- **Components:** PageHeader, AppCard (Music app, Hair-style AI), ScreenshotCarousel, DownloadLinks, CTABanner

### Screen: Case Study (danh sách)
- **Route:** `/case-studies`
- **Components:** PageHeader, FilterBar (theo mảng), CaseStudyGrid, Pagination

### Screen: Case Study (chi tiết)
- **Route:** `/case-studies/[slug]`
- **Components:** PageHeader, MetaBar (khách hàng, lĩnh vực, năm), ChallengeBlock, SolutionBlock, ResultBlock (số liệu), ImageGallery, RelatedStudies, CTA
- **Content data:** `heritage-site-ai-camera` = dự án AI camera + flycam cho một khu di tích ở Việt Nam, không nêu địa danh (category `ai`; slug cũ `oc-eo-learning` → 301 trong `next.config.ts`, CR-025) — viết theo nhánh **phương án đề xuất** (kết quả kỳ vọng/dự toán, BR-004). Featured case ở `src/content/home.ts` cùng context (R-08a).

### Screen: Tin tức / Blog
- **Route:** `/blog` + `/blog/[slug]`
- **Components:** list: ListingHero + BlogNewsVisual, BlogListing (chip danh mục + tìm kiếm qua URL), FeaturedPosts, BlogPostCard, Pagination (R-09a, 2026-10-13); detail: ArticleHeader, ArticleBody, ShareBar, RelatedPosts (PostCard)

### Screen: Liên hệ
- **Route:** `/contact`
- **Components:** PageHeader, ContactForm (tên, email, SĐT, nội dung)
- **States:** Default, Validating, Submitting, Success, Error

### Screen: 404
- **Route:** `*`
- **Components:** NotFoundMessage, HomeLink, SearchHint

---

## Component Library

| Component | Variants | Notes |
|-----------|----------|-------|
| Button | Primary, Secondary, Ghost, Outline | Sizes: sm/md/lg; light theme, bo tròn nhẹ, không shadow nặng |
| Input / Textarea | Default, Focus, Error, Disabled | Có label + helper/error text |
| Card | SolutionCard, ProductCard, CaseStudyCard, PostCard | Hover lift nhẹ |
| Section | Default, Alternate (surface), Accent | Padding responsive |
| Modal | Small, Medium | Dùng cho chi tiết nhanh nếu cần |
| Badge | Info, Success, Warning, Error | Tag lĩnh vực/danh mục |
| Timeline | Milestones | Cho trang Về NTA |
| Nav | Desktop, Mobile (hamburger + drawer) | Sticky, active state |
| Breadcrumb | Default | Cho trang con |

---

## Design Style

- **Overall feel:** Apple-like — clean, minimal, sang trọng, tin cậy
- **Color scheme:** Light (trắng + xám trung tính); contrast cao cho doanh nghiệp nhà nước lẫn tư nhân
- **UI Library:** Tailwind CSS (cân nhắc shadcn/ui cho form/nav)
- **Animation level:** Subtle — fade/slide-in nhẹ khi scroll, hover mượt, không heavy motion, không confetti/effect rườm rà
- **Signature Apple-style elements:** heading to đậm (48-96px hero), nội dung trung tâm, section xen kẽ trắng/#F5F5F7, card tròn (border-radius lg), ảnh lớn, ít đường kẻ

---

## Responsive Breakpoints (Mobile-First)

> **MANDATORY:** Đọc `skills/responsive-web/SKILL.md` + `skills/responsive-web/responsive.md` trước khi thiết kế responsive.

| Breakpoint | Width | Tailwind | Target |
|------------|-------|----------|--------|
| Base (Mobile) | < 640px | (default) | Phone — viết styles mặc định trước |
| sm | ≥ 640px | `sm:` | Large phones, small tablets |
| md | ≥ 768px | `md:` | Tablets |
| lg | ≥ 1024px | `lg:` | Laptops |
| xl | ≥ 1280px | `xl:` | Desktops |
| 2xl | ≥ 1536px | `2xl:` | Large screens |

**Nguyên tắc:**
- **Mobile-first**: viết base styles cho mobile → `min-width` để enhance.
- **Content-based breakpoints**.
- **Ưu tiên fluid** (`clamp()`, `rem`, `%`, `fr`, `vw`) hơn fixed `px`.
- **Container queries** cho component-level responsive.

## Responsive Behavior (BẮT BUỘC cho mỗi screen)

### Screen: Trang chủ
- **Mobile (< 640px):** nav hamburger, hero stack dọc (title → subtitle → CTA full-width), 3 solution card xếp 1 cột, product grid 1–2 cột.
- **Tablet (≥ 768px):** hero 2 cột (text | ảnh), solution card 2–3 cột, product grid 2 cột.
- **Desktop (≥ 1024px):** nav ngang đầy đủ, hero 2 cột rộng, solution 3 cột, product 3–4 cột.
- **Large (≥ 1280px):** max-width container ~1280px, spacing 4xl, hero ảnh lớn hơn.

### Screen: Về NTA
- **Mobile:** mọi block 1 cột; timeline dọc; team 1–2 cột.
- **Tablet:** capability grid 2 cột; team 2–3 cột.
- **Desktop:** capability 3 cột; timeline ngang; partner logos 4–6/cột.
- **Large:** container max-width, spacing rộng.

### Screen: Chi tiết giải pháp ([slug])
- **Mobile:** 1 cột; ảnh full-width; CTA cuối sticky-bottom tuỳ chọn.
- **Tablet:** 2 cột (nội dung | ảnh minh hoạ).
- **Desktop:** 2 cột rộng + sidebar "giải pháp liên quan".
- **Large:** nội dung giới hạn ~720px cho dễ đọc.

### Screen: Case Study (chi tiết)
- **Mobile:** 1 cột; meta bar stack dọc; gallery 1 cột.
- **Tablet:** meta bar ngang; gallery 2 cột.
- **Desktop:** 2 cột (nội dung | gallery); related 3 cột.
- **Large:** container rộng, gallery 3 cột.

### Screen: Blog (list + detail)
- **Mobile:** list 1 cột; detail 1 cột, chữ 16–18px.
- **Tablet:** list 2 cột; detail ~680px.
- **Desktop:** khối nổi bật 3 cột (lớn · 2 nhỏ · thẻ TIN MỚI) + lưới 3 cột (lg) / 4 cột (xl); detail ~720px.
- **Large:** lưới 4 cột.

### Screen: Liên hệ
- **Mobile:** consultation form in a single column.
- **Tablet:** consultation form remains centered in a single column.
- **Desktop:** consultation form remains centered with a readable maximum width.
- **Large:** container max-width, spacing rộng.

### Screen: Header / Footer
- **Mobile:** header hamburger + drawer; footer 1 cột (accordion nhóm link tuỳ chọn).
- **Tablet:** footer 2 cột.
- **Desktop:** header nav ngang; footer 4 cột.
- **Large:** footer 4–5 cột, container max-width.

---

## Kiến trúc nội dung & render (current-state — CR-031, cập nhật 14/10/2026)

> As-built, kèm pointer code. Quyết định + số đo: `.context/decisions.md` (CR-031 P1-T01 … P3-T05). Schema: `docs/ERD.md`. API: `docs/API_SPEC.md`.

### Nguồn nội dung
- **Prod đọc PostgreSQL từ 14/10/2026 16:38 UTC** (cutover P4-T01 — `docs/runbook/cutover-content-db.md`, bằng chứng `tasks/feature-content-database/phase-4-task-01.md` B1–B9).
- Cờ server-only `CONTENT_SOURCE=file|db` (`src/lib/content/source.ts`): đọc env **lúc request**; chưa đặt/rỗng → `file`; giá trị khác → ném lỗi (không fallback âm thầm).
  Prod lấy từ GitHub **Variable** `CONTENT_SOURCE` (hiện = `db`) qua `.github/workflows/deploy.yml` (bước *Validate CONTENT_SOURCE*) → `docker-compose.yml` (`CONTENT_SOURCE: ${CONTENT_SOURCE:-file}`).
  Đổi cờ = đổi variable + chạy lại Deploy, không build lại. Bỏ cờ + đường đọc file: `tasks/feature-content-database/phase-5-task-02.md` (chưa làm).
- `file` = đọc `src/content/*` + hằng TS như trước CR-031 (giữ làm đường lùi); `db` = bảng `content_entries` (bản ghi còn sống).
- `src/content` là **seed import ban đầu** (`src/content/README.md`), sửa file không đổi website khi cờ = `db`.
- Ngoại lệ có chủ đích: bản tin AI tuần (CR-019/CR-034) vẫn commit file `src/content/blog/{vi,en}/ai-weekly-*.mdx` **và** chèn vào DB (insert-only, `content-cli publish-post`) — xem § Vận hành.

### Luồng đọc DB
1. Loader MDX `src/lib/content/load-mdx.ts` (post/solution/product/case_study/about), registry `src/lib/content/registry.ts`
   (`getRegistrySlugs`, `getListing*`, `getHomeContent`, `getSolutionOverview`, `getDetailTiles`), chữ giao diện `src/i18n/request.ts`,
   thông tin công ty `src/lib/contact/company-contact.ts` — tất cả chọn nguồn theo cờ.
2. Chế độ `db` gọi `src/lib/content/store.ts` (server-only): `getEntries(collection, locale)` / `getEntry(collection, slug, locale)` bọc `unstable_cache`
   (data cache Next), query thuần ở `src/db/content-read.ts` (lọc `deleted_at IS NULL`, sắp `sort_order` rồi slug).
3. Dữ liệu đi qua **cùng** hàm validate/map/sort như chế độ file (required fields từ `REQUIRED_FIELDS` — `src/db/content-rules.ts`).
4. DB lỗi → store **ném** `[content-store] Không đọc được nội dung …` (không trả rỗng): data cache không lưu kết quả lỗi → trang đã cache vẫn 200,
   trang chưa cache 500, DB lên lại tự phục hồi (R-16).

### Cache tag + revalidate
- Tag (`src/lib/content/cache-tags.ts`): `content` (toàn bộ) · `content:<collection>` (mọi bản ghi + danh sách) · `content:<collection>:<slug>` (1 bản ghi).
  Danh sách chỉ mang tag collection → sửa 1 bản ghi phải revalidate cả tag collection.
- `POST /api/revalidate` (`src/app/api/revalidate/route.ts` → `src/lib/api/revalidate.ts`) gọi `revalidateTag`; bot/CLI gọi sau khi ghi DB
  (`npm run db:cli -- revalidate …`, workflow Content ops `revalidate-all`). Contract: `docs/API_SPEC.md`.

### Chiến lược render (P3-T02, hướng C)
- `next build` **không prerender trang nội dung nào** → build image không cần DB ở cả 2 chế độ cờ: `generateStaticParams` trả `[]` ở
  `src/app/[locale]/layout.tsx` và mọi route `[slug]`; `src/app/sitemap.ts` `dynamic = 'force-dynamic'`. Build chỉ prerender `/_not-found`, icon, `robots.txt`.
- `/en/...` = ISR on-demand: render lần đầu rồi full route cache (`x-nextjs-cache: HIT`).
- Tiếng Việt (không tiền tố) render **mỗi request** trên data cache có tag (cache hit không truy vấn DB; TTFB local ~34–35 ms ≤ 50 ms).
  Lý do: next-intl `localePrefix: 'as-needed'` (`src/i18n/routing.ts`) → middleware rewrite `/x` → `/vi/x`; Next 15.5 chỉ coi ISR khi pathname gốc khớp
  pattern `[locale]` hoặc đã prerender lúc build → URL bị rewrite luôn render động. Đổi sang `localePrefix: 'always'` sẽ đổi URL công khai/SEO — ngoài scope.
- `next.config.ts` `htmlLimitedBots: /.*/`: tắt streaming metadata cho mọi client → title/canonical/hreflang/og luôn nằm trong `<head>` (bot không chạy JS).

### Chữ giao diện + thông tin công ty (P3-T04)
- `db` → messages = gộp các bản ghi `ui_messages/<locale>/<namespace>`; company-info = `company_info/<locale>/contact`.
- **Gộp sâu DB đè lên file** (`src/lib/content/shape.ts` `mergeOverFile`, `src/lib/content/ui-data.ts`): key file có mà DB thiếu → dùng giá trị file + `console.warn`
  (1 lần/process, ≤ 10 đường dẫn, tiền tố `[content-shape]`); sai kiểu / chuỗi rỗng / mảng rỗng → ném lỗi.
- `src/i18n/messages/{vi,en}.json` và `COMPANY_CONTACT` (`src/lib/contact/company-info.ts`) **giữ lâu dài** làm dự phòng + chuẩn cấu trúc (không xoá cả khi bỏ cờ).

### Ảnh upload (P3-T05, R-16d)
- Lưu: `saveImage` (`src/lib/uploads/save-image.ts`) — JPEG/PNG/WebP theo magic bytes, ≤ 5 MB, cạnh ≤ 8192 px, tên = sha256 + đuôi, ghi file trước rồi
  bản ghi `asset`; trùng hash → dùng lại. Gọi qua `npm run db:cli -- upload` / bot CR-030 (không có API upload HTTP).
- Phục vụ: `GET /uploads/<sha256>.<ext>` (`src/app/uploads/[...path]/route.ts` → `src/lib/uploads/serve-upload.ts`) đọc `UPLOAD_DIR`
  (compose: `/app/uploads` ← bind mount `/opt/nta-web-data/uploads`, owner 1001). `next/image`: `images.localPatterns` = `/images/**`, `/uploads/**` → tối ưu ảnh upload không build lại.
- Xoá mềm asset không xoá file vật lý → URL hash vẫn trả 200.

### Vận hành
- Deploy (`.github/workflows/deploy.yml`): DB healthy → backup pre-migrate → gate destructive → migrate (`nta-migrate`, Dockerfile target `migrator`) → web.
- Content ops (`.github/workflows/content-ops.yml`, chạy tay): `parity` · `backup` · `import-seed` · `revalidate-all` · `upload-smoke` qua service `nta-tools`
  (Dockerfile target `content-tools`, có `src/` + `tools/db/` + `public/` cho kiểm ảnh I-7), cùng concurrency với deploy, lệnh ghi cần confirm + tự backup trước.
- AI news (`.github/workflows/ai-news.yml`, cron thứ 7 08:00 giờ VN (CR-036) + chạy tay — `docs/runbook/ai-news.md`): job `digest` (container) `generate --items-out` (bước duy nhất có `OPENCODE_API_KEY`)
  → `render --images-out` (KHÔNG key, fetch og:image có SSRF guard, CR-035; `vars.AI_NEWS_IMAGES=off` → `--no-images`) → build → artifact `ai-news-images-<slug>` (ảnh + manifest, 7 ngày) → commit file seed;
  job `publish-db` (host, concurrency `deploy-nta-web`, chỉ `main`) chạy cả khi bài tuần đã có (`skip`, tự lành): tải artifact ảnh (chỉ cùng run) → `publish-post --dry-run [--images-dir]` (cờ chỉ khi có manifest) → backup chỉ khi có locale `missing`
  → `publish-post` (lưu ảnh UPLOAD_DIR + asset trước, rồi createEntry, actor `workflow:ai-news`, bản ghi đã có kể cả xoá mềm → `exists`, không ghi đè) → `revalidate --collection post` → smoke trang + 1 ảnh `/uploads`. Không dispatch deploy.
- Backup hằng ngày (sidecar `nta-db-backup`): `daily-*.dump` + `uploads-*.tar.gz`. Runbook: `docs/runbook/db.md`.
