import unicodedata
import json
import os

ROOT = '/root/ARL'

def nfc(s):
    if s is None:
        return None
    return unicodedata.normalize('NFC', str(s).strip())

def make_de_noun(idx, word, article, plural, mn, en, ex_de=None, ex_mn=None, ex_en=None, topic='Alltag'):
    article = nfc(article.lower())
    word = nfc(word)
    plural = nfc(plural)
    mn = nfc(mn)
    en = nfc(en)
    
    art_acc = 'den' if article == 'der' else ('das' if article == 'das' else 'die')
    
    if not ex_de:
        ex_de = f"Hier ist {article} {word}."
    if not ex_mn:
        ex_mn = f"Энд {mn} байна."
    if not ex_en:
        ex_en = f"Here is the {en}."
        
    return {
        "id": f"de_{topic[:2].lower()}_{idx:04d}",
        "word": word,
        "article": article,
        "plural": plural,
        "display": f"{article} {word}, {plural}",
        "pos": "noun",
        "lang": "de",
        "level": "A1",
        "forms": None,
        "rektion": None,
        "prompt_front": f"_____ {word}, {plural} [{mn}]",
        "revealed_back": f"{article} {word}, {plural}",
        "mn": mn,
        "en": en,
        "de": f"{article} {word}, {plural}",
        "example_de": nfc(ex_de),
        "example_mn": nfc(ex_mn),
        "example_en": nfc(ex_en),
        "topic": topic
    }

def make_de_verb(idx, word, forms, rek, mn, en, ex_de=None, ex_mn=None, ex_en=None, topic='Verben'):
    word = nfc(word)
    forms = nfc(forms)
    rek = nfc(rek) if rek else None
    mn = nfc(mn)
    en = nfc(en)
    
    if not ex_de:
        ex_de = f"Wir möchten {word}."
    if not ex_mn:
        ex_mn = f"Бид {mn} хүсэж байна."
    if not ex_en:
        ex_en = f"We want to {en}."
        
    prompt = f"{word} _____ [{mn}]"
    back = f"{forms} ({rek})" if rek else forms
    
    return {
        "id": f"de_{topic[:2].lower()}_{idx:04d}",
        "word": word,
        "article": None,
        "plural": None,
        "display": word,
        "pos": "verb",
        "lang": "de",
        "level": "A1",
        "forms": forms,
        "rektion": rek,
        "prompt_front": prompt,
        "revealed_back": back,
        "mn": mn,
        "en": en,
        "de": word,
        "example_de": nfc(ex_de),
        "example_mn": nfc(ex_mn),
        "example_en": nfc(ex_en),
        "topic": topic
    }

def make_de_other(idx, word, pos, mn, en, ex_de=None, ex_mn=None, ex_en=None, topic='Wortschatz'):
    word = nfc(word)
    mn = nfc(mn)
    en = nfc(en)
    
    if not ex_de:
        ex_de = f"Das ist {word}."
    if not ex_mn:
        ex_mn = f"Энэ бол {mn}."
    if not ex_en:
        ex_en = f"This is {en}."
        
    return {
        "id": f"de_{topic[:2].lower()}_{idx:04d}",
        "word": word,
        "article": None,
        "plural": None,
        "display": word,
        "pos": pos,
        "lang": "de",
        "level": "A1",
        "forms": None,
        "rektion": None,
        "prompt_front": f"{word} — _____ [{mn}]",
        "revealed_back": word,
        "mn": mn,
        "en": en,
        "de": word,
        "example_de": nfc(ex_de),
        "example_mn": nfc(ex_mn),
        "example_en": nfc(ex_en),
        "topic": topic
    }

def make_en_entry(idx, word, pos, forms, rek, mn, de, ex_en=None, ex_mn=None, ex_de=None, topic='Core English', level='A1'):
    word = nfc(word)
    mn = nfc(mn)
    de = nfc(de)
    forms = nfc(forms) if forms else word
    rek = nfc(rek) if rek else None
    
    if not ex_en:
        ex_en = f"This is a useful {word}."
    if not ex_mn:
        ex_mn = f"Энэ бол хэрэгтэй {mn}."
    if not ex_de:
        ex_de = f"Das ist nützlich."
        
    return {
        "id": f"en_{level.lower()}_{idx:04d}",
        "word": word,
        "pos": pos,
        "lang": "en",
        "level": level,
        "forms": forms,
        "rektion": rek,
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
