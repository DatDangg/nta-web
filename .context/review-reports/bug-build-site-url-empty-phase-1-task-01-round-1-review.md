# Review — bug-build-site-url-empty · phase-1-task-01 · round 1

Agent: reviewer · 2026-10-15

- **Review level:** NORMAL
- **Reason:** `BASE_URL` là hằng dùng chung (metadata/sitemap/robots/JSON-LD), nhưng hành vi chỉ đổi khi biến rỗng hoặc chỉ có khoảng trắng; không đụng auth, DB, API hay UI. Root cause đã được chứng minh trong `tasks/feature-content-database/investigate-flaky-build.md`. Có test cho logic mới.
- **Blast radius:** `src/lib/seo.ts` (BASE_URL → `src/app/robots.ts:5`, `src/app/sitemap.ts:24-25`, `src/app/[locale]/layout.tsx:30` metadataBase, `src/app/[locale]/blog/[slug]/page.tsx:41`, `src/lib/seo/jsonld.ts:1`, `localizedPath` `src/lib/seo.ts:23`); `Dockerfile` stage `builder`; `.context/project-config.md` (chỉ tài liệu).
- **Scope reviewed:** `src/lib/seo.ts`, `src/lib/seo.test.ts` (mới), `Dockerfile`, `.context/project-config.md`. Bỏ qua progress.json, runs/*, docs/content-bot/, spec/changes/2026-10-14-telegram-content-bot.md (theo yêu cầu).

## Verify commands + result (reviewer tự chạy)
| Lệnh | Kết quả |
|---|---|
| `npm test` | PASS: 57 test, 56 pass, 0 fail, 1 skip (cần TEST_DATABASE_URL). Hai test mới của seo chạy và PASS |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS: 0 error, 1 warning `<img>` có sẵn ở `src/components/mdx/index.tsx:25` (ngoài diff) |
| Docker build (không arg / compose) | Reviewer không chạy (ngoài quyền). Dựa trên evidence của builder trong task file: không arg PASS 61/61, compose PASS (cache) |

## Kiểm theo yêu cầu
1. **Đúng root cause:** Đúng. Gốc là `??` không fallback khi `""` cộng với ARG không có mặc định. A sửa phía code (`||` + trim), B sửa phía build (ARG mặc định). Cả hai mắt xích trong chuỗi nhân quả đều được xử lý, không chỉ che triệu chứng ở `layout.tsx`.
2. **Canonical không đổi:** `CANONICAL_SITE_URL = 'https://ntavietnam.tech'`, ARG mặc định cùng giá trị, compose `${NEXT_PUBLIC_SITE_URL:-https://ntavietnam.tech}` và deploy.yml `NEXT_PUBLIC_SITE_URL: https://ntavietnam.tech` giữ nguyên. Không xuất hiện `ntasolution.vn` trong diff. OK.
3. **Next inline:** `resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)` vẫn truy cập env bằng biểu thức member literal, nên DefinePlugin của Next thay đúng giá trị lúc build. Không có destructuring hay truy cập động. OK.
4. **Nơi dùng BASE_URL:** Với giá trị hợp lệ không có khoảng trắng, `resolveSiteUrl(v) === v`. Mọi nơi dùng đều nối `/...` hoặc `new URL(BASE_URL)` nên kết quả y hệt trước. Thay đổi nhỏ duy nhất: giá trị có khoảng trắng đầu/cuối giờ được trim. Trước đây giá trị đó tạo URL hỏng, nên đây là cải thiện. Dấu `/` cuối không bị strip, giữ nguyên hành vi cũ. OK.
5. **Test có ý nghĩa:** Có. Test gọi hàm thật được export, phủ các trường hợp `undefined`, `""`, khoảng trắng, `\n\t` và giá trị hợp lệ (kể cả trim), đồng thời ghim giá trị canonical. Theo builder report, test FAIL trước fix (chưa có `resolveSiteUrl`). Test không phủ trực tiếp dòng `BASE_URL = resolveSiteUrl(process.env...)` (hằng đã được tính lúc import). Chấp nhận được vì dòng đó chỉ là một lời gọi.
6. **Dockerfile ARG:** ARG có mặc định chỉ được dùng khi không truyền arg. Compose luôn truyền (`${...:-default}` xử lý cả trường hợp rỗng), và CI build qua compose. Không phá compose/CI. ARG nằm trong stage `builder`, không ảnh hưởng stage `nta-migrate` hay runner. OK.
7. **Repro closure:** Repro trước fix: không arg FAIL 2/2 (file điều tra). Sau fix: `docker build --target builder` không arg PASS 61/61 với image tạm, sitemap/robots = ntavietnam.tech (builder evidence). Status `PASS`, evidence kiểm chứng được qua task file và test tự động cho logic fallback.

## Skill gates
- aislop: skip, không chạy (diff 10 dòng code + 1 test; review thủ công không thấy slop: comment giải thích WHY, không có dead code hay fallback ẩn. Fallback ở đây là hành vi được spec hoá và có test).
- oxlint (anti-slop): skip, oxlint not configured (lint dự án dùng eslint, PASS).
- ocr: skip, ocr not installed.
- AI-readable: OK. Tên rõ (`CANONICAL_SITE_URL`, `resolveSiteUrl`), hàm 1 dòng, 0 indicator.
- ai-friendly-web: OK. robots/sitemap giữ nguyên domain canonical, không chặn crawler.
- Responsive Checklist Gate: N/A (diff không đụng UI/CSS/route).
- blitzstrike: N/A (không phải STRICT).

## Findings
- **[MINOR] `.context/project-config.md:55-63`, quy ước C không chính xác về việc "tag tạm" với compose.**
  `docker-compose.yml:25` cố định `image: nta-web:latest`, nên `-p <tên-tạm>` chỉ đổi tên project, không đổi tag. Lệnh mặc định `docker_build_evidence_command` vì vậy luôn ghi đè `nta-web:latest` local. Điều này mâu thuẫn với dòng "Dùng project/tag tạm … không đụng container/image đang chạy". Nếu ai đó chạy lệnh này trên VPS, `docker compose up` kế tiếp sẽ dùng image vừa build. Ngoài ra compose có thể chỉ dùng cache (như builder ghi nhận), nên không phải bằng chứng `next build` độc lập.
  **Đề xuất:** từ khi có ARG mặc định, `docker build` không arg đã cho kết quả giống CI. Nên đổi lệnh chính thành `docker build --target builder -t nta-web-buildcheck:tmp .` (thêm `--no-cache` khi cần bằng chứng `next build` mới; `--build-arg NEXT_PUBLIC_SITE_URL=...` là tuỳ chọn). Compose chỉ là phương án phụ, kèm cảnh báo rõ rằng nó ghi đè `nta-web:latest` và không được chạy trên VPS. Đồng thời bỏ câu "không dùng `docker build` trần", vì sau fix B câu này không còn đúng.
- **[MINOR] `.context/project-config.md:63`: `docker_build_evidence_command` dùng cú pháp tiền tố env POSIX (`VAR=x cmd`).** Cú pháp này không chạy trên PowerShell, shell chính của máy dev Windows. Nếu giữ compose, nên ghi chú "chạy trong bash/WSL". Đổi sang `docker build` như đề xuất trên thì vấn đề tự hết.

Không có CRITICAL/MAJOR. Code (A), Dockerfile (B) và test đều đạt.

## Residual risk
- Reviewer không tự chạy Docker build; kết luận 61/61 dựa trên evidence của builder (nhất quán với file điều tra và cơ chế ARG/`||`).
- Giá trị env không rỗng nhưng không phải URL hợp lệ vẫn làm `new URL()` hỏng. Đây là ngoài scope (cấu hình sai, không phải trường hợp "flaky").

## Verdict
✅ **PASS** (2 MINOR ở quy ước C, nên sửa nhưng không chặn)
