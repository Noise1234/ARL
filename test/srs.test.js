import assert from 'assert';
import {
  scheduleCard,
  isCardDue,
  getQueueStats,
  DAY_MS,
  MIN_EASE_FACTOR,
  DEFAULT_EASE_FACTOR
} from '../js/srs.js';

export async function runSrsTests(it) {
  console.log('\n--- Testing js/srs.js (Pure SM-2 SRS Algorithm) ---');

  const baseNow = 1770000000000;

  it('Default new card scheduled with Good (grade 3) sets reps=1, interval=1, default ease', () => {
    const card = { id: 'test_1' };
    const next = scheduleCard(card, 3, baseNow);

    assert.strictEqual(next.id, 'test_1');
    assert.strictEqual(next.reps, 1);
    assert.strictEqual(next.interval, 1);
    assert.strictEqual(next.easeFactor, DEFAULT_EASE_FACTOR);
    assert.strictEqual(next.lapses, 0);
    assert.strictEqual(next.dueDate, baseNow + DAY_MS);
    assert.strictEqual(next.lastGrade, 3);
    assert.strictEqual(next.lastStudied, baseNow);
  });

  it('New card scheduled with Easy (grade 4) gives bonus initial interval 4 and increases ease', () => {
    const card = { id: 'test_2' };
    const next = scheduleCard(card, 4, baseNow);

    assert.strictEqual(next.reps, 1);
    assert.strictEqual(next.interval, 4);
    assert.strictEqual(next.easeFactor, 2.65);
    assert.strictEqual(next.dueDate, baseNow + (4 * DAY_MS));
  });

  it('Second review with Good (grade 3) expands interval to 6', () => {
    const card = { id: 'test_3', reps: 1, interval: 1, easeFactor: 2.50, lapses: 0 };
    const next = scheduleCard(card, 3, baseNow);

    assert.strictEqual(next.reps, 2);
    assert.strictEqual(next.interval, 6);
    assert.strictEqual(next.dueDate, baseNow + (6 * DAY_MS));
  });

  it('Subsequent review (reps=2) scales interval by ease factor', () => {
    const card = { id: 'test_4', reps: 2, interval: 6, easeFactor: 2.50, lapses: 0 };
    const next = scheduleCard(card, 3, baseNow);

    assert.strictEqual(next.reps, 3);
    assert.strictEqual(next.interval, 15);
    assert.strictEqual(next.dueDate, baseNow + (15 * DAY_MS));
  });

  it('Lapse on Again (grade 1) resets reps to 0, sets interval to 1, increments lapses, reduces ease', () => {
    const card = { id: 'test_5', reps: 4, interval: 30, easeFactor: 2.40, lapses: 1 };
    const next = scheduleCard(card, 1, baseNow);

    assert.strictEqual(next.reps, 0);
    assert.strictEqual(next.interval, 1);
    assert.strictEqual(next.lapses, 2);
    assert.strictEqual(next.easeFactor, 2.20);
    assert.strictEqual(next.dueDate, baseNow + DAY_MS);
  });

  it('Ease factor is strictly clamped to MIN_EASE_FACTOR (1.30)', () => {
    let card = { id: 'test_6', reps: 1, interval: 1, easeFactor: 1.35, lapses: 3 };
    card = scheduleCard(card, 1, baseNow);
    assert.strictEqual(card.easeFactor, MIN_EASE_FACTOR);

    card = scheduleCard(card, 1, baseNow);
    assert.strictEqual(card.easeFactor, MIN_EASE_FACTOR);
  });

  it('scheduleCard is pure and never mutates input card object', () => {
    const card = Object.freeze({ id: 'immutable_card', reps: 1, interval: 2, easeFactor: 2.50, lapses: 0 });
    const next = scheduleCard(card, 3, baseNow);

    assert.notStrictEqual(card, next);
    assert.strictEqual(card.reps, 1);
    assert.strictEqual(next.reps, 2);
  });

  it('Defensive inputs: handles NaN, null, undefined, strings without producing NaN or negative intervals', () => {
    const weirdCard = { id: 'weird', reps: 'invalid', interval: -10, easeFactor: NaN, lapses: null };
    const next = scheduleCard(weirdCard, 'not_a_grade', NaN);

    assert(Number.isFinite(next.interval));
    assert(next.interval >= 1);
    assert(Number.isFinite(next.easeFactor));
    assert(next.easeFactor >= MIN_EASE_FACTOR);
    assert(Number.isFinite(next.reps));
    assert(next.reps >= 0);
    assert(Number.isFinite(next.dueDate));
  });

  it('isCardDue accurately identifies due vs upcoming cards with numbers, strings, and ISO dates', () => {
    assert.strictEqual(isCardDue(null, baseNow), true);
    assert.strictEqual(isCardDue({ dueDate: null }, baseNow), true);
    assert.strictEqual(isCardDue({ dueDate: baseNow - 1000 }, baseNow), true);
    assert.strictEqual(isCardDue({ dueDate: baseNow }, baseNow), true);
    assert.strictEqual(isCardDue({ dueDate: baseNow + 5000 }, baseNow), false);

    // Numeric string timestamps
    assert.strictEqual(isCardDue({ dueDate: String(baseNow - 5000) }, baseNow), true);
    assert.strictEqual(isCardDue({ dueDate: String(baseNow + 5000) }, baseNow), false);

    // ISO string timestamps
    assert.strictEqual(isCardDue({ dueDate: '2026-01-01T00:00:00.000Z' }, baseNow), true);
    assert.strictEqual(isCardDue({ dueDate: '2030-01-01T00:00:00.000Z' }, baseNow), false);

    // Corrupt / unparseable dates default defensively to due (true)
    assert.strictEqual(isCardDue({ dueDate: 'not_a_valid_date' }, baseNow), true);
  });

  it('getQueueStats correctly partitions cards into due, new, and total', () => {
    const cards = [
      { id: 'c1' },
      { id: 'c2' },
      { id: 'c3' }
    ];
    const progressMap = new Map();
    progressMap.set('c1', { wordId: 'c1', lastStudied: baseNow - (2 * DAY_MS), dueDate: baseNow - 10 });
    progressMap.set('c2', { wordId: 'c2', lastStudied: baseNow, dueDate: baseNow + (5 * DAY_MS) });

    const stats = getQueueStats(cards, progressMap, baseNow);
    assert.strictEqual(stats.totalCount, 3);
    assert.strictEqual(stats.dueCount, 1);
    assert.strictEqual(stats.newCount, 1);
  });
}
