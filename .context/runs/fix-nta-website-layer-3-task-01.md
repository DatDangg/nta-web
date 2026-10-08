# Run Journal — fix/nta-website · layer-3-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: fix/nta-website
phaseTask: layer-3-task-01
step: fix
agent: builder
status: awaiting                      # builder rework xong → chờ reviewer round 2
attempt: 1
interrupted: false
updatedAt: 2026-10-09T19:05:00+07:00
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-3-task-01-round-1-review.md
  round: 1
  verdict: FAIL
next: "reviewer round 2 verify MAJOR fixed"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
  - {gate: layer2_done, at: 2026-10-09T18:05:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- MAJOR: `contact/route.ts:10-12` `getClientIp` lấy token **trái nhất** của `X-Forwarded-For` → client tự gửi header đổi mỗi request là thoát ngưỡng. Fix đề xuất: xác định IP theo **trust boundary** của platform (GCP Cloud Run/GFE): dùng entry do proxy tin cậy thêm vào — thực tế là entry **phải nhất** (rightmost) của XFF (GFE append), validate là IPv4/IPv6 hợp lệ; nếu thiếu/không hợp lệ → KHÔNG bypass: dùng **1 bucket chung** (shared fallback) thay vì cho qua. Ghi comment trust assumption + giới hạn in-memory.
- MINOR: `rate-limit.ts` map không evict IP cũ → prune entry hết hạn khi truy cập; fallback `'unknown'` bucket chung (chấp nhận nhưng ghi rõ); honeypot dùng raw length > 0 (không trim) để trap whitespace-only.
- `db_tool: none`; check commands lint/typecheck/build.

## History

- 2026-10-09T18:50:00+07:00 ▶ write-ahead builder rework — status=running
- 2026-10-09T19:05:00+07:00 ✅ builder rework xong — rightmost XFF + validate IP + shared fallback bucket + prune expired + honeypot raw length; lint/typecheck/build PASS; curl: đổi XFF trái vẫn 429 ở request 6; thiếu XFF → chung bucket 429; honeypot whitespace → 200 không forward. status=awaiting → reviewer r2.
