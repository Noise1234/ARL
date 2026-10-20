import json
import unicodedata

def nfc(s):
    return unicodedata.normalize('NFC', s.strip()) if s else s

# ==========================================
# GERMAN A1 VOCABULARY
# ==========================================
de_a1 = [
    # Nouns
    ("Name", "der", "-n", "noun", "нэр", "name", "der Name, -n", "Wie ist dein Name?", "Таны нэр хэн бэ?", "What is your name?"),
    ("Tag", "der", "-e", "noun", "өдөр", "day", "der Tag, -e", "Guten Tag!", "Өдрийн мэнд!", "Good day!"),
    ("Morgen", "der", "-", "noun", "өглөө", "morning", "der Morgen, -", "Guten Morgen!", "Өглөөний мэнд!", "Good morning!"),
    ("Abend", "der", "-e", "noun", "орой", "evening", "der Abend, -e", "Guten Abend!", "Оройн мэнд!", "Good evening!"),
    ("Frau", "die", "-en", "noun", "эмэгтэй, хатагтай", "woman, Mrs.", "die Frau, -en", "Das ist Frau Müller.", "Энэ бол хатагтай Мюллер.", "This is Mrs. Müller."),
    ("Mann", "der", "-er", "noun", "эрэгтэй, нөхөр", "man, husband", "der Mann, -er", "Der Mann arbeitet hier.", "Тэр эрэгтэй энд ажилладаг.", "The man works here."),
    ("Kind", "das", "-er", "noun", "хүүхэд", "child", "das Kind, -er", "Das Kind spielt im Garten.", "Хүүхэд цэцэрлэгт тоглож байна.", "The child is playing in the garden."),
    ("Stadt", "die", "-e", "noun", "хот", "city", "die Stadt, -e", "Berlin ist eine große Stadt.", "Берлин бол том хот.", "Berlin is a big city."),
    ("Land", "das", "-er", "noun", "улс орон, хөдөө", "country", "das Land, -er", "Aus welchem Land kommen Sie?", "Та аль улсаас ирсэн бэ?", "Which country do you come from?"),
    ("Haus", "das", "-er", "noun", "байшин", "house", "das Haus, -er", "Unser Haus ist alt.", "Манай байшин хуучин.", "Our house is old."),
    ("Wohnung", "die", "-en", "noun", "орон сууц", "apartment", "die Wohnung, -en", "Die Wohnung hat drei Zimmer.", "Энэ байр гурван өрөөтэй.", "The apartment has three rooms."),
    ("Zimmer", "das", "-", "noun", "өрөө", "room", "das Zimmer, -", "Das Zimmer ist hell.", "Энэ өрөө саруулхан.", "The room is bright."),
    ("Tisch", "der", "-e", "noun", "ширээ", "table", "der Tisch, -e", "Das Buch liegt auf dem Tisch.", "Ном ширээн дээр байна.", "The book is on the table."),
    ("Stuhl", "der", "-e", "noun", "сандал", "chair", "der Stuhl, -e", "Bitte nehmen Sie auf dem Stuhl Platz.", "Энэ сандал дээр сууна уу.", "Please take a seat on the chair."),
    ("Buch", "das", "-er", "noun", "ном", "book", "das Buch, -er", "Ich lese ein deutsches Buch.", "Би герман ном уншиж байна.", "I am reading a German book."),
    ("Wasser", "das", "-", "noun", "ус", "water", "das Wasser, -", "Ich trinke gerne Wasser.", "Би ус уух дуртай.", "I like drinking water."),
    ("Brot", "das", "-e", "noun", "талх", "bread", "das Brot, -e", "Ich kaufe frisches Brot.", "Би шинэ талх авна.", "I buy fresh bread."),
    ("Kaffee", "der", "-", "noun", "кофе", "coffee", "der Kaffee, -", "Möchten Sie einen Kaffee?", "Та кофе уух уу?", "Would you like a coffee?"),
    ("Tee", "der", "-", "noun", "цай", "tea", "der Tee, -", "Ich trinke schwarzen Tee.", "Би хар цай уудаг.", "I drink black tea."),
    ("Apfel", "der", "-", "noun", "алим", "apple", "der Apfel, -", "Der Apfel schmeckt süß.", "Алим амттай байна.", "The apple tastes sweet."),
    ("Schule", "die", "-n", "noun", "сургууль", "school", "die Schule, -n", "Die Schule beginnt um acht Uhr.", "Сургууль найман цагт эхэлдэг.", "School begins at eight o'clock."),
    ("Lehrer", "der", "-", "noun", "багш", "teacher (male)", "der Lehrer, -", "Der Lehrer erklärt die Grammatik.", "Багш дүрмийг тайлбарлаж байна.", "The teacher explains the grammar."),
    ("Freund", "der", "-e", "noun", "найз", "friend", "der Freund, -e", "Mein Freund wohnt in München.", "Миний найз Мюнхенд амьдардаг.", "My friend lives in Munich."),
    ("Familie", "die", "-n", "noun", "гэр бүл", "family", "die Familie, -n", "Meine Familie ist klein.", "Манай гэр бүл цөөхүүлээ.", "My family is small."),
    ("Uhr", "die", "-en", "noun", "цаг", "clock, watch", "die Uhr, -en", "Wie viel Uhr ist es?", "Цаг хэд болж байна?", "What time is it?"),
    ("Geld", "das", "-", "noun", "мөнгө", "money", "das Geld, -", "Ich habe leider kein Geld dabei.", "Харамсалтай нь надад бэлэн мөнгө алга.", "Unfortunately I have no money with me."),
    ("Bahnhof", "der", "-e", "noun", "галт тэрэгний буудал", "train station", "der Bahnhof, -e", "Wo ist der Bahnhof?", "Буудал хаана байдаг вэ?", "Where is the train station?"),
    ("Zug", "der", "-e", "noun", "галт тэрэг", "train", "der Zug, -e", "Der Zug kommt pünktlich an.", "Галт тэрэг цагтаа ирнэ.", "The train arrives on time."),
    ("Arzt", "der", "-e", "noun", "эмч", "doctor", "der Arzt, -e", "Ich muss zum Arzt gehen.", "Би эмчид үзүүлэх хэрэгтэй байна.", "I have to go to the doctor."),
    ("Sprache", "die", "-n", "noun", "хэл", "language", "die Sprache, -n", "Deutsch ist eine schöne Sprache.", "Герман хэл бол сайхан хэл.", "German is a beautiful language."),
    ("Auto", "das", "-s", "noun", "машин", "car", "das Auto, -s", "Das Auto ist neu.", "Машин шинэ байна.", "The car is new."),
    ("Straße", "die", "-n", "noun", "гудамж", "street", "die Straße, -n", "Die Straße ist ruhig.", "Гудамж тайван байна.", "The street is quiet."),
    ("Frage", "die", "-n", "noun", "асуулт", "question", "die Frage, -n", "Ich habe eine kurze Frage.", "Надад нэг товч асуулт байна.", "I have a brief question."),
    ("Antwort", "die", "-en", "noun", "хариулт", "answer", "die Antwort, -en", "Die Antwort ist richtig.", "Хариулт зөв байна.", "The answer is correct."),
    ("Hilfe", "die", "-", "noun", "тусламж", "help", "die Hilfe, -", "Brauchen Sie Hilfe?", "Танд тусламж хэрэгтэй юу?", "Do you need help?")
]

de_a1_verbs = [
    ("kommen", "kommt", "kam", "ist gekommen", "aus + Dativ", "kommen _____ [Dat]", "ирэх", "to come", "Er kommt aus der Mongolei.", "Тэр Монголоос ирсэн.", "He comes from Mongolia."),
    ("wohnen", "wohnt", "wohnte", "hat gewohnt", "in + Dativ", "wohnen _____ [Dat]", "оршин суух", "to live/reside", "Ich wohne in Ulaanbaatar.", "Би Улаанбаатарт амьдардаг.", "I live in Ulaanbaatar."),
    ("sprechen", "spricht", "sprach", "hat gesprochen", "über + Akkusativ", "sprechen _____ [Akk]", "ярих", "to speak", "Sie spricht fließend Deutsch.", "Тэр германаар чөлөөтэй ярьдаг.", "She speaks German fluently."),
    ("lernen", "lernt", "lernte", "hat gelernt", "+ Akkusativ", "lernen + _____", "сурах", "to learn", "Wir lernen jeden Tag Grammatik.", "Бид өдөр бүр дүрэм сурдаг.", "We learn grammar every day."),
    ("arbeiten", "arbeitet", "arbeitete", "hat gearbeitet", "bei + Dativ", "arbeiten _____ [Dat]", "ажиллах", "to work", "Er arbeitet bei Siemens.", "Тэр Сименст ажилладаг.", "He works at Siemens."),
    ("verstehen", "versteht", "verstand", "hat verstanden", "+ Akkusativ", "verstehen + _____", "ойлгох", "to understand", "Ich verstehe den Satz nicht.", "Би энэ өгүүлбэрийг ойлгохгүй байна.", "I don't understand the sentence."),
    ("trinken", "trinkt", "trank", "hat getrunken", "+ Akkusativ", "trinken + _____", "уух", "to drink", "Er trinkt gerne Tee.", "Тэр цай уух дуртай.", "He likes drinking tea."),
    ("essen", "isst", "aß", "hat gegessen", "+ Akkusativ", "essen + _____", "идэх", "to eat", "Wir essen zu Mittag.", "Бид өдрийн хоолоо идэж байна.", "We are eating lunch."),
    ("kaufen", "kauft", "kaufte", "hat gekauft", "+ Akkusativ", "kaufen + _____", "худалдаж авах", "to buy", "Ich kaufe ein Ticket.", "Би тасалбар худалдаж авна.", "I buy a ticket."),
    ("gehen", "geht", "ging", "ist gegangen", "nach + Dativ", "gehen _____ [Dat]", "явах, алхах", "to go", "Wir gehen nach Hause.", "Бид гэр лүүгээ явж байна.", "We are going home."),
    ("fahren", "fährt", "fuhr", "ist gefahren", "mit + Dativ", "fahren _____ [Dat]", "унаагаар явах", "to drive/ride", "Ich fahre mit dem Bus.", "Би автобусаар явдаг.", "I ride by bus."),
    ("schreiben", "schreibt", "schrieb", "hat geschrieben", "+ Akkusativ", "schreiben + _____", "бичих", "to write", "Er schreibt eine E-Mail.", "Тэр захидал бичиж байна.", "He writes an email."),
    ("lesen", "liest", "las", "hat gelesen", "+ Akkusativ", "lesen + _____", "унших", "to read", "Sie liest ein Buch.", "Тэр ном уншиж байна.", "She reads a book."),
    ("helfen", "hilft", "half", "hat geholfen", "+ Dativ", "helfen + _____", "туслах", "to help", "Können Sie mir helfen?", "Та надад тусалж чадах уу?", "Can you help me?"),
    ("suchen", "sucht", "suchte", "hat gesucht", "+ Akkusativ", "suchen + _____", "хайх", "to search/look for", "Ich suche den Bahnhof.", "Би галт тэрэгний буудлыг хайж байна.", "I am looking for the station.")
]

de_a1_adj = [
    ("gut", "adjective", "сайн", "good", "Das Essen ist sehr gut.", "Хоол маш сайн байна.", "The food is very good."),
    ("groß", "adjective", "том", "big, tall", "Die Stadt ist sehr groß.", "Энэ хот маш том.", "The city is very big."),
    ("klein", "adjective", "жижиг", "small", "Das Zimmer ist klein aber gemütlich.", "Өрөө жижиг боловч тохилог.", "The room is small but cozy."),
    ("schön", "adjective", "сайхан, хөөрхөн", "beautiful", "Das Wetter ist heute schön.", "Өнөөдөр цаг агаар сайхан байна.", "The weather is beautiful today."),
    ("neu", "adjective", "шинэ", "new", "Ich habe ein neues Buch.", "Надад шинэ ном бий.", "I have a new book."),
    ("alt", "adjective", "хуучин, нас өндөр", "old", "Das Gebäude ist sehr alt.", "Энэ барилга маш хуучин.", "The building is very old."),
    ("schnell", "adjective", "хурдан", "fast", "Der Zug fährt schnell.", "Галт тэрэг хурдан явж байна.", "The train is traveling fast."),
    ("langsam", "adjective", "удаан", "slow", "Bitte sprechen Sie langsam.", "Удаан ярина уу.", "Please speak slowly."),
    ("teuer", "adjective", "үнэтэй", "expensive", "Das Hotel ist zu teuer.", "Энэ зочид буудал хэт үнэтэй байна.", "The hotel is too expensive."),
    ("billig", "adjective", "хямд", "cheap", "Das Ticket ist billig.", "Тасалбар хямдхан байна.", "The ticket is cheap.")
]

def make_de_list(nouns, verbs, adjs, level_name):
    items = []
    idx = 1
    for w, art, pl, pos, mn_trans, en_trans, disp, ex_de, ex_mn, ex_en in nouns:
        items.append({
            "id": f"de_{level_name.lower()}_{str(idx).zfill(4)}",
            "word": nfc(w),
            "article": art,
            "plural": pl,
            "display": nfc(disp),
            "pos": pos,
            "lang": "de",
            "level": level_name,
            "forms": None,
            "rektion": None,
            "prompt_front": nfc(f"_____ {w}, -? [N]"),
            "revealed_back": nfc(f"{art} {w}, {pl}"),
            "mn": nfc(mn_trans),
            "en": nfc(en_trans),
            "de": nfc(f"{art} {w}, {pl}"),
            "example_de": nfc(ex_de),
            "example_mn": nfc(ex_mn),
            "example_en": nfc(ex_en),
            "topic": "Alltag & Kommunikation"
        })
        idx += 1

    for inf, p3, pret, perf, rek, cl, mn_trans, en_trans, ex_de, ex_mn, ex_en in verbs:
        forms = f"{inf} | {p3} | {pret} | {perf}"
        items.append({
            "id": f"de_{level_name.lower()}_{str(idx).zfill(4)}",
            "word": nfc(inf),
            "article": None,
            "plural": None,
            "display": nfc(inf),
            "pos": "verb",
            "lang": "de",
            "level": level_name,
            "forms": nfc(forms),
            "rektion": nfc(rek),
            "prompt_front": nfc(cl),
            "revealed_back": nfc(f"{inf} {rek} ({forms})"),
            "mn": nfc(mn_trans),
            "en": nfc(en_trans),
            "de": nfc(inf),
            "example_de": nfc(ex_de),
            "example_mn": nfc(ex_mn),
            "example_en": nfc(ex_en),
            "topic": "Verben"
        })
        idx += 1

    for w, pos, mn_trans, en_trans, ex_de, ex_mn, ex_en in adjs:
        items.append({
            "id": f"de_{level_name.lower()}_{str(idx).zfill(4)}",
            "word": nfc(w),
            "article": None,
            "plural": None,
            "display": nfc(w),
            "pos": pos,
            "lang": "de",
            "level": level_name,
            "forms": None,
            "rektion": None,
            "prompt_front": nfc(w),
            "revealed_back": nfc(f"{w} [{pos}]"),
            "mn": nfc(mn_trans),
            "en": nfc(en_trans),
            "de": nfc(w),
            "example_de": nfc(ex_de),
            "example_mn": nfc(ex_mn),
            "example_en": nfc(ex_en),
            "topic": "Adjektive"
        })
        idx += 1
    return items

de_a1_all = make_de_list(de_a1, de_a1_verbs, de_a1_adj, "A1")
with open('data/de/vocab_a1.json', 'w', encoding='utf-8') as f:
    json.dump(de_a1_all, f, ensure_ascii=False, indent=2)
print("Saved data/de/vocab_a1.json:", len(de_a1_all))

# ==========================================
# GERMAN A2 VOCABULARY
# ==========================================
de_a2_nouns = [
    ("Termin", "der", "-e", "noun", "тогтсон цаг, уулзалт", "appointment", "der Termin, -e", "Ich habe morgen einen Termin beim Zahnarzt.", "Би маргааш шүдний эмчид цагтай.", "I have an appointment with the dentist tomorrow."),
    ("Rechnung", "die", "-en", "noun", "төлбөрийн баримт, тооцоо", "bill, invoice", "die Rechnung, -en", "Könnten wir bitte die Rechnung bekommen?", "Бид тооцоогоо авч болох уу?", "Could we please get the bill?"),
    ("Erfahrung", "die", "-en", "noun", "туршлага", "experience", "die Erfahrung, -en", "Er hat viel berufliche Erfahrung.", "Тэр мэргэжлийн их туршлагатай.", "He has a lot of professional experience."),
    ("Erlaubnis", "die", "-se", "noun", "зөвшөөрөл", "permission", "die Erlaubnis, -se", "Dafür brauchen Sie eine schriftliche Erlaubnis.", "Үүнд танд бичгээр өгсөн зөвшөөрөл хэрэгтэй.", "For that you need written permission."),
    ("Ausbildung", "die", "-en", "noun", "мэргэжлийн сургалт", "apprenticeship, vocational training", "die Ausbildung, -en", "Sie macht eine Ausbildung zur Krankenschwester.", "Тэр сувилагчийн мэргэжлээр сурч байна.", "She is doing vocational training to be a nurse."),
    ("Gesundheit", "die", "-", "noun", "эрүүл мэнд", "health", "die Gesundheit, -", "Gesundheit ist das Wichtigste im Leben.", "Эрүүл мэнд бол амьдралын хамгийн чухал зүйл.", "Health is the most important thing in life."),
    ("Umwelt", "die", "-", "noun", "хүрээлэн буй орчин", "environment", "die Umwelt, -", "Wir müssen die Umwelt besser schützen.", "Бид байгаль орчноо илүү хамгаалах ёстой.", "We must protect the environment better."),
    ("Meinung", "die", "-en", "noun", "санал бодол", "opinion", "die Meinung, -en", "Meiner Meinung nach ist das eine gute Idee.", "Миний бодлоор энэ бол сайн санаа.", "In my opinion that is a good idea."),
    ("Unfall", "der", "-e", "noun", "осол", "accident", "der Unfall, -e", "Auf der Autobahn gab es einen Unfall.", "Хурдны зам дээр осол гарсан.", "There was an accident on the highway."),
    ("Vertrag", "der", "-e", "noun", "гэрээ", "contract", "der Vertrag, -e", "Ich habe den Mietvertrag gestern unterschrieben.", "Би өчигдөр түрээсийн гэрээнд гарын үсэг зурсан.", "I signed the lease contract yesterday."),
    ("Urlaub", "der", "-e", "noun", "амралт", "vacation", "der Urlaub, -e", "Im Sommer mache ich zwei Wochen Urlaub.", "Зун би хоёр долоо хоног амарна.", "In summer I will take two weeks of vacation."),
    ("Kunde", "der", "-n", "noun", "үйлчлүүлэгч", "customer/client", "der Kunde, -n", "Der Kunde wünscht eine persönliche Beratung.", "Үйлчлүүлэгч ганцаарчилсан зөвлөгөө авахыг хүсэж байна.", "The customer requests personal advice."),
    ("Projekt", "das", "-e", "noun", "төсөл", "project", "das Projekt, -e", "Das Projekt soll bis Ende Mai fertig sein.", "Төсөл тавдугаар сарын эцэс гэхэд дуусах ёстой.", "The project should be finished by late May."),
    ("Kollege", "der", "-n", "noun", "хамтран ажиллагч", "colleague", "der Kollege, -n", "Mein Kollege hilft mir bei der Präsentation.", "Хамтран ажиллагч маань надад илтгэл дээр тусалж байна.", "My colleague helps me with the presentation."),
    ("Gepäck", "das", "-", "noun", "ачаа тээш", "luggage", "das Gepäck, -", "Haben Sie viel Gepäck dabei?", "Танд их ачаа тээш байгаа юу?", "Do you have a lot of luggage with you?"),
    ("Flughafen", "der", "-", "noun", "нисэх онгоцны буудал", "airport", "der Flughafen, -", "Wie komme ich am schnellsten zum Flughafen?", "Нисэх онгоцны буудал руу хэрхэн хамгийн хурдан хүрэх вэ?", "How do I get to the airport the fastest?")
]

de_a2_verbs = [
    ("teilnehmen", "nimmt teil", "nahm teil", "hat teilgenommen", "an + Dativ", "teilnehmen _____ [Dat]", "оролцох", "to participate", "Ich möchte an dem Deutschkurs teilnehmen.", "Би герман хэлний курст оролцмоор байна.", "I would like to participate in the German course."),
    ("gehören", "gehört", "gehörte", "hat gehört", "zu + Dativ", "gehören _____ [Dat]", "хамаарагдах, харьяалагдах", "to belong to", "Österreich gehört zur Europäischen Union.", "Австри улс Европын Холбоонд хамаарагддаг.", "Austria belongs to the European Union."),
    ("passen", "passt", "passte", "hat gepasst", "zu + Dativ", "passen _____ [Dat]", "тохирох", "to fit/match", "Die Farbe passt gut zu deiner Jacke.", "Өнгө нь чиний хүрэмтэй сайн тохирч байна.", "The color matches your jacket well."),
    ("interessieren", "interessiert", "interessierte", "hat interessiert", "sich für + Akkusativ", "sich interessieren _____ [Akk]", "сонирхох", "to be interested in", "Er interessiert sich sehr für klassische Musik.", "Тэр сонгодог хөгжмийг их сонирхдог.", "He is very interested in classical music."),
    ("freuen", "freut", "freute", "hat gefreut", "sich auf + Akkusativ", "sich freuen _____ [Akk]", "урьдчилан баярлах", "to look forward to", "Wir freuen uns schon auf den Urlaub.", "Бид амралтаа тэсэн ядан хүлээж байна.", "We are already looking forward to the holidays."),
    ("erinnern", "erinnert", "erinnerte", "hat erinnert", "sich an + Akkusativ", "sich erinnern _____ [Akk]", "санах", "to remember", "Ich kann mich nicht an seinen Namen erinnern.", "Би түүний нэрийг санахгүй байна.", "I cannot remember his name."),
    ("bitten", "bittet", "bat", "hat gebeten", "um + Akkusativ", "bitten _____ [Akk]", "гуйх, хүсэх", "to ask for", "Darf ich Sie um einen Gefallen bitten?", "Би танаас нэг тус гуйж болох уу?", "May I ask you for a favor?"),
    ("danken", "dankt", "dankte", "hat gedankt", "für + Akkusativ", "danken _____ [Akk]", "талархах", "to thank for", "Ich danke Ihnen für die schnelle Antwort.", "Шуурхай хариу өгсөнд тань баярлалаа.", "I thank you for the prompt reply."),
    ("warten", "wartet", "wartete", "hat gewartet", "auf + Akkusativ", "warten _____ [Akk]", "хүлээх", "to wait for", "Wir warten seit einer Stunde auf den Bus.", "Бид нэг цагийн турш автобус хүлээж байна.", "We have been waiting for the bus for an hour."),
    ("denken", "denkt", "dachte", "hat gedacht", "an + Akkusativ", "denken _____ [Akk]", "бодох", "to think of", "Ich muss oft an meine Heimat denken.", "Би эх орноо олонтаа боддог.", "I often have to think of my homeland.")
]

de_a2_adj = [
    ("wichtig", "adjective", "чухал", "important", "Pünktlichkeit ist in Deutschland sehr wichtig.", "Цаг баримтлах нь Германд маш чухал.", "Punctuality is very important in Germany."),
    ("schwierig", "adjective", "хэцүү, төвөгтэй", "difficult", "Die Prüfung war überraschend schwierig.", "Шалгалт гэнэтийн хэцүү байлаа.", "The exam was surprisingly difficult."),
    ("einfach", "adjective", "хялбар, энгийн", "simple, easy", "Die Erklärung war klar und einfach.", "Тайлбар нь тодорхой бөгөөд энгийн байсан.", "The explanation was clear and simple."),
    ("pünktlich", "adjective", "цаг баримталдаг", "punctual", "Er ist immer sehr pünktlich.", "Тэр үргэлж цаг маш сайн баримталдаг.", "He is always very punctual."),
    ("gefährlich", "adjective", "аюултай", "dangerous", "Auf den Straßen ist es bei Glatteis gefährlich.", "Халтиргаатай үед гудамж зам аюултай байдаг.", "It is dangerous on the streets when icy."),
    ("sauber", "adjective", "цэвэрхэн", "clean", "Das Zimmer muss gründlich sauber sein.", "Өрөө сайтар цэвэрлэгдсэн байх ёстой.", "The room must be thoroughly clean."),
    ("gesund", "adjective", "эрүүл", "healthy", "Frisches Gemüse ist sehr gesund.", "Шинэ ногоо эрүүл мэндэд маш тустай.", "Fresh vegetables are very healthy."),
    ("zufrieden", "adjective", "сэтгэл хангалуун", "satisfied", "Der Kunde war mit dem Service zufrieden.", "Үйлчлүүлэгч үйлчилгээнд сэтгэл хангалуун байв.", "The customer was satisfied with the service.")
]

de_a2_all = make_de_list(de_a2_nouns, de_a2_verbs, de_a2_adj, "A2")
with open('data/de/vocab_a2.json', 'w', encoding='utf-8') as f:
    json.dump(de_a2_all, f, ensure_ascii=False, indent=2)
print("Saved data/de/vocab_a2.json:", len(de_a2_all))

# ==========================================
# GERMAN B2 VOCABULARY
# ==========================================
de_b2_nouns = [
    ("Herausforderung", "die", "-en", "noun", "сорилт", "challenge", "die Herausforderung, -en", "Die Digitalisierung ist eine große Herausforderung für Unternehmen.", "Цахим шилжилт бол компаниудын хувьд том сорилт юм.", "Digitalization is a huge challenge for companies."),
    ("Auswirkung", "die", "-en", "noun", "нөлөө, үр дагавар", "impact, repercussion", "die Auswirkung, -en", "Die Klimakrise hat weltweite Auswirkungen.", "Уур амьсгалын хямрал дэлхий даяар үр дагавартай.", "The climate crisis has worldwide impacts."),
    ("Maßnahme", "die", "-n", "noun", "арга хэмжээ", "measure, action", "die Maßnahme, -n", "Die Regierung ergreift strenge Maßnahmen zur Krisenbewältigung.", "Засгийн газар хямралыг даван туулах хатуу арга хэмжээ авч байна.", "The government is taking strict measures for crisis management."),
    ("Zusammenhang", "der", "-e", "noun", "холбоо хамаарал", "correlation, context", "der Zusammenhang, -e", "In diesem Zusammenhang sollte man betonen...", "Энэ холбоо хамаарлын хүрээнд онцлох хэрэгтэй нь...", "In this context one should emphasize..."),
    ("Bereitschaft", "die", "-", "noun", "бэлэн байдал, дур сонирхол", "willingness, readiness", "die Bereitschaft, -", "Die Bereitschaft zur Veränderung ist entscheidend.", "Өөрчлөлтөд бэлэн байх нь шийдвэрлэх ач холбогдолтой.", "The readiness to change is crucial."),
    ("Kompetenz", "die", "-en", "noun", "мэргэжлийн чадвар, ур чадвар", "competence", "die Kompetenz, -en", "Soziale Kompetenzen sind im Berufsalltag unerlässlich.", "Нийгмийн харилцааны ур чадвар ажлын байранд зайлшгүй чухал.", "Social competencies are indispensable in professional life."),
    ("Einschätzung", "die", "-en", "noun", "үнэлэлт дүгнэлт", "assessment, appraisal", "die Einschätzung, -en", "Nach meiner Einschätzung ist der Markt stabil.", "Миний үнэлгээгээр зах зээл тогтвортой байна.", "According to my assessment the market is stable."),
    ("Voraussetzung", "die", "-en", "noun", "урьдчилсан нөхцөл", "prerequisite", "die Voraussetzung, -en", "Gute Sprachkenntnisse sind eine Grundvoraussetzung.", "Хэлний сайн мэдлэг бол үндсэн урьдчилсан нөхцөл юм.", "Good language skills are a fundamental prerequisite."),
    ("Verantwortung", "die", "-en", "noun", "хариуцлага", "responsibility", "die Verantwortung, -en", "Er übernimmt die volle Verantwortung für das Scheitern.", "Тэр бүтэлгүйтлийн бүх хариуцлагыг өөр дээрээ авч байна.", "He assumes full responsibility for the failure."),
    ("Konsequenz", "die", "-en", "noun", "үр дагавар, тууштай байдал", "consequence", "die Konsequenz, -en", "Jedes Handeln hat spürbare Konsequenzen.", "Үйлдэл бүр мэдрэгдэхүйц үр дагавартай байдаг.", "Every action has tangible consequences.")
]

de_b2_verbs = [
    ("beitragen", "trägt bei", "trug bei", "hat beigetragen", "zu + Dativ", "beitragen _____ [Dat]", "хувь нэмэр оруулах", "to contribute to", "Jeder Einzelne kann zum Umweltschutz beitragen.", "Хүн бүр байгаль хамгаалалд хувь нэмрээ оруулж чадна.", "Every individual can contribute to environmental protection."),
    ("zweifeln", "zweifelt", "zweifelte", "hat gezweifelt", "an + Dativ", "zweifeln _____ [Dat]", "эргэлзэх", "to doubt", "Ich zweifle nicht an seiner Integrität.", "Би түүний зарчимч чанарт огт эргэлзэхгүй байна.", "I do not doubt his integrity."),
    ("verzichten", "verzichtet", "verzichtete", "hat verzichtet", "auf + Akkusativ", "verzichten _____ [Akk]", "татгалзах", "to forego / dispense with", "Immer mehr Menschen verzichten auf Plastikverpackungen.", "Улам олон хүмүүс гялгар уутнаас татгалзаж байна.", "More and more people dispense with plastic packaging."),
    ("abhängen", "hängt ab", "hing ab", "hat abgehangen", "von + Dativ", "abhängen _____ [Dat]", "хамаарах", "to depend on", "Das Gelingen hängt von vielen Faktoren ab.", "Амжилт нь олон хүчин зүйлээс хамаарна.", "Success depends on many factors."),
    ("eingehen", "geht ein", "ging ein", "ist eingegangen", "auf + Akkusativ", "eingehen _____ [Akk]", "дэлгэрэнгүй авч үзэх, хариулах", "to address / attend to", "Der Referent ging ausführlich auf die Fragen des Publikums ein.", "Илтгэгч сонсогчдын асуултад дэлгэрэнгүй хариулав.", "The speaker addressed the audience's questions in detail."),
    ("hinweisen", "weist hin", "wies hin", "hat hingewiesen", "auf + Akkusativ", "hinweisen _____ [Akk]", "анхааруулах, чиглүүлэх", "to point out / indicate", "Die Statistik weist auf ein strukturelles Defizit hin.", "Статистик нь бүтцийн алдагдлыг илтгэж байна.", "The statistics point to a structural deficit."),
    ("verfügen", "verfügt", "verfügte", "hat verfügt", "über + Akkusativ", "verfügen _____ [Akk]", "эзэмших, мэдэлдээ байх", "to have at one's disposal", "Die Klinik verfügt über modernste Medizintechnik.", "Эмнэлэг нь хамгийн сүүлийн үеийн эмнэлгийн тоног төхөөрөмжтэй.", "The clinic disposes of cutting-edge medical equipment."),
    ("scheitern", "scheitert", "scheiterte", "ist gescheitert", "an + Dativ", "scheitern _____ [Dat]", "бүтэлгүйтэх", "to fail due to", "Die Verhandlungen scheiterten an finanziellen Differenzen.", "Хэлэлцээр санхүүгийн санал зөрөлдөөнөөс болж бүтэлгүйтэв.", "The negotiations failed due to financial differences.")
]

de_b2_adj = [
    ("nachhaltig", "adjective", "тогтвортой, урт хугацааны", "sustainable", "Nachhaltiges Wirtschaften ist das Gebot der Stunde.", "Тогтвортой эдийн засаг бол цаг үеийн шаардлага юм.", "Sustainable management is the order of the day."),
    ("wesentlich", "adjective", "гол, үндсэн", "essential, substantial", "Das spielt eine wesentliche Rolle bei der Entscheidung.", "Энэ нь шийдвэр гаргахад гол үүрэг гүйцэтгэнэ.", "That plays an essential role in the decision."),
    ("unabdingbar", "adjective", "зайлшгүй шаардлагатай", "indispensable", "Präzision ist in der Wissenschaft unabdingbar.", "Шинжлэх ухаанд нарийн нягт байдал зайлшгүй чухал.", "Precision is indispensable in science."),
    ("effizient", "adjective", "үр ашигтай", "efficient", "Wir brauchen effizientere Arbeitsabläufe.", "Бидэнд илүү үр ашигтай ажлын урсгал хэрэгтэй байна.", "We need more efficient workflows."),
    ("voraussichtlich", "adjective", "урьдчилсан байдлаар, магадлалтай", "prospective, expected", "Die Konferenz findet voraussichtlich im Oktober statt.", "Хуралт урьдчилсан байдлаар аравдугаар сард болно.", "The conference will presumably take place in October.")
]

de_b2_all = make_de_list(de_b2_nouns, de_b2_verbs, de_b2_adj, "B2")
with open('data/de/vocab_b2.json', 'w', encoding='utf-8') as f:
    json.dump(de_b2_all, f, ensure_ascii=False, indent=2)
print("Saved data/de/vocab_b2.json:", len(de_b2_all))

# ==========================================
# ENGLISH VOCABULARY GENERATOR (A1, A2, B1, B2)
# ==========================================
def make_en_items(word_tuples, level_name):
    items = []
    idx = 1
    for item in word_tuples:
        # Tuple format: (word, pos, forms, rektion, prompt_front, revealed_back, mn, de, ex_en, ex_mn, ex_de)
        w, pos, forms, rek, pf, rb, mn_t, de_t, ex_en, ex_mn, ex_de = item
        items.append({
            "id": f"en_{level_name.lower()}_{str(idx).zfill(4)}",
            "word": nfc(w),
            "pos": pos,
            "lang": "en",
            "level": level_name,
            "forms": nfc(forms) if forms else None,
            "rektion": nfc(rek) if rek else None,
            "prompt_front": nfc(pf),
            "revealed_back": nfc(rb),
            "mn": nfc(mn_t),
            "de": nfc(de_t),
            "en": nfc(w),
            "example_en": nfc(ex_en),
            "example_mn": nfc(ex_mn),
            "example_de": nfc(ex_de),
            "topic": "Core English"
        })
        idx += 1
    return items

# English A1
en_a1_data = [
    ("go", "verb", "go | went | gone", None, "go (V2 / V3?)", "go | went | gone", "явах", "gehen", "I go to work by train.", "Би ажилдаа галт тэргээр явдаг.", "Ich fahre mit dem Zug zur Arbeit."),
    ("come", "verb", "come | came | come", "from", "come _____ [prep]", "come from", "ирэх", "kommen", "Where do you come from?", "Та хаанаас ирсэн бэ?", "Woher kommst du?"),
    ("see", "verb", "see | saw | seen", None, "see (V2 / V3?)", "see | saw | seen", "харах", "sehen", "I see a bird in the tree.", "Би модон дээр шувуу харж байна.", "Ich sehe einen Vogel im Baum."),
    ("take", "verb", "take | took | taken", None, "take (V2 / V3?)", "take | took | taken", "авах, унах", "nehmen", "Take your umbrella with you.", "Шүхрээ авч яваарай.", "Nimm deinen Regenschirm mit."),
    ("make", "verb", "make | made | made", None, "make (V2 / V3?)", "make | made | made", "хийх, бүтээх", "machen", "She makes delicious coffee.", "Тэр амттай кофе хийдэг.", "Sie macht köstlichen Kaffee."),
    ("give", "verb", "give | gave | given", "to", "give _____ [prep]", "give to", "өгөх", "geben", "Give the book to John.", "Энэ номыг Жонд өгөөрэй.", "Gib das Buch an John."),
    ("say", "verb", "say | said | said", "to", "say (V2 / V3?)", "say | said | said", "хэлэх", "sagen", "What did he say to you?", "Тэр чамд юу гэж хэлсэн бэ?", "Was hat er zu dir gesagt?"),
    ("get", "verb", "get | got | got / gotten", "up", "get _____ (wake/rise)", "get up", "босох", "aufstehen", "I get up at six every morning.", "Би өглөө бүр зургаан цагт босдог.", "Ich stehe jeden Morgen um sechs auf."),
    ("eat", "verb", "eat | ate | eaten", None, "eat (V2 / V3?)", "eat | ate | eaten", "идэх", "essen", "We eat fresh apples daily.", "Бид өдөр бүр шинэ алим иддэг.", "Wir essen täglich frische Äpfel."),
    ("drink", "verb", "drink | drank | drunk", None, "drink (V2 / V3?)", "drink | drank | drunk", "уух", "trinken", "Drink plenty of water.", "Ус их уугаарай.", "Trinke viel Wasser."),
    ("buy", "verb", "buy | bought | bought", None, "buy (V2 / V3?)", "buy | bought | bought", "худалдаж авах", "kaufen", "He bought a new car yesterday.", "Тэр өчигдөр шинэ машин худалдаж авсан.", "Er hat gestern ein neues Auto gekauft."),
    ("child", "noun", "child -> children", None, "child (plural?) [N]", "child -> children", "хүүхэд", "das Kind, -er", "The children are playing outside.", "Хүүхдүүд гадаа тоглож байна.", "Die Kinder spielen draußen."),
    ("person", "noun", "person -> people", None, "person (plural?) [N]", "person -> people", "хүн", "die Person, -en", "There are ten people in the room.", "Өрөөнд арван хүн байна.", "Es sind zehn Personen im Raum."),
    ("water", "noun", None, None, "water [N]", "water (uncountable)", "ус", "das Wasser", "A glass of cold water, please.", "Нэг аяга хүйтэн ус өгөөч.", "Ein Glas kaltes Wasser, bitte."),
    ("house", "noun", None, None, "house [N]", "house, houses", "байшин", "das Haus, -er", "Their house is near the station.", "Тэдний байшин буудлын ойролцоо байдаг.", "Ihr Haus ist in der Nähe des Bahnhofs.")
]

en_a1_all = make_en_items(en_a1_data, "A1")
with open('data/en/vocab_a1.json', 'w', encoding='utf-8') as f:
    json.dump(en_a1_all, f, ensure_ascii=False, indent=2)
print("Saved data/en/vocab_a1.json:", len(en_a1_all))

# English A2
en_a2_data = [
    ("listen", "verb", "listen | listened | listened", "listen to", "listen _____ [prep]", "listen to", "сонсох", "zuhören", "Listen carefully to the instructions.", "Зааврыг анхааралтай сонсоорой.", "Hör den Anweisungen aufmerksam zu."),
    ("wait", "verb", "wait | waited | waited", "wait for", "wait _____ [prep]", "wait for", "хүлээх", "warten auf", "I am waiting for the bus.", "Би автобус хүлээж байна.", "Ich warte auf den Bus."),
    ("look for", "verb", "look | looked | looked", "look for", "look _____ (search)", "look for", "хайх", "suchen nach", "I am looking for my keys.", "Би түлхүүрээ хайж байна.", "Ich suche nach meinen Schlüsseln."),
    ("look after", "verb", "look | looked | looked", "look after", "look _____ (take care of)", "look after", "асрах, халамжлах", "sich kümmern um", "Can you look after my dog?", "Та миний нохойг харж өгч чадах уу?", "Kannst du auf meinen Hund aufpassen?"),
    ("arrive", "verb", "arrive | arrived | arrived", "arrive at/in", "arrive _____ [prep]", "arrive at / in", "хүрэлцэн ирэх", "ankommen", "We arrived at the airport on time.", "Бид онгоцны буудалд цагтаа ирсэн.", "Wir sind pünktlich am Flughafen angekommen."),
    ("choose", "verb", "choose | chose | chosen", None, "choose (V2 / V3?)", "choose | chose | chosen", "сонгох", "wählen", "She chose the blue shirt.", "Тэр цэнхэр цамцыг сонгосон.", "Sie hat das blaue Hemd gewählt."),
    ("bring", "verb", "bring | brought | brought", None, "bring (V2 / V3?)", "bring | brought | brought", "авчрах", "bringen", "Please bring your passport.", "Паспортоо авч ирнэ үү.", "Bitte bring deinen Reisepass mit."),
    ("leave", "verb", "leave | left | left", "for", "leave (V2 / V3?)", "leave | left | left", "орхих, явах", "verlassen", "The train left ten minutes ago.", "Галт тэрэг арван минутын өмнө хөдөлсөн.", "Der Zug ist vor zehn Minuten abgefahren."),
    ("meet", "verb", "meet | met | met", "with", "meet (V2 / V3?)", "meet | met | met", "уулзах", "treffen", "Let us meet at the café.", "Кафэд уулзъя.", "Lass uns im Café treffen."),
    ("turn off", "verb", "turn | turned | turned", "turn off", "turn _____ (switch off)", "turn off", "унтраах", "ausschalten", "Please turn off the lights.", "Гэрлээ унтраана уу.", "Bitte schalte das Licht aus."),
    ("interested in", "adjective", None, "in", "interested _____ [prep]", "interested in", "сонирхдог", "interessiert an", "Are you interested in photography?", "Та гэрэл зураг сонирхдог уу?", "Bist du an Fotografie interessiert?"),
    ("afraid of", "adjective", None, "of", "afraid _____ [prep]", "afraid of", "айна", "Angst haben vor", "She is afraid of spiders.", "Тэр аалзнаас айдаг.", "Sie hat Angst vor Spinnen."),
    ("good at", "adjective", None, "at", "good _____ [prep]", "good at", "чадвартай", "gut in", "He is very good at math.", "Тэр математикт их сайн.", "Er ist sehr gut in Mathe.")
]

en_a2_all = make_en_items(en_a2_data, "A2")
with open('data/en/vocab_a2.json', 'w', encoding='utf-8') as f:
    json.dump(en_a2_all, f, ensure_ascii=False, indent=2)
print("Saved data/en/vocab_a2.json:", len(en_a2_all))

# English B1
en_b1_data = [
    ("depend on", "verb", "depend | depended | depended", "depend on", "depend _____ [prep]", "depend on", "хамаарах, найдах", "abhängen von", "Our success depends on team collaboration.", "Бидний амжилт багийн хамтын ажиллагаанаас хамаарна.", "Unser Erfolg hängt von der Teamarbeit ab."),
    ("apply for", "verb", "apply | applied | applied", "apply for", "apply _____ [prep]", "apply for", "өргөдөл гаргах", "sich bewerben um", "She decided to apply for the scholarship.", "Тэр тэтгэлэгт өргөдөл гаргахаар шийдсэн.", "Sie beschloss, sich um das Stipendium zu bewerben."),
    ("give up", "verb", "give | gave | given", "give up", "give _____ (surrender)", "give up", "бууж өгөх, орхих", "aufgeben", "Never give up on your dreams.", "Мөрөөдлөө хэзээ ч бүү орхи.", "Gib deine Träume niemals auf."),
    ("carry out", "verb", "carry | carried | carried", "carry out", "carry _____ (execute)", "carry out", "хэрэгжүүлэх, гүйцэтгэх", "durchführen", "The scientists carried out several experiments.", "Эрдэмтэд хэд хэдэн туршилт гүйцэтгэсэн.", "Die Wissenschaftler führten mehrere Experimente durch."),
    ("deal with", "verb", "deal | dealt | dealt", "deal with", "deal _____ [prep]", "deal with", "шийдвэрлэх, учрыг олох", "umgehen mit", "We must deal with this customer complaint immediately.", "Бид энэ гомдлыг нэн даруй шийдвэрлэх ёстой.", "Wir müssen uns sofort mit dieser Kundenbeschwerde befassen."),
    ("suffer from", "verb", "suffer | suffered | suffered", "suffer from", "suffer _____ [prep]", "suffer from", "өвдөх, шаналах", "leiden an", "Many people suffer from insomnia.", "Олон хүмүүс нойргүйдлээр шаналдаг.", "Viele Menschen leiden an Schlaflosigkeit."),
    ("look forward to", "verb", "look | looked | looked", "look forward to", "look forward _____ [prep]", "look forward to (+ -ing)", "тэсэн ядан хүлээх", "sich freuen auf", "I look forward to hearing from you soon.", "Танаас удахгүй хариу сонсохыг тэсэн ядан хүлээж байна.", "Ich freue mich darauf, bald von Ihnen zu hören."),
    ("put off", "verb", "put | put | put", "put off", "put _____ (postpone)", "put off", "хойшлуулах", "verschieben", "Never put off until tomorrow what you can do today.", "Өнөөдөр хийж чадах зүйлээ маргааш хүртэл бүү хойшлуул.", "Verschiebe nicht auf morgen, was du heute kannst besorgen."),
    ("run out of", "verb", "run | ran | run", "run out of", "run out _____ [prep]", "run out of", "дуусах", "ausgehen (Vorrat)", "We have run out of printer paper.", "Принтерийн цаас дуусчихлаа.", "Uns ist das Druckerpapier ausgegangen."),
    ("congratulate on", "verb", "congratulate | congratulated | congratulated", "congratulate on", "congratulate _____ [prep]", "congratulate on", "баяр хүргэх", "gratulieren zu", "I congratulate you on passing the exam.", "Шалгалтаа амжилттай өгсөнд баяр хүргэе.", "Ich gratuliere dir zum Bestehen der Prüfung."),
    ("responsible for", "adjective", None, "for", "responsible _____ [prep]", "responsible for", "хариуцдаг", "verantwortlich für", "Who is responsible for project management?", "Төслийн удирдлагыг хэн хариуцаж байгаа вэ?", "Wer ist für das Projektmanagement verantwortlich?"),
    ("aware of", "adjective", None, "of", "aware _____ [prep]", "aware of", "мэддэг, ухамсарладаг", "sich bewusst sein", "Are you aware of the new safety guidelines?", "Та шинэ аюулгүй байдлын удирдамжийг мэдэж байгаа юу?", "Sind Sie sich der neuen Sicherheitsrichtlinien bewusst?")
]

en_b1_all = make_en_items(en_b1_data, "B1")
with open('data/en/vocab_b1.json', 'w', encoding='utf-8') as f:
    json.dump(en_b1_all, f, ensure_ascii=False, indent=2)
print("Saved data/en/vocab_b1.json:", len(en_b1_all))

# English B2
en_b2_data = [
    ("cope with", "verb", "cope | coped | coped", "cope with", "cope _____ [prep]", "cope with", "даван туулах, учрыг нь олох", "zurechtkommen mit", "She learned how to cope with high-stress situations.", "Тэр өндөр стресстэй нөхцөл байдлыг хэрхэн даван туулахыг сурсан.", "Sie hat gelernt, mit stressigen Situationen umzugehen."),
    ("contribute to", "verb", "contribute | contributed | contributed", "contribute to", "contribute _____ [prep]", "contribute to", "хувь нэмэр оруулах", "beitragen zu", "Regular exercise contributes to long-term well-being.", "Тогтмол дасгал хөдөлгөөн урт хугацааны сайн сайханд хувь нэмэр оруулдаг.", "Regelmäßige Bewegung trägt zum langfristigen Wohlbefinden bei."),
    ("come up with", "verb", "come | came | come", "come up with", "come up _____ (devise/invent)", "come up with", "санаа сэдэх, олох", "sich ausdenken / finden", "The team came up with a groundbreaking solution.", "Баг цоо шинэ, шинэлэг шийдэл олсон.", "Das Team hat eine bahnbrechende Lösung entwickelt."),
    ("account for", "verb", "account | accounted | accounted", "account for", "account _____ (explain/constitute)", "account for", "тайлбарлах, эзлэх", "ausmachen / erklären", "Renewable energy accounts for forty percent of total output.", "Сэргээгдэх эрчим хүч нийт бүтээгдэхүүний дөчин хувийг эзэлдэг.", "Erneuerbare Energien machen vierzig Prozent der Gesamtleistung aus."),
    ("bring about", "verb", "bring | brought | brought", "bring about", "bring _____ (cause/generate)", "bring about", "үүсгэх, бий болгох", "hervorrufen / bewirken", "Technological disruption brings about fundamental changes.", "Технологийн шинэчлэл суурь өөрчлөлтүүдийг авчирдаг.", "Technologischer Wandel bringt grundlegende Veränderungen mit sich."),
    ("rely on", "verb", "rely | relied | relied", "rely on", "rely _____ [prep]", "rely on", "найдах, түших", "sich verlassen auf", "You can always rely on her professionalism.", "Та түүний мэргэжлийн чадварт үргэлж найдаж болно.", "Du kannst dich immer auf ihre Professionalität verlassen."),
    ("pave the way for", "phrase", None, "for", "pave the way _____ [prep]", "pave the way for", "замыг засах, нөхцөл бүрдүүлэх", "den Weg bereiten für", "This discovery paves the way for advanced therapies.", "Энэхүү нээлт нь дэвшилтэт эмчилгээний замыг засдаг.", "Diese Entdeckung bereitet den Weg für fortschrittliche Therapien."),
    ("compatible with", "adjective", None, "with", "compatible _____ [prep]", "compatible with", "нийцтэй, тохирох", "kompatibel mit", "The software is fully compatible with existing systems.", "Энэ программ хангамж одоо байгаа системүүдтэй бүрэн нийцдэг.", "Die Software ist voll kompatibel mit bestehenden Systemen."),
    ("inherent in", "adjective", None, "in", "inherent _____ [prep]", "inherent in", "угийн шинж чанартай", "innewohnend", "Risk is an inherent factor in every investment.", "Эрсдэл бол хөрөнгө оруулалт бүрт байдаг угийн шинж чанар юм.", "Risiko ist jeder Investition inhärent.")
]

en_b2_all = make_en_items(en_b2_data, "B2")
with open('data/en/vocab_b2.json', 'w', encoding='utf-8') as f:
    json.dump(en_b2_all, f, ensure_ascii=False, indent=2)
print("Saved data/en/vocab_b2.json:", len(en_b2_all))
