import { t, getLocale } from '../i18n/index.js';

const STORAGE_KEY = 'stvisual.et.v1';

const SFDIPOT_ITEMS = [
  { id: 'S', key: 'et.sfdipot.S', descKey: 'et.sfdipot.S.desc' },
  { id: 'F', key: 'et.sfdipot.F', descKey: 'et.sfdipot.F.desc' },
  { id: 'D', key: 'et.sfdipot.D', descKey: 'et.sfdipot.D.desc' },
  { id: 'I', key: 'et.sfdipot.I', descKey: 'et.sfdipot.I.desc' },
  { id: 'P', key: 'et.sfdipot.P', descKey: 'et.sfdipot.P.desc' },
  { id: 'O', key: 'et.sfdipot.O', descKey: 'et.sfdipot.O.desc' },
  { id: 'T', key: 'et.sfdipot.T', descKey: 'et.sfdipot.T.desc' },
];

const HICCUPPS_ITEMS = [
  { id: 'H', key: 'et.hiccupps.H' },
  { id: 'I', key: 'et.hiccupps.I' },
  { id: 'C', key: 'et.hiccupps.C' },
  { id: 'C2', key: 'et.hiccupps.C2' },
  { id: 'U', key: 'et.hiccupps.U' },
  { id: 'P', key: 'et.hiccupps.P' },
  { id: 'P2', key: 'et.hiccupps.P2' },
  { id: 'S', key: 'et.hiccupps.S' },
];

const NOTE_TYPES = ['bug', 'observation', 'question', 'idea'];

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function loadSaved() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persist(data) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function createExploratoryTestingExplorer() {
  const root = document.createElement('div');
  root.dataset.testid = 'et-explorer';

  const saved = loadSaved();
  let state = saved ?? {
    charter: '',
    timebox: 60,
    sfdipot: [],
    notes: [],
    timerRunning: false,
    timerRemaining: 60 * 60,
    timerEnd: null,
  };
  // always reset timer state (don't persist running state across sessions)
  state.timerRunning = false;
  state.timerEnd = null;
  if (!state.timerRemaining || state.timerRemaining <= 0) {
    state.timerRemaining = (state.timebox || 60) * 60;
  }

  let timerInterval = null;

  function save() {
    persist({
      charter: state.charter,
      timebox: state.timebox,
      sfdipot: state.sfdipot,
      notes: state.notes,
      timerRunning: false,
      timerRemaining: state.timerRemaining,
      timerEnd: null,
    });
  }

  function formatTime(seconds) {
    const m = Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0');
    const s = (Math.max(0, seconds) % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function tickTimer() {
    if (!state.timerRunning) return;
    const now = Date.now();
    state.timerRemaining = Math.max(0, Math.round((state.timerEnd - now) / 1000));
    const display = root.querySelector('[data-testid="et-timer-display"]');
    if (display) display.textContent = formatTime(state.timerRemaining);
    const bar = root.querySelector('[data-testid="et-timer-bar"]');
    if (bar) {
      const total = (state.timebox || 60) * 60;
      bar.style.width = `${(state.timerRemaining / total) * 100}%`;
      bar.className = `et-timer-bar${state.timerRemaining < 60 ? ' et-timer-bar--warn' : ''}`;
    }
    if (state.timerRemaining <= 0) {
      stopTimer();
      const display2 = root.querySelector('[data-testid="et-timer-display"]');
      if (display2) display2.textContent = t('et.timer.done');
    }
  }

  function startTimer() {
    if (state.timerRunning) return;
    if (state.timerRemaining <= 0) state.timerRemaining = (state.timebox || 60) * 60;
    state.timerRunning = true;
    state.timerEnd = Date.now() + state.timerRemaining * 1000;
    const startBtn = root.querySelector('[data-testid="et-timer-start"]');
    const stopBtn = root.querySelector('[data-testid="et-timer-stop"]');
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    timerInterval = setInterval(tickTimer, 500);
  }

  function stopTimer() {
    state.timerRunning = false;
    state.timerEnd = null;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    const startBtn = root.querySelector('[data-testid="et-timer-start"]');
    const stopBtn = root.querySelector('[data-testid="et-timer-stop"]');
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  }

  function resetTimer() {
    stopTimer();
    state.timerRemaining = (state.timebox || 60) * 60;
    const display = root.querySelector('[data-testid="et-timer-display"]');
    if (display) display.textContent = formatTime(state.timerRemaining);
    const bar = root.querySelector('[data-testid="et-timer-bar"]');
    if (bar) { bar.style.width = '100%'; bar.className = 'et-timer-bar'; }
    save();
  }

  function render() {
    const isZh = getLocale() === 'zh';
    const total = (state.timebox || 60) * 60;
    const barPct = (state.timerRemaining / total) * 100;
    const notesByType = (type) => state.notes.filter((n) => n.type === type);

    root.innerHTML = `
      <div class="et-layout">

        <!-- LEFT: Charter + SFDIPOT -->
        <div class="et-left">
          <section class="et-card" data-testid="et-charter-section">
            <h3 class="et-card-title">${t('et.charter.title')}</h3>
            <p class="et-card-hint">${t('et.charter.hint')}</p>
            <textarea
              class="et-charter-input"
              data-testid="et-charter"
              rows="4"
              placeholder="${t('et.charter.placeholder')}"
            >${escapeHtml(state.charter)}</textarea>
          </section>

          <section class="et-card" data-testid="et-sfdipot-section">
            <h3 class="et-card-title">SFDIPOT ${t('et.sfdipot.title')}</h3>
            <p class="et-card-hint">${t('et.sfdipot.hint')}</p>
            <div class="et-sfdipot-list">
              ${SFDIPOT_ITEMS.map((item) => `
                <label class="et-sfdipot-item${state.sfdipot.includes(item.id) ? ' checked' : ''}"
                  data-testid="et-sfdipot-${item.id}">
                  <input type="checkbox" value="${item.id}"
                    ${state.sfdipot.includes(item.id) ? 'checked' : ''}
                    data-sfdipot="${item.id}">
                  <span class="et-sfdipot-letter">${item.id.replace('2','')}</span>
                  <span class="et-sfdipot-desc">
                    <strong>${t(item.key)}</strong>
                    <em>${t(item.descKey)}</em>
                  </span>
                </label>
              `).join('')}
            </div>
          </section>

          <section class="et-card" data-testid="et-hiccupps-section">
            <h3 class="et-card-title">HICCUPPS ${t('et.hiccupps.title')}</h3>
            <div class="et-hiccupps-list">
              ${HICCUPPS_ITEMS.map((item) => `
                <div class="et-hiccupps-item">
                  <span class="et-hiccupps-letter">${item.id.replace('2','')}</span>
                  <span>${t(item.key)}</span>
                </div>
              `).join('')}
            </div>
          </section>
        </div>

        <!-- RIGHT: Timer + Notes -->
        <div class="et-right">
          <section class="et-card et-timer-card" data-testid="et-timer-section">
            <h3 class="et-card-title">${t('et.timer.title')}</h3>
            <div class="et-timebox-row">
              <label for="et-timebox">${t('et.timer.timebox')}</label>
              <input id="et-timebox" type="number" min="1" max="240" value="${state.timebox}"
                class="et-timebox-input" data-testid="et-timebox-input">
              <span>${t('et.timer.minutes')}</span>
            </div>
            <div class="et-timer-track">
              <div class="et-timer-bar${state.timerRemaining < 60 ? ' et-timer-bar--warn' : ''}"
                data-testid="et-timer-bar"
                style="width:${barPct}%"></div>
            </div>
            <div class="et-timer-display" data-testid="et-timer-display">${formatTime(state.timerRemaining)}</div>
            <div class="et-timer-btns">
              <button type="button" class="et-timer-btn et-timer-btn--start"
                data-testid="et-timer-start">${t('et.timer.start')}</button>
              <button type="button" class="et-timer-btn et-timer-btn--stop"
                data-testid="et-timer-stop" disabled>${t('et.timer.stop')}</button>
              <button type="button" class="et-timer-btn et-timer-btn--reset"
                data-testid="et-timer-reset">${t('et.timer.reset')}</button>
            </div>
          </section>

          <section class="et-card" data-testid="et-notes-section">
            <h3 class="et-card-title">${t('et.notes.title')}</h3>
            <div class="et-note-form" data-testid="et-note-form">
              <select class="et-note-type" data-testid="et-note-type">
                ${NOTE_TYPES.map((ty) => `<option value="${ty}">${t(`et.note.${ty}`)}</option>`).join('')}
              </select>
              <input class="et-note-text" data-testid="et-note-text" type="text"
                placeholder="${t('et.note.placeholder')}">
              <button type="button" class="et-note-add-btn" data-testid="et-note-add">
                ${t('et.note.add')}
              </button>
            </div>

            <div class="et-notes-stats">
              ${NOTE_TYPES.map((ty) => `
                <span class="et-stat-chip et-stat-chip--${ty}" data-testid="et-stat-${ty}">
                  ${t(`et.note.${ty}`)}: ${notesByType(ty).length}
                </span>
              `).join('')}
            </div>

            <div class="et-notes-list" data-testid="et-notes-list">
              ${state.notes.length === 0
                ? `<p class="et-notes-empty">${t('et.notes.empty')}</p>`
                : state.notes.map((note, i) => `
                  <div class="et-note-item et-note-item--${note.type}" data-testid="et-note-${i}">
                    <span class="et-note-badge et-note-badge--${note.type}">${t(`et.note.${note.type}`)}</span>
                    <span class="et-note-body">${escapeHtml(note.text)}</span>
                    <span class="et-note-time">${note.time}</span>
                    <button type="button" class="et-note-delete" data-delete="${i}"
                      aria-label="${t('common.delete')}">×</button>
                  </div>
                `).join('')
              }
            </div>

            ${state.notes.length > 0 ? `
              <div class="et-notes-actions">
                <button type="button" class="et-clear-btn" data-testid="et-clear-notes">
                  ${t('et.notes.clear')}
                </button>
                <button type="button" class="et-export-btn" data-testid="et-export-notes">
                  ${t('et.notes.export')}
                </button>
              </div>
            ` : ''}
          </section>
        </div>

      </div>
    `;

    bindEvents();
  }

  function addNote() {
    const typeEl = root.querySelector('[data-testid="et-note-type"]');
    const textEl = root.querySelector('[data-testid="et-note-text"]');
    if (!typeEl || !textEl) return;
    const text = textEl.value.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    state.notes.unshift({ type: typeEl.value, text, time });
    save();
    render();
    // restore focus to text input
    const newText = root.querySelector('[data-testid="et-note-text"]');
    if (newText) newText.focus();
  }

  function exportNotes() {
    const lines = [`# Exploratory Test Session`, `Charter: ${state.charter}`, ''];
    for (const ty of NOTE_TYPES) {
      const items = state.notes.filter((n) => n.type === ty);
      if (items.length) {
        lines.push(`## ${ty.toUpperCase()}`);
        items.forEach((n) => lines.push(`- [${n.time}] ${n.text}`));
        lines.push('');
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'session-notes.md';
    a.click();
  }

  function bindEvents() {
    const charterEl = root.querySelector('[data-testid="et-charter"]');
    if (charterEl) {
      charterEl.addEventListener('input', () => {
        state.charter = charterEl.value;
        save();
      });
    }

    root.querySelectorAll('[data-sfdipot]').forEach((cb) => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          if (!state.sfdipot.includes(cb.value)) state.sfdipot.push(cb.value);
        } else {
          state.sfdipot = state.sfdipot.filter((v) => v !== cb.value);
        }
        const label = cb.closest('label');
        if (label) label.classList.toggle('checked', cb.checked);
        save();
      });
    });

    const timeboxInput = root.querySelector('[data-testid="et-timebox-input"]');
    if (timeboxInput) {
      timeboxInput.addEventListener('change', () => {
        const v = parseInt(timeboxInput.value, 10);
        if (v > 0) {
          state.timebox = v;
          resetTimer();
        }
      });
    }

    const startBtn = root.querySelector('[data-testid="et-timer-start"]');
    const stopBtn  = root.querySelector('[data-testid="et-timer-stop"]');
    const resetBtn = root.querySelector('[data-testid="et-timer-reset"]');
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (stopBtn)  stopBtn.addEventListener('click', stopTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    const addBtn = root.querySelector('[data-testid="et-note-add"]');
    if (addBtn) addBtn.addEventListener('click', addNote);

    const textEl = root.querySelector('[data-testid="et-note-text"]');
    if (textEl) {
      textEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addNote(); }
      });
    }

    root.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.delete, 10);
        state.notes.splice(idx, 1);
        save();
        render();
      });
    });

    const clearBtn = root.querySelector('[data-testid="et-clear-notes"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (window.confirm(t('et.notes.confirm.clear'))) {
          state.notes = [];
          save();
          render();
        }
      });
    }

    const exportBtn = root.querySelector('[data-testid="et-export-notes"]');
    if (exportBtn) exportBtn.addEventListener('click', exportNotes);
  }

  render();
  return root;
}
