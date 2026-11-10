// scripts/countries_americas.js
module.exports = {
  USA: {
    iso3: "USA", iso2: "US", geoName: "United States of America", commonName: "United States",
    officialName: "United States of America", nativeName: "United States", flag: "🇺🇸",
    capital: "Washington, D.C.", population: "335 Million", continent: "North America",
    primaryLanguage: "English (American)", languageFamily: "Indo-European (Germanic)",
    diversityLevel: "High Linguistic Diversity (350+ Languages)",
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
    iso3: "CAN", iso2: "CA", geoName: "Canada", commonName: "Canada",
    officialName: "Canada", nativeName: "Canada", flag: "🇨🇦",
    capital: "Ottawa", population: "39 Million", continent: "North America",
    primaryLanguage: "English & French", languageFamily: "Indo-European (Germanic)",
    diversityLevel: "Federally Bilingual (English & French)",
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
    iso3: "MEX", iso2: "MX", geoName: "Mexico", commonName: "Mexico",
    officialName: "United Mexican States", nativeName: "México", flag: "🇲🇽",
    capital: "Mexico City", population: "128 Million", continent: "North America",
    primaryLanguage: "Spanish (Mexican)", languageFamily: "Indo-European (Romance)",
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

  BRA: {
    iso3: "BRA", iso2: "BR", geoName: "Brazil", commonName: "Brazil",
    officialName: "Federative Republic of Brazil", nativeName: "Brasil", flag: "🇧🇷",
    capital: "Brasília", population: "216 Million", continent: "South America",
    primaryLanguage: "Portuguese (Brazilian)", languageFamily: "Indo-European (Romance)",
    diversityLevel: "High Regional & Indigenous Diversity (200+ Indigenous)",
    summary: "Brazil is the only Portuguese-speaking nation in the Americas. Brazilian Portuguese is renowned for its open, musical vowels, palatalization, and incorporation of Tupi-Guarani and African loanwords.",
    languages: [
      { name: "Portuguese (Brazilian)", nativeName: "Português brasileiro", type: "Official Sole Language", percentage: "98.5%", speakers: "214M", family: "Indo-European (Romance)", script: "Latin", bcp47: "pt-BR", regions: "Nationwide", notes: "Grammatically and phonetically distinct from European Portuguese; official language since colonial times." },
      { name: "Indigenous Languages (Guarani, Yanomami, Tikuna)", nativeName: "Tupi-Guarani / Nheengatu", type: "Recognized Co-official Municipally", percentage: "0.4%", speakers: "300K", family: "Tupian / Macro-Jê / Arawakan", script: "Latin", bcp47: "pt-BR", regions: "Amazon Basin, São Gabriel da Cachoeira", notes: "São Gabriel da Cachoeira in Amazonas co-recognizes Nheengatu, Tukano, and Baniwa as official." },
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
    iso3: "ARG", iso2: "AR", geoName: "Argentina", commonName: "Argentina",
    officialName: "Argentine Republic", nativeName: "Argentina", flag: "🇦🇷",
    capital: "Buenos Aires", population: "46 Million", continent: "South America",
    primaryLanguage: "Spanish (Rioplatense)", languageFamily: "Indo-European (Romance)",
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

  COL: {
    iso3: "COL", iso2: "CO", geoName: "Colombia", commonName: "Colombia",
    officialName: "Republic of Colombia", nativeName: "Colombia", flag: "🇨🇴",
    capital: "Bogotá", population: "52 Million", continent: "South America",
    primaryLanguage: "Spanish (Colombian)", languageFamily: "Indo-European (Romance)",
    diversityLevel: "Multilingual (68 Indigenous & Creole Languages)",
    summary: "Colombian Spanish—especially the highland Bogotano dialect—is internationally celebrated for its clear enunciation and preservation of classical grammar. The country also recognizes 65 indigenous languages and two creoles.",
    languages: [
      { name: "Spanish", nativeName: "Español colombiano", type: "Official National", percentage: "99.0%", speakers: "51M", family: "Indo-European (Romance)", script: "Latin", bcp47: "es-CO", regions: "Nationwide", notes: "Standard Bogotano Spanish is widely regarded as one of the clearest and most melodic forms of Spanish." },
      { name: "Wayuu (Wayuunaiki)", nativeName: "Wayuunaiki", type: "Official Regional Indigenous", percentage: "0.8%", speakers: "400K", family: "Arawakan", script: "Latin", bcp47: "es-CO", regions: "La Guajira Peninsula", notes: "The most widely spoken indigenous language in Colombia, spoken by the nomadic Wayuu people." },
      { name: "Palenquero Creole", nativeName: "Palenquero", type: "Official Local Creole", percentage: "0.01%", speakers: "4K", family: "Spanish-Bantu Creole", script: "Latin", bcp47: "es-CO", regions: "San Basilio de Palenque", notes: "The only Spanish-based creole language in the Americas, declared Intangible Cultural Heritage by UNESCO." },
      { name: "San Andrés Creole (Kriol)", nativeName: "Raizal Creole", type: "Official Regional Creole", percentage: "0.1%", speakers: "30K", family: "English-based Creole", script: "Latin", bcp47: "en-US", regions: "Archipelago of San Andrés, Providencia and Santa Catalina", notes: "English-derived creole spoken by the indigenous Raizal islanders." }
    ],
    accents: [
      { name: "Rolo / Bogotano", region: "Bogotá & Cundinamarca", description: "Careful, clear articulation, preservation of 's', formal use of 'usted' even among close family members.", sample: "¿Qué hubo, mi hermano? ¿Quiere tomarse un tintico calientico?" },
      { name: "Paisa", region: "Medellín, Antioquia, Coffee Region", description: "Warm, sing-song intonation, frequent voseo ('vos sabés'), diminutives ('chiquitico'), use of 'parce' / 'parcero'.", sample: "¡Eh ave maría pues! ¿Bien o no parce? ¡Hágale con ganas!" },
      { name: "Costeño", region: "Barranquilla, Cartagena, Santa Marta", description: "Fast Caribbean tempo, aspiration and omission of final 's', lively cadence influenced by salsa and vallenato.", sample: "¡Ajá, cuadro! ¿Cómo e' la vaina? Vamos pa' la playa." },
      { name: "Caleño", region: "Cali & Valle del Cauca", description: "Characteristic melodic drag, voseo, nasal transitions, world capital of salsa speech.", sample: "¿Mirá vé, vamos a rumbear a Juanchito esta noche?" }
    ],
    phrases: [
      { type: "Greeting", text: "¡Hola! / ¿Qué más?", phonetic: "OH-lah / kay MAHS", bcp47: "es-CO" },
      { type: "Thank You", text: "Muchas gracias / Dios le pague", phonetic: "MOO-chahs GRAH-syahs", bcp47: "es-CO" },
      { type: "Goodbye", text: "¡Hasta luego! / ¡Que esté bien!", phonetic: "AHS-tah LWEH-goh", bcp47: "es-CO" },
      { type: "How are you?", text: "¿Cómo estás? / ¿Bien o qué?", phonetic: "KOH-moh ehs-TAHS / byehn oh kay", bcp47: "es-CO" }
    ],
    funFact: "San Basilio de Palenque in northern Colombia was the first free African town in the Americas (founded in 1603 by runaway enslaved people) and developed Palenquero, the only Spanish-Bantu creole language on the planet!"
  },

  PER: {
    iso3: "PER", iso2: "PE", geoName: "Peru", commonName: "Peru",
    officialName: "Republic of Peru", nativeName: "Perú", flag: "🇵🇪",
    capital: "Lima", population: "34 Million", continent: "South America",
    primaryLanguage: "Spanish & Quechua", languageFamily: "Indo-European / Quechuan",
    diversityLevel: "Multilingual Constitutional (Spanish, Quechua, Aymara)",
    summary: "Peru is constitutionally plurilingual: Spanish is official alongside Quechua, Aymara, and indigenous Amazonian languages where they predominate. Quechua was the imperial language of the Inca civilization.",
    languages: [
      { name: "Spanish (Peruvian)", nativeName: "Español peruano", type: "Official Constitutional", percentage: "82.6%", speakers: "28M", family: "Indo-European (Romance)", script: "Latin", bcp47: "es-PE", regions: "Coast and Urban Centers nationwide", notes: "Coastal Limeño Spanish is noted for clear diction and lack of strong regional melody." },
      { name: "Quechua (Runa Simi)", nativeName: "Runa Simi", type: "Official Constitutional Language", percentage: "13.9%", speakers: "3.8M", family: "Quechuan", script: "Latin", bcp47: "es-PE", regions: "Andean Highlands (Cusco, Ayacucho, Puno, Apurímac)", notes: "The state language of the Inca Empire (Tawantinsuyu); the most spoken indigenous language family in the Americas." },
      { name: "Aymara", nativeName: "Aymar aru", type: "Official Constitutional Language", percentage: "1.7%", speakers: "500K", family: "Aymaran", script: "Latin", bcp47: "es-PE", regions: "Lake Titicaca Region (Puno, Moquegua, Tacna)", notes: "Unique for its trivalent logic system and conceiving the past as 'in front of us' (since we can see it)." },
      { name: "Amazonian Languages (Asháninka, Awajún, Shipibo)", nativeName: "Asháninka / Awajún", type: "Official Indigenous Regional", percentage: "0.8%", speakers: "220K", family: "Arawakan / Jivaroan / Panoan", script: "Latin", bcp47: "es-PE", regions: "Peruvian Amazon Rainforest", notes: "Over 40 indigenous languages flourish along the tributaries of the Amazon river." }
    ],
    accents: [
      { name: "Limeño (Coastal Peruvian)", region: "Lima & Central Coast", description: "Moderate pacing, clear consonant clusters, polite mannerisms, famous slang (pata, chévere, asu mare).", sample: "¡Asu mare, qué paja! Oye pata, vamos a comer un rico cebichito." },
      { name: "Andino (Highland Spanish)", region: "Cusco, Puno, Arequipa", description: "Influence of Quechua/Aymara phonology: vowel reduction (e->i, o->u), double possessives ('de mi mamá su casa').", sample: "Vente pues, aquicito nomás estamos llegando a la plaza." },
      { name: "Amazónico (Selva Spanish)", region: "Iquitos, Tarapoto, Pucallpa", description: "Melodic pitch, sibilant transformation of 'f' and 'j' into a soft aspirated breath, unique vocabulary.", sample: "¡Ay diosito! Vamos al río a pescar paiche con la choche." }
    ],
    phrases: [
      { type: "Greeting (Spanish)", text: "¡Hola! / ¿Qué tal?", phonetic: "OH-lah / kay TAHL", bcp47: "es-PE" },
      { type: "Greeting (Quechua)", text: "Allillanchu! (Are you well?)", phonetic: "ah-yee-yahn-CHOO", bcp47: "es-PE" },
      { type: "Thank You (Quechua)", text: "Sulpayki! / Añay! (Thank you)", phonetic: "sool-PYE-kee / ah-NYE", bcp47: "es-PE" },
      { type: "Goodbye (Quechua)", text: "Tupananchiskama! (Until we meet again)", phonetic: "too-pah-nahn-chees-KAH-mah", bcp47: "es-PE" }
    ],
    funFact: "In the Aymara language of Peru and Bolivia, the future is described as being BEHIND you (because it is unknown and unseen), while the past is in FRONT of you (because you can already see and remember it)!"
  },

  CHL: {
    iso3: "CHL", iso2: "CL", geoName: "Chile", commonName: "Chile",
    officialName: "Republic of Chile", nativeName: "Chile", flag: "🇨🇱",
    capital: "Santiago", population: "19.5 Million", continent: "South America",
    primaryLanguage: "Spanish (Chilean)", languageFamily: "Indo-European (Romance)",
    diversityLevel: "Highly Distinct Dialect & Indigenous Mapudungun",
    summary: "Chilean Spanish is widely considered the fastest and most distinctive variety in Latin America, characterized by rapid tempo, dropping of final consonants, specialized conjugations ('cachái', 'estái'), and indigenous Mapuche loanwords.",
    languages: [
      { name: "Spanish (Chilean)", nativeName: "Español chileno", type: "National De Facto", percentage: "97.0%", speakers: "19M", family: "Indo-European (Romance)", script: "Latin", bcp47: "es-CL", regions: "Nationwide", notes: "Unique verbal voseo (tú cachái, tú soi), rapid intonation, and extensive Mapudungun substrate." },
      { name: "Mapudungun (Mapuche)", nativeName: "Mapudungun", type: "Recognized Regional Indigenous", percentage: "1.0%", speakers: "150K", family: "Araucanian", script: "Latin", bcp47: "es-CL", regions: "Araucanía, Biobío, Los Lagos", notes: "Language of the Mapuche people who famously resisted Incan and Spanish conquest for centuries." },
      { name: "Rapa Nui", nativeName: "Vananga Rapa Nui", type: "Official Regional (Easter Island)", percentage: "0.02%", speakers: "3.5K", family: "Austronesian (Polynesian)", script: "Latin", bcp47: "es-CL", regions: "Rapa Nui (Easter Island)", notes: "Eastern Polynesian language spoken on Easter Island; closely related to Hawaiian and Tahitian." }
    ],
    accents: [
      { name: "Chileno Central (Santiago)", region: "Santiago & Valparaíso", description: "Extremely fast tempo, dropping of /s/ and /d/ ('cansao', 'voh sabí'), ubiquitous particles 'po' and 'cachái'.", sample: "¡Wena po, weón! ¿Cachái lo que pasó ayer? ¡La dura!" },
      { name: "Chilote", region: "Chiloé Archipelago", description: "Archaic Andalusian and Galician vocabulary preserved by island geography, melodic rising pitch.", sample: "Ando con frío en las pataguas, vamos pa'l fogón." }
    ],
    phrases: [
      { type: "Greeting", text: "¡Hola! / ¡Wena!", phonetic: "OH-lah / WEH-nah", bcp47: "es-CL" },
      { type: "Thank You", text: "Muchas gracias / Vale", phonetic: "MOO-chahs GRAH-syahs / VAH-leh", bcp47: "es-CL" },
      { type: "Goodbye", text: "¡Chao! / ¡Nos vemos, po!", phonetic: "CHOW / nohs VEH-mohs, poh", bcp47: "es-CL" },
      { type: "How are you?", text: "¿Cómo estái? / ¿Todo bien?", phonetic: "KOH-moh ehs-TYE", bcp47: "es-CL" }
    ],
    funFact: "Chilean Spanish uses the particle 'po' (a contraction of 'pues') at the end of almost every statement ('sí po', 'ya po', 'no po'), giving Chilean conversations an unmistakable, affectionate rhythmic bounce!"
  },

  BOL: {
    iso3: "BOL", iso2: "BO", geoName: "Bolivia", commonName: "Bolivia",
    officialName: "Plurinational State of Bolivia", nativeName: "Bolivia", flag: "🇧🇴",
    capital: "Sucre / La Paz", population: "12 Million", continent: "South America",
    primaryLanguage: "Spanish, Quechua & Aymara", languageFamily: "Indigenous American / Romance",
    diversityLevel: "37 Constitutional Official Languages",
    summary: "Bolivia's 2009 Constitution officially recognizes 37 languages: Spanish alongside 36 distinct indigenous languages, making it one of the most constitutionally plurilingual states in world history.",
    languages: [
      { name: "Spanish (Bolivian)", nativeName: "Español boliviano", type: "Official Constitutional", percentage: "70.0%", speakers: "8.5M", family: "Indo-European (Romance)", script: "Latin", bcp47: "es-BO", regions: "Nationwide", notes: "Rich in Andean and Guaraní regionalisms; distinct highland and lowland varieties." },
      { name: "Quechua", nativeName: "Qhichwa simi", type: "Official Constitutional", percentage: "18.0%", speakers: "2.1M", family: "Quechuan", script: "Latin", bcp47: "es-BO", regions: "Cochabamba, Chuquisaca, Potosí", notes: "Widely spoken in valleys and mining communities; preserves ancient Incan poetry." },
      { name: "Aymara", nativeName: "Aymar aru", type: "Official Constitutional", percentage: "12.0%", speakers: "1.5M", family: "Aymaran", script: "Latin", bcp47: "es-BO", regions: "Altiplano, La Paz, Oruro", notes: "Dominant indigenous language of the high Andean plateau surrounding Lake Titicaca." },
      { name: "Guarani", nativeName: "Avañe'ẽ", type: "Official Constitutional", percentage: "0.8%", speakers: "80K", family: "Tupi-Guarani", script: "Latin", bcp47: "es-BO", regions: "Chaco Region (Santa Cruz, Tarija)", notes: "Spoken by the Guaraní people of the southeastern lowlands." }
    ],
    accents: [
      { name: "Paceño (Altiplano)", region: "La Paz & High Andes", description: "Polite, soft intonation, influenced by Aymara phonology, frequent use of diminutive '-ito' and 'pues'.", sample: "Buenas tardes caserita, ¿a cuánto me va a dar las papitas pues?" },
      { name: "Camba (Santa Cruz & Lowlands)", region: "Santa Cruz de la Sierra, Beni", description: "Tropical cadence, aspiration of 's', voseo, friendly and festive spirit.", sample: "¿Qué fue pariente? ¡Vamos a comer un buen churrasco, che!" }
    ],
    phrases: [
      { type: "Greeting (Aymara)", text: "Kamisaraki! (How are you?)", phonetic: "kah-mee-sah-RAH-kee", bcp47: "es-BO" },
      { type: "Response (Aymara)", text: "Walikipuniwa! (I am very well!)", phonetic: "wah-lee-kee-poo-NEE-wah", bcp47: "es-BO" },
      { type: "Thank You (Quechua)", text: "Yuspagarasunki! (God reward you / Thank you)", phonetic: "yoos-pah-gah-rah-SOON-kee", bcp47: "es-BO" },
      { type: "Goodbye (Aymara)", text: "Jikisiñkama! (Until we meet again)", phonetic: "hee-kee-seen-KAH-mah", bcp47: "es-BO" }
    ],
    funFact: "Bolivia holds the Guinness World Record for the largest number of official languages of any country in the world, with a staggering 37 official languages recognized in its constitution!"
  }
};

