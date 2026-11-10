// scripts/countries_asia.js
module.exports = {
  KOR: {
    iso3: "KOR", iso2: "KR", geoName: "South Korea", commonName: "South Korea",
    officialName: "Republic of Korea", nativeName: "대한민국 (Daehan Minguk)", flag: "🇰🇷",
    capital: "Seoul", population: "52 Million", continent: "Asia",
    primaryLanguage: "Korean (Hanguk-eo)", languageFamily: "Koreanic",
    diversityLevel: "Distinct Regional Satoori (Dialects)",
    summary: "Korean is written in Hangul, widely heralded by linguists as the world's most scientifically engineered phonetic alphabet. It features an intricate system of speech levels and honorific verb conjugations.",
    languages: [
      { name: "Korean (Hanguk-eo)", nativeName: "한국어 (Hangugeo)", type: "National Official Language", percentage: "99.0%", speakers: "51M", family: "Koreanic", script: "Hangul (한글)", bcp47: "ko-KR", regions: "Nationwide", notes: "Invented by King Sejong the Great in 1443 so commoners could achieve instant literacy." },
      { name: "Jeju Language (Jejueo)", nativeName: "제주말 (Jejumal)", type: "UNESCO Critically Endangered", percentage: "0.2%", speakers: "10K", family: "Koreanic", script: "Hangul", bcp47: "ko-KR", regions: "Jeju Island", notes: "Linguistically distinct from mainland Korean; preserves Middle Korean vowels and archaic vocabulary." }
    ],
    accents: [
      { name: "Seoul Standard (Pyojun-eo)", region: "Seoul & Gyeonggi Province", description: "Polite, smooth, soft ending intonations ('-yo', '-ne-yo'), universal in K-dramas and K-pop.", sample: "안녕하세요, 만나서 반가워요! (Annyeonghaseyo, mannaseo bangawoyo!)" },
      { name: "Gyeongsang-do / Busan Satoori", region: "Busan, Daegu, Ulsan", description: "Dynamic tonal pitch accent, fast tempo, strong masculine inflection, blunt and passionate tone.", sample: "밥 묵었나? 맞나! 가시나야, 와 그라는데? (Bap mugeon-na? Matna! Wa geuraneunde?)" },
      { name: "Jeolla-do Satoori", region: "Gwangju & Jeolla Provinces", description: "Melodic sing-song cadence, expressive sentence endings ('-heom', '-tang-gae', '-ge-sse-yu').", sample: "오메! 징허게 반갑구마잉! (Ome! Jing-heoge bangap-gumang!)" }
    ],
    phrases: [
      { type: "Greeting", text: "안녕하세요! (Annyeonghaseyo!)", phonetic: "ahn-nyung-hah-seh-YOH", bcp47: "ko-KR" },
      { type: "Thank You", text: "감사합니다! (Gamsahamnida!)", phonetic: "gahm-sah-hahm-nee-DAH", bcp47: "ko-KR" },
      { type: "Goodbye", text: "안녕히 계세요! (Stay well) / 안녕히 가세요! (Go well)", phonetic: "ahn-nyung-hee geh-seh-YOH", bcp47: "ko-KR" },
      { type: "How are you?", text: "잘 지내셨어요? (Have you been well?)", phonetic: "jahl jee-neh-shuss-uh-YOH", bcp47: "ko-KR" }
    ],
    funFact: "Hangul was scientifically designed so that the shape of each consonant letter literally mirrors the position of the tongue and mouth when producing that sound (e.g. 'ㄱ' mimics the back of the tongue blocking the throat)!"
  },

  IDN: {
    iso3: "IDN", iso2: "ID", geoName: "Indonesia", commonName: "Indonesia",
    officialName: "Republic of Indonesia", nativeName: "Indonesia", flag: "🇮🇩",
    capital: "Jakarta / Nusantara", population: "277 Million", continent: "Asia",
    primaryLanguage: "Indonesian (Bahasa Indonesia)", languageFamily: "Austronesian",
    diversityLevel: "Extreme Linguistic Diversity (700+ Languages)",
    summary: "Indonesia's national motto 'Bhinneka Tunggal Ika' (Unity in Diversity) is embodied in its linguistic landscape: Bahasa Indonesia serves as the unifying national language, while over 700 local languages are spoken across 17,000 islands.",
    languages: [
      { name: "Indonesian (Bahasa Indonesia)", nativeName: "Bahasa Indonesia", type: "Sole National Official", percentage: "94.0%", speakers: "260M", family: "Austronesian (Malayo-Polynesian)", script: "Latin", bcp47: "id-ID", regions: "Nationwide", notes: "Standardized register of Malay chosen during the 1928 Youth Pledge to unite the nation neutrally." },
      { name: "Javanese (Basa Jawa)", nativeName: "Basa Jawa (ꦧꦱꦗꦮ)", type: "Major Indigenous Regional Language", percentage: "32.0%", speakers: "84M", family: "Austronesian", script: "Latin / Javanese Script (Hanacaraka)", bcp47: "jv-ID", regions: "Central and East Java, Yogyakarta", notes: "Largest regional language in Indonesia with strict hierarchical speech registers (Ngoko, Madya, Krama)." },
      { name: "Sundanese (Basa Sunda)", nativeName: "Basa Sunda (ᮘᮞ ᮞᮥᮔ᮪ᮓ)", type: "Major Regional Language", percentage: "15.0%", speakers: "40M", family: "Austronesian", script: "Latin / Sundanese Script", bcp47: "su-ID", regions: "West Java and Banten", notes: "Melodic language spoken by the Sundanese people, famous for politeness and storytelling." },
      { name: "Balinese & Minangkabau", nativeName: "Basan Bali / Baso Minang", type: "Recognized Regional Languages", percentage: "4.5%", speakers: "10M", family: "Austronesian", script: "Latin / Balinese Script", bcp47: "id-ID", regions: "Bali, West Sumatra", notes: "Minangkabau is spoken by the world's largest matrilineal society." }
    ],
    accents: [
      { name: "Bahasa Gaul / Jakarta Slang", region: "Jakarta Megacity", description: "Trendy urban slang incorporating Betawi words, suffixes '-banget', 'gue/lu', ubiquitous in youth media.", sample: "Gue lagi laper banget nih, yuk cari makan santai!" },
      { name: "Medanese (North Sumatra)", region: "Medan & North Sumatra", description: "Loud, staccato, direct intonation, blending Batak, Hokkien Chinese, and Malay phrasing.", sample: "Woi kelen! Main-main lah ke rumah, apa kabar?" },
      { name: "Javanese-Influenced Indonesian (Medok)", region: "Yogyakarta, Solo, Surabaya", description: "Heavy voiced stops (b, d, g emphasized), gentle elongated cadence, particles 'lho', 'to', 'ya'.", sample: "Nggih mas, monggo mampir dulu sekalian ngopi-ngopi." }
    ],
    phrases: [
      { type: "Greeting", text: "Halo! / Selamat pagi! (Good morning)", phonetic: "HAH-loh / seh-LAH-maht PAH-gee", bcp47: "id-ID" },
      { type: "Thank You", text: "Terima kasih banyak!", phonetic: "teh-REE-mah KAH-see BAHN-yahk", bcp47: "id-ID" },
      { type: "Goodbye", text: "Sampai jumpa lagi! / Selamat tinggal!", phonetic: "sahm-PYE JOOM-pah LAH-gee", bcp47: "id-ID" },
      { type: "How are you?", text: "Apa kabar? (How's the news?)", phonetic: "AH-pah KAH-bahr", bcp47: "id-ID" }
    ],
    funFact: "Indonesia has over 700 distinct living languages across its islands! Remarkably, virtually every Indonesian is bilingual—speaking their local ethnic language at home (like Javanese, Sundanese, or Balinese) and Indonesian with the rest of the nation."
  },

  PHL: {
    iso3: "PHL", iso2: "PH", geoName: "Philippines", commonName: "Philippines",
    officialName: "Republic of the Philippines", nativeName: "Pilipinas", flag: "🇵🇭",
    capital: "Manila", population: "115 Million", continent: "Asia",
    primaryLanguage: "Filipino (Tagalog) & English", languageFamily: "Austronesian",
    diversityLevel: "Multilingual Archipelago (180+ Languages)",
    summary: "The 1987 Philippine Constitution establishes Filipino (standardized Tagalog) and English as the official languages of communication and instruction, with 19 recognized regional auxiliary languages.",
    languages: [
      { name: "Filipino (Tagalog)", nativeName: "Wikang Filipino", type: "National Official Language", percentage: "82.0%", speakers: "90M", family: "Austronesian (Malayo-Polynesian)", script: "Latin (Baybayin heritage)", bcp47: "tl-PH", regions: "Metro Manila, Central and Southern Luzon, Nationwide", notes: "Rich in loanwords from Spanish (300+ years of rule) and English." },
      { name: "English (Philippine)", nativeName: "Philippine English", type: "Official Constitutional Language", percentage: "64.0%", speakers: "70M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-PH", regions: "Nationwide (Business, Government, Higher Ed)", notes: "One of the world's largest English-speaking populations; basis for thriving global BPO hub." },
      { name: "Cebuano (Bisaya)", nativeName: "Binisaya / Sinugboanon", type: "Major Regional Language", percentage: "24.0%", speakers: "27M", family: "Austronesian", script: "Latin", bcp47: "ceb-PH", regions: "Central Visayas (Cebu), parts of Mindanao", notes: "Second most spoken mother tongue in the Philippines, with vibrant literary tradition." },
      { name: "Ilocano & Hiligaynon", nativeName: "Ilokano / Ilonggo", type: "Major Regional Languages", percentage: "18.0%", speakers: "17M", family: "Austronesian", script: "Latin", bcp47: "tl-PH", regions: "Northern Luzon (Ilocos), Western Visayas (Iloilo, Bacolod)", notes: "Ilocano is the dominant trade language across northern Luzon." }
    ],
    accents: [
      { name: "Taglish (Manila Urban)", region: "Metro Manila", description: "Effortless code-switching between Tagalog and English, ubiquitous in media, tech, and everyday conversation.", sample: "Tara, let's grab coffee na! Super traffic kasi sa EDSA kanina." },
      { name: "Bisaya Accent", region: "Cebu, Davao, Bohol", description: "Crisp vowels, clear rhythmic syllable timing, interchange of 'e' and 'i' or 'o' and 'u', musical inflection.", sample: "Maayong adlaw! Mangaon ta ninyo, lami kaayo ang pagkaon!" },
      { name: "Ilonggo Accent", region: "Iloilo City & Panay Island", description: "Famous for its extremely gentle, sweet, affectionate, and soothing sing-song melody ('malambing').", sample: "Kamusta ka na toto? Palangga guid ka namon." }
    ],
    phrases: [
      { type: "Greeting (Tagalog)", text: "Kamusta po kayo! (Hello / How are you?)", phonetic: "kah-moos-TAH poh KAH-yoh", bcp47: "tl-PH" },
      { type: "Thank You (Tagalog)", text: "Maraming salamat po! (Thank you very much)", phonetic: "mah-RAH-ming sah-LAH-maht poh", bcp47: "tl-PH" },
      { type: "Goodbye (Tagalog)", text: "Paalam na po! (Goodbye!)", phonetic: "pah-AH-lahm nah poh", bcp47: "tl-PH" },
      { type: "Greeting (Cebuano)", text: "Maayong buntag! (Good morning!)", phonetic: "mah-AH-yong BOON-tahg", bcp47: "ceb-PH" }
    ],
    funFact: "Philippine 'Taglish' is so naturally integrated into modern life that major news broadcasts, presidential speeches, university lectures, and hit movies freely switch between English and Tagalog mid-sentence!"
  },

  VNM: {
    iso3: "VNM", iso2: "VN", geoName: "Vietnam", commonName: "Vietnam",
    officialName: "Socialist Republic of Vietnam", nativeName: "Việt Nam", flag: "🇻🇳",
    capital: "Hanoi", population: "98 Million", continent: "Asia",
    primaryLanguage: "Vietnamese (Tiếng Việt)", languageFamily: "Austroasiatic",
    diversityLevel: "Monosyllabic Tonal & 54 Ethnic Minorities",
    summary: "Vietnamese is an Austroasiatic language characterized by monosyllabic roots and 6 distinct vocal tones. It is written in 'Chữ Quốc ngữ', a Latin-based alphabet developed in the 17th century with diacritics denoting tone and vowel quality.",
    languages: [
      { name: "Vietnamese", nativeName: "Tiếng Việt", type: "Sole National Official", percentage: "85.3%", speakers: "84M", family: "Austroasiatic (Mon-Khmer / Vietic)", script: "Latin (Chữ Quốc ngữ)", bcp47: "vi-VN", regions: "Nationwide", notes: "Six-tone language that incorporated extensive Chinese vocabulary (Hán-Việt) over two millennia." },
      { name: "Tày & Thai", nativeName: "Tiếng Tày / Tiếng Thái", type: "Recognized Minority Languages", percentage: "3.5%", speakers: "3.5M", family: "Kra-Dai", script: "Latin / Tai Viet", bcp47: "vi-VN", regions: "Northern mountainous provinces", notes: "Spoken by highland ethnic groups with rich agricultural and weaving traditions." },
      { name: "Hmong & Khmer Krom", nativeName: "Hmoob / Tiếng Khmer", type: "Recognized Minority Languages", percentage: "2.8%", speakers: "2.7M", family: "Hmong-Mien / Austroasiatic", script: "Latin / Khmer Script", bcp47: "vi-VN", regions: "Northwest Highlands & Mekong Delta", notes: "Khmer Krom communities in the Mekong Delta maintain Khmer pagoda schools." }
    ],
    accents: [
      { name: "Northern (Hanoi)", region: "Hanoi & Red River Delta", description: "Sharp distinction between all 6 tones, clear glottal stops, 'r'/'d'/'gi' all merge into a smooth /z/ sound.", sample: "Xin chào bạn! Hôm nay trời đẹp quá, đi uống cà phê trứng nhé!" },
      { name: "Central (Huế / Quảng Nam)", region: "Huế & Da Nang", description: "Heavier, deeper intonation, tone merging (hỏi and ngã merge), distinct regional vocabulary.", sample: "Răng mà đẹp rứa? Đi mô đó bạn ơi?" },
      { name: "Southern (Saigon / Ho Chi Minh City)", region: "Ho Chi Minh City & Mekong Delta", description: "Relaxed cadence, 'v' pronounced as 'd/y', five tones (hỏi and ngã merge), open friendly rhythm.", sample: "Chào anh hai! Đi ăn cơm tấm sườn nướng ngon lắm nè!" }
    ],
    phrases: [
      { type: "Greeting", text: "Xin chào! (Hello!)", phonetic: "seen CHOW", bcp47: "vi-VN" },
      { type: "Thank You", text: "Cảm ơn bạn rất nhiều! (Thank you very much)", phonetic: "gahm UN bahn ruht NYEE-oo", bcp47: "vi-VN" },
      { type: "Goodbye", text: "Tạm biệt! / Hẹn gặp lại!", phonetic: "tahm bee-ET / hen gahp LYE", bcp47: "vi-VN" },
      { type: "How are you?", text: "Bạn khỏe không? (Are you healthy?)", phonetic: "bahn KHWEH khohng", bcp47: "vi-VN" }
    ],
    funFact: "A single syllable in Vietnamese like 'ba' can mean eight completely different things depending solely on tone: 'ba' (three/father), 'bà' (grandmother), 'bá' (earl), 'bả' (bait), 'bã' (residue), and 'bạ' (random)!"
  },

  SAU: {
    iso3: "SAU", iso2: "SA", geoName: "Saudi Arabia", commonName: "Saudi Arabia",
    officialName: "Kingdom of Saudi Arabia", nativeName: "المملكة العربية السعودية", flag: "🇸🇦",
    capital: "Riyadh", population: "36 Million", continent: "Asia",
    primaryLanguage: "Arabic (Modern Standard & Gulf / Hejazi)", languageFamily: "Afroasiatic (Semitic)",
    diversityLevel: "Diglossic Classical & Peninsular Arabic Dialects",
    summary: "Arabic is the official language of Saudi Arabia, the cradle of Islam and the sacred language of the Holy Quran. Daily conversation takes place in rich Peninsular Arabic dialects (Najdi, Hejazi, and Gulf).",
    languages: [
      { name: "Arabic (Modern Standard / Classical)", nativeName: "العربية الفصحى (Fus'ha)", type: "Official Constitutional Language", percentage: "100.0%", speakers: "36M", family: "Afroasiatic (Semitic)", script: "Arabic Alphabet", bcp47: "ar-SA", regions: "Nationwide (Media, Law, Religion, Liturgy)", notes: "The liturgical language of 1.9 billion Muslims worldwide and formal medium of governance." },
      { name: "Najdi Arabic", nativeName: "اللهجة النجدية", type: "Spoken Regional Variety", percentage: "38.0%", speakers: "14M", family: "Afroasiatic (Semitic)", script: "Arabic", bcp47: "ar-SA", regions: "Central Saudi Arabia (Riyadh, Qassim, Hail)", notes: "Conservative Bedouin-derived dialect preserving classical phonetic nuances." },
      { name: "Hejazi Arabic", nativeName: "اللهجة الحجازية", type: "Spoken Regional Variety", percentage: "35.0%", speakers: "12M", family: "Afroasiatic (Semitic)", script: "Arabic", bcp47: "ar-SA", regions: "Western Saudi Arabia (Jeddah, Mecca, Medina)", notes: "Cosmopolitan, relaxed urban dialect shaped by centuries of international pilgrimage." }
    ],
    accents: [
      { name: "Najdi (Riyadh)", region: "Riyadh & Central Plateau", description: "Affrication of 'k' to 'ts' (in feminine context), deep resonant throat consonants, traditional proverbs.", sample: "يا هلا والله ومسهلا! حياكم الله على القهوة والتمر." },
      { name: "Hejazi (Jeddah)", region: "Jeddah & Red Sea Coast", description: "Melodic sing-song cadence, use of 'kida' (like this), softening of glottal stops, warm hospitality.", sample: "أهلاً وسهلاً يا سيدي! كيف حالك إيش مسوي؟" }
    ],
    phrases: [
      { type: "Greeting", text: "السلام عليكم ! (Peace be upon you)", phonetic: "ahs-sah-LAHM ah-LAY-koom", bcp47: "ar-SA" },
      { type: "Response", text: "وعليكم السلام ورحمة الله (And upon you be peace)", phonetic: "wah ah-LAY-koom ahs-sah-LAHM", bcp47: "ar-SA" },
      { type: "Thank You", text: "شكراً جزيلاً ! (Thank you very much)", phonetic: "SHOOK-rahn jah-ZEE-lahn", bcp47: "ar-SA" },
      { type: "Welcome", text: "أهلاً وسهلاً بكم ! (Welcome!)", phonetic: "AH-lahn wah SAH-lahn bee-koom", bcp47: "ar-SA" }
    ],
    funFact: "Classical Arabic has more than 1,000 distinct words to describe a camel, its gait, temper, thirst, age, and beauty, reflecting the extraordinary precision of the language's desert poetry tradition!"
  },

  TUR: {
    iso3: "TUR", iso2: "TR", geoName: "Turkey", commonName: "Turkey",
    officialName: "Republic of Türkiye", nativeName: "Türkiye", flag: "🇹🇷",
    capital: "Ankara", population: "85 Million", continent: "Asia",
    primaryLanguage: "Turkish (Türkçe)", languageFamily: "Turkic",
    diversityLevel: "Agglutinative Harmony & Kurdish Recognized",
    summary: "Turkish is famous for its mathematical vowel harmony and agglutinative grammar, where long strings of suffixes attach to root words. In 1928, Mustafa Kemal Atatürk modernized the writing system from Arabic script to a phonetic Latin alphabet.",
    languages: [
      { name: "Turkish", nativeName: "Türkçe", type: "Sole State Official", percentage: "85.0%", speakers: "73M", family: "Turkic (Oghuz)", script: "Latin (Turkish Alphabet)", bcp47: "tr-TR", regions: "Nationwide", notes: "Standardized on the refined Istanbul dialect; characterized by strict vowel harmony." },
      { name: "Kurmanji Kurdish (Kurmancî)", nativeName: "Kurmancî (کورمانجی)", type: "Major Regional Minority Language", percentage: "13.0%", speakers: "11M", family: "Indo-European (Indo-Iranian)", script: "Latin / Arabic", bcp47: "ku-TR", regions: "Eastern and Southeastern Anatolia (Diyarbakır, Van)", notes: "Major Indo-European Iranian language spoken across eastern Turkey." },
      { name: "Arabic & Zaza", nativeName: "العربية / Zazaki", type: "Regional Minority Languages", percentage: "2.0%", speakers: "2.5M", family: "Afroasiatic / Indo-European", script: "Arabic / Latin", bcp47: "ar-TR", regions: "Hatay, Mardin, Tunceli", notes: "North Levantine Arabic spoken along southern border; Zazaki is spoken in eastern mountains." }
    ],
    accents: [
      { name: "Istanbul Turkish (Standard)", region: "Istanbul & Western Anatolia", description: "Melodic cadence, front vowels, standard for national broadcasting, theatre, and publishing.", sample: "Merhaba, nasılsınız? Size bir Türk kahvesi ikram edeyim." },
      { name: "Karadeniz (Black Sea)", region: "Trabzon, Rize, Artvin", description: "Rapid, percussive tempo, rising melodic pitch, unique maritime folklore and vocabulary.", sample: "Uy daa! Ne habersun hemşerim? Hayde gidelum balığa!" },
      { name: "Aegean / Ege", region: "Izmir, Muğla, Aydın", description: "Lengthening of vowels, relaxed sunny cadence, characteristic tag question 'gari'.", sample: "N'aber gari? Haydin kordonda çay içip deniz havası alalım." }
    ],
    phrases: [
      { type: "Greeting", text: "Merhaba! / Günaydın! (Hello / Good morning)", phonetic: "MAIR-hah-bah / goon-eye-DUHN", bcp47: "tr-TR" },
      { type: "Thank You", text: "Teşekkür ederim! / Çok sağ olun!", phonetic: "teh-sheh-KUR eh-deh-reem", bcp47: "tr-TR" },
      { type: "Goodbye", text: "Görüşmek üzere! / Hoşça kalın!", phonetic: "gur-oosh-MEK oo-zeh-reh / hohsh-CHAH kah-luhn", bcp47: "tr-TR" },
      { type: "How are you?", text: "Nasılsınız? / Ne haber?", phonetic: "NAH-suhl-suh-nuhz / neh hah-BAIR", bcp47: "tr-TR" }
    ],
    funFact: "Because Turkish is an agglutinative language, you can build an entire, grammatically complete story in a single 70-letter word: 'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine' ('As if you were of those whom we might not be able to easily make a creator of unsuccessful ones')!"
  }
};

