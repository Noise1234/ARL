# ARL — Minimalist Keyboard-First Language Learning PWA & Android App

**ARL** is an ultra-minimalist, distraction-free Progressive Web App (PWA) and native Android application designed for deep focus, deterministic SM-2 spaced repetition, and comprehensive German & English grammar mastery across CEFR levels **A1, A2, B1, and B2**.

[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK%20(v2.2.0)-black?style=for-the-badge&logo=android)](https://github.com/Noise1234/ARL/raw/main/dist/ARL-v2.2.0.apk)

### 📥 Direct Downloads
- **Android APK v2.2.0 (Latest Release)**: [Download ARL-v2.2.0.apk](https://github.com/Noise1234/ARL/raw/main/dist/ARL-v2.2.0.apk) (5.9 MB, signed release containing all 6,106 words & 1,400 grammar drills)
- **Direct Local/Web Endpoint**: [http://localhost:3000/apk](http://localhost:3000/apk)
- **Permanent Mirror**: [Download ARL-v2.0.apk](https://github.com/Noise1234/ARL/raw/main/dist/ARL-v2.0.apk)
- **GitHub Repository**: [Noise1234/ARL](https://github.com/Noise1234/ARL)

---

## ✦ Key Features

### 1. 20-Sentence Grammar Practice Engine & Contextual Wörterbuch
- **1,400 Drills Across All 70 Topics:** Every German topic (50 topics, 1,000 drills) and English topic (20 topics, 400 drills) features 20 interactive practice sentences with Cyrillic Mongolian prompts.
- **Contextual Mini-Wörterbuch:** Every practice sentence includes an inline vocabulary helper box displaying exact root words, gender-coded German articles (`der/die/das`), and verb infinitives.
- **Revealable Answer Breakdown:** Reveal target sentences with word-for-word literal and natural Mongolian translations, plus a 1-sentence breakdown of why the grammar rule applies.
- **Color-Coded Mistake & Word-Order Diff:** Visual error feedback highlighting spelling/conjugation/case errors in **Red** (`.diff-error`), syntax/word-order misplacements in **Blue** (`.diff-misplaced`), and correct structure in **Green** (`.diff-correct`).

### 2. Persistent Smart Notes & Floating Grammar PiP
- **Smart Note Workspace ([N]otes):** Persistent multi-note notebook with auto-save to `localStorage`, special character quick chips, and a text-selection floating toolbar to instantly ask the AI for explanations or sentence evaluation.
- **Minimizable 3-State Grammar PiP ([P]iP):** Floating, draggable grammar reference window with 3 states: **Full View**, **Minimized Dock** (read rules while writing notes or practicing), and **Completely Hidden** (`display: none`).

### 3. Dual Theme, Responsive Navigation & Lexicon Pagination
- **Modern High-Contrast Dashboard:** Dual dark and light theme with tactile micro-interactions and smooth transitions.
- **Mobile Bottom Navigation:** Fixed bottom nav bar for swift one-thumb switching on smartphones, with tablet landscape split-view support.
- **Lexicon Pagination & CEFR Filtering:** Full vocabulary browser with CEFR level filters (`All`, `A1`, `A2`, `B1`, `B2`) and 50-words-per-page pagination across 6,106 verified items (German: 3,046 words; English: 3,060 words).

### 4. Tactile Keyboard-First Study & SRS Flashcards
- **Pure SM-2 Spaced Repetition:** Deterministic scheduling with interval progression, ease factors, and lapse tracking.
- **Morphological Verb Grid:** On card reveal, verbs display a 4-part chip grid: Infinitiv, 3.P. Präsens, Präteritum, and Partizip II with auxiliary highlight (*hat* vs *ist*), plus case valency badges.
- **Dedicated Memory & Imprint Studio ([M]emorize):** Active visual encoding matrix with 3D card flips, real-time retention rate analytics (% memorized), and 1-click Fast Imprint (+15 EXP).
- **Speed Imprint Sprint Mode:** Automated high-velocity flashcard imprinting with native speech audio pronunciation, 3.5s countdown timer, and streak multipliers.
- **Active Recall Quiz Mode ([Q]uiz):** Fast 4-option multiple-choice drill with keyboard bindings <kbd>1</kbd>–<kbd>4</kbd>, tactile color feedback, and Dopamine EXP rewards.

### 5. Native Android Container & Standalone PWA
- **Android App:** Built via automated toolchain (AAPT, D8/R8, zipalign, apksigner) into a signed, 4-byte aligned native APK.
- **Offline PWA:** Fully cached with Service Worker (`sw.js` v3.0) for 100% offline functionality.

---

## ⌨ Keyboard Navigation Reference

| Key | Global Navigation | Active Mode Action |
|---|---|---|
| <kbd>V</kbd> | [V] Vocab (Flashcards) | Study & SRS review |
| <kbd>M</kbd> | [M] Memorize Studio | Visual Matrix & Retention Gauge |
| <kbd>Q</kbd> | [Q] Quiz Mode | Active Recall 4-option MCQs |
| <kbd>L</kbd> | [L] Lexicon Browser | Word search & POS filters |
| <kbd>G</kbd> | [G] Grammar Library | Rules & 20-Sentence Drills |
| <kbd>N</kbd> | [N] Smart Notes | Study notes & AI selection toolbar |
| <kbd>P</kbd> | [P] Floating PiP | Toggle Grammar Picture-in-Picture |
| <kbd>I</kbd> | [I] Immersion Media | Curated reading & listening |
| <kbd>S</kbd> | [S] Settings | Settings modal & API configuration |
| <kbd>Space</kbd> | — | Flip card / Pause sprint / Reveal |
| <kbd>1</kbd>–<kbd>4</kbd> | — | SRS grading (1-4) or Quiz options |
| <kbd>Enter</kbd> | — | Reveal card or Mark Memorized (+15 EXP) |
| <kbd>?</kbd> | Help Cheat Sheet | Toggle keyboard reference |

---

## 🛠 Project Structure

```
/root/arl/
├── index.html              # PWA Shell
├── manifest.json           # Web App Manifest (standalone, theme #000000)
├── sw.js                   # Service Worker (offline-first caching)
├── server.js               # Lightweight HTTP server
├── package.json            # Scripts & metadata
├── icons/                  # Globe branding icons (SVG + PNG 192/512)
├── css/
│   ├── base.css            # Minimalist theme, design tokens, buttons
│   ├── components.css      # 3D flashcards, quiz grid, retention overlay
│   └── animations.css      # Micro-interactions & transitions
├── js/
│   ├── app.js              # Application orchestrator
│   ├── db.js               # IndexedDB persistence layer & backup import/export
│   ├── state.js            # State store, streak logic & retention gate rules
│   ├── diff.js             # Color-coded error and word-order diff engine
│   ├── grammar-pip.js      # Floating minimizable 3-state Picture-in-Picture drawer
│   ├── views/              # View controllers (Study, Memorize, Quiz, Lexicon, Grammar, Notes, HUD)
│   └── manual-entry.js     # Modal for adding custom words
├── data/
│   ├── de/                 # German A1-B2 vocabulary & 50-topic 20-drill grammar
│   └── en/                 # English A1-B2 vocabulary & 20-topic 20-drill grammar
├── dist/
│   ├── ARL-v2.2.0.apk      # Latest signed native Android container
│   └── ARL-v2.0.apk        # Permanent signed release mirror
├── scripts/
│   └── package_apk.py      # Automated APK packager, aligner & signer
└── test/
    ├── run-tests.js        # Main test runner (85 automated tests)
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
