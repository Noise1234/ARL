/**
 * ARL - Client-Side Gemini Free Tier API Integration
 * Connects directly to Google Gemini 2.5 Flash (`gemini-2.5-flash`)
 * for instant, intelligent sentence correction with offline rule-based fallback.
 */

import { evaluateRuleFallback } from './grammar-fallback.js';

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
   */
  static async evaluateSentence(userSentence, targetTopic = '', targetLang = 'de') {
    const trimmedInput = String(userSentence ?? '').trim();
    if (!trimmedInput) {
      return evaluateRuleFallback('', targetTopic, targetLang);
    }

    const apiKey = this.getApiKey();

    // 1. If offline or no key configured, run local rule engine instantly
    const isOnline = typeof navigator === 'undefined' || navigator.onLine !== false;
    if (!apiKey || !isOnline) {
      return evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
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
  "expBonus": 50 for Perfect!, 35 for Almost There, 15 for Needs Correction
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
            maxOutputTokens: 350,
            responseMimeType: 'application/json'
          }
        })
      });

      clearTimeout(timeoutId);

      // Handle HTTP status edge cases (invalid key, quota limit, etc.)
      if (resp.status === 400 || resp.status === 403) {
        console.warn(`Gemini API key error (${resp.status}), falling back to local validator.`);
        return evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
      }
      if (resp.status === 429) {
        console.warn('Gemini free tier quota reached (429), falling back seamlessly.');
        return evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
      }
      if (!resp.ok) {
        console.warn(`Gemini API returned status ${resp.status}, falling back.`);
        return evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
      }

      const data = await resp.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
      }

      // Robust JSON extraction (handles optional code fences or leading text)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validVerdicts = ['Perfect!', 'Almost There', 'Needs Correction'];
      const verdict = validVerdicts.includes(parsed.verdict) ? parsed.verdict : 'Almost There';
      const expBonus = Number.isFinite(parsed.expBonus)
        ? Math.max(15, Math.min(50, Math.floor(parsed.expBonus)))
        : (verdict === 'Perfect!' ? 50 : (verdict === 'Almost There' ? 35 : 15));

      return {
        verdict,
        correctedSentence: String(parsed.correctedSentence || trimmedInput).trim(),
        why: String(parsed.why || 'Grammar checked successfully.').trim(),
        naturalAlternative: String(parsed.naturalAlternative || trimmedInput).trim(),
        expBonus
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Gemini request failed, using local rule fallback:', err.name || err);
      return evaluateRuleFallback(trimmedInput, targetTopic, targetLang);
    }
  }
}
