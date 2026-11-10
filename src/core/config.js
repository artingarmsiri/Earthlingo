// src/core/config.js - Static Application Constants & Visual Configuration
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  const SHARED_LANGUAGES = [
    { name: 'Spanish', color: '#e11d48', count: 22, fam: 'Romance' },
    { name: 'English', color: '#0284c7', count: 91, fam: 'Germanic' },
    { name: 'French', color: '#c026d3', count: 31, fam: 'Romance' },
    { name: 'Arabic', color: '#eab308', count: 20, fam: 'Semitic' },
    { name: 'Portuguese', color: '#f43f5e', count: 9, fam: 'Romance' },
    { name: 'Russian', color: '#4f46e5', count: 5, fam: 'Slavic' },
    { name: 'German', color: '#1d4ed8', count: 3, fam: 'Germanic' },
    { name: 'Dutch', color: '#06b6d4', count: 5, fam: 'Germanic' },
    { name: 'Italian', color: '#e879f9', count: 3, fam: 'Romance' },
    { name: 'Swedish', color: '#38bdf8', count: 3, fam: 'Germanic' },
    { name: 'Turkish', color: '#9333ea', count: 3, fam: 'Turkic' },
    { name: 'Mandarin', color: '#dc2626', count: 2, fam: 'Sino-Tibetan' },
    { name: 'Hindi', color: '#f59e0b', count: 1, fam: 'Indo-Aryan' },
    { name: 'Swahili', color: '#16a34a', count: 4, fam: 'Bantu' },
    { name: 'Persian', color: '#0d9488', count: 2, fam: 'Iranian' },
    { name: 'Japanese', color: '#ec4899', count: 1, fam: 'Japonic' },
    { name: 'Korean', color: '#f472b6', count: 2, fam: 'Koreanic' },
    { name: 'Greek', color: '#2563eb', count: 2, fam: 'Hellenic' },
    { name: 'Vietnamese', color: '#84cc16', count: 1, fam: 'Austroasiatic' },
    { name: 'Thai', color: '#a855f7', count: 1, fam: 'Kra-Dai' }
  ];

  const GLOBE_CONFIG = {
    R_GLOBE: 100,
    CAP_SCALE: 1.0025,
    LINE_SCALE: 1.0028,
    MAX_SEG_DEG: 1.6,
    MIN_CAM_DIST: 132,
    MAX_CAM_DIST: 850,
    MOBILE_MAX_BUFFER_PIXELS: 3200000,
    DESKTOP_MAX_BUFFER_PIXELS: 5500000,
    SELECT_FLY_MS: 550,
    CORRIDOR_FLY_MS: 650,
    ZOOM_ANIM_MS: 240
  };

  const OVERLAY_CONFIG = {
    POOL_SIZE: 68,
    FADE_MS: 140,
    SETTLE_MS: 95,
    VALID_MODES: new Set(['countries', 'languages', 'families', 'scripts', 'greetings', 'off']),
    TIER_THRESHOLDS: {
      mobile: { t1Enter: 210, t1Exit: 198, t2Enter: 292, t2Exit: 278 },
      desktop: { t1Enter: 266, t1Exit: 252, t2Enter: 372, t2Exit: 356 }
    },
    MAX_VISIBLE: {
      mobile: [20, 24, 34],
      desktop: [28, 40, 56]
    }
  };

  const OVERLAY_ISLAND_HUBS = new Set([
    'JPN', 'GBR', 'IDN', 'PHL', 'MDG', 'NZL', 'ISL', 'CUB', 'LKA', 'IRL', 'TWN'
  ]);

  const MICROSTATE_ISOS = [
    'VAT', 'MCO', 'SMR', 'LIE', 'AND', 'MLT',
    'BHR', 'SGP', 'MDV', 'SYC', 'STP',
    'BRB', 'ATG', 'KNA', 'DMA', 'LCA', 'VCT', 'GRD',
    'NRU', 'TUV', 'PLW', 'TON', 'MHL', 'FSM', 'KIR'
  ];

  const ARC_EXPORTERS = new Set([
    'ESP', 'GBR', 'FRA', 'PRT', 'SAU', 'RUS', 'ITA', 'DEU', 'NLD', 'SWE', 'TUR', 'CHN'
  ]);

  // Universally supported glyphs across Windows/macOS/iOS/Android sans-serif stacks
  const ISO_SCRIPT_OVERRIDES = {
    ARM: ['Armenian', '', 'Armenian Alphabet'],
    GEO: ['Georgian', '', 'Georgian Mkhedruli'],
    ETH: ['Geʻez & Latin', '', 'Geʻez (Ethiopic) & Qubee Latin'],
    ERI: ['Geʻez & Arabic', '', 'Geʻez & Arabic'],
    MDV: ['Thaana', '', 'Thaana (Dhivehi)'],
    ISR: ['Hebrew & Arabic', 'אع', 'Hebrew & Arabic'],
    JPN: ['Kanji & Kana', 'あ漢', 'Kanji, Hiragana & Katakana'],
    KOR: ['Hangul', '한', 'Hangul (한국어)'],
    PRK: ['Hangul', '한', 'Hangul (Chosŏn’gŭl)'],
    CHN: ['Hanzi', '汉', 'Simplified Chinese Hanzi'],
    TWN: ['Hanzi', '漢', 'Traditional Chinese Hanzi'],
    HKG: ['Hanzi & Latin', '漢A', 'Traditional Hanzi & Latin'],
    MAC: ['Hanzi & Latin', '漢A', 'Traditional Hanzi & Latin'],
    SGP: ['Latin, Hanzi & Tamil', 'Aa汉', 'Latin, Hanzi, Malay & Tamil'],
    IND: ['Devanagari + Indic', 'अ', 'Devanagari & Regional Indic'],
    NPL: ['Devanagari', 'अ', 'Devanagari'],
    BGD: ['Bengali', '', 'Bengali–Assamese Script'],
    LKA: ['Sinhala & Tamil', '', 'Sinhala & Tamil'],
    BTN: ['Tibetan', '', 'Tibetan (Uchen)'],
    MMR: ['Burmese', '', 'Burmese (Mon–Burmese)'],
    THA: ['Thai', '', 'Thai Abugida'],
    LAO: ['Lao', '', 'Lao Abugida'],
    KHM: ['Khmer', '', 'Khmer Abugida'],
    RUS: ['Cyrillic', 'АБ', 'Cyrillic'],
    UKR: ['Cyrillic', 'АБ', 'Ukrainian Cyrillic'],
    BLR: ['Cyrillic', 'АБ', 'Belarusian Cyrillic'],
    BGR: ['Cyrillic', 'АБ', 'Bulgarian Cyrillic'],
    SRB: ['Cyrillic & Latin', 'АB', 'Cyrillic & Gaj’s Latin'],
    BIH: ['Latin & Cyrillic', 'AB', 'Latin & Cyrillic'],
    MNE: ['Latin & Cyrillic', 'AB', 'Latin & Cyrillic'],
    MKD: ['Cyrillic', 'АБ', 'Macedonian Cyrillic'],
    KAZ: ['Cyrillic & Latin', 'АB', 'Kazakh Cyrillic (Latin transition)'],
    KGZ: ['Cyrillic', 'АБ', 'Kyrgyz Cyrillic'],
    TJK: ['Cyrillic', 'АБ', 'Tajik Cyrillic'],
    MNG: ['Cyrillic & Mongol', 'АБ', 'Cyrillic & Traditional Mongol'],
    GRC: ['Greek', 'ΑΩ', 'Greek Alphabet'],
    CYP: ['Greek & Latin', 'ΑA', 'Greek & Turkish Latin'],
    IRN: ['Perso-Arabic', 'ع', 'Perso-Arabic'],
    AFG: ['Perso-Arabic', 'ع', 'Perso-Arabic'],
    PAK: ['Perso-Arabic', 'ع', 'Nastaliq Perso-Arabic'],
    KAS: ['Perso-Arabic', 'ع', 'Perso-Arabic & Devanagari'],
    MAR: ['Arabic & Tifinagh', 'ع', 'Arabic, Tifinagh & Latin'],
    DZA: ['Arabic & Tifinagh', 'ع', 'Arabic & Tamazight'],
    TUN: ['Arabic & Latin', 'عA', 'Arabic & French Latin'],
    SDN: ['Arabic & Latin', 'عA', 'Arabic & English Latin'],
    MRT: ['Arabic & Latin', 'عA', 'Arabic & French Latin']
  };

  const ARABIC_SCRIPT_ISOS = new Set([
    'SAU', 'EGY', 'IRQ', 'SYR', 'JOR', 'LBN', 'PSE', 'YEM', 'OMN',
    'ARE', 'QAT', 'BHR', 'KWT', 'LBY', 'ESH', 'COM'
  ]);

  const COLOR_BY_MODES = new Set(['language', 'family', 'script']);

  const FAMILY_GROUPS = [
    { name: 'Indo-European (Romance)', color: '#f43f5e' },
    { name: 'Indo-European (Germanic)', color: '#0ea5e9' },
    { name: 'Indo-European (Slavic)', color: '#6366f1' },
    { name: 'Indo-European (Indo-Iranian)', color: '#f59e0b' },
    { name: 'Indo-European (Other)', color: '#3b82f6' },
    { name: 'Afroasiatic', color: '#eab308' },
    { name: 'Niger-Congo', color: '#22c55e' },
    { name: 'Austronesian', color: '#14b8a6' },
    { name: 'Sino-Tibetan', color: '#dc2626' },
    { name: 'Turkic', color: '#a855f7' },
    { name: 'Japonic & Koreanic', color: '#ec4899' },
    { name: 'Austroasiatic & Kra-Dai', color: '#84cc16' },
    { name: 'Uralic', color: '#06b6d4' },
    { name: 'Indigenous, Creoles & Other', color: '#fb923c' }
  ];

  const SCRIPT_GROUPS = [
    { name: 'Latin', color: '#0ea5e9' },
    { name: 'Arabic & Perso-Arabic', color: '#eab308' },
    { name: 'Cyrillic', color: '#6366f1' },
    { name: 'Hanzi & Kanji', color: '#dc2626' },
    { name: 'Hangul', color: '#ec4899' },
    { name: 'Indic & Himalayan', color: '#f59e0b' },
    { name: 'SE Asian Brahmic', color: '#84cc16' },
    { name: 'Geʻez (Ethiopic)', color: '#10b981' },
    { name: 'Greek, Hebrew & Caucasus', color: '#a855f7' }
  ];

  // Canonical token normalization for minority, regional, and multi-nation spoken languages
  const SPOKEN_TOKEN_ALIASES = [
    { pattern: /\b(?:spanish|castilian|castellano)\b/i, token: 'Spanish' },
    { pattern: /\benglish\b/i, token: 'English' },
    { pattern: /\bfrench\b/i, token: 'French' },
    { pattern: /\bportuguese\b/i, token: 'Portuguese' },
    { pattern: /\barabic\b/i, token: 'Arabic' },
    { pattern: /\brussian\b/i, token: 'Russian' },
    { pattern: /\bgerman\b/i, token: 'German' },
    { pattern: /\b(?:dutch|flemish)\b/i, token: 'Dutch' },
    { pattern: /\bitalian\b/i, token: 'Italian' },
    { pattern: /\bswedish\b/i, token: 'Swedish' },
    { pattern: /\bdanish\b/i, token: 'Danish' },
    { pattern: /\bnorwegian\b/i, token: 'Norwegian' },
    { pattern: /\bfinnish\b/i, token: 'Finnish' },
    { pattern: /\b(?:mandarin|putonghua|guoyu)\b/i, token: 'Mandarin' },
    { pattern: /\bcantonese\b/i, token: 'Cantonese' },
    { pattern: /\bhakka\b/i, token: 'Hakka' },
    { pattern: /\b(?:persian|farsi|dari|tajik)\b/i, token: 'Persian' },
    { pattern: /\bhindi\b/i, token: 'Hindi' },
    { pattern: /\burdu\b/i, token: 'Urdu' },
    { pattern: /\bbengali|bangla\b/i, token: 'Bengali' },
    { pattern: /\btamil\b/i, token: 'Tamil' },
    { pattern: /\bswahili|kiswahili\b/i, token: 'Swahili' },
    { pattern: /\bturkish\b/i, token: 'Turkish' },
    { pattern: /\bkorean\b/i, token: 'Korean' },
    { pattern: /\bjapanese\b/i, token: 'Japanese' },
    { pattern: /\bgreek\b/i, token: 'Greek' },
    { pattern: /\b(?:kurd|kurmanji|sorani)\b/i, token: 'Kurdish' },
    { pattern: /\b(?:quechua|kichwa|quichua)\b/i, token: 'Quechua' },
    { pattern: /\bguaran[ií]\b/i, token: 'Guarani' },
    { pattern: /\baymara\b/i, token: 'Aymara' },
    { pattern: /\b(?:tamazight|amazigh|berber|siwi|kabyle|tashelhit)\b/i, token: 'Tamazight (Berber)' },
    { pattern: /\bcatalan\b/i, token: 'Catalan' },
    { pattern: /\b(?:basque|euskara)\b/i, token: 'Basque' },
    { pattern: /\bgalician|galego\b/i, token: 'Galician' },
    { pattern: /\bwelsh|cymraeg\b/i, token: 'Welsh' },
    { pattern: /\b(?:irish|gaeilge)\b/i, token: 'Irish' },
    { pattern: /\b(?:sami|sámi)\b/i, token: 'Sami' },
    { pattern: /\byoruba\b/i, token: 'Yoruba' },
    { pattern: /\bhausa\b/i, token: 'Hausa' },
    { pattern: /\b(?:fula|fulani|pulaar|pular|fulfulde)\b/i, token: 'Fula' },
    { pattern: /\bmandinka|maninka\b/i, token: 'Mandinka' },
    { pattern: /\bwolof\b/i, token: 'Wolof' },
    { pattern: /\blingala\b/i, token: 'Lingala' },
    { pattern: /\b(?:somali|af-soomaali)\b/i, token: 'Somali' },
    { pattern: /\btigrinya\b/i, token: 'Tigrinya' },
    { pattern: /\bamharic\b/i, token: 'Amharic' },
    { pattern: /\bmalay\b/i, token: 'Malay' },
    { pattern: /\bserbian\b/i, token: 'Serbian' },
    { pattern: /\bcroatian\b/i, token: 'Croatian' },
    { pattern: /\bbosnian\b/i, token: 'Bosnian' },
    { pattern: /\balbanian|shqip\b/i, token: 'Albanian' },
    { pattern: /\barmenian\b/i, token: 'Armenian' },
    { pattern: /\bromanian|moldovan\b/i, token: 'Romanian' },
    { pattern: /\bhungarian|magyar\b/i, token: 'Hungarian' },
    { pattern: /\bukrainian\b/i, token: 'Ukrainian' },
    { pattern: /\bpolish\b/i, token: 'Polish' },
    { pattern: /\bczech\b/i, token: 'Czech' },
    { pattern: /\bslovak\b/i, token: 'Slovak' },
    { pattern: /\b(?:slovene|slovenian)\b/i, token: 'Slovene' },
    { pattern: /\bafrikaans\b/i, token: 'Afrikaans' },
    { pattern: /\btswana|setswana\b/i, token: 'Setswana' },
    { pattern: /\bsotho|sesotho\b/i, token: 'Sesotho' },
    { pattern: /\bndebele\b/i, token: 'Ndebele' },
    { pattern: /\bzulu|isizulu\b/i, token: 'Zulu' },
    { pattern: /\bxhosa|isixhosa\b/i, token: 'Xhosa' },
    { pattern: /\bfang\b/i, token: 'Fang' },
    { pattern: /\bewe\b/i, token: 'Ewe' },
    { pattern: /\bmayan\b/i, token: 'Mayan' },
    { pattern: /\bpunjabi\b/i, token: 'Punjabi' },
    { pattern: /\bpashto\b/i, token: 'Pashto' },
    { pattern: /\bsinhala\b/i, token: 'Sinhala' },
    { pattern: /\bnepali\b/i, token: 'Nepali' },
    { pattern: /\bhebrew\b/i, token: 'Hebrew' },
    { pattern: /\blatin\b/i, token: 'Latin' },
    { pattern: /\bmongolian\b/i, token: 'Mongolian' },
    { pattern: /\blithuanian\b/i, token: 'Lithuanian' },
    { pattern: /\blatvian\b/i, token: 'Latvian' },
    { pattern: /\bestonian\b/i, token: 'Estonian' },
    { pattern: /\bicelandic\b/i, token: 'Icelandic' },
    { pattern: /\bgeorgian\b/i, token: 'Georgian' }
  ];

  E.config = {
    SHARED_LANGUAGES,
    COLOR_BY_MODES,
    FAMILY_GROUPS,
    SCRIPT_GROUPS,
    SPOKEN_TOKEN_ALIASES,
    GLOBE_CONFIG,
    OVERLAY_CONFIG,
    OVERLAY_ISLAND_HUBS,
    MICROSTATE_ISOS,
    ARC_EXPORTERS,
    ISO_SCRIPT_OVERRIDES,
    ARABIC_SCRIPT_ISOS
  };
})(window);

