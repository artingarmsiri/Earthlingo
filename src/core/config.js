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

  E.config = {
    SHARED_LANGUAGES,
    GLOBE_CONFIG,
    OVERLAY_CONFIG,
    OVERLAY_ISLAND_HUBS,
    MICROSTATE_ISOS,
    ARC_EXPORTERS,
    ISO_SCRIPT_OVERRIDES,
    ARABIC_SCRIPT_ISOS
  };
})(window);

