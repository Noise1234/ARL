/**
 * ARL - Floating Grammar Picture-in-Picture (PiP) Window
 * Provides a draggable & resizable 3-state reference window:
 *   1. Full View: Expansive topic rules, formula, examples, traps
 *   2. Minimized / Floating Reference: Compact floating dock (formula, core rule, topic switcher)
 *   3. Hidden: Completely closed (display: none / zero screen footprint)
 *
 * Implements:
 *   - Free dragging with boundary clamping on every frame and on window.resize
 *   - Clamped coordinates:
 *       left = Math.max(8, Math.min(left, window.innerWidth - pip.offsetWidth - 8))
 *       top = Math.max(52, Math.min(top, window.innerHeight - pip.offsetHeight - 68))
 *   - Diagonal drag-resize handle (nwse-resize, 240px to 94vw, 180px to 82vh)
 *   - Header quick presets: [S], [M], [L], [_], and [✕]
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
    this.customWidth = null;
    this.customHeight = null;
    this.isDragging = false;
    this.isResizing = false;
    this.dragOffset = { x: 0, y: 0 };
    this.resizeStart = { x: 0, y: 0, w: 0, h: 0 };

    this.setupWindowResizeListener();
  }

  get state() {
    return this.viewState;
  }

  setupWindowResizeListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.clampPosition();
      });
    }
  }

  clampPosition() {
    if (!this.container || typeof window === 'undefined') return;
    const pip = this.container;
    const offsetW = pip.offsetWidth || 320;
    const offsetH = pip.offsetHeight || 220;

    let left = this.posX;
    let top = this.posY;

    if (left !== null && top !== null) {
      left = Math.max(8, Math.min(left, window.innerWidth - offsetW - 8));
      top = Math.max(52, Math.min(top, window.innerHeight - offsetH - 68));

      this.posX = left;
      this.posY = top;
      pip.style.left = `${left}px`;
      pip.style.top = `${top}px`;
      pip.style.right = 'auto';
      pip.style.bottom = 'auto';
    }
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

  applySizePreset(preset) {
    if (!this.container) return;
    if (preset === 'S') {
      this.customWidth = 280;
      this.customHeight = 210;
      this.viewState = 'minimized';
    } else if (preset === 'M') {
      this.customWidth = 380;
      this.customHeight = 320;
      this.viewState = 'minimized';
    } else if (preset === 'L') {
      this.customWidth = 520;
      this.customHeight = 460;
      this.viewState = 'full';
    }
    this.container.style.width = `${this.customWidth}px`;
    this.container.style.height = `${this.customHeight}px`;
    this.render();
    this.clampPosition();
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

    if (this.customWidth && this.container.style) {
      this.container.style.width = `${this.customWidth}px`;
    }
    if (this.customHeight && this.container.style) {
      this.container.style.height = `${this.customHeight}px`;
    }

    const topic = this.activeTopic || this.allTopics[0];
    if (!topic) {
      this.container.innerHTML = `
        <div class="pip-header" id="pip-drag-handle">
          <span class="pip-title">Grammar Reference</span>
          <div class="pip-controls-row">
            <button class="pip-btn-ctrl" id="pip-close-btn" title="Close">✕</button>
          </div>
        </div>
        <div class="pip-body"><p class="pip-empty">No topic selected.</p></div>
        <div class="pip-resize-handle" id="pip-resize-handle" title="Resize PiP"></div>
      `;
      this.bindControls();
      return;
    }

    const coreConceptText = (topic.core_concept && topic.core_concept[this.conceptLang]) ||
      (topic.core_concept && (topic.core_concept.mn || topic.core_concept.de || topic.core_concept.en)) || '';

    const controlsHtml = `
      <div class="pip-presets-group">
        <button class="pip-preset-btn" data-preset="S" title="Small Preset">[S]</button>
        <button class="pip-preset-btn" data-preset="M" title="Medium Preset">[M]</button>
        <button class="pip-preset-btn" data-preset="L" title="Large Preset">[L]</button>
        <button class="pip-preset-btn" id="pip-pill-btn" title="Minimize to Pill">[_]</button>
        <button class="pip-preset-btn pip-close-btn" id="pip-close-btn" title="Close PiP [✕]">✕</button>
      </div>
    `;

    if (this.viewState === 'minimized') {
      this.container.innerHTML = `
        <div class="pip-minimized-card">
          <!-- Draggable Header -->
          <div class="pip-min-header" id="pip-drag-handle" style="touch-action: none; cursor: move;">
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
            ${controlsHtml}
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

          <!-- Bottom-Right Resize Handle -->
          <div class="pip-resize-handle" id="pip-resize-handle" title="Drag to Resize" style="touch-action: none; cursor: nwse-resize;"></div>
        </div>
      `;
    } else {
      // Full view
      this.container.innerHTML = `
        <div class="pip-full-card">
          <!-- Draggable Header -->
          <div class="pip-full-header" id="pip-drag-handle" style="touch-action: none; cursor: move;">
            <div class="pip-full-title-wrap">
              <span class="pip-badge-lg">${topic.folderLevel || 'GRAMMAR'}</span>
              <h3 class="pip-full-title">${topic.title}</h3>
            </div>
            ${controlsHtml}
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

          <!-- Bottom-Right Resize Handle -->
          <div class="pip-resize-handle" id="pip-resize-handle" title="Drag to Resize" style="touch-action: none; cursor: nwse-resize;"></div>
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

    this.container.querySelector('#pip-pill-btn')?.addEventListener('click', () => {
      sound.playClick();
      this.setViewState('minimized');
    });

    this.container.querySelectorAll('.pip-preset-btn[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.applySizePreset(btn.getAttribute('data-preset'));
      });
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

    this.setupPointerDragging();
    this.setupPointerResizing();
  }

  /**
   * PointerEvent Free Dragging with Boundary Clamping
   */
  setupPointerDragging() {
    const handle = this.container.querySelector('#pip-drag-handle');
    if (!handle || typeof window === 'undefined') return;

    handle.onpointerdown = (e) => {
      if (['SELECT', 'BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) return;
      if (e.target.closest('button') || e.target.closest('select')) return;

      if (e.preventDefault) e.preventDefault();
      try { handle.setPointerCapture(e.pointerId); } catch {}

      this.isDragging = true;
      const rect = this.container.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;

      const onPointerMove = (moveEvent) => {
        if (!this.isDragging) return;
        const pip = this.container;
        let left = moveEvent.clientX - this.dragOffset.x;
        let top = moveEvent.clientY - this.dragOffset.y;

        // Strictly clamp coordinates as specified:
        // left = Math.max(8, Math.min(left, window.innerWidth - pip.offsetWidth - 8))
        // top = Math.max(52, Math.min(top, window.innerHeight - pip.offsetHeight - 68))
        left = Math.max(8, Math.min(left, window.innerWidth - pip.offsetWidth - 8));
        top = Math.max(52, Math.min(top, window.innerHeight - pip.offsetHeight - 68));

        this.posX = left;
        this.posY = top;
        pip.style.left = `${left}px`;
        pip.style.top = `${top}px`;
        pip.style.right = 'auto';
        pip.style.bottom = 'auto';
      };

      const onPointerUp = (upEvent) => {
        this.isDragging = false;
        try { handle.releasePointerCapture(upEvent.pointerId); } catch {}
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    };
  }

  /**
   * Diagonal drag-resize handle: nwse-resize (240px to 94vw, 180px to 82vh)
   */
  setupPointerResizing() {
    const resizeHandle = this.container.querySelector('#pip-resize-handle');
    if (!resizeHandle || typeof window === 'undefined') return;

    resizeHandle.onpointerdown = (e) => {
      if (e.preventDefault) e.preventDefault();
      e.stopPropagation();
      try { resizeHandle.setPointerCapture(e.pointerId); } catch {}

      this.isResizing = true;
      const rect = this.container.getBoundingClientRect();
      this.resizeStart = {
        x: e.clientX,
        y: e.clientY,
        w: rect.width,
        h: rect.height
      };

      const onPointerMove = (moveEvent) => {
        if (!this.isResizing) return;
        const dx = moveEvent.clientX - this.resizeStart.x;
        const dy = moveEvent.clientY - this.resizeStart.y;

        const minW = 240;
        const maxW = Math.floor(window.innerWidth * 0.94);
        const minH = 180;
        const maxH = Math.floor(window.innerHeight * 0.82);

        const newW = Math.max(minW, Math.min(maxW, this.resizeStart.w + dx));
        const newH = Math.max(minH, Math.min(maxH, this.resizeStart.h + dy));

        this.customWidth = newW;
        this.customHeight = newH;
        this.container.style.width = `${newW}px`;
        this.container.style.height = `${newH}px`;
        this.clampPosition();
      };

      const onPointerUp = (upEvent) => {
        this.isResizing = false;
        try { resizeHandle.releasePointerCapture(upEvent.pointerId); } catch {}
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    };
  }
}

export const grammarPip = new GrammarPip();
