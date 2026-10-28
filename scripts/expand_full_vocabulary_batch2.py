#!/usr/bin/env python3
"""
Batch 2 Vocabulary Expansion for ARL
Adds more high-yield vocabulary to reach substantial counts across all levels:
- A1 German (Clothing, Animals, Days of Week, Colors, Home)
- A2 German (Professions, Environment, Emotions, Travel)
- B2 German (Academic, Philosophical, Legal, Economic)
- English A1, A2, B1, B2
"""

import json
import unicodedata
import os

ROOT = '/root/ARL'

def nfc(text):
    if text is None:
        return None
    return unicodedata.normalize('NFC', str(text).strip())

def clean_entry(entry):
    return {k: nfc(v) if isinstance(v, str) else v for k, v in entry.items()}

def load_json(rel_path):
    p = os.path.join(ROOT, rel_path)
    with open(p, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(rel_path, data):
    p = os.path.join(ROOT, rel_path)
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {rel_path} with {len(data)} items.")

# ==========================================
# GERMAN A1 BATCH 2
# ==========================================
de_a1_b2_nouns = [
    # Days of week
    ("Montag", "der", "-e", "noun", "даваа гараг", "Monday", "der Montag, -e", "Am Montag beginnt die neue Arbeitswoche.", "Даваа гарагт шинэ ажлын долоо хоног эхэлдэг.", "On Monday the new work week begins.", "Zeit"),
    ("Dienstag", "der", "-e", "noun", "мягмар гараг", "Tuesday", "der Dienstag, -e", "Am Dienstag habe ich einen Termin.", "Мягмар гарагт би уулзалттай.", "On Tuesday I have an appointment.", "Zeit"),
    ("Mittwoch", "der", "-e", "noun", "лхагва гараг", "Wednesday", "der Mittwoch, -e", "Mittwoch ist die Mitte der Woche.", "Лхагва гараг бол долоо хоногийн дунд үе юм.", "Wednesday is the middle of the week.", "Zeit"),
    ("Donnerstag", "der", "-e", "noun", "пүрэв гараг", "Thursday", "der Donnerstag, -e", "Donnerstags gehen wir schwimmen.", "Пүрэв гарагуудад бид сэлэхээр явдаг.", "On Thursdays we go swimming.", "Zeit"),
    ("Freitag", "der", "-e", "noun", "баасан гараг", "Friday", "der Freitag, -e", "Freitagabend treffen wir Freunde.", "Баасан гарагийн орой бид найзуудтайгаа уулздаг.", "On Friday evening we meet friends.", "Zeit"),
    ("Samstag", "der", "-e", "noun", "бямба гараг", "Saturday", "der Samstag, -e", "Samstag ist mein Lieblingstag.", "Бямба гараг бол миний дуртай өдөр.", "Saturday is my favorite day.", "Zeit"),
    ("Sonntag", "der", "-e", "noun", "ням гараг", "Sunday", "der Sonntag, -e", "Am Sonntag ruhen wir uns aus.", "Ням гарагт бид амардаг.", "On Sunday we rest.", "Zeit"),

    # Seasons & Nature
    ("Frühling", "der", "-e", "noun", "хавар", "spring", "der Frühling, -e", "Im Frühling blühen die Blumen.", "Хавар цэцэгс дэлгэрдэг.", "In spring the flowers bloom.", "Natur"),
    ("Sommer", "der", "-", "noun", "зун", "summer", "der Sommer, -", "Im Sommer fahren wir ans Meer.", "Зун бид далайн эрэг рүү явдаг.", "In summer we go to the sea.", "Natur"),
    ("Herbst", "der", "-e", "noun", "намар", "autumn, fall", "der Herbst, -e", "Im Herbst fallen die Blätter.", "Намар навчис унадаг.", "In autumn the leaves fall.", "Natur"),
    ("Winter", "der", "-", "noun", "өвөл", "winter", "der Winter, -", "Im Winter liegt überall Schnee.", "Өвөл хаа сайгүй цас дардаг.", "In winter snow lies everywhere.", "Natur"),

    # Clothing
    ("Hemd", "das", "-en", "noun", "цамц (эрэгтэй)", "shirt", "das Hemd, -en", "Er trägt ein weißes Hemd.", "Тэр цагаан цамц өмссөн байна.", "He is wearing a white shirt.", "Kleidung"),
    ("Hose", "die", "-n", "noun", "өмд", "pants, trousers", "die Hose, -n", "Diese Hose passt mir perfekt.", "Энэ өмд надад яг таарч байна.", "These trousers fit me perfectly.", "Kleidung"),
    ("Kleid", "das", "-er", "noun", "даашинз", "dress", "das Kleid, -er", "Sie kauft ein blaues Kleid.", "Тэр цэнхэр даашинз худалдаж авч байна.", "She buys a blue dress.", "Kleidung"),
    ("Jacke", "die", "-n", "noun", "хүрмэн хүрэм, пиджак", "jacket", "die Jacke, -n", "Zieh eine warme Jacke an.", "Дулаан хүрэм өмсөөрэй.", "Put on a warm jacket.", "Kleidung"),
    ("Schuh", "der", "-e", "noun", "гутал", "shoe", "der Schuh, -e", "Meine neuen Schuhe sind sehr bequem.", "Миний шинэ гутал маш тухтай байна.", "My new shoes are very comfortable.", "Kleidung"),
    ("Mantel", "der", "-¨", "noun", "пальто, цув", "coat", "der Mantel, -¨", "Im Winter brauche ich einen dicken Mantel.", "Өвөл надад зузаан пальто хэрэгтэй.", "In winter I need a thick coat.", "Kleidung"),

    # Body & Health basics
    ("Körper", "der", "-", "noun", "бие махбод", "body", "der Körper, -", "Bewegung tut dem Körper gut.", "Хөдөлгөөн биед сайн.", "Movement does the body good.", "Gesundheit"),
    ("Nase", "die", "-n", "noun", "хамар", "nose", "die Nase, -n", "Meine Nase läuft.", "Миний хамраас нус гоожиж байна.", "My nose is running.", "Gesundheit"),
    ("Mund", "der", "-¨er", "noun", "ам", "mouth", "der Mund, -¨er", "Bitte öffnen Sie den Mund.", "Амаа ангайна уу.", "Please open your mouth.", "Gesundheit"),
    ("Zahn", "der", "-¨e", "noun", "шүд", "tooth", "der Zahn, -¨e", "Ich muss mir die Zähne putzen.", "Би шүдээ угаах хэрэгтэй.", "I have to brush my teeth.", "Gesundheit"),
    ("Ohr", "das", "-en", "noun", "чих", "ear", "das Ohr, -en", "Mein linkes Ohr tut weh.", "Миний зүүн чих өвдөж байна.", "My left ear hurts.", "Gesundheit"),

    # Animals
    ("Hund", "der", "-e", "noun", "нохой", "dog", "der Hund, -e", "Der Hund bellt laut.", "Нохой чанга хуцаж байна.", "The dog barks loudly.", "Tiere"),
    ("Katze", "die", "-n", "noun", "муур", "cat", "die Katze, -n", "Die Katze schläft auf dem Sofa.", "Муур буйдан дээр унтаж байна.", "The cat sleeps on the sofa.", "Tiere"),
    ("Vogel", "der", "-¨", "noun", "шувуу", "bird", "der Vogel, -¨", "Ein kleiner Vogel singt im Baum.", "Модон дээр жижиг шувуу дуулж байна.", "A little bird sings in the tree.", "Tiere"),
    ("Pferd", "das", "-e", "noun", "морь", "horse", "der Pferd, -e", "Das Pferd läuft sehr schnell.", "Морь маш хурдан гүйдэг.", "The horse runs very fast.", "Tiere"),

    # Everyday Concepts
    ("Zeiger", "der", "-", "noun", "зүү (цагны)", "hand (clock)", "der Zeiger, -", "Der Zeiger steht auf zwölf.", "Цагны зүү 12 дээр байна.", "The hand is at twelve.", "Zeit"),
    ("Farbe", "die", "-n", "noun", "өнгө", "color", "die Farbe, -n", "Blau ist meine Lieblingsfarbe.", "Цэнхэр бол миний дуртай өнгө.", "Blue is my favorite color.", "Alltag"),
    ("Bild", "das", "-er", "noun", "зураг", "picture, painting", "das Bild, -er", "An der Wand hängt ein schönes Bild.", "Ханан дээр сайхан зураг өлгөөтэй байна.", "A beautiful picture hangs on the wall.", "Wohnen"),
    ("Musik", "die", "-", "noun", "хөгжим", "music", "die Musik, -", "Ich höre gern klassische Musik.", "Би сонгодог хөгжим сонсох дуртай.", "I like listening to classical music.", "Freizeit"),
    ("Lied", "das", "-er", "noun", "дуу", "song", "das Lied, -er", "Wir singen gemeinsam ein deutsches Lied.", "Бид хамтдаа герман дуу дуулж байна.", "We sing a German song together.", "Freizeit"),
    ("Film", "der", "-e", "noun", "кино", "movie, film", "der Film, -e", "Der Film im Kino war spannend.", "Кино театрын кино сонирхолтой байсан.", "The film in the cinema was exciting.", "Freizeit"),
    ("Zahl", "die", "-en", "noun", "тоо, тоо ширхэг", "number", "die Zahl, -en", "Welche Zahl fehlt hier?", "Энд ямар тоо дутаж байна вэ?", "Which number is missing here?", "Lernen"),
    ("Wort", "das", "-¨er", "noun", "үг", "word", "das Wort, -¨er", "Ich lerne heute zwanzig neue Wörter.", "Би өнөөдөр хорин шинэ үг цээжилж байна.", "I learn twenty new words today.", "Lernen"),
    ("Satz", "der", "-¨e", "noun", "өгүүлбэр", "sentence", "der Satz, -¨e", "Dieser Satz ist grammatisch korrekt.", "Энэ өгүүлбэр дүрмийн хувьд зөв байна.", "This sentence is grammatically correct.", "Lernen")
]

# Adjust any typos in der Pferd -> das Pferd
de_a1_b2_nouns = [(w, "das" if w == "Pferd" else art, pl, pos, mn_t, en_t, f"das {w}, {pl}" if w == "Pferd" else disp, ex_de, ex_mn, ex_en, topic) for w, art, pl, pos, mn_t, en_t, disp, ex_de, ex_mn, ex_en, topic in de_a1_b2_nouns]

de_a1_b2_verbs = [
    ("sitzen", "sitzt", "saß", "hat gesessen", "auf + Dativ", "sitz__ [V] (Präsens: er/sie/es ?)", "суух", "to sit", "Wir sitzen am Tisch und essen.", "Бид ширээний ард суугаад хооллож байна.", "We sit at the table and eat.", "Alltag"),
    ("stehen", "steht", "stand", "hat gestanden", "an + Dativ", "steh__ [V] (Präsens: er/sie/es ?)", "зогсох", "to stand", "Das Auto steht vor dem Haus.", "Машин байшингийн урд зогсож байна.", "The car stands in front of the house.", "Alltag"),
    ("liegen", "liegt", "lag", "hat gelegen", "auf + Dativ", "lieg__ [V] (Präsens: er/sie/es ?)", "хэвтэх, орших", "to lie", "Das Buch liegt auf dem Schreibtisch.", "Ном бичгийн ширээн дээр байна.", "The book lies on the desk.", "Alltag"),
    ("bringen", "bringt", "brachte", "hat gebracht", "+ Dativ + Akkusativ", "bringen + _____", "авчирах", "to bring", "Der Kellner bringt die Rechnung.", "Зөөгч тооцоог авчирч байна.", "The waiter brings the bill.", "Gastronomie"),
    ("tragen", "trägt", "trug", "hat getragen", "+ Akkusativ", "trag__ [V] (Präsens: er/sie/es ?)", "өмсөх, үүрэх", "to carry, wear", "Er trägt einen warmen Pullover.", "Тэр дулаан цамц өмссөн байна.", "He wears a warm sweater.", "Kleidung"),
    ("waschen", "wäscht", "wusch", "hat gewaschen", "+ Akkusativ", "wasch__ [V] (Präsens: er/sie/es ?)", "угаах", "to wash", "Ich wasche meine Hände mit Seife.", "Би гараа савангаар угаадаг.", "I wash my hands with soap.", "Hygiene"),
    ("zahlen", "zahlt", "zahlte", "hat gezahlt", "+ Akkusativ", "zahlen + _____", "төлөх", "to pay", "Ich möchte bitte zahlen.", "Би тооцоогоо хиймээр байна.", "I would like to pay, please.", "Alltag"),
    ("feiern", "feiert", "feierte", "hat gefeiert", "+ Akkusativ", "feiern + _____", "тэмдэглэх", "to celebrate", "Wir feiern heute seinen Geburtstag.", "Бид өнөөдөр түүний төрсөн өдрийг тэмдэглэж байна.", "We are celebrating his birthday today.", "Freizeit")
]

# ==========================================
# GERMAN A2 BATCH 2
# ==========================================
de_a2_b2_nouns = [
    ("Gefühl", "das", "-e", "noun", "мэдрэмж, сэтгэгдэл", "feeling, emotion", "das Gefühl, -e", "Ich habe ein gutes Gefühl bei dieser Sache.", "Надад энэ тал дээр сайн мэдрэмж төрж байна.", "I have a good feeling about this.", "Gefühle"),
    ("Angst", "die", "-¨e", "noun", "айдас", "fear", "die Angst, -¨e", "Er hat keine Angst vor Prüfungen.", "Тэр шалгалтаас айдаггүй.", "He is not afraid of exams.", "Gefühle"),
    ("Freude", "die", "-n", "noun", "баяр баясгалан", "joy, pleasure", "die Freude, -n", "Mit großer Freude habe ich deine Nachricht gelesen.", "Би чиний зурвасыг их баяртайгаар уншлаа.", "With great joy I read your message.", "Gefühle"),
    ("Glück", "das", "-", "noun", "аз жаргал, аз", "happiness, luck", "das Glück, -", "Viel Glück für deine Zukunft!", "Ирээдүйд чинь их аз жаргал хүсье!", "Good luck for your future!", "Gefühle"),
    ("Geduld", "die", "-", "noun", "тэвчээр", "patience", "die Geduld, -", "Man braucht viel Geduld beim Sprachenlernen.", "Хэл сурахад их тэвчээр хэрэгтэй.", "One needs a lot of patience when learning languages.", "Charakter"),
    ("Mut", "der", "-", "noun", "зориг", "courage", "der Mut, -", "Sie hatte den Mut, etwas Neues zu wagen.", "Түүнд шинэ зүйл туршиж үзэх зориг байсан.", "She had the courage to try something new.", "Charakter"),
    ("Humor", "der", "-", "noun", "хошин шогч зан", "humor", "der Humor, -", "Unser Lehrer hat viel Humor.", "Манай багш их хошин зантай.", "Our teacher has a great sense of humor.", "Charakter"),
    ("Interesse", "das", "-n", "noun", "сонирхол", "interest", "das Interesse, -n", "Ich habe großes Interesse an Kunst.", "Би урлагийг ихэд сонирхдог.", "I have great interest in art.", "Freizeit"),
    ("Erfolg", "der", "-e", "noun", "амжилт", "success", "der Erfolg, -e", "Wir wünschen Ihnen viel Erfolg bei der Prüfung.", "Бид таны шалгалтанд өндөр амжилт хүсье.", "We wish you much success in the exam.", "Beruf & Bildung"),
    ("Schwierigkeit", "die", "-en", "noun", "хүндрэл, бэрхшээл", "difficulty", "die Schwierigkeit, -en", "Trotz aller Schwierigkeiten gab er nicht auf.", "Бүх бэрхшээлийг үл харгалзан тэр бууж өгөөгүй.", "Despite all difficulties he did not give up.", "Leben"),
    ("Unterschied", "der", "-e", "noun", "ялгаа", "difference", "der Unterschied, -e", "Was ist der Unterschied zwischen diesen Wörtern?", "Эдгээр үгсийн хоорондын ялгаа юу вэ?", "What is the difference between these words?", "Sprache"),
    ("Rolle", "die", "-n", "noun", "үүрэг, дүр", "role", "die Rolle, -n", "Familie spielt eine wichtige Rolle im Leben.", "Гэр бүл амьдралд чухал үүрэг гүйцэтгэдэг.", "Family plays an important role in life.", "Gesellschaft"),
    ("Plan", "der", "-¨e", "noun", "төлөвлөгөө", "plan", "der Plan, -¨e", "Haben Sie schon Pläne für das Wochenende?", "Та амралтын өдрүүдийн төлөвлөгөөтэй байгаа юу?", "Do you already have plans for the weekend?", "Alltag"),
    ("Zukunft", "die", "-", "noun", "ирээдүй", "future", "die Zukunft, -", "In Zukunft möchte ich in Deutschland arbeiten.", "Ирээдүйд би Германд ажиллах хүсэлтэй байна.", "In the future I want to work in Germany.", "Zeit & Leben"),
    ("Vergangenheit", "die", "-", "noun", "өнгөрсөн үе", "past", "die Vergangenheit, -", "Das gehört der Vergangenheit an.", "Энэ нь өнгөрсөн үед хамаарна.", "That belongs to the past.", "Zeit & Leben")
]

de_a2_b2_verbs = [
    ("erinnern", "erinnert", "erinnerte", "hat erinnert", "an + Akkusativ", "sich erinnern an _____", "санах", "to remember", "Ich erinnere mich gern an diesen Urlaub.", "Би энэ амралтыг дурсах дуртай.", "I like remembering this vacation.", "Gedächtnis"),
    ("freuen", "freut", "freute", "hat gefreut", "auf / über + Akkusativ", "sich freuen auf / über _____", "баярлах", "to be pleased / look forward to", "Wir freuen uns auf das Wochenende.", "Бид амралтын өдрүүдийг тэсэн ядан хүлээж байна.", "We look forward to the weekend.", "Gefühle"),
    ("interessieren", "interessiert", "interessierte", "hat interessiert", "für + Akkusativ", "sich interessieren für _____", "сонирхох", "to be interested in", "Er interessiert sich für deutsche Kultur.", "Тэр германы соёлыг сонирхож байна.", "He is interested in German culture.", "Interessen"),
    ("kümmern", "kümmert", "kümmerte", "hat gekümmert", "um + Akkusativ", "sich kümmern um _____", "санаа тавих, анхаарах", "to take care of", "Sie kümmert sich um die Haustiere.", "Тэр гэрийн тэжээвэр амьтдаа асардаг.", "She takes care of the pets.", "Alltag"),
    ("beschweren", "beschwert", "beschwerte", "hat beschwert", "über + Akkusativ", "sich beschweren über _____", "гомдоллох", "to complain about", "Der Gast beschwerte sich über den Lärm.", "Зочин дуу чимээний талаар гомдоллов.", "The guest complained about the noise.", "Kommunikation"),
    ("ärgern", "ärgert", "ärgerte", "hat geärgert", "über + Akkusativ", "sich ärgern über _____", "уурлах, бухимдах", "to get annoyed about", "Ärgere dich nicht über das schlechte Wetter.", "Цаг агаар муудсанд бүү бухимд.", "Do not get annoyed about bad weather.", "Gefühle"),
    ("entschuldigen", "entschuldigt", "entschuldigte", "hat entschuldigt", "für + Akkusativ", "sich entschuldigen für _____", "уучлалт гуйх", "to apologize for", "Er entschuldigte sich für seine Verspätung.", "Тэр хоцорсондоо уучлалт гуйв.", "He apologized for his delay.", "Kommunikation"),
    ("unterhalten", "unterhält", "unterhielt", "hat unterhalten", "über + Akkusativ", "sich unterhalt__ über _____ [Akk]", "ярилцах", "to converse / chat about", "Wir haben uns lange über Filme unterhalten.", "Бид киноны талаар удаан ярилцсан.", "We chatted for a long time about movies.", "Kommunikation")
]

# ==========================================
# GERMAN B2 BATCH 2
# ==========================================
de_b2_b2_nouns = [
    ("Perspektive", "die", "-n", "noun", "хэтийн төлөв, харах өнцөг", "perspective, outlook", "die Perspektive, -n", "Diese Ausbildung eröffnet exzellente berufliche Perspektiven.", "Энэ сургалт нь мэргэжлийн өндөр хэтийн төлөвийг нээж өгдөг.", "This training opens up excellent career perspectives.", "Zukunft"),
    ("Kriterium", "das", "-ien", "noun", "шалгуур үзүүлэлт", "criterion", "das Kriterium, -ien", "Qualität ist das wichtigste Kriterium bei der Auswahl.", "Чанараар сонголт хийх нь хамгийн чухал шалгуур юм.", "Quality is the most important criterion in selection.", "Wissenschaft"),
    ("Phänomen", "das", "-e", "noun", "үзэгдэл", "phenomenon", "das Phänomen, -e", "Dieses Phänomen lässt sich naturwissenschaftlich erklären.", "Энэ үзэгдлийг байгалийн ухаанаар тайлбарлаж болно.", "This phenomenon can be explained scientifically.", "Wissenschaft"),
    ("Hypothese", "die", "-n", "noun", "таамаглал", "hypothesis", "die Hypothese, -n", "Die Forscher überprüfen die Hypothese durch Experimente.", "Судлаачид туршилтаар таамаглалаа шалгаж байна.", "Researchers test the hypothesis through experiments.", "Wissenschaft"),
    ("Dimension", "die", "-en", "noun", "хэмжээс, цар хүрээ", "dimension", "die Dimension, -en", "Die Krise hat eine internationale Dimension erreicht.", "Хямрал олон улсын цар хүрээнд хүрсэн байна.", "The crisis has reached an international dimension.", "Politik"),
    ("Privileg", "das", "-ien", "noun", "онцгой эрх, давуу эрх", "privilege", "das Privileg, -ien", "Bildung sollte kein Privileg Weniger sein.", "Боловсрол цөөнх хүмүүсийн давуу эрх байх ёсгүй.", "Education should not be a privilege of the few.", "Gesellschaft"),
    ("Solidarität", "die", "-", "noun", "эв санааны нэгдэл", "solidarity", "die Solidarität, -", "Internationale Solidarität rettet Menschenleben.", "Олон улсын эв санааны нэгдэл хүний амийг авардаг.", "International solidarity saves lives.", "Gesellschaft"),
    ("Integrität", "die", "-", "noun", "шударга шулуун зан, бүрэн бүтэн байдал", "integrity", "die Integrität, -", "Akademische Integrität ist unantastbar.", "Эрдмийн шударга зарчим нь халдашгүй юм.", "Academic integrity is inviolable.", "Ethik"),
    ("Legitimität", "die", "-", "noun", "хууль ёсны байдал", "legitimacy", "die Legitimität, -", "Die Legitimität der Regierung beruht auf freien Wahlen.", "Засгийн газрын хууль ёсны байдал чөлөөт сонгуулиас үүдэлтэй.", "The legitimacy of the government is based on free elections.", "Recht"),
    ("Konsequenz", "die", "-en", "noun", "үр дагавар", "consequence", "die Konsequenz, -en", "Jede Handlung zieht unweigerlich Konsequenzen nach sich.", "Үйлдэл бүр зайлшгүй үр дагавар дагуулдаг.", "Every action inevitably entails consequences.", "Philosophie")
]

de_b2_b2_verbs = [
    ("hervorgehen", "geht hervor", "ging hervor", "ist hervorgegangen", "aus + Dativ", "hervorgehen aus _____ [Dat]", "үүдэх, илэрхий болох", "to emerge / result from", "Aus dem Bericht geht hervor, dass Reformen nötig sind.", "Тайлангаас шинэчлэл шаардлагатай байгаа нь тодорхой харагдаж байна.", "The report shows that reforms are necessary.", "Wissenschaft"),
    ("berücksichtigen", "berücksichtigt", "berücksichtigte", "hat berücksichtigt", "+ Akkusativ", "berücksichtigen + _____", "тооцож үзэх, харгалзах", "to take into consideration", "Wir müssen die Wünsche aller Beteiligten berücksichtigen.", "Бид бүх оролцогч талуудын хүсэлтийг харгалзан үзэх ёстой.", "We must take the wishes of all participants into account.", "Organisation"),
    ("beeinträchtigen", "beeinträchtigt", "beeinträchtigte", "hat beeinträchtigt", "+ Akkusativ", "beeinträchtigen + _____", "сөргөөр нөлөөлөх", "to impair, affect negatively", "Lärm beeinträchtigt die Konzentrationsfähigkeit.", "Чимээ шуугиан төвлөрөх чадварт сөргөөр нөлөөлдөг.", "Noise impairs the ability to concentrate.", "Gesundheit"),
    ("vernachlässigen", "vernachlässigt", "vernachlässigte", "hat vernachlässigt", "+ Akkusativ", "vernachlässigen + _____", "орхигдуулах, үл тоомсорлох", "to neglect", "Man darf seine Gesundheit niemals vernachlässigen.", "Эрүүл мэндээ хэзээ ч орхигдуулж болохгүй.", "One must never neglect one's health.", "Leben"),
    ("nachweisen", "weist nach", "wies nach", "hat nachgewiesen", "+ Akkusativ", "nachweis__ [V] (Präsens: er/sie/es ?)", "нотолж харуулах", "to prove, verify", "Die Studie konnte den Zusammenhang eindeutig nachweisen.", "Энэхүү судалгаа хамаарлыг тодорхой нотолж харуулсан.", "The study clearly verified the connection.", "Wissenschaft")
]

# ==========================================
# ENGLISH BATCH 2
# ==========================================
en_a1_b2_additions = [
    ("feel", "verb", "feel | felt | felt", "мэдрэх", "fühlen", "+ adjective", "feel _____ [adj]", "I feel great today.", "Би өнөөдөр маш сайн мэдэрч байна.", "Ich fühle mich heute großartig.", "Health"),
    ("look", "verb", "look | looked | looked", "харах, үзэгдэх", "schauen, aussehen", "look at", "look _____ [prep]", "Look at the board, please.", "Самбар луу харна уу.", "Schau bitte an die Tafel.", "Classroom"),
    ("ask", "verb", "ask | asked | asked", "асуух, гуйх", "fragen, bitten", "ask for", "ask _____ [prep]", "Feel free to ask a question.", "Чөлөөтэй асуулт асууна уу.", "Fühl dich frei, eine Frage zu stellen.", "Communication"),
    ("answer", "verb", "answer | answered | answered", "хариулах", "antworten", "+ noun", "answer _____ [noun]", "Can you answer the phone?", "Та утсаа авч чадах уу?", "Kannst du ans Telefon gehen?", "Daily Life"),
    ("call", "verb", "call | called | called", "залгах, дуудах", "anrufen, rufen", "+ noun", "call _____ [person]", "I will call you tomorrow morning.", "Би маргааш өглөө чам руу залгана.", "Ich rufe dich morgen früh an.", "Communication"),
    ("try", "verb", "try | tried | tried", "хичээх, оролдох", "versuchen, probieren", "+ to / noun", "try _____ [action]", "Try to speak clearly.", "Тод ярихыг хичээгээрэй.", "Versuche, deutlich zu sprechen.", "Daily Life"),
    ("need", "verb", "need | needed | needed", "хэрэгтэй байх", "brauchen", "+ noun", "need _____ [noun]", "I need some fresh water.", "Надад цэвэр ус хэрэгтэй байна.", "Ich brauche etwas frisches Wasser.", "Daily Life"),
    ("wait", "verb", "wait | waited | waited", "хүлээх", "warten", "wait for", "wait _____ [prep]", "Please wait for me here.", "Намайг энд хүлээнэ үү.", "Bitte warte hier auf mich.", "Daily Life"),
    ("move", "verb", "move | moved | moved", "хөдлөх, нүүх", "bewegen, umziehen", "move to", "move _____ [prep]", "They decided to move to a new apartment.", "Тэд шинэ байр луу нүүхээр шийдсэн.", "Sie beschlossen, in eine neue Wohnung umzuziehen.", "Housing"),
    ("change", "verb", "change | changed | changed", "өөрчлөх, солих", "ändern, wechseln", "+ noun", "change _____ [noun]", "Times change quickly.", "Цаг үе хурдан өөрчлөгддөг.", "Die Zeiten ändern sich schnell.", "General")
]

en_a2_b2_additions = [
    ("refuse", "verb", "refuse | refused | refused", "татгалзах", "ablehnen, sich weigern", "refuse to", "refuse _____ [verb]", "He refused to answer personal questions.", "Тэр хувийн асуултуудад хариулахаас татгалзсан.", "Er weigerte sich, persönliche Fragen zu beantworten.", "Boundaries"),
    ("remind", "verb", "remind | reminded | reminded", "сануулах", "erinnern an", "remind of", "remind _____ [prep]", "Please remind me about the meeting.", "Хурлын талаар надад сануулаарай.", "Bitte erinnere mich an das Treffen.", "Productivity"),
    ("borrow", "verb", "borrow | borrowed | borrowed", "зээлж авах", "borgen, leihen", "borrow from", "borrow _____ [prep]", "May I borrow your charger?", "Цэнэглэгчийг чинь түр зээлж болох уу?", "Darf ich dein Ladegerät leihen?", "Tech"),
    ("lend", "verb", "lend | lent | lent", "зээлдүүлэх", "leihen, verleihen", "lend to", "lend _____ [prep]", "He agreed to lend his laptop to me.", "Тэр зөөврийн компьютерээ надад зээлэхээр зөвшөөрсөн.", "Er erklärte sich bereit, mir seinen Laptop zu leihen.", "Tech"),
    ("organize", "verb", "organize | organized | organized", "зохион байгуулах", "organisieren", "+ noun", "organize _____ [event]", "We organize a team workshop.", "Бид багийн сургалт зохион байгуулж байна.", "Wir organisieren einen Team-Workshop.", "Work"),
    ("protect", "verb", "protect | protected | protected", "хамгаалах", "schützen", "protect from", "protect _____ [prep]", "Sunglasses protect your eyes from the sun.", "Нарны шил таны нүдийг нарнаас хамгаална.", "Sonnenbrillen schützen die Augen vor der Sonne.", "Health")
]

en_b1_b2_additions = [
    ("insist on", "verb", "insist | insisted | insisted", "шаардах, зүтгэх", "bestehen auf", "insist on", "insist _____ [prep]", "She insisted on paying for lunch.", "Тэр өдрийн хоолны тооцоог хийнэ гэж зүтгэсэн.", "Sie bestand darauf, das Mittagessen zu bezahlen.", "Etiquette"),
    ("object to", "verb", "object | objected | objected", "эсэргүүцэх", "Einspruch erheben gegen", "object to", "object _____ [prep]", "Nobody objected to the new proposal.", "Шинэ саналд хэн ч эсэргүүцэл илэрхийлээгүй.", "Niemand erhob Einspruch gegen den neuen Vorschlag.", "Meetings"),
    ("participate in", "verb", "participate | participated | participated", "оролцох", "teilnehmen an", "participate in", "participate _____ [prep]", "Hundreds of students participate in the contest.", "Олон зуун оюутан уралдаанд оролцож байна.", "Hunderte Studenten nehmen am Wettbewerb teil.", "Education"),
    ("recover from", "verb", "recover | recovered | recovered", "эдгэх, сэргэх", "sich erholen von", "recover from", "recover _____ [prep]", "He quickly recovered from his illness.", "Тэр өвчнөөсөө хурдан эдгэрсэн.", "Er erholte sich schnell von seiner Krankheit.", "Health"),
    ("succeed in", "verb", "succeed | succeeded | succeeded", "амжилт олох", "Erfolg haben bei", "succeed in", "succeed _____ [prep]", "With practice you will succeed in your goals.", "Дадлага хийснээр та зорилгодоо хүрч чадна.", "Mit Übung wirst du deine Ziele erreichen.", "Success")
]

en_b2_b2_additions = [
    ("allocate to", "verb", "allocate | allocated | allocated", "хуваарилах", "zuweisen, zuteilen", "allocate to", "allocate _____ [prep]", "Budget funds were allocated to renewable energy.", "Төсвийн хөрөнгийг сэргээгдэх эрчим хүчинд хуваарилсан.", "Budgetmittel wurden den erneuerbaren Energien zugewiesen.", "Economy"),
    ("attribute to", "verb", "attribute | attributed | attributed", "холбон үзэх, хамаатуулах", "zuschreiben", "attribute to", "attribute _____ [prep]", "The scientist attributed the anomaly to sensor drift.", "Эрдэмтэн гажилтыг мэдрэгчийн зөрүүтэй холбон тайлбарлав.", "Der Wissenschaftler führte die Anomalie auf Sensordrift zurück.", "Science"),
    ("comply with", "verb", "comply | complied | complied", "дагаж мөрдөх", "einhalten, befolgen", "comply with", "comply _____ [prep]", "All companies must comply with privacy regulations.", "Бүх компаниуд нууцлалын дүрэм журмыг дагаж мөрдөх ёстой.", "Alle Unternehmen müssen Datenschutzvorschriften einhalten.", "Compliance"),
    ("subscribe to", "verb", "subscribe | subscribed | subscribed", "санал нийлэх, захиалах", "abonnieren, beipflichten", "subscribe to", "subscribe _____ [prep]", "I do not subscribe to that cynical theory.", "Би тэрхүү сөрөг онолтой санал нийлэхгүй байна.", "Ich pflichte dieser zynischen Theorie nicht bei.", "Philosophy")
]

def run():
    # 1. DE A1
    de_a1 = load_json('data/de/vocab_a1.json')
    seen_a1 = set(x['word'].strip().lower() for x in de_a1)
    idx = len(de_a1) + 1
    for w, art, pl, pos, mn_t, en_t, disp, ex_de, ex_mn, ex_en, topic in de_a1_b2_nouns:
        if w.strip().lower() not in seen_a1:
            de_a1.append(clean_entry({
                "id": f"de_a1_{str(idx).zfill(4)}",
                "word": w,
                "article": art,
                "plural": pl,
                "display": disp,
                "pos": pos,
                "lang": "de",
                "level": "A1",
                "forms": None,
                "rektion": None,
                "prompt_front": f"_____ {w}, -? [N]",
                "revealed_back": f"{art} {w}, {pl}",
                "mn": mn_t,
                "en": en_t,
                "de": disp,
                "example_de": ex_de,
                "example_mn": ex_mn,
                "example_en": ex_en,
                "topic": topic
            }))
            seen_a1.add(w.strip().lower())
            idx += 1

    for w, p3, pr, p2, rek, prompt, mn_t, en_t, ex_de, ex_mn, ex_en, topic in de_a1_b2_verbs:
        if w.strip().lower() not in seen_a1:
            forms_str = f"{w} | {p3} | {pr} | {p2}"
            rek_note = f" ({rek})" if rek else ""
            de_a1.append(clean_entry({
                "id": f"de_a1_{str(idx).zfill(4)}",
                "word": w,
                "article": None,
                "plural": None,
                "display": w,
                "pos": "verb",
                "lang": "de",
                "level": "A1",
                "forms": forms_str,
                "rektion": rek,
                "prompt_front": prompt,
                "revealed_back": f"{forms_str}{rek_note}",
                "mn": mn_t,
                "en": en_t,
                "de": w,
                "example_de": ex_de,
                "example_mn": ex_mn,
                "example_en": ex_en,
                "topic": topic
            }))
            seen_a1.add(w.strip().lower())
            idx += 1
    save_json('data/de/vocab_a1.json', de_a1)

    # 2. DE A2
    de_a2 = load_json('data/de/vocab_a2.json')
    seen_a2 = set(x['word'].strip().lower() for x in de_a2)
    idx = len(de_a2) + 1
    for w, art, pl, pos, mn_t, en_t, disp, ex_de, ex_mn, ex_en, topic in de_a2_b2_nouns:
        if w.strip().lower() not in seen_a2:
            de_a2.append(clean_entry({
                "id": f"de_a2_{str(idx).zfill(4)}",
                "word": w,
                "article": art,
                "plural": pl,
                "display": disp,
                "pos": pos,
                "lang": "de",
                "level": "A2",
                "forms": None,
                "rektion": None,
                "prompt_front": f"_____ {w}, -? [N]",
                "revealed_back": f"{art} {w}, {pl}",
                "mn": mn_t,
                "en": en_t,
                "de": disp,
                "example_de": ex_de,
                "example_mn": ex_mn,
                "example_en": ex_en,
                "topic": topic
            }))
            seen_a2.add(w.strip().lower())
            idx += 1

    for w, p3, pr, p2, rek, prompt, mn_t, en_t, ex_de, ex_mn, ex_en, topic in de_a2_b2_verbs:
        if w.strip().lower() not in seen_a2:
            forms_str = f"{w} | {p3} | {pr} | {p2}"
            rek_note = f" ({rek})" if rek else ""
            de_a2.append(clean_entry({
                "id": f"de_a2_{str(idx).zfill(4)}",
                "word": w,
                "article": None,
                "plural": None,
                "display": w,
                "pos": "verb",
                "lang": "de",
                "level": "A2",
                "forms": forms_str,
                "rektion": rek,
                "prompt_front": prompt,
                "revealed_back": f"{forms_str}{rek_note}",
                "mn": mn_t,
                "en": en_t,
                "de": w,
                "example_de": ex_de,
                "example_mn": ex_mn,
                "example_en": ex_en,
                "topic": topic
            }))
            seen_a2.add(w.strip().lower())
            idx += 1
    save_json('data/de/vocab_a2.json', de_a2)

    # 3. DE B2
    de_b2 = load_json('data/de/vocab_b2.json')
    seen_b2 = set(x['word'].strip().lower() for x in de_b2)
    idx = len(de_b2) + 1
    for w, art, pl, pos, mn_t, en_t, disp, ex_de, ex_mn, ex_en, topic in de_b2_b2_nouns:
        if w.strip().lower() not in seen_b2:
            de_b2.append(clean_entry({
                "id": f"de_b2_{str(idx).zfill(4)}",
                "word": w,
                "article": art,
                "plural": pl,
                "display": disp,
                "pos": pos,
                "lang": "de",
                "level": "B2",
                "forms": None,
                "rektion": None,
                "prompt_front": f"_____ {w}, -? [N]",
                "revealed_back": f"{art} {w}, {pl}",
                "mn": mn_t,
                "en": en_t,
                "de": disp,
                "example_de": ex_de,
                "example_mn": ex_mn,
                "example_en": ex_en,
                "topic": topic
            }))
            seen_b2.add(w.strip().lower())
            idx += 1

    for w, p3, pr, p2, rek, prompt, mn_t, en_t, ex_de, ex_mn, ex_en, topic in de_b2_b2_verbs:
        if w.strip().lower() not in seen_b2:
            forms_str = f"{w} | {p3} | {pr} | {p2}"
            rek_note = f" ({rek})" if rek else ""
            de_b2.append(clean_entry({
                "id": f"de_b2_{str(idx).zfill(4)}",
                "word": w,
                "article": None,
                "plural": None,
                "display": w,
                "pos": "verb",
                "lang": "de",
                "level": "B2",
                "forms": forms_str,
                "rektion": rek,
                "prompt_front": prompt,
                "revealed_back": f"{forms_str}{rek_note}",
                "mn": mn_t,
                "en": en_t,
                "de": w,
                "example_de": ex_de,
                "example_mn": ex_mn,
                "example_en": ex_en,
                "topic": topic
            }))
            seen_b2.add(w.strip().lower())
            idx += 1
    save_json('data/de/vocab_b2.json', de_b2)

    # 4. EN A1
    en_a1 = load_json('data/en/vocab_a1.json')
    seen_en_a1 = set(x['word'].strip().lower() for x in en_a1)
    idx = len(en_a1) + 1
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_a1_b2_additions:
        if w.strip().lower() not in seen_en_a1:
            en_a1.append(clean_entry({
                "id": f"en_a1_{str(idx).zfill(4)}",
                "word": w,
                "pos": pos,
                "lang": "en",
                "level": "A1",
                "forms": forms,
                "rektion": rek,
                "prompt_front": prompt,
                "revealed_back": forms,
                "mn": mn_t,
                "de": de_t,
                "en": w,
                "example_en": ex_en,
                "example_mn": ex_mn,
                "example_de": ex_de,
                "topic": topic
            }))
            seen_en_a1.add(w.strip().lower())
            idx += 1
    save_json('data/en/vocab_a1.json', en_a1)

    # 5. EN A2
    en_a2 = load_json('data/en/vocab_a2.json')
    seen_en_a2 = set(x['word'].strip().lower() for x in en_a2)
    idx = len(en_a2) + 1
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_a2_b2_additions:
        if w.strip().lower() not in seen_en_a2:
            en_a2.append(clean_entry({
                "id": f"en_a2_{str(idx).zfill(4)}",
                "word": w,
                "pos": pos,
                "lang": "en",
                "level": "A2",
                "forms": forms,
                "rektion": rek,
                "prompt_front": prompt,
                "revealed_back": forms,
                "mn": mn_t,
                "de": de_t,
                "en": w,
                "example_en": ex_en,
                "example_mn": ex_mn,
                "example_de": ex_de,
                "topic": topic
            }))
            seen_en_a2.add(w.strip().lower())
            idx += 1
    save_json('data/en/vocab_a2.json', en_a2)

    # 6. EN B1
    en_b1 = load_json('data/en/vocab_b1.json')
    seen_en_b1 = set(x['word'].strip().lower() for x in en_b1)
    idx = len(en_b1) + 1
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_b1_b2_additions:
        if w.strip().lower() not in seen_en_b1:
            en_b1.append(clean_entry({
                "id": f"en_b1_{str(idx).zfill(4)}",
                "word": w,
                "pos": pos,
                "lang": "en",
                "level": "B1",
                "forms": forms,
                "rektion": rek,
                "prompt_front": prompt,
                "revealed_back": f"{w} ({rek})",
                "mn": mn_t,
                "de": de_t,
                "en": w,
                "example_en": ex_en,
                "example_mn": ex_mn,
                "example_de": ex_de,
                "topic": topic
            }))
            seen_en_b1.add(w.strip().lower())
            idx += 1
    save_json('data/en/vocab_b1.json', en_b1)

    # 7. EN B2
    en_b2 = load_json('data/en/vocab_b2.json')
    seen_en_b2 = set(x['word'].strip().lower() for x in en_b2)
    idx = len(en_b2) + 1
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_b2_b2_additions:
        if w.strip().lower() not in seen_en_b2:
            en_b2.append(clean_entry({
                "id": f"en_b2_{str(idx).zfill(4)}",
                "word": w,
                "pos": pos,
                "lang": "en",
                "level": "B2",
                "forms": forms,
                "rektion": rek,
                "prompt_front": prompt,
                "revealed_back": f"{w} ({rek})",
                "mn": mn_t,
                "de": de_t,
                "en": w,
                "example_en": ex_en,
                "example_mn": ex_mn,
                "example_de": ex_de,
                "topic": topic
            }))
            seen_en_b2.add(w.strip().lower())
            idx += 1
    save_json('data/en/vocab_b2.json', en_b2)

if __name__ == '__main__':
    run()
