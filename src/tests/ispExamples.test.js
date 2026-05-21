import { describe, expect, it } from 'vitest';
import { ISP_EXAMPLES } from '../data/ispExamples.js';
import { messages } from '../i18n/dict.js';

describe('ISP examples', () => {
  it('ships at least three IDMs', () => {
    expect(ISP_EXAMPLES.length).toBeGreaterThanOrEqual(3);
  });

  for (const ex of ISP_EXAMPLES) {
    describe(`IDM: ${ex.id}`, () => {
      it('has a nameKey that resolves in en and zh', () => {
        expect(messages.en[ex.nameKey], `${ex.nameKey} (en)`).toBeTruthy();
        expect(messages.zh[ex.nameKey], `${ex.nameKey} (zh)`).toBeTruthy();
      });
      it('has ≥1 characteristic, each with ≥2 blocks and an in-range baseIndex', () => {
        expect(ex.characteristics.length).toBeGreaterThanOrEqual(1);
        for (const c of ex.characteristics) {
          expect(typeof c.name).toBe('string');
          expect(c.name.length).toBeGreaterThan(0);
          expect(c.blocks.length).toBeGreaterThanOrEqual(2);
          expect(c.baseIndex).toBeGreaterThanOrEqual(0);
          expect(c.baseIndex).toBeLessThan(c.blocks.length);
        }
      });
    });
  }
});
