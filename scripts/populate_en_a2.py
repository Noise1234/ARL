#!/usr/bin/env python3
"""
Populates English A2 dataset to 765+ items.
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

a2_words = [
    # Jobs & Trades
    ("accountant", "noun", "нягтлан бодогч", "Buchhalter", "Jobs"),
    ("architect", "noun", "архитектор", "Architekt", "Jobs"),
    ("electrician", "noun", "цахилгаанчин", "Elektriker", "Jobs"),
    ("plumber", "noun", "сантехникч", "Klempner", "Jobs"),
    ("carpenter", "noun", "мужаан", "Tischler, Zimmermann", "Jobs"),
    ("mechanic", "noun", "механикч", "Mechaniker", "Jobs"),
    ("photographer", "noun", "гэрэл зурагчин", "Fotograf", "Jobs"),
    ("journalist", "noun", "сэтгүүлч", "Journalist", "Jobs"),
    ("receptionist", "noun", "хүлээн авагч", "Empfangschef, Rezeptionist", "Jobs"),
    ("secretary", "noun", "нарийн бичиг", "Sekretär", "Jobs"),
    ("pharmacist", "noun", "эмийн санч", "Apotheker", "Jobs"),
    ("firefighter", "noun", "гал сөнөөгч", "Feuerwehrmann", "Jobs"),
    ("flight attendant", "noun", "онгоцны үйлчлэгч", "Flugbegleiter", "Jobs"),
    ("tour guide", "noun", "аяллын хөтөч", "Reiseleiter", "Jobs"),
    ("sales assistant", "noun", "худалдааны туслах", "Verkäufer", "Jobs"),
    ("hairdresser", "noun", "үсчин", "Friseur", "Jobs"),
    ("barber", "noun", "эрэгтэй үсчин", "Herrenfriseur", "Jobs"),
    ("baker", "noun", "талхчин", "Bäcker", "Jobs"),
    ("butcher", "noun", "махны худалдагч", "Metzger, Fleischer", "Jobs"),
    ("lawyer", "noun", "өмгөөлөгч, хуульч", "Anwalt", "Jobs"),
    ("engineer", "noun", "инженер", "Ingenieur", "Jobs"),
    ("scientist", "noun", "эрдэмтэн", "Wissenschaftler", "Jobs"),
    ("security guard", "noun", "хамгаалагч", "Wachmann", "Jobs"),
    ("postman", "noun", "шууданч", "Briefträger", "Jobs"),
    ("gardener", "noun", "цэцэрлэгч", "Gärtner", "Jobs"),

    # Buildings & City Places
    ("castle", "noun", "цайз, цамхагт хэрэм", "Burg, Schloss", "Places"),
    ("palace", "noun", "ордон", "Palast", "Places"),
    ("cathedral", "noun", "цогчин дуган, том сүм", "Kathedrale, Dom", "Places"),
    ("temple", "noun", "сүм хийд", "Tempel", "Places"),
    ("monument", "noun", "хөшөө дурсгал", "Denkmal, Monument", "Places"),
    ("statue", "noun", "баримал, хөшөө", "Statue", "Places"),
    ("tower", "noun", "цамхаг", "Turm", "Places"),
    ("stadium", "noun", "цэнгэлдэх хүрээлэн", "Stadion", "Places"),
    ("square", "noun", "талбай", "Platz", "Places"),
    ("fountain", "noun", "усан оргилуур", "Brunnen, Springbrunnen", "Places"),
    ("crossroads", "noun", "уулзвар", "Kreuzung", "Places"),
    ("roundabout", "noun", "тойрог зам", "Kreisverkehr", "Places"),
    ("pavement", "noun", "явган хүний зам", "Bürgersteig", "Places"),
    ("subway", "noun", "метро, нүхэн гарц", "U-Bahn, Unterführung", "Places"),
    ("harbor", "noun", "боомт", "Hafen", "Places"),
    ("terminal", "noun", "буудал, терминал", "Terminal", "Places"),
    ("embassy", "noun", "элчин сайдын яам", "Botschaft", "Places"),
    ("town hall", "noun", "хотын захиргаа", "Rathaus", "Places"),
    ("skyscraper", "noun", "тэнгэр баганадсан барилга", "Wolkenkratzer", "Places"),
    ("cottage", "noun", "тосгоны байшин, зуслангийн байр", "Häuschen, Landhaus", "Places"),
    ("block of flats", "noun", "орон сууцны байшин", "Wohnblock", "Places"),
    ("neighborhood", "noun", "хөрш орчин, хороолол", "Nachbarschaft", "Places"),
    ("suburb", "noun", "хотын зах", "Vorort", "Places"),
    ("alley", "noun", "нарийн гудамж, мухар гудамж", "Gasse", "Places"),

    # Travel, Holidays & Transport
    ("expedition", "noun", "хээрийн шинжилгээний аялал", "Expedition", "Travel"),
    ("cruise", "noun", "усан онгоцны аялал", "Kreuzfahrt", "Travel"),
    ("commuter", "noun", "хот хооронд зорчигч", "Pendler", "Travel"),
    ("announcement", "noun", "зарлал, мэдэгдэл", "Durchsage, Ankündigung", "Travel"),
    ("ticket inspector", "noun", "тасалбар шалгагч", "Fahrkartenkontrolleur", "Travel"),
    ("single ticket", "noun", "нэг талын тасалбар", "Einzelfahrkarte", "Travel"),
    ("return ticket", "noun", "хоёр талын тасалбар", "Hin- und Rückfahrkarte", "Travel"),
    ("campsite", "noun", "майхант зуслангийн газар", "Campingplatz", "Travel"),
    ("caravan", "noun", "чиргүүл сууц", "Wohnwagen", "Travel"),
    ("youth hostel", "noun", "залуучуудын буудал", "Jugendherberge", "Travel"),
    ("guesthouse", "noun", "зочдын буудал", "Gasthaus, Pension", "Travel"),
    ("brochure", "noun", "товхимол, танилцуулга", "Broschüre, Prospekt", "Travel"),
    ("ferry", "noun", "гаталгаа онгоц", "Fähre", "Travel"),
    ("yacht", "noun", "дарвуулт онгоц", "Yacht", "Travel"),
    ("tram", "noun", "трамвай", "Straßenbahn", "Travel"),
    ("underground", "noun", "метро", "U-Bahn", "Travel"),
    ("van", "noun", "ачааны бага оврын фургон", "Lieferwagen, Van", "Travel"),
    ("lorry", "noun", "том оврын ачааны тэрэг", "Lastwagen, LKW", "Travel"),
    ("coach", "noun", "хот хоорондын автобус", "Reisebus", "Travel"),
    ("scooter", "noun", "скүүтер", "Roller", "Travel"),

    # Cooking & Food Prep
    ("ingredient", "noun", "орц найрлага", "Zutat", "Cooking"),
    ("recipe", "noun", "хоолны жор", "Rezept", "Cooking"),
    ("kettle", "noun", "буцалгагч данх", "Wasserkocher", "Cooking"),
    ("blender", "noun", "холигч, блендер", "Mixer", "Cooking"),
    ("toaster", "noun", "талх шарагч", "Toaster", "Cooking"),
    ("microwave", "noun", "богино долгионы зуух", "Mikrowelle", "Cooking"),
    ("oven", "noun", "шарах шүүгээ", "Backofen", "Cooking"),
    ("stove", "noun", "плитка, зуух", "Herd", "Cooking"),
    ("strainer", "noun", "шүүр (гал тогооны)", "Sieb", "Cooking"),
    ("whisk", "noun", "өндөг хутгуур", "Schneebesen", "Cooking"),
    ("ladle", "noun", "шанага", "Schöpfkelle", "Cooking"),
    ("spatula", "noun", "хусуур", "Pfannenwender", "Cooking"),
    ("grater", "noun", "үрэгч", "Reibe", "Cooking"),
    ("peeler", "noun", "хальслагч", "Sparschäler", "Cooking"),
    ("cutting board", "noun", "хэрчих мод", "Schneidebrett", "Cooking"),
    ("starter", "noun", "зууш, эхний хоол", "Vorspeise", "Food"),
    ("main course", "noun", "гол хоол", "Hauptgericht", "Food"),
    ("side dish", "noun", "хачир хоол", "Beilage", "Food"),
    ("leftovers", "noun", "үлдсэн хоол", "Reste", "Food"),
    ("takeaway", "noun", "авч явдаг бэлэн хоол", "Essen zum Mitnehmen", "Food"),
    ("spicy", "adj", "халуун ногоотой", "scharf, würzig", "Food"),
    ("salty", "adj", "шорвог, давстай", "salzig", "Food"),
    ("sour", "adj", "исгэлэн", "sauer", "Food"),
    ("bitter", "adj", "гашуун", "bitter", "Food"),
    ("sweet", "adj", "чихэрлэг", "süß", "Food"),
    ("fresh", "adj", "шинэхэн", "frisch", "Food"),
    ("frozen", "adj", "хөлдөөсөн", "gefroren", "Food"),
    ("canned", "adj", "лаазалсан", "in Dosen, konserviert", "Food"),
    ("raw", "adj", "түүхий", "roh", "Food"),
    ("boiled", "adj", "чанасан", "gekocht", "Food"),
    ("fried", "adj", "шарсан (тосонд)", "gebraten, frittiert", "Food"),
    ("baked", "adj", "жигнэсэн (зууханд)", "gebacken", "Food"),
    ("grilled", "adj", "шарсан (ил гал дээр)", "gegrillt", "Food"),
    ("roast", "adj", "шарсан (мах)", "gebraten", "Food"),

    # Materials, Household & Shopping
    ("silk", "noun", "торго", "Seide", "Shopping"),
    ("cotton", "noun", "хөвөн, даавуу", "Baumwolle", "Shopping"),
    ("wool", "noun", "ноос", "Wolle", "Shopping"),
    ("leather", "noun", "савхи, шир", "Leder", "Shopping"),
    ("gold", "noun", "алт", "Gold", "Shopping"),
    ("silver", "noun", "мөнгө (төмөрлөг)", "Silber", "Shopping"),
    ("copper", "noun", "зэс", "Kupfer", "Shopping"),
    ("iron", "noun", "төмөр", "Eisen", "Shopping"),
    ("steel", "noun", "ган", "Stahl", "Shopping"),
    ("metal", "noun", "металл, төмөрлөг", "Metall", "Shopping"),
    ("plastic", "noun", "хуванцар", "Plastik, Kunststoff", "Shopping"),
    ("rubber", "noun", "резин", "Gummi", "Shopping"),
    ("wood", "noun", "мод", "Holz", "Shopping"),
    ("glass", "noun", "шил", "Glas", "Shopping"),
    ("fitting room", "noun", "хувцас өмсөж үзэх өрөө", "Umkleidekabine", "Shopping"),
    ("cash desk", "noun", "төлбөрийн касс", "Kasse", "Shopping"),
    ("refund", "noun", "мөнгө буцаалт", "Rückerstattung", "Shopping"),
    ("exchange", "noun", "солилцоо", "Umtausch", "Shopping"),
    ("barcode", "noun", "бар код", "Barcode", "Shopping"),
    ("bargain", "noun", "хямд ашигтай худалдан авалт", "Schnäppchen", "Shopping"),
    ("special offer", "noun", "тусгай хямдрал", "Sonderangebot", "Shopping"),
    ("tight", "adj", "бариу, бачхан", "eng", "Shopping"),
    ("loose", "adj", "сул, уужим", "weit, locker", "Shopping"),
    ("fashionable", "adj", "загварлаг", "modisch", "Shopping"),
    ("washing machine", "noun", "угаалгын машин", "Waschmaschine", "Home"),
    ("dishwasher", "noun", "аяга таваг угаагч", "Geschirrspüler", "Home"),
    ("vacuum cleaner", "noun", "тоос сорогч", "Staubsauger", "Home"),
    ("iron", "noun", "индүү", "Bügeleisen", "Home"),
    ("heating", "noun", "халаалт", "Heizung", "Home"),
    ("air conditioning", "noun", "агааржуулагч", "Klimaanlage", "Home"),
    ("plug", "noun", "залгуур, сэрээ", "Stecker", "Home"),
    ("socket", "noun", "розетка", "Steckdose", "Home"),
    ("switch", "noun", "унтраалга", "Schalter", "Home"),
    ("wire", "noun", "утас, кабель", "Draht, Kabel", "Home"),
    ("bulb", "noun", "чийдэнгийн шил", "Glühbirne", "Home"),
    ("mower", "noun", "өвс хадагч", "Rasenmäher", "Home"),
    ("lawn", "noun", "зүлэг", "Rasen", "Home"),

    # Health & Sickness
    ("infection", "noun", "халдвар", "Infektion", "Health"),
    ("sore throat", "noun", "хоолой өвдөх", "Halsschmerzen", "Health"),
    ("runny nose", "noun", "хамраас нус гоожих", "laufende Nase", "Health"),
    ("sprain", "noun", "шөрмөс сунах", "Verstauchung", "Health"),
    ("twist", "noun", "мултрах, мушгирах", "Verdrehung", "Health"),
    ("fracture", "noun", "хугарал", "Fraktur, Bruch", "Health"),
    ("injection", "noun", "тариа", "Spritze, Injektion", "Health"),
    ("emergency", "noun", "онцгой байдал, яаралтай тусламж", "Notfall", "Health"),
    ("ward", "noun", "эмнэлгийн тасаг", "Station, Krankensaal", "Health"),
    ("clinic", "noun", "клиник, эмнэлэг", "Klinik, Praxis", "Health"),
    ("bandage", "noun", "боолт", "Bandage, Verband", "Health"),
    ("faint", "verb", "faint | fainted | fainted", "ухаан алдах", "ohnmächtig werden", "Health"),
    ("hurt", "verb", "hurt | hurt | hurt", "өвдөх, гэмтээх", "wehtun, verletzen", "Health"),
    ("sprain", "verb", "sprain | sprained | sprained", "шөрмөсөө сунгах", "verstauchen", "Health"),
    ("bleed", "verb", "bleed | bled | bled", "цус гарах", "bluten", "Health"),
    ("injure", "verb", "injure | injured | injured", "бэртэх", "verletzen", "Health"),
    ("cure", "verb", "cure | cured | cured", "эмчлэх, эдгээх", "heilen", "Health"),
    ("examine", "verb", "examine | examined | examined", "үзэх, шалгах", "untersuchen", "Health"),

    # Weather, Geography & Nature
    ("breeze", "noun", "зөөлөн салхи", "Brise", "Nature"),
    ("blizzard", "noun", "цасан шуурга", "Schneesturm", "Nature"),
    ("hail", "noun", "мөндөр", "Hagel", "Nature"),
    ("humidity", "noun", "агаарын чийгшил", "Luftfeuchtigkeit", "Nature"),
    ("shower", "noun", "зурвас бороо", "Regenschauer", "Nature"),
    ("canyon", "noun", "хавцал", "Schlucht, Canyon", "Nature"),
    ("cliff", "noun", "эгц хад, цохио", "Klippe, Felswand", "Nature"),
    ("cave", "noun", "агуй", "Höhle", "Nature"),
    ("desert", "noun", "цөл", "Wüste", "Nature"),
    ("jungle", "noun", "ширэнгэн ой", "Dschungel", "Nature"),
    ("stream", "noun", "горхи, горхи булаг", "Bach, Strom", "Nature"),
    ("pond", "noun", "цэнгэг цөөрөм", "Teich", "Nature"),
    ("ocean", "noun", "далай", "Ozean", "Nature"),
    ("coast", "noun", "эрэг хөвөө", "Küste", "Nature"),
    ("shore", "noun", "эргийн шугам", "Ufer, Strand", "Nature"),
    ("continent", "noun", "тив", "Kontinent", "Nature"),
    ("glacier", "noun", "мөсөн гол", "Gletscher", "Nature"),
    ("valley", "noun", "хөндий", "Tal", "Nature"),

    # Common A2 Verbs (Cooking, Daily Life, Actions)
    ("boil", "verb", "boil | boiled | boiled", "буцалгах", "kochen, sieden", "Actions"),
    ("fry", "verb", "fry | fried | fried", "шарах (хайруулын тавганд)", "braten", "Actions"),
    ("grill", "verb", "grill | grilled | grilled", "шарах (ил гал дээр)", "grillen", "Actions"),
    ("chop", "verb", "chop | chopped | chopped", "жижиглэн хэрчих", "hacken, zerkleinern", "Actions"),
    ("slice", "verb", "slice | sliced | sliced", "нимгэн хэрчих", "in Scheiben schneiden", "Actions"),
    ("peel", "verb", "peel | peeled | peeled", "хальслах", "schälen", "Actions"),
    ("stir", "verb", "stir | stirred | stirred", "хутгах", "umrühren", "Actions"),
    ("mix", "verb", "mix | mixed | mixed", "холих", "mischen", "Actions"),
    ("pour", "verb", "pour | poured | poured", "аягалах, асгах", "gießen, einschenken", "Actions"),
    ("serve", "verb", "serve | served | served", "үйлчлэх, хоол таваглах", "bedienen, servieren", "Actions"),
    ("sweep", "verb", "sweep | swept | swept", "шүүрдэх", "kehren, fegen", "Actions"),
    ("wipe", "verb", "wipe | wiped | wiped", "арчих", "wischen, abwischen", "Actions"),
    ("dust", "verb", "dust | dusted | dusted", "тоос арчих", "Staub wischen", "Actions"),
    ("polish", "verb", "polish | polished | polished", "өнгөлөх", "polieren", "Actions"),
    ("tidy", "verb", "tidy | tidied | tidied", "янзлах, эмхлэх", "aufräumen", "Actions"),
    ("iron", "verb", "iron | ironed | ironed", "индүүдэх", "bügeln", "Actions"),
    ("arrange", "verb", "arrange | arranged | arranged", "зохион байгуулах", "arrangieren, ordnen", "Actions"),
    ("cancel", "verb", "cancel | canceled | canceled", "цуцлах", "stornieren, absagen", "Actions"),
    ("confirm", "verb", "confirm | confirmed | confirmed", "баталгаажуулах", "bestätigen", "Actions"),
    ("inform", "verb", "inform | informed | informed", "мэдээлэх", "informieren", "Actions"),
    ("suggest", "verb", "suggest | suggested | suggested", "санал болгох", "vorschlagen", "Actions"),
    ("recommend", "verb", "recommend | recommended | recommended", "зөвлөх", "empfehlen", "Actions"),
    ("explain", "verb", "explain | explained | explained", "тайлбарлах", "erklären", "Actions"),
    ("describe", "verb", "describe | described | described", "дүрслэх", "beschreiben", "Actions"),
    ("compare", "verb", "compare | compared | compared", "харьцуулах", "vergleichen", "Actions"),
    ("discuss", "verb", "discuss | discussed | discussed", "хэлэлцэх", "diskutieren, besprechen", "Actions"),
    ("agree", "verb", "agree | agreed | agreed", "зөвшөөрөх", "zustimmen", "Actions"),
    ("disagree", "verb", "disagree | disagreed | disagreed", "санал зөрөх", "widersprechen", "Actions"),
    ("refuse", "verb", "refuse | refused | refused", "татгалзах", "ablehnen, sich weigern", "Actions"),
    ("accept", "verb", "accept | accepted | accepted", "хүлээн зөвшөөрөх", "akzeptieren, annehmen", "Actions"),
    ("prefer", "verb", "prefer | preferred | preferred", "эрхэмлэх, илүүд үзэх", "bevorzugen, vorziehen", "Actions"),
    ("expect", "verb", "expect | expected | expected", "хүлээх, тооцоолох", "erwarten", "Actions"),
    ("suppose", "verb", "suppose | supposed | supposed", "таамаглах", "vermuten, annehmen", "Actions"),
    ("guess", "verb", "guess | guessed | guessed", "таах", "raten, vermuten", "Actions"),
    ("wonder", "verb", "wonder | wondered | wondered", "гайхах, мэдэхийг хүсэх", "sich wundern, fragen", "Actions"),
    ("realize", "verb", "realize | realized | realized", "ухаарах, хэрэгжүүлэх", "begreifen, realisieren", "Actions"),
    ("recognize", "verb", "recognize | recognized | recognized", "таних", "wiedererkennen", "Actions"),
    ("remind", "verb", "remind | reminded | reminded", "сануулах", "erinnern", "Actions"),
    ("notice", "verb", "notice | noticed | noticed", "анзаарах", "bemerken", "Actions"),
    ("ignore", "verb", "ignore | ignored | ignored", "үл тоох", "ignorieren", "Actions"),
    ("avoid", "verb", "avoid | avoided | avoided", "зайлсхийх", "vermeiden", "Actions"),
    ("escape", "verb", "escape | escaped | escaped", "зугтах, мултрах", "entkommen, fliehen", "Actions"),
    ("hide", "verb", "hide | hid | hidden", "нуух", "verstecken", "Actions"),
    ("protect", "verb", "protect | protected | protected", "хамгаалах", "schützen", "Actions"),
    ("attack", "verb", "attack | attacked | attacked", "довтлох", "angreifen", "Actions"),
    ("defend", "verb", "defend | defended | defended", "хамгаалах", "verteidigen", "Actions"),
    ("warn", "verb", "warn | warned | warned", "сануулах, сэрэмжлүүлэх", "warnen", "Actions"),
    ("threaten", "verb", "threaten | threatened | threatened", "заналхийлэх", "drohen, bedrohen", "Actions"),
    ("admit", "verb", "admit | admitted | admitted", "хүлээн зөвшөөрөх", "zugeben, eingestehen", "Actions"),
    ("deny", "verb", "deny | denied | denied", "үгүйсгэх", "leugnen, bestreiten", "Actions")
]

a2_path = os.path.join(ROOT, 'data/en/vocab_a2.json')
with open(a2_path, 'r', encoding='utf-8') as f:
    en_a2 = json.load(f)

idx = len(en_a2) + 1
added_a2 = 0
for item in a2_words:
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
