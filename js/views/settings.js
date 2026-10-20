/**
 * ARL - Minimal Inline Settings HUD
 * Toggled via S or Esc.
 * Actions:
 * [L] Target language (DE <-> EN)
 * [I] Interface language (MN -> EN -> DE)
 * [1-4] CEFR Level (A1, A2, B1, B2)
 * [E] Export Backup JSON
 * [Import Backup]
 * [Esc]/[S] Close HUD
 */

import { state } from '../state.js';
import { db } from '../db.js';
import { t } from '../i18n.js';
import { keyboard, KeyboardState } from '../keyboard.js';

export class SettingsModalView {
  constructor(overlayEl, onCloseCallback) {
    this.overlay = overlayEl;
    this.onClose = onCloseCallback;
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

    this.overlay.innerHTML = `
      <div class="settings-modal-backdrop" id="settings-backdrop">
        <div class="settings-hud-card" role="dialog" aria-modal="true" aria-label="Settings HUD">
          
          <div class="settings-hud-header">
            <span class="settings-hud-title">${t('settings_title')}</span>
            <button class="settings-close-btn" id="btn-settings-close" title="Keyboard: Esc or S">
              <span class="micro-bracket">[Esc]</span> ✕
            </button>
          </div>

          <div class="settings-options-grid">
            <!-- Target Language -->
            <div class="settings-row">
              <span class="settings-label">${t('target_lang')}</span>
              <button class="settings-action-btn" id="btn-toggle-target">
                <span class="micro-bracket">[L]</span>
                <span class="settings-value">${targetLabel}</span>
              </button>
            </div>

            <!-- Interface Language -->
            <div class="settings-row">
              <span class="settings-label">${t('interface_lang')}</span>
              <button class="settings-action-btn" id="btn-cycle-i18n">
                <span class="micro-bracket">[I]</span>
                <span class="settings-value">${i18nLabel}</span>
              </button>
            </div>

            <!-- CEFR Level -->
            <div class="settings-row">
              <span class="settings-label">${t('cefr_level')}</span>
              <div class="level-btn-group">
                ${cefrLevels.map((lvl, idx) => `
                  <button class="lvl-choice-btn ${state.cefrLevel === lvl ? 'active' : ''}" data-lvl="${lvl}">
                    <span class="micro-bracket">[${idx + 1}]</span> ${lvl.toUpperCase()}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Backup & Restore -->
            <div class="settings-row settings-backup-row">
              <span class="settings-label">Backup</span>
              <div class="backup-btn-group">
                <button class="settings-action-btn" id="btn-export-backup">
                  <span class="micro-bracket">[E]</span> ${t('export_backup')}
                </button>
                <input type="file" id="settings-backup-input" accept=".json" style="display:none;" />
                <button class="settings-action-btn" id="btn-import-backup">
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

    // Export & Import
    this.overlay.querySelector('#btn-export-backup').addEventListener('click', () => {
      this.exportBackup();
    });

    const fileInput = this.overlay.querySelector('#settings-backup-input');
    this.overlay.querySelector('#btn-import-backup').addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          await db.importBackup(evt.target.result);
          await state.init();
          this.close();
        } catch (err) {
          alert('Import error: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }
}
