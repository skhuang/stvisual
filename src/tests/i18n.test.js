import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getLocale, setLocale, t } from '../i18n/index.js';

describe('i18n document side-effects', () => {
  let initialLocale;

  beforeEach(() => {
    initialLocale = getLocale();
    document.title = 'PLACEHOLDER';
  });

  afterEach(() => {
    setLocale(initialLocale);
  });

  it('setLocale("en") updates <html lang> to "en"', () => {
    setLocale('zh'); // start from zh
    setLocale('en');
    expect(document.documentElement.getAttribute('lang')).toBe('en');
  });

  it('setLocale("zh") updates <html lang> to "zh-TW"', () => {
    setLocale('en');
    setLocale('zh');
    expect(document.documentElement.getAttribute('lang')).toBe('zh-TW');
  });

  it('setLocale("en") updates document.title to the English app.title', () => {
    setLocale('zh');
    setLocale('en');
    expect(document.title).toBe(t('app.title'));
    expect(document.title).toBe('Software Testing Methods Visualization');
  });

  it('setLocale("zh") updates document.title to the Chinese app.title', () => {
    setLocale('en');
    setLocale('zh');
    expect(document.title).toBe(t('app.title'));
    expect(document.title).toBe('軟體測試方法視覺化');
  });
});
