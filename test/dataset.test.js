import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runDatasetTests(it) {
  const ROOT = path.resolve(__dirname, '..');
  console.log('\n--- Testing Datasets (Vocabulary, Grammar, Redemittel, Immersion, i18n) ---');

  it('data/i18n.json exists and contains complete mn, en, de translations', () => {
    const p = path.join(ROOT, 'data', 'i18n.json');
    assert(fs.existsSync(p), 'data/i18n.json missing');
    const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
    assert(data.mn && data.en && data.de, 'Missing primary language dictionaries');
    
    const requiredKeys = [
      'hud_vocab', 'hud_grammar', 'hud_media', 'hud_settings',
      'due', 'new', 'reveal', 'again', 'hard', 'good', 'easy', 'audio',
      'settings_title', 'target_lang', 'interface_lang', 'cefr_level',
      'core_concept_heading', 'pattern_heading', 'examples_heading', 'trap_heading'
    ];
    for (const lang of ['mn', 'en', 'de']) {
      for (const k of requiredKeys) {
        assert(data[lang][k], `Missing i18n key "${k}" in language "${lang}"`);
      }
    }
  });

  const deLevels = ['a1', 'a2', 'b1', 'b2'];
  for (const lvl of deLevels) {
    it(`data/de/vocab_${lvl}.json exists, valid JSON, complies with pedagogical cloze specs`, () => {
      const p = path.join(ROOT, 'data', 'de', `vocab_${lvl}.json`);
      assert(fs.existsSync(p), `vocab_${lvl}.json missing`);
      const words = JSON.parse(fs.readFileSync(p, 'utf-8'));
      assert(Array.isArray(words) && words.length > 0, `Expected non-empty array in vocab_${lvl}.json`);

      for (const w of words) {
        assert(w.id, 'Item missing id');
        assert(w.word, 'Item missing word');
        assert(w.prompt_front, `Item ${w.word} missing prompt_front`);
        assert(w.revealed_back, `Item ${w.word} missing revealed_back`);
        assert(w.mn, `Item ${w.word} missing Mongolian translation`);

        if (w.pos === 'noun') {
          assert(w.article && ['der', 'die', 'das'].includes(w.article), `Noun ${w.word} missing valid article`);
          assert(w.plural !== undefined, `Noun ${w.word} missing plural`);
          assert(w.prompt_front.includes('_____'), `Noun ${w.word} prompt_front missing cloze masking`);
          assert(w.revealed_back.includes(w.article), `Noun ${w.word} revealed_back missing article`);
        } else if (w.pos === 'verb') {
          assert(w.forms, `Verb ${w.word} missing principal forms`);
          assert(w.forms.includes('|'), `Verb ${w.word} forms must be separated by pipe: ${w.forms}`);
        }
      }
    });
  }

  const enLevels = ['a1', 'a2', 'b1', 'b2'];
  for (const lvl of enLevels) {
    it(`data/en/vocab_${lvl}.json exists, valid JSON, contains translations and prompt cloze`, () => {
      const p = path.join(ROOT, 'data', 'en', `vocab_${lvl}.json`);
      assert(fs.existsSync(p), `en vocab_${lvl}.json missing`);
      const words = JSON.parse(fs.readFileSync(p, 'utf-8'));
      assert(Array.isArray(words) && words.length > 0, `Expected non-empty array in en vocab_${lvl}.json`);

      for (const w of words) {
        assert(w.id, 'Item missing id');
        assert(w.word, 'Item missing word');
        assert(w.prompt_front, `Item ${w.word} missing prompt_front`);
        assert(w.revealed_back, `Item ${w.word} missing revealed_back`);
        assert(w.mn, `Item ${w.word} missing Mongolian translation`);
      }
    });
  }

  for (const lang of ['de', 'en']) {
    it(`data/${lang}/grammar.json has 4 folders and 4-part layout on every topic`, () => {
      const p = path.join(ROOT, 'data', lang, 'grammar.json');
      assert(fs.existsSync(p), `data/${lang}/grammar.json missing`);
      const folders = JSON.parse(fs.readFileSync(p, 'utf-8'));
      assert.strictEqual(folders.length, 4, `Expected exactly 4 folders in ${lang} grammar`);

      for (const folder of folders) {
        assert(folder.folder_id && folder.folder_name, 'Folder missing id or name');
        assert(Array.isArray(folder.topics) && folder.topics.length > 0, 'Folder missing topics');

        for (const topic of folder.topics) {
          assert(topic.id && topic.title, 'Topic missing id or title');
          assert(topic.core_concept, `Topic ${topic.id} missing core_concept`);
          assert(topic.core_concept.mn && topic.core_concept.en && topic.core_concept.de, `Topic ${topic.id} missing 3-language core_concept`);
          assert(topic.pattern && topic.pattern.trim().length > 0, `Topic ${topic.id} missing pattern`);
          assert(Array.isArray(topic.examples) && topic.examples.length > 0, `Topic ${topic.id} missing examples`);
          for (const ex of topic.examples) {
            assert(ex.target && ex.mn && ex.en, `Example in ${topic.id} missing target, mn, or en`);
          }
          assert(topic.common_trap && topic.common_trap.trim().length > 0, `Topic ${topic.id} missing common_trap`);
        }
      }
    });
  }

  for (const lang of ['de', 'en']) {
    it(`data/${lang}/redemittel.json contains 5 speaking discourse sections`, () => {
      const p = path.join(ROOT, 'data', lang, 'redemittel.json');
      assert(fs.existsSync(p), `data/${lang}/redemittel.json missing`);
      const red = JSON.parse(fs.readFileSync(p, 'utf-8'));
      assert(Array.isArray(red.sections) && red.sections.length === 5, 'Expected exactly 5 discourse sections');
      const expectedIds = ['einleitung', 'meinung', 'vor_nachteile', 'beispiele', 'schluss'];
      for (const expectedId of expectedIds) {
        const found = red.sections.find(s => s.id === expectedId);
        assert(found, `Section ${expectedId} missing in ${lang} redemittel`);
        assert(Array.isArray(found.items) && found.items.length > 0, `Section ${expectedId} has no items`);
      }
    });
  }

  for (const lang of ['de', 'en']) {
    it(`data/${lang}/immersion.json contains text-only recommendations with CEFR tags`, () => {
      const p = path.join(ROOT, 'data', lang, 'immersion.json');
      assert(fs.existsSync(p), `data/${lang}/immersion.json missing`);
      const items = JSON.parse(fs.readFileSync(p, 'utf-8'));
      assert(Array.isArray(items) && items.length > 0, 'Expected non-empty immersion array');
      for (const item of items) {
        assert(item.id && item.title, 'Immersion item missing id or title');
        assert(['book', 'podcast', 'show'].includes(item.type), `Invalid item type ${item.type}`);
        assert(item.level, 'Item missing level tag');
        assert(item.description && item.description.mn && item.description.en && item.description.de, 'Missing trilingual description');
      }
    });
  }
}
