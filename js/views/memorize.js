/**
 * ARL - Memory & Imprint Studio (MemorizeView)
 * Dedicated view for rapid initial encoding, visual memory matrix, and speed imprint sprints.
 * Provides live retention analytics, card flip inspections, 1-click memorization, and audio feedback.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { sound } from '../sound.js';
import { isCardMemorized } from '../srs.js';

export class MemorizeView {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;

    this.activeFilter = 'all'; // 'all' | 'unseen' | 'learning' | 'memorized'
    this.posFilter = 'all'; // 'all' | 'noun' | 'verb' | 'adj' | 'other'
    this.searchQuery = '';
    this.flippedCards = new Set();

    // Sprint Mode state
    this.isSprintMode = false;
    this.sprintCards = [];
    this.sprintIndex = 0;
    this.sprintTimer = null;
    this.sprintPaused = false;
    this.sprintDuration = 3500; // 3.5s per card in auto-sprint
    this.sprintStartTime = 0;
  }

  getFilteredCards() {
    let list = state.cards || [];

    // Filter by recall status
    if (this.activeFilter === 'memorized') {
      list = list.filter(c => isCardMemorized(c));
    } else if (this.activeFilter === 'learning') {
      list = list.filter(c => (c.reps || 0) > 0 && !isCardMemorized(c));
    } else if (this.activeFilter === 'unseen') {
      list = list.filter(c => !c.reps || c.reps === 0);
    }

    // Filter by POS
    if (this.posFilter === 'noun') {
      list = list.filter(c => c.pos === 'noun');
    } else if (this.posFilter === 'verb') {
      list = list.filter(c => c.pos === 'verb');
    } else if (this.posFilter === 'adj') {
      list = list.filter(c => c.pos === 'adj' || c.pos === 'adjective');
    } else if (this.posFilter === 'other') {
      list = list.filter(c => !['noun', 'verb', 'adj', 'adjective'].includes(c.pos));
    }

    // Search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(c => 
        (c.word && c.word.toLowerCase().includes(q)) ||
        (c.mn && c.mn.toLowerCase().includes(q)) ||
        (c.de && c.de.toLowerCase().includes(q)) ||
        (c.en && c.en.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getMemoryStats() {
    const all = state.cards || [];
    let memorized = 0;
    let learning = 0;
    let unseen = 0;

    for (const c of all) {
      if (isCardMemorized(c)) {
        memorized++;
      } else if ((c.reps || 0) > 0) {
        learning++;
      } else {
        unseen++;
      }
    }

    const total = all.length;
    const rate = total > 0 ? Math.round((memorized / total) * 100) : 0;
    return { total, memorized, learning, unseen, rate };
  }

  render() {
    this.container.classList?.remove('study-active');
    if (this.isSprintMode) {
      this.renderSprint();
    } else {
      this.renderMatrix();
    }
  }

  renderMatrix() {
    const stats = this.getMemoryStats();
    const cards = this.getFilteredCards();
    const tag = `[${state.targetLang.toUpperCase()}·${state.cefrLevel.toUpperCase()}]`;

    this.container.innerHTML = `
      <div class="memorize-container">
        <!-- Top Studio Dashboard -->
        <header class="memorize-dashboard">
          <div class="memorize-header-left">
            <div class="memorize-title-row">
              <h1 class="memorize-main-title">${t('memorize_title') || 'Memory & Imprint Engine'}</h1>
              <span class="memorize-level-tag">${tag}</span>
            </div>
            <p class="memorize-subtitle">Active visual encoding & fast-track retention matrix</p>
          </div>

          <div class="memorize-header-actions">
            <button class="memorize-sprint-btn" id="btn-start-sprint" title="Keyboard: S">
              <span class="sprint-icon">⚡</span>
              <span class="sprint-text">${t('speed_imprint') || 'Speed Imprint Sprint'} [S]</span>
            </button>
          </div>
        </header>

        <!-- Live Memory Retention Meter -->
        <div class="memorize-analytics-bar">
          <div class="retention-metric">
            <div class="retention-label-row">
              <span class="retention-label">${t('memorization_rate') || 'Memorization Rate'}</span>
              <span class="retention-pct">${stats.rate}%</span>
            </div>
            <div class="retention-track">
              <div class="retention-fill" style="width: ${stats.rate}%"></div>
            </div>
          </div>

          <div class="memorize-stat-chips">
            <div class="stat-pill stat-total">
              <span class="stat-num">${stats.total}</span>
              <span class="stat-desc">${t('total') || 'total'}</span>
            </div>
            <div class="stat-pill stat-memorized">
              <span class="stat-num">${stats.memorized}</span>
              <span class="stat-desc">${t('memorized_badge') || 'Memorized'}</span>
            </div>
            <div class="stat-pill stat-learning">
              <span class="stat-num">${stats.learning}</span>
              <span class="stat-desc">${t('learning_badge') || 'Learning'}</span>
            </div>
            <div class="stat-pill stat-unseen">
              <span class="stat-num">${stats.unseen}</span>
              <span class="stat-desc">${t('unseen_badge') || 'Unseen'}</span>
            </div>
          </div>
        </div>

        <!-- Controls: Search & Filters -->
        <div class="memorize-controls-row">
          <div class="memorize-search-wrapper">
            <input 
              type="text" 
              id="memorize-search-input" 
              class="memorize-search-input" 
              placeholder="${t('search_vocab') || 'Search vocabulary...'}" 
              value="${this.searchQuery}"
              autocomplete="off"
            />
            ${this.searchQuery ? '<button class="search-clear-btn" id="btn-clear-search">✕</button>' : ''}
          </div>

          <div class="memorize-filter-group">
            <button class="mem-filter-chip ${this.activeFilter === 'all' ? 'active' : ''}" data-filter="all">All (${stats.total})</button>
            <button class="mem-filter-chip ${this.activeFilter === 'unseen' ? 'active' : ''}" data-filter="unseen">${t('unseen_badge') || 'Unseen'} (${stats.unseen})</button>
            <button class="mem-filter-chip ${this.activeFilter === 'learning' ? 'active' : ''}" data-filter="learning">${t('learning_badge') || 'Learning'} (${stats.learning})</button>
            <button class="mem-filter-chip ${this.activeFilter === 'memorized' ? 'active' : ''}" data-filter="memorized">${t('memorized_badge') || 'Memorized'} (${stats.memorized})</button>
          </div>

          <div class="memorize-pos-group">
            <button class="mem-pos-chip ${this.posFilter === 'all' ? 'active' : ''}" data-pos="all">All POS</button>
            <button class="mem-pos-chip ${this.posFilter === 'noun' ? 'active' : ''}" data-pos="noun">Nouns</button>
            <button class="mem-pos-chip ${this.posFilter === 'verb' ? 'active' : ''}" data-pos="verb">Verbs</button>
            <button class="mem-pos-chip ${this.posFilter === 'adj' ? 'active' : ''}" data-pos="adj">Adj</button>
          </div>
        </div>

        <!-- Visual Memory Matrix Grid -->
        <div class="memory-matrix-grid" id="memory-matrix-grid">
          ${cards.length === 0 ? `
            <div class="memorize-empty-state">
              <p class="empty-icon">🔍</p>
              <p class="empty-text">No words match the selected filters.</p>
              <button class="btn-reset-filters" id="btn-reset-filters">Reset Filters</button>
            </div>
          ` : cards.slice(0, 120).map(card => this.renderCardTile(card)).join('')}
        </div>
        ${cards.length > 120 ? `
          <div class="matrix-overflow-hint">Showing first 120 of ${cards.length} items. Refine search or filter for specific subsets.</div>
        ` : ''}
      </div>
    `;

    this.bindMatrixEvents();
  }

  renderCardTile(card) {
    const isMem = isCardMemorized(card);
    const isLearn = (card.reps || 0) > 0 && !isMem;
    const isFlipped = this.flippedCards.has(card.id);

    let statusClass = 'status-unseen';
    let statusText = t('unseen_badge') || 'Unseen';
    if (isMem) {
      statusClass = 'status-memorized';
      statusText = t('memorized_badge') || 'Memorized';
    } else if (isLearn) {
      statusClass = 'status-learning';
      statusText = t('learning_badge') || 'Learning';
    }

    const posBadge = card.pos ? `<span class="pos-badge pos-${card.pos}">${card.pos}</span>` : '';
    const displayWord = card.article ? `${card.article} ${card.word}` : card.word;
    const forms = card.forms ? `<div class="card-forms-text">${card.forms}</div>` : '';
    const translation = card.mn || card.en || card.de || '';
    const example = card.example_de || card.example_en || '';

    return `
      <div class="memory-card-tile ${isFlipped ? 'flipped' : ''} ${statusClass}" data-id="${card.id}">
        <div class="card-tile-inner">
          <!-- Front Face -->
          <div class="card-tile-front">
            <div class="card-tile-header">
              ${posBadge}
              <span class="card-status-pill ${statusClass}">
                <span class="status-dot"></span>
                ${statusText}
              </span>
            </div>

            <div class="card-tile-body">
              <h3 class="tile-word">${displayWord}</h3>
              ${card.plural ? `<span class="tile-plural">Pl: ${card.plural}</span>` : ''}
              ${forms}
            </div>

            <div class="card-tile-footer">
              <button class="tile-action-btn tile-audio-btn" data-audio-word="${card.word}" title="Listen [A]">
                🔊
              </button>
              <button class="tile-action-btn tile-flip-btn" title="Inspect / Flip">
                ↺
              </button>
              <button class="tile-imprint-btn ${isMem ? 'already-memorized' : ''}" data-id="${card.id}" title="Mark Memorized (+15 EXP)">
                ${isMem ? '✓ Saved' : '+ Imprint'}
              </button>
            </div>
          </div>

          <!-- Back Face (Revealed Details) -->
          <div class="card-tile-back">
            <div class="card-back-header">
              <span class="back-pos">${card.pos || ''}</span>
              <button class="card-unflip-btn" title="Flip back">✕</button>
            </div>

            <div class="card-back-body">
              <div class="back-translation-title">Meaning:</div>
              <div class="back-translation">${translation}</div>
              ${example ? `<div class="back-example">“${example}”</div>` : ''}
            </div>

            <div class="card-back-footer">
              <button class="tile-action-btn tile-audio-btn" data-audio-word="${card.word}">🔊 Pronounce</button>
              <button class="tile-imprint-btn ${isMem ? 'already-memorized' : ''}" data-id="${card.id}">
                ${isMem ? '✓ Memorized' : '★ Memorize (+15 EXP)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindMatrixEvents() {
    // Search input
    const searchInput = this.container.querySelector('#memorize-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        // Restore focus
        const newInp = this.container.querySelector('#memorize-search-input');
        if (newInp) {
          newInp.focus();
          newInp.setSelectionRange(newInp.value.length, newInp.value.length);
        }
      });
    }

    // Clear search
    this.container.querySelector('#btn-clear-search')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.render();
    });

    // Reset filters
    this.container.querySelector('#btn-reset-filters')?.addEventListener('click', () => {
      this.activeFilter = 'all';
      this.posFilter = 'all';
      this.searchQuery = '';
      this.render();
    });

    // Start Sprint Button
    this.container.querySelector('#btn-start-sprint')?.addEventListener('click', () => {
      sound.playClick();
      this.startSprint();
    });

    // Filter Chips
    this.container.querySelectorAll('.mem-filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.activeFilter = btn.getAttribute('data-filter') || btn.dataset?.filter || 'all';
        this.render();
      });
    });

    // POS Chips
    this.container.querySelectorAll('.mem-pos-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.posFilter = btn.getAttribute('data-pos') || btn.dataset?.pos || 'all';
        this.render();
      });
    });

    // Tile Click Flip
    this.container.querySelectorAll('.memory-card-tile').forEach(tile => {
      const id = tile.getAttribute('data-id') || tile.dataset?.id;
      tile.addEventListener('click', (e) => {
        if (e.target && e.target.closest && (e.target.closest('.tile-audio-btn') || e.target.closest('.tile-imprint-btn'))) {
          return;
        }
        sound.playFlip();
        if (id) {
          if (this.flippedCards.has(id)) {
            this.flippedCards.delete(id);
          } else {
            this.flippedCards.add(id);
          }
        }
        this.render();
      });
    });

    // Audio Buttons
    this.container.querySelectorAll('.tile-audio-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const word = btn.getAttribute('data-audio-word') || btn.dataset?.audioWord;
        if (word && state.speakWord) {
          state.speakWord(word);
        } else if (word && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(word);
          u.lang = state.targetLang === 'de' ? 'de-DE' : 'en-US';
          window.speechSynthesis.speak(u);
        }
      });
    });

    // Imprint / Mark Memorized Buttons
    this.container.querySelectorAll('.tile-imprint-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const id = btn.getAttribute('data-id') || btn.dataset?.id;
        if (id) {
          await this.markWordAsMemorized(id);
        }
      });
    });
  }

  async markWordAsMemorized(cardId) {
    const card = (state.cards || []).find(c => c.id === cardId);
    if (!card) return;

    sound.playSuccess();

    // Fast-imprint SM-2 progression directly to memorized tier
    card.reps = Math.max(card.reps || 0, 3);
    card.interval = Math.max(card.interval || 0, 21);
    card.easeFactor = Math.max(card.easeFactor || 2.50, 2.50);
    card.dueDate = Date.now() + 21 * 86400000;
    card.lastReviewed = Date.now();

    // Award +15 EXP
    if (state.addExp) {
      state.addExp(15);
    }

    // Save to persistence
    if (state.saveCardProgress) {
      await state.saveCardProgress(card);
    }

    this.render();
  }

  // ========================================================
  // SPEED IMPRINT SPRINT ENGINE
  // ========================================================
  startSprint() {
    // Gather cards: prioritize unseen and learning cards
    let pool = (state.cards || []).filter(c => !isCardMemorized(c));
    if (pool.length === 0) {
      pool = [...(state.cards || [])];
    }

    // Shuffle pool for varied imprint practice
    this.sprintCards = pool.sort(() => Math.random() - 0.5);
    this.sprintIndex = 0;
    this.isSprintMode = true;
    this.sprintPaused = false;

    this.render();
    this.playSprintAudio();
    this.startSprintCountdown();
  }

  startSprintCountdown() {
    this.clearSprintTimer();
    if (this.sprintPaused) return;

    this.sprintStartTime = Date.now();
    this.sprintTimer = setTimeout(() => {
      this.nextSprintCard(false);
    }, this.sprintDuration);
  }

  clearSprintTimer() {
    if (this.sprintTimer) {
      clearTimeout(this.sprintTimer);
      this.sprintTimer = null;
    }
  }

  playSprintAudio() {
    const card = this.sprintCards[this.sprintIndex];
    if (card && state.audioEnabled) {
      if (state.speakWord) {
        state.speakWord(card.word);
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(card.word);
        u.lang = state.targetLang === 'de' ? 'de-DE' : 'en-US';
        window.speechSynthesis.speak(u);
      }
    }
  }

  toggleSprintPause() {
    this.sprintPaused = !this.sprintPaused;
    if (this.sprintPaused) {
      this.clearSprintTimer();
    } else {
      this.startSprintCountdown();
    }
    this.render();
  }

  nextSprintCard(memorized = false) {
    this.clearSprintTimer();
    if (memorized && this.sprintCards[this.sprintIndex]) {
      this.markWordAsMemorized(this.sprintCards[this.sprintIndex].id);
    } else {
      sound.playClick();
    }

    if (this.sprintIndex < this.sprintCards.length - 1) {
      this.sprintIndex++;
      this.render();
      this.playSprintAudio();
      this.startSprintCountdown();
    } else {
      // Sprint complete
      this.exitSprint();
    }
  }

  prevSprintCard() {
    this.clearSprintTimer();
    sound.playClick();
    if (this.sprintIndex > 0) {
      this.sprintIndex--;
      this.render();
      this.playSprintAudio();
      this.startSprintCountdown();
    }
  }

  exitSprint() {
    this.clearSprintTimer();
    this.isSprintMode = false;
    sound.playSuccess();
    this.render();
  }

  renderSprint() {
    const card = this.sprintCards[this.sprintIndex];
    if (!card) {
      this.exitSprint();
      return;
    }

    const currentNum = this.sprintIndex + 1;
    const totalNum = this.sprintCards.length;
    const isMem = isCardMemorized(card);
    const displayWord = card.article ? `${card.article} ${card.word}` : card.word;
    const translation = card.mn || card.en || card.de || '';
    const example = card.example_de || card.example_en || '';

    this.container.innerHTML = `
      <div class="sprint-container">
        <!-- Sprint HUD Header -->
        <div class="sprint-top-bar">
          <div class="sprint-progress-pill">
            Sprint: ${currentNum} / ${totalNum}
          </div>
          <div class="sprint-controls-right">
            <button class="sprint-pause-btn" id="btn-sprint-pause">
              ${this.sprintPaused ? '▶ Resume [Space]' : '⏸ Pause [Space]'}
            </button>
            <button class="sprint-exit-btn" id="btn-sprint-exit">✕ Exit [Esc]</button>
          </div>
        </div>

        <!-- Animated Imprint Countdown Line -->
        <div class="sprint-timer-track">
          <div class="sprint-timer-fill ${this.sprintPaused ? 'paused' : 'running'}" style="animation-duration: ${this.sprintDuration}ms"></div>
        </div>

        <!-- Big Focus Imprint Card -->
        <div class="sprint-focus-card">
          <div class="sprint-card-header">
            ${card.pos ? `<span class="sprint-pos-pill">${card.pos}</span>` : ''}
            <span class="sprint-status-tag ${isMem ? 'tag-memorized' : 'tag-learning'}">
              ${isMem ? 'Memorized' : 'Encoding'}
            </span>
          </div>

          <div class="sprint-card-center">
            <h1 class="sprint-big-word">${displayWord}</h1>
            ${card.plural ? `<div class="sprint-forms-sub">Pl: ${card.plural}</div>` : ''}
            ${card.forms ? `<div class="sprint-forms-sub">${card.forms}</div>` : ''}

            <div class="sprint-meaning-box">
              <span class="sprint-meaning-text">${translation}</span>
            </div>

            ${example ? `
              <div class="sprint-example-box">
                <span class="sprint-example-text">“${example}”</span>
              </div>
            ` : ''}
          </div>

          <!-- Bottom Action Buttons -->
          <div class="sprint-actions-bar">
            <button class="sprint-action-btn btn-sprint-prev" id="btn-sprint-prev" title="Keyboard: ArrowLeft">
              ← [←]
            </button>
            <button class="sprint-action-btn btn-sprint-audio" id="btn-sprint-audio" title="Audio [A]">
              🔊 [A]
            </button>
            <button class="sprint-memorize-cta" id="btn-sprint-memorize" title="Memorize & Advance [Enter / M]">
              ★ Memorized (+15 EXP) [Enter]
            </button>
            <button class="sprint-action-btn btn-sprint-next" id="btn-sprint-next" title="Next [→ / Space]">
              Next [→]
            </button>
          </div>
        </div>
      </div>
    `;

    // Sprint Event Bindings
    this.container.querySelector('#btn-sprint-exit')?.addEventListener('click', () => this.exitSprint());
    this.container.querySelector('#btn-sprint-pause')?.addEventListener('click', () => this.toggleSprintPause());
    this.container.querySelector('#btn-sprint-prev')?.addEventListener('click', () => this.prevSprintCard());
    this.container.querySelector('#btn-sprint-next')?.addEventListener('click', () => this.nextSprintCard(false));
    this.container.querySelector('#btn-sprint-memorize')?.addEventListener('click', () => this.nextSprintCard(true));
    this.container.querySelector('#btn-sprint-audio')?.addEventListener('click', () => this.playSprintAudio());
  }

  destroy() {
    this.clearSprintTimer();
  }
}
