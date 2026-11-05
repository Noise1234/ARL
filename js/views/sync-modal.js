/**
 * ARL - Interactive GitHub Gist Sync & Diagnostics Modal View ([SYNC])
 * Provides:
 * - Credentials configuration (Token & Gist ID with URL auto-sanitizer)
 * - [🩺 Test Connection] verifying credentials with exact HTTP status feedback
 * - [🔄 Sync Now (Merge)], [⬆️ Force Push], and [⬇️ Force Pull]
 * - Human-readable loading, success, and error diagnostic states
 */

import { gistSync } from '../sync.js';
import { sound } from '../sound.js';

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

    this.overlay.innerHTML = `
      <div class="modal-backdrop" id="sync-modal-backdrop">
        <div class="modal-dialog sync-diagnostics-dialog" role="dialog" aria-labelledby="sync-modal-title">
          
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-badge">[SYNC]</span>
              <h3 class="modal-title" id="sync-modal-title">GitHub Gist Cloud Sync & Diagnostics</h3>
            </div>
            <button class="modal-close-btn" id="btn-close-sync-modal" aria-label="Close modal">✕</button>
          </div>

          <div class="modal-body">
            
            <!-- Connection Status Banner -->
            <div class="sync-status-banner ${gistSync.isConnected() ? 'connected' : 'disconnected'}">
              <div class="banner-status-left">
                <span class="status-indicator-dot ${gistSync.isConnected() ? 'online' : 'offline'}"></span>
                <strong>Status:</strong> ${gistSync.isConnected() ? 'Connected' : 'Not Connected'}
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
                  GitHub Personal Access Token (classic with 'gist' scope or fine-grained):
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
                <span class="field-help-text">Tokens are stored locally and never synced or exported.</span>
              </div>

              <div class="settings-field-group">
                <label for="sync-gist-id-input" class="field-label">
                  Gist ID or Full Gist URL (leave blank to auto-create or auto-discover):
                </label>
                <input
                  type="text"
                  id="sync-gist-id-input"
                  class="text-input font-mono"
                  placeholder="e.g., https://gist.github.com/username/abc12345 or abc12345"
                  value="${gistId ? gistId.replace(/"/g, '&quot;') : ''}"
                  autocomplete="off"
                  ${this.isOperating ? 'disabled' : ''}
                />
                <span class="field-help-text">URLs are automatically sanitized to extract the raw Gist ID.</span>
              </div>
            </div>

            <!-- Diagnostics & Test Connection Button -->
            <div class="sync-diagnostics-row">
              <button
                type="button"
                class="settings-action-btn btn-test-conn touch-target"
                id="btn-sync-test-connection"
                ${this.isOperating ? 'disabled' : ''}>
                🩺 Test Connection
              </button>
              <button
                type="button"
                class="settings-action-btn btn-connect-sync touch-target"
                id="btn-sync-save-connect"
                ${this.isOperating ? 'disabled' : ''}>
                💾 Save Credentials
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

            <!-- Sync Action Buttons -->
            <div class="sync-action-buttons-group">
              <button
                type="button"
                class="btn-primary-action btn-sync-merge touch-target"
                id="btn-sync-action-merge"
                ${(!gistSync.isConnected() || this.isOperating) ? 'disabled' : ''}>
                🔄 Sync Now (Merge)
              </button>
              <button
                type="button"
                class="settings-action-btn btn-push-sync touch-target"
                id="btn-sync-action-push"
                ${(!gistSync.isConnected() || this.isOperating) ? 'disabled' : ''}>
                ⬆️ Force Push
              </button>
              <button
                type="button"
                class="settings-action-btn btn-pull-sync touch-target"
                id="btn-sync-action-pull"
                ${(!gistSync.isConnected() || this.isOperating) ? 'disabled' : ''}>
                ⬇️ Force Pull
              </button>
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

    // Save credentials button
    this.overlay.querySelector('#btn-sync-save-connect')?.addEventListener('click', async () => {
      sound.playClick();
      const rawToken = tokenInput ? tokenInput.value : '';
      const rawGist = gistIdInput ? gistIdInput.value : '';

      if (!rawToken.trim()) {
        this.setFeedback('error', '❌ Please enter your GitHub Personal Access Token');
        return;
      }

      this.isOperating = true;
      this.setFeedback('loading', 'Connecting and verifying credentials with GitHub...');

      try {
        await gistSync.connect(rawToken, rawGist);
        this.setFeedback('success', `✅ Connected successfully! Gist ID: ${gistSync.getGistId()}`);
      } catch (err) {
        this.setFeedback('error', `❌ ${err.message}`);
      } finally {
        this.isOperating = false;
        this.render();
      }
    });

    // Test Connection Button
    this.overlay.querySelector('#btn-sync-test-connection')?.addEventListener('click', async () => {
      sound.playClick();
      const rawToken = tokenInput ? tokenInput.value : '';
      const rawGist = gistIdInput ? gistIdInput.value : '';

      // Update sync singleton temporarily with inputs
      if (rawToken) gistSync.setToken(rawToken);
      if (rawGist) gistSync.setGistId(rawGist);

      this.isOperating = true;
      this.setFeedback('loading', 'Testing GitHub API connection...');

      try {
        const result = await gistSync.testConnection();
        this.setFeedback(result.ok ? 'success' : 'error', result.message);
      } catch (err) {
        this.setFeedback('error', `❌ Error: ${err.message}`);
      } finally {
        this.isOperating = false;
        this.render();
      }
    });

    // Sync Now (Merge)
    this.overlay.querySelector('#btn-sync-action-merge')?.addEventListener('click', async () => {
      sound.playClick();
      this.isOperating = true;
      this.setFeedback('loading', '🔄 Merging local and cloud learning progress...');
      try {
        await gistSync.syncMerge();
        this.setFeedback('success', `✅ Synced & merged successfully at ${new Date().toLocaleTimeString()}!`);
      } catch (err) {
        this.setFeedback('error', `❌ Sync failed: ${err.message}`);
      } finally {
        this.isOperating = false;
        this.render();
      }
    });

    // Force Push
    this.overlay.querySelector('#btn-sync-action-push')?.addEventListener('click', async () => {
      sound.playClick();
      this.isOperating = true;
      this.setFeedback('loading', '⬆️ Uploading local learning data to GitHub Gist...');
      try {
        await gistSync.push();
        this.setFeedback('success', `✅ Force Push complete at ${new Date().toLocaleTimeString()}!`);
      } catch (err) {
        this.setFeedback('error', `❌ Push failed: ${err.message}`);
      } finally {
        this.isOperating = false;
        this.render();
      }
    });

    // Force Pull
    this.overlay.querySelector('#btn-sync-action-pull')?.addEventListener('click', async () => {
      sound.playClick();
      this.isOperating = true;
      this.setFeedback('loading', '⬇️ Downloading remote progress from GitHub Gist...');
      try {
        await gistSync.pull();
        this.setFeedback('success', `✅ Force Pull complete at ${new Date().toLocaleTimeString()}!`);
      } catch (err) {
        this.setFeedback('error', `❌ Pull failed: ${err.message}`);
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
  }
}
