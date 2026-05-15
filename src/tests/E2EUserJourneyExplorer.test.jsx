import { describe, expect, it } from 'vitest';
import {
  createE2EUserJourneyExplorer,
  JOURNEYS,
  FLAKINESS_SOURCES,
  stepPassProbability,
  journeyPassProbability,
  simulateRuns,
} from '../components/E2EUserJourneyExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createE2EUserJourneyExplorer();
  document.body.appendChild(el);
  return el;
}

describe('Flakiness math', () => {
  it('FLAKINESS_SOURCES enumerates exactly the five taxonomy categories', () => {
    expect(FLAKINESS_SOURCES).toEqual(['timing', 'network', 'animation', 'async', 'data']);
  });

  it('stepPassProbability equals product of (1 − sourceRate)', () => {
    const step = { risk: { timing: 0.1, network: 0.2, animation: 0, async: 0, data: 0 } };
    expect(stepPassProbability(step)).toBeCloseTo(0.9 * 0.8, 6);
  });

  it('journeyPassProbability is the product of step probabilities', () => {
    for (const j of JOURNEYS) {
      const product = j.steps.reduce((p, s) => p * stepPassProbability(s), 1);
      expect(journeyPassProbability(j)).toBeCloseTo(product, 8);
    }
  });

  it('simulateRuns is deterministic for the same seed', () => {
    const a = simulateRuns(JOURNEYS[0], 200, 42);
    const b = simulateRuns(JOURNEYS[0], 200, 42);
    expect(a.fullPasses).toBe(b.fullPasses);
    expect(a.reached).toEqual(b.reached);
  });

  it('simulateRuns: reached[0] === runs (every run starts step 1)', () => {
    const r = simulateRuns(JOURNEYS[0], 100, 1);
    expect(r.reached[0]).toBe(100);
  });

  it('observed pass rate is within ±15% of the predicted value over 1000 runs', () => {
    for (const j of JOURNEYS) {
      const predicted = journeyPassProbability(j);
      const sim = simulateRuns(j, 1000, 7);
      const observed = sim.fullPasses / 1000;
      expect(Math.abs(observed - predicted), `${j.id}`).toBeLessThan(0.15);
    }
  });
});

describe('E2EUserJourneyExplorer smoke', () => {
  it('renders wrap, presets, timeline, sim, and taxonomy', () => {
    mount();
    expect(document.querySelector('[data-testid="e2e-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="e2e-presets"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="e2e-journey"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="e2e-sim"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="e2e-taxonomy"]')).toBeInTheDocument();
  });

  it('every step in the default journey gets a tag chip', () => {
    mount();
    for (const s of JOURNEYS[0].steps) {
      expect(document.querySelector(`[data-testid="e2e-step-tag-${s.id}"]`), `tag for ${s.id}`).toBeInTheDocument();
    }
  });

  it('clicking Run renders per-step bar widths and an actual pass-rate line', () => {
    mount();
    expect(document.querySelector('[data-testid="e2e-sim-actual"]')).toBeNull();
    document.querySelector('[data-testid="e2e-sim-run"]').click();
    expect(document.querySelector('[data-testid="e2e-sim-actual"]')).toBeInTheDocument();
    for (const s of JOURNEYS[0].steps) {
      expect(document.querySelector(`[data-testid="e2e-sim-bar-${s.id}"]`)).toBeInTheDocument();
    }
  });

  it('switching presets clears the previous simulation', () => {
    mount();
    document.querySelector('[data-testid="e2e-sim-run"]').click();
    expect(document.querySelector('[data-testid="e2e-sim-actual"]')).toBeInTheDocument();
    document.querySelector('[data-testid="e2e-preset-pwreset"]').click();
    expect(document.querySelector('[data-testid="e2e-sim-actual"]')).toBeNull();
  });

  it('quiz: start, pick animation, submit → correct result', () => {
    mount();
    document.querySelector('[data-testid="e2e-quiz-start"]').click();
    document.querySelector('input[name="e2e-quiz"][value="animation"]').click();
    document.querySelector('[data-testid="e2e-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="e2e-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="e2e-lab-start"]').click();
    expect(document.querySelector('[data-testid="e2e-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="e2e-lab-text"]')).toBeInTheDocument();
  });
});
