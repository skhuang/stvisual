import { t } from '../i18n/index.js';

// Four load shapes. Each emits target concurrency at every tick (0–100).
// load: steady; stress: ramp; spike: brief impulse; soak: long flat hold.
export const PROFILES = ['load', 'stress', 'spike', 'soak'];

export function loadShape(profile, tick, peak = 100) {
  switch (profile) {
    case 'load':   return peak * 0.6;
    case 'stress': return Math.min(peak, peak * (tick / 100));
    case 'spike':  return tick === 30 || tick === 31 || tick === 32 ? peak : peak * 0.2;
    case 'soak':   return peak * 0.5;
    default:       return 0;
  }
}

// System model: latency grows with concurrency once we pass the system's
// natural capacity. Below capacity, latency is roughly flat. Above, it
// climbs hyperbolically — the textbook "hockey stick".
const SYSTEMS = [
  {
    id: 'gateway',
    titleKey: 'plp.sys.gateway',
    capacity: 70,    // concurrent in-flight requests it can absorb before queuing
    baseLatencyMs: 20,
    breakingError: 0.04,
  },
  {
    id: 'db',
    titleKey: 'plp.sys.db',
    capacity: 40,
    baseLatencyMs: 60,
    breakingError: 0.08,
  },
  {
    id: 'cpu',
    titleKey: 'plp.sys.cpu',
    capacity: 25,
    baseLatencyMs: 35,
    breakingError: 0.12,
  },
];

// Pure responder for tests. Returns latency (ms) and error fraction at
// the given concurrency for the given system. Latency formula keeps the
// numbers intuitive: base * (1 + max(0, (c − cap) / cap)^2).
export function systemResponse(system, concurrency) {
  const over = Math.max(0, concurrency - system.capacity);
  const ratio = over / system.capacity;
  const latency = system.baseLatencyMs * (1 + ratio * ratio * 4);
  const error = ratio <= 0 ? 0.001 : Math.min(0.6, system.breakingError * (1 + ratio * 2));
  const throughput = Math.min(concurrency / (latency / 1000), system.capacity / (system.baseLatencyMs / 1000));
  return { latency, error, throughput };
}

// p50/p95/p99 are simple multiples of mean latency to keep this teachable.
export function percentiles(mean) {
  return { p50: mean * 0.85, p95: mean * 1.8, p99: mean * 2.6 };
}

// Little's Law: L = λ × W. Given any two, return the third.
export function littlesLaw({ L, lambda, W }) {
  if (L === undefined && lambda !== undefined && W !== undefined) return { L: lambda * W };
  if (lambda === undefined && L !== undefined && W !== undefined) return { lambda: L / W };
  if (W === undefined && L !== undefined && lambda !== undefined) return { W: L / lambda };
  return {};
}

// Find the smallest concurrency where latency first exceeds 2× base — a
// reasonable approximation of "knee of the curve" for teaching.
export function kneeConcurrency(system) {
  for (let c = 1; c <= 200; c++) {
    if (systemResponse(system, c).latency >= system.baseLatencyMs * 2) return c;
  }
  return null;
}

// ── State ───────────────────────────────────────────────────────────

const state = {
  profile: 'load',
  systemIdx: 0,
  // Little's-Law toy: independent set of (λ, W) that students drag.
  ll: { lambda: 200, W: 0.05 },  // L derived
  quiz: { active: false, phase: 'idle', answer: '' },
  lab:  { active: false, text: '' },
};

let root;

function currentSystem() {
  return SYSTEMS[state.systemIdx];
}

function shapePoints(profile, ticks = 30) {
  const out = [];
  for (let i = 0; i <= ticks; i++) {
    const tickN = (i / ticks) * 100;
    out.push({ x: i, y: loadShape(profile, tickN) });
  }
  return out;
}

function shapeSvg(profile) {
  const pts = shapePoints(profile);
  const max = Math.max(...pts.map((p) => p.y));
  const W = 240, H = 70;
  const path = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - (p.y / max) * (H - 6) - 3;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" class="plp-shape__svg" aria-hidden="true">
    <path d="${path}" fill="none" stroke="#1d4ed8" stroke-width="1.6"/>
  </svg>`;
}

function renderProfiles() {
  return `
    <div class="plp-profiles" data-testid="plp-profiles">
      ${PROFILES.map((p) => `
        <button type="button"
          class="plp-profile-chip${state.profile === p ? ' plp-profile-chip--active' : ''}"
          data-profile="${p}"
          data-testid="plp-profile-${p}">
          <span class="plp-profile-chip__name">${t('plp.profile.' + p)}</span>
          ${shapeSvg(p)}
          <span class="plp-profile-chip__desc">${t('plp.profile.' + p + '.desc')}</span>
        </button>`).join('')}
    </div>`;
}

function renderDashboard() {
  const sys = currentSystem();
  // Sample at peak of profile.
  const peakConcurrency = state.profile === 'spike' ? 100 : (state.profile === 'stress' ? 90 : (state.profile === 'load' ? 60 : 50));
  const r = systemResponse(sys, peakConcurrency);
  const pct = percentiles(r.latency);
  const knee = kneeConcurrency(sys);
  return `
    <div class="plp-dashboard" data-testid="plp-dashboard">
      <h3>${t('plp.dash.title', { sys: t(sys.titleKey), profile: t('plp.profile.' + state.profile) })}</h3>
      <div class="plp-metrics">
        <div class="plp-metric"><span>${t('plp.metric.concurrency')}</span><strong data-testid="plp-met-concurrency">${peakConcurrency.toFixed(0)}</strong></div>
        <div class="plp-metric"><span>${t('plp.metric.throughput')}</span><strong data-testid="plp-met-throughput">${r.throughput.toFixed(1)} req/s</strong></div>
        <div class="plp-metric"><span>${t('plp.metric.p50')}</span><strong data-testid="plp-met-p50">${pct.p50.toFixed(0)} ms</strong></div>
        <div class="plp-metric"><span>${t('plp.metric.p95')}</span><strong data-testid="plp-met-p95">${pct.p95.toFixed(0)} ms</strong></div>
        <div class="plp-metric"><span>${t('plp.metric.p99')}</span><strong data-testid="plp-met-p99">${pct.p99.toFixed(0)} ms</strong></div>
        <div class="plp-metric"><span>${t('plp.metric.error')}</span><strong class="plp-metric--err" data-testid="plp-met-error">${(r.error * 100).toFixed(2)}%</strong></div>
      </div>
      <p class="plp-knee" data-testid="plp-knee">${t('plp.knee', { knee, cap: sys.capacity })}</p>
    </div>`;
}

function renderLittlesLaw() {
  const L = state.ll.lambda * state.ll.W;
  return `
    <div class="plp-little" data-testid="plp-little">
      <h3>${t('plp.little.title')}</h3>
      <p class="plp-little__formula">L = λ × W</p>
      <div class="plp-little__controls">
        <label>
          <span>λ (req/s)</span>
          <input type="range" min="10" max="2000" step="10"
            value="${state.ll.lambda}" data-ll-input="lambda" data-testid="plp-ll-lambda">
          <strong>${state.ll.lambda}</strong>
        </label>
        <label>
          <span>W (s/req)</span>
          <input type="range" min="0.005" max="0.5" step="0.005"
            value="${state.ll.W}" data-ll-input="W" data-testid="plp-ll-W">
          <strong>${state.ll.W.toFixed(3)}</strong>
        </label>
        <div class="plp-little__derived">
          <span>${t('plp.little.derivedL')}</span>
          <strong data-testid="plp-ll-derived">${L.toFixed(1)}</strong>
        </div>
      </div>
      <p class="plp-little__hint">${t('plp.little.hint')}</p>
    </div>`;
}

function renderBridges() {
  return `
    <div class="plp-bridges">
      <button type="button" class="plp-bridge" data-testid="plp-bridge-rbt"
        title="${t('plp.bridge.rbt.title')}">
        🔗 → ${t('section.rbt')}
      </button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="plp-quiz-start" data-testid="plp-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'b';
    return `<div class="plp-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="plp-quiz-result">
      <p>${correct ? t('plp.quiz.correct') : t('plp.quiz.wrong')}</p>
    </div>`;
  }
  return `
    <div class="plp-quiz" data-testid="plp-quiz">
      <p class="plp-quiz-prompt">${t('plp.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="plp-quiz-option">
          <input type="radio" name="plp-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('plp.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="plp-quiz-submit" data-testid="plp-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="plp-lab-start" data-testid="plp-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="plp-lab" data-testid="plp-lab">
      <p class="plp-lab-prompt">${t('plp.lab.prompt')}</p>
      <textarea class="plp-lab-textarea" data-testid="plp-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  root.innerHTML = `
    <div class="plp-wrap" data-testid="plp-wrap">
      <h2 class="plp-title">${t('plp.title')}</h2>
      <p class="plp-desc">${t('plp.desc')}</p>

      <div class="plp-systems" data-testid="plp-systems">
        ${SYSTEMS.map((s, i) => `
          <button type="button"
            class="plp-system-chip${i === state.systemIdx ? ' plp-system-chip--active' : ''}"
            data-system="${i}"
            data-testid="plp-system-${s.id}">${t(s.titleKey)}</button>`).join('')}
      </div>

      ${renderProfiles()}
      ${renderDashboard()}
      ${renderLittlesLaw()}
      ${renderBridges()}

      <section class="plp-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-system]').forEach((btn) => {
    btn.addEventListener('click', () => { state.systemIdx = Number(btn.dataset.system); render(); });
  });
  root.querySelectorAll('[data-profile]').forEach((btn) => {
    btn.addEventListener('click', () => { state.profile = btn.dataset.profile; render(); });
  });
  root.querySelectorAll('[data-ll-input]').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.dataset.llInput;
      state.ll[key] = Number(input.value);
      render();
    });
  });
  root.querySelector('[data-testid="plp-bridge-rbt"]')?.addEventListener('click', () => {
    document.querySelector('[data-section="rbt"]')?.click();
    document.querySelector('[data-testid="section-rbt"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  root.querySelector('[data-testid="plp-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="plp-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="plp-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="plp-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="plp-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createPerformanceLoadProfileExplorer() {
  state.profile = 'load';
  state.systemIdx = 0;
  state.ll = { lambda: 200, W: 0.05 };
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab  = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { SYSTEMS };
