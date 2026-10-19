import { db } from './db.js';

class StateManager {
  constructor() {
    this.words = [];
    this.wordsMap = new Map();
    this.progressMap = new Map();
    this.stats = {
      streak: 0,
      lastActiveDate: null,
      lastRetentionCheckDate: null,
      batchSize: 15
    };
    this.listeners = new Set();
  }

  async loadInitialData() {
    // 1. Fetch built-in words if empty
    const count = await db.getWordsCount();
    if (count === 0) {
      try {
        const resp = await fetch('data/b1_words.json');
        if (resp.ok) {
          const defaultWords = await resp.json();
          await db.seedWordsIfEmpty(defaultWords);
        }
      } catch (err) {
        console.warn('Could not fetch data/b1_words.json, will check local storage:', err);
      }
    }

    // 2. Load all words into memory
    this.words = await db.getAllWords();
    this.wordsMap.clear();
    for (const w of this.words) {
      this.wordsMap.set(w.id, w);
    }

    // 3. Load user progress
    const progressList = await db.getAllProgress();
    this.progressMap.clear();
    for (const p of progressList) {
      this.progressMap.set(p.wordId, p);
    }

    // 4. Load stats
    this.stats = await db.getStats();
    this.verifyStreak();

    this.notify();
  }

  getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  getYesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  verifyStreak() {
    const today = this.getTodayStr();
    const yesterday = this.getYesterdayStr();

    if (!this.stats.lastActiveDate) {
      this.stats.streak = 0;
    } else if (this.stats.lastActiveDate !== today && this.stats.lastActiveDate !== yesterday) {
      // Skipped at least one full day
      this.stats.streak = 0;
    }
  }

  async recordActivity() {
    const today = this.getTodayStr();
    const yesterday = this.getYesterdayStr();

    if (this.stats.lastActiveDate === today) {
      // Already active today, streak unchanged
      return this.stats.streak;
    }

    if (this.stats.lastActiveDate === yesterday) {
      this.stats.streak = (this.stats.streak || 0) + 1;
    } else {
      this.stats.streak = 1;
    }

    this.stats.lastActiveDate = today;
    await db.saveStats(this.stats);
    this.notify();
    return this.stats.streak;
  }

  async markRetentionCheckPassed() {
    this.stats.lastRetentionCheckDate = this.getTodayStr();
    await this.recordActivity();
    await db.saveStats(this.stats);
    this.notify();
  }

  isRetentionCheckDue() {
    const today = this.getTodayStr();
    if (this.stats.lastRetentionCheckDate === today) {
      return false;
    }
    // Check if user has studied words on prior days or has any progress
    const pastWords = this.getRetentionEligibleWords();
    return pastWords.length >= 3;
  }

  getRetentionEligibleWords() {
    const today = this.getTodayStr();
    const eligible = [];

    for (const [wordId, prog] of this.progressMap.entries()) {
      if (prog.lastStudied) {
        const studiedDate = new Date(prog.lastStudied);
        const studiedDateStr = `${studiedDate.getFullYear()}-${String(studiedDate.getMonth() + 1).padStart(2, '0')}-${String(studiedDate.getDate()).padStart(2, '0')}`;
        
        // If studied on a previous day or memorized
        if (studiedDateStr < today || prog.status === 'memorized') {
          const word = this.wordsMap.get(wordId);
          if (word) {
            eligible.push({ word, prog });
          }
        }
      }
    }

    // Sort by most recently studied or prioritized
    eligible.sort((a, b) => (b.prog.lastStudied || 0) - (a.prog.lastStudied || 0));
    return eligible.map(e => e.word);
  }

  // Get words for a new study batch
  getBatchWords(size = null) {
    const batchSize = size || this.stats.batchSize || 15;
    const learningWords = [];
    const newWords = [];

    for (const w of this.words) {
      const prog = this.progressMap.get(w.id);
      if (!prog || prog.status === 'new') {
        newWords.push(w);
      } else if (prog.status === 'learning') {
        learningWords.push(w);
      }
    }

    // Prioritize words that are still in "learning" status, then fill with new words
    const batch = [...learningWords.slice(0, batchSize)];
    const needed = batchSize - batch.length;
    if (needed > 0) {
      batch.push(...newWords.slice(0, needed));
    }

    return batch;
  }

  // Get distractors for MCQ
  getRandomDistractors(targetWord, count = 3) {
    const samePos = this.words.filter(w => w.id !== targetWord.id && w.pos === targetWord.pos);
    const pool = samePos.length >= count ? samePos : this.words.filter(w => w.id !== targetWord.id);
    
    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Update single word progress
  async setWordStatus(wordId, status) {
    const updated = await db.updateWordProgress(wordId, status);
    this.progressMap.set(wordId, updated);
    this.notify();
  }

  // Add custom word
  async addCustomWord(customWordData) {
    const saved = await db.saveCustomWord(customWordData);
    this.words.unshift(saved);
    this.wordsMap.set(saved.id, saved);
    this.notify();
    return saved;
  }

  // Progress overview metrics
  getProgressStats() {
    let memorized = 0;
    let learning = 0;
    for (const p of this.progressMap.values()) {
      if (p.status === 'memorized') memorized++;
      else if (p.status === 'learning') learning++;
    }
    const total = this.words.length;
    const unstudied = Math.max(0, total - (memorized + learning));
    const percent = total > 0 ? Math.round((memorized / total) * 100) : 0;

    return {
      total,
      memorized,
      learning,
      unstudied,
      percent,
      streak: this.stats.streak || 0
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }
}

export const state = new StateManager();
