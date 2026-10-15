# Review — feature-ai-news-item-images phase-1-task-04 — round 3

Agent: reviewer

- Review level: STRICT (workflow CI/CD prod + runbook thao tác prod, upload/file access)
- Reason: vòng cuối, xác nhận đóng MAJOR-2 round 2 + không hồi quy các finding đã đóng.
- Blast radius: `.github/workflows/ai-news.yml`, `docs/runbook/ai-news.md`, `docs/DESIGN.md`, `tools/ai-news/README.md` (chỉ docs + workflow, không đổi src).
- Verify commands: `grep -rn force-recreate docs tools .github .agent` → chỉ 1 dòng (cảnh báo KHÔNG dùng) tại `docs/runbook/ai-news.md:141`; `git diff` toàn T04 đã xem. Không có code app đổi → typecheck/build không chạy lại (không liên quan).

## Trạng thái finding cũ

| Finding | Trạng thái | Evidence |
|---|---|---|
| MAJOR-2 (round 2) force-recreate thiếu env prod | **Đóng** | `docs/runbook/ai-news.md:136-142` §8 bước 4 chỉ còn `docker exec nta-web rm -rf /app/.next/cache/images`; dòng 141-142 cảnh báo **KHÔNG** `docker compose up --force-recreate nta-web` (lý do: thiếu `CONTENT_SOURCE=db`, `CONTACT_FORM_TARGET` → đọc seed, ảnh hiện lại), cần tạo lại container → chạy workflow Deploy (tên thực `Deploy (VPS)`, `.github/workflows/deploy.yml:1`). Không còn chỗ nào khác trong `docs/`, `tools/`, `.github/`, `.agent/` gợi ý force-recreate / `up -d nta-web`. |
| MAJOR-1 (round 1) thiếu xoá cache next/image | Đóng | Như round 2; lệnh xoá cache giữ nguyên. |
| MINOR-1 (round 1) tên bước cũ | Đóng | `ai-news.yml` bước "Generate items (LLM + guard)"; diff workflow không đổi so với round 2. |
| Workflow YAML (tách key generate/render, artifact trước push, dry-run `--images-dir` chỉ khi có manifest, regex `missing` chỉ dòng bài, smoke ảnh, dọn tạm `always()`) | Đạt (không đổi) | `git diff .github/workflows/ai-news.yml`. |
| DESIGN.md / tools/ai-news/README.md | Đạt | Mô tả khớp workflow (generate có key → render không key → artifact 7 ngày → publish-db `--images-dir`). |

## Findings mới

Không có.

## Verdict: **PASS**
