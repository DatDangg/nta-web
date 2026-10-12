# Task 04: `/products` + 2 thẻ sản phẩm — dùng ảnh do user cung cấp

> Nguồn: change `spec/changes/2026-10-12-replace-remaining-placeholder-images.md` — mục #5, #6
> **BỊ CHẶN** — chờ user copy 2 file ảnh vào `public/images/products/`.

## Phase
1

## Type
modification (post-build MODIFY)

## Blocked — điều kiện tiên quyết
User phải copy 2 ảnh vào repo trước khi task này chạy:
```
public/images/products/ai-music-app.jpg     ← ảnh AI Music
public/images/products/hair-style-ai.jpg    ← ảnh HairStyle AI
```
Nếu file chưa có → **DỪNG, báo lại orchestrator**, không tự dựng ảnh thay thế.

## Goal
Thay 2 ảnh placeholder `products/*.svg` bằng ảnh thật, ép tỉ lệ 16/10 cho đều với thẻ bên cạnh.

## Classification / Risk
- Work item: FEATURE · Change type: MODIFY
- Scope: `src/content/home.ts`, `src/content/products/{vi,en}/*.mdx`
- Review level: **NORMAL**
- Blast radius: `/products`, trang chủ (thẻ sản phẩm) — VI+EN

## Description

User đã quyết (2026-10-12): **dùng ảnh của user, ép size, KHÔNG cắt chữ.**

1. Ảnh gốc là creative onboarding **9:16 có chữ tiếng Anh khắc sẵn**
   ("Welcome to HairStyle AI", "AI Music Generator … Next →"). Giữ nguyên chữ theo yêu cầu user.
2. Ép hiển thị: khung tỉ lệ cố định **16/10**, ảnh `w-full h-auto` bám mép trên,
   phần dư ở đáy `overflow-hidden` + `.shot-fade-bottom` (đã có sẵn) —
   **KHÔNG** `object-cover` cắt 2 bên. Ảnh cao hơn khung nên bị cắt **đáy**, chấp nhận được
   (chữ nằm ở nửa dưới → phải kiểm tra không mất chữ quan trọng; nếu mất thì báo lại user).
3. Cập nhật:
   - `src/content/home.ts:17,18` (vi) + `:29,30` (en) — 2 thẻ sản phẩm trang chủ
   - `src/content/products/{vi,en}/music-app.mdx:6` và `hair-style-ai.mdx:6` — screenshots
4. Alt — sản phẩm chưa ra mắt → **tiền tố bắt buộc**:
   - vi: `"Giao diện minh hoạ — ..."` · en: `"Illustrative interface — ..."`
   - Thay thế mọi alt cũ (`"Màn hình minh họa ứng dụng nhạc AI"` / `"Preview screen for the AI music app"` …).
5. Xoá `public/images/products/music-app-preview.svg` + `hair-style-ai-preview.svg`
   **chỉ khi** không còn reference nào.

## Acceptance Criteria
- [ ] Cả 4 chỗ (2 thẻ home × 2 locale, 2 mdx products × 2 locale) dùng ảnh mới
- [ ] Khung 16/10 đều nhau; ảnh bám mép trên; phần dư đáy có fade
- [ ] **Không cắt 2 bên** (kiểm tra bằng mắt + `naturalWidth`)
- [ ] Chữ trong ảnh không bị mất ở viewport 375 và 1440
- [ ] Mọi alt có tiền tố "Giao diện minh hoạ — " / "Illustrative interface — "
- [ ] Không còn reference tới 2 file `.svg` cũ
- [ ] lint · typecheck · build PASS; reviewer PASS

## Verification Plan
- Commands: theo `.context/project-config.md`
- `/` + `/products` × VI/EN: mọi `<img>` `naturalWidth > 0`
- Overflow 0 ở 375 / 1440; `check-left-align` PASS
- Chụp screenshot `/products` + thẻ sản phẩm trang chủ (VI+EN, 375+1440) gửi user

## Feature Verification
- Acceptance: **PENDING** · Verify: **PENDING** · Reviewer: **PENDING**

## Retry / Escalation
- Attempt: 0 · Escalation: sau 3 attempt fail → `architecture_review_needed`

## DoD
- [ ] Code written trong scope · [ ] Check commands pass · [ ] Reviewer PASS
- [ ] `.context/progress.json` updated · [ ] Doc impact recorded
- [ ] committed — 1 task = 1 commit (branch `main`, **KHÔNG push**)

## Files to Modify
- `src/content/home.ts`
- `src/content/products/{vi,en}/music-app.mdx`
- `src/content/products/{vi,en}/hair-style-ai.mdx`
- `public/images/products/{music-app-preview,hair-style-ai-preview}.svg` (xoá)

## Notes
- **Đang BLOCKED** chờ ảnh từ user.
- KHÔNG push, KHÔNG deploy. Nếu branch ≠ `main` → **DỪNG, báo lại**.