import { describe, expect, it } from 'vitest';
import { renderSlicePdgView } from '../components/SlicePdgView.js';
import { SLICING_EXAMPLES } from '../data/slicingExamples.js';

const ex = SLICING_EXAMPLES.find((e) => e.id === 'grade-average');

describe('renderSlicePdgView', () => {
  it('renders one source line per source entry', () => {
    const html = renderSlicePdgView(ex, new Set());
    for (const line of ex.source) {
      expect(html).toContain(line.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
    }
  });
  it('marks sliced statements with the slice class', () => {
    const html = renderSlicePdgView(ex, new Set(['s2']));
    expect(html).toMatch(/data-stmt="s2"[^>]*slice-stmt--in/);
  });
  it('renders an svg dependence graph with a node per statement', () => {
    const html = renderSlicePdgView(ex, new Set());
    expect(html).toContain('<svg');
    expect(html).toContain('data-pdg-node="s2"');
  });
  it('highlights sliced nodes in the svg', () => {
    const html = renderSlicePdgView(ex, new Set(['s2']));
    expect(html).toMatch(/data-pdg-node="s2"[^>]*pdg-node--in|pdg-node--in[^>]*data-pdg-node="s2"/);
  });
});
