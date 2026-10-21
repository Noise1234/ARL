/**
 * ARL - Settings Modal HUD
 * Language selection, CEFR levels, Backup/Restore,
 * and Gemini Free Tier API Key configuration with secure localStorage persistence.
 */

import { state } from '../state.js';
import { db } from '../db.js';
import { t } from '../i18n.js';
import { keyboard, KeyboardState } from '../keyboard.js';
import { GeminiClient } from '../gemini.js';

export class SettingsModalView {
  constructor(overlayEl, onCloseCallback) {
    this.overlay = overlayEl;
    this.onClose = onCloseCallback;
    this.showApiKey = false;
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

            <!-- Free Gemini 2.5 Flash API Configuration -->
            <div class="settings-row settings-gemini-row">
              <div class="gemini-header-row">
                <span class="settings-label">Gemini AI Key (Free Tier)</span>
                <span class="gemini-status-tag ${hasKey ? 'tag-connected' : 'tag-fallback'}">
                  ${hasKey ? '⚡ Gemini 2.5 Flash Active' : '⚙ Local Fallback Active'}
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
              <span class="settings-label">Android Native App (v2.0)</span>
              <div class="apk-download-group">
                <a href="/apk" class="settings-action-btn touch-target btn-download-apk" download="ARL-v2.0.apk" style="text-decoration:none; text-align:center;">
                  <span class="micro-bracket">[APK]</span> Download Android APK (1.9MB)
                </a>
              </div>
            </div>

            <!-- Backup & Restore -->
            <div class="settings-row settings-backup-row">
              <span class="settings-label">Backup & Progress</span>
              <div class="backup-btn-group">
                <button class="settings-action-btn touch-target" id="btn-export-backup">
                  <span class="micro-bracket">[E]</span> ${t('export_backup')}
                </button>
                <input type="file" id="settings-backup-input" accept=".json" style="display:none;" />
                <button class="settings-action-btn touch-target" id="btn-import-backup">
                  ${t('import_backup')}
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
    this.overlay.querySelector('#btn-export-backup').addEventListener('click', () => {
      this.exportBackup();
    });

    // Backup Import
    const fileInput = this.overlay.querySelector('#settings-backup-input');
    this.overlay.querySelector('#btn-import-backup').addEventListener('click', () => {
      fileInput.click();
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
