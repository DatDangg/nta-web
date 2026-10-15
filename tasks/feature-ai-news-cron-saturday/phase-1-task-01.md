# feature-ai-news-cron-saturday · phase-1-task-01 — đổi cron ai-news sang 08:00 thứ 7 giờ VN + đồng bộ doc

- **CR:** CR-036 · change doc `spec/changes/2026-10-15-ai-news-cron-saturday.md` · liên quan CR-019 (R-09c), CR-034, CR-035
- **Classification / Risk:** MODIFY (lịch chạy pipeline nội dung tự động) · **LOW**
  - Expected review level: **FAST** — 1 dòng cron + comment/doc; không đổi code Python/TS, DB, API, auth. (CI/workflow file nhưng chỉ đổi `schedule`, không đổi job/permission/secret.)
  - Blast radius: `.github/workflows/ai-news.yml` (dòng `schedule`), doc nhắc lịch. Không đổi `tools/ai-news/generate.py` (`week_info` theo ISO week giờ VN, độc lập thứ), không đổi test.
  - Doc impact: `docs/runbook/ai-news.md:3`, `tools/ai-news/README.md:3`, `docs/DESIGN.md:288`, `docs/content-bot/00-overview.md:35`, `docs/content-bot/01-site-map.md:44`, `docs/content-bot/10-server.md:32` (dòng này còn ghi "dispatch deploy.yml" đã lỗi thời từ CR-034 → sửa luôn cho đúng hiện trạng: chèn DB qua `publish-db`).
  - Lịch sử KHÔNG sửa: `spec/CHANGELOG.md` dòng 3.13.0, `spec/updates/2026-10-14-*`, task/review report cũ (ghi nhận quá khứ).
  - Migration gate: không áp dụng (`db_tool` không bị đụng).

## Spec delta (R-09c) — áp qua spec-publisher, đề xuất **MINOR 4.3.0 → 4.4.0**
`SPECIFICATIONS.md:302` thay `(cron 08:00 thứ 2 giờ VN + chạy tay workflow_dispatch)` →
`(cron 08:00 thứ 7 giờ VN — `0 1 * * 6` UTC — + chạy tay workflow_dispatch; CR-036 đổi từ thứ 2)`.
Thêm 1 câu: "Bài thứ 7 mang số ISO week của chính tuần đó (thứ 2 → CN, giờ VN); `date` frontmatter = ngày chạy."
Lý do MINOR (không PATCH): đổi behavior quan sát được (ngày đăng bài) — `docs/SPEC_VERSIONING.md` PATCH chỉ cho "không đổi behavior".

## Scope
1. `.github/workflows/ai-news.yml:10` → `- cron: '0 1 * * 6' # 08:00 thứ 7 giờ Việt Nam (UTC+7) — CR-036`. Giữ `workflow_dispatch`, concurrency, jobs nguyên.
2. Sửa các dòng doc ở Doc impact cho đúng lịch mới.
3. Không đổi `generate.py`: đã kiểm `week_info` (`generate.py:71-80`) dùng `isocalendar()` giờ VN; câu mở bài "trong tuần qua" (`:229`) và excerpt "trong tuần {N}/{năm}" (`:191,194`) vẫn đúng khi chạy thứ 7 (bài thứ 7 = tuần hiện tại, trước đây thứ 2 = tuần mới vừa bắt đầu nên lệch ngữ nghĩa — review CR-019 MINOR-7; đổi sang thứ 7 khắc phục luôn).
4. Test `tools/ai-news/tests/test_ai_news.py:185-195` dùng mốc giờ cố định, không giả định thứ 2 → không sửa.

## Hệ quả vận hành (ghi vào runbook)
- Thứ 7 17/10/2026 (w42): w42 đã có trên main → `check` = `skip` (job `publish-db` vẫn chạy tự lành, insert-only).
- Bài tự động kế tiếp: **thứ 7 24/10/2026 → `ai-weekly-2026-w43`**. Không còn lượt thứ 2 19/10.
- `date` frontmatter bài = ngày chạy (thứ 7), slug theo ISO week giờ VN; mỗi tuần tối đa 1 bài; bài cũ không đổi.
- GitHub cron có thể trễ vài–vài chục phút lúc tải cao (đã đúng từ trước).

## Verification plan
- `actionlint .github/workflows/ai-news.yml` (nếu có; không có → `python -c "import yaml; ..."` parse YAML + assert `on.schedule[0].cron == '0 1 * * 6'`).
- Kiểm cron: `0 1 * * 6` = 01:00 UTC thứ 7 = 08:00 thứ 7 giờ VN (UTC+7, không DST).
- `grep -rn "0 1 \* \* 1\|thứ 2" .github docs tools/ai-news/README.md SPECIFICATIONS.md` → chỉ còn ngữ cảnh lịch sử (không phải lịch hiện hành).
- `python -m unittest discover -s tools/ai-news/tests` (docker `python:3.13-slim`) — regression, kỳ vọng PASS không đổi.
- Không đụng src/ → typecheck/lint/build: chạy `npm run lint` + `npm run typecheck` cho gate auto-push (build không bắt buộc vì 0 file web; ghi rõ trong report).
- Sau deploy: GitHub → Actions → "AI News Weekly" hiển thị lịch mới; xác nhận lượt 17/10 `skip`, 24/10 sinh w43.

## Acceptance
- [ ] Cron `0 1 * * 6`, không còn lịch thứ 2; `workflow_dispatch` giữ nguyên.
- [ ] Slug ISO week giờ VN, ≤ 1 bài/tuần; bài cũ không đổi.
- [ ] R-09c (spec 4.4.0), runbook, README tools, DESIGN, docs content-bot ghi đúng lịch mới.

## Retry / Escalation
- Mỗi attempt FAIL thật (reviewer/verify) → sửa trên đĩa, tăng `attempt`; cancel ≠ fail.
- 3 attempt FAIL → `architecture_review_needed`, dừng báo user.

## Verification summary
Builder attempt 1 — 2026-10-15:
- **File đổi:** `.github/workflows/ai-news.yml` (cron `0 1 * * 6` + comment CR-036; `workflow_dispatch`/concurrency/jobs giữ nguyên), `docs/runbook/ai-news.md` (dòng 3 lịch + đoạn "Hệ quả đổi lịch" 17/10 skip, 24/10 = w43, không còn 19/10, `date` = ngày chạy), `tools/ai-news/README.md:3`, `docs/DESIGN.md:288`, `docs/content-bot/00-overview.md:35`, `docs/content-bot/01-site-map.md:44`, `docs/content-bot/10-server.md:32` (bỏ "dispatch deploy.yml" lỗi thời → `publish-db` chèn DB, insert-only, KHÔNG dispatch deploy).
- **actionlint** (`docker rhysd/actionlint:latest`, `MSYS_NO_PATHCONV=1`): chỉ 2 lỗi `runner-label` "nta-web" unknown (label self-hosted tùy biến, có sẵn từ trước, không liên quan schedule); chạy lại với `-ignore 'label "nta-web" is unknown'` → exit 0 PASS.
- **YAML assert** (node + js-yaml): `on.schedule[0].cron == '0 1 * * 6'` → PASS. `0 1 * * 6` = 01:00 UTC thứ 7 = 08:00 thứ 7 giờ VN (UTC+7, không DST).
- **grep** `0 1 \* \* 1|thứ 2` trên `.github docs tools/ai-news/README.md SPECIFICATIONS.md`: không còn `0 1 * * 1`; "thứ 2" chỉ còn ngữ cảnh lịch sử/ngữ nghĩa ISO week ("CR-036 đổi từ thứ 2", "thứ 2 → CN", "không còn lượt thứ 2 19/10") ở runbook:3,12,13 và SPECIFICATIONS:302,306 → PASS.
- **unittest** (`docker python:3.13-slim`, `tools/ai-news/tests`): Ran 76 tests, OK → PASS.
- **`npm run lint`**: exit 0 (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` no-img-element) → PASS. **`npm run typecheck`**: exit 0 → PASS. Build không chạy (0 file web đổi).
- Chưa verify: lịch mới trên GitHub Actions + lượt 17/10 `skip` / 24/10 sinh w43 (sau deploy).
