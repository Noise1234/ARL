/**
 * ARL - Dopamine EXP & Reward System
 * Pure mathematical functions for monotonic EXP accumulation,
 * level progression, streak multipliers, and visual reward micro-interactions.
 */

// EXP constants
export const EXP_PRACTICE_SUBMIT = 15;
export const EXP_ACCURACY_BONUS = 35;
export const EXP_FLASHCARD_BASE = {
  1: 5,   // Again
  2: 15,  // Hard
  3: 25,  // Good
  4: 35   // Easy
};

/**
 * Pure, NaN-safe, monotonic addition for EXP.
 */
export function safeAddExp(currentExp, delta) {
  const base = (typeof currentExp === 'number' && Number.isFinite(currentExp) && currentExp >= 0)
    ? Math.floor(currentExp)
    : 0;
  const safeDelta = (typeof delta === 'number' && Number.isFinite(delta) && delta > 0)
    ? Math.floor(delta)
    : 0;
  return Math.min(Number.MAX_SAFE_INTEGER, base + safeDelta);
}

/**
 * Calculates EXP required to advance from `level` to `level + 1`.
 * Level 1 -> 100 EXP, Level 2 -> 125 EXP, Level 3 -> 156 EXP, etc.
 */
export function getExpNeededForLevel(level) {
  const safeLvl = Math.max(1, Math.floor(level || 1));
  return Math.floor(100 * Math.pow(1.25, safeLvl - 1));
}

/**
 * Computes level progression details from total lifetime EXP.
 */
export function getLevelProgress(totalExp) {
  const safeExp = (Number.isFinite(totalExp) && totalExp > 0) ? Math.floor(totalExp) : 0;
  let level = 1;
  let accumulated = 0;

  while (level < 1000) {
    const needed = Math.floor(100 * Math.pow(1.25, level - 1));
    if (safeExp < accumulated + needed) {
      const expInCurrentLevel = safeExp - accumulated;
      const progressPct = needed > 0 ? Math.min(100, Math.floor((expInCurrentLevel / needed) * 100)) : 0;
      return {
        level,
        totalExp: safeExp,
        expInCurrentLevel,
        expNeededForNext: needed,
        progressPct
      };
    }
    accumulated += needed;
    level++;
  }

  return { level: 999, totalExp: safeExp, expInCurrentLevel: 0, expNeededForNext: 0, progressPct: 100 };
}

/**
 * Computes streak multiplier based on active study/practice streak.
 * 0-2 streak: 1.0x
 * 3-4 streak: 1.2x
 * 5-9 streak: 1.5x
 * 10+ streak: 2.0x
 */
export function getStreakMultiplier(streak) {
  const s = Math.max(0, Math.floor(streak || 0));
  if (s >= 10) return 2.0;
  if (s >= 5) return 1.5;
  if (s >= 3) return 1.2;
  return 1.0;
}

/**
 * Calculates awarded EXP factoring in base points and streak multiplier.
 */
export function calculateAwardedExp(baseExp, streak) {
  const base = (typeof baseExp === 'number' && Number.isFinite(baseExp) && baseExp > 0)
    ? Math.floor(baseExp)
    : 0;
  const multiplier = getStreakMultiplier(streak);
  return Math.floor(base * multiplier);
}

/**
 * Displays a lightweight, floating "+EXP" micro-badge that floats up and fades out.
 * Zero layout thrashing, pointer-events none, auto-removes from DOM.
 */
export function showFloatingExp(amount, options = {}) {
  if (typeof document === 'undefined') return;

  const container = document.getElementById('exp-floating-container') || document.body;
  const badge = document.createElement('div');
  badge.className = 'floating-exp-badge';
  
  if (amount > 0) {
    const label = options.label ? ` · ${options.label}` : '';
    badge.innerHTML = `+${amount} EXP${label}`;
  } else {
    // Zero amount with label (e.g. Level-up notification badge)
    badge.innerHTML = `⚡ ${options.label || 'LEVEL UP!'}`;
  }
  
  if (options.bonus) {
    badge.classList.add('bonus-highlight');
  }

  // Positioning
  if (options.x && options.y) {
    badge.style.left = `${options.x}px`;
    badge.style.top = `${options.y}px`;
  } else {
    badge.style.right = '24px';
    badge.style.top = '60px';
  }

  container.appendChild(badge);

  setTimeout(() => {
    badge.classList.add('fade-out');
  }, 900);

  setTimeout(() => {
    if (badge.parentNode) {
      badge.parentNode.removeChild(badge);
    }
  }, 1400);
}
