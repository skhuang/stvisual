import { grammarExamples } from '../data/grammarData.js';
import { t, getLocale, pickField } from '../i18n/index.js';
import {
  parseGrammar,
  generateDerivations,
  computeCoverage,
  generateGrammarMutants,
  evaluateMutantsAgainstStrings,
  GRAMMAR_OPERATORS,
} from '../utils/grammar.js';

const STORAGE_KEY = 'stvisual.grammarPrograms.v1';
const DEFAULT_OPS = ['TR', 'SD'];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function loadLocalGrammars() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveLocalGrammars(programs) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(programs));
  } catch {
    // ignore
  }
}

function formatProductionHtml(prod, highlight) {
  const rhs = prod.rhs.length === 0
    ? '""'
    : prod.rhs.map((s) => (s.kind === 'NT'
      ? `<span class="grammar-nt">&lt;${escapeHtml(s.value)}&gt;</span>`
      : `<span class="grammar-t">"${escapeHtml(s.value)}"</span>`)).join(' ');
  const cls = highlight ? 'grammar-prod covered' : 'grammar-prod';
  return `<div class="${cls}" data-prod-id="${prod.id}">
    <span class="grammar-prod-id">p${prod.id}</span>
    <span class="grammar-nt">&lt;${escapeHtml(prod.lhs)}&gt;</span>
    <span class="grammar-arrow">::=</span>
    ${rhs}
  </div>`;
}

export function createGrammarCoverageExplorer() {
  const root = document.createElement('div');
  root.className = 'grammar-coverage';
  root.dataset.testid = 'grammar-coverage';

  const initial = grammarExamples[0];
  const localPrograms = loadLocalGrammars();
  const initialText = localPrograms[initial.id] || initial.text;

  const state = {
    exampleId: initial.id,
    text: initialText,
    programs: localPrograms,
    customExamples: [],
    operators: new Set(DEFAULT_OPS),
    maxStrings: 8,
    maxDepth: 12,
    parseError: null,
    grammar: null,
    derivations: [],
    coverage: null,
    mutants: [],
    selectedMutantId: null,
    extraTests: '', // user-added test strings, one per line
  };

  function persistCurrent() {
    state.programs[state.exampleId] = state.text;
    saveLocalGrammars(state.programs);
  }

  function recompute() {
    state.parseError = null;
    state.grammar = null;
    state.derivations = [];
    state.coverage = null;
    state.mutants = [];
    try {
      const g = parseGrammar(state.text);
      state.grammar = g;
      state.derivations = generateDerivations(g, {
        maxStrings: state.maxStrings,
        maxDepth: state.maxDepth,
      });
      state.coverage = computeCoverage(state.derivations, g);
      const ops = [...state.operators];
      if (ops.length > 0) {
        const generated = generateGrammarMutants(g, ops);
        const allTestStrings = [
          ...state.derivations.map((d) => d.string),
          ...state.extraTests.split('\n').map((s) => s).filter((_, idx, arr) => arr.indexOf(arr[idx]) === idx),
        ];
        state.mutants = evaluateMutantsAgainstStrings(g, generated, allTestStrings);
      }
      if (!state.mutants.find((m) => m.id === state.selectedMutantId)) {
        state.selectedMutantId = state.mutants[0]?.id || null;
      }
    } catch (err) {
      state.parseError = err.message || String(err);
    }
  }

  function loadExample(id) {
    const ex = grammarExamples.find((e) => e.id === id) || state.customExamples.find((e) => e.id === id);
    if (!ex) return;
    state.exampleId = id;
    state.text = state.programs[id] || ex.text;
    state.selectedMutantId = null;
  }

  function render() {
    recompute();

    const allExamples = [...grammarExamples, ...state.customExamples];
    const exampleButtons = allExamples.map((ex) => `
      <button
        type="button"
        class="grammar-example-btn${state.exampleId === ex.id ? ' active' : ''}"
        data-grammar-example="${ex.id}"
        title="${escapeHtml(getLocale() === 'en' ? (ex.descriptionEn || ex.description) : ex.description)}"
      >${escapeHtml(pickField(ex, 'name'))}</button>
    `).join('');

    const operatorButtons = GRAMMAR_OPERATORS.map((op) => `
      <label class="grammar-op-btn${state.operators.has(op) ? ' active' : ''}">
        <input type="checkbox" data-grammar-op="${op}" ${state.operators.has(op) ? 'checked' : ''} />
        <span>${op}</span>
      </label>
    `).join('');

    const productionsHtml = state.grammar
      ? state.grammar.productions
        .map((p) => formatProductionHtml(p, state.coverage?.pdc.covered.has(p.id)))
        .join('')
      : '';

    const derivationsHtml = state.derivations.length === 0
      ? `<p class="grammar-empty">${escapeHtml(t('grammar.noDerivations'))}</p>`
      : `<ol class="grammar-derivations">
          ${state.derivations.map((d) => `<li><code>${escapeHtml(d.string === '' ? '∅' : d.string)}</code>
            <span class="grammar-derivation-meta">depth ${d.depth} · p[${d.productionsUsed.join(', ')}]</span></li>`).join('')}
         </ol>`;

    const pdcRatio = state.coverage ? Math.round(state.coverage.pdc.ratio * 100) : 0;
    const tscRatio = state.coverage ? Math.round(state.coverage.tsc.ratio * 100) : 0;

    const terminalsHtml = state.grammar
      ? [...state.grammar.terminals].map((tm) => {
        const covered = state.coverage?.tsc.covered.has(tm);
        return `<span class="grammar-terminal-chip${covered ? ' covered' : ''}">"${escapeHtml(tm)}"</span>`;
      }).join('')
      : '';

    const mutantsHtml = state.mutants.length === 0
      ? `<p class="grammar-empty">${escapeHtml(t('grammar.noMutants'))}</p>`
      : `<ul class="grammar-mutant-list">
          ${state.mutants.map((m) => `<li>
            <button type="button"
              class="grammar-mutant-btn${state.selectedMutantId === m.id ? ' active' : ''} ${m.killed ? 'killed' : 'live'}"
              data-grammar-mutant="${escapeHtml(m.id)}">
              <span class="grammar-mutant-op">${m.operator}</span>
              <span class="grammar-mutant-status">${m.killed ? t('grammar.killed') : t('grammar.live')}</span>
              <span class="grammar-mutant-desc">${escapeHtml(m.description)}</span>
            </button>
          </li>`).join('')}
         </ul>`;

    const selectedMutant = state.mutants.find((m) => m.id === state.selectedMutantId) || null;
    const selectedMutantDetailHtml = selectedMutant
      ? `<div class="grammar-mutant-detail">
          <h5>${escapeHtml(selectedMutant.id)}</h5>
          <p>${escapeHtml(selectedMutant.description)}</p>
          ${selectedMutant.killed
            ? `<p class="grammar-mutant-killers"><strong>${escapeHtml(t('grammar.killedBy'))}</strong></p>
               <ul class="grammar-killer-list">${selectedMutant.killers.slice(0, 8).map((k) => `<li><code>${escapeHtml(k.string === '' ? '∅' : k.string)}</code> · ${k.origAccepts ? t('grammar.origAccepts') : t('grammar.origRejects')} · ${k.mutAccepts ? t('grammar.mutAccepts') : t('grammar.mutRejects')}</li>`).join('')}</ul>`
            : `<p class="grammar-mutant-live">${escapeHtml(t('grammar.liveHint'))}</p>`}
        </div>`
      : `<p class="grammar-empty">${escapeHtml(t('grammar.selectMutantHint'))}</p>`;

    const score = state.mutants.length === 0
      ? null
      : { killed: state.mutants.filter((m) => m.killed).length, total: state.mutants.length };

    root.innerHTML = `
      <div class="grammar-card">
        <header class="grammar-header">
          <p class="grammar-kicker">${escapeHtml(t('grammar.kicker'))}</p>
          <h3>${escapeHtml(t('grammar.title'))}</h3>
          <p class="grammar-subtitle">${escapeHtml(t('grammar.subtitle'))}</p>
        </header>

        <div class="grammar-example-row" data-testid="grammar-example-row">
          ${exampleButtons}
        </div>

        <div class="grammar-editor-grid">
          <div class="grammar-editor-col">
            <label class="grammar-editor-label">
              ${escapeHtml(t('grammar.bnfEditor'))}
              <textarea data-testid="grammar-text" rows="8" spellcheck="false">${escapeHtml(state.text)}</textarea>
            </label>
            ${state.parseError ? `<p class="grammar-error" data-testid="grammar-parse-error">${escapeHtml(state.parseError)}</p>` : ''}
            <div class="grammar-controls-row">
              <label>${escapeHtml(t('grammar.maxStrings'))}
                <input type="number" min="1" max="40" value="${state.maxStrings}" data-grammar-max-strings />
              </label>
              <label>${escapeHtml(t('grammar.maxDepth'))}
                <input type="number" min="1" max="40" value="${state.maxDepth}" data-grammar-max-depth />
              </label>
            </div>
            <label class="grammar-editor-label">
              ${escapeHtml(t('grammar.extraTests'))}
              <textarea data-testid="grammar-extra-tests" rows="3" spellcheck="false" placeholder="${escapeHtml(t('grammar.extraTestsHint'))}">${escapeHtml(state.extraTests)}</textarea>
            </label>
          </div>

          <div class="grammar-editor-col">
            <h4>${escapeHtml(t('grammar.productions'))}</h4>
            <div class="grammar-productions">${productionsHtml}</div>
            <div class="grammar-coverage-summary">
              <div class="grammar-metric">
                <span class="grammar-metric-label">PDC</span>
                <span class="grammar-metric-value" data-testid="grammar-pdc">${state.coverage?.pdc.covered.size || 0} / ${state.coverage?.pdc.all.size || 0} (${pdcRatio}%)</span>
              </div>
              <div class="grammar-metric">
                <span class="grammar-metric-label">TSC</span>
                <span class="grammar-metric-value" data-testid="grammar-tsc">${state.coverage?.tsc.covered.size || 0} / ${state.coverage?.tsc.all.size || 0} (${tscRatio}%)</span>
              </div>
            </div>
            <div class="grammar-terminals">${terminalsHtml}</div>
          </div>
        </div>

        <div class="grammar-derivation-block">
          <h4>${escapeHtml(t('grammar.derivations'))}</h4>
          ${derivationsHtml}
        </div>

        <div class="grammar-mutation-block">
          <div class="grammar-mutation-header">
            <h4>${escapeHtml(t('grammar.mutations'))}</h4>
            ${score ? `<span class="grammar-score" data-testid="grammar-mutation-score">${t('grammar.scoreLabel')}: ${score.killed} / ${score.total} (${Math.round(score.killed / score.total * 100)}%)</span>` : ''}
          </div>
          <div class="grammar-op-row">${operatorButtons}</div>
          <div class="grammar-mutation-grid">
            <div>${mutantsHtml}</div>
            <div>${selectedMutantDetailHtml}</div>
          </div>
        </div>
      </div>
    `;

    // events
    root.querySelectorAll('[data-grammar-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        loadExample(btn.dataset.grammarExample);
        render();
      });
    });
    const ta = root.querySelector('[data-testid="grammar-text"]');
    ta?.addEventListener('input', (e) => { state.text = e.target.value; persistCurrent(); });
    ta?.addEventListener('change', () => { render(); });
    root.querySelector('[data-testid="grammar-extra-tests"]')?.addEventListener('input', (e) => {
      state.extraTests = e.target.value;
    });
    root.querySelector('[data-testid="grammar-extra-tests"]')?.addEventListener('change', () => render());
    root.querySelector('[data-grammar-max-strings]')?.addEventListener('change', (e) => {
      state.maxStrings = Math.max(1, Math.min(40, Number(e.target.value) || 1));
      render();
    });
    root.querySelector('[data-grammar-max-depth]')?.addEventListener('change', (e) => {
      state.maxDepth = Math.max(1, Math.min(40, Number(e.target.value) || 1));
      render();
    });
    root.querySelectorAll('[data-grammar-op]').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const op = e.target.dataset.grammarOp;
        if (e.target.checked) state.operators.add(op);
        else state.operators.delete(op);
        render();
      });
    });
    root.querySelectorAll('[data-grammar-mutant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.selectedMutantId = btn.dataset.grammarMutant;
        render();
      });
    });
  }

  render();

  if (typeof globalThis.addEventListener === 'function') {
    globalThis.addEventListener('stvisual:load-program-source', (event) => {
      if (!root.isConnected) return;
      const detail = event.detail || {};
      if (detail.target !== 'grammar') return;
      const content = String(detail.content ?? '');
      const baseName = (detail.name || 'uploaded').replace(/\.[^.]+$/, '') || 'uploaded';
      const id = `uploaded-grammar-${Date.now().toString(36)}`;
      const newExample = {
        id,
        name: baseName,
        nameEn: baseName,
        description: `Uploaded from cloud: ${detail.name || baseName}`,
        descriptionEn: `Uploaded from cloud: ${detail.name || baseName}`,
        text: content,
      };
      state.customExamples = [...state.customExamples, newExample];
      state.programs[id] = content;
      state.exampleId = id;
      state.text = content;
      state.selectedMutantId = null;
      persistCurrent();
      render();
    });
  }

  return root;
}
