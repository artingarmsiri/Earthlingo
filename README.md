# 🌍 Earthlingo — World Languages & Accents Atlas

An interactive, accessible 3D linguistic globe web application mapping languages, multiple spoken languages, regional accents, dialects, and interactive audio phrasebooks for every single country on Earth.

Built with **Three.js** and **Globe.gl**, designed with a modern glassmorphic UI, and structured for zero-configuration deployment to **GitHub Pages** (`github.io`).

---

## ✨ Features

- **🌐 Interactive 3D Earth Globe**:
  - Full 3D rotation, zooming, and panning with smooth inertia damping.
  - Every country and territory rendered with precise geometric boundaries.
  - Countries color-coded by their dominant **Language Family** (Germanic, Romance, Slavic, Sino-Tibetan, Afroasiatic, Niger-Congo, Austronesian, Turkic, Uralic, Dravidian, etc.).
  - Microstate markers for islands and city-states (Singapore, Monaco, Malta, Andorra, Maldives, Samoa, etc.).
  - Smooth camera animation: clicking any country flies the camera directly to that country's centroid.

- **🗣️ Multiple Languages Breakdown**:
  - Detailed breakdown of all languages spoken in each country:
    - Official & national languages
    - Co-official & regional languages
    - Indigenous & minority tongues
  - Speaker percentage bars, estimated speaker populations, and writing scripts (Latin, Cyrillic, Arabic, Devanagari, Hangul, Kanji/Kana, Ge'ez, etc.).

- **🎙️ Accents & Regional Dialects**:
  - In-depth guide to regional accents for each country (e.g. Cockney vs Scouse vs Geordie in the UK, Chilango vs Norteño in Mexico, Swiss German vs High German in Switzerland, Kansai-ben in Japan, AAVE vs Southern Drawl in the US).
  - Describes distinctive phonetic quirks, intonation patterns, and famous colloquial slang with meanings.

- **🔊 Interactive Audio Phrasebook (Text-to-Speech)**:
  - Common greetings, thank-you expressions, and farewells with phonetic guides.
  - **"Listen" button** that speaks the phrase in that language/accent using the browser's built-in **HTML5 Web Speech Synthesis API** with realistic native pronunciation.

- **🔍 Search & Filter**:
  - Instant search autocomplete: search by **Country name**, **Language** (e.g., searching "Spanish" or "Arabic" shows all matching nations), **Accent**, or **Continent**.
  - **Language Family Filter Legend**: click any family chip in the legend to highlight matching nations on the globe while dimming others.

- **♿ Accessibility First**:
  - **2D List / Grid View modal**: a flat, accessible table/grid view for screen readers or users who prefer a non-3D interface.
  - Keyboard shortcuts:
    - `/` : Focus search bar
    - `Spacebar` : Toggle globe auto-rotation
    - `R` : Reset globe camera
    - `Esc` : Close drawers and modals

---

## 🚀 How to Run Locally

You have two easy ways to run the app locally:

### Option 1: Just Double-Click `index.html` (Instant — No Server Required!)
The application is pre-bundled with offline data scripts (`world_countries.js` and `languages.js`). You can literally **double-click `index.html`** in Windows Explorer to open it in Chrome, Edge, Safari, or Firefox without any CORS or "failed to fetch" errors!

### Option 2: 1-Click Server Launcher (`start_server.bat`)
Double-click `start_server.bat` in this folder. It automatically detects Python or Node, starts a local server on port 8000, and opens your browser.

### Option 3: Command Line
```bash
# Using Python:
python -m http.server 8000

# Using Node:
npx serve .
```

---

## 📦 How to Host on GitHub Pages (`github.io`)

This project has **zero build steps** and uses purely relative paths (`./`), making deployment to GitHub Pages instantaneous:

1. **Create a GitHub repository** (e.g. `Earthlingo`).
2. **Commit and push** all files in this directory to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Earthlingo"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** (gear icon) → **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, choose **"Deploy from a branch"**.
   - Under **Branch**, select `main` and folder `/ (root)`, then click **Save**.
4. In about 30 seconds, your site will be live at:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

---

## 📂 Project Structure

```
world lang/
├── index.html                  # Accessible main entry point with semantic HTML5
├── styles.css                  # Modern glassmorphism dark theme & responsive layouts
├── app.js                      # 3D globe logic, Web Speech TTS, search & interactivity
├── data/
│   ├── world_countries.geojson # Optimized GeoJSON boundaries for 242 countries
│   └── languages.json          # Exhaustive language, accent, and phrase database
├── libs/
│   └── globe.gl.min.js         # Bundled standalone Globe.gl library (works 100% offline)
├── scripts/                    # Database compilation and maintenance utilities
│   ├── build_full_database.js
│   ├── country_data.js
│   ├── countries_americas.js
│   ├── countries_europe.js
│   ├── countries_asia.js
│   ├── countries_africa.js
│   └── countries_oceania.js
└── README.md                   # Documentation and deployment instructions
```

---

## 🌐 Supported Browsers

Works in all modern browsers supporting WebGL and Web Speech API:
- Google Chrome & Chromium
- Mozilla Firefox
- Microsoft Edge
- Apple Safari (macOS & iOS)

