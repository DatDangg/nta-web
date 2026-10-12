# Run Journal — change/home-hero-banner-restyle · phase-1-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**
> Đọc file này **ĐẦU TIÊN** khi mở session mới (xem `AGENTS.md` § Session Handoff).

```yaml
workItem: change/home-hero-banner-restyle
phaseTask: phase-1-task-01
step: done
agent: primary
status: done
attempt: 3
interrupted: false
updatedAt: 2026-10-12T18:30:00+07:00
filesTouched: [src/components/home/Hero.tsx, src/app/globals.css, src/i18n/messages/vi.json, src/i18n/messages/en.json, .context/design-spec.md, src/content/home.ts, src/app/[locale]/page.tsx, spec/CHANGELOG.md, spec/test-scope/current.json, .context/progress.json]
filesNew: [src/components/home/HeroVisual.tsx, public/images/home/hero-banner.jpg, spec/changes/archive/2026-10-12-home-hero-banner-restyle.md, spec/updates/2026-10-12-home-hero-banner-restyle.md, tasks/change-home-hero-banner/**, .context/review-reports/change-home-hero-banner-restyle-phase-1-task-01-round-{1,2,3}-review.md]
evidence:
  reportPath: .context/review-reports/change-home-hero-banner-restyle-phase-1-task-01-round-3-review.md
  round: 3
  verdict: PASS
commit: c113401
next: "user soi mắt desktop (1024+/1440) so với target-banner-2.jpg — residual duy nhất: chưa render thật; nếu lệch vị trí panel → tinh chỉnh % trong HeroVisual"
loopSignal: none
approvals: []
batchQueue: []
```

## Notes / WIP reasoning

- **DONE**: commit `c113401` (21 files, 885+) — chỉ file scope change này.
- home.ts staged đúng 28 dòng heroPanels (hunk `.jpg→.png` session khác giữ nguyên working tree);
  không add next.config/tsconfig/next-env/.next-build/kill-local/house-*.jpg/png.
- spec 3.0.0 KHÔNG bump — scope v19→v20 (test-scope + CHANGELOG + spec/updates đã ghi).
- Change file → `spec/changes/archive/`, status done. progress.json entry done + review round 3 PASS.
- Dev server 3000 cũ chết (500 HMR cache) → đã kill + start lại (sh_12f6b6e67001);
  server verify 3001 (sh_12f589cb) sẽ dừng dọn.

## Notes / WIP reasoning

- Round 2 verdict: **FAIL** (2 MAJOR Tailwind silent classes + 1 MAJOR commit hygiene + 5 MINOR).
- **Đã fix round 3:**
  - `object-position-[70%_50%]` → `object-[70%_50%]` (verify CSS build có `object-position:70% 50%` ✓)
  - `bg-primary/40` → `bg-primary opacity-40` (verify `.opacity-40` có, `bg-primary/40` gone ✓)
  - Commit hygiene MAJOR #3: **KHÔNG commit** `next.config.ts` (distDir), `tsconfig.json`, `next-env.d.ts`,
    `.next-build/` — KHÔNG revert (của session khác, có thể đang dùng). Commit theo danh sách file scope tường minh.
  - MINOR #4: change file acceptance đổi đúng hướng crop 6/5 ✓ · #5: design-spec L137 grid 42.5/57.5 ✓
  - MINOR #6: gỡ `HERO_IMAGE.width/height` dead data (chỉ `HERO_SRC`) ✓ · #7: `sizes="(min-width:768px) 60vw, 100vw"` ✓
  - MINOR #8: tách `ListPanel`/`ChartPanel`/`StatPanel` — mỗi function < 50 dòng ✓
- Verify lại: typecheck PASS · lint 0 error · build 53/53 PASS.
- **Known residual**: chưa soi mắt desktop thật (screenshot blocked — window không visible).
- Dev server 3001 (background sh_12f589cb) đang chạy để verify; server 3000 cũ bị HMR cache lỗi 500 (cần restart khi xong).


## Notes / WIP reasoning

- User: "dùng ảnh 1 sửa banner cho t, trông nó sẽ giống như ảnh 2" → Hero trang chủ.
- Ảnh 1 (nguồn) → `public/images/home/hero-banner.jpg`; ảnh 2 (mục tiêu) → `tasks/change-home-hero-banner/refs/target-banner-2.jpg`.
- **Round 1** (session trước): thay ảnh + bỏ khung + full-bleed + alt → reviewer PASS (3 MINOR).
- **Round 2** (session này, user gửi lại 2 ảnh: "ảnh 2 là goal, ảnh 1 là ảnh nền"): thêm
  headline 2 màu (heroTitleLead/Accent), `HeroVisual.tsx` (crop 6/5 + overlay sáng + 5 panel kính + wordmark NTA),
  `heroPanels` content vi/en trong home.ts, CTA arrow, nền gradient, grid 0.85/1.15.
- Verify: `npm.cmd run typecheck` PASS · `npm.cmd run lint` 0 error (1 warning pre-existing mdx) ·
  `npm.cmd run build` PASS 53/53 (fix 'use client' cho HeroVisual) · DOM-eval trên localhost:3001
  (mobile 414: accent #009e87 ✓, gradient ✓, arrow ✓, no overflow-x ✓, panels hidden <lg ✓;
  panels simulate lg: không tràn text; overlap panel1/panel3 CHỈ xảy ra khi force hiện ở <lg — lg+ ước tính an toàn).
- **Blocked**: browser.screenshot 4 lần fail "desktop window visible" (Tool Loop Guard: không retry) →
  verify bằng DOM evaluate + CSS math, chưa soi mắt desktop thật — giao reviewer/user confirm.
- Dev server 3000 (process 23052) bị 500 do HMR cache lỗi 'use client' cũ; đã start server 3001 để verify.
- **Cảnh báo nhiễm chéo:** working tree dirty do session khác (brand-logo-lockup, solution-card-real-images,
  hairstyle gallery, solution-card images). Chỉ commit file thuộc change này.


## History

- 2026-10-12T14:38:00+07:00 journal created (write-ahead trước khi gọi agent change-request)
