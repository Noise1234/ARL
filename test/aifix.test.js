/**
 * ARL - AI Fixer / Grammar Check Hardening & Verification Suite
 * Verifies the 3-Tier Execution Pipeline, Safe JSON Parser,
 * Non-Blanking DOM Input Lifecycle, and the Broken German Benchmark Sentence.
 */

import assert from 'assert';
import { evaluateRuleFallback } from '../js/grammar-fallback.js';
import { safeParseAiJson, GeminiClient, checkSentenceGrammar, getUserAiKey, setUserAiKey, getAiKeyType } from '../js/gemini.js';
import { renderColorCodedDiff, renderWordDiff } from '../js/diff.js';
import { verifyDrillSentence } from '../js/drill-validator.js';

export async function runAiFixTests(it) {
  console.log('\n--- Testing AI Fixer / Grammar Check Hardening Suite (test/aifix.test.js) ---');

  await it('Benchmark Test Case: "Ich gehe mit mein Freund in der Park weil das Wetter schön ist."', () => {
    const input = 'Ich gehe mit mein Freund in der Park weil das Wetter schön ist.';
    const res = evaluateRuleFallback(input, 'Nebensätze & Präpositionen', 'de');

    assert.strictEqual(res.verdict, 'Needs Correction', 'Verdict must be Needs Correction');
    assert.strictEqual(
      res.correctedSentence,
      'Ich gehe mit meinem Freund in den Park, weil das Wetter schön ist.',
      'Must correct mit mein -> mit meinem, in der Park -> in den Park, and add comma before weil'
    );
    assert(res.why.includes('mit'), 'Must explain Dativ preposition "mit"');
    assert(res.why.includes('in'), 'Must explain Wechselpräposition directional "in"');
    assert(res.why.includes('weil'), 'Must explain comma before "weil"');
    assert(res.diffHtml.includes('diff-error'), 'Diff HTML must highlight errors');
    assert(res.diffHtml.includes('mein'), 'Diff HTML must tag "mein"');
    assert(res.diffHtml.includes('der'), 'Diff HTML must tag "der"');
  });

  await it('safeParseAiJson: handles markdown code fences, comments, and invalid inputs safely', () => {
    // 1. Raw JSON
    const p1 = safeParseAiJson('{"verdict": "Perfect!", "correctedSentence": "Ich gehe nach Hause.", "why": "Correct", "expBonus": 50}');
    assert.strictEqual(p1.verdict, 'Perfect!');
    assert.strictEqual(p1.correctedSentence, 'Ich gehe nach Hause.');
    assert.strictEqual(p1.expBonus, 50);

    // 2. Wrapped in Markdown code fence
    const fenced = '```json\n{"verdict": "Needs Correction", "correctedSentence": "Er geht zur Schule.", "why": "Dativ zu", "expBonus": 15}\n```';
    const p2 = safeParseAiJson(fenced);
    assert.strictEqual(p2.verdict, 'Needs Correction');
    assert.strictEqual(p2.correctedSentence, 'Er geht zur Schule.');
    assert.strictEqual(p2.expBonus, 15);

    // 3. Needs Correction must NEVER accidentally match "correct"
    const p3 = safeParseAiJson('{"verdict": "Needs Correction", "correctedSentence": "Test sentence.", "why": "Reason"}');
    assert.strictEqual(p3.verdict, 'Needs Correction');

    // 4. Almost There verdict
    const p4 = safeParseAiJson('{"verdict": "Almost There", "correctedSentence": "Test.", "why": "Punctuation"}');
    assert.strictEqual(p4.verdict, 'Almost There');

    // 5. Invalid inputs must return null without throwing
    assert.strictEqual(safeParseAiJson(null), null);
    assert.strictEqual(safeParseAiJson(undefined), null);
    assert.strictEqual(safeParseAiJson(''), null);
    assert.strictEqual(safeParseAiJson('not json at all'), null);
    assert.strictEqual(safeParseAiJson('{ broken json'), null);
  });

  await it('evaluateRuleFallback: supports expected drill target sentence matching', () => {
    const target = 'Ich gehe heute in den Park.';
    
    // Exact match
    const exact = evaluateRuleFallback('Ich gehe heute in den Park.', 'Präpositionen', 'de', target);
    assert.strictEqual(exact.verdict, 'Perfect!');
    assert.strictEqual(exact.expBonus, 50);

    // Minor case/punctuation match
    const almost = evaluateRuleFallback('ich gehe heute in den park', 'Präpositionen', 'de', target);
    assert.strictEqual(almost.verdict, 'Almost There');
    assert.strictEqual(almost.expBonus, 35);
  });

  await it('GeminiClient: offline mode gracefully routes to Tier 3 Local Engine', async () => {
    // Simulate offline
    const origDesc = Object.getOwnPropertyDescriptor(global.navigator, 'onLine');
    Object.defineProperty(global.navigator, 'onLine', { value: false, configurable: true });

    try {
      const res = await GeminiClient.evaluateSentence('Ich gehe mit mein Freund in der Park weil das Wetter schön ist.', 'Nebensätze', 'de');
      assert.strictEqual(res.verdict, 'Needs Correction');
      assert.strictEqual(res.apiStatus, 'ai-tier3-local');
      assert.strictEqual(res.apiBadge, '[Offline Rule Check]');
      assert.strictEqual(res.correctedSentence, 'Ich gehe mit meinem Freund in den Park, weil das Wetter schön ist.');
    } finally {
      if (origDesc) {
        Object.defineProperty(global.navigator, 'onLine', origDesc);
      } else {
        Object.defineProperty(global.navigator, 'onLine', { value: true, configurable: true });
      }
    }
  });

  await it('GeminiClient: empty sentence is handled safely without throwing', async () => {
    const res = await GeminiClient.evaluateSentence('', 'Grammar', 'de');
    assert.strictEqual(res.verdict, 'Needs Correction');
    assert(res.diffHtml.includes('Empty input'));
  });

  await it('renderWordDiff produces token-level <del> and <ins> markup', () => {
    const user = 'Ich gehe mit mein Freund.';
    const corr = 'Ich gehe mit meinem Freund.';
    const diff = renderWordDiff(user, corr);
    assert(diff.includes('<del class="diff-deleted">mein</del>'), 'Must strikethrough deleted token');
    assert(diff.includes('<ins class="diff-inserted">meinem</ins>'), 'Must highlight inserted token');
    assert(diff.includes('Ich'), 'Must contain unchanged words');
    assert(diff.includes('Freund.'), 'Must contain unchanged words with punctuation');
  });

  await it('Key Vault helper functions accurately identify Gemini and Groq keys', () => {
    assert.strictEqual(getAiKeyType('AIzaSyAbc1234567890'), 'Gemini');
    assert.strictEqual(getAiKeyType('gsk_abcdef1234567890'), 'Groq');
    assert.strictEqual(getAiKeyType('sk-otherKey'), 'OpenAI');
    assert.strictEqual(getAiKeyType('custom_model_key_123'), 'Custom');
    assert.strictEqual(getAiKeyType(''), null);
    assert.strictEqual(getAiKeyType(null), null);

    // Save and clear test
    setUserAiKey('AIzaTestKey123');
    assert.strictEqual(getUserAiKey(), 'AIzaTestKey123');
    setUserAiKey('');
    assert.strictEqual(getUserAiKey(), '');
  });

  await it('checkSentenceGrammar Tier 4 returns valid structured output offline', async () => {
    const origDesc = Object.getOwnPropertyDescriptor(global.navigator, 'onLine');
    Object.defineProperty(global.navigator, 'onLine', { value: false, configurable: true });

    try {
      const res = await checkSentenceGrammar('Ich gehe mit mein Freund.', 'de');
      assert.strictEqual(res.isCorrect, false);
      assert.strictEqual(res.engine, 'Offline Rules');
      assert.strictEqual(res.correctedSentence, 'Ich gehe mit meinem Freund.');
      assert(Array.isArray(res.explanations) && res.explanations.length > 0);
      assert(typeof res.grammarTip === 'string');
      assert(res.wordDiffHtml.includes('<del class="diff-deleted">'));
    } finally {
      if (origDesc) {
        Object.defineProperty(global.navigator, 'onLine', origDesc);
      } else {
        Object.defineProperty(global.navigator, 'onLine', { value: true, configurable: true });
      }
    }
  });

  const sampleDrill = {
    id: 'de_a1_hauptsatz_drill_1',
    prompt_mn: 'Өнөөдөр би номын санд герман хэл сурч байна.',
    target: 'Heute lerne ich in der Bibliothek Deutsch.',
    rule_breakdown: 'Цаг хугацаа (Heute) 1-р байранд орсон тул V2 дүрмээр үйл үг (lerne) 2-р байранд орно.',
    woerterbuch: [
      { word: 'heute', pos: 'adv' },
      { word: 'lernen', pos: 'verb' },
      { word: 'die Bibliothek', pos: 'noun' },
      { word: 'Deutsch', pos: 'noun' }
    ]
  };
  const sampleTopic = {
    id: 'de_a1_hauptsatz',
    title: 'Hauptsatz & Verb-Zweit-Stellung (V2 Rule)'
  };

  await it('Drill Target-Aware Step A: Blocks gibberish immediately with 0 EXP and target answer', async () => {
    const res = await verifyDrillSentence('uch bgha jjah js', sampleDrill, sampleTopic, 'de');
    assert.strictEqual(res.isCorrect, false);
    assert.strictEqual(res.statusLabel, '✗ Incomplete / Invalid Sentence');
    assert.strictEqual(res.expBonus, 0, 'Gibberish must NEVER award EXP');
    assert.strictEqual(res.correctedSentence, 'Heute lerne ich in der Bibliothek Deutsch.');
    assert(res.explanations.some(e => e.includes('Missing required vocabulary') || e.includes('invalid words')));
    assert(res.diffHtml.includes('<ins class="diff-inserted">'));
  });

  await it('Drill Target-Aware Step B: Detects Verb-First (V1) declarative error with 0 EXP', async () => {
    const res = await verifyDrillSentence('lerne heute ich in der Bibliothek Deutsch', sampleDrill, sampleTopic, 'de');
    assert.strictEqual(res.isCorrect, false);
    assert.strictEqual(res.expBonus, 0, 'V1 word order error must award 0 EXP');
    assert.strictEqual(res.correctedSentence, 'Heute lerne ich in der Bibliothek Deutsch.');
    assert(res.explanations[0].includes('V2 Rule Violation'), 'Must flag V2 rule violation');
    assert(res.explanations[0].includes("conjugated verb ('lerne') must be in Position 2, not Position 1"));
    assert(res.diffHtml.includes('<del class="diff-deleted">lerne</del>'));
  });

  await it('Drill Target-Aware Step B: Detects No-Inversion (V3) error after fronted adverbial with 0 EXP', async () => {
    const res = await verifyDrillSentence('Heute ich lerne in der Bibliothek Deutsch', sampleDrill, sampleTopic, 'de');
    assert.strictEqual(res.isCorrect, false);
    assert.strictEqual(res.expBonus, 0, 'Inversion error must award 0 EXP');
    assert.strictEqual(res.correctedSentence, 'Heute lerne ich in der Bibliothek Deutsch.');
    assert(res.explanations[0].includes('V2 Inversion Error'), 'Must flag V2 inversion error');
    assert(res.explanations[0].includes("When a time/place phrase ('Heute') is at Position 1, the verb ('lerne') must stay at Position 2"));
  });

  await it('Drill Target-Aware Step B: Detects Preposition / Case Error with 0 EXP', async () => {
    const res = await verifyDrillSentence('Heute lerne ich in die Bibliothek Deutsch.', sampleDrill, sampleTopic, 'de');
    assert.strictEqual(res.isCorrect, false);
    assert.strictEqual(res.expBonus, 0, 'Preposition case error must award 0 EXP');
    assert(res.explanations[0].includes("in der Bibliothek") && res.explanations[0].includes('Dativ'));
  });

  await it('Drill Target-Aware Step B: Recognizes valid V2 alternative permutation and awards 15 EXP', async () => {
    const res = await verifyDrillSentence('Ich lerne heute in der Bibliothek Deutsch.', sampleDrill, sampleTopic, 'de');
    assert.strictEqual(res.isCorrect, true);
    assert.strictEqual(res.statusLabel, '✓ Grammatically Correct');
    assert.strictEqual(res.expBonus, 15, 'Valid alternative must award +15 EXP');
    assert.strictEqual(res.correctedSentence, 'Ich lerne heute in der Bibliothek Deutsch.');
  });

  await it('Drill Target-Aware Step B: Awards +5 EXP partial credit for punctuation/case only', async () => {
    const res = await verifyDrillSentence('heute lerne ich in der bibliothek deutsch', sampleDrill, sampleTopic, 'de');
    assert.strictEqual(res.isCorrect, false);
    assert.strictEqual(res.statusLabel, 'Minor Capitalization / Punctuation Adjustment');
    assert.strictEqual(res.expBonus, 5, 'Punctuation/case error awards +5 EXP partial credit');
    assert.strictEqual(res.correctedSentence, 'Heute lerne ich in der Bibliothek Deutsch.');
  });

  await it('Drill Target-Aware Step B: Exact target match awards 15 EXP', async () => {
    const res = await verifyDrillSentence('Heute lerne ich in der Bibliothek Deutsch.', sampleDrill, sampleTopic, 'de');
    assert.strictEqual(res.isCorrect, true);
    assert.strictEqual(res.statusLabel, '✓ Grammatically Correct');
    assert.strictEqual(res.expBonus, 15);
  });

  await it('checkSentenceGrammar seamlessly executes target-aware drill pipeline via options.drill', async () => {
    const bad = await checkSentenceGrammar('uch bgha jjah js', 'de', { drill: sampleDrill, topic: sampleTopic });
    assert.strictEqual(bad.isCorrect, false);
    assert.strictEqual(bad.expBonus, 0);
    assert.strictEqual(bad.statusLabel, '✗ Incomplete / Invalid Sentence');

    const good = await checkSentenceGrammar('Ich lerne heute in der Bibliothek Deutsch.', 'de', { drill: sampleDrill, topic: sampleTopic });
    assert.strictEqual(good.isCorrect, true);
    assert.strictEqual(good.expBonus, 15);
    assert.strictEqual(good.statusLabel, '✓ Grammatically Correct');
  });
}
