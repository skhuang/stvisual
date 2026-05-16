import { describe, expect, it } from 'vitest';
import {
  createExampleMappingExplorer,
  RULES,
  QUESTIONS,
  ROLES,
} from '../components/ExampleMappingExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createExampleMappingExplorer();
  document.body.appendChild(el);
  return el;
}

describe('example mapping data', () => {
  it('defines rules with examples, open questions, and three roles', () => {
    expect(RULES.length).toBeGreaterThan(0);
    for (const r of RULES) expect(r.examples.length).toBeGreaterThan(0);
    expect(QUESTIONS.length).toBeGreaterThan(0);
    expect(ROLES).toEqual(['ba', 'dev', 'tester']);
  });
});

describe('ExampleMappingExplorer smoke', () => {
  it('renders wrap, roles, and the example map', () => {
    mount();
    expect(document.querySelector('[data-testid="emap-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="emap-roles"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="emap-map"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="emap-story"]')).toBeInTheDocument();
  });

  it('renders a card for every rule and question', () => {
    mount();
    for (const r of RULES) {
      expect(document.querySelector(`[data-testid="emap-rule-${r.id}"]`), r.id).toBeInTheDocument();
    }
    for (const q of QUESTIONS) {
      expect(document.querySelector(`[data-testid="emap-q-${q}"]`), q).toBeInTheDocument();
    }
  });

  it('starts not-ready and becomes ready once every question is resolved', () => {
    mount();
    expect(
      document.querySelector('[data-testid="emap-readiness"]').classList.contains('emap-readiness--blocked'),
    ).toBe(true);
    for (const q of QUESTIONS) {
      document.querySelector(`[data-testid="emap-q-${q}"]`).click();
    }
    expect(
      document.querySelector('[data-testid="emap-readiness"]').classList.contains('emap-readiness--ready'),
    ).toBe(true);
  });

  it('clicking an example updates the Gherkin preview', () => {
    mount();
    const ex = RULES[1].examples[0];
    document.querySelector(`[data-testid="emap-ex-${ex}"]`).click();
    expect(
      document.querySelector(`[data-testid="emap-ex-${ex}"]`).classList.contains('emap-card--active'),
    ).toBe(true);
    expect(document.querySelector('[data-testid="emap-gherkin"]')).toBeInTheDocument();
  });

  it('switching role updates the active role button', () => {
    mount();
    document.querySelector('[data-testid="emap-role-tester"]').click();
    expect(
      document.querySelector('[data-testid="emap-role-tester"]').classList.contains('emap-role--active'),
    ).toBe(true);
  });

  it('exposes bridges to BDD and the Ready/Done gates', () => {
    mount();
    expect(document.querySelector('[data-testid="emap-bridge-bdd"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="emap-bridge-gates"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="emap-quiz-start"]').click();
    document.querySelector('input[name="emap-quiz"][value="c"]').click();
    document.querySelector('[data-testid="emap-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="emap-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="emap-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="emap-quiz-start"]').click();
    document.querySelector('input[name="emap-quiz"][value="a"]').click();
    document.querySelector('[data-testid="emap-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="emap-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="emap-lab-start"]').click();
    expect(document.querySelector('[data-testid="emap-lab-text"]')).toBeInTheDocument();
  });
});
