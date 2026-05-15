import { describe, expect, it } from 'vitest';
import {
  createUsageModelStatisticalExplorer,
  USAGE_MODEL,
  randomWalk,
  expectedLength,
  runStatistical,
} from '../components/UsageModelStatisticalExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createUsageModelStatisticalExplorer();
  document.body.appendChild(el);
  return el;
}

describe('usage model', () => {
  it('each non-terminal state has outgoing probabilities summing to 1', () => {
    for (const s of USAGE_MODEL.states) {
      if (s.id === USAGE_MODEL.terminal) continue;
      const sum = USAGE_MODEL.transitions
        .filter((tr) => tr.from === s.id)
        .reduce((acc, tr) => acc + tr.p, 0);
      expect(sum, s.id).toBeCloseTo(1, 6);
    }
  });
});

describe('random walk + analytics', () => {
  it('a random walk ends at the terminal state', () => {
    const walk = randomWalk(USAGE_MODEL, () => 0.99);
    expect(walk.length).toBeGreaterThan(0);
    expect(walk[walk.length - 1].to).toBe(USAGE_MODEL.terminal);
  });

  it('expected test length is a positive number above the shortest path', () => {
    const e = expectedLength(USAGE_MODEL);
    expect(e).toBeGreaterThan(1);
    expect(e).toBeLessThan(20);
  });

  it('runStatistical reports a consistent pass/fail split', () => {
    const r = runStatistical(USAGE_MODEL, 200);
    expect(r.count).toBe(200);
    expect(r.passes + r.fails).toBe(200);
    expect(r.reliability).toBeGreaterThanOrEqual(0);
    expect(r.reliability).toBeLessThanOrEqual(1);
    for (const tr of USAGE_MODEL.transitions) {
      expect(r.transitionCounts[tr.id]).toBeGreaterThanOrEqual(0);
    }
  });

  it('with a deterministic rng that always exits early, reliability is 1', () => {
    const r = runStatistical(USAGE_MODEL, 50, () => 0.99);
    expect(r.reliability).toBe(1);
  });
});

describe('UsageModelStatisticalExplorer smoke', () => {
  it('renders wrap, model table, and runner', () => {
    mount();
    expect(document.querySelector('[data-testid="usage-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="usage-model"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="usage-runner"]')).toBeInTheDocument();
  });

  it('running tests reveals the result and reliability panels', () => {
    mount();
    expect(document.querySelector('[data-testid="usage-result"]')).toBeNull();
    document.querySelector('[data-testid="usage-run"]').click();
    expect(document.querySelector('[data-testid="usage-result"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="usage-reliability"]')).toBeInTheDocument();
  });

  it('the test-count selector updates the active button', () => {
    mount();
    document.querySelector('[data-testid="usage-n-1000"]').click();
    expect(
      document.querySelector('[data-testid="usage-n-1000"]').classList.contains('usage-n-btn--active'),
    ).toBe(true);
  });

  it('renders the rare-path warning', () => {
    mount();
    expect(document.querySelector('[data-testid="usage-rare"]')).toBeInTheDocument();
  });

  it('exposes bridges to Risk-Based and Property-Based testing', () => {
    mount();
    expect(document.querySelector('[data-testid="usage-bridge-rbt"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="usage-bridge-pbt"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="usage-quiz-start"]').click();
    document.querySelector('input[name="usage-quiz"][value="c"]').click();
    document.querySelector('[data-testid="usage-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="usage-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="usage-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="usage-quiz-start"]').click();
    document.querySelector('input[name="usage-quiz"][value="a"]').click();
    document.querySelector('[data-testid="usage-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="usage-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="usage-lab-start"]').click();
    expect(document.querySelector('[data-testid="usage-lab-text"]')).toBeInTheDocument();
  });
});
