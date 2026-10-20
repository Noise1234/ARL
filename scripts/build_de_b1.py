import json
import unicodedata

# Comprehensive lookup of verb principal forms and rektion for B1 German verbs
# Format: infinitive -> (pres3, pret, perf, rektion, cloze_prompt)
VERB_DATA = {
    'beantragen': ('beantragt', 'beantragte', 'hat beantragt', '+ Akkusativ', 'beantragen + _____'),
    'einstellen': ('stellt ein', 'stellte ein', 'hat eingestellt', '+ Akkusativ', 'einstellen + _____'),
    'entlassen': ('entlässt', 'entließ', 'hat entlassen', '+ Akkusativ', 'entlassen + _____'),
    'kündigen': ('kündigt', 'kündigte', 'hat gekündigt', '+ Dativ / + Akkusativ', 'kündigen + _____'),
    'verhandeln': ('verhandelt', 'verhandelte', 'hat verhandelt', 'über + Akkusativ', 'verhandeln _____ [Akk]'),
    'leisten': ('leistet', 'leistete', 'hat geleistet', '+ Akkusativ', 'leisten + _____'),
    'befördern': ('befördert', 'beförderte', 'hat befördert', '+ Akkusativ', 'befördern + _____'),
    'zusammenarbeiten': ('arbeitet zusammen', 'arbeitete zusammen', 'hat zusammengearbeitet', 'mit + Dativ', 'zusammenarbeiten _____ [Dat]'),
    'erledigen': ('erledigt', 'erledigte', 'hat erledigt', '+ Akkusativ', 'erledigen + _____'),
    'vereinbaren': ('vereinbart', 'vereinbarte', 'hat vereinbart', '+ Akkusativ', 'vereinbaren + _____'),
    'übernehmen': ('übernimmt', 'übernahm', 'hat übernommen', '+ Akkusativ', 'übernehmen + _____'),
    'einleiten': ('leitet ein', 'leitete ein', 'hat eingeleitet', '+ Akkusativ', 'einleiten + _____'),
    'weiterbilden': ('bildet weiter', 'bildete weiter', 'hat weitergebildet', 'sich in + Dativ', 'sich weiterbilden _____ [Dat]'),
    'vertreten': ('vertritt', 'vertrat', 'hat vertreten', '+ Akkusativ', 'vertreten + _____'),
    'festlegen': ('legt fest', 'legte fest', 'hat festgelegt', '+ Akkusativ', 'festlegen + _____'),
    'vorbereiten': ('bereitet vor', 'bereitete vor', 'hat vorbereitet', 'auf + Akkusativ', 'vorbereiten _____ [Akk]'),
    'durchführen': ('führt durch', 'führte durch', 'hat durchgeführt', '+ Akkusativ', 'durchführen + _____'),
    'überzeugen': ('überzeugt', 'überzeugte', 'hat überzeugt', 'von + Dativ', 'überzeugen _____ [Dat]'),
    'mitteilen': ('teilt mit', 'teilte mit', 'hat mitgeteilt', '+ Dativ + Akkusativ', 'mitteilen + _____'),
    'verschieben': ('verschiebt', 'verschob', 'hat verschoben', 'auf + Akkusativ', 'verschieben _____ [Akk]'),
    'absagen': ('sagt ab', 'sagte ab', 'hat abgesagt', '+ Akkusativ', 'absagen + _____'),
    'zusagen': ('sagt zu', 'sagte zu', 'hat zugesagt', '+ Dativ', 'zusagen + _____'),
    'einreichen': ('reicht ein', 'reichte ein', 'hat eingereicht', 'bei + Dativ', 'einreichen _____ [Dat]'),
    'bestätigen': ('bestätigt', 'bestätigte', 'hat bestätigt', '+ Akkusativ', 'bestätigen + _____'),
    'überprüfen': ('überprüft', 'überprüfte', 'hat überprüft', '+ Akkusativ', 'überprüfen + _____'),
    'abstimmen': ('stimmt ab', 'stimmte ab', 'hat abgestimmt', 'über + Akkusativ', 'abstimmen _____ [Akk]'),
    'einbringen': ('bringt ein', 'brachte ein', 'hat eingebracht', 'in + Akkusativ', 'einbringen _____ [Akk]'),
    'anfordern': ('fordert an', 'forderte an', 'hat angefordert', '+ Akkusativ', 'anfordern + _____'),
    'ausfüllen': ('füllt aus', 'füllte aus', 'hat ausgefüllt', '+ Akkusativ', 'ausfüllen + _____'),
    'hinterlassen': ('hinterlässt', 'hinterließ', 'hat hinterlassen', '+ Akkusativ', 'hinterlassen + _____')
}

with open('data/b1_words.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

enhanced = []
for w in words:
    item = dict(w)
    item['lang'] = 'de'
    item['level'] = 'B1'
    
    # NFC normalize strings
    for k, v in item.items():
        if isinstance(v, str):
            item[k] = unicodedata.normalize('NFC', v.strip())
            
    pos = item.get('pos')
    word = item.get('word')
    
    if pos == 'noun':
        art = item.get('article', 'der')
        pl = item.get('plural', '')
        item['prompt_front'] = f"_____ {word}, -? [N]"
        item['revealed_back'] = f"{art} {word}, {pl}"
    elif pos == 'verb':
        if word in VERB_DATA:
            p3, pret, perf, rek, cl = VERB_DATA[word]
            item['forms'] = f"{word} | {p3} | {pret} | {perf}"
            item['rektion'] = rek
            item['prompt_front'] = cl
            item['revealed_back'] = f"{word} {rek} ({item['forms']})"
        else:
            # Generate regular / standard form
            stem = word[:-2] if word.endswith('en') else (word[:-1] if word.endswith('n') else word)
            p3 = f"{stem}t"
            pret = f"{stem}te"
            perf = f"hat ge{stem}t"
            item['forms'] = f"{word} | {p3} | {pret} | {perf}"
            item['rektion'] = '+ Akkusativ'
            item['prompt_front'] = f"{word} + _____"
            item['revealed_back'] = f"{word} + Akkusativ ({item['forms']})"
    else:
        item['prompt_front'] = word
        item['revealed_back'] = f"{word} [{pos}]"

    enhanced.append(item)

with open('data/de/vocab_b1.json', 'w', encoding='utf-8') as f:
    json.dump(enhanced, f, ensure_ascii=False, indent=2)

print(f"Generated data/de/vocab_b1.json with {len(enhanced)} items.")
