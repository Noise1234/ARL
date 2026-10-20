import json
import unicodedata

def nfc(s):
    return unicodedata.normalize('NFC', s.strip()) if s else s

# Expand DE A2 with more high-yield nouns, verbs, adjectives
extra_de_a2 = [
    # Nouns
    ("Ausflug", "der", "-e", "noun", "аялал, зугаалга", "excursion, trip", "der Ausflug, -e", "Am Wochenende machen wir einen Ausflug in die Berge.", "Амралтын өдрөөр бид уул руу зугаалга хийнэ.", "At the weekend we go on an excursion to the mountains."),
    ("Brief", "der", "-e", "noun", "захидал", "letter", "der Brief, -e", "Ich habe einen langen Brief an meine Großeltern geschrieben.", "Би өвөө эмээдээ урт захидал бичсэн.", "I wrote a long letter to my grandparents."),
    ("Einladung", "die", "-en", "noun", "урилга", "invitation", "die Einladung, -en", "Vielen Dank für die Einladung zur Party.", "Үдэшлэгийн урилгад маш их баярлалаа.", "Thank you very much for the invitation to the party."),
    ("Ergebnis", "das", "-se", "noun", "үр дүн", "result", "das Ergebnis, -se", "Das Ergebnis des Tests war sehr erfreulich.", "Тестийн үр дүн маш урамтай байсан.", "The result of the test was very pleasing."),
    ("Fahrkarte", "die", "-n", "noun", "унааны тасалбар", "ticket", "die Fahrkarte, -n", "Vergessen Sie nicht, Ihre Fahrkarte zu entwerten.", "Тасалбараа уншуулахаа бүү мартаарай.", "Do not forget to validate your ticket."),
    ("Garten", "der", "-", "noun", "цэцэрлэг", "garden", "der Garten, -", "Die Kinder spielen gerne im Garten.", "Хүүхдүүд цэцэрлэгт тоглох дуртай.", "The children like playing in the garden."),
    ("Krankheit", "die", "-en", "noun", "өвчин", "illness", "die Krankheit, -en", "Die Krankheit dauerte zwei Wochen.", "Өвчин хоёр долоо хоног үргэлжилсэн.", "The illness lasted two weeks."),
    ("Lösung", "die", "-en", "noun", "шийдэл", "solution", "die Lösung, -en", "Wir müssen schnell eine Lösung finden.", "Бид хурдан шийдэл олох ёстой.", "We need to find a solution quickly."),
    ("Nachbar", "der", "-n", "noun", "хөрш", "neighbor", "der Nachbar, -n", "Unser Nachbar ist sehr freundlich und hilfsbereit.", "Манай хөрш маш найрсаг, тусархаг.", "Our neighbor is very friendly and helpful."),
    ("Reise", "die", "-n", "noun", "аялал", "journey, trip", "die Reise, -n", "Gute Reise und viel Spaß!", "Замдаа сайн явж, хөгжилтэй байгаарай!", "Have a good trip and have fun!"),
    ("Schlüssel", "der", "-", "noun", "түлхүүр", "key", "der Schlüssel, -", "Ich habe meinen Schlüssel verloren.", "Би түлхүүрээ гээчихсэн.", "I lost my key."),
    ("Supermarkt", "der", "-e", "noun", "дэлгүүр, супермаркет", "supermarket", "der Supermarkt, -e", "Der Supermarkt schließt um 20 Uhr.", "Супермаркет 20 цагт хаадаг.", "The supermarket closes at 8 pm."),
    ("Wetter", "das", "-", "noun", "цаг агаар", "weather", "das Wetter, -", "Wie wird das Wetter am Wochenende?", "Амралтын өдрүүдэд цаг агаар ямар байх бол?", "How will the weather be at the weekend?"),
    ("Wunsch", "der", "-e", "noun", "хүсэл", "wish", "der Wunsch, -e", "Ich habe einen großen Wunsch.", "Надад нэг том хүсэл байна.", "I have a big wish."),
    ("Zeitung", "die", "-en", "noun", "сонин", "newspaper", "die Zeitung, -en", "Mein Vater liest jeden Morgen die Zeitung.", "Аав маань өглөө бүр сонин уншдаг.", "My father reads the newspaper every morning.")
]

extra_de_a2_verbs = [
    ("anrufen", "ruft an", "rief an", "hat angerufen", "+ Akkusativ", "anrufen + _____", "утсаар ярих", "to call (phone)", "Ich rufe dich heute Abend an.", "Би өнөө орой чам руу залгана.", "I will call you this evening."),
    ("aufstehen", "steht auf", "stand auf", "ist aufgestanden", "um + Uhrzeit", "aufstehen um _____", "босох", "to get up", "Ich stehe meistens um sieben Uhr auf.", "Би ихэвчлэн долоон цагт босдог.", "I usually get up at seven o'clock."),
    ("beginnen", "beginnt", "begann", "hat begonnen", "mit + Dativ", "beginnen _____ [Dat]", "эхлэх", "to begin with", "Der Kurs beginnt um neun Uhr.", "Хичээл есөн цагт эхэлнэ.", "The course begins at nine o'clock."),
    ("bleiben", "bleibt", "blieb", "ist geblieben", "in + Dativ", "bleiben _____ [Dat]", "үйлдэх, үлдэх", "to stay", "Ich bleibe heute zu Hause.", "Би өнөөдөр гэртээ үлдэнэ.", "I am staying at home today."),
    ("einladen", "lädt ein", "lud ein", "hat eingeladen", "zu + Dativ", "einladen _____ [Dat]", "урих", "to invite to", "Er lädt uns zu seinem Geburtstag ein.", "Тэр биднийг төрсөн өдөртөө урьж байна.", "He invites us to his birthday."),
    ("empfehlen", "empfiehlt", "empfahl", "hat empfohlen", "+ Dativ + Akkusativ", "empfehlen + _____", "санал болгох", "to recommend", "Welches Gericht können Sie empfehlen?", "Та ямар хоол санал болгох вэ?", "Which dish can you recommend?"),
    ("finden", "findet", "fand", "hat gefunden", "+ Akkusativ", "finden + _____", "олох, дүгнэх", "to find", "Ich finde diese Idee hervorragend.", "Би энэ санааг гайхалтай гэж бодож байна.", "I find this idea excellent."),
    ("helfen", "hilft", "half", "hat geholfen", "bei + Dativ", "helfen _____ [Dat]", "туслах", "to help with", "Er hilft mir bei den Hausaufgaben.", "Тэр надад гэрийн даалгавар дээр тусалдаг.", "He helps me with homework.")
]

# Append to DE A2
with open('data/de/vocab_a2.json', 'r', encoding='utf-8') as f:
    de_a2 = json.load(f)

start_idx = len(de_a2) + 1
for w, art, pl, pos, mn_trans, en_trans, disp, ex_de, ex_mn, ex_en in extra_de_a2:
    de_a2.append({
        "id": f"de_a2_{str(start_idx).zfill(4)}",
        "word": nfc(w),
        "article": art,
        "plural": pl,
        "display": nfc(disp),
        "pos": pos,
        "lang": "de",
        "level": "A2",
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
        "topic": "Alltag & Freizeit"
    })
    start_idx += 1

for inf, p3, pret, perf, rek, cl, mn_trans, en_trans, ex_de, ex_mn, ex_en in extra_de_a2_verbs:
    forms = f"{inf} | {p3} | {pret} | {perf}"
    de_a2.append({
        "id": f"de_a2_{str(start_idx).zfill(4)}",
        "word": nfc(inf),
        "article": None,
        "plural": None,
        "display": nfc(inf),
        "pos": "verb",
        "lang": "de",
        "level": "A2",
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
    start_idx += 1

with open('data/de/vocab_a2.json', 'w', encoding='utf-8') as f:
    json.dump(de_a2, f, ensure_ascii=False, indent=2)
print("Updated data/de/vocab_a2.json total:", len(de_a2))

# Expand DE B2
extra_de_b2 = [
    ("Auseinandersetzung", "die", "-en", "noun", "маргаан, гүнзгий хэлэлцүүлэг", "dispute, grappling with", "die Auseinandersetzung, -en", "Die Auseinandersetzung mit der Geschichte ist lehrreich.", "Түүхтэй гүнзгий танилцаж ойлгох нь сургамжтай.", "Grappling with history is instructive."),
    ("Bedeutung", "die", "-en", "noun", "ач холбогдол, утга", "significance, importance", "die Bedeutung, -en", "Dieses Abkommen ist von grundlegender Bedeutung.", "Энэ хэлэлцээр нь суурь ач холбогдолтой юм.", "This agreement is of fundamental importance."),
    ("Einfluss", "der", "-e", "noun", "нөлөө", "influence", "der Einfluss, -e", "Klimamodelle haben großen Einfluss auf politische Entscheidungen.", "Уур амьсгалын загвар улс төрийн шийдвэрт их нөлөөтэй.", "Climate models have great influence on policy decisions."),
    ("Entwicklung", "die", "-en", "noun", "хөгжил, өөрчлөлт", "development", "die Entwicklung, -en", "Die wirtschaftliche Entwicklung verläuft vielversprechend.", "Эдийн засгийн хөгжил ирээдүйтэй өрнөж байна.", "Economic development is progressing promisingly."),
    ("Fortschritt", "der", "-e", "noun", "ахиц дэвшил", "progress", "der Fortschritt, -e", "Technologischer Fortschritt verändert unseren Alltag.", "Технологийн дэвшил бидний өдөр тутмын амьдралыг өөрчилж байна.", "Technological progress transforms our daily lives."),
    ("Gelegenheit", "die", "-en", "noun", "боломж завшаан", "opportunity, occasion", "die Gelegenheit, -en", "Nutzen Sie diese einmalige Gelegenheit.", "Энэхүү хосгүй боломжийг ашиглаарай.", "Seize this unique opportunity."),
    ("Gleichberechtigung", "die", "-", "noun", "тэгш эрх", "equal rights", "die Gleichberechtigung, -", "Gleichberechtigung ist ein verfassungsmäßiges Grundrecht.", "Тэгш эрх бол үндсэн хуулиар хамгаалагдсан эрх юм.", "Equal rights is a constitutional fundamental right."),
    ("Widerspruch", "der", "-e", "noun", "зөрчил, эсэргүүцэл", "contradiction, objection", "der Widerspruch, -e", "Das steht im Widerspruch zu den Fakten.", "Энэ нь бодит баримтуудтай зөрчилдөж байна.", "That stands in contradiction to the facts.")
]

extra_de_b2_verbs = [
    ("auffordern", "fordert auf", "forderte auf", "hat aufgefordert", "zu + Dativ", "auffordern _____ [Dat]", "уриалах, шаардах", "to call upon / prompt", "Die Leitung forderte alle zum Handeln auf.", "Удирдлага бүгдийг арга хэмжээ авахыг уриалав.", "Management called upon everyone to take action."),
    ("befassen", "befasst", "befasste", "hat befasst", "sich mit + Dativ", "sich befassen _____ [Dat]", "судлах, авч үзэх", "to deal with", "Das Gremium befasst sich mit der Angelegenheit.", "Зөвлөл уг асуудлыг авч үзэж байна.", "The committee is dealing with the matter."),
    ("begründen", "begründet", "begründete", "hat begründet", "+ Akkusativ", "begründen + _____", "үндэслэл гаргах", "to substantiate / justify", "Er begründete seinen Standpunkt überzeugend.", "Тэр өөрийн байр суурийг итгэл үнэмшилтэй үндэслэв.", "He justified his standpoint convincingly."),
    ("durchsetzen", "setzt durch", "setzte durch", "hat durchgesetzt", "+ Akkusativ", "durchsetzen + _____", "хэрэгжүүлэх, зүтгүүлэх", "to enforce / push through", "Das Gesetz konnte sich schließlich durchsetzen.", "Хууль эцэстээ хэрэгжиж чадсан.", "The law was finally able to prevail."),
    ("ermöglichen", "ermöglicht", "ermöglichte", "hat ermöglicht", "+ Dativ + Akkusativ", "ermöglichen + _____", "боломж олгох", "to enable / make possible", "Stipendien ermöglichen begabten Studierenden den Abschluss.", "Тэтгэлэг нь авьяаслаг оюутнуудад сургуулиа төгсөх боломж олгодог.", "Scholarships enable gifted students to graduate.")
]

with open('data/de/vocab_b2.json', 'r', encoding='utf-8') as f:
    de_b2 = json.load(f)

start_idx = len(de_b2) + 1
for w, art, pl, pos, mn_trans, en_trans, disp, ex_de, ex_mn, ex_en in extra_de_b2:
    de_b2.append({
        "id": f"de_b2_{str(start_idx).zfill(4)}",
        "word": nfc(w),
        "article": art,
        "plural": pl,
        "display": nfc(disp),
        "pos": pos,
        "lang": "de",
        "level": "B2",
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
        "topic": "Gesellschaft & Wissenschaft"
    })
    start_idx += 1

for inf, p3, pret, perf, rek, cl, mn_trans, en_trans, ex_de, ex_mn, ex_en in extra_de_b2_verbs:
    forms = f"{inf} | {p3} | {pret} | {perf}"
    de_b2.append({
        "id": f"de_b2_{str(start_idx).zfill(4)}",
        "word": nfc(inf),
        "article": None,
        "plural": None,
        "display": nfc(inf),
        "pos": "verb",
        "lang": "de",
        "level": "B2",
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
    start_idx += 1

with open('data/de/vocab_b2.json', 'w', encoding='utf-8') as f:
    json.dump(de_b2, f, ensure_ascii=False, indent=2)
print("Updated data/de/vocab_b2.json total:", len(de_b2))

# Expand English A1, A2, B1, B2
extra_en_a1 = [
    ("have", "verb", "have | had | had", None, "have (V2 / V3?)", "have | had | had", "байх, эзэмших", "haben", "I have two sisters.", "Би хоёр эгчтэй.", "Ich habe zwei Schwestern."),
    ("know", "verb", "know | knew | known", None, "know (V2 / V3?)", "know | knew | known", "мэдэх", "wissen, kennen", "Do you know the answer?", "Та хариултыг мэдэж байна уу?", "Weißt du die Antwort?"),
    ("find", "verb", "find | found | found", None, "find (V2 / V3?)", "find | found | found", "олох", "finden", "I found my wallet under the desk.", "Би түрийвчээ ширээн доороос олсон.", "Ich habe mein Portemonnaie unter dem Schreibtisch gefunden."),
    ("tell", "verb", "tell | told | told", None, "tell (V2 / V3?)", "tell | told | told", "хэлэх, ярих", "erzählen", "Tell me the story.", "Надад түүхээ ярьж өгөөч.", "Erzähl mir die Geschichte."),
    ("ask", "verb", "ask | asked | asked", "for", "ask _____ [prep]", "ask for", "асуух, гуйх", "fragen / bitten", "Always ask for help if you need it.", "Хэрэгтэй бол үргэлж тусламж гуйгаарай.", "Bitte immer um Hilfe, wenn du sie brauchst."),
    ("work", "verb", "work | worked | worked", "at / for", "work _____ [prep]", "work at / for", "ажиллах", "arbeiten", "She works at a bank.", "Тэр банкинд ажилладаг.", "Sie arbeitet bei einer Bank."),
    ("call", "verb", "call | called | called", None, "call [V]", "call", "дуудах, утасдах", "anrufen", "Call me when you arrive.", "Хүрч ирээд над руу залгаарай.", "Ruf mich an, wenn du ankommst."),
    ("try", "verb", "try | tried | tried", None, "try (to + inf)", "try", "хичээх, турших", "versuchen", "Try to practice every day.", "Өдөр бүр дадлага хийхийг хичээгээрэй.", "Versuche jeden Tag zu üben."),
    ("feel", "verb", "feel | felt | felt", None, "feel (V2 / V3?)", "feel | felt | felt", "мэдрэх", "fühlen", "I feel happy today.", "Би өнөөдөр баяртай байна.", "Ich fühle mich heute glücklich."),
    ("leave", "verb", "leave | left | left", None, "leave (V2 / V3?)", "leave | left | left", "орхих", "verlassen", "He left the office early.", "Тэр оффисоосоо эрт гарсан.", "Er hat das Büro früh verlassen."),
    ("city", "noun", "city -> cities", None, "city (plural?) [N]", "city -> cities", "хот", "die Stadt, -e", "London is an ancient city.", "Лондон бол эртний хот юм.", "London ist eine uralte Stadt."),
    ("family", "noun", "family -> families", None, "family (plural?) [N]", "family -> families", "гэр бүл", "die Familie, -n", "I love spending time with my family.", "Би гэр бүлтэйгээ цагийг өнгөрөөх дуртай.", "Ich verbringe gerne Zeit mit meiner Familie."),
    ("friend", "noun", None, None, "friend [N]", "friend, friends", "найз", "der Freund, -e", "A friend in need is a friend indeed.", "Зовох цагт нөхрийн чанар танигдана.", "Freunde in der Not gehen tausend auf ein Lot."),
    ("time", "noun", None, None, "time [N]", "time (uncountable/countable)", "цаг хугацаа", "die Zeit", "Time is of the essence.", "Цаг хугацаа бол хамгийн чухал.", "Zeit ist von entscheidender Bedeutung."),
    ("day", "noun", None, None, "day [N]", "day, days", "өдөр", "der Tag, -e", "Have a wonderful day!", "Өдрийг сайхан өнгөрүүлээрэй!", "Hab einen wunderschönen Tag!")
]

with open('data/en/vocab_a1.json', 'r', encoding='utf-8') as f:
    en_a1 = json.load(f)

start_idx = len(en_a1) + 1
for w, pos, forms, rek, pf, rb, mn_t, de_t, ex_en, ex_mn, ex_de in extra_en_a1:
    en_a1.append({
        "id": f"en_a1_{str(start_idx).zfill(4)}",
        "word": nfc(w),
        "pos": pos,
        "lang": "en",
        "level": "A1",
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
    start_idx += 1

with open('data/en/vocab_a1.json', 'w', encoding='utf-8') as f:
    json.dump(en_a1, f, ensure_ascii=False, indent=2)
print("Updated data/en/vocab_a1.json total:", len(en_a1))

# Expand English A2
extra_en_a2 = [
    ("agree with", "verb", "agree | agreed | agreed", "agree with", "agree _____ [prep]", "agree with", "санал нийлэх", "zustimmen", "I completely agree with your proposal.", "Би таны саналтай бүрэн нийцэж байна.", "Ich stimme deinem Vorschlag vollkommen zu."),
    ("belong to", "verb", "belong | belonged | belonged", "belong to", "belong _____ [prep]", "belong to", "харьяалагдах", "gehören zu", "This book belongs to Sarah.", "Энэ ном Сарагийнх.", "Dieses Buch gehört Sarah."),
    ("depend on", "verb", "depend | depended | depended", "depend on", "depend _____ [prep]", "depend on", "хамаарах", "abhängen von", "It depends on the weather.", "Энэ нь цаг агаараас хамаарна.", "Es hängt vom Wetter ab."),
    ("look at", "verb", "look | looked | looked", "look at", "look _____ [prep]", "look at", "харах", "anschauen", "Look at this picture.", "Энэ зургийг хараач.", "Schau dir dieses Bild an."),
    ("pay for", "verb", "pay | paid | paid", "pay for", "pay _____ [prep]", "pay for", "төлөх", "bezahlen für", "I will pay for dinner tonight.", "Өнөө орой оройн хоолны төлбөрийг би төлнө.", "Ich bezahle heute Abend für das Abendessen."),
    ("worry about", "verb", "worry | worried | worried", "worry about", "worry _____ [prep]", "worry about", "санаа зовох", "sich sorgen um", "Do not worry about small mistakes.", "Жижиг алдаанд бүү санаа зов.", "Mach dir keine Sorgen wegen kleiner Fehler."),
    ("proud of", "adjective", None, "proud of", "proud _____ [prep]", "proud of", "бахархдаг", "stolz auf", "She is proud of her son's achievements.", "Тэр хүүгийнхээ ололт амжилтаар бахархдаг.", "Sie ist stolz auf die Leistungen ihres Sohnes."),
    ("famous for", "adjective", None, "famous for", "famous _____ [prep]", "famous for", "алдартай", "berühmt für", "Paris is famous for the Eiffel Tower.", "Парис бол Эйфелийн цамхгаараа алдартай.", "Paris ist berühmt für den Eiffelturm."),
    ("different from", "adjective", None, "different from", "different _____ [prep]", "different from", "өөр, ялгаатай", "verschieden von", "City life is very different from country life.", "Хотын амьдрал хөдөөнийхөөс их өөр.", "Das Stadtleben unterscheidet sich stark vom Landleben."),
    ("ready for", "adjective", None, "ready for", "ready _____ [prep]", "ready for", "бэлэн", "bereit für", "Are you ready for the journey?", "Та аялалд бэлэн үү?", "Bist du bereit für die Reise?")
]

with open('data/en/vocab_a2.json', 'r', encoding='utf-8') as f:
    en_a2 = json.load(f)

start_idx = len(en_a2) + 1
for w, pos, forms, rek, pf, rb, mn_t, de_t, ex_en, ex_mn, ex_de in extra_en_a2:
    en_a2.append({
        "id": f"en_a2_{str(start_idx).zfill(4)}",
        "word": nfc(w),
        "pos": pos,
        "lang": "en",
        "level": "A2",
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
        "topic": "Prepositions & Phrasals"
    })
    start_idx += 1

with open('data/en/vocab_a2.json', 'w', encoding='utf-8') as f:
    json.dump(en_a2, f, ensure_ascii=False, indent=2)
print("Updated data/en/vocab_a2.json total:", len(en_a2))

# Expand English B1
extra_en_b1 = [
    ("take part in", "phrase", None, "in", "take part _____ [prep]", "take part in", "оролцох", "teilnehmen an", "Over a hundred students took part in the contest.", "Зуу гаруй оюутан уралдаанд оролцсон.", "Über hundert Studenten nahmen am Wettbewerb teil."),
    ("keep up with", "verb", "keep | kept | kept", "keep up with", "keep up _____ [prep]", "keep up with", "гүйцэх, хөл нийлүүлэх", "mithalten mit", "It is hard to keep up with rapid technology changes.", "Технологийн хурдан өөрчлөлттэй хөл нийлүүлэх хэцүү.", "Es ist schwer, mit dem schnellen Technologiewandel Schritt zu halten."),
    ("look up to", "verb", "look | looked | looked", "look up to", "look up _____ (admire)", "look up to", "хүндэтгэх, бишрэх", "aufblicken zu", "Young athletes look up to Olympic champions.", "Залуу тамирчид олимпын аварга нараа биширдэг.", "Junge Sportler blicken zu den Olympiasiegern auf."),
    ("get along with", "verb", "get | got | got", "get along with", "get along _____ [prep]", "get along with", "эвтэй байх, ойлголцох", "auskommen mit", "She gets along well with all her colleagues.", "Тэр бүх хамтран ажиллагсадтайгаа сайн ойлголцдог.", "Sie versteht sich gut mit all ihren Kollegen."),
    ("call off", "verb", "call | called | called", "call off", "call _____ (cancel)", "call off", "цуцлах", "absagen", "The match was called off due to heavy rain.", "Хүчтэй борооны улмаас тоглолтыг цуцалсан.", "Das Spiel wurde wegen starken Regens abgesagt."),
    ("break down", "verb", "break | broke | broken", "break down", "break _____ (stop functioning)", "break down", "эвдрэх", "zusammenbrechen / Panne haben", "Our car broke down in the middle of nowhere.", "Манай машин эзгүй хээр эвдэрчихсэн.", "Unser Auto hatte mitten im Nirgendwo eine Panne."),
    ("bring up", "verb", "bring | brought | brought", "bring up", "bring _____ (mention/raise)", "bring up", "дурдах, өсгөх", "erwähnen / aufziehen", "She brought up an interesting question at the meeting.", "Тэр хурлын үеэр сонирхолтой асуудал хөндсөн.", "Sie brachte im Meeting eine interessante Frage zur Sprache."),
    ("find out", "verb", "find | found | found", "find out", "find _____ (discover)", "find out", "олж мэдэх", "herausfinden", "We need to find out the truth.", "Бид үнэнийг олж мэдэх хэрэгтэй.", "Wir müssen die Wahrheit herausfinden."),
    ("capable of", "adjective", None, "of", "capable _____ [prep]", "capable of (+ -ing)", "чадвартай", "fähig zu", "He is capable of managing complex projects.", "Тэр төвөгтэй төслүүдийг удирдах чадвартай.", "Er ist in der Lage, komplexe Projekte zu leiten."),
    ("keen on", "adjective", None, "on", "keen _____ [prep]", "keen on (+ -ing)", "дуртай, шимтсэн", "begeistert von", "She is keen on learning foreign languages.", "Тэр гадаад хэл сурах их дуртай.", "Sie lernt sehr gerne Fremdsprachen.")
]

with open('data/en/vocab_b1.json', 'r', encoding='utf-8') as f:
    en_b1 = json.load(f)

start_idx = len(en_b1) + 1
for w, pos, forms, rek, pf, rb, mn_t, de_t, ex_en, ex_mn, ex_de in extra_en_b1:
    en_b1.append({
        "id": f"en_b1_{str(start_idx).zfill(4)}",
        "word": nfc(w),
        "pos": pos,
        "lang": "en",
        "level": "B1",
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
        "topic": "Collocations & Phrasals"
    })
    start_idx += 1

with open('data/en/vocab_b1.json', 'w', encoding='utf-8') as f:
    json.dump(en_b1, f, ensure_ascii=False, indent=2)
print("Updated data/en/vocab_b1.json total:", len(en_b1))

# Expand English B2
extra_en_b2 = [
    ("stem from", "verb", "stem | stemmed | stemmed", "stem from", "stem _____ [prep]", "stem from", "үүсэлтэй байх", "herrühren von", "His confidence stems from years of rigorous training.", "Түүний өөртөө итгэх итгэл олон жилийн хатуу бэлтгэлээс үүдэлтэй.", "Sein Selbstvertrauen rührt von jahrelangem hartem Training her."),
    ("attribute to", "verb", "attribute | attributed | attributed", "attribute to", "attribute _____ [prep]", "attribute to", "хамаатуулах, холбох", "zuschreiben", "Experts attribute the economic growth to technological innovation.", "Мэргэжилтнүүд эдийн засгийн өсөлтийг технологийн шинэчлэлтэй холбон тайлбарлаж байна.", "Experten schreiben das Wirtschaftswachstum technologischer Innovation zu."),
    ("comply with", "verb", "comply | complied | complied", "comply with", "comply _____ [prep]", "comply with", "дагаж мөрдөх", "einhalten / übereinstimmen mit", "All staff members must comply with data protection regulations.", "Бүх ажилтнууд мэдээлэл хамгаалах дүрмийг дагаж мөрдөх ёстой.", "Alle Mitarbeiter müssen die Datenschutzbestimmungen einhalten."),
    ("embark on", "verb", "embark | embarked | embarked", "embark on", "embark _____ [prep]", "embark on", "эхлүүлэх, замналаа эхлэх", "sich einlassen auf / beginnen", "The organization embarked on an ambitious expansion strategy.", "Байгууллага томоохон өргөжих стратегиа эхлүүлэв.", "Die Organisation begann eine ehrgeizige Expansionsstrategie."),
    ("hinge on", "verb", "hinge | hinged | hinged", "hinge on", "hinge _____ [prep]", "hinge on", "шалтгаалах, түшиглэх", "abhängen von / basieren auf", "The outcome of the talks hinges on mutual compromise.", "Яриа хэлэлцээрийн үр дүн харилцан буулт хийхээс шалтгаална.", "Das Verhandlungsergebnis hängt von gegenseitigen Kompromissen ab."),
    ("refrain from", "verb", "refrain | refrained | refrained", "refrain from", "refrain _____ (+ -ing)", "refrain from", "тэвчих, татгалзах", "absehen von / unterlassen", "Please refrain from smoking in public premises.", "Олон нийтийн газарт тамхи татахгүй байхыг хүсье.", "Bitte sehen Sie vom Rauchen in öffentlichen Räumen ab."),
    ("eligible for", "adjective", None, "for", "eligible _____ [prep]", "eligible for", "болзол хангасан", "berechtigt zu", "Graduates are eligible for international exchange programs.", "Төгсөгчид олон улсын солилцооны хөтөлбөрт хамрагдах болзол хангасан.", "Absolventen sind für internationale Austauschprogramme berechtigt."),
    ("prone to", "adjective", None, "to", "prone _____ [prep]", "prone to (+ -ing/noun)", "өртөмтгий, хандлагатай", "anfällig für", "The region is notoriously prone to seasonal earthquakes.", "Энэ бүс нутаг улирлын газар хөдлөлтөд их өртөмтгий.", "Die Region ist notorisch anfällig für saisonale Erdbeben."),
    ("susceptible to", "adjective", None, "to", "susceptible _____ [prep]", "susceptible to", "мэдрэмтгий, эмзэг", "empfänglich für", "Children are often susceptible to viral infections in winter.", "Өвлийн улиралд хүүхдүүд вируст халдварт илүү эмзэг байдаг.", "Kinder sind im Winter oft empfänglich für Virusinfektionen."),
    ("conducive to", "adjective", None, "to", "conducive _____ [prep]", "conducive to", "нөлөөлөх, нөхцөл бүрдүүлэх", "förderlich für", "A calm quiet environment is conducive to deep study.", "Тайван чимээгүй орчин нь гүнзгий суралцахад таатай нөлөө үзүүлдэг.", "Eine ruhige Umgebung ist dem vertieften Lernen förderlich.")
]

with open('data/en/vocab_b2.json', 'r', encoding='utf-8') as f:
    en_b2 = json.load(f)

start_idx = len(en_b2) + 1
for w, pos, forms, rek, pf, rb, mn_t, de_t, ex_en, ex_mn, ex_de in extra_en_b2:
    en_b2.append({
        "id": f"en_b2_{str(start_idx).zfill(4)}",
        "word": nfc(w),
        "pos": pos,
        "lang": "en",
        "level": "B2",
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
        "topic": "Academic & Professional English"
    })
    start_idx += 1

with open('data/en/vocab_b2.json', 'w', encoding='utf-8') as f:
    json.dump(en_b2, f, ensure_ascii=False, indent=2)
print("Updated data/en/vocab_b2.json total:", len(en_b2))
