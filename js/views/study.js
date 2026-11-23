/**
 * ARL - Centered Active Flashcard View (v2.2 Tactile & Monochrome Overhaul)
 * Tactile micro-interactions, circular SVG progress ring, 3D fluid card flips,
 * touch swipe gesture handling, high-contrast typography, and celebratory completion state.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { keyboard, KeyboardState } from '../keyboard.js';
import { gistSync } from '../sync.js';
import { telemetry } from '../telemetry.js';
import { sound } from '../sound.js';

export class StudyView {
  constructor(containerEl) {
    this.container = containerEl;
    this.swipeState = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false
    };
  }

  render() {
    const card = state.getCurrentCard();

    if (!card) {
      keyboard.setState(KeyboardState.STUDY_UNREVEALED);
      this.renderEmptyState();
      return;
    }

    if (state.isCardRevealed) {
      keyboard.setState(KeyboardState.STUDY_REVEALED);
      this.renderRevealedCard(card);
    } else {
      keyboard.setState(KeyboardState.STUDY_UNREVEALED);
      this.renderUnrevealedCard(card);
    }
  }

  renderEmptyState() {
    const stats = state.getQueueStats();
    const session = state.getSessionStats();
    const levelStats = state.getLevelStats();

    // Trigger auto-sync on session end if enabled
    gistSync.onSessionEnd();

    this.container.innerHTML = `
      <div class="study-card-wrapper">
        <div class="active-flashcard empty-flashcard batch-completion-banner">
          <div class="completion-icon-ring">✓</div>
          <div class="card-empty-title font-mono">[BATCH COMPLETE]</div>
          <div class="card-empty-desc">${t('session_empty_sub') || 'All scheduled cards in this batch have been reviewed!'}</div>

          <div class="empty-exp-summary">
            <div class="exp-summary-pill">
              <span class="exp-sum-icon">[EXP]</span>
              <span class="exp-sum-val">Level ${levelStats.level}</span>
              <span class="exp-sum-sep">·</span>
              <span class="exp-sum-val">${levelStats.totalExp} EXP</span>
            </div>
            ${session.reviewed > 0 ? `
              <div class="exp-session-sub font-mono">Session: ${session.reviewed} reviewed · ${session.streak} streak (${session.multiplier}x multiplier)</div>
            ` : ''}
          </div>

          <div class="card-keyhints-row thumb-dock" style="margin-top:16px;">
            <button class="keyhint-btn btn-primary-action touch-target" id="btn-load-new-batch" data-key=" " title="Keyboard: Space">
              <span class="micro-bracket">[Space]</span> ${t('btn_start_new')}
            </button>
            <button class="keyhint-btn touch-target" id="btn-review-memorized" data-key="r" title="Keyboard: R">
              <span class="micro-bracket">[R]</span> ${t('review_memorized')} (${stats.memorizedCount})
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-load-new-batch')?.addEventListener('click', () => {
      sound.playClick();
      state.buildStudyQueue();
      this.render();
    });
    const memBtn = this.container.querySelector('#btn-review-memorized');
    if (memBtn) {
      memBtn.addEventListener('click', () => {
        sound.playClick();
        state.toggleReviewMode();
        this.render();
      });
    }
  }

  renderUnrevealedCard(card) {
    const posTag = card.pos ? card.pos.toUpperCase() : 'VOCAB';
    const hint = state.getCurrentHint();
    const totalInBatch = state.studyQueue.length;
    const currentIdx = state.currentCardIndex + 1;
    const progressPct = totalInBatch > 0 ? Math.round(((currentIdx - 1) / totalInBatch) * 100) : 0;
    const session = state.getSessionStats();
    const levelStats = state.getLevelStats();

    // Circumference of r=14 circle is ~88
    const strokeDash = 88;
    const strokeOffset = strokeDash - (strokeDash * progressPct) / 100;

    // Highlight cloze blanks in prompt
    const promptText = (card.prompt_front || card.word).replace(
      /_____/g,
      '<span class="cloze-mask-box">_____</span>'
    );

    this.container.innerHTML = `
      <div class="study-card-wrapper study-landscape-split">
        <!-- Main Flashcard with Embedded Centered Progress Ring & Header -->
        <div class="active-flashcard unrevealed-flashcard" id="active-card-element" role="region" aria-label="Flashcard front">
          
          <!-- Centered On-Card Progress Header -->
          <div class="on-card-progress-container">
            <div class="card-progress-header-row">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="card-pos-badge">[${posTag}]</span>
                ${card.level ? `<span class="card-level-badge font-mono">[${card.level.toUpperCase()}]</span>` : ''}
              </div>

              <!-- Circular Monochrome Progress Ring & Pill -->
              <div style="display:flex;align-items:center;gap:8px;">
                <div class="progress-ring-wrapper" title="Card ${currentIdx} of ${totalInBatch}">
                  <svg class="progress-ring-svg" viewBox="0 0 36 36">
                    <circle class="ring-bg" cx="18" cy="18" r="14" fill="none" stroke-width="3"></circle>
                    <circle class="ring-progress" cx="18" cy="18" r="14" fill="none" stroke-width="3"
                      stroke-dashoffset="${strokeOffset}"></circle>
                  </svg>
                  <span class="progress-ring-text">${progressPct}%</span>
                </div>
                <div class="card-progress-pill" title="Card ${currentIdx} of ${totalInBatch}">
                  <span class="progress-pill-num">${currentIdx}</span>
                  <span class="progress-pill-sep">/</span>
                  <span class="progress-pill-total">${totalInBatch}</span>
                </div>
              </div>

              <span class="card-level-tag">Lv.${levelStats.level}</span>
            </div>
            
            <!-- Progress Fill along Card Header -->
            <div class="card-progress-track">
              <div class="card-progress-fill" style="width: ${progressPct}%" role="progressbar" aria-valuenow="${currentIdx}" aria-valuemin="1" aria-valuemax="${totalInBatch}"></div>
            </div>
          </div>

          <!-- Prompt Area (Left Panel in Landscape) -->
          <div class="card-prompt-area">
            <div class="card-prompt-display font-mono" id="card-prompt-text">${promptText}</div>

            <!-- Progressive 3-Stage Hint Box -->
            ${hint ? `
              <div class="card-progressive-hint-box" data-stage="${hint.stage}">
                <div class="hint-header">
                  <span class="hint-badge">${hint.badge}</span>
                  <span class="hint-stage-label">${hint.stageLabel}</span>
                </div>
                <div class="hint-body-text">${hint.text}</div>
              </div>
            ` : ''}
          </div>

          <!-- Action Controls (Right Panel in Landscape / Thumb Zone in Portrait) -->
          <div class="card-controls-panel">
            <!-- Telemetry & Streak Strip -->
            <div class="card-telemetry-strip">
              <span class="telemetry-item"><span class="telemetry-icon">⚡</span> ${session.streak} streak</span>
              <span class="telemetry-item">${session.avgSpeed}s avg</span>
            </div>

            <!-- Bottom Thumb Zone Touch Targets -->
            <div class="card-keyhints-row thumb-dock">
              <button class="keyhint-btn touch-target ${hint ? 'hint-active' : ''}" id="btn-hint" data-key="h" title="Keyboard: H">
                <span class="micro-bracket">[H]</span>
                <span class="keyhint-label">${t('hint')}</span>
              </button>
              <button class="keyhint-btn btn-primary-action touch-target" id="btn-reveal" data-key=" " title="Keyboard: Space">
                <span class="micro-bracket">[Space]</span>
                <span class="keyhint-label">${t('show_answer')}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // Click Handlers
    this.container.querySelector('#btn-reveal')?.addEventListener('click', () => state.revealCard());
    this.container.querySelector('#btn-hint')?.addEventListener('click', () => state.toggleHint());
    this.container.querySelector('#card-prompt-text')?.addEventListener('click', () => state.revealCard());

    // Attach touch & swipe gesture listener
    const cardEl = this.container.querySelector('#active-card-element');
    this.attachSwipeListeners(cardEl, false);
  }

  renderRevealedCard(card) {
    const posTag = card.pos ? card.pos.toUpperCase() : 'VOCAB';
    const totalInBatch = state.studyQueue.length;
    const currentIdx = state.currentCardIndex + 1;
    const progressPct = totalInBatch > 0 ? Math.round((currentIdx / totalInBatch) * 100) : 0;
    const session = state.getSessionStats();
    const levelStats = state.getLevelStats();

    const strokeDash = 88;
    const strokeOffset = strokeDash - (strokeDash * progressPct) / 100;

    // Formatting target word & tags with clean typographic separation
    let revealedTitle = card.revealed_back || card.display || card.word;
    if (state.targetLang === 'de' && card.pos === 'noun') {
      const art = card.article || '';
      const plur = card.plural ? ` <span class="target-plural font-mono" style="font-size:0.85em;color:var(--text-muted);">[Pl: ${card.plural}]</span>` : '';
      revealedTitle = `<span class="target-article article-${art}">${art}</span> <span class="target-word">${card.word}</span>${plur}`;
    }

    // Verb Conjugation Table Chips
    let verbChipHtml = '';
    if (state.targetLang === 'de' && card.pos === 'verb' && card.forms) {
      const parts = card.forms.split('|').map(s => s.trim());
      const inf = parts[0] || card.word;
      const praet = parts[1] || '—';
      const part2 = parts[2] || '—';
      const isIst = part2.includes('ist ');
      const aux = isIst ? 'ist' : 'hat';

      verbChipHtml = `
        <div class="card-verb-chip-grid">
          <div class="verb-chip">
            <span class="chip-label">INFINITIV</span>
            <span class="chip-val">${inf}</span>
          </div>
          <div class="verb-chip">
            <span class="chip-label">PRÄTERITUM</span>
            <span class="chip-val">${praet}</span>
          </div>
          <div class="verb-chip">
            <span class="chip-label">PARTIZIP II</span>
            <span class="chip-val">${part2.replace(/^(hat|ist)\s+/, '')}</span>
          </div>
          <div class="verb-chip">
            <span class="chip-label">HILFSVERB</span>
            <span class="chip-val ${isIst ? 'aux-ist' : 'aux-hat'} font-mono">${aux.toUpperCase()}</span>
          </div>
        </div>
      `;
    }

    // Example sentences
    const exampleTarget = state.targetLang === 'de' ? (card.example_de || '') : (card.example_en || '');
    const exampleTrans = card.example_mn || '';

    this.container.innerHTML = `
      <div class="study-card-wrapper study-landscape-split">
        <div class="active-flashcard revealed-flashcard" id="active-card-element" role="region" aria-label="Flashcard answer">
          
          <!-- Centered On-Card Progress Header -->
          <div class="on-card-progress-container">
            <div class="card-progress-header-row">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="card-pos-badge">[${posTag}]</span>
                ${card.level ? `<span class="card-level-badge font-mono">[${card.level.toUpperCase()}]</span>` : ''}
              </div>

              <!-- Circular Progress Ring & Pill -->
              <div style="display:flex;align-items:center;gap:8px;">
                <div class="progress-ring-wrapper" title="Card ${currentIdx} of ${totalInBatch}">
                  <svg class="progress-ring-svg" viewBox="0 0 36 36">
                    <circle class="ring-bg" cx="18" cy="18" r="14" fill="none" stroke-width="3"></circle>
                    <circle class="ring-progress" cx="18" cy="18" r="14" fill="none" stroke-width="3"
                      stroke-dashoffset="${strokeOffset}"></circle>
                  </svg>
                  <span class="progress-ring-text">${progressPct}%</span>
                </div>
                <div class="card-progress-pill" title="Card ${currentIdx} of ${totalInBatch}">
                  <span class="progress-pill-num">${currentIdx}</span>
                  <span class="progress-pill-sep">/</span>
                  <span class="progress-pill-total">${totalInBatch}</span>
                </div>
              </div>

              <span class="card-level-tag">Lv.${levelStats.level}</span>
            </div>
            
            <div class="card-progress-track">
              <div class="card-progress-fill" style="width: ${progressPct}%" role="progressbar" aria-valuenow="${currentIdx}" aria-valuemin="1" aria-valuemax="${totalInBatch}"></div>
            </div>
          </div>

          <!-- Revealed Answer Area (Left Panel in Landscape) -->
          <div class="card-revealed-area">
            <div class="card-revealed-title">${revealedTitle}</div>
            
            ${verbChipHtml}

            ${card.rektion ? `
              <div class="card-valency-row" style="margin-top:6px;">
                <span class="card-valency-badge font-mono">[${card.rektion}]</span>
              </div>
            ` : ''}

            <!-- High-Contrast Primary Mongolian Translation -->
            <div class="card-meaning-line" style="margin-top:10px;">
              <span class="meaning-mn" style="font-size:1.25rem;font-weight:700;">${card.mn}</span>
              ${card.en && state.targetLang === 'de' ? `<span class="meaning-sub">· ${card.en}</span>` : ''}
              ${card.de && state.targetLang === 'en' ? `<span class="meaning-sub">· ${card.de}</span>` : ''}
            </div>

            ${exampleTarget ? `
              <div class="card-example-box" style="margin-top:10px;">
                <div class="example-target font-mono" style="font-size:0.95rem;">${exampleTarget}</div>
                ${exampleTrans ? `<div class="example-trans" style="font-size:0.88rem;color:var(--text-muted);">${exampleTrans}</div>` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Action Controls & Ratings (Right Panel in Landscape / Thumb Zone in Portrait) -->
          <div class="card-controls-panel">
            <!-- Telemetry & Streak Strip -->
            <div class="card-telemetry-strip">
              <span class="telemetry-item"><span class="telemetry-icon">⚡</span> ${session.streak} streak</span>
              <span class="telemetry-item">${session.avgSpeed}s avg</span>
              <button class="keyhint-btn btn-mini-audio" id="btn-audio" data-key="a" title="Keyboard: A">
                <span class="micro-bracket">[A]</span> ${t('audio')}
              </button>
            </div>

            <!-- 1-4 Rating Buttons in Bottom Thumb Zone (min 48px touch target) -->
            <div class="card-keyhints-row card-rating-row thumb-dock">
              <button class="keyhint-btn rating-again touch-target" id="btn-grade-1" data-key="1" title="Keyboard: 1">
                <span class="micro-bracket">[1]</span>
                <span class="keyhint-label">${t('again')}</span>
              </button>
              <button class="keyhint-btn rating-hard touch-target" id="btn-grade-2" data-key="2" title="Keyboard: 2">
                <span class="micro-bracket">[2]</span>
                <span class="keyhint-label">${t('hard')}</span>
              </button>
              <button class="keyhint-btn rating-good touch-target" id="btn-grade-3" data-key="3" title="Keyboard: 3">
                <span class="micro-bracket">[3]</span>
                <span class="keyhint-label">${t('good')}</span>
              </button>
              <button class="keyhint-btn rating-easy touch-target" id="btn-grade-4" data-key="4" title="Keyboard: 4">
                <span class="micro-bracket">[4]</span>
                <span class="keyhint-label">${t('easy')}</span>
              </button>
            </div>

            <!-- Secondary Actions -->
            <div class="card-secondary-actions">
              <button class="btn-subtle-reset" id="btn-reset-card" data-key="R" title="Keyboard: Shift+R">
                <span class="micro-bracket">[Shift+R]</span> ${t('reset_card').replace(/\s*\[Shift\+R\]\s*/, '')}
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // Click Handlers
    this.container.querySelector('#btn-grade-1')?.addEventListener('click', () => { sound.playClick(); state.gradeCurrentCard(1); gistSync.scheduleAutoPush(); });
    this.container.querySelector('#btn-grade-2')?.addEventListener('click', () => { sound.playClick(); state.gradeCurrentCard(2); gistSync.scheduleAutoPush(); });
    this.container.querySelector('#btn-grade-3')?.addEventListener('click', () => { sound.playClick(); state.gradeCurrentCard(3); gistSync.scheduleAutoPush(); });
    this.container.querySelector('#btn-grade-4')?.addEventListener('click', () => { sound.playClick(); state.gradeCurrentCard(4); gistSync.scheduleAutoPush(); });
    this.container.querySelector('#btn-audio')?.addEventListener('click', () => state.playAudio());
    this.container.querySelector('#btn-reset-card')?.addEventListener('click', () => state.resetCurrentCard());

    // Attach touch & swipe gesture listener
    const cardEl = this.container.querySelector('#active-card-element');
    this.attachSwipeListeners(cardEl, true);
  }

  /**
   * Fluid Touch & Swipe Micro-Interactions on Flashcard
   */
  attachSwipeListeners(cardEl, isRevealed) {
    if (!cardEl) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isTouching = false;

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      isTouching = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = 0;
      cardEl.style.transition = 'none';
    };

    const onTouchMove = (e) => {
      if (!isTouching) return;
      currentX = e.touches[0].clientX - startX;
      const currentY = e.touches[0].clientY - startY;

      // Only handle primarily horizontal swipes
      if (Math.abs(currentX) > Math.abs(currentY) && Math.abs(currentX) > 10) {
        const rotate = currentX * 0.05;
        const opacity = Math.max(0.65, 1 - Math.abs(currentX) / 600);
        cardEl.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
        cardEl.style.opacity = opacity;
      }
    };

    const onTouchEnd = (e) => {
      if (!isTouching) return;
      isTouching = false;
      cardEl.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';

      if (isRevealed) {
        if (currentX > 80) {
          // Swiped right -> Good
          sound.playClick();
          state.gradeCurrentCard(3);
          gistSync.scheduleAutoPush();
        } else if (currentX < -80) {
          // Swiped left -> Again
          sound.playClick();
          state.gradeCurrentCard(1);
          gistSync.scheduleAutoPush();
        } else {
          cardEl.style.transform = '';
          cardEl.style.opacity = '1';
        }
      } else {
        if (Math.abs(currentX) > 60 || (startY - (e.changedTouches[0]?.clientY || startY) > 50)) {
          // Swipe or upward flick reveals card
          sound.playClick();
          state.revealCard();
        } else {
          cardEl.style.transform = '';
          cardEl.style.opacity = '1';
        }
      }
    };

    cardEl.addEventListener('touchstart', onTouchStart, { passive: true });
    cardEl.addEventListener('touchmove', onTouchMove, { passive: true });
    cardEl.addEventListener('touchend', onTouchEnd, { passive: true });
  }
}
