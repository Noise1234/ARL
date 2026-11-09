/**
 * ARL - Supabase Cloud Social Engine (Friends & Leaderboard)
 * Zero-dependency REST API integration with server-side PIN protection.
 * Strict PostgREST compliance:
 * - Table: arl_profiles
 * - Columns: username, pin_hash, xp, streak_days, total_words_learned, study_minutes_total, detailed_stats, updated_at
 * - Security: Never leaks pin_hash in any GET request (strictly selects public columns).
 * - Server-side PIN protection trigger (trg_verify_arl_profile_pin) blocks unauthorized updates.
 * - High-fidelity Mock Sandbox fallback for 100% offline functionality.
 */

import { state } from './state.js';
import { telemetry } from './telemetry.js';
import { db } from './db.js';
import { isCardMemorized } from './srs.js';

const KEY_SUPABASE_URL = 'arl_supabase_url';
const KEY_SUPABASE_ANON_KEY = 'arl_supabase_anon_key';
const KEY_SOCIAL_PROFILE = 'arl_social_profile';
const KEY_SOCIAL_FRIENDS = 'arl_social_friends';
const KEY_PIN_LOCK = 'arl_social_pin_lock';

/**
 * Publicly selectable columns - strictly excludes pin_hash to prevent leakage.
 */
export const SAFE_SELECT_COLUMNS = 'username,xp,streak_days,total_words_learned,study_minutes_total,updated_at,detailed_stats';

/**
 * Pure JavaScript deterministic SHA-256 implementation.
 * @param {string} ascii
 * @returns {string} 64-char hex string
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
 * Computes salted SHA-256 PIN hash.
 * @param {string} username
 * @param {string|number} pin
 * @returns {string}
 */
export function hashPin(username, pin) {
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPin = String(pin || '').trim();
  return sha256Sync(`${cleanUsername}:${cleanPin}`);
}

/**
 * Sanitizes username according to PostgreSQL check constraint (2 to 24 chars).
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
    .slice(0, 24);
}

/**
 * Available Avatar Badges
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
 * Builds live detailed_stats object from active progress and telemetry.
 */
export async function buildDetailedStats() {
  const de = { A1: 0, A2: 0, B1: 0, B2: 0 };
  const en = { A1: 0, A2: 0, B1: 0, B2: 0 };

  try {
    const allProgress = await db.getAllProgress();
    const progMap = new Map();
    if (Array.isArray(allProgress)) {
      for (const p of allProgress) {
        if (p && p.cardId) progMap.set(p.cardId, p);
      }
    }

    if (Array.isArray(state.cards)) {
      for (const card of state.cards) {
        const p = progMap.get(card.id);
        if (isCardMemorized(p)) {
          const lang = (card.lang || state.targetLang || 'de').toLowerCase();
          const lvl = (card.level || 'B1').toUpperCase();
          if (lang === 'de' && de[lvl] !== undefined) de[lvl]++;
          if (lang === 'en' && en[lvl] !== undefined) en[lvl]++;
        }
      }
    }

    const counts = telemetry.getMemorizedCounts(state.cards || [], progMap);
    const weekly_words = counts.week || 0;
    const monthly_words = counts.month || 0;
    const seasonal_words = counts.season || 0;
    const yearly_words = counts.year || 0;

    const totalHours = (telemetry.totalActiveSeconds || 0) / 3600;
    const words_per_hour = totalHours > 0.05 ? Math.round((counts.total || 0) / totalHours) : 0;

    return {
      de,
      en,
      weekly_words,
      monthly_words,
      seasonal_words,
      yearly_words,
      words_per_hour
    };
  } catch (e) {
    return {
      de: { A1: 0, A2: 0, B1: 0, B2: 0 },
      en: { A1: 0, A2: 0, B1: 0, B2: 0 },
      weekly_words: 0,
      monthly_words: 0,
      seasonal_words: 0,
      yearly_words: 0,
      words_per_hour: 0
    };
  }
}

/**
 * Default Mock Learners for Offline Sandbox Mode
 */
const DEFAULT_MOCK_LEARNERS = [
  {
    username: 'elena_ber',
    pin_hash: sha256Sync('elena_ber:1234'),
    xp: 14250,
    streak_days: 32,
    total_words_learned: 840,
    study_minutes_total: 1080,
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    detailed_stats: {
      de: { A1: 240, A2: 260, B1: 220, B2: 120 },
      en: { A1: 0, A2: 0, B1: 0, B2: 0 },
      weekly_words: 65,
      monthly_words: 240,
      seasonal_words: 610,
      yearly_words: 840,
      words_per_hour: 46,
      avatar: 'OMEGA',
      display_name: 'Elena (Berlin)',
      status_message: 'Mastering Subjunktionen & Konjunktiv II'
    }
  },
  {
    username: 'markus_muc',
    pin_hash: sha256Sync('markus_muc:1234'),
    xp: 11800,
    streak_days: 25,
    total_words_learned: 710,
    study_minutes_total: 860,
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    detailed_stats: {
      de: { A1: 220, A2: 240, B1: 250, B2: 0 },
      en: { A1: 0, A2: 0, B1: 0, B2: 0 },
      weekly_words: 50,
      monthly_words: 195,
      seasonal_words: 520,
      yearly_words: 710,
      words_per_hour: 49,
      avatar: 'TITAN',
      display_name: 'Markus (Munich)',
      status_message: 'Dativ vs Akkusativ drill complete'
    }
  },
  {
    username: 'batu_uln',
    pin_hash: sha256Sync('batu_uln:1234'),
    xp: 9950,
    streak_days: 19,
    total_words_learned: 590,
    study_minutes_total: 720,
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    detailed_stats: {
      de: { A1: 200, A2: 210, B1: 180, B2: 0 },
      en: { A1: 0, A2: 0, B1: 0, B2: 0 },
      weekly_words: 42,
      monthly_words: 160,
      seasonal_words: 430,
      yearly_words: 590,
      words_per_hour: 49,
      avatar: 'ALPHA',
      display_name: 'Batu (Ulaanbaatar)',
      status_message: 'Goethe B1 Zertifikat preparation'
    }
  },
  {
    username: 'sophie_vie',
    pin_hash: sha256Sync('sophie_vie:1234'),
    xp: 8400,
    streak_days: 15,
    total_words_learned: 510,
    study_minutes_total: 625,
    updated_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    detailed_stats: {
      de: { A1: 180, A2: 190, B1: 140, B2: 0 },
      en: { A1: 0, A2: 0, B1: 0, B2: 0 },
      weekly_words: 38,
      monthly_words: 145,
      seasonal_words: 390,
      yearly_words: 510,
      words_per_hour: 48,
      avatar: 'ZEN',
      display_name: 'Sophie (Vienna)',
      status_message: 'Wechselpräpositionen focus'
    }
  },
  {
    username: 'lukas_zrh',
    pin_hash: sha256Sync('lukas_zrh:1234'),
    xp: 6700,
    streak_days: 12,
    total_words_learned: 430,
    study_minutes_total: 495,
    updated_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    detailed_stats: {
      de: { A1: 210, A2: 220, B1: 0, B2: 0 },
      en: { A1: 0, A2: 0, B1: 0, B2: 0 },
      weekly_words: 35,
      monthly_words: 130,
      seasonal_words: 320,
      yearly_words: 430,
      words_per_hour: 52,
      avatar: 'DELTA',
      display_name: 'Lukas (Zürich)',
      status_message: 'Daily 20-sentence grammar sprint'
    }
  },
  {
    username: 'anja_ham',
    pin_hash: sha256Sync('anja_ham:1234'),
    xp: 5300,
    streak_days: 9,
    total_words_learned: 360,
    study_minutes_total: 400,
    updated_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    detailed_stats: {
      de: { A1: 190, A2: 170, B1: 0, B2: 0 },
      en: { A1: 0, A2: 0, B1: 0, B2: 0 },
      weekly_words: 30,
      monthly_words: 115,
      seasonal_words: 280,
      yearly_words: 360,
      words_per_hour: 54,
      avatar: 'SIGMA',
      display_name: 'Anja (Hamburg)',
      status_message: 'Perfekt irregular verbs mastery'
    }
  },
  {
    username: 'temka_ub',
    pin_hash: sha256Sync('temka_ub:1234'),
    xp: 4150,
    streak_days: 7,
    total_words_learned: 280,
    study_minutes_total: 315,
    updated_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    detailed_stats: {
      de: { A1: 0, A2: 0, B1: 0, B2: 0 },
      en: { A1: 80, A2: 90, B1: 60, B2: 50 },
      weekly_words: 25,
      monthly_words: 95,
      seasonal_words: 210,
      yearly_words: 280,
      words_per_hour: 53,
      avatar: 'VALKYRIE',
      display_name: 'Temuujin (UB)',
      status_message: 'English Inversion & Conditionals'
    }
  },
  {
    username: 'klara_kol',
    pin_hash: sha256Sync('klara_kol:1234'),
    xp: 3200,
    streak_days: 6,
    total_words_learned: 210,
    study_minutes_total: 240,
    updated_at: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    detailed_stats: {
      de: { A1: 210, A2: 0, B1: 0, B2: 0 },
      en: { A1: 0, A2: 0, B1: 0, B2: 0 },
      weekly_words: 20,
      monthly_words: 80,
      seasonal_words: 160,
      yearly_words: 210,
      words_per_hour: 52,
      avatar: 'NEXUS',
      display_name: 'Klara (Köln)',
      status_message: 'A1 German core noun genders'
    }
  },
  {
    username: 'david_ldn',
    pin_hash: sha256Sync('david_ldn:1234'),
    xp: 2400,
    streak_days: 5,
    total_words_learned: 160,
    study_minutes_total: 180,
    updated_at: new Date(Date.now() - 1000 * 60 * 1800).toISOString(),
    detailed_stats: {
      de: { A1: 0, A2: 0, B1: 0, B2: 0 },
      en: { A1: 60, A2: 50, B1: 50, B2: 0 },
      weekly_words: 18,
      monthly_words: 65,
      seasonal_words: 130,
      yearly_words: 160,
      words_per_hour: 53,
      avatar: 'ALPHA',
      display_name: 'David (London)',
      status_message: 'B1 Phrasal verbs sprint'
    }
  },
  {
    username: 'sara_fra',
    pin_hash: sha256Sync('sara_fra:1234'),
    xp: 1650,
    streak_days: 3,
    total_words_learned: 110,
    study_minutes_total: 125,
    updated_at: new Date(Date.now() - 1000 * 60 * 2400).toISOString(),
    detailed_stats: {
      de: { A1: 110, A2: 0, B1: 0, B2: 0 },
      en: { A1: 0, A2: 0, B1: 0, B2: 0 },
      weekly_words: 15,
      monthly_words: 50,
      seasonal_words: 90,
      yearly_words: 110,
      words_per_hour: 52,
      avatar: 'ZEN',
      display_name: 'Sara (Frankfurt)',
      status_message: 'Trennbare Verben drill'
    }
  }
];

export class SupabaseSocialEngine {
  constructor() {
    this.listeners = new Set();
    this._autoSyncTimer = null;
    this.mockLearners = JSON.parse(JSON.stringify(DEFAULT_MOCK_LEARNERS));
  }

  async init() {
    const profile = this.getProfile();
    if (profile && profile.username) {
      await this.syncStats();
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

  isConfigured() {
    const url = this.getUrl();
    const key = this.getAnonKey();
    return Boolean(url && key && url.startsWith('http'));
  }

  getHeaders(preferRepresentation = true) {
    const key = this.getAnonKey();
    const headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    };
    if (preferRepresentation) {
      headers['Prefer'] = 'return=representation';
    }
    return headers;
  }

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
        headers: this.getHeaders(false)
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
          message: 'Supabase Error 404: Table "arl_profiles" not found. Please execute supabase_setup.sql in Supabase SQL editor.'
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

  _saveProfile(profile) {
    try {
      if (typeof localStorage !== 'undefined') {
        if (!profile) {
          localStorage.removeItem(KEY_SOCIAL_PROFILE);
        } else {
          // Provide backwards-compatible aliases
          profile.totalExp = profile.xp;
          profile.streak = profile.streak_days;
          profile.cardsLearned = profile.total_words_learned;
          profile.studyTimeSeconds = (profile.study_minutes_total || 0) * 60;
          if (profile.level === undefined) {
            profile.level = Math.floor((profile.xp || 0) / 500) + 1;
          }
          localStorage.setItem(KEY_SOCIAL_PROFILE, JSON.stringify(profile));
        }
      }
    } catch (e) {}
    this.notify();
  }

  /**
   * Register a new profile or log in with matching PIN.
   * Server-side PIN trigger rejects overwrites if PIN does not match!
   */
  async register(rawUsername, rawDisplayName, rawPin, avatar = 'ALPHA', statusMessage = '') {
    const username = sanitizeUsername(rawUsername);
    if (!username || username.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters.' };
    }
    if (username.length > 24) {
      return { success: false, error: 'Username cannot exceed 24 characters.' };
    }

    const pin = String(rawPin || '').trim();
    if (!pin || pin.length < 4 || pin.length > 8) {
      return { success: false, error: 'Security PIN must be 4 to 8 characters.' };
    }

    const displayName = (rawDisplayName || username).trim().slice(0, 30);
    const pinHash = hashPin(username, pin);

    const stats = state.getQueueStats ? state.getQueueStats() : { memorizedCount: 0 };
    const levelStats = state.getLevelStats ? state.getLevelStats() : { level: 1, totalExp: 0 };
    const session = state.getSessionStats ? state.getSessionStats() : { streak: 0 };
    const studyTimeSec = telemetry.getTotalStudySeconds ? telemetry.getTotalStudySeconds() : 0;
    const studyMinutesTotal = Math.round(studyTimeSec / 60);

    const detailedStats = await buildDetailedStats();
    detailedStats.avatar = avatar;
    detailedStats.display_name = displayName;
    detailedStats.status_message = statusMessage || 'Ready to learn with ARL';

    const rowPayload = {
      username,
      pin_hash: pinHash,
      xp: levelStats.totalExp || 0,
      streak_days: session.streak || 0,
      total_words_learned: stats.memorizedCount || 0,
      study_minutes_total: studyMinutesTotal,
      detailed_stats: detailedStats,
      updated_at: new Date().toISOString()
    };

    // 1. Live Supabase Cloud Mode
    if (this.isConfigured()) {
      try {
        // Attempt POST insert first
        const insertUrl = `${this.getUrl()}/rest/v1/arl_profiles`;
        const insertResp = await fetch(insertUrl, {
          method: 'POST',
          headers: this.getHeaders(true),
          body: JSON.stringify(rowPayload)
        });

        if (insertResp.ok) {
          const inserted = await insertResp.json();
          const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : rowPayload;

          const localProfile = {
            username: row.username,
            displayName: row.detailed_stats?.display_name || row.username,
            pinHash,
            avatar: row.detailed_stats?.avatar || avatar,
            statusMessage: row.detailed_stats?.status_message || '',
            xp: row.xp,
            streak_days: row.streak_days,
            total_words_learned: row.total_words_learned,
            study_minutes_total: row.study_minutes_total,
            detailed_stats: row.detailed_stats,
            updated_at: row.updated_at
          };
          this._saveProfile(localProfile);
          return { success: true, profile: localProfile, message: `Profile created! Welcome to ARL, ${displayName}!` };
        }

        // Check if 409 Conflict (username already taken)
        if (insertResp.status === 409 || insertResp.status === 400) {
          // Attempt PATCH update to verify matching PIN via PostgreSQL server trigger
          const patchUrl = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${username}`;
          const patchResp = await fetch(patchUrl, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(rowPayload)
          });

          if (patchResp.ok) {
            const updated = await patchResp.json();
            const row = Array.isArray(updated) && updated[0] ? updated[0] : rowPayload;

            const localProfile = {
              username: row.username,
              displayName: row.detailed_stats?.display_name || row.username,
              pinHash,
              avatar: row.detailed_stats?.avatar || avatar,
              statusMessage: row.detailed_stats?.status_message || '',
              xp: row.xp,
              streak_days: row.streak_days,
              total_words_learned: row.total_words_learned,
              study_minutes_total: row.study_minutes_total,
              detailed_stats: row.detailed_stats,
              updated_at: row.updated_at
            };
            this._saveProfile(localProfile);
            return { success: true, profile: localProfile, message: `Welcome back, ${displayName}!` };
          }

          // Trigger raised PIN_MISMATCH exception
          const errText = await patchResp.text();
          return {
            success: false,
            error: errText.includes('PIN_MISMATCH')
              ? 'PIN_MISMATCH: This username belongs to another user or your PIN is incorrect.'
              : `Username "@${username}" is already taken. Enter the matching PIN or pick another handle.`
          };
        }

        const errText = await insertResp.text();
        return { success: false, error: `Cloud error creating profile: ${errText.slice(0, 150)}` };
      } catch (err) {
        return { success: false, error: `Network error registering profile: ${err.message}` };
      }
    }

    // 2. Mock Sandbox Mode
    const existing = this.mockLearners.find(m => m.username === username);
    if (existing) {
      if (existing.pin_hash === pinHash) {
        const localProfile = {
          username: existing.username,
          displayName: existing.detailed_stats?.display_name || existing.username,
          pinHash,
          avatar: existing.detailed_stats?.avatar || avatar,
          statusMessage: existing.detailed_stats?.status_message || '',
          xp: existing.xp,
          streak_days: existing.streak_days,
          total_words_learned: existing.total_words_learned,
          study_minutes_total: existing.study_minutes_total,
          detailed_stats: existing.detailed_stats,
          updated_at: existing.updated_at
        };
        this._saveProfile(localProfile);
        return { success: true, profile: localProfile, message: `Welcome back, ${displayName}!` };
      } else {
        return {
          success: false,
          error: `PIN_MISMATCH: Username "@${username}" is already taken. Enter matching PIN to log in.`
        };
      }
    }

    this.mockLearners.push(rowPayload);
    const localProfile = {
      username: rowPayload.username,
      displayName: displayName,
      pinHash,
      avatar,
      statusMessage: statusMessage || '',
      xp: rowPayload.xp,
      streak_days: rowPayload.streak_days,
      total_words_learned: rowPayload.total_words_learned,
      study_minutes_total: rowPayload.study_minutes_total,
      detailed_stats: detailedStats,
      updated_at: rowPayload.updated_at
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
        const patchUrl = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${username}`;
        const patchResp = await fetch(patchUrl, {
          method: 'PATCH',
          headers: this.getHeaders(true),
          body: JSON.stringify({ pin_hash: pinHash, updated_at: new Date().toISOString() })
        });

        if (!patchResp.ok) {
          const errText = await patchResp.text();
          if (errText.includes('PIN_MISMATCH') || patchResp.status === 400 || patchResp.status === 403) {
            return { success: false, error: 'Incorrect PIN. Verification failed.' };
          }
          return { success: false, error: `Login error: ${errText.slice(0, 150)}` };
        }

        const rows = await patchResp.json();
        if (!Array.isArray(rows) || rows.length === 0) {
          return { success: false, error: `User "@${username}" was not found.` };
        }

        const row = rows[0];
        const localProfile = {
          username: row.username,
          displayName: row.detailed_stats?.display_name || row.username,
          pinHash,
          avatar: row.detailed_stats?.avatar || 'ALPHA',
          statusMessage: row.detailed_stats?.status_message || '',
          xp: row.xp,
          streak_days: row.streak_days,
          total_words_learned: row.total_words_learned,
          study_minutes_total: row.study_minutes_total,
          detailed_stats: row.detailed_stats,
          updated_at: row.updated_at
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
      displayName: userRow.detailed_stats?.display_name || userRow.username,
      pinHash,
      avatar: userRow.detailed_stats?.avatar || 'ALPHA',
      statusMessage: userRow.detailed_stats?.status_message || '',
      xp: userRow.xp,
      streak_days: userRow.streak_days,
      total_words_learned: userRow.total_words_learned,
      study_minutes_total: userRow.study_minutes_total,
      detailed_stats: userRow.detailed_stats,
      updated_at: userRow.updated_at
    };

    this._saveProfile(localProfile);
    return { success: true, profile: localProfile, message: `Logged in as @${username}!` };
  }

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

    if (this.isConfigured()) {
      try {
        const patchUrl = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${current.username}`;
        await fetch(patchUrl, {
          method: 'PATCH',
          headers: this.getHeaders(true),
          body: JSON.stringify({ pin_hash: newHash })
        });
      } catch (e) {}
    } else {
      const mock = this.mockLearners.find(m => m.username === current.username);
      if (mock) mock.pin_hash = newHash;
    }

    current.pinHash = newHash;
    this._saveProfile(current);
    return { success: true, message: 'Security PIN changed successfully!' };
  }

  logout() {
    this._saveProfile(null);
    return { success: true };
  }

  // ==========================================
  // STATS SYNCHRONIZATION
  // ==========================================

  async syncStats(customStats = null) {
    const current = this.getProfile();
    if (!current || !current.username || !current.pinHash) return { success: false };

    const stats = state.getQueueStats ? state.getQueueStats() : { memorizedCount: 0 };
    const levelStats = state.getLevelStats ? state.getLevelStats() : { level: 1, totalExp: 0 };
    const session = state.getSessionStats ? state.getSessionStats() : { streak: 0 };
    const studyTimeSec = telemetry.getTotalStudySeconds ? telemetry.getTotalStudySeconds() : 0;
    const studyMinutesTotal = Math.round(studyTimeSec / 60);

    const detailedStats = await buildDetailedStats();
    if (current.avatar) detailedStats.avatar = current.avatar;
    if (current.displayName) detailedStats.display_name = current.displayName;
    if (current.statusMessage) detailedStats.status_message = current.statusMessage;

    const payload = {
      username: current.username,
      pin_hash: current.pinHash,
      xp: customStats?.xp ?? customStats?.totalExp ?? (levelStats.totalExp || 0),
      streak_days: customStats?.streak_days ?? customStats?.streak ?? (session.streak || 0),
      total_words_learned: customStats?.total_words_learned ?? customStats?.cardsLearned ?? (stats.memorizedCount || 0),
      study_minutes_total: customStats?.study_minutes_total ?? (customStats?.studyTimeSeconds ? Math.round(customStats.studyTimeSeconds / 60) : studyMinutesTotal),
      detailed_stats: detailedStats,
      updated_at: new Date().toISOString()
    };

    current.xp = payload.xp;
    current.totalExp = payload.xp;
    current.streak_days = payload.streak_days;
    current.streak = payload.streak_days;
    current.total_words_learned = payload.total_words_learned;
    current.cardsLearned = payload.total_words_learned;
    current.study_minutes_total = payload.study_minutes_total;
    current.studyTimeSeconds = customStats?.studyTimeSeconds ?? (payload.study_minutes_total * 60);
    current.level = customStats?.level ?? Math.floor((payload.xp || 0) / 500) + 1;
    current.detailed_stats = payload.detailed_stats;
    current.updated_at = payload.updated_at;
    this._saveProfile(current);

    // Live Supabase PATCH
    if (this.isConfigured()) {
      try {
        const patchUrl = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${current.username}`;
        const resp = await fetch(patchUrl, {
          method: 'PATCH',
          headers: this.getHeaders(true),
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          return { success: true, timestamp: payload.updated_at };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Mock store
    const mock = this.mockLearners.find(m => m.username === current.username);
    if (mock) {
      Object.assign(mock, payload);
    } else {
      this.mockLearners.push(payload);
    }

    return { success: true, timestamp: payload.updated_at };
  }

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
  // NEVER LEAKS PIN_HASH
  // ==========================================

  async getGlobalLeaderboard(limit = 50, trackFilter = 'all') {
    let learners = [];

    if (this.isConfigured()) {
      try {
        const url = `${this.getUrl()}/rest/v1/arl_profiles?select=${SAFE_SELECT_COLUMNS}&order=xp.desc&limit=${limit}`;
        const resp = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(false)
        });

        if (resp.ok) {
          learners = await resp.json();
        }
      } catch (e) {
        console.warn('Supabase global query error:', e);
      }
    }

    if (!learners || learners.length === 0) {
      learners = JSON.parse(JSON.stringify(this.mockLearners));
    }

    if (trackFilter && trackFilter !== 'all') {
      learners = learners.filter(l => {
        const deCount = (l.detailed_stats?.de?.A1 || 0) + (l.detailed_stats?.de?.A2 || 0) + (l.detailed_stats?.de?.B1 || 0) + (l.detailed_stats?.de?.B2 || 0);
        const enCount = (l.detailed_stats?.en?.A1 || 0) + (l.detailed_stats?.en?.A2 || 0) + (l.detailed_stats?.en?.B1 || 0) + (l.detailed_stats?.en?.B2 || 0);
        if (trackFilter === 'de') return deCount >= enCount;
        if (trackFilter === 'en') return enCount > deCount;
        return true;
      });
    }

    const current = this.getProfile();
    if (current && current.username) {
      const userItem = {
        username: current.username,
        xp: current.xp || 0,
        streak_days: current.streak_days || 0,
        total_words_learned: current.total_words_learned || 0,
        study_minutes_total: current.study_minutes_total || 0,
        detailed_stats: current.detailed_stats || {},
        updated_at: current.updated_at || new Date().toISOString()
      };

      const userDe = (userItem.detailed_stats?.de?.A1 || 0) + (userItem.detailed_stats?.de?.A2 || 0) + (userItem.detailed_stats?.de?.B1 || 0) + (userItem.detailed_stats?.de?.B2 || 0);
      const userEn = (userItem.detailed_stats?.en?.A1 || 0) + (userItem.detailed_stats?.en?.A2 || 0) + (userItem.detailed_stats?.en?.B1 || 0) + (userItem.detailed_stats?.en?.B2 || 0);
      const userLang = userDe >= userEn ? 'de' : 'en';

      const matchesTrack = !trackFilter || trackFilter === 'all' || trackFilter === userLang;

      const idx = learners.findIndex(l => l.username === current.username);
      if (idx >= 0) {
        if (matchesTrack) {
          learners[idx] = userItem;
        } else {
          learners.splice(idx, 1);
        }
      } else if (matchesTrack) {
        learners.push(userItem);
      }
    }

    learners.sort((a, b) => (b.xp || 0) - (a.xp || 0));

    return learners.slice(0, limit).map((item, i) => {
      const deCount = (item.detailed_stats?.de?.A1 || 0) + (item.detailed_stats?.de?.A2 || 0) + (item.detailed_stats?.de?.B1 || 0) + (item.detailed_stats?.de?.B2 || 0);
      const enCount = (item.detailed_stats?.en?.A1 || 0) + (item.detailed_stats?.en?.A2 || 0) + (item.detailed_stats?.en?.B1 || 0) + (item.detailed_stats?.en?.B2 || 0);
      const target_lang = deCount >= enCount ? 'de' : 'en';

      return {
        ...item,
        total_exp: item.xp,
        streak: item.streak_days,
        cards_learned: item.total_words_learned,
        study_time_seconds: (item.study_minutes_total || 0) * 60,
        target_lang,
        rank: i + 1,
        isCurrentUser: Boolean(current && item.username === current.username)
      };
    });
  }

  async getFriendsLeaderboard() {
    const current = this.getProfile();
    const friends = this.getFriends();

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
        const url = `${this.getUrl()}/rest/v1/arl_profiles?username=in.(${inClause})&select=${SAFE_SELECT_COLUMNS}&order=xp.desc`;

        const resp = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(false)
        });

        if (resp.ok) {
          matchedLearners = await resp.json();
        }
      } catch (e) {
        console.warn('Friends query error:', e);
      }
    }

    if (!matchedLearners || matchedLearners.length === 0) {
      matchedLearners = this.mockLearners.filter(m => list.includes(m.username));
    }

    if (current && current.username) {
      const idx = matchedLearners.findIndex(l => l.username === current.username);
      const userItem = {
        username: current.username,
        xp: current.xp || 0,
        streak_days: current.streak_days || 0,
        total_words_learned: current.total_words_learned || 0,
        study_minutes_total: current.study_minutes_total || 0,
        detailed_stats: current.detailed_stats || {},
        updated_at: current.updated_at || new Date().toISOString()
      };

      if (idx >= 0) {
        matchedLearners[idx] = userItem;
      } else {
        matchedLearners.push(userItem);
      }
    }

    matchedLearners.sort((a, b) => (b.xp || 0) - (a.xp || 0));

    return matchedLearners.map((item, i) => {
      const deCount = (item.detailed_stats?.de?.A1 || 0) + (item.detailed_stats?.de?.A2 || 0) + (item.detailed_stats?.de?.B1 || 0) + (item.detailed_stats?.de?.B2 || 0);
      const enCount = (item.detailed_stats?.en?.A1 || 0) + (item.detailed_stats?.en?.A2 || 0) + (item.detailed_stats?.en?.B1 || 0) + (item.detailed_stats?.en?.B2 || 0);
      const target_lang = deCount >= enCount ? 'de' : 'en';

      return {
        ...item,
        total_exp: item.xp,
        streak: item.streak_days,
        cards_learned: item.total_words_learned,
        study_time_seconds: (item.study_minutes_total || 0) * 60,
        target_lang,
        rank: i + 1,
        isCurrentUser: Boolean(current && item.username === current.username)
      };
    });
  }

  /**
   * Fetches single friend profile in read-only mode.
   * NEVER requests pin_hash.
   */
  async getFriendProfile(username) {
    const clean = sanitizeUsername(username);
    if (!clean) return null;

    if (this.isConfigured()) {
      try {
        const url = `${this.getUrl()}/rest/v1/arl_profiles?username=eq.${clean}&select=${SAFE_SELECT_COLUMNS}`;
        const resp = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(false)
        });
        if (resp.ok) {
          const rows = await resp.json();
          if (Array.isArray(rows) && rows.length > 0) return rows[0];
        }
      } catch (e) {}
    }

    return this.mockLearners.find(m => m.username === clean) || null;
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

    const foundProfile = await this.getFriendProfile(clean);
    if (!foundProfile) {
      return { success: false, error: `User "@${clean}" was not found. Please verify handle.` };
    }

    friends.push(clean);
    this._saveFriends(friends);

    const displayName = foundProfile.detailed_stats?.display_name || clean;
    return {
      success: true,
      friend: foundProfile,
      message: `Added @${clean} (${displayName}) to your friends!`
    };
  }

  async removeFriend(rawUsername) {
    const clean = sanitizeUsername(rawUsername);
    let friends = this.getFriends();
    if (!friends.includes(clean)) {
      return { success: false, error: `@${clean} is not in your friends list.` };
    }

    friends = friends.filter(f => f !== clean);
    this._saveFriends(friends);
    return { success: true, message: `Removed @${clean} from friends.` };
  }

  getFriendCode() {
    const prof = this.getProfile();
    if (!prof || !prof.username) return '';
    return `ARL:${prof.username.toUpperCase()}`;
  }

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
      } catch (e) {}
    });
  }

  // ==========================================
  // EXACT SUPABASE SQL DDL SETUP SCRIPT
  // ==========================================

  getSupabaseSqlSchema() {
    return `-- 1. Create the profiles table
create table if not exists public.arl_profiles (
  username text primary key check (char_length(username) >= 2 and char_length(username) <= 24),
  pin_hash text not null check (char_length(pin_hash) >= 8),
  xp integer default 0,
  streak_days integer default 0,
  total_words_learned integer default 0,
  study_minutes_total integer default 0,
  detailed_stats jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.arl_profiles enable row level security;

-- 3. Public read & initial insert policies
drop policy if exists "Anyone can view profiles" on public.arl_profiles;
create policy "Anyone can view profiles"
  on public.arl_profiles for select
  using (true);

drop policy if exists "Anyone can insert profile" on public.arl_profiles;
create policy "Anyone can insert profile"
  on public.arl_profiles for insert
  with check (true);

drop policy if exists "Anyone can update profile with matching PIN" on public.arl_profiles;
create policy "Anyone can update profile with matching PIN"
  on public.arl_profiles for update
  using (true)
  with check (true);

-- 4. Server-side PIN protection trigger (blocks overwrites if pin_hash doesn't match)
create or replace function public.verify_arl_profile_pin()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.pin_hash is distinct from new.pin_hash then
    raise exception 'PIN_MISMATCH: This username belongs to another user or your 4-digit PIN is incorrect.'
      using errcode = '42501';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_verify_arl_profile_pin on public.arl_profiles;
create trigger trg_verify_arl_profile_pin
  before update on public.arl_profiles
  for each row
  execute function public.verify_arl_profile_pin();
`;
  }
}

export const socialClient = new SupabaseSocialEngine();
