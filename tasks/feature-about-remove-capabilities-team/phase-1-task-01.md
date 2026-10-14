# phase-1-task-01 — /about: bỏ khối "Năng lực" + "Đội ngũ", xử lý nút "Tìm hiểu thêm về đội ngũ"

- Change: CR-020 `spec/changes/2026-10-14-about-remove-capabilities-team.md`
- Classification / Risk: **REMOVE (UI)** · risk **LOW** (1 trang public, không API/schema/auth; data MDX nội bộ chỉ trang /about đọc)
- Status: done — user duyệt hướng khi gõ /change (PA A: bỏ nút CTA); reviewer round 1 PASS
- Spec: 3.11.0 → **3.12.0** (MINOR — user chọn MINOR) · test-scope v41 → **v42** (trigger feature-update)

## Spec delta (đã áp dụng vào SPECIFICATIONS.md 3.12.0 — xem file đó cho wording chính thức)

**R-04 (sửa):**
> ~~Đủ 5 khối: sứ mệnh, năng lực, team, milestones (timeline), đối tác~~ →
> **R-04 (3.12.0 — CR-020):** trang gồm: sứ mệnh/giá trị, con người NTA, milestones (timeline), đối tác, CTA; logo đối tác grayscale → màu khi hover.
> Khối **Năng lực** và **Đội ngũ** (`#team`) đã bỏ `[REMOVED 3.12.0 — CR-020]`.

**R-04a (sửa câu cuối khối 3 + đuôi):**
> (3) khối Con người NTA — ảnh đội ngũ (ảnh AI tạm) + eyebrow/tiêu đề/mô tả ~~+ nút outline "Tìm hiểu thêm về đội ngũ →" cuộn tới khối Đội ngũ (`#team`)~~ **(không còn nút — CR-020)**;
> sau đó ~~giữ năng lực, đội ngũ, cột mốc, đối tác, CTA~~ **cột mốc, đối tác, CTA (R-04)**.
> (Nếu user chọn phương án B: "+ nút outline 'Trò chuyện với đội ngũ NTA →' tới `/contact`".)

Intent doc: `docs/BRD.md:78-80` FR-010 ("Đủ 5 khối…") — intent, chỉ đổi qua CR **khi user duyệt**. Đề xuất sửa thành
"sứ mệnh, con người NTA, milestones, đối tác — có timeline milestones" (cần user OK tại checkpoint; nếu không OK → ghi gap, không sửa BRD).

## Phạm vi code (đã soát tham chiếu toàn `src/` + `public/`)

| File | Việc | Ghi chú tham chiếu |
|---|---|---|
| `src/app/[locale]/about/page.tsx` | Sửa: bỏ import `CapabilityGrid`, `TeamGrid`; bỏ map `team` (dòng 47-56); bỏ 2 dòng render 63-64 | — |
| `src/components/about/CapabilityGrid.tsx` | **Xoá** | chỉ page.tsx dùng |
| `src/components/about/TeamGrid.tsx` | **Xoá** | chỉ page.tsx dùng; `HomeImage` vẫn dùng ở PartnerLogos/ProductCard/SolutionCard/SolutionGridHome → giữ |
| `src/components/about/AboutPeople.tsx` | Sửa nút CTA theo phương án chốt (mặc định: bỏ `<a href="#team">` + import `ListingIcon`); sửa JSDoc dòng 9 | — |
| `src/content/types.ts` | Bỏ `capabilities`, `team` khỏi `AboutData` | chỉ about dùng |
| `src/lib/content/about.ts` | Bỏ `'capabilities'`, `'team'` khỏi `assertRequiredFields` | — |
| `src/content/about/vi/about.mdx`, `src/content/about/en/about.mdx` | Bỏ frontmatter `capabilities`, `team` | — |
| `src/i18n/messages/vi.json`, `en.json` | Bỏ `about.capabilitiesTitle`, `about.teamTitle`, `about.team{}`, `about.imageFallback`; (PA mặc định) bỏ `about.people.cta` | `imageFallback` chỉ TeamGrid dùng |
| `public/images/about/team-ai.svg`, `team-domain.svg` | **Xoá** | chỉ 2 file mdx tham chiếu (còn lại là report/task lịch sử) |

**Giữ nguyên:** `team-people-temp.webp` (AboutPeople), `HomeImage`, metadata/description trang (chữ "năng lực/đội ngũ" là copy chung), `about.description`, `MilestoneTimeline`, `PartnerLogos`, `CTABanner`.
**Ngoài scope (không đụng):** frontmatter `mission` không còn component nào đọc (AboutValues dùng i18n) — dead data có từ CR-014, ghi nhận, không xử lý trong task này.

## Nút "Tìm hiểu thêm về đội ngũ" (`AboutPeople.tsx:36`, `href="#team"`)

- **PA A (mặc định) — bỏ nút.** Lý do: đích duy nhất (`#team`) biến mất, site không có trang đội ngũ/tuyển dụng; đổi đích nhưng giữ nhãn "về đội ngũ" là sai ngữ nghĩa;
  CTABanner cuối trang đã dẫn `/contact` nên không mất đường chuyển đổi; diff nhỏ nhất, xoá thêm 1 key i18n + 1 import.
- **PA B (thay thế) — giữ nút, trỏ `/contact`, đổi nhãn** "Trò chuyện với đội ngũ NTA" / "Talk to the NTA team" (dùng `Link` của next-intl để có prefix `/en`).
  Hợp nếu muốn khối Con người NTA giữ cân đối thị giác như mockup CR-014; nhược: trùng CTA cuối trang.

## Acceptance
- [ ] `/about`, `/en/about` không còn heading "Năng lực"/"Capabilities", "Đội ngũ"/"Our team", không còn `id="team"`
- [ ] Thứ tự còn lại: Hero · Giá trị · Con người NTA · Hành trình phát triển · Đối tác · CTA; giao diện các khối giữ nguyên
- [ ] Không còn link trỏ `#team` (PA A: không nút; PA B: nút tới `/contact` / `/en/contact`)
- [ ] Không còn import/i18n key/data/ảnh chết (grep `CapabilityGrid|TeamGrid|capabilitiesTitle|teamTitle|imageFallback|team-ai|team-domain` trong `src/` + `public/` = 0)
- [ ] typecheck / lint / build PASS; smoke 200 cho `/about` + `/en/about`, không tràn ngang 375/1440

## Verify commands (từ `.context/project-config.md`)
- `npm run typecheck` · `npm run lint` · `npm run build` (Cowork/VM: `bash tools/linux-build.sh verify`)
- Smoke: serve bản build → GET `/about`, `/en/about` 200; DOM không có `#team`, không có 2 heading đã bỏ.

## Doc impact (close-out)
- `SPECIFICATIONS.md` R-04/R-04a (3.12.0) + `spec/updates/2026-10-14-about-remove-capabilities-team.md` + `spec/CHANGELOG.md` + `spec/test-scope/current.json` v42 (spec-publisher)
- `docs/DESIGN.md:91` (Components list) + `:196-198` (responsive capability/team) — as-built reconcile
- `.context/design-spec.md` §about (dòng ~160) — ghi chú CR-020
- `docs/BRD.md` FR-010 — đã sửa (user duyệt 2026-10-14)
- Không đổi API/schema.

## Risk / residual
- Sau khi bỏ TeamGrid (`variant="alt"`), các khối Con người → Hành trình → Đối tác cùng nền default — mất dải nền xen kẽ; chấp nhận (acceptance "giữ giao diện từng khối").
- `partners: []` → PartnerLogos hiện trạng không đổi bởi task này.

## Retry / Escalation
- 3 attempt FAIL → `architecture_review_needed`, dừng.

## Verification summary

### Builder attempt 1 (2026-10-14) — PA A (bỏ nút)
- Files sửa: `src/app/[locale]/about/page.tsx` (bỏ import + render CapabilityGrid/TeamGrid, bỏ biến `team`), `src/components/about/AboutPeople.tsx` (bỏ `<a href="#team">`, import `ListingIcon`, sửa JSDoc), `src/content/types.ts` (`AboutData` bỏ `capabilities`, `team`), `src/lib/content/about.ts` (assertRequiredFields bỏ 2 field), `src/content/about/{vi,en}/about.mdx` (bỏ frontmatter `capabilities`, `team`), `src/i18n/messages/{vi,en}.json` (bỏ `about.capabilitiesTitle`, `about.teamTitle`, `about.team{}`, `about.imageFallback`, `about.people.cta` — chỉ xoá dòng, JSON parse OK).
- Files xoá: `src/components/about/CapabilityGrid.tsx`, `src/components/about/TeamGrid.tsx`, `public/images/about/team-ai.svg`, `public/images/about/team-domain.svg` (giữ `team-people-temp.webp`).
- `npm run typecheck`: PASS (tsc --noEmit, 0 lỗi).
- `npm run lint`: PASS (0 error, 1 warning có sẵn ngoài scope `src/components/mdx/index.tsx:25` no-img-element).
- `npm run build`: **BLOCKED (môi trường)** — `Failed to load next.config.ts` / `Error: Failed to load native binding` (lỗi native binding trên Windows, không liên quan diff). Không retry. Cần chạy lại build ở môi trường khác (vd `bash tools/linux-build.sh verify`). → **Primary chạy lại `npm.cmd run build` ở terminal Windows: PASS 59/59**; prerender vi/en about.html không còn Năng lực/Capabilities/#team.
- Grep `CapabilityGrid|TeamGrid|capabilitiesTitle|teamTitle|imageFallback|team-ai|team-domain|#team|people\.cta` trong `src/` + `public/`: 0 kết quả.
- Smoke `/about`, `/en/about` + responsive 375/1440: chưa chạy (phụ thuộc build).
- Residual risk: build PASS (terminal); smoke HTTP + responsive 375/1440 chưa chạy trình duyệt (chỉ xác nhận qua prerender); mất dải nền xen kẽ giữa các khối (đã chấp nhận trong task).
