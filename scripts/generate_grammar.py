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

# ========================================================
# GERMAN GRAMMAR (4 FOLDERS, 4-PART STRICT LAYOUT)
# ========================================================
de_grammar = [
    {
        "folder_id": "folder_01",
        "folder_name": "Folder 01: A1 - Foundations",
        "level": "A1",
        "topics": [
            {
                "id": "de_a1_hauptsatz",
                "title": "Hauptsatz & Verb-Zweit-Stellung (V2 Rule)",
                "core_concept": {
                    "mn": "Герман хэлний гол өгүүлбэрийн хувирсан үйл үг ЯМАГТ 2-р байранд байдаг. Энэ бол герман хэлний хамгийн үндсэн суурь дүрэм юм.",
                    "en": "In a German main clause (Hauptsatz), the conjugated verb is strictly positioned in Position 2. Whatever element begins the sentence (subject, time, location), the verb remains firmly in second position.",
                    "de": "Im deutschen Hauptsatz steht das konjugierte Verb ausnahmslos an Position 2 (V2-Regel). Steht eine Zeit- oder Ortsangabe an Position 1, folgt die Inversion (Verb vor Subjekt)."
                },
                "pattern": "Position 1 + FINITES VERB (Pos 2) + Subjekt/Ergänzungen (+ Satzende: Partizip/Infinitiv)",
                "examples": [
                    {
                        "target": "Heute lerne ich fleißig Deutsch.",
                        "mn": "Өнөөдөр би герман хэлийг хичээнгүйлэн сурч байна.",
                        "en": "Today I am diligently learning German."
                    },
                    {
                        "target": "Ich lerne heute fleißig Deutsch.",
                        "mn": "Би өнөөдөр герман хэлийг хичээнгүйлэн сурч байна.",
                        "en": "I am diligently learning German today."
                    }
                ],
                "common_trap": "Анхаарах алдаа: Цаг хугацаа (Heute, Morgen) өгүүлбэрийн эхэнд орсон үед англи хэл шиг 'Heute ich lerne...' гэж болохгүй! Заавал 'Heute lerne ich...' гэж үйл үг 2-р байрандаа байна."
            },
            {
                "id": "de_a1_kasus_nom_akk",
                "title": "Nominativ & Akkusativ (4 Cases Part 1)",
                "core_concept": {
                    "mn": "Nominativ нь өгүүлбэрийн эзэн бие (Хэн? Юу? - Wer/Was?), харин Akkusativ нь үйлийн шууд тусагдахуун (Хэнийг? Юуг? - Wen/Was?) юм.",
                    "en": "Nominative marks the grammatical subject doing the action (Who/What?). Accusative marks the direct object directly affected by the verb (Whom/What?).",
                    "de": "Der Nominativ kennzeichnet das Subjekt (Wer/Was?). Der Akkusativ markiert das direkte Objekt (Wen/Was?). Nur der maskuline Artikel ändert sich im Akkusativ: der -> den / ein -> einen."
                },
                "pattern": "Nominativ: der / die / das / die (ein / eine / ein) | Akkusativ: den / die / das / die (einen / eine / ein)",
                "examples": [
                    {
                        "target": "Der Mann kauft den neuen Tisch.",
                        "mn": "Тэр эрэгтэй шинэ ширээг худалдаж авч байна.",
                        "en": "The man buys the new table."
                    },
                    {
                        "target": "Ich habe einen interessanten Apfel gegessen.",
                        "mn": "Би нэг сонирхолтой алим идсэн.",
                        "en": "I ate an interesting apple."
                    }
                ],
                "common_trap": "Akkusativ-д ЗӨВХӨН эр хүйс (der -> den, ein -> einen) өөрчлөгддөг. Эм (die) болон саармаг (das) өөрчлөгдөхгүй хэвээр үлддэг."
            },
            {
                "id": "de_a1_praesens",
                "title": "Präsens (Present & Near Future)",
                "core_concept": {
                    "mn": "Präsens цаг нь одоо үед болж буй үйл явдал болон цаг хугацааны үгтэй хослон ойрын ирээдүйн үйлийг илэрхийлнэ.",
                    "en": "Präsens expresses ongoing actions, timeless facts, and near-future scheduled events when accompanied by a time marker.",
                    "de": "Das Präsens drückt gegenwärtige Handlungen, allgemeingültige Tatsachen sowie nahe zukünftige Ereignisse mit Zeitangabe aus."
                },
                "pattern": "Stamm + Endung: ich -e, du -(s)t, er/sie/es -t, wir -en, ihr -t, sie/Sie -en (Umlaut bei a->ä, e->i/ie bei du/er/sie/es)",
                "examples": [
                    {
                        "target": "Morgen fahre ich nach Berlin.",
                        "mn": "Маргааш би Берлин рүү явна.",
                        "en": "Tomorrow I travel to Berlin."
                    },
                    {
                        "target": "Er spricht fließend drei Sprachen.",
                        "mn": "Тэр гурван хэлээр чөлөөтэй ярьдаг.",
                        "en": "He speaks three languages fluently."
                    }
                ],
                "common_trap": "Хүчтэй үйл үгс (fahren, sprechen, lesen) 2 ба 3-р биед эгшиг хувирдаг (du fährst, er liest) гэдгийг мартаж болохгүй."
            },
            {
                "id": "de_a1_modalverben",
                "title": "Modalverben (können, müssen, dürfen, sollen, wollen, möchten)",
                "core_concept": {
                    "mn": "Байдлын үйл үгс нь тухайн үйлийг хийх чадвар (können), шаардлага (müssen), зөвшөөрөл (dürfen), үүрэг (sollen), хүсэл эрмэлзлийг (wollen/möchten) заана.",
                    "en": "Modal verbs express the attitude towards an action: ability (können), necessity (müssen), permission (dürfen), advice/duty (sollen), intention (wollen), wish (möchten).",
                    "de": "Modalverben modifizieren die Aussage des Vollverbs bezüglich Möglichkeit, Notwendigkeit, Erlaubnis, Gebot oder Wunsch."
                },
                "pattern": "Position 2: Konjugiertes Modalverb + ... + Satzende: VOLLVERB IM INFINITIV",
                "examples": [
                    {
                        "target": "Ich muss heute lange arbeiten.",
                        "mn": "Би өнөөдөр удаан ажиллах шаардлагатай байна.",
                        "en": "I must work long hours today."
                    },
                    {
                        "target": "Hier darf man leider nicht rauchen.",
                        "mn": "Энд харамсалтай нь тамхи татах хориотой.",
                        "en": "Unfortunately, smoking is not permitted here."
                    }
                ],
                "common_trap": "Өгүүлбэрийн төгсгөлд үндсэн үйл үг ЯМАГТ хувиралгүй хувилахгүй инфинитив (Infinitiv) хэлбэрээр байх ёстой: 'Ich kann Deutsch sprechen' (биш: 'Ich kann Deutsch spreche')."
            }
        ]
    },
    {
        "folder_id": "folder_02",
        "folder_name": "Folder 02: A2 - Core Structures",
        "level": "A2",
        "topics": [
            {
                "id": "de_a2_dativ",
                "title": "Dativ (4 Cases Part 2)",
                "core_concept": {
                    "mn": "Дативын тийн ялгал нь 'Хэнд? Юунд?' (Wem?) гэсэн асуултад хариулагдаж, үйлийн хүртэгч (шууд бус тусагдахуун)-ийг заана.",
                    "en": "The Dative case marks the recipient or indirect beneficiary of an action (To whom / For whom?). It is also required after dative prepositions (aus, bei, mit, nach, seit, von, zu).",
                    "de": "Der Dativ bezeichnet das indirekte Objekt (Wem-Fall) und steht nach festen Dativ-Präpositionen sowie Verben wie helfen, danken, gefallen, gehören."
                },
                "pattern": "dem (Maskulin) / der (Feminin) / dem (Neutral) / den + -n (Plural) | einem / einer / einem",
                "examples": [
                    {
                        "target": "Ich helfe der netten Kollegin.",
                        "mn": "Би тэр эелдэг хамтран ажиллагчдаа тусалж байна.",
                        "en": "I am helping the friendly colleague."
                    },
                    {
                        "target": "Das Buch gehört dem Schüler.",
                        "mn": "Энэ ном сурагчийнх.",
                        "en": "The book belongs to the student."
                    }
                ],
                "common_trap": "Дативын олон тоонд (Plural Dativ) нэр үгийн төгсгөлд заавал '-n' залгагдана: 'mit den Freunden' (биш: 'mit den Freunde'). Хэрэв үг аль хэдийн '-s' эсвэл '-n'-ээр төгссөн бол нэмэхгүй."
            },
            {
                "id": "de_a2_perfekt",
                "title": "Perfekt (haben/sein + Partizip II)",
                "core_concept": {
                    "mn": "Ярианы герман хэлэнд өнгөрсөн цагийг илэрхийлэх хамгийн гол цаг бол Перфект юм.",
                    "en": "Perfekt is the primary past tense used in spoken German. It uses the auxiliary 'haben' (for most verbs) or 'sein' (for movement/change of state verbs) plus Partizip II at the end.",
                    "de": "Das Perfekt ist die dominante Zeitform der gesprochenen Sprache für die Vergangenheit. Bildung: Hilfsverb haben/sein an Pos 2 + Partizip II am Satzende."
                },
                "pattern": "Subjekt + haben/sein (konjugiert) + ... + PARTIZIP II (ge-...-t / ge-...-en)",
                "examples": [
                    {
                        "target": "Wir sind gestern nach München gefahren.",
                        "mn": "Бид өчигдөр Мюнхен рүү явсан.",
                        "en": "We drove to Munich yesterday."
                    },
                    {
                        "target": "Er hat die E-Mail bereits geschrieben.",
                        "mn": "Тэр цахим захидлыг аль хэдийн бичсэн.",
                        "en": "He has already written the email."
                    }
                ],
                "common_trap": "'Sein'-ийг байрлалын шилжилт (gehen, fahren, fliegen, kommen) болон төлөв байдлын өөрчлөлт (aufstehen, einschlafen, sterben), мөн sein, bleiben, werden үйл үгсэд хэрэглэнэ."
            },
            {
                "id": "de_a2_praeteritum",
                "title": "Präteritum (war, hatte & Modalverben)",
                "core_concept": {
                    "mn": "Ярианд haben (hatte), sein (war) болон байдлын үйл үгсийг (musste, konnte, wollte) Перфект гэхээсээ илүү Präteritum-ээр ярьдаг.",
                    "en": "Even in spoken German, 'haben' (hatte), 'sein' (war), and modal verbs (konnte, musste, durfte, wollte) are almost exclusively used in Präteritum instead of Perfekt.",
                    "de": "In der Alltagssprache werden haben, sein und die Modalverben im Präteritum bevorzugt, da die Konstruktion knapper und natürlicher ist als Perfekt."
                },
                "pattern": "war / warst / war / waren | hatte / hattest / hatte / hatten | konnte, musste, durfte, wollte, sollte",
                "examples": [
                    {
                        "target": "Gestern war ich den ganzen Tag krank.",
                        "mn": "Өчигдөр би бүтэн өдөржин өвчтэй байсан.",
                        "en": "Yesterday I was sick the whole day."
                    },
                    {
                        "target": "Er hatte leider keine Zeit für das Treffen.",
                        "mn": "Харамсалтай нь түүнд уулзалтад зориулах цаг байгаагүй.",
                        "en": "Unfortunately, he had no time for the meeting."
                    }
                ],
                "common_trap": "Präteritum-д 1 ба 3-р биеийн төгсгөл үргэлж ижил бөгөөд '-t' төгсгөл авдаггүй: 'ich war' / 'er war' (биш: 'er wart'). 'ich musste' / 'er musste'."
            },
            {
                "id": "de_a2_wechselpraepositionen",
                "title": "Wechselpräpositionen (an, auf, hinter, in, neben, über, unter, vor, zwischen)",
                "core_concept": {
                    "mn": "Эдгээр 9 угтвар үг нь хөдөлгөөний чиглэл заавал (Хаашаа? - Wohin?) Akkusativ, харин тогтсон байрлал заавал (Хаана? - Wo?) Dativ авдаг.",
                    "en": "These 9 two-way prepositions take Accusative when indicating direction/movement toward a goal (Wohin? Where to?) and Dative when indicating stationary location (Wo? Where?).",
                    "de": "Wechselpräpositionen regieren Akkusativ bei Richtungsangabe (Wohin?) und Dativ bei Ortsangabe (Wo?)."
                },
                "pattern": "Wohin? (Richtung / Ziel) -> AKKUSATIV | Wo? (Position / Zustand) -> DATIV",
                "examples": [
                    {
                        "target": "Ich lege das Buch auf den Tisch. (Wohin? -> Akk)",
                        "mn": "Би номыг ширээн дээр тавьж байна. (Хаашаа? -> Аккузатив)",
                        "en": "I put the book on the table. (Where to? -> Acc)"
                    },
                    {
                        "target": "Das Buch liegt auf dem Tisch. (Wo? -> Dat)",
                        "mn": "Ном ширээн дээр байна. (Хаана? -> Датив)",
                        "en": "The book is lying on the table. (Where? -> Dat)"
                    }
                ],
                "common_trap": "Үйл үгс хосоороо байдгийг анхаар: stellen/stehen, legen/liegen, setzen/sitzen, hängen/hängen. Эхнийх нь хөдөлгөөн (Akk), хоёр дахь нь байрлал (Dat)."
            },
            {
                "id": "de_a2_reflexive",
                "title": "Reflexive Verben (sich freuen, sich fühlen)",
                "core_concept": {
                    "mn": "Үйлийн эзэн өөрөө өөр дээрээ үйлдэл хийх эсвэл тухайн үйл үг нь угаасаа 'sich' төлөөний үгтэйгээ хамт хэрэглэгддэг.",
                    "en": "Reflexive verbs involve an action directed back at the subject, using reflexive pronouns (mich/dich/sich/uns/euch/sich). Most take Accusative, but if there is already an accusative object, the reflexive pronoun becomes Dative.",
                    "de": "Reflexive Verben nutzen Reflexivpronomen im Akkusativ (Standard) oder Dativ (wenn bereits ein Akkusativobjekt im Satz steht, z.B. 'Ich wasche mir die Hände')."
                },
                "pattern": "Subjekt + Verb + Reflexivpronomen (mich/mir, dich/dir, sich, uns, euch, sich)",
                "examples": [
                    {
                        "target": "Ich freue mich über das schöne Geschenk.",
                        "mn": "Би энэ сайхан бэлгэнд баярлаж байна.",
                        "en": "I am pleased about the nice present."
                    },
                    {
                        "target": "Er wäscht sich gründlich die Hände.",
                        "mn": "Тэр гараа сайтар угааж байна.",
                        "en": "He is washing his hands thoroughly."
                    }
                ],
                "common_trap": "'Ich wasche mich' (Akk), гэхдээ 'Ich wasche mir die Hände' (гам гараа угаах үед 'die Hände' нь Akkusativ болж, төлөөний үг нь Dativ 'mir' болдог)."
            }
        ]
    },
    {
        "folder_id": "folder_03",
        "folder_name": "Folder 03: B1 - Intermediate Mastery",
        "level": "B1",
        "topics": [
            {
                "id": "de_b1_nebensatz",
                "title": "Nebensätze & Verb-Ende (weil, dass, wenn, obwohl)",
                "core_concept": {
                    "mn": "Герман хэлний хамаат өгүүлбэрт (Nebensatz) холбоос үгийн дараа хувирсан үйл үг ЯМАГТ өгүүлбэрийн хамгийн төгсгөлд очдог.",
                    "en": "In a German subordinate clause introduced by subordinating conjunctions (weil, dass, wenn, obwohl, da, ob), the conjugated verb is pushed to the very end of the clause.",
                    "de": "Subordinierende Konjunktionen leiten Nebensätze ein, in denen das finite Verb zwingend an die letzte Stelle des Satzes rückt (Nebensatz-Klammer)."
                },
                "pattern": "Hauptsatz, + Konjunktion (weil/dass/wenn) + Subjekt + ... + FINITES VERB AM ENDE",
                "examples": [
                    {
                        "target": "Ich lerne Deutsch, weil ich in Deutschland studieren möchte.",
                        "mn": "Би Герман улсад сурахыг хүсэж байгаа учраас герман хэл сурч байна.",
                        "en": "I learn German because I would like to study in Germany."
                    },
                    {
                        "target": "Obwohl es stark regnete, machten wir einen Spaziergang.",
                        "mn": "Ширүүн бороо орж байсан боловч бид зугаалсан.",
                        "en": "Although it rained heavily, we went for a walk."
                    }
                ],
                "common_trap": "Хэрэв өгүүлбэр Nebensatz-аар эхэлбэл дараагийн Hauptsatz шууд үйл үгээр эхэлнэ: 'Weil es regnet, BLEIBE ich zu Hause' (Verbal-Knoten)."
            },
            {
                "id": "de_b1_genitiv",
                "title": "Genitiv (4 Cases Part 3)",
                "core_concept": {
                    "mn": "Генитив нь хамаатуулах утга (Хэний? Юуны? - Wessen?) болон зарим угтвар үгсийн (während, wegen, trotz, statt) дараа хэрэглэгддэг.",
                    "en": "The Genitive case expresses possession or belonging (Whose? Wessen?) and follows specific formal prepositions (während, wegen, trotz, anstatt).",
                    "de": "Der Genitiv bezeichnet Besitz oder Zugehörigkeit (Wessen-Fall) und steht nach Genitiv-Präpositionen wie wegen, während, trotz, anstelle."
                },
                "pattern": "des + -(e)s (Mask/Neut) | der (Fem/Plur) | eines + -(e)s | einer",
                "examples": [
                    {
                        "target": "Trotz des schlechten Wetters kamen viele Gäste.",
                        "mn": "Цаг агаар муу байсан хэдий ч олон зочид ирсэн.",
                        "en": "Despite the bad weather, many guests came."
                    },
                    {
                        "target": "Das ist das Auto meines Vaters.",
                        "mn": "Энэ бол миний аавын машин.",
                        "en": "That is my father's car."
                    }
                ],
                "common_trap": "Эр ба саармаг хүйс дээр нэр үгэнд заавал '-s' эсвэл '-es' залгагдана: 'des Hauses', 'des Mannes', 'des Tages'."
            },
            {
                "id": "de_b1_konjunktiv2",
                "title": "Konjunktiv II (Wünsche, Höflichkeit, Irreales)",
                "core_concept": {
                    "mn": "Бодит бус хүсэл, эелдэг хүсэлт, төсөөллийн нөхцөлийг илэрхийлэхэд Konjunktiv II (würde + Infinitiv, wäre, hätte) ашигладаг.",
                    "en": "Konjunktiv II expresses unreal wishes, hypothetical conditions, and polite requests. Usually formed with 'würde + Infinitive', but 'wäre' and 'hätte' are used directly.",
                    "de": "Der Konjunktiv II dient dem Ausdruck von Höflichkeit, hypothetischen Bedingungen und irrealen Wünschen."
                },
                "pattern": "würde + Infinitiv am Ende | wäre (sein) | hätte (haben) | könnte / müsste (Modalverben)",
                "examples": [
                    {
                        "target": "Könnten Sie mir bitte helfen?",
                        "mn": "Та надад тусалж чадах болов уу? (маш эелдэг)",
                        "en": "Could you please help me?"
                    },
                    {
                        "target": "Wenn ich mehr Zeit hätte, würde ich mehr reisen.",
                        "mn": "Надад илүү их цаг байсан бол би илүү их аялах байсан.",
                        "en": "If I had more time, I would travel more."
                    }
                ],
                "common_trap": "'sein' болон 'haben'-д 'würde sein/würde haben' гэж хэлэхгүй! Заавал шууд 'wäre' болон 'hätte' гэж хэрэглэнэ."
            },
            {
                "id": "de_b1_passiv_vorgang",
                "title": "Vorgangspassiv (werden + Partizip II)",
                "core_concept": {
                    "mn": "Үйлийн эзэн бус, харин үйл явц өөрөө чухал үед үйлдүүлэгч хэв (Пассив)-ийг ашигладаг.",
                    "en": "Vorgangspassiv focuses on the action taking place rather than who performs it. Formed with conjugated 'werden' + Partizip II at the end of the clause.",
                    "de": "Das Vorgangspassiv stellt den Handlungsvorgang ins Zentrum. Das Subjekt des Aktivsatzes entfällt oder wird mit 'von + Dativ' angefügt."
                },
                "pattern": "Subjekt + werden (konjugiert) + ... + PARTIZIP II",
                "examples": [
                    {
                        "target": "Das neue Museum wird heute eröffnet.",
                        "mn": "Шинэ музей өнөөдөр нээгдэж байна.",
                        "en": "The new museum is being opened today."
                    },
                    {
                        "target": "Der Bericht wurde gestern von den Experten verfasst.",
                        "mn": "Тайланг өчигдөр шинжээчид бичиж бэлтгэсэн.",
                        "en": "The report was drafted yesterday by the experts."
                    }
                ],
                "common_trap": "Үйлийн эзнийг дурдахдаа 'von + Dativ' (хүмүүс, байгууллага) эсвэл 'durch + Akkusativ' (хэрэгсэл, арга зам) ашиглана."
            },
            {
                "id": "de_b1_relativsatz",
                "title": "Relativsätze (der, die, das in Nom, Akk, Dat)",
                "core_concept": {
                    "mn": "Нэр үгийг тодотгож, нэмэлт тайлбар өгөх хамаат өгүүлбэр. Хамаатуулах төлөөний үгийн хүйс нь өмнөх үгнээсээ, тийн ялгал нь хамаат өгүүлбэрийнхээ үүргээс шалтгаална.",
                    "en": "Relative clauses provide descriptive detail about a noun. The gender and number match the antecedent noun, while the case is determined by its role inside the relative clause.",
                    "de": "Relativsätze werden mit Relativpronomen eingeleitet. Genus und Numerus richten sich nach dem Bezugswort, der Kasus nach der Funktion im Relativsatz."
                },
                "pattern": "Nomen, + Relativpronomen (der/die/das/dem/den/denen) + ... + FINITES VERB AM ENDE",
                "examples": [
                    {
                        "target": "Das ist der Kollege, den ich gestern kennengelernt habe. (Akkusativ)",
                        "mn": "Энэ бол миний өчигдөр танилцсан хамтран ажиллагч.",
                        "en": "That is the colleague whom I met yesterday."
                    },
                    {
                        "target": "Das ist die Frau, der ich geholfen habe. (Dativ)",
                        "mn": "Энэ бол миний тусалсан эмэгтэй.",
                        "en": "That is the woman whom I helped."
                    }
                ],
                "common_trap": "Олон тооны Датив хамаатуулах төлөөний үг нь 'den' биш, харин 'denen' байдаг: 'die Freunde, mit denen ich reise'."
            },
            {
                "id": "de_b1_zu_infinitiv",
                "title": "Infinitiv mit zu (um...zu, ohne...zu, anstatt...zu)",
                "core_concept": {
                    "mn": "Өгүүлбэрийн хоёр хэсэг ижил эзэн биетэй үед зорилго (um...zu), үгүйсгэл (ohne...zu) илэрхийлэн үйл үгийг 'zu + Infinitiv'-ээр төгсгөдөг.",
                    "en": "Infinitive clauses with 'zu' occur when the subject is identical to the main clause: 'um...zu' (in order to), 'ohne...zu' (without doing), 'anstatt...zu' (instead of doing).",
                    "de": "Infinitivsätze mit zu werden verwendet, wenn das logische Subjekt mit dem Hauptsatzsubjekt identisch ist."
                },
                "pattern": "um / ohne / anstatt + ... + (trennbare Verben: ...-zu-...) + INFINITIV",
                "examples": [
                    {
                        "target": "Ich lerne fleißig, um die B1-Prüfung zu bestehen.",
                        "mn": "Би B1 шалгалтаа давахын тулд хичээнгүйлэн сурч байна.",
                        "en": "I study diligently in order to pass the B1 exam."
                    },
                    {
                        "target": "Er ging weg, ohne ein Wort zu sagen.",
                        "mn": "Тэр нэг ч үг дуугаралгүйгээр явчихсан.",
                        "en": "He walked away without saying a word."
                    }
                ],
                "common_trap": "Салдаг угтвартай үйл үгэнд (anfangen, aufstehen) 'zu' нь үгийн ДУНД орно: 'anzufangen', 'aufzustehen'."
            }
        ]
    },
    {
        "folder_id": "folder_04",
        "folder_name": "Folder 04: B2 - Advanced Precision",
        "level": "B2",
        "topics": [
            {
                "id": "de_b2_tekamolo",
                "title": "Tekamolo (Wortstellung der Angaben)",
                "core_concept": {
                    "mn": "Герман өгүүлбэрийн дунд хэсэгт олон тодотгол байвал: Түрүүлж Цаг (Temporal), дараа нь Шалтгаан (Kausal), дараа нь Байдал (Modal), эцэст нь Байрлал (Lokal) гэсэн дарааллаар ордог.",
                    "en": "The TeKaMoLo rule governs the natural sequence of adverbial phrases in the German middle field: Temporal (When?) -> Kausal (Why?) -> Modal (How?) -> Lokal (Where?).",
                    "de": "Die TeKaMoLo-Regel bestimmt die Standardabfolge adverbialer Bestimmungen im Mittelfeld: Temporal vor Kausal vor Modal vor Lokal."
                },
                "pattern": "Subjekt + Verb + TEMPORAL (wann?) + KAUSAL (warum?) + MODAL (wie?) + LOKAL (wohin/wo?) + Verbende",
                "examples": [
                    {
                        "target": "Ich fahre morgen (Te) wegen des Streiks (Ka) mit dem Fahrrad (Mo) zur Arbeit (Lo).",
                        "mn": "Би маргааш (Te) ажил хаялтын улмаас (Ka) дугуйгаар (Mo) ажил руугаа (Lo) явна.",
                        "en": "Tomorrow I will ride to work by bicycle due to the strike."
                    }
                ],
                "common_trap": "Байршил (Lokal) нь англи хэл шиг эхэнд биш, герман өгүүлбэрийн хамгийн сүүлд үйл үгийн төгсгөлийн яг өмнө тавигддаг."
            },
            {
                "id": "de_b2_zweiteilige_konnektoren",
                "title": "Zweiteilige Konnektoren (je...desto, zwar...aber)",
                "core_concept": {
                    "mn": "Хоёр хэсэгт холбоосууд нь нарийн логик хамаарлыг (хэдий чинээ... төдий чинээ, хэдийгээр... боловч) илэрхийлдэг академик түвшний бүтэц юм.",
                    "en": "Two-part connectors link complex logical ideas: je...desto (the more...the more), zwar...aber (admittedly...but), sowohl...als auch (both...and), weder...noch (neither...nor).",
                    "de": "Doppelkonnektoren verbinden Sätze und Satzteile mit präzisen logischen Verknüpfungen (proportional, konzessiv, kopulativ)."
                },
                "pattern": "Je + Komparativ + ... + Verb am Ende, desto/umso + Komparativ + Verb (Pos 2) + Subjekt...",
                "examples": [
                    {
                        "target": "Je mehr man übt, desto sicherer wird man beim Sprechen.",
                        "mn": "Хэдий чинээ их давтана, төдий чинээ ярихдаа өөртөө итгэлтэй болно.",
                        "en": "The more one practices, the more confident one becomes when speaking."
                    },
                    {
                        "target": "Er spricht zwar gutes Deutsch, aber er hat noch Hemmungen.",
                        "mn": "Тэр германаар сайн ярьдаг нь үнэн боловч, жаахан биеэ барьсан хэвээр байна.",
                        "en": "He admittedly speaks good German, but he is still hesitant."
                    }
                ],
                "common_trap": "'Je'-тэй хэсэг нь Nebensatz (үйл үг төгсгөлд), харин 'desto'-той хэсэг нь Hauptsatz (харьцуулсан зэргийн дараа үйл үг 2-р байранд) байна."
            },
            {
                "id": "de_b2_nvv",
                "title": "Nomen-Verb-Verbindungen (Funktionsverbgefüge)",
                "core_concept": {
                    "mn": "Энгийн үйл үгийн оронд 'Нэр үг + Үйл үг' хоршин хэрэглэгдэх нь албан болон эрдэм шинжилгээний герман хэлний гол хэв маяг юм.",
                    "en": "Noun-Verb collocations (Funktionsverbgefüge) replace single verbs with a noun + functional verb combo, characteristic of formal, professional, and academic German.",
                    "de": "Funktionsverbgefüge (z.B. 'zur Verfügung stehen' statt 'vorhanden sein') verleihen Texten einen gehobenen, sachlichen Stil."
                },
                "pattern": "Nomen (+ Präposition) + Funktionsverb (stehen, stellen, bringen, nehmen, ziehen)",
                "examples": [
                    {
                        "target": "Die Daten stehen den Forschern jederzeit zur Verfügung. (= sind verfügbar)",
                        "mn": "Мэдээлэл судлаачдын мэдэлд хэзээд бэлэн байна.",
                        "en": "The data is at the researchers' disposal at all times."
                    },
                    {
                        "target": "Wir müssen alle relevanten Faktoren in Betracht ziehen. (= berücksichtigen)",
                        "mn": "Бид холбогдох бүх хүчин зүйлсийг харгалзан үзэх ёстой.",
                        "en": "We must take all relevant factors into consideration."
                    }
                ],
                "common_trap": "Угтвар үг ба үйлийг хольж болохгүй: 'zur Verfügung STEHEN' (идэвхгүй/бэлэн байх) vs 'zur Verfügung STELLEN' (идэвхтэй/бэлдэж өгөх)."
            },
            {
                "id": "de_b2_passiv_zustand",
                "title": "Zustandspassiv & Passiv-Alternativen",
                "core_concept": {
                    "mn": "Үйл явц биш, харин дууссан үйлийн үр дүнд бий болсон тогтвортой төлөв байдлыг Zustandspassiv (sein + Partizip II) заана.",
                    "en": "Zustandspassiv (sein + Partizip II) describes the finished result or condition resulting from a previous action, not the process itself.",
                    "de": "Das Zustandspassiv (sein + Partizip II) beschreibt den erreichten Zustand nach Abschluss einer Handlung, im Unterschied zum Vorgangspassiv (werden)."
                },
                "pattern": "Subjekt + sein (konjugiert) + ... + PARTIZIP II",
                "examples": [
                    {
                        "target": "Das Fenster ist geschlossen. (Zustand: Es ist jetzt zu)",
                        "mn": "Цонх хаалттай байна. (Төлөв байдал: Одоо хаалттай байгаа)",
                        "en": "The window is closed. (Condition: it is now shut)"
                    },
                    {
                        "target": "Das Fenster wird geschlossen. (Vorgang: Jemand schließt es gerade)",
                        "mn": "Цонх хаагдаж байна. (Үйл явц: Хэн нэгэн хааж байна)",
                        "en": "The window is being closed. (Process: someone is closing it)"
                    }
                ],
                "common_trap": "'werden'-тэй бол үйл явц (Vorgang), харин 'sein'-тэй бол дууссан төлөв (Zustand)."
            },
            {
                "id": "de_b2_plusquamperfekt_futur",
                "title": "Plusquamperfekt & Futur I",
                "core_concept": {
                    "mn": "Plusquamperfekt (өнгөрсний өмнөх өнгөрсөн) нь өнгөрсөн цагт болсон хоёр үйлийн аль эхэлж болсныг, Futur I (werden + Infinitiv) нь ирээдүй болон таамаглалыг илэрхийлнэ.",
                    "en": "Plusquamperfekt expresses actions completed before another past event (hatte/war + Partizip II). Futur I expresses future intentions or present assumptions (werden + Infinitive).",
                    "de": "Das Plusquamperfekt drückt Vorzeitigkeit in der Vergangenheit aus (nachdem). Futur I drückt Zukünftiges oder Vermutungen in der Gegenwart aus."
                },
                "pattern": "Plusquamperfekt: hatte/war + Partizip II | Futur I: werden + Infinitiv am Satzende",
                "examples": [
                    {
                        "target": "Nachdem er die Prüfung bestanden hatte, feierte er mit Freunden.",
                        "mn": "Тэр шалгалтаа өгч дууссаныхаа дараа найзуудтайгаа тэмдэглэсэн.",
                        "en": "After he had passed the exam, he celebrated with friends."
                    },
                    {
                        "target": "Er wird wohl im Büro sein. (Vermutung)",
                        "mn": "Тэр оффисдоо байгаа байх. (Таамаглал)",
                        "en": "He is probably in the office. (Assumption)"
                    }
                ],
                "common_trap": "'Nachdem' холбоос орсон өгүүлбэрт цагийн уялдах хууль үйлчилнэ: Nachdem + Plusquamperfekt, Hauptsatz + Präteritum."
            }
        ]
    }
]

with open('data/de/grammar.json', 'w', encoding='utf-8') as f:
    json.dump(nfc(de_grammar), f, ensure_ascii=False, indent=2)
print("Saved data/de/grammar.json with 4 folders.")

# ========================================================
# ENGLISH GRAMMAR (4 FOLDERS, 4-PART STRICT LAYOUT)
# ========================================================
en_grammar = [
    {
        "folder_id": "folder_01",
        "folder_name": "Folder 01: A1 - Foundations",
        "level": "A1",
        "topics": [
            {
                "id": "en_a1_present_simple_cont",
                "title": "Present Simple vs Present Continuous",
                "core_concept": {
                    "mn": "Present Simple нь тогтмол зуршил, баримтыг заадаг бол Present Continuous нь яг одоо ярьж байх агшинд болж буй түр зуурын үйлийг заана.",
                    "en": "Present Simple expresses habits, routines, and permanent truths. Present Continuous expresses temporary actions happening right now at the time of speaking.",
                    "de": "Present Simple drückt Gewohnheiten und Fakten aus. Present Continuous beschreibt Handlungen, die im Moment des Sprechens ablaufen."
                },
                "pattern": "Simple: Subject + V1(s/es) | Continuous: Subject + am/is/are + V-ing",
                "examples": [
                    {
                        "target": "I usually drink tea, but today I am drinking coffee.",
                        "mn": "Би ихэвчлэн цай уудаг боловч өнөөдөр кофе ууж байна.",
                        "en": "I usually drink tea, but today I am drinking coffee."
                    }
                ],
                "common_trap": "Stative verbs (like, know, understand, believe, want) are not used in continuous forms: 'I understand' (NOT: 'I am understanding')."
            },
            {
                "id": "en_a1_past_simple",
                "title": "Past Simple (Regular & Irregular Verbs)",
                "core_concept": {
                    "mn": "Өнгөрсөнд тодорхой цаг хугацаанд эхэлж дууссан үйлийг Past Simple-ээр илэрхийлнэ.",
                    "en": "Past Simple describes completed actions at a definite time in the past.",
                    "de": "Past Simple beschreibt abgeschlossene Handlungen zu einem bestimmten vergangenen Zeitpunkt."
                },
                "pattern": "Affirmative: Subject + V2 (-ed or irregular) | Negative: did not + V1 | Question: Did + Subject + V1?",
                "examples": [
                    {
                        "target": "She went to London last summer.",
                        "mn": "Тэр өнгөрсөн зун Лондон руу явсан.",
                        "en": "She went to London last summer."
                    },
                    {
                        "target": "Did you see that documentary yesterday?",
                        "mn": "Та өчигдөр тэр баримтат киног үзсэн үү?",
                        "en": "Did you see that documentary yesterday?"
                    }
                ],
                "common_trap": "After 'did' or 'didn't', the main verb reverts to base form V1: 'Did you go?' (NOT: 'Did you went?')."
            },
            {
                "id": "en_a1_articles",
                "title": "Articles (a/an, the, zero article)",
                "core_concept": {
                    "mn": "'a/an' нь ерөнхий, анх удаа дурдагдаж буй тоологдох ганц тооны нэр дээр; 'the' нь тодорхой, хоёр тал хоёулаа мэдэх зүйл дээр ашиглагдана.",
                    "en": "'A/an' is indefinite for singular countable nouns mentioned for the first time. 'The' is definite when both speaker and listener know which specific item is meant.",
                    "de": "'A/an' steht bei unbestimmten zählbaren Nomen im Singular. 'The' bezeichnet ein bestimmtes, bekanntes Nomen."
                },
                "pattern": "a + consonant sound | an + vowel sound | the + specific singular/plural | zero article + general plurals/uncountables",
                "examples": [
                    {
                        "target": "I saw an elephant. The elephant was enormous.",
                        "mn": "Би нэг заан харсан. Тэр заан үнэхээр том байсан.",
                        "en": "I saw an elephant. The elephant was enormous."
                    }
                ],
                "common_trap": "Use 'an' before vowel sounds, not just letters: 'an hour' (h is silent), but 'a university' (starts with 'y' sound)."
            }
        ]
    },
    {
        "folder_id": "folder_02",
        "folder_name": "Folder 02: A2 - Core Structures",
        "level": "A2",
        "topics": [
            {
                "id": "en_a2_present_perfect",
                "title": "Present Perfect Simple (Experience & Unfinished Time)",
                "core_concept": {
                    "mn": "Өнгөрсөнд болсон боловч одоо үетэй шууд холбоотой, эсвэл амьдралын туршлагыг (ever/never/already/yet) илэрхийлнэ.",
                    "en": "Present Perfect connects past actions with the present: past experiences with no fixed time, or situations continuing up to now.",
                    "de": "Present Perfect verbindet Vergangenheit mit Gegenwart: Erfahrungen und noch andauernde Zeiträume."
                },
                "pattern": "Subject + have/has + Past Participle (V3)",
                "examples": [
                    {
                        "target": "Have you ever visited Japan?",
                        "mn": "Та урьд нь Японд очиж үзсэн үү?",
                        "en": "Have you ever visited Japan?"
                    },
                    {
                        "target": "I have lived here for five years.",
                        "mn": "Би энд таван жил амьдарч байна.",
                        "en": "I have lived here for five years."
                    }
                ],
                "common_trap": "Never use specific past time words (yesterday, in 2020, two days ago) with Present Perfect. Use Past Simple instead."
            },
            {
                "id": "en_a2_future_forms",
                "title": "Future Forms (will vs going to vs Present Continuous)",
                "core_concept": {
                    "mn": "'will' нь агшин зуурын шийдвэр, таамаглал; 'be going to' нь урьдчилан төлөвлөсөн санаа, баттай шинж тэмдэг; Present Continuous нь товлогдсон цаг товтой үйлийг заана.",
                    "en": "'Will' is for spontaneous decisions and predictions. 'Be going to' is for intentions and observable evidence. Present Continuous is for fixed scheduled arrangements.",
                    "de": "'Will' für spontane Entschlüsse. 'Be going to' für Pläne und evidente Vorzeichen. Present Continuous für feste Verabredungen."
                },
                "pattern": "will + V1 | am/is/are going to + V1 | am/is/are + V-ing",
                "examples": [
                    {
                        "target": "Look at those dark clouds! It is going to rain.",
                        "mn": "Тэр хар үүлсийг хараач! Бороо орох гэж байна.",
                        "en": "Look at those dark clouds! It is going to rain."
                    },
                    {
                        "target": "I will carry that heavy bag for you.",
                        "mn": "Би тэр хүнд цүнхийг чинь өргөөд өгье.",
                        "en": "I will carry that heavy bag for you."
                    }
                ],
                "common_trap": "Do not use 'will' for plans made beforehand: 'I am going to visit my doctor tomorrow' (NOT: 'I will visit my doctor tomorrow')."
            },
            {
                "id": "en_a2_modals_obligation",
                "title": "Modals of Obligation & Ability (can, must, should, have to)",
                "core_concept": {
                    "mn": "'must' нь дотоод чухал шаардлага, 'have to' нь гаднын дүрэм журам, 'should' нь зөвлөгөө, 'can/could' нь чадварыг заана.",
                    "en": "'Must' expresses strong internal necessity. 'Have to' expresses external rules/laws. 'Should' gives advice. 'Can' expresses ability or permission.",
                    "de": "'Must' drückt persönliche Notwendigkeit aus, 'have to' externe Regeln, 'should' Ratschläge, 'can' Fähigkeit."
                },
                "pattern": "Modal + Base Verb (V1) (no 'to', except 'have to')",
                "examples": [
                    {
                        "target": "You should drink more water every day.",
                        "mn": "Та өдөр бүр илүү их ус ууж байх хэрэгтэй. (зөвлөгөө)",
                        "en": "You should drink more water every day."
                    },
                    {
                        "target": "In Britain, drivers have to drive on the left.",
                        "mn": "Их Британид жолооч нар зүүн гараа барьж явах ёстой.",
                        "en": "In Britain, drivers have to drive on the left."
                    }
                ],
                "common_trap": "'Must not' means prohibited (хориотой), whereas 'don't have to' means not necessary (албагүй, шаардлагагүй)."
            }
        ]
    },
    {
        "folder_id": "folder_03",
        "folder_name": "Folder 03: B1 - Intermediate Mastery",
        "level": "B1",
        "topics": [
            {
                "id": "en_b1_conditionals_012",
                "title": "Conditionals (Zero, First & Second)",
                "core_concept": {
                    "mn": "Zero нь шинжлэх ухааны баримт; 1st нь ирээдүйд бодитой биелэх магадлалтай нөхцөл; 2nd нь одоо болон ирээдүйд бодит бус, төсөөллийн нөхцөлийг заана.",
                    "en": "Zero: scientific truths. First: real future possibilities. Second: hypothetical, unreal present/future situations.",
                    "de": "Zero Conditional: Naturgesetze. 1st Conditional: realistische Zukunft. 2nd Conditional: hypothetische Gegenwart."
                },
                "pattern": "0: If + Present, Present | 1st: If + Present, will + V1 | 2nd: If + Past Simple, would + V1",
                "examples": [
                    {
                        "target": "If it rains tomorrow, we will stay at home. (First Conditional)",
                        "mn": "Хэрэв маргааш бороо орвол бид гэртээ үлдэнэ.",
                        "en": "If it rains tomorrow, we will stay at home."
                    },
                    {
                        "target": "If I won the lottery, I would travel the world. (Second Conditional)",
                        "mn": "Би сугалаанд хожвол дэлхийгээр аялах байсан.",
                        "en": "If I won the lottery, I would travel the world."
                    }
                ],
                "common_trap": "Never put 'will' or 'would' in the 'if'-clause: 'If I study' (NOT: 'If I will study')."
            },
            {
                "id": "en_b1_passive_voice",
                "title": "Passive Voice (Present & Past Simple)",
                "core_concept": {
                    "mn": "Үйлийн эзнээс илүү үйл явдал эсвэл үр дүн чухал үед үйлдүүлэгч хэвийг хэрэглэнэ.",
                    "en": "Passive Voice shifts focus to the recipient of the action or the result, rather than who performed it.",
                    "de": "Das Passiv hebt die Handlung oder das Ergebnis hervor, nicht den Ausführenden."
                },
                "pattern": "Subject + be (am/is/are/was/were) + Past Participle (V3) (+ by agent)",
                "examples": [
                    {
                        "target": "This bridge was built in 1890.",
                        "mn": "Энэ гүүр 1890 онд баригдсан.",
                        "en": "This bridge was built in 1890."
                    },
                    {
                        "target": "Millions of emails are sent every minute.",
                        "mn": "Минут тутамд сая сая цахим шуудан илгээгддэг.",
                        "en": "Millions of emails are sent every minute."
                    }
                ],
                "common_trap": "Ensure the auxiliary 'be' agrees with the new subject in number and tense: 'The cars WERE made' (NOT: 'was made')."
            },
            {
                "id": "en_b1_relative_clauses",
                "title": "Defining Relative Clauses (who, which, that, where, whose)",
                "core_concept": {
                    "mn": "Нэр үгийг тодорхойлж, хэн эсвэл аль зүйл болохыг ялган заахад шаардлагатай мэдээллийг өгдөг.",
                    "en": "Defining relative clauses give essential information about a noun. Without this clause, the sentence would be incomplete.",
                    "de": "Notwendige Relativsätze liefern unverzichtbare Identifikationsmerkmale und stehen im Englischen ohne Komma."
                },
                "pattern": "Noun + who (people) / which/that (things) / where (places) / whose (possession) + clause",
                "examples": [
                    {
                        "target": "The woman who called you earlier is my manager.",
                        "mn": "Өмнө нь тань руу залгасан эмэгтэй бол манай менежер.",
                        "en": "The woman who called you earlier is my manager."
                    }
                ],
                "common_trap": "Do not put commas in defining relative clauses in English! Commas are only for non-defining clauses."
            },
            {
                "id": "en_b1_modals_deduction",
                "title": "Modals of Deduction (must, can't, might/may)",
                "core_concept": {
                    "mn": "Одоо цаг дээр баримтад үндэслэн дүгнэлт гаргах: 100% баттай үнэн бол 'must', 100% боломжгүй бол 'can't', магадлалтай бол 'might/may'.",
                    "en": "Use 'must' when 99% sure something is true. Use 'can't' when 99% sure it is impossible. Use 'might/could' for possibilities.",
                    "de": "Schlussfolgerungen in der Gegenwart: 'must' (sicher ja), 'can't' (sicher nein), 'might' (vielleicht)."
                },
                "pattern": "Subject + must / can't / might + Base Verb (V1)",
                "examples": [
                    {
                        "target": "He has been running for two hours; he must be exhausted.",
                        "mn": "Тэр хоёр цаг гүйсэн, маш их ядарсан байх ёстой.",
                        "en": "He has been running for two hours; he must be exhausted."
                    },
                    {
                        "target": "That cannot be true; it makes no sense.",
                        "mn": "Энэ үнэн байх ямар ч боломжгүй; огт утгагүй байна.",
                        "en": "That cannot be true; it makes no sense."
                    }
                ],
                "common_trap": "Never use 'must not' for impossibility! The opposite of 'must be' is 'can't be' (NOT: 'must not be')."
            }
        ]
    },
    {
        "folder_id": "folder_04",
        "folder_name": "Folder 04: B2 - Advanced Precision",
        "level": "B2",
        "topics": [
            {
                "id": "en_b2_third_mixed_conditionals",
                "title": "Third & Mixed Conditionals",
                "core_concept": {
                    "mn": "3-р нөхцөл нь өнгөрсөнд өөрчлөх боломжгүй харамслыг илэрхийлдэг бол Mixed Conditional нь өнгөрсөн үйл явдлын ОДОО үеийн үр дагаврыг холбодог.",
                    "en": "Third Conditional reflects on unreal pasts and regrets. Mixed Conditionals connect an unreal past cause with a present result.",
                    "de": "3rd Conditional drückt irreale Vergangenheit aus. Mixed Conditionals verknüpfen vergangene Ursachen mit gegenwärtigen Folgen."
                },
                "pattern": "3rd: If + Past Perfect, would have + V3 | Mixed: If + had + V3, would + V1 (now)",
                "examples": [
                    {
                        "target": "If I had studied harder, I would have passed the exam.",
                        "mn": "Би илүү хичээж сурсан байсан бол шалгалтаа давах байсан.",
                        "en": "If I had studied harder, I would have passed the exam."
                    },
                    {
                        "target": "If she had taken that job last year, she would be living in Paris now.",
                        "mn": "Хэрэв тэр өнгөрсөн жил тэр ажлыг авсан байсан бол одоо Парист амьдарч байх байсан.",
                        "en": "If she had taken that job last year, she would be living in Paris now."
                    }
                ],
                "common_trap": "Do not say 'If I would have known'. The correct form is 'If I had known'."
            },
            {
                "id": "en_b2_reported_speech",
                "title": "Reported Speech & Tense Backshift",
                "core_concept": {
                    "mn": "Бусдын хэлсэн үгийг дамжуулан ярихад өгүүлэгч үйл үг нь өнгөрсөн цагт байвал цагууд нэг алхам ухардаг (Backshift).",
                    "en": "When reporting statements with a past reporting verb (said, told), present tenses shift back to past tenses, pronouns adapt, and time markers adjust.",
                    "de": "In der indirekten Rede mit vergangenem Einleitungsverb verschieben sich die Zeiten um eine Stufe in die Vergangenheit."
                },
                "pattern": "Present Simple -> Past Simple | Present Continuous -> Past Continuous | Past Simple -> Past Perfect | will -> would",
                "examples": [
                    {
                        "target": "Direct: 'I am working on the report.' -> Reported: She said that she was working on the report.",
                        "mn": "Шууд: 'Би тайлан дээр ажиллаж байна.' -> Дам: Тэр тайлан дээр ажиллаж байгаа гэж хэлсэн.",
                        "en": "She said that she was working on the report."
                    }
                ],
                "common_trap": "'Tell' requires a personal object: 'He told ME' (NOT: 'He told that'). 'Say' does not: 'He said that'."
            },
            {
                "id": "en_b2_causative_passive",
                "title": "Causative Passive (have/get something done)",
                "core_concept": {
                    "mn": "Өөр хүнээр эсвэл үйлчилгээний байгууллагаар ямар нэг зүйлийг хийлгэхэд Causative бүтцийг хэрэглэнэ.",
                    "en": "The causative structure 'have/get something done' indicates arranging for someone else or a professional service to do something for you.",
                    "de": "Drückt aus, dass man eine Dienstleistung durch Dritte ausführen lässt."
                },
                "pattern": "Subject + have / get + object + Past Participle (V3)",
                "examples": [
                    {
                        "target": "I had my car repaired yesterday at the garage.",
                        "mn": "Би өчигдөр засварын газарт машинаа засуулсан.",
                        "en": "I had my car repaired yesterday at the garage."
                    }
                ],
                "common_trap": "'I repaired my car' means you repaired it yourself with your own hands! If a mechanic did it, use 'I had my car repaired'."
            },
            {
                "id": "en_b2_modals_past_deduction",
                "title": "Modals of Past Deduction (must have, can't have, might have)",
                "core_concept": {
                    "mn": "Өнгөрсөнд болж өнгөрсөн үйл явдлын тухай дүгнэлт гаргахад modal + have + V3 бүтцийг ашигладаг.",
                    "en": "Speculating or deducing about past events: 'must have + V3' (almost certain it happened), 'can't have + V3' (impossible that it happened).",
                    "de": "Schlussfolgerungen über vergangene Ereignisse: must have (gewiss geschehen), can't have (unmöglich geschehen)."
                },
                "pattern": "Subject + must / can't / might / could + have + Past Participle (V3)",
                "examples": [
                    {
                        "target": "The streets are soaking wet; it must have rained overnight.",
                        "mn": "Гудамж шал нойтон байна; шөнө бороо орсон байх ёстой.",
                        "en": "The streets are soaking wet; it must have rained overnight."
                    },
                    {
                        "target": "He cannot have stolen the wallet; he was with me all evening.",
                        "mn": "Тэр түрийвчийг хулгайлсан байх ямар ч боломжгүй; тэр оройжин надтай хамт байсан.",
                        "en": "He cannot have stolen the wallet; he was with me all evening."
                    }
                ],
                "common_trap": "Do not confuse 'should have' (past duty not done) with 'must have' (past logical certainty)."
            }
        ]
    }
]

with open('data/en/grammar.json', 'w', encoding='utf-8') as f:
    json.dump(nfc(en_grammar), f, ensure_ascii=False, indent=2)
print("Saved data/en/grammar.json with 4 folders.")
