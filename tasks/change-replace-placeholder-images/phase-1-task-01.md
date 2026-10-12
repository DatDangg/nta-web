# Task 01: Dựng assets — mock enterprise/flycam/talvra + bộ SVG

> Nguồn: change `spec/changes/2026-10-12-replace-remaining-placeholder-images.md`
> Bao phủ mục #1, #3, #4, #8, #9, #10, #13, #14 (phần **tạo file**, không wiring — wiring = T02)

## Phase
1

## Type
modification (post-build MODIFY — thay ảnh placeholder)

## Goal
Tạo toàn bộ file ảnh mới cho các mục #1, #3, #4, #8, #9, #10, #13, #14.
**Task này KHÔNG sửa component / content / i18n** — chỉ tạo mock + SVG + script + commit.

## Classification / Risk
- Work item: FEATURE · Change type: MODIFY
- Scope: `scripts/screenshots/mock-*/` (new), `public/images/**` (new)
- Review level: **NORMAL** — chỉ thêm file tài nguyên, không đụng code chạy
- Blast radius: 0 cho tới khi T02 wiring
- Doc impact: `scripts/screenshots/README.md` (ghi cách regenerate)

## Scope refs
- Change mục #1, #3, #4, #8, #9, #10, #13, #14

## Description

### A. Mock HTML/CSS (theo pattern `scripts/screenshots/mock-hrm/`)
1. `scripts/screenshots/mock-enterprise/` → `public/images/solutions/v2/enterprise-hero.png`
   Collage enterprise v2 trong khung macOS: `solutions/v2/lms/01-tong-quan.png` +
   `solutions/v2/crm/01-tong-quan.png` + `solutions/v2/dentgo/01-tong-quan.png` xếp lớp/lệch pha.
2. `scripts/screenshots/mock-flycam/` → `public/images/solutions/v2/flycam/01-tong-quan.png`
   Dashboard điều hành nhiệm vụ bay, khung macOS:
   - bản đồ **vẽ dạng sơ đồ** có tuyến bay (KHÔNG ảnh chụp từ trên giả như thật)
   - trạng thái dock / drone
   - danh sách cảnh báo cần xác minh
   - ô video = khung minh hoạ vẽ bằng CSS
3. `scripts/screenshots/mock-talvra/` → `public/images/solutions/v2/talvra/01-tong-quan.png`
   Chat trợ lý AI doanh nghiệp, khung macOS: hội thoại mẫu về một nghiệp vụ cụ thể
   (vd tra cứu chính sách nội bộ), có khối trích dẫn tài liệu (tài liệu giả).

Chụp bằng pipeline có sẵn: `scripts/screenshots/capture.mjs` (đọc `scripts/screenshots/README.md`).
Bám `scripts/screenshots/design-tokens.md`. Nền ngoài trong suốt.

### B. SVG không chữ (cùng một bộ phong cách — palette, stroke, bố cục)
- `public/images/illustrations/ai-analysis.svg` (#3)
- `public/images/illustrations/ai-apps.svg` (#4)
- `public/images/illustrations/oc-eo-architecture.svg` (#13) — sơ đồ 3 tầng
  camera IP → Edge AI Box → VMS/dashboard, flycam là lớp bổ trợ
- `public/images/blog/first-steps-cover.svg` · `learning-content-cover.svg` ·
  `responsible-ai-cover.svg` · `digital-workflows-cover.svg` (#10) — 1 series, cùng palette,
  cùng lưới bố cục, cùng lề
- `public/images/about/team-ai.svg` · `team-domain.svg` (#14) — trừu tượng theo chuyên môn,
  **KHÔNG mặt người**, bỏ hẳn chữ "Ảnh đội ngũ sẽ cập nhật"

**Bắt buộc:** không có `<text>` / chữ khắc sẵn trong SVG nào. Alt dùng chung 2 locale.

## Acceptance Criteria
- [ ] 3 mock PNG render đúng, nền ngoài trong suốt, đồng phong cách ảnh v2
- [ ] Flycam: bản đồ sơ đồ, ô video là khung vẽ — không ảnh chụp giả
- [ ] `grep -c "<text"` trên tất cả SVG mới = 0
- [ ] 4 ảnh bìa blog cùng palette + cùng bố cục (nhìn ra 1 series)
- [ ] 2 SVG đội ngũ không có mặt người
- [ ] `scripts/screenshots/README.md` có mục regenerate từng mock
- [ ] lint · typecheck · build PASS (không có TS/CSS sai)

## Verification Plan
- Commands: theo `.context/project-config.md` (đọc file, không hardcode `npm`)
- Evidence: liệt kê file PNG/SVG đã tạo + kích thước; output `grep` `<text>`

## Feature Verification
- Acceptance: **PENDING**
- Verify commands + result: **PENDING**
- Reviewer verdict: **PENDING**

## Retry / Escalation
- Attempt: 0 · Escalation: sau 3 attempt fail → `architecture_review_needed`, dừng báo human

## DoD
- [ ] Code/assets written trong scope
- [ ] Check commands pass
- [ ] Reviewer PASS
- [ ] `.context/progress.json` updated
- [ ] Doc impact recorded (`scripts/screenshots/README.md`)
- [ ] committed — 1 task = 1 commit (branch `main`, **KHÔNG push**)

## Files to Create
- `scripts/screenshots/mock-enterprise/`, `mock-flycam/`, `mock-talvra/`
- `public/images/solutions/v2/enterprise-hero.png`
- `public/images/solutions/v2/flycam/01-tong-quan.png`
- `public/images/solutions/v2/talvra/01-tong-quan.png`
- `public/images/illustrations/{ai-analysis,ai-apps,oc-eo-architecture}.svg`
- `public/images/blog/{first-steps,learning-content,responsible-ai,digital-workflows}-cover.svg`
- `public/images/about/{team-ai,team-domain}.svg`
- `scripts/screenshots/README.md` (bổ sung)

## Notes
- Builder KHÔNG tự update progress. Commit 1 task = 1 commit.
- KHÔNG push. KHÔNG deploy. Nếu branch ≠ `main` → **DỪNG, báo lại**.