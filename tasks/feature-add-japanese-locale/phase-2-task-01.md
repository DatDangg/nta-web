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
- Acceptance criteria: _pending_
- Verify commands + result: _pending_ (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build` — lấy từ `.context/project-config.md`)
- Reviewer verdict: _pending_
- Doc impact: _pending_
