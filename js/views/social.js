/**
 * ARL - PIN-Protected "Friends & Leaderboard" Cloud Social View ([F])
 * Typographic minimalist monochrome design system with zero OS emojis in navigation.
 * Bento-style profile cards, Top 3 Podiums, Global/Friends Leaderboards,
 * Add Friend workflow, and Supabase REST diagnostics with PIN security.
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
    this.isLoading = false;

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
                    maxlength="20"
                    autocomplete="username"
                    required
                  />
                </div>
                <span class="field-hint">3-20 characters: letters, numbers, and underscores only.</span>
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
                <span class="field-hint">Hashed with SHA-256 before transit. Never stored in plain text.</span>
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
            <span>Cryptographic SHA-256 verification protects your leaderboard identity on Supabase REST.</span>
          </div>

        </div>
      </div>
    `;
  }

  /**
   * Renders Authenticated Social Dashboard:
   * Profile Bento Header, Tabs, Podiums, Table, Friend Management, and PIN Security.
   */
  renderAuthenticatedSocial(profile) {
    const friendCode = socialClient.getFriendCode();
    const friendsCount = socialClient.getFriends().length;

    return `
      <div class="social-dashboard-layout">
        
        <!-- User Profile Hero Bento -->
        <section class="social-hero-bento">
          <div class="hero-left-col">
            <div class="hero-avatar-badge" title="Monospace Avatar">${this.getAvatarGlyph(profile.avatar)}</div>
            <div class="hero-user-details">
              <div class="hero-name-row">
                <h3 class="hero-display-name">${this.escape(profile.displayName || profile.username)}</h3>
                <span class="hero-username font-mono">@${profile.username}</span>
              </div>
              <p class="hero-status-message">${this.escape(profile.statusMessage || 'ARL Minimalist Learner')}</p>
              
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
              <span class="metric-val font-mono">${profile.level || 1}</span>
              <span class="metric-label">Level</span>
            </div>
            <div class="metric-card">
              <span class="metric-val font-mono">${(profile.totalExp || 0).toLocaleString()}</span>
              <span class="metric-label">Total EXP</span>
            </div>
            <div class="metric-card">
              <span class="metric-val font-mono">${profile.streak || 0}d</span>
              <span class="metric-label">Streak</span>
            </div>
            <div class="metric-card">
              <span class="metric-val font-mono">${profile.cardsLearned || 0}</span>
              <span class="metric-label">Learned</span>
            </div>
            <div class="metric-card">
              <span class="metric-val font-mono">${Math.round((profile.studyTimeSeconds || 0) / 3600 * 10) / 10}h</span>
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

  /**
   * Dispatches active tab rendering.
   */
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
            <span class="tab-subtitle">Rankings among you and your added study peers</span>
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
                  <th class="th-track">Track</th>
                  <th class="th-streak">Streak</th>
                  <th class="th-exp">Total EXP</th>
                  <th class="th-level">Level</th>
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
            <p class="empty-desc">Add study partners by their @handle or Friend Code to see their daily rankings and progress here!</p>
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
            <span class="tab-subtitle">Top language masters worldwide by accumulated EXP</span>
          </div>

          <!-- Language Track Filter -->
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
                  <th class="th-track">Track</th>
                  <th class="th-streak">Streak</th>
                  <th class="th-exp">Total EXP</th>
                  <th class="th-level">Level</th>
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
        
        <!-- Search and Add Friend Card -->
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

          <!-- My Shareable Code Box -->
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

        <!-- Recommended Study Partners Bento -->
        <div class="recommended-partners-card">
          <div class="card-title-group">
            <h4 class="sub-section-title">Recommended Study Partners</h4>
            <span class="tab-subtitle">Quickly connect with active community language learners</span>
          </div>

          <div class="recommended-grid">
            ${mockLearners.slice(0, 6).map(learner => {
              const isAlreadyFriend = socialClient.isFriend(learner.username);
              return `
                <div class="recommended-user-card">
                  <div class="rec-avatar-col">
                    <span class="rec-avatar font-mono">${this.getAvatarGlyph(learner.avatar)}</span>
                  </div>
                  <div class="rec-info-col">
                    <div class="rec-name-row">
                      <strong>${this.escape(learner.display_name)}</strong>
                      <span class="rec-handle font-mono">@${learner.username}</span>
                    </div>
                    <div class="rec-stats-row font-mono">
                      <span>Lv.${learner.level}</span> ·
                      <span>${(learner.total_exp || 0).toLocaleString()} EXP</span> ·
                      <span>${learner.streak}d 🔥</span>
                    </div>
                  </div>
                  <div class="rec-action-col">
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
        
        <!-- Supabase Cloud Credentials Card -->
        <div class="config-card">
          <div class="card-title-group">
            <h3 class="tab-section-title">Supabase REST Cloud Configuration</h3>
            <span class="tab-subtitle">Connect your personal or community Supabase project for decentralized persistence</span>
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
              <span class="field-hint">Found under Supabase Dashboard -> Settings -> API -> Project URL</span>
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
              <span class="field-hint">Found under Supabase Dashboard -> Settings -> API -> Project API keys (anon public)</span>
            </div>

            <div class="config-actions-row">
              <button type="button" class="btn-primary touch-target" id="btn-save-supabase-creds">
                [Save Credentials]
              </button>
              <button type="button" class="btn-test-conn touch-target" id="btn-test-supabase-conn">
                [🩺 Test Connection]
              </button>
              <button type="button" class="btn-copy-sql touch-target" id="btn-copy-supabase-sql">
                [📋 Copy PostgreSQL DDL Script]
              </button>
              ${isConfigured ? `
                <button type="button" class="btn-clear-key touch-target" id="btn-clear-supabase-creds">
                  Disconnect (Use Mock Sandbox)
                </button>
              ` : ''}
            </div>

          </form>
        </div>

        <!-- Security & PIN Management Card -->
        <div class="config-card">
          <div class="card-title-group">
            <h3 class="tab-section-title">PIN Security & Profile Settings</h3>
            <span class="tab-subtitle">Update your 4-8 digit security PIN or toggle privacy lock</span>
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

          <!-- In-App PIN Lock Option -->
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
  // HELPER RENDERING METHODS
  // ==========================================

  renderPodiumCard(learner, rank) {
    const isGold = rank === 1;
    const isSilver = rank === 2;
    const isBronze = rank === 3;
    const rankLabel = isGold ? '#1 GOLD' : isSilver ? '#2 SILVER' : '#3 BRONZE';
    const podiumClass = isGold ? 'podium-gold' : isSilver ? 'podium-silver' : 'podium-bronze';

    return `
      <div class="podium-card ${podiumClass} ${learner.isCurrentUser ? 'current-user-card' : ''}">
        <div class="podium-rank-badge font-mono">[${rankLabel}]</div>
        <div class="podium-avatar font-mono">${this.getAvatarGlyph(learner.avatar)}</div>
        <h4 class="podium-name">${this.escape(learner.display_name || learner.username)} ${learner.isCurrentUser ? '<span class="you-tag">(You)</span>' : ''}</h4>
        <span class="podium-handle font-mono">@${learner.username}</span>
        
        <div class="podium-metrics-strip font-mono">
          <span class="podium-exp">${(learner.total_exp || 0).toLocaleString()} EXP</span>
          <span class="podium-level">Lv.${learner.level || 1}</span>
          <span class="podium-streak">${learner.streak || 0}d 🔥</span>
        </div>
      </div>
    `;
  }

  renderLeaderboardRow(learner, viewMode) {
    const isCurrent = Boolean(learner.isCurrentUser);
    const isFriend = socialClient.isFriend(learner.username);
    const trackLabel = `[${(learner.target_lang || 'de').toUpperCase()}·${(learner.cefr_level || 'b1').toUpperCase()}]`;

    return `
      <tr class="leaderboard-row ${isCurrent ? 'row-current-user' : ''}">
        <td class="td-rank font-mono">
          <span class="rank-badge ${learner.rank <= 3 ? 'rank-top3' : ''}">#${learner.rank}</span>
        </td>
        <td class="td-learner">
          <div class="learner-cell-group">
            <span class="cell-avatar font-mono">${this.getAvatarGlyph(learner.avatar)}</span>
            <div class="cell-names">
              <span class="cell-display-name">${this.escape(learner.display_name || learner.username)} ${isCurrent ? '<strong class="you-indicator">(You)</strong>' : ''}</span>
              <span class="cell-handle font-mono">@${learner.username}</span>
            </div>
          </div>
        </td>
        <td class="td-track font-mono">${trackLabel}</td>
        <td class="td-streak font-mono">${learner.streak || 0}d</td>
        <td class="td-exp font-mono">${(learner.total_exp || 0).toLocaleString()}</td>
        <td class="td-level font-mono">Lv.${learner.level || 1}</td>
        <td class="td-action">
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
    // 1. Dismiss feedback
    this.container.querySelector('#btn-dismiss-feedback')?.addEventListener('click', () => {
      this.feedback = null;
      this.render();
    });

    // 2. Auth tabs toggle (Register vs Login)
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

    // 3. Toggle PIN visibility
    this.container.querySelector('#btn-toggle-auth-pin')?.addEventListener('click', () => {
      this.showPin = !this.showPin;
      const pinInput = this.container.querySelector('#input-auth-pin');
      if (pinInput) pinInput.type = this.showPin ? 'text' : 'password';
      const btn = this.container.querySelector('#btn-toggle-auth-pin');
      if (btn) btn.textContent = this.showPin ? 'Hide' : 'Show';
    });

    // 4. Avatar chip selection
    this.container.querySelectorAll('.avatar-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sound.playClick();
        this.selectedAvatar = chip.dataset.avatar || 'ALPHA';
        this.container.querySelectorAll('.avatar-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    });

    // 5. Submit Auth (Register or Login)
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

    // 6. Navigation tabs (Friends, Global, Add, Config)
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

    // 7. Hero action buttons
    this.container.querySelector('#btn-social-sync-now')?.addEventListener('click', async () => {
      sound.playClick();
      const res = await socialClient.syncStats();
      if (res.success) {
        this.setFeedback('success', 'Latest EXP and study metrics synchronized to cloud!');
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

    // 8. Copy friend code
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

    // 9. Global filter pills
    this.container.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', async () => {
        sound.playClick();
        this.globalFilter = pill.dataset.filter;
        await this.loadGlobalBoard();
        this.render();
      });
    });

    // 10. Refresh buttons
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

    // 11. Add friend form submit
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

    // 12. Quick add from recommendations & table
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

    // 13. Remove friend
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

    // 14. Go to add friends empty state button
    this.container.querySelector('#btn-goto-add-friends')?.addEventListener('click', () => {
      sound.playClick();
      this.activeTab = 'add';
      this.render();
    });

    // 15. Config: Save Supabase Credentials
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

    // 16. Config: Test Supabase Connection
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

    // 17. Config: Copy SQL DDL
    this.container.querySelector('#btn-copy-supabase-sql')?.addEventListener('click', async () => {
      sound.playClick();
      const sql = socialClient.getSupabaseSqlSchema();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sql);
        this.setFeedback('success', 'PostgreSQL setup DDL copied to clipboard! Paste in Supabase SQL editor.');
      } else {
        prompt('Copy Supabase SQL Setup:', sql);
      }
    });

    // 18. Config: Clear credentials
    this.container.querySelector('#btn-clear-supabase-creds')?.addEventListener('click', async () => {
      sound.playClick();
      socialClient.setUrl('');
      socialClient.setAnonKey('');
      this.setFeedback('info', 'Supabase credentials cleared. Switched to Mock Sandbox.');
      await this.loadLeaderboards();
      this.render();
    });

    // 19. Config: Change PIN
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

    // 20. Config: Toggle PIN Lock
    this.container.querySelector('#btn-toggle-pin-lock')?.addEventListener('click', () => {
      sound.playClick();
      const current = socialClient.isPinLockEnabled();
      socialClient.setPinLockEnabled(!current);
      this.setFeedback('info', `In-App Privacy Lock ${!current ? 'Enabled' : 'Disabled'}.`);
      this.render();
    });
  }

  // ==========================================
  // DATA FETCHING
  // ==========================================

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
