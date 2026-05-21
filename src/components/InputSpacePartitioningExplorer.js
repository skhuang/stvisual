import { t, onLocaleChange } from '../i18n/index.js';
import { ISP_EXAMPLES } from '../data/ispExamples.js';
import {
  allCombinations, tWise, pairWise, eachChoice, baseChoice, multipleBaseChoice,
} from '../utils/inputSpacePartition.js';

// Input Space Partitioning Explorer — Ammann & Offutt's IDM + the six
// coverage criteria with a subsumption lattice and test-count comparison.
// Closure-factory style (per-instance state), matching PairwiseExplorer.

const CRITERIA = ['acoc', 'twc', 'pwc', 'ecc', 'bcc', 'mbcc'];
const MAX_ENUMERATE = 500;   // never build a test set larger than this
const MAX_ROWS = 100;        // cap the displayed table

let _uid = 0;
function uid() { _uid += 1; return `i${_uid}`; }

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

// Build a runtime IDM (with per-instance ids) from an authored example.
function idmFromExample(ex) {
  return ex.characteristics.map((c) => {
    const blocks = c.blocks.map((label) => ({ id: uid(), label }));
    return { id: uid(), name: c.name, blocks, baseBlockIds: [blocks[c.baseIndex].id] };
  });
}

export function createInputSpacePartitioningExplorer() {
  const root = document.createElement('div');
  root.className = 'isp-explorer';
  root.dataset.testid = 'isp-explorer';

  let exampleId = ISP_EXAMPLES[0].id;
  let idm = idmFromExample(ISP_EXAMPLES[0]);
  let criterion = 'acoc';
  let twiseTVal = 2;
  const blockDraft = {};   // characteristicId → pending new-block text
  const quiz = { active: false, phase: 'idle', answer: '' };

  // ── engine dispatch ──────────────────────────────────────────────────────────

  function generate(crit) {
    switch (crit) {
      case 'acoc': return allCombinations(idm);
      case 'twc':  return tWise(idm, twiseTVal);
      case 'pwc':  return pairWise(idm);
      case 'ecc':  return eachChoice(idm);
      case 'bcc':  return baseChoice(idm);
      case 'mbcc': return multipleBaseChoice(idm);
      default:     return [];
    }
  }

  // Count for a criterion — uses formulas where they avoid enumerating a huge
  // set (ACoC), generation otherwise.
  function countFor(crit) {
    if (crit === 'acoc') return idm.length === 0 ? 0 : idm.reduce((n, c) => n * c.blocks.length, 1);
    if (crit === 'ecc')  return idm.length === 0 ? 0 : Math.max(...idm.map((c) => c.blocks.length));
    if (crit === 'bcc')  return idm.length === 0 ? 0 : 1 + idm.reduce((n, c) => n + c.blocks.length - 1, 0);
    return generate(crit).length;   // pwc / twc / mbcc — covering arrays stay small
  }

  // ── validation ───────────────────────────────────────────────────────────────

  function idmError() {
    if (idm.some((c) => c.blocks.length < 1)) return 'isp.invalidIDM';
    if (criterion === 'bcc' && idm.some((c) => c.baseBlockIds.length !== 1)) return 'isp.invalidBCC';
    if (criterion === 'mbcc' && idm.some((c) => c.baseBlockIds.length < 1)) return 'isp.invalidMBCC';
    return null;
  }

  // ── sub-renderers ────────────────────────────────────────────────────────────

  function renderExampleChips() {
    return `<div class="isp-chip-bar" data-testid="isp-examples">
      ${ISP_EXAMPLES.map((ex) => `
        <button type="button"
          class="isp-chip${exampleId === ex.id ? ' isp-chip--active' : ''}"
          data-testid="isp-example-${esc(ex.id)}" data-isp-example="${esc(ex.id)}">
          ${esc(t(ex.nameKey))}
        </button>`).join('')}
    </div>`;
  }

  function renderIdm() {
    const baseInteractive = criterion === 'bcc' || criterion === 'mbcc';
    const rows = idm.map((c, ci) => `
      <div class="isp-char-row" data-testid="isp-characteristic-${ci}">
        <input class="isp-char-name" data-isp-char-name="${esc(c.id)}" value="${esc(c.name)}" />
        <div class="isp-block-bar">
          ${c.blocks.map((b) => `
            <span class="isp-block${c.baseBlockIds.includes(b.id) ? ' isp-block--base' : ''}${baseInteractive ? ' isp-block--base-interactive' : ''}"
              data-testid="isp-block-${esc(c.id)}-${esc(b.id)}"
              data-isp-block="${esc(c.id)}:${esc(b.id)}">
              ${esc(b.label)}
              <button type="button" class="isp-block-x" data-isp-block-remove="${esc(c.id)}:${esc(b.id)}">×</button>
            </span>`).join('')}
          <input class="isp-add-block" data-testid="isp-add-block-${ci}" data-isp-add-block="${esc(c.id)}"
            placeholder="${esc(t('isp.addBlock'))}" value="${esc(blockDraft[c.id] || '')}" />
        </div>
        <button type="button" class="isp-char-x" data-isp-char-remove="${esc(c.id)}"
          title="${esc(t('isp.removeCharacteristic'))}">×</button>
      </div>`).join('');
    return `<div class="isp-idm" data-testid="isp-idm">
      <div class="isp-idm-head">
        <h3>${esc(t('isp.idmTitle'))}</h3>
        <button type="button" class="isp-add-char" data-testid="isp-add-characteristic" data-isp-add-char>
          ${esc(t('isp.addCharacteristic'))}
        </button>
      </div>
      ${rows}
      ${baseInteractive ? `<p class="isp-hint">${esc(t('isp.baseHint'))}</p>` : ''}
    </div>`;
  }

  function renderCriterionSelector() {
    const btns = CRITERIA.map((c) => `
      <button type="button"
        class="isp-criterion-btn${criterion === c ? ' isp-criterion-btn--active' : ''}"
        data-testid="isp-criterion-${c}" data-isp-criterion="${c}">
        ${esc(t(`isp.criterion.${c}`))}
      </button>`).join('');
    const tStep = criterion === 'twc' ? `
      <label class="isp-twise-t">${esc(t('isp.twiseT'))}
        <input type="number" min="2" max="${idm.length}" value="${twiseTVal}"
          data-testid="isp-twise-t" data-isp-twise-t />
      </label>` : '';
    return `<div class="isp-criterion-bar">
      <span class="isp-criterion-title">${esc(t('isp.criterionTitle'))}</span>
      ${btns}${tStep}
    </div>`;
  }

  function renderTestSet() {
    const err = idmError();
    if (err) {
      return `<div class="isp-test-set" data-testid="isp-test-set">
        <p class="isp-invalid">${esc(t(err))}</p></div>`;
    }
    // ACoC's count is ∏ kᵢ — check it via the formula so a huge product is
    // never enumerated. The other criteria's covering arrays stay small, so
    // generating them once is safe.
    if (criterion === 'acoc') {
      const acocCount = countFor('acoc');
      if (acocCount > MAX_ENUMERATE) {
        return `<div class="isp-test-set" data-testid="isp-test-set">
          <h3>${esc(t('isp.testSetTitle'))} — ${acocCount} ${esc(t('isp.testCountUnit'))}</h3>
          <p class="isp-invalid">${esc(t('isp.tooLarge'))}</p></div>`;
      }
    }
    const tests = generate(criterion);
    const shown = tests.slice(0, MAX_ROWS);
    const header = idm.map((c) => `<th>${esc(c.name)}</th>`).join('');
    const rows = shown.map((test, ri) => `
      <tr data-testid="isp-test-row-${ri}">
        <td>${ri + 1}</td>
        ${idm.map((c) => {
          const block = c.blocks.find((b) => b.id === test[c.id]);
          return `<td>${esc(block ? block.label : '')}</td>`;
        }).join('')}
      </tr>`).join('');
    const capNote = tests.length > MAX_ROWS
      ? `<p class="isp-cap-note">${esc(t('isp.capNote'))}</p>` : '';
    return `<div class="isp-test-set" data-testid="isp-test-set">
      <h3>${esc(t('isp.testSetTitle'))} — ${tests.length} ${esc(t('isp.testCountUnit'))}</h3>
      <table class="isp-test-table">
        <thead><tr><th>#</th>${header}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${capNote}
    </div>`;
  }

  function renderCountComparison() {
    const counts = CRITERIA.map((c) => ({ c, n: countFor(c) }));
    const max = Math.max(1, ...counts.map((x) => x.n));
    return `<div class="isp-count" data-testid="isp-count">
      <h3>${esc(t('isp.countComparison'))}</h3>
      ${counts.map(({ c, n }) => `
        <div class="isp-count-row${criterion === c ? ' isp-count-row--active' : ''}">
          <span class="isp-count-label">${esc(t(`isp.criterion.${c}`))}</span>
          <span class="isp-count-bar" data-testid="isp-count-bar-${c}"
            style="width:${Math.round((n / max) * 100)}%"></span>
          <span class="isp-count-n">${n}</span>
        </div>`).join('')}
    </div>`;
  }

  function renderLattice() {
    // Static subsumption: acoc→twc→pwc→ecc ; mbcc→bcc→ecc.
    return `<div class="isp-lattice" data-testid="isp-lattice">
      <h3>${esc(t('isp.subsumption'))}</h3>
      <div class="isp-lattice-graph">
        ${CRITERIA.map((c) => `
          <span class="isp-lattice-node isp-lattice-node--${c}${criterion === c ? ' isp-lattice-node--active' : ''}"
            data-testid="isp-lattice-node-${c}">${esc(t(`isp.criterion.${c}`))}</span>`).join('')}
      </div>
      <p class="isp-hint">${esc(t('isp.subsumptionHint'))}</p>
    </div>`;
  }

  function renderQuiz() {
    if (!quiz.active) {
      return `<button type="button" class="isp-quiz-start" data-testid="isp-quiz-start">${esc(t('quiz.start'))}</button>`;
    }
    if (quiz.phase === 'done') {
      const correct = quiz.answer === 'c';
      return `<div class="isp-quiz-result ${correct ? 'quiz-correct' : 'quiz-wrong'}" data-testid="isp-quiz-result">
        <p>${correct ? esc(t('quiz.correct')) : esc(t('quiz.wrong'))}</p>
        <button type="button" data-testid="isp-quiz-close">${esc(t('quiz.close'))}</button>
      </div>`;
    }
    return `<div class="isp-quiz" data-testid="isp-quiz">
      <p>${esc(t('isp.quiz.prompt'))}</p>
      ${['a', 'b', 'c', 'd'].map((k) => `
        <label class="isp-quiz-option">
          <input type="radio" name="isp-quiz" value="${k}" ${quiz.answer === k ? 'checked' : ''} />
          ${esc(t(`isp.quiz.${k}`))}
        </label>`).join('')}
      <button type="button" data-testid="isp-quiz-submit" ${!quiz.answer ? 'disabled' : ''}>${esc(t('quiz.submit'))}</button>
    </div>`;
  }

  function render() {
    root.innerHTML = `
      <div class="isp-wrap">
        ${renderExampleChips()}
        ${renderIdm()}
        ${renderCriterionSelector()}
        <div class="isp-panels-row">
          ${renderTestSet()}
          ${renderCountComparison()}
        </div>
        ${renderLattice()}
        <section class="isp-self-test">
          <h3>${esc(t('quiz.title'))}</h3>
          ${renderQuiz()}
        </section>
      </div>`;
    bindEvents();
  }

  function findChar(cid) { return idm.find((c) => c.id === cid); }

  function bindEvents() {
    root.querySelectorAll('[data-isp-example]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ex = ISP_EXAMPLES.find((e) => e.id === btn.dataset.ispExample);
        if (!ex || ex.id === exampleId) return;
        exampleId = ex.id;
        idm = idmFromExample(ex);
        render();
      });
    });
    root.querySelectorAll('[data-isp-criterion]').forEach((btn) => {
      btn.addEventListener('click', () => { criterion = btn.dataset.ispCriterion; render(); });
    });
    root.querySelector('[data-isp-twise-t]')?.addEventListener('change', (e) => {
      const v = parseInt(e.target.value, 10);
      twiseTVal = Number.isFinite(v) ? Math.max(2, Math.min(v, idm.length)) : 2;
      render();
    });
    root.querySelectorAll('[data-isp-char-name]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const c = findChar(inp.dataset.ispCharName);
        if (c) { c.name = inp.value; render(); }
      });
    });
    root.querySelector('[data-isp-add-char]')?.addEventListener('click', () => {
      const b1 = { id: uid(), label: 'block 1' };
      const b2 = { id: uid(), label: 'block 2' };
      idm.push({ id: uid(), name: 'new characteristic', blocks: [b1, b2], baseBlockIds: [b1.id] });
      render();
    });
    root.querySelectorAll('[data-isp-char-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        idm = idm.filter((c) => c.id !== btn.dataset.ispCharRemove);
        render();
      });
    });
    root.querySelectorAll('[data-isp-add-block]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const cid = inp.dataset.ispAddBlock;
        const label = inp.value.trim();
        const c = findChar(cid);
        if (c && label) { c.blocks.push({ id: uid(), label }); blockDraft[cid] = ''; }
        else { blockDraft[cid] = inp.value; }
        render();
      });
    });
    root.querySelectorAll('[data-isp-block-remove]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const [cid, bid] = btn.dataset.ispBlockRemove.split(':');
        const c = findChar(cid);
        if (!c || c.blocks.length <= 1) return;  // keep ≥1 block
        c.blocks = c.blocks.filter((b) => b.id !== bid);
        c.baseBlockIds = c.baseBlockIds.filter((id) => id !== bid);
        if (c.baseBlockIds.length === 0) c.baseBlockIds = [c.blocks[0].id];
        render();
      });
    });
    // Base-block marking — only when BCC/MBCC is active.
    root.querySelectorAll('.isp-block--base-interactive').forEach((span) => {
      span.addEventListener('click', () => {
        const [cid, bid] = span.dataset.ispBlock.split(':');
        const c = findChar(cid);
        if (!c) return;
        if (criterion === 'bcc') {
          c.baseBlockIds = [bid];                       // exactly one base
        } else {                                        // mbcc — toggle
          c.baseBlockIds = c.baseBlockIds.includes(bid)
            ? c.baseBlockIds.filter((id) => id !== bid)
            : [...c.baseBlockIds, bid];
          if (c.baseBlockIds.length === 0) c.baseBlockIds = [bid];
        }
        render();
      });
    });
    root.querySelector('[data-testid="isp-quiz-start"]')?.addEventListener('click', () => {
      quiz.active = true; quiz.phase = 'question'; quiz.answer = ''; render();
    });
    root.querySelectorAll('input[name="isp-quiz"]').forEach((inp) => {
      inp.addEventListener('change', () => { quiz.answer = inp.value; render(); });
    });
    root.querySelector('[data-testid="isp-quiz-submit"]')?.addEventListener('click', () => {
      quiz.phase = 'done'; render();
    });
    root.querySelector('[data-testid="isp-quiz-close"]')?.addEventListener('click', () => {
      quiz.active = false; quiz.phase = 'idle'; quiz.answer = ''; render();
    });
  }

  onLocaleChange(() => render());
  render();
  return root;
}
