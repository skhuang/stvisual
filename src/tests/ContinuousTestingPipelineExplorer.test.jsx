import { describe, expect, it } from 'vitest';
import {
  createContinuousTestingPipelineExplorer,
  TEST_TYPES,
  TIERS,
  tierStats,
  falseFailureRate,
} from '../components/ContinuousTestingPipelineExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createContinuousTestingPipelineExplorer();
  document.body.appendChild(el);
  return el;
}

describe('continuous testing pipeline data', () => {
  it('defines test types and three tiers', () => {
    expect(TEST_TYPES.length).toBeGreaterThan(0);
    expect(TIERS).toEqual(['commit', 'pr', 'nightly']);
  });

  it('later tiers run at least as many tests as earlier ones', () => {
    mount(); // reset state to defaults
    const commit = tierStats('commit').tests;
    const pr = tierStats('pr').tests;
    const nightly = tierStats('nightly').tests;
    expect(pr).toBeGreaterThanOrEqual(commit);
    expect(nightly).toBeGreaterThanOrEqual(pr);
  });

  it('false-failure rate is zero when the flaky rate is zero', () => {
    mount();
    expect(falseFailureRate(1000)).toBe(0);
  });
});

describe('ContinuousTestingPipelineExplorer smoke', () => {
  it('renders wrap, suite, and pipeline', () => {
    mount();
    expect(document.querySelector('[data-testid="ctp-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ctp-suite"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ctp-pipeline"]')).toBeInTheDocument();
  });

  it('renders a tier card for each tier', () => {
    mount();
    for (const tier of TIERS) {
      expect(document.querySelector(`[data-testid="ctp-tier-card-${tier}"]`), tier).toBeInTheDocument();
    }
  });

  it('moving e2e tests onto the commit tier slows the commit feedback', () => {
    mount();
    const before = document.querySelector('[data-testid="ctp-time-commit"]').textContent;
    const sel = document.querySelector('[data-testid="ctp-tier-e2e"]');
    sel.value = 'commit';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    const after = document.querySelector('[data-testid="ctp-time-commit"]').textContent;
    expect(after).not.toBe(before);
    expect(
      document.querySelector('[data-testid="ctp-tier-card-commit"]').classList.contains('ctp-tier--slow'),
    ).toBe(true);
  });

  it('test-impact analysis reduces the commit-tier test count', () => {
    mount();
    const sel = document.querySelector('[data-testid="ctp-tier-e2e"]');
    sel.value = 'commit';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    const before = document.querySelector('[data-testid="ctp-tier-card-commit"]').textContent;
    const box = document.querySelector('[data-testid="ctp-impact"]');
    box.checked = true;
    box.dispatchEvent(new Event('change', { bubbles: true }));
    const after = document.querySelector('[data-testid="ctp-tier-card-commit"]').textContent;
    expect(after).not.toBe(before);
  });

  it('selecting a flaky rate updates the flaky result', () => {
    mount();
    document.querySelector('[data-testid="ctp-flaky-5"]').click();
    expect(
      document.querySelector('[data-testid="ctp-flaky-5"]').classList.contains('ctp-flaky-btn--active'),
    ).toBe(true);
  });

  it('exposes bridges to the Pyramid Adjuster and Flaky Diagnosis', () => {
    mount();
    expect(document.querySelector('[data-testid="ctp-bridge-pyramid"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ctp-bridge-flaky"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="ctp-quiz-start"]').click();
    document.querySelector('input[name="ctp-quiz"][value="c"]').click();
    document.querySelector('[data-testid="ctp-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="ctp-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="ctp-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="ctp-quiz-start"]').click();
    document.querySelector('input[name="ctp-quiz"][value="a"]').click();
    document.querySelector('[data-testid="ctp-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="ctp-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="ctp-lab-start"]').click();
    expect(document.querySelector('[data-testid="ctp-lab-text"]')).toBeInTheDocument();
  });
});
