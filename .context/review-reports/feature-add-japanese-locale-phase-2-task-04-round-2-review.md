Agent: reviewer

# Review — feature-add-japanese-locale · phase-2-task-04 · round 2

- **CR:** CR-044 · task `tasks/feature-add-japanese-locale/phase-2-task-04.md` · round 1 FAIL (F1 MAJOR CSS @font-face JP render-blocking trên vi/en)
- **Diff reviewed (uncommitted, attempt 2):** `src/app/[locale]/layout.tsx`, `src/app/globals.css`, `src/components/layout/LanguageToggle.tsx`, mới: `tools/fonts/build-noto-jp.mjs`, `public/fonts/noto-sans-jp/` (124 woff2 + `noto-sans-jp.css` + `README.md`, 5.7 MB). Bỏ qua dirty có sẵn: `.claude/launch.json`, `cr-041-screens/`, `spec/changes/2026-10-19-hero-wide-screen-backdrop.md`.

## Review level
**STRICT**

## Reason
`LanguageToggle` là shared navigation (Header, MobileNav, Footer — mọi trang); `[locale]/layout.tsx` + `--font-sans` ảnh hưởng render/perf mọi trang (R-22); thêm asset public phục vụ cho mọi visitor ja + script sinh file có `rmSync`.

## Blast radius
- `layout.tsx`: chỉ thêm 1 `<link rel=stylesheet precedence="default">` có điều kiện `locale === 'ja'`; `next/font` giờ chỉ còn `Inter` (grep `Noto|next/font` trong `src/` → chỉ `Inter` + comment).
- `globals.css`: `--font-sans` thêm `var(--font-noto-jp, Inter)` sau Inter → vi/en resolve thành `Inter` trùng (vô hại), ja rơi xuống "Noto Sans JP" cho glyph Nhật.
- `LanguageToggle`: 3 instance/trang (không đổi so với round 1).
- `public/fonts/noto-sans-jp/`: vào image Docker (`COPY public ./public`); `tools/` bị `.dockerignore` loại trừ (script không vào image). Middleware matcher loại path có dấu chấm → `/fonts/*.css|woff2` không bị next-intl redirect.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, exit 0) |
| `npm run lint` | PASS (0 error, 1 warning pre-existing `src/components/mdx/index.tsx:26` no-img-element; `eslint-disable-next-line @next/next/no-css-tags` không bị báo unused) |
| `npm test` | 230 tests: 227 pass, **1 fail pre-existing** `tools/db/content-rules.test.ts:29` (uploads), còn lại skip — không liên quan task |
| `npm run build` (không env) | FAIL môi trường: `Failed to load native binding` (SWC) — không liên quan diff |
| `SWC_NATIVE_BINDING_CACHE="C:/Users/datda/.swc-native" npm run build` | PASS (Compiled successfully, 9/9 static pages) |
| Grep `.next/static/**` cho `Noto Sans JP` / `noto-sans-jp` | **0 file** → không còn CSS chunk chung nào chứa @font-face JP (F1 round 1 là chunk `a5c08e6ffafb8109.css` 95 KB — đã biến mất) |
| Grep `.next/static/css` cho `--font-noto-jp` | 1 (chỉ là tham chiếu `var()` trong `--font-sans` của CSS app, không có @font-face) |
| `public/fonts/noto-sans-jp/noto-sans-jp.css` | 125 `font-family` (1 `:root{--font-noto-jp:"Noto Sans JP"}` + 124 @font-face), 124 `font-display:swap`, 124/124 `url(/fonts/noto-sans-jp/<hash>.woff2)` — không URL ngoài; 124 woff2 tồn tại (git status -uall) |
| `next start` + curl HTML `/`, `/en`, `/about`, `/en/about`, `/ja`, `/ja/about`, header `/fonts/*` | **KHÔNG chạy bởi reviewer** — frontmatter `.opencode/agent/reviewer.md` `bash "*": deny` (không allow `next start`/`curl`/`taskkill`) và prompt reviewer "không tự chạy app". Yêu cầu từ agent chính không đổi được permission. Thay bằng: kiểm artifact build (trên) + đọc code + evidence smoke của builder attempt 2 trong journal (`/`,`/en` 0 CSS chứa Noto; `/ja` có link trong head) + evidence live round 1 cho toggle (component không đổi ở attempt 2). |

Server: reviewer **không mở server nào** ở round 2 → không có gì cần tắt.

## Đánh giá kỹ thuật fix F1
- Root cause round 1 (CSS next/font gắn theo module graph, không theo nhánh render) được xử lý đúng gốc: bỏ hẳn `Noto_Sans_JP` khỏi module graph; CSS JP chỉ đến từ file tĩnh link có điều kiện. Artifact build xác nhận không còn byte JP trong CSS chung → vi/en trở về baseline CSS trước task.
- React 19.1 + `precedence` → `<link>` được hoist vào `<head>` khi SSR (builder đo thấy trong head). Ở ja, stylesheet này render-blocking (~95 KB raw) — chấp nhận được vì chỉ ja và cần cho glyph; file chỉ chứa `@font-face` + 1 biến `:root`, không xung đột thứ tự cascade với CSS app (precedence "default" xếp sau nhóm CSS của Next → không FOUC về style; font-display swap → FOUT glyph Nhật, chấp nhận).
- Điều hướng client en→ja: React chèn stylesheet và chờ load trước khi reveal; ja→en: stylesheet hoisted không bị gỡ, nhưng chỉ định nghĩa @font-face (lazy theo unicode-range) + biến không ảnh hưởng chữ Latin (Inter đứng trước) → vô hại.
- `html lang={locale}` không đổi; toggle map `routing.locales` (vi, en, ja) → VI · EN · JA, `aria-current` theo locale hiện tại, `href={pathname}` (next-intl đã bỏ prefix) — đã kiểm live round 1 (`/en/about`, `/ja/about`, `/en/blog`, `/ja/blog`) và builder smoke; code toggle không đổi ở attempt 2.

## Findings

### F1 (round 1) — RESOLVED
CSS @font-face JP không còn trong bất kỳ chunk `.next/static/css` nào; link JP chỉ render khi `locale === 'ja'`.

### N1 — MINOR (không chặn): `tools/fonts/build-noto-jp.mjs:35` `rmSync(OUT_DIR)` xoá luôn `README.md` (thông báo giấy phép) khi chạy lại
- Script xoá cả thư mục rồi chỉ ghi lại woff2 + css, không ghi lại README → lần tái tạo sau sẽ âm thầm làm mất thông báo OFL (git sẽ hiện deletion nhưng dễ lọt). Ngoài ra `rmSync` chạy **trước** khi kiểm tồn tại file media (dòng 40) → lỗi giữa chừng để lại thư mục dở.
- An toàn: `OUT_DIR` là hằng `path.join(process.cwd(), 'public','fonts','noto-sans-jp')`, không nhận tham số → không thể xoá ngoài thư mục đó (nếu chạy sai cwd thì chỉ đụng `<cwd>/public/fonts/noto-sans-jp`). Không có lỗ hổng phá hủy.
- Đề xuất (backlog/builder tuỳ chọn): chỉ xoá `*.woff2` + `noto-sans-jp.css`, hoặc để README ngoài thư mục bị xoá / sinh lại README trong script; validate media trước khi xoá.

### N2 — MINOR (perf, không chặn): `/fonts/*` dùng cache mặc định của Next cho file `public/` (`Cache-Control: public, max-age=0`, revalidate bằng ETag) — **suy từ hành vi mặc định Next 15, không đo được** (không chạy server)
- `next.config.ts` không có `headers()`, nginx (`deploy/nginx/*.conf`) không đặt cache cho `/fonts`. So với `/_next/static/*` (`max-age=31536000, immutable`): mỗi lần tải trang ja mới (full load) trình duyệt gửi conditional request (304) cho CSS + từng slice woff2 đang dùng (~21) → thêm RTT trên ja. Tên woff2 là hash nội dung → an toàn đặt `immutable`; `noto-sans-jp.css` tên cố định → giữ revalidate hoặc ngắn.
- Đề xuất: `headers()` cho `/fonts/noto-sans-jp/:file*.woff2` → `public, max-age=31536000, immutable`. Không chặn vì chỉ ảnh hưởng ja, không hồi quy vi/en.

### N3 — MINOR (process): task file Scope 2 vẫn ghi "Font `Noto_Sans_JP` qua `next/font/google`"
- Implementation đã đổi sang self-host (có lý do kỹ thuật rõ từ F1). Cần ghi quyết định này vào task file (Verification summary/decision) và Doc Impact P3-T02 (`docs/DESIGN.md` / design-spec) lúc close-out. Không chặn.

### N4 — RESIDUAL RISK (license, thấp): thiếu văn bản `OFL.txt` + dòng copyright gốc
- OFL-1.1 điều 2 yêu cầu bản phân phối kèm copyright notice + văn bản license. `README.md` ghi đúng tên giấy phép (OFL-1.1), URL văn bản chính thức, nguồn font, cách tái tạo, và tự ghi chú còn thiếu `OFL.txt`. Font không bị sửa glyph, không bán riêng, Reserved Font Name không bị vi phạm (giữ tên gốc, không phải Modified Version theo nghĩa đổi tên). Bảng `name` trong woff2 do Google phục vụ thường vẫn giữ copyright/license URL.
- Kết luận: **đủ để không chặn**, nhưng ghi residual risk: nên bổ sung `public/fonts/noto-sans-jp/OFL.txt` (văn bản OFL 1.1 + dòng copyright từ repo `notofonts/noto-cjk`) trước khi deploy production; kết hợp sửa N1 để file không bị xoá khi tái tạo.

### Đánh giá trade-off self-host (5.7 MB trong repo) vs Google Fonts CDN chỉ ở ja — INFO
| Tiêu chí | Self-host (hiện tại) | Google Fonts CDN chỉ ở ja |
|---|---|---|
| Privacy/GDPR | Không gửi IP visitor sang Google | Gửi IP sang fonts.googleapis/gstatic (đã có án GDPR ở EU) |
| CSP | Không cần mở domain ngoài (repo hiện chưa có CSP) | Phải thêm `style-src fonts.googleapis.com`, `font-src fonts.gstatic.com` khi có CSP |
| Perf | Cùng origin, không thêm DNS/TLS; cache hiện max-age=0 (N2) | Thêm 2 kết nối cross-origin (preconnect cần); không còn lợi ích cache chia sẻ giữa site (cache partitioning) |
| Repo/image | +5.7 MB binary (124 file) vào git và image | 0 |
| Ổn định | Không phụ thuộc bên thứ ba; tái tạo được bằng script | Phụ thuộc Google, CSS có thể đổi subset |
Kỹ thuật self-host đúng; +5.7 MB chấp nhận được cho site này. Không coi là FAIL.

## Gates
- Surgical diff: mọi dòng trace về task/F1; không drive-by refactor. PASS.
- AI-readable: comment giải thích WHY (lý do không dùng next/font), script có hướng dẫn tái tạo. PASS.
- aislop / oxlint / ocr: không chạy (ngoài phạm vi round 2 fix; oxlint chưa cấu hình, ocr không bắt buộc) → skip, không chặn.
- Responsive/UI: toggle không đổi so với round 1 (đã kiểm 375 drawer không tràn, min 44px). N/A cho phần font.
- Security: link nội bộ cố định, không input người dùng; `JSON.stringify(...).replace(/</g,...)` JSON-LD không đổi. PASS.

## Acceptance
| Criterion | Status |
|---|---|
| JA từ `/en/blog/<slug>` → `/ja/blog/<slug>`; VI → `/blog/<slug>`; EN từ `/ja/about` → `/en/about` | PASS (live round 1 + builder smoke; toggle không đổi) |
| Glyph Nhật đúng ở ja | PASS theo evidence builder (link trong head ja) + CSS 124 face trỏ file local tồn tại; reviewer round 2 không đo live |
| vi/en không tải font JP (file + CSS) | **PASS** — 0 CSS chunk build chứa Noto; link chỉ render khi ja |
| LCP vi/en không tệ hơn | PASS về CSS (trở lại baseline); LCP không đo |
| typecheck + lint + build PASS | PASS |

## Verdict
**PASS** — F1 đã được fix đúng root cause (xác nhận qua artifact build). N1–N3 MINOR + N4 residual risk license → ghi backlog/close-out, không chặn commit. Lưu ý: kiểm runtime (curl HTML/cache header) không do reviewer thực hiện vì permission `bash "*": deny`; nếu cần bằng chứng HTTP header thật, agent chính tự chạy và đính kèm vào task file.
