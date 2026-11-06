/**
 * ARL - Structured Grammar & Redemittel View with 20-Sentence Drill Engine & Floating PiP
 * 4 Proficiency Levels (A1 - B2) with 4-part pedagogical layout,
 * Contextual Mini-Wörterbuch (Required Words per sentence),
 * Revealable Answer & Translation Section,
 * Keyless + LocalStorage Hybrid Engine with Word-Level Strikethrough Diff,
 * and Free-form Sentence Sandbox.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { sound } from '../sound.js';
import {
  GeminiClient,
  checkSentenceGrammar,
  getUserAiKey,
  setUserAiKey,
  getAiKeyType
} from '../gemini.js';
import { renderColorCodedDiff, renderWordDiff, escapeHtml } from '../diff.js';
import { grammarPip } from '../grammar-pip.js';
import { telemetry } from '../telemetry.js';

export class GrammarView {
  static activeInstance = null;
  static _delegationInitialized = false;

  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.folders = [];
    this.redemittel = null;
    this.currentFolderIdx = 0;
    this.activeTopic = null;
    this.selectedTopicIdx = 0;
    this.isRedemittelActive = false;
    this.searchQuery = '';
    this.conceptLang = null;
    this.loadedLang = null;

    // 20-Sentence Drill Trainer state
    this.activeDrillIdx = 0;
    this.drillInputs = new Map(); // drillIdx -> string
    this.drillFeedbacks = new Map(); // drillIdx -> feedback object
    this.drillAnswersRevealed = new Set(); // Set of revealed drill indices
    this.isCheckingDrill = false;

    // Free Sandbox state
    this.sandboxText = '';
    this.sandboxFeedback = null;
    this.isCheckingSandbox = false;

    // API Key Vault popover toggle state
    this.isKeyVaultOpen = false;

    GrammarView.activeInstance = this;
    GrammarView.ensureDelegation();
  }

  /**
   * Document-level event delegation ensuring that DOM re-renders
   * never detach event listeners from buttons, inputs, or keycaps.
   */
  static ensureDelegation() {
    if (typeof document === 'undefined' || GrammarView._delegationInitialized) return;
    GrammarView._delegationInitialized = true;

    // Global Click Delegation
    document.addEventListener('click', (e) => {
      const inst = GrammarView.activeInstance;
      if (!inst || !inst.activeTopic) return;

      // 1. Drill Sentence Check Button
      if (e.target.closest('#btn-check-drill-sentence, .btn-check-sentence, [data-action="check-drill"]')) {
        e.preventDefault();
        const drills = inst.activeTopic.drills || [];
        const currentDrill = drills[inst.activeDrillIdx] || null;
        inst.submitDrillSentence(inst.activeTopic, currentDrill);
        return;
      }

      // 2. Sandbox Free Sentence Check Button
      if (e.target.closest('#btn-evaluate-free-sentence, .btn-check-sandbox-sentence, [data-action="check-sandbox"]')) {
        e.preventDefault();
        inst.submitSandboxSentence(inst.activeTopic);
        return;
      }

      // 3. API Key Vault Toggle
      if (e.target.closest('#btn-toggle-key-vault')) {
        e.preventDefault();
        inst.toggleKeyVault();
        return;
      }

      // 4. API Key Save Button
      if (e.target.closest('#btn-save-user-ai-key')) {
        e.preventDefault();
        inst.saveKeyVaultInput();
        return;
      }

      // 5. API Key Clear Button
      if (e.target.closest('#btn-clear-user-ai-key')) {
        e.preventDefault();
        inst.clearKeyVaultInput();
        return;
      }

      // 6. Apply Fix to Input (Drill)
      const applyDrill = e.target.closest('#btn-apply-drill-fix');
      if (applyDrill) {
        e.preventDefault();
        inst.applyDrillFix();
        return;
      }

      // 7. Copy Clean Sentence (Drill)
      const copyDrill = e.target.closest('#btn-copy-drill-fix');
      if (copyDrill) {
        e.preventDefault();
        inst.copyDrillFix();
        return;
      }

      // 8. Apply Fix to Input (Sandbox)
      const applySandbox = e.target.closest('#btn-apply-sandbox-fix');
      if (applySandbox) {
        e.preventDefault();
        inst.applySandboxFix();
        return;
      }

      // 9. Copy Clean Sentence (Sandbox)
      const copySandbox = e.target.closest('#btn-copy-sandbox-fix');
      if (copySandbox) {
        e.preventDefault();
        inst.copySandboxFix();
        return;
      }

      // 10. Toggle Drill Answer Reveal
      if (e.target.closest('#btn-toggle-drill-answer')) {
        e.preventDefault();
        sound.playClick();
        if (inst.drillAnswersRevealed.has(inst.activeDrillIdx)) {
          inst.drillAnswersRevealed.delete(inst.activeDrillIdx);
        } else {
          inst.drillAnswersRevealed.add(inst.activeDrillIdx);
        }
        inst.renderTopicDetail(inst.activeTopic);
        return;
      }

      // 11. Prev Drill Navigation
      if (e.target.closest('#btn-prev-drill')) {
        e.preventDefault();
        if (inst.activeDrillIdx > 0) {
          sound.playClick();
          inst.saveCurrentDrillInput();
          inst.activeDrillIdx--;
          inst.renderTopicDetail(inst.activeTopic);
        }
        return;
      }

      // 12. Next Drill Navigation
      if (e.target.closest('#btn-next-drill')) {
        e.preventDefault();
        const total = (inst.activeTopic.drills || []).length;
        if (inst.activeDrillIdx < total - 1) {
          sound.playClick();
          inst.saveCurrentDrillInput();
          inst.activeDrillIdx++;
          inst.renderTopicDetail(inst.activeTopic);
        }
        return;
      }

      // 13. Step Pills Navigation
      const pill = e.target.closest('.drill-pill-step');
      if (pill) {
        e.preventDefault();
        sound.playClick();
        inst.saveCurrentDrillInput();
        const step = parseInt(pill.getAttribute('data-step'), 10);
        const total = (inst.activeTopic.drills || []).length;
        if (!isNaN(step) && step >= 0 && step < total) {
          inst.activeDrillIdx = step;
          inst.renderTopicDetail(inst.activeTopic);
        }
        return;
      }

      // 14. Special Character Chips (Drill)
      const drillChip = e.target.closest('.drill-char-chip');
      if (drillChip) {
        e.preventDefault();
        const ch = drillChip.getAttribute('data-char');
        const ta = inst.container.querySelector('#drill-sentence-textarea');
        if (ta && ch) {
          const start = ta.selectionStart ?? ta.value.length;
          const end = ta.selectionEnd ?? ta.value.length;
          const val = ta.value;
          ta.value = val.slice(0, start) + ch + val.slice(end);
          ta.selectionStart = ta.selectionEnd = start + ch.length;
          inst.drillInputs.set(inst.activeDrillIdx, ta.value);
          ta.focus();
        }
        return;
      }

      // 15. Special Character Chips (Sandbox)
      const sandboxChip = e.target.closest('.sandbox-char-chip');
      if (sandboxChip) {
        e.preventDefault();
        const ch = sandboxChip.getAttribute('data-char');
        const ta = inst.container.querySelector('#sandbox-textarea');
        if (ta && ch) {
          const start = ta.selectionStart ?? ta.value.length;
          const end = ta.selectionEnd ?? ta.value.length;
          const val = ta.value;
          ta.value = val.slice(0, start) + ch + val.slice(end);
          ta.selectionStart = ta.selectionEnd = start + ch.length;
          inst.sandboxText = ta.value;
          ta.focus();
        }
        return;
      }
    });

    // Global Keydown Delegation: Enter / Ctrl+Enter for Instant Evaluation
    document.addEventListener('keydown', (e) => {
      const inst = GrammarView.activeInstance;
      if (!inst || !inst.activeTopic) return;

      if (e.key === 'Enter') {
        if (e.target && e.target.id === 'drill-sentence-textarea') {
          // Trigger on Ctrl+Enter or plain Enter without Shift
          if (e.ctrlKey || e.metaKey || !e.shiftKey) {
            e.preventDefault();
            const drills = inst.activeTopic.drills || [];
            const currentDrill = drills[inst.activeDrillIdx] || null;
            inst.submitDrillSentence(inst.activeTopic, currentDrill);
          }
        } else if (e.target && e.target.id === 'sandbox-textarea') {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            inst.submitSandboxSentence(inst.activeTopic);
          }
        }
      }
    });
  }

  async loadData(force = false) {
    const lang = state.targetLang;
    if (!force && this.folders.length > 0 && this.loadedLang === lang) {
      return;
    }

    try {
      const gResp = await fetch(`data/${lang}/grammar.json`);
      if (gResp.ok) {
        this.folders = await gResp.json();
        this.loadedLang = lang;
      }
    } catch (e) {
      console.warn('Could not load grammar:', e);
    }

    try {
      const rResp = await fetch(`data/${lang}/redemittel.json`);
      if (rResp.ok) {
        this.redemittel = await rResp.json();
      }
    } catch (e) {
      console.warn('Could not load redemittel:', e);
    }
  }

  setFolderIndex(idx) {
    this.currentFolderIdx = idx;
    this.selectedTopicIdx = 0;
    this.isRedemittelActive = false;
    this.activeTopic = null;
    this.searchQuery = '';
    this.render();
  }

  setRedemittelActive(active = true) {
    this.isRedemittelActive = active;
    this.activeTopic = null;
    this.searchQuery = '';
    this.render();
  }

  getFilteredTopics() {
    if (this.folders.length === 0) return [];
    const folder = this.folders[this.currentFolderIdx];
    if (!folder || !folder.topics) return [];

    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return folder.topics;

    return folder.topics.filter(t => {
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchPattern = (t.pattern || '').toLowerCase().includes(q);
      const matchTrap = (t.common_trap || '').toLowerCase().includes(q);
      const matchConcept = t.core_concept && Object.values(t.core_concept).some(c => (c || '').toLowerCase().includes(q));
      const matchDrills = t.drills && t.drills.some(d =>
        (d.prompt_mn || '').toLowerCase().includes(q) ||
        (d.target || '').toLowerCase().includes(q)
      );
      return matchTitle || matchPattern || matchTrap || matchConcept || matchDrills;
    });
  }

  render() {
    GrammarView.activeInstance = this;

    if (this.folders.length === 0) {
      this.container.innerHTML = `
        <div class="grammar-view-container">
          <div class="grammar-empty-state">
            <div class="empty-icon">⏳</div>
            <div class="empty-text">Loading Grammar Syllabus...</div>
          </div>
        </div>
      `;
      this.loadData().then(() => this.render());
      return;
    }

    if (this.isRedemittelActive) {
      this.renderRedemittel();
      return;
    }

    if (this.activeTopic) {
      this.renderTopicDetail(this.activeTopic);
      return;
    }

    this.renderTopicList();
  }

  renderTopicList() {
    const folder = this.folders[this.currentFolderIdx] || { level: 'A1', topics: [] };
    const topics = this.getFilteredTopics();
    const folderCount = (folder.topics && folder.topics.length) || 0;
    const folderLevel = folder.level || 'A1';

    this.container.innerHTML = `
      <div class="grammar-view-container">
        <!-- Navigation Header -->
        <div class="grammar-nav-bar">
          <div class="grammar-folders-tabs">
            ${this.folders.map((f, i) => `
              <button class="grammar-tab-btn ${i === this.currentFolderIdx && !this.isRedemittelActive ? 'active' : ''}" data-idx="${i}" data-key="${i + 1}">
                <span class="micro-bracket">[${i + 1}]</span> ${f.level}
              </button>
            `).join('')}
            <button class="grammar-tab-btn ${this.isRedemittelActive ? 'active' : ''}" id="btn-tab-redemittel" data-key="r">
              <span class="micro-bracket">[R]</span> ${t('redemittel_tab')}
            </button>
          </div>

          <!-- Quick PiP Launch Button -->
          <button class="btn-pip-quick-launch" id="btn-global-pip-toggle" title="Toggle Floating Grammar PiP Reference">
            [P] Floating PiP
          </button>
        </div>

        <!-- Folder Info & Search Filter -->
        <div class="folder-header-row">
          <div class="folder-header-title">
            <span class="folder-badge">${folderLevel}</span>
            <span class="folder-count-badge">${topics.length} of ${folderCount} Topics</span>
          </div>

          <div class="grammar-search-wrap">
            <input
              type="text"
              id="grammar-search-input"
              class="grammar-search-field"
              placeholder="${t('grammar_search_placeholder') || 'Search topics or formulas [/]...'}"
              value="${this.searchQuery}"
              autocomplete="off"
            />
            ${this.searchQuery ? '<button id="btn-clear-grammar-search" class="search-clear-btn">✕</button>' : ''}
          </div>
        </div>

        <!-- Topics List -->
        <div class="grammar-topics-list">
          ${topics.length === 0 ? `
            <div class="grammar-empty-state">
              <div class="empty-icon">∅</div>
              <div class="empty-text">No grammar topics match your filter.</div>
            </div>
          ` : topics.map((topic, i) => {
            const isSelected = i === this.selectedTopicIdx;
            const drillCount = (topic.drills && topic.drills.length) || 20;
            const stats = telemetry.grammarStats[topic.id] || {};
            const isUnderstood = (stats.bestAccuracyPct >= 80) || Boolean(stats.understoodAt);
            const timeSpent = telemetry.formatMs(stats.timeSpentMs || 0);

            return `
              <div class="arl-card grammar-topic-card grammar-topic-item ${isSelected ? 'selected' : ''}" data-topic-id="${topic.id}" data-idx="${i}">
                <div class="arl-card-header">
                  <span class="arl-card-num-badge">${String(i + 1).padStart(2, '0')}.</span>
                  <h3 class="arl-card-title">${topic.title}</h3>
                </div>
                ${topic.pattern ? `
                  <div class="arl-card-formula">
                    <code>${topic.pattern}</code>
                  </div>
                ` : ''}
                <div class="arl-card-footer">
                  <div class="arl-card-meta">
                    <span class="arl-card-status-badge ${isUnderstood ? 'understood' : 'learning'}">
                      ${isUnderstood ? `✓ ${stats.bestAccuracyPct || 100}% Understood` : (stats.bestAccuracyPct > 0 ? `${stats.bestAccuracyPct}% In Progress` : 'New Rule')}
                    </span>
                    <span class="arl-card-time">⏱ ${timeSpent}</span>
                  </div>
                  <button class="arl-card-drills-btn btn-open-drills" data-topic-id="${topic.id}">
                    [${drillCount} Drills ->]
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Keyhint Footer -->
        <div class="view-keyhints-bar">
          <span class="micro-keyhint"><span class="micro-bracket">[1-4]</span> Switch Levels</span>
          <span class="micro-keyhint"><span class="micro-bracket">[R]</span> Redemittel</span>
          <span class="micro-keyhint"><span class="micro-bracket">[/]</span> Search</span>
          <span class="micro-keyhint"><span class="micro-bracket">[J/K]</span> Navigate</span>
          <span class="micro-keyhint"><span class="micro-bracket">[Enter]</span> Open</span>
        </div>

      </div>
    `;

    this.bindTopicListEvents();
  }

  bindTopicListEvents() {
    this.container.querySelectorAll('.grammar-tab-btn[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.setFolderIndex(idx);
      });
    });

    this.container.querySelector('#btn-tab-redemittel')?.addEventListener('click', () => {
      sound.playClick();
      this.setRedemittelActive(true);
    });

    this.container.querySelector('#btn-global-pip-toggle')?.addEventListener('click', () => {
      sound.playClick();
      grammarPip.toggle();
    });

    const searchInput = this.container.querySelector('#grammar-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.selectedTopicIdx = 0;
        this.render();
      });
    }

    this.container.querySelector('#btn-clear-grammar-search')?.addEventListener('click', () => {
      sound.playClick();
      this.searchQuery = '';
      this.selectedTopicIdx = 0;
      this.render();
    });

    this.container.querySelectorAll('.grammar-topic-item').forEach(item => {
      item.addEventListener('click', () => {
        sound.playClick();
        const idx = parseInt(item.getAttribute('data-idx'), 10);
        const filtered = this.getFilteredTopics();
        if (filtered[idx]) {
          this.selectedTopicIdx = idx;
          this.openSelectedTopic();
        }
      });
    });
  }

  renderRedemittel() {
    const sections = this.redemittel || [];

    this.container.innerHTML = `
      <div class="grammar-view-container">
        <div class="grammar-nav-bar">
          <div class="grammar-folders-tabs">
            ${this.folders.map((f, i) => `
              <button class="grammar-tab-btn" data-idx="${i}" data-key="${i + 1}">
                <span class="micro-bracket">[${i + 1}]</span> ${f.level}
              </button>
            `).join('')}
            <button class="grammar-tab-btn active" id="btn-tab-redemittel" data-key="r">
              <span class="micro-bracket">[R]</span> ${t('redemittel_tab')}
            </button>
          </div>
          <button class="btn-pip-quick-launch" id="btn-global-pip-toggle">
            [P] Floating PiP
          </button>
        </div>

        <div class="folder-header-title">
          <span class="folder-badge">Redemittel & Sprechen</span>
          <span class="folder-count-badge">5 Discourse Sections</span>
        </div>

        <div class="redemittel-sections-list">
          ${sections.map(sec => `
            <div class="redemittel-section-card">
              <div class="section-title">${sec.name}</div>
              <div class="section-desc">${sec.description}</div>
              <div class="section-formulas">
                ${sec.items.map(item => `
                  <div class="formula-item">
                    <div class="formula-text">${item.formula}</div>
                    <div class="formula-mn">MN: ${item.mn}</div>
                    <div class="formula-en">EN: ${item.en}</div>
                    ${item.example ? `<div class="formula-example">„${item.example}“</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.grammar-tab-btn[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.setFolderIndex(idx);
      });
    });

    this.container.querySelector('#btn-global-pip-toggle')?.addEventListener('click', () => {
      sound.playClick();
      grammarPip.toggle();
    });
  }

  nextTopic() {
    if (this.isRedemittelActive) return;
    const topics = this.getFilteredTopics();
    if (topics.length > 0) {
      this.selectedTopicIdx = (this.selectedTopicIdx + 1) % topics.length;
      this.render();
      this.scrollToSelected();
    }
  }

  prevTopic() {
    if (this.isRedemittelActive) return;
    const topics = this.getFilteredTopics();
    if (topics.length > 0) {
      this.selectedTopicIdx = (this.selectedTopicIdx - 1 + topics.length) % topics.length;
      this.render();
      this.scrollToSelected();
    }
  }

  scrollToSelected() {
    const selectedEl = this.container.querySelector('.topic-item.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  openSelectedTopic() {
    if (this.isRedemittelActive) return;
    const topics = this.getFilteredTopics();
    if (topics.length > 0) {
      if (this.selectedTopicIdx >= topics.length) {
        this.selectedTopicIdx = 0;
      }
      this.activeTopic = topics[this.selectedTopicIdx];
      this.conceptLang = state.interfaceLang;
      this.sandboxText = '';
      this.sandboxFeedback = null;
      this.isCheckingSandbox = false;
      this.isCheckingDrill = false;
      this.activeDrillIdx = 0;
      this.render();
    }
  }

  backToList() {
    this.activeTopic = null;
    this.sandboxText = '';
    this.sandboxFeedback = null;
    this.isCheckingSandbox = false;
    this.isCheckingDrill = false;
    this.render();
  }

  drillTopic() {
    if (typeof this.onNavigate === 'function') {
      this.onNavigate('vocab');
    }
  }

  focusSearch() {
    const input = this.container.querySelector('#grammar-search-input');
    if (input) {
      input.focus();
      input.select();
    }
  }

  renderTopicDetail(topic) {
    GrammarView.activeInstance = this;
    const activeLang = this.conceptLang || state.interfaceLang;
    const coreConceptText = (topic.core_concept && topic.core_concept[activeLang]) ||
      (topic.core_concept && (topic.core_concept.mn || topic.core_concept.en || topic.core_concept.de)) || '';

    const patternFormatted = (topic.pattern || '').replace(
      /\[(.*?)\]/g,
      '<span class="formula-position-chip">[$1]</span>'
    );

    const userKey = getUserAiKey();
    const hasKey = Boolean(userKey);
    const keyType = getAiKeyType(userKey) || 'Custom';
    const specialChars = state.targetLang === 'de'
      ? ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']
      : ["'", '"', '-', '?', '!'];

    const drills = topic.drills || [];
    const totalDrills = drills.length;
    const currentDrill = drills[this.activeDrillIdx] || null;
    const drillInputText = this.drillInputs.get(this.activeDrillIdx) || '';
    const drillFeedback = this.drillFeedbacks.get(this.activeDrillIdx) || null;
    const isAnswerRevealed = this.drillAnswersRevealed.has(this.activeDrillIdx);

    this.container.innerHTML = `
      <div class="grammar-view-container grammar-topic-split-wrapper">
        
        <!-- Header Bar -->
        <div class="topic-detail-header">
          <button class="btn-back-link touch-target" id="btn-back-to-list" title="Back to topic list [Esc]">
            ← ${t('back_to_grammar') || 'Grammar Topics'}
          </button>

          <div class="topic-header-actions-group">
            <!-- Minimalist Monochrome API Key Vault Toggle -->
            <div class="grammar-key-vault-wrap">
              <button type="button" class="keyhint-btn btn-key-vault touch-target" id="btn-toggle-key-vault" title="AI Key Settings (Gemini / Groq / Free Mode)">
                <span class="micro-bracket">[KEY]</span>
                <span class="key-vault-badge-text ${hasKey ? 'badge-active' : 'badge-free'}">
                  ${hasKey ? `Key Active (${keyType})` : 'Free Keyless Mode'}
                </span>
              </button>

              ${this.isKeyVaultOpen ? `
                <div class="key-vault-dropdown-card" id="grammar-key-vault-dropdown">
                  <div class="key-vault-header-row">
                    <span class="key-vault-title">AI Key Vault (BYOK)</span>
                    <span class="key-vault-status-chip ${hasKey ? 'active' : ''}">
                      ${hasKey ? `Active (${keyType})` : 'Free Keyless Mode'}
                    </span>
                  </div>
                  <p class="key-vault-hint">
                    Enter your personal Gemini (<code>AIza...</code>) or Groq (<code>gsk_...</code>) key. Leave empty for 100% free LanguageTool + Pollinations AI mode.
                  </p>
                  <div class="key-vault-form-row">
                    <input
                      type="password"
                      id="input-grammar-user-ai-key"
                      class="key-vault-input-field"
                      placeholder="AIza... or gsk_..."
                      value="${escapeHtml(userKey)}"
                      autocomplete="off"
                      spellcheck="false"
                    />
                    <button type="button" class="btn-action-pill btn-save-key-pill" id="btn-save-user-ai-key">
                      Save
                    </button>
                    ${hasKey ? `
                      <button type="button" class="btn-action-pill btn-clear-key-pill" id="btn-clear-user-ai-key">
                        Clear Key
                      </button>
                    ` : ''}
                  </div>
                </div>
              ` : ''}
            </div>

            <button class="keyhint-btn btn-pin-pip touch-target" id="btn-pin-topic-pip" title="Open this rule in floating PiP reference">
              [P] Pin to PiP
            </button>
            <button class="keyhint-btn btn-drill-rule touch-target" id="btn-drill-topic" data-key="d" title="Practice flashcards for this topic [D]">
              <span class="micro-bracket">[D]</span> Flashcards
            </button>
          </div>
        </div>

        <!-- Split Layout: Left Rule Article & Right Active 20-Sentence Trainer + Sandbox -->
        <div class="grammar-split-layout">
          
          <!-- LEFT PANEL: Pedagogical Rules, Formula, Common Trap -->
          <div class="grammar-split-left">
            <article class="grammar-topic-card">
              <div class="topic-card-header">
                <span class="topic-rule-badge">${topic.id.toUpperCase()}</span>
                <h2 class="topic-header-title">${topic.title}</h2>
              </div>

              <!-- 1. Core Concept -->
              <section class="topic-part">
                <div class="part-header-row">
                  <h3 class="part-heading">${t('core_concept_heading') || '1. Core Concept'}</h3>
                  <div class="concept-lang-pills">
                    <button class="lang-pill ${activeLang === 'mn' ? 'active' : ''}" data-lang="mn">MN</button>
                    <button class="lang-pill ${activeLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
                    <button class="lang-pill ${activeLang === 'de' ? 'active' : ''}" data-lang="de">DE</button>
                  </div>
                </div>
                <p class="concept-body">${coreConceptText}</p>
              </section>

              <!-- 2. Syntactic Formula -->
              ${topic.pattern ? `
                <section class="topic-part">
                  <h3 class="part-heading">${t('pattern_heading') || '2. Sentence Formula'}</h3>
                  <div class="pattern-formula-box">
                    <code>${patternFormatted}</code>
                  </div>
                </section>
              ` : ''}

              <!-- 3. Common Trap Box -->
              ${topic.common_trap ? `
                <section class="topic-part trap-section">
                  <h3 class="part-heading trap-heading">${t('trap_heading') || '3. Common Trap / Warning'}</h3>
                  <div class="trap-box">
                    <span class="trap-bullet">⚠</span>
                    <span class="trap-text">${topic.common_trap}</span>
                  </div>
                </section>
              ` : ''}

              <!-- 4. Exemplary Reference Sentences -->
              ${topic.examples && topic.examples.length > 0 ? `
                <section class="topic-part">
                  <h3 class="part-heading">${t('examples_heading') || '4. Examples'}</h3>
                  <div class="examples-list">
                    ${topic.examples.map(ex => `
                      <div class="example-entry">
                        <div class="example-target-line">${ex.target}</div>
                        ${ex.mn ? `<div class="example-mn-line">MN: ${ex.mn}</div>` : ''}
                        ${ex.en ? `<div class="example-en-line">EN: ${ex.en}</div>` : ''}
                      </div>
                    `).join('')}
                  </div>
                </section>
              ` : ''}
            </article>
          </div>

          <!-- RIGHT PANEL: 20-Sentence Drill Trainer & Contextual Wörterbuch -->
          <div class="grammar-split-right">
            
            ${totalDrills > 0 && currentDrill ? `
              <!-- 20-Sentence Practice Engine -->
              <section class="grammar-drill-trainer-card">
                
                <div class="drill-trainer-header">
                  <div class="drill-step-info">
                    <span class="drill-tag">DRILL TRAINER</span>
                    <span class="drill-step-title">Sentence ${this.activeDrillIdx + 1} of ${totalDrills}</span>
                  </div>
                  <div class="drill-nav-btn-group">
                    <button class="drill-step-btn" id="btn-prev-drill" ${this.activeDrillIdx === 0 ? 'disabled' : ''} title="Previous sentence">
                      ← Prev
                    </button>
                    <button class="drill-step-btn" id="btn-next-drill" ${this.activeDrillIdx >= totalDrills - 1 ? 'disabled' : ''} title="Next sentence">
                      Next →
                    </button>
                  </div>
                </div>

                <!-- 20-Sentence Progress Pill Bar -->
                <div class="drill-carousel-bar">
                  ${drills.map((_, idx) => {
                    const isCur = idx === this.activeDrillIdx;
                    const hasDone = this.drillFeedbacks.has(idx);
                    const isPerfect = hasDone && (this.drillFeedbacks.get(idx)?.isCorrect || this.drillFeedbacks.get(idx)?.verdict === 'Perfect!');
                    let stateCls = isCur ? 'pill-current' : '';
                    if (isPerfect) stateCls += ' pill-passed';
                    else if (hasDone) stateCls += ' pill-reviewed';
                    return `
                      <button class="drill-pill-step ${stateCls}" data-step="${idx}">
                        ${idx + 1}
                      </button>
                    `;
                  }).join('')}
                </div>

                <!-- Mongolian Prompt Card -->
                <div class="drill-prompt-box">
                  <span class="drill-prompt-label">🇲🇳 Монгол даалгавар (Орчуулж бичих):</span>
                  <div class="drill-prompt-text">${currentDrill.prompt_mn}</div>
                </div>

                <!-- Contextual Mini-Wörterbuch (Required Words Helper) -->
                ${currentDrill.woerterbuch && currentDrill.woerterbuch.length > 0 ? `
                  <div class="drill-woerterbuch-box">
                    <div class="woerterbuch-header">
                      <span class="woerterbuch-icon">[WB]</span>
                      <span class="woerterbuch-title">Wörterbuch (Required Words):</span>
                    </div>
                    <div class="woerterbuch-chips-list">
                      ${currentDrill.woerterbuch.map(wb => {
                        let badge = wb.pos || '';
                        let extraBadge = '';
                        if (wb.article) extraBadge = `<span class="wb-art-pill art-${wb.article}">${wb.article}</span>`;
                        else if (wb.infinitive) extraBadge = `<span class="wb-inf-pill">inf.</span>`;
                        return `
                          <div class="woerterbuch-item-pill">
                            ${extraBadge}
                            <strong class="wb-word">${wb.word}</strong>
                            <span class="wb-pos">(${badge})</span>
                            <span class="wb-meaning">→ ${wb.meaning}</span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                ` : ''}

                <!-- Quick Special Characters Bar -->
                <div class="quick-char-bar">
                  <span class="char-bar-label">Special chars:</span>
                  ${specialChars.map(ch => `
                    <button type="button" class="char-chip-btn drill-char-chip" data-char="${ch}">${ch}</button>
                  `).join('')}
                </div>

                <!-- Sentence Input Textarea (Values programmatically preserved) -->
                <div class="drill-input-wrapper">
                  <textarea
                    id="drill-sentence-textarea"
                    class="drill-sentence-textarea"
                    placeholder="Type the sentence in ${state.targetLang === 'de' ? 'German' : 'English'} here..."
                    rows="2"
                    spellcheck="false"
                    autocomplete="off"
                  >${escapeHtml(drillInputText)}</textarea>
                </div>

                <!-- Action Button Row -->
                <div class="drill-actions-row">
                  <button
                    type="button"
                    id="btn-check-drill-sentence"
                    class="keyhint-btn btn-primary-action touch-target btn-check-sentence ${this.isCheckingDrill ? 'btn-loading' : ''}"
                    ${this.isCheckingDrill ? 'disabled' : ''}
                  >
                    <span class="micro-bracket">${this.isCheckingDrill ? '...' : '[Ctrl+Enter]'}</span>
                    <span class="keyhint-label">${this.isCheckingDrill ? 'Checking grammar...' : 'Check Sentence & Earn EXP'}</span>
                  </button>

                  <button
                    type="button"
                    id="btn-toggle-drill-answer"
                    class="keyhint-btn btn-secondary-action touch-target"
                  >
                    ${isAnswerRevealed ? 'Hide Answer' : 'Show Answer'}
                  </button>
                </div>

                <!-- Dedicated Feedback Container -->
                <div id="drill-feedback-container" class="grammar-feedback-container">
                  ${this.renderFeedbackCardHtml(drillFeedback, 'drill')}
                </div>

                <!-- Revealable Answer & Translation Section -->
                ${isAnswerRevealed ? `
                  <div class="drill-revealed-answer-card">
                    <div class="answer-card-header">
                      <span class="answer-badge">[✓] Correct Target Construction</span>
                      <button class="drill-audio-btn touch-target" id="btn-drill-audio" data-target="${currentDrill.target}" title="Listen to pronunciation">
                        [Audio] Listen
                      </button>
                    </div>

                    <div class="answer-target-sentence">
                      ${currentDrill.target}
                    </div>

                    <div class="answer-breakdown-grid">
                      <div class="answer-line">
                        <strong>Үгчилсэн орчуулга:</strong> ${currentDrill.literal_mn}
                      </div>
                      <div class="answer-line">
                        <strong>Утгачилсан орчуулга:</strong> ${currentDrill.natural_mn}
                      </div>
                      <div class="answer-line breakdown-line">
                        <strong>[Тайлбар] Дүрмийн тайлбар:</strong> ${currentDrill.rule_breakdown}
                      </div>
                    </div>
                  </div>
                ` : ''}

              </section>
            ` : ''}

            <!-- Free Sentence Sandbox -->
            <section class="grammar-sandbox-card">
              <div class="sandbox-header-row">
                <div class="sandbox-title-wrap">
                  <span class="sandbox-icon">[Sandbox]</span>
                  <h3 class="sandbox-title">Free Sentence Production</h3>
                </div>
                <div class="sandbox-ai-indicator">
                  <span class="ai-badge ${hasKey ? 'ai-online' : 'ai-local'}">
                    ${hasKey ? `[${keyType} Active]` : '[Free Keyless Mode]'}
                  </span>
                </div>
              </div>

              <p class="sandbox-instruction">
                Draft a custom sentence about your life using this topic to earn additional EXP:
              </p>

              <div class="quick-char-bar">
                ${specialChars.map(ch => `
                  <button type="button" class="char-chip-btn sandbox-char-chip" data-char="${ch}">${ch}</button>
                `).join('')}
              </div>

              <div class="sandbox-input-area">
                <textarea
                  id="sandbox-textarea"
                  class="sandbox-textarea"
                  placeholder="Type your own custom sentence here..."
                  rows="2"
                  spellcheck="false"
                  autocomplete="off"
                >${escapeHtml(this.sandboxText)}</textarea>
              </div>

              <div class="sandbox-submit-row">
                <button
                  type="button"
                  id="btn-evaluate-free-sentence"
                  class="keyhint-btn btn-primary-action touch-target btn-check-sentence ${this.isCheckingSandbox ? 'btn-loading' : ''}"
                  ${this.isCheckingSandbox ? 'disabled' : ''}
                >
                  <span class="micro-bracket">${this.isCheckingSandbox ? '...' : '[Ctrl+Enter]'}</span>
                  <span class="keyhint-label">${this.isCheckingSandbox ? 'Checking grammar...' : 'Check Custom Sentence'}</span>
                </button>
              </div>

              <!-- Dedicated Feedback Container -->
              <div id="sandbox-feedback-container" class="grammar-feedback-container">
                ${this.renderFeedbackCardHtml(this.sandboxFeedback, 'sandbox')}
              </div>
            </section>

          </div>

        </div>

        <!-- Keyhint Footer -->
        <div class="view-keyhints-bar">
          <span class="micro-keyhint"><span class="micro-bracket">[Esc]</span> Back to List</span>
          <span class="micro-keyhint"><span class="micro-bracket">[D]</span> Flashcards</span>
          <span class="micro-keyhint"><span class="micro-bracket">[Ctrl+Enter]</span> Check Sentence</span>
          <span class="micro-keyhint"><span class="micro-bracket">[V]</span> Vocab</span>
        </div>
      </div>
    `;

    this.bindTopicDetailEvents(topic);
  }

  /**
   * Renders structured feedback result card with Status Header,
   * Word-Level Strikethrough Diff, and One-Click Copy / Apply Fix.
   */
  renderFeedbackCardHtml(feedback, prefix = 'drill') {
    if (!feedback) return '';
    const isCorrect = Boolean(feedback.isCorrect || feedback.verdict === 'Perfect!');
    const engine = feedback.engine || (feedback.apiStatus?.includes('gemini') ? 'Gemini' : (feedback.apiStatus?.includes('groq') ? 'Groq' : (feedback.apiStatus?.includes('pollinations') ? 'Pollinations AI' : (feedback.apiStatus?.includes('languagetool') ? 'LanguageTool' : 'Offline Rules'))));
    const statusClass = isCorrect ? 'verdict-correct' : 'verdict-mistake';
    const statusIcon = isCorrect ? '✓' : '✗';
    let statusLabel = isCorrect ? 'Grammatically Correct' : 'Corrections Found';

    if (feedback.statusLabel) {
      statusLabel = feedback.statusLabel.replace(/^[✓✗]\s*/, '');
    } else if (feedback.verdictLabel) {
      statusLabel = feedback.verdictLabel.replace(/^[✓✗]\s*/, '');
    } else if (feedback.verdict === 'Incomplete / Invalid Sentence') {
      statusLabel = 'Incomplete / Invalid Sentence';
    } else if (feedback.verdict === 'Almost There' || feedback.expBonus === 5) {
      statusLabel = 'Minor Capitalization / Punctuation Adjustment';
    }

    const exp = typeof feedback.expBonus === 'number' ? feedback.expBonus : (isCorrect ? 15 : 0);

    const inputSentence = prefix === 'drill'
      ? (this.drillInputs?.get(this.activeDrillIdx) || '')
      : (this.sandboxText || '');

    const wordDiffHtml = renderWordDiff(inputSentence, feedback.correctedSentence);
    const explanations = Array.isArray(feedback.explanations) && feedback.explanations.length > 0
      ? feedback.explanations
      : (feedback.why ? [feedback.why] : []);

    return `
      <div class="drill-feedback-card ${statusClass}">
        <!-- 1. Status Header -->
        <div class="feedback-badge-row">
          <span class="verdict-pill ${statusClass}">
            ${statusIcon} ${statusLabel}
          </span>
          <span class="feedback-engine-badge">Engine: ${escapeHtml(engine)}</span>
          <span class="feedback-exp-pill">+${exp} EXP</span>
        </div>

        <!-- 2. Word-Level Visual Diff -->
        <div class="feedback-section">
          <span class="feedback-label">Word-Level Visual Diff:</span>
          <div class="feedback-diff-box feedback-word-diff">
            ${wordDiffHtml || escapeHtml(feedback.correctedSentence)}
          </div>
        </div>

        <!-- 3. Clean Corrected Sentence with One-Click Copy & Apply Fix buttons -->
        <div class="feedback-corrected-section">
          <div class="feedback-corrected-label-row">
            <span class="feedback-label">Clean Corrected Sentence:</span>
            <div class="feedback-actions-bar">
              <button type="button" class="btn-action-pill btn-apply-fix" id="btn-apply-${prefix}-fix" data-fixed="${escapeHtml(feedback.correctedSentence)}" title="Apply this correction to input">
                [Apply to Input]
              </button>
              <button type="button" class="btn-action-pill btn-copy-fix" id="btn-copy-${prefix}-fix" data-fixed="${escapeHtml(feedback.correctedSentence)}" title="Copy clean sentence to clipboard">
                [Copy]
              </button>
            </div>
          </div>
          <div class="feedback-corrected-sentence" id="${prefix}-corrected-target">
            ${escapeHtml(feedback.correctedSentence)}
          </div>
        </div>

        <!-- 4. Explanations & Tip -->
        ${explanations.length > 0 ? `
          <div class="feedback-section">
            <span class="feedback-label">Rule Explanations:</span>
            <ul class="feedback-explanations-list">
              ${explanations.map(exp => `<li>${escapeHtml(exp)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${feedback.grammarTip ? `
          <div class="feedback-section feedback-tip-section">
            <span class="feedback-label">Grammar Tip:</span>
            <div class="feedback-val tip-text">💡 ${escapeHtml(feedback.grammarTip)}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  bindTopicDetailEvents(topic) {
    const drillInputText = this.drillInputs.get(this.activeDrillIdx) || '';

    // Programmatically ensure textarea values are pristine (never wiped)
    const drillTextarea = this.container.querySelector('#drill-sentence-textarea');
    if (drillTextarea) {
      drillTextarea.value = drillInputText;
      drillTextarea.addEventListener('input', (e) => {
        this.drillInputs.set(this.activeDrillIdx, e.target.value);
      });
    }

    const sandboxTextarea = this.container.querySelector('#sandbox-textarea');
    if (sandboxTextarea) {
      sandboxTextarea.value = this.sandboxText || '';
      sandboxTextarea.addEventListener('input', (e) => {
        this.sandboxText = e.target.value;
      });
    }

    // Back to list
    this.container.querySelector('#btn-back-to-list')?.addEventListener('click', () => {
      sound.playClick();
      this.activeTopic = null;
      this.render();
    });

    // Pin to Floating PiP
    this.container.querySelector('#btn-pin-topic-pip')?.addEventListener('click', () => {
      sound.playClick();
      grammarPip.openTopic(topic);
    });

    // Drill in Vocab
    this.container.querySelector('#btn-drill-topic')?.addEventListener('click', () => {
      sound.playClick();
      if (typeof this.onNavigate === 'function') {
        this.onNavigate('vocab');
      }
    });

    // Language pills for core concept
    this.container.querySelectorAll('.lang-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        sound.playClick();
        this.conceptLang = pill.getAttribute('data-lang');
        this.renderTopicDetail(topic);
      });
    });

    // Audio button for target sentence
    this.container.querySelector('#btn-drill-audio')?.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      if (target) {
        state.playAudio(target);
      }
    });
  }

  toggleKeyVault() {
    sound.playClick();
    this.isKeyVaultOpen = !this.isKeyVaultOpen;
    this.renderTopicDetail(this.activeTopic);
  }

  saveKeyVaultInput() {
    sound.playClick();
    const input = this.container.querySelector('#input-grammar-user-ai-key');
    if (input) {
      const val = input.value.trim();
      setUserAiKey(val);
      this.isKeyVaultOpen = false;
      this.renderTopicDetail(this.activeTopic);
    }
  }

  clearKeyVaultInput() {
    sound.playClick();
    setUserAiKey('');
    this.isKeyVaultOpen = false;
    this.renderTopicDetail(this.activeTopic);
  }

  saveCurrentDrillInput() {
    const ta = this.container.querySelector('#drill-sentence-textarea');
    if (ta) {
      this.drillInputs.set(this.activeDrillIdx, ta.value);
    }
  }

  updateDrillPills() {
    const drills = this.activeTopic?.drills || [];
    this.container.querySelectorAll('.drill-pill-step').forEach((btn, idx) => {
      const isCur = idx === this.activeDrillIdx;
      const hasDone = this.drillFeedbacks.has(idx);
      const isPerfect = hasDone && (this.drillFeedbacks.get(idx)?.isCorrect || this.drillFeedbacks.get(idx)?.verdict === 'Perfect!');
      let stateCls = isCur ? 'pill-current' : '';
      if (isPerfect) stateCls += ' pill-passed';
      else if (hasDone) stateCls += ' pill-reviewed';
      btn.className = `drill-pill-step ${stateCls}`.trim();
    });
  }

  async submitDrillSentence(topic, currentDrill) {
    if (this.isCheckingDrill) return;
    this.saveCurrentDrillInput();
    const userText = (this.drillInputs.get(this.activeDrillIdx) || '').trim();

    if (!userText) {
      const ta = this.container.querySelector('#drill-sentence-textarea');
      if (ta) ta.focus();
      return;
    }

    this.isCheckingDrill = true;

    // 1. In-place loading state on check button
    const checkBtn = this.container.querySelector('#btn-check-drill-sentence');
    if (checkBtn) {
      checkBtn.disabled = true;
      checkBtn.classList.add('btn-loading');
      checkBtn.innerHTML = '<span class="micro-bracket">...</span> Checking grammar...';
    }

    // 2. Visible loading state inside feedback container (NEVER wipes textarea)
    const feedbackContainer = this.container.querySelector('#drill-feedback-container');
    if (feedbackContainer) {
      feedbackContainer.innerHTML = `
        <div class="drill-feedback-card feedback-loading-card">
          <div class="feedback-badge-row">
            <span class="verdict-pill verdict-loading">Checking grammar...</span>
            <span class="feedback-engine-badge">Querying Linguistic Engine</span>
          </div>
          <div class="feedback-loading-indicator">
            <div class="loading-pulse-dot"></div>
            <span class="loading-pulse-text">Analyzing syntax, case governance & verb placement...</span>
          </div>
        </div>
      `;
    }

    try {
      const feedback = await checkSentenceGrammar(
        userText,
        state.targetLang,
        {
          targetTopic: topic?.title || '',
          topicId: topic?.id || '',
          expectedSentence: currentDrill?.target || '',
          mongolianPrompt: currentDrill?.prompt_mn || '',
          requiredWords: currentDrill?.woerterbuch || [],
          drill: currentDrill,
          topic: topic
        }
      );

      this.drillFeedbacks.set(this.activeDrillIdx, feedback);
      this.drillAnswersRevealed.add(this.activeDrillIdx);

      // Award EXP strictly per feedback.expBonus
      if (feedback && feedback.expBonus > 0) {
        const bonusLabel = feedback.isCorrect ? 'Drill Master' : (feedback.expBonus === 5 ? 'Drill Partial Credit' : 'Drill Practice');
        state.addExp(feedback.expBonus, { label: bonusLabel, bonus: feedback.isCorrect });
      }

      // Record telemetry
      try {
        let perfectCount = 0;
        this.drillFeedbacks.forEach(f => {
          if (f.isCorrect || f.verdict === 'Perfect!') perfectCount++;
        });
        const totalTested = this.drillFeedbacks.size;
        const accuracyPct = totalTested > 0 ? (perfectCount / totalTested) * 100 : 0;
        const elapsed = Date.now() - (this.topicStartTime || Date.now());
        telemetry.recordGrammarDrill(topic.id, accuracyPct, elapsed);
      } catch (e) {}

      // Update feedback container directly without touching textarea DOM
      if (feedbackContainer) {
        feedbackContainer.innerHTML = this.renderFeedbackCardHtml(feedback, 'drill');
      }

      // Update drill step pills
      this.updateDrillPills();

    } catch (err) {
      console.warn('Drill evaluation error:', err);
      if (feedbackContainer) {
        feedbackContainer.innerHTML = `
          <div class="drill-feedback-card verdict-mistake">
            <div class="feedback-badge-row">
              <span class="verdict-pill verdict-mistake">Notice</span>
            </div>
            <div class="feedback-val">${escapeHtml(err.message || 'Grammar check encountered an error.')}</div>
          </div>
        `;
      }
    } finally {
      this.isCheckingDrill = false;
      if (checkBtn) {
        checkBtn.disabled = false;
        checkBtn.classList.remove('btn-loading');
        checkBtn.innerHTML = '<span class="micro-bracket">[Ctrl+Enter]</span> <span class="keyhint-label">Check Sentence & Earn EXP</span>';
      }
    }
  }

  async submitSandboxSentence(topic) {
    if (this.isCheckingSandbox) return;
    const ta = this.container.querySelector('#sandbox-textarea');
    if (ta) this.sandboxText = ta.value;

    const text = (this.sandboxText || '').trim();
    if (!text) {
      if (ta) ta.focus();
      return;
    }

    this.isCheckingSandbox = true;

    // 1. In-place loading state on sandbox check button
    const evalBtn = this.container.querySelector('#btn-evaluate-free-sentence');
    if (evalBtn) {
      evalBtn.disabled = true;
      evalBtn.classList.add('btn-loading');
      evalBtn.innerHTML = '<span class="micro-bracket">...</span> Checking grammar...';
    }

    // 2. Visible loading state inside feedback container (NEVER wipes textarea)
    const feedbackContainer = this.container.querySelector('#sandbox-feedback-container');
    if (feedbackContainer) {
      feedbackContainer.innerHTML = `
        <div class="drill-feedback-card feedback-loading-card">
          <div class="feedback-badge-row">
            <span class="verdict-pill verdict-loading">Checking grammar...</span>
            <span class="feedback-engine-badge">Querying Linguistic Engine</span>
          </div>
          <div class="feedback-loading-indicator">
            <div class="loading-pulse-dot"></div>
            <span class="loading-pulse-text">Analyzing custom sentence syntax & verb agreement...</span>
          </div>
        </div>
      `;
    }

    try {
      const feedback = await checkSentenceGrammar(text, state.targetLang, {
        targetTopic: topic?.title || ''
      });
      this.sandboxFeedback = feedback;

      if (feedback && feedback.expBonus > 0) {
        state.addExp(feedback.expBonus, { label: 'Sentence Master', bonus: feedback.isCorrect });
      }

      if (feedbackContainer) {
        feedbackContainer.innerHTML = this.renderFeedbackCardHtml(feedback, 'sandbox');
      }
    } catch (err) {
      console.warn('Sandbox evaluation error:', err);
      if (feedbackContainer) {
        feedbackContainer.innerHTML = `
          <div class="drill-feedback-card verdict-mistake">
            <div class="feedback-badge-row">
              <span class="verdict-pill verdict-mistake">Notice</span>
            </div>
            <div class="feedback-val">${escapeHtml(err.message || 'Custom sentence check encountered an error.')}</div>
          </div>
        `;
      }
    } finally {
      this.isCheckingSandbox = false;
      if (evalBtn) {
        evalBtn.disabled = false;
        evalBtn.classList.remove('btn-loading');
        evalBtn.innerHTML = '<span class="micro-bracket">[Ctrl+Enter]</span> <span class="keyhint-label">Check Custom Sentence</span>';
      }
    }
  }

  applyDrillFix() {
    sound.playClick();
    const feedback = this.drillFeedbacks.get(this.activeDrillIdx);
    if (!feedback?.correctedSentence) return;
    const fixed = feedback.correctedSentence;
    this.drillInputs.set(this.activeDrillIdx, fixed);
    const ta = this.container.querySelector('#drill-sentence-textarea');
    if (ta) {
      ta.value = fixed;
      ta.focus();
    }
    const btn = this.container.querySelector('#btn-apply-drill-fix');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Applied!';
      setTimeout(() => { if (btn) btn.textContent = orig; }, 1800);
    }
  }

  copyDrillFix() {
    sound.playClick();
    const feedback = this.drillFeedbacks.get(this.activeDrillIdx);
    if (!feedback?.correctedSentence) return;
    this.copyToClipboard(feedback.correctedSentence, '#btn-copy-drill-fix');
  }

  applySandboxFix() {
    sound.playClick();
    if (!this.sandboxFeedback?.correctedSentence) return;
    const fixed = this.sandboxFeedback.correctedSentence;
    this.sandboxText = fixed;
    const ta = this.container.querySelector('#sandbox-textarea');
    if (ta) {
      ta.value = fixed;
      ta.focus();
    }
    const btn = this.container.querySelector('#btn-apply-sandbox-fix');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Applied!';
      setTimeout(() => { if (btn) btn.textContent = orig; }, 1800);
    }
  }

  copySandboxFix() {
    sound.playClick();
    if (!this.sandboxFeedback?.correctedSentence) return;
    this.copyToClipboard(this.sandboxFeedback.correctedSentence, '#btn-copy-sandbox-fix');
  }

  async copyToClipboard(text, btnSelector) {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else if (typeof document !== 'undefined') {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
    const btn = this.container?.querySelector(btnSelector);
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { if (btn) btn.textContent = orig; }, 1800);
    }
  }
}
