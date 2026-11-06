/**
 * ARL - Structured Grammar & Redemittel View with 20-Sentence Drill Engine & Floating PiP
 * 4 Proficiency Levels (A1 - B2) with 4-part pedagogical layout,
 * Contextual Mini-Wörterbuch (Required Words per sentence),
 * Revealable Answer & Translation Section,
 * Color-Coded Mistake & Word-Order Diff Highlighting (Red / Blue / Green),
 * and Free-form Sentence Sandbox.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { sound } from '../sound.js';
import { GeminiClient } from '../gemini.js';
import { renderColorCodedDiff, escapeHtml } from '../diff.js';
import { grammarPip } from '../grammar-pip.js';
import { telemetry } from '../telemetry.js';

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

    // Reset topic pointer defensively on dataset switch
    this.selectedTopicIdx = 0;
    this.activeTopic = null;
    this.searchQuery = '';
    this.activeDrillIdx = 0;
    this.drillInputs.clear();
    this.drillFeedbacks.clear();
    this.drillAnswersRevealed.clear();
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
      this.activeDrillIdx = 0;
      this.drillInputs.clear();
      this.drillFeedbacks.clear();
      this.drillAnswersRevealed.clear();
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

  render() {
    if (this.activeTopic) {
      this.renderTopicDetail(this.activeTopic);
      return;
    }

    if (this.isRedemittelActive) {
      this.renderRedemittelList();
      return;
    }

    this.renderTopicList();
  }

  renderTopicList() {
    const currentFolder = this.folders[this.currentFolderIdx];
    const topics = this.getFilteredTopics();
    const folderLevel = currentFolder ? currentFolder.level : `Level ${this.currentFolderIdx + 1}`;
    const folderCount = currentFolder && currentFolder.topics ? currentFolder.topics.length : 0;

    this.container.innerHTML = `
      <div class="grammar-view-container">
        
        <!-- Folders Header Tabs [1-4] + [R] -->
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
      this.toggleRedemittel();
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
        const reInput = this.container.querySelector('#grammar-search-input');
        if (reInput) {
          reInput.focus();
          reInput.setSelectionRange(reInput.value.length, reInput.value.length);
        }
      });
    }

    this.container.querySelector('#btn-clear-grammar-search')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.selectedTopicIdx = 0;
      this.render();
    });

    this.container.querySelectorAll('.grammar-topic-item').forEach(item => {
      item.addEventListener('click', () => {
        sound.playClick();
        const tid = item.getAttribute('data-topic-id');
        const found = this.folders[this.currentFolderIdx]?.topics?.find(t => t.id === tid);
        if (found) {
          this.activeTopic = found;
          this.activeDrillIdx = 0;
          this.render();
        }
      });
    });
  }

  renderRedemittelList() {
    const sections = this.redemittel ? this.redemittel.sections : [];

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
    const activeLang = this.conceptLang || state.interfaceLang;
    const coreConceptText = (topic.core_concept && topic.core_concept[activeLang]) ||
      (topic.core_concept && (topic.core_concept.mn || topic.core_concept.en || topic.core_concept.de)) || '';

    const patternFormatted = (topic.pattern || '').replace(
      /\[(.*?)\]/g,
      '<span class="formula-position-chip">[$1]</span>'
    );

    const hasKey = GeminiClient.hasApiKey();
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
                    const isPerfect = hasDone && this.drillFeedbacks.get(idx)?.verdict === 'Perfect!';
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

                <!-- Sentence Input Textarea -->
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
                    <span class="keyhint-label">${this.isCheckingDrill ? 'Checking Sentence...' : 'Check Sentence & Earn EXP'}</span>
                  </button>

                  <button
                    type="button"
                    id="btn-toggle-drill-answer"
                    class="keyhint-btn btn-secondary-action touch-target"
                  >
                    ${isAnswerRevealed ? 'Hide Answer' : 'Show Answer'}
                  </button>
                </div>

                <!-- Diff Feedback Card with Red/Blue/Green highlights -->
                ${drillFeedback ? `
                  <div class="drill-feedback-card verdict-${(drillFeedback.verdict || '').toLowerCase().replace(/[^a-z]/g, '-')}">
                    <div class="feedback-badge-row">
                      <span class="verdict-pill verdict-${(drillFeedback.verdict || '').toLowerCase().replace(/[^a-z]/g, '-')}">
                        ${escapeHtml(drillFeedback.verdict)}
                      </span>
                      <span class="feedback-exp-pill">+${drillFeedback.expBonus || 15} EXP Awarded</span>
                      <span class="api-status-pill ${drillFeedback.apiStatus?.includes('local') ? 'pill-local' : 'pill-online'}" title="${escapeHtml(drillFeedback.errorMessage || '')}">
                        ${escapeHtml(drillFeedback.apiBadge || (drillFeedback.apiStatus?.includes('local') ? '[Offline Rule Check]' : '[AI Verified]'))}
                      </span>
                    </div>

                    <!-- Corrected Sentence with One-Tap Apply Fix and Copy actions -->
                    <div class="feedback-corrected-section">
                      <div class="feedback-corrected-label-row">
                        <span class="feedback-label">Corrected Sentence:</span>
                        <div class="feedback-actions-bar">
                          <button type="button" class="btn-action-pill btn-apply-fix" id="btn-apply-drill-fix" title="Apply this fix to your input">
                            [Apply Fix]
                          </button>
                          <button type="button" class="btn-action-pill btn-copy-fix" id="btn-copy-drill-fix" title="Copy corrected sentence to clipboard">
                            [Copy]
                          </button>
                        </div>
                      </div>
                      <div class="feedback-corrected-sentence" id="drill-corrected-target">
                        ${escapeHtml(drillFeedback.correctedSentence)}
                      </div>
                    </div>

                    <!-- Color-Coded Mistake & Word-Order Highlighting -->
                    <div class="feedback-section">
                      <span class="feedback-label">Correction & Diff Highlighting:</span>
                      <div class="feedback-diff-box">
                        ${drillFeedback.diffHtml || `<div class="corrected-text">${escapeHtml(drillFeedback.correctedSentence)}</div>`}
                      </div>
                    </div>

                    <div class="feedback-section">
                      <span class="feedback-label">Rule Explanation:</span>
                      <div class="feedback-val why-text">${escapeHtml(drillFeedback.why)}</div>
                    </div>

                    ${drillFeedback.naturalAlternative ? `
                      <div class="feedback-section">
                        <span class="feedback-label">Natural Native Phrasing:</span>
                        <div class="feedback-val natural-text">„${escapeHtml(drillFeedback.naturalAlternative)}“</div>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

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
                  ${hasKey
                    ? '<span class="ai-badge ai-online" title="Gemini 2.5 Flash Connected">[Gemini 2.5 Flash]</span>'
                    : '<span class="ai-badge ai-local" title="Deterministic local validator active.">[Local Checker]</span>'
                  }
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
                  <span class="keyhint-label">${this.isCheckingSandbox ? 'Checking Custom Sentence...' : 'Check Custom Sentence'}</span>
                </button>
              </div>

              ${this.sandboxFeedback ? `
                <div class="sandbox-feedback-card verdict-${(this.sandboxFeedback.verdict || '').toLowerCase().replace(/[^a-z]/g, '-')}">
                  <div class="feedback-badge-row">
                    <span class="verdict-pill verdict-${(this.sandboxFeedback.verdict || '').toLowerCase().replace(/[^a-z]/g, '-')}">
                      ${escapeHtml(this.sandboxFeedback.verdict)}
                    </span>
                    <span class="feedback-exp-pill">+${this.sandboxFeedback.expBonus || 15} EXP</span>
                    <span class="api-status-pill ${this.sandboxFeedback.apiStatus?.includes('local') ? 'pill-local' : 'pill-online'}" title="${escapeHtml(this.sandboxFeedback.errorMessage || '')}">
                      ${escapeHtml(this.sandboxFeedback.apiBadge || (this.sandboxFeedback.apiStatus?.includes('local') ? '[Offline Rule Check]' : '[AI Verified]'))}
                    </span>
                  </div>

                  <!-- Corrected Sentence with One-Tap Apply Fix and Copy actions -->
                  <div class="feedback-corrected-section">
                    <div class="feedback-corrected-label-row">
                      <span class="feedback-label">Corrected Sentence:</span>
                      <div class="feedback-actions-bar">
                        <button type="button" class="btn-action-pill btn-apply-fix" id="btn-apply-sandbox-fix" title="Apply this fix to your input">
                          [Apply Fix]
                        </button>
                        <button type="button" class="btn-action-pill btn-copy-fix" id="btn-copy-sandbox-fix" title="Copy corrected sentence to clipboard">
                          [Copy]
                        </button>
                      </div>
                    </div>
                    <div class="feedback-corrected-sentence" id="sandbox-corrected-target">
                      ${escapeHtml(this.sandboxFeedback.correctedSentence)}
                    </div>
                  </div>

                  <div class="feedback-section">
                    <span class="feedback-label">Evaluation Diff:</span>
                    <div class="feedback-diff-box">${this.sandboxFeedback.diffHtml || `<div class="corrected-text">${escapeHtml(this.sandboxFeedback.correctedSentence)}</div>`}</div>
                  </div>
                  <div class="feedback-section">
                    <span class="feedback-label">Rule Explanation:</span>
                    <div class="feedback-val why-text">${escapeHtml(this.sandboxFeedback.why)}</div>
                  </div>
                  ${this.sandboxFeedback.naturalAlternative ? `
                    <div class="feedback-section">
                      <span class="feedback-label">Natural Native Phrasing:</span>
                      <div class="feedback-val natural-text">„${escapeHtml(this.sandboxFeedback.naturalAlternative)}“</div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
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

  bindTopicDetailEvents(topic) {
    const drills = topic.drills || [];
    const totalDrills = drills.length;
    const currentDrill = drills[this.activeDrillIdx] || null;

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

    // Drill step navigation
    this.container.querySelector('#btn-prev-drill')?.addEventListener('click', () => {
      if (this.activeDrillIdx > 0) {
        sound.playClick();
        this.saveCurrentDrillInput();
        this.activeDrillIdx--;
        this.renderTopicDetail(topic);
      }
    });

    this.container.querySelector('#btn-next-drill')?.addEventListener('click', () => {
      if (this.activeDrillIdx < totalDrills - 1) {
        sound.playClick();
        this.saveCurrentDrillInput();
        this.activeDrillIdx++;
        this.renderTopicDetail(topic);
      }
    });

    this.container.querySelectorAll('.drill-pill-step').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.saveCurrentDrillInput();
        const step = parseInt(btn.getAttribute('data-step'), 10);
        if (!isNaN(step) && step >= 0 && step < totalDrills) {
          this.activeDrillIdx = step;
          this.renderTopicDetail(topic);
        }
      });
    });

    // Drill input textarea
    const drillTextarea = this.container.querySelector('#drill-sentence-textarea');
    if (drillTextarea) {
      drillTextarea.value = drillInputText;
      drillTextarea.addEventListener('input', (e) => {
        this.drillInputs.set(this.activeDrillIdx, e.target.value);
      });
      drillTextarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.submitDrillSentence(topic, currentDrill);
        }
      });
    }

    // Apply & Copy actions for drill correction
    this.container.querySelector('#btn-apply-drill-fix')?.addEventListener('click', (e) => {
      e.preventDefault();
      sound.playClick();
      const feedback = this.drillFeedbacks.get(this.activeDrillIdx);
      if (!feedback?.correctedSentence) return;
      const fixed = feedback.correctedSentence;
      this.drillInputs.set(this.activeDrillIdx, fixed);
      if (drillTextarea) {
        drillTextarea.value = fixed;
        drillTextarea.focus();
      }
      const btn = e.currentTarget;
      const orig = btn.textContent;
      btn.textContent = '✓ Applied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    });

    this.container.querySelector('#btn-copy-drill-fix')?.addEventListener('click', async (e) => {
      e.preventDefault();
      sound.playClick();
      const feedback = this.drillFeedbacks.get(this.activeDrillIdx);
      if (!feedback?.correctedSentence) return;
      const fixed = feedback.correctedSentence;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(fixed);
        } else {
          const ta = document.createElement('textarea');
          ta.value = fixed;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
      const btn = e.currentTarget;
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    });

    // Special characters for drill textarea
    this.container.querySelectorAll('.drill-char-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!drillTextarea) return;
        const char = btn.getAttribute('data-char');
        const start = drillTextarea.selectionStart ?? drillTextarea.value.length;
        const end = drillTextarea.selectionEnd ?? drillTextarea.value.length;
        const val = drillTextarea.value;
        drillTextarea.value = val.slice(0, start) + char + val.slice(end);
        drillTextarea.selectionStart = drillTextarea.selectionEnd = start + char.length;
        this.drillInputs.set(this.activeDrillIdx, drillTextarea.value);
        drillTextarea.focus();
      });
    });

    // Check Drill Sentence
    this.container.querySelector('#btn-check-drill-sentence')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.submitDrillSentence(topic, currentDrill);
    });

    // Toggle Drill Answer
    this.container.querySelector('#btn-toggle-drill-answer')?.addEventListener('click', () => {
      sound.playClick();
      if (this.drillAnswersRevealed.has(this.activeDrillIdx)) {
        this.drillAnswersRevealed.delete(this.activeDrillIdx);
      } else {
        this.drillAnswersRevealed.add(this.activeDrillIdx);
      }
      this.renderTopicDetail(topic);
    });

    // Audio button for target sentence
    this.container.querySelector('#btn-drill-audio')?.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      if (target) {
        state.playAudio(target);
      }
    });

    // Free Sandbox textarea
    const sandboxTextarea = this.container.querySelector('#sandbox-textarea');
    if (sandboxTextarea) {
      sandboxTextarea.value = this.sandboxText || '';
      sandboxTextarea.addEventListener('input', (e) => {
        this.sandboxText = e.target.value;
      });
      sandboxTextarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.submitSandboxSentence(topic);
        }
      });
    }

    // Apply & Copy actions for sandbox correction
    this.container.querySelector('#btn-apply-sandbox-fix')?.addEventListener('click', (e) => {
      e.preventDefault();
      sound.playClick();
      if (!this.sandboxFeedback?.correctedSentence) return;
      const fixed = this.sandboxFeedback.correctedSentence;
      this.sandboxText = fixed;
      if (sandboxTextarea) {
        sandboxTextarea.value = fixed;
        sandboxTextarea.focus();
      }
      const btn = e.currentTarget;
      const orig = btn.textContent;
      btn.textContent = '✓ Applied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    });

    this.container.querySelector('#btn-copy-sandbox-fix')?.addEventListener('click', async (e) => {
      e.preventDefault();
      sound.playClick();
      if (!this.sandboxFeedback?.correctedSentence) return;
      const fixed = this.sandboxFeedback.correctedSentence;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(fixed);
        } else {
          const ta = document.createElement('textarea');
          ta.value = fixed;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
      const btn = e.currentTarget;
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    });

    // Special characters for sandbox textarea
    this.container.querySelectorAll('.sandbox-char-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!sandboxTextarea) return;
        const char = btn.getAttribute('data-char');
        const start = sandboxTextarea.selectionStart ?? sandboxTextarea.value.length;
        const end = sandboxTextarea.selectionEnd ?? sandboxTextarea.value.length;
        const currentVal = sandboxTextarea.value;
        sandboxTextarea.value = currentVal.substring(0, start) + char + currentVal.substring(end);
        sandboxTextarea.selectionStart = sandboxTextarea.selectionEnd = start + char.length;
        sandboxTextarea.focus();
        this.sandboxText = sandboxTextarea.value;
      });
    });

    // Check Free Sandbox sentence
    this.container.querySelector('#btn-evaluate-free-sentence')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.submitSandboxSentence(topic);
    });
  }

  saveCurrentDrillInput() {
    const ta = this.container.querySelector('#drill-sentence-textarea');
    if (ta) {
      this.drillInputs.set(this.activeDrillIdx, ta.value);
    }
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

    // Update check button in place without wiping DOM or textarea input!
    const checkBtn = this.container.querySelector('#btn-check-drill-sentence');
    if (checkBtn) {
      checkBtn.disabled = true;
      checkBtn.classList.add('btn-loading');
      checkBtn.innerHTML = '<span class="micro-bracket">...</span> Checking Sentence...';
    }

    try {
      // Evaluate sentence through multi-tier pipeline with expected sentence context
      const feedback = await GeminiClient.evaluateSentence(
        userText,
        topic.title,
        state.targetLang,
        currentDrill?.target || ''
      );

      // Save feedback
      this.drillFeedbacks.set(this.activeDrillIdx, feedback);
      this.drillAnswersRevealed.add(this.activeDrillIdx);

      // Award EXP
      if (feedback && feedback.expBonus > 0) {
        const bonusLabel = feedback.verdict === 'Perfect!' ? 'Drill Master' : 'Drill Practice';
        state.addExp(feedback.expBonus, { label: bonusLabel, bonus: feedback.verdict === 'Perfect!' });
      }

      // Record grammar telemetry
      try {
        let perfectCount = 0;
        this.drillFeedbacks.forEach(f => {
          if (f.verdict === 'Perfect!') perfectCount++;
        });
        const totalTested = this.drillFeedbacks.size;
        const accuracyPct = totalTested > 0 ? (perfectCount / totalTested) * 100 : 0;
        const elapsed = Date.now() - (this.topicStartTime || Date.now());
        telemetry.recordGrammarDrill(topic.id, accuracyPct, elapsed);
      } catch (e) {}
    } catch (err) {
      console.warn('Drill evaluation error:', err);
    } finally {
      this.isCheckingDrill = false;
      this.renderTopicDetail(topic);
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

    // Update sandbox check button in place without wiping DOM or textarea input!
    const evalBtn = this.container.querySelector('#btn-evaluate-free-sentence');
    if (evalBtn) {
      evalBtn.disabled = true;
      evalBtn.classList.add('btn-loading');
      evalBtn.innerHTML = '<span class="micro-bracket">...</span> Checking Custom Sentence...';
    }

    try {
      const feedback = await GeminiClient.evaluateSentence(text, topic.title, state.targetLang);
      this.sandboxFeedback = feedback;
      if (feedback && feedback.expBonus > 0) {
        state.addExp(feedback.expBonus, { label: 'Sentence Master', bonus: feedback.verdict === 'Perfect!' });
      }
    } catch (err) {
      console.warn('Sandbox evaluation error:', err);
    } finally {
      this.isCheckingSandbox = false;
      this.renderTopicDetail(topic);
    }
  }
}
