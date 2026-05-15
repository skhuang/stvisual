import { describe, expect, it } from 'vitest';
import {
  createWMethodConformanceExplorer,
  SPEC,
  mutantFsm,
  runMealy,
  stateCover,
  distinguishingSeq,
  characterizingSet,
  wMethodSuite,
} from '../components/WMethodConformanceExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createWMethodConformanceExplorer();
  document.body.appendChild(el);
  return el;
}

describe('W-method spec FSM', () => {
  it('is a complete minimal Mealy machine — every state×input has a transition', () => {
    for (const s of SPEC.states) {
      for (const x of SPEC.alphabet) {
        const tr = SPEC.transitions.find((t) => t.from === s.id && t.input === x);
        expect(tr, `${s.id}/${x}`).toBeTruthy();
      }
    }
  });

  it('all state pairs are distinguishable (minimal machine)', () => {
    for (let i = 0; i < SPEC.states.length; i++) {
      for (let j = i + 1; j < SPEC.states.length; j++) {
        expect(distinguishingSeq(SPEC, SPEC.states[i].id, SPEC.states[j].id)).not.toBeNull();
      }
    }
  });
});

describe('W-method algorithms', () => {
  it('runMealy emits one output per input', () => {
    const run = runMealy(SPEC, 'q1', ['a', 'a']);
    expect(run.outputs).toHaveLength(2);
  });

  it('state cover reaches every state, ε for the initial state', () => {
    const cover = stateCover(SPEC);
    expect(Object.keys(cover).sort()).toEqual(SPEC.states.map((s) => s.id).sort());
    expect(cover[SPEC.initial]).toEqual([]);
  });

  it('characterizing set distinguishes every pair of states', () => {
    const W = characterizingSet(SPEC);
    expect(W.length).toBeGreaterThan(0);
    for (let i = 0; i < SPEC.states.length; i++) {
      for (let j = i + 1; j < SPEC.states.length; j++) {
        const a = SPEC.states[i].id;
        const b = SPEC.states[j].id;
        const split = W.some((w) =>
          runMealy(SPEC, a, w).outputs.join('') !== runMealy(SPEC, b, w).outputs.join(''));
        expect(split, `${a} vs ${b}`).toBe(true);
      }
    }
  });

  it('suite grows monotonically with the extra-state assumption m', () => {
    const s0 = wMethodSuite(SPEC, 0).suite.length;
    const s1 = wMethodSuite(SPEC, 1).suite.length;
    expect(s1).toBeGreaterThanOrEqual(s0);
  });

  it('the W-suite catches the injected transfer-fault mutant', () => {
    const { suite } = wMethodSuite(SPEC, 0);
    const mut = mutantFsm();
    const caught = suite.some((test) =>
      runMealy(SPEC, SPEC.initial, test).outputs.join('')
        !== runMealy(mut, mut.initial, test).outputs.join(''));
    expect(caught).toBe(true);
  });
});

describe('WMethodConformanceExplorer smoke', () => {
  it('renders wrap, FSM table, and the ingredient sets', () => {
    mount();
    expect(document.querySelector('[data-testid="wmethod-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="wmethod-fsm"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="wmethod-sets"]')).toBeInTheDocument();
  });

  it('switching to the suite tab reveals the m selector', () => {
    mount();
    expect(document.querySelector('[data-testid="wmethod-m-row"]')).toBeNull();
    document.querySelector('[data-testid="wmethod-set-suite"]').click();
    expect(document.querySelector('[data-testid="wmethod-m-row"]')).toBeInTheDocument();
    document.querySelector('[data-testid="wmethod-m-2"]').click();
    expect(
      document.querySelector('[data-testid="wmethod-m-2"]').classList.contains('wmethod-m-btn--active'),
    ).toBe(true);
  });

  it('the distinguish panel shows a diverging trace for two states', () => {
    mount();
    expect(document.querySelector('[data-testid="wmethod-distinguish"]')).toBeInTheDocument();
    expect(document.querySelector('.wmethod-trace-cell--diff')).toBeInTheDocument();
  });

  it('injecting the mutant produces a caught verdict', () => {
    mount();
    expect(document.querySelector('[data-testid="wmethod-mutant-verdict"]')).toBeNull();
    document.querySelector('[data-testid="wmethod-mutant-toggle"]').click();
    const verdict = document.querySelector('[data-testid="wmethod-mutant-verdict"]');
    expect(verdict).toBeInTheDocument();
    expect(verdict.classList.contains('wmethod-caught')).toBe(true);
  });

  it('exposes bridges to Group Theory and Logic Coverage', () => {
    mount();
    expect(document.querySelector('[data-testid="wmethod-bridge-groupth"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="wmethod-bridge-logic"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="wmethod-quiz-start"]').click();
    document.querySelector('input[name="wmethod-quiz"][value="c"]').click();
    document.querySelector('[data-testid="wmethod-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="wmethod-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="wmethod-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="wmethod-quiz-start"]').click();
    document.querySelector('input[name="wmethod-quiz"][value="b"]').click();
    document.querySelector('[data-testid="wmethod-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="wmethod-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="wmethod-lab-start"]').click();
    expect(document.querySelector('[data-testid="wmethod-lab-text"]')).toBeInTheDocument();
  });
});
