// scripts/countries_europe.js
module.exports = {
  CHE: {
    iso3: "CHE", iso2: "CH", geoName: "Switzerland", commonName: "Switzerland",
    officialName: "Swiss Confederation", nativeName: "Schweiz / Suisse / Svizzera / Svizra", flag: "🇨🇭",
    capital: "Bern", population: "8.7 Million", continent: "Europe",
    primaryLanguage: "German (Swiss German), French & Italian", languageFamily: "Indo-European",
    diversityLevel: "High (Quadrilingual Constitutional)",
    summary: "Switzerland is famously pluricentric with four national languages, each dominating distinct cantonal regions without a single federal language imposing on another.",
    languages: [
      { name: "German (Swiss German)", nativeName: "Schwiizerdütsch / Deutsch", type: "Official (National)", percentage: "62.6%", speakers: "5.4M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "de-CH", regions: "Northern, Central, and Eastern Cantons (Zurich, Bern, Basel, Lucerne)", notes: "Diglossic: Swiss German Alemannic dialects are spoken daily, while Standard Swiss German is used for formal writing." },
      { name: "French", nativeName: "Français (Suisse romande)", type: "Official (National)", percentage: "22.9%", speakers: "2.0M", family: "Indo-European (Romance)", script: "Latin", bcp47: "fr-CH", regions: "Romandy (Geneva, Vaud, Neuchâtel, Jura, Valais, Fribourg)", notes: "Uses traditional number words like septante (70) and nonante (90) rather than French soixante-dix." },
      { name: "Italian", nativeName: "Italiano", type: "Official (National)", percentage: "8.2%", speakers: "700K", family: "Indo-European (Romance)", script: "Latin", bcp47: "it-CH", regions: "Ticino and Southern Graubünden valleys", notes: "Influenced by Swiss German administrative loanwords (e.g., natel for mobile phone)." },
      { name: "Romansh", nativeName: "Rumantsch", type: "Official National Language", percentage: "0.5%", speakers: "40K", family: "Indo-European (Rhaeto-Romance)", script: "Latin", bcp47: "rm-CH", regions: "Canton of Graubünden (Engadin and Surselva valleys)", notes: "Ancient Romance language descended from Vulgar Latin spoken by Roman garrisons in Rhaetia." }
    ],
    accents: [
      { name: "Züritüütsch (Zurich German)", region: "Zurich Canton", description: "Crisp, fast-paced Alemannic dialect with distinct intonation and rounded vowel shifts.", sample: "Grüezi mitenand! Wie gaht's eu hüt?" },
      { name: "Bärndütsch (Bernese German)", region: "Bern Canton & Highlands", description: "Characterized by l-vocalization (l becomes u, e.g., 'viu' for 'viel') and melodic elongation.", sample: "Äuä! Das isch aber öppis feins gsi!" },
      { name: "Walliserdütsch (Valais German)", region: "Upper Valais (Alps)", description: "Highest-altitude Alemannic dialect retaining archaic Old High German grammatical forms and vowel sounds.", sample: "Chrüt und Chabis! D'Alpe sind wunderschön." },
      { name: "Suisse Romand French", region: "Geneva, Lausanne", description: "Slightly slower cadence with distinctive lexical items (huitante for 80, poutser for cleaning).", sample: "C'est bonard! On se retrouve à la gare à huitante heures." }
    ],
    phrases: [
      { type: "Greeting (Swiss German)", text: "Grüezi! / Grüessech!", phonetic: "GROO-eh-tsee / GROO-eh-sehkh", bcp47: "de-CH" },
      { type: "Thank You (Swiss German)", text: "Merci vilmal! (Thanks a lot!)", phonetic: "MAIR-see feel-MAHL", bcp47: "de-CH" },
      { type: "Goodbye (Swiss German)", text: "Uf Wiederluege! / Tschüss!", phonetic: "oof VEE-der-loo-eh-geh", bcp47: "de-CH" },
      { type: "Greeting (Romansh)", text: "Allegra! / Bun di! (Good day!)", phonetic: "ah-LEH-grah / boon DEE", bcp47: "rm-CH" }
    ],
    funFact: "Swiss road signs change language right across cantonal borders, often within a single kilometer, with no border control whatsoever—moving from 'Sortie' in French to 'Ausfahrt' in German!"
  },

  GBR: {
    iso3: "GBR", iso2: "GB", geoName: "United Kingdom", commonName: "United Kingdom",
    officialName: "United Kingdom of Great Britain and Northern Ireland", nativeName: "United Kingdom", flag: "🇬🇧",
    capital: "London", population: "68 Million", continent: "Europe",
    primaryLanguage: "English (British)", languageFamily: "Indo-European (Germanic)",
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

  ESP: {
    iso3: "ESP", iso2: "ES", geoName: "Spain", commonName: "Spain",
    officialName: "Kingdom of Spain", nativeName: "España", flag: "🇪🇸",
    capital: "Madrid", population: "48 Million", continent: "Europe",
    primaryLanguage: "Spanish (Castilian)", languageFamily: "Indo-European (Romance)",
    diversityLevel: "Plurilingual (Castilian, Catalan, Galician, Basque)",
    summary: "Spain is constitutionally plurilingual under Article 3 of its 1978 Constitution. Castilian is the official state language, while Catalan, Galician, and Basque have co-official status in their respective autonomous communities.",
    languages: [
      { name: "Castilian Spanish (Castellano)", nativeName: "Español / Castellano", type: "Official State Language", percentage: "94.0%", speakers: "45M", family: "Indo-European (Romance)", script: "Latin", bcp47: "es-ES", regions: "Nationwide", notes: "Distinguished by 'ceceo/distinción' (pronouncing 'c' before e/i and 'z' as the unvoiced 'th' sound /θ/)." },
      { name: "Catalan / Valencian", nativeName: "Català / Valencià", type: "Co-official Regional Language", percentage: "17.0%", speakers: "9.5M", family: "Indo-European (Romance / Occitano-Romance)", script: "Latin", bcp47: "ca-ES", regions: "Catalonia, Valencian Community, Balearic Islands", notes: "Official language of Catalonia with full immersion education; closely related to southern French Occitan." },
      { name: "Galician (Galego)", nativeName: "Galego", type: "Co-official Regional Language", percentage: "6.0%", speakers: "2.8M", family: "Indo-European (Romance / Galician-Portuguese)", script: "Latin", bcp47: "gl-ES", regions: "Galicia (Santiago de Compostela, A Coruña)", notes: "Sister language to Portuguese, sharing the historic medieval Galician-Portuguese lyric tradition." },
      { name: "Basque (Euskara)", nativeName: "Euskara", type: "Co-official Language Isolate", percentage: "1.5%", speakers: "750K", family: "Language Isolate", script: "Latin", bcp47: "eu-ES", regions: "Basque Country (Euskadi) and Navarre", notes: "Europe's only pre-Indo-European survivor language, with complex ergative agglutinative grammar." },
      { name: "Asturleonese & Aragonese", nativeName: "Asturianu / Aragonés", type: "Recognized Protected Minority", percentage: "0.5%", speakers: "150K", family: "Indo-European (Romance)", script: "Latin", bcp47: "ast-ES", regions: "Asturias, northern Aragon", notes: "Protected under regional statutes of autonomy." }
    ],
    accents: [
      { name: "Castellano Central / Madrileño", region: "Madrid, Castile and León", description: "Distinción between /s/ and /θ/ (caza vs casa), strong uvular /x/ (jota), yeísmo, clear vowel structure.", sample: "¡Qué pasa macho! Venga, nos tomamos unas cañas en La Latina." },
      { name: "Andaluz", region: "Andalusia (Seville, Granada, Malaga)", description: "Dropping and aspiration of syllable-final /s/, seseo or ceceo, loss of intervocalic /d/, rhythmic musicality.", sample: "¡Ozú qué caló! Vamo a comé un gazpachito fresquito en la playa." },
      { name: "Canario", region: "Canary Islands", description: "Phonetically closer to Caribbean Spanish: seseo, aspiration of /s/, use of 'ustedes' instead of 'vosotros', Guanche vocabulary.", sample: "¿Qué hubo mis niños? Miren qué ricas estas papas arrugadas con mojo." }
    ],
    phrases: [
      { type: "Greeting (Castilian)", text: "¡Hola! / ¿Qué tal?", phonetic: "OH-lah / kay TAHL", bcp47: "es-ES" },
      { type: "Greeting (Catalan)", text: "Hola! / Bon dia! (Good day!)", phonetic: "OH-lah / bon DEE-ah", bcp47: "ca-ES" },
      { type: "Thank You (Basque)", text: "Eskerrik asko! (Thank you very much)", phonetic: "es-KEH-reek AHS-koh", bcp47: "eu-ES" },
      { type: "Goodbye (Galician)", text: "Ata logo! (See you later!)", phonetic: "AH-tah LOH-goh", bcp47: "gl-ES" }
    ],
    funFact: "Euskara (Basque) is the oldest living language in Europe. Linguists have tested every known language family across the globe, and Basque has no genetic relationship to ANY other living language!"
  },

  ITA: {
    iso3: "ITA", iso2: "IT", geoName: "Italy", commonName: "Italy",
    officialName: "Italian Republic", nativeName: "Italia", flag: "🇮🇹",
    capital: "Rome", population: "59 Million", continent: "Europe",
    primaryLanguage: "Italian (Italiano)", languageFamily: "Indo-European (Romance)",
    diversityLevel: "Extreme Dialect/Regional Language Diversity (30+ Languages)",
    summary: "Standard Italian is based on the 14th-century Florentine dialect of Dante Alighieri. Yet Italy is home to dozens of distinct regional languages (often called 'dialetti') that are linguistically separate Romance languages.",
    languages: [
      { name: "Italian (Standard)", nativeName: "Italiano", type: "Sole State Official", percentage: "95.0%", speakers: "56M", family: "Indo-European (Romance / Italo-Dalmatian)", script: "Latin", bcp47: "it-IT", regions: "Nationwide", notes: "Preserves Latin geminate double consonants (notte, fatto) and open musical vowel cadences." },
      { name: "Neapolitan (Nnapulitano)", nativeName: "Nnapulitano", type: "UNESCO Recognized Language", percentage: "10.0%", speakers: "5.7M", family: "Indo-European (Romance / Italo-Dalmatian)", script: "Latin", bcp47: "it-IT", regions: "Campania, Naples, Southern Italy", notes: "Linguistic ancestor of world-famous songs ('O Sole Mio) with its own distinct vocabulary and grammar." },
      { name: "Sicilian (Sicilianu)", nativeName: "Sicilianu", type: "UNESCO Recognized Language", percentage: "8.5%", speakers: "4.7M", family: "Indo-European (Romance)", script: "Latin", bcp47: "it-IT", regions: "Sicily & Southern Calabria", notes: "Retains Greek, Arabic, and Norman French loanwords from Sicily's rich multicultural history." },
      { name: "Venetian (Vèneto)", nativeName: "Vèneto", type: "Recognized Regional Language", percentage: "6.0%", speakers: "3.8M", family: "Indo-European (Romance / Gallo-Italic)", script: "Latin", bcp47: "it-IT", regions: "Veneto (Venice, Verona, Padua)", notes: "The historical language of the Venetian Republic; gave the world words like ciao, ghetto, and quarantine." },
      { name: "Sardinian (Sardu)", nativeName: "Sardu", type: "Co-official Regional Language", percentage: "1.7%", speakers: "1.0M", family: "Indo-European (Romance / Southern)", script: "Latin", bcp47: "sc-IT", regions: "Island of Sardinia", notes: "Considered the most phonologically conservative Romance language, closest to classical Latin." },
      { name: "German & Ladin", nativeName: "Deutsch / Ladin", type: "Co-official in South Tyrol", percentage: "0.6%", speakers: "350K", family: "Indo-European (Germanic / Rhaeto-Romance)", script: "Latin", bcp47: "de-IT", regions: "South Tyrol / Alto Adige (Bolzano)", notes: "German is co-official in South Tyrol, where ~65% of the local population speaks German as mother tongue." }
    ],
    accents: [
      { name: "Romano", region: "Rome & Lazio", description: "Doubled 'b' and 'g' consonants, truncation of infinitive endings ('annà' for andare), expressive hand gestures.", sample: "Aó! Ma che stai a fa? Nnamo a magnà 'na carbonara bona bona!" },
      { name: "Milano / Lombardo", region: "Milan & Lombardy", description: "Closed vowels, nasal endings, deletion of final unstressed vowels, fast business tempo.", sample: "Uè, figa! Ci becchiamo in centro per un aperitivo veloce, neh?" },
      { name: "Toscano (Florentine)", region: "Florence & Tuscany", description: "Famous 'gorgia toscana' where hard 'c' becomes an aspirated 'h' ('la hasa' instead of la casa).", sample: "Maremma maiala! Vieni a bere una 'oha-'ohola con la 'annuccia!" },
      { name: "Napoletano Accent", region: "Naples & Amalfi", description: "Melodic cadence, shortening of words, central schwa vowel /ə/ on unstressed endings.", sample: "Uagliò, sient' a me! Chest' è 'na pizza overamente speciale!" }
    ],
    phrases: [
      { type: "Greeting", text: "Ciao! / Buongiorno!", phonetic: "CHOW / bwon-JOHR-noh", bcp47: "it-IT" },
      { type: "Thank You", text: "Grazie mille! (A thousand thanks!)", phonetic: "GRAHT-syeh MEEL-lay", bcp47: "it-IT" },
      { type: "Goodbye", text: "Arrivederci! / A presto!", phonetic: "ah-ree-veh-DAIR-chee", bcp47: "it-IT" },
      { type: "How are you?", text: "Come stai? / Come va?", phonetic: "KOH-meh STYE / KOH-meh VAH", bcp47: "it-IT" }
    ],
    funFact: "The universal greeting 'Ciao' originated from the Venetian phrase 's-ciavo vostro', literally meaning 'I am your humble servant' in the medieval Venetian language!"
  },

  IRL: {
    iso3: "IRL", iso2: "IE", geoName: "Ireland", commonName: "Ireland",
    officialName: "Republic of Ireland", nativeName: "Éire", flag: "🇮🇪",
    capital: "Dublin", population: "5.1 Million", continent: "Europe",
    primaryLanguage: "English (Hiberno-English) & Irish (Gaeilge)", languageFamily: "Indo-European",
    diversityLevel: "Constitutional Bilingual (First Official: Irish)",
    summary: "Under Article 8 of the Irish Constitution, the Irish language (Gaeilge) is designated the 'first official language' of Ireland, while English is recognized as the second official language.",
    languages: [
      { name: "English (Hiberno-English)", nativeName: "Hiberno-English", type: "Second Official (Dominant)", percentage: "98.0%", speakers: "5M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-IE", regions: "Nationwide", notes: "Syntax deeply shaped by the Irish language: 'after' past tense ('I'm after eating my dinner'), lack of simple 'yes'/'no'." },
      { name: "Irish (Gaeilge)", nativeName: "Gaeilge", type: "First Constitutional Official", percentage: "39.8%", speakers: "1.9M", family: "Indo-European (Celtic / Goidelic)", script: "Latin (Gaelic type legacy)", bcp47: "ga-IE", regions: "Gaeltacht regions (Galway, Kerry, Donegal, Mayo, Cork) & Nationwide schools", notes: "Core national language of Ireland, an official language of the European Union, taught in all schools." }
    ],
    accents: [
      { name: "Dublin Accent", region: "Dublin City & County", description: "Distinction between Northside (flat vowels, glottal stops, 'ye' plural) and Southside (D4 rising inflection).", sample: "Story bud? You're grand, come on in and we'll have a cuppa." },
      { name: "Cork & Kerry", region: "Southwest Ireland", description: "Sing-song musical lilt, upward pitch at end of sentences, rapid rhythm, rich local slang ('boy', 'feck', 'pure').", sample: "Like, that was pure daycint boy, absolutely massive so it was!" },
      { name: "Galway / Connemara", region: "West of Ireland", description: "Soft, lilting cadence heavily influenced by native Irish-speaking Gaeltacht intonation.", sample: "Ah sure look it, God is good and the weather will take up!" }
    ],
    phrases: [
      { type: "Greeting (Irish)", text: "Dia duit! (God be with you / Hello)", phonetic: "DEE-ah GHWIT", bcp47: "ga-IE" },
      { type: "Thank You (Irish)", text: "Go raibh maith agat! (Thank you)", phonetic: "guh rev MAH ah-gut", bcp47: "ga-IE" },
      { type: "Cheers / Health (Irish)", text: "Sláinte! (To your health / Cheers!)", phonetic: "SLAWN-chuh", bcp47: "ga-IE" },
      { type: "Goodbye (Irish)", text: "Slán abhaile! (Safe home / Goodbye)", phonetic: "slawn ah-WAH-lyuh", bcp47: "ga-IE" }
    ],
    funFact: "The Irish language has no direct word for 'yes' or 'no'! Instead, speakers answer questions by echoing the verb: for example, if someone asks 'Did you see him?', the answer is literally 'I saw' or 'I did not see'."
  },

  NLD: {
    iso3: "NLD", iso2: "NL", geoName: "Netherlands", commonName: "Netherlands",
    officialName: "Kingdom of the Netherlands", nativeName: "Nederland", flag: "🇳🇱",
    capital: "Amsterdam", population: "18 Million", continent: "Europe",
    primaryLanguage: "Dutch (Nederlands)", languageFamily: "Indo-European (Germanic)",
    diversityLevel: "Multilingual Proficiency & Frisian",
    summary: "Dutch is the official language of the Netherlands, with West Frisian co-official in the province of Friesland. The Dutch are world-renowned for English fluency, with over 90% speaking conversational English.",
    languages: [
      { name: "Dutch", nativeName: "Nederlands", type: "Sole State Official", percentage: "95.0%", speakers: "17M", family: "Indo-European (Germanic / Low Franconian)", script: "Latin", bcp47: "nl-NL", regions: "Nationwide", notes: "Linguistic sibling to English and German; mother tongue of Afrikaans." },
      { name: "West Frisian (Frysk)", nativeName: "Frysk", type: "Co-official Provincial (Friesland)", percentage: "2.5%", speakers: "450K", family: "Indo-European (Germanic / Anglo-Frisian)", script: "Latin", bcp47: "fy-NL", regions: "Province of Friesland (Fryslân)", notes: "The closest living genetic relative to the English language on continental Europe ('Bread, butter and green cheese is good English and good Friese')." },
      { name: "Limburgish & Low Saxon", nativeName: "Limburgs / Nedersaksisch", type: "Recognized Regional Languages", percentage: "6.0%", speakers: "1.2M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "nl-NL", regions: "Limburg, Groningen, Drenthe, Overijssel", notes: "Limburgish is one of the few tonal languages in Europe, using pitch to distinguish noun plurals." }
    ],
    accents: [
      { name: "Randstad / Hollandic", region: "Amsterdam, Rotterdam, Utrecht, The Hague", description: "Harsh guttural 'hard G' (/x/), rolling or uvular 'r', fast-paced direct communication.", sample: "Nou, gezellig toch! Zullen we een bakkie koffie doen?" },
      { name: "Brabants & Limburgs (Southern Dutch)", region: "North Brabant & Limburg", description: "Warm 'soft G' (/ɣ/), melodic sing-song intonation, famous for the festive greeting 'Houdoe'.", sample: "Houdoe en bedankt hè! Kei leuk dat je er bent." }
    ],
    phrases: [
      { type: "Greeting", text: "Hallo! / Goedemorgen!", phonetic: "HAH-loh / KHOO-duh-MOR-khun", bcp47: "nl-NL" },
      { type: "Thank You", text: "Dankjewel! / Hartelijk dank!", phonetic: "DAHNK-yuh-vel", bcp47: "nl-NL" },
      { type: "Goodbye", text: "Tot ziens! / Doei!", phonetic: "toht ZEENS / DOO-ee", bcp47: "nl-NL" },
      { type: "How are you?", text: "Hoe gaat het? / Alles goed?", phonetic: "hoo GAHT ut / AH-les goot", bcp47: "nl-NL" }
    ],
    funFact: "Old Frisian and Old English were virtually the same language 1,400 years ago! Even today, the famous rhyme holds true: 'Brea, bûter en griene tsiis is goed Ingelsk en goed Frysk' ('Bread, butter and green cheese is good English and good Friese')."
  },

  BEL: {
    iso3: "BEL", iso2: "BE", geoName: "Belgium", commonName: "Belgium",
    officialName: "Kingdom of Belgium", nativeName: "België / Belgique / Belgien", flag: "🇧🇪",
    capital: "Brussels", population: "11.6 Million", continent: "Europe",
    primaryLanguage: "Dutch (Flemish), French & German", languageFamily: "Indo-European",
    diversityLevel: "Trilingual Constitutional Federation",
    summary: "Belgium is divided into three linguistic communities: Dutch-speaking Flanders in the north (60%), French-speaking Wallonia in the south (40%), and a German-speaking community in the east (1%), with Brussels officially bilingual.",
    languages: [
      { name: "Dutch (Flemish)", nativeName: "Nederlands (Vlaams)", type: "Official Constitutional (Flanders)", percentage: "59.0%", speakers: "6.8M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "nl-BE", regions: "Flemish Region (Flanders) & Brussels", notes: "Softer 'g' sound and distinct vocabulary compared to Netherlands Dutch (e.g., 'goesting' for desire)." },
      { name: "French (Belgian)", nativeName: "Français de Belgique", type: "Official Constitutional (Wallonia)", percentage: "40.0%", speakers: "4.6M", family: "Indo-European (Romance)", script: "Latin", bcp47: "fr-BE", regions: "Wallonia & Brussels Capital Region", notes: "Uses 'septante' (70) and 'nonante' (90); incorporates Walloon regional vocabulary." },
      { name: "German", nativeName: "Deutsch", type: "Official Constitutional", percentage: "1.0%", speakers: "80K", family: "Indo-European (Germanic)", script: "Latin", bcp47: "de-BE", regions: "German-speaking Community (Eupen, Sankt Vith)", notes: "Enjoys extensive legislative autonomy and its own regional parliament despite its small population." }
    ],
    accents: [
      { name: "Antwerps (Flemish)", region: "Antwerp & Flanders", description: "Throaty rhythm, melodic cadence, unique Flemish idioms ('amai', 'zottekes').", sample: "Amai zulle! Da's toch nie te geloven, manneke!" },
      { name: "Bruxellois", region: "Brussels Capital Region", description: "Bilingual hybrid of French and Flemish dialect, distinctive humor (zwanze) and warm slang.", sample: "Non peut-être! Viens boire une bonne gueuze au café." }
    ],
    phrases: [
      { type: "Greeting (Dutch)", text: "Goeiedag! / Hallo!", phonetic: "KHOOY-uh-dahk", bcp47: "nl-BE" },
      { type: "Greeting (French)", text: "Bonjour ! / Salut !", phonetic: "bon-ZHOOR / sah-LOO", bcp47: "fr-BE" },
      { type: "Thank You", text: "Merci bien / Dank u wel", phonetic: "mair-SEE byan / DAHNK oo vel", bcp47: "fr-BE" },
      { type: "Goodbye", text: "Tot ziens / Au revoir", phonetic: "toht ZEENS / oh reh-VWAHR", bcp47: "nl-BE" }
    ],
    funFact: "Brussels is officially 100% bilingual: every single street sign, subway announcement, and municipal form must appear in both Dutch and French, regardless of whether a street is 50 meters or 5 kilometers long!"
  },

  RUS: {
    iso3: "RUS", iso2: "RU", geoName: "Russia", commonName: "Russia",
    officialName: "Russian Federation", nativeName: "Россия (Rossiya)", flag: "🇷🇺",
    capital: "Moscow", population: "144 Million", continent: "Europe",
    primaryLanguage: "Russian (Russkiy)", languageFamily: "Indo-European (Slavic)",
    diversityLevel: "Multilingual Federation (100+ Indigenous Languages)",
    summary: "Russian is the state language across the federation, written in the Cyrillic alphabet. Over 35 co-official languages are recognized in constituent republics, ranging from Tatar and Bashkir to Chechen and Yakut.",
    languages: [
      { name: "Russian", nativeName: "Русский язык", type: "State Language of the Federation", percentage: "96.0%", speakers: "138M", family: "Indo-European (Slavic / East Slavic)", script: "Cyrillic", bcp47: "ru-RU", regions: "Nationwide", notes: "Largest native language in Europe; renowned for six grammatical cases and rich literary canon." },
      { name: "Tatar", nativeName: "Татар теле (Tatar tele)", type: "Co-official Republic Language", percentage: "3.7%", speakers: "5.3M", family: "Turkic (Kipchak)", script: "Cyrillic", bcp47: "tt-RU", regions: "Republic of Tatarstan (Kazan)", notes: "Second most spoken language in Russia; major historical cultural language along the Volga River." },
      { name: "Chechen", nativeName: "Нохчийн мотт (Noxçiyn mott)", type: "Co-official Republic Language", percentage: "1.0%", speakers: "1.4M", family: "Northeast Caucasian", script: "Cyrillic", bcp47: "ru-RU", regions: "Chechen Republic (Grozny)", notes: "Ancient Caucasian language with rich ejective consonants and complex noun-class systems." },
      { name: "Bashkir & Chuvash", nativeName: "Башҡорт теле / Чӑваш чӗлхи", type: "Co-official Republic Languages", percentage: "1.5%", speakers: "2.1M", family: "Turkic", script: "Cyrillic", bcp47: "ru-RU", regions: "Bashkortostan, Chuvashia", notes: "Chuvash is the sole living survivor of the ancient Oghur branch of Turkic." }
    ],
    accents: [
      { name: "Standard Moscow (Akan'ye)", region: "Moscow & Central European Russia", description: "Akan'ye (unstressed 'o' pronounced as 'a'), soft consonants, standard for state television and theatre.", sample: "Здравствуйте! Как ваши дела? Всё отлично. (Zdravstvuyte! Kak vashi dela?)" },
      { name: "Northern Russian (Okan'ye)", region: "Vologda, Arkhangelsk, Novgorod", description: "Okan'ye (clear preservation of unstressed 'o'), softer rhythm, archaic folklore phrasing.", sample: "Пойдём ко мне в гости, чай пить будем! (Poydyom ko mne v gosti...)" },
      { name: "Southern Russian", region: "Rostov-on-Don, Kuban, Krasnodar", description: "Fricative 'g' (/ɣ/ sound closer to Ukrainian 'h'), softening of final 't', Cossack heritage.", sample: "Шо ты кажешь? Давай быстрее! (Sho ty kazhesh?)" }
    ],
    phrases: [
      { type: "Greeting", text: "Здравствуйте! / Привет!", phonetic: "ZDRAHST-voot-yeh / pree-VYET", bcp47: "ru-RU" },
      { type: "Thank You", text: "Спасибо большое!", phonetic: "spah-SEE-bah bahl-SHOY-eh", bcp47: "ru-RU" },
      { type: "Goodbye", text: "До свидания! / Пока!", phonetic: "dah svee-DAH-nyah / pah-KAH", bcp47: "ru-RU" },
      { type: "How are you?", text: "Как дела? / Как поживаете?", phonetic: "kahk dye-LAH", bcp47: "ru-RU" }
    ],
    funFact: "Despite spanning 11 time zones and over 9,000 kilometers from Saint Petersburg to Vladivostok, spoken Standard Russian displays remarkably little accent variation compared to English or German!"
  }
};

