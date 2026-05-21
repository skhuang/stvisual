import { describe, expect, it } from 'vitest';
import { SECTION_TAXONOMY, SECTION_ORDER } from '../data/sectionTaxonomy.js';
import { messages } from '../i18n/dict.js';

// Every section id known to the app, as a flat list — this is the set the
// taxonomy must categorise. Keep this in sync with learningSectionsConfig
// in src/app.js (minus the 'all' meta-section).
const EXPECTED_SECTION_IDS = [
  'methods', 'flow', 'types', 'codecov',
  'blackbox', 'pbt',
  'graph', 'mbt', 'slicing',
  'logic', 'groupth',
  'syntax',
  'symbex', 'concolic', 'fuzz', 'testgen', 'exploit', 'sbst',
  'tdd', 'acceptance', 'agile', 'inttest',
  'advanced', 'rbt',
];

describe('Section taxonomy', () => {
  it('exports exactly 8 categories', () => {
    expect(SECTION_TAXONOMY.length).toBe(8);
  });

  it('every category has id, labelKey, and a non-empty sectionIds array', () => {
    for (const cat of SECTION_TAXONOMY) {
      expect(typeof cat.id, `category id`).toBe('string');
      expect(cat.id.length, `category id non-empty`).toBeGreaterThan(0);
      expect(typeof cat.labelKey, `${cat.id}.labelKey`).toBe('string');
      expect(cat.labelKey.startsWith('taxonomy.'), `${cat.id}.labelKey prefix`).toBe(true);
      expect(Array.isArray(cat.sectionIds), `${cat.id}.sectionIds`).toBe(true);
      expect(cat.sectionIds.length, `${cat.id}.sectionIds non-empty`).toBeGreaterThan(0);
    }
  });

  it('covers every expected section id exactly once', () => {
    const flat = SECTION_TAXONOMY.flatMap((c) => c.sectionIds);
    expect(new Set(flat).size, 'duplicate section id in taxonomy').toBe(flat.length);
    expect([...flat].sort()).toEqual([...EXPECTED_SECTION_IDS].sort());
  });

  it('SECTION_ORDER matches the flattened taxonomy', () => {
    expect(SECTION_ORDER).toEqual(SECTION_TAXONOMY.flatMap((c) => c.sectionIds));
  });

  it('every category label has en and zh translations', () => {
    for (const cat of SECTION_TAXONOMY) {
      expect(messages.en[cat.labelKey], `${cat.labelKey} (en)`).toBeTruthy();
      expect(messages.zh[cat.labelKey], `${cat.labelKey} (zh)`).toBeTruthy();
    }
  });
});
