import { describe, expect, it, beforeEach } from 'vitest';
import { openSlideViewer, closeSlideViewer } from '../components/SlideViewer.js';

beforeEach(() => {
  document.body.innerHTML = '';
  closeSlideViewer();
});

describe('SlideViewer', () => {
  it('opens an overlay showing the first slide of a section deck', () => {
    openSlideViewer('graph');
    const overlay = document.querySelector('[data-testid="slideviewer"]');
    expect(overlay).toBeInTheDocument();
    expect(overlay.hasAttribute('hidden')).toBe(false);
    expect(document.querySelector('.slideviewer-panel')).toHaveAttribute('role', 'dialog');
    expect(document.activeElement).toBe(document.querySelector('[data-testid="slideviewer-close"]'));
    expect(document.querySelector('[data-testid="slideviewer-slide"]').innerHTML.trim()).not.toBe('');
  });

  it('advances and rewinds slides with the nav buttons', () => {
    openSlideViewer('graph');
    const counter = () => document.querySelector('[data-testid="slideviewer-counter"]').textContent;
    const first = counter();
    document.querySelector('[data-testid="slideviewer-next"]').click();
    expect(counter()).not.toBe(first);
    document.querySelector('[data-testid="slideviewer-prev"]').click();
    expect(counter()).toBe(first);
  });

  it('toggles the speaker-notes panel', () => {
    openSlideViewer('graph');
    const notes = document.querySelector('[data-testid="slideviewer-notes"]');
    expect(notes.hasAttribute('hidden')).toBe(true);
    document.querySelector('[data-testid="slideviewer-notes-toggle"]').click();
    expect(document.querySelector('[data-testid="slideviewer-notes"]').hasAttribute('hidden')).toBe(false);
  });

  it('shows a deck selector when the section owns more than one deck', () => {
    openSlideViewer('graph'); // graph owns decks 3 + 4
    expect(document.querySelectorAll('[data-testid^="slideviewer-deck-"]').length).toBeGreaterThan(1);
  });

  it('closes the overlay', () => {
    openSlideViewer('graph');
    document.querySelector('[data-testid="slideviewer-close"]').click();
    expect(document.querySelector('[data-testid="slideviewer"]')).toBeNull();
  });

  it('supports Home and End keyboard navigation', () => {
    openSlideViewer('graph');
    const counter = () => document.querySelector('[data-testid="slideviewer-counter"]').textContent;
    window.document.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(counter()).toContain('/ ');
    expect(document.querySelector('[data-testid="slideviewer-next"]')).toBeDisabled();
    window.document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(counter()).toMatch(/1\s*\//);
    expect(document.querySelector('[data-testid="slideviewer-prev"]')).toBeDisabled();
  });

  it('keeps tab focus inside the viewer', () => {
    openSlideViewer('graph');
    const firstDeck = document.querySelector('[data-testid="slideviewer-deck-0"]');
    const notesToggle = document.querySelector('[data-testid="slideviewer-notes-toggle"]');
    notesToggle.focus();
    window.document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(firstDeck);
    firstDeck.focus();
    window.document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(notesToggle);
  });
});
