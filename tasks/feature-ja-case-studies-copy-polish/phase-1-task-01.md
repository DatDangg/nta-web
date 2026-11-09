# CR-046 · phase-1-task-01 — Biên tập lại nội dung ja trang Case Studies (DB prod)

- Change doc: `spec/changes/archive/2026-11-09-ja-case-studies-copy-polish.md`
- Status: done (2026-11-09)

## Classification / Risk
- **MODIFY — content-only.** Chỉ đổi giá trị chuỗi ja trong DB; không đổi code, schema, route, requirement → **không bump spec_version** (vẫn sinh test-scope khi close-out).
- Risk: **MEDIUM** — ghi DB prod (`--confirm-prod`), nhưng chỉ bản ghi locale `ja`, mỗi bản ghi có `version` + `rollback`; vi/en không đụng.

## Bản ghi dự kiến (xác nhận bằng `show` trước khi sửa)
| Bản ghi | Nội dung sửa |
|---|---|
| `listing_page/ja/case-studies` | hero (現場の課題を、/ デジタルの力で解決), mô tả, 3 điểm nổi bật |
| `listing_item/ja/*` (2 thẻ: dental, heritage) | tiêu đề phụ + mô tả thẻ |
| `listing_cta/ja/case-studies` | 次のプロジェクトを、NTAとともに + câu mời |
| `case_study/ja/dental-clinic-operations` | bảng 3 + nhất quán (入金額 / 診療 / 未収金残高 / dấu `：`) |
| `case_study/ja/heritage-site-ai-camera` | bảng 2 + エッジAI + 人物を検知 |

Tên collection/slug chính xác lấy từ `list --locale ja`; không đoán.

## Các bước
1. `list --locale ja` → `show` từng bản ghi trên → lưu bản gốc (id, version, data) vào scratchpad.
2. Soạn `data` đầy đủ (bản `show` + field sửa, giữ thứ tự key) — `update` thay toàn bộ `data`.
3. Gửi user diff "trước → sau" theo field → **chờ duyệt**.
4. Backup: `docker exec nta-db-backup /scripts/backup.sh pre-cr046-ja-copy-<UTC>` → kiểm `OK`.
5. `update … --expected-version <N> --actor dev:claude-cr046 --note "CR-046 ja copy polish" --confirm-prod` từng bản ghi.
6. `revalidate --collection case_study` + `listing_page` / `listing_item` / `listing_cta`.
7. Verify: fetch 3 trang `/ja/...` live → đủ câu mới, không còn cụm cấm (acceptance), vi/en không đổi.

## Verification summary
- Bản ghi thật (list --locale ja): thẻ listing_item chỉ giữ icon/theme — chữ thẻ lấy từ case_study → sửa 4 bản ghi, không phải 6.
- Script soạn bản sửa: 42 thay thế, mỗi chuỗi khớp đúng 1 lần; cấu trúc key `data` giữ nguyên; 41 field đổi (page 9, cta 2, dental 18, heritage 12).
- Backup `ops-cr046-ja-copy-20261109T082252Z.dump` (324K) OK.
- `update --expected-version 1 --actor dev:claude-cr046 --confirm-prod` ×4 → v2, exit 0. Revalidate case_study / listing_page / listing_cta OK.
- Live: 3 trang /ja có đủ câu mới; 0 cụm cấm (回収済み売上, 治療セッション, 機密を保つ, 在庫上で, 同じ姿, 死角のない, 不審人物, 未収残高, 課題起点, 貴組織). /en vẫn bản cũ, / (vi) 200.
- Review: FAST (không có code diff). Rollback: `rollback <key> --to 1 --expected-version 2`.

## Retry / Escalation
- `update` exit 1 (validate/conflict) → `show` lại, soạn lại, không ghi đè. 3 lần fail → `architecture_review_needed`.
- Sai nội dung sau khi ghi → `rollback --to <version cũ>`.
