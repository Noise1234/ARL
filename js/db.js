// IndexedDB storage layer with localStorage fallback and export/import
const DB_NAME = 'arl_db';
const DB_VERSION = 1;

class ARLDatabase {
  constructor() {
    this.db = null;
    this.isReady = false;
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store for words (built-in B1 + custom user words)
        if (!db.objectStoreNames.contains('words')) {
          const wordStore = db.createObjectStore('words', { keyPath: 'id' });
          wordStore.createIndex('pos', 'pos', { unique: false });
          wordStore.createIndex('topic', 'topic', { unique: false });
          wordStore.createIndex('isCustom', 'isCustom', { unique: false });
        }

        // Store for user progress & SRS state
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'wordId' });
          progressStore.createIndex('status', 'status', { unique: false });
          progressStore.createIndex('lastStudied', 'lastStudied', { unique: false });
        }

        // Store for user profile, streaks, and settings
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isReady = true;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Populate words if empty
  async seedWordsIfEmpty(wordsList) {
    await this.init();
    const count = await this.getWordsCount();
    if (count === 0 && wordsList && wordsList.length > 0) {
      const tx = this.db.transaction('words', 'readwrite');
      const store = tx.objectStore('words');
      for (const w of wordsList) {
        store.put(w);
      }
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    }
    return false;
  }

  async getWordsCount() {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction('words', 'readonly');
      const req = tx.objectStore('words').count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
  }

  async getAllWords() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('words', 'readonly');
      const req = tx.objectStore('words').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveCustomWord(customWord) {
    await this.init();
    const wordEntry = {
      id: customWord.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      word: customWord.word.trim(),
      article: customWord.article || null,
      plural: customWord.plural || null,
      display: customWord.display || customWord.word.trim(),
      pos: customWord.pos || 'noun',
      mn: customWord.mn.trim(),
      example_de: customWord.example_de ? customWord.example_de.trim() : '',
      example_mn: customWord.example_mn ? customWord.example_mn.trim() : '',
      topic: customWord.topic || 'Custom',
      level: 'B1+',
      isCustom: true,
      createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('words', 'readwrite');
      const req = tx.objectStore('words').put(wordEntry);
      req.onsuccess = () => resolve(wordEntry);
      req.onerror = () => reject(req.error);
    });
  }

  // Progress Methods
  async getProgress(wordId) {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction('progress', 'readonly');
      const req = tx.objectStore('progress').get(wordId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async getAllProgress() {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('progress', 'readonly');
      const req = tx.objectStore('progress').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async updateWordProgress(wordId, status) {
    // status: 'memorized' | 'learning'
    await this.init();
    const existing = (await this.getProgress(wordId)) || {
      wordId,
      status: 'new',
      timesMemorized: 0,
      timesReviewed: 0,
      history: []
    };

    const now = Date.now();
    const updated = {
      ...existing,
      status: status,
      lastStudied: now,
      timesReviewed: (existing.timesReviewed || 0) + 1,
      timesMemorized: status === 'memorized' ? (existing.timesMemorized || 0) + 1 : (existing.timesMemorized || 0),
      history: [...(existing.history || []).slice(-20), { date: now, status }]
    };

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('progress', 'readwrite');
      const req = tx.objectStore('progress').put(updated);
      req.onsuccess = () => resolve(updated);
      req.onerror = () => reject(req.error);
    });
  }

  // Stats & Streak Methods
  async getStats() {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction('stats', 'readonly');
      const req = tx.objectStore('stats').get('user_stats');
      req.onsuccess = () => {
        const stats = req.result ? req.result.data : null;
        resolve(stats || {
          streak: 0,
          lastActiveDate: null,
          lastRetentionCheckDate: null,
          batchSize: 15,
          totalReviews: 0
        });
      };
      req.onerror = () => resolve({ streak: 0, lastActiveDate: null, batchSize: 15 });
    });
  }

  async saveStats(statsData) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('stats', 'readwrite');
      const req = tx.objectStore('stats').put({ key: 'user_stats', data: statsData });
      req.onsuccess = () => resolve(statsData);
      req.onerror = () => reject(req.error);
    });
  }

  // Backup Export & Import
  async exportBackup() {
    await this.init();
    const words = await this.getAllWords();
    const progress = await this.getAllProgress();
    const stats = await this.getStats();

    const customWords = words.filter(w => w.isCustom);

    const backup = {
      app: 'ARL',
      version: 1,
      exportDate: new Date().toISOString(),
      stats,
      customWords,
      progress
    };

    return JSON.stringify(backup, null, 2);
  }

  async importBackup(jsonString) {
    await this.init();
    try {
      const data = JSON.parse(jsonString);
      if (data.app !== 'ARL') {
        throw new Error('Ungültiges Backup-Format: Keine ARL-Sicherungsdatei.');
      }

      // Restore custom words
      if (Array.isArray(data.customWords)) {
        const txW = this.db.transaction('words', 'readwrite');
        const sW = txW.objectStore('words');
        for (const w of data.customWords) {
          sW.put(w);
        }
      }

      // Restore progress
      if (Array.isArray(data.progress)) {
        const txP = this.db.transaction('progress', 'readwrite');
        const sP = txP.objectStore('progress');
        for (const p of data.progress) {
          sP.put(p);
        }
      }

      // Restore stats
      if (data.stats) {
        await this.saveStats(data.stats);
      }

      return true;
    } catch (e) {
      console.error('Backup import error:', e);
      throw e;
    }
  }
}

export const db = new ARLDatabase();
