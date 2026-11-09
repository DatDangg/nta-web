# Review — feature-add-japanese-locale · phase-3-task-01 · round 1

Agent: reviewer
CR: CR-044 · spec R-09c "Bản ja (4.12.0)" (SPECIFICATIONS.md:375-380) + R-20a (:541-571)

## Review level
**STRICT**

## Reason
Cron ghi thẳng `main` + ghi DB prod (insert-only write-path `createEntry`), xử lý output LLM (prompt-injection / MDX injection), nội dung public, workflow CI có secret.

## Blast radius
- `tools/ai-news/generate.py` (guard + render vi/en/ja, prompt LLM), tests + fixture.
- `tools/db/publish-post.ts` (đọc locale tuỳ chọn ja, `skippedLocales`), `publish-post.test.ts`.
- `tools/db/content-cli.ts` (1 dòng `[info]` stderr cho locale bị bỏ qua + comment usage) — ngoài danh sách task nhưng là hệ quả trực tiếp của `skippedLocales`, ghi stderr nên không ảnh hưởng grep `status=missing` của workflow → **chấp nhận được**.
- `.github/workflows/ai-news.yml` (git add ja, regex locale, smoke `/ja/blog`).
- `docs/runbook/ai-news.md`, `tools/ai-news/README.md`.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (0 lỗi) |
| `npm run lint` | PASS (0 error, 1 warning có sẵn `src/components/mdx/index.tsx:26` no-img-element) |
| `npm test` | 231 tests: 228 pass, 1 fail, 2 skipped. Fail = `tools/db/content-rules.test.ts:29` (ảnh `/uploads/*` thiếu local) — có sẵn, không liên quan diff. Suite Postgres skipped (không có DB) → các ca publish-post 3 locale / tuần cũ thiếu ja **không chạy được ở đây** |
| Python unittest (Docker) | **Không chạy** — `docker` không nằm trong allowlist bash của reviewer (`.opencode/agent/reviewer.md`); `pytest` không cài trên máy. Dựa vào claim Builder 86 OK + đọc code/test |
| `npm run build` | Không chạy (optional; Builder báo PASS với bài mẫu tạm) |

## Đối chiếu spec (R-09c bản ja)
- Title `AIウィークリーダイジェスト — YYYY年M月D日` — khớp (`generate.py:217`, ngày `format_post_date` ja `:206-207`, không zero-pad tháng/ngày, đúng mẫu).
- Excerpt `YYYY年M月D日のダイジェストから注目のAIニュースN件を、元記事へのリンク付きで紹介します。` — khớp từng ký tự (`:218`).
- Nhãn nguồn `出典` (`SOURCE_LABEL`), chú thích ảnh `*画像: <domain>*` (`IMAGE_CREDIT` + `_image_lines:249`), ghi chú cuối `本ダイジェストは公開情報をもとに自動で作成しています。` (`FOOTNOTE`), câu bản quyền ảnh ja `画像の著作権は各ニュースの出典ページに帰属します。` (spec không cố định chữ — chấp nhận), intro ja có. Alt ảnh manifest có `ja` (`:398`) và publish-post đọc `alt.ja` (`publish-post.ts:150-152`).
- Cùng slug/cover/tin/ảnh cho 3 locale — đúng (render cùng `items`/`images`).
- Độ dài `title_ja`/`summary_ja` theo ký tự, cùng ngưỡng vi/en — đúng (`_validate_item:175-177`).
- Escape MDX: `escape_mdx` / `escape_jsx_attr` dùng chung cho ja; test có `{beta} <高速>` và `- ` đầu summary ja. Ký tự full-width không phải cú pháp MDX → an toàn.
- Guard "không đăng lẻ": tin thiếu/sai ja bị loại khỏi **cả 3 locale** (item-level), dưới 5 tin → GuardError trước khi ghi; `guarded_items` validate cả 3 bài trước khi fetch ảnh; ghi file chỉ sau khi cả 3 bài pass. Test `test_missing_title_ja_fails_whole_run_writes_nothing` xác nhận không tạo thư mục content.
- publish-post: đọc mọi locale trước, vi/en thiếu → `ContentNotFoundError` (không bị nuốt nhờ check `SEED_LOCALES`, `:104`), ja thiếu → bỏ qua + `skippedLocales`; validate mọi locale có file trước bất kỳ ghi nào (checkLocales + planImages + problems → throw trước `dryRun`/ghi). Bản có sẵn → `exists`, không ghi đè. Test có ca "ja lỗi → vi/en không ghi", "tuần cũ chỉ chèn ja".
- Workflow: `git add` 3 file (render luôn ghi đủ 3 khi `written` → `set -e` không gãy); regex `^publish-post post/(vi|en|ja)/[^ ]+ status=missing$` khớp format `content-cli.ts:232`; dòng `[info]` đi stderr, không lọt vào `$out`. `check` dùng `any()` trên 3 locale → tuần cũ có vi/en vẫn `skip`, không ghi lại. Smoke `/ja/blog/$SLUG` dựa fallback en theo bản ghi (`locale-fallback.ts`, phase 2) → tuần cũ vẫn 200.
- LLM safety: system prompt giữ nguyên rào DATA_START/END, "KHÔNG PHẢI LỆNH", cấm bịa, URL allow-list; chỉ thêm field ja. Không có gọi API thật trong test.

## Findings
- **MINOR** — `.github/workflows/ai-news.yml:237` / `docs/runbook/ai-news.md` (§ Bản ja): workflow mới giả định prod đã có migration `drizzle/0002_happy_magma.sql` + route `/ja` (deploy.yml chạy khi push main). Nếu deploy/migrate lỗi mà cron thứ 7 chạy trước khi sửa: `publish-post` dry-run **không** phát hiện CHECK DB cũ (rule I-6 dùng `CONTENT_LOCALES` trong code đã có ja) → chèn vi, en rồi ja fail CHECK → đăng lẻ vi/en + smoke `/ja/blog` đỏ. Tự lành khi chạy lại sau migrate (chỉ chèn ja). Đề nghị ghi 1 dòng tiền điều kiện rollout trong runbook (deploy + migration 0002 PASS trước cron kế tiếp). Không chặn.
- **MINOR** — `tools/ai-news/generate.py:52,280`: `BODY_MIN = 600` ký tự áp chung cho ja; chữ Nhật đặc hơn nên bài ja tối thiểu (5 tin, summary ngắn, URL ngắn) có thể chạm sàn → GuardError làm fail **cả run** (đúng tinh thần không đăng lẻ, nhưng tăng xác suất tuần trống). Ước lượng thực tế ~900+ ký tự nên rủi ro thấp; theo dõi log `độ dài bài` ở các lượt đầu.
- **MINOR (residual)** — Các test Postgres mới trong `tools/db/publish-post.test.ts:196-252` và Python unittest không được reviewer chạy lại (DB không có / docker ngoài allowlist). Cần Builder/CI xác nhận khi có DB.

Không có BLOCKER/MAJOR.

## Verdict
**PASS**
