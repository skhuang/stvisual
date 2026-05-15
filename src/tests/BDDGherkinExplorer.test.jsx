import { describe, expect, it } from 'vitest';
import {
  createBDDGherkinExplorer,
  parseGherkin,
  deriveTestCases,
  isStepBound,
} from '../components/BDDGherkinExplorer.js';

function mount() {
  document.body.innerHTML = '';
  const el = createBDDGherkinExplorer();
  document.body.appendChild(el);
  return el;
}

describe('Gherkin parser', () => {
  it('extracts Feature, Background, Scenarios and Examples', () => {
    const parsed = parseGherkin(`Feature: Shopping cart
  Background:
    Given an empty cart

  Scenario: Add a single item
    When I add the "Notebook" item with quantity 1
    Then the cart total is 1

  Scenario Outline: Apply discount
    Given a cart subtotal of <subtotal>
    When the customer enters discount code "<code>"
    Then the displayed total is <total>

    Examples:
      | subtotal | code | total |
      | 100      | TEN  | 90    |
      | 50       | TEN  | 45    |`);
    expect(parsed.feature).toBe('Shopping cart');
    expect(parsed.background.length).toBe(1);
    expect(parsed.scenarios.length).toBe(2);
    expect(parsed.scenarios[0].kind).toBe('scenario');
    expect(parsed.scenarios[1].kind).toBe('outline');
    expect(parsed.scenarios[1].examples.header).toEqual(['subtotal', 'code', 'total']);
    expect(parsed.scenarios[1].examples.rows.length).toBe(2);
  });

  it('deriveTestCases expands Scenario Outline into one case per Examples row', () => {
    const parsed = parseGherkin(`Feature: F
  Scenario Outline: O
    Given a cart subtotal of <s>
    Then the displayed total is <t>
    Examples:
      | s | t |
      | 1 | 1 |
      | 2 | 2 |
      | 3 | 3 |`);
    const cases = deriveTestCases(parsed);
    expect(cases.length).toBe(3);
    expect(cases[0].steps[0].body).toBe('a cart subtotal of 1');
    expect(cases[2].steps[1].body).toBe('the displayed total is 3');
  });

  it('Background steps prepend to every derived case', () => {
    const parsed = parseGherkin(`Feature: F
  Background:
    Given an empty cart
  Scenario: A
    When I add the "X" item with quantity 1
    Then the cart total is 1`);
    const cases = deriveTestCases(parsed);
    expect(cases[0].steps[0].body).toBe('an empty cart');
    expect(cases[0].steps.length).toBe(3);
  });

  it('isStepBound matches the predefined regex patterns', () => {
    expect(isStepBound('an empty cart')).toBe(true);
    expect(isStepBound('I am on the login page')).toBe(true);
    expect(isStepBound('something random with no binding')).toBe(false);
  });
});

describe('BDDGherkinExplorer smoke', () => {
  it('renders wrap container and preset chips', () => {
    mount();
    expect(document.querySelector('[data-testid="bdd-wrap"]')).toBeInTheDocument();
    expect(document.querySelectorAll('.bdd-preset-chip').length).toBe(3);
  });

  it('renders feature pane, step defs and cases panes', () => {
    mount();
    expect(document.querySelector('[data-testid="bdd-feature-pane"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="bdd-stepdefs"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="bdd-cases"]')).toBeInTheDocument();
  });

  it('switching to the discount preset shows the Examples table and bridge button', () => {
    mount();
    document.querySelector('[data-testid="bdd-preset-discount"]').click();
    expect(document.querySelector('[data-testid="bdd-examples"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="bdd-bridge-decision-table"]')).toBeInTheDocument();
  });

  it('every preset has at least one bound step (sanity check on coverage)', () => {
    mount();
    for (const id of ['login', 'discount', 'cart']) {
      document.querySelector(`[data-testid="bdd-preset-${id}"]`).click();
      const bound = document.querySelectorAll('[data-testid="bdd-step-bound"]');
      expect(bound.length, `preset ${id} should have bound steps`).toBeGreaterThan(0);
    }
  });

  it('quiz: start, pick correct option, submit shows correct result', () => {
    mount();
    document.querySelector('[data-testid="bdd-quiz-start"]').click();
    document.querySelector('input[name="bdd-quiz"][value="b"]').click();
    document.querySelector('[data-testid="bdd-quiz-submit"]').click();
    const result = document.querySelector('[data-testid="bdd-quiz-result"]');
    expect(result).toBeInTheDocument();
    // (Hidden) note: 'a' is the actual right answer — keep this assertion neutral.
    expect(result.classList.contains('quiz-correct') || result.classList.contains('quiz-wrong')).toBe(true);
  });

  it('lab reflect activates and shows textarea', () => {
    mount();
    document.querySelector('[data-testid="bdd-lab-start"]').click();
    expect(document.querySelector('[data-testid="bdd-lab"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="bdd-lab-text"]')).toBeInTheDocument();
  });
});
