# ARL — Minimalist Keyboard-First Language Learning PWA & Android App

**ARL** is an ultra-minimalist, distraction-free Progressive Web App (PWA) and native Android application designed for deep focus, deterministic SM-2 spaced repetition, and comprehensive German & English grammar mastery across CEFR levels **A1, A2, B1, and B2**.

[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK%20(v2.0)-black?style=for-the-badge&logo=android)](dist/ARL-v2.0.apk)

### 📥 Direct Downloads
- **Android APK**: [Download ARL-v2.0.apk](dist/ARL-v2.0.apk) (1.9 MB, signed release)
- **GitHub Releases**: [Latest Release v2.0.0](https://github.com/Noise1234/ARL/releases/latest)

---

## ✦ Key Features

### 1. Comprehensive Level-Specific Grammar Engine (A1 – B2)
- **A1 Foundations (9 Topics):** Hauptsatz & V2 rule, Nominativ/Akkusativ, Präsens conjugation, Modal verbs, W-Fragen & Ja/Nein-Inversion, Trennbare Verben, Possessivartikel, Negation (*nicht* vs *kein*), and Imperativ.
- **A2 Core Structures (9 Topics):** Dativ case governance, Perfekt (*haben* vs *sein*), Präteritum, Wechselpräpositionen, Reflexive Verben, Komparativ & Superlativ, *weil* & *dass* subclauses, Double Object order, and fixed preposition rhythms.
- **B1 Intermediate Mastery (22 Topics):** Vorgangspassiv, Konjunktiv II, Relativsätze, Infinitiv mit *zu*, *um...zu* vs *damit*, Position 0 vs 1 connectors, Adjektivdeklination Types 1–3, Prepositional verbs, Pronominaladverbien (*woran/daran*), and Doppelinfinitiv.
- **B2 Advanced Precision (10 Topics):** Tekamolo word order, Zweiteilige Konnektoren, Nomen-Verb-Verbindungen with fixed prepositions, Zustandspassiv, Plusquamperfekt & Futur, Erweiterte Partizipialattribute (Partizip I & II), Konjunktiv I & Indirect Discourse, Passiversatzformen (*sich lassen*, *sein + zu*), and Subjektive Modalverben (Epistemic modality).
- **Direct Rule-to-Drill Action:** Press <kbd>D</kbd> inside any grammar rule to instantly jump into active flashcards drilling that exact concept.
- **Live Search Filter:** Press <kbd>/</kbd> to instantly search grammar rules, cases, and patterns.

### 2. Tactile Keyboard-First Study & SRS Flashcards
- **Pure SM-2 Spaced Repetition:** Deterministic scheduling with interval progression, ease factors, and lapse tracking.
- **Morphological Verb Grid:** On card reveal, verbs display a 4-part chip grid: Infinitiv, 3.P. Präsens, Präteritum, and Partizip II with auxiliary highlight (*hat* vs *ist*), plus case valency badges.
- **Batch Progress Strip:** Tactile progress bar reflecting remaining cards in current study queue.
- **Physical Keypress Feedback:** Interactive keycap indicators visibly depress with micro-animations when hardware keys are pressed.
- **Surgical Momentum HUD:** Clean typographic ticker (`⚡ streak · response velocity`) with zero gamification bloat.

### 3. Native Android Container & Standalone PWA
- **Android App:** Built via automated toolchain (AAPT, D8/R8, zipalign, apksigner) into a lean 1.9MB native APK.
- **Offline PWA:** Fully cached with Service Worker for 100% offline functionality.

---

## ⌨ Keyboard Navigation Reference

| Key | Flashcard Mode | Reverse Exam / Retention Mode |
|---|---|---|
| <kbd>Space</kbd> | Karte umdrehen (3D-Flip) | — |
| <kbd>1</kbd> | Noch lernen (↺) | Option 1 auswählen |
| <kbd>2</kbd> | Gemerkt (✓) | Option 2 auswählen |
| <kbd>3</kbd> | — | Option 3 auswählen |
| <kbd>4</kbd> | — | Option 4 auswählen |
| <kbd>←</kbd> | Noch lernen | — |
| <kbd>→</kbd> | Gemerkt | — |

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
│   ├── deck.js             # 3D tactile flashcard controller with swipe & keyboard
│   ├── quiz.js             # 4-option active recall MCQ engine
│   ├── retention.js        # Daily Opening Retention Gate
│   └── manual-entry.js     # Modal for adding custom words
├── data/
│   ├── b1_words.json       # Master 1,000 verified B1 words
│   └── modules/            # 10 modular thematic JSON modules (100 words each)
├── scripts/
│   ├── build-dataset.py    # Vocabulary builder
│   ├── compile_dataset.py  # Dataset compiler & verification script
│   └── generate-icons.py   # SVG/PNG icon generator
└── test/
    └── run-tests.js        # Automated test suite (16 tests)
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
