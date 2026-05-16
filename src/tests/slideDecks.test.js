import { describe, expect, it } from 'vitest';
import { SLIDE_DECKS } from '../data/slideDecks.generated.js';

describe('slide deck data', () => {
  it('ships 13 decks, each with both languages and a title', () => {
    expect(SLIDE_DECKS).toHaveLength(13);
    for (const d of SLIDE_DECKS) {
      expect(d.en.length, d.id).toBeGreaterThan(0);
      expect(d.zh.length, d.id).toBeGreaterThan(0);
      expect(d.titleEn, d.id).toBeTruthy();
      expect(d.titleZh, d.id).toBeTruthy();
    }
  });

  it('every deck is attached to a section', () => {
    for (const d of SLIDE_DECKS) expect(typeof d.section, d.id).toBe('string');
  });

  it('rewrites screenshot paths to the bundled location', () => {
    for (const d of SLIDE_DECKS) {
      expect(d.en.includes('../assets/slides/'), d.id).toBe(false);
      expect(d.zh.includes('../assets/slides/'), d.id).toBe(false);
    }
  });
});
