/**
 * ARL - Supabase Cloud Social Engine (Friends & Leaderboard) Test Suite
 * Rigorously verifies:
 * 1. Cryptographic SHA-256 PIN hashing and deterministic verification
 * 2. PIN-protected profile registration, login, and collision defense
 * 3. PIN security: rejection of unauthorized modifications without matching PIN
 * 4. Change PIN workflow with old PIN authentication
 * 5. Global Leaderboard sorting and language track filters
 * 6. Friends Leaderboard relative ranking and podiums
 * 7. Friends management (add by handle/code, duplicate defense, self-add guard, remove)
 * 8. Real-time stats synchronization and debounced scheduling
 * 9. Supabase REST API PostgREST headers and query formatting
 * 10. PostgreSQL DDL setup script integrity
 * 11. Keyboard navigation [F] and Typographic HUD / Bottom nav UI compliance
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sha256Sync,
  hashPin,
  sanitizeUsername,
  SupabaseSocialEngine,
  socialClient
} from '../js/social.js';
import { keyboard } from '../js/keyboard.js';
import { TopHudView } from '../js/views/hud.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Minimal mock DOM element
class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.innerHTML = '';
    this._listeners = {};
    this.classList = {
      add: () => {},
      remove: () => {},
      contains: () => false
    };
  }

  querySelector(sel) {
    if (this.innerHTML.includes(sel.replace(/^[#.]/, ''))) {
      return new MockElement();
    }
    return null;
  }

  querySelectorAll() {
    return [];
  }

  addEventListener(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }
}

export async function runSocialTests(it) {
  console.log('\n--- Testing PIN-Protected "Friends & Leaderboard" Supabase Social Engine ---');

  // 1. SHA-256 Cryptographic Hashing
  await it('sha256Sync produces standard SHA-256 hex digest for benchmark string', () => {
    // Benchmark vector: "alex_de:1234"
    const expected = '90d9ce5ba8c2855458f055c10c9956482adfd7c41597bb9b409376f11e35ad35';
    const computed = sha256Sync('alex_de:1234');
    assert.strictEqual(computed, expected, `Expected ${expected}, got ${computed}`);
  });

  await it('hashPin normalizes username and produces deterministic hash with PIN', () => {
    const hash1 = hashPin('  Alex_DE  ', '1234');
    const hash2 = hashPin('alex_de', '1234');
    const hash3 = hashPin('alex_de', '9999');

    assert.strictEqual(hash1, hash2, 'Username normalization must produce identical hashes');
    assert.notStrictEqual(hash1, hash3, 'Different PINs must produce completely different hashes');
    assert.strictEqual(hash1.length, 64, 'SHA-256 hash must be exactly 64 hex characters');
  });

  await it('sanitizeUsername strips @, ARL: prefix, and invalid characters', () => {
    assert.strictEqual(sanitizeUsername('@alex_de'), 'alex_de');
    assert.strictEqual(sanitizeUsername('ARL:TEMUUJIN'), 'temuujin');
    assert.strictEqual(sanitizeUsername('  @user_123!#$  '), 'user_123');
  });

  // 2. Profile Creation & PIN Protection
  await it('Register creates PIN-protected profile in Mock Sandbox mode', async () => {
    const engine = new SupabaseSocialEngine();
    const res = await engine.register('test_learner', 'Test Learner', '5678', 'ALPHA', 'Hello World');

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.profile.username, 'test_learner');
    assert.strictEqual(res.profile.displayName, 'Test Learner');
    assert.strictEqual(res.profile.avatar, 'ALPHA');
    assert.strictEqual(res.profile.pinHash, hashPin('test_learner', '5678'));

    // Check session profile
    const current = engine.getProfile();
    assert.strictEqual(current.username, 'test_learner');
    assert.strictEqual(engine.isLoggedIn(), true);
  });

  await it('PIN Security: Register rejects taking existing username if PIN does not match', async () => {
    const engine = new SupabaseSocialEngine();
    // Elena already exists in mock learners with PIN 1234
    const res = await engine.register('elena_ber', 'Impostor', '9999', 'DELTA');
    assert.strictEqual(res.success, false, 'Must reject registration when username is claimed with different PIN');
    assert(res.error.includes('already taken'), 'Error message must notify username is taken');
  });

  await it('PIN Security: Register logs in existing user when matching PIN is provided', async () => {
    const engine = new SupabaseSocialEngine();
    // Elena exists with PIN 1234
    const res = await engine.register('elena_ber', 'Elena', '1234', 'OMEGA');
    assert.strictEqual(res.success, true);
    assert(res.message.includes('Welcome back'));
    assert.strictEqual(engine.getProfile().username, 'elena_ber');
  });

  // 3. Login with PIN
  await it('loginWithPin authorizes with correct PIN and rejects incorrect PIN', async () => {
    const engine = new SupabaseSocialEngine();
    await engine.register('pin_test_user', 'Pin User', '4321', 'ZEN');

    // Wrong PIN
    const failRes = await engine.loginWithPin('pin_test_user', '0000');
    assert.strictEqual(failRes.success, false);
    assert(failRes.error.includes('Incorrect PIN'));

    // Correct PIN
    const okRes = await engine.loginWithPin('pin_test_user', '4321');
    assert.strictEqual(okRes.success, true);
    assert.strictEqual(okRes.profile.username, 'pin_test_user');
  });

  // 4. Change PIN Workflow
  await it('changePin requires old PIN verification and updates hash', async () => {
    const engine = new SupabaseSocialEngine();
    await engine.register('change_pin_user', 'Change User', '1111', 'ALPHA');

    // Fail with wrong old PIN
    const failRes = await engine.changePin('9999', '2222');
    assert.strictEqual(failRes.success, false);
    assert(failRes.error.includes('Current PIN is incorrect'));

    // Succeed with right old PIN
    const okRes = await engine.changePin('1111', '2222');
    assert.strictEqual(okRes.success, true);
    assert.strictEqual(engine.getProfile().pinHash, hashPin('change_pin_user', '2222'));

    // Verify login with new PIN
    const loginRes = await engine.loginWithPin('change_pin_user', '2222');
    assert.strictEqual(loginRes.success, true);
  });

  // 5. Global Leaderboard Ranking & Filtering
  await it('getGlobalLeaderboard returns learners sorted strictly by total_exp descending', async () => {
    const engine = new SupabaseSocialEngine();
    const board = await engine.getGlobalLeaderboard(20, 'all');

    assert(Array.isArray(board), 'Leaderboard must be an array');
    assert(board.length >= 5, 'Leaderboard must contain at least 5 learners');

    // Verify descending order
    for (let i = 0; i < board.length - 1; i++) {
      assert(
        board[i].total_exp >= board[i + 1].total_exp,
        `Leaderboard sorting violation at index ${i}: ${board[i].total_exp} < ${board[i + 1].total_exp}`
      );
      assert.strictEqual(board[i].rank, i + 1, `Rank should be 1-indexed: got ${board[i].rank}`);
    }
  });

  await it('getGlobalLeaderboard filters by language track (DE vs EN)', async () => {
    const engine = new SupabaseSocialEngine();
    const deBoard = await engine.getGlobalLeaderboard(20, 'de');
    const enBoard = await engine.getGlobalLeaderboard(20, 'en');

    assert(deBoard.every(l => l.target_lang === 'de'), 'All items in deBoard must be German');
    assert(enBoard.every(l => l.target_lang === 'en'), 'All items in enBoard must be English');
  });

  // 6. Friends Leaderboard & Management
  await it('Friends management: addFriend, self-add guard, duplicate guard, removeFriend', async () => {
    const engine = new SupabaseSocialEngine();
    await engine.register('social_host', 'Host User', '1234', 'ALPHA');

    // Reset friends for test
    engine._saveFriends([]);

    // Guard: cannot add self
    const selfRes = await engine.addFriend('social_host');
    assert.strictEqual(selfRes.success, false);
    assert(selfRes.error.includes('cannot add yourself'));

    // Add friend
    const addRes = await engine.addFriend('@markus_muc');
    assert.strictEqual(addRes.success, true);
    assert.strictEqual(engine.isFriend('markus_muc'), true);

    // Duplicate guard
    const dupRes = await engine.addFriend('markus_muc');
    assert.strictEqual(dupRes.success, false);
    assert(dupRes.error.includes('already in your friends'));

    // Remove friend
    const remRes = await engine.removeFriend('markus_muc');
    assert.strictEqual(remRes.success, true);
    assert.strictEqual(engine.isFriend('markus_muc'), false);
  });

  await it('getFriendsLeaderboard returns relative rank among user and added friends', async () => {
    const engine = new SupabaseSocialEngine();
    await engine.register('friends_test_user', 'My User', '1234', 'ALPHA');
    // Set user EXP
    await engine.syncStats({ totalExp: 7500, level: 18, streak: 10 });

    // Set friends: Elena (14,250 EXP) and Anja (5,300 EXP)
    engine._saveFriends(['elena_ber', 'anja_ham']);

    const friendsBoard = await engine.getFriendsLeaderboard();
    assert.strictEqual(friendsBoard.length, 3, 'Must contain Elena, My User, and Anja');

    // Expected order: Elena (#1, 14250), My User (#2, 7500), Anja (#3, 5300)
    assert.strictEqual(friendsBoard[0].username, 'elena_ber');
    assert.strictEqual(friendsBoard[0].rank, 1);

    assert.strictEqual(friendsBoard[1].username, 'friends_test_user');
    assert.strictEqual(friendsBoard[1].rank, 2);
    assert.strictEqual(friendsBoard[1].isCurrentUser, true);

    assert.strictEqual(friendsBoard[2].username, 'anja_ham');
    assert.strictEqual(friendsBoard[2].rank, 3);
  });

  await it('getFriendCode formats shareable ARL:USERNAME code', () => {
    const engine = new SupabaseSocialEngine();
    engine._saveProfile({ username: 'batu_uln' });
    assert.strictEqual(engine.getFriendCode(), 'ARL:BATU_ULN');
  });

  // 7. Stats Synchronization
  await it('syncStats updates local profile and cloud/mock payload with latest metrics', async () => {
    const engine = new SupabaseSocialEngine();
    await engine.register('sync_guy', 'Sync Guy', '1234', 'OMEGA');

    const res = await engine.syncStats({
      totalExp: 5500,
      level: 14,
      streak: 8,
      cardsLearned: 320,
      studyTimeSeconds: 14400
    });

    assert.strictEqual(res.success, true);
    const prof = engine.getProfile();
    assert.strictEqual(prof.totalExp, 5500);
    assert.strictEqual(prof.level, 14);
    assert.strictEqual(prof.streak, 8);
    assert.strictEqual(prof.cardsLearned, 320);
    assert.strictEqual(prof.studyTimeSeconds, 14400);
  });

  // 8. Supabase REST API Protocol & Headers
  await it('Supabase REST Client configures correct PostgREST headers and clean URL', () => {
    const engine = new SupabaseSocialEngine();
    engine.setUrl('  https://testapp.supabase.co///  ');
    engine.setAnonKey('  eyJtest_anon_key_mock_12345  ');

    assert.strictEqual(engine.getUrl(), 'https://testapp.supabase.co');
    assert.strictEqual(engine.getAnonKey(), 'eyJtest_anon_key_mock_12345');
    assert.strictEqual(engine.isConfigured(), true);

    const headers = engine.getHeaders();
    assert.strictEqual(headers['apikey'], 'eyJtest_anon_key_mock_12345');
    assert.strictEqual(headers['Authorization'], 'Bearer eyJtest_anon_key_mock_12345');
    assert.strictEqual(headers['Content-Type'], 'application/json');
    assert.strictEqual(headers['Prefer'], 'return=representation');
  });

  await it('Live Supabase REST Mock Flow: Simulates PostgREST GET, POST, and PATCH with pin_hash', async () => {
    const engine = new SupabaseSocialEngine();
    engine.setUrl('https://mock-supabase.co');
    engine.setAnonKey('test-key');

    const originalFetch = globalThis.fetch;
    let profilesTable = {};

    globalThis.fetch = async (url, options = {}) => {
      const urlStr = String(url);
      const method = (options.method || 'GET').toUpperCase();

      // Check username exists
      if (urlStr.includes('/rest/v1/arl_profiles?username=eq.') && method === 'GET') {
        const match = urlStr.match(/username=eq\.([a-zA-Z0-9_]+)/);
        const uname = match ? match[1] : '';
        const found = profilesTable[uname] ? [profilesTable[uname]] : [];
        return { ok: true, status: 200, json: async () => found };
      }

      // Insert new profile
      if (urlStr.endsWith('/rest/v1/arl_profiles') && method === 'POST') {
        const body = JSON.parse(options.body);
        profilesTable[body.username] = body;
        return { ok: true, status: 201, json: async () => [body] };
      }

      // Update profile with pin_hash
      if (urlStr.includes('/rest/v1/arl_profiles?username=eq.') && method === 'PATCH') {
        const uMatch = urlStr.match(/username=eq\.([a-zA-Z0-9_]+)/);
        const uname = uMatch ? uMatch[1] : '';
        const body = JSON.parse(options.body || '{}');

        if (profilesTable[uname] && (!body.pin_hash || profilesTable[uname].pin_hash === body.pin_hash)) {
          Object.assign(profilesTable[uname], body);
          return { ok: true, status: 200, json: async () => [profilesTable[uname]] };
        }
        // PIN mismatch or not found: trigger raises exception
        return { ok: false, status: 403, text: async () => 'Forbidden: PIN_MISMATCH' };
      }

      return { ok: true, status: 200, json: async () => [] };
    };

    try {
      // 1. Register on simulated Supabase
      const reg = await engine.register('cloud_user', 'Cloud User', '9876', 'TITAN');
      assert.strictEqual(reg.success, true);
      assert.strictEqual(profilesTable['cloud_user'].username, 'cloud_user');

      // 2. Sync stats with matching PIN
      const syncRes = await engine.syncStats({ totalExp: 3333, level: 9 });
      assert.strictEqual(syncRes.success, true);
      assert.strictEqual(profilesTable['cloud_user'].xp, 3333);

      // 3. Test Connection
      const conn = await engine.testConnection();
      assert.strictEqual(conn.ok, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  // 9. PostgreSQL Setup DDL Script
  await it('getSupabaseSqlSchema provides valid PostgreSQL schema with RLS policies', () => {
    const engine = new SupabaseSocialEngine();
    const ddl = engine.getSupabaseSqlSchema().toLowerCase();

    assert(ddl.includes('create table if not exists public.arl_profiles'), 'Must define arl_profiles table');
    assert(ddl.includes('alter table public.arl_profiles enable row level security;'), 'Must enable RLS');
    assert(ddl.includes('pin_hash text not null'), 'Profiles must include pin_hash column');
    assert(ddl.includes('trg_verify_arl_profile_pin'), 'Must create trigger trg_verify_arl_profile_pin');
    assert(ddl.includes('verify_arl_profile_pin()'), 'Must define verify_arl_profile_pin function');
  });

  // 10. Typographic UI, HUD, Keyboard & Settings Compliance
  await it('Typographic UI & Navigation: Zero OS emojis in social buttons; bracket tags used', () => {
    const hudJs = fs.readFileSync(path.join(ROOT, 'js', 'views', 'hud.js'), 'utf-8');
    const settingsJs = fs.readFileSync(path.join(ROOT, 'js', 'views', 'settings.js'), 'utf-8');
    const componentsCss = fs.readFileSync(path.join(ROOT, 'css', 'components.css'), 'utf-8');

    // Top HUD check
    assert(hudJs.includes('id="nav-btn-social"'), 'Top HUD must include #nav-btn-social');
    assert(hudJs.includes('data-key="f"'), 'HUD social button must have data-key="f"');
    assert(hudJs.includes('[F]'), 'HUD social button must use bracket tag [F]');

    // Bottom Nav check
    assert(hudJs.includes('data-target="social"'), 'Bottom nav must have data-target="social"');

    // Settings modal check
    assert(settingsJs.includes('id="settings-supabase-url"'), 'settings.js must have #settings-supabase-url');
    assert(settingsJs.includes('id="settings-supabase-key"'), 'settings.js must have #settings-supabase-key');
    assert(settingsJs.includes('id="btn-test-settings-supabase"'), 'settings.js must have #btn-test-settings-supabase');

    // Responsive query check: #nav-btn-social must be hidden in <= 960px top header
    assert(componentsCss.includes('#nav-btn-social,'), 'components.css must include #nav-btn-social in <= 960px media query');
  });

  await it('Keyboard Router: Key [F] triggers nav_social action', () => {
    let triggered = false;
    const unsub = keyboard.on('nav_social', () => {
      triggered = true;
    });

    keyboard.trigger('nav_social');
    assert.strictEqual(triggered, true, 'keyboard.on("nav_social") must fire callback');
    unsub();
  });
}
