# -*- coding: utf-8 -*-
import json
import sys
sys.path.append("/root/ARL/scripts")
from clean_replacement_pool import CLEAN_DE_REPLACEMENT_POOL

existing_de = set()
for lvl in ["a1", "a2", "b1", "b2"]:
    with open(f"/root/ARL/data/de/vocab_{lvl}.json") as f:
        for w in json.load(f):
            existing_de.add(w["word"].strip().lower())

clean_pool = []
for item in CLEAN_DE_REPLACEMENT_POOL:
    w = item[0].strip().lower()
    if w not in existing_de:
        clean_pool.append(item)
        existing_de.add(w)

candidates = [
    ("Albatros", "der", "-se", "noun", "альбатрос шувуу", "Der Albatros segelt majestätisch über den tosenden Ozean.", "Альбатрос шувуу далайн давалгаа дээгүүр сүрлэгээр элин хальдаг.", "Tiere"),
    ("Murmeltier", "das", "-e", "noun", "тарвага", "Das Murmeltier pfeift schrill bei drohender Gefahr.", "Тарвага аюул тулгарахад чангаар исгэрдэг.", "Tiere"),
    ("Biber", "der", "-", "noun", "минж", "Der fleißige Biber baut einen stabilen Damm am Fluss.", "Ажилсаг минж гол дээр бат бөх далан барьдаг.", "Tiere"),
    ("Otter", "der", "-", "noun", "халиу", "Der geschickte Otter taucht im klaren Gebirgsbach nach Fischen.", "Чадамгай халиу уулын тунгалаг горхинд загас барихаар шумбадаг.", "Tiere"),
    ("Kauz", "der", "-¨e", "noun", "ууль шувуу", "In der Dämmerung ruft ein kleiner Kauz im Park.", "Үдшийн бүрэнхийд цэцэрлэгт бяцхан ууль шувуу дуугарна.", "Tiere"),
    ("Specht", "der", "-e", "noun", "тоншуул", "Der bunte Specht klopft laut an den hohlen Baumstamm.", "Алаг тоншуул хөндий модны их биеийг чанга тоншиж байна.", "Tiere"),
    ("Storch", "der", "-¨e", "noun", "өрөвтас шувуу", "Der weiße Storch baut sein großes Nest auf dem Schornstein.", "Цагаан өрөвтас шувуу яндангаар том үүрээ засдаг.", "Tiere"),
    ("Kranich", "der", "-e", "noun", "тогоруу шувуу", "Im Herbst ziehen die Kraniche in V-Formation nach Süden.", "Намар тогоруу шувууд V хэлбэрээр өмнө зүг рүү нүүдэллэдэг.", "Tiere"),
    ("Rebhuhn", "das", "-¨er", "noun", "ятуу шувуу", "Ein scheues Rebhuhn versteckt sich im dichten Kornfeld.", "Ичимхий ятуу шувуу өтгөн тариан талбайд нуугдаж байна.", "Tiere"),
    ("Wachtel", "die", "-n", "noun", "бөднө шувуу", "Wachteln legen kleine, dunkel gesprenkelte Eier.", "Бөднө шувуу жижиг, бараан толботой өндөг гаргадаг.", "Tiere"),
    ("Fasan", "der", "-en", "noun", "хур шувуу, гургуул", "Der farbenprächtige Fasan stolziert stolz über die Wiese.", "Өнгө алагласан гургуул шувуу нуга дээгүүр бардам алхаж байна.", "Tiere"),
    ("Marder", "der", "-", "noun", "суусрын төрлийн булга", "Der flinke Marder klettert lautlos durch die Baumkronen.", "Шаламгай булга модны орой дундуур чимээгүйхэн авирдаг.", "Tiere"),
    ("Hermelin", "das", "-e", "noun", "үен, цагаан булга", "Im kalten Winter wechselt das Hermelin sein Fell zu reinem Weiß.", "Хүйтэн өвлийн цагт үен үсээ цэвэр цагаан өнгөөр сольдог.", "Tiere"),
    ("Wiesel", "das", "-", "noun", "солонго амьтан", "Das Wiesel jagt blitzschnell nach Mäusen im dichten Unterholz.", "Солонго амьтан өтгөн бут сөөгөн дунд хулгана агнахаар цахилгаан мэт хурдалдаг.", "Tiere"),
    ("Iltis", "der", "-se", "noun", "хүрэн үен, өмхий хүрэн", "Der scheue Iltis schleicht nachts um den abgelegenen Hühnerstall.", "Ичимхий өмхий хүрэн шөнийн цагаар алслагдсан тахианы байрны эргэн тойронд гэтдэг.", "Tiere"),
    ("Ziesel", "der", "-", "noun", "зуррам", "Auf der sonnigen Steppe steht der kleine Ziesel kerzengerade.", "Нарлаг тал хээр дээр жижиг зуррам лаа мэт цэх зогсож байна.", "Tiere"),
    ("Blindschleiche", "die", "-n", "noun", "хөлгүй гүрвэл", "Die Blindschleiche ist kein gefährlicher Wurm, sondern eine Eidechse.", "Хөлгүй гүрвэл нь аюултай хорхой биш, харин гүрвэлийн нэг төрөл юм.", "Tiere"),
    ("Salamander", "der", "-", "noun", "саламандра, толбот гүрвэл", "Der schwarz-gelbe Feuersalamander liebt feuchte, kühle Bergwälder.", "Хар шар өнгөт толбот саламандра сэрүүн чийглэг уулын ойд дуртай.", "Tiere"),
    ("Molch", "der", "-e", "noun", "тритон, уст гүрвэл", "Im Frühjahr legt der kleine Molch seine Eier im Gartenteich ab.", "Хавар жижиг уст гүрвэл цэцэрлэгийн цөөрөмд өндгөө шахдаг.", "Tiere"),
    ("Libelle", "die", "-n", "noun", "соно", "Eine blau glänzende Libelle schwebt lautlos über dem Wasser.", "Цэнхэр өнгөөр гялалзах соно усны мандал дээр чимээгүйхэн хөвж байна.", "Tiere")
]

for c in candidates:
    w = c[0].strip().lower()
    if w not in existing_de:
        clean_pool.append(c)
        existing_de.add(w)

with open("/root/ARL/scripts/clean_replacement_pool.py", "w", encoding="utf-8") as f:
    f.write("# -*- coding: utf-8 -*-\n")
    f.write('"""\nClean verified German replacement pool with 0 collisions across A1-B2.\n"""\n\n')
    f.write("CLEAN_DE_REPLACEMENT_POOL = [\n")
    for item in clean_pool:
        f.write(f"    {repr(item)},\n")
    f.write("]\n\n")
    f.write("print(f\"Loaded CLEAN_DE_REPLACEMENT_POOL with {len(CLEAN_DE_REPLACEMENT_POOL)} items.\")\n")

print(f"Rewrote clean_replacement_pool.py with {len(clean_pool)} items.")
