import { describe, expect, it } from 'vitest';
import {
  createRegressionDebtExplorer,
  SIM,
  simulate,
  crossoverSprint,
} from '../components/RegressionDebtExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createRegressionDebtExplorer();
  document.body.appendChild(el);
  return el;
}

const NONE = { prune: false, quarantine: false, riskBased: false };
const ALL = { prune: true, quarantine: true, riskBased: true };

describe('regression-debt simulation', () => {
  it('runs one row per sprint', () => {
    expect(simulate(NONE)).toHaveLength(SIM.sprints);
  });

  it('an unmanaged suite falls into test debt', () => {
    expect(crossoverSprint(simulate(NONE))).not.toBeNull();
  });

  it('maintenance strategies push the crossover back or remove it', () => {
    const none = crossoverSprint(simulate(NONE));
    const all = crossoverSprint(simulate(ALL));
    // All strategies: either no crossover, or a strictly later one.
    expect(all === null || all > none).toBe(true);
  });

  it('quarantine lowers the maintenance cost of the final sprint', () => {
    const baseLast = simulate(NONE).at(-1).cost;
    const quarLast = simulate({ ...NONE, quarantine: true }).at(-1).cost;
    expect(quarLast).toBeLessThan(baseLast);
  });
});

describe('RegressionDebtExplorer smoke', () => {
  it('renders wrap, strategies, chart, and summary', () => {
    mount();
    expect(document.querySelector('[data-testid="rdebt-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="rdebt-strategies"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="rdebt-chart"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="rdebt-summary"]')).toBeInTheDocument();
  });

  it('starts with a test-debt verdict and clears it once strategies are on', () => {
    mount();
    expect(
      document.querySelector('[data-testid="rdebt-verdict"]').classList.contains('rdebt-verdict--debt'),
    ).toBe(true);
    for (const s of ['prune', 'quarantine', 'riskBased']) {
      const box = document.querySelector(`[data-testid="rdebt-strat-${s}"]`);
      box.checked = true;
      box.dispatchEvent(new Event('change', { bubbles: true }));
    }
    expect(
      document.querySelector('[data-testid="rdebt-verdict"]').classList.contains('rdebt-verdict--ok'),
    ).toBe(true);
  });

  it('exposes bridges to Risk-Based Testing and Flaky Diagnosis', () => {
    mount();
    expect(document.querySelector('[data-testid="rdebt-bridge-rbt"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="rdebt-bridge-flaky"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="rdebt-quiz-start"]').click();
    document.querySelector('input[name="rdebt-quiz"][value="c"]').click();
    document.querySelector('[data-testid="rdebt-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="rdebt-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="rdebt-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="rdebt-quiz-start"]').click();
    document.querySelector('input[name="rdebt-quiz"][value="a"]').click();
    document.querySelector('[data-testid="rdebt-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="rdebt-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="rdebt-lab-start"]').click();
    expect(document.querySelector('[data-testid="rdebt-lab-text"]')).toBeInTheDocument();
  });
});
