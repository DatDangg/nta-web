# Run Journal — change/add-domain-ntasolution · phase-1-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**
> Đọc file này **ĐẦU TIÊN** khi mở session mới (xem `AGENTS.md` § Session Handoff).

```yaml
workItem: change/add-domain-ntasolution     # cửa vào /change add-domain-ntasolution
phaseTask: phase-1-task-01
step: reviewer                              # ready|change_request|checkpoint|builder|reviewer|closeout|done
agent: reviewer
status: running
attempt: 0                                  # CHỈ tăng khi FAIL thật; KHÔNG tăng khi interrupted
interrupted: false
updatedAt: 2026-10-13T00:00:00+07:00
filesTouched:                               # change này là infra/nginx + docs — không đụng app code
  - .context/project-config.md              # domain_secondary
  - SPECIFICATIONS.md                       # 3.4.0 → 3.5.0 (R-27 mở rộng)
  - docs/runbook/deploy-vps.md              # Domain phụ + §3b + troubleshooting
  - spec/CHANGELOG.md
  - spec/test-scope/current.json            # 3.5.0 / scope v26 → v27 (CR-004 publish lại phải đọc lúc đó)
  - .context/progress.json                  # thêm entry add-domain-ntasolution; GIỮ entry CR-004
  - spec/changes/BACKLOG.md                 # CR-005 → in_progress (hunk CR-004 còn nguyên)
  - spec/changes/2026-10-13-add-domain-ntasolution.md   # status: in_progress + Plan
filesNew:
  - deploy/nginx/ntasolution.vn.conf        # vhost 2 block (www 301 apex; apex proxy 3005) — đã verify UTF-8 sạch
  - spec/updates/2026-10-13-add-domain-ntasolution.md
  - tasks/change-add-domain-ntasolution/phase-1-task-01.md   # repo-side (pending)
  - tasks/change-add-domain-ntasolution/phase-1-task-02.md   # apply VPS (blocked by SSH)
  - .context/review-reports/feature-add-domain-ntasolution-spec-validation.md   # spec-validator PASS (inline)
  - .context/runs/change-add-domain-ntasolution-phase-1-task-01.md
evidence:
  reportPath: .context/review-reports/feature-add-domain-ntasolution-spec-validation.md
  round: 0
  verdict: PASS                             # spec-validation inline; chưa có reviewer task (chưa code task-01)
next: "⏸ HUMAN CHECKPOINT: user duyệt phase plan (2 task, spec 3.5.0/scope v27) + cấp phép SSH VPS → chạy task-01 (verify lint/typecheck/build + reviewer NORMAL + commit explicit list) rồi task-02 apply VPS"
loopSignal: none
approvals: []
batchQueue: []                              # chỉ xử lý CR-005 (add-domain-ntasolution) trong lượt này
```

## Notes / WIP reasoning

- **Phạm vi CR-005:** thêm domain phụ `ntasolution.vn` (+www) truy cập cùng site, GIỮ `ntavietnam.tech` là canonical.
  Infra-only: nginx vhost mới + certbot + doc update — KHÔNG sửa `.github/workflows/deploy.yml`,
  `src/lib/seo.ts`, `public/llms.txt`, sitemap, robots, KHÔNG đổi `NEXT_PUBLIC_SITE_URL`.
- **Concurrency:** repo đang dirty bởi CR-004 (`shared-detail-showcase-template`, in_progress — layer 2b task-04):
  `src/content/solutions/**`, `src/app/[locale]/solutions/**`, `ShowcaseDetails.tsx`, `src/content/types.ts`,
  `spec/changes/2026-10-13-shared-detail-showcase-template.md`, `spec/changes/BACKLOG.md`,
  `.context/progress.json`, `spec/test-scope/current.json`.
  → Commit của CR-005 phải **explicit file list** (docs/runbook + .context/project-config + change doc + BACKLOG + progress),
  KHÔNG được gộp file của CR-004.
- **Human checkpoint:** change file ghi rõ "chờ user duyệt SSH trước khi chạy" → sau khi có phase plan phải DỪNG xin duyệt.
- DNS đã trỏ sẵn (apex + www → 187.52.119.50); hiện rơi default server block, chưa có cert.

## History

- 2026-10-13 journal created — write-ahead trước khi gọi subagent `change-request` (cancel sẽ redo bước này).
- 2026-10-13 change-request trả về (báo cáo đầy đủ dù chạm max steps): classification ADDITIVE, spec bump MINOR 3.4.0→3.5.0 / scope v26→v27, 2 task + vhost + docs đã tạo (chưa commit), spec-validation PASS inline. Subagent KHÔNG chạy verify lint/typecheck/build — task-01 chưa thực thi. Primary verify trên đĩa: git status khớp report, vhost UTF-8 sạch, 2 task file tồn tại.
- 2026-10-13 ⏸ HUMAN CHECKPOINT pass — user chọn "Duyệt plan + cho phép SSH" (approvals: phase_plan ok). Primary chạy verify task-01: `npm.cmd run typecheck` PASS · `npm.cmd run lint` 0 errors (1 warning pre-existing mdx `<img>`) · `npm.cmd run build` PASS 57/57 — build đầu fail `Cannot find module vendor-chunks` do dev server (PID 18852/10864) chiếm `.next` (HEAD cũng fail) → build cách ly distDir `.next-verify` PASS rồi revert `next.config.ts` (git diff = 0) + xoá `.next-verify`. Static: grep vhost ref ntavietnam.tech (non-comment) = 0 · runbook §3b + project-config domain_secondary + SPEC 3.5.0 + scope v27 = có. · concurrency: session khác commit 344bf48 (CR-004 T04) giữa chừng + để dirty products/**/tsconfig.json — commit CR-005 phải explicit list, kiểm từng file chung (progress.json/BACKLOG.md/CHANGELOG.md/test-scope) trước khi stage. ▶ START reviewer round 1.
