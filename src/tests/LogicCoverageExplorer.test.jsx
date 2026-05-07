import { describe, expect, it } from 'vitest';
import { createLogicCoverageExplorer } from '../components/LogicCoverageExplorer.js';
import { logicCoverageCriteria } from '../data/testingData.js';

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
