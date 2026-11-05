/**
 * ARL - Telemetry & Visual Analytics Dashboard View ([📊 Stats])
 * Renders the 4-timeframe Memorized Counter Grid, Active Study Time Breakdown,
 * and 4 interactive SVG charts (Timeline, Word Velocity, Grammar Mastery, Study Distribution).
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

    this.container.innerHTML = `
      <div class="stats-dashboard-container">
        
        <!-- Dashboard Header -->
        <div class="stats-header-bar">
          <div>
            <h2 class="stats-title">[📊 Stats] Telemetry & Visual Analytics</h2>
            <div class="stats-subtitle">Real-time learning velocity, retention telemetry, and active study tracking</div>
          </div>
          <div class="stats-top-badge">
            <span class="session-timer-badge">${telemetry.formatSessionTime()} active</span>
          </div>
        </div>

        <!-- 1. Memorized Words Counter Grid (4 Timeframes) -->
        <section class="stats-section">
          <div class="stats-section-header">
            <h3 class="stats-section-title">WORDS MEMORIZED (ACTIVE SM-2 RETENTION)</h3>
          </div>
          <div class="memorized-grid-4">
            <div class="mem-stat-card">
              <span class="mem-stat-label">THIS WEEK</span>
              <span class="mem-stat-val text-blue">${memCounts.week}</span>
              <span class="mem-stat-sub">Mon – Sun</span>
            </div>
            <div class="mem-stat-card">
              <span class="mem-stat-label">THIS MONTH</span>
              <span class="mem-stat-val text-emerald">${memCounts.month}</span>
              <span class="mem-stat-sub">Calendar Month</span>
            </div>
            <div class="mem-stat-card">
              <span class="mem-stat-label">THIS SEASON</span>
              <span class="mem-stat-val text-amber">${memCounts.season}</span>
              <span class="mem-stat-sub">3-Month Quarter</span>
            </div>
            <div class="mem-stat-card">
              <span class="mem-stat-label">THIS YEAR</span>
              <span class="mem-stat-val text-purple">${memCounts.year}</span>
              <span class="mem-stat-sub">Calendar Year (${memCounts.total} Total)</span>
            </div>
          </div>
        </section>

        <!-- 2. Active Study Time Breakdown -->
        <section class="stats-section">
          <div class="stats-section-header">
            <h3 class="stats-section-title">ACTIVE STUDY TIME (IDLE PROTECTED)</h3>
          </div>
          <div class="time-stats-grid">
            <div class="time-stat-pill">
              <span class="time-label">Today:</span>
              <strong class="time-val">${timeStats.today}</strong>
            </div>
            <div class="time-stat-pill">
              <span class="time-label">This Week:</span>
              <strong class="time-val">${timeStats.week}</strong>
            </div>
            <div class="time-stat-pill">
              <span class="time-label">This Month:</span>
              <strong class="time-val">${timeStats.month}</strong>
            </div>
            <div class="time-stat-pill">
              <span class="time-label">This Season:</span>
              <strong class="time-val">${timeStats.season}</strong>
            </div>
            <div class="time-stat-pill">
              <span class="time-label">This Year:</span>
              <strong class="time-val">${timeStats.year}</strong>
            </div>
          </div>
        </section>

        <!-- 3. Interactive Charts Grid -->
        <div class="stats-charts-grid">
          
          <!-- Chart 1: Memorized Words Timeline -->
          <div class="arl-card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">Chart 1: Memorized Words Timeline</h4>
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
              <h4 class="chart-title">Chart 2: Learning Velocity (Time to Memorize 1 Word)</h4>
              <span class="velocity-overall-badge">Avg: ${velocity.overallAvg} / word</span>
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
                  <div class="word-list-header text-emerald">⚡ Fastest Memorized Words</div>
                  ${velocity.fastest.length === 0 ? '<div class="text-dim text-sm">Study words to generate velocity data</div>' : velocity.fastest.map(w => `
                    <div class="velocity-word-item">
                      <span class="vword-name">${w.word}</span>
                      <span class="vword-time">${telemetry.formatMs(w.timeMs)}</span>
                    </div>
                  `).join('')}
                </div>
                <div class="word-list-col">
                  <div class="word-list-header text-amber">🔥 Hardest Words (Most Time Spent)</div>
                  ${velocity.hardest.length === 0 ? '<div class="text-dim text-sm">Study words to generate velocity data</div>' : velocity.hardest.map(w => `
                    <div class="velocity-word-item">
                      <span class="vword-name">${w.word}</span>
                      <span class="vword-time">${telemetry.formatMs(w.timeMs)} (${w.attempts}x)</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Chart 3: Grammar Understanding Time & Mastery -->
          <div class="arl-card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">Chart 3: Grammar Understanding Time & Mastery (80% Drill Threshold)</h4>
            </div>
            <div class="chart-body">
              ${telemetry.renderChart3Grammar(this.grammarTopics)}
            </div>
          </div>

          <!-- Chart 4: Daily Study Time Distribution & Heatmap -->
          <div class="arl-card chart-card">
            <div class="chart-header">
              <h4 class="chart-title">Chart 4: Daily Study Minutes & Activity Distribution</h4>
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
