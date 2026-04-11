import { describe, it, expect } from 'vitest';
import { createTestingTypesTable } from '../components/TestingTypesTable.js';
import { testingTypes } from '../data/testingData';

function renderTestingTypesTable() {
  document.body.innerHTML = '';
  const element = createTestingTypesTable();
  document.body.appendChild(element);
}

describe('TestingTypesTable', () => {
  it('渲染四種測試類型的卡片', () => {
    renderTestingTypesTable();
    testingTypes.forEach((t) => {
      expect(document.querySelector(`[data-testid="type-card-${t.id}"]`)).toBeInTheDocument();
    });
  });

  it('渲染測試金字塔', () => {
    renderTestingTypesTable();
    expect(document.querySelector('[data-testid="pyramid"]')).toBeInTheDocument();
  });

  it('金字塔包含四列', () => {
    renderTestingTypesTable();
    testingTypes.forEach((t) => {
      expect(document.querySelector(`[data-testid="pyramid-row-${t.id}"]`)).toBeInTheDocument();
    });
  });

  it('每張卡片顯示測試類型名稱', () => {
    renderTestingTypesTable();
    expect(document.body.textContent).toContain('單元測試');
    expect(document.body.textContent).toContain('集成測試');
    expect(document.body.textContent).toContain('系統測試');
    expect(document.body.textContent).toContain('驗收測試');
  });

  it('每張卡片顯示英文名稱', () => {
    renderTestingTypesTable();
    expect(document.body.textContent).toContain('Unit Testing');
    expect(document.body.textContent).toContain('Integration Testing');
    expect(document.body.textContent).toContain('System Testing');
    expect(document.body.textContent).toContain('Acceptance Testing');
  });

  it('渲染「目的」欄位文字', () => {
    renderTestingTypesTable();
    expect(document.body.textContent).toContain('測試最小單位');
    expect(document.body.textContent).toContain('測試模組組合');
    expect(document.body.textContent).toContain('測試整體系統');
    expect(document.body.textContent).toContain('驗證需求達成');
  });

  it('渲染「時機」欄位文字', () => {
    renderTestingTypesTable();
    expect(document.body.textContent).toContain('開發階段');
    expect(document.body.textContent).toContain('開發後期');
    expect(document.body.textContent).toContain('集成完成後');
    expect(document.body.textContent).toContain('部署前');
  });

  it('渲染 Phase 1 ~ Phase 4 標籤', () => {
    renderTestingTypesTable();
    for (let i = 1; i <= 4; i++) {
      expect(document.body.textContent).toContain(`Phase ${i}`);
    }
  });

  it('渲染 types-grid 容器', () => {
    renderTestingTypesTable();
    expect(document.querySelector('[data-testid="types-grid"]')).toBeInTheDocument();
  });
});
