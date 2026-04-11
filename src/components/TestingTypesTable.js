import { testingTypes } from '../data/testingData.js';

export function createTestingTypesTable() {
  const root = document.createElement('div');
  root.className = 'testing-types';
  root.dataset.testid = 'testing-types';
  root.innerHTML = `
    <div class="pyramid-section">
      <h3 class="pyramid-title">測試金字塔（由底層至頂層）</h3>
      <div class="pyramid" data-testid="pyramid">
        ${[...testingTypes].reverse().map((type, index) => `
          <div
            class="pyramid-row"
            data-testid="pyramid-row-${type.id}"
            style="--row-color: ${type.color}; --row-width: ${type.width}%; animation-delay: ${index * 0.12}s"
          >
            <span class="pyramid-row-label">${type.type}</span>
            <span class="pyramid-row-en">${type.typeEn}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="types-grid" data-testid="types-grid">
      ${testingTypes.map((type, index) => `
        <div
          class="type-card"
          data-testid="type-card-${type.id}"
          style="--card-color: ${type.color}; animation-delay: ${index * 0.1}s"
        >
          <div class="type-card-stripe"></div>
          <div class="type-card-body">
            <div class="type-header">
              <span class="type-phase">Phase ${index + 1}</span>
              <h4 class="type-name">${type.type}</h4>
              <span class="type-name-en">${type.typeEn}</span>
            </div>
            <div class="type-detail">
              <div class="type-detail-row">
                <span class="type-detail-label">目的</span>
                <span class="type-detail-value">${type.purpose}</span>
              </div>
              <div class="type-detail-row">
                <span class="type-detail-label">時機</span>
                <span class="type-detail-value">${type.timing}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  return root;
}
