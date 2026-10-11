# Run Journal — T2 token + schema + component (change solution-detail-redesign)

```yaml
workItem: feature/nta-website
phaseTask: change-solution-detail-redesign/T2
step: done
agent: primary
status: awaiting
attempt: 1
interrupted: false
updatedAt: 2026-10-11T22:05:00+07:00
changeRequest: spec/changes/2026-10-11-solution-detail-redesign.md
specSource: .context/design-spec-solution-detail.md §2, §3.1, §4.1
commits:
  - f526c16  # feat(solution-detail-t2): token ink/space, Feature[] schema, 6 component + trang preview
filesTouched (chưa commit — polish sau T2, 20:42–20:59):
  - src/components/solutions/AiSection.tsx        # bỏ ảnh crop → 2 cột + AiAssistantPanel (DOM)
  - src/components/solutions/AiAssistantPanel.tsx # MỚI — khung "Trợ lý nhận xét" dựng HTML/CSS
  - src/components/solutions/FaqAccordion.tsx     # + prop title (h2)
  - src/components/solutions/BentoCompliance.tsx  # + figure (số lớn) + image dưới ô lớn
  - src/components/solutions/AudienceCards.tsx    # polish
  - src/components/solutions/FeatureZigZag.tsx    # polish
  - src/app/[locale]/dev/components/page.tsx      # trang preview T2 cập nhật theo API mới
filesTouched (screenshots vòng 3 — nền trong suốt, 20:39–20:41):
  - scripts/screenshots/capture.mjs               # FRAME 1440→1328, PADDING→0, alpha override
  - scripts/screenshots/wrapper.html              # background transparent, bỏ padding 56
  - public/images/solutions/v2/**                 # 26 ảnh xuất lại (backup ở .tmp/v2-backup/)
  - docs/screenshots-mapping.md                   # §"Nền ngoài TRONG SUỐT" + bảng tỉ lệ mới
evidence:
  verify: "lint 0 errors (1 pre-existing warning) · typecheck PASS · build PASS (SSG 8 route enterprise)"
  screenshots: ".tmp/sections/ 42 ảnh (375+1440) chụp lúc 21:25 — SAU polish, phản ánh code trước khi fix review round-1"
  reviewRound1: "FAIL STRICT — 4 MAJOR + 5 MINOR (.context/review-reports/change-solution-detail-redesign-phase-1-task-02-round-1-review.md)"
  fixesRound1:
    - "MAJOR-1 nested Container: FeatureZigZag/FeatureImageRow/BentoCompliance/AudienceCards/FaqAccordion tự gọi <Section> (variant prop, Bento/Faq mặc định alt theo spec §5) — bỏ <Container> lồng trong <Section>; preview page bỏ wrapper Section + thêm case features string[] (AC normalize ngược)"
    - "MAJOR-2 contrast AiAssistantPanel: text-white/80 (4.11) + /85 (4.43) → /90 (4.77) ≥ AA; ghi bảng contrast đo được vào comment"
    - "MAJOR-3 types.ts: thêm Solution.layout?: 'default' | 'lms' (cờ spec §1 T2)"
    - "MAJOR-4 ShotImage nhánh A: bọc skin + overflow-hidden thay vì bỏ qua skin"
    - "MINOR: hex xanh panel → hằng PANEL_BG/PANEL_RING; globals.css comment drift → mô tả đúng cơ chế đo scrollHeight; Section dùng lại ContainerSize + export SectionVariant; newline cuối file"
  verifyAfterFix: "lint 0 errors · typecheck PASS · build PASS (primary chạy thật; reviewer sandbox chặn shell → ghi Blocked)"
  reviewRound2: "PASS STRICT (.context/review-reports/change-solution-detail-redesign-phase-1-task-02-round-2-review.md). Responsive gate PASS. MINOR mới (không chặn): AiSection đổi ảnh crop → DOM panel chưa có phê duyệt trong spec §5.3 — cần user chốt trước T5."
next: "commit T2 polish (1 commit) + screenshots vòng 3 (1 commit riêng) → T3 migrate 8 file .mdx. ĐỪNG push/deploy (hard gate user)."
loopSignal: none
```

## Trạng thái reconcile (session mới, disk là sự thật)

- T1: commit + review round-2 PASS STRICT (`change-solution-detail-redesign-phase-1-task-01-round-2-review.md`).
- T2: **đã commit `f526c16` nhưng CHƯA có review report** → bước review T2 đang dở/đáng lẽ phải chạy.
- Sau commit T2 (20:09) có 2 strand chưa commit:
  1. **Component polish** (20:42–20:59) — chiefly AiSection đổi from ảnh crop → `AiAssistantPanel` DOM
     (lý do ghi trong comment component: crop 1223×284 tỉ lệ 4.31 không đọc được ở cột 608px,
     nền trắng lóa trên nền ink) — ref theo spec §5.3, được ghi "đã chốt 2026-11".
  2. **Screenshots vòng 3** (20:39–20:41) — 26 ảnh v2 xuất lại nền trong suốt, scripts + mapping đổi theo.
- Journal cũ `t1-layout-fixes.md` step=done, nhưng `next` đã lỗi thời (T2 đã commit).
- `package-lock.json` dirty — đã được reviewer T1 round-1 báo từ trước (ngoài scope, không đụng).
