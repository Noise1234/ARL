/**
 * ARL - Single-Line Minimal Top HUD View
 * Strictly renders: [DE·B1]  14 due · 6 new · 120 learned  ⚡ 12 streak · 4.2s   [V]ocab [G]rammar [M]edia [S]ettings
 * Zero bloat, tactile feedback, keyboard-driven navigation.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';

export class TopHudView {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.currentView = 'vocab';
  }

  setActiveView(view) {
    this.currentView = view;
    this.render();
  }

  render() {
    const stats = state.getQueueStats();
    const session = state.getSessionStats ? state.getSessionStats() : { streak: 0, avgSpeed: '0.0' };
    const tag = `[${state.targetLang.toUpperCase()}·${state.cefrLevel.toUpperCase()}]`;

    const countsContent = state.reviewMode === 'memorized'
      ? `<span class="hud-count-due" id="hud-toggle-mem" role="button" tabindex="0" style="cursor:pointer" title="Keyboard: R">[MEM] ${stats.memorizedCount} ${t('learned')} [R]</span>`
      : `<span class="hud-count-due">${stats.dueCount} ${t('due')}</span>
         <span class="hud-count-sep">·</span>
         <span class="hud-count-new">${stats.newCount} ${t('new')}</span>
         <span class="hud-count-sep">·</span>
         <span class="hud-count-new" id="hud-toggle-mem" role="button" tabindex="0" style="cursor:pointer" title="Keyboard: R">${stats.memorizedCount} ${t('learned')}</span>`;

    this.container.innerHTML = `
      <div class="top-hud-bar">
        <div class="hud-left">
          <span class="hud-tag" id="hud-tag-btn" role="button" tabindex="0" title="Settings / Change level [S]">${tag}</span>
          <span class="hud-counts">
            ${countsContent}
          </span>
        </div>

        <div class="hud-center">
          <span class="hud-momentum-badge" title="Session Streak & Velocity">
            <span class="momentum-flash">⚡</span>
            <span class="momentum-val">${session.streak} streak</span>
            <span class="hud-count-sep">·</span>
            <span class="momentum-speed">${session.avgSpeed}s avg</span>
          </span>
        </div>

        <nav class="hud-nav" aria-label="Main Navigation">
          <button class="hud-nav-item ${this.currentView === 'vocab' ? 'active' : ''}" id="nav-btn-vocab" data-key="v" title="Keyboard: V">
            <span class="hud-key">[V]</span><span class="hud-label">${t('hud_vocab').replace(/\[V\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'grammar' ? 'active' : ''}" id="nav-btn-grammar" data-key="g" title="Keyboard: G">
            <span class="hud-key">[G]</span><span class="hud-label">${t('hud_grammar').replace(/\[G\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'media' ? 'active' : ''}" id="nav-btn-media" data-key="m" title="Keyboard: M">
            <span class="hud-key">[M]</span><span class="hud-label">${t('hud_media').replace(/\[M\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'settings' ? 'active' : ''}" id="nav-btn-settings" data-key="s" title="Keyboard: S">
            <span class="hud-key">[S]</span><span class="hud-label">${t('hud_settings').replace(/\[S\]\s*/, '')}</span>
          </button>
        </nav>
      </div>
    `;

    // Bind click events
    const toggleMemBtn = this.container.querySelector('#hud-toggle-mem');
    if (toggleMemBtn) {
      toggleMemBtn.addEventListener('click', () => {
        state.toggleReviewMode();
        if (this.currentView !== 'vocab' && typeof this.onNavigate === 'function') {
          this.onNavigate('vocab');
        }
      });
    }
    this.container.querySelector('#hud-tag-btn').addEventListener('click', () => {
      this.onNavigate('settings');
    });
    this.container.querySelector('#nav-btn-vocab').addEventListener('click', () => {
      this.onNavigate('vocab');
    });
    this.container.querySelector('#nav-btn-grammar').addEventListener('click', () => {
      this.onNavigate('grammar');
    });
    this.container.querySelector('#nav-btn-media').addEventListener('click', () => {
      this.onNavigate('media');
    });
    this.container.querySelector('#nav-btn-settings').addEventListener('click', () => {
      this.onNavigate('settings');
    });
  }
}
