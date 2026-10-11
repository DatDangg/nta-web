# Run Journal — change solution-detail-redesign · T3→T5 marathon (cont)

## step: T3 — migrate `features` 8 file .mdx — status=awaiting ✅ DONE (code+verify)

### filesTouched
- `src/content/solutions/vi/crm.mdx` · `en/crm.mdx` — 4 features split title/description (tách ở `—`)
- `src/content/solutions/vi/hrm.mdx` · `en/hrm.mdx` — 3 features không có `—`/`:` → chỉ `title`
- `src/content/solutions/vi/dentgo.mdx` · `en/dentgo.mdx` — 4 features split tại `—`
- `src/content/solutions/vi/lms.mdx` · `en/lms.mdx` — copy §11.2 (VI title §5.1 + desc §11.2; EN title giữ
  nguyên — spec không có bảng EN title riêng, chỉ §11.2 desc; ghi nhận là quyết định)
- `src/app/[locale]/solutions/enterprise/[slug]/page.tsx:81` — map features ghép lại
  `title — description` cho FeatureList (mặc định map `f.title` sẽ làm MẤT description trong
  khoảng T3→T4 khi trang chưa chuyển layout mới). Text render lại = chuỗi gốc y hệt.

### Verify
- `npm run lint` → 0 errors (1 warning pre-existing mdx `<img>` ngoài scope)
- `npm run typecheck` → PASS
- `npm run build` → PASS 51/51, 8 route enterprise SSG
- `scripts/screenshots/.tmp/verify-t3.mjs` → 8/8 route đủ title (crm 4 · hrm 3 · dentgo 4 · lms 4 × VI/EN)
  + LMS desc §11.2.1 VI + §11.2.4 EN render trong HTML
- soi HTML crm VI: `<span>Tổng quan vận hành hằng ngày — màn hình chào…</span>` = chuỗi gốc trước migrate

### Quyết định
- CRM/HRM/DentGo: GIỮ NGUYÊN câu chữ, split tại `—` (rule §8.1). HRM không có dấu tách → title-only.
- LMS: dùng copy §11.2 đã duyệt (không theo rule split).
- acceptance T3 "câu chữ giống hệt bản gốc" ✓ (render lại bằng cách nối `title — description`).

---

## step: T3 review (NORMAL) — status=awaiting ✅ DONE
- Report: `.context/review-reports/change-solution-detail-redesign-phase-1-task-03-round-1-review.md`
- **Verdict PASS** — 0 CRITICAL/MAJOR, 6 MINOR (follow-up T4–T5 + commit hygiene).
- Verify của reviewer bị env block (ExecutionPolicy npm.ps1 + allowlist) → primary đã chạy
  lint/typecheck/build + verify-t3.mjs TRƯỚC review (PASS) → residual covered.
- MINOR đã ghi nhận: #1 bridge `title — description` T4 BẮT BUỘC revert · #2 lms.mdx thiếu
  `layout: 'lms'` (T5) · #3 EN title LMS giữ bản cũ (spec không có bảng EN) · #4 desc chữ thường
  đúng rule §8.1 (mâu thuẫn ví dụ trong spec — theo rule table) · #5 commit đúng 9 file T3 · #6 thiếu task file.

---

## step: T4 — CRM/HRM/DentGo layout mới — status=running (code xong, verify)

### filesTouched (T4)
- `src/content/types.ts` — thêm `HeroShot` + `solution.heroShot` + `solution.imageCaption` +
  `screenshots` nhận `(string | {src, alt, ratio})[]`
- `src/components/solutions/SolutionHero.tsx` — prop `caption` → `<figure>/<figcaption>`
  (figure + `mx-auto` — max-w-960 không mx-auto sẽ dính mép trái Container)
- `src/components/solutions/FeatureZigZag.tsx` — prop `id` (anchor #features) + `caption`
  (figcaption mỗi ảnh)
- `src/components/solutions/ScreenshotSection.tsx` — nhận item object alt/ratio + `caption` +
  `shotFrame` (ShotImage khung v2). AI pages KHÔNG truyền → giữ nguyên HomeImage cũ.
- `src/components/cards/SolutionCard.tsx` — normalize screenshots[0] (string | object)
- `src/app/[locale]/solutions/enterprise/[slug]/page.tsx` — branch `useLegacyLayout =
  solution.layout === 'lms'`: legacy = PageHeader + FeatureList (bridge title—desc giữ cho LMS
  tới T5); mới = SolutionHero + FeatureZigZag(id=features, caption) + ScreenshotSection(shotFrame)
- `src/i18n/messages/{vi,en}.json` — +3 key `solutions.enterprise`: demoCta / featuresCta / featuresCtaAria
- 6 mdx crm/hrm/dentgo (vi+en): `heroShot` (01-tong-quan, ratio) + features gắn image/imageAlt/ratio
  + `screenshots` → v2 ảnh chưa gắn + HRM `imageCaption`
- 2 mdx lms (vi+en): `layout: lms` (T5 dùng)

### Quyết định (ghi để reviewer đối chiếu)
1. **F1 overview của CRM/DentGo KHÔNG gắn ảnh** — 01-tong-quan đã là hero, không lặp lại
   (nguyên tắc §5.1 "ảnh đã dùng ở hero → không lặp"). Feature không ảnh = case §4.3.
2. **screenshots = ảnh v2 CHƯA gắn** (rule §5 "screenshots giữ ảnh chưa gắn vào đâu"):
   CRM [02] · DentGo [02] · HRM [03,04,05,06,07]. Alt theo bảng §7 + ratio đo.
   Tránh trộn khung ảnh cũ (tự do) với v2 (khung macOS) trên cùng trang.
3. **F2 CRM → 03** (alt khớp title "Hồ sơ 360°"); **F2 DentGo → 03** (desc "mở ra là hồ sơ
   lâm sàng…" khớp alt 03); HRM F1/F2/F3 → 02/08/09 (08 = case B dọc 0.719).
4. **EN title LMS giữ nguyên** (spec không có bảng EN title — MINOR #3 review T3).
5. `layout: 'lms'` set ngay ở T4 để page branch được; T5 code nhánh mới.
6. Bridge `title — description` CHỈ còn ở nhánh legacy (LMS) — revert hẳn ở T5 (MINOR #1).

### Verify
- lint 0 errors (1 warning pre-existing) · typecheck PASS · build PASS 51/51 (8 route enterprise SSG)
- `scripts/screenshots/.tmp/verify-t4.mjs` → **36/36 PASS**: hero v2, id=features, alt §7
  (HRM 18× "Giao diện minh hoạ"), figcaption HRM cả VI/EN, CRM/DentGo không caption,
  max-w-960 HRM, LMS giữ legacy, 0 ảnh screenshot cũ, file v2 tồn tại.
- Fix 2 lỗi khi code: ternary thiếu `)` (parse error) + `SolutionCard` chưa normalize union.
- Dev server 3002: CRM chụp OK 5/5; HRM 500 (dev cache stale — production build HRM PASS)
  → kill dev server cũ (PID 23588, chạy từ 23:15 đêm qua) → restart. Chờ boot rồi chụp lại 3 trang.
- next: chụp 3 trang 1440 soi mắt → reviewer NORMAL → commit T4
