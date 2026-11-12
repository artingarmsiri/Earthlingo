// tests/validate.js - Zero-dependency Static, Dataset & Module Invariant Test Suite
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let checksRun = 0;

function test(name, fn) {
  try {
    fn();
    checksRun += 1;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

function walkJsFiles(dirRel) {
  const full = path.join(ROOT, dirRel);
  if (!fs.existsSync(full)) return [];
  const results = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dirRel, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkJsFiles(rel));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(rel);
    }
  }
  return results;
}

console.log('Running Earthlingo validation suite...\n');

// 1. JS Syntax Validation
test('All JS files parse cleanly without syntax errors', () => {
  const files = [
    'sw.js',
    ...walkJsFiles('src'),
    ...walkJsFiles('data'),
    ...walkJsFiles('scripts'),
    ...walkJsFiles('tests')
  ];
  assert(files.length >= 25, `Expected at least 25 JS files, found ${files.length}`);
  for (const rel of files) {
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    new vm.Script(code, { filename: rel });
  }
});

// 2. JSON & Manifest Schema Validation
test('Manifest, package.json, localized overrides, and JSON datasets are valid', () => {
  const jsonFiles = [
    'package.json',
    'manifest.json',
    'scripts/localized_overrides.json',
    'data/languages.json',
    'data/world_countries.geojson'
  ];
  for (const rel of jsonFiles) {
    const raw = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    JSON.parse(raw);
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  assert(manifest.name && manifest.short_name, 'manifest.json must specify name & short_name');
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'manifest.json must list icons');
  for (const icon of manifest.icons) {
    const iconRel = String(icon.src || '').replace(/^\.\//, '');
    assert(fs.existsSync(path.join(ROOT, iconRel)), `Missing manifest icon: ${icon.src}`);
  }
});

// 3. HTML, OpenGraph, Legacy Cleanup & Service Worker Asset Integrity
test('index.html & sw.js reference valid existing assets and og-preview.png', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const swSrc = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

  // Verify deleted obsolete files stay absent
  const deletedFiles = ['app.js', 'styles.css', 'scripts/find_edge_line.js'];
  for (const dead of deletedFiles) {
    assert(!fs.existsSync(path.join(ROOT, dead)), `Obsolete file should stay deleted: ${dead}`);
  }
  assert(!/src=["']\.\/app\.js/.test(html), 'index.html must not reference removed app.js');
  assert(!/href=["']\.\/styles\.css/.test(html), 'index.html must not reference removed styles.css');

  // Verify OpenGraph & Twitter preview cards use 1200x630 og-preview.png
  const ogMatch = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  const twMatch = html.match(/name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  assert(ogMatch && ogMatch[1].endsWith('/assets/og-preview.png'), `og:image must point to assets/og-preview.png (got ${ogMatch && ogMatch[1]})`);
  assert(twMatch && twMatch[1].endsWith('/assets/og-preview.png'), `twitter:image must point to assets/og-preview.png (got ${twMatch && twMatch[1]})`);
  assert(fs.existsSync(path.join(ROOT, 'assets/og-preview.png')), 'assets/og-preview.png must exist');

  // Verify all local <script src="./..."> & <link href="./..."> in index.html resolve to real files
  const assetRefs = [];
  const attrRe = /(?:src|href)=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']/g;
  let m;
  while ((m = attrRe.exec(html)) !== null) {
    assetRefs.push(m[1]);
  }
  assert(assetRefs.length >= 25, 'Expected >= 25 local asset references in index.html');
  for (const rel of assetRefs) {
    assert(fs.existsSync(path.join(ROOT, rel)), `Missing asset referenced by index.html: ./${rel}`);
  }

  // Verify all sw.js CORE_ASSETS exist on disk
  const listMatch = swSrc.match(/const\s+CORE_ASSETS\s*=\s*\[([\s\S]*?)\];/);
  assert(listMatch, 'sw.js must define CORE_ASSETS array');
  const swAssets = [];
  const swItemRe = /['"]\.\/([^'"]*)['"]/g;
  while ((m = swItemRe.exec(listMatch[1])) !== null) {
    if (m[1]) swAssets.push(m[1]);
  }
  assert(swAssets.length >= 25, 'sw.js CORE_ASSETS must include app scripts & stylesheets');
  for (const rel of swAssets) {
    assert(fs.existsSync(path.join(ROOT, rel)), `Missing file listed in sw.js CORE_ASSETS: ./${rel}`);
  }

  // Verify every src/**/*.js module is loaded by index.html and cached by sw.js CORE_ASSETS
  const srcFiles = walkJsFiles('src').map(f => f.replace(/\\/g, '/'));
  const htmlSet = new Set(assetRefs.map(f => f.replace(/\\/g, '/')));
  const swSet = new Set(swAssets.map(f => f.replace(/\\/g, '/')));
  for (const rel of srcFiles) {
    assert(htmlSet.has(rel), `index.html missing <script> for ${rel}`);
    assert(swSet.has(rel), `sw.js CORE_ASSETS missing ${rel}`);
  }

  // Verify split UI submodules load before controls.js & scene.js
  const scriptOrder = assetRefs.map(f => f.replace(/\\/g, '/'));
  const controlsIdx = scriptOrder.indexOf('src/ui/controls.js');
  const sceneIdx = scriptOrder.indexOf('src/globe/scene.js');
  assert(controlsIdx !== -1 && sceneIdx !== -1 && controlsIdx < sceneIdx, 'controls.js must load before scene.js');
  for (const sub of ['src/ui/legend.js', 'src/ui/timeline.js', 'src/ui/search.js', 'src/ui/list-modal.js']) {
    const idx = scriptOrder.indexOf(sub);
    assert(idx !== -1 && idx < controlsIdx, `${sub} must load before src/ui/controls.js`);
  }
});

// 4. Linguistic Database Invariants (languages.json & world_countries.geojson)
const languagesJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/languages.json'), 'utf8'));
const geoJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/world_countries.geojson'), 'utf8'));

test('242 unique ISO3s exist with >=2 languages, 0 script placeholders, 0 plain IE, and valid LDI', () => {
  const uniqueIsos = new Map();
  const wrongCanonicalCheck = new Set(['SVN', 'MNE', 'MNG', 'MDV', 'LTU', 'LVA', 'ISL', 'EST']);
  const validTiers = new Set(['Low Diversity', 'Moderate Diversity', 'High Diversity', 'Hyper-Diverse']);
  let nonPlaceholderGreetings = 0;

  for (const f of geoJson.features) {
    const p = f.properties || {};
    const iso3 = (p.iso_a3 && p.iso_a3 !== '-99') ? p.iso_a3 : p.name;
    const entry = languagesJson[iso3] || languagesJson[p.name];
    assert(entry, `GeoJSON feature "${p.name}" (${iso3}) missing from data/languages.json`);
    if (!uniqueIsos.has(entry.iso3.toUpperCase())) {
      uniqueIsos.set(entry.iso3.toUpperCase(), entry);
    }
  }

  assert.strictEqual(uniqueIsos.size, 242, `Expected exactly 242 unique ISO3 entries, found ${uniqueIsos.size}`);

  for (const [iso, c] of uniqueIsos.entries()) {
    assert(c.name && c.iso3, `${iso}: missing name or iso3`);
    assert(Array.isArray(c.centroid) && c.centroid.length === 2, `${iso}: invalid centroid`);
    const [lng, lat] = c.centroid;
    assert(lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90, `${iso}: centroid out of bounds [${lng}, ${lat}]`);

    assert(c.languageFamily && c.languageFamily !== 'Indo-European', `${iso}: plain "Indo-European" family disallowed`);
    if (wrongCanonicalCheck.has(iso)) {
      assert.notStrictEqual(c.canonicalLanguage, 'English', `${iso}: canonicalLanguage must not be "English"`);
    }

    assert(Array.isArray(c.languages) && c.languages.length >= 2, `${iso}: expected >= 2 spoken languages, got ${c.languages && c.languages.length}`);
    for (const l of c.languages) {
      const scr = String(l.script || '').trim();
      assert(scr && scr !== 'Official National Script' && scr !== 'National Script', `${iso}: placeholder script "${scr}"`);
    }

    assert(Number.isFinite(c.livingLanguages) && c.livingLanguages >= 2, `${iso}: invalid livingLanguages (${c.livingLanguages})`);
    assert(Number.isFinite(c.ldiScore) && c.ldiScore > 0 && c.ldiScore <= 1, `${iso}: invalid ldiScore (${c.ldiScore})`);
    assert(Number.isFinite(c.diversityScore) && c.diversityScore >= 4 && c.diversityScore <= 100, `${iso}: invalid diversityScore (${c.diversityScore})`);
    assert(validTiers.has(c.ldiTier), `${iso}: invalid ldiTier (${c.ldiTier})`);

    assert(Array.isArray(c.phrases) && c.phrases.length >= 3, `${iso}: expected >= 3 phrasebook entries`);
    const greet = c.phrases[0];
    assert(greet && greet.text && greet.bcp47, `${iso}: greeting phrase incomplete`);
    if (greet.text !== 'Hello / Greetings!') {
      nonPlaceholderGreetings += 1;
    }
  }

  assert(nonPlaceholderGreetings >= 190, `Expected >= 190 localized non-fallback greetings (eb0cb64 preservation), found ${nonPlaceholderGreetings}`);
});

// 5. Offline VM Execution & Unit Tests across Core Modules & UI Logic
function createSandboxWindow() {
  const storage = new Map();
  const mockElements = new Map();
  const noop = () => {};
  const createMockEl = (tag = 'DIV') => ({
    tagName: tag,
    style: {},
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    setAttribute: noop,
    removeAttribute: noop,
    getAttribute: () => null,
    addEventListener: noop,
    querySelector: () => null,
    querySelectorAll: () => [],
    closest: () => null,
    appendChild: noop,
    focus: noop,
    blur: noop,
    isConnected: true,
    innerHTML: '',
    textContent: ''
  });
  const ensureMockEl = (id) => {
    if (!id) return null;
    if (!mockElements.has(id)) mockElements.set(id, createMockEl('DIV'));
    return mockElements.get(id);
  };

  const sandbox = {
    console,
    Math,
    Date,
    Set,
    Map,
    JSON,
    Number,
    String,
    Array,
    Object,
    Boolean,
    RegExp,
    URLSearchParams,
    innerWidth: 1440,
    innerHeight: 900,
    devicePixelRatio: 1,
    location: { protocol: 'https:', hostname: 'artingarmsiri.github.io', pathname: '/Earthlingo/', search: '', hash: '', href: 'https://artingarmsiri.github.io/Earthlingo/' },
    history: { replaceState: (_s, _t, u) => { sandbox.location.hash = String(u).includes('#') ? String(u).slice(String(u).indexOf('#')) : ''; } },
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k)
    },
    document: {
      activeElement: null,
      body: createMockEl('BODY'),
      documentElement: createMockEl('HTML'),
      createElement: (tag) => createMockEl(String(tag).toUpperCase()),
      createDocumentFragment: () => ({ appendChild: noop }),
      getElementById: (id) => ensureMockEl(id),
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: noop
    },
    addEventListener: noop,
    setTimeout,
    clearTimeout
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  vm.createContext(sandbox);
  return sandbox;
}

function loadIntoSandbox(sandbox, relPath) {
  const code = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  vm.runInContext(code, sandbox, { filename: relPath });
}

test('Offline JS bundles (data/*.js) execute in VM and match JSON data', () => {
  const sb = createSandboxWindow();
  for (const rel of [
    'data/world_countries.js',
    'data/languages.js',
    'data/origins.js',
    'data/etymology.js',
    'data/scripts_info.js',
    'data/historical_eras.js'
  ]) {
    loadIntoSandbox(sb, rel);
  }

  assert.strictEqual(Object.keys(sb.WORLD_LANGUAGES).length, Object.keys(languagesJson).length, 'WORLD_LANGUAGES key count must match data/languages.json');
  assert.strictEqual(sb.WORLD_GEOJSON.features.length, geoJson.features.length, 'WORLD_GEOJSON feature count must match geojson');
  assert(sb.WORLD_ORIGINS && sb.WORLD_ORIGINS.corridors && typeof sb.WORLD_ORIGINS.resolveCountryOrigin === 'function', 'WORLD_ORIGINS incomplete');
  assert(sb.WORLD_ETYMOLOGY && sb.WORLD_ETYMOLOGY.tea && sb.WORLD_ETYMOLOGY.coffee, 'WORLD_ETYMOLOGY must include tea & coffee');
  assert(sb.WORLD_SCRIPTS_INFO && typeof sb.WORLD_SCRIPTS_INFO.resolveScriptInfo === 'function', 'WORLD_SCRIPTS_INFO incomplete');
  assert(sb.WORLD_HISTORICAL_ERAS && Array.isArray(sb.WORLD_HISTORICAL_ERAS.ERAS) && sb.WORLD_HISTORICAL_ERAS.ERAS.length === 5, 'WORLD_HISTORICAL_ERAS must contain 5 eras');
  assert(Array.isArray(sb.WORLD_HISTORICAL_ERAS.ENDANGERED_HOTSPOTS) && sb.WORLD_HISTORICAL_ERAS.ENDANGERED_HOTSPOTS.length === 35, 'Expected 35 endangered language hotspots');
});

test('Core modules (config, utils, geo-index, label-formatter, legend, quiz, compare, passport, trip, router) pass logic checks', () => {
  const sb = createSandboxWindow();
  const noop = () => {};
  for (const rel of [
    'data/world_countries.js',
    'data/languages.js',
    'data/origins.js',
    'data/etymology.js',
    'data/scripts_info.js',
    'data/historical_eras.js',
    'src/core/config.js',
    'src/core/utils.js',
    'src/core/state.js',
    'src/overlays/label-formatter.js',
    'src/data/geo-index.js',
    'src/core/router.js',
    'src/ui/passport.js',
    'src/ui/trip.js',
    'src/ui/compare.js',
    'src/ui/quiz.js',
    'src/ui/legend.js',
    'src/ui/timeline.js',
    'src/ui/search.js',
    'src/ui/list-modal.js',
    'src/ui/controls.js'
  ]) {
    loadIntoSandbox(sb, rel);
  }

  const E = sb.Earthlingo;
  E.polygons = { refreshPolygonVisuals: noop };
  E.overlays = {
    markOverlaysDirty: noop,
    refreshOverlayHudRects: noop,
    setMapOverlayMode: (m) => { E.state.mapOverlayMode = m; },
    getSyncedColorModeForOverlay: (m) => (m === 'families' ? 'family' : (m === 'scripts' ? 'script' : 'language'))
  };
  E.arcs = { updateArcs: noop };
  E.tooltip = { hideTooltip: noop };
  E.drawer = { syncDrawerSpotlightCards: noop, closeCountryDrawer: noop };

  E.state.geoData = sb.WORLD_GEOJSON;
  E.state.languagesDb = sb.WORLD_LANGUAGES;
  E.geo.buildSpatialIndex();

  assert.strictEqual(E.state.countriesList.length, 242, 'Spatial index must collect 242 countries');
  assert(E.state.spokenIndex.has('Kurdish') && E.state.spokenIndex.get('Kurdish').countries.size >= 3, 'Spoken index must link Kurdish across countries');
  assert(E.state.spokenIndex.has('Quechua') && E.state.spokenIndex.get('Quechua').countries.size >= 3, 'Spoken index must link Quechua across countries');

  // Verify resolveCountryScriptMeta produces zero placeholder scripts across all 242 countries
  for (const c of E.state.countriesList) {
    const meta = E.labelFormatter.resolveCountryScriptMeta(c);
    assert(meta && meta.shortName && !/official national script/i.test(meta.fullDetail), `Placeholder script leaked for ${c.iso3}`);
  }

  // Verify Quiz Script Detective label resolver returns clean non-empty strings & never throws in Script Inspector
  for (const c of E.state.countriesList) {
    const label = E.quiz.resolveTargetScriptLabel(c);
    assert(typeof label === 'string' && label.length > 0 && !label.includes('[object Object]'), `Invalid quiz script label for ${c.iso3}: ${label}`);
    const info = sb.WORLD_SCRIPTS_INFO.resolveScriptInfo(label, c);
    assert(info && typeof info.name === 'string' && info.name.length > 0 && Array.isArray(info.tokens), `WORLD_SCRIPTS_INFO failed for ${c.iso3} label="${label}"`);
  }

  // Verify antimeridian polygon ring wrapping yields ~4 sq deg (not ~716 sq deg)
  const originalGeo = E.state.geoData;
  const originalDb = E.state.languagesDb;
  E.state.languagesDb = { FJI: { name: 'Fiji', iso3: 'FJI' } };
  E.state.geoData = {
    features: [
      {
        type: 'Feature',
        properties: { iso_a3: 'FJI', name: 'Fiji' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[179, 0], [-179, 0], [-179, 2], [179, 2], [179, 0]]]
        }
      }
    ]
  };
  const weights = E.geo.computeCountryAreaWeights();
  const fjiArea = weights.get('FJI');
  assert(Number.isFinite(fjiArea) && fjiArea > 1 && fjiArea < 20, `Expected wrapped antimeridian area ~4, got ${fjiArea}`);
  E.state.geoData = originalGeo;
  E.state.languagesDb = originalDb;

  // Verify WORLD_ORIGINS.resolveLanguageOrigin & immutable E.utils.shuffleArray
  assert.strictEqual(typeof sb.WORLD_ORIGINS.resolveLanguageOrigin, 'function', 'WORLD_ORIGINS.resolveLanguageOrigin must exist');
  const espOrigin = sb.WORLD_ORIGINS.resolveLanguageOrigin('Spanish');
  assert(
    espOrigin &&
    Array.isArray(espOrigin.chain) &&
    espOrigin.chain.length >= 2 &&
    /spanish/i.test(String(espOrigin.title || '')) &&
    /iberian/i.test(String(espOrigin.homeland || '')),
    'Spanish origin seed must resolve cleanly'
  );
  const origArr = [1, 2, 3, 4, 5];
  const shuffled = E.utils.shuffleArray(origArr);
  assert.deepStrictEqual(origArr, [1, 2, 3, 4, 5], 'shuffleArray must not mutate the input array');
  assert.deepStrictEqual([...shuffled].sort((a, b) => a - b), origArr, 'shuffleArray must return an exact permutation');

  // Verify compare logic
  const cmp = E.compare.computeLanguageComparison(E.state.languagesDb.ESP, E.state.languagesDb.MEX);
  assert(cmp.samePrimary && cmp.shared.some(s => s.token === 'Spanish'), 'ESP vs MEX should share Spanish');

  // Verify Passport export/import validation
  E.passport.resetPassportData();
  E.passport.recordCountryExplore(E.state.languagesDb.JPN);
  E.passport.recordCountryExplore(E.state.languagesDb.MAR);
  E.passport.recordQuizOutcome(true, 1);
  const exportedPassport = E.passport.exportPassportData();
  assert.strictEqual(exportedPassport.kind, 'linguistic-passport');
  assert.strictEqual(exportedPassport.data.visitedIsos.length, 2);

  E.passport.resetPassportData();
  assert.strictEqual(E.passport.loadData().visitedIsos.length, 0);

  const reimportPass = E.passport.importPassportData(JSON.stringify(exportedPassport));
  assert(reimportPass.ok, 'Valid passport JSON import must succeed');
  assert.strictEqual(E.passport.loadData().visitedIsos.length, 2);
  assert.strictEqual(E.passport.importPassportData('{bad json').ok, false, 'Malformed JSON must fail cleanly');
  assert.strictEqual(E.passport.importPassportData({ kind: 'trip-itinerary', bookmarks: ['ESP'] }).ok, false, 'Trip export must be rejected by passport importer');

  // Verify Trip export/import validation
  E.trip.clearBookmarks();
  E.trip.addBookmark('ESP');
  E.trip.addBookmark('MAR');
  E.trip.addBookmark('ITA');
  const exportedTrip = E.trip.exportTripData();
  assert.deepStrictEqual(Array.from(exportedTrip.bookmarks), ['ESP', 'MAR', 'ITA']);

  E.trip.clearBookmarks();
  assert.strictEqual(E.state.tripBookmarks.length, 0);

  const reimportTrip = E.trip.importTripData(JSON.stringify(exportedTrip));
  assert(reimportTrip.ok && reimportTrip.count === 3, 'Valid trip JSON import must restore 3 stops');
  assert.strictEqual(E.trip.importTripData(JSON.stringify(exportedPassport)).ok, false, 'Passport export must be rejected by trip importer');
  assert.strictEqual(E.trip.importTripData(['INVALID_XYZ']).ok, false, 'Invalid ISOs must be rejected by trip importer');

  // Verify Diversity Color-By legend rendering & hash filter exclusivity
  E.controls.setColorByMode('diversity');
  E.controls.renderLegendChips();
  const chipsHtml = String(E.elements.legendChips && E.elements.legendChips.innerHTML || '');
  assert(chipsHtml.includes('Hyper-Diverse'), 'Diversity legend must render Hyper-Diverse chip');
  assert(!chipsHtml.includes('undefined'), 'Diversity legend must not contain "undefined" tooltip or label');

  E.router.applyHashState('#div=Hyper-Diverse');
  assert.strictEqual(E.state.activeFilterDiversityTier, 'Hyper-Diverse');
  E.router.applyHashState('#fam=Austronesian');
  assert.strictEqual(E.state.activeFilterFamily, 'Austronesian', 'Hash switch to #fam= must set activeFilterFamily');
  assert.strictEqual(E.state.activeFilterDiversityTier, null, 'Hash switch to #fam= must clear previous activeFilterDiversityTier');
  E.controls.clearLanguageFilter({ skipRouter: true });

  // Verify utils & hash builder
  assert.strictEqual(E.utils.escapeHtml('<script>"test"</script>'), '&lt;script&gt;&quot;test&quot;&lt;/script&gt;');
  assert(E.utils.calcAngularDistRad(0, 0, 0, 90) > 1.5, 'Angular distance calculation sanity');
  E.state.selectedCountry = E.state.languagesDb.JPN;
  E.state.colorByMode = 'script';
  const h = E.router.buildHashString();
  assert(h.includes('country=JPN') && h.includes('color=script'), `Unexpected hash output: ${h}`);
});

// 7. Arcs Layer Render-Sync & Layering Invariants
test('Arcs module emits non-black rail/pulse pairs and configures render state before draw', () => {
  const sb = createSandboxWindow();
  const noop = () => {};
  const rafQueue = [];
  sb.requestAnimationFrame = (fn) => {
    rafQueue.push(fn);
    return rafQueue.length;
  };
  sb.cancelAnimationFrame = noop;

  for (const rel of [
    'data/origins.js',
    'data/etymology.js',
    'data/historical_eras.js',
    'src/core/config.js',
    'src/core/utils.js',
    'src/core/state.js',
    'src/globe/arcs.js'
  ]) {
    loadIntoSandbox(sb, rel);
  }

  const E = sb.Earthlingo;
  E.overlays = { refreshOverlayHudRects: noop, markOverlaysDirty: noop };
  E.collectDomElements();

  const mockArcObjects = [];
  let queuedArcData = [];
  let observedOrdersInsideRender = null;
  let resumeCalls = 0;

  const mockScene = {
    traverse(cb) {
      for (let i = 0; i < mockArcObjects.length; i++) cb(mockArcObjects[i]);
    }
  };
  const mockRenderer = {
    render() {
      observedOrdersInsideRender = mockArcObjects.map(o => ({
        role: o.__data._arcRole,
        order: o.children[0].renderOrder,
        transparent: o.children[0].material.transparent
      }));
    }
  };
  E.state.globe = {
    scene: () => mockScene,
    renderer: () => mockRenderer,
    arcsData: (data) => { queuedArcData = data; },
    ringsData: noop,
    resumeAnimation: () => { resumeCalls += 1; }
  };

  E.state.showArcs = true;
  E.state.activeArcTab = 'origins';
  E.state.activeOriginCorridor = 'all';
  E.arcs.updateArcs();

  assert(queuedArcData.length > 0 && queuedArcData.length % 2 === 0, 'updateArcs must emit rail/pulse pairs');
  assert(!queuedArcData.some(d => d._arcRole === 'casing'), 'Arcs must not emit pitch-black casing meshes');
  assert(resumeCalls >= 1, 'updateArcs must ensure globe animation ticker is resumed');

  // Simulate RAF1 firing BEFORE globe.gl digests queuedArcData
  assert.strictEqual(mockArcObjects.length, 0);
  while (rafQueue.length) {
    const fn = rafQueue.shift();
    fn();
    break;
  }

  // Now simulate globe.gl asynchronously materializing meshes with default transparent: true
  for (const d of queuedArcData) {
    mockArcObjects.push({
      __globeObjType: 'arc',
      __data: d,
      children: [{
        renderOrder: 0,
        frustumCulled: true,
        material: { side: 0, transparent: true, depthWrite: false, depthTest: true, needsUpdate: false }
      }]
    });
  }

  // Render hook MUST configure all rails/pulses BEFORE mockRenderer.render observes them!
  mockRenderer.render(mockScene, {});
  assert(
    Array.isArray(observedOrdersInsideRender) &&
    observedOrdersInsideRender.length === queuedArcData.length &&
    observedOrdersInsideRender.every(x => !x.transparent && x.order === (x.role === 'rail' ? 6 : 7)),
    'Render hook must configure rail (order 6) & pulse (order 7) before the very first draw call'
  );

  for (const obj of mockArcObjects) {
    const mesh = obj.children[0];
    const role = obj.__data._arcRole;
    assert.strictEqual(mesh.material.needsUpdate, false, 'Updating render flags must not set needsUpdate=true');
    assert.strictEqual(mesh.material.transparent, false, `${role} must have transparent=false`);
    assert.strictEqual(mesh.material.depthWrite, true, `${role} must have depthWrite=true`);
    assert.strictEqual(mesh.material.side, 0);
    if (role === 'rail') {
      assert.strictEqual(mesh.renderOrder, 6);
    }
    if (role === 'pulse') {
      assert.strictEqual(mesh.renderOrder, 7);
      assert(obj.__data.animateTime > 0, 'Pulse arc must have animateTime > 0');
    }
  }
});

// 8. 2D Flat Map Projection, Camera & Router State Sync
test('2D Flat Map module (projection, PoV sync, hit-test helpers & #view=2d routing) works cleanly', () => {
  const sb = createSandboxWindow();
  const noop = () => {};
  sb.requestAnimationFrame = () => 1;
  sb.cancelAnimationFrame = noop;
  sb.performance = { now: () => 1000 };

  for (const rel of [
    'data/world_countries.js',
    'data/languages.js',
    'data/origins.js',
    'data/etymology.js',
    'data/scripts_info.js',
    'data/historical_eras.js',
    'src/core/config.js',
    'src/core/utils.js',
    'src/core/state.js',
    'src/overlays/label-formatter.js',
    'src/data/geo-index.js',
    'src/map/map2d.js',
    'src/core/router.js',
    'src/ui/legend.js',
    'src/ui/timeline.js',
    'src/ui/search.js',
    'src/ui/list-modal.js',
    'src/ui/controls.js'
  ]) {
    loadIntoSandbox(sb, rel);
  }

  const E = sb.Earthlingo;
  E.polygons = { refreshPolygonVisuals: noop };
  E.overlays = {
    markOverlaysDirty: noop,
    refreshOverlayHudRects: noop,
    setMapOverlayMode: (m) => { E.state.mapOverlayMode = m; },
    getSyncedColorModeForOverlay: (m) => (m === 'families' ? 'family' : (m === 'scripts' ? 'script' : 'language'))
  };
  E.arcs = { updateArcs: noop, syncDrawerOriginButton: noop, flyToCorridorCamera: noop };
  E.tooltip = { hideTooltip: noop, setGlobeCursor: noop };
  E.drawer = { syncDrawerSpotlightCards: noop, closeCountryDrawer: noop, selectCountry: (c) => { E.state.selectedCountry = c; } };

  E.collectDomElements();
  E.state.geoData = sb.WORLD_GEOJSON;
  E.state.languagesDb = sb.WORLD_LANGUAGES;
  E.geo.buildSpatialIndex();

  const rawPovCalls = [];
  let pauseCount = 0;
  let resumeCount = 0;
  E.state.globe = {
    pointOfView: (p) => { if (!p) return { lat: 20, lng: 15, altitude: 2.1 }; rawPovCalls.push(p); },
    pauseAnimation: () => { pauseCount += 1; },
    resumeAnimation: () => { resumeCount += 1; },
    controls: () => ({ autoRotate: false, update: noop })
  };

  E.map2d.initMap2d();

  // Verify Miller Cylindrical lat/lng <-> (u, v) roundtrip accuracy including antimeridian & polar extremes
  const sampleCoords = [
    [0, 0],
    [48.8566, 2.3522],
    [-33.8688, 151.2093],
    [35.6762, 179.4],
    [-82.0, -179.4]
  ];
  for (const [lat, lng] of sampleCoords) {
    const [u, v] = E.map2d.latLngToUV(lat, lng);
    assert(u >= -0.5 && u <= 0.5, `UV u out of range: ${u}`);
    assert(Math.abs(v) <= 0.37, `UV v out of range: ${v}`);
    const back = E.map2d.uvToLatLng(u, v);
    assert(Math.abs(back.lat - lat) < 1e-4, `Latitude roundtrip mismatch for ${lat}: got ${back.lat}`);
    assert(Math.abs(back.lng - lng) < 1e-4, `Longitude roundtrip mismatch for ${lng}: got ${back.lng}`);
  }

  // Verify altitude <-> zoom roundtrip within active 2D zoom bounds & MIN_ZOOM clamp
  for (const alt of [0.7, 1.2, 1.8, 2.5]) {
    const z = E.map2d.zoomToAltitude(E.map2d.altitudeToZoom(alt));
    assert(Math.abs(z - alt) < 0.05, `Altitude/zoom roundtrip drifted for ${alt}: got ${z}`);
  }
  assert.strictEqual(E.map2d.altitudeToZoom(5.0), 0.92, 'High altitude should clamp cleanly at MIN_ZOOM');

  // Verify 2D WebGL vector geometry & planar Earcut triangulation across all 242 countries
  E.renderBatch.merged = true;
  E.map2d.setViewMode('2d');
  assert.strictEqual(E.state.viewMode, '2d');
  assert(pauseCount >= 1, 'Switching to 2D must pause 3D WebGL ticker');
  assert(E.router.buildHashString().includes('view=2d'), 'Hash builder must include view=2d in 2D mode');

  const ms2d = E.map2d.mapState;
  assert.strictEqual(ms2d.slices.length, 242, `Expected 242 2D country slices, got ${ms2d.slices.length}`);
  assert(ms2d.fillBatches.length >= 2, 'Expected chunked Uint16 fill batches');
  let totalTris = 0;
  for (const batch of ms2d.fillBatches) {
    assert(batch.vertCount > 0 && batch.vertCount <= 65535, `Batch vertex count out of Uint16 bounds: ${batch.vertCount}`);
    assert(batch.idxCount > 0 && batch.idxCount % 3 === 0, 'Triangle index count must be positive multiple of 3');
    totalTris += batch.idxCount / 3;
    for (let i = 0; i < batch.positions.length; i++) {
      assert(Number.isFinite(batch.positions[i]), 'Non-finite 2D UV coordinate found');
    }
    for (let i = 0; i < batch.indices.length; i++) {
      assert(batch.indices[i] < batch.vertCount, 'Triangle index out of batch vertex range');
    }
  }
  assert(totalTris > 80000, `Expected >80k triangles across all 242 countries, got ${totalTris}`);
  for (const iso of ['ZAF', 'ITA', 'RUS', 'ATA', 'USA', 'JPN', 'FRA']) {
    const sl = ms2d.sliceByKey.get(iso);
    assert(sl && sl.iCount >= 3 && sl.edgeCount >= 6, `Missing or empty triangulated/bordered slice for ${iso}`);
  }

  E.map2d.setPov({ lat: 36, lng: 138, altitude: 1.5 }, 0);
  const [sx, sy] = E.map2d.projectLatLngToScreen(35.6762, 139.6503, 1440, 900);
  const pickedGeo = E.map2d.screenToLatLng(sx, sy);
  assert(pickedGeo && Math.abs(pickedGeo.lat - 35.6762) < 0.05 && Math.abs(pickedGeo.lng - 139.6503) < 0.05, 'Screen projection roundtrip mismatch for Tokyo');

  // Verify hash deep-linking into #view=2d and back to 3D
  E.router.applyHashState('#view=2d&country=JPN&overlay=scripts', { resetMissing: true, animate: false });
  assert.strictEqual(E.state.viewMode, '2d');
  assert.strictEqual(E.state.selectedCountry && E.state.selectedCountry.iso3, 'JPN');
  assert.strictEqual(E.state.colorByMode, 'script');

  E.router.applyHashState('#country=ESP', { resetMissing: true, animate: false });
  assert.strictEqual(E.state.viewMode, '3d', 'Navigating to hash without view=2d must restore 3D mode');
  assert(resumeCount >= 1, 'Returning to 3D must resume WebGL ticker');
});

console.log(`\n${checksRun} check groups completed.`);
if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

