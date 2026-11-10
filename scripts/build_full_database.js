// scripts/build_full_database.js
function getFamilyColor(fam) {
  if (!fam) return '#38bdf8';
  if (fam.includes('Germanic')) return '#38bdf8';
  if (fam.includes('Romance')) return '#f43f5e';
  if (fam.includes('Slavic')) return '#818cf8';
  if (fam.includes('Indo-Iranian') || fam.includes('Dravidian')) return '#f59e0b';
  if (fam.includes('Hellenic') || fam.includes('Baltic') || fam.includes('Indo-European')) return '#06b6d4';
  if (fam.includes('Sino-Tibetan')) return '#ef4444';
  if (fam.includes('Japonic') || fam.includes('Koreanic')) return '#ec4899';
  if (fam.includes('Afroasiatic') || fam.includes('Semitic') || fam.includes('Cushitic')) return '#eab308';
  if (fam.includes('Bantu') || fam.includes('Niger-Congo')) return '#10b981';
  if (fam.includes('Austronesian') || fam.includes('Papuan')) return '#14b8a6';
  if (fam.includes('Austroasiatic')) return '#84cc16';
  if (fam.includes('Kra-Dai')) return '#a855f7';
  if (fam.includes('Turkic')) return '#8b5cf6';
  if (fam.includes('Uralic')) return '#2dd4bf';
  if (fam.includes('Kartvelian')) return '#e11d48';
  if (fam.includes('Indigenous') || fam.includes('Inuit') || fam.includes('Quechuan')) return '#fb923c';
  if (fam.includes('Creole')) return '#0284c7';
  return '#94a3b8';
}

const fs = require('fs');
const path = require('path');

const americas = require('./countries_americas');
const europe = require('./countries_europe');
const asia = require('./countries_asia');
const africa = require('./countries_africa');
const oceania = require('./countries_oceania');
const expanded = require('./countries_expanded');
const coreCountries = require('./country_data');

// Language Family Color Palette
const FAMILY_COLORS = {
  'Indo-European (Germanic)': '#38bdf8',      // sky blue
  'Indo-European (Romance)': '#f43f5e',       // rose red
  'Indo-European (Slavic)': '#818cf8',        // indigo
  'Indo-European (Indo-Iranian)': '#f59e0b',   // amber
  'Indo-European (Hellenic)': '#0ea5e9',      // ocean blue
  'Indo-European (Celtic)': '#10b981',        // emerald
  'Indo-European (Baltic)': '#6366f1',        // iris
  'Indo-European (Other)': '#06b6d4',         // cyan
  'Indo-European': '#3b82f6',                 // royal blue
  'Sino-Tibetan': '#ef4444',                  // crimson
  'Afroasiatic (Semitic)': '#d97706',         // warm gold
  'Afroasiatic (Berber)': '#b45309',          // bronze
  'Afroasiatic (Cushitic/Chadic)': '#ca8a04',  // golden yellow
  'Afroasiatic': '#d97706',                   // warm gold
  'Niger-Congo (Bantu)': '#10b981',           // emerald
  'Niger-Congo (West African)': '#059669',    // forest green
  'Niger-Congo': '#10b981',                   // emerald
  'Austronesian': '#14b8a6',                  // teal
  'Austroasiatic': '#84cc16',                 // lime
  'Kra-Dai (Tai-Kadai)': '#a855f7',           // purple
  'Japonic': '#ec4899',                       // pink
  'Koreanic': '#f472b6',                      // light pink
  'Turkic': '#8b5cf6',                        // violet
  'Uralic (Finno-Ugric)': '#2dd4bf',          // bright teal
  'Dravidian': '#ea580c',                     // deep orange
  'Kartvelian': '#e11d48',                    // ruby
  'Indigenous American': '#fb923c',           // bright orange
  'Papuan / Trans-New Guinea': '#16a34a',     // green
  'Language Isolate / Other': '#94a3b8'       // slate
};

// Compute centroid using largest polygon ring (prevents overseas territories or antimeridian splits from skewing centers)
function computeCentroid(geometry) {
  if (!geometry || !geometry.coordinates) return [0, 0];
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  let bestArea = -1;
  let bestCenter = [0, 0];

  for (const poly of polys) {
    const outer = poly && poly[0];
    if (!outer || outer.length === 0) continue;
    let signedArea = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0, j = outer.length - 1; i < outer.length; j = i++) {
      const x0 = outer[j][0], y0 = outer[j][1];
      const x1 = outer[i][0], y1 = outer[i][1];
      const cross = x0 * y1 - x1 * y0;
      signedArea += cross;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
    }
    const area = Math.abs(signedArea) * 0.5;
    if (area > bestArea) {
      bestArea = area;
      if (Math.abs(signedArea) > 1e-9) {
        bestCenter = [Math.round((cx / (3 * signedArea)) * 100) / 100, Math.round((cy / (3 * signedArea)) * 100) / 100];
      } else {
        let sx = 0, sy = 0;
        for (let i = 0; i < outer.length; i++) { sx += outer[i][0]; sy += outer[i][1]; }
        bestCenter = [Math.round((sx / outer.length) * 100) / 100, Math.round((sy / outer.length) * 100) / 100];
      }
    }
  }
  return bestCenter;
}

const geoPath = path.join(__dirname, '../data/world_countries.geojson');
const geoData = JSON.parse(fs.readFileSync(geoPath, 'utf8'));

// Centroid lookup by iso3 and name
const centroidMap = {};
for (const f of geoData.features) {
  const c = computeCentroid(f.geometry);
  const p = f.properties;
  if (p.iso_a3 && p.iso_a3 !== '-99') centroidMap[p.iso_a3] = c;
  if (p.name) centroidMap[p.name] = c;
}

// Master mapping dictionary
let master = { ...coreCountries, ...americas, ...europe, ...asia, ...africa, ...oceania, ...expanded };

// Extended profiles for additional major countries
const additionalCountries = {
  // Europe
  AUT: {
    iso3: "AUT", iso2: "AT", geoName: "Austria", commonName: "Austria",
    officialName: "Republic of Austria", nativeName: "Österreich", flag: "🇦🇹",
    capital: "Vienna", population: "9.1 Million", continent: "Europe",
    primaryLanguage: "Austrian German (Österreichisches Deutsch)", languageFamily: "Indo-European (Germanic)",
    diversityLevel: "Pluricentric German & Minorities",
    summary: "German is the official language of Austria. Austrian German is a distinct standard variety with unique legal and culinary vocabulary recognized by the European Union, complemented by rich Austro-Bavarian and Alemannic dialects.",
    languages: [
      { name: "German (Austrian Standard)", nativeName: "Österreichisches Deutsch", type: "Official State Language", percentage: "88.0%", speakers: "8M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "de-AT", regions: "Nationwide", notes: "Official in all state matters with distinct Austrian protocol terms (Matura, Jänner, Paradeiser)." },
      { name: "Bavarian / Austro-Bavarian", nativeName: "Boarisch", type: "Regional Dialect Continuum", percentage: "75.0%", speakers: "6.8M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "de-AT", regions: "Vienna, Lower Austria, Salzburg, Tyrol, Styria, Carinthia", notes: "Daily spoken vernacular across most Austrian federal states." },
      { name: "Burgenland Croatian, Hungarian & Slovenian", nativeName: "Hrvatski / Magyar / Slovenščina", type: "Official Regional Minorities", percentage: "2.0%", speakers: "180K", family: "Indo-European / Uralic", script: "Latin", bcp47: "hr-AT", regions: "Burgenland & Carinthia", notes: "Constitutionally protected historical minority languages with bilingual schools." }
    ],
    accents: [
      { name: "Wienerisch (Viennese)", region: "Vienna", description: "Melodic, relaxed cadence, famous Viennese 'Grant' (dry complaining humor) and soft diphthongs.", sample: "Servas! Gehn ma auf a Melange ins Kaffeehaus, bittscheen!" },
      { name: "Tyrolean (Tirolerisch)", region: "Tyrol (Alps)", description: "Strong aspirated 'k' (kch sound), guttural alpine rhythm, proud mountain idiom.", sample: "Griaß di! Des isch a mords Gaudi auf der Alm!" }
    ],
    phrases: [
      { type: "Greeting", text: "Grüß Gott! / Servus!", phonetic: "GROOSS goht / ZAIR-voos", bcp47: "de-AT" },
      { type: "Thank You", text: "Danke schön! / Vergelt's Gott!", phonetic: "DAHN-kuh shurn", bcp47: "de-AT" },
      { type: "Goodbye", text: "Auf Wiederschaun! / Baba!", phonetic: "owf VEE-der-shown / bah-BAH", bcp47: "de-AT" },
      { type: "How are you?", text: "Wie geht's? / Alles leiwand?", phonetic: "vee GAYTS / AH-les LYE-vahnd", bcp47: "de-AT" }
    ],
    funFact: "When Austria joined the European Union in 1995, Protocol No. 10 of the Accession Treaty explicitly guaranteed that 23 Austrian German food and agricultural words (like 'Erdapfel' for potato and 'Marille' for apricot) have official legal status in EU law!"
  },

  SWE: {
    iso3: "SWE", iso2: "SE", geoName: "Sweden", commonName: "Sweden",
    officialName: "Kingdom of Sweden", nativeName: "Sverige", flag: "🇸🇪",
    capital: "Stockholm", population: "10.5 Million", continent: "Europe",
    primaryLanguage: "Swedish (Svenska)", languageFamily: "Indo-European (Germanic)",
    diversityLevel: "Pitch-accent North Germanic & Sami",
    summary: "Swedish is a North Germanic language renowned for its musical pitch accent (tonal word distinctions). Sweden constitutionally recognizes five national minority languages: Finnish, Meänkieli, Sami, Romani, and Yiddish.",
    languages: [
      { name: "Swedish", nativeName: "Svenska", type: "Principal Language (Main Official)", percentage: "90.0%", speakers: "9.5M", family: "Indo-European (Germanic / North Germanic)", script: "Latin (with å, ä, ö)", bcp47: "sv-SE", regions: "Nationwide", notes: "Tonal pitch accent: 'anden' with accent 1 means 'the duck', while with accent 2 it means 'the spirit'." },
      { name: "Sami Languages (Northern, Lule, Southern)", nativeName: "Davvisámegiella", type: "Recognized Indigenous Minority", percentage: "0.3%", speakers: "25K", family: "Uralic (Finno-Ugric)", script: "Latin", bcp47: "sv-SE", regions: "Sápmi (Northern Sweden / Norrland)", notes: "Indigenous reindeer-herding culture with protected language rights in northern municipalities." },
      { name: "Finnish & Meänkieli", nativeName: "Suomi / Meänkieli", type: "Recognized National Minorities", percentage: "4.5%", speakers: "450K", family: "Uralic (Finno-Ugric)", script: "Latin", bcp47: "fi-FI", regions: "Torne Valley (Tornedalen) & Stockholm", notes: "Historically established minority languages protected under Swedish law." }
    ],
    accents: [
      { name: "Rikssvenska / Stockholmska", region: "Stockholm & Central Sweden", description: "Melodic pitch accent, open 'e' and 'ä' vowels, standard for national broadcasting.", sample: "Tjena! Ska vi ta en fika på stan?" },
      { name: "Skånska (Scanian)", region: "Skåne (Malmö, Lund)", description: "Diphthongized vowels, uvular 'r' (skorrande r), historically influenced by Danish rule.", sample: "Hallå på di! Det var rart att träffa dig." },
      { name: "Norrländska", region: "Northern Sweden (Umeå, Luleå)", description: "Slower tempo, calm intonation, famous ingressive intake of breath ('schuu') meaning 'yes'.", sample: "Hejsan! Ska vi ut och åka skidor i fjällen?" }
    ],
    phrases: [
      { type: "Greeting", text: "Hej! / Hejsan! / Tjena!", phonetic: "HEY / HEY-sahn / SHAY-nah", bcp47: "sv-SE" },
      { type: "Thank You", text: "Tack så mycket! (Thanks so much!)", phonetic: "TAHK soh MY-keh", bcp47: "sv-SE" },
      { type: "Goodbye", text: "Hejdå! / Vi ses!", phonetic: "HEY-doh / vee SEHS", bcp47: "sv-SE" },
      { type: "How are you?", text: "Hur mår du? / Läget?", phonetic: "hoor mohr DOO / LEH-geht", bcp47: "sv-SE" }
    ],
    funFact: "In Northern Sweden, people routinely say 'yes' simply by inhaling sharply with their lips rounded (a sound like 'schuuup') without ever vocalizing a word—a phenomenon known as an ingressive pulmonary consonant!"
  },

  NOR: {
    iso3: "NOR", iso2: "NO", geoName: "Norway", commonName: "Norway",
    officialName: "Kingdom of Norway", nativeName: "Norge / Noreg", flag: "🇳🇴",
    capital: "Oslo", population: "5.5 Million", continent: "Europe",
    primaryLanguage: "Norwegian (Bokmål & Nynorsk)", languageFamily: "Indo-European (Germanic)",
    diversityLevel: "Dual Written Standards (Bokmål & Nynorsk) & Sami",
    summary: "Norway has two official written standards for Norwegian: Bokmål (Book Tongue, 85%) and Nynorsk (New Norwegian, based on rural dialects, 15%). Sami is co-official in northern administrative districts.",
    languages: [
      { name: "Norwegian (Bokmål)", nativeName: "Norsk (Bokmål)", type: "Official Written Standard", percentage: "85.0%", speakers: "4.7M", family: "Indo-European (Germanic / North Germanic)", script: "Latin (with æ, ø, å)", bcp47: "no-NO", regions: "Nationwide (Urban centers, Eastern Norway)", notes: "Evolved from Dano-Norwegian; dominant standard in media, publishing, and business." },
      { name: "Norwegian (Nynorsk)", nativeName: "Norsk (Nynorsk)", type: "Official Written Standard", percentage: "15.0%", speakers: "800K", family: "Indo-European (Germanic / North Germanic)", script: "Latin (with æ, ø, å)", bcp47: "nn-NO", regions: "Western Norway (Vestlandet), Fjord regions", notes: "Created by linguist Ivar Aasen in the 19th century from rural Norwegian dialects." },
      { name: "Sami (North, Lule, South)", nativeName: "Sámegiella", type: "Co-official Indigenous Language", percentage: "0.5%", speakers: "30K", family: "Uralic (Finno-Ugric)", script: "Latin", bcp47: "no-NO", regions: "Northern Norway (Finnmark, Troms, Trøndelag)", notes: "Co-official with Norwegian under the Sami Act; operates its own Sami Parliament (Sametinget)." }
    ],
    accents: [
      { name: "Østnorsk (Eastern / Oslo)", region: "Oslo & Eastern Valleys", description: "Retroflex consonants, tonal pitch accent 1 and 2, musical rising intonation at phrase ends.", sample: "Hei! Koselig å se deg, skal vi ta en kaffe?" },
      { name: "Vestlandsk (Bergen & Fjords)", region: "Bergen, Stavanger, Fjord Coast", description: "Uvular 'r' (skarre-r), distinct melody, rich traditional vowel variations.", sample: "Eg e'kje fra Norge, eg e' fra Bergen!" }
    ],
    phrases: [
      { type: "Greeting", text: "Hei! / Hallo! / God dag!", phonetic: "HEY / HAH-loh / goh DAHG", bcp47: "no-NO" },
      { type: "Thank You", text: "Tusen takk! (A thousand thanks!)", phonetic: "TOO-sen TAHK", bcp47: "no-NO" },
      { type: "Goodbye", text: "Ha det bra! / Ha det!", phonetic: "HAH deh BRAH", bcp47: "no-NO" },
      { type: "How are you?", text: "Hvordan går det? (How does it go?)", phonetic: "VOOR-dahn gohr deh", bcp47: "no-NO" }
    ],
    funFact: "Norwegians take immense pride in their local spoken dialects—teachers, television anchors, and even prime ministers speak on air in their own regional dialect rather than switching to a standardized accent!"
  },

  GRC: {
    iso3: "GRC", iso2: "GR", geoName: "Greece", commonName: "Greece",
    officialName: "Hellenic Republic", nativeName: "Ελλάδα (Elláda)", flag: "🇬🇷",
    capital: "Athens", population: "10.4 Million", continent: "Europe",
    primaryLanguage: "Greek (Ellinika)", languageFamily: "Indo-European (Hellenic)",
    diversityLevel: "Unique Independent Indo-European Branch",
    summary: "Greek represents an independent branch of the Indo-European language family with over 3,400 years of written records. It provided foundational vocabulary for science, philosophy, mathematics, and democracy worldwide.",
    languages: [
      { name: "Greek (Demotic / Standard)", nativeName: "Ελληνικά (Elliniká)", type: "Sole State Official", percentage: "98.0%", speakers: "10.2M", family: "Indo-European (Hellenic)", script: "Greek Alphabet (Α α, Ω ω)", bcp47: "el-GR", regions: "Nationwide", notes: "Standardized modern Demotic Greek; official language of Greece and Cyprus." },
      { name: "Pontic Greek & Cretan", nativeName: "Ποντιακά / Κρητικά", type: "Traditional Regional Varieties", percentage: "5.0%", speakers: "500K", family: "Indo-European (Hellenic)", script: "Greek", bcp47: "el-GR", regions: "Northern Greece (Macedonia) & Island of Crete", notes: "Cretan Greek is famous for Mantinades (rhyming 15-syllable musical couplets)." },
      { name: "Tsakonian (Tsakonika)", nativeName: "Τσακώνικα", type: "UNESCO Endangered Language", percentage: "0.02%", speakers: "2K", family: "Indo-European (Hellenic / Doric)", script: "Greek", bcp47: "el-GR", regions: "Peloponnese (Arcadia)", notes: "The only surviving direct descendant of ancient Doric Greek (the language of ancient Sparta)." }
    ],
    accents: [
      { name: "Athenian Standard", region: "Athens & Attica", description: "Clear vowels, dental consonants, lively rhythm, standard for national broadcasting and theatre.", sample: "Γεια σας! Τι κάνετε; Όλα καλά σήμερα! (Geia sas! Ti kanete?)" },
      { name: "Thessaloniki / Northern", region: "Macedonia & Thrace", description: "Dark 'l' (heavy lambdacism), prolonged vowels, characteristic northern warmth.", sample: "Χαλαρά ρε συ! Πάμε να πιούμε ένα φραπεδάκι στην παραλία;" },
      { name: "Cretan", region: "Crete", description: "Softening of 'k' and 't' before front vowels (k->ch, t->ts), proud warrior and musical cadence.", sample: "Ώρε κοπέλι, καλώς όρισες στην Κρήτη μας!" }
    ],
    phrases: [
      { type: "Greeting", text: "Γεια σου! / Γεια σας! (Health to you / Hello!)", phonetic: "YAH-soo / YAH-sahs", bcp47: "el-GR" },
      { type: "Thank You", text: "Ευχαριστώ πολύ! (Thank you very much)", phonetic: "ef-khah-rees-TOH poh-LEE", bcp47: "el-GR" },
      { type: "Goodbye", text: "Αντίο! / Τα λέμε!", phonetic: "ahn-DEE-oh / tah LEH-meh", bcp47: "el-GR" },
      { type: "How are you?", text: "Τι κάνεις; / Πώς είσαι;", phonetic: "tee KAH-nees / pohs EE-seh", bcp47: "el-GR" }
    ],
    funFact: "Tsakonian, spoken in a handful of mountain villages in the Peloponnese, is the ONLY living language derived directly from ancient Doric—making its speakers the true linguistic descendants of the ancient Spartans!"
  },

  POL: {
    iso3: "POL", iso2: "PL", geoName: "Poland", commonName: "Poland",
    officialName: "Republic of Poland", nativeName: "Polska", flag: "🇵🇱",
    capital: "Warsaw", population: "38 Million", continent: "Europe",
    primaryLanguage: "Polish (Polski)", languageFamily: "Indo-European (Slavic)",
    diversityLevel: "West Slavic Consonant Richness & Kashubian",
    summary: "Polish is famous for its rich consonant clusters, nasal vowels (ą, ę), and seven grammatical cases. Kashubian is officially recognized as a regional language in Pomerania.",
    languages: [
      { name: "Polish", nativeName: "Język polski", type: "Sole State Official", percentage: "97.0%", speakers: "37M", family: "Indo-European (Slavic / West Slavic)", script: "Latin (with ąćęłńóśźż)", bcp47: "pl-PL", regions: "Nationwide", notes: "One of only two Slavic languages preserving ancient nasal vowels (ą, ę)." },
      { name: "Kashubian (Kaszëbsczi)", nativeName: "Kaszëbsczi jãzëk", type: "Recognized Regional Language", percentage: "0.3%", speakers: "100K", family: "Indo-European (Slavic / Lechitic)", script: "Latin", bcp47: "pl-PL", regions: "Pomerania (Gdańsk region)", notes: "Officially recognized regional language with bilingual town signs and matura exams." },
      { name: "Silesian (Ślōnskŏ gŏdka)", nativeName: "Ślōnskŏ gŏdka", type: "Regional Ethnolect", percentage: "1.3%", speakers: "500K", family: "Indo-European (Slavic / West Slavic)", script: "Latin", bcp47: "pl-PL", regions: "Upper Silesia (Katowice)", notes: "Vibrant industrial mining region dialect with German loanwords." }
    ],
    accents: [
      { name: "Standard Polish (Warsaw / Central)", region: "Warsaw, Mazovia", description: "Clear articulation, penultimate syllable stress, balanced sibilants (sz, cz, rz, ś, ć, ź).", sample: "Cześć! Co tam słychać? Wszystko w porządku!" },
      { name: "Góralski (Highlander)", region: "Podhale & Tatra Mountains (Zakopane)", description: "Sibilant 'mazurzenie' (sz becomes s), musical folk rhythm, rich pastoral terminology.", sample: "Hej baco! Piykna ta naso Ziemia Podhalańsko!" }
    ],
    phrases: [
      { type: "Greeting", text: "Cześć! / Dzień dobry!", phonetic: "CHESHCH / jyen DOH-bry", bcp47: "pl-PL" },
      { type: "Thank You", text: "Dziękuję bardzo! (Thank you very much)", phonetic: "jyen-KOO-yeh BAHR-dzoh", bcp47: "pl-PL" },
      { type: "Goodbye", text: "Do widzenia! / Na razie!", phonetic: "doh veed-ZEN-yah / nah RAH-zyeh", bcp47: "pl-PL" },
      { type: "How are you?", text: "Jak się masz? / Co słychać?", phonetic: "yahk sheh MAHSH / tso SWY-khahch", bcp47: "pl-PL" }
    ],
    funFact: "Polish is famous for tongue-twisting consonant clusters! The most notorious sentence in the language is: 'W Szczebrzeszynie chrząszcz brzmi w trzcinie' ('In Szczebrzeszyn a beetle buzzes in the reeds')!"
  },

  UKR: {
    iso3: "UKR", iso2: "UA", geoName: "Ukraine", commonName: "Ukraine",
    officialName: "Ukraine", nativeName: "Україна (Ukrayina)", flag: "🇺🇦",
    capital: "Kyiv", population: "41 Million", continent: "Europe",
    primaryLanguage: "Ukrainian (Ukrayins'ka)", languageFamily: "Indo-European (Slavic)",
    diversityLevel: "Melodic East Slavic & Crimean Tatar",
    summary: "Ukrainian is the sole state language of Ukraine, renowned for its melodic phonetics (euphony law preventing harsh consonant clusters). Crimean Tatar is recognized as an indigenous language of Ukraine.",
    languages: [
      { name: "Ukrainian", nativeName: "Українська мова", type: "Sole State Official", percentage: "84.0%", speakers: "35M", family: "Indo-European (Slavic / East Slavic)", script: "Ukrainian Cyrillic (with Ґ, Є, І, Ї)", bcp47: "uk-UA", regions: "Nationwide", notes: "Linguistically closest to Belarusian and Polish; has the unique letter 'Ї' (yi)." },
      { name: "Crimean Tatar (Qırımtatar tili)", nativeName: "Qırımtatar tili (Къырымтатар тили)", type: "Recognized Indigenous Language", percentage: "0.7%", speakers: "300K", family: "Turkic (Kipchak)", script: "Latin / Cyrillic", bcp47: "crh-UA", regions: "Crimean Peninsula", notes: "Indigenous language of the Crimean Tatars, protected under the 2021 Indigenous Peoples Law." }
    ],
    accents: [
      { name: "Central Ukrainian (Kyiv)", region: "Kyiv, Poltava, Cherkasy", description: "Basis for standard literary Ukrainian, soft fricative 'h' (/ɦ/), balanced vowel harmony.", sample: "Привіт! Як твої справи? Радий тебе бачити!" },
      { name: "Western Ukrainian (Galician / Lviv)", region: "Lviv, Ternopil, Ivano-Frankivsk", description: "Melodic intonation, historical Polish and Austro-Hungarian loanwords, literary flair.", sample: "Слава Україні! Ходімо на запашну каву до кнайпи!" }
    ],
    phrases: [
      { type: "Greeting", text: "Добрий день! / Привіт!", phonetic: "DOH-bry den / pree-VEET", bcp47: "uk-UA" },
      { type: "Thank You", text: "Дякую дуже! / Щиро дякую!", phonetic: "DYAH-koo-yoo DOO-zheh", bcp47: "uk-UA" },
      { type: "Goodbye", text: "До побачення! / Бувай!", phonetic: "doh poh-BAH-chen-nyah / boo-VYE", bcp47: "uk-UA" },
      { type: "National Motto", text: "Слава Україні! (Glory to Ukraine!)", phonetic: "SLAH-vah oo-krah-YEE-nee", bcp47: "uk-UA" }
    ],
    funFact: "In 1934 at a linguistics competition in Paris, Ukrainian was voted the second most melodious language in the world after Italian, largely due to its phonetic rule forbidding awkward consonant clusters by alternating vowels!"
  },

  PRT: {
    iso3: "PRT", iso2: "PT", geoName: "Portugal", commonName: "Portugal",
    officialName: "Portuguese Republic", nativeName: "Portugal", flag: "🇵🇹",
    capital: "Lisbon", population: "10.3 Million", continent: "Europe",
    primaryLanguage: "Portuguese (European)", languageFamily: "Indo-European (Romance)",
    diversityLevel: "Stress-timed European Romance & Mirandese",
    summary: "European Portuguese is stress-timed, giving it a distinctive rhythmic cadence with reduced unstressed vowels and sibilant 'sh' sounds that foreigners often humorously mistake for a Slavic language. Mirandese is officially recognized in the northeast.",
    languages: [
      { name: "Portuguese (European)", nativeName: "Português europeu", type: "Official State Language", percentage: "98.5%", speakers: "10M", family: "Indo-European (Romance)", script: "Latin", bcp47: "pt-PT", regions: "Nationwide", notes: "Rich in nasal vowels and diphthongs (ão, õe); basis for standard Lusophone grammar." },
      { name: "Mirandese (Mirandés)", nativeName: "Lhéngua mirandesa", type: "Official Regional Co-language", percentage: "0.1%", speakers: "15K", family: "Indo-European (Romance / Asturleonese)", script: "Latin", bcp47: "pt-PT", regions: "Miranda do Douro (Trás-os-Montes)", notes: "Officially recognized since 1999; taught in local schools alongside Portuguese." }
    ],
    accents: [
      { name: "Lisboeta (Lisbon)", region: "Lisbon & Tagus Valley", description: "Palatalized 's' (sounds like 'sh'), closed vowels, smooth metropolitan cadence.", sample: "Olá, tudo bem? Vamos beber uma bica e comer um pastel de nata?" },
      { name: "Tripeiro (Porto / Northern)", region: "Porto & Northern Portugal", description: "Distinction of 'b' and 'v' softened, open front vowels, lively and direct temperament.", sample: "Ó meu, estás a ver? Aquilo no Porto é que é uma maravilha!" },
      { name: "Insular (Azores & Madeira)", region: "Azores & Madeira Archipelagos", description: "French-like rounded 'u' (/y/) in São Miguel, melodic island cadence.", sample: "Bom dia! Como vai essa gente?" }
    ],
    phrases: [
      { type: "Greeting", text: "Olá! / Bom dia!", phonetic: "oh-LAH / bon DEE-ah", bcp47: "pt-PT" },
      { type: "Thank You", text: "Muito obrigado (m) / obrigada (f)", phonetic: "MOOY-too oh-bree-GAH-doo", bcp47: "pt-PT" },
      { type: "Goodbye", text: "Adeus! / Até logo!", phonetic: "ah-DEH-oosh / ah-TEH LOH-goo", bcp47: "pt-PT" },
      { type: "How are you?", text: "Como está? / Tudo bem?", phonetic: "KOH-moo ehsh-TAH / TOO-doo bayng", bcp47: "pt-PT" }
    ],
    funFact: "Because European Portuguese reduces unstressed vowels and uses frequent 'sh' sounds, travelers hearing it for the first time often mistake it for Russian or Polish, even though it is a pure Romance language directly descended from Latin!"
  }
};

// Merge all additional curated countries into master
Object.assign(master, additionalCountries);

// Fallback regional generator for remaining countries in geojson
function getLanguageDefaults(name, iso3, iso2) {
  // Common knowledge dictionary for world countries
  const defaults = {
    // ASIA
    AFG: { lang: "Pashto & Dari", fam: "Indo-European (Indo-Iranian)", flag: "🇦🇫", cap: "Kabul", pop: "40M", cont: "Asia", bcp: "fa-AF" },
    ARM: { lang: "Armenian", fam: "Indo-European (Other)", flag: "🇦🇲", cap: "Yerevan", pop: "3M", cont: "Asia", bcp: "hy-AM" },
    AZE: { lang: "Azerbaijani", fam: "Turkic", flag: "🇦🇿", cap: "Baku", pop: "10M", cont: "Asia", bcp: "az-AZ" },
    BHR: { lang: "Arabic", fam: "Afroasiatic (Semitic)", flag: "🇧🇭", cap: "Manama", pop: "1.5M", cont: "Asia", bcp: "ar-BH" },
    BGD: { lang: "Bengali (Bangla)", fam: "Indo-European (Indo-Iranian)", flag: "🇧🇩", cap: "Dhaka", pop: "170M", cont: "Asia", bcp: "bn-BD" },
    BTN: { lang: "Dzongkha", fam: "Sino-Tibetan", flag: "🇧🇹", cap: "Thimphu", pop: "780K", cont: "Asia", bcp: "dz-BT" },
    BRN: { lang: "Malay & English", fam: "Austronesian", flag: "🇧🇳", cap: "Bandar Seri Begawan", pop: "450K", cont: "Asia", bcp: "ms-BN" },
    KHM: { lang: "Khmer", fam: "Austroasiatic", flag: "🇰🇭", cap: "Phnom Penh", pop: "17M", cont: "Asia", bcp: "km-KH" },
    CYP: { lang: "Greek & Turkish", fam: "Indo-European (Hellenic)", flag: "🇨🇾", cap: "Nicosia", pop: "1.2M", cont: "Europe", bcp: "el-CY" },
    GEO: { lang: "Georgian", fam: "Kartvelian", flag: "🇬🇪", cap: "Tbilisi", pop: "3.7M", cont: "Asia", bcp: "ka-GE" },
    IRQ: { lang: "Arabic & Kurdish", fam: "Afroasiatic (Semitic)", flag: "🇮🇶", cap: "Baghdad", pop: "43M", cont: "Asia", bcp: "ar-IQ" },
    ISR: { lang: "Hebrew & Arabic", fam: "Afroasiatic (Semitic)", flag: "🇮🇱", cap: "Jerusalem", pop: "9.5M", cont: "Asia", bcp: "he-IL" },
    JOR: { lang: "Arabic", fam: "Afroasiatic (Semitic)", flag: "🇯🇴", cap: "Amman", pop: "11M", cont: "Asia", bcp: "ar-JO" },
    KAZ: { lang: "Kazakh & Russian", fam: "Turkic", flag: "🇰🇿", cap: "Astana", pop: "20M", cont: "Asia", bcp: "kk-KZ" },
    KWT: { lang: "Arabic", fam: "Afroasiatic (Semitic)", flag: "🇰🇼", cap: "Kuwait City", pop: "4.3M", cont: "Asia", bcp: "ar-KW" },
    KGZ: { lang: "Kyrgyz & Russian", fam: "Turkic", flag: "🇰🇬", cap: "Bishkek", pop: "7M", cont: "Asia", bcp: "ky-KG" },
    LAO: { lang: "Lao", fam: "Kra-Dai (Tai-Kadai)", flag: "🇱🇦", cap: "Vientiane", pop: "7.5M", cont: "Asia", bcp: "lo-LA" },
    LBN: { lang: "Arabic & French", fam: "Afroasiatic (Semitic)", flag: "🇱🇧", cap: "Beirut", pop: "5.5M", cont: "Asia", bcp: "ar-LB" },
    MYS: { lang: "Malay (Bahasa Melayu)", fam: "Austronesian", flag: "🇲🇾", cap: "Kuala Lumpur", pop: "34M", cont: "Asia", bcp: "ms-MY" },
    MDV: { lang: "Dhivehi", fam: "Indo-European (Indo-Iranian)", flag: "🇲🇻", cap: "Malé", pop: "520K", cont: "Asia", bcp: "dv-MV" },
    MNG: { lang: "Mongolian", fam: "Language Isolate / Other", flag: "🇲🇳", cap: "Ulaanbaatar", pop: "3.4M", cont: "Asia", bcp: "mn-MN" },
    MMR: { lang: "Burmese", fam: "Sino-Tibetan", flag: "🇲🇲", cap: "Naypyidaw", pop: "54M", cont: "Asia", bcp: "my-MM" },
    NPL: { lang: "Nepali", fam: "Indo-European (Indo-Iranian)", flag: "🇳🇵", cap: "Kathmandu", pop: "30M", cont: "Asia", bcp: "ne-NP" },
    PRK: { lang: "Korean (Chosŏn'gŭl)", fam: "Koreanic", flag: "🇰🇵", cap: "Pyongyang", pop: "26M", cont: "Asia", bcp: "ko-KP" },
    OMN: { lang: "Arabic", fam: "Afroasiatic (Semitic)", flag: "🇴🇲", cap: "Muscat", pop: "4.6M", cont: "Asia", bcp: "ar-OM" },
    PAK: { lang: "Urdu & English", fam: "Indo-European (Indo-Iranian)", flag: "🇵🇰", cap: "Islamabad", pop: "240M", cont: "Asia", bcp: "ur-PK" },
    QAT: { lang: "Arabic", fam: "Afroasiatic (Semitic)", flag: "🇶🇦", cap: "Doha", pop: "2.7M", cont: "Asia", bcp: "ar-QA" },
    SGP: { lang: "English, Malay, Mandarin & Tamil", fam: "Austronesian", flag: "🇸🇬", cap: "Singapore", pop: "5.9M", cont: "Asia", bcp: "en-SG" },
    LKA: { lang: "Sinhala & Tamil", fam: "Indo-European (Indo-Iranian)", flag: "🇱🇰", cap: "Colombo", pop: "22M", cont: "Asia", bcp: "si-LK" },
    SYR: { lang: "Arabic", fam: "Afroasiatic (Semitic)", flag: "🇸🇾", cap: "Damascus", pop: "22M", cont: "Asia", bcp: "ar-SY" },
    TWN: { lang: "Mandarin, Taiwanese & Hakka", fam: "Sino-Tibetan", flag: "🇹🇼", cap: "Taipei", pop: "23.5M", cont: "Asia", bcp: "zh-TW" },
    TJK: { lang: "Tajik & Russian", fam: "Indo-European (Indo-Iranian)", flag: "🇹🇯", cap: "Dushanbe", pop: "10M", cont: "Asia", bcp: "tg-TJ" },
    THA: { lang: "Thai", fam: "Kra-Dai (Tai-Kadai)", flag: "🇹🇭", cap: "Bangkok", pop: "71M", cont: "Asia", bcp: "th-TH" },
    TLS: { lang: "Tetum & Portuguese", fam: "Austronesian", flag: "🇹🇱", cap: "Dili", pop: "1.3M", cont: "Asia", bcp: "pt-TL" },
    TKM: { lang: "Turkmen", fam: "Turkic", flag: "🇹🇲", cap: "Ashgabat", pop: "6.5M", cont: "Asia", bcp: "tk-TM" },
    ARE: { lang: "Arabic", fam: "Afroasiatic (Semitic)", flag: "🇦🇪", cap: "Abu Dhabi", pop: "9.9M", cont: "Asia", bcp: "ar-AE" },
    UZB: { lang: "Uzbek", fam: "Turkic", flag: "🇺🇿", cap: "Tashkent", pop: "36M", cont: "Asia", bcp: "uz-UZ" },
    YEM: { lang: "Arabic", fam: "Afroasiatic (Semitic)", flag: "🇾🇪", cap: "Sana'a", pop: "33M", cont: "Asia", bcp: "ar-YE" },

    // EUROPE
    ALB: { lang: "Albanian (Shqip)", fam: "Indo-European (Other)", flag: "🇦🇱", cap: "Tirana", pop: "2.8M", cont: "Europe", bcp: "sq-AL" },
    AND: { lang: "Catalan", fam: "Indo-European (Romance)", flag: "🇦🇩", cap: "Andorra la Vella", pop: "80K", cont: "Europe", bcp: "ca-AD" },
    BLR: { lang: "Belarusian & Russian", fam: "Indo-European (Slavic)", flag: "🇧🇾", cap: "Minsk", pop: "9.2M", cont: "Europe", bcp: "be-BY" },
    BIH: { lang: "Bosnian, Croatian & Serbian", fam: "Indo-European (Slavic)", flag: "🇧🇦", cap: "Sarajevo", pop: "3.2M", cont: "Europe", bcp: "bs-BA" },
    BGR: { lang: "Bulgarian", fam: "Indo-European (Slavic)", flag: "🇧🇬", cap: "Sofia", pop: "6.5M", cont: "Europe", bcp: "bg-BG" },
    HRV: { lang: "Croatian", fam: "Indo-European (Slavic)", flag: "🇭🇷", cap: "Zagreb", pop: "3.9M", cont: "Europe", bcp: "hr-HR" },
    CZE: { lang: "Czech", fam: "Indo-European (Slavic)", flag: "🇨🇿", cap: "Prague", pop: "10.5M", cont: "Europe", bcp: "cs-CZ" },
    DNK: { lang: "Danish", fam: "Indo-European (Germanic)", flag: "🇩🇰", cap: "Copenhagen", pop: "5.9M", cont: "Europe", bcp: "da-DK" },
    EST: { lang: "Estonian", fam: "Uralic (Finno-Ugric)", flag: "🇪🇪", cap: "Tallinn", pop: "1.3M", cont: "Europe", bcp: "et-EE" },
    FIN: { lang: "Finnish & Swedish", fam: "Uralic (Finno-Ugric)", flag: "🇫🇮", cap: "Helsinki", pop: "5.5M", cont: "Europe", bcp: "fi-FI" },
    HUN: { lang: "Hungarian (Magyar)", fam: "Uralic (Finno-Ugric)", flag: "🇭🇺", cap: "Budapest", pop: "9.7M", cont: "Europe", bcp: "hu-HU" },
    ISL: { lang: "Icelandic", fam: "Indo-European (Germanic)", flag: "🇮🇸", cap: "Reykjavik", pop: "380K", cont: "Europe", bcp: "is-IS" },
    XKX: { lang: "Albanian & Serbian", fam: "Indo-European (Other)", flag: "🇽🇰", cap: "Pristina", pop: "1.8M", cont: "Europe", bcp: "sq-XK" },
    LVA: { lang: "Latvian", fam: "Indo-European (Baltic)", flag: "🇱🇻", cap: "Riga", pop: "1.9M", cont: "Europe", bcp: "lv-LV" },
    LIE: { lang: "German", fam: "Indo-European (Germanic)", flag: "🇱🇮", cap: "Vaduz", pop: "39K", cont: "Europe", bcp: "de-LI" },
    LTU: { lang: "Lithuanian", fam: "Indo-European (Baltic)", flag: "🇱🇹", cap: "Vilnius", pop: "2.8M", cont: "Europe", bcp: "lt-LT" },
    LUX: { lang: "Luxembourgish, French & German", fam: "Indo-European (Germanic)", flag: "🇱🇺", cap: "Luxembourg", pop: "650K", cont: "Europe", bcp: "lb-LU" },
    MLT: { lang: "Maltese & English", fam: "Afroasiatic (Semitic)", flag: "🇲🇹", cap: "Valletta", pop: "530K", cont: "Europe", bcp: "mt-MT" },
    MDA: { lang: "Romanian", fam: "Indo-European (Romance)", flag: "🇲🇩", cap: "Chișinău", pop: "2.6M", cont: "Europe", bcp: "ro-MD" },
    MCO: { lang: "French & Monégasque", fam: "Indo-European (Romance)", flag: "🇲🇨", cap: "Monaco", pop: "39K", cont: "Europe", bcp: "fr-MC" },
    MNE: { lang: "Montenegrin", fam: "Indo-European (Slavic)", flag: "🇲🇪", cap: "Podgorica", pop: "620K", cont: "Europe", bcp: "sr-ME" },
    MKD: { lang: "Macedonian & Albanian", fam: "Indo-European (Slavic)", flag: "🇲🇰", cap: "Skopje", pop: "2.1M", cont: "Europe", bcp: "mk-MK" },
    ROU: { lang: "Romanian", fam: "Indo-European (Romance)", flag: "🇷🇴", cap: "Bucharest", pop: "19M", cont: "Europe", bcp: "ro-RO" },
    SMR: { lang: "Italian", fam: "Indo-European (Romance)", flag: "🇸🇲", cap: "San Marino", pop: "34K", cont: "Europe", bcp: "it-SM" },
    SRB: { lang: "Serbian", fam: "Indo-European (Slavic)", flag: "🇷🇸", cap: "Belgrade", pop: "6.8M", cont: "Europe", bcp: "sr-RS" },
    SVK: { lang: "Slovak", fam: "Indo-European (Slavic)", flag: "🇸🇰", cap: "Bratislava", pop: "5.4M", cont: "Europe", bcp: "sk-SK" },
    SVN: { lang: "Slovene", fam: "Indo-European (Slavic)", flag: "🇸🇮", cap: "Ljubljana", pop: "2.1M", cont: "Europe", bcp: "sl-SI" },
    VAT: { lang: "Latin & Italian", fam: "Indo-European (Romance)", flag: "🇻🇦", cap: "Vatican City", pop: "800", cont: "Europe", bcp: "la-VA" },

    // AFRICA
    DZA: { lang: "Arabic & Berber (Tamazight)", fam: "Afroasiatic (Semitic)", flag: "🇩🇿", cap: "Algiers", pop: "45M", cont: "Africa", bcp: "ar-DZ" },
    AGO: { lang: "Portuguese", fam: "Indo-European (Romance)", flag: "🇦🇴", cap: "Luanda", pop: "35M", cont: "Africa", bcp: "pt-AO" },
    BEN: { lang: "French, Fon & Yoruba", fam: "Niger-Congo", flag: "🇧🇯", cap: "Porto-Novo", pop: "13M", cont: "Africa", bcp: "fr-BJ" },
    BWA: { lang: "Setswana & English", fam: "Niger-Congo (Bantu)", flag: "🇧🇼", cap: "Gaborone", pop: "2.6M", cont: "Africa", bcp: "tn-BW" },
    BFA: { lang: "French, Mossi & Fula", fam: "Niger-Congo", flag: "🇧🇫", cap: "Ouagadougou", pop: "22M", cont: "Africa", bcp: "fr-BF" },
    BDI: { lang: "Kirundi & French", fam: "Niger-Congo (Bantu)", flag: "🇧🇮", cap: "Gitega", pop: "12.8M", cont: "Africa", bcp: "rn-BI" },
    CMR: { lang: "French & English", fam: "Niger-Congo (Bantu)", flag: "🇨🇲", cap: "Yaoundé", pop: "28M", cont: "Africa", bcp: "fr-CM" },
    CPV: { lang: "Portuguese & Cape Verdean Creole", fam: "Indo-European (Romance)", flag: "🇨🇻", cap: "Praia", pop: "590K", cont: "Africa", bcp: "pt-CV" },
    CAF: { lang: "Sango & French", fam: "Niger-Congo", flag: "🇨🇫", cap: "Bangui", pop: "5.5M", cont: "Africa", bcp: "sg-CF" },
    TCD: { lang: "Arabic & French", fam: "Afroasiatic (Semitic)", flag: "🇹🇩", cap: "N'Djamena", pop: "18M", cont: "Africa", bcp: "ar-TD" },
    COM: { lang: "Comorian, Arabic & French", fam: "Niger-Congo (Bantu)", flag: "🇰🇲", cap: "Moroni", pop: "850K", cont: "Africa", bcp: "fr-KM" },
    COG: { lang: "French, Lingala & Kituba", fam: "Niger-Congo (Bantu)", flag: "🇨🇬", cap: "Brazzaville", pop: "6M", cont: "Africa", bcp: "fr-CG" },
    COD: { lang: "French, Lingala, Swahili, Kongo & Luba", fam: "Niger-Congo (Bantu)", flag: "🇨🇩", cap: "Kinshasa", pop: "100M", cont: "Africa", bcp: "fr-CD" },
    CIV: { lang: "French, Baoulé & Dioula", fam: "Niger-Congo", flag: "🇨🇮", cap: "Yamoussoukro", pop: "29M", cont: "Africa", bcp: "fr-CI" },
    DJI: { lang: "Arabic, Somali, Afar & French", fam: "Afroasiatic (Cushitic/Chadic)", flag: "🇩🇯", cap: "Djibouti", pop: "1.1M", cont: "Africa", bcp: "ar-DJ" },
    GNQ: { lang: "Spanish, French & Portuguese", fam: "Indo-European (Romance)", flag: "🇬🇶", cap: "Malabo", pop: "1.6M", cont: "Africa", bcp: "es-GQ" },
    ERI: { lang: "Tigrinya, Arabic & English", fam: "Afroasiatic (Semitic)", flag: "🇪🇷", cap: "Asmara", pop: "3.6M", cont: "Africa", bcp: "ti-ER" },
    SWZ: { lang: "siSwati & English", fam: "Niger-Congo (Bantu)", flag: "🇸🇿", cap: "Mbabane", pop: "1.2M", cont: "Africa", bcp: "ss-SZ" },
    GAB: { lang: "French & Fang", fam: "Niger-Congo (Bantu)", flag: "🇬🇦", cap: "Libreville", pop: "2.3M", cont: "Africa", bcp: "fr-GA" },
    GMB: { lang: "English, Mandinka & Wolof", fam: "Niger-Congo", flag: "🇬🇲", cap: "Banjul", pop: "2.6M", cont: "Africa", bcp: "en-GM" },
    GHA: { lang: "English, Akan (Twi) & Ga", fam: "Niger-Congo", flag: "🇬🇭", cap: "Accra", pop: "33M", cont: "Africa", bcp: "en-GH" },
    GIN: { lang: "French, Pular & Maninka", fam: "Niger-Congo", flag: "🇬🇳", cap: "Conakry", pop: "14M", cont: "Africa", bcp: "fr-GN" },
    GNB: { lang: "Portuguese & Guinea-Bissau Creole", fam: "Indo-European (Romance)", flag: "🇬🇼", cap: "Bissau", pop: "2.1M", cont: "Africa", bcp: "pt-GW" },
    LSO: { lang: "Sesotho & English", fam: "Niger-Congo (Bantu)", flag: "🇱🇸", cap: "Maseru", pop: "2.3M", cont: "Africa", bcp: "st-LS" },
    LBR: { lang: "English & Kpelle", fam: "Indo-European (Germanic)", flag: "🇱🇷", cap: "Monrovia", pop: "5.3M", cont: "Africa", bcp: "en-LR" },
    LBY: { lang: "Arabic", fam: "Afroasiatic (Semitic)", flag: "🇱🇾", cap: "Tripoli", pop: "6.8M", cont: "Africa", bcp: "ar-LY" },
    MDG: { lang: "Malagasy & French", fam: "Austronesian", flag: "🇲🇬", cap: "Antananarivo", pop: "29M", cont: "Africa", bcp: "mg-MG" },
    MWI: { lang: "Chichewa & English", fam: "Niger-Congo (Bantu)", flag: "🇲🇼", cap: "Lilongwe", pop: "20M", cont: "Africa", bcp: "ny-MW" },
    MLI: { lang: "Bambara & French", fam: "Niger-Congo", flag: "🇲🇱", cap: "Bamako", pop: "22M", cont: "Africa", bcp: "bm-ML" },
    MRT: { lang: "Arabic, Pulaar & Soninke", fam: "Afroasiatic (Semitic)", flag: "🇲🇷", cap: "Nouakchott", pop: "4.7M", cont: "Africa", bcp: "ar-MR" },
    MUS: { lang: "Mauritian Creole, English & French", fam: "Indo-European (Romance)", flag: "🇲🇺", cap: "Port Louis", pop: "1.3M", cont: "Africa", bcp: "fr-MU" },
    MAR: { lang: "Arabic & Berber (Tamazight)", fam: "Afroasiatic (Semitic)", flag: "🇲🇦", cap: "Rabat", pop: "37M", cont: "Africa", bcp: "ar-MA" },
    MOZ: { lang: "Portuguese & Emakhuwa", fam: "Indo-European (Romance)", flag: "🇲🇿", cap: "Maputo", pop: "33M", cont: "Africa", bcp: "pt-MZ" },
    NAM: { lang: "English, Oshiwambo & Afrikaans", fam: "Indo-European (Germanic)", flag: "🇳🇦", cap: "Windhoek", pop: "2.6M", cont: "Africa", bcp: "en-NA" },
    NER: { lang: "French, Hausa & Zarma", fam: "Afroasiatic (Cushitic/Chadic)", flag: "🇳🇪", cap: "Niamey", pop: "26M", cont: "Africa", bcp: "fr-NE" },
    RWA: { lang: "Kinyarwanda, English, French & Swahili", fam: "Niger-Congo (Bantu)", flag: "🇷🇼", cap: "Kigali", pop: "13.5M", cont: "Africa", bcp: "rw-RW" },
    STP: { lang: "Portuguese & Forro Creole", fam: "Indo-European (Romance)", flag: "🇸🇹", cap: "São Tomé", pop: "220K", cont: "Africa", bcp: "pt-ST" },
    SEN: { lang: "Wolof & French", fam: "Niger-Congo (West African)", flag: "🇸🇳", cap: "Dakar", pop: "17M", cont: "Africa", bcp: "wo-SN" },
    SYC: { lang: "Seychellois Creole, English & French", fam: "Indo-European (Romance)", flag: "🇸🇨", cap: "Victoria", pop: "100K", cont: "Africa", bcp: "fr-SC" },
    SLE: { lang: "English & Krio", fam: "Indo-European (Germanic)", flag: "🇸🇱", cap: "Freetown", pop: "8.6M", cont: "Africa", bcp: "en-SL" },
    SOM: { lang: "Somali & Arabic", fam: "Afroasiatic (Cushitic/Chadic)", flag: "🇸🇴", cap: "Mogadishu", pop: "17M", cont: "Africa", bcp: "so-SO" },
    SSD: { lang: "English & Juba Arabic", fam: "Indo-European (Germanic)", flag: "🇸🇸", cap: "Juba", pop: "11M", cont: "Africa", bcp: "en-SS" },
    SDN: { lang: "Arabic & English", fam: "Afroasiatic (Semitic)", flag: "🇸🇩", cap: "Khartoum", pop: "46M", cont: "Africa", bcp: "ar-SD" },
    TZA: { lang: "Swahili & English", fam: "Niger-Congo (Bantu)", flag: "🇹🇿", cap: "Dodoma", pop: "65M", cont: "Africa", bcp: "sw-TZ" },
    TGO: { lang: "French, Ewe & Kabiye", fam: "Niger-Congo", flag: "🇹🇬", cap: "Lomé", pop: "8.8M", cont: "Africa", bcp: "fr-TG" },
    TUN: { lang: "Arabic (Tunisian Derja)", fam: "Afroasiatic (Semitic)", flag: "🇹🇳", cap: "Tunis", pop: "12M", cont: "Africa", bcp: "ar-TN" },
    UGA: { lang: "English & Swahili", fam: "Niger-Congo (Bantu)", flag: "🇺🇬", cap: "Kampala", pop: "47M", cont: "Africa", bcp: "en-UG" },
    ZMB: { lang: "English, Bemba & Nyanja", fam: "Niger-Congo (Bantu)", flag: "🇿🇲", cap: "Lusaka", pop: "20M", cont: "Africa", bcp: "en-ZM" },
    ZWE: { lang: "Shona, Ndebele & English", fam: "Niger-Congo (Bantu)", flag: "🇿🇼", cap: "Harare", pop: "16M", cont: "Africa", bcp: "sn-ZW" },

    // AMERICAS & CARIBBEAN
    ATG: { lang: "English & Antiguan Creole", fam: "Indo-European (Germanic)", flag: "🇦🇬", cap: "St. John's", pop: "94K", cont: "North America", bcp: "en-AG" },
    BHS: { lang: "English & Bahamian Creole", fam: "Indo-European (Germanic)", flag: "🇧🇸", cap: "Nassau", pop: "410K", cont: "North America", bcp: "en-BS" },
    BRB: { lang: "English & Bajan", fam: "Indo-European (Germanic)", flag: "🇧🇧", cap: "Bridgetown", pop: "280K", cont: "North America", bcp: "en-BB" },
    BLZ: { lang: "English, Belizean Creole & Spanish", fam: "Indo-European (Germanic)", flag: "🇧🇿", cap: "Belmopan", pop: "400K", cont: "North America", bcp: "en-BZ" },
    CRI: { lang: "Spanish (Costa Rican)", fam: "Indo-European (Romance)", flag: "🇨🇷", cap: "San José", pop: "5.2M", cont: "North America", bcp: "es-CR" },
    CUB: { lang: "Spanish (Cuban)", fam: "Indo-European (Romance)", flag: "🇨🇺", cap: "Havana", pop: "11M", cont: "North America", bcp: "es-CU" },
    DMA: { lang: "English & Dominican Creole", fam: "Indo-European (Germanic)", flag: "🇩🇲", cap: "Roseau", pop: "72K", cont: "North America", bcp: "en-DM" },
    DOM: { lang: "Spanish (Dominican)", fam: "Indo-European (Romance)", flag: "🇩🇴", cap: "Santo Domingo", pop: "11M", cont: "North America", bcp: "es-DO" },
    ECU: { lang: "Spanish, Kichwa & Shuar", fam: "Indo-European (Romance)", flag: "🇪🇨", cap: "Quito", pop: "18M", cont: "South America", bcp: "es-EC" },
    SLV: { lang: "Spanish (Salvadoran)", fam: "Indo-European (Romance)", flag: "🇸🇻", cap: "San Salvador", pop: "6.3M", cont: "North America", bcp: "es-SV" },
    GRD: { lang: "English & Grenadian Creole", fam: "Indo-European (Germanic)", flag: "🇬🇩", cap: "St. George's", pop: "125K", cont: "North America", bcp: "en-GD" },
    GTM: { lang: "Spanish & Mayan Languages", fam: "Indo-European (Romance)", flag: "🇬🇹", cap: "Guatemala City", pop: "18M", cont: "North America", bcp: "es-GT" },
    GUY: { lang: "English & Guyanese Creole", fam: "Indo-European (Germanic)", flag: "🇬🇾", cap: "Georgetown", pop: "800K", cont: "South America", bcp: "en-GY" },
    HTI: { lang: "Haitian Creole & French", fam: "Indo-European (Romance)", flag: "🇭🇹", cap: "Port-au-Prince", pop: "11.5M", cont: "North America", bcp: "ht-HT" },
    HND: { lang: "Spanish & Garifuna", fam: "Indo-European (Romance)", flag: "🇭🇳", cap: "Tegucigalpa", pop: "10M", cont: "North America", bcp: "es-HN" },
    JAM: { lang: "English & Jamaican Patois", fam: "Indo-European (Germanic)", flag: "🇯🇲", cap: "Kingston", pop: "2.8M", cont: "North America", bcp: "en-JM" },
    NIC: { lang: "Spanish & Miskito", fam: "Indo-European (Romance)", flag: "🇳🇮", cap: "Managua", pop: "7M", cont: "North America", bcp: "es-NI" },
    PAN: { lang: "Spanish & Ngäbere", fam: "Indo-European (Romance)", flag: "🇵🇦", cap: "Panama City", pop: "4.4M", cont: "North America", bcp: "es-PA" },
    PRY: { lang: "Guarani & Spanish", fam: "Indigenous American", flag: "🇵🇾", cap: "Asunción", pop: "6.8M", cont: "South America", bcp: "es-PY" },
    KNA: { lang: "English & Kittitian Creole", fam: "Indo-European (Germanic)", flag: "🇰🇳", cap: "Basseterre", pop: "48K", cont: "North America", bcp: "en-KN" },
    LCA: { lang: "English & Saint Lucian Creole", fam: "Indo-European (Germanic)", flag: "🇱🇨", cap: "Castries", pop: "180K", cont: "North America", bcp: "en-LC" },
    VCT: { lang: "English & Vincentian Creole", fam: "Indo-European (Germanic)", flag: "🇻🇨", cap: "Kingstown", pop: "104K", cont: "North America", bcp: "en-VC" },
    SUR: { lang: "Dutch, Sranan Tongo & Sarnami", fam: "Indo-European (Germanic)", flag: "🇸🇷", cap: "Paramaribo", pop: "620K", cont: "South America", bcp: "nl-SR" },
    TTO: { lang: "English, Trinidadian Creole & Bhojpuri", fam: "Indo-European (Germanic)", flag: "🇹🇹", cap: "Port of Spain", pop: "1.5M", cont: "North America", bcp: "en-TT" },
    URY: { lang: "Spanish (Rioplatense / Portuñol)", fam: "Indo-European (Romance)", flag: "🇺🇾", cap: "Montevideo", pop: "3.5M", cont: "South America", bcp: "es-UY" },
    VEN: { lang: "Spanish (Venezuelan) & Wayuu", fam: "Indo-European (Romance)", flag: "🇻🇪", cap: "Caracas", pop: "29M", cont: "South America", bcp: "es-VE" },

    // OCEANIA
    KIR: { lang: "Gilbertese (Taetae ni Kiribati) & English", fam: "Austronesian", flag: "🇰🇮", cap: "South Tarawa", pop: "130K", cont: "Oceania", bcp: "en-KI" },
    MHL: { lang: "Marshallese & English", fam: "Austronesian", flag: "🇲🇭", cap: "Majuro", pop: "42K", cont: "Oceania", bcp: "en-MH" },
    FSM: { lang: "English, Chuukese, Pohnpeian & Yapese", fam: "Austronesian", flag: "🇫🇲", cap: "Palikir", pop: "115K", cont: "Oceania", bcp: "en-FM" },
    NRU: { lang: "Nauruan & English", fam: "Austronesian", flag: "🇳🇷", cap: "Yaren", pop: "12K", cont: "Oceania", bcp: "en-NR" },
    PLW: { lang: "Palauan & English", fam: "Austronesian", flag: "🇵🇼", cap: "Ngerulmud", pop: "18K", cont: "Oceania", bcp: "en-PW" },
    WSM: { lang: "Samoan & English", fam: "Austronesian", flag: "🇼🇸", cap: "Apia", pop: "220K", cont: "Oceania", bcp: "sm-WS" },
    SLB: { lang: "Pijin & English", fam: "English-based Creole", flag: "🇸🇧", cap: "Honiara", pop: "720K", cont: "Oceania", bcp: "en-SB" },
    TON: { lang: "Tongan & English", fam: "Austronesian", flag: "🇹🇴", cap: "Nuku'alofa", pop: "105K", cont: "Oceania", bcp: "to-TO" },
    TUV: { lang: "Tuvaluan & English", fam: "Austronesian", flag: "🇹🇻", cap: "Funafuti", pop: "11K", cont: "Oceania", bcp: "en-TV" },
    VUT: { lang: "Bislama, English & French", fam: "English-based Creole", flag: "🇻🇺", cap: "Port Vila", pop: "320K", cont: "Oceania", bcp: "bi-VU" },

    // TERRITORIES & OTHER
    GRL: { lang: "Kalaallisut (Greenlandic) & Danish", fam: "Inuit-Yupik-Unangan", flag: "🇬🇱", cap: "Nuuk", pop: "56K", cont: "North America", bcp: "kl-GL" },
    PRI: { lang: "Spanish & English", fam: "Indo-European (Romance)", flag: "🇵🇷", cap: "San Juan", pop: "3.2M", cont: "North America", bcp: "es-PR" },
    HKG: { lang: "Cantonese & English", fam: "Sino-Tibetan", flag: "🇭🇰", cap: "Hong Kong", pop: "7.5M", cont: "Asia", bcp: "zh-HK" },
    MAC: { lang: "Cantonese & Portuguese", fam: "Sino-Tibetan", flag: "🇲🇴", cap: "Macau", pop: "680K", cont: "Asia", bcp: "zh-MO" },
    NCL: { lang: "French & Kanak Languages", fam: "Indo-European (Romance)", flag: "🇳🇨", cap: "Nouméa", pop: "270K", cont: "Oceania", bcp: "fr-NC" },
    PYF: { lang: "French & Tahitian", fam: "Indo-European (Romance)", flag: "🇵🇫", cap: "Papeete", pop: "280K", cont: "Oceania", bcp: "fr-PF" },
    GUM: { lang: "English & Chamorro", fam: "Austronesian", flag: "🇬🇺", cap: "Hagåtña", pop: "170K", cont: "Oceania", bcp: "en-GU" },
    BMU: { lang: "English & Bermudian English", fam: "Indo-European (Germanic)", flag: "🇧🇲", cap: "Hamilton", pop: "64K", cont: "North America", bcp: "en-BM" }
  };

  const d = defaults[iso3] || {};
  const langName = d.lang || "Official Language";
  const fam = d.fam || "Indo-European";
  const bcp = d.bcp || "en-US";
  const flag = d.flag || "🌐";
  const cap = d.cap || "Capital City";
  const pop = d.pop || "Populous";
  const cont = d.cont || "Global";

  function inferBuildScript(iso, b, langLabel) {
    if (['SAU','EGY','IRQ','SYR','JOR','LBN','PSE','YEM','OMN','ARE','QAT','BHR','KWT','LBY','TUN','DZA','ESH'].includes(iso) || b.startsWith('ar')) return 'Arabic';
    if (b.startsWith('ru') || b.startsWith('bg') || b.startsWith('sr') || b.startsWith('be') || b.startsWith('mk') || b.startsWith('ky') || b.startsWith('tg') || iso === 'KAZ' || iso === 'MNG') return 'Cyrillic';
    if (b.startsWith('zh') || iso === 'TWN') return 'Hanzi';
    if (b.startsWith('ko')) return 'Hangul';
    if (b.startsWith('he')) return 'Hebrew Alphabet';
    if (b.startsWith('el')) return 'Greek Alphabet';
    if (b.startsWith('hy')) return 'Armenian Alphabet';
    if (b.startsWith('ka')) return 'Georgian (Mkhedruli)';
    if (b.startsWith('bn')) return 'Bengali–Assamese';
    if (b.startsWith('ne') || b.startsWith('hi')) return 'Devanagari';
    if (b.startsWith('si')) return 'Sinhala Script';
    if (b.startsWith('lo')) return 'Lao Script';
    if (b.startsWith('km')) return 'Khmer Script';
    if (b.startsWith('my')) return 'Burmese Script';
    if (b.startsWith('dz')) return 'Tibetan Script';
    if (b.startsWith('dv')) return 'Thaana';
    if (b.startsWith('ti') || b.startsWith('am')) return 'Geʻez Script';
    return 'Latin';
  }

  const parts = langName.split('&');
  const primaryPart = parts[0].trim();
  const secondaryPart = parts[1] ? parts[1].trim() : '';

  return {
    iso3: iso3, iso2: iso2, geoName: name, commonName: name,
    officialName: name, nativeName: name, flag: flag,
    capital: cap, population: pop, continent: cont,
    primaryLanguage: langName, languageFamily: fam,
    diversityLevel: "Multilingual & Dialect Diversity",
    summary: `${name} has a rich linguistic tapestry centered around ${langName}, reflecting its cultural heritage, historical migrations, and regional identity.`,
    languages: [
      { name: primaryPart, nativeName: primaryPart, type: "Official State Language", percentage: "75%", speakers: pop, family: fam, script: inferBuildScript(iso3, bcp, primaryPart), bcp47: bcp, regions: "Nationwide", notes: `Principal medium of education, administration, and cultural life in ${name}.` },
      ...(secondaryPart ? [{ name: secondaryPart, nativeName: secondaryPart, type: "Recognized Co-official / National", percentage: "25%", speakers: "Substantial", family: fam, script: inferBuildScript(iso3, bcp, secondaryPart), bcp47: bcp, regions: "Regional & Urban Centers", notes: `Widely spoken alongside the principal language.` }] : [])
    ],
    accents: [
      { name: `Standard ${name}`, region: "Capital & Major Cities", description: "Clear enunciation, national broadcast cadence, formal administrative register.", sample: `Official greeting and standard expressions heard across ${name}.` },
      { name: `Regional ${name}`, region: "Provinces & Rural Coast", description: "Local melodic rhythm, distinctive colloquial vocabulary, and cultural idioms.", sample: `Traditional folk sayings and vibrant daily regional conversations.` }
    ],
    phrases: [
      { type: "Greeting", text: "Hello / Greetings!", phonetic: "heh-LOH", bcp47: bcp },
      { type: "Thank You", text: "Thank you very much!", phonetic: "thank yoo", bcp47: bcp },
      { type: "Goodbye", text: "Goodbye / See you again!", phonetic: "good-BYE", bcp47: bcp },
      { type: "Welcome", text: "Welcome!", phonetic: "WEL-kum", bcp47: bcp }
    ],
    funFact: `${name} preserves unique phonetic traditions and historical linguistic heritage celebrated by its local communities!`
  };
}

// Compile the comprehensive dictionary
const compiled = {};
const nameToIsoMap = {};

for (const f of geoData.features) {
  const p = f.properties;
  const iso3 = (p.iso_a3 && p.iso_a3 !== '-99') ? p.iso_a3 : p.name;
  const iso2 = p.iso_a2 || '';
  const name = p.name;

  let countryObj = master[iso3] || master[p.iso_a3];

  if (!countryObj) {
    // Check if any existing entry matches commonName or geoName
    const matchKey = Object.keys(master).find(k => master[k].commonName === name || master[k].geoName === name);
    if (matchKey) {
      countryObj = master[matchKey];
    }
  }

  if (!countryObj) {
    countryObj = getLanguageDefaults(name, iso3, iso2);
  }

  // Assign centroid coordinates
  countryObj.centroid = centroidMap[iso3] || centroidMap[name] || [0, 0];
  countryObj.name = countryObj.name || countryObj.commonName || countryObj.geoName || name;
  countryObj.commonName = countryObj.name;
  countryObj.geoName = name;
  countryObj.iso3 = iso3;
  if (!countryObj.iso2 && iso2) countryObj.iso2 = iso2;

  // Resolve color from languageFamily
  countryObj.color = getFamilyColor(countryObj.languageFamily);

  // Save by ISO3 and by Name for instant lookup
  compiled[iso3] = countryObj;
  compiled[name] = countryObj;
  nameToIsoMap[name] = iso3;
}

console.log('Total entries compiled:', Object.keys(compiled).length);

// 1. JSON output
const jsonPath = path.join(__dirname, '../data/languages.json');
fs.writeFileSync(jsonPath, JSON.stringify(compiled, null, 2));
console.log('Successfully wrote', jsonPath, 'size:', fs.statSync(jsonPath).size, 'bytes');

// 2. JS output for direct file:// execution without CORS restrictions
const jsLangPath = path.join(__dirname, '../data/languages.js');
fs.writeFileSync(jsLangPath, 'window.WORLD_LANGUAGES = ' + JSON.stringify(compiled) + ';\n');
console.log('Successfully wrote', jsLangPath, 'size:', fs.statSync(jsLangPath).size, 'bytes');

// 3. GeoJSON JS output for direct file:// execution without CORS restrictions
const jsGeoPath = path.join(__dirname, '../data/world_countries.js');
fs.writeFileSync(jsGeoPath, 'window.WORLD_GEOJSON = ' + JSON.stringify(geoData) + ';\n');
console.log('Successfully wrote', jsGeoPath, 'size:', fs.statSync(jsGeoPath).size, 'bytes');
