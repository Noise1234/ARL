/**
 * ARL - Single-Line Minimal Top HUD View
 * Strictly renders: [DE·B1]  14 due · 6 new      [V]ocab  [G]rammar  [M]edia  [S]ettings
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
    const tag = `[${state.targetLang.toUpperCase()}·${state.cefrLevel.toUpperCase()}]`;

    this.container.innerHTML = `
      <div class="top-hud-bar">
        <div class="hud-left">
          <span class="hud-tag" id="hud-tag-btn" role="button" tabindex="0" title="Change level/language">${tag}</span>
          <span class="hud-counts">
            <span class="hud-count-due">${stats.dueCount} ${t('due')}</span>
            <span class="hud-count-sep">·</span>
            <span class="hud-count-new">${stats.newCount} ${t('new')}</span>
          </span>
        </div>

        <nav class="hud-nav" aria-label="Main Navigation">
          <button class="hud-nav-item ${this.currentView === 'vocab' ? 'active' : ''}" id="nav-btn-vocab" title="Keyboard: V">
            <span class="hud-key">[V]</span><span class="hud-label">${t('hud_vocab').replace(/\[V\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'grammar' ? 'active' : ''}" id="nav-btn-grammar" title="Keyboard: G">
            <span class="hud-key">[G]</span><span class="hud-label">${t('hud_grammar').replace(/\[G\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'media' ? 'active' : ''}" id="nav-btn-media" title="Keyboard: M">
            <span class="hud-key">[M]</span><span class="hud-label">${t('hud_media').replace(/\[M\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'settings' ? 'active' : ''}" id="nav-btn-settings" title="Keyboard: S">
            <span class="hud-key">[S]</span><span class="hud-label">${t('hud_settings').replace(/\[S\]\s*/, '')}</span>
          </button>
        </nav>
      </div>
    `;

    // Bind click events
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
