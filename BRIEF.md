# Project Brief

## Project Name
**NTA Website** — Trang web công ty NTA

## Description
Website giới thiệu năng lực, sản phẩm và giải pháp của công ty NTA gồm 3 mảng:
**(1) Giải pháp doanh nghiệp** (CRM, HRM, LMS, phần mềm phòng khám DentGo),
**(2) Giải pháp AI** (BoxAI — camera edge AI, flycam/drone tuần tra & khảo sát, AI tùy chỉnh),
**(3) App AI** (music app, app đổi kiểu tóc bằng AI).

Mục tiêu: trang giới thiệu (marketing/showcase) hướng B2B — giúp khách doanh nghiệp & cơ quan
nhà nước hiểu năng lực NTA, xem case study tiêu biểu (vd Óc Eo), và liên hệ/tư vấn.

> ✅ Đã chốt (08/10/2026): **Domain `ntavietnam.tech`** _(cập nhật 09/10/2026 — canonical `https://ntavietnam.tech`, HTTPS apex)_ · **Song ngữ VI/EN** (i18n, mặc định VI có toggle EN) ·
> Đối tượng **cả nhà nước lẫn tư nhân** · Phong cách **minimal ấn tượng kiểu Apple** (light, nhiều whitespace, typography lớn).
**Không** phải hệ thống nghiệp vụ có đăng nhập — đây là website giới thiệu (content-driven).

## Target Users
- **Khách doanh nghiệp (B2B):** cần CRM/HRM/LMS/phần mềm chuyên ngành.
- **Khách cơ quan nhà nước / dự án:** quan tâm giải pháp AI, giám sát, flycam (cần hồ sơ năng lực).
- **Đối tác & nhà tuyển dụng:** xem năng lực, team, dự án.
- **Người dùng app:** quan tâm app AI (music, hair-style).

## Core Features
- Trang chủ: hero + 3 mảng giải pháp + sản phẩm tiêu biểu + CTA liên hệ
- Trang "Về NTA": sứ mệnh, năng lực, team, milestones, đối tác
- Giải pháp Doanh nghiệp: CRM / HRM / LMS / DentGo (mỗi giải pháp 1 trang con)
- Giải pháp AI: BoxAI, Flycam/Drone, AI tùy chỉnh (trang con + case study)
- Sản phẩm App: Music app, Hair-style AI
- Case Study / Dự án tiêu biểu (Óc Eo, triển khai phòng khám…)
- Tin tức / Blog
- Liên hệ: form, hotline, map, thông tin công ty
- Footer: điều hướng, pháp lý, social

## Non-functional Requirements
- **Performance:** LCP < 2.5s trên 4G; ảnh tối ưu (next/image), lazy-load.
- **SEO:** SSR/SSG, meta tags + OpenGraph per page, `sitemap.xml`, `robots.txt`, JSON-LD Organization.
- **Responsive:** mobile-first, đủ 4 breakpoint (375 / 768 / 1280+), đúng luật `skills/responsive-web`.
- **Accessibility:** WCAG 2.1 AA — contrast, keyboard nav, alt text, semantic HTML.
- **Security:** HTTPS only; form liên hệ có rate-limit + chống spam; không lộ secret.
- **Language:** song ngữ Việt/Anh (i18n `next-intl` hoặc `next-i18n`; mặc định VI, toggle EN; `/en/...` routes).
- **Deploy:** docker-vps — VPS `187.52.119.50` (Docker + nginx + certbot, container `nta-web` `127.0.0.1:3005`); domain `ntavietnam.tech` (live 09/10/2026 — HTTPS apex).

## Notes
- Stack đề xuất: **Next.js (App Router) + TypeScript + Tailwind CSS**, theme **light minimal kiểu Apple**.
- Ảnh/diagram: dùng skill `archify` cho sơ đồ kiến trúc nếu cần.
- Deploy doc: `docs/runbook/deploy-vps.md`.
- Dàn ý & context đầy đủ: `memory/projects/nta-website.md` (workspace Eve).
- ⚠️ Còn thiếu (xem Open Questions trong `docs/BRD.md`): logo, brand color chính thức, domain, ngôn ngữ, hotline/email thật.
