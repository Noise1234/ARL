/**
 * ARL - Vocabulary Lexicon & Word Library View
 * Instant fuzzy search across target language, Mongolian definitions, and examples.
 * Filter by Level (All, A1, A2, B1, B2), POS (nouns, verbs, adjectives), mastery state,
 * 50-word pagination, audio playback, and custom word creation modal.
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
    this.levelFilter = 'all'; // 'all' | 'a1' | 'a2' | 'b1' | 'b2'
    this.currentPage = 1;
    this.pageSize = 50;
  }

  getFilteredCards() {
    let list = state.cards;

    // Filter by CEFR Level
    if (this.levelFilter !== 'all') {
      const targetLvl = this.levelFilter.toLowerCase();
      list = list.filter(c => {
        if (c.level && c.level.toLowerCase() === targetLvl) return true;
        if (c.id && c.id.toLowerCase().startsWith(targetLvl)) return true;
        return false;
      });
    }

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

  setLevelFilter(lvl) {
    this.levelFilter = lvl;
    this.currentPage = 1;
    this.render();
  }

  goToPage(page) {
    const filtered = this.getFilteredCards();
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    const target = Math.max(1, Math.min(page, totalPages));
    this.currentPage = target;
    this.render();
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  render() {
    const tag = `[${state.targetLang.toUpperCase()}·${state.cefrLevel.toUpperCase()}]`;
    const filtered = this.getFilteredCards();
    const totalCount = state.cards.length;

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pagedItems = filtered.slice(startIndex, startIndex + this.pageSize);

    this.container.innerHTML = `
      <div class="lexicon-wrapper">
        
        <!-- Controls Header -->
        <div class="lexicon-header-card">
          <div class="lexicon-title-row">
            <div class="lexicon-heading-group">
              <span class="hud-tag">${tag}</span>
              <h2 class="lexicon-title">${t('lexicon_title') || 'Lexicon'}</h2>
              <span class="lexicon-count-badge">${filtered.length} / ${totalCount} words</span>
            </div>

            <div class="lexicon-action-btns">
              <button class="keyhint-btn keyhint-primary touch-target" id="btn-lexicon-add-word">
                <span class="micro-bracket">[+]</span> ${t('add_custom_word') || 'Add Word'}
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

          <!-- Filters Row: CEFR Levels + POS + SRS -->
          <div class="lexicon-filters-row">
            <!-- CEFR Level Filters -->
            <div class="filter-chip-group">
              <span class="filter-label">Level:</span>
              <button class="filter-chip ${this.levelFilter === 'all' ? 'active' : ''}" data-lvl="all">All</button>
              <button class="filter-chip ${this.levelFilter === 'a1' ? 'active' : ''}" data-lvl="a1">A1</button>
              <button class="filter-chip ${this.levelFilter === 'a2' ? 'active' : ''}" data-lvl="a2">A2</button>
              <button class="filter-chip ${this.levelFilter === 'b1' ? 'active' : ''}" data-lvl="b1">B1</button>
              <button class="filter-chip ${this.levelFilter === 'b2' ? 'active' : ''}" data-lvl="b2">B2</button>
            </div>

            <!-- POS Filters -->
            <div class="filter-chip-group">
              <span class="filter-label">POS:</span>
              <button class="filter-chip ${this.posFilter === 'all' ? 'active' : ''}" data-pos="all">All</button>
              <button class="filter-chip ${this.posFilter === 'noun' ? 'active' : ''}" data-pos="noun">Nouns</button>
              <button class="filter-chip ${this.posFilter === 'verb' ? 'active' : ''}" data-pos="verb">Verbs</button>
              <button class="filter-chip ${this.posFilter === 'adjective' ? 'active' : ''}" data-pos="adjective">Adjectives</button>
            </div>

            <!-- Status Filters -->
            <div class="filter-chip-group">
              <span class="filter-label">SRS:</span>
              <button class="filter-chip ${this.statusFilter === 'all' ? 'active' : ''}" data-status="all">All</button>
              <button class="filter-chip ${this.statusFilter === 'due' ? 'active' : ''}" data-status="due">Due</button>
              <button class="filter-chip ${this.statusFilter === 'new' ? 'active' : ''}" data-status="new">New</button>
              <button class="filter-chip ${this.statusFilter === 'memorized' ? 'active' : ''}" data-status="memorized">Learned</button>
            </div>
          </div>

          <!-- Pagination Bar -->
          <div class="lexicon-pagination-bar">
            <button class="page-nav-btn touch-target" id="btn-page-prev" ${this.currentPage <= 1 ? 'disabled' : ''}>
              ← Previous
            </button>
            <span class="page-indicator">
              Page <strong>${this.currentPage}</strong> of <strong>${totalPages}</strong>
              <span class="page-range">(${startIndex + 1}–${Math.min(startIndex + this.pageSize, filtered.length)} of ${filtered.length})</span>
            </span>
            <button class="page-nav-btn touch-target" id="btn-page-next" ${this.currentPage >= totalPages ? 'disabled' : ''}>
              Next →
            </button>
          </div>
        </div>

        <!-- Words Grid / List (50 items per page) -->
        <div class="lexicon-grid">
          ${pagedItems.length === 0 ? `
            <div class="lexicon-empty-state">
              <div class="empty-icon">∅</div>
              <div class="empty-text">No vocabulary matches your search criteria.</div>
            </div>
          ` : pagedItems.map(card => {
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

            const levelBadge = card.level ? `<span class="card-level-chip">${card.level.toUpperCase()}</span>` : '';

            return `
              <div class="lexicon-item-card" data-id="${card.id}">
                <div class="item-card-header">
                  <div class="item-word-group">
                    ${levelBadge}
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

        <!-- Bottom Pagination Bar -->
        ${totalPages > 1 ? `
          <div class="lexicon-pagination-bottom">
            <button class="page-nav-btn touch-target" id="btn-page-prev-bottom" ${this.currentPage <= 1 ? 'disabled' : ''}>
              ← Previous
            </button>
            <span class="page-indicator">
              Page <strong>${this.currentPage}</strong> of <strong>${totalPages}</strong>
            </span>
            <button class="page-nav-btn touch-target" id="btn-page-next-bottom" ${this.currentPage >= totalPages ? 'disabled' : ''}>
              Next →
            </button>
          </div>
        ` : ''}

      </div>
    `;

    // Bind Search Input
    const searchInput = this.container.querySelector('#lexicon-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.currentPage = 1;
        this.render();
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
      this.currentPage = 1;
      this.render();
    });

    // Level Filters
    this.container.querySelectorAll('.filter-chip[data-lvl]').forEach(chip => {
      chip.addEventListener('click', () => {
        sound.playClick();
        this.levelFilter = chip.dataset.lvl;
        this.currentPage = 1;
        this.render();
      });
    });

    // POS Filters
    this.container.querySelectorAll('.filter-chip[data-pos]').forEach(chip => {
      chip.addEventListener('click', () => {
        sound.playClick();
        this.posFilter = chip.dataset.pos;
        this.currentPage = 1;
        this.render();
      });
    });

    // Status Filters
    this.container.querySelectorAll('.filter-chip[data-status]').forEach(chip => {
      chip.addEventListener('click', () => {
        sound.playClick();
        this.statusFilter = chip.dataset.status;
        this.currentPage = 1;
        this.render();
      });
    });

    // Pagination handlers
    this.container.querySelector('#btn-page-prev')?.addEventListener('click', () => {
      sound.playClick();
      this.prevPage();
    });
    this.container.querySelector('#btn-page-next')?.addEventListener('click', () => {
      sound.playClick();
      this.nextPage();
    });
    this.container.querySelector('#btn-page-prev-bottom')?.addEventListener('click', () => {
      sound.playClick();
      this.prevPage();
    });
    this.container.querySelector('#btn-page-next-bottom')?.addEventListener('click', () => {
      sound.playClick();
      this.nextPage();
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
