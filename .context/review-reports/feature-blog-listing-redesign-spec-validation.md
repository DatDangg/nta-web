# Spec Validation Report — `blog-listing-redesign` (pre-plan, round 1)

Agent: spec-validator · Ngày: 2026-10-13 · Chế độ: **Spec validation (trước khi chia task)**
**Entry Mode:** partial_docs (spec + design-spec + code hiện tại + change doc/mockup)

## Verdict: ❌ FAIL (round 1)

Không có ❌ Missing đối với 6 quyết định của user, không có conflict HIGH. FAIL vì **≥3 điểm ⚠️ mơ hồ ảnh hưởng tính testable**
(3 MAJOR bên dưới) — đúng ngưỡng FAIL của `.agent/spec-validator.md` ("≥3 ⚠️"). Sửa đều nhỏ (vài dòng trong R-09a), sau đó chạy lại round 2.

## Phạm vi đã kiểm
- Change doc: `spec/changes/2026-10-13-blog-listing-redesign.md` (Acceptance :33-42, Quyết định :44-53).
- Delta: `SPECIFICATIONS.md:2` (spec_version), `:132-157` (R-09 clarify + R-09a); `spec/updates/2026-10-13-blog-listing-redesign.md`; `spec/CHANGELOG.md:27` (dòng 3.2.0).
- Đối chiếu: `.context/design-spec.md` §1.4 (:51-59), §1.6 (:68-78), §1.8 (:89-96), Screen 10 (:462-490), Screen 11 (:494-524);
  `SPECIFICATIONS.md:231` (BR-004), R-20/R-21/R-22/R-24 (:213-229).
- Code: `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/blog/[slug]/page.tsx`, `src/components/blog/{BlogFilter,ArticleHeader,RelatedPosts,ShareBar}.tsx`,
  `src/components/cards/PostCard.tsx`, `src/components/ui/Pagination.tsx`, `src/components/listing/ListingExplorer.tsx` (tham chiếu pattern),
  `src/lib/format/date.ts`, `src/lib/content/posts.ts`, `src/content/types.ts:215-223`, `src/content/blog/{vi,en}/*.mdx` (4×2 bài),
  `src/i18n/messages/{vi,en}.json` (namespace `blog`), `src/app/sitemap.ts`.

## Ma trận coverage — 6 quyết định của user

| # | Quyết định (change doc) | Delta | Status | Ghi chú |
|---|---|---|---|---|
| 1 | Newsletter ẨN, cột phải chỉ còn thẻ NỔI BẬT (:45) | SPEC:156, updates:13 | ✅ | Acceptance :39 đã gạch. |
| 2 | 7 chip theo mockup + map 4 bài; chip rỗng vẫn hiện → "chưa có bài viết" (:46-47) | SPEC:144-147, :153-154; updates:18-19 | ✅ | Map khớp: responsible-ai→`ai-tech`, digital-workflows→`practical`, learning-content→`guides`, first-steps→`nta-news`; `customer-stories`, `trends` rỗng. 6 key + "Tất cả" = 7 chip ✔. |
| 3 | Minh hoạ hero tự dựng SVG/CSS, tokens; cover giữ SVG (:48) | SPEC:142-143 | ✅ | `aria-hidden` có. "Dùng design tokens/không hardcode màu" chỉ ở change doc :65 — nên ghi vào R-09a (MINOR m6). |
| 4 | Thời gian đọc ~200 từ/phút, min 1 (:49) | SPEC:155 | ✅ / ⚠️ | Định nghĩa "từ" chưa rõ cho VI (xem m3). |
| 5 | "Xem tất cả bài viết" cuộn xuống "Bài viết mới nhất" + reset lọc (:50) | SPEC:150 | ✅ / ⚠️ | Edge case mục 4 bị ẩn (xem m5). |
| 6 | Đổi util ngày chung list + detail: VI `12 Th10, 2026` / EN `Oct 12, 2026`, detail chỉ đổi chuỗi ngày (:51) | SPEC:136-139, updates:11-12, :16-17 | ✅ / ⚠️ | Đúng luật 1 nguồn `src/lib/format/date.ts`. Padding tháng chưa rõ (xem M3). |

## Findings

### BLOCKER
- (không có)

### MAJOR (⚠️ — tính testable)
- **M1 — Kích thước trang + quan hệ khối nổi bật ↔ phân trang chưa xác định.** `SPECIFICATIONS.md:151-152` chỉ nói "phân trang", không có pageSize.
  Hiện code + design-spec dùng 9 (`src/components/blog/BlogFilter.tsx:13`, `.context/design-spec.md:467`) — không chia hết lưới 4 cột (xl).
  Cũng chưa rõ: (a) trang `?page=2+` có hiển thị lại khối nổi bật không; (b) 3 bài nổi bật có tính vào pageSize trang 1 không;
  (c) khi đang lọc/tìm thì pageSize bao nhiêu. → Đề xuất ghi rõ, vd: "pageSize = 8 (lưới), khối nổi bật chỉ ở trang 1 khi không lọc,
  không tính vào pageSize; khi lọc/tìm pageSize = 8".
- **M2 — Ngữ nghĩa URL param chưa đủ.** `SPECIFICATIONS.md:146-147` (`?category=<key>&q=<text>&page=<n>`) thiếu:
  "Tất cả" = không có `category` (hay `category=all`?); `category` không hợp lệ (vd `?category=foo`) → fallback "Tất cả" hay empty state;
  `q` rỗng/chỉ khoảng trắng → bỏ param (trim); `page` vượt phạm vi → clamp (như hiện tại `BlogFilter.tsx:18-21`);
  cập nhật URL bằng `push` hay `replace`, tìm kiếm áp dụng khi gõ (debounce) hay khi Enter.
  SEO: canonical `/blog` phải **bỏ query** (hiện đúng — `src/app/[locale]/blog/page.tsx:23`) — nên ghi thành luật để khỏi bị đổi; sitemap không chứa URL có query.
- **M3 — Format ngày VI chưa định nghĩa đủ để test.** `SPECIFICATIONS.md:137` nói "ngày 2 chữ số + `Th` + tháng + năm" nhưng không nói tháng có
  zero-pad không: bài 2026-03-15 → `15 Th3, 2026` hay `15 Th03, 2026`? Ngày 8/10 → `08 Th10, 2026` (theo "2 chữ số") — nên có ví dụ cụ thể.
  Lưu ý kỹ thuật: `Intl.DateTimeFormat('vi-VN', {month:'short'})` cho ra "thg 10", không phải "Th10" → util phải tự ghép chuỗi
  (`src/lib/format/date.ts:9`); test phải cố định timezone (hiện `new Date('YYYY-MM-DD')` parse UTC, `date.ts:18`).
  EN: ghi rõ ngày không pad (`Oct 8, 2026`) như hiện tại.

### MINOR (💡)
- **m1 — Xung đột nhẹ a11y ô tìm kiếm** với `.context/design-spec.md:74` ("label visible, không placeholder-as-label"): mockup chỉ có placeholder.
  Đã có tiền lệ trong repo dùng label `sr-only` + `type="search"` + live region đếm kết quả (`src/components/listing/ListingExplorer.tsx:86-98`).
  → R-09a nên ghi: search có label (sr-only chấp nhận được theo tiền lệ), chip là `button` có `aria-pressed` (hoặc link) trong `role="group"`
  có nhãn, touch target ≥44px, `role="status"` thông báo số kết quả, "Xem tất cả bài viết" chuyển focus tới heading mục 4,
  scroll tôn trọng `prefers-reduced-motion`. Lưu ý: ListingExplorer **ẩn** chip rỗng (`ListingExplorer.tsx:39`) — R-09a yêu cầu **hiện** → không tái dùng nguyên logic đó.
- **m2 — Empty state "chưa có bài nào" (0 bài toàn site) không được nhắc trong R-09a**; dòng `SPECIFICATIONS.md:135`
  ("Empty state cho list chưa specify — `[cần xác nhận]`") đã lỗi thời → cập nhật: 0 bài → giữ empty Screen 10 (`design-spec.md:472,487-488`);
  lọc rỗng → message + "Xoá bộ lọc" (§1.4 :57). Ghi rõ chuỗi empty khi chip rỗng (VI/EN).
- **m3 — "Số từ" cho tiếng Việt** (`SPECIFICATIONS.md:155`): VI tách theo âm tiết → ~1.4× số "từ" EN cho cùng nội dung; nên định nghĩa
  "token tách theo khoảng trắng của body MDX, bỏ frontmatter/markup, `ceil(words/200)`, min 1". Với 4 bài hiện có (100–184 từ) mọi bài = 1 phút đọc — ghi để test kỳ vọng.
- **m4 — Bỏ dấu khi tìm:** ghi rõ chuẩn hoá NFD + bỏ dấu + map `đ/Đ → d` (NFD không tách `đ`), trim + lowercase; trường tìm = `title` + `excerpt` (không tìm body).
- **m5 — Edge case "Xem tất cả bài viết"** (`SPECIFICATIONS.md:150-152`): khi ≤3 bài, mục 4 bị ẩn ("rỗng → ẩn mục") → nút cuộn tới đích không tồn tại.
  Cần luật: ẩn nút, hoặc mục 4 luôn hiện toàn bộ bài khi bấm. Cũng nên nói nút `?page`/`q`/`category` bị xoá về `/blog`.
- **m6 — Hero:** ghi rõ (a) h1 là tiêu đề 2 dòng mới hay vẫn "Tin tức" (design-spec Screen 10 copy `:487` nói h1 = "Tin tức"/"Blog");
  (b) copy EN của hero (`intro`, tiêu đề 2 dòng) + nhãn EN 7 chip chưa có trong delta — cần thêm keys i18n vi/en (R-20); (c) dùng design tokens,
  không hardcode màu mockup (change doc :65); (d) ảnh nền `hero-background.png` 1.5 MB → phải xuất webp/AVIF + kích thước responsive (R-22, không phải phần tử LCP lớn nếu là nền trang trí).
- **m7 — Kiểu dữ liệu danh mục:** `Post.category` đang là `string` (`src/content/types.ts:219`), loader chỉ kiểm có field (`src/lib/content/posts.ts:7`).
  Nên ghi: `category` là union 6 key, key lạ → build lỗi (fail fast) để chip/badge không rơi vào nhãn i18n thiếu. Key dùng chung vi/en.
- **m8 — Blast radius trang chi tiết:** `PostCard` dùng cả trong `RelatedPosts` (`src/components/blog/RelatedPosts.tsx:12`); nếu PostCard thêm thời gian đọc/đổi
  layout thì card liên quan ở detail đổi theo — mâu thuẫn "detail chỉ đổi chuỗi ngày + nhãn badge" (`spec/updates/...:16-17`). → Ghi: card mới riêng
  trong `src/components/blog/` hoặc chấp nhận RelatedPosts dùng card mới. Badge detail phải đổi sang nhãn i18n (`ArticleHeader.tsx:15`, `PostCard.tsx:20`).
- **m9 — Bài liên quan theo danh mục** (`src/app/[locale]/blog/[slug]/page.tsx:39`): sau remap 4 bài vẫn 4 key khác nhau → RelatedPosts vẫn ẩn (không đổi hành vi). OK,
  nhưng nên ghi vào R-09: "liên quan = cùng category key" để so sánh theo key thay vì nhãn.
- **m10 — Responsive khối nổi bật** chỉ có cho lưới mục 4 (`SPECIFICATIONS.md:151`); khối 3 cột (lớn / 2 nhỏ / thẻ NỔI BẬT) chưa ghi breakpoint xếp cột và thứ tự
  trên mobile/tablet (Acceptance :34 "xếp cột hợp lý" không testable). Mục 4: `lg` theo mặc định = 2 cột — nên ghi rõ.
- **m11 — Wording CHANGELOG** `spec/CHANGELOG.md:27` "1 lớn + 2 nhỏ" vs spec "tối đa 2 nhỏ" (`SPECIFICATIONS.md:149`) — chỉnh cho khớp.

### Không phát hiện conflict
- **Luật R-09 "list = detail" về ngày:** delta giữ 1 util chung → ✅ (cần sửa `date.ts` + docstring `:15`).
- **JSON-LD:** Article dùng ISO `date` (`[slug]/page.tsx:41`) → không bị ảnh hưởng bởi format hiển thị ✅. BreadcrumbList `/blog` giữ (`blog/page.tsx:35`).
  (Ghi chú pre-existing, ngoài phạm vi: design-spec Screen 10 `:490` yêu cầu JSON-LD `Blog` — code chưa có.)
- **Sitemap** (`src/app/sitemap.ts`) chỉ dùng slug → không đổi ✅.
- **BR-004** (`SPECIFICATIONS.md:231`, `:156`): không thêm bài/ảnh giả, khối co lại khi thiếu bài ✅.
- **Semver:** thêm requirement R-09a + đổi output format hiển thị (không breaking contract/route) → **MINOR 3.1.0 → 3.2.0 đúng** (`SPECIFICATIONS.md:2`, `CHANGELOG.md:27`).
- `Pagination` giữ các query param khác khi đổi trang (`src/components/ui/Pagination.tsx:29-31`) → tương thích `?category=&q=&page=` ✅.

## Doc-reconcile (làm sau khi build, trước close-out)
1. `.context/design-spec.md` Screen 10 (:462-490): thay Layout/Components (hero newsroom, FilterBar chip + search, Featured block, grid 4 cột), pageSize (M1),
   Responsive table (base 1 / md 2 / xl 4 + khối nổi bật), States (lọc rỗng, chip rỗng, 0 bài), A11y (chip/search/live region), Copy (h1/hero VI-EN, nhãn chip), Interactions (`?category=&q=&page=`).
2. `.context/design-spec.md` Screen 11 (:520): đổi ví dụ ngày VI "08/10/2026" → format mới; Badge = nhãn i18n theo key.
3. `.context/design-spec.md` §1.9 component library: thêm component blog mới (nếu tạo).
4. `SPECIFICATIONS.md:135`: bỏ `[cần xác nhận]` empty state (m2).
5. `src/lib/format/date.ts:13-16` docstring ví dụ format.
6. `spec/CHANGELOG.md:27` wording (m11); `docs/DESIGN.md:121-123` (nguồn R-09) nếu có mô tả listing/format ngày.

## Verdict Reasoning
- ❌ Missing: 0 · HIGH conflict: 0 · ⚠️ MAJOR: 3 (M1 pagination, M2 URL semantics, M3 format ngày) → chạm ngưỡng "≥3 ⚠️" → **FAIL**.
- Delta đúng hướng và khớp đủ 6 quyết định; chỉ cần bổ sung vài dòng vào R-09a/R-09 (M1–M3, nên kèm m1, m2, m5, m6b, m7) rồi re-validate round 2.
- Các mục M1–M3 có thể chốt bằng default hợp lý do change-request agent đề xuất; chỉ hỏi user nếu muốn khác default (pageSize, padding tháng).

---

# Round 2 — re-validation (2026-10-13)

Agent: spec-validator · Phạm vi: như round 1 — `SPECIFICATIONS.md:130-183` (Module 7; R-09 `:132-140`, R-09a `:141-181`,
"Chi tiết hành vi" `:157-179`), `spec/CHANGELOG.md:27`, `spec/updates/2026-10-13-blog-listing-redesign.md` (thêm §Round 2 `:23-25`),
đối chiếu lại code/design-spec như round 1 (code không đổi).

## Verdict: ✅ PASS (round 2)

0 ❌ · 0 conflict HIGH · 0 ⚠️ MAJOR còn mở · chỉ còn 3 💡 MINOR (không chặn). Các mục doc-reconcile (design-spec Screen 10/11, docstring `date.ts`,
`docs/DESIGN.md`) thuộc task close-out theo chỉ đạo của coordinator → không tính vào verdict.

## Trạng thái từng finding round 1

| Finding | Status | Bằng chứng |
|---|---|---|
| M1 page size / nổi bật ↔ phân trang | ✅ resolved | `SPECIFICATIONS.md:161-162`: 12/trang; nổi bật (3 bài) chỉ trang 1, không tính vào page size; lọc/tìm 12/trang. `spec/updates:10` khớp. |
| M2 ngữ nghĩa URL | ✅ resolved | `:163-165`: "Tất cả" = không `category`; key lạ → Tất cả; `q` trim, rỗng → bỏ; `page` kẹp; đổi lọc → bỏ `page`; `replace` + debounce ~300ms; canonical không query. |
| M3 format ngày VI | ✅ resolved | `:137-139`: `08 Th10, 2026`, `15 Th3, 2026`, tháng không pad, ghép tay (không `Intl` "thg"), theo ngày ISO không lệch TZ; EN `Oct 8, 2026`. `CHANGELOG.md:27`, `spec/updates:11` khớp. |
| m1 a11y search/chip | ✅ resolved | `:173-175`: `button aria-pressed` trong `role="group"`, label sr-only + `type="search"`, `role="status"`, chuyển focus, reduced-motion. |
| m2 empty 0 bài + dòng stale | ✅ resolved | `:135` thay `[cần xác nhận]` bằng tham chiếu; `:168-169` 0 bài / lọc rỗng. |
| m3 thời gian đọc VI | ✅ resolved | `:167`: token theo khoảng trắng của body MDX, `ceil(/200)`, min 1. |
| m4 chuẩn hoá tìm kiếm | ✅ resolved | `:166`: tiêu đề + tóm tắt; trim, lowercase, NFD bỏ dấu, `đ`→`d`, khớp chuỗi con. |
| m5 ≤3 bài / nút "Xem tất cả" | ✅ resolved | `:169`: mục 4 ẩn, nút cuộn tới thanh lọc. |
| m6 hero h1/EN copy/tokens/webp | ✅ resolved | `:158-160` h1 + EN + nhãn chip EN, metadata title giữ; `:177` tokens + webp. |
| m7 kiểu `category` | ✅ resolved | `:176`: union 6 key, key lạ → build fail. |
| m8 blast radius PostCard | ✅ resolved | `:178-179`: thẻ mới riêng trong `src/components/blog/`; `PostCard` chỉ đổi nhãn badge + ngày. |
| m9 bài liên quan theo key | ✅ resolved | `:176`: "Bài liên quan ở detail = cùng key". |
| m10 responsive khối nổi bật | ✅ resolved | `:170-172`: xl 3 cột; md–lg lớn full + 2 nhỏ 2 cột + NỔI BẬT full; base thứ tự lớn → nhỏ → NỔI BẬT; chip cuộn ngang trong khung. |
| m11 wording CHANGELOG | ✅ resolved | `CHANGELOG.md:27` "1 lớn + ≤2 nhỏ". |

## Còn mở (💡 MINOR — không chặn, sửa khi build/close-out)
- **r1 — Lệch số cột ở `lg`:** `SPECIFICATIONS.md:152` ghi lưới "1 / 2 / 4 cột ở base / md / xl" (ngầm hiểu lg = 2), còn `:171` chốt
  "1 / 2 (md) / 3 (lg) / 4 (xl)". Lấy `:171` làm chuẩn; sửa `:152` cho khớp (1 dòng).
- **r2 — Kết hợp lọc:** chưa ghi rõ `category` + `q` kết hợp theo **AND** (đang ngầm hiểu). Nên thêm vào `:163-166`.
- **r3 — Copy EN của chuỗi mới** (empty lọc "Không có bài viết phù hợp", thẻ NỔI BẬT, "Xem tất cả bài viết", "Đọc thêm →", "phút đọc") chưa có trong spec;
  builder dịch theo §1.7 design-spec (sentence case, ≤ VI+30%), acceptance i18n (`change doc :38`) đã bao.

## Ghi chú kiểm lại (không đổi so với round 1)
- Khớp đủ 6 quyết định user; BR-004, JSON-LD Article (ngày ISO), sitemap, `Pagination` giữ query — không conflict.
- Semver MINOR 3.1.0 → 3.2.0 vẫn đúng (`SPECIFICATIONS.md:2`, `CHANGELOG.md:27`).
- Doc-reconcile (close-out): design-spec Screen 10 `:462-490` (bố cục, page size 9 → 12, responsive, states, a11y, copy h1),
  Screen 11 `:520` (ví dụ ngày), §1.9; docstring `src/lib/format/date.ts:13-16`; `docs/DESIGN.md:121-123` nếu có mô tả listing.
