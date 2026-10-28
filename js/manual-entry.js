/**
 * ARL - Manual Custom Word Entry Modal
 * Allows autonomous learners to insert custom vocabulary items.
 * Generates appropriate Cloze masking, principal verb tags, and persists to IndexedDB.
 */

import { state } from './state.js';
import { t } from './i18n.js';
import { sound } from './sound.js';
import { normalizeNFC } from './unicode.js';

export class ManualWordEntryModal {
  constructor(containerEl, onSaveCallback) {
    this.container = containerEl;
    this.onSave = onSaveCallback;
  }

  show() {
    this.render();
  }

  hide() {
    this.container.innerHTML = '';
  }

  render() {
    const isDe = state.targetLang === 'de';
    const targetLangLabel = isDe ? 'German' : 'English';

    this.container.innerHTML = `
      <div class="settings-modal-backdrop" id="modal-word-backdrop">
        <div class="settings-hud-card manual-word-modal" role="dialog" aria-modal="true" aria-label="Add Word">
          
          <div class="settings-hud-header">
            <div class="help-title-group">
              <span class="settings-hud-title">${t('add_custom_word')}</span>
              <span class="help-subtitle">${targetLangLabel} · Level ${state.cefrLevel.toUpperCase()}</span>
            </div>
            <button class="settings-close-btn touch-target" id="btn-close-word-modal" title="Close [Esc]">
              <span class="micro-bracket">[Esc]</span> ✕
            </button>
          </div>

          <form id="custom-word-form" class="modal-form">
            <div class="form-row">
              <div class="form-group flex-1">
                <label for="word-pos">Part of Speech</label>
                <select id="word-pos" class="form-select">
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                </select>
              </div>

              ${isDe ? `
                <div class="form-group flex-1" id="article-group">
                  <label for="word-article">Article</label>
                  <select id="word-article" class="form-select">
                    <option value="der">der (masculine)</option>
                    <option value="die">die (feminine)</option>
                    <option value="das">das (neuter)</option>
                  </select>
                </div>
              ` : ''}
            </div>

            <div class="form-row">
              <div class="form-group flex-2">
                <label for="word-target">Word (${targetLangLabel}) *</label>
                <input type="text" id="word-target" class="form-input" placeholder="${isDe ? 'e.g. Entscheidung' : 'e.g. decision'}" required autocomplete="off" />
              </div>

              ${isDe ? `
                <div class="form-group flex-1" id="plural-group">
                  <label for="word-plural">Plural Form</label>
                  <input type="text" id="word-plural" class="form-input" placeholder="-en, -e, -er, -" autocomplete="off" />
                </div>
              ` : ''}
            </div>

            <div class="form-group" id="verb-forms-group" style="display: none;">
              <label for="word-forms">Principal Forms (optional)</label>
              <input type="text" id="word-forms" class="form-input" placeholder="${isDe ? 'Infinitiv | 3.P. | Präteritum | Partizip II' : 'V1 | V2 | V3'}" autocomplete="off" />
            </div>

            <div class="form-group">
              <label for="word-mn">Mongolian Translation (Cyrillic) *</label>
              <input type="text" id="word-mn" class="form-input" placeholder="Жишээ: шийдвэр, сонголт" required autocomplete="off" />
            </div>

            <div class="form-group">
              <label for="word-ex-target">Example Sentence (${targetLangLabel})</label>
              <input type="text" id="word-ex-target" class="form-input" placeholder="${isDe ? 'z. B. Das war eine gute Entscheidung.' : 'e.g. That was a wise decision.'}" autocomplete="off" />
            </div>

            <div class="form-group">
              <label for="word-ex-mn">Mongolian Example Translation</label>
              <input type="text" id="word-ex-mn" class="form-input" placeholder="Жишээ: Энэ бол зөв шийдвэр байсан." autocomplete="off" />
            </div>

            <div class="form-actions-row">
              <button type="button" class="keyhint-btn touch-target" id="btn-cancel-word">Cancel</button>
              <button type="submit" class="keyhint-btn keyhint-primary touch-target" id="btn-save-word">Save Word</button>
            </div>
          </form>

        </div>
      </div>
    `;

    // Dynamic visibility
    const posSelect = this.container.querySelector('#word-pos');
    const articleGroup = this.container.querySelector('#article-group');
    const pluralGroup = this.container.querySelector('#plural-group');
    const verbFormsGroup = this.container.querySelector('#verb-forms-group');

    const updateVisibility = () => {
      const pos = posSelect.value;
      if (articleGroup) articleGroup.style.display = pos === 'noun' ? 'block' : 'none';
      if (pluralGroup) pluralGroup.style.display = pos === 'noun' ? 'block' : 'none';
      if (verbFormsGroup) verbFormsGroup.style.display = pos === 'verb' ? 'block' : 'none';
    };
    posSelect.addEventListener('change', updateVisibility);
    updateVisibility();

    // Close
    this.container.querySelector('#btn-close-word-modal')?.addEventListener('click', () => this.hide());
    this.container.querySelector('#btn-cancel-word')?.addEventListener('click', () => this.hide());
    this.container.querySelector('#modal-word-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-word-backdrop') this.hide();
    });

    // Submit
    const form = this.container.querySelector('#custom-word-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pos = posSelect.value;
      const word = normalizeNFC(this.container.querySelector('#word-target').value.trim());
      const mn = normalizeNFC(this.container.querySelector('#word-mn').value.trim());
      const article = (isDe && pos === 'noun') ? this.container.querySelector('#word-article').value : null;
      const plural = (isDe && pos === 'noun') ? normalizeNFC(this.container.querySelector('#word-plural')?.value.trim() || '-') : null;
      const forms = normalizeNFC(this.container.querySelector('#word-forms')?.value.trim() || null);
      const exTarget = normalizeNFC(this.container.querySelector('#word-ex-target').value.trim());
      const exMn = normalizeNFC(this.container.querySelector('#word-ex-mn').value.trim());

      if (!word || !mn) return;

      let promptFront = word;
      let revealedBack = word;

      if (pos === 'noun' && isDe && article) {
        promptFront = `_____ ${word}, -? [N]`;
        revealedBack = `${article} ${word}, ${plural}`;
      } else if (pos === 'verb' && forms) {
        promptFront = `${word} [V]`;
        revealedBack = forms;
      }

      const display = (pos === 'noun' && isDe && article) ? `${article} ${word}, ${plural}` : word;

      const newEntry = {
        word,
        article,
        plural,
        display,
        pos,
        forms,
        rektion: null,
        prompt_front: promptFront,
        revealed_back: revealedBack,
        mn,
        en: !isDe ? word : '',
        de: isDe ? word : '',
        example_de: isDe ? exTarget : '',
        example_en: !isDe ? exTarget : '',
        example_mn: exMn,
        topic: 'Custom Words'
      };

      await state.addCustomWord(newEntry);
      sound.playSuccess();
      this.hide();

      if (typeof this.onSave === 'function') {
        this.onSave(newEntry);
      }
    });
  }
}
