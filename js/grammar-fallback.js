/**
 * ARL - Local Deterministic Grammar Fallback Engine
 * Provides instant, zero-latency linguistic feedback for German & English grammar
 * when offline or when no AI endpoint is accessible.
 */

import { renderColorCodedDiff } from './diff.js';

export function evaluateRuleFallback(input, targetTopic = '', targetLang = 'de', expectedSentence = '') {
  const text = String(input ?? '').trim();
  if (!text) {
    return {
      verdict: 'Needs Correction',
      correctedSentence: '',
      why: 'Input is empty. Please write a sentence using the grammar rule.',
      naturalAlternative: '',
      expBonus: 0,
      diffHtml: '<span class="diff-error">Empty input</span>'
    };
  }

  // If an expected sentence is provided (e.g. from drill) and user input is already exact
  if (expectedSentence && typeof expectedSentence === 'string') {
    const cleanExpected = expectedSentence.trim();
    if (text === cleanExpected) {
      return {
        verdict: 'Perfect!',
        correctedSentence: cleanExpected,
        why: 'Syntactically accurate! Exactly matches the expected target sentence.',
        naturalAlternative: cleanExpected,
        expBonus: 50,
        diffHtml: `<span class="diff-correct">${cleanExpected}</span>`
      };
    }
    // Case-insensitive match check
    if (text.toLowerCase() === cleanExpected.toLowerCase()) {
      const why = 'Capitalization or punctuation needed slight adjustment.';
      return {
        verdict: 'Almost There',
        correctedSentence: cleanExpected,
        why,
        naturalAlternative: cleanExpected,
        expBonus: 35,
        diffHtml: renderColorCodedDiff(text, cleanExpected, { why })
      };
    }
  }

  const res = targetLang === 'de'
    ? evaluateGermanSentence(text, targetTopic, expectedSentence)
    : evaluateEnglishSentence(text, targetTopic, expectedSentence);

  if (!res.diffHtml) {
    res.diffHtml = renderColorCodedDiff(text, res.correctedSentence, { why: res.why });
  }
  return res;
}

function evaluateGermanSentence(text, topic, expectedSentence = '') {
  let current = text;
  const whyPoints = [];
  let isMajorGrammarError = false;
  let isMinorError = false;

  // 1. Check Subordinate Clause Verb-End (Nebensatz: weil, dass, wenn, obwohl, da, damit)
  const tokens = current.split(/\s+/);
  const cleanTokens = tokens.map(t => t.replace(/[.,!?;:„"“”«»()]/g, ''));
  const subjunctions = ['weil', 'dass', 'daß', 'wenn', 'obwohl', 'da', 'damit', 'nachdem', 'während'];
  
  let nebensatzFixed = false;
  for (let i = 0; i < cleanTokens.length; i++) {
    const wordLower = cleanTokens[i].toLowerCase();
    if (subjunctions.includes(wordLower) && i + 2 < cleanTokens.length) {
      const finiteVerbs = [
        'bin', 'bist', 'ist', 'sind', 'seid', 'war', 'warst', 'waren', 'wart',
        'habe', 'hast', 'hat', 'haben', 'habt', 'hatte', 'hattest', 'hatten',
        'kann', 'kannst', 'können', 'könnt', 'konnte', 'konnten',
        'muss', 'musst', 'müssen', 'müsst', 'musste', 'mussten',
        'will', 'willst', 'wollen', 'wollt', 'wollte', 'wollten',
        'darf', 'darfst', 'dürfen', 'dürft', 'durfte',
        'soll', 'sollst', 'sollen', 'sollt',
        'geht', 'macht', 'lerne', 'lernt', 'bleibt', 'arbeite', 'arbeitet'
      ];
      const nextWord = cleanTokens[i + 1].toLowerCase();
      const thirdWord = cleanTokens[i + 2].toLowerCase();
      const subjects = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man', 'mein', 'meine', 'der', 'die', 'das'];

      if (subjects.includes(nextWord) && finiteVerbs.includes(thirdWord) && i + 3 < cleanTokens.length) {
        // Verb is placed right after subject inside Nebensatz
        const beforeSub = tokens.slice(0, i + 1).join(' ');
        const subClauseTokens = tokens.slice(i + 1);
        const badVerb = subClauseTokens[1];
        const remaining = subClauseTokens.filter((_, idx) => idx !== 1);
        const correctedSub = `${remaining.join(' ').replace(/[.,!?]$/, '')} ${badVerb}.`;
        current = `${beforeSub} ${correctedSub}`;
        whyPoints.push(`Nebensatz rule: Conjunction "${cleanTokens[i]}" requires the finite verb ("${badVerb}") at the very end of the clause.`);
        isMajorGrammarError = true;
        nebensatzFixed = true;
        break;
      }
    }
  }

  // 2. Check Inversion Rule after Fronted Adverbials (deshalb, trotzdem, heute, gestern, etc.)
  if (!nebensatzFixed) {
    const currentTokens = current.split(/\s+/);
    const cleanCurTokens = currentTokens.map(t => t.replace(/[.,!?;:„"“”«»()]/g, ''));
    const frontedAdverbs = ['heute', 'gestern', 'morgen', 'leider', 'deshalb', 'deswegen', 'trotzdem', 'sonst', 'außerdem', 'oft', 'manchmal', 'jetzt', 'hier'];
    const firstLower = cleanCurTokens[0]?.toLowerCase();
    if (frontedAdverbs.includes(firstLower) && cleanCurTokens.length >= 3) {
      const secondLower = cleanCurTokens[1]?.toLowerCase();
      const subjects = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man'];
      if (subjects.includes(secondLower)) {
        current = `${currentTokens[0]} ${currentTokens[2]} ${currentTokens[1]} ${currentTokens.slice(3).join(' ')}`.trim();
        whyPoints.push('Inversion (V2): When a sentence starts with an adverbial element in Position 1, the finite verb must immediately follow in Position 2.');
        isMajorGrammarError = true;
      }
    }
  }

  // 3. Modal Verb Satzklammer Check (modal verb in Pos 2, infinitive at end)
  const modalTokens = current.split(/\s+/);
  const cleanModalTokens = modalTokens.map(t => t.replace(/[.,!?;:„"“”«»()]/g, ''));
  const modalVerbs = ['kann', 'kannst', 'können', 'könnt', 'muss', 'musst', 'müssen', 'müsst', 'darf', 'darfst', 'dürfen', 'dürft', 'soll', 'sollst', 'sollen', 'will', 'willst', 'wollen', 'möchte', 'möchtest', 'möchten'];
  let foundModalIdx = -1;
  for (let i = 0; i < cleanModalTokens.length; i++) {
    if (modalVerbs.includes(cleanModalTokens[i].toLowerCase())) {
      foundModalIdx = i;
      break;
    }
  }

  if (foundModalIdx !== -1 && cleanModalTokens.length > foundModalIdx + 2) {
    const nonVerbEnWords = [
      'einen', 'keinen', 'meinen', 'deinen', 'seinen', 'ihren', 'unseren', 'euren',
      'ihnen', 'den', 'dem', 'des', 'uns', 'euch', 'morgen', 'gestern', 'draußen',
      'drinnen', 'oben', 'unten', 'hinten', 'vorn', 'vorne', 'außen', 'innen',
      'schon', 'gern', 'gerne', 'immer', 'oft', 'selten', 'nicht', 'hier', 'dort'
    ];

    const lastWord = cleanModalTokens[cleanModalTokens.length - 1]?.toLowerCase();
    const sentenceAlreadyEndsWithInfinitive = lastWord &&
      (lastWord.endsWith('en') || lastWord.endsWith('ern') || lastWord.endsWith('eln')) &&
      !nonVerbEnWords.includes(lastWord);

    const adjacentWord = cleanModalTokens[foundModalIdx + 1]?.toLowerCase();
    const isAdjacentInfinitiveVerb = adjacentWord &&
      (adjacentWord.endsWith('en') || adjacentWord.endsWith('ern') || adjacentWord.endsWith('eln')) &&
      !nonVerbEnWords.includes(adjacentWord);

    if (isAdjacentInfinitiveVerb && !sentenceAlreadyEndsWithInfinitive) {
      const modalWord = modalTokens[foundModalIdx];
      const prematureInf = modalTokens[foundModalIdx + 1];
      const rest = modalTokens.slice(foundModalIdx + 2).join(' ').replace(/[.,!?]$/, '');
      current = `${modalTokens.slice(0, foundModalIdx).join(' ')} ${modalWord} ${rest} ${prematureInf}.`.trim();
      whyPoints.push('Satzklammer rule: The infinitive verb must be placed at the absolute end of the clause when using a modal verb.');
      isMajorGrammarError = true;
    }
  }

  // 4. Missing Comma before Subordinate Conjunctions (weil, dass, wenn, obwohl, etc.)
  current = current.replace(/([a-zA-ZäöüÄÖÜß0-9])\s+(weil|dass|daß|wenn|obwohl|da|damit|nachdem|während|ob)\b/gi, (match, prev, conj) => {
    whyPoints.push(`Subordinate conjunction "${conj}" must be preceded by a comma.`);
    isMinorError = true;
    return `${prev}, ${conj}`;
  });

  // 5. Prepositional Case Governance
  // Akkusativ Prepositions: für, durch, ohne, gegen, um
  const akkPreps = ['für', 'durch', 'ohne', 'gegen', 'um'];
  const akkFixMap = {
    'dem': 'den',
    'einem': 'einen',
    'meinem': 'meinen',
    'deinem': 'deinen',
    'seinem': 'seinen',
    'ihrem': 'ihren',
    'unserem': 'unseren',
    'eurem': 'euren',
    'dir': 'dich',
    'mir': 'mich',
    'ihm': 'ihn'
  };
  for (const p of akkPreps) {
    const reg = new RegExp(`\\b(${p})\\s+([a-zA-ZäöüÄÖÜß]+)\\b`, 'gi');
    current = current.replace(reg, (match, prep, word) => {
      const lower = word.toLowerCase();
      if (akkFixMap[lower]) {
        const replacement = akkFixMap[lower];
        whyPoints.push(`Preposition rule: "${prep}" strictly governs Akkusativ (e.g. "${prep} ${replacement}").`);
        isMajorGrammarError = true;
        return `${prep} ${replacement}`;
      }
      return match;
    });
  }

  // Dativ Prepositions: aus, bei, mit, nach, seit, von, zu
  const datPreps = ['aus', 'bei', 'mit', 'nach', 'seit', 'von', 'zu'];
  const datFixMap = {
    'den': 'dem',
    'einen': 'einem',
    'meinen': 'meinem',
    'mein': 'meinem',
    'dein': 'deinem',
    'deinen': 'deinem',
    'sein': 'seinem',
    'seinen': 'seinem',
    'ihr': 'ihrem',
    'ihren': 'ihrem',
    'unser': 'unserem',
    'unseren': 'unserem',
    'euer': 'eurem',
    'euren': 'eurem',
    'der': 'dem',
    'ein': 'einem',
    'die': 'der',
    'eine': 'einer',
    'meine': 'meiner',
    'dich': 'dir',
    'mich': 'mir',
    'ihn': 'ihm'
  };
  for (const p of datPreps) {
    const reg = new RegExp(`\\b(${p})\\s+([a-zA-ZäöüÄÖÜß]+)\\b`, 'gi');
    current = current.replace(reg, (match, prep, word) => {
      const lower = word.toLowerCase();
      if (datFixMap[lower]) {
        const replacement = datFixMap[lower];
        whyPoints.push(`Preposition rule: "${prep}" strictly governs Dativ (e.g. "${prep} ${replacement}").`);
        isMajorGrammarError = true;
        return `${prep} ${replacement}`;
      }
      return match;
    });
  }

  // 6. Directional Wechselpräpositionen (in, an, auf + movement verb -> Akkusativ)
  // e.g. "Ich gehe in der Park" -> "in den Park"
  const directionalRegex = /\b(in|an|auf)\s+(der|ein)\s+(Park|Garten|Wald|Supermarkt|Bahnhof|Club|Bus|Zug|Tisch)\b/gi;
  current = current.replace(directionalRegex, (match, prep, art, noun) => {
    const artRep = art.toLowerCase() === 'der' ? 'den' : 'einen';
    const nounProper = noun.charAt(0).toUpperCase() + noun.slice(1);
    whyPoints.push(`Wechselpräposition rule: Directional movement with "${prep}" strictly governs Akkusativ (e.g. "${prep} ${artRep} ${nounProper}").`);
    isMajorGrammarError = true;
    return `${prep} ${artRep} ${nounProper}`;
  });

  // 7. Dativ Verbs: helfen, danken, gehören, gratulieren, passen
  if (/\b(helfe|hilfst|hilft|helfen|geholfen|danke|dankst|dankt|gehöre|gehört)\s+(dich|mich|ihn)\b/i.test(current)) {
    current = current
      .replace(/\bdich\b/gi, 'dir')
      .replace(/\bmich\b/gi, 'mir')
      .replace(/\bihn\b/gi, 'ihm');
    whyPoints.push('Verb valency: Verbs like "helfen", "danken", and "gehören" strictly govern the Dativ case (dir / mir / ihm).');
    isMajorGrammarError = true;
  }

  // 8. German Noun Capitalization Check (excludes common verbs like 'essen')
  const commonNouns = [
    'schule', 'haus', 'buch', 'vater', 'mutter', 'freund', 'freundin', 'zeit', 'arbeit',
    'stadt', 'frau', 'mann', 'kind', 'kinder', 'tag', 'woche', 'monat', 'jahr',
    'prüfung', 'termin', 'urlaub', 'bewerbung', 'geld', 'auto', 'wohnung', 'problem',
    'deutschland', 'sprache', 'zimmer', 'leute', 'eltern', 'park', 'garten', 'wetter',
    'hund', 'katze', 'tisch', 'stuhl', 'fenster', 'tür', 'film', 'musik', 'wasser',
    'kaffee', 'tee', 'arzt', 'ärztin', 'lehrer', 'lehrerin', 'student', 'studentin',
    'frage', 'antwort', 'beispiel', 'aufgabe', 'kurs', 'lektion', 'wald', 'supermarkt'
  ];
  for (const n of commonNouns) {
    const nounReg = new RegExp(`\\b${n}\\b`, 'g');
    if (nounReg.test(current)) {
      const cap = n.charAt(0).toUpperCase() + n.slice(1);
      current = current.replace(nounReg, cap);
      whyPoints.push(`Orthography rule: All German nouns must be capitalized (e.g. "${cap}").`);
      isMinorError = true;
    }
  }

  // 9. Sentence-Initial Capitalization
  if (current.length > 0 && /^[a-zäöü]/.test(current)) {
    current = current.charAt(0).toUpperCase() + current.slice(1);
    whyPoints.push('Initial capitalization: German sentences start with a capital letter.');
    isMinorError = true;
  }

  // 10. Terminal Punctuation
  if (current.length > 0 && !/[.!?]$/.test(current)) {
    current = `${current}.`;
    whyPoints.push('Terminal punctuation added.');
    isMinorError = true;
  }

  // Determine final verdict
  if (!isMajorGrammarError && !isMinorError && current.trim() === text.trim()) {
    return {
      verdict: 'Perfect!',
      correctedSentence: text,
      why: 'Syntactically accurate! Word order, verb positioning, and case governance are correct.',
      naturalAlternative: text,
      expBonus: 50
    };
  }

  const verdict = isMajorGrammarError ? 'Needs Correction' : 'Almost There';
  const expBonus = isMajorGrammarError ? 15 : 35;
  const why = whyPoints.length > 0
    ? whyPoints.join(' ')
    : 'Minor punctuation or orthography adjustments.';

  return {
    verdict,
    correctedSentence: current,
    why,
    naturalAlternative: current,
    expBonus
  };
}

function evaluateEnglishSentence(text, topic, expectedSentence = '') {
  let current = text;
  const whyPoints = [];
  let isMajorGrammarError = false;
  let isMinorError = false;

  // Check if sentence starts with an auxiliary question or contains modal before subject
  const isQuestionWithAux = /^(does|did|do|can|could|will|would|must|should|may|might)\s+(he|she|it)\b/i.test(current);

  if (!isQuestionWithAux) {
    // Check for bad subject-verb agreement only in affirmative declarative clauses
    const badPattern = /\b(he|she|it)\s+(do|have|go|want|like|play|work)\b/i;
    // Ensure not preceded by an auxiliary modal (e.g. "must he work")
    if (badPattern.test(current) && !/\b(can|could|will|would|must|should|may|might|to)\s+(he|she|it)\b/i.test(current)) {
      current = current
        .replace(/\bhe do\b/gi, 'he does')
        .replace(/\bshe do\b/gi, 'she does')
        .replace(/\bit do\b/gi, 'it does')
        .replace(/\b(he|she|it)\s+have\b/gi, '$1 has')
        .replace(/\b(he|she|it)\s+go\b/gi, '$1 goes')
        .replace(/\b(he|she|it)\s+want\b/gi, '$1 wants')
        .replace(/\b(he|she|it)\s+like\b/gi, '$1 likes')
        .replace(/\b(he|she|it)\s+play\b/gi, '$1 plays')
        .replace(/\b(he|she|it)\s+work\b/gi, '$1 works');
      whyPoints.push('Subject-verb agreement: 3rd person singular (he/she/it) requires the -s/-es verb ending.');
      isMajorGrammarError = true;
    }
  }

  // Capitalize first letter
  if (current.length > 0 && /^[a-z]/.test(current)) {
    current = current.charAt(0).toUpperCase() + current.slice(1);
    whyPoints.push('English sentences start with a capital letter.');
    isMinorError = true;
  }

  // Terminal punctuation
  if (current.length > 0 && !/[.!?]$/.test(current)) {
    current = `${current}.`;
    whyPoints.push('Terminal punctuation added.');
    isMinorError = true;
  }

  if (!isMajorGrammarError && !isMinorError && current.trim() === text.trim()) {
    return {
      verdict: 'Perfect!',
      correctedSentence: text,
      why: 'Grammatically sound and natural expression.',
      naturalAlternative: text,
      expBonus: 50
    };
  }

  const verdict = isMajorGrammarError ? 'Needs Correction' : 'Almost There';
  const expBonus = isMajorGrammarError ? 15 : 35;
  const why = whyPoints.length > 0
    ? whyPoints.join(' ')
    : 'Minor adjustments applied.';

  return {
    verdict,
    correctedSentence: current,
    why,
    naturalAlternative: current,
    expBonus
  };
}
