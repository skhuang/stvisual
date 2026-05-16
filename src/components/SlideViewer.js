import { t, getLocale } from '../i18n/index.js';
import { SLIDE_DECKS } from '../data/slideDecks.generated.js';
import { parseDeck } from '../utils/slideMarkdown.js';

// One reused overlay node, lazily created and appended to <body>.
let overlay = null;
let returnFocusTo = null;
const view = { decks: [], deckIndex: 0, slideIndex: 0, slides: [], notesOn: false };

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
  else if (e.key === 'ArrowRight') go(1);
  else if (e.key === 'ArrowLeft') go(-1);
}

function go(delta) {
  const next = view.slideIndex + delta;
  if (next < 0 || next >= view.slides.length) return;
  view.slideIndex = next;
  paint();
}

function paint() {
  const slide = view.slides[view.slideIndex] || { html: `<p>${t('slides.empty')}</p>`, notes: '' };
  const multi = view.decks.length > 1;
  overlay.innerHTML = `
    <div class="slideviewer-panel" role="dialog" aria-modal="true">
      <div class="slideviewer-bar">
        ${multi ? `<div class="slideviewer-decks">${view.decks.map((d, i) => `
          <button type="button" class="slideviewer-deck-btn ${i === view.deckIndex ? 'slideviewer-deck-btn--active' : ''}"
            data-deck="${i}" data-testid="slideviewer-deck-${i}">${deckTitle(d)}</button>`).join('')}</div>` : ''}
        <button type="button" class="slideviewer-close" data-testid="slideviewer-close"
          aria-label="${t('slides.close')}">✕</button>
      </div>
      <div class="slideviewer-slide" data-testid="slideviewer-slide">${slide.html}</div>
      <div class="slideviewer-notes" data-testid="slideviewer-notes" ${view.notesOn ? '' : 'hidden'}>${slide.notes || ''}</div>
      <div class="slideviewer-foot">
        <button type="button" class="slideviewer-nav-btn" data-testid="slideviewer-prev"
          ${view.slideIndex === 0 ? 'disabled' : ''}>${t('slides.prev')}</button>
        <button type="button" class="slideviewer-nav-btn" data-testid="slideviewer-next"
          ${view.slideIndex >= view.slides.length - 1 ? 'disabled' : ''}>${t('slides.next')}</button>
        <span class="slideviewer-counter" data-testid="slideviewer-counter">${t('slides.counter', {
          n: view.slideIndex + 1, total: view.slides.length,
        })}</span>
        <button type="button" class="slideviewer-notes-toggle" data-testid="slideviewer-notes-toggle">${
          view.notesOn ? t('slides.notes.hide') : t('slides.notes.show')}</button>
      </div>
    </div>`;
  overlay.querySelector('[data-testid="slideviewer-close"]').addEventListener('click', closeSlideViewer);
  overlay.querySelector('[data-testid="slideviewer-prev"]').addEventListener('click', () => go(-1));
  overlay.querySelector('[data-testid="slideviewer-next"]').addEventListener('click', () => go(1));
  overlay.querySelector('[data-testid="slideviewer-notes-toggle"]').addEventListener('click', () => {
    view.notesOn = !view.notesOn;
    paint();
  });
  overlay.querySelectorAll('[data-deck]').forEach((btn) => {
    btn.addEventListener('click', () => { loadDeck(Number(btn.dataset.deck)); paint(); });
  });
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
}

export function closeSlideViewer() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  if (returnFocusTo && returnFocusTo.focus) returnFocusTo.focus();
  returnFocusTo = null;
}
