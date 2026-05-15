import { describe, expect, it } from 'vitest';
import {
  createEFSMGuardedTransitionExplorer,
  EFSM,
  PATHS,
  solvePath,
} from '../components/EFSMGuardedTransitionExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createEFSMGuardedTransitionExplorer();
  document.body.appendChild(el);
  return el;
}

describe('EFSM model + paths', () => {
  it('defines a guarded EFSM with an initial state', () => {
    expect(EFSM.states.length).toBeGreaterThan(0);
    expect(EFSM.transitions.length).toBeGreaterThan(0);
    expect(EFSM.states.some((s) => s.initial)).toBe(true);
    expect(EFSM.transitions.some((tr) => tr.guard && tr.guard !== 'true')).toBe(true);
  });

  it('ships five abstract test paths', () => {
    expect(PATHS).toHaveLength(5);
    for (const p of PATHS) expect(p.trans.length).toBeGreaterThan(0);
  });
});

describe('path feasibility solving', () => {
  it('marks contradictory-guard paths infeasible', () => {
    const pc = solvePath(PATHS.find((p) => p.id === 'PC'));
    const pd = solvePath(PATHS.find((p) => p.id === 'PD'));
    expect(pc.feasible).toBe(false);
    expect(pd.feasible).toBe(false);
  });

  it('marks satisfiable-guard paths feasible with a concrete witness', () => {
    const pa = solvePath(PATHS.find((p) => p.id === 'PA'));
    expect(pa.feasible).toBe(true);
    expect(typeof pa.witness.amount).toBe('number');
  });

  it('the witness amount satisfies every guard on the path', () => {
    for (const p of PATHS) {
      const res = solvePath(p);
      if (!res.feasible) continue;
      const amount = res.witness.amount;
      for (const g of res.guards) {
        // eslint-disable-next-line no-new-func
        const ok = new Function('amount', `return (${g});`)(amount);
        expect(ok, `${p.id}: ${g}`).toBe(true);
      }
    }
  });

  it('guards prune at least one graph path', () => {
    const feasible = PATHS.filter((p) => solvePath(p).feasible).length;
    expect(feasible).toBeLessThan(PATHS.length);
    expect(feasible).toBeGreaterThan(0);
  });
});

describe('EFSMGuardedTransitionExplorer smoke', () => {
  it('renders wrap, model table, and path row', () => {
    mount();
    expect(document.querySelector('[data-testid="efsm-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="efsm-model"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="efsm-path-row"]')).toBeInTheDocument();
  });

  it('renders a card for every abstract path', () => {
    mount();
    for (const p of PATHS) {
      expect(document.querySelector(`[data-testid="efsm-path-${p.id}"]`), p.id).toBeInTheDocument();
    }
  });

  it('selecting a path updates the detail panel and verdict', () => {
    mount();
    document.querySelector('[data-testid="efsm-path-PC"]').click();
    expect(
      document.querySelector('[data-testid="efsm-path-PC"]').classList.contains('efsm-path--active'),
    ).toBe(true);
    const verdict = document.querySelector('[data-testid="efsm-verdict"]');
    expect(verdict.classList.contains('efsm-verdict--infeasible')).toBe(true);
  });

  it('renders the FSM-vs-EFSM comparison', () => {
    mount();
    expect(document.querySelector('[data-testid="efsm-compare"]')).toBeInTheDocument();
  });

  it('exposes bridges to Symbolic Execution and Logic Coverage', () => {
    mount();
    expect(document.querySelector('[data-testid="efsm-bridge-symbex"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="efsm-bridge-logic"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="efsm-quiz-start"]').click();
    document.querySelector('input[name="efsm-quiz"][value="c"]').click();
    document.querySelector('[data-testid="efsm-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="efsm-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="efsm-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="efsm-quiz-start"]').click();
    document.querySelector('input[name="efsm-quiz"][value="a"]').click();
    document.querySelector('[data-testid="efsm-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="efsm-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="efsm-lab-start"]').click();
    expect(document.querySelector('[data-testid="efsm-lab-text"]')).toBeInTheDocument();
  });
});
