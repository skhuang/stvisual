import '@testing-library/jest-dom';
import { setLocale } from './i18n/index.js';

// Existing component tests assume Chinese strings; pin locale for tests.
setLocale('zh');
