# Spec Validation Report — CR-035 `ai-news-item-images` (pre-plan, round 1)

Agent: spec-validator
**Mode:** Spec validation (pre-plan) · **Date:** 2026-10-15
**Sources:** `SPECIFICATIONS.md` R-09c (4.3.0, dòng 313-337), `spec/updates/2026-10-15-ai-news-item-images.md`,
`spec/changes/2026-10-15-ai-news-item-images.md` (acceptance + Q1–Q4), `tasks/feature-ai-news-item-images/phase-1-task-01..04.md`,
code: `tools/ai-news/generate.py`, `src/lib/uploads/image-file.ts`, `src/db/content-repo.ts` (I-7) + `src/db/content-rules.ts`,
`src/components/mdx/index.tsx`, `src/lib/content/render-mdx.tsx`, `.github/workflows/ai-news.yml`, `tools/db/content-cli.ts`,
`node_modules/@mdx-js/mdx/lib/plugin/recma-jsx-rewrite.js`.
(Không đọc `spec/test-scope/current.json` chi tiết — hết ngân sách bước; residual.)

## Verdict: ❌ FAIL (1 HIGH conflict + 1 MISSING)

## Coverage matrix

| # | Requirement | Source | Task | Status | Note |
|---|---|---|---|---|---|
| A1 | Tin có og:image → ảnh dưới tiêu đề vi+en, alt = tiêu đề theo locale | change doc AC1, R-09c | T01 (render), T03 (hiển thị) | ⚠️ PARTIAL | Render có, nhưng đường hiển thị qua `ArticleImage` sai (C1) |
| A2 | Ảnh tải về, phục vụ `/uploads/...`, không hotlink | AC2, R-09c | T01, T02, T04 | ✅ | sha256 + ext `jpg|png|webp` khớp `UPLOAD_FILE_NAME_PATTERN` (`image-file.ts:22`) |
| A3 | Lỗi ảnh → tin chỉ text, không fail bài | AC3 | T01 §6 | ✅ | |
| A4 | Bài tuần cũ không đổi | AC4 | T01, T02 (`exists` → không đụng), T04 | ✅ | |
| A5 | Ghi nguồn ảnh (dưới ảnh + chú thích cuối bài) | AC5, Q2 | T01 §5 | ✅ | |
| Q1 | Runbook có mục **gỡ 1 ảnh khi bị yêu cầu** | Q1, R-09c dòng 320-321, update dòng 26 | T04 | ❌ MISSING | T04 §5 liệt kê nội dung runbook nhưng không có mục gỡ ảnh, không có acceptance |
| Q3 | Bỏ GIF, chỉ JPEG/PNG/WebP, không đổi R-16d | Q3, R-09c, update | T01 §2, T02 (`inspectImage`) | ✅ | Nhất quán; `inspectImage` đã chặn GIF (`image-file.ts:98`). Ghi chú cũ ở change doc dòng 33 còn "gif" nhưng đã bị Q3 thay thế |
| Q4 | Tự bỏ ảnh trùng sha256 ≥ 2 tin | Q4 | T01 §3 | ✅ | |
| S1 | Guard SSRF (https/443, IP không-global mọi DNS + mỗi hop, pin IP, ≤3 redirect, 5 s, 90 s, no proxy/cookie) | R-09c, update | T01 §2 + tests | ✅ (gợi ý bổ sung W3) | |
| S2 | HTML ≤ 512 KB, chỉ meta, không tới LLM/đĩa/log | R-09c | T01 §2 | ✅ | |
| S3 | Ngưỡng 2 MB (digest) vs 5 MB (`inspectImage`) | R-09c vs `image-file.ts:8` | T01 / T02 | ✅ | Không mâu thuẫn: 2 lớp (2 MB ở T01, 5 MB lớp 2 ở T02). Gợi ý W4 |
| S4 | `publish-post --images-dir`: dry-run validate, I-7 coi ảnh sắp lưu hợp lệ, `saveImage` trước `createEntry` | R-09c (1)/(3) | T02 | ✅ | I-7 regex (`content-rules.ts:222`) bắt được `src="/uploads/x.webp"` |
| S5 | Artifact digest → publish-db 7 ngày, secret DB chỉ ở publish-db | R-09c, update | T04 §1-2 | ✅ | |
| S6 | Tắt khẩn cấp `AI_NEWS_IMAGES=off` → `--no-images` | update | T01 §7, T04 §1 | ✅ | |

## Cross-document conflicts

| ID | Conflict | Source A | Source B | Impact |
|---|---|---|---|---|
| **C1** | T01 render ảnh bằng **JSX tường minh** `<img src=… width="W" height="H" />`. MDX 3 (next-mdx-remote v6) **không** map JSX tường minh sang `components.img`: `recma-jsx-rewrite.js:177-180` "Do not turn explicit JSX into components" (`_mdxExplicitJsx`, `remark-mark-and-unravel.js:93`). → `ArticleImage` không bao giờ nhận thẻ này; sửa ở T03 vô tác dụng; ảnh ra `<img>` thô (file gốc ≤ 2 MB, không class `my-8 w-full rounded-md`, không `loading=lazy`). Tiền đề T03 ("MDX truyền width dạng chuỗi → rơi về `<img>`") và change doc dòng 62 sai. | T01 §5, T03 §Vấn đề/§1, change doc dòng 62 | MDX runtime (`node_modules/@mdx-js/mdx`) | **HIGH** — acceptance T03 "/_next/image?url=/uploads/…" không đạt được |

Hướng sửa (để change-request chọn, không tự áp): T01 render bằng component **viết hoa** đăng ký trong `mdxComponents` (vd `<NewsImage src width height alt />` → next/image) hoặc cú pháp markdown `![alt](/uploads/…)` (được map nhưng không có width/height → phải lấy kích thước từ chỗ khác). Đồng bộ T01 ↔ T03 + test render thật qua `RenderMdx`.

## Gaps
- **[MISSING] Q1 runbook gỡ ảnh** — T04 §5 + Acceptance phải thêm mục "gỡ 1 ảnh khi bị yêu cầu" (xoá mềm asset + sửa bài qua `db:cli update`, revalidate) đúng như R-09c / spec update / Q1.
- **[PARTIAL] A1** — phụ thuộc C1.

## Warnings / suggestions (không chặn)
- **W1 seed dev/staging:** MDX tuần mới (commit vào git) tham chiếu `/uploads/<sha>` chỉ có trên volume prod → DB dev/staging seed từ file sẽ có ảnh 404 (chưa kiểm `seed-db.ts` có chạy I-7 hay không — residual). Nên ghi vào runbook/README.
- **W2 grep backup:** dòng dry-run mới `publish-post image /uploads/<x> status=missing` khớp `grep -q ' status=missing$'` (`ai-news.yml:145`). Vô hại (ảnh chỉ "missing" khi bài missing) nhưng nên ghi rõ trong T02/T04 để reviewer không nhầm.
- **W3 SSRF bổ sung:** (a) `OPENCODE_API_KEY` nằm trong env của bước Generate (`ai-news.yml:56`) — cùng process fetch URL ngoài; nên tách bước fetch ảnh hoặc đảm bảo không có header/env nào lọt (thêm test "không gửi header ngoài UA"). (b) `is_global` coi NAT64 `64:ff9b::/96`, 6to4 `2002::/16`, Teredo là global → nên chặn tường minh hoặc xét IPv4 nhúng. (c) Timeout 5 s là theo từng thao tác socket; nên thêm deadline wall-clock mỗi request (chống drip-feed) ngoài ngân sách 90 s. (d) Test chạy `python:3.12-slim` nhưng job `digest` chạy Python 3.13 (trixie) — hành vi `is_global` với IPv4-mapped khác nhau giữa bản; giữ xử lý tường minh và chạy test cùng bản runtime.
- **W4 2 MB lớp 2:** T02 chỉ dựa `inspectImage` (5 MB); có thể kiểm thêm `bytes ≤ 2 MB` theo manifest để lớp 2 khớp spec R-09c (tuỳ chọn).
- **W5 test-scope:** chưa cross-check `spec/test-scope/current.json` (v52) — nên đảm bảo có case "ảnh hiển thị qua next/image" sau khi chốt C1.

## Verdict reasoning
FAIL vì có 1 conflict HIGH (C1: định dạng thẻ ảnh T01 không đi qua `ArticleImage`, T03 không đạt acceptance) và 1 ❌ MISSING (runbook gỡ ảnh theo Q1 không có task cover). GIF và ngưỡng 2 MB/5 MB nhất quán; guard SSRF đủ khung, chỉ có gợi ý bổ sung. Sửa T01/T03 (+ change doc dòng 62) và T04 §5/Acceptance rồi validate lại (round 2).

---

# Round 2 — 2026-10-15

Agent: spec-validator
**Kiểm:** task-01/03/04 (mục "Sửa sau spec-validation round 1"), `spec/test-scope/current.json` (scope 52).

## Verdict: ✅ PASS (có điều kiện — 0 ❌, 0 HIGH, 2 ⚠️)

| Item round 1 | Trạng thái | Bằng chứng |
|---|---|---|
| C1 (JSX `<img>` không map) | ✅ Đã xử lý | T01 dòng 15: render `<NewsImage …/>`; T03 dòng 16: component `NewsImage` đăng ký trong `mdxComponents`, chỉ nhận src `/uploads/<sha256>.(jpg|png|webp)`, test render thật qua `RenderMdx`, không sửa `ArticleImage` |
| MISSING Q1 runbook gỡ ảnh | ✅ | T04 §5 dòng 17 (quy trình list/show → `db:cli update` vi+en → `db:cli delete` asset → revalidate → sửa seed git) + Acceptance dòng 22 |
| W2 grep backup | ✅ | T04 Acceptance dòng 24 |
| W3a tách `OPENCODE_API_KEY` | ✅ | T01 dòng 16 (`generate --items-out` / `render --images-out` không key) + T04 Acceptance dòng 23 |
| W3b NAT64/6to4/Teredo, IPv4-mapped tự xét | ✅ | T01 dòng 17 |
| W3c deadline/request | ✅ | T01 dòng 18 (10 s tổng mỗi request) |
| W3d Python 3.13 | ✅ | T01 dòng 19 |
| W5 test-scope v52 | ⚠️ còn lệch | xem G2 |

## Gap còn lại (⚠️ — sửa trước khi gọi builder)
- **G1 [stale text trong task — mâu thuẫn nội bộ]:** phần "Sửa round 1" thay thế nhưng nội dung cũ chưa gỡ, builder dễ làm theo bản cũ:
  - T01 Acceptance dòng 54 vẫn ghi thẻ `<img src="/uploads/…">` → phải là `<NewsImage …>`.
  - T03 Scope §1 dòng 19 (sửa `ArticleImage`), §2 dòng 20 ("không thêm component mới"), Tests dòng 24 (`<img …>` → next/image qua ArticleImage) trái với dòng 16.
  - T04 Scope §1 dòng 13 vẫn "bước Generate thêm `--images-out`" (1 bước, có key) → trái Acceptance dòng 23 (W3a tách 2 bước).
- **G2 [test-scope v52 lệch thiết kế mới]:** `spec/test-scope/current.json` dòng 12 ("render `<img>`"), dòng 17 + 41 ("ArticleImage nhận width/height chuỗi → next/image"), dòng 26 (`mdxComponents.img = ArticleImage`) mô tả hành vi sẽ không được build. Thiếu: case `NewsImage` (src ngoài/sai dạng → không ra ảnh), SSRF NAT64/6to4/Teredo + deadline 10 s/request (dòng 37), tách bước generate/render không key. Cần Spec Publisher sinh lại (vẫn scope 52 hoặc 53 theo quy ước) — chỉ ra gap, không tự sửa.

## Verdict reasoning
Mọi ❌/HIGH round 1 đã có task cover. Còn 2 ⚠️ (dưới ngưỡng FAIL ≥ 3) → PASS, với điều kiện dọn G1 trong task và chạy lại Spec Publisher cho G2 trước khi builder bắt đầu T01.
