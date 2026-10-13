Agent: reviewer

# Review — feature-home-solution-card-photo · phase-1-task-01 · round 2 (CR-018)

- **Review level:** NORMAL
- **Reason:** Only one home-page section's UI changed (`SolutionHomeCard` is a component private to `SolutionGridHome.tsx`, not shared) + 6 `image`/`alt` fields + 3 static webp files. No shared token/component/API/schema/auth touched. Round 2 rechecks the fix for M1 (attempt 3 only touches `SolutionGridHome.tsx`).
- **Blast radius:** `/` and `/en`, "Giải pháp" block. `tailwind.config.ts` (`max-w-container`), `HomeSectionHeader`, `HomeImage`, `Reveal` are not in the diff.

## Verify commands + result
| Command | Result |
|---|---|
| `npm run typecheck` | PASS (builder reported; reviewer did not rerun, per the brief) |
| `npm run lint` | PASS, 0 errors, 1 pre-existing warning in `src/components/mdx/index.tsx` (out of scope) (builder) |
| `npm run build` | not run — primary will build after the review (per the brief) |
| `git diff src/` | Only `src/components/home/SolutionGridHome.tsx` + `src/content/home.ts`; 3 untracked webp files |
| Browser pane, dev :3101 | Measured with JS (temporarily set `loading='eager'` + added `revealed` on the page, no source edits) at 375/768/1024/1280/1440 — details below |

Measurement method: for each card, get the photo frame's rect (the article's last child); "strong" region = 45–95% of the frame's width × 15–85% of its height (the photo's subject, per the JSDoc); take each **text line's** rect (Range.getClientRects of h3/p/li/a) and count lines that intersect the strong region (`hits`).

| Breakpoint | Lang | overflow | Card | Frame (x,y,w,h) / position | Strong (x,y) | Text right/bottom edge | hits | naturalWidth | h3 |
|---|---|---|---|---|---|---|---|---|---|
| 375 | VI | 0 | 343×526–540 | 1,298–312,341×227 / relative (bottom strip) | 154 / 332–346 | 319 / 276–290 | 0 | 375 ×3 | 1 line |
| 375 | EN | 0 | 343×517–540 | 1,289–312,341×227 / relative | 154 / 323–346 | ≤319 / ≤290 | 0 | 375 ×3 | 1 line |
| 768 | VI | 0 | 705×319 | 317,60,387×258 / absolute | 491 / 98 | ≤376 / 280 | 0 | 375 ×3 | 1 line |
| 768 | EN | 0 | 705×296–319 | 317,37–60,387×258 / absolute | 491 / 76–98 | ≤387 / ≤280 | 0 | 359 ×3 | 1 line |
| 1024 | VI | 0 | 299×554 | 1,355,297×198 / relative (bottom strip) | 135 / 384 | ≤270 / 333 | 0 | 422 ×3 | Enterprise 2 lines (not required) |
| 1024 | EN | 0 | 299×540 | 1,341,297×198 / relative | 135 / 370 | ≤274 / 319 | 0 | 359 ×3 | — |
| 1280 | EN | 0 | 384×407 | 77,202,306×204 / absolute | 215 / 233 | ≤287 (h3 above the frame) / ≤379 | 0 | — | 1 line ×3 |
| 1440 | VI | 0 | 429×384 | 86,155,342×228 / absolute | 240 / 190 | 321 (nowrap h3, top band) · columns 227–237 / ≤356 | 0 | 337 ×3 | **1 line ×3** |
| 1440 | EN | 0 | 429×406 | 86,177,342×228 / absolute | 240 / 211 | 287 (h3) · columns 233–237 / 368 | 0 | 359 ×3 | **1 line ×3** |

- The frame always lies inside the card (`inside: true` at every breakpoint).
- Visual check (screenshots): 375 VI — the laptop photo strip sits below the "Tìm hiểu…" link, no text on top of it; 768 VI — photo in the right half, outside the text column; 1024 VI — 3 photo strips at the bottom of the cards; 1440 VI — photo bottom-right, text does not overlap the laptop/chip/phones.

## Round 1 checks — regression
- **M1 (text over photo at 375/1024):** **FIXED.** Mobile/lg uses its own photo strip below the text; md/xl puts the frame bottom-right, outside the text column; hits = 0 at every breakpoint, VI + EN.
- **Alt VI/EN:** OK — 6 descriptive alts, no "Minh hoạ"/"Illustration" prefix (read from the DOM: e.g. "Laptop hiển thị bảng điều khiển phân tích kinh doanh…", "Two smartphones showing a camera monitoring app…"). `home.ts` is unchanged since round 1.
- **Shared token:** OK — `max-w-container` is not edited; only this section uses `max-w-[1400px]` (`SolutionGridHome.tsx:36`).
- **Mask:** OK — Chrome computed `mask-composite: source-in, source-in` (intersect). The photo fades to the left + at the top edge.
- **xl layout:** kept (frame 80%, text column 56%), title on 1 line at 1280/1440.

## Code quality
- No dead classes: both surface background layers removed, `object-[…]` removed, `--photo-fade-top` removed, `min-h-[18rem]` → `md:min-h-[16rem]`. The leftover `md:bottom-0 md:right-0` at lg (`relative`) is a harmless no-op (offset 0), needed for md/xl.
- `sizes` = `(min-width: 1280px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 55vw, 100vw` matches the rendered frames (xl 306–342px ≤ 360; lg 297 ≤ 338; md 387 ≤ 422; mobile 341 ≤ 375). OK.
- JSDoc is accurate: the subject starts at ~70% (md: 491/705) / ~56% (xl: 240/429) of the card width — matches the measurements; it explains the WHY (frame never under the text, review M1).
- Surgical diff: OK — attempt 3 only changes `SolutionGridHome.tsx`.

## Responsive Checklist Gate
| Item | Result | Evidence |
|---|---|---|
| Layout — no horizontal scroll | OK | overflow 0 at 375/768/1024/1280/1440 VI/EN |
| Layout — container not fixed px | OK | `max-w-[1400px]` + `w-full` + padding |
| Typography/Spacing | OK | Tailwind scale, unchanged |
| Media — `fill` + `aspect-[3/2]` + `sizes` correct, image loaded | OK | naturalWidth > 0 at every breakpoint; frame matches the photo's 3:2 ratio (no cropping) |
| Media — content readable, text not over the photo | OK | hits = 0 at every breakpoint, VI + EN |
| Touch/Interaction | N/A | links/buttons unchanged |
| Viewport/A11y | OK | card `overflow-hidden` is for rounded corners, not hiding overflow; no new motion |

## Skill gates
- aislop: skip — reviewer bash is `"*": deny` except verify commands; small diff, no slop pattern (no dead code, no hidden fallback, no narrative comments).
- oxlint (anti-slop): skip, oxlint not configured (repo lint PASS).
- ocr: skip, ocr not installed.
- AI-readable: OK — clear names (`photoFadeMask`, `photoFade`), component < 50 lines, 0 indicators.
- ai-friendly-web: N/A (no route/meta changes).
- blitzstrike: N/A.

## Findings

No CRITICAL/MAJOR.

### [MINOR] m1 — 1440 VI "Doanh nghiệp" card: the potted plant is close to the end of the bullet lines
- `SolutionGridHome.tsx:106` (`xl:w-[80%]`). The plant (≈33–40% of the photo width, not the main subject) sits right of "Trường học, phòng khám —" with a few px gap; the main subject (laptop) is not overlapped and hits = 0. Matches the builder's residual risk. If the user finds it too tight → reduce to `xl:w-[76%]`. Does not block.

### [MINOR] m2 — 3 old PNGs are now unused
- `public/images/illustrations/home-enterprise.png`, `home-ai.png`, `home-apps.png` — no longer referenced anywhere in `src/` (Grep only finds an old review report). Not deleting them is safe for rollback; suggest a separate cleanup task if the user wants it. Does not block.

### [MINOR] m3 — Mobile/lg: the left half of the photo strip is fairly empty
- Because the mask fades the left 45% to transparent and the left half of the photo is a light background, the strip at 375/1024 shows the subject only in the right half. A deliberate trade-off by the builder to avoid overlap; visually acceptable. Does not block.

(The 1920 alignment nit is excluded per the coordinator.)

## Residual risk
- Could not save the screenshot to `scratchpad/cr018-solutions-1440-vi.png` (reviewer bash is `"*": deny`, and the Browser pane tool does not write to a custom path). The 1440 VI screenshot of the Solutions block is at:
  `C:\Users\datda\.claude\projects\D--prj-nta-web\a39a1628-1ddc-447a-a7d2-4ed0b58f4fb6\tool-results\mcp-Claude_Browser-blob-1791918494599-0ghihn.jpg`
- Safari (`-webkit-mask-composite: source-in`) not checked; Chrome renders correctly.
- 1920 not measured in this round (same 1400 container → same as 1440); build not run (primary will run it).

## Verdict
✅ **PASS** — M1 fixed (0 text lines over the photo's subject at 375/768/1024/1280/1440 VI + EN, overflow 0, naturalWidth > 0, h3 on 1 line at 1440). Round 1 items did not regress. Only 3 MINOR items remain, none blocking. Commit allowed after primary's build PASS.
