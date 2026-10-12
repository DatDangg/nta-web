# Run Journal — change solution-detail-redesign · T6 (theo yêu cầu user sau khi duyệt)

- Trigger: user xem 4 trang ở `127.0.0.1:3000` (server production standalone, giữ chạy) + 4 yêu cầu.
- Gate: reconcile copy (§11 `:` + "định kỳ") — user **ĐỒNG Ý** ✅.
- Push: **CHƯA push**. Khi user duyệt → push nhánh `redesign/solution-detail` (Vercel preview), KHÔNG push main.

## step: T6 — status=awaiting ✅ DONE (code + verify + review PASS)

### A. CRM/DentGo F1 dùng crop — ĐÃ LÀM (file crop CÓ SẴN)
- CRM `v2/crm/01-tong-quan-crop.png` 2111×322 ratio **6.556** → dải 4 thẻ "HÔM NAY".
- DentGo `v2/dentgo/01-tong-quan-crop.png` 2056×600 ratio **3.427** → 6 thẻ chỉ số ca làm.
- Gắn `features[0].image` + `imageAlt` **riêng VI/EN** (mô tả giao diện, KHÔNG số liệu cứng) + `ratio`.
- Ảnh hero đầy đủ **chỉ còn 1 lần/trang** (đếm theo đường dẫn đầy đủ — `next/image` srcset dùng
  `/_next/image?url=%2F…` nên regex thường đếm trùng → false fail lần đầu).
- **Soi mắt**: 1440 CRM ~93px, DentGo ~177px → đẹp. **375**: CRM ~52px (số chính đọc được, nhãn nhỏ),
  DentGo ~100px (đọc tốt). Đã báo user — chờ quyết định có cần giới hạn bề rộng riêng cho CRM.

### B. Fix CTA link — ĐÃ LÀM (phát hiện khi trả lời câu 4 của user)
- `localizedPath()` trả URL tuyệt đối → nút demo trỏ `https://ntavietnam.tech/contact`; trên Vercel
  preview bấm sẽ nhảy domain production. Fix: `Link` next-intl + href tương đối `/contact`.
- `SolutionHero.tsx`: `<a>` → `<Link>` (+ doc comment). `enterprise/[slug]/page.tsx`: `primaryCta.href='/contact'`,
  `LmsCtaBlock` dùng `Link` + bỏ prop `locale`, import `Link`. `dev/components/page.tsx`: 2 CTA +
  2 breadcrumb bỏ tiền tố thủ công (sửa luôn MINOR-1: breadcrumb → `/en/en/solutions` ở EN).
- `localizedPath` **vẫn giữ** cho `canonical`/metadata (đúng chỗ).

### C. Trả lời câu hỏi user #4
- Form "Nhận tư vấn" (`CTAForm`: name · email · message + honeypot) **CÒN trên cả 4 trang enterprise**,
  kể cả LMS (đặt dưới CTA cuối). Verify HTTP: `<form>` có ở 4/4 trang.
- Nút "Đăng ký demo": hero mọi trang + CTA cuối LMS → `/contact` (VI) · `/en/contact` (EN).

### Verify
- `npm.cmd run lint` → 0 errors (1 warning pre-existing) · `typecheck` PASS · `build` **51/51, exit 0**.
- `verify-t6.mjs` → **22/22 PASS** (HTTP production) · `verify-t5.mjs` → **39/39 PASS** (LMS không regression).
- Reviewer **NORMAL PASS** — 0 CRITICAL/MAJOR, 3 MINOR (`…-task-06-round-1-review.md`):
  MINOR-1 breadcrumb double prefix → **đã sửa** · MINOR-2 crop CRM ở 375 nhỏ → báo user ·
  MINOR-3 alt hero (ngoài scope T6) → task riêng nếu user muốn.

### Sự cố môi trường (bổ sung quy tắc — đã mắc 2 lần)
5. **Production server giữ file trong `.next` → xóa `.next` khi server còn sống làm build TREO**
   (Windows file lock). Quy tắc: **kill mọi node process (dev + start/standalone) → xóa `.next` →
   build → copy `static`+`public` vào `standalone` → start lại.**
6. Copy thủ công vào `.next/standalone` rồi build lại (không xóa `.next`) → Next fail
   `ENOENT copyfile routes-manifest.json` / `Invariant: no direct app page entry found for /_not-found`.
   → Luôn **xóa `.next` trước khi build** (không build đè lên `standalone` đã pollute).


### A. CRM/DentGo F1 gắn `01-tong-quan-crop.png` (user yêu cầu)
- File có sẵn: `public/images/solutions/v2/crm/01-tong-quan-crop.png` (2111×322, ratio **6.556**)
  · `dentgo/01-tong-quan-crop.png` (2056×600, ratio **3.427**).
- Rủi ro thị giác: ratio 6.56 ở cột ~608px → cao ~93px (dải mỏng). Gắn + **soi mắt** rồi báo user.
- Alt VI/EN riêng, mô tả vùng phóng to (không lặp alt hero).

### B. Fix CTA link (phát hiện khi trả lời câu 4 của user)
- `localizedPath()` trả **absolute URL** (`https://ntavietnam.tech/contact`) → dùng cho **nút bấm**
  sai: trên Vercel preview bấm sẽ nhảy domain production.
- Fix: nút dùng `Link` của `@/i18n/navigation` + href tương đối `/contact` (tự prefix locale, prefetch).
- Files: `SolutionHero.tsx`, `enterprise/[slug]/page.tsx` (primaryCta + `LmsCtaBlock`), `dev/components/page.tsx` (preview).

### C. Báo cáo (không sửa code — chờ user duyệt)
- 4 tiêu đề tính năng EN của LMS hiện tại.
- Form "Nhận tư vấn" (`CTAForm`): CÒN trên cả 4 trang enterprise (name/email/message + honeypot) — verify qua HTTP.

## Verify đã chạy (trước T6)
- `check-cta.mjs` (HTTP `127.0.0.1:3000`): form CÓ ở cả 4 trang; nút demo → `https://ntavietnam.tech/contact` (→ fix B).
- Lưu ý môi trường: `.next/server/app/{vi,en}` **mất prerender HTML** sau khi start standalone
  (chỉ còn `[locale]`) — server vẫn trả 200 đúng nội dung mới. Verify dùng **HTTP** thay vì đọc file `.next`.
