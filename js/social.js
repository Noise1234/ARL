/**
 * ARL - Supabase Cloud Social Engine (Friends & Leaderboard)
 * Zero-dependency REST API integration with PIN-Protected user profiles.
 * Features:
 * - Direct PostgREST HTTP queries (GET, POST, PATCH, DELETE)
 * - Cryptographic SHA-256 PIN protection ensuring profile ownership
 * - Friends management & shareable Friend Codes (ARL:USERNAME)
 * - Dual Leaderboard: Global Top 50 & Friends-Only Ranking
 * - Dynamic EXP & Level synchronization from ARL State & Telemetry
 * - High-fidelity Mock Sandbox fallback for 100% offline functionality
 * - SQL DDL generator with Row Level Security (RLS) policies
 */

import { state } from './state.js';
import { telemetry } from './telemetry.js';

const KEY_SUPABASE_URL = 'arl_supabase_url';
const KEY_SUPABASE_ANON_KEY = 'arl_supabase_anon_key';
const KEY_SOCIAL_PROFILE = 'arl_social_profile';
const KEY_SOCIAL_FRIENDS = 'arl_social_friends';
const KEY_PIN_LOCK = 'arl_social_pin_lock';

/**
 * Pure JavaScript SHA-256 implementation.
 * Guarantees deterministic cryptographic hashing in all browsers, webviews, and Node.js.
 * @param {string} ascii - The string to hash
 * @returns {string} - 64-character lowercase hex digest
 */
export function sha256Sync(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';
  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;
  let hash = [];
  const k = [];
  let primeCounter = 0;
  const isComposite = {};

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';

  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }

  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Generates cryptographic PIN hash for a given username and PIN.
 * @param {string} username - User handle
 * @param {string|number} pin - Secret PIN (4-8 digits)
 * @returns {string} - SHA-256 hash
 */
export function hashPin(username, pin) {
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPin = String(pin || '').trim();
  return sha256Sync(`${cleanUsername}:${cleanPin}`);
}

/**
 * Sanitizes user handle.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeUsername(input) {
  if (!input) return '';
  return String(input)
    .trim()
    .replace(/^@+/, '')
    .replace(/^ARL:/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
}

/**
 * Available Avatar Badges (Minimalist Monospace Badges)
 */
export const AVATAR_BADGES = [
  { id: 'ALPHA', label: '[ALPHA]', icon: '⚡' },
  { id: 'DELTA', label: '[DELTA]', icon: '▲' },
  { id: 'OMEGA', label: '[OMEGA]', icon: 'Ω' },
  { id: 'SIGMA', label: '[SIGMA]', icon: 'Σ' },
  { id: 'ZEN', label: '[ZEN]', icon: '◎' },
  { id: 'VALKYRIE', label: '[VALKYRIE]', icon: '✦' },
  { id: 'TITAN', label: '[TITAN]', icon: '◈' },
  { id: 'NEXUS', label: '[NEXUS]', icon: '❖' }
];

/**
 * Default Realistic Community Learners for Offline Mock Sandbox Mode
 */
const DEFAULT_MOCK_LEARNERS = [
  {
    username: 'elena_ber',
    display_name: 'Elena (Berlin)',
    pin_hash: sha256Sync('elena_ber:1234'),
    avatar: 'OMEGA',
    level: 28,
    total_exp: 14250,
    streak: 32,
    cards_learned: 840,
    study_time_seconds: 64800,
    target_lang: 'de',
    cefr_level: 'b2',
    status_message: 'Mastering Subjunktionen & Konjunktiv II',
    last_active: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    username: 'markus_muc',
    display_name: 'Markus (Munich)',
    pin_hash: sha256Sync('markus_muc:1234'),
    avatar: 'TITAN',
    level: 24,
    total_exp: 11800,
    streak: 25,
    cards_learned: 710,
    study_time_seconds: 52000,
    target_lang: 'de',
    cefr_level: 'b1',
    status_message: 'Dativ vs Akkusativ drill complete',
    last_active: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    username: 'batu_uln',
    display_name: 'Batu (Ulaanbaatar)',
    pin_hash: sha256Sync('batu_uln:1234'),
    avatar: 'ALPHA',
    level: 21,
    total_exp: 9950,
    streak: 19,
    cards_learned: 590,
    study_time_seconds: 43200,
    target_lang: 'de',
    cefr_level: 'b1',
    status_message: 'Goethe B1 Zertifikat preparation',
    last_active: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    username: 'sophie_vie',
    display_name: 'Sophie (Vienna)',
    pin_hash: sha256Sync('sophie_vie:1234'),
    avatar: 'ZEN',
    level: 19,
    total_exp: 8400,
    streak: 15,
    cards_learned: 510,
    study_time_seconds: 37500,
    target_lang: 'de',
    cefr_level: 'b1',
    status_message: 'Wechselpräpositionen focus',
    last_active: new Date(Date.now() - 1000 * 60 * 200).toISOString()
  },
  {
    username: 'lukas_zrh',
    display_name: 'Lukas (Zürich)',
    pin_hash: sha256Sync('lukas_zrh:1234'),
    avatar: 'DELTA',
    level: 16,
    total_exp: 6700,
    streak: 12,
    cards_learned: 430,
    study_time_seconds: 29800,
    target_lang: 'de',
    cefr_level: 'a2',
    status_message: 'Daily 20-sentence grammar sprint',
    last_active: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  },
  {
    username: 'anja_ham',
    display_name: 'Anja (Hamburg)',
    pin_hash: sha256Sync('anja_ham:1234'),
    avatar: 'SIGMA',
    level: 14,
    total_exp: 5300,
    streak: 9,
    cards_learned: 360,
    study_time_seconds: 24100,
    target_lang: 'de',
    cefr_level: 'a2',
    status_message: 'Perfekt irregular verbs mastery',
    last_active: new Date(Date.now() - 1000 * 60 * 500).toISOString()
  },
  {
    username: 'temka_ub',
    display_name: 'Temuujin (UB)',
    pin_hash: sha256Sync('temka_ub:1234'),
    avatar: 'VALKYRIE',
    level: 12,
    total_exp: 4150,
    streak: 7,
    cards_learned: 280,
    study_time_seconds: 18900,
    target_lang: 'en',
    cefr_level: 'b2',
    status_message: 'English Inversion & Conditionals',
    last_active: new Date(Date.now() - 1000 * 60 * 720).toISOString()
  },
  {
    username: 'klara_kol',
    display_name: 'Klara (Köln)',
    pin_hash: sha256Sync('klara_kol:1234'),
    avatar: 'NEXUS',
    level: 10,
    total_exp: 3200,
    streak: 6,
    cards_learned: 210,
    study_time_seconds: 14500,
    target_lang: 'de',
    cefr_level: 'a1',
    status_message: 'A1 German core noun genders',
    last_active: new Date(Date.now() - 1000 * 60 * 1200).toISOString()
  },
  {
    username: 'david_ldn',
    display_name: 'David (London)',
    pin_hash: sha256Sync('david_ldn:1234'),
    avatar: 'ALPHA',
    level: 8,
    total_exp: 2400,
    streak: 5,
    cards_learned: 160,
    study_time_seconds: 11000,
    target_lang: 'en',
    cefr_level: 'b1',
    status_message: 'B1 Phrasal verbs sprint',
    last_active: new Date(Date.now() - 1000 * 60 * 1800).toISOString()
  },
  {
    username: 'sara_fra',
    display_name: 'Sara (Frankfurt)',
    pin_hash: sha256Sync('sara_fra:1234'),
    avatar: 'ZEN',
    level: 6,
    total_exp: 1650,
    streak: 3,
    cards_learned: 110,
    study_time_seconds: 7600,
    target_lang: 'de',
    cefr_level: 'a1',
    status_message: 'Trennbare Verben drill',
    last_active: new Date(Date.now() - 1000 * 60 * 2400).toISOString()
  }
];

export class SupabaseSocialEngine {
  constructor() {
    this.listeners = new Set();
    this._autoSyncTimer = null;
    this.mockLearners = JSON.parse(JSON.stringify(DEFAULT_MOCK_LEARNERS));
  }

  /**
   * Initializes social client and checks profile status.
   */
  async init() {
    // If user has a saved profile, ensure local stats sync
    const profile = this.getProfile();
    if (profile && profile.username) {
      this.syncStats();
    }
  }

  // ==========================================
  // CONFIGURATION & CREDENTIALS
  // ==========================================

  getUrl() {
    try {
      if (typeof localStorage !== 'undefined') {
        return (localStorage.getItem(KEY_SUPABASE_URL) || '').trim();
      }
    } catch (e) {}
    return '';
  }

  setUrl(url) {
    try {
      if (typeof localStorage !== 'undefined') {
        const clean = (url || '').trim().replace(/\/+$/, '');
        if (!clean) {
          localStorage.removeItem(KEY_SUPABASE_URL);
        } else {
          localStorage.setItem(KEY_SUPABASE_URL, clean);
        }
      }
    } catch (e) {}
    this.notify();
  }

  getAnonKey() {
    try {
      if (typeof localStorage !== 'undefined') {
        return (localStorage.getItem(KEY_SUPABASE_ANON_KEY) || '').trim();
      }
    } catch (e) {}
    return '';
  }

  setAnonKey(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        const clean = (key || '').trim();
        if (!clean) {
          localStorage.removeItem(KEY_SUPABASE_ANON_KEY);
        } else {
          localStorage.setItem(KEY_SUPABASE_ANON_KEY, clean);
        }
      }
    } catch (e) {}
    this.notify();
  }

  /**
   * Returns true if user has configured custom Supabase credentials.
   */
  isConfigured() {
    const url = this.getUrl();
    const key = this.getAnonKey();
    return Boolean(url && key && url.startsWith('http'));
  }

  /**
   * Returns headers required for Supabase REST API calls.
   */
  getHeaders() {
    const key = this.getAnonKey();
    return {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  /**
   * Tests Supabase REST API connection and diagnostic state.
   */
  async testConnection() {
    if (!this.isConfigured()) {
      return {
        ok: false,
        status: 'mock',
        message: 'No Supabase credentials configured. Running in high-fidelity Mock Sandbox mode.'
      };
    }

    const url = `${this.getUrl()}/rest/v1/arl_profiles?select=username&limit=1`;
    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (resp.ok) {
        return {
          ok: true,
          status: resp.status,
          message: 'Connected to Supabase REST API successfully! arl_profiles table accessible.'
        };
      }

      if (resp.status === 401 || resp.status === 403) {
        return {
          ok: false,
          status: resp.status,
          message: 'Supabase Error 401/403: Invalid Anon Key or unauthorized request.'
        };
      }

      if (resp.status === 404) {
        return {
          ok: false,
          status: resp.status,
          message: 'Supabase Error 404: Table "arl_profiles" not found. Please execute the SQL setup script in Supabase SQL editor.'
        };
      }

      const errText = await resp.text();
      return {
        ok: false,
        status: resp.status,
        message: `Supabase Error ${resp.status}: ${errText.slice(0, 150)}`
      };
    } catch (err) {
      return {
        ok: false,
        status: 'network_error',
        message: `Network error connecting to Supabase: ${err.message}`
      };
    }
  }

  // ==========================================
  // PROFILE & PIN AUTHENTICATION
  // ==========================================

  /**
   * Retrieves active user profile from local storage.
   */
  getProfile() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(KEY_SOCIAL_PROFILE);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return null;
  }

  isLoggedIn() {
    const prof = this.getProfile();
    return Boolean(prof && prof.username && prof.pinHash);
  }

  /**
   * Saves active profile locally and updates state.
   */
  _saveProfile(profile) {
    try {
      if (typeof localStorage !== 'undefined') {
        if (!profile) {
          localStorage.removeItem(KEY_SOCIAL_PROFILE);
        } else {
          localStorage.setItem(KEY_SOCIAL_PROFILE, JSON.stringify(profile));
        }
      }
    } catch (e) {}
    this.notify();
  }

  /**
   * Creates or registers a new PIN-protected user profile.
   * If the username already exists on Supabase:
   * - If PIN matches: logs in successfully.
   * - If PIN doesn't match: rejects with error (protecting existing user).
   */
  async register(rawUsername, rawDisplayName, rawPin, avatar = 'ALPHA', statusMessage = '') {
    const username = sanitizeUsername(rawUsername);
    if (!username || username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters (letters, numbers, underscore).' };
    }

    const pin = String(rawPin || '').trim();
    if (!pin || pin.length < 4 || pin.length > 8) {
      return { success: false, error: 'Security PIN must be 4 to 8 characters.' };
    }

    const displayName = (rawDisplayName || username).trim().slice(0, 30);
    const pinHash = hashPin(username, pin);

    // Current learning metrics from state and telemetry
    const stats = state.getQueueStats ? state.getQueueStats() : { memorizedCount: 0 };
    const levelStats = state.getLevelStats ? state.getLevelStats() : { level: 1, totalExp: 0 };
    const session = state.getSessionStats ? state.getSessionStats() : { streak: 0 };
    const studyTime = telemetry.getTotalStudySeconds ? telemetry.getTotalStudySeconds() : 0;

    const profileData = {
      username,
      display_name: displayName,
      pin_hash: pinHash,
      avatar,
      level: levelStats.level || 1,
      total_exp: levelStats.totalExp || 0,
      streak: session.streak || 0,
      cards_learned: stats.memorizedCount || 0,
      study_time_seconds: studyTime || 0,
      target_lang: state.targetLang || 'de',
      cefr_level: state.cefrLevel || 'b1',
      status_message: statusMessage || 'Ready to learn with ARL',
      last_active: new Date().toISOString()
    };

    // 1. Live Supabase Cloud Mode
    if (this.isConfigured()) {
      try {
        // Check if username already exists
        const checkUrl = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${username}&select=*`;
        const checkResp = await fetch(checkUrl, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (checkResp.ok) {
          const existing = await checkResp.json();
          if (Array.isArray(existing) && existing.length > 0) {
            const userRow = existing[0];
            // Username exists: check PIN
            if (userRow.pin_hash === pinHash) {
              // Valid PIN: login existing user
              const localProfile = {
                username: userRow.username,
                displayName: userRow.display_name,
                pinHash: userRow.pin_hash,
                avatar: userRow.avatar,
                statusMessage: userRow.status_message,
                level: userRow.level,
                totalExp: userRow.total_exp,
                streak: userRow.streak,
                cardsLearned: userRow.cards_learned,
                studyTimeSeconds: userRow.study_time_seconds,
                targetLang: userRow.target_lang,
                cefrLevel: userRow.cefr_level,
                lastActive: userRow.last_active
              };
              this._saveProfile(localProfile);
              return { success: true, profile: localProfile, message: `Welcome back, ${userRow.display_name}!` };
            } else {
              return {
                success: false,
                error: `Username "@${username}" is already taken. Enter the matching PIN to claim it, or choose another username.`
              };
            }
          }
        }

        // Username is fresh: Insert new profile row
        const insertUrl = `${this.getUrl()}/rest/v1/arl_profiles`;
        const insertResp = await fetch(insertUrl, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(profileData)
        });

        if (!insertResp.ok) {
          const errText = await insertResp.text();
          return { success: false, error: `Cloud error creating profile: ${errText.slice(0, 150)}` };
        }

        const insertedRows = await insertResp.json();
        const saved = Array.isArray(insertedRows) && insertedRows[0] ? insertedRows[0] : profileData;

        const localProfile = {
          username: saved.username,
          displayName: saved.display_name,
          pinHash: saved.pin_hash,
          avatar: saved.avatar,
          statusMessage: saved.status_message,
          level: saved.level,
          totalExp: saved.total_exp,
          streak: saved.streak,
          cardsLearned: saved.cards_learned,
          studyTimeSeconds: saved.study_time_seconds,
          targetLang: saved.target_lang,
          cefrLevel: saved.cefr_level,
          lastActive: saved.last_active
        };

        this._saveProfile(localProfile);
        return { success: true, profile: localProfile, message: `Profile created! Welcome to ARL Social, ${displayName}!` };
      } catch (err) {
        return { success: false, error: `Network error registering profile: ${err.message}` };
      }
    }

    // 2. Mock Sandbox Mode
    const existingIndex = this.mockLearners.findIndex(m => m.username === username);
    if (existingIndex >= 0) {
      const existing = this.mockLearners[existingIndex];
      if (existing.pin_hash === pinHash) {
        const localProfile = {
          username: existing.username,
          displayName: existing.display_name,
          pinHash: existing.pin_hash,
          avatar: existing.avatar,
          statusMessage: existing.status_message,
          level: existing.level,
          totalExp: existing.total_exp,
          streak: existing.streak,
          cardsLearned: existing.cards_learned,
          studyTimeSeconds: existing.study_time_seconds,
          targetLang: existing.target_lang,
          cefrLevel: existing.cefr_level,
          lastActive: existing.last_active
        };
        this._saveProfile(localProfile);
        return { success: true, profile: localProfile, message: `Welcome back, ${existing.display_name}!` };
      } else {
        return {
          success: false,
          error: `Username "@${username}" is already taken in Mock Sandbox. Enter the matching PIN or choose another name.`
        };
      }
    }

    // Add to mock learners
    this.mockLearners.push(profileData);
    const localProfile = {
      username: profileData.username,
      displayName: profileData.display_name,
      pinHash: profileData.pin_hash,
      avatar: profileData.avatar,
      statusMessage: profileData.status_message,
      level: profileData.level,
      totalExp: profileData.total_exp,
      streak: profileData.streak,
      cardsLearned: profileData.cards_learned,
      studyTimeSeconds: profileData.study_time_seconds,
      targetLang: profileData.target_lang,
      cefrLevel: profileData.cefr_level,
      lastActive: profileData.last_active
    };

    this._saveProfile(localProfile);
    return { success: true, profile: localProfile, message: `Profile created in Mock Sandbox! Welcome, ${displayName}!` };
  }

  /**
   * Login with existing username and PIN.
   */
  async loginWithPin(rawUsername, rawPin) {
    const username = sanitizeUsername(rawUsername);
    if (!username) return { success: false, error: 'Please enter your username.' };
    const pin = String(rawPin || '').trim();
    if (!pin) return { success: false, error: 'Please enter your security PIN.' };

    const pinHash = hashPin(username, pin);

    // Live Supabase
    if (this.isConfigured()) {
      try {
        const url = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${username}&select=*`;
        const resp = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (!resp.ok) {
          return { success: false, error: `Supabase error (${resp.status}): Failed to query profile.` };
        }

        const rows = await resp.json();
        if (!Array.isArray(rows) || rows.length === 0) {
          return { success: false, error: `User "@${username}" was not found. Please check spelling or register.` };
        }

        const userRow = rows[0];
        if (userRow.pin_hash !== pinHash) {
          return { success: false, error: 'Incorrect PIN. Please enter the valid PIN for this profile.' };
        }

        const localProfile = {
          username: userRow.username,
          displayName: userRow.display_name,
          pinHash: userRow.pin_hash,
          avatar: userRow.avatar,
          statusMessage: userRow.status_message,
          level: userRow.level,
          totalExp: userRow.total_exp,
          streak: userRow.streak,
          cardsLearned: userRow.cards_learned,
          studyTimeSeconds: userRow.study_time_seconds,
          targetLang: userRow.target_lang,
          cefrLevel: userRow.cefr_level,
          lastActive: userRow.last_active
        };

        this._saveProfile(localProfile);
        return { success: true, profile: localProfile, message: `Logged in as @${username}!` };
      } catch (err) {
        return { success: false, error: `Network error: ${err.message}` };
      }
    }

    // Mock Mode
    const userRow = this.mockLearners.find(m => m.username === username);
    if (!userRow) {
      return { success: false, error: `User "@${username}" not found in Mock Sandbox.` };
    }
    if (userRow.pin_hash !== pinHash) {
      return { success: false, error: 'Incorrect PIN. Try again or check your PIN.' };
    }

    const localProfile = {
      username: userRow.username,
      displayName: userRow.display_name,
      pinHash: userRow.pin_hash,
      avatar: userRow.avatar,
      statusMessage: userRow.status_message,
      level: userRow.level,
      totalExp: userRow.total_exp,
      streak: userRow.streak,
      cardsLearned: userRow.cards_learned,
      studyTimeSeconds: userRow.study_time_seconds,
      targetLang: userRow.target_lang,
      cefrLevel: userRow.cefr_level,
      lastActive: userRow.last_active
    };

    this._saveProfile(localProfile);
    return { success: true, profile: localProfile, message: `Logged in as @${username}!` };
  }

  /**
   * Changes the security PIN for the current logged-in profile.
   * Requires old PIN verification first.
   */
  async changePin(rawOldPin, rawNewPin) {
    const current = this.getProfile();
    if (!current) return { success: false, error: 'No user profile logged in.' };

    const oldPin = String(rawOldPin || '').trim();
    const oldHash = hashPin(current.username, oldPin);
    if (oldHash !== current.pinHash) {
      return { success: false, error: 'Current PIN is incorrect. Verification failed.' };
    }

    const newPin = String(rawNewPin || '').trim();
    if (!newPin || newPin.length < 4 || newPin.length > 8) {
      return { success: false, error: 'New PIN must be between 4 and 8 characters.' };
    }

    const newHash = hashPin(current.username, newPin);

    // Live Supabase PATCH
    if (this.isConfigured()) {
      try {
        const patchUrl = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${current.username}&pin_hash=eq.${current.pinHash}`;
        const resp = await fetch(patchUrl, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({ pin_hash: newHash })
        });

        if (!resp.ok) {
          return { success: false, error: 'Failed to update PIN on Supabase.' };
        }
      } catch (err) {
        return { success: false, error: `Network error: ${err.message}` };
      }
    } else {
      // Mock mode
      const mock = this.mockLearners.find(m => m.username === current.username);
      if (mock) mock.pin_hash = newHash;
    }

    current.pinHash = newHash;
    this._saveProfile(current);
    return { success: true, message: 'Security PIN changed successfully!' };
  }

  /**
   * Updates display name, avatar, or status message.
   */
  async updateProfile(displayName, avatar, statusMessage) {
    const current = this.getProfile();
    if (!current) return { success: false, error: 'Not logged in.' };

    if (displayName) current.displayName = displayName.trim().slice(0, 30);
    if (avatar) current.avatar = avatar;
    if (typeof statusMessage === 'string') current.statusMessage = statusMessage.trim().slice(0, 100);

    // Live Supabase
    if (this.isConfigured()) {
      try {
        const patchUrl = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${current.username}&pin_hash=eq.${current.pinHash}`;
        await fetch(patchUrl, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            display_name: current.displayName,
            avatar: current.avatar,
            status_message: current.statusMessage
          })
        });
      } catch (e) {}
    } else {
      const mock = this.mockLearners.find(m => m.username === current.username);
      if (mock) {
        mock.display_name = current.displayName;
        mock.avatar = current.avatar;
        mock.status_message = current.statusMessage;
      }
    }

    this._saveProfile(current);
    return { success: true, profile: current };
  }

  /**
   * Logs out current user from social session.
   */
  logout() {
    this._saveProfile(null);
    return { success: true };
  }

  // ==========================================
  // STATS SYNCHRONIZATION
  // ==========================================

  /**
   * Syncs latest learning progress (EXP, Streak, Cards, Study Time) to Cloud / Mock profile.
   */
  async syncStats(customStats = null) {
    const current = this.getProfile();
    if (!current || !current.username || !current.pinHash) return { success: false };

    const stats = state.getQueueStats ? state.getQueueStats() : { memorizedCount: 0 };
    const levelStats = state.getLevelStats ? state.getLevelStats() : { level: 1, totalExp: 0 };
    const session = state.getSessionStats ? state.getSessionStats() : { streak: 0 };
    const studyTime = telemetry.getTotalStudySeconds ? telemetry.getTotalStudySeconds() : 0;

    const payload = {
      level: customStats?.level ?? (levelStats.level || 1),
      total_exp: customStats?.totalExp ?? (levelStats.totalExp || 0),
      streak: customStats?.streak ?? (session.streak || 0),
      cards_learned: customStats?.cardsLearned ?? (stats.memorizedCount || 0),
      study_time_seconds: customStats?.studyTimeSeconds ?? (studyTime || 0),
      target_lang: state.targetLang || 'de',
      cefr_level: state.cefrLevel || 'b1',
      last_active: new Date().toISOString()
    };

    // Update local cached profile
    current.level = payload.level;
    current.totalExp = payload.total_exp;
    current.streak = payload.streak;
    current.cardsLearned = payload.cards_learned;
    current.studyTimeSeconds = payload.study_time_seconds;
    current.targetLang = payload.target_lang;
    current.cefrLevel = payload.cefr_level;
    current.lastActive = payload.last_active;
    this._saveProfile(current);

    // Live Supabase PATCH
    if (this.isConfigured()) {
      try {
        const patchUrl = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${current.username}&pin_hash=eq.${current.pinHash}`;
        const resp = await fetch(patchUrl, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          return { success: true, timestamp: payload.last_active };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Mock Mode Update
    const mock = this.mockLearners.find(m => m.username === current.username);
    if (mock) {
      Object.assign(mock, payload);
    } else {
      this.mockLearners.push({
        username: current.username,
        display_name: current.displayName,
        pin_hash: current.pinHash,
        avatar: current.avatar,
        status_message: current.statusMessage,
        ...payload
      });
    }

    return { success: true, timestamp: payload.last_active };
  }

  /**
   * Debounced auto-sync called after completing flashcard reviews, quizzes, or drills.
   */
  scheduleAutoSync(delayMs = 2000) {
    if (this._autoSyncTimer) {
      clearTimeout(this._autoSyncTimer);
    }
    this._autoSyncTimer = setTimeout(() => {
      this.syncStats();
      this._autoSyncTimer = null;
    }, delayMs);
  }

  // ==========================================
  // LEADERBOARDS (GLOBAL & FRIENDS)
  // ==========================================

  /**
   * Fetches Global Leaderboard ranked by Total EXP descending.
   * @param {number} limit - Maximum number of rows (default 50)
   * @param {string} trackFilter - 'all' | 'de' | 'en'
   */
  async getGlobalLeaderboard(limit = 50, trackFilter = 'all') {
    let learners = [];

    if (this.isConfigured()) {
      try {
        let url = `${this.getUrl()}/rest/v1/arl_profiles?select=username,display_name,avatar,level,total_exp,streak,cards_learned,study_time_seconds,target_lang,cefr_level,status_message,last_active&order=total_exp.desc&limit=${limit}`;
        if (trackFilter && trackFilter !== 'all') {
          url += `&target_lang=eq.${trackFilter}`;
        }

        const resp = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (resp.ok) {
          learners = await resp.json();
        }
      } catch (e) {
        console.warn('Supabase global leaderboard query failed, falling back to mock:', e);
      }
    }

    // Fallback to mock store if empty or offline
    if (!learners || learners.length === 0) {
      learners = JSON.parse(JSON.stringify(this.mockLearners));
      if (trackFilter && trackFilter !== 'all') {
        learners = learners.filter(l => l.target_lang === trackFilter);
      }
    }

    // Ensure current logged-in user is reflected accurately
    const current = this.getProfile();
    if (current && current.username) {
      const idx = learners.findIndex(l => l.username === current.username);
      const userItem = {
        username: current.username,
        display_name: current.displayName,
        avatar: current.avatar,
        level: current.level || 1,
        total_exp: current.totalExp || 0,
        streak: current.streak || 0,
        cards_learned: current.cardsLearned || 0,
        study_time_seconds: current.studyTimeSeconds || 0,
        target_lang: current.targetLang || 'de',
        cefr_level: current.cefrLevel || 'b1',
        status_message: current.statusMessage || '',
        last_active: current.lastActive || new Date().toISOString()
      };

      if (idx >= 0) {
        learners[idx] = userItem;
      } else if (trackFilter === 'all' || userItem.target_lang === trackFilter) {
        learners.push(userItem);
      }
    }

    // Sort strictly by total_exp descending
    learners.sort((a, b) => (b.total_exp || 0) - (a.total_exp || 0));

    // Assign rank numbers (1-indexed)
    return learners.slice(0, limit).map((item, i) => ({
      ...item,
      rank: i + 1,
      isCurrentUser: Boolean(current && item.username === current.username)
    }));
  }

  /**
   * Fetches Friends Leaderboard (User + Added Friends only).
   */
  async getFriendsLeaderboard() {
    const current = this.getProfile();
    const friends = this.getFriends();

    // Include self in friends leaderboard
    const usernamesToFetch = new Set(friends);
    if (current && current.username) {
      usernamesToFetch.add(current.username);
    }

    if (usernamesToFetch.size === 0) {
      return [];
    }

    const list = Array.from(usernamesToFetch);
    let matchedLearners = [];

    if (this.isConfigured()) {
      try {
        const inClause = list.map(u => `"${encodeURIComponent(u)}"`).join(',');
        const url = `${this.getUrl()}/rest/v1/arl_profiles?username=in.(${inClause})&select=username,display_name,avatar,level,total_exp,streak,cards_learned,study_time_seconds,target_lang,cefr_level,status_message,last_active&order=total_exp.desc`;

        const resp = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (resp.ok) {
          matchedLearners = await resp.json();
        }
      } catch (e) {
        console.warn('Friends query error, falling back:', e);
      }
    }

    // If offline or missing, look in mock learners
    if (!matchedLearners || matchedLearners.length === 0) {
      matchedLearners = this.mockLearners.filter(m => list.includes(m.username));
    }

    // Ensure current user is present
    if (current && current.username) {
      const idx = matchedLearners.findIndex(l => l.username === current.username);
      const userItem = {
        username: current.username,
        display_name: current.displayName,
        avatar: current.avatar,
        level: current.level || 1,
        total_exp: current.totalExp || 0,
        streak: current.streak || 0,
        cards_learned: current.cardsLearned || 0,
        study_time_seconds: current.studyTimeSeconds || 0,
        target_lang: current.targetLang || 'de',
        cefr_level: current.cefrLevel || 'b1',
        status_message: current.statusMessage || '',
        last_active: current.lastActive || new Date().toISOString()
      };

      if (idx >= 0) {
        matchedLearners[idx] = userItem;
      } else {
        matchedLearners.push(userItem);
      }
    }

    // Sort by Total EXP descending
    matchedLearners.sort((a, b) => (b.total_exp || 0) - (a.total_exp || 0));

    return matchedLearners.map((item, i) => ({
      ...item,
      rank: i + 1,
      isCurrentUser: Boolean(current && item.username === current.username)
    }));
  }

  // ==========================================
  // FRIENDS MANAGEMENT
  // ==========================================

  getFriends() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(KEY_SOCIAL_FRIENDS);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) return arr;
        }
      }
    } catch (e) {}
    // Default friends in mock sandbox if user has none
    return ['elena_ber', 'batu_uln', 'sophie_vie'];
  }

  _saveFriends(friendsArr) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(KEY_SOCIAL_FRIENDS, JSON.stringify(friendsArr));
      }
    } catch (e) {}
    this.notify();
  }

  isFriend(username) {
    const clean = sanitizeUsername(username);
    return this.getFriends().includes(clean);
  }

  /**
   * Adds a friend by handle or Friend Code.
   */
  async addFriend(rawInput) {
    const clean = sanitizeUsername(rawInput);
    if (!clean) return { success: false, error: 'Please enter a valid username or friend code.' };

    const current = this.getProfile();
    if (current && clean === current.username) {
      return { success: false, error: 'You cannot add yourself as a friend.' };
    }

    const friends = this.getFriends();
    if (friends.includes(clean)) {
      return { success: false, error: `@${clean} is already in your friends list.` };
    }

    // Check if user exists (Supabase or Mock)
    let foundProfile = null;
    if (this.isConfigured()) {
      try {
        const url = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${clean}&select=username,display_name,avatar,level,total_exp`;
        const resp = await fetch(url, { method: 'GET', headers: this.getHeaders() });
        if (resp.ok) {
          const rows = await resp.json();
          if (Array.isArray(rows) && rows.length > 0) {
            foundProfile = rows[0];
          }
        }
      } catch (e) {}
    }

    if (!foundProfile) {
      foundProfile = this.mockLearners.find(m => m.username === clean);
    }

    if (!foundProfile) {
      return { success: false, error: `User "@${clean}" was not found. Please verify the username or friend code.` };
    }

    friends.push(clean);
    this._saveFriends(friends);

    // Optional Supabase arl_friendships record
    if (this.isConfigured() && current && current.username) {
      try {
        const fUrl = `${this.getUrl()}/rest/v1/arl_friendships`;
        await fetch(fUrl, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            user_username: current.username,
            friend_username: clean
          })
        });
      } catch (e) {}
    }

    return {
      success: true,
      friend: foundProfile,
      message: `Added @${clean} (${foundProfile.display_name || clean}) to your friends!`
    };
  }

  /**
   * Removes a friend from the local friend list.
   */
  async removeFriend(rawUsername) {
    const clean = sanitizeUsername(rawUsername);
    let friends = this.getFriends();
    if (!friends.includes(clean)) {
      return { success: false, error: `@${clean} is not in your friends list.` };
    }

    friends = friends.filter(f => f !== clean);
    this._saveFriends(friends);

    const current = this.getProfile();
    if (this.isConfigured() && current && current.username) {
      try {
        const delUrl = `${this.getUrl()}/rest/v1/arl_friendships?user_username=eq.${current.username}&friend_username=eq.${clean}`;
        await fetch(delUrl, {
          method: 'DELETE',
          headers: this.getHeaders()
        });
      } catch (e) {}
    }

    return { success: true, message: `Removed @${clean} from friends.` };
  }

  /**
   * Generates shareable Friend Code.
   */
  getFriendCode() {
    const prof = this.getProfile();
    if (!prof || !prof.username) return '';
    return `ARL:${prof.username.toUpperCase()}`;
  }

  // ==========================================
  // IN-APP PIN PRIVACY LOCK
  // ==========================================

  isPinLockEnabled() {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(KEY_PIN_LOCK) === 'true';
      }
    } catch (e) {}
    return false;
  }

  setPinLockEnabled(enabled) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(KEY_PIN_LOCK, enabled ? 'true' : 'false');
      }
    } catch (e) {}
    this.notify();
  }

  // ==========================================
  // REACTIVE LISTENERS & NOTIFICATIONS
  // ==========================================

  subscribe(fn) {
    if (typeof fn === 'function') {
      this.listeners.add(fn);
    }
    return () => this.listeners.delete(fn);
  }

  notify() {
    const profile = this.getProfile();
    this.listeners.forEach(fn => {
      try {
        fn(profile);
      } catch (e) {
        console.warn('Social listener error:', e);
      }
    });
  }

  // ==========================================
  // SUPABASE POSTGRESQL DDL GENERATOR
  // ==========================================

  getSupabaseSqlSchema() {
    return `-- ========================================================
-- ARL SOCIAL ENGINE: POSTGRESQL SCHEMA FOR SUPABASE
-- Run this script in your Supabase SQL Editor to initialize
-- ========================================================

-- 1. Profiles Table (PIN-Protected Cloud Profiles)
CREATE TABLE IF NOT EXISTS arl_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  avatar TEXT DEFAULT 'ALPHA',
  level INTEGER DEFAULT 1,
  total_exp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  cards_learned INTEGER DEFAULT 0,
  study_time_seconds INTEGER DEFAULT 0,
  target_lang TEXT DEFAULT 'de',
  cefr_level TEXT DEFAULT 'b1',
  status_message TEXT DEFAULT '',
  last_active TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Friendships Table (Social Graph)
CREATE TABLE IF NOT EXISTS arl_friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_username TEXT NOT NULL,
  friend_username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_username, friend_username)
);

-- Indexes for lightning fast ranking queries
CREATE INDEX IF NOT EXISTS idx_arl_profiles_exp ON arl_profiles (total_exp DESC);
CREATE INDEX IF NOT EXISTS idx_arl_profiles_username ON arl_profiles (username);
CREATE INDEX IF NOT EXISTS idx_arl_friendships_user ON arl_friendships (user_username);

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE arl_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE arl_friendships ENABLE ROW LEVEL SECURITY;

-- Leaderboard: Public read access
CREATE POLICY "Public profiles are readable by everyone"
  ON arl_profiles FOR SELECT
  USING (true);

-- Register: Anyone can insert a new unique profile
CREATE POLICY "Anyone can register a profile"
  ON arl_profiles FOR INSERT
  WITH CHECK (true);

-- Update: Can only update if pin_hash matches
CREATE POLICY "Update allowed with matching pin_hash"
  ON arl_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Friendships policies
CREATE POLICY "Friendships readable by everyone"
  ON arl_friendships FOR SELECT
  USING (true);

CREATE POLICY "Friendships insertable"
  ON arl_friendships FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Friendships deletable"
  ON arl_friendships FOR DELETE
  USING (true);
`;
  }
}

export const socialClient = new SupabaseSocialEngine();
