// scripts/countries_expanded.js
// Additional rich linguistic profiles with deep regional accents & multi-language breakdowns

module.exports = {
  IRN: {
    name: "Iran",
    officialName: "Islamic Republic of Iran",
    nativeName: "ایران (Īrān)",
    flag: "🇮🇷",
    capital: "Tehran",
    population: "89 Million",
    continent: "Asia",
    primaryLanguage: "Persian (Farsi)",
    languageFamily: "Indo-European (Indo-Iranian)",
    diversityLevel: "Multilingual Empire (Persian, Azeri, Kurdish, Gilaki, Arabic, Balochi)",
    summary: "Persian (Farsi) is the official language of Iran with over 2,500 years of recorded literature from Hafez, Rumi, and Ferdowsi. Iran is ethnically and linguistically pluralistic, with vibrant regional languages spoken by over 40% of its population.",
    languages: [
      { name: "Persian (Farsi)", nativeName: "فارسی (Fārsi)", type: "Sole National Official", percentage: "53.0%", speakers: "48M", family: "Indo-European (Indo-Iranian / Iranian)", script: "Perso-Arabic Alphabet", bcp47: "fa-IR", regions: "Nationwide (Central Plateau, Tehran, Isfahan, Shiraz)", notes: "Classical literary language of high poetry, philosophy, and miniature arts;SOV sentence structure." },
      { name: "Azerbaijani (Azeri)", nativeName: "آذربایجان دیلی (Azərbaycan dili)", type: "Major Regional Minority Language", percentage: "16.0%", speakers: "15M", family: "Turkic (Oghuz)", script: "Perso-Arabic", bcp47: "az-IR", regions: "Northwestern Iran (Tabriz, Urmia, Ardabil, Zanjan)", notes: "Mutually intelligible with Republic of Azerbaijan Turkish; large diaspora in Tehran." },
      { name: "Kurdish (Sorani & Kurmanji)", nativeName: "کوردی (Kurdî)", type: "Major Regional Minority Language", percentage: "10.0%", speakers: "9M", family: "Indo-European (Iranian)", script: "Perso-Arabic (Sorani)", bcp47: "ku-IR", regions: "Western Iran (Kordestan, Kermanshah, Ilam, West Azerbaijan)", notes: "Rich oral storytelling tradition with epic Dengbêj bards." },
      { name: "Gilaki & Mazandarani (Caspian)", nativeName: "گیلکی / مازندرانی", type: "Regional Indigenous Languages", percentage: "7.0%", speakers: "6M", family: "Indo-European (Northwestern Iranian)", script: "Perso-Arabic", bcp47: "fa-IR", regions: "Caspian Sea Coast (Gilan, Mazandaran)", notes: "Grammatically distinct from Persian; preserves archaic pre-Islamic linguistic structures." },
      { name: "Luri & Bakhtiari", nativeName: "لری / بختیاری", type: "Regional Minority Languages", percentage: "6.0%", speakers: "5M", family: "Indo-European (Southwestern Iranian)", script: "Perso-Arabic", bcp47: "fa-IR", regions: "Zagros Mountains (Lorestan, Chaharmahal, Khuzestan)", notes: "Traditional nomadic shepherd confederations with distinct epic musical poetry." },
      { name: "Arabic (Khuzestani)", nativeName: "العربية الأهوازية", type: "Regional Minority Language", percentage: "2.0%", speakers: "2M", family: "Afroasiatic (Semitic)", script: "Arabic", bcp47: "ar-IR", regions: "Southwestern Iran (Khuzestan / Ahvaz)", notes: "Mesopotamian-influenced Gulf Arabic spoken in Iran's oil-rich coastal province." },
      { name: "Balochi", nativeName: "بلوچی (Balōčī)", type: "Regional Minority Language", percentage: "2.0%", speakers: "1.8M", family: "Indo-European (Northwestern Iranian)", script: "Perso-Arabic", bcp47: "fa-IR", regions: "Sistan and Baluchestan (Southeastern Desert)", notes: "Ancient Iranian language preserving consonantal sounds lost in modern Persian." }
    ],
    accents: [
      { name: "Tehrani Standard", region: "Tehran & Central Media", description: "Smooth cadence, transformation of 'ān' into 'ūn' ('Tehrūn', 'nūn' for bread), polite Ta'arof honorifics.", sample: "سلام، حالتون چطوره؟ خیلی مخلصیم، بفرمایید در خدمت باشیم!" },
      { name: "Isfahani", region: "Isfahan", description: "Melodic sing-song pitch curve rising at phrase end, lengthening of penultimate vowels, witty mercantile banter.", sample: "سلام دادا! شوما خوبی؟ چیطوری؟ دم شما گرم!" },
      { name: "Shirazi", region: "Shiraz & Fars", description: "Relaxed, slow, gentle tempo, adding the affectionate suffix '-oo' to nouns (ketaboo, pesaroo).", sample: "حالو ولش بکن! بیا بشین یه چای بهارنارنج بخوریم صفا کنیم." },
      { name: "Abadani / Southern", region: "Abadan, Bushehr, Persian Gulf Coast", description: "Warm, energetic, incorporating Arabic loanwords and coastal sea chanties (Ney-Anban rhythm).", sample: "کاکا جون ولک! حالت چطوره؟ بریم لب شط سمبوسه بزنیم!" }
    ],
    phrases: [
      { type: "Greeting", text: "درود ! / سلام ! (Dorood! / Salām!)", phonetic: "doh-ROOD / sah-LAHM", bcp47: "fa-IR" },
      { type: "Thank You", text: "خیلی ممنون ! / سپاسگزارم ! (Kheyli mamnoon / Sepāsgozāram)", phonetic: "KHEY-lee mahm-NOON / seh-pahs-goh-ZAH-rahm", bcp47: "fa-IR" },
      { type: "Goodbye", text: "خداحافظ ! / به امید دیدار ! (Khodāhāfez / Be omide didār)", phonetic: "khoh-dah-HAH-fez / beh oh-MEE-deh dee-DAHR", bcp47: "fa-IR" },
      { type: "How are you?", text: "حالتون چطوره؟ / خوبی؟ (Hāletoon chetore?)", phonetic: "hah-leh-TOON cheh-TOH-reh", bcp47: "fa-IR" }
    ],
    funFact: "Persian culture has an elaborate system of social politeness called 'Ta'arof', where it is customary to politely refuse an offer (such as food or a cab fare) up to three times before accepting it!"
  },

  NLD: {
    name: "Netherlands",
    officialName: "Kingdom of the Netherlands",
    nativeName: "Nederland",
    flag: "🇳🇱",
    capital: "Amsterdam",
    population: "18 Million",
    continent: "Europe",
    primaryLanguage: "Dutch (Nederlands)",
    languageFamily: "Indo-European (Germanic)",
    diversityLevel: "Multilingual Proficiency & West Frisian Co-official",
    summary: "Dutch is the official language of the Netherlands, with West Frisian co-official in the province of Friesland. The Dutch consistently rank as the world's most proficient non-native English speakers.",
    languages: [
      { name: "Dutch", nativeName: "Nederlands", type: "Sole State Official", percentage: "95.0%", speakers: "17M", family: "Indo-European (Germanic / Low Franconian)", script: "Latin", bcp47: "nl-NL", regions: "Nationwide", notes: "Linguistic sibling to English and German; mother tongue of Afrikaans." },
      { name: "West Frisian (Frysk)", nativeName: "Frysk", type: "Co-official Provincial (Friesland)", percentage: "2.5%", speakers: "450K", family: "Indo-European (Germanic / Anglo-Frisian)", script: "Latin", bcp47: "fy-NL", regions: "Province of Friesland (Fryslân)", notes: "The closest living genetic relative to the English language on continental Europe." },
      { name: "Limburgish", nativeName: "Limburgs", type: "Recognized Regional Language", percentage: "4.5%", speakers: "800K", family: "Indo-European (Germanic)", script: "Latin", bcp47: "nl-NL", regions: "Province of Limburg (Maastricht)", notes: "One of the rare tonal languages in Europe, using pitch to distinguish noun plurals." },
      { name: "Dutch Low Saxon", nativeName: "Nedersaksisch", type: "Recognized Regional Language", percentage: "6.0%", speakers: "1.0M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "nds-NL", regions: "Groningen, Drenthe, Overijssel", notes: "Low German dialect continuum stretching into northern Germany." }
    ],
    accents: [
      { name: "Randstad / Hollandic", region: "Amsterdam, Rotterdam, Utrecht, The Hague", description: "Guttural 'hard G' (/x/), rolling or uvular 'r', fast-paced direct communication style.", sample: "Nou, gezellig toch! Zullen we een bakkie koffie doen?" },
      { name: "Brabants & Limburgs (Southern Dutch)", region: "North Brabant & Limburg", description: "Warm 'soft G' (/ɣ/), melodic sing-song intonation, famous for the festive greeting 'Houdoe'.", sample: "Houdoe en bedankt hè! Kei leuk dat je er bent." },
      { name: "Amsterdams", region: "Amsterdam Jordaan", description: "Flattened vowels ('a' sounds like 'aa'), rich historic Yiddish-derived slang (mokum, mazzel, gabber).", sample: "Hé ouwe gabber! Krijg nou wat, lekker weertje pik!" },
      { name: "Rotterdams", region: "Rotterdam Port", description: "Straightforward, unpretentious, working-class dock cadence, 'natte T' and dry humor.", sample: "Niet lullen maar poetsen! Loop naar de pomp joh." }
    ],
    phrases: [
      { type: "Greeting", text: "Hallo! / Goedemorgen! / Hoi!", phonetic: "HAH-loh / KHOO-duh-MOR-khun / HOY", bcp47: "nl-NL" },
      { type: "Thank You", text: "Dankjewel! / Hartelijk dank!", phonetic: "DAHNK-yuh-vel", bcp47: "nl-NL" },
      { type: "Goodbye", text: "Tot ziens! / Doei!", phonetic: "toht ZEENS / DOO-ee", bcp47: "nl-NL" },
      { type: "How are you?", text: "Hoe gaat het? / Alles goed?", phonetic: "hoo GAHT ut / AH-les goot", bcp47: "nl-NL" }
    ],
    funFact: "Old Frisian and Old English were virtually the same language 1,400 years ago! Even today, the famous rhyme holds true: 'Brea, bûter en griene tsiis is goed Ingelsk en goed Frysk' ('Bread, butter and green cheese is good English and good Friese')."
  },

  THA: {
    name: "Thailand",
    officialName: "Kingdom of Thailand",
    nativeName: "ประเทศไทย (Prathet Thai)",
    flag: "🇹🇭",
    capital: "Bangkok",
    population: "71 Million",
    continent: "Asia",
    primaryLanguage: "Thai (Central Thai)",
    languageFamily: "Kra-Dai (Tai-Kadai)",
    subFamily: "Tai",
    diversityLevel: "5-Tone Analytic & Distinct Regional Varieties (Isan, Lanna)",
    summary: "Central Thai is the official language of Thailand, characterized by 5 vocal tones (mid, low, falling, high, rising), an analytic grammar without verb conjugations, and polite gender particles (khrap for men, kha for women).",
    languages: [
      { name: "Central Thai (Siamese)", nativeName: "ภาษาไทย (Phasa Thai)", type: "Sole National Official", percentage: "40.0%", speakers: "30M", family: "Kra-Dai (Tai-Kadai)", script: "Thai Script (44 consonants, 28 vowels)", bcp47: "th-TH", regions: "Bangkok & Central Plains", notes: "Standardized on Bangkok royal court; tone diacritics determine word meaning." },
      { name: "Isan (Northeastern Thai / Lao)", nativeName: "ภาษาอีสาน", type: "Major Regional Variety", percentage: "28.0%", speakers: "20M", family: "Kra-Dai (Tai-Kadai)", script: "Thai Script", bcp47: "th-TH", regions: "Northeastern Thailand (Isan Plateau)", notes: "Closely related to standard Lao; has 6 tones and famous Mor Lam musical tradition." },
      { name: "Northern Thai (Kam Mueang / Lanna)", nativeName: "คำเมือง (Kam Mueang)", type: "Major Regional Variety", percentage: "10.0%", speakers: "7M", family: "Kra-Dai (Tai-Kadai)", script: "Tai Tham / Thai Script", bcp47: "th-TH", regions: "Northern Thailand (Chiang Mai, Chiang Rai)", notes: "Historical language of the Lanna Kingdom; gentle and melodic cadence." },
      { name: "Southern Thai (Pak Tai)", nativeName: "ภาษาไทยถิ่นใต้ (Pak Tai)", type: "Major Regional Variety", percentage: "7.0%", speakers: "5M", family: "Kra-Dai (Tai-Kadai)", script: "Thai Script", bcp47: "th-TH", regions: "Southern Thailand (Phuket, Songkhla, Surat Thani)", notes: "Known for rapid, truncated speech and up to seven distinct tones." }
    ],
    accents: [
      { name: "Bangkok Standard", region: "Bangkok & Central Thailand", description: "Polite, melodic, standard 5 tones, formal use of polite particles 'khrap' (ครับ) and 'kha' (ค่ะ).", sample: "สวัสดีครับ ยินดีที่ได้รู้จักครับ สบายดีไหมครับ? (Sawatdee khrap...)" },
      { name: "Isan / Northeastern", region: "Khon Kaen, Udon Thani, Ubon", description: "Slower cadence, Lao-derived vocabulary (sep lai der = delicious!), cheerful warmth.", sample: "เป็นจั่งได๋แหน่ สบายดีบ่? แซ่บหลายเด้อ!" },
      { name: "Northern / Chiang Mai", region: "Chiang Mai & Northern Valleys", description: "Gentle, drawn-out syllable endings ('jao' polite particle), sweet and courteous melody.", sample: "สวัสดีเจ้า ยินดีต้อนรับสู่เจียงใหม่เจ้า (Sawatdee jao...)" },
      { name: "Southern (Pak Tai)", region: "Nakhon Si Thammarat, Hat Yai", description: "Lightning-fast tempo, contracted syllables, sharp tonal transitions.", sample: "ไปไหนมานิ? กินข้าวแล้วหม้าย?" }
    ],
    phrases: [
      { type: "Greeting (Male)", text: "สวัสดีครับ (Sawatdee khrap)", phonetic: "sah-waht-DEE khrahp", bcp47: "th-TH" },
      { type: "Greeting (Female)", text: "สวัสดีค่ะ (Sawatdee kha)", phonetic: "sah-waht-DEE khah", bcp47: "th-TH" },
      { type: "Thank You", text: "ขอบคุณมากครับ/ค่ะ (Khop khun mak)", phonetic: "khohp khoon MAHK", bcp47: "th-TH" },
      { type: "How are you?", text: "สบายดีไหมครับ/ค่ะ? (Sabai dee mai?)", phonetic: "sah-BYE dee MYE?", bcp47: "th-TH" }
    ],
    funFact: "Bangkok's official ceremonial Thai name is the longest city name in the world (168 letters): Krungthepmahanakhon Amonrattanakosin Mahintharayutthaya Mahadilokphop Noppharatratchathaniburirom...!"
  },

  PAK: {
    name: "Pakistan",
    officialName: "Islamic Republic of Pakistan",
    nativeName: "پاکستان (Pākistān)",
    flag: "🇵🇰",
    capital: "Islamabad",
    population: "240 Million",
    continent: "Asia",
    primaryLanguage: "Urdu & English",
    languageFamily: "Indo-European (Indo-Iranian)",
    diversityLevel: "Multilingual Federation (Punjabi, Pashto, Sindhi, Balochi, Saraiki)",
    summary: "Urdu is the national lingua franca and English is the official language. Although Urdu is the primary language of education and national identity, Punjabi, Pashto, Sindhi, and Saraiki are spoken natively by the majority of provincial populations.",
    languages: [
      { name: "Urdu", nativeName: "اردو", type: "National Official Language", percentage: "8.0%", speakers: "20M native / 180M L2", family: "Indo-European (Indo-Aryan)", script: "Perso-Arabic (Nastaliq script)", bcp47: "ur-PK", regions: "Nationwide (Federal capital, Media, Literature)", notes: "Renowned worldwide for its courtly elegance, ghazal poetry, and Nastaliq calligraphy." },
      { name: "Punjabi", nativeName: "پنجابی (Panjābī)", type: "Provincial Language (Largest Mother Tongue)", percentage: "39.0%", speakers: "90M", family: "Indo-European (Indo-Aryan)", script: "Shahmukhi (Arabic) script", bcp47: "pa-PK", regions: "Punjab Province (Lahore, Faisalabad, Rawalpindi)", notes: "Largest native language in Pakistan, celebrated in the Sufi poetry of Bulleh Shah and Waris Shah." },
      { name: "Pashto", nativeName: "پښتو (Pax̌tō)", type: "Provincial Language", percentage: "18.0%", speakers: "42M", family: "Indo-European (Eastern Iranian)", script: "Pashto Alphabet", bcp47: "ps-PK", regions: "Khyber Pakhtunkhwa & northern Balochistan", notes: "Language of the Pashtun code of honor (Pashtunwali), with rich tribal oral verse (Tappa)." },
      { name: "Sindhi", nativeName: "سنڌي (Sindhī)", type: "Official Provincial Language (Sindh)", percentage: "15.0%", speakers: "35M", family: "Indo-European (Indo-Aryan)", script: "Extended Perso-Arabic (52 letters)", bcp47: "sd-PK", regions: "Sindh Province (Karachi, Hyderabad, Larkana)", notes: "One of South Asia's oldest literary languages, with ancient roots in the Indus Valley." },
      { name: "Saraiki & Balochi", nativeName: "سرائیکی / بلوچی", type: "Major Regional Languages", percentage: "15.0%", speakers: "30M", family: "Indo-European", script: "Shahmukhi / Perso-Arabic", bcp47: "ur-PK", regions: "Southern Punjab & Balochistan", notes: "Saraiki is famous for sweet Sufi poetry (Kafi); Balochi is an ancient Iranian tongue." }
    ],
    accents: [
      { name: "Lahori Punjabi-Urdu", region: "Lahore & Central Punjab", description: "Rich, hearty, energetic cadence, vibrant food and cultural banter, musical rising tones.", sample: "Oye kithe chale o janab? Chalo aao pehle naan-chana khande aan!" },
      { name: "Karachi Urdu (Muhajir)", region: "Karachi Megacity", description: "Refined Lucknow/Delhi classical syntax, crisp diction, rapid cosmopolitan urban slang.", sample: "Aray bhai kya baat kar rahay ho! Bilkul first class scene hai." },
      { name: "Peshawari / Pashto-Inflected", region: "Peshawar & Khyber", description: "Strong resonant retroflex consonants, polite hospitality terms (Khaistah, Der Meherbani).", sample: "Pakhair raghlay! Tea is ready, you are our honored guest." },
      { name: "Sindhi-Urdu", region: "Hyderabad & Rural Sindh", description: "Gentle implosive consonants (ɓ, ɗ, ʄ, ɠ), melodic pace, deep Sufi reverence (Sain).", sample: "Ada khush ahyo? Bhali kare aaya, Allah reham kare!" }
    ],
    phrases: [
      { type: "Greeting (Urdu)", text: "السلام علیکم ! / آداب ! (As-salamu alaykum / Adaab)", phonetic: "ahs-sah-LAHM-oo ah-LAY-koom / ah-DAHB", bcp47: "ur-PK" },
      { type: "Thank You (Urdu)", text: "بہت بہت شکریہ ! (Bohat bohat shukriya)", phonetic: "boh-huht boh-huht shook-ree-YAH", bcp47: "ur-PK" },
      { type: "Goodbye (Urdu)", text: "خدا حافظ ! / اللہ حافظ ! (Khuda hafiz / Allah hafiz)", phonetic: "khoh-dah HAH-fiz", bcp47: "ur-PK" },
      { type: "How are you? (Urdu)", text: "آپ کا کیا حال ہے؟ (Aap ka kya haal hai?)", phonetic: "ahp kah kyah HAHL hy", bcp47: "ur-PK" }
    ],
    funFact: "Urdu is written in the graceful 'Nastaliq' calligraphic script. Because of its complex sloping letters, Urdu newspapers were written completely by hand by master calligraphers (Katibs) all the way into the late 1990s before digital fonts were developed!"
  },

  MAR: {
    name: "Morocco",
    officialName: "Kingdom of Morocco",
    nativeName: "المغرب (Al-Maghrib) / ⵍⵎⵖⵔⵉⴱ",
    flag: "🇲🇦",
    capital: "Rabat",
    population: "37 Million",
    continent: "Africa",
    primaryLanguage: "Arabic (Darija) & Berber (Tamazight)",
    languageFamily: "Afroasiatic",
    diversityLevel: "Constitutional Bilingual (Arabic & Tamazight) + French",
    summary: "Morocco constitutionally recognizes Arabic and Tamazight (Berber) as official languages. Moroccan Darija is an exceptionally unique dialect blending Arabic roots with Amazigh grammar and French and Spanish loanwords.",
    languages: [
      { name: "Moroccan Arabic (Darija)", nativeName: "الدارجة المغربية (Darija)", type: "National De Facto Lingua Franca", percentage: "90.0%", speakers: "33M", family: "Afroasiatic (Semitic)", script: "Arabic / Latin (Arabizi)", bcp47: "ar-MA", regions: "Nationwide", notes: "Drops short unstressed vowels creating dramatic consonant clusters (e.g. k-t-b-t for 'I wrote')." },
      { name: "Tamazight (Berber)", nativeName: "ⵜⴰⵎⴰⵣⵉⵖⵜ (Tamazight)", type: "Official Constitutional State Language", percentage: "28.0%", speakers: "10M", family: "Afroasiatic (Berber / Amazigh)", script: "Tifinagh Script (ⵜⵉⴼⵉⵏⴰⵖ) / Latin", bcp47: "zgh-MA", regions: "Atlas Mountains, Souss Valley, Rif Mountains", notes: "Written in the ancient geometric Tifinagh script revived and standardized by IRCAM." },
      { name: "French", nativeName: "Français", type: "Prestige Working Language", percentage: "35.0%", speakers: "13M", family: "Indo-European (Romance)", script: "Latin", bcp47: "fr-MA", regions: "Nationwide (Higher Education, Business, Diplomacy)", notes: "Widely used in commerce, science, and governmental administration." },
      { name: "Spanish", nativeName: "Español", type: "Regional Historical Language", percentage: "10.0%", speakers: "3.5M", family: "Indo-European (Romance)", script: "Latin", bcp47: "es-MA", regions: "Northern Morocco (Tangier, Tetouan) & Western Sahara", notes: "Historically significant due to the former Spanish protectorate in northern Morocco." }
    ],
    accents: [
      { name: "Casablanca & Rabat (Central Darija)", region: "Atlantic Coastal Metros", description: "Fast tempo, heavy consonant clustering, integration of French business and youth vocabulary.", sample: "Salam khoya, labas aalik? Kulshi mezyan? Nshoufoukoum aashiya!" },
      { name: "Chamali (Northern / Tangier & Tetouan)", region: "Tangier, Tetouan, Chefchaouen", description: "Gentle sing-song cadence, Spanish loanwords (rueda, simana), preservation of classical vowels.", sample: "Hala ya akhi! Kif ntiyna? Kulshi bikhir f Tangia?" },
      { name: "Marrakshi", region: "Marrakech & Haouz", description: "Famous for humor, warmth, quick wit, and colorful proverbs heard in Jemaa el-Fnaa square.", sample: "Yallah a sidi, merhba bik f Kech! Aji nshrbo atay b neenaa." }
    ],
    phrases: [
      { type: "Greeting (Darija)", text: "السلام عليكم ! / لا بأس ؟ (Salam / Labas?)", phonetic: "sah-LAHM / lah-BAHS", bcp47: "ar-MA" },
      { type: "Thank You (Darija)", text: "شكراً بزاف ! (Shukran bezzef!)", phonetic: "SHOOK-rahn behz-ZEF", bcp47: "ar-MA" },
      { type: "Greeting (Tamazight)", text: "Azul! (Greetings / Peace)", phonetic: "ah-ZOOL", bcp47: "zgh-MA" },
      { type: "Everything is Good", text: "كلشي مزيان ! (Kulshi mezyan!)", phonetic: "kool-shee mez-YAHN", bcp47: "ar-MA" }
    ],
    funFact: "The indigenous Amazigh writing system—Tifinagh (ⵜⵉⴼⵉⵏⴰⵖ)—dates back over 2,500 years and is composed of elegant geometric shapes (circles, squares, crosses), making it one of the oldest and most distinct scripts on Earth!"
  }
};

