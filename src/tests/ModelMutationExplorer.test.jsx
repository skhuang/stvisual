import { describe, expect, it } from 'vitest';
import {
  createModelMutationExplorer,
  BASE_FSM,
  SUITE,
  MUTANTS,
  applyMutant,
  runTrace,
  evalMutant,
  mutationScore,
} from '../components/ModelMutationExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createModelMutationExplorer();
  document.body.appendChild(el);
  return el;
}

describe('model mutation data', () => {
  it('ships a base FSM, a suite, and mutants — one flagged equivalent', () => {
    expect(BASE_FSM.transitions.length).toBeGreaterThan(0);
    expect(SUITE.length).toBeGreaterThan(0);
    expect(MUTANTS.length).toBeGreaterThan(0);
    expect(MUTANTS.some((m) => m.equivalent)).toBe(true);
  });
});

describe('mutation evaluation', () => {
  it('runTrace produces one output symbol per input on the base FSM', () => {
    expect(runTrace(BASE_FSM, 'aa')).toHaveLength(2);
  });

  it('a delete-transition mutant drops a transition', () => {
    const del = MUTANTS.find((m) => m.op === 'delete');
    const mutated = applyMutant(BASE_FSM, del);
    expect(mutated.transitions.length).toBe(BASE_FSM.transitions.length - 1);
  });

  it('the equivalent mutant is never killed', () => {
    const equiv = MUTANTS.find((m) => m.equivalent);
    expect(evalMutant(equiv).killed).toBe(false);
  });

  it('at least one mutant is killed and at least one survives', () => {
    const results = MUTANTS.map((m) => evalMutant(m));
    expect(results.some((r) => r.killed)).toBe(true);
    expect(results.some((r) => !r.killed)).toBe(true);
  });

  it('mutation score is consistent and raw ≤ adjusted', () => {
    const s = mutationScore();
    expect(s.total).toBe(MUTANTS.length);
    expect(s.killed).toBeGreaterThanOrEqual(0);
    expect(s.raw).toBeCloseTo(s.killed / s.total, 6);
    expect(s.adjusted).toBeGreaterThanOrEqual(s.raw);
  });
});

describe('ModelMutationExplorer smoke', () => {
  it('renders wrap, model table, and mutant row', () => {
    mount();
    expect(document.querySelector('[data-testid="modelmut-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="modelmut-model"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="modelmut-mutant-row"]')).toBeInTheDocument();
  });

  it('renders a card for every mutant', () => {
    mount();
    for (const m of MUTANTS) {
      expect(document.querySelector(`[data-testid="modelmut-mutant-${m.id}"]`), m.id).toBeInTheDocument();
    }
  });

  it('selecting the equivalent mutant shows the equivalent-mutant note', () => {
    mount();
    const equiv = MUTANTS.find((m) => m.equivalent);
    document.querySelector(`[data-testid="modelmut-mutant-${equiv.id}"]`).click();
    expect(document.querySelector('[data-testid="modelmut-equiv"]')).toBeInTheDocument();
    expect(
      document.querySelector('[data-testid="modelmut-verdict"]').classList.contains('modelmut-verdict--survived'),
    ).toBe(true);
  });

  it('renders the mutation-score panel', () => {
    mount();
    expect(document.querySelector('[data-testid="modelmut-score"]')).toBeInTheDocument();
  });

  it('exposes bridges to Spec Mutation and Equivalent Mutant explorers', () => {
    mount();
    expect(document.querySelector('[data-testid="modelmut-bridge-specmut"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="modelmut-bridge-equivmutant"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="modelmut-quiz-start"]').click();
    document.querySelector('input[name="modelmut-quiz"][value="c"]').click();
    document.querySelector('[data-testid="modelmut-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="modelmut-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="modelmut-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="modelmut-quiz-start"]').click();
    document.querySelector('input[name="modelmut-quiz"][value="b"]').click();
    document.querySelector('[data-testid="modelmut-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="modelmut-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="modelmut-lab-start"]').click();
    expect(document.querySelector('[data-testid="modelmut-lab-text"]')).toBeInTheDocument();
  });
});
