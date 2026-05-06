import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 必須在 import 元件之前準備 globalThis.firebase mock，
// 因為 createSyntaxCoverageExplorer() 會在建立時呼叫 createCloudIntegrationClient()。
let authCallback = null;
const saveSpy = vi.fn().mockResolvedValue();
const loadSpy = vi.fn().mockResolvedValue({});

function installFirebaseMock() {
  const fakeApp = {};
  const fakeAuth = {
    onAuthStateChanged: (cb) => {
      authCallback = cb;
      cb(null);
      return () => {};
    },
    signOut: async () => {},
  };
  const fakeFirestore = {
    collection: () => ({
      doc: () => ({
        collection: () => ({
          doc: () => ({
            get: async () => ({ exists: () => false, data: () => ({}) }),
            set: async (data) => {
              // 如果是 syntaxCoverage 的 set，紀錄
              saveSpy(data);
            },
          }),
        }),
        get: async () => ({ exists: () => false, data: () => ({}) }),
        set: async (data) => {
          saveSpy(data);
        },
      }),
    }),
  };

  globalThis.firebase = {
    apps: [fakeApp],
    app: () => fakeApp,
    initializeApp: () => fakeApp,
    auth: () => fakeAuth,
    firestore: Object.assign(() => fakeFirestore, {
      FieldValue: { serverTimestamp: () => 'TS' },
    }),
  };

  // 覆寫 cloudIntegration 中對 syntaxCoverage doc 的呼叫，攔截在更具體的位置
  const realCollection = fakeFirestore.collection;
  fakeFirestore.collection = (name) => ({
    doc: (uid) => ({
      collection: (sub) => ({
        doc: (key) => ({
          get: async () => {
            if (key === 'syntaxCoverage') {
              const result = await loadSpy(uid);
              return {
                exists: () => !!result,
                data: () => ({ programs: result || {} }),
              };
            }
            return { exists: () => false, data: () => ({}) };
          },
          set: async (data) => {
            if (key === 'syntaxCoverage') {
              saveSpy(uid, data);
            }
          },
        }),
      }),
    }),
  });
}

function uninstallFirebaseMock() {
  delete globalThis.firebase;
  authCallback = null;
}

let createSyntaxCoverageExplorer;

beforeEach(async () => {
  saveSpy.mockClear();
  loadSpy.mockClear();
  loadSpy.mockResolvedValue({});
  installFirebaseMock();
  // 重新 import 以避免模組層快取
  vi.resetModules();
  ({ createSyntaxCoverageExplorer } = await import('../components/SyntaxCoverageExplorer.js'));
  globalThis.localStorage?.clear?.();
});

afterEach(() => {
  document.body.innerHTML = '';
  uninstallFirebaseMock();
  vi.useRealTimers();
});

describe('SyntaxCoverageExplorer 雲端同步', () => {
  it('未登入時雲端指示器為 idle 狀態', () => {
    const el = createSyntaxCoverageExplorer();
    document.body.appendChild(el);
    const indicator = el.querySelector('[data-testid="syntax-cloud-indicator"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator.dataset.status).toBe('idle');
  });

  it('登入後新增測試案例會 debounce 後寫入雲端', async () => {
    vi.useFakeTimers();
    const el = createSyntaxCoverageExplorer();
    document.body.appendChild(el);

    // 模擬 auth 觸發登入
    expect(typeof authCallback).toBe('function');
    authCallback({ uid: 'user-123', email: 'tester@example.com' });
    // 等待 loadSyntaxTests 的 microtasks resolve
    await vi.runAllTimersAsync();

    // 點選 ＋ 新增 test 按鈕（會立即呼叫 persistCurrent → pushToCloud）
    const addBtn = el.querySelector('[data-testid="syntax-test-add"]');
    expect(addBtn).toBeInTheDocument();
    addBtn.click();

    // 等待 debounce
    await vi.advanceTimersByTimeAsync(800);
    await vi.runAllTimersAsync();

    expect(saveSpy).toHaveBeenCalled();
    const lastCall = saveSpy.mock.calls.at(-1);
    expect(lastCall[0]).toBe('user-123');
    expect(lastCall[1]).toHaveProperty('programs');
    // 預設範例 max 應在 programs 中，且至少有一個 test
    const programs = lastCall[1].programs;
    expect(programs).toHaveProperty('max');
    expect(Array.isArray(programs.max.tests)).toBe(true);
  });

  it('編輯 expected 欄位後 change 事件會觸發雲端寫入', async () => {
    vi.useFakeTimers();
    const el = createSyntaxCoverageExplorer();
    document.body.appendChild(el);
    authCallback({ uid: 'user-xyz' });
    await vi.runAllTimersAsync();
    saveSpy.mockClear();

    const expectedInput = el.querySelector('[data-test-expected="t1"]');
    expect(expectedInput).toBeInTheDocument();
    expectedInput.value = '999';
    expectedInput.dispatchEvent(new Event('change', { bubbles: true }));

    await vi.advanceTimersByTimeAsync(800);
    await vi.runAllTimersAsync();

    expect(saveSpy).toHaveBeenCalled();
    const programs = saveSpy.mock.calls.at(-1)[1].programs;
    const t1 = programs.max.tests.find((t) => t.id === 't1');
    expect(t1.expectedText).toBe('999');
  });

  it('登入後若雲端有資料會載入並覆蓋本地（顯示 synced 訊息）', async () => {
    vi.useFakeTimers();
    loadSpy.mockResolvedValue({
      max: {
        params: 'a, b',
        body: 'return a;',
        tests: [{ id: 'tCloud', argsText: '1, 2', expectedText: '1' }],
      },
    });

    const el = createSyntaxCoverageExplorer();
    document.body.appendChild(el);
    authCallback({ uid: 'user-cloud', email: 'me@e.com' });
    await vi.runAllTimersAsync();

    // 重新 render 後應該出現 tCloud
    const row = el.querySelector('[data-testid="syntax-test-row-tCloud"]');
    expect(row).toBeInTheDocument();

    const indicator = el.querySelector('[data-testid="syntax-cloud-indicator"]');
    // 載入完成後狀態應為 synced 或 syncing（取決於是否觸發回寫）
    expect(['synced', 'syncing']).toContain(indicator.dataset.status);
  });
});
