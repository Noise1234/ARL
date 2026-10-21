/**
 * ARL - Centered Active Flashcard View
 * Centered on-card progress meter, 3-stage progressive hints,
 * mobile-first bottom thumb-zone ergonomics, and responsive landscape split-view.
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { keyboard, KeyboardState } from '../keyboard.js';

export class StudyView {
  constructor(containerEl) {
    this.container = containerEl;
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

    this.container.innerHTML = `
      <div class="study-card-wrapper">
        <div class="active-flashcard empty-flashcard">
          <div class="empty-state-icon">✓</div>
          <div class="card-empty-title">${t('session_empty')}</div>
          <div class="card-empty-desc">${t('session_empty_sub')}</div>

          <div class="empty-exp-summary">
            <div class="exp-summary-pill">
              <span class="exp-sum-icon">⚡</span>
              <span class="exp-sum-val">Level ${levelStats.level}</span>
              <span class="exp-sum-sep">·</span>
              <span class="exp-sum-val">${levelStats.totalExp} EXP</span>
            </div>
            ${session.reviewed > 0 ? `
              <div class="exp-session-sub">Session: ${session.reviewed} reviewed · ${session.streak} streak (${session.multiplier}x multiplier)</div>
            ` : ''}
          </div>

          <div class="card-keyhints-row thumb-dock">
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
      state.buildStudyQueue();
      this.render();
    });
    const memBtn = this.container.querySelector('#btn-review-memorized');
    if (memBtn) {
      memBtn.addEventListener('click', () => {
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

    // Highlight cloze blanks in prompt
    const promptText = (card.prompt_front || card.word).replace(
      /_____/g,
      '<span class="cloze-mask-box">_____</span>'
    );

    this.container.innerHTML = `
      <div class="study-card-wrapper study-landscape-split">
        <!-- Main Flashcard with Embedded Centered Progress Meter -->
        <div class="active-flashcard unrevealed-flashcard" id="active-card-element">
          
          <!-- Centered On-Card Progress Meter Header -->
          <div class="on-card-progress-container">
            <div class="card-progress-header-row">
              <span class="card-pos-badge">[${posTag}]</span>
              <div class="card-progress-pill" title="Card ${currentIdx} of ${totalInBatch}">
                <span class="progress-pill-num">${currentIdx}</span>
                <span class="progress-pill-sep">/</span>
                <span class="progress-pill-total">${totalInBatch}</span>
              </div>
              <span class="card-level-tag">Lv.${levelStats.level}</span>
            </div>
            <!-- Integrated Smooth Progress Fill along Card Header -->
            <div class="card-progress-track">
              <div class="card-progress-fill" style="width: ${progressPct}%" role="progressbar" aria-valuenow="${currentIdx}" aria-valuemin="1" aria-valuemax="${totalInBatch}"></div>
            </div>
          </div>

          <!-- Prompt Area (Left Panel in Landscape) -->
          <div class="card-prompt-area">
            <div class="card-prompt-text">${promptText}</div>
            
            <!-- Progressive 3-Stage Hint Display -->
            ${hint ? `
              <div class="card-progressive-hint-box" data-stage="${hint.stage}">
                <div class="hint-header">
                  <span class="hint-badge">${hint.badge}</span>
                  <span class="hint-stage-label">${hint.label}</span>
                </div>
                <div class="hint-body-text">${hint.text}</div>
              </div>
            ` : ''}
          </div>

          <!-- Action Controls & Telemetry (Right Panel in Landscape / Thumb Zone in Portrait) -->
          <div class="card-controls-panel">
            <!-- Telemetry Strip -->
            <div class="card-telemetry-strip">
              <span class="telemetry-item"><span class="telemetry-icon">⚡</span> ${session.streak} streak</span>
              <span class="telemetry-item">${session.avgSpeed}s avg</span>
            </div>

            <!-- Dynamic Bottom Thumb-Zone Buttons -->
            <div class="card-keyhints-row thumb-dock">
              <button class="keyhint-btn touch-target ${state.hintStage > 0 ? 'hint-active' : ''}" id="btn-hint" data-key="h" title="Keyboard: H">
                <span class="micro-bracket">[H]</span>
                <span class="keyhint-label">${state.hintStage > 0 ? `Hint (${state.hintStage}/3)` : t('hint')}</span>
              </button>
              <button class="keyhint-btn keyhint-primary touch-target" id="btn-reveal" data-key=" " title="Keyboard: Space or Enter">
                <span class="micro-bracket">[Space]</span>
                <span class="keyhint-label">${t('reveal')}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // Click Handlers
    this.container.querySelector('#btn-reveal')?.addEventListener('click', () => {
      state.revealCard();
    });
    this.container.querySelector('#btn-hint')?.addEventListener('click', () => {
      state.toggleHint();
    });
  }

  renderRevealedCard(card) {
    const posTag = card.pos ? card.pos.toUpperCase() : 'VOCAB';
    const revealedTitle = card.revealed_back || card.display || card.word;
    const totalInBatch = state.studyQueue.length;
    const currentIdx = state.currentCardIndex + 1;
    const progressPct = totalInBatch > 0 ? Math.round((currentIdx / totalInBatch) * 100) : 0;
    const session = state.getSessionStats();
    const levelStats = state.getLevelStats();

    // Sentence example with target highlight
    let exampleTarget = '';
    let exampleTrans = '';
    if (state.targetLang === 'de') {
      exampleTarget = card.example_de || '';
      exampleTrans = state.interfaceLang === 'en' ? (card.example_en || card.example_mn || '') : (card.example_mn || '');
    } else {
      exampleTarget = card.example_en || '';
      exampleTrans = state.interfaceLang === 'de' ? (card.example_de || card.example_mn || '') : (card.example_mn || '');
    }

    // Morphological verb chip breakdown
    let verbChipHtml = '';
    if (card.forms) {
      const parts = card.forms.split('|').map(s => s.trim());
      if (parts.length >= 4) {
        verbChipHtml = `
          <div class="card-verb-chip-grid">
            <div class="verb-chip">
              <span class="chip-label">Infinitiv</span>
              <span class="chip-val">${parts[0]}</span>
            </div>
            <div class="verb-chip">
              <span class="chip-label">3.P. Präsens</span>
              <span class="chip-val">${parts[1]}</span>
            </div>
            <div class="verb-chip">
              <span class="chip-label">Präteritum</span>
              <span class="chip-val">${parts[2]}</span>
            </div>
            <div class="verb-chip">
              <span class="chip-label">Partizip II</span>
              <span class="chip-val ${parts[3].includes('ist ') ? 'aux-ist' : 'aux-hat'}">${parts[3]}</span>
            </div>
          </div>
        `;
      } else {
        verbChipHtml = `
          <div class="card-verb-forms">
            <span class="forms-label">${t('forms_label')}:</span>
            <span class="forms-val">${card.forms}</span>
          </div>
        `;
      }
    }

    this.container.innerHTML = `
      <div class="study-card-wrapper study-landscape-split">
        <!-- Main Flashcard with Embedded Centered Progress Meter -->
        <div class="active-flashcard revealed-state" id="active-card-element">
          
          <!-- Centered On-Card Progress Meter Header -->
          <div class="on-card-progress-container">
            <div class="card-progress-header-row">
              <span class="card-pos-badge">[${posTag}]</span>
              <div class="card-progress-pill" title="Card ${currentIdx} of ${totalInBatch}">
                <span class="progress-pill-num">${currentIdx}</span>
                <span class="progress-pill-sep">/</span>
                <span class="progress-pill-total">${totalInBatch}</span>
              </div>
              <span class="card-level-tag">Lv.${levelStats.level}</span>
            </div>
            <!-- Integrated Smooth Progress Fill along Card Header -->
            <div class="card-progress-track">
              <div class="card-progress-fill" style="width: ${progressPct}%" role="progressbar" aria-valuenow="${currentIdx}" aria-valuemin="1" aria-valuemax="${totalInBatch}"></div>
            </div>
          </div>

          <!-- Revealed Answer Area (Left Panel in Landscape) -->
          <div class="card-revealed-area">
            <div class="card-revealed-title">${revealedTitle}</div>
            
            ${verbChipHtml}

            ${card.rektion ? `
              <div class="card-valency-row">
                <span class="card-valency-badge">[${card.rektion}]</span>
              </div>
            ` : ''}

            <div class="card-meaning-line">
              <span class="meaning-mn">${card.mn}</span>
              ${card.en && state.targetLang === 'de' ? `<span class="meaning-sub">· ${card.en}</span>` : ''}
              ${card.de && state.targetLang === 'en' ? `<span class="meaning-sub">· ${card.de}</span>` : ''}
            </div>

            ${exampleTarget ? `
              <div class="card-example-box">
                <div class="example-target">${exampleTarget}</div>
                ${exampleTrans ? `<div class="example-trans">${exampleTrans}</div>` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Action Controls & Ratings (Right Panel in Landscape / Thumb Zone in Portrait) -->
          <div class="card-controls-panel">
            <!-- Telemetry & Streak -->
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
    this.container.querySelector('#btn-grade-1')?.addEventListener('click', () => state.gradeCurrentCard(1));
    this.container.querySelector('#btn-grade-2')?.addEventListener('click', () => state.gradeCurrentCard(2));
    this.container.querySelector('#btn-grade-3')?.addEventListener('click', () => state.gradeCurrentCard(3));
    this.container.querySelector('#btn-grade-4')?.addEventListener('click', () => state.gradeCurrentCard(4));
    this.container.querySelector('#btn-audio')?.addEventListener('click', () => state.playAudio());
    this.container.querySelector('#btn-reset-card')?.addEventListener('click', () => state.resetCurrentCard());
  }
}
