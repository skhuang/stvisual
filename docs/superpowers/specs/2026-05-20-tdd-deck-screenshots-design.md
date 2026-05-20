# TDD Deck Tool-Demo Screenshots Design

**Date:** 2026-05-20
**Scope:** Add screenshots to the two **Tool demonstration** slides of TDD
lecture deck #62 (`62-test-driven-development.{en,zh-TW}.md`). Both slides are
currently text-only walkthroughs.

## Goal

Deck #62 ships the new TDD section (Cycle + Rules tabs from Plan.md §O) but its
two tool-demo slides are pure prose — the Cycle-tab walkthrough lists steps
s1–s9 of the FizzBuzz kata without showing what the Explorer looks like, and
the Rules-tab walkthrough describes the three discipline-violation states
without showing them. Other tool-demo slides in the course (deck #3, decks
#58–#61) pair each walkthrough step with a screenshot. This change brings deck
#62 to the same standard.

## What changes

Each tool-demo slide splits into a sequence of screenshot-bearing slides, one
shot per slide, mirroring the deck #58–#61 pattern. The existing walkthrough
prose is redistributed across the new slides — no step text is deleted.

**Cycle tab demo** — currently 1 slide of 5 numbered steps — becomes **5
sub-slides**, each titled `## Tool demonstration — Cycle tab · <label>`:

| # | Sub-slide label | Screenshot base | Kata / step state |
| --- | --- | --- | --- |
| 1 | start | `tdd-cycle-fb-start` | FizzBuzz s1 RED, empty code, suite 0/1 |
| 2 | fake it | `tdd-cycle-fb-fake` | FizzBuzz s3 RED, `return "1"` fake still present, suite 1/1 |
| 3 | triangulate | `tdd-cycle-fb-triangulate` | FizzBuzz s4 GREEN, `String(n)` generalised, suite 2/0 |
| 4 | refactor | `tdd-cycle-fb-refactor` | FizzBuzz s9 REFACTOR, concat form, suite 4/0 |
| 5 | different kata | `tdd-cycle-stack-start` | Stack kata step 1 RED, `isEmpty()` test failing |

**Rules tab demo** — currently 1 slide of 5 numbered steps — becomes **3
sub-slides**, each titled `## Tool demonstration — Rules tab · <label>`:

| # | Sub-slide label | Screenshot base | Engine state captured |
| --- | --- | --- | --- |
| 1 | Rule 1 | `tdd-rules-block-r1` | After clicking `write-production-code` from `initialTddState()`; feedback shows `tdd.rules.reason.noRed`. |
| 2 | Rule 3 | `tdd-rules-block-r3` | After legal `write-failing-test`, then illegal `refactor`; feedback shows `tdd.rules.reason.notGreen`. State unchanged from RED. |
| 3 | clean cycle | `tdd-rules-cycle-done` | After legal `write-failing-test` → `write-production-code` → `refactor`; state panel shows `phase=refactor`, `cycleCount=1`, `allGreen=true`. |

Net effect: deck #62 grows from 13 slides to 19 (2 tool-demo slides replaced
by 8 screenshot-bearing slides). The deck **count** is unchanged at 62 — only
the slide count within deck #62 grows.

## Screenshot inventory

8 unique base names × 2 locales = **16 PNGs**:

| Base name | Tab | Source state |
| --- | --- | --- |
| `tdd-cycle-fb-start` | Cycle | FizzBuzz s1 RED |
| `tdd-cycle-fb-fake` | Cycle | FizzBuzz s3 RED |
| `tdd-cycle-fb-triangulate` | Cycle | FizzBuzz s4 GREEN |
| `tdd-cycle-fb-refactor` | Cycle | FizzBuzz s9 REFACTOR |
| `tdd-cycle-stack-start` | Cycle | Stack s1 RED (kata chip switched) |
| `tdd-rules-block-r1` | Rules | Illegal write-production-code from start |
| `tdd-rules-block-r3` | Rules | Illegal refactor while in RED |
| `tdd-rules-cycle-done` | Rules | Legal red→green→refactor, cycleCount=1 |

Locale suffix follows the existing convention (per `slide-screenshots-locale`
memory and `scripts/capture-slide-screenshots.mjs`): zh shots use the bare
`<name>.png`; en shots use `<name>-en.png`.

PNGs land in `docs/assets/slides/`. The slide-deck build (`npm run
build:slide-decks`) copies referenced PNGs into `public/slide-assets/`; both
trees must end up containing the 16 files.

## Capture

A new script `scripts/capture-tdd-screenshots.mjs` drives both TDD Explorers
with Playwright and saves the 8 PNGs. The script mirrors
`scripts/capture-slicing-screenshots.mjs` exactly:

- Spawn `python3 -m http.server 4173` if not already running; reuse if up.
- Launch Chromium via `@playwright/test`; viewport `1440×900`,
  `deviceScaleFactor: 2`.
- Set `localStorage['stvisual.locale']` from the `SLIDE_LOCALE` env var (`zh`
  default, `en`) via an init script before any navigation.
- Wrap the capture body in `try { ... } finally { ... }` so a failed
  interaction does not leak Chromium or the spawned `http.server` (the same
  cleanup guarantee the slicing script added).
- `shot(name)` helper returns `docs/assets/slides/<name>.png` for zh,
  `docs/assets/slides/<name>-en.png` for en.

Per-shot interaction sequence:

**Cycle tab** — navigate `?explorer=TddCycleExplorer`, wait for the
`tdd-cycle-explorer` root, then for each shot:

1. `tdd-cycle-fb-start` — initial state with FizzBuzz selected (the default
   `TDD_KATAS[0].id`). Screenshot the explorer root immediately.
2. `tdd-cycle-fb-fake` — turn predict-mode OFF via the `tdd-predict-toggle`
   checkbox (so `Next step` is not gated on a prediction), then click
   `tdd-next-step` twice (s1 → s2 → s3). Screenshot.
3. `tdd-cycle-fb-triangulate` — click `tdd-next-step` once more (s3 → s4).
   Screenshot.
4. `tdd-cycle-fb-refactor` — click `tdd-next-step` five more times (s4 → s9).
   Screenshot.
5. `tdd-cycle-stack-start` — click `tdd-kata-stack` (which resets `stepIndex`
   to 0 per the explorer's chip handler). Screenshot.

**Rules tab** — navigate `?explorer=TddRulesExplorer`, wait for the
`tdd-rules-explorer` root, then for each shot:

1. `tdd-rules-block-r1` — from the initial state, click
   `tdd-action-write-production-code`. The action is illegal; the engine
   leaves state unchanged and the feedback shows the
   `tdd.rules.reason.noRed` reason. Screenshot.
2. `tdd-rules-block-r3` — click `tdd-rules-reset`, then click
   `tdd-action-write-failing-test` (legal — advances to RED), then click
   `tdd-action-refactor` (illegal — `notGreen`). Screenshot.
3. `tdd-rules-cycle-done` — click `tdd-rules-reset`, then
   `tdd-action-write-failing-test` (→ RED), `tdd-action-write-production-code`
   (→ GREEN, cycleCount=1), `tdd-action-refactor` (→ REFACTOR). Screenshot.

The script is invoked twice — once with default env (`zh`) and once with
`SLIDE_LOCALE=en` — to produce all 16 PNGs.

## Deck embedding

In each of the 2 deck files (`62-test-driven-development.en.md` and
`.zh-TW.md`), replace the existing `## 工具演示 — 循環分頁` / `## Tool
demonstration — Cycle tab` slide with the 5 sub-slides above, and the existing
`## 工具演示 — 規則分頁` / `## Tool demonstration — Rules tab` slide with the 3
sub-slides above. Each sub-slide carries:

- A heading `## Tool demonstration — <Tab> tab · <short label>` (zh version:
  `## 工具演示 — <分頁> · <短標籤>`).
- One image: `![w:1000](../assets/slides/<base>.png)` for zh,
  `![w:1000](../assets/slides/<base>-en.png)` for en. Width `w:1000` matches
  the slicing decks.
- The relevant subset of the original numbered walkthrough steps (renumbered
  if needed for the sub-slide to read cleanly). No step text is deleted; the
  Rules-tab step 3 (Rule 2 — "two tests at once") loses its dedicated
  sub-slide but its prose is folded into the Rule 1 sub-slide's commentary, so
  it remains in the deck.

After editing the markdown, regenerate `src/data/slideDecks.generated.js` via
`npm run build:slide-decks`. That script also copies the 16 referenced PNGs
into `public/slide-assets/` for the in-app slide viewer (the same step the
slicing-deck commit had to add when initial regeneration missed it).

## File structure

| File | Responsibility | Change |
| --- | --- | --- |
| `scripts/capture-tdd-screenshots.mjs` | Playwright capture of the 2 TDD Explorers | Create |
| `docs/assets/slides/tdd-cycle-*.png`, `tdd-cycle-*-en.png` | 10 captured PNGs (5 × 2 locales) | Create (generated) |
| `docs/assets/slides/tdd-rules-*.png`, `tdd-rules-*-en.png` | 6 captured PNGs (3 × 2 locales) | Create (generated) |
| `public/slide-assets/tdd-cycle-*.png`, `tdd-rules-*.png` (+ `-en`) | Same 16 PNGs copied for the in-app viewer | Create (generated by `build:slide-decks`) |
| `docs/slides/62-test-driven-development.en.md` | Split both tool-demo slides; embed 8 shots | Modify |
| `docs/slides/62-test-driven-development.zh-TW.md` | Split both tool-demo slides; embed 8 shots | Modify |
| `src/data/slideDecks.generated.js` | Regenerated bundle | Modify |

## Testing

- `npm run build:slide-decks` regenerates cleanly and still reports 62 decks.
- `npx vitest run` stays green (`src/tests/slideDecks.test.js` asserts the
  deck count, not slide-internal counts).
- Manual: each of the 16 PNGs exists; each rendered sub-slide shows the
  Explorer in the intended state (the right kata chip / step counter / phase
  ring lit; the right state-panel flags / feedback reason on the Rules tab).
- Manual: `npm run dev` → open `/section-tdd` slide viewer → step through deck
  #62 → confirm the 8 screenshots appear inline.

## Out of scope

- Screenshots for any deck other than #62.
- Re-capturing or changing existing screenshots in other decks.
- Changing the TDD Explorers themselves (no new test IDs, no behaviour
  changes). The capture script uses only existing `data-testid` attributes
  listed in the §O design doc.
- Restructuring the slide-deck pipeline; this change only adds PNGs and edits
  two deck markdown files, exactly as decks #58–#61 did.
