// data/origins.js - Historically & Linguistically Accurate Language Family Origin & Migration Data for Earthlingo

(function () {
  'use strict';

  // Canonical scholarly Urheimat (homeland) & intermediate migration hub coordinates [lng, lat]
  const HUBS = {
    // Homeland centers
    PIE_STEPPE: [46.5, 48.0],        // Pontic-Caspian Steppe (Yamnaya horizon)
    ANATOLIA: [33.0, 39.0],          // Central Anatolia
    BALKANS: [22.5, 40.8],           // Northern Greece / Balkans
    ITALY_ROME: [12.5, 41.9],        // Italian Peninsula / Latium
    CENTRAL_EUR_GER: [10.5, 52.5],   // North German Plain / Jutland-Elbe
    BRITAIN: [-1.8, 52.8],           // Great Britain
    IRELAND: [-7.8, 53.3],           // Ireland
    IBERIA: [-4.0, 40.3],            // Iberian Peninsula
    PORTUGAL: [-8.0, 39.6],          // Western Iberia / Lusitania
    FRANCE: [2.2, 46.5],             // Gaul / France
    SCANDINAVIA: [15.0, 60.0],       // Southern Scandinavia
    PRIPYAT_SLAV: [27.5, 52.0],      // Pripyat-Dnieper forest zone (Proto-Slavic)
    BALTIC_HOMELAND: [24.8, 55.8],   // Eastern Baltic Corded-Ware horizon
    MOSCOW_RUS: [37.6, 55.7],        // Upper Volga / Muscovy
    SIBERIA_RUS: [104.3, 52.3],      // Lake Baikal / Eastern Siberia
    CA_STEPPE: [63.5, 41.5],         // Andronovo / BMAC Indo-Iranian corridor
    IRAN_PLATEAU: [53.0, 32.5],      // Iranian Plateau
    PUNJAB_INDIA: [76.2, 29.5],      // Sapta Sindhu / Upper Indo-Gangetic Plain
    SOUTH_INDIA: [78.4, 13.0],       // Peninsular Dravidian heartland
    ARMENIA_HIGH: [44.5, 40.2],      // Armenian Highlands
    CAUCASUS_GEO: [44.0, 42.1],      // South Caucasus / Kartvelian homeland

    // Afroasiatic & Semitic
    LEVANT_CORE: [35.5, 31.8],       // Southern Levant / Fertile Crescent
    MESOPOTAMIA: [44.4, 33.3],       // Tigris-Euphrates
    HEJAZ_ARABIA: [40.0, 23.0],      // Arabian Peninsula
    SOUTH_ARABIA: [45.0, 15.3],      // Ancient South Arabia / Yemen
    EGYPT_NILE: [31.2, 30.0],        // Nile Valley
    MAGHREB: [-4.5, 33.0],           // Atlas / North Africa Amazigh & Arabic
    HORN_AFRICA: [42.0, 9.0],        // Cushitic / Ethio-Semitic highlands
    CHADIC_BASIN: [14.0, 12.0],      // Lake Chad Afroasiatic west branch

    // Niger-Congo & Bantu
    CAMEROON_BANTU: [10.2, 6.2],     // Cross River / Cameroon-Nigeria Grassfields
    WEST_AFRICA_NC: [-3.5, 11.5],    // Upper Niger / Mande-Atlantic core
    CONGO_STREAM: [14.5, -1.5],      // Western Bantu Congo Basin
    GREAT_LAKES: [31.5, 0.5],        // Eastern Bantu Great Lakes hub
    SWAHILI_COAST: [39.5, -5.0],     // East African Coast
    ZAMBEZI_HUB: [28.0, -16.5],      // Zambezi-Savanna corridor
    SOUTH_AFRICA: [25.0, -29.0],     // Southern African Bantu/convergence

    // Uralic
    URALS_HOME: [60.0, 58.0],        // Southern/Central Urals & Ob-Irtysh
    VOLGA_KAMA: [52.5, 57.5],        // Volga-Kama Finno-Permic hub
    BALTIC_FINNIC: [25.5, 61.0],     // Gulf of Finland (Finnic)
    ARCTIC_SAMOYED: [78.0, 67.0],    // West Siberian tundra
    ETELKOZ_STEPPE: [32.0, 47.5],    // Pontic Steppe Magyar staging
    CARPATHIAN_HUN: [19.5, 47.2],    // Carpathian Basin

    // Turkic & Mongolic (independent primary families)
    ALTAI_ORKHON: [102.8, 47.5],     // Orkhon Valley / Altai Eastern Steppe
    TIANSHAN_CA: [69.0, 41.3],       // Tianshan / Transoxiana Karluk hub
    KAZAKH_KIPCHAK: [67.0, 49.0],    // Desht-i Qipchaq / Kazakh Steppe
    LENA_SAKHA: [129.7, 62.0],       // Lena Basin (Yakut/Sakha)
    AZERBAIJAN_OGHUZ: [47.5, 40.3],  // Arran / Azerbaijan Oghuz corridor
    ANATOLIA_TURK: [35.2, 39.0],     // Anatolian Oghuz Turkish
    MONGOL_EAST: [110.0, 48.0],      // Onon-Kerulen Eastern Steppe (Mongolic)

    // East & Southeast Asia
    YELLOW_RIVER: [106.5, 35.5],     // Middle-Upper Yellow River (Sino-Tibetan)
    NORTH_CHINA: [116.4, 39.9],      // North China Plain
    LINGNAN_SOUTH: [113.3, 23.1],    // Lingnan / Pearl River
    FUJIAN_SEA: [118.2, 24.6],       // Min / Hakka coast
    TIBET_PLATEAU: [91.1, 29.6],     // Tibetan Plateau
    MYANMAR_CORE: [96.1, 19.7],      // Irrawaddy Valley
    RED_RIVER_VNM: [105.8, 21.0],    // Red River / Northern Vietnam
    MEKONG_KHMER: [104.9, 12.5],     // Mekong Valley / Cambodia
    MUNDA_INDIA: [85.3, 22.8],       // Chota Nagpur (Austroasiatic Munda)
    GUANGXI_KRA: [108.3, 23.5],      // Guangxi / Guizhou (Kra-Dai Urheimat)
    CHAO_PHRAYA: [100.5, 14.5],      // Thailand / Chao Phraya
    MANCHURIA_KOR: [125.0, 41.5],    // Liaodong-Korean corridor
    KOREA_PEN: [127.5, 36.5],        // Korean Peninsula
    KYUSHU_JPN: [130.7, 32.8],       // Northern Kyushu / Western Japan (Yayoi arrival)
    TOKYO_JPN: [139.7, 35.7],        // Japanese Archipelago

    // Austronesian & Oceania
    TAIWAN_HOME: [121.0, 23.7],      // Taiwan (Formosan Urheimat)
    LUZON_PHL: [121.5, 16.5],        // Northern Philippines
    SULAWESI_ISEA: [118.5, 0.5],     // Borneo / Sulawesi Maritime hub
    BORNEO_BARITO: [114.8, -2.5],    // Southeast Borneo (Barito -> Madagascar)
    MALAY_JAVA: [104.0, 1.5],        // Malay Peninsula & Sumatra/Java
    MADAGASCAR: [47.5, -19.0],       // Madagascar Highlands (Malagasy)
    LAPITA_BISMARCK: [151.0, -4.5],  // Bismarck Archipelago (Lapita horizon)
    NEW_GUINEA: [144.0, -6.0],       // New Guinea Highlands (Sahul ~45,000+ BP)
    FIJI_SAMOA: [-174.5, -16.5],     // Central Polynesia / Tonga-Samoa-Fiji
    SOCIETY_TAHITI: [-149.4, -17.6], // East Polynesian voyaging hub
    HAWAII: [-155.5, 20.0],          // Hawai'i
    RAPA_NUI: [-109.3, -27.1],       // Easter Island / Rapa Nui
    AOTEAROA_NZ: [174.8, -41.0],     // New Zealand / Aotearoa

    // Americas & Arctic
    BERINGIA_ALASKA: [-163.5, 65.5], // Bering Strait / Thule Arctic origin
    ARCTIC_CANADA: [-95.0, 69.5],    // Canadian High Arctic
    GREENLAND: [-42.6, 71.7],        // Greenland (Kalaallisut)
    SONORA_MESO: [-104.5, 23.5],     // NW Mexico / Uto-Aztecan-Mesoamerican
    MEXICO_BASIN: [-99.1, 19.4],     // Central Mexico
    ANDES_CUSCO: [-71.9, -13.5],     // Andean Quechua/Aymara highland center
    SW_AMAZON: [-63.5, -9.5],        // Proto-Tupian Madeira-Guaporé homeland
    BRAZIL_COAST: [-47.9, -15.8],    // Eastern South America
    RIO_PLATA: [-60.0, -34.0],       // Southern Cone / Río de la Plata
    NORTH_AMERICA: [-98.5, 39.5],    // Continental North America
    AUSTRALIA: [134.0, -25.0]        // Australia
  };

  // Selectable interactive dispersal corridors for the globe explorer overlay
  const corridors = {
    all: {
      id: 'all',
      title: 'Global Language Family Dispersals',
      shortLabel: 'All Major',
      color: '#38bdf8',
      accentColor: '#f59e0b',
      camera: { lat: 22, lng: 28, altitude: 2.55 },
      homeland: 'Multiple Independent Agricultural, Pastoral & Maritime Hearths',
      timeframe: 'c. 10,000 BCE → Modern Era',
      mechanism: 'Bronze-Age steppe mobility, Neolithic farming, Iron-Age metallurgy, outrigger navigation, & early modern maritime empires',
      branches: 'Indo-European, Austronesian, Bantu (Niger-Congo), Afroasiatic, Sino-Tibetan, Turkic, Uralic, Austroasiatic & Kra-Dai',
      summary: 'Earth\'s ~7,100 living languages trace back to independent ancient homelands (Urheimats) rather than one single point of origin. Select any family tab below—or click any country on the globe—to animate its chronological divergence paths and ancestral stages.',
      scholarshipNote: 'Consensus linguistic geography pairs shared basic vocabulary (cognates), systematic sound correspondences, archaeogenetics (ancient DNA), and paleoecology. Major Eurasian families such as Indo-European, Uralic, Turkic, Mongolic, Japonic, and Koreanic remain separate proven families.',
      stages: [
        { era: 'c. 8000–3000 BCE', label: 'Primary Neolithic farming & maritime hearths form across Fertile Crescent/NE Africa, Yellow River, Taiwan, & West/Central Africa' },
        { era: 'c. 4000–1000 BCE', label: 'Pontic-Caspian Steppe (Yamnaya), Austronesian Lapita, Uralic forest-steppe, & Bantu dispersals reshape four continents' },
        { era: '1st Mil. BCE – 1400 CE', label: 'Semitic, Turkic Steppe, Polynesians to NZ/Rapa Nui/Hawaiʻi, Thule Arctic Inuit, & Magyar steppe migrations' },
        { era: '1500 CE – Present', label: 'European oceanic expansion spreads Romance & Germanic globally, creating New World creoles alongside surviving indigenous tongues' }
      ],
      nodes: [
        { pt: HUBS.PIE_STEPPE, label: 'Pontic Steppe (Indo-European)', color: '#f59e0b', radius: 5.5 },
        { pt: HUBS.TAIWAN_HOME, label: 'Taiwan (Austronesian)', color: '#10b981', radius: 5.0 },
        { pt: HUBS.CAMEROON_BANTU, label: 'Cameroon-Nigeria (Bantu)', color: '#16a34a', radius: 5.0 },
        { pt: HUBS.LEVANT_CORE, label: 'Levant / Red Sea (Semitic)', color: '#eab308', radius: 4.8 },
        { pt: HUBS.YELLOW_RIVER, label: 'Yellow River (Sino-Tibetan)', color: '#ef4444', radius: 5.0 },
        { pt: HUBS.ALTAI_ORKHON, label: 'Altai-Orkhon (Turkic)', color: '#a855f7', radius: 4.8 },
        { pt: HUBS.URALS_HOME, label: 'Southern Urals (Uralic)', color: '#38bdf8', radius: 4.5 }
      ],
      routes: [
        // Indo-European
        { from: HUBS.PIE_STEPPE, to: HUBS.ITALY_ROME, wave: 1, originColor: '#f59e0b', color: '#e11d48', label: 'PIE → Italic (c. 2500–1200 BCE)' },
        { from: HUBS.PIE_STEPPE, to: HUBS.CENTRAL_EUR_GER, wave: 1, originColor: '#f59e0b', color: '#0284c7', label: 'PIE → Germanic (c. 2800–1000 BCE)' },
        { from: HUBS.PIE_STEPPE, to: HUBS.CA_STEPPE, wave: 1, originColor: '#f59e0b', color: '#f97316', label: 'PIE → Indo-Iranian (c. 2100–1800 BCE)' },
        { from: HUBS.CA_STEPPE, to: HUBS.PUNJAB_INDIA, wave: 2, originColor: '#f97316', color: '#f59e0b', label: 'Indo-Aryan → India (c. 1500 BCE)' },
        { from: HUBS.IBERIA, to: HUBS.MEXICO_BASIN, wave: 3, originColor: '#e11d48', color: '#fb7185', label: 'Spanish → Mesoamerica (16th c. CE)' },
        { from: HUBS.PORTUGAL, to: HUBS.BRAZIL_COAST, wave: 3, originColor: '#f43f5e', color: '#fda4af', label: 'Portuguese → Brazil (16th c. CE)' },
        { from: HUBS.BRITAIN, to: HUBS.NORTH_AMERICA, wave: 3, originColor: '#0284c7', color: '#38bdf8', label: 'English → North America (17th c. CE)' },
        // Austronesian
        { from: HUBS.TAIWAN_HOME, to: HUBS.LUZON_PHL, wave: 1, originColor: '#10b981', color: '#34d399', label: 'Formosan → Philippines (c. 2200 BCE)' },
        { from: HUBS.BORNEO_BARITO, to: HUBS.MADAGASCAR, wave: 2, originColor: '#10b981', color: '#2dd4bf', label: 'Borneo → Madagascar (c. 500–800 CE)' },
        { from: HUBS.LAPITA_BISMARCK, to: HUBS.FIJI_SAMOA, wave: 2, originColor: '#34d399', color: '#06b6d4', label: 'Lapita → Polynesia (c. 900 BCE)' },
        { from: HUBS.SOCIETY_TAHITI, to: HUBS.AOTEAROA_NZ, wave: 3, originColor: '#06b6d4', color: '#67e8f9', label: 'East Polynesia → Aotearoa (c. 1250 CE)' },
        // Bantu
        { from: HUBS.CAMEROON_BANTU, to: HUBS.GREAT_LAKES, wave: 1, originColor: '#16a34a', color: '#4ade80', label: 'Bantu East Stream (c. 1000–500 BCE)' },
        { from: HUBS.GREAT_LAKES, to: HUBS.SOUTH_AFRICA, wave: 2, originColor: '#4ade80', color: '#22c55e', label: 'Bantu → Southern Africa (c. 300–500 CE)' },
        // Semitic / Arabic
        { from: HUBS.SOUTH_ARABIA, to: HUBS.HORN_AFRICA, wave: 1, originColor: '#eab308', color: '#facc15', label: 'Ethio-Semitic → Horn (c. 1st mil. BCE)' },
        { from: HUBS.HEJAZ_ARABIA, to: HUBS.MAGHREB, wave: 2, originColor: '#eab308', color: '#fde047', label: 'Arabic → Maghreb (7th–11th c. CE)' },
        // Turkic & Uralic
        { from: HUBS.ALTAI_ORKHON, to: HUBS.TIANSHAN_CA, wave: 1, originColor: '#a855f7', color: '#c084fc', label: 'Turkic → Transoxiana (6th–10th c. CE)' },
        { from: HUBS.AZERBAIJAN_OGHUZ, to: HUBS.ANATOLIA_TURK, wave: 2, originColor: '#c084fc', color: '#d8b4fe', label: 'Oghuz Seljuk → Anatolia (11th c. CE)' },
        { from: HUBS.URALS_HOME, to: HUBS.CARPATHIAN_HUN, wave: 2, originColor: '#38bdf8', color: '#7dd3fc', label: 'Magyar → Carpathian Basin (895 CE)' },
        // Sino-Tibetan
        { from: HUBS.YELLOW_RIVER, to: HUBS.TIBET_PLATEAU, wave: 1, originColor: '#ef4444', color: '#f87171', label: 'Sino-Tibetan → Tibet (c. 2500 BCE)' },
        { from: HUBS.YELLOW_RIVER, to: HUBS.LINGNAN_SOUTH, wave: 2, originColor: '#ef4444', color: '#fb7185', label: 'Sinitic → Southern China (1st mil. BCE)' }
      ]
    },

    'indo-european': {
      id: 'indo-european',
      title: 'Indo-European Dispersal (~4000 BCE → Present)',
      shortLabel: 'Indo-European',
      color: '#f59e0b',
      accentColor: '#38bdf8',
      camera: { lat: 42, lng: 35, altitude: 2.35 },
      homeland: 'Pontic–Caspian Steppe (Modern Southern Ukraine / SW Russia)',
      timeframe: 'c. 4000–2500 BCE (Primary Steppe Expansion) • 1500–1900 CE (Maritime Spread)',
      mechanism: 'Equine domestication, wheeled wagons, Yamnaya & Corded Ware/Andronovo steppe pastoralism; later Roman Imperial & Atlantic maritime empires',
      branches: 'Anatolian†, Tocharian†, Celtic, Germanic, Italic (Romance), Hellenic, Armenian, Albanian, Balto-Slavic, Indo-Iranian (Persian, Hindi, Bengali)',
      summary: 'Spoken natively by ~3.2 billion people—more than 40% of humanity—all Indo-European languages trace back to Proto-Indo-European (PIE) spoken on the Pontic–Caspian Steppe. Horse-riding pastoralism and wheeled vehicles enabled rapid divergence from Ireland to northern India.',
      scholarshipNote: 'Anatolian (Hittite) split earliest, possibly via a pre-Yamnaya Caucasus/Southern Arc vector around 4000–3500 BCE. Major sub-waves followed: Western Corded Ware (Germanic, Celtic, Italic, Balto-Slavic) and Eastern Sintashta/Andronovo charioteers (Indo-Iranian).',
      stages: [
        { era: 'c. 4200–3500 BCE', label: 'Indo-Anatolian split; early PIE spoken across Pontic–Caspian Steppe north of Black & Caspian seas' },
        { era: 'c. 3000–2000 BCE', label: 'Corded Ware & Bell Beaker horizons carry pre-Germanic, Celtic, Italic & Balto-Slavic across Europe' },
        { era: 'c. 2100–1500 BCE', label: 'Sintashta/Andronovo horizon carries Proto-Indo-Iranian across Central Asia into Iran & Punjab' },
        { era: '3rd c. BCE – 7th c. CE', label: 'Roman Vulgar Latin births Romance; Germanic & Slavic migrations reshape Europe' },
        { era: '1492 – 1900 CE', label: 'Iberian, British, French, Dutch & Russian expansions carry Indo-European to Americas, Africa & Oceania' }
      ],
      nodes: [
        { pt: HUBS.PIE_STEPPE, label: 'Pontic-Caspian Steppe Urheimat', color: '#f59e0b', radius: 6.0 },
        { pt: HUBS.CA_STEPPE, label: 'Sintashta / Central Asia Hub', color: '#fb923c', radius: 4.5 },
        { pt: HUBS.ITALY_ROME, label: 'Rome (Romance Diffusion)', color: '#e11d48', radius: 4.5 }
      ],
      routes: [
        { from: HUBS.PIE_STEPPE, to: HUBS.ANATOLIA, wave: 1, originColor: '#f59e0b', color: '#fbbf24', label: 'Anatolian Branch (c. 3500 BCE)' },
        { from: HUBS.PIE_STEPPE, to: HUBS.BALKANS, wave: 1, originColor: '#f59e0b', color: '#2563eb', label: 'Hellenic / Paleo-Balkan (c. 2200 BCE)' },
        { from: HUBS.PIE_STEPPE, to: HUBS.CENTRAL_EUR_GER, wave: 1, originColor: '#f59e0b', color: '#0284c7', label: 'Pre-Germanic & Celtic (c. 2800 BCE)' },
        { from: HUBS.PIE_STEPPE, to: HUBS.ITALY_ROME, wave: 1, originColor: '#f59e0b', color: '#e11d48', label: 'Proto-Italic (c. 2000–1200 BCE)' },
        { from: HUBS.PIE_STEPPE, to: HUBS.PRIPYAT_SLAV, wave: 1, originColor: '#f59e0b', color: '#6366f1', label: 'Balto-Slavic (c. 2000 BCE)' },
        { from: HUBS.PIE_STEPPE, to: HUBS.CA_STEPPE, wave: 1, originColor: '#f59e0b', color: '#f97316', label: 'Sintashta → Indo-Iranian (c. 2100 BCE)' },
        { from: HUBS.CA_STEPPE, to: HUBS.IRAN_PLATEAU, wave: 2, originColor: '#f97316', color: '#0d9488', label: 'Iranian Branch → Persia (c. 1000 BCE)' },
        { from: HUBS.CA_STEPPE, to: HUBS.PUNJAB_INDIA, wave: 2, originColor: '#f97316', color: '#f59e0b', label: 'Indo-Aryan → Punjab (c. 1500 BCE)' },
        { from: HUBS.ITALY_ROME, to: HUBS.IBERIA, wave: 2, originColor: '#e11d48', color: '#fb7185', label: 'Latin → Hispania (2nd c. BCE)' },
        { from: HUBS.ITALY_ROME, to: HUBS.FRANCE, wave: 2, originColor: '#e11d48', color: '#c026d3', label: 'Latin → Gaul (1st c. BCE)' },
        { from: HUBS.CENTRAL_EUR_GER, to: HUBS.BRITAIN, wave: 2, originColor: '#0284c7', color: '#38bdf8', label: 'Old English → Britain (5th c. CE)' },
        { from: HUBS.PRIPYAT_SLAV, to: HUBS.MOSCOW_RUS, wave: 2, originColor: '#6366f1', color: '#818cf8', label: 'East Slavic Expansion (6th–9th c. CE)' },
        { from: HUBS.IBERIA, to: HUBS.MEXICO_BASIN, wave: 3, originColor: '#e11d48', color: '#fb7185', label: 'Spanish → Americas (1519+ CE)' },
        { from: HUBS.PORTUGAL, to: HUBS.BRAZIL_COAST, wave: 3, originColor: '#f43f5e', color: '#fda4af', label: 'Portuguese → Brazil (1500+ CE)' },
        { from: HUBS.BRITAIN, to: HUBS.NORTH_AMERICA, wave: 3, originColor: '#0284c7', color: '#38bdf8', label: 'English → Americas (1607+ CE)' },
        { from: HUBS.BRITAIN, to: HUBS.AUSTRALIA, wave: 3, originColor: '#0284c7', color: '#7dd3fc', label: 'English → Australia (1788+ CE)' }
      ]
    },

    austronesian: {
      id: 'austronesian',
      title: 'Austronesian Out-of-Taiwan Voyaging',
      shortLabel: 'Austronesian',
      color: '#10b981',
      accentColor: '#22d3ee',
      camera: { lat: -5, lng: 145, altitude: 2.6 },
      homeland: 'Taiwan (Formosan Homeland — Out-of-Taiwan Model)',
      timeframe: 'c. 3000 BCE (Taiwan) → 900–1250 CE (Remote Polynesia)',
      mechanism: 'Outrigger & double-hulled voyaging canoes, celestial & swell navigation, Lapita pottery culture, & Austronesian rice/taro cultivation',
      branches: '9 primary Formosan branches (confined to Taiwan) + 1 Malayo-Polynesian branch (~1,200 languages across Philippines, Indonesia, Malay, Madagascar & Polynesia)',
      summary: 'Before European oceanic voyages, Austronesian navigators achieved the widest maritime language dispersal in human history—spanning over half the Earth\'s circumference from Madagascar off East Africa to Rapa Nui (Easter Island).',
      scholarshipNote: 'Nine of Austronesian\'s ten deepest phylogenetic subgroups survive exclusively among Indigenous peoples of Taiwan, confirming Taiwan as the homeland (~3000 BCE). Around 500–800 CE, Southeast Bornean (Barito) mariners sailed >7,000 km across the Indian Ocean to settle Madagascar.',
      stages: [
        { era: 'c. 3500–3000 BCE', label: 'Proto-Austronesian develops on Taiwan (ancestral connections to Fujian coastal Neolithic cultures)' },
        { era: 'c. 2200–1500 BCE', label: 'Malayo-Polynesian crosses Luzon Strait to Philippines, Sulawesi, Borneo & Mariana Islands (~3,500 km open ocean)' },
        { era: 'c. 1400–900 BCE', label: 'Lapita seafarers cross Near Oceania to Fiji, Tonga & Samoa (~3,000 km frontier leap)' },
        { era: 'c. 500–800 CE', label: 'Borneo Barito sailors cross the Indian Ocean to Madagascar, merging later with East African Bantu speakers' },
        { era: 'c. 900–1250 CE', label: 'East Polynesians settle Hawaiʻi, Rapa Nui, and Aotearoa (New Zealand)' }
      ],
      nodes: [
        { pt: HUBS.TAIWAN_HOME, label: 'Taiwan (Austronesian Homeland)', color: '#10b981', radius: 6.0 },
        { pt: HUBS.BORNEO_BARITO, label: 'Borneo / Barito Hub', color: '#14b8a6', radius: 4.5 },
        { pt: HUBS.LAPITA_BISMARCK, label: 'Lapita Horizon (Bismarck)', color: '#06b6d4', radius: 4.5 }
      ],
      routes: [
        { from: HUBS.TAIWAN_HOME, to: HUBS.LUZON_PHL, wave: 1, originColor: '#10b981', color: '#34d399', label: 'Formosan → Luzon (c. 2200 BCE)' },
        { from: HUBS.LUZON_PHL, to: HUBS.SULAWESI_ISEA, wave: 1, originColor: '#34d399', color: '#2dd4bf', label: 'Philippines → Sulawesi/Borneo (c. 1500 BCE)' },
        { from: HUBS.LUZON_PHL, to: [145.7, 15.2], wave: 1, originColor: '#34d399', color: '#22d3ee', label: 'Philippines → Marianas Open-Sea Leap (c. 1500 BCE)' },
        { from: HUBS.SULAWESI_ISEA, to: HUBS.MALAY_JAVA, wave: 2, originColor: '#2dd4bf', color: '#10b981', label: 'Malayic / Javanese Spread (c. 500 BCE)' },
        { from: HUBS.BORNEO_BARITO, to: HUBS.MADAGASCAR, wave: 2, originColor: '#10b981', color: '#14b8a6', label: 'Barito → Madagascar (c. 500–800 CE)' },
        { from: HUBS.SULAWESI_ISEA, to: HUBS.LAPITA_BISMARCK, wave: 2, originColor: '#2dd4bf', color: '#06b6d4', label: 'Lapita Voyagers → Near Oceania (c. 1400 BCE)' },
        { from: HUBS.LAPITA_BISMARCK, to: HUBS.FIJI_SAMOA, wave: 2, originColor: '#06b6d4', color: '#38bdf8', label: 'Fiji, Tonga & Samoa (c. 900 BCE)' },
        { from: HUBS.FIJI_SAMOA, to: HUBS.SOCIETY_TAHITI, wave: 3, originColor: '#38bdf8', color: '#60a5fa', label: 'Central → East Polynesia (c. 900 CE)' },
        { from: HUBS.SOCIETY_TAHITI, to: HUBS.HAWAII, wave: 3, originColor: '#60a5fa', color: '#93c5fd', label: 'Tahiti → Hawaiʻi (c. 1000 CE)' },
        { from: HUBS.SOCIETY_TAHITI, to: HUBS.RAPA_NUI, wave: 3, originColor: '#60a5fa', color: '#7dd3fc', label: 'Eastern Polynesia → Rapa Nui (c. 1200 CE)' },
        { from: HUBS.SOCIETY_TAHITI, to: HUBS.AOTEAROA_NZ, wave: 3, originColor: '#60a5fa', color: '#a5f3fc', label: 'East Polynesia → Aotearoa/NZ (c. 1250 CE)' }
      ]
    },

    bantu: {
      id: 'bantu',
      title: 'Niger-Congo & The Bantu Expansion',
      shortLabel: 'Bantu / Niger-Congo',
      color: '#16a34a',
      accentColor: '#86efac',
      camera: { lat: -6, lng: 24, altitude: 2.15 },
      homeland: 'Cameroon–Nigeria Borderlands (Cross River / Grassfields)',
      timeframe: 'c. 3000 BCE (Early Split) • c. 1000 BCE–500 CE (Continental Expansion)',
      mechanism: 'Yam/oil-palm & pearl-millet cultivation paired with early iron-smelting technology across forest rivers and savanna corridors',
      branches: '~500+ closely related Bantu languages (Swahili, Zulu, Xhosa, Shona, Lingala, Kikuyu, Luganda, Kinyarwanda, Kirundi)',
      summary: 'Originating in the Cameroon–Nigeria borderlands within the vast Niger-Congo macro-family, Bantu-speaking farmers expanded in western and eastern streams across nearly all of Central, East, and Southern Africa over 3,000 years.',
      scholarshipNote: 'Despite covering over 9 million km², Bantu languages remain remarkably close lexically and structurally (rich noun-class prefix systems), confirming rapid expansion. On the East African coast, Bantu grammar fused with maritime Arabic loanwords to produce Swahili (from ~8th–10th c. CE).',
      stages: [
        { era: 'c. 3000–2000 BCE', label: 'Early Bantu separates from Southern Bantoid in Cameroon–Nigeria borderlands' },
        { era: 'c. 1500–500 BCE', label: 'Western stream follows Sangha/Congo rivers southward; Eastern stream curves north of rainforest toward Lake Victoria' },
        { era: 'c. 500 BCE – 300 CE', label: 'Urewe iron-working farming spreads rapidly through East Africa & Lake Tanganyika' },
        { era: 'c. 300 – 1000 CE', label: 'Bantu reaches Southern Africa & coastal Indian Ocean trading towns (early Swahili)' }
      ],
      nodes: [
        { pt: HUBS.CAMEROON_BANTU, label: 'Cameroon-Nigeria Homeland', color: '#16a34a', radius: 6.0 },
        { pt: HUBS.WEST_AFRICA_NC, label: 'West African Niger-Congo Core', color: '#22c55e', radius: 4.5 },
        { pt: HUBS.GREAT_LAKES, label: 'Great Lakes Eastern Staging Hub', color: '#4ade80', radius: 4.8 }
      ],
      routes: [
        { from: HUBS.CAMEROON_BANTU, to: HUBS.WEST_AFRICA_NC, wave: 1, originColor: '#16a34a', color: '#22c55e', label: 'Niger-Congo Continuum (Ancient Split)' },
        { from: HUBS.CAMEROON_BANTU, to: HUBS.CONGO_STREAM, wave: 1, originColor: '#16a34a', color: '#4ade80', label: 'Western Bantu Forest Stream (c. 1000 BCE)' },
        { from: HUBS.CAMEROON_BANTU, to: HUBS.GREAT_LAKES, wave: 1, originColor: '#16a34a', color: '#86efac', label: 'Eastern Bantu Around Rainforest (c. 800 BCE)' },
        { from: HUBS.CONGO_STREAM, to: [17.5, -11.2], wave: 2, originColor: '#4ade80', color: '#34d399', label: 'West-Central → Angola (c. 500 BCE–300 CE)' },
        { from: HUBS.GREAT_LAKES, to: HUBS.SWAHILI_COAST, wave: 2, originColor: '#86efac', color: '#10b981', label: 'Bantu → Swahili Coast (1st mil. CE)' },
        { from: HUBS.GREAT_LAKES, to: HUBS.ZAMBEZI_HUB, wave: 2, originColor: '#86efac', color: '#22c55e', label: 'Eastern Stream → Zambezi (c. 200 CE)' },
        { from: HUBS.ZAMBEZI_HUB, to: HUBS.SOUTH_AFRICA, wave: 3, originColor: '#22c55e', color: '#4ade80', label: 'Nguni/Sotho → Southern Africa (c. 400+ CE)' }
      ]
    },

    afroasiatic: {
      id: 'afroasiatic',
      title: 'Afroasiatic & Semitic Expansions',
      shortLabel: 'Afroasiatic',
      color: '#eab308',
      accentColor: '#fde047',
      camera: { lat: 21, lng: 28, altitude: 2.3 },
      homeland: 'Northeast Africa / Southern Levant Corridor (Multi-Branch Depth)',
      timeframe: 'c. 10,000–6,000 BCE (Afroasiatic) • c. 3800 BCE (Semitic) • 7th–11th c. CE (Arabic)',
      mechanism: 'Deep Epipaleolithic/Neolithic pastoralism; Bronze-Age Semitic scribal states & Red Sea crossings; medieval Arab-Islamic caliphates & Banu Hilal migrations',
      branches: 'Semitic (Arabic, Hebrew, Amharic, Tigrinya, Aramaic, Maltese), Egyptian† (Coptic), Amazigh (Berber), Cushitic (Somali, Oromo), Chadic (Hausa), Omotic',
      summary: 'Afroasiatic is one of the world\'s oldest documented families, uniting Ancient Egyptian, Semitic, Amazigh (Berber), Cushitic (Somali/Oromo), and Chadic (Hausa). Most deep branch diversity concentrates in Northeast Africa, while Semitic diversified out of the Levant/Fertile Crescent and Arabia.',
      scholarshipNote: 'Proto-Semitic (~3800 BCE) expanded across Mesopotamia (Akkadian), the Levant (Hebrew/Phoenician/Aramaic), and crossed the Red Sea into Ethiopia/Eritrea (~1st millennium BCE). Much later (7th–11th c. CE), Arabic expanded from the Arabian Peninsula across North Africa alongside Amazigh.',
      stages: [
        { era: 'c. 10,000–6000 BCE', label: 'Proto-Afroasiatic splits into Egyptian, Cushitic, Omotic, Amazigh, Chadic, & pre-Semitic (NE Africa / Levant)' },
        { era: 'c. 3800–1200 BCE', label: 'Proto-Semitic spreads across Levant & Mesopotamia (Akkadian); Phoenician & Aramaic trade networks flourish' },
        { era: 'c. 1st Mil. BCE', label: 'Ancient South Arabian speakers cross Red Sea to Eritrea/Ethiopia, birthing Geʻez, Amharic & Tigrinya' },
        { era: '7th–11th c. CE', label: 'Arabic spreads from Arabia across Levant, Egypt, Maghreb, Sudan, & 9th-c. Sicily/Malta (Maltese)' }
      ],
      nodes: [
        { pt: HUBS.LEVANT_CORE, label: 'Levant / Semitic Hearth', color: '#eab308', radius: 5.5 },
        { pt: HUBS.HEJAZ_ARABIA, label: 'Arabian Peninsula (Arabic Spread)', color: '#facc15', radius: 5.0 },
        { pt: HUBS.HORN_AFRICA, label: 'Horn of Africa (Cushitic & Ethio-Semitic)', color: '#f59e0b', radius: 4.8 }
      ],
      routes: [
        { from: HUBS.EGYPT_NILE, to: HUBS.MAGHREB, wave: 1, originColor: '#ca8a04', color: '#eab308', label: 'Prehistoric Amazigh Across Sahara/Atlas' },
        { from: HUBS.EGYPT_NILE, to: HUBS.CHADIC_BASIN, wave: 1, originColor: '#ca8a04', color: '#f59e0b', label: 'Chadic Branch → Lake Chad (c. 4000 BCE)' },
        { from: HUBS.LEVANT_CORE, to: HUBS.MESOPOTAMIA, wave: 1, originColor: '#eab308', color: '#fde047', label: 'East Semitic / Akkadian (c. 3000 BCE)' },
        { from: HUBS.LEVANT_CORE, to: HUBS.SOUTH_ARABIA, wave: 1, originColor: '#eab308', color: '#facc15', label: 'South Semitic → Yemen/Arabia (c. 2nd mil. BCE)' },
        { from: HUBS.SOUTH_ARABIA, to: HUBS.HORN_AFRICA, wave: 2, originColor: '#facc15', color: '#fb923c', label: 'Ethio-Semitic Across Red Sea (c. 1st mil. BCE)' },
        { from: HUBS.HEJAZ_ARABIA, to: HUBS.EGYPT_NILE, wave: 2, originColor: '#eab308', color: '#fde047', label: 'Arabic → Egypt (7th c. CE)' },
        { from: HUBS.EGYPT_NILE, to: [32.5, 15.6], wave: 2, originColor: '#fde047', color: '#fef08a', label: 'Arabic → Sudan along Nile' },
        { from: HUBS.EGYPT_NILE, to: HUBS.MAGHREB, wave: 3, originColor: '#fde047', color: '#fef08a', label: 'Arabic & Banu Hilal → Maghreb (7th–11th c. CE)' },
        { from: [10.2, 36.8], to: [14.4, 35.9], wave: 3, originColor: '#fde047', color: '#38bdf8', label: 'Siculo-Arabic → Maltese (9th–11th c. CE)' }
      ]
    },

    turkic: {
      id: 'turkic',
      title: 'Turkic Steppe Dispersal (~500 BCE → 1500 CE)',
      shortLabel: 'Turkic',
      color: '#a855f7',
      accentColor: '#e879f9',
      camera: { lat: 46, lng: 74, altitude: 2.35 },
      homeland: 'Eastern Eurasian Steppe (Altai–Sayan & Orkhon Valley, Mongolia)',
      timeframe: 'c. 500 BCE–600 CE (Eastern Steppe) • 8th–14th c. CE (Central Asia & Anatolia)',
      mechanism: 'Nomadic cavalry confederations (Xiongnu, Rouran, Göktürk Khaganates), Silk Road oases, & Oghuz Seljuk migration',
      branches: 'Oghuz (Turkish, Azerbaijani, Turkmen), Kipchak (Kazakh, Kyrgyz, Tatar), Karluk (Uzbek, Uyghur), Siberian (Sakha/Yakut, Tuvan), Oghur (Chuvash)',
      summary: 'Turkic peoples originated in the Eastern Eurasian Steppe (modern Mongolia and southern Siberia, where the oldest Old Turkic Orkhon runes were carved in the 8th century CE) before expanding westward across Central Asia to the Mediterranean and northeastward to the Arctic Lena River.',
      scholarshipNote: 'Mainstream historical linguistics classifies Turkic as an independent primary family—distinct from Mongolic and Tungusic. Similarities in vowel harmony and word order reflect long steppe contact (Sprachbund), not common descent from a proven "Altaic" ancestor.',
      stages: [
        { era: 'c. 500 BCE – 550 CE', label: 'Proto-Turkic homeland around Altai–Orkhon steppe; early Oghur westward movement toward Volga/Pontic steppes' },
        { era: '552 – 744 CE', label: 'First & Second Turkic Khaganates unify Eurasian steppe; Old Turkic Orkhon inscriptions (730s CE)' },
        { era: '8th – 11th c. CE', label: 'Karluk & Kipchak expansion across Transoxiana, Syr Darya, & Kazakh Steppe; Sakha moves north to Lena Basin' },
        { era: '11th – 13th c. CE', label: 'Oghuz Seljuk migration through Khorasan & Iran Turkifies Azerbaijan and Anatolia' }
      ],
      nodes: [
        { pt: HUBS.ALTAI_ORKHON, label: 'Altai-Orkhon Turkic Homeland', color: '#a855f7', radius: 6.0 },
        { pt: HUBS.TIANSHAN_CA, label: 'Transoxiana / Syr Darya Staging', color: '#c084fc', radius: 4.5 }
      ],
      routes: [
        { from: HUBS.ALTAI_ORKHON, to: HUBS.LENA_SAKHA, wave: 1, originColor: '#a855f7', color: '#d8b4fe', label: 'Siberian Turkic → Sakha / Lena Basin' },
        { from: HUBS.ALTAI_ORKHON, to: HUBS.KAZAKH_KIPCHAK, wave: 1, originColor: '#a855f7', color: '#c084fc', label: 'Kipchak Steppe Expansion (8th–11th c. CE)' },
        { from: HUBS.ALTAI_ORKHON, to: HUBS.TIANSHAN_CA, wave: 1, originColor: '#a855f7', color: '#e879f9', label: 'Karluk & Oghuz → Transoxiana (6th–10th c. CE)' },
        { from: HUBS.KAZAKH_KIPCHAK, to: [49.1, 55.8], wave: 2, originColor: '#c084fc', color: '#a855f7', label: 'Kipchak & Volga-Kama (Tatar / Bashkir)' },
        { from: HUBS.TIANSHAN_CA, to: [58.4, 38.9], wave: 2, originColor: '#e879f9', color: '#c084fc', label: 'Oghuz → Karakum / Turkmenistan (10th c. CE)' },
        { from: [58.4, 38.9], to: HUBS.AZERBAIJAN_OGHUZ, wave: 2, originColor: '#c084fc', color: '#9333ea', label: 'Seljuk Oghuz → Azerbaijan (11th c. CE)' },
        { from: HUBS.AZERBAIJAN_OGHUZ, to: HUBS.ANATOLIA_TURK, wave: 3, originColor: '#9333ea', color: '#e879f9', label: 'Anatolian Turkish (11th–14th c. CE)' }
      ]
    },

    'sino-tibetan': {
      id: 'sino-tibetan',
      title: 'Sino-Tibetan Yellow River Dispersal',
      shortLabel: 'Sino-Tibetan',
      color: '#ef4444',
      accentColor: '#fca5a5',
      camera: { lat: 30, lng: 105, altitude: 2.15 },
      homeland: 'Middle–Upper Yellow River Basin (Northern China, Yangshao / Majiayao Horizon)',
      timeframe: 'c. 4500–2500 BCE (Primary Split) • 1st Mil. BCE–Present (Southern & Tibetan Spread)',
      mechanism: 'Neolithic broomcorn & foxtail millet farming along the Yellow River, later imperial Qin–Han southern expansion & highland Tibetan pastoralism',
      branches: 'Sinitic (Mandarin, Cantonese/Yue, Min, Wu, Hakka) + Tibeto-Burman (~400 languages: Tibetan, Burmese, Dzongkha, Karen, Yi, Jingpho)',
      summary: 'Spoken by ~1.4 billion people, Sino-Tibetan unites Sinitic (Chinese languages) and Tibeto-Burman languages across East Asia and the Himalayas. Phylogenetic and archaeological studies align the family\'s core divergence with Neolithic millet agriculturalists in the middle–upper Yellow River basin.',
      scholarshipNote: 'After separating from Sinitic (~4500–3500 BCE), Tibeto-Burman branches spread westward onto the Tibetan Plateau and southward along Himalayan river gorges into Myanmar and Bhutan, while Sinitic expanded south of the Yangtze absorbing earlier Kra-Dai, Hmong-Mien, and Austroasiatic substrates.',
      stages: [
        { era: 'c. 4500–3500 BCE', label: 'Proto-Sino-Tibetan in middle–upper Yellow River basin splits into proto-Sinitic and proto-Tibeto-Burman' },
        { era: 'c. 3000–1500 BCE', label: 'Majiayao/millet-barley agro-pastoralists move southwest onto Tibetan Plateau and eastern Himalayan valleys' },
        { era: 'c. 1st Mil. BCE – 300 CE', label: 'Qin & Han expansions spread Sinitic languages across Yangtze & Lingnan southern coast' },
        { era: '17th c. CE – Modern', label: 'Min/Hakka settlement to Taiwan alongside Mandarin administrative spread; Southeast Asian Chinese diasporas' }
      ],
      nodes: [
        { pt: HUBS.YELLOW_RIVER, label: 'Yellow River Basin Urheimat', color: '#ef4444', radius: 6.0 },
        { pt: HUBS.TIBET_PLATEAU, label: 'Tibetan Plateau Dispersal', color: '#f87171', radius: 4.5 },
        { pt: HUBS.LINGNAN_SOUTH, label: 'Lingnan Southern Sinitic Hub', color: '#dc2626', radius: 4.5 }
      ],
      routes: [
        { from: HUBS.YELLOW_RIVER, to: HUBS.NORTH_CHINA, wave: 1, originColor: '#ef4444', color: '#f87171', label: 'Northern Sinitic / Mandarin (1st mil. BCE)' },
        { from: HUBS.YELLOW_RIVER, to: HUBS.TIBET_PLATEAU, wave: 1, originColor: '#ef4444', color: '#fb923c', label: 'Tibeto-Burman → Plateau (c. 2500 BCE)' },
        { from: HUBS.TIBET_PLATEAU, to: [89.6, 27.5], wave: 2, originColor: '#fb923c', color: '#f59e0b', label: 'Southern Tibetic → Bhutan / Sikkim' },
        { from: HUBS.YELLOW_RIVER, to: HUBS.MYANMAR_CORE, wave: 2, originColor: '#fb923c', color: '#ef4444', label: 'Lolo-Burmese → Myanmar (1st mil. BCE–9th c. CE)' },
        { from: HUBS.YELLOW_RIVER, to: HUBS.LINGNAN_SOUTH, wave: 2, originColor: '#ef4444', color: '#dc2626', label: 'Qin-Han Sinitic → Yue/Cantonese' },
        { from: HUBS.FUJIAN_SEA, to: HUBS.TAIWAN_HOME, wave: 3, originColor: '#dc2626', color: '#f43f5e', label: 'Hokkien/Hakka → Taiwan (17th c. CE)' },
        { from: HUBS.LINGNAN_SOUTH, to: [103.8, 1.35], wave: 3, originColor: '#dc2626', color: '#fda4af', label: 'Maritime Sinitic → Singapore (19th c. CE)' }
      ]
    },

    uralic: {
      id: 'uralic',
      title: 'Uralic Dispersal (Urals → Baltics & Danube)',
      shortLabel: 'Uralic',
      color: '#38bdf8',
      accentColor: '#7dd3fc',
      camera: { lat: 57, lng: 45, altitude: 2.25 },
      homeland: 'Central / Southern Urals & Ob–Irtysh Forest-Steppe',
      timeframe: 'c. 2500–1500 BCE (Proto-Uralic) • c. 895 CE (Magyar Arrival in Hungary)',
      mechanism: 'Taiga/forest-steppe riverine migrations (Bronze Age Seima-Turbino networks) & medieval steppe confederation (Hungarian Honfoglalás)',
      branches: 'Finnic (Finnish, Estonian, Karelian), Sámi, Permic, Mordvinic, Mari, Samoyedic (Nenets), & Ugric (Hungarian, Khanty, Mansi)',
      summary: 'Surrounded almost everywhere by Indo-European neighbors, Finnish, Estonian, and Hungarian belong to the independent Uralic family originating east of Europe near the Ural Mountains and Western Siberia.',
      scholarshipNote: 'Proto-Uralic (~2500 BCE) split early between Siberian Samoyedic and westward Finno-Ugric branches. The Magyars split from Khanty/Mansi relatives near the southern Urals and migrated west across the Pontic Steppe, settling Hungary\'s Carpathian Basin in 895 CE.',
      stages: [
        { era: 'c. 2500–1900 BCE', label: 'Proto-Uralic along Ural/Ob forest-steppe splits into Samoyedic (east) & Finno-Ugric (west)' },
        { era: 'c. 1500–500 BCE', label: 'Baltic-Finnic stream reaches Gulf of Finland, giving rise to Finnish, Estonian & Sámi' },
        { era: 'c. 500–850 CE', label: 'Magyar Ugric tribes migrate westward across Magna Hungaria, Levedia & Etelköz on the Pontic steppe' },
        { era: '895 CE', label: 'Magyar Confederation crosses Carpathians into Hungary, establishing Hungarian in Central Europe' }
      ],
      nodes: [
        { pt: HUBS.URALS_HOME, label: 'Southern Urals Homeland', color: '#38bdf8', radius: 6.0 },
        { pt: HUBS.VOLGA_KAMA, label: 'Volga-Kama Staging Hub', color: '#60a5fa', radius: 4.5 },
        { pt: HUBS.ETELKOZ_STEPPE, label: 'Etelköz Steppe Staging (9th c. CE)', color: '#7dd3fc', radius: 4.2 }
      ],
      routes: [
        { from: HUBS.URALS_HOME, to: HUBS.ARCTIC_SAMOYED, wave: 1, originColor: '#38bdf8', color: '#bae6fd', label: 'Samoyedic → Arctic Siberia' },
        { from: HUBS.URALS_HOME, to: HUBS.VOLGA_KAMA, wave: 1, originColor: '#38bdf8', color: '#60a5fa', label: 'Finno-Permic → Volga-Kama (c. 2000–1000 BCE)' },
        { from: HUBS.VOLGA_KAMA, to: HUBS.BALTIC_FINNIC, wave: 2, originColor: '#60a5fa', color: '#38bdf8', label: 'Finnic → Finland & Estonia (c. 1200–500 BCE)' },
        { from: HUBS.VOLGA_KAMA, to: [25.0, 69.0], wave: 2, originColor: '#60a5fa', color: '#7dd3fc', label: 'Sámi → Northern Fennoscandia' },
        { from: HUBS.URALS_HOME, to: HUBS.ETELKOZ_STEPPE, wave: 2, originColor: '#38bdf8', color: '#0ea5e9', label: 'Magyar Ugric Steppe Migration (c. 500–850 CE)' },
        { from: HUBS.ETELKOZ_STEPPE, to: HUBS.CARPATHIAN_HUN, wave: 3, originColor: '#0ea5e9', color: '#38bdf8', label: 'Honfoglalás → Hungary (895 CE)' }
      ]
    },

    'se-asia': {
      id: 'se-asia',
      title: 'Mainland SE Asia: Austroasiatic & Kra-Dai',
      shortLabel: 'SE Asia Families',
      color: '#84cc16',
      accentColor: '#c084fc',
      camera: { lat: 17, lng: 102, altitude: 1.95 },
      homeland: 'Red/Mekong River Basins (Austroasiatic) & Guangxi–Lingnan (Kra-Dai)',
      timeframe: 'c. 2500–1500 BCE (Austroasiatic) • 1st Mil. BCE–13th c. CE (Kra-Dai)',
      mechanism: 'Neolithic irrigated rice cultivation along major Southeast Asian river valleys and later Tai southward migration',
      branches: 'Austroasiatic (Vietnamese, Khmer, Mon, Munda, Khasi, Aslian) & Kra-Dai (Thai, Lao, Shan, Zhuang)',
      summary: 'Mainland Southeast Asia is home to two distinct independent primary language families: Austroasiatic—the region\'s deep Neolithic rice-farming substrate—and Kra-Dai, whose ancestors moved southward from southern China (Lingnan/Guangxi) over the first and second millennia CE.',
      scholarshipNote: 'Despite heavy shared vocabulary, Vietnamese is Austroasiatic (ancient Mon-Khmer relative, NOT Sinitic—Chinese loanwords reflect millennia of imperial & cultural contact) and Thai/Lao are Kra-Dai (related to Zhuang in Guangxi, NOT Austroasiatic or Sino-Tibetan).',
      stages: [
        { era: 'c. 2500–1500 BCE', label: 'Austroasiatic wet-rice cultivators spread along Red, Mekong, Salween & Ganges-Brahmaputra basins' },
        { era: 'c. 1st Mil. BCE', label: 'Proto-Kra-Dai spoken across Lingnan (Guangxi/Guangdong/Guizhou) in southern China' },
        { era: '1st – 13th c. CE', label: 'Tai peoples (Thai, Lao, Shan) migrate southwest along Red & Mekong valleys into modern Thailand & Laos' }
      ],
      nodes: [
        { pt: HUBS.RED_RIVER_VNM, label: 'Austroasiatic Riverine Hearth', color: '#84cc16', radius: 5.5 },
        { pt: HUBS.GUANGXI_KRA, label: 'Kra-Dai Lingnan Homeland', color: '#a855f7', radius: 5.5 }
      ],
      routes: [
        { from: HUBS.RED_RIVER_VNM, to: HUBS.MEKONG_KHMER, wave: 1, originColor: '#84cc16', color: '#4ade80', label: 'Austroasiatic → Khmer / Mekong (c. 2000 BCE)' },
        { from: HUBS.RED_RIVER_VNM, to: HUBS.MUNDA_INDIA, wave: 1, originColor: '#84cc16', color: '#a3e635', label: 'Austroasiatic → Munda / E. India (c. 2000–1500 BCE)' },
        { from: HUBS.MEKONG_KHMER, to: [102.0, 4.2], wave: 2, originColor: '#4ade80', color: '#84cc16', label: 'Aslian → Malay Peninsula Interior' },
        { from: HUBS.GUANGXI_KRA, to: [102.6, 18.0], wave: 2, originColor: '#a855f7', color: '#c084fc', label: 'Southwestern Tai → Laos (1st mil. CE)' },
        { from: [102.6, 18.0], to: HUBS.CHAO_PHRAYA, wave: 3, originColor: '#c084fc', color: '#d8b4fe', label: 'Thai → Chao Phraya Basin (10th–13th c. CE)' },
        { from: HUBS.GUANGXI_KRA, to: [97.5, 21.0], wave: 2, originColor: '#a855f7', color: '#e879f9', label: 'Shan → Upper Myanmar' }
      ]
    },

    americas: {
      id: 'americas',
      title: 'Indigenous Americas, Arctic & Post-1492',
      shortLabel: 'Americas & Arctic',
      color: '#f43f5e',
      accentColor: '#38bdf8',
      camera: { lat: 14, lng: -78, altitude: 2.55 },
      homeland: 'Pre-Columbian American Families + Thule Arctic + Atlantic Empires',
      timeframe: '>15,000 BP (Beringian Entry) • 1000–1300 CE (Inuit Thule) • 1492 CE–Present',
      mechanism: 'Deep Pleistocene entry across Beringia creating ~100+ indigenous families; rapid High Arctic Thule kayaks/sleds; post-1492 colonial & African diaspora creoles',
      branches: 'Quechuan, Tupian (Guaraní), Uto-Aztecan, Mayan, Na-Dené, Algic, Inuit-Yupik-Unangan, plus Spanish, Portuguese, English, French & Creoles',
      summary: 'Prior to 1492, the Americas hosted extraordinarily high linguistic diversity (~1,000+ languages across >100 independent families). Later, the Inuit–Yupik–Unangan Thule expansion crossed the High Arctic to Greenland (c. 1000–1300 CE), followed by European and African-descended creole arrivals.',
      scholarshipNote: 'Most surviving major indigenous national/regional languages—like Quechua (Andes), Aymara, Guaraní (Paraguay), and Nahuatl (Mexico)—derive from distinct regional expansions centered in the Andes, Amazonia, and Mesoamerica rather than one post-Columbian source.',
      stages: [
        { era: 'c. 15,000+ BP', label: 'Beringian & Pacific coastal dispersals seed diverse North, Meso- & South American primary language families' },
        { era: 'c. 1000 BCE – 1500 CE', label: 'Tupian-Guaraní, Quechuan (Andes), & Uto-Aztecan expansions span regional civilizations' },
        { era: 'c. 1000 – 1300 CE', label: 'Inuit–Yupik Thule migration sweeps from Alaska across Arctic Canada to Greenland' },
        { era: '1492 CE – Present', label: 'Spanish, Portuguese, English, French, & Atlantic Creoles reshape national demographics alongside enduring indigenous tongues' }
      ],
      nodes: [
        { pt: HUBS.BERINGIA_ALASKA, label: 'Beringia / Thule Arctic Hearth', color: '#38bdf8', radius: 5.5 },
        { pt: HUBS.ANDES_CUSCO, label: 'Andean Quechuan Heartland', color: '#f59e0b', radius: 4.8 },
        { pt: HUBS.SW_AMAZON, label: 'SW Amazonia (Proto-Tupian)', color: '#10b981', radius: 4.8 }
      ],
      routes: [
        { from: HUBS.BERINGIA_ALASKA, to: HUBS.ARCTIC_CANADA, wave: 1, originColor: '#38bdf8', color: '#7dd3fc', label: 'Thule Inuit → Arctic Canada (c. 1000 CE)' },
        { from: HUBS.ARCTIC_CANADA, to: HUBS.GREENLAND, wave: 2, originColor: '#7dd3fc', color: '#bae6fd', label: 'Thule → Greenland Kalaallisut (c. 1200–1300 CE)' },
        { from: HUBS.SONORA_MESO, to: HUBS.MEXICO_BASIN, wave: 1, originColor: '#f59e0b', color: '#fbbf24', label: 'Uto-Aztecan / Nahuatl → Central Mexico' },
        { from: HUBS.ANDES_CUSCO, to: [-78.5, -1.8], wave: 1, originColor: '#f59e0b', color: '#eab308', label: 'Quechuan → Ecuadorian Andes' },
        { from: HUBS.ANDES_CUSCO, to: [-65.2, -19.0], wave: 1, originColor: '#f59e0b', color: '#fb923c', label: 'Quechuan → Bolivia & NW Argentina' },
        { from: HUBS.SW_AMAZON, to: [-58.4, -23.4], wave: 1, originColor: '#10b981', color: '#34d399', label: 'Tupian → Guaraní / Paraguay Basin' },
        { from: HUBS.IBERIA, to: HUBS.MEXICO_BASIN, wave: 3, originColor: '#e11d48', color: '#fb7185', label: 'Spanish Maritime → Americas (1519+ CE)' },
        { from: HUBS.PORTUGAL, to: HUBS.BRAZIL_COAST, wave: 3, originColor: '#f43f5e', color: '#fda4af', label: 'Portuguese Maritime → Brazil (1500+ CE)' },
        { from: HUBS.BRITAIN, to: HUBS.NORTH_AMERICA, wave: 3, originColor: '#0284c7', color: '#38bdf8', label: 'English Maritime → North America (1607+ CE)' }
      ]
    }
  };

  // Reusable accurate branch ancestral chains (all coordinates verified [lng, lat])
  const BRANCHES = {
    iberian_spanish: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Italian Peninsula → Iberia',
      era: 'c. 4000 BCE (PIE) → 2nd c. BCE (Latin) → 16th c. CE (Global)',
      driver: 'Steppe pastoralism → Roman Hispania → Castilian Reconquista & Atlantic Empire',
      color: '#e11d48',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 1200–200 BCE', label: 'Italian Peninsula (Proto-Italic → Roman Latin)' },
        { era: '3rd c. BCE–15th c. CE', label: 'Iberia (Hispano-Romance / Castilian)' },
        { era: '1492 CE–Present', label: 'Maritime dispersal (Americas, Equatorial Guinea & Philippines contact)' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.IBERIA],
      notes: 'Spanish descends from spoken Vulgar Latin brought to the Iberian Peninsula by Roman legions from the 3rd century BCE onward, later absorbing Basque/Celtic/Arabic lexical strata before global maritime expansion after 1492.'
    },
    iberian_portuguese: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Rome → Western Iberia (Galicia-Portugal)',
      era: 'c. 4000 BCE (PIE) → 9th c. CE (Galician-Portuguese) → 1500+ CE',
      driver: 'Roman Lusitania → Atlantic Spice & Sugar Trade Routes',
      color: '#f43f5e',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: '2nd c. BCE–9th c. CE', label: 'Rome → NW Iberia (Galician-Portuguese)' },
        { era: '15th–19th c. CE', label: 'Atlantic & Indian Ocean voyages (Brazil, Cabo Verde, Angola, Mozambique, Timor-Leste)' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.PORTUGAL],
      notes: 'Portuguese evolved from Galician-Portuguese in northwestern Iberia (Roman Gallaecia) and spread globally during the 15th–16th century Age of Sail across the South Atlantic and Indian Ocean.'
    },
    gallo_romance: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Italy → Gaul (Northern France)',
      era: 'c. 4000 BCE (PIE) → 1st c. BCE (Latin in Gaul) → 17th–20th c. CE',
      driver: 'Romanization of Celtic Gaul (with Frankish Germanic superstrate) → Colonial Administration',
      color: '#c026d3',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: '1st c. BCE–5th c. CE', label: 'Rome → Gaul (Vulgar Latin over Gaulish Celtic)' },
        { era: '5th–17th c. CE', label: 'Langue d\'oïl / Île-de-France standardization' },
        { era: '17th–20th c. CE', label: 'Quebec, Caribbean, & Francophone Africa administrative diffusion' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.FRANCE],
      notes: 'French is a Romance descendant of Vulgar Latin planted in Celtic-speaking Gaul (~50 BCE), distinctively reshaped in phonology and lexicon by later Frankish Germanic rulers before 17th–20th century colonial expansion.'
    },
    italo_romance: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Italian Peninsula (Latium / Tuscany)',
      era: 'c. 4000 BCE (PIE) → c. 1200 BCE (Italic) → 14th c. CE (Tuscan Standard)',
      driver: 'Steppe Italic arrival in Italy → Latin antiquity & Florentine literary Renaissance',
      color: '#e879f9',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 1200–100 BCE', label: 'Central Italy (Proto-Italic → Latin)' },
        { era: '13th–19th c. CE', label: 'Tuscan / Florentine dialect → Modern Standard Italian' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME],
      notes: 'Italian evolved directly in situ from Central Italian Vulgar Latin following ancient Italic entry into the peninsula, with literary Tuscan providing the framework for modern national Italian.'
    },
    eastern_romance: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Rome → Roman Dacia / Lower Danube',
      era: 'c. 4000 BCE (PIE) → 106–271 CE (Dacian Romanization)',
      driver: 'Roman Imperial Danube frontier settlement + later Slavic & Balkan Sprachbund contact',
      color: '#db2777',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: '106–271 CE', label: 'Italy → Roman Province of Dacia (Lower Danube)' },
        { era: '6th c. CE–Present', label: 'Eastern Romance develops within Slavic-speaking Southeast Europe' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME],
      notes: 'Romanian (including Moldovan) represents the surviving Eastern Romance branch from Roman Dacia along the Lower Danube, preserving Latin grammar and core lexicon despite centuries of geographic separation from Western Romance.'
    },
    english_global: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → North Sea Coast → Great Britain → Global',
      era: 'c. 4000 BCE (PIE) → 5th c. CE (Anglo-Saxon) → 17th–20th c. CE',
      driver: 'North Sea Germanic migration → Norman-French lexicon infusion → Maritime Empire & Modern Lingua Franca',
      color: '#0284c7',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 500 BCE–450 CE', label: 'Elbe/North Sea coast (Ingvaeonic West Germanic)' },
        { era: '450–1500 CE', label: 'Britain (Old English + Old Norse & Norman-French influence)' },
        { era: '1607 CE–Present', label: 'North America, Oceania, South Asia & Africa global spread' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER, HUBS.BRITAIN],
      notes: 'English traces to West Germanic Angles, Saxons, and Jutes who crossed the North Sea to Britain in the 5th century CE, mixing Germanic grammar with heavy Old Norse and Norman-French vocabulary before global maritime expansion.'
    },
    continental_germanic: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → North European Plain / Elbe-Rhine Basin',
      era: 'c. 4000 BCE (PIE) → c. 500 BCE (Proto-Germanic) → Medieval Standard',
      driver: 'Corded Ware → Jastorf Iron-Age Germanic culture → Central European continental spread',
      color: '#1d4ed8',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 500 BCE', label: 'Southern Scandinavia / Elbe Basin (Proto-Germanic)' },
        { era: '4th–16th c. CE', label: 'Continental West Germanic (German / Dutch diversification)' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER],
      notes: 'German, Dutch, and Luxembourgish descend from continental West Germanic dialects emerging along the Elbe and Rhine basins after Corded Ware steppe populations mixed with Northern European Neolithic farmers.'
    },
    north_germanic: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Jutland & Southern Scandinavia → North Atlantic',
      era: 'c. 4000 BCE (PIE) → 2nd–8th c. CE (Proto-Norse) → 9th–11th c. CE (Old Norse)',
      driver: 'Nordic Bronze Age → Viking Age longship settlement (Iceland, Faroes, Britain)',
      color: '#38bdf8',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 500 BCE–800 CE', label: 'Southern Scandinavia (Proto-Germanic → Proto-Norse runes)' },
        { era: '800–1100 CE', label: 'Old Norse expansion to Iceland, Faroe Islands & British Isles' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER, HUBS.SCANDINAVIA],
      notes: 'Swedish, Danish, Norwegian, Icelandic, and Faroese descend from Old Norse, carried westward across the North Atlantic during the Viking Age; Icelandic remains remarkably conservative close to medieval Old West Norse.'
    },
    celtic_ireland: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Central/Western Europe (Hallstatt/La Tène) → Ireland',
      era: 'c. 4000 BCE (PIE) → c. 1000–500 BCE (Insular Celtic) • 12th–19th c. CE (English shift)',
      driver: 'Atlantic Bell Beaker / Celtic expansion; later Anglo-Norman & British language shift to English',
      color: '#10b981',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 2400–500 BCE', label: 'Atlantic / Western Europe (Proto-Celtic → Goidelic Irish)' },
        { era: '17th–19th c. CE', label: 'Language shift toward Hiberno-English alongside protected Irish Gaelic (Gaeilge)' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER, HUBS.IRELAND],
      notes: 'Ireland\'s indigenous Indo-European heritage is Goidelic Celtic (Gaeilge, brought via Atlantic Bronze/Iron-Age migrations), while Hiberno-English became majority spoken from the 18th–19th centuries with distinctive Celtic grammatical substrate.'
    },
    baltic: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Eastern Baltic Forest Zone',
      era: 'c. 4000 BCE (PIE) → c. 2000–1000 BCE (Balto-Slavic → Proto-Baltic)',
      driver: 'Corded Ware steppe arrival into the Nemunas & Daugava river basins with minimal later upheaval',
      color: '#3b82f6',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 2800–1500 BCE', label: 'Forest zone (Balto-Slavic split → Proto-Baltic)' },
        { era: '1st Mil. BCE–Present', label: 'Lithuanian & Latvian evolve in situ on southeastern Baltic coast' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.BALTIC_HOMELAND],
      notes: 'Lithuanian and Latvian preserve the Baltic branch of Indo-European almost directly in its southeastern Baltic homeland; Lithuanian in particular retains archaic Indo-European noun inflections and pitch accent lost in most European tongues.'
    },
    east_slavic: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Pripyat–Dnieper Basin → Eastern Europe & Siberia',
      era: 'c. 4000 BCE (PIE) → 5th–9th c. CE (Common Slavic) → 16th–19th c. CE (Siberia)',
      driver: 'Early medieval Slavic riverine expansion from Pripyat–Dnieper forest zone & later Russian Tsardom eastward expansion',
      color: '#4f46e5',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: '5th–7th c. CE', label: 'Pripyat-Dnieper homeland (Common Slavic diaspora)' },
        { era: '9th–14th c. CE', label: 'Kyivan Rus\' → Russian, Ukrainian & Belarusian divergence' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.PRIPYAT_SLAV],
      notes: 'Russian, Ukrainian, and Belarusian descend from East Slavic spoken across medieval Kyivan Rus\', originating from the rapid 5th–7th century CE Slavic expansion out of the Pripyat–Dnieper–Vistula corridor.'
    },
    west_slavic: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Vistula–Pripyat Basin → Central Europe',
      era: 'c. 4000 BCE (PIE) → 5th–8th c. CE (West Slavic Settlement)',
      driver: 'Migration-period Slavic westward movement into the Vistula, Oder & Elbe-Morava basins',
      color: '#6366f1',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: '5th–7th c. CE', label: 'Pripyat-Vistula homeland (West Slavic split: Lechitic & Czecho-Slovak)' },
        { era: '9th c. CE–Present', label: 'Polish, Czech & Slovak consolidate in Central Europe' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.PRIPYAT_SLAV],
      notes: 'Polish, Czech, and Slovak represent the West Slavic branch moving into Central Europe during the 5th–7th centuries CE, later sharing close cultural & Latin-script history with Western European neighbors.'
    },
    south_slavic: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Pripyat Basin → Lower Danube & Balkans',
      era: 'c. 4000 BCE (PIE) → 6th–7th c. CE (Balkan Settlement)',
      driver: 'Slavic migration across the Danube into the Byzantine Balkans',
      color: '#818cf8',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: '5th–6th c. CE', label: 'Pripyat-Dnieper Slavic homeland' },
        { era: '6th–7th c. CE', label: 'Danube crossing → Balkans (Bulgarian, Serbian, Croatian, Bosnian, Slovene, Macedonian)' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.PRIPYAT_SLAV, [20.5, 44.5]],
      notes: 'South Slavic speakers crossed the Carpathians and Lower Danube into the Balkans in the 6th–7th centuries CE, mixing with Romance, Greek, Thracian/Illyrian, and (in Bulgaria) Turkic Bulgar elites while forging the Balkan Sprachbund.'
    },
    hellenic: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Northern Balkans → Aegean Basin',
      era: 'c. 4000 BCE (PIE) → c. 2200–1600 BCE (Mycenaean Greek)',
      driver: 'Early Bronze-Age Indo-European entry into Aegean, continuous 3,400+ year written history',
      color: '#2563eb',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 2200–1600 BCE', label: 'Aegean arrival (Linear B Mycenaean Greek)' },
        { era: '4th c. BCE–Present', label: 'Koine Greek → Byzantine & Modern Greek' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.BALKANS],
      notes: 'Greek forms an independent Indo-European branch with the longest continuous written record in Europe—from ~1450 BCE Mycenaean Linear B tablets through Classical, Hellenistic Koine, and Byzantine Greek to modern Greece and Cyprus.'
    },
    iranian: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Central Asia (Andronovo/BMAC) → Iranian Plateau',
      era: 'c. 4000 BCE (PIE) → c. 1800 BCE (Indo-Iranian) → c. 1000–550 BCE (Old Persian / Avestan)',
      driver: 'Sintashta/Andronovo steppe movement south into Bactria–Margiana & Iranian Plateau',
      color: '#0d9488',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 2100–1600 BCE', label: 'Sintashta / Central Asian Steppe (Proto-Indo-Iranian)' },
        { era: 'c. 1200–550 BCE', label: 'Iranian Plateau (Avestan, Median & Old Persian → Modern Persian / Tajik / Kurdish / Pashto)' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CA_STEPPE, HUBS.IRAN_PLATEAU],
      notes: 'Persian (Farsi/Dari/Tajik), Kurdish, and Pashto belong to the Iranian branch of Indo-Iranian, descending from steppe pastoralists who moved through Central Asia onto the Iranian Plateau around the late 2nd to early 1st millennium BCE.'
    },
    indo_aryan: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Central Asia → Punjab & Indo-Gangetic Plain',
      era: 'c. 4000 BCE (PIE) → c. 2000–1500 BCE (Vedic Sanskrit arrival)',
      driver: 'Steppe pastoral migration via Central Asia converging with post-Harappan South Asian & Dravidian populations',
      color: '#f59e0b',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 2100–1700 BCE', label: 'Sintashta / Central Asia (Proto-Indo-Iranian split)' },
        { era: 'c. 1500–500 BCE', label: 'Punjab & Gangetic Plain (Vedic Sanskrit → Prakrits)' },
        { era: '1000 CE–Present', label: 'Hindi-Urdu, Bengali, Punjabi, Nepali, Sinhala & Dhivehi diversify' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CA_STEPPE, HUBS.PUNJAB_INDIA],
      notes: 'Indo-Aryan languages descend from Old Indo-Aryan (Vedic Sanskrit), entering northwestern South Asia c. 1800–1500 BCE and deeply converging phonologically and grammatically with indigenous Dravidian and Munda (Austroasiatic) families.'
    },
    arabic: {
      corridorId: 'afroasiatic',
      homeland: 'Levant / Red Sea Semitic Hearth → Arabian Peninsula → Middle East & North Africa',
      era: 'c. 3800 BCE (Proto-Semitic) → 7th–11th c. CE (Arabic Expansion)',
      driver: 'Proto-Semitic divergence into Central Semitic; 7th–11th c. CE Arab-Islamic & Banu Hilal migrations',
      color: '#eab308',
      stages: [
        { era: 'c. 10,000–6000 BCE', label: 'NE Africa / Levant (Proto-Afroasiatic)' },
        { era: 'c. 3800–1000 BCE', label: 'Levant & North Arabia (Proto-Semitic → Proto-Arabic)' },
        { era: '7th–11th c. CE', label: 'Arabian Peninsula → Levant, Mesopotamia, Egypt, Maghreb & Sudan' }
      ],
      chain: [HUBS.LEVANT_CORE, HUBS.HEJAZ_ARABIA, HUBS.EGYPT_NILE],
      notes: 'Arabic belongs to Central Semitic within Afroasiatic. Spoken across North Arabia & Syria from antiquity (Nabataean/Safaitic inscriptions), it expanded rapidly in the 7th–11th centuries CE across Egypt, the Levant, Mesopotamia, and the Maghreb, blending with Coptic, Aramaic, and Amazigh substrates.'
    },
    ethio_semitic: {
      corridorId: 'afroasiatic',
      homeland: 'Ancient South Arabia → Red Sea → Ethiopian & Eritrean Highlands',
      era: 'c. 3800 BCE (Semitic) → c. 1st Mil. BCE (Red Sea Crossing)',
      driver: 'South Semitic sea crossings across Bab-el-Mandeb converging with indigenous Cushitic & Omotic highlands',
      color: '#f59e0b',
      stages: [
        { era: 'c. 3800 BCE', label: 'Levant / Arabia (Proto-Semitic)' },
        { era: 'c. 1500–800 BCE', label: 'Southern Arabia → Red Sea crossing to Horn of Africa' },
        { era: 'c. 1st Mil. BCE–Present', label: 'Geʻez liturgical root → Amharic & Tigrinya alongside Oromo/Cushitic' }
      ],
      chain: [HUBS.LEVANT_CORE, HUBS.SOUTH_ARABIA, HUBS.HORN_AFRICA],
      notes: 'Amharic and Tigrinya descend from South Semitic speakers who crossed the Red Sea into the Ethiopian/Eritrean highlands during the 1st millennium BCE, adopting Cushitic SOV word order and phonology in a deep Ethiopian language area.'
    },
    cushitic_horn: {
      corridorId: 'afroasiatic',
      homeland: 'Horn of Africa / Red Sea Coast (Indigenous Afroasiatic Branch)',
      era: 'c. 7000–3000 BCE (Deep In-situ Afroasiatic Divergence)',
      driver: 'Pastoralist & coastal trade societies indigenous to the Horn of Africa for millennia',
      color: '#ca8a04',
      stages: [
        { era: 'c. 10,000–6000 BCE', label: 'NE Africa / Red Sea (Proto-Afroasiatic)' },
        { era: 'c. 5000–2000 BCE', label: 'Lowland & Highland Horn (Proto-Cushitic diversification)' },
        { era: '1st Mil. CE–Present', label: 'Somali, Oromo & Afar expand across the Horn' }
      ],
      chain: [HUBS.EGYPT_NILE, HUBS.HORN_AFRICA],
      notes: 'Somali, Oromo, and Afar belong to the Cushitic branch of Afroasiatic, which has remained deeply rooted in the Horn of Africa for over five millennia rather than arriving via recent migration.'
    },
    bantu_east: {
      corridorId: 'bantu',
      homeland: 'Cameroon–Nigeria Borderlands → Great Lakes → East & Southern Africa',
      era: 'c. 3000 BCE (Proto-Bantu) → c. 500 BCE–500 CE (Eastern Expansion)',
      driver: 'Eastern Bantu farming & iron-smelting expansion via the Great Lakes hub',
      color: '#16a34a',
      stages: [
        { era: 'c. 3000–1500 BCE', label: 'Cameroon–Nigeria Grassfields (Proto-Bantu)' },
        { era: 'c. 1000–300 BCE', label: 'Northern rainforest rim → African Great Lakes (Urewe horizon)' },
        { era: 'c. 1–1000 CE', label: 'East, Coastal Swahili, & Southern African Bantu diversification' }
      ],
      chain: [HUBS.CAMEROON_BANTU, HUBS.GREAT_LAKES],
      notes: 'Part of the Eastern Bantu expansion radiating from the Great Lakes hub ~2,500–2,000 years ago; many countries in this belt now balance national Bantu lingua francas (Swahili, Zulu, Shona, Kinyarwanda, Chichewa) alongside post-colonial English or French.'
    },
    bantu_west: {
      corridorId: 'bantu',
      homeland: 'Cameroon–Nigeria Borderlands → Congo River Basin → West-Central Africa',
      era: 'c. 3000 BCE (Proto-Bantu) → c. 1500–200 BCE (Western Stream)',
      driver: 'Riverine rainforest agriculture and later European colonial administrative layer (French/Portuguese)',
      color: '#22c55e',
      stages: [
        { era: 'c. 3000–1500 BCE', label: 'Cameroon–Nigeria Grassfields (Proto-Bantu)' },
        { era: 'c. 1500–500 BCE', label: 'Western Bantu riverine migration through Congo Basin' },
        { era: '19th–20th c. CE', label: 'National Bantu lingua francas (Lingala, Kikongo, Kimbundu) coexist with French or Portuguese' }
      ],
      chain: [HUBS.CAMEROON_BANTU, HUBS.CONGO_STREAM],
      notes: 'Indigenous populations descend linguistically from the Western Bantu riverine movement through the Equatorial rainforest, while official administrative French or Portuguese dates to late-19th century colonial borders.'
    },
    west_african_nc: {
      corridorId: 'bantu',
      homeland: 'West African Niger-Congo Core (Savanna & Forest Belt)',
      era: 'c. 8000–2000 BCE (Deep Regional Divergence) + Colonial European Administrative Layer',
      driver: 'Ancient in-situ divergence of Mande, Atlantic (Wolof/Fula), Gur & Kwa branches; 19th–20th c. French/English administration',
      color: '#4ade80',
      stages: [
        { era: 'c. 8000–3000 BCE', label: 'West African Niger-Congo homeland (ancient Mande, Atlantic, Gur & Volta-Niger splits)' },
        { era: '1st–2nd Mil. CE', label: 'Mali, Ghana & Songhay empires spread Manding, Wolof, Akan & Yoruba trade networks' },
        { era: '19th–20th c. CE', label: 'European colonial layer introduces English/French/Portuguese as state languages' }
      ],
      chain: [HUBS.WEST_AFRICA_NC],
      notes: 'West African languages (Yoruba, Igbo, Twi/Akan, Wolof, Bambara, Mandinka) belong to ancient branches of Niger-Congo native to West Africa for millennia—distinct from Bantu—while English or French serves as an administrative superstrate.'
    },
    austronesian_isea: {
      corridorId: 'austronesian',
      homeland: 'Taiwan → Philippines → Island Southeast Asia',
      era: 'c. 3000 BCE (Taiwan) → c. 1500–500 BCE (Maritime Archipelago)',
      driver: 'Out-of-Taiwan Malayo-Polynesian outrigger dispersal & Srivijaya / Malacca Malay trade lingua franca',
      color: '#10b981',
      stages: [
        { era: 'c. 3000 BCE', label: 'Taiwan (Formosan Austronesian homeland)' },
        { era: 'c. 2200–1500 BCE', label: 'Luzon/Philippines → Borneo, Sulawesi & Indonesian Archipelago' },
        { era: '7th–16th c. CE', label: 'Srivijaya & Malacca trade spreads Malay/Indonesian archipelago-wide' }
      ],
      chain: [HUBS.TAIWAN_HOME, HUBS.LUZON_PHL, HUBS.SULAWESI_ISEA],
      notes: 'Island Southeast Asian languages (Indonesian, Malay, Javanese, Tagalog/Filipino, Cebuano) descend from the Out-of-Taiwan Malayo-Polynesian maritime wave (~2200–1200 BCE), absorbing Sanskrit, Arabic, and later European loanwords along maritime Silk Roads.'
    },
    austronesian_oceanic: {
      corridorId: 'austronesian',
      homeland: 'Taiwan → Philippines → Bismarck (Lapita) → Remote Oceania',
      era: 'c. 3000 BCE (Taiwan) → c. 1400 BCE (Lapita) → c. 900 BCE–1250 CE',
      driver: 'Double-hulled outrigger canoe celestial navigation across Pacific islands',
      color: '#06b6d4',
      stages: [
        { era: 'c. 3000 BCE', label: 'Taiwan (Proto-Austronesian homeland)' },
        { era: 'c. 1500–1400 BCE', label: 'Philippines/Indonesia → Bismarck Archipelago (Lapita horizon)' },
        { era: 'c. 900 BCE–1250 CE', label: 'Polynesian/Micronesian settlement of Fiji, Tonga, Samoa, Tahiti, Hawaiʻi & NZ' }
      ],
      chain: [HUBS.TAIWAN_HOME, HUBS.LAPITA_BISMARCK, HUBS.FIJI_SAMOA],
      notes: 'Pacific Oceanic languages descend from Lapita navigators who moved from Taiwan through Island Southeast Asia into Near Oceania (~1400 BCE) before crossing thousands of kilometers of open Pacific into Micronesia and Polynesia.'
    },
    oghuz_turkic: {
      corridorId: 'turkic',
      homeland: 'Eastern Steppe (Altai–Orkhon) → Transoxiana → Iran/Caucasus → Anatolia',
      era: 'c. 500 BCE (Eastern Steppe) → 11th c. CE (Seljuk Migration)',
      driver: 'Oghuz Turkic pastoral migration westward under Seljuk confederations',
      color: '#9333ea',
      stages: [
        { era: 'c. 500 BCE–600 CE', label: 'Altai–Orkhon Steppe (Proto-Turkic homeland)' },
        { era: '8th–10th c. CE', label: 'Syr Darya / Karakum Steppe (Oghuz confederation)' },
        { era: '11th–14th c. CE', label: 'Khorasan & Caucasus → Azerbaijan & Anatolia (Modern Turkish / Azerbaijani / Turkmen)' }
      ],
      chain: [HUBS.ALTAI_ORKHON, HUBS.TIANSHAN_CA, HUBS.AZERBAIJAN_OGHUZ],
      notes: 'Turkish, Azerbaijani, and Turkmen form the Southwestern (Oghuz) branch of the Turkic family, carried westward from Central Asia into Iran, the South Caucasus, and Anatolia starting in the 11th century CE.'
    },
    kipchak_karluk_turkic: {
      corridorId: 'turkic',
      homeland: 'Eastern Steppe (Altai–Orkhon) → Central Asian Steppe & Oases',
      era: 'c. 500 BCE (Eastern Steppe) → 6th–15th c. CE (Central Asia)',
      driver: 'Göktürk, Uyghur, Karakhanid & Kipchak confederations across the Eurasian Steppe',
      color: '#a855f7',
      stages: [
        { era: 'c. 500 BCE–740 CE', label: 'Altai–Orkhon Steppe (Old Turkic Khaganates)' },
        { era: '8th–12th c. CE', label: 'Tianshan & Kazakh Steppe (Karluk / Kipchak split)' },
        { era: '13th–20th c. CE', label: 'Kazakh, Kyrgyz & Uzbek solidify; 19th–20th c. Russian bilingualism adds East Slavic contact' }
      ],
      chain: [HUBS.ALTAI_ORKHON, HUBS.TIANSHAN_CA],
      notes: 'Central Asian Turkic languages (Kazakh, Kyrgyz, Uzbek) trace eastward to the Orkhon–Altai steppe before replacing or mingling with earlier Iranian (Sogdian/Saka) steppe languages between the 6th and 15th centuries CE.'
    },
    sinitic: {
      corridorId: 'sino-tibetan',
      homeland: 'Middle–Upper Yellow River Basin → East & Southern China',
      era: 'c. 4500 BCE (Sino-Tibetan) → 1st Mil. BCE (Old Chinese) → Modern',
      driver: 'Yellow River Neolithic farming → Shang/Zhou/Qin/Han southward state expansion',
      color: '#dc2626',
      stages: [
        { era: 'c. 4500–2500 BCE', label: 'Middle–Upper Yellow River Basin (Proto-Sino-Tibetan)' },
        { era: 'c. 1250–200 BCE', label: 'Oracle Bone Shang → Old Chinese Zhou/Han expansion across Yangtze' },
        { era: '1st Mil. CE–Present', label: 'Mandarin, Yue, Wu & Min/Hakka spread to Taiwan & maritime diasporas' }
      ],
      chain: [HUBS.YELLOW_RIVER, HUBS.NORTH_CHINA],
      notes: 'Sinitic languages originate in the Yellow River Neolithic core; after splitting from Tibeto-Burman, Old and Middle Chinese expanded southward across southern China, absorbing diverse indigenous Yue/Kra-Dai/Austroasiatic features.'
    },
    tibeto_burman: {
      corridorId: 'sino-tibetan',
      homeland: 'Upper Yellow River → Tibetan Plateau & Himalayan Corridors',
      era: 'c. 4500 BCE (Sino-Tibetan) → c. 2500 BCE (Tibetan Plateau) → 1st Mil. CE',
      driver: 'Highland barley/pastoralist expansion along eastern Tibetan river gorges into Himalayas & Myanmar',
      color: '#ef4444',
      stages: [
        { era: 'c. 4500–3000 BCE', label: 'Upper Yellow River (Majiayao Proto-Sino-Tibetan)' },
        { era: 'c. 2500–1500 BCE', label: 'Tibetan Plateau & Hengduan river valleys' },
        { era: '1st Mil. CE', label: 'Classical Tibetan → Dzongkha (Bhutan); Lolo-Burmese → Pyu & Bagan Myanmar' }
      ],
      chain: [HUBS.YELLOW_RIVER, HUBS.TIBET_PLATEAU],
      notes: 'Tibeto-Burman peoples diverged early from Sinitic ancestors along the upper Yellow River, settling the Tibetan Plateau (~2500 BCE) and migrating south through eastern Himalayan valleys into Bhutan, Nepal, and Myanmar.'
    },
    finnic: {
      corridorId: 'uralic',
      homeland: 'Southern Urals → Volga–Kama → Gulf of Finland',
      era: 'c. 2500 BCE (Proto-Uralic) → c. 1500–500 BCE (Baltic-Finnic arrival)',
      driver: 'Riverine forest-steppe migration westward along the Volga–Oka corridor to the Baltic Sea',
      color: '#38bdf8',
      stages: [
        { era: 'c. 2500–1900 BCE', label: 'Southern Urals / Ob-Irtysh (Proto-Uralic)' },
        { era: 'c. 1500–1000 BCE', label: 'Volga–Kama westward corridor' },
        { era: 'c. 1000–300 BCE', label: 'Gulf of Finland (Finnic homeland → Finnish & Estonian)' }
      ],
      chain: [HUBS.URALS_HOME, HUBS.VOLGA_KAMA, HUBS.BALTIC_FINNIC],
      notes: 'Finnish and Estonian belong to the Finnic branch of Uralic, unrelated genetically to Germanic Swedish or Slavic neighbors—though centuries of Baltic, Germanic, and Nordic contact added deep shared cultural vocabulary.'
    },
    french_creole: {
      corridorId: 'indo-european',
      homeland: 'West/Central Africa (Fon/Gbe & Bantu) + French Maritime Contact',
      era: '17th–18th c. CE (Transatlantic Contact Creolization)',
      driver: 'French vocabulary fused with West & Central African syntactic/aspectual structures',
      color: '#c026d3',
      stages: [
        { era: '17th–18th c. CE', label: 'West African Gbe/Fon & Bantu structures fuse with colonial French lexicon' },
        { era: '19th c. CE–Present', label: 'Distinct national languages (Haitian Creole, Seychellois, Mauritian)' }
      ],
      chain: [HUBS.FRANCE, HUBS.WEST_AFRICA_NC],
      notes: 'French-lexifier creoles (Haitian Creole, Mauritian, Seychellois, Antillean) preserve West African and Bantu grammatical frameworks relexified primarily from 17th–18th century regional French dialects.'
    },
    english_creole: {
      corridorId: 'indo-european',
      homeland: 'West/Central Africa or Melanesia + British Maritime Contact',
      era: '16th–19th c. CE (Transatlantic & Pacific Maritime Contact)',
      driver: 'Contact between enslaved African or Pacific speakers and maritime English',
      color: '#0ea5e9',
      stages: [
        { era: '15th–17th c. CE', label: 'Substrate grammars & British maritime English vocabulary' },
        { era: '17th–19th c. CE', label: 'Patois, Krio, Tok Pisin & Bislama emerge as distinct living languages' }
      ],
      chain: [HUBS.BRITAIN, HUBS.WEST_AFRICA_NC],
      notes: 'English-lexifier creoles and pidgins blend English-derived vocabulary with syntactic, tonal, and grammatical structures forged through African or Melanesian community contact.'
    }
  };

  // Accurate per-country overrides for notable migration stories, non-trivial substrates & dataset nuances
  const COUNTRY_OVERRIDES = {
    MDG: {
      corridorId: 'austronesian',
      title: 'Borneo → Indian Ocean → Madagascar (Dual Austronesian + Bantu Origin)',
      homeland: 'Taiwan → SE Borneo (Barito) → Madagascar (plus East African Bantu)',
      era: 'c. 3000 BCE (Taiwan) → c. 500–800 CE (Trans-Indian Ocean Crossing)',
      driver: 'Long-distance Borneo outrigger mariners merging with coastal East African Bantu settlers (later 1896–1960 French colonial layer)',
      color: '#10b981',
      stages: [
        { era: 'c. 3000 BCE', label: 'Taiwan (Austronesian homeland)' },
        { era: 'c. 1500 BCE–500 CE', label: 'SE Borneo Barito river basin (closest relative: Ma\'anyan)' },
        { era: 'c. 500–800 CE', label: '7,000+ km Indian Ocean crossing to Madagascar + East African Bantu convergence' },
        { era: '1896–1960 CE', label: 'French co-official administrative overlay added much later' }
      ],
      chain: [HUBS.TAIWAN_HOME, HUBS.BORNEO_BARITO],
      secondaryRoutes: [{ from: HUBS.SWAHILI_COAST, color: '#16a34a', label: 'Bantu Substrate & Cattle/Iron Vocabulary (c. 7th–10th c. CE)' }],
      notes: 'Malagasy represents one of the greatest linguistic surprises on Earth: despite sitting 400 km off East Africa, its core language is closely related to Ma\'anyan in southern Borneo—carried >7,000 km across the Indian Ocean c. 500–800 CE alongside East African Bantu speakers.'
    },
    HUN: {
      corridorId: 'uralic',
      title: 'Southern Urals → Pontic Steppe → Carpathian Basin (Magyar Migration)',
      homeland: 'Southern Urals / Western Siberia (Ob–Irtysh)',
      era: 'c. 2500 BCE (Proto-Uralic) → 895 CE (Carpathian Honfoglalás)',
      driver: 'Semi-nomadic Ugric steppe confederation migrating 3,000 km westward into Central Europe',
      color: '#38bdf8',
      stages: [
        { era: 'c. 2500 BCE', label: 'Southern Urals / Western Siberia (Proto-Uralic)' },
        { era: 'c. 500 BCE–800 CE', label: 'Magna Hungaria & Etelköz steppes (Turkic & Iranian steppe contacts)' },
        { era: '895 CE', label: 'Magyar conquest/settlement (Honfoglalás) in Carpathian Basin' }
      ],
      chain: [HUBS.URALS_HOME, HUBS.ETELKOZ_STEPPE],
      notes: 'Hungarian (Magyar) is an Uralic island in Central Europe: its nearest genetic cousins are Khanty and Mansi spoken 3,000 km away in Western Siberia. Ancestors crossed the Eurasian steppes and settled the Carpathian Basin in 895 CE.'
    },
    TUR: {
      corridorId: 'turkic',
      title: 'Altai–Orkhon Steppe → Transoxiana → Anatolia (Oghuz Turkic)',
      homeland: 'Eastern Eurasian Steppe (Orkhon–Altai Region)',
      era: 'c. 500 BCE (Proto-Turkic) → 11th–14th c. CE (Seljuk Anatolian Entry)',
      driver: 'Oghuz Seljuk pastoralist-imperial migration westward across Central Asia & Iran after 1071 CE',
      color: '#9333ea',
      stages: [
        { era: 'c. 500 BCE–740 CE', label: 'Orkhon Valley & Altai (Old Turkic homeland)' },
        { era: '8th–10th c. CE', label: 'Syr Darya / Transoxiana (Oghuz conversion & Persian/Arabic contact)' },
        { era: '1071 CE–14th c. CE', label: 'Seljuk migration across Azerbaijan → Anatolia (Turkification over Greek/Armenian/Anatolian substrates)' }
      ],
      chain: [HUBS.ALTAI_ORKHON, HUBS.TIANSHAN_CA, HUBS.AZERBAIJAN_OGHUZ],
      notes: 'Turkish belongs to the Oghuz branch of Turkic originating in Mongolia/Altai—not genetic kin to Arabic or Persian despite centuries of shared Perso-Arabic literary vocabulary before 1928 script & lexical reforms.'
    },
    MLT: {
      corridorId: 'afroasiatic',
      title: 'Arabia → Sicily → Malta (Siculo-Arabic Semitic Survival)',
      homeland: 'Levant / Arabia → North Africa & Sicily (Siculo-Arabic)',
      era: '9th–11th c. CE (Aghlabid & Norman Sicily Contact)',
      driver: 'Medieval Maghrebi Siculo-Arabic dialect isolated after 1091 Christian reconquest, absorbing Sicilian/Italian lexicon',
      color: '#eab308',
      stages: [
        { era: 'c. 3800 BCE', label: 'Levant / Arabia (Proto-Semitic)' },
        { era: '7th–9th c. CE', label: 'North Africa / Tunisia → Muslim Sicily (Siculo-Arabic)' },
        { era: '1091 CE–Present', label: 'Malta diverges in isolation with heavy Sicilian-Italian & English vocabulary, becoming the only official Semitic EU language' }
      ],
      chain: [HUBS.HEJAZ_ARABIA, HUBS.EGYPT_NILE, [10.2, 36.8]],
      notes: 'Maltese is uniquely Afroasiatic (Semitic) written in the Latin alphabet—a direct descendant of medieval Siculo-Arabic isolated from the rest of the Arab world since the late 11th century and deeply enriched by Sicilian, Italian, and English loanwords.'
    },
    JPN: {
      corridorId: 'sino-tibetan',
      title: 'Japonic Family: Yayoi Maritime Arrival & In-Situ Archipelago Continuity',
      homeland: 'Japanese Archipelago & Southern Korean Peninsula Maritime Corridor',
      era: 'c. 1000–300 BCE (Yayoi Rice-Farming Entry) • Independent Japonic Family',
      driver: 'Yayoi agriculturalists crossing Korea Strait blending with indigenous Jōmon populations; later extensive Middle Chinese literary borrowing',
      color: '#ec4899',
      stages: [
        { era: 'c. 1000–300 BCE', label: 'Southern Korean Peninsula / Kyushu (Proto-Japonic Yayoi arrival)' },
        { era: 'c. 300 BCE–300 CE', label: 'Spread from Kyushu through Honshu; Ryukyuan branches south into Okinawa (~2nd–5th c. CE)' },
        { era: '5th–9th c. CE', label: 'Massive Sino-Japanese literary & script contact (unrelated genetically to Chinese)' }
      ],
      chain: [HUBS.MANCHURIA_KOR, HUBS.KOREA_PEN, HUBS.KYUSHU_JPN],
      notes: 'Japonic (Japanese + Ryukyuan) is a distinct primary language family—NOT related genetically to Chinese (Sino-Tibetan) and not a proven member of any "Altaic" family. Most linguists trace Proto-Japonic to Yayoi wet-rice cultivators crossing from the Korean Peninsula into Kyushu c. 1000–300 BCE, mixing with Jōmon substrates.'
    },
    KOR: {
      corridorId: 'sino-tibetan',
      title: 'Koreanic Family: Manchuria–Korean Peninsula Hearth',
      homeland: 'Southern Manchuria (Liaodong) & Korean Peninsula',
      era: 'c. 1500–300 BCE (Bronze-Age / Samhan Era) • Independent Koreanic Family',
      driver: 'Independent Koreanic family diversification on the peninsula; Silla unification (~668 CE) & later Hanja/Sino-Korean strata',
      color: '#f472b6',
      stages: [
        { era: 'c. 1500–300 BCE', label: 'Liaodong / Northern Korean Peninsula (Proto-Koreanic)' },
        { era: '1st–7th c. CE', label: 'Three Kingdoms (Goguryeo, Baekje, Silla) → Silla Middle Korean foundation' },
        { era: '1443 CE', label: 'Hangul alphabet engineered scientifically under King Sejong' }
      ],
      chain: [HUBS.MANCHURIA_KOR],
      notes: 'Koreanic (Korean and Jeju) constitutes an independent primary language family. Typological parallels with Japanese and Turkic reflect long Northeast Asian areal contact rather than proven common ancestry; over half of modern Korean vocabulary is borrowed Sino-Korean rather than cognate.'
    },
    PRK: {
      corridorId: 'sino-tibetan',
      title: 'Koreanic Family: Manchuria–Korean Peninsula Hearth',
      homeland: 'Southern Manchuria (Liaodong) & Korean Peninsula',
      era: 'c. 1500–300 BCE (Bronze-Age) • Independent Koreanic Family',
      driver: 'Independent Koreanic family; northern peninsula dialects divergent only since 1945 division',
      color: '#f472b6',
      stages: [
        { era: 'c. 1500–300 BCE', label: 'Liaodong / Korean Peninsula (Proto-Koreanic)' },
        { era: '668–1392 CE', label: 'Unified Silla → Goryeo Korean' },
        { era: '1945 CE–Present', label: 'North–South standard divergence between Pyongyang and Seoul' }
      ],
      chain: [HUBS.MANCHURIA_KOR],
      notes: 'Koreanic is an independent primary family native to the Korean Peninsula and adjacent Manchuria. Despite post-1945 lexical differences, northern and southern Korean remain mutually intelligible dialects of one ancient lineage.'
    },
    MNG: {
      corridorId: 'turkic',
      title: 'Mongolic Family: Onon–Kerulen Eastern Steppe Homeland',
      homeland: 'Eastern Eurasian Steppe / Greater Khingan–Onon–Kerulen Basin',
      era: 'c. 500 BCE–1200 CE (Xianbei / Para-Mongolic) → 13th c. CE (Middle Mongol)',
      driver: 'Independent Mongolic steppe pastoralists; Chinggisid confederation spreads Middle Mongol across Eurasia',
      color: '#a855f7',
      stages: [
        { era: 'c. 500 BCE–500 CE', label: 'Manchuria / Onon–Kerulen Basin (Proto-Mongolic / Xianbei)' },
        { era: '1206–1368 CE', label: 'Mongol Empire unifies Khalkha, Buryat, Oirat & Kalmyk dialects' }
      ],
      chain: [HUBS.MONGOL_EAST],
      notes: 'Mongolian leads the independent Mongolic family (Khalkha, Buryat, Kalmyk, Oirat). Although Mongolian shares heavy loanwords and agglutinative grammar with Turkic from two millennia of shared steppe life on the Mongolian Plateau, mainstream linguistics treats Mongolic and Turkic as separate families.'
    },
    GEO: {
      corridorId: 'indo-european',
      title: 'Kartvelian (South Caucasian): Ancient In-Situ Caucasus Continuity',
      homeland: 'Western & Central South Caucasus (Colchis / Iberia)',
      era: 'c. 2500 BCE+ (Proto-Kartvelian Split) • Continuous 4,000+ Year Residency',
      driver: 'Deep indigenous South Caucasian continuity protected by the Greater Caucasus Mountains',
      color: '#f97316',
      stages: [
        { era: 'c. 2500–1900 BCE', label: 'South Caucasus (Proto-Kartvelian splits into Svan & Karto-Zan)' },
        { era: 'c. 700 BCE–4th c. CE', label: 'Georgian–Zan split; Old Georgian Asomtavruli alphabet attested from 430 CE' }
      ],
      chain: [],
      notes: 'Georgian belongs to the independent Kartvelian (South Caucasian) family—genetically unrelated to Indo-European, Turkic, or Afroasiatic—marking one of Eurasia\'s longest unbroken linguistic continuities in its original mountain homeland.'
    },
    ARM: {
      corridorId: 'indo-european',
      title: 'Armenian Branch: Independent Indo-European Lineage in the Highlands',
      homeland: 'Pontic–Caspian Steppe → Balkans/Caucasus → Armenian Highlands',
      era: 'c. 4000 BCE (PIE) → c. 1200 BCE–6th c. BCE (Attested in Highlands)',
      driver: 'Indo-European migration into the Armenian Plateau integrating Urartian (Hurro-Urartian) substrate',
      color: '#f59e0b',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 1500–600 BCE', label: 'Armenian Highlands (Proto-Armenian mixes with Urartian substrate)' },
        { era: '405 CE–Present', label: 'Mesrop Mashtots creates Armenian alphabet → Classical Grabar to Modern Armenian' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CAUCASUS_GEO],
      notes: 'Armenian forms its own standalone branch of Indo-European. Its ancestors entered the Armenian Highlands by the late Bronze/early Iron Age, absorbing non-Indo-European Urartian and later heavy Parthian Iranian vocabulary.'
    },
    ALB: {
      corridorId: 'indo-european',
      homeland: 'Pontic–Caspian Steppe → Western Balkans (Illyrian / Paleo-Balkan Corridor)',
      era: 'c. 4000 BCE (PIE) → Independent Paleo-Balkan Lineage',
      driver: 'Continuous Paleo-Balkan Indo-European development in mountainous Western Balkans with Latin/Greek/Slavic loan strata',
      color: '#38bdf8',
      stages: [
        { era: 'c. 4000–2500 BCE', label: 'Pontic Steppe (Proto-Indo-European)' },
        { era: 'c. 1000 BCE–4th c. CE', label: 'Western Balkans (Paleo-Balkan ancestor + heavy Latin contact)' },
        { era: '1462 CE–Present', label: 'First written Albanian (Formula e Pagëzimit) → Gheg & Tosk' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.BALKANS],
      notes: 'Albanian constitutes an independent single-language branch of Indo-European descending from an ancient Paleo-Balkan tongue (often linked with Illyrian or Messapic/Thracian groups) preserving native roots alongside extensive Roman-era Latin borrowings.'
    },
    GRL: {
      corridorId: 'americas',
      title: 'Thule Inuit Migration Across the High Arctic (plus Norse/Danish)',
      homeland: 'Bering Strait / Western Alaska → Canadian High Arctic → Greenland',
      era: 'c. 1000–1300 CE (Thule Expansion) • 1721+ CE (Danish-Norwegian Arrival)',
      driver: 'Rapid Thule umiak boat & dog-sled maritime adaptation across the Arctic Circle (~4,000 km in ~300 years)',
      color: '#38bdf8',
      stages: [
        { era: 'c. 1000 CE', label: 'Bering Strait / Northern Alaska (Proto-Inuit / Thule culture)' },
        { era: 'c. 1100–1250 CE', label: 'Canadian Arctic Archipelago traversal' },
        { era: 'c. 1200–1300 CE', label: 'Greenland settlement (Kalaallisut) followed by 18th-c. Danish administration' }
      ],
      chain: [HUBS.BERINGIA_ALASKA, HUBS.ARCTIC_CANADA],
      notes: 'Greenlandic (Kalaallisut) belongs to the Inuit–Yupik–Unangan family carried across 4,000+ km of Arctic coastline from Alaska to Greenland around 1000–1300 CE—remaining Greenland\'s sole official national language today alongside historical Danish ties.'
    },
    EST: {
      corridorId: 'uralic',
      title: 'Uralic Finnic Dispersal: Urals → Gulf of Finland',
      homeland: 'Southern Urals → Volga–Kama → Southeastern Baltic',
      era: 'c. 2500 BCE (Proto-Uralic) → c. 1000–500 BCE (Estonian Finnic)',
      driver: 'Westward Finnic riverine migration to Baltic coast; heavy Low German, Swedish & Baltic contact',
      color: '#38bdf8',
      stages: [
        { era: 'c. 2500 BCE', label: 'Southern Urals (Proto-Uralic)' },
        { era: 'c. 1500–800 BCE', label: 'Volga–Kama → Gulf of Finland (Proto-Finnic)' },
        { era: '13th c. CE–Present', label: 'Estonian consolidates with Low German & Baltic loanwords' }
      ],
      chain: [HUBS.URALS_HOME, HUBS.VOLGA_KAMA, HUBS.BALTIC_FINNIC],
      notes: 'Estonian is a Uralic (Finnic) language closely related to Finnish—NOT a Baltic language like neighboring Latvian—representing the westernmost southern anchor of the Uralic migration from the Urals.'
    },
    FIN: {
      corridorId: 'uralic',
      title: 'Uralic Finnic Dispersal (Finnish & Sámi + Nordic Swedish)',
      homeland: 'Southern Urals → Volga–Kama → Fennoscandia',
      era: 'c. 2500 BCE (Proto-Uralic) → c. 1200–500 BCE (Finnic) • 12th c. CE (Swedish)',
      driver: 'Uralic Finnic and Sámi arrivals to Fennoscandia; medieval Swedish coastal settlement & union',
      color: '#38bdf8',
      stages: [
        { era: 'c. 2500 BCE', label: 'Southern Urals (Proto-Uralic)' },
        { era: 'c. 1200–500 BCE', label: 'Volga–Kama → Finland (Finnic & Arctic Sámi divergence)' },
        { era: '12th–19th c. CE', label: 'Swedish coastal arrival creates bilingual Finno-Ugric / Germanic heritage' }
      ],
      chain: [HUBS.URALS_HOME, HUBS.VOLGA_KAMA, HUBS.BALTIC_FINNIC],
      secondaryRoutes: [{ from: HUBS.SCANDINAVIA, color: '#0284c7', label: 'North Germanic / Swedish Arrival (12th–14th c. CE)' }],
      notes: 'Finland unites two completely distinct ancient language families: majority Uralic (Finnish and Arctic Sámi, arriving via the Volga–Kama corridor) and official Indo-European North Germanic (Swedish, settled along western and southern coasts in the Middle Ages).'
    },
    PHL: {
      corridorId: 'austronesian',
      title: 'Out-of-Taiwan First Stepping Stone → Philippines (plus Colonial Spanish/English)',
      homeland: 'Taiwan (Formosan Homeland) → Luzon & Visayas',
      era: 'c. 2200 BCE (Malayo-Polynesian Entry) • 1565 / 1898 CE (Spanish / English)',
      driver: 'Neolithic Austronesian outrigger migration across the Bashi Channel; later Spanish & US administration',
      color: '#10b981',
      stages: [
        { era: 'c. 3000 BCE', label: 'Taiwan (Formosan Austronesian homeland)' },
        { era: 'c. 2200–1500 BCE', label: 'First extra-Formosan leap across Luzon Strait (Tagalog, Cebuano, Ilocano ancestors)' },
        { era: '1565–1946 CE', label: 'Spanish loan stratum & post-1898 Philippine English bilingualism' }
      ],
      chain: [HUBS.TAIWAN_HOME],
      secondaryRoutes: [{ from: HUBS.IBERIA, color: '#e11d48', label: 'Spanish Lexical Layer (1565–1898 CE)' }],
      notes: 'The Philippines was the crucial first staging ground (~2200 BCE) of the Out-of-Taiwan Malayo-Polynesian expansion that later peopled Indonesia, Polynesia, and Madagascar. Tagalog (Filipino), Cebuano, and Ilocano are Austronesian core languages enriched by Malay, Sanskrit, Spanish, and English contact.'
    },
    TWN: {
      corridorId: 'austronesian',
      title: 'Dual Origin: Indigenous Austronesian Urheimat + 17th-c. Sinitic Settlement',
      homeland: 'Indigenous Formosan (In-Situ Urheimat ~3500 BCE) + Fujian Sinitic (17th c. CE)',
      era: 'c. 3500 BCE (Austronesian Homeland) • 17th c. CE / 1945+ (Min/Hakka & Mandarin)',
      driver: 'Home to 9 of 10 primary Austronesian branches; later Hoklo (Hokkien), Hakka & Mandarin Chinese migrations',
      color: '#10b981',
      stages: [
        { era: 'c. 3500–3000 BCE', label: 'Taiwan hosts the ancestral Formosan homeland of all Austronesian languages worldwide' },
        { era: 'c. 2200 BCE', label: 'Malayo-Polynesian voyagers depart Taiwan southward across the Pacific & Indian Oceans' },
        { era: '17th c. CE–1949', label: 'Southern Min (Taiwanese Hokkien), Hakka & post-1945 Mandarin arrive from mainland China' }
      ],
      chain: [HUBS.YELLOW_RIVER, HUBS.FUJIAN_SEA],
      notes: 'Taiwan occupies a uniquely pivotal place in world linguistics: its indigenous Formosan peoples speak 9 of the 10 primary branches of the Austronesian family (making Taiwan the Out-of-Taiwan Urheimat), while majority spoken Taiwanese Hokkien, Hakka, and Mandarin arrived via Sino-Tibetan migrations from mainland China.'
    },
    PNG: {
      corridorId: 'austronesian',
      title: 'Deep Sahul Antiquity (~45,000+ BP Papuan) + Austronesian Coast + Tok Pisin',
      homeland: 'Sahul / New Guinea Highlands (~45,000 BP) + Out-of-Taiwan Coast (~1500 BCE)',
      era: 'c. 45,000+ BP (Papuan Diversity) • c. 1500 BCE (Lapita Austronesian)',
      driver: 'Earth\'s highest linguistic density (~840 languages across >30 Papuan families + coastal Austronesian + 19th-c. Tok Pisin creole)',
      color: '#14b8a6',
      stages: [
        { era: 'c. 45,000+ BP', label: 'Pleistocene settlement of Sahul produces dozens of independent highland Papuan families (Trans-New Guinea)' },
        { era: 'c. 1500 BCE', label: 'Austronesian Lapita seafarers settle northern coasts & Bismarck Archipelago' },
        { era: '19th–20th c. CE', label: 'Pacific plantation trade births Tok Pisin & Hiri Motu lingua francas' }
      ],
      chain: [HUBS.TAIWAN_HOME, HUBS.LUZON_PHL, HUBS.LAPITA_BISMARCK],
      notes: 'Papua New Guinea holds ~840 living languages—about 12% of humanity\'s linguistic diversity—reflecting 45,000+ years of highland Papuan divergence combined with c. 1500 BCE coastal Austronesian Lapita arrivals and modern Melanesian Tok Pisin creolization.'
    },
    IND: {
      corridorId: 'indo-european',
      title: 'Four-Family Convergence: Dravidian, Indo-Aryan, Austroasiatic & Tibeto-Burman',
      homeland: 'Peninsular India (Dravidian ~3000 BCE) + Steppe/Central Asia (Indo-Aryan ~1500 BCE)',
      era: 'c. 3000+ BCE (Dravidian & Munda) • c. 1500 BCE (Vedic Sanskrit) • 18th c. CE (English)',
      driver: 'Deep indigenous Dravidian & Munda societies converging with Bronze-Age Indo-Aryan pastoralists to form a unified South Asian Sprachbund',
      color: '#f59e0b',
      stages: [
        { era: 'c. 3000+ BCE', label: 'Indigenous Proto-Dravidian & Munda (Austroasiatic) across Peninsular & Eastern India' },
        { era: 'c. 1800–1500 BCE', label: 'Indo-Aryan (Vedic Sanskrit) enters Punjab via Central Asian corridor' },
        { era: 'c. 500 BCE–Present', label: 'Hindi, Bengali, Marathi (Indo-Aryan) & Tamil, Telugu, Kannada, Malayalam (Dravidian) share deep structural convergence + English administration' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CA_STEPPE, HUBS.PUNJAB_INDIA],
      secondaryRoutes: [{ from: HUBS.RED_RIVER_VNM, color: '#84cc16', label: 'Munda Austroasiatic Stream (c. 2000 BCE)' }],
      notes: 'India bridges four distinct primary language families: Northern/Central Indo-Aryan (derived from Vedic Sanskrit c. 1500 BCE via the Eurasian Steppe), Southern Dravidian (indigenous to South Asia for 4,500+ years), Eastern Munda (Austroasiatic), and Himalayan Tibeto-Burman—converging structurally over three millennia.'
    },
    LKA: {
      corridorId: 'indo-european',
      homeland: 'Northern India Indo-Aryan Migration (~5th c. BCE) + Southern Dravidian (Tamil)',
      era: 'c. 5th c. BCE (Sinhala Maritime Arrival) • Deep Dravidian Tamil Roots',
      driver: 'Prakrit sea migration from NW/Eastern India to Sri Lanka meeting nearby South Indian Tamil Dravidian',
      color: '#f59e0b',
      stages: [
        { era: 'c. 1500–500 BCE', label: 'Old Indo-Aryan (Gangetic Prakrits) & South Indian Tamil Dravidian' },
        { era: 'c. 5th c. BCE', label: 'Indo-Aryan settlers sail south to Sri Lanka (evolving Sinhala with strong Dravidian substrate)' }
      ],
      chain: [HUBS.CA_STEPPE, HUBS.PUNJAB_INDIA],
      secondaryRoutes: [{ from: HUBS.SOUTH_INDIA, color: '#10b981', label: 'Tamil Dravidian Roots in Sri Lanka' }],
      notes: 'Sri Lanka\'s Sinhala is the southernmost native Indo-Aryan language—carried by sea from northern India around the 5th century BCE—while closely coexisting for two millennia with Dravidian Tamil.'
    },
    BRA: {
      corridorId: 'americas',
      homeland: 'SW Amazonia (Indigenous Tupian/Macro-Jê) + Pontic Steppe → Portugal (1500 CE)',
      era: 'c. 1000 BCE (Tupian Coast Spread) • 1500 CE (Portuguese Arrival)',
      driver: 'Pre-Columbian Tupian & Macro-Jê dispersals; 16th-c. Portuguese Atlantic settlement & African Bantu/Yoruba substrate influence',
      color: '#f43f5e',
      stages: [
        { era: 'c. 1000 BCE–1500 CE', label: 'SW Amazonia → Tupinambá & Macro-Jê along Atlantic coast' },
        { era: '1500 CE–Present', label: 'Portuguese (Iberian Romance) becomes national majority, absorbing Tupi flora/place-names & African Bantu/Yoruba influence' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.PORTUGAL],
      secondaryRoutes: [{ from: HUBS.CAMEROON_BANTU, color: '#16a34a', label: 'Transatlantic African Kimbundu/Kikongo/Yoruba Substrate (16th–19th c. CE)' }],
      notes: 'Portuguese arrived in 1500 CE—derived via Rome from the Pontic–Caspian Steppe—initially competing with Língua Geral (Tupi-based) until 1758, while absorbing thousands of Tupian and West/Central African words.'
    },
    PRY: {
      corridorId: 'americas',
      homeland: 'SW Amazonia (Guaraní Tupian Homeland) + Iberia (Spanish 1537 CE)',
      era: 'c. 1000 BCE (Proto-Tupian) • 1537 CE (Bilingual Spanish–Guaraní Society)',
      driver: 'Rare deep bilingual equilibrium where indigenous Tupí-Guaraní coexists equally with Spanish nationwide',
      color: '#10b981',
      stages: [
        { era: 'c. 1000 BCE–500 CE', label: 'SW Amazonia (Madeira-Guaporé Proto-Tupian → Paraná-Paraguay Guaraní)' },
        { era: '1537 CE–Present', label: 'Colonial Asunción bilingualism makes Guaraní and Spanish co-official national languages' }
      ],
      chain: [HUBS.SW_AMAZON],
      secondaryRoutes: [{ from: HUBS.IBERIA, color: '#e11d48', label: 'Spanish Arrival (1537 CE)' }],
      notes: 'Paraguay is unique in the Americas for retaining an indigenous language—Guaraní (Tupian family originating in SW Amazonia)—as a majority spoken & co-official national language alongside Iberian Spanish.'
    },
    PER: {
      corridorId: 'americas',
      homeland: 'Central Peruvian Andes (Quechuan & Aymaran) + Iberia (Spanish 1532 CE)',
      era: 'c. 500–1500 CE (Andean Quechuan Expansion) • 1532 CE (Spanish)',
      driver: 'Pre-Inca & Inca Andean highland administrative spread of Quechua, later overlaid by colonial Castilian Spanish',
      color: '#e11d48',
      stages: [
        { era: 'c. 1st Mil. CE', label: 'Central Peruvian coast/highlands (Proto-Quechuan diverges from Aymaran neighbor)' },
        { era: '1438–1532 CE', label: 'Inca Empire expands Southern Quechua from Ecuador to Argentina' },
        { era: '1532 CE–Present', label: 'Iberian Spanish coexists with millions of Quechua & Aymara speakers' }
      ],
      chain: [HUBS.IBERIA],
      secondaryRoutes: [{ from: HUBS.ANDES_CUSCO, color: '#f59e0b', label: 'Indigenous Quechua/Aymara Highland Hearth' }],
      notes: 'Modern Peru layers Castilian Spanish (arriving 1532 CE) atop deep Andean Quechuan and Aymaran civilizations—distinct primary South American families shaped by centuries of highland exchange.'
    },
    MEX: {
      corridorId: 'americas',
      homeland: 'Mesoamerica (Uto-Aztecan Nahuatl, Mayan, Oto-Manguean) + Iberia (Spanish 1519 CE)',
      era: 'c. 2000 BCE–1500 CE (Mesoamerican Hearths) • 1519 CE (Spanish)',
      driver: 'Deep Mesoamerican linguistic area (Nahuatl, Yucatec Maya, Zapotec, Mixtec) layered under colonial Castilian',
      color: '#e11d48',
      stages: [
        { era: 'c. 2000 BCE–1500 CE', label: 'Oto-Manguean, Mayan & southern Uto-Aztecan (Nahuatl) flourish across Mesoamerica' },
        { era: '1519 CE–Present', label: 'Castilian Spanish spreads nationwide, incorporating hundreds of Nahuatl & Mayan words worldwide' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.IBERIA],
      secondaryRoutes: [{ from: HUBS.SONORA_MESO, color: '#f59e0b', label: 'Uto-Aztecan Southward Migration → Central Mexico' }],
      notes: 'While Spanish (from Iberia via Rome and the Pontic Steppe) became Mexico\'s post-1519 national language, Mexico retains 68 national indigenous language groups led by Nahuatl (Uto-Aztecan) and Mayan.'
    },
    CHN: {
      corridorId: 'sino-tibetan',
      title: 'Sino-Tibetan Yellow River Hearth → Imperial & Regional Chinese Diversity',
      homeland: 'Middle–Upper Yellow River Basin (Yangshao Neolithic)',
      era: 'c. 4500 BCE (Sino-Tibetan) • 1st Mil. BCE (Old Chinese Southern Spread)',
      driver: 'Millet agriculture along Yellow River; Shang/Zhou/Qin/Han expansion across Yangtze absorbing Yue/Kra-Dai & Hmong-Mien substrates',
      color: '#dc2626',
      stages: [
        { era: 'c. 4500–2500 BCE', label: 'Middle–Upper Yellow River (Proto-Sino-Tibetan split)' },
        { era: 'c. 1250–200 BCE', label: 'Oracle Bone Shang → Qin-Han Sinitic spread south of Yangtze' },
        { era: '1st Mil. CE–Present', label: 'Mandarin, Yue, Wu, Min, Hakka, Tibetan, Uyghur (Turkic) & Mongolic diversity' }
      ],
      chain: [HUBS.YELLOW_RIVER, HUBS.NORTH_CHINA],
      secondaryRoutes: [{ from: HUBS.YELLOW_RIVER, color: '#fb923c', label: 'Tibeto-Burman → Plateau & SW China' }],
      notes: 'Mandarin and other Sinitic languages trace back ~6,500 years to Yellow River millet cultivators. China also spans western Tibeto-Burman (Tibetan), Turkic (Uyghur, Kazakh), Mongolic, and southern Kra-Dai & Hmong-Mien families.'
    },
    SGP: {
      corridorId: 'austronesian',
      title: 'Singapore: Austronesian Malay Base + Sinitic, Dravidian & Maritime English',
      homeland: 'Taiwan → Malay Archipelago (Indigenous Malay) + Fujian/Guangdong + South India + Britain',
      era: 'c. 500 BCE (Malayic) • 19th c. CE (Sinitic, Tamil & English Hub)',
      driver: 'Strategic Malacca Strait port uniting Malay heritage with Southern Chinese, Tamil, & British trade migrations',
      color: '#10b981',
      stages: [
        { era: 'c. 1500 BCE–7th c. CE', label: 'Taiwan → Borneo/Sumatra → Malayic Riau-Johor settlement (national language: Malay)' },
        { era: '1819 CE–20th c.', label: 'Hokkien/Teochew/Cantonese/Mandarin (Sino-Tibetan), Tamil (Dravidian), & English merge in port city' }
      ],
      chain: [HUBS.TAIWAN_HOME, HUBS.SULAWESI_ISEA, HUBS.MALAY_JAVA],
      secondaryRoutes: [
        { from: HUBS.LINGNAN_SOUTH, color: '#dc2626', label: 'Fujian/Guangdong Sinitic Diaspora (19th c. CE)' },
        { from: HUBS.SOUTH_INDIA, color: '#f59e0b', label: 'Tamil Dravidian Maritime Ties (19th c. CE)' }
      ],
      notes: 'Singapore bridges four major world language families: Indigenous Austronesian (Malay, national language), Sino-Tibetan (Mandarin, Hokkien, Cantonese), Dravidian (Tamil), and Indo-European (English).'
    },
    FJI: {
      corridorId: 'austronesian',
      title: 'Lapita Pioneer Horizon → Fiji (plus 19th-c. Hindi & English)',
      homeland: 'Taiwan → Philippines → Bismarck (Lapita) → Fiji Archipelago',
      era: 'c. 900 BCE (Lapita Polynesian Gateway) • 1879+ CE (Fiji Hindi)',
      driver: 'Austronesian Lapita navigation marks the eastern Melanesian/Polynesian frontier; 19th-c. British colonial Indian indenture adds Indo-Aryan Fiji Hindi',
      color: '#06b6d4',
      stages: [
        { era: 'c. 3000–1400 BCE', label: 'Taiwan → Bismarck Archipelago Lapita voyaging culture' },
        { era: 'c. 900 BCE', label: 'First human settlement of Fiji (ancestral Bauan / iTaukei Oceanic languages)' },
        { era: '1879–1916 CE', label: 'North Indian Bhojpuri/Awadhi indentured laborers evolve distinct Fiji Hindi' }
      ],
      chain: [HUBS.TAIWAN_HOME, HUBS.LAPITA_BISMARCK],
      secondaryRoutes: [{ from: HUBS.PUNJAB_INDIA, color: '#f59e0b', label: 'Fiji Hindi (Indo-Aryan Indentured Arrival, 1879+ CE)' }],
      notes: 'Fiji sits at the pivotal linguistic hinge where Lapita Austronesian sailors first bridged Western Melanesia and Remote Polynesia (~900 BCE), later joined by British English and 19th-century Indo-Aryan Fiji Hindi.'
    },
    NZL: {
      corridorId: 'austronesian',
      title: 'Aotearoa: Last Major Frontier of East Polynesian Voyaging (+ British English)',
      homeland: 'Taiwan → Lapita → Society Islands (Tahiti) → Aotearoa/New Zealand (+ Britain)',
      era: 'c. 1250–1300 CE (Polynesian Māori Arrival) • 1840+ CE (New Zealand English)',
      driver: 'Centuries of East Polynesian ocean navigation complete Austronesian settlement; 19th-c. British settlement brings Southern Hemisphere English',
      color: '#06b6d4',
      stages: [
        { era: 'c. 3000–900 BCE', label: 'Taiwan → Bismarck Lapita → Samoa/Tonga' },
        { era: 'c. 1250–1300 CE', label: 'Society Islands double-hulled canoes settle Aotearoa → Te Reo Māori' },
        { era: '19th c. CE–Present', label: 'British/Australian English settlers merge with Māori words into New Zealand English' }
      ],
      chain: [HUBS.TAIWAN_HOME, HUBS.LAPITA_BISMARCK, HUBS.SOCIETY_TAHITI],
      secondaryRoutes: [{ from: HUBS.BRITAIN, color: '#0284c7', label: 'British English Settlement (1840+ CE)' }],
      notes: 'Aotearoa (New Zealand) marks the southern apex of the Polynesian Triangle—settled c. 1250–1300 CE by Te Reo Māori voyagers from Eastern Polynesia after a 4,200-year migration from Taiwan—joined from 1840 by British settlers.'
    },
    TLS: {
      corridorId: 'austronesian',
      homeland: 'Taiwan → Maluku/Timor Austronesian (Tetum) + Ancient Papuan + Portuguese',
      era: 'c. 1500 BCE (Austronesian Entry) • Older Papuan Strata • 1515 CE (Portuguese)',
      driver: 'Austronesian mariners meet non-Austronesian East Timor (Papuan) inhabitants, followed by Portuguese maritime trade',
      color: '#10b981',
      stages: [
        { era: 'Pre-2000 BCE', label: 'Non-Austronesian East Timorese (Papuan-related Fataluku, Bunak) inhabit eastern Timor' },
        { era: 'c. 1500 BCE–1500 CE', label: 'Austronesian Tetum arrives from Maluku/Central Indonesian islands' },
        { era: '1515 CE–Present', label: 'Portuguese becomes co-official & heavily enriches Tetum Praśa vocabulary' }
      ],
      chain: [HUBS.TAIWAN_HOME, HUBS.LUZON_PHL, HUBS.SULAWESI_ISEA],
      secondaryRoutes: [{ from: HUBS.PORTUGAL, color: '#f43f5e', label: 'Portuguese Maritime Administration (1515+ CE)' }],
      notes: 'Timor-Leste sits right on the Wallacean frontier between Austronesian (Tetum) and East Indonesian Papuan-related tongues, later infused with Portuguese loans during 450 years of Iberian contact.'
    },
    IRQ: {
      corridorId: 'afroasiatic',
      homeland: 'Fertile Crescent Semitic + Arabia (Arabic) + Iranian Plateau (Kurdish)',
      era: 'c. 3000 BCE (Akkadian/Aramaic) • 7th c. CE (Arabic) • Indo-Iranian Kurdish',
      driver: 'Mesopotamian Semitic continuity (Akkadian → Aramaic → Iraqi Arabic) meeting NW Iranian Kurdish in the Zagros',
      color: '#eab308',
      stages: [
        { era: 'c. 3000–500 BCE', label: 'Akkadian & Imperial Aramaic dominate Mesopotamia (after Sumerian isolate)' },
        { era: '7th c. CE–Present', label: 'Arabian Arabic expands over Aramaic substrate; NW Iranian Kurdish thrives in northern Iraq' }
      ],
      chain: [HUBS.LEVANT_CORE, HUBS.HEJAZ_ARABIA],
      secondaryRoutes: [{ from: HUBS.IRAN_PLATEAU, color: '#0d9488', label: 'NW Iranian Kurdish (Zagros Mountain Corridor)' }],
      notes: 'Iraqi Arabic carries deep Mesopotamian Aramaic and Akkadian traces alongside Arabian Semitic roots, sharing Iraq officially with Indo-Iranian Kurdish in the north.'
    },
    MAR: {
      corridorId: 'afroasiatic',
      homeland: 'Indigenous Atlas Amazigh (Berber) + Arabian Peninsula (Arabic 7th–11th c. CE)',
      era: 'Prehistoric Afroasiatic (Amazigh) • 7th–11th c. CE (Arabic & Banu Hilal)',
      driver: 'Millennia of indigenous North African Amazigh civilization reshaped by two medieval waves of Arabicization',
      color: '#eab308',
      stages: [
        { era: 'Prehistoric BCE', label: 'Afroasiatic Amazigh (Tamazight) spoken from Egypt Siwa to the Canary Islands' },
        { era: '7th & 11th c. CE', label: 'Urban Arab conquests + nomadic Banu Hilal/Sulaym migration establish Darija Arabic over Amazigh substrate' }
      ],
      chain: [HUBS.HEJAZ_ARABIA, HUBS.EGYPT_NILE],
      secondaryRoutes: [{ from: HUBS.EGYPT_NILE, color: '#ca8a04', label: 'Ancient Afroasiatic Amazigh Atlas Continuity' }],
      notes: 'Morocco is anchored by two sister Afroasiatic branches: indigenous Amazigh (Tamazight, Rifian, Tashelhit) rooted in North Africa since prehistory, and Moroccan Arabic (Darija), which retains distinctive Amazigh phonology and vocabulary.'
    },
    LBN: {
      corridorId: 'afroasiatic',
      homeland: 'Levantine Phoenician/Aramaic Semitic Hearth → Arabic (+ Modern French)',
      era: 'c. 1200 BCE (Phoenician/Aramaic) → 7th c. CE (Arabic) → 20th c. (French)',
      driver: 'Indigenous Canaanite/Phoenician & Syriac-Aramaic shift into Levantine Arabic, later adding French/English education',
      color: '#eab308',
      stages: [
        { era: 'c. 1200 BCE–600 CE', label: 'Phoenician Canaanite (which birthed the Greek/Latin alphabets) → Aramaic' },
        { era: '7th c. CE–Present', label: 'Levantine Arabic blends Arabian Semitic with deep Aramaic & modern French/English vocabulary' }
      ],
      chain: [HUBS.LEVANT_CORE, HUBS.HEJAZ_ARABIA],
      secondaryRoutes: [{ from: HUBS.FRANCE, color: '#c026d3', label: 'Modern Cultural/Administrative French (20th c.)' }],
      notes: 'Levantine Arabic in Lebanon grew atop coastal Canaanite (Phoenician) and Syriac-Aramaic Semitic foundations—closely related Semitic sisters—later joined by widespread 20th-century French and English multilingualism.'
    },
    SOM: {
      corridorId: 'afroasiatic',
      homeland: 'Horn of Africa Cushitic Hearth (+ Indian Ocean Semitic Arabic Ties)',
      era: 'c. 7000–3000 BCE (Afroasiatic Cushitic Continuity)',
      driver: 'Millennia of Lowland East Cushitic continuity across the Horn with ancient Red Sea Arabic trade contact',
      color: '#ca8a04',
      stages: [
        { era: 'c. 10,000–5000 BCE', label: 'NE Africa / Red Sea (Proto-Afroasiatic → Cushitic divergence)' },
        { era: 'c. 2000 BCE–1st Mil. CE', label: 'Proto-Somali (Sam) spreads across Horn lowlands alongside medieval coastal Arabic exchanges' }
      ],
      chain: [HUBS.EGYPT_NILE, HUBS.HORN_AFRICA],
      notes: 'Somali belongs to the Lowland East Cushitic branch of Afroasiatic, indigenous to the Horn of Africa for thousands of years, historically borrowing religious and trade lexicon from Red Sea Arabic.'
    },
    SOL: {
      corridorId: 'afroasiatic',
      homeland: 'Horn of Africa Cushitic Hearth (Somali)',
      era: 'c. 7000–3000 BCE (Afroasiatic Cushitic Continuity)',
      driver: 'Continuous Lowland East Cushitic heritage along the Gulf of Aden',
      color: '#ca8a04',
      stages: [
        { era: 'c. 10,000–5000 BCE', label: 'NE Africa (Afroasiatic Cushitic)' },
        { era: 'c. 1st Mil. BCE–Present', label: 'Northern Somali Cushitic continuity on Gulf of Aden corridor' }
      ],
      chain: [HUBS.EGYPT_NILE, HUBS.HORN_AFRICA],
      notes: 'Northern Somali spoken across Somaliland belongs to the indigenous Cushitic branch of Afroasiatic rooted in the Horn of Africa.'
    },
    DJI: {
      corridorId: 'afroasiatic',
      homeland: 'Horn of Africa Cushitic (Afar & Somali) + French & Arabic',
      era: 'c. 7000–3000 BCE (Cushitic Continuity) • 19th c. CE (French)',
      driver: 'Two indigenous Afroasiatic Cushitic peoples (Afar & Somali Issa) at the Bab-el-Mandeb Strait, with French/Arabic state bilingualism',
      color: '#ca8a04',
      stages: [
        { era: 'Prehistoric BCE', label: 'Horn of Africa (Lowland East Cushitic Afar & Somali)' },
        { era: '19th–20th c. CE', label: 'French & Arabic become co-official administrative languages' }
      ],
      chain: [HUBS.EGYPT_NILE, HUBS.HORN_AFRICA],
      notes: 'Djibouti\'s everyday spoken languages—Somali and Afar—are sister Lowland East Cushitic tongues of Afroasiatic, paired officially with Arabic and French.'
    },
    SSD: {
      corridorId: 'bantu',
      homeland: 'Nile–Sudan Nilo-Saharan & Ubangi Heritage (+ Juba Arabic & English)',
      era: 'c. 6000+ BCE (Eastern Sudanic / Nilotic Continuity) • 19th–20th c. CE',
      driver: 'Deep Nilotic & Central Sudanic Nilo-Saharan homelands around the Sudd wetlands, plus Juba Arabic & post-independence English',
      color: '#16a34a',
      stages: [
        { era: 'Prehistoric BCE', label: 'Upper Nile Basin (Nilo-Saharan Nilotic: Dinka, Nuer, Shilluk, Bari + Niger-Congo Zande)' },
        { era: '19th–21st c. CE', label: 'Juba Arabic creole lingua franca & official English administration' }
      ],
      chain: [HUBS.GREAT_LAKES],
      notes: 'Most South Sudanese speak Nilotic and Central Sudanic languages (Nilo-Saharan family, unrelated to Arabic or Bantu) indigenous to the Upper Nile marshes, bridged nationally by Juba Arabic and English.'
    },
    TJK: {
      corridorId: 'indo-european',
      homeland: 'Pontic Steppe → Central Asian Steppe → Sogdiana/Bactria (Persian/Tajik)',
      era: 'c. 4000 BCE (PIE) → c. 1800 BCE (Indo-Iranian) → 9th–10th c. CE (New Persian)',
      driver: 'Ancient Eastern Iranian Sogdian/Bactrian heritage shifted via Samanid New Persian renaissance in Bukhara & Samarkand',
      color: '#0d9488',
      stages: [
        { era: 'c. 2100–1600 BCE', label: 'Central Asian Steppe (Proto-Indo-Iranian → Bactria & Sogdiana)' },
        { era: '9th–10th c. CE', label: 'Samanid Empire champions Classical New Persian (Tajik) across Transoxiana alongside Turkic & later Russian contact' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CA_STEPPE, HUBS.IRAN_PLATEAU],
      notes: 'Tajik is a Central Asian variety of Persian (Western Iranian branch of Indo-European) reflecting millennia of Iranian continuity in Transoxiana—not Turkic like neighboring Uzbekistan/Kyrgyzstan despite deep Turkic-Persian cultural exchange.'
    },
    KAZ: {
      corridorId: 'turkic',
      homeland: 'Altai–Orkhon Steppe → Kipchak Eurasian Steppe (+ Russian Contact)',
      era: 'c. 500 BCE (Turkic Homeland) • 13th–15th c. CE (Kipchak Kazakh)',
      driver: 'Kipchak Turkic steppe confederations absorbing earlier Scythian/Saka Indo-Iranian nomads; 19th–20th c. Russian bilingualism',
      color: '#a855f7',
      stages: [
        { era: 'c. 500 BCE–8th c. CE', label: 'Altai–Orkhon Eastern Steppe (Old Turkic)' },
        { era: '11th–15th c. CE', label: 'Kipchak Confederation → Kazakh Khanate across Central Steppe' },
        { era: '19th–20th c. CE', label: 'Imperial & Soviet era adds Russian co-official bilingualism' }
      ],
      chain: [HUBS.ALTAI_ORKHON],
      secondaryRoutes: [{ from: HUBS.MOSCOW_RUS, color: '#4f46e5', label: 'Russian Administrative Bilingualism (19th–20th c. CE)' }],
      notes: 'Kazakh belongs to the Kipchak (Northwestern) branch of Turkic carried westward from the Altai–Orkhon steppe across the Eurasian grasslands—superseding earlier Saka Iranian nomads long before 19th–20th century Russian arrival.'
    },
    KGZ: {
      corridorId: 'turkic',
      homeland: 'Yenisei / Altai Steppe → Tianshan Mountains (Kipchak Turkic)',
      era: 'c. 500 BCE–840 CE (Yenisei Kyrgyz Khaganate) • 15th c. CE (Tianshan)',
      driver: 'Southward movement of Kyrgyz from Upper Yenisei/Altai valleys into Tianshan highlands',
      color: '#a855f7',
      stages: [
        { era: 'c. 2nd c. BCE–9th c. CE', label: 'Upper Yenisei / Altai (Yenisei Kyrgyz)' },
        { era: '10th–16th c. CE', label: 'Migration southwest to Tianshan Mountains & convergence with Kipchak Turkic' }
      ],
      chain: [HUBS.ALTAI_ORKHON, HUBS.KAZAKH_KIPCHAK],
      secondaryRoutes: [{ from: HUBS.MOSCOW_RUS, color: '#4f46e5', label: 'Russian Co-official Contact (19th–20th c.)' }],
      notes: 'Kyrgyz traces back to one of the earliest recorded Turkic-speaking peoples along the Upper Yenisei and Altai, moving into the Tianshan mountains and aligning closely with Kipchak Kazakh.'
    },
    HTI: {
      corridorId: 'indo-european',
      homeland: 'West Africa (Fon/Gbe & Bantu) + French Romance Contact',
      era: '17th–18th c. CE (Saint-Domingue Plantation Contact)',
      driver: 'West African Niger-Congo grammars fused with French maritime lexicon into an independent national creole',
      color: '#c026d3',
      stages: [
        { era: '17th–18th c. CE', label: 'Enslaved Fon/Ewe/Kikongo speakers & French colonists forge Haitian Creole' },
        { era: '1804–Present', label: 'Independent Haiti elevates Haitian Creole (Kreyòl Ayisyen) alongside French' }
      ],
      chain: [HUBS.FRANCE, HUBS.WEST_AFRICA_NC],
      notes: 'Haitian Creole (Kreyòl) is the most widely spoken creole language in the world (~12M speakers), structurally shaped by West African Gbe and Central African Bantu syntax beneath mostly French-derived vocabulary.'
    },
    ISR: {
      corridorId: 'afroasiatic',
      homeland: 'Southern Levant Semitic Hearth (Canaanite Hebrew Revival + Arabic)',
      era: 'c. 1200 BCE (Ancient Hebrew) • 1880s–1948 (Modern Spoken Revival)',
      driver: 'Unique historical linguistic revitalization of liturgical/Biblical Canaanite Hebrew into an everyday native tongue alongside Levantine Arabic',
      color: '#eab308',
      stages: [
        { era: 'c. 1200–200 BCE', label: 'Levant (Canaanite Northwest Semitic → Biblical Hebrew → replaced in daily speech by Aramaic)' },
        { era: '1880s–20th c. CE', label: 'Modern Hebrew revived natively over Mishnaic/Biblical base alongside indigenous Palestinian/Levantine Arabic' }
      ],
      chain: [HUBS.LEVANT_CORE],
      notes: 'Hebrew represents history\'s sole large-scale restoration of an ancient dead vernacular (Northwest Semitic Canaanite) into a vibrant native language of millions, alongside closely related Central Semitic Arabic.'
    },
    PSE: {
      corridorId: 'afroasiatic',
      homeland: 'Levant / Arabia (Arabic over Aramaic & Canaanite Semitic Substrates)',
      era: 'c. 3800 BCE (Semitic) • 7th c. CE (Arabic Arrival in Levant)',
      driver: 'North Arabian Arabic merges with continuous Levantine Aramaic & Canaanite village substrates',
      color: '#eab308',
      stages: [
        { era: 'c. 1500 BCE–636 CE', label: 'Southern Levant Canaanite & Imperial Aramaic continuity' },
        { era: '7th c. CE–Present', label: 'Arabic becomes vernacular majority preserving Aramaic/Canaanite agricultural vocabulary' }
      ],
      chain: [HUBS.HEJAZ_ARABIA, HUBS.LEVANT_CORE],
      notes: 'Levantine Arabic belongs to Central Semitic (Afroasiatic), layering 7th-century Arabian Arabic atop earlier Levantine Aramaic and Canaanite Semitic dialects.'
    },
    ETH: {
      corridorId: 'afroasiatic',
      title: 'Dual Afroasiatic Cradle: Cushitic & Omotic + Red Sea Ethio-Semitic',
      homeland: 'Ethiopian Highlands (Cushitic/Omotic Continuity) + South Arabian Red Sea Crossing',
      era: 'c. 6000+ BCE (Cushitic & Omotic) • c. 1st Mil. BCE (Geʻez / Ethio-Semitic)',
      driver: 'Ancient indigenous Cushitic (Oromo, Somali) & Omotic peoples converging with South Semitic navigators across the Red Sea',
      color: '#f59e0b',
      stages: [
        { era: 'c. 6000+ BCE', label: 'Ethiopian Highlands & Rift (Proto-Cushitic & Omotic Afroasiatic branches)' },
        { era: 'c. 1st Mil. BCE', label: 'South Semitic crosses Bab-el-Mandeb → Ancient Geʻez literary tradition' },
        { era: 'Medieval–Present', label: 'Amharic, Tigrinya (Ethio-Semitic) & Oromo (Cushitic) share SOV Ethiopian Sprachbund traits' }
      ],
      chain: [HUBS.LEVANT_CORE, HUBS.SOUTH_ARABIA, HUBS.HORN_AFRICA],
      secondaryRoutes: [{ from: HUBS.EGYPT_NILE, color: '#ca8a04', label: 'Deep Highland Cushitic & Omotic Roots' }],
      notes: 'Ethiopia is a major cradle of Afroasiatic diversity—uniting indigenous highland Cushitic (Oromo, Afar) and Omotic families with Ethio-Semitic (Amharic, Tigrinya, descended from Geʻez via 1st-millennium BCE Red Sea crossings).'
    },
    ERI: {
      corridorId: 'afroasiatic',
      title: 'Red Sea Ethio-Semitic & Cushitic Confluence',
      homeland: 'Red Sea Corridor (Ethio-Semitic Tigrinya/Tigre + Cushitic Saho/Bilen)',
      era: 'c. 1st Mil. BCE (Geʻez/Aksumite Horizon) • Deep Cushitic Continuity',
      driver: 'Aksumite & South Arabian Red Sea links merging with millennia-old Cushitic & Nilo-Saharan communities',
      color: '#f59e0b',
      stages: [
        { era: 'Prehistoric BCE', label: 'Red Sea littoral (Cushitic & Kunama Nilo-Saharan roots)' },
        { era: 'c. 1st Mil. BCE–4th c. CE', label: 'Aksumite Geʻez heritage → Tigrinya & Tigre alongside Arabic' }
      ],
      chain: [HUBS.LEVANT_CORE, HUBS.SOUTH_ARABIA],
      notes: 'Tigrinya and Tigre preserve living Ethio-Semitic offshoots closely allied to ancient liturgical Geʻez, sharing Eritrea with Cushitic Saho, Afar, Beja, and Bilen as well as Arabic.'
    },
    BOL: {
      corridorId: 'americas',
      title: 'Highland Quechua & Aymara + Amazonian + Iberian Spanish',
      homeland: 'Andean Altiplano (Aymara & Quechua) + Lowland Amazon + Iberia (Spanish)',
      era: 'c. 1000 BCE+ (Aymara/Quechua & Guaraní) • 1538 CE (Spanish)',
      driver: 'Multi-ethnic Plurinational Andes combining Aymara, Quechua & 34 lowland families with colonial Castilian Spanish',
      color: '#e11d48',
      stages: [
        { era: 'Pre-1450 CE', label: 'Tiwanaku / Altiplano Aymara & expanding Inca Southern Quechua' },
        { era: '1538 CE–Present', label: 'Iberian Spanish spreads alongside constitutional status for 36 indigenous languages' }
      ],
      chain: [HUBS.IBERIA],
      secondaryRoutes: [{ from: HUBS.ANDES_CUSCO, color: '#f59e0b', label: 'Indigenous Quechua & Altiplano Aymara Homeland' }],
      notes: 'Bolivia recognizes 37 official languages, pairing Iberian Spanish with millennia-old Andean Aymara and Quechua (each spoken by millions) plus lowland Guaraní and Amazonian families.'
    },
    ECU: {
      corridorId: 'americas',
      title: 'Andean Kichwa & Coastal Families + Iberian Spanish',
      homeland: 'Northern Andes & Upper Amazon + Iberia (Spanish)',
      era: 'Pre-Inca Families & 15th-c. Kichwa • 1534 CE (Spanish)',
      driver: 'Pre-Columbian Barbacoan, Jivaroan (Shuar) & Inca Kichwa overlaid by Castilian Spanish',
      color: '#e11d48',
      stages: [
        { era: 'Pre-1450 CE', label: 'Barbacoan, Cañari & Amazonian Shuar; northern spread of Highland Kichwa (Quechua)' },
        { era: '1534 CE–Present', label: 'Colonial Castilian Spanish absorbs rich Kichwa vocabulary' }
      ],
      chain: [HUBS.IBERIA],
      secondaryRoutes: [{ from: HUBS.ANDES_CUSCO, color: '#f59e0b', label: 'Highland Quechuan / Kichwa Dispersal' }],
      notes: 'Ecuador blends Iberian Spanish with Highland Kichwa (Northern Quechuan) and Amazonian Shuar.'
    },
    PYF: {
      corridorId: 'austronesian',
      title: 'Tahiti / Society Islands: Epicenter of East Polynesian Voyaging (+ French)',
      homeland: 'Taiwan → Samoa/Tonga → Society Islands (Tahitian) + France',
      era: 'c. 900–1000 CE (Tahitian Settlement) • 1842 CE (French)',
      driver: 'East Polynesian hub launching voyages to Hawaiʻi, Rapa Nui & New Zealand; later 19th-c. French Pacific rule',
      color: '#06b6d4',
      stages: [
        { era: 'c. 3000 BCE–900 CE', label: 'Taiwan → Lapita → Samoa/Tonga → Society & Marquesas Archipelagos' },
        { era: 'c. 1000–1300 CE', label: 'Navigators radiate outward from Tahiti to Hawaiʻi, Rapa Nui & Aotearoa' },
        { era: '1842 CE–Present', label: 'French administration becomes co-official alongside Reo Tahiti' }
      ],
      chain: [HUBS.TAIWAN_HOME, HUBS.LAPITA_BISMARCK, HUBS.FIJI_SAMOA],
      secondaryRoutes: [{ from: HUBS.FRANCE, color: '#c026d3', label: 'French Administrative Layer (19th c.–Present)' }],
      notes: 'Tahiti and the Society/Marquesas islands served ~1000 CE as the historic launching pad for the final long-range Polynesian voyages to Hawaiʻi, Easter Island, and New Zealand.'
    },
    COM: {
      corridorId: 'bantu',
      title: 'Eastern Bantu Sabaki (Shikomori) + Swahili/Arabic Indian Ocean Ties',
      homeland: 'Cameroon → Great Lakes → East African Swahili Coast → Comoros',
      era: 'c. 1st Mil. CE (Bantu Settlers) • Medieval Indian Ocean Arabic/French Ties',
      driver: 'Sabaki Bantu mariners (sister language to Swahili) migrating from East African coast across Mozambique Channel',
      color: '#16a34a',
      stages: [
        { era: 'c. 3000 BCE–500 CE', label: 'Cameroon → Great Lakes → East African Coast (Proto-Sabaki Bantu)' },
        { era: 'c. 8th–11th c. CE', label: 'Comorian (Shikomori) settles archipelago, enriched by Shirazi/Arabic trade & later French' }
      ],
      chain: [HUBS.CAMEROON_BANTU, HUBS.GREAT_LAKES, HUBS.SWAHILI_COAST],
      notes: 'Comorian (Shikomori) is an Eastern Bantu Sabaki language closely allied to coastal Swahili, carrying deep Indian Ocean Arabic loan layers and official French.'
    },
    GNQ: {
      corridorId: 'bantu',
      homeland: 'Cameroon–Equatorial Bantu (Fang & Bubi) + Iberian Spanish (1778+)',
      era: 'c. 1500 BCE–1st Mil. CE (Bantu Homeland Zone) • 1778 CE (Spanish)',
      driver: 'Located adjacent to the Proto-Bantu homeland (Fang, Bubi), uniquely adopted Spanish under 1778 Treaty of El Pardo',
      color: '#22c55e',
      stages: [
        { era: 'c. 2000 BCE–1st Mil. CE', label: 'NW Bantu Fang & Bioko Bubi evolve near the Cameroon–Cross River hearth' },
        { era: '1778–1968 CE', label: 'Spanish replaces Portuguese rule, making Equatorial Guinea Africa\'s sole official Hispanophone state' }
      ],
      chain: [HUBS.CAMEROON_BANTU],
      secondaryRoutes: [{ from: HUBS.IBERIA, color: '#e11d48', label: 'Spanish Colonial Administration (1778–1968 CE)' }],
      notes: 'Equatorial Guinea lies immediately adjacent to the Proto-Bantu homeland (Fang & island Bubi), uniquely paired in Africa with Castilian Spanish (plus Portuguese & French).'
    },
    CPV: {
      corridorId: 'indo-european',
      homeland: 'Portugal + West Africa (Wolof, Mandinka, Temne → Kabuverdianu Creole)',
      era: 'c. 1462–16th c. CE (World\'s Oldest Living Atlantic Creole)',
      driver: '15th-century Portuguese maritime staging post mixing Iberian Portuguese vocabulary with Upper Guinea Niger-Congo grammars',
      color: '#f43f5e',
      stages: [
        { era: '1462–1550 CE', label: 'Uninhabited islands settled by Portuguese mariners & enslaved West African peoples' },
        { era: '16th c. CE–Present', label: 'Kabuverdianu Creole crystallizes alongside Standard Portuguese' }
      ],
      chain: [HUBS.PORTUGAL, HUBS.WEST_AFRICA_NC],
      notes: 'Cape Verdean Creole (Kabuverdianu) is one of the oldest surviving Atlantic creoles, blending 15th–16th century Portuguese lexicon with Upper Guinea West African syntactic structures.'
    },
    STP: {
      corridorId: 'indo-european',
      homeland: 'Portugal + Gulf of Guinea Bantu (Edo & Kikongo → Forro / Principense Creoles)',
      era: '1470s–16th c. CE (Gulf of Guinea Plantation Contact)',
      driver: 'Portuguese maritime sugar economy synthesizing Gulf of Guinea Edo/Kikongo substrates into Forro, Angolar & Lung\'Ie creoles',
      color: '#f43f5e',
      stages: [
        { era: '1470–1550 CE', label: 'Portuguese & Benin/Kongo speakers meet on uninhabited Gulf of Guinea islands' },
        { era: '16th c. CE–Present', label: 'Forro Creole & Standard Portuguese share national daily life' }
      ],
      chain: [HUBS.PORTUGAL, HUBS.CAMEROON_BANTU],
      notes: 'São Tomé and Príncipe nurtures a distinct Gulf of Guinea cluster of Portuguese-lexifier creoles (Forro, Angolar) deeply shaped by Benin (Edo) and Kongo (Bantu) substrates.'
    },
    CYP: {
      corridorId: 'indo-european',
      homeland: 'Aegean Mycenaean Greek (~1100 BCE) + Anatolian Oghuz Turkish (1571+)',
      era: 'c. 12th–11th c. BCE (Arcadocypriot Greek) • 1571 CE (Ottoman Turkish)',
      driver: 'Late Bronze-Age Mycenaean settlement on Cyprus; 16th-century Ottoman Anatolian arrival creating Greek & Turkish communities',
      color: '#2563eb',
      stages: [
        { era: 'c. 1100 BCE', label: 'Mycenaean Greeks settle Cyprus (retaining distinct Arcadocypriot → Cypriot Greek)' },
        { era: '1571 CE–Present', label: 'Ottoman Anatolian Oghuz Turkish joins Greek on the island alongside British English contact' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.BALKANS],
      secondaryRoutes: [{ from: HUBS.ANATOLIA_TURK, color: '#9333ea', label: 'Anatolian Turkish Settlement (1571 CE)' }],
      notes: 'Cyprus unites two completely unrelated traditions: Cypriot Greek (continuous on the island since Mycenaean times ~1100 BCE) and Cypriot Turkish (arriving from Anatolia after 1571 CE).'
    },
    USA: {
      corridorId: 'indo-european',
      homeland: 'Pontic Steppe → Britain (Colonial English) + Diverse Indigenous North America',
      era: '15,000+ BP (Indigenous Families) • 1607 CE (Colonial English)',
      driver: 'Over 300 indigenous languages (Algonquian, Na-Dené, Siouan, Uto-Aztecan); 17th-c. British English, Spanish & African contributions',
      color: '#0284c7',
      stages: [
        { era: 'c. 15,000+ BP–1600 CE', label: 'Scores of indigenous North American families (Navajo Na-Dené, Cherokee Iroquoian, Lakota Siouan, Algonquian)' },
        { era: '1607 CE–19th c.', label: 'British English dialects arrive on Atlantic coast + Spanish in SW (1598+) + African & immigrant languages' }
      ],
      chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER, HUBS.BRITAIN],
      secondaryRoutes: [{ from: HUBS.IBERIA, color: '#e11d48', label: 'Spanish Southwest & Americas (16th–19th c.)' }],
      notes: 'American English stems from 17th-century British settlers (preserving older features like rhotic /r/), interacting across the continent with indigenous Algonquian/Na-Dené/Iroquoian families, West African rhythms, Spanish, and global immigrant waves.'
    },
    ATA: {
      corridorId: 'all',
      title: 'Antarctica: Multinational Research Presence (No Indigenous Population)',
      homeland: 'No Indigenous Language Family (20th-Century Scientific Expeditions)',
      era: '1900s–Present (Seasonal International Research Stations)',
      driver: 'Rotating international polar teams speaking English, Spanish, Russian, Chinese, French, etc.',
      color: '#38bdf8',
      stages: [
        { era: 'Pre-1820 CE', label: 'Uninhabited continent with no permanent human settlement or indigenous language' },
        { era: '1959 Antarctic Treaty', label: 'Permanent multinational scientific research stations communicate mainly in English, Spanish & Russian' }
      ],
      chain: [],
      notes: 'Antarctica is the only continent with no native human population or prehistoric linguistic homeland; today\'s spoken presence consists exclusively of rotating research personnel.'
    }
  };

  function getCountryPrimaryLanguage(country) {
    if (!country) return '';
    const lang0 = (country.languages && country.languages[0] && country.languages[0].name) || '';
    const primary = country.primaryLanguage || lang0 || country.canonicalLanguage || '';
    return primary;
  }

  function hasWord(text, word) {
    return new RegExp(`\\b${word}\\b`, 'i').test(text || '');
  }

  function resolveCountryOrigin(country) {
    if (!country) return null;
    const iso = (country.iso3 || '').toUpperCase();
    if (COUNTRY_OVERRIDES[iso]) {
      const ov = COUNTRY_OVERRIDES[iso];
      return {
        corridorId: ov.corridorId || 'all',
        title: ov.title || `${country.name} Linguistic Lineage`,
        homeland: ov.homeland,
        era: ov.era,
        driver: ov.driver,
        color: ov.color || country.color || '#38bdf8',
        stages: ov.stages,
        chain: ov.chain || [],
        secondaryRoutes: ov.secondaryRoutes || [],
        notes: ov.notes
      };
    }

    const fam = (country.languageFamily || '').toLowerCase();
    const lang0 = (country.languages && country.languages[0] && country.languages[0].name) || '';
    const lang0Fam = ((country.languages && country.languages[0] && country.languages[0].family) || '').toLowerCase();
    const prim = getCountryPrimaryLanguage(country);
    const primFocus = ((lang0 && lang0.toLowerCase() !== 'official language') ? lang0 : prim).toLowerCase();
    const primLower = prim.toLowerCase();
    const combinedFam = `${fam} ${lang0Fam}`;
    const continent = (country.continent || '').toLowerCase();

    let branchKey = 'english_global';

    if (hasWord(primFocus, 'creole') && (combinedFam.includes('romance') || primLower.includes('french'))) {
      branchKey = 'french_creole';
    } else if (hasWord(primFocus, 'creole') || hasWord(primLower, 'tok pisin') || hasWord(primLower, 'bislama') || fam.includes('creole')) {
      branchKey = 'english_creole';
    } else if (hasWord(primFocus, 'spanish') || hasWord(primFocus, 'castilian') || hasWord(primFocus, 'catalan')) {
      branchKey = 'iberian_spanish';
    } else if (hasWord(primFocus, 'portuguese')) {
      branchKey = 'iberian_portuguese';
    } else if (hasWord(primFocus, 'french')) {
      if (continent.includes('africa')) branchKey = fam.includes('bantu') ? 'bantu_west' : 'west_african_nc';
      else branchKey = 'gallo_romance';
    } else if (hasWord(primFocus, 'italian')) {
      branchKey = 'italo_romance';
    } else if (hasWord(primFocus, 'romanian')) {
      branchKey = 'eastern_romance';
    } else if (hasWord(primFocus, 'german')) {
      branchKey = 'continental_germanic';
    } else if (hasWord(primFocus, 'dutch')) {
      branchKey = 'continental_germanic';
    } else if (hasWord(primFocus, 'swedish') || hasWord(primFocus, 'danish') || hasWord(primFocus, 'norwegian') || hasWord(primFocus, 'icelandic') || hasWord(primFocus, 'faroese')) {
      branchKey = 'north_germanic';
    } else if (hasWord(primFocus, 'irish')) {
      branchKey = 'celtic_ireland';
    } else if (hasWord(primFocus, 'lithuanian') || hasWord(primFocus, 'latvian') || combinedFam.includes('baltic')) {
      branchKey = 'baltic';
    } else if (hasWord(primFocus, 'russian') || hasWord(primFocus, 'ukrainian') || hasWord(primFocus, 'belarusian')) {
      branchKey = 'east_slavic';
    } else if (hasWord(primFocus, 'polish') || hasWord(primFocus, 'czech') || hasWord(primFocus, 'slovak')) {
      branchKey = 'west_slavic';
    } else if (hasWord(primFocus, 'serbian') || hasWord(primFocus, 'croatian') || hasWord(primFocus, 'bosnian') || hasWord(primFocus, 'bulgarian') || hasWord(primFocus, 'macedonian') || hasWord(primFocus, 'slovene') || hasWord(primFocus, 'slovenian') || hasWord(primFocus, 'montenegrin') || hasWord(primFocus, 'serbo-croatian')) {
      branchKey = 'south_slavic';
    } else if (hasWord(primFocus, 'greek')) {
      branchKey = 'hellenic';
    } else if (hasWord(primFocus, 'persian') || hasWord(primFocus, 'farsi') || hasWord(primFocus, 'dari') || hasWord(primFocus, 'tajik') || hasWord(primFocus, 'pashto') || hasWord(primFocus, 'kurdish') || combinedFam.includes('indo-iranian') && !combinedFam.includes('indo-aryan') && !hasWord(primFocus, 'urdu') && !hasWord(primFocus, 'hindi') && !hasWord(primFocus, 'bengali') && !hasWord(primFocus, 'nepali') && !hasWord(primFocus, 'sinhala') && !hasWord(primFocus, 'dhivehi')) {
      branchKey = 'iranian';
    } else if (hasWord(primFocus, 'hindi') || hasWord(primFocus, 'urdu') || hasWord(primFocus, 'bengali') || hasWord(primFocus, 'nepali') || hasWord(primFocus, 'sinhala') || hasWord(primFocus, 'dhivehi') || combinedFam.includes('indo-aryan')) {
      branchKey = 'indo_aryan';
    } else if (hasWord(primFocus, 'arabic') || hasWord(primFocus, 'hebrew')) {
      branchKey = 'arabic';
    } else if (hasWord(primFocus, 'amharic') || hasWord(primFocus, 'tigrinya')) {
      branchKey = 'ethio_semitic';
    } else if (hasWord(primFocus, 'somali') || combinedFam.includes('cushitic')) {
      branchKey = 'cushitic_horn';
    } else if (hasWord(primFocus, 'azerbaijani') || hasWord(primFocus, 'turkmen') || hasWord(primFocus, 'turkish')) {
      branchKey = 'oghuz_turkic';
    } else if (hasWord(primFocus, 'kazakh') || hasWord(primFocus, 'kyrgyz') || hasWord(primFocus, 'uzbek') || combinedFam.includes('turkic')) {
      branchKey = 'kipchak_karluk_turkic';
    } else if (hasWord(primFocus, 'dzongkha') || hasWord(primFocus, 'burmese')) {
      branchKey = 'tibeto_burman';
    } else if (hasWord(primFocus, 'mandarin') || hasWord(primFocus, 'cantonese') || combinedFam.includes('sino-tibetan')) {
      branchKey = 'sinitic';
    } else if (hasWord(primFocus, 'estonian') || hasWord(primFocus, 'finnish') || combinedFam.includes('finnic') || combinedFam.includes('uralic')) {
      branchKey = 'finnic';
    } else if (combinedFam.includes('kra-dai') || hasWord(primFocus, 'thai') || hasWord(primFocus, 'lao')) {
      return {
        corridorId: 'se-asia',
        title: 'Kra-Dai Dispersal: Lingnan → Mainland Southeast Asia',
        homeland: 'Lingnan (Guangxi / Guizhou, Southern China)',
        era: 'c. 1st Mil. BCE → 10th–13th c. CE (Tai Southward Migration)',
        driver: 'Southwestern Tai riverine expansion into Indochina & Chao Phraya valley',
        color: '#a855f7',
        stages: [
          { era: 'c. 1st Mil. BCE', label: 'Guangxi / Guizhou (Proto-Kra-Dai homeland)' },
          { era: '1st–13th c. CE', label: 'Southwestern Tai expansion into Laos, Thailand & Shan Hills' }
        ],
        chain: [HUBS.GUANGXI_KRA],
        secondaryRoutes: [],
        notes: 'Thai and Lao belong to the Kra-Dai (Tai-Kadai) family, migrating southwestward out of southern China (Lingnan) over the first and second millennia CE—unrelated genetically to Sinitic or Austroasiatic despite shared areal tones and vocabulary.'
      };
    } else if (combinedFam.includes('austroasiatic') || hasWord(primFocus, 'vietnamese') || hasWord(primFocus, 'khmer')) {
      return {
        corridorId: 'se-asia',
        title: 'Austroasiatic: Early Mainland SE Asian Riverine Hearth',
        homeland: 'Red & Mekong River Basins (Mainland Southeast Asia)',
        era: 'c. 2500–1500 BCE (Austroasiatic Rice Farming Dispersal)',
        driver: 'Ancient in-situ Austroasiatic riverine agriculturalist expansion (unrelated genetically to Sinitic)',
        color: '#84cc16',
        stages: [
          { era: 'c. 2500–1500 BCE', label: 'Red / Mekong river valleys (Proto-Austroasiatic)' },
          { era: '1st Mil. CE–Present', label: 'Mon-Khmer (Cambodia) & Vietic (Vietnam) diversify in mainland SE Asia' }
        ],
        chain: [HUBS.RED_RIVER_VNM],
        secondaryRoutes: [],
        notes: 'Vietnamese and Khmer form core branches of Austroasiatic—the ancient pre-Tai and pre-Sinitic Neolithic family of Mainland Southeast Asia.'
      };
    } else if (combinedFam.includes('austronesian') || hasWord(primFocus, 'malay') || hasWord(primFocus, 'indonesian') || hasWord(primFocus, 'tetum') || hasWord(primFocus, 'tongan') || hasWord(primFocus, 'samoan')) {
      branchKey = continent.includes('oceania') ? 'austronesian_oceanic' : 'austronesian_isea';
    } else if (combinedFam.includes('bantu') || (continent.includes('africa') && combinedFam.includes('niger-congo') && country.centroid && country.centroid[1] < 4)) {
      branchKey = (country.centroid && country.centroid[0] < 21 && country.centroid[1] > -12) ? 'bantu_west' : 'bantu_east';
    } else if (combinedFam.includes('niger-congo')) {
      branchKey = 'west_african_nc';
    } else if (continent.includes('oceania') && hasWord(primFocus, 'english')) {
      branchKey = country.iso3 === 'AUS' ? 'english_global' : 'austronesian_oceanic';
    } else if (continent.includes('africa') && hasWord(primFocus, 'english')) {
      branchKey = (country.centroid && country.centroid[1] < 3) ? 'bantu_east' : 'west_african_nc';
    } else if (hasWord(primFocus, 'english')) {
      branchKey = 'english_global';
    } else if (combinedFam.includes('afroasiatic')) {
      branchKey = 'arabic';
    } else if (combinedFam.includes('slavic')) {
      branchKey = 'south_slavic';
    } else if (combinedFam.includes('romance')) {
      branchKey = 'iberian_spanish';
    } else if (combinedFam.includes('germanic')) {
      branchKey = 'continental_germanic';
    }

    const br = BRANCHES[branchKey] || BRANCHES.english_global;
    return {
      corridorId: br.corridorId,
      title: `${country.name}: ${br.homeland}`,
      homeland: br.homeland,
      era: br.era,
      driver: br.driver,
      color: br.color || country.color || '#38bdf8',
      stages: br.stages,
      chain: br.chain || [],
      secondaryRoutes: br.secondaryRoutes || [],
      notes: br.notes
    };
  }

  const LANGUAGE_SEEDS = {
    spanish: {
      hub: HUBS.IBERIA,
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.IBERIA],
      title: 'Spanish (Castilian) Lineage & Atlantic Spread',
      homeland: 'Pontic–Caspian Steppe → Rome → Iberian Peninsula',
      era: 'c. 4000 BCE (PIE) → 2nd c. BCE (Latin) → 1492+ CE',
      mechanism: 'Vulgar Latin in Roman Hispania followed by post-1492 maritime expansion across the Americas & Equatorial Guinea',
      note: 'Castilian Spanish preserves spoken Iberian Latin grammar alongside Basque, Celtic, and >4,000 Arabic loanwords before spreading across 20+ nations.'
    },
    english: {
      hub: HUBS.BRITAIN,
      chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER, HUBS.BRITAIN],
      title: 'English Lineage & Maritime Global Dispersal',
      homeland: 'Pontic Steppe → North Sea Coast → Great Britain',
      era: 'c. 4000 BCE (PIE) → 5th c. CE (Anglo-Saxon) → 1607+ CE',
      mechanism: 'Ingvaeonic West Germanic arrival in Britain, infused with Old Norse & Norman-French lexicon, then British maritime spread',
      note: 'Although over half of modern English vocabulary was borrowed from French and Latin, its core grammar and basic vocabulary remain West Germanic.'
    },
    french: {
      hub: HUBS.FRANCE,
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.FRANCE],
      title: 'French Lineage & Global Francophonie Diffusion',
      homeland: 'Pontic Steppe → Rome → Gaul (Northern France)',
      era: 'c. 4000 BCE (PIE) → 1st c. BCE (Gaulish Latin) → 17th–20th c. CE',
      mechanism: 'Roman Vulgar Latin adapted in Celtic Gaul (with Frankish Germanic phonology) → Atlantic, Quebec & African administrative spread',
      note: 'Across much of Francophone Africa, French serves as an administrative superstrate alongside older indigenous Niger-Congo or Afroasiatic families.'
    },
    arabic: {
      hub: HUBS.HEJAZ_ARABIA,
      chain: [HUBS.LEVANT_CORE, HUBS.HEJAZ_ARABIA],
      title: 'Arabic (Central Semitic) Origin & Diffusion',
      homeland: 'Levant Semitic Hearth → Arabian Peninsula → MENA',
      era: 'c. 3800 BCE (Proto-Semitic) → 7th–11th c. CE (Arabic Expansion)',
      mechanism: 'Central Semitic emergence in N. Arabia/Syria → 7th–11th c. CE Arab-Islamic & Banu Hilal expansions across Fertile Crescent & North Africa',
      note: 'Regional Arabic varieties preserve Coptic (Egypt), Aramaic (Levant/Iraq), Amazigh (Maghreb), and South Arabian substratal layers.'
    },
    portuguese: {
      hub: HUBS.PORTUGAL,
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.PORTUGAL],
      title: 'Portuguese Lineage & Oceanic Voyaging Arcs',
      homeland: 'Pontic Steppe → Rome → Galicia–Northern Portugal',
      era: 'c. 4000 BCE (PIE) → 9th c. CE (Galician-Portuguese) → 15th–16th c. CE',
      mechanism: 'Northwestern Iberian Romance propelled across South Atlantic & Indian Ocean maritime routes (Brazil, PALOP Africa, Timor-Leste)',
      note: 'Portuguese-lexifier creoles (Kabuverdianu, Forro) represent some of the oldest surviving Atlantic contact languages.'
    },
    russian: {
      hub: HUBS.MOSCOW_RUS,
      chain: [HUBS.PIE_STEPPE, HUBS.PRIPYAT_SLAV, HUBS.MOSCOW_RUS],
      title: 'Russian (East Slavic) Steppe-to-Eurasia Spread',
      homeland: 'Pontic Steppe → Pripyat–Dnieper Basin → Upper Volga',
      era: 'c. 4000 BCE (PIE) → 6th–9th c. CE (East Slavic) → 16th–20th c. CE',
      mechanism: 'Medieval Kyivan Rus\' & Muscovy expansion eastward across Uralic, Turkic, and Siberian language territories',
      note: 'East Slavic functions across northern Eurasia alongside indigenous Uralic, Caucasian, and Turkic families.'
    },
    german: {
      hub: HUBS.CENTRAL_EUR_GER,
      chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER],
      title: 'German (West Germanic) Continental Roots',
      homeland: 'Pontic Steppe → Elbe–Rhine Germanic Basin',
      era: 'c. 4000 BCE (PIE) → c. 500 BCE (Proto-Germanic) → 6th–16th c. CE',
      mechanism: 'High German consonant shift across Alps/Rhine and medieval Central European settlement',
      note: 'Spans Standard High German alongside Low German, Austro-Bavarian, and Alemannic Swiss varieties.'
    },
    dutch: {
      hub: HUBS.CENTRAL_EUR_GER,
      chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER],
      title: 'Dutch (Low Franconian Germanic) Maritime Arcs',
      homeland: 'Pontic Steppe → Lower Rhine–Meuse–Scheldt Delta',
      era: 'c. 4000 BCE (PIE) → Medieval Low Franconian → 17th c. CE Maritime',
      mechanism: 'Low Franconian Germanic carried along 17th-c. Dutch maritime routes to Suriname, Caribbean ABC islands, & Southern Africa (Afrikaans)',
      note: 'Afrikaans diverged in Southern Africa from 17th-century Dutch through Khoisan, Bantu, and Malay contact.'
    },
    italian: {
      hub: HUBS.ITALY_ROME,
      chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME],
      title: 'Italian (Italo-Romance) Continental Lineage',
      homeland: 'Pontic Steppe → Central Italian Peninsula (Latium / Tuscany)',
      era: 'c. 4000 BCE (PIE) → c. 1200 BCE (Italic) → 14th c. CE (Tuscan)',
      mechanism: 'Continuous in-situ evolution from Roman Vulgar Latin with Florentine literary standardization',
      note: 'Shared across Italy, San Marino, Vatican City, and southern Switzerland alongside Gallo-Italic & Neapolitan regional languages.'
    },
    swedish: {
      hub: HUBS.SCANDINAVIA,
      chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER, HUBS.SCANDINAVIA],
      title: 'Swedish (East Norse North Germanic) Roots',
      homeland: 'Pontic Steppe → North European Plain → Southern Scandinavia',
      era: 'c. 4000 BCE (PIE) → c. 800 CE (Old East Norse)',
      mechanism: 'Nordic Bronze Age continuity & medieval Baltic settlement in Åland & coastal Finland',
      note: 'Closely related to Danish and Norwegian within the North Germanic continuum descending from Old Norse.'
    },
    turkish: {
      hub: HUBS.ANATOLIA_TURK,
      chain: [HUBS.ALTAI_ORKHON, HUBS.TIANSHAN_CA, HUBS.AZERBAIJAN_OGHUZ, HUBS.ANATOLIA_TURK],
      title: 'Turkish (Oghuz Turkic) Eurasian Corridor',
      homeland: 'Eastern Eurasian Steppe (Altai–Orkhon) → Central Asia → Anatolia',
      era: 'c. 500 BCE (Proto-Turkic) → 11th c. CE (Seljuk Entry)',
      mechanism: 'Nomadic Oghuz Seljuk movement from Transoxiana across Iran into Anatolia & Cyprus',
      note: 'Turkic is an independent primary family unrelated genetically to Arabic or Persian, and not part of a proven "Altaic" macro-family.'
    },
    mandarin: {
      hub: HUBS.NORTH_CHINA,
      chain: [HUBS.YELLOW_RIVER, HUBS.NORTH_CHINA],
      title: 'Mandarin (Sino-Tibetan Sinitic) Dispersal',
      homeland: 'Middle–Upper Yellow River Basin → North China Plain → South & Overseas',
      era: 'c. 4500 BCE (Sino-Tibetan) → 1st Mil. BCE–Present',
      mechanism: 'Yellow River millet agriculture & Qin–Han state spread; northern Koine standardization & maritime diaspora',
      note: 'Sino-Tibetan unites Sinitic (Mandarin, Yue, Min, Wu) with ~400 Tibeto-Burman languages across the Himalayas & Myanmar.'
    },
    hindi: {
      hub: HUBS.PUNJAB_INDIA,
      chain: [HUBS.PIE_STEPPE, HUBS.CA_STEPPE, HUBS.PUNJAB_INDIA],
      title: 'Hindi-Urdu (Indo-Aryan) & South Asian Convergence',
      homeland: 'Pontic Steppe → Central Asia → Punjab & Gangetic Plain',
      era: 'c. 4000 BCE (PIE) → c. 1500 BCE (Vedic Sanskrit) → Modern',
      mechanism: 'Indo-Aryan arrival converging structurally with indigenous Dravidian and Munda families across India',
      note: 'Hindi and Urdu share Khariboli spoken grammar while drawing learned registers from Sanskrit vs Perso-Arabic.'
    },
    swahili: {
      hub: HUBS.SWAHILI_COAST,
      chain: [HUBS.CAMEROON_BANTU, HUBS.GREAT_LAKES, HUBS.SWAHILI_COAST],
      title: 'Swahili (Sabaki Bantu) Indian Ocean Lingua Franca',
      homeland: 'Cameroon–Nigeria Borderlands → Great Lakes → East African Coast',
      era: 'c. 3000 BCE (Bantu) → 8th–10th c. CE (Coastal Swahili)',
      mechanism: 'Eastern Bantu migration meeting Indian Ocean monsoon maritime trade (Arabic/Persian contact)',
      note: 'Retains full Bantu noun-class syntax while incorporating rich maritime Arabic/Persian trade lexicon.'
    },
    persian: {
      hub: HUBS.IRAN_PLATEAU,
      chain: [HUBS.PIE_STEPPE, HUBS.CA_STEPPE, HUBS.IRAN_PLATEAU],
      title: 'Persian (Iranian Indo-European) Migration & Silk Road',
      homeland: 'Pontic Steppe → Central Asian Steppe → Iranian Plateau',
      era: 'c. 4000 BCE (PIE) → c. 1000–550 BCE (Old Persian)',
      mechanism: 'Indo-Iranian Sintashta/Andronovo movement south into the Iranian Plateau, Persia, Khorasan & Central Asia',
      note: 'Modern Persian (Iran), Dari (Afghanistan), and Tajik (Tajikistan) remain mutually intelligible varieties of one Western Iranian continuum.'
    },
    japanese: {
      hub: HUBS.TOKYO_JPN,
      chain: [HUBS.MANCHURIA_KOR, HUBS.KOREA_PEN, HUBS.KYUSHU_JPN],
      title: 'Japonic Independent Family: Yayoi Maritime Entry',
      homeland: 'Korean Peninsula / Kyushu Corridor (Independent Japonic Family)',
      era: 'c. 1000–300 BCE (Yayoi Agricultural Entry)',
      mechanism: 'Wet-rice Yayoi arrival across Korea Strait interacting with older Jōmon populations; no genetic link to Sinitic',
      note: 'Japanese & Ryukyuan form an independent primary family despite historic borrowing of Chinese characters and learned vocabulary.'
    },
    korean: {
      hub: HUBS.KOREA_PEN,
      chain: [HUBS.MANCHURIA_KOR, HUBS.KOREA_PEN],
      title: 'Koreanic Independent Family: Manchuria–Peninsula Hearth',
      homeland: 'Southern Manchuria (Liaodong) & Korean Peninsula',
      era: 'c. 1500–300 BCE (Bronze-Age Samhan)',
      mechanism: 'Independent primary Koreanic family consolidated under Silla unification (~668 CE)',
      note: 'Koreanic is unrelated genetically to Chinese or Japanese; grammatical parallels across NE Asia stem from millennia of areal contact.'
    },
    greek: {
      hub: HUBS.BALKANS,
      chain: [HUBS.PIE_STEPPE, HUBS.BALKANS],
      title: 'Greek (Hellenic Indo-European): 3,400+ Year Record',
      homeland: 'Pontic–Caspian Steppe → Northern Balkans → Aegean Basin',
      era: 'c. 4000 BCE (PIE) → c. 2200–1450 BCE (Linear B Mycenaean)',
      mechanism: 'Early Bronze-Age Indo-European arrival in the Aegean, maritime settlements across Cyprus & Mediterranean',
      note: 'Hellenic preserves an autonomous Indo-European branch continuously attested in writing since ~1450 BCE.'
    },
    vietnamese: {
      hub: HUBS.RED_RIVER_VNM,
      chain: [HUBS.RED_RIVER_VNM],
      title: 'Vietnamese (Austroasiatic): Red River Valley Roots',
      homeland: 'Red River Delta & Annamite Cordillera (Proto-Vietic / Austroasiatic)',
      era: 'c. 2500–1500 BCE (Austroasiatic) → 1st Mil. CE',
      mechanism: 'Indigenous Austroasiatic riverine rice civilization with deep Sino-Vietnamese literary contact',
      note: 'Crucially, Vietnamese is Austroasiatic—closer genetically to Khmer than to Chinese—despite areal tones and Han-Viet vocabulary.'
    },
    thai: {
      hub: HUBS.CHAO_PHRAYA,
      chain: [HUBS.GUANGXI_KRA, [102.6, 18.0], HUBS.CHAO_PHRAYA],
      title: 'Thai (Kra-Dai / Tai-Kadai) Southern China Migration',
      homeland: 'Lingnan (Guangxi–Guizhou) → Laos → Chao Phraya Basin',
      era: 'c. 1st Mil. BCE (Lingnan) → 10th–13th c. CE (Sukhothai / Chao Phraya)',
      mechanism: 'Southwestern Tai riverine migration out of southern China into Mainland SE Asia over earlier Mon-Khmer lands',
      note: 'Thai belongs to Kra-Dai (unrelated genetically to Sinitic or Austroasiatic Khmer/Vietnamese despite shared typological traits).'
    }
  };

  function resolveLanguageOrigin(langName) {
    if (!langName) return null;
    return LANGUAGE_SEEDS[String(langName).toLowerCase()] || null;
  }

  window.WORLD_ORIGINS = {
    HUBS,
    corridors,
    branches: BRANCHES,
    languageSeeds: LANGUAGE_SEEDS,
    resolveCountryOrigin,
    resolveLanguageOrigin
  };
})();
