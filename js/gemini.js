/**
 * ARL - Multi-Tier Resilient AI Grammar & Sentence Check Pipeline
 * Tier 1: User-Configured Gemini 2.5 Flash API Key (if saved)
 * Tier 2A: Free Zero-Key Pollinations AI LLM Endpoint (openai model, JSON mode)
 * Tier 2B: Free Zero-Key LanguageTool Public Grammar API (character offset diffing)
 * Tier 3: Local Deterministic Linguistic Rule Engine (100% offline fallback)
 */

import { evaluateRuleFallback } from './grammar-fallback.js';
import { computeDiff, renderColorCodedDiff } from './diff.js';

/**
 * Sanitized JSON parser that safely strips markdown code fences,
 * extracts JSON structures, validates the schema, and never throws.
 * @param {string} rawText
 * @returns {object|null}
 */
export function safeParseAiJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  // Strip markdown fences if present
  let cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Find bounding braces
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[0]);
    if (!parsed || typeof parsed !== 'object') return null;

    // Normalize verdict
    let verdict = 'Needs Correction';
    const rawVerdict = String(parsed.verdict || '').toLowerCase().trim();
    if (rawVerdict.includes('perfect') || rawVerdict.includes('flawless') || rawVerdict === 'correct' || rawVerdict.startsWith('correct')) {
      verdict = 'Perfect!';
    } else if (rawVerdict.includes('almost') || rawVerdict.includes('good') || rawVerdict.includes('minor') || rawVerdict.includes('warn')) {
      verdict = 'Almost There';
    } else {
      verdict = 'Needs Correction';
    }

    const correctedSentence = String(parsed.correctedSentence || parsed.corrected || '').trim();
    if (!correctedSentence) return null;

    const why = String(parsed.why || parsed.explanation || 'Grammar verified.').trim();
    const naturalAlternative = String(parsed.naturalAlternative || correctedSentence).trim();

    let expBonus = Number(parsed.expBonus);
    if (!Number.isFinite(expBonus) || expBonus <= 0) {
      expBonus = verdict === 'Perfect!' ? 50 : (verdict === 'Almost There' ? 35 : 15);
    } else {
      expBonus = Math.max(15, Math.min(50, Math.floor(expBonus)));
    }

    const diff = Array.isArray(parsed.diff) ? parsed.diff : null;

    return {
      verdict,
      correctedSentence,
      why,
      naturalAlternative,
      expBonus,
      diff
    };
  } catch (err) {
    console.warn('safeParseAiJson parsing failed:', err);
    return null;
  }
}

export class GeminiClient {
  static STORAGE_KEY = 'arl_gemini_api_key';

  static getApiKey() {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(this.STORAGE_KEY) || '';
      }
    } catch (e) {
      console.warn('Could not read API key from localStorage:', e);
    }
    return '';
  }

  static setApiKey(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        if (!key || !key.trim()) {
          localStorage.removeItem(this.STORAGE_KEY);
        } else {
          localStorage.setItem(this.STORAGE_KEY, key.trim());
        }
      }
    } catch (e) {
      console.warn('Could not save API key to localStorage:', e);
    }
  }

  static hasApiKey() {
    return Boolean(this.getApiKey().trim());
  }

  /**
   * Resilient 3-Tier Sentence Evaluator:
   * Tier 1 -> Custom API Key (Gemini 2.5 Flash)
   * Tier 2A -> Pollinations AI (Free LLM)
   * Tier 2B -> LanguageTool API (Free Grammar NLP)
   * Tier 3 -> Deterministic Local Rule Engine (Offline)
   */
  static async evaluateSentence(userSentence, targetTopic = '', targetLang = 'de', expectedSentence = '') {
    const trimmedInput = String(userSentence ?? '').trim();
    if (!trimmedInput) {
      const fallback = evaluateRuleFallback('', targetTopic, targetLang, expectedSentence);
      return {
        ...fallback,
        apiStatus: 'ai-tier3-local',
        apiBadge: '[Local Checker]',
        errorMessage: null,
        diffHtml: '<span class="diff-error">Empty input</span>'
      };
    }

    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

    // If completely offline, immediately evaluate via Tier 3 Local Engine
    if (!isOnline) {
      const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang, expectedSentence);
      return {
        ...fallback,
        apiStatus: 'ai-tier3-local',
        apiBadge: '[Offline Rule Check]',
        errorMessage: 'Offline mode active. Evaluated via deterministic local engine.',
        diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
      };
    }

    // =========================================================================
    // TIER 1: User-Configured Custom API Key (Gemini 2.5 Flash)
    // =========================================================================
    const apiKey = this.getApiKey();
    if (apiKey) {
      const tier1Result = await this.callTier1Gemini(trimmedInput, targetTopic, targetLang, expectedSentence, apiKey);
      if (tier1Result) return tier1Result;
    }

    // =========================================================================
    // TIER 2A: Primary Free LLM Endpoint (Pollinations AI)
    // =========================================================================
    const tier2aResult = await this.callTier2aPollinations(trimmedInput, targetTopic, targetLang, expectedSentence);
    if (tier2aResult) return tier2aResult;

    // =========================================================================
    // TIER 2B: Secondary Free Grammar Endpoint (LanguageTool API)
    // =========================================================================
    const tier2bResult = await this.callTier2bLanguageTool(trimmedInput, targetTopic, targetLang, expectedSentence);
    if (tier2bResult) return tier2bResult;

    // =========================================================================
    // TIER 3: Local Deterministic Rule Engine (Zero Network Dependency)
    // =========================================================================
    console.warn('Network tiers exhausted or failed. Falling back to Tier 3 Local Deterministic Engine.');
    const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang, expectedSentence);
    return {
      ...fallback,
      apiStatus: 'ai-tier3-local',
      apiBadge: '[Offline Rule Check]',
      errorMessage: 'Network endpoints unavailable. Evaluated via deterministic local engine.',
      diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
    };
  }

  /**
   * Tier 1: Gemini 2.5 Flash API with 10s AbortController timeout
   */
  static async callTier1Gemini(trimmedInput, targetTopic, targetLang, expectedSentence, apiKey) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const systemPrompt = `You are a pedagogical language tutor auditing a student sentence in ${targetLang === 'de' ? 'German' : 'English'}.
Target Grammar Topic: "${targetTopic || 'General Grammar'}".
${expectedSentence ? `Target Expected Construction: "${expectedSentence}".` : ''}
Student Sentence: "${trimmedInput}".

Analyze grammar correctness, word order, verb position, case governance, and German capitalization.
Respond ONLY with a valid JSON object matching this exact schema (no markdown, no code fences):
{
  "verdict": "Perfect!" | "Almost There" | "Needs Correction",
  "correctedSentence": "clean corrected sentence",
  "why": "1-2 sentence concise pedagogical explanation of the rule applied",
  "naturalAlternative": "how an educated native speaker would phrase this naturally",
  "expBonus": 50 for Perfect!, 35 for Almost There, 15 for Needs Correction,
  "diff": [
    {
      "text": "segment text exactly from student sentence",
      "type": "correct" | "misplaced" | "error",
      "detail": "reason for correction or position change"
    }
  ]
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 600,
            responseMimeType: 'application/json'
          }
        })
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        console.warn(`Tier 1 Gemini returned HTTP ${resp.status}. Falling back to Tier 2.`);
        return null;
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = safeParseAiJson(rawText);
      if (!parsed) {
        console.warn('Tier 1 Gemini returned malformed JSON. Falling back to Tier 2.');
        return null;
      }

      const diffContext = {
        why: parsed.why,
        diff: parsed.diff
      };

      return {
        verdict: parsed.verdict,
        correctedSentence: parsed.correctedSentence,
        why: parsed.why,
        naturalAlternative: parsed.naturalAlternative,
        expBonus: parsed.expBonus,
        apiStatus: 'ai-tier1-gemini',
        apiBadge: '[Custom Gemini API]',
        errorMessage: null,
        diffHtml: renderColorCodedDiff(trimmedInput, parsed.correctedSentence, diffContext)
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Tier 1 Gemini error: ${err.message || err}. Falling back to Tier 2.`);
      return null;
    }
  }

  /**
   * Tier 2A: Free Zero-Key Pollinations AI Endpoint with 10s AbortController timeout
   */
  static async callTier2aPollinations(trimmedInput, targetTopic, targetLang, expectedSentence) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const langName = targetLang === 'de' ? 'German' : 'English';
    const systemPrompt = `You are an expert language teacher for ${langName}. Output strictly valid JSON matching this schema:
{
  "verdict": "Perfect!" | "Almost There" | "Needs Correction",
  "correctedSentence": "clean corrected sentence",
  "why": "concise explanation of grammar, case, and word-order rules applied",
  "naturalAlternative": "natural native phrasing",
  "expBonus": 50 for Perfect!, 35 for Almost There, 15 for Needs Correction
}`;

    const userPrompt = `Target Grammar Topic: "${targetTopic || 'General'}".
${expectedSentence ? `Target Expected Sentence: "${expectedSentence}".` : ''}
Student Sentence: "${trimmedInput}".
Analyze, correct, and return JSON:`;

    try {
      const resp = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'openai',
          jsonMode: true
        })
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        console.warn(`Tier 2A Pollinations returned HTTP ${resp.status}. Falling back to Tier 2B.`);
        return null;
      }

      const rawText = await resp.text();
      const parsed = safeParseAiJson(rawText);
      if (!parsed) {
        console.warn('Tier 2A Pollinations returned unparseable text. Falling back to Tier 2B.');
        return null;
      }

      return {
        verdict: parsed.verdict,
        correctedSentence: parsed.correctedSentence,
        why: parsed.why,
        naturalAlternative: parsed.naturalAlternative,
        expBonus: parsed.expBonus,
        apiStatus: 'ai-tier2-pollinations',
        apiBadge: '[Pollinations AI]',
        errorMessage: null,
        diffHtml: renderColorCodedDiff(trimmedInput, parsed.correctedSentence, { why: parsed.why })
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Tier 2A Pollinations error: ${err.message || err}. Falling back to Tier 2B.`);
      return null;
    }
  }

  /**
   * Tier 2B: Free Zero-Key LanguageTool API with 10s AbortController timeout
   */
  static async callTier2bLanguageTool(trimmedInput, targetTopic, targetLang, expectedSentence) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const langCode = targetLang === 'de' ? 'de-DE' : 'en-US';

    try {
      const resp = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: controller.signal,
        body: `text=${encodeURIComponent(trimmedInput)}&language=${langCode}`
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        console.warn(`Tier 2B LanguageTool returned HTTP ${resp.status}. Falling back to Tier 3.`);
        return null;
      }

      const data = await resp.json();
      const matches = Array.isArray(data?.matches) ? data.matches : [];

      if (matches.length === 0) {
        // Run local deterministic check to ensure no nuance was missed
        const local = evaluateRuleFallback(trimmedInput, targetTopic, targetLang, expectedSentence);
        if (local.verdict !== 'Perfect!') {
          return {
            ...local,
            apiStatus: 'ai-tier2-languagetool',
            apiBadge: '[LanguageTool + Local]',
            errorMessage: null
          };
        }

        return {
          verdict: 'Perfect!',
          correctedSentence: trimmedInput,
          why: 'LanguageTool verified: No grammar or spelling errors detected.',
          naturalAlternative: trimmedInput,
          expBonus: 50,
          apiStatus: 'ai-tier2-languagetool',
          apiBadge: '[LanguageTool]',
          errorMessage: null,
          diffHtml: `<span class="diff-correct">${trimmedInput}</span>`
        };
      }

      // Apply matches in reverse offset order to maintain valid indices
      let fixed = trimmedInput;
      const sorted = [...matches].sort((a, b) => b.offset - a.offset);
      const whyItems = [];

      for (const m of sorted) {
        if (m.replacements && m.replacements.length > 0) {
          const repl = m.replacements[0].value;
          fixed = fixed.slice(0, m.offset) + repl + fixed.slice(m.offset + m.length);
        }
        if (m.message && !whyItems.includes(m.message)) {
          whyItems.push(m.message);
        }
      }

      // Run local rule engine on the fixed result to catch any compound cases
      const refinedLocal = evaluateRuleFallback(fixed, targetTopic, targetLang, expectedSentence);
      if (refinedLocal.correctedSentence && refinedLocal.correctedSentence !== fixed) {
        fixed = refinedLocal.correctedSentence;
        if (refinedLocal.why) whyItems.push(refinedLocal.why);
      }

      const why = whyItems.length > 0 ? whyItems.slice(0, 3).join(' ') : 'Grammar corrections applied via LanguageTool.';

      return {
        verdict: 'Needs Correction',
        correctedSentence: fixed,
        why,
        naturalAlternative: fixed,
        expBonus: 15,
        apiStatus: 'ai-tier2-languagetool',
        apiBadge: '[LanguageTool]',
        errorMessage: null,
        diffHtml: renderColorCodedDiff(trimmedInput, fixed, { why })
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Tier 2B LanguageTool error: ${err.message || err}. Falling back to Tier 3.`);
      return null;
    }
  }

  /**
   * Explains a highlighted grammar concept or phrase using AI or local rule summary.
   */
  static async explainGrammarConcept(selectedText, targetLang = 'de') {
    const text = String(selectedText ?? '').trim();
    if (!text) return 'Please select a phrase or sentence to explain.';

    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
    const apiKey = this.getApiKey();

    const prompt = `You are a concise grammar tutor for students learning ${targetLang === 'de' ? 'German' : 'English'} (with Mongolian translations/explanations).
Explain the grammar structure, case/conjugation, or syntax rules in this excerpt:
"${text}"
Keep your explanation concise (3-4 bullet points), clear, and pedagogical. Include Mongolian explanations where helpful.`;

    // Try Tier 1 Gemini if key present
    if (apiKey && isOnline) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
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
      } catch (e) {
        console.warn('explainGrammarConcept Tier 1 error:', e);
      }
    }

    // Try Tier 2A Pollinations if online
    if (isOnline) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const resp = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a concise grammar tutor for language learners. Provide a 3-bullet explanation.' },
              { role: 'user', content: prompt }
            ],
            model: 'openai'
          })
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const output = await resp.text();
          if (output && output.trim()) return output.trim();
        }
      } catch (e) {
        console.warn('explainGrammarConcept Tier 2 error:', e);
      }
    }

    // Fallback local breakdown
    return `Grammar Breakdown for "${text}":\n• Language: ${targetLang === 'de' ? 'German' : 'English'}\n• Focus: Pay attention to verb conjugation, noun gender/case, and clause syntax.\n• Tip: Check the Grammar Reference window for corresponding rules.`;
  }
}
