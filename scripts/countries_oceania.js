// scripts/countries_oceania.js
module.exports = {
  NZL: {
    iso3: "NZL", iso2: "NZ", geoName: "New Zealand", commonName: "New Zealand",
    officialName: "New Zealand", nativeName: "Aotearoa", flag: "🇳🇿",
    capital: "Wellington", population: "5.2 Million", continent: "Oceania",
    primaryLanguage: "English (New Zealand) & Māori (Te Reo Māori)", languageFamily: "Indo-European / Austronesian",
    diversityLevel: "Constitutional Bilingual (Te Reo Māori & Sign Language)",
    summary: "New Zealand has three official languages: English (de facto), Te Reo Māori (de jure since 1987), and New Zealand Sign Language (since 2006). Māori words and greetings are woven into everyday Kiwi conversation.",
    languages: [
      { name: "English (New Zealand / Kiwi)", nativeName: "New Zealand English", type: "De Facto National", percentage: "95.4%", speakers: "4.9M", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-NZ", regions: "Nationwide", notes: "Notable for vowel centralization ('fish and chips' sounds like 'fush and chups') and rich Māori loanwords." },
      { name: "Māori (Te Reo Māori)", nativeName: "Te Reo Māori", type: "De Jure Official Constitutional", percentage: "4.0%", speakers: "185K", family: "Austronesian (Polynesian / Tahitic)", script: "Latin (with macrons for vowel length)", bcp47: "mi-NZ", regions: "North Island (Waikato, Bay of Plenty, Northland) & Nationwide", notes: "Revitalized through Kōhanga Reo (language nests); national anthem sung in Māori before English." },
      { name: "Samoan", nativeName: "Gagana Sāmoa", type: "Major Pacific Island Language", percentage: "2.2%", speakers: "100K", family: "Austronesian (Polynesian)", script: "Latin", bcp47: "sm-WS", regions: "Auckland (largest Polynesian city in the world)", notes: "Third most spoken language in New Zealand." }
    ],
    accents: [
      { name: "General Kiwi", region: "Auckland, Wellington, Christchurch", description: "Centralized front vowels (/ɪ/ -> /ə/, 'pin' sounds like 'pun'), rising terminal intonation, high use of 'eh'.", sample: "Kia ora mate! Grab some fush and chups, she'll be right, eh?" },
      { name: "Southland (Murihiku / The Catlins)", region: "Invercargill & Southland", description: "The only rhotic accent in New Zealand (pronouncing the 'r' in words like 'purple work'), Scottish settler heritage.", sample: "Roll on up to the dairy and grab a cheese roll, bairn!" }
    ],
    phrases: [
      { type: "Greeting (Māori)", text: "Kia ora! (Be well / Hello!)", phonetic: "KEE-ah OR-ah", bcp47: "mi-NZ" },
      { type: "Welcome (Māori)", text: "Nau mai, haere mai! (Welcome!)", phonetic: "NOW my, hy-reh MY", bcp47: "mi-NZ" },
      { type: "Thank You (Māori)", text: "Ngā mihi nui! (Many thanks!)", phonetic: "ngah MEE-hee NOO-ee", bcp47: "mi-NZ" },
      { type: "Goodbye (Māori)", text: "Haere rā! (Farewell!)", phonetic: "hy-reh RAH", bcp47: "mi-NZ" }
    ],
    funFact: "New Zealand's national anthem, 'God Defend New Zealand', is by law almost always sung first entirely in Te Reo Māori ('E Ihowā Atua') and then in English at international sporting events like the Rugby World Cup!"
  },

  FJI: {
    iso3: "FJI", iso2: "FJ", geoName: "Fiji", commonName: "Fiji",
    officialName: "Republic of Fiji", nativeName: "Viti / फ़िजी", flag: "🇫🇯",
    capital: "Suva", population: "930,000", continent: "Oceania",
    primaryLanguage: "iTaukei (Fijian), English & Fiji Hindi", languageFamily: "Austronesian / Indo-European",
    diversityLevel: "Constitutional Trilingual",
    summary: "Under Fiji's 2013 Constitution, iTaukei (Fijian), English, and Fiji Hindi have equal status in parliament and education, reflecting the islands' rich indigenous Polynesian/Melanesian and Indian diaspora heritage.",
    languages: [
      { name: "Fijian (iTaukei)", nativeName: "Na Vosa Vakaviti", type: "Official Constitutional Language", percentage: "54.0%", speakers: "500K", family: "Austronesian (Oceanic / Fijian)", script: "Latin", bcp47: "fj-FJ", regions: "Viti Levu, Vanua Levu & Maritime Islands", notes: "Bauan dialect chosen as standard; famous for prenasalized consonants (Bula is pronounced 'mBula')." },
      { name: "English (Fiji)", nativeName: "Fiji English", type: "Official Constitutional Language", percentage: "90.0%", speakers: "800K", family: "Indo-European (Germanic)", script: "Latin", bcp47: "en-FJ", regions: "Nationwide (Administration, Commerce, Schools)", notes: "Common lingua franca bridging indigenous Fijian and Indo-Fijian communities." },
      { name: "Fiji Hindi (Fiji Baat)", nativeName: "फ़िजी बात (Fiji Baat)", type: "Official Constitutional Language", percentage: "37.0%", speakers: "350K", family: "Indo-European (Indo-Aryan)", script: "Devanagari / Latin", bcp47: "hi-IN", regions: "Western & Northern Divisions (Nadi, Lautoka, Labasa)", notes: "Derived from Awadhi and Bhojpuri dialects brought by indentured laborers in the late 19th century." }
    ],
    accents: [
      { name: "Fiji English", region: "Suva & Urban Centers", description: "Melodic cadence, lengthened vowels, incorporation of 'Bula' and 'Vinaka' into English speech.", sample: "Bula bro! No worries man, we go down to the kava club tonight." }
    ],
    phrases: [
      { type: "Greeting (Fijian)", text: "Bula! / Bula Vinaka! (Life / Good health / Hello!)", phonetic: "m-BOO-lah vee-NAH-kah", bcp47: "fj-FJ" },
      { type: "Thank You (Fijian)", text: "Vinaka vaka levu! (Thank you very much!)", phonetic: "vee-NAH-kah VAH-kah LEH-voo", bcp47: "fj-FJ" },
      { type: "Goodbye (Fijian)", text: "Moce! (Sleep well / Goodbye)", phonetic: "MO-theh", bcp47: "fj-FJ" }
    ],
    funFact: "In the Fijian alphabet, the letter 'c' is always pronounced as a soft 'th' (like in 'this'), so the famous resort town of Mamanuca is actually pronounced 'Mama-noo-tha'!"
  }
};

