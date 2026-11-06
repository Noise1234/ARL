/**
 * ARL - Drill Trainer Target-Aware Sentence Validator & Grammar Evaluator
 * 
 * Replaces blind spellchecking in Drill Trainer with a 5-step Target-Aware Pipeline:
 * 1. Extract Drill Context (prompt_mn, targetAnswer, acceptedAnswers, requiredWords, activeGrammarRule)
 * 2. Step A: Gibberish & Required-Word Gatekeeper (Blocks nonsense immediately, 0 EXP, no API calls)
 * 3. Step B: Deterministic Target & German Grammar Rule Matcher (V2, Inversion, Case governance)
 * 4. Step C: Context-Aware AI Evaluation (Gemini / Groq / Pollinations with full prompt context)
 * 5. Strict EXP Reward Logic (0 EXP on structural/word-order/case errors, 5 EXP for minor punctuation/case, 15 EXP for correct)
 */

import { renderWordDiff, escapeHtml } from './diff.js';

/**
 * Normalizes and extracts linguistic stem of a token.
 * Strips articles, punctuation, and inflectional endings.
 * @param {string} token 
 * @param {'de'|'en'} [lang='de']
 * @returns {string}
 */
export function stemToken(token, lang = 'de') {
  if (!token || typeof token !== 'string') return '';
  let s = token.toLowerCase()
    .replace(/[.,!?;:„"“”«»()]/g, '')
    .trim();

  if (lang === 'de') {
    // Strip leading articles if present in single token or phrase
    s = s.replace(/^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)\s+/i, '').trim();
    // Strip participle prefix ge- (only for words > 5 chars)
    if (s.startsWith('ge') && s.length > 5) {
      s = s.slice(2);
    }
    // Verb conjugation endings and noun plural endings
    if (s.length > 4) {
      s = s.replace(/(test|ten|tet|est|en|te|et|st|e|t|er|eln|ern)$/, '');
    }
  } else {
    // English
    s = s.replace(/^(the|a|an)\s+/i, '').trim();
    if (s.length > 4) {
      s = s.replace(/(ing|ed|es|s)$/, '');
    }
  }
  return s;
}

/**
 * Checks whether a user token matches a required vocabulary item.
 * @param {string[]} userTokens 
 * @param {{word: string}|string} requiredItem 
 * @param {'de'|'en'} [lang='de']
 * @returns {boolean}
 */
export function matchesRequiredWord(userTokens, requiredItem, lang = 'de') {
  const reqWord = String(requiredItem?.word || requiredItem || '').trim();
  if (!reqWord) return true;

  const reqLower = reqWord.toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '');
  const reqClean = reqLower.replace(/^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|the|a|an)\s+/i, '').trim();
  const reqStem = stemToken(reqClean, lang);

  // If required word is multi-word (e.g. "die Bibliothek" or "right now")
  const reqParts = reqClean.split(/\s+/).filter(Boolean);

  for (const ut of userTokens) {
    const uClean = ut.toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '').trim();
    if (!uClean) continue;

    // Direct match
    if (uClean === reqClean || uClean === reqLower) return true;

    // Substring match for compound words or multi-token nouns
    if (reqClean.length >= 4 && (uClean.includes(reqClean) || reqClean.includes(uClean))) return true;

    // Multi-part match check
    for (const rp of reqParts) {
      if (rp.length >= 3 && uClean === rp) return true;
    }

    // Stem match
    const uStem = stemToken(uClean, lang);
    if (uStem && reqStem && uStem.length >= 3 && reqStem.length >= 3 && uStem === reqStem) return true;
  }

  return false;
}

/**
 * Step A: Gibberish & Required-Word Gatekeeper
 * Validates input against required Wörterbuch words and target tokens.
 * Blocks empty inputs, gibberish (e.g. "uch bgha jjah js"), and inputs lacking >= 40% required vocabulary.
 * @param {string} userInput 
 * @param {object} currentDrill 
 * @param {'de'|'en'} [lang='de']
 * @returns {{
 *   isBlocked: boolean,
 *   missingWords: string[],
 *   overlapRatio: number,
 *   reason: string
 * }}
 */
export function checkGibberishAndRequiredWords(userInput, currentDrill, lang = 'de') {
  const text = String(userInput ?? '').trim();
  if (!text) {
    return {
      isBlocked: true,
      missingWords: [],
      overlapRatio: 0,
      reason: 'empty'
    };
  }

  const userTokens = text.split(/\s+/).filter(Boolean);
  const target = String(currentDrill?.target || '').trim();
  const requiredWords = Array.isArray(currentDrill?.woerterbuch) ? currentDrill.woerterbuch : [];

  // 1. Check required Wörterbuch words
  const missingWords = [];
  let matchedReqCount = 0;

  if (requiredWords.length > 0) {
    for (const item of requiredWords) {
      if (matchesRequiredWord(userTokens, item, lang)) {
        matchedReqCount++;
      } else {
        missingWords.push(item.word || String(item));
      }
    }
  }

  // 2. Also check content words in target answer
  const stopWords = new Set([
    'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
    'the', 'a', 'an', 'and', 'und', 'in', 'im', 'am', 'zu', 'zur', 'zum', 'von', 'vom',
    'ist', 'sind', 'is', 'are'
  ]);
  const targetTokens = target
    .toLowerCase()
    .replace(/[.,!?;:„"“”«»()]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 1 && !stopWords.has(t));

  let matchedTargetCount = 0;
  for (const tt of targetTokens) {
    const tStem = stemToken(tt, lang);
    const hasMatch = userTokens.some(ut => {
      const uClean = ut.toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '');
      return uClean === tt || (tStem.length >= 3 && stemToken(uClean, lang) === tStem);
    });
    if (hasMatch) matchedTargetCount++;
  }

  const reqRatio = requiredWords.length > 0 ? matchedReqCount / requiredWords.length : 1;
  const targetRatio = targetTokens.length > 0 ? matchedTargetCount / targetTokens.length : 1;
  const effectiveOverlap = requiredWords.length > 0 ? reqRatio : targetRatio;

  // 3. Gibberish heuristics: check if words lack vowels or contain nonsensical consonant sequences
  let gibberishTokenCount = 0;
  for (const t of userTokens) {
    const clean = t.toLowerCase().replace(/[^a-zäöüß]/g, '');
    if (!clean) continue;
    // Word >= 3 chars with no vowels
    if (clean.length >= 3 && !/[aeiouyäöü]/.test(clean)) {
      gibberishTokenCount++;
    } else if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(clean)) {
      // 4+ consonants in a row without vowel (e.g. "bgha" or "jjah" type clusters)
      gibberishTokenCount++;
    }
  }

  const isHighGibberish = userTokens.length > 0 && (gibberishTokenCount / userTokens.length >= 0.5);

  // If overlap is under 40% (0.40) or high gibberish
  if (effectiveOverlap < 0.40 || isHighGibberish) {
    return {
      isBlocked: true,
      missingWords,
      overlapRatio: effectiveOverlap,
      reason: isHighGibberish ? 'gibberish' : 'missing_vocabulary'
    };
  }

  return {
    isBlocked: false,
    missingWords,
    overlapRatio: effectiveOverlap,
    reason: 'valid'
  };
}

/**
 * Step B: Generates valid syntactic permutations for German sentences.
 * Covers V2 Hauptsatz permutations (Subject-first vs Inverted Adverbial-first)
 * and valid constituent orderings.
 * @param {string} targetSentence 
 * @param {'de'|'en'} [lang='de']
 * @returns {string[]}
 */
export function generateValidPermutations(targetSentence, lang = 'de') {
  const target = String(targetSentence ?? '').trim();
  if (!target) return [];

  const perms = new Set([target]);
  if (lang !== 'de') return Array.from(perms);

  const clean = target.replace(/[.!?]$/, '').trim();
  const lastChar = target.slice(-1);
  const punct = ['.', '!', '?'].includes(lastChar) ? lastChar : '.';

  // Pattern 1: Inverted syntax -> [Fronted Adverb/PP] [Finite Verb] [Subject] [Rest]
  // e.g. "Heute lerne ich in der Bibliothek Deutsch"
  const invMatch = clean.match(/^([A-ZÄÖÜa-zäöüß]+(?:\s+(?:der|die|das|dem|den|einem|einer|jeden|jeder|jedes|am|im|in\s+der|in\s+dem)\s+[A-ZÄÖÜa-zäöüß]+)?)\s+([A-ZÄÖÜa-zäöüß]+)\s+(ich|du|er|sie|es|wir|ihr|man|Sie)\b(?:\s+(.*))?$/i);
  if (invMatch) {
    const [, front, verb, subj, rest = ''] = invMatch;
    const subjCap = subj.charAt(0).toUpperCase() + subj.slice(1);
    const frontLow = front.charAt(0).toLowerCase() + front.slice(1);
    const restStr = rest ? ' ' + rest : '';

    // Permutation: Subject at Position 1, Verb at Position 2
    perms.add(`${subjCap} ${verb} ${frontLow}${restStr}${punct}`);
    if (restStr) {
      perms.add(`${subjCap} ${verb}${restStr} ${frontLow}${punct}`);
    }
  }

  // Pattern 2: Subject-first syntax -> [Subject] [Finite Verb] [Rest containing frontable adverb]
  // e.g. "Ich lerne heute in der Bibliothek Deutsch"
  const subjMatch = clean.match(/^(ich|du|er|sie|es|wir|ihr|man|Sie)\s+([A-ZÄÖÜa-zäöüß]+)\s+(.*)$/i);
  if (subjMatch) {
    const [, subj, verb, rest] = subjMatch;
    const frontableAdverbs = [
      'heute', 'gestern', 'morgen', 'jetzt', 'oft', 'manchmal', 'immer', 'leider',
      'am wochenende', 'im sommer', 'jeden tag', 'jeden morgen', 'in der bibliothek',
      'hier', 'dort', 'deshalb'
    ];
    for (const adv of frontableAdverbs) {
      const advReg = new RegExp(`\\b${adv}\\b`, 'i');
      if (advReg.test(rest)) {
        const advCap = adv.charAt(0).toUpperCase() + adv.slice(1);
        const subjLow = subj === 'Sie' ? 'Sie' : subj.toLowerCase();
        const restWithoutAdv = rest.replace(advReg, '').replace(/\s+/g, ' ').trim();
        const restStr = restWithoutAdv ? ' ' + restWithoutAdv : '';
        perms.add(`${advCap} ${verb} ${subjLow}${restStr}${punct}`);
      }
    }
  }

  return Array.from(perms);
}

/**
 * Specifically detects structural German word-order and case violations:
 * - V1 Declarative error (verb placed in position 1 in a declarative sentence)
 * - V3 No-Inversion error (adverb at pos 1, but verb at pos 3 after subject)
 * - Preposition / Case errors (e.g. "in die Bibliothek" instead of "in der Bibliothek")
 * - Subordinate clause verb placement (Nebensatz verb-end)
 * 
 * @param {string} userInput 
 * @param {string} targetSentence 
 * @param {object} [topic={}]
 * @returns {{
 *   hasError: boolean,
 *   errorType: string,
 *   why: string,
 *   suggestedFix: string
 * }|null}
 */
export function detectSpecificGermanGrammarErrors(userInput, targetSentence, topic = {}) {
  const userText = String(userInput ?? '').trim();
  const target = String(targetSentence ?? '').trim();
  if (!userText || !target) return null;

  const userTokens = userText.split(/\s+/).filter(Boolean);
  const cleanUserTokens = userTokens.map(t => t.replace(/[.,!?;:„"“”«»()]/g, ''));
  const targetTokens = target.split(/\s+/).filter(Boolean);
  const cleanTargetTokens = targetTokens.map(t => t.replace(/[.,!?;:„"“”«»()]/g, ''));

  const isDeclarative = !target.endsWith('?');

  // Identify finite verb and subject from target sentence
  let finiteVerb = '';
  let subject = '';
  const subjects = new Set(['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'man']);

  // Extract from target
  for (let i = 0; i < cleanTargetTokens.length; i++) {
    const w = cleanTargetTokens[i].toLowerCase();
    if (subjects.has(w) && !subject) {
      subject = cleanTargetTokens[i];
    }
  }

  // Common finite verbs in A1/B1 drills
  const commonVerbs = new Set([
    'lerne', 'lernst', 'lernt', 'lernen', 'lese', 'liest', 'lesen', 'fahre', 'fährt', 'fahren',
    'esse', 'isst', 'essen', 'trinke', 'trinkt', 'trinken', 'gehe', 'geht', 'gehen',
    'arbeite', 'arbeitet', 'arbeiten', 'wohne', 'wohnt', 'wohnen', 'muss', 'musst', 'müssen',
    'kann', 'kannst', 'können', 'will', 'willst', 'wollen', 'möchte', 'möchtest', 'möchten',
    'habe', 'hast', 'hat', 'haben', 'bin', 'bist', 'ist', 'sind', 'kaufe', 'kauft', 'kaufen',
    'suche', 'sucht', 'suchen', 'brauche', 'braucht', 'brauchen', 'sehe', 'sieht', 'sehen',
    'besuche', 'besucht', 'besuchen', 'heiße', 'heißt', 'heißen'
  ]);

  for (const t of cleanTargetTokens) {
    if (commonVerbs.has(t.toLowerCase())) {
      finiteVerb = t;
      break;
    }
  }

  // Fallback: if not in list, find token 1 of subject-first or inverted target
  if (!finiteVerb && cleanTargetTokens.length >= 2) {
    if (subjects.has(cleanTargetTokens[0].toLowerCase())) {
      finiteVerb = cleanTargetTokens[1];
    } else if (cleanTargetTokens.length >= 3 && subjects.has(cleanTargetTokens[2].toLowerCase())) {
      finiteVerb = cleanTargetTokens[1];
    }
  }

  const firstUserToken = cleanUserTokens[0]?.toLowerCase() || '';

  // 1. Verb-First Error (V1 in declarative sentence)
  // e.g. "lerne heute ich in der Bibliothek Deutsch"
  if (isDeclarative && finiteVerb && firstUserToken === finiteVerb.toLowerCase() && cleanUserTokens.length >= 3) {
    const verbProper = cleanUserTokens[0];
    const secondToken = cleanUserTokens[1];
    return {
      hasError: true,
      errorType: 'V1_DECLARATIVE',
      why: `V2 Rule Violation: In a declarative Hauptsatz, the conjugated verb ('${verbProper}') must be in Position 2, not Position 1. Use 'Heute lerne ich...' or 'Ich lerne heute...'.`,
      suggestedFix: target
    };
  }

  // 2. No-Inversion Error (Verb in Position 3 after fronted element)
  // e.g. "Heute ich lerne in der Bibliothek Deutsch"
  const frontedWords = new Set([
    'heute', 'gestern', 'morgen', 'jetzt', 'oft', 'manchmal', 'immer', 'leider',
    'deshalb', 'deswegen', 'trotzdem', 'sonst', 'außerdem', 'hier', 'dort', 'dann'
  ]);

  if (frontedWords.has(firstUserToken) && cleanUserTokens.length >= 3) {
    const secondUserToken = cleanUserTokens[1]?.toLowerCase();
    const thirdUserToken = cleanUserTokens[2]?.toLowerCase();

    if (subjects.has(secondUserToken) && finiteVerb && thirdUserToken === finiteVerb.toLowerCase()) {
      const frontWord = cleanUserTokens[0];
      const subjWord = cleanUserTokens[1];
      const verbWord = cleanUserTokens[2];
      return {
        hasError: true,
        errorType: 'NO_INVERSION_V3',
        why: `V2 Inversion Error: When a time/place phrase ('${frontWord}') is at Position 1, the verb ('${verbWord}') must stay at Position 2 before the subject ('${subjWord}'): '${frontWord} ${verbWord} ${subjWord}...'.`,
        suggestedFix: target
      };
    }
  }

  // 3. Preposition / Case Error
  // e.g. "in die Bibliothek" instead of "in der Bibliothek" (stationary Wo? -> Dativ)
  if (target.includes('in der Bibliothek') && /in\s+die\s+Bibliothek/i.test(userText)) {
    return {
      hasError: true,
      errorType: 'CASE_PREPOSITION',
      why: "Preposition / Case Error: 'in' with a stationary location (Wo? / Where?) governs Dativ: use 'in der Bibliothek' instead of 'in die Bibliothek'.",
      suggestedFix: target
    };
  }

  // Dativ preposition errors (mit mein -> mit meinem)
  if (/\bmit\s+(mein|dein|sein|unser|euer|ihr|der|den)\b/i.test(userText)) {
    const match = userText.match(/\bmit\s+(mein|dein|sein|unser|euer|ihr|der|den)\b/i);
    const bad = match ? match[0] : 'mit mein';
    return {
      hasError: true,
      errorType: 'CASE_DATIV',
      why: `Preposition / Case Error: 'mit' strictly governs Dativ (e.g. 'mit meinem Freund' or 'mit dem Fahrrad').`,
      suggestedFix: target
    };
  }

  // Akkusativ preposition errors (für mein -> für meinen)
  if (/\bfür\s+(mein|dein|sein|der|dem)\b/i.test(userText)) {
    return {
      hasError: true,
      errorType: 'CASE_AKKUSATIV',
      why: "Preposition / Case Error: 'für' strictly governs Akkusativ (e.g. 'für meinen Freund').",
      suggestedFix: target
    };
  }

  // Directional Wechselpräposition error (in der Park -> in den Park)
  if (/\b(in|an|auf)\s+der\s+(Park|Garten|Wald|Supermarkt|Bahnhof|Club|Bus|Zug|Tisch)\b/i.test(userText)) {
    const match = userText.match(/\b(in|an|auf)\s+der\s+([A-Za-zäöüß]+)\b/i);
    const prep = match ? match[1] : 'in';
    const noun = match ? match[2] : 'Park';
    return {
      hasError: true,
      errorType: 'CASE_WECHSELPRAEPOSITION',
      why: `Wechselpräposition Error: Directional movement with '${prep}' (Wohin? / Where to?) governs Akkusativ: use '${prep} den ${noun}' instead of '${prep} der ${noun}'.`,
      suggestedFix: target
    };
  }

  // 4. Subordinate Clause (Nebensatz) Verb Position
  // e.g. "... weil ich habe ..." instead of "... weil ich ... habe."
  const subjunctions = ['weil', 'dass', 'daß', 'wenn', 'obwohl', 'da', 'damit'];
  for (let i = 0; i < cleanUserTokens.length - 2; i++) {
    const w = cleanUserTokens[i].toLowerCase();
    if (subjunctions.includes(w)) {
      const nextWord = cleanUserTokens[i + 1].toLowerCase();
      const thirdWord = cleanUserTokens[i + 2].toLowerCase();
      if (subjects.has(nextWord) && (commonVerbs.has(thirdWord) || thirdWord === finiteVerb.toLowerCase())) {
        return {
          hasError: true,
          errorType: 'NEBENSATZ_VERB_END',
          why: `Nebensatz rule: Conjunction '${cleanUserTokens[i]}' requires the finite verb ('${cleanUserTokens[i + 2]}') at the very end of the clause.`,
          suggestedFix: target
        };
      }
    }
  }

  return null;
}

/**
 * Finds the closest target permutation to the user's input.
 * Ensures word diffs align with the intended syntactic order.
 * @param {string} userInput 
 * @param {string[]} permutations 
 * @returns {string}
 */
export function findClosestTargetPermutation(userInput, permutations) {
  if (!permutations || permutations.length === 0) return userInput;
  if (permutations.length === 1) return permutations[0];

  const u = userInput.trim().toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '');
  const uTokens = u.split(/\s+/).filter(Boolean);

  let bestPerm = permutations[0];
  let maxScore = -1;

  for (const perm of permutations) {
    const p = perm.trim().toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '');
    const pTokens = p.split(/\s+/).filter(Boolean);

    // Score based on token position match and LCS overlap
    let score = 0;
    for (let i = 0; i < Math.min(uTokens.length, pTokens.length); i++) {
      if (uTokens[i] === pTokens[i]) score += 3;
    }
    for (const ut of uTokens) {
      if (pTokens.includes(ut)) score += 1;
    }

    if (score > maxScore) {
      maxScore = score;
      bestPerm = perm;
    }
  }

  return bestPerm;
}

/**
 * Executes the complete 5-Step Target-Aware Pipeline for Drill Trainer sentence verification.
 * 
 * 1. Extract Drill Context (prompt_mn, targetAnswer, acceptedAnswers, requiredWords, activeGrammarRule)
 * 2. Step A: Gibberish & Required-Word Gatekeeper (Block nonsense immediately, 0 EXP)
 * 3. Step B: Deterministic Target & German Grammar Rule Matcher (V2, Inversion, Cases)
 * 4. Step C: Context-Aware AI Evaluation (Gemini / Groq / Pollinations with full prompt context)
 * 5. Strict EXP Reward Logic (15 EXP for correct, 5 EXP for punctuation/case, 0 EXP for errors)
 * 
 * @param {string} userInput 
 * @param {object} currentDrill 
 * @param {object} topic 
 * @param {'de'|'en'} [lang='de']
 * @param {object} [options={}]
 * @returns {Promise<object>} Canonical feedback object
 */
export async function verifyDrillSentence(userInput, currentDrill, topic, lang = 'de', options = {}) {
  const userText = String(userInput ?? '').trim();
  const targetAnswer = String(currentDrill?.target || options.expectedSentence || '').trim();
  const mongolianPrompt = String(currentDrill?.prompt_mn || '').trim();
  const activeGrammarRule = String(topic?.title || topic?.id || options.targetTopic || 'German Grammar').trim();
  const ruleBreakdown = String(currentDrill?.rule_breakdown || '').trim();
  const requiredWords = Array.isArray(currentDrill?.woerterbuch) ? currentDrill.woerterbuch : [];

  // =========================================================================
  // STEP A: Gibberish & Required-Word Gatekeeper (Block Nonsense Immediately)
  // =========================================================================
  const gatekeeper = checkGibberishAndRequiredWords(userText, currentDrill, lang);

  if (gatekeeper.isBlocked) {
    const missingStr = gatekeeper.missingWords.length > 0
      ? gatekeeper.missingWords.join(', ')
      : '';

    const explanations = [];
    if (gatekeeper.reason === 'empty') {
      explanations.push('Input is empty. Please enter your translation.');
    } else if (gatekeeper.reason === 'gibberish') {
      explanations.push('The entered text contains unrecognized or invalid words.');
      if (missingStr) {
        explanations.push(`Missing required vocabulary: ${missingStr}.`);
      }
      explanations.push('Please enter a complete sentence translating the Mongolian prompt.');
    } else {
      explanations.push(`Sentence is incomplete. Missing required vocabulary: ${missingStr}.`);
      explanations.push('Please include all required [WB] vocabulary words in your sentence.');
    }

    const diffHtml = targetAnswer
      ? renderWordDiff(userText, targetAnswer)
      : `<span class="diff-error">${escapeHtml(userText || 'Empty input')}</span>`;

    return {
      isCorrect: false,
      statusLabel: '✗ Incomplete / Invalid Sentence',
      verdict: 'Incomplete / Invalid Sentence',
      verdictLabel: '✗ Incomplete / Invalid Sentence',
      expBonus: 0, // Strict: 0 EXP for gibberish / incomplete
      engine: 'Deterministic Validator',
      correctedSentence: targetAnswer,
      explanations,
      grammarTip: ruleBreakdown || 'Follow the required vocabulary and grammar rule for this drill.',
      diffHtml,
      wordDiffHtml: diffHtml
    };
  }

  // =========================================================================
  // STEP B: Deterministic Target & German Grammar Rule Matcher
  // =========================================================================
  const validPermutations = generateValidPermutations(targetAnswer, lang);
  const closestTarget = findClosestTargetPermutation(userText, validPermutations);

  // 1. Exact match against target or valid permutation
  for (const perm of validPermutations) {
    if (userText === perm) {
      const isAlt = perm !== targetAnswer;
      return {
        isCorrect: true,
        statusLabel: '✓ Grammatically Correct',
        verdict: 'Perfect!',
        verdictLabel: '✓ Grammatically Correct',
        expBonus: 15, // Strict requirement 5: +15 EXP for correct sentence
        engine: 'Deterministic Validator',
        correctedSentence: perm,
        explanations: isAlt
          ? [`Valid V2 permutation: Your word order is grammatically accurate and preserves the target meaning.`]
          : [`Syntactically accurate! Exactly matches the expected target sentence.`],
        grammarTip: ruleBreakdown || 'Verb in Position 2 and correct case governance.',
        diffHtml: `<span class="diff-same">${escapeHtml(userText)}</span>`,
        wordDiffHtml: `<span class="diff-same">${escapeHtml(userText)}</span>`
      };
    }
  }

  // 2. Minor Capitalization or Punctuation Difference Only
  const cleanUserNorm = userText.toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '').replace(/\s+/g, ' ').trim();
  for (const perm of validPermutations) {
    const cleanPermNorm = perm.toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '').replace(/\s+/g, ' ').trim();
    if (cleanUserNorm === cleanPermNorm) {
      const diffHtml = renderWordDiff(userText, perm);
      return {
        isCorrect: false,
        statusLabel: 'Minor Capitalization / Punctuation Adjustment',
        verdict: 'Almost There',
        verdictLabel: 'Minor Capitalization / Punctuation Adjustment',
        expBonus: 5, // Strict requirement 5: +5 EXP partial credit for punctuation/case only
        engine: 'Deterministic Validator',
        correctedSentence: perm,
        explanations: [
          'Word order and grammar are 100% correct! Only initial capitalization, German noun capitalization, or terminal punctuation (.) needed adjustment.'
        ],
        grammarTip: ruleBreakdown || 'Remember to capitalize German nouns and finish sentences with a period.',
        diffHtml,
        wordDiffHtml: diffHtml
      };
    }
  }

  // 3. Detect Specific German Grammar Errors (V1, Inversion V3, Case/Preposition)
  if (lang === 'de') {
    const grammarError = detectSpecificGermanGrammarErrors(userText, targetAnswer, topic);
    if (grammarError && grammarError.hasError) {
      const diffHtml = renderWordDiff(userText, closestTarget);
      return {
        isCorrect: false,
        statusLabel: '✗ Corrections Found',
        verdict: 'Needs Correction',
        verdictLabel: '✗ Corrections Found',
        expBonus: 0, // Strict requirement 5: 0 EXP for wrong verb position or cases
        engine: 'Deterministic Validator',
        correctedSentence: closestTarget,
        explanations: [grammarError.why],
        grammarTip: ruleBreakdown || 'Keep the finite verb in Position 2 in declarative main clauses.',
        diffHtml,
        wordDiffHtml: diffHtml
      };
    }
  }

  // =========================================================================
  // STEP C: Context-Aware AI Evaluation (Gemini / Groq / Pollinations)
  // =========================================================================
  // If the user's sentence passed the gatekeeper and wasn't caught by deterministic rules,
  // query AI with the complete drill context (Mongolian prompt, target answer, active rule).
  if (typeof options.callContextAwareAi === 'function') {
    try {
      const aiResult = await options.callContextAwareAi({
        userText,
        mongolianPrompt,
        targetAnswer,
        activeGrammarRule,
        lang
      });

      if (aiResult && typeof aiResult === 'object') {
        const isCorrect = Boolean(aiResult.isCorrect);
        const corrected = String(aiResult.correctedSentence || closestTarget).trim();
        const explanations = Array.isArray(aiResult.explanations) && aiResult.explanations.length > 0
          ? aiResult.explanations
          : (isCorrect ? ['Valid alternative translation.'] : ['Grammar refinement needed.']);

        // Check if only capitalization/punct difference
        const isOnlyPunct = !isCorrect && (userText.toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '').trim() === corrected.toLowerCase().replace(/[.,!?;:„"“”«»()]/g, '').trim());

        // Strict EXP logic
        const expBonus = isCorrect ? 15 : (isOnlyPunct ? 5 : 0);
        const verdict = isCorrect ? 'Perfect!' : (isOnlyPunct ? 'Almost There' : 'Needs Correction');
        const statusLabel = isCorrect
          ? '✓ Grammatically Correct'
          : (isOnlyPunct ? 'Minor Capitalization / Punctuation Adjustment' : '✗ Corrections Found');

        const diffHtml = renderWordDiff(userText, corrected);

        return {
          isCorrect,
          statusLabel,
          verdict,
          verdictLabel: statusLabel,
          expBonus,
          engine: aiResult.engine || 'AI Linguistic Evaluator',
          correctedSentence: corrected,
          explanations,
          grammarTip: String(aiResult.grammarTip || ruleBreakdown || 'Follow target word order and case governance.'),
          diffHtml,
          wordDiffHtml: diffHtml
        };
      }
    } catch (err) {
      console.warn('Context-aware AI evaluation failed, falling back to deterministic target:', err);
    }
  }

  // Fallback if AI is unavailable or offline: diff against closest valid target
  const fallbackDiff = renderWordDiff(userText, closestTarget);
  return {
    isCorrect: false,
    statusLabel: '✗ Corrections Found',
    verdict: 'Needs Correction',
    verdictLabel: '✗ Corrections Found',
    expBonus: 0, // Strict: 0 EXP on errors
    engine: 'Deterministic Validator',
    correctedSentence: closestTarget,
    explanations: [
      `Review word order and case governance against the target translation.`
    ],
    grammarTip: ruleBreakdown || 'Follow target word order and case governance.',
    diffHtml: fallbackDiff,
    wordDiffHtml: fallbackDiff
  };
}
