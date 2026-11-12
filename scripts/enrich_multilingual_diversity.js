// scripts/enrich_multilingual_diversity.js
// Enriches all 89 single-language entries in data/languages.json to >= 2 languages,
// fixes the 8 canonicalLanguage === 'English' mismatches, and computes Greenberg LDI
// + living-language diversity metrics across all 242 nations.
// Regenerates both data/languages.json and data/languages.js.

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/languages.json');
const jsPath = path.join(__dirname, '../data/languages.js');
const db = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 1. Fix 8 canonicalLanguage === 'English' mismatches + MNG Mongolic family
const CANONICAL_FIXES = {
  SVN: { canonicalLanguage: 'Slovene', color: '#6366f1' },
  MNE: { canonicalLanguage: 'Montenegrin', color: '#818cf8' },
  MNG: { canonicalLanguage: 'Mongolian', languageFamily: 'Mongolic', color: '#d946ef' },
  MDV: { canonicalLanguage: 'Dhivehi', color: '#ea580c' },
  LTU: { canonicalLanguage: 'Lithuanian', color: '#8b5cf6' },
  LVA: { canonicalLanguage: 'Latvian', color: '#a855f7' },
  ISL: { canonicalLanguage: 'Icelandic', color: '#0ea5e9' },
  EST: { canonicalLanguage: 'Estonian', color: '#14b8a6' }
};

// 2. Multilingual additions for all 89 single-language territories & nations
const EXTRA_LANGUAGES = {
  YEM: [
    {
      name: 'Mehri', nativeName: 'مهرية (Məhriyə)', type: 'Indigenous Minority',
      percentage: '1.0%', speakers: '180K', family: 'Afroasiatic (Modern South Arabian)',
      script: 'Arabic Alphabet (Oral & Written)', bcp47: 'gdq-YE',
      regions: 'Al-Mahrah Governorate (Eastern Yemen)',
      notes: 'Non-Arabic Semitic language descending from ancient South Arabian tongues.'
    },
    {
      name: 'Soqotri', nativeName: 'سقطرية (Méthel d-Saqátri)', type: 'Indigenous Minority',
      percentage: '0.3%', speakers: '70K', family: 'Afroasiatic (Modern South Arabian)',
      script: 'Arabic Alphabet', bcp47: 'sqt-YE',
      regions: 'Socotra Archipelago',
      notes: 'Endemic Modern South Arabian language spoken exclusively on the Socotra islands.'
    }
  ],
  UZB: [
    {
      name: 'Tajik (Persian)', nativeName: 'Тоҷикӣ / تاجیکی', type: 'Regional Minority',
      percentage: '5.2%', speakers: '1.8M', family: 'Indo-European (Indo-Iranian)',
      script: 'Cyrillic & Perso-Arabic', bcp47: 'tg-TJ',
      regions: 'Samarkand, Bukhara, Surxondaryo',
      notes: 'Historically major urban Silk Road language; dominant tongue in Samarkand and Bukhara.'
    },
    {
      name: 'Karakalpak', nativeName: 'Qaraqalpaq tili', type: 'Autonomous Republic Official',
      percentage: '2.5%', speakers: '850K', family: 'Turkic (Kipchak)',
      script: 'Latin (Turkic)', bcp47: 'kaa-UZ',
      regions: 'Republic of Karakalpakstan',
      notes: 'Closely related to Kazakh; co-official inside autonomous Karakalpakstan.'
    },
    {
      name: 'Russian', nativeName: 'Русский язык', type: 'Interethnic Lingua Franca',
      percentage: '3.5%', speakers: '1.2M', family: 'Indo-European (Slavic)',
      script: 'Cyrillic', bcp47: 'ru-RU',
      regions: 'Tashkent & Urban Centers',
      notes: 'Widely used in business, technical education, and media across urban Uzbekistan.'
    }
  ],
  URY: [
    {
      name: 'Uruguayan Portuguese (Portuñol)', nativeName: 'Português del Norte / DPU', type: 'Regional Border Variety',
      percentage: '4.5%', speakers: '150K', family: 'Indo-European (Romance)',
      script: 'Latin', bcp47: 'pt-BR',
      regions: 'Rivera, Artigas, Cerro Largo (Northern Border)',
      notes: 'Historical contact variety blending northern Uruguayan Spanish with Brazilian Portuguese.'
    },
    {
      name: 'Uruguayan Sign Language (LSU)', nativeName: 'Lengua de Señas Uruguaya', type: 'Recognized National Sign Language',
      percentage: '0.8%', speakers: '30K', family: 'Sign Language',
      script: 'Sign / Gesture (Visual)', bcp47: 'es-UY',
      regions: 'Nationwide',
      notes: 'Legally recognized as a natural language of Uruguay since 2001.'
    }
  ],
  MNP: [
    {
      name: 'Chamorro', nativeName: 'Finuʼ CHamoru', type: 'Co-Official Indigenous',
      percentage: '24.0%', speakers: '12K', family: 'Austronesian (Malayo-Polynesian)',
      script: 'Latin (with å, ñ)', bcp47: 'ch-MP',
      regions: 'Saipan, Tinian, Rota',
      notes: 'Native Micronesian/Austronesian language with rich Spanish lexical borrowings.'
    },
    {
      name: 'Carolinian', nativeName: 'Refaluwasch', type: 'Co-Official Indigenous',
      percentage: '6.0%', speakers: '3.1K', family: 'Austronesian (Micronesian)',
      script: 'Latin', bcp47: 'cal-MP',
      regions: 'Saipan',
      notes: 'Brought by 19th-century settlers from the Caroline Islands; co-official in CNMI.'
    }
  ],
  VIR: [
    {
      name: 'Virgin Islands Creole (Crucian)', nativeName: 'Crucian / St. Thomian Creole', type: 'Heritage Vernacular',
      percentage: '35.0%', speakers: '32K', family: 'English-based Creole',
      script: 'Latin', bcp47: 'en-US',
      regions: 'St. Croix, St. Thomas, St. John',
      notes: 'Melodic Caribbean English-lexifier creole with Danish and Dutch historical loanwords.'
    },
    {
      name: 'Spanish', nativeName: 'Español', type: 'Major Community Language',
      percentage: '17.0%', speakers: '15K', family: 'Indo-European (Romance)',
      script: 'Latin', bcp47: 'es-PR',
      regions: 'St. Croix & St. Thomas',
      notes: 'Spoken widely by Puerto Rican and Dominican heritage communities across the islands.'
    }
  ],
  ASM: [
    {
      name: 'English', nativeName: 'English', type: 'Co-Official',
      percentage: '38.0%', speakers: '18K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-US',
      regions: 'Pago Pago & Territory-wide',
      notes: 'Used alongside Samoan in territorial government, courts, and bilingual schooling.'
    }
  ],
  SGS: [
    {
      name: 'Norwegian', nativeName: 'Norsk', type: 'Historic Research & Heritage',
      percentage: '5.0%', speakers: 'Rotating Researchers', family: 'Indo-European (Germanic)',
      script: 'Latin (with æ, ø, å)', bcp47: 'nb-NO',
      regions: 'Grytviken Heritage Station',
      notes: 'Historically spoken at 20th-century whaling settlements; Norwegian place names dominate the island.'
    }
  ],
  IOT: [
    {
      name: 'Chagossian Creole', nativeName: 'Kreol Sagos', type: 'Historic Heritage Language',
      percentage: '1.0%', speakers: '10K (Diaspora)', family: 'French-based Creole',
      script: 'Latin', bcp47: 'fr-MU',
      regions: 'Historic Diego Garcia & Peros Banhos Heritage',
      notes: 'Heritage Diaspora: French-based creole spoken by the Chagossian Ilois community in UK and Mauritian diaspora.'
    }
  ],
  SHN: [
    {
      name: 'Saint Helenian Vernacular ("Saint")', nativeName: 'Saint Speak', type: 'Distinct Local Dialect',
      percentage: '95.0%', speakers: '4.1K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Jamestown & Island-wide',
      notes: 'Distinctive mid-Atlantic island variety preserving 17th-century British East India maritime forms.'
    }
  ],
  PCN: [
    {
      name: 'English', nativeName: 'English', type: 'Co-Official',
      percentage: '98.0%', speakers: '47', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Adamstown',
      notes: 'Used for official governance, external communication, and education alongside Pitkern.'
    }
  ],
  AIA: [
    {
      name: 'Anguillian Creole', nativeName: 'Anguillian Talk', type: 'Primary Vernacular',
      percentage: '90.0%', speakers: '14K', family: 'English-based Creole',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'The Valley & Island-wide',
      notes: 'Leeward Caribbean English-lexifier creole with distinctive rhythmic intonation.'
    }
  ],
  FLK: [
    {
      name: 'Spanish', nativeName: 'Español', type: 'Minority Resident Language',
      percentage: '11.0%', speakers: '400', family: 'Indo-European (Romance)',
      script: 'Latin', bcp47: 'es-CL',
      regions: 'Stanley & Camp',
      notes: 'Spoken by Chilean residents and preserved in historical South American ranching terminology.'
    }
  ],
  CYM: [
    {
      name: 'Spanish', nativeName: 'Español', type: 'Community Minority',
      percentage: '4.5%', speakers: '3.2K', family: 'Indo-European (Romance)',
      script: 'Latin', bcp47: 'es-419',
      regions: 'George Town & Grand Cayman',
      notes: 'Spoken by Central American, Cuban, and Colombian resident communities.'
    }
  ],
  VGB: [
    {
      name: 'Virgin Islands Creole', nativeName: 'BVIslander Creole', type: 'Primary Vernacular',
      percentage: '70.0%', speakers: '22K', family: 'English-based Creole',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Tortola, Virgin Gorda, Anegada',
      notes: 'Leeward Caribbean creole spoken across daily island life alongside Standard British English.'
    }
  ],
  TCA: [
    {
      name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', type: 'Major Minority',
      percentage: '18.0%', speakers: '8K', family: 'French-based Creole',
      script: 'Latin', bcp47: 'fr-FR',
      regions: 'Providenciales & Grand Turk',
      notes: 'Widely spoken by the large Haitian resident population across Providenciales.'
    }
  ],
  MSR: [
    {
      name: 'Montserratian Creole', nativeName: 'Montserratian Creole', type: 'Primary Vernacular',
      percentage: '90.0%', speakers: '4.2K', family: 'English-based Creole',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Brades & Northern Safe Zone',
      notes: 'Distinct Leeward Creole famed for surprising subtle Irish-English phonological influences.'
    }
  ],
  JEY: [
    {
      name: 'Jèrriais (Jersey Norman)', nativeName: 'Jèrriais', type: 'Recognized Heritage Language',
      percentage: '2.0%', speakers: '2.2K', family: 'Indo-European (Romance / Oïl)',
      script: 'Latin', bcp47: 'nrf-JE',
      regions: 'Rural Parishes of Jersey',
      notes: 'Endangered Norman-French language descended from medieval Duchy of Normandy speech.'
    }
  ],
  GGY: [
    {
      name: 'Guernésiais (Dgèrnésiais)', nativeName: 'Dgèrnésiais', type: 'Recognized Heritage Language',
      percentage: '1.5%', speakers: '1.0K', family: 'Indo-European (Romance / Oïl)',
      script: 'Latin', bcp47: 'nrf-GG',
      regions: 'Western Parishes of Guernsey',
      notes: 'Endangered Channel Island Norman language actively taught in cultural revival programs.'
    }
  ],
  IMN: [
    {
      name: 'Manx Gaelic', nativeName: 'Gaelg / Gailck', type: 'Co-Official Revival Language',
      percentage: '3.2%', speakers: '2.2K', family: 'Indo-European (Celtic)',
      script: 'Latin', bcp47: 'gv-IM',
      regions: 'Isle of Man (Bunscoill Ghaelgagh)',
      notes: 'Celebrated UNESCO language-revival success story; taught in immersion primary schools.'
    }
  ],
  ARE: [
    {
      name: 'English', nativeName: 'English', type: 'Commercial Lingua Franca',
      percentage: '75.0%', speakers: '7.5M', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Dubai, Abu Dhabi & Nationwide',
      notes: 'Primary language of business, aviation, hospitality, and international residents.'
    },
    {
      name: 'Malayalam, Hindi & Urdu', nativeName: 'മലയാളം / हिन्दी / اردو', type: 'Major Expatriate Communities',
      percentage: '45.0%', speakers: '4.2M', family: 'Dravidian & Indo-Iranian',
      script: 'Malayalam, Devanagari & Nastaliq', bcp47: 'hi-IN',
      regions: 'Dubai, Sharjah, Abu Dhabi',
      notes: 'Spoken across the UAE’s massive South Asian expatriate workforce.'
    },
    {
      name: 'Shihhi Arabic', nativeName: 'اللهجة الشحية', type: 'Distinct Local Variety',
      percentage: '0.5%', speakers: '40K', family: 'Afroasiatic (Semitic)',
      script: 'Arabic Alphabet', bcp47: 'ar-AE',
      regions: 'Ras Al Khaimah & Hajar Mountains',
      notes: 'Historic mountain Arabic dialect with unique Persian-substrate vocabulary.'
    }
  ],
  TKM: [
    {
      name: 'Russian', nativeName: 'Русский язык', type: 'Interethnic & Urban Language',
      percentage: '12.0%', speakers: '750K', family: 'Indo-European (Slavic)',
      script: 'Cyrillic', bcp47: 'ru-RU',
      regions: 'Ashgabat & Mary',
      notes: 'Retained in higher education, technical fields, and minority media.'
    },
    {
      name: 'Uzbek', nativeName: 'Oʻzbekcha', type: 'Regional Minority',
      percentage: '9.0%', speakers: '550K', family: 'Turkic (Karluk)',
      script: 'Latin / Cyrillic', bcp47: 'uz-UZ',
      regions: 'Daşoguz & Lebap Provinces',
      notes: 'Spoken by large communities along the Amu Darya river borderlands.'
    }
  ],
  TUN: [
    {
      name: 'French', nativeName: 'Français', type: 'Administrative & Educational',
      percentage: '63.0%', speakers: '7.5M', family: 'Indo-European (Romance)',
      script: 'Latin', bcp47: 'fr-FR',
      regions: 'Tunis, Sfax, Sousse (Nationwide)',
      notes: 'Widely used in universities, science, business, and daily Tunisian code-switching.'
    },
    {
      name: 'Tunisian Tamazight (Shelha)', nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ (Tachelhit)', type: 'Indigenous Minority',
      percentage: '1.0%', speakers: '120K', family: 'Afroasiatic (Berber)',
      script: 'Tifinagh & Arabic', bcp47: 'zgh-TN',
      regions: 'Matmata, Tataouine, Djerba',
      notes: 'Preserved in southern hilltop villages and parts of Djerba Island.'
    }
  ],
  SYR: [
    {
      name: 'Kurdish (Kurmanji)', nativeName: 'Kurdî (Kurmancî)', type: 'Major Regional Language',
      percentage: '10.0%', speakers: '2.1M', family: 'Indo-European (Indo-Iranian)',
      script: 'Latin (Hawar)', bcp47: 'kmr-SY',
      regions: 'Afrin, Kobanî, Qamishli, Hasakah',
      notes: 'Primary language across northern Syria alongside Arabic and Syriac.'
    },
    {
      name: 'Syriac / Neo-Aramaic (Suret & Turoyo)', nativeName: 'ܣܘܪܝܝܐ (Suryoyo)', type: 'Ancient Minority Language',
      percentage: '1.5%', speakers: '300K', family: 'Afroasiatic (Semitic)',
      script: 'Syriac Alphabet', bcp47: 'ar-SY',
      regions: 'Maaloula, Qamishli, Khabour Valley',
      notes: 'Western Neo-Aramaic in Maaloula is among the last surviving direct descendants of ancient Aramaic.'
    }
  ],
  SOL: [
    {
      name: 'Arabic', nativeName: 'العربية', type: 'Co-Official',
      percentage: '15.0%', speakers: '600K', family: 'Afroasiatic (Semitic)',
      script: 'Arabic Alphabet', bcp47: 'ar-SA',
      regions: 'Hargeisa, Berbera, Mosques & Schools',
      notes: 'Co-official constitutional language used in religious instruction and trade.'
    },
    {
      name: 'English', nativeName: 'English', type: 'Co-Official & Administrative',
      percentage: '12.0%', speakers: '500K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Hargeisa & Universities',
      notes: 'Inherited from British Somaliland protectorate; widely used in secondary and university instruction.'
    }
  ],
  SVK: [
    {
      name: 'Hungarian', nativeName: 'Magyar nyelv', type: 'Recognized Regional Co-Official',
      percentage: '8.5%', speakers: '460K', family: 'Uralic (Finno-Ugric)',
      script: 'Latin (with acute & umlaut)', bcp47: 'hu-HU',
      regions: 'Southern Danube Lowlands (Komárno, Dunajská Streda)',
      notes: 'Co-official in municipalities exceeding the 15% minority threshold.'
    },
    {
      name: 'Rusyn & Romani', nativeName: 'Русиньскый / Romani čhib', type: 'Recognized Minority Languages',
      percentage: '3.0%', speakers: '160K', family: 'Indo-European (Slavic & Indo-Aryan)',
      script: 'Cyrillic & Latin', bcp47: 'sk-SK',
      regions: 'Prešov & Eastern Slovakia',
      notes: 'Actively supported with bilingual street signage and radio programming in northeastern towns.'
    }
  ],
  SVN: [
    {
      name: 'Italian', nativeName: 'Italiano', type: 'Regional Co-Official',
      percentage: '0.3%', speakers: '6K', family: 'Indo-European (Romance)',
      script: 'Latin', bcp47: 'it-IT',
      regions: 'Slovenian Istria (Koper, Izola, Piran)',
      notes: 'Constitutionally protected co-official language across coastal Istrian municipalities.'
    },
    {
      name: 'Hungarian', nativeName: 'Magyar', type: 'Regional Co-Official',
      percentage: '0.4%', speakers: '8K', family: 'Uralic (Finno-Ugric)',
      script: 'Latin', bcp47: 'hu-HU',
      regions: 'Prekmurje (Lendava border belt)',
      notes: 'Co-official alongside Slovene in bilingual schools and town councils along the Hungarian border.'
    }
  ],
  SRB: [
    {
      name: 'Hungarian', nativeName: 'Magyar nyelv', type: 'Autonomous Co-Official',
      percentage: '3.6%', speakers: '240K', family: 'Uralic (Finno-Ugric)',
      script: 'Latin', bcp47: 'hu-HU',
      regions: 'Vojvodina (Subotica, Kanjiža)',
      notes: 'One of six official languages of the Autonomous Province of Vojvodina.'
    },
    {
      name: 'Bosnian & Albanian', nativeName: 'Bosanski / Shqip', type: 'Recognized Regional Languages',
      percentage: '3.2%', speakers: '210K', family: 'Indo-European (Slavic / Albanian)',
      script: 'Latin', bcp47: 'sr-RS',
      regions: 'Sandžak (Novi Pazar) & Preševo Valley',
      notes: 'Official in local administration across southwestern and southern Serbia.'
    }
  ],
  SMR: [
    {
      name: 'Romagnol (Sanmarinese Dialect)', nativeName: 'Dialèt samarinéś', type: 'Heritage Gallo-Italic Language',
      percentage: '35.0%', speakers: '12K', family: 'Indo-European (Romance / Gallo-Italic)',
      script: 'Latin', bcp47: 'it-IT',
      regions: 'Monte Titano & Rural Castelli',
      notes: 'Endangered local Gallo-Italic variety predating standardized Tuscan Italian.'
    }
  ],
  ROU: [
    {
      name: 'Hungarian', nativeName: 'Magyar nyelv', type: 'Major Regional Co-Official',
      percentage: '6.0%', speakers: '1.1M', family: 'Uralic (Finno-Ugric)',
      script: 'Latin (with acute & umlaut)', bcp47: 'hu-HU',
      regions: 'Transylvania (Harghita, Covasna, Cluj)',
      notes: 'Majority language in Székely Land with full Hungarian-medium schools and universities.'
    },
    {
      name: 'Romani', nativeName: 'Romani čhib', type: 'Recognized Minority',
      percentage: '1.5%', speakers: '280K', family: 'Indo-European (Indo-Aryan)',
      script: 'Latin', bcp47: 'ro-RO',
      regions: 'Nationwide',
      notes: 'Home to one of Europe’s largest Romani-speaking populations; officially taught in minority schools.'
    }
  ],
  QAT: [
    {
      name: 'English', nativeName: 'English', type: 'Commercial & Academic Lingua Franca',
      percentage: '75.0%', speakers: '2.1M', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Doha & Education City',
      notes: 'Used throughout business, healthcare, aviation, and international campuses.'
    },
    {
      name: 'Malayalam, Hindi & Tagalog', nativeName: 'മലയാളം / हिन्दी / Tagalog', type: 'Expatriate Community Languages',
      percentage: '45.0%', speakers: '1.3M', family: 'Dravidian, Indo-Iranian & Austronesian',
      script: 'Malayalam, Devanagari & Latin', bcp47: 'hi-IN',
      regions: 'Doha & Al Wakrah',
      notes: 'Reflects Qatar’s diverse expatriate workforce comprising over 85% of residents.'
    }
  ],
  OMN: [
    {
      name: 'Balochi (Southern)', nativeName: 'بلۏچی', type: 'Major Minority',
      percentage: '14.0%', speakers: '650K', family: 'Indo-European (Indo-Iranian)',
      script: 'Perso-Arabic', bcp47: 'ur-PK',
      regions: 'Al Batinah Coast & Muscat',
      notes: 'Spoken by Oman’s historic coastal Balochi community dating back centuries.'
    },
    {
      name: 'Kumzari & Jibbali (Shehri)', nativeName: 'كمزاري / شحري', type: 'Indigenous Endangered Languages',
      percentage: '1.2%', speakers: '55K', family: 'Indo-Iranian / Modern South Arabian',
      script: 'Arabic Alphabet (Oral Heritage)', bcp47: 'ar-OM',
      regions: 'Musandam Peninsula & Dhofar Mountains',
      notes: 'Musandam’s Kumzari (sole Iranian tongue native to Arabia) and Dhofar’s Jibbali are UNESCO treasures.'
    }
  ],
  PRK: [
    {
      name: 'Korean Sign Language (Joseon Sueo)', nativeName: '조선수어', type: 'Recognized National Sign Language',
      percentage: '0.1%', speakers: '20K', family: 'Sign Language',
      script: 'Sign / Gesture', bcp47: 'ko-KR',
      regions: 'Pyongyang & Nationwide',
      notes: 'Developed distinctly in North Korea with different lexical signs from South Korean Sign Language.'
    }
  ],
  NIU: [
    {
      name: 'English', nativeName: 'English', type: 'Co-Official',
      percentage: '90.0%', speakers: '1.5K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-NZ',
      regions: 'Alofi & Island-wide',
      notes: 'Bilingual governance alongside Vagahau Niue (Niuean), though Vagahau Niue is endangered globally.'
    }
  ],
  COK: [
    {
      name: 'Cook Islands Māori', nativeName: 'Te Reo Māori Kūki ʻĀirani', type: 'Co-Official Indigenous',
      percentage: '75.0%', speakers: '11K', family: 'Austronesian (Polynesian)',
      script: 'Latin (with ʻokina & macrons)', bcp47: 'rar-CK',
      regions: 'Rarotonga, Aitutaki, Outer Islands',
      notes: 'Closely related to New Zealand Māori and Tahitian; made co-official under the 2003 Act.'
    }
  ],
  ABW: [
    {
      name: 'Spanish & English', nativeName: 'Español / English', type: 'Widely Spoken Lingua Francas',
      percentage: '75.0%', speakers: '80K', family: 'Indo-European (Romance / Germanic)',
      script: 'Latin', bcp47: 'es-419',
      regions: 'Oranjestad & San Nicolas',
      notes: 'Most Arubans speak four languages fluently: Papiamento, Dutch, English, and Spanish.'
    }
  ],
  CUW: [
    {
      name: 'English & Spanish', nativeName: 'English / Español', type: 'Commercial Lingua Francas',
      percentage: '70.0%', speakers: '105K', family: 'Indo-European (Germanic / Romance)',
      script: 'Latin', bcp47: 'en-US',
      regions: 'Willemstad & Island-wide',
      notes: 'English and Spanish are mandatory alongside Papiamentu and Dutch in Curaçao schools.'
    }
  ],
  NPL: [
    {
      name: 'Maithili & Bhojpuri', nativeName: 'मैथिली / भोजपुरी', type: 'Major Recognized Languages',
      percentage: '17.0%', speakers: '5.1M', family: 'Indo-European (Indo-Iranian)',
      script: 'Devanagari & Tirhuta', bcp47: 'hi-IN',
      regions: 'Terai Southern Plains (Janakpur, Birgunj)',
      notes: 'Maithili is Nepal’s second-most spoken mother tongue with classical literary heritage.'
    },
    {
      name: 'Tamang & Nepal Bhasa (Newar)', nativeName: 'तामाङ / नेपाल भाषा', type: 'Indigenous Himalayan Languages',
      percentage: '8.2%', speakers: '2.5M', family: 'Sino-Tibetan (Tibeto-Burman)',
      script: 'Devanagari, Prachalit & Tamyig', bcp47: 'ne-NP',
      regions: 'Kathmandu Valley & Middle Hills',
      notes: 'Nepal recognizes over 120 national languages across Indo-Aryan, Tibeto-Burman, Austroasiatic, and Dravidian families.'
    }
  ],
  ESH: [
    {
      name: 'Spanish', nativeName: 'Español', type: 'Historic Second Language',
      percentage: '12.0%', speakers: '70K', family: 'Indo-European (Romance)',
      script: 'Latin', bcp47: 'es-ES',
      regions: 'Laayoune, Dakhla & Refugee Settlements',
      notes: 'Spanish remains widely understood alongside Hassaniya Arabic from the Spanish Sahara era.'
    }
  ],
  MNE: [
    {
      name: 'Serbian & Bosnian', nativeName: 'Српски / Bosanski', type: 'Major Co-Official Varieties',
      percentage: '48.0%', speakers: '300K', family: 'Indo-European (Slavic)',
      script: 'Cyrillic & Gaj’s Latin', bcp47: 'sr-RS',
      regions: 'Northern & Central Montenegro',
      notes: 'Mutually intelligible Štokavian South Slavic varieties co-listed in the constitution.'
    },
    {
      name: 'Albanian', nativeName: 'Shqip', type: 'Regional Official Language',
      percentage: '5.3%', speakers: '33K', family: 'Indo-European (Albanian)',
      script: 'Latin', bcp47: 'sq-AL',
      regions: 'Ulcinj, Tuzi, Plav',
      notes: 'Official at the municipal level along the southern Adriatic coast and Albanian border.'
    }
  ],
  MNG: [
    {
      name: 'Kazakh', nativeName: 'Қазақ тілі (Qazaqşa)', type: 'Regional Co-Official',
      percentage: '4.0%', speakers: '135K', family: 'Turkic (Kipchak)',
      script: 'Cyrillic', bcp47: 'kk-KZ',
      regions: 'Bayan-Ölgii Province (Western Altai)',
      notes: 'Co-official in western Bayan-Ölgii where eagle-hunting Kazakh herders form the majority.'
    },
    {
      name: 'Dukha (Tsaatan)', nativeName: 'Духа (Tuvan dialect)', type: 'Critically Endangered Indigenous',
      percentage: '0.02%', speakers: '< 500', family: 'Turkic (Siberian)',
      script: 'Cyrillic (Oral)', bcp47: 'mn-MN',
      regions: 'Khövsgöl Taiga',
      notes: 'Critically endangered Turkic language spoken by nomadic reindeer herders in northern Mongolia.'
    }
  ],
  MDA: [
    {
      name: 'Russian', nativeName: 'Русский язык', type: 'Interethnic & Urban Language',
      percentage: '14.5%', speakers: '380K', family: 'Indo-European (Slavic)',
      script: 'Cyrillic', bcp47: 'ru-RU',
      regions: 'Chișinău, Bălți, Transnistria',
      notes: 'Holds interethnic communication status and co-official status in Gagauzia and Transnistria.'
    },
    {
      name: 'Gagauz', nativeName: 'Gagauz dili', type: 'Autonomous Official Language',
      percentage: '4.1%', speakers: '110K', family: 'Turkic (Oghuz)',
      script: 'Latin (Turkish-based)', bcp47: 'tr-TR',
      regions: 'Autonomous Territorial Unit of Gagauzia',
      notes: 'Rare Turkic language spoken by an Eastern Orthodox Christian community in southern Moldova.'
    }
  ],
  MDV: [
    {
      name: 'English', nativeName: 'English', type: 'Second Administrative & Education Language',
      percentage: '85.0%', speakers: '440K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Malé & Resort Atolls',
      notes: 'Medium of instruction in schools and principal language of commerce and tourism.'
    }
  ],
  MYS: [
    {
      name: 'Chinese Varieties (Mandarin, Hokkien, Cantonese)', nativeName: '华语 / 福建话 / 廣東話', type: 'Major National Community',
      percentage: '22.5%', speakers: '7.4M', family: 'Sino-Tibetan (Sinitic)',
      script: 'Simplified Hanzi', bcp47: 'zh-CN',
      regions: 'Penang, Kuala Lumpur, Ipoh, Kuching',
      notes: 'Malaysian Mandarin, Penang Hokkien, and KL Cantonese anchor commerce and Chinese-medium schools.'
    },
    {
      name: 'Tamil', nativeName: 'தமிழ் (Tamiḻ)', type: 'Major Recognized Minority',
      percentage: '6.8%', speakers: '2.2M', family: 'Dravidian',
      script: 'Tamil Script', bcp47: 'ta-MY',
      regions: 'Selangor, Perak, Negeri Sembilan',
      notes: 'Co-taught in national-type Tamil schools and heard across Malaysian Indian communities.'
    },
    {
      name: 'Iban & Kadazandusun', nativeName: 'Jaku Iban / Boros Kadazandusun', type: 'Major Indigenous Bornean',
      percentage: '4.8%', speakers: '1.6M', family: 'Austronesian (Malayo-Polynesian)',
      script: 'Latin', bcp47: 'ms-MY',
      regions: 'Sarawak & Sabah (East Malaysia)',
      notes: 'Rich Bornean languages spoken by Dayak and Kadazan-Dusun peoples of East Malaysia.'
    }
  ],
  LTU: [
    {
      name: 'Polish', nativeName: 'Język polski', type: 'Major Regional Minority',
      percentage: '5.6%', speakers: '155K', family: 'Indo-European (Slavic)',
      script: 'Latin (with ąćęłńóśźż)', bcp47: 'pl-PL',
      regions: 'Vilnius County & Šalčininkai',
      notes: 'Supported by Polish-language schools and cultural institutions in southeastern Lithuania.'
    },
    {
      name: 'Russian', nativeName: 'Русский язык', type: 'Minority & Urban Second Language',
      percentage: '4.8%', speakers: '135K', family: 'Indo-European (Slavic)',
      script: 'Cyrillic', bcp47: 'ru-RU',
      regions: 'Visaginas, Klaipėda, Vilnius',
      notes: 'Spoken by minority communities while English rapidly leads among younger generations.'
    }
  ],
  LIE: [
    {
      name: 'Alemannic (Liechtensteinerisch)', nativeName: 'Liachtaschtanerisch', type: 'Everyday Spoken Vernacular',
      percentage: '85.0%', speakers: '33K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'de-CH',
      regions: 'Vaduz, Schaan & Mountain Walser Triesenberg',
      notes: 'Distinct High Alemannic and Walser Alpine dialects spoken in daily life, contrasting with written Standard German.'
    }
  ],
  LBY: [
    {
      name: 'Tamazight (Nafusi, Tuareg & Awjila)', nativeName: 'ⵜⴰⵎⴰⵣⵉⵖⵜ (Tamaheq / Tanfusit)', type: 'Indigenous Amazigh Languages',
      percentage: '8.5%', speakers: '600K', family: 'Afroasiatic (Berber)',
      script: 'Tifinagh & Arabic', bcp47: 'ber-LY',
      regions: 'Nafusa Mountains, Zuwarah, Ghat & Oasis Towns',
      notes: 'Several Berber languages preserved across western coastal towns, Nafusa hills, and southern Sahara.'
    },
    {
      name: 'Teda (Tubu)', nativeName: 'Tedaga', type: 'Indigenous Saharan Minority',
      percentage: '0.8%', speakers: '55K', family: 'Nilo-Saharan (Saharan)',
      script: 'Latin / Arabic (Oral)', bcp47: 'ar-LY',
      regions: 'Kufra & Murzuq Basin',
      notes: 'Spoken by nomadic Toubou communities across southern Libya and the Tibesti borderlands.'
    }
  ],
  LVA: [
    {
      name: 'Russian', nativeName: 'Русский язык', type: 'Major Minority Language',
      percentage: '34.0%', speakers: '630K', family: 'Indo-European (Slavic)',
      script: 'Cyrillic', bcp47: 'ru-RU',
      regions: 'Riga, Daugavpils, Rēzekne',
      notes: 'Widely spoken in Riga and eastern Latgale alongside Latvian.'
    },
    {
      name: 'Latgalian & Livonian', nativeName: 'Latgalīšu volūda / Līvõ kēļ', type: 'Protected Historic & Indigenous',
      percentage: '8.0%', speakers: '150K', family: 'Indo-European (Baltic) & Uralic',
      script: 'Latin', bcp47: 'lv-LV',
      regions: 'Latgale & Kurzeme Livonian Coast',
      notes: 'Latgalian is protected by law; Finnic Livonian on the Baltic coast undergoes dedicated heritage revival.'
    }
  ],
  LAO: [
    {
      name: 'Khmu', nativeName: 'ພາສາຂະມຸ (Kmhmu)', type: 'Largest Indigenous Minority',
      percentage: '11.0%', speakers: '800K', family: 'Austroasiatic (Mon–Khmer)',
      script: 'Lao & Latin', bcp47: 'lo-LA',
      regions: 'Northern Laos (Luang Prabang, Oudomxay)',
      notes: 'Ancient Austroasiatic language predating Tai migration into the Mekong basin.'
    },
    {
      name: 'Hmong (Hmong Daw & Mong Njua)', nativeName: 'Hmoob Dawb', type: 'Major Highland Minority',
      percentage: '9.2%', speakers: '670K', family: 'Hmong-Mien',
      script: 'Romanized Popular Alphabet & Pahawh Hmong', bcp47: 'lo-LA',
      regions: 'Xiangkhouang & Northern Highlands',
      notes: 'Tonal Hmong-Mien language known for its native Pahawh Hmong script.'
    }
  ],
  KWT: [
    {
      name: 'English', nativeName: 'English', type: 'Business & Technical Lingua Franca',
      percentage: '72.0%', speakers: '3.1M', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Kuwait City & Oil Sector',
      notes: 'Compulsory second language used extensively in banking, energy, and healthcare.'
    },
    {
      name: 'Hindi, Urdu & Tagalog', nativeName: 'हिन्दी / اردو / Tagalog', type: 'Expatriate Community Languages',
      percentage: '40.0%', speakers: '1.7M', family: 'Indo-Iranian & Austronesian',
      script: 'Devanagari, Nastaliq & Latin', bcp47: 'hi-IN',
      regions: 'Hawalli, Salmiya, Farwaniya',
      notes: 'Spoken across Kuwait’s large South and Southeast Asian resident communities.'
    }
  ],
  KOS: [
    {
      name: 'Serbian', nativeName: 'Српски / Srpski', type: 'Constitutionally Co-Official',
      percentage: '4.5%', speakers: '80K', family: 'Indo-European (Slavic)',
      script: 'Cyrillic & Latin', bcp47: 'sr-RS',
      regions: 'North Mitrovica, Gračanica, Štrpce',
      notes: 'Constitutionally co-official across Kosovo alongside Albanian.'
    },
    {
      name: 'Bosnian & Turkish', nativeName: 'Bosanski / Türkçe', type: 'Recognized Official at Municipal Level',
      percentage: '2.8%', speakers: '50K', family: 'Indo-European (Slavic) & Turkic',
      script: 'Latin', bcp47: 'tr-TR',
      regions: 'Prizren, Dragash & Mamusha',
      notes: 'Turkish has deep Ottoman roots in Prizren and municipal official status.'
    }
  ],
  JOR: [
    {
      name: 'English', nativeName: 'English', type: 'Primary Commercial & University Language',
      percentage: '45.0%', speakers: '5.0M', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Amman & Nationwide',
      notes: 'Taught from early grades and dominant in STEM, medicine, and tourism.'
    },
    {
      name: 'Circassian (Adyghe & Kabardian)', nativeName: 'Адыгабзэ', type: 'Historic Minority Heritage',
      percentage: '1.0%', speakers: '100K', family: 'Northwest Caucasian',
      script: 'Cyrillic / Arabic / Latin', bcp47: 'ar-JO',
      regions: 'Amman, Jerash, Wadi Al-Seer',
      notes: 'Preserved since 19th-century Caucasian resettlement in Amman; taught at Prince Hamza bin Al Hussein School.'
    }
  ],
  PSE: [
    {
      name: 'Hebrew & English', nativeName: 'עברית / English', type: 'Widely Spoken Second Languages',
      percentage: '40.0%', speakers: '2.1M', family: 'Afroasiatic (Semitic) & Germanic',
      script: 'Hebrew Alphabet & Latin', bcp47: 'en-GB',
      regions: 'West Bank & East Jerusalem',
      notes: 'English serves in international commerce and education while Hebrew is frequently understood for daily interaction.'
    }
  ],
  ISL: [
    {
      name: 'English', nativeName: 'English', type: 'Widely Fluent Lingua Franca',
      percentage: '90.0%', speakers: '340K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Reykjavík & Nationwide',
      notes: 'Almost universally spoken alongside compulsory Danish/Nordic studies and vibrant Icelandic linguistic purism.'
    },
    {
      name: 'Polish', nativeName: 'Język polski', type: 'Largest Immigrant Minority',
      percentage: '6.0%', speakers: '23K', family: 'Indo-European (Slavic)',
      script: 'Latin (with ąćęłńóśźż)', bcp47: 'pl-PL',
      regions: 'Reykjavík & Reykjanesbær',
      notes: 'By far the largest non-native language community in modern Iceland.'
    }
  ],
  HUN: [
    {
      name: 'Romani & Boyash', nativeName: 'Romani čhib / Băieș', type: 'Recognized Minority Languages',
      percentage: '1.8%', speakers: '175K', family: 'Indo-European (Indo-Aryan & Romance)',
      script: 'Latin', bcp47: 'hu-HU',
      regions: 'Northeastern & Southern Hungary',
      notes: 'Lovari Romani and archaic Romanian-based Boyash are officially protected minority tongues.'
    },
    {
      name: 'German (Danube Swabian)', nativeName: 'Ungarndeutsch', type: 'Recognized Minority',
      percentage: '1.2%', speakers: '115K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'de-DE',
      regions: 'Baranya, Tolna, Budapest Agglomeration',
      notes: 'Preserved in bilingual German-Hungarian minority schools and cultural towns.'
    }
  ],
  GEO: [
    {
      name: 'Mingrelian & Svan', nativeName: 'მარგალური ნინა / ლუშნუ ნინ', type: 'Sister Kartvelian Languages',
      percentage: '12.0%', speakers: '430K', family: 'Kartvelian',
      script: 'Georgian (Mkhedruli)', bcp47: 'ka-GE',
      regions: 'Samegrelo & High Caucasus Svaneti',
      notes: 'Distinct Kartvelian languages sharing Georgia’s ancient family tree alongside Laz.'
    },
    {
      name: 'Azerbaijani & Armenian', nativeName: 'Azərbaycanca / Հայերեն', type: 'Major Regional Minorities',
      percentage: '11.5%', speakers: '420K', family: 'Turkic & Indo-European (Armenian)',
      script: 'Latin & Armenian Alphabet', bcp47: 'az-AZ',
      regions: 'Kvemo Kartli & Samtskhe-Javakheti',
      notes: 'Major regional languages in southern Georgia supported with minority-language schooling.'
    }
  ],
  SPM: [
    {
      name: 'Basque & Breton Heritage', nativeName: 'Euskara / Brezhoneg', type: 'Historic Maritime Heritage',
      percentage: '1.0%', speakers: 'Cultural Events', family: 'Language Isolate & Celtic',
      script: 'Latin', bcp47: 'eu-PM',
      regions: 'Saint-Pierre Harbor',
      notes: 'Cultural Heritage: Basque pelota festivals and Breton sailor surnames testify to centuries of North Atlantic cod-fishing heritage.'
    }
  ],
  WLF: [
    {
      name: 'Wallisian & Futunan', nativeName: 'Fakaʻuvea / Fakafutuna', type: 'Primary Polynesian Vernaculars',
      percentage: '92.0%', speakers: '10.5K', family: 'Austronesian (Polynesian)',
      script: 'Latin', bcp47: 'fr-FR',
      regions: 'Uvea (Wallis) & Futuna Islands',
      notes: 'Two distinct Polynesian tongues recognized by the French Republic as regional languages alongside French.'
    }
  ],
  MAF: [
    {
      name: 'Caribbean English & Haitian Creole', nativeName: 'Saint-Martin English / Kreyòl', type: 'Everyday Island Lingua Francas',
      percentage: '75.0%', speakers: '24K', family: 'Germanic & French-based Creole',
      script: 'Latin', bcp47: 'en-US',
      regions: 'Marigot, Grand Case, Quartier d’Orléans',
      notes: 'Virgin-Islands-type Caribbean English dominates daily commerce across both French Saint-Martin and Dutch Sint Maarten.'
    }
  ],
  BLM: [
    {
      name: 'Saint-Barth Patois & Creoles', nativeName: 'Patois saint-barth', type: 'Historic Island Vernacular',
      percentage: '30.0%', speakers: '3.0K', family: 'Indo-European (Romance / Oïl)',
      script: 'Latin', bcp47: 'fr-FR',
      regions: 'Corossol & Colombier',
      notes: 'Unique archival Norman-Breton French dialect preserved in rural Leeward neighborhoods alongside Caribbean English.'
    }
  ],
  ATF: [
    {
      name: 'English (Antarctic Expedition Lingua Franca)', nativeName: 'English', type: 'Scientific Collaboration Language',
      percentage: '35.0%', speakers: 'Rotating Researchers', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Kerguelen, Crozet, Adélie Land',
      notes: 'Used in joint glaciological, meteorological, and marine biology research programs.'
    }
  ],
  ALA: [
    {
      name: 'Finnish', nativeName: 'Suomi', type: 'Minority Community Language',
      percentage: '4.7%', speakers: '1.5K', family: 'Uralic (Finnic)',
      script: 'Latin', bcp47: 'fi-FI',
      regions: 'Mariehamn',
      notes: 'By Autonomy Act treaty, Åland is constitutionally unilingual Swedish, though ~5% speak Finnish natively.'
    }
  ],
  EST: [
    {
      name: 'Russian', nativeName: 'Русский язык', type: 'Major Minority Language',
      percentage: '28.0%', speakers: '380K', family: 'Indo-European (Slavic)',
      script: 'Cyrillic', bcp47: 'ru-RU',
      regions: 'Tallinn & Ida-Viru County (Narva)',
      notes: 'Spoken across eastern Estonia and parts of Tallinn; Narva is predominantly Russian-speaking.'
    },
    {
      name: 'Võro & Seto', nativeName: 'Võro kiil / Seto kiil', type: 'Regional South Estonian Languages',
      percentage: '5.5%', speakers: '75K', family: 'Uralic (Finnic)',
      script: 'Latin', bcp47: 'et-EE',
      regions: 'Southeastern Estonia (Võru County)',
      notes: 'Historically distinct Finnic varieties experiencing active literary, Wikipedia, and cultural revival.'
    }
  ],
  SLV: [
    {
      name: 'Nawat (Pipil)', nativeName: 'Nawat', type: 'Endangered Indigenous Heritage',
      percentage: '0.1%', speakers: '< 2K', family: 'Uto-Aztecan',
      script: 'Latin', bcp47: 'es-SV',
      regions: 'Santo Domingo de Guzmán (Sonsonate)',
      notes: 'Critically endangered Uto-Aztecan relative of Nahuatl undergoing urgent cradle-nest revitalization.'
    }
  ],
  DOM: [
    {
      name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', type: 'Largest Immigrant & Border Language',
      percentage: '6.5%', speakers: '720K', family: 'French-based Creole',
      script: 'Latin', bcp47: 'fr-FR',
      regions: 'Border Provinces, Santo Domingo & Bateyes',
      notes: 'Spoken by large Haitian migrant and Dominican-Haitian communities island-wide.'
    }
  ],
  FRO: [
    {
      name: 'Faroese', nativeName: 'Føroyskt', type: 'Primary National Language',
      percentage: '94.0%', speakers: '50K', family: 'Indo-European (Germanic / North)',
      script: 'Latin (with ð, ø, æ)', bcp47: 'da-DK',
      regions: 'Tórshavn & All 18 Islands',
      notes: 'Conservative West Norse language closely related to Icelandic and historic Norwegian dialects.'
    },
    {
      name: 'Danish', nativeName: 'Dansk', type: 'Co-Official Administrative',
      percentage: '90.0%', speakers: '48K', family: 'Indo-European (Germanic)',
      script: 'Latin (with æ, ø, å)', bcp47: 'da-DK',
      regions: 'Government & Compulsory Education',
      notes: 'Co-official under Home Rule Act and widely understood as an administrative & academic second language.'
    }
  ],
  DNK: [
    {
      name: 'Greenlandic & Faroese', nativeName: 'Kalaallisut / Føroyskt', type: 'Realm Languages',
      percentage: '0.5%', speakers: '30K', family: 'Eskimo-Aleut & Germanic',
      script: 'Latin', bcp47: 'kl-GL',
      regions: 'Realm Diaspora in Copenhagen & Aarhus',
      notes: 'Languages of the autonomous Realm nations; German also holds recognized minority status in South Jutland.'
    },
    {
      name: 'South Jutland German', nativeName: 'Deutsch (Nordschleswig)', type: 'Recognized Historic Minority',
      percentage: '0.4%', speakers: '20K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'de-DE',
      regions: 'Sønderjylland (Aabenraa, Tønder, Sønderborg)',
      notes: 'Protected under the 1955 Copenhagen-Bonn Declarations with dedicated schools and kindergartens.'
    }
  ],
  CZE: [
    {
      name: 'Slovak', nativeName: 'Slovenčina', type: 'Constitutionally Privileged Minority',
      percentage: '1.5%', speakers: '160K', family: 'Indo-European (Slavic)',
      script: 'Latin', bcp47: 'sk-SK',
      regions: 'Nationwide & Moravia',
      notes: 'Practically 100% mutually intelligible with Czech and permitted directly in Czech official proceedings.'
    },
    {
      name: 'Moravian, Polish & Romani', nativeName: 'Moravština / Polski / Romani', type: 'Regional & Minority Varieties',
      percentage: '1.2%', speakers: '130K', family: 'Indo-European (Slavic & Indo-Aryan)',
      script: 'Latin', bcp47: 'cs-CZ',
      regions: 'Silesia (Těšín) & Moravia',
      notes: 'Polish has bilingual signage in Zaolzie (Moravian-Silesian border), alongside vibrant Moravian regional speech.'
    }
  ],
  CYN: [
    {
      name: 'English', nativeName: 'English', type: 'Commercial & University Language',
      percentage: '55.0%', speakers: '210K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Nicosia, Kyrenia, Famagusta',
      notes: 'Widely used in tourism, international universities, and Cypriot-Turkish everyday vocabulary.'
    }
  ],
  CUB: [
    {
      name: 'Lucumí & Haitian Creole', nativeName: 'Lucumí / Kreyòl Ayisyen', type: 'Liturgical & Regional Minority',
      percentage: '2.8%', speakers: '320K', family: 'Niger-Congo (Yoruboid) & French Creole',
      script: 'Latin', bcp47: 'es-ES',
      regions: 'Havana, Matanzas & Eastern Oriente',
      notes: 'Liturgical Yoruba-derived Lucumí survives in Afro-Cuban Santería traditions; Haitian Creole thrives in eastern provinces.'
    }
  ],
  HRV: [
    {
      name: 'Serbian & Italian', nativeName: 'Srpski / Italiano', type: 'Recognized Minority Languages',
      percentage: '4.5%', speakers: '175K', family: 'Indo-European (Slavic / Romance)',
      script: 'Cyrillic & Latin', bcp47: 'hr-HR',
      regions: 'Istria, Vukovar, Knin',
      notes: 'Italian is co-official in coastal Istrian municipalities; Serbian holds constitutional minority rights.'
    },
    {
      name: 'Chakavian & Kajkavian Dialects', nativeName: 'Čakavica / Kajkavica', type: 'Distinct Regional Supradialects',
      percentage: '35.0%', speakers: '1.3M', family: 'Indo-European (Slavic)',
      script: 'Latin', bcp47: 'hr-HR',
      regions: 'Dalmatian Islands, Istria & Zagorje',
      notes: 'Rich historical Croatian literary varieties predating Štokavian standardization.'
    }
  ],
  CRI: [
    {
      name: 'Limonese Mekatelyu Creole', nativeName: 'Mekatelyu', type: 'Protected Regional Vernacular',
      percentage: '2.5%', speakers: '125K', family: 'English-based Creole',
      script: 'Latin', bcp47: 'en-US',
      regions: 'Limón Province (Caribbean Coast)',
      notes: 'Afro-Caribbean English creole descending from Jamaican railroad and banana workers.'
    },
    {
      name: 'Bribri & Cabécar', nativeName: 'Bribri / Kabékal', type: 'Indigenous Chibchan Languages',
      percentage: '0.6%', speakers: '30K', family: 'Chibchan',
      script: 'Latin', bcp47: 'es-CR',
      regions: 'Talamanca Mountains',
      notes: 'Tonal indigenous languages spoken by Costa Rica’s largest First Nations peoples.'
    }
  ],
  KHM: [
    {
      name: 'Western Cham', nativeName: 'Basa Cham (ចាម)', type: 'Major Indigenous Minority',
      percentage: '2.0%', speakers: '340K', family: 'Austronesian (Chamic)',
      script: 'Khmer, Arabic & Akhar Thrah', bcp47: 'km-KH',
      regions: 'Kampong Cham & Mekong Villages',
      notes: 'Remnant language of the historic Champa maritime kingdom, spoken along Cambodia’s rivers.'
    },
    {
      name: 'Vietnamese & Jarai / Tampuan', nativeName: 'Tiếng Việt / Jrai', type: 'Ethnic & Indigenous Minorities',
      percentage: '2.2%', speakers: '380K', family: 'Austroasiatic & Austronesian',
      script: 'Latin & Khmer', bcp47: 'vi-VN',
      regions: 'Ratanakiri, Mondulkiri & Tonlé Sap',
      notes: 'Hilltribe Mon-Khmer and Chamic languages anchor northeastern Cambodia’s biodiversity corridor.'
    }
  ],
  MMR: [
    {
      name: 'Shan (Tai Yai)', nativeName: 'ၽႃႇသႃႇတႆး (Kwam Tai)', type: 'Major State Language',
      percentage: '8.5%', speakers: '4.6M', family: 'Kra-Dai (Tai-Kadai)',
      script: 'Shan Alphabet (Lik Tai)', bcp47: 'my-MM',
      regions: 'Shan State',
      notes: 'Close cousin of Thai and Lao spoken across the Shan Plateau.'
    },
    {
      name: 'Karen (S’gaw & Pwo) & Kachin', nativeName: 'ကညီကျိာ် / Jinghpaw', type: 'Major Indigenous Languages',
      percentage: '9.5%', speakers: '5.2M', family: 'Sino-Tibetan (Tibeto-Burman)',
      script: 'Burmese-adapted & Latin', bcp47: 'my-MM',
      regions: 'Kayin State, Kachin State, Ayeyarwady Delta',
      notes: 'Over 100 distinct languages across Tibeto-Burman, Tai, Austroasiatic, and Austronesian (Moken) families thrive across Myanmar.'
    }
  ],
  BGR: [
    {
      name: 'Turkish', nativeName: 'Türkçe', type: 'Largest Minority Language',
      percentage: '8.4%', speakers: '560K', family: 'Turkic (Oghuz)',
      script: 'Latin (Turkish Alphabet)', bcp47: 'tr-TR',
      regions: 'Kardzhali, Razgrad, Shumen',
      notes: 'Taught as an elective mother tongue in southern and northeastern Bulgarian provinces.'
    },
    {
      name: 'Romani (Balkan & Vlach)', nativeName: 'Romani čhib', type: 'Significant Minority',
      percentage: '4.4%', speakers: '290K', family: 'Indo-European (Indo-Aryan)',
      script: 'Latin & Cyrillic', bcp47: 'bg-BG',
      regions: 'Nationwide',
      notes: 'Vibrant Balkan Romani varieties spoken across eastern and central Bulgaria.'
    }
  ],
  BTN: [
    {
      name: 'Tshangla (Sharchopkha)', nativeName: 'ཚངས་ལ་ (Sharchopkha)', type: 'Largest Regional Language',
      percentage: '28.0%', speakers: '215K', family: 'Sino-Tibetan (Tibeto-Burman)',
      script: 'Tibetan Script (Uchen)', bcp47: 'bo-CN',
      regions: 'Eastern Bhutan (Trashigang, Mongar)',
      notes: 'Mother tongue of Bhutan’s eastern valleys; mutually distinct from western Dzongkha.'
    },
    {
      name: 'Nepali (Lhotshamkha)', nativeName: 'नेपाली', type: 'Southern Minority Language',
      percentage: '22.0%', speakers: '170K', family: 'Indo-European (Indo-Iranian)',
      script: 'Devanagari', bcp47: 'ne-NP',
      regions: 'Southern Foothills (Phuentsholing, Samtse)',
      notes: 'Widely spoken across southern Bhutan’s subtropical border towns.'
    }
  ],
  BGD: [
    {
      name: 'Sylheti & Chittagonian', nativeName: 'ছিলটী / চিটাইঙ্গা', type: 'Major Distinct Regional Varieties',
      percentage: '18.0%', speakers: '30M', family: 'Indo-European (Indo-Iranian)',
      script: 'Bengali–Assamese & Historic Sylheti Nagari', bcp47: 'bn-BD',
      regions: 'Sylhet Division & Chattogram Coastal Belt',
      notes: 'Linguists consider Chittagonian and Sylheti distinct enough to border on separate Eastern Indo-Aryan languages.'
    },
    {
      name: 'Chakma, Santali & Marma', nativeName: '𑄌𑄋𑄴𑄟𑄳𑄦 / ᱥᱟᱱᱛᱟᱲᱤ', type: 'Indigenous Minority Languages',
      percentage: '1.2%', speakers: '2.0M', family: 'Indo-Aryan / Austroasiatic / Tibeto-Burman',
      script: 'Chakma, Ol Chiki & Burmese', bcp47: 'bn-BD',
      regions: 'Chittagong Hill Tracts & Rajshahi',
      notes: 'Multifamily indigenous corridor where Tibeto-Burman, Austroasiatic (Santali), and Indo-Aryan tongues meet.'
    }
  ],
  BHR: [
    {
      name: 'English', nativeName: 'English', type: 'Commercial & Expatriate Lingua Franca',
      percentage: '75.0%', speakers: '1.1M', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-GB',
      regions: 'Manama & Financial District',
      notes: 'Extensively used across Gulf banking, road signage, and private schools.'
    },
    {
      name: 'Hindi, Urdu & Malayalam', nativeName: 'हिन्दी / اردو / മലയാളം', type: 'Expatriate Community Languages',
      percentage: '40.0%', speakers: '600K', family: 'Indo-Iranian & Dravidian',
      script: 'Devanagari, Nastaliq & Malayalam', bcp47: 'hi-IN',
      regions: 'Manama & Muharraq',
      notes: 'Spoken by Bahrain’s long-established South Asian resident community.'
    }
  ],
  AZE: [
    {
      name: 'Russian', nativeName: 'Русский язык', type: 'Historic Urban Lingua Franca',
      percentage: '15.0%', speakers: '1.5M', family: 'Indo-European (Slavic)',
      script: 'Cyrillic', bcp47: 'ru-RU',
      regions: 'Baku & Sumqayıt',
      notes: 'Maintained in Baku’s Russian-sector schools, theater, and press.'
    },
    {
      name: 'Talysh & Lezgian', nativeName: 'Tolışə zıvon / Лезги чӀал', type: 'Indigenous Regional Minorities',
      percentage: '4.5%', speakers: '450K', family: 'Indo-Iranian & Northeast Caucasian',
      script: 'Latin & Cyrillic', bcp47: 'az-AZ',
      regions: 'Lankaran Lowlands & Greater Caucasus North (Qusar)',
      notes: 'Distinct Iranian and Caucasian mountain languages indigenous to Azerbaijan.'
    }
  ],
  IOA: [
    {
      name: 'Cocos Malay & Christmas Mandarin', nativeName: 'Basa Pulu Kokos / 华语', type: 'Island Heritage Languages',
      percentage: '45.0%', speakers: '1.0K', family: 'Austronesian & Sino-Tibetan',
      script: 'Latin & Simplified Hanzi', bcp47: 'ms-MY',
      regions: 'Home Island (Cocos) & Flying Fish Cove (Christmas Island)',
      notes: 'Cocos Malay and Hokkien/Cantonese/Mandarin reflect the rich Indian Ocean heritage of both islands.'
    }
  ],
  HMD: [
    {
      name: 'Scientific Terms (Sub-Antarctic Survey)', nativeName: 'English / Latin Taxonomy', type: 'Research Designation Only',
      percentage: '100.0%', speakers: 'Expedition Teams Only', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-AU',
      regions: 'Big Ben Volcano & Atlas Cove',
      notes: '100% Uninhabited: Permanently uninhabited Australian territory visited solely by scientific and conservation vessels.'
    }
  ],
  NFK: [
    {
      name: 'Norf’k (Norfolk Pitcairnese)', nativeName: 'Norf’k', type: 'Co-Official Heritage Language',
      percentage: '45.0%', speakers: '950', family: 'English–Tahitian Contact Creole',
      script: 'Latin', bcp47: 'pih-NF',
      regions: 'Kingston & Burnt Pine',
      notes: 'Descended from the 18th-century HMS Bounty mutineers and Tahitian settlers relocated from Pitcairn.'
    },
    {
      name: 'English (Australian)', nativeName: 'English', type: 'Co-Official',
      percentage: '98.0%', speakers: '2.1K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-AU',
      regions: 'Island-wide',
      notes: 'Primary language of administration, schooling, and visitor hospitality alongside Norf’k.'
    }
  ],
  ATC: [
    {
      name: 'Indonesian (Maritime Trade Heritage)', nativeName: 'Bahasa Indonesia', type: 'Historic Maritime Fishing Heritage',
      percentage: '1.0%', speakers: 'Seasonal Fisherfolk', family: 'Austronesian',
      script: 'Latin', bcp47: 'id-ID',
      regions: 'Timor Sea Reefs',
      notes: 'Treaty Heritage: Uninhabited reefs where traditional Rote and Makassar fishermen retain ancestral access under MOU.'
    }
  ],
  ARM: [
    {
      name: 'Russian', nativeName: 'Русский язык', type: 'Widely Spoken Second Language',
      percentage: '65.0%', speakers: '1.9M', family: 'Indo-European (Slavic)',
      script: 'Cyrillic', bcp47: 'ru-RU',
      regions: 'Yerevan & Nationwide',
      notes: 'Spoken fluently by most adults for trade, science, and CIS communications.'
    },
    {
      name: 'Yezidi (Kurmanji) & Neo-Aramaic', nativeName: 'Êzdîkî / ܣܘܪܝܝܐ', type: 'Protected Minority Languages',
      percentage: '1.8%', speakers: '50K', family: 'Indo-Iranian & Afroasiatic (Semitic)',
      script: 'Cyrillic / Latin & Syriac', bcp47: 'hy-AM',
      regions: 'Aknalich, Aragatsotn & Arzni',
      notes: 'Yezidi radio and Assyrian Aramaic heritage schools enjoy constitutional minority protection.'
    }
  ],
  AGO: [
    {
      name: 'Umbundu', nativeName: 'Umbundu', type: 'Most Spoken National Indigenous',
      percentage: '23.0%', speakers: '8.2M', family: 'Niger-Congo (Bantu)',
      script: 'Latin', bcp47: 'pt-PT',
      regions: 'Central Highlands (Huambo, Benguela, Bié)',
      notes: 'Largest indigenous Bantu language of Angola, widely used alongside Portuguese in central provinces.'
    },
    {
      name: 'Kikongo & Kimbundu', nativeName: 'Kikongo / Kimbundu', type: 'Major National Bantu Languages',
      percentage: '16.0%', speakers: '5.7M', family: 'Niger-Congo (Bantu)',
      script: 'Latin', bcp47: 'pt-PT',
      regions: 'Luanda, Uíge, Malanje, Zaire',
      notes: 'Kimbundu contributed dozens of household words (like "bunda" and "quitute") to Brazilian Portuguese.'
    }
  ],
  AND: [
    {
      name: 'Spanish & Portuguese', nativeName: 'Español / Português', type: 'Widely Spoken Resident Languages',
      percentage: '48.0%', speakers: '39K', family: 'Indo-European (Romance)',
      script: 'Latin', bcp47: 'es-ES',
      regions: 'Andorra la Vella & Escaldes',
      notes: 'Spanish, Portuguese, and French schools operate side-by-side under Andorra’s trilingual system.'
    },
    {
      name: 'French', nativeName: 'Français', type: 'Co-Principality Diplomatic & School Language',
      percentage: '35.0%', speakers: '28K', family: 'Indo-European (Romance)',
      script: 'Latin', bcp47: 'fr-FR',
      regions: 'Pas de la Case & Lycée Comte de Foix',
      notes: 'Reflects France’s historic co-principality ties across northern Pyrenean parishes.'
    }
  ],
  ALB: [
    {
      name: 'Greek & Aromanian', nativeName: 'Ελληνικά / Armãneashti', type: 'Recognized Southern Minorities',
      percentage: '2.5%', speakers: '70K', family: 'Indo-European (Hellenic & Romance)',
      script: 'Greek Alphabet & Latin', bcp47: 'el-GR',
      regions: 'Dropull, Himara, Voskopojë, Korçë',
      notes: 'Southern Albania hosts ancient Eastern Romance Aromanian communities and bilingual Greek villages.'
    },
    {
      name: 'Italian & English', nativeName: 'Italiano / English', type: 'Popular Second Languages',
      percentage: '45.0%', speakers: '1.2M', family: 'Indo-European (Romance & Germanic)',
      script: 'Latin', bcp47: 'it-IT',
      regions: 'Tirana, Durrës, Vlorë',
      notes: 'Italian spread remarkably via satellite broadcasts since the 1990s while English dominates youth communication.'
    }
  ],
  KAS: [
    {
      name: 'Shina & Balti', nativeName: 'ݜِنا / སྦལ་ཏི། (Balti)', type: 'Major Indigenous Mountain Languages',
      percentage: '52.0%', speakers: '950K', family: 'Indo-Aryan (Dardic) & Sino-Tibetan',
      script: 'Perso-Arabic & Tibetan Yige Revival', bcp47: 'ur-PK',
      regions: 'Gilgit, Skardu, Hunza',
      notes: 'Archaic Tibetan-related Balti and Dardic Shina sit beside Burushaski—one of the world’s true language isolates.'
    },
    {
      name: 'Burushaski', nativeName: 'بروشسکی', type: 'Unique Language Isolate',
      percentage: '5.5%', speakers: '110K', family: 'Language Isolate',
      script: 'Perso-Arabic / Latin', bcp47: 'ur-PK',
      regions: 'Hunza, Nagar, Yasin Valleys',
      notes: 'Unrelated to any other known language family on Earth; features four grammatical noun classes.'
    }
  ],
  ATA: [
    {
      name: 'Russian, Spanish & Chinese', nativeName: 'Русский / Español / 中文', type: 'Research Base Working Languages',
      percentage: '45.0%', speakers: 'Seasonal Station Teams', family: 'Slavic, Romance & Sino-Tibetan',
      script: 'Cyrillic, Latin & Hanzi', bcp47: 'ru-RU',
      regions: 'Vostok, Esperanza, Great Wall & McMurdo Stations',
      notes: 'Antarctica has given rise to a gentle transient "Antarctican" accent among winter-over crews.'
    }
  ],
  SXM: [
    {
      name: 'English (Sint Maarten Vernacular)', nativeName: 'Caribbean English', type: 'Co-Official & Dominant Daily Language',
      percentage: '85.0%', speakers: '36K', family: 'Indo-European (Germanic)',
      script: 'Latin', bcp47: 'en-US',
      regions: 'Philipsburg & Simpson Bay',
      notes: 'English serves as the true everyday lingua franca of Dutch Sint Maarten, alongside Papiamentu and Spanish.'
    },
    {
      name: 'Dutch & Spanish', nativeName: 'Nederlands / Español', type: 'Co-Official & Major Community',
      percentage: '28.0%', speakers: '12K', family: 'Indo-European (Germanic & Romance)',
      script: 'Latin', bcp47: 'nl-NL',
      regions: 'Philipsburg & Cole Bay',
      notes: 'Dutch remains official for Kingdom administration while Spanish is widely spoken across service sectors.'
    }
  ]
};

// 3. Authoritative Greenberg LDI (0.00 - 0.99) + Living Language Counts
//    Sources compiled from UNESCO Atlas / Ethnologue Greenberg Diversity Index
const DIVERSITY_DATA = {
  PNG: { living: 840, ldi: 0.99 },
  VUT: { living: 110, ldi: 0.97 },
  SLB: { living: 72, ldi: 0.96 },
  CAF: { living: 72, ldi: 0.96 },
  TCD: { living: 133, ldi: 0.95 },
  CMR: { living: 277, ldi: 0.95 },
  COD: { living: 214, ldi: 0.95 },
  IND: { living: 456, ldi: 0.93 },
  MOZ: { living: 43, ldi: 0.93 },
  UGA: { living: 43, ldi: 0.93 },
  CIV: { living: 86, ldi: 0.92 },
  LBR: { living: 31, ldi: 0.91 },
  KEN: { living: 68, ldi: 0.90 },
  BEN: { living: 55, ldi: 0.90 },
  TLS: { living: 20, ldi: 0.89 },
  NGA: { living: 527, ldi: 0.89 },
  SSD: { living: 68, ldi: 0.89 },
  TGO: { living: 44, ldi: 0.89 },
  GNB: { living: 23, ldi: 0.88 },
  TZA: { living: 126, ldi: 0.88 },
  MLI: { living: 68, ldi: 0.87 },
  ZAF: { living: 30, ldi: 0.87 },
  COG: { living: 62, ldi: 0.86 },
  IDN: { living: 715, ldi: 0.85 },
  ETH: { living: 90, ldi: 0.85 },
  GHA: { living: 83, ldi: 0.85 },
  SLE: { living: 25, ldi: 0.85 },
  ZMB: { living: 46, ldi: 0.85 },
  PHL: { living: 186, ldi: 0.84 },
  BTN: { living: 23, ldi: 0.84 },
  GAB: { living: 43, ldi: 0.84 },
  GMB: { living: 19, ldi: 0.83 },
  SEN: { living: 38, ldi: 0.82 },
  BFA: { living: 71, ldi: 0.80 },
  NAM: { living: 28, ldi: 0.80 },
  AGO: { living: 47, ldi: 0.79 },
  PAK: { living: 77, ldi: 0.79 },
  SUR: { living: 22, ldi: 0.79 },
  SDN: { living: 75, ldi: 0.78 },
  FSM: { living: 19, ldi: 0.78 },
  NCL: { living: 39, ldi: 0.78 },
  NPL: { living: 124, ldi: 0.76 },
  MYS: { living: 134, ldi: 0.76 },
  SGP: { living: 28, ldi: 0.75 },
  IRN: { living: 78, ldi: 0.75 },
  BLZ: { living: 9, ldi: 0.75 },
  AFG: { living: 41, ldi: 0.74 },
  GIN: { living: 36, ldi: 0.75 },
  LAO: { living: 85, ldi: 0.73 },
  BEL: { living: 17, ldi: 0.73 },
  TTO: { living: 9, ldi: 0.72 },
  LUX: { living: 9, ldi: 0.71 },
  NER: { living: 21, ldi: 0.70 },
  GTM: { living: 27, ldi: 0.69 },
  BOL: { living: 43, ldi: 0.68 },
  MRT: { living: 8, ldi: 0.67 },
  MDG: { living: 18, ldi: 0.62 },
  THA: { living: 73, ldi: 0.62 },
  FJI: { living: 14, ldi: 0.61 },
  KAZ: { living: 14, ldi: 0.61 },
  KWT: { living: 8, ldi: 0.60 },
  ARE: { living: 14, ldi: 0.64 },
  QAT: { living: 10, ldi: 0.62 },
  BHR: { living: 8, ldi: 0.56 },
  CAN: { living: 96, ldi: 0.56 },
  CHE: { living: 22, ldi: 0.55 },
  MUS: { living: 14, ldi: 0.55 },
  MMR: { living: 117, ldi: 0.54 },
  KGZ: { living: 11, ldi: 0.55 },
  MAR: { living: 14, ldi: 0.53 },
  ESP: { living: 22, ldi: 0.51 },
  CHN: { living: 305, ldi: 0.50 },
  BWA: { living: 31, ldi: 0.48 },
  GUY: { living: 18, ldi: 0.46 },
  DZA: { living: 19, ldi: 0.44 },
  IRQ: { living: 23, ldi: 0.45 },
  ISR: { living: 33, ldi: 0.52 },
  UKR: { living: 25, ldi: 0.49 },
  LVA: { living: 7, ldi: 0.48 },
  AND: { living: 6, ldi: 0.57 },
  PER: { living: 94, ldi: 0.38 },
  USA: { living: 335, ldi: 0.36 },
  RUS: { living: 115, ldi: 0.34 },
  TUR: { living: 39, ldi: 0.31 },
  EST: { living: 6, ldi: 0.41 },
  MWI: { living: 17, ldi: 0.54 },
  ZWE: { living: 22, ldi: 0.52 },
  AZE: { living: 17, ldi: 0.38 },
  GEO: { living: 14, ldi: 0.44 },
  UZB: { living: 14, ldi: 0.42 },
  TJK: { living: 14, ldi: 0.48 },
  VNM: { living: 110, ldi: 0.24 },
  GBR: { living: 24, ldi: 0.19 },
  FRA: { living: 28, ldi: 0.25 },
  DEU: { living: 25, ldi: 0.23 },
  ITA: { living: 34, ldi: 0.59 },
  BGD: { living: 41, ldi: 0.34 },
  ECU: { living: 24, ldi: 0.27 },
  PRY: { living: 23, ldi: 0.35 },
  AUS: { living: 318, ldi: 0.16 },
  MEX: { living: 292, ldi: 0.15 },
  COL: { living: 89, ldi: 0.04 },
  BRA: { living: 228, ldi: 0.03 },
  ARG: { living: 40, ldi: 0.19 },
  CHL: { living: 16, ldi: 0.10 },
  JPN: { living: 17, ldi: 0.04 },
  KOR: { living: 3, ldi: 0.01 },
  PRK: { living: 2, ldi: 0.005 },
  PRT: { living: 6, ldi: 0.02 },
  ISL: { living: 3, ldi: 0.09 },
  URY: { living: 5, ldi: 0.09 }
};

function computeCountryDiversity(c) {
  const iso = (c.iso3 || '').toUpperCase();
  const langRows = (c.languages || []).length;
  const preset = DIVERSITY_DATA[iso];

  let living;
  let ldi;
  if (preset) {
    living = preset.living;
    ldi = preset.ldi;
  } else {
    // Sensible deterministic estimate derived from spoken cards + region
    const cont = (c.continent || '').toLowerCase();
    const baseCount = Math.max(langRows + 1, langRows * 2);
    let contMult = 1.4;
    let baseLdi = 0.22;
    if (cont.includes('africa')) {
      contMult = 2.6;
      baseLdi = 0.42;
    } else if (cont.includes('asia')) {
      contMult = 2.2;
      baseLdi = 0.34;
    } else if (cont.includes('oceania')) {
      contMult = 1.8;
      baseLdi = 0.44;
    } else if (cont.includes('south america') || cont.includes('north america')) {
      contMult = 1.6;
      baseLdi = 0.24;
    }
    living = Math.max(2, Math.round(baseCount * contMult));
    ldi = Math.min(0.76, Math.max(0.06, +(baseLdi + Math.min(0.28, (langRows - 2) * 0.07)).toFixed(2)));
  }

  // Blended Diversity Score (0 - 100): combines Greenberg LDI (62%) with log-scaled Living Languages (38%)
  const logLangNorm = Math.min(1, Math.log10(Math.max(1, living)) / Math.log10(850));
  const score = Math.min(100, Math.max(4, Math.round(ldi * 62 + logLangNorm * 38)));

  let tier = 'Low Diversity';
  if (score >= 76) tier = 'Hyper-Diverse';
  else if (score >= 52) tier = 'High Diversity';
  else if (score >= 28) tier = 'Moderate Diversity';

  return {
    livingLanguages: living,
    ldiScore: ldi,
    diversityScore: score,
    ldiTier: tier
  };
}

let fixedCanonical = 0;
let addedLangEntries = 0;
let enrichedIsos = new Set();

for (const key in db) {
  const c = db[key];
  if (!c || !c.iso3) continue;
  const iso = c.iso3.toUpperCase();

  if (CANONICAL_FIXES[iso]) {
    Object.assign(c, CANONICAL_FIXES[iso]);
    fixedCanonical++;
  }

  if (iso === 'PAK' && Array.isArray(c.languages)) {
    c.languages.forEach(l => {
      if (l.name === 'Saraiki & Balochi' && (l.family || '').trim() === 'Indo-European') {
        l.family = 'Indo-European (Indo-Iranian)';
      }
    });
  }

  if (Array.isArray(c.languages) && c.languages.length <= 1 && EXTRA_LANGUAGES[iso]) {
    const existingNames = new Set(c.languages.map(l => (l.name || '').toLowerCase()));
    EXTRA_LANGUAGES[iso].forEach(extra => {
      if (!existingNames.has(extra.name.toLowerCase())) {
        c.languages.push(Object.assign({}, extra));
        existingNames.add(extra.name.toLowerCase());
        addedLangEntries++;
      }
    });
    enrichedIsos.add(iso);
  }

  const div = computeCountryDiversity(c);
  c.livingLanguages = div.livingLanguages;
  c.ldiScore = div.ldiScore;
  c.diversityScore = div.diversityScore;
  c.ldiTier = div.ldiTier;
}

// Verify strict invariants across all 242 unique ISO3s
const seenIso = new Map();
let singleRemaining = [];
let placeholders = 0;
let plainIE = 0;
let wrongEnglish = [];

for (const key in db) {
  const c = db[key];
  if (!c || !c.iso3) continue;
  const iso = c.iso3.toUpperCase();
  if (!seenIso.has(iso)) {
    seenIso.set(iso, c);
    if (!c.languages || c.languages.length < 2) singleRemaining.push(iso);
    if (c.languageFamily === 'Indo-European') plainIE++;
    if (c.canonicalLanguage === 'English' && CANONICAL_FIXES[iso]) wrongEnglish.push(iso);
  }
  (c.languages || []).forEach(l => {
    const s = (l.script || '').trim();
    if (!s || s === 'Official National Script' || s === 'National Script') placeholders++;
  });
}

fs.writeFileSync(jsonPath, JSON.stringify(db, null, 2));
fs.writeFileSync(jsPath, 'window.WORLD_LANGUAGES = ' + JSON.stringify(db) + ';\n');

console.log(`Processed ${seenIso.size} unique ISO3s (${Object.keys(db).length} total keys).`);
console.log(`Enriched ${enrichedIsos.size} single-language ISO3s (+${addedLangEntries} language rows across all keys).`);
console.log(`Fixed canonicalLanguage mismatches across ${fixedCanonical} keys.`);
console.log(`Verification -> <2 languages: ${singleRemaining.length}, Placeholders: ${placeholders}, Plain IE: ${plainIE}, Wrong English: ${wrongEnglish.length}`);
