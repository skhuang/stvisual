import { describe, expect, it, beforeEach } from 'vitest';
import { createSliceRegressionExplorer } from '../components/SliceRegressionExplorer.js';
import { SLICING_EXAMPLES } from '../data/slicingExamples.js';

describe('SliceRegressionExplorer', () => {
  let root;
  beforeEach(() => {
    root = createSliceRegressionExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and example chips', () => {
    expect(root.dataset.testid).toBe('slice-regression-explorer');
    expect(root.querySelector('[data-testid="regression-example-classify"]')).toBeTruthy();
  });

  it('has a static/dynamic mode toggle and a test-suite panel', () => {
    expect(root.querySelector('[data-testid="regression-mode-static"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="regression-mode-dynamic"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="regression-tests"]')).toBeTruthy();
  });

  it('picking an edit then switching to dynamic mode moves a test to safe', () => {
    root.querySelector('[data-testid="regression-example-classify"]').click();
    // mark s3 (`sign = 0`) as the edited statement — dead w.r.t. the `label` output
    root.querySelector('[data-stmt="s3"]').click();
    // static: every classify trace executes s3 → all must re-run
    root.querySelector('[data-testid="regression-mode-static"]').click();
    const staticText = root.querySelector('[data-testid="regression-metric"]').textContent;
    // dynamic: sign never reaches label → nothing must re-run
    root.querySelector('[data-testid="regression-mode-dynamic"]').click();
    const dynamicText = root.querySelector('[data-testid="regression-metric"]').textContent;
    expect(staticText).not.toEqual(dynamicText);
  });

  it('static mode: every classify trace gets the must-rerun badge when s3 (sign=0) is the edit', () => {
    root.querySelector('[data-testid="regression-example-classify"]').click();
    root.querySelector('[data-stmt="s3"]').click();
    root.querySelector('[data-testid="regression-mode-static"]').click();

    // Discover trace ids from the rendered rows rather than hard-coding
    const classifyExample = SLICING_EXAMPLES.find((e) => e.id === 'classify');
    const traceIds = classifyExample.traces.map((tr) => tr.id);

    // Every trace executes s3, so impact ({s3}) intersects every trace → must-rerun
    for (const id of traceIds) {
      const row = root.querySelector(`[data-testid="regression-test-${id}"]`);
      expect(row, `row for trace "${id}" should exist`).toBeTruthy();
      const badge = row.querySelector('.sre-badge--rerun');
      expect(badge, `trace "${id}" should carry the must-rerun badge in static mode`).toBeTruthy();
      expect(row.querySelector('.sre-badge--safe'),
        `trace "${id}" should NOT carry the safe badge in static mode`).toBeFalsy();
    }
  });

  it('dynamic mode: every classify trace gets the safe badge when s3 (sign=0) is the edit', () => {
    root.querySelector('[data-testid="regression-example-classify"]').click();
    root.querySelector('[data-stmt="s3"]').click();
    root.querySelector('[data-testid="regression-mode-dynamic"]').click();

    const classifyExample = SLICING_EXAMPLES.find((e) => e.id === 'classify');
    const traceIds = classifyExample.traces.map((tr) => tr.id);

    // sign never flows into the label output → s3 absent from every dynamic slice → safe
    for (const id of traceIds) {
      const row = root.querySelector(`[data-testid="regression-test-${id}"]`);
      expect(row, `row for trace "${id}" should exist`).toBeTruthy();
      const badge = row.querySelector('.sre-badge--safe');
      expect(badge, `trace "${id}" should carry the safe badge in dynamic mode`).toBeTruthy();
      expect(row.querySelector('.sre-badge--rerun'),
        `trace "${id}" should NOT carry the must-rerun badge in dynamic mode`).toBeFalsy();
    }
  });

  it('zoom-in increases the PDG svg width and zoom-out clamps at the minimum', () => {
    const svgWidth = () => root.querySelector('.pdg-svg').style.width;

    // default zoom is 100%
    expect(svgWidth()).toBe('100%');

    // zoom in once → 125%
    root.querySelector('[data-testid="regression-zoom-in"]').click();
    expect(svgWidth()).toBe('125%');

    // zoom out many times to reach the floor (ZOOM_MIN = 0.5 → 50%)
    for (let i = 0; i < 10; i++) {
      root.querySelector('[data-testid="regression-zoom-out"]').click();
    }
    expect(svgWidth()).toBe('50%');
  });

  it('clicking the edited statement again clears it and returns to the pick-a-statement prompt', () => {
    root.querySelector('[data-testid="regression-example-classify"]').click();
    root.querySelector('[data-stmt="s3"]').click();

    // Confirm a trace row is visible (edit is set)
    const classifyExample = SLICING_EXAMPLES.find((e) => e.id === 'classify');
    const firstTraceId = classifyExample.traces[0].id;
    expect(root.querySelector(`[data-testid="regression-test-${firstTraceId}"]`),
      'a regression-test row should exist after selecting s3').toBeTruthy();

    // Click s3 again to clear the selection
    root.querySelector('[data-stmt="s3"]').click();

    // No regression-test rows should remain
    const anyRow = root.querySelector('[data-testid^="regression-test-"]');
    expect(anyRow, 'no regression-test rows should be present after clearing the edit').toBeFalsy();

    // The pick-a-statement prompt should reappear
    const testsPanel = root.querySelector('[data-testid="regression-tests"]');
    expect(testsPanel.querySelector('.sre-pick-prompt'), 'pick-prompt element should reappear').toBeTruthy();
  });
});
