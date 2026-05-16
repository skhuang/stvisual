import '@testing-library/jest-dom';
import { setLocale } from './i18n/index.js';

// Node v25 ships a built-in `localStorage` that shadows jsdom's implementation
// but exposes no Storage methods. Replace it with a real in-memory Storage so
// tests that call globalThis.localStorage.setItem/getItem work correctly.
if (typeof globalThis.localStorage?.setItem !== 'function') {
  const store = new Map();
  globalThis.localStorage = {
    setItem: (k, v) => store.set(String(k), String(v)),
    getItem: (k) => store.has(String(k)) ? store.get(String(k)) : null,
    removeItem: (k) => store.delete(String(k)),
    clear: () => store.clear(),
    key: (n) => [...store.keys()][n] ?? null,
    get length() { return store.size; },
  };
}

// Existing component tests assume Chinese strings; pin locale for tests.
setLocale('zh');
