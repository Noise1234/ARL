/**
 * ARL - Global Application State Manager
 * Coordinates dataset loading, pure SRS scheduling, Dopamine EXP progression,
 * progressive 3-stage hints, and audio synthesis.
 */

import { db } from './db.js';
import { scheduleCard, getQueueStats, isCardDue, isCardMemorized, resetCardSRS } from './srs.js';
import { initI18n, setInterfaceLanguage, getInterfaceLanguage } from './i18n.js';
import { normalizeNFC } from './unicode.js';
import {
  safeAddExp,
  getLevelProgress,
  getStreakMultiplier,
  calculateAwardedExp,
  showFloatingExp,
  EXP_FLASHCARD_BASE
} from './gamification.js';
import { getCardHint } from './hints.js';
import { GeminiClient } from './gemini.js';

class AppState {
  constructor() {
    this.targetLang = 'de'; // 'de' | 'en'
    this.interfaceLang = 'mn'; // 'mn' | 'en' | 'de'
    this.cefrLevel = 'b1'; // 'a1' | 'a2' | 'b1' | 'b2'
    this.reviewMode = 'active'; // 'active' | 'memorized'

    this.cards = [];
    this.cardsMap = new Map();
    this.progressMap = new Map();

    this.studyQueue = [];
    this.currentCardIndex = 0;
    this.isCardRevealed = false;
    this.hintStage = 0; // 0: hidden, 1: gender/class, 2: valency/forms, 3: cloze context
    this.isGrading = false;
    this.isEvaluating = false;

    // Dopamine EXP System
    this.totalExp = 0;
    this.level = 1;

    // Session momentum & velocity tracking
    this.sessionStreak = 0;
    this.sessionReviewedCount = 0;
    this.totalResponseTimeMs = 0;
    this.cardStartTime = Date.now();

    this.listeners = new Set();
    this.i18nLoaded = false;
  }

  // Backward compatibility getter for legacy widgets
  get stats() {
    return {
      streak: this.sessionStreak,
      exp: this.totalExp,
      level: this.level
    };
  }

  async init() {
    // 1. Load preferences and EXP
    try {
      this.targetLang = await db.getSetting('targetLang', 'de');
      this.interfaceLang = await db.getSetting('interfaceLang', 'mn');
      this.cefrLevel = await db.getSetting('cefrLevel', 'b1');
      const savedExp = await db.getSetting('totalExp', 0);
      this.totalExp = (typeof savedExp === 'number' && Number.isFinite(savedExp) && savedExp >= 0)
        ? Math.floor(savedExp)
        : 0;
      this.level = getLevelProgress(this.totalExp).level;
    } catch (err) {
      console.warn('Could not load settings from db:', err);
    }

    // 2. Load i18n dictionary
    if (!this.i18nLoaded && typeof fetch !== 'undefined') {
      try {
        const resp = await fetch('data/i18n.json');
        if (resp.ok) {
          const dict = await resp.json();
          initI18n(dict, this.interfaceLang);
          this.i18nLoaded = true;
        }
      } catch (err) {
        console.warn('Failed to load data/i18n.json:', err);
      }
    } else {
      setInterfaceLanguage(this.interfaceLang);
    }

    // 3. Load progress records defensively
    try {
      const allProgress = await db.getAllProgress();
      this.progressMap.clear();
      if (Array.isArray(allProgress)) {
        for (const p of allProgress) {
          if (p && p.wordId) {
            this.progressMap.set(p.wordId, p);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load progress from db:', err);
    }

    // 4. Load current dataset
    await this.loadActiveDataset();
  }

  async loadActiveDataset() {
    const filePath = `data/${this.targetLang}/vocab_${this.cefrLevel}.json`;
    if (typeof fetch !== 'undefined') {
      try {
        const resp = await fetch(filePath);
        if (resp.ok) {
          const list = await resp.json();
          this.setCards(list);
          return;
        }
      } catch (err) {
        console.warn(`Could not fetch ${filePath}:`, err);
      }
    }
  }

  setCards(cardsList) {
    this.cards = Array.isArray(cardsList) ? cardsList : [];
    this.cardsMap.clear();
    for (const c of this.cards) {
      this.cardsMap.set(c.id, c);
    }
    if (this.reviewMode === 'memorized') {
      this.buildMemorizedQueue();
    } else {
      this.buildStudyQueue();
    }
  }

  buildStudyQueue() {
    this.reviewMode = 'active';
    const now = Date.now();
    const due = [];
    const newCards = [];

    for (const card of this.cards) {
      const prog = this.progressMap.get(card.id);
      if (!prog || !prog.lastStudied) {
        newCards.push(card);
      } else if (isCardDue(prog, now)) {
        due.push(card);
      }
    }

    // Priority: due cards first, then new cards (up to 15 per session batch)
    this.studyQueue = [...due, ...newCards.slice(0, 15)];
    this.currentCardIndex = 0;
    this.isCardRevealed = false;
    this.hintStage = 0;
    this.notify();
  }

  buildMemorizedQueue() {
    this.reviewMode = 'memorized';
    const memorized = [];
    for (const card of this.cards) {
      const prog = this.progressMap.get(card.id);
      if (isCardMemorized(prog)) {
        memorized.push(card);
      }
    }

    // Sort oldest studied first
    memorized.sort((a, b) => {
      const progA = this.progressMap.get(a.id);
      const progB = this.progressMap.get(b.id);
      return (progA?.lastStudied || 0) - (progB?.lastStudied || 0);
    });

    this.studyQueue = memorized;
    this.currentCardIndex = 0;
    this.isCardRevealed = false;
    this.hintStage = 0;
    this.notify();
  }

  toggleReviewMode() {
    if (this.reviewMode === 'active') {
      this.buildMemorizedQueue();
    } else {
      this.buildStudyQueue();
    }
  }

  async resetCurrentCard() {
    if (this.isGrading) return;
    this.isGrading = true;
    try {
      const card = this.getCurrentCard();
      if (!card) return;

      this.stopAudio();

      const existingProg = this.progressMap.get(card.id) || { wordId: card.id };
      const resetProg = resetCardSRS(existingProg, Date.now());

      this.progressMap.set(card.id, resetProg);
      this.currentCardIndex++;
      this.isCardRevealed = false;
      this.hintStage = 0;
      this.notify();

      try {
        await db.saveProgress(resetProg);
      } catch (err) {
        console.warn('Failed to persist reset progress:', err);
      }
    } finally {
      this.isGrading = false;
    }
  }

  async resetMemorizedCards() {
    const now = Date.now();
    const updates = [];
    for (const card of this.cards) {
      const prog = this.progressMap.get(card.id);
      if (isCardMemorized(prog)) {
        const resetProg = resetCardSRS(prog, now);
        this.progressMap.set(card.id, resetProg);
        updates.push(resetProg);
      }
    }
    this.reviewMode = 'active';
    this.buildStudyQueue();
    for (const p of updates) {
      try {
        await db.saveProgress(p);
      } catch (err) {
        console.warn('Failed to persist reset card:', err);
      }
    }
  }

  getCurrentCard() {
    if (this.currentCardIndex >= this.studyQueue.length) {
      return null;
    }
    return this.studyQueue[this.currentCardIndex];
  }

  revealCard() {
    this.isCardRevealed = true;
    this.notify();
  }

  toggleHint() {
    // Cycles 0 (off) -> 1 -> 2 -> 3 -> 0
    this.hintStage = (this.hintStage + 1) % 4;
    this.notify();
  }

  getCurrentHint() {
    const card = this.getCurrentCard();
    if (!card || this.hintStage === 0) return null;
    return getCardHint(card, this.hintStage, this.targetLang);
  }

  // Dopamine EXP Addition
  addExp(amount, options = {}) {
    const safeAmount = (typeof amount === 'number' && Number.isFinite(amount) && amount > 0)
      ? Math.floor(amount)
      : 0;
    if (safeAmount <= 0) return;

    const oldLevel = this.level;
    this.totalExp = safeAddExp(this.totalExp, safeAmount);

    const progress = getLevelProgress(this.totalExp);
    this.level = progress.level;

    // Trigger visual floating dopamine badge
    showFloatingExp(safeAmount, options);

    // Check level up: non-blocking micro-feedback
    if (this.level > oldLevel) {
      showFloatingExp(0, { label: `LEVEL ${this.level}!`, bonus: true });
    }

    // Persist EXP asynchronously
    db.setSetting('totalExp', this.totalExp).catch(err => {
      console.warn('Could not persist totalExp:', err);
    });

    this.notify();
  }

  async gradeCurrentCard(grade) {
    if (this.isGrading) return;
    this.isGrading = true;
    try {
      const card = this.getCurrentCard();
      if (!card || !this.isCardRevealed) return;

      this.stopAudio();

      const existingProg = this.progressMap.get(card.id) || { wordId: card.id };
      const updatedProg = scheduleCard(existingProg, grade, Date.now());

      this.progressMap.set(card.id, updatedProg);

      // Session momentum calculations
      const now = Date.now();
      const elapsed = Math.max(200, now - (this.cardStartTime || now));
      this.totalResponseTimeMs += elapsed;
      this.sessionReviewedCount++;

      if (grade >= 3) {
        this.sessionStreak++;
      } else {
        this.sessionStreak = 0;
      }
      this.cardStartTime = Date.now();

      // Dopamine EXP award
      const basePoints = EXP_FLASHCARD_BASE[grade] || 15;
      const multiplier = getStreakMultiplier(this.sessionStreak);
      const earnedExp = calculateAwardedExp(basePoints, this.sessionStreak);
      const multiplierLabel = multiplier > 1 ? `${multiplier}x Streak` : '';
      this.addExp(earnedExp, { label: multiplierLabel, bonus: grade >= 3 });

      // If graded 1 (Again), requeue to the end of current batch
      if (grade === 1) {
        this.studyQueue.push(card);
      }

      // Advance to next card
      this.currentCardIndex++;
      this.isCardRevealed = false;
      this.hintStage = 0;
      this.notify();

      try {
        await db.saveProgress(updatedProg);
      } catch (err) {
        console.warn('Failed to persist progress:', err);
      }
    } finally {
      this.isGrading = false;
    }
  }

  // Interactive Sentence Evaluation (Rule 4)
  async evaluateGrammarSentence(userSentence, targetTopic = '') {
    if (this.isEvaluating) return null;
    this.isEvaluating = true;
    try {
      const result = await GeminiClient.evaluateSentence(userSentence, targetTopic, this.targetLang);

      // Award EXP based on result
      if (result && result.expBonus > 0) {
        const bonusLabel = result.verdict === 'Perfect!' ? 'Grammar Master' : 'Practice';
        this.addExp(result.expBonus, { label: bonusLabel, bonus: result.verdict === 'Perfect!' });
      }

      return result;
    } finally {
      this.isEvaluating = false;
    }
  }

  playAudio() {
    const card = this.getCurrentCard();
    if (!card) return;

    this.stopAudio();

    const textToSpeak = normalizeNFC(card.word);
    const lang = this.targetLang === 'de' ? 'de-DE' : 'en-US';

    if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.speak === 'function') {
      window.AndroidBridge.speak(textToSpeak, lang);
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang;
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  }

  stopAudio() {
    if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.stopAudio === 'function') {
      window.AndroidBridge.stopAudio();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  getQueueStats() {
    return getQueueStats(this.cards, this.progressMap, Date.now());
  }

  getSessionStats() {
    const avgSec = this.sessionReviewedCount > 0
      ? (this.totalResponseTimeMs / this.sessionReviewedCount / 1000).toFixed(1)
      : '0.0';
    return {
      streak: this.sessionStreak,
      reviewed: this.sessionReviewedCount,
      avgSpeed: avgSec,
      multiplier: getStreakMultiplier(this.sessionStreak)
    };
  }

  getLevelStats() {
    return getLevelProgress(this.totalExp);
  }

  // Legacy Guard Methods for Retention / Quiz
  isRetentionCheckDue() {
    return false;
  }

  getRetentionEligibleWords() {
    return [];
  }

  getRandomDistractors(targetWord, count = 3) {
    const distractors = [];
    for (const c of this.cards) {
      if (c.word !== targetWord && !distractors.includes(c.word)) {
        distractors.push(c.word);
        if (distractors.length >= count) break;
      }
    }
    return distractors;
  }

  async setTargetLanguage(lang) {
    if (['de', 'en'].includes(lang) && lang !== this.targetLang) {
      this.targetLang = lang;
      await db.setSetting('targetLang', lang);
      await this.loadActiveDataset();
    }
  }

  async toggleTargetLanguage() {
    const nextLang = this.targetLang === 'de' ? 'en' : 'de';
    await this.setTargetLanguage(nextLang);
  }

  async setInterfaceLanguage(lang) {
    if (['mn', 'en', 'de'].includes(lang)) {
      this.interfaceLang = lang;
      setInterfaceLanguage(lang);
      await db.setSetting('interfaceLang', lang);
      this.notify();
    }
  }

  async cycleInterfaceLanguage() {
    const order = ['mn', 'en', 'de'];
    const next = order[(order.indexOf(this.interfaceLang) + 1) % order.length];
    await this.setInterfaceLanguage(next);
  }

  async setCefrLevel(lvl) {
    const cleanLvl = String(lvl).toLowerCase();
    if (['a1', 'a2', 'b1', 'b2'].includes(cleanLvl) && cleanLvl !== this.cefrLevel) {
      this.cefrLevel = cleanLvl;
      await db.setSetting('cefrLevel', cleanLvl);
      await this.loadActiveDataset();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const fn of this.listeners) {
      try {
        fn();
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    }
  }
}

export const state = new AppState();
