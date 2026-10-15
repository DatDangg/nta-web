# Review — feature-ai-news-cron-saturday phase-1-task-01 (CR-036) — round 1

Agent: reviewer
Ngày: 2026-10-15

## Review level
FAST

## Reason
Đổi 1 dòng `cron` trong `.github/workflows/ai-news.yml` + doc. Không đụng code app/API/schema/auth/DB/shared component;
`workflow_dispatch`, concurrency, permissions, 2 job `digest`/`publish-db` giữ nguyên (diff chỉ dòng 10). Cron/workflow là
risk đỏ trên danh nghĩa, nhưng thay đổi chỉ là thời điểm kích hoạt, logic dedupe ISO week (`generate.py check`) không đổi
và đã có unittest → FAST đủ (xác nhận lại đề xuất).

## Blast radius
- Thời điểm chạy tự động bản tin AI tuần (thứ 2 → thứ 7, 08:00 VN). Không ảnh hưởng runtime web, DB schema, deploy.yml.
- Doc as-built: runbook, tools/ai-news README, DESIGN.md, content-bot 00/01/10.

## Verify commands + result
| Kiểm | Kết quả |
|---|---|
| `git diff -- .github/workflows/ai-news.yml docs/ tools/ai-news/README.md tasks/feature-ai-news-cron-saturday/` | Workflow chỉ đổi dòng 10 `'0 1 * * 1'` → `'0 1 * * 6'` + comment; jobs/dispatch không đổi — PASS |
| Cron semantics | `0 1 * * 6` = 01:00 UTC thứ 7 = 08:00 thứ 7 giờ VN (UTC+7, không DST) — PASS |
| Grep `0 1 * * 1` / "thứ 2" ở `.github`, `docs`, `tools/ai-news`, `SPECIFICATIONS.md` | Không còn `0 1 * * 1`; "thứ 2" chỉ còn ngữ cảnh lịch sử/ISO week (runbook:3,12,13; SPEC:302,306). Các file khác (spec/updates cũ, archive, tasks cũ, review cũ) là lịch sử — PASS |
| Đối chiếu SPECIFICATIONS.md R-09c (302-307) | Runbook/README/DESIGN/content-bot khớp: thứ 7 08:00 VN, `0 1 * * 6`, + chạy tay, ISO week tuần chạy, `date` = ngày chạy, tối đa 1 bài/tuần — PASS |
| `docs/content-bot/10-server.md:32` vs ai-news.yml | Mô tả "commit file seed main → job publish-db chèn DB (insert-only) → revalidate → smoke, KHÔNG dispatch deploy.yml" khớp workflow dòng 6-7, 143-244 — PASS (sửa luôn mô tả lỗi thời "dispatch deploy.yml") |
| Hệ quả 17/10 | `src/content/blog/{vi,en}/ai-weekly-2026-w42.mdx` tồn tại (date 2026-10-15) → `check` = skip; publish-db vẫn chạy (if `check.status == 'skip'`, dòng 126) — PASS |
| ISO week | ISO W1/2026 bắt đầu thứ 2 29/12/2025 → W42 = 12–18/10, W43 = 19–25/10 → 17/10 = w42, 24/10 = w43 (khớp test_ai_news.py:184: 2026-10-12 VN = w42) — PASS |
| `generate.py week_info` | `now.astimezone(VN_TZ).isocalendar()` — độc lập ngày trong tuần, không cần đổi — PASS |
| actionlint / unittest 76 / `npm run lint` / `npm run typecheck` | Theo builder (task file Verification summary): PASS (actionlint chỉ lỗi label self-hosted `nta-web` có sẵn). Reviewer không chạy lại (permission bash giới hạn; thay đổi không đụng TS/Python) |

## Findings
- INFO-1 (không chặn): comment workflow dòng 123 "chạy sát nửa đêm CN→T2" vẫn đúng (áp dụng cho chạy tay `workflow_dispatch`), không cần sửa.
- INFO-2 (residual risk): chưa verify lịch thật trên GitHub Actions (lượt 17/10 skip, 24/10 sinh w43) — chỉ kiểm được sau push; GitHub cron có thể trễ (runbook đã ghi).

Không có finding CRITICAL/HIGH/MEDIUM.

## Verdict
PASS
