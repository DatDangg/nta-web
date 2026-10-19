# Builder summary — feature-hero-wide-screen-backdrop · phase-1-task-01 (CR-041)
- Đã làm: HeroBackground > 1440 thêm nền mờ full-bleed (Image lazy sizes 640px, blur-2xl scale-110 + white/50), mask hai cạnh trên ảnh nét (thay fade trắng trái/phải), phủ chữ kéo ra mép trái (white/70→0.9, mép trái stage 0.9). ≤ 1440 không đổi. DESIGN.md as-built cập nhật.
- Verify: typecheck PASS, lint PASS (1 warning cũ), npm test 196/199 (1 fail ngoài scope public/uploads), docker build --target builder PASS ×2 (image đã xoá). DOM + screenshot 1024–3840 vi + en 1920: chi tiết ở Evidence task file; ảnh ở .context/review-reports/cr-041-screens/.
- Còn dở: chưa commit (primary làm sau reviewer PASS).
