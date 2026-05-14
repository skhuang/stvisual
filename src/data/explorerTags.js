// Multi-dimensional tag metadata for every interactive Explorer.
// Source of truth for future filter UI (K2), search, and course-series
// export (K3). See Plan.md § K for the design rationale.
//
// All vocabularies are CLOSED: only values listed here may appear in
// EXPLORER_TAGS entries. The companion test in
// src/tests/explorerTags.test.js enforces this.

export const TAG_LEVELS = [
  'unit',
  'integration',
  'system',
  'e2e',
  'acceptance',
  'nonfunctional',
  'meta',
];

export const TAG_TECHNIQUES = [
  'coverage',
  'mutation',
  'fuzzing',
  'symbolic',
  'concolic',
  'property',
  'metamorphic',
  'boundary',
  'equivalence',
  'decision-table',
  'state-transition',
  'pairwise',
  'cause-effect',
  'exploratory',
  'test-doubles',
  'group-theory',
  'llm-guided',
  'bdd',
  'contract',
  'chaos',
  'risk',
  'process',
];

export const TAG_SERIES = [
  'foundations',
  'coverage-criteria',
  'execution',
  'blackbox',
  'mutation-spec',
  'group-theory',
  'ai-assisted',
  'acceptance-e2e',
];

export const TAG_DIFFICULTY = ['intro', 'intermediate', 'advanced', 'research'];

// `source` is open-ended (anything matching `paper:*`, `standard:*`, or
// `textbook` is accepted). The dim is OPTIONAL.

const ACH = 'paper:arxiv-2501.12862';
const TEXTBOOK = 'textbook';

export const EXPLORER_TAGS = {
  // ── Foundations ───────────────────────────────────────────────────
  TestingMethodTree: {
    level: ['meta'], technique: ['process'], series: ['foundations'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  TestingFlow: {
    level: ['meta'], technique: ['process'], series: ['foundations'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  TestingTypesTable: {
    level: ['meta'], technique: ['process'], series: ['foundations'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  DefectCostExplorer: {
    level: ['meta'], technique: ['process'], series: ['foundations'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  VModelExplorer: {
    level: ['meta'], technique: ['process'], series: ['foundations'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  PyramidAdjusterExplorer: {
    level: ['meta'], technique: ['process'], series: ['foundations'],
    difficulty: 'intro', source: [TEXTBOOK],
  },

  // ── Coverage Criteria ─────────────────────────────────────────────
  GraphCoverageExplorer: {
    level: ['unit'], technique: ['coverage'], series: ['coverage-criteria'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  LogicCoverageExplorer: {
    level: ['unit'], technique: ['coverage'], series: ['coverage-criteria'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  CodeCoverageExplorer: {
    level: ['unit'], technique: ['coverage'], series: ['coverage-criteria'],
    difficulty: 'intro', source: [TEXTBOOK],
  },

  // ── Mutation & Spec ───────────────────────────────────────────────
  SyntaxCoverageExplorer: {
    level: ['unit'], technique: ['mutation'], series: ['mutation-spec'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  GrammarCoverageExplorer: {
    level: ['unit'], technique: ['mutation', 'coverage'], series: ['mutation-spec'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  SpecMutationExplorer: {
    level: ['unit'], technique: ['mutation'], series: ['mutation-spec'],
    difficulty: 'advanced', source: [TEXTBOOK],
  },

  // ── Execution & Test Generation ───────────────────────────────────
  SymbolicExecutionExplorer: {
    level: ['unit'], technique: ['symbolic'], series: ['execution'],
    difficulty: 'advanced', source: [TEXTBOOK],
  },
  ConcolicExecutionExplorer: {
    level: ['unit'], technique: ['concolic'], series: ['execution'],
    difficulty: 'advanced', source: [TEXTBOOK],
  },
  FuzzTestingExplorer: {
    level: ['unit'], technique: ['fuzzing'], series: ['execution'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  TestGenerationExplorer: {
    level: ['unit'], technique: ['coverage', 'symbolic'], series: ['execution'],
    difficulty: 'advanced', source: [TEXTBOOK],
  },
  IntegrationTestingExplorer: {
    level: ['integration'], technique: ['process'], series: ['execution'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  PropertyBasedTestingExplorer: {
    level: ['unit'], technique: ['property'], series: ['execution'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  RiskBasedTestingExplorer: {
    level: ['system'], technique: ['risk', 'process'], series: ['execution'],
    difficulty: 'intro', source: [TEXTBOOK],
  },

  // ── Black-Box Test Design ─────────────────────────────────────────
  BoundaryValueExplorer: {
    level: ['unit'], technique: ['boundary'], series: ['blackbox'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  EquivalenceClassExplorer: {
    level: ['unit'], technique: ['equivalence'], series: ['blackbox'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  DecisionTableExplorer: {
    level: ['unit'], technique: ['decision-table'], series: ['blackbox'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  StateTransitionExplorer: {
    level: ['unit'], technique: ['state-transition'], series: ['blackbox'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  PairwiseExplorer: {
    level: ['system'], technique: ['pairwise'], series: ['blackbox'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  CauseEffectExplorer: {
    level: ['system'], technique: ['cause-effect', 'decision-table'], series: ['blackbox'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },
  MetamorphicTestingExplorer: {
    level: ['unit'], technique: ['metamorphic'], series: ['blackbox'],
    difficulty: 'advanced', source: [TEXTBOOK],
  },
  ExploratoryTestingExplorer: {
    level: ['system'], technique: ['exploratory'], series: ['blackbox'],
    difficulty: 'intro', source: [TEXTBOOK],
  },
  TestDoublesExplorer: {
    level: ['unit', 'integration'], technique: ['test-doubles'], series: ['blackbox'],
    difficulty: 'intermediate', source: [TEXTBOOK],
  },

  // ── Group Theory ──────────────────────────────────────────────────
  GroupTheoryExplorer: {
    level: ['unit'], technique: ['group-theory', 'coverage'], series: ['group-theory'],
    difficulty: 'research', source: [TEXTBOOK],
  },

  // ── AI-Assisted (Advanced) ────────────────────────────────────────
  EquivalentMutantExplorer: {
    level: ['unit'], technique: ['mutation', 'llm-guided'], series: ['ai-assisted'],
    difficulty: 'research', source: [ACH],
  },
  MutationScoreExplorer: {
    level: ['unit'], technique: ['mutation', 'coverage'], series: ['ai-assisted'],
    difficulty: 'research', source: [ACH],
  },
  LLMPipelineExplorer: {
    level: ['unit'], technique: ['llm-guided', 'mutation'], series: ['ai-assisted'],
    difficulty: 'research', source: [ACH],
  },
  TestQualityExplorer: {
    level: ['unit'], technique: ['llm-guided', 'process'], series: ['ai-assisted'],
    difficulty: 'research', source: [ACH],
  },
  FaultDirectedTestingExplorer: {
    level: ['unit'], technique: ['mutation', 'llm-guided'], series: ['ai-assisted'],
    difficulty: 'research', source: [ACH],
  },
};

// ── Helpers ────────────────────────────────────────────────────────

export function getExplorerTags(id) {
  return EXPLORER_TAGS[id] ?? null;
}

export function filterExplorersByTag(dim, value) {
  return Object.entries(EXPLORER_TAGS)
    .filter(([, tags]) => {
      const v = tags[dim];
      if (Array.isArray(v)) return v.includes(value);
      return v === value;
    })
    .map(([id]) => id);
}

export function listExplorersInSeries(seriesId) {
  return filterExplorersByTag('series', seriesId);
}
