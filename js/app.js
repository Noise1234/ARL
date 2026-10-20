/**
 * ARL - Application Bootstrap & Orchestrator
 * Connects pure state, keyboard FSM, and minimal views.
 */

import { state } from './state.js';
import { keyboard, KeyboardState } from './keyboard.js';
import { TopHudView } from './views/hud.js';
import { StudyView } from './views/study.js';
import { GrammarView } from './views/grammar.js';
import { MediaView } from './views/media.js';
import { SettingsModalView } from './views/settings.js';

class ARLApp {
  constructor() {
    this.currentView = 'vocab'; // 'vocab' | 'grammar' | 'media'
    this.isSettingsOpen = false;
    this.hudView = null;
    this.studyView = null;
    this.grammarView = null;
    this.mediaView = null;
    this.settingsView = null;
  }

  async init() {
    // 1. Service Worker registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
          console.warn('SW registration failed:', err);
        });
      });
    }

    // 2. Initialize application state
    await state.init();

    // 3. Mount layout containers
    this.renderLayout();

    // 4. Instantiate Views
    const hudMount = document.getElementById('hud-mount');
    const mainMount = document.getElementById('main-mount');
    const settingsMount = document.getElementById('settings-mount');

    this.hudView = new TopHudView(hudMount, (viewName) => this.navigateTo(viewName));
    this.studyView = new StudyView(mainMount);
    this.grammarView = new GrammarView(mainMount, (viewName) => this.navigateTo(viewName));
    this.mediaView = new MediaView(mainMount, (viewName) => this.navigateTo(viewName));
    this.settingsView = new SettingsModalView(settingsMount, () => {
      this.isSettingsOpen = false;
      this.hudView.setActiveView(this.currentView);
      this.renderCurrentView();
    });

    // 5. Connect Keyboard Router Actions
    this.setupKeyboardActions();
    keyboard.init();

    // 6. Subscribe to State Changes
    state.subscribe(() => {
      this.hudView.render();
      if (!this.isSettingsOpen) {
        this.renderCurrentView();
      } else {
        this.settingsView.render();
      }
    });

    // 7. Initial render
    this.hudView.render();
    this.renderCurrentView();
  }

  renderLayout() {
    const root = document.getElementById('app');
    root.innerHTML = `
      <header id="hud-mount" class="hud-container"></header>
      <main id="main-mount" class="main-container" role="main"></main>
      <div id="settings-mount"></div>
    `;
  }

  navigateTo(viewName) {
    state.stopAudio();
    if (viewName === 'settings') {
      this.toggleSettings();
      return;
    }

    if (this.isSettingsOpen) {
      this.settingsView.close();
    }

    this.currentView = viewName;
    this.hudView.setActiveView(viewName);
    this.renderCurrentView();
  }

  async renderCurrentView() {
    switch (this.currentView) {
      case 'vocab':
        this.studyView.render();
        break;
      case 'grammar':
        await this.grammarView.loadData();
        this.grammarView.render();
        break;
      case 'media':
        await this.mediaView.loadData();
        this.mediaView.render();
        break;
    }
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

  setupKeyboardActions() {
    // Global Navigation
    keyboard.on('nav_vocab', () => this.navigateTo('vocab'));
    keyboard.on('nav_grammar', () => this.navigateTo('grammar'));
    keyboard.on('nav_media', () => this.navigateTo('media'));
    keyboard.on('toggle_settings', () => this.toggleSettings());

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
      }
    });
    keyboard.on('study_audio', () => {
      if (this.currentView === 'vocab' && state.isCardRevealed) {
        state.playAudio();
      }
    });

    // Settings Actions
    keyboard.on('close_settings', () => {
      if (this.isSettingsOpen) {
        this.settingsView.close();
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
        this.grammarView.backToList();
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
window.addEventListener('DOMContentLoaded', () => {
  const app = new ARLApp();
  app.init();
});
