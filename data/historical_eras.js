// data/historical_eras.js - Endangered Language Pin Hotspots & Historical Time-Scrubber Linguistic Atlas
(function (global) {
  'use strict';

  const ENDANGERED_HOTSPOTS = [
    {
      id: 'end_ainu', name: 'Ainu', endonym: 'Aynu itak (アイヌ イタㇰ)', iso3: 'JPN', countryName: 'Japan (Hokkaido)',
      lat: 43.2, lng: 142.8, status: 'Critically Endangered', color: '#ef4444', speakers: '~300 learners / handful fluent',
      family: 'Language Isolate', samplePhrase: 'Irankarapte!', phonetic: 'ee-rahn-kah-RAHP-teh',
      revitalizationNote: 'Featured in Hokkaidō radio lessons, Upopoy museum, and anime/manga Golden Kamuy.'
    },
    {
      id: 'end_ryukyuan', name: 'Okinawan (Uchinaaguchi)', endonym: 'うちなーぐち', iso3: 'JPN', countryName: 'Japan (Okinawa)',
      lat: 26.3, lng: 127.8, status: 'Definitely Endangered', color: '#f59e0b', speakers: '~100K (mostly elders)',
      family: 'Japonic (Ryukyuan)', samplePhrase: 'Haisai / Mensōre!', phonetic: 'HYE-sye / men-SOH-reh',
      revitalizationNote: 'Six Ryukyuan sister tongues share ancestors with Japanese from over 1,500 years ago.'
    },
    {
      id: 'end_jejueo', name: 'Jejueo (Jeju Language)', endonym: '제주어', iso3: 'KOR', countryName: 'South Korea (Jeju Island)',
      lat: 33.4, lng: 126.5, status: 'Critically Endangered', color: '#ef4444', speakers: '~5,000 elders',
      family: 'Koreanic', samplePhrase: 'Honjeo opseoye!', phonetic: 'hohn-juh ohp-suh-yeh',
      revitalizationNote: 'Preserves vowel sounds lost on the Korean mainland centuries ago.'
    },
    {
      id: 'end_nawat', name: 'Nawat (Pipil)', endonym: 'Nawat', iso3: 'SLV', countryName: 'El Salvador',
      lat: 13.7, lng: -89.7, status: 'Critically Endangered', color: '#ef4444', speakers: '~200 fluent elders',
      family: 'Uto-Aztecan', samplePhrase: 'Yek tunal!', phonetic: 'yek too-NAHL',
      revitalizationNote: 'Grandmother-led Tzunhejekat language nests in Santo Domingo de Guzmán actively pass Nawat to toddlers.'
    },
    {
      id: 'end_navajo', name: 'Navajo (Diné Bizaad)', endonym: 'Diné Bizaad', iso3: 'USA', countryName: 'United States (Southwest)',
      lat: 36.1, lng: -109.4, status: 'Vulnerable', color: '#f59e0b', speakers: '~170,000',
      family: 'Na-Dene (Athabaskan)', samplePhrase: 'Yá’át’ééh!', phonetic: 'yah-ah-TAY',
      revitalizationNote: 'Famous WWII Code Talkers’ language; today boasts immersion schools, Duolingo courses, and dubbed cinema.'
    },
    {
      id: 'end_cherokee', name: 'Cherokee', endonym: 'ᏣᎳᎩ ᎦᏬᏂᎯᏍᏗ (Tsalagi)', iso3: 'USA', countryName: 'United States (Oklahoma / NC)',
      lat: 35.9, lng: -94.9, status: 'Definitely Endangered', color: '#f59e0b', speakers: '~1,500 L1 speakers',
      family: 'Iroquoian', samplePhrase: 'ᎣᏏᏲ (Osiyo!)', phonetic: 'oh-SEE-yoh',
      revitalizationNote: 'Uses Sequoyah’s ingenious 1821 syllabary (ᏣᎳᎩ), now preloaded cleanly across smartphones and street signs.'
    },
    {
      id: 'end_haida', name: 'Haida (Xaat Kíl)', endonym: 'X̱aat Kíl', iso3: 'CAN', countryName: 'Canada (Haida Gwaii)',
      lat: 53.0, lng: -132.1, status: 'Critically Endangered', color: '#ef4444', speakers: '< 30 fluent / growing learners',
      family: 'Language Isolate', samplePhrase: 'Hawa’a!', phonetic: 'hah-WAH-ah (Thank you)',
      revitalizationNote: 'Unique North Pacific coast isolate revived through elder-apprentice immersion and Haida Nation feature films.'
    },
    {
      id: 'end_inuktitut', name: 'Inuktitut', endonym: 'ᐃᓄᒃᑎᑐᑦ', iso3: 'CAN', countryName: 'Canada (Nunavut / Arctic)',
      lat: 65.5, lng: -80.0, status: 'Vulnerable', color: '#f59e0b', speakers: '~40,000',
      family: 'Eskimo-Aleut', samplePhrase: 'ᐋᐃ! (Ai!) / ᖁᔭᓐᓇᒦᒃ (Qujannamiik)', phonetic: 'aye / koo-yah-nah-meek',
      revitalizationNote: 'Official government language of Nunavut written in rotating geometric Canadian Aboriginal Syllabics.'
    },
    {
      id: 'end_ayapaneco', name: 'Ayapaneco (Nuumte Oote)', endonym: 'Nuumte Oote', iso3: 'MEX', countryName: 'Mexico (Tabasco)',
      lat: 18.2, lng: -93.1, status: 'Critically Endangered', color: '#ef4444', speakers: '< 15 elders + youth learners',
      family: 'Mixe-Zoquean', samplePhrase: 'Júú!', phonetic: 'hoo (Yes / Hello)',
      revitalizationNote: 'Sparked global attention when its last two elderly native speakers reconciled to compile a heritage dictionary.'
    },
    {
      id: 'end_yaghan', name: 'Yagán / Kawésqar heritage', endonym: 'Yagán kuta', iso3: 'CHL', countryName: 'Chile (Tierra del Fuego)',
      lat: -54.9, lng: -67.6, status: 'Dormant / Archival Revival', color: '#ef4444', speakers: 'Revitalization learners',
      family: 'Language Isolate', samplePhrase: 'Mamihlapinatapai', phonetic: 'lit. “shared silent longing glance”',
      revitalizationNote: 'The world’s southernmost indigenous language; celebrated poetically for precise kinship and ocean terms.'
    },
    {
      id: 'end_garifuna', name: 'Garifuna', endonym: 'Garífuna', iso3: 'BLZ', countryName: 'Belize / Honduras / Guatemala Coast',
      lat: 16.9, lng: -88.2, status: 'Definitely Endangered', color: '#f59e0b', speakers: '~100,000',
      family: 'Arawakan (Maipurean)', samplePhrase: 'Buiti binafi!', phonetic: 'Bwee-tee bee-nah-fee (Good morning)',
      revitalizationNote: 'Proclaimed UNESCO Intangible Heritage: uniquely blends Arawak, Island Carib, French, English, and West African forms.'
    },
    {
      id: 'end_basque', name: 'Basque (Euskara)', endonym: 'Euskara', iso3: 'ESP', countryName: 'Spain & France (Basque Country)',
      lat: 43.1, lng: -2.5, status: 'Vulnerable (Thriving Revival)', color: '#f59e0b', speakers: '~850,000',
      family: 'Pre-Indo-European Isolate', samplePhrase: 'Kaixo! / Eskerrik asko', phonetic: 'KYE-shoh / es-keh-reek AHS-koh',
      revitalizationNote: 'Europe’s sole surviving pre-Indo-European language; a gold standard of Ikastola bilingual schooling success.'
    },
    {
      id: 'end_sami', name: 'Northern & Skolt Sámi', endonym: 'Davvisámegiella', iso3: 'NOR', countryName: 'Norway / Sweden / Finland (Sápmi)',
      lat: 69.0, lng: 23.0, status: 'Definitely to Critically Endangered', color: '#f97316', speakers: '~25,000',
      family: 'Uralic (Sámi)', samplePhrase: 'Bures! / Giitu', phonetic: 'BOO-res / GEE-too',
      revitalizationNote: 'Supported by Sámi Parliament broadcasting, reindeer-herding lexicons, and Sámi pop & cinema.'
    },
    {
      id: 'end_livonian', name: 'Livonian', endonym: 'Līvõ kēļ', iso3: 'LVA', countryName: 'Latvia (Kurzeme Coast)',
      lat: 57.6, lng: 22.3, status: 'Critically Endangered (Revival)', color: '#ef4444', speakers: '~25–40 L2 fluent',
      family: 'Uralic (Finnic)', samplePhrase: 'Tēriņtš!', phonetic: 'TEH-reench',
      revitalizationNote: 'Coastal Latvia’s indigenous Finnic tongue, preserved by the Livonian Institute and annual cultural festivals.'
    },
    {
      id: 'end_sardinian', name: 'Sardinian & Corsican', endonym: 'Sardu / Corsu', iso3: 'ITA', countryName: 'Italy (Sardinia)',
      lat: 40.0, lng: 9.0, status: 'Definitely Endangered', color: '#f59e0b', speakers: '~1.0M',
      family: 'Indo-European (Southern Romance)', samplePhrase: 'Bona die! / Gràtzias', phonetic: 'BOH-nah DEE-eh',
      revitalizationNote: 'Most phonologically conservative Romance language — preserves classical Latin hard /k/ in words like *chentu* (kentum).'
    },
    {
      id: 'end_irish', name: 'Irish & Scottish Gaelic', endonym: 'Gaeilge / Gàidhlig', iso3: 'IRL', countryName: 'Ireland & Scotland',
      lat: 53.3, lng: -9.5, status: 'Definitely Endangered', color: '#f59e0b', speakers: '~75K daily / 1.8M total',
      family: 'Indo-European (Celtic)', samplePhrase: 'Dia duit! / Go raibh maith agat', phonetic: 'DEE-uh gwitch',
      revitalizationNote: 'Verb-Subject-Object order + lyrical initial consonant mutations thrived across Atlantic Gaeltacht communities.'
    },
    {
      id: 'end_manx', name: 'Manx Gaelic', endonym: 'Gaelg', iso3: 'IMN', countryName: 'Isle of Man',
      lat: 54.2, lng: -4.5, status: 'Critically Endangered (Revival)', color: '#f97316', speakers: '~2,200 speakers/learners',
      family: 'Indo-European (Celtic)', samplePhrase: 'Moghrey mie!', phonetic: 'MAH-ree mye (Good morning)',
      revitalizationNote: 'After the death of the last native speaker Ned Maddrell in 1974, immersion schools have raised a thriving new generation!'
    },
    {
      id: 'end_manchu', name: 'Xibe & Manchu', endonym: 'ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ (Manju gisun)', iso3: 'CHN', countryName: 'China (Heilongjiang & Ili Xibe)',
      lat: 46.5, lng: 126.5, status: 'Critically Endangered', color: '#ef4444', speakers: '~20K Xibe / <20 Manchu L1',
      family: 'Tungusic', samplePhrase: 'Saiyun!', phonetic: 'sye-YOON',
      revitalizationNote: 'Written vertically in sweeping Mongol-derived script; closely preserved by Xibe garrison descendants in Xinjiang.'
    },
    {
      id: 'end_nubian', name: 'Nobiin (Nile Nubian)', endonym: 'Νοβίιν / نوبين', iso3: 'SDN', countryName: 'Sudan & Southern Egypt',
      lat: 21.8, lng: 31.3, status: 'Definitely Endangered', color: '#f59e0b', speakers: '~600,000',
      family: 'Nilo-Saharan (Eastern Sudanic)', samplePhrase: 'Maskagna!', phonetic: 'mahs-KAHG-nah (Are you well?)',
      revitalizationNote: 'Heirs to ancient Christian Nubia’s Old Nubian script, preserving pre-Arabic Nile Valley history.'
    },
    {
      id: 'end_nluu', name: 'N|uu (San Click Heritage)', endonym: 'Nǁng (Click Language)', iso3: 'ZAF', countryName: 'South Africa (Kalahari Fringe)',
      lat: -28.4, lng: 21.2, status: 'Critically Endangered', color: '#ef4444', speakers: '1 remaining L1 elder + learners',
      family: 'Tuu (Khoisan Click Family)', samplePhrase: 'Ouma Katrina Esau School', phonetic: '45 click consonants!',
      revitalizationNote: 'Ouma Katrina Esau works tirelessly teaching children N|uu’s astonishing 45 click sounds in Upington.'
    },
    {
      id: 'end_hadza', name: 'Hadza', endonym: 'Hadzane', iso3: 'TZA', countryName: 'Tanzania (Lake Eyasi)',
      lat: -3.6, lng: 35.1, status: 'Definitely Endangered', color: '#f97316', speakers: '~1,000',
      family: 'Language Isolate (Click Language)', samplePhrase: 'Mutana!', phonetic: 'moo-TAH-nah',
      revitalizationNote: 'Independent click language isolate spoken by Lake Eyasi hunter-gatherers; unrelated even to neighbors Sandawe.'
    },
    {
      id: 'end_western_neoaramaic', name: 'Western Neo-Aramaic', endonym: 'ܠܫܢܐ ܐܪܡܝܐ (Siryon)', iso3: 'SYR', countryName: 'Syria (Maaloula)',
      lat: 33.8, lng: 36.5, status: 'Severely Endangered', color: '#f97316', speakers: '~15,000',
      family: 'Afroasiatic (Semitic)', samplePhrase: 'Shlōmo!', phonetic: 'shloh-MOH',
      revitalizationNote: 'Spoken across Maaloula cliff villages, preserving the closest living speech to ancient 1st-century Palestinian Aramaic.'
    },
    {
      id: 'end_soqotri', name: 'Soqotri', endonym: 'سقطرية (Méthel d-Saqátri)', iso3: 'YEM', countryName: 'Yemen (Socotra Island)',
      lat: 12.5, lng: 53.9, status: 'Definitely Endangered', color: '#f59e0b', speakers: '~70,000',
      family: 'Afroasiatic (Modern South Arabian)', samplePhrase: 'Kefah?', phonetic: 'keh-FAH (How are you?)',
      revitalizationNote: 'Pre-Islamic Semitic sister language preserved alongside the island’s famous Dragon’s Blood trees.'
    },
    {
      id: 'end_kumzari', name: 'Kumzari', endonym: 'كُمزاري', iso3: 'OMN', countryName: 'Oman (Musandam Strait)',
      lat: 26.3, lng: 56.4, status: 'Severely Endangered', color: '#f97316', speakers: '~4,000',
      family: 'Indo-Iranian (Southwestern Iranian)', samplePhrase: 'Khosh amadi!', phonetic: 'Hybrid Persian–Arabic grammar',
      revitalizationNote: 'Sole Iranian language indigenous to the Arabian Peninsula, blending Southwestern Iranian & Gulf Arabic structure!'
    },
    {
      id: 'end_burushaski', name: 'Burushaski', endonym: 'بروشسکی', iso3: 'PAK', countryName: 'Hunza Valley (Karakoram)',
      lat: 36.3, lng: 74.6, status: 'Vulnerable', color: '#f59e0b', speakers: '~110,000',
      family: 'Language Isolate', samplePhrase: 'Jū! (Welcome / Greetings)', phonetic: 'joo',
      revitalizationNote: 'Famed Karakoram isolate unrelated to surrounding Indo-Aryan, Iranian, Turkic, or Tibetan tongues.'
    },
    {
      id: 'end_great_andamanese', name: 'Great Andamanese & Sentinelese', endonym: 'Jero / Aka-Bo', iso3: 'IND', countryName: 'India (Andaman Islands)',
      lat: 12.5, lng: 92.8, status: 'Critically Endangered', color: '#ef4444', speakers: '< 50 Great Andamanese / Uncontacted',
      family: 'Andamanese', samplePhrase: 'Bo / Jarawa / Onge', phonetic: 'Body-part noun classes!',
      revitalizationNote: 'Great Andamanese uniquely structures almost all verbs and adjectives using prefix classes mapped to parts of the human body!'
    },
    {
      id: 'end_pitjantjatjara', name: 'Pitjantjatjara & Arrernte', endonym: 'Pitjantjatjara', iso3: 'AUS', countryName: 'Australia (Central Desert)',
      lat: -25.3, lng: 131.0, status: 'Definitely Endangered', color: '#f59e0b', speakers: '~3,500 each',
      family: 'Pama-Nyungan', samplePhrase: 'Palya!', phonetic: 'PAHL-yah (Good / Hello / Thank you!)',
      revitalizationNote: 'Among the strongest First Nations languages in Australia’s Uluru / Red Centre, heard in everyday life and music.'
    },
    {
      id: 'end_guugu_yimithirr', name: 'Guugu Yimithirr', endonym: 'Guugu Yimithirr', iso3: 'AUS', countryName: 'Australia (Cape York / Cooktown)',
      lat: -15.5, lng: 145.1, status: 'Severely Endangered', color: '#f97316', speakers: '~750',
      family: 'Pama-Nyungan', samplePhrase: 'Gangarru (“Kangaroo”!)', phonetic: 'Absolute compass navigation!',
      revitalizationNote: 'Gave English the word “kangaroo” in 1770 AND lacks words for “left/right” — speakers navigate purely by cardinal North/East/South/West!'
    },
    {
      id: 'end_te_reo', name: 'Te Reo Māori', endonym: 'Te Reo Māori', iso3: 'NZL', countryName: 'New Zealand (Aotearoa)',
      lat: -38.1, lng: 176.2, status: 'Vulnerable (Global Model)', color: '#f59e0b', speakers: '~185,000',
      family: 'Austronesian (Polynesian)', samplePhrase: 'Kia ora!', phonetic: 'kee-ah OH-rah',
      revitalizationNote: 'Inventor of the “Language Nest” (Kōhanga Reo) movement that inspired indigenous revivals around the world!'
    },
    {
      id: 'end_olelo_hawaii', name: 'Hawaiian (ʻŌlelo Hawaiʻi)', endonym: 'ʻŌlelo Hawaiʻi', iso3: 'USA', countryName: 'United States (Hawaiʻi)',
      lat: 20.8, lng: -156.3, status: 'Critically to Severely Endangered (Revival)', color: '#f97316', speakers: '~24,000',
      family: 'Austronesian (Polynesian)', samplePhrase: 'Aloha! / Mahalo', phonetic: 'ah-LOH-hah / mah-HAH-loh',
      revitalizationNote: 'After plunging under 50 child speakers in the 1980s, Pūnana Leo immersion restored thriving Hawaiian-speaking youth.'
    },
    {
      id: 'end_araki', name: 'Araki & Torres Languages', endonym: 'Misi', iso3: 'VUT', countryName: 'Vanuatu (World’s Highest Language Density)',
      lat: -15.6, lng: 166.9, status: 'Critically Endangered', color: '#ef4444', speakers: '< 10 elders (Araki)',
      family: 'Austronesian (Oceanic)', samplePhrase: '110 languages on 83 islands!', phonetic: 'Highest languages-per-capita on Earth',
      revitalizationNote: 'Vanuatu packs over 110 distinct Oceanic tongues across ~320,000 people — many spoken in just a single coastal village.'
    },
    {
      id: 'end_yimas_png', name: 'Yimas & Papuan Diversity Corridor', endonym: 'Yimas / Tok Pisin', iso3: 'PNG', countryName: 'Papua New Guinea (Sepik Basin)',
      lat: -4.2, lng: 143.5, status: 'Hyper-Diverse Hotspot (840 Languages)', color: '#ef4444', speakers: '~300 Yimas / 840 total tongues',
      family: 'Lower Sepik-Ramu & Trans-New Guinea', samplePhrase: '12% of ALL world languages live here!', phonetic: 'Polysynthetic mountain valleys',
      revitalizationNote: 'Papua New Guinea harbors ~840 living languages across dozens of completely unrelated Papuan families.'
    },
    {
      id: 'end_nivkh', name: 'Nivkh (Gilyak)', endonym: 'Нивхгу диф (Nivxgu dif)', iso3: 'RUS', countryName: 'Russia (Sakhalin & Amur Mouth)',
      lat: 52.8, lng: 141.9, status: 'Critically Endangered', color: '#ef4444', speakers: '< 200 fluent elders',
      family: 'Language Isolate', samplePhrase: '26 distinct counting classifier sets!', phonetic: 'Sleds vs boats vs fish counted differently',
      revitalizationNote: 'Paleosiberian isolate with 26 completely different number-word series depending on what object you are counting!'
    },
    {
      id: 'end_ket', name: 'Ket (Yeniseian Survivor)', endonym: 'Остыганна каʼ (Ostygan)', iso3: 'RUS', countryName: 'Russia (Central Siberia Yenisei)',
      lat: 63.0, lng: 88.0, status: 'Critically Endangered', color: '#ef4444', speakers: '< 60 elders',
      family: 'Yeniseian (Related to Na-Dene!)', samplePhrase: 'Asia–Alaska Dene–Yeniseian link!', phonetic: 'Tonal Yeniseian relic',
      revitalizationNote: 'Last living Siberian Yeniseian tongue — linguists demonstrated its distant link across the Bering Strait to Navajo & Athabaskan!'
    },
    {
      id: 'end_guarani_mbya', name: 'Mbyá & Ache Guaraní', endonym: 'Avañe’ẽ', iso3: 'PRY', countryName: 'Paraguay / Tri-Border Forest',
      lat: -25.4, lng: -55.8, status: 'Vulnerable (Paraguayan Guaraní Thrives)', color: '#f59e0b', speakers: '~30K Mbyá / 6.5M Paraguayan',
      family: 'Tupian', samplePhrase: 'Mba’éichapa! / Aguyje', phonetic: 'mbah-AY-shah-pah',
      revitalizationNote: 'Paraguay proves an indigenous language can stand co-official with Spanish nationwide — while smaller forest sister tongues need protection.'
    }
  ];

  // Historical Time-Scrubber Eras ("Languages Before 1492" Mode)
  const ERAS = [
    {
      id: '2000bce',
      yearLabel: 'c. 2000 BCE',
      shortLabel: '2000 BCE',
      maxYearCE: -1500,
      headline: 'Bronze Age Homelands: Indus–Dravidian, Shang Sinitic, Yamnaya Dispersal & Pre-Austronesian Seas',
      description: 'Indo-European dialects split across Eurasia; Old Kingdom Egyptian & Akkadian flourish; Americas & Australia thrive purely with indigenous families while Remote Polynesia remains uninhabited.',
      legend: [
        { label: 'Indo-European Dialects (Celtic/Italic/Indo-Aryan)', color: '#f59e0b' },
        { label: 'Ancient Afroasiatic (Egyptian / Akkadian / Cushitic)', color: '#eab308' },
        { label: 'Old Sinitic (Shang) & Sino-Tibetan', color: '#dc2626' },
        { label: 'Dravidian / Indus Horizon', color: '#fb7185' },
        { label: 'Indigenous Americas / Bantu Homeland / Australia', color: '#22c55e' },
        { label: 'Unsettled / Open Ocean Frontier', color: '#334155' }
      ]
    },
    {
      id: '100ce',
      yearLabel: '100 CE',
      shortLabel: '100 CE',
      maxYearCE: 150,
      headline: 'Classical Antiquity: Latin Mediterranean, Koine Greek, Han Chinese, Sanskrit/Prakrit & Aksum',
      description: 'Vulgar Latin blankets Western Europe; Koine Greek links the Eastern Mediterranean; Classic Maya & Zapotec write in Mesoamerica; Early Bantu agriculturalists cross Central–East Africa.',
      legend: [
        { label: 'Roman Latin Sphere', color: '#e879f9' },
        { label: 'Hellenistic / Koine Greek', color: '#2563eb' },
        { label: 'Han Sinitic Empire', color: '#dc2626' },
        { label: 'Prakrit / Sanskrit & Old Tamil', color: '#f59e0b' },
        { label: 'Iranian (Parthian) & Aramaic/Semitic', color: '#0d9488' },
        { label: 'Pre-Colonial Indigenous Spheres', color: '#16a34a' }
      ]
    },
    {
      id: '1000ce',
      yearLabel: '1000 CE',
      shortLabel: '1000 CE',
      maxYearCE: 1050,
      headline: 'Medieval Worlds: Classical Arabic, Old Norse Vinland/Greenland, Kyivan Rus’ & Khmer/Song Golden Ages',
      description: 'Arabic links Iberia to Central Asia; Vikings speak Old Norse across Iceland & Greenland; Old Church Slavonic & Old East Slavic unite Eastern Europe; Polynesians settle Aotearoa/Hawaii.',
      legend: [
        { label: 'Classical Arabic / Islamic Golden Age', color: '#eab308' },
        { label: 'Romance / Medieval Latin / Germanic', color: '#38bdf8' },
        { label: 'Slavic (Rus’ / Old Bulgarian) & Byzantine Greek', color: '#4f46e5' },
        { label: 'Turkic Steppe & Iranian Khorasan', color: '#9333ea' },
        { label: 'Song Sinitic, Heian Japanese & Khmer/Indic', color: '#ec4899' },
        { label: 'Indigenous Americas, Bantu & Polynesian', color: '#16a34a' }
      ]
    },
    {
      id: '1492ce',
      yearLabel: '1492 CE',
      shortLabel: 'Before 1492',
      maxYearCE: 1491,
      headline: 'Eve of Global Contact (Pre-1492): Pure Indigenous Continents Prior to Colonial Spread',
      description: 'Nahuatl, Maya, Quechua (Tawantinsuyu), Guaraní, Algonquian & Inuit fill the Americas; 250+ Pama-Nyungan & non-Pama-Nyungan families cover Australia; Swahili city-states flourish beside Songhai & Ming.',
      legend: [
        { label: 'Indigenous Americas (Nahuatl / Quechua / Algonquian)', color: '#10b981' },
        { label: 'Aboriginal Australia & Aotearoa Māori', color: '#14b8a6' },
        { label: 'European Vernaculars (No Overseas Empires Yet!)', color: '#3b82f6' },
        { label: 'Ottoman, Arabic, Persian & Mughal Spheres', color: '#f59e0b' },
        { label: 'Ming China, Chosŏn Korea, Muromachi Japan', color: '#ec4899' },
        { label: 'African Kingdoms (Swahili / Songhai / Kongo / Ethiopia)', color: '#eab308' }
      ]
    },
    {
      id: 'today',
      yearLabel: 'Today',
      shortLabel: 'Today',
      maxYearCE: 2100,
      headline: 'Modern Global Linguistic Landscape (242 Nations & 7,100+ Living Languages)',
      description: 'Colonial & trade globalization layered English, Spanish, French, Portuguese, Arabic, and Russian across continents while 7,000+ indigenous and regional languages anchor local heritage.',
      legend: null
    }
  ];

  // Uninhabited prior to Polynesian/Norse voyages (~2000 BCE)
  const LATE_SETTLEMENT_2000BCE = new Set([
    'NZL', 'HAW', 'TAH', 'PYF', 'WSM', 'ASM', 'TON', 'COK', 'NIU', 'PCN', 'ISL', 'FRO',
    'MDV', 'MUS', 'SYC', 'CPV', 'STP', 'ATA', 'SGS', 'HMD', 'FLK'
  ]);

  const AMERICAS_CONT = new Set(['North America', 'South America', 'Central America', 'Caribbean']);

  function getCountryEraState(c, eraId) {
    if (!c || eraId === 'today') return null;
    const iso = (c.iso3 || '').toUpperCase();
    const cont = c.continent || '';
    const lng = c.centroid ? Number(c.centroid[0]) : 0;
    const lat = c.centroid ? Number(c.centroid[1]) : 0;

    // 1. Greenland & Iceland
    if (iso === 'GRL') {
      if (eraId === '2000bce') return { label: 'Paleo-Eskimo (Independence I & Saqqaq)', family: 'Arctic Pre-Inuit', color: '#06b6d4', note: 'Early Paleo-Eskimo hunters crossed High Arctic ice centuries before Thule Inuit arrived.' };
      if (eraId === '100ce') return { label: 'Dorset Culture Arctic Paleo-Inuit', family: 'Paleo-Eskimo', color: '#06b6d4', note: 'Pre-Thule Dorset peoples thrived along Greenland’s coasts prior to ~1200 CE Thule Inuit.' };
      if (eraId === '1000ce') return { label: 'Old Norse Colonies & Late Dorset', family: 'North Germanic & Paleo-Inuit', color: '#38bdf8', note: 'Erik the Red founded Norse Eastern/Western Settlements c. 985 CE speaking Old West Norse!' };
      if (eraId === '1492ce') return { label: 'Inuit Thule (Proto-Kalaallisut)', family: 'Eskimo-Aleut', color: '#10b981', note: 'Thule Inuit ancestors of modern Greenlandic (Kalaallisut) expanded across all habitable coasts.' };
    }

    if (iso === 'ISL') {
      if (eraId === '2000bce' || eraId === '100ce') return { label: 'Unsettled Sub-Arctic Island', family: 'Uninhabited', color: '#334155', note: 'No permanent human settlement yet until Irish monks & 9th-century Norse settlers.' };
      return { label: 'Old West Norse (Old Icelandic)', family: 'Germanic', color: '#38bdf8', note: 'Remarkably conservative Old Norse remained mutually close to Norwegian settlers across centuries.' };
    }

    // 2. Late-settled Pacific & Indian Ocean Islands
    if (LATE_SETTLEMENT_2000BCE.has(iso)) {
      if (eraId === '2000bce') return { label: 'Unsettled Frontier / Open Ocean', family: 'Uninhabited (~2000 BCE)', color: '#334155', note: 'Austronesian Lapita navigators were still crossing Western Melanesia before voyaging farther east.' };
    }

    // 3. Americas (Pre-Columbian up through 1492 CE!)
    if (AMERICAS_CONT.has(cont)) {
      if (iso === 'MEX') {
        if (eraId === '2000bce') return { label: 'Early Otomanguean, Maya & Mixe-Zoque', family: 'Mesoamerican Roots', color: '#22c55e', note: 'Maize agriculturalists spoke Proto-Maya, Otomanguean & Mixe-Zoque centuries before Nahua migrations.' };
        if (eraId === '100ce') return { label: 'Teotihuacan, Zapotec & Classic Maya', family: 'Mesoamerican Civilizations', color: '#16a34a', note: 'Hieroglyphic writing bloomed in Monte Albán & Maya lowlands while great Teotihuacan rose.' };
        if (eraId === '1000ce') return { label: 'Toltec Nahuatl, Maya & Mixtec', family: 'Uto-Aztecan / Mayan', color: '#10b981', note: 'Nahuatl expanded via Toltec influence alongside flourishing Postclassic Maya & Mixtec states.' };
        return { label: 'Nahuatl (Aztec Empire) & 68+ Indigenous Tongues', family: 'Uto-Aztecan / Mayan / Otomanguean', color: '#10b981', note: 'Aztec Triple Alliance Nahuatl served as Mesoamerica’s lingua franca before 1519 Spanish contact.' };
      }
      if (iso === 'PER' || iso === 'BOL' || iso === 'ECU') {
        if (eraId === '2000bce') return { label: 'Caral-Supe Pre-Quechuan & Aymaran Horizons', family: 'Early Andean Families', color: '#22c55e', note: 'Ancient Andean urban centers at Caral predated the later Inca imperial expansion by 3,000+ years.' };
        if (eraId === '100ce') return { label: 'Mochica, Nazca, Proto-Quechua & Pukina', family: 'Andean Isolates & Quechuan', color: '#16a34a', note: 'Moche, Nazca, and Tiwanaku-related Pukina/Aymara flourished independently across coast and Altiplano.' };
        if (eraId === '1000ce') return { label: 'Wari–Quechua & Tiwanaku Aymara', family: 'Quechuan / Aymaran', color: '#10b981', note: 'Wari and Tiwanaku networks spread Central Andean Quechua and Aymara across mountain valleys.' };
        return { label: 'Quechua (Tawantinsuyu) & Aymara', family: 'Quechuan / Aymaran', color: '#10b981', note: 'Inca Empire (Tawantinsuyu) administered millions from Colombia to Chile in Cusco Quechua before 1532.' };
      }
      if (iso === 'PRY' || iso === 'BRA' || iso === 'URY') {
        return { label: 'Tupí-Guaraní & Macro-Jê Heartland', family: 'Tupian / Macro-Jê', color: '#10b981', note: 'Old Tupí blanketed Brazil’s Atlantic coast (Língua Geral); Guaraní thrived throughout the Paraná basin — zero Portuguese yet!' };
      }
      if (iso === 'ARG' || iso === 'CHL') {
        return { label: 'Mapudungun, Tehuelche & Andean Northwest', family: 'Araucanian / Chonan / Quechuan', color: '#10b981', note: 'Mapuche Mapudungun, Pampas Chonan, and northern Diaguita Kakán covered Southern Cone before Spanish colonization.' };
      }
      if (iso === 'CAN' || iso === 'USA') {
        return { label: 'Algonquian, Na-Dene, Siouan, Iroquoian, Uto-Aztecan & Inuit', family: 'Indigenous North America (300+ Languages)', color: '#10b981', note: 'Hundreds of unrelated North American families covered the continent (Cree, Ojibwe, Navajo, Cherokee, Lakota, Salish) before European arrivals.' };
      }
      if (iso === 'GTM' || iso === 'BLZ' || iso === 'HND' || iso === 'SLV' || iso === 'NIC' || iso === 'CRI' || iso === 'PAN') {
        return { label: 'Mayan & Chibchan Corridor', family: 'Mayan / Chibchan', color: '#10b981', note: 'K’iche’, Kaqchikel, Yucatec Maya and southern Chibchan families (Bribri, Ngäbere) spanned Central America.' };
      }
      return { label: 'Taíno (Arawakan) & Island Carib', family: 'Arawakan / Cariban', color: '#10b981', note: 'Taíno Arawak gave Europe *canoe, hurricane, hammock, barbecue & potato* — zero colonial languages existed here yet!' };
    }

    // 4. Australia & Oceania
    if (iso === 'AUS') {
      return { label: '250+ Aboriginal Languages (Pama-Nyungan & Arnhem)', family: 'Pama-Nyungan & Northern Isolates', color: '#14b8a6', note: 'Every square kilometer belonged to sovereign First Nations clans speaking 250+ distinct languages before 1788!' };
    }
    if (iso === 'NZL') {
      if (eraId === '100ce' || eraId === '1000ce') return { label: 'Unsettled / Earliest Polynesian Explorers', family: 'Eastern Polynesian Horizon (~1250 CE)', color: '#334155', note: 'Māori waka navigators arrived around 1250–1300 CE from Eastern Polynesia (Hawaiki).' };
      return { label: 'Te Reo Māori (Aotearoa)', family: 'Austronesian (Polynesian)', color: '#14b8a6', note: 'Flourished exclusively across North & South Islands prior to 19th-century British settlement.' };
    }
    if (cont === 'Oceania') {
      return { label: 'Oceanic Austronesian & Papuan Languages', family: 'Austronesian / Trans-New Guinea', color: '#14b8a6', note: 'Pure Pacific Oceanic & Papuan complexity predating colonial Pidgin/English/French.' };
    }

    // 5. Japan & Korea
    if (iso === 'JPN') {
      if (eraId === '2000bce') return { label: 'Jōmon Tongues & Pre-Yayoi (Ainu Ancestors)', family: 'Pre-Japonic / Ainuic', color: '#14b8a6', note: 'Hunter-gatherer Jōmon pottery cultures preceded Yayoi wet-rice Japonic arrivals from the continent (~900 BCE).' };
      if (eraId === '100ce') return { label: 'Yayoi Early Japonic & Northern Ainu', family: 'Japonic & Ainuic', color: '#ec4899', note: 'Early Yayoi kingdoms (Yamatai) spoke Old Japonic while Emishi/Ainu thrived in northern Honshu & Hokkaido.' };
      if (eraId === '1000ce') return { label: 'Late Old / Classical Japanese (Heian) & Ainu', family: 'Japonic / Ryukyuan / Ainuic', color: '#ec4899', note: 'Heian Kyoto court authored *Tale of Genji* in brand-new native Hiragana while Ainu spoke isolates in the north.' };
      return { label: 'Middle Japanese, Ryukyuan Kingdoms & Ezo Ainu', family: 'Japonic / Ainuic', color: '#ec4899', note: 'Ryukyu Kingdom spoke distinct Ryukyuan while Ezo (Hokkaido) remained sovereign Ainu territory.' };
    }
    if (iso === 'KOR' || iso === 'PRK') {
      if (eraId === '2000bce') return { label: 'Pre-Koreanic & Mumun Cultures', family: 'Early Koreanic Frontier', color: '#f472b6', note: 'Ancestor communities of Koreanic rice and bronze cultures prior to Three Kingdoms.' };
      if (eraId === '100ce') return { label: 'Buyeo, Goguryeo & Samhan Koreanic', family: 'Koreanic', color: '#f472b6', note: 'Three Kingdoms dialects evolved in peninsula & southern Manchuria using borrowed Chinese Hanja.' };
      return { label: 'Middle Korean (Goryeo / Early Hangul 1446)', family: 'Koreanic', color: '#f472b6', note: eraId === '1492ce' ? 'King Sejong had JUST unveiled Hangul (1446) — giving Korean one of history’s clearest scripts!' : 'Goryeo spoken Old/Middle Korean alongside classical Hanja literacy.' };
    }

    // 6. China, Southeast & South Asia
    if (iso === 'CHN' || iso === 'TWN') {
      if (iso === 'TWN') return { label: 'Austronesian Formosan Urheimat (No Mandarin Yet!)', family: 'Austronesian Homeland', color: '#14b8a6', note: 'Linguists’ biggest insight: Taiwan is the Austronesian homeland — 9 of 10 primary branches exist ONLY here before expanding to Madagascar & Hawaii!' };
      if (eraId === '2000bce') return { label: 'Shang Proto-Sinitic, Kra-Dai & Miao-Yao South', family: 'Sino-Tibetan / Austric', color: '#dc2626', note: 'Yellow River spoke Old Sinitic while the Yangtze & Lingnan south spoke Hmong-Mien, Kra-Dai & Austroasiatic!' };
      if (eraId === '100ce') return { label: 'Eastern Han Sinitic & Yue South', family: 'Sino-Tibetan (Old Chinese)', color: '#dc2626', note: 'Han Dynasty spread Old Chinese southward toward Canton while retaining -p/-t/-k final stops still heard in Cantonese!' };
      if (eraId === '1000ce') return { label: 'Song Middle Chinese, Khitan & Tangut', family: 'Sinitic / Para-Mongolic / Tibeto-Burman', color: '#dc2626', note: 'Song China thrived in southern/eastern plains while Liao Khitan and Tangut (Western Xia) ruled the northern Silk Road.' };
      return { label: 'Ming Early Mandarin & Southern Sinitic', family: 'Sino-Tibetan', color: '#dc2626', note: 'Nanjing/Beijing Guanhua emerged as Ming imperial lingua franca alongside Fujian Min and Cantonese.' };
    }

    if (iso === 'IND' || iso === 'PAK' || iso === 'BGD' || iso === 'NPL' || iso === 'LKA') {
      if (eraId === '2000bce') return { label: 'Indus Civilization, Proto-Dravidian & Early Indo-Aryan', family: 'Dravidian / Munda / Pre-Vedic', color: '#fb7185', note: 'Harappan cities and Dravidian–Munda speakers covered India as Early Indo-Aryan pastoralists entered the northwest.' };
      if (eraId === '100ce') return { label: 'Sanskrit, Prakrit, Pali & Classical Sangam Tamil', family: 'Indo-Aryan & Dravidian', color: '#f59e0b', note: 'Kushan Prakrit linked Gandhara while southern Pandya/Chola poets composed Classical Tamil Sangam epics!' };
      if (eraId === '1000ce') return { label: 'Apabhraṃśa, New Indo-Aryan & Chola Tamil', family: 'Indo-Aryan & Dravidian', color: '#f59e0b', note: 'Early Hindi, Bengali, Marathi, and Gujarati began diverging from Prakrits while Imperial Chola Tamil spread by sea!' };
      return { label: 'Hindustani, Persian Court & Regional Indic/Dravidian', family: 'Indo-Aryan / Dravidian / Persianate', color: '#f59e0b', note: 'Rich vernacular literatures (Urdu/Hindi precursors, Bengali, Tamil, Telugu) prior to British colonial English.' };
    }

    // 7. Middle East & Iran
    if (iso === 'IRN' || iso === 'AFG' || iso === 'TJK') {
      if (eraId === '2000bce') return { label: 'Elamite, BMAC & Proto-Iranian Arrivals', family: 'Elamite / Proto-Iranian', color: '#0d9488', note: 'Non-Indo-European Elamite dominated Susa alongside Bronze Age BMAC while early Iranians moved south from steppes.' };
      if (eraId === '100ce') return { label: 'Parthian & Bactrian Iranian + Aramaic Script', family: 'Iranian', color: '#0d9488', note: 'Parthian Middle Iranian in Iran and Greek-script Bactrian in Afghanistan bridged Rome, India, and Han China.' };
      return { label: 'New Persian (Fārsī-ye Darī) Cultural Golden Age', family: 'Iranian', color: '#0d9488', note: eraId === '1000ce' ? 'Ferdowsi just completed the *Shahnameh*, cementing New Persian from Isfahan to Samarkand!' : 'Classical Persian thrived as court & poetry lingua franca across Iran, Transoxiana, and Northern India.' };
    }
    if (iso === 'TUR') {
      if (eraId === '2000bce') return { label: 'Hittite (Anatolian IE) & Hattic / Hurrian', family: 'Indo-European (Anatolian)', color: '#f59e0b', note: 'Hittite is the oldest attested Indo-European language on cuneiform clay tablets!' };
      if (eraId === '100ce') return { label: 'Koine Greek, Galatian Celtic & Cappadocian', family: 'Hellenic / Anatolian', color: '#2563eb', note: 'Hellenistic Greek covered coastal & urban Asia Minor centuries before Turkic Oghuz migration.' };
      if (eraId === '1000ce') return { label: 'Byzantine Greek, Armenian & Incoming Oghuz', family: 'Hellenic / Armenian / Turkic', color: '#4f46e5', note: 'Byzantine Anatolia on the eve of the 1071 Seljuk Turkic arrival.' };
      return { label: 'Ottoman Turkish (with Kurdish, Greek & Armenian)', family: 'Turkic (Oghuz)', color: '#9333ea', note: 'Ottoman Turkish written in Perso-Arabic script united Anatolia and southeastern Europe.' };
    }
    if (['IRQ', 'SYR', 'JOR', 'LBN', 'PSE', 'ISR', 'SAU', 'YEM', 'OMN', 'EGY'].includes(iso)) {
      if (eraId === '2000bce') return { label: 'Akkadian, Ancient Egyptian, Northwest Semitic & Sabaic', family: 'Afroasiatic (Early Semitic & Egyptian)', color: '#eab308', note: 'Babylonian Akkadian served as Bronze Age diplomacy’s lingua franca alongside Middle Egyptian hieroglyphs.' };
      if (eraId === '100ce') return { label: 'Imperial Aramaic, Koine Greek & Nabataean Arabic', family: 'Afroasiatic (Aramaic / Early Arabic) & Greek', color: '#eab308', note: 'Aramaic ruled everyday Levantine/Mesopotamian speech (not yet widespread Arabic!) while Egyptian spoke Demotic/Coptic.' };
      return { label: 'Classical Arabic & Surviving Coptic/Syriac/Modern South Arabian', family: 'Afroasiatic (Semitic)', color: '#eab308', note: 'Islamic-era Arabic became the shared scholarly and administrative tongue across the Near East and Nile.' };
    }

    // 8. Europe (Clear distinction across Bronze Age -> Roman -> Medieval -> Pre-1492)
    if (cont === 'Europe') {
      if (['GBR', 'IRL'].includes(iso)) {
        if (eraId === '2000bce' || eraId === '100ce') return { label: 'Insular Celtic (Brittonic & Primitive Irish)', family: 'Indo-European (Celtic)', color: '#16a34a', note: 'Prior to Anglo-Saxon Germanic migrations (c. 450 CE), Britain & Ireland were entirely Celtic-speaking!' };
        if (eraId === '1000ce') return { label: 'Old English, Danelaw Norse & Middle Irish/Welsh', family: 'Germanic & Celtic', color: '#0284c7', note: 'Anglo-Saxon Old English and Viking Old Norse collided to reshape English grammar forever.' };
        return { label: 'Early Modern/Middle English, Scots, Irish & Welsh', family: 'Germanic & Celtic', color: '#3b82f6', note: 'On the eve of 1492, English was spoken by just ~3–4 million people on a single island!' };
      }
      if (['ESP', 'PRT'].includes(iso)) {
        if (eraId === '2000bce') return { label: 'Pre-IE Iberian, Tartessian & Proto-Basque', family: 'Pre-Indo-European & Celtic Fringe', color: '#10b981', note: 'Non-Indo-European Iberian and Proto-Basque predated Phoenicians, Romans, and Castilian!' };
        if (eraId === '100ce') return { label: 'Hispanic Vulgar Latin & Basque Aquitanian', family: 'Italic (Roman) & Vasconic', color: '#e879f9', note: 'Roman rule Latinized Iberia, yet Basque survived triumphantly in the Pyrenees.' };
        if (eraId === '1000ce') return { label: 'Andalusi Arabic, Mozarabic, Galician & Castilian', family: 'Semitic & Ibero-Romance', color: '#eab308', note: 'Al-Andalus spoke Andalusi Arabic & Mozarabic alongside northern Castilian, Leonese, Galician-Portuguese & Catalan!' };
        return { label: 'Castilian Spanish, Portuguese, Catalan & Basque (Pre-Empire)', family: 'Ibero-Romance & Isolate', color: '#e11d48', note: 'Wait until October 1492 — neither Spanish nor Portuguese had crossed the Atlantic yet!' };
      }
      if (['FRA', 'BEL', 'CHE', 'ITA'].includes(iso)) {
        if (eraId === '2000bce') return { label: 'Proto-Celtic, Italic, Etruscan & Ligurian', family: 'Italic / Celtic / Etruscan Isolate', color: '#f59e0b', note: 'Etruscan (non-IE isolate) & early Italic/Celtic tribes lived centuries before Rome grew dominant.' };
        if (eraId === '100ce') return { label: 'Roman Imperial Latin & Continental Gaulish', family: 'Italic (Latin) & Celtic', color: '#e879f9', note: 'Latin spread rapidly across Italy and Gaul, absorbing thousands of Celtic agricultural words.' };
        return { label: 'Old/Middle French, Occitan & Tuscan/Regional Romance', family: 'Romance / Germanic', color: '#c026d3', note: 'Gallo-Romance Langues d’oïl & d’oc and Italian city-state tongues (Florentine, Venetian, Sicilian) flourished.' };
      }
      if (['DEU', 'NLD', 'AUT', 'DNK', 'NOR', 'SWE'].includes(iso)) {
        if (eraId === '2000bce') return { label: 'Nordic Bronze Age (Proto-Germanic Ancestors)', family: 'North/Central IE (Pre-Germanic)', color: '#38bdf8', note: 'Early Nordic Bronze Age groups formed Proto-Germanic in southern Scandinavia & North German Plain.' };
        if (eraId === '100ce') return { label: 'Proto-Germanic & Runic Dialects', family: 'Germanic', color: '#38bdf8', note: 'Elder Futhark runes began appearing across Jutland and the Rhine–Elbe frontier.' };
        return { label: 'Old Norse / Old High & Low German / Middle Dutch', family: 'Germanic', color: '#3b82f6', note: 'Hanseatic Low German and Old Norse linked North Sea and Baltic ports.' };
      }
      if (['RUS', 'UKR', 'BLR', 'POL', 'CZE', 'SVK', 'BGR', 'SRB', 'HRV', 'BIH', 'SVN'].includes(iso)) {
        if (eraId === '2000bce') return { label: 'Steppe Yamnaya Descendants, Balto-Slavic & Finno-Ugric', family: 'Balto-Slavic & Steppe Iranian', color: '#f59e0b', note: 'Scythian/Sarmatian Iranian nomads roamed the southern steppes while Balto-Slavic & Finnic inhabited forest zones.' };
        if (eraId === '100ce') return { label: 'Early Slavic Forest Zone, Sarmatian & Gothic Steppe', family: 'Early Slavic / Iranian / East Germanic', color: '#4f46e5', note: 'East Germanic Goths & Sarmatians shared the Pontic Steppe north of the Black Sea before Slavic expansion.' };
        if (eraId === '1000ce') return { label: 'Old East Slavic (Kyivan Rus’) & Old Church Slavonic', family: 'Slavic & Steppe Turkic', color: '#4f46e5', note: 'Kyivan Rus’ flourished in the north while Pecheneg/Cuman Kipchak Turkic peoples rode the southern steppe!' };
        return { label: 'Early East/West/South Slavic Vernaculars & Tartar Steppe', family: 'Slavic & Turkic', color: '#4f46e5', note: 'Muscovite Russian remained restricted to Europe — Siberia’s eastward conquest lay a century in the future!' };
      }
      if (iso === 'GRC') return { label: eraId === '2000bce' ? 'Mycenaean Linear B & Minoan Crete' : (eraId === '100ce' ? 'Koine Greek' : 'Byzantine Medieval Greek'), family: 'Hellenic', color: '#2563eb', note: 'Continuous 3,400+ year documented attestation from Linear B clay tablets to Modern Greek.' };
      if (['HUN', 'FIN', 'EST'].includes(iso)) {
        if (iso === 'HUN' && (eraId === '2000bce' || eraId === '100ce')) return { label: 'Celtic / Pannonia Latin & Dacian', family: 'Italic / Celtic', color: '#e879f9', note: 'Magyars still lived east along the Urals/Volga before the 895 CE Honfoglalás!' };
        return { label: 'Uralic (Hungarian / Finnic)', family: 'Uralic', color: '#14b8a6', note: 'Magyars arrived in the Carpathian Basin c. 895 CE; Finnic thrived around the Baltic.' };
      }
      return { label: c.canonicalLanguage + ' Regional Precursor', family: c.languageFamily, color: '#3b82f6', note: 'Regional vernacular flourishing in Europe prior to global maritime empires.' };
    }

    // 9. Africa
    if (cont === 'Africa') {
      if (['MAR', 'DZA', 'TUN', 'LBY'].includes(iso)) {
        if (eraId === '2000bce' || eraId === '100ce') return { label: 'Ancient Amazigh (Libyco-Berber) & Punic/Latin Coast', family: 'Afroasiatic (Berber & Punic)', color: '#10b981', note: 'Numidian Amazigh kingdoms wrote Tifinagh inscriptions centuries before Arabic arrived in the 7th century!' };
        return { label: 'Arabic & Amazigh (Almoravid / Almohad Eras)', family: 'Afroasiatic (Semitic & Berber)', color: '#eab308', note: 'Classical Arabic scholars and Amazigh dynasties shaped Maghrebi and Andalusi culture.' };
      }
      if (iso === 'ETH' || iso === 'ERI') {
        if (eraId === '2000bce') return { label: 'Proto-Cushitic & Early Ethio-Semitic Highlands', family: 'Afroasiatic', color: '#eab308', note: 'Ancient Horn crossroads prior to Aksum.' };
        return { label: 'Geʻez (Aksumite Royal Script), Amharic, Tigrinya & Oromo', family: 'Afroasiatic (Semitic & Cushitic)', color: '#16a34a', note: 'Aksum minted coins and carved stone inscriptions in Geʻez long before European contact.' };
      }
      if (lat > 5) {
        return { label: 'Mande, Atlantic, Gur, Songhai, Chadic & Hausa', family: 'Niger-Congo / Nilo-Saharan / Afroasiatic', color: '#eab308', note: 'Mali, Songhai (Timbuktu Ajami scholars!), Kanem-Bornu, and Yoruba states thrived prior to Atlantic coastal French/English.' };
      }
      if (lat < -20 && lng < 26) {
        return { label: 'Khoe–San & Early Bantu Southern Frontier', family: 'Khoisan & Niger-Congo', color: '#16a34a', note: 'Prior to Dutch arrival (1652), Khoekhoe & San click languages covered western Southern Africa beside Zulu/Xhosa/Sotho eastward.' };
      }
      if (iso === 'MDG') {
        if (eraId === '2000bce') return { label: 'Unsettled Indian Ocean Island', family: 'Uninhabited', color: '#334155', note: 'Wait for intrepid Bornean Austronesian outrigger voyagers (~300–500 CE)!' };
        return { label: 'Malagasy (Austronesian–Bantu Synthesis)', family: 'Austronesian + Bantu', color: '#ec4899', note: 'Malagasy pioneers sailed all the way from Borneo across the Indian Ocean!' };
      }
      return { label: 'Bantu & East African Coastal Swahili Civilization', family: 'Niger-Congo (Bantu)', color: '#16a34a', note: eraId === '2000bce' ? 'Bantu expansion still radiating outward from Cameroon-Nigeria Cross River!' : 'Swahili city-states (Kilwa, Mombasa) wrote poetry in Arabic-script Kiswahili beside Great Zimbabwe & Kongo!' };
    }

    // 10. Remaining Central/North/Southeast Asia
    if (['KAZ', 'UZB', 'KGZ', 'TKM', 'MNG'].includes(iso)) {
      if (eraId === '2000bce') return { label: 'Andronovo Steppe Indo-Iranian & Early Altai Nomads', family: 'Indo-Iranian / Early Altaic', color: '#f59e0b', note: 'Scythian/Saka horse riders spoke Eastern Iranian across Kazakhstan millennia before Old Turkic expanded west!' };
      if (eraId === '100ce') return { label: 'Sogdian, Saka Iranian & Xiongnu Confederation', family: 'Eastern Iranian / Inner Asian', color: '#0d9488', note: 'Sogdians served as the Silk Road’s master merchants from Samarkand all the way to China!' };
      return { label: 'Old/Middle Turkic (Karakhanid/Kipchak) & Middle Mongol', family: 'Turkic & Mongolic', color: '#9333ea', note: 'Runiform Orkhon Turkic and Chagatai/Mongol steppe scripts linked Eurasia from the Altai to the Black Sea.' };
    }

    if (cont === 'Asia') {
      if (iso === 'RUS') {
        return { label: 'East Slavic (West), Turkic, Uralic & Paleosiberian Tongues', family: 'Slavic / Uralic / Turkic / Isolates', color: '#14b8a6', note: 'Before 1581, Siberia spoke Samoyedic, Tungusic, Turkic, Yukaghir & Yeniseian — not Russian!' };
      }
      return { label: 'Pre-Colonial ' + (c.canonicalLanguage || 'Indigenous') + ' & Regional Tongues', family: c.languageFamily, color: '#a855f7', note: 'Rich Southeast Asian / Himalayan linguistic kingdoms flourishing before European colonial borders.' };
    }

    return { label: c.canonicalLanguage + ' Era Lineage', family: c.languageFamily, color: '#0ea5e9', note: 'Historic linguistic profile.' };
  }

  global.WORLD_HISTORICAL_ERAS = {
    ENDANGERED_HOTSPOTS,
    ERAS,
    getCountryEraState
  };
})(window);

