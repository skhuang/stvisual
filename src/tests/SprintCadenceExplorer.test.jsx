import { describe, expect, it } from 'vitest';
import {
  createSprintCadenceExplorer,
  AGILE_STAGES,
  WATERFALL_STAGES,
  wovenRatio,
} from '../components/SprintCadenceExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createSprintCadenceExplorer();
  document.body.appendChild(el);
  return el;
}

describe('sprint cadence data', () => {
  it('defines the agile sprint stages and the waterfall stages', () => {
    expect(AGILE_STAGES.length).toBeGreaterThan(0);
    expect(WATERFALL_STAGES.length).toBeGreaterThan(0);
  });

  it('agile weaves testing into far more stages than waterfall', () => {
    const a = wovenRatio('agile');
    const w = wovenRatio('waterfall');
    expect(a.woven).toBeGreaterThan(w.woven);
    expect(a.woven).toBe(a.total);
    expect(w.woven).toBeLessThan(w.total);
  });
});

describe('SprintCadenceExplorer smoke', () => {
  it('renders wrap, mode toggle, and timeline', () => {
    mount();
    expect(document.querySelector('[data-testid="cadence-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="cadence-mode"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="cadence-timeline"]')).toBeInTheDocument();
  });

  it('starts in agile mode showing the agile stages', () => {
    mount();
    for (const s of AGILE_STAGES) {
      expect(document.querySelector(`[data-testid="cadence-stage-${s.id}"]`), s.id).toBeInTheDocument();
    }
  });

  it('switching to waterfall mode swaps the timeline stages', () => {
    mount();
    document.querySelector('[data-testid="cadence-mode-waterfall"]').click();
    for (const s of WATERFALL_STAGES) {
      expect(document.querySelector(`[data-testid="cadence-stage-${s.id}"]`), s.id).toBeInTheDocument();
    }
    expect(document.querySelector('[data-testid="cadence-stage-refine"]')).toBeNull();
  });

  it('clicking a stage updates the detail panel', () => {
    mount();
    document.querySelector('[data-testid="cadence-stage-dev"]').click();
    expect(
      document.querySelector('[data-testid="cadence-stage-dev"]').classList.contains('cadence-stage--active'),
    ).toBe(true);
    expect(document.querySelector('[data-testid="cadence-detail"]')).toBeInTheDocument();
  });

  it('renders the agile-vs-waterfall comparison', () => {
    mount();
    expect(document.querySelector('[data-testid="cadence-compare"]')).toBeInTheDocument();
  });

  it('exposes bridges to the V-Model and Defect Cost explorers', () => {
    mount();
    expect(document.querySelector('[data-testid="cadence-bridge-vmodel"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="cadence-bridge-defectcost"]')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="cadence-quiz-start"]').click();
    document.querySelector('input[name="cadence-quiz"][value="c"]').click();
    document.querySelector('[data-testid="cadence-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="cadence-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="cadence-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="cadence-quiz-start"]').click();
    document.querySelector('input[name="cadence-quiz"][value="a"]').click();
    document.querySelector('[data-testid="cadence-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="cadence-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="cadence-lab-start"]').click();
    expect(document.querySelector('[data-testid="cadence-lab-text"]')).toBeInTheDocument();
  });
});
