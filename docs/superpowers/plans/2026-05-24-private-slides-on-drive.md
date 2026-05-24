# Private Course Slides on Google Drive — Implementation Plan (Plan B: stvisual)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mirror the rdvisual private-slides-on-drive feature into stvisual — same shape, stvisual's path layout. A second deck source for the `SlideViewer`, gated by Drive-native per-user sharing; private decks render in the same overlay as public bundled decks, marked 🔒. The cloud drawer opens for sign-in when the feature is configured but the user is not authenticated.

**Architecture:** Identical to rdvisual's implementation:
- `src/utils/cloudIntegration.js` becomes a singleton, exports `DRIVE_SCOPES` (`drive.file` + `drive.readonly`), exposes `getAccessToken()`.
- `src/utils/privateDecks.js` (new) fetches a manifest + decks from a Drive folder using the user's `drive.readonly` token.
- `src/components/SlideViewer.js` merges private decks into the deck picker (🔒 chip, sign-in row, denied/error states).
- `src/config/cloudConfig.js` gains `drive.privateSlidesFolderId`.
- `scripts/inject-env.mjs` + `.github/workflows/deploy-pages.yml` are extended to wire the new env var through deploys (this is BAKED IN from the start — Plan A in rdvisual learned this the hard way as a post-review fix).

**Tech Stack:** Vanilla ES-module JS, Vitest (jsdom), Firebase Auth (existing), Google Drive REST v3.

**Spec:** `docs/superpowers/specs/2026-05-24-private-slides-on-drive-design.md` (mirrored from rdvisual; shared).

**Reference implementation:** rdvisual's merged PR #6 (`origin/main` of `https://github.com/skhuang/rdvisual`), commits on the branch `feat/private-slides-on-drive`. Re-use its file contents wherever the only difference is the path swap; consult the rdvisual source via the read-only repo at `/Users/skhuang/course/rdvisual` if needed.

---

## File Structure

**Create:**
- `src/utils/privateDecks.js` — pure module: `fetchPrivateDecks({ accessToken, folderId })` returns `SLIDE_DECKS`-shaped entries with `private: true`. Per-session in-memory cache keyed by access token. Identical to rdvisual's `src/framework/privateDecks.js`.
- `src/tests/privateDecks.test.js` — Vitest + `fetch` mock covering the four error states from the spec, the deck shape, the cache. Identical to rdvisual's test, with the import path swapped.
- `src/tests/SlideViewer.private.test.jsx` — a SEPARATE file from the existing `SlideViewer.test.jsx`. The new private-decks tests use `vi.mock()` for `SLIDE_DECKS`, `cloudIntegration`, `cloudConfig`, and `privateDecks` — putting them in the existing file would break its tests (which use the real `SLIDE_DECKS` and don't expect cloud mocks).
- `docs/private-slides.md` — operator guide (identical content to rdvisual's, with `RDVISUAL_CLOUD_CONFIG` swapped to `STVISUAL_CLOUD_CONFIG` if mentioned anywhere — but the rdvisual guide doesn't mention that global, so the content is fully reusable).
- `docs/superpowers/plans/2026-05-24-private-slides-on-drive.md` — this plan (committed before execution begins; already exists if you are reading this).

**Modify:**
- `src/utils/cloudIntegration.js` — singleton refactor, export `DRIVE_SCOPES`, add `getAccessToken()` to all returned client objects.
- `src/components/SlideViewer.js` — extend `openSlideViewer` to fetch + merge private decks; new `renderDeckBar` helper; sign-in row; denied/error states; defensive `__…__` placeholder guard in `getPrivateContext`.
- `src/components/SlideViewer.css` — append the new `.slideviewer-deck-btn--private`, `--signin`, `--denied`, `--error`, `__sub` rules.
- `src/config/cloudConfig.js` — add `privateSlidesFolderId: '__DRIVE_PRIVATE_SLIDES_FOLDER_ID__'` to the `drive` object.
- `src/i18n/dict.js` — add 5 `slides.private.*` keys to both the `en` and `zh` blocks (immediately after the existing `slides.empty` in each).
- `src/tests/cloudIntegration.test.js` — APPEND 3 new tests (`DRIVE_SCOPES` exported correctly, singleton, `getAccessToken` returns null when not signed in). The existing 6 tests stay.
- `scripts/inject-env.mjs` — append `__DRIVE_PRIVATE_SLIDES_FOLDER_ID__: 'DRIVE_PRIVATE_SLIDES_FOLDER_ID'` to the `PLACEHOLDERS` map.
- `.github/workflows/deploy-pages.yml` — add `DRIVE_PRIVATE_SLIDES_FOLDER_ID: ${{ secrets.DRIVE_PRIVATE_SLIDES_FOLDER_ID }}` to the `Prepare static site` env block.

**Regenerated:**
- `src/standalone.js` — rebuilt at the end via `npm run build:standalone`; CI-clean.

**Import contract:** files in `src/utils/` import the i18n loader as `../i18n/index.js`, the config as `../config/cloudConfig.js`, and siblings as `./X.js`. Files in `src/components/` import utils as `../utils/X.js`.

**Why split SlideViewer.private.test.jsx from the existing SlideViewer.test.jsx:** the existing 7-test suite uses the real `SLIDE_DECKS` (it tests with section `'graph'` which has multiple real decks). The new private-decks tests use `vi.mock()` to inject fixture data. `vi.mock` is hoisted and applies to the whole test file, so putting both kinds of tests in one file would break the existing tests. A separate file isolates the mocks cleanly.

---

### Task 1: cloudIntegration — singleton + drive.readonly scope + getAccessToken

Refactors `createCloudIntegrationClient()` to memoize so multiple call sites share the same OAuth token. Adds the `drive.readonly` scope alongside the existing `drive.file`. Exposes the access token via a new method.

**Files:**
- Modify: `src/utils/cloudIntegration.js`
- Modify: `src/tests/cloudIntegration.test.js` (append 3 tests — existing 6 stay)

- [ ] **Step 1: Write the failing tests** — APPEND to `src/tests/cloudIntegration.test.js`, after the existing `describe('cloudIntegration client', …)` block's closing `});`, this NEW `describe` block:

```js

import { DRIVE_SCOPES } from '../utils/cloudIntegration.js';

describe('cloudIntegration — private-slides additions', () => {
  it('exports both drive.file and drive.readonly in DRIVE_SCOPES', () => {
    expect(DRIVE_SCOPES).toEqual(expect.arrayContaining([
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
    ]));
    expect(DRIVE_SCOPES.length).toBe(2);
  });

  it('createCloudIntegrationClient returns the same instance on repeated calls', () => {
    const a = createCloudIntegrationClient();
    const b = createCloudIntegrationClient();
    expect(a).toBe(b);
  });

  it('the client exposes getAccessToken returning null when not signed in', () => {
    const client = createCloudIntegrationClient();
    expect(typeof client.getAccessToken).toBe('function');
    expect(client.getAccessToken()).toBe(null);
  });
});
```

Note: `createCloudIntegrationClient` is already imported at the top of the existing file; the new `import { DRIVE_SCOPES } …` is a second import line — Vitest/Vite handle multiple imports from the same module fine.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- src/tests/cloudIntegration.test.js`
Expected: FAIL — `DRIVE_SCOPES` is not exported; `getAccessToken` does not exist.

- [ ] **Step 3: Replace the `DRIVE_SCOPE` constant in `src/utils/cloudIntegration.js`**

Find line 5 (the existing `const DRIVE_SCOPE` declaration):
```js
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
```
Replace with EXACTLY:
```js
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
];
```

- [ ] **Step 4: Refactor `createCloudIntegrationClient` to a singleton**

Right after the `DRIVE_SCOPES` declaration, add a module-scope cache:
```js
let cachedClient = null;
```

Rename the existing `export function createCloudIntegrationClient()` to a private `function buildClient()` (drop the `export`). Then add a new exported wrapper that memoises it:
```js
export function createCloudIntegrationClient() {
  if (cachedClient) return cachedClient;
  cachedClient = buildClient();
  return cachedClient;
}
```
Place the new wrapper ABOVE the renamed `function buildClient()`. The body of `buildClient` (the full original function body) is unchanged.

- [ ] **Step 5: Use `DRIVE_SCOPES` in `signInWithGoogle`**

Inside `buildClient`, find the existing line in `signInWithGoogle`:
```js
      provider.addScope(DRIVE_SCOPE);
```
Replace with EXACTLY:
```js
      DRIVE_SCOPES.forEach((scope) => provider.addScope(scope));
```

- [ ] **Step 6: Add `getAccessToken()` to every returned client**

The file returns four different client objects (three stub branches + the real client). Add `getAccessToken` to ALL of them.

In each of the three stub branches (`!isSupportedOrigin`, `!isConfigured`, `!firebase?.apps`), add this line right after the `getUser()` definition:
```js
      getAccessToken() { return null; },
```

In the real client object (the one starting at the `return {` after `let driveAccessToken = null;`), add this line right after the `getUser()` definition:
```js
      getAccessToken() {
        return driveAccessToken;
      },
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run test:run -- src/tests/cloudIntegration.test.js`
Expected: PASS — 9 tests (6 existing + 3 new).

- [ ] **Step 8: Run the full unit suite — guard against regressions**

Run: `npm run test:run`
Expected: all suites green. The singleton refactor is the riskiest change.

- [ ] **Step 9: Commit**

```bash
git add src/utils/cloudIntegration.js src/tests/cloudIntegration.test.js
git commit -m "refactor(stvisual): cloudIntegration — singleton + drive.readonly + getAccessToken"
```
Commit messages in this repo end with a trailing line `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` — include it (use a HEREDOC for the commit message).

---

### Task 2: cloudConfig — privateSlidesFolderId field

**Files:**
- Modify: `src/config/cloudConfig.js`

- [ ] **Step 1: Add the field to `src/config/cloudConfig.js`**

Find the `drive` object:
```js
  drive: {
    uploadFolderId: '__DRIVE_UPLOAD_FOLDER_ID__',
  },
```
Replace with EXACTLY:
```js
  drive: {
    uploadFolderId: '__DRIVE_UPLOAD_FOLDER_ID__',
    privateSlidesFolderId: '__DRIVE_PRIVATE_SLIDES_FOLDER_ID__',
  },
```

The `getResolvedCloudConfig()` already spreads `cloudConfig.drive` over `runtimeConfig.drive`, so no change needed there.

- [ ] **Step 2: Verify the config parses**

Run: `node --check src/config/cloudConfig.js`
Expected: silent.
Run: `npm run test:run`
Expected: all green.

- [ ] **Step 3: Commit**

```bash
git add src/config/cloudConfig.js
git commit -m "feat(stvisual): cloudConfig — privateSlidesFolderId field"
```
Include the `Co-Authored-By:` trailer.

---

### Task 3: privateDecks module + tests

The new module: given an access token and a folder ID, fetches the manifest then each deck file from Drive, returning `SLIDE_DECKS`-shaped entries with `private: true` and a per-deck `access` status. Pure function with a per-session cache. Identical to rdvisual's `src/framework/privateDecks.js` except the file lives in `src/utils/`.

**Files:**
- Create: `src/utils/privateDecks.js`
- Create: `src/tests/privateDecks.test.js`

- [ ] **Step 1: Write the failing test** — create `src/tests/privateDecks.test.js` with EXACTLY:
```js
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fetchPrivateDecks, _resetPrivateDecksCache } from '../utils/privateDecks.js';

const FOLDER = 'FOLDER_ID_123';
const TOKEN = 'TOKEN_ABC';
const MANIFEST_ID = 'MANIFEST_FILE_ID';
const EN_ID = 'EN_FILE_ID';
const ZH_ID = 'ZH_FILE_ID';

const MANIFEST = {
  version: 1,
  decks: [
    {
      id: 'sailor-instructor',
      section: 'sailor',
      files: { en: 'sailor-instructor.en.md', 'zh-TW': 'sailor-instructor.zh-TW.md' },
      titleEn: 'SAILOR — instructor notes',
      titleZh: 'SAILOR —— 講師補充',
    },
  ],
};
const EN_MD = '---\nmarp: true\n---\n\n# Instructor notes (EN)\n';
const ZH_MD = '---\nmarp: true\n---\n\n# 講師補充 (ZH)\n';

function makeFetch(responses) {
  return vi.fn(async (url) => {
    const matched = responses.find((r) => url.includes(r.match));
    if (!matched) throw new Error(`unmocked fetch: ${url}`);
    if (matched.networkError) throw new Error('network down');
    return {
      ok: matched.status === 200,
      status: matched.status,
      async json() { return matched.json; },
      async text() { return matched.text; },
    };
  });
}

function happyPath() {
  return [
    { match: `name%3D%27private-decks.json%27`, status: 200, json: { files: [{ id: MANIFEST_ID, name: 'private-decks.json' }] } },
    { match: `/files/${MANIFEST_ID}?alt=media`, status: 200, text: JSON.stringify(MANIFEST) },
    { match: `name%3D%27sailor-instructor.en.md%27`, status: 200, json: { files: [{ id: EN_ID, name: 'sailor-instructor.en.md' }, { id: ZH_ID, name: 'sailor-instructor.zh-TW.md' }] } },
    { match: `/files/${EN_ID}?alt=media`, status: 200, text: EN_MD },
    { match: `/files/${ZH_ID}?alt=media`, status: 200, text: ZH_MD },
  ];
}

describe('fetchPrivateDecks', () => {
  beforeEach(() => {
    _resetPrivateDecksCache();
    globalThis.fetch = vi.fn();
  });

  it('returns [] when folderId is empty', async () => {
    const decks = await fetchPrivateDecks({ accessToken: TOKEN, folderId: '' });
    expect(decks).toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('returns [] when accessToken is null', async () => {
    const decks = await fetchPrivateDecks({ accessToken: null, folderId: FOLDER });
    expect(decks).toEqual([]);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('returns [] silently when the manifest is forbidden (403)', async () => {
    globalThis.fetch = makeFetch([
      { match: `name%3D%27private-decks.json%27`, status: 403, json: { error: { message: 'forbidden' } } },
    ]);
    const decks = await fetchPrivateDecks({ accessToken: TOKEN, folderId: FOLDER });
    expect(decks).toEqual([]);
  });

  it('returns [] silently when the manifest is missing (404)', async () => {
    globalThis.fetch = makeFetch([
      { match: `name%3D%27private-decks.json%27`, status: 200, json: { files: [] } },
    ]);
    const decks = await fetchPrivateDecks({ accessToken: TOKEN, folderId: FOLDER });
    expect(decks).toEqual([]);
  });

  it('returns parsed decks on the happy path', async () => {
    globalThis.fetch = makeFetch(happyPath());
    const decks = await fetchPrivateDecks({ accessToken: TOKEN, folderId: FOLDER });
    expect(decks).toHaveLength(1);
    const d = decks[0];
    expect(d.id).toBe('sailor-instructor');
    expect(d.section).toBe('sailor');
    expect(d.titleEn).toBe('SAILOR — instructor notes');
    expect(d.titleZh).toBe('SAILOR —— 講師補充');
    expect(d.en).toBe(EN_MD);
    expect(d.zh).toBe(ZH_MD);
    expect(d.private).toBe(true);
    expect(d.access).toBe('ok');
    expect(d.num).toBeGreaterThanOrEqual(1001);
  });

  it('marks a deck access=denied when its files 403', async () => {
    const responses = happyPath();
    const enIdx = responses.findIndex((r) => r.match === `/files/${EN_ID}?alt=media`);
    responses[enIdx] = { match: `/files/${EN_ID}?alt=media`, status: 403, json: { error: { message: 'forbidden' } } };
    globalThis.fetch = makeFetch(responses);
    const decks = await fetchPrivateDecks({ accessToken: TOKEN, folderId: FOLDER });
    expect(decks).toHaveLength(1);
    expect(decks[0].access).toBe('denied');
  });

  it('marks a deck access=error on network failure', async () => {
    const responses = happyPath();
    const enIdx = responses.findIndex((r) => r.match === `/files/${EN_ID}?alt=media`);
    responses[enIdx] = { match: `/files/${EN_ID}?alt=media`, networkError: true };
    globalThis.fetch = makeFetch(responses);
    const decks = await fetchPrivateDecks({ accessToken: TOKEN, folderId: FOLDER });
    expect(decks).toHaveLength(1);
    expect(decks[0].access).toBe('error');
  });

  it('caches results for the same access token', async () => {
    globalThis.fetch = makeFetch(happyPath());
    await fetchPrivateDecks({ accessToken: TOKEN, folderId: FOLDER });
    const callsAfterFirst = globalThis.fetch.mock.calls.length;
    await fetchPrivateDecks({ accessToken: TOKEN, folderId: FOLDER });
    expect(globalThis.fetch.mock.calls.length).toBe(callsAfterFirst);
  });

  it('invalidates the cache when the access token changes', async () => {
    globalThis.fetch = makeFetch(happyPath());
    await fetchPrivateDecks({ accessToken: TOKEN, folderId: FOLDER });
    globalThis.fetch = makeFetch(happyPath());
    await fetchPrivateDecks({ accessToken: 'DIFFERENT_TOKEN', folderId: FOLDER });
    expect(globalThis.fetch.mock.calls.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- src/tests/privateDecks.test.js`
Expected: FAIL — cannot resolve `../utils/privateDecks.js`.

- [ ] **Step 3: Create `src/utils/privateDecks.js` with EXACTLY:**
```js
// Fetches private Marp decks from a Google Drive folder using the user's
// own OAuth access token (drive.readonly scope). Pure function — caller
// provides token + folder ID. In-memory per-session cache.

const PRIVATE_NUM_OFFSET = 1000;
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';

let cache = { token: null, decks: null };

export function _resetPrivateDecksCache() {
  cache = { token: null, decks: null };
}

export async function fetchPrivateDecks({ accessToken, folderId }) {
  if (!folderId || !accessToken) return [];
  if (cache.token === accessToken && cache.decks !== null) return cache.decks;
  const manifest = await fetchManifest({ accessToken, folderId });
  if (!manifest || !Array.isArray(manifest.decks)) {
    cache = { token: accessToken, decks: [] };
    return [];
  }
  const decks = [];
  for (let i = 0; i < manifest.decks.length; i++) {
    const entry = manifest.decks[i];
    const num = PRIVATE_NUM_OFFSET + i + 1;
    const deck = await fetchDeck({ accessToken, folderId, entry, num });
    if (deck) decks.push(deck);
  }
  cache = { token: accessToken, decks };
  return decks;
}

async function fetchManifest({ accessToken, folderId }) {
  const listed = await listByName({ accessToken, folderId, names: ['private-decks.json'] });
  if (listed === null) return null;
  const file = listed.find((f) => f.name === 'private-decks.json');
  if (!file) return null;
  const text = await getFileMedia({ accessToken, fileId: file.id });
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchDeck({ accessToken, folderId, entry, num }) {
  const enName = entry.files?.en;
  const zhName = entry.files?.['zh-TW'];
  if (!entry.id || !entry.section || !enName || !zhName) return null;
  const listed = await listByName({ accessToken, folderId, names: [enName, zhName] });
  if (listed === null) {
    return shellDeck(entry, num, 'error', '', '');
  }
  const enFile = listed.find((f) => f.name === enName);
  const zhFile = listed.find((f) => f.name === zhName);
  if (!enFile || !zhFile) {
    return shellDeck(entry, num, 'denied', '', '');
  }
  const [enResult, zhResult] = await Promise.all([
    getFileMediaWithStatus({ accessToken, fileId: enFile.id }),
    getFileMediaWithStatus({ accessToken, fileId: zhFile.id }),
  ]);
  const worst = pickWorstStatus(enResult.status, zhResult.status);
  return shellDeck(entry, num, worst, enResult.text || '', zhResult.text || '');
}

function shellDeck(entry, num, access, enText, zhText) {
  return {
    id: entry.id,
    section: entry.section,
    num,
    titleEn: entry.titleEn || entry.id,
    titleZh: entry.titleZh || entry.id,
    en: enText,
    zh: zhText,
    private: true,
    access,
  };
}

function pickWorstStatus(a, b) {
  if (a === 'error' || b === 'error') return 'error';
  if (a === 'denied' || b === 'denied') return 'denied';
  return 'ok';
}

async function listByName({ accessToken, folderId, names }) {
  const nameClauses = names.map((n) => `name='${n.replace(/'/g, "\\'")}'`).join(' or ');
  const q = `'${folderId}' in parents and (${nameClauses}) and trashed=false`;
  const params = new URLSearchParams({ q, fields: 'files(id,name)', pageSize: '50' });
  try {
    const resp = await fetch(`${DRIVE_API}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (resp.status === 403 || resp.status === 401) return null;
    if (!resp.ok) return [];
    const payload = await resp.json();
    return Array.isArray(payload.files) ? payload.files : [];
  } catch {
    return null;
  }
}

async function getFileMedia({ accessToken, fileId }) {
  const { text, status } = await getFileMediaWithStatus({ accessToken, fileId });
  return status === 'ok' ? text : null;
}

async function getFileMediaWithStatus({ accessToken, fileId }) {
  try {
    const resp = await fetch(`${DRIVE_API}/${encodeURIComponent(fileId)}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (resp.status === 403 || resp.status === 404 || resp.status === 401) {
      return { status: 'denied', text: null };
    }
    if (!resp.ok) return { status: 'error', text: null };
    return { status: 'ok', text: await resp.text() };
  } catch {
    return { status: 'error', text: null };
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:run -- src/tests/privateDecks.test.js`
Expected: PASS — 9 tests.

- [ ] **Step 5: Run the full suite — no regressions**

Run: `npm run test:run`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/utils/privateDecks.js src/tests/privateDecks.test.js
git commit -m "feat(stvisual): privateDecks module — fetch Marp decks from Drive folder"
```
Include the `Co-Authored-By:` trailer.

---

### Task 4: i18n keys for the private-slides UI

Adds the five strings the SlideViewer extension in Task 5 references.

**Files:**
- Modify: `src/i18n/dict.js`

- [ ] **Step 1: Add keys to the `en` block**

In `src/i18n/dict.js`, find the existing `slides.*` block in the `en` object (the last existing key is `'slides.empty'` around line 1210). Right after `'slides.empty'`, add EXACTLY:

```js
    'slides.private.chipAria': 'Private deck',
    'slides.private.signInRow': '🔒 Sign in to see private slides',
    'slides.private.noAccess': 'no access',
    'slides.private.fetchError': "couldn't load — retry",
    'slides.private.retryBtn': 'Retry',
```

- [ ] **Step 2: Add keys to the `zh` block**

In the same file, find the `zh` object's `slides.*` block (mirroring the structure). Right after the `zh`-side `'slides.empty'`, add EXACTLY:

```js
    'slides.private.chipAria': '私人投影片',
    'slides.private.signInRow': '🔒 登入以檢視私人投影片',
    'slides.private.noAccess': '無存取權',
    'slides.private.fetchError': '載入失敗 —— 重試',
    'slides.private.retryBtn': '重試',
```

- [ ] **Step 3: Verify**

Run: `node --check src/i18n/dict.js` and `npm run test:run`
Expected: silent + all green.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/dict.js
git commit -m "feat(stvisual): i18n strings for the private-slides UI"
```
Include the `Co-Authored-By:` trailer.

---

### Task 5: SlideViewer extension — merge private decks, sign-in row, denied/error states

Extends `openSlideViewer(sectionId)` so the deck picker shows public bundled decks plus any private decks the signed-in user can read (with 🔒). Includes the defensive `__…__` placeholder guard from the start (rdvisual added this as a post-review fix; baking it in here avoids the same regression).

**Files:**
- Modify: `src/components/SlideViewer.js`, `src/components/SlideViewer.css`
- Create: `src/tests/SlideViewer.private.test.jsx` (SEPARATE file from the existing `SlideViewer.test.jsx` — see "Why split" in the File Structure section above)

- [ ] **Step 1: Write the failing test** — create `src/tests/SlideViewer.private.test.jsx` with EXACTLY:
```js
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

// Mock privateDecks BEFORE importing SlideViewer.
const mockFetchPrivateDecks = vi.fn();
vi.mock('../utils/privateDecks.js', () => ({
  fetchPrivateDecks: (...args) => mockFetchPrivateDecks(...args),
  _resetPrivateDecksCache: () => {},
}));

// Mock cloudIntegration to control accessToken.
const mockGetAccessToken = vi.fn();
vi.mock('../utils/cloudIntegration.js', () => ({
  createCloudIntegrationClient: () => ({
    getAccessToken: () => mockGetAccessToken(),
  }),
  DRIVE_SCOPES: [],
}));

// Mock cloudConfig to control folderId.
const mockFolderId = { value: '' };
vi.mock('../config/cloudConfig.js', () => ({
  cloudConfig: { firebase: {}, drive: {} },
  getResolvedCloudConfig: () => ({
    firebase: {},
    drive: { uploadFolderId: '', privateSlidesFolderId: mockFolderId.value },
  }),
}));

// Mock SLIDE_DECKS so the test owns the public deck fixture.
vi.mock('../data/slideDecks.generated.js', () => ({
  SLIDE_DECKS: [
    {
      id: 'sailor-public',
      section: 'sailor',
      num: 3,
      titleEn: 'SAILOR Public',
      titleZh: 'SAILOR 公開',
      en: '---\nmarp: true\n---\n\n# Public EN\n',
      zh: '---\nmarp: true\n---\n\n# Public ZH\n',
    },
  ],
}));

import { openSlideViewer, closeSlideViewer } from '../components/SlideViewer.js';

const flushAsync = () => new Promise((r) => setTimeout(r, 0));

describe('SlideViewer — private deck integration', () => {
  beforeEach(() => {
    mockFetchPrivateDecks.mockReset();
    mockGetAccessToken.mockReset();
    mockFolderId.value = '';
  });

  afterEach(() => {
    closeSlideViewer();
  });

  it('public-only: when folder is not configured, no 🔒 row appears', async () => {
    mockFolderId.value = '';
    mockGetAccessToken.mockReturnValue(null);
    openSlideViewer('sailor');
    await flushAsync();
    expect(document.querySelector('[data-testid="slideviewer"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="slideviewer-signin-row"]')).toBeFalsy();
    expect(mockFetchPrivateDecks).not.toHaveBeenCalled();
  });

  it('treats a __…__ placeholder folder ID as not configured (deploy safety guard)', async () => {
    mockFolderId.value = '__DRIVE_PRIVATE_SLIDES_FOLDER_ID__';
    mockGetAccessToken.mockReturnValue('TOKEN_X');
    openSlideViewer('sailor');
    await flushAsync();
    expect(document.querySelector('[data-testid="slideviewer-signin-row"]')).toBeFalsy();
    expect(mockFetchPrivateDecks).not.toHaveBeenCalled();
  });

  it('shows a sign-in row when folder is configured but user is not signed in', async () => {
    mockFolderId.value = 'FOLDER_X';
    mockGetAccessToken.mockReturnValue(null);
    openSlideViewer('sailor');
    await flushAsync();
    expect(document.querySelector('[data-testid="slideviewer-signin-row"]')).toBeTruthy();
    expect(mockFetchPrivateDecks).not.toHaveBeenCalled();
  });

  it('merges fetched private decks into the picker with 🔒 marker', async () => {
    mockFolderId.value = 'FOLDER_X';
    mockGetAccessToken.mockReturnValue('TOKEN_X');
    mockFetchPrivateDecks.mockResolvedValue([
      {
        id: 'sailor-instr', section: 'sailor', num: 1001,
        titleEn: 'SAILOR Instructor', titleZh: 'SAILOR 講師',
        en: '---\nmarp: true\n---\n\n# Priv EN\n',
        zh: '---\nmarp: true\n---\n\n# Priv ZH\n',
        private: true, access: 'ok',
      },
    ]);
    openSlideViewer('sailor');
    await flushAsync();
    await flushAsync();
    const buttons = [...document.querySelectorAll('[data-testid^="slideviewer-deck-"]')];
    expect(buttons.length).toBe(2);
    const privateBtn = buttons.find((b) => b.textContent.includes('SAILOR'));
    expect(privateBtn).toBeTruthy();
    const anyBtnHasLock = buttons.some((b) => b.textContent.includes('🔒'));
    expect(anyBtnHasLock).toBe(true);
  });

  it('marks a denied deck visually and disables clicking through', async () => {
    mockFolderId.value = 'FOLDER_X';
    mockGetAccessToken.mockReturnValue('TOKEN_X');
    mockFetchPrivateDecks.mockResolvedValue([
      {
        id: 'sailor-locked', section: 'sailor', num: 1002,
        titleEn: 'SAILOR Locked', titleZh: 'SAILOR 鎖定',
        en: '', zh: '',
        private: true, access: 'denied',
      },
    ]);
    openSlideViewer('sailor');
    await flushAsync();
    await flushAsync();
    const lockedBtn = [...document.querySelectorAll('[data-testid^="slideviewer-deck-"]')]
      .find((b) => b.classList.contains('slideviewer-deck-btn--denied'));
    expect(lockedBtn).toBeTruthy();
    expect(lockedBtn.disabled).toBe(true);
  });

  it('clicking the sign-in row clicks the page-level cloud trigger and closes the viewer', async () => {
    mockFolderId.value = 'FOLDER_X';
    mockGetAccessToken.mockReturnValue(null);
    const cloudBtn = document.createElement('button');
    cloudBtn.setAttribute('data-app-cloud', '');
    cloudBtn.setAttribute('data-testid', 'app-cloud-link');
    const clickSpy = vi.fn();
    cloudBtn.addEventListener('click', clickSpy);
    document.body.appendChild(cloudBtn);
    openSlideViewer('sailor');
    await flushAsync();
    const signinRow = document.querySelector('[data-testid="slideviewer-signin-row"]');
    signinRow.click();
    expect(clickSpy).toHaveBeenCalled();
    expect(document.querySelector('[data-testid="slideviewer"]')).toBeFalsy();
    cloudBtn.remove();
  });
});
```

NOTE on the SLIDE_DECKS mock path: stvisual's `SlideViewer.js` imports `SLIDE_DECKS` from `../data/slideDecks.generated.js` (NOT `../content/...` as in rdvisual). Verify the import path by running `grep -n "slideDecks" src/components/SlideViewer.js` BEFORE running the test. If the actual path differs from `'../data/slideDecks.generated.js'`, adjust the `vi.mock(...)` first argument to match.

Two other path differences from rdvisual to verify with a quick grep first:
- `vi.mock('../utils/cloudIntegration.js', …)` should match the actual relative path used in `SlideViewer.js`.
- `vi.mock('../config/cloudConfig.js', …)` should also match.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:run -- src/tests/SlideViewer.private.test.jsx`
Expected: FAIL — the SlideViewer doesn't import `privateDecks` / `cloudIntegration` / `cloudConfig` yet; `slideviewer-signin-row` testid doesn't exist.

- [ ] **Step 3: Add the imports + helper to `src/components/SlideViewer.js`**

At the top of `src/components/SlideViewer.js`, after the existing imports, add EXACTLY:
```js
import { fetchPrivateDecks } from '../utils/privateDecks.js';
import { createCloudIntegrationClient } from '../utils/cloudIntegration.js';
import { getResolvedCloudConfig } from '../config/cloudConfig.js';
```
(Confirm the relative-path prefixes match the actual paths from `src/components/`. From `src/components/`, `src/utils/X` is `../utils/X` and `src/config/X` is `../config/X` — correct.)

- [ ] **Step 4: Replace `decksForSection` with public/private awareness**

Find:
```js
function decksForSection(sectionId) {
  return SLIDE_DECKS.filter((d) => d.section === sectionId);
}
```
(If stvisual's function has a slightly different name or body, locate it by behavior — it's the single helper that filters `SLIDE_DECKS` by section.) Replace with EXACTLY:
```js
function publicDecksForSection(sectionId) {
  return SLIDE_DECKS.filter((d) => d.section === sectionId);
}

function getPrivateContext() {
  const config = getResolvedCloudConfig();
  const raw = config?.drive?.privateSlidesFolderId || '';
  // Treat a literal `__…__` placeholder (e.g. when inject-env didn't run or the
  // env var is unset) as "not configured" — feature disabled, no Drive calls.
  const folderId = /^__.+__$/.test(raw) ? '' : raw;
  if (!folderId) return { folderId: '', token: null };
  const token = createCloudIntegrationClient().getAccessToken();
  return { folderId, token };
}
```

Also update any internal callers of the old `decksForSection` to `publicDecksForSection`.

- [ ] **Step 5: Update `deckTitle` to mark private decks with 🔒**

Find:
```js
function deckTitle(deck) {
  return getLocale() === 'en' ? deck.titleEn : deck.titleZh;
}
```
(If the body differs slightly, the behaviour is "pick the locale-appropriate title".) Replace with EXACTLY:
```js
function deckTitle(deck) {
  const base = getLocale() === 'en' ? deck.titleEn : deck.titleZh;
  return deck.private ? `🔒 ${base}` : base;
}
```

- [ ] **Step 6: Replace the `paint` function's deck-button rendering**

Inside `paint()`, locate the inline expression that renders the deck-button row (it produces the `<div class="slideviewer-decks">` with `<button class="slideviewer-deck-btn ...">` children). Replace that expression with `${renderDeckBar()}`.

Then add this helper function ABOVE `paint()`:

```js
function renderDeckBar() {
  const items = [...view.decks];
  if (view.privateSignInNeeded) {
    items.push({ __signInRow: true });
  }
  if (items.length <= 1 && !view.privateSignInNeeded) {
    return '<span class="slideviewer-title">' + deckTitle(view.decks[view.deckIndex]) + '</span>';
  }
  return `<div class="slideviewer-decks" role="tablist" aria-label="${t('slides.deckSelector')}">${items.map((d, i) => {
    if (d.__signInRow) {
      return `<button type="button" class="slideviewer-deck-btn slideviewer-deck-btn--signin"
        data-testid="slideviewer-signin-row">${t('slides.private.signInRow')}</button>`;
    }
    const classes = ['slideviewer-deck-btn'];
    if (i === view.deckIndex) classes.push('slideviewer-deck-btn--active');
    if (d.private) classes.push('slideviewer-deck-btn--private');
    if (d.private && d.access === 'denied') classes.push('slideviewer-deck-btn--denied');
    if (d.private && d.access === 'error') classes.push('slideviewer-deck-btn--error');
    const denied = d.private && (d.access === 'denied' || d.access === 'error');
    const ariaLabel = d.private ? ` aria-label="${t('slides.private.chipAria')}: ${deckTitle(d).replace(/^🔒 /, '')}"` : '';
    return `<button type="button" class="${classes.join(' ')}"
      data-deck="${i}" data-testid="slideviewer-deck-${i}" role="tab"
      aria-selected="${i === view.deckIndex ? 'true' : 'false'}"
      ${denied ? 'disabled' : ''}${ariaLabel}>${deckTitle(d)}${
        d.private && d.access === 'denied' ? ` <span class="slideviewer-deck-btn__sub">— ${t('slides.private.noAccess')}</span>` : ''
      }${
        d.private && d.access === 'error' ? ` <span class="slideviewer-deck-btn__sub">— ${t('slides.private.fetchError')}</span>` : ''
      }</button>`;
  }).join('')}</div>`;
}
```

- [ ] **Step 7: Wire the sign-in row click in `paint()`**

In `paint()`, right after the existing block that wires `[data-deck]` button clicks, add:
```js
  const signinRow = overlay.querySelector('[data-testid="slideviewer-signin-row"]');
  if (signinRow) {
    signinRow.addEventListener('click', () => {
      const cloudBtn = document.querySelector('[data-app-cloud]');
      closeSlideViewer();
      cloudBtn?.click();
    });
  }
```

- [ ] **Step 8: Extend `openSlideViewer` to kick off private fetch + merge on resolve**

Replace the entire existing `openSlideViewer` function with EXACTLY:
```js
export function openSlideViewer(sectionId) {
  const publicDecks = publicDecksForSection(sectionId);
  const { folderId, token } = getPrivateContext();
  const privateConfigured = Boolean(folderId);

  if (!publicDecks.length) return;

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'slideviewer-overlay';
    overlay.dataset.testid = 'slideviewer';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSlideViewer(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
  }
  returnFocusTo = document.activeElement;
  overlay.hidden = false;
  view.decks = publicDecks;
  view.notesOn = false;
  view.privateSignInNeeded = privateConfigured && !token;
  loadDeck(0);
  paint();
  focusInViewer('slideviewer-close');

  if (privateConfigured && token) {
    fetchPrivateDecks({ accessToken: token, folderId }).then((all) => {
      if (!overlay || overlay.hidden) return;
      const privateForSection = all.filter((d) => d.section === sectionId);
      if (!privateForSection.length) return;
      view.decks = [...publicDecks, ...privateForSection];
      view.privateSignInNeeded = false;
      paint();
    }).catch(() => {
      // silent — leave the picker as public-only
    });
  }
}
```

Find the `view` object initial declaration:
```js
const view = { decks: [], deckIndex: 0, slideIndex: 0, slides: [], notesOn: false };
```
(If stvisual's shape differs slightly — e.g. extra fields — preserve those and only ADD `privateSignInNeeded: false` at the end.) The minimal change is to ensure the object includes `privateSignInNeeded: false`.

- [ ] **Step 9: Add CSS for the new states**

Append to the end of `src/components/SlideViewer.css`:
```css

/* ── Private slides (Drive-gated) ── */
.slideviewer-deck-btn--private { background: #faf5ff; color: #6b21a8; }
.slideviewer-deck-btn--private.slideviewer-deck-btn--active {
  background: #6b21a8; color: #fff;
}
.slideviewer-deck-btn--signin {
  background: #fef3c7; color: #92400e; font-style: italic; font-weight: 600;
}
.slideviewer-deck-btn--signin:hover { background: #fde68a; }
.slideviewer-deck-btn--denied,
.slideviewer-deck-btn--error {
  background: #f1f5f9; color: #94a3b8; cursor: not-allowed;
}
.slideviewer-deck-btn__sub { font-size: 0.72rem; opacity: 0.85; margin-left: 0.25rem; }
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `npm run test:run -- src/tests/SlideViewer.private.test.jsx`
Expected: PASS — 6 tests (the public-only, the `__…__` guard, the sign-in row, the merge, the denied state, the sign-in click).

Run: `npm run test:run -- src/tests/SlideViewer.test.jsx`
Expected: PASS — the existing 7 SlideViewer tests must still all pass (they don't use private features; the existing behaviour is untouched).

- [ ] **Step 11: Run the full unit suite — guard against regressions**

Run: `npm run test:run`
Expected: all suites green.

- [ ] **Step 12: Commit**

```bash
git add src/components/SlideViewer.js src/components/SlideViewer.css src/tests/SlideViewer.private.test.jsx
git commit -m "feat(stvisual): SlideViewer — merge private Drive decks, sign-in row, denied/error states"
```
Include the `Co-Authored-By:` trailer.

---

### Task 6: Operator guide

**Files:**
- Create: `docs/private-slides.md`

- [ ] **Step 1: Create `docs/private-slides.md` with EXACTLY this content**

````markdown
# Private course slides on Google Drive

Some course slides shouldn't be public. stvisual can fetch them from a Google
Drive folder at runtime, gated by Drive-native per-user sharing. Public
bundled decks and private Drive decks appear together in the same in-app
slide viewer; private decks get a 🔒 chip and require sign-in.

## What you need

- A Google account with Drive.
- A Google Cloud project with the Drive API enabled (the same project used by
  Firebase Auth for this deployment — already set up if the cloud drawer
  works).
- The deployment's `cloudConfig.js` (filled at build time via inject-env).

## One-time setup

1. **Create a Drive folder.** Name it something memorable, e.g.
   `stvisual — course private slides`. Copy its folder ID from the URL
   (the bit after `/folders/`).
2. **Share the folder** with the Google accounts (or Google Group) of the
   users who should see private decks. Use Drive's normal "Share" dialog;
   "Viewer" permission is enough. Revoke any time from the same dialog.
3. **Set the folder ID** in your deployment's environment:
   `DRIVE_PRIVATE_SLIDES_FOLDER_ID=<the folder ID>`.
   Leave it unset to disable the feature entirely (no 🔒 in the UI, no Drive
   calls).

## Writing a private deck

1. Author your Marp markdown locally (the same `marp: true` front-matter as
   public decks). Two files per deck — `*.en.md` and `*.zh-TW.md`.
2. Upload both files to the Drive folder.
3. Add an entry to `private-decks.json` in the same folder. Create the file
   if it doesn't exist. Schema:

   ```json
   {
     "version": 1,
     "decks": [
       {
         "id": "advanced-extras",
         "section": "graph",
         "files": {
           "en": "advanced-extras.en.md",
           "zh-TW": "advanced-extras.zh-TW.md"
         },
         "titleEn": "Graph coverage — instructor notes",
         "titleZh": "圖形涵蓋 —— 講師補充"
       }
     ]
   }
   ```

   All six fields per entry are required. `section` must match the id of an
   existing app section — the deck will appear in that section's slide
   viewer.

4. That's it — the next time an authorised user opens the section's slide
   viewer, the deck appears with a 🔒 chip.

## What users see

- **Signed-in, in the share list:** the deck appears alongside public decks
  marked `🔒 <title>`. Clicking it renders the markdown via the same viewer.
- **Signed-in, not in the share list:** no 🔒 row appears at all — the deck
  is invisible (Drive returns 403 for the manifest, and the app falls back
  silently).
- **Not signed in:** the deck picker shows a single
  `🔒 Sign in to see private slides` row. Clicking it opens the cloud drawer
  for Google sign-in.

## OAuth scope note

The app requests `https://www.googleapis.com/auth/drive.readonly` alongside
the existing `drive.file` scope. On the Google consent screen this appears
as "See and download your Drive files". Users who decline see no 🔒 rows
(graceful degradation, no error).

## Images

Images referenced from a private deck must still live in the public
`public/slide-assets/` bundle (i.e. they ship with the app). Hosting deck
images on Drive is not currently supported.

## Limitations

- One Drive folder per deployment.
- No live updates — the manifest is fetched once per slide-viewer open.
- No editing slides from the app — author in Drive's UI.
- Per-deck sharing isn't first-class — share at the folder level.
````

- [ ] **Step 2: Commit**

```bash
git add docs/private-slides.md
git commit -m "docs(stvisual): operator guide for private slides on Drive"
```
Include the `Co-Authored-By:` trailer.

---

### Task 7: inject-env + deploy workflow — wire the env var (BAKED-IN safety)

This was a post-review fix in rdvisual; bake it in here so the placeholder is replaced at deploy time (otherwise the literal `__DRIVE_PRIVATE_SLIDES_FOLDER_ID__` would survive into the bundle and activate the 🔒 sign-in row for every unauthenticated visitor). The defensive `__…__` guard added in Task 5 Step 4 is the secondary safety net.

**Files:**
- Modify: `scripts/inject-env.mjs`
- Modify: `.github/workflows/deploy-pages.yml`

- [ ] **Step 1: Add the placeholder to `scripts/inject-env.mjs`**

Find the `PLACEHOLDERS` map. The last existing entry is:
```js
  __DRIVE_UPLOAD_FOLDER_ID__: 'DRIVE_UPLOAD_FOLDER_ID',
```
After it, add EXACTLY:
```js
  __DRIVE_PRIVATE_SLIDES_FOLDER_ID__: 'DRIVE_PRIVATE_SLIDES_FOLDER_ID',
```

- [ ] **Step 2: Add the env var to the deploy workflow**

In `.github/workflows/deploy-pages.yml`, find the `Prepare static site` step's `env:` block. The last existing env var is:
```yaml
          DRIVE_UPLOAD_FOLDER_ID: ${{ secrets.DRIVE_UPLOAD_FOLDER_ID }}
```
After it, add EXACTLY:
```yaml
          DRIVE_PRIVATE_SLIDES_FOLDER_ID: ${{ secrets.DRIVE_PRIVATE_SLIDES_FOLDER_ID }}
```

- [ ] **Step 3: Verify**

Run: `node --check scripts/inject-env.mjs`
Expected: silent.

Run: `npm run test:run`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add scripts/inject-env.mjs .github/workflows/deploy-pages.yml
git commit -m "chore(stvisual): wire DRIVE_PRIVATE_SLIDES_FOLDER_ID through inject-env + Pages workflow"
```
Include the `Co-Authored-By:` trailer.

---

### Task 8: Rebuild standalone + final verification

Tasks 1-7 changed the `src/main.js` import graph, so `src/standalone.js` is stale.

**Files:**
- Modify (regenerated): `src/standalone.js`

- [ ] **Step 1: Rebuild the standalone bundle**

Run: `npm run build:standalone`
Expected: prints `Built standalone bundle at src/standalone.js`. The committed `src/standalone.js` MUST be the plain bare-build output — do NOT run any `inject-env` step.

- [ ] **Step 2: Final done-criteria check**

Run each and confirm:
```bash
npm run test:run
npm run build
npm run build:slide-decks
npm run build:standalone && git diff --quiet -- src/standalone.js && echo "standalone CI-clean"
```
Expected: all unit suites green (including `cloudIntegration` with 9 tests, `privateDecks` with 9 tests, `SlideViewer` existing tests still passing, and `SlideViewer.private.test.jsx` with 6 tests); `build` and `build:slide-decks` succeed; the last line prints `standalone CI-clean`.

- [ ] **Step 3: Commit**

```bash
git add src/standalone.js
git commit -m "chore(stvisual): rebuild standalone bundle for private-slides-on-drive"
```
Include the `Co-Authored-By:` trailer.
Then run `git status` — working tree clean except gitignored/untracked dirs (`.claude/` untracked is fine). CONFIRM no `site/`, `dist/`, `playwright-report/`, or `test-results/` are staged or were committed.

---

## Self-Review

**Spec coverage** — every spec section maps to a task:
- OAuth scope addition + singleton refactor + access token exposure → Task 1.
- Config field `privateSlidesFolderId` → Task 2.
- `privateDecks` module → Task 3.
- i18n keys → Task 4.
- SlideViewer integration (merge, sign-in row, denied/error, defensive `__…__` guard) → Task 5.
- Operator guide → Task 6.
- inject-env + deploy workflow (the safety lesson from Plan A baked in) → Task 7.
- Standalone bundle CI-clean → Task 8.

**Placeholder scan:** no TBD/TODO. Every code step shows the exact old/new code or the verbatim full file content; tests are full files; the operator guide is verbatim. The Drive REST URL patterns are concrete.

**Type / name consistency:**
- `fetchPrivateDecks({ accessToken, folderId })` defined in Task 3, called identically in Task 5.
- `_resetPrivateDecksCache()` exported in Task 3, mocked in Task 5's test.
- `DRIVE_SCOPES` exported in Task 1, asserted in Task 1's test, mocked (as `[]`) in Task 5's test.
- `createCloudIntegrationClient().getAccessToken()` defined in Task 1, called in Task 5's `getPrivateContext`.
- Config field `privateSlidesFolderId` added in Task 2, read in Task 5's `getPrivateContext`.
- Deck shape (`{ id, section, num, titleEn, titleZh, en, zh, private: true, access }`) defined in Task 3, consumed identically in Task 5's `renderDeckBar`.
- Testids: `slideviewer-signin-row` (new in Task 5, referenced in the Task 5 test); the existing `slideviewer-*` testids are unchanged.
- The 5 `slides.private.*` i18n keys defined in Task 4 are exactly the five referenced in Task 5's `renderDeckBar`.
- The `__DRIVE_PRIVATE_SLIDES_FOLDER_ID__` placeholder name in Task 2 matches the inject-env key added in Task 7 and the workflow env var added in Task 7.

**Test file split rationale:** The existing `src/tests/SlideViewer.test.jsx` uses real `SLIDE_DECKS` (tests with section `'graph'`). The new private-decks tests use `vi.mock()` for SLIDE_DECKS to inject fixture data. `vi.mock` is file-scoped, so putting the new tests in the same file would break the existing ones. Plan B uses a separate `SlideViewer.private.test.jsx` file for isolation. (Plan A in rdvisual didn't have this concern because rdvisual didn't have a pre-existing `SlideViewer.test.jsx`.)
