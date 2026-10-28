/**
 * ARL - Keyboard Router & Finite State Machine (FSM)
 * Manages global physical keyboard events strictly according to active state.
 * Prevents ghost actions on 1-4 and suppresses shortcuts when input fields are focused.
 */

export const KeyboardState = {
  STUDY_UNREVEALED: 'STUDY_UNREVEALED',
  STUDY_REVEALED: 'STUDY_REVEALED',
  SETTINGS_OVERLAY: 'SETTINGS_OVERLAY',
  GRAMMAR_LIST: 'GRAMMAR_LIST',
  GRAMMAR_TOPIC: 'GRAMMAR_TOPIC',
  MEDIA_HUB: 'MEDIA_HUB',
  INPUT_FOCUSED: 'INPUT_FOCUSED'
};

class KeyboardRouter {
  constructor() {
    this.currentState = KeyboardState.STUDY_UNREVEALED;
    this.previousState = KeyboardState.STUDY_UNREVEALED;
    this.handlers = new Map();
    this.boundKeyHandler = this.onKeyDown.bind(this);
    this.isListening = false;
  }

  init() {
    if (this.isListening) return;
    window.addEventListener('keydown', this.boundKeyHandler);
    this.isListening = true;
  }

  destroy() {
    if (!this.isListening) return;
    window.removeEventListener('keydown', this.boundKeyHandler);
    this.isListening = false;
  }

  setState(newState) {
    if (Object.values(KeyboardState).includes(newState)) {
      if (this.currentState !== KeyboardState.INPUT_FOCUSED) {
        this.previousState = this.currentState;
      }
      this.currentState = newState;
    }
  }

  getState() {
    return this.currentState;
  }

  /**
   * Registers a callback for an action.
   * @param {string} action
   * @param {Function} callback
   */
  on(action, callback) {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, new Set());
    }
    this.handlers.get(action).add(callback);
    return () => this.off(action, callback);
  }

  off(action, callback) {
    const set = this.handlers.get(action);
    if (set) {
      set.delete(callback);
    }
  }

  trigger(action, payload) {
    const set = this.handlers.get(action);
    if (set) {
      for (const cb of set) {
        try {
          cb(payload);
        } catch (err) {
          console.error(`Error in keyboard handler for ${action}:`, err);
        }
      }
    }
  }

  flashKeyVisual(key, code) {
    if (typeof document === 'undefined') return;
    const keyLower = (key || '').toLowerCase();
    const selector = [
      `[data-key="${keyLower}"]`,
      `[data-key="${code}"]`,
      keyLower === ' ' ? '#btn-reveal' : null,
      keyLower === 'h' ? '#btn-hint' : null,
      keyLower === '1' ? '#btn-grade-1' : null,
      keyLower === '2' ? '#btn-grade-2' : null,
      keyLower === '3' ? '#btn-grade-3' : null,
      keyLower === '4' ? '#btn-grade-4' : null,
      keyLower === 'a' ? '#btn-audio' : null,
      keyLower === 'v' ? '#nav-btn-vocab' : null,
      keyLower === 'q' ? '#nav-btn-quiz' : null,
      keyLower === 'l' ? '#nav-btn-lexicon' : null,
      keyLower === 'g' ? '#nav-btn-grammar' : null,
      keyLower === 'm' ? '#nav-btn-memorize' : null,
      keyLower === 'i' ? '#nav-btn-media' : null,
      keyLower === 's' ? '#nav-btn-settings' : null,
      keyLower === '?' ? '#nav-btn-help' : null,
      keyLower === 'n' ? '#btn-lexicon-add-word' : null,
      keyLower === 'd' ? '#btn-drill-topic' : null
    ].filter(Boolean).join(', ');

    if (!selector) return;
    try {
      const el = document.querySelector(selector);
      if (el) {
        el.classList.add('key-pressed-active');
        setTimeout(() => el.classList.remove('key-pressed-active'), 120);
      }
    } catch (e) {
      // ignore
    }
  }

  onKeyDown(e) {
    // 1. Check if user is typing in an active text input or textarea
    const activeEl = document.activeElement;
    const isInput = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable
    );

    if (isInput) {
      if (e.key === 'Escape') {
        activeEl.blur();
        this.trigger('input_blur');
      }
      // Strictly suppress all single-key navigation & study shortcuts while typing
      return;
    }

    const key = e.key;
    const code = e.code;
    const state = this.currentState;

    // Trigger visual tactile feedback on physical key press
    this.flashKeyVisual(key, code);

    // 2. Global View Navigation (V, G, M, S) available across all non-input views
    if (state !== KeyboardState.SETTINGS_OVERLAY) {
      if (key === 'v' || key === 'V') {
        e.preventDefault();
        this.trigger('nav_vocab');
        return;
      }
      if (key === 'q' || key === 'Q') {
        e.preventDefault();
        this.trigger('nav_quiz');
        return;
      }
      if (key === 'l' || key === 'L') {
        e.preventDefault();
        this.trigger('nav_lexicon');
        return;
      }
      if (key === 'g' || key === 'G') {
        e.preventDefault();
        this.trigger('nav_grammar');
        return;
      }
      if (key === 'm' || key === 'M') {
        e.preventDefault();
        this.trigger('nav_memorize');
        return;
      }
      if (key === 'i' || key === 'I') {
        e.preventDefault();
        this.trigger('nav_media');
        return;
      }
      if (key === 's' || key === 'S') {
        e.preventDefault();
        this.trigger('toggle_settings');
        return;
      }
      if (key === '?') {
        e.preventDefault();
        this.trigger('toggle_help');
        return;
      }
      if (key === 'n' || key === 'N') {
        e.preventDefault();
        this.trigger('add_word');
        return;
      }
    }

    // 3. State-Specific Key Routing
    switch (state) {
      case KeyboardState.STUDY_UNREVEALED:
        if (code === 'Space' || code === 'Enter') {
          e.preventDefault();
          this.trigger('study_reveal');
        } else if (key === 'h' || key === 'H') {
          e.preventDefault();
          this.trigger('study_hint');
        } else if ((key === 'r' || key === 'R') && !e.shiftKey) {
          e.preventDefault();
          this.trigger('study_toggle_memorized');
        } else if ((key === 'R' || key === 'r') && e.shiftKey) {
          e.preventDefault();
          this.trigger('study_reset_card');
        }
        break;

      case KeyboardState.STUDY_REVEALED:
        if (key === '1') {
          e.preventDefault();
          this.trigger('study_grade', 1);
        } else if (key === '2') {
          e.preventDefault();
          this.trigger('study_grade', 2);
        } else if (key === '3') {
          e.preventDefault();
          this.trigger('study_grade', 3);
        } else if (key === '4') {
          e.preventDefault();
          this.trigger('study_grade', 4);
        } else if (key === 'a' || key === 'A') {
          e.preventDefault();
          this.trigger('study_audio');
        } else if ((key === 'r' || key === 'R') && !e.shiftKey) {
          e.preventDefault();
          this.trigger('study_toggle_memorized');
        } else if ((key === 'R' || key === 'r') && e.shiftKey) {
          e.preventDefault();
          this.trigger('study_reset_card');
        }
        break;

      case KeyboardState.SETTINGS_OVERLAY:
        if (key === 'Escape' || key === 's' || key === 'S') {
          e.preventDefault();
          this.trigger('close_settings');
        } else if (key === 'l' || key === 'L') {
          e.preventDefault();
          this.trigger('settings_toggle_lang');
        } else if (key === 'i' || key === 'I') {
          e.preventDefault();
          this.trigger('settings_cycle_i18n');
        } else if (['1', '2', '3', '4'].includes(key)) {
          e.preventDefault();
          this.trigger('settings_set_level', parseInt(key, 10));
        } else if (key === 'e' || key === 'E') {
          e.preventDefault();
          this.trigger('settings_export');
        }
        break;

      case KeyboardState.GRAMMAR_LIST:
        if (['1', '2', '3', '4'].includes(key)) {
          e.preventDefault();
          this.trigger('grammar_set_folder', parseInt(key, 10));
        } else if ((key === 'r' || key === 'R') && !e.shiftKey) {
          e.preventDefault();
          this.trigger('grammar_toggle_redemittel');
        } else if (key === 'ArrowDown' || key === 'j' || key === 'J') {
          e.preventDefault();
          this.trigger('grammar_next_topic');
        } else if (key === 'ArrowUp' || key === 'k' || key === 'K') {
          e.preventDefault();
          this.trigger('grammar_prev_topic');
        } else if (code === 'Enter') {
          e.preventDefault();
          this.trigger('grammar_open_topic');
        } else if (key === '/') {
          e.preventDefault();
          this.trigger('grammar_focus_search');
        }
        break;

      case KeyboardState.GRAMMAR_TOPIC:
        if (key === 'Escape' || key === 'Backspace') {
          e.preventDefault();
          this.trigger('grammar_back_to_list');
        } else if (key === 'd' || key === 'D') {
          e.preventDefault();
          this.trigger('grammar_drill_topic');
        }
        break;

      case KeyboardState.MEDIA_HUB:
        if (['1', '2', '3', '4'].includes(key)) {
          e.preventDefault();
          this.trigger('media_filter_level', parseInt(key, 10));
        } else if (key === 'a' || key === 'A') {
          e.preventDefault();
          this.trigger('media_filter_type', 'all');
        } else if (key === 'b' || key === 'B') {
          e.preventDefault();
          this.trigger('media_filter_type', 'book');
        } else if (key === 'p' || key === 'P') {
          e.preventDefault();
          this.trigger('media_filter_type', 'podcast');
        } else if (key === 'w' || key === 'W') {
          e.preventDefault();
          this.trigger('media_filter_type', 'show');
        }
        break;
    }
  }
}

export const keyboard = new KeyboardRouter();
