#!/usr/bin/env python3
import json
import os
from vocab_helper import nfc, make_de_noun, make_de_verb, make_de_other, ROOT

path = os.path.join(ROOT, 'data/de/vocab_a2.json')
with open(path, 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Also check words in A1 and B1 to avoid duplicate collisions
seen = set(x['word'].strip().lower() for x in existing)
with open(os.path.join(ROOT, 'data/de/vocab_a1.json'), 'r') as f:
    for x in json.load(f):
        seen.add(x['word'].strip().lower())
with open(os.path.join(ROOT, 'data/de/vocab_b1.json'), 'r') as f:
    for x in json.load(f):
        seen.add(x['word'].strip().lower())

idx = len(existing) + 1

a2_nouns = [
    # Housing, Living & Neighborhood
    ("Mietvertrag", "der", "-¨e", "түрээсийн гэрээ", "rental contract", "Wohnen"),
    ("Vermieter", "der", "-", "байр хөлслүүлэгч, эзэн", "landlord", "Wohnen"),
    ("Vermieterin", "die", "-nen", "байрны эзэгтэй", "landlady", "Wohnen"),
    ("Mieter", "der", "-", "түрээслэгч, суугч", "tenant", "Wohnen"),
    ("Mieterin", "die", "-nen", "түрээслэгч эмэгтэй", "female tenant", "Wohnen"),
    ("Nebenkosten", "die", "-", "байрны ашиглалтын зардал", "additional utilities/costs", "Wohnen"),
    ("Kaution", "die", "-en", "байрны барьцаа мөнгө", "deposit, bond", "Wohnen"),
    ("Kündigung", "die", "-en", "цуцлалт, халагдах мэдэгдэл", "cancellation, notice", "Wohnen"),
    ("Umzug", "der", "-¨e", "нүүлгэлт, нүүх", "relocation, move", "Wohnen"),
    ("Hausmeister", "der", "-", "байрны зохион байгуулагч", "caretaker, janitor", "Wohnen"),
    ("Müllabfuhr", "die", "-en", "хог ачилт", "garbage collection", "Wohnen"),
    ("Altbau", "der", "-ten", "хуучны барилга", "old building", "Wohnen"),
    ("Neubau", "der", "-ten", "шинэ барилга", "new building", "Wohnen"),
    ("Erdgeschoss", "das", "-e", "нэгдүгээр давхар (газрын)", "ground floor", "Wohnen"),
    ("Obergeschoss", "das", "-e", "дээд давхар", "upper floor", "Wohnen"),
    ("Dachgeschoss", "das", "-e", "мансард, дээврийн өрөө", "attic floor", "Wohnen"),
    ("Klingel", "die", "-n", "хаалганы хонх", "doorbell", "Wohnen"),
    ("Briefkasten", "der", "-¨", "шуудангийн хайрцаг", "mailbox", "Wohnen"),
    ("Wasserhahn", "der", "-¨e", "усны цорго", "water tap, faucet", "Wohnen"),
    ("Stecknadel", "die", "-n", "зүү, хатгуурт зүү", "pin", "Wohnen"),
    ("Werkzeug", "das", "-e", "багаж хэрэгсэл", "tool", "Wohnen"),
    ("Hammer", "der", "-¨", "алх", "hammer", "Wohnen"),
    ("Zange", "die", "-n", "бариул, бахь", "pliers, tongs", "Wohnen"),
    ("Schraube", "die", "-n", "эрэг, шураг", "screw", "Wohnen"),
    ("Nagel", "der", "-¨", "хадаас, хумс", "nail", "Wohnen"),

    # Work, Career & Office
    ("Lebenslauf", "der", "-¨e", "намтар, анкет", "CV, resume", "Beruf"),
    ("Vorstellungsgespräch", "das", "-e", "ажлын ярилцлага", "job interview", "Beruf"),
    ("Praktikum", "das", "-ka", "дадлага ажил", "internship", "Beruf"),
    ("Praktikant", "der", "-en", "дадлагажигч", "intern", "Beruf"),
    ("Auszubildende", "der", "-n", "мэргэжил эзэмшигч суралцагч", "trainee, apprentice", "Beruf"),
    ("Ausbildung", "die", "-en", "мэргэжлийн боловсрол", "vocational training", "Beruf"),
    ("Arbeitsplatz", "der", "-¨e", "ажлын байр", "workplace", "Beruf"),
    ("Arbeitszeit", "die", "-en", "ажлын цаг", "working hours", "Beruf"),
    ("Feierabend", "der", "-e", "ажил тарах цаг", "end of work day", "Beruf"),
    ("Überstunde", "die", "-n", "илүү цаг", "overtime", "Beruf"),
    ("Pausenraum", "der", "-¨e", "амралтын өрөө", "break room", "Beruf"),
    ("Kantine", "die", "-n", "ажлын газрын гуанз", "canteen, cafeteria", "Beruf"),
    ("Abteilung", "die", "-en", "хэлтэс, тасаг", "department", "Beruf"),
    ("Besprechung", "die", "-en", "хурал, зөвлөгөөн", "meeting, conference", "Beruf"),
    ("Drucker", "der", "-", "хэвлэгч машин", "printer", "Büro"),
    ("Kopierer", "der", "-", "хувилагч машин", "photocopier", "Büro"),
    ("Ordner", "der", "-", "бичиг баримтын хавтас", "folder, binder", "Büro"),
    ("Dokument", "das", "-e", "баримт бичиг", "document", "Büro"),
    ("Vertrag", "der", "-¨e", "гэрээ хэлцэл", "contract", "Beruf"),
    ("Lohn", "der", "-¨e", "хөлс, цалин", "wage", "Beruf"),
    ("Steuer", "die", "-n", "татвар", "tax", "Beruf"),

    # Travel, Holidays & Transport
    ("Gepäck", "das", "-", "ачаа тээш", "luggage, baggage", "Reisen"),
    ("Handgepäck", "das", "-", "гар тээш", "hand luggage", "Reisen"),
    ("Kofferraum", "der", "-¨e", "машины тээшний хэсэг", "car boot, trunk", "Verkehr"),
    ("Tankstelle", "die", "-n", "шатахуун түгээх станц", "petrol station, gas station", "Verkehr"),
    ("Benzin", "das", "-", "бензин", "petrol, gasoline", "Verkehr"),
    ("Diesel", "der", "-", "дизель түлш", "diesel", "Verkehr"),
    ("Autobahn", "die", "-en", "хурдны зам", "highway, motorway", "Verkehr"),
    ("Stau", "der", "-s", "замын түгжрэл", "traffic jam", "Verkehr"),
    ("Umleitung", "die", "-en", "тойрох зам", "detour, diversion", "Verkehr"),
    ("Parkplatz", "der", "-¨e", "машины зогсоол", "parking space", "Verkehr"),
    ("Parkhaus", "das", "-¨er", "зогсоолын барилга", "multi-storey car park", "Verkehr"),
    ("Reisebüro", "das", "-s", "аяллын товчоо", "travel agency", "Reisen"),
    ("Reiseleiter", "der", "-", "аяллын хөтөч", "tour guide", "Reisen"),
    ("Sehenswürdigkeit", "die", "-en", "үзэсгэлэнт газар, дурсгалт газар", "sight, attraction", "Reisen"),
    ("Stadtrundfahrt", "die", "-en", "хотын танилцах аялал", "city sightseeing tour", "Reisen"),
    ("Stadtplan", "der", "-¨e", "хотын газрын зураг", "city map", "Reisen"),
    ("Reisepass", "der", "-¨e", "гадаад паспорт", "passport", "Reisen"),
    ("Grenzstation", "die", "-en", "хилийн шалган нэвтрүүлэх", "border checkpoint", "Reisen"),
    ("Zoll", "der", "-¨e", "гаалийн алба", "customs", "Reisen"),
    ("Campingplatz", "der", "-¨e", "майхант зуслан", "campsite", "Reisen"),
    ("Zelt", "das", "-e", "майхан", "tent", "Reisen"),
    ("Schlafsack", "der", "-¨e", "унтлагын уут", "sleeping bag", "Reisen"),

    # Health, Nutrition & Wellness
    ("Ernährung", "die", "-", "хоол хүнс, шим тэжээл", "nutrition, diet", "Gesundheit"),
    ("Diät", "die", "-en", "дэглэм, хоолны дэглэм", "diet", "Gesundheit"),
    ("Allergie", "die", "-n", "харшил", "allergy", "Gesundheit"),
    ("Unfall", "der", "-¨e", "осол аваар", "accident", "Gesundheit"),
    ("Verletzung", "die", "-en", "бэртэл гэмтэл", "injury", "Gesundheit"),
    ("Krankenwagen", "der", "-", "түргэн тусламжийн тэрэг", "ambulance", "Gesundheit"),
    ("Notarzt", "der", "-¨e", "яаралтай тусламжийн эмч", "emergency doctor", "Gesundheit"),
    ("Notaufnahme", "die", "-n", "яаралтай хүлээн авах тасаг", "emergency room", "Gesundheit"),
    ("Sprechstunde", "die", "-n", "хүлээн авах цаг", "consultation hour", "Gesundheit"),
    ("Wartezimmer", "das", "-", "хүлээлгийн өрөө", "waiting room", "Gesundheit"),
    ("Untersuchung", "die", "-en", "шинжилгээ, үзлэг", "examination", "Gesundheit"),
    ("Behandlung", "die", "-en", "эмчилгээ", "treatment", "Gesundheit"),
    ("Operation", "die", "-en", "хагалгаа", "operation, surgery", "Gesundheit"),
    ("Spritze", "die", "-n", "тариур, тариа", "injection, syringe", "Gesundheit"),
    ("Salbe", "die", "-n", "тосон түрхлэг", "ointment, cream", "Gesundheit"),
    ("Tropfen", "der", "-", "дусаалга", "drops (medicine)", "Gesundheit"),
    ("Gewicht", "das", "-e", "жин, жингийн хэмжээ", "weight", "Gesundheit"),
    ("Waage", "die", "-n", "жинлүүр", "scales", "Gesundheit"),
    ("Blutdruck", "der", "-", "цусны даралт", "blood pressure", "Gesundheit"),

    # Shopping & Consumer Life
    ("Einkaufswagen", "der", "-", "дэлгүүрийн тэрэг", "shopping cart", "Einkaufen"),
    ("Einkaufskorb", "der", "-¨e", "дэлгүүрийн сагс", "shopping basket", "Einkaufen"),
    ("Tüte", "die", "-n", "тор, уут", "plastic bag, paper bag", "Einkaufen"),
    ("Kassenzettel", "der", "-", "төлбөрийн баримт", "receipt", "Einkaufen"),
    ("Kreditkarte", "die", "-n", "зээлийн карт", "credit card", "Einkaufen"),
    ("EC-Karte", "die", "-n", "дебит карт", "debit card", "Einkaufen"),
    ("Bargeld", "das", "-", "бэлэн мөнгө", "cash", "Einkaufen"),
    ("Kleingeld", "das", "-", "задгай мөнгө", "small change, coins", "Einkaufen"),
    ("Münze", "die", "-n", "зоос", "coin", "Einkaufen"),
    ("Schein", "der", "-e", "цаасан мөнгө, хуудас", "banknote, bill", "Einkaufen"),
    ("Umtausch", "der", "-e", "солилт (бараа)", "exchange (goods)", "Einkaufen"),
    ("Reklamation", "die", "-en", "гомдол, буцаалт", "complaint, claim", "Einkaufen"),
    ("Garantie", "die", "-n", "баталгаат хугацаа", "warranty, guarantee", "Einkaufen"),
    ("Sonderangebot", "das", "-e", "тусгай хямдралтай бараа", "special offer", "Einkaufen"),
    ("Ausverkauf", "der", "-¨e", "бүх барааны хямдрал", "clearance sale", "Einkaufen"),
    ("Qualität", "die", "-en", "чанар", "quality", "Einkaufen"),
    ("Material", "das", "-ien", "материал", "material", "Einkaufen"),
    ("Leder", "das", "-", "савхи, шир", "leather", "Einkaufen"),
    ("Baumwolle", "die", "-", "хөвөн, даавуу", "cotton", "Einkaufen"),
    ("Wolle", "die", "-", "ноос", "wool", "Einkaufen"),
    ("Seide", "die", "-", "торго", "silk", "Einkaufen"),

    # Free time, Culture, Sport & Events
    ("Konzert", "das", "-e", "концерт, тоглолт", "concert", "Kultur"),
    ("Ausstellung", "die", "-en", "үзэсгэлэн", "exhibition", "Kultur"),
    ("Galerie", "die", "-n", "уран зургийн галерей", "gallery", "Kultur"),
    ("Eintrittskarte", "die", "-n", "нэвтрэх тасалбар", "admission ticket", "Kultur"),
    ("Ermäßigung", "die", "-en", "үнэ хөнгөлөлт", "discount, reduction", "Kultur"),
    ("Zuschauer", "der", "-", "үзэгч (эрэгтэй)", "spectator, viewer", "Kultur"),
    ("Zuschauerin", "die", "-nen", "үзэгч эмэгтэй", "female spectator", "Kultur"),
    ("Mannschaft", "die", "-en", "баг, хамт олон", "team", "Sport"),
    ("Spieler", "der", "-", "тоглогч", "player", "Sport"),
    ("Tor", "das", "-e", "хаалга (спортын), том хаалга", "goal, gate", "Sport"),
    ("Wettkampf", "der", "-¨e", "тэмцээн уралдаан", "competition, contest", "Sport"),
    ("Sieger", "der", "-", "ялагч", "winner", "Sport"),
    ("Verlierer", "der", "-", "ялагдагч", "loser", "Sport"),
    ("Fitnessstudio", "das", "-s", "фитнесс клуб", "gym, fitness studio", "Sport"),
    ("Mitglied", "das", "-er", "гишүүн", "member", "Verein"),
    ("Verein", "der", "-e", "нийгэмлэг, клуб", "club, association", "Verein"),
    ("Beitrag", "der", "-¨e", "хураамж, хувь нэмэр", "membership fee, contribution", "Verein"),

    # Media, Technology & Internet
    ("Passwort", "das", "-¨er", "нууц үг", "password", "Technik"),
    ("Benutzername", "der", "-n", "хэрэглэгчийн нэр", "username", "Technik"),
    ("Konto", "das", "-ten", "данс, бүртгэл", "account", "Technik"),
    ("Profil", "das", "-e", "профайл", "profile", "Technik"),
    ("Link", "der", "-s", "холбоос", "link", "Technik"),
    ("Website", "die", "-s", "цахим хуудас", "website", "Technik"),
    ("App", "die", "-s", "аппликейшн", "app", "Technik"),
    ("Download", "der", "-s", "татаж авах файл", "download", "Technik"),
    ("Datei", "die", "-en", "файл", "file", "Technik"),
    ("Speicher", "der", "-", "санах ой", "memory, storage", "Technik"),
    ("Akku", "der", "-s", "цэнэглэгч батерей", "rechargeable battery", "Technik"),
    ("Ladekabel", "das", "-", "цэнэглэгч утас", "charging cable", "Technik"),

    # Environment, Climate & Nature
    ("Umwelt", "die", "-", "хүрээлэн буй орчин", "environment", "Umwelt"),
    ("Klima", "das", "-", "уур амьсгал", "climate", "Umwelt"),
    ("Erde", "die", "-", "дэлхий, хөрс", "earth, soil", "Umwelt"),
    ("Luft", "die", "-", "агаар", "air", "Umwelt"),
    ("Umweltschutz", "der", "-", "байгаль орчныг хамгаалах", "environmental protection", "Umwelt"),
    ("Mülltrennung", "die", "-", "хогийг ангилах", "waste separation", "Umwelt"),
    ("Plastik", "das", "-", "хуванцар", "plastic", "Umwelt"),
    ("Glascontainer", "der", "-", "шилний хогийн сав", "glass container", "Umwelt"),
    ("Papiertonne", "die", "-n", "цаасны хогийн сав", "paper bin", "Umwelt"),
    ("Restmüll", "der", "-", "ангилагдаагүй үлдэгдэл хог", "residual waste", "Umwelt"),
    ("Energie", "die", "-n", "эрчим хүч", "energy", "Umwelt"),
    ("Strom", "der", "-", "цахилгаан гүйдэл", "electricity, current", "Umwelt"),
    ("Solarenergie", "die", "-", "нарны эрчим хүч", "solar energy", "Umwelt"),
    ("Windkraft", "die", "-¨e", "салхины эрчим хүч", "wind power", "Umwelt"),

    # Feelings, Character & Society
    ("Freude", "die", "-n", "баяр хөөр", "joy, delight", "Gefühle"),
    ("Wut", "die", "-", "уур хилэн", "anger, rage", "Gefühle"),
    ("Ärger", "der", "-", "уур бухимдал", "trouble, annoyance", "Gefühle"),
    ("Sorge", "die", "-n", "санаа зоволт", "worry, concern", "Gefühle"),
    ("Hoffnung", "die", "-en", "итгэл найдвар", "hope", "Gefühle"),
    ("Erfolg", "der", "-e", "амжилт", "success", "Gefühle"),
    ("Erfahrung", "die", "-en", "туршлага", "experience", "Lernen"),
    ("Meinung", "die", "-en", "үзэл бодол", "opinion", "Kommunikation"),
    ("Ratschlag", "der", "-¨e", "зөвлөгөө", "advice", "Kommunikation"),
    ("Tipp", "der", "-s", "зөвлөмж", "tip, hint", "Kommunikation"),
    ("Vorschlag", "der", "-¨e", "санал", "suggestion, proposal", "Kommunikation"),
    ("Entscheidung", "die", "-en", "шийдвэр", "decision", "Kommunikation"),
    ("Grund", "der", "-¨e", "шалтгаан, үндэс", "reason, cause", "Kommunikation"),
    ("Unterschied", "der", "-e", "ялгаа", "difference", "Kommunikation"),
    ("Ähnlichkeit", "die", "-en", "төстэй байдал", "similarity", "Kommunikation"),
    ("Zukunft", "die", "-", "ирээдүй", "future", "Zeit"),
    ("Vergangenheit", "die", "-", "өнгөрсөн үе", "past", "Zeit"),
    ("Gegenwart", "die", "-", "одоо үе", "present", "Zeit")
]

a2_verbs = [
    ("abholen", "abholen | holt ab | holte ab | hat abgeholt", "+ Akkusativ", "тосож авах", "to pick up", "Verkehr"),
    ("mitbringen", "mitbringen | bringt mit | brachte mit | hat mitgebracht", "+ Dativ + Akkusativ", "авчрах", "to bring along", "Alltag"),
    ("mitkommen", "mitkommen | kommt mit | kam mit | ist mitgekommen", None, "хамт явах", "to come along", "Alltag"),
    ("einladen", "einladen | lädt ein | lud ein | hat eingeladen", "zu + Dativ", "урих", "to invite", "Alltag"),
    ("teilnehmen", "teilnehmen | nimmt teil | nahm teil | hat teilgenommen", "an + Dativ", "оролцох", "to participate, take part", "Gesellschaft"),
    ("stattfinden", "stattfinden | findet statt | fand statt | hat stattgefunden", None, "болох, зохион байгуулагдах", "to take place", "Kultur"),
    ("vorbereiten", "vorbereiten | bereitet vor | bereitete vor | hat vorbereitet", "+ Akkusativ", "бэлтгэх", "to prepare", "Lernen"),
    ("vorstellen", "vorstellen | stellt vor | stellte vor | hat vorgestellt", "+ Akkusativ / Dativ", "танилцуулах, төсөөлөх", "to introduce, imagine", "Kommunikation"),
    ("verabreden", "verabreden | verabredet | verabredete | hat verabredet", "mit + Dativ", "болзох, цаг тохирох", "to make an appointment", "Alltag"),
    ("vereinbaren", "vereinbaren | vereinbart | vereinbarte | hat vereinbart", "+ Akkusativ", "тохиролцох", "to arrange, agree on", "Alltag"),
    ("verschieben", "verschieben | verschiebt | verschob | hat verschoben", "auf + Akkusativ", "хойшлуулах", "to postpone, shift", "Alltag"),
    ("absagen", "absagen | sagt ab | sagte ab | hat abgesagt", "+ Akkusativ", "цуцлах", "to cancel", "Alltag"),
    ("zusagen", "zusagen | sagt zu | sagte zu | hat zugesagt", "+ Dativ", "зөвшөөрөх, амлах", "to accept, confirm", "Alltag"),
    ("empfehlen", "empfehlen | empfiehlt | empfahl | hat empfohlen", "+ Dativ + Akkusativ", "зөвлөх, санал болгох", "to recommend", "Kommunikation"),
    ("vorschlagen", "vorschlagen | schlägt vor | schlug vor | hat vorgeschlagen", "+ Dativ + Akkusativ", "санал болгох", "to suggest", "Kommunikation"),
    ("entscheiden", "entscheiden | entscheidet | entschied | hat entschieden", "über + Akkusativ", "шийдэх", "to decide", "Kognition"),
    ("beschweren", "beschweren | beschwert | beschwerte | hat beschwert", "über + Akkusativ", "гомдол гаргах", "to complain", "Alltag"),
    ("reparieren", "reparieren | repariert | reparierte | hat repariert", "+ Akkusativ", "засах, янзлах", "to repair", "Wohnen"),
    ("funktionieren", "funktionieren | funktioniert | funktionierte | hat funktioniert", None, "ажиллах (төхөөрөмж)", "to function, work", "Technik"),
    ("wechseln", "wechseln | wechselt | wechselte | hat gewechselt", "+ Akkusativ", "солих", "to change, exchange", "Alltag"),
    ("tauschen", "tauschen | tauscht | tauschte | hat getauscht", "+ Akkusativ", "солилцох", "to swap, trade", "Alltag"),
    ("leihen", "leihen | leiht | lieh | hat geliehen", "+ Dativ + Akkusativ", "зээлэх, зээлдүүлэх", "to lend, borrow", "Alltag"),
    ("schenken", "schenken | schenkt | schenkte | hat geschenkt", "+ Dativ + Akkusativ", "бэлэглэх", "to gift, give", "Alltag"),
    ("gratulieren", "gratulieren | gratuliert | gratulierte | hat gratuliert", "zu + Dativ", "баяр хүргэх", "to congratulate", "Alltag"),
    ("wünschen", "wünschen | wünscht | wünschte | hat gewünscht", "+ Dativ + Akkusativ", "хүсэх", "to wish", "Gefühle"),
    ("freuen", "freuen | freut | freute | hat gefreut", "auf / über + Akkusativ", "баярлах", "to be glad, look forward", "Gefühle"),
    ("ärgern", "ärgern | ärgert | ärgerte | hat geärgert", "über + Akkusativ", "уурлах, бухимдах", "to annoy, get angry", "Gefühle"),
    ("interessieren", "interessieren | interessiert | interessierte | hat interessiert", "für + Akkusativ", "сонирхох", "to interest", "Gefühle"),
    ("kümmern", "kümmern | kümmert | kümmerte | hat gekümmert", "um + Akkusativ", "анхаарал тавих", "to take care of", "Alltag"),
    ("passen", "passen | passt | passte | hat gepasst", "zu + Dativ", "тохирох", "to fit, match", "Alltag"),
    ("gehören", "gehören | gehört | gehörte | hat gehört", "zu + Dativ", "харьяалагдах, өмч байх", "to belong to", "Alltag"),
    ("bedeuten", "bedeuten | bedeutet | bedeutete | hat bedeutet", "+ Akkusativ", "утгатай байх", "to mean, signify", "Sprache"),
    ("merken", "merken | merkt | merkte | hat gemerkt", "+ Akkusativ", "тогтоох, анзаарах", "to notice, remember", "Kognition"),
    ("erinnern", "erinnern | erinnert | erinnerte | hat erinnert", "an + Akkusativ", "санах, дурсах", "to remember, remind", "Kognition"),
    ("vergessen", "vergessen | vergisst | vergaß | hat vergessen", "+ Akkusativ", "мартах", "to forget", "Kognition"),
    ("prüfen", "prüfen | prüft | prüfte | hat geprüft", "+ Akkusativ", "шалгах", "to check, examine", "Lernen"),
    ("bestehen", "bestehen | besteht | bestand | hat bestanden", "+ Akkusativ", "тэнцэх (шалгалтад)", "to pass (an exam)", "Lernen"),
    ("durchfallen", "durchfallen | fällt durch | fiel durch | ist durchgefallen", "bei + Dativ", "унаах (шалгалтад)", "to fail (an exam)", "Lernen"),
    ("anmelden", "anmelden | meldet an | meldete an | hat angemeldet", "+ Akkusativ", "бүртгүүлэх", "to register, sign up", "Alltag"),
    ("abmelden", "abmelden | meldet ab | meldete ab | hat abgemeldet", "+ Akkusativ", "бүртгэлээс хасах", "to unregister", "Alltag"),
    ("unterschreiben", "unterschreiben | unterschreibt | unterschrieb | hat unterschrieben", "+ Akkusativ", "гарын үсэг зурах", "to sign", "Alltag"),
    ("ausfüllen", "ausfüllen | füllt aus | füllte aus | hat ausgefüllt", "+ Akkusativ", "бөглөх (анкет)", "to fill in (a form)", "Alltag"),
    ("ausdrucken", "ausdrucken | druckt aus | druckte aus | hat ausgedruckt", "+ Akkusativ", "хэвлэж гаргах", "to print out", "Technik"),
    ("kopieren", "kopieren | kopiert | kopierte | hat kopiert", "+ Akkusativ", "хувилах", "to copy", "Technik"),
    ("löschen", "löschen | löscht | löschte | hat gelöscht", "+ Akkusativ", "устгах, унтраах", "to delete, extinguish", "Technik"),
    ("speichern", "speichern | speichert | speicherte | hat gespeichert", "+ Akkusativ", "хадгалах (файл)", "to save, store", "Technik"),
    ("senden", "senden | sendet | sendete | hat gesendet", "+ Dativ + Akkusativ", "илгээх", "to send", "Kommunikation"),
    ("empfangen", "empfangen | empfängt | empfing | hat empfangen", "+ Akkusativ", "хүлээн авах", "to receive", "Kommunikation"),
    ("mitteilen", "mitteilen | teilt mit | teilte mit | hat mitgeteilt", "+ Dativ + Akkusativ", "мэдээлэх", "to communicate, inform", "Kommunikation"),
    ("informieren", "informieren | informiert | informierte | hat informiert", "über + Akkusativ", "мэдээлэл өгөх", "to inform", "Kommunikation")
]

a2_adjectives = [
    ("angenehm", "adj", "аятайхан, тааламжтай", "pleasant", "Eigenschaft"),
    ("unangenehm", "adj", "таагүй", "unpleasant", "Eigenschaft"),
    ("bequem", "adj", "тухтай, аятайхан", "comfortable", "Eigenschaft"),
    ("unbequem", "adj", "тухгүй", "uncomfortable", "Eigenschaft"),
    ("fleißig", "adj", "хичээнгүй", "hardworking, diligent", "Charakter"),
    ("faul", "adj", "залхуу, муудсан", "lazy, rotten", "Charakter"),
    ("klug", "adj", "ухаалаг", "clever, smart", "Charakter"),
    ("dumm", "adj", "тэнэг", "stupid, silly", "Charakter"),
    ("reich", "adj", "баян", "rich, wealthy", "Gesellschaft"),
    ("arm", "adj", "ядуу", "poor", "Gesellschaft"),
    ("gefährlich", "adj", "аюултай", "dangerous", "Eigenschaft"),
    ("sicher", "adj", "найдвартай, аюулгүй", "safe, secure, certain", "Eigenschaft"),
    ("unsicher", "adj", "тодорхойгүй, найдваргүй", "unsafe, uncertain", "Eigenschaft"),
    ("seltsam", "adj", "хачин жигтэй", "strange, odd", "Eigenschaft"),
    ("komisch", "adj", "хөгжилтэй, хачин", "funny, strange", "Eigenschaft"),
    ("interessant", "adj", "сонирхолтой", "interesting", "Eigenschaft"),
    ("langweilig", "adj", "уйтгартай", "boring", "Eigenschaft"),
    ("spannend", "adj", "сэтгэл догдлуулам", "exciting, thrilling", "Eigenschaft"),
    ("wunderbar", "adj", "гайхамшигтай", "wonderful", "Eigenschaft"),
    ("schrecklich", "adj", "аймшигтай", "terrible, awful", "Eigenschaft"),
    ("bekannt", "adj", "алдартай, танил", "well-known, famous", "Eigenschaft"),
    ("unbekannt", "adj", "үл мэдэгдэх, танихгүй", "unknown", "Eigenschaft"),
    ("beliebt", "adj", "олон нийтийн дуртай", "popular", "Eigenschaft"),
    ("berühmt", "adj", "алдар хүндтэй", "famous", "Eigenschaft"),
    ("aktuell", "adj", "цаг үеийн, шинэ", "current, up-to-date", "Medien"),
    ("regelmäßig", "adj", "тогтмол, дүрэм ёсоор", "regular", "Zeit"),
    ("täglich", "adj", "өдөр тутмын", "daily", "Zeit"),
    ("wöchentlich", "adj", "долоо хоног тутмын", "weekly", "Zeit"),
    ("monatlich", "adj", "сар тутмын", "monthly", "Zeit"),
    ("jährlich", "adj", "жил бүрийн", "annual, yearly", "Zeit"),
    ("geöffnet", "adj", "нээлттэй", "open", "Alltag"),
    ("geschlossen", "adj", "хаалттай", "closed", "Alltag"),
    ("gültig", "adj", "хүчинтэй", "valid", "Alltag"),
    ("ungültig", "adj", "хүчингүй", "invalid", "Alltag"),
    ("kostenlos", "adj", "үнэ төлбөргүй", "free of charge", "Einkaufen"),
    ("umsonst", "adv", "үнэгүй, дэмий хоосон", "for free, in vain", "Einkaufen"),
    ("preiswert", "adj", "үнэ боломжийн", "good value, reasonable", "Einkaufen"),
    ("notwendig", "adj", "зайлшгүй шаардлагатай", "necessary", "Eigenschaft"),
    ("möglich", "adj", "боломжтой", "possible", "Eigenschaft"),
    ("unmöglich", "adj", "боломжгүй", "impossible", "Eigenschaft"),
    ("wahrscheinlich", "adj", "магадлалтай", "probable, likely", "Eigenschaft"),
    ("vorsichtig", "adj", "болгоомжтой", "cautious, careful", "Eigenschaft"),
    ("mutig", "adj", "зоригтой", "brave, courageous", "Charakter"),
    ("nervös", "adj", "сандарсан, тэвдсэн", "nervous", "Gefühle"),
    ("stolz", "adj", "бахархалтай", "proud", "Gefühle"),
    ("eifersüchtig", "adj", "атаархсан, хардсан", "jealous", "Gefühle"),
    ("neugierig", "adj", "сониуч", "curious", "Charakter"),
    ("geduldig", "adj", "тэвчээртэй", "patient", "Charakter"),
    ("ungeduldig", "adj", "тэвчээргүй", "impatient", "Charakter"),
    ("überrascht", "adj", "гайхсан", "surprised", "Gefühle")
]

added = 0
for w, art, pl, mn, en, top in a2_nouns:
    if w.strip().lower() not in seen:
        entry = make_de_noun(idx, w, art, pl, mn, en, topic=top)
        entry['level'] = 'A2'
        existing.append(entry)
        seen.add(w.strip().lower())
        idx += 1
        added += 1

for w, forms, rek, mn, en, top in a2_verbs:
    if w.strip().lower() not in seen:
        entry = make_de_verb(idx, w, forms, rek, mn, en, topic=top)
        entry['level'] = 'A2'
        existing.append(entry)
        seen.add(w.strip().lower())
        idx += 1
        added += 1

for w, pos, mn, en, top in a2_adjectives:
    if w.strip().lower() not in seen:
        entry = make_de_other(idx, w, pos, mn, en, topic=top)
        entry['level'] = 'A2'
        existing.append(entry)
        seen.add(w.strip().lower())
        idx += 1
        added += 1

print(f"Added {added} new DE A2 words. New Total: {len(existing)}")

with open(path, 'w', encoding='utf-8') as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)
