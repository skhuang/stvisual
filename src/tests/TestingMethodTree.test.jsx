import { describe, it, expect } from 'vitest';
import { createTestingMethodTree } from '../components/TestingMethodTree.js';
import { testingMethods } from '../data/testingData';

function renderTestingMethodTree() {
  document.body.innerHTML = '';
  const element = createTestingMethodTree();
  document.body.appendChild(element);
  return element;
}

describe('TestingMethodTree', () => {
  it('正確渲染三種測試方法', () => {
    renderTestingMethodTree();
    expect(document.querySelector('[data-testid="method-card-blackbox"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="method-card-whitebox"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="method-card-graybox"]')).toBeInTheDocument();
  });

  it('初始狀態下子技術列表不顯示', () => {
    renderTestingMethodTree();
    expect(document.querySelector('[data-testid="technique-list-blackbox"]')).not.toBeInTheDocument();
    expect(document.querySelector('[data-testid="technique-list-whitebox"]')).not.toBeInTheDocument();
    expect(document.querySelector('[data-testid="technique-list-graybox"]')).not.toBeInTheDocument();
  });

  it('點擊黑盒測試卡片後展開技術列表', () => {
    renderTestingMethodTree();
    document.querySelector('[data-testid="method-card-btn-blackbox"]').click();
    expect(document.querySelector('[data-testid="technique-list-blackbox"]')).toBeInTheDocument();
  });

  it('展開後再次點擊可收合', () => {
    renderTestingMethodTree();
    const btn = document.querySelector('[data-testid="method-card-btn-blackbox"]');
    btn.click();
    expect(document.querySelector('[data-testid="technique-list-blackbox"]')).toBeInTheDocument();
    document.querySelector('[data-testid="method-card-btn-blackbox"]').click();
    expect(document.querySelector('[data-testid="technique-list-blackbox"]')).not.toBeInTheDocument();
  });

  it('展開黑盒測試後顯示 4 個技術', () => {
    renderTestingMethodTree();
    document.querySelector('[data-testid="method-card-btn-blackbox"]').click();
    const list = document.querySelector('[data-testid="technique-list-blackbox"]');
    expect(list.querySelectorAll('li')).toHaveLength(4);
  });

  it('展開白盒測試後顯示 7 個技術', () => {
    renderTestingMethodTree();
    document.querySelector('[data-testid="method-card-btn-whitebox"]').click();
    const list = document.querySelector('[data-testid="technique-list-whitebox"]');
    expect(list.querySelectorAll('li')).toHaveLength(7);
  });

  it('展開白盒測試後可看到 Prime Path Coverage', () => {
    renderTestingMethodTree();
    document.querySelector('[data-testid="method-card-btn-whitebox"]').click();
    expect(document.querySelector('[data-testid="technique-ppc"]')).toBeInTheDocument();
  });

  it('展開白盒測試後可看到 Graph Coverage', () => {
    renderTestingMethodTree();
    document.querySelector('[data-testid="method-card-btn-whitebox"]').click();
    expect(document.querySelector('[data-testid="technique-gc"]')).toBeInTheDocument();
  });

  it('「全部展開」按鈕展開所有技術列表', () => {
    renderTestingMethodTree();
    document.querySelector('[data-testid="toggle-all-btn"]').click();
    testingMethods.forEach((m) => {
      expect(document.querySelector(`[data-testid="technique-list-${m.id}"]`)).toBeInTheDocument();
    });
  });

  it('全部展開後按鈕文字變為「全部收合」', () => {
    renderTestingMethodTree();
    const btn = document.querySelector('[data-testid="toggle-all-btn"]');
    expect(btn.textContent.trim()).toBe('全部展開');
    btn.click();
    expect(document.querySelector('[data-testid="toggle-all-btn"]').textContent.trim()).toBe('全部收合');
  });

  it('全部展開後再點擊「全部收合」收起所有列表', () => {
    renderTestingMethodTree();
    const btn = document.querySelector('[data-testid="toggle-all-btn"]');
    btn.click();
    document.querySelector('[data-testid="toggle-all-btn"]').click();
    testingMethods.forEach((m) => {
      expect(document.querySelector(`[data-testid="technique-list-${m.id}"]`)).not.toBeInTheDocument();
    });
  });

  it('各方法標頭的 aria-expanded 初始為 false', () => {
    renderTestingMethodTree();
    expect(document.querySelector('[data-testid="method-card-btn-blackbox"]')).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('[data-testid="method-card-btn-whitebox"]')).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('[data-testid="method-card-btn-graybox"]')).toHaveAttribute('aria-expanded', 'false');
  });

  it('展開後 aria-expanded 變為 true', () => {
    renderTestingMethodTree();
    document.querySelector('[data-testid="method-card-btn-blackbox"]').click();
    expect(document.querySelector('[data-testid="method-card-btn-blackbox"]')).toHaveAttribute('aria-expanded', 'true');
  });
});
