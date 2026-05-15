import { describe, expect, it } from 'vitest';
import {
  createFSMTestGenerationExplorer,
  FSMS,
  CRITERIA,
  genStateCoverage,
  genTransitionCoverage,
  genTransitionPairCoverage,
  genRoundTrip,
  transitionTour,
} from '../components/FSMTestGenerationExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createFSMTestGenerationExplorer();
  document.body.appendChild(el);
  return el;
}

describe('FSM test-generation data', () => {
  it('ships three preset state machines, each with states and transitions', () => {
    expect(FSMS.length).toBe(3);
    for (const fsm of FSMS) {
      expect(fsm.states.length, fsm.id).toBeGreaterThan(0);
      expect(fsm.transitions.length, fsm.id).toBeGreaterThan(0);
      expect(fsm.states.some((s) => s.initial), fsm.id).toBe(true);
    }
  });

  it('defines the four canonical generation criteria', () => {
    expect(CRITERIA.map((c) => c.id)).toEqual([
      'state', 'transition', 'pair', 'roundtrip',
    ]);
  });
});

describe('FSM generators', () => {
  it('state coverage visits every state', () => {
    for (const fsm of FSMS) {
      const result = genStateCoverage(fsm);
      const visited = new Set();
      const init = (fsm.states.find((s) => s.initial) || fsm.states[0]).id;
      visited.add(init);
      for (const test of result.tests) {
        for (const tr of test) { visited.add(tr.from); visited.add(tr.to); }
      }
      expect(visited.size, fsm.id).toBe(fsm.states.length);
    }
  });

  it('transition coverage fires every transition at least once', () => {
    for (const fsm of FSMS) {
      const result = genTransitionCoverage(fsm);
      const fired = new Set();
      for (const test of result.tests) for (const tr of test) fired.add(tr.id);
      expect(fired.size, fsm.id).toBe(fsm.transitions.length);
    }
  });

  it('transition-pair coverage has at least as many obligations as transition coverage', () => {
    for (const fsm of FSMS) {
      const pair = genTransitionPairCoverage(fsm);
      const trans = genTransitionCoverage(fsm);
      expect(pair.obligations, fsm.id).toBeGreaterThanOrEqual(trans.obligations);
    }
  });

  it('round-trip coverage produces a test per simple cycle', () => {
    const result = genRoundTrip(FSMS[2]); // vending — has a self-loop + cycles
    expect(result.obligations).toBeGreaterThan(0);
    expect(result.tests.length).toBeGreaterThan(0);
  });
});

describe('Chinese-Postman transition tour', () => {
  it('tour length is never below the transition count', () => {
    for (const fsm of FSMS) {
      const tour = transitionTour(fsm);
      expect(tour.transitionCount, fsm.id).toBe(fsm.transitions.length);
      expect(tour.tourLength, fsm.id).toBeGreaterThanOrEqual(tour.transitionCount);
      expect(tour.extra, fsm.id).toBe(tour.tourLength - tour.transitionCount);
    }
  });
});

describe('FSMTestGenerationExplorer smoke', () => {
  it('renders wrap, FSM picker, and transition table', () => {
    mount();
    expect(document.querySelector('[data-testid="fsmgen-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="fsmgen-fsm-row"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="fsmgen-model"]')).toBeInTheDocument();
  });

  it('renders all four criterion cards and the detail panel', () => {
    mount();
    for (const c of CRITERIA) {
      expect(document.querySelector(`[data-testid="fsmgen-crit-${c.id}"]`), c.id).toBeInTheDocument();
    }
    expect(document.querySelector('[data-testid="fsmgen-detail"]')).toBeInTheDocument();
  });

  it('switching FSM re-renders the model table', () => {
    mount();
    document.querySelector('[data-testid="fsmgen-fsm-atm"]').click();
    expect(
      document.querySelector('[data-testid="fsmgen-fsm-atm"]').classList.contains('fsmgen-fsm-btn--active'),
    ).toBe(true);
  });

  it('selecting a criterion updates the active card', () => {
    mount();
    document.querySelector('[data-testid="fsmgen-crit-pair"]').click();
    expect(
      document.querySelector('[data-testid="fsmgen-crit-pair"]').classList.contains('fsmgen-crit--active'),
    ).toBe(true);
    expect(document.querySelector('[data-testid="fsmgen-test-list"]')).toBeInTheDocument();
  });

  it('renders the comparison panel and the transition tour', () => {
    mount();
    expect(document.querySelector('[data-testid="fsmgen-compare"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="fsmgen-tour"]')).toBeInTheDocument();
  });

  it('exposes a bridge to the State Transition Explorer', () => {
    mount();
    expect(document.querySelector('[data-testid="fsmgen-bridge-st"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="fsmgen-quiz-start"]').click();
    document.querySelector('input[name="fsmgen-quiz"][value="c"]').click();
    document.querySelector('[data-testid="fsmgen-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="fsmgen-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="fsmgen-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="fsmgen-quiz-start"]').click();
    document.querySelector('input[name="fsmgen-quiz"][value="b"]').click();
    document.querySelector('[data-testid="fsmgen-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="fsmgen-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="fsmgen-lab-start"]').click();
    expect(document.querySelector('[data-testid="fsmgen-lab-text"]')).toBeInTheDocument();
  });
});
