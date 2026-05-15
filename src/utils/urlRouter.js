// Single source of truth for URL ↔ application state.
//
// URL params:
//   ?section=<id>         Which section is active (omit on overview "all").
//   ?tab=<id>             Inner tab for tabbed sections (only meaningful if the
//                         current section actually has tabs).
//   ?explorer=<Component> Single param that resolves to a section + tab via
//                         EXPLORER_TO_LOCATION; takes precedence over section/tab
//                         on parse so a generated link can be short and stable.
//   ?pack=<id>            Course pack selection (highlights chip + applies its
//                         filter); when present, raw filter params are ignored.
//   ?level=...&technique=...&series=...&difficulty=...
//                         K2 filter dims (comma-separated multi-values).
//
// History strategy: `history.replaceState` everywhere so the back button keeps
// behaving like "previous user-initiated navigation" rather than burning
// entries on every chip click.

// ── Sections with internal tabs ──────────────────────────────────────
// Maps section id → { tabs: [...], default: tab }. Used for parse-time
// validation so `?tab=` from an outdated URL never enters an unknown state.
export const TAB_SECTIONS = {
  syntax:   { tabs: ['mutation', 'grammar', 'spec'],                                                  default: 'mutation' },
  blackbox: { tabs: ['bva', 'ec', 'dt', 'st', 'mt', 'et', 'td', 'pairwise', 'ceg'],                   default: 'bva' },
  advanced: { tabs: ['equivmutant', 'mutationscore', 'llmpipeline', 'testquality', 'faultdirected'], default: 'equivmutant' },
  flow:     { tabs: ['flow', 'defectCost', 'vmodel'],                                                 default: 'flow' },
  types:    { tabs: ['pyramid', 'adjuster'],                                                          default: 'pyramid' },
  // J-series acceptance tabs grow as J2-J8 land; J1 ships 'gherkin'.
  acceptance: { tabs: ['gherkin', 'usecase', 'e2ejourney', 'contract', 'perfload', 'chaos'],          default: 'gherkin' },
};

// ── ComponentName → { section, tab? } ────────────────────────────────
// Used by `?explorer=` parsing and by K5's per-Explorer Markdown links.
// Kept hand-maintained so adding/renaming an Explorer is an obvious one-liner.
export const EXPLORER_TO_LOCATION = {
  TestingMethodTree:           { section: 'methods' },
  TestingFlow:                 { section: 'flow', tab: 'flow' },
  DefectCostExplorer:          { section: 'flow', tab: 'defectCost' },
  VModelExplorer:              { section: 'flow', tab: 'vmodel' },
  TestingTypesTable:           { section: 'types', tab: 'pyramid' },
  PyramidAdjusterExplorer:     { section: 'types', tab: 'adjuster' },
  GraphCoverageExplorer:       { section: 'graph' },
  LogicCoverageExplorer:       { section: 'logic' },
  CodeCoverageExplorer:        { section: 'codecov' },
  SyntaxCoverageExplorer:      { section: 'syntax', tab: 'mutation' },
  GrammarCoverageExplorer:     { section: 'syntax', tab: 'grammar' },
  SpecMutationExplorer:        { section: 'syntax', tab: 'spec' },
  SymbolicExecutionExplorer:   { section: 'symbex' },
  ConcolicExecutionExplorer:   { section: 'concolic' },
  FuzzTestingExplorer:         { section: 'fuzz' },
  TestGenerationExplorer:      { section: 'testgen' },
  IntegrationTestingExplorer:  { section: 'inttest' },
  PropertyBasedTestingExplorer:{ section: 'pbt' },
  RiskBasedTestingExplorer:    { section: 'rbt' },
  BoundaryValueExplorer:       { section: 'blackbox', tab: 'bva' },
  EquivalenceClassExplorer:    { section: 'blackbox', tab: 'ec' },
  DecisionTableExplorer:       { section: 'blackbox', tab: 'dt' },
  StateTransitionExplorer:     { section: 'blackbox', tab: 'st' },
  PairwiseExplorer:            { section: 'blackbox', tab: 'pairwise' },
  CauseEffectExplorer:         { section: 'blackbox', tab: 'ceg' },
  MetamorphicTestingExplorer:  { section: 'blackbox', tab: 'mt' },
  ExploratoryTestingExplorer:  { section: 'blackbox', tab: 'et' },
  TestDoublesExplorer:         { section: 'blackbox', tab: 'td' },
  GroupTheoryExplorer:         { section: 'groupth' },
  EquivalentMutantExplorer:    { section: 'advanced', tab: 'equivmutant' },
  MutationScoreExplorer:       { section: 'advanced', tab: 'mutationscore' },
  LLMPipelineExplorer:         { section: 'advanced', tab: 'llmpipeline' },
  TestQualityExplorer:         { section: 'advanced', tab: 'testquality' },
  FaultDirectedTestingExplorer:{ section: 'advanced', tab: 'faultdirected' },
  BDDGherkinExplorer:          { section: 'acceptance', tab: 'gherkin' },
  UseCaseDerivationExplorer:   { section: 'acceptance', tab: 'usecase' },
  E2EUserJourneyExplorer:      { section: 'acceptance', tab: 'e2ejourney' },
  ContractTestingExplorer:     { section: 'acceptance', tab: 'contract' },
  PerformanceLoadProfileExplorer: { section: 'acceptance', tab: 'perfload' },
  ChaosEngineeringExplorer:    { section: 'acceptance', tab: 'chaos' },
};

const FILTER_DIMS = ['level', 'technique', 'series', 'difficulty'];

// ── parse ────────────────────────────────────────────────────────────

export function parseAppLocation(search) {
  const params = new URLSearchParams(search ?? '');
  const out = {};

  // ?explorer= takes precedence over ?section/?tab.
  const explorer = params.get('explorer');
  if (explorer && EXPLORER_TO_LOCATION[explorer]) {
    const loc = EXPLORER_TO_LOCATION[explorer];
    out.explorer = explorer;
    out.section = loc.section;
    if (loc.tab) out.tab = loc.tab;
  } else {
    const sec = params.get('section');
    if (sec) out.section = sec;
    const tab = params.get('tab');
    // Only accept ?tab= if it's valid for the named section.
    if (tab && out.section && TAB_SECTIONS[out.section]?.tabs.includes(tab)) {
      out.tab = tab;
    }
  }

  const pack = params.get('pack');
  if (pack) out.pack = pack;

  const filter = { level: [], technique: [], series: [], difficulty: [] };
  let anyFilter = false;
  for (const dim of FILTER_DIMS) {
    const raw = params.get(dim);
    if (raw) {
      filter[dim] = raw.split(',').filter(Boolean);
      anyFilter = true;
    }
  }
  if (anyFilter) out.filter = filter;

  return out;
}

// ── serialize ────────────────────────────────────────────────────────

// Builds the query string portion (incl. leading "?") given a state object.
// Empty / overview-only state returns ''.
//
// `packOverridesFilter` is honored: when state.pack is set, raw filter params
// are dropped from the URL (single source of truth).
export function serializeLocation(state) {
  if (!state) return '';
  const params = new URLSearchParams();

  if (state.section && state.section !== 'all') {
    params.set('section', state.section);
    const sectionInfo = TAB_SECTIONS[state.section];
    if (sectionInfo && state.tab && sectionInfo.tabs.includes(state.tab)) {
      params.set('tab', state.tab);
    }
  }

  if (state.pack) {
    params.set('pack', state.pack);
  } else if (state.filter) {
    for (const dim of FILTER_DIMS) {
      const arr = state.filter[dim];
      if (Array.isArray(arr) && arr.length > 0) params.set(dim, arr.join(','));
    }
  }

  const s = params.toString();
  return s ? `?${s}` : '';
}

// ── helpers used by app.js and K5 ────────────────────────────────────

export function explorerToUrl(componentName, baseUrl = '') {
  const loc = EXPLORER_TO_LOCATION[componentName];
  if (!loc) return baseUrl || '';
  // We could write `?section=X&tab=Y` instead, but `?explorer=X` is more
  // compact and survives explorer-to-section restructuring without breaking
  // old links (the reverse map is the only thing that needs updating).
  const url = new URL(baseUrl || 'https://example.invalid');
  url.searchParams.set('explorer', componentName);
  // When baseUrl is absent we strip the dummy origin so callers get a
  // relative-style "?explorer=…" they can paste into Markdown verbatim.
  return baseUrl
    ? url.toString()
    : `?${url.searchParams.toString()}`;
}

// Returns true iff the section actually has tabs.
export function sectionHasTabs(sectionId) {
  return Object.prototype.hasOwnProperty.call(TAB_SECTIONS, sectionId);
}

// Pick the initial tab id for a section: URL takes precedence, then a
// caller-supplied "saved" value (typically from localStorage), then default.
export function resolveInitialTab({ sectionId, urlSection, urlTab, saved }) {
  const info = TAB_SECTIONS[sectionId];
  if (!info) return null;
  if (urlSection === sectionId && urlTab && info.tabs.includes(urlTab)) return urlTab;
  if (saved && info.tabs.includes(saved)) return saved;
  return info.default;
}
