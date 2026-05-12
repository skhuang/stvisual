import { describe, expect, it } from 'vitest';
import { createLogicCoverageExplorer } from '../components/LogicCoverageExplorer.js';
import { logicCoverageCriteria, logicCoveragePredicates } from '../data/testingData.js';

function mount() {
  document.body.innerHTML = '';
  const el = createLogicCoverageExplorer();
  document.body.appendChild(el);
  return el;
}

describe('LogicCoverageExplorer smoke', () => {
  it('renders without throwing for the default predicate', () => {
    mount();
    expect(document.querySelector('[data-testid="logic-criterion-pc"]')).toBeInTheDocument();
  });

  it('switches through every coverage criterion without throwing', () => {
    mount();
    for (const c of logicCoverageCriteria) {
      const btn = document.querySelector(`[data-testid="logic-criterion-${c.id}"]`);
      expect(btn, `criterion ${c.id} button should exist`).toBeTruthy();
      // Any throw inside render() (e.g. the previous `t is not a function`
      // shadowing bugs) would surface here.
      expect(() => btn.click()).not.toThrow();
    }
  });
});

describe('LogicCoverageExplorer binding panel', () => {
  it('renders the clause binding panel', () => {
    mount();
    expect(document.querySelector('[data-testid="logic-binding"]')).toBeInTheDocument();
  });

  it('auto-fills bindings when a predicate example with defaultBindings is clicked', () => {
    mount();
    const exampleWithBindings = logicCoveragePredicates.find((p) => p.defaultBindings);
    if (!exampleWithBindings) return;
    const btn = document.querySelector(`[data-expression="${exampleWithBindings.expression}"]`);
    if (!btn) return;
    btn.click();
    const inputs = document.querySelectorAll('[data-testid^="logic-binding-input-"]');
    expect(inputs.length).toBeGreaterThan(0);
    const filled = [...inputs].some((inp) => inp.value.trim() !== '');
    expect(filled).toBe(true);
  });

  it('shows source code block when an example with sourceCode is selected', () => {
    mount();
    const exampleWithSource = logicCoveragePredicates.find((p) => p.sourceCode);
    if (!exampleWithSource) return;
    const btn = document.querySelector(`[data-expression="${exampleWithSource.expression}"]`);
    if (!btn) return;
    btn.click();
    expect(document.querySelector('[data-testid="logic-binding-source"]')).toBeInTheDocument();
  });

  it('shows restore button when a predicate example with defaultBindings is selected', () => {
    mount();
    const exampleWithBindings = logicCoveragePredicates.find((p) => p.defaultBindings);
    if (!exampleWithBindings) return;
    const btn = document.querySelector(`[data-expression="${exampleWithBindings.expression}"]`);
    if (!btn) return;
    btn.click();
    expect(document.querySelector('[data-testid="logic-binding-restore"]')).toBeInTheDocument();
  });

  it('renders binding results table after bindings are set', () => {
    mount();
    const exampleWithBindings = logicCoveragePredicates.find((p) => p.defaultBindings);
    if (!exampleWithBindings) return;
    const btn = document.querySelector(`[data-expression="${exampleWithBindings.expression}"]`);
    if (!btn) return;
    btn.click();
    expect(document.querySelector('[data-testid="logic-binding-results"]')).toBeInTheDocument();
  });

  it('renders range inputs', () => {
    mount();
    expect(document.querySelector('[data-testid="logic-binding-range-min"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="logic-binding-range-max"]')).toBeInTheDocument();
  });
});
