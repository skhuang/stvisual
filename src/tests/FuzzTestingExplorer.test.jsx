import { describe, expect, it } from 'vitest';
import { createFuzzTestingExplorer } from '../components/FuzzTestingExplorer.js';
import { fuzzTest } from '../utils/fuzzTesting.js';

function mount() {
  document.body.innerHTML = '';
  const el = createFuzzTestingExplorer();
  document.body.appendChild(el);
  return el;
}

describe('FuzzTestingExplorer smoke', () => {
  it('renders root element with correct testid', () => {
    mount();
    expect(document.querySelector('[data-testid="fuzz-explorer"]')).toBeInTheDocument();
  });

  it('renders example buttons', () => {
    mount();
    expect(document.querySelector('[data-testid="fuzz-examples"]')).toBeInTheDocument();
    const btns = document.querySelectorAll('[data-testid^="fuzz-example-"]');
    expect(btns.length).toBeGreaterThan(0);
  });

  it('renders run button and source editor', () => {
    mount();
    expect(document.querySelector('[data-testid="fuzz-run-btn"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="fuzz-source"]')).toBeInTheDocument();
  });

  it('clicking an example does not throw', () => {
    mount();
    const btn = document.querySelector('[data-testid^="fuzz-example-"]');
    expect(() => btn.click()).not.toThrow();
  });

  it('clicking run button after selecting an example does not throw', () => {
    mount();
    const exampleBtn = document.querySelector('[data-testid^="fuzz-example-"]');
    exampleBtn.click();
    const runBtn = document.querySelector('[data-testid="fuzz-run-btn"]');
    expect(() => runBtn.click()).not.toThrow();
    expect(document.querySelector('[data-testid="fuzz-summary"]')).toBeInTheDocument();
  });

  it('shows CFG area after a run', () => {
    mount();
    document.querySelector('[data-testid^="fuzz-example-"]').click();
    document.querySelector('[data-testid="fuzz-run-btn"]').click();
    expect(document.querySelector('[data-testid="fuzz-cfg"]')).toBeInTheDocument();
  });
});

describe('fuzzTest mutation engine', () => {
  const SOURCE = `function f(x) { if (x > 0) { return 1; } return -1; }`;

  it('returns the requested number of test cases', () => {
    const r = fuzzTest(SOURCE, 20);
    expect(r.testCases).toHaveLength(20);
  });

  it('second half of test cases are marked mutated', () => {
    const r = fuzzTest(SOURCE, 20);
    const mutated = r.testCases.filter((tc) => tc.mutated);
    expect(mutated.length).toBeGreaterThan(0);
  });

  it('first half are random (not mutated)', () => {
    const r = fuzzTest(SOURCE, 20);
    // seed budget = ceil(20/2) = 10; first 10 must have mutated=false
    for (let i = 0; i < 10; i++) {
      expect(r.testCases[i].mutated).toBe(false);
    }
  });

  it('all test cases have input with parameter x', () => {
    const r = fuzzTest(SOURCE, 10);
    for (const tc of r.testCases) {
      expect(Object.prototype.hasOwnProperty.call(tc.input, 'x')).toBe(true);
    }
  });
});
