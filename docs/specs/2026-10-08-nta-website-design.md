# Design: NTA Website — Marketing site Next.js (v1)

> **Status:** draft — ⏸ chờ user approve (checkpoint `/start` bước 2).
> **Date:** 2026-10-08 · **Sources:** `SPECIFICATIONS.md` 1.0.0 (27 req), `docs/BRD.md`, `docs/DESIGN.md`,
> `docs/API_SPEC.md`, `docs/ERD.md`, `docs/PERMISSION.md`, `.context/project-config.md`, `.context/brainstorm-log.md`.

---

## Overview

Website giới thiệu công ty NTA (3 mảng giải pháp: Doanh nghiệp / AI / App AI) — content-driven,
song ngữ VI/EN, light minimal kiểu Apple, deploy Cloud Run `asia-southeast1`, domain `ntavietnam.tech`.
Không đăng nhập, không DB, không CMS ở v1.

## Problem Statement

NTA chưa có website tập trung để khách B2B / cơ quan nhà nước tra cứu hồ sơ năng lực, case study
và liên hệ (`docs/BRD.md:16-22`). Cần site ≥ 9 nhóm trang, LCP < 2.5s, Lighthouse ≥ 90, form liên hệ chống spam.

## Approach

**SSG content-driven với file content trong repo** (không CMS, không DB).

Alternatives đã cân nhắc:

| Approach | Ưu | Nhược | Kết luận |
|---|---|---|---|
| **A. SSG + content files (chọn)** | Nhanh, SEO tốt, free, khớp `db_tool: none`, dễ deploy Cloud Run | Content đổi phải redeploy | ✅ **Chọn** — v1 marketing site |
| B. Headless CMS ngay v1 | Content edit không cần dev | Thêm service trả phí/scope creep — BRD Out of Scope (`docs/BRD.md:56`) | ❌ |
| C. SSR-only dynamic | Content realtime | LCP chậm hơn, thừa khi content ít đổi | ❌ |

## Architecture

```
Next.js 15 (App Router) + TypeScript + Tailwind (Tailwind only, không shadcn)
├── src/app/[locale]/…            # i18n route group (next-intl): /vi mặc định không prefix, /en/...
│   ├── page.tsx                  # R-01..R-03 Trang chủ
│   ├── about/                    # R-04
│   ├── solutions/enterprise/     # R-05 (+ [slug] crm|hrm|lms|dentgo)
│   ├── solutions/ai/             # R-06 (+ [slug] boxai|flycam|custom-ai)
│   ├── products/                 # R-07
│   ├── case-studies/             # R-08 (+ [slug])
│   ├── blog/                     # R-09 (+ [slug])
│   ├── contact/                  # R-10
│   └── not-found.tsx             # R-12
├── src/app/api/
│   ├── contact/route.ts          # R-13 + R-18 (rateLimit→validate→honeypot→forward)
│   └── health/route.ts           # R-14
├── src/content/                  # MDX/JSON content: solutions, products, case-studies, blog, about
├── src/components/               # Header/Footer/Button/Card/Section/… (library theo docs/DESIGN.md:136-148)
├── src/i18n/                     # messages vi.json / en.json, hreflang + localized meta (R-20)
└── src/middleware.ts             # locale detection/redirect
```

- **Non-negotiable:** HTTPS (R-19), `next/image` + lazy-load (R-22), meta/OG/sitemap/robots/JSON-LD (R-21),
  semantic HTML + WCAG 2.1 AA (R-24), mobile-first theo thang Tailwind đã chốt (R-23).
- **Tooling:** ESLint (`next lint`) + `tsc --noEmit` — scripts `lint`/`typecheck`/`build`/`install`
  PHẢI được tạo đúng như `.context/project-config.md` → `check_commands`.

## Components

Theo `docs/DESIGN.md` (Component Library + Screen Inventory):

- **Layout:** `Header` (sticky, hamburger + drawer mobile), `Footer` (4 cột desktop), `Section` (default/alternate/accent), `Breadcrumb`.
- **Content:** `SolutionCard/ProductCard/CaseStudyCard/PostCard`, `Timeline` (milestones), `Badge`, `CTABanner`, `PageHeader`.
- **Form:** `ContactForm` (Input/Textarea có label + error; states Default/Validating/Submitting/Success/Error).
- Tokens (màu `#0071E3` primary, `#F5F5F7` alt, type Inter/SF Pro, spacing/radius scale) →
  **bước 3 `/start` (design) sẽ chính thức hóa** thành `skills/<stack>/design-tokens.md` + `.context/design-spec.md`.

## Data Flow

1. **Content:** MDX/JSON trong `src/content/` → import tĩnh vào page → render **SSG** (ISR không cần).
2. **Form liên hệ:** browser → `POST /api/contact` → `rateLimit` → `validate(schema)` → `honeypot`
   (filled → trả `200 ok` giả, không forward) → **forward qua `CONTACT_FORM_TARGET`**
   (`[cần xác nhận]` OQ#4 — interface đã chốt, đích chốt sau) → `{status:"ok"}`.
3. **i18n:** middleware detect locale → `/` = VI, `/en/*` = EN; `hreflang` + localized meta.
4. **Health:** `GET /api/health` → `{status,timestamp}` cho Cloud Run.

## Error Handling

- API: `400 {status:"error",errors}` (validate) · `429` (rate-limit, threshold `[cần xác nhận]`) · 500 không lộ chi tiết.
- Route: `not-found.tsx` cho slug sai (R-05/R-06 404) · form state Error có thông báo rõ.
- Secret chỉ ở server env (R-19) — không `NEXT_PUBLIC_*` cho giá trị nhạy cảm.

## Testing Strategy

- v1 `test_command: null` (chưa có test framework — sẽ chốt lại qua `/brainstorm <nhóm>` khi thêm).
- Gate hiện tại: `npm run lint` + `npm run typecheck` + `npm run build` (đã sync allow rules).
- Khi thêm test: Vitest + Playwright smoke (form 400/429, locale switch, 404) → update project-config.

## Out of Scope

`docs/BRD.md:55-58` + spec Scope: đăng nhập/CMS quản trị · e-commerce · tính năng nghiệp vụ sản phẩm
(CRM/HRM/LMS/DentGo) · DB/migration · payment. Nội dung thật (brand kit, hotline, case study chi tiết)
thay bằng placeholder — `[cần xác nhận]` OQ#1–3.

## Open Questions

1. **[C2/OQ#4]** Form forward tới đâu (email/Resend, Google Sheet, CRM)? → giữ `CONTACT_FORM_TARGET`.
2. **[OQ#1/#2]** Logo, brand color, hotline/email/địa chỉ thật → placeholder env/content dễ thay.
3. **[OQ#5]** Blog static MDX (đã chốt v1) — CMS phase sau nếu cần.
4. Rate-limit threshold (request/window) — chưa doc nào định nghĩa.
5. **C3 (ghi nhận):** `BRIEF.md:50` stale (domain/ngôn ngữ đã chốt ở `BRIEF.md:15-16`) — sửa qua `/change` nếu muốn.
6. Package scripts phải khớp `check_commands` (scaffold layer 0 tạo đủ `lint`/`typecheck`/`build`).

## Critical Design Decisions (đã chốt trong brainstorm)

| Quyết định | Giá trị |
|---|---|
| Breakpoint (C1) | Thang Tailwind: base<640 / sm640 / md768 / lg1024 / xl1280 / 2xl1536 |
| UI library | Tailwind only (không shadcn) |
| Content | Đủ 9 trang, static MDX, ≥2 case study, ≥3–4 sản phẩm |
| Git | `target: main`, `forbidden: main`, `auto_push: false` |
| Models | builder(+strong) `openai/gpt-6-luna` · reviewer/spec-validator/change-request `opencode-go/deepseek-v4.1-flash` |
| Deploy | gcp-cloud-run `asia-southeast1` scale-to-zero, max-instances 3 · CI: github-actions |
