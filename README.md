# ARL — Minimalist Keyboard-First Language Learning PWA & Android App

**ARL** is an ultra-minimalist, distraction-free Progressive Web App (PWA) and native Android application designed for deep focus, deterministic SM-2 spaced repetition, and comprehensive German & English grammar mastery across all CEFR levels **A1, A2, B1, B2, C1, and C2**.

[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK%20(v3.0.0)-black?style=for-the-badge&logo=android)](https://github.com/Noise1234/ARL/raw/main/dist/ARL-v3.0.0.apk)
[![Web PWA](https://img.shields.io/badge/PWA-Local--First%20Offline-black?style=for-the-badge&logo=pwa)](http://localhost:3000)

### 📥 Direct Downloads & Links
- **Android APK v3.0.0 (Latest Signed Release)**: [Download ARL-v3.0.0.apk from GitHub](https://github.com/Noise1234/ARL/raw/main/dist/ARL-v3.0.0.apk) (11.6 MB, cryptographically signed with v1/v2/v3 schemes, 4-byte aligned, containing all 7,506 verified words & 92 A1–C2 grammar topics)
- **GitHub Repository File View**: [View dist/ARL-v3.0.0.apk on GitHub](https://github.com/Noise1234/ARL/blob/main/dist/ARL-v3.0.0.apk)
- **Direct Local Server Download**: [http://localhost:3000/apk](http://localhost:3000/apk) (when running locally)
- **Permanent Mirror**: [Download ARL-v2.0.apk](https://github.com/Noise1234/ARL/raw/main/dist/ARL-v2.0.apk)
- **GitHub Repository**: [Noise1234/ARL](https://github.com/Noise1234/ARL)

#### 📱 Android Installation Guide
1. Tap the [Download ARL-v3.0.0.apk](https://github.com/Noise1234/ARL/raw/main/dist/ARL-v3.0.0.apk) link on your Android device (or download via browser).
2. Open the downloaded `.apk` file from your notification bar or Downloads folder.
3. If prompted, allow "Install from unknown sources" for your browser/file manager.
4. Tap **Install** and launch **ARL**. The app operates 100% offline with zero cloud configuration required.

---

## ✦ Key Features

### 1. Comprehensive A1–C2 Grammar Practice & Interactive Drills
- **92 Structured Topics Across German & English:** Complete coverage from foundational A1 to academic/nuanced C2 (German: 6 folders, 61 topics; English: 6 folders, 31 topics).
- **Interactive Practice Drills:** Every topic features interactive practice sentences with Cyrillic Mongolian prompts.
- **Contextual Mini-Wörterbuch:** Every practice sentence includes an inline vocabulary helper box displaying exact root words, gender-coded German articles (`der/die/das`), and verb infinitives.
- **Revealable Answer Breakdown:** Reveal target sentences with word-for-word literal and natural Mongolian translations, plus a breakdown of why the grammar rule applies.
- **Color-Coded Mistake & Word-Order Diff:** Visual error feedback highlighting spelling/conjugation/case errors in **Red** (`.diff-error`), syntax/word-order misplacements in **Blue** (`.diff-misplaced`), and correct structure in **Green** (`.diff-correct`).

### 2. 100% Local-First Architecture & Rebuilt Gist Sync (v2)
- **Zero-Dependency Local-First:** Complete data ownership powered by IndexedDB with structured fallback. 100% free of external backend services or proprietary cloud databases. Startup is instant and the application operates seamlessly 100% offline.
- **Unified Backup Payload (`arl_backup_v2.json`):** Full state serialization including SM-2 progress, streaks, telemetry, and notes with collision defense.
- **GitHub Gist Cloud Sync:** Secret Gist synchronization with real-time PAT validation (`Connected`, `Invalid Token`, `Rate Limited`), conflict prevention with timestamp comparison, and one-click JSON import/export.
- **CSS Toast System:** Clean notification toasts for all sync, backup, and restore events with zero external libraries.

### 3. Tactile Monochrome UI & Visual Mastery Tracking
- **Tactile Micro-Interactions:** Subtle press states (`scale(0.98)`), fluid 3D flashcard flip animations with touch swiping & keyboard shortcuts.
- **Visual Progress & Motivation:** Circular SVG progress ring, animated CEFR mastery progression bars per level (A1–C2), streak indicators, and completion feedback.
- **Modern High-Contrast Dashboard:** Dual dark and light theme adhering to a minimalist monochrome aesthetic.
- **Mobile Bottom Navigation & Responsive Layout:** Fixed bottom nav bar for swift one-thumb switching on smartphones, with tablet landscape split-view support.
- **Lexicon Pagination & CEFR Filtering:** Full vocabulary browser with CEFR level filters (`All`, `A1`, `A2`, `B1`, `B2`, `C1`, `C2`) and 50-words-per-page pagination across 7,506 verified items (German: 3,746 words; English: 3,760 words) with zero duplicate words across all levels.

### 4. Tactile Keyboard-First Study & SRS Flashcards
- **Pure SM-2 Spaced Repetition:** Deterministic scheduling with interval progression, ease factors, and lapse tracking.
- **Morphological Verb Grid:** On card reveal, verbs display a 4-part chip grid: Infinitiv, 3.P. Präsens, Präteritum, and Partizip II with auxiliary highlight (*hat* vs *ist*), plus case valency badges.
- **Dedicated Memory & Imprint Studio ([M]emorize):** Active visual encoding matrix with 3D card flips, real-time retention rate analytics (% memorized), and 1-click Fast Imprint (+15 EXP).
- **Speed Imprint Sprint Mode:** Automated high-velocity flashcard imprinting with native speech audio pronunciation, 3.5s countdown timer, and streak multipliers.
- **Active Recall Quiz Mode ([Q]uiz):** Fast 4-option multiple-choice drill with keyboard bindings <kbd>1</kbd>–<kbd>4</kbd>, tactile color feedback, and EXP rewards.

### 5. Native Android Container & Standalone PWA
- **Android App:** Built via automated toolchain (AAPT, D8/R8, zipalign, apksigner) into a signed, 4-byte aligned native APK (`ARL-v3.0.0.apk`).
- **Offline PWA:** Fully cached with Service Worker (`sw.js` v3.0.0) for 100% offline functionality and immediate cache invalidation on version update.

### 6. v3.0.0 Targeted Polish & Enhancements
- **Intelligent TTS Pronunciation Engine:** Web Speech API integration for German (`de-DE`) and English (`en-US`) with queue cancellation to eliminate audio locks on mobile WebViews, dynamic async `voiceschanged` discovery, clean metadata stripping (`+ Akk`, `+ Dat`, parentheticals, cloze blanks), and subtle `.is-playing` visual pulse states.
- **Complete Trilingual UI Localization (i18n):** 100% complete interface localization with 256 keys across Mongolian (`mn`), English (`en`), and German (`de`), updating all views, dialogs, and mobile navigation bars reactively without page reloads.
- **Strict Monochrome Harmonization:** All grammar cards, formula blocks, status badges, and interactive feedback pills redesigned using semantic monochrome CSS variables, eliminating clashing colors in both Dark and Light themes.
- **Hardware Keyboard Ergonomics for Memorize & Sprint:** Full hardware hotkey support inside the Memory Studio (<kbd>S</kbd> to launch Speed Imprint Sprint, <kbd>Space</kbd> to pause/resume, <kbd>Enter</kbd> / <kbd>M</kbd> to memorize, <kbd>←</kbd> / <kbd>→</kbd> navigation, <kbd>Esc</kbd> exit).
- **Free-form Sentence Sandbox & Linguistic Checker:** Real-time multi-tier syntax verification (Gemini 2.5 Flash, Groq, Pollinations AI, LanguageTool, and Deterministic Offline Rules) with token-level visual diffs, one-tap `[Apply Fix]` / `[Copy]`, and XP rewards.

---

## ⌨ Keyboard Navigation Reference

| Key | Global Navigation | Active Mode Action |
|---|---|---|
| <kbd>V</kbd> | [V] Vocab (Flashcards) | Study & SRS review |
| <kbd>M</kbd> | [M] Memorize Studio | Visual Matrix & Retention Gauge |
| <kbd>Q</kbd> | [Q] Quiz Mode | Active Recall 4-option MCQs |
| <kbd>L</kbd> | [L] Lexicon Browser | Word search & POS filters |
| <kbd>G</kbd> | [G] Grammar Library | Rules & Interactive Drills |
| <kbd>X</kbd> | [X] Stats Bento | Telemetry & Visual Analytics |
| <kbd>P</kbd> | [P] Floating PiP | Toggle Grammar Picture-in-Picture |
| <kbd>I</kbd> | [I] Immersion Media | Curated reading & listening |
| <kbd>S</kbd> | [S] Settings | Settings modal & Gist sync configuration |
| <kbd>+</kbd> / <kbd>=</kbd> | [+] Add Word | Add custom card to active level |
| <kbd>Space</kbd> | — | Flip card / Pause sprint / Reveal |
| <kbd>1</kbd>–<kbd>4</kbd> | — | SRS grading (1-4) or Quiz options |
| <kbd>1</kbd>–<kbd>6</kbd> | — | CEFR level selection (Settings, Grammar, Media) |
| <kbd>Enter</kbd> | — | Reveal card or Mark Memorized (+15 EXP) |
| <kbd>?</kbd> | Help Cheat Sheet | Toggle keyboard reference |

---

## 🛠 Project Structure

```
/root/arl/
├── index.html              # PWA Shell
├── manifest.json           # Web App Manifest (standalone, theme #000000)
├── sw.js                   # Service Worker (offline-first caching v4.0)
├── server.js               # Lightweight HTTP server
├── package.json            # Scripts & metadata
├── icons/                  # Geometric monochrome icon assets (SVG + PNG)
├── css/
│   ├── base.css            # Minimalist theme, design tokens, buttons
│   ├── components.css      # 3D flashcards, quiz grid, sync modal, toasts
│   └── animations.css      # Micro-interactions, scale(0.98), transitions
├── js/
│   ├── app.js              # Application orchestrator
│   ├── db.js               # IndexedDB persistence layer & local export/import
│   ├── sync.js             # Rebuilt GitHub Gist sync engine (v2 payload)
│   ├── toast.js            # Zero-dependency notification toasts
│   ├── state.js            # State store, streak logic, CEFR A1-C2 loader
│   ├── diff.js             # Color-coded error and word-order diff engine
│   ├── grammar-pip.js      # Floating minimizable 3-state Picture-in-Picture drawer
│   ├── views/              # View controllers (Study, Memorize, Quiz, Lexicon, Grammar, HUD, Stats, SyncModal)
│   └── manual-entry.js     # Modal for adding custom words
├── data/
│   ├── de/                 # German A1-C2 vocabulary (3,746 words) & 61 grammar topics
│   └── en/                 # English A1-C2 vocabulary (3,760 words) & 31 grammar topics
├── dist/
│   ├── ARL-v3.0.0.apk      # Signed native Android container
│   └── ARL-v2.0.apk        # Permanent signed release mirror
├── scripts/
│   ├── package_apk.py      # Automated APK packager, aligner & signer
│   └── assemble_lexicon.py # Vocabulary expansion & cross-level deduplication engine
└── test/
    ├── run-tests.js        # Main test runner (143 tests)
    ├── dataset.test.js     # Vocabulary integrity & deduplication verification
    ├── gist-sync-v2.test.js# Gist sync engine v2 & toast test suite
    └── major-upgrade.test.js # Feature verification test suite
```

---

## 🚀 Getting Started

Start the server:
```bash
cd /root/arl
npm start
```
Access the application at `http://localhost:3000`.

Run automated tests:
```bash
npm test
```
Or build/verify:
```bash
npm run build
```

Package & sign Android APK:
```bash
npm run build:apk
```
