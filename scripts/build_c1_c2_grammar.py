#!/usr/bin/env python3
"""
Generate German and English C1/C2 grammar modules with structured explanations,
core concepts (MN, EN, DE), pattern formulas, common traps in Mongolian, and interactive drills.
"""

import json
import os

def get_de_c1_c2_folders():
    folder_05 = {
        "folder_id": "folder_05",
        "folder_name": "Folder 05: C1 - Fortgeschrittene Sprachkompetenz",
        "level": "C1",
        "topics": [
            {
                "id": "de_c1_nominalisierung",
                "title": "Nominalisierung & Verbalisierung (Nominalstil vs. Verbalstil)",
                "core_concept": {
                    "mn": "Эрдэм шинжилгээ, албан бичигт өгүүлбэрийг нягтаршуулахын тулд үйлийг нэр үг болгон (Nominalstil) бичдэг бол яриа болон уран зохиолд үйл үгээр дэлгэрүүлэн (Verbalstil) илэрхийлдэг.",
                    "en": "Nominalization converts verbs and dependent clauses into concise noun phrases with genitive or prepositional attributes, quintessential for academic and bureaucratic German.",
                    "de": "Die Nominalisierung verdichtet Nebensätze zu präpositionalen Nominalphrasen mit Genitivattributen. Sie prägt die gehobene Wissenschafts- und Behördensprache."
                },
                "pattern": "Weil die Preise steigen -> Wegen des Preisanstiegs | Wenn man plant -> Bei der Planung",
                "examples": [
                    {
                        "target": "Wegen des rapiden Anstiegs der Rohstoffpreise müssen die Produktionskosten gesenkt werden.",
                        "mn": "Түүхий эдийн үнэ огцом өссөнөөс үүдэн үйлдвэрлэлийн зардлыг бууруулах шаардлагатай болж байна.",
                        "en": "Due to the rapid rise in raw material prices, production costs must be reduced."
                    },
                    {
                        "target": "Nach der sorgfältigen Prüfung aller Unterlagen traf das Komitee eine Entscheidung.",
                        "mn": "Бүх бичиг баримтыг нягтлан шалгасны дараа комисс шийдвэрээ гаргав.",
                        "en": "After careful examination of all documents, the committee made a decision."
                    }
                ],
                "common_trap": "Анхаарах: Нэр үг болгохдоо холбогдох угтвар үгийг зөв сонгох ёстой (z.B. nach + Dat, bei + Dat, wegen + Gen). Мөн нэрлэсэн нэр үгийн хүйсийг алдаж болохгүй.",
                "drills": [
                    {
                        "id": "de_c1_nom_drill_1",
                        "prompt_mn": "Хэлэлцээ амжилттай дууссаны дараа гэрээнд гарын үсэг зурав.",
                        "target": "Nach dem erfolgreichen Abschluss der Verhandlungen wurde der Vertrag unterzeichnet.",
                        "literal_mn": "Дараа тэр амжилттай дуусах тэр хэлэлцээнүүдийн байв тэр гэрээ гарын үсэг зурагдсан.",
                        "natural_mn": "Хэлэлцээр амжилттай өндөрлөсний дараа гэрээнд гарын үсэг зурсан.",
                        "rule_breakdown": "Nach + Dativ бүтэцтэй нэршүүлэлт: 'nach dem erfolgreichen Abschluss der Verhandlungen' гэж Genitiv тодотголтой хэрэглэнэ.",
                        "woerterbuch": [
                            {"word": "nach", "pos": "prep", "meaning": "дараа (+ Dat)"},
                            {"word": "der Abschluss", "pos": "noun", "meaning": "дуусах, төгсгөл", "article": "der"},
                            {"word": "die Verhandlung", "pos": "noun", "meaning": "хэлэлцээ", "article": "die"},
                            {"word": "unterzeichnen", "pos": "verb", "meaning": "гарын үсэг зурах", "infinitive": "unterzeichnen"}
                        ]
                    }
                ]
            },
            {
                "id": "de_c1_partizipialattribute",
                "title": "Erweiterte Partizipialattribute (Partizip I & II)",
                "core_concept": {
                    "mn": "Хамаатуулах өгүүлбэрийг (Relativsatz) үйлт нэрийн (Partizip I/II) дэлгэрэнгүй тодотгол болгон нэр үгийн өмнө байрлуулж, өгүүлбэрийн бүтцийг өндөр түвшинд нягтаршуулдаг.",
                    "en": "Extended participial attributes place complex relative clauses directly before nouns using Participle I (active/simultaneous) or Participle II (passive/completed), tightly packaging information.",
                    "de": "Erweiterte Partizipialattribute komprimieren Relativsätze zu linksattributiven Konstruktionen vor dem Nomen mit Partizip I oder Partizip II."
                },
                "pattern": "Artikel + [Erweiterungen: Adverbien, Dativ-/Akkusativobjekte, Präpositionen] + PARTIZIP (flektiert) + Nomen",
                "examples": [
                    {
                        "target": "Die von den Wissenschaftlern gestern veröffentlichte Studie erregte großes Aufsehen.",
                        "mn": "Эрдэмтдийн өчигдөр нийтлүүлсэн судалгаа олон нийтийн анхаарлыг ихэд татав.",
                        "en": "The study published yesterday by the scientists caused a major sensation."
                    },
                    {
                        "target": "Die kontinuierlich ansteigenden Temperaturen bedrohen das alpine Ökosystem.",
                        "mn": "Тасралтгүй нэмэгдэж буй дулааны хэм альпийн экологийн системийг заналхийлж байна.",
                        "en": "The continuously rising temperatures threaten the alpine ecosystem."
                    }
                ],
                "common_trap": "Анхаарах: Partizip нь араас нь залгах нэр үгийнхээ хүйс, тийн ялгал, тоонд тохирсон тэмдэг нэрийн төгсгөл заавал авна (z.B. die veröffentlicht-e Studie).",
                "drills": [
                    {
                        "id": "de_c1_part_drill_1",
                        "prompt_mn": "Засгийн газрын төлөвлөсөн арга хэмжээнүүд маргааш хүчин төгөлдөр болно.",
                        "target": "Die von der Regierung geplanten Maßnahmen treten morgen in Kraft.",
                        "literal_mn": "Тэдгээр -аас тэр засгийн газар төлөвлөгдсөн арга хэмжээнүүд гишгэнэ маргааш дотор хүч.",
                        "natural_mn": "Засгийн газрын төлөвлөсөн арга хэмжээ маргаашнаас хэрэгжиж эхэлнэ.",
                        "rule_breakdown": "Partizip II 'geplant' нь олон тооны нэр үг 'Maßnahmen'-д тохирч сул хувирлаар '-en' төгсгөл авна: 'Die ... geplanten Maßnahmen'.",
                        "woerterbuch": [
                            {"word": "die Regierung", "pos": "noun", "meaning": "засгийн газар", "article": "die"},
                            {"word": "planen", "pos": "verb", "meaning": "төлөвлөх", "infinitive": "planen"},
                            {"word": "die Maßnahme", "pos": "noun", "meaning": "арга хэмжээ", "article": "die"},
                            {"word": "in Kraft treten", "pos": "verb", "meaning": "хүчин төгөлдөр болох"}
                        ]
                    }
                ]
            },
            {
                "id": "de_c1_funktionsverbgefuege",
                "title": "Funktionsverbgefüge (Nomen-Verb-Verbindungen)",
                "core_concept": {
                    "mn": "Энгийн үйл үгийн оронд 'Нэр үг + Угтвар үг + Туслах үйл үг' бүхий тогтвортой хэллэг ашиглаж, найруулгын өнгө аясыг албан ёсны, нарийн болгодог.",
                    "en": "Function Verb Categories (FVG) combine abstract nouns with semantically bleached verbs (e.g. ziehen, bringen, stellen), creating formal idiomatic expressions.",
                    "de": "Funktionsverbgefüge verbinden ein abstraktes Substantiv (oft mit Präposition) mit einem bedeutungsarmen Verb zur Nuancierung von Aspekt und Stil."
                },
                "pattern": "Nomen (+ Präposition) + Funktionsverb (z.B. in Betracht ziehen = berücksichtigen | zur Sprache bringen = ansprechen)",
                "examples": [
                    {
                        "target": "Wir müssen alle relevanten Aspekte sorgfältig in Betracht ziehen.",
                        "mn": "Бид холбогдох бүх талуудыг нухацтай харгалзан үзэх ёстой.",
                        "en": "We must carefully take all relevant aspects into consideration."
                    },
                    {
                        "target": "Der Ausschuss hat das heikle Thema endlich zur Sprache gebracht.",
                        "mn": "Тус хороо эцэст нь энэхүү эмзэг сэдвийг хөндөж ярив.",
                        "en": "The committee finally brought the delicate topic up for discussion."
                    }
                ],
                "common_trap": "Анхаарах: Нэр үгтэй хорших угтвар үг ба үйл үг тогтмол байдаг. Жишээ нь: 'in Frage stellen' (биш: 'zur Frage stellen').",
                "drills": [
                    {
                        "id": "de_c1_fvg_drill_1",
                        "prompt_mn": "Тэрээр захирлын гаргасан шийдвэрийг ил тод эргэлзээнд оруулав.",
                        "target": "Er hat die Entscheidung des Direktors offen in Frage gestellt.",
                        "literal_mn": "Тэр байна тэр шийдвэрийг тэр захирлын нээлттэй дотор асуулт тавьсан.",
                        "natural_mn": "Тэр захирлын гаргасан шийдвэрийг шууд эргэлзэж шүүмжилсэн.",
                        "rule_breakdown": "'in Frage stellen' нь 'эргэлзэх, үнэн эсэхийг нь шүүмжлэх' гэсэн утгатай тогтвортой хэллэг бөгөөд үйл үг нь төгсгөлдөө очно.",
                        "woerterbuch": [
                            {"word": "die Entscheidung", "pos": "noun", "meaning": "шийдвэр", "article": "die"},
                            {"word": "der Direktor", "pos": "noun", "meaning": "захирал", "article": "der"},
                            {"word": "in Frage stellen", "pos": "verb", "meaning": "эргэлзэх, эсэргүүцэх"}
                        ]
                    }
                ]
            },
            {
                "id": "de_c1_subjektive_modalverben",
                "title": "Subjektive Modalverben (Vermutung & fremde Behauptung)",
                "core_concept": {
                    "mn": "Modal үйл үгс нь бодит боломж, үүргээс гадна ярьж буй хүний таамаглалын магадлалын зэрэг (müssen, dürften, können) эсвэл бусдын үгийг иш татахыг (sollen, wollen) илэрхийлдэг.",
                    "en": "Subjective modal verbs express speaker certainty/probability (müssen ~95%, dürften ~75%, können ~50%) or report unverified claims made by third parties (sollen) or subjects themselves (wollen).",
                    "de": "Subjektive Modalverben drücken Vermutungsgrade des Sprechers oder fremde Aussagen aus (sollen = man sagt; wollen = das Subjekt behauptet von sich)."
                },
                "pattern": "Gegenwart: Modalverb + Infinitiv I | Vergangenheit: Modalverb + Infinitiv II (Partizip II + haben/sein)",
                "examples": [
                    {
                        "target": "Er dürfte mittlerweile am Flughafen angekommen sein.",
                        "mn": "Тэрээр одоогийн байдлаар нисэх буудалд оччихсон байх магадлал маш өндөр байна.",
                        "en": "He should likely have arrived at the airport by now."
                    },
                    {
                        "target": "Der Politiker will von den Schmiergeldern nichts gewusst haben.",
                        "mn": "Уг улс төрч хахуулийн мөнгөний талаар огт мэдээгүй байсан гэж өөрийгөө баталж байна.",
                        "en": "The politician claims not to have known anything about the bribes."
                    }
                ],
                "common_trap": "Анхаарах: 'sollen' нь бусдын хэлсэн цуурхлыг ('хүмүүс тэгж ярьж байна'), харин 'wollen' нь тухайн субъект өөрийгөө тэгсэн гэж зүтгэж буйг илэрхийлнэ.",
                "drills": [
                    {
                        "id": "de_c1_modal_drill_1",
                        "prompt_mn": "Тэр эмэгтэй шалгалтаа өгөөд тэнцчихсэн байх өндөр магадлалтай.",
                        "target": "Sie muss die schwierige Prüfung bestanden haben.",
                        "literal_mn": "Тэр эмэгтэй ёстой тэр хэцүү шалгалтыг давчихсан байх.",
                        "natural_mn": "Тэр тэрхүү хүнд шалгалтаа лавтайяа давчихсан байх.",
                        "rule_breakdown": "Өнгөрсөн цаг дээр бараг гарцаагүй үнэн гэсэн таамаглалд: 'muss + Partizip II (bestanden) + haben' гэж бүтнэ.",
                        "woerterbuch": [
                            {"word": "müssen", "pos": "verb", "meaning": "лавтайяа ... байх (таамаглал)"},
                            {"word": "die Prüfung", "pos": "noun", "meaning": "шалгалт", "article": "die"},
                            {"word": "bestehen", "pos": "verb", "meaning": "тэнцэх, давах", "infinitive": "bestehen"}
                        ]
                    }
                ]
            },
            {
                "id": "de_c1_konjunktiv1",
                "title": "Konjunktiv I in der indirekten Rede & Berichterstattung",
                "core_concept": {
                    "mn": "Сэтгүүл зүй, албан ёсны илтгэлд бусдын үгийг төвийг сахисан, үнэн худлыг өөрөө хариуцахгүй байдлаар дамжуулахад Konjunktiv I-ийг ашигладаг.",
                    "en": "Konjunktiv I signals neutral indirect speech in journalism and official reports, disclaiming speaker responsibility for the truth value of the reported statement.",
                    "de": "Der Konjunktiv I distanziert den Sprecher vom Inhalt der fremden Aussage. Er ist Standard in seriöser Nachrichtenberichterstattung."
                },
                "pattern": "Infinitivstamm + Konjunktiv-Endung (-e, -est, -e, -en, -et, -en). Wenn formgleich mit Indikativ -> Konjunktiv II als Ersatzform.",
                "examples": [
                    {
                        "target": "Der Minister erklärte, die Regierung plane umfangreiche Steuerreformen.",
                        "mn": "Сайд мэдэгдэхдээ засгийн газар татварын өргөн цар хүрээтэй шинэчлэл төлөвлөж байгаа гэв.",
                        "en": "The minister explained that the government was planning comprehensive tax reforms."
                    },
                    {
                        "target": "Die Zeugen behaupteten, der Fahrer sei mit überhöhter Geschwindigkeit gefahren.",
                        "mn": "Гэрчүүд жолоочийг хурд хэтрүүлэн давхисан гэж мэдэгдэв.",
                        "en": "The witnesses claimed that the driver had been traveling at excessive speed."
                    }
                ],
                "common_trap": "Анхаарах: 1-р бие ба олон тоонд (wir/sie) Konjunktiv I нь Indikativ-тай ижил болбол заавал Konjunktiv II-ээр орлуулна (z.B. sie hätten statt sie haben).",
                "drills": [
                    {
                        "id": "de_c1_konj1_drill_1",
                        "prompt_mn": "Хотын дарга төсвийг хэдийн баталсан гэж хэлэв.",
                        "target": "Der Bürgermeister sagte, der Stadtrat habe den Haushalt bereits verabschiedet.",
                        "literal_mn": "Тэр хотын дарга хэлсэн, тэр хотын зөвлөл байг тэр төсвийг хэдийн баталсан.",
                        "natural_mn": "Хотын дарга хэлэхдээ хотын зөвлөл төсвийг хэдийнээ баталсан гэжээ.",
                        "rule_breakdown": "3-р биеийн өнгөрсөн цагийн шууд бус ярианд: 'habe ... verabschiedet' (Konjunktiv I туслах үйл үг).",
                        "woerterbuch": [
                            {"word": "der Bürgermeister", "pos": "noun", "meaning": "хотын дарга", "article": "der"},
                            {"word": "der Stadtrat", "pos": "noun", "meaning": "хотын зөвлөл", "article": "der"},
                            {"word": "der Haushalt", "pos": "noun", "meaning": "төсөв", "article": "der"},
                            {"word": "verabschieden", "pos": "verb", "meaning": "батлах (хууль, төсөв)", "infinitive": "verabschieden"}
                        ]
                    }
                ]
            },
            {
                "id": "de_c1_komplexe_konnektoren",
                "title": "Komplexe mehrteilige Konnektoren & Satzverknüpfung",
                "core_concept": {
                    "mn": "C1 түвшинд энгийн холбоосоос илүүтэй хоёр талт болон учир зүйн өндөр төвшний холбоос үгсийг (anstatt dass, ungeachtet dessen, je... desto) найруулгад чөлөөтэй ашигладаг.",
                    "en": "Complex correlative and concessive connectors establish intricate syntactic relations between clauses, essential for analytical argumentation.",
                    "de": "Mehrteilige Konnektoren (z.B. nicht nur... sondern auch, je... desto, anstatt dass, ungeachtet dessen) strukturieren komplexe Argumentationsgänge."
                },
                "pattern": "Nebensatz: Anstatt dass / Ungeachtet dessen, dass ... | Hauptsatz: Je + Komparativ (Nebensatz), desto/umso + Komparativ + Verb (Hauptsatz)",
                "examples": [
                    {
                        "target": "Je komplexer die Problemstellung ist, desto präziser müssen die Lösungsansätze formuliert werden.",
                        "mn": "Асуудал хэдий чинээ ээдрээтэй байна, шийдлийн арга замууд төдий чинээ нарийн тодорхойлогдох учиртай.",
                        "en": "The more complex the problem is, the more precisely the approaches to a solution must be formulated."
                    },
                    {
                        "target": "Ungeachtet der widrigen Umstände wurde das Forschungsprojekt pünktlich abgeschlossen.",
                        "mn": "Таагүй нөхцөл байдлыг үл харгалзан судалгааны төслийг цагт нь дуусгав.",
                        "en": "Notwithstanding the adverse circumstances, the research project was completed on time."
                    }
                ],
                "common_trap": "Анхаарах: 'Je... desto' бүтцэд 'Je'-тэй хэсэг нь туслах өгүүлбэр (үйл үг төгсгөлд), харин 'desto'-той хэсэг нь гол өгүүлбэр (харьцуулсан зэргийн дараа үйл үг 2-р байранд) байна.",
                "drills": [
                    {
                        "id": "de_c1_konn_drill_1",
                        "prompt_mn": "Бид хэдий чинээ их хичээж сурна, үр дүн төдий чинээ сайн байх болно.",
                        "target": "Je fleißiger wir lernen, desto besser werden unsere Resultate sein.",
                        "literal_mn": "Хэдий хичээнгүй бид сурна, төдий сайн болно бидний үр дүнгүүд байх.",
                        "natural_mn": "Бид хэдий чинээ хичээнгүй суралцана, үр дүн маань төдий чинээ сайн байна.",
                        "rule_breakdown": "'Je fleißiger wir lernen' (V-End) + 'desto besser werden' (Verb auf Pos 2 nach Komparativ).",
                        "woerterbuch": [
                            {"word": "fleißig", "pos": "adj", "meaning": "хичээнгүй"},
                            {"word": "das Resultat", "pos": "noun", "meaning": "үр дүн", "article": "das"},
                            {"word": "je... desto", "pos": "conj", "meaning": "хэдий чинээ... төдий чинээ"}
                        ]
                    }
                ]
            }
        ]
    }

    folder_06 = {
        "folder_id": "folder_06",
        "folder_name": "Folder 06: C2 - Annähernd muttersprachliche Finesse",
        "level": "C2",
        "topics": [
            {
                "id": "de_c2_satzklammer_ausklammerung",
                "title": "Stilistische Satzklammer & bewusste Ausklammerung (Nachfeld)",
                "core_concept": {
                    "mn": "Герман хэлний үндсэн өгүүлбэрийн хүрээний дүрмийг (Satzklammer) уран зохиол, илтгэлд зориудаар зөрчин, зарим тодотгол, харьцуулалтыг төгсгөлийн араар гаргахыг Ausklammerung гэнэ.",
                    "en": "Deliberate right-dislocation (Ausklammerung into the Nachfeld) relaxes the rigid German sentence frame to emphasize prepositional phrases, comparisons, or long clauses without syntactic overload.",
                    "de": "Die stilistische Ausklammerung ins Nachfeld durchbricht die starre Satzklammer, um schwere Satzglieder gezielt hervorzuheben oder das Mittelfeld zu entlasten."
                },
                "pattern": "[Vollverb am Satzende] + [AUSGEKLAMMERTES GLIED: Präpositionalphrase, Vergleich mit wie/als, Nebensatz]",
                "examples": [
                    {
                        "target": "Er hat gestern lange gesprochen mit dem leitenden Ausschussvorsitzenden.",
                        "mn": "Тэрээр өчигдөр удирдах хорооны даргатай онцгой удаан ярилцсан юм.",
                        "en": "He spoke yesterday for a long time with the chief committee chairperson."
                    },
                    {
                        "target": "Niemand hatte so viel geleistet für die Allgemeinheit wie dieser bescheidene Gelehrte.",
                        "mn": "Энэхүү даруу эрдэмтэн шиг нийгмийн сайн сайхны төлөө тийм их зүйл бүтээсэн хүн үгүй байлаа.",
                        "en": "No one had accomplished as much for the public good as this modest scholar."
                    }
                ],
                "common_trap": "Анхаарах: Хүрээний араар ямар ч хамаагүй үгийг гаргаж болохгүй. Зөвхөн урт угтвар үгт нэгдлүүд, харьцуулсан бүтцүүд (wie/als) болон туслах өгүүлбэрийг найруулгын зорилгоор гаргана.",
                "drills": [
                    {
                        "id": "de_c2_satzkl_drill_1",
                        "prompt_mn": "Тэрээр нарийн төвөгтэй сэдвийн талаар гүн гүнзгий бодлогоширсон байв.",
                        "target": "Sie hatte stundenlang nachgedacht über die Tragweite dieser historischen Entscheidung.",
                        "literal_mn": "Тэр эмэгтэй байв цагуудаар бодсон тухай тэр далайц тэр түүхэн шийдвэрийн.",
                        "natural_mn": "Тэрээр энэхүү түүхэн шийдвэрийн үр дагаврын талаар олон цагаар гүн бодлогширсон байлаа.",
                        "rule_breakdown": "'nachgedacht' үйл үгийн араар урт 'über'-тэй хэллэгийг гарган Nachfeld-д тавьж өгүүлбэрийн төгсгөлийг онцлов.",
                        "woerterbuch": [
                            {"word": "nachdenken", "pos": "verb", "meaning": "бодох, тунгаах (+ über Akk)", "infinitive": "nachdenken"},
                            {"word": "die Tragweite", "pos": "noun", "meaning": "далайц, хол уршиг", "article": "die"},
                            {"word": "historisch", "pos": "adj", "meaning": "түүхэн"}
                        ]
                    }
                ]
            },
            {
                "id": "de_c2_konjunktiv2_vergangenheit",
                "title": "Gehobener Konjunktiv II der Vergangenheit (Konditionale Inversion)",
                "core_concept": {
                    "mn": "'Wenn' холбоосгүйгээр туслах үйл үгийг (Hätte/Wäre) өгүүлбэрийн хамгийн урд байрлуулан өнгөрсөн цагийн биелэгдээгүй нөхцөлийг өндөр найруулгаар илэрхийлэх бүтэц.",
                    "en": "Hypothetical past conditional inversion drops 'wenn' and places the conjugated subjunctive auxiliary (Hätte/Wäre/Stünde) in Position 1, epitomizing literary elegance.",
                    "de": "Der gehobene uneingeleitete Konditionalsatz stellt das finite Konjunktiv-II-Verb an Position 1 (V1-Stellung) und verzichtet auf die Konjunktion 'wenn'."
                },
                "pattern": "Position 1: [Hätte / Wäre / Stünde] + Subjekt + ... + Partizip II, [so/dann] + finites Verb + Subjekt...",
                "examples": [
                    {
                        "target": "Hätte die Delegation rechtzeitig interveniert, wäre die Eskalation vermeidbar gewesen.",
                        "mn": "Төлөөлөгчид цаг тухайд нь хөндлөнгөөс оролцсон ахул уг хурцадмал байдлаас зайлсхийж болох байлаа.",
                        "en": "Had the delegation intervened in time, the escalation would have been avoidable."
                    },
                    {
                        "target": "Wäre der Brief früher eingetroffen, hätten wir sofort reagieren können.",
                        "mn": "Уг захидал эртхэн ирсэн сэн бол бид даруй арга хэмжээ авч чадах байсан юм.",
                        "en": "Had the letter arrived earlier, we would have been able to react immediately."
                    }
                ],
                "common_trap": "Анхаарах: 1-р байранд үйл үг орсон тул хоёр дахь өгүүлбэр (Hauptsatz) мөн адил үйл үгээр эхэлнэ (эсвэл 'so/dann' дагалдана).",
                "drills": [
                    {
                        "id": "de_c2_konj2_drill_1",
                        "prompt_mn": "Бид эрсдэлийг урьдчилан харсан сан бол тийм их хохирол амсахгүй байх байсан.",
                        "target": "Hätten wir die drohenden Gefahren rechtzeitig erkannt, so hätten wir diesen schweren Verlust abgewendet.",
                        "literal_mn": "Байсан бол бид тэр заналхийлж буй аюулуудыг цагтаа таньсан, тийн байх байсан бид энэ хүнд гарзыг зайлуулсан.",
                        "natural_mn": "Нүүрлэж буй аюулыг бид цагт нь мэдэрсэн сэн бол энэхүү хүнд хохирлоос сэргийлэх байсан юм.",
                        "rule_breakdown": "'Hätten wir ... erkannt' (V1 conditional clause) + 'so hätten wir ... abgewendet'.",
                        "woerterbuch": [
                            {"word": "erkennen", "pos": "verb", "meaning": "таних, ухаарах", "infinitive": "erkennen"},
                            {"word": "die Gefahr", "pos": "noun", "meaning": "аюул", "article": "die"},
                            {"word": "abwenden", "pos": "verb", "meaning": "зайлуулах, гэтлэх", "infinitive": "abwenden"},
                            {"word": "der Verlust", "pos": "noun", "meaning": "хохирол, гарз", "article": "der"}
                        ]
                    }
                ]
            },
            {
                "id": "de_c2_passiversatzformen",
                "title": "Passiversatzformen (sein + zu + Infinitiv, sich lassen, Gerundiv)",
                "core_concept": {
                    "mn": "'Werden'-тэй үйлдэгдэх хэвийн давталтаас зайлсхийхийн тулд 'sein + zu + Infinitiv' (боломж, шаардлага), 'sich lassen + Infinitiv' (боломж) эсвэл -bar/-lich төгсгөлтэй бүтцийг хэрэглэдэг.",
                    "en": "Passive substitutes replace passive with 'sein + zu + Infinitiv' (modal necessity/possibility), reflexive 'sich lassen + Infinitiv', or gerundives, elevating prose diversity.",
                    "de": "Passiversatzformen vermeiden das schwerfällige Passiv durch 'sein + zu + Infinitiv' (müssen/können), 'sich lassen + Infinitiv' (können) oder das Gerundivum."
                },
                "pattern": "Nomen + sein + zu + Infinitiv (muss/kann getan werden) | Nomen + lässt sich + Infinitiv (kann getan werden)",
                "examples": [
                    {
                        "target": "Dieses brisante Problem ist nicht innerhalb weniger Tage zu lösen.",
                        "mn": "Энэхүү хурцадмал асуудлыг хэдхэн хоногийн дотор шийдвэрлэх боломжгүй юм (шийдэгдэх боломжгүй).",
                        "en": "This explosive problem cannot be solved within a few days."
                    },
                    {
                        "target": "Die Authentizität des Dokuments lässt sich zweifelsfrei nachweisen.",
                        "mn": "Уг баримт бичгийн жинхэнэ болохыг ямар ч эргэлзээгүйгээр нотлох бүрэн боломжтой.",
                        "en": "The authenticity of the document can be proven beyond doubt."
                    }
                ],
                "common_trap": "Анхаарах: 'sein + zu + Infinitiv' нь өгүүлбэрийн хам сэдвээсээ хамааран 'боломжтой' (können) эсвэл 'ёстой' (müssen) гэсэн утгын аль алийг гаргадаг.",
                "drills": [
                    {
                        "id": "de_c2_pass_drill_1",
                        "prompt_mn": "Эдгээр бүх зааварчилгааг чандлан дагаж мөрдөх ёстой.",
                        "target": "Alle Sicherheitsvorschriften sind strikt einzuhalten.",
                        "literal_mn": "Бүх аюулгүй байдлын зааврууд байна чанд сахигдахаар.",
                        "natural_mn": "Аюулгүй байдлын бүх журмыг хатуу чанд мөрдөх учиртай.",
                        "rule_breakdown": "'sind ... einzuhalten' = 'müssen eingehalten werden' гэсэн үйлдэгдэх хэвийн утгыг орлосон бүтэц.",
                        "woerterbuch": [
                            {"word": "die Sicherheitsvorschrift", "pos": "noun", "meaning": "аюулгүй байдлын журам", "article": "die"},
                            {"word": "einhalten", "pos": "verb", "meaning": "мөрдөх, сахих", "infinitive": "einhalten"},
                            {"word": "strikt", "pos": "adv", "meaning": "хатуу чанд"}
                        ]
                    }
                ]
            },
            {
                "id": "de_c2_modalpartikeln",
                "title": "Modalpartikeln & feine Bedeutungsnuancen (ja, denn, wohl, eben)",
                "core_concept": {
                    "mn": "Герман хэлний хамгийн өвөрмөц хэсэг болох Modalpartikeln (сул үгс) нь өгүүлбэрийн мэдээллийг өөрчлөхгүй ч яригчийн сэтгэл хөдлөл, итгэл үнэмшил, далд хандлагыг тодорхойлдог.",
                    "en": "Modal particles (ja, denn, wohl, halt, eben, eh, bloß, etwa) subtly modify interpersonal stance, shared knowledge, or emotional coloring without changing truth conditions.",
                    "de": "Modalpartikeln färben Aussagen pragmatisch ein. Sie signalisieren geteiltes Vorwissen (ja), Resignation (halt/eben), Überraschung (denn) oder Vermutung (wohl)."
                },
                "pattern": "Aussagesatz / Fragesatz: Steht unbetont im Mittelfeld hinter dem finiten Verb und Pronomen.",
                "examples": [
                    {
                        "target": "Das ist ja eine erstaunliche Wendung der Ereignisse!",
                        "mn": "Энэ чинь харин ёстой гайхалтай үйл явдлын эргэлт байна шүү дээ! (ярилцагчийн мэддэг зүйлийг батлах)",
                        "en": "That is indeed an astonishing turn of events! (as we both can see)"
                    },
                    {
                        "target": "Er wird wohl den falschen Zug genommen haben.",
                        "mn": "Тэр лав буруу галт тэргэнд суучихсан бололтой доо. (таамаглал)",
                        "en": "He has probably taken the wrong train."
                    }
                ],
                "common_trap": "Анхаарах: Modalpartikeln нь өргөлт авдаггүй бөгөөд асуулт, батлах өгүүлбэрт огт өөр өнгө аяс (denn = сонирхол татах, etwa = сэжиглэх) үүсгэдэг.",
                "drills": [
                    {
                        "id": "de_c2_partikeln_drill_1",
                        "prompt_mn": "Чи үүнийг аль хэдийнэ мэдэж л байгаа шүү дээ.",
                        "target": "Du weißt das ja ohnehin schon längst.",
                        "literal_mn": "Чи мэднэ үүнийг мэдээж ямар ч байсан хэдийн эртнээс.",
                        "natural_mn": "Чи үүнийг ямар ч байсан хэдийнээ мэдчихсэн л байгаа шүү дээ.",
                        "rule_breakdown": "'ja' нь сонсогч аль хэдийн мэддэг гэдгийг тодотгож байна. 'ohnehin' нь ямар ч байсан гэсэн утга нэмнэ.",
                        "woerterbuch": [
                            {"word": "wissen", "pos": "verb", "meaning": "мэдэх", "infinitive": "wissen"},
                            {"word": "ohnehin", "pos": "adv", "meaning": "ямар ч байсан, угаасаа"},
                            {"word": "längst", "pos": "adv", "meaning": "хэдийнээ, эртнээс"}
                        ]
                    }
                ]
            },
            {
                "id": "de_c2_genitiv_praepositionen",
                "title": "Gehobene Präpositionen mit Genitiv (anlässlich, kraft, mangels)",
                "core_concept": {
                    "mn": "Хууль зүй, албан ёсны бичиг баримт болон өндөр зэрэглэлийн ярианд Genitiv авдаг сонгодог угтвар үгс (anlässlich, kraft, mangels, unbeschadet, zeit) хэрэглэгддэг.",
                    "en": "Elevated genitive prepositions (anlässlich, kraft, mangels, unbeschadet, zeit, behufs) demonstrate formal legal and academic precision in syntactical framing.",
                    "de": "Gehobene Genitivpräpositionen kennzeichnen die juristische, staatliche und akademische Hochsprache und fordern ausnahmslos den Genitiv."
                },
                "pattern": "[anlässlich / kraft / mangels / unbeschadet / zeit / infolge] + Substantiv im Genitiv",
                "examples": [
                    {
                        "target": "Kraft seines Amtes erließ der Richter ein sofortiges Ausreiseverbot.",
                        "mn": "Шүүгч өөрийн албан тушаалын эрх мэдлийн хүрээнд улсын хилээр гарахыг хориглосон шийдвэр гаргав.",
                        "en": "By virtue of his office, the judge issued an immediate travel ban."
                    },
                    {
                        "target": "Mangels hinreichender Beweise wurde der Angeklagte freigesprochen.",
                        "mn": "Хангалттай нотлох баримт дутмаг байсны улмаас шүүгдэгчийг цагаатгалаа.",
                        "en": "For lack of sufficient evidence, the defendant was acquitted."
                    }
                ],
                "common_trap": "Анхаарах: Хэзээ ч ярианы хэлний Dativ хэрэглэж болохгүй (биш: 'mangels Beweisen', харин заавал 'mangels Beweise' буюу Genitiv).",
                "drills": [
                    {
                        "id": "de_c2_genitiv_drill_1",
                        "prompt_mn": "Их сургуулийн 100 жилийн ойг тохиолдуулан олон улсын хурал зохион байгуулав.",
                        "target": "Anlässlich des hundertjährigen Jubiläums der Universität wurde ein internationaler Kongress veranstaltet.",
                        "literal_mn": "Тохиолдуулан тэр зуун жилийн ойн тэр их сургуулийн байв нэг олон улсын их хурал зохион байгуулагдсан.",
                        "natural_mn": "Их сургуулийн 100 жилийн ойг тохиолдуулан олон улсын эрдэм шинжилгээний хурал зохион байгууллаа.",
                        "rule_breakdown": "'Anlässlich + Genitiv' (des Jubiläums) нь 'ойг тохиолдуулан' гэсэн албан ёсны хүндэтгэлийн бүтэц үүсгэнэ.",
                        "woerterbuch": [
                            {"word": "anlässlich", "pos": "prep", "meaning": "тохиолдуулан (+ Gen)"},
                            {"word": "das Jubiläum", "pos": "noun", "meaning": "ой, тэмдэглэлт өдөр", "article": "das"},
                            {"word": "der Kongress", "pos": "noun", "meaning": "их хурал", "article": "der"},
                            {"word": "veranstalten", "pos": "verb", "meaning": "зохион байгуулах", "infinitive": "veranstalten"}
                        ]
                    }
                ]
            }
        ]
    }
    return [folder_05, folder_06]

def get_en_c1_c2_folders():
    folder_05 = {
        "folder_id": "folder_05",
        "folder_name": "Folder 05: C1 - Advanced Fluency & Academic Discourse",
        "level": "C1",
        "topics": [
            {
                "id": "en_c1_negative_inversion",
                "title": "Negative & Limiting Inversion",
                "core_concept": {
                    "mn": "Өгүүлбэрийн эхэнд сөрөг болон хязгаарлах утгатай дайвар үгс (Not only, Hardly, Rarely, Under no circumstances) орвол асуух өгүүлбэрийн адил туслах үйл үг эзэн биеийнхээ өмнө орж урвуу бүтэц үүсдэг.",
                    "en": "When negative or restrictive adverbials begin a sentence for dramatic rhetorical emphasis, auxiliary inversion (Auxiliary + Subject + Verb) is grammatically mandatory.",
                    "de": "Beginnt ein Satz mit verneinenden oder einschränkenden Adverbialen (z.B. Hardly, Never, Under no circumstances), erfolgt obligatorisch die Inversion von Hilfsverb und Subjekt."
                },
                "pattern": "[Negative/Restrictive Adverbial] + [Auxiliary Verb: do/did/have/had/will/is] + [Subject] + [Main Verb]...",
                "examples": [
                    {
                        "target": "Under no circumstances should sensitive customer credentials be stored in unencrypted text.",
                        "mn": "Ямар ч тохиолдолд үйлчлүүлэгчийн эмзэг нууц мэдээллийг шифрлэгдээгүй эх бичвэрээр хадгалж болохгүй.",
                        "en": "Under no circumstances should sensitive customer credentials be stored in unencrypted text."
                    },
                    {
                        "target": "Rarely had the global community witnessed such rapid technological upheaval.",
                        "mn": "Дэлхийн хамтын нийгэмлэг технологийн ийм огцом тэсрэлтийг өмнө нь тун ховор харж байсан юм.",
                        "en": "Rarely had the global community witnessed such rapid technological upheaval."
                    }
                ],
                "common_trap": "Never maintain standard declarative word order after negative openers: Do NOT say 'Under no circumstances you should...'; say 'Under no circumstances should you...'",
                "drills": [
                    {
                        "id": "en_c1_inv_drill_1",
                        "prompt_mn": "Тэрээр зөвхөн судалгаагаа амжилттай дуусгаад зогсохгүй нэр хүндтэй шагнал хүртжээ.",
                        "target": "Not only did she complete the rigorous research, but she also received a prestigious award.",
                        "literal_mn": "Зөвхөн биш хийв тэр эмэгтэй дуусгах тэр нарийн судалгааг, гэвч тэр эмэгтэй мөн хүлээн авав нэг нэр хүндтэй шагнал.",
                        "natural_mn": "Тэрээр нарийн судалгаагаа амжилттай дуусгаад зогсохгүй нэр хүндтэй шагнал хүртсэн байна.",
                        "rule_breakdown": "'Not only' эхэнд орсон тул Past Simple цагийн 'did' туслах үйл үг 'she'-ийн урд орно.",
                        "woerterbuch": [
                            {"word": "not only", "pos": "conj", "meaning": "зөвхөн ... биш"},
                            {"word": "complete", "pos": "verb", "meaning": "гүйцээх, дуусгах"},
                            {"word": "prestigious", "pos": "adj", "meaning": "нэр хүндтэй"},
                            {"word": "award", "pos": "noun", "meaning": "шагнал"}
                        ]
                    }
                ]
            },
            {
                "id": "en_c1_cleft_sentences",
                "title": "Cleft Sentences for Focus & Emphasis (It-cleft & Wh-cleft)",
                "core_concept": {
                    "mn": "Өгүүлбэрийн тодорхой нэг хэсэгт (эзэн бие, цаг хугацаа, шалтгаан) онцгой ач холбогдол өгөхийн тулд өгүүлбэрийг 'It is/was... that' эсвэл 'What... is' хэлбэрээр зааглан хуваах бүтэц.",
                    "en": "Cleft sentences split a single semantic clause across two syntactic units to spotlight the focal information via It-clefts or Pseudo-clefts (Wh-clefts).",
                    "de": "Spaltsätze (Cleft Sentences) zerlegen eine Aussage in zwei Prädikationen, um ein Element fokussierend herauszustellen (It is... that / What I need is...)."
                },
                "pattern": "It is/was + [FOCUSED ELEMENT] + that/who + [REST OF SENTENCE] | What + [SUBJECT + VERB] + is/was + [FOCUS]",
                "examples": [
                    {
                        "target": "It was her groundbreaking algorithm that transformed modern cryptographic security.",
                        "mn": "Орчин үеийн криптограф аюулгүй байдлыг үндсээр нь өөрчилсөн зүйл бол түүний шинэлэг алгоритм байсан юм.",
                        "en": "It was her groundbreaking algorithm that transformed modern cryptographic security."
                    },
                    {
                        "target": "What the team urgently requires is decisive leadership and financial autonomy.",
                        "mn": "Баг хамт олонд нэн даруй шаардлагатай байгаа зүйл бол шийдэмгий удирдлага болон санхүүгийн бие даасан байдал юм.",
                        "en": "What the team urgently requires is decisive leadership and financial autonomy."
                    }
                ],
                "common_trap": "Do not confuse 'It' with 'What' in cleft structures. For personal or prepositional focuses, use 'It was X that...'; for actions or whole clauses, use 'What X did was...'",
                "drills": [
                    {
                        "id": "en_c1_cleft_drill_1",
                        "prompt_mn": "Манай системд хэрэгтэй байгаа зүйл бол найдвартай офлайн ажиллагаа юм.",
                        "target": "What our users value most is deterministic and resilient offline performance.",
                        "literal_mn": "Юу манай хэрэглэгчид үнэлдэг хамгийн их бол тодорхой бөгөөд уян хатан офлайн гүйцэтгэл.",
                        "natural_mn": "Манай хэрэглэгчдийн хамгийн их үнэлдэг зүйл бол найдвартай, баталгаатай офлайн ажиллагаа юм.",
                        "rule_breakdown": "'What'-cleft өгүүлбэр нь тухайн үнэлдэг зүйлийг өгүүлбэрийн төгсгөлд гол анхаарлын төвд авчирч байна.",
                        "woerterbuch": [
                            {"word": "value", "pos": "verb", "meaning": "үнэлэх, эрхэмлэх"},
                            {"word": "deterministic", "pos": "adj", "meaning": "баталгаатай, тодорхой"},
                            {"word": "resilient", "pos": "adj", "meaning": "найдвартай, уян хатан"}
                        ]
                    }
                ]
            },
            {
                "id": "en_c1_mixed_conditionals",
                "title": "Mixed Conditionals (Past Condition to Present Result & Vice Versa)",
                "core_concept": {
                    "mn": "Өнгөрсөн үйл явдлын бодит бус нөхцөл одоо цагт үр дүн үзүүлэх (Past condition -> Present result) эсвэл одоогийн бодит байдал өнгөрсөн үйлдэлд нөлөөлөх холимог нөхцөлүүд.",
                    "en": "Mixed conditionals combine clauses across different time frames, most commonly pairing an unreal past condition (had + V3) with an unreal present consequence (would + base verb).",
                    "de": "Mixed Conditionals verknüpfen unterschiedliche Zeitebenen, typischerweise eine irreale Bedingung der Vergangenheit mit einer Konsequenz in der Gegenwart."
                },
                "pattern": "If + Subject + had + V3, Subject + would + Base Verb (Past -> Present) | If + Subject + Past Simple, Subject + would have + V3 (Present -> Past)",
                "examples": [
                    {
                        "target": "If he had pursued a degree in computational linguistics, he would be working as an AI researcher today.",
                        "mn": "Хэрэв тэрээр тооцооллын хэл шинжлэлийн чиглэлээр суралцсан бол өнөөдөр хиймэл оюун ухааны судлаачаар ажиллаж байх байлаа.",
                        "en": "If he had pursued a degree in computational linguistics, he would be working as an AI researcher today."
                    },
                    {
                        "target": "If she were not so inherently principled, she would have accepted the dubious corporate offer.",
                        "mn": "Тэр эмэгтэй өөрөө тийм өндөр зарчимч хүн биш байсан бол тэрхүү сэжигтэй бизнесийн саналыг аль хэдийнэ хүлээн авах байсан.",
                        "en": "If she were not so inherently principled, she would have accepted the dubious corporate offer."
                    }
                ],
                "common_trap": "Beware mixing up 'would have V3' (past result) and 'would + V1' (present result). Check the time markers like 'today' or 'now'.",
                "drills": [
                    {
                        "id": "en_c1_cond_drill_1",
                        "prompt_mn": "Хэрэв бид өгөгдлөө өчигдөр нөөцөлсөн сөн бол одоо ямар ч асуудалгүй байх байлаа.",
                        "target": "If we had backed up our local data yesterday, we would not be facing this crisis now.",
                        "literal_mn": "Хэрэв бид байсан нөөцөлсөн манай орон нутгийн өгөгдлийг өчигдөр, бид байхгүй байх байсан тулгарах энэ хямралтай одоо.",
                        "natural_mn": "Хэрэв бид өчигдөр өгөгдлөө нөөцөлсөн байсан бол өдийд ийм хүнд байдалд орохгүй байх байсан.",
                        "rule_breakdown": "Өнгөрсөн цагийн нөхцөл (had backed up) + одоо цагийн үр дагавар (would not be facing).",
                        "woerterbuch": [
                            {"word": "back up", "pos": "verb", "meaning": "нөөцлөх"},
                            {"word": "face", "pos": "verb", "meaning": "тулгарах"},
                            {"word": "crisis", "pos": "noun", "meaning": "хямрал, хүндрэл"}
                        ]
                    }
                ]
            },
            {
                "id": "en_c1_participle_clauses",
                "title": "Participle Clauses for Syntactic Compression",
                "core_concept": {
                    "mn": "Шалтгаан, цаг хугацаа, нөхцөл заасан урт гишүүн өгүүлбэрүүдийг Present Participle (-ing), Past Participle (-ed), эсвэл Perfect Participle (Having + V3) ашиглан чадварлаг товчилдог.",
                    "en": "Participle clauses replace adverbial and relative clauses with non-finite participles, achieving concision, stylistic sophistication, and seamless flow.",
                    "de": "Partizipialkonstruktionen ersetzen Adverbialsätze (Kausal-, Temporal- und Modalsätze) durch elegante syntaktische Verdichtung."
                },
                "pattern": "[Having + V3 / Being + V3 / V-ing], [Main Subject] + [Main Verb]... Note: Dangling participles must be strictly avoided.",
                "examples": [
                    {
                        "target": "Having scrutinized the experimental findings, the lead investigator revised the initial hypothesis.",
                        "mn": "Туршилтын үр дүнг нягтлан судалсныхаа дараа ахлах шинжээч анхны таамаглалаа шинэчлэн засав.",
                        "en": "Having scrutinized the experimental findings, the lead investigator revised the initial hypothesis."
                    },
                    {
                        "target": "Deprived of financial backing, the ambitious startup had to streamline operations.",
                        "mn": "Санхүүгийн дэмжлэгээсээ салсан тул уг өсөлттэй гарааны компани үйл ажиллагаагаа цомхотгохоос өөр аргагүй болов.",
                        "en": "Deprived of financial backing, the ambitious startup had to streamline operations."
                    }
                ],
                "common_trap": "Beware dangling participles! The implied subject of the participle clause MUST match the subject of the main clause.",
                "drills": [
                    {
                        "id": "en_c1_part_drill_1",
                        "prompt_mn": "Төслийн тайланг нягтлан үзээд захирал төсвийг батлав.",
                        "target": "Having reviewed the comprehensive project proposal, the director approved the funding.",
                        "literal_mn": "Байгаад нягталсан тэр дэлгэрэнгүй төслийн саналыг, тэр захирал зөвшөөрөв тэр санхүүжилтийг.",
                        "natural_mn": "Төслийн дэлгэрэнгүй саналыг хянаж үзсэний дараа захирал санхүүжилтийг баталлаа.",
                        "rule_breakdown": "Эхлээд болсон үйлдэлд 'Having reviewed' бүтэц хэрэглэгдэж захирал өөрөө хянасан тул эзэн бие яг тохирно.",
                        "woerterbuch": [
                            {"word": "review", "pos": "verb", "meaning": "хянах, нягтлах"},
                            {"word": "proposal", "pos": "noun", "meaning": "санал"},
                            {"word": "funding", "pos": "noun", "meaning": "санхүүжилт"}
                        ]
                    }
                ]
            },
            {
                "id": "en_c1_advanced_passive",
                "title": "Advanced Passive Structures & Impersonal Reporting",
                "core_concept": {
                    "mn": "Сэтгүүл зүй, эрдэм шинжилгээний тайланд бодит байдлыг төвийг сахисан, хувь хүний үзэл бодлоос ангид байдлаар мэдээлэхэд 'is said to be', 'is believed to have been' зэрэг дэвшилтэт бүтцийг ашиглана.",
                    "en": "Advanced passives shift focus from actors to facts through impersonal constructions ('It is acknowledged that...') and personal nominative passives ('She is thought to have led...').",
                    "de": "Erweiterte Passivstrukturen (Impersonal Passive / Personal Nominative with Infinitive) distanzieren den Autor von unbestätigten Fakten und sichern akademische Neutralität."
                },
                "pattern": "Subject + [passive verb: is believed / reported / claimed] + to + [Infinitiv / have + V3]",
                "examples": [
                    {
                        "target": "The ancient manuscripts are thought to have originated in the twelfth century.",
                        "mn": "Эртний гар бичмэлүүдийг арван хоёрдугаар зуунд үүссэн гэж эрдэмтэд үздэг.",
                        "en": "The ancient manuscripts are thought to have originated in the twelfth century."
                    },
                    {
                        "target": "It is widely acknowledged that continuous deliberate practice yields superior mastery.",
                        "mn": "Тасралтгүй, зорилготой дасгал сургуулилалт нь хамгийн дээд зэргийн ур чадварт хүргэдэг гэдгийг нийтээр хүлээн зөвшөөрдөг.",
                        "en": "It is widely acknowledged that continuous deliberate practice yields superior mastery."
                    }
                ],
                "common_trap": "Do not say 'They are believed that they originated...'; with personal subjects use infinitive: 'They are believed to have originated...'",
                "drills": [
                    {
                        "id": "en_c1_pass_drill_1",
                        "prompt_mn": "Энэхүү шинэ технологи нь харилцаа холбоог хувьсган өөрчилсөн гэгддэг.",
                        "target": "This groundbreaking technology is said to have revolutionized global communications.",
                        "literal_mn": "Энэ зааглагч технологи байна хэлэгдсэн байхаар хувьсгасан дэлхийн харилцаа холбоог.",
                        "natural_mn": "Энэхүү шинэлэг технологи дэлхийн харилцаа холбоонд хувьсгал хийсэн гэж үздэг.",
                        "rule_breakdown": "'is said to have revolutionized' - субъектийг нэрлэсэн идэвхгүй төлөв дээр төгссөн үйлдэлд Perfect Infinitive хэрэглэнэ.",
                        "woerterbuch": [
                            {"word": "groundbreaking", "pos": "adj", "meaning": "хувьсгалт, шинэ зам гаргасан"},
                            {"word": "revolutionize", "pos": "verb", "meaning": "хувьсгал хийх"},
                            {"word": "communication", "pos": "noun", "meaning": "харилцаа холбоо"}
                        ]
                    }
                ]
            },
            {
                "id": "en_c1_hedging_discourse",
                "title": "Hedging & Academic Discourse Markers",
                "core_concept": {
                    "mn": "Эрдэм шинжилгээний бичлэгт хэт бардам эсвэл шууд дүгнэлтээс сэргийлж, болгоомжтой байр суурь (hedging: arguably, ostensibly, tends to indicate) илэрхийлэх чадвар.",
                    "en": "Hedging modulates epistemic commitment, enabling scholars to state claims with appropriate caution, nuance, and rhetorical rigor without sounding overly dogmatic.",
                    "de": "Hedging mildert absolute Aussagen im wissenschaftlichen Diskurs ab (z.B. presumably, arguably, appears to indicate), um methodische Vorbehalte präzise auszudrücken."
                },
                "pattern": "[Modal lexical verbs: tend to, appear to, suggest that] + [Epistemic adverbs: arguably, ostensibly, ostensibly, conceivably]",
                "examples": [
                    {
                        "target": "The preliminary empirical data appear to suggest a plausible correlation between both variables.",
                        "mn": "Урьдчилсан туршилтын өгөгдөл нь хоёр хувьсагчийн хооронд боломжит хамаарал байж болохыг харуулж байна.",
                        "en": "The preliminary empirical data appear to suggest a plausible correlation between both variables."
                    },
                    {
                        "target": "This finding is arguably one of the most substantial breakthroughs in modern pharmacology.",
                        "mn": "Энэхүү нээлт нь орчин үеийн эмийн судлалын салбар дахь хамгийн томоохон ололтуудын нэг гэж маргаангүй үзэгдэж байна.",
                        "en": "This finding is arguably one of the most substantial breakthroughs in modern pharmacology."
                    }
                ],
                "common_trap": "Never write raw categorical statements like 'This proves that...' in academic contexts; use hedged formulations like 'These findings lend credence to the view that...'",
                "drills": [
                    {
                        "id": "en_c1_hedge_drill_1",
                        "prompt_mn": "Үр дүн нь анхны таамаглал үнэн байсныг харуулах хандлагатай байна.",
                        "target": "The statistical observations tend to corroborate the original hypothesis.",
                        "literal_mn": "Тэдгээр статистик ажиглалтууд хандлагатай байна бататгах тэр анхны таамаглалыг.",
                        "natural_mn": "Статистик ажиглалтын үр дүн анхны таамаглалыг бататгах хандлагатай харагдаж байна.",
                        "rule_breakdown": "'tend to corroborate' нь шууд 'батлав' гэхээс сэргийлж шинжлэх ухааны найруулгын сэрэмжлүүлэг (hedging) оруулж байна.",
                        "woerterbuch": [
                            {"word": "observation", "pos": "noun", "meaning": "ажиглалт"},
                            {"word": "corroborate", "pos": "verb", "meaning": "бататгах, нотлох"},
                            {"word": "hypothesis", "pos": "noun", "meaning": "таамаглал"}
                        ]
                    }
                ]
            }
        ]
    }

    folder_06 = {
        "folder_id": "folder_06",
        "folder_name": "Folder 06: C2 - Mastery & Nuanced Stylistics",
        "level": "C2",
        "topics": [
            {
                "id": "en_c2_subjunctive",
                "title": "The Mandative & Formulaic Subjunctive Mood",
                "core_concept": {
                    "mn": "Албан ёсны хүсэлт, шаардлага, дүрэм журмын дараа үйл үг бие төлөөний хувирал авахгүй үндсэн хэлбэрээр (bare infinitive) байхыг Mandative Subjunctive гэнэ.",
                    "en": "The mandative subjunctive employs the bare base form of the verb in that-clauses following verbs or adjectives of urgency, decree, or recommendation (e.g. demand that he be present).",
                    "de": "Der mandative Konjunktiv im Englischen nutzt die bare Infinitivform nach Verben der Forderung oder Notwendigkeit (z.B. insist that she remain)."
                },
                "pattern": "[Verb/Adj: insist, recommend, crucial, vital] + that + Subject + [BARE INFINITIVE: be / do / remain / speak]",
                "examples": [
                    {
                        "target": "The board demanded that the chief executive step down with immediate effect.",
                        "mn": "Удирдах зөвлөл гүйцэтгэх захирлыг нэн даруй огцрохыг шаардав.",
                        "en": "The board demanded that the chief executive step down with immediate effect."
                    },
                    {
                        "target": "It is imperative that every transaction be verified cryptographically.",
                        "mn": "Гүйлгээ бүрийг криптограф аргаар шалган баталгаажуулах нь зайлшгүй шаардлагатай.",
                        "en": "It is imperative that every transaction be verified cryptographically."
                    }
                ],
                "common_trap": "Do not add third-person '-s' in the subjunctive clause: say 'demanded that he step down' (NOT: 'steps down' or 'stepped down').",
                "drills": [
                    {
                        "id": "en_c2_subj_drill_1",
                        "prompt_mn": "Хуралдааны өмнө бүх тайланг нухацтай хянаж үзсэн байхыг шүүгч шаардав.",
                        "target": "The magistrate insisted that all confidential records be submitted before dusk.",
                        "literal_mn": "Тэр шүүгч шаардав тэр бүх нууц тэмдэглэлүүд байх ирүүлэгдсэн өмнө бүрэнхий.",
                        "natural_mn": "Шүүгч бүх нууц бичиг баримтыг харанхуй болохоос өмнө ирүүлсэн байхыг хатуу шаардлаа.",
                        "rule_breakdown": "'insisted that ... be submitted' - Subjunctive хэлбэрт үйлдэгдэх хэв дээр 'be' хувирахгүй үндсэн хэлбэрээрээ байна.",
                        "woerterbuch": [
                            {"word": "magistrate", "pos": "noun", "meaning": "шүүгч"},
                            {"word": "insist", "pos": "verb", "meaning": "шаардах, шаардлага тавих"},
                            {"word": "confidential", "pos": "adj", "meaning": "нууц, нууцын зэрэглэлтэй"},
                            {"word": "submit", "pos": "verb", "meaning": "ирүүлэх, өгөх"}
                        ]
                    }
                ]
            },
            {
                "id": "en_c2_ellipsis_substitution",
                "title": "Ellipsis & Substitution in Sophisticated Prose",
                "core_concept": {
                    "mn": "Үгийн давталтаас зайлсхийж, өгүүлбэрийг нямбай, уран найруулгатай болгохын тулд өмнө дурдсан үг, хэллэгийг товчлох (Ellipsis) эсвэл орлуулагч хэрэглүүр (do so, one, such) ашиглах урлаг.",
                    "en": "Ellipsis omits words recoverably understood from context, while substitution uses pro-forms (do so, none, that of) to achieve syntactic economy and rhythmic elegance.",
                    "de": "Ellipse (Auslassung) und Substitution (Ersatzformen) vermeiden redundante Wiederholungen und erzeugen geschmeidige, meisterhafte Textkohärenz."
                },
                "pattern": "Omission: She wanted to contest the ruling, but decided not to [contest the ruling]. Substitution: We asked him to revise the draft, and he did so immediately.",
                "examples": [
                    {
                        "target": "Some participants opted for an early exit, others did so only after strenuous deliberation.",
                        "mn": "Зарим оролцогчид эртхэн гарахыг сонгосон бол бусад нь удаан бодож эргэцүүлсний эцэст л тэгэв.",
                        "en": "Some participants opted for an early exit, others did so only after strenuous deliberation."
                    },
                    {
                        "target": "Her grasp of syntax surpassed even that of her most revered mentors.",
                        "mn": "Түүний өгүүлбэр зүйн мэдлэг хамгийн хүндэтгэлт багш нарынх нь мэдлэгээс ч давж гарсан байв.",
                        "en": "Her grasp of syntax surpassed even that of her most revered mentors."
                    }
                ],
                "common_trap": "Use 'that of / those of' to avoid repeating nouns in comparisons: say 'The economy of Germany is larger than that of Greece' (NOT: 'larger than Greece').",
                "drills": [
                    {
                        "id": "en_c2_ell_drill_1",
                        "prompt_mn": "Тэд түүнийг ажлаа дуусгахыг хүссэн ба тэрээр хоёр ч удаа бодолгүйгээр шууд тэгсэн юм.",
                        "target": "They urged him to finalize the transaction, and he did so without hesitation.",
                        "literal_mn": "Тэд ятгав түүнийг эцэслэх тэр хэлцлийг, ба тэр хийв тэгж үгүй эргэлзээ.",
                        "natural_mn": "Тэд түүнийг хэлцлийг эцэслэн шийдэхийг ятгасан бөгөөд тэрээр огт эргэлзэлгүйгээр даруй тэгсэн юм.",
                        "rule_breakdown": "'did so' нь 'finalized the transaction' гэсэн бүтцийг орлож давталтаас сэргийлж байна.",
                        "woerterbuch": [
                            {"word": "urge", "pos": "verb", "meaning": "шаардах, ятгах"},
                            {"word": "finalize", "pos": "verb", "meaning": "эцэслэн шийдэх"},
                            {"word": "hesitation", "pos": "noun", "meaning": "эргэлзээ, тээнэгэлзэл"}
                        ]
                    }
                ]
            },
            {
                "id": "en_c2_fronting_emphasis",
                "title": "Fronting & Thematic Reordering for Stylistic Emphasis",
                "core_concept": {
                    "mn": "Өгүүлбэрийн төгсгөлд байх ёстой үйл үгт, чиглэл заасан эсвэл тэмдэг нэрийн тодотголыг хамгийн урд байрлуулан өндөр найруулга, сэтгэл хөдлөл үүсгэх бүтэц.",
                    "en": "Fronting brings adverbials, adjectives, or locative prepositions to the opening of the sentence, immediately followed by the verb, producing poetic inversion and rhetorical power.",
                    "de": "Fronting rückt Satzglieder (Ortsangaben, Adjektive, Partizipien) an die absolute Satzspitze, gefolgt von einer Inversion (z.B. Into the room stepped...)."
                },
                "pattern": "[Directional Prepositional Phrase / Adjective] + [Main Verb] + [Subject] (e.g., Down came the torrential rain)",
                "examples": [
                    {
                        "target": "Deep within the secluded valley lay the forgotten ruins of the ancient sanctuary.",
                        "mn": "Алслагдсан хөндийн гүнд эртний сүм хийдийн мартагдсан туурь дүнхийн харагдана.",
                        "en": "Deep within the secluded valley lay the forgotten ruins of the ancient sanctuary."
                    },
                    {
                        "target": "Brilliant though her initial hypothesis was, it collapsed under empirical scrutiny.",
                        "mn": "Түүний анхны таамаглал хэчнээн гайхалтай байсан ч бодит туршилтын шалгуур дор нуран унав.",
                        "en": "Brilliant though her initial hypothesis was, it collapsed under empirical scrutiny."
                    }
                ],
                "common_trap": "In full locative inversion, do NOT use dummy 'did': say 'Into the hall walked the delegates' (NOT: 'Into the hall did walk the delegates').",
                "drills": [
                    {
                        "id": "en_c2_front_drill_1",
                        "prompt_mn": "Үүлэн цоорхойгоор өглөөний нарны анхны алтан туяа гэрэлтэн тусав.",
                        "target": "Through the dense fog pierced the first golden rays of dawn.",
                        "literal_mn": "Дундуур тэр өтгөн манан нэвт хатгав тэдгээр анхны алтан цацрагууд тэр үүр цайхын.",
                        "natural_mn": "Өтгөн манангийн дундуур үүр цайхын анхны алтан туяа нэвт гэрэлтэв.",
                        "rule_breakdown": "'Through the dense fog' гэсэн чиглэл урд орж үйл үг 'pierced' эзэн бие 'the first golden rays'-ийн урд шууд орж байна.",
                        "woerterbuch": [
                            {"word": "pierce", "pos": "verb", "meaning": "нэвтлэх, тусах"},
                            {"word": "fog", "pos": "noun", "meaning": "манан"},
                            {"word": "dawn", "pos": "noun", "meaning": "үүр цайх"}
                        ]
                    }
                ]
            },
            {
                "id": "en_c2_advanced_collocations",
                "title": "Advanced Collocations & Nuanced Phrasal Verbs",
                "core_concept": {
                    "mn": "Төрөлх хэлтний өндөр түвшний нарийн холбоо үгс (z.B. unmitigated disaster, categorically deny, harbor suspicions) болон олон давхар утгатай угтвар үгт үйл үгс.",
                    "en": "C2 mastery hinges on natural fixed lexical bundles, nuanced idiomatic collocations, and register-sensitive multi-word predicates that distinguish elite fluency.",
                    "de": "Feste Kollokationen (z.B. categorically deny, unmitigated disaster) und nuancierte Phrasal Verbs kennzeichnen muttersprachliche Ausdruckskraft."
                },
                "pattern": "[Adverb + Adjective: utterly futile] | [Adverb + Verb: categorically reject] | [Verb + Noun: exercise discretion]",
                "examples": [
                    {
                        "target": "The spokesperson categorically refuted all allegations of institutional corruption.",
                        "mn": "Хэвлэлийн төлөөлөгч байгууллагын авлигатай холбоотой бүх мэдэгдлийг эрс эсэргүүцэн няцаав.",
                        "en": "The spokesperson categorically refuted all allegations of institutional corruption."
                    },
                    {
                        "target": "The proposed constitutional amendment is fraught with unforeseen diplomatic complications.",
                        "mn": "Санал болгож буй үндсэн хуулийн нэмэлт өөрчлөлт нь урьдчилан хараагүй дипломат ээдрээг дагуулах аюултай байна.",
                        "en": "The proposed constitutional amendment is fraught with unforeseen diplomatic complications."
                    }
                ],
                "common_trap": "Do not substitute synonyms arbitrarily: 'categorically deny' is natural; 'severely deny' or 'strongly reject without proof' sounds non-native.",
                "drills": [
                    {
                        "id": "en_c2_colloc_drill_1",
                        "prompt_mn": "Тэрээр санхүүгийн ноцтой хүндрэлийг даван туулахын тулд маш их тэвчээр заав.",
                        "target": "She exercised immense restraint while navigating the turbulent financial crisis.",
                        "literal_mn": "Тэр эмэгтэй гаргав асар их тэвчээр зуураа залах тэр догшин санхүүгийн хямралыг.",
                        "natural_mn": "Тэрээр санхүүгийн хүнд хямралыг гэтлэхдээ асар их тэвчээр, ухаалаг хүлээцтэй байдал гаргасан юм.",
                        "rule_breakdown": "'exercise restraint' (тэвчээр гаргах), 'turbulent crisis' (хүнд ширүүн хямрал) гэх дээд зэрэглэлийн үгсийн холбоо.",
                        "woerterbuch": [
                            {"word": "exercise", "pos": "verb", "meaning": "хэрэгжүүлэх, гаргах (тэвчээр)"},
                            {"word": "restraint", "pos": "noun", "meaning": "хүлээцтэй байдал, тэвчээр"},
                            {"word": "turbulent", "pos": "adj", "meaning": "догшин, ээдрээтэй"}
                        ]
                    }
                ]
            },
            {
                "id": "en_c2_modal_deduction",
                "title": "Nuanced Modal Deduction & Epistemic Stance",
                "core_concept": {
                    "mn": "Өнгөрсөн болон одоо цагт болсон үйл явдлын боломж, магадлалын зэргийг туйлын нарийн өнгө аястайгаар (can hardly have, might conceivably, must needs) гаргах аргууд.",
                    "en": "Epistemic stance markers modulate deductive certainty, counterfactuality, and speculation through intricate modal configurations across past and non-past planes.",
                    "de": "Nuancierte modale Deduktion drückt fein abgestufte epistemische Sicherheit und spekulative Annahmen aus (z.B. can hardly have done, might conceivably be)."
                },
                "pattern": "[Subject + can/could hardly have + V3] (near impossibility) | [Subject + might conceivably + have + V3] (remote possibility)",
                "examples": [
                    {
                        "target": "He can hardly have anticipated the unprecedented scale of the technological transformation.",
                        "mn": "Технологийн өөрчлөлтийн урьд өмнө байгаагүй ийм аугаа далайцыг тэрээр урьдчилан таамагласан байх магадлал бараг үгүй юм.",
                        "en": "He can hardly have anticipated the unprecedented scale of the technological transformation."
                    },
                    {
                        "target": "The anomaly might conceivably have arisen from a subtle hardware glitch during compilation.",
                        "mn": "Уг гажиг нь код хөрвүүлэх явцад төхөөрөмжийн нарийн саатлаас үүссэн байх магадлалтай.",
                        "en": "The anomaly might conceivably have arisen from a subtle hardware glitch during compilation."
                    }
                ],
                "common_trap": "Use 'can hardly have + V3' for near impossible past deduction, NOT 'must not have' when rejecting logical likelihood.",
                "drills": [
                    {
                        "id": "en_c2_modal_drill_1",
                        "prompt_mn": "Тэрээр ийм тодорхой нотлох баримтыг анзааралгүй өнгөрөөсөн байх учиргүй.",
                        "target": "She can hardly have overlooked such conspicuous and overwhelming evidence.",
                        "literal_mn": "Тэр эмэгтэй чадна бараг үгүй байхаар анзааралгүй өнгөрсөн тийм илэрхий бөгөөд асар их нотолгоог.",
                        "natural_mn": "Тэр эмэгтэй ийм илэрхий, хөдөлшгүй нотлох баримтыг анзааралгүй өнгөрөөнө гэж бараг байхгүй дээ.",
                        "rule_breakdown": "'can hardly have overlooked' нь өнгөрсөнд тэгсэн байх боломж бараг үгүй болохыг логикоор няцааж байна.",
                        "woerterbuch": [
                            {"word": "hardly", "pos": "adv", "meaning": "бараг үгүй"},
                            {"word": "overlook", "pos": "verb", "meaning": "анзааралгүй өнгөрөх"},
                            {"word": "conspicuous", "pos": "adj", "meaning": "нүдэнд тусахуйц, илэрхий"}
                        ]
                    }
                ]
            }
        ]
    }
    return [folder_05, folder_06]

def update_grammar_files():
    base_dir = '/root/ARL/data'
    
    # 1. Update German Grammar
    de_path = os.path.join(base_dir, 'de', 'grammar.json')
    with open(de_path, 'r', encoding='utf-8') as f:
        de_grammar = json.load(f)
    
    # Check if folder 05 already exists
    existing_de_ids = {f['folder_id'] for f in de_grammar}
    de_c1_c2 = get_de_c1_c2_folders()
    for folder in de_c1_c2:
        if folder['folder_id'] not in existing_de_ids:
            de_grammar.append(folder)
            print(f"Added German {folder['folder_id']}")
    
    with open(de_path, 'w', encoding='utf-8') as f:
        json.dump(de_grammar, f, ensure_ascii=False, indent=2)
    print("German grammar.json updated successfully. Total folders:", len(de_grammar))
    
    # 2. Update English Grammar
    en_path = os.path.join(base_dir, 'en', 'grammar.json')
    with open(en_path, 'r', encoding='utf-8') as f:
        en_grammar = json.load(f)
    
    existing_en_ids = {f['folder_id'] for f in en_grammar}
    en_c1_c2 = get_en_c1_c2_folders()
    for folder in en_c1_c2:
        if folder['folder_id'] not in existing_en_ids:
            en_grammar.append(folder)
            print(f"Added English {folder['folder_id']}")
            
    with open(en_path, 'w', encoding='utf-8') as f:
        json.dump(en_grammar, f, ensure_ascii=False, indent=2)
    print("English grammar.json updated successfully. Total folders:", len(en_grammar))

if __name__ == '__main__':
    update_grammar_files()
