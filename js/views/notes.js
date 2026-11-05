/**
 * ARL - Samsung Notes-Style Smart Notes Workspace ([N])
 * Full-featured note-taking workspace with:
 * - Dynamic Folder System (All Notes, Grammar, Vocab, B1 Speaking, Custom Folders)
 * - Live-editable auto-saving Note Title input
 * - Unified compact toolbar (Font size A-/A+, Quick German/English characters, Mode toggles, AI Check)
 * - S-Pen / Touch / Mouse High-DPI Drawing Canvas with undo, colors, eraser, touch-action: none
 * - In-Note AI Grammar & Study Checker with color-coded diff and 1-tap correction apply
 */

import { state } from '../state.js';
import { sound } from '../sound.js';
import { GeminiClient } from '../gemini.js';
import { grammarPip } from '../grammar-pip.js';
import { gistSync } from '../sync.js';
import { computeDiff, renderColorCodedDiff } from '../diff.js';

const STORAGE_KEY = 'arl_smart_notes';
const STORAGE_FOLDERS_KEY = 'arl_notes_folders';

export class NotesView {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.notes = [];
    this.folders = ['All Notes', 'Grammar', 'Vocab', 'B1 Speaking'];
    this.activeFolder = 'All Notes';
    this.activeNoteId = null;
    this.selectedText = '';
    this.aiExplanation = null;
    this.aiDiff = null;
    this.isAiLoading = false;
    this.saveTimeout = null;

    // View mode: 'text' | 'draw' | 'split'
    this.viewMode = 'text';
    this.fontSize = 16; // 13px - 24px

    // Drawing state
    this.penColor = '#ffffff';
    this.penWidth = 4;
    this.isEraser = false;
    this.isDrawing = false;
    this.strokesHistory = []; // list of image data URLs or stroke paths for Undo
    this.canvasEl = null;
    this.ctx = null;

    this.loadNotes();
  }

  loadNotes() {
    try {
      if (typeof localStorage !== 'undefined') {
        const rawFolders = localStorage.getItem(STORAGE_FOLDERS_KEY);
        if (rawFolders) {
          this.folders = JSON.parse(rawFolders);
        }
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.notes = JSON.parse(raw);
        }
      }
    } catch (e) {
      console.warn('Failed to load notes from localStorage:', e);
      this.notes = [];
    }

    if (!Array.isArray(this.folders) || this.folders.length === 0) {
      this.folders = ['All Notes', 'Grammar', 'Vocab', 'B1 Speaking'];
    }

    if (!Array.isArray(this.notes) || this.notes.length === 0) {
      // Seed initial sample note
      const initialNote = {
        id: 'note_' + Date.now(),
        title: '🇩🇪 German Grammar & Drafting Notes',
        folder: 'Grammar',
        content: `### My German Study Notes\n\n1. Hauptsatz (V2 Rule):\nHeute lerne ich fleißig Deutsch.\n\n2. Subordinate Clause (Verb-End):\nIch bleibe zu Hause, weil es heute stark regnet.\n\n3. Dativ & Akkusativ sentences:\nIch schenke meinem Bruder ein neues Buch.\n\nHighlight any sentence or tap [✨ AI Check] to test instant grammar feedback!`,
        drawingData: null,
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notes));
        localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(this.folders));
      }
      gistSync.scheduleAutoPush();
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
    const folder = (this.activeFolder === 'All Notes') ? 'Grammar' : this.activeFolder;
    const newNote = {
      id: 'note_' + Date.now(),
      title: title || 'New Study Note',
      folder: folder,
      content: '',
      drawingData: null,
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
      this.notes[0].title = 'New Study Note';
      this.notes[0].content = '';
      this.notes[0].drawingData = null;
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

  createFolder() {
    const name = prompt('New Folder Name:');
    if (name && name.trim()) {
      const folderName = name.trim();
      if (!this.folders.includes(folderName)) {
        this.folders.push(folderName);
        this.activeFolder = folderName;
        this.saveNotes();
        this.render();
      }
    }
  }

  deleteFolder(folderName) {
    if (folderName === 'All Notes' || this.folders.length <= 1) return;
    if (confirm(`Delete folder "${folderName}"? Notes inside will be moved to "All Notes".`)) {
      this.folders = this.folders.filter(f => f !== folderName);
      this.notes.forEach(n => {
        if (n.folder === folderName) n.folder = 'All Notes';
      });
      this.activeFolder = 'All Notes';
      this.saveNotes();
      this.render();
    }
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

  setFontSize(delta) {
    this.fontSize = Math.max(13, Math.min(24, this.fontSize + delta));
    const ta = this.container.querySelector('#notes-main-textarea');
    if (ta) ta.style.fontSize = `${this.fontSize}px`;
    const label = this.container.querySelector('#font-size-label');
    if (label) label.textContent = `${this.fontSize}px`;
  }

  setViewMode(mode) {
    if (['text', 'draw', 'split'].includes(mode)) {
      this.viewMode = mode;
      this.render();
    }
  }

  render() {
    const activeNote = this.getActiveNote() || { id: '', title: '', content: '', folder: 'All Notes', drawingData: null };
    const filteredNotes = (this.activeFolder === 'All Notes')
      ? this.notes
      : this.notes.filter(n => n.folder === this.activeFolder);

    this.container.innerHTML = `
      <div class="notes-workspace-container samsung-notes-layout">
        
        <!-- Sidebar: Folders & Note List -->
        <aside class="notes-sidebar">
          
          <div class="notes-sidebar-header">
            <h3 class="notes-sidebar-title">[N] Smart Notes</h3>
            <button class="notes-new-btn touch-target" id="btn-create-note" title="Create a new note">
              + New Note
            </button>
          </div>

          <!-- Folder Bar -->
          <div class="notes-folder-bar">
            ${this.folders.map(f => `
              <button class="folder-chip-btn ${f === this.activeFolder ? 'active' : ''}" data-folder="${f}">
                ${f}
              </button>
            `).join('')}
            <button class="folder-chip-btn add-folder-btn" id="btn-add-folder" title="Create new folder">+ Folder</button>
          </div>

          <!-- Notes List -->
          <div class="notes-list-scroll">
            ${filteredNotes.length === 0 ? `
              <div class="empty-folder-state">No notes in this folder.</div>
            ` : filteredNotes.map(note => `
              <div class="note-list-item ${note.id === activeNote.id ? 'active' : ''}" data-id="${note.id}">
                <div class="note-item-title">${note.title || 'Untitled Note'}</div>
                <div class="note-item-snippet">${(note.content || '').slice(0, 40).replace(/\n/g, ' ') || (note.drawingData ? '[✏️ Drawing]' : 'Empty note')}</div>
                <div class="note-item-meta">
                  <span class="note-folder-tag">${note.folder || 'All'}</span>
                  <button class="note-delete-btn" data-delete-id="${note.id}" title="Delete note">✕</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer utility -->
          <div class="notes-sidebar-footer">
            <button class="notes-import-export-btn touch-target" id="btn-export-note">⬇ Export</button>
            <label class="notes-import-export-btn touch-target" id="label-import-note">
              ⬆ Import
              <input type="file" id="input-import-note" accept=".json,.txt,.md" style="display:none;" />
            </label>
          </div>
        </aside>

        <!-- Main Editor Panel -->
        <main class="notes-editor-panel">
          
          <!-- Top Title Bar with Editable Input & Folder Switcher -->
          <div class="notes-title-header-row">
            <div class="notes-title-input-wrap">
              <input
                type="text"
                id="note-title-input"
                class="note-title-input"
                placeholder="Untitled Note..."
                value="${(activeNote.title || '').replace(/"/g, '&quot;')}"
                autocomplete="off"
              />
            </div>

            <div class="notes-header-actions">
              <select class="note-folder-select" id="note-folder-select" title="Move note to folder">
                ${this.folders.filter(f => f !== 'All Notes').map(f => `
                  <option value="${f}" ${activeNote.folder === f ? 'selected' : ''}>📁 ${f}</option>
                `).join('')}
              </select>
              <span id="notes-save-status" class="notes-save-status">Auto-saved</span>
            </div>
          </div>

          <!-- Unified Sleek Toolbar -->
          <div class="notes-unified-toolbar">
            
            <!-- Font Size Controls -->
            <div class="toolbar-group font-size-controls">
              <button class="toolbar-btn" id="btn-font-dec" title="Decrease font size">[A-]</button>
              <span class="font-size-label" id="font-size-label">${this.fontSize}px</span>
              <button class="toolbar-btn" id="btn-font-inc" title="Increase font size">[A+]</button>
            </div>

            <!-- Quick Special Characters -->
            <div class="toolbar-group special-chars-group">
              ${['ä', 'ö', 'ü', 'ß', '“', '”', '—'].map(ch => `
                <button type="button" class="char-chip-btn toolbar-char-btn" data-char="${ch}">${ch}</button>
              `).join('')}
            </div>

            <!-- Mode Toggles: Text, Draw, Split -->
            <div class="toolbar-group mode-toggles-group">
              <button class="toolbar-btn mode-btn ${this.viewMode === 'text' ? 'active' : ''}" data-mode="text" title="Keyboard Text Mode">
                ⌨️ Text
              </button>
              <button class="toolbar-btn mode-btn ${this.viewMode === 'draw' ? 'active' : ''}" data-mode="draw" title="Handwriting & S-Pen Drawing">
                ✏️ Draw
              </button>
              <button class="toolbar-btn mode-btn ${this.viewMode === 'split' ? 'active' : ''}" data-mode="split" title="Split Screen Mode">
                Split
              </button>
            </div>

            <!-- AI Grammar Assistant Trigger -->
            <div class="toolbar-group">
              <button class="toolbar-btn ai-trigger-btn touch-target" id="btn-toolbar-ai-check" title="AI Grammar & Syntax Check">
                ✨ AI Check
              </button>
            </div>

          </div>

          <!-- Drawing Sub-Bar (shown in Draw & Split modes) -->
          <div class="drawing-sub-bar ${this.viewMode === 'text' ? 'hidden' : ''}" id="drawing-sub-bar">
            
            <div class="drawing-colors">
              ${['#ffffff', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(color => `
                <button
                  type="button"
                  class="color-dot-btn ${this.penColor === color && !this.isEraser ? 'active' : ''}"
                  data-color="${color}"
                  style="background-color: ${color};"
                  title="Color: ${color}">
                </button>
              `).join('')}
            </div>

            <div class="drawing-widths">
              ${[2, 4, 8].map(w => `
                <button
                  type="button"
                  class="width-dot-btn ${this.penWidth === w && !this.isEraser ? 'active' : ''}"
                  data-width="${w}"
                  title="${w}px stroke">
                  <span style="width: ${w * 2}px; height: ${w * 2}px; background: white; border-radius: 50%; display:inline-block;"></span>
                </button>
              `).join('')}
            </div>

            <div class="drawing-tools">
              <button class="draw-tool-btn ${this.isEraser ? 'active' : ''}" id="btn-draw-eraser" title="Eraser">🧹 Eraser</button>
              <button class="draw-tool-btn" id="btn-draw-undo" title="Undo Stroke">↩ Undo</button>
              <button class="draw-tool-btn" id="btn-draw-clear" title="Clear Canvas">🗑 Clear</button>
            </div>

          </div>

          <!-- Workspace Canvas & Text Editor Containers -->
          <div class="notes-workspace-body mode-${this.viewMode}">
            
            <!-- Textarea Container -->
            <div class="notes-textarea-container ${this.viewMode === 'draw' ? 'hidden' : ''}">
              <textarea
                id="notes-main-textarea"
                class="notes-main-textarea"
                style="font-size: ${this.fontSize}px;"
                placeholder="Write your study notes, drafts, or German/English sentences here... Tap [✨ AI Check] anytime!"
              >${activeNote.content || ''}</textarea>

              <!-- Floating selection toolbar for quick actions -->
              <div class="notes-selection-toolbar" id="notes-selection-toolbar" style="display: none;">
                <button class="sel-action-btn" id="btn-sel-check">✨ Check</button>
                <button class="sel-action-btn" id="btn-sel-explain">💡 Explain</button>
                <button class="sel-action-btn" id="btn-sel-pip">[P] PiP</button>
              </div>
            </div>

            <!-- Handwriting Canvas Container (S-Pen & PointerEvents with touch-action: none) -->
            <div class="notes-canvas-container ${this.viewMode === 'text' ? 'hidden' : ''}">
              <canvas id="notes-drawing-canvas" class="notes-drawing-canvas"></canvas>
            </div>

          </div>

          <!-- AI Grammar Assistant Result Panel -->
          ${this.isAiLoading ? `
            <div class="arl-card ai-result-card loading-state">
              <div class="spinner-inline"></div> Analyzing grammar and syntactic structures with AI...
            </div>
          ` : (this.aiDiff || this.aiExplanation ? `
            <div class="arl-card ai-result-card">
              <div class="ai-card-header">
                <span class="ai-card-badge">✨ AI GRAMMAR & STUDY CHECK</span>
                <button class="ai-card-close" id="btn-close-ai-panel">✕</button>
              </div>

              ${this.aiDiff ? `
                <div class="ai-diff-section">
                  <div class="ai-verdict-row">
                    <span class="verdict-tag ${this.aiDiff.verdict === 'Perfect!' ? 'verdict-perfect' : 'verdict-warning'}">
                      ${this.aiDiff.verdict || 'Analysis Complete'}
                    </span>
                    ${this.aiDiff.expBonus ? `<span class="exp-bonus-tag">+${this.aiDiff.expBonus} EXP</span>` : ''}
                  </div>

                  <div class="ai-diff-body">
                    ${this.aiDiff.diffHtml || `<div class="diff-fallback">${this.aiDiff.correctedSentence || ''}</div>`}
                  </div>

                  ${this.aiDiff.why ? `
                    <div class="ai-explanation-box">
                      <strong>🇲🇳 Тайлбар:</strong> ${this.aiDiff.why}
                    </div>
                  ` : ''}

                  ${this.aiDiff.correctedSentence ? `
                    <div class="ai-actions-footer">
                      <button class="btn-primary-action touch-target apply-correction-btn" id="btn-apply-correction">
                        ✓ Apply Correction to Note
                      </button>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              ${this.aiExplanation ? `
                <div class="ai-explanation-box">
                  <div class="expl-text">${this.aiExplanation}</div>
                </div>
              ` : ''}

            </div>
          ` : '')}

        </main>
      </div>
    `;

    this.bindEvents();
    if (this.viewMode !== 'text') {
      this.initCanvas(activeNote);
    }
  }

  bindEvents() {
    const activeNote = this.getActiveNote();

    // Folder selection
    this.container.querySelectorAll('.folder-chip-btn[data-folder]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.activeFolder = btn.getAttribute('data-folder');
        this.render();
      });
    });

    this.container.querySelector('#btn-add-folder')?.addEventListener('click', () => {
      sound.playClick();
      this.createFolder();
    });

    // Note selection
    this.container.querySelectorAll('.note-list-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.note-delete-btn')) return;
        sound.playClick();
        this.activeNoteId = item.getAttribute('data-id');
        this.aiDiff = null;
        this.aiExplanation = null;
        this.render();
      });
    });

    // Create note
    this.container.querySelector('#btn-create-note')?.addEventListener('click', () => {
      sound.playClick();
      this.createNote();
    });

    // Delete note
    this.container.querySelectorAll('.note-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-id');
        if (confirm('Delete this note permanently?')) {
          sound.playClick();
          this.deleteNote(id);
        }
      });
    });

    // Note title input
    const titleInput = this.container.querySelector('#note-title-input');
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        const val = e.target.value;
        activeNote.title = val;
        activeNote.updatedAt = Date.now();
        this.scheduleAutoSave();

        // Update title in sidebar immediately
        const sidebarTitle = this.container.querySelector(`.note-list-item[data-id="${activeNote.id}"] .note-item-title`);
        if (sidebarTitle) sidebarTitle.textContent = val || 'Untitled Note';
      });
    }

    // Folder dropdown
    const folderSelect = this.container.querySelector('#note-folder-select');
    if (folderSelect) {
      folderSelect.addEventListener('change', (e) => {
        activeNote.folder = e.target.value;
        activeNote.updatedAt = Date.now();
        this.scheduleAutoSave();
        this.render();
      });
    }

    // Font size controls
    this.container.querySelector('#btn-font-dec')?.addEventListener('click', () => {
      sound.playClick();
      this.setFontSize(-1);
    });
    this.container.querySelector('#btn-font-inc')?.addEventListener('click', () => {
      sound.playClick();
      this.setFontSize(1);
    });

    // Special characters
    const textarea = this.container.querySelector('#notes-main-textarea');
    this.container.querySelectorAll('.toolbar-char-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const char = btn.getAttribute('data-char');
        if (textarea) {
          const start = textarea.selectionStart ?? textarea.value.length;
          const end = textarea.selectionEnd ?? textarea.value.length;
          const val = textarea.value;
          textarea.value = val.slice(0, start) + char + val.slice(end);
          textarea.selectionStart = textarea.selectionEnd = start + char.length;
          activeNote.content = textarea.value;
          this.scheduleAutoSave();
          textarea.focus();
        }
      });
    });

    // Mode toggles
    this.container.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.setViewMode(btn.getAttribute('data-mode'));
      });
    });

    // Textarea input
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        activeNote.content = e.target.value;
        activeNote.updatedAt = Date.now();
        this.scheduleAutoSave();
        const snippet = this.container.querySelector(`.note-list-item[data-id="${activeNote.id}"] .note-item-snippet`);
        if (snippet) snippet.textContent = e.target.value.slice(0, 40).replace(/\n/g, ' ') || 'Empty note';
      });

      const handleSelection = () => {
        const sel = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
        this.selectedText = sel;
        const toolbar = this.container.querySelector('#notes-selection-toolbar');
        if (toolbar) {
          toolbar.style.display = sel.length > 2 ? 'flex' : 'none';
        }
      };

      textarea.addEventListener('mouseup', handleSelection);
      textarea.addEventListener('keyup', handleSelection);
    }

    // AI Check trigger (button in toolbar & selection toolbar)
    const triggerAi = async () => {
      sound.playClick();
      const targetText = this.selectedText || (textarea ? textarea.value.trim() : '');
      if (!targetText) {
        alert('Please write or highlight a sentence to check.');
        return;
      }

      this.isAiLoading = true;
      this.aiDiff = null;
      this.aiExplanation = null;
      this.render();

      try {
        const feedback = await GeminiClient.evaluateSentence(targetText, '', state.targetLang);
        this.aiDiff = feedback;
      } catch (err) {
        console.warn('AI evaluation error:', err);
        this.aiExplanation = 'AI Check temporarily offline. Please verify network or API key.';
      } finally {
        this.isAiLoading = false;
        this.render();
      }
    };

    this.container.querySelector('#btn-toolbar-ai-check')?.addEventListener('click', triggerAi);
    this.container.querySelector('#btn-sel-check')?.addEventListener('click', triggerAi);

    // Explain selection
    this.container.querySelector('#btn-sel-explain')?.addEventListener('click', async () => {
      if (!this.selectedText) return;
      this.isAiLoading = true;
      this.aiDiff = null;
      this.aiExplanation = null;
      this.render();

      try {
        const exp = await GeminiClient.explainGrammarConcept(this.selectedText, state.targetLang);
        this.aiExplanation = exp;
      } catch (err) {
        this.aiExplanation = `Grammar reference for: "${this.selectedText}"`;
      } finally {
        this.isAiLoading = false;
        this.render();
      }
    });

    // PiP trigger
    this.container.querySelector('#btn-sel-pip')?.addEventListener('click', () => {
      grammarPip.toggle();
    });

    // Close AI result panel
    this.container.querySelector('#btn-close-ai-panel')?.addEventListener('click', () => {
      this.aiDiff = null;
      this.aiExplanation = null;
      this.render();
    });

    // Apply AI Correction to note
    this.container.querySelector('#btn-apply-correction')?.addEventListener('click', () => {
      sound.playSuccess();
      if (this.aiDiff && this.aiDiff.correctedSentence && textarea) {
        if (this.selectedText && textarea.selectionStart !== textarea.selectionEnd) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          textarea.value = textarea.value.slice(0, start) + this.aiDiff.correctedSentence + textarea.value.slice(end);
        } else {
          textarea.value = this.aiDiff.correctedSentence;
        }
        activeNote.content = textarea.value;
        this.scheduleAutoSave();
        this.aiDiff = null;
        this.render();
      }
    });

    // Export note
    this.container.querySelector('#btn-export-note')?.addEventListener('click', () => {
      sound.playClick();
      const current = this.getActiveNote();
      if (!current) return;
      const blob = new Blob([JSON.stringify([current], null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arl_note_${(current.title || 'study_note').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Import note
    const importInput = this.container.querySelector('#input-import-note');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
          try {
            const raw = re.target.result;
            let imported;
            try {
              imported = JSON.parse(raw);
            } catch {
              imported = [{ title: file.name.replace(/\.[^.]+$/, ''), content: raw }];
            }
            if (Array.isArray(imported)) {
              imported.forEach(n => {
                this.notes.unshift({
                  id: 'note_' + Date.now() + Math.random(),
                  title: n.title || 'Imported Note',
                  folder: n.folder || 'Grammar',
                  content: n.content || '',
                  drawingData: n.drawingData || null,
                  updatedAt: Date.now()
                });
              });
              this.activeNoteId = this.notes[0].id;
              this.saveNotes();
              this.render();
            }
          } catch (err) {
            console.error('Import error:', err);
          }
        };
        reader.readAsText(file);
      });
    }

    // Drawing sub-bar events
    this.container.querySelectorAll('.color-dot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.penColor = btn.getAttribute('data-color');
        this.isEraser = false;
        this.container.querySelectorAll('.color-dot-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.container.querySelector('#btn-draw-eraser')?.classList.remove('active');
      });
    });

    this.container.querySelectorAll('.width-dot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.penWidth = parseInt(btn.getAttribute('data-width'), 10);
        this.container.querySelectorAll('.width-dot-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    this.container.querySelector('#btn-draw-eraser')?.addEventListener('click', () => {
      sound.playClick();
      this.isEraser = !this.isEraser;
      this.container.querySelector('#btn-draw-eraser')?.classList.toggle('active', this.isEraser);
    });

    this.container.querySelector('#btn-draw-undo')?.addEventListener('click', () => {
      sound.playClick();
      this.undoCanvasStroke(activeNote);
    });

    this.container.querySelector('#btn-draw-clear')?.addEventListener('click', () => {
      if (confirm('Clear the entire drawing canvas?')) {
        sound.playClick();
        this.clearCanvas(activeNote);
      }
    });
  }

  /* -------------------------------------------------------------
   * S-Pen / Touch / Mouse High-DPI Canvas Engine
   * ------------------------------------------------------------- */
  initCanvas(activeNote) {
    const canvas = this.container.querySelector('#notes-drawing-canvas');
    if (!canvas) return;
    this.canvasEl = canvas;

    const parent = canvas.parentElement;
    const rect = (parent && typeof parent.getBoundingClientRect === 'function') ? parent.getBoundingClientRect() : { width: 600, height: 500 };
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const width = rect.width || 600;
    const height = Math.max(450, rect.height || 500);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = (typeof canvas.getContext === 'function') ? canvas.getContext('2d') : null;
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.ctx = ctx;

    // Restore saved drawing data
    if (activeNote.drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        this.pushCanvasSnapshot();
      };
      img.src = activeNote.drawingData;
    } else {
      this.pushCanvasSnapshot();
    }

    // PointerEvents with strict touch-action: none
    let lastX = 0;
    let lastY = 0;

    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: e.clientX - r.left,
        y: e.clientY - r.top
      };
    };

    canvas.onpointerdown = (e) => {
      if (e.preventDefault) e.preventDefault();
      if (typeof canvas.setPointerCapture === 'function') {
        try { canvas.setPointerCapture(e.pointerId); } catch {}
      }
      this.isDrawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
    };

    canvas.onpointermove = (e) => {
      if (!this.isDrawing) return;
      if (e.preventDefault) e.preventDefault();
      const pos = getPos(e);

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);

      if (this.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = this.penWidth * 4;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = this.penColor;
        ctx.lineWidth = this.penWidth;
      }

      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
    };

    const stopDrawing = (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      ctx.globalCompositeOperation = 'source-over';
      if (typeof canvas.releasePointerCapture === 'function') {
        try { canvas.releasePointerCapture(e.pointerId); } catch {}
      }

      // Save drawing snapshot to note and undo stack
      this.pushCanvasSnapshot();
      if (typeof canvas.toDataURL === 'function') {
        activeNote.drawingData = canvas.toDataURL('image/png');
      }
      activeNote.updatedAt = Date.now();
      this.scheduleAutoSave();
    };

    canvas.onpointerup = stopDrawing;
    canvas.onpointercancel = stopDrawing;
  }

  pushCanvasSnapshot() {
    if (!this.canvasEl || typeof this.canvasEl.toDataURL !== 'function') return;
    try {
      const snap = this.canvasEl.toDataURL('image/png');
      this.strokesHistory.push(snap);
      if (this.strokesHistory.length > 20) {
        this.strokesHistory.shift();
      }
    } catch {}
  }

  undoCanvasStroke(activeNote) {
    if (!this.canvasEl || !this.ctx || this.strokesHistory.length <= 1) return;
    this.strokesHistory.pop(); // discard current state
    const prev = this.strokesHistory[this.strokesHistory.length - 1];

    const rect = this.canvasEl.getBoundingClientRect();
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);

    if (prev) {
      const img = new Image();
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0, rect.width, rect.height);
        activeNote.drawingData = prev;
        activeNote.updatedAt = Date.now();
        this.scheduleAutoSave();
      };
      img.src = prev;
    } else {
      activeNote.drawingData = null;
      activeNote.updatedAt = Date.now();
      this.scheduleAutoSave();
    }
  }

  clearCanvas(activeNote) {
    if (!this.canvasEl || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    activeNote.drawingData = null;
    activeNote.updatedAt = Date.now();
    this.strokesHistory = [];
    this.pushCanvasSnapshot();
    this.scheduleAutoSave();
  }
}
