import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const enGrammarPath = path.join(ROOT, 'data', 'en', 'grammar.json');
const enFolders = JSON.parse(fs.readFileSync(enGrammarPath, 'utf-8'));

const a1EnNew = [
  {
    id: "en_a1_questions_inversion",
    title: "Question Formation & Auxiliary Inversion (Do/Does/Is/Are)",
    core_concept: {
      mn: "Асуулт зохиох: Энгийн цагт үйл үгтэй бол 'do/does', to be үйл үгтэй бол 'am/is/are'-ийг эзэн биеийн өмнө гаргаж асуулт үүсгэнэ.",
      en: "Questions in English require auxiliary inversion: place 'do/does' (for action verbs) or 'am/is/are' (for state of being) directly before the subject.",
      de: "Fragebildung im Englischen verlangt Hilfsverb-Inversion: 'do/does' bzw. 'am/is/are' stehen vor dem Subjekt."
    },
    pattern: "W-Word + Auxiliary (do/does/is/are) + Subject + Base Verb / Complement + ?",
    examples: [
      {
        target: "Where do you live? — I live in London.",
        mn: "Чи хаана амьдардаг вэ? — Би Лондонд амьдардаг.",
        en: "Where do you live? — I live in London."
      },
      {
        target: "Does she speak German? — Yes, she does.",
        mn: "Тэр эмэгтэй германаар ярьдаг уу? — Тийм, ярьдаг.",
        en: "Does she speak German? — Yes, she does."
      }
    ],
    common_trap: "Do not say 'Where you live?' Always use the auxiliary verb: 'Where do you live?'"
  },
  {
    id: "en_a1_imperatives",
    title: "Imperatives & Polite Requests (Please / Let's)",
    core_concept: {
      mn: "Захирах хүсэх төлөв: Өгүүлбэрийг шууд үндсэн хувираагүй үйл үгээр эхлүүлнэ. Эелдэг болгохын тулд 'please', хамтдаа хийхэд 'let's' хэрэглэнэ.",
      en: "Imperatives use the bare base infinitive without a subject. Add 'please' for polite requests, and 'Let's' for collective suggestions.",
      de: "Befehlsformen und Bitten nutzen den bloßen Infinitiv ohne Subjekt. Höflichkeit wird durch 'please' und Vorschläge durch 'Let's' ausgedrückt."
    },
    pattern: "Affirmative: [Base Verb] + [Object/Complement]! | Negative: Don't + [Base Verb]!",
    examples: [
      {
        target: "Please listen carefully to the teacher.",
        mn: "Багшийг анхааралтай сонсоорой.",
        en: "Please listen carefully to the teacher."
      },
      {
        target: "Don't forget your keys!",
        mn: "Түлхүүрээ битгий мартаарай!",
        en: "Don't forget your keys!"
      }
    ],
    common_trap: "Never use 'You don't...' for imperative commands; use bare 'Don't...': 'Don't touch that!' not 'You don't touch that!'"
  }
];

const a2EnNew = [
  {
    id: "en_a2_comparatives_superlatives",
    title: "Comparatives & Superlatives (Adjective Gradation)",
    core_concept: {
      mn: "Харьцуулсан ба давуу зэрэг: Богино тэмдэг нэрэнд -er / -est (fast -> faster -> fastest), урт тэмдэг нэрэнд more / most (more beautiful, most beautiful) залгана.",
      en: "Comparison: Short 1-syllable adjectives take -er / the -est. Long adjectives (2+ syllables) use 'more' and 'the most'. Use 'than' for comparative.",
      de: "Steigerung der Adjektive: Einsilbige Adjektive erhalten -er / the -est, mehrsilbige 'more' / 'the most'. Vergleichspartikel ist 'than'."
    },
    pattern: "Comparative: [Adj-er / more Adj] + than | Superlative: the + [Adj-est / most Adj]",
    examples: [
      {
        target: "My new laptop is much faster than my old one.",
        mn: "Миний шинэ зөөврийн компьютер хуучнаасаа хамаагүй хурдан байна.",
        en: "My new laptop is much faster than my old one."
      },
      {
        target: "This is the most interesting book I have ever read.",
        mn: "Энэ бол миний уншиж байсан хамгийн сонирхолтой ном юм.",
        en: "This is the most interesting book I have ever read."
      }
    ],
    common_trap: "Never combine double comparatives: avoid 'more faster' (say 'faster') or 'most easiest' (say 'easiest')."
  },
  {
    id: "en_a2_gerunds_infinitives",
    title: "Verb Patterns: Gerund (-ing) vs. Infinitive (to do)",
    core_concept: {
      mn: "Үйл үгийн дараах хэлбэр: Зарим үйл үгсийн араас заавал -ing (enjoy, avoid, mind), заримынх нь араас to + үйл үг (want, decide, hope, promise) орно.",
      en: "Certain verbs are strictly followed by a gerund (-ing: enjoy, mind, consider, avoid), while others require a to-infinitive (want, decide, promise, afford).",
      de: "Verbmuster: Einige Verben verlangen zwingend das Gerundium (enjoy doing), andere den to-Infinitiv (decide to do)."
    },
    pattern: "Verb + Gerund (doing) OR Verb + Infinitive (to do)",
    examples: [
      {
        target: "She enjoys reading German literature in the evening.",
        mn: "Тэр эмэгтэй оройдоо германы уран зохиол унших дуртай.",
        en: "She enjoys reading German literature in the evening."
      },
      {
        target: "We decided to move to Munich next year.",
        mn: "Бид ирэх жил Мюнхен рүү нүүхээр шийдсэн.",
        en: "We decided to move to Munich next year."
      }
    ],
    common_trap: "Avoid saying 'I enjoy to swim'; say 'I enjoy swimming'. Avoid 'I want going'; say 'I want to go'."
  }
];

const b1EnNew = [
  {
    id: "en_b1_used_to_would",
    title: "Past Habits & States: 'Used to' vs. 'Would'",
    core_concept: {
      mn: "Өнгөрсөнд давтагддаг байсан зуршил ба төлөв: 'Used to'-г өнгөрсөн үеийн зуршил болон төлөв байдал (live, be, have) аль алинд нь хэрэглэнэ. 'Would'-ийг ЗӨВХӨН давтагддаг байсан үйлдлүүдэд хэрэглэнэ (төлөвт хэрэглэхгүй).",
      en: "'Used to' describes both past habits and past states that are no longer true. 'Would' describes repeated past actions, but NEVER past states.",
      de: "'Used to' beschreibt vergangene Gewohnheiten und Zustände. 'Would' beschreibt nur wiederholte Handlungen in der Vergangenheit, keine Zustände."
    },
    pattern: "Habit/State: Subject + used to + [Base Verb] | Action only: Subject + would + [Base Verb]",
    examples: [
      {
        target: "I used to live in Tokyo when I was a student.",
        mn: "Би оюутан байхдаа Токиод амьдардаг байсан (одоо амьдрахгүй).",
        en: "I used to live in Tokyo when I was a student."
      },
      {
        target: "Every summer, we would swim in the clear lake.",
        mn: "Зун бүр бид тунгалаг нууранд сэлдэг байсан.",
        en: "Every summer, we would swim in the clear lake."
      }
    ],
    common_trap: "Never say 'I would live in Tokyo' for a past state; use 'I used to live in Tokyo'."
  }
];

const b2EnNew = [
  {
    id: "en_b2_negative_inversion",
    title: "Inversion with Negative Adverbials (Seldom, Rarely, Never)",
    core_concept: {
      mn: "Үгүйсгэсэн дайвар үгээр эхэлсэн инверси: Seldom, Rarely, Hardly, Never, Under no circumstances зэрэг үг өгүүлбэрийн эхэнд орвол туслах үйл үг эзэн биеийнхээ өмнө гарна.",
      en: "Emphatic inversion: When sentences begin with negative or restrictive adverbials (Seldom, Rarely, Never, Under no circumstances, Not only), invert auxiliary and subject.",
      de: "Emphatische Inversion: Nach negativen Adverbialen an Position 1 steht das Hilfsverb vor dem Subjekt (Seldom have I seen...)."
    },
    pattern: "[Negative Adverbial] + [Auxiliary Verb] + [Subject] + [Main Verb] + [Rest of Clause]",
    examples: [
      {
        target: "Rarely have I witnessed such dedication and passion.",
        mn: "Би ийм их хичээл зүтгэл, хүсэл эрмэлзлийг ховорхон харж байсан.",
        en: "Rarely have I witnessed such dedication and passion."
      },
      {
        target: "Under no circumstances should you open this door.",
        mn: "Ямар ч тохиолдолд та энэ хаалгыг онгойлгож болохгүй.",
        en: "Under no circumstances should you open this door."
      }
    ],
    common_trap: "After a fronted negative adverbial, normal word order is incorrect: say 'Seldom do we see' not 'Seldom we see'."
  }
];

function appendTopics(folder, newTopics) {
  const existingIds = new Set(folder.topics.map(t => t.id));
  for (const t of newTopics) {
    if (!existingIds.has(t.id)) {
      folder.topics.push(t);
      existingIds.add(t.id);
    }
  }
}

appendTopics(enFolders[0], a1EnNew);
appendTopics(enFolders[1], a2EnNew);
appendTopics(enFolders[2], b1EnNew);
appendTopics(enFolders[3], b2EnNew);

fs.writeFileSync(enGrammarPath, JSON.stringify(enFolders, null, 2), 'utf-8');
console.log('Successfully updated en/grammar.json!');
console.log('Folder 1 (A1) now has:', enFolders[0].topics.length, 'topics');
console.log('Folder 2 (A2) now has:', enFolders[1].topics.length, 'topics');
console.log('Folder 3 (B1) now has:', enFolders[2].topics.length, 'topics');
console.log('Folder 4 (B2) now has:', enFolders[3].topics.length, 'topics');
