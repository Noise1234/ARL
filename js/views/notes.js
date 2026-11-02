/**
 * ARL - Smart Notes & Sentence Drafting Workspace
 * Persistent multi-note manager with localStorage auto-save.
 * Highlights text to trigger instant AI explanations, sentence evaluation with color diff,
 * and floating Grammar PiP integration.
 */

import { state } from '../state.js';
import { sound } from '../sound.js';
import { GeminiClient } from '../gemini.js';
import { grammarPip } from '../grammar-pip.js';

const STORAGE_KEY = 'arl_smart_notes';

export class NotesView {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.notes = [];
    this.activeNoteId = null;
    this.selectedText = '';
    this.aiExplanation = null;
    this.aiDiff = null;
    this.isAiLoading = false;
    this.saveTimeout = null;

    this.loadNotes();
  }

  loadNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.notes = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load notes from localStorage:', e);
      this.notes = [];
    }

    if (!Array.isArray(this.notes) || this.notes.length === 0) {
      // Seed initial sample note
      const initialNote = {
        id: 'note_' + Date.now(),
        title: '🇩🇪 German Grammar & Drafting Notes',
        content: `### My German Study Notes\n\n1. Hauptsatz (V2 Rule):\nHeute lerne ich fleißig Deutsch.\n\n2. Subordinate Clause (Verb-End):\nIch bleibe zu Hause, weil es heute stark regnet.\n\n3. Dativ & Akkusativ sentences:\nIch schenke meinem Bruder ein neues Buch.\n\nHighlight any sentence or word above to test instant AI check!`,
        updatedAt: Date.now()
      };
      this.notes = [initialNote];
      this.activeNoteId = initialNote.id;
      this.saveNotes();
    } else if (!this.activeNoteId || !this.notes.some(n => n.id === this.activeNoteId)) {
      this.activeNoteId = this.notes[0].id;
    }
  }

  saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes));
    } catch (e) {
      console.warn('Failed to save notes:', e);
    }
  }

  getActiveNote() {
    return this.notes.find(n => n.id === this.activeNoteId) || this.notes[0];
  }

  updateActiveNote(patch = {}) {
    const active = this.getActiveNote();
    if (active) {
      Object.assign(active, patch, { updatedAt: Date.now() });
      this.saveNotes();
    }
  }

  createNote(title = 'New Study Note') {
    const newNote = {
      id: 'note_' + Date.now(),
      title: title || 'New Study Note',
      content: '',
      updatedAt: Date.now()
    };
    this.notes.unshift(newNote);
    this.activeNoteId = newNote.id;
    this.saveNotes();
    this.render();
    return newNote;
  }

  deleteNote(id) {
    if (this.notes.length <= 1) {
      // Clear contents if only one left
      this.notes[0].title = 'New Study Note';
      this.notes[0].content = '';
      this.notes[0].updatedAt = Date.now();
    } else {
      this.notes = this.notes.filter(n => n.id !== id);
      if (this.activeNoteId === id) {
        this.activeNoteId = this.notes[0].id;
      }
    }
    this.saveNotes();
    this.render();
  }

  scheduleAutoSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveNotes();
      const statusEl = this.container.querySelector('#notes-save-status');
      if (statusEl) {
        statusEl.textContent = '✓ Saved';
        statusEl.classList.add('saved-flash');
        setTimeout(() => statusEl.classList.remove('saved-flash'), 2000);
      }
    }, 400);
  }

  render() {
    const activeNote = this.getActiveNote() || { id: '', title: '', content: '' };

    this.container.innerHTML = `
      <div class="notes-workspace-container">
        
        <!-- Sidebar: Notes list -->
        <aside class="notes-sidebar">
          <div class="notes-sidebar-header">
            <h3 class="notes-sidebar-title">📝 Smart Notes</h3>
            <button class="notes-new-btn touch-target" id="btn-create-note" title="Create a new note">
              + New Note
            </button>
          </div>

          <div class="notes-list-scroll">
            ${this.notes.map(note => `
              <div class="note-list-item ${note.id === activeNote.id ? 'active' : ''}" data-id="${note.id}">
                <div class="note-item-title">${note.title || 'Untitled'}</div>
                <div class="note-item-snippet">${(note.content || '').slice(0, 45).replace(/\n/g, ' ') || 'Empty note'}</div>
                <button class="note-delete-btn" data-delete-id="${note.id}" title="Delete note">✕</button>
              </div>
            `).join('')}
          </div>

          <div class="notes-sidebar-footer">
            <button class="notes-pip-toggle-btn touch-target" id="btn-toggle-grammar-pip">
              📖 Open Grammar PiP
            </button>
          </div>
        </aside>

        <!-- Main Workspace Editor -->
        <section class="notes-editor-panel">
          
          <div class="notes-editor-header">
            <input
              type="text"
              id="note-title-input"
              class="note-title-field"
              value="${activeNote.title || ''}"
              placeholder="Note title..."
            />
            <div class="notes-status-group">
              <span class="notes-save-status" id="notes-save-status">✓ Saved</span>
              <button class="btn-pip-quick-launch" id="btn-launch-pip-editor" title="Open Grammar Reference PiP">
                📖 Grammar PiP
              </button>
            </div>
          </div>

          <!-- Special characters bar for drafting German/European letters -->
          <div class="notes-char-bar">
            <span class="char-bar-label">Special Chars:</span>
            ${state.targetLang === 'de' ? `
              <button class="char-chip-btn" data-char="ä">ä</button>
              <button class="char-chip-btn" data-char="ö">ö</button>
              <button class="char-chip-btn" data-char="ü">ü</button>
              <button class="char-chip-btn" data-char="ß">ß</button>
              <button class="char-chip-btn" data-char="Ä">Ä</button>
              <button class="char-chip-btn" data-char="Ö">Ö</button>
              <button class="char-chip-btn" data-char="Ü">Ü</button>
            ` : `
              <button class="char-chip-btn" data-char="“">“</button>
              <button class="char-chip-btn" data-char="”">”</button>
              <button class="char-chip-btn" data-char="—">—</button>
            `}
          </div>

          <!-- Textarea for Notes & Drafting -->
          <div class="notes-textarea-wrapper">
            <textarea
              id="notes-main-textarea"
              class="notes-textarea"
              placeholder="Write study notes or draft sentences here... Highlight text to trigger instant AI explanations or grammar checks."
            >${activeNote.content || ''}</textarea>

            <!-- Floating Selection Action Bar -->
            <div id="notes-selection-toolbar" class="notes-selection-toolbar" style="display: none;">
              <span class="sel-label">Selected:</span>
              <button class="sel-action-btn sel-btn-explain" id="btn-sel-explain" title="Ask AI to explain this grammar concept">
                ⚡ Ask AI Explanation
              </button>
              <button class="sel-action-btn sel-btn-check" id="btn-sel-check" title="Check this sentence for grammar & word-order errors">
                ✍ Check Sentence
              </button>
              <button class="sel-action-btn sel-btn-pip" id="btn-sel-pip" title="Open matching rule in Grammar PiP">
                📖 Open in PiP
              </button>
            </div>
          </div>

          <!-- AI Assistant Result Panel -->
          ${this.isAiLoading ? `
            <div class="notes-ai-result-panel">
              <div class="ai-loading-spinner-row">
                <span class="loading-spinner"></span>
                <span>AI analyzing selected text...</span>
              </div>
            </div>
          ` : (this.aiExplanation || this.aiDiff ? `
            <div class="notes-ai-result-panel">
              <div class="ai-panel-header">
                <span class="ai-badge">🤖 AI Study Assistant</span>
                <button class="ai-close-btn" id="btn-close-ai-panel">✕</button>
              </div>

              ${this.aiDiff ? `
                <div class="ai-diff-section">
                  <div class="ai-section-title">Color-Coded Evaluation:</div>
                  <div class="diff-card-body">
                    ${this.aiDiff.diffHtml || `<div class="corrected-text">${this.aiDiff.correctedSentence}</div>`}
                  </div>
                  <div class="diff-breakdown">
                    <span class="diff-verdict ${this.aiDiff.verdict === 'Perfect!' ? 'verdict-perfect' : 'verdict-warn'}">
                      ${this.aiDiff.verdict}
                    </span>
                    <span class="diff-why">${this.aiDiff.why}</span>
                  </div>
                  ${this.aiDiff.naturalAlternative ? `
                    <div class="diff-natural">Native: „${this.aiDiff.naturalAlternative}“</div>
                  ` : ''}
                </div>
              ` : ''}

              ${this.aiExplanation ? `
                <div class="ai-explanation-section">
                  <div class="ai-section-title">Grammar & Concept Breakdown:</div>
                  <div class="ai-explanation-text">${this.aiExplanation}</div>
                </div>
              ` : ''}
            </div>
          ` : '')}

        </section>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const activeNote = this.getActiveNote();

    // Create note
    this.container.querySelector('#btn-create-note')?.addEventListener('click', () => {
      sound.playClick();
      this.createNote();
    });

    // Delete note
    this.container.querySelectorAll('.note-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playClick();
        const id = btn.getAttribute('data-delete-id');
        this.deleteNote(id);
      });
    });

    // Switch note
    this.container.querySelectorAll('.note-list-item').forEach(item => {
      item.addEventListener('click', () => {
        sound.playClick();
        this.activeNoteId = item.getAttribute('data-id');
        this.aiExplanation = null;
        this.aiDiff = null;
        this.render();
      });
    });

    // Toggle PiP buttons
    const togglePip = () => {
      sound.playClick();
      grammarPip.toggle();
    };
    this.container.querySelector('#btn-toggle-grammar-pip')?.addEventListener('click', togglePip);
    this.container.querySelector('#btn-launch-pip-editor')?.addEventListener('click', togglePip);

    // Title input
    const titleInput = this.container.querySelector('#note-title-input');
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        activeNote.title = e.target.value;
        activeNote.updatedAt = Date.now();
        this.scheduleAutoSave();
        // Update sidebar item text
        const activeItemTitle = this.container.querySelector(`.note-list-item[data-id="${activeNote.id}"] .note-item-title`);
        if (activeItemTitle) activeItemTitle.textContent = e.target.value || 'Untitled';
      });
    }

    // Textarea input
    const textarea = this.container.querySelector('#notes-main-textarea');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        activeNote.content = e.target.value;
        activeNote.updatedAt = Date.now();
        this.scheduleAutoSave();
        const activeItemSnippet = this.container.querySelector(`.note-list-item[data-id="${activeNote.id}"] .note-item-snippet`);
        if (activeItemSnippet) {
          activeItemSnippet.textContent = e.target.value.slice(0, 45).replace(/\n/g, ' ') || 'Empty note';
        }
      });

      // Special characters bar
      this.container.querySelectorAll('.char-chip-btn').forEach(chip => {
        chip.addEventListener('click', () => {
          const char = chip.getAttribute('data-char');
          const start = textarea.selectionStart ?? textarea.value.length;
          const end = textarea.selectionEnd ?? textarea.value.length;
          const val = textarea.value;
          textarea.value = val.slice(0, start) + char + val.slice(end);
          textarea.selectionStart = textarea.selectionEnd = start + char.length;
          activeNote.content = textarea.value;
          this.scheduleAutoSave();
          textarea.focus();
        });
      });

      // Selection tracking for floating toolbar
      const toolbar = this.container.querySelector('#notes-selection-toolbar');
      const handleSelection = () => {
        const sel = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
        this.selectedText = sel;
        if (sel.length > 2 && toolbar) {
          toolbar.style.display = 'flex';
        } else if (toolbar) {
          toolbar.style.display = 'none';
        }
      };

      textarea.addEventListener('mouseup', handleSelection);
      textarea.addEventListener('keyup', handleSelection);
    }

    // Floating selection toolbar actions
    this.container.querySelector('#btn-sel-explain')?.addEventListener('click', async () => {
      if (!this.selectedText) return;
      this.isAiLoading = true;
      this.aiDiff = null;
      this.aiExplanation = null;
      this.render();

      try {
        const explanation = await GeminiClient.explainGrammarConcept(this.selectedText, state.targetLang);
        this.aiExplanation = explanation;
      } catch (err) {
        this.aiExplanation = `Explanation: ${this.selectedText} - Check conjugation, case, or word order.`;
      } finally {
        this.isAiLoading = false;
        this.render();
      }
    });

    this.container.querySelector('#btn-sel-check')?.addEventListener('click', async () => {
      if (!this.selectedText) return;
      this.isAiLoading = true;
      this.aiDiff = null;
      this.aiExplanation = null;
      this.render();

      try {
        const feedback = await GeminiClient.evaluateSentence(this.selectedText, '', state.targetLang);
        this.aiDiff = feedback;
      } catch (err) {
        console.warn('Sentence check failed:', err);
      } finally {
        this.isAiLoading = false;
        this.render();
      }
    });

    this.container.querySelector('#btn-sel-pip')?.addEventListener('click', () => {
      grammarPip.openTopic(grammarPip.activeTopic || grammarPip.allTopics[0]);
    });

    // Close AI assistant result panel
    this.container.querySelector('#btn-close-ai-panel')?.addEventListener('click', () => {
      this.aiExplanation = null;
      this.aiDiff = null;
      this.render();
    });
  }
}
