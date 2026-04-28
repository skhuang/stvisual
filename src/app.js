import { createTestingMethodTree } from './components/TestingMethodTree.js';
import { createGraphCoverageExplorer } from './components/GraphCoverageExplorer.js';
import { createLogicCoverageExplorer } from './components/LogicCoverageExplorer.js';
import { createTestingFlow } from './components/TestingFlow.js';
import { createTestingTypesTable } from './components/TestingTypesTable.js';
import { createCloudStoragePanel } from './components/CloudStoragePanel.js';

const sectionsConfig = [
  { id: 'all', label: '全覽' },
  { id: 'methods', label: '測試方法' },
  { id: 'graph', label: 'Graph Coverage' },
  { id: 'logic', label: 'Logic Coverage' },
  { id: 'cloud', label: '雲端整合' },
  { id: 'flow', label: '測試流程' },
  { id: 'types', label: '測試類型' },
];

export function renderApp(container) {
  container.innerHTML = `
    <div class="app">
      <header class="app-header">
        <h1>軟體測試方法視覺化</h1>
        <p>Software Testing Methods Visualization</p>
      </header>

      <nav class="app-nav" aria-label="切換區塊" data-testid="app-nav"></nav>

      <main class="app-main">
        <section data-testid="section-methods">
          <h2>測試方法分類</h2>
          <div data-slot="methods"></div>
        </section>
        <section data-testid="section-graph">
          <h2>Graph Coverage 視覺化</h2>
          <div data-slot="graph"></div>
        </section>
        <section data-testid="section-logic">
          <h2>Logic Coverage 視覺化</h2>
          <div data-slot="logic"></div>
        </section>
        <section data-testid="section-cloud">
          <h2>Google 雲端整合</h2>
          <div data-slot="cloud"></div>
        </section>
        <section data-testid="section-flow">
          <h2>測試流程</h2>
          <div data-slot="flow"></div>
        </section>
        <section data-testid="section-types">
          <h2>常見測試類型</h2>
          <div data-slot="types"></div>
        </section>
      </main>

      <footer class="app-footer">
        <p>根據 Plan.md 建立 · 軟體測試方法視覺化系統</p>
      </footer>
    </div>
  `;

  const nav = container.querySelector('.app-nav');
  const main = container.querySelector('.app-main');
  const sections = {
    methods: main.querySelector('[data-testid="section-methods"]'),
    graph: main.querySelector('[data-testid="section-graph"]'),
    logic: main.querySelector('[data-testid="section-logic"]'),
    cloud: main.querySelector('[data-testid="section-cloud"]'),
    flow: main.querySelector('[data-testid="section-flow"]'),
    types: main.querySelector('[data-testid="section-types"]'),
  };

  const components = {
    methods: createTestingMethodTree(),
    graph: createGraphCoverageExplorer(),
    logic: createLogicCoverageExplorer(),
    cloud: createCloudStoragePanel(),
    flow: createTestingFlow(),
    types: createTestingTypesTable(),
  };

  container.querySelector('[data-slot="methods"]').appendChild(components.methods);
  container.querySelector('[data-slot="graph"]').appendChild(components.graph);
  container.querySelector('[data-slot="logic"]').appendChild(components.logic);
  container.querySelector('[data-slot="cloud"]').appendChild(components.cloud);
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
        ${section.label}
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

  renderNav();
  updateSectionVisibility();
}
