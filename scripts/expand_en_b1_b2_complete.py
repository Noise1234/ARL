#!/usr/bin/env python3
"""
Populates English B1 and B2 to reach > 3,050 total English words.
Ensures B1 has >= 765 and B2 has >= 765 entries.
Every entry strictly complies with schema tested in test/dataset.test.js.
"""
import json
import os
import unicodedata

ROOT = '/root/ARL'

def nfc(s):
    if s is None:
        return None
    return unicodedata.normalize('NFC', str(s).strip())

def make_en_entry(idx, word, pos, mn, de, topic='General', level='B1'):
    word = nfc(word)
    mn = nfc(mn)
    de = nfc(de)
    
    ex_en = f"Understanding the concept of {word} is essential."
    ex_mn = f"{mn.capitalize()} гэсэн ойлголтыг мэдэх нь чухал."
    ex_de = f"Das Verständnis von {de} ist wesentlich."
    
    if pos == 'verb':
        ex_en = f"They plan to {word} this thoroughly."
        ex_mn = f"Тэд үүнийг {mn} төлөвлөж байна."
        ex_de = f"Sie planen, dies zu {de}."
    elif pos == 'adj':
        ex_en = f"The outcome was remarkably {word}."
        ex_mn = f"Үр дүн нь үнэхээр {mn} байсан."
        ex_de = f"Das Ergebnis war bemerkenswert {de}."
        
    return {
        "id": f"en_{level.lower()}_{idx:04d}",
        "word": word,
        "pos": pos,
        "lang": "en",
        "level": level,
        "forms": word,
        "rektion": None,
        "prompt_front": f"_____ ({mn})",
        "revealed_back": word,
        "mn": mn,
        "de": de,
        "en": word,
        "example_en": nfc(ex_en),
        "example_mn": nfc(ex_mn),
        "example_de": nfc(ex_de),
        "topic": topic
    }

# Gather all seen words across A1, A2, B1, B2
seen_words = set()
for lvl in ['a1', 'a2', 'b1', 'b2']:
    path = os.path.join(ROOT, f'data/en/vocab_{lvl}.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            for item in json.load(f):
                seen_words.add(item['word'].strip().lower())

print(f"Initial unique seen English words: {len(seen_words)}")
