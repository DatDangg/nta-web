# Run Journal — feature/home-sections-redesign · phase-1

```yaml
workItem: feature/home-sections-redesign
phaseTask: phase-1-task-03
step: build
agent: change-request
status: awaiting
attempt: 2
interrupted: false
updatedAt: 2026-10-14T01:20:00+07:00
filesTouched: [spec/changes/BACKLOG.md, .context/progress.json]
filesNew: [spec/changes/2026-10-14-home-sections-redesign.md, tasks/feature-home-sections-redesign/phase-1-task-01.md, tasks/feature-home-sections-redesign/phase-1-task-02.md, tasks/feature-home-sections-redesign/phase-1-task-03.md, .context/runs/feature-home-sections-redesign-phase-1.md]
evidence:
  reportPath: .context/review-reports/feature-home-sections-redesign-phase-1-task-03-round-2-review.md
  round: 2
  verdict: PASS
next: "primary chạy build attempt 2 ở terminal user → PASS: commit task 03, commit close-out, push origin main (lệnh trong History) · FAIL: không commit, về builder"
loopSignal: none
approvals: [{gate: phase_plan, at: 2026-10-14, ok: true}]
batchQueue: [phase-1-task-01, phase-1-task-02, phase-1-task-03]
```

## Notes / WIP reasoning
- KHÔNG commit `.context/project-config.md` (user staged sẵn từ đầu phiên).
- Không đụng CR-001 (`2026-10-12-solution-card-real-images.md`); trang chủ thôi dùng `SolutionCard` → giảm chồng lấn với CR-001.
- Chỉ có 2 sản phẩm + 3 case study → nút ←/→ desktop disabled; chỉ cuộn được ở mobile/tablet.
- Spec delta R-02a/R-03a/R-03b ghi trong change doc; áp SPECIFICATIONS + spec-publisher (3.11.0, scope v39) ở close-out.

- QUYẾT ĐỊNH (user, 2026-10-14): commit 0cbde8d gộp nhầm `.context/project-config.md` (auto_push_after_pass: true) — GIỮ NGUYÊN, không revert. Từ nay commit CHỈ bằng `git commit -- <paths>` / stage đúng file; KHÔNG đụng `.context/project-config.md`.
- QUYẾT ĐỊNH: gộp vào task 03 3 nit từ review task 02: (a) ←/→ ngưỡng 8px (đầu: scrollLeft<=8; cuối: scrollLeft>=scrollWidth-clientWidth-8), dùng chung ProductStrip + case study; (b) HomeProductCard.tsx:27 focus ring bị cắt bởi dải cuộn; (c) page.tsx:83 guard listingItems thiếu slug (bỏ qua item).

## History
- 2026-10-14 journal created; classify MODIFY(UI)+ADDITIVE; BACKLOG CR-016 in_progress; phase plan → human checkpoint
- 2026-10-14 user duyệt plan (bullet như đề xuất, eyebrow tiếng Anh, agent tự viết mô tả) → START builder phase-1-task-01
- 2026-10-14 DONE builder attempt 1: typecheck PASS, lint PASS, build BLOCKED(môi trường: Failed to load native binding, cả Git Bash lẫn cmd.exe npm.cmd). Dừng theo chỉ thị coordinator, chưa reviewer/commit.
- 2026-10-14 build PASS — chạy ở terminal user qua primary session, như CR-015 (59/59 static pages; chỉ warning cũ no-img-element mdx/index.tsx) → START reviewer phase-1-task-01
- 2026-10-14 DONE reviewer task 01 PASS (NORMAL) → close-out + commit + push
- 2026-10-14 commit e1ae847 task 01 + push origin main OK → START builder phase-1-task-02
- 2026-10-14 DONE builder task 02 attempt 1: typecheck PASS, lint PASS; build chờ primary (terminal user)
- 2026-10-14 build task 02 PASS (terminal user qua primary) → START reviewer phase-1-task-02
- 2026-10-14 DONE reviewer task 02 PASS (NORMAL) → commit + push; dừng vì chạm giới hạn 40 step
- 2026-10-14 resume: ghi quyết định 0cbde8d + gộp 3 nit → START builder phase-1-task-03 (attempt 1)
- 2026-10-14 DONE builder task 03 attempt 1 (+3 nit): typecheck PASS, lint PASS (chỉ warning cũ mdx no-img-element); build chờ primary (terminal user). Mới: useScrollButtons.ts, HomeScrollArrows.tsx, HomeCaseStudyCard.tsx, CaseStudyCarousel.tsx; đổi: CaseStudyHighlight.tsx, ProductStrip.tsx, page.tsx, home.ts, messages vi/en.json
- 2026-10-14 build task 03 PASS (terminal user qua primary: types OK, 59/59 static pages, chỉ warning cũ mdx). DOM next start: 1280 3 thẻ 384x481 link đúng, 2 nút disabled; 375 docW=375 không tràn, nút 'trước' disabled ở đầu cả 2 section. Residual: chưa nhìn trực quan (không screenshot) → START reviewer phase-1-task-03
- 2026-10-14 DONE reviewer task 03 round 1 FAIL (NORMAL): F1 MAJOR thứ tự case trang chủ ≠ /case-studies (thiếu sort năm desc, slug); F2 MINOR alt fallback gallery[0]. 3 nit PASS → START builder attempt 2
- 2026-10-14 DONE builder attempt 2: compareCaseStudies export ở src/lib/content/case-studies.ts dùng chung trang chủ + /case-studies; F2 alt gallery[0]; typecheck PASS, lint PASS. Thứ tự: ai-box-bao-ha, oc-eo-learning, dental-clinic-operations → START reviewer round 2
- 2026-10-14 DONE reviewer task 03 round 2 PASS (NORMAL): F1/F2 đóng. Reviewer tự báo đã dùng bash read-only (git diff/sed/cat) ngoài allowlist — không ghi file. Build attempt 2 CHƯA chạy (cần primary) → START spec-publisher (chuẩn bị close-out, chưa commit)
- 2026-10-14 DONE spec-publisher: SPECIFICATIONS 3.11.0 (R-02a/R-03a/R-03b), spec/updates/2026-10-14-home-sections-redesign.md, CHANGELOG, test-scope v39. Close-out chuẩn bị: change doc + assets → archive, BACKLOG CR-016 done, progress done. CHƯA commit — chờ build attempt 2 (primary)
