Agent: reviewer

# Review Report — change solution-detail-redesign · Phase 1 · T5 (LMS layout riêng)

- Change: `spec/changes/2026-10-11-solution-detail-redesign.md` (§4 T5, §5 chốt STRICT)
- Task: T5 — LMS 8 block (spec §5 + copy §11)
- Round: **1**
- Branch: `main`
- Ngày: 2026-10-12

## Review level: **STRICT**
**Reason:** change §5 chốt STRICT cho T5; nhiều section mới, blast radius rộng (page render chung cho cả 4 trang enterprise, schema `types.ts` thêm 4 field, copy §11 VI/EN đã duyệt, a11y/contrast, acceptance nhiều mục). Không tự hạ cấp.

## Blast radius
- `src/app/[locale]/solutions/enterprise/[slug]/page.tsx` — nhánh LMS mới (early-return 8 block) + xoá nhánh legacy; nhánh default (crm/hrm/dentgo) vẫn dùng chung file → nguy cơ regression render 3 trang kia + trang AI (dùng chung hero/loader).
- `src/content/types.ts` — +4 field optional; ảnh hưởng mọi consumer đọc `Solution`.
- `src/content/solutions/{vi,en}/lms.mdx` — copy §11 + gắn ảnh; `assertRequiredFields` vẫn đòi `features/benefits` → phải giữ data.
- Components dùng lại (không sửa ở T5 nhưng bị đọc mới): `FeatureZigZag`/`FeatureImageRow`, `BentoCompliance`, `AiSection`+`AiAssistantPanel`, `AudienceCards`, `FaqAccordion`, `Section`, `ShotImage`.
- SEO/metadata: EN `title` đổi → H1/breadcrumb/JSON-LD/metadata.

## Verify commands + result
| Command | Kết quả |
|---|---|
| `npm.cmd run lint` | **Blocked** — shell permission denied (`Permission denied: shell`). Không retry theo Tool Loop Guard. |
| `npm.cmd run typecheck` | **Blocked** — như trên |
| `npm.cmd run build` | **Blocked** — như trên |
| `node scripts/screenshots/.tmp/verify-t5.mjs` | **Blocked** (không chạy được) — nhưng đã **đọc source script** (91 dòng) để đánh giá độ tin cậy: script đọc trực tiếp `.next/server/app/{vi,en}/.../lms.html` + các `.html` khác + `lms.mdx` → check thật (thứ tự block theo heading DOM, nền section, bento A vs figure B, 3 gợi ý + 0 "cảnh báo sớm", FAQ §11.6, alt §7, data giữ, 3 trang kia + trang AI không vỡ). Journal báo 39/39 PASS. |
| `git diff HEAD` | **Blocked** — shell denied; xác minh R2 bằng cách **đọc trực tiếp** cả 2 file mdx (benefits/useCases/sections còn nguyên, `screenshots: []`). |
| Soi ảnh `.png` 1440×7895 | Không tự mở (không có browser) — dựa vào journal + HTML artifact. |

**Kết luận verify:** không chạy lại được do môi trường chặn shell (task instruction đã lường trước → chuyển đọc artifact/source, không FAIL vì lý do này). Evidence gián tiếp đủ mạnh: page.tsx đọc trực tiếp khớp acceptance + verify script có thẩm quyền thật.

## Responsive Checklist Gate
> Diff đụng UI (page.tsx LMS + component solutions) → gate áp dụng. Breakpoints project: 640/768/1024/1280/1536. Không có browser → xác minh bằng CSS math + đọc class.

| Mục | Kết quả | Bằng chứng |
|---|---|---|
| Layout — mobile-first (`min-width`) | **OK** | Toàn bộ dùng `sm:`/`md:`/`lg:` (min-width). Zigzag `lg:grid-cols-2`; FeatureImageRow `sm:grid-cols-2 lg:grid-cols-3`; bento `lg:grid-cols-3`; AI `lg:grid-cols-2`; audience `md:grid-cols-3`. |
| Layout — không cột cố định px / container fixed | **OK** | Giới hạn bằng `Container` (token) + `max-w-[38rem]`/`max-w-[65ch]`/`max-w-[52ch]` (rem/ch). Không `w-screen`/`min-w-[Npx]`. |
| Layout — số cột theo mốc | **OK** | 375: 1 cột mọi block; 768: audience 3 cột, row ảnh 2 cột; 1024+: zigzag 2 cột, bento 3×(2 hàng), AI 2 cột, row ảnh 3 cột. |
| Horizontal scroll (`scrollWidth ≤ clientWidth`) | **chưa xác minh** | Không có browser; không thấy pattern gây tràn (`max-w-full`, không fixed width). → Residual. |
| Typography — rem, heading fluid | **OK (theo token)** | `text-h2`/`text-h3`/`text-body`/`text-body-lg` là scale token, không px; không hardcode font-size px trong diff. |
| Media — `max-width:100%;height:auto` | **OK** | `shotLayout`: nhánh A `h-auto w-auto max-w-full`; `next/image` có `sizes`+srcset (thấy trong HTML preload `imageSrcSet`). Không `aspect-[...]` cứng (đúng ràng buộc L4). |
| Touch — target ≥44px | **OK** | FAQ `summary` `min-h-11` (=44px); CTA `buttonStyles('primary','lg')`. Các card audience tĩnh (không phải control). |
| Media/table overflow | **N/A** | Không có table trong diff. |
| Viewport — không `100vh` trần | **OK / N/A** | Không dùng `100vh`/`h-screen` trong diff. |
| A11y — `prefers-reduced-motion` | **MINOR (chưa xác minh)** | Chevron `transition-transform duration-fast` **không** có `motion-reduce:`; không rõ globals.css có override toàn cục. → xem Finding #5. |
| A11y — h1 duy nhất, anchor | **OK (một phần)** | `id="features"` truyền vào `<Section>` (spread `sectionProps`). h1 nằm ở `SolutionHero` (không thuộc diff T5) — không xác minh lại. |

**Verdict gate responsive:** không có mục nào FAIL có bằng chứng → không chặn PASS. Các mục chưa xác minh ghi ở Residual risk.

## Skill gates
| Gate | Kết quả | Ghi chú |
|---|---|---|
| `aislop scan` | **skip** | Không chạy được — shell permission denied. |
| anti-slop (`npx oxlint`) | **skip, chưa xác minh cấu hình** | Shell denied → không kiểm được oxlint config; không kết luận. |
| open-code-review (`ocr`) | **skip, chưa xác minh cài đặt** | Shell denied. Không chặn PASS. |
| AI-readable codebase | **OK** | Tên self-descriptive (`LmsCtaBlock`, `FeatureImageRow`, `normalizeFeatures`); hàm <50 dòng; page.tsx 184 dòng <300; comment giải thích WHY (quyết định DOM thay ảnh, contrast token) chứ không WHAT. Không có magic number vô nghĩa (token/ratio có nguồn). |
| ai-friendly web | **N/A** | T5 là layout/copy trong trang đã public; không đụng `llms.txt`/`robots.txt`/`sitemap.xml` (thuộc phase DevOps/deploy). |
| blitzstrike pentest | **skip** | Static content page, không thêm attack surface; shell denied. |

## Findings

### MINOR #1 — Bento ô lớn: alt ảnh trùng tiêu đề, không mô tả giao diện (vi phạm nguyên tắc §7)
`src/content/solutions/vi/lms.mdx:90` và `src/content/solutions/en/lms.mdx:90`
```yaml
image:
  src: /images/solutions/v2/lms/04-danh-gia-ai-tt27-crop.png
  alt: "Thông tư 27/2020: Đánh giá học sinh"   # ← lặp y h3 ngay trên
```
§7 yêu cầu alt "mô tả giao diện đang làm gì, không phải tên sản phẩm"; ở đây alt lặp nguyên tiêu đề `<h3>` → screen reader đọc trùng, và không mô tả nội dung ảnh. (Ảnh `04-danh-gia-ai-tt27-crop` không có alt sẵn trong bảng §7.)
**Đề xuất:** alt mô tả vùng ảnh, vd `"Lưới nhận xét học sinh chia theo bốn bước đánh giá của Thông tư 27/2020"` / `"Student comment grid split into the four assessment stages of Circular 27/2020"`.

### MINOR #2 — Bento: ảnh con thêm `border` + `shadow-sm` trong ô đã có `border`
`src/components/solutions/BentoCompliance.tsx:77` — `skin="mx-auto rounded-md border border-border shadow-sm"` nằm trong ô đã `border border-border` (dòng 50).
§5.2 quy định bento "dùng viền + nền, **KHÔNG dùng shadow**" và không lồng viền. Hiện tạo double-border + bóng lạc trong ô.
**Đề xuất:** bỏ `shadow-sm`, và bỏ `border` ở ảnh con (ô đã có viền), hoặc xác nhận chủ đích.

### MINOR #3 — EN: 4 tiêu đề tính năng không nằm trong copy §11 đã duyệt
`src/content/solutions/en/lms.mdx:15,20,25,30` — `"Multi-school management & dashboards"`, `"Student – parent – staff records"`, `"Regulation-based assessment with AI support"`, `"Teaching operations: timetable · lesson plans · digital records"`.
§11.2 chỉ duyệt **tiêu đề VI** (§5.1) + **mô tả VI/EN**; EN chưa có bản tiêu đề được duyệt → đây là copy builder tự dịch (rủi ro lệch giọng EN).
**Đề xuất:** đưa 4 tiêu đề EN cho user duyệt (hoặc bổ sung vào §11.2).

### MINOR #4 — Change file §T5 còn mô tả ảnh crop AI (mâu thuẫn spec §5.3 đã chốt)
`spec/changes/2026-10-11-solution-detail-redesign.md:86-87` + acceptance "ảnh crop đọc rõ" vẫn nói AI dùng `04-danh-gia-ai-crop.png`, trong khi design-spec §5.3 (đã chốt, override) chuyển sang `AiAssistantPanel` DOM. Code làm đúng §5.3, nhưng change doc chưa reconcile.
**Đề xuất:** cập nhật change file cho khớp quyết định §5.3 (doc impact).

### MINOR #5 — Chevron chưa gate `prefers-reduced-motion`
`src/components/solutions/FaqAccordion.tsx:13` — `transition-transform duration-fast group-open:rotate-180` không có `motion-reduce:transition-none`. Acceptance §Chung yêu cầu `prefers-reduced-motion` vẫn hoạt động (ảnh hưởng nhỏ, chỉ 1 transform; có thể đã có override toàn cục ở `globals.css` — chưa xác minh).
**Đề xuất:** thêm `motion-reduce:transition-none` (hoặc xác nhận override toàn cục).

### MINOR #6 — `<figcaption>` dùng để chứa các thẻ gợi ý (semantics lỏng)
`src/components/solutions/AiAssistantPanel.tsx:74-87` — `figcaption` chứa danh sách card gợi ý (không phải caption mô tả figure). HTML hợp lệ nhưng ngữ nghĩa caption lỏng; nên là `<div>` sibling trong `<figure>`.
**Đề xuất:** đổi `<figcaption>` → `<div>` (giữ trong `<figure>`).

## Acceptance criteria T5 — đối chiếu
| # | Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|---|
| 1 | 8 section đúng thứ tự, đúng nền | **OK** | `page.tsx:104-124`: hero → FeatureZigZag(0,3) `bg-background` → FeatureImageRow (feature 4) `bg-background` → BentoCompliance `variant='alt'` → AiSection `ink` → AudienceCards `default` → FaqAccordion `alt` → LmsCtaBlock `default`/`large` → CTAForm. Khớp §5. |
| 2 | Bento ô lớn 2/3, 2 ô nhỏ cột phải | **OK** | `BentoCompliance.tsx:44,52` `lg:grid-cols-3 lg:grid-rows-2` + `lg:col-span-2 lg:row-span-2`. Ảnh `04-danh-gia-ai-tt27-crop` ratio 1.157, không có `figure` (không dùng phương án B). |
| 3 | AI nền tối, contrast, (spec §5.3 chốt DOM panel) | **OK** | `AiSection.tsx:38` `variant="ink"`; dùng `text-ink-text`/`text-ink-text-secondary`/`text-accent-ink`, không `text-primary`; `AiAssistantPanel` DOM; 3 gợi ý §11.4. Panel: `bg-[#047857]` + `text-white`/`text-white/90`. |
| 4 | FAQ mở/đóng bằng bàn phím | **OK** | `FaqAccordion.tsx:45` `<details>`, `summary` native (Enter/Space), chevron SVG `group-open:rotate-180`, ẩn marker, mặc định đóng, 4 câu §11.6. |
| 5 | Copy VI/EN khớp §11 | **OK** (2 exception đã ghi journal: `:` thay em-dash + "định kỳ") | Đối chiếu thủ công §11.1–§11.7 với `vi/en lms.mdx`: khớp. Không em-dash "—" trong copy render (en-dash "–"/"·" của §11.2 được phép). |
| 6 | `lms.mdx` giữ benefits/useCases/sections/screenshots | **OK** | Đọc trực tiếp: `benefits:` / `useCases:` / `sections:` còn nguyên (vi:42-68, en:42-68); `screenshots: []`. |

## Check đặc biệt STRICT — kết quả
1. Thứ tự + nền 8 block → **OK** (page.tsx). 
2. Bento A (`col-span-2 row-span-2`, ảnh crop 1.157, không figure B) → **OK**. 
3. AI: ink + `accent-ink` (không `text-primary`) + 3 gợi ý + panel DOM + không "cảnh báo sớm"/"early warning" trong HTML render → **OK**. ("cảnh báo sớm"/"early warnings" chỉ còn trong `sections` data KHÔNG render — đúng R2.) 
4. FAQ native + chevron + không ký tự +/- + đóng mặc định + 4 câu §11.6 → **OK**. 
5. Copy §11 → **OK** (2 exception hợp lệ). 
6. Data giữ nguyên R2 → **OK** (đọc file; không diff được — residual). 
7. Không regression 3 trang default + trang AI + metadata/alternates → **OK (một phần)**: nhánh default trong page.tsx không đổi logic; import legacy (PageHeader/FeatureList) đã gỡ; `createLocaleAlternates`/JSON-LD giữ nguyên. EN H1 = "School Management (LMS)", metadata title vẫn theo `enterpriseBrandNames` ("LMS Solution | NTA") + breadcrumb dùng `solution.title` → nhất quán H1, không vỡ. 
8. `slice(0,3)` + FeatureImageRow an toàn khi <4 features → **OK** (`rowFeature` guarded `? :null`; zigzag `slice`). 
9. LmsCtaBlock: 1 nút, `/contact` theo locale, full-width mobile, trước CTAForm → **OK** (`page.tsx:121-122, 172-184`). 
10. A11y: `id="features"` ✓; LMS không figcaption ✓ (không truyền `caption`); touch FAQ 44px ✓; h1 duy nhất (SolutionHero) — không thuộc diff, không xác minh lại.

## Verdict: ✅ PASS

Không có CRITICAL/MAJOR. 6 finding đều **MINOR** (a11y/alt, viền-shadow bento, copy EN chưa duyệt, doc stale, reduced-motion, semantics figcaption). Acceptance T5 đạt; verify-journal PASS nhưng **reviewer không chạy lại được do shell bị permission denied** → các điểm đó ghi ở residual, không FAIL theo luật Tool Loop Guard + hướng dẫn task.

## Residual risk / chưa xác minh
- **Shell denied**: không tự chạy lại `lint`/`typecheck`/`build`/`verify-t5.mjs`/`git diff` → tin journal + đọc artifact/script. Nếu môi trường mở shell, nên re-run để chốt.
- **Không có browser**: chưa đo trực tiếp horizontal overflow tại 375/768/1280/1440; chưa kiểm `group-open:rotate-180` có được Tailwind emit (decorative); chưa xác minh ảnh ratio crop `1.157` (không có trong bảng tỉ lệ `docs/screenshots-mapping.md` — chỉ có mô tả crop ở dòng 48-49).
- **R2 byte-identical**: xác minh bằng đọc file (data còn nguyên + comment "GIỮ NGUYÊN"), không diff được để chứng minh không mất dòng nào.
- **EN feature titles** (MINOR #3) cần user duyệt.
