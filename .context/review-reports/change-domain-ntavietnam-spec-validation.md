# Spec Validation — change/domain-ntavietnam

> **Verdict: PASS**
> **Agent:** spec-validator — chạy **INLINE** bởi change-request (env chặn nested subagent, `subagent_depth=1`;
> theo precedent `change-ai-solution-content-spec-validation.md`, `fix-layer1-dead-links-spec-validation.md`.
> Primary nên re-run validator độc lập nếu cần xác nhận hậu-build.)
> **Ngày:** 2026-10-09 · **Branch:** main (staging-direct) · **Change:** `spec/changes/2026-10-09-domain-ntavietnam.md`
> **Phạm vi đã đọc:** change file; `SPECIFICATIONS.md` (Overview, API Base URL, R-13/R-19/R-21/R-27); `BRIEF.md:15,43`;
> `docs/BRD.md:53,167`; `docs/API_SPEC.md:15-20`; `docs/specs/2026-10-08-nta-website-design.md:12`;
> `spec/updates/2026-10-09-domain-ntavietnam.md`; `spec/CHANGELOG.md`; `spec/test-scope/current.json`;
> `tasks/change-domain-ntavietnam/phase-1-task-01.md`; `.context/project-config.md:51,54,58`.

## 1. Acceptance Coverage (6 mục trong change file)

| # | Acceptance | Requirement / Evidence | Verdict |
|---|---|---|---|
| 1 | `SPECIFICATIONS.md` không còn domain đích cũ; Overview + API prod base URL + R-27 khớp `ntavietnam.tech` | `SPECIFICATIONS.md:23,146,218`; grep `ntasolution.vn` trong file = **0** | PASS |
| 2 | `BRIEF.md` + `docs/BRD.md` không còn ghi domain đích cũ | `BRIEF.md:15,43`; `docs/BRD.md:53,167`; grep = **0** | PASS |
| 3 | `docs/API_SPEC.md` Production = `https://ntavietnam.tech/api` | `docs/API_SPEC.md:19` (đã đúng từ commit `4d8120d` — không cần sửa) | PASS |
| 4 | Không đổi behavior/code app ngoài phần đã deploy; không đổi intent ngoài domain | `git status` = chỉ docs/spec/task; 0 file `src/`/`deploy/`/config trong diff | PASS |
| 5 | Spec Publisher: bump `spec_version` + `spec/updates/` + `spec/test-scope/current.json` | spec 1.1.0 → **2.0.0**; `spec/updates/2026-10-09-domain-ntavietnam.md`; CHANGELOG dòng mới; scope v5 → **v6** | PASS |
| 6 | `npm run lint` / `typecheck` / `build` PASS | lint exit 0 (1 warning `<img>` pre-existing), typecheck exit 0, build exit 0 (SSG đường dẫn đầy đủ) | PASS |

## 2. Findings

### CRITICAL
- (none)

### MAJOR
- (none)

### MINOR
- **m-1 (đã xử lý):** literal `ntasolution.vn` xuất hiện trong ghi chú "cập nhật" của SPECIFICATIONS/BRIEF
  → có thể fail grep acceptance. **Đã xoá** literal khỏi target docs; old→new chỉ còn trong
  `spec/updates/2026-10-09-domain-ntavietnam.md` (đúng chỗ để lưu delta).
- **m-2 (ghi nhận, ngoài scope):** `BRIEF.md:43` / `docs/BRD.md:53` / R-27 vẫn ghi "Google Cloud Run"
  trong khi thực tế deploy = **docker-vps** (`.context/project-config.md:51,58`). Đây là drift **ngoài domain**,
  đã ghi chú trong R-27 + spec update; cần change riêng reconcile (không hạ cấp/đổi ở đây theo ràng buộc change).
- **m-3 (ghi nhận):** `.context/compressed-summary.md:37` — cập nhật domain (context cache); các file
  `tasks/*.md` + `.context/runs/*` + `.context/review-reports/*` giữ `ntasolution.vn` là **bản ghi lịch sử**
  (point-in-time) — KHÔNG sửa (tránh rewrite history).

### Ghi nhận (không phải defect)
- Deploy thực tế đã live + verify ngoài (commit `00f2560`): DNS A → `187.52.119.50`, certbot hạn 2027-01-07,
  7 route = 200, canonical/robots/sitemap/llms.txt đúng domain mới — **evidence**, không làm lại.
- `specVersion` MAJOR bump hợp lý: domain là canonical contract (R-27 + API base + SEO) → "đổi ngữ nghĩa
  requirement" theo `docs/SPEC_VERSIONING.md`. Không phải PATCH (không chỉ wording) / MINOR (không thêm req).

## 3. Conflict check
| Đối tượng | Kết quả |
|---|---|
| `SPECIFICATIONS.md` vs `BRIEF.md` vs `docs/BRD.md` vs `docs/API_SPEC.md` | ✅ đồng bộ `ntavietnam.tech` |
| `spec/CHANGELOG.md` ↔ `spec/updates/` ↔ `spec/test-scope/current.json` | ✅ 2.0.0 / v6 khớp |
| Code/config (`src/lib/seo.ts`, deploy/nginx, docker-compose, deploy.yml, public/llms.txt) | ✅ đã `ntavietnam.tech` (commit `4d8120d`) |
| Change `2026-10-09-change-UI.md` | ✅ KHÔNG đụng — còn `status: pending` |

## 4. Verdict
**PASS** — spec delta đầy đủ, khớp deploy thực tế, không đổi code/behavior ngoài domain, publish hợp lệ.
Residual: m-2 (deploy platform drift) ngoài phạm vi.
