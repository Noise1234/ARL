#!/usr/bin/env python3
import json, os
from vocab_helper import nfc, make_de_noun, make_de_verb, make_de_other, ROOT

seen = set()
for fn in ['vocab_a1.json', 'vocab_a2.json', 'vocab_b1.json', 'vocab_b2.json']:
    p = os.path.join(ROOT, 'data/de', fn)
    with open(p, 'r', encoding='utf-8') as f:
        for x in json.load(f):
            seen.add(x['word'].strip().lower())

b2_path = os.path.join(ROOT, 'data/de/vocab_b2.json')
with open(b2_path, 'r', encoding='utf-8') as f:
    b2_words = json.load(f)

extra = [
    ("Quantenphysik", "die", "-", "квант физик", "quantum physics", "Wissenschaft"),
    ("Nanotechnologie", "die", "-", "нанотехнологи", "nanotechnology", "Wissenschaft"),
    ("Gentechnik", "die", "-", "генийн инженерчлэл", "genetic engineering", "Wissenschaft"),
    ("Biotechnologie", "die", "-", "биотехнологи", "biotechnology", "Wissenschaft"),
    ("Neurowissenschaft", "die", "-en", "тархи судлал, мэдрэлийн шинжлэх ухаан", "neuroscience", "Wissenschaft"),
    ("Kognitionswissenschaft", "die", "-", "танин мэдэхүйн шинжлэх ухаан", "cognitive science", "Wissenschaft"),
    ("Astrophysik", "die", "-", "астрофизик", "astrophysics", "Wissenschaft"),
    ("Meteorologie", "die", "-", "цаг уур судлал", "meteorology", "Wissenschaft"),
    ("Geologie", "die", "-", "геологи, газар зүй", "geology", "Wissenschaft"),
    ("Archäologie", "die", "-", "археологи, эртний судлал", "archaeology", "Wissenschaft"),
    ("Anthropologie", "die", "-", "хүн судлал", "anthropology", "Wissenschaft"),
    ("Linguistik", "die", "-", "хэл шинжлэл", "linguistics", "Wissenschaft"),
    ("Philologie", "die", "-", "хэл бичиг судлал", "philology", "Wissenschaft"),
    ("Semiotik", "die", "-", "дохио зангаа, бэлгэдэл зүй", "semiotics", "Wissenschaft"),
    ("Hermeneutik", "die", "-", "тайлбарлах ухаан", "hermeneutics", "Wissenschaft"),
    ("Phänomenologie", "die", "-", "үзэгдэл судлал", "phenomenology", "Wissenschaft"),
    ("Ontologie", "die", "-", "оршихуйн онол", "ontology", "Wissenschaft"),
    ("Axiom", "das", "-e", "аксиом, маргаангүй үнэн", "axiom", "Wissenschaft"),
    ("Paradigma", "das", "-mata", "парадигм, загвар ойлголт", "paradigm", "Wissenschaft"),
    ("Postulat", "das", "-e", "шаардлага, нотолгоогүй үндэслэл", "postulate", "Wissenschaft"),
    ("Diskurs", "der", "-e", "яриа хэлэлцүүлэг, дикурс", "discourse", "Wissenschaft"),
    ("Narrativ", "das", "-e", "хүүрнэл, өгүүлэмж", "narrative", "Kultur"),
    ("Kontext", "der", "-e", "хам сэдэв, контекст", "context", "Sprache"),
    ("Subtext", "der", "-e", "далд утга", "subtext", "Sprache"),
    ("Konnotation", "die", "-en", "нэмэлт өнгө аяс, дагалдах утга", "connotation", "Sprache"),
    ("Denotation", "die", "-en", "шууд бодит утга", "denotation", "Sprache"),
    ("Metapher", "die", "-n", "зүйрлэл", "metaphor", "Sprache"),
    ("Allegorie", "die", "-n", "ёгтлол, ёгт дүрслэл", "allegory", "Sprache"),
    ("Ironie", "die", "-", "егөө, ёжлол", "irony", "Sprache"),
    ("Sarkasmus", "der", "-", "ёжтой хоржоонтой үг", "sarcasm", "Sprache"),
    ("Satire", "die", "-n", "хошин шог, элэглэл", "satire", "Kultur"),
    ("Polemik", "die", "-en", "маргаантай шүүмжлэл", "polemic", "Kommunikation"),
    ("Rhetorik", "die", "-", "илтгэх урлаг", "rhetoric", "Kommunikation"),
    ("Eloquenz", "die", "-", "уран цэцэн үг хэллэг", "eloquence", "Kommunikation"),
    ("Artikulation", "die", "-en", "дуу авиаг тод дуудах", "articulation", "Sprache"),
    ("Dialekt", "der", "-e", "нутгийн аялгуу", "dialect", "Sprache"),
    ("Idiom", "das", "-e", "хэлц үг", "idiom", "Sprache"),
    ("Neologismus", "der", "-men", "шинэ үг хэллэг", "neologism", "Sprache"),
    ("Synonym", "das", "-e", "ойролцоо утгат үг", "synonym", "Sprache"),
    ("Antonym", "das", "-e", "эсрэг утгат үг", "antonym", "Sprache"),
    ("Homonym", "das", "-e", "ижил дуудагддаг өөр үг", "homonym", "Sprache"),
    ("Akronym", "das", "-e", "товчилсон үг", "acronym", "Sprache"),
    ("Terminologie", "die", "-n", "нэр томьёо", "terminology", "Sprache"),
    ("Nomenklatur", "die", "-en", "нэр томьёоны тогтолцоо", "nomenclature", "Wissenschaft"),
    ("Etymologie", "die", "-n", "үгийн гарал үүсэл", "etymology", "Sprache"),
    ("Morphologie", "die", "-", "бүтэц хэлбэр судлал", "morphology", "Sprache"),
    ("Syntax", "die", "-", "өгүүлбэр зүй", "syntax", "Sprache"),
    ("Semantik", "die", "-", "утга зүй", "semantics", "Sprache"),
    ("Pragmatik", "die", "-", "хэрэглээний хэл шинжлэл", "pragmatics", "Sprache"),
    ("Orthografie", "die", "-", "зөв бичих дүрэм", "orthography, spelling", "Sprache"),
    ("Interpunktion", "die", "-en", "цэг таслалын дүрэм", "punctuation", "Sprache"),
    ("Diktat", "das", "-e", "цээж бичиг", "dictation", "Schule"),
    ("Aufsatz", "der", "-¨e", "зохион бичлэг", "essay, composition", "Schule"),
    ("Exposé", "das", "-s", "төслийн товч танилцуулга", "synopsis, project outline", "Wissenschaft"),
    ("Abstract", "das", "-s", "эрдэм шинжилгээний товчлол", "abstract", "Wissenschaft"),
    ("Review", "das", "-s", "шүүмж, тойм", "review", "Wissenschaft"),
    ("Monografie", "die", "-n", "нэг сэдэвт эрдмийн бүтээл", "monograph", "Wissenschaft"),
    ("Anthologie", "die", "-n", "сонгомол бүтээлийн эмхэтгэл", "anthology", "Kultur"),
    ("Lexikon", "das", "-ka", "нэвтэрхий толь", "encyclopedia, lexicon", "Wissenschaft"),
    ("Enzyklopädie", "die", "-n", "нэвтэрхий толь бичиг", "encyclopedia", "Wissenschaft"),
    ("Kompendium", "das", "-ien", "товч толь, гарын авлага", "compendium", "Wissenschaft"),
    ("Handbuch", "das", "-¨er", "гарын авлага ном", "handbook, manual", "Wissenschaft"),
    ("Leitfaden", "der", "-¨", "удирдамж, чиглүүлэгч", "guideline, guide", "Wissenschaft"),
    ("Katalog", "der", "-e", "каталог, бүртгэл", "catalog", "Wissenschaft"),
    ("Index", "der", "-dizes", "индекс, үзүүлэлт, заалт", "index", "Wissenschaft"),
    ("Glossar", "das", "-e", "тайлбар толь", "glossary", "Wissenschaft"),
    ("Anhang", "der", "-¨e", "хавсралт", "appendix, attachment", "Wissenschaft"),
    ("Fußnote", "die", "-n", "хуудасны доорх тайлбар зүүлт", "footnote", "Wissenschaft"),
    ("Endnote", "die", "-n", "төгсгөлийн зүүлт тайлбар", "endnote", "Wissenschaft"),
    ("Bibliografie", "die", "-n", "номын бүртгэл", "bibliography", "Wissenschaft")
]

idx = len(b2_words) + 1
added = 0
for w, art, pl, mn, en, top in extra:
    if w.strip().lower() not in seen:
        entry = make_de_noun(idx, w, art, pl, mn, en, topic=top)
        entry['level'] = 'B2'
        b2_words.append(entry)
        seen.add(w.strip().lower())
        idx += 1
        added += 1

with open(b2_path, 'w', encoding='utf-8') as f:
    json.dump(b2_words, f, ensure_ascii=False, indent=2)

print(f"Added {added} items to B2. Total now: {len(b2_words)}")
