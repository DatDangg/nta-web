# Architecture Decisions Log

## Format

```markdown
### Decision {N}: {Title}
- **Date:** YYYY-MM-DD
- **Context:** {Why this decision was needed}
- **Decision:** {What was decided}
- **Alternatives Considered:** {Other options}
- **Rationale:** {Why this option was chosen}
- **Consequences:** {Trade-offs, follow-up needed}
```

## Decisions

### Decision 1: Layer 0 content contract remediation
- **Date:** 2026-10-08
- **Context:** Phase review Layer 0 found mismatches in product count, solution media/related cases, and case-study result metrics.
- **Decision:** Ratified: R-03 requires at least 2 featured products (the 2 real apps), with the section hidden when empty; Solution supports optional `image`, `screenshots`, and `relatedCases`; R-06 related case studies are optional; CaseStudy supports optional `metrics` and no numbers are fabricated.
- **Alternatives Considered:** Add synthetic content or retain the 3–4 product target.
- **Rationale:** Keep the contract aligned with real content and avoid inventing products or outcomes.
- **Consequences:** Consumers must gracefully omit empty optional sections/metrics.

### Decision 2: Static list content in v1
- **Date:** 2026-10-08
- **Context:** R-15 did not have an implementation owner and Layer 0 already uses repository content files.
- **Decision:** V1 does not implement `GET /api/posts` or `GET /api/case-studies`; pages consume static repository content.
- **Alternatives Considered:** Add dynamic list endpoints in v1.
- **Rationale:** Consistent with the no-database, content-file v1 architecture.
- **Consequences:** Dynamic APIs remain out of v1 scope.

### Decision 3: Outstanding content and verification residuals
- **Date:** 2026-10-08
- **Context:** Review noted missing partner logos and prior reviewer shell permission denials.
- **Decision:** Keep `about.partners: []`; OQ#1 awaits real partner confirmation. Record G10/N2 as a residual: prior independent review commands were denied by shell permissions; remediation verification is run directly in this task.
- **Alternatives Considered:** Add placeholder partner identities/logos or claim independent verification had passed.
- **Rationale:** Do not fabricate partners or overstate evidence.
- **Consequences:** PartnerLogos remains hidden until confirmed data exists; shell-deny history remains documented.
