import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const deGrammarPath = path.join(ROOT, 'data', 'de', 'grammar.json');
const deFolders = JSON.parse(fs.readFileSync(deGrammarPath, 'utf-8'));

// 1. A1 Additions to Folder 01
const a1NewTopics = [
  {
    id: "de_a1_w_fragen_ja_nein",
    title: "W-Fragen & Ja/Nein-Fragen (Question Syntax & Inversion)",
    core_concept: {
      mn: "W-Fragen (Хэн, юу, хаана...): Асуух үг 1-р байранд, хувирсан үйл үг 2-р байранд байна. Ja/Nein-Fragen (Тийм/Үгүй асуулт): Хувирсан үйл үг ӨГҮҮЛБЭРИЙН ЭХЭНД (1-р байранд) орно.",
      en: "W-Questions place the question word in Position 1 and the conjugated verb strictly in Position 2. Yes/No Questions place the conjugated verb at the very beginning in Position 1.",
      de: "W-Fragen beginnen mit dem Fragewort (Position 1), gefolgt vom konjugierten Verb an Position 2. Ja/Nein-Fragen beginnen direkt mit dem finiten Verb an Position 1."
    },
    pattern: "W-Frage: [W-Wort] + [Verb (Pos 2)] + [Subjekt] + ? | Ja/Nein: [Verb (Pos 1)] + [Subjekt] + [Ergänzung] + ?",
    examples: [
      {
        target: "Wo wohnen Sie? — Ich wohne in Ulaanbaatar.",
        mn: "Та хаана амьдардаг вэ? — Би Улаанбаатарт амьдардаг.",
        en: "Where do you live? — I live in Ulaanbaatar."
      },
      {
        target: "Lernst du heute Deutsch? — Ja, ich lerne fleißig.",
        mn: "Чи өнөөдөр герман хэл сурч байгаа юу? — Тийм, би хичээнгүйлэн сурч байна.",
        en: "Are you learning German today? — Yes, I am diligently learning."
      }
    ],
    common_trap: "Ja/Nein асуултад үйл үг заавал 1-р байранд байна! Англи хэл шиг 'Do you...' гэх туслах үйл үг герман хэлэнд огт байхгүй."
  },
  {
    id: "de_a1_trennbare_verben",
    title: "Trennbare Verben (Separable Prefixes & Satzklammer)",
    core_concept: {
      mn: "Салдаг угтвар бүхий үйл үгс (ab-, an-, auf-, aus-, ein-, mit-, vor-, zu-): Гол өгүүлбэрт язгуур үйл үг 2-р байранд хувирч, салдаг угтвар нь өгүүлбэрийн ХАМГИЙН ТӨГСГӨЛД (Satzende) очно.",
      en: "Separable prefix verbs (ab-, an-, auf-, aus-, ein-, mit-, vor-, zu-) split in main clauses: the base verb conjugates in Position 2 while the separable prefix moves to the very end of the sentence.",
      de: "Trennbare Verben teilen sich im Hauptsatz: Das Stammverb wird an Position 2 konjugiert, die trennbare Vorsilbe wandert an das absolute Satzende (Satzklammer)."
    },
    pattern: "[Subjekt/Pos 1] + [FINITES VERB (Pos 2)] + [Mittelfeld] + [TRENNBARE VORSILBE (Satzende)]",
    examples: [
      {
        target: "Ich stehe jeden Morgen um sechs Uhr auf.",
        mn: "Би өглөө бүр зургаан цагт босдог.",
        en: "I get up every morning at six o'clock."
      },
      {
        target: "Der Zug kommt um 18:30 Uhr in Berlin an.",
        mn: "Галт тэрэг 18:30 цагт Берлинд ирнэ.",
        en: "The train arrives in Berlin at 18:30."
      }
    ],
    common_trap: "Салдаг угтварыг өгүүлбэрийн дунд үлдээж болохгүй! Тэр заавал өгүүлбэрийн төгсгөлийн цэгийн өмнө очих ёстой."
  },
  {
    id: "de_a1_possessivartikel",
    title: "Possessivartikel im Nominativ & Akkusativ (mein, dein, sein...)",
    core_concept: {
      mn: "Хамаатуулах төлөөний үгс (миний, чиний, түүний...): Нэрийн өмнө артикл шиг хувирна. Зөвхөн эр хүйс Akkusativ дээр '-en' төгсгөл авна (meinen, deinen, seinen).",
      en: "Possessive determiners (my, your, his, her, our, their) decline like indefinite articles. Only masculine accusative adds -en (meinen, deinen, seinen).",
      de: "Possessivartikel begleiten das Nomen wie unbestimmte Artikel. Im Akkusativ erhält nur die maskuline Form die Endung -en (meinen, deinen, seinen)."
    },
    pattern: "Nom: mein / meine / mein | Akk: meinen / meine / mein / meine",
    examples: [
      {
        target: "Das ist mein Vater und das ist meine Mutter.",
        mn: "Энэ бол миний аав, энэ бол миний ээж.",
        en: "This is my father and this is my mother."
      },
      {
        target: "Ich suche meinen Schlüssel und meine Tasche.",
        mn: "Би түлхүүрээ болон цүнхээ хайж байна.",
        en: "I am looking for my key and my bag."
      }
    ],
    common_trap: "Эр хүйс дээр заавал 'meinen' гэж төгсгөл залгана: 'Ich rufe meinen Bruder an' (биш: 'mein Bruder')."
  },
  {
    id: "de_a1_negation_nicht_kein",
    title: "Negation: nicht vs. kein (Sentence vs. Noun Negation)",
    core_concept: {
      mn: "Үгүйсгэл: Артиклгүй нэр үг эсвэл 'ein/eine'-тэй нэр үгийг 'kein/keine'-ээр үгүйсгэнэ. Харин тодорхой артиклтай нэр үг, үйл үг, тэмдэг нэр, өгүүлбэрийг бүхэлд нь 'nicht'-ээр үгүйсгэнэ.",
      en: "Use 'kein' to negate indefinite nouns (nouns with 'ein' or no article). Use 'nicht' to negate verbs, adjectives, adverbs, proper names, and definite nouns.",
      de: "Mit 'kein' negiert man Nomen mit unbestimmtem Artikel oder Nullartikel. Mit 'nicht' negiert man Verben, Adjektive, Pronomen, Eigennamen und Nomen mit bestimmtem Artikel."
    },
    pattern: "Nomen (unbestimmt/Nullartikel): kein / keine / keinen | Verben/Adjektive/Satz: ... + nicht (bzw. nicht + Adjektiv)",
    examples: [
      {
        target: "Ich habe kein Auto und keine Zeit.",
        mn: "Надад машин ч байхгүй, зав ч байхгүй.",
        en: "I have no car and no time."
      },
      {
        target: "Ich verstehe diesen Satz leider nicht.",
        mn: "Би энэ өгүүлбэрийг харамсалтай нь ойлгохгүй байна.",
        en: "Unfortunately I do not understand this sentence."
      }
    ],
    common_trap: "'Ich habe nicht Zeit' гэж хэлж болохгүй! Заавал 'Ich habe keine Zeit' гэж нэр үгийг 'kein'-ээр үгүйсгэнэ."
  },
  {
    id: "de_a1_imperativ",
    title: "Imperativ: Befehlsform (du, ihr, Sie)",
    core_concept: {
      mn: "Захирах хүсэх төлөв: du (чи), ihr (та нар), Sie (Та): 'du' дээр төгсгөлийн '-st' болон төлөөний үг 'du' хасагдана. Umlaut (a->ä) авагдахгүй! 'ihr' дээр зөвхөн 'ihr' хасагдана. 'Sie' дээр үйл үг + Sie гэж байр солигдоно.",
      en: "The Imperative expresses commands, requests, and instructions for 'du', 'ihr', and formal 'Sie'. For 'du', drop -st and pronoun, no umlaut. For 'ihr', drop pronoun. For 'Sie', invert verb + Sie.",
      de: "Der Imperativ formuliert Aufforderungen. Du-Form: Verbstamm ohne -st, Pronomen entfällt, kein Umlaut (fahr!). Ihr-Form: Verbform wie im Präsens, Pronomen entfällt (fahrt!). Sie-Form: Inversion (fahren Sie!)."
    },
    pattern: "du: [Stamm (+e)]! | ihr: [Stamm + t]! | Sie: [Infinitiv + Sie]!",
    examples: [
      {
        target: "Komm bitte pünktlich zum Unterricht!",
        mn: "Хичээлдээ цагтаа ирээрэй!",
        en: "Please come to class on time!"
      },
      {
        target: "Öffnen Sie bitte das Fenster!",
        mn: "Цонхоо онгойлгоно уу!",
        en: "Please open the window!"
      }
    ],
    common_trap: "'Fahren' үйл үг du дээр 'du fährst' болдог ч захирах төлөв дээр 'Fahr!' болно (Umlaut авахгүй: 'Fahr langsamer!'). Харин e->i хувиралт хадгалагдана: 'Lies!' (lesen)."
  }
];

// 2. A2 Additions to Folder 02
const a2NewTopics = [
  {
    id: "de_a2_komparativ_superlativ",
    title: "Komparativ & Superlativ (Adjective Comparison)",
    core_concept: {
      mn: "Харьцуулсан болон давуу зэрэг: Харьцуулахдаа тэмдэг нэрийн төгсгөлд '-er als' (жишээ нь: schneller als), давуу зэрэгт 'am ...-sten' (жишээ нь: am schnellsten) залгана. a, o, u эгшигтэй богино үгс Umlaut (ä, ö, ü) авна.",
      en: "Adjective comparison: Comparative uses '-er als' (faster than). Superlative uses 'am ...-sten' (the fastest). Short adjectives with a, o, u usually take an umlaut (ä, ö, ü).",
      de: "Komparativ bildet man mit Endung -er + 'als'. Superlativ mit 'am' + Endung -sten. Einsilbige Adjektive mit a, o, u erhalten meist einen Umlaut (alt -> älter -> am ältesten)."
    },
    pattern: "Positiv: so [Adj] wie | Komparativ: [Adj + er] als | Superlativ: am [Adj + sten]",
    examples: [
      {
        target: "Mein Bruder ist älter als ich, aber mein Vater ist am ältesten.",
        mn: "Миний ах надаас ахмад, гэхдээ манай аав хамгийн ахмад нь.",
        en: "My brother is older than me, but my father is the oldest."
      },
      {
        target: "Ich trinke gern Tee, aber Kaffee trinke ich lieber.",
        mn: "Би цай дуртай уудаг, гэхдээ кофег бүр илүү дуртай уудаг.",
        en: "I like drinking tea, but I prefer drinking coffee."
      }
    ],
    common_trap: "Харьцуулсан зэрэг дээр англи хэлний 'than'-ий оронд 'als' хэрэглэнэ ('schneller als ich', биш: 'wie ich'). Тэнцүү харьцуулалтад 'so ... wie' хэрэглэнэ."
  },
  {
    id: "de_a2_nebensatz_weil_dass",
    title: "Kausale & Objektsätze: weil & dass (Subordinating Conjunctions)",
    core_concept: {
      mn: "weil (учир нь) ба dass (гэж/гэдгийг) нь дагалдах өгүүлбэр (Nebensatz) үүсгэнэ. Дагалдах өгүүлбэрийн хувирсан үйл үг ХАМГИЙН ТӨГСГӨЛД (Verb-Ende) очно.",
      en: "'weil' (because) and 'dass' (that) are subordinating conjunctions triggering a subordinate clause: the conjugated verb is pushed to the very end of the clause.",
      de: "'weil' (Begründung) und 'dass' (Inhaltssatz) leiten Nebensätze ein: Das konjugierte Verb steht zwingend an der letzten Position des Nebensatzes."
    },
    pattern: "[Hauptsatz: Pos 2 Verb], + weil/dass + [Subjekt] + [Ergänzungen] + [FINITES VERB (Satzende)].",
    examples: [
      {
        target: "Er bleibt heute im Bett, weil er krank ist.",
        mn: "Тэр өнөөдөр орондоо хэвтэж байна, учир нь тэр өвчтэй байгаа.",
        en: "He stays in bed today because he is sick."
      },
      {
        target: "Ich weiß genau, dass du die Prüfung bestehst.",
        mn: "Чи шалгалтаа давах болно гэдгийг би гарцаагүй мэдэж байна.",
        en: "I know for sure that you will pass the exam."
      }
    ],
    common_trap: "'weil'-ийн дараа үйл үгийг 2-р байранд үлдээж болохгүй! Заавал төгсгөлд: 'weil er krank ist' (биш: 'weil er ist krank')."
  },
  {
    id: "de_a2_verben_dativ_akkusativ",
    title: "Verben mit Dativ- und Akkusativobjekt (Double Object Order)",
    core_concept: {
      mn: "Хоёр тусагдахуунтай үйл үгс (geben, schenken, zeigen, erklären, schicken...): Хэнд? (Dativ) Юуг? (Akkusativ). Хэрэв хоёулаа нэр үг бол: Dativ нь Akkusativ-ийн өмнө орно. Хэрэв нэг нь эсвэл хоёулаа төлөөний үг (Pronomen) бол: Төлөөний үг үргэлж урд орно (Akkusativ-Pronomen өмнө нь!).",
      en: "Verbs with two objects: Dative (indirect recipient) + Accusative (direct thing). Two nouns: Dative precedes Accusative. Two pronouns: Accusative pronoun strictly precedes Dative pronoun!",
      de: "Verben mit zwei Objekten: Dativ (Person) + Akkusativ (Sache). Zwei Nomen: Dativ vor Akkusativ (dem Mann das Buch). Zwei Pronomen: Akkusativ vor Dativ (es ihm)!"
    },
    pattern: "Nomen: [Subjekt] + [Verb] + [DATIV-Nomen] + [AKKUSATIV-Nomen] | Pronomen: [Subjekt] + [Verb] + [AKK-Pronomen] + [DAT-Pronomen]",
    examples: [
      {
        target: "Der Vater schenkt dem Sohn ein Fahrrad.",
        mn: "Эцэг нь хүүдээ унадаг дугуй бэлэглэж байна.",
        en: "The father gives a bicycle to his son."
      },
      {
        target: "Der Vater schenkt es ihm zum Geburtstag.",
        mn: "Эцэг нь түүний төрсөн өдрөөр үүнийг түүнд бэлэглэж байна.",
        en: "The father gives it to him for his birthday."
      }
    ],
    common_trap: "Төлөөний үг болсон үед байр солигддог: 'Er gibt es ihm' (биш: 'Er gibt ihm es')!"
  },
  {
    id: "de_a2_feste_praepositionen",
    title: "Feste Präpositionen mit Dativ & Akkusativ (Preposition Rhythms)",
    core_concept: {
      mn: "Заавал Dativ шаардах угтварууд: aus, bei, mit, nach, seit, von, zu (Цээжлэх үг: 'aus-bei-mit-nach-seit-von-zu'). Заавал Akkusativ шаардах угтварууд: bis, durch, für, gegen, ohne, um (Цээжлэх үг: 'bis-durch-für-gegen-ohne-um').",
      en: "Fixed Dative prepositions: aus, bei, mit, nach, seit, von, zu. Fixed Accusative prepositions: bis, durch, für, gegen, ohne, um. They always demand their respective case regardless of movement or location!",
      de: "Feste Dativ-Präpositionen: aus, bei, mit, nach, seit, von, zu, gegenüber. Feste Akkusativ-Präpositionen: bis, durch, für, gegen, ohne, um. Sie fordern ausnahmslos ihren festen Kasus."
    },
    pattern: "Dativ: aus / bei / mit / nach / seit / von / zu + [DATIV] | Akkusativ: bis / durch / für / gegen / ohne / um + [AKKUSATIV]",
    examples: [
      {
        target: "Ich fahre mit dem Bus zu meiner Arbeit.",
        mn: "Би автобусаар ажил руугаа явдаг.",
        en: "I travel by bus to my work."
      },
      {
        target: "Das Geschenk ist für meinen besten Freund.",
        mn: "Энэ бэлэг миний хамгийн сайн найзад зориулагдсан.",
        en: "The gift is for my best friend."
      }
    ],
    common_trap: "'mit', 'zu', 'von'-ий дараа хэзээ ч Akkusativ ирэхгүй, 'für', 'ohne', 'um'-ийн дараа хэзээ ч Dativ ирэхгүй!"
  }
];

// 3. B2 Additions to Folder 04
const b2NewTopics = [
  {
    id: "de_b2_partizipialattribute",
    title: "Partizip I & II als Adjektive und Erweiterte Partizipien",
    core_concept: {
      mn: "Тэмдэг нэрийн үүрэгтэй нөхцөл үйл үгс: Partizip I (Infinitiv + -d + төгсгөл) нь идэвхтэй бөгөөд зэрэг явагдаж буй үйлийг заана (das weinende Kind = das Kind, das weint). Partizip II нь идэвхгүй эсвэл өнгөрсөн үйлийг заана (das reparierte Auto = das Auto, das repariert wurde). Өргөтгөсөн нөхцөлт бүтэц (Erweitertes Partizip) нь артикл ба нэр үгийн дунд бүтэн өгүүлбэрийн хэмжээний дэлгэрэнгүй мэдээллийг оруулдаг.",
      en: "Participle attributes: Participle I (Infinitiv + -d + adjective ending) expresses active, simultaneous action. Participle II expresses passive or completed action. Extended participial phrases place extensive attributes directly between the article and the noun.",
      de: "Partizipien als Adjektive: Partizip I (Infinitiv + -d + Adjektivendung) drückt aktive Gleichzeitigkeit aus. Partizip II drückt passive Vorzeitigkeit/Zustand aus. Erweiterte Partizipialattribute umklammern Angaben zwischen Artikel und Nomen."
    },
    pattern: "Artikel + [Erweiterte Angaben / Adverbiale] + [Partizip I/II mit Adjektivendung] + Nomen",
    examples: [
      {
        target: "Die gestern von der Regierung beschlossenen Sparmaßnahmen treten in Kraft.",
        mn: "Өчигдөр засгийн газраас шийдвэрлэсэн хэмнэлтийн арга хэмжээнүүд хэрэгжиж эхэлж байна.",
        en: "The austerity measures decided by the government yesterday are taking effect."
      },
      {
        target: "Der seit vielen Jahren in Berlin lebende Schriftsteller veröffentlicht einen neuen Roman.",
        mn: "Олон жилийн турш Берлинд амьдарч буй зохиолч шинэ роман хэвлүүлж байна.",
        en: "The writer living in Berlin for many years is publishing a new novel."
      }
    ],
    common_trap: "Уншиж ойлгохдоо эхлээд Артикл ба түүний төгсгөлийн Нэр үгийг холбож унших ёстой! Голд нь орсон үгс бол нөхцөлт үйл үгийн дэлгэрүүлэгч гишүүд юм."
  },
  {
    id: "de_b2_konjunktiv1",
    title: "Konjunktiv I & Indirekte Rede (Indirect Discourse in Journalism)",
    core_concept: {
      mn: "Konjunktiv I (Шууд бус ишлэл): Хөндлөнгийн хүний хэлсэн үг, мэдэгдэл, мэдээг төвийг сахисан байдлаар дамжуулахад ашиглана. Язгуур + e, est, e, en, et, en. Хэрэв Konjunktiv I нь Indikativ (энгийн хэлбэр)-тэйгээ давхардвал оронд нь Konjunktiv II (эсвэл würde + Infinitiv) хэрэглэнэ.",
      en: "Konjunktiv I is strictly used in formal journalism and reports for indirect speech (distancing the speaker from the claim). Formed with present stem + subjunctive endings. If the form matches the indicative, substitute with Konjunktiv II.",
      de: "Der Konjunktiv I dient der distanzierten Wiedergabe von Äußerungen Dritter (indirekte Rede). Bildung: Präsensstamm + -e/-est/-e/-en/-et/-en. Bei Formengleichheit mit dem Indikativ wird auf den Konjunktiv II ausgewichen."
    },
    pattern: "Er sagte / Sie erklärte, [dass] ... + [Konjunktiv I Verb] (bzw. Konjunktiv II bei Formengleichheit)",
    examples: [
      {
        target: "Der Minister erklärte, die Steuern seien in diesem Jahr nicht erhöht worden.",
        mn: "Сайд мэдэгдэхдээ, энэ жил татварыг нэмээгүй гэж хэлсэн.",
        en: "The minister explained that taxes had not been increased this year."
      },
      {
        target: "Die Zeugin behauptet, sie habe den Täter genau gesehen.",
        mn: "Гэрч этгээд мэдэгдэхдээ, тэрээр гэмт хэрэгтнийг яг таг харсан гэж батлав.",
        en: "The witness claims she saw the perpetrator clearly."
      }
    ],
    common_trap: "3-р биеийн ганц тоонд sei / habe / gehe хэлбэрүүд голчлон хэрэглэгддэг. 'Er hat gesagt, dass er krank ist' нь албан бус; B2 түвшинд 'er sei krank' гэж бичнэ."
  },
  {
    id: "de_b2_passiversatzformen",
    title: "Passiversatzformen & Alternativen (sich lassen, sein zu, -bar/-lich)",
    core_concept: {
      mn: "Идэвхгүй төлөвийг орлох өөр бүтцүүд: 1) sich lassen + Infinitiv (= können + Passiv: Das Problem lässt sich lösen = Das Problem kann gelöst werden). 2) sein + zu + Infinitiv (= müssen/können + Passiv: Die Aufgabe ist zu erledigen). 3) -bar, -lich дагавартай тэмдэг нэрс (machbar, lösbar, leserlich).",
      en: "Passive alternatives: 1) 'sich lassen + infinitive' (= can be done). 2) 'sein + zu + infinitive' (= must/can be done). 3) Adjectives with '-bar' or '-lich' (= feasible, readable).",
      de: "Passiversatzformen drücken Passivbedeutungen ohne 'werden' aus: 1) 'sich lassen + Infinitiv' (Möglichkeit: lässt sich machen). 2) 'sein + zu + Infinitiv' (Notwendigkeit/Möglichkeit: ist zu tun). 3) Adjektive auf -bar/-lich (machbar = kann gemacht werden)."
    },
    pattern: "Möglichkeit: [Subjekt] + lässt sich + [Infinitiv] | Notwendigkeit: [Subjekt] + ist + zu + [Infinitiv]",
    examples: [
      {
        target: "Diese schwierige Frage lässt sich nicht so einfach beantworten.",
        mn: "Энэ хүнд асуултыг тийм ч амархан хариулах боломжгүй юм.",
        en: "This difficult question cannot be answered that easily."
      },
      {
        target: "Die Berichte sind bis nächsten Montag beim Direktor einzureichen.",
        mn: "Тайлангуудыг ирэх даваа гараг гэхэд захиралд өгч тушаах ёстой.",
        en: "The reports are to be submitted to the director by next Monday."
      }
    ],
    common_trap: "'sein + zu + Infinitiv' бүтэц нь хам сэдвээсээ хамаарч 'шаардлага' (müssen) эсвэл 'боломж' (können)-ийг заана. Төлөвлөгөө, заавар дээр 'müssen'-ийг илэрхийлнэ."
  },
  {
    id: "de_b2_subjektive_modalverben",
    title: "Subjektive Bedeutung der Modalverben (Degrees of Certainty & Rumor)",
    core_concept: {
      mn: "Байдлын үйл үгсийн субьектив утга: Үйл явдалд хэр итгэлтэй байгааг илэрхийлнэ. müssen = бараг 100% гарцаагүй (Er muss zu Hause sein). dürfte = 75% өндөр магадлалтай (Er dürfte gleich ankommen). könnte = 50% магадлалтай (Das könnte stimmen). sollen = бусдын яриа/цуурхал (Er soll Millionär sein = Man sagt, er sei Millionär). wollen = тухайн хүний өөрийнх нь баталгаа/үнэмшилгүй яриа (Er will alles allein gemacht haben = Er behauptet, er habe...).",
      en: "Subjective use of modal verbs indicates degrees of certainty or attribution: 'müssen' (99% certainty), 'dürfte' (75% probability), 'könnte' (50% possibility), 'sollen' (hearsay/rumor: it is said), 'wollen' (unverified subjective claim: he claims that).",
      de: "Subjektive Modalverben drücken Vermutungen oder Distanzierung aus: müssen (fast sicher), dürfte (sehr wahrscheinlich), könnte (möglich), sollen (Gerücht/Fremdbehauptung), wollen (eigene ungeprüfte Behauptung des Subjekts)."
    },
    pattern: "Vermutung: [Subjekt] + [Modalverb (dürfte/muss/könnte)] + [Infinitiv I oder Perfekt-Infinitiv: Partizip II + haben/sein]",
    examples: [
      {
        target: "Der Zug dürfte in wenigen Minuten einfahren.",
        mn: "Галт тэрэг хэдхэн минутын дараа орж ирэх магадлал маш өндөр байна.",
        en: "The train is very likely to arrive in a few minutes."
      },
      {
        target: "Er will den berühmten Schauspieler persönlich kennen.",
        mn: "Тэрээр алдартай жүжигчнийг биечлэн мэддэг гэж өөрөө яриад байгаа (батлагдаагүй).",
        en: "He claims to know the famous actor personally."
      }
    ],
    common_trap: "'Er soll krank sein' гэдэг нь 'Тэр өвчтэй байх ёстой' гэсэн утга биш, харин 'Хүмүүсийн ярьж байгаагаар тэр өвчтэй байгаа гэнэ' гэсэн утгатай!"
  },
  {
    id: "de_b2_nvv_praepositionen",
    title: "Nomen-Verb-Verbindungen mit festen Präpositionen (NVV Valency)",
    core_concept: {
      mn: "Угтварт нэр үг-үйл үгийн холбоосууд (Funktionsverbgefüge): Нэр үг нь өөртөө тохирох угтвар ба тийн ялгалыг удирдана. Жишээ нь: in Anspruch nehmen (+ Akk), zur Verfügung stehen (+ Dat) / stellen (+ Akk), Kritik üben an (+ Dat), Rücksicht nehmen auf (+ Akk), in Frage kommen.",
      en: "Noun-verb collocations with fixed prepositions: The prepositional noun phrase governs a specific case: 'in Anspruch nehmen (+ Akk)', 'Kritik üben an (+ Dat)', 'Rücksicht nehmen auf (+ Akk)', 'zur Verfügung stehen (+ Dat)'.",
      de: "Nomen-Verb-Verbindungen mit Präpositionalgruppe verlangen feste Kasus: 'Kritik üben an + Dat' (= kritisieren), 'Rücksicht nehmen auf + Akk' (= berücksichtigen), 'zur Verfügung stehen + Dat'."
    },
    pattern: "[Subjekt] + [Präpositionalphrase mit festem Kasus] + [Funktionsverb]",
    examples: [
      {
        target: "Die Bürger üben scharfe Kritik an den neuen Verkehrsregeln.",
        mn: "Иргэд шинэ замын хөдөлгөөний дүрмийг хурцаар шүүмжилж байна.",
        en: "The citizens express sharp criticism of the new traffic regulations."
      },
      {
        target: "Wir müssen unbedingt Rücksicht auf die älteren Mitmenschen nehmen.",
        mn: "Бид ахмад настнуудаа заавал анхаарч харгалзан үзэх ёстой.",
        en: "We must strictly show consideration for elderly fellow citizens."
      }
    ],
    common_trap: "'Kritik üben über' гэж хэлж болохгүй! Заавал 'Kritik üben an + Dativ' гэж угтвар, тийн ялгал яг таг холбогдоно."
  }
];

// Helper to append new topics avoiding duplicate IDs
function appendTopics(folder, newTopics) {
  const existingIds = new Set(folder.topics.map(t => t.id));
  for (const t of newTopics) {
    if (!existingIds.has(t.id)) {
      folder.topics.push(t);
      existingIds.add(t.id);
    }
  }
}

appendTopics(deFolders[0], a1NewTopics);
appendTopics(deFolders[1], a2NewTopics);
appendTopics(deFolders[3], b2NewTopics);

fs.writeFileSync(deGrammarPath, JSON.stringify(deFolders, null, 2), 'utf-8');
console.log('Successfully updated de/grammar.json!');
console.log('Folder 1 (A1) now has:', deFolders[0].topics.length, 'topics');
console.log('Folder 2 (A2) now has:', deFolders[1].topics.length, 'topics');
console.log('Folder 3 (B1) now has:', deFolders[2].topics.length, 'topics');
console.log('Folder 4 (B2) now has:', deFolders[3].topics.length, 'topics');
