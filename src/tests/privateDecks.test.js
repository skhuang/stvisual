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
