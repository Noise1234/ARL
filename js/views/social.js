/**
 * ARL - PIN-Protected "Friends & Leaderboard" Cloud Social View ([F])
 * Typographic minimalist monochrome design system with zero OS emojis in navigation.
 * Bento-style profile cards, Top 3 Podiums, Global/Friends Leaderboards,
 * Read-Only Profile Inspection Mode, Add Friend workflow, and Supabase REST diagnostics with PIN security.
 */

import { socialClient, AVATAR_BADGES, sanitizeUsername } from '../social.js';
import { state } from '../state.js';
import { sound } from '../sound.js';
import { t } from '../i18n.js';

export class SocialView {
  constructor(containerEl, onNavigate) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.activeTab = 'friends'; // 'friends' | 'global' | 'add' | 'config'
    this.globalFilter = 'all'; // 'all' | 'de' | 'en'
    this.authMode = 'register'; // 'register' | 'login'
    this.selectedAvatar = 'ALPHA';
    this.showPin = false;
    this.showNewPin = false;
    this.feedback = null; // { type: 'success' | 'error' | 'info', message: string }
    this.searchQuery = '';
    this.inspectingUser = null; // Read-only profile inspection object

    // Cache of fetched leaderboards
    this.cachedGlobal = [];
    this.cachedFriends = [];

    // Subscribe to social client updates
    this.unsubscribeSocial = socialClient.subscribe(() => {
      if (this.container && this.container.querySelector('.social-view-wrapper')) {
        this.render();
      }
    });
  }

  setFeedback(type, message) {
    this.feedback = { type, message };
    this.render();
    if (type === 'success') {
      setTimeout(() => {
        if (this.feedback && this.feedback.message === message) {
          this.feedback = null;
          this.render();
        }
      }, 4000);
    }
  }

  async render() {
    if (!this.container) return;

    const profile = socialClient.getProfile();
    const isConfigured = socialClient.isConfigured();

    this.container.innerHTML = `
      <div class="social-view-wrapper">
        
        <!-- Social HUD Top Navigation Header -->
        <header class="social-view-header">
          <div class="social-header-title-group">
            <span class="social-badge-tag">[SOCIAL]</span>
            <h2 class="social-view-title">Friends & Cloud Leaderboard</h2>
          </div>

          <div class="social-cloud-status-badge ${isConfigured ? 'status-cloud-live' : 'status-cloud-mock'}">
            <span class="status-dot ${isConfigured ? 'online' : 'mock'}"></span>
            <span class="status-text">${isConfigured ? 'Supabase REST Live' : 'Mock Sandbox Active'}</span>
          </div>
        </header>

        <!-- Feedback Alert Banner -->
        ${this.feedback ? `
          <div class="social-feedback-alert feedback-${this.feedback.type}" role="alert">
            <span class="feedback-badge">[${this.feedback.type.toUpperCase()}]</span>
            <span class="feedback-text">${this.feedback.message}</span>
            <button class="feedback-dismiss-btn" id="btn-dismiss-feedback" aria-label="Dismiss">✕</button>
          </div>
        ` : ''}

        <!-- Main Content Area -->
        ${!profile ? this.renderAuthBento() : this.renderAuthenticatedSocial(profile)}

        <!-- Read-Only Profile Inspection Modal Overlay -->
        ${this.inspectingUser ? this.renderInspectionModal(this.inspectingUser) : ''}

      </div>
    `;

    this.bindEvents();
  }

  /**
   * Renders PIN-protected Registration / Login Bento when user has no active profile.
   */
  renderAuthBento() {
    const isReg = this.authMode === 'register';

    return `
      <div class="social-auth-container">
        <div class="social-auth-card">
          
          <div class="auth-tabs-row">
            <button class="auth-mode-tab ${isReg ? 'active' : ''}" id="tab-auth-register">
              <span class="micro-bracket">[+]</span> Join Leaderboard (Register)
            </button>
            <button class="auth-mode-tab ${!isReg ? 'active' : ''}" id="tab-auth-login">
              <span class="micro-bracket">[🔑]</span> Existing User (PIN Login)
            </button>
          </div>

          <div class="auth-card-body">
            <div class="auth-intro-box">
              <p class="auth-intro-title">
                ${isReg ? 'Create your PIN-Protected Cloud Profile' : 'Log in with your Username and PIN'}
              </p>
              <p class="auth-intro-desc">
                ${isReg 
                  ? 'Compete on global and friends leaderboards. Your 4-8 digit security PIN protects your username and stats from being modified by others.' 
                  : 'Enter your credentials to restore your social profile, friend list, and cloud rankings.'}
              </p>
            </div>

            <form id="social-auth-form" class="auth-form-grid" onsubmit="return false;">
              
              <!-- Username input -->
              <div class="form-field-group">
                <label for="input-auth-username" class="field-label">
                  Username Handle (e.g. @alex_de, @temuujin99):
                </label>
                <div class="input-with-prefix">
                  <span class="input-prefix">@</span>
                  <input
                    type="text"
                    id="input-auth-username"
                    class="auth-input font-mono"
                    placeholder="learner_handle"
                    maxlength="24"
                    autocomplete="username"
                    required
                  />
                </div>
                <span class="field-hint">2-24 characters: letters, numbers, and underscores only.</span>
              </div>

              <!-- Display Name input (Register only) -->
              ${isReg ? `
                <div class="form-field-group">
                  <label for="input-auth-display" class="field-label">
                    Display Name (shown on leaderboards):
                  </label>
                  <input
                    type="text"
                    id="input-auth-display"
                    class="auth-input"
                    placeholder="e.g. Alex M. or Temuujin"
                    maxlength="30"
                    autocomplete="name"
                  />
                </div>
              ` : ''}

              <!-- Security PIN input -->
              <div class="form-field-group">
                <label for="input-auth-pin" class="field-label">
                  Security PIN (4 to 8 characters):
                </label>
                <div class="input-with-button">
                  <input
                    type="${this.showPin ? 'text' : 'password'}"
                    id="input-auth-pin"
                    class="auth-input font-mono"
                    placeholder="••••"
                    maxlength="8"
                    autocomplete="current-password"
                    required
                  />
                  <button type="button" class="btn-toggle-pin" id="btn-toggle-auth-pin">
                    ${this.showPin ? 'Hide' : 'Show'}
                  </button>
                </div>
                <span class="field-hint">Hashed with SHA-256 before transit. Server trigger blocks unauthorized updates.</span>
              </div>

              <!-- Avatar Selection (Register only) -->
              ${isReg ? `
                <div class="form-field-group">
                  <label class="field-label">Select Monospace Badge Avatar:</label>
                  <div class="avatar-chips-grid">
                    ${AVATAR_BADGES.map(b => `
                      <button
                        type="button"
                        class="avatar-chip ${this.selectedAvatar === b.id ? 'selected' : ''}"
                        data-avatar="${b.id}"
                      >
                        <span class="chip-icon">${b.icon}</span>
                        <span class="chip-label">${b.label}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Submit button -->
              <div class="auth-submit-row">
                <button type="button" class="btn-primary auth-submit-btn touch-target" id="btn-submit-auth">
                  ${isReg ? '[+] Create Profile & Join Leaderboard' : '[🔑] Log In with PIN'}
                </button>
              </div>

            </form>
          </div>

          <div class="auth-card-footer">
            <span class="security-lock-icon">🔒</span>
            <span>Cryptographic SHA-256 verification and PostgreSQL BEFORE UPDATE trigger protect your username.</span>
          </div>

        </div>
      </div>
    `;
  }

  /**
   * Renders Authenticated Social Dashboard.
   */
  renderAuthenticatedSocial(profile) {
    const friendCode = socialClient.getFriendCode();
    const friendsCount = socialClient.getFriends().length;
    const totalExp = profile.xp ?? profile.totalExp ?? 0;
    const streakDays = profile.streak_days ?? profile.streak ?? 0;
    const wordsLearned = profile.total_words_learned ?? profile.cardsLearned ?? 0;
    const studyMins = profile.study_minutes_total ?? Math.round((profile.studyTimeSeconds || 0) / 60);
    const studyHoursFormatted = (studyMins / 60).toFixed(1) + 'h';
    const avatarBadge = profile.detailed_stats?.avatar || profile.avatar || 'ALPHA';
    const displayName = profile.detailed_stats?.display_name || profile.displayName || profile.username;
    const statusMsg = profile.detailed_stats?.status_message || profile.statusMessage || 'ARL Minimalist Learner';

    return `
      <div class="social-dashboard-layout">
        
        <!-- User Profile Hero Bento -->
        <section class="social-hero-bento">
          <div class="hero-left-col">
            <div class="hero-avatar-badge" title="Monospace Avatar">${this.getAvatarGlyph(avatarBadge)}</div>
            <div class="hero-user-details">
              <div class="hero-name-row">
                <h3 class="hero-display-name">${this.escape(displayName)}</h3>
                <span class="hero-username font-mono">@${profile.username}</span>
              </div>
              <p class="hero-status-message">${this.escape(statusMsg)}</p>
              
              <!-- Friend Code & Copy Pill -->
              <div class="hero-friend-code-pill" id="btn-copy-friend-code" role="button" tabindex="0" title="Click to copy Friend Code">
                <span class="code-label">Friend Code:</span>
                <span class="code-val font-mono">${friendCode}</span>
                <span class="code-copy-tag">[Copy]</span>
              </div>
            </div>
          </div>

          <div class="hero-metrics-bento">
            <div class="metric-card">
              <span class="metric-val font-mono">${totalExp.toLocaleString()}</span>
              <span class="metric-label">XP</span>
            </div>
            <div class="metric-card">
              <span class="metric-val font-mono">${streakDays}d</span>
              <span class="metric-label">Streak</span>
            </div>
            <div class="metric-card">
              <span class="metric-val font-mono">${wordsLearned}</span>
              <span class="metric-label">Words</span>
            </div>
            <div class="metric-card">
              <span class="metric-val font-mono">${studyHoursFormatted}</span>
              <span class="metric-label">Study Time</span>
            </div>
          </div>

          <div class="hero-actions-col">
            <button class="social-action-btn btn-sync-stats touch-target" id="btn-social-sync-now" title="Sync current EXP and study time to cloud">
              <span class="micro-bracket">[🔄]</span> Sync Stats
            </button>
            <button class="social-action-btn btn-cloud-settings touch-target" id="btn-open-config-tab" title="Supabase & PIN settings">
              <span class="micro-bracket">[⚙]</span> Cloud & PIN
            </button>
            <button class="social-action-btn btn-logout-user touch-target" id="btn-social-logout" title="Log out from social module">
              <span class="micro-bracket">[✕]</span> Logout
            </button>
          </div>
        </section>

        <!-- Social Module Navigation Tabs -->
        <nav class="social-tabs-strip" aria-label="Social Navigation">
          <button class="social-tab-btn ${this.activeTab === 'friends' ? 'active' : ''}" data-tab="friends">
            <span class="tab-key">[1]</span> Friends (${friendsCount})
          </button>
          <button class="social-tab-btn ${this.activeTab === 'global' ? 'active' : ''}" data-tab="global">
            <span class="tab-key">[2]</span> Global Top 50
          </button>
          <button class="social-tab-btn ${this.activeTab === 'add' ? 'active' : ''}" data-tab="add">
            <span class="tab-key">[3]</span> Add Friend
          </button>
          <button class="social-tab-btn ${this.activeTab === 'config' ? 'active' : ''}" data-tab="config">
            <span class="tab-key">[4]</span> Supabase & PIN
          </button>
        </nav>

        <!-- Tab Body Content -->
        <main class="social-tab-content">
          ${this.renderActiveTabContent(profile)}
        </main>

      </div>
    `;
  }

  renderActiveTabContent(profile) {
    switch (this.activeTab) {
      case 'friends':
        return this.renderFriendsTab(profile);
      case 'global':
        return this.renderGlobalTab(profile);
      case 'add':
        return this.renderAddFriendTab(profile);
      case 'config':
        return this.renderConfigTab(profile);
      default:
        return this.renderFriendsTab(profile);
    }
  }

  // ==========================================
  // TAB 1: FRIENDS LEADERBOARD
  // ==========================================

  renderFriendsTab(profile) {
    const list = this.cachedFriends || [];
    const top3 = list.slice(0, 3);

    return `
      <div class="leaderboard-tab-container">
        
        <div class="tab-header-row">
          <div class="tab-title-group">
            <h3 class="tab-section-title">Friends Leaderboard</h3>
            <span class="tab-subtitle">Rankings among you and your study partners</span>
          </div>
          <button class="btn-refresh-board touch-target" id="btn-refresh-friends" title="Refresh friends list">
            <span class="micro-bracket">[R]</span> Refresh
          </button>
        </div>

        ${list.length > 0 ? `
          <!-- Top 3 Podiums -->
          <div class="podium-grid">
            ${top3.map((learner, idx) => this.renderPodiumCard(learner, idx + 1)).join('')}
          </div>

          <!-- Full Leaderboard Table -->
          <div class="leaderboard-table-wrapper">
            <table class="leaderboard-table" aria-label="Friends Leaderboard Table">
              <thead>
                <tr>
                  <th class="th-rank">Rank</th>
                  <th class="th-learner">Learner</th>
                  <th class="th-streak">Streak</th>
                  <th class="th-words">Words</th>
                  <th class="th-exp">XP</th>
                  <th class="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                ${list.map(learner => this.renderLeaderboardRow(learner, 'friends')).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-social-state">
            <div class="empty-icon font-mono">[👥]</div>
            <p class="empty-title">No friends added yet</p>
            <p class="empty-desc">Add study partners by their @handle or Friend Code to inspect their detailed study stats and compare progress!</p>
            <button class="btn-primary touch-target" id="btn-goto-add-friends">
              [+] Find & Add Friends
            </button>
          </div>
        `}

      </div>
    `;
  }

  // ==========================================
  // TAB 2: GLOBAL LEADERBOARD
  // ==========================================

  renderGlobalTab(profile) {
    const list = this.cachedGlobal || [];
    const top3 = list.slice(0, 3);

    return `
      <div class="leaderboard-tab-container">
        
        <div class="tab-header-row">
          <div class="tab-title-group">
            <h3 class="tab-section-title">Global Top Learners</h3>
            <span class="tab-subtitle">Top language masters worldwide by accumulated study XP</span>
          </div>

          <div class="filter-pills-group">
            <button class="filter-pill ${this.globalFilter === 'all' ? 'active' : ''}" data-filter="all">All Tracks</button>
            <button class="filter-pill ${this.globalFilter === 'de' ? 'active' : ''}" data-filter="de">German [DE]</button>
            <button class="filter-pill ${this.globalFilter === 'en' ? 'active' : ''}" data-filter="en">English [EN]</button>
            <button class="btn-refresh-board touch-target" id="btn-refresh-global" title="Refresh global board">
              <span class="micro-bracket">[R]</span>
            </button>
          </div>
        </div>

        ${list.length > 0 ? `
          <!-- Top 3 Podiums -->
          <div class="podium-grid">
            ${top3.map((learner, idx) => this.renderPodiumCard(learner, idx + 1)).join('')}
          </div>

          <!-- Full Table -->
          <div class="leaderboard-table-wrapper">
            <table class="leaderboard-table" aria-label="Global Leaderboard Table">
              <thead>
                <tr>
                  <th class="th-rank">Rank</th>
                  <th class="th-learner">Learner</th>
                  <th class="th-streak">Streak</th>
                  <th class="th-words">Words</th>
                  <th class="th-exp">XP</th>
                  <th class="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                ${list.map(learner => this.renderLeaderboardRow(learner, 'global')).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty-social-state">
            <div class="empty-icon font-mono">[🌍]</div>
            <p class="empty-title">Loading Global Rankings...</p>
            <p class="empty-desc">Fetching live records from Supabase REST...</p>
          </div>
        `}

      </div>
    `;
  }

  // ==========================================
  // TAB 3: ADD FRIEND
  // ==========================================

  renderAddFriendTab(profile) {
    const friendCode = socialClient.getFriendCode();
    const mockLearners = socialClient.mockLearners.filter(m => m.username !== profile.username);

    return `
      <div class="add-friend-container">
        
        <div class="add-friend-card">
          <div class="card-title-group">
            <h3 class="tab-section-title">Connect with Study Friends</h3>
            <span class="tab-subtitle">Enter a friend's @username or paste their ARL Friend Code</span>
          </div>

          <form id="form-add-friend" class="add-friend-form" onsubmit="return false;">
            <div class="search-input-wrapper">
              <input
                type="text"
                id="input-friend-search"
                class="friend-search-input font-mono"
                placeholder="Enter @handle or ARL:USERNAME..."
                autocomplete="off"
                spellcheck="false"
              />
              <button type="button" class="btn-primary btn-add-friend-submit touch-target" id="btn-submit-add-friend">
                [+] Add Friend
              </button>
            </div>
            <span class="field-hint">Example: @elena_ber or ARL:ELENA_BER</span>
          </form>

          <div class="my-share-box">
            <div class="share-box-left">
              <span class="share-label">Your Shareable Friend Code:</span>
              <span class="share-code font-mono">${friendCode}</span>
            </div>
            <button class="btn-copy-code touch-target" id="btn-copy-code-direct">
              [📋 Copy Code]
            </button>
          </div>
        </div>

        <div class="recommended-partners-card">
          <div class="card-title-group">
            <h4 class="sub-section-title">Recommended Study Partners</h4>
            <span class="tab-subtitle">Click [Inspect] to view their study breakdown in read-only mode</span>
          </div>

          <div class="recommended-grid">
            ${mockLearners.slice(0, 6).map(learner => {
              const isAlreadyFriend = socialClient.isFriend(learner.username);
              const displayName = learner.detailed_stats?.display_name || learner.username;
              const avatar = learner.detailed_stats?.avatar || 'ALPHA';
              return `
                <div class="recommended-user-card">
                  <div class="rec-avatar-col">
                    <span class="rec-avatar font-mono">${this.getAvatarGlyph(avatar)}</span>
                  </div>
                  <div class="rec-info-col">
                    <div class="rec-name-row">
                      <strong class="clickable-inspect" data-inspect-username="${learner.username}">${this.escape(displayName)}</strong>
                      <span class="rec-handle font-mono">@${learner.username}</span>
                    </div>
                    <div class="rec-stats-row font-mono">
                      <span>${(learner.xp || 0).toLocaleString()} XP</span> ·
                      <span>${learner.streak_days || 0}d streak</span> ·
                      <span>${learner.total_words_learned || 0} words</span>
                    </div>
                  </div>
                  <div class="rec-action-col">
                    <button class="btn-inspect-quick touch-target" data-inspect-username="${learner.username}" title="Inspect Profile">
                      [Inspect]
                    </button>
                    ${isAlreadyFriend ? `
                      <span class="friend-badge-pill">[Friend]</span>
                    ` : `
                      <button class="btn-add-quick touch-target" data-add-username="${learner.username}">
                        [+ Add]
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;
  }

  // ==========================================
  // TAB 4: SUPABASE & PIN SECURITY CONFIG
  // ==========================================

  renderConfigTab(profile) {
    const url = socialClient.getUrl();
    const key = socialClient.getAnonKey();
    const isConfigured = socialClient.isConfigured();
    const pinLock = socialClient.isPinLockEnabled();

    return `
      <div class="config-tab-container">
        
        <div class="config-card">
          <div class="card-title-group">
            <h3 class="tab-section-title">Supabase REST Cloud Configuration</h3>
            <span class="tab-subtitle">Zero-dependency PostgREST client with server-side PIN trigger protection</span>
          </div>

          <form id="form-supabase-config" class="config-form" onsubmit="return false;">
            
            <div class="form-field-group">
              <label for="input-supabase-url" class="field-label">Supabase Project URL:</label>
              <input
                type="url"
                id="input-supabase-url"
                class="auth-input font-mono"
                placeholder="https://xyzproject.supabase.co"
                value="${this.escape(url)}"
                spellcheck="false"
              />
              <span class="field-hint">Found under Supabase Dashboard -> Project Settings -> API -> Project URL</span>
            </div>

            <div class="form-field-group">
              <label for="input-supabase-key" class="field-label">Supabase Public Anon Key:</label>
              <input
                type="password"
                id="input-supabase-key"
                class="auth-input font-mono"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value="${this.escape(key)}"
                spellcheck="false"
              />
              <span class="field-hint">Found under Supabase Dashboard -> Project Settings -> API -> Project API keys (anon public)</span>
            </div>

            <div class="config-actions-row">
              <button type="button" class="btn-primary touch-target" id="btn-save-supabase-creds">
                [Save Credentials]
              </button>
              <button type="button" class="btn-test-conn touch-target" id="btn-test-supabase-conn">
                [🩺 Test Connection]
              </button>
              <button type="button" class="btn-copy-sql touch-target" id="btn-copy-supabase-sql">
                [📋 Copy supabase_setup.sql]
              </button>
              ${isConfigured ? `
                <button type="button" class="btn-clear-key touch-target" id="btn-clear-supabase-creds">
                  Disconnect (Use Mock Sandbox)
                </button>
              ` : ''}
            </div>

          </form>
        </div>

        <div class="config-card">
          <div class="card-title-group">
            <h3 class="tab-section-title">PIN Security & Profile Settings</h3>
            <span class="tab-subtitle">Your PIN is verified by PostgreSQL trigger (trg_verify_arl_profile_pin) on every update</span>
          </div>

          <form id="form-change-pin" class="config-form" onsubmit="return false;">
            
            <div class="form-field-group">
              <label for="input-change-old-pin" class="field-label">Current Security PIN:</label>
              <input
                type="password"
                id="input-change-old-pin"
                class="auth-input font-mono"
                placeholder="••••"
                maxlength="8"
              />
            </div>

            <div class="form-field-group">
              <label for="input-change-new-pin" class="field-label">New Security PIN (4-8 digits):</label>
              <div class="input-with-button">
                <input
                  type="${this.showNewPin ? 'text' : 'password'}"
                  id="input-change-new-pin"
                  class="auth-input font-mono"
                  placeholder="••••"
                  maxlength="8"
                />
                <button type="button" class="btn-toggle-pin" id="btn-toggle-new-pin">
                  ${this.showNewPin ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div class="config-actions-row">
              <button type="button" class="btn-primary touch-target" id="btn-submit-change-pin">
                [Update Security PIN]
              </button>
            </div>

          </form>

          <hr class="config-divider" />

          <div class="pin-lock-toggle-row">
            <div class="toggle-info">
              <strong>In-App Privacy Lock</strong>
              <p class="field-hint">Require PIN verification every time the Social module is accessed.</p>
            </div>
            <button class="btn-toggle-switch ${pinLock ? 'active' : ''}" id="btn-toggle-pin-lock">
              ${pinLock ? '[ENABLED]' : '[DISABLED]'}
            </button>
          </div>

        </div>

      </div>
    `;
  }

  // ==========================================
  // READ-ONLY PROFILE INSPECTION MODAL
  // ==========================================

  renderInspectionModal(learner) {
    const displayName = learner.detailed_stats?.display_name || learner.username;
    const avatar = learner.detailed_stats?.avatar || learner.avatar || 'ALPHA';
    const statusMsg = learner.detailed_stats?.status_message || '';
    const xp = learner.xp || learner.total_exp || 0;
    const streak = learner.streak_days ?? learner.streak ?? 0;
    const words = learner.total_words_learned ?? learner.cards_learned ?? 0;
    const studyMins = learner.study_minutes_total || 0;
    const studyHoursStr = `${Math.floor(studyMins / 60)}h ${studyMins % 60}m`;
    const updatedStr = learner.updated_at ? new Date(learner.updated_at).toLocaleString() : 'Recently';

    const de = learner.detailed_stats?.de || { A1: 0, A2: 0, B1: 0, B2: 0 };
    const en = learner.detailed_stats?.en || { A1: 0, A2: 0, B1: 0, B2: 0 };
    const weeklyWords = learner.detailed_stats?.weekly_words || 0;
    const monthlyWords = learner.detailed_stats?.monthly_words || 0;
    const seasonalWords = learner.detailed_stats?.seasonal_words || 0;
    const yearlyWords = learner.detailed_stats?.yearly_words || 0;
    const wordsPerHour = learner.detailed_stats?.words_per_hour || 0;

    const isFriend = socialClient.isFriend(learner.username);
    const isCurrent = socialClient.getProfile()?.username === learner.username;

    return `
      <div class="modal-backdrop" id="inspect-modal-backdrop">
        <div class="modal-dialog inspect-profile-dialog" role="dialog" aria-labelledby="inspect-profile-title">
          
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-badge">[INSPECT]</span>
              <h3 class="modal-title" id="inspect-profile-title">
                ${this.escape(displayName)} <span class="font-mono text-secondary">(@${learner.username})</span>
              </h3>
            </div>
            <button class="modal-close-btn" id="btn-close-inspect-modal" aria-label="Close inspection">✕</button>
          </div>

          <div class="modal-body inspect-modal-body">
            
            <!-- Summary Header Banner -->
            <div class="inspect-hero-card">
              <div class="inspect-avatar-box font-mono">
                ${this.getAvatarGlyph(avatar)}
              </div>
              <div class="inspect-summary-text">
                <div class="inspect-display-title">${this.escape(displayName)}</div>
                <div class="inspect-status-bio font-mono">${this.escape(statusMsg || 'Language Learner')}</div>
                <div class="inspect-sync-tag font-mono">Last Synced: ${updatedStr}</div>
              </div>
            </div>

            <!-- Core High-Level Numbers -->
            <div class="inspect-metrics-grid">
              <div class="inspect-metric-pill">
                <span class="pill-label">Total XP</span>
                <span class="pill-value font-mono">${xp.toLocaleString()}</span>
              </div>
              <div class="inspect-metric-pill">
                <span class="pill-label">Streak</span>
                <span class="pill-value font-mono">${streak}d 🔥</span>
              </div>
              <div class="inspect-metric-pill">
                <span class="pill-label">Words Learned</span>
                <span class="pill-value font-mono">${words.toLocaleString()}</span>
              </div>
              <div class="inspect-metric-pill">
                <span class="pill-label">Active Study</span>
                <span class="pill-value font-mono">${studyHoursStr}</span>
              </div>
            </div>

            <!-- Detailed CEFR Breakdown -->
            <div class="inspect-section-card">
              <h4 class="inspect-section-header">CEFR Language Breakdown (Words Memorized)</h4>
              
              <div class="cefr-track-block">
                <div class="track-header-tag font-mono">[DE] German Track:</div>
                <div class="cefr-level-chips font-mono">
                  <span class="cefr-chip">A1: <strong>${de.A1 || 0}</strong></span>
                  <span class="cefr-chip">A2: <strong>${de.A2 || 0}</strong></span>
                  <span class="cefr-chip">B1: <strong>${de.B1 || 0}</strong></span>
                  <span class="cefr-chip">B2: <strong>${de.B2 || 0}</strong></span>
                </div>
              </div>

              <div class="cefr-track-block">
                <div class="track-header-tag font-mono">[EN] English Track:</div>
                <div class="cefr-level-chips font-mono">
                  <span class="cefr-chip">A1: <strong>${en.A1 || 0}</strong></span>
                  <span class="cefr-chip">A2: <strong>${en.A2 || 0}</strong></span>
                  <span class="cefr-chip">B1: <strong>${en.B1 || 0}</strong></span>
                  <span class="cefr-chip">B2: <strong>${en.B2 || 0}</strong></span>
                </div>
              </div>
            </div>

            <!-- Velocity & Timeframes -->
            <div class="inspect-section-card">
              <h4 class="inspect-section-header">Velocity & Memorization Timeframes</h4>
              <div class="timeframe-stats-grid font-mono">
                <div class="timeframe-item">
                  <span class="tf-label">Weekly:</span>
                  <span class="tf-val">${weeklyWords} words</span>
                </div>
                <div class="timeframe-item">
                  <span class="tf-label">Monthly:</span>
                  <span class="tf-val">${monthlyWords} words</span>
                </div>
                <div class="timeframe-item">
                  <span class="tf-label">Season (90d):</span>
                  <span class="tf-val">${seasonalWords} words</span>
                </div>
                <div class="timeframe-item">
                  <span class="tf-label">Yearly:</span>
                  <span class="tf-val">${yearlyWords} words</span>
                </div>
                <div class="timeframe-item tf-full-row">
                  <span class="tf-label">Learning Velocity:</span>
                  <span class="tf-val">${wordsPerHour} words / hour</span>
                </div>
              </div>
            </div>

            <!-- Server-Side Security Notice -->
            <div class="inspect-security-banner font-mono">
              <span>🔒 Server-side PIN Protected via PostgreSQL trigger (trg_verify_arl_profile_pin). Read-only inspection.</span>
            </div>

          </div>

          <div class="modal-footer inspect-modal-footer">
            ${isCurrent ? `
              <span class="pill-you">[This is your profile]</span>
            ` : isFriend ? `
              <span class="friend-badge-pill">[Already In Friends]</span>
            ` : `
              <button class="btn-primary touch-target" id="btn-inspect-add-friend" data-add-username="${learner.username}">
                [+] Add to Friends
              </button>
            `}
            <button class="settings-action-btn touch-target" id="btn-inspect-close">
              Close [Esc]
            </button>
          </div>

        </div>
      </div>
    `;
  }

  // ==========================================
  // HELPER RENDERING METHODS
  // ==========================================

  renderPodiumCard(learner, rank) {
    const isGold = rank === 1;
    const isSilver = rank === 2;
    const isBronze = rank === 3;
    const rankLabel = isGold ? '#1 GOLD' : isSilver ? '#2 SILVER' : '#3 BRONZE';
    const podiumClass = isGold ? 'podium-gold' : isSilver ? 'podium-silver' : 'podium-bronze';
    const displayName = learner.detailed_stats?.display_name || learner.username;
    const avatar = learner.detailed_stats?.avatar || learner.avatar || 'ALPHA';
    const xp = learner.xp || learner.total_exp || 0;
    const streak = learner.streak_days ?? learner.streak ?? 0;

    return `
      <div class="podium-card ${podiumClass} ${learner.isCurrentUser ? 'current-user-card' : ''}" data-inspect-username="${learner.username}">
        <div class="podium-rank-badge font-mono">[${rankLabel}]</div>
        <div class="podium-avatar font-mono">${this.getAvatarGlyph(avatar)}</div>
        <h4 class="podium-name clickable-inspect" data-inspect-username="${learner.username}">
          ${this.escape(displayName)} ${learner.isCurrentUser ? '<span class="you-tag">(You)</span>' : ''}
        </h4>
        <span class="podium-handle font-mono">@${learner.username}</span>
        
        <div class="podium-metrics-strip font-mono">
          <span class="podium-exp">${xp.toLocaleString()} XP</span>
          <span class="podium-streak">${streak}d 🔥</span>
        </div>
        <button class="btn-podium-inspect touch-target" data-inspect-username="${learner.username}">
          [Inspect Profile]
        </button>
      </div>
    `;
  }

  renderLeaderboardRow(learner, viewMode) {
    const isCurrent = Boolean(learner.isCurrentUser);
    const isFriend = socialClient.isFriend(learner.username);
    const displayName = learner.detailed_stats?.display_name || learner.username;
    const avatar = learner.detailed_stats?.avatar || learner.avatar || 'ALPHA';
    const xp = learner.xp || learner.total_exp || 0;
    const streak = learner.streak_days ?? learner.streak ?? 0;
    const words = learner.total_words_learned ?? learner.cards_learned ?? 0;

    return `
      <tr class="leaderboard-row ${isCurrent ? 'row-current-user' : ''}">
        <td class="td-rank font-mono">
          <span class="rank-badge ${learner.rank <= 3 ? 'rank-top3' : ''}">#${learner.rank}</span>
        </td>
        <td class="td-learner">
          <div class="learner-cell-group clickable-inspect" data-inspect-username="${learner.username}" title="Click to inspect profile">
            <span class="cell-avatar font-mono">${this.getAvatarGlyph(avatar)}</span>
            <div class="cell-names">
              <span class="cell-display-name">${this.escape(displayName)} ${isCurrent ? '<strong class="you-indicator">(You)</strong>' : ''}</span>
              <span class="cell-handle font-mono">@${learner.username}</span>
            </div>
          </div>
        </td>
        <td class="td-streak font-mono">${streak}d</td>
        <td class="td-words font-mono">${words.toLocaleString()}</td>
        <td class="td-exp font-mono">${xp.toLocaleString()}</td>
        <td class="td-action">
          <div class="table-actions-strip">
            <button class="btn-table-inspect touch-target" data-inspect-username="${learner.username}" title="Inspect full study stats">
              [Inspect]
            </button>
            ${isCurrent ? `
              <span class="pill-you">[You]</span>
            ` : isFriend ? `
              <button class="btn-table-remove touch-target" data-remove-friend="${learner.username}" title="Remove friend">
                [✕]
              </button>
            ` : `
              <button class="btn-table-add touch-target" data-add-username="${learner.username}" title="Add friend">
                [+ Add]
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }

  getAvatarGlyph(avatarId) {
    const found = AVATAR_BADGES.find(b => b.id === avatarId);
    return found ? `${found.icon} ${found.id}` : `[ALPHA]`;
  }

  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================

  bindEvents() {
    this.container.querySelector('#btn-dismiss-feedback')?.addEventListener('click', () => {
      this.feedback = null;
      this.render();
    });

    this.container.querySelector('#tab-auth-register')?.addEventListener('click', () => {
      sound.playClick();
      this.authMode = 'register';
      this.render();
    });
    this.container.querySelector('#tab-auth-login')?.addEventListener('click', () => {
      sound.playClick();
      this.authMode = 'login';
      this.render();
    });

    this.container.querySelector('#btn-toggle-auth-pin')?.addEventListener('click', () => {
      this.showPin = !this.showPin;
      const pinInput = this.container.querySelector('#input-auth-pin');
      if (pinInput) pinInput.type = this.showPin ? 'text' : 'password';
      const btn = this.container.querySelector('#btn-toggle-auth-pin');
      if (btn) btn.textContent = this.showPin ? 'Hide' : 'Show';
    });

    this.container.querySelectorAll('.avatar-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sound.playClick();
        this.selectedAvatar = chip.dataset.avatar || 'ALPHA';
        this.container.querySelectorAll('.avatar-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    });

    this.container.querySelector('#btn-submit-auth')?.addEventListener('click', async () => {
      sound.playClick();
      const usernameInput = this.container.querySelector('#input-auth-username');
      const pinInput = this.container.querySelector('#input-auth-pin');
      const displayInput = this.container.querySelector('#input-auth-display');

      const username = usernameInput ? usernameInput.value : '';
      const pin = pinInput ? pinInput.value : '';
      const display = displayInput ? displayInput.value : username;

      if (this.authMode === 'register') {
        const res = await socialClient.register(username, display, pin, this.selectedAvatar);
        if (res.success) {
          this.setFeedback('success', res.message || 'Profile created successfully!');
          await this.loadLeaderboards();
          this.render();
        } else {
          this.setFeedback('error', res.error || 'Failed to register profile.');
        }
      } else {
        const res = await socialClient.loginWithPin(username, pin);
        if (res.success) {
          this.setFeedback('success', res.message || 'Logged in successfully!');
          await this.loadLeaderboards();
          this.render();
        } else {
          this.setFeedback('error', res.error || 'Login failed.');
        }
      }
    });

    this.container.querySelectorAll('.social-tab-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        sound.playClick();
        this.activeTab = btn.dataset.tab;
        if (this.activeTab === 'friends' && (!this.cachedFriends || this.cachedFriends.length === 0)) {
          await this.loadLeaderboards();
        }
        if (this.activeTab === 'global' && (!this.cachedGlobal || this.cachedGlobal.length === 0)) {
          await this.loadLeaderboards();
        }
        this.render();
      });
    });

    this.container.querySelector('#btn-social-sync-now')?.addEventListener('click', async () => {
      sound.playClick();
      const res = await socialClient.syncStats();
      if (res.success) {
        this.setFeedback('success', 'Latest study metrics synchronized to Supabase cloud!');
        await this.loadLeaderboards();
      } else {
        this.setFeedback('error', 'Sync failed: ' + (res.error || 'Could not reach server.'));
      }
    });

    this.container.querySelector('#btn-open-config-tab')?.addEventListener('click', () => {
      sound.playClick();
      this.activeTab = 'config';
      this.render();
    });

    this.container.querySelector('#btn-social-logout')?.addEventListener('click', () => {
      sound.playClick();
      if (confirm('Log out from social cloud profile?')) {
        socialClient.logout();
        this.setFeedback('info', 'Logged out.');
        this.render();
      }
    });

    const copyHandler = async () => {
      sound.playClick();
      const code = socialClient.getFriendCode();
      if (code && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        this.setFeedback('success', `Copied Friend Code ${code} to clipboard!`);
      } else if (code) {
        prompt('Copy your friend code:', code);
      }
    };
    this.container.querySelector('#btn-copy-friend-code')?.addEventListener('click', copyHandler);
    this.container.querySelector('#btn-copy-code-direct')?.addEventListener('click', copyHandler);

    this.container.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', async () => {
        sound.playClick();
        this.globalFilter = pill.dataset.filter;
        await this.loadGlobalBoard();
        this.render();
      });
    });

    this.container.querySelector('#btn-refresh-friends')?.addEventListener('click', async () => {
      sound.playClick();
      await this.loadFriendsBoard();
      this.render();
    });
    this.container.querySelector('#btn-refresh-global')?.addEventListener('click', async () => {
      sound.playClick();
      await this.loadGlobalBoard();
      this.render();
    });

    this.container.querySelector('#btn-submit-add-friend')?.addEventListener('click', async () => {
      sound.playClick();
      const input = this.container.querySelector('#input-friend-search');
      const val = input ? input.value : '';
      const res = await socialClient.addFriend(val);
      if (res.success) {
        this.setFeedback('success', res.message || 'Friend added!');
        if (input) input.value = '';
        await this.loadFriendsBoard();
        this.render();
      } else {
        this.setFeedback('error', res.error || 'Could not add friend.');
      }
    });

    this.container.querySelectorAll('[data-add-username]').forEach(btn => {
      btn.addEventListener('click', async () => {
        sound.playClick();
        const uname = btn.dataset.addUsername;
        const res = await socialClient.addFriend(uname);
        if (res.success) {
          this.setFeedback('success', res.message || 'Friend added!');
          await this.loadFriendsBoard();
          await this.loadGlobalBoard();
          this.render();
        } else {
          this.setFeedback('error', res.error || 'Could not add friend.');
        }
      });
    });

    this.container.querySelectorAll('[data-remove-friend]').forEach(btn => {
      btn.addEventListener('click', async () => {
        sound.playClick();
        const uname = btn.dataset.removeFriend;
        if (confirm(`Remove @${uname} from your friends?`)) {
          const res = await socialClient.removeFriend(uname);
          if (res.success) {
            this.setFeedback('info', res.message);
            await this.loadFriendsBoard();
            this.render();
          }
        }
      });
    });

    this.container.querySelector('#btn-goto-add-friends')?.addEventListener('click', () => {
      sound.playClick();
      this.activeTab = 'add';
      this.render();
    });

    // Profile Inspection Trigger
    this.container.querySelectorAll('[data-inspect-username]').forEach(el => {
      el.addEventListener('click', async (e) => {
        e.stopPropagation();
        sound.playClick();
        const uname = el.dataset.inspectUsername;
        if (!uname) return;

        // Fetch read-only profile
        const profile = await socialClient.getFriendProfile(uname);
        if (profile) {
          this.inspectingUser = profile;
          this.render();
        }
      });
    });

    // Close Inspection Modal
    this.container.querySelector('#btn-close-inspect-modal')?.addEventListener('click', () => {
      this.inspectingUser = null;
      this.render();
    });
    this.container.querySelector('#btn-inspect-close')?.addEventListener('click', () => {
      this.inspectingUser = null;
      this.render();
    });
    this.container.querySelector('#inspect-modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'inspect-modal-backdrop') {
        this.inspectingUser = null;
        this.render();
      }
    });

    // Add friend from inspection modal
    this.container.querySelector('#btn-inspect-add-friend')?.addEventListener('click', async (e) => {
      sound.playClick();
      const uname = e.currentTarget.dataset.addUsername;
      const res = await socialClient.addFriend(uname);
      if (res.success) {
        this.setFeedback('success', res.message);
        this.inspectingUser = null;
        await this.loadFriendsBoard();
        this.render();
      }
    });

    // Supabase Credentials Save
    this.container.querySelector('#btn-save-supabase-creds')?.addEventListener('click', async () => {
      sound.playClick();
      const urlInput = this.container.querySelector('#input-supabase-url');
      const keyInput = this.container.querySelector('#input-supabase-key');
      socialClient.setUrl(urlInput ? urlInput.value : '');
      socialClient.setAnonKey(keyInput ? keyInput.value : '');
      this.setFeedback('success', 'Supabase credentials saved locally!');
      await this.loadLeaderboards();
      this.render();
    });

    // Test Supabase Connection
    this.container.querySelector('#btn-test-supabase-conn')?.addEventListener('click', async () => {
      sound.playClick();
      this.setFeedback('info', 'Testing Supabase REST connection...');
      const diag = await socialClient.testConnection();
      if (diag.ok) {
        this.setFeedback('success', diag.message);
      } else {
        this.setFeedback('error', diag.message);
      }
    });

    // Copy SQL DDL
    this.container.querySelector('#btn-copy-supabase-sql')?.addEventListener('click', async () => {
      sound.playClick();
      const sql = socialClient.getSupabaseSqlSchema();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sql);
        this.setFeedback('success', 'supabase_setup.sql copied to clipboard! Paste into Supabase SQL editor.');
      } else {
        prompt('Copy Supabase SQL Setup:', sql);
      }
    });

    // Clear Credentials
    this.container.querySelector('#btn-clear-supabase-creds')?.addEventListener('click', async () => {
      sound.playClick();
      socialClient.setUrl('');
      socialClient.setAnonKey('');
      this.setFeedback('info', 'Supabase credentials cleared. Switched to Mock Sandbox.');
      await this.loadLeaderboards();
      this.render();
    });

    // Change PIN
    this.container.querySelector('#btn-submit-change-pin')?.addEventListener('click', async () => {
      sound.playClick();
      const oldInput = this.container.querySelector('#input-change-old-pin');
      const newInput = this.container.querySelector('#input-change-new-pin');
      const oldPin = oldInput ? oldInput.value : '';
      const newPin = newInput ? newInput.value : '';
      const res = await socialClient.changePin(oldPin, newPin);
      if (res.success) {
        this.setFeedback('success', res.message || 'Security PIN updated successfully!');
        if (oldInput) oldInput.value = '';
        if (newInput) newInput.value = '';
      } else {
        this.setFeedback('error', res.error || 'Failed to update PIN.');
      }
    });

    // Toggle PIN lock
    this.container.querySelector('#btn-toggle-pin-lock')?.addEventListener('click', () => {
      sound.playClick();
      const current = socialClient.isPinLockEnabled();
      socialClient.setPinLockEnabled(!current);
      this.setFeedback('info', `In-App Privacy Lock ${!current ? 'Enabled' : 'Disabled'}.`);
      this.render();
    });
  }

  async loadLeaderboards() {
    await Promise.all([
      this.loadFriendsBoard(),
      this.loadGlobalBoard()
    ]);
  }

  async loadFriendsBoard() {
    this.cachedFriends = await socialClient.getFriendsLeaderboard();
  }

  async loadGlobalBoard() {
    this.cachedGlobal = await socialClient.getGlobalLeaderboard(50, this.globalFilter);
  }
}
