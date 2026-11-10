# 🌍 Earthlingo

An interactive, high-FPS **3D linguistic atlas** mapping shared languages, multilingual breakdowns, writing scripts, regional dialects, family migration waves, and spoken phrasebooks across **242 countries and territories**.

Built as a static zero-build web app with **Three.js** and **Globe.gl**, bundled to work both **directly from disk (`file:///`)** and on **GitHub Pages (`github.io`)**.

---

## ✨ Features

### Interactive 3D Globe & Map Overlays
- **Color by Language, Family, or Writing Script**: Dynamically recolor the entire 3D globe and bottom-left filter legend between **Primary Language**, **Language Family**, and **Writing Script**.
- **Smart Overlay Auto-Sync & Manual Lock**: Switch **Map Overlays** (`Countries`, `Languages`, `Families`, `Scripts`, `Greetings`, or `Off`) with zoom-adaptive typography—**Auto-sync** automatically aligns land coloring when inspecting Families or Scripts, or lock **Manual** mode to mix overlays and color palettes freely.
- **Animated Origin & Migration Arcs**: Explore animated geodesic waves and *Urheimat* homeland markers across major historical dispersals (*Indo-European Steppe*, *Bantu Expansion*, *Austronesian Voyages*, *Semitic & Afroasiatic*, *Turkic Steppe*, *Colonial Maritime*) or animate a single country's lineage directly from its profile.
- **Flush Microstate Badges & Hardware Hover Tooltip**: Compact surface rings highlight 25 microstates (Vatican City, Monaco, Singapore, San Marino, Andorra, Malta, Bahrain, Maldives, and island nations) paired with a smooth, zero-jitter `translate3d` hover card.

### Country Profiles, Minority Spotlight & Pullable Mobile Sheet
- **Clickable Spoken Languages & Minority Spotlight**: Explore official, indigenous, regional, and diaspora languages with speaker share bars and resolved scripts (`Kanji/Kana`, `Geʻez`, `Devanagari`, `Cyrillic`, `Tifinagh`, `Thaana`, etc.). **Click any language card or spotlight pill** (e.g., *Kurdish*, *Quechua*, *Tamil*, *Yoruba*, *Catalan*) to spotlight every country on Earth where it is spoken.
- **Pullable Multi-State Bottom Sheet (Mobile)**: Smooth touch-drag physics on portrait mobile supporting **`peek`**, **`half`**, and **`full` screen** snap heights plus swipe-to-dismiss and automatic `peek` framing when spotlighting languages.
- **Accents, Dialects & Web Speech Feedback**: Guides to regional varieties alongside interactive phrasebook audio powered by the **HTML5 Web Speech API**, showing a clear `"No local audio voice — phonetic guide shown"` indicator whenever the local OS lacks a voice for that locale.

### Quiz, Country Compare, Search & Shareable Links
- **Guess the Greeting Quiz**: Audio + phonetic challenge across **Global**, **By Continent**, or **By Writing Script** pools with Haversine kilometer + compass bearing warmth hints, score/streak tracking, and instant answer reveal.
- **Side-by-Side Country Compare Mode**: Pin any two nations (via **Compare**, the drawer Compare shortcut, or curated presets) to inspect historical Urheimat alignment, clickable spoken-language Venn overlap, a side-by-side Phrase Duel with live TTS audio, and regional accent comparisons.
- **Instant Search (`/`) & Searchable 2D List Modal**: Filter all 242 countries and territories by name, spoken language, family, script, or continent inside the accessible 2D grid view.
- **Shareable URL Hash Deep-Links**: State syncs to `location.hash` (`#country=JPN&overlay=scripts&arcs=all`, filters, color mode, and compare pairs), with a one-click **Share** copy button in every drawer that works over HTTPS, localhost, and direct `file:///`.

| Shortcut | Action |
| :--- | :--- |
| `/` | Focus search bar |
| `Space` | Toggle globe auto-rotation |
| `R` | Reset camera view |
| `Esc` | Exit Quiz mode or close active drawer, modal, popover, or search |

---

## ⚡ Performance Architecture

Designed to stay smooth on integrated and mobile GPUs:
- **Merged GPU Geometry**: Combines 1,620 landmass polygons, country border segments, and 25 microstate badges into unified batched WebGL buffers (`6` core draw calls total).
- **Persistent-Pool Stabilized Overlays**: Reuses a fixed DOM label pool with hysteresis collision boxes, smooth opacity fades, and DPR-snapped transforms to eliminate pan/zoom jitter.
- **O(1) Spatial Picking**: Replaces heavy mesh raycasting with analytic ray-sphere intersection and a 10° spatial hash grid for high-frequency hover and click detection.
- **Pre-Bundled Offline Data**: Ships both JSON datasets and JS bundles (`world_countries.js`, `languages.js`, `origins.js`) alongside standalone `globe.gl.min.js`.

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

Earthlingo ships with a custom [`favicon.svg`](favicon.svg), OpenGraph / Twitter preview metadata (`assets/og-preview.png`), and relative (`./`) paths—requiring zero build step:

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
├── index.html                      # Semantic HTML5 shell, OG meta tags, controls, quiz & modals
├── favicon.svg                     # Custom vector globe + migration arc favicon
├── start_server.bat                # Windows 1-click local server launcher
├── assets/
│   └── og-preview.png              # 1200x630 OpenGraph & Twitter social preview card
├── styles/                         # Modular CSS stylesheets
│   ├── tokens.css                  # Design variables, reset & core keyframes
│   ├── layout.css                  # Header nav, search, legend, color-by toggle & canvas
│   ├── overlays.css                # Map overlay badges, popover & hover tooltip
│   ├── drawer.css                  # Country drawer, origin explorer, quiz & compare modals
│   └── responsive.css              # Mobile portrait bottom sheet & tablet breakpoints
├── src/                            # Modular client application (window.Earthlingo)
│   ├── main.js                     # Application entry point & bootstrapper
│   ├── core/
│   │   ├── config.js               # Visual tuning, language/family/script palettes & overlays
│   │   ├── state.js                # Centralized app state, GPU batch & DOM cache
│   │   ├── utils.js                # Color, geometry, DPR & viewport helpers
│   │   └── router.js               # URL hash deep-linking router & share link copier
│   ├── data/
│   │   └── geo-index.js            # Country lookup, spoken-language index & 10° spatial grid
│   ├── globe/
│   │   ├── scene.js                # Globe.gl initialization, camera bounds & pointer picking
│   │   ├── polygon-batcher.js      # Merged WebGL country meshes & spherical subdivision
│   │   ├── bathymetry.js           # Procedural ocean texture & lighting
│   │   └── arcs.js                 # Language family origin & migration arcs explorer
│   ├── overlays/
│   │   ├── label-formatter.js      # Script metadata resolver, overlay titles & sizing
│   │   └── map-overlays.js         # Persistent-pool, hysteresis map overlay engine
│   └── ui/
│       ├── tooltip.js              # High-frequency desktop hover tooltip
│       ├── drawer.js               # Country drawer, mobile pull gestures & Web Speech TTS
│       ├── compare.js              # Side-by-side country compare mode & Phrase Duel
│       ├── quiz.js                 # Interactive "Guess the Greeting" challenge
│       └── controls.js             # Legend filters, Color-By, search, toolbar & 2D list modal
├── libs/
│   └── globe.gl.min.js             # Bundled Globe.gl + Three.js runtime (CDN fallback in HTML)
├── data/
│   ├── world_countries.geojson     # GeoJSON boundaries for 242 countries & territories
│   ├── world_countries.js          # Offline file:// bundle of world_countries.geojson
│   ├── languages.json              # Country profiles, languages, accents & phrasebooks
│   ├── languages.js                # Offline file:// bundle of languages.json
│   └── origins.js                  # Language family Urheimats, routes & timelines
├── scripts/                        # Database assembly, enrichment & color utilities
│   ├── build_full_database.js
│   ├── enrich_database.js
│   ├── update_language_colors.js
│   ├── country_data.js
│   └── countries_*.js
└── README.md
```

---

## 🌐 Supported Browsers

Requires a modern browser with **WebGL** (hardware acceleration recommended) and **Web Speech API** support:
- Google Chrome / Chromium
- Microsoft Edge
- Mozilla Firefox
- Apple Safari (macOS & iOS)
