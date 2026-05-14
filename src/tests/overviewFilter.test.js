import { describe, expect, it } from 'vitest';
import {
  SECTION_EXPLORERS,
  getSectionTags,
  sectionMatchesFilter,
} from '../data/explorerTags.js';

describe('K2 — section ↔ tag aggregation', () => {
  it('SECTION_EXPLORERS covers every Overview section card', () => {
    const expected = [
      'methods', 'flow', 'types', 'graph', 'logic', 'syntax', 'codecov',
      'groupth', 'symbex', 'concolic', 'fuzz', 'testgen', 'pbt', 'inttest',
      'rbt', 'blackbox', 'advanced',
    ];
    for (const id of expected) {
      expect(SECTION_EXPLORERS, `missing ${id}`).toHaveProperty(id);
      expect(SECTION_EXPLORERS[id].length, `${id} non-empty`).toBeGreaterThan(0);
    }
  });

  it('getSectionTags(\'advanced\') aggregates all 5 I-series tags', () => {
    const tags = getSectionTags('advanced');
    expect(tags.level.has('unit')).toBe(true);
    expect(tags.technique.has('mutation')).toBe(true);
    expect(tags.technique.has('llm-guided')).toBe(true);
    expect(tags.series.has('ai-assisted')).toBe(true);
    expect(tags.difficulty.has('research')).toBe(true);
    expect(tags.source.has('paper:arxiv-2501.12862')).toBe(true);
  });

  it('getSectionTags(\'blackbox\') includes pairwise and cause-effect', () => {
    const tags = getSectionTags('blackbox');
    expect(tags.technique.has('pairwise')).toBe(true);
    expect(tags.technique.has('cause-effect')).toBe(true);
    expect(tags.technique.has('boundary')).toBe(true);
    expect(tags.series.has('blackbox')).toBe(true);
  });

  it('sectionMatchesFilter: empty filter matches everything', () => {
    for (const id of Object.keys(SECTION_EXPLORERS)) {
      expect(sectionMatchesFilter(id, {})).toBe(true);
    }
  });

  it('sectionMatchesFilter: AND between dims, OR within a dim', () => {
    // advanced section: level=unit, technique∋mutation, series∋ai-assisted
    expect(sectionMatchesFilter('advanced', { series: ['ai-assisted'] })).toBe(true);
    expect(sectionMatchesFilter('advanced', { technique: ['mutation'] })).toBe(true);
    expect(sectionMatchesFilter('advanced', { technique: ['mutation'], series: ['ai-assisted'] })).toBe(true);
    expect(sectionMatchesFilter('advanced', { technique: ['mutation'], series: ['blackbox'] })).toBe(false);
    expect(sectionMatchesFilter('advanced', { technique: ['mutation', 'pairwise'] })).toBe(true); // OR
  });

  it('sectionMatchesFilter: filters out non-matching sections', () => {
    expect(sectionMatchesFilter('graph', { series: ['ai-assisted'] })).toBe(false);
    expect(sectionMatchesFilter('groupth', { difficulty: ['intro'] })).toBe(false);
    expect(sectionMatchesFilter('groupth', { difficulty: ['research'] })).toBe(true);
  });
});
