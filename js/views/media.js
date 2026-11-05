/**
 * ARL - Curated Immersion Hub View
 * Text-only recommendations for books, podcasts, and shows.
 * Zero media files, zero bloat, tagged by CEFR level.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { keyboard, KeyboardState } from '../keyboard.js';

export class MediaView {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.items = [];
    this.selectedType = 'all';
    this.selectedLevel = null;
  }

  async loadData() {
    const lang = state.targetLang;
    try {
      const resp = await fetch(`data/${lang}/immersion.json`);
      if (resp.ok) {
        this.items = await resp.json();
      }
    } catch (e) {
      console.warn('Could not load immersion data:', e);
    }
  }

  setTypeFilter(type) {
    this.selectedType = type;
    this.render();
  }

  setLevelFilter(lvl) {
    if (this.selectedLevel === lvl) {
      this.selectedLevel = null; // toggle off
    } else {
      this.selectedLevel = lvl;
    }
    this.render();
  }

  render() {
    keyboard.setState(KeyboardState.MEDIA_HUB);

    let filtered = this.items;
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === this.selectedType);
    }
    if (this.selectedLevel) {
      filtered = filtered.filter(item => item.level.includes(this.selectedLevel));
    }

    const uiLang = state.interfaceLang;

    this.container.innerHTML = `
      <div class="media-view-container">
        <!-- Media Header & Filters -->
        <div class="media-header-bar">
          <div class="media-type-filters">
            <button class="filter-tab-btn ${this.selectedType === 'all' ? 'active' : ''}" data-type="all">
              <span class="micro-bracket">[A]</span> ${t('filter_all')}
            </button>
            <button class="filter-tab-btn ${this.selectedType === 'book' ? 'active' : ''}" data-type="book">
              <span class="micro-bracket">[B]</span> ${t('filter_books')}
            </button>
            <button class="filter-tab-btn ${this.selectedType === 'podcast' ? 'active' : ''}" data-type="podcast">
              <span class="micro-bracket">[P]</span> ${t('filter_podcasts')}
            </button>
            <button class="filter-tab-btn ${this.selectedType === 'show' ? 'active' : ''}" data-type="show">
              <span class="micro-bracket">[W]</span> ${t('filter_shows')}
            </button>
          </div>

          <div class="media-level-filters">
            ${['A1', 'A2', 'B1', 'B2'].map((lvl, idx) => `
              <button class="filter-lvl-btn ${this.selectedLevel === lvl ? 'active' : ''}" data-lvl="${lvl}">
                <span class="micro-bracket">[${idx + 1}]</span> ${lvl}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Curated Items List -->
        <div class="media-cards-list">
          ${filtered.length === 0 ? `
            <div class="empty-state">No media recommendations matching selected filters.</div>
          ` : filtered.map((item, idx) => {
            const desc = item.description[uiLang] || item.description.en || item.description.de || '';
            return `
              <div class="arl-card media-card-item">
                <div class="arl-card-header">
                  <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                    <span class="arl-card-num-badge">${String(idx + 1).padStart(2, '0')}. ${item.type.toUpperCase()}</span>
                    <span class="media-level-badge" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-family:'JetBrains Mono', monospace;">${item.level}</span>
                  </div>
                  <h3 class="arl-card-title">${item.title}</h3>
                </div>
                <p class="media-card-desc" style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin: 8px 0;">${desc}</p>
                ${item.note ? `
                  <div class="arl-card-formula" style="border-left-color: #10b981; color: #a7f3d0; margin-top: 10px;">
                    <strong style="color: #6ee7b7;">Immersion Tip:</strong> ${item.note}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- Keyhint Footer -->
        <div class="view-keyhints-bar">
          <span class="micro-keyhint"><span class="micro-bracket">[A/B/P/W]</span> Category</span>
          <span class="micro-keyhint"><span class="micro-bracket">[1-4]</span> Level</span>
          <span class="micro-keyhint"><span class="micro-bracket">[V]</span> Vocab</span>
          <span class="micro-keyhint"><span class="micro-bracket">[S]</span> Settings</span>
        </div>
      </div>
    `;

    // Filter clicks
    this.container.querySelectorAll('.filter-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTypeFilter(btn.getAttribute('data-type'));
      });
    });

    this.container.querySelectorAll('.filter-lvl-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLevelFilter(btn.getAttribute('data-lvl'));
      });
    });
  }
}
