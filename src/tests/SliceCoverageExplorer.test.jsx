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
});
