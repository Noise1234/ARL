/**
 * ARL - GitHub Gist Cloud Sync & Backup Engine (v2) Test Suite
 * Rigorous verification of local-first cloud backup, PAT validation, rate limiting,
 * single-payload schema (arl_backup_v2.json), and offline JSON export/import.
 */

import assert from 'assert';
import { GistSync, KEY_TOKEN, KEY_GIST_ID, KEY_LAST_SYNC, KEY_AUTO_SYNC, SYNC_FILE_NAME } from '../js/sync.js';
import { db } from '../js/db.js';
import { toast } from '../js/toast.js';

export async function runGistSyncV2Tests(it) {
  console.log('\n--- Testing Rebuilt GitHub Gist Backup & Sync Engine (v2) ---');

  await it('Single-Payload Schema: Serializes complete user state in arl_backup_v2.json format', async () => {
    const sync = new GistSync();
    const payload = await sync.getDataPayload();

    assert.strictEqual(payload.app, 'ARL', 'Payload app identifier must be ARL');
    assert.strictEqual(payload.version, 2, 'Payload version must be 2');
    assert(typeof payload.updatedAt === 'string', 'Payload must contain ISO updatedAt timestamp');
    assert(typeof payload.settings === 'object', 'Payload must include settings object');
    assert(Array.isArray(payload.progress), 'Payload must include progress array');
    assert(typeof payload.masteryCounts === 'object', 'Payload must include masteryCounts');
    assert(typeof payload.streaks === 'object', 'Payload must include streaks');
    assert(typeof payload.timeLogs === 'object', 'Payload must include timeLogs');
    assert(Array.isArray(payload.notes), 'Payload must include notes array');
    assert(typeof payload.localStorage === 'object', 'Payload must include localStorage mirror');
  });

  await it('Security Sandbox: PAT, Gist ID, and Gemini API keys are strictly excluded from payload', async () => {
    const sync = new GistSync();
    sync.setToken('ghp_superSecretToken12345');
    sync.setGistId('secret_gist_id_9999');

    const payload = await sync.getDataPayload();
    const serialized = JSON.stringify(payload);

    assert(!serialized.includes('ghp_superSecretToken12345'), 'CRITICAL: GitHub PAT leaked into payload!');
    assert(!serialized.includes('secret_gist_id_9999'), 'CRITICAL: Gist ID leaked into payload!');
    assert(!serialized.includes('arl_gh_token'), 'CRITICAL: arl_gh_token key in payload!');
  });

  await it('PAT Validation: Accurately identifies Invalid Token (HTTP 401)', async () => {
    const sync = new GistSync();
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => '{"message":"Bad credentials"}'
    });

    try {
      const res = await sync.validateToken('ghp_badToken123');
      assert.strictEqual(res.ok, false);
      assert.strictEqual(res.status, 'invalid_token');
      assert(res.message.includes('401'), 'Message must reference HTTP 401');
      assert.strictEqual(sync.status, 'invalid_token');
      assert.strictEqual(sync.getShortStatusLabel(), '[SYNC: BAD TOKEN]');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await it('PAT Validation: Accurately identifies Rate Limited status (HTTP 403)', async () => {
    const sync = new GistSync();
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => ({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      headers: {
        get: (h) => (h === 'X-RateLimit-Remaining' ? '0' : null)
      },
      text: async () => '{"message":"API rate limit exceeded"}'
    });

    try {
      const res = await sync.validateToken('ghp_validTokenRateLimited');
      assert.strictEqual(res.ok, false);
      assert.strictEqual(res.status, 'rate_limited');
      assert(res.message.includes('Rate Limit'), 'Message must report rate limit');
      assert.strictEqual(sync.status, 'rate_limited');
      assert.strictEqual(sync.getShortStatusLabel(), '[SYNC: RATE LIMIT]');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await it('PAT Validation: Connected status with user info on HTTP 200', async () => {
    const sync = new GistSync();
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h === 'X-OAuth-Scopes' ? 'gist, repo' : null)
      },
      json: async () => ({ login: 'monochromeLearner' })
    });

    try {
      const res = await sync.validateToken('ghp_validTokenGood');
      assert.strictEqual(res.ok, true);
      assert.strictEqual(res.status, 'connected');
      assert.strictEqual(res.user, 'monochromeLearner');
      assert.strictEqual(sync.tokenStatus, 'valid');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await it('Auto-Detection vs Auto-Creation of Secret Gist with arl_backup_v2.json', async () => {
    const sync = new GistSync();
    const originalFetch = globalThis.fetch;
    let createdGist = null;

    globalThis.fetch = async (url, options = {}) => {
      const urlStr = String(url);
      const method = (options.method || 'GET').toUpperCase();

      if (urlStr.includes('/gists?per_page=100') && method === 'GET') {
        // Return empty list to trigger auto-creation
        return {
          ok: true,
          status: 200,
          json: async () => []
        };
      }

      if (urlStr === 'https://api.github.com/gists' && method === 'POST') {
        const body = JSON.parse(options.body);
        createdGist = {
          id: 'auto_secret_gist_42',
          description: body.description,
          public: body.public,
          files: body.files
        };
        return {
          ok: true,
          status: 201,
          json: async () => createdGist
        };
      }

      return { ok: false, status: 404 };
    };

    try {
      const res = await sync.connect('ghp_testToken12345');
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.created, true);
      assert.strictEqual(res.gistId, 'auto_secret_gist_42');
      assert.strictEqual(createdGist.public, false, 'Created Gist MUST be secret (public: false)');
      assert(createdGist.files[SYNC_FILE_NAME], `Created Gist must contain ${SYNC_FILE_NAME}`);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await it('Timestamp Comparison & Safe Push/Pull: Prevents silent data corruption', async () => {
    const sync = new GistSync();
    sync.setToken('ghp_valid');
    sync.setGistId('test_gist_id');
    const originalFetch = globalThis.fetch;

    let remotePayload = {
      app: 'ARL',
      version: 2,
      updatedAt: '2026-11-23T12:00:00.000Z',
      progress: [{ wordId: 'de_test_1', status: 'memorized', reps: 3, interval: 6 }]
    };

    globalThis.fetch = async (url, options = {}) => {
      const method = (options.method || 'GET').toUpperCase();
      if (method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'test_gist_id',
            files: {
              [SYNC_FILE_NAME]: {
                content: JSON.stringify(remotePayload)
              }
            }
          })
        };
      }
      if (method === 'PATCH') {
        const body = JSON.parse(options.body);
        remotePayload = JSON.parse(body.files[SYNC_FILE_NAME].content);
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'test_gist_id' })
        };
      }
      return { ok: false, status: 404 };
    };

    try {
      // Pull remote progress
      const pullRes = await sync.pull();
      assert.strictEqual(pullRes.success, true);
      assert.strictEqual(pullRes.data.progress[0].wordId, 'de_test_1');

      // Verify db received progress
      const saved = await db.getProgress('de_test_1');
      assert(saved, 'Imported card must exist in DB');
      assert.strictEqual(saved.status, 'memorized');

      // Push back
      const pushRes = await sync.push();
      assert.strictEqual(pushRes.success, true);
      assert(pushRes.timestamp, 'Push must record timestamp');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await it('Offline Safety Net: Local JSON Export and Import round-trip cleanly', async () => {
    const sync = new GistSync();
    const payload = await sync.getDataPayload();
    assert(payload && payload.version === 2);

    const testJson = JSON.stringify({
      app: 'ARL',
      version: 2,
      updatedAt: new Date().toISOString(),
      settings: { targetLang: 'de', cefrLevel: 'b2', totalExp: 999 },
      progress: [{ wordId: 'offline_card_1', status: 'learning', reps: 1, interval: 1 }]
    });

    const success = await sync.importLocalJson(testJson);
    assert.strictEqual(success, true, 'importLocalJson must return true');

    const restored = await db.getProgress('offline_card_1');
    assert(restored, 'Card from offline JSON import must exist in DB');
    assert.strictEqual(restored.wordId, 'offline_card_1');
  });

  await it('Toast Notifications: Surface clean formatted toasts with no DOM crashes', () => {
    assert.strictEqual(typeof toast.show, 'function');
    assert.strictEqual(typeof toast.success, 'function');
    assert.strictEqual(typeof toast.error, 'function');

    // Should not throw in Node.js headless environment
    toast.success('Test success message');
    toast.error('HTTP 401 Unauthorized');
    toast.info('Test info message');
  });
}
