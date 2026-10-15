---
spec_version: 4.3.0
updated_at: 2026-10-15
---

# SPECIFICATIONS.md — NTA Website

<!--
  File này được tự động generate sau khi hoàn thành spec (từ code hoặc từ change request).
  KHÔNG chỉnh sửa thủ công — thay đổi đi qua `/change` (agent change-request).
  Nguồn khởi tạo: reverse-engineer từ docs (repo CHƯA có app code) — /spec-init 2026-10-08.
  Sửa vòng 1 theo spec-validator round 1 (gap 1–6, report: .context/review-reports/spec-validation.md).
-->

## Overview

**NTA Website** — website giới thiệu (marketing/showcase, content-driven) của công ty NTA, giới thiệu
3 mảng giải pháp: (1) Giải pháp doanh nghiệp (CRM, HRM, LMS, DentGo), (2) Giải pháp AI (BoxAI,
flycam/drone, AI tùy chỉnh, FridayAI, AI Vận hành Doanh nghiệp), (3) App AI (music app, hair-style AI). Hướng B2B: khách doanh nghiệp,
cơ quan nhà nước, đối tác. **Không** có đăng nhập người dùng ở v1.
Nguồn: `BRIEF.md:5-17`, `docs/BRD.md:14-31`.

Domain: **`ntavietnam.tech`** (canonical `https://ntavietnam.tech` — HTTPS, apex, không `www`) · Song ngữ **VI/EN** · Phong cách **light minimal kiểu Apple**.
Nguồn: `BRIEF.md:15-16`, `docs/BRD.md:51,167` (quyết định ngày 08/10/2026 — xem `git log`: ab335bb, e7f54aa).
_(cập nhật 2026-10-09: đổi domain đích sang `ntavietnam.tech` — change `domain-ntavietnam`, `spec/updates/2026-10-09-domain-ntavietnam.md`)_
_(cập nhật 2026-10-13: thêm **domain phụ** `ntasolution.vn` (+ `www`) phục vụ **cùng nội dung**, KHÔNG redirect giữa 2 domain; canonical/SEO vẫn **`ntavietnam.tech`** — change `add-domain-ntasolution`, `spec/updates/2026-10-13-add-domain-ntasolution.md`)_

## Scope

- **In Scope:** 9 nhóm trang (trang chủ, về NTA, giải pháp DN + 4 trang con, giải pháp AI + trang con,
  sản phẩm app, case study, blog, liên hệ, nav/footer) · UI responsive mobile-first light minimal ·
  SEO cơ bản · song ngữ VI/EN · form liên hệ có chống spam · deploy docker-vps (Docker + nginx trên VPS) ·
  _(4.2.0 — CR-031)_ nội dung lưu trong **PostgreSQL** (sửa nội dung lên web không cần build lại, có lịch sử phiên bản).
  Nguồn: `docs/BRD.md:47-53`
- **Out of Scope:** hệ thống đăng nhập / CMS quản trị phức tạp (phase sau; CR-031 **không** làm trang admin web — sửa nội dung qua bot Telegram CR-030) · e-commerce / thanh toán ·
  tính năng nghiệp vụ của sản phẩm (CRM/HRM/LMS/DentGo…).
  Nguồn: `docs/BRD.md:55-58`

## Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS — nguồn: `BRIEF.md:46`, `docs/BRD.md:156`
- **Nội dung:** ~~file nội dung trong repo (MDX / JSON / TS), render SSG/SSR~~ → _(4.2.0 — CR-031)_ **PostgreSQL** (bảng `content_entries` + `content_versions`, R-16/R-16a); file trong `src/content/` chỉ còn là **seed import ban đầu**, web không đọc nữa; render on-demand + cache, làm mới qua revalidate (R-15a) — nguồn: `spec/changes/2026-10-14-content-database.md`
- **i18n:** `next-intl` hoặc `next-i18n` (mặc định VI, toggle EN, route `/en/...`) — nguồn: `BRIEF.md:42`
- **Database/ORM:** _(4.2.0 — CR-031)_ **PostgreSQL** (container riêng `nta-db` trên VPS dùng chung) + **Drizzle** (`drizzle-orm` + `drizzle-kit`, migration SQL versioned) — `db_tool: drizzle`, `migration_required: true`, **chỉ DB prod** (không có DB staging — quyết định user 14/10/2026) — nguồn: `.context/project-config.md` mục Database
- **Deploy:** docker-vps — VPS `187.52.119.50` (shared), Docker + nginx + certbot, container `nta-web` tại `127.0.0.1:3005` — nguồn: `.context/project-config.md:51-59`, `docs/runbook/deploy-vps.md`
- **CI/CD:** GitHub Actions — nguồn: `.context/project-config.md:48`
- ⚠️ `[cần xác nhận]` package manager (dự kiến npm — `.context/project-config.md:22`)

> **Trạng thái:** repo **chưa có app code** (`source_roots: []`). Mọi R-xx dưới đây reverse-engineer
> từ docs, đánh dấu `[reverse-engineered from docs]` — sẽ được xác thực lại với code ở Phase 5/layer 0.

## Features

### Module 1 — Trang chủ `/`

- **R-01:** Hero section: tagline + 2 CTA (Tư vấn / Xem giải pháp), responsive đúng breakpoint.
  States: Default / Loading (nếu fetch) / Error. `[reverse-engineered from docs]`
  — nguồn: `docs/BRD.md:65-67` (FR-001), `docs/DESIGN.md:78-83`
  `[cần xác nhận]` dưới SSG (không fetch) liệu có cần Loading/Error state — chốt khi implement.
- **R-02:** Khối 3 mảng giải pháp (Doanh nghiệp / AI / App AI) — 3 card, điều hướng đúng trang, có hover state.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:69-71` (FR-002)
- **R-02a (3.11.0 — khối Giải pháp trang chủ theo mockup CR-016):** header section dùng chung — eyebrow (`SOLUTIONS ——`) +
  tiêu đề 2 dòng (dòng 2 màu brand) + mô tả bên phải; 3 thẻ ngang (Giải pháp doanh nghiệp · Giải pháp AI · Ứng dụng AI): icon
  vuông bo góc, tiêu đề, mô tả, 3 gạch đầu dòng có icon, link "Tìm hiểu … →" ở đáy trỏ `/solutions/enterprise`, `/solutions/ai`,
  `/products` (EN có tiền tố `/en`); ảnh minh hoạ bên phải thẻ fade vào nền. Chữ VI/EN từ i18n/content, không hardcode;
  mobile 1 cột, không tràn ngang. Giữ ràng buộc R-02 (3 card, điều hướng đúng trang, hover state).
- **R-03:** Khối sản phẩm tiêu biểu (≥ 2 sản phẩm tiêu biểu) + CTA cuối trang nổi bật; hiện có 2 app thật theo R-07, section ẩn khi không có sản phẩm.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:73-75` (FR-003)
- **R-03a (3.11.0 — khối Sản phẩm tiêu biểu theo mockup CR-016):** header eyebrow (`PRODUCTS ——`) + tiêu đề "Sản phẩm **tiêu biểu**"
  + mô tả + 2 nút ←/→ (carousel ngang: mỗi lần cuộn đúng 1 thẻ; phím ←/→ khi dải thẻ đang focus; vuốt trên mobile). Card dọc dài:
  poster lớn phía trên, panel trắng phía dưới gồm icon app, tên + mô tả 1 dòng, nút tròn mũi tên màu theo app, hàng chip tính năng
  màu nhạt theo app; thẻ → `/products/<slug>`. Nút ←/→ có `aria-label`, **disabled khi không cuộn được** theo hướng đó (đã ở mép,
  sai số 8px). Giữ ràng buộc R-03 (section ẩn khi không có sản phẩm).
  **(3.14.0 — CR-021)** Cuối dải, sau thẻ sản phẩm cuối, có **1 thẻ CTA viền đứt "Sắp có thêm ứng dụng mới"** — cùng component,
  nội dung (`listingCtas[locale].products`, vi + en), icon `plus` và đích **`/contact`** (`/en/contact`) như thẻ CTA cuối lưới `/products`;
  rộng bằng 1 thẻ sản phẩm (85% mobile, ½ dải từ `md`), snap như thẻ khác, nằm trong vùng cuộn nên ←/→/phím/vuốt tính cả thẻ này
  ~~(2 sản phẩm + thẻ CTA → desktop nút → bật được)~~ _(thay bởi 3.15.0)_. Thẻ chỉ hiện khi section hiện (không làm section hiện khi không có sản phẩm).
  **(3.15.0 — CR-022)** Từ `lg` (≥ 1024px): khi tổng số thẻ trong dải (sản phẩm + thẻ CTA) **≤ 3**, các thẻ hiện đủ trên **1 hàng**,
  không cuộn (đúng 3 thẻ → mỗi thẻ ⅓ dải; ≤ 2 thẻ → ½ dải), cụm nút ←/→ **ẩn** ở `lg+` (nếu hiện thì disabled vì dải không tràn).
  **> 3 thẻ** → giữ carousel ngang (½ dải mỗi thẻ, nút ←/→, phím ←/→, snap) như trên. Dưới `lg` (mobile 85%, tablet ½ dải) luôn là
  dải cuộn ngang như cũ, nút ←/→ hiện. Song ngữ VI/EN như nhau.
- **R-03b (3.11.0 — khối Câu chuyện khách hàng theo mockup CR-016):** eyebrow (`CASE STUDY ——`) + tiêu đề "Câu chuyện **khách hàng**"
  + mô tả 2 dòng; bên phải 2 nút ←/→ (cùng hành vi R-03a) + nút viền "Xem tất cả case study →" → `/case-studies`. Hàng **tối đa 3 thẻ**
  lấy từ dữ liệu case study theo locale, **cùng thứ tự với `/case-studies`** (năm giảm dần, rồi slug — comparator dùng chung
  `compareCaseStudies`): ảnh `cover` (fallback ảnh gallery), chip ngành `sector` + icon, tiêu đề, mô tả clamp 2 dòng,
  "Xem chi tiết →" + nút tròn mũi tên; mỗi thẻ → `/case-studies/<slug>`. Không có case study → section ẩn. Thay khối 1 `featuredCase`
  cũ (bỏ field `featuredCase` trong `src/content/home.ts`). Song ngữ VI/EN; mobile carousel vuốt, không tràn ngang; alt ảnh + focus visible.

### Module 2 — Về NTA `/about`

- **R-04 (3.12.0 — sửa theo CR-020):** Trang có các khối: sứ mệnh/giá trị, con người NTA, milestones (timeline), đối tác, CTA; logo đối tác grayscale → màu khi hover.
  ~~năng lực, team~~ **[DEPRECATED 3.12.0 — CR-020: bỏ khối "Năng lực" và "Đội ngũ" khỏi `/about` vi+en]**.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:78-80` (FR-010), `docs/DESIGN.md:85-90`
- **R-04a (3.10.0 — thiết kế lại đầu trang /about theo mockup CR-014):** thứ tự trang: (1) **hero 2 cột** — breadcrumb pill
  (Trang chủ › Về NTA), H1 "Về **NTA**" (NTA màu brand), tagline lớn, đoạn mô tả, 3 chỉ số có icon (50+ dự án · 30+ đối tác ·
  99% hài lòng — lấy từ i18n `about.stats`, chờ user xác nhận số thật); cột phải ảnh **tòa Kim Hoàn thật** (next/image, alt VI/EN);
  nền gradient mint nhạt; (2) **khối sứ mệnh** — eyebrow + tiêu đề "Đưa AI vào thực tiễn, tạo **giá trị bền vững**" + 3 thẻ icon
  Sứ mệnh · Tầm nhìn · Giá trị cốt lõi (4 bullet); (3) **khối Con người NTA** — ảnh đội ngũ (ảnh AI tạm) + eyebrow/tiêu đề/mô tả +
  ~~nút outline "Tìm hiểu thêm về đội ngũ →" cuộn tới khối Đội ngũ (`#team`)~~ **[bỏ 3.12.0 — CR-020]** (khối không còn nút);
  sau đó: cột mốc (Hành trình phát triển), đối tác, CTA (R-04). Thứ tự trang 3.12.0: Hero · Giá trị · Con người NTA ·
  Hành trình phát triển · Đối tác · CTA — không còn khối Năng lực / Đội ngũ.
  PageHeader + MissionBlock cũ bỏ. Song ngữ VI/EN; mobile xếp 1 cột, không tràn ngang; metadata + breadcrumb JSON-LD giữ nguyên.

### Module 3 — Giải pháp Doanh nghiệp

- **R-05:** Trang tổng quan `/solutions/enterprise` + 4 trang con `/solutions/enterprise/[slug]`
  (`crm` | `hrm` | `lms` | `dentgo`); mỗi giải pháp: mô tả tính năng + lợi ích + CTA; slug sai → 404.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:83-85` (FR-020), `docs/DESIGN.md:92-99`

### Module 4 — Giải pháp AI

- **R-06:** Trang tổng quan `/solutions/ai` + trang con `/solutions/ai/[slug]`
  (`boxai` | `flycam` | `custom-ai` | `fridayai` | `ai-operations-brain`); mỗi giải pháp có mô tả + case study liên quan nếu có dữ liệu (tùy chọn).
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:88-90` (FR-030), `docs/DESIGN.md:101-107`
- **R-06a (content — AI tùy chỉnh / Talvra):** trang `custom-ai` trình bày **nền tảng Talvra** (content thật,
  không placeholder): vấn đề của SME, định nghĩa platform, 4 nguyên tắc, 3 template trợ lý
  (Support / Sales / Ecommerce), hành trình 6 bước (form → cấu hình → duyệt người → launch → monitor → bàn giao),
  kênh tích hợp (Zalo · KioskViet · Telegram), điểm khác biệt, an toàn & kiểm soát, tiến độ + roadmap,
  đối tượng phù hợp, tầm nhìn, CTA. — nguồn: change `spec/changes/2026-10-09-ai-solution-content.md` phần A.
- **R-06b (content — BoxAI):** trang `boxai` trình bày giải pháp **AI camera + AI Box (NVIDIA Jetson)**:
  kiến trúc 3 tầng (camera cố định + edge AI box + VMS), phần cứng (Orin NX/Nano, DeepStream), ngân sách
  thuật toán theo kênh, danh mục 21 thuật toán + 3 tính năng nền, gói theo ngành (di tích / rừng / KCN),
  KPI. ~~đề cập triển khai thực tế tại Đền Bảo Hà~~ **[DEPRECATED — CR-025, 2026-10-14]**: trang `boxai` (vi/en)
  **không** còn khối "Triển khai thực tế tại Đền Bảo Hà" (cả `sections` lẫn `showcase.details`) và `relatedCases`
  không còn `ai-box-bao-ha` (chỉ còn case study khu di tích R-08a, slug mới).
  — nguồn: change phần B; CR-025 `spec/changes/2026-10-14-remove-bao-ha-anonymize-oc-eo.md`.
- **R-06c (content — Flycam):** trang `flycam` trình bày **DJI Dock 2 + Matrice 3TD**: thông số thiết bị,
  thời gian phản ứng theo khoảng cách, ba khái niệm diện tích phủ, 4 loại route bay, lịch bay theo cấp dự báo
  cháy (I–V), bộ lọc trigger, KPI, FAQ. — nguồn: change phần B.
- **R-06e (content — FridayAI, 3.7.0):** trang `fridayai` (+ `/en/…`) trình bày **FridayAI — AI API Gateway, sản phẩm của NTA**
  (dùng AI giá rẻ): một endpoint cho model Anthropic/OpenAI/Google, tương thích OpenAI SDK (đổi `base_url`),
  dùng với Cursor/Claude Code, trả theo mức dùng + gói tháng + Enterprise (VAT, SLA, SSO, on-premise),
  thanh toán MoMo/chuyển khoản/USDT/thẻ, zero-log + không train trên dữ liệu khách. Số liệu độ trễ/uptime ghi rõ
  "theo số liệu FridayAI"; **không** ghi cứng bảng giá/khuyến mãi trong nội dung (giá đổi liên tục → dẫn sang site).
  Nút chính hero + nút CTA cuối trang **dẫn sang `https://fridayaix.com/` (tab mới, `rel=noopener noreferrer`)**.
  Ảnh = ảnh chụp website fridayaix.com (caption ghi nguồn) + logo SVG lấy từ site. Thẻ ở `/solutions/ai` thuộc
  danh mục lọc mới **"Nền tảng API AI" (`gateway`)**; mega menu Header + sitemap tự có mục mới.
  — nguồn: change `spec/changes/2026-10-13-fridayai-solution.md` (CR-011).
- **R-06f (content — AI Operations Brain, 4.1.0):** trang `ai-operations-brain` (+ `/en/…`) trình bày giải pháp dạng
  **năng lực (capability)** "AI Vận hành Doanh nghiệp — bộ não vận hành đa tác vụ" / "AI Operations Brain": nền tảng
  multi-agent hợp nhất dữ liệu vận hành, phân tích – dự báo – **đề xuất hành động**, ràng buộc bởi **AI Hiến pháp**
  (policy engine có version) và **con người phê duyệt** trước khi thực thi; vấn đề, 4 lớp công nghệ, vòng lặp an toàn
  6 bước, nhóm quy tắc Hiến pháp, cơ chế bảo vệ, mô hình 7 agent, nguồn dữ liệu, lộ trình 5 giai đoạn, ngành phù hợp, CTA
  liên hệ nội bộ. Section KPI **giữ nhưng ghi rõ là "Mục tiêu kỳ vọng khi triển khai" / "Target impact (when deployed)"**,
  không trình bày như kết quả đã đạt (BR-004). **Không** gắn tên khách hàng/người cụ thể, `relatedCases: []`,
  **không** xuất hiện khối ghi chú người duyệt của bản nguồn. Ảnh = SVG minh hoạ trung tính (không ảnh khách hàng).
  Thẻ ở `/solutions/ai` (3 chip theo bản nguồn) thuộc danh mục lọc mới `operations` ("Vận hành doanh nghiệp" /
  icon `workflow`); mega menu Header + sitemap/hreflang tự có mục mới (theo `aiSlugs`).
  — nguồn: change `spec/changes/archive/2026-10-14-ai-operations-brain-solution.md` (CR-028).
- **R-06d (render — trang chi tiết AI):** trang chi tiết AI render `benefits` (lợi ích) + **section nội dung
  có cấu trúc** (kiến trúc / thuật toán / ứng dụng ngành) + chỉ số nổi bật/FAQ tùy chọn; giữ SSG + i18n VI/EN.
  — thiết kế component cập nhật ở `.context/design-spec.md`.
- **R-06e (link case study):** giải pháp AI liên kết tới case study liên quan (case study khu di tích R-08a — `heritage-site-ai-camera`) — thoả AC `docs/BRD.md:90`.

### Module 5 — Sản phẩm App

- **R-07:** `/products`: giới thiệu Music app & Hair-style AI — mô tả, ảnh/screenshot, kênh tải (nếu có).
  Priority: Medium (theo FR-040). `[reverse-engineered from docs]`
  — nguồn: `docs/BRD.md:93-95` (FR-040), `docs/DESIGN.md:109-111`

### Module 6 — Case Study

- **R-08:** Danh sách `/case-studies` (filter theo mảng, pagination) + chi tiết `/case-studies/[slug]`
  (meta bar, Challenge → Solution → Result, gallery, related); ít nhất 2 case study (Óc Eo, phòng khám…).
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:98-100` (FR-050), `docs/DESIGN.md:113-119`
  - Empty state cho list chưa specify — `[cần xác nhận]` khi implement (`docs/DESIGN.md:82` principle).
- **R-08a (content — case study Óc Eo):** case study `oc-eo-learning` **sửa nội dung** từ "Số hoá quản lý
  đào tạo tại Óc Eo" → **dự án AI camera + flycam tại khu di tích Óc Eo – Ba Thê** (content thật, phần C):
  bối cảnh (~433 ha, di tích quốc gia đặc biệt), giải pháp kiến trúc 3 tầng (~200 camera), chức năng theo gói,
  kết quả/số liệu, điểm mạnh — đúng format **vấn đề → giải pháp → kết quả**. Category đổi `enterprise` → `ai`;
  giữ nguyên slug `oc-eo-learning` _(thay bởi R-08a.1 — 4.0.0: ẩn địa danh, slug `heritage-site-ai-camera`)_. — nguồn: change `spec/changes/2026-10-09-ai-solution-content.md` phần C.
  - **R-08a.1 (CR-025, 2026-10-14 — ẩn địa danh + đổi slug):** nội dung hiển thị (vi/en) của case study này **không**
    được chứa tên địa danh cụ thể ("Óc Eo", "Ba Thê", "núi Ba Thê" hay tên riêng định danh khác) ở mọi field render:
    `title`, `client`, `challenge`/`solution`/`result`, `gallery[].alt`, `showcase.hero` (breadcrumbLabel, subtitle,
    description, image.alt), `pillars`, `photos` (title, items[].alt), `vision` (description, quote), metadata/JSON-LD.
    Thay bằng cách gọi chung **"một khu di tích ở Việt Nam"** (en: **"a heritage site in Vietnam"**). Số liệu mô tả
    (~433 ha, "khu di tích quốc gia đặc biệt", ~200 camera, 12 tuần) **giữ nguyên**.
    **Slug đổi** `oc-eo-learning` → **`heritage-site-ai-camera`**; URL cũ `/case-studies/oc-eo-learning`,
    `/vi/case-studies/oc-eo-learning`, `/en/case-studies/oc-eo-learning` → **redirect 301** sang slug mới cùng locale;
    sitemap chỉ chứa slug mới; mọi link nội bộ (`relatedCases` boxai/flycam, thẻ cuối `/solutions/ai`, listing meta) trỏ slug mới.
    **Tên file/thư mục ảnh** của case study này (`public/images/cases/…`, `public/images/illustrations/…`) cũng **không**
    chứa địa danh (URL ảnh lộ ra trình duyệt): `cases/oc-eo/*` → `cases/heritage-site/*`, `illustrations/oc-eo-*.svg` →
    `illustrations/heritage-site-*.svg` (user chốt 2026-10-14); ảnh mồ côi `oc-eo-learning-overview.svg` xoá. Comment code
    nội bộ (không render) ngoài phạm vi ràng buộc này.
  - ⚠️ **Needs-input (chờ xác nhận):** phần C mô tả số liệu "từ phương án" (dự toán + lộ trình) — cần user xác nhận
    đây là **phương án đề xuất** hay **dự án đã triển khai** để ghi "kết quả" trung thực (BR-004).
  - ✅ ~~Needs-input: số liệu hiện trường Đền Bảo Hà (R-06b)~~ — đã xác nhận 13/10/2026 (CR-012, R-08b.2).

- **R-08b (bố cục showcase cho chi tiết case study):** chi tiết `/case-studies/[slug]` có **2 biến thể** chọn
  bằng frontmatter `layout`: `default` (R-08 — MetaBar + Challenge → Solution → Result + gallery) và **`showcase`**
  (landing theo ảnh mẫu, dữ liệu có cấu trúc trong `showcase`): hero (breadcrumb, eyebrow trạng thái, h1 slogan 2 màu,
  subtitle = tên dự án, mô tả, CTA anchor; nút video **chỉ khi có URL thật**) + ảnh lớn · thẻ 3 số liệu · 3 cột
  Thách thức / Giải pháp đề xuất / Kết quả kỳ vọng · dòng lưu ý `note` · khối công nghệ + màn VMS minh hoạ (caption
  "minh hoạ / dữ liệu giả lập") · carousel ảnh (caption bắt buộc khi ảnh là minh hoạ) · khối tầm nhìn (quote có
  `quoteSource`) · thẻ CTA → `/contact` · RelatedStudies. Biến thể showcase **không** render MetaBar / 3 khối văn
  xuôi / `gallery` (giữ trong frontmatter làm fallback). Thẻ case study ở danh sách + khối featured trang chủ dùng
  ảnh `cover` (thiếu → `gallery[0]`). Áp dụng đầu tiên: `oc-eo-learning` (vi/en). BR-004: phương án đề xuất phải
  ghi rõ "đề xuất / kỳ vọng / tham chiếu", ảnh minh hoạ phải ghi là minh hoạ. — nguồn: change
  `spec/changes/archive/2026-10-12-oc-eo-case-study-showcase.md`.
  - **R-08b.1 (3.2.1 — field optional cho showcase, tương thích ngược):** `technology.screen` (ảnh chụp phần mềm
    thật → render khung màn hình thay màn VMS minh hoạ; có `screen` thì `alerts` không bắt buộc) · `technology.nodes`
    nhận chuỗi hoặc `{ label, icon }` (icon thêm `calendar` / `records` / `inventory`) · `photos.variant: screen` (ảnh
    chụp màn hình: viền + căn trên) · `hero.image.width/height` optional · icon số liệu thêm `modules` · nút hero
    `primaryCta` nhận anchor `#…` hoặc route nội bộ (route → `Link` theo locale). Áp dụng thứ hai: `dental-clinic-operations`
    (vi/en) — nút hero + nút khối Giải pháp mở `/solutions/enterprise/dentgo`. — nguồn: change
    `spec/changes/archive/2026-10-13-dental-case-study-showcase.md`.
  - **[DEPRECATED — CR-025, 2026-10-14] R-08b.2:** case study `ai-box-bao-ha` **bị gỡ** (MDX vi/en, meta listing,
    ảnh `/images/cases/bao-ha/*`, mọi link dẫn tới). `/case-studies/ai-box-bao-ha` (vi/en) → **404** bằng trang
    `src/app/[locale]/not-found.tsx` có sẵn (không redirect); không xuất hiện ở `/case-studies`, trang chủ, trang giải
    pháp, sitemap. Nội dung gốc (giữ để truy vết):
    **R-08b.2 (3.8.0 — case study AI Box đền Bảo Hà):** thêm case study `ai-box-bao-ha` (vi/en, `layout: showcase`,
    category `ai`, thẻ listing icon `landmark`) — dự án **đã triển khai**: 3 AI Box, 48 camera IP sẵn có, 4 chức năng đang
    bật (báo cháy, phát hiện ẩu đả, xâm nhập vùng cấm, đếm người). Hero + carousel + khối công nghệ dùng **ảnh camera thật**
    tại đền (mặt người đã làm mờ, caption ghi rõ ảnh thật); lưới tính năng = 2 lớp nền + 4 chức năng; khối chi tiết = giảm
    báo giả + luồng xử lý sự kiện; nút khối Giải pháp → `/solutions/ai/boxai`. BR-004: chỉ số đã xác nhận + số lượt khách có
    nguồn Báo Lào Cai; **không** công bố số liệu vận hành; **không** nêu tên chip AI Box. Trang `boxai` (R-06b) cập nhật đoạn
    Bảo Hà theo số liệu đã xác nhận và `relatedCases` ưu tiên `ai-box-bao-ha`. — nguồn: change
    `spec/changes/archive/2026-10-13-ai-box-bao-ha-case-study.md`.

- **R-08c (khung chi tiết dùng chung — 3.3.0):** một khung layout chi tiết duy nhất (`ShowcaseLayout`) cho:
  trang chi tiết case study showcase `/case-studies/[slug]`, trang chi tiết giải pháp `/solutions/enterprise/[slug]`
  và `/solutions/ai/[slug]`, và trang chi tiết sản phẩm `/products/[slug]` (route mới). Cùng thứ tự block:
  hero → thẻ số liệu + 3 pillar → công nghệ + ảnh → carousel ảnh → tầm nhìn → **[lưới tính năng]** → **[tình huống sử dụng & kết nối]** → **[FAQ]** → CTA.
  Mỗi trang chỉ khác **data** trong frontmatter MDX (VI + EN); `page.tsx` chỉ load data + breadcrumb/JSON-LD/metadata.
  Block lưới tính năng, tình huống sử dụng & kết nối (3.4.0) và FAQ là **optional** (thiếu data → ẩn, không vỡ layout). Pillar giải pháp: Vấn đề / Giải pháp / Lợi ích.
  Số liệu thẻ chỉ dùng số thật của sản phẩm (BR-004); thiếu trích dẫn thật → ẩn thẻ quote tầm nhìn.
  Giữ nguyên URL hiện có; metadata, canonical/alternates, breadcrumb JSON-LD, sitemap đúng; SSG; không thêm DB/API nội dung (R-15, R-16).
  Ảnh thiếu → ảnh minh hoạ tự tạo có alt/caption ghi "minh hoạ" (BR-004); ảnh staging CRM/DentGo/LMS phải thay dữ liệu bên trong bằng dữ liệu giả.
  — nguồn: change `spec/changes/2026-10-13-shared-detail-showcase-template.md` (CR-004).
  - **R-08c.1 (3.5.1 — trang chi tiết sản phẩm app):** `/products/[slug]` (+ `/en/…`) cho `music-app`, `hair-style-ai` render bằng `ShowcaseLayout`,
    data `showcase` trong `src/content/products/{vi,en}/*.mdx`; slug lạ → 404; thẻ ở `/products` link sang trang chi tiết; sitemap có 2 trang × 2 ngôn ngữ.
    Field optional tương thích ngược cho ảnh app di động: `technology.screen.device: phone` (khung điện thoại), `photos.variant: phone`
    (+ `photos.aspect` tỉ lệ ảnh), icon nút sơ đồ `photo` · `ai` · `music` · `share`. Chưa có link store → nút hero cuộn tới lưới tính năng.
    Nội dung lấy từ ghi chú sản phẩm user gửi 13/10/2026; không dùng ảnh có số liệu chưa kiểm chứng (màn Premium nhạc ghi rating 4.8) hoặc ảnh minh hoạ chưa rõ giấy phép (welcome app tóc) (BR-004).

- **R-08d (3.9.0 — lightbox carousel ảnh + thẻ case study banner):**
  - **R-08d.1 (lightbox):** carousel ảnh `showcase.photos` (mọi `variant`) trong khung chi tiết dùng chung (R-08c) — bấm ảnh mở
    **lightbox** (`<dialog>` native, không thêm thư viện): ảnh đủ (`object-contain`), alt/caption + bộ đếm "n / N"; đóng bằng nút X,
    Esc, bấm nền; chuyển ảnh bằng nút trước/sau, phím ←/→ và vuốt (cảm ứng), vòng lặp đầu↔cuối; focus vào dialog khi mở và trả
    focus về ảnh đã bấm khi đóng; khoá cuộn trang khi mở; animation chỉ khi `motion-safe` (tôn trọng `prefers-reduced-motion`).
    Áp dụng cho `/case-studies/[slug]` (showcase), `/solutions/enterprise/[slug]`, `/solutions/ai/[slug]`, `/products/[slug]` (vi/en).
    **Ngoài phạm vi:** ảnh hero, `ScreenMock`/`VmsMock`, `ImageGallery` của biến thể `default`.
  - **R-08d.2 (thẻ danh sách `/case-studies`):** `ListingCard` kind `photo` — ảnh cover là banner ngang tỉ lệ 16/10 trên đầu thẻ,
    nội dung chữ bên dưới full width; các thẻ trong lưới cao đều. Thẻ kind `phone`/`window` (`/products`, `/solutions/*`) không đổi.
  — nguồn: change `spec/changes/archive/2026-10-13-image-lightbox-case-study-card.md` (CR-013).

### Module 7 — Tin tức / Blog

- **R-09:** Danh sách `/blog` + chi tiết `/blog/[slug]`, phân trang hoặc lazy-load.
  Priority: Medium (theo FR-060). `[reverse-engineered from docs]`
  — nguồn: `docs/BRD.md:103-105` (FR-060), `docs/DESIGN.md:121-123`
  - Empty state: xem R-09a §Trạng thái.
  - Ngày hiển thị trên card blog **list** dùng **cùng format locale** với detail (design S11):
    ~~VI `dd/mm/yyyy` (`08/10/2026`)~~ → **VI `08 Th10, 2026`** (ngày 2 chữ số + ` Th` + tháng KHÔNG pad 0 + `, ` + năm; vd `15 Th3, 2026`; ghép tay, không dùng
    `Intl` vi-VN vì ra "thg"), EN `Oct 8, 2026`; tính theo ngày ISO trong frontmatter (không lệch timezone)
    — **1 nguồn util dùng chung** (`src/lib/format/date.ts`). _(clarify 2026-10-09 — fix C-L2-1; đổi format VI
    2026-10-13 — change `blog-listing-redesign`, áp dụng cả list + detail)_
- **R-09a:** Trang danh sách `/blog` (+ `/en/blog`) bố cục "newsroom" theo mockup
  `spec/changes/assets/2026-10-13-blog-listing-redesign/mockup-blog-listing.png`:
  1. **Hero** — nền ảnh sóng xanh ngọc (tối ưu webp, không chặn LCP), breadcrumb pill (Trang chủ › Tin tức),
     tiêu đề 2 dòng (dòng 2 phần nhấn màu primary), mô tả ngắn, minh hoạ SVG/CSS trang trí (`aria-hidden`).
  2. **Thanh lọc** — 7 chip danh mục cố định: Tất cả · AI & Công nghệ · Ứng dụng thực tiễn · Câu chuyện khách hàng ·
     Hoạt động NTA · Xu hướng · Hướng dẫn (chip active nền primary); ô tìm kiếm lọc theo tiêu đề + tóm tắt
     (không phân biệt hoa/thường, dấu tiếng Việt). Trạng thái phản ánh trên URL `?category=<key>&q=<text>&page=<n>`;
     đổi lọc/tìm → về trang 1. Chip không có bài vẫn hiện; kết quả rỗng → empty state + nút xoá bộ lọc.
  3. **Khối nổi bật** (khi KHÔNG lọc/tìm): bài mới nhất dạng lớn (ảnh, badge danh mục, ngày, thời gian đọc,
     tiêu đề, tóm tắt, "Đọc thêm →"), tối đa 2 bài kế tiếp dạng nhỏ, thẻ "NỔI BẬT — Cập nhật mới nhất từ NTA"
     với nút "Xem tất cả bài viết" cuộn + focus tới mục 4 (khối này chỉ hiện khi không lọc ⇒ không cần xoá bộ lọc). Thiếu bài → khối co lại, không chèn bài giả.
  4. **"Bài viết mới nhất"** — lưới thẻ (1 / 2 / 3 / 4 cột ở base / md / lg / xl) gồm các bài còn lại sau khối nổi bật,
     phân trang; rỗng → ẩn mục. Khi đang lọc/tìm → ẩn khối nổi bật, lưới hiển thị toàn bộ kết quả.
  - **Danh mục** là key cố định trong frontmatter (`ai-tech | practical | customer-stories | nta-news | trends | guides`),
    nhãn hiển thị lấy từ i18n (vi/en) — dùng chung cho badge list + detail.
  - **Thời gian đọc** tự tính từ số từ của bài (~200 từ/phút, tối thiểu 1 phút), hiển thị "5 phút đọc" / "5 min read".
  - **Chi tiết hành vi (chốt sau spec-validation round 1):**
    - *Tiêu đề:* hero dùng `ListingHero` chung của các trang danh sách: `h1` = dòng 1 ("Tin tức & Cập nhật" /
      "News & Updates"), dòng 2 là tagline lớn có phần nhấn ("về **AI và ứng dụng thực tiễn**" / "on **AI and
      real-world applications**"); metadata title giữ "Tin tức | NTA" / "Blog | NTA". Nền = `hero-waves.jpg`
      dùng chung (cùng ảnh với `hero-background.png` user gửi, bản JPEG nén lại 1983×793 — 38KB).
      Nhãn chip EN: All · AI & Technology · Practical applications · Customer stories · NTA activities · Trends · Guides.
    - *Phân trang:* page size **12**. Không lọc/tìm: khối nổi bật (3 bài mới nhất) chỉ hiện ở trang 1 và KHÔNG tính vào
      page size; lưới = các bài từ thứ 4 trở đi, chia 12/trang. Đang lọc/tìm: lưới = toàn bộ kết quả, 12/trang.
    - *URL:* "Tất cả" = không có `category`; `category` không thuộc 6 key → coi như "Tất cả"; `q` được trim, rỗng → bỏ
      khỏi URL; `page` không hợp lệ/vượt → kẹp về [1, tổng trang]; đổi chip/từ khoá → bỏ `page`. Cập nhật URL khi đổi
      chip/từ khoá bằng `history.replaceState` (không thêm history, không vòng server; phân trang dùng `Pagination` chung — push), tìm kiếm theo lúc gõ (debounce ~300ms). Canonical `/blog` không kèm query.
    - *Tìm kiếm:* kết hợp với chip danh mục theo AND; trường = tiêu đề + tóm tắt; chuẩn hoá: trim, lowercase, NFD bỏ dấu, `đ`→`d`; khớp chuỗi con.
    - *Thời gian đọc:* số token tách theo khoảng trắng của body MDX, `ceil(từ/200)`, tối thiểu 1.
    - *Trạng thái:* 0 bài → empty state hiện có (S10) thay toàn bộ phần dưới hero; lọc/tìm rỗng → "Không có bài viết phù
      hợp" + nút xoá bộ lọc. Bài ≤3 → mục "Bài viết mới nhất" ẩn và nút "Xem tất cả bài viết" cuộn tới thanh lọc.
    - *Responsive:* khối nổi bật xl: 3 cột (lớn · 2 nhỏ · thẻ NỔI BẬT); md–lg: bài lớn full-width, 2 nhỏ thành 2 cột,
      thẻ NỔI BẬT full-width; base: 1 cột theo thứ tự lớn → nhỏ → NỔI BẬT. Lưới: 1 / 2 (md) / 3 (lg) / 4 (xl) cột.
      Hàng chip cuộn ngang trong khung riêng ở mobile, trang không scroll ngang.
    - *A11y:* chip = `button aria-pressed` trong `role="group"` có nhãn; ô tìm kiếm có `label` (sr-only) +
      `type="search"`; số kết quả trong `role="status"`; "Xem tất cả" chuyển focus tới tiêu đề mục đích, tôn trọng
      `prefers-reduced-motion`; minh hoạ hero `aria-hidden`.
    - *Kiểu dữ liệu:* `Post.category` là union 6 key; key lạ → build fail. Bài liên quan ở detail = cùng key.
    - *Design:* bám pattern trang danh sách hiện có (`src/components/listing/*`: hero sóng, thanh lọc kính, nhấn teal);
      ảnh nền hero dùng bản đã tối ưu, không thêm asset PNG 1.5MB.
    - *Blast radius:* thẻ mới là component riêng (`src/components/blog/`); `PostCard` (dùng ở RelatedPosts) chỉ đổi
      nhãn badge sang i18n + chuỗi ngày.
  - **Ngoài phạm vi:** khối "Đăng ký nhận tin" (chưa có backend — làm sau). BR-004: không thêm bài/ảnh minh hoạ giả.
  — nguồn: change `spec/changes/2026-10-13-blog-listing-redesign.md` (user chốt 6 quyết định 2026-10-13).
- **R-09c (3.13.0 — CR-019 "Bản tin AI tuần" tự động):** mỗi tuần (cron 08:00 thứ 2 giờ VN + chạy tay `workflow_dispatch`)
  workflow `.github/workflows/ai-news.yml` trên self-hosted runner `nta-web` (chạy trong container, không cài gì lên host)
  tự sinh + đăng **2 bài** `src/content/blog/{vi,en}/ai-weekly-YYYY-wNN.mdx` (ISO week; category `ai-tech`; cover cố định
  `/images/blog/ai-weekly-cover.svg`; tuần đã có bài → bỏ qua, không trùng).
  - *Thu thập:* `tools/ai-news/` (vendor `last30days` MIT + script in-house): 4 topic `--days 7` + GitHub trending 7 ngày
    (lọc chủ đề AI); 1 nguồn lỗi/bị chặn → bỏ qua, không fail pipeline. **Sanitize bắt buộc** → LLM chỉ nhận `.clean.md`
    (banner "dữ liệu, không phải lệnh"), không nhận snippet thô.
  - *Viết bài:* OpenCode Go (`https://opencode.ai/inference/go/v1`, key `OPENCODE_API_KEY` ở GitHub Secrets; user-agent riêng
    + header `x-opencode-session` cố định) trả danh sách tin; dạng **điểm tin** — mỗi tin: tiêu đề dịch + 1–2 câu diễn giải
    từ chính tiêu đề + link nguồn; cấm thêm thông tin không có trong dữ liệu. Cuối bài ghi chú cố định "Bản tin được tổng hợp
    tự động từ các nguồn công khai" (vi/en).
  - *Ảnh từng tin (4.3.0 — CR-035):* sau guard URL, `generate.py` (job `digest`, không secret DB) lấy `og:image`/`twitter:image`
    của **chính URL tin** với guard SSRF (https-only, chặn IP không-global kể cả sau DNS/redirect, pin IP, ≤ 3 redirect, timeout,
    HTML ≤ 512 KB chỉ đọc meta, HTML không tới LLM) → tải ảnh ≤ 2 MB, **chỉ JPEG/PNG/WebP** theo magic bytes (GIF → bỏ ảnh, tin
    chỉ text; không đổi R-16d), ≥ 200 px; ảnh trùng giữa các tin (cùng sha256 ở ≥ 2 tin) **tự bỏ**, không deny-list cứng.
    Bài vi + en chèn ảnh dưới tiêu đề tin (`/uploads/<sha256>.<ext>`, alt = tiêu đề tin theo locale) + ghi nguồn ảnh: dòng nhỏ
    ngay dưới mỗi ảnh "Ảnh: <tên miền>" (vi) / "Image: <domain>" (en) **và** 1 câu chú thích cuối bài (ảnh minh hoạ thuộc về
    trang nguồn của từng tin); **không hotlink**. Tin không lấy được ảnh → chỉ text; lỗi ảnh không làm fail bài. Ảnh bìa giữ
    SVG cố định. Bản quyền og:image: user **chấp nhận rủi ro** (2026-10-15); runbook `docs/runbook/ai-news.md` có cách gỡ 1 ảnh
    khi bị yêu cầu.
  - *Guard trước khi đăng:* mọi URL trong bài phải có trong `.clean.md`; số tin trong khoảng cho phép; frontmatter
    (`slug/title/date/category/excerpt/cover`) + độ dài hợp lệ; `npm run build` PASS. Bất kỳ bước FAIL → không commit,
    không ghi DB, workflow đỏ. PASS → commit file seed thẳng `main` (lịch sử bài trong git + dedupe tuần theo file).
  - *Đăng vào DB (4.2.1 — CR-034, vì web đọc nội dung từ DB theo R-16):* job `publish-db` (host runner, chung nhóm
    concurrency `deploy-nta-web`, chỉ ref `main`; secret DB/revalidate chỉ ở job này) chạy khi bài tuần đã nằm trên `main`
    (vừa commit **hoặc** đã có từ lượt trước → chạy lại cùng tuần tự lành):
    1. `content-cli.ts publish-post <slug> --dry-run` — đọc `src/content/blog/{vi,en}/<slug>.mdx` bằng parser chung, validate
       **cả 2 locale** trước khi ghi bất kỳ bản nào; báo `missing|exists` theo locale. Lỗi validate → đỏ, không ghi locale nào.
       *(4.3.0 — CR-035)* `--images-dir <dir>`: validate ảnh của bài (magic bytes, sha256 == tên file) ngay trong dry-run; ảnh
       sắp lưu được coi là hợp lệ cho I-7. Ảnh chuyển từ job `digest` → `publish-db` qua artifact (giữ 7 ngày).
    2. Có locale `missing` → **backup DB trước khi ghi** (lỗi backup → dừng); không thiếu → không backup.
    3. **Chỉ thêm mới** qua write-path chuẩn `createEntry`: version 1 + `content_versions` (op `create`, actor
       `workflow:ai-news`, note có run id). Bản ghi đã có — kể cả đã sửa hay **đã xoá mềm** — → `exists`, **không ghi đè,
       không khôi phục**; chạy lại cùng tuần → 0 ghi, workflow xanh.
       *(4.3.0 — CR-035)* `--images-dir`: sau backup, lưu ảnh qua `saveImage` (asset có version, actor `workflow:ai-news`;
       trùng hash → dùng lại) **trước** khi chèn bài; bài `exists` → không đụng ảnh.
    4. Revalidate collection `post` (luôn chạy) → smoke `/blog/<slug>` + `/en/blog/<slug>` HTTP 200.
    Không dispatch `deploy.yml` (bài hiện qua DB + revalidate, không cần build lại image). CLI từ chối cờ không thuộc lệnh
    (vd `rollback --dry-run`) bằng lỗi usage, không chạm DB.
  - Không duyệt tay (user chốt 2026-10-14, đã được báo rủi ro AI bịa chi tiết). — nguồn: change `spec/changes/2026-10-14-weekly-ai-news-digest.md`
    + `spec/changes/2026-10-15-ai-news-write-db.md` (CR-034, BUG sau cutover DB)
    + `spec/changes/2026-10-15-ai-news-item-images.md` (CR-035, ADDITIVE ảnh từng tin).
- `[cần xác nhận]` blog là static file hay cần CMS (Open Question — `docs/BRD.md:177`)

### Module 8 — Liên hệ

- **R-10:** `/contact` (+ `/en/contact`) bố cục theo mockup
  `spec/changes/assets/2026-10-13-contact-page-redesign/mockup-contact.png` (CR-008, spec 3.6.0):
  1. **Hero** — nền sóng dùng chung, breadcrumb pill (Trang chủ › Liên hệ), tiêu đề 2 dòng
     "Liên hệ với NTA" / "Cùng tạo nên những **giá trị thực tiễn**" (phần nhấn màu primary), mô tả ngắn,
     minh hoạ trang trí bên phải (`aria-hidden`, chỉ `lg+`).
  2. **Card thông tin (cột trái desktop)** — 3 mục có icon:
     Điện thoại `0335546831` (link `tel:`, phụ: "Thứ 2 – Thứ 6, 8:30 – 17:30") ·
     Email `admin@ntasolution.vn` (link `mailto:`, phụ: "Phản hồi trong 24h") ·
     Địa chỉ "Tầng 2, tòa nhà Kim Hoàn, ngõ 19 Duy Tân, Cầu Giấy, Hà Nội, Việt Nam".
     Bản đồ Google Maps nhúng (iframe không API key, `loading="lazy"`, có `title`) trỏ đúng địa chỉ trên
     + link "Mở Google Maps" (tab mới). Mục "Văn phòng NTA": Bãi đỗ xe (có tại tòa nhà) ·
     Giao thông thuận tiện (gần tuyến Metro) · Vị trí trung tâm (dễ dàng di chuyển).
  3. **Card form (cột phải desktop)** — eyebrow "Gửi thông tin cho chúng tôi", tiêu đề "Để lại thông tin liên hệ", mô tả;
     trường: Họ và tên* · Email* · Số điện thoại* · Tên doanh nghiệp/Tổ chức (tuỳ chọn, ≤150 ký tự) ·
     Nhu cầu của bạn* (select: Phần mềm CRM · Phần mềm nha khoa DentGo · Hệ thống đào tạo trực tuyến LMS ·
     Quản trị nhân sự HRM · BoxAI · Giải pháp AI theo yêu cầu · Flycam · Phát triển phần mềm theo yêu cầu · Khác) ·
     Nội dung liên hệ* (10–500 ký tự, bộ đếm `n/500`). Lưới 2 cột ở `md+`, 1 cột mobile. Không dùng reCAPTCHA
     (chống spam = honeypot + rate-limit, R-13). Nút "Gửi liên hệ →".
  4. States giữ nguyên: Default / Validating / Submitting / Success / Error (+ rate-limit) — validate từng trường khi blur,
     tóm tắt lỗi có link tới trường, focus vào tóm tắt lỗi/tiêu đề thành công.
  5. **Responsive:** `< lg` xếp 1 cột: card thông tin → card form; không tràn ngang ở 390/375.
  6. **SEO:** JSON-LD `ContactPage` + `Organization` có `telephone`, `email`, `address` (PostalAddress) khớp mục 2.
  `[reverse-engineered from docs]` — nguồn gốc: `docs/BRD.md:108-110` (FR-070); thông tin liên hệ do user cung cấp 13/10/2026.
- `[cần xác nhận]` form gửi về đâu (`docs/BRD.md:176`) — hotline/email/địa chỉ đã chốt ở R-10 §2 (13/10/2026).

### Module 9 — Điều hướng & Footer

- **R-11:** Header nav (desktop ngang + mobile hamburger/drawer, sticky, active state) + Footer
  (4 cột desktop, pháp lý + social + liên hệ), hoạt động mọi breakpoint.
  Footer hiển thị SĐT (`tel:`), email (`mailto:`) và địa chỉ văn phòng giống R-10 §2 (1 nguồn dữ liệu dùng chung) — spec 3.6.0.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:113-115` (FR-080), `docs/DESIGN.md:147,219-223`
- **R-12:** Trang 404: NotFoundMessage + HomeLink (+ SearchHint nếu có).
  `[reverse-engineered from docs]` — nguồn: `docs/DESIGN.md:130-132`

## API Endpoints

Base URL: dev `http://localhost:3000/api` · prod `https://ntavietnam.tech/api` — `docs/API_SPEC.md:15-20`

- **R-13:** `POST /api/contact` — nhận form (name bắt buộc 2–100 ký tự, email bắt buộc, phone tuỳ chọn
  9–15 số, message bắt buộc 10–2000 ký tự, honeypot phải rỗng). Response: `200 {status:"ok"}` /
  `400 {status:"error",errors}` / `429 {status:"error",message}`.
  Spec 3.6.0 (CR-008): thêm field tuỳ chọn `company` (chuỗi ≤150 ký tự) và `need` (1 trong các key
  `crm|dentgo|lms|hrm|boxai|custom-ai|flycam|custom-software|other`); có gửi mà sai → 400 kèm `errors.company|need`.
  Hai field được chuyển tiếp sang `CONTACT_FORM_TARGET`. Mức bắt buộc riêng của form `/contact`
  (phone + need bắt buộc, message ≤500) kiểm ở client (R-10 §3); API giữ tuỳ chọn để form CTA rút gọn ở trang giải pháp
  (name/email/message) vẫn gửi được.
  `[reverse-engineered from docs]` — nguồn: `docs/API_SPEC.md:40-61`
  - `[cần xác nhận]` rate-limit threshold (request/window) chưa doc nào định nghĩa — `docs/API_SPEC.md:60`
- **R-14:** `GET /api/health` — `{status:"ok",timestamp}` cho health check / uptime (docker-vps).
  `[reverse-engineered from docs]` — nguồn: `docs/API_SPEC.md:63-67`
- **R-15:** Không dựng `GET /api/posts` hoặc `GET /api/case-studies` trong v1; nội dung được render từ file tĩnh trong repo.
  API danh sách động nằm ngoài phạm vi v1. Nguồn ban đầu: `docs/API_SPEC.md:30-31` (tùy chọn).
  _(4.2.0 — CR-031: vẫn **không** dựng API đọc nội dung công khai; nội dung đọc từ DB phía server khi render — xem R-16.)_
- **R-15a** _(4.2.0 — CR-031, đang triển khai; hiệu lực khi cutover phase 4 PASS)_: `POST /api/revalidate` — làm mới cache
  nội dung sau khi DB đổi (dùng cho bot CR-030 / CLI bảo trì). Bảo vệ bằng secret server-only `REVALIDATE_SECRET`
  (header `x-revalidate-secret`, so sánh constant-time; thiếu/sai → `401`, không lộ lý do chi tiết); body
  `{collection, slug?}` hoặc `{all: true}` (collection ∈ danh sách cố định, sai → `400`); thành công → `200 {status:"ok",revalidated:[...]}`.
  Không cache, không nhận GET. Nguồn: `spec/changes/2026-10-14-content-database.md` (acceptance "sửa DB → lên web không cần build lại").

## Database Schema

- **R-16:** ~~v1 **không có DB** — nội dung nằm ở file trong repo (MDX/JSON/TS), render SSG/SSR;~~
  _(4.2.0 — CR-031, đang triển khai; hiệu lực khi cutover phase 4 PASS)_ **Toàn bộ nội dung** website (blog, giải pháp,
  sản phẩm, case study, about, thẻ/trang danh sách, nội dung trang chủ, danh mục slug/thứ tự) lưu trong **PostgreSQL**;
  web đọc nội dung **chỉ từ DB** (file `src/content/**` giữ làm seed import ban đầu, **không còn là nguồn sự thật**).
  Mọi URL/slug vi + en giữ nguyên; mọi trang hiển thị **y hệt** trước khi chuyển. Sửa nội dung trong DB + gọi R-15a → trang
  cập nhật **không cần build/deploy lại**; slug mới thêm vào DB có route ngay (không phụ thuộc `generateStaticParams` lúc build).
  Phạm vi gồm cả **chữ giao diện** `src/i18n/messages/{vi,en}.json` (next-intl lấy messages từ DB) và **thông tin công ty**
  `company-info.ts` (vi + en) — user chốt 14/10/2026 (quyết định #9: bot sửa được mọi chữ trên web).
  Ảnh có sẵn `public/images` **giữ trong repo** (không chuyển); ảnh mới theo R-16d.
  Form liên hệ **forward** qua email/API bên thứ ba, **không lưu DB** (giữ nguyên).
  Hiệu năng/khả dụng: trang đã cache (route cache hoặc data cache) **không** truy vấn DB; ~~TTFB trang chủ (cache hit) không tệ hơn quá 20% so với trước~~
  → _(P3-T02, user chốt 14/10/2026)_ build image **không** cần DB nên trang vi (mặc định, `localePrefix: as-needed` → middleware rewrite) render theo request
  dựa trên data cache (Next 15.5 không cache ISR on-demand cho URL bị rewrite); TTFB đo local khi data cache hit **≤ 50 ms** (trước ~14 ms, sau ~35 ms);
  DB lỗi → trang đã cache vẫn phục vụ, trang chưa cache trả lỗi rõ (không cache trang rỗng) — tính vào mục tiêu ≥ 99.5% của R-27.
  Chuyển nguồn có cờ `CONTENT_SOURCE=file|db` trong giai đoạn chuyển tiếp; sau cutover bỏ cờ + đường đọc file.
  _(P3-T04, user chốt 14/10/2026)_ Ngoại lệ: **chữ giao diện** (`src/i18n/messages/{vi,en}.json`) và **thông tin công ty** (`COMPANY_CONTACT`) giữ lâu dài trong repo làm
  chuẩn cấu trúc + dự phòng — bản DB gộp sâu đè lên file; key có trong file mà DB thiếu → dùng giá trị file + log cảnh báo `[content-shape]`
  (deploy thêm key mới không làm sập trang); sai kiểu / chuỗi rỗng / mảng rỗng → lỗi rõ. Nội dung còn lại vẫn chỉ đọc từ DB sau cutover.
  `[reverse-engineered from docs]` (phần form) — nguồn: `docs/ERD.md:16-22,34`, `.context/project-config.md:40-41`
- **R-16a** _(4.2.0 — CR-031)_: **Lịch sử phiên bản nội dung** — mỗi lần tạo/sửa/xoá một bản ghi nội dung ghi 1 dòng
  bất biến vào bảng lịch sử (số version tăng dần, snapshot dữ liệu đầy đủ, thao tác create|update|delete, nguồn/tác nhân,
  thời điểm) **trong cùng transaction** với thay đổi; xoá là xoá mềm có lịch sử. Rollback = ghi lại snapshot của version cũ
  thành version mới (không sửa/xoá dòng lịch sử).
- **R-16d** _(4.2.0 — CR-031, quyết định #10)_: **Lưu trữ ảnh mới** (nền cho bot CR-030 gửi ảnh): ảnh lưu trên volume bền của VPS
  (ngoài image container, nằm trong backup cùng DB), URL ổn định `/uploads/<tên-theo-hash>.<ext>`, hiển thị được qua `next/image`
  **không cần build lại**; metadata + lịch sử ảnh ghi trong DB (collection `asset`, có version như R-16a). Hàm lưu ảnh chỉ nhận
  JPEG/PNG/WebP (kiểm magic bytes, **không** SVG), giới hạn dung lượng (mặc định ≤ 5 MB) và kích thước, tên file do server sinh,
  chống path traversal; đường phục vụ chỉ đọc trong thư mục upload. Sửa ảnh cũ = upload ảnh mới + đổi đường dẫn trong DB.
  Phần bot nhận ảnh từ Telegram thuộc CR-030.
- **R-16b** _(4.2.0 — CR-031)_: **Backup + khôi phục** — backup `pg_dump` + thư mục ảnh upload (R-16d) tự động hằng ngày (giữ tối thiểu 14 bản) +
  backup bắt buộc ngay trước mỗi lần chạy migration; có runbook khôi phục đã chạy thử (restore vào DB tạm + kiểm tra số bản ghi).
- **R-16c** _(4.2.0 — CR-031)_: **Migration** Drizzle versioned + committed, chạy thẳng lên **DB prod** (không có DB staging —
  user chấp nhận rủi ro 14/10/2026). Bù rủi ro: backup trước migration (R-16b); giai đoạn đầu chỉ migration **additive**;
  op destructive (DROP, đổi type, SET NOT NULL, UNIQUE/FK trên data cũ, enum phá hoại, bulk transform) gắn
  `HIGH_RISK_MIGRATION` và **chỉ chạy khi user duyệt rõ**; cấm `drizzle-kit push`, reset DB, xoá/ghi đè dữ liệu bằng seed.
  Import seed ban đầu là thao tác **1 lần, chỉ chèn (không ghi đè/xoá)**, chạy sau backup + user xác nhận.
  Thay cho "verify staging" của migration HIGH_RISK: restore backup mới nhất vào DB tạm rồi chạy thử migration ở đó trước khi chạy prod.
  - ⚠️ Conflict C2 (ghi nhận): `docs/BRD.md:52` ghi "lưu/forward" vs `docs/ERD.md:20-22` "chưa cần lưu DB"
    — spec theo ERD (không lưu DB); phụ thuộc Open Question #4 (form gửi về đâu).
- Entity ở mức khái niệm (_trước 4.2.0_ là file nội dung; _từ 4.2.0_ là bản ghi trong DB — chi tiết `docs/ERD.md`): Solution, Product, CaseStudy, Post,
  ContactSubmission (không lưu) — `docs/ERD.md:26-34`

## Authentication

- **R-17:** v1 **không có auth người dùng**. Roles: `VISITOR` (public, xem + gửi form) và `ADMIN`
  (quản trị — phase sau, ngoài scope v1).
  `[reverse-engineered from docs]` — nguồn: `docs/PERMISSION.md:6-13`, `docs/BRD.md:134-141`
- **R-18:** Guard order cho `POST /api/contact`: `rateLimit` → `validate(schema)` → `honeypot`
  (có giá trị → bot, trả 200 giả, không gửi) → handler. Các route còn lại public, không guard.
  `[reverse-engineered from docs]` — nguồn: `docs/PERMISSION.md:17-26`
- **R-19 (Security):** **HTTPS only** (enforce TLS toàn bộ, redirect HTTP→HTTPS) + không lộ secret ra
  client: biến `NEXT_PUBLIC_*` chỉ dùng cho giá trị công khai; secret ở Secret Manager / env server.
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:124`, `BRIEF.md:41`, `docs/PERMISSION.md:37-41`

## Non-functional Requirements

- **R-20 (i18n):** Song ngữ Việt/Anh — mặc định VI, toggle EN, route `/en/...`, hreflang + localized meta.
  `[reverse-engineered from docs]` — nguồn: `BRIEF.md:42`, `docs/BRD.md:51,130`
- **R-21 (SEO):** SSR/SSG, meta + OpenGraph per page, `sitemap.xml`, `robots.txt`, JSON-LD Organization;
  Lighthouse SEO ≥ 90. `[reverse-engineered from docs]` — nguồn: `BRIEF.md:38`, `docs/BRD.md:125,29`
- **R-22 (Performance):** LCP < 2.5s trên 4G; ảnh tối ưu (`next/image`), lazy-load, bundle gọn;
  Lighthouse Performance ≥ 90. `[reverse-engineered from docs]` — nguồn: `BRIEF.md:37`, `docs/BRD.md:123,28-29`
- **R-23 (Responsive):** Mobile-first, thang breakpoint Tailwind: base < 640px, sm 640, md 768,
  lg 1024, xl 1280, 2xl 1536; ưu tiên fluid (`clamp()`, `rem`, `%`); responsive behavior chi tiết
  từng screen ở `docs/DESIGN.md:181-223`. `[reverse-engineered from docs]`
  — nguồn: `BRIEF.md:39`, `docs/BRD.md:129`, `docs/DESIGN.md:162-181`, `.context/project-config.md:107`
  - ⚠️ Conflict C1 (ghi nhận, cần user chốt): 4 nguồn liệt kê 4 bộ breakpoint khác nhau
    (`docs/BRD.md:129` "375/768/1280/1536" · `BRIEF.md:39` "375/768/1280+" · `docs/DESIGN.md:166-173`
    thang Tailwind 6 bp · `.context/project-config.md:107` `[375,768,1280]`). Spec lấy DESIGN (Tailwind)
    làm authoritative vì khớp implementation; 375 ≈ base, 1280 ≈ xl.
- **R-24 (Accessibility):** WCAG 2.1 AA — contrast, keyboard nav, alt text, semantic HTML.
  `[reverse-engineered from docs]` — nguồn: `BRIEF.md:40`, `docs/BRD.md:128`
- **R-25 (Business rules):** BR-001 mọi trang có CTA/liên hệ ở footer; BR-002 validate email + SĐT
  hợp lệ trước khi gửi; BR-003 nội dung đúng 3 mảng, không trộn sản phẩm ngoài danh mục;
  BR-004 không công bố thông tin khách hàng/dự án chưa được phép (đặc biệt dự án nhà nước).
  `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:147-150`
- **R-26 (Content):** ít nhất 9 nhóm trang theo dàn ý; nội dung v1 dùng nội dung mẫu hợp lý
  (điền dần khi có nội dung thật). `[reverse-engineered from docs]` — nguồn: `docs/BRD.md:48,31,165`
- **Constraints (soft, không testable riêng):** Regulatory — chú ý bản quyền ảnh/nội dung
  (`docs/BRD.md:159`); Budget — VPS shared chi phí thấp (`docs/BRD.md:157`); Timeline — dựng khung +
  nội dung mẫu nhanh (`docs/BRD.md:158`).

## Scalability Profile (OPTIONAL — chỉ khi user bật Scalability Option)

- **Scalability Option:** off — nguồn: `skills/scalability-architecture/` (off → áp dụng mặc định)
- **Tier:** Standard — mặc định khi off (modular monolith + stateless; v1 không DB) —
  nguồn: `SPECIFICATIONS.md` dòng này + `docs/ERD.md:16-18`, `.context/project-config.md:40-41`
  (không có docs canonical nào chọn tier khác — không bật High Traffic/Enterprise)

## Deployment

- **R-27:** Deploy **docker-vps** — VPS `187.52.119.50` (shared; chỉ thêm container mới), Docker + nginx + certbot,
  container `nta-web` tại `127.0.0.1:3005` (host→container 8080); availability target ≥ 99.5% (đo uptime thực tế);
  domain `ntavietnam.tech` (live 2026-10-09 — HTTPS apex, không `www`; http→https 301); CI/CD GitHub Actions (self-hosted runner label `nta-web`).
  _(4.2.0 — CR-031)_ thêm container **`nta-db`** (PostgreSQL, volume riêng, **không** publish port ra internet; chỉ mạng nội bộ compose)
  + thư mục ảnh upload (bind mount host `/opt/nta-web-data/uploads`) mount vào `nta-web` (R-16d) + backup tự động (R-16b); deploy chạy theo thứ tự backup → migrate → chạy app; app không cần DB lúc build image.
  Secret server-only: `POSTGRES_PASSWORD` / `DATABASE_URL`, `REVALIDATE_SECRET` (không commit, không `NEXT_PUBLIC_*`).
  `[reverse-engineered from docs]` — nguồn: `BRIEF.md:43`, `docs/BRD.md:53,126,127,157`, `.context/project-config.md:51-59`, `docs/runbook/deploy-vps.md`
  - _(cập nhật 2026-10-09: domain `ntavietnam.tech` — change `domain-ntavietnam`; nền tảng deploy reconcile về **docker-vps** — change `deploy-platform-docker-vps` → đã hết drift)._
  - _(cập nhật 2026-10-13: **domain phụ** `ntasolution.vn` (+ `www`) phục vụ cùng app/nội dung — nginx vhost riêng
    (`deploy/nginx/ntasolution.vn.conf`) + cert Let's Encrypt apex+www, `www` → 301 apex của chính nó, `http` → 301 `https`;
    **KHÔNG** redirect sang `ntavietnam.tech` và ngược lại; canonical/`NEXT_PUBLIC_SITE_URL` giữ nguyên.
    Nguồn: user 13/10/2026 — change `add-domain-ntasolution`.)_

---

## `[cần xác nhận]` (Open Questions — chưa phải requirement chốt)

1. Logo NTA + brand color chính thức (`docs/BRD.md:173`) — hiện dùng palette neutral light tạm (`docs/BRD.md:166`).
2. ~~Hotline / email / địa chỉ thật (`docs/BRD.md:174`)~~ — ĐÃ CHỐT 13/10/2026 (R-10 §2, CR-008).
3. Danh sách sản phẩm & case study ưu tiên (`docs/BRD.md:175`).
4. Form liên hệ gửi về đâu — email / CRM / Google Sheet (`docs/BRD.md:176`) — giải quyết Conflict C2.
5. Blog có cần CMS thật hay trang tĩnh (`docs/BRD.md:177`).
6. Package manager + verify commands (`package_manager: none`, `.context/project-config.md:22`).

## Cross-doc conflicts (ghi nhận — chờ user resolve qua `/brainstorm`)

- **C1 (MEDIUM):** bộ breakpoint authoritative — xem R-23. → hỏi user ở brainstorm checkpoint.
- **C2 (MEDIUM):** form liên hệ "lưu" (BRD:52) vs "chỉ forward, không DB" (ERD:20-22) — phụ thuộc OQ#4.
- **C3 (LOW):** `BRIEF.md:50` stale (liệt domain/ngôn ngữ là "còn thiếu" trong khi `BRIEF.md:15-16` đã chốt).

---
*Generated by: /spec-init (reverse-engineer từ docs — repo chưa có app code)*
*Validated by: .agent/spec-validator.md (round 1: FAIL → sửa gap 1–6 → round 2)*
