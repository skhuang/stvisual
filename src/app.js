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
import { t, getLocale, setLocale, onLocaleChange } from './i18n/index.js';

const sectionsConfig = [
  { id: 'all', key: 'section.all' },
  { id: 'methods', key: 'section.methods' },
  { id: 'graph', key: 'section.graph' },
  { id: 'logic', key: 'section.logic' },
  { id: 'syntax', key: 'section.syntax' },
  { id: 'symbex', key: 'section.symbex' },
  { id: 'concolic', key: 'section.concolic' },
  { id: 'cloud', key: 'section.cloud' },
  { id: 'flow', key: 'section.flow' },
  { id: 'types', key: 'section.types' },
];

export function renderApp(container) {
  function paint() {
    container.innerHTML = `
      <div class="app">
        <header class="app-header">
          <div class="app-header__text">
            <h1>${t('app.title')}</h1>
            <p>${t('app.subtitle')}</p>
          </div>
          <div class="app-lang" role="group" aria-label="${t('app.lang.label')}">
            <label class="app-lang__label" for="app-lang-select">${t('app.lang.label')}</label>
            <select id="app-lang-select" data-testid="app-lang-select">
              <option value="en"${getLocale() === 'en' ? ' selected' : ''}>${t('app.lang.en')}</option>
              <option value="zh"${getLocale() === 'zh' ? ' selected' : ''}>${t('app.lang.zh')}</option>
            </select>
          </div>
        </header>

        <nav class="app-nav" aria-label="${t('app.nav.aria')}" data-testid="app-nav"></nav>

        <main class="app-main">
          <section data-testid="section-methods"><h2>${t('section.methods.title')}</h2><div data-slot="methods"></div></section>
          <section data-testid="section-graph"><h2>${t('section.graph.title')}</h2><div data-slot="graph"></div></section>
          <section data-testid="section-logic"><h2>${t('section.logic.title')}</h2><div data-slot="logic"></div></section>
          <section data-testid="section-syntax"><h2>${t('section.syntax.title')}</h2><div data-slot="syntax"></div></section>
          <section data-testid="section-symbex"><h2>${t('section.symbex.title')}</h2><div data-slot="symbex"></div></section>
          <section data-testid="section-concolic"><h2>${t('section.concolic.title')}</h2><div data-slot="concolic"></div></section>
          <section data-testid="section-cloud"><h2>${t('section.cloud.title')}</h2><div data-slot="cloud"></div></section>
          <section data-testid="section-flow"><h2>${t('section.flow.title')}</h2><div data-slot="flow"></div></section>
          <section data-testid="section-types"><h2>${t('section.types.title')}</h2><div data-slot="types"></div></section>
        </main>

        <footer class="app-footer">
          <p>${t('app.footer')}</p>
        </footer>
      </div>
    `;

    const nav = container.querySelector('.app-nav');
    const main = container.querySelector('.app-main');
    const sections = {
      methods: main.querySelector('[data-testid="section-methods"]'),
      graph: main.querySelector('[data-testid="section-graph"]'),
      logic: main.querySelector('[data-testid="section-logic"]'),
      syntax: main.querySelector('[data-testid="section-syntax"]'),
      symbex: main.querySelector('[data-testid="section-symbex"]'),
      concolic: main.querySelector('[data-testid="section-concolic"]'),
      cloud: main.querySelector('[data-testid="section-cloud"]'),
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
      cloud: createCloudStoragePanel(),
      flow: createTestingFlow(),
      types: createTestingTypesTable(),
    };

    container.querySelector('[data-slot="methods"]').appendChild(components.methods);
    container.querySelector('[data-slot="graph"]').appendChild(components.graph);
    container.querySelector('[data-slot="logic"]').appendChild(components.logic);

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

    container.querySelector('[data-slot="cloud"]').appendChild(components.cloud);
    container.querySelector('[data-slot="symbex"]').appendChild(components.symbex);
    container.querySelector('[data-slot="concolic"]').appendChild(components.concolic);
    container.querySelector('[data-slot="flow"]').appendChild(components.flow);
    container.querySelector('[data-slot="types"]').appendChild(components.types);

    let activeSection = 'all';

    function renderNav() {
      nav.innerHTML = sectionsConfig.map((section) => `
        <button
          class="nav-btn${activeSection === section.id ? ' active' : ''}"
          data-testid="nav-btn-${section.id}"
          data-section="${section.id}"
          type="button"
        >
          ${t(section.key)}
        </button>
      `).join('');

      nav.querySelectorAll('[data-section]').forEach((button) => {
        button.addEventListener('click', () => {
          activeSection = button.dataset.section;
          renderNav();
          updateSectionVisibility();
        });
      });
    }

    function updateSectionVisibility() {
      Object.entries(sections).forEach(([id, element]) => {
        const visible = activeSection === 'all' || activeSection === id;
        element.style.display = visible ? '' : 'none';
      });
    }

    container.querySelector('#app-lang-select').addEventListener('change', (e) => {
      setLocale(e.target.value);
    });

    renderNav();
    updateSectionVisibility();
  }

  paint();
  onLocaleChange(() => paint());
}
