# ARL — Minimalist B1 German-to-Mongolian PWA

**ARL** is an ultra-minimalist, distraction-free Progressive Web App (PWA) designed for deep focus and high-retention vocabulary mastery at the Goethe-Zertifikat B1 intermediate level.

---

## ✦ Key Features

### 1. App Identity & Minimalist Aesthetic
- **Minimalist Palette:** Pure OLED black (`#000000`), subtle charcoal card surfaces (`#121212`), crisp off-white typography, and minimal semantic feedback accents (muted emerald green for correct, soft coral red for incorrect).
- **Brand Icon:** Geometric minimalist white globe centered on pure black background (`#000000`), provided as SVG, 192×192 PNG, 512×512 PNG, and maskable icons.
- **Home Screen Installable:** Fully configured `manifest.json` and `sw.js` for 100% offline access.

### 2. Comprehensive B1 Vocabulary (1,000 Verified Words)
- **Official B1 Standard:** 1,000 authentic intermediate words organized across 10 modular thematic modules.
- **Strict Exclusion Rule:** 0% basic A1 stopwords (*sein, haben, werden, ich, du, er, der, die, das*, etc.). Focus strictly on high-value intermediate vocabulary.
- **Accurate Mongolian (Cyrillic Script):** Verified modern Mongolian translations with part-of-speech context.
- **Articles & Plurals:** Every German noun includes its definite article (*der, die, das*) and plural form (e.g. *die Entscheidung, -en*).
- **Bilingual Example Sentences:** Real-world B1 context sentence in German with Mongolian translation.

### 3. Core Active Recall Learning Flows
1. **Daily Opening Retention Gate (Yesterday's Words Check):**
   - Automatically checks if words were studied on previous days.
   - Launches a focused 5–10 word multiple-choice check before unlocking new words.
2. **Tactile 3D Flashcard Memorization (Deutsch → Mongolisch):**
   - Front: German word, article, plural, part-of-speech badge, and context sentence.
   - Back: Modern Mongolian translation (Cyrillic) and translated sentence.
   - Controls: Tap / Click / <kbd>Space</kbd> to flip, <kbd>1</kbd> / <kbd>←</kbd> for "Noch lernen", <kbd>2</kbd> / <kbd>→</kbd> for "Gemerkt".
   - Touch & Swipe: Drag card to swipe left (learning) or right (memorized) with natural tilt physics.
3. **Post-Study Reverse Exam (Mongolian → Deutsch):**
   - Triggers immediately after completing a flashcard batch (or on demand).
   - Prompt: 1 word in **Mongolian**.
   - 4 Options: 1 correct German word + 3 smart distractors from the B1 database.
   - Keyboard: Instant selection with number keys <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd>.
   - Instant visual feedback and auto-requeuing of missed words until 100% mastery.

### 4. Gamification & User Features
- **Daily Streak Counter:** Minimal header counter (`⚡ X Tage`), persisted in IndexedDB, incremented on daily completion.
- **Manual In-App Word Entry:** Add custom words anytime with article, plural, POS, and Mongolian translation.
- **Offline Storage & Backup:** Complete IndexedDB storage with JSON export and import capabilities.
- **Vocabulary Explorer & Dictionary:** Instant search and filter across all 1,000 words.

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
