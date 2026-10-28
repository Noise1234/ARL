#!/usr/bin/env python3
"""
Integrates the complete English vocabulary expansion.
Targets:
  vocab_a1.json: >= 761
  vocab_a2.json: >= 764
  vocab_b1.json: >= 765
  vocab_b2.json: >= 770
  Total EN: >= 3,060 items.
"""
import json
import os
import sys
import unicodedata

sys.path.append('/root/ARL/scripts')
from vocab_en_b1_data import b1_vocab
from vocab_en_b2_data import b2_vocab
from vocab_en_extra import extra_en_vocab
from vocab_en_b2_extra2 import b2_extra2

ROOT = '/root/ARL'

def nfc(s):
    if s is None:
        return None
    return unicodedata.normalize('NFC', str(s).strip())

def make_en_entry(idx, word, pos, mn, de, topic='General', level='B1'):
    word = nfc(word)
    mn = nfc(mn)
    de = nfc(de)
    
    ex_en = f"Understanding {word} is very helpful."
    ex_mn = f"{mn.capitalize()} гэдгийг ойлгох нь маш тустай."
    ex_de = f"Das Verständnis von {de} ist sehr hilfreich."
    
    if pos == 'verb':
        ex_en = f"They need to {word} this carefully."
        ex_mn = f"Тэд үүнийг анхааралтай {mn} хэрэгтэй."
        ex_de = f"Sie müssen dies sorgfältig {de}."
    elif pos == 'adj':
        ex_en = f"The result was remarkably {word}."
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

# Load current datasets
datasets = {}
seen_words = set()

for lvl in ['a1', 'a2', 'b1', 'b2']:
    path = os.path.join(ROOT, f'data/en/vocab_{lvl}.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        datasets[lvl] = data
        for item in data:
            seen_words.add(item['word'].strip().lower())

print("Current counts:")
for lvl, data in datasets.items():
    print(f"  {lvl}: {len(data)}")
print(f"  Total seen unique words: {len(seen_words)}")

b1_target = 765
b2_target = 770

# Populate B1
b1_data = datasets['b1']
b1_idx = len(b1_data) + 1

for w, pos, mn, de, topic in b1_vocab:
    if len(b1_data) >= b1_target:
        break
    wl = w.strip().lower()
    if wl not in seen_words:
        entry = make_en_entry(b1_idx, w, pos, mn, de, topic=topic, level='B1')
        b1_data.append(entry)
        seen_words.add(wl)
        b1_idx += 1

extra_idx = 0
while len(b1_data) < b1_target and extra_idx < len(extra_en_vocab):
    w, pos, mn, de, topic = extra_en_vocab[extra_idx]
    extra_idx += 1
    wl = w.strip().lower()
    if wl not in seen_words:
        entry = make_en_entry(b1_idx, w, pos, mn, de, topic=topic, level='B1')
        b1_data.append(entry)
        seen_words.add(wl)
        b1_idx += 1

print(f"B1 reached: {len(b1_data)}")

# Populate B2
b2_data = datasets['b2']
b2_idx = len(b2_data) + 1

for w, pos, mn, de, topic in b2_vocab:
    if len(b2_data) >= b2_target:
        break
    wl = w.strip().lower()
    if wl not in seen_words:
        entry = make_en_entry(b2_idx, w, pos, mn, de, topic=topic, level='B2')
        b2_data.append(entry)
        seen_words.add(wl)
        b2_idx += 1

while len(b2_data) < b2_target and extra_idx < len(extra_en_vocab):
    w, pos, mn, de, topic = extra_en_vocab[extra_idx]
    extra_idx += 1
    wl = w.strip().lower()
    if wl not in seen_words:
        entry = make_en_entry(b2_idx, w, pos, mn, de, topic=topic, level='B2')
        b2_data.append(entry)
        seen_words.add(wl)
        b2_idx += 1

# If B2 still needs more, take from b2_extra2
b2_extra2_idx = 0
while len(b2_data) < b2_target and b2_extra2_idx < len(b2_extra2):
    w, pos, mn, de, topic = b2_extra2[b2_extra2_idx]
    b2_extra2_idx += 1
    wl = w.strip().lower()
    if wl not in seen_words:
        entry = make_en_entry(b2_idx, w, pos, mn, de, topic=topic, level='B2')
        b2_data.append(entry)
        seen_words.add(wl)
        b2_idx += 1

print(f"B2 reached: {len(b2_data)}")

# Write updated B1 and B2
for lvl in ['b1', 'b2']:
    path = os.path.join(ROOT, f'data/en/vocab_{lvl}.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(datasets[lvl], f, ensure_ascii=False, indent=2)

total_en = sum(len(datasets[lvl]) for lvl in ['a1', 'a2', 'b1', 'b2'])
print(f"Final EN total count: {total_en}")
for lvl in ['a1', 'a2', 'b1', 'b2']:
    print(f"  {lvl}: {len(datasets[lvl])}")
