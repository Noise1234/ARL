import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeDiff, renderColorCodedDiff } from '../js/diff.js';
import { NotesView } from '../js/views/notes.js';
import { grammarPip } from '../js/grammar-pip.js';
import { LexiconView } from '../js/views/lexicon.js';
import { state } from '../js/state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Minimal mock DOM element
class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.innerHTML = '';
    this._classes = new Set();
    this.classList = {
      add: (...cls) => cls.forEach(c => this._classes.add(c)),
      remove: (...cls) => cls.forEach(c => this._classes.delete(c)),
      contains: (c) => this._classes.has(c),
      toggle: (c) => {
        if (this._classes.has(c)) { this._classes.delete(c); return false; }
        else { this._classes.add(c); return true; }
      }
    };
    this.style = {};
    this.value = '';
    this._attributes = {};
    this._listeners = {};
  }

  get className() {
    return Array.from(this._classes).join(' ');
  }

  set className(val) {
    this._classes.clear();
    String(val || '').split(/\s+/).filter(Boolean).forEach(c => this._classes.add(c));
  }

  getAttribute(name) { return this._attributes[name] || null; }
  setAttribute(name, val) { this._attributes[name] = String(val); }
  removeAttribute(name) { delete this._attributes[name]; }

  addEventListener(event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  }

  querySelector(sel) {
    const list = this.querySelectorAll(sel);
    return list.length > 0 ? list[0] : null;
  }

  querySelectorAll(sel) {
    const cleanSel = sel.replace(/^[#.]/, '');
    if (this.innerHTML.includes(cleanSel)) {
      const el = new MockElement();
      el.className = cleanSel;
      return [el];
    }
    return [];
  }
}

export async function runMajorUpgradeTests(it) {
  console.log('\n--- Testing Major Feature Upgrade: 20-Sentence Drills & Wörterbuch Helper ---');

  // 1. German Grammar 20-Sentence Drills & Wörterbuch Check
  it('data/de/grammar.json contains 50 topics and each topic has exactly 20 drills (1,000 drills total)', () => {
    const deGrammarPath = path.join(ROOT, 'data', 'de', 'grammar.json');
    assert(fs.existsSync(deGrammarPath), 'data/de/grammar.json exists');
    const folders = JSON.parse(fs.readFileSync(deGrammarPath, 'utf8'));
    assert(Array.isArray(folders), 'Folders must be an array');
    
    let totalTopics = 0;
    let totalDrills = 0;

    for (const folder of folders) {
      assert(Array.isArray(folder.topics), 'folder.topics must be an array');
      for (const topic of folder.topics) {
        totalTopics++;
        assert(Array.isArray(topic.drills), `Topic ${topic.id} drills must be an array`);
        assert.strictEqual(topic.drills.length, 20, `Topic ${topic.id} must have exactly 20 drills, found ${topic.drills.length}`);
        
        for (let i = 0; i < topic.drills.length; i++) {
          const d = topic.drills[i];
          assert(d.prompt_mn && d.prompt_mn.trim().length > 0, `Topic ${topic.id} drill ${i} missing prompt_mn`);
          assert(d.target && d.target.trim().length > 0, `Topic ${topic.id} drill ${i} missing target`);
          assert(d.literal_mn && d.literal_mn.trim().length > 0, `Topic ${topic.id} drill ${i} missing literal_mn`);
          assert(d.natural_mn && d.natural_mn.trim().length > 0, `Topic ${topic.id} drill ${i} missing natural_mn`);
          assert(d.rule_breakdown && d.rule_breakdown.trim().length > 0, `Topic ${topic.id} drill ${i} missing rule_breakdown`);
          assert(Array.isArray(d.woerterbuch), `Topic ${topic.id} drill ${i} woerterbuch must be an array`);
          assert(d.woerterbuch.length > 0, `Topic ${topic.id} drill ${i} woerterbuch must have at least 1 entry`);
          
          for (const wb of d.woerterbuch) {
            assert(wb.word && wb.word.length > 0, `Wörterbuch item missing word in topic ${topic.id}`);
            assert(wb.meaning && wb.meaning.length > 0, `Wörterbuch item missing meaning in topic ${topic.id}`);
          }
        }
        totalDrills += topic.drills.length;
      }
    }

    assert.strictEqual(totalTopics, 50, `Expected 50 German topics, got ${totalTopics}`);
    assert.strictEqual(totalDrills, 1000, `Expected 1,000 German drills, got ${totalDrills}`);
  });

  // 2. English Grammar 20-Sentence Drills & Wörterbuch Check
  it('data/en/grammar.json contains 20 topics and each topic has exactly 20 drills (400 drills total)', () => {
    const enGrammarPath = path.join(ROOT, 'data', 'en', 'grammar.json');
    assert(fs.existsSync(enGrammarPath), 'data/en/grammar.json exists');
    const folders = JSON.parse(fs.readFileSync(enGrammarPath, 'utf8'));
    assert(Array.isArray(folders), 'Folders must be an array');
    
    let totalTopics = 0;
    let totalDrills = 0;

    for (const folder of folders) {
      assert(Array.isArray(folder.topics), 'folder.topics must be an array');
      for (const topic of folder.topics) {
        totalTopics++;
        assert(Array.isArray(topic.drills), `Topic ${topic.id} drills must be an array`);
        assert.strictEqual(topic.drills.length, 20, `Topic ${topic.id} must have exactly 20 drills, found ${topic.drills.length}`);
        
        for (let i = 0; i < topic.drills.length; i++) {
          const d = topic.drills[i];
          assert(d.prompt_mn && d.prompt_mn.trim().length > 0, `Topic ${topic.id} drill ${i} missing prompt_mn`);
          assert(d.target && d.target.trim().length > 0, `Topic ${topic.id} drill ${i} missing target`);
          assert(d.literal_mn && d.literal_mn.trim().length > 0, `Topic ${topic.id} drill ${i} missing literal_mn`);
          assert(d.natural_mn && d.natural_mn.trim().length > 0, `Topic ${topic.id} drill ${i} missing natural_mn`);
          assert(d.rule_breakdown && d.rule_breakdown.trim().length > 0, `Topic ${topic.id} drill ${i} missing rule_breakdown`);
          assert(Array.isArray(d.woerterbuch), `Topic ${topic.id} drill ${i} woerterbuch must be an array`);
          assert(d.woerterbuch.length > 0, `Topic ${topic.id} drill ${i} woerterbuch must have at least 1 entry`);
        }
        totalDrills += topic.drills.length;
      }
    }

    assert.strictEqual(totalTopics, 20, `Expected 20 English topics, got ${totalTopics}`);
    assert.strictEqual(totalDrills, 400, `Expected 400 English drills, got ${totalDrills}`);
  });

  console.log('\n--- Testing Color-Coded Mistake & Word-Order Highlighting (js/diff.js) ---');

  it('computeDiff accurately tags matching, misspelled, and syntax-misplaced tokens', () => {
    // 1. Perfect match
    const diff1 = computeDiff('Ich trinke Wasser.', 'Ich trinke Wasser.');
    assert(Array.isArray(diff1), 'computeDiff must return an array of segments');
    assert(diff1.every(item => item.type === 'correct'), 'All tokens in perfect match must be correct');

    // 2. Misspelling / wrong word (error)
    const diff2 = computeDiff('Ich trenke Waser.', 'Ich trinke Wasser.');
    const errorTypes = diff2.filter(d => d.type === 'error');
    assert(errorTypes.length >= 1, 'Must flag misspelled words as error');

    // 3. Subordinate clause word-order error (misplaced verb)
    // Target: "weil ich Zeit habe" | User: "weil ich habe Zeit"
    const diff3 = computeDiff('weil ich habe Zeit', 'weil ich Zeit habe', { why: 'Verb-end in subordinate clause' });
    const misplaced = diff3.filter(d => d.type === 'misplaced');
    assert(misplaced.length > 0, 'Must flag syntax word-order shift as misplaced');
  });

  it('renderColorCodedDiff outputs standard HTML spans with diff-error, diff-misplaced, diff-correct', () => {
    const html1 = renderColorCodedDiff('Ich trinke Wasser.', 'Ich trinke Wasser.');
    assert(html1.includes('class="diff-correct"'), 'Correct tokens rendered with diff-correct');

    const html2 = renderColorCodedDiff('Ich trenke Wasser.', 'Ich trinke Wasser.');
    assert(html2.includes('class="diff-error"'), 'Errors rendered with diff-error');

    const html3 = renderColorCodedDiff('weil ich habe Zeit', 'weil ich Zeit habe', { why: 'Verb-end in subordinate clause' });
    assert(html3.includes('class="diff-misplaced"'), 'Word order misplacements rendered with diff-misplaced');
  });

  console.log('\n--- Testing Smart Notes Workspace & Persistence (js/views/notes.js) ---');

  it('NotesView initializes, manages multiple notes, and persists to localStorage', () => {
    const mockStorage = {};
    global.localStorage = {
      getItem: (k) => mockStorage[k] || null,
      setItem: (k, v) => { mockStorage[k] = String(v); },
      removeItem: (k) => { delete mockStorage[k]; }
    };

    const container = new MockElement('main');
    const notesView = new NotesView(container);
    
    // Initial state: creates default Welcome note
    assert(Array.isArray(notesView.notes), 'notes must be an array');
    assert(notesView.notes.length >= 1, 'notes must start with at least 1 note');
    
    // Create new note
    const newNote = notesView.createNote('My German Practice');
    assert(newNote, 'createNote must return created note');
    assert.strictEqual(newNote.title, 'My German Practice');
    assert.strictEqual(notesView.activeNoteId, newNote.id);

    // Update note content
    notesView.updateActiveNote({ content: 'Ich gehe heute ins Kino, weil ich Zeit habe.' });
    const stored = JSON.parse(mockStorage['arl_smart_notes']);
    const activeStored = stored.find(n => n.id === newNote.id);
    assert(activeStored, 'Active note must be in localStorage');
    assert.strictEqual(activeStored.content, 'Ich gehe heute ins Kino, weil ich Zeit habe.');

    // Render workspace
    notesView.render();
    assert(container.innerHTML.includes('notes-workspace-container'), 'Workspace container present');
    assert(container.innerHTML.includes('notes-sidebar'), 'Notes sidebar present');
    assert(container.innerHTML.includes('notes-editor-panel'), 'Notes editor panel present');
    assert(container.innerHTML.includes('notes-selection-toolbar'), 'Selection toolbar present');
  });

  console.log('\n--- Testing Floating Grammar PiP 3-State Machine (js/grammar-pip.js) ---');

  it('grammarPip correctly manages 3 states: hidden, minimized, and full', () => {
    const container = new MockElement('div');
    grammarPip.mount(container);

    // 1. Initial state: hidden (zero screen space)
    assert.strictEqual(grammarPip.state, 'hidden');
    assert(container.classList.contains('state-hidden'));

    // 2. Open / Show in minimized floating reference mode
    grammarPip.show('minimized');
    assert.strictEqual(grammarPip.state, 'minimized');
    assert(container.classList.contains('state-minimized'));
    assert(!container.classList.contains('state-hidden'));

    // 3. Expand to full view
    grammarPip.show('full');
    assert.strictEqual(grammarPip.state, 'full');
    assert(container.classList.contains('state-full'));
    assert(!container.classList.contains('state-minimized'));

    // 4. Minimize back
    grammarPip.minimize();
    assert.strictEqual(grammarPip.state, 'minimized');
    assert(container.classList.contains('state-minimized'));

    // 5. Close / hide completely
    grammarPip.close();
    assert.strictEqual(grammarPip.state, 'hidden');
    assert(container.classList.contains('state-hidden'));
  });

  console.log('\n--- Testing Lexicon CEFR Filtering and 50-Word Pagination (js/views/lexicon.js) ---');

  it('LexiconView supports CEFR level filtering and 50-word pagination', () => {
    const container = new MockElement('main');
    const lexicon = new LexiconView(container);

    // Populate mock cards with various levels
    state.cards = [];
    for (let i = 0; i < 125; i++) {
      const lvl = i < 40 ? 'a1' : (i < 80 ? 'a2' : (i < 110 ? 'b1' : 'b2'));
      state.cards.push({
        id: `card_${i}`,
        word: `Word_${i}`,
        level: lvl,
        pos: 'noun',
        mn: `Утга ${i}`,
        article: 'der'
      });
    }

    // Default: 'all' level filter -> 125 cards / 50 per page = 3 pages
    lexicon.render();
    assert.strictEqual(lexicon.levelFilter, 'all');
    assert.strictEqual(lexicon.pageSize, 50);
    assert.strictEqual(lexicon.currentPage, 1);
    assert(container.innerHTML.includes('lexicon-pagination-bar'), 'Pagination bar rendered');
    assert(container.innerHTML.includes('Page <strong>1</strong> of <strong>3</strong>'), 'Page 1 of 3 indicated');

    // Page 2 navigation
    lexicon.goToPage(2);
    assert.strictEqual(lexicon.currentPage, 2);

    // Filter by 'a1': 40 items -> fits on 1 page (40 / 50)
    lexicon.setLevelFilter('a1');
    assert.strictEqual(lexicon.levelFilter, 'a1');
    assert.strictEqual(lexicon.currentPage, 1);
    assert(container.innerHTML.includes('40 / 125 words'), 'Filter count accurately reported');
  });

  console.log('\n--- Testing Massive 3,000-Word Target Per Language Track ---');

  it('German vocabulary track contains >= 3,000 verified words across A1-B2', () => {
    let deCount = 0;
    for (const lvl of ['a1', 'a2', 'b1', 'b2']) {
      const filePath = path.join(ROOT, 'data', 'de', `vocab_${lvl}.json`);
      assert(fs.existsSync(filePath), `data/de/vocab_${lvl}.json exists`);
      const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      assert(Array.isArray(items), `${lvl} items must be an array`);
      deCount += items.length;
    }
    assert(deCount >= 3000, `German track target is 3,000+ words, found ${deCount}`);
  });

  it('English vocabulary track contains >= 3,000 verified words across A1-B2', () => {
    let enCount = 0;
    for (const lvl of ['a1', 'a2', 'b1', 'b2']) {
      const filePath = path.join(ROOT, 'data', 'en', `vocab_${lvl}.json`);
      assert(fs.existsSync(filePath), `data/en/vocab_${lvl}.json exists`);
      const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      assert(Array.isArray(items), `${lvl} items must be an array`);
      enCount += items.length;
    }
    assert(enCount >= 3000, `English track target is 3,000+ words, found ${enCount}`);
  });
}
