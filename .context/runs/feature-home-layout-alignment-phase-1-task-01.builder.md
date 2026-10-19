# Builder summary — feature-home-layout-alignment · phase-1-task-01 (CR-040)
- Đã làm: SolutionGridHome + ProductStrip dùng `Container` 1280; sizes 3-up lg 400px; Header logo `-ml-2`; DESIGN.md ghi as-built.
- Verify: typecheck PASS, lint PASS (1 warning cũ), npm test 196/199 pass (1 fail ngoài scope: thiếu public/uploads local), docker build --target builder PASS (image đã xoá).
- Đo DOM 1280/1440/1920 vi+en: mọi mép lệch 0px; 375–1920 không tràn ngang. Chi tiết: phần Evidence trong task file.
- Còn dở: chưa commit (primary làm sau reviewer PASS). Không đụng hero (task 02).
