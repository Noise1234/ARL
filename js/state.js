/**
 * ARL - Global Application State Manager
 * Coordinates dataset loading, pure SRS scheduling, queue management, and audio synthesis.
 */

import { db } from './db.js';
import { scheduleCard, getQueueStats, isCardDue } from './srs.js';
import { initI18n, setInterfaceLanguage, getInterfaceLanguage } from './i18n.js';
import { normalizeNFC } from './unicode.js';

class AppState {
  constructor() {
    this.targetLang = 'de'; // 'de' | 'en'
    this.interfaceLang = 'mn'; // 'mn' | 'en' | 'de'
    this.cefrLevel = 'b1'; // 'a1' | 'a2' | 'b1' | 'b2'

    this.cards = [];
    this.cardsMap = new Map();
    this.progressMap = new Map();

    this.studyQueue = [];
    this.currentCardIndex = 0;
    this.isCardRevealed = false;
    this.showHint = false;
    this.isGrading = false;

    this.listeners = new Set();
    this.i18nLoaded = false;
  }

  async init() {
    // 1. Load preferences
    try {
      this.targetLang = await db.getSetting('targetLang', 'de');
      this.interfaceLang = await db.getSetting('interfaceLang', 'mn');
      this.cefrLevel = await db.getSetting('cefrLevel', 'b1');
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
    this.buildStudyQueue();
  }

  buildStudyQueue() {
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
    this.showHint = false;
    this.notify();
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
    this.showHint = !this.showHint;
    this.notify();
  }

  async gradeCurrentCard(grade) {
    if (this.isGrading) return;
    this.isGrading = true;
    try {
      const card = this.getCurrentCard();
      if (!card || !this.isCardRevealed) return;

      // Defensive audio cancellation
      this.stopAudio();

      const existingProg = this.progressMap.get(card.id) || { wordId: card.id };
      const updatedProg = scheduleCard(existingProg, grade, Date.now());

      // Update in-memory map synchronously
      this.progressMap.set(card.id, updatedProg);

      // If graded 1 (Again), requeue to the end of current batch
      if (grade === 1) {
        this.studyQueue.push(card);
      }

      // Advance to next card synchronously BEFORE any async storage operation
      this.currentCardIndex++;
      this.isCardRevealed = false;
      this.showHint = false;
      this.notify();

      // Persist in background asynchronously without blocking UI responsiveness
      try {
        await db.saveProgress(updatedProg);
      } catch (err) {
        console.warn('Failed to persist progress:', err);
      }
    } finally {
      this.isGrading = false;
    }
  }

  playAudio() {
    const card = this.getCurrentCard();
    if (!card || typeof window === 'undefined' || !window.speechSynthesis) return;

    this.stopAudio();

    const textToSpeak = card.word;
    const utterance = new SpeechSynthesisUtterance(normalizeNFC(textToSpeak));
    utterance.lang = this.targetLang === 'de' ? 'de-DE' : 'en-US';
    utterance.rate = 0.92; // Slightly measured rate for maximum pedagogical clarity

    window.speechSynthesis.speak(utterance);
  }

  stopAudio() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  getQueueStats() {
    return getQueueStats(this.cards, this.progressMap, Date.now());
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
