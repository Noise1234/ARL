import json

data = {}

# 220 - 329 (110 words)
# Linguistics & Literature
data["syntax"] = (
    "Understanding programming syntax is crucial for writing clean code.",
    "Програмчлалын өгүүлбэр зүй, синтаксыг ойлгох нь цэвэр код бичихэд чухал ач холбогдолтой.",
    "Das Verständnis der Programmiersyntax ist entscheidend für das Schreiben sauberen Codes."
)
data["semantics"] = (
    "The debate stalled because the two diplomats disagreed on the semantics of the treaty.",
    "Хоёр дипломатч гэрээний утга зүйн нарийн ялгаан дээр санал нийлээгүй тул хэлэлцүүлэг гацав.",
    "Die Debatte stockte, weil sich die beiden Diplomaten über die Semantik des Vertrags uneins waren."
)
data["phonetics"] = (
    "Phonetics helps language learners master accurate pronunciation of foreign vowel sounds.",
    "Авиа зүй нь гадаад хэл суралцагчдад эгшиг авиаг үнэн зөв дуудаж сурахад тусалдаг.",
    "Die Phonetik hilft Sprachlernern, die genaue Aussprache fremder Vokale zu meistern."
)
data["morphology"] = (
    "Comparative morphology studies how prefixes and suffixes alter the grammatical roles of words.",
    "Харьцуулсан бүтэц зүй нь угтвар болон дагавар үгс үгийн дүрмийн үүргийг хэрхэн өөрчилдгийг судалдаг.",
    "Die vergleichende Morphologie untersucht, wie Präfixe und Suffixe die grammatikalische Rolle von Wörtern verändern."
)
data["etymology"] = (
    "Tracing the Latin etymology of the word reveals how its modern meaning evolved over centuries.",
    "Энэхүү үгийн латин язгуур, гарлыг судлах нь түүний орчин үеийн утга хэрхэн бүрэлдсэнийг тодруулдаг.",
    "Die Rückverfolgung der lateinischen Etymologie des Wortes zeigt, wie sich seine moderne Bedeutung entwickelte."
)
data["jargon"] = (
    "The doctor avoided medical jargon when explaining the test results to the worried patient.",
    "Эмч шинжилгээний хариуг түгшсэн өвчтөнд тайлбарлахдаа мэргэжлийн ярвигтай нэр томьёо ашиглахаас зайлсхийв.",
    "Der Arzt vermied medizinischen Jargon, als er dem besorgten Patienten die Testergebnisse erklärte."
)
data["vernacular"] = (
    "Mark Twain captured the authentic local vernacular of nineteenth-century Mississippi River towns.",
    "Марк Твен арван есдүгээр зууны Миссисипи мөрний эргийн хотуудын нутгийн аялгууг бодитой дүрсэлсэн.",
    "Mark Twain fing die authentische lokale Mundart der Städte am Mississippi des 19. Jahrhunderts ein."
)
data["colloquialism"] = (
    "While common in casual texting, this colloquialism is inappropriate for an academic essay.",
    "Энгийн мессежинд түгээмэл хэрэглэгддэг ч энэ ярианы хэллэг нь эрдэм шинжилгээний эссэд тохиромжгүй.",
    "Obwohl in Textnachrichten üblich, ist diese Umgangssprache für eine akademische Arbeit ungeeignet."
)
data["soliloquy"] = (
    "Hamlet delivers a famous dramatic soliloquy contemplating life, death, and human morality.",
    "Хамлет амьдрал, үхэл хийгээд хүний ёс суртахууны талаар эргэцүүлсэн алдарт монолог хэлдэг.",
    "Hamlet hält einen berühmten dramatischen Monolog, in dem er über Leben, Tod und Moral nachdenkt."
)
data["allusion"] = (
    "The poet made a subtle mythological allusion to the fall of Icarus in his final stanza.",
    "Яруу найрагч эцсийн бадагтаа Икарын уналтын домгийг битүү ёгтлон дурдсан байв.",
    "Der Dichter machte in seiner letzten Strophe eine subtile mythologische Anspielung auf den Fall des Ikarus."
)
data["personification"] = (
    "The author used vivid personification, describing the cold autumn wind as whispering ancient secrets.",
    "Зохиолч намрын хүйтэн салхийг эртний нууцыг шивнэж буйгаар дүрслэн, хүншүүлэлтийн уран аргыг чадварлаг ашиглажээ.",
    "Der Autor nutzte lebhafte Personifikation und beschrieb den kalten Herbstwind als Flüstern alter Geheimnisse."
)
data["symbolism"] = (
    "The persistent raven perched above the door carries heavy literary symbolism of grief and madness.",
    "Хаалган дээр суугаа хар хэрээ нь уй гашуу, галзуурлын гүн гүнзгий уран зохиолын бэлгэдлийг агуулдаг.",
    "Der beharrliche Rabe über der Tür trägt eine schwere literarische Symbolik von Trauer und Wahnsinn."
)
data["juxtaposition"] = (
    "The photographer created dramatic contrast through the juxtaposition of extreme wealth and poverty.",
    "Гэрэл зурагчин баян тансаг байдал болон туйлын ядуурлыг зэрэгцүүлэн тавьснаар хурц тодотгол үүсгэжээ.",
    "Der Fotograf schuf dramatische Kontraste durch das Nebeneinanderstellen von extremem Reichtum und Armut."
)

# Economics & Policy
data["deregulation"] = (
    "Financial deregulation allowed commercial banks to invest customer deposits in higher-risk assets.",
    "Санхүүгийн зохицуулалтыг сулруулсан нь арилжааны банкуудад хадгаламжийг өндөр эрсдэлтэй хөрөнгөд оруулах боломж олгосон.",
    "Die finanzielle Deregulierung ermöglichte es Geschäftsbanken, Kundeneinlagen in risikoreichere Anlagen zu investieren."
)
data["privatization"] = (
    "The government pursued the privatization of state-owned telecommunications to encourage competition.",
    "Засгийн газар зах зээлийн өрсөлдөөнийг дэмжихийн тулд төрийн өмчит харилцаа холбооны салбарыг хувьчилсан.",
    "Die Regierung trieb die Privatisierung staatlicher Telekommunikationsunternehmen voran, um den Wettbewerb zu fördern."
)
data["nationalization"] = (
    "Following the revolution, the new regime ordered the immediate nationalization of foreign oil fields.",
    "Хувьсгалын дараа шинэ засаг гадаадын газрын тосны ордуудыг төрийн мэдэлд шилжүүлэх тушаал буулгав.",
    "Nach der Revolution ordnete das neue Regime die sofortige Verstaatlichung ausländischer Ölfelder an."
)
data["protectionism"] = (
    "Economic protectionism harms global supply chains by imposing heavy tariffs on foreign imports.",
    "Протекционизм буюу дотоодын зах зээлээ хамгаалах бодлого нь гадаад импортод өндөр татвар ногдуулан нийлүүлэлтийн сүлжээг гэмтээдэг.",
    "Wirtschaftlicher Protektionismus schadet globalen Lieferketten durch hohe Zölle auf ausländische Importe."
)
data["trade balance"] = (
    "A sustained trade balance surplus strengthened the purchasing power of the national currency.",
    "Гадаад худалдааны тэнцлийн тогтвортой ашиг нь үндэсний мөнгөн тэмдэгтийн худалдан авах чадварыг бэхжүүлжээ.",
    "Ein anhaltender Handelsbilanzüberschuss stärkte die Kaufkraft der nationalen Währung."
)
data["trade deficit"] = (
    "Importing more luxury goods than exporting manufactured products widened the nation's trade deficit.",
    "Үйлдвэрлэсэн бүтээгдэхүүнээс илүү тансаг хэрэглээний бараа импортолсон нь худалдааны алдагдлыг нэмэгдүүлэв.",
    "Mehr Luxusgüter zu importieren als Fertigwaren zu exportieren vergrößerte das Handelsdefizit der Nation."
)
data["foreign reserve"] = (
    "The central bank used its foreign reserve assets to defend the exchange rate against market speculation.",
    "Төв банк ханшийг зах зээлийн савлагаанаас хамгаалахын тулд гадаад валютын албан нөөцөө ашиглав.",
    "Die Zentralbank nutzte ihre Devisenreserven, um den Wechselkurs gegen Marktspekulationen zu verteidigen."
)
data["venture"] = (
    "Launching a clean energy startup is a high-risk venture that requires substantial capital.",
    "Цэвэр эрчим хүчний гарааны бизнес эхлүүлэх нь ихээхэн хэмжээний хөрөнгө шаардсан эрсдэлтэй шинэ бизнес юм.",
    "Die Gründung eines Startups für saubere Energie ist ein risikoreiches Wagnis, das beträchtliches Kapital erfordert."
)
data["asset"] = (
    "Liquid real estate and government bonds represent the most secure asset classes in the portfolio.",
    "Хөрвөх чадвартай үл хөдлөх хөрөнгө болон засгийн газрын бонд нь багцын хамгийн найдвартай хөрөнгөд тооцогддог.",
    "Liquide Immobilien und Staatsanleihen stellen die sichersten Anlageklassen im Portfolio dar."
)

# Environment & Science
data["desalination"] = (
    "Arid coastal regions rely increasingly on solar-powered thermal desalination for drinking water.",
    "Хуурай бүс нутгууд ундны усны хэрэгцээгээ нарны эрчим хүчээр ажилладаг далайн ус цэнгэгжүүлэх байгууламжаас хангадаг.",
    "Trockene Küstenregionen verlassen sich zunehmend auf solarbetriebene Entsalzung für ihr Trinkwasser."
)
data["carbon footprint"] = (
    "Commuting by public transit rather than driving significantly reduces an individual's carbon footprint.",
    "Хувийн машингүй нийтийн тээврээр зорчих нь хүний хувийн нүүрстөрөгчийн мөрийг эрс бууруулдаг.",
    "Die Nutzung öffentlicher Verkehrsmittel anstelle des Autos reduziert den individuellen CO2-Fußabdruck erheblich."
)
data["biohazard"] = (
    "The laboratory technician sealed the contaminated petri dishes inside a marked biohazard container.",
    "Лабораторийн ажилтан бохирдсон шилэн савнуудыг биологийн аюултай хог хаягдлын тусгай саванд битүүмжлэн хийв.",
    "Der Labortechniker versiegelte die kontaminierten Petrischalen in einem gekennzeichneten Biohazard-Behälter."
)
data["electromagnetism"] = (
    "Maxwell formulated the fundamental mathematical laws uniting electricity and magnetism into electromagnetism.",
    "Максвелл цахилгаан ба соронзон орныг цахилгаан соронзон чанарт нэгтгэсэн физикийн үндсэн тэгшитгэлүүдийг боловсруулжээ.",
    "Maxwell formulierte die grundlegenden Gesetze, die Elektrizität und Magnetismus zum Elektromagnetismus vereinten."
)
data["spectroscopy"] = (
    "Astronomers used infrared spectroscopy to determine the chemical composition of the distant comet.",
    "Одон орон судлаачид алсын сүүлт одны химийн найрлагыг тогтоохын тулд хэт улаан туяаны спектроскопийн аргыг ашигласан.",
    "Astronomen nutzten die Infrarotspektroskopie, um die chemische Zusammensetzung des fernen Kometen zu bestimmen."
)
data["particle physics"] = (
    "Research in particle physics explores subatomic interactions inside high-energy particle colliders.",
    "Эгэл бөөмийн физикийн судалгаа нь өндөр энергийн хурдасгуур доторх бөөмсийн харилцан үйлчлэлийг судалдаг.",
    "Die Teilchenphysik erforscht subatomare Wechselwirkungen in Hochenergie-Teilchenbeschleunigern."
)
data["relativity"] = (
    "Einstein's general theory of relativity explains gravity as the curvature of four-dimensional spacetime.",
    "Эйнштейний харьцангуйн ерөнхий онол нь татах хүчийг дөрвөн хэмжээст орон зай-цаг хугацааны муруйлт гэж тайлбарладаг.",
    "Einsteins allgemeine Relativitätstheorie erklärt die Gravitation als Krümmung der vierdimensionalen Raumzeit."
)
data["astrophysics"] = (
    "Graduate programs in astrophysics investigate stellar nucleosynthesis and the cosmic expansion rate.",
    "Астрофизикийн магистрын хөтөлбөр нь оддын цөмийн нэгдэл болон орчлон ертөнцийн тэлэлтийн хурдыг судалдаг.",
    "Studiengänge in Astrophysik untersuchen die stellare Nukleosynthese und die kosmische Expansionsrate."
)
data["biochemistry"] = (
    "Advances in biochemistry shed light on enzyme kinetics and metabolic pathways within living cells.",
    "Биохимийн дэвшил нь амьд эс дэх ферментийн кинетик ба бодисын солилцооны замуудыг тодорхой болгож байна.",
    "Fortschritte in der Biochemie erhellen Enzymkinetik und Stoffwechselwege in lebenden Zellen."
)
data["microbiology"] = (
    "Clinical microbiology identifies pathogenic bacterial strains to prescribe targeted antibiotic treatments.",
    "Эмнэлзүйн микробиологи нь эмчилгээнд тохирох антибиотикийг сонгохын тулд өвчин үүсгэгч нянгийн омгийг тодорхойлдог.",
    "Die klinische Mikrobiologie identifiziert pathogene Bakterienstämme für gezielte Antibiotikatherapien."
)

# Governance & Law
data["judiciary"] = (
    "An independent judiciary guarantees that every citizen receives an impartial legal trial.",
    "Хараат бус шүүх засаглал нь иргэн бүр шударга, алагчлалгүй шүүх хуралдаанаар эрхээ хамгаалуулах баталгааг хангадаг.",
    "Eine unabhängige Justiz garantiert, dass jeder Bürger ein unparteiisches Gerichtsverfahren erhält."
)
data["legislature"] = (
    "The national legislature debated the new healthcare bill late into the evening before voting.",
    "Улсын хууль тогтоох байгууллага санал хураахын өмнө эрүүл мэндийн шинэ хуулийн төслийг үдэш болтол хэлэлцэв.",
    "Die nationale Legislative debattierte bis spät in den Abend über das neue Gesundheitsgesetz vor der Abstimmung."
)
data["executive branch"] = (
    "The executive branch enforces federal laws passed by parliament through specialized government agencies.",
    "Гүйцэтгэх засаглал нь парламентаас баталсан хуулиудыг засгийн газрын тусгай агентлагуудаар дамжуулан хэрэгжүүлдэг.",
    "Die Exekutive setzt vom Parlament verabschiedete Gesetze durch spezialisierte Behörden durch."
)
data["separation of powers"] = (
    "The constitutional separation of powers prevents any single governmental department from monopolizing authority.",
    "Засаглал хуваарилах зарчим нь аль нэг төрийн байгууллага эрх мэдлийг ганцаар монополчлон авахаас сэргийлдэг.",
    "Die verfassungsmäßige Gewaltenteilung verhindert, dass eine einzelne Regierungsabteilung die Macht monopolisiert."
)
data["checks and balances"] = (
    "A robust system of checks and balances allows the courts to review presidential decrees.",
    "Хяналт-тэнцвэрийн тогтолцоо нь ерөнхийлөгчийн зарлигийг шүүх хянан үзэх эрх зүйн боломжийг олгодог.",
    "Ein solides System gegenseitiger Kontrolle erlaubt es den Gerichten, Präsidialdekrete zu überprüfen."
)
data["constitutionalism"] = (
    "Democratic constitutionalism mandates that political leaders remain strictly accountable to written law.",
    "Ардчилсан үндсэн хуульт ёс нь улс төрийн удирдагчдыг бичигдсэн хуулийн өмнө хатуу хариуцлага хүлээхийг шаарддаг.",
    "Demokratischer Konstitutionalismus verlangt, dass politische Führungskräfte dem geschriebenen Recht unterstehen."
)
data["civil liberties"] = (
    "Freedom of speech, association, and peaceful assembly form the backbone of fundamental civil liberties.",
    "Үзэл бодлоо илэрхийлэх, эвлэлдэн нэгдэх, тайван жагсах эрх чөлөө нь иргэний үндсэн эрх чөлөөний үндэс суурь юм.",
    "Meinungsfreiheit, Vereinigungsfreiheit und friedliche Versammlungsfreiheit bilden das Rückgrat der Bürgerrechte."
)
data["habeas corpus"] = (
    "The writ of habeas corpus prevents the state from detaining individuals indefinitely without criminal charges.",
    "Хабеас корпус буюу шүүхээр хянуулах эрх нь төр иргэнийг эрүүгийн ял тулгалгүйгээр үндэслэлгүйгээр хорихоос хамгаалдаг.",
    "Die Habeas-Corpus-Akte verhindert, dass der Staat Personen ohne Anklage unbegrenzt festhält."
)
data["statute"] = (
    "The revised criminal statute clearly defines penalties for modern unauthorized cyber intrusions.",
    "Шинэчлэгдсэн эрүүгийн хуулийн заалт нь цахим халдлага, хууль бус нэвтрэлтийн шийтгэлийг тодорхой зааж өгчээ.",
    "Das überarbeitete Strafgesetz definiert Strafen für moderne unbefugte Cyber-Eingriffe eindeutig."
)
data["filibuster"] = (
    "The opposition senator launched an eight-hour filibuster to delay the controversial budget vote.",
    "Сөрөг хүчний сенатч маргаантай төсвийн санал хураалтыг хойшлуулахын тулд найман цагийн турш үг хэлэн саатуулах тактик хэрэглэв.",
    "Der Oppositionssenator hielt eine achtstündige Dauerrede, um die umstrittene Haushaltsabstimmung zu verzögern."
)
data["impeachment"] = (
    "The assembly initiated formal impeachment proceedings against the high-ranking official accused of corruption.",
    "Парламент авлигын хэрэгт холбогдсон өндөр албан тушаалтныг албан тушаалаас нь огцруулах импичментийн ажиллагааг эхлүүлэв.",
    "Das Parlament leitete ein formelles Amtsenthebungsverfahren gegen den der Korruption beschuldigten Beamten ein."
)
data["clemency"] = (
    "The president granted executive clemency to elderly prisoners who showed genuine rehabilitation.",
    "Ерөнхийлөгч засарч хүмүүжсэнээ харуулсан өндөр настай хоригдлуудад өршөөл үзүүлж, ялыг хөнгөлөв.",
    "Der Präsident gewährte älteren Häftlingen, die echte Besserung zeigten, Begnadigung."
)
data["plea bargain"] = (
    "The defendant agreed to a plea bargain, pleading guilty to a lesser charge in exchange for a lighter sentence.",
    "Шүүгдэгч хөнгөн ял авахын тулд ялын тохиролцоо хийж, хөнгөн зүйл ангиар гэм буруугаа хүлээн зөвшөөрөв.",
    "Der Angeklagte willigte in eine Vereinbarung ein und bekannte sich schuldig gegen eine mildere Strafe."
)
data["acquittal"] = (
    "Due to a complete lack of verifiable evidence, the jury reached an unexpected unanimous acquittal.",
    "Баталгаатай нотлох баримт дутагдсаны улмаас тангарагтны шүүх санал нэгтэйгээр цагаатгах шийдвэр гаргав.",
    "Aufgrund fehlender Beweise fällte die Jury einen überraschenden einstimmigen Freispruch."
)
data["injunction"] = (
    "The supreme court issued a preliminary injunction halting the planned logging in the protected forest.",
    "Дээд шүүхээс дархан цаазат ойд төлөвлөсөн мод бэлтгэлийг нэн даруй зогсоох урьдчилсан хориг захирамж гаргалаа.",
    "Das oberste Gericht erließ eine einstweilige Verfügung, die das Abholzen im Naturschutzgebiet stoppte."
)
data["restitution"] = (
    "As part of the criminal sentencing, the embezzler was ordered to pay full financial restitution to victims.",
    "Эрүүгийн ялын хүрээнд мөнгө завшсан этгээдэд хохирогчдын хохирлыг бүрэн барагдуулах санхүүгийн төлбөр оногдуулсан.",
    "Als Teil des Urteils wurde der Veruntreuer zur vollständigen finanziellen Entschädigung der Opfer verurteilt."
)

# Tech & Math
data["machine learning"] = (
    "Engineers train machine learning models on millions of labeled images to recognize pedestrians.",
    "Инженерүүд явган зорчигчийг танихын тулд сая сая хаягласан зураг дээр машин сургалтын загварыг сургадаг.",
    "Ingenieure trainieren Machine-Learning-Modelle an Millionen Bildern, um Fußgänger zuverlässig zu erkennen."
)
data["deep learning"] = (
    "Deep learning neural networks achieve state-of-the-art accuracy in real-time natural language translation.",
    "Гүн сургалтын мэдрэлийн сүлжээ нь байгалийн хэлийг бодит цагт орчуулахад өндөр нарийвчлалд хүрсэн.",
    "Neuronale Netze des Deep Learnings erzielen Spitzenwerte bei der Echtzeit-Übersetzung natürlicher Sprache."
)
data["blockchain"] = (
    "A decentralized blockchain ensures transaction history cannot be altered or deleted by a single authority.",
    "Төвлөрсөн бус блокчейн технологи нь гүйлгээний түүхийг аль нэг этгээд өөрчлөх буюу устгахаас сэргийлдэг.",
    "Eine dezentrale Blockchain stellt sicher, dass Transaktionsdaten nicht nachträglich manipuliert werden."
)
data["distributed ledger"] = (
    "Participating nodes synchronize records across the distributed ledger without needing a central server.",
    "Оролцогч зангилаанууд төв сервергүйгээр тархмал бүртгэлийн дэвтэр дээр бүртгэлүүдийг синхрончилдог.",
    "Teilnehmende Knoten synchronisieren Einträge über das Distributed Ledger ohne zentralen Server."
)
data["quantum computing"] = (
    "Quantum computing exploits superposition and entanglement to solve intractable cryptographic puzzles.",
    "Квант тооцоолол нь шийдвэрлэхэд бэрх нууцлалын даалгавруудыг бодохын тулд суперпозици болон квант орооцолдоог ашигладаг.",
    "Quantencomputing nutzt Superposition und Verschränkung, um komplexe kryptografische Rätsel zu lösen."
)
data["recursion"] = (
    "The computer algorithm uses recursion to traverse each node of the hierarchical directory tree.",
    "Компьютерийн алгоритм нь шаталсан хавтасны модны зангилаа бүрийг шалгахын тулд рекурс буюу өөрийгөө дуудах аргыг ашигладаг.",
    "Der Algorithmus nutzt Rekursion, um jeden Knoten des hierarchischen Verzeichnisbaums zu durchlaufen."
)
data["permutation"] = (
    "The cryptographer calculated every possible character permutation to test the strength of the passcode.",
    "Криптографч нууц үгийн бат бөх чанарыг шалгахын тулд тэмдэгтүүдийн боломжит бүх сэлгэмлийг тооцоолов.",
    "Der Kryptograf berechnete jede mögliche Zeichenpermutation, um die Stärke des Passworts zu testen."
)
data["probability"] = (
    "Calculating the conditional probability of default helps risk analysts price commercial credit portfolios.",
    "Нөхцөлт магадлалыг тооцоолох нь эрсдэлийн шинжээчдэд арилжааны зээлийн багцын үнийг тогтооход тусалдаг.",
    "Die Berechnung der bedingten Wahrscheinlichkeit hilft Risikoanalysten bei der Bewertung von Krediten."
)
data["variance"] = (
    "High variance in quarterly sales figures indicates unstable demand for seasonal leisure products.",
    "Улирлын борлуулалтын үзүүлэлтийн өндөр дисперс буюу тархалт нь улирлын чанартай бүтээгдэхүүний эрэлт тогтворгүйг харуулж байна.",
    "Eine hohe Varianz bei den Quartalszahlen weist auf eine instabile Nachfrage nach Saisonprodukten hin."
)
data["standard deviation"] = (
    "A small standard deviation shows that most student test scores clustered closely around the class mean.",
    "Бага стандарт хазайлт нь оюутнуудын ихэнх шалгалтын оноо ангийн дундажтай маш ойрхон төвлөрснийг илтгэнэ.",
    "Eine geringe Standardabweichung zeigt, dass die meisten Noten nahe um den Klassendurchschnitt lagen."
)
data["regression"] = (
    "The data scientist applied multivariate linear regression to forecast future energy consumption peaks.",
    "Өгөгдлийн шинжээч ирээдүйн эрчим хүчний хэрэглээний оргил үеийг таамаглахын тулд олон хүчин зүйлт шугаман регрессийг ашигласан.",
    "Der Datenwissenschaftler wandte multivariate lineare Regression an, um den Energieverbrauch vorherzusagen."
)
data["covariance"] = (
    "Positive covariance between the two tech stocks revealed that their daily prices move in tandem.",
    "Технологийн хоёр хувьцааны хоорондох эерэг ковариац нь тэдгээрийн өдрийн үнэ нэгэн зэрэг хөдөлдгийг харуулсан.",
    "Eine positive Kovarianz zwischen den beiden Tech-Aktien zeigte, dass sich ihre Kurse parallel bewegen."
)
data["microprocessor"] = (
    "The newly fabricated silicon microprocessor packs over ten billion microscopic transistors.",
    "Шинээр үйлдвэрлэсэн цахиурын микропроцессор нь арван тэрбум гаруй микроскоп транзисторыг агуулдаг.",
    "Der neu gefertigte Silizium-Mikroprozessor enthält über zehn Milliarden mikroskopische Transistoren."
)
data["semiconductor"] = (
    "Global automotive factories faced severe delays due to a shortage of semiconductor chips.",
    "Хагас дамжуулагч чипний хомсдолоос шалтгаалан дэлхийн авто машин үйлдвэрлэгчид ноцтой сааталтай тулгарав.",
    "Automobilhersteller weltweit erlitten schwere Verzögerungen aufgrund eines Mangels an Halbleitern."
)
data["biometrics"] = (
    "Border immigration checkpoints use biometrics such as iris scans and facial geometry matching.",
    "Хилийн шалган нэвтрүүлэх цэгүүд нүдний солонгон бүрхэвч ба царай таних биометрийн технологийг ашигладаг.",
    "Grenzkontrollen nutzen Biometrie wie Iris-Scans und den Abgleich der Gesichtsgeometrie."
)
data["optics"] = (
    "Advancements in precision optics enabled the space telescope to capture razor-sharp cosmic deep-field views.",
    "Нарийн оптикийн дэвшил нь сансрын дуранд орчлон ертөнцийн гүнийг онцгой тод буулгах боломж олгов.",
    "Fortschritte in der Präzisionsoptik ermöglichten es dem Weltraumteleskop, gestochen scharfe Bilder aufzunehmen."
)

# Art & Architecture
data["renaissance"] = (
    "The Italian Renaissance witnessed an extraordinary revival of classical philosophy, art, and science.",
    "Италийн Сэргэн мандалтын үе нь сонгодог гүн ухаан, урлаг болон шинжлэх ухааны гайхамшигт сэргэлтийг авчирсан.",
    "Die italienische Renaissance erlebte eine außergewöhnliche Wiederbelebung antiker Philosophie und Kunst."
)
data["baroque"] = (
    "Baroque architecture features ornate ceiling frescoes, theatrical lighting, and dramatic gilded curves.",
    "Барокко загварын уран барилга нь гоёмсог таазны фреск, театрын мэт гэрэлтүүлэг болон алтадмал муруй шугамаараа онцлогтой.",
    "Die Barockarchitektur zeichnet sich durch kunstvolle Deckenfresken und dramatische Kurven aus."
)
data["neoclassicism"] = (
    "Neoclassicism embraced symmetry, restrained elegance, and Roman columns in reaction against rococo excess.",
    "Неоклассицизм нь рококогийн хэт тансаглалын эсрэг тэгш хэм, цэмцгэр дэгжин байдал, Ромын багануудыг чухалчилсан.",
    "Der Neoklassizismus setzte auf Symmetrie, schlichte Eleganz und römische Säulen gegen den Rokoko-Überfluss."
)
data["modernism"] = (
    "Twentieth-century modernism broke decisively with traditional ornamentation in favor of functional design.",
    "Хорьдугаар зууны модернизм нь функциональ загварыг эрхэмлэн уламжлалт хээ угалзнаас эрс татгалзсан.",
    "Die Moderne des zwanzigsten Jahrhunderts brach entschieden mit traditionellem Schmuck zugunsten funktionalen Designs."
)
data["minimalism"] = (
    "Architectural minimalism emphasizes clean geometric lines, monochromatic palettes, and clutter-free living spaces.",
    "Архитектурын минимализм нь цэвэр геометрийн шугам, нэг өнгийн шийдэл болон илүү дутуу зүйлгүй орчныг чухалчилдаг.",
    "Architektonischer Minimalismus betont klare Linien, monochrome Paletten und reduzierte Wohnräume."
)
data["impressionism"] = (
    "French impressionism captured changing daylight and atmospheric moods through loose, vibrant brushstrokes.",
    "Францын импрессионизм нь гэрэл сүүдрийн хувиралт ба байгалийн агшин зуурын уур амьсгалыг чөлөөт бийрийн таталтаар буулгасан.",
    "Der französische Impressionismus fing wechselndes Tageslicht durch dynamische Pinselstriche ein."
)
data["cubism"] = (
    "Picasso pioneered cubism, fragmenting three-dimensional subjects into abstract geometric planes.",
    "Пикассо кубизмыг санаачлан, бодит биетүүдийг геометрийн хийсвэр хавтгайнуудад задалж дүрсэлжээ.",
    "Picasso leistete Pionierarbeit im Kubismus, indem er Motive in geometrische Flächen zerlegte."
)
data["surrealism"] = (
    "Salvador Dalí's surrealism explored the irrational subconscious world of dreams and melted clocks.",
    "Сальвадор Далигийн сюрреализм нь зүүд зөн, ухамсаргүй ертөнц болон урсаж буй цагнуудыг дүрсэлсэн байдаг.",
    "Salvador Dalís Surrealismus erforschte das unbewusste Reich der Träume und schmelzenden Uhren."
)
data["fresco"] = (
    "Michelangelo painted the monumental fresco directly onto the wet lime plaster of the Sistine Chapel ceiling.",
    "Микеланжело Сикстиний сүмийн таазны нойтон шохойн шавардлага дээр алдарт ханын фреск зургаа зуржээ.",
    "Michelangelo malte das monumentale Fresko direkt auf den feuchten Kalkputz der Sixtinischen Kapelle."
)
data["mosaic"] = (
    "The Byzantine basilica floor is paved with an intricate mosaic of tinted glass and gold tesserae.",
    "Византын сүмийн шалыг өнгөт шил, алтадмал хавтангуудыг шигтгэн урласан уран тансаг шигтгэмэл мозайкаар чимэглэжээ.",
    "Der Boden der byzantinischen Basilika ist mit einem kunstvollen Mosaik aus Buntglas und Gold verziert."
)
data["bas-relief"] = (
    "Carved marble bas-relief sculptures on the triumphal arch celebrate victorious military campaigns.",
    "Ялалтын хаалган дээр сийлсэн гантиг чулуун товгор хавтгай сийлбэр буюу барельеф нь цэргийн ялалтыг магтан харуулдаг.",
    "Gemeißelte Marmor-Flachreliefs am Triumphbogen erinnern an siegreiche Feldzüge."
)
data["facade"] = (
    "Restorers cleaned centuries of urban soot from the ornate limestone facade of the Gothic cathedral.",
    "Сэргээн засварлагчид Готик хийдийн шохойн чулуун гоёмсог нүүрэн талын хэдэн зуун жилийн тортог, тоосыг цэвэрлэв.",
    "Restauratoren reinigten die kunstvolle Fassade der gotischen Kathedrale von Jahrhunderten städtischen Rußes."
)
data["colonnade"] = (
    "Visitors walked beneath the imposing classical colonnade surrounding the public palace courtyard.",
    "Зочлох хүмүүс ордны талбайг тойрсон сүрлэг сонгодог баганан эгнээ буюу колоннадын доогуур алхав.",
    "Besucher schritten unter den imposanten klassischen Kolonnaden entlang, die den Schlosshof umgeben."
)
data["buttress"] = (
    "Massive exterior flying buttress structures counteract the outward lateral thrust of the vaulted stone roof.",
    "Сүмийн гаднах тулгуур багана буюу аркбутан нь нуман хэлбэртэй чулуун дээврийн хажуугийн даралтыг тэнцвэржүүлдэг.",
    "Massive äußere Strebepfeiler fangen den seitlichen Schub des gewölbten Steindachs ab."
)
data["atrium"] = (
    "Sunlight poured through the glass ceiling into the central five-story atrium of the corporate headquarters.",
    "Нарны гэрэл шилэн дээврээр дамжин компанийн төв оффисын таван давхар өндөр төв хүлээн авах танхим буюу атриум руу тусав.",
    "Sonnenlicht strömte durch das Glasdach in das zentrale fünfstöckige Atrium der Firmenzentrale."
)
data["portico"] = (
    "Guests took shelter from the sudden summer rainstorm beneath the mansion's classical columned portico.",
    "Зочид зуны гэнэтийн ширүүн борооноос хамгаалан харшийн баганат үүдний саравч буюу портик дор хоргодов.",
    "Gäste suchten vor dem plötzlichen Sommerregen Schutz unter dem säulengestützten Portikus des Anwesens."
)
data["mezzanine"] = (
    "The upscale cafe sits on the mezzanine overlooking the bustling main lobby of the grand hotel.",
    "Дээд зэрэглэлийн кафе нь их зочид буудлын төв лобби руу харсан завсрын хагас давхар дээр байрладаг.",
    "Das gehobene Café befindet sich auf dem Zwischengeschoss mit Blick auf die belebte Lobby."
)
data["sculpture"] = (
    "The contemporary museum acquired a monumental bronze sculpture by a celebrated local artist.",
    "Орчин үеийн урлагийн музей нэрт нутгийн уран барималчийн хүрэл хөшөө, баримлыг цуглуулгадаа нэмж авав.",
    "Das Museum für moderne Kunst erwarb eine monumentale Bronzeskulptur eines gefeierten lokalen Künstlers."
)
data["installation"] = (
    "The interactive multimedia art installation reacted dynamically to ambient sounds and visitor movements.",
    "Интерактив мультимедиа инсталляци буюу орон зайн урлагийн бүтээл нь орчны чимээ ба зочдын хөдөлгөөнд хувирч байв.",
    "Die interaktive Kunstinstallation reagierte dynamisch auf Umgebungsgeräusche und Bewegungen der Besucher."
)
data["perspective"] = (
    "Brunelleschi introduced linear perspective, giving two-dimensional paintings the illusion of spatial depth.",
    "Брунеллески шугаман алслалтыг нэвтрүүлснээр хоёр хэмжээст уран зурагт орон зайн гүний хуурмаг мэдрэмжийг өгсөн юм.",
    "Brunelleschi führte die Zentralperspektive ein und verlieh Gemälden die Illusion räumlicher Tiefe."
)

# Philosophy & Thought
data["teleology"] = (
    "Aristotelian teleology asserts that all natural entities have an intrinsic purpose or ultimate end.",
    "Аристотелийн телеологи нь байгалийн бүх биет юмс өөрийн гэсэн зорилго, эцсийн чиглэлтэй гэж үздэг.",
    "Die aristotelische Teleologie besagt, dass alle Naturdinge einen immanenten Zweck oder ein Endziel haben."
)
data["categorical imperative"] = (
    "Kant's categorical imperative demands that one act only on maxims that could become universal moral laws.",
    "Кантын категорийн императив нь зөвхөн бүх нийтийн ёс суртахууны хууль болж чадахуйц зарчмаар үйлдэхийг шаарддаг.",
    "Kants kategorischer Imperativ verlangt, nur nach Maximen zu handeln, die allgemeines Gesetz werden könnten."
)
data["pluralism"] = (
    "A healthy democracy thrives on ideological pluralism, welcoming diverse cultural and political perspectives.",
    "Эрүүл ардчилал нь олон ургальч үзэл дээр цэцэглэн хөгжиж, соёл болон улс төрийн олон талт байр суурийг хүлээн зөвшөөрдөг.",
    "Eine gesunde Demokratie lebt vom weltanschaulichen Pluralismus und begrüßt vielfältige Perspektiven."
)
data["absolutism"] = (
    "Seventeenth-century royal absolutism concentrated unlimited legislative and judicial authority in the monarch.",
    "Арван долдугаар зууны хаант төрийн хэмжээгүй эрхт ёс буюу абсолютизм нь хууль тогтоох ба шүүх эрхийг хаанд бүрэн төвлөрүүлсэн.",
    "Der fürstliche Absolutismus des siebzehnten Jahrhunderts konzentrierte unbegrenzte Macht beim Monarchen."
)
data["fatalism"] = (
    "His philosophical fatalism led him to accept misfortunes calmly, believing destiny is entirely predetermined.",
    "Түүний фатализм буюу хувь тавиланд найдах үзэл нь хувь заяа урьдаас зурагдсан гэж үзэн зовлон бэрхшээлийг тайван хүлээж авахад хүргэв.",
    "Sein Fatalismus verleitete ihn dazu, Unglücke gelassen hinzunehmen, da alles vorherbestimmt sei."
)
data["hedonism"] = (
    "Ancient Epicurean hedonism sought tranquility and intellectual pleasure rather than reckless sensory indulgence.",
    "Эртний Эпикурын гедонизм нь замбараагүй зугаа цэнгэлээс илүү сэтгэлийн амар амгалан, оюуны таашаалыг эрэлхийлдэг байв.",
    "Der antike Epikureismus strebte nach Seelenruhe und geistigem Genuss statt nach hemmungsloser Ausschweifung."
)
data["asceticism"] = (
    "Monks practiced severe asceticism in the remote desert monastery, renouncing all worldly possessions.",
    "Хийдийн лам хуврагууд алслагдсан цөлийн хийдэд дэлхийн бүх эд баялгаас татгалзан хатуу даяанчлал, даяанч ёсыг сахиж байв.",
    "Mönche praktizierten strenge Askese im abgelegenen Wüstenkloster und entsagten allen weltlichen Gütern."
)
data["solipsism"] = (
    "Philosophical solipsism holds the extreme epistemological view that only one's own mind is sure to exist.",
    "Гүн ухааны солипсизм нь зөвхөн өөрийн ухамсар, сэтгэхүй л оршин байгаа нь эргэлзээгүй гэж үздэг туйлын үзэл юм.",
    "Der Solipsismus vertritt die radikale Ansicht, dass nur das eigene Bewusstsein sicher existiert."
)
data["phenomenology"] = (
    "Husserl's phenomenology investigates how conscious phenomena appear directly to human perception.",
    "Гуссерлийн феноменологи нь ухамсарт юмс үзэгдэл хүний хүртэхүйд хэрхэн шууд буудгийг судалдаг.",
    "Husserls Phänomenologie untersucht, wie bewusste Phänomene der menschlichen Wahrnehmung direkt erscheinen."
)
data["structuralism"] = (
    "Linguistic structuralism analyzes human culture through underlying relational networks and signs.",
    "Хэл шинжлэлийн структурализм буюу бүтцийн онол нь хүний соёлыг харилцааны суурь сүлжээ, тэмдгүүдээр дамжуулан шинжилдэг.",
    "Der Strukturalismus analysiert Kultur anhand von zugrunde liegenden relationalen Zeichensystemen."
)
data["deconstruction"] = (
    "Derrida introduced textual deconstruction to expose hidden contradictions within philosophical writings.",
    "Деррида гүн ухааны бүтээлүүд дэх далд зөрчлийг илрүүлэхийн тулд бичвэрийг задлан шинжлэх деконструкцийн аргыг нэвтрүүлжээ.",
    "Derrida führte die Dekonstruktion ein, um verborgene Widersprüche in philosophischen Texten aufzudecken."
)
data["existential threat"] = (
    "Runaway climate change poses an existential threat to low-lying island nations.",
    "Уур амьсгалын хяналтгүй дулаарал нь нам дор арал улсуудын оршин тогтнолд бодит аюул заналхийлж байна.",
    "Der fortschreitende Klimawandel stellt eine existenzielle Bedrohung für tief liegende Inselstaaten dar."
)
data["moral dilemma"] = (
    "Whistleblowers face an agonizing moral dilemma between corporate loyalty and public safety.",
    "Шүгэл үлээгчид байгууллагадаа үнэнч байх ба нийтийн аюулгүй байдлыг хамгаалахын хооронд хүнд ёс суртахууны сонголттой тулгардаг.",
    "Whistleblower stehen vor einem quälenden moralischen Dilemma zwischen Loyalität und Gemeinwohl."
)
data["hermeneutic circle"] = (
    "Interpreting scripture requires navigating the hermeneutic circle between individual verses and whole texts.",
    "Судар номыг тайлбарлах нь тусдаа бадаг ба бүхэл бичвэрийн хоорондох тайлбар зүйн тойргийг ойлгохыг шаарддаг.",
    "Das Verstehen heiliger Texte erfordert das Durchlaufen des hermeneutischen Zirkels vom Teil zum Ganzen."
)

# History & Civilization
data["antiquity"] = (
    "Archaeologists uncovered pristine Roman mosaics dating back to classical Mediterranean antiquity.",
    "Археологичид сонгодог Газар дундын тэнгисийн эртний үед хамаарах Ромын бүрэн бүтэн мозайкуудыг илрүүлжээ.",
    "Archäologen legten makellose römische Mosaike aus der klassischen mediterranen Antike frei."
)
data["feudalism"] = (
    "Medieval feudalism bound peasant serfs to agricultural labor in exchange for lordly military protection.",
    "Дундад зууны феодализм нь тариачдыг язгууртны цэргийн хамгаалалтын хариуд газар тариалангийн хөдөлмөрт уяж байв.",
    "Der mittelalterliche Feudalismus band leibeigene Bauern im Tausch gegen Schutz an die Scholle."
)
data["agrarian society"] = (
    "Before rapid industrialization, the country functioned primarily as a self-sufficient agrarian society.",
    "Хурдацтай үйлдвэржилтээс өмнө тус улс голчлон өөрийгөө тэтгэдэг газар тариалангийн нийгэм хэлбэрээр ажилладаг байв.",
    "Vor der raschen Industrialisierung fungierte das Land primär als autarke Agrargesellschaft."
)
data["mercantilism"] = (
    "Early modern mercantilism prioritized bullion accumulation and strict imperial colonial monopolies.",
    "Эрт үеийн меркантилизм нь алт мөнгө хуримтлуулах ба колонийн худалдааны хатуу монополийг нэн тэргүүнд тавьдаг байв.",
    "Der frühneuzeitliche Merkantilismus setzte auf die Anhäufung von Edelmetallen und Handelsmonopole."
)
data["colonialism"] = (
    "Nineteenth-century European colonialism exploited natural resources across Africa and South Asia.",
    "Арван есдүгээр зууны Европын колоничлол нь Африк болон Өмнөд Азийн байгалийн баялгийг өргөнөөр мөлжиж байв.",
    "Der europäische Kolonialismus des 19. Jahrhunderts beutete Rohstoffe in Afrika und Asien aus."
)
data["imperialism"] = (
    "Economic imperialism expanded geopolitical spheres of influence through debt dependency and naval blockades.",
    "Эдийн засгийн империализм нь өрийн хараат байдал ба тэнгисийн цэргийн хоригоор дамжуулан геополитикийн нөлөөгөө тэлжээ.",
    "Wirtschaftlicher Imperialismus weitete Einflusszonen durch Schuldenabhängigkeit und Blockaden aus."
)
data["emancipation"] = (
    "The constitutional proclamation secured the immediate emancipation of millions of enslaved workers.",
    "Үндсэн хуулийн тунхаглал нь олон сая боолчлогдсон хүмүүсийн нэн даруй эрх чөлөөгөө олж чөлөөлөгдөх баталгааг хангасан.",
    "Die verfassungsmäßige Proklamation sicherte die sofortige Emanzipation von Millionen Versklavten."
)
data["armistice"] = (
    "The opposing generals signed a temporary armistice halting combat along the western front.",
    "Эсрэг талуудын генералууд баруун фронтын дагуух тулааныг зогсоох түр гал зогсоох гэрээнд гарын үсэг зурав.",
    "Die gegnerischen Generäle unterzeichneten einen Waffenstillstand, der die Kämpfe an der Front beendete."
)
data["confederation"] = (
    "The loose confederation of autonomous cantons agreed to coordinate mutual defense and border customs.",
    "Автономит кантонуудын холбоо буюу конфедераци нь харилцан бие биенээ батлан хамгаалах болон хилийн гаалиа зохицуулахаар тохиролцов.",
    "Der lose Staatenbund autonomer Kantone vereinbarte gemeinsame Verteidigung und Zollgrenzen."
)
data["commonwealth"] = (
    "Member nations of the international commonwealth collaborate on educational exchange and sporting events.",
    "Олон улсын хамтын нөхөрлөлийн гишүүн орнууд боловсролын солилцоо, спортын арга хэмжээн дээр хамтран ажилладаг.",
    "Mitgliedstaaten des internationalen Commonwealth kooperieren bei Bildungsaustausch und Sport."
)
data["renaissance man"] = (
    "Leonardo da Vinci epitomized the ideal renaissance man, mastering anatomy, engineering, and painting.",
    "Леонардо да Винчи нь анагаах, инженерчлэл, уран зурагт нэгэн зэрэг гаршсан сэргэн мандалтын үеийн тал бүрийн авьяастны тод жишээ байв.",
    "Leonardo da Vinci verkörperte den Universalgelehrten, der Anatomie, Ingenieurwesen und Malerei beherrschte."
)
data["enlightenment"] = (
    "The European Enlightenment championed scientific inquiry, personal liberty, and the questioning of monarchical power.",
    "Европын Гэгээрлийн эрин үе нь шинжлэх ухааны эрэл хайгуул, хувь хүний эрх чөлөө болон хаант засаглалын эрх мэдлийг эргэлзэн шалгахыг уриалсан юм.",
    "Die europäische Aufklärung trat für wissenschaftliche Forschung, persönliche Freiheit und Vernunft ein."
)

with open('/tmp/b2_part3.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("B2 Part 3 written, entries:", len(data))
