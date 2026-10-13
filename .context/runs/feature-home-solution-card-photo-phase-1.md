# Run Journal — feature/home-solution-card-photo · phase-1

```yaml
workItem: feature/home-solution-card-photo
phaseTask: phase-1-task-01
step: close-out
agent: change-request
status: done
attempt: 3
interrupted: false
updatedAt: 2026-10-14
filesTouched: [spec/changes/BACKLOG.md]
filesNew: [spec/changes/2026-10-14-home-solution-card-photo.md, spec/changes/assets/2026-10-14-home-solution-card-photo/, tasks/feature-home-solution-card-photo/phase-1-task-01.md, .context/runs/feature-home-solution-card-photo-phase-1.md]
evidence: {reportPath: .context/review-reports/feature-home-solution-card-photo-phase-1-task-01-round-2-review.md, round: 2, verdict: PASS}
next: "none — CR-018 done"
loopSignal: none
approvals: [{gate: phase_plan, at: 2026-10-14, ok: true, note: "user duyệt hướng + gửi 3 ảnh; 1 task"}]
```

## Notes
- KHÔNG commit `.context/project-config.md`; commit bằng `git commit -- <paths>`.

## History
- 2026-10-14 classify MODIFY(UI) LOW; BACKLOG CR-018 in_progress; task phase-1-task-01 tạo → START builder attempt 1 (cancel sẽ redo bước này)
- 2026-10-14 DONE builder attempt 1: typecheck/lint PASS; build sandbox BLOCKED → build terminal user (npm.cmd) PASS, serve :3100. Visual 1440: thẻ 429×383, ảnh render cover theo chiều cao 383 → chủ thể ~287px quá to; điện thoại thẻ "Ứng dụng AI" đè chữ mô tả/bullet (~49% thẻ) → FAIL acceptance chữ không bị đè. 1024/375: chữ đọc được (nền wash), không tràn ngang. → START builder attempt 2 (cancel sẽ redo bước này)
- 2026-10-14 DONE builder attempt 2 (redo foreground; 1 lần builder nền chạy song song cùng file — bản trên đĩa là bản foreground, nhất quán): xl khung ảnh neo phải-dưới 75%×3:2, mask trái ∩ trên (--photo-fade-top 25% chỉ xl), cột chữ xl 56%. Terminal user: typecheck PASS, lint PASS (1 warning cũ), build PASS 59/59; serve :3100. 1440 VI: ảnh naturalWidth 480 ×3, overflow 0 (sw 1425<vw), chữ không đè ảnh. → START reviewer round 1 (cancel sẽ redo bước này)
- 2026-10-14 DONE reviewer round 1 FAIL (NORMAL): M1 MAJOR chữ đè chủ thể ảnh ở 375/1024 (khung <xl full chiều cao 72%); xl 1440/1920 VI+EN PASS (overflow 0, naturalWidth>0, tiêu đề 1 dòng). Minor: ảnh xl nhỏ hơn mẫu; lề container 1400 lệch section khác ở 1920. Dừng — change-request chạm giới hạn steps (40); KHÔNG commit/push. next: builder attempt 3.
- 2026-10-14 coordinator yêu cầu tiếp tục: START builder attempt 3 (fix M1; <xl khung 3:2 neo phải-dưới, mobile 1 cột ảnh thành dải dưới link; xl giảm padding/min-h nếu rẻ) — dev server :3101 (cancel sẽ redo bước này)
- 2026-10-14 DONE builder attempt 3: mobile+lg ảnh thành dải 3:2 dưới link; md khung absolute 55%; xl 80%; bỏ lớp nền surface; mask cố định trái∩trên. typecheck/lint PASS; đo 375/768/1024/1440 VI+EN: overflow 0, naturalWidth>0, chữ không chạm ảnh đậm, tiêu đề 1 dòng 1440. → START reviewer round 2 (cancel sẽ redo bước này)
- 2026-10-14 DONE reviewer round 2 PASS (M1 fixed; minor m1 cây sát bullet 1440, m2 PNG cũ không dùng, m3 nửa trái dải ảnh mobile trống). → build xác nhận (terminal) rồi START spec-publisher
- 2026-10-14 DONE spec-publisher: spec 3.11.0 không bump, spec/updates/2026-10-14-home-solution-card-photo.md, CHANGELOG, test-scope v41. Build terminal PASS 59/59. Close-out: change doc + assets → archive, BACKLOG CR-018 done, progress done → commit task + close-out + push
