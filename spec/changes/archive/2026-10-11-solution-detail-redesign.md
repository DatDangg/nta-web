# Change Request — Thiết kế lại trang chi tiết giải pháp (Screen 4)

> **Classification:** MODIFY (render infra + content layout + content)
> **Risk:** MEDIUM — đổi layout 4 trang đang publish trên prod, thêm primitive `Container`, breaking schema `features`.
> **Nguồn duy nhất:** `.context/design-spec-solution-detail.md` (942 dòng, đã duyệt 2026-11). Agent PHẢI đọc file này
> TRƯỚC khi code. Mọi quyết định layout/token/copy đều phải bám theo spec, không tự ý đổi.
> **Ảnh:** `public/images/solutions/v2/` (26 ảnh + 24 crop) — map tại `docs/screenshots-mapping.md`. Đã commit ở `a225bf9`.

---

## 0. Phạm vi

| Trong | Ngoài (KHÔNG đụng) |
|---|---|
| 4 trang `/solutions/enterprise/{crm,hrm,lms,dentgo}` × 2 locale | Header/Footer layout (chỉ dùng lại `Container`) |
| `types.ts` (thêm `Feature[]`, cờ `layout`) | Trang AI, blog, case study, contact |
| Component mới: `Container`, `SolutionHero`, `FeatureZigZag`, `FaqAccordion`, `BentoCompliance`, `AudienceCards`, `AiSection` | `next.config`, deploy, CI |
| Token mới (`--color-ink` + 5 token, `--accent-ink`, `--space-hero/section`) | `package.json` (không thêm dependency) |
| 8 file `.mdx` trong `src/content/solutions/{vi,en}/` | File `.mdx` ngoài `solutions/` |
| `HomeImage`, `Section`, `CTABanner`, `Header` (chuyển sang `Container`) | Nội dung `docs/reference/` |

---

## 1. Task breakdown

### T1 — Sửa 4 lỗi bố cục chung (template, mọi trang)

Spec §1. Mọi lỗi này **đã được user xác nhận** và áp cho **mọi trang**, không riêng Screen 4.

| Lỗi | File:line hiện tại | Fix |
|---|---|---|
| L1 grid 2 cột cột phải rỗng | `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:68` | Chọn layout theo dữ liệu: `relatedSolutions.length === 0` → không đặt `grid-cols`, dùng `<Container>` 1280 căn giữa |
| L2 Section lồng trong div 720px | `page.tsx:69` + các component `solutions/*` | Tạo `Container` primitive; `Section` full-width, chỉ content bên trong giới hạn rộng |
| L3 Header hardcode `max-w-[1280px]` | `src/components/layout/Header.tsx:48`, `CTABanner.tsx:18` | Mọi khối dùng `<Container>`; grep `max-w-[1280px]` phải ra **0** |
| L4 `HomeImage` hardcode 1200×720 | `src/components/shared/HomeImage.tsx:25,30` | Bỏ width/height cứng. Theo spec §3.1: `max-w`/`max-h` co cả 2 chiều, giữ tỉ lệ gốc |

**Ràng buộc L4 (quan trọng):** ảnh v2 có khung cửa sổ macOS vẽ sẵn. **KHÔNG** dùng `object-cover`,
**KHÔNG** đặt `aspect-[...]` cứng — sẽ cắt mất viền dưới hoặc 3 chấm macOS.

### T2 — Token + schema + component dùng chung

Spec §2, §3.1, §4.1.

- `globals.css` + `tailwind.config.ts`: thêm `--color-ink`, `--color-ink-surface`, `--color-ink-border`,
  `--color-ink-text`, `--color-ink-text-secondary`, `--color-accent-ink`, `--space-hero`, `--space-section`.
  **`--accent-ink` bắt buộc** (không dùng `--color-primary` #0071e3 trên nền #1d1d1f → contrast 3.4:1, dưới WCAG AA).
- `Section` thêm `variant="ink"`.
- `.shot-fade-bottom` utility (mask-image gradient, có `-webkit-` prefix).
- `types.ts`: `Feature = { title, description?, image?, imageAlt? }`, `Solution.features: Feature[]`,
  cờ `layout: 'default' | 'lms'`.
- **Bắt buộc có normalize ngược**: `features` dạng `string[]` (data cũ chưa migrate) vẫn render được
  → rollback an toàn nếu T3 lỗi.
- Component: `Container`, `SolutionHero`, `FeatureZigZag`, `FaqAccordion`, `BentoCompliance`,
  `AudienceCards`, `AiSection`.

### T3 — Migrate `features` 8 file `.mdx`

Spec §8.1. **Đã chốt với user.**

- CRM / HRM / DentGo: **chỉ tách chuỗi cũ thành `title` + `description`**, giữ nguyên câu chữ.
  Tách ở `—` nếu có, không thì `:`. Không thêm/bớt từ, không đổi viết hoa.
- LMS: dùng copy mới ở §11.2 (bản rút gọn user đã duyệt).
- **Verify bắt buộc:** build xong kiểm tra cả 4 trang render **đủ số tính năng như trước** — không mất, không gộp.

### T4 — CRM / HRM / DentGo dùng layout mới

Spec §3, §4, §7.

- Gắn ảnh theo `docs/screenshots-mapping.md` vào `features[].image`.
- **Alt riêng từng ảnh VI/EN** theo bảng §7 — alt mô tả giao diện đang làm gì, KHÔNG phải tên sản phẩm.
- **Chỉ HRM** có caption `<figcaption>` "Giao diện minh hoạ" / "Illustrative interface" **và** tiền tố
  trong alt. CRM/DentGo không caption, không tiền tố (ảnh chụp app thật).
- Hero dùng `01-tong-quan` cho cả 4 trang (tỉ lệ đã đo, xem bảng §3). Hero ảnh gần vuông (HRM, tỉ lệ 1.06)
  giới hạn `max-w-[960px]` căn giữa.

### T5 — LMS layout riêng

Spec §5. **Chạy được ngay — B1 + B2 đã đóng (xem §3).**

8 block theo thứ tự: hero → 4 features → bento pháp quy → AI nền tối → 3 thẻ "Dành cho ai"
→ FAQ accordion → CTA cuối full-width.

- Bỏ render: section ảnh cuối trang, `benefits`, `useCases`, `sections`, `screenshots`.
  **Giữ nguyên data trong `lms.mdx`, chỉ không render** (bật lại được sau).
- Bento: ô TT27 `lg:col-span-2 lg:row-span-2`, 2 ô nhỏ. Viền + nền, KHÔNG dùng cả shadow.
- AI section: `variant="ink"`, layout **2 cột bằng nhau** (`lg:grid-cols-2`).
  ~~Ảnh `04-danh-gia-ai-crop.png`~~ → **ĐÃ ĐỔI (spec §5.3, user chốt 2026-10-11): khung "Trợ lý
  nhận xét" dựng bằng DOM `AiAssistantPanel`** (crop tỉ lệ 4.31 không đọc được ở cột 608px,
  nền trắng lóa trên nền tối). Dùng `text-accent-ink` cho link/CTA.
- FAQ: `<details>`/`<summary>` native, marker là chevron SVG tự vẽ (`group-open:rotate-180`),
  KHÔNG dùng ký tự `+`/`−`. Tất cả đóng mặc định.
- Copy: bảng §11 (VI + EN). Chỉ 2 chỗ placeholder theo §3.

---

## 2. Rủi ro đã biết

| # | Rủi ro | Giảm thiểu |
|---|---|---|
| R1 | `features: string[]` → `Feature[]` là breaking change, ảnh hưởng `SolutionGridHome.tsx:26` + `ProductStrip.tsx:62` đang truyền `features: []` | Migrate cả 8 file trong 1 lần (đã chốt) + normalize ngược |
| R2 | 4 trang đang live trên prod, đổi layout = đổi nhìn trang | **KHÔNG deploy** — user duyệt screenshot trước (hard gate) |
| R3 | `HomeImage` bỏ width/height → `next/image` cảnh báo layout shift (CLS) | Dùng `fill` với khung co theo tỉ lệ đo sẵn, hoặc `<img>` thuần + `unoptimized`. **Chốt ở T2 sau khi thử** — ghi lại lý do vào task file |
| R4 | Ảnh CRM/LMS cao tới 3524px | `max-h-[640px]` co 2 chiều + `.shot-fade-bottom`. Nếu vẫn nặng → báo user, đề xuất chụp lại như DentGo |
| R5 | Bento `grid-rows-2` tràn khi nội dung dài | Ô dùng `content-start`, không set `h-full` cứng |
| R6 | Hero ảnh gần vuông (HRM 1.06) chiếm gần hết viewport | `max-w-[960px]` |

---

## 3. BLOCKER — ĐÃ ĐÓNG HẾT (2026-11)

| # | Nội dung | Trạng |
|---|---|---|
| B1 | Số hiệu thông tư đánh giá | ✅ **ĐÃ CHỐT** — TT **27/2020** (không phải 27/2018) · học bạ số TT **70/2026** ban hành 22/8/2026, hiệu lực 08/10/2026 (không phải 70/2025) · **bỏ "Điều 7.4"** ở mọi chỗ |
| B2 | Chi tiết "Cảnh báo sớm" | ✅ **ĐÃ ĐÓNG — BỎ HẲN.** User chốt bỏ gợi ý "Cảnh báo sớm" (nội dung mơ hồ, dễ bịa). Section AI chỉ còn **3 gợi ý** (gợi ý nhận xét · tóm tắt biên bản · soạn thông báo); đã xoá khỏi FAQ 4 câu VI/EN. Không nhắc "cảnh báo sớm" ở bất kỳ đâu trong layout LMS. |

**Không còn blocker.** T1–T5 chạy được ngay — không chờ gì thêm.

---

## 4. Acceptance criteria

**Verify chung (mọi task):** lint · typecheck · build PASS (không warning mới) · 8 route enterprise SSG render.

**T1:**
- [ ] grep `max-w-\[1280px\]` = 0 kết quả
- [ ] Không còn `xl:max-w-[720px]` bọc ngoài `Section`
- [ ] Trang enterprise có và không có `relatedSolutions` đều căn giữa đúng, không lệch trái
- [ ] Nền section `background-alt` tràn full-width ở cả 4 trang
- [ ] Ảnh không méo: so kích thước render với tỉ lệ gốc trong `docs/screenshots-mapping.md` (±2%)

**T2:**
- [ ] `Container` là nguồn duy nhất cho giới hạn bề rộng
- [ ] Contrast section `ink`: axe trả 0 vi phạm; `text-accent-ink` ≥ 4.5:1
- [ ] `features` dạng `string[]` vẫn render (test bằng data cũ chưa migrate)
- [ ] Touch target ≥ 44×44px

**T3:**
- [ ] **4 trang render đủ số tính năng như trước migrate** (so sánh trước/sau)
- [ ] Câu chữ CRM/HRM/DentGo giống hệt bản gốc, chỉ tách `title`/`description`

**T4:**
- [ ] Mỗi ảnh có alt riêng VI/EN khớp bảng §7
- [ ] Chỉ HRM có caption "Giao diện minh hoạ" / "Illustrative interface"
- [ ] Feature không có ảnh vẫn hiển thị đúng (full-width, căn trái)
- [ ] Hero ảnh không bị cắt (kiểm: 3 chấm macOS + viền dưới còn đủ)

**T5:**
- [ ] 8 section đúng thứ tự, đúng nền
- [ ] Bento ô lớn chiếm 2/3, 2 ô nhỏ cột phải
- [ ] Section AI nền tối, chữ đạt contrast, ảnh crop đọc rõ
- [ ] FAQ accordion mở/đóng bằng bàn phím
- [ ] Copy VI/EN khớp bảng §11 (không còn placeholder/blocker nào)
- [ ] `lms.mdx` vẫn còn `benefits`/`useCases`/`sections`/`screenshots` trong data

**Chung:**
- [ ] Không có em-dash trong copy mới, không eyebrow, không số thứ tự section
- [ ] `prefers-reduced-motion` vẫn hoạt động
- [ ] Không có horizontal overflow ở 375 / 768 / 1280 / 1440px

---

## 5. Quy trình

1. T1 → T2 → T3 → T4 chạy tuần tự, **mỗi task 1 commit**.
2. Reviewer STRICT cho T1 (template, blast radius rộng) · T2 (schema) · T5 (nhiều section mới).
   NORMAL cho T3, T4.
3. Sau T4: **chụp 4 trang ở 375px + 1440px gửi user duyệt.**
4. **KHÔNG push, KHÔNG deploy.** Chỉ khi user nói OK.
5. T5 chạy được ngay — B1 + B2 đã đóng (xem §3).

> `spec_version` 3.0.0 KHÔNG bump (không đổi requirement R-05/R-06, chỉ đổi cách hiển thị).
> `spec/test-scope/current.json` bump scope v10 → v11.