/**
 * ARL - Interactive GitHub Gist Sync & Diagnostics Modal View ([SYNC])
 * Provides:
 * - Credentials configuration (Token & Gist ID with URL auto-sanitizer)
 * - Validation with status badge: Connected / Invalid Token / Rate Limited
 * - Auto-detect existing Gist or auto-create secret Gist (public: false)
 * - Push to Gist, Pull from Gist with timestamp comparison
 * - Optional Auto-Sync on Session End toggle
 * - One-click Export / Import Local JSON right beside Gist controls
 */

import { gistSync } from '../sync.js';
import { sound } from '../sound.js';
import { toast } from '../toast.js';

export class SyncModalView {
  constructor(overlayEl, onClose) {
    this.overlay = overlayEl;
    this.onClose = onClose;
    this.isOperating = false;
    this.feedbackState = null; // { type: 'success' | 'error' | 'loading', message: string }
  }

  show() {
    this.feedbackState = null;
    this.render();
    if (this.overlay) {
      this.overlay.classList.remove('hidden');
      this.overlay.setAttribute('aria-hidden', 'false');
    }
  }

  hide() {
    if (this.overlay) {
      this.overlay.classList.add('hidden');
      this.overlay.setAttribute('aria-hidden', 'true');
      this.overlay.innerHTML = '';
    }
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }

  setFeedback(type, message) {
    this.feedbackState = { type, message };
    this.render();
  }

  render() {
    if (!this.overlay) return;

    const token = gistSync.getToken();
    const gistId = gistSync.getGistId();
    const lastSync = gistSync.getLastSync();
    const lastSyncStr = lastSync ? new Date(lastSync).toLocaleString() : 'Never';
    const isAutoSync = gistSync.isAutoSyncEnabled();

    // Determine status badge
    let statusBadgeText = '[Not Connected]';
    let statusBadgeClass = 'tag-idle';

    if (gistSync.status === 'invalid_token') {
      statusBadgeText = '[Invalid Token]';
      statusBadgeClass = 'tag-error';
    } else if (gistSync.status === 'rate_limited') {
      statusBadgeText = '[Rate Limited]';
      statusBadgeClass = 'tag-error';
    } else if (gistSync.status === 'syncing') {
      statusBadgeText = '[Syncing...]';
      statusBadgeClass = 'tag-syncing';
    } else if (gistSync.isConnected()) {
      statusBadgeText = `[Connected: ${gistId.slice(0, 7)}]`;
      statusBadgeClass = 'tag-connected';
    }

    this.overlay.innerHTML = `
      <div class="modal-backdrop" id="sync-modal-backdrop">
        <div class="modal-dialog sync-diagnostics-dialog" role="dialog" aria-labelledby="sync-modal-title">
          
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-badge">[SYNC]</span>
              <h3 class="modal-title" id="sync-modal-title">GitHub Gist Cloud Sync (v2)</h3>
            </div>
            <button class="modal-close-btn" id="btn-close-sync-modal" aria-label="Close modal">✕</button>
          </div>

          <div class="modal-body">
            
            <!-- Connection Status Banner -->
            <div class="sync-status-banner ${gistSync.isConnected() ? 'connected' : 'disconnected'}">
              <div class="banner-status-left">
                <span class="sync-status-tag ${statusBadgeClass}" id="modal-sync-status-badge">
                  ${statusBadgeText}
                </span>
              </div>
              <div class="banner-status-right">
                <span class="last-synced-label">Last Synced:</span>
                <span class="last-synced-val font-mono">${lastSyncStr}</span>
              </div>
            </div>

            <!-- Credentials Input Section -->
            <div class="sync-inputs-section">
              <div class="settings-field-group">
                <label for="sync-token-input" class="field-label">
                  GitHub Personal Access Token (classic with 'gist' scope):
                </label>
                <input
                  type="password"
                  id="sync-token-input"
                  class="text-input font-mono"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value="${token ? token.replace(/"/g, '&quot;') : ''}"
                  autocomplete="off"
                  ${this.isOperating ? 'disabled' : ''}
                />
                <span class="field-help-text">Tokens are stored in local browser storage only; never leaked into payloads.</span>
              </div>

              <div class="settings-field-group">
                <label for="sync-gist-id-input" class="field-label">
                  Gist ID or URL (leave blank to auto-detect or create secret Gist):
                </label>
                <input
                  type="text"
                  id="sync-gist-id-input"
                  class="text-input font-mono"
                  placeholder="e.g. abc12345 or full Gist URL"
                  value="${gistId ? gistId.replace(/"/g, '&quot;') : ''}"
                  autocomplete="off"
                  ${this.isOperating ? 'disabled' : ''}
                />
              </div>

              <div class="sync-options-row">
                <label class="sync-checkbox-label">
                  <input type="checkbox" id="sync-auto-session-check" ${isAutoSync ? 'checked' : ''} />
                  <span>Auto-Sync on Session End (timestamp protected)</span>
                </label>
              </div>
            </div>

            <!-- Diagnostics & Test Connection Button -->
            <div class="sync-diagnostics-row">
              <button
                type="button"
                class="settings-action-btn btn-test-conn touch-target"
                id="btn-sync-test-connection"
                ${this.isOperating ? 'disabled' : ''}>
                <span class="micro-bracket">[🩺]</span> Validate PAT
              </button>
              <button
                type="button"
                class="settings-action-btn btn-connect-sync touch-target"
                id="btn-sync-save-connect"
                ${this.isOperating ? 'disabled' : ''}>
                <span class="micro-bracket">[Save]</span> Connect / Auto-Detect
              </button>
            </div>

            <!-- Diagnostic HTTP Feedback Panel -->
            ${this.feedbackState ? `
              <div class="sync-feedback-card feedback-${this.feedbackState.type}">
                <div class="feedback-content">
                  ${this.feedbackState.type === 'loading' ? '<span class="spinner-inline"></span>' : ''}
                  <span class="feedback-text">${this.feedbackState.message}</span>
                </div>
              </div>
            ` : ''}

            <!-- Cloud Sync Action Buttons -->
            <div class="sync-action-buttons-group">
              <button
                type="button"
                class="btn-primary-action btn-sync-merge touch-target"
                id="btn-sync-action-merge"
                ${(!gistSync.isConnected() || this.isOperating) ? 'disabled' : ''}>
                <span class="micro-bracket">[🔄]</span> Sync Now (Merge)
              </button>
              <button
                type="button"
                class="settings-action-btn btn-push-sync touch-target"
                id="btn-sync-action-push"
                ${(!gistSync.isConnected() || this.isOperating) ? 'disabled' : ''}>
                <span class="micro-bracket">[⬆️]</span> Push to Gist
              </button>
              <button
                type="button"
                class="settings-action-btn btn-pull-sync touch-target"
                id="btn-sync-action-pull"
                ${(!gistSync.isConnected() || this.isOperating) ? 'disabled' : ''}>
                <span class="micro-bracket">[⬇️]</span> Pull from Gist
              </button>
            </div>

            <!-- Offline Safety Net: Local JSON Export / Import -->
            <div class="sync-local-backup-strip">
              <div class="local-backup-title font-mono">[OFFLINE SAFETY NET] Local JSON Backup:</div>
              <div class="local-backup-btn-row">
                <button type="button" class="settings-action-btn touch-target" id="btn-sync-export-local-json">
                  <span class="micro-bracket">[Export]</span> Export Local JSON
                </button>
                <button type="button" class="settings-action-btn touch-target" id="btn-sync-import-local-json">
                  <span class="micro-bracket">[Import]</span> Import Local JSON
                </button>
                <input type="file" id="sync-local-file-input" accept=".json,application/json" style="display:none" />
              </div>
            </div>

          </div>

          <div class="modal-footer">
            ${gistSync.isConnected() ? `
              <button type="button" class="btn-clear-key touch-target" id="btn-sync-action-disconnect">
                Disconnect Account
              </button>
            ` : ''}
            <button type="button" class="modal-close-text-btn touch-target" id="btn-close-sync-footer">
              Close
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Close modal
    this.overlay.querySelector('#btn-close-sync-modal')?.addEventListener('click', () => {
      sound.playClick();
      this.hide();
    });
    this.overlay.querySelector('#btn-close-sync-footer')?.addEventListener('click', () => {
      sound.playClick();
      this.hide();
    });
    this.overlay.querySelector('#sync-modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'sync-modal-backdrop') {
        this.hide();
      }
    });

    const tokenInput = this.overlay.querySelector('#sync-token-input');
    const gistIdInput = this.overlay.querySelector('#sync-gist-id-input');
    const autoSyncCheck = this.overlay.querySelector('#sync-auto-session-check');

    // Auto-sync toggle
    autoSyncCheck?.addEventListener('change', (e) => {
      gistSync.setAutoSyncEnabled(e.target.checked);
      toast.info(`Auto-Sync on session end: ${e.target.checked ? 'Enabled' : 'Disabled'}`);
    });

    // Validate PAT
    this.overlay.querySelector('#btn-sync-test-connection')?.addEventListener('click', async () => {
      sound.playClick();
      const rawToken = tokenInput ? tokenInput.value : '';
      if (!rawToken.trim()) {
        this.setFeedback('error', 'Please enter your GitHub Personal Access Token');
        return;
      }
      this.isOperating = true;
      this.setFeedback('loading', 'Validating GitHub Personal Access Token...');
      try {
        const res = await gistSync.validateToken(rawToken);
        if (res.ok) {
          this.setFeedback('success', `Valid token! Connected as @${res.user}`);
        } else {
          this.setFeedback('error', res.message);
        }
      } catch (err) {
        this.setFeedback('error', `Error: ${err.message}`);
      } finally {
        this.isOperating = false;
        this.render();
      }
    });

    // Connect & auto-detect / auto-create
    this.overlay.querySelector('#btn-sync-save-connect')?.addEventListener('click', async () => {
      sound.playClick();
      const rawToken = tokenInput ? tokenInput.value : '';
      const rawGist = gistIdInput ? gistIdInput.value : '';

      if (!rawToken.trim()) {
        this.setFeedback('error', 'Please enter your GitHub Personal Access Token');
        return;
      }

      this.isOperating = true;
      this.setFeedback('loading', 'Connecting & detecting arl_backup_v2.json on GitHub...');

      try {
        const res = await gistSync.connect(rawToken, rawGist);
        this.setFeedback('success', `Connected! Gist ID: ${res.gistId}`);
      } catch (err) {
        this.setFeedback('error', err.message);
      } finally {
        this.isOperating = false;
        this.render();
      }
    });

    // Sync Now (Merge)
    this.overlay.querySelector('#btn-sync-action-merge')?.addEventListener('click', async () => {
      sound.playClick();
      this.isOperating = true;
      this.setFeedback('loading', 'Merging local and cloud learning progress...');
      try {
        await gistSync.syncMerge();
        this.setFeedback('success', `Merged successfully at ${new Date().toLocaleTimeString()}!`);
      } catch (err) {
        this.setFeedback('error', `Sync failed: ${err.message}`);
      } finally {
        this.isOperating = false;
        this.render();
      }
    });

    // Push to Gist
    this.overlay.querySelector('#btn-sync-action-push')?.addEventListener('click', async () => {
      sound.playClick();
      this.isOperating = true;
      this.setFeedback('loading', 'Uploading local progress to GitHub Gist...');
      try {
        await gistSync.push({ force: true });
        this.setFeedback('success', `Push complete at ${new Date().toLocaleTimeString()}!`);
      } catch (err) {
        this.setFeedback('error', `Push failed: ${err.message}`);
      } finally {
        this.isOperating = false;
        this.render();
      }
    });

    // Pull from Gist
    this.overlay.querySelector('#btn-sync-action-pull')?.addEventListener('click', async () => {
      sound.playClick();
      this.isOperating = true;
      this.setFeedback('loading', 'Downloading remote progress from GitHub Gist...');
      try {
        await gistSync.pull({ force: true });
        this.setFeedback('success', `Pull complete at ${new Date().toLocaleTimeString()}!`);
      } catch (err) {
        this.setFeedback('error', `Pull failed: ${err.message}`);
      } finally {
        this.isOperating = false;
        this.render();
      }
    });

    // Disconnect
    this.overlay.querySelector('#btn-sync-action-disconnect')?.addEventListener('click', () => {
      if (confirm('Disconnect GitHub Gist Sync from this device?')) {
        sound.playClick();
        gistSync.disconnect();
        this.setFeedback('success', 'Disconnected from GitHub Gist');
        this.render();
      }
    });

    // Local JSON Export
    this.overlay.querySelector('#btn-sync-export-local-json')?.addEventListener('click', () => {
      sound.playClick();
      gistSync.exportLocalJson();
    });

    // Local JSON Import
    const fileInput = this.overlay.querySelector('#sync-local-file-input');
    this.overlay.querySelector('#btn-sync-import-local-json')?.addEventListener('click', () => {
      sound.playClick();
      fileInput?.click();
    });

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        await gistSync.importLocalJson(text);
        this.setFeedback('success', 'Local JSON backup restored!');
      } catch (err) {
        this.setFeedback('error', `Failed to read file: ${err.message}`);
      }
    });
  }
}
