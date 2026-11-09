# feature-add-japanese-locale · phase-2-task-01 — `src/i18n/messages/ja.json` đủ key + test parity key vi/en/ja

- **CR:** CR-044 · change doc `spec/changes/2026-11-09-add-japanese-locale.md` · spec R-20a (4.12.0) · test-scope v62
- **Quyết định user (2026-11-09, không hỏi lại):** OQ-1 fallback **en** · OQ-2 dev dịch `ja.json` · OQ-3 AI news sinh cả ja · OQ-4 VI · EN · JA 3 nút liền.
- **Classification / Risk:** ADDITIVE · LOW–MEDIUM (messages dùng chung mọi trang; chưa được route dùng tới P2-T02)
  - Expected review level: **NORMAL**
  - Blast radius: `src/i18n/messages/ja.json` (mới) + 1 test parity (vd `src/i18n/messages.test.ts`). Không đổi vi/en.json (lệch key vi↔en → ghi lại, không tự sửa).
  - Doc impact: no doc impact (DESIGN ghi ở P3-T02).
- **Deps:** không (đề xuất chạy sau P1-T01).

## Scope
1. Dịch `en.json` → `ja.json` (tiếng Nhật business, です/ます; giữ placeholder ICU `{count}`, `{date}`…, rich-text tag, URL, tên riêng NTA/sản phẩm, số liệu).
2. Cấu trúc/kiểu y hệt `en.json` (cùng key, mảng cùng độ dài, không chuỗi rỗng — R-16 coi rỗng là lỗi ở chế độ db).
3. Test: tập key đệ quy (gồm index mảng) vi = en = ja; kiểu lá khớp; placeholder ICU giống en.

## Acceptance
- ja.json đủ key như en.json; test parity PASS.
- Ghi danh sách thuật ngữ cần bot/user soát trong Verification summary.

## Retry / Escalation
Max 3 attempt; fail lần 3 → `architecture_review_needed` (không fix #4). Mỗi failed attempt append `.context/error-memory.md`.

## Verification summary
- Acceptance criteria: PASS — `src/i18n/messages/ja.json` 283 lá, cùng cấu trúc/kiểu/độ dài mảng như en.json, không chuỗi rỗng; placeholder ICU giữ nguyên; plural ja chỉ nhánh `other` (CLDR ja). vi↔en không lệch key. Test `src/i18n/messages.test.ts` (4 test: parity lá đệ quy vi=en=ja, không rỗng, đối số ICU cấp ngoài khớp en, rich tag khớp en) PASS.
- Verify commands + result: `npm run typecheck` PASS · `npm run lint` PASS (1 warning cũ mdx/index.tsx:26) · `npm test` 206/209 pass, 1 fail có sẵn (ảnh public/uploads, không thuộc task), 2 skip · `SWC_NATIVE_BINDING_CACHE=C:/Users/datda/.swc-native npm run build` PASS.
- Reviewer verdict: NORMAL PASS round 1 — `.context/review-reports/feature-add-japanese-locale-phase-2-task-01-round-1-review.md` (5 MINOR không chặn).
- Doc impact: no doc impact (DESIGN ghi ở P3-T02).
- Thuật ngữ cần bot/user soát: お問い合わせ (Contact) · 導入事例 (Case studies) vs 活用事例 (blog "Practical applications") · 企業向けソリューション · 導入メリット / 活用シーン · よくあるご質問 · デジタルトランスフォーメーション（DX） · home hero đảo trật tự, chữ tô màu thành 「デジタルソリューション」 · contact heroLead+heroAccent 「ともに創りましょう / 現場に届く価値を」 (hơi gượng) · about 「会社紹介 NTA」 · 「顧客満足度」 cạnh 99% (en "Satisfied clients") · 受託ソフトウェア開発 · Flycam（ドローン） · placeholder 山田 太郎 / 株式会社ABC · contact.consultationTitle 「ご相談のお申し込み」 (đã bỏ 「無料」 vì vi/en không hứa miễn phí).
- Residual risk: chưa xem giao diện thật (tràn chữ, font CJK) — kiểm ở P2-T02/P2-T04; test ICU chưa parse cú pháp plural lồng (MINOR-1).
