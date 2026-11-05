import json

data = {}

# 330 - 436 (107 words)
# Industry & Modern Management
data["industrial revolution"] = (
    "The first industrial revolution shifted manufacturing from artisan workshops to steam-powered textile mills.",
    "Аж үйлдвэрийн анхдугаар хувьсгал нь үйлдвэрлэлийг гар урлалын цехээс уураар ажилладаг нэхмэлийн үйлдвэрүүд рүү шилжүүлсэн.",
    "Die erste industrielle Revolution verlagerte die Fertigung von Handwerksbetrieben zu dampfbetriebenen Webereien."
)
data["global governance"] = (
    "Multilateral institutions coordinate global governance to tackle cross-border challenges like pandemics.",
    "Олон талт байгууллагууд цар тахал зэрэг хил дамнасан сорилтуудыг шийдвэрлэхийн тулд дэлхийн засаглалыг уялдуулан зохицуулдаг.",
    "Multilaterale Institutionen koordinieren die Global Governance, um grenzüberschreitende Herausforderungen zu bewältigen."
)
data["corporate governance"] = (
    "Transparent corporate governance protects minority shareholders and ensures financial accountability.",
    "Ил тод компанийн засаглал нь жижиг хувьцаа эзэмшигчдийн эрхийг хамгаалж, санхүүгийн хариуцлагыг хангадаг.",
    "Transparente Corporate Governance schützt Minderheitsaktionäre und sichert finanzielle Rechenschaftspflicht."
)
data["fiduciary duty"] = (
    "Investment fund managers have a legal fiduciary duty to prioritize their clients' financial interests.",
    "Хөрөнгө оруулалтын сангийн менежерүүд үйлчлүүлэгчдийнхээ санхүүгийн ашиг сонирхлыг нэн тэргүүнд тавих итгэмжлэлийн хууль ёсны үүрэгтэй.",
    "Fondsmanager haben eine gesetzliche Treuepflicht, die finanziellen Interessen ihrer Kunden voranzustellen."
)
data["scrum master"] = (
    "The scrum master removed workflow blockers so the software team could deliver sprint commitments on schedule.",
    "Скрам мастер нь багийн ажлын урсгалын саадыг арилгаснаар програм хангамжийн баг спринтийн даалгавраа хугацаанд нь биелүүлэх боломжтой болсон.",
    "Der Scrum Master beseitigte Hindernisse, damit das Entwicklerteam die Sprint-Ziele rechtzeitig erreichte."
)
data["agile methodology"] = (
    "Adopting agile methodology enabled the engineering team to iterate rapidly on user feedback.",
    "Эжайл арга зүйг нэвтрүүлснээр инженерийн баг хэрэглэгчийн санал хүсэлтэд үндэслэн бүтээгдэхүүнээ хурдан сайжруулах боломжтой болсон.",
    "Die Einführung der agilen Methodik ermöglichte es dem Team, schnell auf Nutzerfeedback zu reagieren."
)
data["key performance indicator"] = (
    "Customer churn rate serves as a key performance indicator for evaluating subscription business health.",
    "Хэрэглэгчийн үйлчилгээнээс татгалзах хувь нь захиалгат бизнесийн гүйцэтгэлийн гол үзүүлэлт болдог.",
    "Die Kundenabwanderungsrate dient als zentraler Leistungskennwert zur Beurteilung von Abonnementmodellen."
)
data["value proposition"] = (
    "The software firm articulated a compelling value proposition centered on automated cost reduction.",
    "Програм хангамжийн компани зардлыг автоматаар бууруулахад чиглэсэн үнэ цэнийн тодорхой санал дэвшүүлсэн.",
    "Das Softwareunternehmen formulierte ein überzeugendes Nutzenversprechen rund um automatisierte Kostensenkung."
)
data["market penetration"] = (
    "Aggressive introductory pricing enabled rapid market penetration in the competitive beverage sector.",
    "Эхний үеийн өрсөлдөхүйц хямд үнэ нь ундааны зах зээлд хурдан нэвтрэх боломжийг олгосон.",
    "Aggressive Einführungspreise ermöglichten eine rasche Marktdurchdringung im umkämpften Getränkesektor."
)
data["competitive advantage"] = (
    "Proprietary patented battery technology gave the electric vehicle maker a durable competitive advantage.",
    "Патентлагдсан өөрийн батарейн технологи нь цахилгаан автомашин үйлдвэрлэгчид урт хугацааны өрсөлдөөний давуу талыг олгосон.",
    "Patentierte Batterietechnologie verschaffte dem Elektroautohersteller einen dauerhaften Wettbewerbsvorteil."
)
data["risk assessment"] = (
    "Before underwriting the project, civil engineers conducted a comprehensive environmental risk assessment.",
    "Төслийг батлахаас өмнө барилгын инженерүүд байгаль орчны эрсдэлийн цогц үнэлгээг хийсэн.",
    "Vor der Freigabe des Projekts führten Bauingenieure eine umfassende Umweltrisikobewertung durch."
)
data["contingency plan"] = (
    "The logistics company prepared a contingency plan in case hurricane winds closed the maritime port.",
    "Далайн боомт хар салхины улмаас хаагдах тохиолдолд ложистикийн компани гэнэтийн нөхцөл байдлын төлөвлөгөө бэлтгэсэн байв.",
    "Das Logistikunternehmen erstellte einen Notfallplan für den Fall, dass Hurrikanwinde den Seehafen lahmlegen."
)
data["synergy"] = (
    "The corporate merger generated operational synergy, reducing duplicate administrative overhead.",
    "Компаниудын нэгдэл нь үйл ажиллагааны харилцан үр ашиг, хамтын ажиллагааны синергийг бий болгож, давхардсан зардлыг бууруулсан.",
    "Die Fusion schuf operative Synergieeffekte und senkte doppelte Verwaltungskosten."
)
data["benchmarking"] = (
    "The hospital improved surgical outcomes by benchmarking recovery protocols against top global clinics.",
    "Тус эмнэлэг дэлхийн шилдэг эмнэлгүүдийн эдгэрэлтийн протоколтой харьцуулан жишиг тогтоох замаар мэс заслын үр дүнгээ сайжруулсан.",
    "Das Krankenhaus verbesserte chirurgische Ergebnisse durch Benchmarking mit weltweit führenden Kliniken."
)
data["change management"] = (
    "Effective organizational change management requires empathetic communication with affected staff.",
    "Байгууллагын өөрчлөлтийн үр дүнтэй менежмент нь нөлөөлөлд өртөж буй ажилтнуудтай ойлголцсон харилцаа тогтоохыг шаарддаг.",
    "Effektives Change-Management erfordert einfühlsame Kommunikation mit den betroffenen Mitarbeitern."
)
data["due diligence"] = (
    "Corporate lawyers completed three months of thorough due diligence before finalizing the acquisition.",
    "Компанийн хуульчид худалдан авах хэлэлцээрийг дуусгахаас өмнө гурван сарын турш нарийвчилсан аудит, хуулийн шалгалт хийсэн.",
    "Die Unternehmensanwälte schlossen eine dreimonatige sorgfältige Due-Diligence-Prüfung vor der Übernahme ab."
)
data["feasibility study"] = (
    "The city council commissioned an independent feasibility study to evaluate the projected subway line.",
    "Хотын захиргаа төлөвлөж буй метроны шугамын үр ашгийг үнэлэх зорилгоор хараат бус техник-эдийн засгийн үндэслэлийн судалгаа хийлгэсэн.",
    "Der Stadtrat gab eine Machbarkeitsstudie in Auftrag, um die geplante U-Bahn-Linie zu bewerten."
)
data["ubiquitous presence"] = (
    "Smartphones have established a ubiquitous presence in almost every facet of daily human life.",
    "Ухаалаг утас нь хүний өдөр тутмын амьдралын бараг бүх салбарт хаа сайгүй орших түгээмэл үзэгдэл болжээ.",
    "Smartphones haben eine allgegenwärtige Präsenz in fast allen Bereichen des täglichen Lebens erlangt."
)
data["ephemeral nature"] = (
    "The blossoming cherry trees remind observers of the ephemeral nature of earthly beauty.",
    "Цэцэглэж буй интоорын мод нь байгалийн гоо үзэсгэлэнгийн зуурдын, түр зуурын мөн чанарыг хүмүүст сануулдаг.",
    "Die blühenden Kirschbäume erinnern den Betrachter an die vergängliche Natur irdischer Schönheit."
)
data["tenacious grip"] = (
    "The mountain climber maintained a tenacious grip on the narrow rock ledge during the howling blizzard.",
    "Уулчин ширүүн цасан шуурганы үеэр хадны нарийн ирмэгээс тууштай, чанга атгаж байлаа.",
    "Der Bergsteiger behielt während des Sturms einen unerbittlichen Griff an der schmalen Felskante."
)
data["meticulous attention"] = (
    "Restoring ancient manuscripts requires meticulous attention to delicate parchment fibers.",
    "Эртний гар бичмэлийг сэргээн засварлах нь нарийн илгэн цаасны ширхэг бүрт туйлын нямбай, нягт анхаарал тавихыг шаарддаг.",
    "Die Restaurierung alter Manuskripte erfordert akribische Aufmerksamkeit für empfindliche Pergamentfasern."
)

# Astronomy & Physics
data["supernova"] = (
    "A massive collapsing star detonates as a brilliant supernova, outshining an entire galaxy.",
    "Нүсэр том одны мөхөл нь бүхэл бүтэн галактикаас ч тод гэрэлтэх шинэ одны дэлбэрэлт буюу супернова үүсгэдэг.",
    "Ein kollabierender Riesenstern detoniert als brillante Supernova und überstrahlt eine ganze Galaxie."
)
data["black hole"] = (
    "Nothing, not even light, can escape the immense gravitational pull of a supermassive black hole.",
    "Хэт их масстай хар нүхний асар хүчтэй татах хүчнээс юу ч, тэр байтугай гэрэл ч зугтаж чадахгүй.",
    "Nichts, nicht einmal Licht, kann der immensen Anziehungskraft eines Schwarzen Lochs entkommen."
)
data["event horizon"] = (
    "Crossing the event horizon represents the point of no return for any matter falling into a black hole.",
    "Үзэгдлийн хаяа буюу хилийг давах нь хар нүх рүү унаж буй аливаа бодисын хувьд эргэж буцахгүй цэг болдог.",
    "Das Überschreiten des Ereignishorizonts markiert den Punkt ohne Wiederkehr für Materie."
)
data["singularity"] = (
    "At the mathematical center of a black hole lies a gravitational singularity of infinite density.",
    "Хар нүхний математик төвд хязгааргүй нягттай татах хүчний сингулярит буюу өвөрмөц цэг оршдог.",
    "Im mathematischen Zentrum eines Schwarzen Lochs liegt eine Singularität unendlicher Dichte."
)
data["nebula"] = (
    "Stellar winds sculpted glowing clouds of interstellar gas and dust into a majestic planetary nebula.",
    "Одны салхи нь од хоорондын хий, тоосонцрын гэрэлтсэн үүлсийг сүрлэг мананцар буюу небула болгон хувиргажээ.",
    "Stellare Winde formten leuchtende Gas- und Staubwolken zu einem majestätischen planetarischen Nebel."
)
data["pulsar"] = (
    "Radio telescopes detected periodic electromagnetic pulses radiating from a rapidly spinning pulsar.",
    "Радио телескопууд хурдан эргэлдэх пульсараас цацрах тогтмол цахилгаан соронзон цацрагийг илрүүлсэн.",
    "Radioteleskope fingen periodische elektromagnetische Impulse eines schnell rotierenden Pulsars auf."
)
data["quasar"] = (
    "Powered by an active galactic nucleus, the distant quasar emits more light than hundreds of normal galaxies.",
    "Идэвхтэй галактикийн цөмөөр тэжээгддэг алсын квазар нь хэдэн зуун энгийн галактикаас ч илүү гэрлийг цацруулдаг.",
    "Angetrieben von einem aktiven Galaxienkern strahlt der ferne Quasar mehr Licht ab als Hunderte Galaxien."
)
data["exoplanet"] = (
    "Spectroscopic observations confirmed the presence of atmospheric water vapor on the temperate exoplanet.",
    "Спектроскопийн ажиглалтаар тухайн тааламжтай бүсийн экзогариг дээр агаар мандлын усны уур байгааг баталсан.",
    "Spektroskopische Beobachtungen bestätigten Wasserdampf in der Atmosphäre des Exoplaneten."
)
data["red giant"] = (
    "As its hydrogen core depletes, the aging sun will expand into an enormous red giant star.",
    "Устөрөгчийн цөм нь шавхагдах тусам хөгширч буй нар тэлж, аварга улаан од болон хувирах болно.",
    "Wenn sein Wasserstoffkern erschöpft ist, wird sich der alternde Stern zu einem Roten Riesen aufblähen."
)
data["white dwarf"] = (
    "After shedding its outer gas layers, the remnant stellar core cools slowly as a dense white dwarf.",
    "Гаднах хийн давхаргаа гөвсний дараа одны үлдэгдэл цөм нь нягт цагаан одой од болон аажмаар хөрдөг.",
    "Nach dem Abstoßen der Gashülle kühlt der dichte Kern langsam als Weißer Zwerg ab."
)
data["dark matter"] = (
    "Galactic rotation curves provide indirect evidence for vast halos of invisible dark matter.",
    "Галактикийн эргэлтийн хурдны муруй нь үл үзэгдэх харанхуй материйн асар том оршихуйн шууд бус нотолгоо болдог.",
    "Galaktische Rotationskurven liefern indirekte Beweise für riesige Halos unsichtbarer Dunkler Materie."
)
data["dark energy"] = (
    "Cosmologists hypothesize that dark energy drives the accelerating expansion of the observable universe.",
    "Сансар судлаачид харанхуй энерги нь ажиглагдаж буй орчлон ертөнцийн хурдацтай тэлэлтийг өдөөдөг гэж үздэг.",
    "Kosmologen vermuten, dass Dunkle Energie die beschleunigte Expansion des Universums antreibt."
)
data["gravitational wave"] = (
    "Laser interferometers detected the faint ripple of a gravitational wave produced by colliding neutron stars.",
    "Лазер интерферометрүүд мөргөлдсөн нейтрон оддоос үүссэн татах хүчний долгионы сул чичиргээг амжилттай бүртгэжээ.",
    "Laserinterferometer wiesen die feine Raumzeit-Welle einer Gravitationswelle nach."
)
data["light year"] = (
    "Proxima Centauri, our nearest stellar neighbor, is situated approximately four point two light years away.",
    "Манай хамгийн ойрын хөрш Проксима Кентавр од ойролцоогоор дөрөв аравны хоёр гэрлийн жилийн зайд оршдог.",
    "Proxima Centauri, unser nächster Nachbarstern, ist etwa 4,2 Lichtjahre entfernt."
)

# Oceanography & Biology
data["bioluminescence"] = (
    "Deep-sea anglerfish use bacterial bioluminescence to lure unsuspecting prey in pitch-black waters.",
    "Далайн гүний загаснууд хав харанхуй усанд ангаа татахын тулд нянгийн био гэрэлтэлтийг ашигладаг.",
    "Tiefsee-Anglerfische nutzen bakterielle Biolumineszenz, um Beute im stockdunklen Wasser anzulocken."
)
data["hydrothermal vent"] = (
    "Chemosynthetic bacteria thrive around the scorching, mineral-rich plume of the deep hydrothermal vent.",
    "Хемосинтезийн бактериуд далайн гүний халуун эрдэст гидротермал булаг буюу хүрхрээний орчимд үржин амьдардаг.",
    "Chemosynthetische Bakterien gedeihen an den mineralreichen hydrothermalen Tiefseequellen."
)
data["coral bleaching"] = (
    "Rising ocean water temperatures trigger widespread coral bleaching, threatening marine biodiversity.",
    "Далайн усны температур нэмэгдсэн нь шүр цайрах үзэгдлийг өдөөж, далайн биологийн олон янз байдалд аюул учруулж байна.",
    "Steigende Wassertemperaturen lösen weit verbreitete Korallenbleiche aus und gefährden Ökosysteme."
)
data["abyssal plain"] = (
    "Sediments accumulate undisturbed across the vast, flat expanse of the deep ocean abyssal plain.",
    "Далайн гүний тэгш тал буюу абиссаль талбайн уудам орон зайд тунамал хурдас олон зууны турш тайван хуримтлагддаг.",
    "Sedimente lagern sich ungestört auf den weiten Ebenen der ozeanischen Tiefseeebene ab."
)
data["phytoplankton"] = (
    "Microscopic marine phytoplankton produce more than half of the planet's atmospheric oxygen.",
    "Микроскоп далайн фитопланктон нь дэлхийн агаар мандлын хүчилтөрөгчийн талаас илүү хувийг үйлдвэрлэдэг.",
    "Mikroskopisches marines Phytoplankton erzeugt mehr als die Hälfte des Sauerstoffs unseres Planeten."
)
data["salinity"] = (
    "High rates of surface water evaporation increase the salinity of enclosed tropical seas.",
    "Гадаргын усны ууршилт ихэссэн нь хаалттай дулаан тэнгисүүдийн давсжилтын хэмжээг нэмэгдүүлдэг.",
    "Hohe Verdunstungsraten des Oberflächenwassers erhöhen den Salzgehalt geschlossener Meere."
)
data["oceanic trench"] = (
    "The Mariana Trench is the deepest oceanic trench on Earth, plunging nearly eleven kilometers down.",
    "Марианы хотгор нь дэлхийн хамгийн гүн далайн хонхор бөгөөд бараг арван нэгэн километр гүн рүү шумбадаг.",
    "Der Marianengraben ist der tiefste ozeanische Tiefseegraben der Erde und reicht fast elf Kilometer hinab."
)
data["upwelling"] = (
    "Wind-driven coastal upwelling brings nutrient-dense cold water from the ocean depths to the surface.",
    "Салхины нөлөөгөөр үүсэх эргийн өгсөх урсгал буюу апвеллинг нь далайн гүнээс шим тэжээлээр баялаг хүйтэн усыг гадарга руу гаргадаг.",
    "Windgetriebener Auftrieb bringt nährstoffreiches kaltes Tiefenwasser an die Meeresoberfläche."
)
data["tide pool"] = (
    "Children discovered colorful sea stars and hermit crabs trapped inside the rocky tide pool.",
    "Хүүхдүүд далайн түрлэгийн цөөрөм (эрэг орчмын хадны тогтоол ус) дотор гацсан өнгө өнгийн далайн од, хавчнуудыг олж харав.",
    "Kinder entdeckten bunte Seesterne und Einsiedlerkrebse im felsigen Gezeitentümpel."
)
data["tectonics"] = (
    "Plate tectonics explains how colliding continental crusts form high mountain ranges like the Himalayas.",
    "Хавтангийн тектоник нь тив хоорондын царцдас мөргөлдөж Гималайн нуруу шиг өндөр уулс хэрхэн үүссэнийг тайлбарладаг.",
    "Die Plattentektonik erklärt, wie kollidierende Kontinentalplatten Gebirge wie den Himalaya formen."
)
data["photosynthesis"] = (
    "Plant chloroplasts utilize photosynthesis to convert sunlight, carbon dioxide, and water into glucose.",
    "Ургамлын хлоропластууд нарны гэрэл, нүүрстөрөгчийн давхар исэл ба усыг фотосинтезийн тусламжтайгаар глюкоз болгон хувиргадаг.",
    "Pflanzliche Chloroplasten nutzen die Fotosynthese, um Sonnenlicht und Kohlendioxid in Glukose umzuwandeln."
)
data["cellular respiration"] = (
    "Mitochondria generate cellular energy in the form of ATP through the biochemical process of cellular respiration.",
    "Митохондри нь эсийн амьсгалын биохимийн процессоор дамжуулан АТФ хэлбэрээр эсийн энергийг ялгаруулдаг.",
    "Mitochondrien erzeugen Zellenergie in Form von ATP durch den biochemischen Prozess der Zellatmung."
)
data["meiosis"] = (
    "Meiosis produces genetically diverse reproductive gametes with half the chromosome count of somatic cells.",
    "Мейоз хуваагдал нь биеийн эсийн хагас хромосом бүхий удамшлын хувьд олон янз нөхөн үржихүйн бэлгийн эсүүдийг үүсгэдэг.",
    "Die Meiose erzeugt genetisch vielfältige Keimzellen mit halbiertem Chromosomensatz."
)
data["mitosis"] = (
    "Cellular mitosis allows damaged tissues to regenerate by dividing one somatic cell into two identical daughter cells.",
    "Эсийн митоз хуваагдал нь нэг эсийг ижил хоёр төл эс болгон хуваах замаар гэмтсэн эд эсийг нөхөн төлжүүлэх боломж олгодог.",
    "Die Mitose ermöglicht die Geweberegeneration durch Teilung einer Zelle in zwei identische Tochterzellen."
)
data["homeostasis"] = (
    "Sweating and shivering are physiological mechanisms that maintain internal thermal homeostasis in the body.",
    "Хөлрөх ба чичрэх нь бие махбодын дотоод дулааны тэнцвэр буюу гомеостазыг хадгалдаг физиологийн хариу үйлдэл юм.",
    "Schwitzen und Zittern sind Mechanismen, die die innere thermische Homöostase des Körpers aufrechterhalten."
)
data["entropy"] = (
    "The second law of thermodynamics states that the total entropy of an isolated system always increases.",
    "Термодинамикийн хоёрдугаар хуульд тусгаарлагдсан системийн нийт энтропи буюу эмх замбараагүй байдал үргэлж өсдөг гэж заасан байдаг.",
    "Der zweite Hauptsatz der Thermodynamik besagt, dass die Entropie isolierter Systeme stets zunimmt."
)
data["enthalpy"] = (
    "Calculating the change in reaction enthalpy indicates whether a chemical transformation absorbs or releases heat.",
    "Урвалын энтальпийн өөрчлөлтийг тооцоолох нь химийн хувирал дулаан шингээх эсвэл ялгаруулах эсэхийг харуулдаг.",
    "Die Enthalpieänderung zeigt an, ob eine chemische Reaktion Wärme aufnimmt oder freisetzt."
)
data["covalent bond"] = (
    "Two hydrogen atoms share electrons with an oxygen atom to form a stable covalent bond in a water molecule.",
    "Усны молекул дахь хүчилтөрөгчийн атомтай хоёр устөрөгчийн атом электроноо хуваалцаж тогтвортой ковалент холбоо үүсгэдэг.",
    "Zwei Wasserstoffatome teilen sich Elektronen mit Sauerstoff für eine kovalente Bindung im Wassermolekül."
)
data["ionic bond"] = (
    "Table salt crystallizes when positively charged sodium and negatively charged chloride form an ionic bond.",
    "Эерэг цэнэгтэй натри ба сөрөг цэнэгтэй хлор нь ионы холбоо үүсгэснээр хоолны давс талсжин тогтдог.",
    "Kochsalz kristallisiert, wenn positiv geladenes Natrium und Chlorid eine Ionenbindung eingehen."
)
data["enzyme"] = (
    "The digestive enzyme amylase accelerates the breakdown of dietary starch into simple sugars.",
    "Хоол боловсруулах амилаза фермент нь цардуулыг энгийн сахар болгон задлах явцыг хурдасгадаг.",
    "Das Verdauungsenzym Amylase beschleunigt den Abbau von Stärke in einfache Zucker."
)

# Sociolinguistics & Culture
data["pragmatics"] = (
    "Linguistic pragmatics examines how unspoken social context and intent influence the interpretation of utterances.",
    "Хэл шинжлэлийн прагматик нь нийгмийн далд нөхцөл байдал ба харилцааны далд зорилго үгийн утгад хэрхэн нөлөөлдгийг судалдаг.",
    "Die Pragmatik untersucht, wie sozialer Kontext und Sprecherabsicht die Bedeutung von Äußerungen prägen."
)
data["sociolinguistics"] = (
    "Sociolinguistics explores how socioeconomic class, gender, and regional identity shape patterns of speech.",
    "Нийгмийн хэл шинжлэл нь нийгэм-эдийн засгийн давхарга, хүйс ба нутаг усны онцлог ярианы хэв маягт хэрхэн нөлөөлдгийг судалдаг.",
    "Die Soziolinguistik erforscht, wie soziale Schichten und Herkunft Sprachmuster beeinflussen."
)
data["dialectology"] = (
    "Field researchers in dialectology travel to remote rural valleys to record endangered regional idioms.",
    "Аялга судлалын судалгааны баг мөхөж буй нутгийн аялгууг тэмдэглэн үлдээхийн тулд алслагдсан хөдөө тосгодоор аялдаг.",
    "Feldforscher der Dialektologie reisen in abgelegene Täler, um bedrohte Mundarten aufzuzeichnen."
)
data["bilingualism"] = (
    "Childhood bilingualism fosters enhanced cognitive flexibility and executive control functions.",
    "Бага наснаасаа хоёр хэлээр ярьж өсөх нь оюуны уян хатан чанар ба төвлөрөх чадварыг сайжруулдаг.",
    "Frühkindliche Zweisprachigkeit fördert geistige Flexibilität und exekutive Kontrollfunktionen."
)
data["lingua franca"] = (
    "English serves as the uncontested global lingua franca in international civil aviation communications.",
    "Англи хэл нь олон улсын иргэний агаарын тээврийн харилцааны нийтлэг ойлголцлын хэл буюу лингва франка болдог.",
    "Englisch dient als unumstrittene globale Lingua Franca in der internationalen Zivilluftfahrt."
)
data["prosody"] = (
    "Poetic prosody encompasses rhythmic meter, tempo variations, and the melodic cadence of verse.",
    "Шүлгийн дуу авианы бүтэц буюу просоди нь шүлгийн хэмнэл, хурдны өөрчлөлт ба аялга эгшгийг хамардаг.",
    "Die poetische Prosodie umfasst Versmaß, Tempo und melodische Kadenz gesprochener Verse."
)
data["intonation"] = (
    "A rising intonation at the end of a spoken sentence typically signals an inquiring question in English.",
    "Өгүүлбэрийн төгсгөлд дууны өнгө өсөх нь англи хэлэнд асуулт асууж буйг илтгэдэг аялгын онцлог юм.",
    "Eine steigende Intonation am Satzende signalisiert im Englischen typischerweise eine Frage."
)
data["zeitgeist"] = (
    "The rebellious psychedelic music of the late 1960s perfectly captured the countercultural zeitgeist.",
    "1960-аад оны сүүл үеийн сэтгэцэд нөлөөлөх хөгжим нь тухайн цаг үеийн сэтгэл зүй, үзэл санааны илэрхийлэл болж байв.",
    "Die psychedelische Musik der späten 1960er fing den Geist der damaligen Epoche perfekt ein."
)
data["avant-garde"] = (
    "The experimental fashion designer is celebrated for bold, avant-garde silhouettes that challenge gender norms.",
    "Туршилтын загвар зохион бүтээгч нь уламжлалт хэв маягийг эвдсэн шинэлэг, авангард хэлбэр дүрсээрээ алдартай.",
    "Der avantgardistische Modeschöpfer ist für gewagte Entwürfe bekannt, die Normen herausfordern."
)
data["sensationalism"] = (
    "Tabloid sensationalism distorts serious public policy issues into dramatic celebrity scandals.",
    "Шар хэвлэлийн сенсаци хөөцөлдөх, дуулиан дэгдээх хандлага нь нийгмийн чухал бодлогын асуудлуудыг ододын хэрүүл болгон гуйвуулдаг.",
    "Boulevard-Sensationalismus verzerrt ernste Politik zu dramatischen Promi-Skandalen."
)
data["echo chamber"] = (
    "Algorithmic social media feeds trap users inside an ideological echo chamber that reinforces bias.",
    "Алгоритмд тулгуурласан сошиал медиа нь хэрэглэгчдийг өөрийн үзлийг л давтан баталгаажуулдаг мэдээллийн нэг талыг барьсан орчинд түгждэг.",
    "Soziale Netzwerke sperren Nutzer oft in eine Echo-Kammer, die bestehende Vorurteile bestärkt."
)
data["media literacy"] = (
    "Schools teach critical media literacy so students can distinguish factual journalism from deepfakes.",
    "Сургуулиуд сурагчдад бодит сэтгүүл зүйг хуурамч мэдээллээс ялгахад туслах шүүмжлэлт медиа боловсролыг заадаг.",
    "Schulen vermitteln Medienkompetenz, damit Schüler Fakten von Fälschungen unterscheiden können."
)
data["cancel culture"] = (
    "Critics argue that online cancel culture discourages open nuance and promotes retaliatory harassment.",
    "Шүүмжлэгчид цахим орчны бойкотлох соёл нь нээлттэй хэлэлцүүлгийг хаан боогдуулж, өс хонзонгийн шинжтэй дарамтыг дэвэргэдэг гэж үздэг.",
    "Kritiker betonen, dass Online-Pranger differenzierte Debatten ersticken und Mobbing fördern."
)
data["constructivism"] = (
    "Soviet constructivism integrated industrial materials like steel and glass into bold graphic typography.",
    "Зөвлөлтийн конструктивизм нь ган ба шил зэрэг үйлдвэрийн материалыг зоримог график дүрслэлтэй нэгтгэсэн.",
    "Der sowjetische Konstruktivismus integrierte Stahl und Glas in kühne grafische Entwürfe."
)
data["art deco"] = (
    "The Chrysler Building showcases classic Art Deco geometry, polished chrome sunbursts, and aerodynamic lines.",
    "Крайслер цамхаг нь сонгодог Арт Декогийн геометрийн тэгш хэм, өнгөлсөн хромон нарны цацраг ба цэвэр шугамыг харуулдаг.",
    "Das Chrysler Building zeigt klassische Art-Déco-Geometrie, polierten Chrom und stromlinienförmige Linien."
)
data["art nouveau"] = (
    "Art Nouveau architecture draws inspiration from organic nature, incorporating sinuous floral curves into ironwork.",
    "Арт Нуво загварын архитектур нь байгалиас сэдэвлэн цэцэг навчны долгиолсон муруй шугамыг төмөр хийцэд шингээсэн байдаг.",
    "Der Jugendstil lässt sich von der Natur inspirieren und nutzt florale Kurven in Schmiedearbeiten."
)
data["bauhaus"] = (
    "The German Bauhaus movement championed the enduring design principle that form must follow function.",
    "Германы Баухаус хөдөлгөөн нь аливаа зүйлийн хэлбэр нь түүний үүрэг зориулалтад нийцэх ёстой гэсэн дизайны үндсэн зарчмыг тунхагласан юм.",
    "Das Bauhaus verfocht das Gestaltungsprinzip, dass die Form stets der Funktion folgen muss."
)
data["cantilever"] = (
    "Frank Lloyd Wright engineered dramatic concrete cantilever balconies projecting outward over the waterfall.",
    "Фрэнк Ллойд Райт хүрхрээн дээгүүр гадагш тэлж гарсан бетонон консоль тагт буюу кантилевер бүтцийг төлөвлөжээ.",
    "Frank Lloyd Wright entwarf dramatische Kragträger-Balkone, die über den Wasserfall hinausragen."
)
data["pediment"] = (
    "The triangular classical pediment above the museum entrance depicts carved Olympian deities.",
    "Музейн үүдний дээд талын гурвалжин хэлбэрт фронтон буюу педимент дээр Олимпийн бурхдыг сийлсэн байдаг.",
    "Das dreieckige klassische Giebelfeld über dem Portal zeigt gemeißelte olympische Gottheiten."
)
data["clerestory"] = (
    "A continuous row of high clerestory windows illuminates the interior nave of the ancient basilica.",
    "Сүмийн өндөрт байрлах тусгай цонхны эгнээ буюу клерестори нь дотоод гол танхимыг нарны байгалийн гэрлээр гэрэлтүүлдэг.",
    "Eine durchgehende Reihe von Obergadenfenstern erhellt das Hauptschiff der Kathedrale."
)
data["vaulted ceiling"] = (
    "Voices echoed musically beneath the ribbed stone vaulted ceiling of the Romanesque monastery.",
    "Романеск хийдийн нуман хэлбэртэй чулуун өндөр таазны дор дуу хоолой цуурайтан уянгалав.",
    "Stimmen hallten unter der gotischen Gewölbedecke des alten Klosters melodisch wider."
)
data["cornice"] = (
    "Decorative stone brackets support the projecting classical cornice along the roofline of the palazzo.",
    "Чимэглэлийн чулуун тулгуурууд нь ордны дээврийн дагуух гадагш товойсон хөвөө карниз буюу эмжээрийг тулдаг.",
    "Verzierte Steinkonsolen stützen das vorspringende klassische Gesims entlang der Dachkante."
)
data["gargoyle"] = (
    "Rainwater gushed from the open stone jaws of the grotesque carved cathedral gargoyle.",
    "Цутгасан борооны ус сүмийн чулуун ус зайлуулагч амьтны дүрт гаргуйн нээлттэй амаар доош урсаж байв.",
    "Regenwasser strömte aus dem geöffneten Steinmaul des grotesk gemeißelten Wasserspeiers."
)

# Politics & Political Philosophy
data["gerrymandering"] = (
    "Partisan gerrymandering redraws district voting maps to favor one political party over another.",
    "Намын явцуу эрх ашигт нийцүүлэн сонгуулийн тойргийг өөрт ашигтайгаар хуваарилах нь шударга бус давуу тал үүсгэдэг.",
    "Parteipolitisches Gerrymandering verzerrt Wahlbezirke, um eine politische Partei gezielt zu begünstigen."
)
data["demagogue"] = (
    "The fiery political demagogue gained popularity by exploiting public prejudice and economic scapegoating.",
    "Олон түмнийг өдөөн турхирагч популист улстөрч ард түмний сэтгэл зүй ба нийгмийн эмзэг сэдвийг ашиглан нэр хүнд олж авчээ.",
    "Der populistische Demagoge gewann Popularität durch das Schüren von Ängsten und Vorurteilen."
)
data["populism"] = (
    "Authoritarian populism pits ordinary hardworking citizens against what it portrays as a corrupt ruling elite.",
    "Популизм буюу ард түмний сэтгэлд тааруулсан амлалт нь жирийн иргэдийг эрх баригч элитүүдийн эсрэг сөргөлдүүлэн турхирдаг.",
    "Populismus stellt oft das einfache Volk einer angeblich korrupten Elite feindselig gegenüber."
)
data["meritocracy"] = (
    "A true meritocracy rewards individuals based strictly on talent, competence, and measurable achievement.",
    "Чадварт тулгуурласан шударга тогтолцоо буюу меритократи нь зөвхөн хувь хүний авьяас, мэдлэг чадвар ба бодит амжилтыг үнэлдэг.",
    "Eine echte Meritokratie belohnt Menschen strikt nach Talent, Kompetenz und erbrachter Leistung."
)
data["plutocracy"] = (
    "Unregulated corporate political campaign donations risk transforming democracy into an entrenched plutocracy.",
    "Хязгааргүй сонгуулийн хандивууд нь ардчиллыг баян чинээлэг хүмүүсийн ноёрхол буюу плутократи болгон хувиргах эрсдэлтэй.",
    "Uferlose Wahlkampfspenden drohen Demokratien in eine verfestigte Plutokratie der Superreichen zu verwandeln."
)
data["kleptocracy"] = (
    "Investigative journalists exposed how the authoritarian kleptocracy diverted state mining wealth into secret offshore trusts.",
    "Эрэн сурвалжлах сэтгүүлчид хулгайч дээрэмчдийн засаглал төрийн уул уурхайн орлогыг оффшор данс руу хэрхэн завшсаныг илчилжээ.",
    "Investigative Journalisten deckten auf, wie die Kleptokratie Staatsvermögen auf Auslandskonten veruntreute."
)
data["technocracy"] = (
    "During the debt crisis, the interim government was led by an unelected technocracy of central bankers and economists.",
    "Өрийн хямралын үеэр түр засгийн газрыг эдийн засагчид ба банкны шинжээчдээс бүрдсэн мэргэжилтнүүдийн засаглал удирдсан.",
    "In der Krise wurde die Übergangsregierung von einer Technokratie aus Wirtschaftsexperten geführt."
)
data["theocracy"] = (
    "In a strict theocracy, civil legislation must conform precisely to religious scripture interpreted by clerics.",
    "Теократ засаглал (шашны тэргүүний засаглал) бүхий оронд иргэний бүх хууль шашны судар ба номлолд яв цав нийцэх ёстой.",
    "In einer strengen Theokratie muss die weltliche Gesetzgebung religiösen Texten entsprechen."
)
data["disenfranchisement"] = (
    "Restrictive voter identification laws contribute to the systemic disenfranchisement of minority populations.",
    "Хэт хатуу бүртгэлийн хууль нь цөөнх иргэдийн сонгуулийн эрхийг хасах буюу хязгаарлахад хүргэдэг.",
    "Restriktive Wählergesetze führen zur systematischen Entrechtung marginalisierter Bevölkerungsgruppen."
)
data["polarization"] = (
    "Partisan polarization prevents bipartisan compromise on pressing infrastructure and education legislation.",
    "Улс төрийн талцал ба нийгмийн туйлшрал нь дэд бүтэц, боловсролын хууль дээр зөвшилцөлд хүрэхэд саад болдог.",
    "Politische Polarisierung verhindert überparteiliche Kompromisse bei wichtigen Infrastrukturprojekten."
)
data["civil disobedience"] = (
    "Mahatma Gandhi advocated nonviolent civil disobedience to peacefully resist unjust imperial colonial laws.",
    "Махатма Ганди шударга бус хуулиудыг эсэргүүцэхийн тулд хүчирхийллийн бус иргэний тайван эсэргүүцлийг уриалж байсан.",
    "Mahatma Gandhi trat für gewaltlosen zivilen Ungehorsam ein, um ungerechte Gesetze zu bekämpfen."
)
data["grassroots movement"] = (
    "The clean water campaign began as a small grassroots movement organized by local parents and teachers.",
    "Цэвэр усны төлөөх аян нь орон нутгийн эцэг эх, багш нарын санаачилсан ард түмний анхан шатны хөдөлгөөнөөр эхэлсэн.",
    "Die Umweltschutzinitiative begann als kleine Graswurzelbewegung engagierter Eltern und Lehrer."
)
data["social cohesion"] = (
    "Affordable municipal public parks and libraries foster community bonds and long-term social cohesion.",
    "Олон нийтийн цэцэрлэгт хүрээлэн ба нийтийн номын сангууд нь иргэдийн эв нэгдэл, нийгмийн нягтралыг бэхжүүлдэг.",
    "Bezahlbare Parks und Bibliotheken stärken den sozialen Zusammenhalt in der Nachbarschaft."
)

# Advanced Mathematics & Chemistry
data["logarithm"] = (
    "The Richter scale uses a base-ten logarithm to quantify earthquake magnitude across orders of scale.",
    "Рихтерийн шатлал нь газар хөдлөлтийн эрч хүчийг тооцоолохдоо 10-ын суурьтай логарифмыг ашигладаг.",
    "Die Richterskala nutzt einen Dekadischen Logarithmus, um die Erdbebenstärke zu beziffern."
)
data["exponential growth"] = (
    "Unchecked viral transmission exhibits exponential growth during the initial stages of an epidemic.",
    "Халдварт өвчний тархалт нь эхний шатандаа огцом, экспоненциал хурдацтай өсөлтийг харуулдаг.",
    "Ungebremste Virusübertragung zeigt in der Anfangsphase einer Epidemie exponentielles Wachstum."
)
data["derivative"] = (
    "In differential calculus, the derivative of position with respect to time yields instantaneous velocity.",
    "Дифференциал тоололд байрлалын хугацаанаас хамаарсан уламжлал (математик) нь агшин зуурын хурдыг илэрхийлдэг.",
    "In der Differenzialrechnung ergibt die Ableitung des Ortes nach der Zeit die Momentangeschwindigkeit."
)
data["integral"] = (
    "Computing the definite integral enables mathematicians to determine the exact area beneath a curved graph.",
    "Тодорхой интегралыг бодсоноор муруй шугамын доорх талбайг нарийвчлан тодорхойлох боломжтой болдог.",
    "Die Berechnung des bestimmten Integrals ermöglicht die Bestimmung der Fläche unter einer Kurve."
)
data["calculus"] = (
    "Newton and Leibniz independently invented infinitesimal calculus to model dynamic physical motion.",
    "Ньютон ба Лейбниц нар динамик физик хөдөлгөөнийг судлахын тулд математик анализийн ухаан буюу тооллыг бие даан нээсэн.",
    "Newton und Leibniz entwickelten unabhängig voneinander die Infinitesimalrechnung für dynamische Systeme."
)
data["equilibrium"] = (
    "At dynamic chemical equilibrium, the rate of the forward reaction equals the rate of the reverse reaction.",
    "Химийн динамик тэнцвэрийн үед шулуун урвалын хурд нь буцах урвалын хурдтай тэнцдэг.",
    "Im chemischen Gleichgewicht ist die Geschwindigkeit der Hinreaktion gleich der Rückreaktion."
)
data["stoichiometry"] = (
    "Using reaction stoichiometry, the industrial chemist calculated the exact grams of reactant required.",
    "Урвалын стехиометрийг ашиглан үйлдвэрийн химич шаардагдах урвалжийн нарийн граммыг тооцоолов.",
    "Mithilfe der Stöchiometrie berechnete der Industriechemiker die genaue benötigte Stoffmenge."
)
data["titration"] = (
    "Students determined the precise acid concentration through slow volumetric chemical titration.",
    "Оюутнууд хүчлийн нарийн концентрацийг тодорхойлохын тулд уусмалын титрлэлт шинжилгээг хийв.",
    "Studenten ermittelten die exakte Säurekonzentration durch tropfenweise chemische Titration."
)
data["chromatography"] = (
    "Gas chromatography separates volatile organic compounds based on their chemical travel velocity.",
    "Хийн хроматографийн арга нь дэгдэмхий органик нэгдлүүдийг тархалтын хурдаар нь тусгаарладаг.",
    "Die Gaschromatografie trennt flüchtige organische Verbindungen nach ihrer Wanderungsgeschwindigkeit."
)
data["electrophoresis"] = (
    "Gel electrophoresis separates charged DNA fragments according to molecular length under an electric field.",
    "Гель электрофорез нь цахилгаан орны тусламжтайгаар цэнэгтэй ДНХ-ийн хэлтэрхийнүүдийг хэмжээгээр нь ялгадаг.",
    "Die Gelelektrophorese trennt geladene DNA-Fragmente im elektrischen Feld nach ihrer Molekülgröße."
)
data["crystallography"] = (
    "X-ray crystallography enabled Rosalind Franklin to deduce the double-helix geometry of DNA.",
    "Рентген талст судлал буюу кристаллографи нь Розалинд Франклинд ДНХ-ийн давхар спираль бүтцийг тайлахад тусалсан.",
    "Die Röntgenkristallografie half Rosalind Franklin, die Doppelhelix-Struktur der DNA zu entschlüsseln."
)
data["superconductor"] = (
    "Cooled by liquid helium, the ceramic superconductor expels magnetic fields and conducts current with zero resistance.",
    "Шингэн гелигээр хөргөсөн шаазан хэт дамжуулагч материал нь соронзон орныг түлхэж, цахилгааныг тэглэсэн эсэргүүцэлтэй дамжуулдаг.",
    "Gekühlt durch flüssiges Helium leitet der Keramik-Supraleiter Strom völlig widerstandslos."
)
data["photoelectric effect"] = (
    "Einstein earned the Nobel Prize for demonstrating that the photoelectric effect proves light arrives in quanta.",
    "Эйнштейн фотоэффект үзэгдэл нь гэрэл квант хэлбэрээр ирдгийг нотолсны учир Нобелийн шагнал хүртсэн.",
    "Einstein erhielt den Nobelpreis für die Erklärung des lichtelektrischen Fotoeffekts durch Lichtquanten."
)
data["wave-particle duality"] = (
    "The double-slit experiment illustrates the wave-particle duality inherent to photons and electrons.",
    "Хос завсрын туршилт нь фотон ба электронд орших долгион-бөөмийн хоёрдмол чанарыг тодорхой харуулдаг.",
    "Das Doppelspaltexperiment veranschaulicht den Welle-Teilchen-Dualismus von Photonen und Elektronen."
)
data["quantum entanglement"] = (
    "Quantum entanglement links the quantum states of two paired particles regardless of the spatial distance separating them.",
    "Квантын орооцолдоон нь орон зайн зайнаас үл хамааран хос хоёр бөөмийн квант төлөвийг хооронд нь холбодог.",
    "Quantenverschränkung verbindet die Zustände zweier Teilchen unabhängig von ihrer räumlichen Distanz."
)
data["uncertainty principle"] = (
    "Heisenberg's uncertainty principle asserts that a particle's exact position and momentum cannot both be simultaneously known.",
    "Гейзенбергийн тодорхойгүйн зарчим нь эгэл бөөмийн байрлал ба импульсийг хоёуланг нь нэгэн зэрэг нарийн тогтоох боломжгүйг нотолдог.",
    "Heisenbergs Unschärferelation besagt, dass Ort und Impuls eines Teilchens nicht zugleich exakt messbar sind."
)

with open('/tmp/b2_part4.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("B2 Part 4 written, entries:", len(data))
