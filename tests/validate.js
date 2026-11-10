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
    appendChild: noop,
    focus: noop,
    isConnected: true,
    innerHTML: '',
    textContent: ''
  });

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
    location: { protocol: 'https:', hostname: 'artingarmsiri.github.io', pathname: '/Earthlingo/', search: '', hash: '' },
    history: { replaceState: (_s, _t, u) => { sandbox.location.hash = String(u).includes('#') ? String(u).slice(String(u).indexOf('#')) : ''; } },
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k)
    },
    document: {
      activeElement: null,
      createElement: (tag) => createMockEl(String(tag).toUpperCase()),
      createDocumentFragment: () => ({ appendChild: noop }),
      getElementById: () => null,
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

test('Core modules (config, utils, geo-index, label-formatter, compare, passport, trip, router) pass logic checks', () => {
  const sb = createSandboxWindow();
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
    'src/ui/compare.js'
  ]) {
    loadIntoSandbox(sb, rel);
  }

  const E = sb.Earthlingo;
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

  // Verify utils & hash builder
  assert.strictEqual(E.utils.escapeHtml('<script>"test"</script>'), '&lt;script&gt;&quot;test&quot;&lt;/script&gt;');
  assert(E.utils.calcAngularDistRad(0, 0, 0, 90) > 1.5, 'Angular distance calculation sanity');
  E.state.selectedCountry = E.state.languagesDb.JPN;
  E.state.colorByMode = 'script';
  const h = E.router.buildHashString();
  assert(h.includes('country=JPN') && h.includes('color=script'), `Unexpected hash output: ${h}`);
});

console.log(`\n${checksRun} check groups completed.`);
if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

