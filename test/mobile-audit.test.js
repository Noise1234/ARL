import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';
import { GistSync } from '../js/sync.js';
import { db } from '../js/db.js';
import { state } from '../js/state.js';
import { TopHudView } from '../js/views/hud.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

export async function runMobileAuditTests(it) {
  console.log('\n--- Mobile QA Critic: Typographic Navigation, 100% Mobile Retention & Cloud Sync Audit ---');

  const hudJs = fs.readFileSync(path.join(ROOT, 'js', 'views', 'hud.js'), 'utf-8');
  const settingsJs = fs.readFileSync(path.join(ROOT, 'js', 'views', 'settings.js'), 'utf-8');
  const grammarJs = fs.readFileSync(path.join(ROOT, 'js', 'views', 'grammar.js'), 'utf-8');
  const componentsCss = fs.readFileSync(path.join(ROOT, 'css', 'components.css'), 'utf-8');

  // ==========================================
  // 1. TYPOGRAPHIC UNIFICATION (ZERO EMOJIS)
  // ==========================================
  await it('Typographic UI: Zero OS emojis in bottom navigation bar', () => {
    // Emojis that previously existed
    const forbiddenEmojis = ['🗂', '⚡', '🎯', '📚', '📐', '📝', '⚙', '🌓', '📖'];
    // Extract bottom nav html template from hud.js
    const bottomNavMatch = hudJs.match(/<nav class="mobile-bottom-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert(bottomNavMatch, 'mobile-bottom-nav must be defined in hud.js');
    const bottomNavHtml = bottomNavMatch[1];

    for (const emoji of forbiddenEmojis) {
      assert(!bottomNavHtml.includes(emoji), `mobile-bottom-nav must not contain emoji ${emoji}`);
    }
  });

  await it('Typographic UI: Bottom navigation covers active modules with monospace bracket tags (Notes removed)', () => {
    const requiredModules = ['vocab', 'memorize', 'quiz', 'lexicon', 'grammar', 'media', 'pip'];
    for (const mod of requiredModules) {
      assert(hudJs.includes(`data-target="${mod}"`), `Bottom nav must contain data-target="${mod}"`);
    }

    const requiredKeys = ['[V]', '[M]', '[Q]', '[L]', '[G]', '[I]', '[P]'];
    for (const key of requiredKeys) {
      assert(hudJs.includes(key), `Bottom nav must contain bracket key ${key}`);
    }

    // Notes must be completely removed from bottom and top nav
    assert(!hudJs.includes('data-target="notes"'), 'Bottom nav must not contain data-target="notes"');
    assert(!hudJs.includes('id="nav-btn-notes"'), 'Top HUD must not contain nav-btn-notes');
    assert(!hudJs.includes('[N]'), 'HUD must not contain bracket tag [N]');
  });

  await it('Typographic UI: Top header navigation contains zero OS emojis and uses bracket tags', () => {
    // Check that moon emoji 🌓 and gear emoji ⚙️ are completely gone from TopHudView
    assert(!hudJs.includes('🌓'), 'TopHudView must not contain 🌓 moon emoji');
    assert(!hudJs.includes('⚙️'), 'TopHudView must not contain ⚙️ gear emoji');
    assert(!hudJs.includes('⚙'), 'TopHudView must not contain ⚙ gear glyph');

    // Must have [T] for theme, [S] for settings, [?] for help, [SYNC] for cloud sync
    assert(hudJs.includes('id="hud-sync-status"'), 'Top header must have #hud-sync-status');
    assert(hudJs.includes('id="nav-btn-theme"'), 'Top header must have #nav-btn-theme');
    assert(hudJs.includes('id="nav-btn-settings"'), 'Top header must have #nav-btn-settings');
    assert(hudJs.includes('id="nav-btn-help"'), 'Top header must have #nav-btn-help');
    assert(hudJs.includes('[T]'), 'Top header theme button must be [T]');
    assert(hudJs.includes('[S]'), 'Top header settings button must be [S]');
    assert(hudJs.includes('[?]'), 'Top header help button must be [?]');
  });

  // ==========================================
  // 2. 100% MOBILE FEATURE RETENTION
  // ==========================================
  await it('Mobile Retention: Utility controls [SYNC], [T], [S], [?] are never hidden on <= 640px portrait', () => {
    // In components.css, find @media (max-width: 640px)
    const media640Match = componentsCss.match(/@media\s*\(max-width:\s*640px\)\s*\{([\s\S]*?)\n\}/);
    assert(media640Match, 'components.css must define @media (max-width: 640px)');
    const media640Css = media640Match[1];

    // Ensure #nav-btn-help is NOT set to display: none
    assert(!media640Css.includes('#nav-btn-help {\n    display: none'), 'nav-btn-help must NOT be hidden in max-width: 640px');
    assert(!media640Css.includes('#nav-btn-help {\n  display: none'), 'nav-btn-help must NOT be hidden in max-width: 640px');
    assert(!media640Css.includes('display: none !important'), 'Utility buttons must not be hidden in 640px query');

    // Ensure utility controls have display: inline-flex
    assert(media640Css.includes('#hud-sync-status'), '640px query must configure #hud-sync-status');
    assert(media640Css.includes('#nav-btn-theme'), '640px query must configure #nav-btn-theme');
    assert(media640Css.includes('#nav-btn-settings'), '640px query must configure #nav-btn-settings');
    assert(media640Css.includes('#nav-btn-help'), '640px query must configure #nav-btn-help');
    assert(media640Css.includes('display: inline-flex !important;'), 'Utility buttons must have display: inline-flex !important');
  });

  await it('Mobile Retention: Bottom nav is horizontally scrollable with touch support and no rigid overflow', () => {
    assert(componentsCss.includes('.mobile-bottom-nav {'), 'mobile-bottom-nav must be defined');
    assert(componentsCss.includes('overflow-x: auto;'), 'mobile-bottom-nav must support overflow-x: auto for narrow screens');
    assert(componentsCss.includes('-webkit-overflow-scrolling: touch;'), 'mobile-bottom-nav must support smooth momentum scrolling');
    assert(componentsCss.includes('scrollbar-width: none;'), 'scrollbar must be cleanly hidden');
  });

  await it('Mobile Retention: Modals (Settings & Help) have max-height 85dvh and internal scrolling', () => {
    assert(componentsCss.includes('.settings-hud-card {'), 'settings-hud-card selector must exist');
    assert(componentsCss.includes('max-height: 85dvh;'), 'settings-hud-card must use max-height: 85dvh');
    assert(componentsCss.includes('.help-modal-card {'), 'help-modal-card selector must exist');
    assert(componentsCss.includes('width: min(92vw,'), 'modal cards must use responsive width: min(92vw, ...)');
  });

  // ==========================================
  // 3. GITHUB GIST CLOUD SYNC ENGINE
  // ==========================================
  await it('Cloud Sync: GistSync singleton and methods exist', () => {
    const sync = new GistSync();
    assert.strictEqual(typeof sync.getToken, 'function');
    assert.strictEqual(typeof sync.setToken, 'function');
    assert.strictEqual(typeof sync.getGistId, 'function');
    assert.strictEqual(typeof sync.setGistId, 'function');
    assert.strictEqual(typeof sync.connect, 'function');
    assert.strictEqual(typeof sync.push, 'function');
    assert.strictEqual(typeof sync.pull, 'function');
    assert.strictEqual(typeof sync.scheduleAutoPush, 'function');
  });

  await it('Cloud Sync Security: getDataPayload strictly excludes GitHub token and Gemini API key', async () => {
    const sync = new GistSync();
    // Simulate stored credentials in localStorage mock
    const fakeToken = 'ghp_secretTokenShouldNeverLeak1234567890';
    const fakeGemini = 'AIzaSySecretGeminiKeyNeverLeak9876543210';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('arl_gh_token', fakeToken);
      localStorage.setItem('arl_gemini_api_key', fakeGemini);
    }

    const payload = await sync.getDataPayload();
    assert.strictEqual(payload.app, 'ARL');
    assert.strictEqual(payload.schemaVersion, 2);
    assert(payload.timestamp, 'Payload must have ISO timestamp');
    assert(payload.db, 'Payload must contain db backup');
    assert(payload.settings, 'Payload must contain settings');

    // Serialization check
    const serialized = JSON.stringify(payload);
    assert(!serialized.includes(fakeToken), 'CRITICAL SECURITY FAIL: GitHub token leaked into sync payload!');
    assert(!serialized.includes(fakeGemini), 'CRITICAL SECURITY FAIL: Gemini key leaked into sync payload!');

    // Check payload properties directly
    assert.strictEqual(payload.token, undefined);
    assert.strictEqual(payload.ghToken, undefined);
    if (payload.db.localStorage) {
      assert.strictEqual(payload.db.localStorage.arl_gh_token, undefined);
      assert.strictEqual(payload.db.localStorage.arl_gemini_api_key, undefined);
    }
  });

  await it('Cloud Sync: Settings UI renders GitHub token, Gist ID inputs, status badge, and action buttons', () => {
    assert(settingsJs.includes('id="settings-gh-token"'), 'settings.js must render #settings-gh-token input');
    assert(settingsJs.includes('id="settings-gist-id"'), 'settings.js must render #settings-gist-id input');
    assert(settingsJs.includes('id="btn-sync-connect"'), 'settings.js must render #btn-sync-connect');
    assert(settingsJs.includes('id="btn-sync-push"'), 'settings.js must render #btn-sync-push');
    assert(settingsJs.includes('id="btn-sync-pull"'), 'settings.js must render #btn-sync-pull');
    assert(settingsJs.includes('id="settings-sync-status-badge"'), 'settings.js must render status badge');
  });

  await it('Cloud Sync: Connect auto-discovery and push/pull flow works with simulated GitHub API', async () => {
    const sync = new GistSync();
    const mockToken = 'ghp_testAuditTokenMock12345';
    let gistStore = {};

    // Mock global fetch for testing
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options = {}) => {
      const urlStr = String(url);
      const method = (options.method || 'GET').toUpperCase();

      // List user gists
      if (urlStr === 'https://api.github.com/gists?per_page=100' && method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => []
        };
      }

      // Create new gist
      if (urlStr === 'https://api.github.com/gists' && method === 'POST') {
        const body = JSON.parse(options.body);
        gistStore['mock_gist_id_999'] = {
          id: 'mock_gist_id_999',
          description: body.description,
          public: false,
          files: body.files
        };
        return {
          ok: true,
          status: 201,
          json: async () => gistStore['mock_gist_id_999']
        };
      }

      // Patch existing gist (push)
      if (urlStr.startsWith('https://api.github.com/gists/mock_gist_id_999') && method === 'PATCH') {
        const body = JSON.parse(options.body);
        gistStore['mock_gist_id_999'].files = body.files;
        return {
          ok: true,
          status: 200,
          json: async () => gistStore['mock_gist_id_999']
        };
      }

      // Get existing gist (pull)
      if (urlStr.startsWith('https://api.github.com/gists/mock_gist_id_999') && method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: async () => gistStore['mock_gist_id_999']
        };
      }

      return { ok: false, status: 404, statusText: 'Not Found' };
    };

    try {
      // 1. Connect (creates secret gist)
      const connResult = await sync.connect(mockToken);
      assert.strictEqual(connResult.success, true);
      assert.strictEqual(connResult.created, true);
      assert.strictEqual(sync.getGistId(), 'mock_gist_id_999');
      assert.strictEqual(sync.isConnected(), true);

      // 2. Push local data
      const pushResult = await sync.push();
      assert.strictEqual(pushResult.success, true);
      assert(pushResult.timestamp);

      // 3. Pull remote data
      const pullResult = await sync.pull();
      assert.strictEqual(pullResult.success, true);
      assert(pullResult.data);
      assert.strictEqual(pullResult.data.app, 'ARL');

      // 4. Status Indicator check
      const statusLabel = sync.getShortStatusLabel();
      assert.strictEqual(statusLabel, '[SYNC: OK]');

      // 5. Disconnect
      sync.disconnect();
      assert.strictEqual(sync.isConnected(), false);
      assert.strictEqual(sync.getShortStatusLabel(), '[SYNC]');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  await it('Cloud Sync: Debounced auto-push cancels pending calls and fires once', async () => {
    const sync = new GistSync();
    sync.setToken('ghp_mockToken');
    sync.setGistId('mock_id');

    let pushCount = 0;
    sync.push = async () => {
      pushCount++;
      return { success: true };
    };

    // Schedule 3 rapid triggers
    sync.scheduleAutoPush(30);
    sync.scheduleAutoPush(30);
    sync.scheduleAutoPush(30);

    assert.strictEqual(pushCount, 0, 'Should not fire immediately');

    // Wait for timer
    await new Promise(r => setTimeout(r, 60));
    assert.strictEqual(pushCount, 1, 'Should coalesce into exactly 1 debounced call');
  });

  // ==========================================
  // 4. VIEWPORT AUDIT (360x800, 844x390, 768x600)
  // ==========================================
  await it('Viewport Audit: Narrow portrait (360x800 / 390x844) styling constraints', () => {
    // Check Flexbox rules that prevent badge collisions
    assert(componentsCss.includes('.hud-counts {'), 'hud-counts selector must exist');
    assert(componentsCss.includes('overflow: hidden;'), 'hud-counts must have overflow: hidden');
    assert(componentsCss.includes('text-overflow: ellipsis;'), 'hud-counts must truncate gracefully');
    assert(componentsCss.includes('.hud-counts .hud-count-label'), 'hud-count-label must be hideable on phones');
  });

  await it('Viewport Audit: Mobile landscape (844x390 / 800x360) constraints', () => {
    // Check landscape short layout rules
    assert(componentsCss.includes('@media (orientation: landscape) and (max-height: 500px) and (max-width: 960px)'), 'Landscape short breakpoint must exist');
    assert(componentsCss.includes('padding-bottom: 44px;'), 'Landscape layout must reserve compact space');
    assert(componentsCss.includes('max-height: 85dvh;'), 'Modals must not exceed 85dvh in landscape');
  });

  await it('Viewport Audit: Small tablet split-screen (768x600) constraints', () => {
    // Notes workspace stacked on <= 960px
    assert(componentsCss.includes('.notes-workspace-container {'), 'notes-workspace-container must exist');
    assert(componentsCss.includes('flex-direction: column;'), 'notes-workspace must stack on <= 960px');
    assert(componentsCss.includes('.notes-sidebar {'), 'notes-sidebar selector must exist');
    assert(componentsCss.includes('max-height: 220px;'), 'notes-sidebar must be height-capped on small viewports');
  });
}
