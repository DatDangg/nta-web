# Task 01 (modification): Đồng bộ spec/intent docs sang domain `ntavietnam.tech`

> Nguồn: change `spec/changes/2026-10-09-domain-ntavietnam.md` (acceptance 1–6) · spec delta
> `spec/updates/2026-10-09-domain-ntavietnam.md` · R-27 (+ R-13/R-19/R-21) (`SPECIFICATIONS.md`).

## Phase
1 (post-build doc/spec reconcile — docs-only, không có code change)

## Type
modification (post-build MODIFY — đổi domain/canonical contract; **0 dòng code app**)

## Goal
Đồng bộ spec canonical + intent docs còn ghi domain cũ `ntasolution.vn` sang domain đích mới
**`ntavietnam.tech`** (canonical `https://ntavietnam.tech`, HTTPS apex không `www`, thay hoàn toàn).
Phần code/config đã thực hiện + deploy ở commit `4d8120d` / `00f2560` — coi là evidence, không làm lại.

## Classification / Risk
- Work item type: FEATURE (post-build MODIFY)
- Change type: MODIFY (đổi canonical contract)
- Scope: `SPECIFICATIONS.md`, `BRIEF.md`, `docs/BRD.md`, `docs/specs/2026-10-08-nta-website-design.md`
  (+ xác nhận `docs/API_SPEC.md` đã đúng); spec publish `spec/updates/` + `spec/CHANGELOG.md` +
  `spec/test-scope/current.json`
- Root cause category: n/a (không phải bug) — gap "domain drift": spec/intent docs stale sau lần đổi domain
- Review level expected: **NORMAL** — doc-only, không auth/schema/data/API-contract thực thi; verify = grep + spec-validator
- Blast radius: intent docs (SPECIFICATIONS/BRIEF/BRD) + design spec + test-scope. Không đụng code app.
- Doc impact: **yes** — chính là reconcile as-built/intent docs (domain); `docs/API_SPEC.md` xác nhận no-change
- Decision impact: NO

## Scope (spec refs)
- **R-27** (`SPECIFICATIONS.md`): deploy/domain → `ntavietnam.tech`.
- **R-13**: API prod base URL → `https://ntavietnam.tech/api`.
- **R-19**: HTTPS only + redirect http→https trên domain mới.
- **R-21**: SEO canonical/sitemap/robots/llms.txt emit domain mới.

## Description (đúng scope — KHÔNG mở rộng)
1. `SPECIFICATIONS.md`: domain Overview (`:23`), API prod Base URL (`:146`), R-27 (`:218`); bump `spec_version`.
2. `BRIEF.md`: dòng domain đã chốt (`:15`) + mục Deploy (`:43`).
3. `docs/BRD.md`: dòng domain Cloud Run (`:53`) + Domain chính thức (`:167`).
4. `docs/API_SPEC.md`: xác nhận Production = `https://ntavietnam.tech/api` (không sửa — đã đúng).
5. `docs/specs/2026-10-08-nta-website-design.md`: dòng domain (`:12`).
6. Spec Publisher: bump `spec_version` 1.1.0 → 2.0.0 (MAJOR) + `spec/updates/2026-10-09-domain-ntavietnam.md`
   + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (`scopeVersion` 5 → 6).
7. KHÔNG đổi behavior/code app; KHÔNG đổi intent ngoài domain; KHÔNG đụng code; KHÔNG đụng change-UI.

## Acceptance Criteria
- [ ] `SPECIFICATIONS.md` không còn domain đích cũ (grep = 0); Overview + API prod base URL + R-27 = `ntavietnam.tech`
- [ ] `BRIEF.md` + `docs/BRD.md` không còn domain đích cũ
- [ ] `docs/API_SPEC.md` Production = `https://ntavietnam.tech/api`
- [ ] `spec_version` 2.0.0 + `spec/updates/` + `spec/CHANGELOG.md` + `spec/test-scope/current.json` (scopeVersion 6)
- [ ] Không đổi code app ngoài phần đã deploy; không đổi intent ngoài domain
- [ ] `npm run lint` / `npm run typecheck` / `npm run build` PASS (verify code hiện có — docs-only)

## Verification Plan
- `grep -rn "ntasolution.vn" SPECIFICATIONS.md BRIEF.md docs/BRD.md docs/API_SPEC.md` → 0 (trừ file change/archive chứa tên cũ có chủ đích)
- `npm run lint` · `npm run typecheck` · `npm run build` (theo `.context/project-config.md`)
- spec-validator cross-check delta vs docs → PASS

## Retry / Error Memory
- Doc-only, risk LOW → không dự kiến retry. Verify FAIL → dừng, ghi residual (`error-memory` nếu lặp).

## Doc / Decision Impact
- Reconcile: `SPECIFICATIONS.md`, `BRIEF.md`, `docs/BRD.md`, `docs/specs/*design*.md`, `docs/API_SPEC.md` (confirm).
- Ghi nhận drift ngoài phạm vi: deploy platform Cloud Run (docs) vs docker-vps (thực tế) — cần change riêng.
