/**
 * ARL - Client-Side Gemini Free Tier API Integration
 * Connects directly to Google Gemini 2.5 Flash (`gemini-2.5-flash`)
 * for instant, intelligent sentence correction with offline rule-based fallback
 * and visual color-coded mistake/misplacement diff highlighting.
 */

import { evaluateRuleFallback } from './grammar-fallback.js';
import { computeDiff, renderColorCodedDiff } from './diff.js';

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
   * Evaluates a user sentence against the target grammar rule.
   * Uses Gemini 2.5 Flash if an API key is available and online;
   * otherwise seamlessly falls back to the deterministic local rule engine.
   * Always attaches structured diffHtml and informative API status indicators.
   */
  static async evaluateSentence(userSentence, targetTopic = '', targetLang = 'de') {
    const trimmedInput = String(userSentence ?? '').trim();
    if (!trimmedInput) {
      const fallback = evaluateRuleFallback('', targetTopic, targetLang);
      return {
        ...fallback,
        apiStatus: 'local',
        errorMessage: null,
        diffHtml: '<span class="diff-error">Empty input</span>'
      };
    }

    const apiKey = this.getApiKey();
    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

    // 1. If offline or no key configured, run local rule engine instantly
    if (!apiKey) {
      const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
      return {
        ...fallback,
        apiStatus: 'ai-fallback-missing-key',
        errorMessage: 'No Gemini API key configured. Evaluated via deterministic local validator.',
        diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
      };
    }

    if (!isOnline) {
      const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
      return {
        ...fallback,
        apiStatus: 'ai-fallback-offline',
        errorMessage: 'Offline mode active. Evaluated via deterministic local validator.',
        diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
      };
    }

    // 2. Online request with 8000ms abort deadline
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const systemPrompt = `You are a pedagogical language tutor auditing a student sentence in ${targetLang === 'de' ? 'German' : 'English'}.
Target Grammar Topic: "${targetTopic || 'General Grammar'}".
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

    let apiStatus = 'ai-success';
    let errorMessage = null;

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
            responseMimeType: 'application/json'
          }
        })
      });

      clearTimeout(timeoutId);

      // Handle HTTP status edge cases (invalid key, quota limit, etc.)
      if (resp.status === 400 || resp.status === 403) {
        errorMessage = 'Invalid Gemini API key or unauthorized project (HTTP 400/403). Falling back to local validator.';
        console.warn(errorMessage);
        const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
        return {
          ...fallback,
          apiStatus: 'ai-fallback-invalid-key',
          errorMessage,
          diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
        };
      }

      if (resp.status === 429) {
        errorMessage = 'Gemini API free tier rate limit reached (HTTP 429). Falling back to local validator.';
        console.warn(errorMessage);
        const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
        return {
          ...fallback,
          apiStatus: 'ai-fallback-rate-limited',
          errorMessage,
          diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
        };
      }

      if (!resp.ok) {
        errorMessage = `Gemini API returned status ${resp.status}. Falling back to local validator.`;
        console.warn(errorMessage);
        const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
        return {
          ...fallback,
          apiStatus: 'ai-fallback-error',
          errorMessage,
          diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
        };
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
        return {
          ...fallback,
          apiStatus: 'ai-fallback-empty',
          errorMessage: 'Empty AI response. Falling back to local validator.',
          diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
        };
      }

      // Robust JSON extraction
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
        return {
          ...fallback,
          apiStatus: 'ai-fallback-parse-error',
          errorMessage: 'Failed to parse AI response JSON. Falling back to local validator.',
          diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validVerdicts = ['Perfect!', 'Almost There', 'Needs Correction'];
      const verdict = validVerdicts.includes(parsed.verdict) ? parsed.verdict : 'Almost There';
      const expBonus = Number.isFinite(parsed.expBonus)
        ? Math.max(15, Math.min(50, Math.floor(parsed.expBonus)))
        : (verdict === 'Perfect!' ? 50 : (verdict === 'Almost There' ? 35 : 15));

      const correctedSentence = String(parsed.correctedSentence || trimmedInput).trim();
      const why = String(parsed.why || 'Grammar checked successfully.').trim();
      const naturalAlternative = String(parsed.naturalAlternative || trimmedInput).trim();

      const diffContext = {
        why,
        diff: Array.isArray(parsed.diff) ? parsed.diff : null
      };

      const diffHtml = renderColorCodedDiff(trimmedInput, correctedSentence, diffContext);

      return {
        verdict,
        correctedSentence,
        why,
        naturalAlternative,
        expBonus,
        apiStatus,
        errorMessage: null,
        diffHtml
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const isAbort = err.name === 'AbortError';
      const msg = isAbort
        ? 'Gemini request timed out (8s limit). Falling back to local validator.'
        : `Network/API error: ${err.message || err}. Falling back to local validator.`;
      console.warn(msg);

      const fallback = evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
      return {
        ...fallback,
        apiStatus: 'ai-fallback-network-error',
        errorMessage: msg,
        diffHtml: renderColorCodedDiff(trimmedInput, fallback.correctedSentence, { why: fallback.why })
      };
    }
  }

  /**
   * Explains a highlighted grammar concept or phrase using Gemini AI or local rule summary.
   */
  static async explainGrammarConcept(selectedText, targetLang = 'de') {
    const text = String(selectedText ?? '').trim();
    if (!text) return 'Please select a phrase or sentence to explain.';

    const apiKey = this.getApiKey();
    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;

    if (!apiKey || !isOnline) {
      return `Grammar Breakdown for "${text}":\n• Language: ${targetLang === 'de' ? 'German' : 'English'}\n• Focus: Pay attention to verb conjugation, noun gender/case, and clause syntax.\n• Tip: Check the Grammar Reference window for corresponding rules.`;
    }

    const prompt = `You are a concise grammar tutor for students learning ${targetLang === 'de' ? 'German' : 'English'} (with Mongolian translations/explanations).
Explain the grammar structure, case/conjugation, or syntax rules in this excerpt:
"${text}"
Keep your explanation concise (3-4 bullet points), clear, and pedagogical. Include Mongolian explanations where helpful.`;

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
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 350
          }
        })
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (output) return output;
      }
    } catch (e) {
      console.warn('explainGrammarConcept error:', e);
    }

    return `Grammar Breakdown for "${text}":\n• Focus: Verb position, word order, and agreement.\n• Tip: Open the Grammar PiP for the corresponding grammatical rule.`;
  }
}
