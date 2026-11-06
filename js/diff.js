/**
 * ARL - Color-Coded Mistake & Word-Order Diff Engine
 * Renders visual correction feedback directly on user-submitted sentences:
 * - Red Highlight (<span class="diff-error">): Spelling, wrong conjugation, wrong case, wrong article.
 * - Blue Highlight (<span class="diff-misplaced">): Word order / syntax misplacement (V2, Nebensatz verb-end).
 * - Green Highlight (<span class="diff-correct">): Correctly structured segments.
 */

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Normalizes a word for comparison by removing edge punctuation and lowercasing.
 */
function cleanWord(w) {
  return String(w || '').replace(/[.,!?;:„"“”«»()\[\]]/g, '').trim().toLowerCase();
}

/**
 * Computes structured diff segments comparing user input against corrected text.
 * @param {string} userText - Raw input from the user
 * @param {string} correctedText - Clean grammatically correct target sentence
 * @param {Object} context - Optional metadata (rule, errorType, why, AI diff)
 * @returns {Array<{type: 'correct'|'misplaced'|'error', text: string, detail?: string, arrow?: string}>}
 */
export function computeDiff(userText, correctedText, context = {}) {
  const user = String(userText || '').trim();
  const correct = String(correctedText || '').trim();

  if (!user) return [];

  // If identical, entire string is correct
  if (user === correct) {
    return [{ type: 'correct', text: user }];
  }

  // If explicit AI diff tokens are provided and valid, use them
  if (Array.isArray(context.diff) && context.diff.length > 0) {
    return context.diff.map(item => ({
      type: ['correct', 'misplaced', 'error'].includes(item.type) ? item.type : 'error',
      text: String(item.text || ''),
      detail: item.detail || item.explanation || context.why || '',
      arrow: item.arrow || (item.type === 'misplaced' ? '↳' : '')
    }));
  }

  // Tokenize preserving whitespaces
  const userTokens = user.split(/(\s+)/);
  const correctTokens = correct.split(/(\s+)/);

  const cleanCorrectWords = correctTokens
    .filter(t => !/^\s+$/.test(t))
    .map(t => cleanWord(t));

  const result = [];
  const why = context.why || '';
  const isWordOrderIssue = /inversion|verb-end|position 2|nebensatz|satzklammer|word order|wortstellung|position/i.test(why);

  // Analyze each user token
  for (let i = 0; i < userTokens.length; i++) {
    const rawToken = userTokens[i];

    // Whitespaces remain untouched as neutral / correct
    if (/^\s+$/.test(rawToken)) {
      result.push({ type: 'correct', text: rawToken });
      continue;
    }

    const cWord = cleanWord(rawToken);
    if (!cWord) {
      result.push({ type: 'correct', text: rawToken });
      continue;
    }

    // Check if the word exists in the corrected sentence
    const correctIdx = cleanCorrectWords.indexOf(cWord);

    if (correctIdx !== -1) {
      // Word exists in target sentence. Is it misplaced or in right spot?
      // Compute expected word index among non-space tokens
      const nonSpaceBefore = userTokens.slice(0, i).filter(t => !/^\s+$/.test(t)).length;

      // If sentence has a recognized word order issue and this word is shifted
      if (isWordOrderIssue && Math.abs(nonSpaceBefore - correctIdx) >= 1) {
        result.push({
          type: 'misplaced',
          text: rawToken,
          detail: why || 'Word order misplacement',
          arrow: '↳'
        });
      } else {
        result.push({
          type: 'correct',
          text: rawToken
        });
      }
    } else {
      // Word does not exist as-is in target sentence -> it is an error (spelling, case, conjugation, article)
      let detail = 'Grammar / spelling correction';
      if (/akkusativ|dativ|genitiv|case/i.test(why)) {
        detail = 'Case governance error';
      } else if (/verb|konjugation|agreement/i.test(why)) {
        detail = 'Verb form / agreement error';
      } else if (/orthography|capitaliz/i.test(why)) {
        detail = 'Capitalization error';
      }

      result.push({
        type: 'error',
        text: rawToken,
        detail: why || detail
      });
    }
  }

  // Consolidate adjacent tokens of the same type for cleaner DOM rendering
  const merged = [];
  for (const seg of result) {
    if (merged.length > 0 && merged[merged.length - 1].type === seg.type && !seg.arrow && !merged[merged.length - 1].arrow) {
      merged[merged.length - 1].text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
}

/**
 * Renders structured diff segments into accessible HTML with color-coded CSS classes.
 * @param {string} userText 
 * @param {string} correctedText 
 * @param {Object} context 
 * @returns {string} Safe HTML string
 */
export function renderColorCodedDiff(userText, correctedText, context = {}) {
  const segments = computeDiff(userText, correctedText, context);
  if (!segments || segments.length === 0) {
    return `<span class="diff-correct">${escapeHtml(userText)}</span>`;
  }

  return segments.map(seg => {
    const textEscaped = escapeHtml(seg.text);
    const detailAttr = seg.detail ? ` title="${escapeHtml(seg.detail)}" data-tooltip="${escapeHtml(seg.detail)}"` : '';

    if (seg.type === 'error') {
      return `<span class="diff-error"${detailAttr}>${textEscaped}</span>`;
    }
    if (seg.type === 'misplaced') {
      const arrow = seg.arrow ? `<span class="diff-arrow" aria-hidden="true">${escapeHtml(seg.arrow)}</span>` : '';
      return `<span class="diff-misplaced"${detailAttr}>${textEscaped}${arrow}</span>`;
    }
    return `<span class="diff-correct">${textEscaped}</span>`;
  }).join('');
}

/**
 * Word-level visual diff highlighting deleted/incorrect tokens with strikethrough (<del>)
 * and corrected insertions in bold high-contrast styling (<ins>).
 * @param {string} userText
 * @param {string} correctedText
 * @returns {string} Safe HTML string
 */
export function renderWordDiff(userText, correctedText) {
  const u = String(userText || '').trim();
  const c = String(correctedText || '').trim();
  if (!u && !c) return '';
  if (!u) return `<ins class="diff-inserted">${escapeHtml(c)}</ins>`;
  if (!c) return `<del class="diff-deleted">${escapeHtml(u)}</del>`;
  if (u === c) return `<span class="diff-same">${escapeHtml(u)}</span>`;

  const oldWords = u.split(/\s+/);
  const newWords = c.split(/\s+/);
  const m = oldWords.length;
  const n = newWords.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1].toLowerCase() === newWords[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const parts = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1].toLowerCase() === newWords[j - 1].toLowerCase()) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        parts.unshift(`<span class="diff-same">${escapeHtml(oldWords[i - 1])}</span>`);
      } else {
        parts.unshift(`<del class="diff-deleted">${escapeHtml(oldWords[i - 1])}</del> <ins class="diff-inserted">${escapeHtml(newWords[j - 1])}</ins>`);
      }
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      parts.unshift(`<ins class="diff-inserted">${escapeHtml(newWords[j - 1])}</ins>`);
      j--;
    } else {
      parts.unshift(`<del class="diff-deleted">${escapeHtml(oldWords[i - 1])}</del>`);
      i--;
    }
  }

  return parts.join(' ');
}
