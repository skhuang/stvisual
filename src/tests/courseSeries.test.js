import { describe, expect, it } from 'vitest';
import {
  COURSE_PACKS,
  getCoursePack,
  getCoursePackExplorers,
  getCoursePackFilter,
} from '../data/courseSeries.js';
import { buildCoursePackMarkdown } from '../utils/coursePackExporter.js';
import { messages } from '../i18n/dict.js';

describe('K3 — course packs', () => {
  it('every pack has id, titleKey, descKey, filter', () => {
    for (const p of COURSE_PACKS) {
      expect(p.id).toBeTruthy();
      expect(p.titleKey).toMatch(/^pack\./);
      expect(p.descKey).toMatch(/^pack\./);
      expect(typeof p.filter).toBe('object');
    }
  });

  it('every pack resolves to at least one explorer', () => {
    for (const p of COURSE_PACKS) {
      const ids = getCoursePackExplorers(p.id);
      expect(ids.length, `pack ${p.id} explorer count`).toBeGreaterThan(0);
    }
  });

  it('AI-Assisted pack contains all 5 I-series explorers', () => {
    const ids = getCoursePackExplorers('ai-assisted');
    expect(ids).toContain('EquivalentMutantExplorer');
    expect(ids).toContain('MutationScoreExplorer');
    expect(ids).toContain('LLMPipelineExplorer');
    expect(ids).toContain('TestQualityExplorer');
    expect(ids).toContain('FaultDirectedTestingExplorer');
    expect(ids.length).toBe(5);
  });

  it('Mutation Track spans program mutation + I-series mutation explorers', () => {
    const ids = getCoursePackExplorers('mutation');
    expect(ids).toContain('SyntaxCoverageExplorer');
    expect(ids).toContain('SpecMutationExplorer');
    expect(ids).toContain('EquivalentMutantExplorer');
    expect(ids).toContain('FaultDirectedTestingExplorer');
  });

  it('Black-box pack covers the nine black-box explorers', () => {
    const ids = getCoursePackExplorers('blackbox');
    expect(ids.length).toBe(9);
  });

  it('getCoursePack returns null for unknown id', () => {
    expect(getCoursePack('no-such-pack')).toBeNull();
    expect(getCoursePackFilter('no-such-pack')).toBeNull();
    expect(getCoursePackExplorers('no-such-pack')).toEqual([]);
  });

  it('every pack has EN + ZH i18n keys', () => {
    for (const p of COURSE_PACKS) {
      expect(messages.en, `EN missing ${p.titleKey}`).toHaveProperty(p.titleKey);
      expect(messages.en, `EN missing ${p.descKey}`).toHaveProperty(p.descKey);
      expect(messages.zh, `ZH missing ${p.titleKey}`).toHaveProperty(p.titleKey);
      expect(messages.zh, `ZH missing ${p.descKey}`).toHaveProperty(p.descKey);
    }
  });
});

describe('K3 — Markdown exporter', () => {
  it('produces Markdown that includes title, every explorer ID, and the demo URL', () => {
    const md = buildCoursePackMarkdown('ai-assisted');
    expect(md.length).toBeGreaterThan(0);
    expect(md).toMatch(/^# /m); // H1 title
    expect(md).toContain('https://skhuang.github.io/stvisual/');
    for (const id of getCoursePackExplorers('ai-assisted')) {
      expect(md, `should mention ${id}`).toContain(id);
    }
  });

  it('renders tag line for tagged explorers', () => {
    const md = buildCoursePackMarkdown('ai-assisted');
    expect(md).toMatch(/\*\*Tags:\*\*/);
    expect(md).toMatch(/paper:arxiv-2501\.12862/);
  });

  it('returns empty string for an unknown pack', () => {
    expect(buildCoursePackMarkdown('no-such-pack')).toBe('');
  });
});
