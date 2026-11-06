/**
 * ARL - Telemetry & Visual Analytics Dashboard View ([X] Statistik)
 * Consolidated Analytics Hub:
 * - 5-Card Monochrome Bento Grid: Weekly, Monthly, Seasonal (90-day), Yearly, and Total
 * - App Usage Time Tracker: Daily, Weekly, Total study hours (tab-visibility & idle protected)
 * - Learning Speed Analytics Graphics: High-contrast monochrome SVG charts & learning velocity
 */

import { state } from '../state.js';
import { telemetry } from '../telemetry.js';
import { sound } from '../sound.js';

export class StatsView {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.timelineMode = 'week'; // 'week' | 'month' | 'season' | 'year'
    this.grammarTopics = [];
    this.loadGrammarTopics();
  }

  async loadGrammarTopics() {
    try {
      const resp = await fetch(`data/${state.targetLang}/grammar.json`);
      if (resp.ok) {
        const folders = await resp.json();
        const list = [];
        folders.forEach(f => {
          (f.topics || []).forEach(t => list.push({ ...t, level: f.level }));
        });
        this.grammarTopics = list;
        this.render();
      }
    } catch (e) {
      console.warn('Could not load grammar topics for stats:', e);
    }
  }

  setTimelineMode(mode) {
    this.timelineMode = mode;
    this.render();
  }

  render() {
    const memCounts = telemetry.getMemorizedCounts(state.cards, state.progressMap);
    const timeStats = telemetry.getTimeStats();
    const velocity = telemetry.getWordVelocityAnalytics(state.cards);

    const totalHoursNum = Math.max(0.05, (timeStats.totalSec || 0) / 3600);
    const wordsPerHour = memCounts.total > 0 ? (memCounts.total / totalHoursNum).toFixed(1) : '0.0';

    this.container.innerHTML = `
      <div class="stats-dashboard-container">
        
        <!-- Dashboard Header -->
        <div class="stats-header-bar">
          <div>
            <h2 class="stats-title">[X] Statistik & Analytics</h2>
            <div class="stats-subtitle">Active SM-2 retention metrics, study velocity, and usage time telemetry</div>
          </div>
          <div class="stats-top-badge">
            <span class="session-timer-badge">⏱ ${telemetry.formatSessionTime()} active session</span>
          </div>
        </div>

        <!-- 1. Memorized Words Bento Grid (5 Cards: Week, Month, Season, Year, Total) -->
        <section class="stats-section">
          <div class="stats-section-header">
            <h3 class="stats-section-title">WORDS MEMORIZED (ACTIVE SM-2 PROGRESSION)</h3>
          </div>
          <div class="stats-bento-grid memorized-bento-grid">
            <div class="bento-stat-card">
              <span class="bento-stat-label">THIS WEEK</span>
              <span class="bento-stat-val">${memCounts.week}</span>
              <span class="bento-stat-sub">ISO Mon – Sun</span>
            </div>
            <div class="bento-stat-card">
              <span class="bento-stat-label">THIS MONTH</span>
              <span class="bento-stat-val">${memCounts.month}</span>
              <span class="bento-stat-sub">Calendar Month</span>
            </div>
            <div class="bento-stat-card">
              <span class="bento-stat-label">THIS SEASON</span>
              <span class="bento-stat-val">${memCounts.season}</span>
              <span class="bento-stat-sub">90-Day Quarter</span>
            </div>
            <div class="bento-stat-card">
              <span class="bento-stat-label">THIS YEAR</span>
              <span class="bento-stat-val">${memCounts.year}</span>
              <span class="bento-stat-sub">Calendar Year</span>
            </div>
            <div class="bento-stat-card bento-stat-highlight">
              <span class="bento-stat-label">TOTAL MEMORIZED</span>
              <span class="bento-stat-val">${memCounts.total}</span>
              <span class="bento-stat-sub">All-time Mastered</span>
            </div>
          </div>
        </section>

        <!-- 2. App Usage Time Tracker (Daily, Weekly, Total Hours) -->
        <section class="stats-section">
          <div class="stats-section-header">
            <h3 class="stats-section-title">ACTIVE USAGE TIME (IDLE & TAB-VISIBILITY PROTECTED)</h3>
          </div>
          <div class="stats-bento-grid usage-time-bento-grid">
            <div class="bento-stat-card">
              <span class="bento-stat-label">DAILY ACTIVE</span>
              <span class="bento-stat-val">${timeStats.todayHours}</span>
              <span class="bento-stat-sub">${timeStats.today}</span>
            </div>
            <div class="bento-stat-card">
              <span class="bento-stat-label">WEEKLY ACTIVE</span>
              <span class="bento-stat-val">${timeStats.weekHours}</span>
              <span class="bento-stat-sub">${timeStats.week}</span>
            </div>
            <div class="bento-stat-card">
              <span class="bento-stat-label">TOTAL STUDY TIME</span>
              <span class="bento-stat-val">${timeStats.totalHours}</span>
              <span class="bento-stat-sub">${timeStats.total}</span>
            </div>
            <div class="bento-stat-card bento-stat-highlight">
              <span class="bento-stat-label">LEARNING SPEED</span>
              <span class="bento-stat-val">${wordsPerHour} w/h</span>
              <span class="bento-stat-sub">Words / Active Hour</span>
            </div>
          </div>
        </section>

        <!-- 3. Interactive Monochrome SVG Charts Grid -->
        <div class="stats-charts-grid">
          
          <!-- Chart 1: Memorized Words Timeline -->
          <div class="arl-card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">Chart 1: Words Memorized Timeline</h4>
              <div class="chart-toggles">
                <button class="chart-tab-btn ${this.timelineMode === 'week' ? 'active' : ''}" data-mode="week">Week</button>
                <button class="chart-tab-btn ${this.timelineMode === 'month' ? 'active' : ''}" data-mode="month">Month</button>
                <button class="chart-tab-btn ${this.timelineMode === 'season' ? 'active' : ''}" data-mode="season">Season</button>
                <button class="chart-tab-btn ${this.timelineMode === 'year' ? 'active' : ''}" data-mode="year">Year</button>
              </div>
            </div>
            <div class="chart-body">
              ${telemetry.renderChart1Timeline(this.timelineMode, state.cards, state.progressMap)}
            </div>
          </div>

          <!-- Chart 2: Time to Memorize 1 Word & Velocity Breakdown -->
          <div class="arl-card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">Chart 2: Learning Velocity (Avg Time / Word)</h4>
              <span class="velocity-overall-badge">Avg: ${velocity.overallAvg}</span>
            </div>
            <div class="chart-body">
              <div class="velocity-level-row">
                <div class="velocity-level-pill"><span class="lvl-tag">A1</span> ${velocity.avgByLevel.A1}</div>
                <div class="velocity-level-pill"><span class="lvl-tag">A2</span> ${velocity.avgByLevel.A2}</div>
                <div class="velocity-level-pill"><span class="lvl-tag">B1</span> ${velocity.avgByLevel.B1}</div>
                <div class="velocity-level-pill"><span class="lvl-tag">B2</span> ${velocity.avgByLevel.B2}</div>
              </div>
              <div class="velocity-word-lists">
                <div class="word-list-col">
                  <div class="word-list-header">⚡ Fastest Memorized Words</div>
                  ${velocity.fastest.length === 0 ? '<div class="text-dim text-sm">Study words to generate velocity data</div>' : velocity.fastest.map(w => `
                    <div class="velocity-word-item">
                      <span class="vword-name font-mono">${w.word}</span>
                      <span class="vword-time font-mono">${telemetry.formatMs(w.timeMs)}</span>
                    </div>
                  `).join('')}
                </div>
                <div class="word-list-col">
                  <div class="word-list-header">🔥 Hardest Words (Most Review Time)</div>
                  ${velocity.hardest.length === 0 ? '<div class="text-dim text-sm">Study words to generate velocity data</div>' : velocity.hardest.map(w => `
                    <div class="velocity-word-item">
                      <span class="vword-name font-mono">${w.word}</span>
                      <span class="vword-time font-mono">${telemetry.formatMs(w.timeMs)} (${w.attempts}x)</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Chart 3: Grammar Understanding Time & Mastery -->
          <div class="arl-card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">Chart 3: Grammar Mastery & Drill Understanding (80% Threshold)</h4>
            </div>
            <div class="chart-body">
              ${telemetry.renderChart3Grammar(this.grammarTopics)}
            </div>
          </div>

          <!-- Chart 4: Daily Study Time Distribution & Heatmap -->
          <div class="arl-card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">Chart 4: Daily Study Minutes & Module Distribution</h4>
            </div>
            <div class="chart-body">
              ${telemetry.renderChart4Distribution()}
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('.chart-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.setTimelineMode(btn.getAttribute('data-mode'));
      });
    });
  }
}
