#!/usr/bin/env python3
"""
Finalize German vocabulary expansion to guarantee > 3,050 words.
"""
import json
import os
from vocab_helper import nfc, make_de_noun, make_de_verb, make_de_other, ROOT

seen = set()
for fn in ['vocab_a1.json', 'vocab_a2.json', 'vocab_b1.json', 'vocab_b2.json']:
    p = os.path.join(ROOT, 'data/de', fn)
    with open(p, 'r', encoding='utf-8') as f:
        for x in json.load(f):
            seen.add(x['word'].strip().lower())

a2_finish_nouns = [
    ("Arbeitnehmer", "der", "-", "ажилтан, хөлсний ажилчин", "employee", "Beruf"),
    ("Arbeitnehmerin", "die", "-nen", "эмэгтэй ажилтан", "female employee", "Beruf"),
    ("Arbeitgeber", "der", "-", "ажил олгогч", "employer", "Beruf"),
    ("Arbeitgeberin", "die", "-nen", "ажил олгогч эмэгтэй", "female employer", "Beruf"),
    ("Fachkraft", "die", "-¨e", "мэргэжилтэй боловсон хүчин", "skilled worker, specialist", "Beruf"),
    ("Hilfskraft", "die", "-¨e", "туслах ажилтан", "assistant, helper", "Beruf"),
    ("Leitung", "die", "-en", "удирдлага, шугам хоолой", "management, pipe", "Beruf"),
    ("Abteilungsleiter", "der", "-", "хэлтсийн дарга", "department head", "Beruf"),
    ("Teamleiter", "der", "-", "багийн ахлагч", "team leader", "Beruf"),
    ("Kundendienst", "der", "-e", "хэрэглэгчийн үйлчилгээ", "customer service", "Beruf"),
    ("Außendienst", "der", "-e", "гадуурх үйлчилгээ, борлуулалт", "field service, sales force", "Beruf"),
    ("Innendienst", "der", "-e", "дотоод алба, оффисын үйлчилгээ", "office staff, internal service", "Beruf"),
    ("Bewerbungsunterlagen", "die", "-", "ажилд орох өргөдлийн бичиг баримт", "application documents", "Beruf"),
    ("Bewerbungsgespräch", "das", "-e", "ажлын ярилцлага", "job interview", "Beruf"),
    ("Einstellung", "die", "-en", "ажилд авах, хандлага", "recruitment, attitude", "Beruf"),
    ("Entlassung", "die", "-en", "ажлаас халах", "dismissal, layoff", "Beruf"),
    ("Arbeitserlaubnis", "die", "-se", "хөдөлмөр эрхлэх зөвшөөрөл", "work permit", "Beruf"),
    ("Aufenthaltstitel", "der", "-", "оршин суух зөвшөөрөл", "residence permit", "Recht"),
    ("Aufenthaltsort", "der", "-e", "оршин суугаа газар", "place of stay", "Stadt"),
    ("Meldebescheinigung", "die", "-en", "оршин суугаа бүртгэлийн лавлагаа", "registration certificate", "Stadt"),
    ("Polizeistation", "die", "-en", "цагдаагийн хэсэг", "police station", "Stadt"),
    ("Gerichtsgebäude", "das", "-", "шүүхийн байр", "courthouse", "Stadt"),
    ("Finanzamt", "das", "-¨er", "татварын алба", "tax office", "Stadt"),
    ("Bürgeramt", "das", "-¨er", "иргэдэд үйлчлэх төв", "citizens office", "Stadt"),
    ("Standesamt", "das", "-¨er", "иргэний бүртгэлийн газар (гэрлэлт)", "registry office", "Stadt"),
    ("Gesundheitsamt", "das", "-¨er", "эрүүл мэндийн газар", "public health office", "Stadt"),
    ("Arbeitsagentur", "die", "-en", "хөдөлмөрийн хэлтэс", "employment agency", "Stadt"),
    ("Jobcenter", "das", "-", "ажил эрхлэлтийн төв", "job center", "Stadt"),
    ("Fahrkartenautomat", "der", "-en", "тасалбарын автомат", "ticket vending machine", "Verkehr"),
    ("Gepäckaufbewahrung", "die", "-en", "ачаа тээш хадгалах газар", "luggage storage", "Verkehr"),
    ("Gepäckband", "das", "-¨er", "тээшний урсдаг тууз", "baggage carousel", "Verkehr"),
    ("Abflughalle", "die", "-n", "нислэгийн танхим", "departure hall", "Verkehr"),
    ("Ankunftshalle", "die", "-n", "буултын танхим", "arrivals hall", "Verkehr"),
    ("Flugticket", "das", "-s", "онгоцны билет", "flight ticket", "Reisen"),
    ("Bordkarte", "die", "-n", "онгоцонд суух тасалбар", "boarding pass", "Reisen"),
    ("Sitzplatz", "der", "-¨e", "суудлын байр", "seat", "Verkehr"),
    ("Fensterplatz", "der", "-¨e", "цонхны талын суудал", "window seat", "Verkehr"),
    ("Gangplatz", "der", "-¨e", "хонгилын талын суудал", "aisle seat", "Verkehr"),
    ("Reiseversicherung", "die", "-en", "аяллын даатгал", "travel insurance", "Reisen"),
    ("Stornierung", "die", "-en", "захиалга цуцлах", "cancellation", "Reisen"),
    ("Buchungsbestätigung", "die", "-en", "захиалгын баталгаажуулалт", "booking confirmation", "Reisen"),
    ("Reisegruppe", "die", "-n", "аяллын жуулчдын бүлэг", "tourist group", "Reisen"),
    ("Wanderkarte", "die", "-n", "уулын алхалтын газрын зураг", "hiking map", "Reisen"),
    ("Wanderweg", "der", "-e", "явган аяллын зам", "hiking trail", "Reisen"),
    ("Rastplatz", "der", "-¨e", "зам зуурын амрах талбай", "rest area", "Verkehr"),
    ("Aussichtspunkt", "der", "-e", "орчин тойрноо харах цэг", "viewpoint, lookout", "Reisen"),
    ("Fahrradständer", "der", "-", "унадаг дугуйн зогсоол", "bicycle stand", "Stadt"),
    ("Leihfahrrad", "das", "-¨er", "түрээсийн дугуй", "rental bike", "Stadt"),
    ("Elektroroller", "der", "-", "цахилгаан скүүтер", "electric scooter", "Stadt"),
    ("Ladestation", "die", "-en", "цэнэглэх станц", "charging station", "Technik"),
    ("Akkulaufzeit", "die", "-en", "батерейн ажиллах хугацаа", "battery life", "Technik"),
    ("WLAN-Verbindung", "die", "-en", "вайфай холболт", "Wi-Fi connection", "Technik"),
    ("Internetanschluss", "der", "-¨e", "интернетийн холболт", "internet connection", "Technik"),
    ("Suchmaschine", "die", "-n", "хайтын систем", "search engine", "Technik"),
    ("Browser", "der", "-", "вэб хөтөч", "web browser", "Technik"),
    ("Mauspad", "das", "-s", "хулганын дэвсгэр", "mouse pad", "Technik"),
    ("Kopfhörer", "der", "-", "чихэвч", "headphones, earphones", "Technik"),
    ("Lautsprecher", "der", "-", "чанга яригч, спикер", "speaker, loudspeaker", "Technik"),
    ("Mikrofon", "das", "-e", "микрофон", "microphone", "Technik"),
    ("Webcam", "die", "-s", "вэбкамер", "webcam", "Technik"),
    ("Speicherkarte", "die", "-n", "санах ойн карт", "memory card", "Technik"),
    ("USB-Stick", "der", "-s", "флаш диск", "USB flash drive", "Technik"),
    ("Klimaschutz", "der", "-", "уур амьсгалыг хамгаалах", "climate protection", "Umwelt"),
    ("Naturschutzgebiet", "das", "-e", "байгалийн дархан цаазат газар", "nature reserve", "Umwelt"),
    ("Wasserkraft", "die", "-¨e", "усны эрчим хүч", "hydropower, hydroelectricity", "Umwelt"),
    ("Sonnenenergie", "die", "-", "нарны эрчим хүч", "solar energy", "Umwelt"),
    ("Fernwärme", "die", "-", "төвлөрсөн дулаан хангамж", "district heating", "Wohnen"),
    ("Stromrechnung", "die", "-en", "цахилгааны төлбөрийн хуудас", "electricity bill", "Wohnen"),
    ("Gasrechnung", "die", "-en", "хийн төлбөрийн хуудас", "gas bill", "Wohnen"),
    ("Wasserrechnung", "die", "-en", "усны төлбөрийн хуудас", "water bill", "Wohnen"),
    ("Mietzahlung", "die", "-en", "түрээсийн төлбөр", "rent payment", "Wohnen"),
    ("Mietspiegel", "der", "-", "түрээсийн үнийн жишиг", "rent index", "Wohnen"),
    ("Wohnungsmarkt", "der", "-¨e", "орон сууцны зах зээл", "housing market", "Wohnen"),
    ("Mietpreisbremse", "die", "-n", "түрээсийн үнийн дээд хязгаарлалт", "rent cap", "Wohnen"),
    ("Eigenheim", "das", "-e", "өөрийн хувийн байшин", "own home", "Wohnen"),
    ("Eigentumswohnung", "die", "-en", "өмчлөлийн орон сууц", "condominium, apartment", "Wohnen"),
    ("Grundstück", "das", "-e", "эдэлбэр газар, өмч газар", "plot of land", "Wohnen"),
    ("Makler", "der", "-", "үл хөдлөх хөрөнгийн зуучлагч", "real estate agent", "Wohnen"),
    ("Provision", "die", "-en", "зуучлалын шимтгэл", "commission", "Wirtschaft"),
    ("Zahlungsfrist", "die", "-en", "төлбөр хийх эцсийн хугацаа", "payment deadline", "Wirtschaft"),
    ("Mahnung", "die", "-en", "төлбөр шаардсан сануулга", "reminder, late notice", "Wirtschaft"),
    ("Lastschrift", "die", "-en", "шууд суутгал (данснаас)", "direct debit", "Wirtschaft"),
    ("PIN-Code", "der", "-s", "ПИН код", "PIN code", "Wirtschaft"),
    ("Sperrung", "die", "-en", "хаалт, картын түгжрэл", "blocking, suspension", "Wirtschaft"),
    ("Notrufnummer", "die", "-n", "яаралтай тусламжийн утасны дугаар", "emergency phone number", "Alltag"),
    ("Polizeiruf", "der", "-e", "цагдаа дуудах дуудлага", "police call", "Alltag"),
    ("Feueralarm", "der", "-e", "галын дохиолол", "fire alarm", "Alltag"),
    ("Rauchmelder", "der", "-", "утаа мэдрэгч", "smoke detector", "Alltag"),
    ("Feuerlöscher", "der", "-", "гал унтраагуур", "fire extinguisher", "Alltag"),
    ("Notausstieg", "der", "-e", "ослын үеийн цонх гарц", "emergency exit/window", "Alltag"),
    ("Erste-Hilfe-Kurs", "der", "-e", "анхны тусламжийн сургалт", "first aid course", "Gesundheit"),
    ("Lebensrettung", "die", "-en", "хүний амь аврах ажиллагаа", "life saving", "Gesundheit"),
    ("Rettungsdienst", "der", "-e", "аврах алба", "rescue service", "Gesundheit"),
    ("Rettungswagen", "der", "-", "аврах албаны тэрэг", "ambulance, rescue vehicle", "Gesundheit"),
    ("Sanitäter", "der", "-", "түргэн тусламжийн эмнэлгийн ажилтан", "paramedic", "Gesundheit"),
    ("Sanitäterin", "die", "-nen", "түргэний эмэгтэй ажилтан", "female paramedic", "Gesundheit"),
    ("Krankenpflege", "die", "-", "өвчтөний асаргаа сувилгаа", "nursing care", "Gesundheit"),
    ("Pflegeheim", "das", "-e", "ахмадын асрамжийн газар", "nursing home, care home", "Gesundheit"),
    ("Seniorenheim", "das", "-e", "өндөр настны орон сууц", "retirement home", "Gesundheit"),
    ("Altersheim", "das", "-e", "өндөр настнуудын асрамжийн газар", "old people's home", "Gesundheit"),
    ("Kinderkrippe", "die", "-n", "хүүхдийн ясли", "creche, day nursery", "Familie"),
    ("Tagesmutter", "die", "-¨", "өдрийн хүүхэд асрагч", "childminder", "Familie"),
    ("Babysitter", "der", "-", "хүүхэд харагч", "babysitter", "Familie"),
    ("Erzieher", "der", "-", "цэцэрлэгийн багш, хүмүүжүүлэгч", "kindergarten educator", "Schule"),
    ("Erzieherin", "die", "-nen", "цэцэрлэгийн эмэгтэй багш", "female kindergarten educator", "Schule"),
    ("Grundschule", "die", "-n", "бага сургууль", "primary school, elementary school", "Schule"),
    ("Gymnasium", "das", "-ien", "ахлах гимнази сургууль", "grammar school, gymnasium", "Schule"),
    ("Realschule", "die", "-n", "дунд шатны сургууль", "secondary school", "Schule"),
    ("Gesamtschule", "die", "-n", "цогцолбор дунд сургууль", "comprehensive school", "Schule"),
    ("Hauptschule", "die", "-n", "суурь ерөнхий боловсролын сургууль", "general secondary school", "Schule"),
    ("Berufsschule", "die", "-n", "мэргэжлийн сургалт үйлдвэрлэлийн төв", "vocational school", "Schule"),
    ("Fachhochschule", "die", "-n", "хэрэглээний шинжлэх ухааны их сургууль", "university of applied sciences", "Schule"),
    ("Schulabschluss", "der", "-¨e", "сургууль төгссөн гэрчилгээ", "school leaving certificate", "Schule"),
    ("Abitur", "das", "-", "ахлах сургууль төгсөх шалгалт (Германы)", "A-levels, high school diploma", "Schule"),
    ("Matura", "die", "-", "сургууль төгсөх төгсөлтийн шалгалт", "school leaving examination", "Schule"),
    ("Abschlusszeugnis", "das", "-se", "сургууль төгсөлтийн диплом", "graduation certificate", "Schule"),
    ("Bachelor", "der", "-s", "бакалаврын зэрэг", "bachelor's degree", "Schule"),
    ("Master", "der", "-", "магистрын зэрэг", "master's degree", "Schule"),
    ("Doktor", "der", "-en", "докторын зэрэг", "doctorate, PhD", "Schule"),
    ("Studiengang", "der", "-¨e", "их сургуулийн сургалтын хөтөлбөр", "degree course, program", "Schule"),
    ("Studienplatz", "der", "-¨e", "оюутны суралцах хуваарь", "university place", "Schule"),
    ("Semester", "das", "-", "семестр, хагас жил", "semester, term", "Schule"),
    ("Vorlesung", "die", "-en", "их сургуулийн лекц", "university lecture", "Schule"),
    ("Seminar", "das", "-e", "семинар, хэлэлцүүлэг", "seminar, workshop", "Schule"),
    ("Klausur", "die", "-en", "бичгийн шалгалт", "written exam", "Schule"),
    ("Hausarbeit", "die", "-en", "бие даалтын эрдэм шинжилгээний ажил", "term paper, coursework", "Schule"),
    ("Referat", "das", "-e", "аман илтгэл, тайлан", "oral presentation, report", "Schule"),
    ("Campus", "der", "-", "оюутны хотхон", "university campus", "Schule"),
    ("Mensa", "die", "-sen", "оюутны хоолны газар", "university canteen", "Schule"),
    ("Wohnheim", "das", "-e", "оюутны дотуур байр", "student dormitory", "Schule"),
    ("Studentenwerk", "das", "-e", "оюутны нийгмийн үйлчилгээний байгууллага", "student services", "Schule")
]

# Apply to A2
a2_path = os.path.join(ROOT, 'data/de/vocab_a2.json')
with open(a2_path, 'r', encoding='utf-8') as f:
    a2_words = json.load(f)

a2_idx = len(a2_words) + 1
a2_added = 0
for w, art, pl, mn, en, top in a2_finish_nouns:
    if w.strip().lower() not in seen:
        entry = make_de_noun(a2_idx, w, art, pl, mn, en, topic=top)
        entry['level'] = 'A2'
        a2_words.append(entry)
        seen.add(w.strip().lower())
        a2_idx += 1
        a2_added += 1

with open(a2_path, 'w', encoding='utf-8') as f:
    json.dump(a2_words, f, ensure_ascii=False, indent=2)

print(f"Added {a2_added} to DE A2. Total now: {len(a2_words)}")

# B2 finish items
b2_finish_nouns = [
    ("Globalisierungsprozess", "der", "-e", "даяаршлын үйл явц", "globalization process", "Wirtschaft"),
    ("Transformationsprozess", "der", "-e", "шилжилтийн үйл явц", "transformation process", "Wirtschaft"),
    ("Strukturwandel", "der", "-", "бүтцийн өөрчлөлт", "structural change", "Wirtschaft"),
    ("Wertewandel", "der", "-", "үнэт зүйлсийн шилжилт өөрчлөлт", "shift in values", "Soziologie"),
    ("Demografiewandel", "der", "-", "хүн ам зүйн өөрчлөлт", "demographic change", "Soziologie"),
    ("Klimawandelfolgen", "die", "-", "уур амьсгалын өөрчлөлтийн үр дагавар", "consequences of climate change", "Umwelt"),
    ("Nachhaltigkeitsziel", "das", "-e", "тогтвортой хөгжлийн зорилт", "sustainability goal", "Umwelt"),
    ("Entwicklungszusammenarbeit", "die", "-", "хөгжлийн хамтын ажиллагаа", "development cooperation", "Politik"),
    ("Menschenrechtsverletzung", "die", "-en", "хүний эрхийн зөрчил", "human rights violation", "Politik"),
    ("Bürgerrechtsbewegung", "die", "-en", "иргэний эрхийн хөдөлгөөн", "civil rights movement", "Politik"),
    ("Verfassungsgericht", "das", "-e", "үндсэн хуулийн цэц, шүүх", "constitutional court", "Recht"),
    ("Rechtsvorschrift", "die", "-en", "хууль эрх зүйн зохицуулалт", "legal provision, regulation", "Recht"),
    ("Gesetzesentwurf", "der", "-¨e", "хуулийн төсөл", "bill, draft law", "Recht"),
    ("Parlamentsdebatte", "die", "-n", "парламентын мэтгэлцээн", "parliamentary debate", "Politik"),
    ("Souveränität", "die", "-", "бүрэн эрхт байдал", "sovereignty", "Politik"),
    ("Diplomatie", "die", "-", "дипломат харилцаа", "diplomacy", "Politik"),
    ("Botschafter", "der", "-", "онц бөгөөд бүрэн эрхт элчин сайд", "ambassador", "Politik"),
    ("Botschafterin", "die", "-nen", "эмэгтэй элчин сайд", "female ambassador", "Politik"),
    ("Konsulat", "das", "-e", "консулын газар", "consulate", "Politik"),
    ("Friedensabkommen", "das", "-", "энхийн хэлэлцээр", "peace accord", "Politik"),
    ("Völkerrecht", "das", "-", "олон улсын эрх зүй", "international law", "Recht"),
    ("Europäische Union", "die", "-", "Европын Холбоо", "European Union", "Politik"),
    ("Währungsunion", "die", "-en", "мөнгөний холбоо", "monetary union", "Wirtschaft"),
    ("Binnenmarkt", "der", "-¨e", "дотоод нэгдсэн зах зээл", "internal market, single market", "Wirtschaft"),
    ("Zollunion", "die", "-en", "гаалийн холбоо", "customs union", "Wirtschaft"),
    ("Handelsabkommen", "das", "-", "худалдааны хэлэлцээр", "trade agreement", "Wirtschaft"),
    ("Freihandelszone", "die", "-n", "чөлөөт худалдааны бүс", "free trade zone", "Wirtschaft"),
    ("Wirtschaftssanktion", "die", "-en", "эдийн засгийн хориг арга хэмжээ", "economic sanction", "Wirtschaft"),
    ("Lieferengpass", "der", "-¨e", "нийлүүлэлтийн хомсдол, гацаа", "supply bottleneck", "Wirtschaft"),
    ("Preisanstieg", "der", "-e", "үнийн өсөлт", "price increase", "Wirtschaft"),
    ("Kaufkraftverlust", "der", "-e", "худалдан авах чадварын бууралт", "loss of purchasing power", "Wirtschaft"),
    ("Zinsentscheidung", "die", "-en", "бодлогын хүүгийн шийдвэр", "interest rate decision", "Wirtschaft"),
    ("Zentralbank", "die", "-en", "төв банк", "central bank", "Wirtschaft"),
    ("Leitzins", "der", "-en", "бодлогын үндсэн хүү", "key interest rate", "Wirtschaft"),
    ("Währungsreserve", "die", "-n", "гадаад валютын нөөц", "foreign exchange reserve", "Wirtschaft"),
    ("Staatsschulden", "die", "-", "улсын өр төлбөр", "national debt, public debt", "Wirtschaft"),
    ("Haushaltsdefizit", "das", "-e", "төсвийн алдагдал", "budget deficit", "Wirtschaft"),
    ("Sparmaßnahme", "die", "-n", "төсөв хэмнэх арга хэмжээ", "austerity measure", "Wirtschaft"),
    ("Subvention", "die", "-en", "улсын татаас, тусламж", "subsidy", "Wirtschaft"),
    ("Förderprogramm", "das", "-e", "дэмжих хөтөлбөр", "support program", "Wirtschaft"),
    ("Unternehmensgründung", "die", "-en", "шинэ компани үүсгэн байгуулах", "start-up, company formation", "Wirtschaft"),
    ("Startup", "das", "-s", "гарааны бизнес", "startup", "Wirtschaft"),
    ("Risikokapital", "das", "-", "эрсдэлт хөрөнгө оруулалт", "venture capital", "Wirtschaft"),
    ("Börsengang", "der", "-¨e", "хувьцаагаа нийтэд санал болгох (IPO)", "stock market launch, IPO", "Wirtschaft"),
    ("Unternehmensübernahme", "die", "-n", "компанийг нэгтгэн авах", "takeover, acquisition", "Wirtschaft"),
    ("Fusion", "die", "-en", "нэгдэл, нийлэлт", "merger", "Wirtschaft"),
    ("Kartell", "das", "-e", "үгсэн хуйвалдах картел", "cartel", "Wirtschaft"),
    ("Kartellamt", "das", "-¨er", "шударга өрсөлдөөний газар", "antitrust office, cartel office", "Wirtschaft"),
    ("Arbeitsmarktpolitik", "die", "-", "хөдөлмөрийн зах зээлийн бодлого", "labor market policy", "Wirtschaft"),
    ("Fachkräftemangel", "der", "-", "мэргэжилтэй ажиллах хүчний хомсдол", "shortage of skilled workers", "Wirtschaft"),
    ("Demografie", "die", "-", "хүн ам зүй", "demography", "Soziologie"),
    ("Altersstruktur", "die", "-en", "насны бүтэц", "age structure", "Soziologie"),
    ("Geburtenrate", "die", "-n", "төрөлтийн төвшин", "birth rate", "Soziologie"),
    ("Sterberate", "die", "-n", "нас баралтын төвшин", "death rate, mortality rate", "Soziologie"),
    ("Lebenserwartung", "die", "-en", "дундаж наслалт", "life expectancy", "Soziologie"),
    ("Einwanderung", "die", "-en", "цагаачлал, шилжин суурьшилт", "immigration", "Soziologie"),
    ("Auswanderung", "die", "-en", "гадагш цагаачлах", "emigration", "Soziologie"),
    ("Migrationshintergrund", "der", "-¨e", "цагаачлалын гарал үүсэл", "migrant background", "Soziologie"),
    ("Flüchtling", "der", "-e", "дүрвэгч", "refugee", "Politik"),
    ("Asylantrag", "der", "-¨e", "улс төрийн орогнол хүссэн өргөдөл", "asylum application", "Politik"),
    ("Bleiberecht", "das", "-e", "оршин суух эрх", "right of residence", "Recht"),
    ("Abschiebung", "die", "-en", "албадан гаргах", "deportation", "Recht"),
    ("Einbürgerung", "die", "-en", "иргэншил олгох", "naturalization", "Recht"),
    ("Sprachbarriere", "die", "-n", "хэлний бэрхшээл", "language barrier", "Sprache"),
    ("Kulturschock", "der", "-s", "соёлын цочрол", "culture shock", "Kultur"),
    ("Identitätskrise", "die", "-n", "мөн чанарын хямрал", "identity crisis", "Psychologie"),
    ("Generationenkonflikt", "der", "-e", "үе хоорондын зөрчил", "generation conflict", "Soziologie"),
    ("Altersarmut", "die", "-", "өндөр насны ядуурал", "old-age poverty", "Soziologie"),
    ("Kinderarmut", "die", "-", "хүүхдийн ядуурал", "child poverty", "Soziologie"),
    ("Sozialhilfe", "die", "-n", "нийгмийн халамж", "social welfare", "Soziologie"),
    ("Grundsicherung", "die", "-en", "суурь амьжиргааны баталгаа", "basic financial security", "Soziologie"),
    ("Bürgergeld", "das", "-", "иргэний суурь тэтгэмж (Германы)", "citizen's allowance", "Soziologie"),
    ("Chancengleichheit", "die", "-", "боломжийн тэгш байдал", "equal opportunity", "Soziologie"),
    ("Bildungsgerechtigkeit", "die", "-", "боловсролын тэгш хүртээмж", "educational justice", "Schule"),
    ("Gläserne Decke", "die", "-", "үл үзэгдэх шилэн тааз (дэвших саад)", "glass ceiling", "Beruf"),
    ("Gehaltsunterschied", "der", "-e", "цалингийн зөрүү", "pay gap, wage difference", "Beruf"),
    ("Mindestlohn", "der", "-¨e", "хөдөлмөрийн хөлсний доод хэмжээ", "minimum wage", "Wirtschaft"),
    ("Leiharbeit", "die", "-en", "түр түрээсийн хөдөлмөр", "temporary work, agency work", "Beruf"),
    ("Prekariat", "das", "-", "орлогын баталгаагүй нийгмийн давхарга", "precariat", "Soziologie"),
    ("Arbeitsüberlastung", "die", "-en", "ажлын хэт ачаалал", "work overload, overwork", "Beruf"),
    ("Burnout-Syndrom", "das", "-e", "ажлаас халшрах хам шинж", "burnout syndrome", "Gesundheit"),
    ("Work-Life-Balance", "die", "-", "ажил амьдралын тэнцвэр", "work-life balance", "Alltag"),
    ("Telearbeit", "die", "-", "зайнаас ажиллах хэлбэр", "telework, remote work", "Beruf"),
    ("Homeoffice", "das", "-s", "гэрээсээ ажиллах оффис", "home office", "Beruf"),
    ("Coworking-Space", "der", "-s", "хамтын оффисын талбай", "coworking space", "Beruf")
]

# Apply to B2
b2_path = os.path.join(ROOT, 'data/de/vocab_b2.json')
with open(b2_path, 'r', encoding='utf-8') as f:
    b2_words = json.load(f)

b2_idx = len(b2_words) + 1
b2_added = 0
for w, art, pl, mn, en, top in b2_finish_nouns:
    if w.strip().lower() not in seen:
        entry = make_de_noun(b2_idx, w, art, pl, mn, en, topic=top)
        entry['level'] = 'B2'
        b2_words.append(entry)
        seen.add(w.strip().lower())
        b2_idx += 1
        b2_added += 1

with open(b2_path, 'w', encoding='utf-8') as f:
    json.dump(b2_words, f, ensure_ascii=False, indent=2)

print(f"Added {b2_added} to DE B2. Total now: {len(b2_words)}")
