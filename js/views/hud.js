/**
 * ARL - Single-Line Top HUD View with Integrated EXP & Level Progress
 * Renders: [DE·B1] (quick-level selector) | counts | Level & EXP progress | Nav items [V] [M] [Q] [L] [G] [N] [I] [P] [SYNC] [T] [S] [?]
 * Typographic Terminal Aesthetic: ZERO OS emojis in header and bottom control bars.
 * Mobile Bottom Navigation covers 100% of app features (all 8 modules).
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { sound } from '../sound.js';
import { grammarPip } from '../grammar-pip.js';
import { gistSync } from '../sync.js';

export class TopHudView {
  constructor(containerEl, onNavigate, onToggleTheme) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.onToggleTheme = onToggleTheme;
    this.currentView = 'vocab';
    this.isLevelDropdownOpen = false;

    // Subscribe to Gist sync events to update sync indicator in real-time
    this.unsubscribeSync = gistSync.subscribe(() => {
      const syncBtn = this.container.querySelector('#hud-sync-status .hud-key');
      if (syncBtn) {
        syncBtn.textContent = gistSync.getShortStatusLabel();
      }
    });
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
    const syncLabel = gistSync.getShortStatusLabel();

    const countsContent = state.reviewMode === 'memorized'
      ? `<span class="hud-count-due" id="hud-toggle-mem" role="button" tabindex="0" style="cursor:pointer" title="Keyboard: R">[MEM] <span class="hud-count-num">${stats.memorizedCount}</span> <span class="hud-count-label">${t('learned')}</span> [R]</span>`
      : `<span class="hud-count-due"><span class="hud-count-num">${stats.dueCount}</span> <span class="hud-count-label">${t('due')}</span></span>
         <span class="hud-count-sep">·</span>
         <span class="hud-count-new"><span class="hud-count-num">${stats.newCount}</span> <span class="hud-count-label">${t('new')}</span></span>
         <span class="hud-count-sep">·</span>
         <span class="hud-count-new" id="hud-toggle-mem" role="button" tabindex="0" style="cursor:pointer" title="Keyboard: R"><span class="hud-count-num">${stats.memorizedCount}</span> <span class="hud-count-label">${t('learned')}</span></span>`;

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
                <button class="quick-lvl-chip" id="quick-lvl-settings" title="Settings">[S]</button>
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
              <span class="hud-multiplier-pill" title="${session.streak} Streak: ${session.multiplier}x EXP Multiplier">[${session.multiplier}x]</span>
            ` : (session.streak > 0 ? `
              <span class="hud-streak-pill" title="${session.streak} Streak">[${session.streak}]</span>
            ` : '')}
          </div>
        </div>

        <nav class="hud-nav" aria-label="Main Navigation">
          <button class="hud-nav-item ${this.currentView === 'vocab' ? 'active' : ''}" id="nav-btn-vocab" data-key="v" title="Keyboard: V">
            <span class="hud-key">[V]</span><span class="hud-label">${t('hud_vocab') ? t('hud_vocab').replace(/\[V\]\s*/, '') : 'Vocab'}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'memorize' ? 'active' : ''}" id="nav-btn-memorize" data-key="m" title="Keyboard: M">
            <span class="hud-key">[M]</span><span class="hud-label">${t('hud_memorize') ? t('hud_memorize').replace(/\[M\]\s*/, '') : 'Sprint'}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'quiz' ? 'active' : ''}" id="nav-btn-quiz" data-key="q" title="Keyboard: Q">
            <span class="hud-key">[Q]</span><span class="hud-label">${t('hud_quiz') ? t('hud_quiz').replace(/\[Q\]\s*/, '') : 'Quiz'}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'lexicon' ? 'active' : ''}" id="nav-btn-lexicon" data-key="l" title="Keyboard: L">
            <span class="hud-key">[L]</span><span class="hud-label">${t('hud_lexicon') ? t('hud_lexicon').replace(/\[L\]\s*/, '') : 'Lexicon'}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'grammar' ? 'active' : ''}" id="nav-btn-grammar" data-key="g" title="Keyboard: G">
            <span class="hud-key">[G]</span><span class="hud-label">${t('hud_grammar') ? t('hud_grammar').replace(/\[G\]\s*/, '') : 'Grammar'}</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'notes' ? 'active' : ''}" id="nav-btn-notes" data-key="n" title="Keyboard: N">
            <span class="hud-key">[N]</span><span class="hud-label">Notes</span>
          </button>
          <button class="hud-nav-item ${this.currentView === 'media' ? 'active' : ''}" id="nav-btn-media" data-key="i" title="Keyboard: I">
            <span class="hud-key">[I]</span><span class="hud-label">${t('hud_media') ? t('hud_media').replace(/\[[MI]\]\s*/, '') : 'Media'}</span>
          </button>
          <button class="hud-nav-item" id="nav-btn-pip" data-key="p" title="Toggle Floating Grammar PiP [P]">
            <span class="hud-key">[P]</span><span class="hud-label">PiP</span>
          </button>
          <button class="hud-nav-item hud-sync-btn" id="hud-sync-status" title="GitHub Gist Cloud Sync">
            <span class="hud-key">${syncLabel}</span>
          </button>
          <button class="hud-nav-item hud-theme-btn" id="nav-btn-theme" title="Toggle Theme [T]" aria-label="Toggle Theme">
            <span class="hud-key">[T]</span>
          </button>
          <button class="hud-nav-item hud-settings-btn ${this.currentView === 'settings' ? 'active' : ''}" id="nav-btn-settings" data-key="s" title="Settings (Keyboard: S)" aria-label="Settings">
            <span class="hud-key">[S]</span><span class="hud-label">${t('hud_settings') ? t('hud_settings').replace(/\[S\]\s*/, '') : 'Settings'}</span>
          </button>
          <button class="hud-nav-item hud-help-btn" id="nav-btn-help" data-key="?" title="Keyboard: ?">
            <span class="hud-key">[?]</span>
          </button>
        </nav>
      </div>

      <!-- Container for Floating EXP Particles -->
      <div id="exp-floating-container" class="exp-floating-container" aria-hidden="true"></div>

      <!-- Mobile Bottom Navigation Bar: Full 8-Module Typographic Coverage -->
      <nav class="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
        <button class="mobile-nav-tab ${this.currentView === 'vocab' ? 'active' : ''}" data-target="vocab">
          <span class="tab-key">[V]</span>
          <span class="tab-label">Vocab</span>
        </button>
        <button class="mobile-nav-tab ${this.currentView === 'memorize' ? 'active' : ''}" data-target="memorize">
          <span class="tab-key">[M]</span>
          <span class="tab-label">Sprint</span>
        </button>
        <button class="mobile-nav-tab ${this.currentView === 'quiz' ? 'active' : ''}" data-target="quiz">
          <span class="tab-key">[Q]</span>
          <span class="tab-label">Quiz</span>
        </button>
        <button class="mobile-nav-tab ${this.currentView === 'lexicon' ? 'active' : ''}" data-target="lexicon">
          <span class="tab-key">[L]</span>
          <span class="tab-label">Lexicon</span>
        </button>
        <button class="mobile-nav-tab ${this.currentView === 'grammar' ? 'active' : ''}" data-target="grammar">
          <span class="tab-key">[G]</span>
          <span class="tab-label">Grammar</span>
        </button>
        <button class="mobile-nav-tab ${this.currentView === 'notes' ? 'active' : ''}" data-target="notes">
          <span class="tab-key">[N]</span>
          <span class="tab-label">Notes</span>
        </button>
        <button class="mobile-nav-tab ${this.currentView === 'media' ? 'active' : ''}" data-target="media">
          <span class="tab-key">[I]</span>
          <span class="tab-label">Media</span>
        </button>
        <button class="mobile-nav-tab ${this.currentView === 'pip' ? 'active' : ''}" data-target="pip">
          <span class="tab-key">[P]</span>
          <span class="tab-label">PiP</span>
        </button>
      </nav>
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

    // Quick level dropdown items
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

    // Quick level settings shortcut
    this.container.querySelector('#quick-lvl-settings')?.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playClick();
      this.isLevelDropdownOpen = false;
      this.render();
      if (typeof this.onNavigate === 'function') {
        this.onNavigate('settings');
      }
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

    // Sync button in header: click to open settings or sync
    this.container.querySelector('#hud-sync-status')?.addEventListener('click', async (e) => {
      sound.playClick();
      if (!gistSync.isConnected() || e.shiftKey) {
        if (typeof this.onNavigate === 'function') {
          this.onNavigate('settings');
        }
      } else {
        try {
          await gistSync.push();
        } catch (err) {
          console.warn('Manual sync error:', err);
        }
      }
    });

    // Theme Switcher Button
    this.container.querySelector('#nav-btn-theme')?.addEventListener('click', () => {
      sound.playClick();
      if (typeof this.onToggleTheme === 'function') {
        this.onToggleTheme();
      }
    });

    // PiP Button in header
    this.container.querySelector('#nav-btn-pip')?.addEventListener('click', () => {
      sound.playClick();
      grammarPip.toggle();
    });

    // Navigation buttons in header
    const navActions = [
      ['#nav-btn-vocab', 'vocab'],
      ['#nav-btn-memorize', 'memorize'],
      ['#nav-btn-quiz', 'quiz'],
      ['#nav-btn-lexicon', 'lexicon'],
      ['#nav-btn-grammar', 'grammar'],
      ['#nav-btn-notes', 'notes'],
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

    // Mobile Bottom Navigation Tabs (all 8 items)
    this.container.querySelectorAll('.mobile-nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        sound.playClick();
        const target = tab.getAttribute('data-target');
        if (target === 'pip') {
          grammarPip.toggle();
        } else if (target && typeof this.onNavigate === 'function') {
          this.onNavigate(target);
        }
      });
    });
  }
}
