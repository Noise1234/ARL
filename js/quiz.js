import { state } from './state.js';

export class QuizEngine {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.onFinish = options.onFinish || null;
    this.title = options.title || 'Reverse-Examen';
    this.subtitle = options.subtitle || 'Mongolisch → Deutsch (Active Recall)';
    this.isRetentionGate = options.isRetentionGate || false;

    this.queue = [];
    this.currentQuestion = null;
    this.totalInitialCount = 0;
    this.completedCount = 0;
    this.firstTryCorrect = 0;
    this.isAnswerLocked = false;

    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  start(wordsList) {
    if (!wordsList || wordsList.length === 0) {
      if (this.onFinish) this.onFinish({ completed: 0, firstTryCorrect: 0 });
      return;
    }

    // Initialize test queue
    this.queue = wordsList.map(w => ({
      word: w,
      attempts: 0,
      passed: false
    }));

    this.totalInitialCount = this.queue.length;
    this.completedCount = 0;
    this.firstTryCorrect = 0;

    window.addEventListener('keydown', this.boundKeyHandler);
    this.nextQuestion();
  }

  destroy() {
    window.removeEventListener('keydown', this.boundKeyHandler);
  }

  handleKeyDown(e) {
    if (!this.container.isConnected || this.isAnswerLocked || !this.currentQuestion) return;

    const key = e.key;
    if (['1', '2', '3', '4'].includes(key)) {
      e.preventDefault();
      const idx = parseInt(key, 10) - 1;
      this.selectOption(idx);
    }
  }

  nextQuestion() {
    // Find next unpassed question in queue
    const nextItem = this.queue.find(q => !q.passed);
    if (!nextItem) {
      this.renderCompletion();
      return;
    }

    this.isAnswerLocked = false;
    const targetWord = nextItem.word;

    // Get 3 smart distractors from the B1 pool
    const distractors = state.getRandomDistractors(targetWord, 3);
    const options = [targetWord, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = options.findIndex(opt => opt.id === targetWord.id);

    this.currentQuestion = {
      queueItem: nextItem,
      targetWord,
      options,
      correctIndex
    };

    this.renderQuestion();
  }

  async selectOption(selectedIndex) {
    if (this.isAnswerLocked || !this.currentQuestion) return;
    this.isAnswerLocked = true;

    const { queueItem, targetWord, options, correctIndex } = this.currentQuestion;
    const isCorrect = selectedIndex === correctIndex;
    queueItem.attempts++;

    // Mark feedback on UI
    const optionButtons = this.container.querySelectorAll('.quiz-option-btn');
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      queueItem.passed = true;
      this.completedCount++;
      if (queueItem.attempts === 1) {
        this.firstTryCorrect++;
      }
      // Upgrade word progress
      await state.setWordStatus(targetWord.id, 'memorized');
    } else {
      // Re-queue to end
      const itemToMove = queueItem;
      const curIdx = this.queue.indexOf(itemToMove);
      if (curIdx > -1) {
        this.queue.splice(curIdx, 1);
        this.queue.push(itemToMove);
      }
      // Mark as still learning
      await state.setWordStatus(targetWord.id, 'learning');
    }

    // Short tactile delay before next question
    setTimeout(() => {
      this.nextQuestion();
    }, isCorrect ? 700 : 1300);
  }

  renderQuestion() {
    const { targetWord, options } = this.currentQuestion;
    const progressPercent = Math.round((this.completedCount / this.totalInitialCount) * 100);

    this.container.innerHTML = `
      <div class="quiz-wrapper">
        <!-- Header -->
        <div class="quiz-header">
          <div class="quiz-meta-info">
            <span class="quiz-title-badge">${this.title}</span>
            <span class="quiz-counter">${this.completedCount} / ${this.totalInitialCount} gemeistert</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <button class="btn-icon close-quiz-btn" title="Schließen">✕</button>
        </div>

        <!-- Question Card -->
        <div class="quiz-card">
          <div class="question-label">Was bedeutet dieses mongolische Wort auf Deutsch?</div>
          <div class="question-prompt-mn">${targetWord.mn}</div>
          ${targetWord.example_mn ? `
            <div class="question-example-mn">„${targetWord.example_mn}“</div>
          ` : ''}
        </div>

        <!-- 4 Options Grid -->
        <div class="quiz-options-grid">
          ${options.map((opt, idx) => {
            const numKey = idx + 1;
            let displayLabel = opt.display || opt.word;
            if (opt.pos === 'noun' && opt.article) {
              displayLabel = `${opt.article} ${opt.word}${opt.plural ? ` (${opt.plural})` : ''}`;
            }

            return `
              <button class="quiz-option-btn" data-index="${idx}">
                <span class="option-key">${numKey}</span>
                <span class="option-text">${displayLabel}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Keyboard Hint Footer -->
        <div class="quiz-footer-hint">
          Tippe auf eine Option oder nutze die Zifferntasten <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>
        </div>
      </div>
    `;

    // Event listeners
    this.container.querySelectorAll('.quiz-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        this.selectOption(idx);
      });
    });

    this.container.querySelector('.close-quiz-btn').addEventListener('click', () => {
      this.destroy();
      if (this.onFinish) this.onFinish({ completed: this.completedCount, firstTryCorrect: this.firstTryCorrect });
    });
  }

  async renderCompletion() {
    this.destroy();
    // Record activity and increment streak upon exam/retention check completion!
    await state.recordActivity();
    if (this.isRetentionGate) {
      await state.markRetentionCheckPassed();
    }

    const accuracy = Math.round((this.firstTryCorrect / this.totalInitialCount) * 100);

    this.container.innerHTML = `
      <div class="batch-summary-card">
        <div class="summary-icon success-icon">✓</div>
        <h2 class="summary-title">${this.isRetentionGate ? 'Tages-Retention bestanden!' : 'Examen erfolgreich gemeistert!'}</h2>
        <p class="summary-subtitle">Alle ${this.totalInitialCount} Vokabeln fehlerfrei konvergiert.</p>

        <div class="summary-stats-row">
          <div class="stat-pill pill-memorized">
            <span class="stat-num">${accuracy}%</span>
            <span class="stat-text">Präzision (1. Versuch)</span>
          </div>
          <div class="stat-pill pill-streak">
            <span class="stat-num">⚡ ${state.stats.streak}</span>
            <span class="stat-text">Tage Streak</span>
          </div>
        </div>

        <p class="summary-streak-msg">
          ${this.isRetentionGate 
            ? 'Hervorragend! Dein Langzeitgedächtnis ist aktiviert. Du kannst nun neue Vokabeln lernen.' 
            : 'Dein aktives Erinnerungsvermögen wurde gefestigt. Dein Streak wurde aktualisiert!'}
        </p>

        <div class="summary-actions">
          <button class="btn btn-primary btn-finish-quiz" id="btn-finish-quiz">
            <span>Weiter zur Übersicht</span>
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-finish-quiz').addEventListener('click', () => {
      if (this.onFinish) {
        this.onFinish({ completed: this.completedCount, firstTryCorrect: this.firstTryCorrect });
      }
    });
  }
}
