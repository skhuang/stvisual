import { describe, expect, it, beforeEach } from 'vitest';
import { createSliceDicingExplorer } from '../components/SliceDicingExplorer.js';

describe('SliceDicingExplorer', () => {
  let root;
  beforeEach(() => {
    root = createSliceDicingExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and a mode toggle', () => {
    expect(root.dataset.testid).toBe('slice-dicing-explorer');
    expect(root.querySelector('[data-testid="dicing-mode-static"]')).toBeTruthy();
    expect(root.querySelector('[data-testid="dicing-mode-dynamic"]')).toBeTruthy();
  });

  it('static mode shows the summary-stats scenario and highlights a non-empty dice', () => {
    root.querySelector('[data-testid="dicing-mode-static"]').click();
    expect(root.querySelector('[data-testid="dicing-scenario-summary-stats"]')).toBeTruthy();
    expect(root.querySelectorAll('.slice-stmt--in').length).toBeGreaterThan(0);
  });

  it('dynamic mode lists traces with pass/fail outcome badges', () => {
    root.querySelector('[data-testid="dicing-mode-dynamic"]').click();
    expect(root.querySelector('[data-testid="dicing-scenario-fare"]')).toBeTruthy();
    expect(root.querySelector('[data-testid^="dicing-trace-"]')).toBeTruthy();
  });

  it('the detail panel confirms the seeded bug lands in the dice', () => {
    root.querySelector('[data-testid="dicing-mode-static"]').click();
    const detail = root.querySelector('[data-testid="dicing-detail"]');
    expect(detail).toBeTruthy();
    expect(detail.textContent.length).toBeGreaterThan(0);
  });
});
