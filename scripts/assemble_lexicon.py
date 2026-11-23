import json
import os
import unicodedata
import sys
sys.path.append('/root/ARL/scripts')
from clean_replacement_pool import CLEAN_DE_REPLACEMENT_POOL
from de_vocab_expansion_bank import DE_A2_EXTRA, DE_B2_EXTRA, DE_C1_EXTRA, DE_C2_EXTRA
from additional_vocab_banks import DE_C1_MORE, DE_C2_MORE
from generate_c1_c2_vocab import get_german_c1_words, get_german_c2_words, get_english_c1_words, get_english_c2_words
from additional_en_banks import EN_REPLACEMENTS, EN_C1_EXTRA_BANK
from final_lexicon_topoffs import DE_C1_TOPOFFS, DE_C2_TOPOFFS, EN_C1_TOPOFFS, EN_C2_TOPOFFS
from lexicon_complete_expansion import DE_C1_EXTRA_25, DE_C2_EXTRA_25, EN_C1_EXTRA_90, EN_C2_EXTRA_105, EN_C1_FINAL_55, EN_C2_FINAL_40, EN_C1_EXTRA_15, EN_C2_EXTRA_6

ROOT = '/root/ARL'

def nfc(s):
    if s is None:
        return None
    return unicodedata.normalize('NFC', str(s).strip())

# Clean animal/nature/food replacements for German A1 (guaranteed NOT in B1 or original A1)
A1_NATURE_BANK = [
    ("Igel", "der", "-", "noun", "зараа", "Der Igel rollt sich bei Gefahr zu einer Kugel zusammen.", "Зараа аюул тулгарахад бөмбөг шиг бөөрөнхий болдог.", "Tiere"),
    ("Fuchs", "der", "-¨e", "noun", "үнэг", "Der schlaue Fuchs schleicht leise durch den Wald.", "Ухаалаг үнэг ой дундуур чимээгүйхэн гэтэж явна.", "Tiere"),
    ("Eichhörnchen", "das", "-", "noun", "хэрэм", "Das kleine Eichhörnchen sammelt Nüsse für den kalten Winter.", "Бяцхан хэрэм хүйтэн өвөлд зориулж самар цуглуулдаг.", "Tiere"),
    ("Dachs", "der", "-e", "noun", "дорго", "Der Dachs schläft tagsüber in seinem tiefen Bau.", "Дорго өдрийн цагаар гүн нүхэндээ унтдаг.", "Tiere"),
    ("Hirsch", "der", "-e", "noun", "буга, халиун буга", "Der stolze Hirsch trägt ein mächtiges Geweih.", "Сүрлэг буга хүчирхэг эвэртэй байдаг.", "Tiere"),
    ("Reh", "das", "-e", "noun", "бор гөрөөс", "Ein scheues Reh steht am Waldrand.", "Ичимхий бор гөрөөс ойн зах дээр зогсож байна.", "Tiere"),
    ("Wildschwein", "das", "-e", "noun", "зэрлэг гахай", "Das Wildschwein sucht im weichen Waldboden nach Futter.", "Зэрлэг гахай ойн зөөлөн хөрснөөс хоол хайж байна.", "Tiere"),
    ("Hase", "der", "-n", "noun", "туулай", "Der Hase hoppelt schnell über das grüne Feld.", "Туулай ногоон талбай дээгүүр хурдан дэгдэж явна.", "Tiere"),
    ("Kröte", "die", "-n", "noun", "бахь, ногоон бахь", "Die Kröte sitzt regungslos am Ufer des Teiches.", "Бахь цөөрмийн эрэг дээр хөдөлгөөнгүй сууна.", "Tiere"),
    ("Echse", "die", "-n", "noun", "гүрвэл", "Die kleine Echse wärmt sich auf dem sonnigen Stein.", "Бяцхан гүрвэл нартай хадан дээр дулаацаж байна.", "Tiere"),
    ("Schlange", "die", "-n", "noun", "могой", "Die Schlange gleitet lautlos durch das hohe Gras.", "Могой өндөр өвсөн дундуур чимээгүйхэн гулсаж байна.", "Tiere"),
    ("Schildkröte", "die", "-n", "noun", "яст мэлхий", "Die Schildkröte bewegt sich langsam, aber stetig vorwärts.", "Яст мэлхий удаан боловч тууштай урагшилдаг.", "Tiere"),
    ("Krokodil", "das", "-e", "noun", "матар", "Das Krokodil lauert im warmen Wasser auf Beute.", "Матар дулаан усанд ангаа хүлээн отож байна.", "Tiere"),
    ("Hai", "der", "-e", "noun", "аварга загас", "Der Hai schwimmt geschmeidig durch die Tiefen des Meeres.", "Аварга загас далайн гүн дундуур уян хатан сэлж байна.", "Tiere"),
    ("Wal", "der", "-e", "noun", "халим", "Der riesige Wal taucht majestätisch im Ozean auf.", "Үлэмж том халим далайд сүрлэгээр гарч ирж байна.", "Tiere"),
    ("Delfin", "der", "-e", "noun", "далайн гахай", "Delfine sind überaus intelligente und soziale Meeressäuger.", "Далайн гахай бол туйлын ухаалаг, нийтэч далайн хөхтөн амьтан юм.", "Tiere"),
    ("Robbe", "die", "-n", "noun", "далайн хав", "Die Robbe ruht sich auf einer Eisscholle aus.", "Далайн хав мөсөн дээр амарч байна.", "Tiere"),
    ("Möwe", "die", "-n", "noun", "цахлай шувуу", "Die weiße Möwe kreist hoch über dem Hafen.", "Цагаан цахлай боомтын дээгүүр өндөрт эргэлдэж байна.", "Tiere"),
    ("Adler", "der", "-", "noun", "бүргэд", "Der majestätische Adler kreist über den Bergen.", "Сүрлэг бүргэд уулсын дээгүүр элин хальж байна.", "Tiere"),
    ("Eule", "die", "-n", "noun", "шар шувуу", "Die Eule jagt geräuschlos in der finsteren Nacht.", "Шар шувуу харанхуй шөнөөр чимээгүй ан хийдэг.", "Tiere"),
    ("Falke", "der", "-n", "noun", "шонхор шувуу", "Der Falke stürzt im rasanten Flug auf seine Beute herab.", "Шонхор шувуу хурдан нислэгээр ан руугаа шумбан дайрдаг.", "Tiere"),
    ("Spatz", "der", "-en", "noun", "бор шувуу", "Der freche Spatz pickt Brotkrümel vom Boden auf.", "Саваагүй бор шувуу газраас талхны үйрмэг түүж байна.", "Tiere"),
    ("Amsel", "die", "-n", "noun", "хараалж шувуу, хар тоншуул", "Die Amsel singt frühmorgens ihr melodiöses Lied.", "Шувуухай өглөө эрт яруу дуугаа дуулдаг.", "Tiere"),
    ("Meise", "die", "-n", "noun", "хөх бух шувуухай", "Die bunte Meise pickt eifrig an den Sonnenblumenkernen.", "Алаг шувуухай наранцэцгийн үрийг хичээнгүйлэн тоншиж байна.", "Tiere"),
    ("Taube", "die", "-n", "noun", "тагтаа", "Auf dem Marktplatz füttern Kinder die vielen Tauben.", "Захын талбай дээр хүүхдүүд олон тагтаа хооллож байна.", "Tiere"),
    ("Schwan", "der", "-¨e", "noun", "хун шувуу", "Ein eleganter weißer Schwan gleitet ruhig über den See.", "Дэгжин цагаан хун нуурын мандлаар тайван хөвж байна.", "Tiere"),
    ("Ente", "die", "-n", "noun", "нугас", "Die kleine Ente schwimmt mit ihren Küken im Teich.", "Бяцхан нугас дэгдээхэйнүүдтэйгээ цөөрөмд сэлж байна.", "Tiere"),
    ("Gans", "die", "-¨e", "noun", "галуу", "Die Gänse schnattern laut auf der grünen Wiese.", "Галуунууд ногоон нуга дээр чанга ганганалдаж байна.", "Tiere"),
    ("Huhn", "das", "-¨er", "noun", "тахиа", "Das Huhn legt jeden Morgen ein frisches Ei.", "Тахиа өглөө бүр шинэ өндөг гаргадаг.", "Tiere"),
    ("Hahn", "der", "-¨e", "noun", "азарган тахиа", "Der bunte Hahn kräht pünktlich bei Sonnenaufgang.", "Алаг азарган тахиа нар мандахад цагтаа дуугардаг.", "Tiere"),
    ("Kalb", "das", "-¨er", "noun", "тугал", "Das neugeborene Kalb trinkt gierig warme Milch.", "Дөнгөж төрсөн тугал дулаан сүүг шимэн ууж байна.", "Tiere"),
    ("Schaf", "das", "-e", "noun", "хонь", "Die weiße Wolle der Schafe wird zu Garn gesponnen.", "Хонин сүргийн цагаан ноосыг ээрч утас болгодог.", "Tiere"),
    ("Lamm", "das", "-¨er", "noun", "хурга", "Das kleine Lamm springt fröhlich über die Frühlingswiese.", "Бяцхан хурга хаврын ногоон нуга дээр баяртайгаар үсэрч байна.", "Tiere"),
    ("Ziege", "die", "-n", "noun", "ямаа", "Die Ziege klettert geschickt auf die steilen Felsen.", "Ямаа эгц хадан цохио руу чадамгай авирдаг.", "Tiere"),
    ("Fohlen", "das", "-", "noun", "унага", "Das junge Fohlen läuft dicht neben seiner Mutter.", "Залуу унага эхийнхээ хажууд наалдан гүйж байна.", "Tiere"),
    ("Esel", "der", "-", "noun", "илжиг", "Der geduldige Esel trägt schwere Lasten über den Bergpass.", "Тэвчээртэй илжиг даваагаар хүнд ачаа зөөдөг.", "Tiere"),
    ("Ferkel", "das", "-", "noun", "тоорой, гахайн зулзага", "Die kleinen Ferkel schlafen eng aneinander gekuschelt.", "Бяцхан тооройнууд бие биедээ наалдан унтаж байна.", "Tiere"),
    ("Hamster", "der", "-", "noun", "зуррам, үхэр зусаг", "Der Hamster füllt seine Backentaschen mit Getreide.", "Зуррам хацрынхаа уутыг үр тариагаар дүүргэдэг.", "Tiere"),
    ("Kaninchen", "das", "-", "noun", "гэрийн тэжээвэр туулай", "Das weiße Kaninchen knabbert genüsslich an einer Karotte.", "Цагаан туулай лууван амтархан мэрж байна.", "Tiere"),
    ("Biene", "die", "-n", "noun", "зөгий", "Die fleißige Biene sammelt Nektar von den bunten Blüten.", "Ажилсаг зөгий өнгө өнгийн цэцгээс бал цуглуулдаг.", "Tiere"),
    ("Wespe", "die", "-n", "noun", "хэдгэнэ", "Eine Wespe kreist im Sommer um das süße Pflaumenmus.", "Зун нэг хэдгэнэ амтат чавганы чанамал тойрон эргэлдэж байна.", "Tiere"),
    ("Hummel", "die", "-n", "noun", "бөмбөгөр хэдгэнэ", "Die dicke Hummel brummt gemütlich von Blüte zu Blüte.", "Бүдүүн бөмбөгөр хэдгэнэ цэцгээс цэцэг дамжин дүнгэнэж байна.", "Tiere"),
    ("Ameise", "die", "-n", "noun", "шоргоолж", "Die Ameisen bauen gemeinsam einen riesigen Hügel im Wald.", "Шоргоолжнууд ойд хамтдаа үлэмж том үүр барьдаг.", "Tiere"),
    ("Käfer", "der", "-", "noun", "цохон хорхой", "Der kleine schwarze Käfer krabbelt über den Waldboden.", "Бяцхан хар цох ойн хөрсөн дээгүүр мөлхөж байна.", "Tiere"),
    ("Marienkäfer", "der", "-", "noun", "долоон толбот цох", "Ein Marienkäfer mit sieben schwarzen Punkten bringt Glück.", "Долоон хар цэгтэй цох аз авчирдаг.", "Tiere"),
    ("Schmetterling", "der", "-e", "noun", "эрвээхэй", "Der bunte Schmetterling flattert leicht von Blume zu Blume.", "Алаг эрвээхэй цэцгээс цэцгийн хооронд хөнгөхөн дэрвэж байна.", "Tiere"),
    ("Raupe", "die", "-n", "noun", "хүрэнцэр, өт", "Aus der grünen Raupe wird bald ein schöner Falter.", "Ногоон хүрэнцэрээс удахгүй үзэсгэлэнт эрвээхэй төрнө.", "Tiere"),
    ("Fliege", "die", "-n", "noun", "ялаа", "Eine lästige Fliege summt unruhig am Küchenfenster.", "Ядаргаатай ялаа гал тогооны цонхон дээр дүнгэнэж байна.", "Tiere"),
    ("Mücke", "die", "-n", "noun", "шумуул", "Im feuchten Sommer stechen Mücken besonders häufig.", "Чийглэг зун шумуул онцгой их хаздаг.", "Tiere"),
    ("Spinne", "die", "-n", "noun", "аалз", "Die Spinne webt kunstvoll ihr feines Netz in der Ecke.", "Аалз буланд нарийн тороо чадварлагаар нэхэж байна.", "Tiere"),
    ("Schnecke", "die", "-n", "noun", "эмгэн хумс", "Die Schnecke kriecht nach dem Regen langsam über den Weg.", "Борооны дараа эмгэн хумс замаар аажуухан мөлхөж байна.", "Tiere"),
    ("Regenwurm", "der", "-¨er", "noun", "чийгийн улаан хорхой", "Der Regenwurm lockert den Gartenboden auf natürliche Weise.", "Чийгийн улаан хорхой цэцэрлэгийн хөрсийг байгалиас нь сийрэгжүүлдэг.", "Tiere"),
    ("Eiche", "die", "-n", "noun", "царс мод", "Die uralte Eiche spendet an heißen Tagen Schatten.", "Эртний царс мод халуун өдрүүдэд сүүдэр өгдөг.", "Pflanzen"),
    ("Birke", "die", "-n", "noun", "хус мод", "Die weiße Rinde der Birke leuchtet im Herbstwald.", "Хус модны цагаан холтос намрын ойд гэрэлтэж байна.", "Pflanzen"),
    ("Kiefer", "die", "-n", "noun", "нарсан мод", "Im Nadelwald duftet es herrlich nach frischen Kiefern.", "Шилмүүст ойд шинэхэн нарсны үнэр сайхан үнэртдэг.", "Pflanzen"),
    ("Tanne", "die", "-n", "noun", "гацуур мод", "Zur Weihnachtszeit schmücken wir eine grüne Tanne.", "Зул сарын баяраар бид ногоон гацуур мод засдаг.", "Pflanzen"),
    ("Linde", "die", "-n", "noun", "далдуу мод, нимбэгэн үнэрт мод", "Unter der alten Linde auf dem Dorfplatz treffen sich die Nachbarn.", "Тосгоны талбайн хуучин модны дор хөршүүд уулздаг.", "Pflanzen"),
    ("Ahorn", "der", "-e", "noun", "агч мод", "Im goldenen Herbst färben sich die Blätter des Ahorns rot.", "Алтан намарт агч модны навчис улаан өнгөөр солигддог.", "Pflanzen"),
    ("Rose", "die", "-n", "noun", "сарнай цэцэг", "Er schenkt ihr zum Valentinstag eine rote Rose.", "Тэр гэгээн валентины өдрөөр түүнд улаан сарнай бэлэглэв.", "Pflanzen"),
    ("Tulpe", "die", "-n", "noun", "алтанзул цэцэг", "Im Frühling erblühen Tausende Tulpen im Schlossgarten.", "Хавар ордны цэцэрлэгт мянга мянган алтанзул цэцэг дэлгэрдэг.", "Pflanzen"),
    ("Nelke", "die", "-n", "noun", "лиш цэцэг", "Die bunte Nelke duftet würzig auf der Fensterbank.", "Алаг лиш цэцэг цонхны тавцан дээр анхилуун үнэртэж байна.", "Pflanzen"),
    ("Lilie", "die", "-n", "noun", "сараана цэцэг", "Die weiße Lilie gilt als klassisches Symbol der Reinheit.", "Цагаан сараана цэцэг нь ариун тунгалаг байдлын сонгодог бэлгэдэл юм.", "Pflanzen"),
    ("Orchidee", "die", "-n", "noun", "цахирмаа цэцэг", "Orchideen brauchen viel Licht und mäßig Wasser.", "Цахирмаа цэцэг их гэрэл, бага зэргийн ус шаарддаг.", "Pflanzen"),
    ("Sonnenblume", "die", "-n", "noun", "наранцэцэг", "Die gelbe Sonnenblume wendet ihren Kopf stets zur Sonne.", "Шар наранцэцэг толгойгоо ямагт нар руу эргүүлдэг.", "Pflanzen"),
    ("Gänseblümchen", "das", "-", "noun", "товчлуур цэцэг", "Kinder flechten aus Gänseblümchen bunte Kränze.", "Хүүхдүүд товчлуур цэцгээр өнгөлөг цэцгийн хэлхээ сүлждэг.", "Pflanzen"),
    ("Löwenzahn", "der", "-", "noun", "багваахай цэцэг", "Die gelben Wiesen sind voll mit blühendem Löwenzahn.", "Шар нуга цэцэглэж буй багваахай цэцгээр дүүрэн байна.", "Pflanzen"),
    ("Kamille", "die", "-", "noun", "алтан товч цэцэг, эмийн багваахай", "Heißer Kamillentee beruhigt den gereizten Magen.", "Халуун алтан товч цэцгийн цай хямарсан ходоодыг тайвшруулдаг.", "Pflanzen"),
    ("Lavendel", "der", "-", "noun", "лаванда цэцэг", "Der lilafarbene Lavendel verströmt einen beruhigenden Duft.", "Нил ягаан лаванда цэцэг тайвшруулах сайхан үнэр түгээдэг.", "Pflanzen"),
    ("Himbeere", "die", "-n", "noun", "бөөрөлзгөнө", "Im Garten pflücken wir reife, süße Himbeeren.", "Цэцэрлэгтээ бид боловсорсон, амтат бөөрөлзгөнө түүдэг.", "Essen"),
    ("Brombeere", "die", "-n", "noun", "хар нэрс, хар бөөрөлзгөнө", "Die schwarzen Brombeeren wachsen an dornigen Sträuchern.", "Хар бөөрөлзгөнө өргөст бутан дээр ургадаг.", "Essen"),
    ("Blaubeere", "die", "-n", "noun", "нэрс жимс", "Frische Blaubeeren schmecken köstlich im Müsli.", "Шинэхэн нэрс овьёосны холимогтой гайхалтай сайхан амтагддаг.", "Essen"),
    ("Wassermelone", "die", "-n", "noun", "тарвас", "An heißen Sommertagen erfrischt eine kalte Wassermelone.", "Зуны халуун өдрүүдэд хүйтэн тарвас сэргээдэг.", "Essen"),
    ("Honigmelone", "die", "-n", "noun", "амтат гуа", "Die süße Honigmelone passt hervorragend zu Schinken.", "Амтат гуа гахайн махан зүсмэлтэй төгс зохицдог.", "Essen"),
    ("Ananas", "die", "-se", "noun", "хан боргоцой", "Die frische Ananas schmeckt angenehm fruchtig und süß-säuerlich.", "Шинэ хан боргоцой жимслэг, исгэлэн чихэрлэг амттай.", "Essen"),
    ("Mango", "die", "-s", "noun", "манго жимс", "Für das Dessert schneidet sie eine reife Mango in Würfel.", "Амттан бэлтгэхийн тулд тэр боловсорсон мангог шоо дөрвөлжин хэрчиж байна.", "Essen"),
    ("Avocado", "die", "-s", "noun", "авокадо жимс", "Aus reifen Avocados bereiten wir frische Guacamole zu.", "Боловсорсон авокадогоор бид шинэхэн гуакамоле бэлтгэдэг.", "Essen"),
    ("Feige", "die", "-n", "noun", "инжир жимс", "Frische Feigen mit Ziegenkäse sind eine Delikatesse.", "Ямааны бяслагтай шинэхэн инжир жимс бол тансаг амттан юм.", "Essen"),
    ("Dattel", "die", "-n", "noun", "хасарваань жимс", "Süße Datteln sind reich an wertvollen Mineralien.", "Чихэрлэг хасарваань жимс үнэт эрдэс бодисоор баялаг.", "Essen"),
    ("Pflaume", "die", "-n", "noun", "чавга", "Im Herbst backt die Großmutter leckeren Pflaumenkuchen.", "Намар эмээ нь амтат чавганы бялуу жигнэдэг.", "Essen"),
    ("Aprikose", "die", "-n", "noun", "гүйлс жимс", "Die saftige Aprikose hat eine samtene orangefarbene Haut.", "Шүүслэг гүйлс нь хилэн мэт улбар шар хальстай.", "Essen"),
    ("Walnuss", "die", "-¨e", "noun", "хушга", "Walnüsse sind besonders gesund für Herz und Gehirn.", "Хушга нь зүрх болон тархинд онцгой сайн эрүүл хүнс юм.", "Essen"),
    ("Haselnuss", "die", "-¨e", "noun", "ойн самар", "Er knackt die harte Schale der Haselnuss mit dem Nussknacker.", "Тэр самар хагалагчаар ойн самрын хатуу хальсыг хагалж байна.", "Essen"),
    ("Mandel", "die", "-n", "noun", "бүйлс самар", "Gebrannte Mandeln duften herrlich auf dem Weihnachtsmarkt.", "Хуурсан бүйлс самар зул сарын үзэсгэлэн дээр сайхан үнэртдэг.", "Essen"),
    ("Brokkoli", "der", "-", "noun", "брокколи байцаа", "Gedämpfter Brokkoli behält seine wertvollen Vitamine.", "Ууранд жигнэсэн брокколи үнэт амин дэмүүдээ хадгалдаг.", "Essen"),
    ("Blumenkohl", "der", "-", "noun", "цэцэгт байцаа", "Blumenkohl mit heller Soße schmeckt der ganzen Familie.", "Цагаан сүмстэй цэцэгт байцаа бүхэл бүтэн гэр бүлд таалагддаг.", "Essen"),
    ("Spinat", "der", "-", "noun", "бууцай ногоо", "Frischer Spinat wird kurz in der heißen Pfanne geschwenkt.", "Шинэхэн бууцайг халуун хайруулын тавган дээр түр хуурдаг.", "Essen"),
    ("Spargel", "der", "-", "noun", "хэрээний нүд ногоо, спаржа", "Im Mai beginnt in Deutschland die beliebte Spargelzeit.", "Тавдугаар сард Германд хүмүүсийн дуртай спаржны улирал эхэлдэг.", "Essen"),
    ("Radieschen", "das", "-", "noun", "улаан манжин, жижиг улаан лууван", "Scharfe Radieschen geben dem frischen Salat eine feine Würze.", "Халуун ногоотой улаан манжин шинэ салатанд чамин амт нэмдэг.", "Essen"),
    ("Zucchini", "die", "-s", "noun", "цуккини хулуу", "Gegrillte Zucchini mit Kräutern ist eine leichte Beilage.", "Ургамлын амтлагчтай шарсан цуккини хулуу бол хөнгөн хачир юм.", "Essen"),
    ("Aubergine", "die", "-n", "noun", "хаш ногоо, баклажан", "Auberginen eignen sich hervorragend für mediterrane Aufläufe.", "Хаш ногоо Газар дундын тэнгисийн жигнэсэн хоолонд маш сайн тохирдог.", "Essen"),
    ("Kürbis", "der", "-se", "noun", "хулуу", "Im Herbst kochen wir wärmende Kürbissuppe mit Ingwer.", "Намар бид цагаан гаатай дулаацуулах хулууны шөл хийдэг.", "Essen"),
    ("Erbse", "die", "-n", "noun", "вандуй", "Grüne Erbsen schmecken frisch gepflückt besonders süß.", "Ногоон вандуй дөнгөж түүхэд онцгой чихэрлэг амттай байдаг.", "Essen"),
    ("Linse", "die", "-n", "noun", "сэвэг зарам", "Linseneintopf mit Würstchen ist ein deutsches Traditionsgericht.", "Зайдастай сэвэг зармын шөлтэй хоол бол Германы уламжлалт хоол юм.", "Essen"),
    ("Bohne", "die", "-n", "noun", "шош", "Weiße Bohnen enthalten viel wertvolles pflanzliches Eiweiß.", "Цагаан шош нь их хэмжээний үнэт ургамлын уураг агуулдаг.", "Essen"),
    ("Mais", "der", "-", "noun", "эрдэнэ шиш", "Am Lagerfeuer rösten wir frische Kolben süßen Mais.", "Түүдгийн дэргэд бид чихэрлэг шинэхэн эрдэнэ шиш шарж иддэг.", "Essen")
]

print(f"Loaded assemble_lexicon with {len(A1_NATURE_BANK)} nature words.")

EN_C1_MORE_BANK = [
    ("admonish", "verb", "admonish | admonishes | admonished | admonished", "зэмлэх, анхааруулах", "The professor admonished the students for late assignment submissions.", "Профессор даалгавраа хоцроосон оюутнуудыг зэмлэн сануулав.", "Education"),
    ("advocate", "verb", "advocate | advocates | advocated | advocated", "өмгөөлөх, тууштай дэмжих", "Environmentalists advocate for sustainable renewable energy policies.", "Байгаль хамгаалагчид сэргээгдэх эрчим хүчний тогтвортой бодлогыг тууштай дэмждэг.", "Policy"),
    ("allocate", "verb", "allocate | allocates | allocated | allocated", "хуваарилах, төсөвлөх", "The municipality allocated funds for public library renovations.", "Хотын захиргаа нийтийн номын сангийн засварт хөрөнгө хуваарилав.", "Finance"),
    ("augment", "verb", "augment | augments | augmented | augmented", "нэмэгдүүлэх, өргөжүүлэх", "She augmented her income by teaching private online seminars.", "Тэр хувийн цахим семинар зааж орлогоо нэмэгдүүлсэн.", "Work"),
    ("bolster", "verb", "bolster | bolsters | bolstered | bolstered", "хүч нэмэх, бэхжүүлэх", "Strong quarterly profits bolstered investor confidence.", "Улирлын өндөр ашиг хөрөнгө оруулагчдын итгэлийг бэхжүүлэв.", "Business"),
    ("champion", "verb", "champion | champions | championed | championed", "манлайлан хамгаалах", "The organization champions equal educational opportunities for all.", "Тус байгууллага бүх нийтэд тэгш боловсрол олгох боломжийг манлайлан хамгаалдаг.", "Society"),
    ("circumscribe", "verb", "circumscribe | circumscribes | circumscribed | circumscribed", "хязгаарлах, хүрээ тогтоох", "Strict emergency laws circumscribe civil liberties during crises.", "Онцгой байдлын хатуу хууль хямралын үед иргэний эрх чөлөөг хязгаарладаг.", "Law"),
    ("coalesce", "verb", "coalesce | coalesces | coalesced | coalesced", "нэгдэн нийлэх, нэг цул болох", "Diverse grassroots movements coalesced into a unified campaign.", "Төрөл бүрийн иргэний хөдөлгөөнүүд нэгдмэл аян болж нэгдэв.", "Politics"),
    ("commence", "verb", "commence | commences | commenced | commenced", "эхлэх, гараагаа тавих", "The annual symposium will commence promptly at nine o'clock.", "Жил тутмын симпозиум өглөөний есөн цагт яг цагтаа эхэлнэ.", "Events"),
    ("compensate", "verb", "compensate | compensates | compensated | compensated", "нөхөн төлөх, нөхөн олгох", "The airline compensated travelers for lost baggage delays.", "Агаарын тээврийн компани ачаа саатсан зорчигчдод нөхөн төлбөр олгосон.", "Travel"),
    ("complement", "verb", "complement | complements | complemented | complemented", "нөхөж чимэх, бие биенээ төгс болгох", "Her technical skills complement his strategic management abilities.", "Түүний техникийн чадвар нь хамтрагчийнхаа стратегийн менежментийн ур чадварыг нөхдөг.", "Work"),
    ("compound", "verb", "compound | compounds | compounded | compounded", "улам дордуулах, даамжруулах", "Delays in communication compounded the existing logistical crisis.", "Харилцааны саатал нь одоогийн ложистикийн хямралыг улам даамжруулав.", "Crisis"),
    ("comprehend", "verb", "comprehend | comprehends | comprehended | comprehended", "бүрэн ойлгох, ухаж мэдэх", "It takes dedicated focus to comprehend quantum mechanics principles.", "Квант механикийн зарчмуудыг бүрэн ойлгоход хичээнгүй анхаарал шаардагдана.", "Physics"),
    ("concede", "verb", "concede | concedes | conceded | conceded", "хүлээн зөвшөөрөх, буулт хийх", "The candidate conceded defeat after all ballot precincts reported.", "Бүх хэсгийн санал хураалтын дүн гарсны дараа нэр дэвшигч ялагдлаа хүлээн зөвшөөрөв.", "Politics"),
    ("conceptualize", "verb", "conceptualize | conceptualizes | conceptualized | conceptualized", "үзэл баримтлал болгон боловсруулах", "Architects conceptualized an energy-neutral residential skyscraper.", "Архитекторууд эрчим хүчний хэмнэлттэй орон сууцны цамхагийг боловсруулав.", "Design"),
    ("consolidate", "verb", "consolidate | consolidates | consolidated | consolidated", "нэгтгэн бэхжүүлэх", "The merger allowed the bank to consolidate its dominant market position.", "Нэгдэл нь банкны зах зээл дэх ноёрхох байр суурийг бэхжүүлэх боломж олгосон.", "Finance"),
    ("constitute", "verb", "constitute | constitutes | constituted | constituted", "бүрдүүлэх, тогтоох", "Renewable sources constitute over forty percent of electricity production.", "Сэргээгдэх эх үүсвэрүүд цахилгаан эрчим хүчний үйлдвэрлэлийн дөч гаруй хувийг бүрдүүлдэг.", "Energy"),
    ("constrain", "verb", "constrain | constrains | constrained | constrained", "хязгаарлан барих, албадах", "Budgetary limits constrain the scope of municipal infrastructure projects.", "Төсвийн хязгаарлалт нь хотын дэд бүтцийн төслүүдийн цар хүрээг хязгаарладаг.", "Budget"),
    ("construe", "verb", "construe | construes | construed | construed", "тайлбарлах, ойлгож тусгах", "His polite silence was construed as unspoken agreement.", "Түүний эелдэг чимээгүй байдлыг дуугүй зөвшөөрсөн гэж ойлгож авсан.", "Communication"),
    ("contemplate", "verb", "contemplate | contemplates | contemplated | contemplated", "эргэцүүлэн тунгаах", "She contemplated changing career paths after finishing her doctorate.", "Тэр докторын зэргээ хамгаалсны дараа карьераа солих тухай эргэцүүлэн тунгаав.", "Career"),
    ("contend", "verb", "contend | contends | contended | contended", "батлан маргах, өрсөлдөх", "Critics contend that deregulation exposes consumers to unnecessary financial risk.", "Шүүмжлэгчид зохицуулалтыг сулруулах нь хэрэглэгчдийг санхүүгийн эрсдэлд оруулдаг гэж үздэг.", "Economy"),
    ("convene", "verb", "convene | convenes | convened | convened", "чуулах, хуралдуулах", "The security council convened an extraordinary emergency session.", "Аюулгүйн зөвлөл онцгой байдлын хуралдаан зарлан хуралдуулав.", "Diplomacy"),
    ("converge", "verb", "converge | converges | converged | converged", "нэг цэгт огтлолцох, нийлэх", "Scientists converged on the international conference to share breakthroughs.", "Эрдэмтэд нээлтүүдээ хуваалцахаар олон улсын бага хуралд нэгдэн цугларав.", "Science"),
    ("convey", "verb", "convey | conveys | conveyed | conveyed", "дамжуулан илэрхийлэх", "His understated poetry conveys deep melancholy without sentimentality.", "Түүний энгийн яруу найраг хэт сүржин байдалгүйгээр гүн гунигийг дамжуулдаг.", "Literature"),
    ("cultivate", "verb", "cultivate | cultivates | cultivated | cultivated", "төлөвшүүлэн хөгжүүлэх, хөрс боловсруулах", "Mentors help students cultivate critical analytical reasoning habits.", "Багш нар оюутнуудад шүүмжлэлт дүн шинжилгээний сэтгэлгээний дадал төлөвшүүлэхэд тусалдаг.", "Education"),
    ("curtail", "verb", "curtail | curtails | curtailed | curtailed", "богиносгох, танан хасах", "The company curtailed international business travel to reduce expenses.", "Компани зардлаа бууруулахын тулд олон улсын албан томилолтыг танан хасав.", "Business"),
    ("decipher", "verb", "decipher | deciphers | deciphered | deciphered", "тайлж унших, учрыг олох", "Linguists took decades to decipher the ancient carved script.", "Хэл шинжээчид эртний сийлмэл бичгийг тайлж уншихад хэдэн арван жилийг зарцуулсан.", "Linguistics"),
    ("defy", "verb", "defy | defies | defied | defied", "илтэд эсэргүүцэх, сөрөн зогсох", "Her courageous actions defied unjust political oppression.", "Түүний зоримог үйлдэл шударга бус улс төрийн дарамт шахалтыг илтэд сөрөн зогссон.", "History"),
    ("depict", "verb", "depict | depicts | depicted | depicted", "дүрслэн үзүүлэх, зураглах", "The classic documentary depicts the struggles of migrant workers.", "Сонгодог баримтат кино цагаач ажилчдын амьдралын бэрхшээлийг дүрслэн харуулдаг.", "Film"),
    ("derive", "verb", "derive | derives | derived | derived", "үүсэлтэй байх, гарган авах", "Many modern English terms derive directly from ancient Latin.", "Орчин үеийн англи хэлний олон үг эртний латин хэлнээс шууд гаралтай.", "Language"),
    ("deter", "verb", "deter | deters | deterred | deterred", "болгоомжлуулан сэргийлэх, айлган буцаах", "Visible surveillance cameras deter minor theft in retail shops.", "Харагдахуйц хяналтын камерууд дэлгүүрт хулгай гарахаас сэргийлдэг.", "Security"),
    ("deviate", "verb", "deviate | deviates | deviated | deviated", "гажих, зөрөх, замаасаа хазайх", "The actual expenditures deviated significantly from the initial projections.", "Бодит зардал анхны таамаглалаас мэдэгдэхүйц хазайсан байв.", "Finance"),
    ("diminish", "verb", "diminish | diminishes | diminished | diminished", "багасах, буурах, хүч сулрах", "The initial enthusiasm for the project diminished over time.", "Төслийн анхны урам зориг цаг хугацааны эрхээр буурчээ.", "Work"),
    ("discern", "verb", "discern | discerns | discerned | discerned", "ялгаж таних, олж харах", "Experienced editors readily discern subtle inconsistencies in manuscripts.", "Туршлагатай редакторууд гар бичмэлийн нарийн зөрүүг төвөггүй ялгаж таньдаг.", "Publishing"),
    ("disclose", "verb", "disclose | discloses | disclosed | disclosed", "дэлгэн харуулах, илчлэх", "Corporations must disclose environmental risks to all shareholders.", "Корпорацууд байгаль орчны эрсдэлийг бүх хувьцаа эзэмшигчдэдээ ил тод мэдээлэх ёстой.", "Transparency"),
    ("diverge", "verb", "diverge | diverges | diverged | diverged", "салбарлах, өөр өөр болох", "Their opinions diverged widely on the ethical implications of AI.", "Хиймэл оюуны ёс зүйн асуудлаар тэдний санал бодол эрс өөр өөр тийшээ салжээ.", "Ethics"),
    ("elicit", "verb", "elicit | elicits | elicited | elicited", "илрүүлэн гаргах, хариу өдөөх", "The thought-provoking presentation elicited animated audience questions.", "Бодол төрүүлсэн илтгэл үзэгчдээс сонирхолтой асуултуудыг өдөөв.", "Communication"),
    ("embody", "verb", "embody | embodies | embodied | embodied", "өөртөө шингээх, биежүүлэх", "The new constitution embodies principles of human dignity and liberty.", "Шинэ үндсэн хууль хүний нэр төр, эрх чөлөөний зарчмуудыг өөртөө шингээсэн байдаг.", "Law"),
    ("emulate", "verb", "emulate | emulates | emulated | emulated", "дуурайж суралцах, тэгш зиндаанд хүрэх", "Young entrepreneurs strive to emulate the founders of leading tech firms.", "Залуу бизнес эрхлэгчид тэргүүлэгч технологийн фирмүүдийн үүсгэн байгуулагчдаас суралцахыг эрмэлздэг.", "Business"),
    ("encompass", "verb", "encompass | encompasses | encompassed | encompassed", "бүхэлд нь хамарсан байх", "The comprehensive curriculum encompasses theory, lab work, and field research.", "Иж бүрэн сургалтын хөтөлбөр онол, лаборатори болон хээрийн судалгааг бүхэлд нь хамардаг.", "Education"),
    ("enhance", "verb", "enhance | enhances | enhanced | enhanced", "сайжруулах, өсгөх", "Regular physical exercise enhances mental alertness and well-being.", "Тогтмол дасгал хөдөлгөөн нь оюуны сэргэг байдал болон эрүүл мэндийг сайжруулдаг.", "Health"),
    ("enrich", "verb", "enrich | enriches | enriched | enriched", "баяжуулах, үнэ цэнийг нэмэх", "Studying abroad enriches students with cross-cultural perspectives.", "Гадаадад суралцах нь оюутнуудыг соёл хоорондын өргөн үзэл баримтлалаар баяжуулдаг.", "Education"),
    ("eradicate", "verb", "eradicate | eradicates | eradicated | eradicated", "үндсээр нь устгах, бүрмөсөн арилгах", "Global vaccination initiatives helped eradicate smallpox worldwide.", "Дэлхий нийтийн вакцинжуулалтын санаачилга нь цагаан цэцэг өвчнийг дэлхий даяар устгахад тусалсан.", "Health"),
    ("escalate", "verb", "escalate | escalates | escalated | escalated", "хурцдах, шат ахин нэмэгдэх", "Unresolved diplomatic tensions escalated into active border disputes.", "Шийдвэрлэгдээгүй дипломат хурцадмал байдал хилийн маргаан болон шат ахив.", "Conflict")
]

EN_C2_MORE_BANK = [
    ("abnegation", "noun", "abnegation", "өөрийн эрх ашгийг огоорох, татгалзах", "Her life of public service was marked by extreme abnegation.", "Түүний олон нийтэд үйлчилсэн амьдрал хувийн эрх ашгаа бүрэн огоорсноороо онцлог байв.", "Ethics"),
    ("acumen", "noun", "acumen", "оюуны хурц гярхай ухаан", "His financial acumen steered the investment fund through market panic.", "Түүний санхүүгийн хурц ухаан хөрөнгө оруулалтын санг зах зээлийн сандралын үед удирдаж гаргасан.", "Finance"),
    ("anathema", "noun", "anathemas", "жигшин зэвүүцэх зүйл, хараал", "Censorship is anathema to any truly free and democratic society.", "Хэвлэлийн цензур бол жинхэнэ эрх чөлөөт, ардчилсан нийгмийн хувьд жигшин зэвүүцэх зүйл юм.", "Politics"),
    ("apocryphal", "adjective", "хуурамч, үнэн бодит нь эргэлзээтэй", "The famous anecdote about the scientist is widely believed to be apocryphal.", "Эрдэмтний тухай алдартай онигоо бодит биш, зохиомол гэдэгт ихэнх хүн санал нийлдэг.", "History"),
    ("apotheosis", "noun", "apotheoses", "бурханчлал, дээд оргил цэг", "This masterpiece represents the apotheosis of high Renaissance painting.", "Энэхүү шилдэг бүтээл нь сэргэн мандалтын үеийн уран зургийн дээд оргилыг илэрхийлдэг.", "Art"),
    ("approbation", "noun", "approbation", "сайшаал магтаал, албан ёсны зөвшөөрөл", "The playwright received unanimous approbation from critics and audiences.", "Жүжгийн зохиолч шүүмжлэгчид болон үзэгчдээс нэгэн дуугаар сайшаал хүртэв.", "Theater"),
    ("arcane", "adjective", "нууц далд, цөөхөн хүнд ойлгогдох", "The statute contained arcane legal phrasing that confounded laypersons.", "Хуулийн заалт энгийн иргэдэд ойлгогдохгүй нууц далд хууль зүйн хэллэг агуулж байв.", "Law"),
    ("ascetic", "adjective", "хатуу даруу, биеэ барьсан", "The monk lived an ascetic lifestyle in the quiet mountain sanctuary.", "Ламтан уулын чимээгүй сүмд хатуу даруу амьдралын хэв маягаар амьдарч байв.", "Religion"),
    ("asperity", "noun", "asperities", "хатуу ширүүн авир, ширүүн өнгө аяс", "She responded with unusual asperity to the reporter's intrusive question.", "Тэр сурвалжлагчийн эвгүй асуултад ер бусын ширүүн өнгө аясаар хариулав.", "Rhetoric"),
    ("assiduous", "adjective", "хичээнгүй нягт, цуцашгүй хөдөлмөрч", "The archivist was assiduous in cataloging centuries of historical records.", "Архивч олон зуун жилийн түүхийн баримтуудыг бүртгэхдээ туйлын хичээнгүй байв.", "Research"),
    ("aver", "verb", "aver | avers | averred | averred", "батлан нотлох, хатуу итгэлтэйгээр мэдэгдэх", "The defense attorney averred that her client was innocent of all charges.", "Өмгөөлөгч үйлчлүүлэгчээ бүх буруутгалаас гэм буруугүй болохыг хатуу мэдэгдэв.", "Law"),
    ("bellicose", "adjective", "хэрүүлч, дайнч түрэмгий", "The dictator's bellicose rhetoric alarmed neighboring sovereign states.", "Дарангуйлагчийн дайнч түрэмгий үг хэллэг хөрш зэргэлдээ бүрэн эрхт улсуудыг түгшээв.", "Politics"),
    ("calumny", "noun", "calumnies", "гүжир гүтгэлэг, нэр хүнд гутаах худал үг", "The political candidate defended his family against vicious calumny.", "Улс төрийн нэр дэвшигч гэр бүлээ хорлонтой гүтгэлгээс хамгаалав.", "Politics"),
    ("castigation", "noun", "castigations", "хатуу ширүүн шүүмжлэл, гэсгээлт", "The public official faced severe castigation for misusing state resources.", "Төрийн албан тушаалтан улсын нөөцийг буруугаар ашигласныхаа төлөө хатуу шүүмжлэлтэй тулгарав.", "Ethics"),
    ("chicanery", "noun", "chicaneries", "хууль зүйн залилан, башир заль", "Financial chicanery masked the company's impending multi-billion insolvency.", "Санхүүгийн башир заль компанийн удахгүй болох олон тэрбумын дампуурлыг далдалж байв.", "Finance"),
    ("circuitous", "adjective", "тойруу ээдрээтэй, шулуун бус", "He gave a circuitous explanation that evaded the core underlying issue.", "Тэрээр гол асуудлаас бултсан тойруу ээдрээтэй тайлбар өглөө.", "Communication"),
    ("cogent", "adjective", "няцаашгүй үнэмшилтэй, логиктой", "The scholar presented a cogent defense of constitutional democracy.", "Эрдэмтэн үндсэн хуульт ардчиллын талаар няцаашгүй үнэмшилтэй хамгаалалт дэвшүүлэв.", "Law"),
    ("commensurate", "adjective", "дүйцэхүйц, тохирсон хэмжээний", "Salary should be commensurate with experience and demonstrable competence.", "Цалин нь туршлага болон нотлогдсон чадамжид дүйцэхүйц байх ёстой.", "Work"),
    ("compunction", "noun", "compunctions", "гэмшил, сэтгэлийн шаналал", "The unscrupulous swindler defrauded elderly victims without compunction.", "Ичих нүүргүй залилагч өндөр настнуудыг өчүүхэн ч гэмшилгүйгээр залилсан.", "Ethics"),
    ("concomitant", "adjective", "дагалдан гарах, зэрэгцэн тохиолдох", "Rapid urbanization brings concomitant infrastructure and housing challenges.", "Хурдацтай хотжилт нь дэд бүтэц болон орон сууцны дагалдах сорилтуудыг авчирдаг.", "Urbanism"),
    ("conflagration", "noun", "conflagrations", "үлэмж их түймэр, том дайн самуун", "A minor border skirmish threatened to spark a regional conflagration.", "Хилийн өчүүхэн мөргөлдөөн бүс нутгийн их түймэр шиг дайн дэгдээхээр заналхийлэв.", "History"),
    ("contumacious", "adjective", "хууль үл тоомсорлосон, зөрүүд эсэргүү", "The contumacious witness refused to answer questions under judicial subpoena.", "Зөрүүд гэрч шүүхийн дуудан ирүүлэх мэдэгдлийн дагуу асуултад хариулахаас татгалзав.", "Law"),
    ("convoluted", "adjective", "хэт ээдрээтэй, орооцолдсон", "The tax regulations were so convoluted that even accountants were baffled.", "Татварын дүрэм маш ээдрээтэй байсан тул нягтлан бодогчид хүртэл толгой нь эргэв.", "Finance"),
    ("dearth", "noun", "dearths", "хомсдол, дутагдалтай байдал", "There is a severe dearth of affordable housing in major capital cities.", "Томоохон нийслэл хотуудад боломжийн үнэтэй орон сууцны ноцтой хомсдол байна.", "Society"),
    ("debacle", "noun", "debacles", "бүрэн сүйрэл, гутамшигт нуралт", "The ill-conceived product launch turned into a public relations debacle.", "Бодлогогүй гаргасан бүтээгдэхүүний нээлт олон нийтийн харилцааны бүрэн сүйрэл болов.", "Business"),
    ("decorum", "noun", "decorum", "ёс горим, нийгмийн дэг журам", "Parliamentary decorum requires representatives to address the speaker respectfully.", "Парламентын ёс горим төлөөлөгчдөөс даргалагчид хүндэтгэлтэй хандахыг шаарддаг.", "Politics"),
    ("demagogue", "noun", "demagogues", "ард түмний сэтгэл зүйгээр тоглодог улстөрч, демагог", "The demagogue exploited social grievances to consolidate personal power.", "Демагог улстөрч хувийн эрх мэдлээ бэхжүүлэхийн тулд нийгмийн бухимдлыг ашигласан.", "Politics"),
    ("denigrate", "verb", "denigrate | denigrates | denigrated | denigrated", "гутаан доромжлох, үнэ цэнийг бууруулах", "Political rivals attempted to denigrate her outstanding academic achievements.", "Улс төрийн өрсөлдөгчид түүний эрдмийн өндөр ололт амжилтыг гутаахыг оролдов.", "Politics"),
    ("derision", "noun", "derision", "доог тохуу, элэглэн шоолох байдал", "His outlandish scientific claims were met with widespread derision.", "Түүний этгээд хачин шинжлэх ухааны мэдэгдлийг бүх нийтээрээ доог тохуу болгон угтав.", "Science"),
    ("desultory", "adjective", "дэс дараалалгүй, эмх цэгцгүй салан задгай", "They had a desultory conversation that touched on unrelated topics.", "Тэд хоорондоо холбоогүй сэдвүүдийг хөндсөн дэс дараалалгүй яриа өрнүүлэв.", "Communication"),
    ("diatribe", "noun", "diatribes", "хатуу шүүмжилсэн урт дайралт, илтгэл", "The columnist launched a furious diatribe against government corruption.", "Нийтлэлч засгийн газрын авлигын эсрэг ширүүн шүүмжилсэн дайралт хийв.", "Media"),
    ("diffident", "adjective", "өөртөө итгэлгүй, бүрэг ичимхий", "The diffident researcher rarely spoke up during crowded academic conferences.", "Бүрэг ичимхий судлаач хүн ихтэй эрдэм шинжилгээний хурал дээр дуугарах нь ховор байв.", "Psychology"),
    ("dilatory", "adjective", "хойшлуулж цаг хожсон, удаашруулсан", "The defendant employed dilatory tactics to postpone the scheduled trial date.", "Шүүгдэгч шүүх хурлын товлосон өдрийг хойшлуулахын тулд удаашруулах арга хэрэглэв.", "Law"),
    ("dilettante", "noun", "dilettantes", "өнгөц сонирхогч, дилетант", "He was merely a dilettante who dabbled in art without serious discipline.", "Тэрээр урлагт нухацтай суралцалгүй зүгээр л өнгөц сонирхогч төдий байв.", "Art"),
    ("disabuse", "verb", "disabuse | disabuses | disabused | disabused", "төөргөөс ангижруулах, нүдийг нь нээх", "Historical facts soon disabused the public of their naive illusions.", "Түүхэн баримтууд олон нийтийг гэнэн төөрөгдлөөс нь удалгүй ангижруулав.", "Philosophy"),
    ("dispassionate", "adjective", "хувийн сэтгэл хөдлөлгүй, шударга хөндлөнгийн", "A judge must maintain a dispassionate perspective when evaluating evidence.", "Шүүгч нотлох баримтыг үнэлэхдээ сэтгэл хөдлөлгүй, шударга байр суурийг хадгалах ёстой.", "Law"),
    ("dissemble", "verb", "dissemble | dissembles | dissembled | dissembled", "жинхэнэ санаагаа нуун далдлах, дүр эсгэх", "The diplomat was adept at dissembling his country's true strategic intentions.", "Дипломатч өөрийн орны жинхэнэ стратегийн санаархлыг чадварлаг нуун далдалдаг байв.", "Diplomacy"),
    ("dogmatic", "adjective", "хуучинсаг хөшүүн үзэлтэй, догматик", "Dogmatic adherence to outdated doctrines prevents scientific progress.", "Хуучирсан номлолыг сохроор дагах нь шинжлэх ухааны ахиц дэвшилд саад болдог.", "Philosophy"),
    ("duplicity", "noun", "duplicities", "хоёр нүүр гаргах, урвалт мэхлэлт", "The whistleblower exposed corporate duplicity regarding toxic waste disposal.", "Мэдээлэгч хорт хог хаягдлыг зайлуулах тухай корпорацийн хоёр нүүрт үйлдлийг илчилсэн.", "Ethics"),
    ("ebullient", "adjective", "оргилуун баяр хөөртэй, эрч хүчтэй", "The ebullient crowd cheered enthusiastically as the championship concluded.", "Аварга шалгаруулах тэмцээн өндөрлөхөд оргилуун баяртай үзэгчид уухайлан дэмжив.", "Celebration"),
    ("eclectic", "adjective", "олон янзын эх сурвалжаас түүвэрлэсэн, өргөн цар хүрээтэй", "Her private library contained an eclectic collection of literature and philosophy.", "Түүний хувийн номын сан уран зохиол болон гүн ухааны олон талт түүврийг агуулж байв.", "Culture"),
    ("effrontery", "noun", "effronteries", "ичих нүүргүй шийдсэн зан, даварсан байдал", "He had the effrontery to demand a promotion after botching the project.", "Тэрээр төслийг нураачихаад албан тушаал ахихыг шаардах ичих нүүргүй даварсан зан гаргав.", "Ethics"),
    ("elucidate", "verb", "elucidate | elucidates | elucidated | elucidated", "тодорхой болгон тайлбарлах, гэрэл тусгах", "The professor's brilliant lecture elucidated obscure passages in the ancient text.", "Профессорын гайхалтай лекц эртний бичвэрийн ойлгомжгүй хэсгүүдийг тодорхой болгов.", "Academic"),
    ("enervate", "verb", "enervate | enervates | enervated | enervated", "хүч тамир барах, туйлдуулах", "The relentless desert heat enervated the stranded travelers.", "Цөлийн халуун нар төөрч мухардсан аялагчдын хүч тамирыг бүрмөсөн барав.", "Survival"),
    ("ephemeral", "adjective", "түр зуурын, амархан замхран арилах", "Fame on social media networks is notoriously ephemeral.", "Олон нийтийн сүлжээн дэх алдар нэр түр зуурынх байдгаараа зартай.", "Culture"),
    ("equanimity", "noun", "equanimity", "сэтгэлийн тайван амгалан, тэнцвэр", "She handled the corporate restructuring crisis with remarkable equanimity.", "Тэр компанийн бүтцийн өөрчлөлтийн хямралыг гайхалтай тайван амгалангаар даван туулав.", "Psychology"),
    ("equivocal", "adjective", "тодорхойгүй, хоёр янзаар ойлгогдож болох", "The laboratory test results were equivocal and warranted further study.", "Лабораторийн туршилтын үр дүн тодорхойгүй байсан тул нэмэлт судалгаа шаардав.", "Science"),
    ("erudite", "adjective", "өргөн гүн мэдлэгтэй, эрдэмтэй", "The erudite historian cited archival manuscripts across four languages.", "Эрдэм төгс түүхч дөрвөн хэл дээрх архивын гар бичмэлүүдийг эш татав.", "Academic"),
    ("esoteric", "adjective", "цөөн сонгогдсон хүнд ойлгогдох, далд нарийн", "Quantum cryptography remains an esoteric topic for general programmers.", "Квант криптографи нь нийтлэг програмистуудын хувьд тусгай нарийн сэдэв хэвээр байна.", "Technology"),
    ("evanescent", "adjective", "хурдан замхрах, гялс өнгөрөх", "The rainbow was an evanescent beauty against the stormy evening sky.", "Солонго шуургатай үдшийн тэнгэрт хурдан замхран арилах гоо үзэсгэлэн байв.", "Nature"),
    ("exculpate", "verb", "exculpate | exculpates | exculpated | exculpated", "гэм буруугүйг нотлох, цагаатгах", "Newly discovered DNA evidence completely exculpated the convicted man.", "Шинээр олдсон ДНХ-ийн нотлох баримт ял эдэлж байсан эрийг бүрэн цагаатгав.", "Law"),
    ("exigent", "adjective", "нэн яаралтай, онцгой шаардлагатай", "The exigent humanitarian situation demanded rapid international relief.", "Нэн яаралтай хүмүүнлэгийн нөхцөл байдал олон улсын шуурхай тусламж шаардав.", "Crisis"),
    ("exonerate", "verb", "exonerate | exonerates | exonerated | exonerated", "цагаатгах, бүх ял хариуцлагаас чөлөөлөх", "The independent judicial inquiry fully exonerated the police chief.", "Хараат бус шүүхийн мөрдөн шалгалт цагдаагийн даргыг бүрэн цагаатгасан.", "Law"),
    ("expurgate", "verb", "expurgate | expurgates | expurgated | expurgated", "зохисгүй хэсгийг нь хасаж засах", "Censors expurgated politically sensitive chapters before authorizing publication.", "Цензур нийтлэхийг зөвшөөрөхөөс өмнө улс төрийн эмзэг бүлгүүдийг хасаж засав.", "Publishing"),
    ("extemporaneous", "adjective", "бэлтгэлгүйгээр шууд зохиож хэлсэн, импровизаци хийсэн", "His extemporaneous remarks proved far more persuasive than the written speech.", "Түүний бэлтгэлгүй шууд хэлсэн үг бичсэн илтгэлээс хамаагүй илүү үнэмшилтэй байв.", "Rhetoric"),
    ("fastidious", "adjective", "тун нямбай, голомтгой хянуур", "The curator was fastidious regarding temperature controls in the gallery.", "Куратор галерей дахь температурын хяналтад туйлын нямбай ханддаг байв.", "Art"),
    ("fatuous", "adjective", "утга учиргүй тэнэг, хий хоосон", "Making fatuous promises during an election erodes public faith in democracy.", "Сонгуулийн үеэр хий хоосон утгагүй амлалт өгөх нь ардчилалд итгэх олон нийтийн итгэлийг үгүй хийдэг.", "Politics"),
    ("fecund", "adjective", "үржил шимтэй, арвин их бүтээл туурвидаг", "The novelist enjoyed a fecund creative period, producing four classics in six years.", "Зохиолч зургаан жилийн дотор дөрвөн сонгодог бүтээл туурвисан арвин их бүтээлч үеийг туулсан.", "Literature"),
    ("fervid", "adjective", "оргилуун халуун, хүсэл тэмүүлэлтэй", "Her fervid speeches inspired thousands of young citizens to participate in civic reform.", "Түүний халуун оргилуун илтгэлүүд олон мянган залуусыг иргэний шинэчлэлд оролцоход урамшуулав.", "Civics"),
    ("fortuitous", "adjective", "санамсаргүй тохиолдлын, азтай завшаантай", "A fortuitous meeting in London led to a lucrative cross-border partnership.", "Лондонд тохиолдлоор уулзсан завшаантай уулзалт ашигтай олон улсын түншлэлд хүргэв.", "Business"),
    ("fractious", "adjective", "хэрүүлч, үгэнд үл орох, эв эвдрэлцдэг", "The fractious committee struggled for hours to agree upon a shared agenda.", "Эв түнжин муутай хороо нэгдсэн хэлэлцэх асуудал дээр санал нийлэх гэж олон цагаар маргалдав.", "Politics"),
    ("garrulous", "adjective", "чалчаа, үг ихтэй", "The garrulous cab driver talked continuously throughout the entire airport ride.", "Чалчаа таксины жолооч нисэх буудал хүртэл замдаа тасралтгүй ярив.", "Daily Life"),
    ("germane", "adjective", "шууд хамааралтай, холбогдох", "Please restrict your comments to points that are strictly germane to the motion.", "Та тайлбараа хэлэлцэж буй асуудалд шууд хамааралтай зүйлсээр хязгаарлана уу.", "Debate"),
    ("grandiloquent", "adjective", "хэт сүржин, цэцэрхсэн их үгтэй", "His grandiloquent claims failed to impress the experienced scientific panel.", "Түүний цэцэрхсэн хэт сүржин мэдэгдлүүд туршлагатай эрдэмтдийн зөвлөлд сэтгэгдэл төрүүлсэнгүй.", "Rhetoric"),
    ("gratuitous", "adjective", "үндэслэлгүй, шаардлагагүй илүүц", "The movie was criticized for gratuitous depictions of violent street crime.", "Уг киног гудамжны гэмт хэргийн хүчирхийллийг шаардлагагүй илүүц дүрсэлсний төлөө шүүмжилсэн.", "Film"),
    ("gregarious", "adjective", "нийтэч, олон дунд байх дуртай", "Elephants are highly gregarious animals that maintain lifelong family bonds.", "Заанууд насан туршийн гэр бүлийн холбоог хадгалдаг өндөр нийтэч амьтад юм.", "Biology"),
    ("hackneyed", "adjective", "хуучирч улиг болсон, шинэлэг бус", "The script relied on hackneyed clichés about high school popularity.", "Кино зохиол ахлах сургуулийн нэр хүндийн талаарх хуучирч улиг болсон хэвшмэл ойлголтод тулгуурлажээ.", "Writing"),
    ("halcyon", "adjective", "амар амгалан, цэцэглэн хөгжсөн алтан үеийн", "Elders often reminisced about the halcyon days of economic tranquility.", "Ахмадууд эдийн засгийн амар амгалан цэцэглэлтийн алтан өдрүүдийг дурсан ярьдаг байв.", "History"),
    ("harangue", "verb", "harangue | harangues | harangued | harangued", "дайрч давшилж урт зандрах", "The coach harangued the players for poor defensive teamwork at halftime.", "Дасгалжуулагч завсарлагааны үеэр багийн хамгаалалтын муу тоглолтын төлөө тамирчдаа ширүүн зандрав.", "Sports"),
    ("hedonism", "noun", "hedonism", "цэнгэл хөөцөлдөх үзэл, гедонизм", "Ancient philosophical schools debated the virtues and pitfalls of hedonism.", "Эртний философийн сургуулиуд цэнгэл хөөцөлдөх үзлийн сайн ба саар талуудыг мэтгэлцдэг байв.", "Philosophy"),
    ("hegemony", "noun", "hegemonies", "ноёрхол, гегемони", "The superpower maintained cultural and economic hegemony throughout the region.", "Их гүрэн бүс нутаг даяар соёлын болон эдийн засгийн ноёрхлоо хадгалсаар байв.", "Geopolitics"),
    ("hermetic", "adjective", "битүүмжилсэн, гадаад ертөнцөөс тусгаарлагдсан", "The experimental laboratory maintained a hermetic vacuum seal.", "Туршилтын лаборатори гадаад орчноос бүрэн тусгаарлагдсан вакуум битүүмжлэлтэй байв.", "Science"),
    ("heterodox", "adjective", "нийтээр хүлээн зөвшөөрөгдөөгүй, өөр үзэлтэй", "The economist advocated heterodox policies that challenged free-market orthodoxy.", "Эдийн засагч чөлөөт зах зээлийн уламжлалт номлолыг сорьсон өөр өнцгийн бодлого баримтлав.", "Economics"),
    ("iconoclast", "noun", "iconoclasts", "уламжлалт үзлийг эвдэгч, тэрслэгч", "The modern painter was an iconoclast who rejected academic portrait conventions.", "Орчин үеийн зураач академик хөрөг зургийн дэг жаягийг үгүйсгэсэн шинэчлэгч байв.", "Art"),
    ("idiosyncrasy", "noun", "idiosyncrasies", "хувь хүний өвөрмөц онцлог, зан араншин", "Every major writer possesses linguistic idiosyncrasies that define their prose.", "Шилдэг зохиолч бүр өөрийн зохиолыг тодорхойлдог хэл ярианы өвөрмөц онцлогтой байдаг.", "Literature"),
    ("ignominious", "adjective", "гутамшигт, шившигтэй", "The general suffered an ignominious defeat after underestimating his opponent.", "Генерал өрсөлдөгчөө дутуу үнэлсний улмаас шившигт ялагдал хүлээв.", "History"),
    ("immutable", "adjective", "хувиршгүй, өөрчлөгдөшгүй бат", "The laws of theoretical physics are assumed to be immutable across the cosmos.", "Онолын физикийн хуулиуд сансар огторгуй даяар хувиршгүй бат гэж үздэг.", "Physics"),
    ("impassive", "adjective", "сэтгэлийн хөдөлгөөнгүй, хөшүүн царайтай", "The seasoned poker champion remained completely impassive under high stakes.", "Туршлагатай покерын аварга өндөр бооцооны үед ямар ч сэтгэл хөдлөлгүй байв.", "Psychology"),
    ("impeccable", "adjective", "өө сэвгүй, төгс төгөлдөр", "Her diplomatic record and professional integrity were impeccable.", "Түүний дипломат албаны намтар болон мэргэжлийн шударга байдал өө сэвгүй байв.", "Career"),
    ("imperious", "adjective", "захирангуй, ихэмсэг тушаагч", "The manager's imperious manner alienated talented young team members.", "Менежерийн ихэмсэг захирангуй зан нь чадварлаг залуу ажилтнуудыг хөндийрүүлэв.", "Management"),
    ("imperturbable", "adjective", "тайван амгалан, цочирдож сандардаггүй", "The flight captain's imperturbable calm reassured anxious passengers during turbulence.", "Онгоцны ахмадын тайван амгалан байдал агаарын хүчтэй савалгааны үед түгшсэн зорчигчдыг тайвшруулав.", "Aviation"),
    ("impervious", "adjective", "нэвтэрдэггүй, нөлөөнд автдаггүй", "The specialized composite shield is impervious to chemical and thermal damage.", "Тусгай нийлмэл бамбай нь химийн болон дулааны гэмтлийг нэвтрүүлдэггүй.", "Engineering"),
    ("impetuous", "adjective", "бодлогогүй огцом, яаруу түргэн", "His impetuous decision to resign surprised his colleagues and friends.", "Түүний ажлаа өгөх бодлогогүй огцом шийдвэр хамт олон болон найз нөхдийг нь гайхшруулав.", "Psychology"),
    ("implacable", "adjective", "эвлэршгүй хатуу, ятгалга авахгүй", "The environmental advocate was an implacable foe of offshore oil drilling.", "Байгаль хамгаалагч нь далайн гүний газрын тосны өрөмдлөгийн эвлэршгүй дайсан байв.", "Activisim"),
    ("impunity", "noun", "impunity", "ял шийтгэлгүй өнгөрөх байдал", "No corrupt official should ever operate with complete legal impunity.", "Ямар ч авлигач албан тушаалтан хуулийн ял шийтгэлгүй өнгөрөх ёсгүй.", "Law"),
    ("inchoate", "adjective", "дөнгөж үүсэж буй, бүрэлдэж дуусаагүй", "The revolutionary movement was still inchoate and lacked cohesive leadership.", "Хувьсгалт хөдөлгөөн дөнгөж үүсэж байсан тул нэгдмэл удирдлага дутагдаж байв.", "Politics"),
    ("incipient", "adjective", "эхлэн илэрч буй, эхэн үеийн", "Early screening protocols can detect incipient signs of cardiovascular disease.", "Эрт илрүүлгийн шинжилгээ зүрх судасны өвчний эхэн үеийн шинж тэмдгийг илрүүлж чаддаг.", "Medicine"),
    ("indefatigable", "adjective", "цуцашгүй зүтгэлтэй, ядарч шантаршгүй", "The indefatigable volunteer delivered hot meals to elderly neighbors daily.", "Цуцашгүй сэтгэлтэй сайн дурын ажилтан өндөр настай хөршүүддээ өдөр бүр халуун хоол хүргэдэг байв.", "Community")
]

print(f"EN_C1_MORE_BANK: {len(EN_C1_MORE_BANK)}, EN_C2_MORE_BANK: {len(EN_C2_MORE_BANK)}")

A2_OFFICE_HOUSE_BANK = [
    ("Drehstuhl", "der", "-¨e", "noun", "эргэдэг сандал", "Der ergonomische Drehstuhl schont den Rücken.", "Эргономик эргэдэг сандал нь нурууг хамгаалдаг.", "Büro"),
    ("Aktenschrank", "der", "-¨e", "noun", "бичиг баримтын шүүгээ", "Wichtige Verträge werden im Aktenschrank aufbewahrt.", "Чухал гэрээнүүдийг бичиг баримтын шүүгээнд хадгалдаг.", "Büro"),
    ("Aktenordner", "der", "-", "noun", "бичиг баримтын хавтас", "Die Rechnungen sind nach Jahren im Aktenordner sortiert.", "Нэхэмжлэхүүд он оноор нь хавтсанд ангилагдсан байна.", "Büro"),
    ("Locher", "der", "-", "noun", "цаас цоологч", "Mit dem Locher stanzt er zwei Löcher in das Papier.", "Цаас цоологчоор тэр цаасанд хоёр нүх цоолж байна.", "Büro"),
    ("Tacker", "der", "-", "noun", "үдээсний буу, степлер", "Verbinde die Blätter mit dem Tacker.", "Хуудсуудыг үдээсээр үднэ үү.", "Büro"),
    ("Heftklammer", "die", "-n", "noun", "үдээс, степлерийн зүү", "Die Schachtel mit den Heftklammern ist leer.", "Үдээсний зүүний хайрцаг хоосорчээ.", "Büro"),
    ("Büroklammer", "die", "-n", "noun", "бичгийн хавчаар, скрепка", "Eine Büroklammer hält die Quittungen zusammen.", "Бичгийн хавчаар баримтуудыг хамтад нь барьж байна.", "Büro"),
    ("Textmarker", "der", "-", "noun", "тодруулагч тод бал", "Wichtige Begriffe markiert sie mit einem gelben Textmarker.", "Чухал үгсийг тэр шар тодруулагчаар тэмдэглэж байна.", "Büro"),
    ("Füllfederhalter", "der", "-", "noun", "бэхтэй үзэг", "Er unterschreibt den Vertrag mit einem edlen Füllfederhalter.", "Тэр тансаг бэхтэй үзгээр гэрээнд гарын үсэг зурж байна.", "Büro"),
    ("Tintenpatrone", "die", "-n", "noun", "үзгэн балын бэхний бортого", "Der Füller braucht eine frische blaue Tintenpatrone.", "Үзгэнд шинэхэн цэнхэр бэхний бортого хэрэгтэй байна.", "Büro"),
    ("Anspitzer", "der", "-", "noun", "харандаа үзүүрлэгч", "Wo liegt der Anspitzer für die Buntstifte?", "Өнгийн харандааны үзүүрлэгч хаана байна вэ?", "Schule"),
    ("Mäppchen", "das", "-", "noun", "үзэгний сав, пенал", "In meinem Mäppchen sind Stifte, Lineal und Radiergummi.", "Миний пеналд үзэг, шугам болон баллуур байна.", "Schule"),
    ("Schultasche", "die", "-n", "noun", "сургуулийн цүнх", "Die Schultasche der Erstklässler ist ziemlich schwer.", "Нэгдүгээр ангийн хүүхдийн сургуулийн цүнх нэлээд хүнд байна.", "Schule"),
    ("Klassenarbeit", "die", "-en", "noun", "ангийн шалгалт, хяналтын ажил", "Am Freitag schreiben wir eine wichtige Klassenarbeit in Mathe.", "Баасан гарагт бид математикаар чухал шалгалт бичнэ.", "Schule"),
    ("Stundenplan", "der", "-¨e", "noun", "хичээлийн хуваарь", "Der neue Stundenplan hängt an der Pinnwand im Klassenzimmer.", "Шинэ хичээлийн хуваарь ангийн мэдээллийн самбар дээр өлгөөтэй байна.", "Schule"),
    ("Pausenhof", "der", "-¨e", "noun", "сургуулийн завсарлагааны талбай", "In der großen Pause toben die Kinder auf dem Pausenhof.", "Их завсарлагаанаар хүүхдүүд сургуулийн талбайд шуугилдан тоглодог.", "Schule"),
    ("Turnhalle", "die", "-n", "noun", "биеийн тамирын заал", "Der Sportunterricht findet heute in der Turnhalle statt.", "Биеийн тамирын хичээл өнөөдөр зааланд орно.", "Schule"),
    ("Sportplatz", "der", "-¨e", "noun", "спортын гадаа талбай", "Nach der Schule spielen wir Fußball auf dem Sportplatz.", "Хичээлийн дараа бид спортын талбайд хөлбөмбөг тоглодог.", "Sport"),
    ("Freibad", "das", "-¨er", "noun", "задгай усан сан", "Bei sommerlicher Hitze gehen alle ins Freibad.", "Зуны халуунд бүгд задгай усан сан руу явдаг.", "Freizeit"),
    ("Hallenbad", "das", "-¨er", "noun", "битүү дээвэртэй усан сан", "Im kalten Winter schwimmen wir im städtischen Hallenbad.", "Хүйтэн өвөл бид хотын битүү усан санд сэлдэг.", "Freizeit"),
    ("Fitnessstudio", "das", "-s", "noun", "фитнесс төв, чийрэгжүүлэх газар", "Er trainiert dreimal pro Woche im Fitnessstudio.", "Тэр долоо хоногт гурван удаа фитнесст дасгал хийдэг.", "Sport"),
    ("Sportverein", "der", "-e", "noun", "спортын клуб, холбоо", "Unser Sohn ist Mitglied in einem lokalen Sportverein.", "Манай хүү орон нутгийн спортын клубийн гишүүн юм.", "Sport"),
    ("Mitgliedschaft", "die", "-en", "noun", "гишүүнчлэл", "Die jährliche Mitgliedschaft im Verein kostet sechzig Euro.", "Клубийн жилийн гишүүнчлэл жаран еврогийн үнэтэй.", "Sport"),
    ("Eintrittskarte", "die", "-n", "noun", "тасалбар, нэвтрэх тасалбар", "Zeigen Sie Ihre Eintrittskarte bitte am Drehkreuz vor.", "Тасалбараа эргэдэг хаалган дээр шалгуулна уу.", "Freizeit"),
    ("Dauerkarte", "die", "-n", "noun", "улирлын тасалбар, байнгын карт", "Treue Fußballfans kaufen sich jedes Jahr eine Dauerkarte.", "Үнэнч хөлбөмбөгийн хөгжөөн дэмжигчид жил бүр байнгын карт авдаг.", "Sport"),
    ("Gutschein", "der", "-e", "noun", "бэлгийн карт, ваучер", "Zum Geburtstag schenken wir ihr einen Bücher-Gutschein.", "Төрсөн өдрөөр нь бид түүнд номын бэлгийн карт бэлэглэнэ.", "Einkaufen"),
    ("Rabattaktion", "die", "-en", "noun", "хямдралын урамшуулал", "Während der Rabattaktion gibt es zwanzig Prozent Nachlass.", "Хямдралын урамшууллын үеэр хорин хувийн хөнгөлөлттэй.", "Einkaufen"),
    ("Treuepunkt", "der", "-e", "noun", "урамшууллын оноо", "Beim Einkaufen sammelt sie fleißig Treuepunkte.", "Худалдан авалт хийхдээ тэр урамшууллын оноо цуглуулдаг.", "Einkaufen"),
    ("Werbeprospekt", "der", "-e", "noun", "зар сурталчилгааны танилцуулга хуудас", "Im Werbeprospekt blättert sie nach günstigen Angeboten.", "Зар сурталчилгааны хуудаснаас тэр хямд саналуудыг үзэж байна.", "Einkaufen"),
    ("Katalog", "der", "-e", "noun", "каталог, барааны жагсаалт", "Wir bestellen die Gartenmöbel direkt aus dem Katalog.", "Бид цэцэрлэгийн тавилгыг шууд каталогоос захиалдаг.", "Einkaufen"),
    ("Mietwohnung", "die", "-en", "noun", "хөлсний түрээсийн орон сууц", "In Großstädten ist die Suche nach einer Mietwohnung schwierig.", "Том хотуудад хөлсний байр олоход хэцүү байдаг.", "Wohnen"),
    ("Eigentumswohnung", "die", "-en", "noun", "өмчийн хувийн орон сууц", "Sie haben viele Jahre gespart, um eine Eigentumswohnung zu kaufen.", "Тэд өмчийн орон сууц худалдаж авахын тулд олон жил мөнгө хуримтлуулсан.", "Wohnen"),
    ("Warmmiete", "die", "-n", "noun", "халаалттай бүтэн түрээсийн үнэ", "Die Warmmiete beträgt achthundert Euro im Monat.", "Халаалттай бүтэн түрээсийн төлбөр сард найман зуун евро болдог.", "Wohnen"),
    ("Kaltmiete", "die", "-n", "noun", "халаалт ашиглалтын зардалгүй суурь түрээс", "Zu der Kaltmiete kommen noch Strom und Heizkosten hinzu.", "Суурь түрээс дээр цахилгаан болон халаалтын зардал нэмэгдэнэ.", "Wohnen"),
    ("Wohnungsübergabe", "die", "-n", "noun", "байр хүлээлцэх ажиллагаа", "Bei der Wohnungsübergabe werden alle Zählerstände notiert.", "Байр хүлээлцэх үед бүх тоолуурын заалтыг тэмдэглэдэг.", "Wohnen"),
    ("Übergabeprotokoll", "das", "-e", "noun", "хүлээлцсэн албан ёсны акт, протокол", "Vermieter und Mieter unterzeichnen das Übergabeprotokoll.", "Түрээслүүлэгч болон түрээслэгч хүлээлцэх актад гарын үсэг зурдаг.", "Wohnen"),
    ("Umzugskarton", "der", "-s", "noun", "нүүдлийн цаасан хайрцаг", "Wir packen alle Bücher sorgfältig in stabile Umzugskartons.", "Бид бүх номоо бат бөх нүүдлийн хайрцагт хийж байна.", "Wohnen"),
    ("Spedition", "die", "-en", "noun", "ачаа тээврийн компани", "Die Spedition liefert die schweren Möbel pünktlich an.", "Ачаа тээврийн компани хүнд тавилгыг цагт нь хүргэж ирэв.", "Transport"),
    ("Möbelwagen", "der", "-", "noun", "тавилгын том тээврийн машин", "Der Möbelwagen parkt direkt vor dem Hauseingang.", "Тавилгын тээврийн машин шууд орцны үүдэнд зогсож байна.", "Transport"),
    ("Möbelhaus", "das", "-¨er", "noun", "тавилгын их дэлгүүр", "Am Wochenende suchen wir eine neue Couch im Möbelhaus.", "Амралтын өдрөөр бид тавилгын дэлгүүрээс шинэ буйдан хайна.", "Einkaufen"),
    ("Küchenzeile", "die", "-n", "noun", "гал тогооны иж бүрэн тавилга", "Die moderne Küchenzeile enthält Herd, Spüle und Kühlschrank.", "Орчин үеийн гал тогооны тавилгад зуух, угаалтуур болон хөргөгч багтдаг.", "Küche"),
    ("Dunstabzugshaube", "die", "-n", "noun", "гал тогооны утаа сорогч", "Schalte die Dunstabzugshaube beim Braten ein.", "Шарж байхдаа утаа сорогчоо асаагаарай.", "Küche"),
    ("Mikrowelle", "die", "-n", "noun", "богино долгионы зуух", "In der Mikrowelle wärmt er die Reste vom Vortag auf.", "Богино долгионы зууханд тэр өмнөх өдрийн үлдсэн хоолоо халааж байна.", "Küche"),
    ("Kaffeemaschine", "die", "-n", "noun", "кофены аппарат, кофе чанагч", "Die Kaffeemaschine brüht morgens aromatischen Espresso.", "Кофе чанагч өглөө анхилуун эспрессо чанадаг.", "Küche"),
    ("Wasserkocher", "der", "-", "noun", "ус буцалгагч", "Im elektrischen Wasserkocher kocht das Teewasser in zwei Minuten.", "Цахилгаан ус буцалгагчид цайны ус хоёр минутанд буцалдаг.", "Küche"),
    ("Toaster", "der", "-", "noun", "талх шарагч", "Der Toaster röstet zwei Scheiben Weißbrot knusprig.", "Талх шарагч хоёр зүсэм цагаан талхыг шаржигнасан болгон шарж байна.", "Küche"),
    ("Mixer", "der", "-", "noun", "холигч, блендер", "Mit dem Mixer püriert sie frische Früchte für den Smoothie.", "Блендерээр тэр сүүтэй ундаанд зориулж шинэ жимс хольж байна.", "Küche"),
    ("Pürierstab", "der", "-¨e", "noun", "гар холигч, нухаш бэлтгэгч", "Der Pürierstab zerkleinert das gekochte Gemüse zu einer feinen Suppe.", "Гар холигч чанасан ногоог нарийн шөл болгон нухдаг.", "Küche")
]

def make_de_card(idx, word, article, plural, pos, forms, rek, mn, ex_de, ex_mn, topic, level):
    word = nfc(word)
    mn = nfc(mn)
    ex_de = nfc(ex_de)
    ex_mn = nfc(ex_mn)
    
    if pos == 'noun':
        article = nfc(article.lower()) if article else 'der'
        plural = nfc(plural) if plural else '-'
        prompt_front = f"_____ {word}, {plural} [{mn}]"
        revealed_back = f"{article} {word}, {plural}"
        display = f"{article} {word}, {plural}"
        forms = None
        rek = None
    elif pos == 'verb':
        article = None
        plural = None
        if not forms or '|' not in forms:
            forms = f"{word} | {word}t | {word}te | hat ge{word}t"
        forms = nfc(forms)
        rek = nfc(rek) if rek else None
        prompt_front = f"{word} _____ [{mn}]"
        revealed_back = f"{forms} ({rek})" if rek else forms
        display = word
    elif pos in ['phrase', 'idiom']:
        article = None
        plural = None
        forms = nfc(forms) if (forms and '|' in forms) else None
        rek = None
        prompt_front = f"{word} — _____ [{mn}]"
        revealed_back = word
        display = word
    else:
        article = None
        plural = None
        forms = None
        rek = None
        prompt_front = f"{word} — _____ [{mn}]"
        revealed_back = word
        display = word
        
    return {
        "id": f"de_{level.lower()}_{idx:04d}",
        "word": word,
        "article": article,
        "plural": plural,
        "display": display,
        "pos": pos,
        "lang": "de",
        "level": level.upper(),
        "forms": forms,
        "rektion": rek,
        "prompt_front": prompt_front,
        "revealed_back": revealed_back,
        "mn": mn,
        "example_de": ex_de,
        "example_mn": ex_mn,
        "topic": topic
    }

def make_en_card(idx, word, pos, forms, mn, ex_en, ex_mn, topic, level):
    word = nfc(word)
    mn = nfc(mn)
    ex_en = nfc(ex_en)
    ex_mn = nfc(ex_mn)
    forms = nfc(forms) if forms else word
    
    return {
        "id": f"en_{level.lower()}_{idx:04d}",
        "word": word,
        "pos": pos,
        "lang": "en",
        "level": level.upper(),
        "forms": forms,
        "rektion": None,
        "prompt_front": f"_____ ({mn})",
        "revealed_back": word,
        "mn": mn,
        "example_en": ex_en,
        "example_mn": ex_mn,
        "topic": topic
    }

def make_en_card_from_tuple(idx, item, level):
    if len(item) == 6:
        w, pos, forms, mn, ex_en, ex_mn, topic = item[0], item[1], item[0], item[2], item[3], item[4], item[5]
    else:
        w, pos, forms, mn, ex_en, ex_mn, topic = item[0], item[1], item[2], item[3], item[4], item[5], item[6]
    return make_en_card(idx, w, pos, forms, mn, ex_en, ex_mn, topic, level)

def run_assembly():
    print("==================================================")
    print("   ARL FULL DEDUPLICATION & EXPANSION ENGINE     ")
    print("==================================================")
    
    # ----------------------------------------------------
    # 1. GERMAN DATASET
    # ----------------------------------------------------
    print("\n--- Processing German Lexicon ---")
    
    # Step A: Load canonical B1 (1,000 items)
    with open(os.path.join(ROOT, 'data/de/vocab_b1.json')) as f:
        de_b1 = json.load(f)
    de_seen = set()
    for w in de_b1:
        de_seen.add(w['word'].strip().lower())
    print(f"German B1 loaded: {len(de_b1)} items (canonical base).")
    
    repl_pool_idx = 0

    # Step B: Process A1 (790 items)
    with open(os.path.join(ROOT, 'data/de/vocab_a1.json')) as f:
        a1_orig = json.load(f)
    de_a1 = []
    a1_repl_count = 0
    
    for idx, card in enumerate(a1_orig, 1):
        word_lower = card['word'].strip().lower()
        if word_lower in de_seen:
            item = CLEAN_DE_REPLACEMENT_POOL[repl_pool_idx]
            repl_pool_idx += 1
            new_card = make_de_card(idx, item[0], item[1], item[2], item[3], None, None, item[4], item[5], item[6], item[7], 'a1')
            de_a1.append(new_card)
            de_seen.add(new_card['word'].strip().lower())
            a1_repl_count += 1
        else:
            de_a1.append(card)
            de_seen.add(word_lower)
            
    print(f"German A1 processed: {len(de_a1)} items ({a1_repl_count} duplicates replaced).")
    
    # Step C: Process A2 (711 items)
    with open(os.path.join(ROOT, 'data/de/vocab_a2.json')) as f:
        a2_orig = json.load(f)
    de_a2 = []
    a2_repl_count = 0
    
    for idx, card in enumerate(a2_orig, 1):
        word_lower = card['word'].strip().lower()
        if word_lower in de_seen:
            item = CLEAN_DE_REPLACEMENT_POOL[repl_pool_idx]
            repl_pool_idx += 1
            new_card = make_de_card(idx, item[0], item[1], item[2], item[3], None, None, item[4], item[5], item[6], item[7], 'a2')
            de_a2.append(new_card)
            de_seen.add(new_card['word'].strip().lower())
            a2_repl_count += 1
        else:
            de_a2.append(card)
            de_seen.add(word_lower)
            
    print(f"German A2 processed: {len(de_a2)} items ({a2_repl_count} duplicates replaced).")
    
    # Step D: Process B2 (545 items)
    with open(os.path.join(ROOT, 'data/de/vocab_b2.json')) as f:
        b2_orig = json.load(f)
    de_b2 = []
    b2_repl_count = 0
    
    for idx, card in enumerate(b2_orig, 1):
        word_lower = card['word'].strip().lower()
        if word_lower in de_seen:
            item = CLEAN_DE_REPLACEMENT_POOL[repl_pool_idx]
            repl_pool_idx += 1
            new_card = make_de_card(idx, item[0], item[1], item[2], item[3], None, None, item[4], item[5], item[6], item[7], 'b2')
            de_b2.append(new_card)
            de_seen.add(new_card['word'].strip().lower())
            b2_repl_count += 1
        else:
            de_b2.append(card)
            de_seen.add(word_lower)
            
    print(f"German B2 processed: {len(de_b2)} items ({b2_repl_count} duplicates replaced).")
    
    # Step E: Build German C1 (exactly 350 items)
    c1_candidates = []
    # 1. From original generate_c1_c2_vocab
    for c in get_german_c1_words():
        w_lower = c['word'].strip().lower()
        if w_lower not in de_seen:
            c1_candidates.append(c)
            de_seen.add(w_lower)
            
    # 2. From DE_C1_EXTRA
    for item in DE_C1_EXTRA:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen:
            card = make_de_card(len(c1_candidates) + 1, item[0], item[1], item[2], item[3], item[5] if len(item) > 5 else None, item[6] if len(item) > 6 else None, item[4], item[7] if len(item) > 7 else item[5], item[8] if len(item) > 8 else item[6], item[9] if len(item) > 9 else "Wissenschaft", 'c1')
            c1_candidates.append(card)
            de_seen.add(w_lower)
            
    # 3. From DE_C1_MORE
    for item in DE_C1_MORE:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen:
            card = make_de_card(len(c1_candidates) + 1, item[0], item[1], item[2], item[3], item[5] if len(item) > 5 else None, item[6] if len(item) > 6 else None, item[4], item[7] if len(item) > 7 else item[5], item[8] if len(item) > 8 else item[6], item[9] if len(item) > 9 else "Wissenschaft", 'c1')
            c1_candidates.append(card)
            de_seen.add(w_lower)
            
    # Additional C1 items if needed
    more_c1_words = [
        ("Kausalitätsprinzip", "das", "-", "noun", "шалтгаант чанарын зарчим", "Das Kausalitätsprinzip bildet das Fundament der klassischen Naturwissenschaften.", "Шалгаант чанарын зарчим нь сонгодог байгалийн шинжлэх ухааны суурийг бүрдүүлдэг.", "Wissenschaft"),
        ("Rationalismus", "der", "-", "noun", "рационализм, оюун ухааныг шүтэх үзэл", "Der europäische Rationalismus prägte die Epoche der Aufklärung nachhaltig.", "Европын рационализм нь соён гэгээрлийн эрин үеийг хүчтэй тодорхойлсон.", "Philosophie"),
        ("Empirismus", "der", "-", "noun", "эмпиризм, туршлагыг шүтэх үзэл", "Der britische Empirismus betrachtet Sinneserfahrung als primäre Quelle aller Erkenntnis.", "Британийн эмпиризм нь мэдрэхүйн туршлагыг бүх мэдлэгийн анхдагч эх сурвалж гэж үздэг.", "Philosophie"),
        ("Pragmatismus", "der", "-", "noun", "прагматизм, бодит үр ашгийг эрхэмлэх үзэл", "Politischer Pragmatismus sucht nach machbaren Kompromissen statt nach starren Dogmen.", "Улс төрийн прагматизм нь хөшүүн номлолын оронд хэрэгжиж болохуйц зөвшилцлийг эрэлхийлдэг.", "Politik"),
        ("Pluralismus", "der", "-", "noun", "плюрализм, олон ургальч үзэл", "Meinungsfreiheit und weltanschaulicher Pluralismus sind Wesensmerkmale offener Demokratien.", "Үзэл бодлоо илэрхийлэх эрх чөлөө болон олон ургальч үзэл нь нээлттэй ардчиллын гол шинж юм.", "Gesellschaft"),
        ("Föderalismus", "der", "-", "noun", "холбооны тогтолцоо, федерализм", "Der Föderalismus verteilt politische Macht zwischen Bund und Ländern ausgewogen.", "Холбооны тогтолцоо нь улс төрийн эрх мэдлийг холбоо болон мужуудын хооронд тэнцвэртэй хуваарилдаг.", "Politik"),
        ("Rechtsordnung", "die", "-en", "noun", "эрх зүйн дэг журам, хуулийн тогтолцоо", "Eine verlässliche Rechtsordnung schützt Bürger und Unternehmen vor staatlicher Willkür.", "Найдвартай эрх зүйн дэг журам нь иргэд болон компаниудыг төрийн дур зоргоос хамгаалдаг.", "Recht"),
        ("Zivilcourage", "die", "-", "noun", "иргэний зориг", "Zivilcourage bedeutet, bei Ungerechtigkeit mutig seine Stimme zu erheben.", "Иргэний зориг гэдэг нь шударга бус явдлын эсрэг зоригтойгоор дуу хоолойгоо өргөхийг хэлнэ.", "Gesellschaft"),
        ("Nachhaltigkeitsbericht", "der", "-e", "noun", "тогтвортой байдлын тайлан", "Der jährliche Nachhaltigkeitsbericht dokumentiert ökologische Maßnahmen des Konzerns.", "Жил тутмын тогтвортой байдлын тайлан нь концернийн экологийн арга хэмжээг баримтжуулдаг.", "Wirtschaft"),
        ("Bürgerbeteiligung", "die", "-en", "noun", "иргэдийн оролцоо", "Direkte Bürgerbeteiligung stärkt das Vertrauen in kommunale Entscheidungen.", "Шууд иргэдийн оролцоо нь орон нутгийн шийдвэрт итгэх итгэлийг бэхжүүлдэг.", "Politik"),
        ("Wirtschaftskammer", "die", "-n", "noun", "худалдаа аж үйлдвэрийн танхим", "Die Wirtschaftskammer vertritt die Interessen mittelständischer Unternehmen.", "Худалдааны танхим дунд үйлдвэрлэгчдийн ашиг сонирхлыг төлөөлдөг.", "Wirtschaft"),
        ("Handelsabkommen", "das", "-", "noun", "худалдааны гэрээ хэлэлцээр", "Das multilaterale Handelsabkommen senkt Zölle und erleichtert den Export.", "Олон талт худалдааны хэлэлцээр нь гаалийн татварыг бууруулж, экспортыг хөнгөвчилдөг.", "Wirtschaft"),
        ("Innovationspreis", "der", "-e", "noun", "инновацийн шагнал", "Das Forschungsinstitut wurde mit dem renommierten Innovationspreis ausgezeichnet.", "Судалгааны хүрээлэн нэр хүндтэй инновацийн шагналаар шагнуулав.", "Technik"),
        ("Technologietransfer", "der", "-s", "noun", "технологийн дамжуулалт", "Ein effizienter Technologietransfer verbindet Hochschulen mit der produzierenden Industrie.", "Үр ашигтай технологийн шилжүүлэг нь их сургуулиудыг үйлдвэрлэлтэй холбодог.", "Technik"),
        ("Datensicherheit", "die", "-", "noun", "өгөгдлийн аюулгүй байдал", "Datensicherheit hat oberste Priorität bei der Speicherung vertraulicher Kundendaten.", "Үйлчлүүлэгчийн нууц мэдээллийг хадгалахад өгөгдлийн аюулгүй байдал нэн тэргүүнд тавигддаг.", "Informatik")
    ]
    for item in more_c1_words:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen and len(c1_candidates) < 350:
            card = make_de_card(len(c1_candidates) + 1, item[0], item[1], item[2], item[3], None, None, item[4], item[5], item[6], item[7], 'c1')
            c1_candidates.append(card)
            de_seen.add(w_lower)

    for item in DE_C1_TOPOFFS:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen and len(c1_candidates) < 350:
            card = make_de_card(len(c1_candidates) + 1, item[0], item[1], item[2], item[3], None, None, item[4], item[5], item[6], item[7], 'c1')
            c1_candidates.append(card)
            de_seen.add(w_lower)

    for item in DE_C1_EXTRA_25:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen and len(c1_candidates) < 350:
            card = make_de_card(len(c1_candidates) + 1, item[0], item[1], item[2], item[3], None, None, item[4], item[5], item[6], item[7], 'c1')
            c1_candidates.append(card)
            de_seen.add(w_lower)
            
    # Fix IDs and ensure clean formatting
    de_c1 = []
    for idx, card in enumerate(c1_candidates[:350], 1):
        card['id'] = f"de_c1_{idx:04d}"
        if card.get('pos') == 'verb' and (not card.get('forms') or '|' not in str(card.get('forms'))):
            card['pos'] = 'phrase'
            card['forms'] = None
        de_c1.append(card)
        
    print(f"German C1 built: {len(de_c1)} items.")
    assert len(de_c1) == 350, f"German C1 must have 350 items, got {len(de_c1)}"
    
    # Step F: Build German C2 (exactly 350 items)
    c2_candidates = []
    for c in get_german_c2_words():
        w_lower = c['word'].strip().lower()
        if w_lower not in de_seen:
            c2_candidates.append(c)
            de_seen.add(w_lower)
            
    for item in DE_C2_EXTRA:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen:
            card = make_de_card(len(c2_candidates) + 1, item[0], item[1], item[2], item[3], item[5] if len(item) > 5 else None, item[6] if len(item) > 6 else None, item[4], item[7] if len(item) > 7 else item[5], item[8] if len(item) > 8 else item[6], item[9] if len(item) > 9 else "Philosophie", 'c2')
            c2_candidates.append(card)
            de_seen.add(w_lower)
            
    for item in DE_C2_MORE:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen:
            card = make_de_card(len(c2_candidates) + 1, item[0], item[1], item[2], item[3], item[5] if len(item) > 5 else None, item[6] if len(item) > 6 else None, item[4], item[7] if len(item) > 7 else item[5], item[8] if len(item) > 8 else item[6], item[9] if len(item) > 9 else "Philosophie", 'c2')
            c2_candidates.append(card)
            de_seen.add(w_lower)
            
    more_c2_words = [
        ("Weltschmerz", "der", "-", "noun", "ертөнцийн зовлонг хуваалцсан гуниг", "Die Dichtung der Romantik ist durchdrungen von tiefem Weltschmerz.", "Романтизмын яруу найраг ертөнцийн гүн гунигаар нэвт шингэсэн байдаг.", "Literatur"),
        ("Sehnsucht", "die", "-¨e", "noun", "тэмүүлэл, гүн санагалзал", "Eine unstillbare Sehnsucht nach fernen Ländern trieb den Entdecker an.", "Алсын орнууд руу чиглэсэн цангаашгүй тэмүүлэл аялагчийг урагш хөтөлсөн.", "Literatur"),
        ("Geistesgegenwart", "die", "-", "noun", "оюуны хурц сэргэг байдал, гэнэтийн самбаа", "Ihre Geistesgegenwart verhinderte im entscheidenden Augenblick ein schweres Unglück.", "Түүний гэнэтийн сэргэг ухаан шийдвэрлэх агшинд хүнд ослоос сэргийлсэн.", "Charakter"),
        ("Schadenfreude", "die", "-", "noun", "бусдын азгүйд баярлах зан", "Reine Schadenfreude verrät einen kleinlichen und missgünstigen Charakter.", "Бусдын бүтэлгүйтэлд баярлах нь өчүүхэн, атаархуу занг илчилдэг.", "Psychologie"),
        ("Zerrissenheit", "die", "-", "noun", "сэтгэлийн дотоод зөрчил, хоёр хуваагдал", "Die innere Zerrissenheit des Protagonisten spiegelt den Geist einer krisenhaften Epoche wider.", "Гол баатрын дотоод сэтгэлийн зөрчил нь хямралт цаг үеийн уур амьсгалыг тольдон харуулдаг.", "Literatur"),
        ("Muße", "die", "-", "noun", "бүтээлч амарлингуй чөлөөт цаг", "Philosophische Einsichten entstehen oft erst in Stunden ungestörter Muße.", "Гүн ухааны гэгээрэл ихэвчлэн саадгүй амгалан чөлөөт цагт төрдөг.", "Philosophie"),
        ("Wagemut", "der", "-", "noun", "эр зориг, баатарлаг зоримог явдал", "Ihr Wagemut bei der Erkundung unwegsamer Gebirge wurde vielfach gerühmt.", "Бартаат уулсыг судлах үеийн түүний зоримог зориг олонтаа магтагдсан.", "Charakter"),
        ("Tatkraft", "die", "-", "noun", "гүйцэтгэх эрч хүч, шийдэмгий байдал", "Mit bewundernswerter Tatkraft setzte sie die komplexen Reformen um.", "Тэрээр бишрэм эрч хүчтэйгээр нарийн төвөгтэй шинэчлэлүүдийг хэрэгжүүлсэн.", "Führung"),
        ("Urteilskraft", "die", "-¨e", "noun", "шүүн тунгаах чадвар", "Eine geschulte Urteilskraft unterscheidet zwischen Schein und Wahrheit.", "Боловсорсон шүүн тунгаах ухаан нь хуурамч үзэгдэл ба үнэнийг ялгадаг.", "Philosophie"),
        ("Staatskunst", "die", "-", "noun", "төрийн ухаан, төрийн жолоодох чадвар", "Wahre Staatskunst beweist sich in der friedlichen Beilegung internationaler Krisen.", "Жинхэнэ төрийн ухаан нь олон улсын хямралыг тайван замаар зохицуулахад нотлогддог.", "Politik"),
        ("Weitsicht", "die", "-", "noun", "холыг харах ухаан, алсын хараа", "Ihre strategische Weitsicht bewahrte die Organisation vor folgenschweren Fehlentscheidungen.", "Түүний стратегийн алсын хараа байгууллагыг ноцтой буруу шийдвэрээс аварчээ.", "Führung"),
        ("Wahrhaftigkeit", "die", "-", "noun", "үнэнч шударга байдал", "Wahrhaftigkeit gegenüber sich selbst ist der Anfang aller Weisheit.", "Өөртөө үнэнч байх нь бүх мэргэн ухааны эхлэл юм.", "Ethik"),
        ("Unbeirrbarkeit", "die", "-", "noun", "замаасаа хазайхгүй тууштай байдал", "Mit stoischer Unbeirrbarkeit verfolgte die Forscherin ihr wissenschaftliches Ziel.", "Судлаач шинжлэх ухааны зорилгоо хазайлтгүй тууштай дагасан.", "Wissenschaft"),
        ("Aufrichtigkeit", "die", "-", "noun", "чин сэтгэл, үнэнч байдал", "Echte Aufrichtigkeit schafft ein unzerstörbares Band des Vertrauens.", "Жинхэнэ чин сэтгэл итгэлцлийн нугаршгүй холбоог үүсгэдэг.", "Ethik"),
        ("Wohlwollen", "das", "-", "noun", "сайн санаа, элэгсэг хандлага", "Der Prüfungsausschuss begegnete den Kandidaten mit spürbarem Wohlwollen.", "Шалгалтын комисс шалгуулагчдад мэдэгдэхүйц элэгсэг хандлаа.", "Gesellschaft")
    ]
    for item in more_c2_words:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen and len(c2_candidates) < 350:
            card = make_de_card(len(c2_candidates) + 1, item[0], item[1], item[2], item[3], None, None, item[4], item[5], item[6], item[7], 'c2')
            c2_candidates.append(card)
            de_seen.add(w_lower)

    for item in DE_C2_TOPOFFS:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen and len(c2_candidates) < 350:
            card = make_de_card(len(c2_candidates) + 1, item[0], item[1], item[2], item[3], None, None, item[4], item[5], item[6], item[7], 'c2')
            c2_candidates.append(card)
            de_seen.add(w_lower)

    for item in DE_C2_EXTRA_25:
        w_lower = item[0].strip().lower()
        if w_lower not in de_seen and len(c2_candidates) < 350:
            card = make_de_card(len(c2_candidates) + 1, item[0], item[1], item[2], item[3], None, None, item[4], item[5], item[6], item[7], 'c2')
            c2_candidates.append(card)
            de_seen.add(w_lower)
            
    de_c2 = []
    for idx, card in enumerate(c2_candidates[:350], 1):
        card['id'] = f"de_c2_{idx:04d}"
        if card.get('pos') == 'verb' and (not card.get('forms') or '|' not in str(card.get('forms'))):
            card['pos'] = 'phrase'
            card['forms'] = None
        de_c2.append(card)
        
    print(f"German C2 built: {len(de_c2)} items.")
    assert len(de_c2) == 350, f"German C2 must have 350 items, got {len(de_c2)}"
    
    # ----------------------------------------------------
    # 2. ENGLISH DATASET
    # ----------------------------------------------------
    print("\n--- Processing English Lexicon ---")
    
    # Step A: Load A1 (761 items)
    with open(os.path.join(ROOT, 'data/en/vocab_a1.json')) as f:
        en_a1 = json.load(f)
    en_seen = set()
    for w in en_a1:
        en_seen.add(w['word'].strip().lower())
    print(f"English A1 loaded: {len(en_a1)} items (canonical base).")
    
    # Step B: Process A2 (764 items)
    with open(os.path.join(ROOT, 'data/en/vocab_a2.json')) as f:
        a2_orig = json.load(f)
    en_a2 = []
    a2_repl_idx = 0
    a2_repl_count = 0
    for idx, card in enumerate(a2_orig, 1):
        w_lower = card['word'].strip().lower()
        if w_lower in en_seen:
            repl = EN_REPLACEMENTS['a2'][a2_repl_idx]
            a2_repl_idx += 1
            new_card = make_en_card(idx, repl['word'], repl['pos'], repl['forms'], repl['mn'], repl['example_en'], repl['example_mn'], repl['topic'], 'a2')
            en_a2.append(new_card)
            en_seen.add(new_card['word'].strip().lower())
            a2_repl_count += 1
        else:
            en_a2.append(card)
            en_seen.add(w_lower)
    print(f"English A2 processed: {len(en_a2)} items ({a2_repl_count} duplicates replaced).")
    
    # Step C: Process B1 (765 items)
    with open(os.path.join(ROOT, 'data/en/vocab_b1.json')) as f:
        b1_orig = json.load(f)
    en_b1 = []
    b1_repl_idx = 0
    b1_repl_count = 0
    for idx, card in enumerate(b1_orig, 1):
        w_lower = card['word'].strip().lower()
        if w_lower in en_seen:
            repl = EN_REPLACEMENTS['b1'][b1_repl_idx]
            b1_repl_idx += 1
            new_card = make_en_card(idx, repl['word'], repl['pos'], repl['forms'], repl['mn'], repl['example_en'], repl['example_mn'], repl['topic'], 'b1')
            en_b1.append(new_card)
            en_seen.add(new_card['word'].strip().lower())
            b1_repl_count += 1
        else:
            en_b1.append(card)
            en_seen.add(w_lower)
    print(f"English B1 processed: {len(en_b1)} items ({b1_repl_count} duplicates replaced).")
    
    # Step D: Process B2 (770 items)
    with open(os.path.join(ROOT, 'data/en/vocab_b2.json')) as f:
        b2_orig = json.load(f)
    en_b2 = []
    b2_repl_idx = 0
    b2_repl_count = 0
    for idx, card in enumerate(b2_orig, 1):
        w_lower = card['word'].strip().lower()
        if w_lower in en_seen:
            repl = EN_REPLACEMENTS['b2'][b2_repl_idx]
            b2_repl_idx += 1
            new_card = make_en_card(idx, repl['word'], repl['pos'], repl['forms'], repl['mn'], repl['example_en'], repl['example_mn'], repl['topic'], 'b2')
            en_b2.append(new_card)
            en_seen.add(new_card['word'].strip().lower())
            b2_repl_count += 1
        else:
            en_b2.append(card)
            en_seen.add(w_lower)
    print(f"English B2 processed: {len(en_b2)} items ({b2_repl_count} duplicates replaced).")
    
    # Step E: Build English C1 (exactly 350 items)
    en_c1_candidates = []
    for c in get_english_c1_words():
        w_lower = c['word'].strip().lower()
        if w_lower not in en_seen:
            en_c1_candidates.append(c)
            en_seen.add(w_lower)
            
    for item in EN_C1_EXTRA_BANK:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c1_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c1_candidates) + 1, item, 'c1')
            en_c1_candidates.append(card)
            en_seen.add(w_lower)
            
    for item in EN_C1_MORE_BANK:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c1_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c1_candidates) + 1, item, 'c1')
            en_c1_candidates.append(card)
            en_seen.add(w_lower)

    for item in EN_C1_TOPOFFS:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c1_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c1_candidates) + 1, item, 'c1')
            en_c1_candidates.append(card)
            en_seen.add(w_lower)

    for item in EN_C1_EXTRA_90:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c1_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c1_candidates) + 1, item, 'c1')
            en_c1_candidates.append(card)
            en_seen.add(w_lower)

    for item in EN_C1_FINAL_55:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c1_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c1_candidates) + 1, item, 'c1')
            en_c1_candidates.append(card)
            en_seen.add(w_lower)

    for item in EN_C1_EXTRA_15:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c1_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c1_candidates) + 1, item, 'c1')
            en_c1_candidates.append(card)
            en_seen.add(w_lower)
            
    en_c1 = []
    for idx, card in enumerate(en_c1_candidates[:350], 1):
        card['id'] = f"en_c1_{idx:04d}"
        en_c1.append(card)
    print(f"English C1 built: {len(en_c1)} items.")
    assert len(en_c1) == 350, f"English C1 must have 350 items, got {len(en_c1)}"
    
    # Step F: Build English C2 (exactly 350 items)
    en_c2_candidates = []
    for c in get_english_c2_words():
        w_lower = c['word'].strip().lower()
        if w_lower not in en_seen:
            en_c2_candidates.append(c)
            en_seen.add(w_lower)
            
    for item in EN_C2_MORE_BANK:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c2_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c2_candidates) + 1, item, 'c2')
            en_c2_candidates.append(card)
            en_seen.add(w_lower)
            
    # Additional C2 candidates if needed
    extra_c2_tokens = [
        ("inimical", "adjective", "inimical", "хор хөнөөлтэй, дайсагнасан", "Excessive regulation can be inimical to entrepreneurial initiative.", "Хэт их зохицуулалт нь бизнес эрхлэх санаачилгад хор хөнөөлтэй байж болно.", "Economics"),
        ("iniquitous", "adjective", "iniquitous", "шударга бус, нүгэлтэй гэмт", "The citizens revolted against the monarch's iniquitous taxation decrees.", "Иргэд хааны шударга бус татварын тогтоолуудын эсрэг бослого гаргав.", "History"),
        ("insouciant", "adjective", "хайхрамжгүй, санаа зовох зүйлгүй амарлингуй", "He faced the daunting audit with an insouciant shrug.", "Тэрээр сүрдмээр аудитын шалгалтыг огт тоосон шинжгүй мөрөө хавчин угтав.", "Psychology"),
        ("intemperate", "adjective", "хэт туйлширсан, хэмжээ хязгааргүй", "Intemperate language during the debate damaged the diplomat's standing.", "Мэтгэлцээний үеэр хэт туйлширсан үг хэллэг хэрэглэсэн нь дипломатчийн байр суурийг ганхуулав.", "Rhetoric"),
        ("internecine", "adjective", "хоёр талдаа харилцан сүйрэлтэй, цуст", "The nation was torn apart by an internecine civil war.", "Тус үндэстэн хоёр талдаа сүйрэлтэй иргэний дайнд талцан сүйрэв.", "History"),
        ("inveigle", "verb", "inveigle | inveigles | inveigled | inveigled", "зальдан аргалах, урхидан татах", "The con artist inveigled his victims into dubious investment schemes.", "Залилагч хохирогчдыг эргэлзээтэй хөрөнгө оруулалтын схемд урхидан оруулав.", "Crime"),
        ("inveterate", "adjective", "архагшсан, засаршгүй дадал болсон", "He was an inveterate traveler who could never stay settled in one country.", "Тэрээр нэг оронд удаан тогтож чаддаггүй архагшсан аялагч байв.", "Lifestyle"),
        ("irascible", "adjective", "түргэн ууртай, амархан хилэгнэдэг", "The irascible conductor stopped the orchestra abruptly over a minor misstep.", "Түргэн ууртай удирдаач өчүүхэн алдаанаас болж найрал хөгжмийг огцом зогсоов.", "Music"),
        ("jettison", "verb", "jettison | jettisons | jettisoned | jettisoned", "онгоцноос хаях, зориуд орхих", "The spacecraft jettisoned its external fuel tanks after exiting the atmosphere.", "Сансрын хөлөг агаар мандлаас гарсны дараа гаднах түлшний саваа хаясан.", "Aerospace"),
        ("laconic", "adjective", "товч цөөн үгтэй, лаконик", "The general sent a laconic telegram simply stating 'Victory achieved.'", "Генерал 'Ялалтад хүрэв' гэсэн ганц өгүүлбэртэй товч цахилгаан илгээв.", "Military"),
        ("lassitude", "noun", "lassitude", "хүч тамиргүй байдал, сульдаа", "A heavy tropical lassitude descended upon the travelers in the afternoon heat.", "Үдээс хойших халуунд аялагчдыг халуун орны хүнд сульдаа нөмрөн авав.", "Health"),
        ("limpid", "adjective", "тунгалаг тунгалаг, цэвэр тунгалаг", "The mountain stream was so limpid that pebbles on the riverbed were clearly visible.", "Уулын горхи маш тунгалаг байсан тул ёроолын хайрга хүртэл тод харагдаж байв.", "Nature"),
        ("lucidity", "noun", "lucidity", "оюуны саруул тунгалаг байдал", "In rare moments of lucidity, the elderly philosopher recalled his early lectures.", "Ахмад философич оюун санаа саруулсах ховор мөчүүдэд эртний лекцүүдээ дурсаж байв.", "Mind"),
        ("lugubrious", "adjective", "гунигтай дүнсгэр, гашуун", "The cellist played a lugubrious melody that brought tears to many eyes.", "Морин хийлч олон хүний нүдэнд нулимс цийлэгнүүлсэн гашуудалтай дүнсгэр аялгуу тоглов.", "Music"),
        ("machination", "noun", "machinations", "далд хуйвалдаан, явуулга", "Court machinations eventually forced the royal advisor into exile.", "Ордны далд явуулгууд эцэстээ хааны зөвлөхийг цөллөгт явуулахад хүргэв.", "History")
    ]
    for item in extra_c2_tokens:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c2_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c2_candidates) + 1, item, 'c2')
            en_c2_candidates.append(card)
            en_seen.add(w_lower)

    for item in EN_C2_TOPOFFS:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c2_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c2_candidates) + 1, item, 'c2')
            en_c2_candidates.append(card)
            en_seen.add(w_lower)

    for item in EN_C2_EXTRA_105:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c2_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c2_candidates) + 1, item, 'c2')
            en_c2_candidates.append(card)
            en_seen.add(w_lower)

    for item in EN_C2_FINAL_40:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c2_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c2_candidates) + 1, item, 'c2')
            en_c2_candidates.append(card)
            en_seen.add(w_lower)

    for item in EN_C2_EXTRA_6:
        w_lower = item[0].strip().lower()
        if w_lower not in en_seen and len(en_c2_candidates) < 350:
            card = make_en_card_from_tuple(len(en_c2_candidates) + 1, item, 'c2')
            en_c2_candidates.append(card)
            en_seen.add(w_lower)
            
    en_c2 = []
    for idx, card in enumerate(en_c2_candidates[:350], 1):
        card['id'] = f"en_c2_{idx:04d}"
        en_c2.append(card)
    print(f"English C2 built: {len(en_c2)} items.")
    assert len(en_c2) == 350, f"English C2 must have 350 items, got {len(en_c2)}"
    
    # ----------------------------------------------------
    # 3. SAVE ALL FILES AND MODULAR ALIASES
    # ----------------------------------------------------
    print("\n--- Saving All Datasets and Modular Aliases ---")
    
    files_to_save = {
        'de': {
            'vocab_a1.json': de_a1,
            'vocab_a2.json': de_a2,
            'vocab_b1.json': de_b1,
            'vocab_b2.json': de_b2,
            'vocab_c1.json': de_c1,
            'vocab_c2.json': de_c2,
            'a1.json': de_a1,
            'a2.json': de_a2,
            'b1.json': de_b1,
            'b2.json': de_b2,
            'c1.json': de_c1,
            'c2.json': de_c2
        },
        'en': {
            'vocab_a1.json': en_a1,
            'vocab_a2.json': en_a2,
            'vocab_b1.json': en_b1,
            'vocab_b2.json': en_b2,
            'vocab_c1.json': en_c1,
            'vocab_c2.json': en_c2,
            'a1.json': en_a1,
            'a2.json': en_a2,
            'b1.json': en_b1,
            'b2.json': en_b2,
            'c1.json': en_c1,
            'c2.json': en_c2
        }
    }
    
    for lang, datasets in files_to_save.items():
        for filename, data in datasets.items():
            filepath = os.path.join(ROOT, 'data', lang, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Saved: data/{lang}/{filename} ({len(data)} items)")
            
    # ----------------------------------------------------
    # 4. STRICT VERIFICATION & VALIDATION PASS
    # ----------------------------------------------------
    print("\n--- Strict Verification Pass ---")
    
    # 1. German Duplication Audit across all 6 levels
    de_total_words = 0
    de_all_seen = {}
    de_dupes = []
    for lvl in ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']:
        filepath = os.path.join(ROOT, 'data', 'de', f'vocab_{lvl}.json')
        with open(filepath) as f:
            words = json.load(f)
        de_total_words += len(words)
        for w in words:
            word_str = w['word'].strip().lower()
            if word_str in de_all_seen:
                de_dupes.append((w['word'], de_all_seen[word_str], lvl))
            else:
                de_all_seen[word_str] = lvl
                
            # Verify required fields
            assert w.get('id'), f"Item missing id in {lvl}: {w}"
            assert w.get('word'), f"Item missing word in {lvl}: {w}"
            assert w.get('mn'), f"Item missing mn in {lvl}: {w}"
            assert w.get('prompt_front'), f"Item missing prompt_front in {lvl}: {w}"
            assert w.get('revealed_back'), f"Item missing revealed_back in {lvl}: {w}"
            if w.get('pos') == 'noun':
                assert w.get('article') in ['der', 'die', 'das'], f"Noun {w['word']} missing valid article"
                assert w.get('plural') is not None, f"Noun {w['word']} missing plural"
                assert '_____' in w.get('prompt_front'), f"Noun {w['word']} missing cloze"
                assert w.get('article') in w.get('revealed_back'), f"Noun {w['word']} revealed_back missing article"
            elif w.get('pos') == 'verb':
                assert w.get('forms'), f"Verb {w['word']} missing forms"
                assert '|' in str(w.get('forms')), f"Verb {w['word']} forms missing pipe"
                
    assert len(de_dupes) == 0, f"Found {len(de_dupes)} duplicate words in German: {de_dupes[:5]}"
    print(f"German Verification PASSED: {de_total_words} words across A1-C2 with 0 duplicates.")
    
    # 2. English Duplication Audit across all 6 levels
    en_total_words = 0
    en_all_seen = {}
    en_dupes = []
    for lvl in ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']:
        filepath = os.path.join(ROOT, 'data', 'en', f'vocab_{lvl}.json')
        with open(filepath) as f:
            words = json.load(f)
        en_total_words += len(words)
        for w in words:
            word_str = w['word'].strip().lower()
            if word_str in en_all_seen:
                en_dupes.append((w['word'], en_all_seen[word_str], lvl))
            else:
                en_all_seen[word_str] = lvl
                
            assert w.get('id'), f"EN item missing id in {lvl}: {w}"
            assert w.get('word'), f"EN item missing word in {lvl}: {w}"
            assert w.get('mn'), f"EN item missing mn in {lvl}: {w}"
            assert w.get('prompt_front'), f"EN item missing prompt_front in {lvl}: {w}"
            assert w.get('revealed_back'), f"EN item missing revealed_back in {lvl}: {w}"
            
    assert len(en_dupes) == 0, f"Found {len(en_dupes)} duplicate words in English: {en_dupes[:5]}"
    print(f"English Verification PASSED: {en_total_words} words across A1-C2 with 0 duplicates.")
    
    print("\nAll datasets built and verified successfully!")

if __name__ == '__main__':
    run_assembly()
