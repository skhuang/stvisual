import { describe, expect, it, beforeEach } from 'vitest';
import { createSliceCoverageExplorer } from '../components/SliceCoverageExplorer.js';

describe('SliceCoverageExplorer', () => {
  let root;
  beforeEach(() => {
    root = createSliceCoverageExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and example chips', () => {
    expect(root.dataset.testid).toBe('slice-coverage-explorer');
    expect(root.querySelector('[data-testid="coverage-example-classify"]')).toBeTruthy();
  });

  it('shows both a slice-coverage and a statement-coverage metric', () => {
    const metrics = root.querySelector('[data-testid="coverage-metrics"]');
    expect(metrics).toBeTruthy();
    expect(root.querySelector('[data-testid="coverage-slice-pct"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="coverage-stmt-pct"]')).toBeTruthy();
  });

  it('toggling a trace out of the suite opens a slice-coverage gap', () => {
    root.querySelector('[data-testid="coverage-example-classify"]').click();
    // all traces on → the classify `label` slice is fully covered, no s8 gap
    expect(root.querySelector('[data-testid="coverage-gaps"]').textContent)
      .not.toContain('s8');
    // 'neg' is the only trace that executes s8 — drop it
    root.querySelector('[data-testid="coverage-trace-neg"]').click();
    expect(root.querySelector('[data-testid="coverage-gaps"]').textContent)
      .toContain('s8');
  });

  it('zoom-in increases the PDG svg width and zoom-out clamps at the minimum', () => {
    const svgWidth = () => root.querySelector('.pdg-svg').style.width;

    // default zoom is 100%
    expect(svgWidth()).toBe('100%');

    // zoom in once → 125%
    root.querySelector('[data-testid="coverage-zoom-in"]').click();
    expect(svgWidth()).toBe('125%');

    // zoom out many times to reach the floor (ZOOM_MIN = 0.5 → 50%)
    for (let i = 0; i < 10; i++) {
      root.querySelector('[data-testid="coverage-zoom-out"]').click();
    }
    expect(svgWidth()).toBe('50%');
  });

  it('switching examples resets all trace chips to active', () => {
    // start on the default example (grade-average), toggle a trace off
    root.querySelector('[data-testid="coverage-trace-fail"]').click();
    expect(root.querySelector('[data-testid="coverage-trace-fail"]').classList.contains('sce-chip--active'))
      .toBe(false);

    // switch to the classify example
    root.querySelector('[data-testid="coverage-example-classify"]').click();

    // all three classify traces should now be active
    const traceIds = ['pos', 'neg', 'zero'];
    for (const id of traceIds) {
      const chip = root.querySelector(`[data-testid="coverage-trace-${id}"]`);
      expect(chip, `trace chip "${id}" should exist`).toBeTruthy();
      expect(chip.classList.contains('sce-chip--active'),
        `trace chip "${id}" should be active after example switch`).toBe(true);
    }
  });
});
