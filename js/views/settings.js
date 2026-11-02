/**
 * ARL - Settings Modal HUD
 * Language selection, CEFR levels, Backup/Restore,
 * Gemini Free Tier API Key configuration, and GitHub Gist Cloud Sync.
 * Typographic minimalist terminal aesthetic with zero OS emojis.
 */

import { state } from '../state.js';
import { db } from '../db.js';
import { t } from '../i18n.js';
import { keyboard, KeyboardState } from '../keyboard.js';
import { GeminiClient } from '../gemini.js';
import { gistSync } from '../sync.js';

export class SettingsModalView {
  constructor(overlayEl, onCloseCallback) {
    this.overlay = overlayEl;
    this.onClose = onCloseCallback;
    this.showApiKey = false;
    this.showGhToken = false;
    this.syncNotice = '';
    this.isSyncOperating = false;
  }

  show() {
    keyboard.setState(KeyboardState.SETTINGS_OVERLAY);
    this.render();
  }

  close() {
    this.overlay.innerHTML = '';
    this.onClose();
  }

  async exportBackup() {
    const jsonStr = await db.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arl_backup_${state.targetLang}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async copyBackupToClipboard(btnEl) {
    try {
      const jsonStr = await db.exportBackup();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = jsonStr;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      if (btnEl) {
        const orig = btnEl.innerHTML;
        btnEl.innerHTML = '[OK] Copied!';
        setTimeout(() => { btnEl.innerHTML = orig; }, 2000);
      }
    } catch (err) {
      console.error('Clipboard copy error:', err);
      alert('Could not copy to clipboard: ' + err.message);
    }
  }

  async pasteBackupFromClipboard() {
    try {
      let text = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          text = await navigator.clipboard.readText();
        } catch (e) {
          text = '';
        }
      }
      if (!text || !text.trim().startsWith('{')) {
        text = prompt('Paste your ARL backup JSON here:');
      }
      if (!text || !text.trim()) return;
      const success = await db.importBackup(text.trim());
      if (success) {
        alert('Progress & settings restored successfully!');
        window.location.reload();
      } else {
        alert('Invalid backup data format.');
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Failed to restore backup: ' + (err.message || 'Invalid JSON'));
    }
  }

  triggerImport() {
    const fileInput = this.overlay.querySelector('#settings-backup-input');
    if (fileInput) fileInput.click();
  }

  render() {
    const targetLabel = state.targetLang === 'de' ? 'German (DE)' : 'English (EN)';
    const i18nLabel = state.interfaceLang.toUpperCase();
    const cefrLevels = ['a1', 'a2', 'b1', 'b2'];
    const currentKey = GeminiClient.getApiKey();
    const hasKey = Boolean(currentKey.trim());

    // Gist Cloud Sync State
    const ghToken = gistSync.getToken();
    const gistId = gistSync.getGistId();
    const lastSync = gistSync.getLastSync();
    const syncStatus = gistSync.getStatus();

    let syncBadgeText = '[Not Connected]';
    let syncBadgeClass = 'tag-fallback';
    if (syncStatus.status === 'syncing') {
      syncBadgeText = '[Syncing...]';
      syncBadgeClass = 'tag-syncing';
    } else if (gistSync.isConnected()) {
      syncBadgeText = `[Connected: ${gistId.slice(0, 7)}]`;
      syncBadgeClass = 'tag-connected';
    } else if (syncStatus.status === 'error') {
      syncBadgeText = '[Sync Error]';
      syncBadgeClass = 'tag-error';
    }

    const lastSyncFormatted = lastSync
      ? `Last synced: ${new Date(lastSync).toLocaleTimeString()} (${new Date(lastSync).toLocaleDateString()})`
      : 'Never synced';

    this.overlay.innerHTML = `
      <div class="settings-modal-backdrop" id="settings-backdrop">
        <div class="settings-hud-card" role="dialog" aria-modal="true" aria-label="Settings HUD">
          
          <div class="settings-hud-header">
            <span class="settings-hud-title">${t('settings_title')}</span>
            <button class="settings-close-btn touch-target" id="btn-settings-close" title="Keyboard: Esc or S">
              <span class="micro-bracket">[Esc]</span> ✕
            </button>
          </div>

          <div class="settings-options-grid">
            <!-- Target Language -->
            <div class="settings-row">
              <span class="settings-label">${t('target_lang')}</span>
              <button class="settings-action-btn touch-target" id="btn-toggle-target">
                <span class="micro-bracket">[L]</span>
                <span class="settings-value">${targetLabel}</span>
              </button>
            </div>

            <!-- Interface Language -->
            <div class="settings-row">
              <span class="settings-label">${t('interface_lang')}</span>
              <button class="settings-action-btn touch-target" id="btn-cycle-i18n">
                <span class="micro-bracket">[I]</span>
                <span class="settings-value">${i18nLabel}</span>
              </button>
            </div>

            <!-- CEFR Level -->
            <div class="settings-row">
              <span class="settings-label">${t('cefr_level')}</span>
              <div class="level-btn-group">
                ${cefrLevels.map((lvl, idx) => `
                  <button class="lvl-choice-btn touch-target ${state.cefrLevel === lvl ? 'active' : ''}" data-lvl="${lvl}">
                    <span class="micro-bracket">[${idx + 1}]</span> ${lvl.toUpperCase()}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Tactile Sounds & Audio Speed -->
            <div class="settings-row">
              <span class="settings-label">${t('sound_effects')}</span>
              <button class="settings-action-btn touch-target" id="btn-toggle-sound">
                <span class="settings-value">${state.soundEnabled ? '[✓] Enabled' : '[✕] Disabled'}</span>
              </button>
            </div>

            <div class="settings-row">
              <span class="settings-label">${t('speech_rate')}</span>
              <div class="level-btn-group">
                <button class="speed-choice-btn touch-target ${state.speechRate <= 0.85 ? 'active' : ''}" data-rate="0.8">0.8x</button>
                <button class="speed-choice-btn touch-target ${state.speechRate > 0.85 && state.speechRate < 1.1 ? 'active' : ''}" data-rate="1.0">1.0x</button>
                <button class="speed-choice-btn touch-target ${state.speechRate >= 1.1 ? 'active' : ''}" data-rate="1.2">1.2x</button>
              </div>
            </div>

            <!-- GitHub Gist Cloud Sync -->
            <div class="settings-row settings-sync-row">
              <div class="sync-header-row">
                <span class="settings-label">GitHub Gist Cloud Sync</span>
                <span class="sync-status-badge ${syncBadgeClass}" id="settings-sync-status-badge">
                  ${syncBadgeText}
                </span>
              </div>

              <div class="sync-inputs-container">
                <div class="sync-input-field">
                  <div class="sync-label-small">GitHub Personal Access Token (scope: gist)</div>
                  <div class="sync-input-wrapper">
                    <input
                      type="${this.showGhToken ? 'text' : 'password'}"
                      id="settings-gh-token"
                      class="settings-text-input"
                      placeholder="Paste GitHub Token (ghp_...)"
                      value="${ghToken}"
                      autocomplete="off"
                      spellcheck="false"
                    />
                    <button type="button" class="btn-api-toggle" id="btn-toggle-gh-token" title="Show/Hide Token">
                      ${this.showGhToken ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div class="sync-input-field">
                  <div class="sync-label-small">Gist ID (Auto-discovered or manual)</div>
                  <input
                    type="text"
                    id="settings-gist-id"
                    class="settings-text-input"
                    placeholder="Auto-populated upon connect..."
                    value="${gistId}"
                    autocomplete="off"
                    spellcheck="false"
                  />
                </div>

                <div class="sync-actions-row">
                  <button type="button" class="settings-action-btn btn-connect-sync touch-target" id="btn-sync-connect" ${this.isSyncOperating ? 'disabled' : ''}>
                    <span class="micro-bracket">[SYNC]</span> Connect & Auto-Sync
                  </button>
                  <button type="button" class="settings-action-btn btn-push-sync touch-target" id="btn-sync-push" ${(!gistId || this.isSyncOperating) ? 'disabled' : ''}>
                    <span class="micro-bracket">[Push]</span> Upload Local
                  </button>
                  <button type="button" class="settings-action-btn btn-pull-sync touch-target" id="btn-sync-pull" ${(!gistId || this.isSyncOperating) ? 'disabled' : ''}>
                    <span class="micro-bracket">[Pull]</span> Download Remote
                  </button>
                  ${(ghToken || gistId) ? `
                    <button type="button" class="btn-clear-key touch-target" id="btn-sync-disconnect" title="Disconnect and clear token">
                      Disconnect
                    </button>
                  ` : ''}
                </div>
              </div>

              ${this.syncNotice ? `
                <div class="sync-notice-text ${this.syncNotice.startsWith('Error') ? 'notice-error' : 'notice-ok'}">
                  ${this.syncNotice}
                </div>
              ` : ''}

              <div class="sync-note-text">
                ${lastSyncFormatted}. Token is saved locally in <code>localStorage</code> only and is strictly excluded from backups and sync payloads.
              </div>
            </div>

            <!-- Free Gemini 2.5 Flash API Configuration -->
            <div class="settings-row settings-gemini-row">
              <div class="gemini-header-row">
                <span class="settings-label">Gemini AI Key (Free Tier)</span>
                <span class="gemini-status-tag ${hasKey ? 'tag-connected' : 'tag-fallback'}">
                  ${hasKey ? '[Gemini 2.5 Flash Active]' : '[Local Fallback Active]'}
                </span>
              </div>

              <div class="gemini-input-group">
                <input
                  type="${this.showApiKey ? 'text' : 'password'}"
                  id="settings-gemini-key-input"
                  class="settings-text-input"
                  placeholder="Paste free Google AI Studio API key..."
                  value="${currentKey}"
                  autocomplete="off"
                  spellcheck="false"
                />
                <button type="button" class="btn-api-toggle" id="btn-toggle-key-visibility" title="Show/Hide Key">
                  ${this.showApiKey ? 'Hide' : 'Show'}
                </button>
                <button type="button" class="settings-action-btn btn-save-key" id="btn-save-gemini-key">
                  Save
                </button>
                ${hasKey ? `
                  <button type="button" class="btn-clear-key" id="btn-clear-gemini-key" title="Clear key">
                    Clear
                  </button>
                ` : ''}
              </div>

              <div class="gemini-note-text">
                Free tier API key for real-life grammar sentence checking. Stored locally in <code>localStorage</code>; never exported in database backups.
              </div>
            </div>

            <!-- Android Native APK Download -->
            <div class="settings-row settings-apk-row">
              <span class="settings-label">Android Native App (v2.2.0)</span>
              <div class="apk-download-group">
                <a href="/apk" class="settings-action-btn touch-target btn-download-apk" download="ARL-v2.2.0.apk" style="text-decoration:none; text-align:center;">
                  <span class="micro-bracket">[APK]</span> Download Android APK v2.2.0 (Latest Release)
                </a>
              </div>
            </div>

            <!-- Backup & Progress Safeguard -->
            <div class="settings-row settings-backup-row">
              <span class="settings-label">Backup & Progress Safeguard</span>
              <div class="backup-btn-group" style="display:flex; flex-wrap:wrap; gap:6px;">
                <button class="settings-action-btn touch-target" id="btn-export-backup" title="Export file">
                  <span class="micro-bracket">[E]</span> Export File
                </button>
                <button class="settings-action-btn touch-target" id="btn-copy-backup" title="Copy JSON to clipboard">
                  <span class="micro-bracket">[Copy]</span> Copy JSON
                </button>
                <input type="file" id="settings-backup-input" accept=".json" style="display:none;" />
                <button class="settings-action-btn touch-target" id="btn-import-backup" title="Import from file">
                  <span class="micro-bracket">[Import]</span> Import File
                </button>
                <button class="settings-action-btn touch-target" id="btn-paste-backup" title="Paste JSON from clipboard">
                  <span class="micro-bracket">[Paste]</span> Paste JSON
                </button>
              </div>
            </div>
          </div>

          <div class="settings-footer-hint">
            <span class="micro-keyhint"><span class="micro-bracket">[L]</span> Target</span>
            <span class="micro-keyhint"><span class="micro-bracket">[I]</span> Interface</span>
            <span class="micro-keyhint"><span class="micro-bracket">[1-4]</span> Level</span>
            <span class="micro-keyhint"><span class="micro-bracket">[E]</span> Export</span>
            <span class="micro-keyhint"><span class="micro-bracket">[Esc]</span> Close</span>
          </div>

        </div>
      </div>
    `;

    // Backdrop click to close
    this.overlay.querySelector('#settings-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'settings-backdrop') {
        this.close();
      }
    });

    this.overlay.querySelector('#btn-settings-close').addEventListener('click', () => {
      this.close();
    });

    // Toggle target language
    this.overlay.querySelector('#btn-toggle-target').addEventListener('click', async () => {
      await state.toggleTargetLanguage();
      this.render();
    });

    // Cycle interface language
    this.overlay.querySelector('#btn-cycle-i18n').addEventListener('click', async () => {
      await state.cycleInterfaceLanguage();
      this.render();
    });

    // Level buttons
    this.overlay.querySelectorAll('.lvl-choice-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const lvl = btn.getAttribute('data-lvl');
        await state.setCefrLevel(lvl);
        this.render();
      });
    });

    // Sound toggle
    this.overlay.querySelector('#btn-toggle-sound')?.addEventListener('click', async () => {
      await state.setSoundEnabled(!state.soundEnabled);
      this.render();
    });

    // Speed buttons
    this.overlay.querySelectorAll('.speed-choice-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const rate = parseFloat(btn.dataset.rate);
        if (!isNaN(rate)) {
          await state.setSpeechRate(rate);
          this.render();
        }
      });
    });

    // Toggle GitHub token visibility
    this.overlay.querySelector('#btn-toggle-gh-token')?.addEventListener('click', () => {
      this.showGhToken = !this.showGhToken;
      this.render();
    });

    // Connect & Auto-Sync
    this.overlay.querySelector('#btn-sync-connect')?.addEventListener('click', async () => {
      const tokenInput = this.overlay.querySelector('#settings-gh-token');
      const gistInput = this.overlay.querySelector('#settings-gist-id');
      const token = tokenInput ? tokenInput.value.trim() : '';
      const manualId = gistInput ? gistInput.value.trim() : '';

      if (!token) {
        this.syncNotice = 'Error: Please enter a GitHub token.';
        this.render();
        return;
      }

      this.isSyncOperating = true;
      this.syncNotice = 'Connecting to GitHub...';
      this.render();

      try {
        const res = await gistSync.connect(token, manualId || null);
        this.syncNotice = res.created
          ? `Created new private Gist (${res.gistId}) and synced initial data!`
          : `Connected to Gist (${res.gistId}) and synced remote progress!`;
      } catch (err) {
        this.syncNotice = `Error: ${err.message}`;
      } finally {
        this.isSyncOperating = false;
        this.render();
      }
    });

    // Push local data
    this.overlay.querySelector('#btn-sync-push')?.addEventListener('click', async () => {
      this.isSyncOperating = true;
      this.syncNotice = 'Uploading local data to Gist...';
      this.render();

      try {
        await gistSync.push();
        this.syncNotice = 'Local progress uploaded successfully to Gist!';
      } catch (err) {
        this.syncNotice = `Error: ${err.message}`;
      } finally {
        this.isSyncOperating = false;
        this.render();
      }
    });

    // Pull remote data
    this.overlay.querySelector('#btn-sync-pull')?.addEventListener('click', async () => {
      this.isSyncOperating = true;
      this.syncNotice = 'Downloading remote data from Gist...';
      this.render();

      try {
        await gistSync.pull();
        this.syncNotice = 'Remote progress pulled and restored successfully!';
      } catch (err) {
        this.syncNotice = `Error: ${err.message}`;
      } finally {
        this.isSyncOperating = false;
        this.render();
      }
    });

    // Disconnect sync
    this.overlay.querySelector('#btn-sync-disconnect')?.addEventListener('click', () => {
      gistSync.disconnect();
      this.syncNotice = 'Disconnected from Gist cloud sync.';
      this.render();
    });

    // Gemini API key visibility toggle
    this.overlay.querySelector('#btn-toggle-key-visibility')?.addEventListener('click', () => {
      this.showApiKey = !this.showApiKey;
      this.render();
    });

    // Save Gemini key
    this.overlay.querySelector('#btn-save-gemini-key')?.addEventListener('click', () => {
      const input = this.overlay.querySelector('#settings-gemini-key-input');
      if (input) {
        GeminiClient.setApiKey(input.value.trim());
        this.render();
      }
    });

    // Clear Gemini key
    this.overlay.querySelector('#btn-clear-gemini-key')?.addEventListener('click', () => {
      GeminiClient.setApiKey('');
      this.render();
    });

    // Backup Export
    this.overlay.querySelector('#btn-export-backup')?.addEventListener('click', () => {
      this.exportBackup();
    });

    const copyBtn = this.overlay.querySelector('#btn-copy-backup');
    copyBtn?.addEventListener('click', () => {
      this.copyBackupToClipboard(copyBtn);
    });

    // Backup Import
    const fileInput = this.overlay.querySelector('#settings-backup-input');
    this.overlay.querySelector('#btn-import-backup')?.addEventListener('click', () => {
      fileInput?.click();
    });

    this.overlay.querySelector('#btn-paste-backup')?.addEventListener('click', () => {
      this.pasteBackupFromClipboard();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const success = await db.importBackup(text);
        if (success) {
          alert('Backup restored successfully!');
          window.location.reload();
        } else {
          alert('Invalid backup file.');
        }
      } catch (err) {
        alert('Failed to read backup file.');
      }
    });
  }
}
