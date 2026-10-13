# Spec validation — feature `add-domain-ntasolution` (CR-005)

- **Change:** `spec/changes/2026-10-13-add-domain-ntasolution.md`
- **Delta:** `spec/updates/2026-10-13-add-domain-ntasolution.md` (spec 3.4.0 → 3.5.0, MINOR)
- **Ngày:** 2026-10-13 · **Người chạy:** agent `change-request` (inline self-check)
- **Verdict:** ✅ **PASS**

> ⚠️ Report này chạy **inline trong agent `change-request`** (môi trường chặn spawn subagent lồng — cùng pattern
> đã gặp ở `change-domain-ntavietnam` / `change-deploy-platform-docker-vps` / `change-cleanup-gcp-drift-comment-permission`).
> Primary NÊN re-run `spec-validator` độc lập nếu muốn second opinion. Không sửa source trong report này.

## 1. Cross-check delta vs spec

| Điểm kiểm | Kết quả |
|---|---|
| R-27 (`SPECIFICATIONS.md:293-297`) có liệt kê domain đang phục vụ không? | CÓ — "domain `ntavietnam.tech` (live 2026-10-09 …)" ⇒ thêm domain phụ là **thay đổi requirement-level**, spec phải cập nhật |
| Delta có đổi canonical contract không? | KHÔNG — `NEXT_PUBLIC_SITE_URL`, `src/lib/seo.ts`, sitemap, robots, llms.txt, `deploy.yml` giữ nguyên ⇒ **không MAJOR** |
| Delta có thêm nghĩa vụ mới không? | CÓ (hostname public thứ hai + cert apex+www + www→301 apex) ⇒ **MINOR** hợp lệ theo `docs/SPEC_VERSIONING.md` |
| R-19 (HTTPS only, http→HTTPS) có bị vi phạm không? | KHÔNG — domain phụ cũng enforce HTTPS + http→301 |
| R-21 (SEO canonical/sitemap/robots/llms.txt) có drift không? | KHÔNG — canonical vẫn `ntavietnam.tech`; domain phụ là entry point thứ hai, 1 canonical duy nhất |
| R-13/R-22 API base URL có đổi không? | KHÔNG — API prod base URL vẫn `https://ntavietnam.tech/api` |
| `db_tool: none` ⇒ migration gate | N/A (bỏ qua) |

## 2. Cross-check acceptance ↔ code/docs thực tế

| Acceptance (change file) | Trạng thái trước change | Ghi chú |
|---|---|---|
| nginx vhost mới proxy app | FAIL (rơi default server block) | cần `deploy/nginx/ntasolution.vn.conf` + apply trên VPS |
| `www` → 301 apex | FAIL | www CNAME → apex, chưa có vhost khớp |
| HTTPS apex+www (certbot) | FAIL (`SEC_E_WRONG_PRINCIPAL`) | chưa có cert cho domain mới |
| `https://ntasolution.vn/` + `/en` = 200 | FAIL | phụ thuộc 3 mục trên |
| canonical vẫn `ntavietnam.tech` | PASS (by design) | `src/lib/seo.ts:4` dùng `NEXT_PUBLIC_SITE_URL`; app **không** có redirect theo host (đã kiểm `next.config.ts`, `src/**`) |
| `ntavietnam.tech` không đổi hành vi | PASS (baseline) | không sửa vhost/cert/env của domain chính |
| không sửa deploy.yml/seo/llms/sitemap/robots | PASS | change file ràng buộc; task ghi rõ |

- Không thấy **conflict** giữa change file và `SPECIFICATIONS.md` khác ngoài mục R-27 đã nêu.
- Không có requirement mơ hồ cần hỏi lại: acceptance trong change file đã đủ (user đã chốt "vào cái nào cũng được").

## 3. Gap / follow-up ghi nhận (không chặn plan)

1. **Intent docs** (`BRIEF.md`, `docs/BRD.md`, `docs/specs/2026-10-08-nta-website-design.md`) ghi "domain chính thức =
   `ntavietnam.tech`" — **vẫn đúng** (domain chính thức không đổi) ⇒ **no intent-doc change** cho change này.
2. **`docs/DESIGN.md`** không mô tả hosting/domain ⇒ no doc impact.
3. Vhost trên VPS sau `certbot --nginx` sẽ khác bản trong repo (certbot chèn block 443) — ghi rõ trong runbook §3b; không sync ngược về repo.
4. Concurrency: CR-004 (`shared-detail-showcase-template`) đang in_progress; `spec/test-scope/current.json` bị CR-005 ghi đè (v26 → v27). Bản v26 còn ở git HEAD `344bf48`; CR-004 publish lại ở close-out thì đọc file tại thời điểm đó.

## 4. Kết luận

Delta hợp lệ, version đúng cấp (MINOR), không tạo conflict với requirement khác, acceptance testable ngoài (curl).
→ **Cho phép chia phase/task** (2 task: repo-side + VPS apply/verify).
