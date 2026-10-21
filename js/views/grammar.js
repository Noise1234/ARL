/**
 * ARL - Structured Grammar & Redemittel View with Interactive Sentence Sandbox
 * 4 Proficiency Levels (A1 - B2) with 4-part pedagogical layout,
 * plus an Interactive Real-Life Sentence Production Area with Free Gemini AI / Local Rule checking.
 * Features: Live search filter [/], tactile [1-4] switching, [J]/[K] navigation,
 * special character bar, responsive landscape two-column split, and Dopamine EXP rewards.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { keyboard, KeyboardState } from '../keyboard.js';
import { GeminiClient } from '../gemini.js';

export class GrammarView {
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

    // Sandbox state
    this.sandboxText = '';
    this.sandboxFeedback = null;
    this.isChecking = false;
  }

  async loadData() {
    const lang = state.targetLang;
    try {
      const gResp = await fetch(`data/${lang}/grammar.json`);
      if (gResp.ok) {
        this.folders = await gResp.json();
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

    // Reset topic pointer defensively on dataset switch
    this.selectedTopicIdx = 0;
    this.activeTopic = null;
    this.searchQuery = '';
    this.sandboxText = '';
    this.sandboxFeedback = null;
    if (this.currentFolderIdx >= this.folders.length) {
      this.currentFolderIdx = 0;
    }
  }

  setFolderIndex(idx) {
    if (idx >= 0 && idx < this.folders.length) {
      this.currentFolderIdx = idx;
      this.activeTopic = null;
      this.selectedTopicIdx = 0;
      this.isRedemittelActive = false;
      this.searchQuery = '';
      this.sandboxText = '';
      this.sandboxFeedback = null;
      this.render();
    }
  }

  toggleRedemittel() {
    this.isRedemittelActive = !this.isRedemittelActive;
    this.activeTopic = null;
    this.searchQuery = '';
    this.render();
  }

  getFilteredTopics() {
    const currentFolder = this.folders[this.currentFolderIdx];
    if (!currentFolder || !currentFolder.topics) return [];
    if (!this.searchQuery.trim()) return currentFolder.topics;

    const q = this.searchQuery.toLowerCase().trim();
    return currentFolder.topics.filter(topic => {
      const titleMatch = topic.title.toLowerCase().includes(q);
      const patternMatch = topic.pattern && topic.pattern.toLowerCase().includes(q);
      const idMatch = topic.id.toLowerCase().includes(q);
      const conceptMatch = topic.core_concept && Object.values(topic.core_concept).some(val =>
        typeof val === 'string' && val.toLowerCase().includes(q)
      );
      return titleMatch || patternMatch || idMatch || conceptMatch;
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
      this.isChecking = false;
      this.render();
    }
  }

  backToList() {
    this.activeTopic = null;
    this.sandboxText = '';
    this.sandboxFeedback = null;
    this.isChecking = false;
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

  render() {
    if (this.activeTopic) {
      keyboard.setState(KeyboardState.GRAMMAR_TOPIC);
      this.renderTopicDetail(this.activeTopic);
    } else {
      keyboard.setState(KeyboardState.GRAMMAR_LIST);
      if (this.isRedemittelActive) {
        this.renderRedemittelList();
      } else {
        this.renderFolderList();
      }
    }
  }

  renderFolderList() {
    const currentFolder = this.folders[this.currentFolderIdx] || { topics: [] };
    const topics = this.getFilteredTopics();

    this.container.innerHTML = `
      <div class="grammar-view-container">
        <!-- Folders Header Tabs with tactile keycap markers -->
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
        </div>

        <!-- Search Bar with '/' shortcut -->
        <div class="grammar-search-bar-row">
          <div class="grammar-search-input-wrapper">
            <span class="search-keycap-hint">[/]</span>
            <input
              type="text"
              id="grammar-search-input"
              class="grammar-search-field"
              placeholder="Filter topics by title, case, or formula (press [/] to search)..."
              value="${this.searchQuery}"
              autocomplete="off"
              spellcheck="false"
            />
            ${this.searchQuery ? '<button class="btn-clear-search" id="btn-clear-search">✕</button>' : ''}
          </div>
        </div>

        <!-- Folder Title & Topic Count Badge -->
        <div class="folder-header-title">
          <span class="folder-badge">${currentFolder.folder_name || 'Grammar'}</span>
          <span class="folder-count-badge">${topics.length} ${topics.length === 1 ? 'topic' : 'topics'}</span>
        </div>

        <!-- Topics List -->
        <div class="topics-list" role="list">
          ${topics.length === 0 ? `
            <div class="topics-empty-state">No matching grammar rules found for "${this.searchQuery}"</div>
          ` : topics.map((t, idx) => `
            <div class="topic-item ${idx === this.selectedTopicIdx ? 'selected' : ''}" data-idx="${idx}" role="button" tabindex="0">
              <span class="topic-num">${String(idx + 1).padStart(2, '0')}.</span>
              <span class="topic-title">${t.title}</span>
              <span class="topic-arrow">→</span>
            </div>
          `).join('')}
        </div>

        <!-- Keyhint Footer -->
        <div class="view-keyhints-bar">
          <span class="micro-keyhint"><span class="micro-bracket">[1-4]</span> Level</span>
          <span class="micro-keyhint"><span class="micro-bracket">[/]</span> Search</span>
          <span class="micro-keyhint"><span class="micro-bracket">[J/K or ↑/↓]</span> Select</span>
          <span class="micro-keyhint"><span class="micro-bracket">[Enter]</span> Open</span>
          <span class="micro-keyhint"><span class="micro-bracket">[V]</span> Vocab</span>
        </div>
      </div>
    `;

    // Folder tab clicks
    this.container.querySelectorAll('.grammar-tab-btn[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.setFolderIndex(idx);
      });
    });

    this.container.querySelector('#btn-tab-redemittel')?.addEventListener('click', () => {
      this.toggleRedemittel();
    });

    // Search input handler
    const searchInput = this.container.querySelector('#grammar-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.selectedTopicIdx = 0;
        this.renderFolderList();
        const freshInput = this.container.querySelector('#grammar-search-input');
        if (freshInput) {
          freshInput.focus();
          freshInput.selectionStart = freshInput.selectionEnd = freshInput.value.length;
        }
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.searchQuery = '';
          searchInput.blur();
          this.render();
        } else if (e.key === 'Enter') {
          searchInput.blur();
          this.openSelectedTopic();
        }
      });
    }

    this.container.querySelector('#btn-clear-search')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.selectedTopicIdx = 0;
      this.render();
    });

    // Topic row clicks
    this.container.querySelectorAll('.topic-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        this.selectedTopicIdx = idx;
        this.openSelectedTopic();
      });
    });
  }

  renderRedemittelList() {
    const sections = this.redemittel ? this.redemittel.sections : [];

    this.container.innerHTML = `
      <div class="grammar-view-container">
        <!-- Folders Header Tabs -->
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

        <!-- Keyhint Footer -->
        <div class="view-keyhints-bar">
          <span class="micro-keyhint"><span class="micro-bracket">[1-4]</span> Levels</span>
          <span class="micro-keyhint"><span class="micro-bracket">[V]</span> Vocab</span>
        </div>
      </div>
    `;

    this.container.querySelectorAll('.grammar-tab-btn[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.setFolderIndex(idx);
      });
    });
  }

  renderTopicDetail(topic) {
    const activeLang = this.conceptLang || state.interfaceLang;
    const coreConceptText = topic.core_concept[activeLang] || topic.core_concept.en || topic.core_concept.de || '';

    // Mathematical syntax formula parser
    const patternFormatted = topic.pattern.replace(
      /\[(.*?)\]/g,
      '<span class="formula-position-chip">[$1]</span>'
    );

    const hasKey = GeminiClient.hasApiKey();
    const specialChars = state.targetLang === 'de'
      ? ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü']
      : ["'", '"', '-', '?', '!'];

    this.container.innerHTML = `
      <div class="grammar-view-container grammar-topic-split-wrapper">
        <!-- Top Back Bar & Quick Drill Action -->
        <div class="topic-detail-header">
          <button class="btn-back-link touch-target" id="btn-back-to-list" title="Keyboard: Esc">
            ← ${t('back_to_grammar')}
          </button>

          <button class="keyhint-btn btn-drill-rule touch-target" id="btn-drill-topic" data-key="d" title="Keyboard: D">
            <span class="micro-bracket">[D]</span> ${t('hud_vocab').replace(/\[V\]\s*/, '')} Drill
          </button>
        </div>

        <!-- Responsive Split View: Left Column (Rules) & Right Column (Interactive Sandbox) -->
        <div class="grammar-split-layout">
          
          <!-- LEFT PANEL: Pedagogical Rules & Formula -->
          <div class="grammar-split-left">
            <article class="grammar-topic-card">
              <div class="topic-card-header">
                <h2 class="topic-header-title">${topic.title}</h2>
              </div>

              <!-- 1. Core Concept with Language Switcher -->
              <section class="topic-part">
                <div class="part-header-row">
                  <h3 class="part-heading">${t('core_concept_heading')}</h3>
                  <div class="concept-lang-pills">
                    <button class="lang-pill ${activeLang === 'mn' ? 'active' : ''}" data-lang="mn">MN</button>
                    <button class="lang-pill ${activeLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
                    <button class="lang-pill ${activeLang === 'de' ? 'active' : ''}" data-lang="de">DE</button>
                  </div>
                </div>
                <p class="concept-body">${coreConceptText}</p>
              </section>

              <!-- 2. Syntactic Formula / Mathematical Pattern -->
              <section class="topic-part">
                <h3 class="part-heading">${t('pattern_heading')}</h3>
                <div class="pattern-formula-box">
                  <code>${patternFormatted}</code>
                </div>
              </section>

              <!-- 3. Real-World Exemplary Drills with Inline Case Governance -->
              <section class="topic-part">
                <h3 class="part-heading">${t('examples_heading')}</h3>
                <div class="examples-list">
                  ${topic.examples.map(ex => `
                    <div class="example-entry">
                      <div class="example-target-line">${ex.target}</div>
                      <div class="example-mn-line">MN: ${ex.mn}</div>
                      <div class="example-en-line">EN: ${ex.en}</div>
                    </div>
                  `).join('')}
                </div>
              </section>

              <!-- 4. Common Trap Warning Box -->
              <section class="topic-part trap-section">
                <h3 class="part-heading trap-heading">${t('trap_heading')}</h3>
                <div class="trap-box">
                  <span class="trap-bullet">⚠</span>
                  <span class="trap-text">${topic.common_trap}</span>
                </div>
              </section>
            </article>
          </div>

          <!-- RIGHT PANEL: Interactive Grammar Sandbox with AI Sentence Checker (Rule 4) -->
          <div class="grammar-split-right">
            <section class="grammar-sandbox-card">
              <div class="sandbox-header-row">
                <div class="sandbox-title-wrap">
                  <span class="sandbox-icon">✍</span>
                  <h3 class="sandbox-title">Real-Life Sentence Production</h3>
                </div>
                <div class="sandbox-ai-indicator">
                  ${hasKey
                    ? '<span class="ai-badge ai-online" title="Gemini 2.5 Flash Connected">⚡ Gemini 2.5 Flash</span>'
                    : '<span class="ai-badge ai-local" title="Deterministic local validator active. Add free key in [S]ettings for Gemini AI.">⚙ Local Checker</span>'
                  }
                </div>
              </div>

              <p class="sandbox-instruction">
                Write a sentence about your current life or situation using this grammar rule:
              </p>

              <!-- Quick-Access Special Character Bar for mobile/tablet speed -->
              <div class="quick-char-bar" role="toolbar" aria-label="Special German characters">
                ${specialChars.map(ch => `
                  <button type="button" class="char-chip-btn" data-char="${ch}" title="Insert ${ch}">${ch}</button>
                `).join('')}
              </div>

              <!-- Typing Area -->
              <div class="sandbox-input-area">
                <textarea
                  id="sandbox-textarea"
                  class="sandbox-textarea"
                  placeholder="Type your sentence here... (e.g. Heute lerne ich Deutsch, weil...)"
                  rows="3"
                  spellcheck="false"
                  autocomplete="off"
                >${this.sandboxText}</textarea>
              </div>

              <!-- Submit Action in Thumb Zone -->
              <div class="sandbox-submit-row">
                <button
                  type="button"
                  id="btn-evaluate-sentence"
                  class="keyhint-btn btn-primary-action touch-target btn-check-sentence"
                  ${this.isChecking ? 'disabled' : ''}
                >
                  <span class="micro-bracket">[Ctrl+Enter]</span>
                  <span class="keyhint-label">${this.isChecking ? 'Checking Sentence...' : 'Check Sentence & Earn EXP'}</span>
                </button>
              </div>

              <!-- Feedback Card -->
              ${this.sandboxFeedback ? `
                <div class="sandbox-feedback-card verdict-${this.sandboxFeedback.verdict.toLowerCase().replace(/[^a-z]/g, '-')}">
                  <div class="feedback-badge-row">
                    <span class="verdict-pill verdict-${this.sandboxFeedback.verdict.toLowerCase().replace(/[^a-z]/g, '-')}">
                      ${this.sandboxFeedback.verdict}
                    </span>
                    <span class="feedback-exp-pill">+${this.sandboxFeedback.expBonus} EXP Awarded</span>
                  </div>

                  <div class="feedback-section">
                    <span class="feedback-label">Correction:</span>
                    <div class="feedback-val corrected-text">${this.sandboxFeedback.correctedSentence}</div>
                  </div>

                  <div class="feedback-section">
                    <span class="feedback-label">Why:</span>
                    <div class="feedback-val why-text">${this.sandboxFeedback.why}</div>
                  </div>

                  ${this.sandboxFeedback.naturalAlternative ? `
                    <div class="feedback-section">
                      <span class="feedback-label">Natural Native Phrasing:</span>
                      <div class="feedback-val natural-text">„${this.sandboxFeedback.naturalAlternative}“</div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

            </section>
          </div>

        </div>

        <!-- Keyhint Footer -->
        <div class="view-keyhints-bar">
          <span class="micro-keyhint"><span class="micro-bracket">[Esc]</span> Back</span>
          <span class="micro-keyhint"><span class="micro-bracket">[D]</span> Drill In Vocab</span>
          <span class="micro-keyhint"><span class="micro-bracket">[Ctrl+Enter]</span> Submit Sentence</span>
          <span class="micro-keyhint"><span class="micro-bracket">[V]</span> Vocab</span>
        </div>
      </div>
    `;

    // Back to list
    this.container.querySelector('#btn-back-to-list')?.addEventListener('click', () => {
      this.backToList();
    });

    // Drill in vocab
    this.container.querySelector('#btn-drill-topic')?.addEventListener('click', () => {
      this.drillTopic();
    });

    // Language pills
    this.container.querySelectorAll('.lang-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.conceptLang = pill.getAttribute('data-lang');
        this.renderTopicDetail(topic);
      });
    });

    // Special character chips
    const textarea = this.container.querySelector('#sandbox-textarea');
    this.container.querySelectorAll('.char-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!textarea) return;
        const char = btn.getAttribute('data-char');
        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? textarea.value.length;
        const val = textarea.value;
        textarea.value = val.slice(0, start) + char + val.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + char.length;
        this.sandboxText = textarea.value;
        textarea.focus();
      });
    });

    // Textarea input sync
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        this.sandboxText = e.target.value;
      });
      textarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.submitSentence(topic);
        }
      });
    }

    // Submit button
    this.container.querySelector('#btn-evaluate-sentence')?.addEventListener('click', () => {
      this.submitSentence(topic);
    });
  }

  async submitSentence(topic) {
    if (this.isChecking) return;
    const text = (this.sandboxText || '').trim();
    if (!text) {
      const textarea = this.container.querySelector('#sandbox-textarea');
      if (textarea) {
        textarea.focus();
      }
      return;
    }

    this.isChecking = true;
    this.renderTopicDetail(topic);

    try {
      const feedback = await state.evaluateGrammarSentence(text, topic.title);
      this.sandboxFeedback = feedback;
    } catch (err) {
      console.warn('Evaluation error:', err);
    } finally {
      this.isChecking = false;
      this.renderTopicDetail(topic);
    }
  }
}
