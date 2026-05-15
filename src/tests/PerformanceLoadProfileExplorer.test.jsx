import { describe, expect, it } from 'vitest';
import {
  createPerformanceLoadProfileExplorer,
  PROFILES,
  SYSTEMS,
  loadShape,
  systemResponse,
  percentiles,
  littlesLaw,
  kneeConcurrency,
} from '../components/PerformanceLoadProfileExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createPerformanceLoadProfileExplorer();
  document.body.appendChild(el);
  return el;
}

describe('Load shape generators', () => {
  it('exposes exactly the four canonical profiles', () => {
    expect(PROFILES).toEqual(['load', 'stress', 'spike', 'soak']);
  });

  it('load is flat', () => {
    expect(loadShape('load', 0)).toBe(loadShape('load', 50));
  });

  it('stress ramps with tick', () => {
    expect(loadShape('stress', 10)).toBeLessThan(loadShape('stress', 90));
  });

  it('spike is high only during the brief impulse window', () => {
    expect(loadShape('spike', 30)).toBeGreaterThan(loadShape('spike', 0));
    expect(loadShape('spike', 0)).toBeLessThan(loadShape('spike', 30));
  });

  it('soak holds at a steady mid level', () => {
    expect(loadShape('soak', 5)).toBe(loadShape('soak', 95));
  });
});

describe('System response math', () => {
  it('latency at exactly capacity equals base latency', () => {
    for (const sys of SYSTEMS) {
      const r = systemResponse(sys, sys.capacity);
      expect(r.latency).toBeCloseTo(sys.baseLatencyMs, 5);
    }
  });

  it('latency grows non-linearly past capacity', () => {
    const sys = SYSTEMS[0];
    const a = systemResponse(sys, sys.capacity + 10).latency;
    const b = systemResponse(sys, sys.capacity + 20).latency;
    const c = systemResponse(sys, sys.capacity + 30).latency;
    expect(b - a).toBeGreaterThan(0);
    expect(c - b).toBeGreaterThan(b - a);
  });

  it('errors stay near floor below capacity and grow above', () => {
    const sys = SYSTEMS[0];
    expect(systemResponse(sys, 1).error).toBeLessThan(0.005);
    expect(systemResponse(sys, sys.capacity * 2).error).toBeGreaterThan(systemResponse(sys, sys.capacity).error);
  });

  it('percentiles place p99 above p95 above p50', () => {
    const p = percentiles(100);
    expect(p.p99).toBeGreaterThan(p.p95);
    expect(p.p95).toBeGreaterThan(p.p50);
  });
});

describe("Little's Law solver", () => {
  it('computes L from λ and W', () => {
    expect(littlesLaw({ lambda: 200, W: 0.08 })).toEqual({ L: 16 });
  });

  it('computes λ from L and W', () => {
    expect(littlesLaw({ L: 16, W: 0.08 })).toEqual({ lambda: 200 });
  });

  it('computes W from L and λ', () => {
    expect(littlesLaw({ L: 16, lambda: 200 })).toEqual({ W: 0.08 });
  });

  it('returns empty object when fewer than two inputs', () => {
    expect(littlesLaw({ L: 16 })).toEqual({});
  });
});

describe('kneeConcurrency', () => {
  it('returns a value within sensible bounds for every system', () => {
    for (const sys of SYSTEMS) {
      const k = kneeConcurrency(sys);
      expect(k).not.toBeNull();
      expect(k).toBeGreaterThan(sys.capacity);
      expect(k).toBeLessThan(sys.capacity * 3);
    }
  });
});

describe('PerformanceLoadProfileExplorer smoke', () => {
  it('renders wrap, systems, profiles, dashboard, little, bridge', () => {
    mount();
    expect(document.querySelector('[data-testid="plp-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="plp-systems"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="plp-profiles"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="plp-dashboard"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="plp-little"]')).toBeInTheDocument();
  });

  it('switching profile re-renders dashboard metrics', () => {
    mount();
    const before = document.querySelector('[data-testid="plp-met-concurrency"]').textContent;
    document.querySelector('[data-testid="plp-profile-stress"]').click();
    const after = document.querySelector('[data-testid="plp-met-concurrency"]').textContent;
    expect(after).not.toBe(before);
  });

  it("Little's Law slider updates the derived L", () => {
    mount();
    const before = document.querySelector('[data-testid="plp-ll-derived"]').textContent;
    const slider = document.querySelector('[data-testid="plp-ll-lambda"]');
    slider.value = '1000';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    const after = document.querySelector('[data-testid="plp-ll-derived"]').textContent;
    expect(after).not.toBe(before);
  });

  it('quiz: pick option B (16), submit → correct', () => {
    mount();
    document.querySelector('[data-testid="plp-quiz-start"]').click();
    document.querySelector('input[name="plp-quiz"][value="b"]').click();
    document.querySelector('[data-testid="plp-quiz-submit"]').click();
    expect(document.querySelector('[data-testid="plp-quiz-result"]').classList.contains('quiz-correct')).toBe(true);
  });

  it('lab reflect activates', () => {
    mount();
    document.querySelector('[data-testid="plp-lab-start"]').click();
    expect(document.querySelector('[data-testid="plp-lab-text"]')).toBeInTheDocument();
  });
});
