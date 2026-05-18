import { describe, expect, it, beforeEach } from 'vitest';
import { createProgramSlicingExplorer } from '../components/ProgramSlicingExplorer.js';

describe('ProgramSlicingExplorer', () => {
  let root;
  beforeEach(() => {
    root = createProgramSlicingExplorer();
    document.body.appendChild(root);
  });

  it('renders with the root testid and example chips', () => {
    expect(root.dataset.testid).toBe('program-slicing-explorer');
    expect(root.querySelector('[data-testid="slicing-example-grade-average"]')).toBeTruthy();
  });

  it('selecting a statement then a variable highlights a non-empty slice', () => {
    const stmt = root.querySelector('[data-stmt]');
    stmt.click();
    const varBtn = root.querySelector('[data-testid^="slicing-var-"]');
    varBtn.click();
    expect(root.querySelectorAll('.slice-stmt--in').length).toBeGreaterThan(0);
  });

  it('switching to dynamic mode reveals a trace picker', () => {
    root.querySelector('[data-testid="slicing-mode-dynamic"]').click();
    expect(root.querySelector('[data-testid^="slicing-trace-"]')).toBeTruthy();
  });
});
