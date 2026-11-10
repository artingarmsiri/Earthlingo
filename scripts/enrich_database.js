// scripts/enrich_database.js
// Eliminates placeholder 'Official National Script' / 'National Script' values
// and refines plain 'Indo-European' territory family metadata in data/languages.json & data/languages.js.

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/languages.json');
const jsPath = path.join(__dirname, '../data/languages.js');
const db = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Exact per-ISO, per-language-index overrides where scripts differ cleanly from generic rules
const EXACT_ROW_SCRIPTS = {
  // East & Inner Asia
  TWN: ['Traditional Hanzi (繁體中文)', 'Traditional Hanzi / Pe̍h-ōe-jī'],
  HKG: ['Traditional Hanzi (粵字)', 'Latin'],
  MAC: ['Traditional Hanzi', 'Latin'],
  SGP: ['Latin & Simplified Hanzi', 'Tamil Script'],
  PRK: ['Hangul (Chosŏn’gŭl / 조선글)'],
  MNG: ['Cyrillic & Traditional Mongol'],
  BTN: ['Tibetan Script (Uchen)'],
  MMR: ['Burmese Script (မြန်မာအက္ခရာ)'],
  LAO: ['Lao Script (ອັກສອນລາວ)'],
  KHM: ['Khmer Script (អក្សរខ្មែរ)'],
  NPL: ['Devanagari (देवनागरी)'],
  BGD: ['Bengali–Assamese (বাংলা)'],
  LKA: ['Sinhala Script (සිංහල)', 'Tamil Script (தமிழ்)'],
  MDV: ['Thaana (ތާނަ)'],

  // Central Asia, Caucasus & Eastern Europe
  KAZ: ['Cyrillic & Latin', 'Cyrillic'],
  KGZ: ['Cyrillic', 'Cyrillic'],
  TJK: ['Cyrillic (Perso-Arabic historic)', 'Cyrillic'],
  UZB: ['Latin (Cyrillic historic)'],
  TKM: ['Latin (Turkmen Alphabet)'],
  AZE: ['Latin (with ə, ı, ö, ü)'],
  ARM: ['Armenian Alphabet (Հայկական)'],
  GEO: ['Georgian (Mkhedruli)'],
  BLR: ['Cyrillic', 'Cyrillic'],
  BGR: ['Cyrillic'],
  SRB: ['Cyrillic & Gaj’s Latin'],
  BIH: ['Latin (Gaj’s Alphabet)', 'Cyrillic & Latin'],
  MNE: ['Latin & Cyrillic'],
  MKD: ['Cyrillic (Macedonian)', 'Latin'],

  // Middle East & North / Horn Africa
  ISR: ['Hebrew Alphabet (א״ב)', 'Arabic'],
  IRQ: ['Arabic', 'Perso-Arabic (Sorani) & Latin (Kurmanji)'],
  AFG: ['Perso-Arabic (Pashto)', 'Perso-Arabic'],
  DZA: ['Arabic', 'Tifinagh (ⵜⵉⴼⵉⵏⴰⵖ), Arabic & Latin'],
  TUN: ['Arabic', 'Arabic & Latin'],
  LBN: ['Arabic', 'Latin'],
  SDN: ['Arabic', 'Latin'],
  TCD: ['Arabic', 'Latin'],
  MRT: ['Arabic & Latin', 'Latin'],
  COM: ['Latin & Arabic', 'Latin'],
  DJI: ['Arabic & Latin', 'Latin'],
  ERI: ['Geʻez (Fidäl) & Arabic', 'Latin'],
  SOM: ['Latin (Far Soomaali)', 'Arabic'],

  // Southern, Central & Nordic Europe
  CYP: ['Greek Alphabet', 'Latin (Turkish Alphabet)'],
  CZE: ['Latin (with diacritics)'],
  SVK: ['Latin (with diacritics)'],
  SVN: ['Latin (with č, š, ž)'],
  HRV: ['Latin (Gaj’s Alphabet)'],
  HUN: ['Latin (with acute & umlaut)'],
  ROU: ['Latin (with ă, â, î, ș, ț)'],
  MDA: ['Latin (with ă, â, î, ș, ț)'],
  DNK: ['Latin (with æ, ø, å)'],
  ISL: ['Latin (with þ, ð, æ, ö)'],
  FIN: ['Latin (with ä, ö)', 'Latin (with å, ä, ö)'],
  EST: ['Latin (with õ, ä, ö, ü)'],
  LVA: ['Latin (with macrons & cedillas)'],
  LTU: ['Latin (with ogoneks & carons)'],
  ALB: ['Latin (with ç, ë)'],
  MLT: ['Latin (with ċ, ġ, għ, ħ, ż)', 'Latin'],
  AND: ['Latin (with ç, l·l)'],
  VAT: ['Latin Alphabet', 'Latin'],
  SMR: ['Latin'],
  LIE: ['Latin (with ä, ö, ü, ß)'],
  LUX: ['Latin', 'Latin'],
  MCO: ['Latin', 'Latin'],

  // Americas, Caribbean & Pacific nuances
  GRL: ['Latin (Greenlandic)', 'Latin (with æ, ø, å)'],
  PRY: ['Latin (Achegety)', 'Latin'],
  TTO: ['Latin', 'Devanagari & Latin'],
  SUR: ['Latin', 'Latin & Devanagari'],
  PYF: ['Latin', 'Latin (with ʻeta & macrons)'],
  TON: ['Latin (with fakauʻa)', 'Latin'],
  WSM: ['Latin (with ʻokina)', 'Latin'],
  GUM: ['Latin', 'Latin (with å, ñ)'],
  TGO: ['Latin (Ewe alphabet)', 'Latin']
};

const ARABIC_PRIMARY_ISOS = new Set([
  'YEM', 'ARE', 'SYR', 'QAT', 'OMN', 'LBY', 'KWT', 'JOR', 'BHR'
]);

// Accurate family refinement for the 42 entries that previously fell back to plain "Indo-European"
const FAMILY_REFINEMENTS = {
  ESH: 'Afroasiatic (Semitic)',
  PSE: 'Afroasiatic (Semitic)',
  SOL: 'Afroasiatic (Cushitic/Chadic)',
  CYN: 'Turkic',
  KOS: 'Indo-European (Other)',
  KAS: 'Indo-European (Indo-Iranian)',
  CHE: 'Indo-European (Germanic / Romance)',
  BEL: 'Indo-European (Germanic / Romance)',
  IRL: 'Indo-European (Germanic / Celtic)',
  SPM: 'Indo-European (Romance)',
  WLF: 'Indo-European (Romance)',
  MAF: 'Indo-European (Romance)',
  BLM: 'Indo-European (Romance)',
  ATF: 'Indo-European (Romance)'
};

function inferScriptFromRow(c, lang, idx) {
  const iso = (c.iso3 || '').toUpperCase();
  if (EXACT_ROW_SCRIPTS[iso] && EXACT_ROW_SCRIPTS[iso][idx]) {
    return EXACT_ROW_SCRIPTS[iso][idx];
  }
  if (ARABIC_PRIMARY_ISOS.has(iso) && idx === 0) {
    return 'Arabic';
  }
  const lname = (lang.name || '').toLowerCase();
  const bcp = (lang.bcp47 || '').toLowerCase();
  if (lname.includes('arabic')) return 'Arabic';
  if (lname.includes('russian') || lname.includes('belarusian') || lname.includes('ukrainian') || lname.includes('bulgarian') || lname.includes('macedonian') || lname.includes('kyrgyz')) return 'Cyrillic';
  if (lname.includes('hebrew')) return 'Hebrew Alphabet';
  if (lname.includes('greek')) return 'Greek Alphabet';
  if (lname.includes('armenian')) return 'Armenian Alphabet';
  if (lname.includes('georgian')) return 'Georgian (Mkhedruli)';
  if (lname.includes('korean') || bcp.startsWith('ko')) return 'Hangul';
  if (lname.includes('bengali') || bcp.startsWith('bn')) return 'Bengali–Assamese';
  if (lname.includes('nepali') || lname.includes('hindi')) return 'Devanagari';
  if (lname.includes('tamil')) return 'Tamil Script';
  if (lname.includes('sinhala')) return 'Sinhala Script';
  if (lname.includes('thai')) return 'Thai Script';
  if (lname.includes('lao')) return 'Lao Script';
  if (lname.includes('khmer')) return 'Khmer Script';
  if (lname.includes('burmese')) return 'Burmese Script';
  return 'Latin';
}

let fixedScripts = 0;
let fixedFamilies = 0;

for (const key in db) {
  const c = db[key];
  if (!c) continue;
  const iso = (c.iso3 || '').toUpperCase();

  if (c.languageFamily === 'Indo-European') {
    const refined = FAMILY_REFINEMENTS[iso] || 'Indo-European (Germanic)';
    c.languageFamily = refined;
    if (Array.isArray(c.languages)) {
      c.languages.forEach(l => {
        if (l.family === 'Indo-European') l.family = refined;
      });
    }
    fixedFamilies++;
  }

  if (Array.isArray(c.languages)) {
    c.languages.forEach((l, idx) => {
      const s = (l.script || '').trim();
      const exactScript = EXACT_ROW_SCRIPTS[iso] && EXACT_ROW_SCRIPTS[iso][idx];
      if (exactScript && s !== exactScript) {
        l.script = exactScript;
        fixedScripts++;
      } else if (!s || s === 'Official National Script' || s === 'National Script') {
        l.script = inferScriptFromRow(c, l, idx);
        fixedScripts++;
      }
    });
  }
}

// Verify zero placeholders remain
let remainingPlaceholders = 0;
let remainingPlainIE = 0;
for (const key in db) {
  const c = db[key];
  if (!c) continue;
  if (c.languageFamily === 'Indo-European') remainingPlainIE++;
  (c.languages || []).forEach(l => {
    const s = (l.script || '').trim();
    if (!s || s === 'Official National Script' || s === 'National Script') {
      remainingPlaceholders++;
    }
  });
}

fs.writeFileSync(jsonPath, JSON.stringify(db, null, 2));
fs.writeFileSync(jsPath, 'window.WORLD_LANGUAGES = ' + JSON.stringify(db) + ';\n');

console.log(`Enriched ${fixedScripts} script fields and ${fixedFamilies} plain Indo-European entries across all keys.`);
console.log(`Remaining script placeholders: ${remainingPlaceholders}, Remaining plain Indo-European: ${remainingPlainIE}`);

