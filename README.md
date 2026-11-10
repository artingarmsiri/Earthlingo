# 🌍 Earthlingo

An interactive, high-FPS **3D linguistic atlas** mapping shared languages, multilingual breakdowns, writing scripts, regional dialects, family migration waves, and spoken phrasebooks across **242 countries and territories**.

Built as a static zero-build web app with **Three.js** and **Globe.gl**, bundled to work both **directly from disk (`file:///`)** and on **GitHub Pages (`github.io`)**.

---

## ✨ Features

### Interactive 3D Globe, Overlays & Historical Views
- **Color by Language, Family, Script, or Linguistic Diversity**: Dynamically recolor all **242 nations** between **Primary Language**, **Language Family**, **Writing Script**, and **Diversity (Greenberg LDI)** — spotlighting hyper-diverse regions like Papua New Guinea (`0.99`, `840` living tongues), Vanuatu (`0.97`), India (`0.93`), Nigeria (`0.89`), and Indonesia.
- **Endangered Language Pins (35 GPU Hotspots)**: Toggle glowing WebGL beacon pins for endangered indigenous tongues and isolates (*Ainu*, *N|uu*, *Western Neo-Aramaic*, *Manx*, *Yagán*, *Inuktitut*, *Sámi*, *Soqotri*, *Cherokee*, etc.) with a click/tap inspector linking straight to the country profile.
- **Historical Time-Scrubber ("Languages Before 1492" Mode)**: Scrub or auto-play eras across **c. 2000 BCE**, **100 CE**, **1000 CE**, **1492 CE (Pre-Columbian)**, and **Today** — shifting continental language spheres back in time (Indigenous Americas, Aboriginal Australia, Old Norse Greenland, Roman Latin & Koine Greek) while chronologically filtering origin & word-route arcs.
- **Smart Overlay Auto-Sync & Manual Lock**: Switch **Map Overlays** (`Countries`, `Languages`, `Families`, `Scripts`, `Greetings`, or `Off`) with zoom-adaptive typography—**Auto-sync** aligns land coloring when inspecting Families or Scripts, or lock **Manual** mode to mix freely.
- **Animated Origin Arcs & Cognate Word Routes Explorer**: Explore animated geodesic **Family Dispersal** waves (*Indo-European Steppe*, *Bantu Expansion*, *Austronesian Voyages*, etc.) or switch to **Word Routes** to trace famous *Wanderwörter* across history (**Tea** Silk Road *chá* vs Maritime Fujian *tê*, **Coffee**, **Sugar**, **Orange**, **Zero**, and **Mother/Mama**) with interactive country stops.
- **Flush Microstate Badges & Hardware Hover Tooltip**: Compact surface rings highlight 25 microstates paired with a smooth, zero-jitter `translate3d` hover card.

### Country Profiles, Interactive Scripts & Pullable Mobile Sheet
- **Clickable Spoken Languages & Minority Spotlight**: Every country features enriched primary, indigenous, regional, and diaspora languages with speaker shares and resolved script badges. **Click any language card or spotlight pill** (*Kurdish*, *Quechua*, *Tamil*, *Yoruba*, *Catalan*, etc.) to spotlight every nation where that language is spoken.
- **Interactive "Meet the Script" Breakdown**: Click any `Script: ... ⓘ` pill inside a country drawer (or after solving a Script Detective quiz round) to inspect script typology (*Abjad RTL*, *Abugida*, *Featural Alphabet*, *Syllabary/Kanji*, *Cyrillic*, *Syllabics*) with interactive character-by-character breakdowns — Hangul Jamo blocks, Japanese Furigana readings, Arabic ligature positions, Devanagari vowel matras, and a one-click **Spotlight All Nations** script filter.
- **Pullable Multi-State Bottom Sheet (Mobile)**: Smooth touch-drag physics on portrait mobile supporting **`peek`**, **`half`**, and **`full` screen** snap heights plus swipe-to-dismiss and automatic `peek` framing when spotlighting languages.
- **Accents, Dialects & Web Speech Feedback**: Regional dialect cards paired with interactive phrasebook pronunciation via the **HTML5 Web Speech API** and clear `"No local audio voice — phonetic guide shown"` feedback when the OS lacks a locale voice.

### Quiz Modes, Linguistic Passport, Compare & Travel Cheat-Sheet
- **Guess the Greeting Quiz (`Locate`, `Daily 5`, `Script Detective`, `Dialect Trivia`)**:
  - **Locate**: Global, by-continent, or by-script rounds with Haversine distance + compass bearing warmth feedback.
  - **Daily 5**: Deterministic local-date seeded 5-round daily challenge generating a Wordle-style copyable `🟩🟨🟥` emoji summary grid.
  - **Script Detective**: Strips romanization during play so you identify the nation from raw native glyphs (*Hangul*, *Geʻez*, *Thaana*, *Arabic*, *Mkhedruli*, etc.) before unlocking full phonetics and the interactive Script breakdown.
  - **Dialect Trivia**: Multiple-choice trivia generated live from country regional accent & dialect profiles.
- **Linguistic Passport (`localStorage` + JSON Backup)**: Tracks visited nations (`X / 242`), unlocked writing scripts (`X / 9`), quiz accuracy, streaks, and saved Daily 5 stamps inside the **Passport** modal, with full **Export / Import JSON** and confirmed reset.
- **Travel Trip Cheat-Sheet & Offline PWA**: Star countries directly from drawers, search cards, or curated presets (*Spain → Morocco → Italy*, *Japan → Korea → Taiwan*, *Turkey → Iran → Uzbekistan*), reorder itinerary stops, copy plain-text pocket guides, print compact travel cards, back up or share routes via **Export / Import JSON**, and install Earthlingo as an offline **Progressive Web App (PWA)** when hosted over HTTP/HTTPS.
- **Side-by-Side Country Compare, Search (`/`) & Shareable Hash Deep-Links**: Pin two nations for shared Urheimat/Venn/Phrase Duel comparison, filter all 242 entries in the searchable **2D List Modal**, navigate search results with keyboard arrows, and share reproducible views via `location.hash` (`#country=PER&overlay=scripts&color=diversity&pins=1&era=1492ce&trip=...`).

| Shortcut | Action |
| :--- | :--- |
| `/` | Focus search bar |
| `↑` / `↓` / `Enter` | Navigate and select search autocomplete matches |
| `Tab` / `Shift+Tab` | Trap and cycle keyboard focus within open modals |
| `Space` | Toggle globe auto-rotation |
| `R` | Reset camera view |
| `Esc` | Exit Quiz mode or close active drawer, modal, popover, or search |

---

## ⚡ Performance Architecture

Designed to stay smooth on integrated and mobile GPUs:
- **Merged GPU Geometry**: Combines 1,620 landmass polygons, country border segments, 25 microstate badges, and instanced hotspot pins into unified batched WebGL buffers.
- **Persistent-Pool Stabilized Overlays**: Reuses a fixed DOM label pool with hysteresis collision boxes, smooth opacity fades, and DPR-snapped transforms to eliminate pan/zoom jitter.
- **O(1) Spatial Picking**: Replaces heavy mesh raycasting with analytic ray-sphere intersection and a 10° spatial hash grid for high-frequency hover and click detection.
- **Pre-Bundled Offline Data & Service Worker PWA**: Ships bundled JS datasets (`world_countries.js`, `languages.js`, `origins.js`, `etymology.js`, `scripts_info.js`, `historical_eras.js`), standalone `globe.gl.min.js`, and a cache-first `sw.js` + `manifest.json`.

---

## 🚀 Running Locally

### Option 1: Open Directly (No Server Needed)
Double-click [`index.html`](index.html) to open Earthlingo straight in your browser. Pre-bundled script datasets prevent `file:///` CORS fetch errors automatically.

### Option 2: Windows Launcher
Double-click [`start_server.bat`](start_server.bat) to start a local HTTP server on `http://localhost:8000` (uses Python or Node if available, otherwise launches `index.html`).

### Option 3: Local Dev Server
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

---

## 📦 Deploying to GitHub Pages

Earthlingo ships with [`manifest.json`](manifest.json), offline [`sw.js`](sw.js), a custom [`favicon.svg`](favicon.svg), PWA app icons (`assets/icon-192.png`, `assets/icon-512.png`), OpenGraph / Twitter preview metadata, and relative (`./`) paths—requiring zero build step:

1. Push your repository to GitHub (e.g. `https://github.com/<username>/Earthlingo`).
2. Open your repository **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select branch **`main`** and folder **`/ (root)`**, then click **Save**.
5. Once published, your site will be live at:
   ```text
   https://<username>.github.io/Earthlingo/
   ```

---

## 📂 Project Structure

```text
Earthlingo/
├── index.html                      # Semantic HTML5 shell, conditional PWA manifest, controls & modals
├── package.json                    # Zero-dep npm scripts for validation, reproducible DB checks & builds
├── manifest.json                   # Installable PWA web app manifest (HTTP/HTTPS)
├── sw.js                           # Offline cache-first Service Worker
├── favicon.svg                     # Custom vector globe + migration arc favicon
├── start_server.bat                # Windows 1-click local server launcher
├── .github/workflows/ci.yml        # GitHub Actions workflow running `npm test` and `npm run check:db`
├── assets/
│   ├── icon-192.png                # 192x192 PWA icon
│   ├── icon-512.png                # 512x512 PWA icon
│   └── og-preview.png              # 1200x630 OpenGraph & Twitter social preview card
├── styles/                         # Modular CSS stylesheets
│   ├── tokens.css                  # Design variables, reset & core keyframes
│   ├── layout.css                  # Header nav, search, legend, color-by toggle & canvas
│   ├── overlays.css                # Map overlay badges, pin inspector, time-scrubber & tooltip
│   ├── drawer.css                  # Country drawer, arcs/word routes, passport, script & trip modals
│   └── responsive.css              # Mobile portrait bottom sheet, print rules & breakpoints
├── src/                            # Modular client application (window.Earthlingo)
│   ├── main.js                     # Application entry point, PWA SW registration & bootstrapper
│   ├── core/
│   │   ├── config.js               # Palettes (language/family/script/diversity LDI) & overlays
│   │   ├── state.js                # Centralized app state, GPU batch & DOM cache
│   │   ├── utils.js                # Color, geometry, DPR, modal focus-trap & JSON download helpers
│   │   └── router.js               # URL hash deep-linking router & share link copier
│   ├── data/
│   │   └── geo-index.js            # Country lookup, spoken-language & diversity index, spatial grid
│   ├── globe/
│   │   ├── scene.js                # Globe.gl initialization, camera bounds & pointer/pin picking
│   │   ├── polygon-batcher.js      # Merged WebGL country meshes, diversity/era coloring & rings
│   │   ├── bathymetry.js           # Procedural ocean texture & lighting
│   │   ├── pins.js                 # Instanced GPU endangered hotspot & etymology word-stop pins
│   │   └── arcs.js                 # Family origin waves, Wanderwörter routes & chronological filter
│   ├── overlays/
│   │   ├── label-formatter.js      # Script metadata resolver, overlay titles & sizing
│   │   └── map-overlays.js         # Persistent-pool, hysteresis map overlay engine
│   └── ui/
│       ├── tooltip.js              # High-frequency desktop hover tooltip
│       ├── passport.js             # LocalStorage Linguistic Passport, JSON export/import & modal
│       ├── script-inspector.js     # Interactive "Meet the Script" breakdown modal
│       ├── trip.js                 # Travel Trip Cheat-Sheet builder, JSON export/import & print exporter
│       ├── drawer.js               # Country drawer, mobile pull gestures & Web Speech TTS
│       ├── compare.js              # Side-by-side country compare mode & Phrase Duel
│       ├── quiz.js                 # Locate, Daily 5 seeded challenge, Script Detective & Dialect Trivia
│       └── controls.js             # Legend filters, Color-By, time-scrubber, keyboard search & 2D list modal
├── libs/
│   └── globe.gl.min.js             # Bundled Globe.gl + Three.js runtime (CDN fallback in HTML)
├── data/
│   ├── world_countries.geojson     # GeoJSON boundaries for 242 countries & territories
│   ├── world_countries.js          # Offline file:// bundle of world_countries.geojson
│   ├── languages.json              # Country profiles, multilingual breakdowns, LDI & phrasebooks
│   ├── languages.js                # Offline file:// bundle of languages.json
│   ├── origins.js                  # Language family Urheimats, routes & dated timelines
│   ├── etymology.js                # Wanderwörter word-route datasets (Tea, Coffee, Sugar, Zero, etc.)
│   ├── scripts_info.js             # Interactive script typology & glyph-by-glyph breakdowns
│   └── historical_eras.js          # 35 endangered language hotspots & 2000 BCE–1492 CE era atlas
├── scripts/                        # Chained database assembly, overrides, diversity & enrichment pipeline
│   ├── build_full_database.js      # Builds data/languages.{json,js} & chains color/script/LDI enrichment
│   ├── localized_overrides.json    # Localized phrasebooks & minority language overrides across 196 ISO3s
│   ├── update_language_colors.js
│   ├── enrich_database.js
│   └── enrich_multilingual_diversity.js
├── tests/                          # Zero-dependency Node.js validation & build-reproducibility tests
│   ├── validate.js
│   └── check-db-build.js
└── README.md
```

---

## 🧪 Tests & Rebuilding the Database

Zero external `npm install` dependencies required (Node.js ≥ 18):

```bash
# Run syntax, manifest/asset, dataset invariant (242 ISO3s, 0 placeholders) & VM unit checks
npm test

# Verify that rebuilding data/languages.json & data/languages.js is 100% lossless
npm run check:db

# Rebuild and enrich data/languages.json & data/languages.js end-to-end
npm run build:db
```

---

## 🌐 Supported Browsers

Requires a modern browser with **WebGL** (hardware acceleration recommended) and **Web Speech API** support:
- Google Chrome / Chromium
- Microsoft Edge
- Mozilla Firefox
- Apple Safari (macOS & iOS)
