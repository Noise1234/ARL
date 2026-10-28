/**
 * ARL - Keyboard Shortcuts Cheat Sheet Modal
 * Comprehensive overview of all tactile keyboard shortcuts and gestural actions.
 */

export class HelpModalView {
  constructor(overlayEl, onCloseCallback) {
    this.overlay = overlayEl;
    this.onClose = onCloseCallback;
  }

  show() {
    this.render();
  }

  close() {
    this.overlay.innerHTML = '';
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }

  render() {
    this.overlay.innerHTML = `
      <div class="settings-modal-backdrop" id="help-backdrop">
        <div class="settings-hud-card help-modal-card" role="dialog" aria-modal="true" aria-label="Keyboard Shortcuts">
          
          <div class="settings-hud-header">
            <div class="help-title-group">
              <span class="settings-hud-title">⌨ Keyboard Navigation Reference</span>
              <span class="help-subtitle">Hardware-first tactile ergonomics</span>
            </div>
            <button class="settings-close-btn touch-target" id="btn-help-close" title="Close [Esc]">
              <span class="micro-bracket">[Esc]</span> ✕
            </button>
          </div>

          <div class="help-grid-sections">
            
            <!-- Global Navigation -->
            <div class="help-section">
              <h4 class="help-section-title">Navigation</h4>
              <div class="shortcut-list">
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>V</kbd></span>
                  <span class="shortcut-desc">Vocab (Flashcards Mode)</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>Q</kbd></span>
                  <span class="shortcut-desc">Quiz (Active Recall MCQ)</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>L</kbd></span>
                  <span class="shortcut-desc">Lexicon (Full Word Library)</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>G</kbd></span>
                  <span class="shortcut-desc">Grammar & Interactive Sandbox</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>M</kbd></span>
                  <span class="shortcut-desc">Memorize & Imprint Studio</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>I</kbd></span>
                  <span class="shortcut-desc">Immersion Media Hub</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>S</kbd></span>
                  <span class="shortcut-desc">Settings & API Key</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>?</kbd></span>
                  <span class="shortcut-desc">Toggle this cheat sheet</span>
                </div>
              </div>
            </div>

            <!-- Flashcard Mode -->
            <div class="help-section">
              <h4 class="help-section-title">Flashcard Study Mode</h4>
              <div class="shortcut-list">
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>Space</kbd> / <kbd>Enter</kbd></span>
                  <span class="shortcut-desc">Reveal answer / Next card</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>1</kbd></span>
                  <span class="shortcut-desc">Again (↻ Re-queue)</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>2</kbd></span>
                  <span class="shortcut-desc">Hard (Shorter interval)</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>3</kbd></span>
                  <span class="shortcut-desc">Good (Standard SM-2)</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>4</kbd></span>
                  <span class="shortcut-desc">Easy (Bonus interval)</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>H</kbd></span>
                  <span class="shortcut-desc">3-Stage Progressive Hint</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>A</kbd></span>
                  <span class="shortcut-desc">Pronounce Audio</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>R</kbd></span>
                  <span class="shortcut-desc">Review Memorized Queue</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>Shift</kbd>+<kbd>R</kbd></span>
                  <span class="shortcut-desc">Reset card SRS interval</span>
                </div>
              </div>
            </div>

            <!-- Memorize & Speed Imprint Studio -->
            <div class="help-section">
              <h4 class="help-section-title">Memorize & Imprint Studio</h4>
              <div class="shortcut-list">
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>S</kbd></span>
                  <span class="shortcut-desc">Launch Speed Imprint Sprint</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>Space</kbd></span>
                  <span class="shortcut-desc">Pause / Resume Sprint / Flip Tile</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>Enter</kbd></span>
                  <span class="shortcut-desc">Mark Memorized (+15 EXP)</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>→</kbd> / <kbd>←</kbd></span>
                  <span class="shortcut-desc">Next / Previous Sprint Card</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>Esc</kbd></span>
                  <span class="shortcut-desc">Exit Sprint to Matrix</span>
                </div>
              </div>
            </div>

            <!-- Quiz & Grammar -->
            <div class="help-section">
              <h4 class="help-section-title">Quiz & Grammar Mode</h4>
              <div class="shortcut-list">
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd></span>
                  <span class="shortcut-desc">Select Quiz Option 1–4</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>1</kbd>–<kbd>4</kbd></span>
                  <span class="shortcut-desc">Grammar Folders A1–B2</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>/</kbd></span>
                  <span class="shortcut-desc">Search Grammar Topics</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>J</kbd> / <kbd>K</kbd></span>
                  <span class="shortcut-desc">Next / Previous topic</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>D</kbd></span>
                  <span class="shortcut-desc">Drill topic flashcards</span>
                </div>
                <div class="shortcut-row">
                  <span class="shortcut-key"><kbd>N</kbd></span>
                  <span class="shortcut-desc">Add Custom Word</span>
                </div>
              </div>
            </div>

          </div>

          <div class="help-footer-row">
            <button class="keyhint-btn keyhint-primary touch-target" id="btn-help-dismiss">Got It</button>
          </div>

        </div>
      </div>
    `;

    this.overlay.querySelector('#btn-help-close')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('#btn-help-dismiss')?.addEventListener('click', () => this.close());
    this.overlay.querySelector('#help-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'help-backdrop') this.close();
    });
  }
}
