/**
 * ARL - GitHub Gist Cloud Sync Engine
 * Automated, zero-dependency cloud synchronization powered by GitHub Personal Access Tokens.
 * Syncs user SRS progress, active notes, and settings via a private GitHub Gist.
 * Never stores or exports tokens in sync payloads or backups.
 */

import { db } from './db.js';
import { state } from './state.js';

const KEY_TOKEN = 'arl_gh_token';
const KEY_GIST_ID = 'arl_gist_id';
const KEY_LAST_SYNC = 'arl_sync_last';
const SYNC_FILE_NAME = 'arl_sync_data.json';
const GIST_API_BASE = 'https://api.github.com/gists';

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
        if (!token || !token.trim()) {
          localStorage.removeItem(KEY_TOKEN);
        } else {
          localStorage.setItem(KEY_TOKEN, token.trim());
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
        if (!gistId || !gistId.trim()) {
          localStorage.removeItem(KEY_GIST_ID);
        } else {
          localStorage.setItem(KEY_GIST_ID, gistId.trim());
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

    const payload = {
      app: 'ARL',
      schemaVersion: 2,
      timestamp: new Date().toISOString(),
      device: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent.slice(0, 80) : 'ARL Terminal',
      db: dbData,
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
   * Connect and auto-discover or create private Gist
   */
  async connect(token, manualGistId = null) {
    if (!token || !token.trim()) {
      this.setStatus('error', 'Token is required');
      throw new Error('Personal Access Token is required');
    }

    const cleanToken = token.trim();
    this.setToken(cleanToken);
    this.setStatus('syncing', 'Authenticating with GitHub...');

    const headers = {
      'Authorization': `Bearer ${cleanToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    // If manual Gist ID specified, link directly
    if (manualGistId && manualGistId.trim()) {
      const cleanGistId = manualGistId.trim();
      const checkResp = await fetch(`${GIST_API_BASE}/${cleanGistId}`, { headers });
      if (!checkResp.ok) {
        this.setStatus('error', `Gist not accessible: HTTP ${checkResp.status}`);
        throw new Error(`Could not access Gist ${cleanGistId} (HTTP ${checkResp.status})`);
      }
      this.setGistId(cleanGistId);
      return await this.pull();
    }

    // Auto-discovery: search existing user gists for arl_sync_data.json
    try {
      const listResp = await fetch(`${GIST_API_BASE}?per_page=100`, { headers });
      if (!listResp.ok) {
        this.setStatus('error', `Auth failed: HTTP ${listResp.status}`);
        throw new Error(`GitHub auth failed (HTTP ${listResp.status}). Check token permissions (gist scope required).`);
      }

      const gists = await listResp.json();
      const existing = Array.isArray(gists) ? gists.find(g => g.files && g.files[SYNC_FILE_NAME]) : null;

      if (existing) {
        this.setGistId(existing.id);
        const result = await this.pull();
        this.setStatus('ok', `Connected to existing Gist (${existing.id.slice(0, 7)})`);
        return { success: true, gistId: existing.id, pulled: true, data: result.data };
      }

      // No existing gist found: Create private secret Gist
      this.setStatus('syncing', 'Creating private Gist for ARL data...');
      const payload = await this.getDataPayload();
      const createResp = await fetch(GIST_API_BASE, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'ARL Learning Data Sync',
          public: false,
          files: {
            [SYNC_FILE_NAME]: {
              content: JSON.stringify(payload, null, 2)
            }
          }
        })
      });

      if (!createResp.ok) {
        this.setStatus('error', `Creation failed: HTTP ${createResp.status}`);
        throw new Error(`Failed to create Gist (HTTP ${createResp.status})`);
      }

      const createdGist = await createResp.json();
      this.setGistId(createdGist.id);
      const now = new Date().toISOString();
      this.setLastSync(now);
      this.setStatus('ok', `Created new private Gist (${createdGist.id.slice(0, 7)})`);
      return { success: true, gistId: createdGist.id, created: true };
    } catch (err) {
      this.setStatus('error', err.message);
      throw err;
    }
  }

  /**
   * Push local data up to Gist
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
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28'
        },
        body: JSON.stringify({
          description: 'ARL Learning Data Sync',
          files: {
            [SYNC_FILE_NAME]: {
              content: JSON.stringify(payload, null, 2)
            }
          }
        })
      });

      if (!resp.ok) {
        this.setStatus('error', `Push failed: HTTP ${resp.status}`);
        throw new Error(`Push failed (HTTP ${resp.status})`);
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
   * Pull remote data from Gist and merge into local IndexedDB and notes
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!resp.ok) {
        this.setStatus('error', `Pull failed: HTTP ${resp.status}`);
        throw new Error(`Pull failed (HTTP ${resp.status})`);
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
          headers: { 'Authorization': `Bearer ${token}` }
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

      // 3. Restore Settings
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
   * Debounced Auto-Push: triggers 3 seconds after an action (card grade, note edit)
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
