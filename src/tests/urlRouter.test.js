import { describe, expect, it } from 'vitest';
import {
  TAB_SECTIONS,
  EXPLORER_TO_LOCATION,
  parseAppLocation,
  serializeLocation,
  explorerToUrl,
  sectionHasTabs,
  resolveInitialTab,
} from '../utils/urlRouter.js';
import { EXPLORER_TAGS } from '../data/explorerTags.js';

describe('K4 — urlRouter parse', () => {
  it('empty search returns empty state', () => {
    expect(parseAppLocation('')).toEqual({});
  });

  it('?section=blackbox returns { section }', () => {
    expect(parseAppLocation('?section=blackbox')).toEqual({ section: 'blackbox' });
  });

  it('?section=blackbox&tab=pairwise returns { section, tab }', () => {
    expect(parseAppLocation('?section=blackbox&tab=pairwise'))
      .toEqual({ section: 'blackbox', tab: 'pairwise' });
  });

  it('?tab= without matching section is ignored', () => {
    expect(parseAppLocation('?section=graph&tab=pairwise')).toEqual({ section: 'graph' });
  });

  it('unknown ?tab= for a tabbed section is ignored', () => {
    expect(parseAppLocation('?section=blackbox&tab=nope')).toEqual({ section: 'blackbox' });
  });

  it('?explorer= resolves to section + tab and wins over ?section/?tab', () => {
    const state = parseAppLocation('?explorer=PairwiseExplorer&section=graph');
    expect(state).toEqual({ explorer: 'PairwiseExplorer', section: 'blackbox', tab: 'pairwise' });
  });

  it('?explorer= for a non-tabbed section returns only section', () => {
    expect(parseAppLocation('?explorer=GraphCoverageExplorer'))
      .toEqual({ explorer: 'GraphCoverageExplorer', section: 'graph' });
  });

  it('unknown ?explorer= is ignored, falls through to other params', () => {
    expect(parseAppLocation('?explorer=NoSuch&section=fuzz')).toEqual({ section: 'fuzz' });
  });

  it('?explorer=ProgramSlicingExplorer resolves to slicing section, program tab', () => {
    expect(parseAppLocation('?explorer=ProgramSlicingExplorer'))
      .toEqual({ explorer: 'ProgramSlicingExplorer', section: 'slicing', tab: 'program' });
  });

  it('?explorer=SliceDicingExplorer resolves to slicing section, dicing tab', () => {
    expect(parseAppLocation('?explorer=SliceDicingExplorer'))
      .toEqual({ explorer: 'SliceDicingExplorer', section: 'slicing', tab: 'dicing' });
  });

  it('?explorer=SliceCoverageExplorer resolves to slicing section, coverage tab', () => {
    expect(parseAppLocation('?explorer=SliceCoverageExplorer'))
      .toEqual({ explorer: 'SliceCoverageExplorer', section: 'slicing', tab: 'coverage' });
  });

  it('?explorer=SliceRegressionExplorer resolves to slicing section, regression tab', () => {
    expect(parseAppLocation('?explorer=SliceRegressionExplorer'))
      .toEqual({ explorer: 'SliceRegressionExplorer', section: 'slicing', tab: 'regression' });
  });

  it('?explorer=TddCycleExplorer resolves to tdd section, cycle tab', () => {
    expect(parseAppLocation('?explorer=TddCycleExplorer'))
      .toEqual({ explorer: 'TddCycleExplorer', section: 'tdd', tab: 'cycle' });
  });

  it('?explorer=TddRulesExplorer resolves to tdd section, rules tab', () => {
    expect(parseAppLocation('?explorer=TddRulesExplorer'))
      .toEqual({ explorer: 'TddRulesExplorer', section: 'tdd', tab: 'rules' });
  });

  it('?pack= is captured', () => {
    expect(parseAppLocation('?pack=ai-assisted')).toEqual({ pack: 'ai-assisted' });
  });

  it('filter dims parse as comma-separated arrays', () => {
    const state = parseAppLocation('?level=unit,system&technique=mutation');
    expect(state.filter).toEqual({
      level: ['unit', 'system'], technique: ['mutation'], series: [], difficulty: [],
    });
  });

  it('combined: pack + section + tab + filter', () => {
    const state = parseAppLocation('?section=blackbox&tab=pairwise&pack=blackbox&level=system');
    expect(state.section).toBe('blackbox');
    expect(state.tab).toBe('pairwise');
    expect(state.pack).toBe('blackbox');
    expect(state.filter.level).toEqual(['system']);
  });
});

describe('K4 — urlRouter serialize', () => {
  it('empty state → empty string', () => {
    expect(serializeLocation({})).toBe('');
    expect(serializeLocation({ section: 'all' })).toBe('');
  });

  it('section only', () => {
    expect(serializeLocation({ section: 'blackbox' })).toBe('?section=blackbox');
  });

  it('section + tab (tab valid for section)', () => {
    expect(serializeLocation({ section: 'blackbox', tab: 'pairwise' }))
      .toBe('?section=blackbox&tab=pairwise');
  });

  it('section + tab where section has no tabs drops the tab', () => {
    expect(serializeLocation({ section: 'graph', tab: 'pairwise' })).toBe('?section=graph');
  });

  it('pack only', () => {
    expect(serializeLocation({ pack: 'ai-assisted' })).toBe('?pack=ai-assisted');
  });

  it('pack overrides filter params', () => {
    const out = serializeLocation({
      pack: 'ai-assisted',
      filter: { level: ['unit'], technique: ['mutation'], series: [], difficulty: [] },
    });
    expect(out).toBe('?pack=ai-assisted');
  });

  it('filter without pack emits dim params', () => {
    const out = serializeLocation({
      filter: { level: ['unit'], technique: ['mutation'], series: [], difficulty: [] },
    });
    expect(out).toContain('level=unit');
    expect(out).toContain('technique=mutation');
  });

  it('section + filter coexist', () => {
    const out = serializeLocation({
      section: 'blackbox',
      filter: { level: ['unit'], technique: [], series: [], difficulty: [] },
    });
    expect(out).toContain('section=blackbox');
    expect(out).toContain('level=unit');
  });
});

describe('K4 — round-trip', () => {
  it('section + tab + pack round-trip preserves state', () => {
    const original = { section: 'advanced', tab: 'equivmutant', pack: 'ai-assisted' };
    const qs = serializeLocation(original);
    const parsed = parseAppLocation(qs);
    expect(parsed.section).toBe('advanced');
    expect(parsed.tab).toBe('equivmutant');
    expect(parsed.pack).toBe('ai-assisted');
  });

  it('section + filter round-trip preserves filter values', () => {
    const original = {
      section: 'all',  // dropped on write
      filter: { level: ['unit', 'system'], technique: ['mutation'], series: [], difficulty: [] },
    };
    const qs = serializeLocation(original);
    const parsed = parseAppLocation(qs);
    expect(parsed.filter).toEqual(original.filter);
  });
});

describe('K4 — EXPLORER_TO_LOCATION', () => {
  it('covers every entry in EXPLORER_TAGS', () => {
    for (const id of Object.keys(EXPLORER_TAGS)) {
      expect(EXPLORER_TO_LOCATION, `missing ${id}`).toHaveProperty(id);
    }
  });

  it('every location names an existing section, and tab matches TAB_SECTIONS', () => {
    for (const [name, loc] of Object.entries(EXPLORER_TO_LOCATION)) {
      expect(loc.section, `${name} has section`).toBeTruthy();
      if (loc.tab) {
        const info = TAB_SECTIONS[loc.section];
        expect(info, `${name}: ${loc.section} has tab info`).toBeTruthy();
        expect(info.tabs, `${name}: tab ${loc.tab} valid for ${loc.section}`).toContain(loc.tab);
      }
    }
  });
});

describe('K4 — explorerToUrl', () => {
  it('returns ?explorer= form without baseUrl', () => {
    expect(explorerToUrl('PairwiseExplorer')).toBe('?explorer=PairwiseExplorer');
  });

  it('returns absolute URL with baseUrl', () => {
    expect(explorerToUrl('PairwiseExplorer', 'https://example.com/'))
      .toBe('https://example.com/?explorer=PairwiseExplorer');
  });

  it('unknown component returns baseUrl (or empty)', () => {
    expect(explorerToUrl('NoSuchExplorer')).toBe('');
    expect(explorerToUrl('NoSuchExplorer', 'https://example.com/')).toBe('https://example.com/');
  });
});

describe('K4 — resolveInitialTab', () => {
  it('URL wins when section matches and tab is valid', () => {
    const tab = resolveInitialTab({
      sectionId: 'blackbox',
      urlSection: 'blackbox',
      urlTab: 'pairwise',
      saved: 'bva',
    });
    expect(tab).toBe('pairwise');
  });

  it('falls through to saved value when URL section does not match', () => {
    const tab = resolveInitialTab({
      sectionId: 'blackbox',
      urlSection: 'graph',
      urlTab: 'pairwise',
      saved: 'ec',
    });
    expect(tab).toBe('ec');
  });

  it('falls through to default when nothing usable', () => {
    const tab = resolveInitialTab({
      sectionId: 'blackbox',
      urlSection: null,
      urlTab: null,
      saved: 'invalid-id',
    });
    expect(tab).toBe('bva');
  });

  it('returns null for sections without tabs', () => {
    const tab = resolveInitialTab({
      sectionId: 'graph',
      urlSection: 'graph',
      urlTab: 'whatever',
      saved: null,
    });
    expect(tab).toBeNull();
  });

  it('sectionHasTabs reports correctly', () => {
    expect(sectionHasTabs('blackbox')).toBe(true);
    expect(sectionHasTabs('advanced')).toBe(true);
    expect(sectionHasTabs('graph')).toBe(false);
    expect(sectionHasTabs('all')).toBe(false);
  });
});

describe('K — ?lang= URL lock', () => {
  it('?lang=en is parsed into { lang }', () => {
    expect(parseAppLocation('?lang=en')).toEqual({ lang: 'en' });
  });
  it('an unsupported ?lang= value is ignored', () => {
    expect(parseAppLocation('?lang=fr')).toEqual({});
  });
  it('serializeLocation emits ?lang=', () => {
    expect(serializeLocation({ lang: 'zh' })).toBe('?lang=zh');
  });
  it('lang round-trips alongside a section', () => {
    const qs = serializeLocation({ lang: 'en', section: 'graph' });
    expect(parseAppLocation(qs)).toEqual({ lang: 'en', section: 'graph' });
  });
});

describe('K — #section anchor', () => {
  it('a #section-<id> hash resolves a section when no query section', () => {
    expect(parseAppLocation('', '#section-graph')).toEqual({ section: 'graph' });
  });
  it('a query ?section= wins over a #section hash', () => {
    expect(parseAppLocation('?section=logic', '#section-graph'))
      .toEqual({ section: 'logic' });
  });
  it('a query ?explorer= wins over a #section hash', () => {
    const state = parseAppLocation('?explorer=PairwiseExplorer', '#section-graph');
    expect(state.section).toBe('blackbox');
  });
  it('a non-section hash (skip-link) is ignored', () => {
    expect(parseAppLocation('', '#app-main')).toEqual({});
  });
  it('parseAppLocation still works when called with no hash argument', () => {
    expect(parseAppLocation('?section=graph')).toEqual({ section: 'graph' });
  });
});
