# Run Journal — change solution-detail-redesign · T5 (LMS layout 8 block)

- workItem: feature/nta-website · change: spec/changes/2026-10-11-solution-detail-redesign.md
- Gate: B1/B2 đã đóng · T3 committed 055e9b5 · T4 committed 0f3cb5a · chạy liên tục → review →
  publish scope v11 → close-out → contact sheet 4 trang (375+1440) + báo cáo tổng. KHÔNG push/deploy.

## step: T5 — LMS layout riêng (spec §5 + copy §11) — status=running
- filesTouched (dự kiến): `src/app/[locale]/solutions/enterprise/[slug]/page.tsx`
  (thay nhánh legacy bằng 8 block), `src/content/solutions/{vi,en}/lms.mdx`
  (gắn ảnh features + possibly hero/desc/title theo §11.1/§11.8), có thể components nhỏ.
- 8 block (đúng thứ tự §5): SolutionHero → 4 features (3 zigzag + 1 FeatureImageRow 3 ảnh) →
  bento A (ảnh 04-tt27-crop, user đã chốt phương án A) → AiSection ink (DOM panel, 3 gợi ý §11.4) →
  AudienceCards §11.5 → FaqAccordion §11.6 (4 câu) → CTA cuối §11.7 (1 nút) → CTAForm (giữ nguyên).
- BỎ render: benefits/useCases/sections/screenshots/faq-list — GIỮ data trong mdx (R2).
- Xoá hẳn nhánh legacy + bridge `title — description` (đóng MINOR #1 T3 + #1 T4).
- Copy nguồn: spec §11 (đã duyệt, B2 đóng — 3 gợi ý, không "cảnh báo sớm").
- next: code → verify → reviewer STRICT (change §5) → commit T5

## step: T5 code + verify — status=awaiting (code xong, chờ review)
### filesTouched
- `src/content/types.ts` — +4 field LMS: `compliance` / `aiSection` (panel) / `audience` / `cta`
- `src/content/solutions/{vi,en}/lms.mdx`:
  - VI: desc → §11.1 · heroShot 01 (alt §7, ratio 1.396) · features gắn ảnh 02/03/04 + F4 ảnh 05
    + extraImages 06/07 (alt §7, ratio đo) · screenshots → `[]` · FAQ → §11.6 (4 câu, câu 4
    sạch "cảnh báo sớm") · +4 block fields §11.3–§11.7
  - EN: title → **"School Management (LMS)"** (§11.8) · desc §11.1 EN · FAQ §11.6 EN · blocks EN
  - GIỮ data benefits/useCases/sections (R2) — không render (comment ghi rõ)
  - **Reconcile §11**: bento title dùng ":" thay em-dash (§11.8 cấm em-dash, khớp preview đã
    verify) + sửa typo spec "địết" → "định kỳ"
- `src/app/[locale]/solutions/enterprise/[slug]/page.tsx` — **xóa hẳn nhánh legacy**
  (PageHeader/FeatureList/bridge `title — description` → đóng MINOR #1 T3 + #1 T4);
  early-return LMS 8 block đúng thứ tự §5; helper `LmsCtaBlock` (§5.6: bg-background, 1 nút,
  full-width mobile, đặt trước CTAForm)
### Verify
- lint 0 errors (1 pre-existing warning) · typecheck PASS · build PASS 51/51
- `verify-t5.mjs` → **39/39 PASS**: thứ tự 5 block cuối theo heading DOM (2 locale; bracket
  i18n bundle nhúng + escape `&#x27;` gây false positive đầu → đã fix check), nền bento=alt/
  AI=ink, bento A (không figure B), 3 gợi ý + 0 "cảnh báo sớm"/"early warning", FAQ §11.6
  (FAQ cũ biến mất), desc/H1 §11.1/§11.8, 7 ảnh v2 + alt §7, benefits/useCases/sections
  KHÔNG render (data giữ trong mdx), 3 trang kia + trang AI không vỡ
- Soi mắt LMS 1440 (`solutions-enterprise-lms-vi-1440.png` 1440×7895, audit 8/8): hero §11.1 +
  2 CTA ✓ · zigzag 3 feature (ảnh 0.805 clip+fade) ✓ · FeatureImageRow 3 ảnh 1 hàng căn đỉnh ✓ ·
  bento A 2/3 + ":" ✓ · AI ink 3 gợi ý + panel DOM ✓ · 3 thẻ ✓ · FAQ 4 câu đóng ✓ · CTA cuối ✓
- next: reviewer STRICT → commit T5

## step: T5 close-out + spec publish v11 + contact sheet — status=awaiting ✅ DONE
- **Commit T5 = 54bd7cb** (10 files).
- **★ Spec Publisher scope v11**: `spec/updates/2026-10-11-solution-detail-redesign.md` (mới) +
  `spec/CHANGELOG.md` +1 dòng (3.0.0 KHÔNG bump, scope v11 `feature-update`) +
  `spec/test-scope/current.json` v10→v11. JSON valid ✓.
- **Archive change**: `spec/changes/2026-10-11-…` → `spec/changes/archive/…` (git mv) +
  progress.json 5 chỗ trỏ archive ✓.
- **progress.json**: +3 task entries (T3 NORMAL/T4 NORMAL/T5 STRICT PASS), completedTasks +3,
  specPublished scopeVersion 11, JSON valid ✓.
- **Contact sheet 4 trang × 375+1440 × VI+EN = 16/16 ảnh, pixel audit sạch** (trên production
  standalone build, KHÔNG dev):
  - `scripts/screenshots/.tmp/contact-sheet-vi.png` (7548×10841)
  - `scripts/screenshots/.tmp/contact-sheet-en.png` (7548×10958)
- **Overflow probe**: 10/10 tổ hợp (4 route VI + LMS EN × 375/1440) = 0px ✓
  (`scripts/screenshots/.tmp/probe-overflow.mjs`).
- **Sự cố môi trường đã fix (ghi để không lặp)**:
  1. Dev server sống trong khi `npm run build` ghi `.next` → cache corrupt → 500 lang rỗng
     (2 lần). Fix: kill hết process 3001/3002/3003 → `Remove-Item .next` → build sạch →
     chạy production. **Quy tắc: không build khi dev server đang sống.**
  2. `next start` warn `output: standalone` → dùng `node .next/standalone/server.js`
     + copy `.next/static` + `public` vào standalone (Next không copy tự động `public`).
  3. `localhost` resolve IPv6 ::1, server bind IPv4 → timeout (không phải ECONNREFUSED).
     Fix: `contact-sheet.mjs` BASE + cookie domain → `127.0.0.1`.
  4. PowerShell làm hỏng UTF-8 khi echo → verify script viết bằng Node file (không `node -e`).
