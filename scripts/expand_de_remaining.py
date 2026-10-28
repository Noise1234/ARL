#!/usr/bin/env python3
"""
Expand German A2 and B2 datasets to reach > 3,200 total German words.
Strictly adheres to all linguistic rules in test/dataset.test.js.
"""
import json
import os
from vocab_helper import nfc, make_de_noun, make_de_verb, make_de_other, ROOT

def load_dataset(filename):
    p = os.path.join(ROOT, 'data/de', filename)
    with open(p, 'r', encoding='utf-8') as f:
        return json.load(f), p

# Gather all seen words across A1, A2, B1, B2 to prevent any duplicates
seen = set()
for fn in ['vocab_a1.json', 'vocab_a2.json', 'vocab_b1.json', 'vocab_b2.json']:
    p = os.path.join(ROOT, 'data/de', fn)
    with open(p, 'r', encoding='utf-8') as f:
        for x in json.load(f):
            seen.add(x['word'].strip().lower())

# =========================================================================
# GERMAN A2 EXPANSION (Target: bring A2 from 303 to 750+, +450 items)
# =========================================================================
a2_extra_nouns = [
    # Kitchen & Cooking
    ("Suppentopf", "der", "-¨e", "шөлний тогоо", "soup pot", "Küche"),
    ("Bratpfanne", "die", "-n", "хайруулын таваг", "frying pan", "Küche"),
    ("Schneidebrett", "das", "-er", "хэрчих мод", "cutting board", "Küche"),
    ("Gewürz", "das", "-e", "амтлагч", "spice, seasoning", "Küche"),
    ("Kräuter", "die", "-", "анхилуун ургамал", "herbs", "Küche"),
    ("Teig", "der", "-e", "зуурмаг", "dough", "Küche"),
    ("Backofen", "der", "-¨", "шарах шүүгээ", "baking oven", "Küche"),
    ("Herdplatte", "die", "-n", "плитканы тавцан", "hotplate, stovetop", "Küche"),
    ("Mikrowelle", "die", "-n", "богино долгионы зуух", "microwave", "Küche"),
    ("Geschirrspüler", "der", "-", "аяга таваг угаагч", "dishwasher", "Küche"),
    ("Spülbecken", "das", "-", "угаалтуур (гал тогооны)", "kitchen sink", "Küche"),
    ("Schwamm", "der", "-¨e", "порлон, угаагч", "sponge", "Küche"),
    ("Küchentuch", "das", "-¨er", "гал тогооны алчуур", "kitchen towel", "Küche"),
    ("Besteck", "das", "-e", "хоолны хэрэгсэл", "cutlery", "Küche"),
    ("Vorspeise", "die", "-n", "зууш, эхний хоол", "starter, appetizer", "Essen"),
    ("Hauptgericht", "das", "-e", "гол хоол", "main course", "Essen"),
    ("Nachspeise", "die", "-n", "амттан, амт хачир", "dessert", "Essen"),
    ("Dessert", "das", "-s", "амттан", "dessert", "Essen"),
    ("Beilage", "die", "-n", "хачир", "side dish", "Essen"),
    ("Spezialität", "die", "-en", "тусгай хоол, онцлог", "specialty", "Essen"),
    ("Trinkgeld", "das", "-er", "цайны мөнгө", "tip, gratuity", "Essen"),
    ("Speisekarte", "die", "-n", "хоолны цэс", "menu", "Essen"),
    ("Getränkekarte", "die", "-n", "уншлагын цэс", "drinks menu", "Essen"),
    ("Gastfreundschaft", "die", "-", "зочломтгой зан", "hospitality", "Gesellschaft"),

    # Work & Office
    ("Besprechungsraum", "der", "-¨e", "хурлын өрөө", "meeting room", "Beruf"),
    ("Tagesordnung", "die", "-en", "хэлэлцэх асуудал", "agenda", "Beruf"),
    ("Protokoll", "das", "-e", "хурлын тэмдэглэл", "minutes, protocol", "Beruf"),
    ("Unterlage", "die", "-n", "баримт бичиг, материал", "documents, records", "Beruf"),
    ("Präsentation", "die", "-en", "танилцуулга", "presentation", "Beruf"),
    ("Vortrag", "der", "-¨e", "илтгэл", "lecture, presentation", "Beruf"),
    ("Kollegium", "das", "-ien", "хамт олон", "teaching staff, colleagues", "Beruf"),
    ("Arbeitsvertrag", "der", "-¨e", "хөдөлмөрийн гэрээ", "employment contract", "Beruf"),
    ("Kündigungsfrist", "die", "-en", "цуцлах хугацаа", "notice period", "Beruf"),
    ("Probezeit", "die", "-en", "туршилтын хугацаа", "probationary period", "Beruf"),
    ("Gleitzeit", "die", "-", "уян хатан ажлын цаг", "flextime", "Beruf"),
    ("Teilzeit", "die", "-", "хагас цагийн ажил", "part-time", "Beruf"),
    ("Vollzeit", "die", "-", "бүтэн цагийн ажил", "full-time", "Beruf"),
    ("Schichtarbeit", "die", "-en", "ээлжийн ажил", "shift work", "Beruf"),
    ("Weiterbildung", "die", "-en", "мэргэжил дээшлүүлэлт", "further education", "Beruf"),
    ("Berufsleben", "das", "-", "мэргэжлийн амьдрал", "working life", "Beruf"),
    ("Lebensunterhalt", "der", "-", "амьжиргааны зардал", "livelihood, living costs", "Beruf"),
    ("Einkommen", "das", "-", "орлого", "income", "Wirtschaft"),
    ("Netto", "das", "-", "цэвэр дүн (татварын дараах)", "net amount", "Wirtschaft"),
    ("Brutto", "das", "-", "нийт дүн (татварын өмнөх)", "gross amount", "Wirtschaft"),
    ("Überweisung", "die", "-en", "банкны шилжүүлэг", "bank transfer", "Wirtschaft"),
    ("Dauerauftrag", "der", "-¨e", "байнгын шилжүүлгийн даалгавар", "standing order", "Wirtschaft"),
    ("Kontoauszug", "der", "-¨e", "дансны хуулга", "bank statement", "Wirtschaft"),
    ("Zinsen", "die", "-", "хүү (банкны)", "interest", "Wirtschaft"),
    ("Kredit", "der", "-e", "зээл", "loan, credit", "Wirtschaft"),
    ("Schulden", "die", "-", "өр төлбөр", "debts", "Wirtschaft"),

    # Health & Medical Care
    ("Hausarzt", "der", "-¨e", "өрхийн эмч", "family doctor, GP", "Gesundheit"),
    ("Facharzt", "der", "-¨e", "нарийн мэргэжлийн эмч", "specialist doctor", "Gesundheit"),
    ("Zahnarzt", "der", "-¨e", "шүдний эмч", "dentist", "Gesundheit"),
    ("Augenarzt", "der", "-¨e", "нүдний эмч", "eye doctor, ophthalmologist", "Gesundheit"),
    ("Kinderarzt", "der", "-¨e", "хүүхдийн эмч", "pediatrician", "Gesundheit"),
    ("Notfall", "der", "-¨e", "яаралтай тохиолдол", "emergency", "Gesundheit"),
    ("Krankenversicherung", "die", "-en", "эрүүл мэндийн даатгал", "health insurance", "Gesundheit"),
    ("Versichertenkarte", "die", "-n", "даатгалын карт", "insurance card", "Gesundheit"),
    ("Blutuntersuchung", "die", "-en", "цусны шинжилгээ", "blood test", "Gesundheit"),
    ("Röntgenbild", "das", "-er", "рентген зураг", "X-ray image", "Gesundheit"),
    ("Ultraschall", "der", "-e", "хэт авиан оношилгоо", "ultrasound", "Gesundheit"),
    ("Diagnose", "die", "-n", "онош", "diagnosis", "Gesundheit"),
    ("Therapie", "die", "-n", "эмчилгээ, засал", "therapy", "Gesundheit"),
    ("Heilung", "die", "-en", "эдгэрэлт", "cure, recovery", "Gesundheit"),
    ("Schmerzmittel", "das", "-", "өвчин намдаагч", "painkiller", "Gesundheit"),
    ("Hustensaft", "der", "-¨e", "ханиалгын сироп", "cough syrup", "Gesundheit"),
    ("Nasenspray", "das", "-s", "хамрын цацлага", "nasal spray", "Gesundheit"),
    ("Augentropfen", "die", "-", "нүдний дусаалга", "eye drops", "Gesundheit"),
    ("Verbandkasten", "der", "-¨", "анхны тусламжийн хайрцаг", "first-aid kit", "Gesundheit"),
    ("Thermometer", "das", "-", "халууны шил", "thermometer", "Gesundheit"),
    ("Rollstuhl", "der", "-¨e", "тэргэнцэр", "wheelchair", "Gesundheit"),
    ("Krücke", "die", "-n", "таяг", "crutch", "Gesundheit"),

    # Housing & Infrastructure
    ("Wohnungsanzeige", "die", "-n", "байрны зар", "housing ad", "Wohnen"),
    ("Wohnungsbesichtigung", "die", "-en", "байр үзэх", "apartment viewing", "Wohnen"),
    ("Warmmiete", "die", "-n", "халаалттай түрээсийн төлбөр", "warm rent (incl. heating)", "Wohnen"),
    ("Kaltmiete", "die", "-n", "үндсэн түрээсийн төлбөр", "cold rent (excl. heating)", "Wohnen"),
    ("Wohnfläche", "die", "-n", "амьдрах талбай", "living space", "Wohnen"),
    ("Quadratmeter", "der", "-", "хавтгай дөрвөлжин метр", "square meter", "Wohnen"),
    ("Nebenkostenabrechnung", "die", "-en", "хэрэглээний төлбөрийн тооцоо", "utility bill statement", "Wohnen"),
    ("Einbauküche", "die", "-n", "суурилуулсан гал тогооны тавилга", "fitted kitchen", "Wohnen"),
    ("Fliese", "die", "-n", "плита, шаазан хавтан", "tile", "Wohnen"),
    ("Parkett", "das", "-e", "паркетан шал", "parquet floor", "Wohnen"),
    ("Balkontür", "die", "-en", "тагтны хаалга", "balcony door", "Wohnen"),
    ("Fensterbrett", "das", "-er", "цонхны тавцан", "windowsill", "Wohnen"),
    ("Rollladen", "der", "-¨", "цонхны хаалт", "roller shutter", "Wohnen"),
    ("Deckenlampe", "die", "-n", "таазны гэрэл", "ceiling light", "Wohnen"),
    ("Wanduhr", "die", "-en", "ханын цаг", "wall clock", "Wohnen"),
    ("Steckdosenleiste", "die", "-n", "уртасгагч залгуур", "power strip", "Wohnen"),
    ("Mülltonne", "die", "-n", "хогийн сав", "dustbin, trash container", "Wohnen"),
    ("Altpapier", "das", "-", "хаягдал цаас", "waste paper", "Umwelt"),
    ("Biomüll", "der", "-", "органик хаягдал", "organic waste", "Umwelt"),
    ("Wertstoffhof", "der", "-¨e", "дахин боловсруулах цэг", "recycling center", "Umwelt"),

    # Transport, Vehicle & Traffic
    ("Führerschein", "der", "-e", "жолооны үнэмлэх", "driving license", "Verkehr"),
    ("Fahrzeug", "das", "-e", "тээврийн хэрэгсэл", "vehicle", "Verkehr"),
    ("Personenkraftwagen", "der", "-", "суудлын автомашин", "passenger car", "Verkehr"),
    ("Lastkraftwagen", "der", "-", "ачааны машин", "truck, lorry", "Verkehr"),
    ("Motorradhelm", "der", "-e", "мотоциклын дуулга", "motorcycle helmet", "Verkehr"),
    ("Fahrradweg", "der", "-e", "дугуйн зам", "bicycle lane", "Verkehr"),
    ("Fußgängerzone", "die", "-n", "явган хүний бүс", "pedestrian zone", "Stadt"),
    ("Gehweg", "der", "-e", "явган хүний зам", "sidewalk, pavement", "Stadt"),
    ("Zebrastreifen", "der", "-", "явган хүний гарц", "crosswalk, zebra crossing", "Stadt"),
    ("Kreisverkehr", "der", "-e", "тойрог хөдөлгөөн", "roundabout", "Verkehr"),
    ("Einbahnstraße", "die", "-n", "нэг чигийн хөдөлгөөнтэй гудамж", "one-way street", "Verkehr"),
    ("Parkschein", "der", "-e", "зогсоолын тасалбар", "parking ticket", "Verkehr"),
    ("Parkscheinautomat", "der", "-en", "зогсоолын төлбөрийн машин", "parking ticket machine", "Verkehr"),
    ("Strafzettel", "der", "-", "торгуулийн хуудас", "parking fine, ticket", "Verkehr"),
    ("Geschwindigkeitsbegrenzung", "die", "-en", "хурдны хязгаарлалт", "speed limit", "Verkehr"),
    ("Baustelle", "die", "-n", "барилгын талбай, зам засвар", "construction site", "Stadt"),
    ("Stauwarnung", "die", "-en", "замын түгжрэлийн сэрэмжлүүлэг", "traffic jam warning", "Verkehr"),
    ("Navigationssystem", "das", "-e", "хөтөч систем, навигаци", "navigation system", "Technik"),
    ("Tankdeckel", "der", "-", "шатахууны савны таг", "fuel tank cap", "Verkehr"),
    ("Scheibenwischer", "der", "-", "шил арчигч", "windshield wiper", "Verkehr"),
    ("Scheinwerfer", "der", "-", "машины их гэрэл", "headlight", "Verkehr"),
    ("Reifen", "der", "-", "дугуй (машины)", "tire", "Verkehr"),
    ("Panne", "die", "-n", "саатал, эвдрэл", "breakdown", "Verkehr"),
    ("Abschleppdienst", "der", "-e", "чирэх үйлчилгээ", "towing service", "Verkehr"),

    # Weather & Nature
    ("Wetterbericht", "der", "-e", "цаг агаарын мэдээ", "weather report", "Wetter"),
    ("Vorhersage", "die", "-n", "урьдчилсан мэдээ", "forecast", "Wetter"),
    ("Hitzewelle", "die", "-n", "хэт халалтын давалгаа", "heatwave", "Wetter"),
    ("Kälteeinbruch", "der", "-¨e", "гэнэтийн хүйтрэлт", "cold snap", "Wetter"),
    ("Frost", "der", "-¨e", "жавар, хяруу", "frost", "Wetter"),
    ("Glatteis", "das", "-", "халтиргаа, гөлгөр мөс", "black ice", "Wetter"),
    ("Schneefall", "der", "-¨e", "цас оролт", "snowfall", "Wetter"),
    ("Regenschauer", "der", "-", "зурвас ширүүн бороо", "rain shower", "Wetter"),
    ("Gewitterwolke", "die", "-n", "аадар борооны үүл", "thundercloud", "Wetter"),
    ("Blitz", "der", "-e", "аянга цахилгаан", "lightning", "Wetter"),
    ("Donner", "der", "-", "аянгын дуу", "thunder", "Wetter"),
    ("Hagel", "der", "-", "мөндөр", "hail", "Wetter"),
    ("Regenbogen", "der", "-¨", "солонго", "rainbow", "Wetter"),
    ("Sonnenschein", "der", "-", "нарны туяа, гийгүүлэл", "sunshine", "Wetter"),
    ("Schatten", "der", "-", "сүүдэр", "shadow, shade", "Wetter"),
    ("Brise", "die", "-n", "зөөлөн салхи", "breeze", "Wetter"),
    ("Windstille", "die", "-", "салхигүй намуун байдал", "calm, windlessness", "Wetter"),
    ("Luftfeuchtigkeit", "die", "-", "агаарын чийгшил", "air humidity", "Wetter"),
    ("Landschaft", "die", "-en", "байгалийн үзэмж", "landscape, scenery", "Natur"),
    ("Gebirge", "das", "-", "уул нурууд", "mountain range", "Natur"),
    ("Tal", "das", "-¨er", "хөндий", "valley", "Natur"),
    ("Küste", "die", "-n", "эргийн шугам", "coast, shore", "Natur"),
    ("Wiese", "die", "-n", "нуга, ногоон тал", "meadow", "Natur"),
    ("Feld", "das", "-er", "тариалангийн талбай", "field", "Natur"),
    ("Bauernhof", "der", "-¨e", "ферм, тариалангийн газар", "farm", "Natur")
]

a2_extra_verbs = [
    ("nachdenken", "nachdenken | denkt nach | dachte nach | hat nachgedacht", "über + Akkusativ", "эргэцүүлэн бодох", "to reflect, ponder", "Kognition"),
    ("vergleichen", "vergleichen | vergleicht | verglich | hat verglichen", "mit + Dativ", "харьцуулах", "to compare", "Kognition"),
    ("beschreiben", "beschreiben | beschreibt | beschrieb | hat beschrieben", "+ Akkusativ", "дүрслэх, тодорхойлох", "to describe", "Sprache"),
    ("begründen", "begründen | begründet | begründete | hat begründet", "+ Akkusativ", "үндэслэл гаргах", "to justify, give reasons", "Kommunikation"),
    ("zusammenfassen", "zusammenfassen | fasst zusammen | fasste zusammen | hat zusammengefasst", "+ Akkusativ", "багцлан хураангуйлах", "to summarize", "Lernen"),
    ("übersetzen", "übersetzen | übersetzt | übersetzte | hat übersetzt", "in + Akkusativ", "орчуулах", "to translate", "Sprache"),
    ("korrigieren", "korrigieren | korrigiert | korrigierte | hat korrigiert", "+ Akkusativ", "засаж залруулах", "to correct", "Lernen"),
    ("beweisen", "beweisen | beweist | bewies | hat bewiesen", "+ Akkusativ", "нотлох, батлах", "to prove", "Kognition"),
    ("vermuten", "vermuten | vermutet | vermutete | hat vermutet", "+ Akkusativ", "таамаглах", "to assume, suspect", "Kognition"),
    ("erwarten", "erwarten | erwartet | erwartete | hat erwartet", "+ Akkusativ", "хүлээх, найдах", "to expect", "Gefühle"),
    ("beobachten", "beobachten | beobachtet | beobachtete | hat beobachtet", "+ Akkusativ", "ажиглах", "to observe", "Kognition"),
    ("überprüfen", "überprüfen | überprüft | überprüfte | hat überprüft", "+ Akkusativ", "дахин нягтлах", "to check, review", "Lernen"),
    ("feststellen", "feststellen | stellt fest | stellte fest | hat festgestellt", "+ Akkusativ", "олж тогтоох", "to determine, ascertain", "Kognition"),
    ("kündigen", "kündigen | kündigt | kündigte | hat gekündigt", "+ Dativ / Akkusativ", "ажлаас гарах, цуцлах", "to resign, cancel", "Beruf"),
    ("abschließen", "abschließen | schließt ab | schloss ab | hat abgeschlossen", "+ Akkusativ", "түгжих, төгсөх, гэрээ байгуулах", "to lock, conclude", "Alltag"),
    ("beantragen", "beantragen | beantragt | beantragte | hat beantragt", "+ Akkusativ", "өргөдөл гаргах", "to apply for", "Beruf"),
    ("genehmigen", "genehmigen | genehmigt | genehmigte | hat genehmigt", "+ Akkusativ", "зөвшөөрөх, батлах", "to approve", "Beruf"),
    ("ablehnen", "ablehnen | lehnt ab | lehnte ab | hat abgelehnt", "+ Akkusativ", "татгалзах", "to decline, reject", "Kommunikation"),
    ("transportieren", "transportieren | transportiert | transportierte | hat transportiert", "+ Akkusativ", "тээвэрлэх", "to transport", "Verkehr"),
    ("versichern", "versichern | versichert | versicherte | hat versichert", "+ Akkusativ", "даатгуулах, бататгах", "to insure, assure", "Alltag"),
    ("reklamieren", "reklamieren | reklamiert | reklamierte | hat reklamiert", "+ Akkusativ", "гомдол мэдүүлэх", "to complain about", "Einkaufen"),
    ("überweisen", "überweisen | überweist | überwies | hat überwiesen", "+ Dativ + Akkusativ", "шилжүүлэх (мөнгө)", "to transfer (money)", "Wirtschaft"),
    ("abheben", "abheben | hebt ab | hob ab | hat abgehoben", "+ Akkusativ", "данснаас авах (мөнгө)", "to withdraw (money)", "Wirtschaft"),
    ("einzahlen", "einzahlen | zahlt ein | zahlte ein | hat eingezahlt", "auf + Akkusativ", "дансанд хийх (мөнгө)", "to deposit (money)", "Wirtschaft"),
    ("sparen", "sparen | spart | sparte | hat gespart", "für + Akkusativ", "хэмнэх, хуримтлуулах", "to save, economize", "Wirtschaft")
]

a2_extra_adjectives = [
    ("sparsam", "adj", "арвич хямгач", "thrifty, economical", "Charakter"),
    ("großzügig", "adj", "өглөгч, өгөөмөр", "generous", "Charakter"),
    ("zuverlässig", "adj", "найдвартай", "reliable, dependable", "Charakter"),
    ("unzuverlässig", "adj", "найдваргүй", "unreliable", "Charakter"),
    ("pessimistisch", "adj", "гутранги", "pessimistic", "Charakter"),
    ("optimistisch", "adj", "өгөөмөр өөдрөг", "optimistic", "Charakter"),
    ("lebendig", "adj", "хөгжилтэй амьд", "lively, alive", "Eigenschaft"),
    ("einsam", "adj", "ганцаардмал", "lonely", "Gefühle"),
    ("mutlos", "adj", "итгэл алдарсан", "discouraged", "Gefühle"),
    ("überzeugt", "adj", "итгэл төгс", "convinced", "Gefühle"),
    ("beruhigt", "adj", "сэтгэл амарсан", "reassured, relieved", "Gefühle"),
    ("begeistert", "adj", "сэтгэл хөөрсөн", "enthusiastic", "Gefühle"),
    ("enttäuscht", "adj", "сэтгэл дундуур", "disappointed", "Gefühle"),
    ("erschöpft", "adj", "туйлдсан", "exhausted", "Gesundheit"),
    ("kraftlos", "adj", "тэнхээгүй", "weak, powerless", "Gesundheit"),
    ("schwindelig", "adj", "толгой эргэсэн", "dizzy", "Gesundheit"),
    ("giftig", "adj", "хортой", "poisonous, toxic", "Umwelt"),
    ("ungiftig", "adj", "хоргүй", "non-toxic", "Umwelt"),
    ("biologisch", "adj", "органик, биологийн", "biological, organic", "Umwelt"),
    ("nachhaltig", "adj", "тогтвортой хөгжлийн", "sustainable", "Umwelt")
]

# Apply to A2
a2_data, a2_path = load_dataset('vocab_a2.json')
a2_idx = len(a2_data) + 1
a2_added = 0

for w, art, pl, mn, en, top in a2_extra_nouns:
    if w.strip().lower() not in seen:
        entry = make_de_noun(a2_idx, w, art, pl, mn, en, topic=top)
        entry['level'] = 'A2'
        a2_data.append(entry)
        seen.add(w.strip().lower())
        a2_idx += 1
        a2_added += 1

for w, forms, rek, mn, en, top in a2_extra_verbs:
    if w.strip().lower() not in seen:
        entry = make_de_verb(a2_idx, w, forms, rek, mn, en, topic=top)
        entry['level'] = 'A2'
        a2_data.append(entry)
        seen.add(w.strip().lower())
        a2_idx += 1
        a2_added += 1

for w, pos, mn, en, top in a2_extra_adjectives:
    if w.strip().lower() not in seen:
        entry = make_de_other(a2_idx, w, pos, mn, en, topic=top)
        entry['level'] = 'A2'
        a2_data.append(entry)
        seen.add(w.strip().lower())
        a2_idx += 1
        a2_added += 1

print(f"Added {a2_added} to DE A2. Total DE A2 now: {len(a2_data)}")
with open(a2_path, 'w', encoding='utf-8') as f:
    json.dump(a2_data, f, ensure_ascii=False, indent=2)

# =========================================================================
# GERMAN B2 EXPANSION (Target: bring B2 from 100 to 750+, +650 items)
# Professional, Academic, Abstract & Societal Concepts
# =========================================================================
b2_nouns = [
    # Science, Research & Academia
    ("Wissenschaft", "die", "-en", "шинжлэх ухаан", "science", "Wissenschaft"),
    ("Forschung", "die", "-en", "эрдэм шинжилгээ, судалгаа", "research", "Wissenschaft"),
    ("Erkenntnis", "die", "-se", "танин мэдэхүй, ухаарал", "insight, finding", "Wissenschaft"),
    ("Hypothese", "die", "-n", "таамаглал", "hypothesis", "Wissenschaft"),
    ("Experiment", "das", "-e", "туршилт", "experiment", "Wissenschaft"),
    ("Labor", "das", "-e", "лаборатори", "laboratory", "Wissenschaft"),
    ("Theorie", "die", "-n", "онол", "theory", "Wissenschaft"),
    ("Methode", "die", "-n", "арга барил, арга зүй", "method", "Wissenschaft"),
    ("Verfahren", "das", "-", "үйл явц, ажиллагаа", "procedure, process", "Wissenschaft"),
    ("Kriterium", "das", "-ien", "шалгуур үзүүлэлт", "criterion", "Wissenschaft"),
    ("Analyse", "die", "-n", "шинжилгээ, задлан шинжлэл", "analysis", "Wissenschaft"),
    ("Synthese", "die", "-n", "нэгтгэл, нийлэгжилт", "synthesis", "Wissenschaft"),
    ("Phänomen", "das", "-e", "үзэгдэл", "phenomenon", "Wissenschaft"),
    ("Prinzip", "das", "-ien", "зарчим", "principle", "Wissenschaft"),
    ("Struktur", "die", "-en", "бүтэц, бүтэц тогтолцоо", "structure", "Wissenschaft"),
    ("Funktion", "die", "-en", "үүрэг, үйл ажиллагаа", "function", "Wissenschaft"),
    ("Dimension", "die", "-en", "хэмжигдэхүүн, цар хүрээ", "dimension", "Wissenschaft"),
    ("Parameter", "der", "-", "параметр, үзүүлэлт", "parameter", "Wissenschaft"),
    ("Statistik", "die", "-en", "статистик тоо бүртгэл", "statistics", "Wissenschaft"),
    ("Erhebung", "die", "-en", "судалгаа, мэдээлэл цуглуулалт", "survey, inquiry", "Wissenschaft"),
    ("Stichprobe", "die", "-n", "түүвэр судалгаа", "sample, spot check", "Wissenschaft"),
    ("Fachbereich", "der", "-e", "мэргэжлийн салбар", "department, discipline", "Wissenschaft"),
    ("Dozent", "der", "-en", "их сургуулийн багш, лектор", "lecturer", "Wissenschaft"),
    ("Dozentin", "die", "-nen", "эмэгтэй багш, лектор", "female lecturer", "Wissenschaft"),
    ("Professor", "der", "-en", "профессор", "professor", "Wissenschaft"),
    ("Dissertation", "die", "-en", "докторын зэрэг горилсон бүтээл", "doctoral dissertation", "Wissenschaft"),
    ("Publikation", "die", "-en", "эрдэм шинжилгээний нийтлэл", "publication", "Wissenschaft"),
    ("Fachzeitschrift", "die", "-en", "мэргэжлийн эрдэм шинжилгээний сэтгүүл", "academic journal", "Wissenschaft"),
    ("Tagung", "die", "-en", "эрдэм шинжилгээний хурал", "conference, convention", "Wissenschaft"),
    ("Kongress", "der", "-e", "их хурал, чуулган", "congress", "Wissenschaft"),

    # Society, Politics, Law & Ethics
    ("Gesellschaft", "die", "-en", "нийгэм", "society", "Gesellschaft"),
    ("Gemeinschaft", "die", "-en", "хамтын нийгэмлэг", "community", "Gesellschaft"),
    ("Bevölkerung", "die", "-en", "хүн ам", "population", "Gesellschaft"),
    ("Bürger", "der", "-", "иргэн", "citizen", "Politik"),
    ("Bürgerin", "die", "-nen", "иргэн эмэгтэй", "female citizen", "Politik"),
    ("Verfassung", "die", "-en", "үндсэн хууль", "constitution", "Politik"),
    ("Grundgesetz", "das", "-e", "үндсэн хууль", "basic law, constitution", "Politik"),
    ("Gesetzgebung", "die", "-en", "хууль тогтоомж", "legislation", "Politik"),
    ("Rechtsstaat", "der", "-en", "эрх зүйт төр", "constitutional state", "Politik"),
    ("Demokratie", "die", "-n", "ардчилал", "democracy", "Politik"),
    ("Parlament", "das", "-e", "парламент", "parliament", "Politik"),
    ("Abgeordnete", "der", "-n", "парламентын гишүүн", "member of parliament", "Politik"),
    ("Wahl", "die", "-en", "сонгууль, сонголт", "election, choice", "Politik"),
    ("Stimmzettel", "der", "-", "саналын хуудас", "ballot paper", "Politik"),
    ("Opposition", "die", "-en", "сөрөг хүчин", "opposition", "Politik"),
    ("Koalition", "die", "-en", "эвсэл", "coalition", "Politik"),
    ("Regierung", "die", "-en", "засгийн газар", "government", "Politik"),
    ("Ministerium", "das", "-ien", "яам", "ministry", "Politik"),
    ("Behörde", "die", "-n", "төрийн эрх бүхий байгууллага", "authority, public agency", "Politik"),
    ("Amt", "das", "-¨er", "алба, газар, албан тушаал", "office, department", "Politik"),
    ("Justiz", "die", "-", "шүүх засаглал, шударга ёс", "judiciary, justice", "Recht"),
    ("Gericht", "das", "-e", "шүүх, хоол", "court, dish", "Recht"),
    ("Richter", "der", "-", "шүүгч", "judge", "Recht"),
    ("Rechtsanwalt", "der", "-¨e", "өмгөөлөгч", "lawyer, attorney", "Recht"),
    ("Staatsanwalt", "der", "-¨e", "прокурор", "public prosecutor", "Recht"),
    ("Angeklagte", "der", "-n", "шүүгдэгч", "accused, defendant", "Recht"),
    ("Zeuge", "der", "-n", "гэрч", "witness", "Recht"),
    ("Urteil", "das", "-e", "шүүхийн шийдвэр, шүүмж", "verdict, judgment", "Recht"),
    ("Klage", "die", "-n", "нэхэмжлэл, гомдол", "lawsuit, complaint", "Recht"),
    ("Verbrechen", "das", "-", "гэмт хэрэг", "crime", "Recht"),
    ("Straftat", "die", "-en", "гэмт үйлдэл", "criminal offense", "Recht"),
    ("Täter", "der", "-", "гэмт хэрэгтэн", "perpetrator, culprit", "Recht"),
    ("Opfer", "das", "-", "хохирогч, тахил", "victim, sacrifice", "Recht"),
    ("Haftstrafe", "die", "-n", "хорих ял", "prison sentence", "Recht"),
    ("Gerechtigkeit", "die", "-", "шударга ёс", "justice, fairness", "Philosophie"),
    ("Menschenwürde", "die", "-", "хүний нэр төр", "human dignity", "Philosophie"),
    ("Freiheit", "die", "-en", "эрх чөлөө", "freedom, liberty", "Philosophie"),
    ("Gleichberechtigung", "die", "-", "тэгш эрх", "equal rights", "Gesellschaft"),
    ("Diskriminierung", "die", "-en", "ялгаварлан гадуурхалт", "discrimination", "Gesellschaft"),
    ("Toleranz", "die", "-", "хүлцэл тэвчээр", "tolerance", "Gesellschaft"),
    ("Solidarität", "die", "-", "эв санааны нэгдэл", "solidarity", "Gesellschaft"),
    ("Integration", "die", "-en", "нийгэмшилт, нэгдэл", "integration", "Gesellschaft"),
    ("Vielfalt", "die", "-", "олон янз байдал", "diversity", "Gesellschaft"),
    ("Wertesystem", "das", "-e", "үнэт зүйлсийн тогтолцоо", "value system", "Gesellschaft"),

    # Economy, Business, Finance & Industry
    ("Wirtschaft", "die", "-en", "эдийн засаг", "economy", "Wirtschaft"),
    ("Handel", "der", "-", "худалдаа, наймаа", "trade, commerce", "Wirtschaft"),
    ("Industrie", "die", "-n", "аж үйлдвэр", "industry", "Wirtschaft"),
    ("Unternehmen", "das", "-", "аж ахуйн нэгж, компани", "enterprise, company", "Wirtschaft"),
    ("Konzern", "der", "-e", "корпораци, концерн", "group of companies, corporation", "Wirtschaft"),
    ("Betrieb", "der", "-e", "үйлдвэр, аж ахуй", "factory, operation", "Wirtschaft"),
    ("Vorstand", "der", "-¨e", "удирдах зөвлөл", "executive board", "Wirtschaft"),
    ("Geschäftsführung", "die", "-en", "гүйцэтгэх удирдлага", "management", "Wirtschaft"),
    ("Aufsichtsrat", "der", "-¨e", "хяналтын зөвлөл", "supervisory board", "Wirtschaft"),
    ("Gewerkschaft", "die", "-en", "үйлдвэрчний эвлэл", "trade union", "Wirtschaft"),
    ("Betriebsrat", "der", "-¨e", "үйлдвэрийн зөвлөл", "works council", "Wirtschaft"),
    ("Streik", "der", "-s", "ажил хаялт", "strike", "Wirtschaft"),
    ("Tarifvertrag", "der", "-¨e", "хамтын тарифын гэрээ", "collective agreement", "Wirtschaft"),
    ("Konjunktur", "die", "-en", "эдийн засгийн төлөв", "economic cycle, boom", "Wirtschaft"),
    ("Wachstum", "das", "-", "өсөлт", "growth", "Wirtschaft"),
    ("Rezession", "die", "-en", "эдийн засгийн уналт", "recession", "Wirtschaft"),
    ("Inflation", "die", "-en", "инфляци", "inflation", "Wirtschaft"),
    ("Deflation", "die", "-en", "дефляци", "deflation", "Wirtschaft"),
    ("Kaufkraft", "die", "-¨e", "худалдан авах чадвар", "purchasing power", "Wirtschaft"),
    ("Wettbewerb", "der", "-e", "өрсөлдөөн", "competition", "Wirtschaft"),
    ("Konkurrenz", "die", "-en", "өрсөлдөгч тал, өрсөлдөөн", "rivalry, competition", "Wirtschaft"),
    ("Monopol", "das", "-e", "монополь эрх", "monopoly", "Wirtschaft"),
    ("Marktanteil", "der", "-e", "зах зээлийн эзлэх хувь", "market share", "Wirtschaft"),
    ("Umsatz", "der", "-¨e", "борлуулалтын орлого", "turnover, sales", "Wirtschaft"),
    ("Gewinn", "der", "-e", "ашиг", "profit, gain", "Wirtschaft"),
    ("Verlust", "der", "-e", "алдагдал", "loss", "Wirtschaft"),
    ("Bilanz", "die", "-en", "баланс, тайлан", "balance sheet", "Wirtschaft"),
    ("Investition", "die", "-en", "хөрөнгө оруулалт", "investment", "Wirtschaft"),
    ("Kapital", "das", "-ien", "хөрөнгө, капитал", "capital, assets", "Wirtschaft"),
    ("Aktie", "die", "-n", "хувьцаа", "share, stock", "Wirtschaft"),
    ("Börse", "die", "-n", "хөрөнгийн бирж", "stock exchange", "Wirtschaft"),
    ("Wertpapier", "das", "-e", "үнэт цаас", "security, bond", "Wirtschaft"),
    ("Fonds", "der", "-", "сан (хөрөнгө оруулалтын)", "fund", "Wirtschaft"),
    ("Währung", "die", "-en", "мөнгөн тэмдэгт, валют", "currency", "Wirtschaft"),
    ("Wechselkurs", "der", "-e", "ханш", "exchange rate", "Wirtschaft"),
    ("Export", "der", "-e", "экспорт, гадаад борлуулалт", "export", "Wirtschaft"),
    ("Import", "der", "-e", "импорт, гадаад худалдан авалт", "import", "Wirtschaft"),
    ("Handelsbilanz", "die", "-en", "худалдааны тэнцэл", "trade balance", "Wirtschaft"),
    ("Globalisierung", "die", "-", "даяаршил", "globalization", "Wirtschaft"),
    ("Nachhaltigkeit", "die", "-", "тогтвортой байдал", "sustainability", "Umwelt"),
    ("Ressource", "die", "-n", "нөөц бололцоо", "resource", "Umwelt"),
    ("Rohstoff", "der", "-e", "түүхий эд", "raw material", "Wirtschaft"),
    ("Lieferkette", "die", "-n", "нийлүүлэлтийн сүлжээ", "supply chain", "Wirtschaft"),
    ("Logistik", "die", "-", "логистик", "logistics", "Wirtschaft"),

    # Technology, Digitalization & Media
    ("Digitalisierung", "die", "-", "цахимжилт", "digitalization", "Technik"),
    ("Künstliche Intelligenz", "die", "-", "хиймэл оюун ухаан", "artificial intelligence", "Technik"),
    ("Algorithmus", "der", "-men", "алгоритм", "algorithm", "Technik"),
    ("Datenschutz", "der", "-", "өгөгдлийн хамгаалалт", "data protection, privacy", "Technik"),
    ("Privatsphäre", "die", "-", "хувийн орон зай, хувийн нууц", "privacy", "Technik"),
    ("Cyberangriff", "der", "-e", "цахим халдлага", "cyber attack", "Technik"),
    ("Verschlüsselung", "die", "-en", "нууцлал, криптограф", "encryption", "Technik"),
    ("Netzwerk", "das", "-e", "сүлжээ", "network", "Technik"),
    ("Schnittstelle", "die", "-n", "интерфэйс, холбоос", "interface", "Technik"),
    ("Bandbreite", "die", "-n", "зурвасын өргөн", "bandwidth", "Technik"),
    ("Cloud", "die", "-s", "үүлэн технологи", "cloud storage", "Technik"),
    ("Server", "der", "-", "сервер", "server", "Technik"),
    ("Datenbank", "die", "-en", "өгөгдлийн сан", "database", "Technik"),
    ("Benutzeroberfläche", "die", "-n", "хэрэглэгчийн интерфейс", "user interface", "Technik"),
    ("Automatisierung", "die", "-en", "автоматжуулалт", "automation", "Technik"),
    ("Innovation", "die", "-en", "шинэчлэл, инноваци", "innovation", "Technik"),
    ("Patent", "das", "-e", "патент", "patent", "Technik"),
    ("Urheberrecht", "das", "-e", "зохиогчийн эрх", "copyright", "Recht"),
    ("Medienlandschaft", "die", "-en", "хэвлэл мэдээллийн орчин", "media landscape", "Medien"),
    ("Zensur", "die", "-en", "цензур, хяналт", "censorship", "Medien"),
    ("Pressefreiheit", "die", "-", "хэвлэлийн эрх чөлөө", "freedom of the press", "Medien"),
    ("Meinungsfreiheit", "die", "-", "үзэл бодлоо илэрхийлэх эрх", "freedom of speech", "Politik"),
    ("Fehlinformation", "die", "-en", "худал мэдээлэл", "misinformation", "Medien"),
    ("Quelle", "die", "-n", "эх сурвалж, булаг", "source", "Medien"),
    ("Berichterstattung", "die", "-en", "сурвалжилга, мэдээлэл хүргэлт", "reporting, coverage", "Medien"),
    ("Öffentlichkeit", "die", "-", "олон нийт", "public", "Gesellschaft"),

    # Psychology, Philosophy, Culture & Mind
    ("Bewusstsein", "das", "-", "ухамсар", "consciousness, awareness", "Psychologie"),
    ("Unterbewusstsein", "das", "-", "далд ухамсар", "subconscious", "Psychologie"),
    ("Wahrnehmung", "die", "-en", "хүртэхүй, мэдрэмж", "perception", "Psychologie"),
    ("Gedächtnis", "das", "-se", "санах ой, ой тогтоолт", "memory", "Psychologie"),
    ("Erinnerungsvermögen", "das", "-", "эргэн санах чадвар", "ability to remember", "Psychologie"),
    ("Emotion", "die", "-en", "сэтгэл хөдлөл", "emotion", "Psychologie"),
    ("Intelligenz", "die", "-", "оюун ухаан", "intelligence", "Psychologie"),
    ("Kreativität", "die", "-", "бүтээлч чадвар", "creativity", "Psychologie"),
    ("Fantasie", "die", "-n", "уран сэтгэмж", "imagination, fantasy", "Psychologie"),
    ("Intuition", "die", "-en", "зөн совин", "intuition", "Psychologie"),
    ("Instinkt", "der", "-e", "зөн билэг", "instinct", "Psychologie"),
    ("Persönlichkeit", "die", "-en", "хувь хүн, зан чанар", "personality", "Psychologie"),
    ("Charakterzug", "der", "-¨e", "зан чанарын онцлог", "character trait", "Psychologie"),
    ("Identität", "die", "-en", "өөрийн онцлог, мөн чанар", "identity", "Psychologie"),
    ("Selbstwertgefühl", "das", "-", "өөрийгөө үнэлэх үнэлэмж", "self-esteem", "Psychologie"),
    ("Motivation", "die", "-en", "эрмэлзэл, сэдэл", "motivation", "Psychologie"),
    ("Frustration", "die", "-en", "сэтгэлийн дарамт, бухимдал", "frustration", "Psychologie"),
    ("Resilienz", "die", "-", "сэтгэлийн тэнхээ, тэсвэр", "resilience", "Psychologie"),
    ("Empathie", "die", "-", "бусдыг ойлгох чадвар", "empathy", "Psychologie"),
    ("Konflikt", "der", "-e", "зөрчил, мөргөлдөөн", "conflict", "Psychologie"),
    ("Kompromiss", "der", "-e", "харилцан буулт", "compromise", "Psychologie"),
    ("Konsens", "der", "-e", "зөвшилцөл", "consensus", "Psychologie"),
    ("Dilemma", "das", "-ta", "хоёр замын бэрхшээл", "dilemma", "Philosophie"),
    ("Paradoxon", "das", "-xa", "парадокс, гаж үзэгдэл", "paradox", "Philosophie"),
    ("Ethik", "die", "-", "ёс зүй", "ethics", "Philosophie"),
    ("Moral", "die", "-", "ёс суртахуун", "morals, morality", "Philosophie"),
    ("Ästhetik", "die", "-", "гоо зүй", "aesthetics", "Philosophie"),
    ("Epoche", "die", "-n", "эрин үе", "epoch, era", "Geschichte"),
    ("Tradition", "die", "-en", "уламжлал", "tradition", "Kultur"),
    ("Erbe", "das", "-", "өв соёл, өв залгамжлал", "heritage, inheritance", "Kultur"),
    ("Monument", "das", "-e", "хөшөө дурсгал", "monument", "Kultur"),
    ("Architektur", "die", "-en", "уран барилга", "architecture", "Kultur"),
    ("Skulptur", "die", "-en", "бараг баримал", "sculpture", "Kultur"),
    ("Literatur", "die", "-en", "утга зохиол", "literature", "Kultur"),
    ("Poesie", "die", "-", "яруу найраг", "poetry", "Kultur"),
    ("Drama", "das", "-men", "жүжиг, эмгэнэлт явдал", "drama", "Kultur"),
    ("Inszenierung", "die", "-en", "жүжгийн тавилт", "staging, production", "Kultur")
]

b2_verbs = [
    ("hinterfragen", "hinterfragen | hinterfragt | hinterfragte | hat hinterfragt", "+ Akkusativ", "эргэлзэн шалгах", "to scrutinize, question", "Kognition"),
    ("widerspiegeln", "widerspiegeln | spiegelt wider | spiegelte wider | hat widergespiegelt", "+ Akkusativ", "тусгах, харуулах", "to reflect", "Kognition"),
    ("hervorheben", "hervorheben | hebt hervor | hob hervor | hat hervorgehoben", "+ Akkusativ", "цохон тэмдэглэх", "to emphasize, highlight", "Sprache"),
    ("beeinträchtigen", "beeinträchtigen | beeinträchtigt | beeinträchtigte | hat beeinträchtigt", "+ Akkusativ", "сөргөөр нөлөөлөх", "to impair, affect negatively", "Gesellschaft"),
    ("gewährleisten", "gewährleisten | gewährleistet | gewährleistete | hat gewährleistet", "+ Akkusativ", "хангах, батлах", "to guarantee, ensure", "Recht"),
    ("differenzieren", "differenzieren | differenziert | differenzierte | hat differenziert", "nach + Dativ", "ялгаж салгах", "to differentiate", "Wissenschaft"),
    ("strukturieren", "strukturieren | strukturiert | strukturierte | hat strukturiert", "+ Akkusativ", "бүтэцжүүлэх", "to structure", "Wissenschaft"),
    ("thematisieren", "thematisieren | thematisiert | thematisierte | hat thematisiert", "+ Akkusativ", "сэдэв болгон хөндөх", "to address, make a topic", "Sprache"),
    ("konkretisieren", "konkretisieren | konkretisiert | konkretisierte | hat konkretisiert", "+ Akkusativ", "тодорхой болгох", "to concretize, specify", "Wissenschaft"),
    ("relativieren", "relativieren | relativiert | relativierte | hat relativiert", "+ Akkusativ", "харьцангуй болгох", "to put into perspective", "Kognition"),
    ("verharmlosen", "verharmlosen | verharmlost | verharmloste | hat verharmlost", "+ Akkusativ", "хөнгөлж үзэх, багасгах", "to downplay, trivialize", "Kommunikation"),
    ("vernachlässigen", "vernachlässigen | vernachlässigt | vernachlässigte | hat vernachlässigt", "+ Akkusativ", "үл тоомсорлох, хаях", "to neglect", "Gesellschaft"),
    ("beschleunigen", "beschleunigen | beschleunigt | beschleunigte | hat beschleunigt", "+ Akkusativ", "хурдасгах", "to accelerate, speed up", "Wissenschaft"),
    ("verzögern", "verzögern | verzögert | verzögerte | hat verzögert", "+ Akkusativ", "хойшлуулах, саатуулах", "to delay", "Alltag"),
    ("überwinden", "überwinden | überwindet | überwand | hat überwunden", "+ Akkusativ", "даван туулах", "to overcome", "Psychologie"),
    ("bewältigen", "bewältigen | bewältigt | bewältigte | hat bewältigt", "+ Akkusativ", "шийдвэрлэх, давж гарах", "to cope with, manage", "Psychologie"),
    ("verursachen", "verursachen | verursacht | verursachte | hat verursacht", "+ Akkusativ", "үүсгэх, шалтгаалах", "to cause, bring about", "Wissenschaft"),
    ("hervorrufen", "hervorrufen | ruft hervor | rief hervor | hat hervorgerufen", "+ Akkusativ", "бий болгох, өдөөх", "to evoke, provoke", "Psychologie"),
    ("beibehalten", "beibehalten | behält bei | behielt bei | hat beibehalten", "+ Akkusativ", "хэвээр хадгалах", "to maintain, retain", "Gesellschaft"),
    ("nachweisen", "nachweisen | weist nach | wies nach | hat nachgewiesen", "+ Akkusativ", "нотлон тогтоох", "to verify, prove", "Wissenschaft"),
    ("widerlegen", "widerlegen | widerlegt | widerlegte | hat widerlegt", "+ Akkusativ", "няцаах, үгүйсгэх", "to refute, disprove", "Wissenschaft"),
    ("plädieren", "plädieren | pläдиert | plädierte | hat plädiert", "für + Akkusativ", "дэмжин санал гаргах", "to plead, advocate", "Politik"),
    ("befürworten", "befürworten | befürwortet | befürwortete | hat befürwortet", "+ Akkusativ", "сайшаах, дэмжих", "to endorse, support", "Politik"),
    ("kritisieren", "kritisieren | kritisiert | kritisierte | hat kritisiert", "an + Dativ", "шүүмжлэх", "to criticize", "Kommunikation"),
    ("evaluieren", "evaluieren | evaluiert | evaluierte | hat evaluiert", "+ Akkusativ", "үнэлж дүгнэх", "to evaluate", "Wissenschaft"),
    ("optimieren", "optimieren | optimiert | optimierte | hat optimiert", "+ Akkusativ", "хамгийн оновчтой болгох", "to optimize", "Technik"),
    ("kooperieren", "kooperieren | kooperiert | kooperierte | hat kooperiert", "mit + Dativ", "хамтран ажиллах", "to cooperate", "Wirtschaft"),
    ("konkurrieren", "konkurrieren | konkurriert | konkurrierte | hat konkurriert", "mit + Dativ", "өрсөлдөх", "to compete", "Wirtschaft"),
    ("verhandeln", "verhandeln | verhandelt | verhandelte | hat verhandelt", "über + Akkusativ", "хэлэлцээр хийх", "to negotiate", "Wirtschaft"),
    ("partizipieren", "partizipieren | partizipiert | partizipierte | hat partizipiert", "an + Dativ", "хувь хүртэх, оролцох", "to participate, share", "Gesellschaft")
]

b2_adjectives = [
    ("komplex", "adj", "нарийн нийлмэл", "complex, intricate", "Wissenschaft"),
    ("abstrakt", "adj", "хийсвэр", "abstract", "Wissenschaft"),
    ("präzise", "adj", "нарийн нягт", "precise, exact", "Wissenschaft"),
    ("subjektiv", "adj", "хувийн үзэмжийн", "subjective", "Philosophie"),
    ("objektiv", "adj", "бодит, хараат бус", "objective", "Philosophie"),
    ("rational", "adj", "эрүүл саруул, учир зүйтэй", "rational, reasonable", "Philosophie"),
    ("irrational", "adj", "учир шалтгаангүй", "irrational", "Philosophie"),
    ("fundiert", "adj", "үндэслэл сайтай", "well-founded, solid", "Wissenschaft"),
    ("oberflächlich", "adj", "өнгөцхөн", "superficial", "Charakter"),
    ("tiefgründig", "adj", "гүн гүнзгий", "profound, deep", "Charakter"),
    ("kontrovers", "adj", "маргаан дагуулсан", "controversial", "Politik"),
    ("eindeutig", "adj", "тодорхой, маргаангүй", "unambiguous, clear", "Kommunikation"),
    ("vieldeutig", "adj", "олон салаа утгатай", "ambiguous", "Kommunikation"),
    ("essentiell", "adj", "зайлшгүй чухал", "essential", "Philosophie"),
    ("marginal", "adj", "хоёрдогч, захын", "marginal, minor", "Wissenschaft"),
    ("signifikant", "adj", "үлэмж ач холбогдолтой", "significant", "Wissenschaft"),
    ("relevant", "adj", "холбогдох ач холбогдолтой", "relevant, pertinent", "Wissenschaft"),
    ("irrelevant", "adj", "хамааралгүй", "irrelevant", "Wissenschaft"),
    ("spezifisch", "adj", "өвөрмөц, тусгай", "specific", "Wissenschaft"),
    ("generell", "adj", "ерөнхий", "general, generic", "Wissenschaft"),
    ("kontinuierlich", "adj", "тасралтгүй үргэлжилсэн", "continuous", "Zeit"),
    ("sporadisch", "adj", "үе үе тохиолдох", "sporadic", "Zeit"),
    ("nachhaltig", "adj", "тогтвортой үр дүнтэй", "sustainable, lasting", "Umwelt"),
    ("effizient", "adj", "үр ашигтай", "efficient", "Wirtschaft"),
    ("effektiv", "adj", "үр нөлөөтэй", "effective", "Wirtschaft"),
    ("produktiv", "adj", "бүтээмж өндөртэй", "productive", "Wirtschaft"),
    ("konstruktiv", "adj", "бүтээлч хандлагатай", "constructive", "Kommunikation"),
    ("destruktiv", "adj", "хорлон сүйтгэх", "destructive", "Psychologie"),
    ("autonom", "adj", "бие даасан, хараат бус", "autonomous, independent", "Politik"),
    ("souverän", "adj", "бүрэн эрхт, өөртөө итгэлтэй", "sovereign, confident", "Politik"),
    ("authentisch", "adj", "жинхэнэ, бодит", "authentic, genuine", "Kultur"),
    ("künstlich", "adj", "хиймэл", "artificial", "Technik"),
    ("virtuell", "adj", "виртуал, цахим", "virtual", "Technik"),
    ("potenziell", "adj", "боломжит, чадавх бүхий", "potential", "Wissenschaft"),
    ("hypothetisch", "adj", "таамагласан", "hypothetical", "Wissenschaft"),
    ("systematisch", "adj", "системтэй, дэс дараалалтай", "systematic", "Wissenschaft"),
    ("chaotisch", "adj", "эмх замбараагүй", "chaotic", "Eigenschaft")
]

# Apply to B2
b2_data, b2_path = load_dataset('vocab_b2.json')
b2_idx = len(b2_data) + 1
b2_added = 0

for w, art, pl, mn, en, top in b2_nouns:
    if w.strip().lower() not in seen:
        entry = make_de_noun(b2_idx, w, art, pl, mn, en, topic=top)
        entry['level'] = 'B2'
        b2_data.append(entry)
        seen.add(w.strip().lower())
        b2_idx += 1
        b2_added += 1

for w, forms, rek, mn, en, top in b2_verbs:
    if w.strip().lower() not in seen:
        entry = make_de_verb(b2_idx, w, forms, rek, mn, en, topic=top)
        entry['level'] = 'B2'
        b2_data.append(entry)
        seen.add(w.strip().lower())
        b2_idx += 1
        b2_added += 1

for w, pos, mn, en, top in b2_adjectives:
    if w.strip().lower() not in seen:
        entry = make_de_other(b2_idx, w, pos, mn, en, topic=top)
        entry['level'] = 'B2'
        b2_data.append(entry)
        seen.add(w.strip().lower())
        b2_idx += 1
        b2_added += 1

print(f"Added {b2_added} to DE B2. Total DE B2 now: {len(b2_data)}")
with open(b2_path, 'w', encoding='utf-8') as f:
    json.dump(b2_data, f, ensure_ascii=False, indent=2)
