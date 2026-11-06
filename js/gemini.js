/**
 * ARL - 4-Tier Hybrid Sentence Grammar Checker & API Vault
 * Tier 1: User's Personal API Key (Gemini AIza... or Groq gsk_...)
 * Tier 2: Keyless LanguageTool Public API (100% Free, No Key Required)
 * Tier 3: Keyless Pollinations AI Enhancement (Free LLM Rewrite with 6s timeout)
 * Tier 4: Offline Local Deterministic Grammar Checker (Zero Network)
 */

import { evaluateRuleFallback } from './grammar-fallback.js';
import { computeDiff, renderColorCodedDiff, renderWordDiff } from './diff.js';
import { verifyDrillSentence } from './drill-validator.js';

export { verifyDrillSentence } from './drill-validator.js';

export const USER_AI_KEY_STORAGE = 'arl_user_ai_key';
export const LEGACY_GEMINI_KEY_STORAGE = 'arl_gemini_api_key';

/**
 * Retrieves the user's stored API key from localStorage.
 * Checks modern 'arl_user_ai_key' first with fallback to legacy 'arl_gemini_api_key'.
 * @returns {string}
 */
export function getUserAiKey() {
  try {
    if (typeof localStorage !== 'undefined') {
      const modern = localStorage.getItem(USER_AI_KEY_STORAGE);
      if (modern && modern.trim()) return modern.trim();
      const legacy = localStorage.getItem(LEGACY_GEMINI_KEY_STORAGE);
      if (legacy && legacy.trim()) return legacy.trim();
    }
  } catch (e) {
    console.warn('Could not read user AI key from localStorage:', e);
  }
  return '';
}

/**
 * Saves or clears the user's personal API key in localStorage.
 * Synchronizes both keys for full backward compatibility.
 * @param {string} key
 */
export function setUserAiKey(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      const trimmed = String(key ?? '').trim();
      if (!trimmed) {
        localStorage.removeItem(USER_AI_KEY_STORAGE);
        localStorage.removeItem(LEGACY_GEMINI_KEY_STORAGE);
      } else {
        localStorage.setItem(USER_AI_KEY_STORAGE, trimmed);
        localStorage.setItem(LEGACY_GEMINI_KEY_STORAGE, trimmed);
      }
    }
  } catch (e) {
    console.warn('Could not save user AI key to localStorage:', e);
  }
}

/**
 * Detects the engine type based on key prefix.
 * @param {string} [key]
 * @returns {'Gemini'|'Groq'|'OpenAI'|null}
 */
export function getAiKeyType(key = getUserAiKey()) {
  const k = String(key || '').trim();
  if (k.startsWith('AIza')) return 'Gemini';
  if (k.startsWith('gsk_')) return 'Groq';
  if (k.startsWith('sk-')) return 'OpenAI';
  if (k) return 'Custom';
  return null;
}

/**
 * Sanitizes and parses grammar checker JSON output from AI models.
 * Strips markdown code fences (```json ... ```) via regex and never throws.
 * @param {string} rawText
 * @returns {{isCorrect: boolean, correctedSentence: string, explanations: string[], grammarTip: string}|null}
 */
export function safeParseGrammarJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // Strip markdown code fences
  let cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Extract first JSON object
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]);
    if (!parsed || typeof parsed !== 'object') return null;

    const rawVerdict = String(parsed.verdict || '').toLowerCase().trim();
    let isCorrect = Boolean(parsed.isCorrect);
    if (typeof parsed.isCorrect === 'undefined') {
      isCorrect = rawVerdict.includes('perfect') || rawVerdict.includes('flawless') || rawVerdict === 'correct';
    }

    const correctedSentence = String(parsed.correctedSentence || parsed.corrected || '').trim();
    if (!correctedSentence) return null;

    let explanations = [];
    if (Array.isArray(parsed.explanations)) {
      explanations = parsed.explanations.map(s => String(s).trim()).filter(Boolean);
    } else if (parsed.why || parsed.explanation) {
      explanations = [String(parsed.why || parsed.explanation).trim()];
    }

    const grammarTip = String(parsed.grammarTip || parsed.tip || explanations[0] || '').trim();

    return {
      isCorrect,
      correctedSentence,
      explanations,
      grammarTip
    };
  } catch (err) {
    console.warn('safeParseGrammarJson error:', err);
    return null;
  }
}

/**
 * Legacy schema parser for backward compatibility with existing tests and views.
 * @param {string} rawText
 * @returns {object|null}
 */
export function safeParseAiJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // Strip markdown fences
  let cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]);
    if (!parsed || typeof parsed !== 'object') return null;

    let verdict = 'Needs Correction';
    const rawVerdict = String(parsed.verdict || '').toLowerCase().trim();
    if (rawVerdict.includes('perfect') || rawVerdict.includes('flawless') || rawVerdict === 'correct' || rawVerdict.startsWith('correct')) {
      verdict = 'Perfect!';
    } else if (rawVerdict.includes('almost') || rawVerdict.includes('good') || rawVerdict.includes('minor') || rawVerdict.includes('warn')) {
      verdict = 'Almost There';
    } else if (rawVerdict.includes('needs') || rawVerdict.includes('correction') || rawVerdict.includes('wrong') || rawVerdict.includes('error')) {
      verdict = 'Needs Correction';
    } else if (parsed.isCorrect === true) {
      verdict = 'Perfect!';
    }

    const correctedSentence = String(parsed.correctedSentence || parsed.corrected || '').trim();
    if (!correctedSentence) return null;

    const why = String(parsed.why || parsed.explanation || (Array.isArray(parsed.explanations) ? parsed.explanations.join(' ') : '') || 'Grammar verified.').trim();
    const naturalAlternative = String(parsed.naturalAlternative || correctedSentence).trim();

    let expBonus = Number(parsed.expBonus);
    if (!Number.isFinite(expBonus) || expBonus <= 0) {
      expBonus = verdict === 'Perfect!' ? 50 : (verdict === 'Almost There' ? 35 : 15);
    } else {
      expBonus = Math.max(15, Math.min(50, Math.floor(expBonus)));
    }

    return {
      verdict,
      correctedSentence,
      why,
      naturalAlternative,
      expBonus,
      diff: null
    };
  } catch (err) {
    console.warn('safeParseAiJson parsing failed:', err);
    return null;
  }
}

/**
 * Unified 4-Tier Hybrid Sentence Grammar Checker
 * Cascades automatically through:
 * - Tier 1: User's Personal API Key (Gemini AIza... or Groq gsk_...)
 * - Tier 2: Keyless LanguageTool Public API (100% Free)
 * - Tier 3: Keyless Pollinations AI Enhancement (Free LLM with 6s timeout)
 * - Tier 4: Offline Local Deterministic Grammar Checker (Zero Network)
 *
 * @param {string} text - User's input sentence
 * @param {string} [lang='de'] - Target language ('de' or 'en')
 * @param {Object} [options={}] - Optional metadata (expectedSentence, targetTopic)
 * @returns {Promise<{
 *   isCorrect: boolean,
 *   correctedSentence: string,
 *   explanations: string[],
 *   grammarTip: string,
 *   engine: string,
 *   diffHtml: string,
 *   verdict: string,
 *   expBonus: number
 * }>}
 */
export async function checkSentenceGrammar(text, lang = 'de', options = {}) {
  const trimmed = String(text ?? '').trim();
  const targetTopic = options.targetTopic || '';
  const expectedSentence = options.expectedSentence || (options.drill?.target || '');
  const mongolianPrompt = options.mongolianPrompt || (options.drill?.prompt_mn || '');

  // 0. Empty input defense
  if (!trimmed) {
    return {
      isCorrect: false,
      correctedSentence: '',
      explanations: ['Input is empty. Please enter a sentence to check.'],
      grammarTip: 'Type or speak a sentence first.',
      engine: 'Offline Rules',
      diffHtml: '<span class="diff-error">Empty input</span>',
      wordDiffHtml: '<span class="diff-error">Empty input</span>',
      verdict: 'Needs Correction',
      verdictLabel: '✗ Incomplete / Invalid Sentence',
      statusLabel: '✗ Incomplete / Invalid Sentence',
      expBonus: 0
    };
  }

  // Target-Aware Drill Evaluation Pipeline (Steps 1 through 5)
  if (options.drill || expectedSentence) {
    const drillObj = options.drill || {
      target: expectedSentence,
      prompt_mn: mongolianPrompt,
      woerterbuch: options.requiredWords || []
    };
    const topicObj = options.topic || {
      title: targetTopic,
      id: options.topicId || ''
    };

    const callContextAwareAi = async ({ userText, mongolianPrompt, targetAnswer, activeGrammarRule, lang }) => {
      const userKey = getUserAiKey();
      if (userKey) {
        const keyType = getAiKeyType(userKey);
        try {
          if (keyType === 'Gemini') {
            const res = await callTier1Gemini(userText, lang, userKey, activeGrammarRule, targetAnswer, mongolianPrompt);
            if (res) return res;
          } else if (keyType === 'Groq') {
            const res = await callTier1Groq(userText, lang, userKey, activeGrammarRule, targetAnswer, mongolianPrompt);
            if (res) return res;
          }
        } catch (e) {
          console.warn('Personal key failed in drill evaluation:', e);
        }
      }
      return callTier3Pollinations(userText, lang, activeGrammarRule, targetAnswer, mongolianPrompt);
    };

    return verifyDrillSentence(trimmed, drillObj, topicObj, lang, {
      ...options,
      callContextAwareAi
    });
  }

  const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

  // If completely offline, skip straight to Tier 4
  if (!isOnline) {
    return runTier4Local(trimmed, lang, targetTopic, expectedSentence);
  }

  // =========================================================================
  // TIER 1: User's Personal API Key (Gemini or Groq)
  // =========================================================================
  const userKey = getUserAiKey();
  if (userKey) {
    const keyType = getAiKeyType(userKey);
    try {
      if (keyType === 'Gemini') {
        const geminiRes = await callTier1Gemini(trimmed, lang, userKey, targetTopic, expectedSentence);
        if (geminiRes) return geminiRes;
      } else if (keyType === 'Groq') {
        const groqRes = await callTier1Groq(trimmed, lang, userKey, targetTopic, expectedSentence);
        if (groqRes) return groqRes;
      }
    } catch (err) {
      console.warn('Tier 1 Personal API Key failed, falling through to Tier 2/3:', err);
    }
  }

  // =========================================================================
  // TIERS 2 & 3: Keyless Free Endpoints (LanguageTool + Pollinations AI)
  // =========================================================================
  try {
    // Launch Tier 2 (LanguageTool) and Tier 3 (Pollinations AI) concurrently
    const ltPromise = callTier2LanguageTool(trimmed, lang, targetTopic, expectedSentence).catch(err => {
      console.warn('Tier 2 LanguageTool call failed:', err);
      return null;
    });

    const pollPromise = callTier3Pollinations(trimmed, lang, targetTopic, expectedSentence).catch(err => {
      console.warn('Tier 3 Pollinations call failed:', err);
      return null;
    });

    // Prefer Pollinations AI LLM rewrite if returned within 6 seconds
    const pollResult = await pollPromise;
    if (pollResult && pollResult.correctedSentence) {
      return pollResult;
    }

    // Fall back cleanly to LanguageTool output
    const ltResult = await ltPromise;
    if (ltResult && ltResult.correctedSentence) {
      return ltResult;
    }
  } catch (err) {
    console.warn('Keyless online tiers 2 & 3 failed:', err);
  }

  // =========================================================================
  // TIER 4: Offline Local Deterministic Grammar Checker
  // =========================================================================
  console.warn('All network tiers exhausted. Executing Tier 4 Local Deterministic Checker.');
  return runTier4Local(trimmed, lang, targetTopic, expectedSentence);
}

/**
 * Tier 1A: Personal Google Gemini 2.5 Flash
 */
async function callTier1Gemini(text, lang, apiKey, targetTopic = '', expectedSentence = '', mongolianPrompt = '') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const langName = lang === 'de' ? 'German' : 'English';
  let systemPrompt;
  let userPrompt;

  if (mongolianPrompt && expectedSentence) {
    systemPrompt = `You are an expert language teacher and examiner evaluating a student translation into ${langName}.
Active Grammar Rule: "${targetTopic || 'General Grammar'}".
Mongolian Source Prompt: "${mongolianPrompt}".
Expected Target Sentence: "${expectedSentence}".

Evaluate the user's German/English sentence strictly as a translation of the Mongolian prompt following the active grammar rule. If their sentence is a valid alternative translation with correct V2/Nebensatz word order and cases, mark isCorrect: true. Otherwise, correct it to natural B1 German/English matching the target meaning and explain the exact grammar/word-order mistake.

Respond ONLY with valid JSON matching this schema (no markdown, no code fences):
{
  "isCorrect": boolean,
  "correctedSentence": "clean corrected sentence",
  "explanations": ["concise list of mistakes fixed"],
  "grammarTip": "short pedagogical tip"
}`;

    userPrompt = `Mongolian Prompt: "${mongolianPrompt}"
Expected Target: "${expectedSentence}"
Active Grammar Rule: "${targetTopic}"
Student Attempt: "${text}"

Analyze correctness against target meaning and grammar rule, then output JSON:`;
  } else {
    systemPrompt = `You are an expert pedagogical language tutor auditing a student sentence in ${langName}.
Target Grammar Topic: "${targetTopic || 'General Grammar'}".
${expectedSentence ? `Expected Target: "${expectedSentence}".` : ''}
Student Sentence: "${text}".

Analyze grammar correctness, verb placement, case governance (Nominativ/Akkusativ/Dativ), prepositions, and capitalization.
Respond ONLY with a single valid JSON object matching this exact schema (no markdown, no code fences):
{
  "isCorrect": boolean,
  "correctedSentence": "clean corrected sentence",
  "explanations": ["short concise explanation of each mistake and rule applied"],
  "grammarTip": "1-sentence memorable rule or mnemonic for this grammar structure"
}`;

    userPrompt = `Analyze: "${text}"`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 600,
          responseMimeType: 'application/json'
        }
      })
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      console.warn(`Gemini API returned status ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    const rawContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = safeParseGrammarJson(rawContent);
    if (!parsed) return null;

    return formatGrammarResult(text, parsed, 'Gemini');
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('callTier1Gemini error:', err);
    return null;
  }
}

/**
 * Tier 1B: Personal Groq Llama-3.3-70b-versatile
 */
async function callTier1Groq(text, lang, apiKey, targetTopic = '', expectedSentence = '', mongolianPrompt = '') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const langName = lang === 'de' ? 'German' : 'English';
  let systemPrompt;
  let userPrompt;

  if (mongolianPrompt && expectedSentence) {
    systemPrompt = `You are an expert language teacher and examiner evaluating a student translation into ${langName}.
Active Grammar Rule: "${targetTopic || 'General Grammar'}".
Mongolian Source Prompt: "${mongolianPrompt}".
Expected Target Sentence: "${expectedSentence}".

Evaluate the user's German/English sentence strictly as a translation of the Mongolian prompt following the active grammar rule. If their sentence is a valid alternative translation with correct V2/Nebensatz word order and cases, mark isCorrect: true. Otherwise, correct it to natural B1 German/English matching the target meaning and explain the exact grammar/word-order mistake.

Output ONLY valid JSON:
{
  "isCorrect": boolean,
  "correctedSentence": "clean corrected sentence",
  "explanations": ["concise list of mistakes fixed"],
  "grammarTip": "short pedagogical tip"
}`;

    userPrompt = `Mongolian Prompt: "${mongolianPrompt}"
Expected Target: "${expectedSentence}"
Active Grammar Rule: "${targetTopic}"
Student Attempt: "${text}"

Analyze correctness against target meaning and grammar rule, then output JSON:`;
  } else {
    systemPrompt = `You are an expert language teacher for ${langName}. Output ONLY valid JSON:
{
  "isCorrect": boolean,
  "correctedSentence": "clean corrected sentence",
  "explanations": ["concise list of mistakes fixed"],
  "grammarTip": "short pedagogical tip"
}`;

    userPrompt = `Target Topic: "${targetTopic || 'General'}".
${expectedSentence ? `Target Construction: "${expectedSentence}".` : ''}
Student Sentence: "${text}".
Analyze and correct:`;
  }

  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      console.warn(`Groq API returned status ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const parsed = safeParseGrammarJson(rawContent);
    if (!parsed) return null;

    return formatGrammarResult(text, parsed, 'Groq');
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('callTier1Groq error:', err);
    return null;
  }
}

/**
 * Tier 2: Keyless LanguageTool Public API
 */
async function callTier2LanguageTool(text, lang, targetTopic = '', expectedSentence = '') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  const langCode = lang === 'de' ? 'de-DE' : 'en-US';

  try {
    const resp = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
      body: `text=${encodeURIComponent(text)}&language=${langCode}`
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      console.warn(`LanguageTool returned status ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    const matches = Array.isArray(data?.matches) ? data.matches : [];

    // Defend against turning gibberish into nonsensical sentences
    const words = text.split(/\s+/).filter(Boolean);
    const spellingErrors = matches.filter(m => m.rule?.id?.includes('SPELL') || m.rule?.issueType === 'misspelling');
    if (words.length > 0 && spellingErrors.length / words.length >= 0.5) {
      // Over 50% of words are spelling errors -> Treat as unrecognized / gibberish text
      const badWords = spellingErrors.map(m => text.slice(m.offset, m.offset + m.length));
      return {
        isCorrect: false,
        correctedSentence: text,
        explanations: [`Unrecognized or invalid words detected: ${badWords.map(w => `"${w}"`).join(', ')}. Please use real German words.`],
        grammarTip: 'Type a complete sentence using known vocabulary.',
        engine: 'LanguageTool',
        diffHtml: renderWordDiff(text, text),
        wordDiffHtml: renderWordDiff(text, text),
        verdict: 'Needs Correction',
        verdictLabel: '✗ Incomplete / Invalid Sentence',
        statusLabel: '✗ Incomplete / Invalid Sentence',
        expBonus: 0
      };
    }

    // If LanguageTool found 0 errors, double-check against local deterministic rules
    if (matches.length === 0) {
      const local = evaluateRuleFallback(text, targetTopic, lang, expectedSentence);
      if (local.verdict !== 'Perfect!') {
        const diffHtml = renderWordDiff(text, local.correctedSentence);
        return {
          isCorrect: false,
          correctedSentence: local.correctedSentence,
          explanations: local.why ? [local.why] : ['Grammar refinement applied.'],
          grammarTip: local.why || 'Follow case governance and verb placement rules.',
          engine: 'LanguageTool',
          diffHtml,
          wordDiffHtml: diffHtml,
          verdict: local.verdict,
          expBonus: local.expBonus
        };
      }

      const diffHtml = `<span class="diff-same">${text}</span>`;
      return {
        isCorrect: true,
        correctedSentence: text,
        explanations: [],
        grammarTip: 'No grammar, spelling, or punctuation errors found.',
        engine: 'LanguageTool',
        diffHtml,
        wordDiffHtml: diffHtml,
        verdict: 'Perfect!',
        expBonus: 50
      };
    }

    // Apply matches in reverse offset order
    let corrected = text;
    const sorted = [...matches].sort((a, b) => b.offset - a.offset);
    const explanations = [];

    for (const m of sorted) {
      if (m.replacements && m.replacements.length > 0) {
        const repl = m.replacements[0].value;
        corrected = corrected.slice(0, m.offset) + repl + corrected.slice(m.offset + m.length);
      }
      if (m.message && !explanations.includes(m.message)) {
        explanations.push(m.message);
      }
    }

    // Polish with local rules (e.g. compound Wechselpräposition or comma nuances)
    const polished = evaluateRuleFallback(corrected, targetTopic, lang, expectedSentence);
    if (polished.correctedSentence && polished.correctedSentence !== corrected) {
      corrected = polished.correctedSentence;
      if (polished.why && !explanations.includes(polished.why)) {
        explanations.push(polished.why);
      }
    }

    const diffHtml = renderWordDiff(text, corrected);
    return {
      isCorrect: false,
      correctedSentence: corrected,
      explanations,
      grammarTip: explanations[0] || 'Check case governance and word placement.',
      engine: 'LanguageTool',
      diffHtml,
      wordDiffHtml: diffHtml,
      verdict: 'Needs Correction',
      expBonus: 15
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('callTier2LanguageTool error:', err);
    return null;
  }
}

/**
 * Tier 3: Keyless Pollinations AI Enhancement (Free OpenAI-compatible endpoint)
 */
async function callTier3Pollinations(text, lang, targetTopic = '', expectedSentence = '', mongolianPrompt = '') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  const langName = lang === 'de' ? 'German' : 'English';
  let systemPrompt;
  let userPrompt;

  if (mongolianPrompt && expectedSentence) {
    systemPrompt = `You are an expert language teacher and examiner evaluating a student translation into ${langName}.
Active Grammar Rule: "${targetTopic || 'General Grammar'}".
Mongolian Source Prompt: "${mongolianPrompt}".
Expected Target Sentence: "${expectedSentence}".

Evaluate the user's German/English sentence strictly as a translation of the Mongolian prompt following the active grammar rule. If their sentence is a valid alternative translation with correct V2/Nebensatz word order and cases, mark isCorrect: true. Otherwise, correct it to natural B1 German/English matching the target meaning and explain the exact grammar/word-order mistake.

Output ONLY valid JSON:
{
  "isCorrect": boolean,
  "correctedSentence": "clean corrected sentence",
  "explanations": ["concise list of mistakes fixed"],
  "grammarTip": "short pedagogical tip"
}`;

    userPrompt = `Mongolian Prompt: "${mongolianPrompt}"
Expected Target: "${expectedSentence}"
Active Grammar Rule: "${targetTopic}"
Student Attempt: "${text}"

Analyze correctness and return JSON:`;
  } else {
    systemPrompt = `You are an expert language teacher for ${langName}. Output ONLY valid JSON:
{
  "isCorrect": boolean,
  "correctedSentence": "clean corrected sentence",
  "explanations": ["concise list of mistakes fixed"],
  "grammarTip": "short pedagogical tip"
}`;

    userPrompt = `Target Topic: "${targetTopic || 'General'}".
${expectedSentence ? `Target Construction: "${expectedSentence}".` : ''}
Sentence: "${text}".
Analyze, correct, and return JSON:`;
  }

  try {
    const resp = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      console.warn(`Pollinations returned status ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const parsed = safeParseGrammarJson(rawContent);
    if (!parsed) return null;

    return formatGrammarResult(text, parsed, 'Pollinations AI');
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('callTier3Pollinations error:', err);
    return null;
  }
}

/**
 * Tier 4: Offline Local Deterministic Grammar Checker
 */
function runTier4Local(text, lang, targetTopic = '', expectedSentence = '') {
  const local = evaluateRuleFallback(text, targetTopic, lang, expectedSentence);
  const isCorrect = local.verdict === 'Perfect!';
  const explanations = local.why ? [local.why] : [];
  const diffHtml = renderWordDiff(text, local.correctedSentence);

  return {
    isCorrect,
    correctedSentence: local.correctedSentence,
    explanations,
    grammarTip: local.why || 'Follow word order, verb placement, and case governance.',
    engine: 'Offline Rules',
    diffHtml,
    wordDiffHtml: diffHtml,
    verdict: local.verdict,
    expBonus: local.expBonus
  };
}

/**
 * Formats parsed grammar data into the canonical result schema.
 */
function formatGrammarResult(originalText, parsed, engineName) {
  const isCorrect = Boolean(parsed.isCorrect);
  const correctedSentence = String(parsed.correctedSentence || originalText).trim();
  const explanations = Array.isArray(parsed.explanations) ? parsed.explanations : [];
  const grammarTip = String(parsed.grammarTip || explanations[0] || '').trim();

  let verdict = 'Needs Correction';
  let expBonus = 0;
  let statusLabel = '✗ Corrections Found';

  const cleanOrig = originalText.toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '').trim();
  const cleanCorr = correctedSentence.toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '').trim();

  if (isCorrect || originalText.trim() === correctedSentence) {
    verdict = 'Perfect!';
    statusLabel = '✓ Grammatically Correct';
    expBonus = 15;
  } else if (cleanOrig === cleanCorr) {
    verdict = 'Almost There';
    statusLabel = 'Minor Capitalization / Punctuation Adjustment';
    expBonus = 5;
  } else {
    verdict = 'Needs Correction';
    statusLabel = '✗ Corrections Found';
    expBonus = 0;
  }

  const diffHtml = renderWordDiff(originalText, correctedSentence);

  return {
    isCorrect,
    statusLabel,
    verdictLabel: statusLabel,
    correctedSentence,
    explanations,
    grammarTip,
    engine: engineName,
    diffHtml,
    wordDiffHtml: diffHtml,
    verdict,
    expBonus
  };
}

/**
 * GeminiClient facade maintaining full backward compatibility
 * across all existing view components, telemetry, and test suites.
 */
export class GeminiClient {
  static STORAGE_KEY = USER_AI_KEY_STORAGE;

  static getApiKey() {
    return getUserAiKey();
  }

  static setApiKey(key) {
    setUserAiKey(key);
  }

  static hasApiKey() {
    return Boolean(getUserAiKey());
  }

  static checkSentenceGrammar = checkSentenceGrammar;

  /**
   * Resilient Sentence Evaluation bridge for existing views.
   */
  static async evaluateSentence(userSentence, targetTopic = '', targetLang = 'de', expectedSentence = '') {
    const res = await checkSentenceGrammar(userSentence, targetLang, { targetTopic, expectedSentence });
    const apiStatusMap = {
      'Gemini': 'ai-tier1-gemini',
      'Groq': 'ai-tier1-groq',
      'LanguageTool': 'ai-tier2-languagetool',
      'Pollinations AI': 'ai-tier3-pollinations',
      'Offline Rules': 'ai-tier3-local'
    };

    return {
      ...res,
      apiStatus: apiStatusMap[res.engine] || 'ai-tier3-local',
      apiBadge: res.engine === 'Offline Rules' ? '[Offline Rule Check]' : `[${res.engine}]`,
      why: res.explanations.join(' ') || res.grammarTip,
      naturalAlternative: res.correctedSentence,
      errorMessage: null
    };
  }

  /**
   * Explains a highlighted grammar concept or phrase using available tiers.
   */
  static async explainGrammarConcept(selectedText, targetLang = 'de') {
    const text = String(selectedText ?? '').trim();
    if (!text) return 'Please select a phrase or sentence to explain.';

    const userKey = getUserAiKey();
    const keyType = getAiKeyType(userKey);
    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

    const prompt = `You are a concise grammar tutor for students learning ${targetLang === 'de' ? 'German' : 'English'} (with Mongolian translations/explanations).
Explain the grammar structure, case/conjugation, or syntax rules in this excerpt:
"${text}"
Keep your explanation concise (3-4 bullet points), clear, and pedagogical. Include Mongolian explanations where helpful.`;

    if (userKey && isOnline) {
      try {
        if (keyType === 'Gemini') {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(userKey)}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 350 }
            })
          });
          clearTimeout(timeoutId);
          if (resp.ok) {
            const data = await resp.json();
            const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (output) return output;
          }
        } else if (keyType === 'Groq') {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${userKey}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.2
            })
          });
          clearTimeout(timeoutId);
          if (resp.ok) {
            const data = await resp.json();
            const output = data?.choices?.[0]?.message?.content;
            if (output) return output;
          }
        }
      } catch (e) {
        console.warn('explainGrammarConcept Tier 1 error:', e);
      }
    }

    if (isOnline) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const resp = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a concise grammar tutor for language learners. Provide a 3-bullet explanation.' },
              { role: 'user', content: prompt }
            ]
          })
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          const output = data?.choices?.[0]?.message?.content;
          if (output && output.trim()) return output.trim();
        }
      } catch (e) {
        console.warn('explainGrammarConcept Tier 3 error:', e);
      }
    }

    return `Grammar Breakdown for "${text}":\n• Language: ${targetLang === 'de' ? 'German' : 'English'}\n• Focus: Pay attention to verb conjugation, noun gender/case, and clause syntax.\n• Tip: Check the Grammar Reference window for corresponding rules.`;
  }
}
