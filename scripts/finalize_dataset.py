import json

with open("/root/arl/data/b1_words.json", "r", encoding="utf-8") as f:
    words = json.load(f)

replacements_24 = {
    495: ("Erschöpfung", "die", "-en", "noun", "туйлдаж ядрах, туйлдал", "Nach dem Marathon spürte er tiefe Erschöpfung.", "Марафоны дараа тэр асар их ядаргаа туйлдлыг мэдрэв.", "Gesundheit & Ernährung"),
    509: ("Lehrstoff", "der", "-e", "noun", "хичээлийн агуулга, сэдэв", "Der gesamte Lehrstoff wird bis Mai durchgenommen.", "Бүх хичээлийн агуулгыг тавдугаар сар гэхэд үзэж дуусна.", "Bildung & Wissenschaft"),
    516: ("Begabung", "die", "-en", "noun", "авьяас билэг", "Ihre musikalische Begabung zeigte sich früh.", "Түүний хөгжмийн авьяас эрт илэрсэн.", "Bildung & Wissenschaft"),
    570: ("erforschen", None, None, "verb", "судлан шинжлэх", "Wissenschaftler erforschen das Verhalten der Tiefseeorganismen.", "Эрдэмтэд гүний тэнгисийн бичил биетний зан төлөвийг судлан шинжилж байна.", "Bildung & Wissenschaft"),
    571: ("publizieren", None, None, "verb", "хэвлэн нийтлэх", "Der Professor publizierte eine wegweisende Studie.", "Профессор шинэ замыг нээсэн чухал судалгаа нийтлүүлэв.", "Bildung & Wissenschaft"),
    572: ("befragen", None, None, "verb", "асууж лавлах, санал асуух", "Die Forscher befragten tausend Bürger.", "Судлаачид мянган иргэнээс санал асуув.", "Bildung & Wissenschaft"),
    573: ("korrigieren", None, None, "verb", "засах, алдааг залруулах", "Die Lehrerin korrigiert die Übungen sorgfältig.", "Багш дасгалуудыг нямбайлан засаж байна.", "Bildung & Wissenschaft"),
    579: ("einprägen", None, None, "verb", "тогтоож цээжлэх (sich einprägen)", "Mit der ARL-App prägt man sich neue Wörter mühelos ein.", "ARL аппликейшнээр шинэ үгсийг төвөггүй цээжилдэг.", "Bildung & Wissenschaft"),
    583: ("einschätzen", None, None, "verb", "үнэлж дүгнэх", "Wie schätzen Sie Ihre aktuellen Sprachkenntnisse ein?", "Та өөрийн одоогийн хэлний мэдлэгээ хэрхэн үнэлж байна вэ?", "Bildung & Wissenschaft"),
    586: ("formulieren", None, None, "verb", "томьёолох, найруулах", "Formulieren Sie den Hauptsatz klar und präzise.", "Гол санаагаа тодорхой бөгөөд оновчтой найруулаарай.", "Bildung & Wissenschaft"),
    588: ("zitieren", None, None, "verb", "эш татах, ишлэл авах", "Er zitierte mehrere bekannte Philosophen in seiner Rede.", "Тэр илтгэлдээ хэд хэдэн алдартай философичдоос эш татав.", "Bildung & Wissenschaft"),
    649: ("herausgeben", None, None, "verb", "эрхлэн гаргах, нийтлэх", "Das Institut gibt monatlich einen Bericht heraus.", "Хүрээлэн сар бүр тайлан эрхлэн гаргадаг.", "Medien & Technologie"),
    663: ("funktionieren", None, None, "verb", "ажиллах (техник)", "Die mobile App funktioniert auch im Flugmodus einwandfrei.", "Гар утасны апп онгоцны горимд ч ямар ч доголдолгүй ажилладаг.", "Medien & Technologie"),
    689: ("archivieren", None, None, "verb", "архивлах, хадгалах", "Alte E-Mails lassen sich sicher archivieren.", "Хуучин имэйлүүдийг найдвартай архивлаж болно.", "Medien & Technologie"),
    778: ("entlasten", None, None, "verb", "ачааллыг хөнгөлөх", "Die neue Umgehungsstraße entlastet das Stadtzentrum.", "Шинэ тойрох зам хотын төвийн ачааллыг хөнгөвчилдөг.", "Wohnen & Mobilität"),
    785: ("beschleunigen", None, None, "verb", "хурдасгах", "Der ICE beschleunigte auf dreihundert Stundenkilometer.", "Хурдан галт тэрэг цагт гурван зуун километр хүртэл хурдаа нэмэв.", "Wohnen & Mobilität"),
    787: ("transportieren", None, None, "verb", "тээвэрлэх, зөөх", "Schiffe transportieren schwere Fracht über die Weltmeere.", "Усан онгоцууд далайгаар хүнд ачаа тээвэрлэдэг.", "Wohnen & Mobilität"),
    789: ("einbiegen", None, None, "verb", "эргэх (булангаар)", "An der Ampel müssen wir nach rechts einbiegen.", "Гэрлэн дохион дээр бид баруун гар тийш эргэх ёстой.", "Wohnen & Mobilität"),
    840: ("einfühlsam", None, None, "adjective", "мэдрэмжтэй, бусдыг ойлгодог", "Eine einfühlsame Reaktion schenkt Geborgenheit.", "Бусдыг ойлгосон мэдрэмжтэй хариу үйлдэл нь сэтгэлийн тайвшрал өгдөг.", "Gefühle & Beziehungen"),
    864: ("erleichtert", None, None, "adjective", "уужирсан, тайвширсан", "Nach dem erlösenden Anruf war sie sichtlich erleichtert.", "Тайвшруулсан дуудлагын дараа түүний сэтгэл илт уужирсан байв.", "Gefühle & Beziehungen"),
    881: ("rücksichtsvoll", None, None, "adjective", "бусдыг харгалздаг, хүндэтгэлтэй", "Rücksichtsvolles Verhalten vermeidet Streit.", "Бусдыг хүндэтгэсэн зан үйл маргаанаас сэргийлдэг.", "Gefühle & Beziehungen"),
    889: ("hilfsbereit", None, None, "adjective", "тусархаг", "Der Nachbar war stets überaus hilfsbereit.", "Хөрш үргэлж туйлын тусархаг зантай байсан.", "Gefühle & Beziehungen"),
    898: ("treu", None, None, "adjective", "үнэнч, итгэлтэй", "Ein treuer Freund hält in jeder Notlage zu dir.", "Үнэнч найз ямар ч хүнд үед чамтай хамт байна.", "Gefühle & Beziehungen"),
    930: ("Zwischenstand", "der", "'-e", "noun", "завсрын дүн, явцын байдал", "Der aktuelle Zwischenstand des Projekts stimmt optimistisch.", "Төслийн одоогийн явцын дүн өөдрөг сэтгэгдэл төрүүлж байна.", "Diskurs & Logik"),
    981: ("zweifelsohne", None, None, "adverb", "эргэлзээгүйгээр", "Das ist zweifelsohne ein großer Meilenstein.", "Энэ бол эргэлзээгүй том түүхэн амжилт юм.", "Diskurs & Logik")
}

for idx, (word, article, plural, pos, mn, ex_de, ex_mn, topic) in replacements_24.items():
    disp = f"{article} {word}, {plural}" if pos == "noun" and article else word
    words[idx] = {
        "id": words[idx]["id"],
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

# Save final
with open("/root/arl/data/b1_words.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

# Update modules
modules_dir = "/root/arl/data/modules"
for i in range(1, 11):
    chunk = words[(i-1)*100 : i*100]
    with open(f"{modules_dir}/module_{i:02d}.json", "w", encoding="utf-8") as f:
        json.dump(chunk, f, ensure_ascii=False, indent=2)

# Verify
unique_words = set(w["word"].lower() for w in words)
print(f"Final dataset verification: Total entries = {len(words)}, Distinct words = {len(unique_words)}")
assert len(words) == 1000
assert len(unique_words) == 1000
print("100% UNIQUE 1,000 GOETHE B1 WORDS DATASET VERIFIED!")
