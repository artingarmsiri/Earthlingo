// scripts/countries_africa.js
module.exports = {
  EGY: {
    iso3: "EGY", iso2: "EG", geoName: "Egypt", commonName: "Egypt",
    officialName: "Arab Republic of Egypt", nativeName: "مصر (Miṣr)", flag: "🇪🇬",
    capital: "Cairo", population: "109 Million", continent: "Africa",
    primaryLanguage: "Arabic (Egyptian / Masri)", languageFamily: "Afroasiatic (Semitic)",
    diversityLevel: "Culturally Dominant Arabic Dialect",
    summary: "Modern Standard Arabic is the official language of Egypt, while Egyptian Arabic (Masri) is the most widely understood spoken Arabic dialect in the entire world, popularized across the Middle East through Cairo's cinema and music industries.",
    languages: [
      { name: "Arabic (Egyptian / Masri)", nativeName: "اللغة المصرية العامية (Masri)", type: "National De Facto", percentage: "93.0%", speakers: "100M", family: "Afroasiatic (Semitic)", script: "Arabic Alphabet", bcp47: "ar-EG", regions: "Nationwide", notes: "Pronounces classical 'jim' (ج) as a hard 'g' /g/, and glottalizes 'qaf' (ق) into a hamza 'ʔ'." },
      { name: "Modern Standard Arabic (Fus'ha)", nativeName: "العربية الفصحى", type: "Sole Constitutional Official", percentage: "100.0%", speakers: "105M", family: "Afroasiatic (Semitic)", script: "Arabic", bcp47: "ar-EG", regions: "Nationwide (Law, Government, Media)", notes: "Official language of the state and Quranic liturgical study." },
      { name: "Sa'idi Arabic", nativeName: "اللهجة الصعيدية", type: "Regional Spoken Dialect", percentage: "18.0%", speakers: "19M", family: "Afroasiatic (Semitic)", script: "Arabic", bcp47: "ar-EG", regions: "Upper Egypt (Luxor, Aswan, Asyut)", notes: "Traditional dialect retaining conservative phonetic and lexical traits." },
      { name: "Nubian & Siwi Berber", nativeName: "Nobiin / Siwi", type: "Indigenous Minority Languages", percentage: "0.5%", speakers: "500K", family: "Nilo-Saharan / Afroasiatic (Berber)", script: "Old Nubian / Arabic", bcp47: "ar-EG", regions: "Aswan (Nile Valley) & Siwa Oasis", notes: "Siwi is Egypt's only indigenous Berber language, spoken in the western desert oasis of Siwa." }
    ],
    accents: [
      { name: "Cairene (Cairo Masri)", region: "Cairo & Giza", description: "Soft, humorous, rapid, hard 'g' for jim, famous across the Arab world as the Hollywood of Arabic media.", sample: "إزيك يا باشا؟ عامل إيه؟ منور والله يا غالي!" },
      { name: "Alexandrian (Iskandarani)", region: "Alexandria & Mediterranean Coast", description: "Sing-song cadence, distinctive local terms ('aywah', 'kebdah', 'falafel' called 'ta'meya').", sample: "يا جدع، إيه الحلاوة دي؟ يلا نتمشى على الكورنيش ناكل أيس كريم." },
      { name: "Sa'idi (Upper Egypt)", region: "Upper Egypt (Nile Valley)", description: "Pronunciation of 'qaf' as a hard 'g', conservative grammar, proud tribal poetic heritage.", sample: "يا مرحب بيك يا ولد عمي! نورت الصعيد كله." }
    ],
    phrases: [
      { type: "Greeting", text: "أهلاً وسهلاً ! / صباح الخير ! (Welcome / Good morning)", phonetic: "AH-lahn wah SAH-lahn / sah-BAHkh el-KHEER", bcp47: "ar-EG" },
      { type: "Thank You", text: "شكراً جزيلاً يا فندم ! (Thank you very much)", phonetic: "SHOOK-rahn gah-ZEE-lahn yah FAHN-dem", bcp47: "ar-EG" },
      { type: "How are you?", text: "إزيك؟ عامل إيه؟ (How are you doing?)", phonetic: "ez-ZAY-yak? AH-mel AY?", bcp47: "ar-EG" },
      { type: "No Problem / Relax", text: "مفيش مشكلة / معلش (No problem / Never mind)", phonetic: "mah-FEESH mosh-KEH-lah / mah-LESH", bcp47: "ar-EG" }
    ],
    funFact: "Because Egyptian film, television, and pop music dominated the 20th-century Arab world, almost every Arabic speaker from Morocco to Iraq can instantly understand and speak the Cairo accent!"
  },

  ETH: {
    iso3: "ETH", iso2: "ET", geoName: "Ethiopia", commonName: "Ethiopia",
    officialName: "Federal Democratic Republic of Ethiopia", nativeName: "ኢትዮጵያ (Ityop'iya)", flag: "🇪🇹",
    capital: "Addis Ababa", population: "123 Million", continent: "Africa",
    primaryLanguage: "Oromo, Amharic & Tigrinya", languageFamily: "Afroasiatic (Semitic / Cushitic)",
    diversityLevel: "Multilingual Constitutional (80+ Indigenous Languages)",
    summary: "Ethiopia is one of the only countries in Africa with its own ancient indigenous writing system: the Ge'ez script (Fidel). Ethiopia recognizes 5 working federal languages: Afaan Oromoo, Amharic, Somali, Tigrinya, and Afar.",
    languages: [
      { name: "Afaan Oromoo (Oromo)", nativeName: "Afaan Oromoo", type: "Federal Working Language", percentage: "34.0%", speakers: "40M", family: "Afroasiatic (Cushitic)", script: "Qubee (Latin)", bcp47: "om-ET", regions: "Oromia Region & Nationwide", notes: "Largest mother tongue in Ethiopia, written in the official Qubee Latin alphabet since 1991." },
      { name: "Amharic (Amarinya)", nativeName: "አማርኛ (Amarəñña)", type: "Federal Working Language", percentage: "29.0%", speakers: "35M", family: "Afroasiatic (Semitic / Ethiosemitic)", script: "Ge'ez Script (ፊደል Fidel)", bcp47: "am-ET", regions: "Amhara Region, Addis Ababa, Nationwide", notes: "The historical imperial court language; written in the ancient Ge'ez abugida script." },
      { name: "Somali (Af-Soomaali)", nativeName: "Af-Soomaali", type: "Federal Working Language", percentage: "6.2%", speakers: "7.5M", family: "Afroasiatic (Cushitic)", script: "Latin / Wadaad", bcp47: "so-ET", regions: "Somali Region (Ogaden)", notes: "Major language of the eastern Horn of Africa, rich in oral pastoral poetry." },
      { name: "Tigrinya", nativeName: "ትግርኛ (Təgrəñña)", type: "Federal Working Language", percentage: "5.8%", speakers: "7.0M", family: "Afroasiatic (Semitic)", script: "Ge'ez Script", bcp47: "ti-ET", regions: "Tigray Region", notes: "Direct sister language to ancient liturgical Ge'ez, also official in Eritrea." }
    ],
    accents: [
      { name: "Shewa / Addis Ababa Amharic", region: "Addis Ababa & Central Plateau", description: "Standard modern spoken Amharic, melodic intonation, glottalized ejective consonants (t', k', p').", sample: "ጤና ይስጥልኝ! እንዴት ነዎት? ደህና ነኝ አመሰግናለሁ። (T'ena yist'illign! Endet newot?)" },
      { name: "Gondar Amharic", region: "Gondar & Northern Amhara", description: "Deeply traditional cadence, archaic vocabulary, classical royal historical idioms.", sample: "እንኳን ደህና መጣችሁ ወደ ታሪካዊቷ ጎንደር!" }
    ],
    phrases: [
      { type: "Greeting (Amharic)", text: "ሰላም ! / ጤና ይስጥልኝ ! (Peace! / May Health be Given!)", phonetic: "sah-LAHM / t'ay-nah yiss-t'il-lyign", bcp47: "am-ET" },
      { type: "Thank You (Amharic)", text: "በጣም አመሰግናለሁ ! (Thank you very much!)", phonetic: "beh-TAHM ah-mah-sehg-nah-leh-hoo", bcp47: "am-ET" },
      { type: "Greeting (Oromo)", text: "Akkam! / Fayyaa dhaa? (Hello / How is your health?)", phonetic: "AHK-kahm / fye-YAH dhah", bcp47: "om-ET" },
      { type: "Goodbye (Amharic)", text: "ደህና ሁኑ ! (Stay well / Goodbye)", phonetic: "deh-NAH hoo-NOO", bcp47: "am-ET" }
    ],
    funFact: "Ethiopia's Ge'ez script (Fidel) is the only indigenous African writing system still in continuous daily use for millennia! Each character represents a combined consonant and vowel (an abugida)."
  },

  KEN: {
    iso3: "KEN", iso2: "KE", geoName: "Kenya", commonName: "Kenya",
    officialName: "Republic of Kenya", nativeName: "Kenya", flag: "🇰🇪",
    capital: "Nairobi", population: "55 Million", continent: "Africa",
    primaryLanguage: "Swahili (Kiswahili) & English", languageFamily: "Niger-Congo (Bantu)",
    diversityLevel: "Constitutional Bilingual (Swahili & English)",
    summary: "Under Kenya's 2010 Constitution, Swahili is the national and official language, and English is an official language. Sheng—a dynamic Swahili-English street slang—dominates Nairobi youth culture.",
    languages: [
      { name: "Swahili (Kiswahili)", nativeName: "Kiswahili", type: "National & Official Language", percentage: "85.0%", speakers: "45M", family: "Niger-Congo (Bantu / Sabaki)", script: "Latin", bcp47: "sw-KE", regions: "Nationwide & East African Community", notes: "The most widely spoken Bantu language in the world; official language of the African Union." },
      { name: "English (Kenyan)", nativeName: "Kenyan English", type: "Official Language", percentage: "50.0%", speakers: "27M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-KE", regions: "Nationwide (Judiciary, Education, Media)", notes: "Features British roots blended with local vocabulary ('chapo', 'matatu', 'mwananchi')." },
      { name: "Kikuyu (Gikuyu)", nativeName: "Gĩkũyũ", type: "Major Indigenous Language", percentage: "17.0%", speakers: "9M", family: "Niger-Congo (Bantu)", script: "Latin", bcp47: "sw-KE", regions: "Central Kenya (Nyeri, Kiambu, Murang'a)", notes: "Largest native mother tongue in Kenya; language of Nobel laureate Ngũgĩ wa Thiong'o." },
      { name: "Luhya, Luo & Kalenjin", nativeName: "Oluluhya / Dholuo / Kalenjin", type: "Major Indigenous Languages", percentage: "30.0%", speakers: "16M", family: "Niger-Congo / Nilotic", script: "Latin", bcp47: "sw-KE", regions: "Western Kenya, Lake Victoria basin, Rift Valley", notes: "Dholuo and Kalenjin are Nilotic languages, home to world-record marathon runners." }
    ],
    accents: [
      { name: "Sheng (Nairobi Youth Slang)", region: "Nairobi Urban Area", description: "Rapid hybrid slang blending Swahili, English, Kikuyu, and Luo, with constantly evolving vocabulary.", sample: "Niaje wasee! Manze leo kuko poa sana, form ni gani?" },
      { name: "Coastal Swahili (Pwani / Mombasa)", region: "Mombasa & Swahili Coast", description: "Pure, poetic, classical Kiswahili Sanifu with soft Arabic-influenced cadence and warm greetings.", sample: "Hujambo bwana! Karibu sana Mombasa raha, habari ya asubuhi?" }
    ],
    phrases: [
      { type: "Greeting (Swahili)", text: "Jambo! / Habari gani? (Hello / What's the news?)", phonetic: "JAHM-boh / hah-BAH-ree GAH-nee", bcp47: "sw-KE" },
      { type: "Response (Swahili)", text: "Mzuri sana! / Hakuna matata! (Very good / No worries!)", phonetic: "m-ZOO-ree SAH-nah / hah-KOO-nah mah-TAH-tah", bcp47: "sw-KE" },
      { type: "Thank You (Swahili)", text: "Asante sana! (Thank you very much)", phonetic: "ah-SAHN-tay SAH-nah", bcp47: "sw-KE" },
      { type: "Goodbye (Swahili)", text: "Kwaheri! / Tutaonana baadaye!", phonetic: "kwah-HAY-ree / too-tah-oh-NAH-nah", bcp47: "sw-KE" }
    ],
    funFact: "The famous phrase 'Hakuna Matata' is real Swahili meaning 'there are no troubles/problems'! Swahili is also one of the rare languages where time is counted from sunrise (7:00 AM is called 'saa moja' - hour one)!"
  }
};

