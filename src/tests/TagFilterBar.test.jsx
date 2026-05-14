import { describe, expect, it, beforeEach } from 'vitest';
import { createTagFilterBar, filterFromQuery, filterToQuery } from '../components/TagFilterBar.js';

function mount(opts = {}) {
  document.body.innerHTML = '';
  const bar = createTagFilterBar(opts);
  document.body.appendChild(bar.element);
  return bar;
}

describe('TagFilterBar smoke', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('renders bar container and chip rows', () => {
    mount();
    expect(document.querySelector('[data-testid="tag-filter-bar"]')).toBeInTheDocument();
    for (const dim of ['level', 'series', 'difficulty', 'technique']) {
      expect(document.querySelector(`[data-testid="tag-filter-row-${dim}"]`)).toBeInTheDocument();
    }
  });

  it('clicking a chip toggles it and fires onChange with the active set', () => {
    let captured = null;
    const bar = mount({ onChange: (f) => { captured = f; } });
    document.querySelector('[data-testid="tag-chip-series-ai-assisted"]').click();
    expect(captured.series).toEqual(['ai-assisted']);
    expect(bar.getFilter().series).toEqual(['ai-assisted']);
  });

  it('clicking the same chip twice removes it', () => {
    const bar = mount();
    const chip = document.querySelector('[data-testid="tag-chip-level-unit"]');
    chip.click();
    expect(bar.getFilter().level).toEqual(['unit']);
    chip.click();
    expect(bar.getFilter().level).toEqual([]);
  });

  it('clear button resets all dims', () => {
    const bar = mount({ initial: { series: ['ai-assisted'], level: ['unit'] } });
    expect(bar.getFilter().series).toEqual(['ai-assisted']);
    document.querySelector('[data-testid="tag-filter-clear"]').click();
    expect(bar.getFilter().series).toEqual([]);
    expect(bar.getFilter().level).toEqual([]);
  });

  it('setFilter updates the chips visually', () => {
    const bar = mount();
    bar.setFilter({ technique: ['mutation'] });
    const chip = document.querySelector('[data-testid="tag-chip-technique-mutation"]');
    expect(chip.classList.contains('tag-chip--active')).toBe(true);
  });
});

describe('TagFilterBar URL query sync', () => {
  it('filterFromQuery parses comma-separated multi-values', () => {
    const f = filterFromQuery('?level=unit&technique=mutation,llm-guided&series=ai-assisted');
    expect(f.level).toEqual(['unit']);
    expect(f.technique).toEqual(['mutation', 'llm-guided']);
    expect(f.series).toEqual(['ai-assisted']);
    expect(f.difficulty).toEqual([]);
  });

  it('filterFromQuery handles empty / malformed input', () => {
    expect(filterFromQuery('').level).toEqual([]);
    expect(filterFromQuery('?').level).toEqual([]);
    expect(filterFromQuery('?level=').level).toEqual([]);
  });

  it('filterToQuery skips empty dims', () => {
    expect(filterToQuery({ level: [], technique: [], series: [], difficulty: [] })).toBe('');
    expect(filterToQuery({ level: ['unit'] })).toBe('?level=unit');
    expect(filterToQuery({ technique: ['mutation', 'llm-guided'] })).toBe('?technique=mutation%2Cllm-guided');
  });

  it('roundtrip: filterToQuery → filterFromQuery preserves values', () => {
    const original = { level: ['unit', 'system'], technique: ['mutation'], series: ['ai-assisted'], difficulty: ['research'] };
    const qs = filterToQuery(original);
    const parsed = filterFromQuery(qs);
    expect(parsed).toEqual(original);
  });
});
