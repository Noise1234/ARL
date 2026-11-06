/**
 * ARL - Telemetry, Active Study Time Tracker & Visual Analytics Engine
 * Tracks active study heartbeat, idle detection, per-word/grammar velocity,
 * 4-timeframe memorized counters, and client-side SVG visual analytics.
 */

import { db } from './db.js';
import { isCardMemorized } from './srs.js';

const STORAGE_KEY_STUDY_TIME = 'arl_study_time_stats';
const STORAGE_KEY_WORD_STATS = 'arl_word_stats';
const STORAGE_KEY_GRAMMAR_STATS = 'arl_grammar_stats';

// Season boundaries:
// Spring: Mar-May (months 2, 3, 4)
// Summer: Jun-Aug (months 5, 6, 7)
// Autumn: Sep-Nov (months 8, 9, 10)
// Winter: Dec-Feb (months 11, 0, 1)
export function getSeasonStart(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const m = d.getMonth();
  if (m >= 2 && m <= 4) return new Date(year, 2, 1, 0, 0, 0, 0).getTime();
  if (m >= 5 && m <= 7) return new Date(year, 5, 1, 0, 0, 0, 0).getTime();
  if (m >= 8 && m <= 10) return new Date(year, 8, 1, 0, 0, 0, 0).getTime();
  if (m === 11) return new Date(year, 11, 1, 0, 0, 0, 0).getTime();
  return new Date(year - 1, 11, 1, 0, 0, 0, 0).getTime(); // Jan/Feb
}

export function getIsoWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getMonthStart(date = new Date()) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0).getTime();
}

export function getYearStart(date = new Date()) {
  const d = new Date(date);
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
}

export function getTodayKey(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export class TelemetryEngine {
  constructor() {
    this.totalActiveSeconds = 0;
    this.dailyActiveSeconds = {}; // YYYY-MM-DD -> seconds
    this.sectionSeconds = {
      vocab: 0,
      sprint: 0,
      quiz: 0,
      grammar: 0,
      media: 0,
      lexicon: 0
    };

    this.wordStats = {}; // wordId -> { attempts, correct, totalTimeMs, masteredAt, level }
    this.grammarStats = {}; // ruleId -> { timeSpentMs, drillsCompleted, bestAccuracyPct, understoodAt }

    this.activeSection = 'vocab';
    this.isPaused = false;
    this.lastActivityTime = Date.now();
    this.sessionStartTime = Date.now();
    this.sessionActiveSeconds = 0;

    this.heartbeatInterval = null;
    this.listeners = new Set();
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.loadFromStorage();
    this.setupActivityListeners();
    this.startHeartbeat();
  }

  loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const timeData = localStorage.getItem(STORAGE_KEY_STUDY_TIME);
        if (timeData) {
          const parsed = JSON.parse(timeData);
          this.totalActiveSeconds = parsed.totalActiveSeconds || 0;
          this.dailyActiveSeconds = parsed.dailyActiveSeconds || {};
          this.sectionSeconds = Object.assign(this.sectionSeconds, parsed.sectionSeconds || {});
        }

        const wordData = localStorage.getItem(STORAGE_KEY_WORD_STATS);
        if (wordData) {
          this.wordStats = JSON.parse(wordData) || {};
        }

        const grammarData = localStorage.getItem(STORAGE_KEY_GRAMMAR_STATS);
        if (grammarData) {
          this.grammarStats = JSON.parse(grammarData) || {};
        }
      }
    } catch (e) {
      console.warn('Telemetry load error:', e);
    }
  }

  saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_STUDY_TIME, JSON.stringify({
          totalActiveSeconds: this.totalActiveSeconds,
          dailyActiveSeconds: this.dailyActiveSeconds,
          sectionSeconds: this.sectionSeconds
        }));
        localStorage.setItem(STORAGE_KEY_WORD_STATS, JSON.stringify(this.wordStats));
        localStorage.setItem(STORAGE_KEY_GRAMMAR_STATS, JSON.stringify(this.grammarStats));
      }
    } catch (e) {
      console.warn('Telemetry save error:', e);
    }
  }

  setupActivityListeners() {
    if (typeof window === 'undefined') return;

    const onActivity = () => {
      this.lastActivityTime = Date.now();
      if (this.isPaused && typeof document !== 'undefined' && !document.hidden) {
        this.isPaused = false;
        this.notify();
      }
    };

    ['pointerdown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
      window.addEventListener(evt, onActivity, { passive: true });
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isPaused = true;
        } else {
          this.lastActivityTime = Date.now();
          this.isPaused = false;
        }
        this.notify();
      });
    }
  }

  startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      // Auto-pause if idle for > 60 seconds or page hidden
      if (typeof document !== 'undefined' && document.hidden) {
        this.isPaused = true;
        return;
      }
      if (now - this.lastActivityTime > 60000) {
        this.isPaused = true;
        return;
      }

      this.isPaused = false;
      this.totalActiveSeconds++;
      this.sessionActiveSeconds++;

      const today = getTodayKey();
      this.dailyActiveSeconds[today] = (this.dailyActiveSeconds[today] || 0) + 1;

      const sec = this.activeSection || 'vocab';
      this.sectionSeconds[sec] = (this.sectionSeconds[sec] || 0) + 1;

      // Periodic persistence every 10 seconds
      if (this.totalActiveSeconds % 10 === 0) {
        this.saveToStorage();
      }

      this.notify();
    }, 1000);
  }

  setActiveSection(section) {
    if (this.sectionSeconds.hasOwnProperty(section)) {
      this.activeSection = section;
    } else {
      this.activeSection = 'vocab';
    }
  }

  recordWordAttempt(wordId, isCorrect, elapsedMs, isMastered = false, level = 'B1') {
    if (!wordId) return;
    const stats = this.wordStats[wordId] || {
      attempts: 0,
      correct: 0,
      totalTimeMs: 0,
      masteredAt: null,
      level: level || 'B1'
    };

    stats.attempts++;
    if (isCorrect) stats.correct++;
    stats.totalTimeMs += Math.max(100, Math.min(elapsedMs || 1000, 60000));
    stats.level = level || stats.level;

    if (isMastered && !stats.masteredAt) {
      stats.masteredAt = Date.now();
    }

    this.wordStats[wordId] = stats;
    this.saveToStorage();
    this.notify();
  }

  recordGrammarDrill(ruleId, accuracyPct, timeSpentMs) {
    if (!ruleId) return;
    const current = this.grammarStats[ruleId] || {
      timeSpentMs: 0,
      drillsCompleted: 0,
      bestAccuracyPct: 0,
      understoodAt: null
    };

    current.timeSpentMs += Math.max(0, timeSpentMs || 0);
    current.drillsCompleted += 20; // 20-drill set
    if (accuracyPct > current.bestAccuracyPct) {
      current.bestAccuracyPct = Math.round(accuracyPct);
    }
    if (accuracyPct >= 80 && !current.understoodAt) {
      current.understoodAt = Date.now();
    }

    this.grammarStats[ruleId] = current;
    this.saveToStorage();
    this.notify();
  }

  subscribe(fn) {
    if (typeof fn === 'function') this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) {}
    });
  }

  // Formatting helpers
  formatSessionTime() {
    const s = this.sessionActiveSeconds;
    if (s < 60) return `⏱ ${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `⏱ ${m}m`;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `⏱ ${h}h ${remM}m`;
  }

  formatTimeSpan(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}h ${remM}m`;
  }

  formatMs(ms) {
    const s = Math.round((ms || 0) / 1000);
    return this.formatTimeSpan(s);
  }

  // 4 Timeframe Memorized Word Counts
  getMemorizedCounts(cards, progressMap) {
    const now = Date.now();
    const weekStart = getIsoWeekStart(now);
    const monthStart = getMonthStart(now);
    const seasonStart = getSeasonStart(now);
    const yearStart = getYearStart(now);

    let week = 0;
    let month = 0;
    let season = 0;
    let year = 0;
    let total = 0;

    if (Array.isArray(cards)) {
      for (const card of cards) {
        const prog = progressMap ? progressMap.get(card.id) : null;
        if (isCardMemorized(prog)) {
          total++;
          const masteredAt = prog.masteredAt || this.wordStats[card.id]?.masteredAt || prog.lastStudied || now;
          if (masteredAt >= weekStart) week++;
          if (masteredAt >= monthStart) month++;
          if (masteredAt >= seasonStart) season++;
          if (masteredAt >= yearStart) year++;
        }
      }
    }

    return { week, month, season, year, total };
  }

  // Time aggregated cards for [📊 Stats]
  getTimeStats() {
    const now = new Date();
    const todayKey = getTodayKey(now);
    const todaySec = this.dailyActiveSeconds[todayKey] || 0;

    const weekStart = getIsoWeekStart(now);
    const monthStart = getMonthStart(now);
    const seasonStart = getSeasonStart(now);
    const yearStart = getYearStart(now);

    let weekSec = 0;
    let monthSec = 0;
    let seasonSec = 0;
    let yearSec = 0;

    for (const [dateStr, sec] of Object.entries(this.dailyActiveSeconds)) {
      const d = new Date(dateStr + 'T00:00:00').getTime();
      if (d >= weekStart) weekSec += sec;
      if (d >= monthStart) monthSec += sec;
      if (d >= seasonStart) seasonSec += sec;
      if (d >= yearStart) yearSec += sec;
    }

    return {
      today: this.formatTimeSpan(todaySec),
      week: this.formatTimeSpan(weekSec),
      month: this.formatTimeSpan(monthSec),
      season: this.formatTimeSpan(seasonSec),
      year: this.formatTimeSpan(yearSec),
      total: this.formatTimeSpan(this.totalActiveSeconds),
      todayHours: (todaySec / 3600).toFixed(1) + 'h',
      weekHours: (weekSec / 3600).toFixed(1) + 'h',
      totalHours: (this.totalActiveSeconds / 3600).toFixed(1) + 'h',
      todaySec,
      weekSec,
      totalSec: this.totalActiveSeconds
    };
  }

  // Word velocity & difficulty
  getWordVelocityAnalytics(cards) {
    const cardsById = new Map();
    if (Array.isArray(cards)) {
      cards.forEach(c => cardsById.set(c.id, c));
    }

    const byLevel = { A1: [], A2: [], B1: [], B2: [] };
    const allMastered = [];

    for (const [id, stats] of Object.entries(this.wordStats)) {
      if (stats.masteredAt && stats.totalTimeMs > 0) {
        const card = cardsById.get(id);
        const lvl = (card?.level || stats.level || 'B1').toUpperCase();
        const entry = {
          id,
          word: card?.word || id,
          mn: card?.mn || '',
          level: lvl,
          timeMs: stats.totalTimeMs,
          attempts: stats.attempts
        };
        allMastered.push(entry);
        if (byLevel[lvl]) byLevel[lvl].push(entry);
      }
    }

    const avgByLevel = {};
    for (const lvl of ['A1', 'A2', 'B1', 'B2']) {
      const list = byLevel[lvl];
      if (list.length > 0) {
        const sum = list.reduce((acc, c) => acc + c.timeMs, 0);
        avgByLevel[lvl] = this.formatMs(sum / list.length);
      } else {
        avgByLevel[lvl] = '—';
      }
    }

    const totalSum = allMastered.reduce((acc, c) => acc + c.timeMs, 0);
    const overallAvg = allMastered.length > 0
      ? this.formatMs(totalSum / allMastered.length)
      : '1m 24s';

    allMastered.sort((a, b) => a.timeMs - b.timeMs);
    const fastest = allMastered.slice(0, 5);
    const hardest = [...allMastered].reverse().slice(0, 5);

    return {
      overallAvg,
      avgByLevel,
      fastest,
      hardest
    };
  }

  /* -------------------------------------------------------------
   * SVG CHARTS GENERATION (Clean, Pure SVG, Zero External CDN)
   * ------------------------------------------------------------- */

  /**
   * Chart 1: Memorized Words Timeline (Bar Chart)
   * Toggle: 'week' (7 days), 'month' (4 weeks), 'season' (3 months), 'year' (12 months)
   */
  renderChart1Timeline(mode = 'week', cards = [], progressMap = new Map()) {
    const width = 640;
    const height = 220;
    const padding = { top: 20, right: 20, bottom: 40, left: 45 };

    const labels = [];
    const values = [];

    const now = new Date();
    if (mode === 'week') {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekStart = getIsoWeekStart(now);
      for (let i = 0; i < 7; i++) {
        labels.push(dayNames[i]);
        const dayStart = weekStart + (i * 86400000);
        const dayEnd = dayStart + 86400000;
        let count = 0;
        for (const card of cards) {
          const prog = progressMap.get(card.id);
          if (isCardMemorized(prog)) {
            const m = prog.masteredAt || prog.lastStudied || 0;
            if (m >= dayStart && m < dayEnd) count++;
          }
        }
        values.push(count);
      }
    } else if (mode === 'month') {
      labels.push('Wk 1', 'Wk 2', 'Wk 3', 'Wk 4');
      const mStart = getMonthStart(now);
      for (let i = 0; i < 4; i++) {
        const wStart = mStart + (i * 7 * 86400000);
        const wEnd = wStart + (7 * 86400000);
        let count = 0;
        for (const card of cards) {
          const prog = progressMap.get(card.id);
          if (isCardMemorized(prog)) {
            const m = prog.masteredAt || prog.lastStudied || 0;
            if (m >= wStart && m < wEnd) count++;
          }
        }
        values.push(count);
      }
    } else if (mode === 'season') {
      const m = now.getMonth();
      const seasonMonths = (m >= 8 && m <= 10) ? ['Sep', 'Oct', 'Nov'] :
                           (m >= 2 && m <= 4) ? ['Mar', 'Apr', 'May'] :
                           (m >= 5 && m <= 7) ? ['Jun', 'Jul', 'Aug'] : ['Dec', 'Jan', 'Feb'];
      const sStart = getSeasonStart(now);
      for (let i = 0; i < 3; i++) {
        labels.push(seasonMonths[i]);
        const start = sStart + (i * 30 * 86400000);
        const end = start + (30 * 86400000);
        let count = 0;
        for (const card of cards) {
          const prog = progressMap.get(card.id);
          if (isCardMemorized(prog)) {
            const val = prog.masteredAt || prog.lastStudied || 0;
            if (val >= start && val < end) count++;
          }
        }
        values.push(count);
      }
    } else {
      // Year (12 months)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const y = now.getFullYear();
      for (let i = 0; i < 12; i++) {
        labels.push(monthNames[i]);
        const start = new Date(y, i, 1).getTime();
        const end = new Date(y, i + 1, 1).getTime();
        let count = 0;
        for (const card of cards) {
          const prog = progressMap.get(card.id);
          if (isCardMemorized(prog)) {
            const val = prog.masteredAt || prog.lastStudied || 0;
            if (val >= start && val < end) count++;
          }
        }
        values.push(count);
      }
    }

    const maxVal = Math.max(10, ...values);
    const plotW = width - padding.left - padding.right;
    const plotH = height - padding.top - padding.bottom;
    const barWidth = Math.max(14, Math.floor(plotW / labels.length * 0.55));
    const step = plotW / labels.length;

    let barsSvg = '';
    labels.forEach((label, i) => {
      const val = values[i];
      const barH = (val / maxVal) * plotH;
      const x = padding.left + (i * step) + (step - barWidth) / 2;
      const y = padding.top + (plotH - barH);

      barsSvg += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="var(--text-primary, #ffffff)" opacity="0.88">
          <title>${label}: ${val} words</title>
        </rect>
        <text x="${x + barWidth / 2}" y="${y - 4}" text-anchor="middle" fill="var(--text-primary, #ffffff)" font-size="10" font-family="'JetBrains Mono', monospace">${val > 0 ? val : ''}</text>
        <text x="${x + barWidth / 2}" y="${height - 12}" text-anchor="middle" fill="var(--text-secondary, #a1a1aa)" font-size="11" font-family="'JetBrains Mono', monospace">${label}</text>
      `;
    });

    // Y-axis grid lines (0, 50%, 100%)
    const gridSvg = `
      <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="var(--border-subtle, rgba(255,255,255,0.08))" stroke-dasharray="3,3"/>
      <text x="${padding.left - 8}" y="${padding.top + 4}" text-anchor="end" fill="var(--text-muted, #71717a)" font-size="10">${maxVal}</text>
      
      <line x1="${padding.left}" y1="${padding.top + plotH / 2}" x2="${width - padding.right}" y2="${padding.top + plotH / 2}" stroke="var(--border-subtle, rgba(255,255,255,0.08))" stroke-dasharray="3,3"/>
      <text x="${padding.left - 8}" y="${padding.top + plotH / 2 + 4}" text-anchor="end" fill="var(--text-muted, #71717a)" font-size="10">${Math.round(maxVal / 2)}</text>
      
      <line x1="${padding.left}" y1="${padding.top + plotH}" x2="${width - padding.right}" y2="${padding.top + plotH}" stroke="var(--border-focus, rgba(255,255,255,0.22))"/>
      <text x="${padding.left - 8}" y="${padding.top + plotH + 4}" text-anchor="end" fill="var(--text-muted, #71717a)" font-size="10">0</text>
    `;

    return `
      <svg viewBox="0 0 ${width} ${height}" class="arl-analytics-svg" style="width:100%; height:auto;">
        ${gridSvg}
        ${barsSvg}
      </svg>
    `;
  }

  /**
   * Chart 3: Grammar Understanding Time & Mastery (Horizontal Dual Bar Chart)
   */
  renderChart3Grammar(topics = []) {
    const list = topics.slice(0, 10); // Display up to 10 topics
    const height = Math.max(220, list.length * 42 + 40);
    const width = 640;
    const padding = { top: 20, right: 30, bottom: 20, left: 160 };
    const barH = 14;

    let itemsSvg = '';
    list.forEach((topic, i) => {
      const stats = this.grammarStats[topic.id] || { timeSpentMs: 0, bestAccuracyPct: 0, understoodAt: null };
      const mins = ((stats.timeSpentMs || 0) / 60000).toFixed(1);
      const acc = stats.bestAccuracyPct || 0;
      const isUnderstood = acc >= 80 || Boolean(stats.understoodAt);

      const y = padding.top + (i * 42);
      const title = topic.title.length > 22 ? topic.title.slice(0, 20) + '…' : topic.title;

      // Accuracy bar width (max 200px)
      const accW = (acc / 100) * 180;
      // Time bar width (up to 30 mins = 180px)
      const timeW = Math.min(180, (mins / 30) * 180);

      itemsSvg += `
        <text x="${padding.left - 10}" y="${y + 12}" text-anchor="end" fill="var(--text-primary, #ffffff)" font-size="11" font-weight="500">${title}</text>
        
        <!-- Accuracy Bar -->
        <rect x="${padding.left}" y="${y}" width="180" height="${barH}" fill="var(--bg-surface-2, #1a1a1e)" stroke="var(--border-subtle, rgba(255,255,255,0.08))" rx="3"/>
        <rect x="${padding.left}" y="${y}" width="${accW}" height="${barH}" fill="var(--accent-primary, #ffffff)" rx="3">
          <title>${acc}% drill accuracy</title>
        </rect>
        <text x="${padding.left + 185}" y="${y + 11}" fill="var(--text-primary, #ffffff)" font-size="10" font-family="'JetBrains Mono', monospace">
          ${acc}% ${isUnderstood ? '✓ Understood' : ''}
        </text>

        <!-- Time Bar -->
        <rect x="${padding.left + 290}" y="${y}" width="140" height="${barH}" fill="var(--bg-surface-2, #1a1a1e)" stroke="var(--border-subtle, rgba(255,255,255,0.08))" rx="3"/>
        <rect x="${padding.left + 290}" y="${y}" width="${timeW}" height="${barH}" fill="var(--text-secondary, #a1a1aa)" rx="3">
          <title>${mins} mins</title>
        </rect>
        <text x="${padding.left + 438}" y="${y + 11}" fill="var(--text-secondary, #a1a1aa)" font-size="10" font-family="'JetBrains Mono', monospace">
          ${mins}m
        </text>
      `;
    });

    return `
      <svg viewBox="0 0 ${width} ${height}" class="arl-analytics-svg" style="width:100%; height:auto;">
        <text x="${padding.left}" y="12" fill="var(--text-muted, #71717a)" font-size="10" font-family="'JetBrains Mono', monospace">ACCURACY</text>
        <text x="${padding.left + 290}" y="12" fill="var(--text-muted, #71717a)" font-size="10" font-family="'JetBrains Mono', monospace">TIME SPENT</text>
        ${itemsSvg}
      </svg>
    `;
  }

  /**
   * Chart 4: Daily Study Time Distribution & Heatmap
   */
  renderChart4Distribution() {
    const width = 640;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };

    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = getTodayKey(d);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({
        key: k,
        label,
        mins: Math.round((this.dailyActiveSeconds[k] || 0) / 60)
      });
    }

    const maxMins = Math.max(30, ...days.map(d => d.mins));
    const plotW = width - padding.left - 240;
    const plotH = height - padding.top - padding.bottom;
    const step = plotW / 7;
    const barW = Math.max(16, step * 0.6);

    let bars = '';
    days.forEach((day, i) => {
      const bH = (day.mins / maxMins) * plotH;
      const x = padding.left + (i * step) + (step - barW) / 2;
      const y = padding.top + (plotH - bH);
      bars += `
        <rect x="${x}" y="${y}" width="${barW}" height="${bH}" rx="4" fill="var(--text-primary, #ffffff)" opacity="0.88">
          <title>${day.label}: ${day.mins} mins</title>
        </rect>
        <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" fill="var(--text-primary, #ffffff)" font-size="10" font-family="'JetBrains Mono', monospace">${day.mins > 0 ? day.mins + 'm' : ''}</text>
        <text x="${x + barW / 2}" y="${height - 10}" text-anchor="middle" fill="var(--text-secondary, #a1a1aa)" font-size="11" font-family="'JetBrains Mono', monospace">${day.label}</text>
      `;
    });

    // Right-side category breakdown
    const totalSec = Math.max(1, Object.values(this.sectionSeconds).reduce((a, b) => a + b, 0));
    const sections = [
      { name: 'Vocab', sec: this.sectionSeconds.vocab || 0, color: 'var(--text-primary, #ffffff)' },
      { name: 'Quiz', sec: this.sectionSeconds.quiz || 0, color: 'var(--text-secondary, #a1a1aa)' },
      { name: 'Grammar', sec: this.sectionSeconds.grammar || 0, color: 'var(--text-muted, #71717a)' },
      { name: 'Lexicon', sec: this.sectionSeconds.lexicon || 0, color: 'var(--border-focus, #52525b)' }
    ];

    let breakdownSvg = `<g transform="translate(${width - 200}, 25)">`;
    sections.forEach((s, idx) => {
      const pct = Math.round((s.sec / totalSec) * 100);
      const y = idx * 28;
      breakdownSvg += `
        <rect x="0" y="${y}" width="10" height="10" rx="2" fill="${s.color}"/>
        <text x="18" y="${y + 9}" fill="var(--text-primary, #ffffff)" font-size="11" font-family="'JetBrains Mono', monospace">${s.name}: ${this.formatTimeSpan(s.sec)} (${pct}%)</text>
      `;
    });
    breakdownSvg += `</g>`;

    return `
      <svg viewBox="0 0 ${width} ${height}" class="arl-analytics-svg" style="width:100%; height:auto;">
        <line x1="${padding.left}" y1="${padding.top + plotH}" x2="${width - 230}" y2="${padding.top + plotH}" stroke="#334155"/>
        ${bars}
        ${breakdownSvg}
      </svg>
    `;
  }
}

export const telemetry = new TelemetryEngine();
