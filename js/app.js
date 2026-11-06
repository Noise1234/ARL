/**
 * ARL - Application Bootstrap & Orchestrator
 * Connects pure state, keyboard FSM, and tactile views.
 */

import { state } from './state.js';
import { keyboard, KeyboardState } from './keyboard.js';
import { TopHudView } from './views/hud.js';
import { StudyView } from './views/study.js';
import { MemorizeView } from './views/memorize.js';
import { QuizView } from './views/quiz.js';
import { LexiconView } from './views/lexicon.js';
import { GrammarView } from './views/grammar.js';
import { MediaView } from './views/media.js';
import { SettingsModalView } from './views/settings.js';
import { HelpModalView } from './views/help.js';
import { ManualWordEntryModal } from './manual-entry.js';
import { grammarPip } from './grammar-pip.js';
import { gistSync } from './sync.js';
import { telemetry } from './telemetry.js';
import { StatsView } from './views/stats.js';
import { SyncModalView } from './views/sync-modal.js';

class ARLApp {
  constructor() {
    this.currentView = 'vocab'; // 'vocab' | 'memorize' | 'quiz' | 'lexicon' | 'grammar' | 'media' | 'stats'
    this.isSettingsOpen = false;
    this.isHelpOpen = false;
    this.isSyncModalOpen = false;
    this.theme = 'dark';

    this.hudView = null;
    this.studyView = null;
    this.memorizeView = null;
    this.quizView = null;
    this.lexiconView = null;
    this.grammarView = null;
    this.mediaView = null;
    this.statsView = null;
    this.settingsView = null;
    this.helpView = null;
    this.syncModal = null;
    this.manualEntryModal = null;
  }

  async init() {
    // 1. Service Worker registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then((reg) => {
          if (reg) reg.update();
        }).catch(err => {
          console.warn('SW registration failed:', err);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Automatically reload once when new service worker takes over if needed
        if (!window.__reloadedBySw) {
          window.__reloadedBySw = true;
          window.location.reload();
        }
      });
    }

    // 2. Theme Initialization
    try {
      this.theme = localStorage.getItem('arl_theme') || 'dark';
    } catch (e) {
      this.theme = 'dark';
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-theme', this.theme);
    }

    // 3. Initialize application state and telemetry
    await state.init();
    await telemetry.init();

    // 4. Mount layout containers
    this.renderLayout();

    // 5. Instantiate Views
    const hudMount = document.getElementById('hud-mount');
    const mainMount = document.getElementById('main-mount');
    const settingsMount = document.getElementById('settings-mount');
    const modalMount = document.getElementById('modal-mount');

    this.hudView = new TopHudView(
      hudMount,
      (viewName) => this.navigateTo(viewName),
      () => this.toggleTheme()
    );
    this.studyView = new StudyView(mainMount);
    this.memorizeView = new MemorizeView(mainMount, (viewName) => this.navigateTo(viewName));
    this.quizView = new QuizView(mainMount, (viewName) => this.navigateTo(viewName));
    this.lexiconView = new LexiconView(
      mainMount,
      (viewName) => this.navigateTo(viewName),
      () => this.openAddWordModal()
    );
    this.grammarView = new GrammarView(mainMount, (viewName) => this.navigateTo(viewName));
    this.mediaView = new MediaView(mainMount, (viewName) => this.navigateTo(viewName));
    this.statsView = new StatsView(mainMount, (viewName) => this.navigateTo(viewName));
    this.settingsView = new SettingsModalView(settingsMount, () => {
      this.isSettingsOpen = false;
      this.hudView.setActiveView(this.currentView);
      this.renderCurrentView();
    });
    this.helpView = new HelpModalView(modalMount, () => {
      this.isHelpOpen = false;
    });
    this.syncModal = new SyncModalView(modalMount, () => {
      this.isSyncModalOpen = false;
    });
    this.manualEntryModal = new ManualWordEntryModal(modalMount, () => {
      this.renderCurrentView();
    });

    // 6. Mount Floating Grammar PiP Singleton
    grammarPip.mount();

    // 7. Connect Keyboard Router Actions
    this.setupKeyboardActions();
    keyboard.init();

    // 8. Subscribe to State Changes (Safe for in-progress grammar drills)
    state.subscribe(() => {
      this.hudView.render();
      if (this.isSettingsOpen) {
        this.settingsView.render();
        return;
      }
      // If user is inside an active grammar topic drill or sandbox, do not reload/wipe the view!
      if (this.currentView === 'grammar' && this.grammarView.activeTopic) {
        return;
      }
      this.renderCurrentView();
    });

    // 9. Initial render
    this.hudView.render();
    this.renderCurrentView();

    // 10. Startup Auto-Sync with GitHub Gist
    gistSync.autoPull();
  }

  renderLayout() {
    const root = document.getElementById('app');
    root.innerHTML = `
      <header id="hud-mount" class="hud-container"></header>
      <main id="main-mount" class="main-container" role="main"></main>
      <div id="settings-mount"></div>
      <div id="modal-mount"></div>
    `;
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem('arl_theme', this.theme);
    } catch (e) {}
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-theme', this.theme);
    }
    this.hudView.render();
  }

  navigateTo(viewName) {
    state.stopAudio();
    if (viewName === 'settings') {
      this.toggleSettings();
      return;
    }
    if (viewName === 'help') {
      this.toggleHelp();
      return;
    }
    if (viewName === 'sync' || viewName === 'sync-modal') {
      this.openSyncModal();
      return;
    }

    if (this.isSettingsOpen) {
      this.settingsView.close();
    }
    if (this.isHelpOpen) {
      this.helpView.close();
    }
    if (this.isSyncModalOpen) {
      this.syncModal.hide();
    }

    this.currentView = viewName;
    this.hudView.setActiveView(viewName);
    this.renderCurrentView();
  }

  async renderCurrentView() {
    telemetry.setActiveSection(this.currentView === 'memorize' ? 'sprint' : this.currentView);

    switch (this.currentView) {
      case 'vocab':
        this.studyView.render();
        break;
      case 'memorize':
        this.memorizeView.render();
        break;
      case 'quiz':
        this.quizView.render();
        break;
      case 'lexicon':
        this.lexiconView.render();
        break;
      case 'grammar':
        // Only load data if not loaded or if language changed
        if (this.grammarView.folders.length === 0 || this.grammarView.loadedLang !== state.targetLang) {
          await this.grammarView.loadData();
        }
        this.grammarView.render();
        break;
      case 'media':
        await this.mediaView.loadData();
        this.mediaView.render();
        break;
      case 'stats':
        this.statsView.render();
        break;
    }
  }

  openSyncModal() {
    state.stopAudio();
    this.isSyncModalOpen = true;
    this.syncModal.show();
  }

  toggleSettings() {
    state.stopAudio();
    if (this.isSettingsOpen) {
      this.settingsView.close();
    } else {
      this.isSettingsOpen = true;
      this.hudView.setActiveView('settings');
      this.settingsView.show();
    }
  }

  toggleHelp() {
    if (this.isHelpOpen) {
      this.helpView.close();
    } else {
      this.isHelpOpen = true;
      this.helpView.show();
    }
  }

  openAddWordModal() {
    this.manualEntryModal.show();
  }

  setupKeyboardActions() {
    // Global Navigation
    keyboard.on('nav_vocab', () => this.navigateTo('vocab'));
    keyboard.on('nav_memorize', () => this.navigateTo('memorize'));
    keyboard.on('nav_quiz', () => this.navigateTo('quiz'));
    keyboard.on('nav_lexicon', () => this.navigateTo('lexicon'));
    keyboard.on('nav_grammar', () => this.navigateTo('grammar'));
    keyboard.on('nav_media', () => this.navigateTo('media'));
    keyboard.on('nav_stats', () => this.navigateTo('stats'));
    keyboard.on('toggle_sync', () => this.openSyncModal());
    keyboard.on('toggle_pip', () => grammarPip.toggle());
    keyboard.on('toggle_settings', () => this.toggleSettings());
    keyboard.on('toggle_help', () => this.toggleHelp());
    keyboard.on('add_word', () => this.openAddWordModal());

    // Study View Actions
    keyboard.on('study_reveal', () => {
      if (this.currentView === 'vocab') {
        const card = state.getCurrentCard();
        if (!card) {
          state.buildStudyQueue();
        } else {
          state.revealCard();
        }
      }
    });
    keyboard.on('study_hint', () => {
      if (this.currentView === 'vocab') {
        state.toggleHint();
      }
    });
    keyboard.on('study_grade', (grade) => {
      if (this.currentView === 'vocab' && state.isCardRevealed) {
        state.gradeCurrentCard(grade);
        gistSync.scheduleAutoPush();
      }
    });
    keyboard.on('study_audio', () => {
      if (this.currentView === 'vocab' && state.isCardRevealed) {
        state.playAudio();
      }
    });
    keyboard.on('study_toggle_memorized', () => {
      if (this.currentView === 'vocab') {
        state.toggleReviewMode();
      }
    });
    keyboard.on('study_reset_card', () => {
      if (this.currentView === 'vocab') {
        state.resetCurrentCard();
      }
    });

    // Settings Actions
    keyboard.on('close_settings', () => {
      if (this.isSettingsOpen) {
        this.settingsView.close();
      }
      if (this.isHelpOpen) {
        this.helpView.close();
      }
    });
    keyboard.on('settings_toggle_lang', async () => {
      if (this.isSettingsOpen) {
        await state.toggleTargetLanguage();
        this.settingsView.render();
      }
    });
    keyboard.on('settings_cycle_i18n', async () => {
      if (this.isSettingsOpen) {
        await state.cycleInterfaceLanguage();
        this.settingsView.render();
      }
    });
    keyboard.on('settings_set_level', async (levelNum) => {
      if (this.isSettingsOpen) {
        const lvls = ['a1', 'a2', 'b1', 'b2'];
        const targetLvl = lvls[levelNum - 1];
        if (targetLvl) {
          await state.setCefrLevel(targetLvl);
          this.settingsView.render();
        }
      }
    });
    keyboard.on('settings_export', () => {
      if (this.isSettingsOpen) {
        this.settingsView.exportBackup();
      }
    });

    // Grammar View Actions
    keyboard.on('grammar_set_folder', (folderNum) => {
      if (this.currentView === 'grammar') {
        this.grammarView.setFolderIndex(folderNum - 1);
      }
    });
    keyboard.on('grammar_toggle_redemittel', () => {
      if (this.currentView === 'grammar') {
        this.grammarView.toggleRedemittel();
      }
    });
    keyboard.on('grammar_next_topic', () => {
      if (this.currentView === 'grammar' && !this.grammarView.activeTopic) {
        this.grammarView.nextTopic();
      }
    });
    keyboard.on('grammar_prev_topic', () => {
      if (this.currentView === 'grammar' && !this.grammarView.activeTopic) {
        this.grammarView.prevTopic();
      }
    });
    keyboard.on('grammar_open_topic', () => {
      if (this.currentView === 'grammar' && !this.grammarView.activeTopic) {
        this.grammarView.openSelectedTopic();
      }
    });
    keyboard.on('grammar_back_to_list', () => {
      if (this.currentView === 'grammar' && this.grammarView.activeTopic) {
        this.grammarView.activeTopic = null;
        this.grammarView.render();
      }
    });
    keyboard.on('grammar_focus_search', () => {
      if (this.currentView === 'grammar' && !this.grammarView.activeTopic) {
        this.grammarView.focusSearch();
      }
    });
    keyboard.on('grammar_drill_topic', () => {
      if (this.currentView === 'grammar') {
        this.navigateTo('vocab');
      }
    });

    // Media View Actions
    keyboard.on('media_filter_level', (levelNum) => {
      if (this.currentView === 'media') {
        const lvls = ['A1', 'A2', 'B1', 'B2'];
        this.mediaView.setLevelFilter(lvls[levelNum - 1]);
      }
    });
    keyboard.on('media_filter_type', (type) => {
      if (this.currentView === 'media') {
        this.mediaView.setTypeFilter(type);
      }
    });
  }
}

// Bootstrap
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const app = new ARLApp();
    app.init();
  });
}
