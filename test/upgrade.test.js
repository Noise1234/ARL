import assert from 'assert';
import {
  safeAddExp,
  getExpNeededForLevel,
  getLevelProgress,
  getStreakMultiplier,
  calculateAwardedExp
} from '../js/gamification.js';
import { getCardHint } from '../js/hints.js';
import { evaluateRuleFallback } from '../js/grammar-fallback.js';
import { GeminiClient } from '../js/gemini.js';

export function runUpgradeTests(it) {
  console.log('\n--- Testing Dopamine EXP & Gamification Engine (js/gamification.js) ---');

  it('safeAddExp handles valid additions, NaN, null, negative, and strings without error', () => {
    assert.strictEqual(safeAddExp(100, 50), 150);
    assert.strictEqual(safeAddExp(0, 25), 25);
    assert.strictEqual(safeAddExp(NaN, 50), 50);
    assert.strictEqual(safeAddExp(null, 50), 50);
    assert.strictEqual(safeAddExp(undefined, 50), 50);
    assert.strictEqual(safeAddExp(100, -20), 100);
    assert.strictEqual(safeAddExp(100, NaN), 100);
    assert.strictEqual(safeAddExp('100', 50), 50);
  });

  it('getLevelProgress accurately computes level progression and progress percentage', () => {
    const p0 = getLevelProgress(0);
    assert.strictEqual(p0.level, 1);
    assert.strictEqual(p0.expInCurrentLevel, 0);
    assert.strictEqual(p0.expNeededForNext, 100);
    assert.strictEqual(p0.progressPct, 0);

    const p50 = getLevelProgress(50);
    assert.strictEqual(p50.level, 1);
    assert.strictEqual(p50.expInCurrentLevel, 50);
    assert.strictEqual(p50.progressPct, 50);

    const p100 = getLevelProgress(100);
    assert.strictEqual(p100.level, 2);
    assert.strictEqual(p100.expInCurrentLevel, 0);
    assert.strictEqual(p100.expNeededForNext, 125);
  });

  it('getStreakMultiplier scales dynamically: 1.0x -> 1.2x -> 1.5x -> 2.0x', () => {
    assert.strictEqual(getStreakMultiplier(0), 1.0);
    assert.strictEqual(getStreakMultiplier(2), 1.0);
    assert.strictEqual(getStreakMultiplier(3), 1.2);
    assert.strictEqual(getStreakMultiplier(4), 1.2);
    assert.strictEqual(getStreakMultiplier(5), 1.5);
    assert.strictEqual(getStreakMultiplier(9), 1.5);
    assert.strictEqual(getStreakMultiplier(10), 2.0);
    assert.strictEqual(getStreakMultiplier(25), 2.0);
  });

  it('calculateAwardedExp correctly factors in streak multiplier and guards non-numbers', () => {
    assert.strictEqual(calculateAwardedExp(20, 2), 20); // 20 * 1.0
    assert.strictEqual(calculateAwardedExp(20, 3), 24); // 20 * 1.2
    assert.strictEqual(calculateAwardedExp(20, 5), 30); // 20 * 1.5
    assert.strictEqual(calculateAwardedExp(20, 10), 40); // 20 * 2.0
    assert.strictEqual(calculateAwardedExp(-10, 5), 0);
    assert.strictEqual(calculateAwardedExp(NaN, 5), 0);
    assert.strictEqual(calculateAwardedExp('20', 5), 0);
  });

  console.log('\n--- Testing Progressive 3-Stage Hint Engine (js/hints.js) ---');

  it('getCardHint provides 3 distinct progressive stages for German nouns without spoiling answer', () => {
    const nounCard = {
      word: 'Bewerbung',
      article: 'die',
      plural: '-en',
      pos: 'noun',
      topic: 'Beruf & Arbeit',
      example_de: 'Ich habe meine Bewerbung gestern abgeschickt.'
    };

    const s1 = getCardHint(nounCard, 1, 'de');
    assert.strictEqual(s1.stage, 1);
    assert(s1.text.includes('die'), 'Stage 1 must include gender article');
    assert(s1.text.includes('-en'), 'Stage 1 must include plural');

    const s2 = getCardHint(nounCard, 2, 'de');
    assert.strictEqual(s2.stage, 2);
    assert(s2.text.includes('Genitiv'), 'Stage 2 must include case cue');
    assert(s2.text.includes('Beruf & Arbeit'), 'Stage 2 must include topic domain');
    assert(!s2.text.includes('Bewerbung'), 'Stage 2 must NOT spoil full noun word');
    assert(s2.text.includes('B...'), 'Stage 2 masks the noun stem');

    const s3 = getCardHint(nounCard, 3, 'de');
    assert.strictEqual(s3.stage, 3);
    assert(s3.text.includes('[B_____]'), 'Stage 3 must mask target word with initial letter');
  });

  it('getCardHint provides morphological, prefix, and valency cues for German verbs', () => {
    const verbCard = {
      word: 'beantragen',
      pos: 'verb',
      forms: 'beantragen | beantragt | beantragte | hat beantragt',
      rektion: '+ Akkusativ',
      example_de: 'Ich möchte Bildungsurlaub beantragen.'
    };

    const s1 = getCardHint(verbCard, 1, 'de');
    assert(s1.text.includes('untrennbar'), 'Stage 1 must detect untrennbar prefix');
    assert(s1.text.includes('Hilfsverb: haben'), 'Stage 1 must detect auxiliary haben');

    const s2 = getCardHint(verbCard, 2, 'de');
    assert(s2.text.includes('+ Akkusativ'), 'Stage 2 must include case valency');

    const s3 = getCardHint(verbCard, 3, 'de');
    assert(s3.text.includes('[b_____]'), 'Stage 3 must cloze-mask verb');
  });

  console.log('\n--- Testing Deterministic Grammar Fallback Engine (js/grammar-fallback.js) ---');

  it('evaluateRuleFallback catches Subordinate Clause Verb-End errors (weil/dass)', () => {
    const bad = evaluateRuleFallback('Ich lerne Deutsch, weil ich habe morgen eine Prüfung.', 'Subjunctions', 'de');
    assert.strictEqual(bad.verdict, 'Needs Correction');
    assert(bad.why.includes('Nebensatz rule'), 'Must explain Nebensatz verb position');
    assert.strictEqual(bad.expBonus, 15);
  });

  it('evaluateRuleFallback catches Inversion (V2) errors after fronted adverbs', () => {
    const bad = evaluateRuleFallback('Heute ich lerne fleißig Deutsch.', 'Hauptsatz V2', 'de');
    assert.strictEqual(bad.verdict, 'Needs Correction');
    assert(bad.why.includes('Inversion (V2)'), 'Must explain inversion rule');
    assert(bad.correctedSentence.includes('Heute lerne ich'), 'Must correct order to Verb at Pos 2');
  });

  it('evaluateRuleFallback catches Modal Verb Satzklammer placement errors without false positives', () => {
    const bad = evaluateRuleFallback('Ich kann sprechen Deutsch sehr gut.', 'Modalverben', 'de');
    assert.strictEqual(bad.verdict, 'Needs Correction');
    assert(bad.why.includes('Satzklammer'), 'Must explain Satzklammer rule');

    // Regression checks: valid sentences with adverbs/articles/pronouns must NOT be falsely flagged
    const valid1 = evaluateRuleFallback('Wir können morgen nach Hause gehen.', 'Modalverben', 'de');
    assert.strictEqual(valid1.verdict, 'Perfect!', 'Adverb "morgen" must not trigger false Satzklammer break');

    const valid2 = evaluateRuleFallback('Ich kann einen Kaffee kochen.', 'Modalverben', 'de');
    assert.strictEqual(valid2.verdict, 'Perfect!', 'Article "einen" must not trigger false Satzklammer break');

    const valid3 = evaluateRuleFallback('Wir können ihnen helfen.', 'Modalverben', 'de');
    assert.strictEqual(valid3.verdict, 'Perfect!', 'Pronoun "ihnen" must not trigger false Satzklammer break');
  });

  it('evaluateRuleFallback accurately corrects Prepositions and sets clean naturalAlternative', () => {
    const badAkk = evaluateRuleFallback('Das Geschenk ist für dir.', 'Präpositionen', 'de');
    assert.strictEqual(badAkk.verdict, 'Needs Correction');
    assert(badAkk.why.includes('Akkusativ'), 'Must explain Akkusativ preposition rule');
    assert(badAkk.correctedSentence.includes('für dich'), 'Must replace dir with dich');
    assert.strictEqual(badAkk.naturalAlternative, badAkk.correctedSentence, 'Natural alternative must be the clean correction');

    const badDat = evaluateRuleFallback('Ich fahre mit den Bus zur Schule.', 'Präpositionen', 'de');
    assert.strictEqual(badDat.verdict, 'Needs Correction');
    assert(badDat.why.includes('Dativ'), 'Must explain Dativ preposition rule');
    assert(badDat.correctedSentence.includes('mit dem Bus'), 'Must replace den with dem');
    assert.strictEqual(badDat.naturalAlternative, badDat.correctedSentence, 'Natural alternative must be the clean correction');
  });

  it('evaluateRuleFallback does NOT flag common verb "essen" as a lowercase noun error', () => {
    const res = evaluateRuleFallback('Wir essen heute Pizza.', 'Verben', 'de');
    assert.strictEqual(res.verdict, 'Perfect!', 'Verb "essen" must not be flagged as a lowercase noun');
  });

  it('evaluateRuleFallback does NOT flag English questions or modal auxiliaries', () => {
    const q1 = evaluateRuleFallback('Does he have a book?', '', 'en');
    assert.strictEqual(q1.verdict, 'Perfect!', 'Question with "Does he have" must not be flagged');

    const q2 = evaluateRuleFallback('Did she go to school?', '', 'en');
    assert.strictEqual(q2.verdict, 'Perfect!', 'Question with "Did she go" must not be flagged');

    const q3 = evaluateRuleFallback('Must he work today?', '', 'en');
    assert.strictEqual(q3.verdict, 'Perfect!', 'Question with "Must he work" must not be flagged');
  });

  it('evaluateRuleFallback defends against non-string types without crashing', () => {
    assert.doesNotThrow(() => evaluateRuleFallback(42));
    assert.doesNotThrow(() => evaluateRuleFallback(null));
    assert.doesNotThrow(() => evaluateRuleFallback(undefined));
    assert.doesNotThrow(() => evaluateRuleFallback({}));
  });

  it('evaluateRuleFallback awards Perfect! and full 50 EXP bonus for syntactically correct sentences', () => {
    const good = evaluateRuleFallback('Heute lerne ich fleißig Deutsch, weil ich in Berlin arbeiten möchte.', 'Complex', 'de');
    assert.strictEqual(good.verdict, 'Perfect!');
    assert.strictEqual(good.expBonus, 50);
  });

  console.log('\n--- Testing Gemini Client & Key Isolation (js/gemini.js) ---');

  it('GeminiClient safely stores and clears API keys in localStorage', () => {
    global.localStorage = {
      _data: {},
      getItem(k) { return this._data[k] || null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; }
    };

    assert.strictEqual(GeminiClient.hasApiKey(), false);
    GeminiClient.setApiKey('AIzaSyTestKey123');
    assert.strictEqual(GeminiClient.hasApiKey(), true);
    assert.strictEqual(GeminiClient.getApiKey(), 'AIzaSyTestKey123');

    GeminiClient.setApiKey('');
    assert.strictEqual(GeminiClient.hasApiKey(), false);
  });

  it('GeminiClient.evaluateSentence handles non-string inputs safely', async () => {
    const res = await GeminiClient.evaluateSentence(null);
    assert.strictEqual(res.verdict, 'Needs Correction');
  });
}
