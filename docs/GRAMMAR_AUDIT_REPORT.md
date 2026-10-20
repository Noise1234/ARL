# German Grammar & Vocabulary Database Audit Report
**Agent:** `grammar-specialist` (German Grammar & Linguistic Specialist)  
**Date:** October 20, 2026  
**Target Files:**
1. `/root/arl/data/de/grammar.json` (Grammar Modules: Folders 01–04)
2. `/root/arl/data/de/vocab_b1.json` (B1 Flashcards & Verb Conjugations)

---

## Executive Summary

A comprehensive linguistic and pedagogical audit of the German language learning database reveals critical vulnerabilities that compromise active language recall and grammatical accuracy:

1. **`grammar.json` (Folder Coverage & Architecture):**
   - The current 20 topics across Folders 01–04 represent only high-level conceptual umbrellas, lacking the high-yield **micro-grammar rules** ("small grammars") required for B1 fluency.
   - Essential B1 grammatical engines are completely missing: **Position 0 Konjunktionen (ADUSO)**, **Position 1 Konjunktionaladverbien (Inversion)**, **Subjunktionen (als vs. wenn, da, während)**, **Cause-Effect Matrix (denn vs. weil vs. deshalb)**, **Adjektivdeklination across all 3 tables**, **Verben mit festen Präpositionen (Akkusativ & Dativ)**, **Pronominaladverbien (Da-/Wo-)**, **Reine Dativ-Verben**, and **Subjektidentität in Infinitivkonstruktionen (um...zu vs. damit)**.

2. **`vocab_b1.json` (Verb Flashcard Corruption):**
   - **Severe defect rate:** 173 of 224 verbs (~77.2%) contain structural conjugation errors, invalid prefix handling, or invalid auxiliary verbs.
   - **Algorithmic Weak Regularization:** Strong and mixed verbs were mechanically regularized (e.g., *beschließen* -> *beschließte* / *hat gebeschließt*; *gelten* -> *geltt* / *hat gegeltt*; *schließen* -> *schließte* / *hat geschließt*).
   - **Bogus `ge-` Prefixing on Inseparable Verbs:** 99 verbs with inseparable prefixes (*be-, ent-, emp-, er-, ge-, ver-, zer-*) or *-ieren* were prepended with `ge-` (e.g., *hat gebewältigt*, *hat gegenehmigt*, *hat gerenoviert*).
   - **Separable Verb Failure:** 51 separable verbs placed `ge-` before the prefix (*hat geankommt*, *hat geabfahrt*, *hat geeintragt*) and failed to separate in Präsens/Präteritum (*ankommt*, *ankommte*).
   - **100% Auxiliary Failure:** ZERO verbs in the dataset use the auxiliary *sein* (`ist`). All motion, transition, and state-change verbs (*ankommen, abfahren, einsteigen, aussteigen, umsteigen, umziehen*) were assigned *hat*.
   - **Blind `+ Akkusativ` Assignment:** 214 of 224 verbs were marked `+ Akkusativ`, directly misrepresenting pure Dativ verbs (*zustimmen*, *widersprechen*) and prepositional verbs (*verstoßen gegen + Akk*, *streiten über + Akk*).

---

## Part 1: Audit of Existing Topics in `data/de/grammar.json` (Folders 01–04)

### Folder 01: A1 - Foundations (4 Topics)
- **Topics Present:** `de_a1_hauptsatz` (V2 Rule), `de_a1_kasus_nom_akk`, `de_a1_praesens`, `de_a1_modalverben`.
- **Linguistic Audit & Deficits:**
  1. *Insufficient Granularity:* 4 broad topics cannot build sufficient foundation for A1.
  2. *Lexical Leakage:* In `de_a1_kasus_nom_akk`, example `"Ich habe einen interessanten Apfel gegessen"` introduces weak adjective declension (`interessanten`) before adjective endings are taught.
  3. *Missing A1 Essentials:*
     - Accusative prepositions (*durch, für, gegen, ohne, um, bis* - "DOGFU / FUDGO").
     - Personal pronouns in Nominativ and Akkusativ (*ich/mich, du/dich, er/ihn*, etc.).
     - Negation mechanics (*nicht* vs. *kein*).

### Folder 02: A2 - Core Structures (5 Topics)
- **Topics Present:** `de_a2_dativ`, `de_a2_perfekt`, `de_a2_praeteritum`, `de_a2_wechselpraepositionen`, `de_a2_reflexive`.
- **Linguistic Audit & Deficits:**
  1. *Missing Dativ Prepositions:* No systematic module for pure Dativ prepositions (*aus, bei, mit, nach, seit, von, zu, gegenüber*).
  2. *Wechselpräpositionen:* Topic `de_a2_wechselpraepositionen` states the Wo? vs Wohin? rule, but omits the positional verb pair engine (*stellen/stehen, legen/liegen, setzen/sitzen, hängen/hängen*), leaving learners unable to construct sentences.
  3. *Reflexive Verben:* The trap note mentions *Ich wasche mich* vs *Ich wasche mir die Hände*, but does not formulate the systematic rule: **Direct Object present -> Reflexive pronoun shifts to Dativ**.
  4. *Missing Adjective Endings:* Adjective declension is completely missing from A2.

### Folder 03: B1 - Intermediate Mastery (6 Topics)
- **Topics Present:** `de_b1_nebensatz` (weil, dass, wenn, obwohl), `de_b1_genitiv`, `de_b1_konjunktiv2`, `de_b1_passiv_vorgang`, `de_b1_relativsatz`, `de_b1_zu_infinitiv`.
- **Linguistic Audit & Deficits:**
  1. *Connector Blindspot:* Lumping *weil, dass, wenn, obwohl* into one generic topic ignores the fundamental structural tri-partition of German syntax:
     - **Position 0:** *aber, denn, und, sondern, oder* (ADUSO).
     - **Position 1 (Inversion):** *deshalb, trotzdem, sonst, jedoch*.
     - **Verb-Ende:** Subordinate conjunctions.
  2. *Temporal Subjunctions:* The critical distinction between *als* (single past event) and *wenn* (present, future, or repeated past events) is entirely omitted.
  3. *Rektion der Verben (Prepositional Objects):* The single most heavily tested B1 competence (*warten auf + Akk*, *sich erinnern an + Akk*, *teilnehmen an + Dat*, *abhängen von + Dat*) is completely missing.
  4. *Infinitive Structures:* `de_b1_zu_infinitiv` lumps *um...zu*, *ohne...zu*, and *anstatt...zu* without teaching **Subjektidentität** (when to use *um...zu* vs. *damit*).
  5. *Modal Verbs in Complex Syntax:* Subordinate clause placement (*...weil er arbeiten muss*) and double infinitive (*Ersatzinfinitiv*: *hat arbeiten müssen*) are absent.

### Folder 04: B2 - Advanced Precision (5 Topics)
- **Topics Present:** `de_b2_tekamolo`, `de_b2_zweiteilige_konnektoren`, `de_b2_nvv`, `de_b2_passiv_zustand`, `de_b2_plusquamperfekt_futur`.
- **Linguistic Audit & Deficits:**
  1. The B2 topics are structurally sound and cleanly explained.
  2. However, they rely on foundational B1 micro-rules (such as connector positions and verb valencies) that learners currently cannot find in Folder 03.

---

## Part 2: Specifications for 16 New High-Yield B1 Micro-Grammar Modules

To establish complete coverage, 16 micro-grammar modules are specified below adhering strictly to the required 4-part layout:
1. `id` & `title`
2. `core_concept`: `de`, `en`, `mn`
3. `pattern`: Structural formula
4. `examples`: Target (German), Mongolian (`mn`), English (`en`)
5. `common_trap`: Detailed pedagogical pitfall

---

### Module 01: Konjunktionen (Position 0 - ADUSO)
- **ID:** `de_b1_konnektoren_pos0`
- **Title:** `Konjunktionen: Position 0 (aber, denn, und, sondern, oder)`
- **Core Concept:**
  - `de`: Die nebenordnenden Konjunktionen (ADUSO: aber, denn, und, sondern, oder) verbinden zwei Hauptsätze. Sie belegen die grammatische Position 0, verändern die Wortstellung nicht und verlangen das konjugierte Verb an Position 2. 'Sondern' steht ausschließlich nach einer Verneinung (nicht/kein) und korrigiert eine Aussage.
  - `en`: Coordinating conjunctions (ADUSO: aber, denn, und, sondern, oder) link two main clauses. They occupy grammatical Position 0, meaning they do not count toward word order. The subject takes Position 1 and the conjugated verb remains strictly at Position 2. 'Sondern' is used exclusively after a negation (nicht/kein) to state a corrective alternative.
  - `mn`: Зэрэгцсэн холбоосууд (ADUSO: aber, denn, und, sondern, oder) нь хоёр гол өгүүлбэрийг холбодог бөгөөд 'Тэг (0) байрлал'-д тооцогдоно. Өөрөөр хэлбэл үгийн дараалалд нөлөөлөхгүй: холбоосын араас эзэн бие 1-р байранд, хувирсан үйл үг 2-р байрандаа хэвээр үлдэнэ. 'Sondern' (харин) нь ЗӨВХӨН үгүйсгэлийн (nicht/kein) дараа залруулга болж орно.
- **Pattern:** `[Hauptsatz 1], + [aber / denn / und / sondern / oder (Pos 0)] + Subjekt (Pos 1) + FINITES VERB (Pos 2) + ...`
- **Examples:**
  1. `target`: `Ich möchte heute Deutsch lernen, denn ich habe morgen eine wichtige Prüfung.`  
     `mn`: `Би өнөөдөр герман хэл сурмаар байна, учир нь маргааш чухал шалгалттай.`  
     `en`: `I would like to learn German today, for I have an important exam tomorrow.`
  2. `target`: `Er kauft kein Auto, sondern er fährt jeden Tag mit dem Fahrrad.`  
     `mn`: `Тэр машин худалдаж авахгүй, харин өдөр бүр дугуйгаар явдаг.`  
     `en`: `He is not buying a car, but rather rides a bicycle every day.`
  3. `target`: `Sie ist müde, aber sie beendet ihren Bericht noch heute Abend.`  
     `mn`: `Тэр ядарсан боловч тайлангаа өнөө оройдоо багтаан дуусгана.`  
     `en`: `She is tired, but she is finishing her report this evening.`
- **Common Trap:**
  - `mn`: Анхаарах алдаа: 1) 'Denn'-ийн дараа үйл үгийг өгүүлбэрийн төгсгөлд тавьж БОЛОХГҮЙ (*...denn ich morgen eine Prüfung habe - БУРУУ!). 2) 'Aber' болон 'Sondern'-ийг хольж болохгүй. Урд талын өгүүлбэрт үгүйсгэл (nicht/kein) байвал 'харин' гэдэг утгаар заавал 'sondern' ашиглана (*Er lernt nicht Englisch, aber Deutsch - БУРУУ! ЗӨВ: ...sondern Deutsch).

---

### Module 02: Konjunktionaladverbien (Position 1 Inversion)
- **ID:** `de_b1_konnektoren_pos1`
- **Title:** `Konjunktionaladverbien: Position 1 Inversion (deshalb, trotzdem, sonst, jedoch)`
- **Core Concept:**
  - `de`: Konjunktionaladverbien (deshalb, deswegen, darum, trotzdem, sonst, jedoch) verbinden zwei Sätze logisch, besetzen aber vollwertig die grammatische Position 1 des zweiten Satzes. Daher erzwingen sie sofortige Inversion: Das finite Verb folgt unmittelbar an Position 2 vor dem Subjekt.
  - `en`: Conjunctive adverbs (deshalb, deswegen, darum, trotzdem, sonst, jedoch) logically link clauses but count as Position 1 in the second clause. This forces immediate subject-verb inversion: the conjugated verb must immediately take Position 2 before the subject.
  - `mn`: Холбоос дайвар үгс (deshalb, trotzdem, sonst, jedoch) нь хоёр өгүүлбэрийг учир шалтгаан, үр дагавраар холбодог бөгөөд 2 дахь өгүүлбэрийн 1-р байрыг (Position 1) шууд эзэлдэг. Иймээс өгүүлбэрийн байрлал урвуу эргэж (Inversion), хувирсан үйл үг 2-р байранд ЭЗЭН БИЕИЙНХЭЭ ӨМНӨ орно. 'Sonst' нь 'эс бөгөөс / үгүй бол' гэсэн нөхцөлт утгыг илэрхийлнэ.
- **Pattern:** `[Satz 1]. / [Satz 1], + [deshalb / trotzdem / sonst / jedoch (Pos 1)] + FINITES VERB (Pos 2) + Subjekt (Pos 3) + ...`
- **Examples:**
  1. `target`: `Es regnet in Strömen, deshalb nehme ich einen Regenschirm mit.`  
     `mn`: `Хувингаар цутгах мэт бороо орж байна, тийм учраас би шүхэр авч явна.`  
     `en`: `It is raining cats and dogs; therefore, I am taking an umbrella with me.`
  2. `target`: `Er war sehr krank; trotzdem ging er zur Arbeit.`  
     `mn`: `Тэр маш хүнд өвчтэй байсан; тэгсэн хэдий ч ажилдаа явсан.`  
     `en`: `He was very ill; nevertheless, he went to work.`
  3. `target`: `Beeil dich, sonst verpassen wir den letzten Zug!`  
     `mn`: `Яараарай, эс бөгөөс бид сүүлчийн галт тэрэгнээсээ хоцрох нь!`  
     `en`: `Hurry up, otherwise we will miss the last train!`
- **Common Trap:**
  - `mn`: Англи хэлний "therefore I take..." эсвэл монгол хэлний сэтгэлгээнээс болж 'deshalb ich nehme...' гэж эзэн биеийг үйл үгийн урд тавьж БОЛОХГҮЙ! Заавал үйл үг 2-р байранд: 'deshalb NEHME ich...'.

---

### Module 03: Subjunktionen: Kausal & Temporal (weil, da, während, als vs. wenn)
- **ID:** `de_b1_subjunktionen_kausal_temporal`
- **Title:** `Subjunktionen: Kausal & Temporal (weil, da, während, als vs. wenn)`
- **Core Concept:**
  - `de`: Unterordnende Konjunktionen leiten einen Nebensatz ein und verlagern das finite Verb ans absolute Satzende. 'Weil' nennt einen neuen Grund; 'da' wird bevorzugt, wenn der Grund dem Hörer bereits bekannt ist (oft vorangestellt). 'Als' beschreibt ein einmaliges Ereignis in der Vergangenheit; 'wenn' steht für Gegenwart, Zukunft oder wiederholte Handlungen ('jedes Mal wenn'). 'Während' drückt Gleichzeitigkeit oder einen Gegensatz aus.
  - `en`: Subordinating conjunctions introduce subordinate clauses and send the conjugated verb to the absolute end of the clause. 'Weil' introduces a new reason; 'da' introduces a known premise (often at sentence start). 'Als' is strictly for a single, unique event or period in the past; 'wenn' is for present, future, or repeatable past events ('whenever'). 'Während' denotes simultaneity or contrast.
  - `mn`: Угсруулах холбоосууд (Subjunktionen) нь туслах өгүүлбэрийг үүсгэж, хувирсан үйл үгийг ХАМГИЙН ТӨГСГӨЛД аваачдаг. 'Weil' нь шинэ шалтгаан заана; 'Da' нь сонсогчид аль хэдийн мэдэгдэж буй шалтгааныг эхэнд гаргахад хэрэглэгдэнэ. 'Als' нь ЗӨВХӨН өнгөрсөнд нэг удаа болсон үйл явдалд (хүүхэд байхад, тэр өдөр ирэхэд) хэрэглэгддэг бол 'wenn' нь одоо, ирээдүй, эсвэл өнгөрсөнд давтагдсан үйлдэлд ("болгонд") хэрэглэгдэнэ.
- **Pattern:** `Hauptsatz, + [weil / da / während / als / wenn] + Subjekt + ... + FINITES VERB AM ENDE.`  
  `[Da / Als / Wenn / Weil] + Subjekt + ... + VERB AM ENDE, + FINITES VERB (Pos 1 im HS) + Subjekt...`
- **Examples:**
  1. `target`: `Als ich zehn Jahre alt war, zogen meine Eltern nach Deutschland.`  
     `mn`: `Намайг арван настай байхад эцэг эх маань Герман руу нүүсэн.`  
     `en`: `When I was ten years old, my parents moved to Germany.`
  2. `target`: `Immer wenn ich Zeit hatte, besuchte ich meine Großeltern auf dem Land.`  
     `mn`: `Зав гарах болгондоо би хөдөө байдаг эмээ өвөө дээрээ очдог байсан.`  
     `en`: `Whenever I had time, I visited my grandparents in the countryside.`
  3. `target`: `Da das Wetter heute sonnig ist, gehen wir im Park spazieren.`  
     `mn`: `Өнөөдөр цаг агаар нартай байгаа тул бид цэцэрлэгт хүрээлэнд зугаална.`  
     `en`: `Since the weather is sunny today, we are going for a walk in the park.`
  4. `target`: `Während sie für die Prüfung lernte, hörte ihr Bruder laute Musik.`  
     `mn`: `Түүнийг шалгалтандаа бэлдэж байх хооронд ах нь чанга хөгжим сонсож байв.`  
     `en`: `While she was studying for the exam, her brother was listening to loud music.`
- **Common Trap:**
  - `mn`: Өнгөрсөнд нэг удаа болсон үйл явдалд хэзээ ч 'wenn' ашиглаж болохгүй! "When I was young" = 'Als ich jung war' (хэзээ ч: 'Wenn ich jung war' гэж болохгүй!). Хэрэв туслах өгүүлбэрээр эхэлбэл таслалын дараа шууд үйл үг орно (Verb-Verb холбоос: ...war, ZOGEN meine Eltern...).

---

### Module 04: Konnektoren-Vergleich: Cause & Effect (denn vs. weil vs. deshalb)
- **ID:** `de_b1_matrix_denn_weil_deshalb`
- **Title:** `Konnektoren-Vergleich: Cause & Effect (denn vs. weil vs. deshalb)`
- **Core Concept:**
  - `de`: Drei Wege, denselben Kausalzusammenhang auszudrücken, mit drei völlig unterschiedlichen Satzstrukturen: 'Denn' (Pos 0: Hauptsatz + Hauptsatz), 'Weil' (Nebensatz: Verb am Satzende), 'Deshalb / Deswegen / Darum' (Pos 1: Hauptsatz mit Inversion).
  - `en`: Three grammatical mechanisms express the exact same cause-and-effect relationship using three completely different syntactic patterns: 'Denn' (Pos 0: main clause + main clause), 'Weil' (subordinate clause: finite verb at the very end), and 'Deshalb' (Pos 1: main clause with inversion).
  - `mn`: Нэг ижил учир шалтгааны утгыг илэрхийлэхэд герман хэлний бүтцийн 3 өөр хөдөлгүүр ажилладаг: 1) 'Denn' (0-р байрлал, бүтцийг өөрчлөхгүй: эзэн бие + үйл үг), 2) 'Weil' (туслах өгүүлбэр: үйл үг өгүүлбэрийн төгсгөлд), 3) 'Deshalb' (1-р байрлал: хувирсан үйл үг шууд дараа нь орж, эзэн бие ард нь гарна).
- **Pattern:**
  - `[Wirkung], denn + Subjekt + FINITES VERB... (Pos 0)`
  - `[Wirkung], weil + Subjekt + ... + FINITES VERB (Verb-Ende)`
  - `[Ursache]. Deshalb + FINITES VERB + Subjekt... (Pos 1 Inversion)`
- **Examples:**
  1. `target`: `Ich bleibe zu Hause, denn ich bin krank.`  
     `mn`: `Би гэртээ үлдэнэ, учир нь би өвчтэй байна.`  
     `en`: `I am staying home, for I am sick.`
  2. `target`: `Ich bleibe zu Hause, weil ich krank bin.`  
     `mn`: `Би өвчтэй байгаа учраас гэртээ үлдэнэ.`  
     `en`: `I am staying home because I am sick.`
  3. `target`: `Ich bin krank. Deshalb bleibe ich zu Hause.`  
     `mn`: `Би өвчтэй байна. Тийм учраас би гэртээ үлдэнэ.`  
     `en`: `I am sick. Therefore, I am staying home.`
- **Common Trap:**
  - `mn`: Шалгалт дээр хамгийн их гаргадаг алдаа: 'Weil'-ийн дараа үйл үгийг 2-р байранд үлдээх (*weil ich bin krank), эсвэл 'Deshalb'-ийн дараа эзэн биеийг урд нь оруулах (*deshalb ich bleibe). Энэ гурван бүтэц тус бүрийн томьёог математик шиг цээжил!

---

### Module 05: Adjektivdeklination Typ 1: Nach bestimmtem Artikel (Schwache Deklination)
- **ID:** `de_b1_adjektiv_typ1_bestimmt`
- **Title:** `Adjektivdeklination Typ 1: Nach bestimmtem Artikel (der/die/das)`
- **Core Concept:**
  - `de`: Steht vor dem Adjektiv ein bestimmter Artikel (der, die, das) oder ein Artikelwort mit fester Endung (dieser, jener, jeder, welcher), trägt der Artikel bereits das grammatische Kasussignal. Das Adjektiv hat nur zwei Endungen: '-e' (Nominativ Singular m/f/n und Akkusativ Singular f/n) und '-en' (alle Dativ-, alle Genitiv-, alle Pluralformen sowie Akkusativ Maskulin). Merkregel: "5-mal -e, sonst immer -en".
  - `en`: When preceded by a definite article (der, die, das) or definite determiner (dieser, jeder), the article already clearly shows gender and case. Therefore, the adjective needs only two possible endings: '-e' (Nominative Sg m/f/n and Accusative Sg f/n) and '-en' (all Dative, all Genitive, all Plurals, and Accusative Masculine). Mnemonic rule: "5 times -e, all others -en".
  - `mn`: Төлөөний үг/тодорхой ялгац гишүүн (der, die, das, dieser, jeder) урд нь орсон үед ялгац гишүүн нь хүйс, тийн ялгалыг аль хэдийн тодорхой зааж өгсөн байдаг. Иймээс тэмдэг нэр ердөө ХОЁРХОН төгсгөл авдаг: '-e' болон '-en'. Дүрэм: Нэрлэхийн ганц тоо (эр, эм, саармаг) болон Заахын ганц тооны эм, саармаг дээр '-e' (нийт 5 тохиолдол), бусад БҮХ тохиолдолд (Датив бүх хүйс, Генитив бүх хүйс, Олон тоо бүгд, Заахын эр хүйс) '-en' авна.
- **Pattern:**
  - `Nom Sg: der neue Tisch (-e) | die neue Lampe (-e) | das neue Auto (-e)`
  - `Akk Sg: den neuen Tisch (-en) | die neue Lampe (-e) | das neue Auto (-e)`
  - `Dat Sg: dem neuen Tisch (-en) | der neuen Lampe (-en) | dem neuen Auto (-en)`
  - `Plural (Nom/Akk/Dat/Gen): die neuen Tische / den neuen Tischen (-en)`
- **Examples:**
  1. `target`: `Der fleißige Student beantwortet die schwere Frage.`  
     `mn`: `Хичээнгүй оюутан тэр хэцүү асуултад хариулж байна.`  
     `en`: `The hardworking student answers the difficult question.`
  2. `target`: `Wir haben mit dem erfahrenen Arzt gesprochen.`  
     `mn`: `Бид туршлагатай эмчтэй ярилцсан.`  
     `en`: `We spoke with the experienced doctor.`
  3. `target`: `Er sucht den verlorenen Schlüssel im ganzen Haus.`  
     `mn`: `Тэр гээсэн түлхүүрээ байшингаар дүүрэн хайж байна.`  
     `en`: `He is looking for the lost key throughout the entire house.`
- **Common Trap:**
  - `mn`: Датив (dem, der, dem) болон Олон тоонд (die) тодорхой ялгац гишүүний ард орсон тэмдэг нэр ҮРГЭЛЖ '-en' авдаг гэдгийг мартдаг (*mit dem neuem Auto - БУРУУ! ЗӨВ: mit dem neuen Auto).

---

### Module 06: Adjektivdeklination Typ 2: Nach unbestimmtem / Possessiv-Artikel (Gemischte Deklination)
- **ID:** `de_b1_adjektiv_typ2_gemischt`
- **Title:** `Adjektivdeklination Typ 2: Nach unbestimmtem / Possessiv-Artikel (ein, kein, mein)`
- **Core Concept:**
  - `de`: Nach unbestimmtem Artikel (ein, eine, ein), Negationsartikel (kein) und Possessivartikeln (mein, dein, sein...) muss das Adjektiv dort das Genus signalisieren, wo der Artikel keine Endung hat: Maskulin Nominativ (-er: ein alter Wagen) und Neutral Nominativ/Akkusativ (-es: ein neues Haus). Sobald der Artikel eine flektierte Endung besitzt (-en, -em, -er, -es), endet das Adjektiv auf '-en'.
  - `en`: After indefinite articles (ein), negation (kein), and possessive determiners (mein, dein, etc.), the adjective must step in to signal the gender wherever the article lacks an ending: Masculine Nom (-er: ein guter Mann) and Neuter Nom/Acc (-es: ein neues Buch). Wherever the article shows a regular inflectional ending (-en, -em, -er), the adjective takes '-en'.
  - `mn`: Тодорхойгүй ялгац гишүүн (ein), үгүйсгэл (kein) болон хамаатуулах төлөөний үгийн (mein, dein...) ард тэмдэг нэр нь ялгац гишүүний төгсгөлгүй үлдсэн газруудад хүйсийн тэмдгийг өөр дээрээ авдаг: Эр хүйс Нэрлэхийн тийн ялгалд '-er' (ein neuer Wagen), Саармаг хүйс Нэрлэх ба Заахын тийн ялгалд '-es' (ein schönes Haus). Харин ялгац гишүүн нь өөрөө төгсгөлтэй болсон бүх газарт (нөхцөл залгагдсан) тэмдэг нэр '-en' авна.
- **Pattern:**
  - `Nom: ein guter Mann (-er) | eine gute Frau (-e) | ein gutes Kind (-es)`
  - `Akk: einen guten Mann (-en) | eine gute Frau (-e) | ein gutes Kind (-es)`
  - `Dat: einem guten Mann (-en) | einer guten Frau (-en) | einem guten Kind (-en)`
  - `Plur (keine/meine): meine guten Freunde (-en)`
- **Examples:**
  1. `target`: `Mein alter Computer funktioniert leider nicht mehr richtig.`  
     `mn`: `Миний хуучин компьютер харамсалтай нь олигтой ажиллахаа больсон.`  
     `en`: `My old computer unfortunately no longer works properly.`
  2. `target`: `Sie hat ein interessantes Angebot von einer deutschen Firma erhalten.`  
     `mn`: `Тэрээр германы нэгэн компаниас сонирхолтой санал хүлээн авсан.`  
     `en`: `She received an interesting offer from a German company.`
  3. `target`: `Wir suchen eine erfahrene Lehrkraft für unsere Schule.`  
     `mn`: `Бид сургуульдаа туршлагатай багш хайж байна.`  
     `en`: `We are looking for an experienced teacher for our school.`
- **Common Trap:**
  - `mn`: 'Ein'-ийн ард эр хүйс нэрлэхийн тийн ялгалд '-e' залгаж болохгүй (*ein gut Mann / *ein gute Mann - БУРУУ!). Эр хүйс дээр заавал 'ein gutER Mann', саармаг хүйс дээр 'ein neuES Auto' болно.

---

### Module 07: Adjektivdeklination Typ 3: Ohne Artikel (Starke Deklination / Nullartikel)
- **ID:** `de_b1_adjektiv_typ3_nullartikel`
- **Title:** `Adjektivdeklination Typ 3: Ohne Artikel (Nullartikel - Starke Deklination)`
- **Core Concept:**
  - `de`: Steht kein Artikel vor dem Adjektiv (z.B. bei unzählbaren Stoffen, Lebensmitteln oder artikellosem Plural), muss das Adjektiv das grammatische Kasus- und Genussignal des bestimmten Artikels vollständig selbst tragen. Einzige Ausnahme: Genitiv Singular Maskulin und Neutral enden auf '-en' (nicht auf '-es', da das Substantiv bereits das Genitiv-s trägt).
  - `en`: When no article precedes the adjective (uncountable materials, food, beverage, abstract nouns, or bare plurals), the adjective must bear the full grammatical gender and case signals of the definite article. The only exception: Genitive Singular Masculine and Neuter take '-en' (not '-es', because the noun already carries the -(e)s genitive suffix).
  - `mn`: Тэмдэг нэрийн урд ямар ч ялгац гишүүн байхгүй үед (тоолэгддэггүй шингэн, хоол хүнс, олон тооны нэр үгс) тэмдэг нэр нь 'der, die, das'-ийн төгсгөлийг БҮРЭН өөр дээрээ авна. Ганц онцгой тохиолдол: Эр болон Саармаг хүйсийн харьяалахын тийн ялгалд (Genitiv) нэр үг нь өөрөө -(e)s авдаг тул давхардуулахгүйн тулд тэмдэг нэр нь '-es' биш, харин '-en' авна (kalten Wassers).
- **Pattern:**
  - `Nom: frischer Kaffee (-er) | kalte Milch (-e) | frisches Brot (-es) | frische Früchte (-e)`
  - `Akk: frischen Kaffee (-en) | kalte Milch (-e) | frisches Brot (-es) | frische Früchte (-e)`
  - `Dat: frischem Kaffee (-em) | kalter Milch (-er) | frischem Brot (-em) | frischen Früchten (-en)`
  - `Gen: frischen Kaffees (-en!) | kalter Milch (-er) | frischen Brotes (-en!) | frischer Früchte (-er)`
- **Examples:**
  1. `target`: `Deutsches Bier und französischer Käse sind weltberühmt.`  
     `mn`: `Герман шар айраг, франц бяслаг дэлхийд алдартай.`  
     `en`: `German beer and French cheese are world-famous.`
  2. `target`: `Mit großem Interesse habe ich Ihre Anzeige in der Zeitung gelesen.`  
     `mn`: `Би сонин дээрх танай зарыг маш их сонирхон уншлаа.`  
     `en`: `With great interest, I read your advertisement in the newspaper.`
  3. `target`: `Trotz starken Regens gingen die Kinder nach draußen.`  
     `mn`: `Ширүүн бороо орж байсан хэдий ч хүүхдүүд гадагшаа гарсан.`  
     `en`: `Despite heavy rain, the children went outside.`
- **Common Trap:**
  - `mn`: Датив ганц тооны эр ба саармаг дээр 'dem'-ийн '-em' төгсгөлийг авах ёстойг мартаж '-en' гэж бичдэг (*mit großEN Interesse - БУРУУ! ЗӨВ: mit großEM Interesse).

---

### Module 08: Verben mit festen Präpositionen: Akkusativ
- **ID:** `de_b1_verben_praep_akkusativ`
- **Title:** `Verben mit festen Präpositionen: Akkusativ (warten auf, sich erinnern an, sich freuen)`
- **Core Concept:**
  - `de`: Viele deutsche Verben verlangen eine feste Präposition mit obligatorischem Akkusativ. Die Präposition darf nicht wörtlich aus anderen Sprachen übersetzt werden, sondern bildet eine idiomatische Einheit mit dem Verb. 'Sich freuen auf' bezieht sich auf die Zukunft; 'sich freuen über' auf die Gegenwart oder Vergangenheit.
  - `en`: Many German verbs require a fixed preposition governing the Accusative case. These prepositions cannot be translated literally from other languages; they form an inseparable semantic unit. 'Sich freuen auf' looks forward to a future event; 'sich freuen über' expresses pleasure about a present or past circumstance.
  - `mn`: Германы олон үйл үгс араасаа заавал тодорхой угтвар үг (Präposition) болон Заахын тийн ялгал (Akkusativ) шаарддаг. Эдгээр угтвар үгсийг англи эсвэл монгол хэлнээс шууд орчуулж болохгүй, тухайн үйл үгтэйгээ салшгүй нэгдэл болж цээжлэгддэг. Жишээ нь: 'sich freuen auf + Akk' нь ирээдүйд болох зүйлийг тэсэн ядан хүлээх; 'sich freuen über + Akk' нь одоо/өнгөрсөнд болсон зүйлд баярлахыг заана.
- **Pattern:** `Subjekt + Verb + [auf / an / über / für / um] + AKKUSATIV-OBJEKT`
  - `warten auf + Akk (хүлээх)`
  - `denken an + Akk (бодох)`
  - `sich erinnern an + Akk (санах)`
  - `sich freuen auf + Akk (ирээдүйд баярлах/хүлээх)`
  - `sich freuen über + Akk (болсон зүйлд баярлах)`
  - `sich interessieren für + Akk (сонирхох)`
  - `bitten um + Akk (хүсэх, гуйх)`
  - `sich ärgern über + Akk (бухимдах, уурлах)`
  - `hoffen auf + Akk (найдах)`
- **Examples:**
  1. `target`: `Ich warte seit einer halben Stunde auf den nächsten Bus.`  
     `mn`: `Би дараагийн автобусыг хагас цагийн турш хүлээж байна.`  
     `en`: `I have been waiting for the next bus for half an hour.`
  2. `target`: `Wir freuen uns schon sehr auf den gemeinsamen Urlaub im Sommer.`  
     `mn`: `Бид зуны хамтын амралтаа одооноос маш их тэсэн ядан хүлээж байна.`  
     `en`: `We are already looking forward very much to our joint vacation in summer.`
  3. `target`: `Er erinnert sich noch genau an seinen ersten Schultag.`  
     `mn`: `Тэр сургуульд орсон анхны өдрөө одоо ч маш тод санадаг.`  
     `en`: `He still remembers his first day of school clearly.`
- **Common Trap:**
  - `mn`: 'Warten auf' гэдэг үйл үгийн араас 'für' ашиглаж англи хэлний "wait for"-той андуурч БОЛОХГҮЙ (*Ich warte für dich - БУРУУ! ЗӨВ: Ich warte auf dich). 'Bitten' нь 'um + Akk' авдаг: *Ich bitte um Hilfe.

---

### Module 09: Verben mit festen Präpositionen: Dativ
- **ID:** `de_b1_verben_praep_dativ`
- **Title:** `Verben mit festen Präpositionen: Dativ (teilnehmen an, abhängen von, gehören zu)`
- **Core Concept:**
  - `de`: Zahlreiche Verben binden ihre Ergänzung fest über Präpositionen mit Dativ (an, von, zu, mit, bei, nach). Sie antworten auf die Frage 'Mit wem / Woran / Wovon?'.
  - `en`: A large set of core verbs bind their objects via fixed prepositions requiring the Dative case (an, von, zu, mit, bei, nach). They answer the questions 'Mit wem? / Woran? / Wovon?'.
  - `mn`: Олон чухал үйл үгс заавал Датив тийн ялгал шаарддаг угтвар үгстэй (an, von, zu, mit, bei, nach) хоршиж хэрэглэгддэг. Асуулт нь: 'Хэнтэй? / Юунаас? / Юунд? (Mit wem? / Wovon? / Woran?)'.
- **Pattern:** `Subjekt + Verb + [an / von / zu / mit / bei] + DATIV-OBJEKT`
  - `teilnehmen an + Dat (оролцох)`
  - `abhängen von + Dat (хамаарах)`
  - `gehören zu + Dat (харьяалагдах, хамаарах)`
  - `sich beschäftigen mit + Dat (эрхлэх, завгүй байх)`
  - `träumen von + Dat (мөрөөдөх)`
  - `gratulieren zu + Dat (баяр хүргэх)`
  - `passen zu + Dat (зохих, нийцэх)`
  - `einladen zu + Dat (урих)`
- **Examples:**
  1. `target`: `Nächste Woche nehme ich an einem internationalen Seminar teil.`  
     `mn`: `Ирэх долоо хоногт би олон улсын семинарт оролцоно.`  
     `en`: `Next week I am participating in an international seminar.`
  2. `target`: `Der Erfolg der Verhandlung hängt von vielen Faktoren ab.`  
     `mn`: `Хэлэлцээрийн амжилт олон хүчин зүйлээс шалтгаална.`  
     `en`: `The success of the negotiation depends on many factors.`
  3. `target`: `Ich gratuliere dir von ganzem Herzen zu deiner bestandenen Prüfung!`  
     `mn`: `Шалгалтаа амжилттай давсанд чинь чин сэтгэлээсээ баяр хүргэе!`  
     `en`: `I congratulate you with all my heart on passing your exam!`
- **Common Trap:**
  - `mn`: 'Teilnehmen' нь 'in' биш 'an + Dativ' авдаг (*teilnehmen im Seminar - БУРУУ! ЗӨВ: am Seminar). 'Gratulieren' нь 'zu + Dativ' авдаг: 'Ich gratuliere dir ZUM Geburtstag' (für биш!).

---

### Module 10: Pronominaladverbien & Fragewörter (Worauf / Auf wen? Da(r)-)
- **ID:** `de_b1_pronominaladverbien`
- **Title:** `Pronominaladverbien & Fragewörter: Wo(r)- & Da(r)- vs. Präposition + Pronomen`
- **Core Concept:**
  - `de`: Bei Verben mit Präpositionen entscheidet der Bezug: Bei Personen nutzt man die Präposition direkt mit einem Fragewort oder Personalpronomen (Auf wen? / Auf ihn. Mit wem? / Mit ihr.). Bei Sachen oder Sachverhalten verschmelzen Fragewort und Pronomen zu Pronominaladverbien: 'wo(r)-' für Fragen (Worauf? Wovon?) und 'da(r)-' für Aussagen (Darauf, davon). Beginnt die Präposition mit einem Vokal, wird ein Einschub-r eingefügt (da-r-auf, wo-r-an).
  - `en`: When questioning or referencing prepositional objects, German strictly differentiates persons from things: For persons, use the preposition + pronoun directly (*Auf wen? / Auf ihn*). For things or abstract actions, combine with *wo(r)-* for questions (*Worauf?*) and *da(r)-* for references (*Darauf*). If the preposition starts with a vowel, an epenthetic '-r-' is inserted (*da-r-an*, *wo-r-über*).
  - `mn`: Угтвар үгтэй үйл үгэнд хүний тухай ярьж байна уу, эд зүйл/үзэгдлийн тухай ярьж байна уу гэдгээс шалтгаалан хоёр өөр дүрэм үйлчилнэ: 1) Хүн дээр угтвар үгийг шууд хэрэглэнэ (Auf wen? / Auf ihn). 2) Эд зүйл, хийсвэр ойлголт дээр 'Wo(r)-' асуултад (Worauf? Womit?), харин 'Da(r)-' хариултад (Darauf, damit) залгагдана. Хэрэв угтвар үг эгшгээр эхэлбэл дунд нь 'r' авиа нэмэгдэнэ (da-r-auf, wo-r-an).
- **Pattern:**
  - `Personen: [Präposition] + wen/wem? -> [Präposition] + ihn/sie/ihm/ihr`
  - `Sachen: Wo(r) + [Präposition]? -> Da(r) + [Präposition]`
  - `Einschub-r bei Vokal: wo + r + auf = worauf | da + r + an = daran`
- **Examples:**
  1. `target`: `Auf wen wartest du? – Ich warte auf meine Kollegin.`  
     `mn`: `Чи хэнийг хүлээж байгаа юм бэ? – Би хамтран ажиллагч бүсгүйгээ хүлээж байна.`  
     `en`: `Whom are you waiting for? – I am waiting for my colleague.`
  2. `target`: `Worauf wartest du? – Ich warte auf den Bus. / Ich warte darauf.`  
     `mn`: `Чи юу хүлээж байгаа юм бэ? – Би автобус хүлээж байна. / Би түүнийг хүлээж байна.`  
     `en`: `What are you waiting for? – I am waiting for the bus. / I am waiting for it.`
  3. `target`: `Woran denkst du gerade? – Ich denke daran, wie schön der Urlaub war.`  
     `mn`: `Чи яг одоо юу бодож байна вэ? – Амралт ямар гоё байсан тухай бодож байна.`  
     `en`: `What are you thinking about right now? – I am thinking about how wonderful the vacation was.`
- **Common Trap:**
  - `mn`: Хүний тухай асуухдаа хэзээ ч 'worauf/womit' гэж болохгүй! "Who are you waiting for?" = 'Auf wen wartest du?' (биш: *Worauf wartest du?). Мөн эд зүйл дээр "für was" гэж ярих нь ярианы бүдүүлэг алдаа бөгөөд зөв хэлбэр нь 'Wofür' юм.

---

### Module 11: Reine Dativ-Verben (helfen, danken, gefallen, gehören, zustimmen)
- **ID:** `de_b1_verben_reiner_dativ`
- **Title:** `Reine Dativ-Verben: Verben mit obligatorischem Dativobjekt`
- **Core Concept:**
  - `de`: Eine definierte Gruppe hochfrequenter Verben regiert ausschließlich den Dativ (ohne Präposition). Im Englischen oder Mongolischen entsprechen diese Verben oft transitiven Verben mit Akkusativobjekt, weshalb sie zu den häufigsten Fehlerquellen zählen.
  - `en`: A specific group of essential German verbs strictly governs the Dative case as their sole object. Many of these correspond to direct transitive verbs in English or Mongolian (e.g. to help someone = *helfen + Dat*), making them a frequent source of errors.
  - `mn`: Зарим өндөр давтамжтай үйл үгс араасаа заавал өгөх оршихын тийн ялгал (Dativ) шаарддаг. Англи эсвэл монгол хэлэнд "туслах", "баярлах" гэдэг үг шууд заахын тийн ялгал (хэнийг? юуг?) авдаг бол герман хэлэнд ЗААВАЛ Датив (хэнд? юунд?) авна.
- **Pattern:** `Subjekt + FINITES VERB + DATIV-OBJEKT (dem / der / dem / den + -n | mir / dir / ihm / ihr / uns / euch / ihnen)`
  - `helfen (туслах) + Dativ`
  - `danken (баярлах) + Dativ`
  - `gehören (харьяалагдах) + Dativ`
  - `gefallen (таалагдах) + Dativ`
  - `schmecken (амтагдах) + Dativ`
  - `passen (тохирох/таарах) + Dativ`
  - `vertrauen (итгэх) + Dativ`
  - `zustimmen (зөвшөөрөх/санал нийлэх) + Dativ`
  - `widersprechen (эсэргүүцэх/сөргөлдөх) + Dativ`
  - `fehlen (дутагдах/үгүйлэгдэх) + Dativ`
- **Examples:**
  1. `target`: `Kannst du mir bitte bei dieser schweren Aufgabe helfen?`  
     `mn`: `Чи надад энэ хүнд даалгавар дээр тусалж чадах уу?`  
     `en`: `Can you please help me with this difficult task?`
  2. `target`: `Ich stimme dem Vorschlag des Direktors vollkommen zu.`  
     `mn`: `Би захирлын саналыг бүрэн дүүрэн дэмжиж байна.`  
     `en`: `I completely agree with the director’s proposal.`
  3. `target`: `Der Zeuge widersprach den Aussagen der Angeklagten.`  
     `mn`: `Гэрч шүүгдэгчийн мэдүүлгийг эрс үгүйсгэж сөргөлдөв.`  
     `en`: `The witness contradicted the statements of the accused.`
- **Common Trap:**
  - `mn`: Англи хэлний "help me" гэдгээс шууд хуулбарлан 'Hilf mich' гэж хэлж БОЛОХГҮЙ! Заавал 'Hilf MIR' (Dativ). Мөн 'zustimmen' болон 'widersprechen' нь Akkusativ биш заавал Dativ авна (*Ich stimme dich zu - БУРУУ! ЗӨВ: Ich stimme DIR zu).

---

### Module 12: Wechselpräpositionen & Positionsverben (legen/liegen, stellen/stehen)
- **ID:** `de_b1_wechselpraep_positionsverben`
- **Title:** `Wechselpräpositionen & Positionsverben: Akkusativ (Wohin?) vs. Dativ (Wo?)`
- **Core Concept:**
  - `de`: Die 9 Wechselpräpositionen (an, auf, hinter, in, neben, über, unter, vor, zwischen) fordern den Akkusativ bei Richtungsangabe (Wohin?) und den Dativ bei Ortsangabe (Wo?). Sie korrespondieren exakt mit zwei Verbgruppen: Den transitiven, schwachen Handlungsverben (stellen, legen, setzen, hängen -> Wohin? + Akk) und den intransitiven, starken Positionsverben (stehen, liegen, sitzen, hängen -> Wo? + Dat).
  - `en`: The 9 two-way prepositions govern Accusative for directional movement (Wohin?) and Dative for static location (Wo?). They map strictly to two verb families: transitive action verbs (stellen, legen, setzen, hängen + Akk) and intransitive state verbs (stehen, liegen, sitzen, hängen + Dat).
  - `mn`: Байрлал заах 9 угтвар үг (an, auf, hinter, in, neben, über, unter, vor, zwischen) нь чиглэсэн хөдөлгөөн заавал (Хаашаа? - Wohin?) Akkusativ, харин тогтсон байрлал заавал (Хаана? - Wo?) Dativ авдаг. Эдгээр нь герман хэлний үйл үгийн хосуудтай шууд харгалздаг: Үйлдлийн үйл үгс (stellen, legen, setzen -> Akkusativ) ба Байрлалын үйл үгс (stehen, liegen, sitzen -> Dativ).
- **Pattern:**
  - `AKKUSATIV (Wohin? - Aktion): Subjekt + [legen / stellen / setzen / hängen] + Akk-Objekt + Präp + AKKUSATIV`
  - `DATIV (Wo? - Zustand): Subjekt + [liegen / stehen / sitzen / hängen] + Präp + DATIV`
  - `Paare: stellen (Akk) <-> stehen (Dat) | legen (Akk) <-> liegen (Dat) | setzen (Akk) <-> sitzen (Dat) | hängen (Akk) <-> hängen (Dat)`
- **Examples:**
  1. `target`: `Ich lege das Buch auf den Tisch. – Jetzt liegt das Buch auf dem Tisch.`  
     `mn`: `Би номыг ширээн дээр тавьж байна (хэвтүүлж). – Одоо ном ширээн дээр хэвтэж байна.`  
     `en`: `I lay the book on the table. – Now the book is lying on the table.`
  2. `target`: `Er stellt die Tasse in den Schrank. – Die Tasse steht im Schrank.`  
     `mn`: `Тэр аягыг шүүгээ рүү хийж байна (босгож). – Аяга шүүгээн дотор байна.`  
     `en`: `He puts the cup into the cupboard. – The cup is standing in the cupboard.`
  3. `target`: `Sie setzt das Kind auf den Stuhl. – Das Kind sitzt auf dem Stuhl.`  
     `mn`: `Тэр хүүхдийг сандал дээр суулгаж байна. – Хүүхэд сандал дээр сууж байна.`  
     `en`: `She seats the child on the chair. – The child is sitting on the chair.`
- **Common Trap:**
  - `mn`: 'Legen' (Akkusativ) болон 'Liegen' (Dativ)-ийг хольж болохгүй! "Das Buch legt auf dem Tisch" гэж ярьж БОЛОХГҮЙ, ном өөрөө хэвтэж байгаа тул 'liegt auf dem Tisch' болно.

---

### Module 13: Reflexive Verben: Akkusativ vs. Dativ
- **ID:** `de_b1_reflexiv_akk_dat`
- **Title:** `Reflexive Verben: Akkusativ- vs. Dativ-Reflexivpronomen`
- **Core Concept:**
  - `de`: Reflexivpronomen unterscheiden sich nur in der 1. und 2. Person Singular (mich/mir, dich/dir). Ist die reflexive Handlung das alleinige Objekt des Verbs, steht das Reflexivpronomen im Akkusativ (Ich wasche mich). Tritt jedoch ein eigenständiges Akkusativobjekt hinzu, weicht das Reflexivpronomen in den Dativ aus (Ich wasche mir die Hände).
  - `en`: Reflexive pronouns differ between Accusative and Dative only in the 1st and 2nd person singular (mich vs. mir, dich vs. dir). When the reflexive action is the direct object, use the Accusative (*Ich wasche mich*). However, if an explicit direct object is already present, the reflexive pronoun shifts to the Dative (*Ich wasche mir die Hände*).
  - `mn`: Тусах төлөөний үг (Reflexivpronomen) нь зөвхөн 1 ба 2-р биеийн ганц тоон дээр ялгаатай хэлбэртэй байдаг (mich/mir, dich/dir). Хэрэв өгүүлбэрт өөр шууд тусагдахуун (Akkusativ) байхгүй бол тусах төлөөний үг нь Akkusativ (mich/dich) байна. Харин өгүүлбэрт нэрлэсэн шууд тусагдахуун орж ирвэл тусах төлөөний үг нь Датив (mir/dir) болж шилжинэ.
- **Pattern:**
  - `Kein weiteres Objekt -> AKKUSATIV: Subjekt + Verb + mich / dich / sich / uns / euch / sich`
  - `Mit Akkusativobjekt -> DATIV: Subjekt + Verb + mir / dir / sich / uns / euch / sich + AKKUSATIVOBJEKT`
- **Examples:**
  1. `target`: `Ich wasche mich jeden Morgen kalt.`  
     `mn`: `Би өглөө бүр хүйтэн усаар биеэ угаадаг.`  
     `en`: `I wash myself with cold water every morning.`
  2. `target`: `Ich wasche mir vor dem Essen gründlich die Hände.`  
     `mn`: `Би хоол идэхийнхээ өмнө гараа маш сайн угаадаг.`  
     `en`: `I wash my hands thoroughly before eating.`
  3. `target`: `Hast du dir schon einen neuen Mantel gekauft?`  
     `mn`: `Чи өөртөө шинэ пальто худалдаж авч амжсан уу?`  
     `en`: `Have you already bought yourself a new coat?`
  4. `target`: `Ich kann mir diese komplizierte Grammatikregel einfach nicht merken.`  
     `mn`: `Би энэ түвэгтэй дүрмийг ерөөсөө цээжилж тогтоож чадахгүй байна.`  
     `en`: `I simply cannot memorize this complicated grammar rule.`
- **Common Trap:**
  - `mn`: "Би шүдээ угааж байна" гэхэд 'Ich putze mich die Zähne' гэж хэлж БОЛОХГҮЙ! Учир нь 'die Zähne' нь Akkusativ тул төлөөний үг нь Dativ болж 'Ich putze MIR die Zähne' болно.

---

### Module 14: Infinitiv mit 'um...zu' vs. 'damit' (Subjektidentität)
- **ID:** `de_b1_um_zu_vs_damit`
- **Title:** `Infinitiv mit 'um...zu' vs. 'damit': Finale Absichten & Subjektidentität`
- **Core Concept:**
  - `de`: Sowohl 'um...zu' als auch 'damit' drücken eine Absicht oder ein Ziel aus (Wozu?). Die Infinitivkonstruktion 'um...zu' darf NUR verwendet werden, wenn das Subjekt des Hauptsatzes mit dem gedachten Subjekt des Infinitivsatzes identisch ist (Subjektidentität). Sind die Subjekte verschieden, ist 'damit' obligatorisch. Bei Subjektidentität ist beides möglich, 'um...zu' gilt jedoch als eleganter und prägnanter.
  - `en`: Both 'um...zu' and 'damit' express purpose or goal (In order to / So that). The infinitive construction 'um...zu' can ONLY be used when the subject of the main clause is identical to the implied subject of the infinitive clause. If the subjects are different, 'damit' is strictly mandatory. If the subjects are identical, both can be used, but 'um...zu' is preferred.
  - `mn`: Зорилго илэрхийлэхэд (Ямар зорилгоор? - Wozu?) 'um...zu' (тулд) болон 'damit' (тулд / -ын тулд) хоёрыг хэрэглэнэ. 'Um...zu' бүтцийг ЗӨВХӨН хоёр өгүүлбэрийн эзэн бие НЭГ ХҮН (Subjektidentität) байх үед л ашиглаж болно. Харин хоёр өгүүлбэрийн эзэн бие ӨӨР ХҮМҮҮС байвал ЗААВАЛ 'damit'-ийг хэрэглэнэ.
- **Pattern:**
  - `Gleiches Subjekt: Subjekt + Verb..., um + ... + (trennbare: ...-zu-...) + INFINITIV.`
  - `Verschiedene Subjekte: Subjekt 1 + Verb..., damit + Subjekt 2 + ... + FINITES VERB AM ENDE.`
- **Examples:**
  1. `target`: `Ich lerne täglich Deutsch, um in Deutschland Medizin zu studieren.`  
     `mn`: `Би Германд анагаахаар суралцахын тулд өдөр бүр герман хэл сурч байна.`  
     `en`: `I study German daily in order to study medicine in Germany.`
  2. `target`: `Der Vater arbeitet Überstunden, damit seine Kinder eine gute Ausbildung bekommen.`  
     `mn`: `Эцэг нь хүүхдүүддээ сайн боловсрол олгохын тулд илүү цагаар ажилладаг.`  
     `en`: `The father works overtime so that his children receive a good education.`
  3. `target`: `Er beeilt sich, um den Bus nicht zu verpassen.`  
     `mn`: `Тэр автобуснаасаа хоцрохгүйн тулд яарч байна.`  
     `en`: `He is hurrying in order not to miss the bus.`
- **Common Trap:**
  - `mn`: Эзэн бие нь өөр байгаа үед 'um...zu' ашиглаж БОЛОХГҮЙ (*Ich arbeite viel, um mein Sohn studieren kann - ИХ ТОМ АЛДАА!). Эзэн бие өөр бол заавал 'damit': ...damit mein Sohn studieren kann.

---

### Module 15: Infinitivkonstruktionen: 'ohne...zu' & 'anstatt...zu'
- **ID:** `de_b1_ohne_anstatt_zu`
- **Title:** `Infinitivkonstruktionen: 'ohne...zu' & 'anstatt...zu'`
- **Core Concept:**
  - `de`: 'Ohne...zu' drückt das Fehlen einer erwarteten Begleithandlung aus (ohne dass etwas geschieht). 'Anstatt...zu' (oder 'statt...zu') drückt eine verworfene Alternative aus (anstelle einer Handlung). Beide verlangen Subjektidentität mit dem Hauptsatz. Bei unterschiedlichen Subjekten müssen die Konjunktionen 'ohne dass' bzw. 'anstatt dass' mit finitem Verb am Ende verwendet werden.
  - `en`: 'Ohne...zu' expresses the absence of an expected accompanying action ('without doing something'). 'Anstatt...zu' expresses a replaced alternative ('instead of doing something'). Both require identical subjects. If subjects differ, use 'ohne dass' or 'anstatt dass' with the conjugated verb at the end.
  - `mn`: 'Ohne...zu' нь хүлээгдэж байсан үйлдлийг хийлгүйгээр өнгөрөхийг илэрхийлнэ ("тэгэлгүйгээр, үйлдэлгүйгээр"). 'Anstatt...zu' нь хийх ёстой байсан үйлдлийнхээ оронд өөр зүйл хийхийг заана ("тэгэхийн оронд"). Хоёулаа эзэн бие ижил байхыг шаардана. Хэрэв эзэн бие өөр байвал 'ohne dass' болон 'anstatt dass' гэж туслах өгүүлбэр болгоно.
- **Pattern:** `Hauptsatz, + [ohne / anstatt] + Ergänzungen + zu + INFINITIV.`
- **Examples:**
  1. `target`: `Er verließ das Büro, ohne sich von seinen Kollegen zu verabschieden.`  
     `mn`: `Тэр хамт ажиллагсадтайгаа салах ёс хийлгүйгээр оффисоос гарч одов.`  
     `en`: `He left the office without saying goodbye to his colleagues.`
  2. `target`: `Anstatt sich auf die Prüfung vorzubereiten, spielte er den ganzen Tag Videospiele.`  
     `mn`: `Шалгалтандаа бэлдэхийн оронд тэр өдөржин видео тоглоом тоглосон.`  
     `en`: `Instead of preparing for the exam, he played video games all day.`
  3. `target`: `Sie ging an ihm vorbei, ohne ihn zu bemerken.`  
     `mn`: `Тэр эмэгтэй түүний хажуугаар анзааралгүй зөрөөд өнгөрөв.`  
     `en`: `She walked past him without noticing him.`
- **Common Trap:**
  - `mn`: Салдаг угтвартай үйл үгэнд 'zu' нь үгийн дунд ордог: 'ohne aufZUstehen' (биш: *zu aufstehen).

---

### Module 16: Modalverben im Nebensatz & Perfekt mit Doppelinfinitiv
- **ID:** `de_b1_modalverben_syntax_perfekt`
- **Title:** `Modalverben im Nebensatz & Perfekt mit Doppelinfinitiv (Ersatzinfinitiv)`
- **Core Concept:**
  - `de`: Im Nebensatz steht das konjugierte Modalverb im Präsens und Präteritum am absoluten Satzende hinter dem Vollverb im Infinitiv. Im Perfekt bildet das Modalverb mit einem Vollverb den sogenannten 'Ersatzinfinitiv' (Doppelinfinitiv: Vollverb-Infinitiv + Modalverb-Infinitiv). Im Hauptsatz steht das Hilfsverb 'haben' an Position 2. Im Nebensatz rutscht das Hilfsverb 'hat' AUSNAHMSWEISE VOR den Doppelinfinitiv!
  - `en`: In a subordinate clause in Präsens/Präteritum, the conjugated modal verb stands at the absolute end after the infinitive full verb. In the Perfekt tense, when combined with a full verb, modal verbs trigger the 'Ersatzinfinitiv' (double infinitive: full verb infinitive + modal verb infinitive). In the main clause, 'haben' takes Position 2. In subordinate clauses, 'hat' exceptionally moves BEFORE the double infinitive!
  - `mn`: Туслах өгүүлбэрт (Nebensatz) байдлын үйл үг нь одоо ба өнгөрсөн цаг дээр өгүүлбэрийн хамгийн сүүлд үндсэн үйл үгийнхээ (Infinitiv) ард ордог. Харин Perfekt цаг дээр байдлын үйл үг нь Partizip II биш давхар инфинитив (Doppelinfinitiv / Ersatzinfinitiv) болдог: 'hat arbeiten müssen'. Туслах өгүүлбэрт 'hat' нь онцгой дүрмээр давхар инфинитивийнхээ ӨМНӨ ордог!
- **Pattern:**
  - `Präsens Nebensatz: ..., weil er heute lange arbeiten MUSS.`
  - `Präteritum Nebensatz: ..., weil er gestern lange arbeiten MUSSTE.`
  - `Perfekt Hauptsatz: Er hat gestern nicht kommen KÖNNEN (Doppelinfinitiv).`
  - `Perfekt Nebensatz: ..., weil er gestern HAT nicht kommen KÖNNEN (hat vor Doppelinfinitiv!).`
- **Examples:**
  1. `target`: `Ich konnte nicht anrufen, weil ich bis spät in die Nacht arbeiten musste.`  
     `mn`: `Би шөнө орой болтол ажиллах шаардлагатай байсан учраас залгаж чадаагүй.`  
     `en`: `I could not call because I had to work until late into the night.`
  2. `target`: `Er bedauert sehr, dass er den Termin nicht hat verschieben können.`  
     `mn`: `Тэр товолсон цагаа хойшлуулж чадаагүйдээ маш их харамсаж байна.`  
     `en`: `He very much regrets that he was not able to postpone the appointment.`
  3. `target`: `Wir haben das neue Auto leider sofort reparieren lassen müssen.`  
     `mn`: `Бид шинэ машинаа харамсалтай нь шууд засуулахаас өөр аргагүй болсон.`  
     `en`: `Unfortunately, we had to have the new car repaired immediately.`
- **Common Trap:**
  - `mn`: Perfekt цаг дээр туслах өгүүлбэрт 'hat'-ийг хамгийн төгсгөлд тавьж БОЛОХГҮЙ (*...kommen können hat - БУРУУ!). Давхар инфинитив байгаа үед 'hat' нь ямагт давхар инфинитивийн өмнө орно: '...dass er nicht HAT kommen können'.

---

## Part 3: Rigorous Audit of Verb Flashcards in `data/de/vocab_b1.json`

### 1. Root Cause Analysis of Flashcard Corruption
A comprehensive automated and manual inspection of the 224 verbs in `vocab_b1.json` reveals that an automated script generated the conjugations using a naive weak regular verb formula:
`[Stamm] + t | [Stamm] + te | hat ge + [Stamm] + t` and uniformly stamped `rektion: "+ Akkusativ"`.

This produced catastrophic errors across four structural categories:
1. **Bogus `ge-` on Inseparable Prefixes (99 Verbs):** Verbs beginning with `be-`, `ent-`, `emp-`, `er-`, `ge-`, `ver-`, `zer-`, or ending in `-ieren` NEVER take `ge-`. Current DB contains invalid forms like `hat gebewältigt`, `hat gegenehmigt`, `hat gerenoviert`, `hat getransportiert`.
2. **Separable Verb Prefix Disorder (51 Verbs):** Separable prefixes were treated as fixed, and `ge-` was placed before the prefix: `ankommen` -> `ankommt | ankommte | hat geankommt` (Correct: `kommt an | kam an | ist angekommen`).
3. **Erased Ablaut / Strong Conjugation (60+ Verbs):** Strong and mixed verbs had their vowels flattened into weak forms: `schließen` -> `schließte / hat geschließt` (Correct: `schließt | schloss | hat geschlossen`); `gelten` -> `geltt / hat gegeltt` (Correct: `gilt | galt | hat gegolten`).
4. **100% Failure on Auxiliary `sein` (`ist`):** EXACTLY ZERO verbs in `vocab_b1.json` were assigned `ist`. All verbs of motion and change of state (*ankommen, abfahren, umsteigen, einsteigen, aussteigen, umziehen, einziehen, ausziehen, einbiegen, durchfallen, pendeln*) were incorrectly given `hat`.
5. **False Rektion Assignment (214 of 224 marked `+ Akkusativ`):** Dativ verbs (*zustimmen*, *widersprechen*) and prepositional verbs (*verstoßen gegen + Akk*, *streiten über + Akk*) were stamped `+ Akkusativ`.

---

### 2. High-Yield Verbs Audit & Master Correction Table

Below is the certified linguistic audit of core B1 verbs currently corrupted in `vocab_b1.json`:

| ID | Verb | Typ | Current Broken DB Form & Rektion | Certified Correct Forms & Rektion | Linguistic Notes |
|:---|:---|:---|:---|:---|:---|
| `b1_0060` | `verschieben` | Stark | `verschiebt \| verschob \| hat verschoben` (+ Akk) | `verschiebt \| verschob \| hat verschoben` (auf + Akk / + Akk) | Stammformen correct, add preposition `auf + Akk` |
| `b1_0061` | `bewältigen` | Schwach (Insep) | `bewältigt \| bewältigte \| hat gebewältigt` | `bewältigt \| bewältigte \| hat bewältigt` (+ Akk) | Inseparable `be-`: remove bogus `ge-` |
| `b1_0062` | `verbessern` | Schwach (Insep) | `verbessert \| verbesserte \| hat geverbessert` | `verbessert \| verbesserte \| hat verbessert` (+ Akk) | Inseparable `ver-`: remove bogus `ge-` |
| `b1_0063` | `eintragen` | Stark (Sep) | `eintragt \| eintragte \| hat geeintragt` | `trägt ein \| trug ein \| hat eingetragen` (+ Akk) | Vowel shift `a->ä`, Präteritum `u`, `eingetragen` |
| `b1_0064` | `anerkennen` | Gemischt (Sep) | `anerkennt \| anerkennte \| hat geanerkennt` | `erkennt an \| erkannte an \| hat anerkannt` (+ Akk) | Separable mixed verb: `erkennt an`, `anerkannt` |
| `b1_0067` | `erreichen` | Schwach (Insep) | `erreicht \| erreichte \| hat geerreicht` | `erreicht \| erreichte \| hat erreicht` (+ Akk) | Inseparable `er-`: remove bogus `ge-` |
| `b1_0069` | `anpassen` | Schwach (Sep) | `anpasst \| anpasste \| hat geanpasst` | `passt an \| passte an \| hat angepasst` (an + Akk) | Separable: `passt an`, `angepasst` |
| `b1_0070` | `vermeiden` | Stark (Insep) | `vermeidt \| vermeidte \| hat gevermeidt` | `vermeidet \| vermied \| hat vermieden` (+ Akk) | Strong verb Ablaut: `ei -> ie -> ie`, no `ge-` |
| `b1_0141` | `beschließen` | Stark (Insep) | `beschließt \| beschließte \| hat gebeschließt` | `beschließt \| beschloss \| hat beschlossen` (+ Akk) | Strong verb: `beschloss`, `beschlossen`, no `ge-` |
| `b1_0144` | `ablehnen` | Schwach (Sep) | `ablehnt \| ablehnte \| hat geablehnt` | `lehnt ab \| lehnte ab \| hat abgelehnt` (+ Akk) | Separable verb: `lehnt ab`, `abgelehnt` |
| `b1_0147` | `vorlegen` | Schwach (Sep) | `vorlegt \| vorlegte \| hat gevorlegt` | `legt vor \| legte vor \| hat vorgelegt` (+ Akk) | Separable verb: `legt vor`, `vorgelegt` |
| `b1_0151` | `verstoßen` | Stark (Insep) | `verstoßt \| verstoßte \| hat geverstoßt` (+ Akk) | `verstößt \| verstieß \| hat verstoßen` (gegen + Akk) | Vowel shift `o->ö`, Prät `verstieß`, Rektion `gegen + Akk` |
| `b1_0155` | `nachweisen` | Stark (Sep) | `nachweist \| nachweiste \| hat genachweist` | `weist nach \| wies nach \| hat nachgewiesen` (+ Akk) | Strong sep: `weist nach`, `wies nach`, `nachgewiesen` |
| `b1_0158` | `gelten` | Stark | `geltt \| geltte \| hat gegeltt` (+ Akk) | `gilt \| galt \| hat gegolten` (für + Akk) | Vowel shift `e->i` (*gilt*), Prät *galt*, Part II *gegolten* |
| `b1_0160` | `zulassen` | Stark (Sep) | `zulasst \| zulasste \| hat gezulasst` | `lässt zu \| ließ zu \| hat zugelassen` (+ Akk) | Vowel shift `a->ä` (*lässt zu*), Prät *ließ zu*, Part II *zugelassen* |
| `b1_0162` | `widersprechen`| Stark (Insep) | `widersprecht \| widersprechte \| hat gewidersprecht` (+ Akk) | `widerspricht \| widersprach \| hat widersprochen` (+ Dativ) | Vowel shift `e->i`, Prät *widersprach*, Rektion **+ Dativ**! |
| `b1_0741` | `umziehen` | Stark (Sep) | `umzieht \| umziehte \| hat geumzieht` (+ Akk) | `zieht um \| zog um \| IST umgezogen` (nach + Dat / in + Akk) | Aux **IST**! Motion/relocation, Prät *zog um* |
| `b1_0742` | `einziehen` | Stark (Sep) | `einzieht \| einziehte \| hat geeinzieht` (+ Akk) | `zieht ein \| zog ein \| IST eingezogen` (in + Akk) | Aux **IST**! Moving in, Prät *zog ein* |
| `b1_0743` | `ausziehen` | Stark (Sep) | `auszieht \| ausziehte \| hat geauszieht` (+ Akk) | `zieht aus \| zog aus \| IST ausgezogen` (aus + Dat) | Aux **IST**! Moving out (clothing: hat ausgezogen) |
| `b1_0745` | `einsteigen` | Stark (Sep) | `einsteigt \| einsteigte \| hat geeinsteigt` (+ Akk) | `steigt ein \| stieg ein \| IST eingestiegen` (in + Akk) | Aux **IST**! Prät *stieg ein*, Part II *eingestiegen* |
| `b1_0746` | `aussteigen` | Stark (Sep) | `aussteigt \| aussteigte \| hat geaussteigt` (+ Akk) | `steigt aus \| stieg aus \| IST ausgestiegen` (aus + Dat) | Aux **IST**! Prät *stieg aus*, Part II *ausgestiegen* |
| `b1_0749` | `abfahren` | Stark (Sep) | `abfahrt \| abfahrte \| hat geabfahrt` (+ Akk) | `fährt ab \| fuhr ab \| IST abgefahren` (von/nach + Dat) | Aux **IST**! Vowel shift `a->ä`, Prät *fuhr ab* |
| `b1_0750` | `ankommen` | Stark (Sep) | `ankommt \| ankommte \| hat geankommt` (+ Akk) | `kommt an \| kam an \| IST angekommen` (in/an + Dat) | Aux **IST**! Separable: `kommt an`, Prät *kam an* |
| `b1_0751` | `renovieren` | Schwach (-ieren)| `renoviert \| renovierte \| hat gerenoviert` | `renoviert \| renovierte \| hat renoviert` (+ Akk) | Verb in `-ieren`: NEVER takes `ge-`! |
| `b1_0752` | `streichen` | Stark | `streicht \| streichte \| hat gestreicht` | `streicht \| strich \| hat gestrichen` (+ Akk) | Strong verb Ablaut: `ei -> i -> i` (*strich*) |
| `b1_0759` | `mitnehmen` | Stark (Sep) | `mitnehmt \| mitnehmte \| hat gemitnehmt` | `nimmt mit \| nahm mit \| hat mitgenommen` (+ Akk) | Vowel shift `e->i` (*nimmt mit*), Prät *nahm mit* |
| `b1_0785` | `beweisen` | Stark (Insep) | `beweist \| beweiste \| hat gebeweist` | `beweist \| bewies \| hat bewiesen` (+ Akk) | Inseparable strong: `bewies`, `bewiesen`, no `ge-` |
| `b1_0788` | `transportieren`| Schwach (-ieren)| `transportiert \| transportierte \| hat getransportiert`| `transportiert \| transportierte \| hat transportiert` (+ Akk) | Verb in `-ieren`: NEVER takes `ge-`! |
| `b1_0790` | `einbiegen` | Stark (Sep) | `einbiegt \| einbiegte \| hat geeinbiegt` | `biegt ein \| bog ein \| IST eingebogen` (in + Akk) | Aux **IST**! Direction change, Prät *bog ein* |
| `b1_0846` | `verzeihen` | Stark (Insep) | `verzeiht \| verzeihte \| hat geverzeiht` | `verzeiht \| verzieh \| hat verziehen` (+ Dat + Akk) | Strong: `verzieh`, `verziehen`, Rektion `jemandem (Dat)` |
| `b1_0853` | `streiten` | Stark (Reflexiv)| `streitt \| streitte \| hat gestreitt` (+ Akk) | `streitet \| stritt \| hat gestritten` (sich streiten über + Akk / mit + Dat) | Reflexive prepositional: `stritt`, `gestritten` |
| `b1_0961` | `schließen` | Stark | `schließt \| schließte \| hat geschließt` | `schließt \| schloss \| hat geschlossen` (+ Akk) | Strong verb: `schloss`, `geschlossen` |
| `b1_0968` | `unterscheiden`| Stark (Insep) | `unterscheidt \| unterscheidte \| hat geunterscheidt`| `unterscheidet \| unterschied \| hat unterschieden` (zwischen + Dat) | Inseparable strong: `unterschied`, `unterschieden` |
| `b1_0970` | `zustimmen` | Schwach (Sep) | `zustimmt \| zustimmte \| hat gezustimmt` (+ Akk) | `stimmt zu \| stimmte zu \| hat zugestimmt` (+ Dativ) | Separable weak: `stimmt zu`, Rektion **+ Dativ**! |

---

## Part 4: Actionable Remediation Roadmap

To ensure 100% adherence to the Pedagogical Protocol (`/root/AGENTS.md`), the following multi-agent remediation must be executed:

1. **Phase 1 (Content Generation & Audit Consensus):**
   - Incorporate the 16 specified B1 micro-grammar modules into `/root/arl/data/de/grammar.json` under Folder 03 (expanding Folder 03 from 6 to 22 focused modules).
   - `content-generator` and `grammar-specialist` formally sign off with `[CONSENSUS: APPROVED]`.
2. **Phase 2 (Verb Dataset Refactoring):**
   - Patch all 224 verbs in `/root/arl/data/de/vocab_b1.json` using the verified linguistic database:
     * Correct all 3rd person Präsens (including vowel gradation `e->i/ie`, `a->ä`).
     * Correct all Präteritum stems (strong/mixed Ablaut).
     * Correct all Partizip II forms (proper `-ge-` placement for separable, omission for inseparable and `-ieren`).
     * Assign accurate auxiliary verbs (`ist` for motion/transition, `hat` for transitive/durative).
     * Correct all `rektion` entries (Dativ governance, prepositions + case).
     * Update `prompt_front` and `revealed_back` cards to reflect correct valencies.
3. **Phase 3 (Parallel Red-Team Verification):**
   - `bug-hunter` runs automated assertions to verify zero bogus `ge-`, zero missing `ist`, and 100% valid 4-part form schemas.
   - `devil-advocate` verifies zero UI bloat, clean minimalist markdown rendering, and 100% keyboard accessibility.

---
**Report compiled and certified by German Grammar Specialist (`grammar-specialist`)**
