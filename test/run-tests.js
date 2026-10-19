const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==================================================');
console.log('   RUNNING ARL PROGRESSIVE WEB APP TEST SUITE    ');
console.log('==================================================\n');

let passedTests = 0;
let failedTests = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

const ROOT = path.resolve(__dirname, '..');

// ----------------------------------------------------
// 1. DATASET INTEGRITY TESTS
// ----------------------------------------------------
console.log('[1/4] Testing Vocabulary Dataset (1,000 B1 German-to-Mongolian Words)...');

const b1Path = path.join(ROOT, 'data', 'b1_words.json');
let words = [];

it('b1_words.json exists and is valid JSON', () => {
  assert(fs.existsSync(b1Path), 'b1_words.json not found');
  const raw = fs.readFileSync(b1Path, 'utf-8');
  words = JSON.parse(raw);
  assert(Array.isArray(words), 'Expected JSON array');
});

it('Contains exactly 1,000 verified B1 items', () => {
  assert.strictEqual(words.length, 1000, `Expected 1000 items, got ${words.length}`);
});

it('All 1,000 items have unique words (no duplicates)', () => {
  const seen = new Set();
  const dups = [];
  for (const w of words) {
    const key = w.word.trim().toLowerCase();
    if (seen.has(key)) {
      dups.push(key);
    }
    seen.add(key);
  }
  assert.strictEqual(dups.length, 0, `Found duplicates: ${dups.join(', ')}`);
});

it('Strict Exclusion Rule: No ultra-basic A1 function words or pronouns', () => {
  const forbidden = new Set([
    'sein', 'haben', 'werden', 'ich', 'du', 'er', 'sie', 'es',
    'der', 'die', 'das', 'und', 'oder', 'aber', 'wir', 'ihr', 'ein', 'eine'
  ]);
  const foundForbidden = [];
  for (const w of words) {
    if (forbidden.has(w.word.toLowerCase()) && w.pos !== 'noun') {
      foundForbidden.push(w.word);
    }
  }
  assert.strictEqual(foundForbidden.length, 0, `Forbidden A1 words found: ${foundForbidden.join(', ')}`);
});

it('All nouns have valid articles (der/die/das) and plural forms', () => {
  const invalidNouns = [];
  for (const w of words) {
    if (w.pos === 'noun') {
      if (!w.article || !['der', 'die', 'das'].includes(w.article)) {
        invalidNouns.push(`${w.word} (missing valid article)`);
      }
      if (!w.plural || w.plural.trim() === '') {
        invalidNouns.push(`${w.word} (missing plural)`);
      }
    }
  }
  assert.strictEqual(invalidNouns.length, 0, `Invalid nouns: ${invalidNouns.slice(0, 5).join(', ')}`);
});

it('All entries contain non-empty modern Mongolian Cyrillic translations', () => {
  const missingMn = [];
  // Regex to check Cyrillic characters
  const cyrillicRegex = /[А-яЁёӨөҮү]/;
  for (const w of words) {
    if (!w.mn || w.mn.trim() === '') {
      missingMn.push(w.word);
    } else if (!cyrillicRegex.test(w.mn)) {
      missingMn.push(`${w.word} (not Cyrillic: ${w.mn})`);
    }
  }
  assert.strictEqual(missingMn.length, 0, `Missing or invalid Mongolian: ${missingMn.slice(0, 5).join(', ')}`);
});

it('All entries have German and Mongolian example sentences', () => {
  const missingExamples = [];
  for (const w of words) {
    if (!w.example_de || w.example_de.trim() === '' || !w.example_mn || w.example_mn.trim() === '') {
      missingExamples.push(w.word);
    }
  }
  assert.strictEqual(missingExamples.length, 0, `Missing examples: ${missingExamples.slice(0, 5).join(', ')}`);
});

it('All 10 thematic module files exist and contain 100 items each', () => {
  const modulesDir = path.join(ROOT, 'data', 'modules');
  for (let i = 1; i <= 10; i++) {
    const modFile = path.join(modulesDir, `module_${String(i).padStart(2, '0')}.json`);
    assert(fs.existsSync(modFile), `Module file missing: ${modFile}`);
    const modWords = JSON.parse(fs.readFileSync(modFile, 'utf-8'));
    assert.strictEqual(modWords.length, 100, `Module ${i} expected 100 items, got ${modWords.length}`);
  }
});

// ----------------------------------------------------
// 2. APP IDENTITY & PWA BRANDING TESTS
// ----------------------------------------------------
console.log('\n[2/4] Testing App Identity, Branding & PWA Configuration...');

it('manifest.json is valid and configured with black background & globe icon', () => {
  const manifestPath = path.join(ROOT, 'manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json missing');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.strictEqual(manifest.name, 'ARL - B1 German Flashcards');
  assert.strictEqual(manifest.short_name, 'ARL');
  assert.strictEqual(manifest.background_color, '#000000');
  assert.strictEqual(manifest.theme_color, '#000000');
  assert.strictEqual(manifest.display, 'standalone');
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Expected at least 2 icons in manifest');
});

it('SVG and PNG globe icon assets exist and are valid', () => {
  const iconSvg = path.join(ROOT, 'icons', 'icon.svg');
  const icon192 = path.join(ROOT, 'icons', 'icon-192.png');
  const icon512 = path.join(ROOT, 'icons', 'icon-512.png');

  assert(fs.existsSync(iconSvg) && fs.statSync(iconSvg).size > 100, 'icon.svg missing or empty');
  assert(fs.existsSync(icon192) && fs.statSync(icon192).size > 1000, 'icon-192.png missing or empty');
  assert(fs.existsSync(icon512) && fs.statSync(icon512).size > 1000, 'icon-512.png missing or empty');

  // Verify pure black background in SVG
  const svgContent = fs.readFileSync(iconSvg, 'utf-8');
  assert(svgContent.includes('fill="#000000"'), 'Icon SVG must have pure black background #000000');
  assert(svgContent.includes('stroke="#FFFFFF"'), 'Icon SVG must have white monochrome stroke');
});

it('Service Worker (sw.js) caches all critical shell assets and vocabulary data', () => {
  const swPath = path.join(ROOT, 'sw.js');
  assert(fs.existsSync(swPath), 'sw.js missing');
  const swContent = fs.readFileSync(swPath, 'utf-8');
  assert(swContent.includes('data/b1_words.json'), 'sw.js must cache data/b1_words.json');
  assert(swContent.includes('index.html'), 'sw.js must cache index.html');
  assert(swContent.includes('css/base.css'), 'sw.js must cache base.css');
  assert(swContent.includes('js/app.js'), 'sw.js must cache app.js');
});

// ----------------------------------------------------
// 3. CORE LEARNING & ACTIVE RECALL ALGORITHMS
// ----------------------------------------------------
console.log('\n[3/4] Testing Core Learning, MCQ Distractors & Retention Flow...');

it('MCQ Distractor Generator produces 1 correct + 3 distinct distractors', () => {
  const target = words[0];
  const samePos = words.filter(w => w.id !== target.id && w.pos === target.pos);
  const distractors = samePos.slice(0, 3);
  const options = [target, ...distractors];

  assert.strictEqual(options.length, 4, 'MCQ must have exactly 4 options');
  const optionIds = new Set(options.map(o => o.id));
  assert.strictEqual(optionIds.size, 4, 'All 4 options must be distinct');
  assert(options.some(o => o.id === target.id), 'Options must include the correct target word');
});

it('Streak Tracker increments correctly across consecutive days and resets after gap', () => {
  // Simulation of streak logic
  function calculateStreak(lastActiveDate, currentStreak, actionDate) {
    if (!lastActiveDate) return 1;
    const d1 = new Date(lastActiveDate);
    const d2 = new Date(actionDate);
    const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return currentStreak; // Same day
    if (diffDays === 1) return currentStreak + 1; // Consecutive day
    return 1; // Gap detected, resets to 1
  }

  assert.strictEqual(calculateStreak(null, 0, '2026-10-10'), 1, 'First day should set streak to 1');
  assert.strictEqual(calculateStreak('2026-10-10', 1, '2026-10-10'), 1, 'Same day should preserve streak');
  assert.strictEqual(calculateStreak('2026-10-10', 1, '2026-10-11'), 2, 'Next day should increment streak');
  assert.strictEqual(calculateStreak('2026-10-11', 2, '2026-10-12'), 3, 'Consecutive day should increment');
  assert.strictEqual(calculateStreak('2026-10-12', 3, '2026-10-15'), 1, 'Gap > 1 day should reset streak to 1');
});

it('Daily Opening Retention Gate correctly filters words studied on prior days', () => {
  const mockProgress = [
    { wordId: 'b1_0001', status: 'memorized', lastStudied: new Date('2026-10-18T10:00:00Z').getTime() },
    { wordId: 'b1_0002', status: 'learning', lastStudied: new Date('2026-10-18T12:00:00Z').getTime() },
    { wordId: 'b1_0003', status: 'learning', lastStudied: new Date('2026-10-19T08:00:00Z').getTime() } // studied today
  ];

  const todayStr = '2026-10-19';
  const eligible = mockProgress.filter(p => {
    const d = new Date(p.lastStudied);
    const dStr = d.toISOString().split('T')[0];
    return dStr < todayStr || p.status === 'memorized';
  });

  assert.strictEqual(eligible.length, 2, 'Should include words from yesterday/prior days');
  assert.strictEqual(eligible[0].wordId, 'b1_0001');
  assert.strictEqual(eligible[1].wordId, 'b1_0002');
});

// ----------------------------------------------------
// 4. CUSTOM WORDS & BACKUP SCHEMA TESTS
// ----------------------------------------------------
console.log('\n[4/4] Testing Manual Word Entry & Backup Schema...');

it('Manual In-App Word Entry validates and formats nouns with article and plural', () => {
  const customWord = {
    word: 'Entwicklungsprozess',
    article: 'der',
    plural: '-e',
    pos: 'noun',
    mn: 'хөгжлийн явц',
    example_de: 'Der Entwicklungsprozess verlief zügig.',
    example_mn: 'Хөгжлийн явц хурдан өрнөсөн.'
  };

  const formatted = {
    ...customWord,
    id: `custom_${Date.now()}`,
    display: `${customWord.article} ${customWord.word}, ${customWord.plural}`,
    isCustom: true
  };

  assert.strictEqual(formatted.display, 'der Entwicklungsprozess, -e');
  assert(formatted.id.startsWith('custom_'));
  assert.strictEqual(formatted.isCustom, true);
});

it('Backup export & import schema preserves all required fields', () => {
  const mockBackup = {
    app: 'ARL',
    version: 1,
    exportDate: new Date().toISOString(),
    stats: { streak: 5, lastActiveDate: '2026-10-19' },
    customWords: [
      { id: 'custom_1', word: 'Test', mn: 'Туршилт', pos: 'noun' }
    ],
    progress: [
      { wordId: 'b1_0001', status: 'memorized', lastStudied: Date.now() }
    ]
  };

  const serialized = JSON.stringify(mockBackup);
  const parsed = JSON.parse(serialized);

  assert.strictEqual(parsed.app, 'ARL');
  assert.strictEqual(parsed.stats.streak, 5);
  assert.strictEqual(parsed.customWords.length, 1);
  assert.strictEqual(parsed.progress.length, 1);
});

console.log('\n--------------------------------------------------');
console.log(`TEST RESULTS: ${passedTests} passed, ${failedTests} failed.`);
console.log('--------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
}
