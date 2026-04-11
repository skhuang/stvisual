import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestingFlow } from '../components/TestingFlow.js';
import { testingFlow } from '../data/testingData';

let flowElement;

function renderTestingFlow() {
  document.body.innerHTML = '';
  flowElement = createTestingFlow();
  document.body.appendChild(flowElement);
  return flowElement;
}

describe('TestingFlow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    if (flowElement?.cleanup) {
      flowElement.cleanup();
    }
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('正確渲染所有流程步驟', () => {
    renderTestingFlow();
    testingFlow.forEach((step) => {
      expect(document.querySelector(`[data-testid="flow-step-${step.id}"]`)).toBeInTheDocument();
    });
  });

  it('渲染 6 個步驟節點', () => {
    renderTestingFlow();
    expect(document.querySelectorAll('[data-step-index]').length).toBe(6);
  });

  it('渲染 5 個箭頭', () => {
    renderTestingFlow();
    const arrows = [];
    for (let i = 0; i < testingFlow.length - 1; i++) {
      arrows.push(document.querySelector(`[data-testid="flow-arrow-${i}"]`));
    }
    expect(arrows).toHaveLength(5);
  });

  it('初始時進度為第 1 步', () => {
    renderTestingFlow();
    const fill = document.querySelector('[data-testid="flow-progress-fill"]');
    const expectedWidth = `${(1 / testingFlow.length) * 100}%`;
    expect(fill.style.width).toBe(expectedWidth);
  });

  it('自動播放後進度推進到第 2 步', () => {
    renderTestingFlow();
    vi.advanceTimersByTime(1800);
    const fill = document.querySelector('[data-testid="flow-progress-fill"]');
    const expectedWidth = `${(2 / testingFlow.length) * 100}%`;
    expect(fill.style.width).toBe(expectedWidth);
  });

  it('點擊「暫停」後停止自動前進', () => {
    renderTestingFlow();
    document.querySelector('[data-testid="flow-play-btn"]').click();
    const fillBefore = document.querySelector('[data-testid="flow-progress-fill"]').style.width;
    vi.advanceTimersByTime(1800 * 3);
    const fillAfter = document.querySelector('[data-testid="flow-progress-fill"]').style.width;
    expect(fillAfter).toBe(fillBefore);
  });

  it('播放按鈕初始文字含「暫停」', () => {
    renderTestingFlow();
    expect(document.querySelector('[data-testid="flow-play-btn"]').textContent).toContain('暫停');
  });

  it('點擊暫停後按鈕文字含「播放」', () => {
    renderTestingFlow();
    document.querySelector('[data-testid="flow-play-btn"]').click();
    expect(document.querySelector('[data-testid="flow-play-btn"]').textContent).toContain('播放');
  });

  it('顯示進度文字', () => {
    renderTestingFlow();
    expect(document.body.textContent).toContain('進度：');
  });

  it('渲染流程追蹤容器', () => {
    renderTestingFlow();
    expect(document.querySelector('[data-testid="flow-track"]')).toBeInTheDocument();
  });

  it('六個步驟均顯示中文標籤', () => {
    renderTestingFlow();
    testingFlow.forEach((step) => {
      expect(document.querySelector(`[aria-label="步驟 ${testingFlow.indexOf(step) + 1}: ${step.label}"]`)).toBeInTheDocument();
    });
  });
});
