// scripts/update_language_colors.js
// Assigns language-specific colors so countries sharing the same language have the exact same color,
// and related languages have harmonized similar hues.

const fs = require('fs');
const path = require('path');

// 1. Language Color Master Palette
// Languages sharing a family share a chromatic realm, but have distinct individual colors.
const LANGUAGE_COLORS = {
  // === ROMANCE BRANCH (Pinks, Roses, Reds, Corals, Magentas) ===
  'Spanish': '#e11d48',            // Rose Red (Shared by all 21 Spanish-speaking countries!)
  'Portuguese': '#f43f5e',         // Bright Coral-Rose (Brazil, Portugal, Angola, Mozambique, etc.)
  'French': '#c026d3',             // Fuchsia / Magenta (France, Canada-QC, Senegal, DRC, etc.)
  'Italian': '#e879f9',            // Light Orchid / Magenta (Italy, San Marino, Switzerland)
  'Romanian': '#be123c',           // Deep Crimson (Romania, Moldova)
  'Catalan': '#fb7185',            // Salmon Pink (Andorra)

  // === GERMANIC BRANCH (Blues, Cyans, Navies, Sky Blues) ===
  'English': '#0284c7',            // Ocean Blue (USA, UK, Canada, Australia, NZ, Ireland, etc.)
  'German': '#1d4ed8',             // Deep Sapphire Blue (Germany, Austria, Switzerland, Liechtenstein)
  'Dutch': '#06b6d4',              // Vibrant Cyan (Netherlands, Suriname, Belgium)
  'Swedish': '#38bdf8',            // Sky Blue (Sweden, Åland)
  'Norwegian': '#0ea5e9',          // Bright Nordic Azure (Norway)
  'Danish': '#67e8f9',             // Ice Blue (Denmark, Greenland)
  'Afrikaans': '#0369a1',          // Cobalt Blue (South Africa)
  'Icelandic': '#93c5fd',          // Arctic Glacier Blue (Iceland)
  'Luxembourgish': '#06b6d4',      // Vibrant Cyan (Luxembourg)

  // === SLAVIC BRANCH (Purples, Violets, Indigos) ===
  'Russian': '#4f46e5',            // Deep Indigo (Russia, Belarus, Kazakhstan, Kyrgyzstan)
  'Ukrainian': '#6366f1',          // Periwinkle Indigo (Ukraine)
  'Polish': '#7c3aed',             // Vivid Purple (Poland)
  'Serbo-Croatian': '#8b5cf6',     // Violet (Serbia, Croatia, Bosnia, Montenegro)
  'Czech': '#a855f7',              // Bright Violet (Czechia)
  'Slovak': '#c084fc',             // Lavender Violet (Slovakia)
  'Bulgarian': '#6d28d9',          // Dark Violet (Bulgaria)
  'Macedonian': '#7e22ce',         // Purple (North Macedonia)
  'Slovene': '#9333ea',            // Purple Orchid (Slovenia)
  'Belarusian': '#5b21b6',         // Deep Indigo (Belarus)

  // === SEMITIC & AFROASIATIC (Golds, Desert Ambers, Sands) ===
  'Arabic': '#eab308',             // Pure Desert Gold (Shared across 22 Arab countries!)
  'Hebrew': '#facc15',             // Bright Sun Gold (Israel)
  'Amharic': '#ca8a04',            // Bronze Gold (Ethiopia)
  'Tigrinya': '#a16207',           // Antique Gold (Eritrea)
  'Somali': '#d97706',             // Amber Sand (Somalia, Somaliland, Djibouti)
  'Berber': '#854d0e',             // Desert Bronze

  // === INDO-IRANIAN & INDO-ARYAN (Saffrons, Warm Ambers, Teals) ===
  'Hindi': '#f59e0b',              // Warm Saffron Gold (India)
  'Urdu': '#d97706',               // Deep Amber (Pakistan)
  'Bengali': '#ea580c',            // Spiced Orange (Bangladesh)
  'Persian': '#0d9488',            // Persian Turquoise / Teal (Iran, Afghanistan-Dari, Tajikistan)
  'Pashto': '#14b8a6',             // Soft Teal (Afghanistan, Pakistan)
  'Punjabi': '#fb923c',            // Tangerine
  'Nepali': '#fdba74',             // Light Saffron (Nepal)
  'Sinhala': '#fed7aa',            // Golden Sand (Sri Lanka)
  'Kurdish': '#059669',            // Mountain Emerald

  // === HELLENIC, BALTIC & OTHER INDO-EUROPEAN ===
  'Greek': '#2563eb',              // Aegean Blue (Greece, Cyprus)
  'Irish': '#10b981',              // Emerald Green (Ireland)
  'Lithuanian': '#4338ca',         // Baltic Indigo (Lithuania)
  'Latvian': '#3730a3',            // Baltic Navy (Latvia)
  'Albanian': '#b91c1c',           // Illyrian Dark Red (Albania, Kosovo)
  'Armenian': '#c2410c',           // Apricot Copper (Armenia)

  // === SINO-TIBETAN (Crimsons, Scarlet Reds, Ruby) ===
  'Mandarin': '#dc2626',           // Imperial Chinese Scarlet (China, Taiwan, Singapore)
  'Cantonese': '#ef4444',          // Crimson Red (Hong Kong, Macao)
  'Burmese': '#b91c1c',            // Ruby Red (Myanmar)
  'Tibetan': '#991b1b',            // Deep Maroon
  'Dzongkha': '#7f1d1d',           // Himalayan Red (Bhutan)

  // === JAPONIC & KOREANIC (Cherry Blossom Pinks, Hot Pinks) ===
  'Japanese': '#ec4899',           // Cherry Blossom Pink (Japan)
  'Korean': '#f472b6',             // Radiant Rose-Pink (South Korea, North Korea)

  // === AUSTRONESIAN (Jades, Emeralds, Mints) ===
  'Indonesian': '#10b981',         // Tropical Jade Green (Indonesia)
  'Malay': '#059669',              // Rainforest Emerald (Malaysia, Brunei)
  'Tagalog': '#34d399',            // Mint Aqua (Philippines)
  'Malagasy': '#6ee7b7',           // Island Seafoam (Madagascar)
  'Fijian': '#059669',             // South Pacific Emerald (Fiji)
  'Samoan': '#10b981',             // Coral Green (Samoa)
  'Māori': '#047857',              // Pounamu Jade (New Zealand)

  // === NIGER-CONGO (Vibrant Greens, Lime, Jungle) ===
  'Swahili': '#16a34a',            // Savannah Green (Kenya, Tanzania, Uganda, Rwanda)
  'Yoruba': '#65a30d',             // Lime Olive Green (Nigeria, Benin)
  'Igbo': '#84cc16',               // Bright Palm Green (Nigeria)
  'Hausa': '#4d7c0f',              // Sahelian Olive (Nigeria, Niger)
  'Zulu': '#15803d',               // Deep Grass Green (South Africa)
  'Shona': '#4ade80',              // Spring Green (Zimbabwe)
  'Lingala': '#22c55e',            // Congo Basin Green (DR Congo, Congo)
  'Wolof': '#86efac',              // Light Mint (Senegal)
  'Chichewa': '#16a34a',           // Malawi Green (Malawi)

  // === TURKIC (Royal Violets & Amethysts) ===
  'Turkish': '#9333ea',            // Anatolian Amethyst (Turkey, Northern Cyprus)
  'Azerbaijani': '#7e22ce',        // Caspian Violet (Azerbaijan)
  'Kazakh': '#a855f7',             // Steppe Purple (Kazakhstan)
  'Uzbek': '#8b5cf6',              // Silk Road Iris (Uzbekistan)
  'Turkmen': '#6d28d9',            // Desert Purple (Turkmenistan)
  'Kyrgyz': '#c084fc',             // Mountain Lavender (Kyrgyzstan)

  // === URALIC (Bright Teals & Turquoise) ===
  'Finnish': '#14b8a6',            // Nordic Turquoise (Finland)
  'Estonian': '#0d9488',           // Baltic Teal (Estonia)
  'Hungarian': '#2dd4bf',          // Danube Aquamarine (Hungary)

  // === DRAVIDIAN ===
  'Tamil': '#ea580c',              // Deep Dravidian Orange (Sri Lanka, South India)
  'Telugu': '#f97316',             // Warm Orange

  // === AUSTROASIATIC & KRA-DAI ===
  'Vietnamese': '#84cc16',         // Bamboo Lime Green (Vietnam)
  'Khmer': '#a3e635',              // Angkor Chartreuse (Cambodia)
  'Thai': '#a855f7',               // Siamese Purple (Thailand)
  'Lao': '#c084fc',                // Mekong Violet (Laos)

  // === INDIGENOUS AMERICAN & CREOLE ===
  'Guarani': '#f97316',            // Chaco Orange (Paraguay)
  'Quechua': '#ea580c',            // Incan Terra Cotta (Bolivia, Peru)
  'Aymara': '#fb923c',             // Altiplano Amber (Bolivia)
  'Inuktitut': '#38bdf8',          // Arctic Blue (Greenland)
  'Haitian Creole': '#c026d3',      // Creole Magenta (Haiti)
  'Tok Pisin': '#10b981',          // Melanesian Green (Papua New Guinea)
  'Pijin': '#10b981',              // Melanesian Creole (Solomon Islands)
  'Seychellois Creole': '#c026d3', // Creole Magenta (Seychelles)
  'Mauritian Creole': '#c026d3',   // Creole Magenta (Mauritius)

  // === PACIFIC, AFRICAN & OTHER CANONICAL TONGUES ===
  'Comorian': '#16a34a',           // Sabaki Bantu (Comoros)
  'Maltese': '#d97706',            // Semitic Latin Amber (Malta)
  'Kinyarwanda': '#10b981',        // Great Lakes Emerald (Rwanda)
  'Setswana': '#10b981',           // Kalahari Emerald (Botswana)
  'Sesotho': '#10b981',            // Maloti Mountain Green (Lesotho)
  'siSwati': '#10b981',            // Swazi Green (Eswatini)
  'Faroese': '#38bdf8',            // North Atlantic Azure (Faroe Islands)
  'Bislama': '#10b981',            // Island Melanesian Green (Vanuatu)
  'Tongan': '#14b8a6',             // Polynesian Teal (Tonga)
  'Gilbertese': '#14b8a6',         // Micronesian Teal (Kiribati)
  'Tuvaluan': '#14b8a6',           // Polynesian Teal (Tuvalu)
  'Marshallese': '#14b8a6',        // Atoll Teal (Marshall Islands)
  'Palauan': '#14b8a6',            // Micronesian Teal (Palau)
  'Nauruan': '#14b8a6',            // Island Teal (Nauru)
  'Tetum': '#059669',              // Timor Emerald (Timor-Leste)
  'Bambara': '#4d7c0f',            // Sahelian Green (Mali)
  'Kirundi': '#10b981',            // Great Lakes Green (Burundi)
  'Sango': '#16a34a',              // Central African Green (CAR)
  'Montenegrin': '#818cf8'         // Adriatic Indigo (Montenegro)
};

function resolveToken(token) {
  if (!token) return null;
  const str = token.toLowerCase();

  // Distinct Montenegrin
  if (str.includes('montenegrin')) return 'Montenegrin';

  // Creoles and national vernaculars
  if (str.includes('pijin')) return 'Pijin';
  if (str.includes('comorian') || str.includes('shikomori')) return 'Comorian';
  if (str.includes('seychellois')) return 'Seychellois Creole';
  if (str.includes('mauritian')) return 'Mauritian Creole';

  // Prioritize national & indigenous languages over secondary lingua francas
  if (str.includes('macedonian')) return 'Macedonian';
  if (str.includes('luxembourgish')) return 'Luxembourgish';
  if (str.includes('hindi')) return 'Hindi';
  if (str.includes('urdu')) return 'Urdu';
  if (str.includes('cantonese')) return 'Cantonese';
  if (str.includes('mandarin') || str.includes('chinese')) return 'Mandarin';
  if (str.includes('bengali') || str.includes('bangla')) return 'Bengali';
  if (str.includes('punjabi')) return 'Punjabi';
  if (str.includes('tamil')) return 'Tamil';
  if (str.includes('telugu')) return 'Telugu';
  if (str.includes('sinhala')) return 'Sinhala';
  if (str.includes('nepali')) return 'Nepali';
  if (str.includes('hebrew')) return 'Hebrew';
  if (str.includes('maltese')) return 'Maltese';
  if (str.includes('swahili') || str.includes('kiswahili')) return 'Swahili';
  if (str.includes('kinyarwanda')) return 'Kinyarwanda';
  if (str.includes('setswana')) return 'Setswana';
  if (str.includes('sesotho')) return 'Sesotho';
  if (str.includes('siswati')) return 'siSwati';
  if (str.includes('chichewa')) return 'Chichewa';
  if (str.includes('shona')) return 'Shona';
  if (str.includes('bambara')) return 'Bambara';
  if (str.includes('kirundi')) return 'Kirundi';
  if (str.includes('sango')) return 'Sango';
  if (str.includes('amharic')) return 'Amharic';
  if (str.includes('tigrinya')) return 'Tigrinya';
  if (str.includes('somali')) return 'Somali';
  if (str.includes('tagalog') || str.includes('filipino')) return 'Tagalog';
  if (str.includes('bislama')) return 'Bislama';
  if (str.includes('samoan')) return 'Samoan';
  if (str.includes('tongan')) return 'Tongan';
  if (str.includes('gilbertese')) return 'Gilbertese';
  if (str.includes('tuvaluan')) return 'Tuvaluan';
  if (str.includes('marshallese')) return 'Marshallese';
  if (str.includes('palauan')) return 'Palauan';
  if (str.includes('nauruan')) return 'Nauruan';
  if (str.includes('fijian') || str.includes('itaukei')) return 'Fijian';
  if (str.includes('faroese')) return 'Faroese';
  if (str.includes('tetum')) return 'Tetum';
  if (str.includes('indonesian') || str.includes('bahasa indonesia')) return 'Indonesian';
  if (str.includes('malay')) return 'Malay';
  if (str.includes('vietnamese')) return 'Vietnamese';
  if (str.includes('thai')) return 'Thai';
  if (str.includes('khmer')) return 'Khmer';
  if (str.includes('lao')) return 'Lao';
  if (str.includes('burmese')) return 'Burmese';
  if (str.includes('dzongkha')) return 'Dzongkha';
  if (str.includes('pashto')) return 'Pashto';
  if (str.includes('persian') || str.includes('farsi') || /\bdari\b/.test(str) || str.includes('tajik')) return 'Persian';
  if (str.includes('georgian')) return 'Georgian';
  if (str.includes('armenian')) return 'Armenian';
  if (str.includes('albanian') || str.includes('shqip')) return 'Albanian';
  if (str.includes('greek')) return 'Greek';
  if (str.includes('german')) return 'German';
  if (str.includes('dutch')) return 'Dutch';
  if (str.includes('turkish')) return 'Turkish';
  if (str.includes('kazakh')) return 'Kazakh';
  if (str.includes('uzbek')) return 'Uzbek';
  if (str.includes('turkmen')) return 'Turkmen';
  if (str.includes('kyrgyz')) return 'Kyrgyz';
  if (str.includes('azerbaijani') || str.includes('azeri')) return 'Azerbaijani';
  if (str.includes('belarusian')) return 'Belarusian';
  if (str.includes('ukrainian')) return 'Ukrainian';
  if (str.includes('polish')) return 'Polish';
  if (str.includes('czech')) return 'Czech';
  if (str.includes('slovak')) return 'Slovak';
  if (str.includes('bulgarian')) return 'Bulgarian';
  if (str.includes('serbian') || str.includes('croatian') || str.includes('bosnian')) return 'Serbo-Croatian';
  if (str.includes('slovene') || str.includes('slovenian')) return 'Slovene';
  if (str.includes('russian')) return 'Russian';
  if (str.includes('swedish')) return 'Swedish';
  if (str.includes('norwegian')) return 'Norwegian';
  if (str.includes('danish')) return 'Danish';
  if (str.includes('icelandic')) return 'Icelandic';
  if (str.includes('finnish')) return 'Finnish';
  if (str.includes('estonian')) return 'Estonian';
  if (str.includes('latvian')) return 'Latvian';
  if (str.includes('lithuanian')) return 'Lithuanian';
  if (str.includes('hungarian') || str.includes('magyar')) return 'Hungarian';
  if (str.includes('romanian')) return 'Romanian';
  if (str.includes('italian')) return 'Italian';
  if (str.includes('portuguese')) return 'Portuguese';
  if (str.includes('spanish')) return 'Spanish';
  if (str.includes('arabic')) return 'Arabic';
  if (str.includes('french')) return 'French';
  if (str.includes('english')) return 'English';
  if (str.includes('japanese')) return 'Japanese';
  if (str.includes('korean')) return 'Korean';
  if (str.includes('mongolian')) return 'Mongolian';
  if (str.includes('irish') || str.includes('gaeilge')) return 'Irish';
  if (str.includes('catalan')) return 'Catalan';
  if (str.includes('guarani')) return 'Guarani';
  if (str.includes('quechua')) return 'Quechua';
  if (str.includes('aymara')) return 'Aymara';
  if (str.includes('dhivehi')) return 'Dhivehi';
  if (str.includes('haitian creole')) return 'Haitian Creole';
  if (str.includes('tok pisin')) return 'Tok Pisin';
  if (str.includes('yoruba')) return 'Yoruba';
  if (str.includes('igbo')) return 'Igbo';
  if (str.includes('hausa')) return 'Hausa';
  if (str.includes('zulu')) return 'Zulu';
  if (str.includes('malagasy')) return 'Malagasy';
  if (str.includes('lingala')) return 'Lingala';
  if (str.includes('wolof')) return 'Wolof';
  if (str.includes('afrikaans')) return 'Afrikaans';

  return null;
}

// Clean and normalize a language string into its canonical primary language
function getCanonicalLanguage(langString, country) {
  if (!langString && !country) return 'English';

  const primaryLangObj = country && Array.isArray(country.languages) && country.languages[0];
  const firstLangName = primaryLangObj && primaryLangObj.name ? primaryLangObj.name.split(/[&,/]/)[0].trim() : '';
  const firstStrSegment = langString ? langString.split(/[&,/]/)[0].trim() : '';

  const candidates = [firstLangName, firstStrSegment, langString].filter(Boolean);
  for (const cand of candidates) {
    const res = resolveToken(cand);
    if (res) return res;
  }

  return 'English';
}

// Territory & micro-entity override dictionary
const TERRITORY_LANGUAGES = {
  // English Territories
  'MNP': { lang: 'English', native: 'English', flag: '🇲🇵' },
  'VIR': { lang: 'English', native: 'English', flag: '🇻🇮' },
  'ASM': { lang: 'Samoan & English', native: 'Gagana Sāmoa / English', flag: '🇦🇸' },
  'SGS': { lang: 'English', native: 'English', flag: '🇬🇸' },
  'IOT': { lang: 'English', native: 'English', flag: '🇮🇴' },
  'SHN': { lang: 'English', native: 'English', flag: '🇸🇭' },
  'PCN': { lang: 'English', native: 'English', flag: '🇵🇳' },
  'AIA': { lang: 'English', native: 'English', flag: '🇦🇮' },
  'FLK': { lang: 'English', native: 'English', flag: '🇫🇰' },
  'CYM': { lang: 'English', native: 'English', flag: '🇰🇾' },
  'VGB': { lang: 'English', native: 'English', flag: '🇻🇬' },
  'TCA': { lang: 'English', native: 'English', flag: '🇹🇨' },
  'MSR': { lang: 'English', native: 'English', flag: '🇲🇸' },
  'JEY': { lang: 'English', native: 'English', flag: '🇯🇪' },
  'GGY': { lang: 'English', native: 'English', flag: '🇬🇬' },
  'IMN': { lang: 'English', native: 'English', flag: '🇮🇲' },
  'NIU': { lang: 'English', native: 'English', flag: '🇳🇺' },
  'COK': { lang: 'English', native: 'English', flag: '🇨🇰' },
  'NFK': { lang: 'English', native: 'English', flag: '🇳🇫' },
  'HMD': { lang: 'English', native: 'English', flag: '🇭🇲' },
  'ATC': { lang: 'English', native: 'English', flag: '🇦🇺' },
  'IOA': { lang: 'English', native: 'English', flag: '🇮🇴' },
  'KAS': { lang: 'Urdu', native: 'اردو', flag: '🏔️' },
  'ATA': { lang: 'English', native: 'English', flag: '🇦🇶' },

  // French Territories
  'SPM': { lang: 'French', native: 'Français', flag: '🇵🇲' },
  'WLF': { lang: 'French', native: 'Français', flag: '🇼🇫' },
  'MAF': { lang: 'French', native: 'Français', flag: '🇲🇫' },
  'BLM': { lang: 'French', native: 'Français', flag: '🇧🇱' },
  'ATF': { lang: 'French', native: 'Français', flag: '🇹🇫' },

  // Dutch Territories
  'ABW': { lang: 'Dutch', native: 'Nederlands / Papiamento', flag: '🇦🇼' },
  'CUW': { lang: 'Dutch', native: 'Nederlands / Papiamento', flag: '🇨🇼' },
  'SXM': { lang: 'Dutch', native: 'Nederlands / English', flag: '🇸🇽' },

  // Arabic / North African
  'ESH': { lang: 'Arabic', native: 'العربية', flag: '🇪🇭' },
  'PSE': { lang: 'Arabic', native: 'العربية', flag: '🇵🇸' },
  'SOL': { lang: 'Somali', native: 'Af-Soomaali', flag: '🇸🇴' },

  // Others
  'KOS': { lang: 'Albanian', native: 'Shqip', flag: '🇽🇰' },
  'ALA': { lang: 'Swedish', native: 'Svenska', flag: '🇦🇽' },
  'FRO': { lang: 'Faroese & Danish', native: 'Føroyskt / Dansk', flag: '🇫🇴' },
  'CYN': { lang: 'Turkish', native: 'Türkçe', flag: '🇹🇷' }
};

// Load database
const dbPath = path.join(__dirname, '../data/languages.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Track language distribution
const languageCounts = {};

for (const key in db) {
  const c = db[key];
  if (!c) continue;

  // Check territory override
  if (TERRITORY_LANGUAGES[c.iso3]) {
    const t = TERRITORY_LANGUAGES[c.iso3];
    c.primaryLanguage = t.lang;
    c.flag = t.flag;
    if (t.native) c.nativeName = t.native;
  }

  // Determine canonical language
  const canon = getCanonicalLanguage(c.primaryLanguage, c);
  c.canonicalLanguage = canon;

  // Assign distinct language color!
  c.color = LANGUAGE_COLORS[canon] || '#0284c7';

  // Count by ISO3
  if (key.length === 3 && key === key.toUpperCase()) {
    languageCounts[canon] = (languageCounts[canon] || 0) + 1;
  }
}

console.log('Top shared languages across world countries:');
const sorted = Object.entries(languageCounts).sort((a,b) => b[1] - a[1]);
sorted.slice(0, 25).forEach(([lang, count]) => {
  const color = LANGUAGE_COLORS[lang] || '#0284c7';
  console.log(`- ${lang.padEnd(16)}: ${count} countries [Color: ${color}]`);
});

// Write updated JSON
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully updated languages.json');

// Write updated JS bundle for direct file:// execution
const jsLangPath = path.join(__dirname, '../data/languages.js');
fs.writeFileSync(jsLangPath, 'window.WORLD_LANGUAGES = ' + JSON.stringify(db) + ';\n');
console.log('Successfully updated languages.js');

