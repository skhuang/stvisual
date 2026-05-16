// Lightweight i18n for stvisual. Default locale = 'en'.
// Persists choice in localStorage; broadcasts change via window event.
import { messages } from './dict.js';

const STORAGE_KEY = 'stvisual.locale';
const DEFAULT_LOCALE = 'en';
const SUPPORTED = ['en', 'zh'];

let current = (() => {
  try {
    const saved = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch {}
  const browserLocale = globalThis.navigator?.language || '';
  if (browserLocale.toLowerCase().startsWith('zh')) return 'zh';
  return DEFAULT_LOCALE;
})();

const listeners = new Set();

export function getLocale() {
  return current;
}

export function getSupportedLocales() {
  return [...SUPPORTED];
}

export function setLocale(locale, { persist = true } = {}) {
  if (!SUPPORTED.includes(locale) || locale === current) return;
  current = locale;
  if (persist) {
    try { globalThis.localStorage?.setItem(STORAGE_KEY, locale); } catch {}
  }
  listeners.forEach((cb) => {
    try { cb(locale); } catch (err) { console.error(err); }
  });
  applyDocumentLocale();
}

export function onLocaleChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Flat-key lookup with {placeholder} interpolation.
export function t(key, params) {
  const table = messages[current] || messages[DEFAULT_LOCALE];
  let value = table[key];
  if (value === undefined) {
    value = messages[DEFAULT_LOCALE][key];
  }
  if (value === undefined) {
    return key;
  }
  if (params) {
    return String(value).replace(/\{(\w+)\}/g, (m, name) => (
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : m
    ));
  }
  return value;
}

// Pick the right text from a `{en, zh}` localized object (used for data tables).
export function tx(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value[current] ?? value[DEFAULT_LOCALE] ?? value.en ?? value.zh ?? '';
  }
  return String(value);
}

// Read `item[base]` (zh canonical) or `item[base+'En']` based on current locale.
// e.g. pickField(method, 'name') → method.nameEn (en) or method.name (zh).
export function pickField(item, base) {
  if (!item) return '';
  if (current === 'en') {
    return item[base + 'En'] ?? item[base] ?? '';
  }
  return item[base] ?? item[base + 'En'] ?? '';
}

// Sync <html lang> and <title> with the current locale.
function applyDocumentLocale() {
  if (typeof document === 'undefined') return;
  document.documentElement?.setAttribute('lang', current === 'zh' ? 'zh-TW' : 'en');
  const title = t('app.title');
  if (title && title !== 'app.title') {
    document.title = title;
  }
}

applyDocumentLocale();
