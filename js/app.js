import { state } from './state.js';
import { db } from './db.js';
import { FlashcardDeck } from './deck.js';
import { QuizEngine } from './quiz.js';
import { RetentionGate } from './retention.js';
import { ManualWordEntryModal } from './manual-entry.js';

class ARLApp {
  constructor() {
    this.currentMode = 'dashboard';
    this.activeDeck = null;
    this.activeQuiz = null;
    this.deferredPrompt = null;
    this.searchTerm = '';
    this.selectedTopicFilter = 'all';
    this.selectedStatusFilter = 'all';
  }

  async init() {
    this.setupPWAInstall();
    await state.loadInitialData();

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
          console.warn('Service worker registration failed:', err);
        });
      });
    }

    // Subscribe to state changes to update header stats
    state.subscribe(() => this.updateHeaderStats());

    // Render main layout
    this.renderLayout();
    this.updateHeaderStats();

    // Check daily retention gate
    const gateContainer = document.getElementById('gate-mount');
    const retentionGate = new RetentionGate(gateContainer, (result) => {
      this.showToast('Retention-Check bestanden! Streak erhöht.');
      this.renderDashboard();
    });

    const isGateTriggered = retentionGate.checkAndLaunch();
    if (!isGateTriggered) {
      this.renderDashboard();
    }
  }

  setupPWAInstall() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const installBtn = document.getElementById('btn-install-pwa');
      if (installBtn) {
        installBtn.style.display = 'inline-flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      const installBtn = document.getElementById('btn-install-pwa');
      if (installBtn) installBtn.style.display = 'none';
      this.showToast('ARL wurde erfolgreich installiert.');
    });
  }

  renderLayout() {
    const appEl = document.getElementById('app');
    appEl.innerHTML = `
      <!-- Header -->
      <header class="app-header">
        <div class="header-left" id="btn-home-logo" role="button" tabindex="0">
          <svg class="header-logo" viewBox="0 0 512 512" width="28" height="28">
            <rect width="512" height="512" fill="#000000"/>
            <circle cx="256" cy="256" r="148" fill="none" stroke="#FFFFFF" stroke-width="24"/>
            <line x1="108" y1="256" x2="404" y2="256" stroke="#FFFFFF" stroke-width="24"/>
            <line x1="256" y1="108" x2="256" y2="404" stroke="#FFFFFF" stroke-width="24"/>
            <ellipse cx="256" cy="256" rx="74" ry="148" fill="none" stroke="#FFFFFF" stroke-width="24"/>
          </svg>
          <span class="app-title">ARL</span>
          <span class="app-badge">B1 DE-MN</span>
        </div>

        <div class="header-center">
          <div class="streak-indicator" id="header-streak-badge" title="Tage Streak">
            <span class="streak-fire">⚡</span>
            <span class="streak-count" id="header-streak-val">0</span>
          </div>
        </div>

        <div class="header-right">
          <button class="btn btn-sm btn-subtle" id="btn-install-pwa" style="display:none;" title="Als App installieren">
            <span>📥 App</span>
          </button>
          <button class="btn btn-sm btn-subtle" id="btn-add-word" title="Neue Vokabel hinzufügen">
            <span>+ Vokabel</span>
          </button>
          <button class="btn btn-sm btn-subtle" id="btn-open-backup" title="Daten sichern / wiederherstellen">
            <span>⚙ Backup</span>
          </button>
        </div>
      </header>

      <!-- Main Dynamic Content Area -->
      <main class="app-main" id="main-content"></main>

      <!-- Gate Overlay Mount -->
      <div id="gate-mount"></div>

      <!-- Modal Mount -->
      <div id="modal-mount"></div>

      <!-- Toast Container -->
      <div id="toast-container" class="toast-container"></div>
    `;

    // Header listeners
    document.getElementById('btn-home-logo').addEventListener('click', () => {
      this.renderDashboard();
    });

    document.getElementById('btn-add-word').addEventListener('click', () => {
      this.openCustomWordModal();
    });

    document.getElementById('btn-open-backup').addEventListener('click', () => {
      this.openBackupModal();
    });

    const installBtn = document.getElementById('btn-install-pwa');
    installBtn.addEventListener('click', async () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installBtn.style.display = 'none';
        }
        this.deferredPrompt = null;
      }
    });
  }

  updateHeaderStats() {
    const stats = state.getProgressStats();
    const streakEl = document.getElementById('header-streak-val');
    if (streakEl) {
      streakEl.textContent = `${stats.streak}d`;
    }
  }

  renderDashboard() {
    this.currentMode = 'dashboard';
    const mainEl = document.getElementById('main-content');
    const stats = state.getProgressStats();

    mainEl.innerHTML = `
      <div class="dashboard-container">
        
        <!-- Welcome Focus Banner -->
        <div class="focus-banner">
          <div class="banner-title">Goethe B1 Wortschatz</div>
          <div class="banner-desc">Ultra-minimalistisches Lernen mit aktivem Abruf & Spaced Repetition.</div>
        </div>

        <!-- Metric Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Gemerkt</span>
              <span class="metric-percent">${stats.percent}%</span>
            </div>
            <div class="metric-value">${stats.memorized} <span class="metric-total">/ ${stats.total}</span></div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${stats.percent}%;"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">In Wiederholung</span>
            </div>
            <div class="metric-value">${stats.learning}</div>
            <div class="metric-hint">Noch zu festigen</div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-label">Tages-Streak</span>
            </div>
            <div class="metric-value">⚡ ${stats.streak} <span class="metric-total">Tage</span></div>
            <div class="metric-hint">${state.stats.lastRetentionCheckDate === state.getTodayStr() ? '✓ Heute verifiziert' : 'Tagescheck ausstehend'}</div>
          </div>
        </div>

        <!-- Mode Actions -->
        <div class="modes-grid">
          <!-- Flashcards Mode -->
          <div class="mode-card">
            <div class="mode-icon">🂠</div>
            <div class="mode-info">
              <h3 class="mode-title">Karteikarten-Modus</h3>
              <p class="mode-desc">Deutsch → Mongolisch mit Beispielsätzen, 3D-Flip & Gestensteuerung.</p>
            </div>
            <div class="mode-options">
              <label for="batch-select" class="mode-select-label">Stapelgröße:</label>
              <select id="batch-select" class="batch-select">
                <option value="10">10 Wörter</option>
                <option value="15" selected>15 Wörter</option>
                <option value="20">20 Wörter</option>
              </select>
            </div>
            <button class="btn btn-primary btn-block btn-start-batch" id="btn-start-batch">
              <span>Stapel starten →</span>
            </button>
          </div>

          <!-- Reverse Exam Mode -->
          <div class="mode-card">
            <div class="mode-icon">⚡</div>
            <div class="mode-info">
              <h3 class="mode-title">Reverse-Examen</h3>
              <p class="mode-desc">Mongolisch → Deutsch (4 Multiple-Choice Optionen mit Zifferntasten 1–4).</p>
            </div>
            <div class="mode-options">
              <span class="mode-hint-text">Aktiver Abruf mit Fehlerschleife</span>
            </div>
            <button class="btn btn-secondary btn-block btn-start-exam" id="btn-start-exam">
              <span>Schnell-Examen starten →</span>
            </button>
          </div>
        </div>

        <!-- Full Vocabulary Explorer & Dictionary Section -->
        <div class="explorer-section">
          <div class="explorer-header">
            <h3 class="explorer-title">B1 Vokabeldatenbank (${state.words.length})</h3>
            <div class="explorer-controls">
              <input type="text" id="dict-search" class="search-input" placeholder="Wort suchen (DE oder MN)..." autocomplete="off" />
              <select id="dict-pos-filter" class="filter-select">
                <option value="all">Alle Wortarten</option>
                <option value="noun">Nomen</option>
                <option value="verb">Verben</option>
                <option value="adjective">Adjektive</option>
                <option value="connector">Konnektoren</option>
              </select>
            </div>
          </div>

          <div class="dictionary-list" id="dict-list"></div>
        </div>

      </div>
    `;

    // Event handlers
    const batchSelect = mainEl.querySelector('#batch-select');
    mainEl.querySelector('#btn-start-batch').addEventListener('click', () => {
      const size = parseInt(batchSelect.value, 10);
      this.startFlashcardSession(size);
    });

    mainEl.querySelector('#btn-start-exam').addEventListener('click', () => {
      this.startExamSession();
    });

    const searchInput = mainEl.querySelector('#dict-search');
    const filterSelect = mainEl.querySelector('#dict-pos-filter');

    const updateDict = () => {
      this.searchTerm = searchInput.value.toLowerCase().trim();
      this.selectedTopicFilter = filterSelect.value;
      this.renderDictionaryList();
    };

    searchInput.addEventListener('input', updateDict);
    filterSelect.addEventListener('change', updateDict);
    this.renderDictionaryList();
  }

  renderDictionaryList() {
    const listEl = document.getElementById('dict-list');
    if (!listEl) return;

    let filtered = state.words;
    if (this.selectedTopicFilter !== 'all') {
      filtered = filtered.filter(w => w.pos === this.selectedTopicFilter);
    }
    if (this.searchTerm) {
      filtered = filtered.filter(w => 
        w.word.toLowerCase().includes(this.searchTerm) || 
        w.mn.toLowerCase().includes(this.searchTerm) ||
        (w.display && w.display.toLowerCase().includes(this.searchTerm))
      );
    }

    // Limit to 50 for smooth scrolling performance
    const renderChunk = filtered.slice(0, 50);

    if (renderChunk.length === 0) {
      listEl.innerHTML = `<div class="empty-state">Keine passenden Vokabeln gefunden.</div>`;
      return;
    }

    listEl.innerHTML = renderChunk.map(w => {
      const prog = state.progressMap.get(w.id);
      const isMemorized = prog && prog.status === 'memorized';
      const isLearning = prog && prog.status === 'learning';
      const statusBadge = isMemorized 
        ? `<span class="badge-status status-memorized">✓ Gemerkt</span>` 
        : (isLearning ? `<span class="badge-status status-learning">↺ Im Lernen</span>` : `<span class="badge-status status-new">Neu</span>`);

      let disp = w.display || w.word;
      if (w.pos === 'noun' && w.article) {
        disp = `<span class="article-text">${w.article}</span> ${w.word}${w.plural ? ` (${w.plural})` : ''}`;
      }

      return `
        <div class="dict-item">
          <div class="dict-item-de">
            <span class="dict-word">${disp}</span>
            <span class="dict-pos">${w.pos}</span>
          </div>
          <div class="dict-item-mn">
            <span class="dict-mn-word">${w.mn}</span>
            ${w.example_de ? `<span class="dict-example" title="${w.example_mn || ''}">„${w.example_de}“</span>` : ''}
          </div>
          <div class="dict-item-status">
            ${statusBadge}
          </div>
        </div>
      `;
    }).join('');

    if (filtered.length > 50) {
      listEl.innerHTML += `<div class="list-hint-more">Zeige die ersten 50 von ${filtered.length} Ergebnissen...</div>`;
    }
  }

  startFlashcardSession(batchSize = 15) {
    this.currentMode = 'flashcards';
    const mainEl = document.getElementById('main-content');
    const batch = state.getBatchWords(batchSize);

    if (batch.length === 0) {
      this.showToast('Alle Vokabeln bereits abgeschlossen!');
      this.renderDashboard();
      return;
    }

    this.activeDeck = new FlashcardDeck(mainEl, (results, launchExam) => {
      this.activeDeck = null;
      if (launchExam) {
        // Trigger reverse exam testing this newly studied batch!
        const wordsToTest = results.map(r => r.word);
        this.startExamSession(wordsToTest);
      } else {
        this.renderDashboard();
      }
    });

    this.activeDeck.start(batch);
  }

  startExamSession(customBatch = null) {
    this.currentMode = 'exam';
    const mainEl = document.getElementById('main-content');
    const batch = customBatch || state.getBatchWords(15);

    if (batch.length === 0) {
      this.showToast('Keine Wörter zum Testen vorhanden.');
      this.renderDashboard();
      return;
    }

    this.activeQuiz = new QuizEngine(mainEl, {
      title: 'Post-Study Reverse Exam',
      subtitle: 'Mongolisch → Deutsch',
      onFinish: (result) => {
        this.activeQuiz = null;
        this.renderDashboard();
      }
    });

    this.activeQuiz.start(batch);
  }

  openCustomWordModal() {
    const modalMount = document.getElementById('modal-mount');
    const modal = new ManualWordEntryModal(modalMount, (newWord) => {
      this.showToast(`Vokabel "${newWord.word}" erfolgreich hinzugefügt!`);
      this.renderDashboard();
    });
    modal.show();
  }

  openBackupModal() {
    const modalMount = document.getElementById('modal-mount');
    modalMount.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">Daten-Backup & Wiederherstellung</h3>
            <button class="btn-icon btn-close-modal">✕</button>
          </div>

          <div class="backup-modal-body">
            <p class="backup-desc">
              Alle deine gelernten Wörter, Streaks, Historie und eigene Vokabeln sind lokal in IndexedDB gespeichert.
            </p>

            <div class="backup-action-card">
              <div class="backup-action-title">Backup exportieren</div>
              <div class="backup-action-desc">Lade deine Lernstände als JSON-Datei herunter.</div>
              <button class="btn btn-primary btn-block" id="btn-export-backup">
                <span>Backup herunterladen (JSON)</span>
              </button>
            </div>

            <div class="backup-action-card">
              <div class="backup-action-title">Backup importieren</div>
              <div class="backup-action-desc">Stelle einen zuvor exportierten ARL-Spielstand wieder her.</div>
              <input type="file" id="backup-file-input" accept=".json" style="display:none;" />
              <button class="btn btn-secondary btn-block" id="btn-import-backup">
                <span>Datei auswählen & importieren</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => { modalMount.innerHTML = ''; };
    modalMount.querySelector('.btn-close-modal').addEventListener('click', closeModal);
    modalMount.querySelector('.modal-backdrop').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Export Handler
    modalMount.querySelector('#btn-export-backup').addEventListener('click', async () => {
      const jsonStr = await db.exportBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arl_backup_${state.getTodayStr()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Backup erfolgreich exportiert!');
    });

    // Import Handler
    const fileInput = modalMount.querySelector('#backup-file-input');
    modalMount.querySelector('#btn-import-backup').addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          await db.importBackup(evt.target.result);
          await state.loadInitialData();
          closeModal();
          this.showToast('Backup erfolgreich importiert!');
          this.renderDashboard();
        } catch (err) {
          alert('Fehler beim Importieren: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  const app = new ARLApp();
  app.init();
});
