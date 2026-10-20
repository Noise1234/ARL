import assert from 'assert';
import {
  normalizeNFC,
  cleanText,
  normalizeGerman,
  germanEquivMatch,
  fuzzySearchMatch,
  isCyrillic,
  stripAccents
} from '../js/unicode.js';

export async function runUnicodeTests(it) {
  console.log('\n--- Testing js/unicode.js (Unicode & Text Hygiene) ---');

  it('normalizeNFC handles null, undefined, numbers and trims strings', () => {
    assert.strictEqual(normalizeNFC(null), '');
    assert.strictEqual(normalizeNFC(undefined), '');
    assert.strictEqual(normalizeNFC(123), '123');
    assert.strictEqual(normalizeNFC('  hallo  \n'), 'hallo');
  });

  it('normalizeNFC converts decomposed NFD characters to composed NFC', () => {
    const decomposedUmlaut = 'a\u0308'; // a + combining diaeresis
    const composedUmlaut = '\u00e4'; // ä
    assert.notStrictEqual(decomposedUmlaut, composedUmlaut);
    assert.strictEqual(normalizeNFC(decomposedUmlaut), composedUmlaut);

    const decomposedO = 'o\u0308';
    assert.strictEqual(normalizeNFC(decomposedO), 'ö');

    const decomposedU = 'u\u0308';
    assert.strictEqual(normalizeNFC(decomposedU), 'ü');
  });

  it('cleanText collapses extra whitespace, strips zero-width chars, and normalizes smart quotes/apostrophes', () => {
    const dirty = '  Guten   \t  \n Morgen \u200B\uFEFF!  ';
    assert.strictEqual(cleanText(dirty), 'Guten Morgen !');

    // German typographic smart quotes
    assert.strictEqual(cleanText('„Hallo“'), '"Hallo"');
    assert.strictEqual(cleanText('«Auf Wiedersehen»'), '"Auf Wiedersehen"');

    // Smart apostrophes / single quotes
    assert.strictEqual(cleanText('geht’s'), "geht's");
    assert.strictEqual(cleanText('‘Wort’'), "'Wort'");
  });

  it('German ß and ss equivalence matching works in both directions, cases, and strips punctuation', () => {
    assert.strictEqual(germanEquivMatch('schließen', 'schliessen'), true);
    assert.strictEqual(germanEquivMatch('SCHLIEßEN', 'schliessen'), true);
    assert.strictEqual(germanEquivMatch('Straße', 'STRASSE'), true);
    assert.strictEqual(germanEquivMatch('groß', 'gross'), true);
    assert.strictEqual(germanEquivMatch('Fluss', 'Fluß'), true);
    assert.strictEqual(germanEquivMatch('Masse', 'Maße'), true);
    assert.strictEqual(germanEquivMatch('schön', 'schon'), false);

    // Smart quotes and punctuation stripping
    assert.strictEqual(germanEquivMatch('"schließen"', '„schließen“'), true);
    assert.strictEqual(germanEquivMatch('schließen', '„schließen“'), true);
    assert.strictEqual(germanEquivMatch("geht's", 'geht’s'), true);
    assert.strictEqual(germanEquivMatch('Schließen.', 'schliessen'), true);
    assert.strictEqual(germanEquivMatch('schließen!', 'schließen'), true);
  });

  it('fuzzySearchMatch finds German substrings with ß/ss equivalence and NFC', () => {
    assert.strictEqual(fuzzySearchMatch('schliess', 'Er wird das Schloss schließen'), true);
    assert.strictEqual(fuzzySearchMatch('GROSS', 'Ein großer Schritt'), true);
    assert.strictEqual(fuzzySearchMatch('apfel', 'Der rote Apfel'), true);
    assert.strictEqual(fuzzySearchMatch('brot', 'Käsesandwich'), false);
  });

  it('Cyrillic detector correctly identifies Mongolian Cyrillic characters (ө, ү, ё)', () => {
    assert.strictEqual(isCyrillic('өргөдөл'), true);
    assert.strictEqual(isCyrillic('Үгүй'), true);
    assert.strictEqual(isCyrillic('Өдөр бүр'), true);
    assert.strictEqual(isCyrillic('баярлалаа'), true);
    assert.strictEqual(isCyrillic('English only'), false);
    assert.strictEqual(isCyrillic('Deutsch mit Umlauten äöüß'), false);
  });

  it('stripAccents removes combining accents while retaining base characters', () => {
    assert.strictEqual(stripAccents('café'), 'cafe');
    assert.strictEqual(stripAccents('résumé'), 'resume');
  });
}
