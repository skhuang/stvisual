// Pure red-green-refactor state machine for Test-Driven Development.
// State: { phase, hasFailingTest, allGreen, cycleCount }.
//   phase          — 'start' | 'red' | 'green' | 'refactor'
//   hasFailingTest — a written test is not yet passing
//   allGreen       — every written test passes (vacuously true at start)
//   cycleCount     — completed red->green cycles
// No DOM, no app state. The Explorer resolves `reasonKey` with t().

const ACTIONS = ['write-failing-test', 'write-production-code', 'refactor'];

// The initial TDD state.
export function initialTddState() {
  return { phase: 'start', hasFailingTest: false, allGreen: true, cycleCount: 0 };
}

// Is `action` a TDD-legal move from `state`?
function isLegal(state, action) {
  if (action === 'write-failing-test') return !state.hasFailingTest;
  if (action === 'write-production-code') return state.hasFailingTest;
  if (action === 'refactor') {
    return state.allGreen && !state.hasFailingTest && state.cycleCount > 0;
  }
  return false;
}

// The TDD-legal actions from `state`, as a Set of action ids.
export function legalActions(state) {
  return new Set(ACTIONS.filter((a) => isLegal(state, a)));
}

// The i18n reason key for why `action` is illegal from `state`.
function reasonKey(state, action) {
  if (action === 'write-failing-test') return 'tdd.rules.reason.alreadyRed';
  if (action === 'write-production-code') return 'tdd.rules.reason.noRed';
  // refactor
  if (state.hasFailingTest) return 'tdd.rules.reason.notGreen';
  return 'tdd.rules.reason.nothingYet';
}

// Apply `action`. Legal -> { state: <next>, blocked: false }.
// Illegal -> { state: <unchanged>, blocked: true, reasonKey }.
export function applyAction(state, action) {
  if (!ACTIONS.includes(action)) {
    return { state, blocked: true, reasonKey: 'tdd.rules.reason.unknown' };
  }
  if (!isLegal(state, action)) {
    return { state, blocked: true, reasonKey: reasonKey(state, action) };
  }
  if (action === 'write-failing-test') {
    return {
      state: { ...state, phase: 'red', hasFailingTest: true, allGreen: false },
      blocked: false,
    };
  }
  if (action === 'write-production-code') {
    return {
      state: {
        ...state, phase: 'green', hasFailingTest: false, allGreen: true,
        cycleCount: state.cycleCount + 1,
      },
      blocked: false,
    };
  }
  // refactor
  return { state: { ...state, phase: 'refactor' }, blocked: false };
}
