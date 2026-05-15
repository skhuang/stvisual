# Manual Test Plan

> Companion to the automated suite (`npm run test:run` covers 656 unit tests
> across 57 files). This file lists the **cross-feature interactions** that
> jsdom / Playwright either can't exercise or are easy to regress silently
> — the kind a real browser session catches.
>
> **When to run**: before any release, before merging a PR that touches
> URL routing / i18n / cross-section bridges, and after any change to
> `urlRouter.js`, `explorerTags.js`, `courseSeries.js`, or the Overview
> layout.
>
> **Suggested order** is bottom of this file. The whole pass takes
> 30–45 minutes.

---

## A. URL Routing × Application-state restore (K4)

| # | Action | Expected |
|---|--------|----------|
| A1 | Open `?explorer=PairwiseExplorer` | Lands directly on `section-blackbox` → tab `pairwise`; section scrolled into view. |
| A2 | Open `?explorer=EquivalentMutantExplorer` | Lands on `section-advanced` → tab `equivmutant`. |
| A3 | Open `?explorer=FlakyDiagnosisExplorer` | Lands on `section-acceptance` → tab `flaky`. |
| A4 | Open `?section=acceptance&tab=chaos` | Same destination as `?explorer=ChaosEngineeringExplorer`, but via the explicit section+tab form. |
| A5 | Open `?pack=ai-assisted` | The **AI-Assisted** course-pack chip is highlighted; only the I1–I5 cards are visible on Overview; other cards are hidden. |
| A6 | Open `?level=unit&technique=mutation` | No pack chip is active; the corresponding **filter chips** are pre-selected; matching section cards are visible. |
| A7 | On any Explorer, toggle the language selector | URL parameters survive intact; the browser tab title (`<title>`) switches between EN / ZH; in-page content also switches. |
| A8 | URL with **both** `?pack=ai-assisted` and `?level=blackbox` | `?pack` wins; raw filter is ignored. URL is rewritten to drop the conflicting raw filter on the next user interaction. |

## B. Filter × Course-Pack interactions (K2 + K3)

| # | Action | Expected |
|---|--------|----------|
| B1 | Click course-pack chip **A**, then click **A** again | First click applies its filter; second click clears it. |
| B2 | Click pack **A**, then click pack **B** | Filter swaps to B's; A's chip de-highlights. |
| B3 | After a pack is active, click any **filter chip** | The pack chip de-highlights immediately; URL changes from `?pack=…` to `?level=…&technique=…`. |
| B4 | Click **Clear all** | Every filter chip clears; pack chip clears; "Showing N of M" banner disappears. |
| B5 | Cumulative filter producing **0 matches** | Empty-state message renders ("No sections match the current filter. Clear to see all."). |

## C. Markdown export deeplinks end-to-end (K3 + K5)

| # | Action | Expected |
|---|--------|----------|
| C1 | Pick AI-Assisted pack → click **⬇ Export Markdown** | File `stvisual-pack-ai-assisted.md` downloads. |
| C2 | Open the file in any Markdown viewer | Each Explorer entry contains a `- **Open:** https://.../?explorer=<ComponentName>` line. |
| C3 | Click any Open link from the `.md` | Browser lands on the correct Explorer + tab; `?pack` is **not** carried over. |
| C4 | Switch to ZH locale, then Export the same pack | Title and prose render in Chinese; component IDs and tag keys remain stable English identifiers. |
| C5 | Try exporting each of the 7 packs in turn | All files download cleanly; row counts match the `Showing N` banner that was active on Overview. |

## D. Bridge buttons (H + J series)

Walk all 12 bridges. Each click should: switch section/tab, smoothly scroll, and leave the URL in a canonical form (`?section=…&tab=…`).

| # | From | To |
|---|------|----|
| D1 | GroupTheoryExplorer (orbit tab) | `section-blackbox` → tab=`mt` |
| D2 | J1 BDD Examples table | `section-blackbox` → tab=`dt` |
| D3 | J2 Use Case exception card | `section-rbt` |
| D4 | J3 E2E Journey, → TestQuality button | `section-advanced` → tab=`testquality` |
| D5 | J3 E2E Journey, → Risk-Based button | `section-rbt` |
| D6 | J4 Contract Testing | `section-inttest` |
| D7 | J5 Performance Load | `section-rbt` |
| D8 | J6 Chaos, → E2E | `section-acceptance` → tab=`e2ejourney` |
| D9 | J6 Chaos, → Contract | `section-acceptance` → tab=`contract` |
| D10 | J7 ATDD Distill stage → Gherkin | `section-acceptance` → tab=`gherkin` |
| D11 | J7 ATDD Develop stage → V-Model | `section-flow` → tab=`vmodel` |
| D12 | J8 Flaky Diagnosis → E2E | `section-acceptance` → tab=`e2ejourney` |
| D13 | J8 Flaky Diagnosis → TestQuality | `section-advanced` → tab=`testquality` |

After each jump verify: browser **back button** returns to the source; URL has updated to reflect the new section.

## E. localStorage × URL interaction (K4)

| # | Action | Expected |
|---|--------|----------|
| E1 | Without URL params, click a tab, reload | localStorage restores the same tab. |
| E2 | Open with `?section=blackbox&tab=pairwise` | URL overrides any saved localStorage; lands on `pairwise`. |
| E3 | Same as E2; do nothing else; reload | URL still says `pairwise`; no quiet rewrite to a stale localStorage value. |
| E4 | Clear browser data, open `?explorer=BDDGherkinExplorer` | Lands directly on Gherkin tab — no flash of the default `equivmutant` / `bva` etc. |

## F. Class Results × multi-Explorer flow (F-B)

| # | Action | Expected |
|---|--------|----------|
| F1 | Sign in with Google → enter class code → run a quiz on **I1**, **I4**, **J1**, and **J3** | Firestore receives 4 result documents under `courses/{classCode}/results/`. |
| F2 | Open TeacherDashboard, enter the same class code | All 4 results are listed; the Explorer-filter dropdown contains exactly those 4 Explorer names. |
| F3 | Submit a quiz **while signed out** with a class code | No Firestore write; UI shows the "sign in to upload" hint. |

## G. Real-browser-only behaviours

These are about animation / timing / SVG rendering that jsdom can't model.

| # | Explorer | Observation |
|---|----------|-------------|
| G1 | J3 E2E Journey | After "Run 100×", per-step bar widths fall off plausibly. Subsequent runs produce different (but similar) numbers (Date-seeded). |
| G2 | J5 Performance Load Profile | Dragging the Little's Law slider updates derived L instantly with no lag. |
| G3 | J6 Chaos | Inject `kill` on `gateway`: the entire upstream dependency chain gains a red outline on the SVG simultaneously. |
| G4 | FuzzTesting / PropertyBased | Random-input loop runs to completion without freezing the tab. |
| G5 | TestQuality (I4) | After reveal, the up/down buttons are visually disabled and can't be re-clicked. |
| G6 | GroupTheoryExplorer | Switching the formula recomputes orbits without flicker; SVG diagram repositions correctly. |
| G7 | All J explorers | Bridge-button hover/focus rings are visible; keyboard `Tab` traverses chips and bridges in a sensible order. |

## H. Result share-link round-trip

| # | Action | Expected |
|---|--------|----------|
| H1 | Complete any quiz → click **Share Results** | URL is copied to clipboard. |
| H2 | Paste that URL into a new tab | A `ResultViewer` panel renders the captured answers and "self-reported" disclaimer. |
| H3 | Append `?explorer=PairwiseExplorer` to the result URL | Both behaviours coexist: ResultViewer appears AND the Pairwise tab is active. |

---

## Suggested order

1. **A** (≈5 min) — URL routing sanity. If A fails, all of B / C / D will also lie.
2. **B + C** (≈10 min) — K-series filter and Markdown export round-trip.
3. **D** (≈15 min) — bridges. Easiest place to miss a typo in `data-*` attributes.
4. **E + F** (≈10 min) — localStorage + class results (requires sign-in setup).
5. **G** (≈5 min) — real-browser quirks. Failures here usually point at a CSS / timing fix rather than a logic bug.
6. **H** (≈3 min) — result sharing edge cases.

Total: **≈45 minutes** for a full pass.

---

## When something breaks

- File a GitHub issue using the format `[manual: <category>] <one-line summary>`.
- Attach the URL, browser version, and which step in this file you were on.
- For URL routing regressions, also paste the raw URL `location.search` value from the dev console.
