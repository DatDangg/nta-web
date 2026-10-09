# Spec Validation — change-deploy-platform-docker-vps (phase-1-task-01)

- **Ngày:** 2026-10-09
- **Change:** `spec/changes/archive/2026-10-09-deploy-platform-docker-vps.md` (MODIFY, risk LOW)
- **Spec:** `SPECIFICATIONS.md` 2.0.0 → **3.0.0** (MAJOR) · scope v6 → **v7**
- **Scope:** docs-only (0 dòng code app)
- **Review level:** NORMAL (doc-only, không auth/schema/data/API-contract thực thi)

## Cross-check acceptance vs thực tế

| # | Acceptance | Kết quả | Evidence |
|---|---|---|---|
| 1 | Không còn mô tả Cloud Run / `asia-southeast1` scale-to-zero / free tier GCP trong intent docs | ✅ PASS | `grep -E "Cloud Run\|asia-southeast1\|free tier\|gcp-cloud-run\|GCP"` trên 6 file đã sửa = **0 matches** |
| 2 | Deploy mô tả đúng docker-vps (VPS `187.52.119.50`, Docker + nginx + certbot, port 3005, CI self-hosted runner) | ✅ PASS | `SPECIFICATIONS.md:43,217-219`; `BRIEF.md:43`; `docs/BRD.md:53,156`; `docs/specs/...design.md:12,115` |
| 3 | R-27 + R-14 khớp platform mới; note drift `:220` gỡ | ✅ PASS | `SPECIFICATIONS.md:153` (R-14), `:217-221` (R-27 + note reconcile) |
| 4 | Không đổi behavior/code; domain `ntavietnam.tech` giữ nguyên | ✅ PASS | git status không có file trong `src/`/`deploy/`/config; domain giữ nguyên mọi file |
| 5 | Spec Publisher: bump + updates + CHANGELOG + test-scope | ✅ PASS | `spec/updates/2026-10-09-deploy-platform-docker-vps.md`; `spec/CHANGELOG.md`; `spec/test-scope/current.json` (specVersion 3.0.0, scopeVersion 7) |
| 6 | Verify lint/typecheck/build | ⏭ N/A (docs-only) | Không có thay đổi code → không bắt buộc; code hiện có đã PASS trước đó. JSON scope hợp lệ (`python3 -m json.tool` OK) |

## Kiểm tra nhất quán spec

- **Bump MAJOR đúng chuẩn?** ✅ `docs/SPEC_VERSIONING.md`: "MAJOR — xoá requirement / đổi ngữ nghĩa requirement".
  Nền tảng deploy (R-27) đổi mô hình vận hành hoàn toàn (serverless GCP → self-hosted VPS) → đổi **ngữ nghĩa**, không phải chỉ làm rõ wording (PATCH) hay thêm requirement (MINOR).
- **Availability:** giữ target ≥ 99.5% nhưng bỏ nhãn "Cloud Run SLA" (`docs/BRD.md:127` → "đo uptime thực tế trên VPS"); không bịa SLA mới. ✅
- **Không hạ cấp/đổi ngoài scope:** domain, `.devops/templates/*`, `docs/PERMISSION.md`, và bản ghi lịch sử (review-reports/runs/tasks/spec-updates cũ) giữ nguyên. ✅
- **0 dòng code:** chỉ intent docs + context cache + spec artifacts. ✅

## Findings

- Không có CRITICAL/MAJOR.
- **MINOR (ghi nhận, ngoài scope):** comment trong `src/lib/api/rate-limit.ts` (hoặc tương đương) vẫn ghi tên platform cũ ("Cloud Run/GFE") — code **ngoài phạm vi** change docs; ghi residual trong `.context/compressed-summary.md`. Nếu muốn dọn, cần change code riêng.

## Verdict

**PASS** — spec delta khớp acceptance của change; 0 ref drift trong các file đã sửa; spec version + test-scope đã publish hợp lệ.
