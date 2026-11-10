// data/scripts_info.js - Interactive "Meet the Script" Writing System & Character Breakdown Encyclopedia
(function (global) {
  'use strict';

  const PROFILES = {
    hangul: {
      id: 'hangul',
      name: 'Hangul (한글 / 조선글)',
      systemType: 'Featural Alphabet',
      direction: 'Left-to-Right (LTR)',
      origin: 'Created in 1443 CE by King Sejong the Great (Korea)',
      glyphBadge: '한',
      accentColor: '#f472b6',
      scriptFilterGroup: 'Hangul',
      summary:
        'Considered a crown jewel of linguistic engineering: consonant shapes mimic the anatomy of the tongue, lips, and throat, while phonetic letters pack neatly into two-dimensional syllable blocks.',
      mechanics:
        'Each square syllable block stacks an initial consonant (Choseong), medial vowel (Jungseong), and optional final consonant batchim (Jongseong).',
      samplePhrase: '안녕하세요',
      sampleGloss: 'Annyeonghaseyo · “Hello!”',
      tokens: [
        { glyph: '안', reading: 'an', jamo: 'ㅇ (silent) + ㅏ (a) + ㄴ (n)', role: 'Block 1 · CV+C (batchim)', detail: 'Circle ㅇ acts as a zero-initial placeholder, paired with bright vowel ㅏ (/a/) and closing nasal batchim ㄴ (/n/).' },
        { glyph: '녕', reading: 'nyeong', jamo: 'ㄴ (n) + ㅕ (yeo) + ㅇ (ng)', role: 'Block 2 · CV+C', detail: 'Notice how ㅇ at the TOP is silent, whereas ㅇ at the BOTTOM (batchim) sounds like /ŋ/ (“ng”)!' },
        { glyph: '하', reading: 'ha', jamo: 'ㅎ (h) + ㅏ (a)', role: 'Block 3 · Open CV', detail: 'ㅎ shows the throat organ topped by an aspiration stroke; vertical vowel ㅏ sits to the right.' },
        { glyph: '세', reading: 'se', jamo: 'ㅅ (s) + ㅔ (e)', role: 'Block 4 · Open CV', detail: 'ㅅ mirrors sharp front teeth; ㅔ combines archaic ㅓ + ㅣ.' },
        { glyph: '요', reading: 'yo', jamo: 'ㅇ (silent) + ㅛ (yo)', role: 'Block 5 · Polite Ending', detail: 'Polite conversational ending: two upward strokes on ㅛ add a /y/ glide to ㅗ (/o/).' }
      ]
    },

    japanese: {
      id: 'japanese',
      name: 'Kanji, Hiragana & Katakana',
      systemType: 'Logosyllabary + Dual Syllabary',
      direction: 'Left-to-Right (LTR) / Traditional Vertical',
      origin: 'Chinese Hanzi adapted with two native syllabaries (~9th c. CE)',
      glyphBadge: 'あ漢',
      accentColor: '#ec4899',
      scriptFilterGroup: 'Kanji & Kana',
      summary:
        'Modern Japanese weaves three distinct scripts inside a single sentence: Kanji carry lexical meaning roots, flowing Hiragana handle grammar and native words, and angular Katakana mark loanwords and emphasis.',
      mechanics:
        'Children learn small phonetic Hiragana guides (“Furigana”) floating above complex Kanji characters. Hover or tap the tokens below to inspect each script layer!',
      samplePhrase: '日本へようこそ！コーヒー',
      sampleGloss: 'Nihon e yōkoso! Kōhī · “Welcome to Japan! Coffee”',
      tokens: [
        { glyph: '日', furigana: 'に (ni)', reading: 'ni', role: 'Kanji · “Sun / Day”', detail: 'Pictograph originally shaped like the glowing sun; carries core root meaning “sun/day”.' },
        { glyph: '本', furigana: 'ほん (hon)', reading: 'hon', role: 'Kanji · “Origin / Book”', detail: 'Tree (木) marked at its base line = “root/origin”. Together 日本 = “Origin of the Sun”.' },
        { glyph: 'へ', furigana: 'e (particle)', reading: 'e', role: 'Hiragana · Grammar', detail: 'Cursive Hiragana derived from Hanzi 部; here marks directional destination (“to/toward”).' },
        { glyph: 'ようこそ', furigana: 'yōkoso', reading: 'yōkoso', role: 'Hiragana · Native Welcome', detail: 'Soft looping Hiragana syllables spell native warm expressions cleanly.' },
        { glyph: 'コーヒー', furigana: 'kō-hī', reading: 'kōhī', role: 'Katakana · Foreign Loan', detail: 'Sharp Katakana adapts foreign words (from Dutch *koffie*); the ー chōonpu bar doubles vowel length!' }
      ]
    },

    hanzi: {
      id: 'hanzi',
      name: 'Chinese Characters (Hanzi 漢字 / 汉字)',
      systemType: 'Logographic / Morphosyllabic',
      direction: 'Left-to-Right (LTR) / Classical Vertical',
      origin: 'Oracle Bone Script (Shang Dynasty, c. 1200 BCE)',
      glyphBadge: '汉',
      accentColor: '#dc2626',
      scriptFilterGroup: 'Hanzi',
      summary:
        'The world’s oldest continuously used writing system: each square character represents a meaningful syllable (morpheme) regardless of regional dialect pronunciation across Mandarin, Cantonese, or Hokkien.',
      mechanics:
        'Over 80% of Hanzi combine a Semantic Radical (meaning hint) with a Phonetic Component (sound clue). Characters can stay unchanged across centuries even as spoken sounds drift.',
      samplePhrase: '你好，世界',
      sampleGloss: 'Nǐ hǎo, shìjiè · “Hello, world”',
      tokens: [
        { glyph: '你', reading: 'nǐ', role: 'Person Radical 亻 + 尔', detail: 'Left side 亻 (“person”) + phonetic 尔 = “you”. Notice meaning + sound pairing!' },
        { glyph: '好', reading: 'hǎo', role: 'Woman 女 + Child 子', detail: 'Iconic compound combining 女 (“woman/mother”) beside 子 (“child”) to express “good / well / love”.' },
        { glyph: '世', reading: 'shì', role: 'Root Character · Generation', detail: 'Historically depicts thirty years (three tens) passing across one human generation → “world / era”.' },
        { glyph: '界', reading: 'jiè', role: 'Field 田 + 介', detail: 'Top agricultural field 田 hints at surveyed “boundary / realm”. Together 世界 = “the world”.' }
      ]
    },

    arabic: {
      id: 'arabic',
      name: 'Arabic Alphabet (الأبجدية العربية)',
      systemType: 'Impure Abjad (28 Letters)',
      direction: 'Right-to-Left (RTL)',
      origin: 'Nabataean Aramaic descendant (4th–6th c. CE)',
      glyphBadge: 'ع',
      accentColor: '#eab308',
      scriptFilterGroup: 'Arabic',
      isRtl: true,
      summary:
        'Flowing cursive script written Right-to-Left (←). Primarily writes consonants and long vowels while optional diacritics (ḥarakāt) mark short vowels in poetry, dictionaries, and learners’ texts.',
      mechanics:
        'Every letter shifts shape dynamically across four positional forms: Isolated, Initial, Medial, and Final (though 6 non-connecting letters like ا د ذ ر ز و break the join to the left).',
      samplePhrase: 'مرحبا بالعالم',
      sampleGloss: 'Marḥaban bi-l-ʿālam · “Hello World” (Read Right → Left!)',
      tokens: [
        { glyph: 'مـ', reading: 'm-', role: 'Initial Mīm (م)', detail: 'Starts on the right edge as Initial مـ (/m/) connecting leftward into Rāʾ.' },
        { glyph: 'ـر', reading: '-r', role: 'Final Rāʾ (ر)', detail: 'Notice the cursiveness snaps open! ر is a non-connector, forcing the next letter to restart fresh.' },
        { glyph: 'حـ', reading: 'ḥ-', role: 'Initial Ḥāʾ (ح)', detail: 'Voiceless pharyngeal fricative (/ħ/), restarted cleanly after non-connecting ر.' },
        { glyph: 'ـبـ', reading: '-b-', role: 'Medial Bāʾ (ب)', detail: 'Distinct dot below! One single dot underneath distinguishes b (ب) from t (ت), th (ث), n (ن), and y (ي).' },
        { glyph: 'ـا', reading: '-ā', role: 'Final Long Alif (ا)', detail: 'Tall upright final Alif stretches /aː/; a short unspoken tanwīn ending closes “marḥaban”.' }
      ]
    },

    persoarabic: {
      id: 'persoarabic',
      name: 'Perso-Arabic & Nastaliq Script (خط فارسی / نستعلیق)',
      systemType: 'Extended Abjad (32–38 Letters)',
      direction: 'Right-to-Left (RTL)',
      origin: 'Arabic script enriched for Persian, Urdu, Pashto & Kurdish',
      glyphBadge: 'ع',
      accentColor: '#0d9488',
      scriptFilterGroup: 'Perso-Arabic',
      isRtl: true,
      summary:
        'Expands Arabic with 4 extra Persian consonant glyphs — پ /p/, چ /ch/, ژ /zh/, گ /g/ — and blooms further in Urdu and Pashto with retroflex & aspirate marks written in slanted Nastaliq calligraphy.',
      mechanics:
        'Sloped downward from upper-right to lower-left in South Asian/Iranian Nastaliq; Kurdish Sorani goes a step further and writes EVERY vowel explicitly as full alphabet letters!',
      samplePhrase: 'سلام دنیا',
      sampleGloss: 'Salām donyā / duniyā · “Hello world”',
      tokens: [
        { glyph: 'سـ', reading: 's-', role: 'Initial Sīn', detail: 'Three tooth strokes curve smoothly right-to-left.' },
        { glyph: 'ـلا', reading: '-lā', role: 'Ligature Lām-Alif', detail: 'Classic woven Lām (ل) + Alif (ا) ligature fused into a single graceful loop.' },
        { glyph: 'م', reading: 'm', role: 'Isolated Mīm', detail: 'Ends the greeting cleanly after non-connecting Alif: Salām!' },
        { glyph: 'پ چ ژ گ', reading: 'p · ch · zh · g', role: '4 Signature Non-Arabic Letters', detail: 'Added using three-dot clusters to represent /p/, /tʃ/, /ʒ/, and /g/ across Iranian, Turkic historic, and Urdu scripts.' }
      ]
    },

    devanagari: {
      id: 'devanagari',
      name: 'Devanagari (देवनागरी)',
      systemType: 'Abugida (Alphasyllabary)',
      direction: 'Left-to-Right (LTR)',
      origin: 'Brahmi → Gupta → Nāgarī Script (c. 1st–10th c. CE)',
      glyphBadge: 'अ',
      accentColor: '#f59e0b',
      scriptFilterGroup: 'Devanagari',
      summary:
        'Recognized instantly by its continuous horizontal headline bar (Shirorekhā). Every consonant automatically carries an inherent “a” vowel (/ə/) unless reshaped by a vowel sign (mātrā) or halant mute mark.',
      mechanics:
        'Organizes sounds phonetically in a linguistic matrix (velar → palatal → retroflex → dental → labial) designed by ancient Sanskrit grammarians!',
      samplePhrase: 'नमस्ते',
      sampleGloss: 'Namaste · “Greetings (I bow to you)”',
      tokens: [
        { glyph: 'न', reading: 'na', role: 'Consonant + inherent “a”', detail: 'Standalone न sounds like “na” automatically because every Devanagari consonant brings an inherent schwa.' },
        { glyph: 'म', reading: 'ma', role: 'Consonant + inherent “a”', detail: 'Again, म carries built-in /a/ with zero extra vowel symbol.' },
        { glyph: 'स् + त', reading: 'st', role: 'Half-Consonant Conjunct (स्त)', detail: 'First consonant स drops its vertical spine to form a half-letter स-, slicing off inherent /a/ to glue straight onto त (/st/).' },
        { glyph: 'े', reading: '-e', role: 'Above-Head Vowel Mātrā', detail: 'Slanted plume rising above the Shirorekhā top bar overrides the inherent vowel to sound /-e/: Na-ma-ste!' }
      ]
    },

    cyrillic: {
      id: 'cyrillic',
      name: 'Cyrillic Script (Кириллица)',
      systemType: 'Alphabet (30–40+ Letters)',
      direction: 'Left-to-Right (LTR)',
      origin: '9th-century First Bulgarian Empire (Preslav School)',
      glyphBadge: 'АБ',
      accentColor: '#4f46e5',
      scriptFilterGroup: 'Cyrillic',
      summary:
        'Created by disciples of Saints Cyril and Methodius in Medieval Bulgaria from Greek uncials + Glagolitic letters (Ш, Ж, Ч). Adapted for Slavic, Uralic, Turkic, and Mongolic languages across Eurasia.',
      mechanics:
        'Watch out for Latin “False Friends”! Looks familiar on signage, yet several identical shapes stand for completely different sounds.',
      samplePhrase: 'Привет',
      sampleGloss: 'Privet · “Hi! (Russian)”',
      tokens: [
        { glyph: 'П', reading: 'P', role: 'Greek Pi heritage', detail: 'True /p/ — just like uppercase Greek Π! Don’t confuse with Roman N.' },
        { glyph: 'р', reading: 'r', role: 'Greek Rho False Friend', detail: 'LOOKS like Latin “p”, SOUNDS like trilled /r/! Inherited from Greek Ρ/ρ (Rho).' },
        { glyph: 'и', reading: 'i (ee)', role: 'Vowels & Palatalization', detail: 'Sounds like “ee” in “meet”; resembles reversed Latin N.' },
        { glyph: 'в', reading: 'v', role: 'Greek Beta Shift', detail: 'LOOKS like Latin “B”, SOUNDS like /v/! Meanwhile real /b/ is written Б/б.' },
        { glyph: 'е / т', reading: 'ye / t', role: 'Soft Vowel + Final /t/', detail: 'Е carries a gentle /y/ on-glide (“ye”), followed by crisp dental /t/ → P-r-ee-v-ye-t!' }
      ]
    },

    greek: {
      id: 'greek',
      name: 'Greek Alphabet (Ελληνικό αλφάβητο)',
      systemType: 'True Alphabet (24 Letters)',
      direction: 'Left-to-Right (LTR)',
      origin: 'Phoenician Abjad adapted with dedicated vowels (c. 800 BCE)',
      glyphBadge: 'ΑΩ',
      accentColor: '#2563eb',
      scriptFilterGroup: 'Greek',
      summary:
        'History’s breakthrough true alphabet! Greeks repurposed spare Semitic consonant letters (Aleph → Alpha, He → Epsilon) to write vowels independently — directly fathering Latin, Cyrillic, and Coptic.',
      mechanics:
        'Modern Greek writes stress explicitly with an acute accent (τόνος, e.g., α → ά) on words of two or more syllables.',
      samplePhrase: 'Γεια σας',
      sampleGloss: 'Ya sas · “Hello / Health to you”',
      tokens: [
        { glyph: 'Γ', reading: 'y (before e/i)', role: 'Gamma Digraph', detail: 'Before front vowels, Γε softens into a gentle /y/ glide (“ya”).' },
        { glyph: 'εια', reading: 'ya', role: 'Historical Vowel Merger', detail: 'Ancient diphthongs ει merged to /i/ sound over 2,000 years, creating crisp “ya”.' },
        { glyph: 'σ', reading: 's-', role: 'Medial Sigma', detail: 'Standard opening Sigma (σ) before vowels.' },
        { glyph: 'α', reading: 'a', role: 'Vowel Alpha', detail: 'Unstressed short /a/ sound.' },
        { glyph: 'ς', reading: '-s (final)', role: 'Final Sigma Variant', detail: 'Sigma transforms into curled ς exclusively when ending a word (just like Arabic/Hebrew final forms)!' }
      ]
    },

    hebrew: {
      id: 'hebrew',
      name: 'Hebrew Alphabet (אלפבית עברי)',
      systemType: 'Impure Abjad (22 Letters)',
      direction: 'Right-to-Left (RTL)',
      origin: 'Imperial Aramaic Square Script (Ktav Ashuri, c. 3rd c. BCE)',
      glyphBadge: 'אב',
      accentColor: '#38bdf8',
      scriptFilterGroup: 'Hebrew',
      isRtl: true,
      summary:
        'Written Right-to-Left (←) with square calligraphic strokes. Consonants carry root meaning (typically 3-letter Semitic roots like ש-ל-ם sh-l-m “peace/wholeness”), while Niqqud dots mark short vowels in poetry and primers.',
      mechanics:
        'Five “Mantzpach” letters (כ מ נ פ צ → ך ם ן ף ץ) unfurl sleek final shapes when placed at the end of a word.',
      samplePhrase: 'שָׁלוֹם',
      sampleGloss: 'Shalom · “Peace / Hello” (Read Right → Left!)',
      tokens: [
        { glyph: 'שׁ', reading: 'sh', role: 'Root Letter 1 (Shin)', detail: 'Dot on the top-right branch marks /ʃ/ (“sh”); dot on left branch turns the same glyph into /s/ (Sin).' },
        { glyph: 'ל', reading: 'l', role: 'Root Letter 2 (Lamed)', detail: 'Tallest Hebrew letter reaching above the cap height.' },
        { glyph: 'וֹ', reading: 'o', role: 'Mater Lectionis (Vav)', detail: 'Consonant Vav topped by a cholam dot acts as a long /o/ vowel guide even without full Niqqud.' },
        { glyph: 'ם', reading: '-m (final)', role: 'Closed Final Mem', detail: 'Notice how square Mem (מ) seals shut into box-like Final Mem (ם) solely at a word’s left edge!' }
      ]
    },

    georgian: {
      id: 'georgian',
      name: 'Georgian Mkhedruli (ქართული მკედრული)',
      systemType: 'Unicase True Alphabet (33 Letters)',
      direction: 'Left-to-Right (LTR)',
      origin: 'Asomtavruli (5th c. CE) → Rounded Mkhedruli (“Cavalry Script”)',
      glyphBadge: 'აგ',
      accentColor: '#e11d48',
      scriptFilterGroup: 'Georgian',
      summary:
        'One-to-one phonetic perfection! Georgian has zero uppercase/lowercase distinction (unicase) and zero silent letters — UNESCO inscribed Georgia’s three living scripts on the Intangible Cultural Heritage list.',
      mechanics:
        'Famous for harmonious curved ascenders and descenders alongside thrilling consonant clusters (like თბილისი Tbilisi or მწვრთნელი!).',
      samplePhrase: 'გამარჯობა',
      sampleGloss: 'Gamarjoba · “Hello (Literally: Victory!)”',
      tokens: [
        { glyph: 'გა', reading: 'ga', role: 'Prefix + Vowel', detail: 'Every letter maps 100% strictly to one sound with zero ambiguity.' },
        { glyph: 'მარჯ', reading: 'marj', role: 'Root *marj-* (“Victory”)', detail: 'Literally wishes someone “Victory!” when saying good morning.' },
        { glyph: 'ობა', reading: 'oba', role: 'Abstract Noun Suffix', detail: 'Smooth curling letter ბ (/b/) + ა (/a/) complete the classic rounded Mkhedruli rhythm.' }
      ]
    },

    armenian: {
      id: 'armenian',
      name: 'Armenian Alphabet (Հայոց գրեր)',
      systemType: 'True Alphabet (38 Letters)',
      direction: 'Left-to-Right (LTR)',
      origin: 'Invented in 405 CE by scholar Mesrop Mashtots',
      glyphBadge: 'ԱԲ',
      accentColor: '#6366f1',
      scriptFilterGroup: 'Armenian',
      summary:
        'Engineered to capture every nuanced consonant stop (voiced, voiceless, ejective/aspirated) of Classical Armenian with clean vertical pillar symmetry — in continuous use for 1,620+ years.',
      mechanics:
        'Features full upper/lower case like Latin/Greek, plus its own distinctive punctuation (including a tilted comma-like exclamation mark on stressed vowels!).',
      samplePhrase: 'Բարև',
      sampleGloss: 'Barev · “Hello (Literally: Good sun / Light!)”',
      tokens: [
        { glyph: 'Բ', reading: 'B / P’', role: 'Capital Ben', detail: 'Pronounced /b/ in Eastern Armenia (Yerevan), /pʰ/ in Western Armenian!' },
        { glyph: 'ա', reading: 'a', role: 'Lowercase Ayb', detail: 'U-like twin arches characterize Mashtots’ calligraphic architecture.' },
        { glyph: 'ր', reading: 'r', role: 'Lowercase Re', detail: 'Soft tap /ɾ/, distinct from rolled /r/ (ռ).' },
        { glyph: 'և', reading: 'ev / yev', role: 'Signature Ligature', detail: 'Single dedicated glyph fusing ե + ւ into “yev” (also doubles as the Armenian ampersand “&”!).' }
      ]
    },

    geez: {
      id: 'geez',
      name: 'Geʻez / Fidel (ግዕዝ · ፊደል)',
      systemType: 'Abugida (Syllabary Matrix)',
      direction: 'Left-to-Right (LTR)',
      origin: 'Ancient Sabaic South Arabian evolved in Aksum (4th c. CE)',
      glyphBadge: 'ፊ',
      accentColor: '#16a34a',
      scriptFilterGroup: 'Geʻez',
      summary:
        'Africa’s celebrated indigenous Abugida! Used across Ethiopia and Eritrea for Amharic, Tigrinya, and Classical Geʻez liturgy, where every consonant bends into 7 rhythmic vowel orders.',
      mechanics:
        'Instead of floating vowels above, small hooks, leg shortenings, or rings attach straight onto the base consonant shape.',
      samplePhrase: 'ሰላም',
      sampleGloss: 'Selam · “Peace / Hello”',
      tokens: [
        { glyph: 'ሰ', reading: 'se (1st order)', role: 'Base + /ä/ (e)', detail: 'Symmetric 1st-order base form carrying natural /ä/ or /e/.' },
        { glyph: 'ላ', reading: 'lā (4th order)', role: 'Base ለ + Short Left Leg', detail: 'Watch the left leg shorten to raise the right leg for long /a/: ለ (le) → ላ (lā)!' },
        { glyph: 'ም', reading: 'm (6th order)', role: 'Vowelless Consonant Order', detail: 'Sixth order marks either bare closing /m/ or short /ɨ/ — closing cleanly with “Selam!”.' }
      ]
    },

    thaana: {
      id: 'thaana',
      name: 'Thaana Script (ތާނަ)',
      systemType: 'True Abugida / Semi-Alphabet',
      direction: 'Right-to-Left (RTL)',
      origin: 'Forged in Maldives from Arabic & Indic Numerals (16th–18th c.)',
      glyphBadge: 'ތ',
      accentColor: '#ea580c',
      scriptFilterGroup: 'Thaana',
      isRtl: true,
      summary:
        'One of writing history’s wildest designs! Dhivehi inventors built Thaana’s first 9 consonants out of Arabic digits 1–9, its next 9 from ancient Dhivehi digits, and its 11 vowel diacritics from Arabic harakat — read Right-to-Left!',
      mechanics:
        'Unlike Arabic, ALL vowels in Thaana are mandatory (never omitted), written visibly as floating diacritics above or below every consonant.',
      samplePhrase: 'އައްސަލާމު',
      sampleGloss: 'Assalāmu · “Peaceful greetings (Maldives)”',
      tokens: [
        { glyph: 'އަ', reading: 'a', role: 'Vowel-Carrier Alifu + Fatha', detail: 'Neutral carrier അ/އ holds the mandatory diagonal vowel stroke for /a/.' },
        { glyph: 'އް', reading: '(geminate)', role: 'Sukun Doubler', detail: 'Zero-vowel sukun triggers crisp consonant doubling on the next letter.' },
        { glyph: 'ސަ', reading: 'sa', role: 'Digit-Derived Sīnu', detail: 'Slanted numeral-inspired strokes read cleanly from right to left.' },
        { glyph: 'ލާ', reading: 'lā', role: 'Double Vowel (Ābāfili)', detail: 'Twin floating strokes elongate the /aː/ vowel cleanly.' }
      ]
    },

    thai: {
      id: 'thai',
      name: 'Thai Script (อักษรไทย)',
      systemType: 'Tonal Abugida (No Spaces Between Words!)',
      direction: 'Left-to-Right (LTR)',
      origin: 'King Ramkhamhaeng (1283 CE) adapted from Old Khmer / Pallava',
      glyphBadge: 'กข',
      accentColor: '#a855f7',
      scriptFilterGroup: 'Thai',
      summary:
        'Written continuously without spaces between words (spaces mark full clauses/sentences!). 44 consonants split into Low/Mid/High tonal classes interacting with tone marks to encode all 5 Thai tones.',
      mechanics:
        'Tricky fun fact: Thai vowels dance ALL around the base consonant — to the left (เ แ โ ใ ไ), above (ิ ี ึ ื), below (ุ ู), right (ะ า), or wrapping 3 sides at once (เ-ีย)!',
      samplePhrase: 'สวัสดี',
      sampleGloss: 'Sawatdi · “Hello / Well-being”',
      tokens: [
        { glyph: 'ส', reading: 'sa', role: 'High-Class Consonant', detail: 'High-class S places tone rules in rising/low register.' },
        { glyph: 'วั', reading: 'wa-', role: 'Mai Han-Akat Vowel Above', detail: 'Curl floating OVER ว turns inherent vowel into clipped /a/ before final -s.' },
        { glyph: 'ส', reading: '-t', role: 'Final S Pronounced /t/', detail: 'In Thai syllable codas, many dental/sibilant letters (ส ศ ษ ด ज ต) simplify to unreleased /-t/!' },
        { glyph: 'ดี', reading: 'dī', role: 'Mid Consonant + Long ี', detail: 'Top hook ี gives crisp long /iː/ → “Sa-wat-dee!”' }
      ]
    },

    khmer: {
      id: 'khmer',
      name: 'Khmer Script (អក្សរខ្មែរ)',
      systemType: 'Dual-Series Abugida (Longest Official Alphabet)',
      direction: 'Left-to-Right (LTR)',
      origin: 'South Indian Pallava script (611 CE Angkor Borei inscription)',
      glyphBadge: 'កខ',
      accentColor: '#14b8a6',
      scriptFilterGroup: 'Khmer',
      summary:
        'Famous as the world’s largest official consonant inventory (33 consonants split into A-series and O-series registers that flip each dependent vowel’s sound!) — plus stacked subscript consonants.',
      mechanics:
        'Notice no spaces between words; consonant clusters drop the second letter directly UNDERNEATH the first as a “coeng” (foot) glyph!',
      samplePhrase: 'សួស្តី',
      sampleGloss: 'Suosdei · “Hello!”',
      tokens: [
        { glyph: 'សួ', reading: 'suo', role: 'A-Series Sa + Diphthong ួ', detail: 'Hairpin crown ួ atop ស glides smoothly /uə/.' },
        { glyph: 'ស្តី', reading: 'sdei', role: 'Stacked Coeng Subscript!', detail: 'Watch carefully: ต/ដ hangs directly UNDERNEATH ស as its subscript “foot” ្ដ — clustering /st/ without any space!' }
      ]
    },

    burmese: {
      id: 'burmese',
      name: 'Burmese Script (မြန်မာအက္ခရာ)',
      systemType: 'Circular Abugida',
      direction: 'Left-to-Right (LTR)',
      origin: 'Pyu & Old Mon scripts derived from Pallava Brahmi (11th c. CE)',
      glyphBadge: 'ကခ',
      accentColor: '#eab308',
      scriptFilterGroup: 'Burmese',
      summary:
        'Instant visual signature: almost every glyph consists of graceful curved circles and semicircles — traditionally evolved so sharp straight strokes wouldn’t tear dried palm-leaf manuscripts!',
      mechanics:
        'Circles join with medial wraps (like ြ / ျ) and distinct tone dots/visarga to render tonal Burmese plus Shan, Mon, and Karen languages.',
      samplePhrase: 'မင်္ဂလာပါ',
      sampleGloss: 'Mingalaba · “Auspiciousness to you (Hello!)”',
      tokens: [
        { glyph: 'မ', reading: 'min-', role: 'Circular Ma', detail: 'Twin arcs illustrate the iconic palm-leaf circle geometry.' },
        { glyph: 'င်္ဂ', reading: '-nga-ga', role: 'Killed Nasal + Subscript', detail: 'Kinzi င်္ (nasal /ŋ/) sits right above base ဂ!' },
        { glyph: 'လာ', reading: 'lā', role: 'La + Tall Vowel Marker ာ', detail: 'Rounded semi-circle stretches /a/ cleanly.' },
        { glyph: 'ပါ', reading: 'ba', role: 'Polite Particle', detail: 'Intervocalic voicing turns /p/ soft to /b/: “Min-ga-la-ba!”' }
      ]
    },

    lao: {
      id: 'lao',
      name: 'Lao Script (ອັກສອນລາວ)',
      systemType: 'Phonetic Tonal Abugida',
      direction: 'Left-to-Right (LTR)',
      origin: 'Sukothai/Old Khmer cousin reformed in modern Laos for strict phonetics',
      glyphBadge: 'ກຂ',
      accentColor: '#06b6d4',
      scriptFilterGroup: 'Lao',
      summary:
        'A softer, curvier cousin of Thai that streamlined away redundant Sanskrit consonants — making Lao spelling wonderfully direct and phonetic compared to historical Thai orthography.',
      mechanics:
        'Uses 27 consonants sorted across High/Mid/Low tone registers plus vowel signs circling the core glyph.',
      samplePhrase: 'ສະບາຍດີ',
      sampleGloss: 'Sabaidi · “Hello / Well and happy”',
      tokens: [
        { glyph: 'ສະ', reading: 'sa', role: 'Initial Sa + Short Vowel', detail: 'Paired round loops read softly without breaking between words.' },
        { glyph: 'ບາຍ', reading: 'bāy', role: 'Body Vowel + Final Y', detail: 'Literal root “comfortable / well in spirit”.' },
        { glyph: 'ດີ', reading: 'dī', role: 'Good / Well', detail: 'Complete polite greeting across Laos: “Sa-bai-dee!”' }
      ]
    },

    bengali: {
      id: 'bengali',
      name: 'Bengali–Assamese (বাংলা লিপি)',
      systemType: 'Abugida (Eastern Nagari)',
      direction: 'Left-to-Right (LTR)',
      origin: 'Siddham & Proto-Bengali (Gaudi script, c. 11th c. CE)',
      glyphBadge: 'অক',
      accentColor: '#16a34a',
      scriptFilterGroup: 'Bengali',
      summary:
        'Shares the headline bar (Matra) rhythm of Devanagari, sculpted into sleek triangular and arched curves for Bengali, Assamese, Manipuri, and Sylheti across 300M+ people.',
      mechanics:
        'Inherent consonant vowel shifts naturally toward rounded /ɔ/ (“aw/o”), creating Bengal’s recognizable musical vowel harmony.',
      samplePhrase: 'নমস্কার',
      sampleGloss: 'Nomoshkar · “Warm respectful greeting”',
      tokens: [
        { glyph: 'ন', reading: 'no', role: 'Dental Na + inherent “o”', detail: 'Notice how flat top matra line anchors triangular flourishes underneath.' },
        { glyph: 'ম', reading: 'mo', role: 'Labial Ma', detail: 'Smooth triangular loop joins the headline smoothly.' },
        { glyph: 'স্কার', reading: 'shkār', role: 'Conjunct Sk + Tall Ā-kār া', detail: 'Sibilant স fuses cleanly over ক; vertical bar া adds /aː/.' }
      ]
    },

    tamil: {
      id: 'tamil',
      name: 'Tamil Script (தமிழ் அரிச்சுவடி)',
      systemType: 'Pure Compact Abugida (247 Syllables)',
      direction: 'Left-to-Right (LTR)',
      origin: 'Tamil-Brahmi → Vatteluttu → Chola Grantha (3rd c. BCE)',
      glyphBadge: 'த',
      accentColor: '#f43f5e',
      scriptFilterGroup: 'Tamil',
      summary:
        'Remarkably minimalist! Unlike northern Indic scripts with 35+ aspirated consonants, Classical Tamil needs just 18 pure consonants (voiced/voiceless handled cleanly by syllable position) + 12 vowels.',
      mechanics:
        'A tiny top dot (Puḷḷi ்) mutes any consonant’s inherent vowel — e.g. வ (va) vs வ் (v)! Zero stacked consonant clusters.',
      samplePhrase: 'வணக்கம்',
      sampleGloss: 'Vaṇakkam · “Respectful Hello”',
      tokens: [
        { glyph: 'வ', reading: 'va', role: 'Base Va', detail: 'Open coiled loop carrying inherent /a/.' },
        { glyph: 'ண', reading: 'ṇa', role: 'Retroflex Ṇa', detail: 'Triple-coil letter curled delicately upward.' },
        { glyph: 'க்', reading: '-k-', role: 'Puḷḷi Mute Dot!', detail: 'Dot atop க strips its inherent /a/ to double the crisp medial /kk/ sound!' },
        { glyph: 'கம்', reading: 'kam', role: 'Ka + Final Puḷḷi M', detail: 'Closes cleanly with dotted ம்: “Va-ṇak-kam!”' }
      ]
    },

    sinhala: {
      id: 'sinhala',
      name: 'Sinhala Script (සිංහල හෝඩිය)',
      systemType: 'Curvilinear Abugida',
      direction: 'Left-to-Right (LTR)',
      origin: 'Ancient Brahmi rounded for ola-palm leaf writing in Sri Lanka',
      glyphBadge: 'ස',
      accentColor: '#fb923c',
      scriptFilterGroup: 'Sinhala',
      summary:
        'Adored for airy pretzel-like spiral loops adapted for circular writing on Sri Lankan talipot palm leaves without tearing leaf veins.',
      mechanics:
        'Uniquely splits letter sets into pure Elu (native Sinhala) + Sanskrit/Pali loan glyphs, and includes distinctive prenasalized stops (ඟ, ඬ, ඳ, ඹ)!',
      samplePhrase: 'ආයුබෝවන්',
      sampleGloss: 'Āyubōwan · “May you have long life”',
      tokens: [
        { glyph: 'ආ', reading: 'Ā', role: 'Independent Long Vowel', detail: 'Distinct long /aː/ opening loop.' },
        { glyph: 'යු', reading: 'yu', role: 'Sub-loop for /u/', detail: 'Curling lower tail modifies base ය (ya) into yu.' },
        { glyph: 'බෝ', reading: 'bō', role: 'Circumfix /ō/', detail: 'Kombuwa swirl left + hook right wrap ב/බ into long /oː/.' },
        { glyph: 'වන්', reading: 'wan', role: 'Halanta Mute Sign', detail: 'Flag-top ් mutes closing න to pure /-n/!' }
      ]
    },

    tibetan: {
      id: 'tibetan',
      name: 'Tibetan Uchen (བོད་ཡིག་)',
      systemType: 'Vertical-Stacking Abugida',
      direction: 'Left-to-Right (LTR)',
      origin: '650 CE by scholar Thonmi Sambhota (Gupta Brahmi ancestor)',
      glyphBadge: 'བོ',
      accentColor: '#f97316',
      scriptFilterGroup: 'Tibetan',
      summary:
        'Every syllable ends with a crisp superscript separation dot called a *tsheg* (་)! Prefix, head-letter, root, subjoined, and suffix letters stack vertically like stone pillars reflecting historic 7th-century pronunciation.',
      mechanics:
        'Because spelling preserves 7th-century Old Tibetan while spoken Lhasa/Dzongkha dropped silent prefixes, written clusters encode deep historical etymology!',
      samplePhrase: 'བཀྲ་ཤིས་',
      sampleGloss: 'Tashi (Dzongkha: Kuzu zangpo) · “Auspicious blessing”',
      tokens: [
        { glyph: 'བཀྲ', reading: 'ta / tra', role: 'Stacked Pillar Cluster!', detail: 'Prefix བ (silent b-) + Root ཀ (k) + Subscript ྲ (-r) collapse cleanly into /ta/ or /tra/!' },
        { glyph: '་', reading: '·', role: 'Tsheg Syllable Dot', detail: 'Appears after EVERY single Tibetan syllable like punctuation pearls.' },
        { glyph: 'ཤིས་', reading: 'shi', role: 'Root Sha + /i/ Horn', detail: 'Gigu crescent atop ཤ writes /i/; silent suffix -ས modifies syllable tone!' }
      ]
    },

    tifinagh: {
      id: 'tifinagh',
      name: 'Neo-Tifinagh (ⵜⵉⴼⵉⵏⴰⵖ)',
      systemType: 'Geometric Alphabet (33 Letters)',
      direction: 'Left-to-Right (LTR) / Historic Variable',
      origin: 'Descended from 2,500-year-old Ancient Libyco-Berber stone inscriptions',
      glyphBadge: 'ⵜ',
      accentColor: '#10b981',
      scriptFilterGroup: 'Tifinagh',
      summary:
        'Geometric straight lines, circles, crosses, and triangles! Safeguarded across millennia by Tuareg Sahara communities (especially women) and officially revived as Morocco’s Amazigh highway & civic script alongside Arabic.',
      mechanics:
        'Modern Neo-Tifinagh (standardized by IRCAM) turns Tuareg consonant stone-script into a full explicit left-to-right alphabet with full vowels.',
      samplePhrase: 'ⴰⵣⵓⵍ',
      sampleGloss: 'Azul · “Hello (From the heart!)”',
      tokens: [
        { glyph: 'ⴰ', reading: 'a', role: 'Ya (Simple Dot-Free Circle Variant)', detail: 'Clean dot/ring geometric emblem opening the universal Amazigh greeting.' },
        { glyph: 'ⵣ', reading: 'z', role: 'Yaz — Cultural Emblem!', detail: 'The famous Amazigh “free human” icon ⵣ itself is the Tifinagh letter for /z/!' },
        { glyph: 'ⵓ', reading: 'u', role: 'Yu', detail: 'Three-dot or open U-form depending on calligraphic font.' },
        { glyph: 'ⵍ', reading: 'l', role: 'Yal', detail: 'Parallel vertical bars finish cleanly: A-z-u-l!' }
      ]
    },

    syllabics: {
      id: 'syllabics',
      name: 'Canadian Indigenous Syllabics (ᐃᓄᒃᑎᑐᑦ / ᓀᐦᐃᔭᐍᐏᐣ)',
      systemType: 'Geometric Rotational Abugida',
      direction: 'Left-to-Right (LTR)',
      origin: 'Developed ~1840 for Cree & Ojibwe, enthusiastically adopted across Nunavut (Inuktitut)',
      glyphBadge: 'ᐃᓄ',
      accentColor: '#38bdf8',
      scriptFilterGroup: 'Canadian Syllabics',
      summary:
        'Genius rotational geometry! Each basic geometric shape (triangle, wedge, arch) represents a CONSONANT — and simply **rotating it 90°** flips the attached vowel between E, I, O, and A!',
      mechanics:
        'For example, the Cree/Inuktitut “P” group spins clockwise: ᐱ (pi), ᐳ (pu/po), ᐸ (pa) — while a tiny raised dot doubles vowel length, and a miniature superscript writes syllable-final consonants!',
      samplePhrase: 'ᐃᓄᒃᑎᑐᑦ',
      sampleGloss: 'Inuktitut · “Like the Inuit (Our Language)”',
      tokens: [
        { glyph: 'ᐃ', reading: 'i', role: 'Vowel Triangle (Point Up = I)', detail: 'Triangle pointing upward = /i/; rotate right ᐅ = /u/; rotate left ᐊ = /a/!' },
        { glyph: 'ᓄ', reading: 'nu', role: 'N-Group Rotated Right', detail: 'Same N-family curve rotated toward right = /u/ vowel.' },
        { glyph: 'ᒃ', reading: '-k', role: 'Miniature Final Consonant', detail: 'Shrunken raised glyph marks bare closing /-k/ with zero vowel!' },
        { glyph: 'ᑎ ᑐ ᑦ', reading: 'ti-tu-t', role: 'T-Family Spin Cycle', detail: 'Upward ᑎ = /ti/, rightward ᑐ = /tu/, tiny superscript ᑦ = final /t/!' }
      ]
    },

    latin: {
      id: 'latin',
      name: 'Latin Alphabet & Diacritic Extensions',
      systemType: 'True Alphabet (26 Core + Regional Extensions)',
      direction: 'Left-to-Right (LTR)',
      origin: 'Etruscan & Western Cumae Greek (7th c. BCE) → Global Print Era',
      glyphBadge: 'Aa',
      accentColor: '#0284c7',
      scriptFilterGroup: 'Latin',
      summary:
        'The world’s most widespread writing family (~70% of global population). Because 26 Roman letters can’t represent every language’s vowels, tones, or clicks, nations enriched Latin with ingenious accents, ligatures, and digraphs.',
      mechanics:
        'Examples span Icelandic preserved runes (þ/ð), Czech hačeks (č/š/ž), French/Spanish accents (é/ñ/ç), Xhosa click letters (c/q/x), and stacked tonal Vietnamese (Quốc ngữ: ệ / ả)!',
      samplePhrase: 'Chào · Þakka · Štěstí · Ọ́dọ́',
      sampleGloss: 'Global Latin Extensions: Tone, Runes, Carons & Subdots',
      tokens: [
        { glyph: 'à · ệ', reading: 'Vietnamese Tones', detail: 'Stacks a vowel-quality hat (ê) AND a tone dot beneath in one letter (Chữ Quốc ngữ)!' },
        { glyph: 'þ · ð', reading: 'th / dh (Icelandic)', detail: 'Preserved Germanic/Old Norse rune Thorn (þ) and Eth (ð) in living Arctic newspapers.' },
        { glyph: 'č · š · ž', reading: 'ch · sh · zh', detail: 'Jan Hus’ 15th-century Slavic haček diacritic turned messy 3-letter clusters into crisp 1-letter icons.' },
        { glyph: 'ñ · ç · ø', reading: 'ny · s · ö', detail: 'Spanish tilde ñ, French cedilla ç, and Nordic slashed ø tailor 26 Roman strokes cleanly to native soundscapes.' }
      ]
    }
  };

  function resolveScriptInfo(scriptLabel, country) {
    const raw = (scriptLabel || '').trim();
    const s = raw.toLowerCase();
    const iso = (country && country.iso3 ? country.iso3 : '').toUpperCase();

    if (s.includes('hangul') || s.includes('chosŏn')) return PROFILES.hangul;
    if (s.includes('kanji') || s.includes('hiragana') || s.includes('katakana') || iso === 'JPN') return PROFILES.japanese;
    if (s.includes('hanzi') || s.includes('han') || s.includes('simplified') || s.includes('traditional') || iso === 'CHN' || iso === 'TWN') {
      if (!s.includes('hangul')) return PROFILES.hanzi;
    }
    if (s.includes('tifinagh')) return PROFILES.tifinagh;
    if (s.includes('thaana')) return PROFILES.thaana;
    if (s.includes('perso-arabic') || s.includes('nastaliq') || s.includes('shahmukhi') || s.includes('pashto') || s.includes('uyghur') || s.includes('sorani')) {
      return PROFILES.persoarabic;
    }
    if (s.includes('arabic') || s.includes('ajami')) return PROFILES.arabic;
    if (s.includes('devanagari')) return PROFILES.devanagari;
    if (s.includes('bengali') || s.includes('assamese')) return PROFILES.bengali;
    if (s.includes('tamil')) return PROFILES.tamil;
    if (s.includes('sinhala')) return PROFILES.sinhala;
    if (s.includes('tibetan')) return PROFILES.tibetan;
    if (s.includes('geʻez') || s.includes("ge'ez") || s.includes('fidel') || s.includes('fidäl')) return PROFILES.geez;
    if (s.includes('thai') || s.includes('tai tham')) return PROFILES.thai;
    if (s.includes('khmer')) return PROFILES.khmer;
    if (s.includes('burmese')) return PROFILES.burmese;
    if (s.includes('lao')) return PROFILES.lao;
    if (s.includes('hebrew')) return PROFILES.hebrew;
    if (s.includes('greek')) return PROFILES.greek;
    if (s.includes('georgian')) return PROFILES.georgian;
    if (s.includes('armenian')) return PROFILES.armenian;
    if (s.includes('syllabic')) return PROFILES.syllabics;
    if (s.includes('cyrillic') && !s.startsWith('latin')) return PROFILES.cyrillic;
    if (s.includes('latin & cyrillic') || s.includes('cyrillic & latin')) return PROFILES.cyrillic;
    return PROFILES.latin;
  }

  global.WORLD_SCRIPTS_INFO = {
    profiles: PROFILES,
    resolveScriptInfo
  };
})(window);

