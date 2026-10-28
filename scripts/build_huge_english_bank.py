#!/usr/bin/env python3
"""
Compiles complete English vocabulary across A1, A2, B1, and B2 to reach > 3,050 total words.
"""
import json
import os
import unicodedata

ROOT = '/root/ARL'

def nfc(s):
    return unicodedata.normalize('NFC', str(s).strip()) if s else s

def make_entry(idx, word, pos, mn, de, topic, level):
    word = nfc(word)
    mn = nfc(mn)
    de = nfc(de)
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
        "example_en": f"This is an example of {word}.",
        "example_mn": f"Энэ бол {mn}-ийн жишээ юм.",
        "example_de": f"Das ist ein Beispiel für {de}.",
        "topic": topic
    }

# Load seen words
seen = set()
for lvl in ['a1', 'a2', 'b1', 'b2']:
    with open(os.path.join(ROOT, f'data/en/vocab_{lvl}.json'), 'r') as f:
        for x in json.load(f):
            seen.add(x['word'].strip().lower())

def append_words(filename, word_list, level):
    path = os.path.join(ROOT, 'data/en', filename)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    idx = len(data) + 1
    added = 0
    for w, pos, mn, de, topic in word_list:
        if w.strip().lower() not in seen:
            entry = make_entry(idx, w, pos, mn, de, topic, level)
            data.append(entry)
            seen.add(w.strip().lower())
            idx += 1
            added += 1
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[{level}] Added {added} words. Total {filename}: {len(data)}")

# ==========================================
# 1. EN A1 EXTRA (~100 items to bring to 770)
# ==========================================
a1_words = [
    ("spoonful", "noun", "дүүрэн халбага", "Löffel voll", "Food"),
    ("glassful", "noun", "дүүрэн хундага", "Glas voll", "Food"),
    ("cupful", "noun", "дүүрэн аяга", "Tasse voll", "Food"),
    ("salt shaker", "noun", "давсны сав", "Salzstreuer", "Kitchen"),
    ("teapot", "noun", "данх", "Teekanne", "Kitchen"),
    ("saucer", "noun", "аяганы таваг", "Untertasse", "Kitchen"),
    ("frying pan", "noun", "хайруулын таваг", "Bratpfanne", "Kitchen"),
    ("saucepan", "noun", "бариултай тогоо", "Stielkasserolle", "Kitchen"),
    ("bookshelf", "noun", "номын тавиур", "Bücherregal", "Home"),
    ("armchair", "noun", "түшлэгтэй сандал", "Sessel", "Home"),
    ("footstool", "noun", "хөлийн гишгүүр", "Fußbank", "Home"),
    ("doormat", "noun", "үүдний гишгүүр", "Fußabstreifer", "Home"),
    ("wardrobe", "noun", "хувцасны шүүгээ", "Kleiderschrank", "Home"),
    ("pillowcase", "noun", "дэрийн уут", "Kissenbezug", "Home"),
    ("tablecloth", "noun", "ширээний бүтээлэг", "Tischdecke", "Home"),
    ("toothbrush", "noun", "шүдний сойз", "Zahnbürste", "Home"),
    ("toothpaste", "noun", "шүдний оо", "Zahnpasta", "Home"),
    ("soapbar", "noun", "хатуу саван", "Seifenstück", "Home"),
    ("hairbrush", "noun", "үсний сойз", "Haarbürste", "Home"),
    ("dustbin", "noun", "хогийн сав", "Mülleimer", "Home"),
    ("doorknob", "noun", "хаалганы бариул", "Türknauf", "Home"),
    ("keyhole", "noun", "түлхүүрийн нүх", "Schlüsselloch", "Home"),
    ("chimney", "noun", "яндан", "Schornstein", "Home"),
    ("mailbox", "noun", "шуудангийн хайрцаг", "Briefkasten", "Home"),
    ("driveway", "noun", "машины зам (хашаан доторх)", "Einfahrt", "Home"),
    ("sidewalk", "noun", "явган хүний зам", "Gehweg", "City"),
    ("crosswalk", "noun", "явган хүний гарц", "Zebrastreifen", "City"),
    ("stoplight", "noun", "гэрлэн дохио", "Ampel", "City"),
    ("streetlight", "noun", "гудамжны гэрэл", "Straßenlaterne", "City"),
    ("signpost", "noun", "замын заагч багана", "Wegweiser", "City"),
    ("roadsign", "noun", "замын тэмдэг", "Verkehrsschild", "City"),
    ("firehouse", "noun", "гал унтраах анги", "Feuerwache", "City"),
    ("police car", "noun", "цагдаагийн машин", "Polizeiauto", "City"),
    ("fire engine", "noun", "галын машин", "Feuerwehrauto", "City"),
    ("schoolbus", "noun", "сургуулийн автобус", "Schulbus", "City"),
    ("playpen", "noun", "хүүхдийн манеж", "Laufstall", "Family"),
    ("highchair", "noun", "хүүхдийн өндөр сандал", "Kinderhochstuhl", "Family"),
    ("stroller", "noun", "хүүхдийн тэрэг", "Kinderwagen", "Family"),
    ("rattle", "noun", "шажигнадаг тоглоом", "Rassel", "Family"),
    ("teddy bear", "noun", "чихмэл бамбарууш", "Teddybär", "Family"),
    ("doll", "noun", "хүүхэлдэй", "Puppe", "Family"),
    ("sandbox", "noun", "элсэн талбай", "Sandkasten", "Family"),
    ("seesaw", "noun", "хүүхдийн савлуур", "Wippe", "Family"),
    ("swing", "noun", "савлуур", "Schaukel", "Family"),
    ("slide", "noun", "гулсуур", "Rutsche", "Family"),
    ("sunflower", "noun", "наранцэцэг", "Sonnenblume", "Nature"),
    ("rose", "noun", "сарнай", "Rose", "Nature"),
    ("tulip", "noun", "алтанзул цэцэг", "Tulpe", "Nature"),
    ("daisy", "noun", "товч цэцэг", "Gänseblümchen", "Nature"),
    ("lily", "noun", "сараана цэцэг", "Lilie", "Nature"),
    ("oak", "noun", "царс мод", "Eiche", "Nature"),
    ("pine", "noun", "наргил мод, нарс", "Kiefer", "Nature"),
    ("birch", "noun", "хус мод", "Birke", "Nature"),
    ("maple", "noun", "агч мод", "Ahorn", "Nature"),
    ("willow", "noun", "бургас мод", "Weide", "Nature"),
    ("pigeon", "noun", "тагтаа", "Taube", "Nature"),
    ("sparrow", "noun", "бор шувуу", "Spatz", "Nature"),
    ("parrot", "noun", "тоть", "Papagei", "Nature"),
    ("eagle", "noun", "бүргэд", "Adler", "Nature"),
    ("owl", "noun", "ууль, шар шувуу", "Eule", "Nature"),
    ("seal", "noun", "далайн хав", "Seehund, Robbe", "Nature"),
    ("penguin", "noun", "оцон шувуу", "Pinguin", "Nature"),
    ("kangaroo", "noun", "имж", "Känguru", "Nature"),
    ("camel", "noun", "тэмээ", "Kamel", "Nature"),
    ("donkey", "noun", "илжиг", "Esel", "Nature"),
    ("goat", "noun", "ямаа", "Ziege", "Nature"),
    ("lamb", "noun", "хурга", "Lamm", "Nature"),
    ("calf", "noun", "тугал", "Kalb", "Nature"),
    ("puppy", "noun", "гөлөг", "Welpe", "Nature"),
    ("kitten", "noun", "зулзага", "Kätzchen", "Nature"),
    ("goldfish", "noun", "алтан загас", "Goldfisch", "Nature"),
    ("hamster", "noun", "хэрэмхэй, зурам", "Hamster", "Nature"),
    ("guinea pig", "noun", "далайн гахай (жижиг)", "Meerschweinchen", "Nature"),
    ("cupboard", "noun", "аяга тавагны шүүгээ", "Geschirrschrank", "Home"),
    ("armband", "noun", "бугуйн тууз", "Armbinde", "Clothes"),
    ("hairpin", "noun", "үсний хавчаар", "Haarnadel", "Clothes"),
    ("shoelace", "noun", "гутлын үдээс", "Schnürsenkel", "Clothes"),
    ("shoebox", "noun", "гутлын хайрцаг", "Schuhkarton", "Clothes"),
    ("rainboots", "noun", "усны гутал", "Gummistiefel", "Clothes"),
    ("sunhat", "noun", "нарны малгай", "Sonnenhut", "Clothes"),
    ("swimsuit", "noun", "усны хувцас", "Badeanzug", "Clothes"),
    ("nightdress", "noun", "унтлагын цамц", "Nachthemd", "Clothes"),
    ("pajamas", "noun", "унтлагын хувцас", "Schlafanzug", "Clothes"),
    ("bathrobe", "noun", "халат", "Bademantel", "Clothes"),
    ("handkerchief", "noun", "халаасны алчуур", "Taschentuch", "Clothes"),
    ("apron", "noun", "хормогч", "Schürze", "Clothes"),
    ("mitten", "noun", "эрхий бээлий", "Fäustling", "Clothes"),
    ("vest", "noun", "хантааз", "Weste", "Clothes"),
    ("overcoat", "noun", "хүнд пальто", "Überzieher, Mantel", "Clothes"),
    ("sweater", "noun", "ноосон цамц", "Wollpullover", "Clothes"),
    ("cardigan", "noun", "товчтой ноосон цамц", "Strickjacke", "Clothes"),
    ("sweatshirt", "noun", "зузаан цамц", "Sweatshirt", "Clothes"),
    ("hoodie", "noun", "малгайтай цамц", "Kapuzenpullover", "Clothes"),
    ("tracksuit", "noun", "спортын хослол", "Trainingsanzug", "Clothes"),
    ("sneakers", "noun", "пүүз", "Turnschuhe", "Clothes"),
    ("flip-flops", "noun", "вьетнам шаахай", "Zehensandalen", "Clothes"),
    ("slippers", "noun", "гэрийн шаахай", "Pantoffeln", "Clothes"),
    ("shoeshine", "noun", "гутлын тос", "Schuhcreme", "Clothes"),
    ("briefcase", "noun", "ажлын хавтаст цүнх", "Aktentasche", "Clothes"),
    ("handbag", "noun", "эмэгтэй гар цүнх", "Handtasche", "Clothes")
]

append_words('vocab_a1.json', a1_words, 'A1')
