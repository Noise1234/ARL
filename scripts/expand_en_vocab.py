#!/usr/bin/env python3
"""
English Vocabulary Expansion Script for ARL
Adds high-yield everyday and academic English vocabulary with Mongolian translations,
German equivalents, contextual cloze prompts, and full example sentences.
"""

import json
import unicodedata
import os

ROOT = '/root/ARL'

def nfc(text):
    if text is None:
        return None
    return unicodedata.normalize('NFC', str(text).strip())

def clean_entry(entry):
    return {k: nfc(v) if isinstance(v, str) else v for k, v in entry.items()}

def load_json(rel_path):
    p = os.path.join(ROOT, rel_path)
    with open(p, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(rel_path, data):
    p = os.path.join(ROOT, rel_path)
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {rel_path} with {len(data)} items.")

en_a1_more = [
    # Nouns & Basic Verbs
    ("time", "noun", "time", "цаг хугацаа", "die Zeit", None, "What _____ is it? [noun]", "What time is it now?", "Одоо цаг хэд болж байна?", "Wie spät ist es jetzt?", "Time"),
    ("year", "noun", "year | years", "жил", "das Jahr, -e", None, "A _____ has 365 days. [noun]", "A year has 365 days.", "Нэг жил 365 хоногтой байдаг.", "Ein Jahr hat 365 Tage.", "Time"),
    ("people", "noun", "people", "хүмүүс", "die Leute, Menschen", None, "Many _____ live here. [noun]", "Many people live in this city.", "Энэ хотод олон хүн амьдардаг.", "Viele Menschen leben in dieser Stadt.", "Society"),
    ("way", "noun", "way | ways", "зам, арга", "der Weg, -e", None, "Is this the right _____? [noun]", "Can you show me the way?", "Та надад зам зааж өгөхгүй юу?", "Kannst du mir den Weg zeigen?", "Travel"),
    ("day", "noun", "day | days", "өдөр", "der Tag, -e", None, "Have a nice _____! [noun]", "Have a nice day!", "Өдрийг сайхан өнгөрүүлээрэй!", "Schönen Tag noch!", "Daily Life"),
    ("man", "noun", "man | men", "эрэгтэй хүн", "der Mann, -¨er", None, "The _____ works hard. [noun]", "The man is very kind.", "Тэр эрэгтэй маш эелдэг.", "Der Mann ist sehr freundlich.", "People"),
    ("woman", "noun", "woman | women", "эмэгтэй хүн", "die Frau, -en", None, "A wise _____ [noun]", "The woman is a doctor.", "Тэр эмэгтэй бол эмч.", "Die Frau ist Ärztin.", "People"),
    ("child", "noun", "child | children", "хүүхэд", "das Kind, -er", None, "The _____ plays outside. [noun]", "The child is laughing happily.", "Хүүхэд баяртайгаар инээж байна.", "Das Kind lacht fröhlich.", "Family"),
    ("world", "noun", "world", "дэлхий ертөнц", "die Welt, -en", None, "Around the _____ [noun]", "We want to see the world.", "Бид дэлхийг үзэхийг хүсэж байна.", "Wir möchten die Welt sehen.", "Nature"),
    ("school", "noun", "school | schools", "сургууль", "die Schule, -n", None, "Go to _____ [noun]", "The children walk to school.", "Хүүхдүүд сургууль руугаа алхаж байна.", "Die Kinder gehen zu Fuß zur Schule.", "Education"),
    ("state", "noun", "state | states", "улс, муж", "der Staat, -en", None, "In our _____ [noun]", "He lives in another state.", "Тэр өөр мужид амьдардаг.", "Er lebt in einem anderen Bundesstaat.", "Society"),
    ("family", "noun", "family | families", "гэр бүл", "die Familie, -n", None, "My _____ is big. [noun]", "Family is very important to me.", "Гэр бүл миний хувьд маш чухал.", "Familie ist mir sehr wichtig.", "Family"),
    ("student", "noun", "student | students", "оюутан, сурагч", "der Student, -en", None, "A diligent _____ [noun]", "She is a university student.", "Тэр их сургуулийн оюутан.", "Sie ist Universitätsstudentin.", "Education"),
    ("group", "noun", "group | groups", "бүлэг", "die Gruppe, -n", None, "A study _____ [noun]", "We work together in a small group.", "Бид жижиг бүлгээр хамтран ажилладаг.", "Wir arbeiten in einer kleinen Gruppe zusammen.", "Work"),
    ("country", "noun", "country | countries", "улс орон, хөдөө", "das Land, -¨er", None, "A beautiful _____ [noun]", "Which country are you from?", "Та аль улсынх вэ?", "Aus welchem Land kommen Sie?", "Geography"),
    ("problem", "noun", "problem | problems", "асуудал", "das Problem, -e", None, "Solve a _____ [noun]", "No problem at all!", "Ямар ч асуудалгүй!", "Überhaupt kein Problem!", "Daily Life"),
    ("hand", "noun", "hand | hands", "гар", "die Hand, -¨e", None, "Wash your _____ [noun]", "Hold my hand, please.", "Миний гараас бариарай.", "Halte bitte meine Hand.", "Body"),
    ("place", "noun", "place | places", "газар, байрлал", "der Ort, -e", None, "A quiet _____ [noun]", "This is a quiet place to read.", "Энэ бол ном уншихад тохиромжтой нам гүм газар.", "Dies ist ein ruhiger Ort zum Lesen.", "Locations"),
    ("week", "noun", "week | weeks", "долоо хоног", "die Woche, -n", None, "Next _____ [noun]", "See you next week!", "Дараагийн долоо хоногт уулзацгаая!", "Bis nächste Woche!", "Time"),
    ("room", "noun", "room | rooms", "өрөө", "das Zimmer, -", None, "A bright _____ [noun]", "My room has a large window.", "Миний өрөө том цонхтой.", "Mein Zimmer hat ein großes Fenster.", "Home"),
    ("money", "noun", "money", "мөнгө", "das Geld", None, "Save _____ [noun]", "Save money for travel.", "Аялалд зориулж мөнгө хадгалах.", "Geld für Reisen sparen.", "Finances"),
    ("story", "noun", "story | stories", "түүх, үлгэр", "die Geschichte, -n", None, "Tell a _____ [noun]", "Tell me an interesting story.", "Надад сонирхолтой түүх ярьж өгөөч.", "Erzähl mir eine interessante Geschichte.", "Leisure"),
    ("night", "noun", "night | nights", "шөнө", "die Nacht, -¨e", None, "Good _____! [noun]", "Good night and sleep well!", "Сайхан амраарай, тухтай унтаарай!", "Gute Nacht und schlaf gut!", "Time"),
    ("water", "noun", "water", "ус", "das Wasser", None, "Drink fresh _____ [noun]", "Please bring a glass of water.", "Нэг аяга ус авчраач.", "Bitte bring ein Glas Wasser.", "Food & Drink"),
    ("food", "noun", "food", "хоол хүнс", "das Essen", None, "Delicious _____ [noun]", "The food here is delicious.", "Эндхийн хоол маш амттай байна.", "Das Essen hier ist köstlich.", "Food & Drink"),
    ("house", "noun", "house | houses", "байшин", "das Haus, -¨er", None, "A cozy _____ [noun]", "They bought a small house.", "Тэд жижиг байшин худалдаж авсан.", "Sie haben ein kleines Haus gekauft.", "Home"),
    ("book", "noun", "book | books", "ном", "das Buch, -¨er", None, "Read a _____ [noun]", "I enjoy reading books.", "Би ном унших дуртай.", "Ich lese gerne Bücher.", "Leisure"),
    ("friend", "noun", "friend | friends", "найз нөхөр", "der Freund, -e", None, "A good _____ [noun]", "A friend in need is a friend indeed.", "Зовох цагт нөхрийн чанар танигдана.", "Ein wahrer Freund zeigt sich in der Not.", "Social")
]

en_a2_more = [
    ("experience", "noun", "experience | experiences", "туршлага", "die Erfahrung, -en", None, "Valuable _____ [noun]", "Working abroad is a great experience.", "Гадаадад ажиллах нь гайхалтай туршлага юм.", "Im Ausland zu arbeiten ist eine großartige Erfahrung.", "Career"),
    ("opportunity", "noun", "opportunity | opportunities", "боломж", "die Gelegenheit, die Chance", None, "A golden _____ [noun]", "Take every opportunity to learn.", "Суралцах бүх боломжийг ашиглаарай.", "Nutze jede Gelegenheit zum Lernen.", "Growth"),
    ("decision", "noun", "decision | decisions", "шийдвэр", "die Entscheidung, -en", None, "Make a _____ [noun]", "It was a tough decision to make.", "Энэ бол гаргахад хэцүү шийдвэр байсан.", "Es war eine schwere Entscheidung.", "Life"),
    ("relationship", "noun", "relationship | relationships", "харилцаа", "die Beziehung, -en", None, "A healthy _____ [noun]", "Trust is essential in any relationship.", "Итгэлцэл бол аливаа харилцаанд зайлшгүй чухал зүйл юм.", "Vertrauen ist wesentlich in jeder Beziehung.", "Social"),
    ("environment", "noun", "environment", "байгаль орчин", "die Umwelt", None, "Protect the _____ [noun]", "We must protect our natural environment.", "Бид байгаль орчноо хамгаалах ёстой.", "Wir müssen unsere Umwelt schützen.", "Nature"),
    ("situation", "noun", "situation | situations", "нөхцөл байдал", "die Situation, -en", None, "A difficult _____ [noun]", "Stay calm in any difficult situation.", "Ямар ч хүнд нөхцөлд тайван байгаарай.", "Bleib in jeder schwierigen Situation ruhig.", "Daily Life"),
    ("success", "noun", "success", "амжилт", "der Erfolg, -e", None, "Achieve _____ [noun]", "Hard work leads to success.", "Хичээл зүтгэл амжилтад хүргэдэг.", "Harte Arbeit führt zum Erfolg.", "Achievement"),
    ("knowledge", "noun", "knowledge", "мэдлэг", "das Wissen", None, "Broad _____ [noun]", "Knowledge is power.", "Мэдлэг бол хүч чадал.", "Wissen ist Macht.", "Education"),
    ("health", "noun", "health", "эрүүл мэнд", "die Gesundheit", None, "Good _____ [noun]", "Health is the greatest wealth.", "Эрүүл мэнд бол хамгийн эрхэм баялаг.", "Gesundheit ist der größte Reichtum.", "Health"),
    ("future", "noun", "future", "ирээдүй", "die Zukunft", None, "Plan for the _____ [noun]", "We are optimistic about the future.", "Бид ирээдүйд өөдрөг байна.", "Wir blicken optimistisch in die Zukunft.", "Time"),
    ("advice", "noun", "advice", "зөвлөгөө", "der Rat, Ratschlag", None, "Give good _____ [noun]", "Thank you for your valuable advice.", "Үнэтэй зөвлөгөө өгсөнд баярлалаа.", "Danke für deinen wertvollen Ratschlag.", "Communication"),
    ("traffic", "noun", "traffic", "замын хөдөлгөөн", "der Verkehr", None, "Heavy _____ [noun]", "There was heavy traffic this morning.", "Өнөө өглөө замын хөдөлгөөн их түгжрэлтэй байсан.", "Heute Morgen gab es dichten Verkehr.", "Travel"),
    ("weather", "noun", "weather", "цаг агаар", "das Wetter", None, "Sunny _____ [noun]", "The weather forecast predicts sunshine.", "Цаг агаарын урьдчилсан мэдээгээр нар гарна гэж байна.", "Der Wetterbericht sagt Sonnenschein voraus.", "Nature"),
    ("schedule", "noun", "schedule | schedules", "хуваарь", "der Zeitplan, Fahrplan", None, "Check the _____ [noun]", "My schedule is completely full today.", "Өнөөдөр миний хуваарь бүрэн дүүрэн байна.", "Mein Zeitplan ist heute voll.", "Work"),
    ("conversation", "noun", "conversation | conversations", "яриа, хөөрөлдөөн", "das Gespräch, -e", None, "Have a _____ [noun]", "We had an inspiring conversation.", "Бид урам зориг өгсөн яриа өрнүүлсэн.", "Wir hatten ein inspirierendes Gespräch.", "Social")
]

en_b1_more = [
    ("concentrate on", "verb", "concentrate | concentrated | concentrated", "анхаарлаа төвлөрүүлэх", "sich konzentrieren auf", "on", "concentrate _____ [prep]", "Concentrate on one task at a time.", "Нэг удаад нэг даалгаварт анхаарлаа төвлөрүүл.", "Konzentriere dich auf eine Aufgabe gleichzeitig.", "Productivity"),
    ("rely on", "verb", "rely | relied | relied", "найдах, түшиглэх", "sich verlassen auf", "on", "rely _____ [prep]", "A true friend is someone you can rely on.", "Жинхэнэ найз бол чиний найдаж болох хүн юм.", "Ein wahrer Freund ist jemand, auf den man sich verlassen kann.", "Relationships"),
    ("participate in", "verb", "participate | participated | participated", "оролцох", "teilnehmen an", "in", "participate _____ [prep]", "Do you want to participate in the seminar?", "Та семинарт оролцохыг хүсэж байна уу?", "Möchtest du am Seminar teilnehmen?", "Work"),
    ("deal with", "verb", "deal | dealt | dealt", "зохицуулах, харьцах", "umgehen mit", "with", "deal _____ [prep]", "He knows how to deal with customer complaints.", "Тэр хэрэглэгчийн гомдлыг хэрхэн зохицуулахаа мэддэг.", "Er weiß, wie man mit Kundenbeschwerden umgeht.", "Customer Service"),
    ("look forward to", "verb", "look | looked | looked", "тэсэн ядан хүлээх", "sich freuen auf", "to", "look forward _____ [prep]", "I look forward to meeting you soon.", "Тантай удахгүй уулзахыг тэсэн ядан хүлээж байна.", "Ich freue mich darauf, Sie bald zu treffen.", "Communication"),
    ("get used to", "verb", "get | got | got", "дасах", "sich gewöhnen an", "to", "get used _____ [prep]", "You will quickly get used to the new routine.", "Та шинэ дэглэмд хурдан дасна.", "Du wirst dich schnell an die neue Routine gewöhnen.", "Habits"),
    ("run out of", "verb", "run | ran | run", "дуусах, дутагдах", "ausgehen (etw. nicht mehr haben)", "of", "run out _____ [prep]", "We ran out of printer ink.", "Принтерийн хор дуусчихлаа.", "Uns ist die Druckertinte ausgegangen.", "Office"),
    ("bring up", "verb", "bring | brought | brought", "хөндөх, өсгөх", "ansprechen, großziehen", None, "bring _____ [topic]", "Don't bring up sensitive topics during lunch.", "Үдийн хоолны үеэр эмзэг сэдэв бүү хөнд.", "Schneide beim Mittagessen keine heiklen Themen an.", "Conversation"),
    ("figure out", "verb", "figure | figured | figured", "ухаж ойлгох, шийдэл олох", "herausfinden, begreifen", None, "figure _____ [solution]", "We must figure out a sustainable solution.", "Бид тогтвортой шийдлийг олж илрүүлэх ёстой.", "Wir müssen eine nachhaltige Lösung herausfinden.", "Problem Solving"),
    ("give up", "verb", "give | gave | given", "бууж өгөх, орхих", "aufgeben", None, "give _____ [action]", "Never give up on your dreams.", "Мөрөөдлөөсөө хэзээ ч бүү бууж өг.", "Gib deine Träume niemals auf.", "Mindset"),
    ("turn down", "verb", "turn | turned | turned", "татгалзах, суллах", "ablehnen, leiser drehen", None, "turn _____ [offer]", "She decided to turn down the job offer.", "Тэр ажлын саналаас татгалзахаар шийдсэн.", "Sie beschloss, das Stellenangebot abzulehnen.", "Career"),
    ("carry out", "verb", "carry | carried | carried", "хэрэгжүүлэх, гүйцэтгэх", "durchführen, ausführen", None, "carry _____ [plan]", "The research team carried out several surveys.", "Судалгааны баг хэд хэдэн судалгаа гүйцэтгэсэн.", "Das Forschungsteam führte mehrere Umfragen durch.", "Science")
]

en_b2_more = [
    ("coincide with", "verb", "coincide | coincided | coincided", "давхцах", "zusammenfallen mit", "with", "coincide _____ [prep]", "The release coincides with our company anniversary.", "Бүтээгдэхүүний нээлт компанийн ойтой давхцаж байна.", "Die Veröffentlichung fällt mit unserem Firmenjubiläum zusammen.", "Events"),
    ("interfere with", "verb", "interfere | interfered | interfered", "саад болох, хөндлөнгөөс оролцох", "stören, beeinträchtigen", "with", "interfere _____ [prep]", "Constant notifications interfere with deep focus.", "Байнгын мэдэгдлүүд гүн төвлөрөлд саад болдог.", "Ständige Benachrichtigungen beeinträchtigen tiefe Konzentration.", "Focus"),
    ("resort to", "verb", "resort | resorted | resorted", "арга мухардан хэрэглэх", "zurückgreifen auf", "to", "resort _____ [prep]", "We should not resort to desperate measures.", "Бид мухар арга хэрэглэх ёсгүй.", "Wir sollten nicht zu verzweifelten Maßnahmen greifen.", "Strategy"),
    ("abide by", "verb", "abide | abided | abided", "дагаж мөрдөх", "sich halten an", "by", "abide _____ [prep]", "All members must abide by the constitution.", "Бүх гишүүд дүрмийг чанд дагаж мөрдөх ёстой.", "Alle Mitglieder müssen sich an die Satzung halten.", "Law"),
    ("account for", "verb", "account | accounted | accounted", "эзлэх, тайлбарлах", "ausmachen, erklären", "for", "account _____ [prep]", "Renewables account for forty percent of energy production.", "Сэргээгдэх эрчим хүч нийт үйлдвэрлэлийн 40 хувийг эзэлж байна.", "Erneuerbare Energien machen vierzig Prozent der Energieproduktion aus.", "Statistics"),
    ("reconcile with", "verb", "reconcile | reconciled | reconciled", "эвлэрүүлэх, нийцүүлэх", "in Einklang bringen mit", "with", "reconcile _____ [prep]", "It is difficult to reconcile profit with environmental ethics.", "Ашгийг байгаль орчны ёс зүйтэй нийцүүлэх нь хэцүү байдаг.", "Es ist schwierig, Profit mit Umweltethik in Einklang zu bringen.", "Ethics"),
    ("substantiate", "verb", "substantiate | substantiated | substantiated", "нотолж баримтжуулах", "untermauern, belegen", None, "substantiate _____ [claim]", "You must substantiate your arguments with verified empirical data.", "Та өөрийн нотолгоог баталгаажсан бодит баримтаар дэмжих ёстой.", "Du musst deine Argumente mit verifizierten empirischen Daten untermauern.", "Academic"),
    ("disregard", "verb", "disregard | disregarded | disregarded", "үл тоомсорлох", "außer Acht lassen, ignorieren", None, "disregard _____ [rule]", "Never disregard security protocols.", "Аюулгүй байдлын протоколыг хэзээ ч бүү үл тоомсорло.", "Lass Sicherheitsprotokolle niemals außer Acht.", "Compliance")
]

def run():
    # 1. EN A1
    en_a1 = load_json('data/en/vocab_a1.json')
    seen_en_a1 = set(x['word'].strip().lower() for x in en_a1)
    idx = len(en_a1) + 1
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_a1_more:
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

    # 2. EN A2
    en_a2 = load_json('data/en/vocab_a2.json')
    seen_en_a2 = set(x['word'].strip().lower() for x in en_a2)
    idx = len(en_a2) + 1
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_a2_more:
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

    # 3. EN B1
    en_b1 = load_json('data/en/vocab_b1.json')
    seen_en_b1 = set(x['word'].strip().lower() for x in en_b1)
    idx = len(en_b1) + 1
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_b1_more:
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
                "revealed_back": f"{w} ({rek})" if rek else forms,
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

    # 4. EN B2
    en_b2 = load_json('data/en/vocab_b2.json')
    seen_en_b2 = set(x['word'].strip().lower() for x in en_b2)
    idx = len(en_b2) + 1
    for w, pos, forms, mn_t, de_t, rek, prompt, ex_en, ex_mn, ex_de, topic in en_b2_more:
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
                "revealed_back": f"{w} ({rek})" if rek else forms,
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
    run()
