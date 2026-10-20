import json
import unicodedata

def nfc(s):
    if isinstance(s, str):
        return unicodedata.normalize('NFC', s.strip())
    if isinstance(s, dict):
        return {k: nfc(v) for k, v in s.items()}
    if isinstance(s, list):
        return [nfc(x) for x in s]
    return s

de_redemittel = {
    "sections": [
        {
            "id": "einleitung",
            "name": "Einleitung (Opening / Presentation Intro)",
            "description": "Formeln zur thematischen Einführung und Strukturierung einer Präsentation oder Diskussion.",
            "items": [
                {
                    "formula": "Das Thema meiner Präsentation lautet...",
                    "mn": "Миний илтгэлийн сэдэв бол...",
                    "en": "The topic of my presentation is...",
                    "de": "Das Thema meiner Präsentation lautet...",
                    "example": "Das Thema meiner heutigen Präsentation lautet 'Nachhaltigkeit im Alltag'."
                },
                {
                    "formula": "Ich möchte heute über folgendes Thema sprechen: ...",
                    "mn": "Би өнөөдөр дараах сэдвийн хүрээнд ярихыг хүсэж байна: ...",
                    "en": "Today I would like to talk about the following topic: ...",
                    "de": "Ich möchte heute über folgendes Thema sprechen: ...",
                    "example": "Ich möchte heute über folgendes Thema sprechen: Chancen der Digitalisierung."
                },
                {
                    "formula": "Mein Vortrag gliedert sich in folgende Teile: Zuerst..., danach..., schließlich...",
                    "mn": "Миний илтгэл дараах хэсгүүдээс бүрдэнэ: Нэгдүгээрт..., дараа нь..., төгсгөлд нь...",
                    "en": "My presentation is structured as follows: First..., then..., finally...",
                    "de": "Mein Vortrag gliedert sich in folgende Teile: ...",
                    "example": "Mein Vortrag gliedert sich in drei Teile: Zuerst nenne ich die Fakten, danach die Vor- und Nachteile."
                }
            ]
        },
        {
            "id": "meinung",
            "name": "Meinung äußern (Expressing Opinion)",
            "description": "Formeln zum präzisen und differenzierten Darlegen des eigenen Standpunkts.",
            "items": [
                {
                    "formula": "Meiner Ansicht / Auffassung nach...",
                    "mn": "Миний бодлоор / үзэж байгаагаар...",
                    "en": "In my view / opinion...",
                    "de": "Meiner Ansicht / Auffassung nach...",
                    "example": "Meiner Ansicht nach sollte der öffentliche Nahverkehr kostenlos sein."
                },
                {
                    "formula": "Ich bin der festen Überzeugung, dass...",
                    "mn": "Би ... гэдэгт бат итгэлтэй байна.",
                    "en": "I am firmly convinced that...",
                    "de": "Ich bin der festen Überzeugung, dass...",
                    "example": "Ich bin der festen Überzeugung, dass Sprachkenntnisse Türen öffnen."
                },
                {
                    "formula": "Aus meiner persönlichen Perspektive lässt sich sagen, dass...",
                    "mn": "Миний хувийн байр сууринаас харвал ... гэж хэлж болно.",
                    "en": "From my personal perspective, one can say that...",
                    "de": "Aus meiner persönlichen Perspektive lässt sich sagen, dass...",
                    "example": "Aus meiner persönlichen Perspektive lässt sich sagen, dass Disziplin der Schlüssel ist."
                }
            ]
        },
        {
            "id": "vor_nachteile",
            "name": "Vor- und Nachteile abwägen (Pros & Cons)",
            "description": "Formeln zum Gegenüberstellen von Argumenten.",
            "items": [
                {
                    "formula": "Ein wesentlicher Vorteil / Nachteil besteht darin, dass...",
                    "mn": "Гол давуу тал / сул тал нь ...-д оршиж байна.",
                    "en": "A significant advantage / disadvantage is that...",
                    "de": "Ein wesentlicher Vorteil / Nachteil besteht darin, dass...",
                    "example": "Ein wesentlicher Vorteil von Homeoffice besteht darin, dass man Zeit spart."
                },
                {
                    "formula": "Einerseits..., andererseits darf man nicht vergessen, dass...",
                    "mn": "Нэг талаас..., нөгөө талаас бид ...-ийг мартаж болохгүй.",
                    "en": "On the one hand..., on the other hand we must not forget that...",
                    "de": "Einerseits..., andererseits darf man nicht vergessen, dass...",
                    "example": "Einerseits bietet die Stadt viele Kulturangebote, andererseits sind die Mieten extrem hoch."
                },
                {
                    "formula": "Demgegenüber steht das Argument, dass...",
                    "mn": "Үүний эсрэг сөргүүлэн тавих нэгэн няцаалт бол...",
                    "en": "Countering this is the argument that...",
                    "de": "Demgegenüber steht das Argument, dass...",
                    "example": "Demgegenüber steht das Argument, dass die Kosten das Budget sprengen würden."
                }
            ]
        },
        {
            "id": "beispiele",
            "name": "Beispiele anführen (Giving Examples)",
            "description": "Formeln zum Untermauern von Aussagen mit konkreten Beispielen.",
            "items": [
                {
                    "formula": "Als anschauliches Beispiel hierfür lässt sich anführen, dass...",
                    "mn": "Үүний тодорхой нэгэн жишээ болгон ... дурдаж болно.",
                    "en": "A clear example to illustrate this is...",
                    "de": "Als anschauliches Beispiel hierfür lässt sich anführen, dass...",
                    "example": "Als anschauliches Beispiel lässt sich anführen, wie die Mongolei Sonnenenergie nutzt."
                },
                {
                    "formula": "Dies möchte ich durch ein konkretes Beispiel verdeutlichen: ...",
                    "mn": "Би үүнийг бодит нэгэн жишээгээр тодруулахыг хүсэж байна: ...",
                    "en": "I would like to clarify this through a concrete example: ...",
                    "de": "Dies möchte ich durch ein konkretes Beispiel verdeutlichen: ...",
                    "example": "Dies möchte ich verdeutlichen: In vielen Schulen gibt es bereits Tablets."
                }
            ]
        },
        {
            "id": "schluss",
            "name": "Schluss & Zusammenfassung (Conclusion)",
            "description": "Formeln zum prägnanten Abrunden und Fazit-Ziehen.",
            "items": [
                {
                    "formula": "Zusammenfassend lässt sich festhalten, dass...",
                    "mn": "Дүгнээд хэлэхэд ... гэдгийг онцолж болно.",
                    "en": "In summary, it can be stated that...",
                    "de": "Zusammenfassend lässt sich festhalten, dass...",
                    "example": "Zusammenfassend lässt sich festhalten, dass Bildung die wichtigste Investition bleibt."
                },
                {
                    "formula": "Abschließend möchte ich betonen, dass...",
                    "mn": "Төгсгөлд нь би ... гэдгийг онцлон тэмдэглэмээр байна.",
                    "en": "Finally, I would like to emphasize that...",
                    "de": "Abschließend möchte ich betonen, dass...",
                    "example": "Abschließend möchte ich betonen, dass Zusammenarbeit für alle Beteiligten nützlich ist."
                },
                {
                    "formula": "Ich bedanke mich herzlich für Ihre Aufmerksamkeit. Haben Sie noch Fragen?",
                    "mn": "Анхаарал тавьсанд маш их баярлалаа. Асуух асуулт байна уу?",
                    "en": "Thank you very much for your attention. Do you have any questions?",
                    "de": "Ich bedanke mich herzlich für Ihre Aufmerksamkeit. Haben Sie noch Fragen?",
                    "example": "Ich bedanke mich herzlich für Ihre Aufmerksamkeit und freue mich auf Ihre Fragen."
                }
            ]
        }
    ]
}

en_redemittel = {
    "sections": [
        {
            "id": "einleitung",
            "name": "Introduction & Topic Statement",
            "description": "Formulas to introduce and structure presentations and spoken arguments.",
            "items": [
                {
                    "formula": "Today, I would like to focus on...",
                    "mn": "Өнөөдөр би ... дээр анхаарлаа хандуулахыг хүсэж байна.",
                    "en": "Today, I would like to focus on...",
                    "de": "Heute möchte ich mich auf ... konzentrieren.",
                    "example": "Today, I would like to focus on sustainable urban development."
                },
                {
                    "formula": "The purpose of this presentation is to examine...",
                    "mn": "Энэхүү илтгэлийн зорилго нь ...-ийг судлан авч үзэх явдал юм.",
                    "en": "The purpose of this presentation is to examine...",
                    "de": "Der Zweck dieses Vortrags ist es, ... zu untersuchen.",
                    "example": "The purpose of this talk is to examine renewable energy transitions."
                }
            ]
        },
        {
            "id": "meinung",
            "name": "Expressing Opinion",
            "description": "Formulas to state and substantiate viewpoints.",
            "items": [
                {
                    "formula": "From my point of view, it is crucial that...",
                    "mn": "Миний байр сууринаас үзэхэд ... нь нэн чухал юм.",
                    "en": "From my point of view, it is crucial that...",
                    "de": "Aus meiner Sicht ist es von entscheidender Bedeutung, dass...",
                    "example": "From my point of view, it is crucial that we invest in early education."
                },
                {
                    "formula": "I am strongly inclined to believe that...",
                    "mn": "Би ... гэдэгт ихээхэн итгэх хандлагатай байна.",
                    "en": "I am strongly inclined to believe that...",
                    "de": "Ich bin stark geneigt zu glauben, dass...",
                    "example": "I am strongly inclined to believe that regular practice yields mastery."
                }
            ]
        },
        {
            "id": "vor_nachteile",
            "name": "Weighing Pros & Cons",
            "description": "Formulas to balance conflicting perspectives and advantages.",
            "items": [
                {
                    "formula": "While it is undeniably true that..., on the flip side...",
                    "mn": "... гэдэг нь маргаангүй үнэн хэдий ч, нөгөө талаас...",
                    "en": "While it is undeniably true that..., on the flip side...",
                    "de": "Während es unbestreitbar wahr ist, dass..., andererseits...",
                    "example": "While automation boosts productivity, on the flip side it creates workforce displacement."
                },
                {
                    "formula": "The main benefit lies in..., whereas the primary drawback is...",
                    "mn": "Гол ашиг тус нь ...-д орших бөгөөд гол дутагдал нь...",
                    "en": "The main benefit lies in..., whereas the primary drawback is...",
                    "de": "Der Hauptvorteil liegt in..., während der wesentliche Nachteil ... ist.",
                    "example": "The main benefit lies in speed, whereas the primary drawback is high initial cost."
                }
            ]
        },
        {
            "id": "beispiele",
            "name": "Illustrating with Examples",
            "description": "Formulas to support arguments with authentic examples.",
            "items": [
                {
                    "formula": "To illustrate this point, consider the case of...",
                    "mn": "Энэ санааг тодруулахын тулд ...-ийн жишээг авч үзье.",
                    "en": "To illustrate this point, consider the case of...",
                    "de": "Um diesen Punkt zu veranschaulichen, betrachten wir den Fall von...",
                    "example": "To illustrate this point, consider the case of Scandinavian public education."
                },
                {
                    "formula": "A notable case in point is...",
                    "mn": "Үүний тод нэгэн жишээ бол...",
                    "en": "A notable case in point is...",
                    "de": "Ein bemerkenswertes Beispiel dafür ist...",
                    "example": "A notable case in point is the rapid expansion of solar power."
                }
            ]
        },
        {
            "id": "schluss",
            "name": "Concluding & Summarizing",
            "description": "Formulas to close an argument with precision.",
            "items": [
                {
                    "formula": "Taking everything into account, we can draw the conclusion that...",
                    "mn": "Бүгдийг харгалзан үзээд бид ... гэсэн дүгнэлтэд хүрч чадна.",
                    "en": "Taking everything into account, we can draw the conclusion that...",
                    "de": "Alles in allem können wir den Schluss ziehen, dass...",
                    "example": "Taking everything into account, we can draw the conclusion that proactive planning is essential."
                },
                {
                    "formula": "Thank you for your time and consideration. I would be pleased to answer questions.",
                    "mn": "Цаг гарган анхаарсанд баярлалаа. Асуултуудад хариулахад таатай байх болно.",
                    "en": "Thank you for your time and consideration. I would be pleased to answer questions.",
                    "de": "Vielen Dank für Ihre Aufmerksamkeit. Ich beantworte gerne Ihre Fragen.",
                    "example": "Thank you for your attention. I am happy to open the floor to questions."
                }
            ]
        }
    ]
}

with open('data/de/redemittel.json', 'w', encoding='utf-8') as f:
    json.dump(nfc(de_redemittel), f, ensure_ascii=False, indent=2)

with open('data/en/redemittel.json', 'w', encoding='utf-8') as f:
    json.dump(nfc(en_redemittel), f, ensure_ascii=False, indent=2)

print("Saved data/de/redemittel.json and data/en/redemittel.json.")
