Agent: reviewer

# Review — feature-add-japanese-locale · phase-2-task-01 · round 1

- CR: CR-044 · spec SPECIFICATIONS.md R-20a mục 3 · task `tasks/feature-add-japanese-locale/phase-2-task-01.md`
- Diff (untracked): `src/i18n/messages/ja.json` (mới), `src/i18n/messages.test.ts` (mới). vi.json / en.json không đổi.

## Review level
**NORMAL**

## Reason
Thêm file messages mới + 1 test thuần đọc JSON. Không đụng auth/schema/API/shared code. Chưa có route nào nạp `ja.json` (blog/contact page vẫn `notFound()` với locale ≠ vi/en; định tuyến ja thuộc P2-T02). Messages là tài nguyên dùng chung mọi trang nên không hạ xuống FAST.

## Blast radius
- Hiện tại: 0 runtime (chưa có route/loader dùng `ja`). Test mới chạy trong `npm test` (glob `src/**/*.test.ts`).
- Khi P2-T02 bật route `/ja`: toàn bộ chuỗi UI tiếng Nhật trên mọi trang (nav, footer, home, solutions, about, products, case studies, blog, contact form + validation).
- Test parity cũng khoá vi = en (lệch vi↔en sau này sẽ làm test đỏ — đúng ý đồ).

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | PASS (tsc --noEmit, 0 lỗi) |
| `npm run lint` | PASS (0 errors, 1 warning có sẵn `src/components/mdx/index.tsx:26` no-img-element — ngoài scope) |
| `npm test` | 209 tests · 206 pass · 1 fail · 4 test mới trong `messages.test.ts` đều PASS. Test fail duy nhất: "toàn bộ nội dung file hiện tại qua quy tắc từng bản ghi + ảnh tồn tại" (ảnh public/uploads) — fail sẵn từ trước, không liên quan task |
| `SWC_NATIVE_BINDING_CACHE=... npm run build` | PASS (next build hoàn tất, route table in ra bình thường) |
| Parse ICU bằng `@formatjs/icu-messageformat-parser` | skip — không có lệnh allow để chạy script node; đã kiểm tay 2 chuỗi plural (`interactive.filter.resultCount`, `blog.resultCount`): `{count, plural, =0 {...} other {#...}}` cú pháp hợp lệ, có nhánh `other` bắt buộc. Các placeholder còn lại là `{name}` đơn giản |

## Kiểm nội dung
- Cấu trúc: test parity đệ quy (gồm index mảng, độ dài mảng, kiểu lá) PASS cho cả vi=en và ja=en → đủ key, `about.values.core.items` 4 phần tử.
- Placeholder ICU giữ đúng: `{alt}`, `{current}`, `{total}`, `{page}`, `{title}`, `{minutes}`, `{count}`, `{max}`.
- Plural ja bỏ `one`: đúng CLDR (tiếng Nhật chỉ có category `other`); `=0` giữ nguyên. OK.
- Giữ nguyên: NTA, BoxAI, DentGo, CRM/LMS/HRM, Google Maps, Kim Hoan / Lane 19 Duy Tan / Cau Giay / Hanoi, `name@company.com`, `0901 234 567`, `50+`/`30+`/`99%`, giờ 8:30–17:30, `© NTA. All rights reserved.`, `Let's Build` / `Smarter Together`, eyebrow tiếng Anh (SOLUTIONS/PRODUCTS/CASE STUDY), giới hạn ký tự form (2–100, 9–15, 10–2000, 10–500, 150), "24時間以内".
- Văn phong: です/ます nhất quán, kính ngữ phù hợp website B2B (お問い合わせ, ご相談, ご入力ください, ご連絡いたします). Thuật ngữ đúng: 導入事例, 導入メリット, 活用シーン, よくあるご質問, デジタルトランスフォーメーション（DX）, 受託ソフトウェア開発, 人事管理, 業種/年度.
- Fabrication: không thấy cam kết mới. `contact.consultationTitle` = 「ご相談のお申し込み」 (không hứa 無料) — khớp en "Get a consultation". `readingTime` thêm 「約」 và `needs.flycam` thêm chú thích 「（ドローン）」 chỉ là làm rõ, không thêm cam kết.
- Placeholder ví dụ được bản địa hoá (山田 太郎, 株式会社ABC) — hợp lý, không phải dữ liệu thật.
- Nhãn chia đôi (Lead + Accent, render `{lead} <Accent>{accent}</Accent>`): home/solutions/products/caseStudy/about.values/about.people/blog đọc liền tự nhiên. Xem MINOR-2/3.

## Responsive Checklist Gate
N/A — diff không đụng route/component/CSS; chỉ thêm chuỗi. Độ dài chuỗi ja trên layout thật sẽ kiểm khi P2-T02 bật route `/ja` (Residual risk).

## Skill gates
- aislop: skip — diff là JSON + 1 test nhỏ; không chạy để tránh tải package ngoài.
- oxlint (anti-slop): skip, oxlint chưa cấu hình; ESLint PASS thay thế.
- ocr: skip, ocr not installed.
- AI-readable: OK — test file 85 dòng, hàm ngắn (≤ 20 dòng), tên rõ (`collectLeaves`, `collectStrings`, `topLevelArguments`), comment nêu lý do (CR-044/next-intl), 0 indicator.
- ai-friendly-web: N/A (không đổi trang public ở task này).
- blitzstrike: N/A (không phải STRICT).

## Test có ý nghĩa?
Có. Test 1 so sánh map đường dẫn → kiểu lá giữa 2 file thật (không tautology) → thiếu/thừa key, đổi kiểu, lệch độ dài mảng đều làm fail. Test 3 bắt mất/đổi tên placeholder cấp ngoài. Test 4 bắt mất rich-tag (hiện en chưa có tag nào nên đang là guard cho tương lai).

## Findings
- **[MINOR-1]** `src/i18n/messages.test.ts:41-57,70-77` — test ICU chỉ so tên đối số cấp ngoài; không phát hiện plural sai cú pháp (thiếu `other`, ngoặc lệch bên trong nhánh, `#` sai chỗ). Đề xuất (không chặn): thêm assert `parse(text)` bằng `@formatjs/icu-messageformat-parser` (đã có trong node_modules qua next-intl) cho mọi chuỗi ja.
- **[MINOR-2]** `src/i18n/messages/ja.json:242` — `contact.heroLead`「ともに創りましょう」+ `heroAccent`「現場に届く価値を」đọc thành câu đảo ngữ (倒置法); hiểu được nhưng hơi gượng. Đề xuất cho bot/user soát: vd Lead「現場に届く価値を」+ Accent「ともに創りましょう」 (đổi điểm nhấn) hoặc giữ nguyên nếu thích đảo ngữ kiểu quảng cáo.
- **[MINOR-3]** `src/i18n/messages/ja.json:145` — `about.hero` render「会社紹介 NTA」— chấp nhận được (kiểu tiêu đề "会社紹介｜NTA") nhưng hơi cứng; ràng buộc thứ tự Lead→Accent nên khó tốt hơn. Ghi vào danh sách soát thuật ngữ.
- **[MINOR-4]** `src/i18n/messages/ja.json:153` — `about.stats.satisfaction.label`「顧客満足度」(tỷ lệ hài lòng) vs en "Satisfied clients" (tỷ lệ khách hài lòng) — gần nghĩa, không thêm cam kết; ghi để user xác nhận cách diễn đạt.
- **[MINOR-5]** `src/i18n/messages/ja.json:76` — home hero: điểm nhấn (accent) chuyển từ "Vietnamese businesses" sang「デジタルソリューション」do trật tự từ tiếng Nhật; đọc liền tự nhiên, chỉ đổi phần được tô màu. Ghi nhận, không cần sửa.
- Task file: mục "Verification summary" vẫn `_pending_` và chưa có danh sách thuật ngữ cần soát (Acceptance #2) — việc của close-out/primary, gợi ý dùng MINOR-2..5 + tên sản phẩm trong `contact.needs` làm danh sách.

Không có CRITICAL / MAJOR.

## Residual risk
- Cú pháp ICU chưa được parse máy (chỉ kiểm tay 2 chuỗi plural).
- Chưa kiểm hiển thị thực tế (tràn chữ/xuống dòng tiếng Nhật, font CJK) — sẽ lộ ra ở P2-T02 khi bật route `/ja`.

## Verdict
✅ **PASS**
