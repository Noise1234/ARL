/**
 * ARL - Pure Deterministic Spaced Repetition System (SRS)
 * Implements modified SM-2 algorithm for 4-grade active recall (1: Again, 2: Hard, 3: Good, 4: Easy).
 * Pure functions: No UI side effects, no mutations, strictly deterministic.
 */

export const DAY_MS = 86400000;
export const MIN_EASE_FACTOR = 1.30;
export const DEFAULT_EASE_FACTOR = 2.50;

/**
 * Calculates new SRS parameters for a card based on recall grade.
 *
 * @param {Object} card Existing card progress record
 * @param {number} grade Recall grade: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 * @param {number} [now=Date.now()] Reference timestamp in milliseconds
 * @returns {Object} Fresh object with updated SRS attributes
 */
export function scheduleCard(card, grade, now = Date.now()) {
  const safeNow = (Number.isFinite(now) && now > 0) ? now : Date.now();
  const safeGrade = [1, 2, 3, 4].includes(grade) ? grade : 1;

  // Defensive extraction of existing properties
  const reps = Math.max(0, Number.isFinite(card?.reps) ? Math.floor(card.reps) : 0);
  const interval = Math.max(0, Number.isFinite(card?.interval) ? Math.floor(card.interval) : 0);
  const easeFactor = Math.max(MIN_EASE_FACTOR, Number.isFinite(card?.easeFactor) ? card.easeFactor : DEFAULT_EASE_FACTOR);
  const lapses = Math.max(0, Number.isFinite(card?.lapses) ? Math.floor(card.lapses) : 0);

  let newReps = 0;
  let newInterval = 1;
  let newEase = easeFactor;
  let newLapses = lapses;

  switch (safeGrade) {
    case 1: // Again (Lapse)
      newReps = 0;
      newInterval = 1;
      newLapses = lapses + 1;
      newEase = Math.max(MIN_EASE_FACTOR, easeFactor - 0.20);
      break;

    case 2: // Hard
      newReps = reps + 1;
      newLapses = lapses;
      newEase = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
      if (reps === 0) {
        newInterval = 1;
      } else if (reps === 1) {
        newInterval = 2;
      } else {
        newInterval = Math.max(interval + 1, Math.round(interval * 1.2));
      }
      break;

    case 3: // Good
      newReps = reps + 1;
      newLapses = lapses;
      newEase = Math.max(MIN_EASE_FACTOR, easeFactor);
      if (reps === 0) {
        newInterval = 1;
      } else if (reps === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.max(interval + 1, Math.round(interval * newEase));
      }
      break;

    case 4: // Easy
      newReps = reps + 1;
      newLapses = lapses;
      newEase = Math.max(MIN_EASE_FACTOR, easeFactor + 0.15);
      if (reps === 0) {
        newInterval = 4;
      } else if (reps === 1) {
        newInterval = 10;
      } else {
        newInterval = Math.max(interval + 2, Math.round(interval * newEase * 1.3));
      }
      break;
  }

  // Ensure strict safety: no negative, NaN, or decimal intervals
  newInterval = Math.max(1, Math.floor(newInterval));
  newEase = Math.round(newEase * 100) / 100;
  const newDueDate = safeNow + (newInterval * DAY_MS);

  return {
    ...(card || {}),
    reps: newReps,
    interval: newInterval,
    easeFactor: newEase,
    lapses: newLapses,
    dueDate: newDueDate,
    lastStudied: safeNow,
    lastGrade: safeGrade,
    status: (newReps >= 1 && newInterval >= 2) ? 'memorized' : 'learning'
  };
}

/**
 * Checks if a card is considered memorized / learned.
 * @param {Object} progress Progress record
 * @returns {boolean}
 */
export function isCardMemorized(progress) {
  return Boolean(
    progress &&
    progress.lastStudied &&
    ((progress.reps >= 1 && progress.interval >= 2) || progress.status === 'memorized')
  );
}

/**
 * Resets a card to a clean, active learning state (pure deterministic function).
 * @param {Object} existingProgress Existing card progress
 * @param {number} [now=Date.now()] Reference timestamp
 * @returns {Object} Fresh progress record
 */
export function resetCardSRS(existingProgress, now = Date.now()) {
  const safeNow = (Number.isFinite(now) && now > 0) ? now : Date.now();
  return {
    ...(existingProgress || {}),
    reps: 0,
    interval: 1,
    easeFactor: DEFAULT_EASE_FACTOR,
    lapses: 0,
    dueDate: safeNow,
    lastStudied: null,
    lastGrade: null,
    status: 'new'
  };
}

/**
 * Checks if a card is currently due for review.
 * @param {Object} progress Progress record
 * @param {number} [now=Date.now()] Current timestamp
 * @returns {boolean}
 */
export function isCardDue(progress, now = Date.now()) {
  if (!progress || progress.dueDate === undefined || progress.dueDate === null) return true;
  const rawDue = progress.dueDate;
  const due = typeof rawDue === 'string'
    ? (Number.isFinite(Number(rawDue)) ? Number(rawDue) : Date.parse(rawDue))
    : Number(rawDue);
  if (!Number.isFinite(due)) return true;
  return due <= now;
}

/**
 * Calculates due, new, memorized, and total counts for a card dataset.
 * @param {Array<Object>} cards All vocabulary cards
 * @param {Map<string, Object>} progressMap Map of card ID to progress record
 * @param {number} [now=Date.now()] Reference timestamp
 * @returns {{ dueCount: number, newCount: number, memorizedCount: number, totalCount: number }}
 */
export function getQueueStats(cards, progressMap, now = Date.now()) {
  if (!Array.isArray(cards)) return { dueCount: 0, newCount: 0, memorizedCount: 0, totalCount: 0 };
  let dueCount = 0;
  let newCount = 0;
  let memorizedCount = 0;

  for (const card of cards) {
    const prog = progressMap ? progressMap.get(card.id) : null;
    if (isCardMemorized(prog)) {
      memorizedCount++;
    }
    if (!prog || !prog.lastStudied) {
      newCount++;
    } else if (isCardDue(prog, now)) {
      dueCount++;
    }
  }

  return {
    dueCount,
    newCount,
    memorizedCount,
    totalCount: cards.length
  };
}
