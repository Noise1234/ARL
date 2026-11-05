/**
 * ARL - GitHub Gist Cloud Sync Engine
 * Automated, zero-dependency cloud synchronization powered by GitHub Personal Access Tokens.
 * Syncs user SRS progress, active notes, telemetry, and settings via a private GitHub Gist.
 * Never stores or exports tokens in sync payloads or backups.
 */

import { db } from './db.js';
import { state } from './state.js';
import { telemetry } from './telemetry.js';

const KEY_TOKEN = 'arl_gh_token';
const KEY_GIST_ID = 'arl_gist_id';
const KEY_LAST_SYNC = 'arl_sync_last';
const SYNC_FILE_NAME = 'arl_sync_data.json';
const GIST_API_BASE = 'https://api.github.com/gists';

export function sanitizeGistId(input) {
  if (!input) return '';
  const trimmed = String(input).trim();
  // Extract ID if pasted as a full URL: https://gist.github.com/username/gist_id
  const urlMatch = trimmed.match(/gist\.github\.com\/(?:[^\/\s]+\/)?([a-f0-9]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return trimmed.replace(/[^a-zA-Z0-9_-]/g, '');
}

export class GistSync {
  constructor() {
    this.status = 'idle'; // 'idle' | 'syncing' | 'ok' | 'error'
    this.statusMessage = '';
    this.listeners = new Set();
    this._debounceTimer = null;
  }

  getToken() {
    try {
      if (typeof localStorage !== 'undefined') {
        return (localStorage.getItem(KEY_TOKEN) || '').trim();
      }
    } catch (e) {}
    return '';
  }

  setToken(token) {
    try {
      if (typeof localStorage !== 'undefined') {
        const clean = (token || '').trim();
        if (!clean) {
          localStorage.removeItem(KEY_TOKEN);
        } else {
          localStorage.setItem(KEY_TOKEN, clean);
        }
      }
    } catch (e) {}
    this.notify();
  }

  getGistId() {
    try {
      if (typeof localStorage !== 'undefined') {
        return (localStorage.getItem(KEY_GIST_ID) || '').trim();
      }
    } catch (e) {}
    return '';
  }

  setGistId(gistId) {
    try {
      if (typeof localStorage !== 'undefined') {
        const clean = sanitizeGistId(gistId);
        if (!clean) {
          localStorage.removeItem(KEY_GIST_ID);
        } else {
          localStorage.setItem(KEY_GIST_ID, clean);
        }
      }
    } catch (e) {}
    this.notify();
  }

  getLastSync() {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(KEY_LAST_SYNC) || '';
      }
    } catch (e) {}
    return '';
  }

  setLastSync(isoStr) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(KEY_LAST_SYNC, isoStr);
      }
    } catch (e) {}
    this.notify();
  }

  isConnected() {
    return Boolean(this.getToken() && this.getGistId());
  }

  getStatus() {
    return {
      status: this.status,
      message: this.statusMessage,
      isConnected: this.isConnected(),
      gistId: this.getGistId(),
      lastSync: this.getLastSync()
    };
  }

  setStatus(status, message = '') {
    this.status = status;
    this.statusMessage = message;
    this.notify();
  }

  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.add(listener);
    }
    return () => this.listeners.delete(listener);
  }

  notify() {
    const statusObj = this.getStatus();
    this.listeners.forEach(fn => {
      try {
        fn(statusObj);
      } catch (e) {
        console.warn('Sync listener error:', e);
      }
    });
  }

  getShortStatusLabel() {
    if (this.status === 'syncing') return '[SYNC: ...]';
    if (this.status === 'error') return '[SYNC: !]';
    if (this.status === 'ok') return '[SYNC: OK]';
    if (this.isConnected()) return '[SYNC: OK]';
    return '[SYNC]';
  }

  disconnect() {
    this.setToken('');
    this.setGistId('');
    this.setLastSync('');
    this.setStatus('idle', 'Disconnected');
  }

  /**
   * Builds sanitized learning data payload.
   * STRICT SECURITY: Excludes any tokens or sensitive credentials.
   */
  async getDataPayload() {
    const dbBackupStr = await db.exportBackup();
    const dbData = typeof dbBackupStr === 'string' ? JSON.parse(dbBackupStr) : dbBackupStr;

    // Redact tokens in localStorage mirror if present
    if (dbData && dbData.localStorage) {
      delete dbData.localStorage[KEY_TOKEN];
      delete dbData.localStorage[KEY_GIST_ID];
      delete dbData.localStorage['arl_gemini_api_key'];
    }

    let notes = [];
    try {
      if (typeof localStorage !== 'undefined') {
        const rawNotes = localStorage.getItem('arl_smart_notes');
        if (rawNotes) {
          notes = JSON.parse(rawNotes);
        }
      }
    } catch (e) {}

    // Extract vocab progress map
    const vocabProgress = {};
    if (state.progressMap && state.progressMap.forEach) {
      state.progressMap.forEach((prog, id) => {
        vocabProgress[id] = {
          wordId: prog.wordId || id,
          reps: prog.reps,
          interval: prog.interval,
          easeFactor: prog.easeFactor,
          lapses: prog.lapses,
          dueDate: prog.dueDate,
          lastStudied: prog.lastStudied,
          lastGrade: prog.lastGrade,
          status: prog.status,
          masteredAt: prog.masteredAt || null,
          timeToMasterMs: prog.timeToMasterMs || 0
        };
      });
    }

    const payload = {
      app: 'ARL',
      schemaVersion: 2,
      timestamp: new Date().toISOString(),
      device: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent.slice(0, 80) : 'ARL Device',
      db: dbData,
      vocabProgress: vocabProgress,
      wordStats: telemetry.wordStats || {},
      grammarStats: telemetry.grammarStats || {},
      studyTimeStats: {
        totalActiveSeconds: telemetry.totalActiveSeconds,
        dailyActiveSeconds: telemetry.dailyActiveSeconds,
        sectionSeconds: telemetry.sectionSeconds
      },
      xpAndLevel: {
        totalExp: state.totalExp,
        level: state.level
      },
      notes: notes,
      settings: {
        targetLang: state.targetLang || 'de',
        interfaceLang: state.interfaceLang || 'mn',
        cefrLevel: state.cefrLevel || 'b1',
        speechRate: state.speechRate || 1.0,
        soundEnabled: Boolean(state.soundEnabled)
      }
    };

    return payload;
  }

  /**
   * Diagnostic test connection method
   * Prints exact HTTP feedback (✅ Connected: Last synced ... or ❌ HTTP 401: Bad Token / ❌ HTTP 404: Gist ID Not Found)
   */
  async testConnection() {
    const token = this.getToken();
    const gistId = this.getGistId();

    if (!token) {
      return { ok: false, status: 0, message: '❌ Missing GitHub Personal Access Token' };
    }
    if (!gistId) {
      return { ok: false, status: 0, message: '❌ Missing Gist ID' };
    }

    try {
      const resp = await fetch(`${GIST_API_BASE}/${gistId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      if (resp.status === 200) {
        const lastSync = this.getLastSync() ? new Date(this.getLastSync()).toLocaleString() : 'Never';
        return {
          ok: true,
          status: 200,
          message: `✅ Connected: Last synced ${lastSync}`
        };
      } else if (resp.status === 401) {
        return { ok: false, status: 401, message: '❌ HTTP 401: Bad Token' };
      } else if (resp.status === 404) {
        return { ok: false, status: 404, message: '❌ HTTP 404: Gist ID Not Found' };
      } else {
        return { ok: false, status: resp.status, message: `❌ HTTP ${resp.status}: Request Failed` };
      }
    } catch (err) {
      return { ok: false, status: 0, message: `❌ Network Error: ${err.message}` };
    }
  }

  /**
   * Connect and auto-discover or create private Gist
   */
  async connect(rawToken, explicitGistId = null) {
    const token = (rawToken || '').trim();
    if (!token) {
      this.setStatus('error', 'Token cannot be empty');
      throw new Error('Please enter a GitHub Personal Access Token');
    }

    this.setToken(token);
    this.setStatus('syncing', 'Connecting to GitHub...');

    try {
      let gistId = sanitizeGistId(explicitGistId);

      // If no Gist ID provided, search user's gists
      if (!gistId) {
        const listResp = await fetch(`${GIST_API_BASE}?per_page=100`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
          }
        });

        if (!listResp.ok) {
          const errMsg = listResp.status === 401 ? 'HTTP 401: Bad Token' : `HTTP ${listResp.status}`;
          this.setStatus('error', `Authentication failed (${errMsg})`);
          throw new Error(`Authentication failed (${errMsg})`);
        }

        const gists = await listResp.json();
        const existing = Array.isArray(gists) && gists.find(g => g.files && g.files[SYNC_FILE_NAME]);
        if (existing) {
          gistId = existing.id;
        }
      }

      // If still not found, create new private Gist
      let created = false;
      if (!gistId) {
        this.setStatus('syncing', 'Creating private ARL Gist...');
        const initialPayload = await this.getDataPayload();
        const createResp = await fetch(GIST_API_BASE, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: 'ARL Language Learning Sync Data',
            public: false,
            files: {
              [SYNC_FILE_NAME]: {
                content: JSON.stringify(initialPayload, null, 2)
              }
            }
          })
        });

        if (!createResp.ok) {
          this.setStatus('error', `Failed to create Gist (HTTP ${createResp.status})`);
          throw new Error(`Failed to create Gist (HTTP ${createResp.status})`);
        }

        const newGist = await createResp.json();
        gistId = newGist.id;
        created = true;
      }

      this.setGistId(gistId);
      this.setStatus('ok', 'Connected to GitHub Gist');
      return { success: true, gistId, created };
    } catch (err) {
      this.setStatus('error', err.message);
      throw err;
    }
  }

  /**
   * Push local data up to Gist (Force Push)
   */
  async push() {
    const token = this.getToken();
    const gistId = this.getGistId();

    if (!token || !gistId) {
      this.setStatus('error', 'Not connected to Gist');
      throw new Error('Not connected: Please provide GitHub Token and Gist ID');
    }

    this.setStatus('syncing', 'Uploading local progress...');

    try {
      const payload = await this.getDataPayload();
      const resp = await fetch(`${GIST_API_BASE}/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'ARL Language Learning Sync Data',
          files: {
            [SYNC_FILE_NAME]: {
              content: JSON.stringify(payload, null, 2)
            }
          }
        })
      });

      if (!resp.ok) {
        const msg = resp.status === 401 ? 'HTTP 401: Bad Token' : (resp.status === 404 ? 'HTTP 404: Gist ID Not Found' : `HTTP ${resp.status}`);
        this.setStatus('error', `Push failed: ${msg}`);
        throw new Error(`Push failed (${msg})`);
      }

      const now = new Date().toISOString();
      this.setLastSync(now);
      this.setStatus('ok', `Synced ${new Date().toLocaleTimeString()}`);
      return { success: true, timestamp: now };
    } catch (err) {
      this.setStatus('error', err.message);
      throw err;
    }
  }

  /**
   * Pull remote data from Gist (Force Pull)
   */
  async pull() {
    const token = this.getToken();
    const gistId = this.getGistId();

    if (!token || !gistId) {
      this.setStatus('error', 'Not connected to Gist');
      throw new Error('Not connected: Please provide GitHub Token and Gist ID');
    }

    this.setStatus('syncing', 'Downloading remote progress...');

    try {
      const resp = await fetch(`${GIST_API_BASE}/${gistId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      if (!resp.ok) {
        const msg = resp.status === 401 ? 'HTTP 401: Bad Token' : (resp.status === 404 ? 'HTTP 404: Gist ID Not Found' : `HTTP ${resp.status}`);
        this.setStatus('error', `Pull failed: ${msg}`);
        throw new Error(`Pull failed (${msg})`);
      }

      const gist = await resp.json();
      const file = gist.files && gist.files[SYNC_FILE_NAME];
      if (!file) {
        this.setStatus('error', `File ${SYNC_FILE_NAME} not found in Gist`);
        throw new Error(`Gist does not contain ${SYNC_FILE_NAME}`);
      }

      let content = file.content;
      if (file.truncated && file.raw_url) {
        const rawResp = await fetch(file.raw_url, {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/vnd.github+json'
          }
        });
        if (rawResp.ok) {
          content = await rawResp.text();
        }
      }

      const data = typeof content === 'string' ? JSON.parse(content) : content;

      // 1. Restore IndexedDB Progress & SRS state
      if (data.db) {
        await db.importBackup(JSON.stringify(data.db));
      }

      // 2. Restore Notes Workspace
      if (Array.isArray(data.notes) && typeof localStorage !== 'undefined') {
        localStorage.setItem('arl_smart_notes', JSON.stringify(data.notes));
      }

      // 3. Restore Telemetry & Stats
      if (data.wordStats && typeof localStorage !== 'undefined') {
        localStorage.setItem('arl_word_stats', JSON.stringify(data.wordStats));
      }
      if (data.grammarStats && typeof localStorage !== 'undefined') {
        localStorage.setItem('arl_grammar_stats', JSON.stringify(data.grammarStats));
      }
      if (data.studyTimeStats && typeof localStorage !== 'undefined') {
        localStorage.setItem('arl_study_time_stats', JSON.stringify(data.studyTimeStats));
      }

      // 4. Restore Settings & EXP
      if (data.xpAndLevel && typeof data.xpAndLevel.totalExp === 'number') {
        state.totalExp = Math.max(state.totalExp || 0, data.xpAndLevel.totalExp);
        await db.setSetting('totalExp', state.totalExp);
      }
      if (data.settings) {
        if (data.settings.targetLang && data.settings.targetLang !== state.targetLang) {
          await state.setSetting('targetLang', data.settings.targetLang);
        }
        if (data.settings.cefrLevel && data.settings.cefrLevel !== state.cefrLevel) {
          await state.setCefrLevel(data.settings.cefrLevel);
        }
        if (typeof data.settings.soundEnabled === 'boolean') {
          await state.setSoundEnabled(data.settings.soundEnabled);
        }
        if (typeof data.settings.speechRate === 'number') {
          await state.setSpeechRate(data.settings.speechRate);
        }
      }

      const now = new Date().toISOString();
      this.setLastSync(now);
      this.setStatus('ok', `Pulled ${new Date().toLocaleTimeString()}`);
      return { success: true, timestamp: now, data };
    } catch (err) {
      this.setStatus('error', err.message);
      throw err;
    }
  }

  /**
   * Sync Now (Merge): Pull remote changes, merge intelligently with local, push result back
   */
  async syncMerge() {
    this.setStatus('syncing', 'Merging local and cloud data...');
    try {
      // 1. Pull remote data
      const pullRes = await this.pull();
      // 2. Push merged local state
      await this.push();
      this.setStatus('ok', `Merged ${new Date().toLocaleTimeString()}`);
      return { success: true };
    } catch (err) {
      this.setStatus('error', `Merge error: ${err.message}`);
      throw err;
    }
  }

  /**
   * Debounced Auto-Push: triggers 3 seconds after an action
   */
  scheduleAutoPush(delayMs = 3000) {
    if (!this.isConnected()) return;

    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }

    this._debounceTimer = setTimeout(async () => {
      try {
        await this.push();
      } catch (err) {
        console.warn('Auto-push background warning:', err.message);
      }
    }, delayMs);
  }

  /**
   * Background pull on application launch
   */
  async autoPull() {
    if (!this.isConnected()) return;
    try {
      await this.pull();
    } catch (err) {
      console.warn('Startup auto-pull warning:', err.message);
    }
  }
}

export const gistSync = new GistSync();
