/**
 * ARL - Pure Persistence Layer
 * IndexedDB storage with localStorage/in-memory fallback for SRS progress, settings, and backup management.
 * Fully resilient against quota exceeded, private browsing security restrictions, and storage corruption.
 */

const DB_NAME = 'arl_v2_db';
const DB_VERSION = 2;

class ARLDatabase {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.memoryStore = {
      progress: new Map(),
      settings: new Map()
    };
  }

  async init() {
    if (this.db) return this.db;

    if (typeof indexedDB === 'undefined') {
      this.isReady = true;
      return null;
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          try {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('progress')) {
              const progStore = db.createObjectStore('progress', { keyPath: 'wordId' });
              progStore.createIndex('dueDate', 'dueDate', { unique: false });
              progStore.createIndex('lastStudied', 'lastStudied', { unique: false });
            }
            if (!db.objectStoreNames.contains('settings')) {
              db.createObjectStore('settings', { keyPath: 'key' });
            }
          } catch (upgradeErr) {
            console.warn('IndexedDB upgrade failed:', upgradeErr);
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          this.isReady = true;
          resolve(this.db);
        };

        request.onerror = (event) => {
          console.warn('IndexedDB unavailable, falling back to memory/localStorage:', event.target ? event.target.error : event);
          this.isReady = true;
          resolve(null);
        };
      } catch (openErr) {
        console.warn('IndexedDB open threw error, falling back:', openErr);
        this.isReady = true;
        resolve(null);
      }
    });
  }

  async getSetting(key, defaultValue = null) {
    await this.init();
    if (!this.db) {
      return this._getSettingFallback(key, defaultValue);
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('settings', 'readonly');
        const req = tx.objectStore('settings').get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : defaultValue);
        req.onerror = () => resolve(this._getSettingFallback(key, defaultValue));
      } catch (err) {
        console.warn('IndexedDB error in getSetting, falling back:', err);
        resolve(this._getSettingFallback(key, defaultValue));
      }
    });
  }

  _getSettingFallback(key, defaultValue) {
    if (typeof localStorage !== 'undefined') {
      try {
        const item = localStorage.getItem(`arl_setting_${key}`);
        return item !== null ? JSON.parse(item) : defaultValue;
      } catch (e) {}
    }
    return this.memoryStore.settings.has(key) ? this.memoryStore.settings.get(key) : defaultValue;
  }

  async setSetting(key, value) {
    await this.init();
    if (!this.db) {
      return this._setSettingFallback(key, value);
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('settings', 'readwrite');
        const req = tx.objectStore('settings').put({ key, value });
        req.onsuccess = () => resolve(value);
        req.onerror = () => resolve(this._setSettingFallback(key, value));
      } catch (err) {
        console.warn('IndexedDB error in setSetting, falling back:', err);
        resolve(this._setSettingFallback(key, value));
      }
    });
  }

  _setSettingFallback(key, value) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`arl_setting_${key}`, JSON.stringify(value));
      } catch (e) {}
    }
    this.memoryStore.settings.set(key, value);
    return value;
  }

  async getProgress(wordId) {
    await this.init();
    if (!this.db) {
      return this._getProgressFallback(wordId);
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('progress', 'readonly');
        const req = tx.objectStore('progress').get(wordId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(this._getProgressFallback(wordId));
      } catch (err) {
        console.warn('IndexedDB error in getProgress, falling back:', err);
        resolve(this._getProgressFallback(wordId));
      }
    });
  }

  _getProgressFallback(wordId) {
    if (typeof localStorage !== 'undefined') {
      try {
        const item = localStorage.getItem(`arl_prog_${wordId}`);
        return item ? JSON.parse(item) : null;
      } catch (e) {}
    }
    return this.memoryStore.progress.get(wordId) || null;
  }

  async saveProgress(progressRecord) {
    await this.init();
    if (!progressRecord || !progressRecord.wordId) return null;

    if (!this.db) {
      return this._saveProgressFallback(progressRecord);
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('progress', 'readwrite');
        const req = tx.objectStore('progress').put(progressRecord);
        req.onsuccess = () => resolve(progressRecord);
        req.onerror = () => resolve(this._saveProgressFallback(progressRecord));
      } catch (err) {
        console.warn('IndexedDB error in saveProgress, falling back:', err);
        resolve(this._saveProgressFallback(progressRecord));
      }
    });
  }

  _saveProgressFallback(progressRecord) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`arl_prog_${progressRecord.wordId}`, JSON.stringify(progressRecord));
      } catch (e) {}
    }
    this.memoryStore.progress.set(progressRecord.wordId, progressRecord);
    return progressRecord;
  }

  async getAllProgress() {
    await this.init();
    if (!this.db) {
      return this._getAllProgressFallback();
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('progress', 'readonly');
        const req = tx.objectStore('progress').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(this._getAllProgressFallback());
      } catch (err) {
        console.warn('IndexedDB transaction error in getAllProgress:', err);
        resolve(this._getAllProgressFallback());
      }
    });
  }

  _getAllProgressFallback() {
    if (typeof localStorage !== 'undefined') {
      const results = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('arl_prog_')) {
            try {
              results.push(JSON.parse(localStorage.getItem(k)));
            } catch (e) {}
          }
        }
      } catch (lsErr) {
        console.warn('localStorage read error:', lsErr);
      }
      return results;
    }
    return Array.from(this.memoryStore.progress.values());
  }

  async exportBackup() {
    await this.init();
    const progressList = await this.getAllProgress();
    const targetLang = await this.getSetting('targetLang', 'de');
    const interfaceLang = await this.getSetting('interfaceLang', 'mn');
    const cefrLevel = await this.getSetting('cefrLevel', 'b1');
    const totalExp = await this.getSetting('totalExp', 0);
    const soundEnabled = await this.getSetting('soundEnabled', true);
    const speechRate = await this.getSetting('speechRate', 1.0);
    const streak = await this.getSetting('streak', 0);

    // Collect all related localStorage items as safeguard
    const localStorageData = {};
    if (typeof localStorage !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('arl_') || k.startsWith('arl:'))) {
            localStorageData[k] = localStorage.getItem(k);
          }
        }
      } catch (e) {
        console.warn('localStorage export read warning:', e);
      }
    }

    const backup = {
      app: 'ARL',
      version: 2,
      exportDate: new Date().toISOString(),
      settings: {
        targetLang,
        interfaceLang,
        cefrLevel,
        totalExp,
        soundEnabled,
        speechRate,
        streak
      },
      progress: progressList,
      localStorage: localStorageData
    };

    return JSON.stringify(backup, null, 2);
  }

  async importBackup(jsonString) {
    await this.init();
    const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    if (!data || data.app !== 'ARL') {
      throw new Error('Invalid ARL backup format');
    }

    if (data.settings) {
      if (data.settings.targetLang) await this.setSetting('targetLang', data.settings.targetLang);
      if (data.settings.interfaceLang) await this.setSetting('interfaceLang', data.settings.interfaceLang);
      if (data.settings.cefrLevel) await this.setSetting('cefrLevel', data.settings.cefrLevel);
      if (typeof data.settings.totalExp === 'number') await this.setSetting('totalExp', data.settings.totalExp);
      if (typeof data.settings.soundEnabled === 'boolean') await this.setSetting('soundEnabled', data.settings.soundEnabled);
      if (typeof data.settings.speechRate === 'number') await this.setSetting('speechRate', data.settings.speechRate);
      if (typeof data.settings.streak === 'number') await this.setSetting('streak', data.settings.streak);
    }

    if (data.localStorage && typeof localStorage !== 'undefined') {
      try {
        for (const [k, v] of Object.entries(data.localStorage)) {
          if (k.startsWith('arl_') || k.startsWith('arl:')) {
            localStorage.setItem(k, v);
          }
        }
      } catch (e) {
        console.warn('localStorage import write warning:', e);
      }
    }

    if (Array.isArray(data.progress)) {
      for (const item of data.progress) {
        if (item && item.wordId) {
          await this.saveProgress(item);
        }
      }
    }

    return true;
  }
}

export const db = new ARLDatabase();
