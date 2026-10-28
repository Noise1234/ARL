/**
 * ARL - Interactive Active Recall Quiz Engine & View
 * Fast 4-option multiple-choice drilling with [1-4] keyboard bindings,
 * instant tactile feedback, and Dopamine EXP rewards.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { sound } from '../sound.js';
import { keyboard, KeyboardState } from '../keyboard.js';

export class QuizView {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.queue = [];
    this.currentIndex = 0;
    this.currentQuestion = null;
    this.isAnswerLocked = false;
    this.correctCount = 0;
    this.totalExpEarned = 0;
    this.batchSize = 10;
    this.quizCompleted = false;
    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  start(count = 10) {
    this.batchSize = count;
    this.correctCount = 0;
    this.totalExpEarned = 0;
    this.quizCompleted = false;
    this.isAnswerLocked = false;

    // Pick cards from current level
    const pool = [...state.cards];
    if (pool.length === 0) {
      this.renderEmpty();
      return;
    }

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    this.queue = pool.slice(0, Math.min(count, pool.length));
    this.currentIndex = 0;

    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundKeyHandler);
      window.addEventListener('keydown', this.boundKeyHandler);
    }

    this.nextQuestion();
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundKeyHandler);
    }
  }

  handleKeyDown(e) {
    if (this.quizCompleted || this.isAnswerLocked || !this.currentQuestion) return;

    const key = e.key;
    if (['1', '2', '3', '4'].includes(key)) {
      e.preventDefault();
      const idx = parseInt(key, 10) - 1;
      this.selectOption(idx);
    }
  }

  nextQuestion() {
    if (this.currentIndex >= this.queue.length) {
      this.renderSummary();
      return;
    }

    this.isAnswerLocked = false;
    const targetCard = this.queue[this.currentIndex];

    // Get 3 distractors
    const distractors = state.getRandomDistractors(targetCard, 3);
    const options = [targetCard, ...distractors];

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options.findIndex(opt => opt && opt.id === targetCard.id);

    this.currentQuestion = {
      targetCard,
      options,
      correctIndex
    };

    this.renderQuestion();
  }

  async selectOption(selectedIndex) {
    if (this.isAnswerLocked || !this.currentQuestion) return;
    this.isAnswerLocked = true;

    const { targetCard, correctIndex } = this.currentQuestion;
    const isCorrect = selectedIndex === correctIndex;

    if (isCorrect) {
      this.correctCount++;
      this.totalExpEarned += 25;
      sound.playSuccess();
    } else {
      sound.playRetry();
    }

    // Update buttons UI
    const optionBtns = this.container.querySelectorAll('.quiz-opt-btn');
    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    // Record spaced repetition progress in state
    await state.recordQuizResult(targetCard.id, isCorrect);

    // Auto advance after tactile delay
    setTimeout(() => {
      this.currentIndex++;
      this.nextQuestion();
    }, isCorrect ? 750 : 1300);
  }

  renderQuestion() {
    if (!this.currentQuestion) return;
    const { targetCard, options } = this.currentQuestion;
    const currentNum = this.currentIndex + 1;
    const totalNum = this.queue.length;
    const progressPct = Math.round(((currentNum - 1) / totalNum) * 100);
    const tag = `[${state.targetLang.toUpperCase()}·${state.cefrLevel.toUpperCase()}]`;

    // Prompt is the Mongolian definition + example
    const promptText = targetCard.mn || targetCard.word;
    const promptExample = targetCard.example_mn ? `"${targetCard.example_mn}"` : '';

    this.container.innerHTML = `
      <div class="quiz-container">
        <!-- Quiz Header Bar -->
        <div class="quiz-top-bar">
          <div class="quiz-badge-info">
            <span class="hud-tag">${tag}</span>
            <span class="quiz-mode-title">${t('quiz_title')}</span>
          </div>
          <div class="quiz-progress-indicator">
            <span class="quiz-counter-text">${currentNum} / ${totalNum}</span>
            <div class="quiz-progress-track">
              <div class="quiz-progress-fill" style="width: ${progressPct}%"></div>
            </div>
          </div>
          <button class="quiz-close-btn touch-target" id="btn-quiz-exit" title="Exit Quiz [Esc]">✕</button>
        </div>

        <!-- Question Prompt Card -->
        <div class="quiz-prompt-card">
          <div class="quiz-prompt-label">Select correct ${state.targetLang === 'de' ? 'German' : 'English'} equivalent:</div>
          <div class="quiz-prompt-target">${promptText}</div>
          ${promptExample ? `<div class="quiz-prompt-sub">${promptExample}</div>` : ''}
        </div>

        <!-- 4 Options Grid -->
        <div class="quiz-options-grid">
          ${options.map((opt, idx) => {
            const numKey = idx + 1;
            let displayLabel = opt.display || opt.word;
            if (opt.pos === 'noun' && opt.article) {
              displayLabel = `${opt.article} ${opt.word}${opt.plural ? ` (${opt.plural})` : ''}`;
            }

            let badgeHtml = '';
            if (opt.pos === 'noun' && opt.article) {
              badgeHtml = `<span class="pos-chip chip-${opt.article}">[${opt.article}]</span>`;
            } else if (opt.pos === 'verb') {
              badgeHtml = `<span class="pos-chip chip-verb">[verb]</span>`;
            }

            return `
              <button class="quiz-opt-btn touch-target" data-index="${idx}" data-key="${numKey}">
                <div class="opt-keycap">[${numKey}]</div>
                <div class="opt-content">
                  <span class="opt-label">${displayLabel}</span>
                  ${badgeHtml}
                </div>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Bottom Keyboard Reference -->
        <div class="quiz-bottom-hint">
          <span>Tap an option or press <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> on your keyboard</span>
        </div>
      </div>
    `;

    // Bind Option clicks
    this.container.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        this.selectOption(idx);
      });
    });

    // Bind Exit
    this.container.querySelector('#btn-quiz-exit')?.addEventListener('click', () => {
      this.destroy();
      if (this.onNavigate) this.onNavigate('vocab');
    });
  }

  renderSummary() {
    this.quizCompleted = true;
    this.destroy();

    const total = this.queue.length;
    const accuracy = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;
    const session = state.getSessionStats();

    this.container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-summary-card">
          <div class="summary-check-icon">✓</div>
          <h2 class="summary-heading">Quiz Complete!</h2>
          <p class="summary-subheading">Active recall convergence session mastered.</p>

          <div class="summary-metric-grid">
            <div class="summary-metric-pill">
              <span class="metric-val">${this.correctCount} / ${total}</span>
              <span class="metric-label">Correct</span>
            </div>
            <div class="summary-metric-pill highlight-pill">
              <span class="metric-val">${accuracy}%</span>
              <span class="metric-label">Accuracy</span>
            </div>
            <div class="summary-metric-pill">
              <span class="metric-val">+${this.totalExpEarned}</span>
              <span class="metric-label">EXP Earned</span>
            </div>
            <div class="summary-metric-pill">
              <span class="metric-val">⚡ ${session.streak}</span>
              <span class="metric-label">Streak</span>
            </div>
          </div>

          <div class="summary-actions-row">
            <button class="keyhint-btn keyhint-primary touch-target" id="btn-quiz-restart">
              <span class="micro-bracket">[Space]</span> Take Another Quiz
            </button>
            <button class="keyhint-btn touch-target" id="btn-quiz-study-cards">
              <span class="micro-bracket">[V]</span> Back to Study Cards
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-quiz-restart')?.addEventListener('click', () => {
      this.start(this.batchSize);
    });

    this.container.querySelector('#btn-quiz-study-cards')?.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('vocab');
    });
  }

  renderEmpty() {
    this.container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-summary-card">
          <h2 class="summary-heading">No Vocabulary Found</h2>
          <p class="summary-subheading">Select a level with vocabulary cards or add custom words.</p>
          <button class="keyhint-btn keyhint-primary touch-target" id="btn-quiz-to-vocab">Back to Vocab</button>
        </div>
      </div>
    `;
    this.container.querySelector('#btn-quiz-to-vocab')?.addEventListener('click', () => {
      if (this.onNavigate) this.onNavigate('vocab');
    });
  }

  render() {
    if (!this.quizCompleted && this.currentQuestion) {
      this.renderQuestion();
    } else if (this.quizCompleted) {
      this.renderSummary();
    } else {
      this.start(10);
    }
  }
}
