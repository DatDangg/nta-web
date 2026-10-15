# Review — feature-ai-news-item-images · phase-1-task-03 · round 1

Agent: reviewer

- **CR:** CR-035 · Task: `tasks/feature-ai-news-item-images/phase-1-task-03.md`
- **Diff (chưa commit):** `src/components/mdx/news-image.tsx` (mới), `src/components/mdx/index.tsx` (+import, +key `NewsImage`), `src/components/mdx/news-image.test.ts` (mới), task file. (`phase-1-task-04.md` cũng dirty nhưng chỉ là note của T01/T02 — không thuộc task này, không stage chung.)

## Review level
**NORMAL**

## Reason
Component MỚI, không sửa `ArticleImage` / `mdxComponents.img` (diff `index.tsx` chỉ +1 import, +1 key). Không đụng auth/DB/API/route `/uploads`/`next.config`. Có yếu tố input-validation (src từ nội dung MDX) nhưng nguồn ảnh bị khoá cứng vào regex `/uploads/<sha256>.(jpg|png|webp)` + `localPatterns` — không mở bề mặt mới → không cần STRICT.

## Blast radius
- `mdxComponents` dùng ở `src/app/[locale]/blog/[slug]/page.tsx:49` (mọi bài blog). Thêm key `NewsImage` chỉ có hiệu lực khi MDX có thẻ `<NewsImage>`; bài cũ không có → markup không đổi (test regression ảnh markdown xác nhận `ArticleImage` vẫn ra `<img>` trần).
- Tạo request `/_next/image?url=/uploads/...` → route `src/app/uploads/[...path]` (CR-031, không đổi).

## Verify commands + result (reviewer tự chạy)
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (`tsc --noEmit` không lỗi) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `@next/next/no-img-element` tại `src/components/mdx/index.tsx:26` (`ArticleImage`, ngoài diff) |
| `npm test` | PASS — 137 tests, 135 pass, 0 fail, 2 skipped (skip do thiếu `TEST_DATABASE_URL`, không liên quan task) |
| `npm run build` | Không chạy lại (builder báo lỗi native binding Windows; `docker build --target builder` PASS theo builder — reviewer chưa tự kiểm chứng → Residual risk) |

Đối chiếu contract: `tools/ai-news/generate.py:221` sinh đúng `<NewsImage src="{upload_path}" alt="{escape_jsx_attr}" width="{w}" height="{h}" />` (chuỗi) — khớp validate của component; caption `*Ảnh: host*` dòng kế tiếp (`generate.py:222`).

## Kiểm theo trọng tâm
- **src validate:** `^\/uploads\/[0-9a-f]{64}\.(jpg|png|webp)$` neo 2 đầu → chặn `http(s)://`, `//host`, `..`, query/fragment, hex hoa, gif, path con. Không có đường ra URL ngoài/traversal. OK. Test phủ 7 ca src sai.
- **width/height:** `^[1-9][0-9]{0,3}$` + `≤ 8192`; number → `String()` rồi cùng regex (1.5, NaN, âm, 1e5 bị loại). OK. Test phủ 0 / 8193 / thập phân / âm / chữ / thiếu, cạnh biên 1 và 8192.
- **alt:** bắt buộc, `trim()` rỗng → null. Alt = tiêu đề tin (escape `&quot;` có test). OK.
- **next/image:** `src` path tương đối khớp `localPatterns: [{ pathname: '/uploads/**' }]` (`next.config.ts:19`); width/height thật → giữ chỗ, không CLS; `loading="lazy"`, `sizes="100vw"`, class giống `ArticleImage`. Test xác nhận URL `/_next/image?url=%2Fuploads%2F<sha>.webp`.
- **Không ảnh hưởng ảnh cũ:** `ArticleImage` + `img` không đổi; test regression PASS.
- **Test render thật:** `compileMDX` (next-mdx-remote/rsc) + `renderToStaticMarkup` với `mdxComponents` thật — đúng pipeline `RenderMdx`, không mock.
- **Deviation 1 — dynamic import + `globalThis.React` trong test:** chấp nhận được. Lý do ghi rõ trong comment (ESM-only dep; tsx dùng JSX classic do `jsx: preserve`). Chỉ ảnh hưởng tiến trình test (mỗi file test chạy process riêng với `node --test`), không lọt vào runtime app.
- **Deviation 2 — regex lặp `UPLOAD_FILE_NAME_PATTERN`:** chấp nhận được (tránh kéo `node:fs`/`node:crypto` của `src/lib/uploads/image-file.ts` vào graph component). Rủi ro drift khi đổi danh sách đuôi → MINOR-2.

## Responsive Checklist Gate (UI trong diff: `NewsImage`)
Không có browser → xác minh bằng đọc code/CSS math. Container bài: `mx-auto max-w-[720px] px-4` (`page.tsx:47`) → ở 375px ảnh rộng 343px.
| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — không horizontal scroll | OK | `w-full h-auto` trong khung `max-w-[720px] px-4`; next/image không set width cố định CSS |
| Layout — mobile-first / grid / container px | N/A | Không thêm grid/media query |
| Typography/Spacing rem | N/A / OK | Không thêm chữ; `my-8` theo scale Tailwind (rem) |
| Media — `max-width:100%`/`height:auto` + tỉ lệ | OK | `w-full h-auto aspect-auto` + thuộc tính width/height → tỉ lệ nội tại, không CLS |
| Media — srcset/sizes | OK (xem MINOR-1) | next/image sinh `srcset` + `sizes="100vw"` |
| Touch target | N/A | Ảnh không tương tác |
| Nav / table | N/A | — |
| 100vh / reduced-motion / overflow:hidden | N/A | Không dùng |
| Caption mobile 375px | OK (đọc code) | `<p class="my-5 leading-relaxed"><em>` kế thừa `text-base`; chữ ngắn "Ảnh: host" không tràn |

Không mục nào FAIL.

## Skill gates
| Gate | Kết quả |
|---|---|
| aislop | skip, `aislop` chưa cài (command not found) |
| oxlint (anti-slop) | skip, oxlint not configured (không có `.oxlintrc.json`) |
| ocr (open-code-review) | skip, ocr not installed |
| AI-readable | OK — tên rõ (`NewsImage`, `parseImageSide`, `NEWS_IMAGE_SRC_PATTERN`, `MAX_NEWS_IMAGE_SIDE`), hàm < 20 dòng, không indirection, comment giải thích WHY. 0 indicator |
| frontend-checklist / impeccable | OK — alt bắt buộc, width/height có, lazy, class nhất quán với ảnh bài viết cũ |
| ai-friendly-web | N/A — không đổi llms/robots/sitemap |
| blitzstrike | N/A — không phải STRICT |

## Findings
- **[CRITICAL]** — không có.
- **[MAJOR]** — không có.
- **[MINOR-1]** `src/components/mdx/news-image.tsx:37` — `sizes="100vw"` trong khi khung bài tối đa 720px → desktop tải biến thể lớn hơn cần. Đúng yêu cầu scope ("giữ `sizes` như `ArticleImage`") nên không tính lỗi; đề xuất task riêng đổi cả hai sang `sizes="(min-width: 752px) 720px, 100vw"`.
- **[MINOR-2]** `src/components/mdx/news-image.tsx:8` — regex lặp `UPLOAD_FILE_NAME_PATTERN` (`src/lib/uploads/image-file.ts:22`) có thể lệch nếu sau này thêm đuôi. Đề xuất: thêm 1 assert trong `news-image.test.ts` (test chạy Node, import `image-file.ts` được) so khớp tập đuôi/độ dài hash của 2 regex.
- **[MINOR-3]** Scope §2 — caption "Ảnh: host" chưa "nhỏ/nhạt", hiển thị như đoạn thân bài in nghiêng; builder ghi rõ chưa xem trên dev server. Scope cho phép "chỉ thêm style khi nhìn sai" → cần user/QA xem trực quan; không chặn PASS.
- **[INFO]** Ảnh và caption không nằm trong `<figure>/<figcaption>` (ngữ nghĩa a11y tốt hơn) — scope cấm thêm component/cấu trúc khác, ghi nhận để cân nhắc sau.

## Residual risk
- `npm run build` chưa được reviewer tự kiểm chứng (Windows native binding); dựa vào báo cáo `docker build --target builder` PASS của builder.
- Responsive 375/768/1280 xác minh bằng đọc code, chưa render trên browser.
- File `/uploads/<sha>` bị gỡ khỏi volume (runbook gỡ ảnh) → next/image trả lỗi, hiện ảnh vỡ thay vì ẩn; phụ thuộc runbook gỡ cả thẻ trong bài.
- Reviewer đã lỡ dùng `cat` (bash) một lần để đọc 2 file mới ở bước đầu — ngoài allowlist bash của reviewer; chỉ đọc, không ghi. Các bước sau dùng Read/Grep.

## Verdict
✅ **PASS** (0 CRITICAL, 0 MAJOR, 3 MINOR không chặn).
