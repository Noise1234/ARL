import json
import unicodedata

def nfc(s):
    if isinstance(s, str):
        return unicodedata.normalize('NFC', s.strip())
    if isinstance(s, dict):
        return {k: nfc(v) for k, v in s.items()}
    if isinstance(s, list):
        return [nfc(x) for x in s]
    return s

de_immersion = [
    {
        "id": "de_imm_01",
        "title": "Nicos Weg (Deutsche Welle)",
        "type": "show",
        "level": "A1-B1",
        "description": {
            "mn": "Германд ирсэн залуугийн адал явдлаар дамжуулан анхан шатнаас B1 хүртэл бүх дүрмийг бодит харилцан яриагаар харуулдаг шилдэг цуврал.",
            "en": "Immersive telenovela from Deutsche Welle following a Spanish newcomer, systematically covering A1 through B1 with transcripts.",
            "de": "Interaktive Telenovela der Deutschen Welle für Deutschlerner von A1 bis B1 mit authentischen Dialogen und Untertiteln."
        },
        "note": "Watch each 2-minute episode once without subtitles, then once with German subtitles."
    },
    {
        "id": "de_imm_02",
        "title": "Slow German mit Annik Rubens",
        "type": "podcast",
        "level": "A2-B1",
        "description": {
            "mn": "Германы соёл, түүх, өдөр тутмын амьдралын сэдвүүдийг тод, удаан дуудлагаар ярьдаг сонгодог подкаст.",
            "en": "Cult podcast presenting German culture, history, and daily life in clear, deliberate, slowly spoken German.",
            "de": "Klassischer Lern-Podcast über deutsche Kultur, Alltag und Geschichte in verständlichem, langsamem Hochdeutsch."
        },
        "note": "Listen with the free transcript and highlight new collocations."
    },
    {
        "id": "de_imm_03",
        "title": "Easy German Podcast & Street Interviews",
        "type": "podcast",
        "level": "B1-B2",
        "description": {
            "mn": "Берлиний гудамжнаас хүмүүстэй хийсэн бодит ярилцлага, өдөр тутмын амьд хэллэгийг сурахад төгс тохирно.",
            "en": "Authentic street interviews and weekly podcast dialogues discussing current affairs and vernacular German.",
            "de": "Authentische Straßeninterviews und Podcast-Gespräche mit natürlichen Redewendungen und Humor."
        },
        "note": "Listen at normal speed while walking or commuting to train passive listening comprehension."
    },
    {
        "id": "de_imm_04",
        "title": "Tschick (Wolfgang Herrndorf)",
        "type": "book",
        "level": "B1-B2",
        "description": {
            "mn": "Хоёр өсвөр насны хүү хулгайн Лада машинаар зуны амралтаараа аялж буй орчин үеийн сонгодог, уншихад хялбар роман.",
            "en": "Modern German road-trip classic about two teenage outsiders driving an old stolen Lada through East Germany.",
            "de": "Moderner Roman-Klassiker über zwei jugendliche Außenseiter auf einer abenteuerlichen Sommerreise im geklauten Lada."
        },
        "note": "Read one chapter per day; look up only words that recur frequently."
    },
    {
        "id": "de_imm_05",
        "title": "Der Vorleser (Bernhard Schlink)",
        "type": "book",
        "level": "B2",
        "description": {
            "mn": "Дэлхийн шилдэг борлуулалттай, гүн философи, түүхийн сэдэвтэй, тодорхой цэвэрхэн герман хэлээр бичигдсэн бүтээл.",
            "en": "Masterpiece of post-war German literature written in lucid, spare, accessible prose examining guilt and memory.",
            "de": "Weltbestseller der Nachkriegsliteratur in klarer, unprätentiöser Prosa über Schuld, Scham und Erinnerung."
        },
        "note": "Ideal for building B2 academic vocabulary and complex participle constructions."
    },
    {
        "id": "de_imm_06",
        "title": "Dark (Netflix)",
        "type": "show",
        "level": "B2",
        "description": {
            "mn": "Германы жижиг хотод өрнөх цаг хугацааны нууцлаг аялал, гэр бүлийн нууцыг өгүүлэх шинжлэх ухааны уран зөгнөлт алдарт цуврал.",
            "en": "Acclaimed mystery sci-fi series set in a small German town exploring time travel and multi-generational secrets.",
            "de": "Komplexe Mystery-Science-Fiction-Serie mit anspruchsvollen Dialogen und philosophischen Fragen."
        },
        "note": "Use German audio with German subtitles only; pause to note colloquial expressions."
    }
]

en_immersion = [
    {
        "id": "en_imm_01",
        "title": "BBC 6 Minute English",
        "type": "podcast",
        "level": "A2-B1",
        "description": {
            "mn": "BBC-ийн 6 минутын сонирхолтой сэдвүүд, түлхүүр үгсийн тайлбартай шилдэг богино подкаст.",
            "en": "Flagship short-form podcast exploring everyday topics with key vocabulary explanations and full transcripts.",
            "de": "Kompakter Bildungs-Podcast der BBC mit Fokus auf Vokabelaufbau und idiomatische Ausdrücke."
        },
        "note": "Dedicate 6 minutes every morning; review the 6 featured vocabulary items."
    },
    {
        "id": "en_imm_02",
        "title": "Luke's English Podcast",
        "type": "podcast",
        "level": "B1-B2",
        "description": {
            "mn": "Лондонгийн инээдмийн жүжигчин, англи хэлний багш Люкийн хөтөлдөг, байгалийн чөлөөтэй яриаг заадаг алдартай подкаст.",
            "en": "Award-winning podcast hosted by a British teacher and comedian offering natural, engaging, long-form conversations.",
            "de": "Prämierter Podcast mit natürlichem britischen Englisch, feinsinnigem Humor und Grammatikanalysen."
        },
        "note": "Listen to the natural cadence and rhythm of connected speech."
    },
    {
        "id": "en_imm_03",
        "title": "The Old Man and the Sea (Ernest Hemingway)",
        "type": "book",
        "level": "A2-B1",
        "description": {
            "mn": "Хэмингуэйн товч тодорхой, хүчирхэг богино өгүүлбэрээр бичсэн, анхан дунд шатныханд хамгийн их зөвлөдөг сонгодог зохиол.",
            "en": "Nobel Prize-winning novella celebrated for Hemingway's spare, direct, rhythmic syntax.",
            "de": "Nobelpreisgekrönte Novelle in schnörkelloser, klarer Sprache; perfekt für Lerner ab A2/B1."
        },
        "note": "Study how concise simple sentences build profound narrative tension."
    },
    {
        "id": "en_imm_04",
        "title": "1984 (George Orwell)",
        "type": "book",
        "level": "B1-B2",
        "description": {
            "mn": "Үгийн баялаг, улс төр нийгмийн дүн шинжилгээ, хэлний хүчийг харуулсан дэлхийн сонгодог бүтээл.",
            "en": "Dystopian masterpiece written in clean, analytical English, essential for mastering political discourse.",
            "de": "Dystopischer Klassiker in präziser Prosa; ideal zur Festigung von B2-Diskursstrukturen."
        },
        "note": "Pay attention to compound nouns, passive constructions, and Newspeak prefixes."
    },
    {
        "id": "en_imm_05",
        "title": "Planet Earth & Blue Planet (BBC)",
        "type": "show",
        "level": "B1-B2",
        "description": {
            "mn": "Дэвид Аттенборогийн гайхалтай тайлбартай, төгс дуудлага, дүрслэх чадварыг хөгжүүлэх шилдэг байгалийн баримтат цуврал.",
            "en": "Legendary documentary series narrated by Sir David Attenborough featuring flawless enunciation and vivid vocabulary.",
            "de": "Naturdokumentationen mit perfekter englischer Artikulation und reichem deskriptiven Wortschatz."
        },
        "note": "Focus on adjective-noun pairings and poetic descriptive phrasing."
    }
]

with open('data/de/immersion.json', 'w', encoding='utf-8') as f:
    json.dump(nfc(de_immersion), f, ensure_ascii=False, indent=2)

with open('data/en/immersion.json', 'w', encoding='utf-8') as f:
    json.dump(nfc(en_immersion), f, ensure_ascii=False, indent=2)

print("Saved data/de/immersion.json and data/en/immersion.json.")
