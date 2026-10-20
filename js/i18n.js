/**
 * ARL - Pure Localization (i18n) Engine
 * Provides reactive translation lookup with fallback to English.
 */

import { normalizeNFC } from './unicode.js';

let currentLang = 'mn';
let translations = {};

export const SUPPORTED_LANGS = ['mn', 'en', 'de'];

/**
 * Initializes i18n with translations dataset
 * @param {Object} data Dictionary keyed by language code ('mn', 'en', 'de')
 * @param {string} [initialLang='mn']
 */
export function initI18n(data, initialLang = 'mn') {
  if (data && typeof data === 'object') {
    translations = data;
  }
  if (SUPPORTED_LANGS.includes(initialLang)) {
    currentLang = initialLang;
  }
}

/**
 * Sets current interface language.
 * @param {string} lang 'mn' | 'en' | 'de'
 */
export function setInterfaceLanguage(lang) {
  if (SUPPORTED_LANGS.includes(lang)) {
    currentLang = lang;
  }
}

/**
 * Gets current interface language code.
 * @returns {string}
 */
export function getInterfaceLanguage() {
  return currentLang;
}

/**
 * Cycles to the next interface language: mn -> en -> de -> mn
 * @returns {string} New language code
 */
export function cycleInterfaceLanguage() {
  const idx = SUPPORTED_LANGS.indexOf(currentLang);
  currentLang = SUPPORTED_LANGS[(idx + 1) % SUPPORTED_LANGS.length];
  return currentLang;
}

/**
 * Translates a key for current or specified language.
 * @param {string} key
 * @param {string} [lang] Optional override
 * @returns {string}
 */
export function t(key, lang = currentLang) {
  const dict = translations[lang] || translations['en'] || {};
  if (dict[key] !== undefined) {
    return normalizeNFC(dict[key]);
  }
  // Fallback to English
  const enDict = translations['en'] || {};
  if (enDict[key] !== undefined) {
    return normalizeNFC(enDict[key]);
  }
  return key;
}
