/**
 * ARL - Pure Unicode & Text Hygiene Utilities
 * Strictly enforces NFC normalization, whitespace trimming, German ß/ss equivalence,
 * and robust Cyrillic (ө, ү, ё) processing.
 */

/**
 * Normalizes a string to Unicode NFC and trims outer whitespace.
 * Safely handles null, undefined, and non-string inputs.
 * @param {string} str
 * @returns {string}
 */
export function normalizeNFC(str) {
  if (str === null || str === undefined) return '';
  return String(str).normalize('NFC').trim();
}

/**
 * Normalizes text to NFC, replaces non-breaking or consecutive whitespace with a single space,
 * and normalizes German typographic smart quotes and apostrophes.
 * @param {string} str
 * @returns {string}
 */
export function cleanText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces/BOM
    .replace(/[„“”«»]/g, '"')              // normalize typographic double quotes
    .replace(/[‘’‚‛]/g, "'")              // normalize smart single quotes / apostrophes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips outer and trailing punctuation (quotes, periods, commas, question/exclamation marks).
 * @param {string} str
 * @returns {string}
 */
export function stripPunctuation(str) {
  if (!str) return '';
  return str
    .replace(/^["'„“”«»‘’.!?,;:\s]+|["'„“”«»‘’.!?,;:\s]+$/g, '')
    .trim();
}

/**
 * Normalizes German text for case-insensitive equivalence search.
 * Replaces 'ß' with 'ss', converts to lowercase, normalizes smart quotes,
 * and strips outer/trailing punctuation.
 * @param {string} str
 * @returns {string}
 */
export function normalizeGerman(str) {
  const cleaned = cleanText(str)
    .toLowerCase()
    .replace(/ß/g, 'ss');
  return stripPunctuation(cleaned);
}

/**
 * Checks equality between two strings under German orthographic rules (ß == ss),
 * smart quote normalization, trailing punctuation stripping, case-insensitivity, and NFC.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function germanEquivMatch(a, b) {
  return normalizeGerman(a) === normalizeGerman(b);
}

/**
 * Checks if search query is found inside target text with NFC, German ß/ss equivalence,
 * smart quote/apostrophe normalization, and case-insensitivity.
 * @param {string} query
 * @param {string} target
 * @returns {boolean}
 */
export function fuzzySearchMatch(query, target) {
  const normQuery = normalizeGerman(query);
  if (!normQuery) return true;
  const normTarget = cleanText(target)
    .toLowerCase()
    .replace(/ß/g, 'ss');
  return normTarget.includes(normQuery);
}

/**
 * Regular expression matching modern Mongolian Cyrillic characters,
 * explicitly including ө, Ө, ү, Ү, ё, Ё.
 */
export const CYRILLIC_REGEX = /[А-Яа-яЁёӨөҮү]/;

/**
 * Checks whether a string contains any Cyrillic character.
 * @param {string} str
 * @returns {boolean}
 */
export function isCyrillic(str) {
  return CYRILLIC_REGEX.test(normalizeNFC(str));
}

/**
 * Strips diacritics/accents for accent-insensitive search if needed,
 * using NFD decomposition followed by NFC recomposition.
 * Preserves base characters.
 * @param {string} str
 * @returns {string}
 */
export function stripAccents(str) {
  return normalizeNFC(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');
}
