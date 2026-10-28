/**
 * ARL - Vocabulary Lexicon & Word Library View
 * Instant fuzzy search across target language, Mongolian definitions, and examples.
 * Filter by POS (nouns, verbs, adjectives), mastery state, audio playback,
 * and custom word creation modal.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { sound } from '../sound.js';
import { fuzzySearchMatch } from '../unicode.js';

export class LexiconView {
  constructor(containerEl, onNavigate, onOpenAddWord) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.onOpenAddWord = onOpenAddWord;
    this.searchQuery = '';
    this.posFilter = 'all'; // 'all' | 'noun' | 'verb' | 'adjective'
    this.statusFilter = 'all'; // 'all' | 'due' | 'new' | 'memorized'
  }

  getFilteredCards() {
    let list = state.cards;

    // Filter by POS
    if (this.posFilter !== 'all') {
      list = list.filter(c => c.pos === this.posFilter);
    }

    // Filter by status
    if (this.statusFilter !== 'all') {
      const now = Date.now();
      list = list.filter(c => {
        const prog = state.progressMap.get(c.id);
        if (this.statusFilter === 'new') {
          return !prog || !prog.lastStudied;
        } else if (this.statusFilter === 'due') {
          return prog && prog.lastStudied && (prog.dueDate ? prog.dueDate <= now : true);
        } else if (this.statusFilter === 'memorized') {
          return prog && (prog.interval >= 21 || prog.reps >= 4);
        }
        return true;
      });
    }

    // Filter by query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim();
      list = list.filter(c => {
        return (
          fuzzySearchMatch(c.word, q) ||
          (c.mn && c.mn.toLowerCase().includes(q.toLowerCase())) ||
          (c.en && c.en.toLowerCase().includes(q.toLowerCase())) ||
          (c.de && c.de.toLowerCase().includes(q.toLowerCase())) ||
          (c.example_de && c.example_de.toLowerCase().includes(q.toLowerCase())) ||
          (c.example_en && c.example_en.toLowerCase().includes(q.toLowerCase()))
        );
      });
    }

    return list;
  }

  render() {
    const tag = `[${state.targetLang.toUpperCase()}·${state.cefrLevel.toUpperCase()}]`;
    const filtered = this.getFilteredCards();
    const totalCount = state.cards.length;

    this.container.innerHTML = `
      <div class="lexicon-wrapper">
        
        <!-- Controls Header -->
        <div class="lexicon-header-card">
          <div class="lexicon-title-row">
            <div class="lexicon-heading-group">
              <span class="hud-tag">${tag}</span>
              <h2 class="lexicon-title">${t('lexicon_title')}</h2>
              <span class="lexicon-count-badge">${filtered.length} / ${totalCount} words</span>
            </div>

            <div class="lexicon-action-btns">
              <button class="keyhint-btn keyhint-primary touch-target" id="btn-lexicon-add-word">
                <span class="micro-bracket">[+]</span> ${t('add_custom_word')}
              </button>
            </div>
          </div>

          <!-- Search Input Bar -->
          <div class="lexicon-search-bar">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              id="lexicon-search-input"
              class="lexicon-input"
              placeholder="Search words, translations, examples... (e.g. Haus, авах, to see)"
              value="${this.searchQuery}"
              autocomplete="off"
            />
            ${this.searchQuery ? `
              <button class="search-clear-btn" id="btn-clear-search">✕</button>
            ` : ''}
          </div>

          <!-- Filters Row -->
          <div class="lexicon-filters-row">
            <div class="filter-chip-group">
              <span class="filter-label">POS:</span>
              <button class="filter-chip ${this.posFilter === 'all' ? 'active' : ''}" data-pos="all">All</button>
              <button class="filter-chip ${this.posFilter === 'noun' ? 'active' : ''}" data-pos="noun">Nouns</button>
              <button class="filter-chip ${this.posFilter === 'verb' ? 'active' : ''}" data-pos="verb">Verbs</button>
              <button class="filter-chip ${this.posFilter === 'adjective' ? 'active' : ''}" data-pos="adjective">Adjectives</button>
            </div>

            <div class="filter-chip-group">
              <span class="filter-label">SRS:</span>
              <button class="filter-chip ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">All</button>
              <button class="filter-chip ${this.statusFilter === 'due' ? 'active' : ''}" data-status="due">Due</button>
              <button class="filter-chip ${this.statusFilter === 'new' ? 'active' : ''}" data-status="new">New</button>
              <button class="filter-chip ${this.statusFilter === 'memorized' ? 'active' : ''}" data-status="memorized">Learned</button>
            </div>
          </div>
        </div>

        <!-- Words Grid / List -->
        <div class="lexicon-grid">
          ${filtered.length === 0 ? `
            <div class="lexicon-empty-state">
              <div class="empty-icon">∅</div>
              <div class="empty-text">No vocabulary matches your search criteria.</div>
            </div>
          ` : filtered.map(card => {
            const prog = state.progressMap.get(card.id);
            let srsBadge = '<span class="status-pill pill-new">New</span>';
            if (prog && prog.lastStudied) {
              if (prog.interval >= 21 || prog.reps >= 4) {
                srsBadge = '<span class="status-pill pill-memorized">✓ Learned</span>';
              } else {
                srsBadge = `<span class="status-pill pill-due">Due in ${prog.interval || 1}d</span>`;
              }
            }

            let chip = '';
            if (card.pos === 'noun' && card.article) {
              chip = `<span class="pos-chip chip-${card.article}">${card.article}</span>`;
            } else if (card.pos === 'verb') {
              chip = `<span class="pos-chip chip-verb">verb</span>`;
            } else if (card.pos) {
              chip = `<span class="pos-chip chip-adj">${card.pos}</span>`;
            }

            return `
              <div class="lexicon-item-card" data-id="${card.id}">
                <div class="item-card-header">
                  <div class="item-word-group">
                    ${chip}
                    <span class="item-word-text">${card.word}</span>
                    ${card.plural ? `<span class="item-plural">(${card.plural})</span>` : ''}
                  </div>
                  <div class="item-header-actions">
                    ${srsBadge}
                    <button class="item-audio-btn touch-target" data-word="${card.word}" title="Listen to pronunciation">
                      🔊
                    </button>
                  </div>
                </div>

                ${card.forms ? `
                  <div class="item-forms-row">
                    <span class="forms-text">${card.forms}</span>
                  </div>
                ` : ''}

                ${card.rektion ? `
                  <div class="item-valency-row">
                    <span class="valency-badge">[${card.rektion}]</span>
                  </div>
                ` : ''}

                <div class="item-translation-line">
                  <span class="trans-mn">${card.mn}</span>
                  ${card.en && state.targetLang === 'de' ? `<span class="trans-sub">· ${card.en}</span>` : ''}
                  ${card.de && state.targetLang === 'en' ? `<span class="trans-sub">· ${card.de}</span>` : ''}
                </div>

                ${card.example_de || card.example_en ? `
                  <div class="item-example-box">
                    <div class="item-ex-target">${state.targetLang === 'de' ? (card.example_de || '') : (card.example_en || '')}</div>
                    <div class="item-ex-mn">${card.example_mn || ''}</div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    // Bind Search Input
    const searchInput = this.container.querySelector('#lexicon-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render();
        // Re-focus and put cursor at the end
        const newIn = this.container.querySelector('#lexicon-search-input');
        if (newIn) {
          newIn.focus();
          newIn.setSelectionRange(newIn.value.length, newIn.value.length);
        }
      });
    }

    // Clear search
    this.container.querySelector('#btn-clear-search')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.render();
    });

    // POS Filters
    this.container.querySelectorAll('.filter-chip[data-pos]').forEach(chip => {
      chip.addEventListener('click', () => {
        this.posFilter = chip.dataset.pos;
        this.render();
      });
    });

    // Status Filters
    this.container.querySelectorAll('.filter-chip[data-status]').forEach(chip => {
      chip.addEventListener('click', () => {
        this.statusFilter = chip.dataset.status;
        this.render();
      });
    });

    // Audio Playback
    this.container.querySelectorAll('.item-audio-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.dataset.word;
        if (word) {
          state.playAudio(word);
        }
      });
    });

    // Add Word Button
    this.container.querySelector('#btn-lexicon-add-word')?.addEventListener('click', () => {
      if (typeof this.onOpenAddWord === 'function') {
        this.onOpenAddWord();
      }
    });
  }
}
