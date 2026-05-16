import { describe, expect, it } from 'vitest';
import {
  createDefinitionGatesExplorer,
  CRITERIA,
  ISSUES,
  evaluate,
} from '../components/DefinitionGatesExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createDefinitionGatesExplorer();
  document.body.appendChild(el);
  return el;
}

describe('definition gates data', () => {
  it('each criterion belongs to the DoR or DoD gate', () => {
    for (const c of CRITERIA) {
      expect(['dor', 'dod']).toContain(c.gate);
    }
  });

  it('every latent issue is matched to a real criterion', () => {
    const ids = new Set(CRITERIA.map((c) => c.id));
    for (const issue of ISSUES) {
      expect(ids.has(issue.criterion), issue.id).toBe(true);
    }
  });
});

describe('gate evaluation', () => {
  it('all criteria enabled — every issue is caught, none leaks', () => {
    const all = new Set(CRITERIA.map((c) => c.id));
    const { caught, leaked } = evaluate(all);
    expect(caught.length).toBe(ISSUES.length);
    expect(leaked.length).toBe(0);
  });

  it('no criteria enabled — every issue leaks', () => {
    const { caught, leaked } = evaluate(new Set());
    expect(caught.length).toBe(0);
    expect(leaked.length).toBe(ISSUES.length);
  });

  it('disabling one criterion leaks exactly its issue', () => {
    const all = new Set(CRITERIA.map((c) => c.id));
    all.delete('dod-tests');
    const { leaked } = evaluate(all);
    expect(leaked.map((i) => i.id)).toEqual(['failing-regression']);
  });
});

describe('DefinitionGatesExplorer smoke', () => {
  it('renders wrap and both gate panels', () => {
    mount();
    expect(document.querySelector('[data-testid="gate-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="gate-panel-dor"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="gate-panel-dod"]')).toBeInTheDocument();
  });

  it('renders a checkbox for every criterion', () => {
    mount();
    for (const c of CRITERIA) {
      expect(document.querySelector(`[data-testid="gate-crit-${c.id}"]`), c.id).toBeInTheDocument();
    }
  });

  it('toggling a criterion updates the result summary', () => {
    mount();
    const before = document.querySelector('[data-testid="gate-summary"]').textContent;
    const box = document.querySelector('[data-testid="gate-crit-dor-criteria"]');
    box.checked = false;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    const after = document.querySelector('[data-testid="gate-summary"]').textContent;
    expect(after).not.toBe(before);
  });

  it('exposes bridges to Defect Cost and BDD', () => {
    mount();
    expect(document.querySelector('[data-testid="gate-bridge-defectcost"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="gate-bridge-bdd"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="gate-quiz-start"]').click();
    document.querySelector('input[name="gate-quiz"][value="c"]').click();
    document.querySelector('[data-testid="gate-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="gate-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="gate-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="gate-quiz-start"]').click();
    document.querySelector('input[name="gate-quiz"][value="a"]').click();
    document.querySelector('[data-testid="gate-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="gate-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="gate-lab-start"]').click();
    expect(document.querySelector('[data-testid="gate-lab-text"]')).toBeInTheDocument();
  });
});
