# Run Journal — builder/nta-website · layer-2-task-05

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: builder/nta-website
phaseTask: layer-2-task-05
step: builder
agent: builder
status: awaiting                      # builder (redo) xong, chờ reviewer
attempt: 0
interrupted: false
updatedAt: 2026-10-09T12:14:00+07:00
filesTouched: [src/i18n/messages/vi.json, src/i18n/messages/en.json]
filesNew: [src/app/[locale]/products/page.tsx, src/components/products/ScreenshotCarousel.tsx, src/components/products/DownloadLinks.tsx]
evidence:
  reportPath: null
  round: 0
  verdict: awaiting_review
  verify: "npm run lint PASS · npm run typecheck PASS · npm run build PASS (builder redo); /vi/products + /en/products SSG"
understand: "layer-2-task-05 = Products /products Screen 7 (2 AppCard + carousel + download/badge)"
next: "Chạy reviewer độc lập round 1 cho layer-2-task-05"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Deps done: Layer 1 task-02/03/04 (AppCard/PageHeader/Breadcrumb/CTABanner/Reveal), Layer 0 task-04 (product content).
- Empty: `downloadLinks = null` → ẩn links + badge "Sắp ra mắt"/"Coming soon"; ảnh lỗi → fallback surface-sunken.
- Carousel: no autoplay; reduced-motion không auto-snap; `role="region"` + aria; prev/next aria-label; dots button `aria-current`; ảnh lazy.
- JSON-LD `SoftwareApplication` chỉ khi có link thật (hiện null → bỏ, ghi chú).

## History

- 2026-10-09T11:55:00+07:00 journal created (write-ahead trước khi gọi builder) — status=running
- 2026-10-09T12:05:00+07:00 builder #1 trả `no` (đã tạo files nhưng CHƯA chạy verify) — coi như interrupted, KHÔNG tăng attempt. Redo builder: đọc files trên đĩa + hoàn tất + chạy lint/typecheck/build.
- 2026-10-09T12:14:00+07:00 builder (redo) xong — carousel 1/2/3 slides + swipe + a11y + reduced-motion; products order canonical; lint/typecheck/build PASS. status=awaiting → reviewer round 1.
