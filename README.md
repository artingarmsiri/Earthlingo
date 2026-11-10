# 🌍 Earthlingo

An interactive, high-FPS **3D linguistic atlas** mapping shared languages, multilingual breakdowns, regional accents, dialects, and spoken phrasebooks across **242 countries and territories**.

Built as a static zero-build web app with **Three.js** and **Globe.gl**, bundled to work both **directly from disk (`file:///`)** and on **GitHub Pages (`github.io`)**.

---

## ✨ Features

### Interactive 3D Globe
- **Shared-Language Color Map**: Countries speaking the same primary language (Spanish, English, French, Arabic, Portuguese, Russian, etc.) share the same color, while related language families use harmonious tones.
- **Tactile Navigation**: Orbit smoothly with inertia damping, toggle auto-rotation or atmospheric glow, or click any nation to fly directly to its geographic center with a crisp selection highlight.
- **Flush Microstate Badges**: Compact surface locator rings highlight 25 small sovereign nations (Vatican City, Monaco, Singapore, San Marino, Liechtenstein, Andorra, Malta, Bahrain, Maldives, and Caribbean/Pacific island states) without obscuring nearby borders.
- **Shared-Language Arcs**: Toggle 3D geodesic arcs to link nations sharing a selected country's language, filtered language, or major global hubs.

### Country Linguistic Profiles
- **Multiple Spoken Languages**: Breakdown of official, co-official, indigenous, and regional minority languages with speaker percentage bars, estimates, scripts (Latin, Cyrillic, Arabic, Devanagari, Hangul, Kanji/Kana, Ge'ez, etc.), and historical notes.
- **Accents & Dialects**: Guides to regional varieties, phonetic quirks, intonation patterns, and colloquial expressions (e.g., Cockney/Scouse/Geordie, Chilango/Norteño, Kansai-ben, Swiss German).
- **Audio Phrasebook**: Common greetings, thank-yous, and farewells with phonetic guides and one-click pronunciation via the browser's **HTML5 Web Speech API**.

### Search, Filters & Accessibility
- **Instant Search (`/` shortcut)**: Search simultaneously by country name, native name, spoken language, accent, language family, or continent.
- **Shared Languages Filter Legend**: Click any major language chip in the bottom-left legend to spotlight all matching countries and microstate badges while dimming others.
- **Accessible 2D List View**: Full 242-country searchable/scrollable card directory for keyboard users, screen readers, or quick non-3D browsing.

| Shortcut | Action |
| :--- | :--- |
| `/` | Focus search bar |
| `Space` | Toggle globe auto-rotation |
| `R` | Reset camera view |
| `Esc` | Close active drawer, modal, or search |

---

## ⚡ Performance Architecture

Designed to stay smooth on integrated GPUs:
- **Merged GPU Geometry**: Combines 1,620 landmass polygons, country border segments, and 25 microstate badges into unified batched WebGL buffers (`6` core draw calls total).
- **O(1) Spatial Picking**: Replaces heavy mesh raycasting with analytic ray-sphere intersection and a 10° spatial hash grid for low-overhead hovering and clicking.
- **Pre-Bundled Offline Data**: Ships both JSON datasets and JS bundles (`world_countries.js`, `languages.js`) alongside standalone `globe.gl.min.js`.

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

Earthlingo requires no bundler or build step—all paths are relative (`./`):

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
├── index.html                      # Semantic HTML5 shell, controls, modals & drawer
├── styles.css                      # Dark UI styling, layout & responsive rules
├── app.js                          # Merged WebGL rendering, spatial picker, search & TTS
├── start_server.bat                # Windows 1-click local server launcher
├── libs/
│   └── globe.gl.min.js             # Bundled Globe.gl + Three.js runtime (CDN fallback in HTML)
├── data/
│   ├── world_countries.geojson     # GeoJSON boundaries for 242 countries & territories
│   ├── world_countries.js          # Offline file:// bundle of world_countries.geojson
│   ├── languages.json              # Country profiles, languages, accents & phrasebooks
│   └── languages.js                # Offline file:// bundle of languages.json
├── scripts/                        # Database assembly & color assignment utilities
│   ├── build_full_database.js
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
