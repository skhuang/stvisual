import { describe, expect, it } from 'vitest';
import {
  renderSlicePdgView,
  renderSliceCodeListing,
  renderSlicePdgGraph,
} from '../components/SlicePdgView.js';
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

describe('renderSliceCodeListing', () => {
  it('returns just the <ol> source listing', () => {
    const html = renderSliceCodeListing(ex, new Set(['s2']));
    expect(html.trimStart().startsWith('<ol class="slice-code"')).toBe(true);
    expect(html).not.toContain('<svg');
    expect(html).toMatch(/data-stmt="s2"[^>]*slice-stmt--in/);
  });
});

describe('renderSlicePdgGraph', () => {
  it('returns just the <svg> graph', () => {
    const html = renderSlicePdgGraph(ex, new Set());
    expect(html.trimStart().startsWith('<svg')).toBe(true);
    expect(html).toContain('data-pdg-node="s2"');
  });
  it('defaults to 100% width when no zoom is given', () => {
    expect(renderSlicePdgGraph(ex, new Set())).toContain('width:100%');
  });
  it('scales the svg width by the zoom option', () => {
    expect(renderSlicePdgGraph(ex, new Set(), { zoom: 2 })).toContain('width:200%');
  });
});

describe('secondary highlight', () => {
  it('renderSliceCodeListing marks secondary-only statements with --ctx', () => {
    const html = renderSliceCodeListing(ex, new Set(['s2']), { secondary: new Set(['s3']) });
    expect(html).toMatch(/data-stmt="s3"[^>]*slice-stmt--ctx/);
    // a statement in the primary slice keeps --in, not --ctx
    expect(html).toMatch(/data-stmt="s2"[^>]*slice-stmt--in/);
  });
  it('renderSlicePdgGraph marks secondary-only nodes with --ctx', () => {
    const html = renderSlicePdgGraph(ex, new Set(['s2']), { secondary: new Set(['s3']) });
    expect(html).toMatch(/data-pdg-node="s3"[^>]*pdg-node--ctx/);
  });
  it('omitting secondary leaves output unchanged (no --ctx)', () => {
    expect(renderSliceCodeListing(ex, new Set(['s2']))).not.toContain('--ctx');
  });
});
