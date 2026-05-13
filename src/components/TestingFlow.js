import { testingFlow } from '../data/testingData.js';
import { t, getLocale, pickField } from '../i18n/index.js';

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
        updateState();
      }, 1800);
    }
  }

  // Lightweight update — patches classes/text without touching the DOM structure.
  // Called by the timer and by mouse/click handlers so the stepAppear animation
  // never replays unintentionally.
  function updateState() {
    const playBtn = root.querySelector('[data-testid="flow-play-btn"]');
    if (playBtn) {
      playBtn.className = `flow-play-btn${isPlaying ? ' playing' : ''}`;
      playBtn.setAttribute('aria-label', isPlaying ? t('flow.pause') : t('flow.play'));
      playBtn.innerHTML = isPlaying ? `⏸ ${t('flow.pause')}` : `▶ ${t('flow.play')}`;
    }

    root.querySelectorAll('[data-step-index]').forEach((el) => {
      const idx = Number(el.dataset.stepIndex);
      const step = testingFlow[idx];
      const isActive = idx === activeStep;
      const isHovered = idx === hoveredStep;

      el.className = [
        'flow-step',
        isActive ? 'flow-step--active' : '',
        isHovered ? 'flow-step--hovered' : '',
      ].filter(Boolean).join(' ');
      el.setAttribute('aria-label', t('flow.step', { n: idx + 1, label: pickField(step, 'label') }));

      const labelEl = el.querySelector('.flow-step-label');
      if (labelEl) labelEl.textContent = pickField(step, 'label');
      const labelEnEl = el.querySelector('.flow-step-label-en');
      if (labelEnEl) labelEnEl.textContent = getLocale() === 'zh' ? step.labelEn : '';

      // Add / remove tooltip without replacing the surrounding step element
      const tooltipId = `flow-tooltip-${step.id}`;
      let tooltip = el.querySelector(`[data-testid="${tooltipId}"]`);
      const showTooltip = isActive || isHovered;
      if (showTooltip && !tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'flow-step-tooltip';
        tooltip.dataset.testid = tooltipId;
        tooltip.textContent = pickField(step, 'description');
        el.appendChild(tooltip);
      } else if (!showTooltip && tooltip) {
        tooltip.remove();
      } else if (showTooltip && tooltip) {
        tooltip.textContent = pickField(step, 'description');
      }
    });

    root.querySelectorAll('[data-testid^="flow-arrow-"]').forEach((arrow) => {
      const idx = Number(arrow.dataset.testid.replace('flow-arrow-', ''));
      arrow.className = [
        'flow-arrow',
        activeStep > idx ? 'flow-arrow--passed' : '',
        activeStep === idx ? 'flow-arrow--active' : '',
      ].filter(Boolean).join(' ');
    });

    const fill = root.querySelector('[data-testid="flow-progress-fill"]');
    if (fill) fill.style.width = `${((activeStep + 1) / testingFlow.length) * 100}%`;
    const progressLabel = root.querySelector('.flow-progress-label');
    if (progressLabel) {
      progressLabel.textContent = t('flow.progress', {
        current: activeStep + 1,
        total: testingFlow.length,
        label: pickField(testingFlow[activeStep], 'label'),
      });
    }
  }

  // Full DOM build — called once on initialization.
  // Recreating innerHTML would retrigger the stepAppear CSS animation on every tick,
  // so subsequent state changes use updateState() instead.
  function render() {
    root.className = 'testing-flow';
    root.dataset.testid = 'testing-flow';
    root.innerHTML = `
      <div class="flow-controls">
        <button
          class="flow-play-btn${isPlaying ? ' playing' : ''}"
          type="button"
          data-testid="flow-play-btn"
          aria-label="${isPlaying ? t('flow.pause') : t('flow.play')}"
        >
          ${isPlaying ? `⏸ ${t('flow.pause')}` : `▶ ${t('flow.play')}`}
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
              aria-label="${t('flow.step', { n: index + 1, label: pickField(step, 'label') })}"
            >
              <div class="flow-step-num">${index + 1}</div>
              <div class="flow-step-icon">${step.icon}</div>
              <div class="flow-step-label">${pickField(step, 'label')}</div>
              <div class="flow-step-label-en">${getLocale() === 'zh' ? step.labelEn : ''}</div>
              ${(hoveredStep === index || activeStep === index) ? `
                <div class="flow-step-tooltip" data-testid="flow-tooltip-${step.id}">${pickField(step, 'description')}</div>
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
      <div class="flow-progress-label">${t('flow.progress', { current: activeStep + 1, total: testingFlow.length, label: pickField(testingFlow[activeStep], 'label') })}</div>
    `;

    root.querySelector('[data-testid="flow-play-btn"]').addEventListener('click', () => {
      isPlaying = !isPlaying;
      restartTimer();
      updateState();
    });

    root.querySelectorAll('[data-step-index]').forEach((element) => {
      const stepIndex = Number(element.dataset.stepIndex);
      element.addEventListener('mouseenter', () => {
        hoveredStep = stepIndex;
        isPlaying = false;
        restartTimer();
        updateState();
      });
      element.addEventListener('mouseleave', () => {
        hoveredStep = null;
        isPlaying = true;
        restartTimer();
        updateState();
      });
      element.addEventListener('click', () => {
        activeStep = stepIndex;
        updateState();
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
