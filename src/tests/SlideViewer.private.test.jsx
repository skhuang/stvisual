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
