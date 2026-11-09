# Spec update 4.12.1 — R-20a.6 font tiếng Nhật (CR-044 G1)

- Ngày: 2026-11-09 · Loại: PATCH (làm rõ câu chữ, không đổi hành vi) · User duyệt: "Duyệt, đóng CR-044".
- Trước: "glyph tiếng Nhật qua `next/font` Noto Sans JP …, chỉ áp dụng ở trang ja, không preload trên trang vi/en".
- Sau: font Noto Sans JP tự host trong `public/fonts/noto-sans-jp/` (kèm `OFL.txt`), chỉ link ở trang ja — trang vi/en không tải CSS/file font JP.
- Lý do: `next/font` đưa toàn bộ @font-face JP vào CSS dùng chung (render-blocking trên vi/en) — review P2-T04 round 1 F1; quyết định ở `.context/decisions.md`.
- Code: không đổi (đã như vậy từ commit 7013440). Test-scope: giữ scope v62.
