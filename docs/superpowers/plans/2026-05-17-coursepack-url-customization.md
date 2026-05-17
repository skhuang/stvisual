# Course Customization — URL & Pack Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the three deferred items in Plan.md §K — a `?lang=` URL language lock, `#section-<id>` anchor entry paths, and an optional `order:` field on course packs.

**Architecture:** Three small, independent additions. `?lang=` extends the existing `urlRouter` ↔ `app.js` ↔ `i18n` state loop with a non-persisting locale override. `#anchor` adds section `id` attributes and a hash branch to `parseAppLocation`, with query params winning on conflict. CoursePack ordering adds a pure `applyPackOrder` helper consumed by `getCoursePackExplorers`.

**Tech Stack:** Vanilla JS ES modules, Vitest + jsdom. No new dependencies.

**Branch:** `feat/coursepack-url-customization` (already created; design spec already committed).

**Spec:** `docs/superpowers/specs/2026-05-17-coursepack-url-customization-design.md`

---

## Task 1: `?lang=` URL language lock

**Files:**
- Modify: `src/i18n/index.js` — `setLocale` gains a `{ persist }` option
- Modify: `src/utils/urlRouter.js` — parse/serialize a `lang` field
- Modify: `src/app.js` — apply `?lang=` at boot, track `langInUrl`, sync on locale change
- Test: `src/tests/i18n.test.js`, `src/tests/urlRouter.test.js`

- [ ] **Step 1: Write the failing i18n test**

Append to `src/tests/i18n.test.js`:

```js
describe('i18n — setLocale persist option', () => {
  let initialLocale;
  beforeEach(() => { initialLocale = getLocale(); });
  afterEach(() => {
    setLocale(initialLocale);
    try { globalThis.localStorage?.setItem('stvisual.locale', initialLocale); } catch {}
  });

  it('setLocale(other, { persist: false }) changes locale but not localStorage', () => {
    setLocale('en');
    globalThis.localStorage.setItem('stvisual.locale', 'en');
    setLocale('zh', { persist: false });
    expect(getLocale()).toBe('zh');
    expect(globalThis.localStorage.getItem('stvisual.locale')).toBe('en');
  });

  it('setLocale(other) (default) writes localStorage', () => {
    setLocale('en');
    setLocale('zh');
    expect(globalThis.localStorage.getItem('stvisual.locale')).toBe('zh');
  });
});
```

- [ ] **Step 2: Run the i18n test to verify it fails**

Run: `npx vitest run src/tests/i18n.test.js`
Expected: FAIL — `setLocale(zh, { persist:false })` still writes localStorage, so the first new test fails.

- [ ] **Step 3: Add the `persist` option to `setLocale`**

In `src/i18n/index.js`, replace the whole `setLocale` function:

```js
export function setLocale(locale, { persist = true } = {}) {
  if (!SUPPORTED.includes(locale) || locale === current) return;
  current = locale;
  if (persist) {
    try { globalThis.localStorage?.setItem(STORAGE_KEY, locale); } catch {}
  }
  listeners.forEach((cb) => {
    try { cb(locale); } catch (err) { console.error(err); }
  });
  applyDocumentLocale();
}
```

- [ ] **Step 4: Run the i18n test to verify it passes**

Run: `npx vitest run src/tests/i18n.test.js`
Expected: PASS — all i18n tests green.

- [ ] **Step 5: Write the failing urlRouter test**

Append to `src/tests/urlRouter.test.js`:

```js
describe('K — ?lang= URL lock', () => {
  it('?lang=en is parsed into { lang }', () => {
    expect(parseAppLocation('?lang=en')).toEqual({ lang: 'en' });
  });
  it('an unsupported ?lang= value is ignored', () => {
    expect(parseAppLocation('?lang=fr')).toEqual({});
  });
  it('serializeLocation emits ?lang=', () => {
    expect(serializeLocation({ lang: 'zh' })).toBe('?lang=zh');
  });
  it('lang round-trips alongside a section', () => {
    const qs = serializeLocation({ lang: 'en', section: 'graph' });
    expect(parseAppLocation(qs)).toEqual({ lang: 'en', section: 'graph' });
  });
});
```

- [ ] **Step 6: Run the urlRouter test to verify it fails**

Run: `npx vitest run src/tests/urlRouter.test.js`
Expected: FAIL — `parseAppLocation('?lang=en')` returns `{}`.

- [ ] **Step 7: Parse and serialize `lang` in urlRouter**

In `src/utils/urlRouter.js`, inside `parseAppLocation`, add this block right before `return out;`:

```js
  const lang = params.get('lang');
  if (lang === 'en' || lang === 'zh') out.lang = lang;
```

In `serializeLocation`, add this line immediately after `const params = new URLSearchParams();`:

```js
  if (state.lang === 'en' || state.lang === 'zh') params.set('lang', state.lang);
```

- [ ] **Step 8: Run the urlRouter test to verify it passes**

Run: `npx vitest run src/tests/urlRouter.test.js`
Expected: PASS — all urlRouter tests green.

- [ ] **Step 9: Apply `?lang=` at boot in app.js**

In `src/app.js`, find the line `let initialDeeplinkHandled = false;` (~line 163) and add directly below it:

```js
  // ?lang= URL lock: a share link can force the display language. Once a
  // lang is present in the URL (or the user picks one) the URL keeps it.
  let langInUrl = false;
```

Then find the call site `paint();` followed by `onLocaleChange(() => paint());` (~line 1224). Insert directly **before** `paint();`:

```js
  // Apply a URL-supplied language before the first paint, without
  // overwriting the visitor's own saved preference.
  const bootState = parseAppLocation(
    globalThis.location?.search ?? '',
    globalThis.location?.hash ?? '',
  );
  if (bootState.lang) {
    langInUrl = true;
    setLocale(bootState.lang, { persist: false });
  }
```

- [ ] **Step 10: Include `lang` in syncUrl state**

In `src/app.js`, inside `syncUrl`, find the `const state = { ... }` object (~line 960) and add a `lang` property so it reads:

```js
        const state = {
          section: activeSection,
          tab: getCurrentTabForSection(activeSection),
          pack: packBar?.getActiveId() ?? null,
          filter: activeFilter,
          lang: langInUrl ? getLocale() : undefined,
        };
```

- [ ] **Step 11: Mark `langInUrl` when the user picks a language**

In `src/app.js`, find the language `<select>` handler (~line 1164) and change it to:

```js
    container.querySelector('#app-lang-select').addEventListener('change', (e) => {
      langInUrl = true;
      setLocale(e.target.value);
    });
```

- [ ] **Step 12: Sync the URL after a locale change**

In `src/app.js`, find the initial-deeplink block at the end of `paint()` — it ends with a closing `}` on the line before `}` that closes `paint`. Immediately after the deeplink `if (!initialDeeplinkHandled) { ... }` block and before `paint`'s closing brace, add:

```js
    // Keep ?lang= current after a language toggle (paint() re-runs on
    // every locale change). No-op when the language was never URL-locked.
    if (langInUrl) syncUrl('replace');
```

- [ ] **Step 13: Run the full unit suite to verify nothing regressed**

Run: `npx vitest run`
Expected: PASS — all tests green (count unchanged except the 6 new tests added in this task).

- [ ] **Step 14: Manually verify the `?lang=` behaviour**

Run: `npm run serve` then open `http://127.0.0.1:4173/index.html?lang=zh` in a browser.
Expected: the app loads in Chinese. Open DevTools → Application → Local Storage: `stvisual.locale` is NOT changed to `zh` by the visit. Flip the language dropdown to English → the URL updates to `?lang=en`.

- [ ] **Step 15: Commit**

```bash
git add src/i18n/index.js src/utils/urlRouter.js src/app.js src/tests/i18n.test.js src/tests/urlRouter.test.js
git commit -m "$(cat <<'EOF'
feat(routing): ?lang= URL language lock

A share link may carry ?lang=en|zh to force the display language. It is
applied for the session only — the visitor's saved preference is left
intact — and, once present, the URL keeps ?lang= in sync with the
language dropdown.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `#section-<id>` anchor entry paths

**Files:**
- Modify: `src/utils/urlRouter.js` — `parseAppLocation` gains a `hash` argument
- Modify: `src/app.js` — section `id` attributes, hash-aware parsing, hashchange listener, stale-hash clearing
- Test: `src/tests/urlRouter.test.js`

- [ ] **Step 1: Write the failing urlRouter hash test**

Append to `src/tests/urlRouter.test.js`:

```js
describe('K — #section anchor', () => {
  it('a #section-<id> hash resolves a section when no query section', () => {
    expect(parseAppLocation('', '#section-graph')).toEqual({ section: 'graph' });
  });
  it('a query ?section= wins over a #section hash', () => {
    expect(parseAppLocation('?section=logic', '#section-graph'))
      .toEqual({ section: 'logic' });
  });
  it('a query ?explorer= wins over a #section hash', () => {
    const state = parseAppLocation('?explorer=PairwiseExplorer', '#section-graph');
    expect(state.section).toBe('blackbox');
  });
  it('a non-section hash (skip-link) is ignored', () => {
    expect(parseAppLocation('', '#app-main')).toEqual({});
  });
  it('parseAppLocation still works when called with no hash argument', () => {
    expect(parseAppLocation('?section=graph')).toEqual({ section: 'graph' });
  });
});
```

- [ ] **Step 2: Run the urlRouter test to verify it fails**

Run: `npx vitest run src/tests/urlRouter.test.js`
Expected: FAIL — `parseAppLocation('', '#section-graph')` returns `{}` (the second argument is ignored).

- [ ] **Step 3: Add the `hash` argument to `parseAppLocation`**

In `src/utils/urlRouter.js`, change the function signature:

```js
export function parseAppLocation(search, hash) {
```

Then add this block right before `return out;` (after the `lang` block added in Task 1):

```js
  // #section-<id> — an alternative entry path. Query params win: the hash
  // is only consulted when neither ?explorer= nor ?section= set a section.
  if (!out.section && typeof hash === 'string') {
    const m = /^#section-([a-z0-9-]+)$/.exec(hash);
    if (m) out.section = m[1];
  }
```

- [ ] **Step 4: Run the urlRouter test to verify it passes**

Run: `npx vitest run src/tests/urlRouter.test.js`
Expected: PASS — all urlRouter tests green.

- [ ] **Step 5: Give every section element a stable `id`**

In `src/app.js`, find the end of the `const sections = { ... };` object literal (~line 276, the line is `    };`). Add directly below it:

```js

    // A stable `id` per section so a `#section-<id>` hash can deep-link to it.
    for (const [sectionId, el] of Object.entries(sections)) {
      if (el) el.id = `section-${sectionId}`;
    }
```

- [ ] **Step 6: Pass the hash into the in-paint `parseAppLocation` call**

In `src/app.js`, find the line inside `paint()` (~line 174):

```js
    const urlState = parseAppLocation(globalThis.location?.search ?? '');
```

Replace it with:

```js
    const urlState = parseAppLocation(
      globalThis.location?.search ?? '',
      globalThis.location?.hash ?? '',
    );
```

- [ ] **Step 7: Drop a stale `#section-*` hash when writing the URL**

In `src/app.js`, inside `syncUrl`, find the line:

```js
        const url = `${globalThis.location.pathname}${qs}${globalThis.location.hash}`;
```

Replace it with:

```js
        // A `#section-*` hash is an entry-only anchor; once the app has
        // navigated, drop it so the URL carries no contradictory anchor.
        // Other hashes (skip-links) are preserved verbatim.
        const rawHash = globalThis.location.hash || '';
        const hash = /^#section-[a-z0-9-]+$/.test(rawHash) ? '' : rawHash;
        const url = `${globalThis.location.pathname}${qs}${hash}`;
```

- [ ] **Step 8: Add a hashchange listener**

In `src/app.js`, find the `popstate` listener (~line 1232, `globalThis.addEventListener?.('popstate', ...)`). Add directly **after** that listener's closing `});`:

```js

  // A deliberate `#section-<id>` hash navigation overrides any stale
  // ?section= query. Reload from a URL that keeps only ?lang= (so a
  // language lock survives) so boot re-applies state from the hash alone.
  // Non-section hashes (skip-links) are left to the browser's native
  // behaviour.
  globalThis.addEventListener?.('hashchange', () => {
    const hash = globalThis.location?.hash ?? '';
    if (/^#section-[a-z0-9-]+$/.test(hash)) {
      const lang = new URLSearchParams(globalThis.location?.search ?? '').get('lang');
      const qs = (lang === 'en' || lang === 'zh') ? `?lang=${lang}` : '';
      globalThis.location?.replace?.(`${globalThis.location.pathname}${qs}${hash}`);
    }
  });
```

- [ ] **Step 9: Run the full unit suite to verify nothing regressed**

Run: `npx vitest run`
Expected: PASS — all tests green (5 new tests from this task).

- [ ] **Step 10: Manually verify the anchor behaviour**

Run: `npm run serve` then:
1. Open `http://127.0.0.1:4173/index.html#section-graph` — the Graph Coverage section is shown and scrolled into view.
2. Open `http://127.0.0.1:4173/index.html?section=logic#section-graph` — the Logic Coverage section is shown (query wins).
3. From a loaded page, click a nav button to another section — the URL becomes `?section=…` with no `#section-*` hash.
4. The skip-link (Tab then Enter on "skip to main") still jumps to `#app-main` without reloading.

- [ ] **Step 11: Commit**

```bash
git add src/utils/urlRouter.js src/app.js src/tests/urlRouter.test.js
git commit -m "$(cat <<'EOF'
feat(routing): #section-<id> anchor entry paths

Each section gets a stable id, and parseAppLocation accepts a hash so a
#section-<id> URL deep-links to a section. Query params (?section=,
?explorer=) win on conflict; a deliberate hash navigation reloads from a
search-free URL. Skip-link hashes are untouched.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: CoursePack custom ordering

**Files:**
- Modify: `src/data/courseSeries.js` — export `applyPackOrder`, make `getCoursePackExplorers` order-aware, add `order` to the `foundations` pack
- Test: `src/tests/courseSeries.test.js`

- [ ] **Step 1: Write the failing courseSeries test**

Append to `src/tests/courseSeries.test.js` (and add `applyPackOrder` to the existing import from `../data/courseSeries.js`):

```js
describe('K — course pack custom ordering', () => {
  it('applyPackOrder pins listed ids first and keeps the rest in place', () => {
    expect(applyPackOrder(['a', 'b', 'c', 'd'], ['c', 'a']))
      .toEqual(['c', 'a', 'b', 'd']);
  });
  it('applyPackOrder skips order ids that are not in the matched set', () => {
    expect(applyPackOrder(['a', 'b'], ['zzz', 'b'])).toEqual(['b', 'a']);
  });
  it('applyPackOrder returns matched unchanged when order is absent or empty', () => {
    expect(applyPackOrder(['a', 'b'], undefined)).toEqual(['a', 'b']);
    expect(applyPackOrder(['a', 'b'], [])).toEqual(['a', 'b']);
  });
  it('the foundations pack honours its order field', () => {
    expect(getCoursePackExplorers('foundations')).toEqual([
      'TestingMethodTree', 'TestingFlow', 'DefectCostExplorer',
      'VModelExplorer', 'TestingTypesTable', 'PyramidAdjusterExplorer',
    ]);
  });
});
```

The import line at the top of the file becomes:

```js
import {
  COURSE_PACKS,
  getCoursePack,
  getCoursePackExplorers,
  getCoursePackFilter,
  applyPackOrder,
} from '../data/courseSeries.js';
```

- [ ] **Step 2: Run the courseSeries test to verify it fails**

Run: `npx vitest run src/tests/courseSeries.test.js`
Expected: FAIL — `applyPackOrder` is not exported (`SyntaxError` / `undefined`).

- [ ] **Step 3: Add `applyPackOrder` and make `getCoursePackExplorers` order-aware**

In `src/data/courseSeries.js`, replace the existing `getCoursePackExplorers` function with:

```js
// Apply a pack's optional `order`: ids in `order` that are also in
// `matched` come first (in `order` sequence); the rest keep their
// original sequence. Order ids outside `matched` are skipped.
export function applyPackOrder(matched, order) {
  if (!Array.isArray(order) || order.length === 0) return matched;
  const matchedSet = new Set(matched);
  const pinned = order.filter((id) => matchedSet.has(id));
  const pinnedSet = new Set(pinned);
  return [...pinned, ...matched.filter((id) => !pinnedSet.has(id))];
}

export function getCoursePackExplorers(id) {
  const pack = getCoursePack(id);
  if (!pack) return [];
  const matched = Object.entries(EXPLORER_TAGS)
    .filter(([, tags]) => explorerMatchesFilter(tags, pack.filter))
    .map(([explorerId]) => explorerId);
  return applyPackOrder(matched, pack.order);
}
```

- [ ] **Step 4: Add the `order` field to the `foundations` pack**

In `src/data/courseSeries.js`, find the `foundations` entry in `COURSE_PACKS` and add an `order` field so it reads:

```js
  {
    id: 'foundations',
    titleKey: 'pack.foundations.title',
    descKey: 'pack.foundations.desc',
    filter: { series: ['foundations'] },
    // Pedagogical sequence: method map → flow → cost → V-model → types → pyramid.
    order: ['TestingMethodTree', 'TestingFlow', 'DefectCostExplorer',
            'VModelExplorer', 'TestingTypesTable', 'PyramidAdjusterExplorer'],
  },
```

- [ ] **Step 5: Run the courseSeries test to verify it passes**

Run: `npx vitest run src/tests/courseSeries.test.js`
Expected: PASS — all courseSeries tests green, including the existing "every pack resolves to at least one explorer" and the AI-Assisted `toContain` tests.

- [ ] **Step 6: Run the full unit suite to verify nothing regressed**

Run: `npx vitest run`
Expected: PASS — all tests green. In particular the `coursePackExporter` tests still pass: the Markdown export now lists the `foundations` pack in the new order, but no test asserts the old order.

- [ ] **Step 7: Commit**

```bash
git add src/data/courseSeries.js src/tests/courseSeries.test.js
git commit -m "$(cat <<'EOF'
feat(packs): optional order field for course packs

Course packs may carry order: [...] to pin Explorers into a chosen
sequence; unlisted matches keep their natural order. The foundations
pack gets a pedagogical sequence. K5's Markdown export inherits the
order automatically.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Update Plan.md

**Files:**
- Modify: `Plan.md` — move the three items out of §K "延後項目"

- [ ] **Step 1: Mark the deferred items done**

In `Plan.md`, find the `### 延後項目` block under section K and replace its three bullet list with a completion note:

```markdown
### 延後項目（已完成 2026-05-17）

| 項目 | 說明 |
| --- | --- |
| **`?lang=` URL 鎖定** | 分享連結可帶 `?lang=en\|zh` 強制語言；session-only、不覆蓋訪客偏好；URL 與語言切換同步。 |
| **原生 `#anchor` 跳轉** | 每個 section 有 `id`；`#section-<id>` 為替代進入路徑，query param 優先。 |
| **CoursePack 自訂排序** | `order: [...]` 欄位排序 pack 內 Explorer；`foundations` pack 已套用教學順序。 |

設計與計畫：`docs/superpowers/specs/2026-05-17-coursepack-url-customization-design.md`。
```

- [ ] **Step 2: Commit**

```bash
git add Plan.md
git commit -m "$(cat <<'EOF'
docs(plan): mark §K deferred items complete

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Done criteria

- `npx vitest run` is fully green, with 15 new tests (6 in Task 1, 5 in Task 2, 4 in Task 3).
- `?lang=en|zh` forces the language on load without persisting; the URL keeps `?lang=` in sync with the dropdown once set.
- `#section-<id>` deep-links to a section; `?section=`/`?explorer=` win on conflict; skip-links still work.
- A course pack's `order` field reorders its Explorers and flows through to K5's Markdown export.
- `Plan.md` §K no longer lists these as deferred.
- One PR off `feat/coursepack-url-customization`; CI green; squash-merged.
