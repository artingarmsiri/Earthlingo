// app.js - Earthlingo 3D World Language Globe Application

(function () {
  'use strict';

  // Application State
  const state = {
    geoData: null,
    languagesDb: null,
    countriesList: [],
    selectedCountry: null,
    activeFilterLanguage: null,
    activeFilterFamily: null,
    activeFilterColor: null,
    isLegendExpandedMobile: false,
    isRotating: false,
    showAtmosphere: true,
    showArcs: false,
    globe: null,
    hoveredCountry: null,
    hoveredPolygon: null
  };

  // High-FPS Merged Rendering & O(1) Picking State
  const renderBatch = {
    merged: false,
    capMesh: null,
    lineMesh: null,
    highlightMesh: null,
    highlightLine: null,
    microMesh: null,
    microColors: null,
    microEntries: [],
    microByKey: new Map(),
    highlightMicroMesh: null,
    highlightMicroPosArr: null,
    capPositions: null,
    capColors: null,
    capIndices: null,
    linePositions: null,
    lineIndices: null,
    highlightPosArr: null,
    highlightIdxArr: null,
    highlightLPosArr: null,
    highlightLIdxArr: null,
    countrySlices: [],
    sliceByKey: new Map(),
    spatialGrid: null,
    microstates: [],
    viewportW: window.innerWidth,
    viewportH: window.innerHeight
  };

  // DOM Elements
  const elements = {
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText'),
    globeViz: document.getElementById('globeViz'),
    globeHoverTooltip: document.getElementById('globeHoverTooltip'),
    searchInput: document.getElementById('searchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    searchResultsDropdown: document.getElementById('searchResultsDropdown'),
    floatingLegend: document.getElementById('floatingLegend'),
    legendPanel: document.getElementById('legendPanel'),
    legendCloseBtn: document.getElementById('legendCloseBtn'),
    legendMobileLabel: document.getElementById('legendMobileLabel'),
    legendActiveDot: document.getElementById('legendActiveDot'),
    legendChips: document.getElementById('legendChips'),
    legendResetBtn: document.getElementById('legendResetBtn'),
    toggleLegendMobileBtn: document.getElementById('toggleLegendMobileBtn'),
    mobileLegendFilterDot: document.getElementById('mobileLegendFilterDot'),
    toggleRotateBtn: document.getElementById('toggleRotateBtn'),
    zoomInBtn: document.getElementById('zoomInBtn'),
    zoomOutBtn: document.getElementById('zoomOutBtn'),
    resetViewBtn: document.getElementById('resetViewBtn'),
    toggleAtmosphereBtn: document.getElementById('toggleAtmosphereBtn'),
    toggleArcsBtn: document.getElementById('toggleArcsBtn'),
    countryDrawer: document.getElementById('countryDrawer'),
    drawerBody: document.querySelector('.drawer-body'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    drawerFlag: document.getElementById('drawerFlag'),
    drawerCountryName: document.getElementById('drawerCountryName'),
    drawerNativeName: document.getElementById('drawerNativeName'),
    drawerBadges: document.getElementById('drawerBadges'),
    drawerDiversityBadge: document.getElementById('drawerDiversityBadge'),
    drawerSummary: document.getElementById('drawerSummary'),
    languagesCount: document.getElementById('languagesCount'),
    drawerLanguagesList: document.getElementById('drawerLanguagesList'),
    accentsCount: document.getElementById('accentsCount'),
    drawerAccentsList: document.getElementById('drawerAccentsList'),
    drawerPhrasesList: document.getElementById('drawerPhrasesList'),
    drawerFunFact: document.getElementById('drawerFunFact'),
    openListModalBtn: document.getElementById('openListModalBtn'),
    listModal: document.getElementById('listModal'),
    closeListModalBtn: document.getElementById('closeListModalBtn'),
    modalCountriesGrid: document.getElementById('modalCountriesGrid'),
    openInfoModalBtn: document.getElementById('openInfoModalBtn'),
    infoModal: document.getElementById('infoModal'),
    closeInfoModalBtn: document.getElementById('closeInfoModalBtn')
  };

  function srgbToLinear(c) {
    return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
  }

  function hexToLinearRgb(hex) {
    if (!hex || hex[0] !== '#' || hex.length < 7) {
      return [srgbToLinear(2 / 255), srgbToLinear(132 / 255), srgbToLinear(199 / 255)];
    }
    const n = parseInt(hex.slice(1, 7), 16);
    return [
      srgbToLinear(((n >> 16) & 255) / 255),
      srgbToLinear(((n >> 8) & 255) / 255),
      srgbToLinear((n & 255) / 255)
    ];
  }

  function isMobileViewport() {
    return window.innerWidth <= 768 || window.innerHeight <= 500;
  }

  function isBottomSheetLayout() {
    return window.innerWidth <= 768 && window.innerHeight > 520;
  }

  function getTargetPixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    return isMobileViewport() ? Math.min(dpr, 1.5) : Math.min(dpr, 2);
  }

  function getDefaultAltitude() {
    const w = renderBatch.viewportW || window.innerWidth || 1200;
    const h = renderBatch.viewportH || window.innerHeight || 800;
    const aspect = w / Math.max(1, h);
    if (aspect >= 0.9) return 2.5;
    // Scale altitude on portrait viewports so full globe + glow fits cleanly inside width (~90% fill)
    const tanHalfV = 0.46631; // tan(25 deg) for Globe.gl's 50-deg vertical FOV
    const targetTanX = Math.max(0.16, aspect * tanHalfV * 0.9);
    const dOverR = Math.sqrt(1 + 1 / (targetTanX * targetTanX));
    return Math.min(5.2, Math.max(2.5, dOverR - 1));
  }

  function getSelectAltitude() {
    const w = renderBatch.viewportW || window.innerWidth || 1200;
    const h = renderBatch.viewportH || window.innerHeight || 800;
    const aspect = w / Math.max(1, h);
    if (aspect >= 0.9) return 1.75;
    return Math.min(3.4, Math.max(2.2, getDefaultAltitude() * 0.68));
  }

  // Initialize Application
  async function init() {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
      updateLoadingText('Loading geographic and linguistic databases...');
      
      // Check if datasets were pre-loaded via script tags (enables direct local file:// opening without CORS)
      if (window.WORLD_GEOJSON && window.WORLD_LANGUAGES) {
        state.geoData = window.WORLD_GEOJSON;
        state.languagesDb = window.WORLD_LANGUAGES;
      } else {
        // Fallback to fetch when hosted on web servers or GitHub Pages
        const [geoResponse, langResponse] = await Promise.all([
          fetch('./data/world_countries.geojson'),
          fetch('./data/languages.json')
        ]);

        if (!geoResponse.ok || !langResponse.ok) {
          throw new Error('Failed to fetch data files. Please ensure you are running through a local web server or GitHub Pages.');
        }

        state.geoData = await geoResponse.json();
        state.languagesDb = await langResponse.json();
      }

      updateLoadingText('Initializing 3D WebGL Globe...');
      buildSpatialIndex();
      initGlobe();
      initLegend();
      initSearch();
      initControls();
      initListModal();
      initAccessibilityShortcuts();

    } catch (err) {
      console.error('Initialization error:', err);
      elements.loadingText.innerHTML = `
        <div style="color: #f43f5e; font-weight: bold; margin-bottom: 8px;">Error loading data</div>
        <div style="font-size: 0.82rem; color: #94a3b8; max-width: 400px; text-align: center;">
          ${err.message || 'Make sure the app is opened via a web server (e.g. python -m http.server, VS Code Live Server, or GitHub Pages) so local JSON files can load without CORS restrictions.'}
        </div>
      `;
    }
  }

  function updateLoadingText(text) {
    if (elements.loadingText) elements.loadingText.textContent = text;
  }

  function dismissLoadingOverlay() {
    if (!elements.loadingOverlay) return;
    elements.loadingOverlay.classList.add('fade-out');
    setTimeout(() => {
      elements.loadingOverlay.style.display = 'none';
    }, 320);
  }

  // Lookup country from database by ISO3 or name
  function getCountryData(properties) {
    if (!properties || !state.languagesDb) return null;
    const iso3 = properties.iso_a3;
    const name = properties.name;
    return state.languagesDb[iso3] || state.languagesDb[name] || null;
  }

  function getFeatureKey(feature) {
    if (!feature) return '';
    const c = feature.__country;
    if (c) return c.iso3 || c.name;
    const p = feature.properties || {};
    return p.iso_a3 || p.name || '';
  }

  function getCountryKey(country) {
    if (!country) return '';
    return country.iso3 || country.name || '';
  }

  // Sub-pixel / small sovereign nations list for sleek surface locator pins & proximity picking
  function getMicrostates() {
    const microIso = [
      'VAT', 'MCO', 'SMR', 'LIE', 'AND', 'MLT',
      'BHR', 'SGP', 'MDV', 'SYC', 'STP',
      'BRB', 'ATG', 'KNA', 'DMA', 'LCA', 'VCT', 'GRD',
      'NRU', 'TUV', 'PLW', 'TON', 'MHL', 'FSM', 'KIR'
    ];
    const list = [];
    for (const iso of microIso) {
      const c = state.languagesDb[iso];
      if (c && c.centroid && (c.centroid[0] !== 0 || c.centroid[1] !== 0)) {
        list.push({
          iso3: c.iso3,
          key: getCountryKey(c),
          name: c.name,
          flag: c.flag,
          lat: c.centroid[1],
          lng: c.centroid[0],
          lang: c.canonicalLanguage || c.primaryLanguage || '',
          family: c.languageFamily || '',
          rgb: hexToLinearRgb(c.color),
          country: c
        });
      }
    }
    return list;
  }

  // Pre-process features for ultra-fast rendering & O(1) picking
  function prepareFeatureMetadata() {
    for (const f of state.geoData.features) {
      const country = getCountryData(f.properties);
      f.__country = country;
      f.__color = country ? country.color : '#0284c7';
      f.__lang = country ? (country.canonicalLanguage || country.primaryLanguage) : 'English';
      f.__family = country ? country.languageFamily : 'Indo-European';
      f.__key = getFeatureKey(f);
    }
  }

  // Build 10-degree spatial hash grid for ~0.015ms Country Picking
  function buildSpatialIndex() {
    prepareFeatureMetadata();
    const GRID_W = 36;
    const GRID_H = 18;
    const grid = Array.from({ length: GRID_W * GRID_H }, () => []);

    for (const f of state.geoData.features) {
      const geom = f.geometry;
      if (!geom) continue;
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      for (const poly of polys) {
        if (!poly || !poly[0] || poly[0].length < 3) continue;
        const outer = poly[0];
        let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
        for (let i = 0; i < outer.length; i++) {
          const lng = outer[i][0];
          const lat = outer[i][1];
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
        const entry = {
          feature: f,
          outer,
          holes: poly.length > 1 ? poly.slice(1) : null,
          minLng, maxLng, minLat, maxLat
        };
        const gx0 = Math.max(0, Math.min(GRID_W - 1, Math.floor((minLng + 180) / 10)));
        const gx1 = Math.max(0, Math.min(GRID_W - 1, Math.floor((maxLng + 180) / 10)));
        const gy0 = Math.max(0, Math.min(GRID_H - 1, Math.floor((minLat + 90) / 10)));
        const gy1 = Math.max(0, Math.min(GRID_H - 1, Math.floor((maxLat + 90) / 10)));
        for (let gy = gy0; gy <= gy1; gy++) {
          const row = gy * GRID_W;
          for (let gx = gx0; gx <= gx1; gx++) {
            grid[row + gx].push(entry);
          }
        }
      }
    }
    renderBatch.spatialGrid = grid;
  }

  function pointInRing(px, py, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / ((yj - yi) || 1e-12) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  function lookupFeatureAtLatLng(lat, lng) {
    const grid = renderBatch.spatialGrid;
    if (!grid) return null;
    const gx = Math.max(0, Math.min(35, Math.floor((lng + 180) / 10)));
    const gy = Math.max(0, Math.min(17, Math.floor((lat + 90) / 10)));
    const candidates = grid[gy * 36 + gx];
    for (let i = 0; i < candidates.length; i++) {
      const poly = candidates[i];
      if (lng < poly.minLng || lng > poly.maxLng || lat < poly.minLat || lat > poly.maxLat) continue;
      if (!pointInRing(lng, lat, poly.outer)) continue;
      if (poly.holes) {
        let inHole = false;
        for (let h = 0; h < poly.holes.length; h++) {
          if (pointInRing(lng, lat, poly.holes[h])) {
            inHole = true;
            break;
          }
        }
        if (inHole) continue;
      }
      return poly.feature;
    }
    return null;
  }

  let pickRayVec = null;
  function pickTargetAtScreen(clientX, clientY, isTouch = false) {
    if (!state.globe || !elements.globeViz) return null;
    const camera = state.globe.camera();
    if (!camera) return null;
    if (!pickRayVec) pickRayVec = camera.position.clone();

    const rect = elements.globeViz.getBoundingClientRect();
    const w = rect.width || renderBatch.viewportW || 1;
    const h = rect.height || renderBatch.viewportH || 1;
    const ndcX = ((clientX - rect.left) / w) * 2 - 1;
    const ndcY = -((clientY - rect.top) / h) * 2 + 1;
    camera.updateMatrixWorld();
    pickRayVec.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();

    const ox = camera.position.x, oy = camera.position.y, oz = camera.position.z;
    const dx = pickRayVec.x, dy = pickRayVec.y, dz = pickRayVec.z;
    const b = ox * dx + oy * dy + oz * dz;
    const R = 100.25;
    const c = ox * ox + oy * oy + oz * oz - R * R;
    const disc = b * b - c;
    if (disc < 0) return null;
    const t = -b - Math.sqrt(disc);
    if (t < 0) return null;

    const hx = ox + dx * t;
    const hy = oy + dy * t;
    const hz = oz + dz * t;
    const { lat, lng } = state.globe.toGeoCoords({ x: hx, y: hy, z: hz });

    // Check microstate locator pins first (zoom-adaptive & touch-friendly precision)
    const povAlt = state.globe.pointOfView().altitude || 2.5;
    const touchBoost = isTouch ? 1.35 : 1.0;
    const pinThreshDeg = Math.max(0.42, Math.min(2.2, 0.85 * Math.sqrt(povAlt) * 0.68 * touchBoost));
    const cosLat = Math.max(0.15, Math.cos(lat * Math.PI / 180));
    let bestPin = null;
    let bestDistSq = pinThreshDeg * pinThreshDeg;
    const microstates = renderBatch.microstates;
    for (let i = 0; i < microstates.length; i++) {
      const m = microstates[i];
      const dLat = lat - m.lat;
      const dLng = (lng - m.lng) * cosLat;
      const dSq = dLat * dLat + dLng * dLng;
      if (dSq <= bestDistSq) {
        bestDistSq = dSq;
        bestPin = m;
      }
    }
    if (bestPin) return bestPin.country;

    const feat = lookupFeatureAtLatLng(lat, lng);
    return feat ? (feat.__country || getCountryData(feat.properties) || { name: feat.properties.name }) : null;
  }

  function showTooltipForCountry(country, clientX, clientY) {
    const el = elements.globeHoverTooltip;
    if (!el || !country) return;
    if (state.hoveredCountry !== country) {
      state.hoveredCountry = country;
      if (country.languages) {
        const langColor = country.color || '#38bdf8';
        const langSummary = country.languages.length > 1
          ? country.languages.slice(0, 3).map(l => `${escapeHtml(l.name)}${l.percentage ? ` (${escapeHtml(l.percentage)})` : ''}`).join(', ')
          : escapeHtml(country.canonicalLanguage || country.primaryLanguage || '');
        const multiCount = country.languages.length;
        const accentCount = country.accents ? country.accents.length : 0;
        el.innerHTML = `
          <div class="custom-globe-tooltip">
            <div class="tooltip-title"><span>${country.flag || '🌐'}</span> <span>${escapeHtml(country.name)}</span></div>
            <div class="tooltip-lang">Languages: <b style="color: ${langColor};">${langSummary}</b></div>
            <div class="tooltip-hint">${multiCount} language${multiCount === 1 ? '' : 's'} • ${accentCount} accent${accentCount === 1 ? '' : 's'} • Click for details</div>
          </div>
        `;
      } else {
        el.innerHTML = `<div class="custom-globe-tooltip"><b>${escapeHtml(country.name)}</b></div>`;
      }
      el.style.display = 'block';
    }
    const flipY = clientY < 130 ? '18px' : '-118%';
    const clampedX = Math.max(135, Math.min(renderBatch.viewportW - 135, clientX));
    el.style.transform = `translate3d(${clampedX}px, ${clientY}px, 0) translate(-50%, ${flipY})`;
  }

  function hideTooltip() {
    if (state.hoveredCountry) {
      state.hoveredCountry = null;
      if (elements.globeHoverTooltip) elements.globeHoverTooltip.style.display = 'none';
      elements.globeViz.style.cursor = 'default';
    }
  }

  // Merge all 1,620 country polygons & lines into 2 WebGL draw calls + 1 reusable highlight overlay
  function waitForPolygonsAndMerge() {
    const scene = state.globe ? state.globe.scene() : null;
    if (!scene) {
      requestAnimationFrame(waitForPolygonsAndMerge);
      return;
    }

    const polygonGroups = [];
    scene.traverse(obj => {
      if (obj.__globeObjType === 'polygon' && obj.children && obj.children.length >= 2) {
        const mesh = obj.children[0];
        if (mesh && mesh.geometry && mesh.geometry.attributes && mesh.geometry.attributes.position) {
          polygonGroups.push(obj);
        }
      }
    });

    if (polygonGroups.length < state.geoData.features.length) {
      requestAnimationFrame(waitForPolygonsAndMerge);
      return;
    }

    mergeWorldPolygons(polygonGroups, scene);
    dismissLoadingOverlay();
  }

  function mergeWorldPolygons(polygonGroups, scene) {
    const sampleGrp = polygonGroups[0];
    const sampleMesh = sampleGrp.children[0];
    const sampleLine = sampleGrp.children[1];
    const MeshCtor = sampleMesh.constructor;
    const LineCtor = sampleLine.constructor;
    const BufferGeoCtor = Object.getPrototypeOf(Object.getPrototypeOf(sampleMesh.geometry)).constructor;
    const BufferAttrCtor = Object.getPrototypeOf(Object.getPrototypeOf(sampleMesh.geometry.attributes.position)).constructor;
    const sampleCapMat = Array.isArray(sampleMesh.material) ? (sampleMesh.material[0] || sampleMesh.material[1]) : sampleMesh.material;
    const sampleLineMat = sampleLine.material;
    const parentGroup = sampleGrp.parent;

    // Group polygon chunks by canonical country key so each country forms 1 contiguous GPU buffer slice
    const byKey = new Map();
    let totalCapVerts = 0;
    let totalCapIndices = 0;
    let totalLineVerts = 0;
    let totalLineIndices = 0;

    for (let gIdx = 0; gIdx < polygonGroups.length; gIdx++) {
      const grp = polygonGroups[gIdx];
      const f = grp.__data.data;
      const key = f.__key || getFeatureKey(f);
      let list = byKey.get(key);
      if (!list) {
        list = [];
        byKey.set(key, list);
      }
      list.push(grp);

      const mGeo = grp.children[0].geometry;
      totalCapVerts += mGeo.attributes.position.count;
      totalCapIndices += mGeo.index ? mGeo.index.count : mGeo.attributes.position.count;

      const lGeo = grp.children[1] ? grp.children[1].geometry : null;
      if (lGeo && lGeo.attributes.position && lGeo.index && lGeo.index.count > 0) {
        totalLineVerts += lGeo.attributes.position.count;
        totalLineIndices += lGeo.index.count;
      }
    }

    // Verify triangle winding against outward surface normal
    let frontOrBack = 0;
    outerWinding: for (const grp of polygonGroups) {
      const mGeo = grp.children[0].geometry;
      const pos = mGeo.attributes.position.array;
      const idx = mGeo.index ? mGeo.index.array : null;
      const triCount = idx ? idx.length : pos.length / 3;
      for (let t = 0; t + 2 < triCount; t += 3) {
        const i0 = (idx ? idx[t] : t) * 3;
        const i1 = (idx ? idx[t + 1] : t + 1) * 3;
        const i2 = (idx ? idx[t + 2] : t + 2) * 3;
        const ax = pos[i1] - pos[i0], ay = pos[i1 + 1] - pos[i0 + 1], az = pos[i1 + 2] - pos[i0 + 2];
        const bx = pos[i2] - pos[i0], by = pos[i2 + 1] - pos[i0 + 1], bz = pos[i2 + 2] - pos[i0 + 2];
        const cx = ay * bz - az * by;
        const cy = az * bx - ax * bz;
        const cz = ax * by - ay * bx;
        const lenSq = cx * cx + cy * cy + cz * cz;
        if (lenSq > 1e-6) {
          const dot = cx * pos[i0] + cy * pos[i0 + 1] + cz * pos[i0 + 2];
          frontOrBack = dot >= 0 ? 0 : 1;
          break outerWinding;
        }
      }
    }

    const capPositions = new Float32Array(totalCapVerts * 3);
    const capColors = new Float32Array(totalCapVerts * 3);
    const capIndices = new Uint32Array(totalCapIndices);
    const linePositions = new Float32Array(totalLineVerts * 3);
    const lineIndices = new Uint32Array(totalLineIndices);

    const CAP_SCALE = 1.0025;
    const LINE_SCALE = 1.0028;

    let curV = 0, curI = 0, curLV = 0, curLI = 0;
    let maxV = 1, maxI = 1, maxLV = 1, maxLI = 1;

    for (const [key, grpList] of byKey.entries()) {
      const f = grpList[0].__data.data;
      const vStart = curV;
      const iStart = curI;
      const lvStart = curLV;
      const liStart = curLI;

      for (let g = 0; g < grpList.length; g++) {
        const grp = grpList[g];
        const mGeo = grp.children[0].geometry;
        const mPos = mGeo.attributes.position.array;
        const vCount = mGeo.attributes.position.count;
        const vBase = curV * 3;
        for (let k = 0; k < vCount * 3; k++) {
          capPositions[vBase + k] = mPos[k] * CAP_SCALE;
        }
        if (mGeo.index) {
          const mIdx = mGeo.index.array;
          const mIdxCount = mGeo.index.count;
          for (let k = 0; k < mIdxCount; k++) {
            capIndices[curI++] = mIdx[k] + curV;
          }
        } else {
          for (let k = 0; k < vCount; k++) {
            capIndices[curI++] = curV + k;
          }
        }
        curV += vCount;

        const lGeo = grp.children[1] ? grp.children[1].geometry : null;
        if (lGeo && lGeo.attributes.position && lGeo.index && lGeo.index.count > 0) {
          const lPos = lGeo.attributes.position.array;
          const lvCount = lGeo.attributes.position.count;
          const lvBase = curLV * 3;
          for (let k = 0; k < lvCount * 3; k++) {
            linePositions[lvBase + k] = lPos[k] * LINE_SCALE;
          }
          const lIdx = lGeo.index.array;
          const lIdxCount = lGeo.index.count;
          for (let k = 0; k < lIdxCount; k++) {
            lineIndices[curLI++] = lIdx[k] + curLV;
          }
          curLV += lvCount;
        }
      }

      const slice = {
        key,
        feature: f,
        country: f.__country,
        lang: f.__lang,
        family: f.__family,
        rgb: hexToLinearRgb(f.__color),
        vStart,
        vCount: curV - vStart,
        iStart,
        iCount: curI - iStart,
        lvStart,
        lvCount: curLV - lvStart,
        liStart,
        liCount: curLI - liStart
      };
      if (slice.vCount > maxV) maxV = slice.vCount;
      if (slice.iCount > maxI) maxI = slice.iCount;
      if (slice.lvCount > maxLV) maxLV = slice.lvCount;
      if (slice.liCount > maxLI) maxLI = slice.liCount;

      renderBatch.countrySlices.push(slice);
      renderBatch.sliceByKey.set(key, slice);
    }

    // Remove and dispose all 1,620 individual meshes & line objects
    for (let i = 0; i < polygonGroups.length; i++) {
      const grp = polygonGroups[i];
      if (parentGroup) parentGroup.remove(grp);
      if (grp.children[0] && grp.children[0].geometry) grp.children[0].geometry.dispose();
      if (grp.children[1] && grp.children[1].geometry) grp.children[1].geometry.dispose();
    }

    // Single Merged Landmass Mesh (1 WebGL Draw Call for ALL 242 countries!)
    const mergedCapGeo = new BufferGeoCtor();
    mergedCapGeo.setAttribute('position', new BufferAttrCtor(capPositions, 3));
    mergedCapGeo.setAttribute('color', new BufferAttrCtor(capColors, 3));
    mergedCapGeo.setIndex(new BufferAttrCtor(capIndices, 1));
    mergedCapGeo.computeBoundingSphere();

    const mergedCapMat = sampleCapMat.clone();
    mergedCapMat.color.setHex(0xffffff);
    mergedCapMat.vertexColors = true;
    mergedCapMat.side = frontOrBack;
    mergedCapMat.transparent = false;
    mergedCapMat.opacity = 1;
    mergedCapMat.depthWrite = true;

    const mergedCapMesh = new MeshCtor(mergedCapGeo, mergedCapMat);
    mergedCapMesh.raycast = () => {};
    mergedCapMesh.frustumCulled = false;

    // Single Merged Country Borders (1 WebGL Draw Call!)
    const mergedLineGeo = new BufferGeoCtor();
    mergedLineGeo.setAttribute('position', new BufferAttrCtor(linePositions, 3));
    mergedLineGeo.setIndex(new BufferAttrCtor(lineIndices, 1));
    mergedLineGeo.computeBoundingSphere();

    const mergedLineMat = sampleLineMat.clone();
    mergedLineMat.color.setHex(0x000000);
    mergedLineMat.transparent = true;
    mergedLineMat.opacity = 0.22;
    mergedLineMat.depthTest = true;
    mergedLineMat.depthWrite = false;
    mergedLineMat.polygonOffset = true;
    mergedLineMat.polygonOffsetFactor = -1.5;
    mergedLineMat.polygonOffsetUnits = -3.0;

    const mergedLineMesh = new LineCtor(mergedLineGeo, mergedLineMat);
    mergedLineMesh.raycast = () => {};
    mergedLineMesh.renderOrder = 2;
    mergedLineMesh.frustumCulled = false;

    // Reusable Selected Country Raised White Highlight Overlay (0 GPU reallocations!)
    const highlightPosArr = new Float32Array(maxV * 3);
    const highlightIdxArr = new Uint32Array(maxI);
    const highlightGeo = new BufferGeoCtor();
    highlightGeo.setAttribute('position', new BufferAttrCtor(highlightPosArr, 3));
    highlightGeo.setIndex(new BufferAttrCtor(highlightIdxArr, 1));
    highlightGeo.setDrawRange(0, 0);

    const highlightMat = sampleCapMat.clone();
    highlightMat.color.setHex(0xffffff);
    highlightMat.vertexColors = false;
    highlightMat.side = frontOrBack;
    highlightMat.transparent = false;
    highlightMat.opacity = 1;

    const highlightMesh = new MeshCtor(highlightGeo, highlightMat);
    highlightMesh.raycast = () => {};
    highlightMesh.frustumCulled = false;
    highlightMesh.scale.setScalar(1.0022);
    highlightMesh.visible = false;

    const highlightLPosArr = new Float32Array(maxLV * 3);
    const highlightLIdxArr = new Uint32Array(maxLI);
    const highlightLGeo = new BufferGeoCtor();
    highlightLGeo.setAttribute('position', new BufferAttrCtor(highlightLPosArr, 3));
    highlightLGeo.setIndex(new BufferAttrCtor(highlightLIdxArr, 1));
    highlightLGeo.setDrawRange(0, 0);

    const highlightLMat = sampleLineMat.clone();
    highlightLMat.color.setHex(0xffffff);
    highlightLMat.transparent = true;
    highlightLMat.opacity = 0.92;
    highlightLMat.depthWrite = false;
    highlightLMat.polygonOffset = true;
    highlightLMat.polygonOffsetFactor = -2.0;
    highlightLMat.polygonOffsetUnits = -4.0;

    const highlightLine = new LineCtor(highlightLGeo, highlightLMat);
    highlightLine.raycast = () => {};
    highlightLine.frustumCulled = false;
    highlightLine.renderOrder = 3;
    highlightLine.scale.setScalar(1.0025);
    highlightLine.visible = false;

    // Add Native 3D Starfield inside opaque WebGL scene (1 tiny draw call, real parallax)
    const starCount = 260;
    const starPos = new Float32Array(starCount * 18);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const radius = 1500 + Math.random() * 450;
      const sx = radius * Math.sin(phi) * Math.cos(theta);
      const sy = radius * Math.cos(phi);
      const sz = radius * Math.sin(phi) * Math.sin(theta);
      const szHalf = 2.0 + Math.random() * 2.2;
      const o = i * 18;
      starPos[o] = sx - szHalf; starPos[o + 1] = sy; starPos[o + 2] = sz;
      starPos[o + 3] = sx + szHalf; starPos[o + 4] = sy; starPos[o + 5] = sz;
      starPos[o + 6] = sx; starPos[o + 7] = sy - szHalf; starPos[o + 8] = sz;
      starPos[o + 9] = sx; starPos[o + 10] = sy + szHalf; starPos[o + 11] = sz;
      starPos[o + 12] = sx; starPos[o + 13] = sy; starPos[o + 14] = sz - szHalf;
      starPos[o + 15] = sx; starPos[o + 16] = sy; starPos[o + 17] = sz + szHalf;
    }
    const starGeo = new BufferGeoCtor();
    starGeo.setAttribute('position', new BufferAttrCtor(starPos, 3));
    starGeo.computeBoundingSphere();
    const starMat = sampleLineMat.clone();
    starMat.color.setHex(0x94a3b8);
    starMat.transparent = true;
    starMat.opacity = 0.65;
    starMat.depthWrite = false;
    const starMesh = new LineCtor(starGeo, starMat);
    starMesh.raycast = () => {};
    starMesh.frustumCulled = false;
    scene.add(starMesh);

    // Single-Draw-Call Flush Surface Locator Badges for Small Nations (replaces 3D cylinders)
    const microstates = renderBatch.microstates || [];
    const M_SEGS = 20;
    const vertsPerPin = 1 + M_SEGS * 5;
    const trisPerPin = M_SEGS * 5;
    const microPos = new Float32Array(Math.max(1, microstates.length * vertsPerPin) * 3);
    const microCols = new Float32Array(Math.max(1, microstates.length * vertsPerPin) * 3);
    const microIdx = new Uint32Array(Math.max(1, microstates.length * trisPerPin * 3));
    const microEntries = [];
    renderBatch.microByKey.clear();

    const r1 = 0.30, r2 = 0.39, r3 = 0.49;
    let mV = 0, mI = 0;

    for (let i = 0; i < microstates.length; i++) {
      const m = microstates[i];
      const posObj = state.globe.getCoords(m.lat, m.lng, 0.0036);
      const px = posObj.x, py = posObj.y, pz = posObj.z;
      const pLen = Math.hypot(px, py, pz) || 100.36;
      const nx = px / pLen, ny = py / pLen, nz = pz / pLen;

      // Right-handed tangent basis (t, b, n) flush on sphere surface
      let tx = nz, ty = 0, tz = -nx;
      const tLen = Math.hypot(tx, tz) || 1;
      tx /= tLen; tz /= tLen;
      const bx = ny * tz - nz * ty;
      const by = nz * tx - nx * tz;
      const bz = nx * ty - ny * tx;

      const vStart = mV;
      // 0: Center vertex of inner disc
      microPos[mV * 3] = px; microPos[mV * 3 + 1] = py; microPos[mV * 3 + 2] = pz;
      mV++;

      // Ring 0..M_SEGS-1: Inner disc outer edge (r1), Collar inner (r1), Collar outer (r2), Rim inner (r2), Rim outer (r3)
      const baseCenter = vStart;
      const baseDiscRim = vStart + 1;
      const baseCollarIn = vStart + 1 + M_SEGS;
      const baseCollarOut = vStart + 1 + M_SEGS * 2;
      const baseRimIn = vStart + 1 + M_SEGS * 3;
      const baseRimOut = vStart + 1 + M_SEGS * 4;

      const writeVert = (idx, rad, cs, sn) => {
        const dx = (tx * cs + bx * sn) * rad;
        const dy = (ty * cs + by * sn) * rad;
        const dz = (tz * cs + bz * sn) * rad;
        const o = idx * 3;
        microPos[o] = px + dx; microPos[o + 1] = py + dy; microPos[o + 2] = pz + dz;
      };

      for (let s = 0; s < M_SEGS; s++) {
        const th = (s / M_SEGS) * Math.PI * 2;
        const cs = Math.cos(th), sn = Math.sin(th);
        writeVert(baseDiscRim + s, r1, cs, sn);
        writeVert(baseCollarIn + s, r1, cs, sn);
        writeVert(baseCollarOut + s, r2, cs, sn);
        writeVert(baseRimIn + s, r2, cs, sn);
        writeVert(baseRimOut + s, r3, cs, sn);
      }

      for (let s = 0; s < M_SEGS; s++) {
        const sNext = (s + 1) % M_SEGS;
        // Inner disc fan
        microIdx[mI++] = baseCenter;
        microIdx[mI++] = baseDiscRim + s;
        microIdx[mI++] = baseDiscRim + sNext;

        // Contrast dark collar quad
        microIdx[mI++] = baseCollarIn + s;
        microIdx[mI++] = baseCollarOut + s;
        microIdx[mI++] = baseCollarOut + sNext;
        microIdx[mI++] = baseCollarIn + s;
        microIdx[mI++] = baseCollarOut + sNext;
        microIdx[mI++] = baseCollarIn + sNext;

        // Outer subtle luminous rim quad
        microIdx[mI++] = baseRimIn + s;
        microIdx[mI++] = baseRimOut + s;
        microIdx[mI++] = baseRimOut + sNext;
        microIdx[mI++] = baseRimIn + s;
        microIdx[mI++] = baseRimOut + sNext;
        microIdx[mI++] = baseRimIn + sNext;
      }

      mV += M_SEGS * 5;

      const entry = {
        key: m.key,
        lang: m.lang,
        family: m.family,
        rgb: m.rgb,
        rimRgb: [
          m.rgb[0] * 0.55 + 0.45,
          m.rgb[1] * 0.55 + 0.45,
          m.rgb[2] * 0.55 + 0.45
        ],
        px, py, pz,
        nx, ny, nz,
        tx, ty, tz,
        bx, by, bz,
        vStart,
        segs: M_SEGS
      };
      microEntries.push(entry);
      renderBatch.microByKey.set(m.key, entry);
    }

    const microGeo = new BufferGeoCtor();
    microGeo.setAttribute('position', new BufferAttrCtor(microPos, 3));
    microGeo.setAttribute('color', new BufferAttrCtor(microCols, 3));
    microGeo.setIndex(new BufferAttrCtor(microIdx, 1));
    microGeo.computeBoundingSphere();

    const microMat = sampleCapMat.clone();
    microMat.color.setHex(0xffffff);
    microMat.vertexColors = true;
    microMat.side = 0; // FrontSide
    microMat.transparent = false;
    microMat.opacity = 1;
    microMat.depthWrite = true;
    microMat.polygonOffset = true;
    microMat.polygonOffsetFactor = -2.0;
    microMat.polygonOffsetUnits = -4.0;

    const microMesh = new MeshCtor(microGeo, microMat);
    microMesh.raycast = () => {};
    microMesh.frustumCulled = false;
    microMesh.renderOrder = 3;

    // Reusable Bright White Selection Halo Ring for Selected Microstates (e.g., Vatican, Monaco, Singapore)
    const H_SEGS = 28;
    const hMicroPos = new Float32Array(H_SEGS * 2 * 3);
    const hMicroIdx = new Uint32Array(H_SEGS * 6);
    for (let s = 0; s < H_SEGS; s++) {
      const sNext = (s + 1) % H_SEGS;
      const b0 = s * 2, b1 = sNext * 2;
      hMicroIdx[s * 6] = b0;
      hMicroIdx[s * 6 + 1] = b0 + 1;
      hMicroIdx[s * 6 + 2] = b1 + 1;
      hMicroIdx[s * 6 + 3] = b0;
      hMicroIdx[s * 6 + 4] = b1 + 1;
      hMicroIdx[s * 6 + 5] = b1;
    }
    const hMicroGeo = new BufferGeoCtor();
    hMicroGeo.setAttribute('position', new BufferAttrCtor(hMicroPos, 3));
    hMicroGeo.setIndex(new BufferAttrCtor(hMicroIdx, 1));
    const hMicroMat = sampleCapMat.clone();
    hMicroMat.color.setHex(0xffffff);
    hMicroMat.vertexColors = false;
    hMicroMat.side = 0;
    hMicroMat.transparent = false;
    hMicroMat.opacity = 1;
    hMicroMat.polygonOffset = true;
    hMicroMat.polygonOffsetFactor = -3.0;
    hMicroMat.polygonOffsetUnits = -6.0;

    const highlightMicroMesh = new MeshCtor(hMicroGeo, hMicroMat);
    highlightMicroMesh.raycast = () => {};
    highlightMicroMesh.frustumCulled = false;
    highlightMicroMesh.renderOrder = 4;
    highlightMicroMesh.visible = false;

    const targetContainer = parentGroup || scene;
    targetContainer.add(mergedCapMesh);
    targetContainer.add(mergedLineMesh);
    targetContainer.add(highlightMesh);
    targetContainer.add(highlightLine);
    targetContainer.add(microMesh);
    targetContainer.add(highlightMicroMesh);

    renderBatch.capMesh = mergedCapMesh;
    renderBatch.lineMesh = mergedLineMesh;
    renderBatch.highlightMesh = highlightMesh;
    renderBatch.highlightLine = highlightLine;
    renderBatch.microMesh = microMesh;
    renderBatch.microColors = microCols;
    renderBatch.microEntries = microEntries;
    renderBatch.highlightMicroMesh = highlightMicroMesh;
    renderBatch.highlightMicroPosArr = hMicroPos;
    renderBatch.capPositions = capPositions;
    renderBatch.capColors = capColors;
    renderBatch.capIndices = capIndices;
    renderBatch.linePositions = linePositions;
    renderBatch.lineIndices = lineIndices;
    renderBatch.highlightPosArr = highlightPosArr;
    renderBatch.highlightIdxArr = highlightIdxArr;
    renderBatch.highlightLPosArr = highlightLPosArr;
    renderBatch.highlightLIdxArr = highlightLIdxArr;
    renderBatch.merged = true;

    refreshPolygonVisuals();
  }

  // Update vertex colors & raised selected country highlight in < 0.3ms
  function refreshPolygonVisuals() {
    if (!renderBatch.merged) return;

    const dimR = srgbToLinear(17 / 255);
    const dimG = srgbToLinear(26 / 255);
    const dimB = srgbToLinear(46 / 255);
    const collarR = srgbToLinear(9 / 255);
    const collarG = srgbToLinear(13 / 255);
    const collarB = srgbToLinear(22 / 255);
    const dimRimR = srgbToLinear(30 / 255);
    const dimRimG = srgbToLinear(41 / 255);
    const dimRimB = srgbToLinear(59 / 255);

    const activeLang = state.activeFilterLanguage;
    const activeFam = state.activeFilterFamily;
    const colors = renderBatch.capColors;
    const slices = renderBatch.countrySlices;

    for (let i = 0; i < slices.length; i++) {
      const s = slices[i];
      let r, g, b;
      if (activeLang) {
        if (s.lang === activeLang) { r = s.rgb[0]; g = s.rgb[1]; b = s.rgb[2]; }
        else { r = dimR; g = dimG; b = dimB; }
      } else if (activeFam) {
        if (s.family === activeFam) { r = s.rgb[0]; g = s.rgb[1]; b = s.rgb[2]; }
        else { r = dimR; g = dimG; b = dimB; }
      } else {
        r = s.rgb[0]; g = s.rgb[1]; b = s.rgb[2];
      }

      const end = (s.vStart + s.vCount) * 3;
      for (let k = s.vStart * 3; k < end; k += 3) {
        colors[k] = r;
        colors[k + 1] = g;
        colors[k + 2] = b;
      }
    }
    renderBatch.capMesh.geometry.attributes.color.needsUpdate = true;

    // Update batched microstate locator badge colors in < 0.02ms
    if (renderBatch.microMesh && renderBatch.microColors) {
      const mCols = renderBatch.microColors;
      const mList = renderBatch.microEntries;
      for (let i = 0; i < mList.length; i++) {
        const m = mList[i];
        let match = true;
        if (activeLang) match = (m.lang === activeLang);
        else if (activeFam) match = (m.family === activeFam);

        const dot = match ? m.rgb : [dimR, dimG, dimB];
        const col = match ? [collarR, collarG, collarB] : [dimR, dimG, dimB];
        const rim = match ? m.rimRgb : [dimRimR, dimRimG, dimRimB];
        const segs = m.segs;

        const cOff = m.vStart * 3;
        mCols[cOff] = dot[0]; mCols[cOff + 1] = dot[1]; mCols[cOff + 2] = dot[2];

        const dStart = (m.vStart + 1) * 3;
        const dEnd = dStart + segs * 3;
        for (let k = dStart; k < dEnd; k += 3) {
          mCols[k] = dot[0]; mCols[k + 1] = dot[1]; mCols[k + 2] = dot[2];
        }

        const kEnd = dStart + segs * 3 * 3;
        for (let k = dEnd; k < kEnd; k += 3) {
          mCols[k] = col[0]; mCols[k + 1] = col[1]; mCols[k + 2] = col[2];
        }

        const rEnd = dStart + segs * 5 * 3;
        for (let k = kEnd; k < rEnd; k += 3) {
          mCols[k] = rim[0]; mCols[k + 1] = rim[1]; mCols[k + 2] = rim[2];
        }
      }
      renderBatch.microMesh.geometry.attributes.color.needsUpdate = true;
    }

    // Selected country highlight overlay
    const sel = state.selectedCountry;
    const selKey = sel ? getCountryKey(sel) : '';
    const slice = selKey ? renderBatch.sliceByKey.get(selKey) : null;
    if (slice && slice.iCount > 0) {
      const pSrc = renderBatch.capPositions;
      const pDst = renderBatch.highlightPosArr;
      const vBytes = slice.vCount * 3;
      const pOff = slice.vStart * 3;
      for (let k = 0; k < vBytes; k++) pDst[k] = pSrc[pOff + k];

      const iSrc = renderBatch.capIndices;
      const iDst = renderBatch.highlightIdxArr;
      const iOff = slice.iStart;
      const vBase = slice.vStart;
      for (let k = 0; k < slice.iCount; k++) iDst[k] = iSrc[iOff + k] - vBase;

      const hGeo = renderBatch.highlightMesh.geometry;
      hGeo.attributes.position.needsUpdate = true;
      hGeo.index.needsUpdate = true;
      hGeo.setDrawRange(0, slice.iCount);
      renderBatch.highlightMesh.visible = true;

      if (slice.liCount > 0) {
        const lpSrc = renderBatch.linePositions;
        const lpDst = renderBatch.highlightLPosArr;
        const lvBytes = slice.lvCount * 3;
        const lpOff = slice.lvStart * 3;
        for (let k = 0; k < lvBytes; k++) lpDst[k] = lpSrc[lpOff + k];

        const liSrc = renderBatch.lineIndices;
        const liDst = renderBatch.highlightLIdxArr;
        const liOff = slice.liStart;
        const lvBase = slice.lvStart;
        for (let k = 0; k < slice.liCount; k++) liDst[k] = liSrc[liOff + k] - lvBase;

        const hlGeo = renderBatch.highlightLine.geometry;
        hlGeo.attributes.position.needsUpdate = true;
        hlGeo.index.needsUpdate = true;
        hlGeo.setDrawRange(0, slice.liCount);
        renderBatch.highlightLine.visible = true;
      } else {
        renderBatch.highlightLine.visible = false;
      }
    } else {
      renderBatch.highlightMesh.visible = false;
      renderBatch.highlightLine.visible = false;
    }

    // Selected microstate crisp target halo ring (ensures sub-pixel states like Vatican/Monaco highlight clearly)
    const selMicro = selKey ? renderBatch.microByKey.get(selKey) : null;
    if (selMicro && renderBatch.highlightMicroMesh) {
      const dst = renderBatch.highlightMicroPosArr;
      const lift = 1.0020; // Raises slightly above 100.36 to ~100.56
      const bx0 = selMicro.px * lift, by0 = selMicro.py * lift, bz0 = selMicro.pz * lift;
      const H_SEGS = 28;
      const hrIn = 0.56, hrOut = 0.78;
      for (let s = 0; s < H_SEGS; s++) {
        const th = (s / H_SEGS) * Math.PI * 2;
        const cs = Math.cos(th), sn = Math.sin(th);
        const ux = selMicro.tx * cs + selMicro.bx * sn;
        const uy = selMicro.ty * cs + selMicro.by * sn;
        const uz = selMicro.tz * cs + selMicro.bz * sn;
        const oIn = s * 6;
        dst[oIn] = bx0 + ux * hrIn; dst[oIn + 1] = by0 + uy * hrIn; dst[oIn + 2] = bz0 + uz * hrIn;
        dst[oIn + 3] = bx0 + ux * hrOut; dst[oIn + 4] = by0 + uy * hrOut; dst[oIn + 5] = bz0 + uz * hrOut;
      }
      renderBatch.highlightMicroMesh.geometry.attributes.position.needsUpdate = true;
      renderBatch.highlightMicroMesh.visible = true;
    } else if (renderBatch.highlightMicroMesh) {
      renderBatch.highlightMicroMesh.visible = false;
    }
  }

  function syncViewportSize(reframeIfUnselected = false) {
    const rect = elements.globeViz ? elements.globeViz.getBoundingClientRect() : null;
    const w = Math.max(1, Math.round((rect && rect.width) || (elements.globeViz && elements.globeViz.clientWidth) || window.innerWidth));
    const h = Math.max(1, Math.round((rect && rect.height) || (elements.globeViz && elements.globeViz.clientHeight) || window.innerHeight));
    const prevPortrait = (renderBatch.viewportW / Math.max(1, renderBatch.viewportH)) < 0.9;
    renderBatch.viewportW = w;
    renderBatch.viewportH = h;
    if (state.globe) {
      state.globe.width(w).height(h);
      const renderer = state.globe.renderer();
      if (renderer) renderer.setPixelRatio(getTargetPixelRatio());
      const nowPortrait = (w / Math.max(1, h)) < 0.9;
      if (reframeIfUnselected && !state.selectedCountry && (nowPortrait !== prevPortrait)) {
        state.globe.pointOfView({ altitude: getDefaultAltitude() }, 0);
      }
    }
    syncLegendResponsiveUI();
  }

  // Initialize Globe.GL with 2-Draw-Call Merged World Rendering
  function initGlobe() {
    const initRect = elements.globeViz ? elements.globeViz.getBoundingClientRect() : null;
    const initW = Math.max(1, Math.round((initRect && initRect.width) || window.innerWidth));
    const initH = Math.max(1, Math.round((initRect && initRect.height) || window.innerHeight));
    renderBatch.viewportW = initW;
    renderBatch.viewportH = initH;

    state.globe = Globe({
      rendererConfig: {
        antialias: true,
        alpha: false,
        logarithmicDepthBuffer: false,
        powerPreference: 'high-performance'
      }
    })(elements.globeViz)
      .width(initW)
      .height(initH)
      .backgroundColor('#090d16')
      .enablePointerInteraction(false)
      .showAtmosphere(state.showAtmosphere)
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.16)
      .polygonsData(state.geoData.features)
      .polygonGeoJsonGeometry(d => d.geometry)
      .polygonCapCurvatureResolution(5)
      .polygonAltitude(0.0025)
      .polygonSideColor(() => null)
      .polygonsTransitionDuration(0)
      .polygonCapColor(d => d.__color)
      .polygonStrokeColor(() => '#000000');

    // Cache microstates for 1-draw-call surface locator badges & O(1) spatial picking
    renderBatch.microstates = getMicrostates();

    // Shared-language Arcs configuration (zero-cost until toggled)
    state.globe
      .arcColor(d => d.color || '#38bdf8')
      .arcAltitudeAutoScale(0.38)
      .arcStroke(0.55)
      .arcDashLength(1)
      .arcDashGap(0)
      .arcsTransitionDuration(0);

    // Base Ocean Sphere Configuration (Prevents Z-fighting with Early-Z intact)
    try {
      const globeMat = state.globe.globeMaterial();
      if (globeMat) {
        globeMat.color.set('#070b14');
        globeMat.polygonOffset = true;
        globeMat.polygonOffsetFactor = 3.0;
        globeMat.polygonOffsetUnits = 3.0;
      }
    } catch (e) {
      console.warn('Globe material offset:', e);
    }

    // WebGL Camera and Renderer Configuration
    try {
      const renderer = state.globe.renderer();
      if (renderer) {
        renderer.setPixelRatio(getTargetPixelRatio());
        renderer.powerPreference = 'high-performance';
      }
      const camera = state.globe.camera();
      if (camera) {
        camera.near = 10;
        camera.far = 4000;
        camera.updateProjectionMatrix();
      }
    } catch (e) {
      console.warn('Renderer configuration:', e);
    }

    // OrbitControls (Auto-rotation disabled by default)
    const controls = state.globe.controls();
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.6;
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.enablePan = false;
    controls.minDistance = 120;
    controls.maxDistance = 850;

    // Fit full globe cleanly on narrow portrait screens at startup
    const initialAlt = getDefaultAltitude();
    if (initialAlt > 2.55) {
      state.globe.pointOfView({ lat: 20, lng: 0, altitude: initialAlt }, 0);
    }

    controls.addEventListener('start', () => {
      hideTooltip();
      if (state.isRotating) {
        controls.autoRotate = false;
      }
    });

    controls.addEventListener('end', () => {
      if (state.isRotating) {
        controls.autoRotate = true;
      }
    });

    // Zero-lag O(1) Analytic Sphere + Spatial Grid Hover/Click Listener (Multi-Touch Safe)
    const activePointers = new Map();
    let downX = 0, downY = 0;
    let downPointerType = 'mouse';
    let isDragging = false;
    let multiTouchGesture = false;
    let lastHoverTs = 0;

    elements.globeViz.addEventListener('pointerdown', (e) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.size > 1) {
        multiTouchGesture = true;
        isDragging = true;
        hideTooltip();
        return;
      }
      isDragging = false;
      multiTouchGesture = false;
      downX = e.clientX;
      downY = e.clientY;
      downPointerType = e.pointerType || 'mouse';
    }, { passive: true });

    elements.globeViz.addEventListener('pointermove', (e) => {
      if (activePointers.size > 0) {
        if (activePointers.has(e.pointerId) && activePointers.size === 1) {
          const dx = e.clientX - downX;
          const dy = e.clientY - downY;
          const dragThreshSq = downPointerType === 'touch' ? 144 : 16;
          if (dx * dx + dy * dy > dragThreshSq) {
            isDragging = true;
            hideTooltip();
          }
        }
        return;
      }
      if ((e.pointerType || 'mouse') === 'touch') return;
      const now = performance.now();
      if (now - lastHoverTs < 32) return;
      lastHoverTs = now;

      const hit = pickTargetAtScreen(e.clientX, e.clientY, false);
      if (hit) {
        elements.globeViz.style.cursor = 'pointer';
        showTooltipForCountry(hit, e.clientX, e.clientY);
      } else {
        hideTooltip();
      }
    }, { passive: true });

    const handlePointerEnd = (e, isCancel) => {
      const wasTracked = activePointers.delete(e.pointerId);
      if (!isCancel && wasTracked && activePointers.size === 0 && !isDragging && !multiTouchGesture) {
        const isTouch = (e.pointerType || downPointerType) === 'touch';
        if (isMobileViewport() && state.isLegendExpandedMobile) {
          state.isLegendExpandedMobile = false;
          syncLegendResponsiveUI();
        }
        const hit = pickTargetAtScreen(e.clientX, e.clientY, isTouch);
        if (hit && hit.languages) {
          selectCountry(hit);
        } else if (isTouch && isBottomSheetLayout() && state.selectedCountry) {
          elements.closeDrawerBtn.click();
        }
      }
      if (activePointers.size === 0) {
        isDragging = false;
        multiTouchGesture = false;
      }
    };

    elements.globeViz.addEventListener('pointerup', (e) => handlePointerEnd(e, false), { passive: true });
    elements.globeViz.addEventListener('pointercancel', (e) => handlePointerEnd(e, true), { passive: true });

    elements.globeViz.addEventListener('pointerleave', () => {
      if (activePointers.size === 0) {
        isDragging = false;
        multiTouchGesture = false;
      }
      hideTooltip();
    }, { passive: true });

    // Handle Window Resize, iOS VisualViewport & Orientation Changes cleanly
    let resizeRaf = 0;
    const scheduleViewportSync = (reframe = true) => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        syncViewportSize(reframe);
      });
    };
    window.addEventListener('resize', () => scheduleViewportSync(true), { passive: true });
    window.addEventListener('orientationchange', () => {
      scheduleViewportSync(true);
      setTimeout(() => syncViewportSize(true), 160);
      setTimeout(() => syncViewportSize(true), 380);
    }, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => scheduleViewportSync(false), { passive: true });
    }

    // Merge all generated polygon & border geometries after Globe.gl finishes frame-1 build
    requestAnimationFrame(waitForPolygonsAndMerge);
  }

  // Build / Refresh Shared-Language Arcs
  function updateArcs() {
    if (!state.globe) return;
    if (!state.showArcs) {
      state.globe.arcsData([]);
      return;
    }

    const arcs = [];
    if (state.selectedCountry && state.selectedCountry.centroid) {
      const src = state.selectedCountry;
      const srcLng = src.centroid[0];
      const srcLat = src.centroid[1];
      const canon = (src.canonicalLanguage || src.primaryLanguage || '').toLowerCase();
      const seenIso = new Set([src.iso3]);

      for (const c of state.countriesList) {
        if (!c || !c.centroid || seenIso.has(c.iso3)) continue;
        seenIso.add(c.iso3);
        const cCanon = (c.canonicalLanguage || c.primaryLanguage || '').toLowerCase();
        if (canon && cCanon === canon) {
          arcs.push({
            startLat: srcLat,
            startLng: srcLng,
            endLat: c.centroid[1],
            endLng: c.centroid[0],
            color: src.color || '#38bdf8'
          });
          if (arcs.length >= 24) break;
        }
      }
    } else if (state.activeFilterLanguage) {
      const lang = state.activeFilterLanguage.toLowerCase();
      const matching = state.countriesList.filter(
        c => c.centroid && (c.canonicalLanguage || c.primaryLanguage || '').toLowerCase() === lang
      );
      if (matching.length > 1) {
        const preferredHubs = {
          spanish: 'ESP', english: 'GBR', french: 'FRA', portuguese: 'PRT',
          arabic: 'SAU', russian: 'RUS', german: 'DEU', dutch: 'NLD',
          italian: 'ITA', swedish: 'SWE', turkish: 'TUR', mandarin: 'CHN',
          hindi: 'IND', swahili: 'KEN', persian: 'IRN'
        };
        const hubIso = preferredHubs[lang];
        const hub = (hubIso && matching.find(c => c.iso3 === hubIso)) || matching[0];
        let count = 0;
        for (let i = 0; i < matching.length && count < 18; i++) {
          if (matching[i] === hub) continue;
          arcs.push({
            startLat: hub.centroid[1],
            startLng: hub.centroid[0],
            endLat: matching[i].centroid[1],
            endLng: matching[i].centroid[0],
            color: hub.color || '#38bdf8'
          });
          count++;
        }
      }
    } else {
      const hubs = [
        { iso: 'ESP', targets: ['MEX', 'COL', 'ARG', 'PER', 'CHL'] },
        { iso: 'GBR', targets: ['USA', 'CAN', 'AUS', 'NZL', 'IND'] },
        { iso: 'FRA', targets: ['CAN', 'SEN', 'CIV', 'MDG'] },
        { iso: 'PRT', targets: ['BRA', 'AGO', 'MOZ'] },
        { iso: 'SAU', targets: ['EGY', 'MAR', 'DZA', 'IRQ'] }
      ];
      for (const hub of hubs) {
        const src = state.languagesDb[hub.iso];
        if (!src || !src.centroid) continue;
        for (const tIso of hub.targets) {
          const tgt = state.languagesDb[tIso];
          if (tgt && tgt.centroid) {
            arcs.push({
              startLat: src.centroid[1],
              startLng: src.centroid[0],
              endLat: tgt.centroid[1],
              endLng: tgt.centroid[0],
              color: src.color || '#38bdf8'
            });
          }
        }
      }
    }

    state.globe.arcsData(arcs);
  }

  // Color brightness adjuster helper
  function adjustColorBrightness(hex, percent) {
    if (!hex || hex[0] !== '#') return hex;
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // Select Country and Fly Camera
  function selectCountry(country, animateCamera = true) {
    if (!country) return;
    state.selectedCountry = country;
    hideTooltip();
    if (state.isLegendExpandedMobile) {
      state.isLegendExpandedMobile = false;
      syncLegendResponsiveUI();
    }

    // Update merged vertex colors and raised highlight in <0.3ms
    refreshPolygonVisuals();
    if (state.globe && state.showArcs) updateArcs();

    // Animate camera to country's centroid snappily (framed above portrait bottom sheet on mobile)
    if (animateCamera && state.globe && country.centroid) {
      const [lng, lat] = country.centroid;
      if (lat !== 0 || lng !== 0) {
        const controls = state.globe.controls();
        if (controls) controls.autoRotate = false;
        const selectAlt = getSelectAltitude();
        const targetLat = isBottomSheetLayout()
          ? Math.max(-72, Math.min(72, lat - 15))
          : lat;
        state.globe.pointOfView({ lat: targetLat, lng, altitude: selectAlt }, 550);
      }
    }

    // Populate and open drawer
    renderCountryDrawer(country);
  }

  // Populate Country Details in Drawer
  function renderCountryDrawer(c) {
    if (elements.drawerBody) {
      elements.drawerBody.scrollTop = 0;
    }
    elements.drawerFlag.textContent = c.flag || '🌐';
    elements.drawerCountryName.textContent = c.name || c.commonName || 'Unknown Country';
    elements.drawerNativeName.textContent = c.officialName ? `${c.officialName} • ${c.nativeName || ''}` : (c.nativeName || '');
    
    // Quick Meta Badges
    const canonLang = c.canonicalLanguage || c.primaryLanguage || 'Unknown';
    const langColor = c.color || '#0284c7';
    elements.drawerBadges.innerHTML = `
      <span class="meta-badge" style="background: ${langColor}28; border-color: ${langColor}; color: #ffffff; font-weight: 700;">
        <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:${langColor}; box-shadow: 0 0 6px ${langColor}; margin-right:4px;"></span>
        ${escapeHtml(canonLang)}
      </span>
      <span class="meta-badge">${escapeHtml(c.languageFamily || 'Language Family')}</span>
      <span class="meta-badge">📍 ${escapeHtml(c.capital || 'Capital')}</span>
      <span class="meta-badge">👥 ${escapeHtml(c.population || 'Population')}</span>
      <span class="meta-badge">🌍 ${escapeHtml(c.continent || 'Continent')}</span>
    `;

    // Overview & Summary
    elements.drawerDiversityBadge.textContent = c.diversityLevel || 'Multilingual Diversity';
    elements.drawerSummary.textContent = c.summary || 'Rich linguistic landscape with distinct regional and national cultural varieties.';

    // Languages Breakdown (Multiple Languages)
    const languages = c.languages || [];
    elements.languagesCount.textContent = `${languages.length} Language${languages.length === 1 ? '' : 's'}`;
    
    if (languages.length === 0) {
      elements.drawerLanguagesList.innerHTML = `<div class="lang-notes">Information about spoken languages is being updated.</div>`;
    } else {
      elements.drawerLanguagesList.innerHTML = languages.map(lang => {
        const pctNum = parseFloat(lang.percentage) || 20;
        return `
          <div class="language-card">
            <div class="lang-header">
              <div class="lang-name-row">
                <span class="lang-name">${escapeHtml(lang.name)}</span>
                ${lang.nativeName ? `<span class="lang-native">(${escapeHtml(lang.nativeName)})</span>` : ''}
              </div>
              <span class="lang-percentage">${escapeHtml(lang.percentage || '')}</span>
            </div>
            
            <div class="lang-progress-bar">
              <div class="lang-progress-fill" style="width: ${Math.min(100, Math.max(5, pctNum))}%;"></div>
            </div>

            <div class="lang-tags">
              <span class="lang-tag">${escapeHtml(lang.type || 'Language')}</span>
              ${lang.family ? `<span class="lang-tag">${escapeHtml(lang.family)}</span>` : ''}
              ${lang.script ? `<span class="lang-tag">Script: ${escapeHtml(lang.script)}</span>` : ''}
              ${lang.speakers ? `<span class="lang-tag">~${escapeHtml(lang.speakers)} speakers</span>` : ''}
            </div>

            ${lang.notes ? `<div class="lang-notes">${escapeHtml(lang.notes)}</div>` : ''}
          </div>
        `;
      }).join('');
    }

    // Accents & Regional Dialects
    const accents = c.accents || [];
    elements.accentsCount.textContent = `${accents.length} Accent${accents.length === 1 ? '' : 's'}`;

    if (accents.length === 0) {
      elements.drawerAccentsList.innerHTML = `<div class="lang-notes">Regional accents and colloquial varieties exist throughout the provinces.</div>`;
    } else {
      elements.drawerAccentsList.innerHTML = accents.map(acc => `
        <div class="accent-card">
          <div class="accent-title-row">
            <span class="accent-name">${escapeHtml(acc.name)}</span>
            <span class="accent-region">${escapeHtml(acc.region || '')}</span>
          </div>
          <p class="accent-desc">${escapeHtml(acc.description || '')}</p>
          ${acc.sample ? `
            <div class="accent-sample">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>${escapeHtml(acc.sample)}</span>
            </div>
          ` : ''}
        </div>
      `).join('');
    }

    // Phrasebook with Audio TTS
    const phrases = c.phrases || [];
    if (phrases.length === 0) {
      elements.drawerPhrasesList.innerHTML = `<div class="lang-notes">Common phrase audio is being updated.</div>`;
    } else {
      elements.drawerPhrasesList.innerHTML = phrases.map((ph, idx) => `
        <div class="phrase-card">
          <div class="phrase-info">
            <span class="phrase-label">${escapeHtml(ph.type || 'Phrase')}</span>
            <span class="phrase-text">${escapeHtml(ph.text)}</span>
            ${ph.phonetic ? `<span class="phrase-phonetic">/${escapeHtml(ph.phonetic)}/</span>` : ''}
          </div>
          <button class="speak-btn" data-phrase-idx="${idx}" title="Listen to pronunciation" aria-label="Listen to phrase">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
        </div>
      `).join('');

      // Attach Audio Click Handlers
      elements.drawerPhrasesList.querySelectorAll('.speak-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-phrase-idx'), 10);
          const phrase = phrases[idx];
          if (phrase) {
            playSpeechSynthesis(phrase.text, phrase.bcp47 || 'en-US', btn);
          }
        });
      });
    }

    // Fun Fact
    elements.drawerFunFact.textContent = c.funFact || `${c.name} has a captivating linguistic history with rich local spoken traditions!`;

    // Open Drawer
    elements.countryDrawer.classList.add('open');
    elements.countryDrawer.setAttribute('aria-hidden', 'false');
  }

  // HTML escape helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // HTML5 Web Speech Synthesis Engine
  function playSpeechSynthesis(text, bcp47, buttonEl) {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser. Please try Chrome, Edge, Safari, or Firefox.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech

    // Clean text of slashes / parentheticals for speech
    const cleanText = text.split('/')[0].replace(/\([^)]*\)/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = bcp47 || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const matchVoice = voices.find(v => v.lang === bcp47 || v.lang.startsWith(bcp47.split('-')[0]));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
    }

    if (buttonEl) {
      buttonEl.classList.add('speaking');
      utterance.onend = () => buttonEl.classList.remove('speaking');
      utterance.onerror = () => buttonEl.classList.remove('speaking');
    }

    window.speechSynthesis.speak(utterance);
  }

  function syncLegendResponsiveUI() {
    if (!elements.legendPanel) return;
    const mobile = isMobileViewport();
    const isOpen = !mobile || state.isLegendExpandedMobile;

    if (elements.floatingLegend) {
      elements.floatingLegend.classList.toggle('mobile-open', mobile && state.isLegendExpandedMobile);
    }
    if (elements.toggleLegendMobileBtn) {
      elements.toggleLegendMobileBtn.classList.toggle('active', mobile && state.isLegendExpandedMobile);
      elements.toggleLegendMobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      elements.toggleLegendMobileBtn.classList.toggle('has-filter', Boolean(state.activeFilterLanguage));
    }

    const hasActive = Boolean(state.activeFilterLanguage);
    elements.legendPanel.classList.toggle('has-active-filter', hasActive);
    if (elements.legendActiveDot) {
      elements.legendActiveDot.style.background = state.activeFilterColor || '#38bdf8';
    }
    if (elements.mobileLegendFilterDot) {
      elements.mobileLegendFilterDot.style.background = state.activeFilterColor || '#38bdf8';
    }
    if (elements.legendMobileLabel) {
      elements.legendMobileLabel.textContent = hasActive
        ? `Filter: ${state.activeFilterLanguage}`
        : 'Shared Languages';
    }
  }

  // Build Shared Language Filter Chips in Legend
  function initLegend() {
    const sharedLanguages = [
      { name: 'Spanish', color: '#e11d48', count: 22, fam: 'Romance' },
      { name: 'English', color: '#0284c7', count: 91, fam: 'Germanic' },
      { name: 'French', color: '#c026d3', count: 31, fam: 'Romance' },
      { name: 'Arabic', color: '#eab308', count: 20, fam: 'Semitic' },
      { name: 'Portuguese', color: '#f43f5e', count: 9, fam: 'Romance' },
      { name: 'Russian', color: '#4f46e5', count: 5, fam: 'Slavic' },
      { name: 'German', color: '#1d4ed8', count: 3, fam: 'Germanic' },
      { name: 'Dutch', color: '#06b6d4', count: 5, fam: 'Germanic' },
      { name: 'Italian', color: '#e879f9', count: 3, fam: 'Romance' },
      { name: 'Swedish', color: '#38bdf8', count: 3, fam: 'Germanic' },
      { name: 'Turkish', color: '#9333ea', count: 3, fam: 'Turkic' },
      { name: 'Mandarin', color: '#dc2626', count: 2, fam: 'Sino-Tibetan' },
      { name: 'Hindi', color: '#f59e0b', count: 1, fam: 'Indo-Aryan' },
      { name: 'Swahili', color: '#16a34a', count: 4, fam: 'Bantu' },
      { name: 'Persian', color: '#0d9488', count: 2, fam: 'Iranian' },
      { name: 'Japanese', color: '#ec4899', count: 1, fam: 'Japonic' },
      { name: 'Korean', color: '#f472b6', count: 2, fam: 'Koreanic' },
      { name: 'Greek', color: '#2563eb', count: 2, fam: 'Hellenic' },
      { name: 'Vietnamese', color: '#84cc16', count: 1, fam: 'Austroasiatic' },
      { name: 'Thai', color: '#a855f7', count: 1, fam: 'Kra-Dai' }
    ];

    elements.legendChips.innerHTML = sharedLanguages.map(l => `
      <div class="legend-chip" data-lang="${l.name}" data-color="${l.color}" title="${l.name} (${l.count} countries) • Family: ${l.fam}">
        <span class="legend-dot" style="background: ${l.color};"></span>
        <span>${l.name}</span>
        <span style="font-size: 0.68rem; color: #94a3b8; margin-left: 2px;">(${l.count})</span>
      </div>
    `).join('');

    elements.legendChips.querySelectorAll('.legend-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const lang = chip.getAttribute('data-lang');
        const color = chip.getAttribute('data-color');
        if (state.activeFilterLanguage === lang) {
          clearLanguageFilter();
        } else {
          state.activeFilterLanguage = lang;
          state.activeFilterFamily = null;
          state.activeFilterColor = color || '#38bdf8';
          elements.legendChips.querySelectorAll('.legend-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          elements.legendResetBtn.style.display = 'inline-block';
          syncLegendResponsiveUI();
          refreshPolygonVisuals();
          if (state.globe && state.showArcs) updateArcs();
        }
      });
    });

    if (elements.toggleLegendMobileBtn) {
      elements.toggleLegendMobileBtn.addEventListener('click', () => {
        state.isLegendExpandedMobile = !state.isLegendExpandedMobile;
        syncLegendResponsiveUI();
      });
    }

    if (elements.legendCloseBtn) {
      elements.legendCloseBtn.addEventListener('click', () => {
        state.isLegendExpandedMobile = false;
        syncLegendResponsiveUI();
      });
    }

    elements.legendResetBtn.addEventListener('click', clearLanguageFilter);
    syncLegendResponsiveUI();
  }

  function clearLanguageFilter() {
    state.activeFilterLanguage = null;
    state.activeFilterFamily = null;
    state.activeFilterColor = null;
    elements.legendChips.querySelectorAll('.legend-chip').forEach(c => c.classList.remove('active'));
    elements.legendResetBtn.style.display = 'none';
    syncLegendResponsiveUI();
    refreshPolygonVisuals();
    if (state.globe && state.showArcs) updateArcs();
  }

  // Search & Autocomplete
  function initSearch() {
    // Build array of unique country objects for search
    const seen = new Set();
    state.countriesList = [];
    for (const key in state.languagesDb) {
      const c = state.languagesDb[key];
      if (c && c.name && !seen.has(c.name)) {
        seen.add(c.name);
        state.countriesList.push(c);
      }
    }
    state.countriesList.sort((a, b) => a.name.localeCompare(b.name));

    elements.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      elements.searchClearBtn.style.display = query ? 'block' : 'none';

      if (!query) {
        elements.searchResultsDropdown.style.display = 'none';
        return;
      }

      // Filter countries by Name, Native Name, Languages, Accents, or Continent
      const matches = state.countriesList.filter(c => {
        if (c.name.toLowerCase().includes(query)) return true;
        if (c.officialName && c.officialName.toLowerCase().includes(query)) return true;
        if (c.nativeName && c.nativeName.toLowerCase().includes(query)) return true;
        if (c.primaryLanguage && c.primaryLanguage.toLowerCase().includes(query)) return true;
        if (c.languageFamily && c.languageFamily.toLowerCase().includes(query)) return true;
        if (c.continent && c.continent.toLowerCase().includes(query)) return true;
        if (c.languages && c.languages.some(l => l.name.toLowerCase().includes(query))) return true;
        if (c.accents && c.accents.some(a => a.name.toLowerCase().includes(query) || (a.region && a.region.toLowerCase().includes(query)))) return true;
        return false;
      }).slice(0, 15);

      if (matches.length === 0) {
        elements.searchResultsDropdown.innerHTML = `<div style="padding: 12px 14px; font-size: 0.85rem; color: #94a3b8;">No matching countries or languages found.</div>`;
        elements.searchResultsDropdown.style.display = 'block';
        return;
      }

      elements.searchResultsDropdown.innerHTML = matches.map(c => `
        <div class="search-result-item" data-iso="${c.iso3 || c.name}">
          <div class="result-main">
            <span class="result-flag">${c.flag || '🌐'}</span>
            <div class="result-info">
              <span class="result-name">${escapeHtml(c.name)}</span>
              <span class="result-lang">${escapeHtml(c.primaryLanguage || 'Official Language')}</span>
            </div>
          </div>
          <span class="result-tag">${escapeHtml(c.continent || '')}</span>
        </div>
      `).join('');

      elements.searchResultsDropdown.style.display = 'block';

      // Click result
      elements.searchResultsDropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const iso = item.getAttribute('data-iso');
          const found = state.languagesDb[iso];
          if (found) {
            elements.searchInput.value = found.name;
            elements.searchResultsDropdown.style.display = 'none';
            elements.searchInput.blur();
            selectCountry(found);
          }
        });
      });
    });

    elements.searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
        syncViewportSize(false);
      }, 80);
    }, { passive: true });

    elements.searchClearBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      elements.searchClearBtn.style.display = 'none';
      elements.searchResultsDropdown.style.display = 'none';
    });

    // Close search dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        elements.searchResultsDropdown.style.display = 'none';
      }
    });
  }

  // Controls & Toolbar Buttons
  function initControls() {
    // Rotation toggle
    elements.toggleRotateBtn.addEventListener('click', () => {
      state.isRotating = !state.isRotating;
      state.globe.controls().autoRotate = state.isRotating;
      elements.toggleRotateBtn.classList.toggle('active', state.isRotating);
    });

    // Zoom buttons (Snappy 240ms duration)
    elements.zoomInBtn.addEventListener('click', () => {
      const pov = state.globe.pointOfView();
      state.globe.pointOfView({ altitude: Math.max(0.4, pov.altitude - 0.5) }, 240);
    });

    elements.zoomOutBtn.addEventListener('click', () => {
      const pov = state.globe.pointOfView();
      const maxAlt = Math.max(4.8, getDefaultAltitude() + 1.0);
      state.globe.pointOfView({ altitude: Math.min(maxAlt, pov.altitude + 0.5) }, 240);
    });

    // Reset View (Snappy 500ms duration)
    elements.resetViewBtn.addEventListener('click', () => {
      state.globe.pointOfView({ lat: 20, lng: 0, altitude: getDefaultAltitude() }, 500);
    });

    // Toggle Atmosphere
    elements.toggleAtmosphereBtn.addEventListener('click', () => {
      state.showAtmosphere = !state.showAtmosphere;
      state.globe.showAtmosphere(state.showAtmosphere);
      elements.toggleAtmosphereBtn.classList.toggle('active', state.showAtmosphere);
    });

    // Toggle Shared-Language Arcs
    if (elements.toggleArcsBtn) {
      elements.toggleArcsBtn.addEventListener('click', () => {
        state.showArcs = !state.showArcs;
        elements.toggleArcsBtn.classList.toggle('active', state.showArcs);
        updateArcs();
      });
    }

    // Close Drawer
    elements.closeDrawerBtn.addEventListener('click', () => {
      elements.countryDrawer.classList.remove('open');
      elements.countryDrawer.setAttribute('aria-hidden', 'true');
      state.selectedCountry = null;
      refreshPolygonVisuals();
      if (state.globe) {
        if (state.showArcs) updateArcs();
        if (state.isRotating) {
          const controls = state.globe.controls();
          if (controls) controls.autoRotate = true;
        }
      }
    });

    // Info Modal
    elements.openInfoModalBtn.addEventListener('click', () => {
      elements.infoModal.classList.add('open');
      elements.infoModal.setAttribute('aria-hidden', 'false');
    });

    elements.closeInfoModalBtn.addEventListener('click', () => {
      elements.infoModal.classList.remove('open');
      elements.infoModal.setAttribute('aria-hidden', 'true');
    });

    // Close modal on backdrop click
    elements.infoModal.addEventListener('click', (e) => {
      if (e.target === elements.infoModal) {
        elements.infoModal.classList.remove('open');
      }
    });
  }

  // Accessible 2D List View Modal
  function initListModal() {
    elements.openListModalBtn.addEventListener('click', () => {
      renderModalGrid();
      elements.listModal.classList.add('open');
      elements.listModal.setAttribute('aria-hidden', 'false');
    });

    elements.closeListModalBtn.addEventListener('click', () => {
      elements.listModal.classList.remove('open');
      elements.listModal.setAttribute('aria-hidden', 'true');
    });

    elements.listModal.addEventListener('click', (e) => {
      if (e.target === elements.listModal) {
        elements.listModal.classList.remove('open');
      }
    });
  }

  function renderModalGrid() {
    if (elements.modalCountriesGrid.children.length > 0) return; // Already rendered

    elements.modalCountriesGrid.innerHTML = state.countriesList.map(c => `
      <div class="country-grid-card" data-iso="${c.iso3 || c.name}">
        <span style="font-size: 1.6rem;">${c.flag || '🌐'}</span>
        <div style="display: flex; flex-direction: column; overflow: hidden;">
          <strong style="font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.name)}</strong>
          <span style="font-size: 0.78rem; color: #38bdf8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.primaryLanguage || '')}</span>
          <span style="font-size: 0.7rem; color: #64748b;">${escapeHtml(c.continent || '')}</span>
        </div>
      </div>
    `).join('');

    elements.modalCountriesGrid.querySelectorAll('.country-grid-card').forEach(card => {
      card.addEventListener('click', () => {
        const iso = card.getAttribute('data-iso');
        const c = state.languagesDb[iso];
        if (c) {
          elements.listModal.classList.remove('open');
          selectCountry(c);
        }
      });
    });
  }

  // Keyboard Navigation & Shortcuts
  function initAccessibilityShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't intercept when typing in search input
      if (document.activeElement === elements.searchInput) {
        if (e.key === 'Escape') {
          elements.searchInput.blur();
          elements.searchResultsDropdown.style.display = 'none';
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        elements.searchInput.focus();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        elements.toggleRotateBtn.click();
      } else if (e.key === 'r' || e.key === 'R') {
        elements.resetViewBtn.click();
      } else if (e.key === 'Escape') {
        elements.countryDrawer.classList.remove('open');
        elements.infoModal.classList.remove('open');
        elements.listModal.classList.remove('open');
        state.selectedCountry = null;
        hideTooltip();
        refreshPolygonVisuals();
        if (state.globe) {
          if (state.showArcs) updateArcs();
          if (state.isRotating) {
            const controls = state.globe.controls();
            if (controls) controls.autoRotate = true;
          }
        }
      }
    });
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

