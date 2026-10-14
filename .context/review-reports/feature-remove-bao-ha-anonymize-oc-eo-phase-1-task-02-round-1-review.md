Agent: reviewer

# Review — feature-remove-bao-ha-anonymize-oc-eo · phase-1-task-02 · round 1

- Task: `tasks/feature-remove-bao-ha-anonymize-oc-eo/phase-1-task-02.md` (CR-025 phần 3)
- Change doc: `spec/changes/2026-10-14-remove-bao-ha-anonymize-oc-eo.md`
- Diff: `git diff` + `git diff --cached` (working tree, chưa commit). Task-01 (bc36b75) không review lại.

## Review level
**STRICT**

## Reason
Đụng routing dùng chung (`next.config.ts` `redirects()`), đổi URL public đã index (slug case study), lookup slug hardcode trong `src/app/[locale]/solutions/ai/page.tsx`, đổi đường dẫn asset public.

## Blast radius
- `/case-studies/heritage-site-ai-camera` + `/en/...` (mới, SSG); URL cũ 3 nguồn → 301.
- `/case-studies` (thẻ), `/solutions/ai` (thẻ CTA cuối lưới qua `caseStudies.find(slug)`), `/solutions/ai/boxai` + `/solutions/ai/flycam` (relatedCases vi/en), `sitemap.ts` (sinh từ slug).
- `listingItems` key (icon/theme thẻ) vi/en.
- Asset `/images/cases/oc-eo/*` → `/images/cases/heritage-site/*`, `/images/illustrations/oc-eo-*.svg` → `heritage-site-*.svg`; xoá `oc-eo-learning-overview.svg`.
- Không đổi component/schema/API.

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS — 0 error, 1 warning có sẵn `src/components/mdx/index.tsx:25` (ngoài diff) |
| `npm run build` (không env) | Không chạy được: `Failed to load next.config.ts … Failed to load native binding` — lỗi môi trường SWC native binding đã biết trên máy Windows này, không liên quan diff. Lệnh có prefix `SWC_NATIVE_BINDING_CACHE=...` không nằm trong allowlist bash của reviewer → không chạy. |
| Build/smoke | Dùng evidence builder trong task file §Verification summary: build PASS 59/59 trang (SSG vi/en `heritage-site-ai-camera`); `next start` smoke: 3 URL cũ → `301` đúng `location`, 1 bước, không loop; slug mới vi/en `200`; HTML 0 match `Óc Eo|Ba Thê|oc-eo|Oc Eo|Ba The`; `sitemap.xml` có slug mới, 0 slug cũ; href slug mới ở `/`, `/case-studies`, `/solutions/ai`, boxai, flycam (vi/en); ảnh `heritage-site/*` 200. **Reviewer không tự kiểm chứng runtime** (xem Residual risk). |

## Kiểm tra theo yêu cầu
1. **Địa danh hiển thị** — Grep `(?i)óc eo|oc eo|oc-eo|ocEo|ba thê|ba the|thoại sơn|an giang` trên `src/**`, `public/**`: chỉ còn 5 comment nội bộ (`src/content/types.ts:167,176,188`, `src/app/[locale]/case-studies/[slug]/page.tsx:54`, `src/components/case-studies/showcase/ShowcaseTechnology.tsx:38`) — không render, được phép. Đọc toàn bộ `vi/heritage-site-ai-camera.mdx` + diff en: title, client, challenge, gallery alt, breadcrumbLabel, subtitle, description, hero alt, pillars, photos title/alt, vision description/quote đều đã bỏ tên. SVG `heritage-site-*.svg` không chứa "Eo"/"Ba Th"/entity. Ảnh `hero.jpg` (xem trực quan) chỉ có chữ "Phát hiện hiện vật / Đại tượng Phật cổ (Thế kỷ X - XII)" — không địa danh. Metadata/OG/JSON-LD lấy từ `study.title` (đã đổi) → OK. **OK**
2. **"433 ha"** giữ ở challenge, metrics, stats, pillars (vi + en "about 433 hectares"/"~433 ha"); "khu di tích quốc gia đặc biệt"/"Special National Monument" giữ. **OK**
3. **Redirect** — `statusCode: 301` (đúng, tránh 308 của `permanent`), 3 nguồn, đích không trùng nguồn nào → không loop. `redirects()` của next.config chạy **trước** middleware → `/vi/...` đi thẳng 1 bước về URL không prefix, khớp `localePrefix: 'as-needed'` (`src/i18n/routing.ts:6`); đích `/case-studies/heritage-site-ai-camera` sau đó qua middleware next-intl rewrite nội bộ sang locale vi (không redirect thêm). Source là path tuyệt đối cụ thể, không wildcard → không ảnh hưởng route khác. Không có `basePath`; `locale: false` chỉ dành cho i18n của Pages Router — App Router + next-intl không cần. Query string được Next tự giữ. **OK**
4. **Ảnh** — mọi tham chiếu mới (`cover`, gallery 3 svg, hero, 5 photos, vision, cta) trỏ file đã `git mv` (staged R100). `oc-eo-learning-overview.svg`: grep `oc-eo` trong `src`/`public` = 0 → mồ côi thật. **OK**
5. **Sitemap/listing/relatedCases/hardcode** — `sitemap.ts:19` sinh từ slug content; `listings.ts:246,260` key mới; `solutions/ai/page.tsx:42` slug mới; boxai/flycam vi/en `relatedCases` slug mới; `home.ts` không hardcode slug case study. `grep oc-eo-learning src` = 0. `SPECIFICATIONS.md:166-167` đã có R-08a.1 (spec delta). **OK**
6. **BRIEF.md:13,31** ("vd Óc Eo", "(Óc Eo, triển khai phòng khám…)") — Ý kiến reviewer: đây là brief/intent doc ở root repo, không được import bởi `src/` (grep src không thấy), không nằm trong `public/`, không vào build output hay HTML → **không phải nội dung hiển thị, không phải build input**. Tuy nhiên repo nếu public trên GitHub thì vẫn lộ địa danh; cùng loại với `docs/BRD.md:90,98` user đã chốt giữ. Đề xuất: hỏi user một câu xem có muốn ẩn luôn trong BRIEF.md (intent doc → chỉ đổi qua CR + user duyệt), không chặn task này.
7. **Chất lượng câu** — vi/en tự nhiên, khớp bảng user đã duyệt, cách gọi chung nhất quán ("một khu di tích ở Việt Nam" / "a heritage site in Vietnam"). Một vài lặp từ nhẹ (MINOR bên dưới).

## Responsive Checklist Gate
Diff chỉ đổi text/đường dẫn trong frontmatter, không đổi component/CSS.
- Layout: N/A (không đổi CSS/grid). Độ dài chuỗi: breadcrumbLabel vi dài hơn ("Khu di tích ở Việt Nam" 22 ký tự vs 14 cũ), title dài tương đương — cùng khung đã dùng cho case study khác; không thêm risk tràn ngang đáng kể. OK (CSS math, không browser).
- Typography/Spacing: N/A
- Media: N/A (cùng ảnh, chỉ đổi path)
- Touch/Interaction: N/A
- Viewport/A11y: OK — alt vẫn mô tả nội dung ảnh, vision image giữ `alt=""` (trang trí) như cũ.

## Skill gates
- aislop: skip — diff chỉ content/config, không logic mới (1 dòng string slug trong `.tsx`).
- oxlint (anti-slop): skip, oxlint not configured (eslint PASS).
- ocr (open-code-review): skip, ocr not installed.
- AI-readable: OK — 0 indicator (comment trong `next.config.ts:15-17` giải thích WHY: 301 vs 308, lý do nguồn `/vi`).
- ai-friendly-web: OK — sitemap có slug mới, bỏ slug cũ (evidence builder); robots/llms không đổi.
- blitzstrike: N/A (không auth/API/input).
- karpathy surgical: OK — mọi dòng trace về task; không drive-by.

## Findings
- [MINOR] `src/content/case-studies/vi/heritage-site-ai-camera.mdx:116` — "bảo vệ khu di tích mà còn … giá trị lịch sử – văn hóa của khu di tích" lặp "khu di tích" 2 lần trong 1 câu. Đề xuất (nếu user muốn): "…góp phần gìn giữ giá trị lịch sử – văn hóa của di tích…" hoặc "…của nơi đây…". Bảng câu đã được user duyệt → không chặn.
- [MINOR] `src/content/case-studies/vi/heritage-site-ai-camera.mdx:73` — "di sản khu di tích" hơi thừa; có thể "Góp phần bảo tồn bền vững di sản." Không chặn (đã duyệt).
- [MINOR] Đổi tên ảnh → URL ảnh cũ (`/images/cases/oc-eo/*.jpg`, `/images/illustrations/oc-eo-*.svg`) sẽ 404 cho link/OG preview đã chia sẻ trước đây. Chấp nhận được theo quyết định user (mục tiêu là không lộ `oc-eo` trong URL); nếu muốn giữ preview cũ có thể thêm redirect ảnh, nhưng sẽ làm lộ lại tên trong config → khuyến nghị **không** làm.
- [MINOR / ngoài scope] `BRIEF.md:13,31` còn "Óc Eo" — không hiển thị, không build input; hỏi user (xem mục 6).

Không có CRITICAL/MAJOR.

## Residual risk
- Reviewer không chạy được `npm run build` (lỗi SWC native binding môi trường; lệnh có env prefix ngoài allowlist) và không chạy app/curl — kết luận về 301/200/sitemap/HTML dựa trên evidence builder + phân tích tĩnh `next.config.ts`/middleware. Khuyến nghị primary chạy lại `SWC_NATIVE_BINDING_CACHE=... npm run build` trước commit nếu chưa chạy sau lần sửa cuối.
- Responsive xác minh bằng phân tích tĩnh, không browser.
- `.next-build/` cũ còn chuỗi cũ (artifact, không commit) — builder đã ghi.

## Verdict
✅ PASS
