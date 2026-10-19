import json

with open("/root/arl/data/b1_words.json", "r", encoding="utf-8") as f:
    words = json.load(f)

# Find duplicates
seen = set()
duplicates_idx = []
for idx, w in enumerate(words):
    norm = w["word"].strip().lower()
    if norm in seen:
        duplicates_idx.append(idx)
    else:
        seen.add(norm)

print(f"Found {len(duplicates_idx)} duplicate entries to replace.")

# Bank of 85 unique, high-quality B1 Goethe-Zertifikat German words with authentic Mongolian translations:
replacement_bank = [
    # Nouns
    ("Gleichgewicht", "das", "-e", "noun", "тэнцвэр, тэнцвэрт байдал", "Sport hilft dabei, das innere Gleichgewicht zu finden.", "Спорт нь дотоод тэнцвэрээ олоход тусалдаг.", "Gesundheit & Ernährung"),
    ("Mittelpunkt", "der", "-e", "noun", "төв цэг, анхаарлын төв", "Der Mensch steht im Mittelpunkt unserer Bemühungen.", "Хүн бол бидний хүчин чармайлтын төвд байдаг.", "Diskurs & Logik"),
    ("Verhalten", "das", "-", "noun", "зан төлөв, биеэ авч явах байдал", "Sein vorbildliches Verhalten beeindruckte die Lehrer.", "Түүний үлгэр жишээ зан төлөв багш нарт гүн сэтгэгдэл төрүүлэв.", "Gefühle & Beziehungen"),
    ("Gelegenheit", "die", "-en", "noun", "боломж, тохиол", "Diese seltene Gelegenheit sollten wir unbedingt nutzen.", "Энэхүү ховор боломжийг бид заавал ашиглах ёстой.", "Alltag & Beruf"),
    ("Erlaubnis", "die", "-se", "noun", "зөвшөөрөл", "Ohne schriftliche Erlaubnis darf man das Gelände nicht betreten.", "Бичгээр өгсөн зөвшөөрөлгүйгээр тухайн талбайд нэвтрэхийг хориглоно.", "Gesellschaft & Recht"),
    ("Hindernis", "das", "-se", "noun", "саад бартаа", "Gemeinsam überwanden sie jedes Hindernis auf dem Weg.", "Тэд замдаа тааралдсан аливаа саад бартааг хамтдаа даван туулав.", "Diskurs & Logik"),
    ("Entwicklung", "die", "-en", "noun", "хөгжил, өөрчлөлт", "Die wirtschaftliche Entwicklung der Region ist positiv.", "Бүс нутгийн эдийн засгийн хөгжил эерэг байна.", "Wirtschaft & Finanzen"),
    ("Führungskraft", "die", '-e', "noun", "удирдах ажилтан, манлайлагч", "Sie arbeitet seit zehn Jahren als erfolgreiche Führungskraft.", "Тэр арван жилийн турш амжилттай манлайлагчаар ажиллаж байна.", "Beruf & Arbeit"),
    ("Kompromiss", "der", "-e", "noun", "тохиролцоо, буулт", "Nach langen Verhandlungen schlossen sie einen Kompromiss.", "Удаан үргэлжилсэн хэлэлцээрийн дараа тэд харилцан буулт хийв.", "Gesellschaft & Recht"),
    ("Mangel", "der", "Mängel", "noun", "дутагдал, хомсдол", "Der akute Mangel an Lehrkräften ist ein großes Problem.", "Багш нарын хурц хомсдол бол томоохон асуудал юм.", "Bildung & Wissenschaft"),
    ("Bereich", "der", "-e", "noun", "салбар, хүрээ", "In diesem Bereich gibt es noch viel Forschungsbedarf.", "Энэ салбарт судалгаа шинжилгээ хийх хэрэгцээ их байна.", "Bildung & Wissenschaft"),
    ("Maßnahme", "die", "-n", "noun", "арга хэмжээ", "Die Regierung ergreift strengere Maßnahmen gegen Umweltverschmutzung.", "Засгийн газар байгаль орчны бохирдлын эсрэг илүү хатуу арга хэмжээ авч байна.", "Umwelt & Nachhaltigkeit"),
    ("Zustand", "der", '-e', "noun", "байдал, төлөв байдал", "Das historische Gebäude befindet sich in einem sehr guten Zustand.", "Түүхэн барилга маш сайн нөхцөл байдалд хадгалагдаж байна.", "Wohnen & Mobilität"),
    ("Wettbewerb", "der", "-e", "noun", "өрсөлдөөн, тэмцээн", "Sie gewann den ersten Preis im bundesweiten Vorlesewettbewerb.", "Тэр улсын хэмжээний уран уншлагын тэмцээнд тэргүүн байр эзлэв.", "Bildung & Wissenschaft"),
    ("Ereignis", "das", "-se", "noun", "үйл явдал", "Das Musikfestival war ein unvergessliches Ereignis.", "Хөгжмийн наадам мартагдашгүй үйл явдал байлаа.", "Medien & Technologie"),
    ("Schwerpunkt", "der", "-e", "noun", "гол чиглэл, гол анхаарал", "Der Schwerpunkt seiner Arbeit liegt auf digitaler Bildung.", "Түүний ажлын гол чиглэл цахим боловсролд чиглэдэг.", "Bildung & Wissenschaft"),
    ("Besonderheit", "die", "-en", "noun", "онцлог шинж", "Eine Besonderheit dieser Sprache sind die langen Komposita.", "Энэ хэлний нэг онцлог бол урт нийлмэл үгс юм.", "Bildung & Wissenschaft"),
    ("Gefahr", "die", "-en", "noun", "аюул, эрсдэл", "Rauchen erhöht die Gefahr von Herz-Kreislauf-Erkrankungen.", "Тамхи татах нь зүрх судасны өвчний аюулыг нэмэгдүүлдэг.", "Gesundheit & Ernährung"),
    ("Kenntnis", "die", "-se", "noun", "мэдлэг, чадвар", "Solide Deutschkenntnisse eröffnen viele Türen.", "Герман хэлний бат бөх мэдлэг олон үүд хаалгыг нээдэг.", "Bildung & Wissenschaft"),
    ("Überblick", "der", "-e", "noun", "тойм, ерөнхий ойлголт", "Das erste Kapitel gibt einen guten Überblick über das Thema.", "Эхний бүлэг нь тухайн сэдвийн талаар сайн тойм ойлголт өгдөг.", "Diskurs & Logik"),
    ("Einfluss", "der", '-e', "noun", "нөлөө, нөлөөлөл", "Eltern haben großen Einfluss auf die Entwicklung ihrer Kinder.", "Эцэг эхчүүд хүүхдийнхээ хөгжилд асар их нөлөө үзүүлдэг.", "Gefühle & Beziehungen"),
    ("Veranstaltung", "die", "-en", "noun", "арга хэмжээ, уулзалт цуглаан", "Die kulturelle Veranstaltung lockte hunderte Besucher an.", "Соёлын арга хэмжээ олон зуун үзэгчдийг татав.", "Gesellschaft & Recht"),
    ("Unterlagen", "die", "-", "noun", "бичиг баримт (олон тоо)", "Bitte reichen Sie die vollständigen Bewerbungsunterlagen ein.", "Өргөдлийн бичиг баримтыг бүрэн эхээр нь өгнө үү.", "Beruf & Arbeit"),
    ("Ergebnis", "das", "-se", "noun", "үр дүн", "Das erfreuliche Ergebnis belohnte ihre harte Arbeit.", "Баярт үр дүн нь тэдний шаргуу хөдөлмөрийг шагналаа.", "Diskurs & Logik"),
    ("Zielgruppe", "die", "-n", "noun", "зорилтот бүлэг", "Jugendliche sind die wichtigste Zielgruppe dieser Plattform.", "Өсвөр үеийнхэн энэ платформын гол зорилтот бүлэг юм.", "Medien & Technologie"),
    ("Aussage", "die", "-n", "noun", "мэдүүлэг, мэдэгдэл", "Seine klare Aussage beseitigte alle Zweifel.", "Түүний тодорхой мэдэгдэл бүх эргэлзээг арилгав.", "Gesellschaft & Recht"),
    ("Abstimmung", "die", "-en", "noun", "санал хураалт", "Die Mehrheit stimmte für den neuen Vorschlag.", "Олонх нь шинэ саналын төлөө саналаа өгөв.", "Gesellschaft & Recht"),
    ("Herausforderung", "die", "-en", "noun", "сорилт, бэрхшээл", "Der Klimawandel ist die größte globale Herausforderung.", "Уур амьсгалын өөрчлөлт бол дэлхийн хамгийн том сорилт юм.", "Umwelt & Nachhaltigkeit"),
    ("Forschung", "die", "-en", "noun", "судалгаа шинжилгээ", "Die medizinische Forschung rettet täglich Leben.", "Анагаахын судалгаа өдөр бүр хүний амь насыг авардаг.", "Bildung & Wissenschaft"),
    ("Gleichberechtigung", "die", "-en", "noun", "эрх тэгш байдал", "Gleichberechtigung ist gesetzlich festgeschrieben.", "Тэгш эрхийг хуулиар бататгасан байдаг.", "Gesellschaft & Recht"),
    
    # Verbs
    ("feststellen", None, None, "verb", "илрүүлэх, тодорхойлох", "Der Techniker konnte die Ursache des Problems feststellen.", "Техникч асуудлын шалтгааныг тодорхойлж чадсан.", "Medien & Technologie"),
    ("beeinflussen", None, None, "verb", "нөлөөлөх", "Das Wetter beeinflusst unsere Stimmung oft unbemerkt.", "Цаг агаар бидний сэтгэл санаанд мэдэгдэлгүйгээр нөлөөлдөг.", "Gefühle & Beziehungen"),
    ("vorbereiten", None, None, "verb", "бэлтгэх", "Sie bereitet sich gründlich auf die Sprachprüfung vor.", "Тэр хэлний шалгалтдаа маш сайн бэлдэж байна.", "Bildung & Wissenschaft"),
    ("überwinden", None, None, "verb", "даван туулах", "Mit Willenskraft kann man jede Krise überwinden.", "Хүсэл зоригийн хүчээр ямар ч хямралыг даван туулж болно.", "Diskurs & Logik"),
    ("ermöglichen", None, None, "verb", "боломж олгох", "Ein Stipendium ermöglichte ihr das Studium in München.", "Тэтгэлэг нь түүнд Мюнхенд суралцах боломжийг олгосон юм.", "Bildung & Wissenschaft"),
    ("beurteilen", None, None, "verb", "шүүн тунгаах, үнэлэх", "Man sollte Menschen nicht nach ihrem Aussehen beurteilen.", "Хүнийг гадаад үзэмжээр нь дүгнэж болохгүй.", "Gefühle & Beziehungen"),
    ("zusammenfassen", None, None, "verb", "хураангуйлах", "Fassen Sie die Hauptgedanken in fünf Sätzen zusammen.", "Гол санааг таван өгүүлбэрт хураангуйлан бичээрэй.", "Bildung & Wissenschaft"),
    ("auswählen", None, None, "verb", "сонгох, шилж авах", "Aus dem Katalog wählte sie einen bequemen Schreibtischstuhl aus.", "Каталогиос тэр тухтай бичгийн ширээний сандал сонгов.", "Wohnen & Mobilität"),
    ("begründen", None, None, "verb", "үндэслэл гаргах", "Er konnte seine Meinung mit überzeugenden Beispielen begründen.", "Тэр өөрийн санаагаа үнэмшилтэй жишээгээр үндэслэж чадсан.", "Diskurs & Logik"),
    ("empfehlen", None, None, "verb", "зөвлөх, санал болгох", "Ich kann dieses Lehrbuch jedem B1-Lerner wärmstens empfehlen.", "Би энэ сурах бичгийг B1 түвшний хүн бүрт чин сэтгэлээсээ зөвлөж байна.", "Bildung & Wissenschaft"),
    ("nachdenken", None, None, "verb", "тунгаан бодох", "Vor einer wichtigen Entscheidung sollte man in Ruhe nachdenken.", "Чухал шийдвэр гаргахаас өмнө тайван тунгаан бодох хэрэгтэй.", "Gefühle & Beziehungen"),
    ("vergleichen", None, None, "verb", "харьцуулах", "Vergleichen Sie die Preise, bevor Sie das Ticket kaufen.", "Тасалбар авахаасаа өмнө үнийг нь харьцуулж үзээрэй.", "Wirtschaft & Finanzen"),
    ("entdecken", None, None, "verb", "нээх, шинээр илрүүлэх", "Auf der Reise entdeckte sie viele neue kulinarische Spezialitäten.", "Аяллын явцад тэр олон шинэ амтат зоогийг нээж танилцсан.", "Alltag & Kultur"),
    ("berücksichtigen", None, None, "verb", "тооцож үзэх, харгалзах", "Bei der Planung müssen wir das Wetter berücksichtigen.", "Төлөвлөлт хийхдээ бид цаг агаарыг харгалзан үзэх ёстой.", "Diskurs & Logik"),
    ("beibehalten", None, None, "verb", "хэвээр хадгалах", "Gute Gewohnheiten sollte man langfristig beibehalten.", "Сайн зуршлыг урт хугацаанд хэвээр хадгалах нь зүйтэй.", "Gefühle & Beziehungen"),
    ("verursachen", None, None, "verb", "үүсгэх, шалтгаалах", "Starker Schneefall verursachte schwere Unfälle auf der Autobahn.", "Хүчтэй цас хурдны зам дээр хүнд осол үүсгэв.", "Wohnen & Mobilität"),
    ("überzeugen", None, None, "verb", "үнэмшүүлэх, итгүүлэх", "Ihre Argumente konnten das gesamte Gremium überzeugen.", "Түүний нотолгоо бүх комиссыг үнэмшүүлж чадсан.", "Diskurs & Logik"),
    ("beschädigen", None, None, "verb", "гэмтээх, эвдэх", "Der Sturm beschädigte das Ziegeldach des Wohnhauses.", "Шуурга байшингийн вааран дээврийг гэмтээжээ.", "Wohnen & Mobilität"),
    ("unterbrechen", None, None, "verb", "таслах, завсарлах", "Bitte unterbrich mich nicht, wenn ich spreche.", "Намайг ярьж байхад битгий яриа таслаарай.", "Medien & Technologie"),
    ("ersetzen", None, None, "verb", "орлуулах, солих", "Alte Glühbirnen wurden durch sparsame LEDs ersetzt.", "Хуучин чийдэнгүүдийг хэмнэлттэй лед гэрлээр сольсон.", "Umwelt & Nachhaltigkeit"),
    ("verwirklichen", None, None, "verb", "хэрэгжүүлэх, биелүүлэх", "Sie konnte endlich ihren Lebenstraum verwirklichen.", "Тэр эцэст нь амьдралынхаа мөрөөдлийг биелүүлж чаджээ.", "Gefühle & Beziehungen"),
    ("ausdrücken", None, None, "verb", "илэрхийлэх", "Auf Deutsch kann er sich bereits fließend ausdrücken.", "Герман хэлээр тэр аль хэдийн чөлөөтэй санаагаа илэрхийлж чаддаг.", "Bildung & Wissenschaft"),
    ("bestehen", None, None, "verb", "оршин тогтнох, шалгалтад тэнцэх", "Die Prüfung bestand sie mit Bravour.", "Тэр шалгалтаа гарамгай сайн давсан.", "Bildung & Wissenschaft"),
    ("beseitigen", None, None, "verb", "арилгах, цэвэрлэх", "Die Helfer beseitigten die Sturmschäden rasch.", "Туслагчид шуурганы хохирлыг хурдан арилгав.", "Wohnen & Mobilität"),
    ("erkunden", None, None, "verb", "хайгуул хийх, судалж мэдэх", "Am ersten Tag erkundeten wir die historische Altstadt zu Fuß.", "Эхний өдөр бид түүхэн хуучин хотыг явган алхаж танилцсан.", "Wohnen & Mobilität"),
    ("beweisen", None, None, "verb", "нотолж харуулах", "Die Studie beweist den Zusammenhang zwischen Sport und Gesundheit.", "Судалгаа нь спорт ба эрүүл мэндийн уялдааг нотолж байна.", "Gesundheit & Ernährung"),
    ("verpassen", None, None, "verb", "алдах, өнгөрөөх", "Lass dir diese hervorragende Chance nicht entgehen und verpasse sie nicht.", "Энэхүү гайхалтай боломжийг алдалгүй ашиглаарай.", "Alltag & Beruf"),
    ("gestalten", None, None, "verb", "хэлбэржүүлэх, зохион байгуулах", "Wir gestalten unsere Zukunft aktiv und nachhaltig.", "Бид ирээдүйгээ идэвхтэй бөгөөд тогтвортой байдлаар бүтээдэг.", "Diskurs & Logik"),
    ("verbinden", None, None, "verb", "холбох, нийлүүлэх", "Die Brücke verbindet die beiden Stadtteile über den Fluss.", "Гүүр голын дээгүүр хоёр дүүргийг холбодог.", "Wohnen & Mobilität"),
    ("ermitteln", None, None, "verb", "илрүүлэх, олж мэдэх", "Die Polizei ermittelt die genaue Unfallursache.", "Цагдаа нар ослын нарийн шалтгааныг тодруулж байна.", "Gesellschaft & Recht"),

    # Adjectives & Adverbs
    ("fortschrittlich", None, None, "adjective", "дэвшилтэт, ололттой", "Das Land setzt auf eine fortschrittliche Bildungspolitik.", "Тус улс дэвшилтэт боловсролын бодлогыг эрхэмлэдэг.", "Bildung & Wissenschaft"),
    ("bedauerlich", None, None, "adjective", "харамсалтай", "Es ist bedauerlich, dass die Veranstaltung ausfallen musste.", "Арга хэмжээ цуцлагдах болсон нь харамсалтай.", "Gefühle & Beziehungen"),
    ("vorbildlich", None, None, "adjective", "үлгэр жишээ", "Sein Engagement für den Umweltschutz ist wirklich vorbildlich.", "Түүний байгаль хамгаалах зүтгэл үнэхээр үлгэр жишээ юм.", "Umwelt & Nachhaltigkeit"),
    ("zeitgenössisch", None, None, "adjective", "орчин үеийн, өнөөгийн", "Das Museum stellt zeitgenössische Kunst aus.", "Музей орчин үеийн урлагийн бүтээлийг дэлгэн үзүүлдэг.", "Bildung & Wissenschaft"),
    ("vollkommen", None, None, "adjective", "төгс төгөлдөр", "Niemand auf dieser Welt ist vollkommen fehlerfrei.", "Энэ хорвоод хэн ч төгс төгөлдөр алдаагүй биш.", "Gefühle & Beziehungen"),
    ("ausgezeichnet", None, None, "adjective", "онц сайн, гарамгай", "Ihr Vortrag war fachlich und rhetorisch ausgezeichnet.", "Түүний илтгэл мэргэжлийн болон илтгэх ур чадварын хувьд онц сайн байв.", "Bildung & Wissenschaft"),
    ("nachvollziehbar", None, None, "adjective", "ойлгогдохуйц, ухаарч болохуйц", "Ihre Entscheidung ist für alle Beteiligten nachvollziehbar.", "Түүний шийдвэр оролцогч бүх хүнд ойлгогдохуйц байна.", "Diskurs & Logik"),
    ("ausführlich", None, None, "adjective", "дэлгэрэнгүй, дэлгэр", "In dem Handbuch finden Sie eine ausführliche Anleitung.", "Гарын авлагаас та дэлгэрэнгүй зааврыг олох болно.", "Medien & Technologie"),
    ("vielfältig", None, None, "adjective", "олон талт, баялаг", "Das Kulturangebot in Berlin ist ungemein vielfältig.", "Берлин дэх соёлын арга хэмжээнүүд ер бусын олон талт баялаг байдаг.", "Gesellschaft & Recht"),
    ("wesentlich", None, None, "adjective", "чухал, суурь ач холбогдолтой", "Das ist ein wesentlicher Unterschied zwischen beiden Methoden.", "Энэ бол хоёр аргын хоорондох маш чухал ялгаа юм.", "Diskurs & Logik"),
    ("kontinuierlich", None, None, "adjective", "тасралтгүй, үргэлжилсэн", "Ein kontinuierlicher Lernprozess bringt die besten Resultate.", "Тасралтгүй суралцах үйл явц хамгийн шилдэг үр дүнг авчирдаг.", "Bildung & Wissenschaft"),
    ("verantwortungsvoll", None, None, "adjective", "хариуцлагатай", "Sie geht verantwortungsvoll mit ihren Aufgaben um.", "Тэр өөрийн үүрэг даалгаварт хариуцлагатай ханддаг.", "Beruf & Arbeit"),
    ("ansprechend", None, None, "adjective", "сэтгэл татам, аятайхан", "Das Design der App ist modern und ansprechend gestaltet.", "Аппликейшний загвар нь орчин үеийн бөгөөд сэтгэл татам болжээ.", "Medien & Technologie"),
    ("wirkungsvoll", None, None, "adjective", "үр нөлөө ихтэй, хүчтэй", "Sport ist ein wirkungsvolles Mittel gegen Stress.", "Спорт бол стрессийн эсрэг үр нөлөө ихтэй арга мөн.", "Gesundheit & Ernährung"),
    ("vorstellbar", None, None, "adjective", "төсөөлж болохуйц", "Vor zehn Jahren war so eine Technologie kaum vorstellbar.", "Арван жилийн өмнө ийм технологи төсөөлөхөд ч бэрх байлаа.", "Medien & Technologie"),
    ("unentbehrlich", None, None, "adjective", "зайлшгүй хэрэгтэй, орлуулшгүй", "Das Smartphone ist aus dem Alltag kaum noch wegzudenken und unentbehrlich.", "Ухаалаг утас өдөр тутмын амьдралд зайлшгүй чухал зүйл болжээ.", "Medien & Technologie"),
    ("überzeugend", None, None, "adjective", "үнэмшилтэй", "Seine Beweisführung war lückenlos und überzeugend.", "Түүний нотолгоо нь няцаах аргагүй үнэмшилтэй байв.", "Diskurs & Logik"),
    ("aufmerksam", None, None, "adjective", "анхааралтай", "Ein aufmerksamer Zuhörer merkt sich Details schnell.", "Анхааралтай сонсогч нарийн зүйлсийг түргэн тогтоодог.", "Gefühle & Beziehungen"),
    ("verlässlich", None, None, "adjective", "найдвартай, итгэл даадаг", "Er ist ein verlässlicher Partner bei allen Projekten.", "Тэр бүх төсөлд найдвартай түнш байж чаддаг.", "Beruf & Arbeit"),
    ("sorgfältig", None, None, "adjective", "нямбай, хичээнгүй", "Sie las den Vertrag vor der Unterschrift sorgfältig durch.", "Тэр гарын үсэг зурахаасаа өмнө гэрээг нямбай уншиж танилцав.", "Gesellschaft & Recht"),
    ("eindeutig", None, None, "adverb", "тодорхойгоор, илт", "Das Ergebnis spricht eine eindeutige Sprache.", "Үр дүн нь маш тодорхой хариултыг хэлж байна.", "Diskurs & Logik"),
    ("stets", None, None, "adverb", "үргэлж, ямагт", "Er war stets pünktlich und gut vorbereitet.", "Тэр үргэлж цагтаа ирдэг бөгөөд сайн бэлтгэлтэй байдаг.", "Beruf & Arbeit"),
    ("bereits", None, None, "adverb", "аль хэдийн", "Bereits nach zwei Wochen konnte sie einfache Gespräche führen.", "Хоёрхон долоо хоногийн дараа тэр энгийн яриа өрнүүлж чадаж байв.", "Bildung & Wissenschaft"),
    ("allmählich", None, None, "adverb", "аажмаар, алгуурхан", "Das Sprachgefühl entwickelt sich allmählich mit der Übung.", "Хэлний мэдрэмж дадлага хийх тусам аажмаар хөгждөг.", "Bildung & Wissenschaft"),
    ("außerordentlich", None, None, "adverb", "ер бусын, туйлын", "Die Nachfrage nach der App war außerordentlich hoch.", "Аппликейшний эрэлт ер бусын өндөр байлаа.", "Wirtschaft & Finanzen"),
    ("jederzeit", None, None, "adverb", "хэзээ ч, ямар ч цагт", "Bei Unklarheiten können Sie mich jederzeit fragen.", "Эргэлзээтэй зүйл гарвал та надаас хэдийд ч асууж болно.", "Bildung & Wissenschaft"),
    ("sicherlich", None, None, "adverb", "лавтайяа, эргэлзээгүй", "Das Sprachenlernen wird sicherlich dein Leben bereichern.", "Хэл сурах нь лавтайяа чиний амьдралыг баяжуулах болно.", "Gefühle & Beziehungen"),
    ("überraschenderweise", None, None, "adverb", "санаанд оромгүй байдлаар", "Überraschenderweise bestand er die Prüfung mit Auszeichnung.", "Санаанд оромгүй байдлаар тэр шалгалтыг онц сайн дүнтэй давсан.", "Bildung & Wissenschaft")
]

# Apply substitutions for the duplicates
rep_i = 0
for d_idx in duplicates_idx:
    if rep_i >= len(replacement_bank):
        break
    item = replacement_bank[rep_i]
    rep_i += 1
    
    word, article, plural, pos, mn, ex_de, ex_mn, topic = item
    disp = f"{article} {word}, {plural}" if pos == "noun" and article else word
    old_w = words[d_idx]["word"]
    words[d_idx] = {
        "id": words[d_idx]["id"],
        "word": word,
        "article": article,
        "plural": plural,
        "display": disp,
        "pos": pos,
        "mn": mn,
        "example_de": ex_de,
        "example_mn": ex_mn,
        "topic": topic,
        "level": "B1"
    }
    print(f"Replaced duplicate at index {d_idx+1} ('{old_w}') with '{word}'")

# Re-check uniqueness
seen2 = set()
dup_count = 0
for w in words:
    norm = w["word"].strip().lower()
    if norm in seen2:
        dup_count += 1
    seen2.add(norm)

print(f"Total entries: {len(words)}, Distinct unique words: {len(seen2)}, Remaining dups: {dup_count}")

# Save deduplicated master b1_words.json
with open("/root/arl/data/b1_words.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

# Also update the modular files
modules_dir = "/root/arl/data/modules"
for i in range(1, 11):
    chunk = words[(i-1)*100 : i*100]
    with open(f"{modules_dir}/module_{i:02d}.json", "w", encoding="utf-8") as f:
        json.dump(chunk, f, ensure_ascii=False, indent=2)

print("Updated modular files successfully!")
