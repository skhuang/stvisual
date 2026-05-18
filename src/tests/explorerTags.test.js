import { describe, expect, it } from 'vitest';
import {
  EXPLORER_TAGS,
  TAG_LEVELS,
  TAG_TECHNIQUES,
  TAG_SERIES,
  TAG_DIFFICULTY,
  filterExplorersByTag,
  listExplorersInSeries,
  getExplorerTags,
} from '../data/explorerTags.js';
import { messages } from '../i18n/dict.js';

describe('Explorer tag metadata (K1)', () => {
  const ids = Object.keys(EXPLORER_TAGS);

  it('registers at least 34 explorers', () => {
    expect(ids.length).toBeGreaterThanOrEqual(34);
  });

  it('every entry has level, technique, and series arrays', () => {
    for (const id of ids) {
      const tags = EXPLORER_TAGS[id];
      expect(Array.isArray(tags.level), `${id}.level`).toBe(true);
      expect(tags.level.length, `${id}.level non-empty`).toBeGreaterThan(0);
      expect(Array.isArray(tags.technique), `${id}.technique`).toBe(true);
      expect(tags.technique.length, `${id}.technique non-empty`).toBeGreaterThan(0);
      expect(Array.isArray(tags.series), `${id}.series`).toBe(true);
      expect(tags.series.length, `${id}.series non-empty`).toBeGreaterThan(0);
    }
  });

  it('every level / technique / series value comes from the controlled vocab', () => {
    for (const id of ids) {
      const tags = EXPLORER_TAGS[id];
      for (const lv of tags.level)        expect(TAG_LEVELS,     `${id}.level=${lv}`).toContain(lv);
      for (const t of tags.technique)     expect(TAG_TECHNIQUES, `${id}.technique=${t}`).toContain(t);
      for (const s of tags.series)        expect(TAG_SERIES,     `${id}.series=${s}`).toContain(s);
    }
  });

  it('optional difficulty (if present) is from the controlled vocab', () => {
    for (const id of ids) {
      const d = EXPLORER_TAGS[id].difficulty;
      if (d !== undefined) expect(TAG_DIFFICULTY, `${id}.difficulty=${d}`).toContain(d);
    }
  });

  it('optional source values follow textbook|paper:*|standard:* shape', () => {
    const pattern = /^(textbook|paper:[\w.-]+|standard:[\w.-]+)$/;
    for (const id of ids) {
      const src = EXPLORER_TAGS[id].source;
      if (!src) continue;
      expect(Array.isArray(src), `${id}.source array`).toBe(true);
      for (const v of src) expect(v, `${id}.source=${v}`).toMatch(pattern);
    }
  });

  it('matches the component files actually shipped under src/components/', async () => {
    const componentFiles = import.meta.glob('../components/*.js', { eager: false });
    const componentNames = Object.keys(componentFiles)
      .map((p) => p.split('/').pop().replace(/\.js$/, ''))
      .filter((n) => !['CloudStoragePanel', 'TeacherDashboard', 'ResultViewer', 'TagFilterBar', 'CoursePackBar', 'SlideViewer', 'SlicePdgView'].includes(n));
    for (const name of componentNames) {
      expect(EXPLORER_TAGS, `missing tag entry for ${name}`).toHaveProperty(name);
    }
  });

  it('i18n keys exist (EN and ZH) for every controlled-vocab value', () => {
    const checks = [
      ...TAG_LEVELS.map((v) => `tag.level.${v}`),
      ...TAG_TECHNIQUES.map((v) => `tag.technique.${v}`),
      ...TAG_SERIES.map((v) => `tag.series.${v}`),
      ...TAG_DIFFICULTY.map((v) => `tag.difficulty.${v}`),
      'tag.source.textbook',
      'tag.source.paper.arxiv-2501.12862',
    ];
    for (const key of checks) {
      expect(messages.en, `EN missing ${key}`).toHaveProperty(key);
      expect(messages.zh, `ZH missing ${key}`).toHaveProperty(key);
    }
  });

  it('filterExplorersByTag finds AI-assisted explorers', () => {
    const ai = filterExplorersByTag('series', 'ai-assisted');
    expect(ai).toContain('EquivalentMutantExplorer');
    expect(ai).toContain('FaultDirectedTestingExplorer');
    expect(ai).toContain('SAILORPipelineExplorer');
    expect(ai.length).toBe(6);
  });

  it('listExplorersInSeries(\'blackbox\') returns the nine black-box explorers', () => {
    const bb = listExplorersInSeries('blackbox');
    expect(bb.length).toBe(9);
    expect(bb).toContain('BoundaryValueExplorer');
    expect(bb).toContain('PairwiseExplorer');
  });

  it('getExplorerTags returns null for unknown id', () => {
    expect(getExplorerTags('NoSuchExplorer')).toBeNull();
  });
});
