/**
 * ARL - AI Fixer / Grammar Check Hardening & Verification Suite
 * Verifies the 3-Tier Execution Pipeline, Safe JSON Parser,
 * Non-Blanking DOM Input Lifecycle, and the Broken German Benchmark Sentence.
 */

import assert from 'assert';
import { evaluateRuleFallback } from '../js/grammar-fallback.js';
import { safeParseAiJson, GeminiClient, checkSentenceGrammar, getUserAiKey, setUserAiKey, getAiKeyType } from '../js/gemini.js';
import { renderColorCodedDiff, renderWordDiff } from '../js/diff.js';

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
}
