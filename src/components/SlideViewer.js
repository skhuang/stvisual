import { t, getLocale } from '../i18n/index.js';
import { SLIDE_DECKS } from '../data/slideDecks.generated.js';
import { parseDeck } from '../utils/slideMarkdown.js';
import { fetchPrivateDecks } from '../utils/privateDecks.js';
import { createCloudIntegrationClient } from '../utils/cloudIntegration.js';
import { getResolvedCloudConfig } from '../config/cloudConfig.js';

// One reused overlay node, lazily created and appended to <body>.
let overlay = null;
let returnFocusTo = null;
const view = { decks: [], deckIndex: 0, slideIndex: 0, slides: [], notesOn: false, privateSignInNeeded: false };
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

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
function deckTitle(deck) {
  const base = getLocale() === 'en' ? deck.titleEn : deck.titleZh;
  return deck.private ? `🔒 ${base}` : base;
}
function loadDeck(index) {
  view.deckIndex = index;
  view.slideIndex = 0;
  const deck = view.decks[index];
  const raw = getLocale() === 'en' ? deck.en : deck.zh;
  view.slides = parseDeck(raw).slides;
}

function onKey(e) {
  if (!overlay || overlay.hidden) return;
  if (e.key === 'Escape') closeSlideViewer();
  else if (e.key === 'ArrowRight') { e.preventDefault(); go(1, 'slideviewer-next'); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1, 'slideviewer-prev'); }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0, 'slideviewer-prev'); }
  else if (e.key === 'End') { e.preventDefault(); goTo(view.slides.length - 1, 'slideviewer-next'); }
  else if (e.key === 'Tab') trapFocus(e);
}

function focusInViewer(testId = 'slideviewer-close') {
  const preferred = overlay?.querySelector(`[data-testid="${testId}"]`);
  const target = preferred && !preferred.disabled
    ? preferred
    : overlay?.querySelector(FOCUSABLE_SELECTOR) || overlay?.querySelector('.slideviewer-panel');
  target?.focus?.();
}

function trapFocus(e) {
  const focusable = [...overlay.querySelectorAll(FOCUSABLE_SELECTOR)]
    .filter((node) => !node.disabled && !node.closest('[hidden]'));
  if (!focusable.length) {
    e.preventDefault();
    overlay.querySelector('.slideviewer-panel')?.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function goTo(index, focusTestId) {
  if (index < 0 || index >= view.slides.length || index === view.slideIndex) return;
  view.slideIndex = index;
  paint(focusTestId);
}

function go(delta, focusTestId) {
  const next = view.slideIndex + delta;
  goTo(next, focusTestId);
}

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

function paint(focusTestId) {
  const slide = view.slides[view.slideIndex] || { html: `<p>${t('slides.empty')}</p>`, notes: '' };
  overlay.innerHTML = `
    <div class="slideviewer-panel" role="dialog" aria-modal="true" aria-label="${t('slides.dialog')}" tabindex="-1">
      <div class="slideviewer-bar">
        ${renderDeckBar()}
        <button type="button" class="slideviewer-close" data-testid="slideviewer-close"
          aria-label="${t('slides.close')}">✕</button>
      </div>
      <div class="slideviewer-stage">
        <div class="slideviewer-slide" data-testid="slideviewer-slide">${slide.html}</div>
      </div>
      <div class="slideviewer-notes" data-testid="slideviewer-notes" ${view.notesOn ? '' : 'hidden'}>${slide.notes || ''}</div>
      <div class="slideviewer-foot">
        <div class="slideviewer-foot__nav">
        <button type="button" class="slideviewer-nav-btn" data-testid="slideviewer-prev" aria-label="${t('slides.prev')}"
          ${view.slideIndex === 0 ? 'disabled' : ''}>${t('slides.prev')}</button>
        <button type="button" class="slideviewer-nav-btn" data-testid="slideviewer-next" aria-label="${t('slides.next')}"
          ${view.slideIndex >= view.slides.length - 1 ? 'disabled' : ''}>${t('slides.next')}</button>
        </div>
        <div class="slideviewer-foot__meta">
        <span class="slideviewer-counter" data-testid="slideviewer-counter">${t('slides.counter', {
          n: view.slideIndex + 1, total: view.slides.length,
        })}</span>
        <button type="button" class="slideviewer-notes-toggle" data-testid="slideviewer-notes-toggle">${
          view.notesOn ? t('slides.notes.hide') : t('slides.notes.show')}</button>
        </div>
      </div>
    </div>`;
  overlay.querySelector('[data-testid="slideviewer-close"]').addEventListener('click', closeSlideViewer);
  overlay.querySelector('[data-testid="slideviewer-prev"]').addEventListener('click', () => go(-1, 'slideviewer-prev'));
  overlay.querySelector('[data-testid="slideviewer-next"]').addEventListener('click', () => go(1, 'slideviewer-next'));
  overlay.querySelector('[data-testid="slideviewer-notes-toggle"]').addEventListener('click', () => {
    view.notesOn = !view.notesOn;
    paint('slideviewer-notes-toggle');
  });
  overlay.querySelectorAll('[data-deck]').forEach((btn) => {
    btn.addEventListener('click', () => { loadDeck(Number(btn.dataset.deck)); paint(btn.dataset.testid); });
  });
  const signinRow = overlay.querySelector('[data-testid="slideviewer-signin-row"]');
  if (signinRow) {
    signinRow.addEventListener('click', () => {
      const cloudBtn = document.querySelector('[data-app-cloud]');
      closeSlideViewer();
      cloudBtn?.click();
    });
  }
  if (focusTestId) focusInViewer(focusTestId);
}

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

export function closeSlideViewer() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  document.removeEventListener('keydown', onKey);
  if (returnFocusTo && returnFocusTo.focus) returnFocusTo.focus();
  returnFocusTo = null;
}
