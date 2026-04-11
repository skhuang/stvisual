import { testingFlow } from '../data/testingData.js';

export function createTestingFlow() {
  const root = document.createElement('div');
  let activeStep = 0;
  let isPlaying = true;
  let hoveredStep = null;
  let timerId = null;

  function restartTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }

    if (isPlaying) {
      timerId = window.setInterval(() => {
        activeStep = (activeStep + 1) % testingFlow.length;
        render();
      }, 1800);
    }
  }

  function render() {
    root.className = 'testing-flow';
    root.dataset.testid = 'testing-flow';
    root.innerHTML = `
      <div class="flow-controls">
        <button
          class="flow-play-btn${isPlaying ? ' playing' : ''}"
          type="button"
          data-testid="flow-play-btn"
          aria-label="${isPlaying ? '暫停動畫' : '播放動畫'}"
        >
          ${isPlaying ? '⏸ 暫停' : '▶ 播放'}
        </button>
      </div>
      <div class="flow-track" data-testid="flow-track">
        ${testingFlow.map((step, index) => `
          <div class="flow-step-group">
            <div
              class="flow-step${activeStep === index ? ' flow-step--active' : ''}${hoveredStep === index ? ' flow-step--hovered' : ''}"
              data-testid="flow-step-${step.id}"
              data-step-index="${index}"
              role="button"
              tabindex="0"
              aria-label="步驟 ${index + 1}: ${step.label}"
            >
              <div class="flow-step-num">${index + 1}</div>
              <div class="flow-step-icon">${step.icon}</div>
              <div class="flow-step-label">${step.label}</div>
              <div class="flow-step-label-en">${step.labelEn}</div>
              ${(hoveredStep === index || activeStep === index) ? `
                <div class="flow-step-tooltip" data-testid="flow-tooltip-${step.id}">${step.description}</div>
              ` : ''}
            </div>
            ${index < testingFlow.length - 1 ? `
              <div
                class="flow-arrow${activeStep > index ? ' flow-arrow--passed' : ''}${activeStep === index ? ' flow-arrow--active' : ''}"
                data-testid="flow-arrow-${index}"
                aria-hidden="true"
              >
                <div class="flow-arrow-line"></div>
                <div class="flow-arrow-head"></div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      <div class="flow-progress-bar" aria-hidden="true">
        <div
          class="flow-progress-fill"
          data-testid="flow-progress-fill"
          style="width: ${((activeStep + 1) / testingFlow.length) * 100}%"
        ></div>
      </div>
      <div class="flow-progress-label">進度：${activeStep + 1} / ${testingFlow.length} — ${testingFlow[activeStep].label}</div>
    `;

    root.querySelector('[data-testid="flow-play-btn"]').addEventListener('click', () => {
      isPlaying = !isPlaying;
      restartTimer();
      render();
    });

    root.querySelectorAll('[data-step-index]').forEach((element) => {
      const stepIndex = Number(element.dataset.stepIndex);
      element.addEventListener('mouseenter', () => {
        hoveredStep = stepIndex;
        isPlaying = false;
        restartTimer();
        render();
      });
      element.addEventListener('mouseleave', () => {
        hoveredStep = null;
        isPlaying = true;
        restartTimer();
        render();
      });
      element.addEventListener('click', () => {
        activeStep = stepIndex;
        render();
      });
    });
  }

  restartTimer();
  render();
  root.cleanup = () => {
    if (timerId) {
      clearInterval(timerId);
    }
  };
  return root;
}
