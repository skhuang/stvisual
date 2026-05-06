import { testingTypes } from '../data/testingData.js';
import { t, getLocale, pickField } from '../i18n/index.js';

export function createTestingTypesTable() {
  const root = document.createElement('div');
  root.className = 'testing-types';
  root.dataset.testid = 'testing-types';
  root.innerHTML = `
    <div class="pyramid-section">
      <h3 class="pyramid-title">${t('types.pyramid.title')}</h3>
      <div class="pyramid" data-testid="pyramid">
        ${[...testingTypes].reverse().map((type, index) => `
          <div
            class="pyramid-row"
            data-testid="pyramid-row-${type.id}"
            style="--row-color: ${type.color}; --row-width: ${type.width}%; animation-delay: ${index * 0.12}s"
          >
            <span class="pyramid-row-label">${pickField(type, 'type')}</span>
            <span class="pyramid-row-en">${getLocale() === 'en' ? type.type : type.typeEn}</span>
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
              <h4 class="type-name">${pickField(type, 'type')}</h4>
              <span class="type-name-en">${getLocale() === 'en' ? type.type : type.typeEn}</span>
            </div>
            <div class="type-detail">
              <div class="type-detail-row">
                <span class="type-detail-label">${t('types.col.purpose')}</span>
                <span class="type-detail-value">${pickField(type, 'purpose')}</span>
              </div>
              <div class="type-detail-row">
                <span class="type-detail-label">${t('types.col.timing')}</span>
                <span class="type-detail-value">${pickField(type, 'timing')}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  return root;
}
