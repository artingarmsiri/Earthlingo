// scripts/country_data.js
// Exhaustive linguistic and accent database for world countries

module.exports = {
  // === NORTH AMERICA ===
  USA: {
    name: "United States",
    officialName: "United States of America",
    nativeName: "United States",
    flag: "🇺🇸",
    capital: "Washington, D.C.",
    population: "334 Million",
    continent: "North America",
    primaryLanguage: "English (American)",
    languageFamily: "Indo-European (Germanic)",
    subFamily: "Germanic",
    diversityLevel: "High Linguistic Diversity",
    summary: "The United States has no official federal language by constitutional law, though English is the de facto national language and official in 32 states, with Spanish as the second most widely spoken.",
    languages: [
      { name: "English (American)", nativeName: "American English", type: "De Facto National", percentage: "78.2%", speakers: "245M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-US", regions: "Nationwide", notes: "Dominant language of federal government, commerce, and media." },
      { name: "Spanish", nativeName: "Español", type: "Widely Spoken / Co-official in PR", percentage: "13.4%", speakers: "42M", family: "Indo-European (Romance)", script: "Latin", bcp47: "es-US", regions: "Southwest, Florida, California, New York, Texas, Puerto Rico", notes: "Second largest Spanish-speaking population in the world after Mexico." },
      { name: "Chinese (Mandarin & Cantonese)", nativeName: "中文", type: "Major Minority Language", percentage: "1.1%", speakers: "3.5M", family: "Sino-Tibetan", script: "Simplified / Traditional Han", bcp47: "zh-CN", regions: "California, New York, Washington", notes: "Established presence since 19th-century gold rush and transcontinental railroad." },
      { name: "Tagalog", nativeName: "Wikang Tagalog", type: "Minority Language", percentage: "0.5%", speakers: "1.7M", family: "Austronesian", script: "Latin", bcp47: "tl-PH", regions: "California, Hawaii, Nevada, Washington", notes: "Fastest growing Asian language community in several Western states." },
      { name: "Vietnamese", nativeName: "Tiếng Việt", type: "Minority Language", percentage: "0.5%", speakers: "1.5M", family: "Austroasiatic", script: "Latin (Quốc ngữ)", bcp47: "vi-VN", regions: "Texas, California, Louisiana", notes: "Official voting materials provided in counties across multiple states." },
      { name: "Navajo (Diné Bizaad)", nativeName: "Diné bizaad", type: "Indigenous Language", percentage: "0.05%", speakers: "170K", family: "Na-Dene (Athabaskan)", script: "Latin", bcp47: "en-US", regions: "Navajo Nation (Arizona, New Mexico, Utah)", notes: "Famous for Code Talkers who transmitted secret military messages in WWII." },
      { name: "Hawaiian", nativeName: "ʻŌlelo Hawaiʻi", type: "Official State Language (Hawaii)", percentage: "0.01%", speakers: "24K", family: "Austronesian (Polynesian)", script: "Latin", bcp47: "haw-US", regions: "State of Hawaii", notes: "Co-official with English in the state of Hawaii under the 1978 State Constitution." }
    ],
    accents: [
      { name: "General American (GenAm)", region: "Midwest / National Broadcast", description: "Standard rhotic American accent, lacking salient regional markers; basis for broadcast media.", sample: "Did you catch the water bottle on the table? (flap T: wa-der bah-dl)" },
      { name: "Southern American English", region: "Deep South (Alabama, Georgia, Mississippi, Texas)", description: "Drawl cadence, monophthongization of /aɪ/ ('ride' sounds like 'rahd'), 'pin-pen' merger, and use of 'y'all'.", sample: "Well bless your heart, y'all come on over for some sweet tea!" },
      { name: "New York City & New Jersey", region: "NYC Metro Area & Long Island", description: "Historically non-rhotic, /ɔ/ vowel raise ('caw-fee', 'tawk'), short-a split ('bad' vs 'bat').", sample: "I gotta grab a slice and a regular coffee in Manhattan, forget about it!" },
      { name: "Boston / New England", region: "Massachusetts, Rhode Island, Maine", description: "Famous non-rhotic 'broad A' ('pahk the cah in Hahvahd yahd'), distinct intonation, use of 'wicked'.", sample: "That was wicked awesome, grab a tonic from the package store." },
      { name: "Midwestern / Northern Cities", region: "Chicago, Detroit, Cleveland, Buffalo", description: "Northern Cities Vowel Shift: short 'a' raises toward /eə/ ('cat' -> 'kyat'), 'bus' sounds like 'boss'.", sample: "Yeah no for sure, don'tcha know we're headed down by the lake." },
      { name: "African American Vernacular (AAVE)", region: "Nationwide Urban & Rural", description: "Rich rule-governed variety with habitual 'be', copula deletion, consonant cluster reduction, and unique prosody.", sample: "She be working late every weekday." },
      { name: "Appalachian English", region: "Appalachian Mountains (WV, KY, NC, TN)", description: "Preserves archaic Elizabethan English features, intrusive 'r' ('warsh'), prefix a- ('a-hunting').", sample: "He was a-talking right smart about them mountain hollows." },
      { name: "Hawaiian Pidgin (HCE)", region: "Hawaii Islands", description: "Creole combining English with Hawaiian, Portuguese, Cantonese, Tagalog, and Japanese lexical items.", sample: "Howzit brah? We go grind some grinds!" }
    ],
    phrases: [
      { type: "Greeting", text: "Hello / Hey there!", phonetic: "heh-LOH / hey thair", bcp47: "en-US" },
      { type: "Thank You", text: "Thank you so much!", phonetic: "thank yoo soh much", bcp47: "en-US" },
      { type: "Goodbye", text: "Have a great day / Catch you later!", phonetic: "catch yoo LAY-ter", bcp47: "en-US" },
      { type: "How are you?", text: "How's it going? / What's up?", phonetic: "howz it GOH-ing", bcp47: "en-US" }
    ],
    funFact: "The US has no official language at the federal level. More than 350 languages are actively spoken in homes across the country, making it one of the most linguistically diverse nations on Earth."
  },

  CAN: {
    name: "Canada",
    officialName: "Canada",
    nativeName: "Canada",
    flag: "🇨🇦",
    capital: "Ottawa",
    population: "39 Million",
    continent: "North America",
    primaryLanguage: "English & French",
    languageFamily: "Indo-European",
    subFamily: "Germanic / Romance",
    diversityLevel: "Federally Bilingual",
    summary: "Canada is constitutionally bilingual at the federal level, with English and French enjoying equal status in parliament, courts, and federal institutions. Quebec is solely French-official.",
    languages: [
      { name: "English (Canadian)", nativeName: "Canadian English", type: "Official (Federal)", percentage: "75.5%", speakers: "29M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-CA", regions: "9 Provinces & 3 Territories", notes: "Features Canadian Raising of vowels before voiceless consonants and distinctive Canadianisms ('eh')." },
      { name: "French (Canadian / Québécois)", nativeName: "Français canadien", type: "Official (Federal & Quebec)", percentage: "21.4%", speakers: "8.4M", family: "Indo-European (Romance)", script: "Latin", bcp47: "fr-CA", regions: "Quebec, New Brunswick (bilingual), Ontario, Manitoba", notes: "Retains 17th-century classical French pronunciations, nasal vowels, and anglicism legislation (Bill 101)." },
      { name: "Indigenous Languages (Cree, Inuktitut, Ojibwe)", nativeName: "Inuktitut (ᐃᓄᒃᑎᑐᑦ) / Nēhiyawēwin", type: "Official Territorial & Indigenous", percentage: "0.6%", speakers: "250K", family: "Algic / Inuit-Yupik-Unangan", script: "Canadian Aboriginal Syllabics / Latin", bcp47: "en-CA", regions: "Nunavut, Northwest Territories, Northern Quebec", notes: "Inuktitut and Inuinnaqtun are official languages in Nunavut alongside English and French." },
      { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", type: "Major Immigrant Language", percentage: "2.6%", speakers: "950K", family: "Indo-European (Indo-Aryan)", script: "Gurmukhi", bcp47: "pa-IN", regions: "British Columbia (Vancouver), Ontario (Toronto)", notes: "Third most spoken language in Canada after English and French." }
    ],
    accents: [
      { name: "Standard Canadian English", region: "Ontario, Prairies, West Coast", description: "Canadian Raising ('about' -> /əˈbʌʊt/), cot-caught merger, rhotic, polite rising intonation ending in 'eh?'.", sample: "Pass me the toque before we head out to the rink, eh?" },
      { name: "Québécois French", region: "Quebec (Montreal, Quebec City)", description: "Affrication of /t/ and /d/ before high front vowels ('tu' sounds like 'tsu', 'dire' like 'dzir'), dipthongized vowels.", sample: "C'est tiguidou! On va jaser un peu." },
      { name: "Newfoundland English (Newfie)", region: "Newfoundland & Labrador", description: "One of the most distinct dialects in the English-speaking world, influenced by Irish and West Country British accents.", sample: "Whaddya at, b'y? Stay where you're to till I comes where you're at." },
      { name: "Acadian French (Chiac)", region: "New Brunswick (Moncton)", description: "Maritime French variety blending 17th-century archaic French vocabulary with contemporary English syntax.", sample: "J'ai backé mon char dans la driveway." }
    ],
    phrases: [
      { type: "Greeting", text: "Hello / Bonjour!", phonetic: "heh-LOH / bon-ZHOOR", bcp47: "en-CA" },
      { type: "Thank You", text: "Thank you / Merci beaucoup!", phonetic: "thank yoo / mair-see boh-KOO", bcp47: "fr-CA" },
      { type: "Goodbye", text: "Goodbye / Au revoir!", phonetic: "good-BYE / oh reh-VWAHR", bcp47: "fr-CA" },
      { type: "How are you?", text: "How's it going, eh? / Comment ça va?", phonetic: "howz it goh-ing, eh? / koh-mahn sah VAH?", bcp47: "en-CA" }
    ],
    funFact: "New Brunswick is the only constitutionally official bilingual province in Canada where government services must be provided in both English and French simultaneously."
  },

  MEX: {
    name: "Mexico",
    officialName: "United Mexican States",
    nativeName: "México",
    flag: "🇲🇽",
    capital: "Mexico City",
    population: "128 Million",
    continent: "North America",
    primaryLanguage: "Spanish (Mexican)",
    languageFamily: "Indo-European (Romance)",
    subFamily: "Romance",
    diversityLevel: "Multilingual (68 National Indigenous Languages)",
    summary: "Mexico has the world's largest Spanish-speaking population. Mexican law recognizes 68 indigenous languages and 364 language variants as national languages equal in validity to Spanish.",
    languages: [
      { name: "Spanish (Mexican)", nativeName: "Español mexicano", type: "National De Facto", percentage: "92.7%", speakers: "120M", family: "Indo-European (Romance)", script: "Latin", bcp47: "es-MX", regions: "Nationwide", notes: "Heavily influenced by Nahuatl vocabulary (chocolate, tomate, aguacate, coyote, chicle)." },
      { name: "Nahuatl", nativeName: "Nāhuatl", type: "Recognized National Language", percentage: "1.5%", speakers: "1.7M", family: "Uto-Aztecan", script: "Latin", bcp47: "es-MX", regions: "Puebla, Veracruz, Hidalgo, Guerrero, Mexico State", notes: "The historical language of the Aztec Empire, still vibrant in central Mexico." },
      { name: "Yucatec Maya", nativeName: "Maaya t'àan", type: "Recognized National Language", percentage: "0.8%", speakers: "800K", family: "Mayan", script: "Latin", bcp47: "es-MX", regions: "Yucatán Peninsula (Yucatán, Quintana Roo, Campeche)", notes: "Tonal Mayan language with glottalized consonants and ancient hieroglyphic legacy." },
      { name: "Mixtec & Zapotec", nativeName: "Tu'un sávi / Diidxazá", type: "Recognized National Languages", percentage: "0.9%", speakers: "900K", family: "Oto-Manguean", script: "Latin", bcp47: "es-MX", regions: "Oaxaca, Puebla, Guerrero", notes: "Complex tonal languages renowned for intricate indigenous literature and weaving traditions." }
    ],
    accents: [
      { name: "Chilango (Mexico City)", region: "Mexico City Valley", description: "Sing-song 'cantadito' intonation, elongated final vowels, rich slang (chido, güey, chochear).", sample: "¿Qué onda carnal? ¡Está bien chido este lugar!" },
      { name: "Norteño", region: "Monterrey, Sonora, Chihuahua, Sinaloa", description: "Direct, forceful cadence, distinct hard consonants, rapid speech, influenced by cowboy and frontier culture.", sample: "¡Ajúa compadre! Ándele pues, fierro por la 300." },
      { name: "Yucateco", region: "Yucatan, Merida", description: "Influenced heavily by Mayan phonetics: glottal stops, rhythmic pauses, melodic pitch shifts.", sample: "¡Pelaná! Vamos a tomar el fresco, ¿lo viste o qué?" },
      { name: "Costeño", region: "Veracruz, Guerrero (Acapulco)", description: "Aspiration and dropping of syllable-final 's', relaxed Caribbean rhythm and open vowels.", sample: "Vamo pa' la playa a come' pescado frito." }
    ],
    phrases: [
      { type: "Greeting", text: "¡Hola! / ¿Qué tal?", phonetic: "OH-lah / kay TAHL", bcp47: "es-MX" },
      { type: "Thank You", text: "Muchas gracias", phonetic: "MOO-chahs GRAH-syahs", bcp47: "es-MX" },
      { type: "Goodbye", text: "¡Hasta luego! / ¡Nos vemos!", phonetic: "AHS-tah LWEH-goh", bcp47: "es-MX" },
      { type: "How are you?", text: "¿Cómo estás? / ¿Qué onda?", phonetic: "KOH-moh ehs-TAHS / kay OHN-dah", bcp47: "es-MX" }
    ],
    funFact: "Words you use every day in English—like avocado, chocolate, tomato, chili, coyote, and shack—originated directly from Mexico's indigenous Nahuatl language!"
  },

  // === SOUTH AMERICA ===
  BRA: {
    name: "Brazil",
    officialName: "Federative Republic of Brazil",
    nativeName: "Brasil",
    flag: "🇧🇷",
    capital: "Brasília",
    population: "216 Million",
    continent: "South America",
    primaryLanguage: "Portuguese (Brazilian)",
    languageFamily: "Indo-European (Romance)",
    subFamily: "Romance",
    diversityLevel: "High Regional & Indigenous Diversity",
    summary: "Brazil is the only Portuguese-speaking nation in the Americas. Brazilian Portuguese is renowned for its open, musical vowels, palatalization, and incorporation of Tupi-Guarani and African loanwords.",
    languages: [
      { name: "Portuguese (Brazilian)", nativeName: "Português brasileiro", type: "Official Sole Language", percentage: "98.5%", speakers: "214M", family: "Indo-European (Romance)", script: "Latin", bcp47: "pt-BR", regions: "Nationwide", notes: "Grammatically and phonetically distinct from European Portuguese; official language since colonial times." },
      { name: "Indigenous Languages (Guarani, Yanomami, Tikuna)", nativeName: "Tupi-Guarani / Nheengatu", type: "Recognized Co-official Municipally", percentage: "0.4%", speakers: "300K", family: "Tupian / Macro-Jê / Arawakan", script: "Latin", bcp47: "gn-BR", regions: "Amazon Basin, São Gabriel da Cachoeira", notes: "São Gabriel da Cachoeira in Amazonas co-recognizes Nheengatu, Tukano, and Baniwa as official." },
      { name: "Hunsrik & Venetian (Talian)", nativeName: "Riograndenser Hunsrückisch / Talian", type: "Co-official Regional Immigrant Languages", percentage: "0.8%", speakers: "1.5M", family: "Indo-European (Germanic / Romance)", script: "Latin", bcp47: "pt-BR", regions: "Rio Grande do Sul, Santa Catarina", notes: "German and Venetian dialect communities recognized as intangible cultural heritage." }
    ],
    accents: [
      { name: "Carioca", region: "Rio de Janeiro", description: "Aspirated 's' sounding like 'sh' or 'zh' (palatal sibilant), open front vowels, laid-back beach cadence.", sample: "Coisa boa, mermão! Vamos pra praia de Ipanema tomar uma água de coco." },
      { name: "Paulistano", region: "São Paulo City", description: "Italian-influenced melodic cadence, alveolar tapped 'r', strong retroflex contrast, crisp articulation.", sample: "E aí, meu! Pega a pizza na Mooca que tá show de bola." },
      { name: "Nordestino", region: "Bahia, Pernambuco, Ceará", description: "Rhythmic, open cadence, non-palatalized 't' and 'd' ('ti' and 'di' pronounced crisply, not 'tchi'/'dji').", sample: "Oxente, bichinho! Arretado demais essa festa de São João!" },
      { name: "Gaúcho", region: "Rio Grande do Sul (Pampas)", description: "Pampa cowboy culture: heavy use of 'tu' with second-person conjugation, Spanish-influenced vocabulary.", sample: "Bah tchê! Mas que barbaridade esse chimarrão bueno!" },
      { name: "Mineiro", region: "Minas Gerais", description: "Famous for contractions and swallowing syllables ('trem' for anything, 'uai', 'cê' for você, 'pão de queijo').", sample: "Uai sô, que trem bão! Passa lá em casa pra tomar um cafezim." }
    ],
    phrases: [
      { type: "Greeting", text: "Olá! / Tudo bem?", phonetic: "oh-LAH / TOO-doo beng", bcp47: "pt-BR" },
      { type: "Thank You", text: "Muito obrigado (m) / obrigada (f)", phonetic: "MOOY-too oh-bree-GAH-doo", bcp47: "pt-BR" },
      { type: "Goodbye", text: "Tchau! / Até logo!", phonetic: "CHOW / ah-TEH LOH-goo", bcp47: "pt-BR" },
      { type: "How are you?", text: "¿Como vai? / E aí, beleza?", phonetic: "koh-moo VYE / eh eye, beh-LEH-zah", bcp47: "pt-BR" }
    ],
    funFact: "More than 200 indigenous languages are still spoken in Brazil's Amazon rainforest, making the Amazon one of the world's most critical linguistic preservation hotspots."
  },

  ARG: {
    name: "Argentina",
    officialName: "Argentine Republic",
    nativeName: "Argentina",
    flag: "🇦🇷",
    capital: "Buenos Aires",
    population: "46 Million",
    continent: "South America",
    primaryLanguage: "Spanish (Rioplatense)",
    languageFamily: "Indo-European (Romance)",
    subFamily: "Romance",
    diversityLevel: "Distinct Dialect & Regional Diversity",
    summary: "Argentine Spanish is world-famous for 'yeísmo rehilado' (pronouncing 'll' and 'y' as 'sh' or 'zh') and 'voseo' (using 'vos' instead of 'tú'). Heavily shaped by 19th/20th-century Italian immigration.",
    languages: [
      { name: "Spanish (Rioplatense)", nativeName: "Español rioplatense", type: "National De Facto", percentage: "96.5%", speakers: "44M", family: "Indo-European (Romance)", script: "Latin", bcp47: "es-AR", regions: "Buenos Aires, Pampas, Patagonia", notes: "Uses Lunfardo slang, Italian intonation curves, and universal voseo ('vos tenés', 'vos sos')." },
      { name: "Guarani", nativeName: "Avañe'ẽ", type: "Co-official Provincial (Corrientes)", percentage: "0.8%", speakers: "350K", family: "Tupi-Guarani", script: "Latin", bcp47: "es-AR", regions: "Corrientes, Misiones, Chaco", notes: "Co-official language in the province of Corrientes alongside Spanish since 2004." },
      { name: "Quechua", nativeName: "Runa Simi", type: "Indigenous Recognized", percentage: "0.4%", speakers: "180K", family: "Quechuan", script: "Latin", bcp47: "es-AR", regions: "Santiago del Estero, Jujuy, Salta", notes: "Santiagueño Quechua has been spoken in northern Argentina for hundreds of years." },
      { name: "Welsh (Cymraeg)", nativeName: "Cymraeg y Wladfa", type: "Recognized Minority Language", percentage: "0.02%", speakers: "5K", family: "Indo-European (Celtic)", script: "Latin", bcp47: "cy-GB", regions: "Chubut Valley (Patagonia)", notes: "Spoken by descendants of Welsh settlers who established Y Wladfa in Patagonia in 1865." }
    ],
    accents: [
      { name: "Porteño (Buenos Aires)", region: "Buenos Aires Metropolitan Area", description: "Dramatic Neapolitan Italian intonation, 'll'/'y' pronounced as 'sh' ('sho me shamo'), extensive Lunfardo.", sample: "¿Che, boludo, viste la lluvia? ¡Qué quilombo el subte!" },
      { name: "Cordobés", region: "Córdoba Province", description: "Prolongation of pre-tonic vowels ('Cooordoba'), cheerful singsong cadence, famous for humor.", sample: "¿Qué hacé' culeao? ¡Vamos a tomar un fernet con coca!" },
      { name: "Cuyano", region: "Mendoza, San Juan (Andes)", description: "Chilean-influenced rhythm, preservation of older Spanish vowel nuances, distinctive andean vocabulary.", sample: "Vea cumpa, vamos a catar un buen Malbec." }
    ],
    phrases: [
      { type: "Greeting", text: "¡Hola! / ¿Che, cómo andás?", phonetic: "OH-lah / cheh, KOH-moh ahn-DAHS", bcp47: "es-AR" },
      { type: "Thank You", text: "¡Muchas gracias, che!", phonetic: "MOO-chahs GRAH-syahs, cheh", bcp47: "es-AR" },
      { type: "Goodbye", text: "¡Chau, nos vemos!", phonetic: "CHOW, nohs VEH-mohs", bcp47: "es-AR" },
      { type: "How are you?", text: "¿Todo bien? / ¿Qué hacés?", phonetic: "TOH-doh byehn / kay ah-SEHS", bcp47: "es-AR" }
    ],
    funFact: "Patagonia in southern Argentina has the only thriving Welsh-speaking community outside Wales, with bilingual road signs, tea rooms, and an annual Eisteddfod festival!"
  },

  // === EUROPE ===
  GBR: {
    name: "United Kingdom",
    officialName: "United Kingdom of Great Britain and Northern Ireland",
    nativeName: "United Kingdom",
    flag: "🇬🇧",
    capital: "London",
    population: "68 Million",
    continent: "Europe",
    primaryLanguage: "English (British)",
    languageFamily: "Indo-European (Germanic)",
    subFamily: "Germanic",
    diversityLevel: "Extreme Dialect Diversity & Celtic Languages",
    summary: "The UK is the birthplace of the English language. Remarkably, accent variation changes roughly every 25 miles, from Cockney and RP to Scouse, Geordie, Scottish Gaelic, and Welsh.",
    languages: [
      { name: "English (British)", nativeName: "British English", type: "De Facto Official", percentage: "94.5%", speakers: "64M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-GB", regions: "England, Scotland, Wales, Northern Ireland", notes: "The historic source of worldwide English, characterized by hundreds of regional varieties." },
      { name: "Welsh (Cymraeg)", nativeName: "Cymraeg", type: "De Jure Official (Wales)", percentage: "1.2%", speakers: "900K", family: "Indo-European (Celtic)", script: "Latin", bcp47: "cy-GB", regions: "Wales", notes: "The only de jure official language established by law in any part of the UK; taught in all Welsh schools." },
      { name: "Scots", nativeName: "Scots Leid", type: "Recognized Regional Language", percentage: "2.3%", speakers: "1.5M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-GB", regions: "Scottish Lowlands & Northern Isles", notes: "Sister Germanic language to English, celebrated in the poetry of Robert Burns." },
      { name: "Scottish Gaelic (Gàidhlig)", nativeName: "Gàidhlig", type: "Official in Scotland", percentage: "0.1%", speakers: "60K", family: "Indo-European (Celtic / Goidelic)", script: "Latin", bcp47: "gd-GB", regions: "Scottish Highlands & Western Isles (Hebrides)", notes: "Ancient Celtic language with bilingual signage throughout Scotland and BBC Alba broadcasts." },
      { name: "Irish (Gaeilge)", nativeName: "Gaeilge", type: "Official in Northern Ireland", percentage: "0.2%", speakers: "140K", family: "Indo-European (Celtic / Goidelic)", script: "Latin", bcp47: "ga-IE", regions: "Northern Ireland", notes: "Granted official status under the Identity and Language (Northern Ireland) Act 2022." },
      { name: "Cornish (Kernowek)", nativeName: "Kernowek", type: "Revived Regional Language", percentage: "0.01%", speakers: "2K", family: "Indo-European (Celtic / Brythonic)", script: "Latin", bcp47: "kw-GB", regions: "Cornwall", notes: "Successfully revitalized from dormancy through dedicated community schooling and cultural efforts." }
    ],
    accents: [
      { name: "Received Pronunciation (RP / BBC)", region: "Southern England / Traditional Standard", description: "Non-rhotic prestige accent, trap-bath split, precise enunciation, traditionally associated with Oxford and broadcasting.", sample: "One would hardly imagine such delightful weather in autumn." },
      { name: "Cockney & Estuary English", region: "London East End & Thames Estuary", description: "Glottal stops for /t/, th-fronting ('fink' for think), rhyming slang ('apples and pears' = stairs).", sample: "Alright mate, 'ave a butchers at that! Proper sorted." },
      { name: "Scouse", region: "Liverpool / Merseyside", description: "Throat fricatives (/k/ pronounced with uvular fricative 'ch'), rising intonation at phrase ends, fast tempo.", sample: "Alright la, yer sound, lad! Deffo boss that, honest to God." },
      { name: "Geordie", region: "Newcastle & Tyneside", description: "Rhythmic lilt, Anglo-Saxon archaic vocabulary ('howay', 'bairn', 'scran'), non-rhotic, unique vowels.", sample: "Howay the lads! Wey aye man, it's pure class like." },
      { name: "Brummie", region: "Birmingham & West Midlands", description: "Downward melodic inflection, nasalized quality, distinct vowel shifts ('alright' sounds like 'a-roight').", sample: "Alright bab, how's it going? Grab us a cup of tea." },
      { name: "Scottish English", region: "Edinburgh, Glasgow, Highlands", description: "Rhotic (rolled or tapped 'r'), pure monophthong vowels, distinct vocabulary ('wee', 'dreck', 'ken').", sample: "It's a braw bricht moonlicht nicht the nicht, ya ken!" },
      { name: "Welsh English", region: "Cardiff, Swansea, Valleys", description: "Melodic sing-song pitch range, prolonged consonants, distinctive tag questions ('isn't it?', 'tidy').", sample: "Who's coat is that jacket? That's proper tidy, mun!" }
    ],
    phrases: [
      { type: "Greeting", text: "Hello / Good morning / Alright?", phonetic: "heh-LOH / awl-RYTE?", bcp47: "en-GB" },
      { type: "Thank You", text: "Cheers / Thank you very much!", phonetic: "CHEERZ / thank yoo VE-ree much", bcp47: "en-GB" },
      { type: "Goodbye", text: "Cheerio / Bye for now!", phonetic: "cheer-ee-OH", bcp47: "en-GB" },
      { type: "How are you?", text: "How are you doing? / You alright?", phonetic: "how ah yoo DOO-ing", bcp47: "en-GB" }
    ],
    funFact: "A person's accent in Great Britain can change noticeably within just 25 miles of travel, reflecting over 1,500 years of isolated linguistic evolution from Anglo-Saxon, Viking, Norman, and Celtic roots."
  },

  FRA: {
    iso2: "FR",
    name: "France",
    officialName: "French Republic",
    nativeName: "France",
    flag: "🇫🇷",
    capital: "Paris",
    population: "68 Million",
    continent: "Europe",
    primaryLanguage: "French",
    languageFamily: "Indo-European (Romance)",
    subFamily: "Romance",
    diversityLevel: "Monolingual Official / Rich Regional Languages",
    summary: "French is the sole official language of the Republic under Article 2 of the French Constitution. However, historic regional languages like Occitan, Breton, Alsatian, Corsican, and Basque persist proudly.",
    languages: [
      { name: "French", nativeName: "Français", type: "Sole Constitutional Official", percentage: "96.2%", speakers: "65M", family: "Indo-European (Romance)", script: "Latin", bcp47: "fr-FR", regions: "Nationwide & Overseas Territories", notes: "Regulated by the Académie Française since 1635 to maintain linguistic standards." },
      { name: "Occitan (Langue d'Oc)", nativeName: "Occitan / Lenga d'òc", type: "Recognized Regional Language", percentage: "1.2%", speakers: "800K", family: "Indo-European (Romance)", script: "Latin", bcp47: "oc-FR", regions: "Southern France (Occitanie, Provence, Gascony)", notes: "The historical language of the medieval Troubadours; distinct from French Langue d'Oïl." },
      { name: "Alsatian", nativeName: "Elsässerditsch", type: "Regional Germanic Language", percentage: "0.9%", speakers: "600K", family: "Indo-European (Germanic / Alemannic)", script: "Latin", bcp47: "de-DE", regions: "Alsace (Strasbourg, Colmar)", notes: "Alemannic German dialect close to Swiss German, deeply rooted in Alsatian border culture." },
      { name: "Breton (Brezhoneg)", nativeName: "Brezhoneg", type: "Regional Celtic Language", percentage: "0.3%", speakers: "210K", family: "Indo-European (Celtic / Brythonic)", script: "Latin", bcp47: "br-FR", regions: "Brittany (Bretagne)", notes: "The only Celtic language spoken on the European mainland; taught in immersive Diwan schools." },
      { name: "Corsican (Corsu)", nativeName: "Corsu", type: "Regional Romance Language", percentage: "0.2%", speakers: "130K", family: "Indo-European (Romance / Italo-Dalmatian)", script: "Latin", bcp47: "co-FR", regions: "Island of Corsica", notes: "Closely related to medieval Tuscan and central Italian dialects." },
      { name: "Basque (Euskara)", nativeName: "Euskara", type: "Language Isolate", percentage: "0.1%", speakers: "70K", family: "Language Isolate", script: "Latin", bcp47: "eu-FR", regions: "French Basque Country (Pyrénées-Atlantiques)", notes: "Oldest living language in Europe; has zero demonstrated genetic relationship to any other language family." }
    ],
    accents: [
      { name: "Parisièn Standard", region: "Paris & Île-de-France", description: "Fast cadence, uvular trill 'r', neutral vowels; standard pronunciation heard on French television and radio.", sample: "C'est nickel, on se retrouve au bistrot tout à l'heure." },
      { name: "Méridional (Marseille & Provence)", region: "Southern France (Provence, Côte d'Azur)", description: "Pronunciation of final 'e' caduc, nasal vowels sounded out with an 'ng' finish, lively Mediterranean melody.", sample: "Oh bonne mère ! Viens boire un pastis avec nous, peuchère !" },
      { name: "Ch'ti (Nord-Pas-de-Calais / Picard)", region: "Northern France (Lille)", description: "Picard dialect influences, 'ch' substituted for 's' sounds ('ti z'aute', 'mi et ti'), warm mining community heritage.", sample: "Biloute, comment qu'c'est ? Fait pas biau dehors !" },
      { name: "Alsatian Accent", region: "Eastern France (Strasbourg)", description: "Germanic tonal cadence, unvoiced stops, distinctive vocabulary borrowings from Alsatian Alemannic.", sample: "Hopla ! On mange une bonne tarte flambée ce soir." }
    ],
    phrases: [
      { type: "Greeting", text: "Bonjour ! / Salut !", phonetic: "bon-ZHOOR / sah-LOO", bcp47: "fr-FR" },
      { type: "Thank You", text: "Merci beaucoup !", phonetic: "mair-SEE boh-KOO", bcp47: "fr-FR" },
      { type: "Goodbye", text: "Au revoir ! / À bientôt !", phonetic: "oh reh-VWAHR / ah byan-TOH", bcp47: "fr-FR" },
      { type: "How are you?", text: "Comment allez-vous ? / Ça va ?", phonetic: "koh-mahn tah-lay VOO / sah VAH?", bcp47: "fr-FR" }
    ],
    funFact: "In 1789 during the French Revolution, only about 12% of France's population actually spoke standard French fluently—the majority spoke regional languages like Occitan, Breton, Flemish, or Basque!"
  },

  DEU: {
    name: "Germany",
    officialName: "Federal Republic of Germany",
    nativeName: "Deutschland",
    flag: "🇩🇪",
    capital: "Berlin",
    population: "84 Million",
    continent: "Europe",
    primaryLanguage: "German (Hochdeutsch)",
    languageFamily: "Indo-European (Germanic)",
    subFamily: "Germanic",
    diversityLevel: "Rich Dialect Spectrum (High & Low German)",
    summary: "Standard High German (Hochdeutsch) unites Germany, but the country possesses one of Europe's richest dialect continuums, split by the 'Benrath line' between Low German in the north and High German in the south.",
    languages: [
      { name: "German (Standard Hochdeutsch)", nativeName: "Deutsch", type: "Sole Federal Official", percentage: "95.0%", speakers: "80M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "de-DE", regions: "Nationwide", notes: "Standardized through Martin Luther's Bible translation; official language in all federal institutions." },
      { name: "Low German (Plattdüütsch)", nativeName: "Plattdüütsch", type: "Recognized Regional Language", percentage: "2.4%", speakers: "2.0M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "nds-DE", regions: "Northern Germany (Hamburg, Bremen, Schleswig-Holstein, Lower Saxony)", notes: "Did not undergo the High German consonant shift; closer to Dutch and Old English (water vs Wasser)." },
      { name: "Upper & Lower Sorbian", nativeName: "Serbsce / Serbski", type: "Recognized Minority Language", percentage: "0.1%", speakers: "60K", family: "Indo-European (Slavic / West Slavic)", script: "Latin", bcp47: "de-DE", regions: "Lusatia (Saxony and Brandenburg)", notes: "Slavic language protected under state constitutions with bilingual school systems and road signs." },
      { name: "Danish & Frisian", nativeName: "Dansk / Friisk", type: "Recognized Minority Languages", percentage: "0.1%", speakers: "70K", family: "Indo-European (Germanic)", script: "Latin", bcp47: "da-DK", regions: "Schleswig-Holstein", notes: "Protected minority languages with their own political party (SSW) exempt from the 5% threshold." }
    ],
    accents: [
      { name: "Bairisch (Bavarian)", region: "Bavaria & Munich", description: "Rolling 'r', distinctive greeting ('Grüß Gott'), rounding of vowels, rich colloquial vocabulary.", sample: "Servus! O'zapft is! Des is a pfundige Gaudi!" },
      { name: "Berlinerisch", region: "Berlin", description: "Direct, dry wit (Berliner Schnauze), 'g' pronounced as 'j' ('jut' for gut), 'wat' instead of 'was'.", sample: "Juten Tach! Wat soll der Quatsch denn, wa?" },
      { name: "Schwäbisch (Swabian)", region: "Baden-Württemberg (Stuttgart, Black Forest)", description: "Diminutive ending '-le' (Mädle, Spätzle), 'st' pronounced as 'scht' ('Du bischt'), melodic inflection.", sample: "Grüß Gottle! Schaffe, schaffe, Häusle baue!" },
      { name: "Kölsch (Cologne / Rhineland)", region: "Cologne & Rhineland", description: "Melodic sing-song pitch, 'g' softened to 'j', celebrated in carnival songs and Kölsch brewery culture.", sample: "Kölle Alaaf! Et kütt wie et kütt, trink mer noch e Kölsch!" },
      { name: "Sächsisch (Saxon)", region: "Saxony (Dresden, Leipzig)", description: "Softened unvoiced stops (p->b, t->d, k->g), elongated central vowels, unique eastern rhythm.", sample: "Nu gloor, das hammer doch gleich!" }
    ],
    phrases: [
      { type: "Greeting", text: "Hallo! / Guten Tag! / Servus!", phonetic: "HAH-loh / GOO-ten TAHG / ZAIR-voos", bcp47: "de-DE" },
      { type: "Thank You", text: "Vielen Dank! / Danke schön!", phonetic: "FEE-len DAHNK / DAHN-kuh shurn", bcp47: "de-DE" },
      { type: "Goodbye", text: "Auf Wiedersehen! / Tschüss!", phonetic: "owf VEE-der-zay-en / CHOOSS", bcp47: "de-DE" },
      { type: "How are you?", text: "Wie geht es Ihnen? / Wie geht's?", phonetic: "vee GAYT es EE-nen / vee GAYTS", bcp47: "de-DE" }
    ],
    funFact: "German compound nouns can theoretically be infinite in length! The Guinness World Record for the longest German word published was 63 letters: Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz."
  },

  // === ASIA ===
  JPN: {
    name: "Japan",
    officialName: "Japan",
    nativeName: "日本 (Nihon / Nippon)",
    flag: "🇯🇵",
    capital: "Tokyo",
    population: "125 Million",
    continent: "Asia",
    primaryLanguage: "Japanese (Nihongo)",
    languageFamily: "Japonic",
    subFamily: "Japonic",
    diversityLevel: "High Dialect Diversity (Hōgen) & Ryukyuan",
    summary: "Japanese utilizes three distinct writing scripts simultaneously (Hiragana, Katakana, and Kanji) along with an intricate honorific system (Keigo). Regional dialects vary dramatically from Tokyo to Osaka and Okinawa.",
    languages: [
      { name: "Japanese (Hyōjungo)", nativeName: "日本語 (Nihongo)", type: "De Facto National", percentage: "98.5%", speakers: "123M", family: "Japonic", script: "Kanji, Hiragana, Katakana", bcp47: "ja-JP", regions: "Nationwide", notes: "Standardized on the Yamanote dialect of Tokyo during the Meiji modernization." },
      { name: "Ryukyuan Languages (Okinawan, Miyako, Yaeyama)", nativeName: "しまくとぅば (Shima-kutuba)", type: "Indigenous Regional Languages", percentage: "0.8%", speakers: "1.0M", family: "Japonic / Ryukyuan", script: "Hiragana / Kanji", bcp47: "ja-JP", regions: "Okinawa Prefecture & Amami Islands", notes: "Distinct Japonic languages mutually unintelligible with standard Japanese, classified by UNESCO as endangered." },
      { name: "Ainu (Aynu itak)", nativeName: "アイヌ イタㇰ (Aynu itak)", type: "Indigenous Language Isolate", percentage: "0.01%", speakers: "300", family: "Language Isolate", script: "Katakana / Latin", bcp47: "ja-JP", regions: "Hokkaido", notes: "Critically endangered language isolate of Japan's northern indigenous Ainu people." }
    ],
    accents: [
      { name: "Tokyo Standard (Hyōjungo)", region: "Kanto / Greater Tokyo", description: "Flat pitch accent, standard polite speech, clear articulation heard on NHK broadcasts.", sample: "こんにちは、お元気ですか？ (Konnichiwa, o-genki desu ka?)" },
      { name: "Kansai-ben", region: "Osaka, Kyoto, Kobe", description: "Warm, rapid, melodic pitch accent, humor-oriented cadence, 'ya nen' instead of 'da', 'ookini' for thank you.", sample: "まいど！めっちゃええやん、ほんまにありがとう！ (Maido! Metcha ee yan, honma ni arigatō!)" },
      { name: "Tohoku-ben (Zūzū-ben)", region: "Northern Honshu (Aomori, Akita, Sendai)", description: "Nasalized vowels, contracted syllables, historically unintelligible to Tokyo speakers; often subtitled on TV.", sample: "おばんです！まんま食ったが？ (Obandesu! Manma kuttaga?)" },
      { name: "Hakata-ben", region: "Kyushu (Fukuoka)", description: "Soft, friendly sentence-ending particles ('-tai', '-bai', '-to'), popular throughout Japan.", sample: "なんばしよっと？バリうまかラーメン食べに行こう！ (Nanba shiyotto? Bari umaka rāmen tabe ni ikō!)" }
    ],
    phrases: [
      { type: "Greeting", text: "こんにちは！ (Konnichiwa!)", phonetic: "kohn-nee-chee-WAH", bcp47: "ja-JP" },
      { type: "Thank You", text: "ありがとうございます！ (Arigatō gozaimasu!)", phonetic: "ah-ree-gah-TOH goh-zye-MAHS", bcp47: "ja-JP" },
      { type: "Goodbye", text: "さようなら / じゃあまたね！ (Sayōnara / Jā mata ne!)", phonetic: "sah-yoh-NAH-rah", bcp47: "ja-JP" },
      { type: "How are you?", text: "お元気ですか？ (O-genki desu ka?)", phonetic: "oh GEN-kee des KAH", bcp47: "ja-JP" }
    ],
    funFact: "A typical Japanese sentence routinely combines three writing scripts at once: Kanji (Chinese characters for meanings), Hiragana (phonetic syllabary for grammar), and Katakana (for loanwords and sound effects)!"
  },

  CHN: {
    name: "China",
    officialName: "People's Republic of China",
    nativeName: "中国 (Zhōngguó)",
    flag: "🇨🇳",
    capital: "Beijing",
    population: "1.41 Billion",
    continent: "Asia",
    primaryLanguage: "Mandarin Chinese (Putonghua)",
    languageFamily: "Sino-Tibetan",
    subFamily: "Sinitic",
    diversityLevel: "Extremely High (7 Major Dialect Groups & 55 Ethnic Minorities)",
    summary: "Standard Mandarin (Putonghua) is the national language, based on Beijing phonology. The Chinese linguistic family comprises hundreds of spoken varieties that are as mutually unintelligible as French is to Romanian, yet unified by a common written logographic script.",
    languages: [
      { name: "Mandarin (Putonghua)", nativeName: "普通话 / 现代标准汉语", type: "National Official", percentage: "73.0%", speakers: "1.03B", family: "Sino-Tibetan", script: "Simplified Chinese Hanzi", bcp47: "zh-CN", regions: "Nationwide", notes: "Based on the northern Beijing dialect with 4 distinct tones." },
      { name: "Cantonese (Yue)", nativeName: "粤语 / 广东话", type: "Official Regional (HK, Macau, Guangdong)", percentage: "6.2%", speakers: "85M", family: "Sino-Tibetan", script: "Traditional / Simplified Hanzi", bcp47: "zh-HK", regions: "Guangdong, Guangxi, Hong Kong, Macao", notes: "Preserves ancient Middle Chinese final consonants (-p, -t, -k, -m) with 6 to 9 distinct tones." },
      { name: "Wu (Shanghainese)", nativeName: "吴语 / 上海话", type: "Major Regional Variety", percentage: "6.0%", speakers: "82M", family: "Sino-Tibetan", script: "Simplified Hanzi", bcp47: "zh-CN", regions: "Shanghai, Zhejiang, Southern Jiangsu", notes: "Distinguished by voiced consonants (b, d, g, z, v) and complex tone sandhi systems." },
      { name: "Min Nan (Hokkien / Taiwanese)", nativeName: "闽南语 / 闽语", type: "Major Regional Variety", percentage: "4.5%", speakers: "60M", family: "Sino-Tibetan", script: "Traditional Hanzi / Pe̍h-ōe-jī", bcp47: "zh-TW", regions: "Fujian, Taiwan, Southeast Asian diaspora", notes: "Retains the most archaic phonological features, tracing back directly to Old Chinese." },
      { name: "Tibetan", nativeName: "བོད་སྐད (Bod skad)", type: "Autonomous Regional Official", percentage: "0.6%", speakers: "8M", family: "Sino-Tibetan", script: "Tibetan Script (Indic-derived)", bcp47: "bo-CN", regions: "Tibet Autonomous Region, Qinghai, Sichuan", notes: "Sacred language of Tibetan Buddhism with classical literature dating to the 7th century." },
      { name: "Uyghur", nativeName: "ئۇيغۇرچە (Uyghurche)", type: "Autonomous Regional Official", percentage: "0.8%", speakers: "12M", family: "Turkic", script: "Uyghur Arabic Alphabet", bcp47: "ug-CN", regions: "Xinjiang Uyghur Autonomous Region", notes: "Karluk Turkic language closely related to Uzbek, written in a modified Perso-Arabic script." }
    ],
    accents: [
      { name: "Beijing Dialect (Erhua)", region: "Beijing Municipality", description: "Heavy retroflex rhoticity ('erhua' 儿化), rapid speech tempo, crisp alveolar affricates.", sample: "您好！今天这天儿真倍儿棒！ (Nín hǎo! Jīntiān zhè tiānr zhēn bèir bàng!)" },
      { name: "Sichuanese (Chuan-Yu)", region: "Chengdu & Chongqing", description: "Warm, sing-song tonal pattern, soft retroflexes, rich culinary and comedic idiom.", sample: "巴适得板！要得嘛，我们去吃火锅！ (Bāshì de bǎn! Yàode ma, wǒmen qù chī huǒguō!)" },
      { name: "Southern Mandarin (Jiangnan / Taiwan)", region: "Shanghai, Nanjing, Taiwan", description: "Soft consonants, loss of retroflex distinction (zh->z, ch->c, sh->s), expressive end-particles (啦, 嘛, 咧).", sample: "你好啊，真的一点都不麻烦啦！ (Nǐ hǎo a, zhēnde yīdiǎn dōu bù máfan la!)" }
    ],
    phrases: [
      { type: "Greeting", text: "你好！ (Nǐ hǎo!)", phonetic: "nee HOW", bcp47: "zh-CN" },
      { type: "Thank You", text: "谢谢！ (Xièxie!)", phonetic: "shyeh-shyeh", bcp47: "zh-CN" },
      { type: "Goodbye", text: "再见！ (Zàijiàn!)", phonetic: "zeye-JYEHN", bcp47: "zh-CN" },
      { type: "How are you?", text: "你好吗？ / 最近怎么样？ (Nǐ hǎo ma?)", phonetic: "nee HOW mah", bcp47: "zh-CN" }
    ],
    funFact: "While spoken Chinese varieties like Cantonese, Mandarin, and Shanghainese are as phonetically different as Spanish is from German, their speakers can effortlessly read the exact same written text thanks to the shared logographic Chinese character system!"
  },

  IND: {
    name: "India",
    officialName: "Republic of India",
    nativeName: "भारत (Bhārat)",
    flag: "🇮🇳",
    capital: "New Delhi",
    population: "1.43 Billion",
    continent: "Asia",
    primaryLanguage: "Hindi & English",
    languageFamily: "Indo-European / Dravidian",
    subFamily: "Indo-Aryan / Dravidian",
    diversityLevel: "Extreme Linguistic Diversity (400+ Languages)",
    summary: "India has no single 'national language'. The Indian Constitution recognizes Hindi and English as official languages of the Union government, and enumerates 22 Scheduled Languages representing the Indo-Aryan, Dravidian, Austroasiatic, and Tibeto-Burman families.",
    languages: [
      { name: "Hindi", nativeName: "हिन्दी", type: "Official Union Language", percentage: "43.6%", speakers: "600M", family: "Indo-European (Indo-Aryan)", script: "Devanagari", bcp47: "hi-IN", regions: "Northern & Central India (Hindi Belt)", notes: "Third most spoken language in the world, standardized on Khariboli dialect." },
      { name: "English (Indian)", nativeName: "Indian English", type: "Official Subsidiary Union Language", percentage: "10.0%", speakers: "140M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-IN", regions: "Nationwide (Judiciary, Higher Education, Tech)", notes: "Widely used link language across linguistic borders; rich distinctive idiom and retroflex consonants." },
      { name: "Bengali", nativeName: "বাংলা (Bangla)", type: "Eighth Schedule Language", percentage: "8.0%", speakers: "110M", family: "Indo-European (Indo-Aryan)", script: "Bengali-Assamese", bcp47: "bn-IN", regions: "West Bengal, Tripura", notes: "Nobel laureate Rabindranath Tagore's language, celebrated for its rich literary tradition." },
      { name: "Telugu", nativeName: "తెలుగు", type: "Eighth Schedule Language (Classical)", percentage: "6.7%", speakers: "90M", family: "Dravidian", script: "Telugu Script", bcp47: "te-IN", regions: "Andhra Pradesh, Telangana", notes: "Famous for vowel endings on every word, earning it the moniker 'Italian of the East'." },
      { name: "Marathi", nativeName: "मराठी", type: "Eighth Schedule Language", percentage: "6.9%", speakers: "95M", family: "Indo-European (Indo-Aryan)", script: "Devanagari", bcp47: "mr-IN", regions: "Maharashtra (Mumbai, Pune)", notes: "Official language of India's financial capital and the historic Maratha Empire." },
      { name: "Tamil", nativeName: "தமிழ்", type: "Eighth Schedule Language (Classical)", percentage: "5.7%", speakers: "80M", family: "Dravidian", script: "Tamil Script", bcp47: "ta-IN", regions: "Tamil Nadu, Puducherry", notes: "One of the world's longest-surviving classical languages, with Sangam literature over 2,000 years old." },
      { name: "Urdu", nativeName: "اردو", type: "Eighth Schedule Language", percentage: "4.2%", speakers: "58M", family: "Indo-European (Indo-Aryan)", script: "Perso-Arabic (Nastaliq)", bcp47: "ur-IN", regions: "Uttar Pradesh, Bihar, Telangana, Jammu & Kashmir", notes: "Mutually intelligible with spoken Hindi, but written in Nastaliq script with Persian and Arabic vocabulary." }
    ],
    accents: [
      { name: "Bambaiya Hindi / Hinglish", region: "Mumbai Metropolitan Area", description: "Vibrant melting pot blend of Hindi, Marathi, Gujarati, English, and Bollywood street culture.", sample: "Kya bolti public? Bindaas aane ka, tension nahi lene ka!" },
      { name: "South Indian English", region: "Tamil Nadu, Karnataka, Kerala", description: "Crisp retroflex consonants, syllable-timed cadence, distinctive idioms ('do the needful', 'out of station').", sample: "Please kindly revert back at the earliest, no problem at all." },
      { name: "Punjabi-Influenced Hindi", region: "Delhi, Punjab, Haryana", description: "Robust energetic pitch, tonal pitch contour, use of 'paaji' and hearty greetings.", sample: "Oye paaji, chak de phatte! Ki haal chaal hai?" },
      { name: "Kolkata Bengali-English", region: "Kolkata & West Bengal", description: "Melodic rounded vowels (a -> o), non-rhotic English, intellectual 'adda' coffee-house banter.", sample: "Nomoshkar! Let us sit down and discuss literature over chai." }
    ],
    phrases: [
      { type: "Greeting", text: "नमस्ते / नमस्कार ! (Namaste / Namaskar!)", phonetic: "nah-mahs-TAY", bcp47: "hi-IN" },
      { type: "Thank You", text: "धन्यवाद / शुक्रिया ! (Dhanyavaad / Shukriya!)", phonetic: "dhahn-yuh-VAHD / shook-ree-YAH", bcp47: "hi-IN" },
      { type: "Goodbye", text: "फिर मिलेंगे / अलविदा (Phir milenge / Alvida)", phonetic: "feer mee-LENG-gay", bcp47: "hi-IN" },
      { type: "How are you?", text: "आप कैसे हैं? (Aap kaise hain?)", phonetic: "ahp KAI-say hain", bcp47: "hi-IN" }
    ],
    funFact: "India's paper currency notes feature the denomination printed in 15 different official scripts on the reverse side, and 2 in the front (Hindi and English), embodying its extraordinary linguistic democracy!"
  },

  // === AFRICA ===
  NGA: {
    name: "Nigeria",
    officialName: "Federal Republic of Nigeria",
    nativeName: "Nigeria",
    flag: "🇳🇬",
    capital: "Abuja",
    population: "220 Million",
    continent: "Africa",
    primaryLanguage: "English & Nigerian Pidgin",
    languageFamily: "Niger-Congo / Afroasiatic",
    subFamily: "Atlantic-Congo / Chadic",
    diversityLevel: "Extreme Linguistic Diversity (500+ Languages)",
    summary: "Nigeria is Africa's most linguistically diverse nation with over 500 indigenous languages. English is the official language, while Nigerian Pidgin serves as the beloved nationwide lingua franca alongside major languages Hausa, Yoruba, and Igbo.",
    languages: [
      { name: "English (Nigerian)", nativeName: "Nigerian English", type: "Official National Language", percentage: "53.0%", speakers: "115M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-NG", regions: "Nationwide (Government, Education, Media)", notes: "Official language uniting the federation across ethnic lines." },
      { name: "Nigerian Pidgin (Naija)", nativeName: "Naijá", type: "De Facto Lingua Franca", percentage: "60.0%", speakers: "130M", family: "English-based Creole", script: "Latin", bcp47: "en-NG", regions: "Lagos, Niger Delta, Urban centers nationwide", notes: "Vibrant creole with its own BBC news service (BBC News Pidgin) and global Afrobeats reach." },
      { name: "Hausa", nativeName: "Harshen Hausa (هَوُسَ)", type: "Major Indigenous National Language", percentage: "25.0%", speakers: "55M", family: "Afroasiatic (Chadic)", script: "Boko (Latin) / Ajami (Arabic)", bcp47: "ha-NG", regions: "Northern Nigeria (Kano, Kaduna, Sokoto)", notes: "Major trans-Sahelian trade language spoken across West Africa." },
      { name: "Yoruba", nativeName: "Èdè Yorùbá", type: "Major Indigenous National Language", percentage: "21.0%", speakers: "46M", family: "Niger-Congo (Defoid)", script: "Latin (with tonal diacritics)", bcp47: "yo-NG", regions: "Southwestern Nigeria (Lagos, Ibadan, Ogun)", notes: "Three-tone language that influenced Afro-Cuban and Brazilian candomblé traditions." },
      { name: "Igbo", nativeName: "Asụsụ Igbo", type: "Major Indigenous National Language", percentage: "18.0%", speakers: "39M", family: "Niger-Congo (Igboid)", script: "Latin (Onwu orthography)", bcp47: "ig-NG", regions: "Southeastern Nigeria (Enugu, Onitsha, Owerri)", notes: "Tonal language famous for rich proverbs: 'Proverbs are the palm-oil with which words are eaten'." }
    ],
    accents: [
      { name: "Lagos Street / Nigerian Pidgin", region: "Lagos Megacity", description: "High-energy, percussive rhythm, use of 'sha', 'abi', 'wetin', 'wahala', universal in music and street culture.", sample: "How you dey my guy? No wahala at all, we dey gidigba!" },
      { name: "Hausa-Influenced English", region: "Northern Nigeria", description: "Glottal stops, rolled 'r', deliberate pacing, honorific greetings (Ranka ya dade).", sample: "Sannu! You are welcome, may God bless your journey." },
      { name: "Yoruba-Influenced English", region: "Ibadan, Lagos, Abeokuta", description: "Melodic tonal shifts, prominent vowel elongation, addition of 'o' at ends of sentences.", sample: "Good morning o! Come and eat, the food is ready." },
      { name: "Igbo-Influenced English", region: "Enugu, Imo, Anambra", description: "Distinctive rhythm, heavy syllable emphasis, interjections like 'kwanu' and 'nna'.", sample: "Nna eh, look at this brother! Everything will be fine, biko." }
    ],
    phrases: [
      { type: "Greeting (Pidgin)", text: "How you dey? / Wetin dey happen?", phonetic: "how yoo DAY / weh-teen day hah-pen", bcp47: "en-NG" },
      { type: "Thank You (Yoruba)", text: "Ẹ ṣeé púpọ̀! (Thank you very much)", phonetic: "eh shay POO-poh", bcp47: "yo-NG" },
      { type: "Thank You (Hausa)", text: "Na gode kwarai! (Thank you so much)", phonetic: "nah GOH-day kwah-rye", bcp47: "ha-NG" },
      { type: "Goodbye (Igbo)", text: "Ka ọ dị! (Goodbye / Until next time)", phonetic: "kah oh DEE", bcp47: "ig-NG" }
    ],
    funFact: "BBC News established a dedicated 'BBC News Pidgin' service based in Lagos, writing full journalistic news articles entirely in Nigerian Pidgin English to reach tens of millions of readers across West Africa!"
  },

  ZAF: {
    name: "South Africa",
    officialName: "Republic of South Africa",
    nativeName: "South Africa / Suid-Afrika",
    flag: "🇿🇦",
    capital: "Pretoria / Cape Town / Bloemfontein",
    population: "60 Million",
    continent: "Africa",
    primaryLanguage: "Zulu, Xhosa, Afrikaans & English",
    languageFamily: "Niger-Congo / Indo-European",
    subFamily: "Bantu / Germanic",
    diversityLevel: "12 Official Languages (Constitutional Rainbow Nation)",
    summary: "South Africa boasts 12 constitutional official languages (including South African Sign Language recognized in 2023). Zulu and Xhosa are the most widely spoken native languages, while English serves as the primary language of commerce and government.",
    languages: [
      { name: "isiZulu (Zulu)", nativeName: "isiZulu", type: "Official Constitutional Language", percentage: "24.7%", speakers: "15M", family: "Niger-Congo (Bantu / Nguni)", script: "Latin", bcp47: "zu-ZA", regions: "KwaZulu-Natal, Gauteng (Johannesburg)", notes: "Features three distinct click consonants (c, q, x) borrowed from Khoisan languages." },
      { name: "isiXhosa (Xhosa)", nativeName: "isiXhosa", type: "Official Constitutional Language", percentage: "15.7%", speakers: "9.5M", family: "Niger-Congo (Bantu / Nguni)", script: "Latin", bcp47: "xh-ZA", regions: "Eastern Cape, Western Cape (Cape Town)", notes: "Famous for complex click consonants, spoken by Nelson Mandela and Miriam Makeba." },
      { name: "Afrikaans", nativeName: "Afrikaans", type: "Official Constitutional Language", percentage: "12.1%", speakers: "7.2M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "af-ZA", regions: "Western Cape, Northern Cape, Gauteng", notes: "Daughter language of 17th-century Dutch, with simplified grammar, double negatives, and Malay/Khoi influences." },
      { name: "English (South African)", nativeName: "South African English", type: "Official Constitutional Language", percentage: "8.9%", speakers: "5.5M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-ZA", regions: "Urban centers nationwide", notes: "Universal link language in business and politics; incorporates terms like 'braai', 'howzit', 'now-now'." },
      { name: "Sepedi (Northern Sotho)", nativeName: "Sepedi", type: "Official Constitutional Language", percentage: "9.8%", speakers: "6M", family: "Niger-Congo (Bantu / Sotho-Tswana)", script: "Latin", bcp47: "en-ZA", regions: "Limpopo, Mpumalanga, Gauteng", notes: "Major language of the northeastern provinces." },
      { name: "Setswana (Tswana)", nativeName: "Setswana", type: "Official Constitutional Language", percentage: "8.9%", speakers: "5.5M", family: "Niger-Congo (Bantu / Sotho-Tswana)", script: "Latin", bcp47: "tn-ZA", regions: "North West Province, Northern Cape", notes: "National language of neighboring Botswana and official in South Africa." }
    ],
    accents: [
      { name: "White South African English", region: "Johannesburg, Durban, Cape Town", description: "Non-rhotic, pin-pen merger, unique vowel shifts ('yes' sounds like 'yis'), use of 'lekker' and 'shame'.", sample: "Howzit boet! We're having a lekker braai this weekend, tune me if you're coming." },
      { name: "Cape Flats / Coloured Afrikaans", region: "Cape Town (Cape Flats)", description: "Rapid, melodic hybrid of English and Afrikaans (Kaaps), distinctive rhythmic punch and slang.", sample: "Aweh my broe! Duidelik, everything is mos reg!" },
      { name: "Black South African English", region: "Gauteng, KwaZulu-Natal", description: "Syllable-timed, clear open vowels, resonant pitch, incorporating indigenous conversational markers.", sample: "Yoh! It's too hot today my friend, sharp sharp!" }
    ],
    phrases: [
      { type: "Greeting (Zulu)", text: "Sawubona! (I see you / Hello)", phonetic: "sah-woo-BOH-nah", bcp47: "zu-ZA" },
      { type: "Greeting (Afrikaans)", text: "Hallo! / Goeiemôre! / Howzit!", phonetic: "HAH-loh / khooy-eh-MOR-eh", bcp47: "af-ZA" },
      { type: "Thank You (Xhosa)", text: "Enkosi kakhulu! (Thank you very much)", phonetic: "en-KOH-see kah-KOO-loo", bcp47: "xh-ZA" },
      { type: "Goodbye (Zulu)", text: "Sala kahle (Stay well) / Hamba kahle (Go well)", phonetic: "SAH-lah KAH-tlay / HAHM-bah KAH-tlay", bcp47: "zu-ZA" }
    ],
    funFact: "South Africa's national anthem combines verses in five different languages: Xhosa, Zulu, Sesotho, Afrikaans, and English—transitioning seamlessly between different musical keys and languages!"
  },

  // === OCEANIA ===
  AUS: {
    name: "Australia",
    officialName: "Commonwealth of Australia",
    nativeName: "Australia",
    flag: "🇦🇺",
    capital: "Canberra",
    population: "26 Million",
    continent: "Oceania",
    primaryLanguage: "English (Australian)",
    languageFamily: "Indo-European (Germanic)",
    subFamily: "Germanic",
    diversityLevel: "Diverse Indigenous Heritage & Immigrant Languages",
    summary: "Australian English is famous for its distinctive vowel shifts, extensive hypocoristics (abbreviating words with -o or -ie, like 'arvo' and 'barbie'), and high rising terminal intonation.",
    languages: [
      { name: "English (Australian)", nativeName: "Australian English", type: "De Facto National", percentage: "72.0%", speakers: "19M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-AU", regions: "Nationwide", notes: "Evolved from Cockney and Irish English spoken by early penal colony settlers." },
      { name: "Aboriginal & Torres Strait Languages", nativeName: "Kriol / Yumplatok / Warlpiri / Yolŋu", type: "Indigenous Heritage Languages", percentage: "0.8%", speakers: "75K", family: "Pama-Nyungan / Non-Pama-Nyungan", script: "Latin", bcp47: "en-AU", regions: "Northern Territory, Western Australia, Queensland", notes: "Over 250 distinct languages existed prior to European arrival; vigorous revival movements are underway." },
      { name: "Mandarin Chinese", nativeName: "中文", type: "Major Immigrant Language", percentage: "2.7%", speakers: "700K", family: "Sino-Tibetan", script: "Simplified / Traditional Han", bcp47: "zh-CN", regions: "Sydney, Melbourne, Brisbane", notes: "The most widely spoken language at home in Australia after English." },
      { name: "Arabic & Vietnamese", nativeName: "العربية / Tiếng Việt", type: "Major Immigrant Languages", percentage: "2.6%", speakers: "680K", family: "Afroasiatic / Austroasiatic", script: "Arabic / Latin", bcp47: "ar-SA", regions: "Western Sydney, Melbourne", notes: "Prominent communities with extensive community schools and bilingual media." }
    ],
    accents: [
      { name: "General Australian", region: "Major Metros (Sydney, Melbourne, Brisbane)", description: "The standard spoken by the majority: non-rhotic, /aɪ/ vowel widened, high rising intonation question pitch.", sample: "G'day mate, how's it going? Grab an iced coffee from the servo." },
      { name: "Broad Australian", region: "Rural / Outback Australia (Bush)", description: "Stronger vowel elongation, slower nasal drawl, epitomized by Steve Irwin and Paul Hogan.", sample: "Fair dinkum, mate! That croc is an absolute beauty, no worries at all!" },
      { name: "Cultivated Australian", region: "Traditional Academic & Arts Circles", description: "Historically aligned closely with British Received Pronunciation, less common in contemporary speech.", sample: "One would certainly appreciate the theatrical production this evening." },
      { name: "Aboriginal English", region: "Indigenous Communities Nationwide", description: "Distinctive rhythm, grammatical features influenced by indigenous mother tongues, specific vocabulary ('mob', 'deadly').", sample: "That's deadly, sis! Whole mob is coming down for the corroboree." }
    ],
    phrases: [
      { type: "Greeting", text: "G'day mate! / How ya going?", phonetic: "guh-DAY mayt / how ya GOH-ing", bcp47: "en-AU" },
      { type: "Thank You", text: "Cheers mate! / Thanks heaps!", phonetic: "CHEERZ mayt / thanks HEEPS", bcp47: "en-AU" },
      { type: "Goodbye", text: "Hooroo! / Catch ya later!", phonetic: "HOO-roo / catch ya LAY-ter", bcp47: "en-AU" },
      { type: "How are you?", text: "How's things? / No worries?", phonetic: "howz things / noh WUH-reez", bcp47: "en-AU" }
    ],
    funFact: "Australians are the world's champions of linguistic abbreviations (hypocoristics): breakfast becomes 'brekkie', afternoon becomes 'arvo', barbecue becomes 'barbie', and avocado becomes 'avo'!"
  },

  PNG: {
    name: "Papua New Guinea",
    officialName: "Independent State of Papua New Guinea",
    nativeName: "Papua Niugini",
    flag: "🇵🇬",
    capital: "Port Moresby",
    population: "10 Million",
    continent: "Oceania",
    primaryLanguage: "Tok Pisin & Hiri Motu",
    languageFamily: "Papuan / Austronesian",
    subFamily: "Trans-New Guinea / Creole",
    diversityLevel: "Highest Linguistic Diversity in the World (840+ Languages)",
    summary: "Papua New Guinea is undisputed as the most linguistically diverse place on planet Earth. With over 840 living indigenous languages spoken across rugged mountain valleys and dense jungles, it contains roughly 12% of all languages on Earth in a single country!",
    languages: [
      { name: "Tok Pisin", nativeName: "Tok Pisin", type: "Official National Lingua Franca", percentage: "70.0%", speakers: "6M", family: "English-based Creole", script: "Latin", bcp47: "en-GB", regions: "Nationwide (Northern regions & Highlands)", notes: "Highly expressive creole developed on Pacific plantations; official language in parliament." },
      { name: "English", nativeName: "English", type: "Official Constitutional Language", percentage: "2.0%", speakers: "200K", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-PG", regions: "Government, Education, Courts", notes: "Official language of higher schooling and formal law." },
      { name: "Hiri Motu", nativeName: "Hiri Motu", type: "Official Constitutional Language", percentage: "3.0%", speakers: "120K", family: "Motu-based Pidgin", script: "Latin", bcp47: "en-PG", regions: "Southern coastal regions around Port Moresby", notes: "Historic trading pidgin of the Motu sea expeditions (Hiri voyages)." },
      { name: "Papuan & Austronesian Indigenous (840+)", nativeName: "Enga, Melpa, Huli, Kuman", type: "Indigenous Mother Tongues", percentage: "85.0%", speakers: "8M", family: "Trans-New Guinea & Oceanic", script: "Oral traditions / Latin", bcp47: "en-PG", regions: "Highlands, Sepik, New Britain, Bougainville", notes: "Enga is the largest indigenous language with ~230,000 speakers; hundreds have fewer than 1,000 speakers." }
    ],
    accents: [
      { name: "Highlands Tok Pisin", region: "Western & Eastern Highlands", description: "Fast, energetic tempo with deep glottal rhythm and indigenous phonetic substrate.", sample: "Gude tru wantok! Yu stap gut o nogat?" },
      { name: "Coastal & Islands Tok Pisin", region: "Madang, Rabaul, Manus", description: "Melodic, vowel-rich cadence influenced by Austronesian oceanic languages.", sample: "Em nau, mipela go long solwara nau tasol." }
    ],
    phrases: [
      { type: "Greeting", text: "Gude wantok! (Hello friend / one-talk!)", phonetic: "goo-DAY wahn-TOHK", bcp47: "en-PG" },
      { type: "Thank You", text: "Tenkyu tru! (Thank you very much!)", phonetic: "ten-KYOO troo", bcp47: "en-PG" },
      { type: "Goodbye", text: "Lukim yu bihain! (See you later!)", phonetic: "loo-keem yoo bee-HYNE", bcp47: "en-PG" },
      { type: "How are you?", text: "Yu stap gut? (Are you doing well?)", phonetic: "yoo stahp goot", bcp47: "en-PG" }
    ],
    funFact: "Papua New Guinea is home to over 840 distinct languages! Two villages separated by only a single mountain ridge often speak completely unrelated languages from entirely different language families."
  }
};

