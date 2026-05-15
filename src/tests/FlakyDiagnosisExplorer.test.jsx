import { describe, expect, it } from 'vitest';
import {
  createFlakyDiagnosisExplorer,
  SOURCES,
  SAMPLES,
  tallyByMistake,
  scoreOf,
} from '../components/FlakyDiagnosisExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createFlakyDiagnosisExplorer();
  document.body.appendChild(el);
  return el;
}

describe('Flaky-diagnosis pure helpers', () => {
  it('SOURCES lists exactly the six categories used by the taxonomy', () => {
    expect(SOURCES).toEqual(['timing', 'order', 'async', 'network', 'animation', 'data']);
  });

  it('SAMPLES are all valid (each refers to a source from SOURCES)', () => {
    for (const s of SAMPLES) {
      expect(SOURCES, `sample ${s.id}`).toContain(s.source);
    }
  });

  it('SAMPLES covers every source at least once', () => {
    const covered = new Set(SAMPLES.map((s) => s.source));
    for (const src of SOURCES) {
      expect(covered, `taxonomy ${src} present in SAMPLES`).toContain(src);
    }
  });

  it('scoreOf counts only correct answers', () => {
    const answers = [
      { sampleId: 's1', picked: 'timing',  correct: true },
      { sampleId: 's2', picked: 'data',    correct: false },
      { sampleId: 's3', picked: 'animation', correct: true },
    ];
    expect(scoreOf(answers)).toBe(2);
  });

  it('tallyByMistake increments only the source of incorrectly-answered samples', () => {
    const answers = [
      { sampleId: 's2', picked: 'data',    correct: false }, // truth: network
      { sampleId: 's3', picked: 'timing',  correct: false }, // truth: animation
      { sampleId: 's1', picked: 'timing',  correct: true },  // truth: timing — no mistake
    ];
    const tally = tallyByMistake(answers);
    expect(tally.network).toBe(1);
    expect(tally.animation).toBe(1);
    expect(tally.timing).toBe(0);
    expect(tally.order).toBe(0);
  });
});

describe('FlakyDiagnosisExplorer smoke', () => {
  it('renders wrap, progress, sample card, taxonomy, mistake bars', () => {
    mount();
    expect(document.querySelector('[data-testid="flx-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="flx-progress"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="flx-sample"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="flx-taxonomy"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="flx-mistakes"]')).toBeInTheDocument();
  });

  it('picking the correct source and submitting shows green feedback', () => {
    mount();
    // Sample 1 ground truth is "timing".
    document.querySelector('[data-testid="flx-option-timing"]').click();
    document.querySelector('[data-testid="flx-submit"]').click();
    const fb = document.querySelector('[data-testid="flx-feedback"]');
    expect(fb).toBeInTheDocument();
    expect(fb.classList.contains('flx-feedback--right')).toBe(true);
  });

  it('picking the wrong source highlights the chosen option red and the correct one green', () => {
    mount();
    // Sample 1 ground truth is "timing"; pick "data".
    document.querySelector('[data-testid="flx-option-data"]').click();
    document.querySelector('[data-testid="flx-submit"]').click();
    const fb = document.querySelector('[data-testid="flx-feedback"]');
    expect(fb.classList.contains('flx-feedback--wrong')).toBe(true);
    expect(document.querySelector('[data-testid="flx-option-data"]').classList.contains('flx-option--wrong')).toBe(true);
    expect(document.querySelector('[data-testid="flx-option-timing"]').classList.contains('flx-option--correct')).toBe(true);
  });

  it('options are disabled after submission to prevent re-answering', () => {
    mount();
    document.querySelector('[data-testid="flx-option-timing"]').click();
    document.querySelector('[data-testid="flx-submit"]').click();
    expect(document.querySelector('[data-testid="flx-option-data"]').disabled).toBe(true);
  });

  it('Next button moves to the next sample', () => {
    mount();
    document.querySelector('[data-testid="flx-option-timing"]').click();
    document.querySelector('[data-testid="flx-submit"]').click();
    document.querySelector('[data-testid="flx-next"]').click();
    // Now on sample 2 — should not have feedback yet.
    expect(document.querySelector('[data-testid="flx-feedback"]')).toBeNull();
  });

  it('score badge updates as the user answers correctly', () => {
    mount();
    document.querySelector('[data-testid="flx-option-timing"]').click();
    document.querySelector('[data-testid="flx-submit"]').click();
    expect(document.querySelector('[data-testid="flx-score"]').textContent).toMatch(/1\s*\/\s*1/);
  });

  it('quiz: pick B (retry hides flake), submit → correct', () => {
    mount();
    document.querySelector('[data-testid="flx-quiz-start"]').click();
    document.querySelector('input[name="flx-quiz"][value="b"]').click();
    document.querySelector('[data-testid="flx-quiz-submit"]').click();
    expect(document.querySelector('[data-testid="flx-quiz-result"]').classList.contains('quiz-correct')).toBe(true);
  });

  it('lab reflect activates', () => {
    mount();
    document.querySelector('[data-testid="flx-lab-start"]').click();
    expect(document.querySelector('[data-testid="flx-lab-text"]')).toBeInTheDocument();
  });
});
