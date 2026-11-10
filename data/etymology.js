// data/etymology.js - "Trace a Word Across the Globe" Cognate & Wanderwörter Etymology Atlas
(function (global) {
  'use strict';

  global.WORLD_ETYMOLOGY = {
    tea: {
      id: 'tea',
      label: 'Tea',
      subtitle: 'Silk Road “Chai” vs. Maritime “Tea”',
      etymon: '*dʰa / 茶 (Old Sinitic)',
      originHub: 'Southwest China (Sichuan–Yunnan)',
      color: '#f59e0b',
      camera: { lat: 33, lng: 64, altitude: 2.2 },
      summary:
        'Almost every word for tea worldwide splits into two paths: Sinitic *chá* carried overland along the Silk Road & by Portuguese Macao ships, versus Southern Min (Amoy) *tê* carried by Dutch East India maritime traders across the Indian Ocean.',
      branches: [
        { id: 'cha', label: 'Silk Road “Chai” (茶 chá)', color: '#f59e0b' },
        { id: 'te', label: 'Maritime “Tea” (Min tê)', color: '#06b6d4' }
      ],
      corridors: [
        // Overland Chai / Chá branch
        { from: [103.5, 30.6], to: [91.1, 29.6], originColor: '#f59e0b', destColor: '#fb923c', wave: 1, branch: 'cha', era: 'c. 650 CE', eraYearCE: 650, isPrimary: true },
        { from: [103.5, 30.6], to: [116.4, 39.9], originColor: '#f59e0b', destColor: '#ef4444', wave: 1, branch: 'cha', era: 'c. 600 CE', eraYearCE: 600, isPrimary: true },
        { from: [116.4, 39.9], to: [139.7, 35.7], originColor: '#ef4444', destColor: '#ec4899', wave: 2, branch: 'cha', era: 'c. 800 CE', eraYearCE: 800, isPrimary: false },
        { from: [103.5, 30.6], to: [69.2, 41.3], originColor: '#f59e0b', destColor: '#f59e0b', wave: 2, branch: 'cha', era: 'c. 1200 CE', eraYearCE: 1200, isPrimary: true },
        { from: [69.2, 41.3], to: [51.4, 35.7], originColor: '#f59e0b', destColor: '#fbbf24', wave: 2, branch: 'cha', era: 'c. 1300 CE', eraYearCE: 1300, isPrimary: true },
        { from: [51.4, 35.7], to: [77.2, 28.6], originColor: '#fbbf24', destColor: '#f97316', wave: 3, branch: 'cha', era: 'c. 1550 CE', eraYearCE: 1550, isPrimary: true },
        { from: [51.4, 35.7], to: [32.8, 39.9], originColor: '#fbbf24', destColor: '#a855f7', wave: 3, branch: 'cha', era: 'c. 1600 CE', eraYearCE: 1600, isPrimary: true },
        { from: [69.2, 41.3], to: [37.6, 55.7], originColor: '#f59e0b', destColor: '#6366f1', wave: 3, branch: 'cha', era: 'c. 1638 CE', eraYearCE: 1638, isPrimary: true },
        { from: [32.8, 39.9], to: [36.8, -1.3], originColor: '#a855f7', destColor: '#22c55e', wave: 4, branch: 'cha', era: 'c. 1880 CE', eraYearCE: 1880, isPrimary: false },
        { from: [113.5, 22.2], to: [-9.1, 38.7], originColor: '#f59e0b', destColor: '#fb7185', wave: 4, branch: 'cha', era: 'c. 1560 CE', eraYearCE: 1560, isPrimary: true },

        // Maritime Min Nan / Dutch Tê branch
        { from: [118.1, 24.5], to: [106.8, -6.2], originColor: '#06b6d4', destColor: '#14b8a6', wave: 2, branch: 'te', era: 'c. 1607 CE', eraYearCE: 1607, isPrimary: true },
        { from: [106.8, -6.2], to: [4.9, 52.3], originColor: '#14b8a6', destColor: '#06b6d4', wave: 3, branch: 'te', era: 'c. 1610 CE', eraYearCE: 1610, isPrimary: true },
        { from: [4.9, 52.3], to: [-0.1, 51.5], originColor: '#06b6d4', destColor: '#38bdf8', wave: 4, branch: 'te', era: 'c. 1650 CE', eraYearCE: 1650, isPrimary: true },
        { from: [4.9, 52.3], to: [2.3, 48.8], originColor: '#06b6d4', destColor: '#c026d3', wave: 4, branch: 'te', era: 'c. 1636 CE', eraYearCE: 1636, isPrimary: false },
        { from: [4.9, 52.3], to: [-3.7, 40.4], originColor: '#06b6d4', destColor: '#f43f5e', wave: 4, branch: 'te', era: 'c. 1660 CE', eraYearCE: 1660, isPrimary: false },
        { from: [4.9, 52.3], to: [13.4, 52.5], originColor: '#06b6d4', destColor: '#3b82f6', wave: 4, branch: 'te', era: 'c. 1650 CE', eraYearCE: 1650, isPrimary: false }
      ],
      stops: [
        {
          id: 'tea_chn', iso3: 'CHN', country: 'China (Sichuan & Fujian)',
          lat: 30.6, lng: 103.5, word: 'chá (北方) / tê (閩南)',
          nativeScript: '茶', phonetic: 'chah / tay', branch: 'cha', era: 'Origin (~3rd c. BCE)', color: '#f59e0b',
          note: 'Northern Sinitic kept *chá*, while coastal Hokkien Min Nan retained older pronunciation *tê* — splitting world languages in two!'
        },
        {
          id: 'tea_jpn', iso3: 'JPN', country: 'Japan',
          lat: 35.7, lng: 139.7, word: 'o-cha / cha',
          nativeScript: 'お茶 (おちゃ)', phonetic: 'oh-chah', branch: 'cha', era: 'Tang Dynasty (~805 CE)', color: '#ec4899',
          note: 'Monks Saichō and Kūkai brought Tang Buddhist *cha* directly from Chang’an; honorific o- attaches to daily nouns.'
        },
        {
          id: 'tea_irn', iso3: 'IRN', country: 'Iran',
          lat: 35.7, lng: 51.4, word: 'chāy',
          nativeScript: 'چای', phonetic: 'chahy', branch: 'cha', era: 'Silk Road (~13th c.)', color: '#fbbf24',
          note: 'Middle Persian adopted *čāy* along Silk Road caravans and relayed this exact form to Turkey, Arab Gulf states, Russia, and India.'
        },
        {
          id: 'tea_ind', iso3: 'IND', country: 'India',
          lat: 28.6, lng: 77.2, word: 'chāy',
          nativeScript: 'चाय', phonetic: 'chye', branch: 'cha', era: '16th–19th c.', color: '#f97316',
          note: 'Borrowed via Persianized trade routes as *chāy*; South Asian spiced milk tea became world-famous as “masala chai”.'
        },
        {
          id: 'tea_tur', iso3: 'TUR', country: 'Turkey',
          lat: 39.9, lng: 32.8, word: 'çay',
          nativeScript: 'çay', phonetic: 'chye', branch: 'cha', era: 'Ottoman Trade', color: '#a855f7',
          note: 'Via Persian *chāy*, Turkish drinks one of the world’s highest per-capita amounts of Black Sea Rize *çay*.'
        },
        {
          id: 'tea_rus', iso3: 'RUS', country: 'Russia',
          lat: 55.7, lng: 37.6, word: 'chay',
          nativeScript: 'чай', phonetic: 'chye', branch: 'cha', era: '1638 CE', color: '#6366f1',
          note: 'Reaching Tsar Mikhail Romanov via Mongol/Turkic camel caravans; virtually all Slavic languages use *čay* or *herbata* (Polish).'
        },
        {
          id: 'tea_prt', iso3: 'PRT', country: 'Portugal',
          lat: 38.7, lng: -9.1, word: 'chá',
          nativeScript: 'chá', phonetic: 'shah', branch: 'cha', era: 'c. 1560 CE', color: '#fb7185',
          note: 'Unique in Western Europe! Because Portugal traded from Macao (Cantonese *chàh*), Portuguese says *chá*, never *té*.'
        },
        {
          id: 'tea_ken', iso3: 'KEN', country: 'Kenya & Tanzania',
          lat: -1.3, lng: 36.8, word: 'chai',
          nativeScript: 'chai', phonetic: 'chye', branch: 'cha', era: 'Indian Ocean Trade', color: '#22c55e',
          note: 'Swahili *chai* arrived via Arab/Persian & Gujarati Omani coastal merchants long before inland plantations.'
        },
        {
          id: 'tea_idn', iso3: 'IDN', country: 'Indonesia',
          lat: -6.2, lng: 106.8, word: 'teh',
          nativeScript: 'teh', phonetic: 'teh', branch: 'te', era: 'c. 1607 CE', color: '#14b8a6',
          note: 'Dutch merchants bought Fujian Min Nan *tê* at Bantam in Java, launching the global maritime *tê* lineage.'
        },
        {
          id: 'tea_nld', iso3: 'NLD', country: 'Netherlands',
          lat: 52.3, lng: 4.9, word: 'thee',
          nativeScript: 'thee', phonetic: 'tay', branch: 'te', era: 'c. 1610 CE', color: '#06b6d4',
          note: 'Amsterdam’s VOC monopoly spread *thee* across Western Europe, Germany (*Tee*), France (*thé*), Spain (*té*), and Britain (*tea*).'
        },
        {
          id: 'tea_gbr', iso3: 'GBR', country: 'United Kingdom',
          lat: 51.5, lng: -0.1, word: 'tea',
          nativeScript: 'tea', phonetic: 'tee', branch: 'te', era: 'c. 1650 CE', color: '#38bdf8',
          note: 'Originally pronounced “tay” in English (as rhymed by Alexander Pope with “obey”) before the 18th-century vowel shift!'
        }
      ]
    },

    coffee: {
      id: 'coffee',
      label: 'Coffee',
      subtitle: 'From Ethiopian Highlands via Mocha & Istanbul',
      etymon: 'قهوة (qahwa) / Kaffa',
      originHub: 'Ethiopian Highlands → Yemen',
      color: '#d97706',
      camera: { lat: 25, lng: 30, altitude: 2.15 },
      summary:
        'From the southwestern highlands of Ethiopia across the Red Sea to Sufi monasteries in Mocha, Yemen, the Arabic word *qahwa* traveled through Ottoman Turkish *kahve* into virtually every language on Earth.',
      branches: [
        { id: 'main', label: 'Arabic qahwa → Ottoman kahve → Global Coffee', color: '#d97706' }
      ],
      corridors: [
        { from: [36.2, 7.3], to: [43.2, 13.3], originColor: '#d97706', destColor: '#f59e0b', wave: 1, branch: 'main', era: 'c. 1450 CE', eraYearCE: 1450, isPrimary: true },
        { from: [43.2, 13.3], to: [31.2, 30.0], originColor: '#f59e0b', destColor: '#fbbf24', wave: 2, branch: 'main', era: 'c. 1510 CE', eraYearCE: 1510, isPrimary: true },
        { from: [31.2, 30.0], to: [28.9, 41.0], originColor: '#fbbf24', destColor: '#ef4444', wave: 2, branch: 'main', era: 'c. 1554 CE', eraYearCE: 1554, isPrimary: true },
        { from: [28.9, 41.0], to: [12.3, 45.4], originColor: '#ef4444', destColor: '#f43f5e', wave: 3, branch: 'main', era: 'c. 1600 CE', eraYearCE: 1600, isPrimary: true },
        { from: [43.2, 13.3], to: [4.9, 52.3], originColor: '#f59e0b', destColor: '#06b6d4', wave: 3, branch: 'main', era: 'c. 1616 CE', eraYearCE: 1616, isPrimary: true },
        { from: [12.3, 45.4], to: [2.3, 48.8], originColor: '#f43f5e', destColor: '#c026d3', wave: 4, branch: 'main', era: 'c. 1644 CE', eraYearCE: 1644, isPrimary: false },
        { from: [4.9, 52.3], to: [-0.1, 51.5], originColor: '#06b6d4', destColor: '#38bdf8', wave: 4, branch: 'main', era: 'c. 1650 CE', eraYearCE: 1650, isPrimary: false },
        { from: [4.9, 52.3], to: [-43.2, -22.9], originColor: '#06b6d4', destColor: '#22c55e', wave: 5, branch: 'main', era: 'c. 1727 CE', eraYearCE: 1727, isPrimary: true },
        { from: [4.9, 52.3], to: [139.7, 35.7], originColor: '#06b6d4', destColor: '#ec4899', wave: 5, branch: 'main', era: 'c. 1800 CE', eraYearCE: 1800, isPrimary: false }
      ],
      stops: [
        {
          id: 'cof_eth', iso3: 'ETH', country: 'Ethiopia',
          lat: 7.3, lng: 36.2, word: 'buna',
          nativeScript: 'ቡና (buna)', phonetic: 'BOO-nah', branch: 'main', era: 'Botanical Origin', color: '#d97706',
          note: 'Arabica coffee grows wild in Ethiopia’s Kaffa forests; Ethiopians call the drink *buna* and hold iconic *buna* ceremonies.'
        },
        {
          id: 'cof_yem', iso3: 'YEM', country: 'Yemen (Mocha)',
          lat: 13.3, lng: 43.2, word: 'qahwa / bunn',
          nativeScript: 'قهوة', phonetic: 'GAH-wah / QAH-wah', branch: 'main', era: 'c. 1450 CE', color: '#f59e0b',
          note: 'Yemeni Sufi mystics brewed *qahwa* (earlier a poetic word for dark wine) for night vigils and exported beans from Mocha!'
        },
        {
          id: 'cof_tur', iso3: 'TUR', country: 'Turkey (Ottoman)',
          lat: 41.0, lng: 28.9, word: 'kahve',
          nativeScript: 'kahve', phonetic: 'KAH-veh', branch: 'main', era: 'c. 1554 CE', color: '#ef4444',
          note: 'Since Arabic lacks a /v/ phoneme, Ottoman Turkish rendered /w/ as /v/ in *kahve* — the direct parent of Europe’s words!'
        },
        {
          id: 'cof_ita', iso3: 'ITA', country: 'Italy (Venice)',
          lat: 45.4, lng: 12.3, word: 'caffè',
          nativeScript: 'caffè', phonetic: 'kahf-FEH', branch: 'main', era: 'c. 1600 CE', color: '#f43f5e',
          note: 'Venetian merchants imported Turkish *kahve* into Christian Europe; Italy coined the global café vocabulary (espresso, latte, barista).'
        },
        {
          id: 'cof_nld', iso3: 'NLD', country: 'Netherlands',
          lat: 52.3, lng: 4.9, word: 'koffie',
          nativeScript: 'koffie', phonetic: 'KOF-ee', branch: 'main', era: 'c. 1616 CE', color: '#06b6d4',
          note: 'Dutch *koffie* yielded English *coffee*, Indonesian *kopi*, and Japanese *kōhī* (コーヒー) via Nagasaki Dutch traders!'
        },
        {
          id: 'cof_bra', iso3: 'BRA', country: 'Brazil',
          lat: -22.9, lng: -43.2, word: 'café',
          nativeScript: 'café', phonetic: 'kah-FEH', branch: 'main', era: '1727 CE', color: '#22c55e',
          note: 'French *café* traveled across colonial Guiana into Brazil, today producing a third of all coffee on Earth.'
        },
        {
          id: 'cof_jpn', iso3: 'JPN', country: 'Japan',
          lat: 35.7, lng: 139.7, word: 'kōhī',
          nativeScript: 'コーヒー (珈琲)', phonetic: 'koh-hee', branch: 'main', era: 'Edo Period Dejima', color: '#ec4899',
          note: 'Adapted directly from Dutch traders’ *koffie* on Dejima island; scholarly ateji 珈琲 evokes ornate hairpin buds.'
        }
      ]
    },

    sugar: {
      id: 'sugar',
      label: 'Sugar',
      subtitle: 'Sanskrit “Śarkarā” Across Eurasia',
      etymon: 'शर्करा (śarkarā) → سكر (sukkar)',
      originHub: 'New Guinea → India (Ganges Plain)',
      color: '#ec4899',
      camera: { lat: 24, lng: 42, altitude: 2.2 },
      summary:
        'Domesticated in New Guinea and first crystallized in ancient India as Sanskrit *śarkarā* (“pebbles/granules”), sugar carried the exact same etymon through Persian *shakar* and Arabic *sukkar* into Europe and the Americas.',
      branches: [
        { id: 'main', label: 'Sanskrit śarkarā → Arabic sukkar → Global Sugar', color: '#ec4899' }
      ],
      corridors: [
        { from: [143.9, -6.3], to: [85.1, 25.6], originColor: '#14b8a6', destColor: '#f59e0b', wave: 1, branch: 'main', era: 'Botanical Prehistory', eraYearCE: -1500, isPrimary: false },
        { from: [85.1, 25.6], to: [52.5, 29.6], originColor: '#f59e0b', destColor: '#fb7185', wave: 1, branch: 'main', era: 'c. 500 BCE', eraYearCE: -500, isPrimary: true },
        { from: [52.5, 29.6], to: [31.2, 30.0], originColor: '#fb7185', destColor: '#eab308', wave: 2, branch: 'main', era: 'c. 700 CE', eraYearCE: 700, isPrimary: true },
        { from: [31.2, 30.0], to: [-3.7, 40.4], originColor: '#eab308', destColor: '#e11d48', wave: 3, branch: 'main', era: 'c. 1000 CE', eraYearCE: 1000, isPrimary: true },
        { from: [31.2, 30.0], to: [12.3, 45.4], originColor: '#eab308', destColor: '#c026d3', wave: 3, branch: 'main', era: 'c. 1100 CE', eraYearCE: 1100, isPrimary: true },
        { from: [12.3, 45.4], to: [2.3, 48.8], originColor: '#c026d3', destColor: '#a855f7', wave: 4, branch: 'main', era: 'c. 1200 CE', eraYearCE: 1200, isPrimary: false },
        { from: [2.3, 48.8], to: [-0.1, 51.5], originColor: '#a855f7', destColor: '#38bdf8', wave: 4, branch: 'main', era: 'c. 1300 CE', eraYearCE: 1300, isPrimary: false },
        { from: [12.3, 45.4], to: [13.4, 52.5], originColor: '#c026d3', destColor: '#3b82f6', wave: 4, branch: 'main', era: 'c. 1300 CE', eraYearCE: 1300, isPrimary: false }
      ],
      stops: [
        {
          id: 'sug_ind', iso3: 'IND', country: 'India',
          lat: 25.6, lng: 85.1, word: 'śarkarā / shakkar',
          nativeScript: 'शर्करा / चीनी', phonetic: 'shar-kah-rah', branch: 'main', era: 'c. 500 BCE', color: '#f59e0b',
          note: 'Indian artisans first crystallized cane juice into gravel-like granules called *śarkarā* (literally “gravel/grit”) in Gupta & Mauryan eras.'
        },
        {
          id: 'sug_irn', iso3: 'IRN', country: 'Iran',
          lat: 29.6, lng: 52.5, word: 'shakar / qand',
          nativeScript: 'شکر / قند', phonetic: 'shah-kar', branch: 'main', era: 'Sasanian Era', color: '#fb7185',
          note: 'Sassanid Persia perfected sugar-refining and passed both *shakar* and *qand* (whence English “candy”!) into the Islamic world.'
        },
        {
          id: 'sug_egy', iso3: 'EGY', country: 'Egypt & Arab World',
          lat: 30.0, lng: 31.2, word: 'sukkar',
          nativeScript: 'سُكَّر', phonetic: 'SOOK-kar', branch: 'main', era: 'c. 700 CE', color: '#eab308',
          note: 'Arabic *sukkar* spread sugar plantations across Egypt, Sicily, and Al-Andalus — gifting *azúcar*, *zucchero*, *sucre*, *Zucker*, and *sugar*.'
        },
        {
          id: 'sug_esp', iso3: 'ESP', country: 'Spain',
          lat: 40.4, lng: -3.7, word: 'azúcar',
          nativeScript: 'azúcar', phonetic: 'ah-THOO-kar', branch: 'main', era: 'Al-Andalus (~10th c.)', color: '#e11d48',
          note: 'Notice the fused Arabic definite article al- + sukkar = *al-sukkar* → Spanish *azúcar* and Portuguese *açúcar*!'
        },
        {
          id: 'sug_ita', iso3: 'ITA', country: 'Italy',
          lat: 45.4, lng: 12.3, word: 'zucchero',
          nativeScript: 'zucchero', phonetic: 'TSOO-keh-roh', branch: 'main', era: 'c. 1100 CE', color: '#c026d3',
          note: 'Dropped Arabic al-; Italian *zucchero* traveled north to become French *sucre*, German *Zucker*, Russian *сахар* (sakhar), and English *sugar*.'
        },
        {
          id: 'sug_gbr', iso3: 'GBR', country: 'United Kingdom',
          lat: 51.5, lng: -0.1, word: 'sugar',
          nativeScript: 'sugar', phonetic: 'SHOO-ger', branch: 'main', era: 'c. 1300 CE', color: '#38bdf8',
          note: 'Entered Middle English from Old French *sucre* / Medieval Latin *succarum*; initial /s/ palatalized to /ʃ/ (“sh”).'
        }
      ]
    },

    orange: {
      id: 'orange',
      label: 'Orange',
      subtitle: 'Dravidian-Sanskrit “Nāraṅga” vs. Portugal Trade',
      etymon: 'नारङ्ग (nāraṅga) → نارنج (nāranj)',
      originHub: 'Southern China / NE India → Arabia → Portugal',
      color: '#f97316',
      camera: { lat: 30, lng: 35, altitude: 2.2 },
      summary:
        'Notice how “an orange” lost its opening N in English (“a norange” → “an orange”), while in Eastern Europe & the Middle East the citrus fruit took Portugal’s own name (*portokal / burtuqāl*) after Portuguese sailors introduced sweet oranges!',
      branches: [
        { id: 'naranja', label: 'Sanskrit nāraṅga → European Orange / Naranja', color: '#f97316' },
        { id: 'portokal', label: 'Sweet Trade “Portugal” Lineage (portakal / burtuqāl)', color: '#fb7185' }
      ],
      corridors: [
        { from: [78.0, 22.0], to: [51.4, 35.7], originColor: '#f59e0b', destColor: '#f97316', wave: 1, branch: 'naranja', era: 'c. 500 CE', eraYearCE: 500, isPrimary: true },
        { from: [51.4, 35.7], to: [35.9, 33.9], originColor: '#f97316', destColor: '#eab308', wave: 2, branch: 'naranja', era: 'c. 900 CE', eraYearCE: 900, isPrimary: true },
        { from: [35.9, 33.9], to: [-3.7, 40.4], originColor: '#eab308', destColor: '#e11d48', wave: 3, branch: 'naranja', era: 'c. 1050 CE', eraYearCE: 1050, isPrimary: true },
        { from: [35.9, 33.9], to: [12.5, 41.9], originColor: '#eab308', destColor: '#c026d3', wave: 3, branch: 'naranja', era: 'c. 1150 CE', eraYearCE: 1150, isPrimary: false },
        { from: [12.5, 41.9], to: [2.3, 48.8], originColor: '#c026d3', destColor: '#a855f7', wave: 4, branch: 'naranja', era: 'c. 1300 CE', eraYearCE: 1300, isPrimary: false },
        { from: [2.3, 48.8], to: [-0.1, 51.5], originColor: '#a855f7', destColor: '#38bdf8', wave: 4, branch: 'naranja', era: 'c. 1380 CE', eraYearCE: 1380, isPrimary: true },
        { from: [-9.1, 38.7], to: [23.7, 38.0], originColor: '#fb7185', destColor: '#2563eb', wave: 5, branch: 'portokal', era: 'c. 1600 CE', eraYearCE: 1600, isPrimary: true },
        { from: [23.7, 38.0], to: [32.8, 39.9], originColor: '#2563eb', destColor: '#9333ea', wave: 5, branch: 'portokal', era: 'c. 1650 CE', eraYearCE: 1650, isPrimary: true },
        { from: [32.8, 39.9], to: [31.2, 30.0], originColor: '#9333ea', destColor: '#fb7185', wave: 5, branch: 'portokal', era: 'c. 1700 CE', eraYearCE: 1700, isPrimary: false }
      ],
      stops: [
        {
          id: 'org_ind', iso3: 'IND', country: 'India',
          lat: 22.0, lng: 78.0, word: 'nāraṅga',
          nativeScript: 'नारङ्ग / संतरा', phonetic: 'nah-RUNG-gah', branch: 'naranja', era: 'Sanskrit Roots', color: '#f97316',
          note: 'Dravidian–Sanskrit *nāraṅga* (literally “fragrant” / citrus tree) started its westward journey along Indian Ocean trade.'
        },
        {
          id: 'org_irn', iso3: 'IRN', country: 'Iran',
          lat: 35.7, lng: 51.4, word: 'nāranj / porteghāl',
          nativeScript: 'نارنج / پرتقال', phonetic: 'nah-RANJ / por-teh-GHAL', branch: 'naranja', era: 'Medieval Trade', color: '#fb923c',
          note: 'Persian uniquely keeps BOTH waves: *nāranj* (bitter orange) AND *porteghāl* (sweet orange named after Portugal!).'
        },
        {
          id: 'org_esp', iso3: 'ESP', country: 'Spain',
          lat: 40.4, lng: -3.7, word: 'naranja',
          nativeScript: 'naranja', phonetic: 'nah-RAHN-hah', branch: 'naranja', era: 'c. 1050 CE', color: '#e11d48',
          note: 'Borrowed directly from Andalusi Arabic *nāranja*, famously keeping the original initial N!'
        },
        {
          id: 'org_gbr', iso3: 'GBR', country: 'United Kingdom',
          lat: 51.5, lng: -0.1, word: 'orange (lost N!)',
          nativeScript: 'orange', phonetic: 'OR-inj', branch: 'naranja', era: '14th c.', color: '#38bdf8',
          note: 'Rebracketing magic! Old French *orenge* (influenced by gold *or* in Orange, France) turned *a norange* into *an orange* — giving English the color name too!'
        },
        {
          id: 'org_grc', iso3: 'GRC', country: 'Greece',
          lat: 38.0, lng: 23.7, word: 'portokáli',
          nativeScript: 'πορτοκάλι', phonetic: 'por-toh-KAH-lee', branch: 'portokal', era: '16th–17th c.', color: '#2563eb',
          note: 'Because Portuguese fleets introduced sweet Asian oranges across the Mediterranean, Greece calls oranges *portokáli* (“Portugals”)!'
        },
        {
          id: 'org_tur', iso3: 'TUR', country: 'Turkey & Arab World',
          lat: 39.9, lng: 32.8, word: 'portakal / burtuqāl',
          nativeScript: 'portakal / برتقال', phonetic: 'por-tah-KAHL / boor-too-QAL', branch: 'portokal', era: '17th c.', color: '#9333ea',
          note: 'Turkish *portakal*, Arabic *burtuqāl*, Georgian *pʰortʰoxali*, and Bulgarian *portokal* all celebrate Portugal.'
        }
      ]
    },

    zero: {
      id: 'zero',
      label: 'Zero / Cipher',
      subtitle: 'Sanskrit “Śūnya” → Arabic “Ṣifr” → Zero & Cipher',
      etymon: 'शून्य (śūnya) → صِفْر (ṣifr)',
      originHub: 'India → Baghdad → Mediterranean',
      color: '#38bdf8',
      camera: { lat: 33, lng: 40, altitude: 2.15 },
      summary:
        'A single mathematical idea — Sanskrit *śūnya* (“void/empty”), translated into Arabic *ṣifr* — split in Medieval Latin into TWO everyday English words: Fibonacci’s *zephirum* (**zero**) and Medieval *cifra* (**cipher**)!',
      branches: [
        { id: 'main', label: 'India śūnya → Baghdad ṣifr → Europe Zero & Cipher', color: '#38bdf8' }
      ],
      corridors: [
        { from: [78.1, 26.2], to: [44.4, 33.3], originColor: '#f59e0b', destColor: '#eab308', wave: 1, branch: 'main', era: 'c. 773 CE', eraYearCE: 773, isPrimary: true },
        { from: [44.4, 33.3], to: [5.0, 36.7], originColor: '#eab308', destColor: '#22c55e', wave: 2, branch: 'main', era: 'c. 1180 CE', eraYearCE: 1180, isPrimary: true },
        { from: [5.0, 36.7], to: [10.4, 43.7], originColor: '#22c55e', destColor: '#38bdf8', wave: 3, branch: 'main', era: '1202 CE (Fibonacci)', eraYearCE: 1202, isPrimary: true },
        { from: [44.4, 33.3], to: [-4.0, 39.9], originColor: '#eab308', destColor: '#e11d48', wave: 2, branch: 'main', era: 'c. 1140 CE', eraYearCE: 1140, isPrimary: true },
        { from: [10.4, 43.7], to: [2.3, 48.8], originColor: '#38bdf8', destColor: '#c026d3', wave: 4, branch: 'main', era: 'c. 1485 CE', eraYearCE: 1485, isPrimary: false },
        { from: [2.3, 48.8], to: [-0.1, 51.5], originColor: '#c026d3', destColor: '#6366f1', wave: 4, branch: 'main', era: 'c. 1600 CE', eraYearCE: 1600, isPrimary: true }
      ],
      stops: [
        {
          id: 'zer_ind', iso3: 'IND', country: 'India (Gwalior / Ujjain)',
          lat: 26.2, lng: 78.1, word: 'śūnya',
          nativeScript: 'शून्य (०)', phonetic: 'SHOON-yah', branch: 'main', era: 'Brahmagupta (628 CE)', color: '#f59e0b',
          note: 'Indian mathematician Brahmagupta defined arithmetic rules for *śūnya* (“void/nothingness”); Gwalior Temple hosts an inscribed 876 CE zero.'
        },
        {
          id: 'zer_irq', iso3: 'IRQ', country: 'Iraq (Baghdad)',
          lat: 33.3, lng: 44.4, word: 'ṣifr',
          nativeScript: 'صِفْر (٠)', phonetic: 'SIFFR', branch: 'main', era: 'al-Khwārizmī (c. 820 CE)', color: '#eab308',
          note: 'Translated literally into Arabic as *ṣifr* (“empty”) at Baghdad’s House of Wisdom by al-Khwārizmī (whose own name gave us *algorithm*!).'
        },
        {
          id: 'zer_dza', iso3: 'DZA', country: 'Algeria (Béjaïa)',
          lat: 36.7, lng: 5.0, word: 'ṣifr → zephirum',
          nativeScript: 'صِفْر', phonetic: 'SIFFR', branch: 'main', era: '1190s CE', color: '#22c55e',
          note: 'Young Leonardo of Pisa (Fibonacci) studied Hindu-Arabic numerals from North African teachers in Béjaïa!'
        },
        {
          id: 'zer_ita', iso3: 'ITA', country: 'Italy (Pisa)',
          lat: 43.7, lng: 10.4, word: 'zero (from zephirum)',
          nativeScript: 'zero', phonetic: 'DZEH-roh', branch: 'main', era: '1202 CE', color: '#38bdf8',
          note: 'Fibonacci Latinized *ṣifr* as *zephirum*, which Venetian Italian shortened through *zefiro* → *zevero* → *zero*!'
        },
        {
          id: 'zer_esp', iso3: 'ESP', country: 'Spain (Toledo)',
          lat: 39.9, lng: -4.0, word: 'cero / cifra',
          nativeScript: 'cero / cifra', phonetic: 'THEH-roh / THEE-frah', branch: 'main', era: '12th–15th c.', color: '#e11d48',
          note: 'Toledo translators separately rendered *ṣifr* as Latin *cifra* (“digit/secret code”), creating Spanish *cifra*, French *chiffre*, and English *cipher*!'
        }
      ]
    },

    mother: {
      id: 'mother',
      label: 'Mother / Mama',
      subtitle: 'Universal Bilabial “M” vs. Georgian Twist',
      etymon: '*(mā) / *méh₂tēr (Indo-European) & Babbling Physics',
      originHub: 'Cross-Family Infant Phonology',
      color: '#e11d48',
      camera: { lat: 38, lng: 35, altitude: 2.35 },
      summary:
        'Why do unrelated languages across continents call mothers *mā*, *mama*, *umma*, *ammā*, or *mère*? Linguist Roman Jakobson showed bilabial nasals (/m/, /a/) are the easiest first infant sounds — EXCEPT famously in Georgian, where *deda* means mother and *mama* means father!',
      branches: [
        { id: 'main', label: 'Universal *ma- / *māter Convergence & Linguistic Surprises', color: '#e11d48' }
      ],
      corridors: [
        { from: [46.5, 48.0], to: [12.5, 41.9], originColor: '#e11d48', destColor: '#c026d3', wave: 1, branch: 'main', era: 'c. 2500 BCE', eraYearCE: -2500, isPrimary: true },
        { from: [46.5, 48.0], to: [77.2, 28.6], originColor: '#e11d48', destColor: '#f59e0b', wave: 1, branch: 'main', era: 'c. 1800 BCE', eraYearCE: -1800, isPrimary: true },
        { from: [46.5, 48.0], to: [51.4, 35.7], originColor: '#e11d48', destColor: '#14b8a6', wave: 1, branch: 'main', era: 'c. 1500 BCE', eraYearCE: -1500, isPrimary: false },
        { from: [46.5, 48.0], to: [37.6, 55.7], originColor: '#e11d48', destColor: '#6366f1', wave: 2, branch: 'main', era: 'c. 500 CE', eraYearCE: 500, isPrimary: true },
        { from: [12.5, 41.9], to: [-3.7, 40.4], originColor: '#c026d3', destColor: '#f43f5e', wave: 2, branch: 'main', era: 'Roman Era', eraYearCE: 100, isPrimary: false },
        { from: [44.0, 42.1], to: [44.8, 41.7], originColor: '#ec4899', destColor: '#ec4899', wave: 1, branch: 'main', era: 'Kartvelian Twist', eraYearCE: -2000, isPrimary: false }
      ],
      stops: [
        {
          id: 'mom_ind', iso3: 'IND', country: 'India',
          lat: 28.6, lng: 77.2, word: 'mātā / ammā',
          nativeScript: 'माँ / अम्मा', phonetic: 'mahn / ahm-MAH', branch: 'main', era: 'Sanskrit & Dravidian', color: '#f59e0b',
          note: 'North India’s Indo-Aryan *mā/mātā* meets South India’s completely unrelated Dravidian *ammā*!'
        },
        {
          id: 'mom_chn', iso3: 'CHN', country: 'China',
          lat: 39.9, lng: 116.4, word: 'māma / mǔqīn',
          nativeScript: '妈妈 (母親)', phonetic: 'MAH-mah', branch: 'main', era: 'Independent Sino-Tibetan', color: '#dc2626',
          note: 'Zero historical connection to Indo-European *māter*, yet *māma* converged independently through infant phonetics.'
        },
        {
          id: 'mom_ken', iso3: 'KEN', country: 'Kenya & East Africa',
          lat: -1.3, lng: 36.8, word: 'mama',
          nativeScript: 'mama', phonetic: 'MAH-mah', branch: 'main', era: 'Bantu Convergence', color: '#16a34a',
          note: 'Swahili *mama* arose organically within Niger-Congo Bantu languages — echoing global sound symbolism.'
        },
        {
          id: 'mom_geo', iso3: 'GEO', country: 'Georgia (Famous Inversion!)',
          lat: 41.7, lng: 44.8, word: 'deda (Mother) / mama (Father!)',
          nativeScript: 'დედა (Mother) · მამა (Father!)', phonetic: 'DEH-dah', branch: 'main', era: 'Ancient Kartvelian', color: '#ec4899',
          note: 'The globe’s classic linguistic plot twist! In Georgian, *deda* = mother, *mama* = father, and *papa* = grandfather!'
        },
        {
          id: 'mom_ita', iso3: 'ITA', country: 'Italy',
          lat: 41.9, lng: 12.5, word: 'madre / mamma',
          nativeScript: 'madre / mamma', phonetic: 'MAH-dreh', branch: 'main', era: 'Latin *māter*', color: '#e879f9',
          note: 'Latin *māter* directly yielded Spanish *madre*, French *mère*, Portuguese *mãe*, and Romanian *mamă*.'
        },
        {
          id: 'mom_rus', iso3: 'RUS', country: 'Russia',
          lat: 55.7, lng: 37.6, word: 'mat’ / mama',
          nativeScript: 'мать / мама', phonetic: 'maht’ / MAH-mah', branch: 'main', era: 'Proto-Slavic *mati', color: '#4f46e5',
          note: 'Cognate with Sanskrit *mātṛ*, Greek *mḗtēr*, and English *mother* from Proto-Indo-European *méh₂tēr.'
        }
      ]
    }
  };
})(window);

