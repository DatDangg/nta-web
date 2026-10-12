# 2026-10-12 — Thay ảnh placeholder ở thẻ giải pháp bằng ảnh giao diện thật

- **Class:** MODIFY (render ảnh trong thẻ) + ADDITIVE (2 field mới trong `Solution`)
- **Risk:** MEDIUM — `SolutionCard` + `cardImageClass` dùng chung với 3 component khác
- **Trạng thái:** Khảo sát xong · **CHỜ user duyệt danh sách trước khi code**
- **Nhánh:** `redesign/solution-detail` (chưa push, chưa deploy)

## 1. Vấn đề

Thẻ giải pháp dùng **ảnh placeholder SVG** (khung xám + nhãn chữ), không phải ảnh giao diện thật:

- `/solutions/enterprise` — 4 thẻ: CRM · HRM · LMS · DentGo → `crm.svg` `hrm.svg` `lms.svg` `dentgo.svg`
- Bản EN hiện **chữ tiếng Việt bên trong ảnh** ("Quản trị khách hàng", "Đào tạo trực tuyến", "Quản lý phòng khám"…)
  vì 8 file `.svg` dùng chung cho cả 2 locale.
- `alt` thì **đã đúng ngôn ngữ** ở cả 2 bản (quét 8 trang EN: không có alt tiếng Việt nào).

Bộ ảnh v2 đã có (`public/images/solutions/v2/<slug>/01-tong-quan.png`) và đã dùng làm ảnh hero ở
trang chi tiết — nhưng **chưa dùng ở thẻ**.

## 2. Khảo sát (đủ, không cần grep thêm)

| Nơi render | Component | Ảnh hiện tại | Ghi chú |
|---|---|---|---|
| `/solutions/enterprise` (VI+EN) | `SolutionCard` → `solution.image` | `crm/hrm/lms/dentgo.svg` | 4 thẻ enterprise — **có ảnh v2** |
| `/solutions/ai` (VI+EN) | `SolutionCard` → `solution.image` | `boxai/flycam/custom-ai.svg` | 3 thẻ AI — **không có ảnh v2** |
| Trang chủ `solutionCards` (VI+EN) | `SolutionGridHome` → `SolutionCard` (`imageSrc` từ `src/content/home.ts`) | `enterprise.svg` `ai.svg` `apps.svg` | 3 thẻ nhóm — **không có ảnh v2** |
| `RelatedSolutions` | `RelatedSolutions.tsx` | **không có ảnh** — chỉ `<Link>` chữ | không cần sửa |
| Menu `Header` / `MobileNav` / `Footer` | — | **không có ảnh** | không cần sửa |
| OG / Twitter | `app/[locale]/layout.tsx` | `/images/og-default.png` | **không** dùng `solution.image` → field `image` không phục vụ OG |
| JSON-LD | `lib/seo/jsonld.ts` | không nhúng `solution.image` | không cần sửa |
| Sitemap | — | không có `images` | không cần sửa |

**Field `image` trong `.mdx` chỉ dùng cho thẻ** → có thể thêm field mới `cardImage` mà không đụng OG.

### Component dùng chung — ảnh hưởng khi đổi

`cardStyles.ts` export `cardImageClass` (`aspect-[16/10] … object-cover`) dùng ở **4 component**:

| Component | Trang | Có thuộc phạm vi? |
|---|---|---|
| `SolutionCard` | `/solutions/enterprise`, `/solutions/ai`, trang chủ | ✅ có |
| `AppCard` | `/products` | ❌ không (ảnh sản phẩm, tỉ lệ riêng) |
| `ProductCard` | `/products` | ❌ không |
| `CaseStudyCard` | trang chủ + `/case-studies` | ❌ không |

→ **Phải tách class riêng cho `SolutionCard`**, không sửa `cardImageClass` dùng chung.

## 3. Yêu cầu của user (đã chốt)

1. **Ảnh**: mặc định dùng `01-tong-quan.png` của từng sản phẩm (cùng ảnh hero trang chi tiết).
   Thêm field riêng trong `.mdx` (`cardImage` + `cardImageAlt` VI/EN), **không đè `image`** (OG).
2. **Cách hiển thị**: khung tỉ lệ cố định (16/10) · ảnh `w-full h-auto` **bám mép trên** ·
   phần dư ở đáy `overflow-hidden` + `.shot-fade-bottom` (đã có sẵn) ·
   **tuyệt đối không cắt 2 bên, không `object-cover`** (không mất thanh tiêu đề / 3 chấm macOS) ·
   nền khung đồng bộ thẻ hiện tại · ảnh HRM gần vuông vẫn phải trông đều với 3 thẻ còn lại
   (thẻ cao đều nhau trong lưới).
3. **HRM là giao diện minh hoạ** → `cardImageAlt` có tiền tố `"Giao diện minh hoạ —"` /
   `"Illustrative interface —"` (rule §7). Không caption trong thẻ.
4. **Giải pháp không có ảnh thật** (3 thẻ AI + 3 thẻ trang chủ) → **giữ placeholder**, nhưng
   **nhãn đúng ngôn ngữ** → phải bỏ chữ tiếng Việt trong `.svg` (8 file SVG dùng chung 2 locale).
5. **Verify**: `check-left-align` + mọi `<img>` `naturalWidth > 0` + overflow 0 ở **375/1440/1920**,
   VI + EN. Chụp `/solutions/enterprise` + thẻ giải pháp trang chủ (VI+EN, 375+1440).
6. Commit trên nhánh `redesign/solution-detail`. **CHƯA push, CHƯA deploy.**

## 4. Acceptance

- [ ] 4 thẻ enterprise dùng ảnh v2 `01-tong-quan`, **không cắt 2 bên** (khung macOS + tiêu đề còn đủ)
- [ ] Thẻ cao đều nhau trong lưới (4 thẻ enterprise có 4 tỉ lệ ảnh khác nhau: CRM 1.396 · HRM 1.065 · LMS 1.396 · DentGo 1.396)
- [ ] Ảnh bám mép trên khung; phần dư đáy có fade
- [ ] `cardImageAlt` HRM có tiền tố "Giao diện minh hoạ —" / "Illustrative interface —"; 3 thẻ kia theo §7
- [ ] Field `image` (OG) **không bị đổi**
- [ ] 6 thẻ placeholder giữ nguyên chỗ, **không còn chữ tiếng Việt trong ảnh** ở bản EN
- [ ] `AppCard` / `ProductCard` / `CaseStudyCard` / `RelatedSolutions` không đổi
- [ ] `naturalWidth > 0` mọi `<img>` + overflow 0 ở 375/1440/1920 × VI/EN
- [ ] lint · typecheck · build PASS; reviewer PASS
- [ ] Chụp `/solutions/enterprise` + thẻ trang chủ (VI+EN, 375+1440) gửi user duyệt

## 5. Task breakdown (dự kiến)

- **T8** — survey (đã xong, phần này) → **checkpoint user duyệt danh sách**
- **T9** — schema `cardImage`/`cardImageAlt` + `cardImageRatio` + gắn 4 mdx enterprise (VI/EN) + tách class riêng `SolutionCard` (khung 16/10, bám trên, fade đáy, không cover)
- **T10** — 8 file `.svg` placeholder: bỏ chữ tiếng Việt (thay bằng bản không chữ hoặc nhãn theo locale) — **cần chốt cách làm**
- Verify + reviewer + commit từng task

> ⚠ **Cần user chốt trước khi code T9/T10:**
> 1. `/solutions/ai` (3 thẻ) + trang chủ (3 thẻ) — giữ placeholder SVG hay **bỏ hẳn ảnh** (chỉ chữ)?
> 2. Xử lý chữ tiếng Việt trong SVG: (a) vẽ lại SVG không chữ, (b) tách 2 bộ `.svg` theo locale (vi/en), hay (c) giữ nguyên?
> 3. Ảnh HRM gần vuông (1.065) trong khung 16/10: chấp nhận phần dư lớn + fade, hay giới hạn `max-w` riêng cho HRM?
