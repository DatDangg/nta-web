# Run Journal — feature/content-database · phase-4-task-01 (CR-031)

```yaml
workItem: feature/content-database
phaseTask: phase-4-task-01
step: cutover
agent: change-request
status: done
attempt: 1
interrupted: false
updatedAt: 2026-10-15T00:00:00+07:00
filesTouched: [see commit]
filesNew: [.context/runs/feature-content-database-phase-4-task-01.md]
evidence:
  builder: "phần A: CONTENT_SOURCE compose+vars, depends_on, target content-tools + nta-tools + content-ops.yml (5 lệnh whitelist, xác nhận gõ chữ), runbook cutover; parity 79 URL lệch 0, slug mới OK, cache post 10KB; test 111 PASS"
  reportPath: .context/review-reports/feature-content-database-phase-4-task-01-round-1-review.md
  round: 1
  verdict: PASS   # phần A; F2-F6 sửa inline, F1 chờ user trước B9
next: "P4-T01 done. Tiếp: P5-T02 (bỏ cờ, chờ ổn định ≥1 ngày + user đồng ý) → close-out CR-031 (spec-validator phase 4/5, spec-publish, archive)"
loopSignal: none
approvals: [{gate: phase_done, phase: 3, at: 2026-10-14, ok: true}, {gate: F1_smoke_edit, choice: a-local-evidence+revalidate-all, at: 2026-10-14, ok: true, by: "user giao agent chọn"}, {gate: B3_import_prod, at: 2026-10-14, ok: true}]
batchQueue: []
```

## History
- 2026-10-14 user duyệt checkpoint phase 3 ("ok làm tiếp P4"). Chia P4-T01: A = chuẩn bị (repo/local, push an toàn) · B = cutover prod (mỗi bước chạm prod hỏi user). ▶ START builder phần A (cancel sẽ redo bước này).
- 2026-10-14 ✅ DONE builder phần A. ▶ START reviewer STRICT round 1 (cancel sẽ redo).
- 2026-10-14 ✅ DONE reviewer phần A STRICT PASS. F2-F6 sửa inline (YAML parse + compose config OK). Commit + push phần A (prod vẫn file). DỪNG chờ user B1.
- 2026-10-14 F1: user giao agent chọn → (a) chấp nhận bằng chứng local (sửa/tạo/xoá mềm → revalidate → web đổi + lịch sử version) + revalidate-all trên prod; thử sửa/rollback trên prod dời sang CR-030 (bot có lệnh sửa). Lý do: không thêm code ngay trước cutover, DB mới nên rủi ro thấp, lệnh sửa sẽ do bot cung cấp.
- 2026-10-14 B1 user chạy Content ops parity: bước Kiểm migration qua (parity chỉ chạy khi applied = expected); DB prod 0 bản ghi, file 136 → parity FAIL 136 "thiếu" đúng kỳ vọng trước import.
- 2026-10-14 B2 backup OK: pre-migrate-ops-backup-20261014T161237Z-38596085130.dump (12.0K, DB schema rỗng) — commit 490f8e1, nta-db healthy.
- 2026-10-14 B3 user xác nhận "ok import".
- 2026-10-14 B4 import-seed OK: backup pre-migrate-ops-import-seed-20261014T163129Z-38598787495.dump; migration applied=2 expected=2; chèn 136 bỏ qua 0; parity PASS 136/136 I-1..I-6 OK.
- 2026-10-14 B5 upload-smoke OK: thư mục owner 1001:1001; backup pre-migrate-ops-upload-smoke-20261014T163435Z-38599228082.dump (176K); created /uploads/c5faaa8c…2766.png 1200x630 91104B asset v1; /uploads 200 + /_next/image 200 (web đang chế độ file).
- 2026-10-14 B6 deploy CONTENT_SOURCE=db OK (490f8e1, backup pre-migrate-490f8e1f93b0-38599790915-1.dump, gate/migrate không có chờ, health OK).
- 2026-10-14 smoke public (agent, chỉ GET): sitemap 52/52 URL 200; 3 redirect oc-eo 301 đúng; slug sai vi 404; /en/*/nope 500 (CR-032 có sẵn); /api/health 200; /_next/image ảnh upload 200; /en x-nextjs-cache HIT; TTFB từ máy agent (VN→VPS) ~0.21–0.25 s cả vi lẫn en (mạng chi phối, vi ≈ en).
- 2026-10-14 B7 revalidate-all OK {revalidated:[content]}. B8 upload-smoke lần 2: reused, /uploads 200 + /_next/image 200 sau recreate container (backup rotate xoá pre-migrate cũ — đã biết, residual). Recrawl sitemap sau B7.
- 2026-10-14 B9 user (SSH): docker logs nta-web grep [content-shape]|[content-store] = 0; docker stop nta-db → /, /en, /blog vẫn 200 → docker start nta-db.
- 2026-10-14 B10a user (SSH ls): daily-20261014T200000Z.dump 179013B + uploads-20261014T200000Z.tar.gz 88082B lúc 20:00 UTC (cùng size với pre-migrate gần nhất). Còn B10b: restore-check.sh + migrate-on-restore.sh.
- 2026-10-15 B10b user (SSH): restore-check daily-20261014T200000Z.dump → nta_restore_check 137/137/2 = nta_web, dropdb; migrate-on-restore → không có migration chờ, PASS, xoá DB tạm. P4-T01 done.
