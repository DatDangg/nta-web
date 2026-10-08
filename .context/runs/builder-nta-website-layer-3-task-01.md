# Run Journal — builder/nta-website · layer-3-task-01

> Artifact trạng thái để **resume cross-session**. **Primary ghi file này; subagent KHÔNG ghi.**

```yaml
workItem: builder/nta-website
phaseTask: layer-3-task-01
step: builder
agent: builder
status: awaiting                      # builder xong → reviewer r1 FAIL (1 MAJOR rate-limit bypass)
attempt: 0
interrupted: false
updatedAt: 2026-10-09T18:30:00+07:00
filesTouched: [.context/decisions.md]
filesNew: [src/app/api/health/route.ts, src/app/api/contact/route.ts, src/lib/api/rate-limit.ts, src/lib/api/contact-schema.ts, src/lib/api/forward.ts]
evidence:
  reportPath: .context/review-reports/feature-nta-website-layer-3-task-01-round-1-review.md
  round: 1
  verdict: FAIL
  verify: "builder lint/typecheck/build PASS + curl matrix (200/400×4/429/honeypot/405/500); reviewer STRICT r1 FAIL: MAJOR rate-limit bypass qua X-Forwarded-For"
understand: "layer-3-task-01 = API GET /api/health + POST /api/contact (rateLimit→validate→honeypot→forward)"
next: "builder implement → reviewer STRICT (API/security)"
loopSignal: none
approvals:
  - {gate: layer0_done, at: 2026-10-08T20:10:00+07:00, ok: true}
  - {gate: layer1_done, at: 2026-10-09T07:00:00+07:00, ok: true}
  - {gate: layer2_done, at: 2026-10-09T18:05:00+07:00, ok: true}
batchQueue: []
```

## Notes / WIP reasoning

- Task: `tasks/nta-website/layer-3-task-01.md`. Review level expected **STRICT** (API contract + security).
- Quyết định đã chốt (Decision 4): rate-limit **5 req/10 phút/IP**; `CONTACT_FORM_TARGET` mock khi verify (giá trị thật để sau, server-only, cấm `NEXT_PUBLIC_*`).
- Contract: `docs/API_SPEC.md` (§POST /api/contact 200 `{status:"ok"}` / 400 `{status:"error",errors}` / 429 `{status:"error",message}`; GET /api/health `{status:"ok",timestamp}`).
- Guard order R-18: rateLimit → validate → honeypot → forward. Honeypot filled → 200 giả, KHÔNG forward.
- `db_tool: none` → bỏ migration gate. `test_command: null` → verify bằng curl matrix + mock target, ghi evidence.

## History

- 2026-10-09T18:15:00+07:00 ▶ write-ahead builder Layer 3 task-01 — status=running
- 2026-10-09T18:30:00+07:00 builder xong — 2 API route + 3 lib; lint/typecheck/build PASS; curl matrix PASS; secret grep clean. status=awaiting → reviewer STRICT.
- 2026-10-09T18:45:00+07:00 reviewer STRICT r1 **FAIL** — MAJOR: rate-limit bypass qua `X-Forwarded-For` (getClientIp lấy leftmost, client kiểm soát); +3 MINOR (map không evict; fallback 'unknown' bucket chung; honeypot whitespace-only). → fix mode.
