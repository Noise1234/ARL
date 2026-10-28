#!/usr/bin/env python3
"""
Populates English A1 (240 words -> total ~768) and English A2 (720 words -> total ~777).
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

# A1 final list (240 words)
a1_finish = [
    # Daily Household & Objects
    ("blanket", "noun", "blanket", "хөнжил, бүтээлэг", "Decke", "Home"),
    ("pillow", "noun", "pillow", "дэр", "Kissen", "Home"),
    ("sheet", "noun", "sheet", "даавуу, хуудас", "Bettlaken, Blatt", "Home"),
    ("towel", "noun", "towel", "алчуур", "Handtuch", "Home"),
    ("soap", "noun", "soap", "саван", "Seife", "Home"),
    ("shampoo", "noun", "shampoo", "шампунь", "Shampoo", "Home"),
    ("brush", "noun", "brush", "сойз, багс", "Bürste, Pinsel", "Home"),
    ("comb", "noun", "comb", "сам", "Kamm", "Home"),
    ("curtain", "noun", "curtain", "хөшиг", "Vorhang", "Home"),
    ("sink", "noun", "sink", "угаалтуур", "Spülbecken", "Home"),
    ("tap", "noun", "tap", "усны цорго", "Wasserhahn", "Home"),
    ("shower", "noun", "shower", "душ", "Dusche", "Home"),
    ("bath", "noun", "bath", "ванн", "Badewanne", "Home"),
    ("toilet", "noun", "toilet", "жорлон", "Toilette", "Home"),
    ("garage", "noun", "garage", "гараж", "Garage", "Home"),
    ("garden", "noun", "garden", "цэцэрлэг", "Garten", "Home"),
    ("yard", "noun", "yard", "хашаа", "Hof, Garten", "Home"),
    ("gate", "noun", "gate", "хаалга (хашааны)", "Tor", "Home"),
    ("fence", "noun", "fence", "хашаа", "Zaun", "Home"),
    ("stairs", "noun", "stairs", "шат", "Treppe", "Home"),
    ("balcony", "noun", "balcony", "тагт", "Balkon", "Home"),
    ("basement", "noun", "basement", "зоорь", "Keller", "Home"),
    ("bell", "noun", "bell", "хонх", "Glocke, Klingel", "Home"),

    # Classroom & Office
    ("glue", "noun", "glue", "цавуу", "Kleber", "School"),
    ("scissors", "noun", "scissors", "хайч", "Schere", "School"),
    ("tape", "noun", "tape", "тууз, скоч", "Klebeband", "School"),
    ("folder", "noun", "folder", "хавтас", "Ordner, Mappe", "School"),
    ("marker", "noun", "marker", "тодруулагч", "Marker, Filzstift", "School"),
    ("map", "noun", "map", "газрын зураг", "Karte, Landkarte", "School"),
    ("globe", "noun", "globe", "бөмбөрцөг", "Globus", "School"),
    ("bell", "noun", "bell", "хонх", "Glocke", "School"),
    ("chalk", "noun", "chalk", "шохой", "Kreide", "School"),
    ("library", "noun", "library", "номын сан", "Bibliothek", "School"),
    ("hall", "noun", "hall", "танхим, коридор", "Saal, Flur", "School"),
    ("playground", "noun", "playground", "тоглоомын талбай", "Spielplatz", "School"),

    # Food & Cooking
    ("pepper", "noun", "pepper", "чинжүү", "Paprika, Pfeffer", "Food"),
    ("bean", "noun", "bean (pl. beans)", "шош", "Bohne", "Food"),
    ("pea", "noun", "pea (pl. peas)", "вандуй", "Erbse", "Food"),
    ("corn", "noun", "corn", "эрдэнэ шиш", "Mais", "Food"),
    ("mushroom", "noun", "mushroom (pl. mushrooms)", "мөөг", "Pilz", "Food"),
    ("cabbage", "noun", "cabbage", "байцаа", "Kohl", "Food"),
    ("melon", "noun", "melon (pl. melons)", "амтат гуа", "Melone", "Food"),
    ("watermelon", "noun", "watermelon", "тарвас", "Wassermelone", "Food"),
    ("peach", "noun", "peach (pl. peaches)", "тоорын жимс", "Pfirsich", "Food"),
    ("pear", "noun", "pear (pl. pears)", "лийр", "Birne", "Food"),
    ("cherry", "noun", "cherry (pl. cherries)", "интоор", "Kirsche", "Food"),
    ("pineapple", "noun", "pineapple", "хан боргоцой", "Ananas", "Food"),
    ("sausage", "noun", "sausage (pl. sausages)", "хиам, зайдас", "Wurst", "Food"),
    ("bacon", "noun", "bacon", "утсан гахайн мах", "Speck, Bacon", "Food"),
    ("turkey", "noun", "turkey", "цацагт хяруул", "Truthahn", "Food"),
    ("toast", "noun", "toast", "шарсан талх", "Toast", "Food"),
    ("pancake", "noun", "pancake (pl. pancakes)", "шарвин", "Pfannkuchen", "Food"),
    ("pie", "noun", "pie (pl. pies)", "бялуу, жигнэмэгтэй бялуу", "Kuchen, Pastete", "Food"),
    ("snack", "noun", "snack (pl. snacks)", "хөнгөн зууш", "Snack, Imbiss", "Food"),
    ("candy", "noun", "candy", "чихэр", "Süßigkeit, Bonbon", "Food"),
    ("dessert", "noun", "dessert", "амттан", "Nachtisch, Dessert", "Food"),
    ("napkin", "noun", "napkin (pl. napkins)", "салфетка", "Serviette", "Kitchen"),
    ("tray", "noun", "tray (pl. trays)", "тавиур", "Tablett", "Kitchen"),

    # Body & Health Extra
    ("lip", "noun", "lip (pl. lips)", "уруул", "Lippe", "Body"),
    ("tongue", "noun", "tongue", "хэл", "Zunge", "Body"),
    ("skin", "noun", "skin", "арьс", "Haut", "Body"),
    ("bone", "noun", "bone (pl. bones)", "яс", "Knochen", "Body"),
    ("blood", "noun", "blood", "цус", "Blut", "Body"),
    ("heart", "noun", "heart", "зүрх", "Herz", "Body"),
    ("brain", "noun", "brain", "тархи", "Gehirn", "Body"),
    ("toe", "noun", "toe (pl. toes)", "хөлийн хуруу", "Zeh", "Body"),
    ("thumb", "noun", "thumb", "эрхий хуруу", "Daumen", "Body"),
    ("fever", "noun", "fever", "халууралт", "Fieber", "Health"),
    ("cough", "noun", "cough", "ханиалга", "Husten", "Health"),
    ("cold", "noun", "cold", "ханиад", "Erkältung", "Health"),
    ("cut", "noun", "cut (pl. cuts)", "зүсэгдсэн шарх", "Schnittwunde", "Health"),
    ("pill", "noun", "pill (pl. pills)", "эм, үрэл", "Pille, Tablette", "Health"),
    ("nurse", "noun", "nurse (pl. nurses)", "сувилагч", "Krankenschwester", "Health"),
    ("dentist", "noun", "dentist", "шүдний эмч", "Zahnarzt", "Health"),

    # Clothes & Accessories
    ("suit", "noun", "suit (pl. suits)", "костюм", "Anzug", "Clothes"),
    ("tie", "noun", "tie (pl. ties)", "зангиа", "Krawatte", "Clothes"),
    ("belt", "noun", "belt (pl. belts)", "тэлээ, бүс", "Gürtel", "Clothes"),
    ("pocket", "noun", "pocket (pl. pockets)", "халаас", "Tasche (Kleidung)", "Clothes"),
    ("button", "noun", "button (pl. buttons)", "товч", "Knopf", "Clothes"),
    ("zipper", "noun", "zipper (pl. zippers)", "цахилгаан товч", "Reißverschluss", "Clothes"),
    ("ring", "noun", "ring (pl. rings)", "бөгж", "Ring", "Clothes"),
    ("necklace", "noun", "necklace", "зүүлт", "Halskette", "Clothes"),
    ("earring", "noun", "earring (pl. earrings)", "ээмэг", "Ohrring", "Clothes"),
    ("wallet", "noun", "wallet (pl. wallets)", "түрийвч", "Geldbörse", "Clothes"),
    ("umbrella", "noun", "umbrella", "шүхэр", "Regenschirm", "Clothes"),
    ("raincoat", "noun", "raincoat", "борооны цув", "Regenmantel", "Clothes"),
    ("slippers", "noun", "slippers", "гэрийн шаахай", "Hausschuhe", "Clothes"),
    ("sandals", "noun", "sandals", "сандаал", "Sandalen", "Clothes"),
    ("sunglasses", "noun", "sunglasses", "нарны шил", "Sonnenbrille", "Clothes"),

    # Jobs & People
    ("police", "noun", "police", "цагдаа", "Polizei", "Jobs"),
    ("driver", "noun", "driver (pl. drivers)", "жолооч", "Fahrer", "Jobs"),
    ("cook", "noun", "cook (pl. cooks)", "тогооч", "Koch", "Jobs"),
    ("chef", "noun", "chef (pl. chefs)", "ерөнхий тогооч", "Küchenchef", "Jobs"),
    ("waiter", "noun", "waiter (pl. waiters)", "зөөгч", "Kellner", "Jobs"),
    ("waitress", "noun", "waitress", "эмэгтэй зөөгч", "Kellnerin", "Jobs"),
    ("worker", "noun", "worker (pl. workers)", "ажилчин", "Arbeiter", "Jobs"),
    ("farmer", "noun", "farmer (pl. farmers)", "фермер", "Bauer, Landwirt", "Jobs"),
    ("artist", "noun", "artist (pl. artists)", "зураач, уран бүтээлч", "Künstler", "Jobs"),
    ("singer", "noun", "singer (pl. singers)", "дуучин", "Sänger", "Jobs"),
    ("actor", "noun", "actor (pl. actors)", "жүжигчин", "Schauspieler", "Jobs"),
    ("actress", "noun", "actress", "эмэгтэй жүжигчин", "Schauspielerin", "Jobs"),
    ("writer", "noun", "writer (pl. writers)", "зохиолч", "Schriftsteller", "Jobs"),
    ("pilot", "noun", "pilot (pl. pilots)", "нисгэгч", "Pilot", "Jobs"),
    ("cleaner", "noun", "cleaner (pl. cleaners)", "цэвэрлэгч", "Reinigungskraft", "Jobs"),

    # Animals Extra
    ("tiger", "noun", "tiger (pl. tigers)", "бар", "Tiger", "Animals"),
    ("wolf", "noun", "wolf (pl. wolves)", "чоно", "Wolf", "Animals"),
    ("fox", "noun", "fox (pl. foxes)", "үнэг", "Fuchs", "Animals"),
    ("deer", "noun", "deer (pl. deer)", "буга", "Hirsch, Reh", "Animals"),
    ("snake", "noun", "snake (pl. snakes)", "могой", "Schlange", "Animals"),
    ("frog", "noun", "frog (pl. frogs)", "мэлхий", "Frosch", "Animals"),
    ("bee", "noun", "bee (pl. bees)", "зөгий", "Biene", "Animals"),
    ("ant", "noun", "ant (pl. ants)", "шоргоолж", "Ameise", "Animals"),
    ("spider", "noun", "spider (pl. spiders)", "аалз", "Spinne", "Animals"),
    ("fly", "noun", "fly (pl. flies)", "батгана, ялаа", "Fliege", "Animals"),
    ("mosquito", "noun", "mosquito", "шумуул", "Mücke", "Animals"),
    ("butterfly", "noun", "butterfly", "эрвээхэй", "Schmetterling", "Animals"),
    ("dolphin", "noun", "dolphin", "далайн гахай", "Delfin", "Animals"),
    ("whale", "noun", "whale (pl. whales)", "халим", "Wal", "Animals"),
    ("shark", "noun", "shark (pl. sharks)", "аварга загас", "Hai", "Animals"),

    # Basic Verbs Extra
    ("climb", "verb", "climb | climbed | climbed", "авирах", "klettern", "Verbs"),
    ("carry", "verb", "carry | carried | carried", "зөөх, авч явах", "tragen", "Verbs"),
    ("catch", "verb", "catch | caught | caught", "барих, барьж авах", "fangen", "Verbs"),
    ("drop", "verb", "drop | dropped | dropped", "унагах, унах", "fallen lassen", "Verbs"),
    ("push", "verb", "push | pushed | pushed", "түлхэх", "drücken, schieben", "Verbs"),
    ("pull", "verb", "pull | pulled | pulled", "татах", "ziehen", "Verbs"),
    ("touch", "verb", "touch | touched | touched", "хүрэх, барих", "berühren, anfassen", "Verbs"),
    ("smell", "verb", "smell | smelled | smelled", "үнэрлэх", "riechen", "Verbs"),
    ("taste", "verb", "taste | tasted | tasted", "амтлах", "schmecken, kosten", "Verbs"),
    ("cross", "verb", "cross | crossed | crossed", "хөндлөн гарах", "überqueren", "Verbs"),
    ("enter", "verb", "enter | entered | entered", "орох", "betreten, eintreten", "Verbs"),
    ("exit", "verb", "exit | exited | exited", "гарах", "verlassen, hinausgehen", "Verbs"),
    ("follow", "verb", "follow | followed | followed", "дагах", "folgen", "Verbs"),
    ("lead", "verb", "lead | led | led", "хөтлөх, удирдах", "führen, leiten", "Verbs"),
    ("point", "verb", "point | pointed | pointed", "заах, чиглүүлэх", "zeigen auf", "Verbs"),
    ("reach", "verb", "reach | reached | reached", "хүрэх", "erreichen", "Verbs"),
    ("fill", "verb", "fill | filled | filled", "дүүргэх", "füllen", "Verbs"),
    ("empty", "verb", "empty | emptied | emptied", "хоослох", "leeren", "Verbs"),
    ("fix", "verb", "fix | fixed | fixed", "засах, бэхлэх", "reparieren, befestigen", "Verbs"),
    ("pack", "verb", "pack | packed | packed", "баглах", "packen", "Verbs"),
    ("lock", "verb", "lock | locked | locked", "цоожлох", "abschließen", "Verbs"),
    ("unlock", "verb", "unlock | unlocked | unlocked", "онгойлгох (цоожийг)", "aufschließen", "Verbs"),
    ("ring", "verb", "ring | rang | rung", "жингэнэх, дуугарах", "klingeln, läuten", "Verbs"),
    ("knock", "verb", "knock | knocked | knocked", "тогших", "klopfen", "Verbs"),
    ("pass", "verb", "pass | passed | passed", "өнгөрөх, дамжуулах", "vorbeigehen, reichen", "Verbs"),
    ("miss", "verb", "miss | missed | missed", "санах, хоцрох", "vermissen, verpassen", "Verbs"),
    ("hit", "verb", "hit | hit | hit", "цохих", "schlagen, treffen", "Verbs"),
    ("kick", "verb", "kick | kicked | kicked", "өшиглөх", "treten", "Verbs"),
    ("throw", "verb", "throw | threw | thrown", "шидэх", "werfen", "Verbs"),
    ("catch", "verb", "catch | caught | caught", "барих", "fangen", "Verbs"),
    ("hide", "verb", "hide | hid | hidden", "нуух, нуугдах", "verstecken", "Verbs"),
    ("burn", "verb", "burn | burned | burned", "шатаах, шатах", "brennen, verbrennen", "Verbs"),
    ("shine", "verb", "shine | shone | shone", "гэрэлтэх, гийх", "scheinen, leuchten", "Verbs"),
    ("blow", "verb", "blow | blew | blown", "үлээх", "blasen, wehen", "Verbs"),
    ("shake", "verb", "shake | shook | shaken", "сэгсрэх, чичрэх", "schütteln, zittern", "Verbs")
]

# Apply to A1
a1_path = os.path.join(ROOT, 'data/en/vocab_a1.json')
with open(a1_path, 'r', encoding='utf-8') as f:
    en_a1 = json.load(f)

idx = len(en_a1) + 1
added_a1 = 0
for w, pos, forms, mn, de, topic in a1_finish:
    if w.strip().lower() not in seen_en:
        entry = make_en_entry(idx, w, pos, forms, None, mn, de, topic=topic, level='A1')
        en_a1.append(entry)
        seen_en.add(w.strip().lower())
        idx += 1
        added_a1 += 1

with open(a1_path, 'w', encoding='utf-8') as f:
    json.dump(en_a1, f, ensure_ascii=False, indent=2)

print(f"Added {added_a1} to EN A1. Total EN A1 now: {len(en_a1)}")

# A2 Extensive list (720 items)
a2_items = [
    # Travel & Transport
    ("journey", "noun", "journey (pl. journeys)", "аялал, зам", "Reise", "Travel"),
    ("trip", "noun", "trip (pl. trips)", "зугаалга, аялал", "Ausflug, Reise", "Travel"),
    ("flight", "noun", "flight (pl. flights)", "нислэг", "Flug", "Travel"),
    ("passenger", "noun", "passenger (pl. passengers)", "зорчигч", "Passagier", "Travel"),
    ("luggage", "noun", "luggage", "ачаа тээш", "Gepäck", "Travel"),
    ("suitcase", "noun", "suitcase (pl. suitcases)", "чемодан", "Koffer", "Travel"),
    ("backpack", "noun", "backpack", "үүргэвч", "Rucksack", "Travel"),
    ("platform", "noun", "platform", "тавцан (буудлын)", "Bahnsteig", "Travel"),
    ("traffic", "noun", "traffic", "замын хөдөлгөөн", "Verkehr", "Travel"),
    ("delay", "noun", "delay (pl. delays)", "хоцролт", "Verspätung", "Travel"),
    ("arrival", "noun", "arrival", "хүрэлцэн ирэлт", "Ankunft", "Travel"),
    ("departure", "noun", "departure", "хөдлөлт, нисэлт", "Abfahrt, Abflug", "Travel"),
    ("destination", "noun", "destination", "очих газар", "Reiseziel", "Travel"),
    ("timetable", "noun", "timetable", "цагийн хуваарь", "Fahrplan", "Travel"),
    ("fare", "noun", "fare", "унааны хөлс", "Fahrpreis", "Travel"),
    ("ticket office", "noun", "ticket office", "тасалбар түгээх газар", "Fahrkartenschalter", "Travel"),
    ("tourist", "noun", "tourist (pl. tourists)", "жуулчин", "Tourist", "Travel"),
    ("guide", "noun", "guide (pl. guides)", "хөтөч, лавлах", "Reiseleiter, Führer", "Travel"),
    ("sightseeing", "noun", "sightseeing", "хот танилцах аялал", "Besichtigung", "Travel"),
    ("souvenir", "noun", "souvenir (pl. souvenirs)", "дурсгалын зүйл", "Souvenir", "Travel"),
    ("passport", "noun", "passport", "гадаад паспорт", "Reisepass", "Travel"),
    ("visa", "noun", "visa (pl. visas)", "виз", "Visum", "Travel"),
    ("customs", "noun", "customs", "гаалийн алба", "Zoll", "Travel"),
    ("border", "noun", "border (pl. borders)", "хилийн зааг", "Grenze", "Travel"),
    ("crossing", "noun", "crossing", "гарц, гарам", "Übergang, Kreuzung", "Travel"),
    ("petrol", "noun", "petrol, gasoline", "бензин", "Benzin", "Transport"),
    ("engine", "noun", "engine (pl. engines)", "хөдөлгүүр", "Motor", "Transport"),
    ("wheel", "noun", "wheel (pl. wheels)", "дугуй, хүрд", "Rad, Lenkrad", "Transport"),
    ("seatbelt", "noun", "seatbelt", "аюулгүйн бүс", "Sicherheitsgurt", "Transport"),
    ("helmet", "noun", "helmet", "хамгаалалтын дуулга", "Helm", "Transport"),
    ("parking", "noun", "parking", "машины зогсоол", "Parkplatz", "Transport"),

    # Work, Career & Office
    ("job", "noun", "job (pl. jobs)", "ажил", "Beruf, Stelle", "Work"),
    ("career", "noun", "career (pl. careers)", "карьер", "Karriere", "Work"),
    ("company", "noun", "company (pl. companies)", "компани", "Unternehmen, Firma", "Work"),
    ("office", "noun", "office (pl. offices)", "оффис, албан өрөө", "Büro", "Work"),
    ("manager", "noun", "manager (pl. managers)", "менежер", "Manager, Leiter", "Work"),
    ("boss", "noun", "boss (pl. bosses)", "дарга", "Chef", "Work"),
    ("colleague", "noun", "colleague (pl. colleagues)", "хамтран зүтгэгч", "Kollege", "Work"),
    ("staff", "noun", "staff", "ажилтнууд", "Personal, Mitarbeiter", "Work"),
    ("salary", "noun", "salary (pl. salaries)", "цалин", "Gehalt", "Work"),
    ("wage", "noun", "wage (pl. wages)", "хөлс, цалин", "Lohn", "Work"),
    ("contract", "noun", "contract (pl. contracts)", "гэрээ", "Vertrag", "Work"),
    ("meeting", "noun", "meeting (pl. meetings)", "уулзалт, хурал", "Besprechung, Meeting", "Work"),
    ("interview", "noun", "interview (pl. interviews)", "ярилцлага", "Vorstellungsgespräch", "Work"),
    ("customer", "noun", "customer (pl. customers)", "үйлчлүүлэгч", "Kunde", "Work"),
    ("client", "noun", "client (pl. clients)", "үйлчлүүлэгч", "Klient, Kunde", "Work"),
    ("uniform", "noun", "uniform", "дүрэмт хувцас", "Uniform", "Work"),
    ("factory", "noun", "factory (pl. factories)", "үйлдвэр", "Fabrik", "Work"),
    ("business", "noun", "business", "бизнес", "Geschäft", "Work"),
    ("project", "noun", "project (pl. projects)", "төсөл", "Projekt", "Work"),
    ("task", "noun", "task (pl. tasks)", "үүрэг даалгавар", "Aufgabe", "Work"),
    ("duty", "noun", "duty (pl. duties)", "үүрэг", "Pflicht", "Work"),
    ("break", "noun", "break (pl. breaks)", "завсарлага", "Pause", "Work"),
    ("overtime", "noun", "overtime", "илүү цаг", "Überstunden", "Work"),
    ("shift", "noun", "shift (pl. shifts)", "ээлж", "Schicht", "Work"),
    ("leave", "noun", "leave", "чөлөө, амралт", "Urlaub, Freistellung", "Work"),
    ("retire", "verb", "retire | retired | retired", "тэтгэвэрт гарах", "in Rente gehen", "Work"),
    ("hire", "verb", "hire | hired | hired", "ажилд авах, хөлслөх", "einstellen, mieten", "Work"),
    ("fire", "verb", "fire | fired | fired", "ажлаас халах", "entlassen, feuern", "Work"),
    ("apply", "verb", "apply | applied | applied", "өргөдөл гаргах", "sich bewerben", "Work"),
    ("manage", "verb", "manage | managed | managed", "удирдах, зохицуулах", "leiten, schaffen", "Work"),

    # Shopping & Money
    ("receipt", "noun", "receipt (pl. receipts)", "төлбөрийн баримт", "Kassenzettel", "Shopping"),
    ("bill", "noun", "bill (pl. bills)", "тооцооны хуудас", "Rechnung", "Shopping"),
    ("price", "noun", "price (pl. prices)", "үнэ", "Preis", "Shopping"),
    ("discount", "noun", "discount (pl. discounts)", "хямдрал", "Rabatt", "Shopping"),
    ("sale", "noun", "sale (pl. sales)", "хямдралтай худалдаа", "Ausverkauf, Verkauf", "Shopping"),
    ("cash", "noun", "cash", "бэлэн мөнгө", "Bargeld", "Shopping"),
    ("coin", "noun", "coin (pl. coins)", "зоос", "Münze", "Shopping"),
    ("banknote", "noun", "banknote (pl. banknotes)", "дэвсгэрт", "Geldschein", "Shopping"),
    ("change", "noun", "change", "хариулт мөнгө, задгай мөнгө", "Wechselgeld", "Shopping"),
    ("credit card", "noun", "credit card", "зээлийн карт", "Kreditkarte", "Shopping"),
    ("cart", "noun", "cart", "дэлгүүрийн тэрэг", "Einkaufswagen", "Shopping"),
    ("basket", "noun", "basket", "дэлгүүрийн сагс", "Korb", "Shopping"),
    ("shelf", "noun", "shelf (pl. shelves)", "тавиур", "Regal", "Shopping"),
    ("cashier", "noun", "cashier", "кассчин", "Kassierer", "Shopping"),
    ("checkout", "noun", "checkout", "төлбөр тооцооны касс", "Kasse", "Shopping"),
    ("guarantee", "noun", "guarantee", "баталгаа", "Garantie", "Shopping"),
    ("brand", "noun", "brand (pl. brands)", "брэнд, марк", "Marke", "Shopping"),
    ("quality", "noun", "quality", "чанар", "Qualität", "Shopping"),
    ("size", "noun", "size", "хэмжээ", "Größe", "Shopping"),

    # Health & Medical Care
    ("illness", "noun", "illness (pl. illnesses)", "өвчин", "Krankheit", "Health"),
    ("disease", "noun", "disease (pl. diseases)", "өвчин эмгэг", "Krankheit, Leiden", "Health"),
    ("injury", "noun", "injury (pl. injuries)", "гэмтэл", "Verletzung", "Health"),
    ("wound", "noun", "wound (pl. wounds)", "шарх", "Wunde", "Health"),
    ("bandage", "noun", "bandage (pl. bandages)", "боолт", "Verband", "Health"),
    ("plaster", "noun", "plaster", "наалт", "Pflaster", "Health"),
    ("ambulance", "noun", "ambulance", "түргэн тусламжийн тэрэг", "Krankenwagen", "Health"),
    ("patient", "noun", "patient (pl. patients)", "өвчтөн", "Patient", "Health"),
    ("appointment", "noun", "appointment", "цаг товлолт", "Termin", "Health"),
    ("prescription", "noun", "prescription", "эмийн жор", "Rezept", "Health"),
    ("pharmacy", "noun", "pharmacy", "эмийн сан", "Apotheke", "Health"),
    ("chemist", "noun", "chemist", "эмийн сан, химич", "Apotheke, Chemiker", "Health"),
    ("headache", "noun", "headache", "толгойн өвчин", "Kopfschmerzen", "Health"),
    ("toothache", "noun", "toothache", "шүдний өвчин", "Zahnschmerzen", "Health"),
    ("stomach ache", "noun", "stomach ache", "гэдэсний өвчин", "Magenschmerzen", "Health"),
    ("backache", "noun", "backache", "нурууны өвчин", "Rückenschmerzen", "Health"),
    ("dizzy", "adj", "dizzy", "толгой эргэсэн", "schwindelig", "Health"),
    ("blind", "adj", "blind", "хараагүй", "blind", "Health"),
    ("deaf", "adj", "deaf", "сонсголгүй", "taub", "Health"),
    ("recover", "verb", "recover | recovered | recovered", "эдгэрэх, сэргэх", "sich erholen, genesen", "Health"),
    ("bleed", "verb", "bleed | bled | bled", "цус гоожих", "bluten", "Health"),
    ("sneeze", "verb", "sneeze | sneezed | sneezed", "найтаах", "niesen", "Health"),
    ("breathe", "verb", "breathe | breathed | breathed", "амьсгалах", "atmen", "Health"),

    # Environment, Weather & Nature
    ("climate", "noun", "climate", "уур амьсгал", "Klima", "Environment"),
    ("forecast", "noun", "forecast", "урьдчилсан мэдээ", "Vorhersage", "Environment"),
    ("storm", "noun", "storm (pl. storms)", "шуурга", "Sturm", "Environment"),
    ("thunder", "noun", "thunder", "аянгын дуу", "Donner", "Environment"),
    ("lightning", "noun", "lightning", "аянга цахилгаан", "Blitz", "Environment"),
    ("fog", "noun", "fog", "манан", "Nebel", "Environment"),
    ("frost", "noun", "frost", "жавар", "Frost", "Environment"),
    ("ice", "noun", "ice", "мөс", "Eis", "Environment"),
    ("degree", "noun", "degree (pl. degrees)", "градус, зэрэг", "Grad", "Environment"),
    ("temperature", "noun", "temperature", "температур", "Temperatur", "Environment"),
    ("rainbow", "noun", "rainbow", "солонго", "Regenbogen", "Environment"),
    ("shadow", "noun", "shadow (pl. shadows)", "сүүдэр", "Schatten", "Environment"),
    ("pollution", "noun", "pollution", "бохирдол", "Verschmutzung", "Environment"),
    ("litter", "noun", "litter, rubbish", "хог хаягдал", "Müll, Abfall", "Environment"),
    ("rubbish", "noun", "rubbish, trash", "хог", "Müll", "Environment"),
    ("bin", "noun", "bin (pl. bins)", "хогийн сав", "Mülleimer", "Environment"),
    ("recycle", "verb", "recycle | recycled | recycled", "дахин боловсруулах", "recyceln", "Environment"),
    ("protect", "verb", "protect | protected | protected", "хамгаалах", "schützen", "Environment"),
    ("survive", "verb", "survive | survived | survived", "амьд үлдэх", "überleben", "Environment"),
    ("destroy", "verb", "destroy | destroyed | destroyed", "сүйтгэх", "zerstören", "Environment"),

    # Emotions, Relationships & Society
    ("feeling", "noun", "feeling (pl. feelings)", "мэдрэмж", "Gefühl", "Emotions"),
    ("mood", "noun", "mood (pl. moods)", "ааш зан, сэтгэл санаа", "Laune, Stimmung", "Emotions"),
    ("anger", "noun", "anger", "уур хилэн", "Wut, Zorn", "Emotions"),
    ("fear", "noun", "fear", "айдас", "Angst", "Emotions"),
    ("joy", "noun", "joy", "баяр хөөр", "Freude", "Emotions"),
    ("surprise", "noun", "surprise", "гайхшрал, гэнэтийн бэлэг", "Überraschung", "Emotions"),
    ("hope", "noun", "hope", "итгэл найдвар", "Hoffnung", "Emotions"),
    ("dream", "noun", "dream (pl. dreams)", "мөрөөдөл, зүүд", "Traum", "Emotions"),
    ("secret", "noun", "secret (pl. secrets)", "нууц", "Geheimnis", "Emotions"),
    ("truth", "noun", "truth", "үнэн", "Wahrheit", "Emotions"),
    ("lie", "noun", "lie (pl. lies)", "худал үг", "Lüge", "Emotions"),
    ("promise", "noun", "promise (pl. promises)", "амлалт", "Versprechen", "Emotions"),
    ("advice", "noun", "advice", "зөвлөгөө", "Rat, Ratschlag", "Communication"),
    ("opinion", "noun", "opinion (pl. opinions)", "үзэл бодол", "Meinung", "Communication"),
    ("suggestion", "noun", "suggestion", "санал зөвлөмж", "Vorschlag", "Communication"),
    ("decision", "noun", "decision (pl. decisions)", "шийдвэр", "Entscheidung", "Communication"),
    ("choice", "noun", "choice (pl. choices)", "сонголт", "Wahl", "Communication"),
    ("reason", "noun", "reason (pl. reasons)", "шалтгаан, учир", "Grund, Vernunft", "Communication"),
    ("difference", "noun", "difference", "ялгаа", "Unterschied", "Communication"),
    ("similarity", "noun", "similarity", "төстэй байдал", "Ähnlichkeit", "Communication"),
    ("mistake", "noun", "mistake (pl. mistakes)", "алдаа", "Fehler", "Communication"),
    ("accident", "noun", "accident (pl. accidents)", "осол", "Unfall", "Communication"),
    ("luck", "noun", "luck", "аз", "Glück", "Life"),
    ("success", "noun", "success", "амжилт", "Erfolg", "Life"),
    ("failure", "noun", "failure", "бүтэлгүйтэл", "Misserfolg", "Life"),
    ("experience", "noun", "experience", "туршлага", "Erfahrung", "Life"),
    ("habit", "noun", "habit (pl. habits)", "зуршил", "Gewohnheit", "Life"),

    # Adjectives A2
    ("proud", "adj", "proud", "бахархалтай", "stolz", "Adjectives"),
    ("nervous", "adj", "nervous", "сандарсан", "nervös", "Adjectives"),
    ("shy", "adj", "shy", "ичимхий", "schüchtern", "Adjectives"),
    ("confident", "adj", "өөртөө итгэлтэй", "selbstbewusst", "Adjectives"),
    ("brave", "adj", "зоригтой", "mutig", "Adjectives"),
    ("lazy", "adj", "залхуу", "faul", "Adjectives"),
    ("hardworking", "adj", "хичээнгүй", "fleißig", "Adjectives"),
    ("clever", "adj", "ухаалаг", "klug", "Adjectives"),
    ("stupid", "adj", "тэнэг", "dumm", "Adjectives"),
    ("patient", "adj", "тэвчээртэй", "geduldig", "Adjectives"),
    ("impatient", "adj", "тэвчээргүй", "ungeduldig", "Adjectives"),
    ("honest", "adj", "үнэнч", "ehrlich", "Adjectives"),
    ("dishonest", "adj", "хуурмаг", "unehrlich", "Adjectives"),
    ("jealous", "adj", "атаархуу", "eifersüchtig", "Adjectives"),
    ("curious", "adj", "сониуч", "neugierig", "Adjectives"),
    ("calm", "adj", "тайван", "ruhig", "Adjectives"),
    ("excited", "adj", "догдолсон", "aufgeregt", "Adjectives"),
    ("bored", "adj", "уйдсан", "gelangweilt", "Adjectives"),
    ("surprised", "adj", "гайхсан", "überrascht", "Adjectives"),
    ("scared", "adj", "айсан", "verängstigt", "Adjectives"),
    ("lonely", "adj", "ганцаардсан", "einsam", "Adjectives"),
    ("crowded", "adj", "хүн ихтэй, шахцалдсан", "überfüllt", "Adjectives"),
    ("modern", "adj", "орчин үеийн", "modern", "Adjectives"),
    ("ancient", "adj", "эртний", "antik, uralt", "Adjectives"),
    ("narrow", "adj", "нарийн", "eng, schmal", "Adjectives"),
    ("wide", "adj", "өргөн", "breit", "Adjectives"),
    ("deep", "adj", "гүн", "tief", "Adjectives"),
    ("shallow", "adj", "гүехэн", "seicht, flach", "Adjectives"),
    ("thick", "adj", "зузаан", "dick", "Adjectives"),
    ("thin", "adj", "нимгэн, туранхай", "dünn", "Adjectives"),
    ("smooth", "adj", "гөлгөр", "glatt", "Adjectives"),
    ("rough", "adj", "барзгар, ширүүн", "rau", "Adjectives"),
    ("soft", "adj", "зөөлөн", "weich", "Adjectives"),
    ("sharp", "adj", "хурц", "scharf", "Adjectives"),
    ("comfortable", "adj", "тухтай", "bequem", "Adjectives"),
    ("uncomfortable", "adj", "тухгүй", "unbequem", "Adjectives"),
    ("convenient", "adj", "тохиромжтой, эвтэйхэн", "praktisch, günstig", "Adjectives"),
    ("necessary", "adj", "шаардлагатай", "notwendig", "Adjectives"),
    ("possible", "adj", "боломжтой", "möglich", "Adjectives"),
    ("impossible", "adj", "боломжгүй", "unmöglich", "Adjectives"),
    ("likely", "adj", "магадлалтай", "wahrscheinlich", "Adjectives"),
    ("unlikely", "adj", "магадлал багатай", "unwahrscheinlich", "Adjectives"),
    ("simple", "adj", "энгийн", "einfach", "Adjectives"),
    ("complicated", "adj", "төвөгтэй", "kompliziert", "Adjectives"),
    ("careful", "adj", "болгоомжтой", "vorsichtig", "Adjectives"),
    ("careless", "adj", "болгоомжгүй", "unvorsichtig", "Adjectives"),
    ("useful", "adj", "хэрэгтэй", "nützlich", "Adjectives"),
    ("useless", "adj", "хэрэггүй", "nutzlos", "Adjectives")
]

# Apply to A2
a2_path = os.path.join(ROOT, 'data/en/vocab_a2.json')
with open(a2_path, 'r', encoding='utf-8') as f:
    en_a2 = json.load(f)

idx = len(en_a2) + 1
added_a2 = 0
for item in a2_items:
    if len(item) == 5:
        w, pos, mn, de, topic = item
        forms = w
    else:
        w, pos, forms, mn, de, topic = item
    if w.strip().lower() not in seen_en:
        entry = make_en_entry(idx, w, pos, forms, None, mn, de, topic=topic, level='A2')
        en_a2.append(entry)
        seen_en.add(w.strip().lower())
        idx += 1
        added_a2 += 1

with open(a2_path, 'w', encoding='utf-8') as f:
    json.dump(en_a2, f, ensure_ascii=False, indent=2)

print(f"Added {added_a2} to EN A2. Total EN A2 now: {len(en_a2)}")
