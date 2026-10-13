Agent: reviewer (chạy trong session chính Cowork — không phải subagent độc lập)

# Review: feature-dental-case-study-showcase — phase-1-task-01 (round 1)

## Review level: NORMAL

## Scope
Commit `78548bd` phần CR-002: `src/content/case-studies/{vi,en}/dental-clinic-operations.mdx`, `src/content/types.ts`
(showcase), `src/components/case-studies/showcase/*` (ScreenMock mới, ShowcaseHero/Technology/Photos/Layout, icons),
`public/images/cases/dental/hero.jpg`.

## Kết quả
| # | Mức | Phát hiện | Xử lý |
|---|---|---|---|
| 1 | MAJOR | Acceptance "nút hero mở thẳng `/solutions/enterprise/dentgo`" chưa đạt — data vẫn `#solution` | Đã sửa `hero.primaryCta.href` vi/en |
| 2 | — | Field mới (`technology.screen`, `nodes` object, `photos.variant`, `hero.image` size, icon `modules`) đều optional, Óc Eo không đổi | OK |
| 3 | — | BR-004: `note`, caption ảnh, quote có `quoteSource` | OK |

## Verify commands + result
| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` (device) | PASS |
| `npm run lint` (device) | 0 error, 1 warning cũ (`mdx/index.tsx` `<img>`) |
| `npm run build` (container, HEAD + fix, font Google mock do sandbox chặn mạng) | PASS |
| Playwright 1440/390 vi/en dental + Óc Eo | overflow 0, 0 ảnh lỗi; hero → `/solutions/enterprise/dentgo` · `/en/solutions/enterprise/dentgo` điều hướng đúng |

## Verdict: PASS (sau fix #1)
