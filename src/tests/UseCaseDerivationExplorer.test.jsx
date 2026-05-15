import { describe, expect, it } from 'vitest';
import {
  createUseCaseDerivationExplorer,
  USE_CASES,
  countFlowsByKind,
  minimumTestCases,
} from '../components/UseCaseDerivationExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createUseCaseDerivationExplorer();
  document.body.appendChild(el);
  return el;
}

describe('Use-case flow accounting', () => {
  it('countFlowsByKind classifies each flow correctly', () => {
    const atm = USE_CASES.find((u) => u.id === 'atm');
    const counts = countFlowsByKind(atm);
    expect(counts).toEqual({ main: 1, alternate: 2, exception: 2 });
  });

  it('minimumTestCases is total flow count (one case per flow)', () => {
    for (const uc of USE_CASES) {
      expect(minimumTestCases(uc)).toBe(uc.flows.length);
    }
  });

  it('every preset has exactly one main flow', () => {
    for (const uc of USE_CASES) {
      const counts = countFlowsByKind(uc);
      expect(counts.main, `${uc.id} should have 1 main flow`).toBe(1);
    }
  });

  it('every preset has at least one exception flow', () => {
    for (const uc of USE_CASES) {
      const counts = countFlowsByKind(uc);
      expect(counts.exception, `${uc.id} should have ≥1 exception flow`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('UseCaseDerivationExplorer smoke', () => {
  it('renders wrap, presets, header and flow lists', () => {
    mount();
    expect(document.querySelector('[data-testid="uc-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="uc-presets"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="uc-case-header"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="uc-flows"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="uc-cases"]')).toBeInTheDocument();
  });

  it('main flow is covered by default, alt/exc start uncovered', () => {
    mount();
    const atm = USE_CASES[0];
    expect(document.querySelector('[data-testid="uc-flow-cov-main"]').checked).toBe(true);
    expect(document.querySelector('[data-testid="uc-flow-cov-main"]').disabled).toBe(true);
    for (const f of atm.flows) {
      if (f.kind === 'main') continue;
      expect(document.querySelector(`[data-testid="uc-flow-cov-${f.id}"]`).checked, `${f.id} starts unchecked`).toBe(false);
    }
  });

  it('ticking an alternate flow generates its test case card', () => {
    mount();
    const before = document.querySelectorAll('.uc-case-list .uc-case').length;
    document.querySelector('[data-testid="uc-flow-cov-alt-savings"]').click();
    const after = document.querySelectorAll('.uc-case-list .uc-case').length;
    expect(after).toBe(before + 1);
    expect(document.querySelector('[data-testid="uc-case-alt-savings"]')).toBeInTheDocument();
  });

  it('exception flow cards expose the Risk-Based bridge button', () => {
    mount();
    document.querySelector('[data-testid="uc-flow-cov-exc-funds"]').click();
    const card = document.querySelector('[data-testid="uc-case-exc-funds"]');
    expect(card).toBeInTheDocument();
    expect(card.querySelector('[data-testid="uc-bridge-rbt"]')).toBeInTheDocument();
  });

  it('switching presets resets the rendered case list', () => {
    mount();
    document.querySelector('[data-testid="uc-preset-booking"]').click();
    expect(document.querySelector('[data-testid="uc-preset-booking"]').classList.contains('uc-preset-chip--active')).toBe(true);
    // Booking has 3 flows total; main is auto-covered so 1 case is rendered.
    expect(document.querySelectorAll('.uc-case-list .uc-case').length).toBe(1);
  });

  it('quiz: start, pick option, submit shows result', () => {
    mount();
    document.querySelector('[data-testid="uc-quiz-start"]').click();
    document.querySelector('input[name="uc-quiz"][value="c"]').click();
    document.querySelector('[data-testid="uc-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="uc-quiz-result"]');
    expect(result).toBeInTheDocument();
    expect(result.classList.contains('quiz-correct')).toBe(true);
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="uc-lab-start"]').click();
    expect(document.querySelector('[data-testid="uc-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="uc-lab-text"]')).toBeInTheDocument();
  });
});
