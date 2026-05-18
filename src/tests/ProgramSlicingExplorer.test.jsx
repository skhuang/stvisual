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

  it('lays the PDG graph and the statements-in-slice panel side by side', () => {
    const row = root.querySelector('.pse-graph-row');
    expect(row).toBeTruthy();
    const graph = row.querySelector('[data-testid="slicing-graph"]');
    const list = row.querySelector('[data-testid="slicing-slice-list"]');
    expect(graph).toBeTruthy();
    expect(list).toBeTruthy();
    // graph before slice-list → graph on the left
    expect(graph.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
  });

  it('lists each sliced statement in the statements-in-slice panel', () => {
    root.querySelector('[data-stmt]').click();
    root.querySelector('[data-testid^="slicing-var-"]').click();
    const items = root.querySelectorAll('[data-testid^="slicing-slice-item-"]');
    expect(items.length).toBeGreaterThan(0);
  });

  it('renders the variable picker at the top of the right-hand panel', () => {
    root.querySelector('[data-stmt]').click();
    const panel = root.querySelector('[data-testid="slicing-slice-list"]');
    const varBtn = panel.querySelector('[data-testid^="slicing-var-"]');
    // the variable picker lives inside the right panel...
    expect(varBtn).toBeTruthy();
    // ...above the statements-in-slice heading
    const title = panel.querySelector('.pse-col-title');
    expect(varBtn.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
  });

  it('zooms the PDG graph in and out', () => {
    const val = () => root.querySelector('[data-testid="slicing-zoom-val"]').textContent.trim();
    expect(val()).toBe('100%');
    root.querySelector('[data-testid="slicing-zoom-in"]').click();
    expect(val()).toBe('125%');
    root.querySelector('[data-testid="slicing-zoom-out"]').click();
    root.querySelector('[data-testid="slicing-zoom-out"]').click();
    expect(val()).toBe('75%');
  });
});
