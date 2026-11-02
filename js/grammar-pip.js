/**
 * ARL - Floating Grammar Picture-in-Picture (PiP) Window
 * Provides a draggable/docked 3-state reference window:
 *   1. Full View: Expansive topic rules, formula, examples, traps
 *   2. Minimized / Floating Reference: Compact floating dock (formula, core rule, topic switcher)
 *   3. Hidden: Completely closed (display: none / zero screen footprint)
 */

import { state } from './state.js';
import { sound } from './sound.js';

export class GrammarPip {
  constructor() {
    this.container = null;
    this.activeTopic = null;
    this.allTopics = [];
    this.viewState = 'hidden'; // 'hidden' | 'minimized' | 'full'
    this.conceptLang = 'mn'; // 'mn' | 'de' | 'en'
    this.posX = null;
    this.posY = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
  }

  get state() {
    return this.viewState;
  }

  mount(parentEl) {
    if (this.container && typeof document !== 'undefined' && document.body && document.body.contains(this.container)) return;

    if (parentEl && parentEl.classList) {
      this.container = parentEl;
      this.container.id = 'grammar-pip-container';
      if (typeof this.container.classList.add === 'function') {
        this.container.classList.add('grammar-pip-container', 'state-hidden');
      }
    } else if (typeof document !== 'undefined') {
      const parent = parentEl || document.body;
      this.container = document.createElement('div');
      this.container.id = 'grammar-pip-container';
      this.container.className = 'grammar-pip-container state-hidden';
      if (parent && typeof parent.appendChild === 'function') {
        parent.appendChild(this.container);
      }
    }

    this.loadTopics();
    this.render();
  }

  async loadTopics() {
    if (typeof window === 'undefined') return;
    try {
      const resp = await fetch(`data/${state.targetLang}/grammar.json`);
      if (resp.ok) {
        const folders = await resp.json();
        const list = [];
        folders.forEach(f => {
          (f.topics || []).forEach(t => {
            list.push({ ...t, folderLevel: f.level || '' });
          });
        });
        this.allTopics = list;
        if (!this.activeTopic && list.length > 0) {
          this.activeTopic = list[0];
        }
      }
    } catch (e) {
      console.warn('PiP could not load topics:', e);
    }
  }

  openTopic(topic) {
    this.activeTopic = topic;
    if (this.viewState === 'hidden') {
      this.viewState = 'minimized';
    }
    this.render();
  }

  openTopicById(topicId) {
    const found = this.allTopics.find(t => t.id === topicId);
    if (found) {
      this.openTopic(found);
    }
  }

  setViewState(newState) {
    if (['hidden', 'minimized', 'full'].includes(newState)) {
      this.viewState = newState;
      this.render();
    }
  }

  show(state = 'minimized') {
    this.setViewState(state);
  }

  minimize() {
    this.setViewState('minimized');
  }

  maximize() {
    this.setViewState('full');
  }

  toggle() {
    if (this.viewState === 'hidden') {
      this.viewState = 'minimized';
    } else {
      this.viewState = 'hidden';
    }
    this.render();
  }

  close() {
    this.viewState = 'hidden';
    this.render();
  }

  render() {
    if (!this.container) return;

    if (this.viewState === 'hidden') {
      this.container.style.display = 'none';
      this.container.className = 'grammar-pip-container state-hidden';
      this.container.innerHTML = '';
      return;
    }

    this.container.style.display = 'block';
    this.container.className = `grammar-pip-container state-${this.viewState}`;

    const topic = this.activeTopic || this.allTopics[0];
    if (!topic) {
      this.container.innerHTML = `
        <div class="pip-header">
          <span class="pip-title">Grammar Reference</span>
          <button class="pip-btn-close" id="pip-close-btn">✕</button>
        </div>
        <div class="pip-body"><p class="pip-empty">No topic selected.</p></div>
      `;
      this.bindControls();
      return;
    }

    const coreConceptText = (topic.core_concept && topic.core_concept[this.conceptLang]) ||
      (topic.core_concept && (topic.core_concept.mn || topic.core_concept.de || topic.core_concept.en)) || '';

    if (this.viewState === 'minimized') {
      this.container.innerHTML = `
        <div class="pip-minimized-card" id="pip-drag-handle">
          <div class="pip-min-header">
            <div class="pip-min-topic-select-wrap">
              <span class="pip-badge">${topic.folderLevel || 'RULE'}</span>
              <select class="pip-topic-selector" id="pip-topic-select" title="Switch grammar reference">
                ${this.allTopics.map(t => `
                  <option value="${t.id}" ${t.id === topic.id ? 'selected' : ''}>
                    ${t.title}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="pip-min-actions">
              <button class="pip-action-icon" id="pip-expand-btn" title="Expand to Full View">⤢</button>
              <button class="pip-action-icon" id="pip-close-btn" title="Close PiP">✕</button>
            </div>
          </div>

          <div class="pip-min-body">
            ${topic.pattern ? `
              <div class="pip-min-formula">
                <span class="pip-formula-label">Formula:</span>
                <code class="pip-formula-code">${topic.pattern}</code>
              </div>
            ` : ''}
            <div class="pip-min-concept">
              ${coreConceptText}
            </div>
          </div>
        </div>
      `;
    } else {
      // Full view
      this.container.innerHTML = `
        <div class="pip-full-card">
          <div class="pip-full-header" id="pip-drag-handle">
            <div class="pip-full-title-wrap">
              <span class="pip-badge-lg">${topic.folderLevel || 'GRAMMAR'}</span>
              <h3 class="pip-full-title">${topic.title}</h3>
            </div>
            <div class="pip-min-actions">
              <button class="pip-action-icon" id="pip-minimize-btn" title="Minimize to Floating Dock">🗕</button>
              <button class="pip-action-icon" id="pip-close-btn" title="Close PiP">✕</button>
            </div>
          </div>

          <div class="pip-topic-picker-bar">
            <select class="pip-topic-selector-full" id="pip-topic-select">
              ${this.allTopics.map(t => `
                <option value="${t.id}" ${t.id === topic.id ? 'selected' : ''}>
                  ${t.title}
                </option>
              `).join('')}
            </select>
            <div class="pip-lang-tabs">
              <button class="pip-lang-tab ${this.conceptLang === 'mn' ? 'active' : ''}" data-lang="mn">MN</button>
              <button class="pip-lang-tab ${this.conceptLang === 'de' ? 'active' : ''}" data-lang="de">DE</button>
              <button class="pip-lang-tab ${this.conceptLang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
            </div>
          </div>

          <div class="pip-full-scroll-body">
            <!-- Pattern -->
            ${topic.pattern ? `
              <div class="pip-section">
                <div class="pip-section-title"><span class="micro-bracket">[Pattern]</span> Satzbau / Structure:</div>
                <div class="pip-pattern-box"><code>${topic.pattern}</code></div>
              </div>
            ` : ''}

            <!-- Core Concept -->
            <div class="pip-section">
              <div class="pip-section-title"><span class="micro-bracket">[Rule]</span> Үндсэн дүрэм:</div>
              <div class="pip-concept-box">${coreConceptText}</div>
            </div>

            <!-- Common Trap -->
            ${topic.common_trap ? `
              <div class="pip-section pip-trap-section">
                <div class="pip-section-title"><span class="micro-bracket">[Trap]</span> Анхаарах алдаа:</div>
                <div class="pip-trap-box">${topic.common_trap}</div>
              </div>
            ` : ''}

            <!-- Examples -->
            ${topic.examples && topic.examples.length > 0 ? `
              <div class="pip-section">
                <div class="pip-section-title"><span class="micro-bracket">[Examples]</span> Жишээ өгүүлбэрүүд:</div>
                <div class="pip-examples-list">
                  ${topic.examples.map(ex => `
                    <div class="pip-example-item">
                      <div class="pip-ex-target">${ex.target}</div>
                      <div class="pip-ex-mn">${ex.mn || ''}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    this.bindControls();
  }

  bindControls() {
    this.container.querySelector('#pip-close-btn')?.addEventListener('click', () => {
      sound.playClick();
      this.close();
    });

    this.container.querySelector('#pip-minimize-btn')?.addEventListener('click', () => {
      sound.playClick();
      this.setViewState('minimized');
    });

    this.container.querySelector('#pip-expand-btn')?.addEventListener('click', () => {
      sound.playClick();
      this.setViewState('full');
    });

    const select = this.container.querySelector('#pip-topic-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const id = e.target.value;
        const found = this.allTopics.find(t => t.id === id);
        if (found) {
          this.activeTopic = found;
          this.render();
        }
      });
    }

    this.container.querySelectorAll('.pip-lang-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.conceptLang = tab.getAttribute('data-lang');
        this.render();
      });
    });

    this.setupDraggable();
  }

  setupDraggable() {
    const handle = this.container.querySelector('#pip-drag-handle');
    if (!handle) return;

    handle.style.cursor = 'move';
    handle.onmousedown = (e) => {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
      this.isDragging = true;
      const rect = this.container.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;

      const onMouseMove = (moveEvent) => {
        if (!this.isDragging) return;
        let left = moveEvent.clientX - this.dragOffset.x;
        let top = moveEvent.clientY - this.dragOffset.y;

        // Keep inside screen boundaries
        const maxLeft = window.innerWidth - this.container.offsetWidth - 10;
        const maxTop = window.innerHeight - this.container.offsetHeight - 10;
        left = Math.max(10, Math.min(left, maxLeft));
        top = Math.max(10, Math.min(top, maxTop));

        this.container.style.left = `${left}px`;
        this.container.style.top = `${top}px`;
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
      };

      const onMouseUp = () => {
        this.isDragging = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };
  }
}

export const grammarPip = new GrammarPip();
