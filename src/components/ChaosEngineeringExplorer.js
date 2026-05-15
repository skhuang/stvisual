import { t } from '../i18n/index.js';

// Each topology is a tiny dependency graph: nodes (services) and edges
// (consumer → provider). Fault propagation walks edges from any failing
// node forward; only nodes that depend (directly/transitively) on a
// broken node lose pass rate.
const TOPOLOGIES = [
  {
    id: 'ecommerce',
    titleKey: 'chx.topo.ecom.title',
    hypothesisKey: 'chx.topo.ecom.hypo',
    hypothesisP95: 800,            // ms
    hypothesisSuccess: 0.99,       // 99% of journeys succeed
    nodes: [
      { id: 'web',      labelKey: 'chx.node.web',      x: 60,  y: 50 },
      { id: 'gateway',  labelKey: 'chx.node.gateway',  x: 180, y: 50 },
      { id: 'orders',   labelKey: 'chx.node.orders',   x: 300, y: 25 },
      { id: 'payments', labelKey: 'chx.node.payments', x: 300, y: 80 },
      { id: 'inventory',labelKey: 'chx.node.inventory',x: 420, y: 25 },
      { id: 'cache',    labelKey: 'chx.node.cache',    x: 420, y: 80 },
    ],
    edges: [
      ['web', 'gateway'],
      ['gateway', 'orders'],
      ['gateway', 'payments'],
      ['orders', 'inventory'],
      ['payments', 'cache'],
    ],
  },
  {
    id: 'streaming',
    titleKey: 'chx.topo.stream.title',
    hypothesisKey: 'chx.topo.stream.hypo',
    hypothesisP95: 1500,
    hypothesisSuccess: 0.95,
    nodes: [
      { id: 'ingest',    labelKey: 'chx.node.ingest',    x: 60,  y: 55 },
      { id: 'queue',     labelKey: 'chx.node.queue',     x: 180, y: 55 },
      { id: 'encoder',   labelKey: 'chx.node.encoder',   x: 300, y: 30 },
      { id: 'transcode', labelKey: 'chx.node.transcode', x: 300, y: 80 },
      { id: 'cdn',       labelKey: 'chx.node.cdn',       x: 420, y: 55 },
    ],
    edges: [
      ['ingest', 'queue'],
      ['queue', 'encoder'],
      ['queue', 'transcode'],
      ['encoder', 'cdn'],
      ['transcode', 'cdn'],
    ],
  },
];

export const FAULT_KINDS = ['latency', 'drop', 'kill'];
export const SEVERITY_MENU = {
  latency: [200, 500, 1000],
  drop:    [0.10, 0.30, 0.50],
  kill:    [1],
};

// Pure fault propagation, exported for tests.
// Returns { nodeStatus: Map<nodeId, {pass: number, latencyMs: number}>,
//           blastRadius: Set<nodeId>, hypothesisHolds: bool, metrics }
export function applyFault(topology, fault) {
  // Defaults: all nodes healthy.
  const baseLatency = 60;
  const status = new Map();
  for (const n of topology.nodes) status.set(n.id, { pass: 1.0, latencyMs: baseLatency });

  if (!fault) {
    return { status, blastRadius: new Set(), hypothesisHolds: true, journeySuccess: 1.0, journeyP95: baseLatency * 1.8 };
  }

  // Apply the local fault to the targeted node.
  const target = status.get(fault.nodeId);
  if (!target) return { status, blastRadius: new Set(), hypothesisHolds: true, journeySuccess: 1.0, journeyP95: baseLatency * 1.8 };

  if (fault.kind === 'kill') {
    target.pass = 0.0;
    target.latencyMs = 30000;  // timeout
  } else if (fault.kind === 'drop') {
    target.pass = 1 - fault.severity;
    target.latencyMs = baseLatency;
  } else if (fault.kind === 'latency') {
    target.pass = 1.0;
    target.latencyMs = baseLatency + fault.severity;
  }

  // Propagate to direct + transitive consumers via a reverse-edge walk
  // (an edge `[a, b]` means a depends on b, so failures in b reduce a's
  // pass rate).
  // Build reverse adjacency: dependents of b = nodes pointing INTO b.
  const dependentsOf = new Map();
  for (const n of topology.nodes) dependentsOf.set(n.id, []);
  for (const [a, b] of topology.edges) dependentsOf.get(b).push(a);

  const blastRadius = new Set();
  const queue = [fault.nodeId];
  blastRadius.add(fault.nodeId);
  while (queue.length) {
    const cur = queue.shift();
    for (const dep of dependentsOf.get(cur) ?? []) {
      if (blastRadius.has(dep)) continue;
      // Dependent inherits ~70% of upstream failure intensity.
      const upstream = status.get(cur);
      const depState = status.get(dep);
      depState.pass = Math.min(depState.pass, 0.3 + 0.7 * upstream.pass);
      depState.latencyMs = Math.max(depState.latencyMs, upstream.latencyMs * 0.6);
      blastRadius.add(dep);
      queue.push(dep);
    }
  }

  // Journey-level rollup: product of pass rates of the entry node and
  // every downstream it transitively depends on. Use longest path latency.
  const journeySuccess = [...status.values()].reduce((p, s) => p * s.pass, 1);
  const journeyP95 = Math.max(...[...status.values()].map((s) => s.latencyMs)) * 1.8;
  const hypothesisHolds = journeySuccess >= topology.hypothesisSuccess && journeyP95 <= topology.hypothesisP95;

  return { status, blastRadius, hypothesisHolds, journeySuccess, journeyP95 };
}

// ── state ───────────────────────────────────────────────────────────

const state = {
  topoIdx: 0,
  fault: null, // { nodeId, kind, severity }
  quiz: { active: false, phase: 'idle', answer: '' },
  lab:  { active: false, text: '' },
};

let root;

function currentTopo() { return TOPOLOGIES[state.topoIdx]; }

function renderTopologyChips() {
  return `
    <div class="chx-topos" data-testid="chx-topos">
      ${TOPOLOGIES.map((tp, i) => `
        <button type="button"
          class="chx-topo-chip${i === state.topoIdx ? ' chx-topo-chip--active' : ''}"
          data-topo="${i}"
          data-testid="chx-topo-${tp.id}">${t(tp.titleKey)}</button>`).join('')}
    </div>`;
}

function renderGraph(result) {
  const topo = currentTopo();
  const W = 500, H = 130;
  const pos = Object.fromEntries(topo.nodes.map((n) => [n.id, n]));
  const lines = topo.edges.map(([a, b]) => {
    const A = pos[a], B = pos[b];
    return `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="#94a3b8" stroke-width="1.5" />`;
  }).join('');
  const circles = topo.nodes.map((n) => {
    const s = result.status.get(n.id);
    const inBlast = result.blastRadius.has(n.id);
    const fill = s.pass >= 0.95 ? '#86efac' : s.pass >= 0.5 ? '#fcd34d' : '#fca5a5';
    return `
      <g class="chx-node ${inBlast ? 'chx-node--blast' : ''}" data-testid="chx-node-${n.id}">
        <circle cx="${n.x}" cy="${n.y}" r="14" fill="${fill}" stroke="#1f2a44" stroke-width="1"/>
        <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" font-size="9" font-weight="700" fill="#1f2a44">${(s.pass * 100).toFixed(0)}</text>
        <text x="${n.x}" y="${n.y + 30}" text-anchor="middle" font-size="9" fill="#475569">${t(n.labelKey)}</text>
      </g>`;
  }).join('');
  return `
    <div class="chx-graph" data-testid="chx-graph">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('chx.graph.aria')}">
        ${lines}
        ${circles}
      </svg>
    </div>`;
}

function renderFaultMenu() {
  const topo = currentTopo();
  return `
    <div class="chx-fault" data-testid="chx-fault">
      <h3>${t('chx.fault.title')}</h3>
      <div class="chx-fault__form">
        <label>
          <span>${t('chx.fault.node')}</span>
          <select data-testid="chx-fault-node">
            <option value="">${t('chx.fault.none')}</option>
            ${topo.nodes.map((n) => `<option value="${n.id}" ${state.fault?.nodeId === n.id ? 'selected' : ''}>${t(n.labelKey)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>${t('chx.fault.kind')}</span>
          <select data-testid="chx-fault-kind">
            ${FAULT_KINDS.map((k) => `<option value="${k}" ${state.fault?.kind === k ? 'selected' : ''}>${t('chx.kind.' + k)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>${t('chx.fault.severity')}</span>
          <select data-testid="chx-fault-severity">
            ${(SEVERITY_MENU[state.fault?.kind ?? 'latency']).map((s) => `<option value="${s}" ${state.fault?.severity === s ? 'selected' : ''}>${formatSeverity(state.fault?.kind ?? 'latency', s)}</option>`).join('')}
          </select>
        </label>
        <button type="button" class="chx-fault__inject" data-testid="chx-fault-inject">
          ${t('chx.fault.inject')}
        </button>
        <button type="button" class="chx-fault__clear" data-testid="chx-fault-clear">
          ${t('chx.fault.clear')}
        </button>
      </div>
    </div>`;
}

function formatSeverity(kind, sev) {
  if (kind === 'latency') return `+${sev} ms`;
  if (kind === 'drop') return `${(sev * 100).toFixed(0)}%`;
  return 'on';
}

function renderHypothesis(result) {
  const topo = currentTopo();
  const holds = result.hypothesisHolds;
  return `
    <div class="chx-hypo chx-hypo--${holds ? 'pass' : 'fail'}" data-testid="chx-hypo">
      <strong>${holds ? t('chx.hypo.holds') : t('chx.hypo.broken')}</strong>
      <p>${t(topo.hypothesisKey, { p95: topo.hypothesisP95, success: (topo.hypothesisSuccess * 100).toFixed(0) })}</p>
      <ul class="chx-hypo__metrics">
        <li><span>${t('chx.metric.success')}</span><strong data-testid="chx-met-success">${(result.journeySuccess * 100).toFixed(1)}%</strong></li>
        <li><span>${t('chx.metric.p95')}</span><strong data-testid="chx-met-p95">${result.journeyP95.toFixed(0)} ms</strong></li>
        <li><span>${t('chx.metric.blast')}</span><strong data-testid="chx-met-blast">${result.blastRadius.size}</strong></li>
      </ul>
    </div>`;
}

function renderBridges() {
  return `
    <div class="chx-bridges">
      <button type="button" class="chx-bridge" data-testid="chx-bridge-e2e"
        title="${t('chx.bridge.e2e.title')}">
        🔗 → ${t('acceptanceTab.e2ejourney')}
      </button>
      <button type="button" class="chx-bridge" data-testid="chx-bridge-contract"
        title="${t('chx.bridge.contract.title')}">
        🔗 → ${t('acceptanceTab.contract')}
      </button>
    </div>`;
}

function renderQuiz() {
  if (!state.quiz.active) {
    return `<button type="button" class="chx-quiz-start" data-testid="chx-quiz-start">${t('quiz.start')}</button>`;
  }
  if (state.quiz.phase === 'done') {
    const correct = state.quiz.answer === 'c';
    return `<div class="chx-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="chx-quiz-result">
      <p>${correct ? t('chx.quiz.correct') : t('chx.quiz.wrong')}</p>
    </div>`;
  }
  return `
    <div class="chx-quiz" data-testid="chx-quiz">
      <p class="chx-quiz-prompt">${t('chx.quiz.prompt')}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="chx-quiz-option">
          <input type="radio" name="chx-quiz" value="${k}" ${state.quiz.answer === k ? 'checked' : ''}>
          ${t('chx.quiz.' + k)}
        </label>`).join('')}
      <button type="button" class="chx-quiz-submit" data-testid="chx-quiz-submit"
        ${!state.quiz.answer ? 'disabled' : ''}>${t('quiz.submit')}</button>
    </div>`;
}

function renderLab() {
  if (!state.lab.active) {
    return `<button type="button" class="chx-lab-start" data-testid="chx-lab-start">${t('lab.start')}</button>`;
  }
  return `
    <div class="chx-lab" data-testid="chx-lab">
      <p class="chx-lab-prompt">${t('chx.lab.prompt')}</p>
      <textarea class="chx-lab-textarea" data-testid="chx-lab-text" rows="5"
        placeholder="${t('lab.reflect.placeholder')}">${state.lab.text}</textarea>
    </div>`;
}

function render() {
  const result = applyFault(currentTopo(), state.fault);
  root.innerHTML = `
    <div class="chx-wrap" data-testid="chx-wrap">
      <h2 class="chx-title">${t('chx.title')}</h2>
      <p class="chx-desc">${t('chx.desc')}</p>

      ${renderTopologyChips()}
      ${renderGraph(result)}
      ${renderHypothesis(result)}
      ${renderFaultMenu()}
      ${renderBridges()}

      <section class="chx-self-test">
        <h3>${t('quiz.title')}</h3>
        ${renderQuiz()}
        <h3>${t('lab.reflect.title')}</h3>
        ${renderLab()}
      </section>
    </div>`;
  bindEvents();
}

function bindEvents() {
  root.querySelectorAll('[data-topo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.topoIdx = Number(btn.dataset.topo);
      state.fault = null;
      render();
    });
  });
  root.querySelector('[data-testid="chx-fault-inject"]')?.addEventListener('click', () => {
    const nodeId = root.querySelector('[data-testid="chx-fault-node"]').value;
    const kind = root.querySelector('[data-testid="chx-fault-kind"]').value;
    const rawSev = Number(root.querySelector('[data-testid="chx-fault-severity"]').value);
    // Severity dropdown is updated in-place when kind changes; if a stale
    // value (from a previous kind) slipped through, fall back to that
    // kind's default first severity.
    const allowed = SEVERITY_MENU[kind] ?? [];
    const severity = allowed.includes(rawSev) ? rawSev : allowed[0];
    if (!nodeId) return;
    state.fault = { nodeId, kind, severity };
    render();
  });
  root.querySelector('[data-testid="chx-fault-clear"]')?.addEventListener('click', () => {
    state.fault = null;
    render();
  });
  // When `kind` changes, swap the severity dropdown's options to match.
  // We mutate the DOM in place instead of re-rendering so the in-flight
  // user selection (node, kind) is preserved.
  root.querySelector('[data-testid="chx-fault-kind"]')?.addEventListener('change', (e) => {
    const sevSelect = root.querySelector('[data-testid="chx-fault-severity"]');
    if (!sevSelect) return;
    sevSelect.innerHTML = (SEVERITY_MENU[e.target.value] ?? []).map((s) =>
      `<option value="${s}">${formatSeverity(e.target.value, s)}</option>`
    ).join('');
  });
  root.querySelector('[data-testid="chx-bridge-e2e"]')?.addEventListener('click', () => {
    document.querySelector('[data-acceptance-tab="e2ejourney"]')?.click();
  });
  root.querySelector('[data-testid="chx-bridge-contract"]')?.addEventListener('click', () => {
    document.querySelector('[data-acceptance-tab="contract"]')?.click();
  });
  root.querySelector('[data-testid="chx-quiz-start"]')?.addEventListener('click', () => {
    state.quiz = { active: true, phase: 'question', answer: '' };
    render();
  });
  root.querySelectorAll('input[name="chx-quiz"]').forEach((inp) => {
    inp.addEventListener('change', () => { state.quiz.answer = inp.value; render(); });
  });
  root.querySelector('[data-testid="chx-quiz-submit"]')?.addEventListener('click', () => {
    state.quiz.phase = 'done';
    render();
  });
  root.querySelector('[data-testid="chx-lab-start"]')?.addEventListener('click', () => {
    state.lab.active = true;
    render();
  });
  root.querySelector('[data-testid="chx-lab-text"]')?.addEventListener('input', (e) => {
    state.lab.text = e.target.value;
  });
}

export function createChaosEngineeringExplorer() {
  state.topoIdx = 0;
  state.fault = null;
  state.quiz = { active: false, phase: 'idle', answer: '' };
  state.lab  = { active: false, text: '' };
  root = document.createElement('div');
  render();
  return root;
}

export { TOPOLOGIES };
