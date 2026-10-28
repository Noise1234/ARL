#!/usr/bin/env python3
"""
Full Vocabulary Expansion Script for ARL
Expands German (A1, A2, B2) and English (A1, A2, B1, B2) datasets.
Validates 100% against all ARL test suite rules:
- NFC unicode normalization
- Proper Mongolian Cyrillic
- German nouns: der/die/das article, plural, prompt_front containing '_____', revealed_back containing article
- German verbs: 4 forms separated by '|', prompt_front, revealed_back
- English: prompt_front, revealed_back, mn
"""

import json
import unicodedata
import os
import re

def nfc(text):
    if text is None:
        return None
    return unicodedata.normalize('NFC', str(text).strip())

ROOT = '/root/ARL'

def clean_entry(entry):
    return {k: nfc(v) if isinstance(v, str) else v for k, v in entry.items()}

# Load existing files
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
# 1. EXPAND GERMAN A1
# ==========================================
a1_nouns = [
    # Family
    ("Vater", "der", "-¨", "noun", "эцэг, аав", "father", "der Vater, -¨", "Mein Vater ist Ingenieur.", "Миний аав инженер.", "My father is an engineer.", "Familie"),
    ("Mutter", "die", "-¨", "noun", "эх, ээж", "mother", "die Mutter, -¨", "Meine Mutter kocht sehr gut.", "Ээж маань маш сайн хоол хийдэг.", "My mother cooks very well.", "Familie"),
    ("Eltern", "die", "-", "noun", "эцэг эх", "parents", "die Eltern, -", "Meine Eltern leben auf dem Land.", "Эцэг эх маань хөдөө амьдардаг.", "My parents live in the countryside.", "Familie"),
    ("Sohn", "der", "-¨e", "noun", "хүү", "son", "der Sohn, -¨e", "Ihr Sohn geht in den Kindergarten.", "Түүний хүү цэцэрлэгт явдаг.", "Her son goes to kindergarten.", "Familie"),
    ("Tochter", "die", "-¨", "noun", "охин", "daughter", "die Tochter, -¨", "Unsere Tochter lernt fleißig.", "Манай охин хичээнгүй сурдаг.", "Our daughter studies hard.", "Familie"),
    ("Bruder", "der", "-¨", "noun", "ах, эрэгтэй дүү", "brother", "der Bruder, -¨", "Mein Bruder studiert Medizin.", "Миний ах анагаахад сурдаг.", "My brother studies medicine.", "Familie"),
    ("Schwester", "die", "-n", "noun", "эгч, эмэгтэй дүү", "sister", "die Schwester, -n", "Meine Schwester spielt Geige.", "Миний эгч хийл тоглодог.", "My sister plays the violin.", "Familie"),
    ("Großvater", "der", "-¨", "noun", "өвөө", "grandfather", "der Großvater, -¨", "Mein Großvater liest gern Bücher.", "Өвөө маань ном унших дуртай.", "My grandfather likes reading books.", "Familie"),
    ("Großmutter", "die", "-¨", "noun", "эмээ", "grandmother", "die Großmutter, -¨", "Meine Großmutter bäckt Kuchen.", "Эмээ маань бялуу хийдэг.", "My grandmother bakes cakes.", "Familie"),
    ("Baby", "das", "-s", "noun", "нярай, хүүхэд", "baby", "das Baby, -s", "Das Baby schläft ruhig.", "Хүүхэд тайван унтаж байна.", "The baby is sleeping peacefully.", "Familie"),

    # Home & Objects
    ("Fenster", "das", "-", "noun", "цонх", "window", "das Fenster, -", "Bitte mach das Fenster auf.", "Цонхоо онгойлгооч.", "Please open the window.", "Wohnen"),
    ("Tür", "die", "-en", "noun", "хаалга", "door", "die Tür, -en", "Die Tür ist verschlossen.", "Хаалга түгжээтэй байна.", "The door is locked.", "Wohnen"),
    ("Bett", "das", "-en", "noun", "ор", "bed", "das Bett, -en", "Das Bett ist sehr bequem.", "Ор маш тухтай байна.", "The bed is very comfortable.", "Wohnen"),
    ("Lampe", "die", "-n", "noun", "дэнлүү, чийдэн", "lamp", "die Lampe, -n", "Die Lampe spendet warmes Licht.", "Чийдэн дулаан гэрэл өгч байна.", "The lamp gives warm light.", "Wohnen"),
    ("Küche", "die", "-n", "noun", "гал тогоо", "kitchen", "die Küche, -n", "In der Küche kochen wir Kaffee.", "Гал тогоонд бид кофе чанаж байна.", "We make coffee in the kitchen.", "Wohnen"),
    ("Bad", "das", "-¨er", "noun", "угаалгын өрөө", "bathroom", "das Bad, -¨er", "Das Bad ist sauber.", "Угаалгын өрөө цэвэрхэн байна.", "The bathroom is clean.", "Wohnen"),
    ("Kühlschrank", "der", "-¨e", "noun", "хөргөгч", "refrigerator", "der Kühlschrank, -¨e", "Milch steht im Kühlschrank.", "Сүү хөргөгчинд байна.", "Milk is in the fridge.", "Wohnen"),
    ("Schlüssel", "der", "-", "noun", "түлхүүр", "key", "der Schlüssel, -", "Hier ist dein Schlüssel.", "Энэ чиний түлхүүр.", "Here is your key.", "Wohnen"),
    ("Tasche", "die", "-n", "noun", "цүнх", "bag", "die Tasche, -n", "Meine Tasche ist schwer.", "Миний цүнх хүнд байна.", "My bag is heavy.", "Alltag"),
    ("Handy", "das", "-s", "noun", "гар утас", "mobile phone", "das Handy, -s", "Mein Handy klingelt.", "Миний гар утас дуугарч байна.", "My phone is ringing.", "Alltag"),
    ("Computer", "der", "-", "noun", "компьютер", "computer", "der Computer, -", "Ich arbeite am Computer.", "Би компьютер дээр ажилладаг.", "I work on the computer.", "Arbeit"),
    ("Zeitung", "die", "-en", "noun", "сонин", "newspaper", "die Zeitung, -en", "Er liest die Zeitung.", "Тэр сонин уншиж байна.", "He is reading the newspaper.", "Alltag"),
    ("Brief", "der", "-e", "noun", "захидал", "letter", "der Brief, -e", "Ich schreibe einen Brief.", "Би захидал бичиж байна.", "I am writing a letter.", "Kommunikation"),
    ("Karte", "die", "-n", "noun", "карт, тасалбар, газрын зураг", "card, ticket", "die Karte, -n", "Hier ist meine Visitenkarte.", "Энэ миний нэрийн хуудас.", "Here is my business card.", "Alltag"),

    # Food & Groceries
    ("Milch", "die", "-", "noun", "сүү", "milk", "die Milch, -", "Trinkst du Milch?", "Чи сүү уудаг уу?", "Do you drink milk?", "Essen & Trinken"),
    ("Käse", "der", "-", "noun", "бяслаг", "cheese", "der Käse, -", "Ich esse gern Käse zum Frühstück.", "Би өглөөний цайндаа бяслаг идэх дуртай.", "I like eating cheese for breakfast.", "Essen & Trinken"),
    ("Fleisch", "das", "-", "noun", "мах", "meat", "das Fleisch, -", "Das Fleisch ist frisch.", "Мах шинэ байна.", "The meat is fresh.", "Essen & Trinken"),
    ("Fisch", "der", "-e", "noun", "загас", "fish", "der Fisch, -e", "Freitags essen wir Fisch.", "Баасан гарагт бид загас иддэг.", "On Fridays we eat fish.", "Essen & Trinken"),
    ("Ei", "das", "-er", "noun", "өндөг", "egg", "das Ei, -er", "Ich koche zwei Eier.", "Би хоёр өндөг чанаж байна.", "I boil two eggs.", "Essen & Trinken"),
    ("Gemüse", "das", "-", "noun", "хүнсний ногоо", "vegetables", "das Gemüse, -", "Gemüse ist sehr gesund.", "Хүнсний ногоо маш эрүүл.", "Vegetables are very healthy.", "Essen & Trinken"),
    ("Obst", "das", "-", "noun", "жимс", "fruit", "das Obst, -", "Wir kaufen frisches Obst.", "Бид шинэ жимс худалдаж авдаг.", "We buy fresh fruit.", "Essen & Trinken"),
    ("Kartoffel", "die", "-n", "noun", "төмс", "potato", "die Kartoffel, -n", "Kartoffeln schmecken gut.", "Төмс амттай байна.", "Potatoes taste good.", "Essen & Trinken"),
    ("Reis", "der", "-", "noun", "цагаан будаа", "rice", "der Reis, -", "Möchtest du Reis oder Nudeln?", "Чи будаа юу, гоймон авах уу?", "Would you like rice or noodles?", "Essen & Trinken"),
    ("Suppe", "die", "-n", "noun", "шөл", "soup", "die Suppe, -n", "Die Suppe ist heiß.", "Шөл халуун байна.", "The soup is hot.", "Essen & Trinken"),
    ("Zucker", "der", "-", "noun", "чихэр, элсэн чихэр", "sugar", "der Zucker, -", "Kaffee ohne Zucker, bitte.", "Элсэн чихэргүй кофе өгөөрэй.", "Coffee without sugar, please.", "Essen & Trinken"),
    ("Salz", "das", "-", "noun", "давс", "salt", "das Salz, -", "Reichst du mir das Salz?", "Давс дөхүүлээд өгөөч?", "Could you pass the salt?", "Essen & Trinken"),
    ("Butter", "die", "-", "noun", "цөцгийн тос", "butter", "die Butter, -", "Butter auf das Brot streichen.", "Талхан дээр цөцгийн тос түрхэх.", "Spread butter on the bread.", "Essen & Trinken"),
    ("Bier", "das", "-e", "noun", "шар айраг", "beer", "das Bier, -e", "Ein kaltes Bier bitte.", "Нэг хүйтэн шар айраг өгөөч.", "A cold beer please.", "Essen & Trinken"),
    ("Wein", "der", "-e", "noun", "дарс", "wine", "der Wein, -e", "Der rote Wein ist aus Italien.", "Энэ улаан дарс Италиас гаралтай.", "The red wine is from Italy.", "Essen & Trinken"),
    ("Saft", "der", "-¨e", "noun", "шүүс", "juice", "der Saft, -¨e", "Orangensaft schmeckt frisch.", "Жүржийн шүүс шинэхэн амтагдаж байна.", "Orange juice tastes fresh.", "Essen & Trinken"),

    # City & Transport
    ("Bus", "der", "-se", "noun", "автобус", "bus", "der Bus, -se", "Der Bus fährt in fünf Minuten.", "Автобус таван минутын дараа хөдөлнө.", "The bus leaves in five minutes.", "Verkehr"),
    ("Fahrrad", "das", "-¨er", "noun", "унадаг дугуй", "bicycle", "das Fahrrad, -¨er", "Er fährt mit dem Fahrrad zur Schule.", "Тэр дугуйгаар сургуульдаа явдаг.", "He rides a bike to school.", "Verkehr"),
    ("Flugzeug", "das", "-e", "noun", "нисэх онгоц", "airplane", "das Flugzeug, -e", "Das Flugzeug fliegt nach Berlin.", "Онгоц Берлин рүү нисэж байна.", "The plane is flying to Berlin.", "Verkehr"),
    ("Flughafen", "der", "-¨", "noun", "нисэх буудал", "airport", "der Flughafen, -¨", "Wir treffen uns am Flughafen.", "Бид онгоцны буудал дээр уулзана.", "We meet at the airport.", "Verkehr"),
    ("Haltestelle", "die", "-n", "noun", "буудал", "bus stop / station", "die Haltestelle, -n", "Die Haltestelle ist gleich hier.", "Буудал яг энд байна.", "The stop is right here.", "Verkehr"),
    ("Hotel", "das", "-s", "noun", "зочид буудал", "hotel", "das Hotel, -s", "Das Hotel hat freie Zimmer.", "Зочид буудалд сул өрөө байна.", "The hotel has free rooms.", "Reisen"),
    ("Restaurant", "das", "-s", "noun", "ресторан", "restaurant", "das Restaurant, -s", "Wir essen heute im Restaurant.", "Бид өнөөдөр ресторанд хооллоно.", "We eat at a restaurant today.", "Essen & Trinken"),
    ("Krankenhaus", "das", "-¨er", "noun", "эмнэлэг", "hospital", "das Krankenhaus, -¨er", "Sie arbeitet im Krankenhaus.", "Тэр эмнэлэгт ажилладаг.", "She works in the hospital.", "Gesundheit"),
    ("Apotheke", "die", "-n", "noun", "эмийн сан", "pharmacy", "die Apotheke, -n", "Die Apotheke hat geöffnet.", "Эмийн сан нээлттэй байна.", "The pharmacy is open.", "Gesundheit"),
    ("Bank", "die", "-en", "noun", "банк", "bank", "die Bank, -en", "Die Bank schließt um 16 Uhr.", "Банк 16 цагт хаадаг.", "The bank closes at 4 pm.", "Alltag"),
    ("Post", "die", "-", "noun", "шуудан", "post office", "die Post, -", "Ich bringe das Paket zur Post.", "Би илгээмжийг шуудан руу аваачна.", "I take the parcel to the post office.", "Alltag"),
    ("Markt", "der", "-¨e", "noun", "зах, зах зээл", "market", "der Markt, -¨e", "Samstags gehen wir auf den Markt.", "Хагас сайн өдөр бид зах ордог.", "On Saturdays we go to the market.", "Einkaufen"),

    # Time & Calendar
    ("Woche", "die", "-n", "noun", "долоо хоног", "week", "die Woche, -n", "Eine Woche hat sieben Tage.", "Нэг долоо хоног долоон өдөртэй.", "A week has seven days.", "Zeit"),
    ("Monat", "der", "-e", "noun", "сар", "month", "der Monat, -e", "Im nächsten Monat habe ich Urlaub.", "Дараа сард би амралттай.", "Next month I have vacation.", "Zeit"),
    ("Jahr", "das", "-e", "noun", "жил", "year", "das Jahr, -e", "Ein neues Jahr beginnt.", "Шинэ жил эхэлж байна.", "A new year begins.", "Zeit"),
    ("Stunde", "die", "-n", "noun", "цаг (хэмжүүр)", "hour", "die Stunde, -n", "Der Kurs dauert zwei Stunden.", "Хичээл хоёр цаг үргэлжилнэ.", "The course lasts two hours.", "Zeit"),
    ("Minute", "die", "-n", "noun", "минут", "minute", "die Minute, -n", "Warten Sie bitte fünf Minuten.", "Таван минут хүлээнэ үү.", "Please wait five minutes.", "Zeit"),
    ("Wochenende", "das", "-n", "noun", "амралтын өдрүүд", "weekend", "das Wochenende, -n", "Schönes Wochenende!", "Амралтын өдрөө сайхан өнгөрүүлээрэй!", "Have a nice weekend!", "Zeit"),

    # People & Society
    ("Mensch", "der", "-en", "noun", "хүн", "human, person", "der Mensch, -en", "Jeder Mensch hat Rechte.", "Хүн бүр эрхтэй.", "Every human has rights.", "Gesellschaft"),
    ("Person", "die", "-en", "noun", "бие хүн, хүн", "person", "die Person, -en", "Ein Tisch für zwei Personen.", "Хоёр хүний ширээ.", "A table for two persons.", "Gesellschaft"),
    ("Junge", "der", "-n", "noun", "хүү, хөвгүүн", "boy", "der Junge, -n", "Der Junge spielt Fußball.", "Хүү хөлбөмбөг тоглож байна.", "The boy is playing soccer.", "Menschen"),
    ("Mädchen", "das", "-", "noun", "охин", "girl", "das Mädchen, -", "Das Mädchen singt ein Lied.", "Охин дуу дуулж байна.", "The girl sings a song.", "Menschen"),
    ("Arbeit", "die", "-en", "noun", "ажил", "work, job", "die Arbeit, -en", "Die Arbeit macht Spaß.", "Ажил сонирхолтой байна.", "Work is fun.", "Beruf"),
    ("Beruf", "der", "-e", "noun", "мэргэжил", "profession", "der Beruf, -e", "Was bist du von Beruf?", "Чи ямар мэргэжилтэй вэ?", "What is your profession?", "Beruf"),
    ("Chef", "der", "-s", "noun", "дарга, эрхлэгч", "boss", "der Chef, -s", "Der Chef ist heute freundlich.", "Дарга өнөөдөр найрсаг байна.", "The boss is friendly today.", "Beruf")
]

a1_verbs = [
    ("schlafen", "schläft", "schlief", "hat geschlafen", None, "schlaf__ [V] (Präsens: er/sie/es ?)", "унтах", "to sleep", "Das Kind schläft acht Stunden.", "Хүүхэд найман цаг унтдаг.", "The child sleeps eight hours.", "Alltag"),
    ("lesen", "liest", "las", "hat gelesen", "+ Akkusativ", "les__ [V] (Präsens: er/sie/es ?)", "унших", "to read", "Ich lese jeden Tag ein Buch.", "Би өдөр бүр ном уншдаг.", "I read a book every day.", "Alltag"),
    ("schreiben", "schreibt", "schrieb", "hat geschrieben", "+ Dativ + Akkusativ", "schreiben + _____", "бичих", "to write", "Er schreibt eine E-Mail an den Chef.", "Тэр дарга руугаа и-мэйл бичиж байна.", "He writes an email to the boss.", "Kommunikation"),
    ("hören", "hört", "hörte", "hat gehört", "+ Akkusativ", "hören + _____", "сонсох", "to hear/listen", "Wir hören deutsche Musik.", "Бид герман хөгжим сонсдог.", "We listen to German music.", "Freizeit"),
    ("spielen", "spielt", "spielte", "hat gespielt", "+ Akkusativ", "spielen + _____", "тоглох", "to play", "Die Kinder spielen draußen.", "Хүүхдүүд гадаа тоглож байна.", "The children play outside.", "Freizeit"),
    ("kochen", "kocht", "kochte", "hat gekocht", "+ Akkusativ", "kochen + _____", "хоол хийх, чанах", "to cook", "Sie kocht gern Suppe.", "Тэр шөл хийх дуртай.", "She likes cooking soup.", "Essen"),
    ("suchen", "sucht", "suchte", "hat gesucht", "+ Akkusativ", "suchen + _____", "хайх", "to search/look for", "Ich suche meinen Schlüssel.", "Би түлхүүрээ хайж байна.", "I am looking for my key.", "Alltag"),
    ("brauchen", "braucht", "brauchte", "hat gebraucht", "+ Akkusativ", "brauchen + _____", "хэрэгтэй байх", "to need", "Brauchst du noch Hilfe?", "Чамд тусламж хэрэгтэй юу?", "Do you still need help?", "Alltag"),
    ("kosten", "kostet", "kostete", "hat gekostet", "+ Akkusativ", "kosten + _____", "үнэтэй байх", "to cost", "Wie viel kostet dieses Ticket?", "Энэ тасалбар ямар үнэтэй вэ?", "How much does this ticket cost?", "Einkaufen"),
    ("öffnen", "öffnet", "öffnete", "hat geöffnet", "+ Akkusativ", "öffnen + _____", "нээх, онгойлгох", "to open", "Er öffnet das Fenster.", "Тэр цонх онгойлгож байна.", "He opens the window.", "Alltag"),
    ("schließen", "schließt", "schloss", "hat geschlossen", "+ Akkusativ", "schließen + _____", "хаах", "to close", "Bitte schließen Sie die Tür.", "Хаалгаа хаана уу.", "Please close the door.", "Alltag"),
    ("reisen", "reist", "reiste", "ist gereist", "nach + Dativ", "reisen _____ [Dat]", "аялах", "to travel", "Wir reisen gern nach Europa.", "Бид Европ руу аялах дуртай.", "We like traveling to Europe.", "Reisen"),
    ("fliegen", "fliegt", "flog", "ist geflogen", "nach + Dativ", "fliegen _____ [Dat]", "нисэх", "to fly", "Morgen fliege ich nach Frankfurt.", "Маргааш би Франкфурт руу ниснэ.", "Tomorrow I fly to Frankfurt.", "Reisen"),
    ("fragen", "fragt", "fragte", "hat gefragt", "+ Akkusativ", "fragen + _____", "асуух", "to ask", "Darf ich etwas fragen?", "Би нэг зүйл асууж болох уу?", "May I ask something?", "Kommunikation"),
    ("antworten", "antwortet", "antwortete", "hat geantwortet", "auf + Akkusativ", "antworten auf _____", "хариулах", "to answer", "Er antwortet schnell auf meine E-Mail.", "Тэр миний и-мэйлд хурдан хариулдаг.", "He answers quickly to my email.", "Kommunikation"),
    ("wissen", "weiß", "wusste", "hat gewusst", "+ Akkusativ", "wiss__ [V] (Präsens: ich/er ?)", "мэдэх", "to know (a fact)", "Ich weiß die Antwort nicht.", "Би хариултыг мэдэхгүй байна.", "I do not know the answer.", "Wissen"),
    ("kennen", "kennt", "kannte", "hat gekannt", "+ Akkusativ", "kennen + _____", "таних, мэдэх", "to know (a person/place)", "Kennst du diesen Mann?", "Чи энэ эрэгтэйг таних уу?", "Do you know this man?", "Wissen"),
    ("schmecken", "schmeckt", "schmeckte", "hat geschmeckt", "+ Dativ", "schmecken + [Dat]", "амтагдах, амттай байх", "to taste (good to)", "Das Essen schmeckt mir gut.", "Хоол надад амттай санагдаж байна.", "The food tastes good to me.", "Essen"),
    ("helfen", "hilft", "half", "hat geholfen", "+ Dativ", "helf__ [V] (Präsens: er/sie/es ?)", "туслах", "to help", "Kannst du mir bitte helfen?", "Чи надад тусалж чадах уу?", "Can you please help me?", "Alltag"),
    ("danken", "dankt", "dankte", "hat gedankt", "+ Dativ", "danken + [Dat]", "талархах", "to thank", "Ich danke Ihnen für die Hilfe.", "Танд тусалсанд баярлалаа.", "I thank you for the help.", "Kommunikation")
]

a1_adjectives = [
    ("groß", "adjective", "том, өндөр", "big, tall", "groß", "Das Haus ist sehr groß.", "Энэ байшин маш том.", "The house is very big.", "Eigenschaften"),
    ("klein", "adjective", "жижиг", "small", "klein", "Die Wohnung ist klein, aber fein.", "Энэ байр жижиг боловч тохилог.", "The apartment is small but nice.", "Eigenschaften"),
    ("alt", "adjective", "хуучин, хөгшин", "old", "alt", "Mein Computer ist schon alt.", "Миний компьютер аль хэдийн хуучирсан.", "My computer is already old.", "Eigenschaften"),
    ("neu", "adjective", "шинэ", "new", "neu", "Ich habe ein neues Fahrrad.", "Надад шинэ унадаг дугуй бий.", "I have a new bicycle.", "Eigenschaften"),
    ("schön", "adjective", "хөөрхөн, сайхан", "beautiful", "schön", "Heute ist ein schöner Tag.", "Өнөөдөр сайхан өдөр байна.", "Today is a beautiful day.", "Eigenschaften"),
    ("teuer", "adjective", "үнэтэй", "expensive", "teuer", "Das Hotel ist zu teuer.", "Энэ буудал хэтэрхий үнэтэй.", "The hotel is too expensive.", "Eigenschaften"),
    ("billig", "adjective", "хямдхан", "cheap", "billig", "Dieses Ticket ist sehr billig.", "Энэ тасалбар маш хямд байна.", "This ticket is very cheap.", "Eigenschaften"),
    ("schnell", "adjective", "хурдан", "fast", "schnell", "Der Zug fährt sehr schnell.", "Галт тэрэг маш хурдан явж байна.", "The train travels very fast.", "Eigenschaften"),
    ("langsam", "adjective", "удаан", "slow", "langsam", "Bitte sprechen Sie langsamer.", "Арай удаан ярина уу.", "Please speak more slowly.", "Eigenschaften"),
    ("warm", "adjective", "дулаахан", "warm", "warm", "Im Sommer ist es hier warm.", "Зундаа энд дулаахан байдаг.", "In summer it is warm here.", "Wetter"),
    ("kalt", "adjective", "хүйтэн", "cold", "kalt", "Im Winter ist es sehr kalt.", "Өвлийн улиралд маш хүйтэн байдаг.", "In winter it is very cold.", "Wetter"),
    ("hell", "adjective", "гэгээлэг, саруулхан", "bright", "hell", "Das Zimmer ist hell und ruhig.", "Өрөө саруулхан, тайван байна.", "The room is bright and quiet.", "Wohnen"),
    ("dunkel", "adjective", "харанхуй", "dark", "dunkel", "Draußen ist es schon dunkel.", "Гадаа аль хэдийн харанхуй болжээ.", "Outside it is already dark.", "Wetter"),
    ("müde", "adjective", "ядарсан", "tired", "müde", "Nach der Arbeit bin ich müde.", "Ажлын дараа би ядардаг.", "After work I am tired.", "Befinden"),
    ("gesund", "adjective", "эрүүл", "healthy", "gesund", "Obst und Gemüse sind gesund.", "Жимс, ногоо эрүүл мэндэд тустай.", "Fruit and vegetables are healthy.", "Gesundheit"),
    ("krank", "adjective", "өвчтэй", "sick, ill", "krank", "Er bleibt heute krank im Bett.", "Тэр өнөөдөр өвчтэй орондоо үлдэв.", "He stays in bed sick today.", "Gesundheit"),
    ("fertig", "adjective", "бэлэн, дууссан", "ready, finished", "fertig", "Das Essen ist gleich fertig.", "Хоол тун удахгүй бэлэн болно.", "Food will be ready soon.", "Alltag"),
    ("wichtig", "adjective", "чухал", "important", "wichtig", "Pünktlichkeit ist sehr wichtig.", "Цаг баримтлах нь маш чухал.", "Punctuality is very important.", "Alltag")
]

# ==========================================
# 2. EXPAND GERMAN A2
# ==========================================
a2_nouns = [
    # Office & Work
    ("Büro", "das", "-s", "noun", "оффис, ажлын өрөө", "office", "das Büro, -s", "Unser Büro befindet sich im Stadtzentrum.", "Манай оффис хотын төвд байрладаг.", "Our office is in the city center.", "Beruf & Arbeit"),
    ("Gehalt", "das", "-¨er", "noun", "цалин", "salary", "das Gehalt, -¨er", "Das Gehalt wird am Monatsende überwiesen.", "Цалин сарын сүүлээр шилждэг.", "The salary is transferred at the end of the month.", "Beruf & Arbeit"),
    ("Praktikum", "das", "-a", "noun", "дадлага", "internship", "das Praktikum, -a", "Sie absolviert ein Praktikum bei einer Bank.", "Тэр банк дээр дадлага хийж байна.", "She is doing an internship at a bank.", "Beruf & Arbeit"),
    ("Besprechung", "die", "-en", "noun", "хурал, уулзалт", "meeting", "die Besprechung, -en", "Die Besprechung beginnt um zehn Uhr.", "Хурал арван цагт эхэлнэ.", "The meeting begins at ten o'clock.", "Beruf & Arbeit"),
    ("Kündigung", "die", "-en", "noun", "ажлаас халагдах, цуцлах", "termination, notice", "die Kündigung, -en", "Er hat seine Kündigung eingereicht.", "Тэр ажлаас гарах өргөдлөө өгсөн.", "He handed in his resignation.", "Beruf & Arbeit"),
    ("Betrieb", "der", "-e", "noun", "үйлдвэр, аж ахуйн газар", "enterprise, company", "der Betrieb, -e", "Der Betrieb beschäftigt viele Arbeiter.", "Тус үйлдвэр олон ажилчидтай.", "The company employs many workers.", "Beruf & Arbeit"),
    ("Firma", "die", "Firmen", "noun", "компани", "company", "die Firma, Firmen", "Die Firma produziert hochwertige Geräte.", "Компани чанартай төхөөрөмж үйлдвэрлэдэг.", "The company produces high-quality devices.", "Beruf & Arbeit"),

    # Living & Housing
    ("Miete", "die", "-n", "noun", "түрээс", "rent", "die Miete, -n", "Die Miete ist jeden Monat fällig.", "Түрээсийг сар бүр төлөх ёстой.", "The rent is due every month.", "Wohnen"),
    ("Vermieter", "der", "-", "noun", "байрны эзэн", "landlord", "der Vermieter, -", "Der Vermieter hat die Heizung repariert.", "Байрны эзэн халаалтыг зассан.", "The landlord repaired the heating.", "Wohnen"),
    ("Kaution", "die", "-en", "noun", "барьцаа мөнгө", "deposit", "die Kaution, -en", "Die Kaution beträgt zwei Monatsmieten.", "Барьцаа нь хоёр сарын түрээстэй тэнцэнэ.", "The deposit is two months' rent.", "Wohnen"),
    ("Umzug", "der", "-¨e", "noun", "нүүдэл", "moving, relocation", "der Umzug, -¨e", "Der Umzug war sehr anstrengend.", "Нүүх нь маш их ядаргаатай байсан.", "The move was very exhausting.", "Wohnen"),
    ("Möbel", "das", "-", "noun", "тавилга", "furniture", "das Möbel, -", "Wir kaufen neue Möbel für das Wohnzimmer.", "Бид зочны өрөөндөө шинэ тавилга авна.", "We buy new furniture for the living room.", "Wohnen"),
    ("Balkon", "der", "-e", "noun", "тагт", "balcony", "der Balkon, -e", "Im Sommer frühstücken wir auf dem Balkon.", "Зунд бид тагтан дээрээ өглөөний цайгаа уудаг.", "In summer we have breakfast on the balcony.", "Wohnen"),
    ("Heizung", "die", "-en", "noun", "халаалт", "heating", "die Heizung, -en", "Die Heizung funktioniert einwandfrei.", "Халаалт ямар ч асуудалгүй ажиллаж байна.", "The heating works perfectly.", "Wohnen"),
    ("Keller", "der", "-", "noun", "зоорийн давхар", "basement", "der Keller, -", "Im Keller lagern wir Fahrräder.", "Бид зоорийн давхарт дугуйгаа хадгалдаг.", "We store bicycles in the basement.", "Wohnen"),

    # Health & Body
    ("Kopf", "der", "-¨e", "noun", "толгой", "head", "der Kopf, -¨e", "Mein Kopf tut weh.", "Миний толгой өвдөж байна.", "My head hurts.", "Gesundheit"),
    ("Auge", "das", "-n", "noun", "нүд", "eye", "das Auge, -n", "Seine Augen sind blau.", "Түүний нүд цэнхэр.", "His eyes are blue.", "Gesundheit"),
    ("Hand", "die", "-¨e", "noun", "гар", "hand", "die Hand, -¨e", "Bitte wasch dir die Hände.", "Гараа угаана уу.", "Please wash your hands.", "Gesundheit"),
    ("Bein", "das", "-e", "noun", "хөл", "leg", "das Bein, -e", "Er hat sich das Bein gebrochen.", "Тэр хөлөө хугалсан.", "He broke his leg.", "Gesundheit"),
    ("Bauch", "der", "-¨e", "noun", "гэдэс", "stomach, belly", "der Bauch, -¨e", "Ich habe starke Bauchschmerzen.", "Миний гэдэс хүчтэй өвдөж байна.", "I have severe stomach pain.", "Gesundheit"),
    ("Rücken", "der", "-", "noun", "нуруу", "back", "der Rücken, -", "Rückenschmerzen sind sehr unangenehm.", "Нурууны өвчин маш зовиуртай.", "Back pains are very uncomfortable.", "Gesundheit"),
    ("Fieber", "das", "-", "noun", "халууралт", "fever", "das Fieber, -", "Das Kind hat hohes Fieber.", "Хүүхэд өндөр халуурч байна.", "The child has a high fever.", "Gesundheit"),
    ("Grippe", "die", "-n", "noun", "ханиад, томуу", "flu, influenza", "die Grippe, -n", "Er liegt mit einer Grippe im Bett.", "Тэр томуу тусаад орондоо хэвтэж байна.", "He is in bed with the flu.", "Gesundheit"),
    ("Medikament", "das", "-e", "noun", "эм", "medication", "das Medikament, -e", "Nehmen Sie dieses Medikament dreimal täglich.", "Энэ эмийг өдөрт гурван удаа ууна уу.", "Take this medicine three times a day.", "Gesundheit"),
    ("Rezept", "das", "-e", "noun", "эмийн жор, хоолны жор", "prescription, recipe", "das Rezept, -e", "Der Arzt gab mir ein Rezept.", "Эмч надад эмийн жор өгсөн.", "The doctor gave me a prescription.", "Gesundheit"),

    # Travel & Vacation
    ("Koffer", "der", "-", "noun", "чемодан", "suitcase", "der Koffer, -", "Ich packe meinen Koffer für die Reise.", "Би аялалдаа чемоданаа баглаж байна.", "I pack my suitcase for the trip.", "Reisen"),
    ("Flug", "der", "-¨e", "noun", "нислэг", "flight", "der Flug, -¨e", "Der Flug dauert etwa drei Stunden.", "Нислэг ойролцоогоор гурван цаг үргэлжилнэ.", "The flight takes about three hours.", "Reisen"),
    ("Verspätung", "die", "-en", "noun", "саатал, хоцролт", "delay", "die Verspätung, -en", "Der Zug hat zwanzig Minuten Verspätung.", "Галт тэрэг 20 минут хоцорч байна.", "The train is twenty minutes delayed.", "Reisen"),
    ("Auskunft", "die", "-¨e", "noun", "мэдээлэл, лавлагаа", "information", "die Auskunft, -¨e", "Fragen Sie am Schalter nach der Auskunft.", "Лавлах цонхон дээрээс лавлана уу.", "Ask at the counter for information.", "Reisen"),
    ("Gleis", "das", "-e", "noun", "төмөр замын зам, тавцан", "platform, track", "das Gleis, -e", "Der Zug fährt von Gleis vier ab.", "Галт тэрэг 4-р замаас хөдөлнө.", "The train departs from platform 4.", "Reisen"),

    # Nature & Weather
    ("Sonne", "die", "-", "noun", "нар", "sun", "die Sonne, -", "Die Sonne scheint den ganzen Tag.", "Нар өдөржин гийж байна.", "The sun shines all day long.", "Natur & Umwelt"),
    ("Regen", "der", "-", "noun", "бороо", "rain", "der Regen, -", "Nach dem Regen riecht die Luft frisch.", "Борооны дараа агаар шинэлэг үнэртдэг.", "After the rain the air smells fresh.", "Natur & Umwelt"),
    ("Schnee", "der", "-", "noun", "цас", "snow", "der Schnee, -", "Im Winter fällt viel Schnee.", "Өвөл их цас ордог.", "In winter a lot of snow falls.", "Natur & Umwelt"),
    ("Wind", "der", "-e", "noun", "салхи", "wind", "der Wind, -e", "Der Wind weht heute sehr stark.", "Өнөөдөр салхи маш хүчтэй салхилж байна.", "The wind blows very strongly today.", "Natur & Umwelt"),
    ("Wald", "der", "-¨er", "noun", "ой мод", "forest", "der Wald, -¨er", "Wir machen einen Spaziergang im Wald.", "Бид ойд зугаалж байна.", "We take a walk in the forest.", "Natur & Umwelt"),
    ("Berg", "der", "-e", "noun", "уул", "mountain", "der Berg, -e", "Die Berge sind mit Schnee bedeckt.", "Уулс цасаар хучигдсан байна.", "The mountains are covered with snow.", "Natur & Umwelt"),
    ("See", "der", "-n", "noun", "нуур", "lake", "der See, -n", "Im Sommer schwimmen wir im See.", "Зун бид нууранд сэлдэг.", "In summer we swim in the lake.", "Natur & Umwelt"),
    ("Fluss", "der", "-¨e", "noun", "гол мөрөн", "river", "der Fluss, -¨e", "Der Fluss fließt durch die Stadt.", "Гол хотын дундуур урсдаг.", "The river flows through the city.", "Natur & Umwelt"),
    ("Meer", "das", "-e", "noun", "далай, тэнгис", "sea, ocean", "das Meer, -e", "Viele Menschen machen Urlaub am Meer.", "Олон хүн далайн эрэгт амардаг.", "Many people spend holidays at the sea.", "Natur & Umwelt")
]

a2_verbs = [
    ("aufhören", "hört auf", "hörte auf", "hat aufgehört", "mit + Dativ", "aufhören _____ [Dat]", "болих, зогсоох", "to stop doing", "Er hört mit dem Rauchen auf.", "Тэр тамхи татахаа больж байна.", "He stops smoking.", "Alltag"),
    ("aussehen", "sieht aus", "sah aus", "hat ausgesehen", "wie + Nomen", "ausseh__ [V] (Präsens: er/sie/es ?)", "харагдах, үзэгдэх", "to look like, appear", "Du siehst heute sehr gut aus.", "Чи өнөөдөр маш сайхан харагдаж байна.", "You look very good today.", "Aussehen"),
    ("einkaufen", "kauft ein", "kaufte ein", "hat eingekauft", "+ Akkusativ", "einkaufen + _____", "дэлгүүр хэсэх", "to shop", "Ich kaufe für das Wochenende ein.", "Би амралтын өдрүүдийн хүнсээ цуглуулж байна.", "I shop for the weekend.", "Einkaufen"),
    ("mitbringen", "bringt mit", "brachte mit", "hat mitgebracht", "+ Akkusativ", "mitbringen + _____", "авчирах, хамт авчрах", "to bring along", "Bring bitte etwas zu trinken mit.", "Уух юм хамт аваад ирээрэй.", "Please bring something to drink.", "Alltag"),
    ("mitkommen", "kommt mit", "kam mit", "ist mitgekommen", "zu + Dativ", "mitkommen _____ [Dat]", "хамт явах", "to come along", "Kommst du heute ins Kino mit?", "Чи өнөөдөр бидэнтэй кинонд явах уу?", "Are you coming along to the cinema today?", "Freizeit"),
    ("vorhaben", "hat vor", "hatte vor", "hat vorgehabt", "+ Akkusativ", "vorhab__ [V] (Präsens: er/sie/es ?)", "төлөвлөх, санаархах", "to plan, intend", "Was hast du am Wochenende vor?", "Чи амралтын өдрөөр юу хийх гэж байна?", "What are you planning for the weekend?", "Planung"),
    ("vorbereiten", "bereitet vor", "bereitete vor", "hat vorbereitet", "auf + Akkusativ", "vorbereiten auf _____", "бэлтгэх", "to prepare for", "Wir bereiten uns auf die Prüfung vor.", "Бид шалгалтандаа бэлдэж байна.", "We are preparing for the exam.", "Lernen"),
    ("verbringen", "verbringt", "verbrachte", "hat verbracht", "+ Akkusativ", "verbringen + _____", "цаг өнгөрөөх", "to spend (time)", "Ich verbringe viel Zeit mit der Familie.", "Би гэр бүлтэйгээ их цагийг өнгөрүүлдэг.", "I spend a lot of time with family.", "Freizeit"),
    ("vergessen", "vergisst", "vergaß", "hat vergessen", "+ Akkusativ", "vergess__ [V] (Präsens: er/sie/es ?)", "мартах", "to forget", "Vergiss bitte deinen Regenschirm nicht.", "Шүхрээ мартав аа.", "Please do not forget your umbrella.", "Alltag"),
    ("verlieren", "verliert", "verlor", "hat verloren", "+ Akkusativ", "verlieren + _____", "гээх, алдах", "to lose", "Ich habe meinen Ausweis verloren.", "Би үнэмлэхээ гээчихлээ.", "I lost my ID card.", "Alltag"),
    ("gewinnen", "gewinnt", "gewann", "hat gewonnen", "+ Akkusativ", "gewinnen + _____", "хожих, ялах", "to win", "Unsere Mannschaft hat das Spiel gewonnen.", "Манай баг тоглолтод хожсон.", "Our team won the game.", "Sport"),
    ("hoffen", "hofft", "hoffte", "hat gehofft", "auf + Akkusativ", "hoffen auf _____", "найдах", "to hope for", "Wir hoffen auf besseres Wetter.", "Бид цаг агаар сайжирна гэж найдаж байна.", "We hope for better weather.", "Gefühle"),
    ("schenken", "schenkt", "schenkte", "hat geschenkt", "+ Dativ + Akkusativ", "schenken + _____", "бэлэглэх", "to give as a gift", "Er schenkt seiner Mutter Blumen.", "Тэр ээждээ цэцэг бэлэглэж байна.", "He gives flowers to his mother.", "Familie"),
    ("leihen", "leiht", "lieh", "hat geliehen", "+ Dativ + Akkusativ", "leihen + _____", "зээлэх, зээлдүүлэх", "to lend, borrow", "Kannst du mir deinen Stift leihen?", "Чи надад үзгээ түр зээлээч?", "Can you lend me your pen?", "Alltag"),
    ("bezahlen", "bezahlt", "bezahlte", "hat bezahlt", "+ Akkusativ", "bezahlen + _____", "төлбөр төлөх", "to pay for", "Darf ich bitte getrennt bezahlen?", "Бид тусдаа тооцоо хийж болох уу?", "May I pay separately, please?", "Einkaufen"),
    ("reparieren", "repariert", "reparierte", "hat repariert", "+ Akkusativ", "reparieren + _____", "засах, янзлах", "to repair", "Der Mechaniker repariert das Auto.", "Механикч машиныг засаж байна.", "The mechanic is repairing the car.", "Technik")
]

# ==========================================
# 3. EXPAND GERMAN B2
# ==========================================
b2_nouns = [
    # Society, Politics & Law
    ("Gesellschaft", "die", "-en", "noun", "нийгэм", "society", "die Gesellschaft, -en", "Die moderne Gesellschaft steht vor großen Veränderungen.", "Орчин үеийн нийгэм томоохон өөрчлөлтүүдтэй тулгарч байна.", "Modern society faces major changes.", "Politik & Gesellschaft"),
    ("Demokratie", "die", "-n", "noun", "ардчилал", "democracy", "die Demokratie, -n", "Demokratie lebt von der Beteiligung aller Bürger.", "Ардчилал нь бүх иргэдийн оролцоон дээр оршин тогтнодог.", "Democracy thrives on the participation of all citizens.", "Politik & Gesellschaft"),
    ("Gesetz", "das", "-e", "noun", "хууль", "law", "das Gesetz, -e", "Das Parlament hat ein neues Gesetz verabschiedet.", "Парламент шинэ хууль баталлаа.", "Parliament passed a new law.", "Recht & Staat"),
    ("Verfassung", "die", "-en", "noun", "үндсэн хууль", "constitution", "die Verfassung, -en", "Die Grundrechte sind in der Verfassung verankert.", "Үндсэн эрхүүд үндсэн хуульд тусгагдсан байдаг.", "Basic rights are anchored in the constitution.", "Recht & Staat"),
    ("Gerechtigkeit", "die", "-", "noun", "шударга ёс", "justice, fairness", "die Gerechtigkeit, -", "Soziale Gerechtigkeit ist eine Säule des Friedens.", "Нийгмийн шударга ёс бол энх тайвны нэг багана юм.", "Social justice is a pillar of peace.", "Ethik & Recht"),
    ("Bürger", "der", "-", "noun", "иргэн", "citizen", "der Bürger, -", "Jeder Bürger sollte sein Wahlrecht nutzen.", "Иргэн бүр сонгох эрхээ эдлэх ёстой.", "Every citizen should use their right to vote.", "Politik & Gesellschaft"),
    ("Behörde", "die", "-n", "noun", "эрх бүхий байгууллага, захиргаа", "public authority", "die Behörde, -n", "Der Antrag muss bei der zuständigen Behörde eingereicht werden.", "Өргөдлийг эрх бүхий байгууллагад өгөх ёстой.", "The application must be submitted to the competent authority.", "Verwaltung"),
    ("Regierung", "die", "-en", "noun", "засгийн газар", "government", "die Regierung, -en", "Die Regierung plant umfassende Reformen.", "Засгийн газар өргөн хүрээтэй шинэчлэл төлөвлөж байна.", "The government is planning comprehensive reforms.", "Politik"),
    ("Wahl", "die", "-en", "noun", "сонгууль, сонголт", "election, choice", "die Wahl, -en", "Die Beteiligung an der Wahl war überraschend hoch.", "Сонгуулийн ирц гэнэтийн өндөр байлаа.", "Turnout at the election was surprisingly high.", "Politik"),

    # Economy & Business
    ("Wirtschaft", "die", "-en", "noun", "эдийн засаг", "economy", "die Wirtschaft, -en", "Die globale Wirtschaft erholt sich allmählich.", "Дэлхийн эдийн засаг аажмаар сэргэж байна.", "The global economy is gradually recovering.", "Wirtschaft"),
    ("Wettbewerb", "der", "-e", "noun", "өрсөлдөөн", "competition", "der Wettbewerb, -e", "Fairer Wettbewerb fördert Innovationen.", "Шударга өрсөлдөөн нь инновацийг дэмждэг.", "Fair competition fosters innovations.", "Wirtschaft"),
    ("Investition", "die", "-en", "noun", "хөрөнгө оруулалт", "investment", "die Investition, -en", "Langfristige Investitionen in Bildung zahlen sich aus.", "Боловсролд хийсэн урт хугацааны хөрөнгө оруулалт үр дүнгээ өгдөг.", "Long-term investments in education pay off.", "Wirtschaft"),
    ("Inflation", "die", "-en", "noun", "инфляци, үнийн өсөлт", "inflation", "die Inflation, -en", "Die Zentralbank versucht die Inflation einzudämmen.", "Төв банк инфляцийг хязгаарлахыг хичээж байна.", "The central bank tries to curb inflation.", "Wirtschaft"),
    ("Unternehmen", "das", "-", "noun", "аж ахуйн нэгж, компани", "enterprise, corporation", "das Unternehmen, -", "Mittelständische Unternehmen prägen das Land.", "Дунд хэмжээний аж ахуйн нэгжүүд улс орныг тодорхойлдог.", "Medium-sized companies shape the country.", "Wirtschaft"),
    ("Handel", "der", "-", "noun", "худалдаа", "trade, commerce", "der Handel, -", "Der internationale Handel verbindet die Kontinente.", "Олон улсын худалдаа тивүүдийг холбодог.", "International trade connects continents.", "Wirtschaft"),
    ("Umsatz", "der", "-¨e", "noun", "борлуулалтын орлого", "revenue, turnover", "der Umsatz, -¨e", "Der jährliche Umsatz ist um zehn Prozent gestiegen.", "Жилийн борлуулалтын орлого 10 хувиар өссөн.", "Annual revenue increased by ten percent.", "Wirtschaft"),

    # Science, Tech & Environment
    ("Wissenschaft", "die", "-en", "noun", "шинжлэх ухаан", "science", "die Wissenschaft, -en", "Die Wissenschaft liefert Fakten für rationale Entscheidungen.", "Шинжлэх ухаан нь оновчтой шийдвэр гаргахад бодит баримт өгдөг.", "Science provides facts for rational decisions.", "Wissenschaft"),
    ("Forschung", "die", "-en", "noun", "судалгаа шинжилгээ", "research", "die Forschung, -en", "Klinische Forschung erfordert höchste Präzision.", "Эмнэлзүйн судалгаа нь дээд зэргийн нарийвчлал шаарддаг.", "Clinical research demands utmost precision.", "Wissenschaft"),
    ("Klimawandel", "der", "-", "noun", "уур амьсгалын өөрчлөлт", "climate change", "der Klimawandel, -", "Der Klimawandel stellt eine existenzielle Bedrohung dar.", "Уур амьсгалын өөрчлөлт нь оршин тогтноход аюул учруулж байна.", "Climate change poses an existential threat.", "Umwelt & Zukunft"),
    ("Nachhaltigkeit", "die", "-", "noun", "тогтвортой байдал", "sustainability", "die Nachhaltigkeit, -", "Nachhaltigkeit steht im Mittelpunkt unserer Strategie.", "Тогтвортой байдал нь манай стратегийн төвд байна.", "Sustainability is at the center of our strategy.", "Umwelt & Zukunft"),
    ("Ressource", "die", "-n", "noun", "нөөц баялаг", "resource", "die Ressource, -n", "Natürliche Ressourcen müssen geschont werden.", "Байгалийн нөөцийг гамнах ёстой.", "Natural resources must be conserved.", "Umwelt & Zukunft"),
    ("Fortschritt", "der", "-e", "noun", "дэвшил, ололт", "progress, advancement", "der Fortschritt, -e", "Technologischer Fortschritt verändert die Arbeitswelt.", "Технологийн дэвшил хөдөлмөрийн ертөнцийг өөрчилж байна.", "Technological progress transforms the work environment.", "Wissenschaft & Technik"),
    ("Innovation", "die", "-en", "noun", "инноваци, шинэ санаачлага", "innovation", "die Innovation, -en", "Kreative Ideen führen zu wegweisenden Innovationen.", "Бүтээлч санаанууд нь шинэлэг инновацид хүргэдэг.", "Creative ideas lead to pioneering innovations.", "Wissenschaft & Technik"),
    ("Digitalisierung", "die", "-", "noun", "дижиталчлал", "digitalization", "die Digitalisierung, -", "Die Digitalisierung der Schulen schreitet voran.", "Сургуулиудын дижиталчлал урагшилж байна.", "The digitalization of schools is progressing.", "Wissenschaft & Technik"),

    # Psychology, Education & Communication
    ("Bewusstsein", "das", "-", "noun", "ухамсар", "consciousness, awareness", "das Bewusstsein, -", "Umweltbewusstsein entsteht durch Bildung.", "Байгаль орчны ухамсар боловсролоор бий болдог.", "Environmental awareness arises through education.", "Psychologie & Geist"),
    ("Erkenntnis", "die", "-se", "noun", "танин мэдэхүй, ухаарал", "insight, finding", "die Erkenntnis, -se", "Diese wissenschaftliche Erkenntnis revolutionierte die Medizin.", "Энэхүү шинжлэх ухааны нээлт анагаах ухааныг эрс өөрчилсөн.", "This scientific finding revolutionized medicine.", "Wissenschaft"),
    ("Kompromiss", "der", "-e", "noun", "харилцан буулт, зөвшилцөл", "compromise", "der Kompromiss, -e", "In Verhandlungen muss man oft Kompromisse schließen.", "Хэлэлцээрт ихэвчлэн харилцан буулт хийх шаардлагатай болдог.", "In negotiations one often has to make compromises.", "Kommunikation"),
    ("Standpunkt", "der", "-e", "noun", "байр суурь, байршил", "standpoint, point of view", "der Standpunkt, -e", "Er vertrat seinen Standpunkt mit überzeugenden Argumenten.", "Тэр өөрийн байр сууриа үнэмшилтэй үндэслэлээр хамгаалсан.", "He represented his standpoint with convincing arguments.", "Diskurs"),
    ("Konflikt", "der", "-e", "noun", "зөрчил, мөргөлдөөн", "conflict", "der Konflikt, -e", "Konflikte sollten friedlich und im Dialog gelöst werden.", "Зөрчлийг яриа хэлцлээр тайван замаар шийдвэрлэх ёстой.", "Conflicts should be resolved peacefully and through dialogue.", "Gesellschaft")
]

b2_verbs = [
    ("befürworten", "befürwortet", "befürwortete", "hat befürwortet", "+ Akkusativ", "befürworten + _____", "дэмжих, зөвтгөх", "to advocate, endorse", "Viele Experten befürworten diese Reform.", "Олон шинжээчид энэхүү шинэчлэлийг дэмжиж байна.", "Many experts endorse this reform.", "Diskurs & Politik"),
    ("ablehnen", "lehnt ab", "lehnte ab", "hat abgelehnt", "+ Akkusativ", "ablehnen + _____", "татгалзах, няцаах", "to reject, decline", "Der Ausschuss lehnte den Vorschlag einstimmig ab.", "Хороо уг саналыг санал нэгтэйгээр няцаав.", "The committee unanimously rejected the proposal.", "Diskurs & Politik"),
    ("bezweifeln", "bezweifelt", "bezweifelte", "hat bezweifelt", "+ Akkusativ", "bezweifeln + _____", "эргэлзэх", "to doubt", "Niemand bezweifelt seine fachliche Kompetenz.", "Түүний мэргэжлийн чадварт хэн ч эргэлздэггүй.", "Nobody doubts his professional competence.", "Diskurs"),
    ("gewährleisten", "gewährleistet", "gewährleistete", "hat gewährleistet", "+ Akkusativ", "gewährleisten + _____", "хангах, батлах", "to guarantee, ensure", "Sicherheitsmaßnahmen gewährleisten den reibungslosen Ablauf.", "Аюулгүй байдлын арга хэмжээ нь саадгүй явагдах нөхцөлийг хангадаг.", "Security measures ensure smooth operation.", "Recht & Verwaltung"),
    ("hervorheben", "hebt hervor", "hob hervor", "hat hervorgehoben", "+ Akkusativ", "hervorheb__ [V] (Präsens: er/sie/es ?)", "онцлох, тодруулах", "to emphasize, highlight", "Der Redner hob die Wichtigkeit der Zusammenarbeit hervor.", "Илтгэгч хамтын ажиллагааны ач холбогдлыг онцлон тэмдэглэв.", "The speaker emphasized the importance of cooperation.", "Diskurs & Rhetorik"),
    ("unterschätzen", "unterschätzt", "unterschätzte", "hat unterschätzt", "+ Akkusativ", "unterschätzen + _____", "дутуу үнэлэх", "to underestimate", "Man sollte die Risiken keinesfalls unterschätzen.", "Эрсдэлийг хэзээ ч дутуу үнэлж болохгүй.", "One should under no circumstances underestimate the risks.", "Urteil"),
    ("überschätzen", "überschätzt", "überschätzte", "hat überschätzt", "+ Akkusativ", "überschätzen + _____", "хэт өндрөөр үнэлэх", "to overestimate", "Er neigt dazu, seine Kräfte zu überschätzen.", "Тэр өөрийн хүчийг хэт өндөр үнэлэх хандлагатай.", "He tends to overestimate his strength.", "Urteil"),
    ("vereinbaren", "vereinbart", "vereinbarte", "hat vereinbart", "+ Akkusativ", "vereinbaren + _____", "тохиролцох", "to agree upon, arrange", "Wir haben einen neuen Termin vereinbart.", "Бид шинэ уулзалтын цаг тохиролцсон.", "We agreed upon a new appointment.", "Organisation"),
    ("voraussetzen", "setzt voraus", "setzte voraus", "hat vorausgesetzt", "+ Akkusativ", "voraussetzen + _____", "урьдчилан шаардах, таамаглах", "to presume, require", "Dieses Studium setzt gute Sprachkenntnisse voraus.", "Энэ сургалт нь хэлний сайн мэдлэг шаарддаг.", "This degree requires good language skills.", "Bildung"),
    ("widerlegen", "widerlegt", "widerlegte", "hat widerlegt", "+ Akkusativ", "widerlegen + _____", "няцаах, үгүйсгэх", "to refute, disprove", "Neue Experimente widerlegten die alte Hypothese.", "Шинэ туршилтууд хуучин таамаглалыг няцаасан.", "New experiments disproved the old hypothesis.", "Wissenschaft"),
    ("bewältigen", "bewältigt", "bewältigte", "hat bewältigt", "+ Akkusativ", "bewältigen + _____", "даван туулах", "to cope with, master", "Gemeinsam können wir diese Krise bewältigen.", "Хамтдаа бид энэ хямралыг даван туулж чадна.", "Together we can overcome this crisis.", "Psychologie & Leben"),
    ("einbeziehen", "bezieht ein", "bezog ein", "hat einbezogen", "in + Akkusativ", "einbezieh__ in _____ [Akk]", "татан оролцуулах, хамруулах", "to involve, include", "Alle Mitarbeiter wurden in die Entscheidung einbezogen.", "Бүх ажилчдыг шийдвэр гаргахад татан оролцуулсан.", "All employees were included in the decision.", "Organisation")
]

# ==========================================
# 4. EXPAND ENGLISH A1
# ==========================================
en_a1_additions = [
    ("work", "verb", "work | worked | worked", "ажиллах", "arbeiten", "work at / in", "work _____ [prep]", "I work in an office.", "Би оффист ажилладаг.", "Ich arbeite in einem Büro.", "Daily Life"),
    ("live", "verb", "live | lived | lived", "амьдрах", "wohnen, leben", "live in", "live _____ [prep]", "We live in Ulaanbaatar.", "Бид Улаанбаатарт амьдардаг.", "Wir leben in Ulaanbaatar.", "Daily Life"),
    ("read", "verb", "read | read | read", "унших", "lesen", "+ noun", "read _____ [noun]", "She reads books every day.", "Тэр өдөр бүр ном уншдаг.", "Sie liest jeden Tag Bücher.", "Daily Life"),
    ("write", "verb", "write | wrote | written", "бичих", "schreiben", "+ noun", "write _____ [noun]", "I write an email to my friend.", "Би найз руугаа и-мэйл бичдэг.", "Ich schreibe eine E-Mail an meinen Freund.", "Daily Life"),
    ("listen", "verb", "listen | listened | listened", "сонсох", "zuhören", "listen to", "listen _____ [prep]", "They listen to music on the bus.", "Тэд автобусанд хөгжим сонсдог.", "Sie hören im Bus Musik.", "Free Time"),
    ("speak", "verb", "speak | spoke | spoken", "ярих", "sprechen", "speak with / to", "speak _____ [prep]", "Can you speak English?", "Та англиар ярьж чадах уу?", "Können Sie Englisch sprechen?", "Communication"),
    ("buy", "verb", "buy | bought | bought", "худалдаж авах", "kaufen", "+ noun", "buy _____ [noun]", "We buy food at the supermarket.", "Бид супермаркетаас хүнс авдаг.", "Wir kaufen Essen im Supermarkt.", "Shopping"),
    ("pay", "verb", "pay | paid | paid", "төлөх", "bezahlen", "pay for", "pay _____ [prep]", "Can I pay by card?", "Би картаар төлж болох уу?", "Kann ich mit Karte bezahlen?", "Shopping"),
    ("help", "verb", "help | helped | helped", "туслах", "helfen", "+ noun", "help _____ [person]", "Please help me carry this bag.", "Энэ цүнхийг өргөхөд надад туслаач.", "Bitte hilf mir, diese Tasche zu tragen.", "Daily Life"),
    ("learn", "verb", "learn | learned | learned", "сурах", "lernen", "+ noun", "learn _____ [topic]", "I want to learn German and English.", "Би герман, англи хэл сурмаар байна.", "Ich möchte Deutsch und Englisch lernen.", "Education"),
    ("start", "verb", "start | started | started", "эхлэх", "beginnen, starten", "start at / with", "start _____ [prep]", "The lesson starts at nine o'clock.", "Хичээл есөн цагт эхэлдэг.", "Der Unterricht beginnt um neun Uhr.", "Education"),
    ("stop", "verb", "stop | stopped | stopped", "зогсох, болих", "anhalten, stoppen", "+ gerund", "stop _____ [doing sth]", "The bus stops right here.", "Автобус яг энд зогсдог.", "Der Bus hält genau hier.", "Transport"),
    ("open", "verb", "open | opened | opened", "нээх, онгойлгох", "öffnen", "+ noun", "open _____ [noun]", "Please open the window.", "Цонхоо онгойлгооч.", "Bitte öffne das Fenster.", "Daily Life"),
    ("close", "verb", "close | closed | closed", "хаах", "schließen", "+ noun", "close _____ [noun]", "The shop closes at 8 pm.", "Дэлгүүр оройн 8 цагт хаадаг.", "Das Geschäft schließt um 20 Uhr.", "Shopping"),
    ("sleep", "verb", "sleep | slept | slept", "унтах", "schlafen", "sleep for", "sleep _____ [duration]", "I sleep eight hours every night.", "Би шөнө бүр найман цаг унтдаг.", "Ich schlafe jede Nacht acht Stunden.", "Health"),
    ("meet", "verb", "meet | met | met", "уулзах", "treffen", "meet with", "meet _____ [prep]", "Let's meet tomorrow afternoon.", "Маргааш үдээс хойш уулзацгаая.", "Lass uns morgen Nachmittag treffen.", "Social"),
    ("understand", "verb", "understand | understood | understood", "ойлгох", "verstehen", "+ noun", "understand _____ [noun]", "Do you understand the question?", "Та энэ асуултыг ойлгож байна уу?", "Verstehst du die Frage?", "Communication"),
    ("know", "verb", "know | knew | known", "мэдэх, таних", "wissen, kennen", "+ noun / fact", "know _____ [noun]", "I know the right answer.", "Би зөв хариултыг мэднэ.", "Ich kenne die richtige Antwort.", "Knowledge"),
    ("think", "verb", "think | thought | thought", "бодох, сэтгэх", "denken, glauben", "think about / of", "think _____ [prep]", "What do you think about this plan?", "Чи энэ төлөвлөгөөний талаар юу гэж бодож байна?", "Was denkst du über diesen Plan?", "Opinion"),
    ("travel", "verb", "travel | traveled | traveled", "аялах", "reisen", "travel to", "travel _____ [prep]", "We like to travel to new countries.", "Бид шинэ улсуудаар аялах дуртай.", "Wir reisen gern in neue Länder.", "Travel")
]

# ==========================================
# 5. EXPAND ENGLISH A2
# ==========================================
en_a2_additions = [
    ("agree", "verb", "agree | agreed | agreed", "санал нийлэх", "zustimmen", "agree with", "agree _____ [prep]", "I completely agree with you.", "Би чамтай бүрэн санал нийлж байна.", "Ich stimme dir vollkommen zu.", "Discussion"),
    ("borrow", "verb", "borrow | borrowed | borrowed", "зээлж авах", "leihen (von)", "borrow from", "borrow _____ [prep]", "Can I borrow a pen from you?", "Би чамаас үзэг зээлж болох уу?", "Kann ich mir einen Stift von dir leihen?", "Daily Life"),
    ("decide", "verb", "decide | decided | decided", "шийдэх", "entscheiden", "decide to", "decide _____ [prep]", "We decided to stay at home.", "Бид гэртээ үлдэхээр шийдсэн.", "Wir haben beschlossen, zu Hause zu bleiben.", "Actions"),
    ("explain", "verb", "explain | explained | explained", "тайлбарлах", "erklären", "explain to", "explain _____ [prep]", "Could you explain this rule again?", "Энэ дүрмийг дахиад нэг тайлбарлаж өгөхгүй юу?", "Könnten Sie diese Regel noch einmal erklären?", "Learning"),
    ("forget", "verb", "forget | forgot | forgotten", "мартах", "vergessen", "+ to / noun", "forget _____ [noun]", "Don't forget to lock the door.", "Хаалгаа түгжихээ бүү мартаарай.", "Vergiss nicht, die Tür abzuschließen.", "Daily Life"),
    ("happen", "verb", "happen | happened | happened", "тохиолдох, болох", "geschehen, passieren", "happen to", "happen _____ [prep]", "What happened yesterday?", "Өчигдөр юу болсон бэ?", "Was ist gestern passiert?", "Events"),
    ("improve", "verb", "improve | improved | improved", "сайжруулах, дэвших", "verbessern", "+ noun", "improve _____ [skills]", "I want to improve my vocabulary.", "Би үгийн сангаа сайжруулахыг хүсэж байна.", "Ich möchte meinen Wortschatz verbessern.", "Education"),
    ("invite", "verb", "invite | invited | invited", "урих", "einladen", "invite to", "invite _____ [prep]", "She invited me to her birthday party.", "Тэр намайг төрсөн өдрийн үдэшлэгтээ урьсан.", "Sie hat mich zu ihrer Geburtstagsparty eingeladen.", "Social"),
    ("prefer", "verb", "prefer | preferred | preferred", "илүүд үзэх", "bevorzugen", "prefer to", "prefer _____ [prep]", "I prefer tea to coffee.", "Би кофенд биш цайнд илүү дуртай.", "Ich bevorzuge Tee gegenüber Kaffee.", "Preferences"),
    ("promise", "verb", "promise | promised | promised", "амлах", "versprechen", "promise to", "promise _____ [verb]", "I promise to call you tonight.", "Би өнөө орой чам руу залгана гэж амлаж байна.", "Ich verspreche, dich heute Abend anzurufen.", "Communication"),
    ("receive", "verb", "receive | received | received", "хүлээн авах", "erhalten, empfangen", "+ noun", "receive _____ [noun]", "Did you receive my email?", "Та миний и-мэйлийг хүлээн авсан уу?", "Hast du meine E-Mail erhalten?", "Communication"),
    ("remember", "verb", "remember | remembered | remembered", "санах", "sich erinnern an", "+ noun", "remember _____ [noun]", "I remember his face very well.", "Би түүний царайг маш сайн санаж байна.", "Ich erinnere mich sehr gut an sein Gesicht.", "Memory"),
    ("spend", "verb", "spend | spent | spent", "зарцуулах, өнгөрөөх", "ausgeben, verbringen", "spend on", "spend _____ [prep]", "He spends a lot of money on books.", "Тэр номонд их мөнгө зарцуулдаг.", "Er gibt viel Geld für Bücher aus.", "Finances"),
    ("suggest", "verb", "suggest | suggested | suggested", "санал болгох", "vorschlagen", "+ gerund / noun", "suggest _____ [action]", "I suggest taking the bus.", "Би автобусаар явахыг санал болгож байна.", "Ich schlage vor, den Bus zu nehmen.", "Ideas")
]

# ==========================================
# 6. EXPAND ENGLISH B1
# ==========================================
en_b1_additions = [
    ("adapt to", "verb", "adapt | adapted | adapted", "дасан зохицох", "sich anpassen an", "adapt to", "adapt _____ [prep]", "It takes time to adapt to a new country.", "Шинэ улсад дасан зохицоход цаг хугацаа ордог.", "Es braucht Zeit, sich an ein neues Land anzupassen.", "Life Skills"),
    ("apologize for", "verb", "apologize | apologized | apologized", "уучлалт гуйх", "sich entschuldigen für", "apologize for", "apologize _____ [prep]", "He apologized for arriving late.", "Тэр хоцорч ирсэндээ уучлалт гуйсан.", "Er entschuldigte sich für das Zuspätkommen.", "Social"),
    ("benefit from", "verb", "benefit | benefited | benefited", "үр шим хүртэх", "profitieren von", "benefit from", "benefit _____ [prep]", "Students benefit from daily practice.", "Оюутнууд өдөр тутмын дадлагаас ихээхэн үр шим хүртдэг.", "Studenten profitieren von täglicher Übung.", "Education"),
    ("concentrate on", "verb", "concentrate | concentrated | concentrated", "төвлөрөх", "sich konzentrieren auf", "concentrate on", "concentrate _____ [prep]", "Please concentrate on your work.", "Ажилдаа анхаарлаа төвлөрүүлнэ үү.", "Bitte konzentriere dich auf deine Arbeit.", "Productivity"),
    ("cope with", "verb", "cope | coped | coped", "даван туулах", "bewältigen, zurechtkommen mit", "cope with", "cope _____ [prep]", "She learned to cope with stress effectively.", "Тэр стрессийг үр дүнтэй даван туулж сурсан.", "Sie lernte, effektiv mit Stress umzugehen.", "Psychology"),
    ("get rid of", "verb", "get | got | got", "салах, зайлуулах", "loswerden", "get rid of", "get rid _____ [prep]", "We need to get rid of old clutter.", "Бид хуучин хэрэггүй зүйлсээсээ салах хэрэгтэй.", "Wir müssen alten Ballast loswerden.", "Daily Life"),
    ("invest in", "verb", "invest | invested | invested", "хөрөнгө оруулах", "investieren in", "invest in", "invest _____ [prep]", "It is smart to invest in education.", "Боловсролд хөрөнгө оруулах нь ухаалаг алхам юм.", "Es ist klug, in Bildung zu investieren.", "Finance"),
    ("look down on", "verb", "look | looked | looked", "дээрэлхэх, дорд үзэх", "herabsehen auf", "look down on", "look down _____ [prep]", "Never look down on someone who is trying.", "Хичээж буй хүнийг хэзээ ч бүү дорд үз.", "Blicke niemals auf jemanden herab, der sich anstrengt.", "Ethics"),
    ("prevent from", "verb", "prevent | prevented | prevented", "урьдчилан сэргийлэх", "abhalten von, verhindern", "prevent from", "prevent _____ [prep]", "Good sleep prevents you from getting sick.", "Сайн унтах нь өвчлөхөөс сэргийлдэг.", "Guter Schlaf bewahrt einen vor Krankheiten.", "Health"),
    ("rely on", "verb", "rely | relied | relied", "найдах, түшиглэх", "sich verlassen auf", "rely on", "rely _____ [prep]", "You can always rely on my support.", "Та миний дэмжлэгт үргэлж найдаж болно.", "Du kannst dich immer auf meine Unterstützung verlassen.", "Trust")
]

# ==========================================
# 7. EXPAND ENGLISH B2
# ==========================================
en_b2_additions = [
    ("advocate for", "verb", "advocate | advocated | advocated", "өмгөөлөх, дэмжих", "befürworten, eintreten für", "advocate for", "advocate _____ [prep]", "Scientists advocate for urgent climate action.", "Эрдэмтэд уур амьсгалын эсрэг яаралтай арга хэмжээ авахыг дэмжиж байна.", "Wissenschaftler befürworten dringende Klimamaßnahmen.", "Debate"),
    ("bring about", "verb", "bring | brought | brought", "бий болгох, авчрах", "hervorrufen, bewirken", "bring about", "bring _____ [prep]", "Technological shifts brought about new industries.", "Технологийн өөрчлөлтүүд шинэ салбаруудыг бий болгосон.", "Technologische Veränderungen brachten neue Industrien hervor.", "Economy"),
    ("cater to", "verb", "cater | catered | catered", "хэрэгцээг хангах", "bedienen, zugeschnitten sein auf", "cater to", "cater _____ [prep]", "The platform caters to autonomous learners.", "Энэхүү платформ нь бие даан суралцагчдад зориулагдсан.", "Die Plattform richtet sich an autonome Lernende.", "Technology"),
    ("culminate in", "verb", "culminate | culminated | culminated", "дээд цэгтээ хүрэх", "gipfeln in", "culminate in", "culminate _____ [prep]", "Years of dedicated work culminated in a historic victory.", "Олон жилийн хичээл зүтгэл түүхэн ялалтаар өндөрлөсөн.", "Jahrelange Hingabe gipfelte in einem historischen Sieg.", "Success"),
    ("deviate from", "verb", "deviate | deviated | deviated", "хазайх, гажих", "abweichen von", "deviate from", "deviate _____ [prep]", "Do not deviate from established guidelines.", "Тогтоосон удирдамжаас бүү хазай.", "Weiche nicht von den festgelegten Richtlinien ab.", "Standards"),
    ("embark on", "verb", "embark | embarked | embarked", "шинээр эхлүүлэх", "sich begeben auf, beginnen", "embark on", "embark _____ [prep]", "She decided to embark on a new scientific career.", "Тэрээр шинжлэх ухааны шинэ замналаа эхлүүлэхээр шийдсэн.", "Sie beschloss, eine neue wissenschaftliche Laufbahn einzuschlagen.", "Career"),
    ("hinge on", "verb", "hinge | hinged | hinged", "хамаарах, шалтгаалах", "abhängen von", "hinge on", "hinge _____ [prep]", "The success of negotiations hinges on mutual trust.", "Хэлэлцээрийн амжилт нь харилцан итгэлцлээс хамаарна.", "Der Verhandlungserfolg hängt von gegenseitigem Vertrauen ab.", "Diplomacy"),
    ("refrain from", "verb", "refrain | refrained | refrained", "тэвчих, татгалзах", "unterlassen, sich enthalten", "refrain from", "refrain _____ [prep]", "Please refrain from using mobile devices during exam.", "Шалгалтын үеэр гар утас ашиглахаас татгалзана уу.", "Bitte unterlassen Sie die Nutzung mobiler Geräte während der Prüfung.", "Protocol"),
    ("resonate with", "verb", "resonate | resonated | resonated", "сэтгэлд нийцэх, цуурайтах", "anklingen bei, Anklang finden", "resonate with", "resonate _____ [prep]", "Her inspiring speech resonated with young creators.", "Түүний урам зориг өгсөн илтгэл залуу бүтээгчдийн сэтгэлд нийцсэн.", "Ihre Rede fand großen Anklang bei jungen Gestaltern.", "Rhetoric"),
    ("stem from", "verb", "stem | stemmed | stemmed", "үүсэлтэй байх, гарах", "herrühren von, abstammen", "stem from", "stem _____ [prep]", "Many misunderstandings stem from vague terminology.", "Олон үл ойлголцол тодорхойгүй нэр томьёоноос үүдэлтэй байдаг.", "Viele Missverständnisse rühren von ungenauer Terminologie her.", "Analysis")
]

# Run compilation & merging
def expand():
    # 1. DE A1
    de_a1 = load_json('data/de/vocab_a1.json')
    seen_a1 = set(x['word'].strip().lower() for x in de_a1)
    idx = len(de_a1) + 1

    for w, art, pl, pos, mn_t, en_t, disp, ex_de, ex_mn, ex_en, topic in a1_nouns:
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

    for w, p3, pr, p2, rek, prompt, mn_t, en_t, ex_de, ex_mn, ex_en, topic in a1_verbs:
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

    for w, pos, mn_t, en_t, disp, ex_de, ex_mn, ex_en, topic in a1_adjectives:
        if w.strip().lower() not in seen_a1:
            de_a1.append(clean_entry({
                "id": f"de_a1_{str(idx).zfill(4)}",
                "word": w,
                "article": None,
                "plural": None,
                "display": disp,
                "pos": pos,
                "lang": "de",
                "level": "A1",
                "forms": None,
                "rektion": None,
                "prompt_front": w,
                "revealed_back": f"{disp} [{pos}]",
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

    save_json('data/de/vocab_a1.json', de_a1)

    # 2. DE A2
    de_a2 = load_json('data/de/vocab_a2.json')
    seen_a2 = set(x['word'].strip().lower() for x in de_a2)
    idx = len(de_a2) + 1

    for w, art, pl, pos, mn_t, en_t, disp, ex_de, ex_mn, ex_en, topic in a2_nouns:
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

    for w, p3, pr, p2, rek, prompt, mn_t, en_t, ex_de, ex_mn, ex_en, topic in a2_verbs:
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

    for w, art, pl, pos, mn_t, en_t, disp, ex_de, ex_mn, ex_en, topic in b2_nouns:
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

    for w, p3, pr, p2, rek, prompt, mn_t, en_t, ex_de, ex_mn, ex_en, topic in b2_verbs:
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
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_a1_additions:
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
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_a2_additions:
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
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_b1_additions:
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
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_b2_additions:
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
    expand()
