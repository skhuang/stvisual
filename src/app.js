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
import { createResultViewer } from './components/ResultViewer.js';
import { buildShareUrl } from './utils/resultExporter.js';
import { t, getLocale, setLocale, onLocaleChange } from './i18n/index.js';

const learningSectionsConfig = [
  { id: 'all', key: 'section.all' },
  { id: 'methods', key: 'section.methods' },
  { id: 'graph', key: 'section.graph' },
  { id: 'logic', key: 'section.logic' },
  { id: 'syntax', key: 'section.syntax' },
  { id: 'codecov', key: 'section.codecov' },
  { id: 'symbex', key: 'section.symbex' },
  { id: 'concolic', key: 'section.concolic' },
  { id: 'fuzz', key: 'section.fuzz' },
  { id: 'testgen', key: 'section.testgen' },
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
    sectionIds: ['graph', 'logic', 'syntax', 'codecov'],
  },
  {
    key: 'overview.group.execution',
    sectionIds: ['symbex', 'concolic', 'fuzz', 'testgen'],
  },
  {
    key: 'overview.group.blackbox',
    sectionIds: ['blackbox'],
  },
];

function loadSavedSection() {
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
  function paint() {
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
            <div class="overview-grid" data-testid="overview-grid"></div>
          </section>
          <section data-testid="section-methods" tabindex="-1" aria-labelledby="section-methods-title"><h2 id="section-methods-title">${t('section.methods.title')}</h2><div data-slot="methods"></div></section>
          <section data-testid="section-graph" tabindex="-1" aria-labelledby="section-graph-title"><h2 id="section-graph-title">${t('section.graph.title')}</h2><div data-slot="graph"></div></section>
          <section data-testid="section-logic" tabindex="-1" aria-labelledby="section-logic-title"><h2 id="section-logic-title">${t('section.logic.title')}</h2><div data-slot="logic"></div></section>
          <section data-testid="section-syntax" tabindex="-1" aria-labelledby="section-syntax-title"><h2 id="section-syntax-title">${t('section.syntax.title')}</h2><div data-slot="syntax"></div></section>
          <section data-testid="section-codecov" tabindex="-1" aria-labelledby="section-codecov-title"><h2 id="section-codecov-title">${t('section.codecov.title')}</h2><div data-slot="codecov"></div></section>
          <section data-testid="section-symbex" tabindex="-1" aria-labelledby="section-symbex-title"><h2 id="section-symbex-title">${t('section.symbex.title')}</h2><div data-slot="symbex"></div></section>
          <section data-testid="section-concolic" tabindex="-1" aria-labelledby="section-concolic-title"><h2 id="section-concolic-title">${t('section.concolic.title')}</h2><div data-slot="concolic"></div></section>
          <section data-testid="section-fuzz" tabindex="-1" aria-labelledby="section-fuzz-title"><h2 id="section-fuzz-title">${t('section.fuzz.title')}</h2><div data-slot="fuzz"></div></section>
          <section data-testid="section-testgen" tabindex="-1" aria-labelledby="section-testgen-title"><h2 id="section-testgen-title">${t('section.testgen.title')}</h2><div data-slot="testgen"></div></section>
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
      symbex: main.querySelector('[data-testid="section-symbex"]'),
      concolic: main.querySelector('[data-testid="section-concolic"]'),
      fuzz: main.querySelector('[data-testid="section-fuzz"]'),
      testgen: main.querySelector('[data-testid="section-testgen"]'),
      blackbox: main.querySelector('[data-testid="section-blackbox"]'),
      flow: main.querySelector('[data-testid="section-flow"]'),
      types: main.querySelector('[data-testid="section-types"]'),
    };

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
    let activeSyntaxTab = (() => {
      try {
        const v = globalThis.localStorage?.getItem(SYNTAX_TAB_KEY);
        return syntaxTabs.find((t) => t.id === v) ? v : 'mutation';
      } catch { return 'mutation'; }
    })();
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
    let activeBlackboxTab = (() => {
      try {
        const v = globalThis.localStorage?.getItem(BLACKBOX_TAB_KEY);
        return blackboxTabs.find((tb) => tb.id === v) ? v : 'bva';
      } catch { return 'bva'; }
    })();
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
    let activeFlowTab = (() => {
      try {
        const v = globalThis.localStorage?.getItem(FLOW_TAB_KEY);
        return flowTabs.find((tb) => tb.id === v) ? v : 'flow';
      } catch { return 'flow'; }
    })();
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
    let activeTypesTab = 'pyramid';

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

    let activeSection = loadSavedSection();
    let cloudDrawerOpen = false;
    const sectionsById = Object.fromEntries(sectionSelectConfig.map((section) => [section.id, section]));
    const overviewGrid = container.querySelector('[data-testid="overview-grid"]');
    const cloudTrigger = container.querySelector('[data-app-cloud]');
    const cloudDrawer = container.querySelector('[data-testid="cloud-settings-drawer"]');
    const cloudDrawerPanel = cloudDrawer.querySelector('.cloud-drawer__panel');
    let drawerReturnFocusTarget = null;

    function renderOverview() {
      overviewGrid.innerHTML = overviewGroups.map((group) => `
        <section class="overview-group">
          <h3>${t(group.key)}</h3>
          <div class="overview-card-grid">
            ${group.sectionIds.map((id) => {
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
                </button>
              `;
            }).join('')}
          </div>
        </section>
      `).join('');

      overviewGrid.querySelectorAll('[data-overview-section]').forEach((button) => {
        button.addEventListener('click', () => {
          setActiveSection(button.dataset.overviewSection, true);
        });
      });
    }

    function renderNav() {
      nav.innerHTML = `
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
        <label class="app-section-select-label" for="app-section-select">${t('app.section.label')}</label>
        <select class="app-section-select" id="app-section-select" data-testid="app-section-select">
          ${sectionSelectConfig.map((section) => `
            <option value="${section.id}"${activeSection === section.id ? ' selected' : ''}>${t(section.key)}</option>
          `).join('')}
        </select>
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
      activeSection = sectionId;
      persistActiveSection(activeSection);
      renderNav();
      updateSectionVisibility();
      updateCloudTriggerState();
      if (shouldScroll) {
        requestAnimationFrame(() => {
          scrollToActiveSection();
          focusActiveSection();
        });
      }
    }

    container.querySelector('#app-lang-select').addEventListener('change', (e) => {
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
  }

  paint();
  onLocaleChange(() => paint());

  // Show ResultViewer if URL contains ?result= (Phase A share link)
  const viewer = createResultViewer();
  if (viewer) document.body.appendChild(viewer);

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
