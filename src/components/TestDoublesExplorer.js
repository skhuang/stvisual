import { t, getLocale } from '../i18n/index.js';
import { encodeResult } from '../utils/resultExporter.js';

function escapeHtml(v = '') {
  return String(v)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// ---------------------------------------------------------------------------
// Scenario definitions — each has sutCode, doubleCode, testCode, and run()
// run() returns { callLog:[{method, args, result}], assertions:[{desc, passed}] }
// ---------------------------------------------------------------------------

const DOUBLE_TYPES = [
  {
    id: 'dummy',
    color: '#6b7280',
    scenarios: [
      {
        id: 'order',
        run() {
          const callLog = [];
          const dummyLogger = {
            log: () => {},
            warn: () => {},
            error: () => {},
          };
          function createOrder(item, qty, logger) {
            if (qty <= 0) throw new Error('Invalid quantity');
            logger.log(`Creating ${qty}× ${item}`);
            return { id: 1001, item, qty, status: 'pending' };
          }
          const order = createOrder('Book', 2, dummyLogger);
          const assertions = [
            { desc: 'order.item === "Book"',    passed: order.item === 'Book' },
            { desc: 'order.qty === 2',           passed: order.qty === 2 },
            { desc: 'order.status === "pending"', passed: order.status === 'pending' },
          ];
          return { callLog, assertions };
        },
      },
      {
        id: 'validator',
        run() {
          const callLog = [];
          const dummyAudit = { record: () => {} };
          function validateAge(age, audit) {
            const valid = Number.isInteger(age) && age >= 0 && age <= 150;
            if (valid) audit.record('valid', age);
            return valid;
          }
          const assertions = [
            { desc: 'validateAge(25, dummyAudit) === true',  passed: validateAge(25, dummyAudit) === true },
            { desc: 'validateAge(-1, dummyAudit) === false', passed: validateAge(-1, dummyAudit) === false },
            { desc: 'validateAge(200, dummyAudit) === false',passed: validateAge(200, dummyAudit) === false },
          ];
          return { callLog, assertions };
        },
      },
    ],
  },
  {
    id: 'stub',
    color: '#2563eb',
    scenarios: [
      {
        id: 'user-repo',
        run() {
          const callLog = [];
          const stubRepo = {
            findById(id) {
              const result = { id, name: 'Alice', email: 'alice@example.com', role: 'admin' };
              callLog.push({ method: 'findById', args: [id], result });
              return result;
            },
          };
          function getUserProfile(id, repo) {
            const user = repo.findById(id);
            return { displayName: user.name, isAdmin: user.role === 'admin' };
          }
          const profile = getUserProfile(42, stubRepo);
          const assertions = [
            { desc: 'profile.displayName === "Alice"', passed: profile.displayName === 'Alice' },
            { desc: 'profile.isAdmin === true',         passed: profile.isAdmin === true },
            { desc: 'findById called with id 42',       passed: callLog[0]?.args[0] === 42 },
          ];
          return { callLog, assertions };
        },
      },
      {
        id: 'email-service',
        run() {
          const callLog = [];
          const stubEmail = {
            send(to, subject, body) {
              const result = { ok: true, messageId: 'stub-msg-001' };
              callLog.push({ method: 'send', args: [to, subject, body], result });
              return result;
            },
          };
          function registerUser(email, emailSvc) {
            const result = emailSvc.send(email, 'Welcome!', 'Thanks for registering.');
            return { registered: true, emailSent: result.ok };
          }
          const reg = registerUser('bob@example.com', stubEmail);
          const assertions = [
            { desc: 'reg.registered === true',  passed: reg.registered === true },
            { desc: 'reg.emailSent === true',   passed: reg.emailSent === true },
            { desc: 'send() called once',       passed: callLog.length === 1 },
          ];
          return { callLog, assertions };
        },
      },
    ],
  },
  {
    id: 'fake',
    color: '#7c3aed',
    scenarios: [
      {
        id: 'in-memory-repo',
        run() {
          const callLog = [];
          class InMemoryUserRepo {
            constructor() { this._store = new Map(); }
            save(user) {
              this._store.set(user.id, { ...user });
              callLog.push({ method: 'save', args: [user], result: user });
            }
            findById(id) {
              const result = this._store.get(id) ?? null;
              callLog.push({ method: 'findById', args: [id], result });
              return result;
            }
            count() { return this._store.size; }
          }
          const repo = new InMemoryUserRepo();
          function createUser(repo2, data) {
            repo2.save(data);
            return repo2.findById(data.id);
          }
          const user = createUser(repo, { id: 7, name: 'Carol' });
          const assertions = [
            { desc: 'findById returns saved user',   passed: user?.name === 'Carol' },
            { desc: 'repo.count() === 1',            passed: repo.count() === 1 },
            { desc: 'save + findById each called once', passed: callLog.length === 2 },
          ];
          return { callLog, assertions };
        },
      },
      {
        id: 'in-memory-cache',
        run() {
          const callLog = [];
          class InMemoryCache {
            constructor() { this._data = {}; this._ttl = {}; }
            set(key, value, ttlMs = 60000) {
              this._data[key] = value;
              this._ttl[key] = Date.now() + ttlMs;
              callLog.push({ method: 'set', args: [key, value], result: undefined });
            }
            get(key) {
              const expired = Date.now() > (this._ttl[key] ?? 0);
              const result = expired ? null : (this._data[key] ?? null);
              callLog.push({ method: 'get', args: [key], result });
              return result;
            }
          }
          const cache = new InMemoryCache();
          cache.set('user:1', { name: 'Dave' }, 60000);
          const hit  = cache.get('user:1');
          const miss = cache.get('user:99');
          const assertions = [
            { desc: 'cache hit returns user',  passed: hit?.name === 'Dave' },
            { desc: 'cache miss returns null', passed: miss === null },
            { desc: '3 cache operations logged', passed: callLog.length === 3 },
          ];
          return { callLog, assertions };
        },
      },
    ],
  },
  {
    id: 'mock',
    color: '#dc2626',
    scenarios: [
      {
        id: 'email-mock',
        run() {
          const callLog = [];
          // Mock: records calls AND verifies expectations
          const mockEmail = {
            _expectations: [],
            expect(method, args) { this._expectations.push({ method, args }); return this; },
            send(to, subject) {
              callLog.push({ method: 'send', args: [to, subject], result: { ok: true } });
              return { ok: true };
            },
            verify() {
              return this._expectations.every((exp) => {
                const call = callLog.find((c) => c.method === exp.method);
                if (!call) return false;
                return exp.args.every((a, i) => call.args[i] === a);
              });
            },
          };
          mockEmail.expect('send', ['alice@example.com', 'Password Reset']);

          function requestPasswordReset(email, emailSvc) {
            emailSvc.send(email, 'Password Reset');
          }
          requestPasswordReset('alice@example.com', mockEmail);

          const verified = mockEmail.verify();
          const assertions = [
            { desc: 'send() called once',                        passed: callLog.length === 1 },
            { desc: 'send() called with correct email',          passed: callLog[0]?.args[0] === 'alice@example.com' },
            { desc: 'send() called with correct subject',        passed: callLog[0]?.args[1] === 'Password Reset' },
            { desc: 'mock.verify() → all expectations met',      passed: verified },
          ];
          return { callLog, assertions };
        },
      },
      {
        id: 'payment-mock',
        run() {
          const callLog = [];
          const mockPayment = {
            charge(amount, currency, token) {
              callLog.push({ method: 'charge', args: [amount, currency, token], result: { success: true, txId: 'TX99' } });
              return { success: true, txId: 'TX99' };
            },
            verify() {
              const c = callLog[0];
              return c && c.args[0] === 5000 && c.args[1] === 'USD';
            },
          };
          function checkout(cartTotal, currency, token, payment) {
            const result = payment.charge(cartTotal, currency, token);
            return result.success ? 'ok' : 'failed';
          }
          const status = checkout(5000, 'USD', 'tok_test', mockPayment);
          const verified = mockPayment.verify();
          const assertions = [
            { desc: 'checkout returns "ok"',           passed: status === 'ok' },
            { desc: 'charge() called once',            passed: callLog.length === 1 },
            { desc: 'charged 5000 USD',                passed: verified },
            { desc: 'response txId is "TX99"',         passed: callLog[0]?.result?.txId === 'TX99' },
          ];
          return { callLog, assertions };
        },
      },
    ],
  },
  {
    id: 'spy',
    color: '#059669',
    scenarios: [
      {
        id: 'calc-spy',
        run() {
          // Spy wraps the real implementation and records calls
          const realCalc = {
            add: (a, b) => a + b,
            multiply: (a, b) => a * b,
          };
          const callLog = [];
          const spy = new Proxy(realCalc, {
            get(target, prop) {
              const orig = target[prop];
              if (typeof orig !== 'function') return orig;
              return (...args) => {
                const result = orig.apply(target, args);
                callLog.push({ method: prop, args, result });
                return result;
              };
            },
          });

          function computeTotal(items, calc) {
            return items.reduce((acc, item) => calc.add(acc, calc.multiply(item.price, item.qty)), 0);
          }
          const items = [{ price: 10, qty: 3 }, { price: 5, qty: 2 }];
          const total = computeTotal(items, spy);
          const assertions = [
            { desc: 'total === 40 (real math used)',    passed: total === 40 },
            { desc: 'multiply called twice',            passed: callLog.filter((c) => c.method === 'multiply').length === 2 },
            { desc: 'add called twice',                 passed: callLog.filter((c) => c.method === 'add').length === 2 },
            { desc: 'first multiply: 10 × 3 = 30',     passed: callLog.find((c) => c.method === 'multiply' && c.args[0] === 10)?.result === 30 },
          ];
          return { callLog, assertions };
        },
      },
      {
        id: 'logger-spy',
        run() {
          const callLog = [];
          const realLogger = {
            log: (msg) => `[LOG] ${msg}`,
            warn: (msg) => `[WARN] ${msg}`,
          };
          const spyLogger = new Proxy(realLogger, {
            get(target, prop) {
              const orig = target[prop];
              if (typeof orig !== 'function') return orig;
              return (...args) => {
                const result = orig.apply(target, args);
                callLog.push({ method: prop, args, result });
                return result;
              };
            },
          });

          function processRequest(id, logger) {
            logger.log(`Processing ${id}`);
            if (id < 0) { logger.warn(`Invalid id: ${id}`); return null; }
            return { id };
          }
          processRequest(5, spyLogger);
          processRequest(-1, spyLogger);

          const assertions = [
            { desc: 'log() called twice total',                passed: callLog.filter((c) => c.method === 'log').length === 2 },
            { desc: 'warn() called once (for id -1)',          passed: callLog.filter((c) => c.method === 'warn').length === 1 },
            { desc: 'real logger still produced output',       passed: callLog[0]?.result === '[LOG] Processing 5' },
            { desc: 'warn recorded correct message',           passed: callLog[2]?.result === '[WARN] Invalid id: -1' },
          ];
          return { callLog, assertions };
        },
      },
    ],
  },
];

// Code snippets for each scenario (display only)
const SCENARIO_CODE = {
  'dummy/order': {
    sutCode: `function createOrder(item, qty, logger) {
  if (qty <= 0) throw new Error('Invalid quantity');
  logger.log(\`Creating \${qty}× \${item}\`);
  return { id: 1001, item, qty, status: 'pending' };
}`,
    doubleCode: `// Dummy — satisfies interface, never asserted
const dummyLogger = {
  log:   () => {},
  warn:  () => {},
  error: () => {},
};`,
    testCode: `const order = createOrder('Book', 2, dummyLogger);
assert(order.item === 'Book');
assert(order.qty === 2);
assert(order.status === 'pending');`,
  },
  'dummy/validator': {
    sutCode: `function validateAge(age, audit) {
  const valid = Number.isInteger(age)
             && age >= 0 && age <= 150;
  if (valid) audit.record('valid', age);
  return valid;
}`,
    doubleCode: `// Dummy — audit is required by SUT but irrelevant here
const dummyAudit = { record: () => {} };`,
    testCode: `assert(validateAge(25,  dummyAudit) === true);
assert(validateAge(-1,  dummyAudit) === false);
assert(validateAge(200, dummyAudit) === false);`,
  },
  'stub/user-repo': {
    sutCode: `function getUserProfile(id, repo) {
  const user = repo.findById(id);
  return {
    displayName: user.name,
    isAdmin: user.role === 'admin',
  };
}`,
    doubleCode: `// Stub — returns canned response, no real DB
const stubRepo = {
  findById(id) {
    return { id, name: 'Alice',
             email: 'alice@example.com',
             role: 'admin' };
  },
};`,
    testCode: `const profile = getUserProfile(42, stubRepo);
assert(profile.displayName === 'Alice');
assert(profile.isAdmin === true);`,
  },
  'stub/email-service': {
    sutCode: `function registerUser(email, emailSvc) {
  const result = emailSvc.send(
    email, 'Welcome!', 'Thanks for registering.');
  return { registered: true, emailSent: result.ok };
}`,
    doubleCode: `// Stub — always returns {ok: true}, no real email sent
const stubEmail = {
  send(to, subject, body) {
    return { ok: true, messageId: 'stub-msg-001' };
  },
};`,
    testCode: `const reg = registerUser('bob@example.com', stubEmail);
assert(reg.registered === true);
assert(reg.emailSent === true);`,
  },
  'fake/in-memory-repo': {
    sutCode: `function createUser(repo, data) {
  repo.save(data);
  return repo.findById(data.id);
}`,
    doubleCode: `// Fake — real logic, but no database
class InMemoryUserRepo {
  constructor() { this._store = new Map(); }
  save(user)      { this._store.set(user.id, { ...user }); }
  findById(id)    { return this._store.get(id) ?? null; }
  count()         { return this._store.size; }
}
const repo = new InMemoryUserRepo();`,
    testCode: `const user = createUser(repo, { id: 7, name: 'Carol' });
assert(user.name === 'Carol');
assert(repo.count() === 1);`,
  },
  'fake/in-memory-cache': {
    sutCode: `// Cache consumer (simplified)
cache.set('user:1', { name: 'Dave' }, 60_000);
const hit  = cache.get('user:1');
const miss = cache.get('user:99');`,
    doubleCode: `// Fake — real TTL eviction logic, no Redis
class InMemoryCache {
  constructor() { this._data = {}; this._ttl = {}; }
  set(key, value, ttlMs = 60000) {
    this._data[key] = value;
    this._ttl[key]  = Date.now() + ttlMs;
  }
  get(key) {
    if (Date.now() > (this._ttl[key] ?? 0)) return null;
    return this._data[key] ?? null;
  }
}
const cache = new InMemoryCache();`,
    testCode: `assert(hit?.name === 'Dave');   // cache hit
assert(miss === null);           // cache miss`,
  },
  'mock/email-mock': {
    sutCode: `function requestPasswordReset(email, emailSvc) {
  emailSvc.send(email, 'Password Reset');
}`,
    doubleCode: `// Mock — pre-set expectations, verify after
const mockEmail = {
  _expectations: [],
  expect(method, args) {
    this._expectations.push({ method, args });
    return this;
  },
  send(to, subject) { return { ok: true }; },
  verify() {
    return this._expectations.every(exp => {
      const call = calls.find(c => c.method === exp.method);
      return call && exp.args.every((a, i) => call.args[i] === a);
    });
  },
};
mockEmail.expect('send', ['alice@example.com', 'Password Reset']);`,
    testCode: `requestPasswordReset('alice@example.com', mockEmail);

// Verify expectations AFTER execution
assert(mockEmail.verify());`,
  },
  'mock/payment-mock': {
    sutCode: `function checkout(amount, currency, token, payment) {
  const result = payment.charge(amount, currency, token);
  return result.success ? 'ok' : 'failed';
}`,
    doubleCode: `// Mock — verifies correct charge amount + currency
const mockPayment = {
  charge(amount, currency, token) {
    return { success: true, txId: 'TX99' };
  },
  verify() {
    const c = calls[0];
    return c && c.args[0] === 5000 && c.args[1] === 'USD';
  },
};`,
    testCode: `const status = checkout(5000, 'USD', 'tok_test', mockPayment);
assert(status === 'ok');
assert(mockPayment.verify()); // charge(5000, 'USD', ...)`,
  },
  'spy/calc-spy': {
    sutCode: `function computeTotal(items, calc) {
  return items.reduce((acc, item) =>
    calc.add(acc, calc.multiply(item.price, item.qty)),
  0);
}`,
    doubleCode: `// Spy — wraps REAL calculator, records all calls
const realCalc = {
  add:      (a, b) => a + b,
  multiply: (a, b) => a * b,
};
const spy = new Proxy(realCalc, {
  get(target, prop) {
    const orig = target[prop];
    if (typeof orig !== 'function') return orig;
    return (...args) => {
      const result = orig.apply(target, args);
      callLog.push({ method: prop, args, result });
      return result;
    };
  },
});`,
    testCode: `const items = [{ price: 10, qty: 3 }, { price: 5, qty: 2 }];
const total = computeTotal(items, spy);
assert(total === 40);          // real math!
assert(callLog.filter(c => c.method === 'multiply').length === 2);`,
  },
  'spy/logger-spy': {
    sutCode: `function processRequest(id, logger) {
  logger.log(\`Processing \${id}\`);
  if (id < 0) {
    logger.warn(\`Invalid id: \${id}\`);
    return null;
  }
  return { id };
}`,
    doubleCode: `// Spy — wraps REAL logger, records all calls
const realLogger = {
  log:  (msg) => \`[LOG] \${msg}\`,
  warn: (msg) => \`[WARN] \${msg}\`,
};
const spyLogger = new Proxy(realLogger, {
  get(target, prop) { /* wrap & record */ }
});`,
    testCode: `processRequest(5,  spyLogger);   // normal
processRequest(-1, spyLogger);   // triggers warn
assert(callLog.filter(c => c.method === 'log').length  === 2);
assert(callLog.filter(c => c.method === 'warn').length === 1);`,
  },
};

// ---------------------------------------------------------------------------
// Quiz scenarios — ask user to pick the right double type
// ---------------------------------------------------------------------------

const TD_QUIZ_SCENARIOS = [
  {
    id: 'qs1',
    correct: 'stub',
    descEn: 'Your SUT calls a remote weather API to get current temperature. You want to test the SUT with a fixed return value without hitting the network.',
    descZh: '您的 SUT 呼叫遠端天氣 API 取得目前溫度。您想在不連網的情況下，以固定回傳值測試 SUT。',
  },
  {
    id: 'qs2',
    correct: 'mock',
    descEn: 'You want to verify that when a user is deleted, an audit log service is called exactly once with the correct user ID.',
    descZh: '您要驗證當使用者被刪除時，稽核日誌服務必須被呼叫恰好一次，且帶有正確的使用者 ID。',
  },
  {
    id: 'qs3',
    correct: 'fake',
    descEn: 'Your SUT requires a database-backed user repository. You want a full working implementation that avoids hitting a real database during unit tests.',
    descZh: '您的 SUT 需要資料庫支持的使用者儲存庫。您需要一個功能完整、但不連接真實資料庫的替代實作。',
  },
  {
    id: 'qs4',
    correct: 'spy',
    descEn: 'You want to use the real email service implementation in your test, but also record every call so you can assert on call counts afterward.',
    descZh: '您想在測試中使用真正的 Email 服務實作，同時記錄每次呼叫，以便事後斷言呼叫次數。',
  },
  {
    id: 'qs5',
    correct: 'dummy',
    descEn: 'Your SUT requires a logger object in its constructor but never actually calls it during the code path you are testing.',
    descZh: '您的 SUT 建構式需要一個 logger 物件，但在您測試的程式路徑中從不呼叫它。',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function createTestDoublesExplorer() {
  const root = document.createElement('div');
  root.dataset.testid = 'td-explorer';

  let state = {
    typeId: 'dummy',
    scenarioId: 'order',
    result: null,
  };

  let tdQuizScenarioIdx = 0;
  const tdQuiz = { active: false, phase: 'question', selected: '', result: null };

  function renderTdQuizPanel() {
    if (!tdQuiz.active) return '';
    const isZh = getLocale() === 'zh';
    const qs = TD_QUIZ_SCENARIOS[tdQuizScenarioIdx];
    const desc = isZh ? qs.descZh : qs.descEn;

    if (tdQuiz.phase === 'graded') {
      const ok = tdQuiz.selected === qs.correct;
      const shareEncoded = encodeResult({ v: 1, explorer: 'td', explorerLabel: t('quiz.td.title'), mode: 'quiz', ts: Date.now(), lang: getLocale(), score: ok ? 1 : 0, total: 1, items: [{ q: desc, a: tdQuiz.selected, expected: qs.correct, ok }] });
      return `
        <div class="quiz-panel" data-testid="td-quiz-panel">
          <div class="quiz-header">
            <span>${t('quiz.td.title')}</span>
            <button type="button" class="quiz-close-btn" data-testid="td-quiz-close">✕</button>
          </div>
          <p class="quiz-prompt">${escapeHtml(desc)}</p>
          <p class="quiz-score ${ok ? 'quiz-score--perfect' : 'quiz-score--wrong'}">
            ${ok ? t('quiz.graph.perfect') : ''}
            ${t('quiz.td.answer', { correct: qs.correct })}
          </p>
          <button type="button" class="quiz-share-btn" data-share-payload="${shareEncoded}" data-testid="td-quiz-share">📋 ${t('quiz.share.btn')}</button>
          <button type="button" class="quiz-start-btn" data-testid="td-quiz-reset">${t('quiz.retry')}</button>
        </div>
      `;
    }

    const typeButtons = DOUBLE_TYPES.map((d) => `
      <button type="button"
        class="td-type-btn${tdQuiz.selected === d.id ? ' active' : ''}"
        data-testid="td-quiz-choice-${d.id}"
        data-quiz-choice="${d.id}"
        style="--td-color:${d.color}"
      >
        <span class="td-type-dot"></span>
        <span class="td-type-name">${t(`td.type.${d.id}`)}</span>
      </button>
    `).join('');

    return `
      <div class="quiz-panel" data-testid="td-quiz-panel">
        <div class="quiz-header">
          <span>${t('quiz.td.title')}</span>
          <button type="button" class="quiz-close-btn" data-testid="td-quiz-close">✕</button>
        </div>
        <p class="quiz-prompt">${escapeHtml(desc)}</p>
        <div class="td-type-list" style="margin:0.5rem 0">${typeButtons}</div>
        <button type="button" class="quiz-start-btn" data-testid="td-quiz-check" ${!tdQuiz.selected ? 'disabled' : ''}>${t('quiz.check')}</button>
      </div>
    `;
  }

  function getType() {
    return DOUBLE_TYPES.find((d) => d.id === state.typeId) ?? DOUBLE_TYPES[0];
  }

  function getScenario() {
    const ty = getType();
    return ty.scenarios.find((s) => s.id === state.scenarioId) ?? ty.scenarios[0];
  }

  function getCode() {
    return SCENARIO_CODE[`${state.typeId}/${state.scenarioId}`] ?? {};
  }

  function formatArg(v) {
    if (v === null || v === undefined) return String(v);
    if (typeof v === 'object') return JSON.stringify(v);
    if (typeof v === 'string') return `"${v}"`;
    return String(v);
  }

  function renderResult(result) {
    if (!result) return '';
    const passing = result.assertions.filter((a) => a.passed).length;
    const total   = result.assertions.length;
    const allPass = passing === total;

    const callRows = result.callLog.map((c, i) => `
      <tr data-testid="td-call-${i}">
        <td><code class="td-code">${escapeHtml(c.method)}()</code></td>
        <td><code class="td-code">${escapeHtml(c.args.map(formatArg).join(', '))}</code></td>
        <td><code class="td-code">${escapeHtml(formatArg(c.result))}</code></td>
      </tr>
    `).join('');

    const assertRows = result.assertions.map((a, i) => `
      <tr data-testid="td-assert-${i}" class="${a.passed ? 'td-assert--pass' : 'td-assert--fail'}">
        <td class="td-holds">${a.passed ? '✓' : '✗'}</td>
        <td>${escapeHtml(a.desc)}</td>
      </tr>
    `).join('');

    return `
      <div class="td-result-header">
        <span class="td-result-badge td-result-badge--${allPass ? 'pass' : 'fail'}">
          ${allPass ? t('td.result.pass') : t('td.result.fail')} — ${passing}/${total} ${t('td.result.assertions')}
        </span>
      </div>

      ${result.callLog.length ? `
        <h4 class="td-result-subtitle">${t('td.result.calllog')}</h4>
        <div class="td-table-wrap">
          <table class="td-table" data-testid="td-call-log">
            <thead>
              <tr><th>${t('td.col.method')}</th><th>${t('td.col.args')}</th><th>${t('td.col.return')}</th></tr>
            </thead>
            <tbody>${callRows}</tbody>
          </table>
        </div>
      ` : `<p class="td-no-calls">${t('td.result.nocalls')}</p>`}

      <h4 class="td-result-subtitle">${t('td.result.assertions')}</h4>
      <div class="td-table-wrap">
        <table class="td-table" data-testid="td-assert-table">
          <thead>
            <tr><th>${t('td.col.status')}</th><th>${t('td.col.assertion')}</th></tr>
          </thead>
          <tbody>${assertRows}</tbody>
        </table>
      </div>
    `;
  }

  function render() {
    const isZh = getLocale() === 'zh';
    const ty   = getType();
    const code = getCode();
    const scen = getScenario();

    root.innerHTML = `
      <div class="td-layout">
        <!-- Sidebar: double types -->
        <div class="td-sidebar">
          <h3 class="td-sidebar-title">${t('td.types.title')}</h3>
          <div class="td-type-list" data-testid="td-types">
            ${DOUBLE_TYPES.map((d) => `
              <button type="button"
                class="td-type-btn${d.id === state.typeId ? ' active' : ''}"
                data-testid="td-type-${d.id}"
                data-type="${d.id}"
                style="--td-color:${d.color}"
              >
                <span class="td-type-dot"></span>
                <span class="td-type-name">${t(`td.type.${d.id}`)}</span>
              </button>
            `).join('')}
          </div>

          <div class="td-type-info" data-testid="td-type-info">
            <p class="td-type-def">${t(`td.def.${state.typeId}`)}</p>
            <p class="td-type-when"><strong>${t('td.whenToUse')}</strong> ${t(`td.when.${state.typeId}`)}</p>
          </div>

          <div class="td-comparison">
            <h4 class="td-comparison-title">${t('td.comparison.title')}</h4>
            ${DOUBLE_TYPES.map((d) => `
              <div class="td-comparison-row${d.id === state.typeId ? ' active' : ''}">
                <span class="td-comparison-dot" style="background:${d.color}"></span>
                <span class="td-comparison-name">${t(`td.type.${d.id}`)}</span>
                <span class="td-comparison-trait">${t(`td.trait.${d.id}`)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Main: scenario + code + runner -->
        <div class="td-main">
          <!-- Scenario selector -->
          <div class="td-scenario-bar" data-testid="td-scenarios">
            <span class="td-scenario-label">${t('td.scenarios.label')}</span>
            ${ty.scenarios.map((s) => `
              <button type="button"
                class="td-scenario-btn${s.id === state.scenarioId ? ' active' : ''}"
                data-testid="td-scenario-${s.id}"
                data-scenario="${s.id}"
              >${t(`td.scenario.${state.typeId}.${s.id}`)}</button>
            `).join('')}
          </div>

          <!-- Code panels -->
          <div class="td-code-grid" data-testid="td-code-grid">
            <div class="td-code-panel">
              <div class="td-code-header td-code-header--sut">${t('td.code.sut')}</div>
              <pre class="td-pre"><code>${escapeHtml(code.sutCode ?? '')}</code></pre>
            </div>
            <div class="td-code-panel">
              <div class="td-code-header td-code-header--double">${t(`td.type.${state.typeId}`)}</div>
              <pre class="td-pre"><code>${escapeHtml(code.doubleCode ?? '')}</code></pre>
            </div>
            <div class="td-code-panel">
              <div class="td-code-header td-code-header--test">${t('td.code.test')}</div>
              <pre class="td-pre"><code>${escapeHtml(code.testCode ?? '')}</code></pre>
            </div>
          </div>

          <!-- Run button -->
          <div class="td-run-row">
            <button type="button" class="td-run-btn" data-testid="td-run">
              ▶ ${t('td.run')}
            </button>
            ${!tdQuiz.active ? `<button type="button" class="quiz-start-btn" data-testid="td-quiz-start">${t('quiz.start')}</button>` : ''}
          </div>

          ${renderTdQuizPanel()}

          <!-- Results -->
          <div class="td-result-panel" data-testid="td-result">
            ${state.result ? renderResult(state.result) : `<p class="td-hint">${t('td.hint')}</p>`}
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    root.querySelectorAll('[data-type]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.typeId = btn.dataset.type;
        const ty = getType();
        state.scenarioId = ty.scenarios[0].id;
        state.result = null;
        render();
      });
    });

    root.querySelectorAll('[data-scenario]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.scenarioId = btn.dataset.scenario;
        state.result = null;
        render();
      });
    });

    const runBtn = root.querySelector('[data-testid="td-run"]');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        try {
          state.result = getScenario().run();
        } catch (e) {
          state.result = {
            callLog: [],
            assertions: [{ desc: `Error: ${e.message}`, passed: false }],
          };
        }
        const panel = root.querySelector('[data-testid="td-result"]');
        if (panel) panel.innerHTML = renderResult(state.result);
      });
    }

    const tqStart = root.querySelector('[data-testid="td-quiz-start"]');
    if (tqStart) {
      tqStart.addEventListener('click', () => {
        tdQuizScenarioIdx = Math.floor(Math.random() * TD_QUIZ_SCENARIOS.length);
        tdQuiz.active = true;
        tdQuiz.phase = 'question';
        tdQuiz.selected = '';
        tdQuiz.result = null;
        render();
      });
    }
    const tqClose = root.querySelector('[data-testid="td-quiz-close"]');
    if (tqClose) {
      tqClose.addEventListener('click', () => { tdQuiz.active = false; render(); });
    }
    root.querySelectorAll('[data-quiz-choice]').forEach((btn) => {
      btn.addEventListener('click', () => {
        tdQuiz.selected = btn.dataset.quizChoice;
        const panel = root.querySelector('[data-testid="td-quiz-panel"]');
        if (panel) {
          root.querySelectorAll('[data-quiz-choice]').forEach((b) => b.classList.toggle('active', b.dataset.quizChoice === tdQuiz.selected));
          const checkBtn = root.querySelector('[data-testid="td-quiz-check"]');
          if (checkBtn) checkBtn.disabled = false;
        }
      });
    });
    const tqCheck = root.querySelector('[data-testid="td-quiz-check"]');
    if (tqCheck) {
      tqCheck.addEventListener('click', () => {
        tdQuiz.phase = 'graded';
        render();
      });
    }
    const tqReset = root.querySelector('[data-testid="td-quiz-reset"]');
    if (tqReset) {
      tqReset.addEventListener('click', () => {
        tdQuizScenarioIdx = (tdQuizScenarioIdx + 1) % TD_QUIZ_SCENARIOS.length;
        tdQuiz.phase = 'question';
        tdQuiz.selected = '';
        tdQuiz.result = null;
        render();
      });
    }
  }

  render();
  return root;
}
