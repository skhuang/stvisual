import { describe, expect, it } from 'vitest';
import {
  createAgileQuadrantsExplorer,
  QUADRANTS,
} from '../components/AgileQuadrantsExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createAgileQuadrantsExplorer();
  document.body.appendChild(el);
  return el;
}

describe('agile quadrants data', () => {
  it('defines the four canonical quadrants, each with techniques', () => {
    expect(QUADRANTS.map((q) => q.id).sort()).toEqual(['q1', 'q2', 'q3', 'q4']);
    for (const q of QUADRANTS) {
      expect(q.techniques.length, q.id).toBeGreaterThan(0);
    }
  });

  it('at least one technique in each quadrant bridges to another explorer', () => {
    const bridged = QUADRANTS.flatMap((q) => q.techniques).filter((t) => t.bridge);
    expect(bridged.length).toBeGreaterThan(0);
  });
});

describe('AgileQuadrantsExplorer smoke', () => {
  it('renders wrap and the 2×2 grid', () => {
    mount();
    expect(document.querySelector('[data-testid="agq-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="agq-grid"]')).toBeInTheDocument();
  });

  it('renders all four quadrant cells', () => {
    mount();
    for (const q of QUADRANTS) {
      expect(document.querySelector(`[data-testid="agq-quad-${q.id}"]`), q.id).toBeInTheDocument();
    }
  });

  it('clicking a quadrant updates the active cell and detail panel', () => {
    mount();
    document.querySelector('[data-testid="agq-quad-q3"]').click();
    expect(
      document.querySelector('[data-testid="agq-quad-q3"]').classList.contains('agq-quad--active'),
    ).toBe(true);
    expect(document.querySelector('[data-testid="agq-detail"]')).toBeInTheDocument();
  });

  it('the detail panel shows technique chips, including a bridge chip', () => {
    mount();
    document.querySelector('[data-testid="agq-quad-q2"]').click();
    expect(document.querySelector('[data-testid="agq-chip-bdd"]')).toBeInTheDocument();
    expect(document.querySelector('.agq-chip--bridge')).toBeInTheDocument();
  });

  it('quiz: correct option c yields a correct result + share button', () => {
    mount();
    document.querySelector('[data-testid="agq-quiz-start"]').click();
    document.querySelector('input[name="agq-quiz"][value="c"]').click();
    document.querySelector('[data-testid="agq-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="agq-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
    expect(document.querySelector('[data-testid="agq-quiz-share"]').getAttribute('data-share-payload')).toBeTruthy();
  });

  it('quiz: a wrong option submits as incorrect', () => {
    mount();
    document.querySelector('[data-testid="agq-quiz-start"]').click();
    document.querySelector('input[name="agq-quiz"][value="a"]').click();
    document.querySelector('[data-testid="agq-quiz-submit"]').click();
    expect(
      document.querySelector('[data-testid="agq-quiz-result"]').classList.contains('quiz-wrong'),
    ).toBe(true);
  });

  it('lab reflect activates and shows a textarea', () => {
    mount();
    document.querySelector('[data-testid="agq-lab-start"]').click();
    expect(document.querySelector('[data-testid="agq-lab-text"]')).toBeInTheDocument();
  });
});
