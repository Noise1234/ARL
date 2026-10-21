/**
 * ARL - Progressive 3-Stage Contextual Hint Engine
 * Computes progressive active recall cues without spoiling answers.
 * Stage 1: Morphosyntactic & Gender/Class Trigger
 * Stage 2: Rektion, Valency & Stem/Ablaut Shifts
 * Stage 3: Cloze In-Context Scaffold (with initial letter cue)
 */

export function getCardHint(card, stage, targetLang = 'de') {
  if (!card || !stage || stage <= 0) return null;

  if (targetLang === 'de') {
    // Stage 1: Morphosyntactic & Gender/Class Trigger
    if (stage === 1) {
      if (card.pos === 'noun') {
        const art = card.article || 'der/die/das';
        const genderName = art === 'die' ? 'feminin' : (art === 'der' ? 'maskulin' : 'neutral');
        const pluralStr = card.plural ? `Plural: [${card.plural}]` : 'Plural: [-]';
        return {
          stage: 1,
          label: 'Stage 1 · Genus & Form',
          badge: 'GENUS / CLASS',
          text: `Artikel: [${art}] (${genderName}) · ${pluralStr}`
        };
      }

      if (card.pos === 'verb') {
        const isUntrennbar = /^(be|ent|emp|er|ge|ver|zer|miss)/.test(card.word);
        const isTrennbar = /^(ab|an|auf|aus|bei|ein|fest|mit|nach|vor|zu|zurück)/.test(card.word);
        const prefix = isUntrennbar ? 'untrennbar' : (isTrennbar ? 'trennbar' : 'Stammverb');
        const aux = (card.forms && card.forms.includes('ist ')) ? 'Hilfsverb: sein' : 'Hilfsverb: haben';
        const isIrregular = card.forms && (card.forms.includes(' ie ') || card.forms.includes(' a ') || card.forms.includes(' o ') || card.forms.includes(' u '));
        const verbClass = isIrregular ? 'Unregelmäßig (stark)' : 'Regelmäßig (schwach)';
        return {
          stage: 1,
          label: 'Stage 1 · Verb-Struktur',
          badge: 'VERB CLASS',
          text: `${verbClass} · Präfix: [${prefix}] · [${aux}]`
        };
      }

      return {
        stage: 1,
        label: 'Stage 1 · Wortart',
        badge: 'PART OF SPEECH',
        text: `Kategorie: [${card.pos ? card.pos.toUpperCase() : 'VOCAB'}]`
      };
    }

    // Stage 2: Rektion, Valency & Stem/Ablaut Shifts
    if (stage === 2) {
      if (card.pos === 'verb') {
        const rektion = card.rektion ? `Rektion: [${card.rektion}]` : 'Rektion: [transitiv/intransitiv]';
        const forms = card.forms ? `Formen: ${card.forms}` : '';
        return {
          stage: 2,
          label: 'Stage 2 · Rektion & Kasus',
          badge: 'CASE GOVERNANCE',
          text: [rektion, forms].filter(Boolean).join(' · ')
        };
      }

      if (card.pos === 'noun') {
        const genitiveArticle = card.article === 'die' ? 'der' : 'des';
        const genitiveSuffix = (card.article === 'der' || card.article === 'das') ? '-(e)s' : '-';
        const firstLetter = (card.word && card.word.charAt(0)) || '';
        return {
          stage: 2,
          label: 'Stage 2 · Kasus & Kontext',
          badge: 'CASE & TOPIC',
          text: `Genitiv: [${genitiveArticle} ${firstLetter}...${genitiveSuffix}] · Thema: [${card.topic || 'Allgemein'}]`
        };
      }

      return {
        stage: 2,
        label: 'Stage 2 · Rektion & Rhythmus',
        badge: 'VALENCY',
        text: card.rektion ? `Rektion: [${card.rektion}]` : `Thema: [${card.topic || 'Allgemein'}]`
      };
    }

    // Stage 3: Cloze In-Context Scaffold
    if (stage === 3) {
      if (card.example_de) {
        // Mask the target word in the example sentence, showing just the first letter
        const firstLetter = card.word.charAt(0);
        const masked = card.example_de.replace(
          new RegExp(`\\b${card.word}\\b`, 'gi'),
          `[${firstLetter}_____]`
        );
        return {
          stage: 3,
          label: 'Stage 3 · Kontext-Satz',
          badge: 'CLOZE CONTEXT',
          text: `„${masked}“`
        };
      }

      return {
        stage: 3,
        label: 'Stage 3 · Übersetzung',
        badge: 'TRANSLATION CUE',
        text: `Bedeutung: ${card.mn || card.en || ''}`
      };
    }
  }

  // English Target Mode
  if (stage === 1) {
    return {
      stage: 1,
      label: 'Stage 1 · Part of Speech',
      badge: 'POS',
      text: `Category: [${card.pos ? card.pos.toUpperCase() : 'VOCAB'}]`
    };
  }

  if (stage === 2) {
    const detail = card.forms || card.rektion || `Topic: [${card.topic || 'General'}]`;
    return {
      stage: 2,
      label: 'Stage 2 · Structure & Pattern',
      badge: 'PATTERN',
      text: detail
    };
  }

  if (stage === 3) {
    if (card.example_en) {
      const firstLetter = card.word.charAt(0);
      const masked = card.example_en.replace(
        new RegExp(`\\b${card.word}\\b`, 'gi'),
        `[${firstLetter}_____]`
      );
      return {
        stage: 3,
        label: 'Stage 3 · Context Sentence',
        badge: 'CLOZE CONTEXT',
        text: `"${masked}"`
      };
    }

    return {
      stage: 3,
      label: 'Stage 3 · Meaning',
      badge: 'MEANING CUE',
      text: `Meaning: ${card.mn || card.de || ''}`
    };
  }

  return null;
}
