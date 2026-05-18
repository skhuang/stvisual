import { createTestingMethodTree } from './components/TestingMethodTree.js';
import { createGraphCoverageExplorer } from './components/GraphCoverageExplorer.js';
import { createLogicCoverageExplorer } from './components/LogicCoverageExplorer.js';
import { createTestingFlow } from './components/TestingFlow.js';
import { createTestingTypesTable } from './components/TestingTypesTable.js';
import { createCloudStoragePanel } from './components/CloudStoragePanel.js';
import { createSyntaxCoverageExplorer } from './components/SyntaxCoverageExplorer.js';
import { createGrammarCoverageExplorer } from './components/GrammarCoverageExplorer.js';
import { createSpecMutationExplorer } from './components/SpecMutationExplorer.js';
import { createSymbolicExecutionExplorer } from './components/SymbolicExecutionExplorer.js';
import { createConcolicExecutionExplorer } from './components/ConcolicExecutionExplorer.js';
import { createFuzzTestingExplorer } from './components/FuzzTestingExplorer.js';
import { createTestGenerationExplorer } from './components/TestGenerationExplorer.js';
import { createBoundaryValueExplorer } from './components/BoundaryValueExplorer.js';
import { createEquivalenceClassExplorer } from './components/EquivalenceClassExplorer.js';
import { createDecisionTableExplorer } from './components/DecisionTableExplorer.js';
import { createStateTransitionExplorer } from './components/StateTransitionExplorer.js';
import { createMetamorphicTestingExplorer } from './components/MetamorphicTestingExplorer.js';
import { createExploratoryTestingExplorer } from './components/ExploratoryTestingExplorer.js';
import { createTestDoublesExplorer } from './components/TestDoublesExplorer.js';
import { createDefectCostExplorer } from './components/DefectCostExplorer.js';
import { createVModelExplorer } from './components/VModelExplorer.js';
import { createPyramidAdjusterExplorer } from './components/PyramidAdjusterExplorer.js';
import { createPairwiseExplorer } from './components/PairwiseExplorer.js';
import { createCauseEffectExplorer } from './components/CauseEffectExplorer.js';
import { createCodeCoverageExplorer } from './components/CodeCoverageExplorer.js';
import { createIntegrationTestingExplorer } from './components/IntegrationTestingExplorer.js';
import { createPropertyBasedTestingExplorer } from './components/PropertyBasedTestingExplorer.js';
import { createRiskBasedTestingExplorer } from './components/RiskBasedTestingExplorer.js';
import { createGroupTheoryExplorer } from './components/GroupTheoryExplorer.js';
import { createEquivalentMutantExplorer } from './components/EquivalentMutantExplorer.js';
import { createMutationScoreExplorer } from './components/MutationScoreExplorer.js';
import { createLLMPipelineExplorer } from './components/LLMPipelineExplorer.js';
import { createTestQualityExplorer } from './components/TestQualityExplorer.js';
import { createFaultDirectedTestingExplorer } from './components/FaultDirectedTestingExplorer.js';
import { createSAILORPipelineExplorer } from './components/SAILORPipelineExplorer.js';
import { createBDDGherkinExplorer } from './components/BDDGherkinExplorer.js';
import { createUseCaseDerivationExplorer } from './components/UseCaseDerivationExplorer.js';
import { createE2EUserJourneyExplorer } from './components/E2EUserJourneyExplorer.js';
import { createContractTestingExplorer } from './components/ContractTestingExplorer.js';
import { createPerformanceLoadProfileExplorer } from './components/PerformanceLoadProfileExplorer.js';
import { createChaosEngineeringExplorer } from './components/ChaosEngineeringExplorer.js';
import { createATDDCycleExplorer } from './components/ATDDCycleExplorer.js';
import { createFlakyDiagnosisExplorer } from './components/FlakyDiagnosisExplorer.js';
import { createMBTWorkflowExplorer } from './components/MBTWorkflowExplorer.js';
import { createFSMTestGenerationExplorer } from './components/FSMTestGenerationExplorer.js';
import { createWMethodConformanceExplorer } from './components/WMethodConformanceExplorer.js';
import { createEFSMGuardedTransitionExplorer } from './components/EFSMGuardedTransitionExplorer.js';
import { createUsageModelStatisticalExplorer } from './components/UsageModelStatisticalExplorer.js';
import { createModelMutationExplorer } from './components/ModelMutationExplorer.js';
import { createAgileQuadrantsExplorer } from './components/AgileQuadrantsExplorer.js';
import { createSprintCadenceExplorer } from './components/SprintCadenceExplorer.js';
import { createProgramSlicingExplorer } from './components/ProgramSlicingExplorer.js';
import { createSliceDicingExplorer } from './components/SliceDicingExplorer.js';
import { createSliceCoverageExplorer } from './components/SliceCoverageExplorer.js';
import { createDefinitionGatesExplorer } from './components/DefinitionGatesExplorer.js';
import { createExampleMappingExplorer } from './components/ExampleMappingExplorer.js';
import { createContinuousTestingPipelineExplorer } from './components/ContinuousTestingPipelineExplorer.js';
import { createRegressionDebtExplorer } from './components/RegressionDebtExplorer.js';
import { openSlideViewer } from './components/SlideViewer.js';
import { SLIDE_DECKS } from './data/slideDecks.generated.js';
import { createTagFilterBar } from './components/TagFilterBar.js';
import { createCoursePackBar } from './components/CoursePackBar.js';
import { sectionMatchesFilter } from './data/explorerTags.js';
import { getCoursePackFilter } from './data/courseSeries.js';
import {
  parseAppLocation,
  serializeLocation,
  resolveInitialTab,
} from './utils/urlRouter.js';
import { createResultViewer } from './components/ResultViewer.js';
import { createTeacherDashboard } from './components/TeacherDashboard.js';
import { buildShareUrl } from './utils/resultExporter.js';
import { t, getLocale, setLocale, onLocaleChange } from './i18n/index.js';

const learningSectionsConfig = [
  { id: 'all', key: 'section.all' },
  { id: 'methods', key: 'section.methods' },
  { id: 'graph', key: 'section.graph' },
  { id: 'logic', key: 'section.logic' },
  { id: 'syntax', key: 'section.syntax' },
  { id: 'codecov', key: 'section.codecov' },
  { id: 'groupth', key: 'section.groupth' },
  { id: 'symbex', key: 'section.symbex' },
  { id: 'concolic', key: 'section.concolic' },
  { id: 'fuzz', key: 'section.fuzz' },
  { id: 'testgen', key: 'section.testgen' },
  { id: 'pbt', key: 'section.pbt' },
  { id: 'inttest', key: 'section.inttest' },
  { id: 'rbt', key: 'section.rbt' },
  { id: 'advanced', key: 'section.advanced' },
  { id: 'acceptance', key: 'section.acceptance' },
  { id: 'mbt', key: 'section.mbt' },
  { id: 'agile', key: 'section.agile' },
  { id: 'slicing', key: 'section.slicing' },
  { id: 'blackbox', key: 'section.blackbox' },
  { id: 'flow', key: 'section.flow' },
  { id: 'types', key: 'section.types' },
];

const utilitySectionsConfig = [
  { id: 'cloud', key: 'section.cloud' },
];

const sectionSelectConfig = [...learningSectionsConfig, ...utilitySectionsConfig];
const ACTIVE_SECTION_KEY = 'stvisual.activeSection';

const overviewGroups = [
  {
    key: 'overview.group.foundations',
    sectionIds: ['methods', 'flow', 'types'],
  },
  {
    key: 'overview.group.coverage',
    sectionIds: ['graph', 'logic', 'syntax', 'codecov', 'groupth'],
  },
  {
    key: 'overview.group.execution',
    sectionIds: ['symbex', 'concolic', 'fuzz', 'testgen', 'pbt', 'inttest', 'rbt'],
  },
  {
    key: 'overview.group.blackbox',
    sectionIds: ['blackbox'],
  },
  {
    key: 'overview.group.advanced',
    sectionIds: ['advanced'],
  },
  {
    key: 'overview.group.acceptance',
    sectionIds: ['acceptance'],
  },
  {
    key: 'overview.group.mbt',
    sectionIds: ['mbt'],
  },
  {
    key: 'overview.group.agile',
    sectionIds: ['agile'],
  },
  {
    key: 'overview.group.slicing',
    sectionIds: ['slicing'],
  },
];

function loadSavedSection(urlSection) {
  // URL > localStorage > default.
  if (urlSection && learningSectionsConfig.some((s) => s.id === urlSection)) return urlSection;
  try {
    const saved = globalThis.localStorage?.getItem(ACTIVE_SECTION_KEY);
    return learningSectionsConfig.some((section) => section.id === saved) ? saved : 'all';
  } catch {
    return 'all';
  }
}

function persistActiveSection(sectionId) {
  if (!learningSectionsConfig.some((section) => section.id === sectionId)) return;
  try {
    globalThis.localStorage?.setItem(ACTIVE_SECTION_KEY, sectionId);
  } catch {
    // ignore
  }
}

export function renderApp(container) {
  // Tracks whether the initial deeplink scroll has run; reset across
  // locale-change re-paints so we don't scroll the user again after they
  // toggle the language.
  let initialDeeplinkHandled = false;

  // ?lang= URL lock: a share link can force the display language. Once a
  // lang is present in the URL (or the user picks one) the URL keeps it.
  let langInUrl = false;

  // Mirror of the most recent `location.search` we've written via
  // `syncUrl()`. The popstate handler compares against this to decide
  // whether to reload — hash-only navigation (skip-link Enter etc.)
  // changes neither lastSearchSnapshot nor `location.search`.
  let lastSearchSnapshot = globalThis.location?.search ?? '';

  function paint() {
    // Read URL state once at the top of paint() — tabbed-section setups
    // below reference it, so this MUST run before any of them.
    const urlState = parseAppLocation(
      globalThis.location?.search ?? '',
      globalThis.location?.hash ?? '',
    );
    container.innerHTML = `
      <div class="app">
        <a class="skip-link" href="#app-main">${t('app.skipMain')}</a>
        <header class="app-header">
          <div class="app-header__text">
            <h1>${t('app.title')}</h1>
            ${getLocale() === 'zh' ? `<p>${t('app.subtitle')}</p>` : ''}
          </div>
          <div class="app-header__tools">
            <button class="app-cloud-link" type="button" data-app-cloud data-testid="app-cloud-link">
              ${t('section.cloud')}
            </button>
            <div class="app-lang" role="group" aria-label="${t('app.lang.label')}">
              <label class="app-lang__label" for="app-lang-select">${t('app.lang.label')}</label>
              <select id="app-lang-select" data-testid="app-lang-select">
                <option value="en"${getLocale() === 'en' ? ' selected' : ''}>${t('app.lang.en')}</option>
                <option value="zh"${getLocale() === 'zh' ? ' selected' : ''}>${t('app.lang.zh')}</option>
              </select>
            </div>
          </div>
        </header>

        <nav class="app-nav" aria-label="${t('app.nav.aria')}" data-testid="app-nav"></nav>

        <main class="app-main" id="app-main" tabindex="-1">
          <section class="overview-section" data-testid="section-overview" tabindex="-1" aria-labelledby="section-overview-title">
            <div class="overview-section__header">
              <h2 id="section-overview-title">${t('section.all')}</h2>
              <p>${t('app.overview.subtitle')}</p>
            </div>
            <div class="overview-packs" data-testid="overview-packs"></div>
            <div class="overview-filter" data-testid="overview-filter"></div>
            <div class="overview-grid__counter" data-testid="overview-counter"></div>
            <div class="overview-grid" data-testid="overview-grid"></div>
          </section>
          <section data-testid="section-methods" tabindex="-1" aria-labelledby="section-methods-title"><h2 id="section-methods-title">${t('section.methods.title')}</h2><div data-slot="methods"></div></section>
          <section data-testid="section-graph" tabindex="-1" aria-labelledby="section-graph-title"><h2 id="section-graph-title">${t('section.graph.title')}</h2><div data-slot="graph"></div></section>
          <section data-testid="section-logic" tabindex="-1" aria-labelledby="section-logic-title"><h2 id="section-logic-title">${t('section.logic.title')}</h2><div data-slot="logic"></div></section>
          <section data-testid="section-syntax" tabindex="-1" aria-labelledby="section-syntax-title"><h2 id="section-syntax-title">${t('section.syntax.title')}</h2><div data-slot="syntax"></div></section>
          <section data-testid="section-codecov" tabindex="-1" aria-labelledby="section-codecov-title"><h2 id="section-codecov-title">${t('section.codecov.title')}</h2><div data-slot="codecov"></div></section>
          <section data-testid="section-groupth" tabindex="-1" aria-labelledby="section-groupth-title"><h2 id="section-groupth-title">${t('section.groupth.title')}</h2><div data-slot="groupth"></div></section>
          <section data-testid="section-symbex" tabindex="-1" aria-labelledby="section-symbex-title"><h2 id="section-symbex-title">${t('section.symbex.title')}</h2><div data-slot="symbex"></div></section>
          <section data-testid="section-concolic" tabindex="-1" aria-labelledby="section-concolic-title"><h2 id="section-concolic-title">${t('section.concolic.title')}</h2><div data-slot="concolic"></div></section>
          <section data-testid="section-fuzz" tabindex="-1" aria-labelledby="section-fuzz-title"><h2 id="section-fuzz-title">${t('section.fuzz.title')}</h2><div data-slot="fuzz"></div></section>
          <section data-testid="section-testgen" tabindex="-1" aria-labelledby="section-testgen-title"><h2 id="section-testgen-title">${t('section.testgen.title')}</h2><div data-slot="testgen"></div></section>
          <section data-testid="section-pbt" tabindex="-1" aria-labelledby="section-pbt-title"><h2 id="section-pbt-title">${t('section.pbt.title')}</h2><div data-slot="pbt"></div></section>
          <section data-testid="section-inttest" tabindex="-1" aria-labelledby="section-inttest-title"><h2 id="section-inttest-title">${t('section.inttest.title')}</h2><div data-slot="inttest"></div></section>
          <section data-testid="section-rbt" tabindex="-1" aria-labelledby="section-rbt-title"><h2 id="section-rbt-title">${t('section.rbt.title')}</h2><div data-slot="rbt"></div></section>
          <section data-testid="section-advanced" tabindex="-1" aria-labelledby="section-advanced-title"><h2 id="section-advanced-title">${t('section.advanced.title')}</h2><div data-slot="advanced"></div></section>
          <section data-testid="section-acceptance" tabindex="-1" aria-labelledby="section-acceptance-title"><h2 id="section-acceptance-title">${t('section.acceptance.title')}</h2><div data-slot="acceptance"></div></section>
          <section data-testid="section-mbt" tabindex="-1" aria-labelledby="section-mbt-title"><h2 id="section-mbt-title">${t('section.mbt.title')}</h2><div data-slot="mbt"></div></section>
          <section data-testid="section-agile" tabindex="-1" aria-labelledby="section-agile-title"><h2 id="section-agile-title">${t('section.agile.title')}</h2><div data-slot="agile"></div></section>
          <section data-testid="section-slicing" tabindex="-1" aria-labelledby="section-slicing-title"><h2 id="section-slicing-title">${t('section.slicing.title')}</h2><div data-slot="slicing"></div></section>
          <section data-testid="section-blackbox" tabindex="-1" aria-labelledby="section-blackbox-title"><h2 id="section-blackbox-title">${t('section.blackbox.title')}</h2><div data-slot="blackbox"></div></section>
          <section data-testid="section-flow" tabindex="-1" aria-labelledby="section-flow-title"><h2 id="section-flow-title">${t('section.flow.title')}</h2><div data-slot="flow"></div></section>
          <section data-testid="section-types" tabindex="-1" aria-labelledby="section-types-title"><h2 id="section-types-title">${t('section.types.title')}</h2><div data-slot="types"></div></section>
        </main>

        <div class="cloud-drawer" data-testid="cloud-settings-drawer" hidden>
          <button class="cloud-drawer__backdrop" type="button" data-cloud-close tabindex="-1" aria-label="${t('common.close')}"></button>
          <aside class="cloud-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="cloud-drawer-title" tabindex="-1">
            <header class="cloud-drawer__header">
              <div>
                <p>${t('cloud.kicker')}</p>
                <h2 id="cloud-drawer-title">${t('section.cloud.title')}</h2>
              </div>
              <button class="cloud-drawer__close" type="button" data-cloud-close aria-label="${t('common.close')}">×</button>
            </header>
            <div class="cloud-drawer__body" data-slot="cloud"></div>
          </aside>
        </div>

        <footer class="app-footer">
          <p>${t('app.footer')}</p>
        </footer>
      </div>
    `;

    const nav = container.querySelector('.app-nav');
    const main = container.querySelector('.app-main');
    const sections = {
      overview: main.querySelector('[data-testid="section-overview"]'),
      methods: main.querySelector('[data-testid="section-methods"]'),
      graph: main.querySelector('[data-testid="section-graph"]'),
      logic: main.querySelector('[data-testid="section-logic"]'),
      syntax: main.querySelector('[data-testid="section-syntax"]'),
      codecov: main.querySelector('[data-testid="section-codecov"]'),
      groupth: main.querySelector('[data-testid="section-groupth"]'),
      symbex: main.querySelector('[data-testid="section-symbex"]'),
      concolic: main.querySelector('[data-testid="section-concolic"]'),
      fuzz: main.querySelector('[data-testid="section-fuzz"]'),
      testgen: main.querySelector('[data-testid="section-testgen"]'),
      pbt: main.querySelector('[data-testid="section-pbt"]'),
      inttest: main.querySelector('[data-testid="section-inttest"]'),
      rbt: main.querySelector('[data-testid="section-rbt"]'),
      advanced: main.querySelector('[data-testid="section-advanced"]'),
      acceptance: main.querySelector('[data-testid="section-acceptance"]'),
      mbt: main.querySelector('[data-testid="section-mbt"]'),
      agile: main.querySelector('[data-testid="section-agile"]'),
      slicing: main.querySelector('[data-testid="section-slicing"]'),
      blackbox: main.querySelector('[data-testid="section-blackbox"]'),
      flow: main.querySelector('[data-testid="section-flow"]'),
      types: main.querySelector('[data-testid="section-types"]'),
    };

    // A stable `id` per section so a `#section-<id>` hash can deep-link to it.
    for (const [sectionId, el] of Object.entries(sections)) {
      if (el) el.id = `section-${sectionId}`;
    }

    // Attach a "course slides" button to every section that owns decks.
    const sectionsWithDecks = [...new Set(SLIDE_DECKS.map((d) => d.section))];
    for (const sectionId of sectionsWithDecks) {
      const node = sections[sectionId];
      const heading = node?.querySelector('h2');
      if (!heading) continue;
      const headingRow = document.createElement('div');
      headingRow.className = 'section-heading-row';
      heading.parentNode.insertBefore(headingRow, heading);
      headingRow.appendChild(heading);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'section-slides-btn';
      btn.dataset.testid = `slides-btn-${sectionId}`;
      btn.textContent = t('slides.open');
      btn.addEventListener('click', () => openSlideViewer(sectionId));
      headingRow.appendChild(btn);
    }

    const components = {
      methods: createTestingMethodTree(),
      graph: createGraphCoverageExplorer(),
      logic: createLogicCoverageExplorer(),
      syntax: createSyntaxCoverageExplorer(),
      grammar: createGrammarCoverageExplorer(),
      specMutation: createSpecMutationExplorer(),
      symbex: createSymbolicExecutionExplorer(),
      concolic: createConcolicExecutionExplorer(),
      fuzz: createFuzzTestingExplorer(),
      testgen: createTestGenerationExplorer(),
      bva: createBoundaryValueExplorer(),
      ec: createEquivalenceClassExplorer(),
      dt: createDecisionTableExplorer(),
      st: createStateTransitionExplorer(),
      mt: createMetamorphicTestingExplorer(),
      et: createExploratoryTestingExplorer(),
      td: createTestDoublesExplorer(),
      pairwise: createPairwiseExplorer(),
      ceg: createCauseEffectExplorer(),
      codecov: createCodeCoverageExplorer(),
      inttest: createIntegrationTestingExplorer(),
      pbt: createPropertyBasedTestingExplorer(),
      rbt: createRiskBasedTestingExplorer(),
      groupth: createGroupTheoryExplorer(),
      equivmutant: createEquivalentMutantExplorer(),
      mutationscore: createMutationScoreExplorer(),
      llmpipeline: createLLMPipelineExplorer(),
      testquality: createTestQualityExplorer(),
      faultdirected: createFaultDirectedTestingExplorer(),
      sailor: createSAILORPipelineExplorer(),
      gherkin: createBDDGherkinExplorer(),
      usecase: createUseCaseDerivationExplorer(),
      e2ejourney: createE2EUserJourneyExplorer(),
      contract: createContractTestingExplorer(),
      perfload: createPerformanceLoadProfileExplorer(),
      chaos: createChaosEngineeringExplorer(),
      atdd: createATDDCycleExplorer(),
      flaky: createFlakyDiagnosisExplorer(),
      mbtworkflow: createMBTWorkflowExplorer(),
      fsmgen: createFSMTestGenerationExplorer(),
      wmethod: createWMethodConformanceExplorer(),
      efsm: createEFSMGuardedTransitionExplorer(),
      usage: createUsageModelStatisticalExplorer(),
      modelmut: createModelMutationExplorer(),
      agilequadrants: createAgileQuadrantsExplorer(),
      sprintcadence: createSprintCadenceExplorer(),
      programslicing: createProgramSlicingExplorer(),
      dicing: createSliceDicingExplorer(),
      coverage: createSliceCoverageExplorer(),
      definitiongates: createDefinitionGatesExplorer(),
      examplemapping: createExampleMappingExplorer(),
      ctpipeline: createContinuousTestingPipelineExplorer(),
      regressiondebt: createRegressionDebtExplorer(),
      cloud: createCloudStoragePanel(),
      flow: createTestingFlow(),
      defectCost: createDefectCostExplorer(),
      vmodel: createVModelExplorer(),
      types: createTestingTypesTable(),
      pyramid: createPyramidAdjusterExplorer(),
    };

    container.querySelector('[data-slot="methods"]').appendChild(components.methods);
    container.querySelector('[data-slot="graph"]').appendChild(components.graph);
    container.querySelector('[data-slot="logic"]').appendChild(components.logic);
    container.querySelector('[data-slot="codecov"]').appendChild(components.codecov);
    container.querySelector('[data-slot="inttest"]').appendChild(components.inttest);
    container.querySelector('[data-slot="pbt"]').appendChild(components.pbt);
    container.querySelector('[data-slot="rbt"]').appendChild(components.rbt);
    container.querySelector('[data-slot="groupth"]').appendChild(components.groupth);

    // --- Advanced Testing: two-level nav — paper selector → that paper's tabs ---
    // Each research paper groups its Explorers; the leaf tab id stays the URL
    // identifier (?explorer / ?tab), so K4 routing is untouched. The paper
    // level is a pure UI grouping derived from whichever leaf tab is active.
    const advancedPapers = [
      {
        id: 'ach',
        labelKey: 'advPaper.ach',
        tabs: [
          { id: 'equivmutant',   key: 'advTab.equivmutant',   component: components.equivmutant },
          { id: 'mutationscore', key: 'advTab.mutationscore', component: components.mutationscore },
          { id: 'llmpipeline',   key: 'advTab.llmpipeline',   component: components.llmpipeline },
          { id: 'testquality',   key: 'advTab.testquality',   component: components.testquality },
          { id: 'faultdirected', key: 'advTab.faultdirected', component: components.faultdirected },
        ],
      },
      {
        id: 'sailor',
        labelKey: 'advPaper.sailor',
        tabs: [
          { id: 'sailor', key: 'advTab.sailor', component: components.sailor },
        ],
      },
    ];
    // Flattened — drives panel creation and resolveInitialTab.
    const advancedTabs = advancedPapers.flatMap((p) => p.tabs);
    const paperOfAdvancedTab = (tabId) =>
      advancedPapers.find((p) => p.tabs.some((tb) => tb.id === tabId)) || advancedPapers[0];

    const advancedSlot = container.querySelector('[data-slot="advanced"]');
    const advancedPaperBar = document.createElement('nav');
    advancedPaperBar.className = 'adv-paper-row';
    advancedPaperBar.dataset.testid = 'advanced-paper-row';
    advancedPaperBar.setAttribute('role', 'tablist');
    advancedSlot.appendChild(advancedPaperBar);
    const advancedTabBar = document.createElement('nav');
    advancedTabBar.className = 'syntax-tab-row';
    advancedTabBar.dataset.testid = 'advanced-tab-row';
    advancedTabBar.setAttribute('role', 'tablist');
    advancedSlot.appendChild(advancedTabBar);
    const advancedPanels = document.createElement('div');
    advancedPanels.className = 'syntax-tab-panels';
    advancedSlot.appendChild(advancedPanels);
    for (const tab of advancedTabs) {
      const panel = document.createElement('div');
      panel.className = 'syntax-tab-panel';
      panel.dataset.advancedPanel = tab.id;
      panel.appendChild(tab.component);
      advancedPanels.appendChild(panel);
    }
    const ADVANCED_TAB_KEY = 'stvisual.advancedActiveTab';
    let savedAdvancedTab = null;
    try { savedAdvancedTab = globalThis.localStorage?.getItem(ADVANCED_TAB_KEY); } catch {}
    let activeAdvancedTab = resolveInitialTab({
      sectionId: 'advanced',
      urlSection: urlState.section,
      urlTab: urlState.tab,
      saved: savedAdvancedTab,
    });
    let activeAdvancedPaper = paperOfAdvancedTab(activeAdvancedTab).id;

    function renderAdvancedPaperBar() {
      advancedPaperBar.innerHTML = advancedPapers.map((paper) => `
        <button type="button"
          class="adv-paper-btn${activeAdvancedPaper === paper.id ? ' active' : ''}"
          data-advanced-paper="${paper.id}"
          role="tab"
          aria-selected="${activeAdvancedPaper === paper.id ? 'true' : 'false'}"
        >${t(paper.labelKey)}</button>
      `).join('');
      advancedPaperBar.querySelectorAll('[data-advanced-paper]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const paper = advancedPapers.find((p) => p.id === btn.dataset.advancedPaper);
          if (!paper) return;
          activeAdvancedPaper = paper.id;
          activeAdvancedTab = paper.tabs[0].id;  // jump to the paper's first Explorer
          try { globalThis.localStorage?.setItem(ADVANCED_TAB_KEY, activeAdvancedTab); } catch {}
          renderAdvancedPaperBar();
          renderAdvancedTabs();
          updateAdvancedPanels();
          if (activeSection === 'advanced') syncUrl();
        });
      });
    }
    function renderAdvancedTabs() {
      // Render every leaf tab, but `hidden` the ones outside the active
      // paper. They stay in the DOM so a cross-section bridge that does
      // `[data-advanced-tab="testquality"].click()` works regardless of
      // which paper is currently showing — the click handler re-derives
      // the paper and re-renders both bars.
      advancedTabBar.innerHTML = advancedPapers.flatMap((paper) =>
        paper.tabs.map((tab) => `
          <button type="button"
            class="syntax-tab-btn${activeAdvancedTab === tab.id ? ' active' : ''}"
            data-advanced-tab="${tab.id}"
            role="tab"
            aria-selected="${activeAdvancedTab === tab.id ? 'true' : 'false'}"
            ${paper.id === activeAdvancedPaper ? '' : 'hidden'}
          >${t(tab.key)}</button>
        `)).join('');
      advancedTabBar.querySelectorAll('[data-advanced-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeAdvancedTab = btn.dataset.advancedTab;
          activeAdvancedPaper = paperOfAdvancedTab(activeAdvancedTab).id;
          try { globalThis.localStorage?.setItem(ADVANCED_TAB_KEY, activeAdvancedTab); } catch {}
          renderAdvancedPaperBar();
          renderAdvancedTabs();
          updateAdvancedPanels();
          if (activeSection === 'advanced') syncUrl();
        });
      });
    }
    function updateAdvancedPanels() {
      advancedPanels.querySelectorAll('[data-advanced-panel]').forEach((panel) => {
        panel.style.display = panel.dataset.advancedPanel === activeAdvancedTab ? '' : 'none';
      });
    }
    renderAdvancedPaperBar();
    renderAdvancedTabs();
    updateAdvancedPanels();

    // --- Acceptance & E2E: tabbed (J1 Gherkin; J2–J8 land in subsequent PRs) ---
    const acceptanceTabs = [
      { id: 'gherkin', key: 'acceptanceTab.gherkin', component: components.gherkin },
      { id: 'usecase', key: 'acceptanceTab.usecase', component: components.usecase },
      { id: 'e2ejourney', key: 'acceptanceTab.e2ejourney', component: components.e2ejourney },
      { id: 'contract', key: 'acceptanceTab.contract', component: components.contract },
      { id: 'perfload', key: 'acceptanceTab.perfload', component: components.perfload },
      { id: 'chaos', key: 'acceptanceTab.chaos', component: components.chaos },
      { id: 'atdd', key: 'acceptanceTab.atdd', component: components.atdd },
      { id: 'flaky', key: 'acceptanceTab.flaky', component: components.flaky },
    ];
    const acceptanceSlot = container.querySelector('[data-slot="acceptance"]');
    const acceptanceTabBar = document.createElement('nav');
    acceptanceTabBar.className = 'syntax-tab-row';
    acceptanceTabBar.dataset.testid = 'acceptance-tab-row';
    acceptanceTabBar.setAttribute('role', 'tablist');
    acceptanceSlot.appendChild(acceptanceTabBar);
    const acceptancePanels = document.createElement('div');
    acceptancePanels.className = 'syntax-tab-panels';
    acceptanceSlot.appendChild(acceptancePanels);
    for (const tab of acceptanceTabs) {
      const panel = document.createElement('div');
      panel.className = 'syntax-tab-panel';
      panel.dataset.acceptancePanel = tab.id;
      panel.appendChild(tab.component);
      acceptancePanels.appendChild(panel);
    }
    const ACCEPTANCE_TAB_KEY = 'stvisual.acceptanceActiveTab';
    let savedAcceptanceTab = null;
    try { savedAcceptanceTab = globalThis.localStorage?.getItem(ACCEPTANCE_TAB_KEY); } catch {}
    let activeAcceptanceTab = resolveInitialTab({
      sectionId: 'acceptance',
      urlSection: urlState.section,
      urlTab: urlState.tab,
      saved: savedAcceptanceTab,
    });
    function renderAcceptanceTabs() {
      acceptanceTabBar.innerHTML = acceptanceTabs.map((tab) => `
        <button type="button"
          class="syntax-tab-btn${activeAcceptanceTab === tab.id ? ' active' : ''}"
          data-acceptance-tab="${tab.id}"
          role="tab"
          aria-selected="${activeAcceptanceTab === tab.id ? 'true' : 'false'}"
        >${t(tab.key)}</button>
      `).join('');
      acceptanceTabBar.querySelectorAll('[data-acceptance-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeAcceptanceTab = btn.dataset.acceptanceTab;
          try { globalThis.localStorage?.setItem(ACCEPTANCE_TAB_KEY, activeAcceptanceTab); } catch {}
          renderAcceptanceTabs();
          updateAcceptancePanels();
          if (activeSection === 'acceptance') syncUrl();
        });
      });
    }
    function updateAcceptancePanels() {
      acceptancePanels.querySelectorAll('[data-acceptance-panel]').forEach((panel) => {
        panel.style.display = panel.dataset.acceptancePanel === activeAcceptanceTab ? '' : 'none';
      });
    }
    renderAcceptanceTabs();
    updateAcceptancePanels();

    // --- Model-Based Testing: tabbed (L1 Workflow; L2–L6 land in subsequent PRs) ---
    const mbtTabs = [
      { id: 'workflow', key: 'mbtTab.workflow', component: components.mbtworkflow },
      { id: 'fsmgen', key: 'mbtTab.fsmgen', component: components.fsmgen },
      { id: 'wmethod', key: 'mbtTab.wmethod', component: components.wmethod },
      { id: 'efsm', key: 'mbtTab.efsm', component: components.efsm },
      { id: 'usage', key: 'mbtTab.usage', component: components.usage },
      { id: 'modelmut', key: 'mbtTab.modelmut', component: components.modelmut },
    ];
    const mbtSlot = container.querySelector('[data-slot="mbt"]');
    const mbtTabBar = document.createElement('nav');
    mbtTabBar.className = 'syntax-tab-row';
    mbtTabBar.dataset.testid = 'mbt-tab-row';
    mbtTabBar.setAttribute('role', 'tablist');
    mbtSlot.appendChild(mbtTabBar);
    const mbtPanels = document.createElement('div');
    mbtPanels.className = 'syntax-tab-panels';
    mbtSlot.appendChild(mbtPanels);
    for (const tab of mbtTabs) {
      const panel = document.createElement('div');
      panel.className = 'syntax-tab-panel';
      panel.dataset.mbtPanel = tab.id;
      panel.appendChild(tab.component);
      mbtPanels.appendChild(panel);
    }
    const MBT_TAB_KEY = 'stvisual.mbtActiveTab';
    let savedMbtTab = null;
    try { savedMbtTab = globalThis.localStorage?.getItem(MBT_TAB_KEY); } catch {}
    let activeMbtTab = resolveInitialTab({
      sectionId: 'mbt',
      urlSection: urlState.section,
      urlTab: urlState.tab,
      saved: savedMbtTab,
    });
    function renderMbtTabs() {
      mbtTabBar.innerHTML = mbtTabs.map((tab) => `
        <button type="button"
          class="syntax-tab-btn${activeMbtTab === tab.id ? ' active' : ''}"
          data-mbt-tab="${tab.id}"
          role="tab"
          aria-selected="${activeMbtTab === tab.id ? 'true' : 'false'}"
        >${t(tab.key)}</button>
      `).join('');
      mbtTabBar.querySelectorAll('[data-mbt-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeMbtTab = btn.dataset.mbtTab;
          try { globalThis.localStorage?.setItem(MBT_TAB_KEY, activeMbtTab); } catch {}
          renderMbtTabs();
          updateMbtPanels();
          if (activeSection === 'mbt') syncUrl();
        });
      });
    }
    function updateMbtPanels() {
      mbtPanels.querySelectorAll('[data-mbt-panel]').forEach((panel) => {
        panel.style.display = panel.dataset.mbtPanel === activeMbtTab ? '' : 'none';
      });
    }
    renderMbtTabs();
    updateMbtPanels();

    // --- Agile Testing: tabbed (M1 Quadrants; M2-M6 land in subsequent PRs) ---
    const agileTabs = [
      { id: 'quadrants', key: 'agileTab.quadrants', component: components.agilequadrants },
      { id: 'cadence', key: 'agileTab.cadence', component: components.sprintcadence },
      { id: 'gates', key: 'agileTab.gates', component: components.definitiongates },
      { id: 'examplemap', key: 'agileTab.examplemap', component: components.examplemapping },
      { id: 'pipeline', key: 'agileTab.pipeline', component: components.ctpipeline },
      { id: 'regression', key: 'agileTab.regression', component: components.regressiondebt },
    ];
    const agileSlot = container.querySelector('[data-slot="agile"]');
    const agileTabBar = document.createElement('nav');
    agileTabBar.className = 'syntax-tab-row';
    agileTabBar.dataset.testid = 'agile-tab-row';
    agileTabBar.setAttribute('role', 'tablist');
    agileSlot.appendChild(agileTabBar);
    const agilePanels = document.createElement('div');
    agilePanels.className = 'syntax-tab-panels';
    agileSlot.appendChild(agilePanels);
    for (const tab of agileTabs) {
      const panel = document.createElement('div');
      panel.className = 'syntax-tab-panel';
      panel.dataset.agilePanel = tab.id;
      panel.appendChild(tab.component);
      agilePanels.appendChild(panel);
    }
    const AGILE_TAB_KEY = 'stvisual.agileActiveTab';
    let savedAgileTab = null;
    try { savedAgileTab = globalThis.localStorage?.getItem(AGILE_TAB_KEY); } catch {}
    let activeAgileTab = resolveInitialTab({
      sectionId: 'agile',
      urlSection: urlState.section,
      urlTab: urlState.tab,
      saved: savedAgileTab,
    });
    function renderAgileTabs() {
      agileTabBar.innerHTML = agileTabs.map((tab) => `
        <button type="button"
          class="syntax-tab-btn${activeAgileTab === tab.id ? ' active' : ''}"
          data-agile-tab="${tab.id}"
          role="tab"
          aria-selected="${activeAgileTab === tab.id ? 'true' : 'false'}"
        >${t(tab.key)}</button>
      `).join('');
      agileTabBar.querySelectorAll('[data-agile-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeAgileTab = btn.dataset.agileTab;
          try { globalThis.localStorage?.setItem(AGILE_TAB_KEY, activeAgileTab); } catch {}
          renderAgileTabs();
          updateAgilePanels();
          if (activeSection === 'agile') syncUrl();
        });
      });
    }
    function updateAgilePanels() {
      agilePanels.querySelectorAll('[data-agile-panel]').forEach((panel) => {
        panel.style.display = panel.dataset.agilePanel === activeAgileTab ? '' : 'none';
      });
    }
    renderAgileTabs();
    updateAgilePanels();

    // --- Slice-Based Testing: tabbed (N1 Program Slicing, N2 Dicing live; N3-N4 are placeholders) ---
    const slicingSlot = container.querySelector('[data-slot="slicing"]');
    const slicingTabBar = document.createElement('nav');
    slicingTabBar.className = 'syntax-tab-row';
    slicingTabBar.dataset.testid = 'slicing-tab-row';
    slicingTabBar.setAttribute('role', 'tablist');
    slicingSlot.appendChild(slicingTabBar);
    const slicingPanels = document.createElement('div');
    slicingPanels.className = 'syntax-tab-panels';
    slicingSlot.appendChild(slicingPanels);

    // program / dicing / coverage panels get real components; regression is a placeholder
    const slicingTabDefs = ['program', 'dicing', 'coverage', 'regression'];
    for (const tabId of slicingTabDefs) {
      const panel = document.createElement('div');
      panel.className = 'syntax-tab-panel';
      panel.dataset.slicingPanel = tabId;
      if (tabId === 'program') {
        panel.appendChild(components.programslicing);
      } else if (tabId === 'dicing') {
        panel.appendChild(components.dicing);
      } else if (tabId === 'coverage') {
        panel.appendChild(components.coverage);
      } else {
        const placeholder = document.createElement('p');
        placeholder.textContent = t('slicing.tab.comingSoon');
        panel.appendChild(placeholder);
      }
      slicingPanels.appendChild(panel);
    }

    const SLICING_TAB_KEY = 'stvisual.slicingActiveTab';
    let savedSlicingTab = null;
    try { savedSlicingTab = globalThis.localStorage?.getItem(SLICING_TAB_KEY); } catch {}
    let activeSlicingTab = resolveInitialTab({
      sectionId: 'slicing',
      urlSection: urlState.section,
      urlTab: urlState.tab,
      saved: savedSlicingTab,
    });

    const slicingTabItems = [
      { id: 'program',    key: 'slicing.tab.program' },
      { id: 'dicing',     key: 'slicing.tab.dicing' },
      { id: 'coverage',   key: 'slicing.tab.coverage' },
      { id: 'regression', key: 'slicing.tab.regression' },
    ];

    function renderSlicingTabs() {
      slicingTabBar.innerHTML = slicingTabItems.map((tab) => `
        <button type="button"
          class="syntax-tab-btn${activeSlicingTab === tab.id ? ' active' : ''}"
          data-slicing-tab="${tab.id}"
          role="tab"
          aria-selected="${activeSlicingTab === tab.id ? 'true' : 'false'}"
        >${t(tab.key)}</button>
      `).join('');
      slicingTabBar.querySelectorAll('[data-slicing-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeSlicingTab = btn.dataset.slicingTab;
          try { globalThis.localStorage?.setItem(SLICING_TAB_KEY, activeSlicingTab); } catch {}
          renderSlicingTabs();
          updateSlicingPanels();
          if (activeSection === 'slicing') syncUrl();
        });
      });
    }
    function updateSlicingPanels() {
      slicingPanels.querySelectorAll('[data-slicing-panel]').forEach((panel) => {
        panel.style.display = panel.dataset.slicingPanel === activeSlicingTab ? '' : 'none';
      });
    }
    renderSlicingTabs();
    updateSlicingPanels();

    // --- Syntax-Based Testing: tabbed submenu over three sub-modules ---
    const syntaxTabs = [
      { id: 'mutation', key: 'syntaxTab.mutation', component: components.syntax },
      { id: 'grammar',  key: 'syntaxTab.grammar',  component: components.grammar },
      { id: 'spec',     key: 'syntaxTab.spec',     component: components.specMutation },
    ];
    const syntaxSlot = container.querySelector('[data-slot="syntax"]');
    const syntaxTabBar = document.createElement('nav');
    syntaxTabBar.className = 'syntax-tab-row';
    syntaxTabBar.dataset.testid = 'syntax-tab-row';
    syntaxTabBar.setAttribute('role', 'tablist');
    syntaxSlot.appendChild(syntaxTabBar);
    const syntaxPanels = document.createElement('div');
    syntaxPanels.className = 'syntax-tab-panels';
    syntaxSlot.appendChild(syntaxPanels);
    for (const tab of syntaxTabs) {
      const panel = document.createElement('div');
      panel.className = 'syntax-tab-panel';
      panel.dataset.syntaxPanel = tab.id;
      panel.appendChild(tab.component);
      syntaxPanels.appendChild(panel);
    }
    const SYNTAX_TAB_KEY = 'stvisual.syntaxActiveTab';
    let savedSyntaxTab = null;
    try { savedSyntaxTab = globalThis.localStorage?.getItem(SYNTAX_TAB_KEY); } catch {}
    let activeSyntaxTab = resolveInitialTab({
      sectionId: 'syntax',
      urlSection: urlState.section,
      urlTab: urlState.tab,
      saved: savedSyntaxTab,
    });
    function renderSyntaxTabs() {
      syntaxTabBar.innerHTML = syntaxTabs.map((tab) => `
        <button type="button"
          class="syntax-tab-btn${activeSyntaxTab === tab.id ? ' active' : ''}"
          data-syntax-tab="${tab.id}"
          role="tab"
          aria-selected="${activeSyntaxTab === tab.id ? 'true' : 'false'}"
        >${t(tab.key)}</button>
      `).join('');
      syntaxTabBar.querySelectorAll('[data-syntax-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeSyntaxTab = btn.dataset.syntaxTab;
          try { globalThis.localStorage?.setItem(SYNTAX_TAB_KEY, activeSyntaxTab); } catch {}
          renderSyntaxTabs();
          updateSyntaxPanels();
          if (activeSection === 'syntax') syncUrl();
        });
      });
    }
    function updateSyntaxPanels() {
      syntaxPanels.querySelectorAll('[data-syntax-panel]').forEach((panel) => {
        panel.style.display = panel.dataset.syntaxPanel === activeSyntaxTab ? '' : 'none';
      });
    }
    renderSyntaxTabs();
    updateSyntaxPanels();

    // --- Black-Box Testing: BVA + EC tabs ---
    const blackboxTabs = [
      { id: 'bva', key: 'blackboxTab.bva', component: components.bva },
      { id: 'ec',  key: 'blackboxTab.ec',  component: components.ec },
      { id: 'dt',  key: 'blackboxTab.dt',  component: components.dt },
      { id: 'st',  key: 'blackboxTab.st',  component: components.st },
      { id: 'mt',  key: 'blackboxTab.mt',  component: components.mt },
      { id: 'et',  key: 'blackboxTab.et',  component: components.et },
      { id: 'td',  key: 'blackboxTab.td',  component: components.td },
      { id: 'pairwise', key: 'blackboxTab.pairwise', component: components.pairwise },
      { id: 'ceg',      key: 'blackboxTab.ceg',      component: components.ceg },
    ];
    const blackboxSlot = container.querySelector('[data-slot="blackbox"]');
    const blackboxTabBar = document.createElement('nav');
    blackboxTabBar.className = 'syntax-tab-row';
    blackboxTabBar.dataset.testid = 'blackbox-tab-row';
    blackboxTabBar.setAttribute('role', 'tablist');
    blackboxSlot.appendChild(blackboxTabBar);
    const blackboxPanels = document.createElement('div');
    blackboxPanels.className = 'syntax-tab-panels';
    blackboxSlot.appendChild(blackboxPanels);
    for (const tab of blackboxTabs) {
      const panel = document.createElement('div');
      panel.className = 'syntax-tab-panel';
      panel.dataset.blackboxPanel = tab.id;
      panel.appendChild(tab.component);
      blackboxPanels.appendChild(panel);
    }
    const BLACKBOX_TAB_KEY = 'stvisual.blackboxActiveTab';
    let savedBlackboxTab = null;
    try { savedBlackboxTab = globalThis.localStorage?.getItem(BLACKBOX_TAB_KEY); } catch {}
    let activeBlackboxTab = resolveInitialTab({
      sectionId: 'blackbox',
      urlSection: urlState.section,
      urlTab: urlState.tab,
      saved: savedBlackboxTab,
    });
    function renderBlackboxTabs() {
      blackboxTabBar.innerHTML = blackboxTabs.map((tab) => `
        <button type="button"
          class="syntax-tab-btn${activeBlackboxTab === tab.id ? ' active' : ''}"
          data-blackbox-tab="${tab.id}"
          role="tab"
          aria-selected="${activeBlackboxTab === tab.id ? 'true' : 'false'}"
        >${t(tab.key)}</button>
      `).join('');
      blackboxTabBar.querySelectorAll('[data-blackbox-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeBlackboxTab = btn.dataset.blackboxTab;
          try { globalThis.localStorage?.setItem(BLACKBOX_TAB_KEY, activeBlackboxTab); } catch {}
          renderBlackboxTabs();
          updateBlackboxPanels();
          if (activeSection === 'blackbox') syncUrl();
        });
      });
    }
    function updateBlackboxPanels() {
      blackboxPanels.querySelectorAll('[data-blackbox-panel]').forEach((panel) => {
        panel.style.display = panel.dataset.blackboxPanel === activeBlackboxTab ? '' : 'none';
      });
    }
    renderBlackboxTabs();
    updateBlackboxPanels();

    container.querySelector('[data-slot="cloud"]').appendChild(components.cloud);
    container.querySelector('[data-slot="symbex"]').appendChild(components.symbex);
    container.querySelector('[data-slot="concolic"]').appendChild(components.concolic);
    container.querySelector('[data-slot="fuzz"]').appendChild(components.fuzz);
    container.querySelector('[data-slot="testgen"]').appendChild(components.testgen);
    // --- Testing Flow: tabbed layout ---
    const flowTabs = [
      { id: 'flow',       key: 'flowTab.flow',       component: components.flow },
      { id: 'defectCost', key: 'flowTab.defectCost', component: components.defectCost },
      { id: 'vmodel',     key: 'flowTab.vmodel',     component: components.vmodel },
    ];
    const flowSlot = container.querySelector('[data-slot="flow"]');
    const flowTabBar = document.createElement('nav');
    flowTabBar.className = 'syntax-tab-row';
    flowTabBar.dataset.testid = 'flow-tab-row';
    flowTabBar.setAttribute('role', 'tablist');
    flowSlot.appendChild(flowTabBar);
    const flowPanels = document.createElement('div');
    flowPanels.className = 'syntax-tab-panels';
    flowSlot.appendChild(flowPanels);
    for (const tab of flowTabs) {
      const panel = document.createElement('div');
      panel.className = 'syntax-tab-panel';
      panel.dataset.flowPanel = tab.id;
      panel.appendChild(tab.component);
      flowPanels.appendChild(panel);
    }
    const FLOW_TAB_KEY = 'stvisual.flowActiveTab';
    let savedFlowTab = null;
    try { savedFlowTab = globalThis.localStorage?.getItem(FLOW_TAB_KEY); } catch {}
    let activeFlowTab = resolveInitialTab({
      sectionId: 'flow',
      urlSection: urlState.section,
      urlTab: urlState.tab,
      saved: savedFlowTab,
    });
    function renderFlowTabs() {
      flowTabBar.innerHTML = flowTabs.map((tab) => `
        <button type="button"
          class="syntax-tab-btn${activeFlowTab === tab.id ? ' active' : ''}"
          data-flow-tab="${tab.id}"
          role="tab"
          aria-selected="${activeFlowTab === tab.id ? 'true' : 'false'}"
        >${t(tab.key)}</button>
      `).join('');
      flowTabBar.querySelectorAll('[data-flow-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeFlowTab = btn.dataset.flowTab;
          try { globalThis.localStorage?.setItem(FLOW_TAB_KEY, activeFlowTab); } catch {}
          renderFlowTabs();
          updateFlowPanels();
          if (activeSection === 'flow') syncUrl();
        });
      });
    }
    function updateFlowPanels() {
      flowPanels.querySelectorAll('[data-flow-panel]').forEach((panel) => {
        panel.style.display = panel.dataset.flowPanel === activeFlowTab ? '' : 'none';
      });
    }
    renderFlowTabs();
    updateFlowPanels();

    // --- Testing Types: tabbed layout (pyramid table + adjuster) ---
    const typesSlot = container.querySelector('[data-slot="types"]');
    const typesTabs = [
      { id: 'pyramid', key: 'typesTab.pyramid', component: components.types },
      { id: 'adjuster', key: 'typesTab.adjuster', component: components.pyramid },
    ];
    let activeTypesTab = resolveInitialTab({
      sectionId: 'types',
      urlSection: urlState.section,
      urlTab: urlState.tab,
      saved: null,
    });

    const typesTabBar = document.createElement('nav');
    typesTabBar.className = 'syntax-tab-row';
    typesTabBar.dataset.testid = 'types-tab-row';
    typesTabBar.setAttribute('role', 'tablist');
    typesSlot.appendChild(typesTabBar);

    const typesPanels = document.createElement('div');
    typesPanels.className = 'syntax-tab-panels';
    for (const tab of typesTabs) {
      const panel = document.createElement('div');
      panel.className = 'syntax-tab-panel';
      panel.dataset.typesPanel = tab.id;
      panel.appendChild(tab.component);
      typesPanels.appendChild(panel);
    }
    typesSlot.appendChild(typesPanels);

    function renderTypesTabs() {
      typesTabBar.innerHTML = typesTabs.map((tab) => `
        <button
          class="syntax-tab-btn${activeTypesTab === tab.id ? ' active' : ''}"
          data-types-tab="${tab.id}"
          role="tab"
          aria-selected="${activeTypesTab === tab.id ? 'true' : 'false'}"
        >${t(tab.key)}</button>
      `).join('');
      typesTabBar.querySelectorAll('[data-types-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeTypesTab = btn.dataset.typesTab;
          renderTypesTabs();
          updateTypesPanels();
          if (activeSection === 'types') syncUrl();
        });
      });
    }
    function updateTypesPanels() {
      typesPanels.querySelectorAll('[data-types-panel]').forEach((panel) => {
        panel.style.display = panel.dataset.typesPanel === activeTypesTab ? '' : 'none';
      });
    }
    renderTypesTabs();
    updateTypesPanels();

    let activeSection = loadSavedSection(urlState.section);
    let cloudDrawerOpen = false;
    const sectionsById = Object.fromEntries(sectionSelectConfig.map((section) => [section.id, section]));
    const overviewGrid = container.querySelector('[data-testid="overview-grid"]');
    const overviewCounter = container.querySelector('[data-testid="overview-counter"]');
    const overviewFilterHost = container.querySelector('[data-testid="overview-filter"]');
    const overviewPacksHost = container.querySelector('[data-testid="overview-packs"]');
    const cloudTrigger = container.querySelector('[data-app-cloud]');
    const cloudDrawer = container.querySelector('[data-testid="cloud-settings-drawer"]');
    const cloudDrawerPanel = cloudDrawer.querySelector('.cloud-drawer__panel');
    let drawerReturnFocusTarget = null;

    // Initial filter: pack > raw filter > empty.
    const initialPackFilter = urlState.pack ? getCoursePackFilter(urlState.pack) : null;
    let activeFilter = (urlState.filter || initialPackFilter)
      ? { level: [], technique: [], series: [], difficulty: [], ...(urlState.filter || initialPackFilter || {}) }
      : { level: [], technique: [], series: [], difficulty: [] };

    const filterBar = createTagFilterBar({
      initial: activeFilter,
      onChange: (next) => {
        activeFilter = next;
        // User-driven filter changes clear any active course pack so the
        // UI doesn't show a stale "this pack is selected" state.
        packBar?.clear();
        syncUrl();
        renderOverview();
      },
    });
    overviewFilterHost.appendChild(filterBar.element);

    const packBar = createCoursePackBar({
      initial: urlState.pack ?? null,
      onApplyFilter: (filter) => {
        const next = filter ?? { level: [], technique: [], series: [], difficulty: [] };
        activeFilter = { level: [], technique: [], series: [], difficulty: [], ...next };
        filterBar.setFilter(activeFilter);
        syncUrl();
        renderOverview();
      },
    });
    overviewPacksHost.appendChild(packBar.element);

    // mode='push' creates a new history entry (so the browser back button
    // returns the user to the previous URL); 'replace' overwrites the
    // current entry without polluting the back stack. Section/nav changes
    // push; filter/tab/pack chip changes replace.
    function syncUrl(mode = 'replace') {
      try {
        const state = {
          section: activeSection,
          tab: getCurrentTabForSection(activeSection),
          pack: packBar?.getActiveId() ?? null,
          filter: activeFilter,
          lang: langInUrl ? getLocale() : undefined,
        };
        const qs = serializeLocation(state);
        // A `#section-*` hash is an entry-only anchor; once the app has
        // navigated, drop it so the URL carries no contradictory anchor.
        // Other hashes (skip-links) are preserved verbatim.
        const rawHash = globalThis.location.hash || '';
        const hash = /^#section-[a-z0-9-]+$/.test(rawHash) ? '' : rawHash;
        const url = `${globalThis.location.pathname}${qs}${hash}`;
        if (mode === 'push') {
          globalThis.history?.pushState?.(null, '', url);
        } else {
          globalThis.history?.replaceState?.(null, '', url);
        }
        // Keep the popstate handler's reference in lockstep with the URL
        // we just wrote — so a true back-navigation across our pushed
        // entries flips this comparison, but a hash-only navigation
        // (skip-link) leaves it equal.
        lastSearchSnapshot = qs;
      } catch {
        // Ignore — push/replaceState may be unavailable in some test envs.
      }
    }

    // Returns the active tab id for sections that have tabs, else undefined.
    // Defined below `paint()` body so closure captures the latest tab state.
    function getCurrentTabForSection(sectionId) {
      switch (sectionId) {
        case 'syntax':     return activeSyntaxTab;
        case 'blackbox':   return activeBlackboxTab;
        case 'advanced':   return activeAdvancedTab;
        case 'acceptance': return activeAcceptanceTab;
        case 'mbt':        return activeMbtTab;
        case 'agile':      return activeAgileTab;
        case 'slicing':    return activeSlicingTab;
        case 'flow':       return activeFlowTab;
        case 'types':      return activeTypesTab;
        default: return undefined;
      }
    }

    function renderOverview() {
      const totalSections = overviewGroups.reduce((n, g) => n + g.sectionIds.length, 0);
      let visibleSections = 0;

      overviewGrid.innerHTML = overviewGroups.map((group) => {
        const visibleIds = group.sectionIds.filter((id) => sectionMatchesFilter(id, activeFilter));
        visibleSections += visibleIds.length;
        if (visibleIds.length === 0) {
          return `<section class="overview-group overview-group--hidden" aria-hidden="true"></section>`;
        }
        return `
          <section class="overview-group">
            <h3>${t(group.key)}</h3>
            <div class="overview-card-grid">
              ${visibleIds.map((id) => {
                const section = sectionsById[id];
                return `
                  <button
                    class="overview-card"
                    type="button"
                    data-overview-section="${section.id}"
                  >
                    <span class="overview-card__label">${t(section.key)}</span>
                    <span class="overview-card__title">${t(`section.${section.id}.title`)}</span>
                    <span class="overview-card__desc">${t(`overview.desc.${section.id}`)}</span>
                  </button>`;
              }).join('')}
            </div>
          </section>`;
      }).join('');

      if (overviewCounter) {
        if (visibleSections === 0) {
          overviewCounter.textContent = t('filter.empty');
        } else if (visibleSections === totalSections) {
          overviewCounter.textContent = '';
        } else {
          overviewCounter.textContent = t('filter.results', { visible: visibleSections, total: totalSections });
        }
      }

      overviewGrid.querySelectorAll('[data-overview-section]').forEach((button) => {
        button.addEventListener('click', () => {
          setActiveSection(button.dataset.overviewSection, true);
        });
      });
    }

    function renderNav() {
      nav.innerHTML = `
        <div class="app-nav__selector">
          <label class="app-section-select-label" for="app-section-select">${t('app.section.label')}</label>
          <select class="app-section-select" id="app-section-select" data-testid="app-section-select">
            ${sectionSelectConfig.map((section) => `
              <option value="${section.id}"${activeSection === section.id ? ' selected' : ''}>${t(section.key)}</option>
            `).join('')}
          </select>
        </div>
        <div class="app-nav__buttons">
          ${learningSectionsConfig.map((section) => `
            <button
              class="nav-btn${activeSection === section.id ? ' active' : ''}"
              data-testid="nav-btn-${section.id}"
              data-section="${section.id}"
              type="button"
              aria-current="${activeSection === section.id ? 'page' : 'false'}"
            >
              ${t(section.key)}
            </button>
          `).join('')}
        </div>
      `;

      nav.querySelectorAll('[data-section]').forEach((button) => {
        button.addEventListener('click', () => {
          setActiveSection(button.dataset.section, true);
        });
      });

      nav.querySelector('[data-testid="app-section-select"]').addEventListener('change', (event) => {
        if (event.target.value === 'cloud') {
          openCloudDrawer();
          renderNav();
          return;
        }
        setActiveSection(event.target.value, true);
      });
    }

    function updateSectionVisibility() {
      Object.entries(sections).forEach(([id, element]) => {
        const visible = (activeSection === 'all' && id === 'overview') || activeSection === id;
        element.style.display = visible ? '' : 'none';
        element.setAttribute('aria-hidden', visible ? 'false' : 'true');
      });
    }

    function getActiveSectionElement() {
      const target = activeSection === 'all' ? sections.overview : sections[activeSection];
      return target || null;
    }

    function scrollToActiveSection() {
      const target = getActiveSectionElement();
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function focusActiveSection() {
      const target = getActiveSectionElement();
      if (!target) return;
      target.focus({ preventScroll: true });
    }

    function updateCloudTriggerState() {
      cloudTrigger.classList.toggle('active', cloudDrawerOpen);
      cloudTrigger.setAttribute('aria-pressed', cloudDrawerOpen ? 'true' : 'false');
    }

    function updateCloudDrawerState() {
      cloudDrawer.hidden = !cloudDrawerOpen;
      cloudDrawer.classList.toggle('open', cloudDrawerOpen);
      cloudDrawer.setAttribute('aria-hidden', cloudDrawerOpen ? 'false' : 'true');
      updateCloudTriggerState();
    }

    function openCloudDrawer() {
      drawerReturnFocusTarget = document.activeElement instanceof HTMLElement ? document.activeElement : cloudTrigger;
      cloudDrawerOpen = true;
      updateCloudDrawerState();
      requestAnimationFrame(() => cloudDrawerPanel.focus());
    }

    function closeCloudDrawer() {
      cloudDrawerOpen = false;
      updateCloudDrawerState();
      const focusTarget = drawerReturnFocusTarget?.isConnected ? drawerReturnFocusTarget : cloudTrigger;
      drawerReturnFocusTarget = null;
      focusTarget.focus();
    }

    function setActiveSection(sectionId, shouldScroll = false) {
      if (sectionId === 'cloud') {
        openCloudDrawer();
        return;
      }
      // Section change is a navigation: push a history entry so the
      // browser back button returns the user to the previous section.
      // Same-section re-clicks fall through to replace (no history spam).
      const sectionChanged = activeSection !== sectionId;
      activeSection = sectionId;
      persistActiveSection(activeSection);
      renderNav();
      updateSectionVisibility();
      updateCloudTriggerState();
      syncUrl(sectionChanged ? 'push' : 'replace');
      if (shouldScroll) {
        requestAnimationFrame(() => {
          scrollToActiveSection();
          focusActiveSection();
        });
      }
    }

    container.querySelector('#app-lang-select').addEventListener('change', (e) => {
      langInUrl = true;
      setLocale(e.target.value);
    });

    cloudTrigger.addEventListener('click', () => {
      openCloudDrawer();
    });

    cloudDrawer.querySelectorAll('[data-cloud-close]').forEach((button) => {
      button.addEventListener('click', closeCloudDrawer);
    });

    cloudDrawer.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeCloudDrawer();
        return;
      }

      if (event.key !== 'Tab' || !cloudDrawerOpen) {
        return;
      }

      const focusableElements = [...cloudDrawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.disabled && element.offsetParent !== null);
      if (!focusableElements.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    renderOverview();
    renderNav();
    updateSectionVisibility();
    updateCloudDrawerState();

    // On first boot, if the URL pointed at a specific section/explorer,
    // scroll it into view so the user actually sees the destination
    // instead of the (now-hidden) overview / header area at the top.
    // We only do this once per session — locale switches keep the user
    // wherever they currently are.
    if (!initialDeeplinkHandled) {
      initialDeeplinkHandled = true;
      if (activeSection !== 'all' && urlState.section) {
        requestAnimationFrame(() => {
          scrollToActiveSection();
          focusActiveSection();
        });
      }
    }

    // Keep ?lang= current after a language toggle (paint() re-runs on
    // every locale change). No-op when the language was never URL-locked.
    if (langInUrl) syncUrl('replace');
  }

  // Apply a URL-supplied language before the first paint, without
  // overwriting the visitor's own saved preference.
  const bootState = parseAppLocation(
    globalThis.location?.search ?? '',
    globalThis.location?.hash ?? '',
  );
  if (bootState.lang) {
    langInUrl = true;
    setLocale(bootState.lang, { persist: false });
  }

  paint();
  onLocaleChange(() => paint());

  // Browser back/forward across one of our pushState entries: reload so
  // the app re-applies state from the new URL. Compare `location.search`
  // against the last value `syncUrl()` wrote — hash-only navigation
  // (skip-link `<a href="#app-main">` etc.) doesn't change search, so we
  // ignore it.
  globalThis.addEventListener?.('popstate', () => {
    const current = globalThis.location?.search ?? '';
    if (current !== lastSearchSnapshot) {
      lastSearchSnapshot = current;
      globalThis.location?.reload?.();
    }
  });

  // A deliberate `#section-<id>` hash navigation overrides any stale
  // ?section= query: reload from a URL carrying only the hash, so boot
  // re-applies state from the hash alone. The ?lang= lock is carried
  // across so a language-locked share link survives the hash jump.
  // Non-section hashes (skip-links) are left to the browser.
  globalThis.addEventListener?.('hashchange', () => {
    const hash = globalThis.location?.hash ?? '';
    if (/^#section-[a-z0-9-]+$/.test(hash)) {
      const lang = new URLSearchParams(globalThis.location?.search ?? '').get('lang');
      const qs = (lang === 'en' || lang === 'zh') ? `?lang=${lang}` : '';
      globalThis.location?.replace?.(`${globalThis.location.pathname}${qs}${hash}`);
    }
  });

  // Show ResultViewer if URL contains ?result= (Phase A share link)
  const viewer = createResultViewer();
  if (viewer) document.body.appendChild(viewer);

  // Teacher Dashboard (F-B): always present but hidden; opens via stvisual:open-teacher-dashboard event
  const teacherDashboard = createTeacherDashboard();
  teacherDashboard.hidden = true;
  document.body.appendChild(teacherDashboard);

  // Global delegated handler for all quiz share buttons
  document.body.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-share-payload]');
    if (!btn) return;
    const url = buildShareUrl(btn.dataset.sharePayload);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const inp = document.createElement('input');
      inp.value = url;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand('copy');
      inp.remove();
    }
    const orig = btn.innerHTML;
    btn.innerHTML = t('quiz.share.copied');
    btn.classList.add('quiz-share-btn--copied');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('quiz-share-btn--copied');
    }, 2000);
  });
}
