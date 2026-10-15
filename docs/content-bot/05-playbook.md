# 05 — Playbook thao tác (ghi DB qua `db:cli`)

Luồng chung cho **mọi** lệnh — "AI đề xuất, người duyệt". Không còn branch / commit / build: prod đọc DB,
ghi xong + revalidate là web đổi ngay (vài giây).

```
Lệnh Telegram (người trong whitelist)
  → 1. Phân loại: THÊM / SỬA / XOÁ / ĐỔI SLUG · collection · slug
  → 2. Đọc bản ghi hiện tại: `show <collection>/<locale>/<slug>` cho CẢ vi và en → ghi nhớ `id` + `version`
  → 3. Thiếu thông tin? → hỏi lại, DỪNG
  → 4. Model trả đề xuất: JSON đầy đủ cho từng bản ghi (vi + en; EN do bot tự dịch từ VI)
  → 5. Gửi tóm tắt + diff "trước → sau" theo field → nút [Duyệt] [Sửa] [Huỷ]
  → 6. [Duyệt] → backup (nếu xoá / nhiều bản ghi) → create/update/delete từng bản ghi → revalidate → báo kết quả + URL
       [Sửa]  → nhận góp ý → quay lại bước 4
       [Huỷ]  → bỏ đề xuất, không ghi gì
```

## 0. Lệnh CLI

Trên VPS (DB không mở port) — chạy trong thư mục deploy (`10` §5), thay `$CLI` bằng:

```sh
docker compose run --rm --no-deps -T nta-tools tools/db/content-cli.ts
```

| Việc | Lệnh |
|---|---|
| Liệt kê | `$CLI list [--collection post] [--locale vi] [--deleted]` |
| Xem 1 bản ghi (JSON, có `id`, `version`, `data`, `body`) | `$CLI show <collection>/<locale>/<slug>` |
| Lịch sử | `$CLI history <collection>/<locale>/<slug>` |
| Tạo | `$CLI create <collection>/<locale>/<slug> --file - --actor bot:<id> --note "<lệnh gốc>" --confirm-prod < record.json` |
| Sửa | `$CLI update <collection>/<locale>/<slug> --file - --expected-version <N> --actor bot:<id> --note "…" --confirm-prod < record.json` |
| Xoá mềm | `$CLI delete <collection>/<locale>/<slug> --expected-version <N> [--confirm-public-url-change] --actor bot:<id> --confirm-prod` |
| Hoàn tác | `$CLI rollback <collection>/<locale>/<slug> --to <version cũ> --expected-version <N> --note "…" --confirm-prod` |
| Upload ảnh | `$CLI upload /tmp/<file> --alt-vi "…" --alt-en "…" --confirm-prod` → in `/uploads/<hash>.<ext>` |
| Làm mới web | `$CLI revalidate --collection <c> [--slug <s>]` hoặc `--all` |

- `record.json` = `{ "data": { … }, "body": "…" | null, "sortOrder": <số> | null }`.
  **`update` thay TOÀN BỘ `data`** (không merge) → luôn gửi `data` đầy đủ = bản `show` hiện tại + field đã sửa.
  `update` thiếu `body` / `sortOrder` = giữ nguyên.
- Exit `0` OK · `1` bị từ chối (validate / conflict / không tìm thấy — đọc stderr, gửi lại model sửa) · `2` sai cú pháp.
- Dòng `[cảnh báo] …` (vd I-1 thiếu bản ngôn ngữ kia, I-8 cần redirect) → đưa vào tin nhắn báo người duyệt.
- `--confirm-prod` bắt buộc với mọi lệnh ghi trên DB prod.
- Conflict (`expected-version` lệch) → có người vừa sửa: `show` lại, tạo đề xuất mới, hỏi duyệt lại. Không tự ghi đè.

## 1. Phân loại lệnh

| Người dùng nói | Thao tác | Mục |
|---|---|---|
| "viết bài / đăng tin / thêm bài blog …" | THÊM `post` | §2 |
| "thêm giải pháp / sản phẩm / case study …" | THÊM trang | §3 |
| "sửa / cập nhật / đổi chữ / thêm FAQ / đổi ảnh / đổi số điện thoại / đổi chữ menu …" | SỬA | §4 |
| "xoá / gỡ / ẩn bài …" | XOÁ | §5 |
| "đổi đường dẫn / đổi slug" | ĐỔI SLUG | §6 |
| "quay lại bản trước / hoàn tác" | ROLLBACK | §7 |
| sửa giao diện, thêm tính năng, đổi màu ngoài enum, thêm loại trang, sửa `<title>`/meta | **Từ chối** — việc của dev (`08` §5) | — |

Không chắc slug nào → `list` rồi đưa 2–3 ứng viên (tiêu đề + URL) cho người dùng chọn. Không đoán.

## 2. Thêm bài blog

Cần: tiêu đề, nội dung/ý chính, danh mục (đề xuất nếu thiếu), ảnh cover (không có → dùng cover SVG có sẵn
`/images/blog/...` phù hợp chủ đề, nói rõ trong tóm tắt), ngày (mặc định hôm nay, giờ VN).

1. Sinh `slug` kebab-case không dấu (≤ 6 từ). Kiểm chưa có: `list --collection post --deleted`.
2. Ảnh người dùng gửi → `upload` trước, lấy `/uploads/<hash>.<ext>` làm `cover`.
3. 2 bản ghi `post/vi/<slug>` + `post/en/<slug>` — `data` theo `06` §1 (frontmatter → JSON), thân bài → `body`.
4. `excerpt` 1–2 câu, ≤ ~160 ký tự. Body: mở đầu, các mục `##`, kết ngắn. Không bịa số liệu/nguồn.
5. Revalidate: `--collection post`.

## 3. Thêm giải pháp / sản phẩm / case study

Cần tối thiểu: tên, nhóm (enterprise/ai, sản phẩm, hoặc case study + năm + lĩnh vực), mô tả, thách thức /
giải pháp / kết quả (hoặc ghi "đề xuất"), tính năng chính, ảnh. Thiếu → hỏi.

1. `show` 1 bản ghi cùng loại làm mẫu (vd `solution/vi/crm`, `case_study/vi/dental-clinic-operations`, `product/vi/music-app`).
2. **Thứ tự ghi** (write-path chặn nếu sai thứ tự):
   1. `slug_registry/{vi,en}/<slug>` — chỉ solution/product: `data {"group": "enterprise"|"ai"|"product"}`, `sortOrder` = vị trí hiển thị.
   2. `upload` ảnh mới.
   3. Nội dung `solution|product|case_study/{vi,en}/<slug>`.
   4. `listing_item/{vi,en}/<slug>` (`06` §5).
   5. (tuỳ chọn) `home` — thêm vào `featuredProducts` / `solutionCards.bullets`.
3. Revalidate từng collection đã ghi (hoặc `--all`).
4. Tóm tắt cho người duyệt liệt kê mọi bản ghi sẽ tạo/sửa + vị trí trong danh sách.

## 4. Sửa nội dung

1. Xác định bản ghi + **đường dẫn field**, vd `solution/vi/crm` → `data.showcase.faq.items[2].answer` (`09`).
2. Sửa **tối thiểu** — chỉ field được yêu cầu, giữ nguyên thứ tự key và mọi phần khác. Gửi `data` đầy đủ.
3. Sửa bản ngôn ngữ còn lại tương ứng (bot tự dịch EN — `04` §C).
4. Đổi tên hiển thị (`title`/`brandName`) → kiểm `home` (bullets) và nơi khác nhắc tên.
5. Chữ giao diện → `ui_messages/<locale>/<namespace>`; liên hệ → `company_info/{vi,en}/contact` (ghi giống nhau 2 locale).
   Không để chuỗi / mảng rỗng.
6. Tóm tắt dạng "trước → sau" cho từng field.

## 5. Xoá

1. Xác nhận lại **đúng 1 lần**: "Sẽ gỡ trang X (vi + en), URL … sẽ 404 cho tới khi dev thêm redirect".
2. Backup trước (`10` §4), rồi `delete` vi + en. Collection có URL công khai cần `--confirm-public-url-change`.
3. solution/product: xoá nội dung **trước**, rồi `slug_registry` + `listing_item` (xoá registry khi nội dung còn sống → bị chặn).
4. Dọn tham chiếu chéo (`03`): `related`, `href`, `home.featuredProducts`, bullets.
5. Báo người duyệt: **cần dev thêm redirect 301** trong `next.config.ts` (bot không sửa code).
6. Bài `ai-weekly-*` → chỉ xoá khi người duyệt nói rõ.

"Ẩn tạm" = xoá mềm, khôi phục bằng `rollback` (§7).

## 6. Đổi slug

Khoá không đổi tại chỗ → = Thêm (slug mới, nội dung cũ, theo §3) + Xoá (slug cũ, theo §5) + cập nhật mọi `href`/`related`
trỏ slug cũ + báo dev thêm redirect 301 cũ → mới.

## 7. Hoàn tác

`history` → chọn version cần quay về → `rollback --to <v> --expected-version <hiện tại>` (vi và en riêng) → revalidate.
Rollback tạo version mới (không xoá lịch sử); bản ghi đã xoá mềm được khôi phục.

## 8. Lỗi hay gặp (stderr, exit 1)

| Thông báo | Nguyên nhân | Sửa |
|---|---|---|
| `thiếu field …` | Thiếu required field | Bổ sung theo `02` / `08` §4 |
| `I-2 …` | slug sai định dạng hoặc `data.slug` ≠ khoá | Sửa slug |
| `I-3` / `I-4 …` | Chưa có `slug_registry` hoặc sai nhóm | Tạo registry trước (§3) |
| `I-5 … đã tồn tại` | Slug đã dùng (kể cả đã xoá mềm) | Chọn slug khác hoặc `rollback` khôi phục |
| `I-6 …` | Enum / icon / link liên hệ sai | Dùng giá trị trong `02` §Enum |
| `I-7 …` | Ảnh không tồn tại | `upload` trước, dùng đúng path in ra |
| `I-8 …` | Xoá URL công khai thiếu cờ | Thêm `--confirm-public-url-change` sau khi người duyệt đồng ý |
| `conflict` | `expected-version` lệch | `show` lại, đề xuất lại |

## 9. Tin nhắn gửi người duyệt (mẫu)

```
📝 SỬA · Giải pháp CRM (vi + en)
• showcase.faq.items: thêm "Có dùng thử được không?"
• description: "…cũ…" → "…mới…"
Bản ghi: solution/vi/crm v3 → v4 · solution/en/crm v3 → v4
URL: https://ntavietnam.tech/solutions/enterprise/crm
[Duyệt] [Sửa] [Huỷ]
```

Sau khi ghi: `✅ Đã cập nhật solution/vi/crm v4, solution/en/crm v4 · revalidate OK` (+ cảnh báo nếu có).
