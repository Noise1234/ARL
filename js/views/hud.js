/**
 * ARL - Single-Line Top HUD View with Integrated EXP & Level Progress
 * Renders: [DE·B1] (quick-level selector) | counts | Level & EXP progress | Nav items [V] [Q] [L] [G] [M] [S] [?]
 * Floating EXP badges container, tactile feedback, keyboard-driven navigation.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { sound } from '../sound.js';

export class TopHudView {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.currentView = 'vocab';
    this.isLevelDropdownOpen = false;
  }

  setActiveView(view) {
    this.currentView = view;
    this.render();
  }

  render() {
    const stats = state.getQueueStats();
    const session = state.getSessionStats ? state.getSessionStats() : { streak: 0, avgSpeed: '0.0', multiplier: 1 };
    const levelStats = state.getLevelStats ? state.getLevelStats() : { level: 1, totalExp: 0, progressPct: 0 };
    const tag = `[${state.targetLang.toUpperCase()}·${state.cefrLevel.toUpperCase()}]`;
    const cefrLevels = ['a1', 'a2', 'b1', 'b2'];

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
          <div class="hud-tag-wrapper">
            <span class="hud-tag" id="hud-tag-btn" role="button" tabindex="0" title="Click to switch level or open settings">${tag}</span>
            ${this.isLevelDropdownOpen ? `
              <div class="hud-quick-level-popup" id="quick-level-popup">
                ${cefrLevels.map(lvl => `
                  <button class="quick-lvl-chip ${state.cefrLevel === lvl ? 'active' : ''}" data-lvl="${lvl}">
                    ${lvl.toUpperCase()}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <span class="hud-counts">
            ${countsContent}
          </span>
        </div>

        <div class="hud-center">
          <!-- Level & EXP Progress Track -->
          <div class="hud-exp-badge" title="Level ${levelStats.level}: ${levelStats.expInCurrentLevel || 0}/${levelStats.expNeededForNext || 100} EXP (${levelStats.totalExp} Total)">
            <span class="hud-level-pill">Lv.${levelStats.level}</span>
            <div class="hud-exp-track">
              <div class="hud-exp-fill" style="width: ${levelStats.progressPct || 0}%"></div>
            </div>
            ${session.multiplier > 1 ? `
              <span class="hud-multiplier-pill" title="${session.streak} Streak: ${session.multiplier}x EXP Multiplier">⚡${session.multiplier}x</span>
            ` : (session.streak > 0 ? `
              <span class="hud-streak-pill" title="${session.streak} Streak">⚡${session.streak}</span>
            ` : '')}
          </div>
        </div>

        <nav class="hud-nav" aria-label="Main Navigation">
          <button class="hud-nav-item ${this.currentView === 'vocab' ? 'active' : ''}" id="nav-btn-vocab" data-key="v" title="Keyboard: V">
            <span class="hud-key">[V]</span><span class="hud-label">${t('hud_vocab').replace(/\[V\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'memorize' ? 'active' : ''}" id="nav-btn-memorize" data-key="m" title="Keyboard: M">
            <span class="hud-key">[M]</span><span class="hud-label">${t('hud_memorize') ? t('hud_memorize').replace(/\[M\]\s*/, '') : 'Memorize'}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'quiz' ? 'active' : ''}" id="nav-btn-quiz" data-key="q" title="Keyboard: Q">
            <span class="hud-key">[Q]</span><span class="hud-label">${t('hud_quiz') ? t('hud_quiz').replace(/\[Q\]\s*/, '') : 'Quiz'}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'lexicon' ? 'active' : ''}" id="nav-btn-lexicon" data-key="l" title="Keyboard: L">
            <span class="hud-key">[L]</span><span class="hud-label">${t('hud_lexicon') ? t('hud_lexicon').replace(/\[L\]\s*/, '') : 'Lexicon'}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'grammar' ? 'active' : ''}" id="nav-btn-grammar" data-key="g" title="Keyboard: G">
            <span class="hud-key">[G]</span><span class="hud-label">${t('hud_grammar').replace(/\[G\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'media' ? 'active' : ''}" id="nav-btn-media" data-key="i" title="Keyboard: I">
            <span class="hud-key">[I]</span><span class="hud-label">${t('hud_media').replace(/\[[MI]\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'settings' ? 'active' : ''}" id="nav-btn-settings" data-key="s" title="Keyboard: S">
            <span class="hud-key">[S]</span><span class="hud-label">${t('hud_settings').replace(/\[S\]\s*/, '')}</span>
          </button>
          <button class="hud-nav-item hud-help-btn" id="nav-btn-help" data-key="?" title="Keyboard: ?">
            <span class="hud-key">[?]</span>
          </button>
        </nav>
      </div>

      <!-- Container for Floating EXP Particles -->
      <div id="exp-floating-container" class="exp-floating-container" aria-hidden="true"></div>
    `;

    // Bind events
    const toggleMemBtn = this.container.querySelector('#hud-toggle-mem');
    if (toggleMemBtn) {
      toggleMemBtn.addEventListener('click', () => {
        sound.playClick();
        state.toggleReviewMode();
        if (this.currentView !== 'vocab' && typeof this.onNavigate === 'function') {
          this.onNavigate('vocab');
        }
      });
    }

    // Tag click: toggle quick level dropdown
    this.container.querySelector('#hud-tag-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playClick();
      this.isLevelDropdownOpen = !this.isLevelDropdownOpen;
      this.render();
    });

    // Quick Level selector chips
    this.container.querySelectorAll('.quick-lvl-chip').forEach(chip => {
      chip.addEventListener('click', async (e) => {
        e.stopPropagation();
        sound.playClick();
        const lvl = chip.dataset.lvl;
        if (lvl) {
          await state.setCefrLevel(lvl);
          this.isLevelDropdownOpen = false;
          this.render();
        }
      });
    });

    // Close dropdown on outside click
    if (this.isLevelDropdownOpen && typeof document !== 'undefined') {
      const closePopup = (e) => {
        if (!e.target.closest('#hud-tag-btn') && !e.target.closest('#quick-level-popup')) {
          this.isLevelDropdownOpen = false;
          this.render();
          document.removeEventListener('click', closePopup);
        }
      };
      setTimeout(() => document.addEventListener('click', closePopup), 10);
    }

    // Navigation buttons
    const navActions = [
      ['#nav-btn-vocab', 'vocab'],
      ['#nav-btn-memorize', 'memorize'],
      ['#nav-btn-quiz', 'quiz'],
      ['#nav-btn-lexicon', 'lexicon'],
      ['#nav-btn-grammar', 'grammar'],
      ['#nav-btn-media', 'media'],
      ['#nav-btn-settings', 'settings'],
      ['#nav-btn-help', 'help']
    ];

    navActions.forEach(([sel, target]) => {
      this.container.querySelector(sel)?.addEventListener('click', () => {
        sound.playClick();
        if (typeof this.onNavigate === 'function') {
          this.onNavigate(target);
        }
      });
    });
  }
}
