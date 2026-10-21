/**
 * ARL - Local Deterministic Grammar Fallback Engine
 * Provides instant, zero-latency linguistic feedback for German & English grammar
 * when offline or when no Gemini API key is configured.
 */

export function evaluateRuleFallback(input, targetTopic = '', targetLang = 'de') {
  const text = String(input ?? '').trim();
  if (!text) {
    return {
      verdict: 'Needs Correction',
      correctedSentence: '',
      why: 'Input is empty. Please write a sentence using the grammar rule.',
      naturalAlternative: '',
      expBonus: 0
    };
  }

  if (targetLang === 'de') {
    return evaluateGermanSentence(text, targetTopic);
  }

  return evaluateEnglishSentence(text, targetTopic);
}

function evaluateGermanSentence(text, topic) {
  const tokens = text.split(/\s+/);
  const cleanTokens = tokens.map(t => t.replace(/[.,!?;:„"“”«»()]/g, ''));

  // 1. Check Subordinate Clause Verb-End (Nebensatz: weil, dass, wenn, obwohl, da, damit)
  const subjunctions = ['weil', 'dass', 'daß', 'wenn', 'obwohl', 'da', 'damit', 'nachdem', 'während'];
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
        // Verb is erroneously placed right after the subject inside the Nebensatz
        const beforeSub = tokens.slice(0, i + 1).join(' ');
        const subClauseTokens = tokens.slice(i + 1);
        const badVerb = subClauseTokens[1];
        const remaining = subClauseTokens.filter((_, idx) => idx !== 1);
        const correctedSub = `${remaining.join(' ').replace(/[.,!?]$/, '')} ${badVerb}.`;
        const corrected = `${beforeSub} ${correctedSub}`;

        return {
          verdict: 'Needs Correction',
          correctedSentence: corrected,
          why: `Nebensatz rule: Conjunction "${cleanTokens[i]}" requires the finite verb ("${badVerb}") at the very end of the clause.`,
          naturalAlternative: corrected,
          expBonus: 15
        };
      }
    }
  }

  // 2. Check Inversion Rule after Fronted Adverbials (deshalb, trotzdem, heute, gestern, etc.)
  const frontedAdverbs = ['heute', 'gestern', 'morgen', 'leider', 'deshalb', 'deswegen', 'trotzdem', 'sonst', 'außerdem', 'oft', 'manchmal', 'jetzt', 'hier'];
  const firstLower = cleanTokens[0]?.toLowerCase();
  if (frontedAdverbs.includes(firstLower) && cleanTokens.length >= 3) {
    const secondLower = cleanTokens[1]?.toLowerCase();
    const subjects = ['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man'];
    if (subjects.includes(secondLower)) {
      const corrected = `${tokens[0]} ${tokens[2]} ${tokens[1]} ${tokens.slice(3).join(' ')}`.trim();
      return {
        verdict: 'Needs Correction',
        correctedSentence: corrected,
        why: 'Inversion (V2): When a sentence starts with an adverbial element in Position 1, the finite verb must immediately follow in Position 2.',
        naturalAlternative: `${tokens[1].charAt(0).toUpperCase() + tokens[1].slice(1)} ${tokens[2]} ${tokens[0].toLowerCase()} ${tokens.slice(3).join(' ')}`.trim(),
        expBonus: 15
      };
    }
  }

  // 3. Modal Verb Satzklammer Check (modal verb in Pos 2, infinitive at end)
  const modalVerbs = ['kann', 'kannst', 'können', 'könnt', 'muss', 'musst', 'müssen', 'müsst', 'darf', 'darfst', 'dürfen', 'dürft', 'soll', 'sollst', 'sollen', 'will', 'willst', 'wollen', 'möchte', 'möchtest', 'möchten'];
  let foundModalIdx = -1;
  for (let i = 0; i < cleanTokens.length; i++) {
    if (modalVerbs.includes(cleanTokens[i].toLowerCase())) {
      foundModalIdx = i;
      break;
    }
  }

  if (foundModalIdx !== -1 && cleanTokens.length > foundModalIdx + 2) {
    // Non-verb words that end in -en/-eln/-ern that are NOT verbs
    const nonVerbEnWords = [
      'einen', 'keinen', 'meinen', 'deinen', 'seinen', 'ihren', 'unseren', 'euren',
      'ihnen', 'den', 'dem', 'des', 'uns', 'euch', 'morgen', 'gestern', 'draußen',
      'drinnen', 'oben', 'unten', 'hinten', 'vorn', 'vorne', 'außen', 'innen',
      'schon', 'gern', 'gerne', 'immer', 'oft', 'selten', 'nicht', 'hier', 'dort'
    ];

    // Check last word: does the sentence ALREADY end with an infinitive?
    const lastWord = cleanTokens[cleanTokens.length - 1]?.toLowerCase();
    const sentenceAlreadyEndsWithInfinitive = lastWord &&
      (lastWord.endsWith('en') || lastWord.endsWith('ern') || lastWord.endsWith('eln')) &&
      !nonVerbEnWords.includes(lastWord);

    const adjacentWord = cleanTokens[foundModalIdx + 1]?.toLowerCase();
    const isAdjacentInfinitiveVerb = adjacentWord &&
      (adjacentWord.endsWith('en') || adjacentWord.endsWith('ern') || adjacentWord.endsWith('eln')) &&
      !nonVerbEnWords.includes(adjacentWord);

    // Only flag Satzklammerbruch if the adjacent word is an infinitive AND the sentence does NOT end in an infinitive
    if (isAdjacentInfinitiveVerb && !sentenceAlreadyEndsWithInfinitive) {
      const modalWord = tokens[foundModalIdx];
      const prematureInf = tokens[foundModalIdx + 1];
      const rest = tokens.slice(foundModalIdx + 2).join(' ').replace(/[.,!?]$/, '');
      const corrected = `${tokens.slice(0, foundModalIdx).join(' ')} ${modalWord} ${rest} ${prematureInf}.`.trim();

      return {
        verdict: 'Needs Correction',
        correctedSentence: corrected,
        why: 'Satzklammer rule: The infinitive verb must be placed at the absolute end of the clause when using a modal verb.',
        naturalAlternative: corrected,
        expBonus: 15
      };
    }
  }

  // 4. Prepositional Case Governance (Strict token-level replacement)
  // Akkusativ Prepositions: für, durch, ohne, gegen, um
  const akkPreps = ['für', 'durch', 'ohne', 'gegen', 'um'];
  for (let i = 0; i < cleanTokens.length - 1; i++) {
    const prep = cleanTokens[i].toLowerCase();
    if (akkPreps.includes(prep)) {
      const nextW = cleanTokens[i + 1].toLowerCase();
      const akkFixMap = {
        'dem': 'den',
        'einem': 'einen',
        'meinem': 'meinen',
        'deinem': 'deinen',
        'seinem': 'seinen',
        'ihrem': 'ihren',
        'dir': 'dich',
        'mir': 'mich',
        'ihm': 'ihn'
      };

      if (akkFixMap[nextW]) {
        const replacement = akkFixMap[nextW];
        const fixed = text.replace(new RegExp(`\\b${cleanTokens[i]}\\s+${cleanTokens[i + 1]}\\b`, 'gi'), `${tokens[i]} ${replacement}`);
        return {
          verdict: 'Needs Correction',
          correctedSentence: fixed,
          why: `Preposition rule: "${cleanTokens[i]}" strictly governs Akkusativ (e.g. "${tokens[i]} ${replacement}").`,
          naturalAlternative: fixed,
          expBonus: 15
        };
      }
    }
  }

  // Dativ Prepositions: aus, bei, mit, nach, seit, von, zu
  const datPreps = ['aus', 'bei', 'mit', 'nach', 'seit', 'von', 'zu'];
  for (let i = 0; i < cleanTokens.length - 1; i++) {
    const prep = cleanTokens[i].toLowerCase();
    if (datPreps.includes(prep)) {
      const nextW = cleanTokens[i + 1].toLowerCase();
      const datFixMap = {
        'den': 'dem',
        'einen': 'einem',
        'meinen': 'meinem',
        'deinen': 'deinem',
        'seinen': 'seinem',
        'ihren': 'ihrem',
        'dich': 'dir',
        'mich': 'mir',
        'ihn': 'ihm'
      };

      if (datFixMap[nextW]) {
        const replacement = datFixMap[nextW];
        const fixed = text.replace(new RegExp(`\\b${cleanTokens[i]}\\s+${cleanTokens[i + 1]}\\b`, 'gi'), `${tokens[i]} ${replacement}`);
        return {
          verdict: 'Needs Correction',
          correctedSentence: fixed,
          why: `Preposition rule: "${cleanTokens[i]}" strictly governs Dativ (e.g. "${tokens[i]} ${replacement}").`,
          naturalAlternative: fixed,
          expBonus: 15
        };
      }
    }
  }

  // Dativ Verbs: helfen, danken, gehören, gratulieren, passen
  if (/\b(helfe|hilfst|hilft|helfen|geholfen|danke|dankst|dankt|gehöre|gehört)\s+(dich|mich|ihn)\b/i.test(text)) {
    const fixed = text
      .replace(/\bdich\b/gi, 'dir')
      .replace(/\bmich\b/gi, 'mir')
      .replace(/\bihn\b/gi, 'ihm');
    return {
      verdict: 'Needs Correction',
      correctedSentence: fixed,
      why: 'Verb valency: Verbs like "helfen", "danken", and "gehören" strictly govern the Dativ case (dir / mir / ihm).',
      naturalAlternative: fixed,
      expBonus: 15
    };
  }

  // 5. German Noun Capitalization Check (excludes common verbs like 'essen')
  const commonNouns = [
    'schule', 'haus', 'buch', 'vater', 'mutter', 'freund', 'freundin', 'zeit', 'arbeit',
    'stadt', 'frau', 'mann', 'kind', 'kinder', 'tag', 'woche', 'monat', 'jahr',
    'prüfung', 'termin', 'urlaub', 'bewerbung', 'geld', 'auto', 'wohnung', 'problem',
    'deutschland', 'sprache', 'zimmer', 'leute', 'eltern'
  ];
  for (let i = 0; i < tokens.length; i++) {
    const cleanWord = cleanTokens[i].toLowerCase();
    if (commonNouns.includes(cleanWord) && tokens[i].charAt(0) === tokens[i].charAt(0).toLowerCase()) {
      const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
      const corrected = text.replace(new RegExp(`\\b${cleanWord}\\b`, 'g'), capitalized);
      return {
        verdict: 'Almost There',
        correctedSentence: corrected,
        why: `Orthography rule: All German nouns must be capitalized (e.g. "${capitalized}").`,
        naturalAlternative: corrected,
        expBonus: 35
      };
    }
  }

  // If no grammar rule violations were detected, award full marks!
  return {
    verdict: 'Perfect!',
    correctedSentence: text,
    why: 'Syntactically accurate! Word order, verb positioning, and case governance are correct.',
    naturalAlternative: text,
    expBonus: 50
  };
}

function evaluateEnglishSentence(text, topic) {
  // Check if sentence starts with an auxiliary question or contains modal before subject
  const isQuestionWithAux = /^(does|did|do|can|could|will|would|must|should|may|might)\s+(he|she|it)\b/i.test(text);

  if (!isQuestionWithAux) {
    // Check for bad subject-verb agreement only in affirmative declarative clauses
    const badPattern = /\b(he|she|it)\s+(do|have|go|want|like|play|work)\b/i;
    // Ensure not preceded by an auxiliary modal (e.g. "must he work")
    if (badPattern.test(text) && !/\b(can|could|will|would|must|should|may|might|to)\s+(he|she|it)\b/i.test(text)) {
      const fixed = text
        .replace(/\bhe do\b/gi, 'he does')
        .replace(/\bshe do\b/gi, 'she does')
        .replace(/\bit do\b/gi, 'it does')
        .replace(/\b(he|she|it)\s+have\b/gi, '$1 has')
        .replace(/\b(he|she|it)\s+go\b/gi, '$1 goes')
        .replace(/\b(he|she|it)\s+want\b/gi, '$1 wants')
        .replace(/\b(he|she|it)\s+like\b/gi, '$1 likes')
        .replace(/\b(he|she|it)\s+play\b/gi, '$1 plays')
        .replace(/\b(he|she|it)\s+work\b/gi, '$1 works');
      return {
        verdict: 'Needs Correction',
        correctedSentence: fixed,
        why: 'Subject-verb agreement: 3rd person singular (he/she/it) requires the -s/-es verb ending.',
        naturalAlternative: fixed,
        expBonus: 15
      };
    }
  }

  return {
    verdict: 'Perfect!',
    correctedSentence: text,
    why: 'Grammatically sound and natural expression.',
    naturalAlternative: text,
    expBonus: 50
  };
}
