/**
 * ARL - Structured Grammar & Redemittel View
 * 4 Folders (A1 - B2) strictly adhering to 4-part pedagogical layout:
 * 1. Core Concept, 2. The Pattern, 3. Examples, 4. Common Trap.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { keyboard, KeyboardState } from '../keyboard.js';

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
      this.render();
    }
  }

  toggleRedemittel() {
    this.isRedemittelActive = !this.isRedemittelActive;
    this.activeTopic = null;
    this.render();
  }

  nextTopic() {
    if (this.isRedemittelActive) return;
    const folder = this.folders[this.currentFolderIdx];
    if (folder && folder.topics && folder.topics.length > 0) {
      this.selectedTopicIdx = (this.selectedTopicIdx + 1) % folder.topics.length;
      this.render();
    }
  }

  prevTopic() {
    if (this.isRedemittelActive) return;
    const folder = this.folders[this.currentFolderIdx];
    if (folder && folder.topics && folder.topics.length > 0) {
      this.selectedTopicIdx = (this.selectedTopicIdx - 1 + folder.topics.length) % folder.topics.length;
      this.render();
    }
  }

  openSelectedTopic() {
    if (this.isRedemittelActive) return;
    const folder = this.folders[this.currentFolderIdx];
    if (folder && folder.topics && folder.topics.length > 0) {
      if (this.selectedTopicIdx >= folder.topics.length) {
        this.selectedTopicIdx = 0;
      }
      this.activeTopic = folder.topics[this.selectedTopicIdx];
      this.render();
    }
  }

  backToList() {
    this.activeTopic = null;
    this.render();
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

    this.container.innerHTML = `
      <div class="grammar-view-container">
        <!-- Folders Header Tabs -->
        <div class="grammar-nav-bar">
          <div class="grammar-folders-tabs">
            ${this.folders.map((f, i) => `
              <button class="grammar-tab-btn ${i === this.currentFolderIdx && !this.isRedemittelActive ? 'active' : ''}" data-idx="${i}">
                <span class="micro-bracket">[${i + 1}]</span> ${f.level}
              </button>
            `).join('')}
            <button class="grammar-tab-btn ${this.isRedemittelActive ? 'active' : ''}" id="btn-tab-redemittel">
              <span class="micro-bracket">[R]</span> ${t('redemittel_tab')}
            </button>
          </div>
        </div>

        <!-- Folder Title -->
        <div class="folder-header-title">
          <span class="folder-badge">${currentFolder.folder_name || 'Grammar'}</span>
        </div>

        <!-- Topics List -->
        <div class="topics-list" role="list">
          ${currentFolder.topics.map((t, idx) => `
            <div class="topic-item ${idx === this.selectedTopicIdx ? 'selected' : ''}" data-idx="${idx}" role="button" tabindex="0">
              <span class="topic-num">${String(idx + 1).padStart(2, '0')}.</span>
              <span class="topic-title">${t.title}</span>
              <span class="topic-arrow">→</span>
            </div>
          `).join('')}
        </div>

        <!-- Keyhint Footer -->
        <div class="view-keyhints-bar">
          <span class="micro-keyhint"><span class="micro-bracket">[1-4]</span> Folder</span>
          <span class="micro-keyhint"><span class="micro-bracket">[↑/↓ or J/K]</span> Select</span>
          <span class="micro-keyhint"><span class="micro-bracket">[Enter]</span> Open</span>
          <span class="micro-keyhint"><span class="micro-bracket">[V]</span> Vocab</span>
        </div>
      </div>
    `;

    // Folder tab clicks
    this.container.querySelectorAll('.grammar-tab-btn[data-idx]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.setFolderIndex(idx);
      });
    });

    this.container.querySelector('#btn-tab-redemittel')?.addEventListener('click', () => {
      this.toggleRedemittel();
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
              <button class="grammar-tab-btn" data-idx="${i}">
                <span class="micro-bracket">[${i + 1}]</span> ${f.level}
              </button>
            `).join('')}
            <button class="grammar-tab-btn active" id="btn-tab-redemittel">
              <span class="micro-bracket">[R]</span> ${t('redemittel_tab')}
            </button>
          </div>
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
          <span class="micro-keyhint"><span class="micro-bracket">[1-4]</span> Folders</span>
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
    const uiLang = state.interfaceLang;
    const coreConceptText = topic.core_concept[uiLang] || topic.core_concept.en || topic.core_concept.de || '';

    this.container.innerHTML = `
      <div class="grammar-view-container">
        <!-- Top Back Bar -->
        <div class="topic-detail-header">
          <button class="btn-back-link" id="btn-back-to-list" title="Keyboard: Esc">
            ${t('back_to_grammar')}
          </button>
        </div>

        <article class="grammar-topic-card">
          <h2 class="topic-header-title">${topic.title}</h2>

          <!-- 1. Core Concept -->
          <section class="topic-part">
            <h3 class="part-heading">${t('core_concept_heading')}</h3>
            <p class="concept-body">${coreConceptText}</p>
          </section>

          <!-- 2. Pattern / Formula -->
          <section class="topic-part">
            <h3 class="part-heading">${t('pattern_heading')}</h3>
            <div class="pattern-formula-box">
              <code>${topic.pattern}</code>
            </div>
          </section>

          <!-- 3. Examples -->
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

          <!-- 4. Common Trap -->
          <section class="topic-part trap-section">
            <h3 class="part-heading trap-heading">${t('trap_heading')}</h3>
            <div class="trap-box">
              <span class="trap-bullet">⚠</span>
              <span class="trap-text">${topic.common_trap}</span>
            </div>
          </section>
        </article>

        <!-- Keyhint Footer -->
        <div class="view-keyhints-bar">
          <span class="micro-keyhint"><span class="micro-bracket">[Esc]</span> Back</span>
          <span class="micro-keyhint"><span class="micro-bracket">[V]</span> Vocab</span>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-back-to-list')?.addEventListener('click', () => {
      this.backToList();
    });
  }
}
