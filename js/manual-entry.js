import { state } from './state.js';

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
    this.container.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Eigene Vokabel hinzufügen</h3>
            <button class="btn-icon btn-close-modal">✕</button>
          </div>

          <form id="custom-word-form" class="modal-form">
            <div class="form-row">
              <div class="form-group flex-1">
                <label for="word-pos">Wortart</label>
                <select id="word-pos" class="form-input">
                  <option value="noun">Nomen (Substantiv)</option>
                  <option value="verb">Verb (Tätigkeitswort)</option>
                  <option value="adjective">Adjektiv (Eigenschaftswort)</option>
                  <option value="adverb">Adverb (Umstandswort)</option>
                  <option value="connector">Konnektor (Bindewort)</option>
                </select>
              </div>

              <div class="form-group flex-1" id="article-group">
                <label for="word-article">Artikel</label>
                <select id="word-article" class="form-input">
                  <option value="der">der (maskulin)</option>
                  <option value="die">die (feminin)</option>
                  <option value="das">das (neutral)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-2">
                <label for="word-de">Deutsches Wort *</label>
                <input type="text" id="word-de" class="form-input" placeholder="z. B. Entscheidung oder verhandeln" required autocomplete="off" />
              </div>

              <div class="form-group flex-1" id="plural-group">
                <label for="word-plural">Pluralform</label>
                <input type="text" id="word-plural" class="form-input" placeholder="-en, -e, -" autocomplete="off" />
              </div>
            </div>

            <div class="form-group">
              <label for="word-mn">Mongolische Übersetzung (Kyrillisch) *</label>
              <input type="text" id="word-mn" class="form-input" placeholder="Жишээ: шийдвэр, тохиролцох" required autocomplete="off" />
            </div>

            <div class="form-group">
              <label for="word-ex-de">Deutscher Beispielsatz (optional)</label>
              <input type="text" id="word-ex-de" class="form-input" placeholder="z. B. Das war eine gute Entscheidung." autocomplete="off" />
            </div>

            <div class="form-group">
              <label for="word-ex-mn">Mongolische Satzübersetzung (optional)</label>
              <input type="text" id="word-ex-mn" class="form-input" placeholder="Жишээ: Энэ бол зөв шийдвэр байсан." autocomplete="off" />
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary btn-cancel">Abbrechen</button>
              <button type="submit" class="btn btn-primary btn-save-word">Vokabel speichern</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Dynamic visibility for article & plural based on POS
    const posSelect = this.container.querySelector('#word-pos');
    const articleGroup = this.container.querySelector('#article-group');
    const pluralGroup = this.container.querySelector('#plural-group');

    const updatePosFields = () => {
      const isNoun = posSelect.value === 'noun';
      articleGroup.style.display = isNoun ? 'block' : 'none';
      pluralGroup.style.display = isNoun ? 'block' : 'none';
    };
    posSelect.addEventListener('change', updatePosFields);
    updatePosFields();

    // Close handlers
    this.container.querySelector('.btn-close-modal').addEventListener('click', () => this.hide());
    this.container.querySelector('.btn-cancel').addEventListener('click', () => this.hide());
    this.container.querySelector('.modal-backdrop').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.hide();
    });

    // Submit handler
    const form = this.container.querySelector('#custom-word-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pos = posSelect.value;
      const word = this.container.querySelector('#word-de').value.trim();
      const article = pos === 'noun' ? this.container.querySelector('#word-article').value : null;
      const plural = pos === 'noun' ? (this.container.querySelector('#word-plural').value.trim() || '-') : null;
      const mn = this.container.querySelector('#word-mn').value.trim();
      const exDe = this.container.querySelector('#word-ex-de').value.trim();
      const exMn = this.container.querySelector('#word-ex-mn').value.trim();

      if (!word || !mn) {
        alert('Bitte gib mindestens das deutsche Wort und die mongolische Übersetzung an.');
        return;
      }

      const display = pos === 'noun' && article ? `${article} ${word}, ${plural}` : word;

      const newWord = await state.addCustomWord({
        word,
        article,
        plural,
        display,
        pos,
        mn,
        example_de: exDe,
        example_mn: exMn,
        topic: 'Eigene Wörter'
      });

      this.hide();
      if (this.onSave) this.onSave(newWord);
    });
  }
}
