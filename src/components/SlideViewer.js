import { t, getLocale } from '../i18n/index.js';
import { SLIDE_DECKS } from '../data/slideDecks.generated.js';
import { parseDeck } from '../utils/slideMarkdown.js';

// One reused overlay node, lazily created and appended to <body>.
let overlay = null;
let returnFocusTo = null;
const view = { decks: [], deckIndex: 0, slideIndex: 0, slides: [], notesOn: false };
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function decksForSection(sectionId) {
  return SLIDE_DECKS.filter((d) => d.section === sectionId);
}
function deckTitle(deck) {
  return getLocale() === 'en' ? deck.titleEn : deck.titleZh;
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

function paint(focusTestId) {
  const slide = view.slides[view.slideIndex] || { html: `<p>${t('slides.empty')}</p>`, notes: '' };
  const multi = view.decks.length > 1;
  overlay.innerHTML = `
    <div class="slideviewer-panel" role="dialog" aria-modal="true" aria-label="${t('slides.dialog')}" tabindex="-1">
      <div class="slideviewer-bar">
        ${multi ? `<div class="slideviewer-decks" role="tablist" aria-label="${t('slides.deckSelector')}">${view.decks.map((d, i) => `
          <button type="button" class="slideviewer-deck-btn ${i === view.deckIndex ? 'slideviewer-deck-btn--active' : ''}"
            data-deck="${i}" data-testid="slideviewer-deck-${i}" role="tab"
            aria-selected="${i === view.deckIndex ? 'true' : 'false'}">${deckTitle(d)}</button>`).join('')}</div>` : '<span class="slideviewer-title">' + deckTitle(view.decks[view.deckIndex]) + '</span>'}
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
  if (focusTestId) focusInViewer(focusTestId);
}

export function openSlideViewer(sectionId) {
  const decks = decksForSection(sectionId);
  if (!decks.length) return;
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
  view.decks = decks;
  view.notesOn = false;
  loadDeck(0);
  paint();
  focusInViewer('slideviewer-close');
}

export function closeSlideViewer() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  document.removeEventListener('keydown', onKey);
  if (returnFocusTo && returnFocusTo.focus) returnFocusTo.focus();
  returnFocusTo = null;
}
