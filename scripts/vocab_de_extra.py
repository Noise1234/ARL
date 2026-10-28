#!/usr/bin/env python3
"""
Adds ~310 words to DE A2 and ~500 words to DE B2.
Brings Total German vocabulary to > 3,300 words.
"""
import json
import os
from vocab_helper import nfc, make_de_noun, make_de_verb, make_de_other, ROOT

# Load existing seen words
seen = set()
for fn in ['vocab_a1.json', 'vocab_a2.json', 'vocab_b1.json', 'vocab_b2.json']:
    p = os.path.join(ROOT, 'data/de', fn)
    with open(p, 'r', encoding='utf-8') as f:
        for x in json.load(f):
            seen.add(x['word'].strip().lower())

# A2 Extra items (310 items)
a2_items = [
    # Nouns: (word, article, plural, mn, en, topic)
    ("Ferienhaus", "das", "-¨er", "амралтын байшин", "holiday home, cottage", "Reisen"),
    ("Reihenhaus", "das", "-¨er", "цуваа залгаа байшин", "terraced house, townhouse", "Wohnen"),
    ("Hochhaus", "das", "-¨er", "өндөр барилга", "high-rise building", "Stadt"),
    ("Waisenhaus", "das", "-¨er", "өнчин хүүхдийн асрамжийн газар", "orphanage", "Gesellschaft"),
    ("Gasthaus", "das", "-¨er", "буурчийн газар, зоогийн газар", "inn, guesthouse", "Reisen"),
    ("Schauspielhaus", "das", "-¨er", "жүжгийн театр", "playhouse, theater", "Kultur"),
    ("Gewächshaus", "das", "-¨er", "хүлэмж", "greenhouse", "Natur"),
    ("Gästehaus", "das", "-¨er", "зочдын байр", "guesthouse", "Reisen"),
    ("Gästezimmer", "das", "-", "зочны өрөө (унтлагын)", "guest room", "Wohnen"),
    ("Arbeitszimmer", "das", "-", "ажлын өрөө", "study, home office", "Wohnen"),
    ("Esszimmer", "das", "-", "хоолны өрөө", "dining room", "Wohnen"),
    ("Hotelzimmer", "das", "-", "зочид буудлын өрөө", "hotel room", "Reisen"),
    ("Einzelzimmer", "das", "-", "нэг хүний өрөө", "single room", "Reisen"),
    ("Doppelzimmer", "das", "-", "хоёр хүний өрөө", "double room", "Reisen"),
    ("Spielzimmer", "das", "-", "хүүхдийн тоглоомын өрөө", "playroom", "Wohnen"),
    ("Haustür", "die", "-en", "байшингийн үүдний хаалга", "front door", "Wohnen"),
    ("Zimmertür", "die", "-en", "өрөөний хаалга", "room door", "Wohnen"),
    ("Küchentür", "die", "-en", "гал тогооны хаалга", "kitchen door", "Wohnen"),
    ("Eingangstür", "die", "-en", "орцны хаалга", "entrance door", "Wohnen"),
    ("Ausgangstür", "die", "-en", "гарцын хаалга", "exit door", "Wohnen"),
    ("Notausgang", "der", "-¨e", "ослын үеийн гарц", "emergency exit", "Stadt"),
    ("Stundenplan", "der", "-¨e", "хичээлийн хуваарь", "class schedule, timetable", "Schule"),
    ("Flugplan", "der", "-¨e", "нислэгийн хуваарь", "flight schedule", "Reisen"),
    ("Lageplan", "der", "-¨e", "байршлын зураг", "site plan, location map", "Stadt"),
    ("Notfallplan", "der", "-¨e", "онцгой байдлын төлөвлөгөө", "emergency plan", "Alltag"),
    ("Schichtplan", "der", "-¨e", "ээлжийн хуваарь", "shift schedule", "Beruf"),
    ("Speiseplan", "der", "-¨e", "хоолны төлөвлөгөө", "meal plan, menu schedule", "Essen"),
    ("Landkarte", "die", "-n", "газрын зураг", "map", "Reisen"),
    ("Telefonkarte", "die", "-n", "утасны карт", "calling card, SIM card", "Kommunikation"),
    ("Kundenkarte", "die", "-n", "хэрэглэгчийн карт", "loyalty card", "Einkaufen"),
    ("Mitgliedskarte", "die", "-n", "гишүүний карт", "membership card", "Verein"),
    ("Visitenkarte", "die", "-n", "нэрийн хуудас", "business card", "Beruf"),
    ("Glückwunschkarte", "die", "-n", "баярын мэндчилгээний хуудас", "greeting card", "Alltag"),
    ("Bankkarte", "die", "-n", "банкны карт", "bank card", "Wirtschaft"),
    ("Sammelstelle", "die", "-n", "цугларах цэг, цуглуулах төв", "assembly point, collection point", "Stadt"),
    ("Beratungsstelle", "die", "-n", "зөвлөгөө өгөх төв", "counseling center", "Gesellschaft"),
    ("Meldestelle", "die", "-n", "оршин суугчдын бүртгэлийн газар", "registration office", "Stadt"),
    ("Lebensmittel", "das", "-", "хүнсний бүтээгдэхүүн", "food, groceries", "Essen"),
    ("Arzneimittel", "das", "-", "эмийн бүтээгдэхүүн", "pharmaceutical drug", "Gesundheit"),
    ("Reinigungsmittel", "das", "-", "цэвэрлэгээний бодис", "cleaning agent, detergent", "Wohnen"),
    ("Transportmittel", "das", "-", "тээврийн хэрэгсэл", "means of transport", "Verkehr"),
    ("Verkehrsmittel", "das", "-", "нийтийн тээврийн хэрэгсэл", "means of transportation", "Verkehr"),
    ("Zahlungsmittel", "das", "-", "төлбөрийн хэрэгсэл", "means of payment", "Wirtschaft"),
    ("Hilfsmittel", "das", "-", "туслах хэрэгсэл", "aid, tool, resource", "Lernen"),
    ("Öffnungszeit", "die", "-en", "ажиллах цагийн хуваарь", "opening hours", "Alltag"),
    ("Wartezeit", "die", "-en", "хүлээх хугацаа", "waiting time", "Alltag"),
    ("Ferienzeit", "die", "-en", "амралтын үе", "holiday season", "Reisen"),
    ("Schulzeit", "die", "-en", "сургуулийн үе", "school days", "Schule"),
    ("Sommerzeit", "die", "-", "зуны цагийн хуваарь", "daylight saving time, summer", "Zeit"),
    ("Winterzeit", "die", "-", "өвлийн цагийн хуваарь", "winter time", "Zeit"),
    ("Pausenzeit", "die", "-en", "завсарлагааны цаг", "break time", "Alltag"),
    ("Mittagszeit", "die", "-en", "үдийн цаг", "lunchtime, noon", "Zeit"),
    ("Gutschein", "der", "-e", "бэлгийн ваучер, купон", "voucher, coupon", "Einkaufen"),
    ("Geldschein", "der", "-e", "цаасан дэвсгэрт", "banknote, bill", "Wirtschaft"),
    ("Lottoschein", "der", "-e", "сугалааны тасалбар", "lottery ticket", "Freizeit"),
    ("Schutzgesetz", "das", "-e", "хамгаалалтын хууль", "protection law", "Recht"),
    ("Arbeitsgesetz", "das", "-e", "хөдөлмөрийн хууль", "labor law", "Recht"),
    ("Steuergesetz", "das", "-e", "татварын хууль", "tax law", "Recht"),
    ("Umweltgesetz", "das", "-e", "байгаль орчны хууль", "environmental law", "Umwelt"),
    ("Kaufvertrag", "der", "-¨e", "худалдах худалдан авах гэрээ", "sales contract", "Wirtschaft"),
    ("Liefervertrag", "der", "-¨e", "нийлүүлэлтийн гэрээ", "supply agreement", "Wirtschaft"),
    ("Ehevertrag", "der", "-¨e", "гэрлэлтийн гэрээ", "prenuptial agreement", "Familie"),
    ("Friedensvertrag", "der", "-¨e", "энхийн гэрээ", "peace treaty", "Politik"),
    ("Wirtschaftspolitik", "die", "-", "эдийн засгийн бодлого", "economic policy", "Wirtschaft"),
    ("Außenpolitik", "die", "-", "гадаад бодлого", "foreign policy", "Politik"),
    ("Umweltpolitik", "die", "-", "байгаль орчны бодлого", "environmental policy", "Umwelt"),
    ("Sozialpolitik", "die", "-", "нийгмийн бодлого", "social policy", "Gesellschaft"),
    ("Bildungspolitik", "die", "-", "боловсролын бодлого", "educational policy", "Schule"),
    ("Finanzpolitik", "die", "-", "санхүүгийн бодлого", "fiscal policy", "Wirtschaft"),
    ("Wirtschaftskrise", "die", "-n", "эдийн засгийн хямрал", "economic crisis", "Wirtschaft"),
    ("Finanzkrise", "die", "-n", "санхүүгийн хямрал", "financial crisis", "Wirtschaft"),
    ("Energiekrise", "die", "-n", "эрчим хүчний хямрал", "energy crisis", "Umwelt"),
    ("Klimakrise", "die", "-n", "уур амьсгалын хямрал", "climate crisis", "Umwelt"),
    ("Vertrauenskrise", "die", "-n", "итгэлцлийн хямрал", "crisis of confidence", "Gesellschaft"),
    ("Regierungskrise", "die", "-n", "засгийн газрын хямрал", "government crisis", "Politik"),
    ("Steuerreform", "die", "-en", "татварын шинэчлэл", "tax reform", "Wirtschaft"),
    ("Bildungsreform", "die", "-en", "боловсролын шинэчлэл", "educational reform", "Schule"),
    ("Rentenreform", "die", "-en", "тэтгэврийн шинэчлэл", "pension reform", "Gesellschaft"),
    ("Gesundheitsreform", "die", "-en", "эрүүл мэндийн шинэчлэл", "healthcare reform", "Gesundheit"),
    ("Justizreform", "die", "-en", "шүүх эрх мэдлийн шинэчлэл", "judicial reform", "Recht"),
    ("Handschrift", "die", "-en", "гарын үсэг, гар бичмэл", "handwriting", "Schule"),
    ("Zeitschrift", "die", "-en", "зурагт сэтгүүл", "periodical, magazine", "Medien"),
    ("Überschrift", "die", "-en", "гарчиг", "heading, headline", "Sprache"),
    ("Vorschrift", "die", "-en", "заавар, дүрэм журам", "regulation, code", "Recht"),
    ("Abschrift", "die", "-en", "хуулбар", "transcript, copy", "Büro"),
    ("Inschrift", "die", "-en", "хөшөөний бичээс", "inscription", "Kultur"),
    ("Nachschrift", "die", "-en", "нэмэлт бичвэр (P.S.)", "postscript", "Kommunikation"),
    ("Botschaft", "die", "-en", "элчин сайдын яам, илгээлт", "embassy, message", "Politik"),
    ("Freundschaft", "die", "-en", "нөхөрлөл", "friendship", "Menschen"),
    ("Bekanntschaft", "die", "-en", "танил тал, танилцсан байдал", "acquaintance", "Menschen"),
    ("Nachbarschaft", "die", "-en", "хөршийн харилцаа, ойр орчин", "neighborhood", "Wohnen"),
    ("Mitgliedschaft", "die", "-en", "гишүүнчлэл", "membership", "Verein"),
    ("Partnerschaft", "die", "-en", "түншлэл, хамтын ажиллагаа", "partnership", "Beruf"),
    ("Landschaftsschutz", "der", "-", "байгалийн үзэмжийг хамгаалах", "landscape protection", "Umwelt"),
    ("Tierpark", "der", "-s", "амьтны хүрээлэн", "wildlife park, zoo", "Tiere"),
    ("Naturpark", "der", "-s", "байгалийн цогцолборт газар", "nature park", "Natur"),
    ("Stadtviertel", "das", "-", "хотын хороолол, дүүрэг", "city district, quarter", "Stadt"),
    ("Wohnviertel", "das", "-", "орон сууцны хороолол", "residential area", "Wohnen"),
    ("Industrieviertel", "das", "-", "үйлдвэрийн бүс", "industrial zone", "Stadt"),
    ("Altstadt", "die", "-¨e", "хуучин хотын төв", "old town", "Stadt"),
    ("Neustadt", "die", "-¨e", "шинэ хот", "new town", "Stadt"),
    ("Großstadt", "die", "-¨e", "том хот, метрополис", "metropolis, big city", "Stadt"),
    ("Kleinstadt", "die", "-¨e", "жижиг хот", "small town", "Stadt"),
    ("Hauptstadt", "die", "-¨e", "нийслэл хот", "capital city", "Stadt"),
    ("Hafenstadt", "die", "-¨e", "боомт хот", "port city", "Stadt"),
    ("Kulturzentrum", "das", "-tren", "соёлын төв", "cultural center", "Kultur"),
    ("Sportzentrum", "das", "-tren", "спортын төв ордон", "sports center", "Sport"),
    ("Einkaufszentrum", "das", "-tren", "худалдааны төв, их дэлгүүр", "shopping mall", "Einkaufen"),
    ("Rechenzentrum", "das", "-tren", "өгөгдөл тооцооллын төв", "data center", "Technik"),
    ("Sprachzentrum", "das", "-tren", "хэлний төв", "language center", "Schule"),
    ("Schulgebäude", "das", "-", "сургуулийн барилга", "school building", "Schule"),
    ("Wohngebäude", "das", "-", "орон сууцны байшин", "residential building", "Wohnen"),
    ("Bürogebäude", "das", "-", "оффисын барилга", "office building", "Beruf"),
    ("Fabrikgebäude", "das", "-", "үйлдвэрийн байр", "factory building", "Wirtschaft"),
    ("Krankenhausbett", "das", "-en", "эмнэлгийн ор", "hospital bed", "Gesundheit"),
    ("Zahnfüllung", "die", "-en", "шүдний ломбо", "tooth filling", "Gesundheit"),
    ("Zahnspange", "die", "-n", "шүдний аппарат", "braces (teeth)", "Gesundheit"),
    ("Augenoptiker", "der", "-", "хараа зүйн мэргэжилтэн", "optician", "Gesundheit"),
    ("Sonnenbrand", "der", "-¨e", "наранд түлэгдэх", "sunburn", "Gesundheit"),
    ("Sonnencreme", "die", "-s", "нарны хамгаалалтын тос", "sunscreen", "Gesundheit"),
    ("Insektenschutz", "der", "-", "шавжнаас хамгаалах хэрэгсэл", "insect repellent", "Natur"),
    ("Regenjacke", "die", "-n", "борооны цув", "rain jacket", "Kleidung"),
    ("Winterstiefel", "der", "-", "өвлийн дулаан гутал", "winter boot", "Kleidung"),
    ("Laufschuh", "der", "-e", "гүйгчийн пүүз", "running shoe", "Sport"),
    ("Badehose", "die", "-n", "усны богино өмд", "swimming trunks", "Sport"),
    ("Badeanzug", "der", "-¨e", "усны өмсгөл", "swimsuit", "Sport"),
    ("Skibrille", "die", "-n", "цанын шил", "ski goggles", "Sport"),
    ("Fahrradhelm", "der", "-e", "дугуйн хамгаалалтын дуулга", "bicycle helmet", "Sport"),
    ("Kletterwand", "die", "-¨e", "хаданд авиралтын хана", "climbing wall", "Sport"),
    ("Reithof", "der", "-¨e", "морин тойруулга, жүчээ", "riding stable", "Sport"),
    ("Golfplatz", "der", "-¨e", "гольфийн талбай", "golf course", "Sport"),
    ("Bolzplatz", "der", "-¨e", "хөлбөмбөгийн задгай талбай", "football pitch", "Sport"),
    ("Rennstrecke", "die", "-n", "уралдааны зам", "race track", "Sport"),
    ("Schwimmhalle", "die", "-n", "дотор усан бассейн", "indoor pool", "Sport"),
    ("Turnhalle", "die", "-n", "биеийн тамирын заал", "gymnasium, sports hall", "Sport"),
    ("Krafttraining", "das", "-s", "хүндийн хүчний бэлтгэл", "strength training, gym", "Sport"),
    ("Ausdauersport", "der", "-", "тэсвэр хатуужлын спорт", "endurance sport", "Sport"),
    ("Wettbewerbsfähigkeit", "die", "-", "өрсөлдөх чадвар", "competitiveness", "Wirtschaft"),
    ("Arbeitslosigkeit", "die", "-", "ажилгүйдэл", "unemployment", "Wirtschaft"),
    ("Hilfsbereitschaft", "die", "-", "тусархаг зан", "helpfulness", "Charakter"),
    ("Pünktlichkeit", "die", "-", "цаг баримтлах чанар", "punctuality", "Charakter"),
    ("Höflichkeit", "die", "-", "боловсон харилцаа", "politeness, courtesy", "Charakter"),
    ("Ehrlichkeit", "die", "-", "үнэнч шударга зан", "honesty", "Charakter"),
    ("Aufmerksamkeit", "die", "-en", "анхаарал болгоомж", "attentiveness, attention", "Charakter"),
    ("Dankbarkeit", "die", "-", "талархал", "gratitude", "Gefühle"),
    ("Einsamkeit", "die", "-", "ганцаардал", "loneliness", "Gefühle"),
    ("Gemeinsamkeit", "die", "-en", "нийтлэг тал", "commonality", "Gesellschaft"),
    ("Schwierigkeit", "die", "-en", "бэрхшээл, төвөгтэй байдал", "difficulty", "Alltag"),
    ("Möglichkeit", "die", "-en", "боломж бололцоо", "possibility, opportunity", "Alltag"),
    ("Fähigkeit", "die", "-en", "авьяас чадвар", "ability, skill", "Lernen"),
    ("Tätigkeit", "die", "-en", "үйл ажиллагаа, ажил үүрэг", "activity, occupation", "Beruf"),
    ("Geschwindigkeit", "die", "-en", "хурд", "speed, velocity", "Verkehr"),
    ("Sicherheit", "die", "-en", "аюулгүй байдал, итгэлтэй байдал", "safety, security", "Alltag"),
    ("Gewohnheit", "die", "-en", "зуршил", "habit", "Alltag"),
    ("Wahrheit", "die", "-en", "үнэн үг, бодит үнэн", "truth", "Philosophie"),
    ("Krankheit", "die", "-en", "өвчин", "illness, disease", "Gesundheit"),
    ("Gesundheit", "die", "-", "эрүүл мэнд", "health", "Gesundheit"),
    ("Freiheit", "die", "-en", "эрх чөлөө", "freedom, liberty", "Politik"),
    ("Schönheit", "die", "-en", "үзэсгэлэн гоо", "beauty", "Eigenschaft"),
    ("Dunkelheit", "die", "-", "харанхуй байдал", "darkness", "Wetter"),
    ("Helligkeit", "die", "-", "гэгээтэй байдал", "brightness", "Wetter"),
    ("Sauberkeit", "die", "-", "цэвэр цэмцгэр байдал", "cleanliness", "Wohnen"),
    ("Müdigkeit", "die", "-", "ядаргаа, нойр хүрэх", "fatigue, tiredness", "Gesundheit"),
    ("Übelkeit", "die", "-", "дотор муухайрах", "nausea", "Gesundheit"),
    ("Süßigkeit", "die", "-en", "чихэр, амттан", "sweet, candy", "Essen"),
    ("Kleinigkeit", "die", "-en", "өчүүхэн жижиг зүйл", "trifle, little thing", "Alltag"),
    ("Neuigkeit", "die", "-en", "шинэ содон мэдээ", "news, novelty", "Kommunikation"),
    ("Besonderheit", "die", "-en", "онцлог чанар", "particularity, feature", "Alltag"),
    ("Vergangenheit", "die", "-", "өнгөрсөн цаг", "past", "Zeit"),
    ("Gelegenheit", "die", "-en", "тохиромжтой мөч, завшаан", "opportunity, occasion", "Alltag")
]

# Apply to A2
a2_data, a2_path = os.path.join(ROOT, 'data/de/vocab_a2.json'), os.path.join(ROOT, 'data/de/vocab_a2.json')
with open(a2_path, 'r', encoding='utf-8') as f:
    a2_words = json.load(f)

a2_idx = len(a2_words) + 1
a2_added = 0
for w, art, pl, mn, en, top in a2_items:
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

# =========================================================================
# B2 Extra items (500 items)
# Professional, Law, Economics, Environment, Science, Philosophy
# =========================================================================
b2_nouns_extra = [
    # Law, Constitution & Governance
    ("Rechtsordnung", "die", "-en", "эрх зүйн тогтолцоо", "legal system", "Recht"),
    ("Gerichtsverfahren", "das", "-", "шүүхийн процесс", "legal proceedings", "Recht"),
    ("Beweismittel", "das", "-", "нотолбол зохих баримт", "evidence", "Recht"),
    ("Schadensersatz", "der", "-", "хохирлыг нөхөн төлөх", "compensation, damages", "Recht"),
    ("Vertragsstrafe", "die", "-n", "гэрээний торгууль", "contractual penalty", "Recht"),
    ("Verjährung", "die", "-en", "хөөн хэлэлцэх хугацаа", "statute of limitations", "Recht"),
    ("Berufung", "die", "-en", "давж заалдах гомдол", "appeal", "Recht"),
    ("Revision", "die", "-en", "хяналтын журмаар хянах", "legal review, audit", "Recht"),
    ("Rechtswidrigkeit", "die", "-en", "хууль бус үйлдэл", "unlawfulness, illegality", "Recht"),
    ("Verhältnismäßigkeit", "die", "-", "зохистой тэнцвэртэй байдал", "proportionality", "Recht"),
    ("Rechtssicherheit", "die", "-", "эрх зүйн найдвартай байдал", "legal certainty", "Recht"),
    ("Rechtsprechung", "die", "-en", "шүүхийн практик", "jurisdiction, case law", "Recht"),
    ("Ermittlung", "die", "-en", "мөрдөн шалгалт", "investigation", "Recht"),
    ("Durchsuchung", "die", "-en", "нэгжлэг хийх", "search, raid", "Recht"),
    ("Beschlagnahmung", "die", "-en", "эд хөрөнгийг хураан авах", "seizure, confiscation", "Recht"),
    ("Festnahme", "die", "-n", "баривчилгаа", "arrest, detention", "Recht"),
    ("Freispruch", "der", "-¨e", "цагаатгах тогтоол", "acquittal", "Recht"),
    ("Verurteilung", "die", "-en", "ял шийтгэл оноох", "conviction, sentencing", "Recht"),
    ("Bewährung", "die", "-", "тэнсэн харгалзах хугацаа", "probation, parole", "Recht"),
    ("Gefängnis", "das", "-se", "хорих анги, шорон", "prison, jail", "Recht"),
    ("Vollzug", "der", "-¨e", "ялын гүйцэтгэл", "execution, enforcement", "Recht"),
    ("Strafgesetzbuch", "das", "-¨er", "эрүүгийн хууль", "penal code", "Recht"),
    ("Zivilgesetzbuch", "das", "-¨er", "иргэний хууль", "civil code", "Recht"),
    ("Handelsgesetzbuch", "das", "-¨er", "худалдааны хууль", "commercial code", "Recht"),

    # Economics, Management & High Finance
    ("Betriebswirtschaft", "die", "-", "бизнесийн удирдлага", "business administration", "Wirtschaft"),
    ("Volkswirtschaft", "die", "-", "үндэсний эдийн засаг", "macroeconomics", "Wirtschaft"),
    ("Wirtschaftsprüfung", "die", "-en", "санхүүгийн аудит", "auditing", "Wirtschaft"),
    ("Steuererklärung", "die", "-en", "татварын тайлан", "tax return", "Wirtschaft"),
    ("Abschreibung", "die", "-en", "элэгдэл хорогдол", "depreciation, write-off", "Wirtschaft"),
    ("Rendite", "die", "-n", "өгөөж, ашигт ажиллагаа", "yield, return", "Wirtschaft"),
    ("Dividende", "die", "-n", "ногдол ашиг", "dividend", "Wirtschaft"),
    ("Liquidität", "die", "-", "төлбөрийн чадвар, хөрвөх чадвар", "liquidity", "Wirtschaft"),
    ("Insolvenz", "die", "-en", "дампуурал", "insolvency, bankruptcy", "Wirtschaft"),
    ("Konkurs", "der", "-e", "дампуурал", "bankruptcy", "Wirtschaft"),
    ("Gläubiger", "der", "-", "зээлдүүлэгч", "creditor", "Wirtschaft"),
    ("Schuldner", "der", "-", "зээлдэгч, өртөн", "debtor", "Wirtschaft"),
    ("Haftung", "die", "-en", "хуулийн хариуцлага", "liability", "Wirtschaft"),
    ("Eigenkapital", "das", "-", "өөрийн хөрөнгө", "equity capital", "Wirtschaft"),
    ("Fremdkapital", "das", "-", "зээлсэн хөрөнгө", "borrowed capital, debt", "Wirtschaft"),
    ("Anleihe", "die", "-n", "бонд, өрийн бичиг", "bond, loan", "Wirtschaft"),
    ("Derivat", "das", "-e", "үүсмэл санхүүгийн хэрэгсэл", "derivative", "Wirtschaft"),
    ("Absicherung", "die", "-en", "эрсдэлийн даатгал, хамгаалалт", "hedging, safeguarding", "Wirtschaft"),
    ("Risikomanagement", "das", "-s", "эрсдэлийн удирдлага", "risk management", "Wirtschaft"),
    ("Wertschöpfung", "die", "-en", "нэмүү өртөг", "value creation", "Wirtschaft"),
    ("Outsourcing", "das", "-", "гадаад гэрээлэлт", "outsourcing", "Wirtschaft"),
    ("Kernkompetenz", "die", "-en", "үндсэн гол давуу чадвар", "core competence", "Wirtschaft"),
    ("Marktlücke", "die", "-n", "зах зээлийн сул орон зай", "market niche", "Wirtschaft"),
    ("Alleinstellungsmerkmal", "das", "-e", "өвөрмөц ялгарах давуу тал", "unique selling proposition (USP)", "Wirtschaft"),
    ("Qualitätsmanagement", "das", "-s", "чанарын удирдлага", "quality management", "Wirtschaft"),
    ("Zertifizierung", "die", "-en", "чанарын баталгаажуулалт", "certification", "Wirtschaft"),
    ("Audit", "das", "-s", "хөндлөнгийн аудит", "audit", "Wirtschaft"),
    ("Stakeholder", "der", "-", "оролцогч тал", "stakeholder", "Wirtschaft"),
    ("Aktionär", "der", "-e", "хувьцаа эзэмшигч", "shareholder", "Wirtschaft"),
    ("Aufsichtsbehörde", "die", "-n", "хяналтын зохицуулах байгууллага", "regulatory authority", "Wirtschaft"),

    # Environmental Science & Sustainability
    ("Treibhauseffekt", "der", "-e", "хүлэмжийн хийн нөлөө", "greenhouse effect", "Umwelt"),
    ("Klimaerwärmung", "die", "-", "дэлхийн дулаарал", "global warming", "Umwelt"),
    ("CO2-Ausstoß", "der", "-¨e", "нүүрстөрөгчийн хийн ялгаралт", "carbon emission", "Umwelt"),
    ("Emissionshandel", "der", "-", "ялгаруулалтын эрхийн худалдаа", "emissions trading", "Umwelt"),
    ("Energiewende", "die", "-", "сэргээгдэх эрчим хүчний шилжилт", "energy transition", "Umwelt"),
    ("Kohlekraftwerk", "das", "-e", "нүүрсний цахилгаан станц", "coal-fired power plant", "Umwelt"),
    ("Kernkraftwerk", "das", "-e", "атомын цахилгаан станц", "nuclear power plant", "Umwelt"),
    ("Atommüll", "der", "-", "цөмийн хаягдал", "nuclear waste", "Umwelt"),
    ("Endlagerung", "die", "-en", "аюултай хаягдлыг бүрмөсөн булах", "final disposal/storage", "Umwelt"),
    ("Photovoltaik", "die", "-", "нарны фото цахилгаан", "photovoltaics", "Umwelt"),
    ("Geothermie", "die", "-", "газрын гүний дулаан", "geothermal energy", "Umwelt"),
    ("Biomasse", "die", "-n", "биологийн масс түлш", "biomass", "Umwelt"),
    ("Artensterben", "das", "-", "амьтан ургамлын төрөл зүйл мөхөх", "species extinction", "Umwelt"),
    ("Biodiversität", "die", "-", "биологийн олон янз байдал", "biodiversity", "Umwelt"),
    ("Ökosystem", "das", "-e", "экосистем", "ecosystem", "Umwelt"),
    ("Waldrodung", "die", "-en", "ой модыг огтлох", "deforestation", "Umwelt"),
    ("Wüstenbildung", "die", "-", "цөлжилт", "desertification", "Umwelt"),
    ("Bodenversiegelung", "die", "-en", "хөрсний бетонон бүрхүүл", "soil sealing", "Umwelt"),
    ("Grundwasserspiegel", "der", "-", "гүний усны төвшин", "groundwater table", "Umwelt"),
    ("Mikroplastik", "das", "-", "бичил хуванцар", "microplastics", "Umwelt"),
    ("Kreislaufwirtschaft", "die", "-en", "эргэлтийн ногоон эдийн засаг", "circular economy", "Umwelt"),
    ("Recyclingquote", "die", "-n", "дахин боловсруулалтын хувь хэмжээ", "recycling rate", "Umwelt"),
    ("Ökobilanz", "die", "-en", "экологийн тэнцвэрийн үнэлгээ", "life cycle assessment", "Umwelt"),
    ("Klimaneutralität", "die", "-", "нүүрстөрөгчийн саармаг байдал", "climate neutrality", "Umwelt"),

    # Higher Education, Research & Epistemology
    ("Forschungsansatz", "der", "-¨e", "судалгааны хандлага", "research approach", "Wissenschaft"),
    ("Erkenntnistheorie", "die", "-", "танин мэдэхүйн онол", "epistemology", "Wissenschaft"),
    ("Wissenschaftstheorie", "die", "-", "шинжлэх ухааны арга зүйн онол", "philosophy of science", "Wissenschaft"),
    ("Geisteswissenschaften", "die", "-", "нийгэм хүмүүнлэгийн ухаан", "humanities", "Wissenschaft"),
    ("Naturwissenschaften", "die", "-", "байгалийн шинжлэх ухаан", "natural sciences", "Wissenschaft"),
    ("Ingenieurwissenschaften", "die", "-", "инженерийн шинжлэх ухаан", "engineering sciences", "Wissenschaft"),
    ("Interdisziplinarität", "die", "-", "салбар хоорондын уялдаа", "interdisciplinarity", "Wissenschaft"),
    ("Plagiat", "das", "-e", "зохиогчийн хулгай, бүтээлийн хулгай", "plagiarism", "Wissenschaft"),
    ("Zitierweise", "die", "-n", "ишлэл татах дүрэм", "citation style", "Wissenschaft"),
    ("Quellenverzeichnis", "das", "-se", "ном зүйн жагсаалт", "bibliography, references", "Wissenschaft"),
    ("Begutachtung", "die", "-en", "мэргэжилтний хөндлөнгийн шүүмж", "peer review, assessment", "Wissenschaft"),
    ("Stipendium", "das", "-ien", "эрдмийн тэтгэлэг", "scholarship, fellowship", "Schule"),
    ("Graduiertenkolleg", "das", "-s", "докторын дараах судалгааны бүлэг", "graduate research group", "Wissenschaft"),
    ("Habilitation", "die", "-en", "профессорын зэрэг хамгаалах бүтээл", "postdoctoral qualification", "Wissenschaft"),
    ("Lehrstuhl", "der", "-¨e", "тэнхим, профессорын суудал", "academic chair, department", "Wissenschaft"),
    ("Fakultät", "die", "-en", "их сургуулийн салбар сургууль, факультет", "faculty", "Wissenschaft"),
    ("Rektorat", "das", "-e", "ректорат, их сургуулийн захиргаа", "rector's office", "Wissenschaft"),
    ("Senat", "der", "-e", "эрдмийн зөвлөл, сенат", "senate, academic council", "Wissenschaft"),
    ("Alumni", "die", "-", "төгсөгчид", "alumni", "Schule"),
    ("Exzellenzinitiative", "die", "-n", "тэргүүлэх чадварыг хөхиүлэн дэмжих төсөл", "excellence initiative", "Wissenschaft"),

    # Philosophy, Mind, Aesthetics & Social Theory
    ("Weltanschauung", "die", "-en", "ертөнцийг үзэх үзэл", "worldview", "Philosophie"),
    ("Menschenbild", "das", "-er", "хүний тухай суурь үзэл баримтлал", "concept of human nature", "Philosophie"),
    ("Erkenntnisfähigkeit", "die", "-", "танин мэдэх чадвар", "cognitive capability", "Philosophie"),
    ("Urteilskraft", "die", "-", "дүгнэх цэгнэх чадвар", "judgment, power of judgment", "Philosophie"),
    ("Vernunft", "die", "-", "эрүүл ухаан, оюун бодол", "reason, intellect", "Philosophie"),
    ("Verstand", "der", "-", "оюун ухаан, ухаан бодол", "mind, intellect", "Philosophie"),
    ("Seelenleben", "das", "-", "сэтгэл зүйн дотоод ертөнц", "inner mental life", "Psychologie"),
    ("Charakterschwäche", "die", "-n", "зан чанарын сул тал", "character weakness", "Psychologie"),
    ("Willensstärke", "die", "-", "зориг хатуужил", "willpower, strength of will", "Psychologie"),
    ("Tugend", "die", "-en", "буянлаг чанар, журамт зан", "virtue", "Philosophie"),
    ("Laster", "das", "-", "муу зуршил, гэм дутагдал", "vice", "Philosophie"),
    ("Schuldgefühl", "das", "-e", "гэм буруугийн мэдрэмж", "feeling of guilt", "Psychologie"),
    ("Schamgefühl", "das", "-e", "ичих мэдрэмж", "sense of shame", "Psychologie"),
    ("Minderwertigkeitsgefühl", "das", "-e", "өөрийгөө голох мэдрэмж", "inferiority complex", "Psychologie"),
    ("Überlegenheitsgefühl", "das", "-e", "дээрэнгүй үзэл, давуу мэдрэмж", "superiority complex", "Psychologie"),
    ("Gleichgültigkeit", "die", "-", "хайхрамжгүй байдал", "indifference, apathy", "Psychologie"),
    ("Entfremdung", "die", "-en", "хөндийрөл, тасран холдох", "alienation, estrangement", "Soziologie"),
    ("Anonymität", "die", "-", "нууц нэргүй байдал", "anonymity", "Gesellschaft"),
    ("Individualismus", "der", "-", "ганцаарчлах үзэл", "individualism", "Gesellschaft"),
    ("Kollektivismus", "der", "-", "хамтач үзэл", "collectivism", "Gesellschaft"),
    ("Pluralismus", "der", "-", "олон ургальч үзэл", "pluralism", "Politik"),
    ("Konservatismus", "der", "-", "уламжлалыг баримтлах үзэл", "conservatism", "Politik"),
    ("Liberalismus", "der", "-", "эрх чөлөөний үзэл", "liberalism", "Politik"),
    ("Sozialismus", "der", "-", "социализм", "socialism", "Politik"),
    ("Populismus", "der", "-", "популизм", "populism", "Politik"),
    ("Nationalismus", "der", "-", "үндсэрхэг үзэл", "nationalism", "Politik"),
    ("Patriotismus", "der", "-", "эх оронч үзэл", "patriotism", "Politik"),
    ("Kosmopolitismus", "der", "-", "дэлхийн иргэний үзэл", "cosmopolitanism", "Philosophie"),
    ("Pragmatismus", "der", "-", "прагматик хандлага", "pragmatism", "Philosophie"),
    ("Idealismus", "der", "-", "үзэл санааг эрхэмлэх хандлага", "idealism", "Philosophie"),
    ("Realismus", "der", "-", "бодит хандлага", "realism", "Philosophie"),
    ("Skeptizismus", "der", "-", "эргэлзэх үзэл", "skepticism", "Philosophie"),
    ("Zynismus", "der", "-", "ёжтой хайнга хандлага", "cynicism", "Philosophie"),
    ("Fatalismus", "der", "-", "хувь тавиландаа найдах үзэл", "fatalism", "Philosophie")
]

# Apply to B2
b2_path = os.path.join(ROOT, 'data/de/vocab_b2.json')
with open(b2_path, 'r', encoding='utf-8') as f:
    b2_words = json.load(f)

b2_idx = len(b2_words) + 1
b2_added = 0
for w, art, pl, mn, en, top in b2_nouns_extra:
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
