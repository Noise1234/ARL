import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

import { runUnicodeTests } from './unicode.test.js';
import { runSrsTests } from './srs.test.js';
import { runDatasetTests } from './dataset.test.js';
import { runUpgradeTests } from './upgrade.test.js';
import { runViewTests } from './views.test.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('   RUNNING ARL v2.0 FULL TEST & AUDIT SUITE       ');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

async function it(name, fn) {
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      await res;
    }
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

async function main() {
  // 1. Unicode & Text Hygiene
  await runUnicodeTests(it);

  // 2. Pure SRS SM-2 Engine
  await runSrsTests(it);

  // 3. Multilingual Datasets (DE & EN A1-B2, Grammar, Redemittel, Immersion, i18n)
  runDatasetTests(it);

  // 4. B1 German Core Dataset Integrity (Preserving 1,000 items)
  console.log('\n--- Testing B1 German Core Dataset Integrity (1,000 verified items) ---');
  const b1Path = path.join(ROOT, 'data', 'de', 'vocab_b1.json');
  let b1Words = [];

  it('data/de/vocab_b1.json exists, valid JSON, contains exactly 1,000 verified items', () => {
    assert(fs.existsSync(b1Path), 'vocab_b1.json missing');
    b1Words = JSON.parse(fs.readFileSync(b1Path, 'utf-8'));
    assert.strictEqual(b1Words.length, 1000, `Expected 1000 items, got ${b1Words.length}`);
  });

  it('All 1,000 B1 items have unique words (no duplicates)', () => {
    const seen = new Set();
    const dups = [];
    for (const w of b1Words) {
      const key = w.word.trim().toLowerCase();
      if (seen.has(key)) {
        dups.push(key);
      }
      seen.add(key);
    }
    assert.strictEqual(dups.length, 0, `Found duplicates: ${dups.join(', ')}`);
  });

  it('All 1,000 B1 entries have non-empty Mongolian Cyrillic translations and examples', () => {
    const cyrillicRegex = /[А-яЁёӨөҮү]/;
    for (const w of b1Words) {
      assert(w.mn && w.mn.trim().length > 0, `Missing Mongolian for ${w.word}`);
      assert(cyrillicRegex.test(w.mn), `Not Cyrillic for ${w.word}: ${w.mn}`);
      assert(w.example_de && w.example_de.trim().length > 0, `Missing German example for ${w.word}`);
      assert(w.example_mn && w.example_mn.trim().length > 0, `Missing Mongolian example for ${w.word}`);
    }
  });

  // 5. PWA, Icon Branding & Monochrome Theme
  console.log('\n--- Testing PWA Configuration & Geometric Monochrome Icon Assets ---');

  it('manifest.json is valid and configured with black theme & geometric card icon', () => {
    const manifestPath = path.join(ROOT, 'manifest.json');
    assert(fs.existsSync(manifestPath), 'manifest.json missing');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    assert.strictEqual(manifest.short_name, 'ARL');
    assert.strictEqual(manifest.background_color, '#000000');
    assert.strictEqual(manifest.theme_color, '#000000');
    assert.strictEqual(manifest.display, 'standalone');
    assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Expected at least 2 icons in manifest');
  });

  it('Geometric monochrome icon assets exist and adhere to black/white palette', () => {
    const iconSvg = path.join(ROOT, 'icons', 'icon.svg');
    const icon192 = path.join(ROOT, 'icons', 'icon-192.png');
    const icon512 = path.join(ROOT, 'icons', 'icon-512.png');

    assert(fs.existsSync(iconSvg) && fs.statSync(iconSvg).size > 100, 'icon.svg missing or empty');
    assert(fs.existsSync(icon192) && fs.statSync(icon192).size > 500, 'icon-192.png missing or empty');
    assert(fs.existsSync(icon512) && fs.statSync(icon512).size > 1000, 'icon-512.png missing or empty');

    const svgContent = fs.readFileSync(iconSvg, 'utf-8');
    assert(svgContent.includes('fill="#000000"'), 'Icon SVG must have pure black background #000000');
    assert(svgContent.includes('stroke="#FFFFFF"'), 'Icon SVG must have white monochrome stroke');
  });

  it('Service Worker (sw.js) caches all v2.0 shell assets and vocabulary datasets', () => {
    const swPath = path.join(ROOT, 'sw.js');
    assert(fs.existsSync(swPath), 'sw.js missing');
    const swContent = fs.readFileSync(swPath, 'utf-8');
    assert(swContent.includes('data/de/vocab_b1.json'), 'sw.js must cache vocab_b1.json');
    assert(swContent.includes('data/de/grammar.json'), 'sw.js must cache grammar.json');
    assert(swContent.includes('data/i18n.json'), 'sw.js must cache i18n.json');
    assert(swContent.includes('js/srs.js'), 'sw.js must cache srs.js');
    assert(swContent.includes('js/unicode.js'), 'sw.js must cache unicode.js');
  });

  // 6. Backup & State Schema Integrity
  console.log('\n--- Testing Backup & State Schema ---');

  it('Backup export and import schema preserves version, settings and progress', () => {
    const mockBackup = {
      app: 'ARL',
      version: 2,
      exportDate: new Date().toISOString(),
      settings: {
        targetLang: 'de',
        interfaceLang: 'mn',
        cefrLevel: 'b1'
      },
      progress: [
        {
          wordId: 'de_b1_0001',
          reps: 3,
          interval: 15,
          easeFactor: 2.50,
          lapses: 0,
          dueDate: 1770000000000,
          lastStudied: 1769000000000,
          lastGrade: 3
        }
      ]
    };

    const serialized = JSON.stringify(mockBackup);
    const parsed = JSON.parse(serialized);

    assert.strictEqual(parsed.app, 'ARL');
    assert.strictEqual(parsed.version, 2);
    assert.strictEqual(parsed.settings.targetLang, 'de');
    assert.strictEqual(parsed.progress.length, 1);
    assert.strictEqual(parsed.progress[0].reps, 3);
    assert.strictEqual(parsed.progress[0].interval, 15);
  });

  // 7. Bug Hunter Regression Test Cases (Findings 1 to 8)
  console.log('\n--- Testing Bug Hunter Regression Cases (Findings 1 to 8) ---');
  const { state } = await import('../js/state.js');
  const { db } = await import('../js/db.js');
  const { isCardDue } = await import('../js/srs.js');
  const { cleanText, germanEquivMatch } = await import('../js/unicode.js');
  const { GrammarView } = await import('../js/views/grammar.js');

  await it('Finding 1: Rapid key mashing guard prevents race conditions in gradeCurrentCard', async () => {
    // Setup mock cards in state
    state.setCards([
      { id: 'test_c1', word: 'Wort 1', pos: 'noun' },
      { id: 'test_c2', word: 'Wort 2', pos: 'noun' }
    ]);
    state.revealCard();
    assert.strictEqual(state.currentCardIndex, 0);

    // Fire 5 concurrent rapid grade requests simulating key mashing
    const mashing = Promise.all([
      state.gradeCurrentCard(3),
      state.gradeCurrentCard(3),
      state.gradeCurrentCard(3),
      state.gradeCurrentCard(3),
      state.gradeCurrentCard(3)
    ]);
    await mashing;

    // Must have advanced strictly to index 1, not beyond
    assert.strictEqual(state.currentCardIndex, 1);
    assert.strictEqual(state.isCardRevealed, false);
    assert.strictEqual(state.isGrading, false);
  });

  await it('Finding 2: Empty queue state can be replenished via buildStudyQueue', () => {
    state.currentCardIndex = 999;
    assert.strictEqual(state.getCurrentCard(), null);
    state.buildStudyQueue();
    assert.strictEqual(state.currentCardIndex, 0);
    assert(state.studyQueue.length > 0);
  });

  await it('Finding 3: isCardDue defends against string timestamps and ISO strings', () => {
    const now = 1770000000000;
    assert.strictEqual(isCardDue({ dueDate: '1760000000000' }, now), true);
    assert.strictEqual(isCardDue({ dueDate: '1780000000000' }, now), false);
    assert.strictEqual(isCardDue({ dueDate: '2025-01-01T00:00:00.000Z' }, now), true);
    assert.strictEqual(isCardDue({ dueDate: '2030-01-01T00:00:00.000Z' }, now), false);
    assert.strictEqual(isCardDue({ dueDate: 'corrupted' }, now), true);
  });

  await it('Finding 4: Typographic smart quotes, apostrophes and punctuation normalize cleanly', () => {
    assert.strictEqual(cleanText('„schließen“'), '"schließen"');
    assert.strictEqual(cleanText('geht’s'), "geht's");
    assert.strictEqual(germanEquivMatch('„schließen“', 'schließen'), true);
    assert.strictEqual(germanEquivMatch('geht’s', "geht's"), true);
    assert.strictEqual(germanEquivMatch('Schließen.', 'schliessen'), true);
  });

  await it('Finding 5 & 6: GrammarView guards Redemittel collisions and resets index on folder switch', () => {
    const mockContainer = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
    const gView = new GrammarView(mockContainer, () => {});
    gView.folders = [
      { folder_id: 'f1', topics: [{ title: 'T1' }, { title: 'T2' }] },
      { folder_id: 'f2', topics: [{ title: 'T3' }] }
    ];

    // Select topic 1 in folder 0
    gView.selectedTopicIdx = 1;
    assert.strictEqual(gView.selectedTopicIdx, 1);

    // Switch to folder 1 (only 1 item): must reset selectedTopicIdx to 0
    gView.setFolderIndex(1);
    assert.strictEqual(gView.selectedTopicIdx, 0);

    // Activate Redemittel
    gView.isRedemittelActive = true;
    gView.selectedTopicIdx = 0;
    // openSelectedTopic, nextTopic, prevTopic must be no-ops when Redemittel is active
    gView.nextTopic();
    assert.strictEqual(gView.selectedTopicIdx, 0);
    gView.openSelectedTopic();
    assert.strictEqual(gView.activeTopic, null);
  });

  await it('Finding 7: state.stopAudio safely executes without error', () => {
    assert.doesNotThrow(() => {
      state.stopAudio();
    });
  });

  await it('Finding 8: Persistence layer falls back gracefully when IndexedDB is unavailable', async () => {
    // When indexedDB is null/unavailable, db operations must return valid arrays/null without throwing
    const allProg = await db.getAllProgress();
    assert(Array.isArray(allProg));
    const p = await db.getProgress('non_existent');
    assert.strictEqual(p, null);
  });

  // 7. System Upgrade Suite (Gamification, 3-Stage Hints, Grammar Sandbox, Gemini Client)
  await runUpgradeTests(it);

  // 8. View Component Mounting & Structural Integrity
  await runViewTests(it);

  console.log('\n----------------------------------------------------');
  console.log(`TEST RESULTS: ${passedTests} passed, ${failedTests} failed.`);
  console.log('----------------------------------------------------\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test runner encountered an unhandled exception:', err);
  process.exit(1);
});
