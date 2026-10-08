# Spec Update — 2026-10-10 nta-website initial-build

**spec_version:** 1.0.1 → 1.0.1 (**KHÔNG bump** — initial build không đổi requirement)
**Trigger:** initial-build
**Requirements:** KHÔNG thêm/sửa/xoá. Toàn bộ **R-01…R-27** của spec 1.0.1 đã được **build xong** qua Layers 0–4;
spec-publisher chỉ cập nhật phạm vi thực tế đã build + sinh test-scope `initial-build`.
**Ảnh hưởng:** toàn site (9 nhóm trang + 404, 2 locale) + API `/api/health`, `/api/contact` + SEO + deploy config.

## Phạm vi đã build (Layers 0–4)
- **Layer 0 — Foundation:** Next.js App Router (src/) + TypeScript + Tailwind, i18n `next-intl` (vi/en, `localePrefix: as-needed`), design tokens, content model, CI skeleton (`.github/workflows/ci.yml`).
- **Layer 1 — Layout & shared:** Header (desktop dropdown + MobileNav drawer), Footer, LanguageToggle, PageHeader/Breadcrumb, Reveal, focus/skip-link, reduced-motion.
- **Layer 2 — Content pages:** home, about, solutions (enterprise + ai overview + 7 detail), products (2 app), case-studies (list + detail), blog (list + MDX detail), 404.
- **Layer 3 — API & form:** `GET /api/health`; `POST /api/contact` (guard order rateLimit→validate→honeypot→forward, secret server-only); ContactForm (full) + CTAForm (compact) tái dùng hook; trang `/contact`.
- **Layer 4 — SEO/perf/a11y/deploy config:** sitemap (42 URL) + robots + llms.txt + JSON-LD (Organization/WebSite/BreadcrumbList/Article/ContactPage) + metadata/hreflang; `next/font` Inter (latin+vietnamese) + next/image avif/webp; accessibility sweep WCAG 2.1 AA (Lighthouse a11y 1.0/0 fail/11 route) + responsive; deploy config Cloud Run (Dockerfile standalone, deploy.yml draft manual-only, runbook) — **chưa deploy**.

## Verification tổng (kết quả build/verify)
- `npm run lint` 0 error (1 warning MDX `<img>` pre-existing) · `npm run typecheck` PASS · `npm run build` PASS (43 static HTML).
- Lighthouse SEO = 1.0 · a11y = 1.0 (11 route) · best-practices = 1.0.
- `.next/standalone/server.js` chạy → `/api/health` 200 `{status:"ok"}`.
- Layer phase reviews: L0 PASS · L1 PASS · L2 PASS (r2) · L3 PASS (r1) · **L4 PASS (r1, initial build hoàn tất)**.
- **PARTIAL (chưa đo được trong môi trường, đóng ở gate DevOps/prod):** R-22 (Lighthouse Performance ≥90, LCP<2.5s, CLS<0.1), R-23 (emulation chính xác 375/768/1280).

**Test scope:** `spec/test-scope/current.json` → `trigger: initial-build`, `scopeVersion` 3 → **4**, `risk: high`.
