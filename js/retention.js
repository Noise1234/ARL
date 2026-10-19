import { state } from './state.js';
import { QuizEngine } from './quiz.js';

export class RetentionGate {
  constructor(containerEl, onUnlockedCallback) {
    this.container = containerEl;
    this.onUnlocked = onUnlockedCallback;
  }

  checkAndLaunch() {
    if (!state.isRetentionCheckDue()) {
      return false;
    }

    const eligibleWords = state.getRetentionEligibleWords();
    if (eligibleWords.length === 0) {
      return false;
    }

    // Pick 5-10 words
    const sampleSize = Math.min(10, Math.max(5, eligibleWords.length));
    const testBatch = eligibleWords.slice(0, sampleSize);

    this.renderIntro(testBatch);
    return true;
  }

  renderIntro(testBatch) {
    this.container.innerHTML = `
      <div class="retention-gate-overlay">
        <div class="retention-card">
          <div class="gate-badge">Täglicher Retention-Check</div>
          <h2 class="gate-title">Gestern gelernt? Heute verifizieren!</h2>
          <p class="gate-desc">
            Bevor du neue B1-Vokabeln freischaltest, prüft ARL dein Langzeitgedächtnis mit einem schnellen Check von <strong>${testBatch.length} Wörtern</strong> deiner letzten Lerneinheiten.
          </p>

          <div class="gate-stats-preview">
            <div class="gate-stat-item">
              <span class="gate-stat-val">${testBatch.length}</span>
              <span class="gate-stat-label">Vokabeln</span>
            </div>
            <div class="gate-stat-item">
              <span class="gate-stat-val">⚡ ${state.stats.streak}</span>
              <span class="gate-stat-label">Aktueller Streak</span>
            </div>
          </div>

          <div class="gate-actions">
            <button class="btn btn-primary btn-start-retention" id="btn-start-retention">
              <span>Retention-Check starten →</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-start-retention').addEventListener('click', () => {
      this.launchQuiz(testBatch);
    });
  }

  launchQuiz(testBatch) {
    const quiz = new QuizEngine(this.container, {
      title: 'Tages-Retention',
      subtitle: 'Gestrige & gemerkte Wörter abrufen',
      isRetentionGate: true,
      onFinish: (result) => {
        this.container.innerHTML = '';
        if (this.onUnlocked) this.onUnlocked(result);
      }
    });

    quiz.start(testBatch);
  }
}
