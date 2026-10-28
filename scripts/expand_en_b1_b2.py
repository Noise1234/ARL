#!/usr/bin/env python3
"""
Populates English B1 (720+ items) and English B2 (730+ items).
"""
import json
import os
from vocab_helper import nfc, make_en_entry, ROOT

seen_en = set()
for fn in ['vocab_a1.json', 'vocab_a2.json', 'vocab_b1.json', 'vocab_b2.json']:
    p = os.path.join(ROOT, 'data/en', fn)
    with open(p, 'r', encoding='utf-8') as f:
        for x in json.load(f):
            seen_en.add(x['word'].strip().lower())

# English B1 Core Lexicon
b1_raw = [
    # Environment & Ecology
    ("conservation", "noun", "байгаль хамгаалал", "Naturschutz", "Environment"),
    ("endangered", "adj", "мөхөх аюулд орсон", "vom Aussterben bedroht", "Environment"),
    ("renewable", "adj", "сэргээгдэх", "erneuerbar", "Environment"),
    ("solar power", "noun", "нарны эрчим хүч", "Solarenergie", "Environment"),
    ("global warming", "noun", "дэлхийн дулаарал", "Erderwärmung", "Environment"),
    ("carbon footprint", "noun", "нүүрстөрөгчийн ул мөр", "CO2-Fußabdruck", "Environment"),
    ("ecosystem", "noun", "экосистем", "Ökosystem", "Environment"),
    ("habitat", "noun", "амьдрах орчин", "Lebensraum", "Environment"),
    ("biodiversity", "noun", "биологийн олон янз байдал", "Biodiversität", "Environment"),
    ("greenhouse effect", "noun", "хүлэмжийн хийн нөлөө", "Tibhauseffekt", "Environment"),
    ("deforestation", "noun", "ой сүйтгэл", "Entwaldung", "Environment"),
    ("drought", "noun", "ган гачиг", "Dürre", "Environment"),
    ("famine", "noun", "өлсгөлөн", "Hungersnot", "Environment"),
    ("flood", "noun", "үер", "Überschwemmung", "Environment"),
    ("earthquake", "noun", "газар хөдлөлт", "Erdbeben", "Environment"),
    ("hurricane", "noun", "хар шуурга", "Hurrikan, Orkan", "Environment"),
    ("volcano", "noun", "галт уул", "Vulkan", "Environment"),
    ("disaster", "noun", "гамшиг", "Katastrophe", "Environment"),
    ("pollution", "noun", "бохирдол", "Verschmutzung", "Environment"),
    ("waste", "noun", "хаягдал", "Abfall", "Environment"),
    ("toxic", "adj", "хортой", "giftig", "Environment"),
    ("organic", "adj", "органик", "organisch, bio", "Environment"),

    # Work, Business & Economy
    ("occupation", "noun", "эрхэлж буй ажил", "Beruf, Beschäftigung", "Work"),
    ("qualification", "noun", "мэргэшлийн зэрэг", "Qualifikation", "Work"),
    ("candidate", "noun", "нэр дэвшигч, ажилд горилогч", "Kandidat, Bewerber", "Work"),
    ("vacancy", "noun", "ажлын сул орон тоо", "offene Stelle", "Work"),
    ("promotion", "noun", "тушаал дэвших, сурталчилгаа", "Beförderung", "Work"),
    ("employment", "noun", "ажил эрхлэлт", "Beschäftigung", "Work"),
    ("unemployment", "noun", "ажилгүйдэл", "Arbeitslosigkeit", "Work"),
    ("temporary", "adj", "түр зуурын", "vorübergehend, befristet", "Work"),
    ("permanent", "adj", "байнгын", "dauerhaft, unbefristet", "Work"),
    ("internship", "noun", "дадлага ажил", "Praktikum", "Work"),
    ("apprenticeship", "noun", "дагалдан сургалт", "Ausbildung, Lehre", "Work"),
    ("entrepreneur", "noun", "бизнес эрхлэгч", "Unternehmer", "Work"),
    ("enterprise", "noun", "аж ахуйн нэгж", "Unternehmen", "Work"),
    ("productivity", "noun", "бүтээмж", "Produktivität", "Work"),
    ("leadership", "noun", "манлайлал", "Führung, Leitung", "Work"),
    ("teamwork", "noun", "багийн ажиллагаа", "Teamarbeit", "Work"),
    ("negotiation", "noun", "хэлэлцээр", "Verhandlung", "Work"),
    ("agreement", "noun", "хэлэлцээр, зөвшилцөл", "Vereinbarung, Abkommen", "Work"),
    ("deadline", "noun", "эцсийн хугацаа", "Frist, Abgabetermin", "Work"),
    ("workload", "noun", "ажлын ачаалал", "Arbeitsbelastung", "Work"),
    ("colleague", "noun", "хамтрагч", "Kollege", "Work"),
    ("customer service", "noun", "хэрэглэгчийн үйлчилгээ", "Kundendienst", "Work"),
    ("headquarters", "noun", "төв оффис, төв байр", "Hauptsitz, Zentrale", "Work"),
    ("branch", "noun", "салбар нэгж", "Filiale, Zweigstelle", "Work"),

    # Society, Politics & Law
    ("government", "noun", "засгийн газар", "Regierung", "Politics"),
    ("democracy", "noun", "ардчилал", "Demokratie", "Politics"),
    ("parliament", "noun", "парламент", "Parlament", "Politics"),
    ("politician", "noun", "улс төрч", "Politiker", "Politics"),
    ("election", "noun", "сонгууль", "Wahl", "Politics"),
    ("campaign", "noun", "сонгуулийн аян", "Kampagne", "Politics"),
    ("citizen", "noun", "иргэн", "Bürger", "Politics"),
    ("community", "noun", "хамт олон, нийгэмлэг", "Gemeinschaft", "Society"),
    ("minority", "noun", "цөөнх", "Minderheit", "Society"),
    ("majority", "noun", "олонх", "Mehrheit", "Society"),
    ("justice", "noun", "шударга ёс", "Gerechtigkeit", "Law"),
    ("court", "noun", "шүүх", "Gericht", "Law"),
    ("trial", "noun", "шүүх хуралдаан", "Gerichtsverhandlung", "Law"),
    ("jury", "noun", "тангарагтны шүүх", "Geschworene", "Law"),
    ("witness", "noun", "гэрч", "Zeuge", "Law"),
    ("judge", "noun", "шүүгч", "Richter", "Law"),
    ("suspect", "noun", "сэжигтэн", "Verdächtiger", "Law"),
    ("criminal", "noun", "гэмт хэрэгтэн", "Krimineller, Verbrecher", "Law"),
    ("theft", "noun", "хулгай", "Diebstahl", "Law"),
    ("burglary", "noun", "орон байрны хулгай", "Einbruch", "Law"),
    ("robbery", "noun", "дээрэм", "Raub", "Law"),
    ("fraud", "noun", "залилан", "Betrug", "Law"),
    ("punishment", "noun", "шийтгэл", "Strafe, Bestrafung", "Law"),
    ("penalty", "noun", "торгууль, ял", "Strafe", "Law"),
    ("prison", "noun", "шорон", "Gefängnis", "Law"),
    ("illegal", "adj", "хууль бус", "illegal, ungesetzlich", "Law"),
    ("legal", "adj", "хууль ёсны", "legal, gesetzlich", "Law"),
    ("human rights", "noun", "хүний эрх", "Menschenrechte", "Law"),

    # Media, Technology & Communication
    ("device", "noun", "төхөөрөмж", "Gerät", "Technology"),
    ("application", "noun", "аппликейшн, өргөдөл", "Anwendung, Bewerbung", "Technology"),
    ("software", "noun", "програм хангамж", "Software", "Technology"),
    ("hardware", "noun", "техник хангамж", "Hardware", "Technology"),
    ("database", "noun", "өгөгдлийн сан", "Datenbank", "Technology"),
    ("wireless", "adj", "утасгүй", "drahtlos", "Technology"),
    ("broadcast", "noun", "нэвтрүүлэг", "Sendung, Übertragung", "Media"),
    ("channel", "noun", "суваг", "Kanal, Sender", "Media"),
    ("journalist", "noun", "сэтгүүлч", "Journalist", "Media"),
    ("reporter", "noun", "сурвалжлагч", "Reporter", "Media"),
    ("documentary", "noun", "баримтат кино", "Dokumentarfilm", "Media"),
    ("headline", "noun", "гарчиг (сонины)", "Schlagzeile", "Media"),
    ("advertisement", "noun", "зар сурталчилгаа", "Werbung, Anzeige", "Media"),
    ("commercial", "noun", "телевизийн сурталчилгаа", "Werbespot", "Media"),
    ("audience", "noun", "үзэгчид, сонсогчид", "Publikum, Zuhörerschaft", "Media"),
    ("subscriber", "noun", "захиалагч, дагагч", "Abonnent", "Media"),
    ("streaming", "noun", "шууд дамжуулалт", "Streaming", "Technology"),
    ("social media", "noun", "нийгмийн сүлжээ", "soziale Medien", "Technology"),
    ("privacy", "noun", "хувийн нууц", "Privatsphäre", "Technology"),
    ("security", "noun", "аюулгүй байдал", "Sicherheit", "Technology"),

    # Personality, Mind & Psychology
    ("personality", "noun", "зан төлөв, хувь хүн", "Persönlichkeit", "Psychology"),
    ("attitude", "noun", "хандлага", "Einstellung, Haltung", "Psychology"),
    ("ambition", "noun", "хүсэл эрмэлзэл, амбиц", "Ehrgeiz", "Psychology"),
    ("confidence", "noun", "өөртөө итгэх итгэл", "Selbstvertrauen", "Psychology"),
    ("anxiety", "noun", "түгшүүр, сэтгэл зовнил", "Angst, Besorgnis", "Psychology"),
    ("depression", "noun", "сэтгэл гутрал", "Depression", "Psychology"),
    ("emotion", "noun", "сэтгэл хөдлөл", "Emotion, Gefühl", "Psychology"),
    ("empathy", "noun", "бусдыг ойлгох чадвар", "Empathie, Mitgefühl", "Psychology"),
    ("sympathy", "noun", "өрөвдөх сэтгэл", "Mitgefühl, Sympathie", "Psychology"),
    ("enthusiasm", "noun", "урам зориг", "Begeisterung", "Psychology"),
    ("curiosity", "noun", "сониуч зан", "Neugier", "Psychology"),
    ("loyalty", "noun", "үнэнч байдал", "Loyalität, Treue", "Psychology"),
    ("modesty", "noun", "даруу зан", "Bescheidenheit", "Psychology"),
    ("patience", "noun", "тэвчээр", "Geduld", "Psychology"),
    ("stubborn", "adj", "зөрүүд", "stur, dickköpfig", "Psychology"),
    ("generous", "adj", "өгөөмөр", "großzügig", "Psychology"),
    ("sensible", "adj", "ухаалаг, бодитой", "vernünftig", "Psychology"),
    ("sensitive", "adj", "эмзэг, мэдрэмтгий", "empfindlich, sensibel", "Psychology"),
    ("adventurous", "adj", "адал явдалд дуртай", "abenteuerlustig", "Psychology"),
    ("decisive", "adj", "шийдэмгий", "entschlossen", "Psychology"),
    ("outgoing", "adj", "нээлттэй, нийтэч", "kontaktfreudig", "Psychology"),
    ("optimistic", "adj", "өөдрөг", "optimistisch", "Psychology"),
    ("pessimistic", "adj", "гутранги", "pessimistisch", "Psychology"),
    ("reliable", "adj", "найдвартай", "verlässlich, zuverlässig", "Psychology"),
    ("unreliable", "adj", "найдваргүй", "unzuverlässig", "Psychology"),

    # Phrasal Verbs & Expressions
    ("look after", "verb", "look after | looked after | looked after", "асрах, халамжлах", "sich kümmern um", "Phrasal Verbs"),
    ("look forward to", "verb", "look forward to", "тэсэн ядан хүлээх", "sich freuen auf", "Phrasal Verbs"),
    ("give up", "verb", "give up | gave up | given up", "бууж өгөх, орхих", "aufgeben", "Phrasal Verbs"),
    ("break down", "verb", "break down | broke down | broken down", "эвдрэх, нурах", "zusammenbrechen", "Phrasal Verbs"),
    ("run out of", "verb", "run out of", "дуусах, дутагдах", "ausgehen (Vorrat)", "Phrasal Verbs"),
    ("catch up with", "verb", "catch up with", "гүйцэж очих", "einholen", "Phrasal Verbs"),
    ("put off", "verb", "put off | put off | put off", "хойшлуулах", "verschieben", "Phrasal Verbs"),
    ("carry on", "verb", "carry on | carried on | carried on", "үргэлжлүүлэх", "weitermachen", "Phrasal Verbs"),
    ("find out", "verb", "find out | found out | found out", "олж мэдэх", "herausfinden", "Phrasal Verbs"),
    ("set up", "verb", "set up | set up | set up", "байгуулах, тохируулах", "gründen, einrichten", "Phrasal Verbs"),
    ("figure out", "verb", "figure out | figured out | figured out", "учрыг олох", "herausfinden, begreifen", "Phrasal Verbs"),
    ("turn down", "verb", "turn down | turned down | turned down", "татгалзах, дууг намсгах", "ablehnen, leiser drehen", "Phrasal Verbs"),
    ("take up", "verb", "take up | took up | taken up", "шинэ сонирхол эхлүүлэх", "anfangen (Hobby)", "Phrasal Verbs"),
    ("get along with", "verb", "get along with", "зохицож амьдрах", "auskommen mit", "Phrasal Verbs"),
    ("call off", "verb", "call off | called off | called off", "цуцлах", "absagen", "Phrasal Verbs"),
    ("show off", "verb", "show off | showed off | shown off", "онгирох, гайхуулах", "angeben, prahlen", "Phrasal Verbs"),
    ("bring up", "verb", "bring up | brought up | brought up", "өсгөх, сэдэв хөндөх", "aufziehen, erwähnen", "Phrasal Verbs"),
    ("come across", "verb", "come across", "санамсаргүй таарах", "zufällig stoßen auf", "Phrasal Verbs"),
    ("make up", "verb", "make up | made up | made up", "зохиох, эвлэрэх", "erfinden, versöhnen", "Phrasal Verbs"),
    ("look up to", "verb", "look up to", "хүндэтгэн бишрэх", "aufschauen zu", "Phrasal Verbs")
]

# Write a loop to add systematic B1 items (need ~720 items)
# We can load Oxford 3000 B1 words
# Let's read B1 file and add entries
b1_path = os.path.join(ROOT, 'data/en/vocab_b1.json')
with open(b1_path, 'r', encoding='utf-8') as f:
    en_b1 = json.load(f)

idx = len(en_b1) + 1
added_b1 = 0
for item in b1_raw:
    if len(item) == 5:
        w, pos, mn, de, top = item
        forms = w
    else:
        w, pos, forms, mn, de, top = item
    if w.strip().lower() not in seen_en:
        entry = make_en_entry(idx, w, pos, forms, None, mn, de, topic=top, level='B1')
        en_b1.append(entry)
        seen_en.add(w.strip().lower())
        idx += 1
        added_b1 += 1

with open(b1_path, 'w', encoding='utf-8') as f:
    json.dump(en_b1, f, ensure_ascii=False, indent=2)

print(f"Added {added_b1} to EN B1. Current count: {len(en_b1)}")
