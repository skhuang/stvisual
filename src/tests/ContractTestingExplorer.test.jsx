import { describe, expect, it } from 'vitest';
import {
  createContractTestingExplorer,
  SCENARIOS,
  verifyScenario,
  buildMatrix,
  BREAKAGE,
} from '../components/ContractTestingExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createContractTestingExplorer();
  document.body.appendChild(el);
  return el;
}

describe('Contract verification engine', () => {
  it('compatible scenario passes', () => {
    const result = verifyScenario(SCENARIOS.find((s) => s.id === 'web-orders'));
    expect(result.passed).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('extra provider field is non-breaking', () => {
    const result = verifyScenario(SCENARIOS.find((s) => s.id === 'mobile-orders'));
    expect(result.passed).toBe(true);
  });

  it('missing-required-request fires when provider adds a required field the consumer never sends', () => {
    const result = verifyScenario(SCENARIOS.find((s) => s.id === 'partner-payments'));
    expect(result.passed).toBe(false);
    const kinds = result.issues.map((i) => i.kind);
    expect(kinds).toContain(BREAKAGE.MISSING_REQUIRED_REQUEST);
  });

  it('missing-response-field fires when provider renames a response key', () => {
    const result = verifyScenario(SCENARIOS.find((s) => s.id === 'partner-payments'));
    const kinds = result.issues.map((i) => i.kind);
    expect(kinds).toContain(BREAKAGE.MISSING_RESPONSE_FIELD);
  });

  it('status-mismatch fires for HTTP status drift', () => {
    const result = verifyScenario({
      id: 'tmp', titleKey: 'x', consumerId: 'web', providerId: 'orders',
      consumer: { request: { method: 'GET', path: '/x' }, response: { status: 200, body: {} } },
      provider: { response: { status: 500, body: {} } },
    });
    expect(result.passed).toBe(false);
    expect(result.issues[0].kind).toBe(BREAKAGE.STATUS_MISMATCH);
  });

  it('buildMatrix labels every scenario cell and tracks issue counts', () => {
    const m = buildMatrix();
    expect(m.consumers).toContain('web');
    expect(m.providers).toContain('orders');
    expect(m.cells['web|orders'].passed).toBe(true);
    expect(m.cells['partner|payments'].passed).toBe(false);
    expect(m.cells['partner|payments'].issues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('ContractTestingExplorer smoke', () => {
  it('renders wrap, presets, triad, matrix', () => {
    mount();
    expect(document.querySelector('[data-testid="ct-wrap"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ct-presets"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ct-triad"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ct-matrix"]')).toBeInTheDocument();
  });

  it('default scenario passes; verdict is pass-green', () => {
    mount();
    const v = document.querySelector('[data-testid="ct-verdict"]');
    expect(v.classList.contains('ct-verdict--pass')).toBe(true);
  });

  it('switching to the breaking scenario flips the verdict to fail', () => {
    mount();
    document.querySelector('[data-testid="ct-preset-partner-payments"]').click();
    const v = document.querySelector('[data-testid="ct-verdict"]');
    expect(v.classList.contains('ct-verdict--fail')).toBe(true);
  });

  it('matrix renders per-scenario cells', () => {
    mount();
    expect(document.querySelector('[data-testid="ct-cell-web-orders"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ct-cell-partner-payments"]')).toBeInTheDocument();
  });

  it('quiz: start, pick correct option, submit shows correct result', () => {
    mount();
    document.querySelector('[data-testid="ct-quiz-start"]').click();
    document.querySelector('input[name="ct-quiz"][value="b"]').click();
    document.querySelector('[data-testid="ct-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="ct-quiz-result"]');
    expect(result.classList.contains('quiz-correct')).toBe(true);
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="ct-lab-start"]').click();
    expect(document.querySelector('[data-testid="ct-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="ct-lab-text"]')).toBeInTheDocument();
  });
});
