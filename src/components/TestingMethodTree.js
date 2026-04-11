import { testingMethods } from '../data/testingData.js';

export function createTestingMethodTree() {
  const root = document.createElement('div');
  let expandedIds = new Set();

  function render() {
    const allExpanded = expandedIds.size === testingMethods.length;

    root.className = 'testing-method-tree';
    root.dataset.testid = 'testing-method-tree';
    root.innerHTML = `
      <div class="tree-controls">
        <button class="btn-toggle-all" type="button" data-testid="toggle-all-btn">
          ${allExpanded ? '全部收合' : '全部展開'}
        </button>
      </div>
      <div class="tree-cards">
        ${testingMethods.map((method) => {
          const expanded = expandedIds.has(method.id);
          return `
            <div class="method-card method-card--${method.colorScheme}${expanded ? ' method-card--expanded' : ''}" data-testid="method-card-${method.id}">
              <button
                class="method-card-header"
                type="button"
                data-testid="method-card-btn-${method.id}"
                aria-expanded="${expanded}"
              >
                <div class="method-card-title">
                  <h3>${method.name}</h3>
                  <span class="method-card-en">${method.nameEn}</span>
                </div>
                <span class="method-card-toggle${expanded ? ' rotated' : ''}">▷</span>
              </button>
              <div class="method-card-body">
                <p class="method-description">${method.description}</p>
                <div class="visibility-meter" aria-label="代碼可見度 ${method.visibility}%">
                  <span class="visibility-label">代碼可見度</span>
                  <div class="visibility-track">
                    <div
                      class="visibility-fill"
                      style="width: ${method.visibility}%"
                      data-testid="visibility-fill"
                      role="progressbar"
                      aria-valuenow="${method.visibility}"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <span class="visibility-value">${method.visibility}%</span>
                </div>
                <div class="method-count-badge">${method.techniques.length} 項技術</div>
                ${expanded ? `
                  <ul class="technique-list" data-testid="technique-list-${method.id}">
                    ${method.techniques.map((tech, index) => `
                      <li
                        class="technique-item"
                        data-testid="technique-${tech.id}"
                        style="animation-delay: ${index * 0.06}s"
                      >
                        <div class="technique-name">${tech.name}</div>
                        <div class="technique-name-en">${tech.nameEn}</div>
                        <div class="technique-desc">${tech.description}</div>
                      </li>
                    `).join('')}
                  </ul>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    root.querySelector('[data-testid="toggle-all-btn"]').addEventListener('click', () => {
      expandedIds = allExpanded ? new Set() : new Set(testingMethods.map((method) => method.id));
      render();
    });

    testingMethods.forEach((method) => {
      root.querySelector(`[data-testid="method-card-btn-${method.id}"]`).addEventListener('click', () => {
        const next = new Set(expandedIds);
        if (next.has(method.id)) {
          next.delete(method.id);
        } else {
          next.add(method.id);
        }
        expandedIds = next;
        render();
      });
    });
  }

  render();
  return root;
}
