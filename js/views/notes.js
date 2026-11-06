/**
 * ARL - Samsung Notes-Style Smart Notes Workspace ([N])
 * Full-featured note-taking workspace with:
 * - Instant inline title editing via direct <input type="text" class="note-title-input">
 * - Zero-lag textarea editor with Text Size Adjuster (14px–22px)
 * - Dynamic Samsung-style Folder system (All Notes, Grammar, Vocab, B1 Speaking, Custom Folders)
 * - High-DPI Handwriting & S-Pen Canvas (PointerEvents, touch-action: none, undo, clear)
 * - In-Note AI Writing & Grammar Assistant with color-coded diff & 1-tap correction
 */

import { state } from '../state.js';
import { sound } from '../sound.js';
import { GeminiClient } from '../gemini.js';
import { gistSync } from '../sync.js';

const STORAGE_KEY = 'arl_smart_notes';
const STORAGE_FOLDERS_KEY = 'arl_notes_folders';
const STORAGE_FONT_KEY = 'arl_notes_fontsize';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
    this.fontSize = 16; // Clamped strictly 14px - 22px

    // Drawing state
    this.penColor = '#ffffff';
    this.penWidth = 3;
    this.isEraser = false;
    this.isDrawing = false;
    this.strokesHistory = [];
    this.canvasEl = null;
    this.ctx = null;

    this.loadNotes();
  }

  loadNotes() {
    try {
      if (typeof localStorage !== 'undefined') {
        const rawFolders = localStorage.getItem(STORAGE_FOLDERS_KEY);
        if (rawFolders) {
          const parsed = JSON.parse(rawFolders);
          if (Array.isArray(parsed) && parsed.length > 0) this.folders = parsed;
        }
        const rawNotes = localStorage.getItem(STORAGE_KEY);
        if (rawNotes) {
          const parsed = JSON.parse(rawNotes);
          if (Array.isArray(parsed) && parsed.length > 0) this.notes = parsed;
        }
        const savedFont = parseInt(localStorage.getItem(STORAGE_FONT_KEY), 10);
        if (savedFont && savedFont >= 14 && savedFont <= 22) {
          this.fontSize = savedFont;
        }
      }
    } catch (e) {
      console.warn('Failed to load notes from localStorage:', e);
    }

    if (!Array.isArray(this.folders) || this.folders.length === 0) {
      this.folders = ['All Notes', 'Grammar', 'Vocab', 'B1 Speaking'];
    }

    if (!Array.isArray(this.notes) || this.notes.length === 0) {
      const initialNote = {
        id: 'note_' + Date.now(),
        title: '🇩🇪 German Grammar & Drafting Notes',
        folder: 'Grammar',
        content: `### My German Study Notes\n\n1. Hauptsatz (V2 Rule):\nHeute lerne ich fleißig Deutsch.\n\n2. Subordinate Clause (Verb-End):\nIch bleibe zu Hause, weil es heute stark regnet.\n\n3. Dativ & Akkusativ sentences:\nIch schenke meinem Bruder ein neues Buch.\n\nHighlight any sentence or tap [✨ AI Assist] to test instant grammar feedback!`,
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
        setTimeout(() => statusEl.classList.remove('saved-flash'), 1800);
      }
    }, 300);
  }

  setFontSize(delta) {
    this.fontSize = Math.max(14, Math.min(22, this.fontSize + delta));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_FONT_KEY, String(this.fontSize));
    }
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
            <button class="notes-new-btn btn touch-target" id="btn-create-note" title="Create a new note">
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
                <div class="note-item-title">${escapeHtml(note.title) || 'Untitled Note'}</div>
                <div class="note-item-snippet">${escapeHtml((note.content || '').slice(0, 45).replace(/\n/g, ' ')) || (note.drawingData ? '[✏️ Drawing]' : 'Empty note')}</div>
                <div class="note-item-meta">
                  <span class="note-folder-tag">${escapeHtml(note.folder || 'All')}</span>
                  <button class="note-delete-btn" data-delete-id="${note.id}" title="Delete note">✕</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer utility -->
          <div class="notes-sidebar-footer">
            <button class="notes-import-export-btn btn touch-target" id="btn-export-note">⬇ Export</button>
            <label class="notes-import-export-btn btn touch-target" id="label-import-note">
              ⬆ Import
              <input type="file" id="input-import-note" accept=".json,.txt,.md" style="display:none;" />
            </label>
          </div>
        </aside>

        <!-- Main Editor Panel -->
        <main class="notes-editor-panel">
          
          <!-- Top Title Bar with Instant Inline Title Input -->
          <div class="notes-title-header-row">
            <div class="notes-title-input-wrap">
              <input
                type="text"
                id="note-title-input"
                class="note-title-input"
                placeholder="Note Title..."
                value="${escapeHtml(activeNote.title || '')}"
                autocomplete="off"
                spellcheck="false"
              />
            </div>

            <div class="notes-header-actions">
              <select class="note-folder-select" id="note-folder-select" title="Move note to folder">
                ${this.folders.filter(f => f !== 'All Notes').map(f => `
                  <option value="${f}" ${activeNote.folder === f ? 'selected' : ''}>📁 ${f}</option>
                `).join('')}
              </select>
              <span id="notes-save-status" class="notes-save-status">Saved</span>
            </div>
          </div>

          <!-- Unified Sleek Toolbar -->
          <div class="notes-unified-toolbar">
            
            <!-- Font Size Controls (14px - 22px) -->
            <div class="toolbar-group font-size-controls">
              <button class="toolbar-btn btn" id="btn-font-dec" title="Decrease font size">[A-]</button>
              <span class="font-size-label" id="font-size-label">${this.fontSize}px</span>
              <button class="toolbar-btn btn" id="btn-font-inc" title="Increase font size">[A+]</button>
            </div>

            <!-- Quick German Special Characters -->
            <div class="toolbar-group special-chars-group">
              ${['ä', 'ö', 'ü', 'ß', '“', '”', '—'].map(ch => `
                <button type="button" class="char-chip-btn toolbar-char-btn" data-char="${ch}">${ch}</button>
              `).join('')}
            </div>

            <!-- Mode Toggles: Text & Draw -->
            <div class="toolbar-group mode-toggles-group">
              <button class="toolbar-btn mode-btn btn ${this.viewMode === 'text' ? 'active' : ''}" data-mode="text" title="Keyboard Text Mode">
                ⌨️ Text
              </button>
              <button class="toolbar-btn mode-btn btn ${this.viewMode === 'draw' ? 'active' : ''}" data-mode="draw" title="Handwriting & S-Pen Drawing">
                ✏️ Draw
              </button>
              <button class="toolbar-btn mode-btn btn ${this.viewMode === 'split' ? 'active' : ''}" data-mode="split" title="Split Screen Mode">
                Split
              </button>
            </div>

            <!-- AI Grammar Assistant Trigger -->
            <div class="toolbar-group">
              <button class="toolbar-btn ai-trigger-btn btn btn-primary touch-target" id="btn-toolbar-ai-check" title="AI Grammar & Syntax Check">
                ✨ AI Assist
              </button>
            </div>

          </div>

          <!-- Drawing Sub-Bar (shown in Draw & Split modes) -->
          <div class="drawing-sub-bar ${this.viewMode === 'text' ? 'hidden' : ''}" id="drawing-sub-bar">
            
            <div class="drawing-colors">
              ${['#ffffff', '#a1a1aa', '#71717a', '#3b82f6', '#ef4444'].map(color => `
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
                  <span style="width: ${w * 2}px; height: ${w * 2}px; background: currentColor; border-radius: 50%; display:inline-block;"></span>
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
                placeholder="Start typing your study notes here..."
                spellcheck="true"
              >${escapeHtml(activeNote.content || '')}</textarea>

              <!-- Floating Selection Toolbar for Instant AI Feedback -->
              <div class="notes-selection-toolbar" id="notes-selection-toolbar" style="display: none;">
                <button class="sel-tool-btn" id="btn-ai-check-selection">✨ AI Check Selection</button>
                <button class="sel-tool-btn" id="btn-wrap-quotes">“…”</button>
              </div>
            </div>

            <!-- High-DPI S-Pen / Touch Canvas Container -->
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
                    ${this.aiDiff.diffHtml || `<div class="diff-fallback">${escapeHtml(this.aiDiff.correctedSentence || '')}</div>`}
                  </div>

                  ${this.aiDiff.why ? `
                    <div class="ai-explanation-box">
                      <strong>🇲🇳 Тайлбар:</strong> ${escapeHtml(this.aiDiff.why)}
                    </div>
                  ` : ''}

                  ${this.aiDiff.correctedSentence ? `
                    <div class="ai-actions-footer">
                      <button class="btn-primary-action touch-target apply-correction-btn btn btn-primary" id="btn-apply-correction">
                        ✓ Apply Correction to Note
                      </button>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              ${this.aiExplanation ? `
                <div class="ai-explanation-box">
                  <div class="expl-text">${escapeHtml(this.aiExplanation)}</div>
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

    // Instant Inline Title Input with Zero-Lag Auto-Save
    const titleInput = this.container.querySelector('#note-title-input');
    if (titleInput && activeNote) {
      const handleTitleUpdate = (val) => {
        activeNote.title = val;
        activeNote.updatedAt = Date.now();
        const sidebarTitle = this.container.querySelector(`.note-list-item[data-id="${activeNote.id}"] .note-item-title`);
        if (sidebarTitle) sidebarTitle.textContent = val || 'Untitled Note';
        this.scheduleAutoSave();
      };

      titleInput.addEventListener('input', (e) => {
        handleTitleUpdate(e.target.value);
      });
      titleInput.addEventListener('change', (e) => {
        handleTitleUpdate(e.target.value);
        this.saveNotes();
      });
      titleInput.addEventListener('blur', () => {
        this.saveNotes();
      });
    }

    // Folder dropdown
    const folderSelect = this.container.querySelector('#note-folder-select');
    if (folderSelect && activeNote) {
      folderSelect.addEventListener('change', (e) => {
        activeNote.folder = e.target.value;
        activeNote.updatedAt = Date.now();
        this.saveNotes();
        this.render();
      });
    }

    // Font size controls (clamped 14px - 22px)
    this.container.querySelector('#btn-font-dec')?.addEventListener('click', () => {
      sound.playClick();
      this.setFontSize(-1);
    });
    this.container.querySelector('#btn-font-inc')?.addEventListener('click', () => {
      sound.playClick();
      this.setFontSize(1);
    });

    // Quick special characters insert
    const textarea = this.container.querySelector('#notes-main-textarea');
    this.container.querySelectorAll('.toolbar-char-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const char = btn.getAttribute('data-char');
        if (textarea && activeNote) {
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

    // Mode toggles (Text, Draw, Split)
    this.container.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.setViewMode(btn.getAttribute('data-mode'));
      });
    });

    // Zero-lag Textarea input
    if (textarea && activeNote) {
      textarea.addEventListener('input', (e) => {
        activeNote.content = e.target.value;
        activeNote.updatedAt = Date.now();
        this.scheduleAutoSave();
        const snippet = this.container.querySelector(`.note-list-item[data-id="${activeNote.id}"] .note-item-snippet`);
        if (snippet) snippet.textContent = e.target.value.slice(0, 45).replace(/\n/g, ' ') || 'Empty note';
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

    // AI Check trigger
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
    this.container.querySelector('#btn-ai-check-selection')?.addEventListener('click', triggerAi);

    // Apply correction button
    this.container.querySelector('#btn-apply-correction')?.addEventListener('click', () => {
      if (!this.aiDiff || !this.aiDiff.correctedSentence || !textarea || !activeNote) return;
      sound.playClick();
      if (this.selectedText && textarea.value.includes(this.selectedText)) {
        textarea.value = textarea.value.replace(this.selectedText, this.aiDiff.correctedSentence);
      } else {
        textarea.value = this.aiDiff.correctedSentence;
      }
      activeNote.content = textarea.value;
      activeNote.updatedAt = Date.now();
      this.saveNotes();
      this.aiDiff = null;
      this.render();
    });

    this.container.querySelector('#btn-close-ai-panel')?.addEventListener('click', () => {
      this.aiDiff = null;
      this.aiExplanation = null;
      this.render();
    });

    // Wrap quotes helper
    this.container.querySelector('#btn-wrap-quotes')?.addEventListener('click', () => {
      if (!textarea || !this.selectedText) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      textarea.value = val.slice(0, start) + `“${this.selectedText}”` + val.slice(end);
      if (activeNote) {
        activeNote.content = textarea.value;
        this.scheduleAutoSave();
      }
    });

    // Drawing sub-bar tools
    this.container.querySelectorAll('.color-dot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.penColor = btn.getAttribute('data-color');
        this.isEraser = false;
        this.render();
      });
    });

    this.container.querySelectorAll('.width-dot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.penWidth = parseInt(btn.getAttribute('data-width'), 10) || 4;
        this.isEraser = false;
        this.render();
      });
    });

    this.container.querySelector('#btn-draw-eraser')?.addEventListener('click', () => {
      this.isEraser = !this.isEraser;
      this.render();
    });

    this.container.querySelector('#btn-draw-undo')?.addEventListener('click', () => {
      this.undoCanvasStroke();
    });

    this.container.querySelector('#btn-draw-clear')?.addEventListener('click', () => {
      if (confirm('Clear the entire drawing canvas?')) {
        this.clearCanvas();
      }
    });

    // Export note
    this.container.querySelector('#btn-export-note')?.addEventListener('click', () => {
      sound.playClick();
      if (!activeNote) return;
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeNote, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${(activeNote.title || 'note').replace(/[^a-zA-Z0-9_-]/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    // Import note
    const fileInput = this.container.querySelector('#input-import-note');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (parsed && (parsed.content !== undefined || parsed.title !== undefined)) {
              this.createNote(parsed.title || file.name.replace(/\.[^/.]+$/, ''));
              this.updateActiveNote({ content: parsed.content || '', drawingData: parsed.drawingData || null });
              this.render();
            } else {
              this.createNote(file.name.replace(/\.[^/.]+$/, ''));
              this.updateActiveNote({ content: evt.target.result });
              this.render();
            }
          } catch (err) {
            this.createNote(file.name.replace(/\.[^/.]+$/, ''));
            this.updateActiveNote({ content: evt.target.result });
            this.render();
          }
        };
        reader.readAsText(file);
      });
    }
  }

  initCanvas(activeNote) {
    const canvas = this.container.querySelector('#notes-drawing-canvas');
    if (!canvas) return;
    this.canvasEl = canvas;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width || 400;
    const h = rect.height || 400;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.ctx = ctx;

    // Restore saved drawing data
    if (activeNote.drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        this.saveCanvasStateToHistory();
      };
      img.src = activeNote.drawingData;
    } else {
      this.strokesHistory = [];
      this.saveCanvasStateToHistory();
    }

    let isDown = false;
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
      canvas.setPointerCapture(e.pointerId);
      isDown = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.strokeStyle = this.isEraser ? '#09090b' : this.penColor;
      ctx.lineWidth = this.isEraser ? 20 : this.penWidth;
    };

    canvas.onpointermove = (e) => {
      if (!isDown) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
    };

    const stopDrawing = (e) => {
      if (!isDown) return;
      isDown = false;
      ctx.closePath();
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
      this.saveCanvasStateToHistory();
      this.persistDrawingData(activeNote);
    };

    canvas.onpointerup = stopDrawing;
    canvas.onpointercancel = stopDrawing;
  }

  saveCanvasStateToHistory() {
    if (!this.canvasEl) return;
    try {
      const data = this.canvasEl.toDataURL();
      this.strokesHistory.push(data);
      if (this.strokesHistory.length > 20) {
        this.strokesHistory.shift();
      }
    } catch (e) {
      // ignore
    }
  }

  undoCanvasStroke() {
    if (this.strokesHistory.length <= 1 || !this.canvasEl || !this.ctx) return;
    this.strokesHistory.pop(); // remove current state
    const prev = this.strokesHistory[this.strokesHistory.length - 1];
    const img = new Image();
    img.onload = () => {
      const rect = this.canvasEl.getBoundingClientRect();
      this.ctx.clearRect(0, 0, rect.width, rect.height);
      this.ctx.drawImage(img, 0, 0, rect.width, rect.height);
      const active = this.getActiveNote();
      if (active) this.persistDrawingData(active);
    };
    img.src = prev;
  }

  clearCanvas() {
    if (!this.canvasEl || !this.ctx) return;
    const rect = this.canvasEl.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    this.strokesHistory = [];
    this.saveCanvasStateToHistory();
    const active = this.getActiveNote();
    if (active) {
      active.drawingData = null;
      this.saveNotes();
    }
  }

  persistDrawingData(activeNote) {
    if (!this.canvasEl) return;
    try {
      activeNote.drawingData = this.canvasEl.toDataURL('image/png');
      activeNote.updatedAt = Date.now();
      this.scheduleAutoSave();
    } catch (e) {
      // ignore
    }
  }
}
