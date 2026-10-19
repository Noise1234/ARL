import { state } from './state.js';

export class FlashcardDeck {
  constructor(containerEl, onCompleteCallback) {
    this.container = containerEl;
    this.onComplete = onCompleteCallback;
    this.batch = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.batchResults = []; // [{ word, status: 'memorized' | 'learning' }]

    // Touch gesture tracking
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.isDragging = false;

    this.boundKeyHandler = this.handleKeyDown.bind(this);
  }

  start(wordsBatch) {
    this.batch = wordsBatch;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.batchResults = [];

    window.addEventListener('keydown', this.boundKeyHandler);
    this.render();
  }

  destroy() {
    window.removeEventListener('keydown', this.boundKeyHandler);
  }

  handleKeyDown(e) {
    // Only handle if active in DOM
    if (!this.container.isConnected || this.batch.length === 0) return;

    if (e.code === 'Space') {
      e.preventDefault();
      this.flipCard();
    } else if (e.key === '1' || e.code === 'ArrowLeft') {
      e.preventDefault();
      this.answerCard('learning');
    } else if (e.key === '2' || e.code === 'ArrowRight') {
      e.preventDefault();
      this.answerCard('memorized');
    }
  }

  flipCard() {
    const cardInner = this.container.querySelector('.flashcard-inner');
    if (!cardInner) return;
    this.isFlipped = !this.isFlipped;
    cardInner.classList.toggle('flipped', this.isFlipped);
  }

  async answerCard(status) {
    if (this.currentIndex >= this.batch.length) return;

    const currentWord = this.batch[this.currentIndex];
    this.batchResults.push({ word: currentWord, status });

    // Animate card exit
    const cardEl = this.container.querySelector('.flashcard-card');
    if (cardEl) {
      const exitClass = status === 'memorized' ? 'swipe-right' : 'swipe-left';
      cardEl.classList.add(exitClass);
      await new Promise(r => setTimeout(r, 220));
    }

    // Persist in state & DB
    await state.setWordStatus(currentWord.id, status);

    this.currentIndex++;
    this.isFlipped = false;

    if (this.currentIndex >= this.batch.length) {
      this.renderSummary();
    } else {
      this.render();
    }
  }

  render() {
    const currentWord = this.batch[this.currentIndex];
    const total = this.batch.length;
    const progressPercent = Math.round((this.currentIndex / total) * 100);

    // Format German front
    let deMain = currentWord.word;
    let deDetail = '';
    if (currentWord.pos === 'noun') {
      const art = currentWord.article ? `<span class="article-badge ${currentWord.article}">${currentWord.article}</span> ` : '';
      const plur = currentWord.plural ? ` <span class="plural-hint">(${currentWord.plural})</span>` : '';
      deMain = `${art}${currentWord.word}${plur}`;
    }

    const posBadge = `<span class="pos-badge">${currentWord.pos.toUpperCase()}</span>`;
    const topicBadge = `<span class="topic-badge">${currentWord.topic || 'B1'}</span>`;

    this.container.innerHTML = `
      <div class="deck-wrapper">
        <!-- Progress Header -->
        <div class="deck-header">
          <div class="deck-counter">${this.currentIndex + 1} / ${total}</div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <button class="btn-icon close-deck-btn" title="Beenden">✕</button>
        </div>

        <!-- 3D Flashcard Container -->
        <div class="flashcard-scene">
          <div class="flashcard-card ${this.isFlipped ? 'flipped' : ''}">
            <div class="flashcard-inner">
              
              <!-- FRONT (DEUTSCH) -->
              <div class="flashcard-face flashcard-front">
                <div class="card-meta">
                  ${posBadge}
                  ${topicBadge}
                </div>

                <div class="card-center">
                  <div class="card-word-de">${deMain}</div>
                  ${currentWord.example_de ? `
                    <div class="card-example-box">
                      <div class="example-de">„${currentWord.example_de}“</div>
                    </div>
                  ` : ''}
                </div>

                <div class="card-footer-hint">
                  <span class="hint-text">Tippen oder <kbd>Space</kbd> zum Umdrehen</span>
                </div>
              </div>

              <!-- BACK (MONGOLISCH) -->
              <div class="flashcard-face flashcard-back">
                <div class="card-meta">
                  <span class="lang-badge">Монгол</span>
                  ${topicBadge}
                </div>

                <div class="card-center">
                  <div class="card-word-mn">${currentWord.mn}</div>
                  ${currentWord.example_mn ? `
                    <div class="card-example-box">
                      <div class="example-mn">„${currentWord.example_mn}“</div>
                      <div class="example-de-sub">${currentWord.example_de}</div>
                    </div>
                  ` : ''}
                </div>

                <div class="card-footer-hint">
                  <span class="hint-text">Wähle deinen Lernstatus</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="deck-controls">
          <button class="btn-action btn-learning" id="btn-learning">
            <span class="btn-icon-sub">↺</span>
            <span class="btn-label">Noch lernen</span>
            <kbd class="key-hint">1 / ←</kbd>
          </button>

          <button class="btn-action btn-flip" id="btn-flip">
            <span>Umdrehen</span>
            <kbd class="key-hint">Space</kbd>
          </button>

          <button class="btn-action btn-memorized" id="btn-memorized">
            <span class="btn-icon-sub">✓</span>
            <span class="btn-label">Gemerkt</span>
            <kbd class="key-hint">2 / →</kbd>
          </button>
        </div>
      </div>
    `;

    // Attach event listeners
    const cardEl = this.container.querySelector('.flashcard-scene');
    cardEl.addEventListener('click', (e) => {
      // Don't flip if user clicked something else
      this.flipCard();
    });

    this.container.querySelector('#btn-flip').addEventListener('click', (e) => {
      e.stopPropagation();
      this.flipCard();
    });

    this.container.querySelector('#btn-learning').addEventListener('click', (e) => {
      e.stopPropagation();
      this.answerCard('learning');
    });

    this.container.querySelector('#btn-memorized').addEventListener('click', (e) => {
      e.stopPropagation();
      this.answerCard('memorized');
    });

    this.container.querySelector('.close-deck-btn').addEventListener('click', () => {
      this.destroy();
      if (this.onComplete) this.onComplete(this.batchResults, false);
    });

    // Touch & Swipe setup
    this.setupSwipe(this.container.querySelector('.flashcard-card'));
  }

  setupSwipe(cardEl) {
    if (!cardEl) return;

    let startX = 0;
    let currentX = 0;
    let isTouching = false;

    const onTouchStart = (e) => {
      isTouching = true;
      startX = e.touches[0].clientX;
      cardEl.style.transition = 'none';
    };

    const onTouchMove = (e) => {
      if (!isTouching) return;
      currentX = e.touches[0].clientX - startX;
      const rotate = currentX * 0.08;
      const opacity = Math.max(0.6, 1 - Math.abs(currentX) / 400);
      cardEl.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
      cardEl.style.opacity = opacity;
    };

    const onTouchEnd = (e) => {
      if (!isTouching) return;
      isTouching = false;
      cardEl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

      if (currentX > 90) {
        // Swiped right -> Memorized
        this.answerCard('memorized');
      } else if (currentX < -90) {
        // Swiped left -> Still Learning
        this.answerCard('learning');
      } else {
        // Reset position
        cardEl.style.transform = '';
        cardEl.style.opacity = '1';
      }
    };

    cardEl.addEventListener('touchstart', onTouchStart, { passive: true });
    cardEl.addEventListener('touchmove', onTouchMove, { passive: true });
    cardEl.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  renderSummary() {
    this.destroy();
    const memorizedCount = this.batchResults.filter(r => r.status === 'memorized').length;
    const learningCount = this.batchResults.length - memorizedCount;

    this.container.innerHTML = `
      <div class="batch-summary-card">
        <div class="summary-icon">✦</div>
        <h2 class="summary-title">Lernrunde abgeschlossen</h2>
        <p class="summary-subtitle">${this.batch.length} Vokabeln bearbeitet</p>

        <div class="summary-stats-row">
          <div class="stat-pill pill-memorized">
            <span class="stat-num">${memorizedCount}</span>
            <span class="stat-text">Gemerkt</span>
          </div>
          <div class="stat-pill pill-learning">
            <span class="stat-num">${learningCount}</span>
            <span class="stat-text">Wiederholen</span>
          </div>
        </div>

        <div class="summary-prompt-box">
          <div class="prompt-title">Reverse-Prüfung empfohlen</div>
          <div class="prompt-desc">Teste diese ${this.batch.length} neuen Wörter jetzt in Gegenrichtung (Mongolisch → Deutsch) im 4-Optionen-Examen.</div>
        </div>

        <div class="summary-actions">
          <button class="btn btn-primary btn-launch-exam" id="btn-launch-exam">
            <span>⚡ Jetzt Reverse-Examen starten</span>
          </button>
          <button class="btn btn-secondary btn-return-home" id="btn-return-home">
            <span>Zur Übersicht</span>
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-launch-exam').addEventListener('click', () => {
      if (this.onComplete) this.onComplete(this.batchResults, true); // true = launch exam
    });

    this.container.querySelector('#btn-return-home').addEventListener('click', () => {
      if (this.onComplete) this.onComplete(this.batchResults, false);
    });
  }
}
