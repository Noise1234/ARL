/**
 * ARL - Centered Active Flashcard View
 * Ultra-minimalist 2nd visual element with dynamic inline micro-keyhints.
 * Zero-latency state transitions.
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
    this.container.innerHTML = `
      <div class="study-card-wrapper">
        <div class="active-flashcard empty-flashcard">
          <div class="card-empty-title">${t('session_empty')}</div>
          <div class="card-empty-desc">${t('session_empty_sub')}</div>
          <div class="card-keyhints-row">
            <button class="keyhint-btn btn-primary-action" id="btn-load-new-batch">
              <span class="micro-bracket">[Space]</span> ${t('btn_start_new')}
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-load-new-batch').addEventListener('click', () => {
      state.buildStudyQueue();
      this.render();
    });
  }

  renderUnrevealedCard(card) {
    const posTag = card.pos ? card.pos.toUpperCase() : 'VOCAB';
    const hintVisible = state.showHint;

    this.container.innerHTML = `
      <div class="study-card-wrapper">
        <div class="active-flashcard" id="active-card-element">
          <!-- Card Header Info -->
          <div class="card-header-meta">
            <span class="card-pos-badge">[${posTag}]</span>
            <span class="card-progress-counter">${state.currentCardIndex + 1} / ${state.studyQueue.length}</span>
          </div>

          <!-- Cloze Prompt -->
          <div class="card-prompt-area">
            <div class="card-prompt-text">${card.prompt_front || card.word}</div>
            ${hintVisible ? `
              <div class="card-inline-hint">
                <span class="hint-label">${t('hint')}:</span>
                <span class="hint-text">${card.mn || card.en || ''}</span>
              </div>
            ` : ''}
          </div>

          <!-- Dynamic Micro-Keyhints Footer -->
          <div class="card-keyhints-row">
            <button class="keyhint-btn" id="btn-hint" title="Keyboard: H">
              <span class="micro-bracket">[H]</span><span class="keyhint-label">${t('hint')}</span>
            </button>
            <button class="keyhint-btn keyhint-primary" id="btn-reveal" title="Keyboard: Space or Enter">
              <span class="micro-bracket">[Space]</span><span class="keyhint-label">${t('reveal')}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Click Handlers
    this.container.querySelector('#btn-reveal').addEventListener('click', () => {
      state.revealCard();
    });
    this.container.querySelector('#btn-hint').addEventListener('click', () => {
      state.toggleHint();
    });
  }

  renderRevealedCard(card) {
    const posTag = card.pos ? card.pos.toUpperCase() : 'VOCAB';
    const revealedTitle = card.revealed_back || card.display || card.word;

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

    this.container.innerHTML = `
      <div class="study-card-wrapper">
        <div class="active-flashcard revealed-state" id="active-card-element">
          <!-- Card Header Meta -->
          <div class="card-header-meta">
            <span class="card-pos-badge">[${posTag}]</span>
            <span class="card-progress-counter">${state.currentCardIndex + 1} / ${state.studyQueue.length}</span>
          </div>

          <!-- Revealed Answer -->
          <div class="card-revealed-area">
            <div class="card-revealed-title">${revealedTitle}</div>
            
            ${card.forms ? `
              <div class="card-verb-forms">
                <span class="forms-label">${t('forms_label')}:</span>
                <span class="forms-val">${card.forms}</span>
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

          <!-- Dynamic Micro-Keyhints Footer: 1-4 Ratings + Audio -->
          <div class="card-keyhints-row card-rating-row">
            <button class="keyhint-btn rating-again" id="btn-grade-1" title="Keyboard: 1">
              <span class="micro-bracket">[1]</span><span class="keyhint-label">${t('again')}</span>
            </button>
            <button class="keyhint-btn rating-hard" id="btn-grade-2" title="Keyboard: 2">
              <span class="micro-bracket">[2]</span><span class="keyhint-label">${t('hard')}</span>
            </button>
            <button class="keyhint-btn rating-good" id="btn-grade-3" title="Keyboard: 3">
              <span class="micro-bracket">[3]</span><span class="keyhint-label">${t('good')}</span>
            </button>
            <button class="keyhint-btn rating-easy" id="btn-grade-4" title="Keyboard: 4">
              <span class="micro-bracket">[4]</span><span class="keyhint-label">${t('easy')}</span>
            </button>
            <span class="keyhint-sep">|</span>
            <button class="keyhint-btn rating-audio" id="btn-audio" title="Keyboard: A">
              <span class="micro-bracket">[A]</span><span class="keyhint-label">${t('audio')}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Click Handlers
    this.container.querySelector('#btn-grade-1').addEventListener('click', () => state.gradeCurrentCard(1));
    this.container.querySelector('#btn-grade-2').addEventListener('click', () => state.gradeCurrentCard(2));
    this.container.querySelector('#btn-grade-3').addEventListener('click', () => state.gradeCurrentCard(3));
    this.container.querySelector('#btn-grade-4').addEventListener('click', () => state.gradeCurrentCard(4));
    this.container.querySelector('#btn-audio').addEventListener('click', () => state.playAudio());
  }
}
