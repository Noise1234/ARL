import assert from 'assert';
import { state } from '../js/state.js';
import { StudyView } from '../js/views/study.js';
import { GrammarView } from '../js/views/grammar.js';
import { TopHudView } from '../js/views/hud.js';
import { SettingsModalView } from '../js/views/settings.js';

// Minimal mock DOM for Node.js test environment
class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.innerHTML = '';
    this.children = [];
    this._attributes = {};
    this._listeners = {};
    this.style = {};
    this.value = '';
    this.className = '';
  }

  getAttribute(name) { return this._attributes[name] || null; }
  setAttribute(name, val) { this._attributes[name] = String(val); }
  removeAttribute(name) { delete this._attributes[name]; }

  addEventListener(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  dispatchEvent(event) {
    const list = this._listeners[event.type || event] || [];
    for (const fn of list) fn(event);
  }

  querySelector(selector) {
    const all = this.querySelectorAll(selector);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(selector) {
    const matches = [];
    // Basic regex query simulator for IDs, classes, and attributes
    const isId = selector.startsWith('#');
    const isClass = selector.startsWith('.');
    const isAttr = selector.startsWith('[') && selector.endsWith(']');
    const target = selector.replace(/^[#.]/, '').replace(/^\[/, '').replace(/\]$/, '');

    const check = (html) => {
      if (isId) {
        return html.includes(`id="${target}"`) || html.includes(`id='${target}'`);
      }
      if (isClass) {
        return html.includes(`class="`) && html.includes(target);
      }
      if (isAttr) {
        return html.includes(target);
      }
      return false;
    };

    if (check(this.innerHTML)) {
      const el = new MockElement();
      el.selector = selector;
      matches.push(el);
    }
    return matches;
  }
}

export function runViewTests(it) {
  console.log('\n--- Testing View Component Mounting & Structural Integrity ---');

  it('TopHudView renders without crashing and includes Level & EXP progress track', () => {
    const container = new MockElement('header');
    const hud = new TopHudView(container, () => {});
    hud.render();
    assert(container.innerHTML.includes('hud-exp-badge'), 'Top HUD must include EXP badge');
    assert(container.innerHTML.includes('hud-level-pill'), 'Top HUD must include Level pill');
    assert(container.innerHTML.includes('hud-exp-track'), 'Top HUD must include EXP track');
  });

  it('StudyView renders centered on-card progress meter directly inside card', () => {
    const container = new MockElement('main');
    const study = new StudyView(container);

    state.cards = [{
      id: 'test_c1',
      word: 'Bewerbung',
      article: 'die',
      pos: 'noun',
      prompt_front: '_____ Bewerbung, -? [N]',
      revealed_back: 'die Bewerbung, -en'
    }];
    state.studyQueue = state.cards;
    state.currentCardIndex = 0;
    state.isCardRevealed = false;

    study.render();
    assert(container.innerHTML.includes('on-card-progress-container'), 'Card must have on-card-progress-container');
    assert(container.innerHTML.includes('card-progress-pill'), 'Card must have centered card-progress-pill');
    assert(container.innerHTML.includes('card-progress-track'), 'Card must have card-progress-track');
    assert(container.innerHTML.includes('card-progress-fill'), 'Card must have card-progress-fill');
    assert(container.innerHTML.includes('study-landscape-split'), 'Card must have landscape split layout class');
  });

  it('StudyView renders 3-stage hint when state.hintStage > 0', () => {
    const container = new MockElement('main');
    const study = new StudyView(container);

    state.hintStage = 1;
    study.render();
    assert(container.innerHTML.includes('card-progressive-hint-box'), 'Card must render progressive hint box');
    assert(container.innerHTML.includes('GENUS / CLASS'), 'Stage 1 must include GENUS / CLASS badge');

    state.hintStage = 0;
  });

  it('GrammarView detail view renders Interactive Sandbox with special character bar', () => {
    const container = new MockElement('main');
    const grammar = new GrammarView(container, () => {});
    const topic = {
      id: 'de_test_topic',
      title: 'Modalverben & Satzklammer',
      core_concept: { de: 'Erklärung', en: 'Explanation', mn: 'Тайлбар' },
      pattern: 'Subjekt + [Modalverb] + ... + [Infinitiv]',
      examples: [{ target: 'Ich kann Deutsch sprechen.', mn: 'Би...', en: 'I can...' }],
      common_trap: 'Achtung: Satzklammer!'
    };

    grammar.renderTopicDetail(topic);
    assert(container.innerHTML.includes('grammar-sandbox-card'), 'Topic detail must include grammar-sandbox-card');
    assert(container.innerHTML.includes('quick-char-bar'), 'Topic detail must include quick-char-bar');
    assert(container.innerHTML.includes('char-chip-btn'), 'Quick char bar must contain character chip buttons');
    assert(container.innerHTML.includes('sandbox-textarea'), 'Topic detail must include sandbox textarea');
    assert(container.innerHTML.includes('btn-check-sentence'), 'Topic detail must include check sentence button');
    assert(container.innerHTML.includes('grammar-split-layout'), 'Topic detail must support landscape split-layout');
  });

  it('SettingsModalView renders Free Gemini API key configuration row', () => {
    const container = new MockElement('div');
    const settings = new SettingsModalView(container, () => {});
    settings.render();
    assert(container.innerHTML.includes('settings-gemini-row'), 'Settings must include settings-gemini-row');
    assert(container.innerHTML.includes('settings-gemini-key-input'), 'Settings must include key input field');
    assert(container.innerHTML.includes('btn-save-gemini-key'), 'Settings must include save button');
    assert(container.innerHTML.includes('gemini-note-text'), 'Settings must explain local storage privacy');
  });
}
