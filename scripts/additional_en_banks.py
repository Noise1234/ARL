# -*- coding: utf-8 -*-
"""
Additional vocabulary banks for English C1/C2 expansion and A2/B1/B2 dedup.
Natural Mongolian Cyrillic translations and level-appropriate sentences.
"""

EN_REPLACEMENTS = {
    "a2": [
        {"word": "attend", "pos": "verb", "forms": "attend | attends | attended | attended", "mn": "оролцох, суух, явах", "example_en": "She attends English language lectures every morning.", "example_mn": "Тэр өглөө бүр англи хэлний лекцэнд суудаг.", "topic": "Education"},
        {"word": "gather", "pos": "verb", "forms": "gather | gathers | gathered | gathered", "mn": "цугларах, цуглуулах", "example_en": "Family members gather around the table for dinner.", "example_mn": "Гэр бүлийн гишүүд оройн хоолоор ширээний ард цугладаг.", "topic": "Family"},
        {"word": "stroll", "pos": "verb", "forms": "stroll | strolls | strolled | strolled", "mn": "зугаалах, аажуу алхах", "example_en": "We stroll through the quiet city park in the evening.", "example_mn": "Бид оройдоо нам гүм хотын цэцэрлэгт хүрээлэнгээр зугаалдаг.", "topic": "Leisure"},
        {"word": "whisper", "pos": "verb", "forms": "whisper | whispers | whispered | whispered", "mn": "шивнэх, шивнэн хэлэх", "example_en": "They whisper quietly so as not to wake the sleeping baby.", "example_mn": "Тэд унтаж буй хүүхдийг сэрээхгүйн тулд чимээгүй шивнэдэг.", "topic": "Communication"}
    ],
    "b1": [
        {"word": "count on", "pos": "verb", "forms": "count on | counts on | counted on | counted on", "mn": "найдах, итгэл хүлээлгэх", "example_en": "You can always count on close friends during tough times.", "example_mn": "Хүнд хэцүү цагт чи ойр дотны найзууддаа ямагт найдаж болно.", "topic": "Relationships"}
    ],
    "b2": [
        {"word": "wrestle with", "pos": "verb", "forms": "wrestle with | wrestles with | wrestled with | wrestled with", "mn": "ноцолдох, бөх барилдах мэт хүнд сорилтыг даван туулах", "example_en": "Researchers wrestle with complex mathematical paradoxes.", "example_mn": "Судлаачид математикийн нарийн төвөгтэй парадоксуудыг тайлахаар чармайж байна.", "topic": "Science"},
        {"word": "grapple with", "pos": "verb", "forms": "grapple with | grapples with | grappled with | grappled with", "mn": "ноцолдох, учрыг олох гэж чармайх", "example_en": "Economists grapple with the multifaceted causes of worldwide inflation.", "example_mn": "Эдийн засагчид дэлхийн инфляцийн олон талт шалтгаануудын учрыг олохоор чармайж байна.", "topic": "Economics"}
    ]
}

EN_C1_EXTRA_BANK = [
    ("ubiquitous", "adjective", "бүх газар түгсэн, хаа сайгүй тааралдах", "Smartphones have become ubiquitous in modern urban society.", "Ухаалаг утаснууд орчин үеийн хотын нийгэмд хаа сайгүй түгээмэл болжээ.", "Society"),
    ("imperative", "adjective", "зайлшгүй чухал, хойшлуулшгүй", "It is imperative that we address climate change immediately.", "Бид уур амьсгалын өөрчлөлтийг нэн даруй шийдвэрлэх нь зайлшгүй чухал юм.", "Environment"),
    ("plausible", "adjective", "үнэмшилтэй, үнэн байх үндэслэлтэй", "The detective presented a plausible explanation for the disappearance.", "Мөрдөгч алга болсон явдлын талаар үнэмшилтэй тайлбар дэвшүүлэв.", "Law"),
    ("arbitrary", "adjective", "дур зоргын, дур дураараа тогтоосон", "The judge avoided arbitrary rulings by adhering strictly to the law.", "Шүүгч хуулийг чанд баримталснаар дур зоргын шийдвэр гаргахаас зайлсхийсэн.", "Law"),
    ("paramount", "adjective", "хамгийн чухал, эн тэргүүний", "Passenger safety is of paramount importance to the airline.", "Зорчигчдын аюулгүй байдал агаарын тээврийн компанийн хувьд хамгийн чухал зүйл юм.", "Safety"),
    ("stringent", "adjective", "хатуу чанд, нарийн шаардлагатай", "The European Union enforces stringent environmental regulations.", "Европын холбоо байгаль орчны хатуу чанд журмыг мөрдүүлдэг.", "Policy"),
    ("profound", "adjective", "гүн гүнзгий, асар их нөлөөтэй", "The scientific breakthrough had a profound impact on modern medicine.", "Шинжлэх ухааны нээлт орчин үеийн анагаах ухаанд гүн гүнзгий нөлөө үзүүлсэн.", "Science"),
    ("ambiguous", "adjective", "хоёрдмол утгатай, тодорхойгүй", "The contractual terms were deliberately ambiguous to allow flexibility.", "Уян хатан байдал олгохын тулд гэрээний нөхцөлүүдийг санаатайгаар тодорхойгүй орхижээ.", "Business"),
    ("invariably", "adverb", "ямагт, цаг ямагт хувиршгүйгээр", "Hard work and dedication invariably lead to meaningful success.", "Хичээл зүтгэл ба тууштай байдал нь ямагт бодитой амжилтад хүргэдэг.", "Success"),
    ("relentless", "adjective", "цуцашгүй, зогсолтгүй шийдэмгий", "Her relentless pursuit of excellence earned her international recognition.", "Түүний төгс төгөлдөрт тэмүүлсэн цуцашгүй эрмэлзэл нь түүнд олон улсын хүлээн зөвшөөрлийг авчирсан.", "Career"),
    ("disproportionate", "adjective", "хэт тэнцвэргүй, дүйцэхгүй их/бага", "The impoverished community bore a disproportionate share of the environmental burden.", "Ядуу буурай иргэд байгаль орчны ачааллын хэт тэнцвэргүй их хэсгийг үүрсэн.", "Society"),
    ("tenuous", "adjective", "хэврэг, тун сулхан холбоостой", "The diplomatic alliance rested on a tenuous ceasefire agreement.", "Дипломат холбоотон харилцаа тун хэврэг гал зогсоох хэлэлцээрт тулгуурлаж байв.", "Politics"),
    ("resilient", "adjective", "тэсвэр хатуужилтай, хямралыг даван туулах чадвартай", "The economy proved surprisingly resilient despite geopolitical shocks.", "Геополитикийн цочролуудыг үл харгалзан эдийн засаг гайхалтай тэсвэртэй болохоо харуулав.", "Economics"),
    ("pragmatic", "adjective", "ажил хэрэгч, практикт нийцсэн", "We require a pragmatic solution rather than theoretical posturing.", "Бидэнд онолын хоосон мэдэмхийрлийн оронд ажил хэрэгч практик шийдэл хэрэгтэй.", "Policy"),
    ("cohesive", "adjective", "нягт нямбай холбоотой, эв нэгдэлтэй", "A cohesive team accomplishes complex goals much faster.", "Нягт эв нэгдэлтэй баг нарийн төвөгтэй зорилгыг хамаагүй хурдан биелүүлдэг.", "Management"),
    ("lucrative", "adjective", "ашиг орлого өндөртэй, ашигтай", "The software firm secured a lucrative government contract.", "Програм хангамжийн фирм ашиг орлого өндөртэй засгийн газрын гэрээг баталгаажуулав.", "Business"),
    ("comprehensive", "adjective", "бүх талыг хамарсан, цогц", "The audit provides a comprehensive review of all company expenditures.", "Аудит нь компанийн бүх зардлын бүрэн цогц хяналтыг өгдөг.", "Finance"),
    ("intricate", "adjective", "нарийн төвөгтэй, олон хэсгээс бүрдсэн", "The clockwork mechanism consists of hundreds of intricate gears.", "Цагны механизм олон зуун нарийн төвөгтэй араанаас бүрддэг.", "Engineering"),
    ("meticulous", "adjective", "нарийн нягт, нямбай хянуур", "The historical research was conducted with meticulous attention to detail.", "Түүхийн судалгааг нарийн ширийн зүйлс бүрт нягт анхааран гүйцэтгэсэн.", "Research"),
    ("volatile", "adjective", "хувьсамтгай, тогтворгүй савалгаатай", "Financial markets remained highly volatile ahead of the central bank announcement.", "Төв банкны мэдэгдлийн өмнө санхүүгийн зах зээл маш тогтворгүй савалгаатай байв.", "Finance"),
    ("rigorous", "adjective", "хатуу чанд, нарийн чанд шалгууртай", "The pharmaceutical drug underwent rigorous clinical testing before approval.", "Эмийн бэлдмэлийг батлахаас өмнө эмнэлзүйн хатуу чанд туршилтад хамруулсан.", "Medicine"),
    ("conspicuous", "adjective", "нүдэнд тусахуйц тод, илэрхий", "Her conspicuous talent set her apart from other applicants.", "Түүний нүдэнд тусахуйц тод авьяас түүнийг бусад өрсөлдөгчдөөс онцгойруулсан.", "Talent"),
    ("subtle", "adjective", "нарийн, анзаарагдамгүй чамин", "There is a subtle distinction between confidence and arrogance.", "Өөртөө итгэх итгэл ба их зан хоёрын хооронд тун нарийн ялгаа бий.", "Psychology"),
    ("eloquent", "adjective", "уран цэцэн үгтэй, сэтгэл хөдөлгөм", "The civil rights activist gave an eloquent defense of liberty.", "Хүний эрхийн тэмцэгч эрх чөлөөг хамгаалж уран цэцэн үг хэллээ.", "Rhetoric"),
    ("superfluous", "adjective", "илүүц, хэрэгцээгүй илүүдэл", "Avoid superfluous technical jargon when writing for the general public.", "Олон нийтэд зориулан бичихдээ хэрэгцээгүй илүүц нэр томьёоноос зайлсхий.", "Writing"),
    ("feasible", "adjective", "хэрэгжих боломжтой, биелэгдэхүйц", "The engineers concluded that building a solar bridge was technically feasible.", "Инженерүүд нарны эрчим хүчээр ажилладаг гүүр барих нь техникийн хувьд хэрэгжих боломжтой гэж дүгнэв.", "Engineering"),
    ("tangible", "adjective", "бодитой мэдрэгдэх, бодит үр дүнтэй", "The anti-corruption drive produced tangible benefits for ordinary citizens.", "Авлигын эсрэг аян эгэл жирийн иргэдэд бодитой үр өгөөж өгөв.", "Society"),
    ("cumbersome", "adjective", "нүсэр, хүнд төвөгтэй, хэрэглэхэд бэрх", "The old bureaucratic paperwork was cumbersome and time-consuming.", "Хуучин хүнд суртлын бичиг цаасны ажил нь нүсэр төвөгтэй, их цаг авдаг байв.", "Administration"),
    ("vulnerable", "adjective", "эмзэг, өртөмтгий, хамгаалалтгүй", "Infants and elderly individuals are especially vulnerable to respiratory illnesses.", "Нярай хүүхдүүд болон өндөр настнууд амьсгалын замын өвчинд нэн эмзэг өртөмтгий байдаг.", "Health"),
    ("compatible", "adjective", "нийцтэй, зохицох чадвартай", "Ensure that the software updates are fully compatible with your operating system.", "Програмын шинэчлэлт таны үйлдлийн системтэй бүрэн нийцэж байгаа эсэхийг шалгаарай.", "Technology"),
    ("formidable", "adjective", "сүрдмээр хүчирхэг, даван туулахад бэрх", "The defending champions face a formidable challenge in the semi-finals.", "Өмнөх аварга баг хагас шигшээд сүрдмээр хүчирхэг сорилттой тулгарч байна.", "Sports"),
    ("unprecedented", "adjective", "урьд хожид байгаагүй, жишиггүй", "The global economy experienced an unprecedented shift toward remote work.", "Дэлхийн эдийн засаг алсын зайн ажил руу урьд хожид байгаагүй шилжилтийг туулав.", "Economics"),
    ("indispensable", "adjective", "орлуулшгүй, зайлшгүй шаардлагатай", "Reliable internet access is indispensable for modern academic research.", "Найдвартай интернет холболт орчин үеийн эрдэм шинжилгээний судалгаанд орлуулшгүй чухал.", "Education"),
    ("exhaustive", "adjective", "бүх талыг бүрэн шавхсан, нарийвчилсан", "The commission conducted an exhaustive investigation into the financial crash.", "Комисс санхүүгийн хямралын талаар бүх талыг шавхсан нарийвчилсан мөрдөн байцаалт явуулав.", "Finance"),
    ("inevitable", "adjective", "гарцаагүй, зайлшгүй тохиолдох", "Technological disruption is an inevitable aspect of industrial modernization.", "Технологийн тасалдал бол үйлдвэрлэлийн орчин үежилт дэх зайлшгүй үзэгдэл юм.", "Technology"),
    ("pervasive", "adjective", "нэвт шингэсэн, хаа сайгүй тархсан", "Digital advertising has a pervasive presence across all media platforms.", "Цахим сурталчилгаа бүх хэвлэл мэдээллийн талбарт нэвт шингэсэн байдаг.", "Media"),
    ("conversely", "adverb", "эсрэгээрээ, харин эсрэг талд", "Some sectors contracted; conversely, online retail expanded rapidly.", "Зарим салбар агшив; эсрэгээрээ онлайн худалдаа эрчимтэй тэлэв.", "Economics"),
    ("furthermore", "adverb", "түүнчлэн, цаашилбал", "The proposed plan reduces costs; furthermore, it shortens project delivery timelines.", "Санал болгож буй төлөвлөгөө зардлыг бууруулна; түүнчлэн төслийн хэрэгжих хугацааг богиносгоно.", "Business"),
    ("consequently", "adverb", "үр дүнд нь, улмаар", "He missed several review sessions; consequently, his exam grade declined.", "Тэр хэд хэдэн давтлага тасалсан; улмаар түүний шалгалтын дүн буурчээ.", "Education"),
    ("nevertheless", "adverb", "гэсэн хэдий ч, үл харгалзан", "The conditions were harsh; nevertheless, the expedition reached the summit.", "Нөхцөл байдал хүнд байсан; гэсэн хэдий ч экспедиц уулын оргилд хүрч чадав.", "Adventure"),
    ("henceforth", "adverb", "үүнээс хойш, цаашид", "Henceforth, all official communications must be documented digitally.", "Үүнээс хойш бүх албан харилцааг цахим хэлбэрээр баримтжуулах ёстой.", "Policy"),
    ("predominantly", "adverb", "голчлон, ихэнхдээ", "The island population relies predominantly on fishing and seasonal tourism.", "Арлын хүн ам голчлон загас агнуур болон улирлын чанартай аялал жуулчлалд түшиглэдэг.", "Geography"),
    ("ostensibly", "adverb", "өнгөн дээрээ, харагдах байдалдаа", "The meeting was ostensibly called to discuss budgets, but leadership changes were debated.", "Уулзалт өнгөн дээрээ төсөв хэлэлцэхээр зарлагдсан боловч удирдлагын өөрчлөлтийг хэлэлцжээ.", "Politics"),
    ("unequivocally", "adverb", "эргэлзээгүй тодорхой, эрс шулуунаар", "The scientific consensus unequivocally confirms that global temperatures are rising.", "Шинжлэх ухааны нэгдсэн байр суурь дэлхийн дулаарал өсөж байгааг эргэлзээгүй баталж байна.", "Science"),
    ("tentatively", "adverb", "туршилтаар, түр хугацаагаар урьдчилан", "The treaty signatories tentatively agreed to reconvene next autumn.", "Гэрээнд гарын үсэг зурагчид ирэх намар дахин чуулахаар түр тохиролцлоо.", "Diplomacy"),
    ("inadvertently", "adverb", "санамсаргүйгээр, анзааргагүйгээр", "The confidential report was inadvertently attached to a public email.", "Нууц тайлан нийтийн цахим шууданд санамсаргүйгээр хавсаргагдсан байв.", "Technology"),
    ("inherently", "adverb", "мөн чанараасаа, төрөлхийн байгалиасаа", "Deep-sea exploration is inherently dangerous due to extreme water pressure.", "Далайн гүний хайгуул нь усны хэт их даралтын улмаас төрөлхийн аюултай байдаг.", "Science"),
    ("fundamentally", "adverb", "үндсээрээ, язгуураасаа", "The internet fundamentally transformed how humans communicate and access knowledge.", "Интернет нь хүмүүс хэрхэн харилцаж, мэдлэг олж авахыг үндсээр нь өөрчилсөн.", "Technology"),
    ("paradoxically", "adverb", "эсрэг тэсрэгээр, хачирхалтай зөрчилтэйгээр", "Paradoxically, increased automation created more specialized technical employment.", "Хачирхалтай зөрчилтэйгээр, автоматжуулалт нэмэгдсэн нь илүү нарийн мэргэжлийн ажлын байр үүсгэв.", "Work")
]

print(f"EN_C1_EXTRA_BANK: {len(EN_C1_EXTRA_BANK)}")
