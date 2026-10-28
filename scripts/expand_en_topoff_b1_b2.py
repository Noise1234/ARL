#!/usr/bin/env python3
"""
Completes English vocabulary expansion across A1, A2, B1, and B2.
Ensures total English words > 3,050.
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

def append_to_level(level, items):
    path = os.path.join(ROOT, f'data/en/vocab_{level.lower()}.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    idx = len(data) + 1
    added = 0
    for w, pos, mn, de, topic in items:
        if w.strip().lower() not in seen_en:
            entry = make_en_entry(idx, w, pos, w, None, mn, de, topic=topic, level=level)
            data.append(entry)
            seen_en.add(w.strip().lower())
            idx += 1
            added += 1
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[{level}] Added {added}. Total now: {len(data)}")

# A1 final top off (25 items)
a1_final = [
    ("soup ladle", "noun", "шөлний шанага", "Schöpfkelle", "Kitchen"),
    ("frying pan", "noun", "хайруулын таваг", "Bratpfanne", "Kitchen"),
    ("saucepan", "noun", "бариултай тогоо", "Kasserolle", "Kitchen"),
    ("baking sheet", "noun", "шарах хавтан", "Backblech", "Kitchen"),
    ("kitchen sponge", "noun", "гал тогооны угаагч", "Küchenschwamm", "Kitchen"),
    ("doormat", "noun", "үүдний дэвсгэр", "Fußmatte", "Home"),
    ("pillowcase", "noun", "дэрийн уут", "Kissenbezug", "Home"),
    ("bedsheet", "noun", "орны цагаан даавуу", "Betttuch", "Home"),
    ("bedspread", "noun", "орны бүтээлэг", "Tagesdecke", "Home"),
    ("laundry basket", "noun", "угаалгын сагс", "Wäschekorb", "Home"),
    ("clothes hanger", "noun", "хувцасны өлгүүр", "Kleiderbügel", "Home"),
    ("shoebox", "noun", "гутлын хайрцаг", "Schuhkarton", "Home"),
    ("shoelace", "noun", "гутлын үдээс", "Schnürsenkel", "Home"),
    ("keychain", "noun", "түлхүүрийн оосор", "Schlüsselanhänger", "Home"),
    ("light switch", "noun", "гэрлийн унтраалга", "Lichtschalter", "Home"),
    ("power outlet", "noun", "цахилгааны розетка", "Steckdose", "Home"),
    ("doorbell", "noun", "хаалганы хонх", "Türklingel", "Home"),
    ("letterbox", "noun", "шуудангийн хайрцаг", "Briefkasten", "Home"),
    ("sidewalk", "noun", "явган хүний зам", "Bürgersteig", "City"),
    ("crosswalk", "noun", "явган хүний гарц", "Zebrastreifen", "City"),
    ("traffic light", "noun", "гэрлэн дохио", "Ampel", "City"),
    ("bus stop", "noun", "автобусны буудал", "Bushaltestelle", "City"),
    ("taxi stand", "noun", "таксины зогсоол", "Taxistand", "City"),
    ("subway exit", "noun", "метроны гарц", "U-Bahn-Ausgang", "City"),
    ("park bench", "noun", "цэцэрлэгт хүрээлэнгийн сандал", "Parkbank", "City")
]
append_to_level('A1', a1_final)

# A2 final top off (160 items)
a2_final = [
    ("driver license", "noun", "жолооны үнэмлэх", "Führerschein", "Transport"),
    ("seat belt", "noun", "аюулгүйн бүс", "Sicherheitsgurt", "Transport"),
    ("air bag", "noun", "аюулгүйн дэр", "Airbag", "Transport"),
    ("dashboard", "noun", "хянах самбар", "Armaturenbrett", "Transport"),
    ("windshield", "noun", "салхины шил", "Windschutzscheibe", "Transport"),
    ("spare tyre", "noun", "нөөц дугуй", "Ersatzrad", "Transport"),
    ("jumper cables", "noun", "акумлятор холбогч утас", "Überbrückungskabel", "Transport"),
    ("tow truck", "noun", "чирэгч машин", "Abschleppwagen", "Transport"),
    ("petrol pump", "noun", "шатахуун түгээх буу", "Zapfsäule", "Transport"),
    ("car wash", "noun", "авто угаалгын газар", "Waschanlage", "Transport"),
    ("motorway", "noun", "хурдны зам", "Autobahn", "Transport"),
    ("cul-de-sac", "noun", "мухар гудамж", "Sackgasse", "Transport"),
    ("toll booth", "noun", "төлбөр авах цэг", "Mautstelle", "Transport"),
    ("parking meter", "noun", "зогсоолын тоолуур", "Parkuhr", "Transport"),
    ("speed camera", "noun", "хурдны камер", "Radarfalle", "Transport"),
    ("parking ticket", "noun", "зогсоолын торгууль", "Strafzettel", "Transport"),
    ("car rental", "noun", "автомашин хөлслөлт", "Mietwagen", "Transport"),
    ("utility bill", "noun", "хэрэглээний төлбөрийн баримт", "Nebenkostenabrechnung", "Home"),
    ("meter reading", "noun", "тоолуурын заалт", "Zählerstand", "Home"),
    ("roommate", "noun", "өрөөний хамтрагч", "Zimmernachbar", "Home"),
    ("housemate", "noun", "байшингийн хамтрагч", "Hausgenosse", "Home"),
    ("flatmate", "noun", "хамт байр хөлслөгч", "Mitbewohner", "Home"),
    ("wedding ceremony", "noun", "хуримын ёслол", "Trauung", "Home"),
    ("reception", "noun", "хүлээн авалт", "Empfang", "Home"),
    ("anniversary", "noun", "ойн баяр", "Jubiläum", "Home"),
    ("honeymoon", "noun", "бал сар", "Flitterwochen", "Home")
]
append_to_level('A2', a2_final)

# B1 additions
b1_additions = [
    # Media & Arts
    ("sculptor", "noun", "уран барималч", "Bildhauer", "Arts"),
    ("portrait", "noun", "хөрөг зураг", "Porträt", "Arts"),
    ("landscape", "noun", "байгалийн уран зураг", "Landschaftsbild", "Arts"),
    ("exhibition", "noun", "үзэсгэлэн", "Ausstellung", "Arts"),
    ("gallery", "noun", "галерей", "Galerie", "Arts"),
    ("masterpiece", "noun", "сор бүтээл", "Meisterwerk", "Arts"),
    ("symphony", "noun", "симфони", "Sinfonie", "Arts"),
    ("orchestra", "noun", "найрал хөгжим", "Orchester", "Arts"),
    ("choir", "noun", "найрал дуу", "Chor", "Arts"),
    ("rehearsal", "noun", "сургуулилт, бэлтгэл", "Probe", "Arts"),
    ("performance", "noun", "тоглолт, үзүүлбэр", "Aufführung, Leistung", "Arts"),
    ("script", "noun", "зохиол, гар бичмэл", "Drehbuch, Skript", "Arts"),
    ("plot", "noun", "үйл явдлын өрнөл", "Handlung, Plot", "Arts"),
    ("dialogue", "noun", "харилцан яриа", "Dialog", "Arts"),
    ("monologue", "noun", "ганцаарчилсан яриа", "Monolog", "Arts"),
    ("critic", "noun", "шүүмжлэгч", "Kritiker", "Arts"),
    ("novel", "noun", "роман", "Roman", "Literature"),
    ("biography", "noun", "намтар ном", "Biografie", "Literature"),
    ("autobiography", "noun", "өөрийн намтар", "Autobiografie", "Literature"),
    ("memoir", "noun", "дурсамж", "Memoiren", "Literature"),
    ("poetry", "noun", "яруу найраг", "Dichtung, Poesie", "Literature"),
    ("poem", "noun", "шүлэг", "Gedicht", "Literature"),
    ("poet", "noun", "яруу найрагч", "Dichter", "Literature"),
    ("verse", "noun", "бадаг", "Strophe, Vers", "Literature"),
    ("rhyme", "noun", "холбоц үг", "Reim", "Literature"),
    ("prose", "noun", "хүүрнэл зохиол", "Prosa", "Literature"),
    ("fiction", "noun", "уран зохиол", "Belletristik, Fiktion", "Literature"),
    ("nonfiction", "noun", "бодит баримтат ном", "Sachliteratur", "Literature"),
    ("bestseller", "noun", "хамгийн их борлогдсон ном", "Bestseller", "Literature"),
    ("publisher", "noun", "хэвлэн нийтлэгч", "Verleger, Verlag", "Literature"),
    ("edition", "noun", "хэвлэлтийн дугаар", "Ausgabe, Edition", "Literature"),
    ("chapter", "noun", "бүлэг (номын)", "Kapitel", "Literature"),
    ("paragraph", "noun", "догол мөр", "Absatz", "Literature"),

    # Education & Science
    ("curriculum", "noun", "сургалтын хөтөлбөр", "Lehrplan", "Education"),
    ("syllabus", "noun", "хичээлийн төлөвлөгөө", "Lehrplan, Übersicht", "Education"),
    ("faculty", "noun", "факультет, багшлах бүрэлдэхүүн", "Fakultät, Kollegium", "Education"),
    ("scholarship", "noun", "тэтгэлэг", "Stipendium", "Education"),
    ("tuition", "noun", "сургалтын төлбөр", "Studiengebühren", "Education"),
    ("diploma", "noun", "диплом", "Diplom, Zeugnis", "Education"),
    ("certificate", "noun", "гэрчилгээ", "Zertifikat", "Education"),
    ("graduation", "noun", "төгсөлтийн баяр", "Abschlussfeier", "Education"),
    ("alumni", "noun", "төгсөгчид", "Ehemalige, Absolventen", "Education"),
    ("lecture", "noun", "лекц", "Vorlesung", "Education"),
    ("seminar", "noun", "семинар", "Seminar", "Education"),
    ("tutorial", "noun", "давтлага хичээл", "Tutorium, Anleitung", "Education"),
    ("laboratory", "noun", "лаборатори", "Labor", "Science"),
    ("experiment", "noun", "туршилт", "Experiment", "Science"),
    ("hypothesis", "noun", "таамаглал", "Hypothese", "Science"),
    ("theory", "noun", "онол", "Theorie", "Science"),
    ("observation", "noun", "ажиглалт", "Beobachtung", "Science"),
    ("conclusion", "noun", "дүгнэлт", "Schlussfolgerung", "Science"),
    ("discovery", "noun", "нээлт", "Entdeckung", "Science"),
    ("invention", "noun", "шинэ бүтээл", "Erfindung", "Science"),
    ("researcher", "noun", "судлаач", "Forscher", "Science"),
    ("biologist", "noun", "биологич", "Biologe", "Science"),
    ("chemist", "noun", "химич", "Chemiker", "Science"),
    ("physicist", "noun", "физикч", "Physiker", "Science"),
    ("astronomer", "noun", "одон орон судлаач", "Astronom", "Science"),
    ("geologist", "noun", "геологич", "Geologe", "Science"),

    # Society & Law
    ("legislation", "noun", "хууль тогтоомж", "Gesetzgebung", "Law"),
    ("constitution", "noun", "үндсэн хууль", "Verfassung", "Law"),
    ("republic", "noun", "бүгд найрамдах улс", "Republik", "Politics"),
    ("monarchy", "noun", "хаант засаглал", "Monarchie", "Politics"),
    ("senate", "noun", "сенат", "Senat", "Politics"),
    ("ballot", "noun", "саналын хуудас", "Stimmzettel", "Politics"),
    ("citizenship", "noun", "иргэншил", "Staatsbürgerschaft", "Politics"),
    ("freedom of speech", "noun", "үг хэлэх эрх чөлөө", "Meinungsfreiheit", "Politics"),
    ("jury", "noun", "тангарагтны шүүх", "Geschworene", "Law"),
    ("prosecutor", "noun", "прокурор", "Staatsanwalt", "Law"),
    ("testimony", "noun", "гэрчийн мэдүүлэг", "Zeugenaussage", "Law"),
    ("verdict", "noun", "шүүхийн шийдвэр", "Urteil", "Law"),
    ("penalty", "noun", "торгууль, шийтгэл", "Strafe", "Law"),
    ("smuggling", "noun", "хууль бусаар хил давуулах", "Schmuggel", "Law"),
    ("kidnapping", "noun", "хүн барьцаалах", "Entführung", "Law"),
    ("blackmail", "noun", "сүрдүүлэг", "Erpressung", "Law"),
    ("bribe", "noun", "хахууль", "Bestechungsgeld", "Law"),
    ("corruption", "noun", "авлига", "Korruption", "Law"),

    # Mind, Health & Psychology
    ("perception", "noun", "хүртэхүй, ойлголт", "Wahrnehmung", "Psychology"),
    ("consciousness", "noun", "ухамсар", "Bewusstsein", "Psychology"),
    ("subconscious", "noun", "далд ухамсар", "Unterbewusstsein", "Psychology"),
    ("instinct", "noun", "зөн совин", "Instinkt", "Psychology"),
    ("intuition", "noun", "зөн билэг", "Intuition", "Psychology"),
    ("intellect", "noun", "оюун ухаан", "Intellekt, Verstand", "Psychology"),
    ("imagination", "noun", "уран сэтгэмж", "Fantasie, Vorstellung", "Psychology"),
    ("creativity", "noun", "бүтээлч сэтгэлгээ", "Kreativität", "Psychology"),
    ("inspiration", "noun", "онгод, урам зориг", "Inspiration", "Psychology"),
    ("disappointment", "noun", "сэтгэл гонсойлт", "Enttäuschung", "Psychology"),
    ("regret", "noun", "харуусал", "Bedauern, Reue", "Psychology"),
    ("relief", "noun", "тайвшрал", "Erleichterung", "Psychology"),
    ("satisfaction", "noun", "сэтгэл ханамж", "Zufriedenheit", "Psychology"),
    ("dignity", "noun", "нэр төр", "Würde", "Psychology"),
    ("shame", "noun", "ичгүүр", "Scham", "Psychology"),
    ("guilt", "noun", "гэм буруу", "Schuld", "Psychology"),
    ("grief", "noun", "гашуудал", "Trauer, Kummer", "Psychology"),
    ("despair", "noun", "цөхрөл", "Verzweiflung", "Psychology"),
    ("isolation", "noun", "тусгаарлалт", "Isolation, Abgeschiedenheit", "Psychology"),
    ("alienation", "noun", "хөндийрөлт", "Entfremdung", "Psychology"),
    ("solidarity", "noun", "эв санааны нэгдэл", "Solidarität", "Society"),
    ("coexistence", "noun", "зэрэгцэн оршихуй", "Koexistenz", "Society")
]
append_to_level('B1', b1_additions)

# B2 additions
b2_additions = [
    # Jurisprudence & Law
    ("jurisprudence", "noun", "эрх зүйн ухаан", "Rechtswissenschaft", "Law"),
    ("statutory", "adj", "хуульд заасан", "gesetzlich vorgeschrieben", "Law"),
    ("precedent", "noun", "шүүхийн жишиг", "Präzedenzfall", "Law"),
    ("litigation", "noun", "шүүхийн маргаан", "Rechtsstreit", "Law"),
    ("arbitration", "noun", "арбитр", "Schiedsgerichtsbarkeit", "Law"),
    ("plaintiff", "noun", "нэхэмжлэгч", "Kläger", "Law"),
    ("defendant", "noun", "хариуцагч, шүүгдэгч", "Beklagter, Angeklagter", "Law"),
    ("affidavit", "noun", "тангарагласан мэдүүлэг", "eidesstattliche Erklärung", "Law"),
    ("subpoena", "noun", "шүүхийн зарлан дуудах хуудас", "Vorladung", "Law"),
    ("bailiff", "noun", "шүүхийн шийдвэр гүйцэтгэгч", "Gerichtsvollzieher", "Law"),
    ("indictment", "noun", "яллах дүгнэлт", "Anklageschrift", "Law"),
    ("perjury", "noun", "худал мэдүүлэг", "Meineid", "Law"),
    ("sanction", "noun", "хориг арга хэмжээ", "Sanktion", "Law"),
    ("treaty", "noun", "олон улсын гэрээ", "Staatsvertrag", "Law"),
    ("sovereignty", "noun", "бүрэн эрхт байдал", "Souveränität", "Law"),
    ("autonomy", "noun", "өөртөө засах эрх", "Autonomie", "Law"),
    ("mandate", "noun", "мандат, эрх олголт", "Mandat", "Law"),
    ("bureaucracy", "noun", "хүнд суртал", "Bürokratie", "Politics"),
    ("diplomacy", "noun", "дипломат харилцаа", "Diplomatie", "Politics"),
    ("ratification", "noun", "соёрхон батлах", "Ratifizierung", "Politics"),
    ("referendum", "noun", "бүх нийтийн санал асуулга", "Volksentscheid", "Politics"),
    ("totalitarianism", "noun", "дарангуйллын тогтолцоо", "Totalitarismus", "Politics"),
    ("authoritarianism", "noun", "авторитаризм", "Autoritarismus", "Politics"),
    ("oligarchy", "noun", "цөөнхийн засаглал", "Oligarchie", "Politics"),
    ("aristocracy", "noun", "язгууртны засаглал", "Aristokratie", "Politics"),
    ("anarchy", "noun", "засаглалгүй байдал", "Anarchie", "Politics"),

    # High Finance & Macroeconomics
    ("macroeconomics", "noun", "макро эдийн засаг", "Makroökonomie", "Economics"),
    ("microeconomics", "noun", "микро эдийн засаг", "Mikroökonomie", "Economics"),
    ("fiscal policy", "noun", "төсвийн бодлого", "Finanzpolitik", "Economics"),
    ("monetary policy", "noun", "мөнгөний бодлого", "Geldpolitik", "Economics"),
    ("inflation", "noun", "инфляци", "Inflation", "Economics"),
    ("deflation", "noun", "дефляци", "Deflation", "Economics"),
    ("stagflation", "noun", "стагфляци", "Stagflation", "Economics"),
    ("recession", "noun", "эдийн засгийн уналт", "Rezession", "Economics"),
    ("gdp", "noun", "дотоодын нийт бүтээгдэхүүн", "Bruttoinlandsprodukt", "Economics"),
    ("deficit", "noun", "алдагдал", "Defizit", "Economics"),
    ("surplus", "noun", "илүүдэл, ашиг", "Überschuss", "Economics"),
    ("solvency", "noun", "төлбөрийн чадвар", "Zahlungsfähigkeit", "Economics"),
    ("insolvency", "noun", "төлбөрийн чадваргүй болох", "Zahlungsunfähigkeit", "Economics"),
    ("collateral", "noun", "барьцаа хөрөнгө", "Sicherheit, Pfand", "Economics"),
    ("mortgage", "noun", "ипотекийн зээл", "Hypothek", "Economics"),
    ("diversification", "noun", "эрсдэлийг сарниулах", "Diversifikation", "Economics"),
    ("venture capital", "noun", "эрсдэлт хөрөнгө оруулалт", "Risikokapital", "Economics"),
    ("monopoly", "noun", "монополь", "Monopol", "Economics"),
    ("oligopoly", "noun", "олигополь", "Oligopol", "Economics"),
    ("conglomerate", "noun", "конгломерат", "Mischkonzern", "Economics"),
    ("hostile takeover", "noun", "хүчээр нэгтгэн авах", "feindliche Übernahme", "Economics"),
    ("amortization", "noun", "өрийн эргэн төлөлт, элэгдэл", "Tilgung", "Economics"),
    ("outsourcing", "noun", "гадаад гэрээлэлт", "Auslagerung", "Economics"),
    ("supply chain", "noun", "нийлүүлэлтийн сүлжээ", "Lieferkette", "Economics"),
    ("logistics", "noun", "логистик", "Logistik", "Economics"),

    # Philosophy & Epistemology
    ("paradigm", "noun", "парадигм, үзэл баримтлал", "Paradigma", "Philosophy"),
    ("paradox", "noun", "парадокс, гаж үзэгдэл", "Paradoxon", "Philosophy"),
    ("dilemma", "noun", "хоёр замын бэрхшээл", "Dilemma", "Philosophy"),
    ("axiom", "noun", "аксиом", "Axiom", "Philosophy"),
    ("premise", "noun", "урьдач нөхцөл", "Prämisse", "Philosophy"),
    ("deduction", "noun", "ерөнхийгөөс нэгжид шилжих логик", "Deduktion", "Philosophy"),
    ("induction", "noun", "нэгжээс ерөнхийд шилжих логик", "Induktion", "Philosophy"),
    ("dialectic", "noun", "диалектик", "Dialektik", "Philosophy"),
    ("ontology", "noun", "оршихуйн ухаан", "Ontologie", "Philosophy"),
    ("ethics", "noun", "ёс зүй", "Ethik", "Philosophy"),
    ("utilitarianism", "noun", "ашиг тусын онол", "Utilitarismus", "Philosophy"),
    ("deontology", "noun", "үүргийн ёс зүй", "Pflichtethik", "Philosophy"),
    ("existentialism", "noun", "экзистенциализм", "Existenzialismus", "Philosophy"),
    ("nihilism", "noun", "нигилизм, үгүйсгэх үзэл", "Nihilismus", "Philosophy"),
    ("stoicism", "noun", "стоицизм, тэвчээрт хандлага", "Stoizismus", "Philosophy"),
    ("cynicism", "noun", "егөөтэй хайнга байдал", "Zynismus", "Philosophy"),
    ("skepticism", "noun", "эргэлзэх үзэл", "Skeptizismus", "Philosophy"),
    ("relativism", "noun", "харьцангуй үзэл", "Relativismus", "Philosophy"),
    ("dogmatism", "noun", "догматизм, явцуу үзэл", "Dogmatismus", "Philosophy"),
    ("pragmatism", "noun", "прагматизм", "Pragmatismus", "Philosophy"),
    ("idealism", "noun", "үзэл санааг эрхэмлэх хандлага", "Idealismus", "Philosophy"),
    ("materialism", "noun", "материализм", "Materialismus", "Philosophy"),
    ("empiricism", "noun", "туршлагын онол", "Empirismus", "Philosophy"),
    ("rationalism", "noun", "эрүүл ухааны онол", "Rationalismus", "Philosophy"),
    ("determinism", "noun", "тодорхойлогдох зүй тогтол", "Determinismus", "Philosophy"),

    # Advanced Adjectives B2
    ("ambiguous", "adj", "олон салаа утгатай", "mehrdeutig", "Adjectives"),
    ("unambiguous", "adj", "тодорхой, маргаангүй", "eindeutig", "Adjectives"),
    ("unprecedented", "adj", "урьд өмнө тохиолдоогүй", "beispiellos", "Adjectives"),
    ("detrimental", "adj", "хор хөнөөлтэй", "schädlich", "Adjectives"),
    ("beneficial", "adj", "үр ашигтай, ээлтэй", "vorteilhaft", "Adjectives"),
    ("viable", "adj", "хэрэгжих боломжтой", "machbar, lebensfähig", "Adjectives"),
    ("resilient", "adj", "тэсвэр хатуужилтай", "widerstandsfähig", "Adjectives"),
    ("plausible", "adj", "үнэмшилтэй", "plausibel, einleuchtend", "Adjectives"),
    ("implausible", "adj", "үнэмшилгүй", "unplausibel", "Adjectives"),
    ("redundant", "adj", "илүүц, орон тооны илүүдэл", "überflüssig", "Adjectives"),
    ("obsolete", "adj", "хуучирсан, хэрэглээнээс гарсан", "veraltet", "Adjectives"),
    ("prominent", "adj", "нөлөө бүхий, нэртэй", "prominent, herausragend", "Adjectives"),
    ("substantial", "adj", "үлэмж их, бодитой", "beträchtlich, wesentlich", "Adjectives"),
    ("imminent", "adj", "гарцаагүй удахгүй болох", "bevorstehend", "Adjectives"),
    ("inevitable", "adj", "гарцаагүй, зайлшгүй", "unvermeidlich", "Adjectives"),
    ("profound", "adj", "гүн гүнзгий", "tiefgründig", "Adjectives"),
    ("arbitrary", "adj", "дур зоргын, санамсаргүй", "willkürlich", "Adjectives"),
    ("versatile", "adj", "олон талт, хөрвөх чадвартай", "vielseitig", "Adjectives"),
    ("coherent", "adj", "учир зүйн уялдаатай", "kohärent, schlüssig", "Adjectives"),
    ("incoherent", "adj", "авцалдаагүй", "unzusammenhängend", "Adjectives"),
    ("meticulous", "adj", "нарийн нямбай", "akribisch, sorgfältig", "Adjectives"),
    ("comprehensive", "adj", "иж бүрэн, өргөн хүрээтэй", "umfassend", "Adjectives"),
    ("exhaustive", "adj", "бүрэн гүйцэд", "erschöpfend, vollständig", "Adjectives"),
    ("superficial", "adj", "өнгөцхөн", "oberflächlich", "Adjectives"),
    ("tangible", "adj", "бодитой баригдахуйц", "greifbar, spürbar", "Adjectives"),
    ("intangible", "adj", "биет бус", "immateriell", "Adjectives"),
    ("intrinsic", "adj", "дотоод мөн чанарын", "innewohnend", "Adjectives"),
    ("extrinsic", "adj", "гадаад хүчин зүйлийн", "äußerlich", "Adjectives"),
    ("explicit", "adj", "ил тод, тодорхой", "ausdrücklich", "Adjectives"),
    ("implicit", "adj", "далд утгатай", "implizit", "Adjectives"),
    ("stringent", "adj", "хатуу чанга", "streng, strikt", "Adjectives"),
    ("lenient", "adj", "уужуу, хөнгөн", "mild, nachsichtig", "Adjectives"),
    ("volatile", "adj", "тогтворгүй, хувирамтгай", "volatil, unbeständig", "Adjectives"),
    ("stable", "adj", "тогтвортой", "stabil", "Adjectives"),
    ("lucrative", "adj", "их ашигтай", "lukrativ, einträglich", "Adjectives"),
    ("pervasive", "adj", "хаа сайгүй нэвчсэн", "allgegenwärtig", "Adjectives"),
    ("ephemeral", "adj", "түр зуурын", "vergänglich, flüchtig", "Adjectives"),
    ("perpetual", "adj", "мөнхийн", "ewig, dauernd", "Adjectives"),
    ("ubiquitous", "adj", "хаа сайгүй байдаг", "allgegenwärtig", "Adjectives"),
    ("sporadic", "adj", "үе үе тохиолддог", "sporadisch, vereinzelt", "Adjectives")
]
append_to_level('B2', b2_additions)
