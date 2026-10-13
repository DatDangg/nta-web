# Spec Update — 2026-10-13 add-domain-ntasolution

**spec_version:** 3.4.0 → **3.5.0 (MINOR)**
**Trigger:** feature-update
**Change:** `spec/changes/2026-10-13-add-domain-ntasolution.md` (CR-005)
**Scope sinh:** scopeVersion 26 → **27** (`spec/test-scope/current.json`)

## Requirements

- **THÊM (mở rộng R-27)** — domain phụ phục vụ cùng site:
  `ntasolution.vn` (+ `www.ntasolution.vn`) là **lối vào thứ hai** cho **cùng app/nội dung**
  (nginx vhost riêng → `127.0.0.1:3005`, cùng container `nta-web`).
  - `www.ntasolution.vn` → **301** apex `ntasolution.vn` (tránh 3 hostname trùng nội dung).
  - HTTPS Let's Encrypt cho **apex + www**; `http://` → **301** `https://`.
  - **KHÔNG** redirect qua lại giữa `ntasolution.vn` và `ntavietnam.tech` (user chốt: "vào cái nào cũng được").
- **KHÔNG đổi canonical/SEO contract:** `NEXT_PUBLIC_SITE_URL=https://ntavietnam.tech` giữ nguyên;
  `src/lib/seo.ts`, `public/llms.txt`, `sitemap.xml`, `robots.txt`, `.github/workflows/deploy.yml` **không sửa**.
  Trang trả về trên domain phụ vẫn mang `rel=canonical` = `https://ntavietnam.tech/...`.
- **R-27 vẫn đúng** cho phần domain chính: `ntavietnam.tech` giữ nguyên hành vi (200, HTTPS, cert còn hạn).

## Lý do bump MINOR (không phải MAJOR, không phải "không bump")

- **MINOR** vì đây là **thêm nghĩa vụ deploy mới** (hostname public thứ hai + cert + redirect www→apex),
  không phải chỉ làm rõ wording.
- **Không MAJOR** vì **không xoá/đổi ngữ nghĩa** requirement hiện có: canonical contract, SEO, hành vi
  `ntavietnam.tech`, API base URL, deploy platform đều giữ nguyên.
- **Không được "không bump"**: R-27 (`SPECIFICATIONS.md:293-297`) liệt kê **domain đang phục vụ**; sau change này
  hệ thống phục vụ **2 domain** → nếu giữ nguyên spec thì spec **thiếu/sai so với as-built** (drift).

## Ảnh hưởng

- **Hạ tầng (VPS shared):** thêm 1 vhost nginx + 1 cert lineage (`/etc/letsencrypt/live/ntasolution.vn/`);
  không đụng container/app khác (ismartschool, crm-dhp, tmfoods) và không đụng vhost `ntavietnam.tech`.
- **Không ảnh hưởng code app / build:** `NEXT_PUBLIC_SITE_URL` là build-time, giữ nguyên ⇒ không rebuild,
  không đổi canonical/hreflang/og/sitemap/robots/llms.txt.
- **Không đổi API contract** (`/api/health`, `/api/contact` giữ nguyên; route qua domain phụ cũng chạy cùng app).
- **Rate-limit `/api/contact`:** vẫn dựa IP thật qua `X-Forwarded-For` (`$proxy_add_x_forwarded_for`) — vhost mới
  set cùng bộ header với vhost hiện có ⇒ không đổi hành vi.
- **Test template:** cần test được cả 2 hostname (redirect matrix + canonical giữ nguyên) → scope v27.

## Files spec

- `SPECIFICATIONS.md` — frontmatter `spec_version` 3.5.0 + Overview note + mở rộng R-27.
- `spec/CHANGELOG.md` — 1 dòng 3.5.0.
- `spec/test-scope/current.json` — `specVersion` 3.5.0, `scopeVersion` 27, trigger `feature-update`.
