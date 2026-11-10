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
    activeOriginCorridor: 'all',
    _prevCorridorBeforeCountry: 'all',
    isArcsPanelCollapsed: false,
    mobileDrawerSnap: 'half',
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
    viewportLeft: 0,
    viewportTop: 0,
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
    arcsInfoPanel: document.getElementById('arcsInfoPanel'),
    arcsLiveDot: document.getElementById('arcsLiveDot'),
    arcsPanelTitle: document.getElementById('arcsPanelTitle'),
    arcsToggleCollapseBtn: document.getElementById('arcsToggleCollapseBtn'),
    arcsCloseBtn: document.getElementById('arcsCloseBtn'),
    arcCorridorChips: document.getElementById('arcCorridorChips'),
    arcsInfoBody: document.getElementById('arcsInfoBody'),
    countryDrawer: document.getElementById('countryDrawer'),
    drawerHeader: document.getElementById('drawerHeader'),
    drawerSnapBtn: document.getElementById('drawerSnapBtn'),
    drawerBody: document.querySelector('.drawer-body'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    drawerFlag: document.getElementById('drawerFlag'),
    drawerCountryName: document.getElementById('drawerCountryName'),
    drawerNativeName: document.getElementById('drawerNativeName'),
    drawerBadges: document.getElementById('drawerBadges'),
    drawerDiversityBadge: document.getElementById('drawerDiversityBadge'),
    drawerSummary: document.getElementById('drawerSummary'),
    drawerOriginSection: document.getElementById('drawerOriginSection'),
    drawerOriginEra: document.getElementById('drawerOriginEra'),
    drawerOriginCard: document.getElementById('drawerOriginCard'),
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

  function hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string') return `rgba(56, 189, 248, ${alpha})`;
    const clean = hex.trim().replace('#', '');
    let r = 56, g = 189, b = 248;
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length >= 6) {
      const n = parseInt(clean.slice(0, 6), 16);
      if (!Number.isNaN(n)) {
        r = (n >> 16) & 255;
        g = (n >> 8) & 255;
        b = n & 255;
      }
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function mixColorHex(hexA, hexB, weightB = 0.25) {
    const parse = (hex) => {
      const clean = (hex || '#38bdf8').trim().replace('#', '');
      if (clean.length === 3) {
        return [
          parseInt(clean[0] + clean[0], 16) || 0,
          parseInt(clean[1] + clean[1], 16) || 0,
          parseInt(clean[2] + clean[2], 16) || 0
        ];
      }
      const n = parseInt(clean.slice(0, 6), 16);
      if (Number.isNaN(n)) return [56, 189, 248];
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const [r1, g1, b1] = parse(hexA);
    const [r2, g2, b2] = parse(hexB);
    const w = Math.max(0, Math.min(1, weightB));
    const r = Math.round(r1 + (r2 - r1) * w);
    const g = Math.round(g1 + (g2 - g1) * w);
    const b = Math.round(b1 + (b2 - b1) * w);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function calcAngularDistRad(lng1, lat1, lng2, lat2) {
    const toRad = Math.PI / 180;
    const phi1 = lat1 * toRad;
    const phi2 = lat2 * toRad;
    const dPhi = (lat2 - lat1) * toRad;
    const dLam = (lng2 - lng1) * toRad;
    const sinHalfPhi = Math.sin(dPhi * 0.5);
    const sinHalfLam = Math.sin(dLam * 0.5);
    const a = sinHalfPhi * sinHalfPhi + Math.cos(phi1) * Math.cos(phi2) * sinHalfLam * sinHalfLam;
    return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  function getSheetViewportHeight() {
    const vv = window.visualViewport;
    return Math.max(320, Math.round((vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 800));
  }

  function measureSheetPeekHeight(vh) {
    const hdr = elements.drawerHeader;
    const hdrH = hdr ? Math.ceil(hdr.getBoundingClientRect().height) : 116;
    return Math.max(96, Math.min(Math.round(vh * 0.29), hdrH + 4));
  }

  function getSheetMetrics() {
    const vh = getSheetViewportHeight();
    const peekH = measureSheetPeekHeight(vh);
    const halfH = Math.min(vh - 76, Math.max(peekH + 92, Math.round(vh * 0.54)));
    return { vh, peekH, halfH, fullH: vh };
  }

  function setMobileDrawerSnap(snap, clearInline = true) {
    const drawer = elements.countryDrawer;
    if (!drawer) return;
    const targetSnap = (snap === 'peek' || snap === 'half' || snap === 'full') ? snap : 'half';
    state.mobileDrawerSnap = targetSnap;

    if (clearInline) {
      drawer.classList.remove('is-dragging');
      drawer.style.height = '';
      drawer.style.transform = '';
      drawer.style.borderRadius = '';
    }

    if (!isBottomSheetLayout()) {
      drawer.classList.remove('snap-peek', 'snap-half', 'snap-full');
      document.body.classList.remove('drawer-peek');
      document.documentElement.style.removeProperty('--drawer-peek-h');
      return;
    }

    drawer.classList.toggle('snap-peek', targetSnap === 'peek');
    drawer.classList.toggle('snap-half', targetSnap === 'half');
    drawer.classList.toggle('snap-full', targetSnap === 'full');

    if (targetSnap === 'peek' && drawer.classList.contains('open')) {
      const vh = getSheetViewportHeight();
      const peekH = measureSheetPeekHeight(vh);
      document.documentElement.style.setProperty('--drawer-peek-h', `${peekH}px`);
      document.body.classList.add('drawer-peek');
    } else {
      document.body.classList.remove('drawer-peek');
    }

    if (elements.drawerSnapBtn) {
      const isFull = targetSnap === 'full';
      elements.drawerSnapBtn.setAttribute(
        'aria-label',
        isFull
          ? 'Minimize country panel'
          : (targetSnap === 'peek' ? 'Restore country panel' : 'Expand country panel to full screen')
      );
      elements.drawerSnapBtn.setAttribute(
        'title',
        isFull ? 'Restore split view' : (targetSnap === 'peek' ? 'Expand details' : 'Full screen')
      );
    }
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

    const w = renderBatch.viewportW || 1;
    const h = renderBatch.viewportH || 1;
    const ndcX = ((clientX - renderBatch.viewportLeft) / w) * 2 - 1;
    const ndcY = -((clientY - renderBatch.viewportTop) / h) * 2 + 1;
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
    const povAlt = Math.max(0.1, (Math.hypot(ox, oy, oz) - 100) / 100);
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

  let tooltipBoxW = 240;
  let tooltipBoxH = 64;
  let tooltipVisible = false;
  let tooltipPlaceBelow = false;
  let lastGlobeCursor = '';

  function setGlobeCursor(nextCursor) {
    if (elements.globeViz && lastGlobeCursor !== nextCursor) {
      lastGlobeCursor = nextCursor;
      elements.globeViz.style.cursor = nextCursor;
    }
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
      if (!tooltipVisible) {
        el.classList.add('visible');
        tooltipVisible = true;
      }
      tooltipBoxW = el.offsetWidth || 240;
      tooltipBoxH = el.offsetHeight || 64;
    } else if (!tooltipVisible) {
      el.classList.add('visible');
      tooltipVisible = true;
    }
    const vw = renderBatch.viewportW || window.innerWidth;
    const vh = renderBatch.viewportH || window.innerHeight;
    const halfW = tooltipBoxW * 0.5;
    const tx = Math.max(12, Math.min(vw - tooltipBoxW - 12, clientX - halfW));
    // Hysteresis around top edge prevents sudden vertical flip flicker
    const aboveTop = clientY - tooltipBoxH - 14;
    if (!tooltipPlaceBelow && aboveTop < 12) tooltipPlaceBelow = true;
    else if (tooltipPlaceBelow && aboveTop >= 24) tooltipPlaceBelow = false;
    const ty = tooltipPlaceBelow
      ? Math.min(vh - tooltipBoxH - 12, clientY + 20)
      : Math.max(12, aboveTop);
    el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
  }

  function hideTooltip() {
    if (state.hoveredCountry || tooltipVisible) {
      state.hoveredCountry = null;
      tooltipVisible = false;
      tooltipPlaceBelow = false;
      if (elements.globeHoverTooltip) {
        elements.globeHoverTooltip.classList.remove('visible');
      }
    }
    setGlobeCursor('default');
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

    const R_GLOBE = 100;
    const CAP_SCALE = 1.0025;
    const LINE_SCALE = 1.0028;
    const R_CAP = R_GLOBE * CAP_SCALE;
    const R_LINE = R_GLOBE * LINE_SCALE;
    const MAX_SEG_DEG = 2.4; // Keep all chords >= ~100.228 (well above R=100 ocean sphere)
    const MAX_CAP_CHORD_SQ = Math.pow(2 * R_CAP * Math.sin((MAX_SEG_DEG * Math.PI / 180) * 0.5), 2);
    const MAX_LINE_CHORD_SQ = Math.pow(2 * R_LINE * Math.sin((MAX_SEG_DEG * Math.PI / 180) * 0.5), 2);

    // Group polygon chunks by canonical country key so each country forms 1 contiguous GPU buffer slice
    const byKey = new Map();
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
    }

    const capVertChunks = [];
    const capIdxChunks = [];
    const lineVertChunks = [];
    const lineIdxChunks = [];

    let curV = 0, curI = 0, curLV = 0, curLI = 0;
    let maxV = 1, maxI = 1, maxLV = 1, maxLI = 1;

    const projectToRadius = (verts, idx3, radius) => {
      const x = verts[idx3], y = verts[idx3 + 1], z = verts[idx3 + 2];
      const len = Math.hypot(x, y, z);
      if (len > 1e-8) {
        const s = radius / len;
        verts[idx3] = x * s;
        verts[idx3 + 1] = y * s;
        verts[idx3 + 2] = z * s;
      }
    };

    const ensureOutwardTri = (verts, tri) => {
      const i0 = tri[0] * 3, i1 = tri[1] * 3, i2 = tri[2] * 3;
      const x0 = verts[i0], y0 = verts[i0 + 1], z0 = verts[i0 + 2];
      const ax = verts[i1] - x0, ay = verts[i1 + 1] - y0, az = verts[i1 + 2] - z0;
      const bx = verts[i2] - x0, by = verts[i2 + 1] - y0, bz = verts[i2 + 2] - z0;
      const cx = ay * bz - az * by;
      const cy = az * bx - ax * bz;
      const cz = ax * by - ay * bx;
      if (cx * x0 + cy * y0 + cz * z0 < 0) {
        const tmp = tri[1];
        tri[1] = tri[2];
        tri[2] = tmp;
      }
    };

    for (const [key, grpList] of byKey.entries()) {
      const f = grpList[0].__data.data;
      const vStart = curV;
      const iStart = curI;
      const lvStart = curLV;
      const liStart = curLI;

      const sVerts = [];
      let sTris = [];
      const sLineVerts = [];
      const sLineIdx = [];

      for (let g = 0; g < grpList.length; g++) {
        const grp = grpList[g];
        const mGeo = grp.children[0].geometry;
        const mPos = mGeo.attributes.position.array;
        const vCount = mGeo.attributes.position.count;
        const baseV = sVerts.length / 3;
        for (let k = 0; k < vCount; k++) {
          const p = k * 3;
          const vx = mPos[p] * CAP_SCALE;
          const vy = mPos[p + 1] * CAP_SCALE;
          const vz = mPos[p + 2] * CAP_SCALE;
          const len = Math.hypot(vx, vy, vz);
          if (len > 1e-8) {
            const s = R_CAP / len;
            sVerts.push(vx * s, vy * s, vz * s);
          } else {
            sVerts.push(vx, vy, vz);
          }
        }
        if (mGeo.index) {
          const mIdx = mGeo.index.array;
          const mIdxCount = mGeo.index.count;
          for (let k = 0; k + 2 < mIdxCount; k += 3) {
            const tri = [baseV + mIdx[k], baseV + mIdx[k + 1], baseV + mIdx[k + 2]];
            ensureOutwardTri(sVerts, tri);
            sTris.push(tri);
          }
        } else {
          for (let k = 0; k + 2 < vCount; k += 3) {
            const tri = [baseV + k, baseV + k + 1, baseV + k + 2];
            ensureOutwardTri(sVerts, tri);
            sTris.push(tri);
          }
        }

        const lGeo = grp.children[1] ? grp.children[1].geometry : null;
        if (lGeo && lGeo.attributes.position && lGeo.index && lGeo.index.count > 0) {
          const lPos = lGeo.attributes.position.array;
          const lvCount = lGeo.attributes.position.count;
          const baseLV = sLineVerts.length / 3;
          for (let k = 0; k < lvCount; k++) {
            const p = k * 3;
            const lx = lPos[p] * LINE_SCALE;
            const ly = lPos[p + 1] * LINE_SCALE;
            const lz = lPos[p + 2] * LINE_SCALE;
            const len = Math.hypot(lx, ly, lz);
            if (len > 1e-8) {
              const s = R_LINE / len;
              sLineVerts.push(lx * s, ly * s, lz * s);
            } else {
              sLineVerts.push(lx, ly, lz);
            }
          }
          const lIdx = lGeo.index.array;
          const lIdxCount = lGeo.index.count;
          const appendLineSeg = (ia, ib, depth) => {
            const ax = sLineVerts[ia * 3], ay = sLineVerts[ia * 3 + 1], az = sLineVerts[ia * 3 + 2];
            const bx = sLineVerts[ib * 3], by = sLineVerts[ib * 3 + 1], bz = sLineVerts[ib * 3 + 2];
            const dx = bx - ax, dy = by - ay, dz = bz - az;
            if (depth < 4 && (dx * dx + dy * dy + dz * dz) > MAX_LINE_CHORD_SQ) {
              const im = sLineVerts.length / 3;
              sLineVerts.push((ax + bx) * 0.5, (ay + by) * 0.5, (az + bz) * 0.5);
              projectToRadius(sLineVerts, im * 3, R_LINE);
              appendLineSeg(ia, im, depth + 1);
              appendLineSeg(im, ib, depth + 1);
            } else {
              sLineIdx.push(ia, ib);
            }
          };
          for (let k = 0; k + 1 < lIdxCount; k += 2) {
            appendLineSeg(baseLV + lIdx[k], baseLV + lIdx[k + 1], 0);
          }
        }
      }

      // Conforming crack-free spherical edge-midpoint subdivision for large triangles (fixes Greenland/Somalia chord sagitta)
      for (let pass = 0; pass < 4; pass++) {
        let splitCount = 0;
        const splitEdgeMap = new Map();
        const getEdgeKey = (ia, ib) => {
          const ax = Math.round(sVerts[ia * 3] * 1e4);
          const ay = Math.round(sVerts[ia * 3 + 1] * 1e4);
          const az = Math.round(sVerts[ia * 3 + 2] * 1e4);
          const bx = Math.round(sVerts[ib * 3] * 1e4);
          const by = Math.round(sVerts[ib * 3 + 1] * 1e4);
          const bz = Math.round(sVerts[ib * 3 + 2] * 1e4);
          const k0 = `${ax},${ay},${az}`;
          const k1 = `${bx},${by},${bz}`;
          return k0 < k1 ? `${k0}|${k1}` : `${k1}|${k0}`;
        };
        const getOrSplit = (ia, ib) => {
          const dx = sVerts[ia * 3] - sVerts[ib * 3];
          const dy = sVerts[ia * 3 + 1] - sVerts[ib * 3 + 1];
          const dz = sVerts[ia * 3 + 2] - sVerts[ib * 3 + 2];
          if (dx * dx + dy * dy + dz * dz <= MAX_CAP_CHORD_SQ) return -1;
          const ek = getEdgeKey(ia, ib);
          const cached = splitEdgeMap.get(ek);
          if (cached !== undefined) return cached;
          const im = sVerts.length / 3;
          sVerts.push(
            (sVerts[ia * 3] + sVerts[ib * 3]) * 0.5,
            (sVerts[ia * 3 + 1] + sVerts[ib * 3 + 1]) * 0.5,
            (sVerts[ia * 3 + 2] + sVerts[ib * 3 + 2]) * 0.5
          );
          projectToRadius(sVerts, im * 3, R_CAP);
          splitEdgeMap.set(ek, im);
          return im;
        };

        const nextTris = [];
        for (let t = 0; t < sTris.length; t++) {
          const tri = sTris[t];
          const a = tri[0], b = tri[1], c = tri[2];
          const mab = getOrSplit(a, b);
          const mbc = getOrSplit(b, c);
          const mca = getOrSplit(c, a);
          const cnt = (mab >= 0 ? 1 : 0) + (mbc >= 0 ? 1 : 0) + (mca >= 0 ? 1 : 0);
          if (cnt === 0) {
            nextTris.push(tri);
            continue;
          }
          splitCount++;
          if (cnt === 3) {
            const sub = [[a, mab, mca], [mab, b, mbc], [mca, mbc, c], [mab, mbc, mca]];
            for (let k = 0; k < 4; k++) { ensureOutwardTri(sVerts, sub[k]); nextTris.push(sub[k]); }
          } else if (cnt === 1) {
            const sub = mab >= 0
              ? [[a, mab, c], [mab, b, c]]
              : (mbc >= 0 ? [[b, mbc, a], [mbc, c, a]] : [[c, mca, b], [mca, a, b]]);
            for (let k = 0; k < 2; k++) { ensureOutwardTri(sVerts, sub[k]); nextTris.push(sub[k]); }
          } else {
            let p0 = a, p1 = b, p2 = c, m01 = mab, m20 = mca;
            if (mab < 0) { p0 = c; p1 = a; p2 = b; m01 = mca; m20 = mbc; }
            else if (mca < 0) { p0 = b; p1 = c; p2 = a; m01 = mbc; m20 = mab; }
            const t0 = [p0, m01, m20];
            const d1x = sVerts[m01 * 3] - sVerts[p2 * 3], d1y = sVerts[m01 * 3 + 1] - sVerts[p2 * 3 + 1], d1z = sVerts[m01 * 3 + 2] - sVerts[p2 * 3 + 2];
            const d2x = sVerts[p1 * 3] - sVerts[m20 * 3], d2y = sVerts[p1 * 3 + 1] - sVerts[m20 * 3 + 1], d2z = sVerts[p1 * 3 + 2] - sVerts[m20 * 3 + 2];
            const q = (d1x * d1x + d1y * d1y + d1z * d1z <= d2x * d2x + d2y * d2y + d2z * d2z)
              ? [[m01, p1, p2], [m01, p2, m20]]
              : [[m01, p1, m20], [p1, p2, m20]];
            ensureOutwardTri(sVerts, t0);
            ensureOutwardTri(sVerts, q[0]);
            ensureOutwardTri(sVerts, q[1]);
            nextTris.push(t0, q[0], q[1]);
          }
        }
        sTris = nextTris;
        if (splitCount === 0) break;
      }

      const sliceVCount = sVerts.length / 3;
      const sliceICount = sTris.length * 3;
      const flatSliceIdx = new Uint32Array(sliceICount);
      for (let t = 0; t < sTris.length; t++) {
        const tri = sTris[t];
        const o = t * 3;
        flatSliceIdx[o] = curV + tri[0];
        flatSliceIdx[o + 1] = curV + tri[1];
        flatSliceIdx[o + 2] = curV + tri[2];
      }
      capVertChunks.push(sVerts);
      capIdxChunks.push(flatSliceIdx);
      curV += sliceVCount;
      curI += sliceICount;

      const sliceLVCount = sLineVerts.length / 3;
      const sliceLICount = sLineIdx.length;
      if (sliceLICount > 0) {
        const flatLineIdx = new Uint32Array(sliceLICount);
        for (let k = 0; k < sliceLICount; k++) flatLineIdx[k] = curLV + sLineIdx[k];
        lineVertChunks.push(sLineVerts);
        lineIdxChunks.push(flatLineIdx);
        curLV += sliceLVCount;
        curLI += sliceLICount;
      }

      const slice = {
        key,
        feature: f,
        country: f.__country,
        lang: f.__lang,
        family: f.__family,
        rgb: hexToLinearRgb(f.__color),
        vStart,
        vCount: sliceVCount,
        iStart,
        iCount: sliceICount,
        lvStart,
        lvCount: sliceLVCount,
        liStart,
        liCount: sliceLICount
      };
      if (slice.vCount > maxV) maxV = slice.vCount;
      if (slice.iCount > maxI) maxI = slice.iCount;
      if (slice.lvCount > maxLV) maxLV = slice.lvCount;
      if (slice.liCount > maxLI) maxLI = slice.liCount;

      renderBatch.countrySlices.push(slice);
      renderBatch.sliceByKey.set(key, slice);
    }

    const capPositions = new Float32Array(curV * 3);
    const capColors = new Float32Array(curV * 3);
    const capIndices = new Uint32Array(curI);
    let pWrite = 0;
    for (let c = 0; c < capVertChunks.length; c++) {
      const ch = capVertChunks[c];
      capPositions.set(ch, pWrite);
      pWrite += ch.length;
    }
    let iWrite = 0;
    for (let c = 0; c < capIdxChunks.length; c++) {
      const ch = capIdxChunks[c];
      capIndices.set(ch, iWrite);
      iWrite += ch.length;
    }

    const linePositions = new Float32Array(curLV * 3);
    const lineIndices = new Uint32Array(curLI);
    let lpWrite = 0;
    for (let c = 0; c < lineVertChunks.length; c++) {
      const ch = lineVertChunks[c];
      linePositions.set(ch, lpWrite);
      lpWrite += ch.length;
    }
    let liWrite = 0;
    for (let c = 0; c < lineIdxChunks.length; c++) {
      const ch = lineIdxChunks[c];
      lineIndices.set(ch, liWrite);
      liWrite += ch.length;
    }

    const frontOrBack = 0; // All triangles normalized outward above

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
    renderBatch.viewportLeft = rect ? rect.left : 0;
    renderBatch.viewportTop = rect ? rect.top : 0;
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
    if (elements.countryDrawer && elements.countryDrawer.classList.contains('open')) {
      setMobileDrawerSnap(state.mobileDrawerSnap, true);
    } else if (!isBottomSheetLayout()) {
      setMobileDrawerSnap('half', true);
    }
  }

  // Initialize Globe.GL with 2-Draw-Call Merged World Rendering
  function initGlobe() {
    const initRect = elements.globeViz ? elements.globeViz.getBoundingClientRect() : null;
    const initW = Math.max(1, Math.round((initRect && initRect.width) || window.innerWidth));
    const initH = Math.max(1, Math.round((initRect && initRect.height) || window.innerHeight));
    renderBatch.viewportLeft = initRect ? initRect.left : 0;
    renderBatch.viewportTop = initRect ? initRect.top : 0;
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

    // Animated Origin & Migration Arcs + Pulsing Urheimat Rings (zero-cost until toggled)
    const arcCurveRes = isMobileViewport() ? 48 : 64;
    state.globe
      .arcColor(d => d.colors || d.color || '#38bdf8')
      .arcAltitude(d => (d && d.arcAlt != null ? d.arcAlt : null))
      .arcAltitudeAutoScale(d => (d && d.altScale != null ? d.altScale : 0.42))
      .arcStartAltitude(d => (d && d.startAlt != null ? d.startAlt : 0.0085))
      .arcEndAltitude(d => (d && d.endAlt != null ? d.endAlt : 0.0085))
      .arcStroke(d => (d && d.stroke != null ? d.stroke : 0.72))
      .arcCurveResolution(arcCurveRes)
      .arcCircularResolution(8)
      .arcDashLength(d => (d && d.dashLength != null ? d.dashLength : 0.38))
      .arcDashGap(d => (d && d.dashGap != null ? d.dashGap : 0.26))
      .arcDashInitialGap(d => (d && d.initialGap != null ? d.initialGap : 0))
      .arcDashAnimateTime(d => (d && d.animateTime != null ? d.animateTime : 2100))
      .arcsTransitionDuration(0)
      .ringLat(d => d.lat)
      .ringLng(d => d.lng)
      .ringAltitude(0.0055)
      .ringColor(d => t => hexToRgba(d.color || '#f59e0b', Math.max(0, 0.9 * (1 - t))))
      .ringMaxRadius(d => d.radius || 5)
      .ringPropagationSpeed(1.5)
      .ringRepeatPeriod(1500)
      .ringResolution(36);

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
    const MIN_CAM_DIST = 132;
    const MAX_CAM_DIST = 850;
    const MIN_CAM_ALT = (MIN_CAM_DIST - 100) / 100; // 0.32
    const MAX_CAM_ALT = (MAX_CAM_DIST - 100) / 100; // 7.5
    let camera = null;
    try {
      const renderer = state.globe.renderer();
      if (renderer) {
        renderer.setPixelRatio(getTargetPixelRatio());
        renderer.powerPreference = 'high-performance';
      }
      camera = state.globe.camera();
      if (camera) {
        camera.near = 1.5;
        camera.far = 4000;
        camera.updateProjectionMatrix();
      }
    } catch (e) {
      console.warn('Renderer configuration:', e);
    }

    // OrbitControls (Auto-rotation disabled by default) with strict radial guard
    const controls = state.globe.controls();
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.6;
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.enablePan = false;
    controls.minDistance = MIN_CAM_DIST;
    controls.maxDistance = MAX_CAM_DIST;

    const lastValidCamPos = camera ? camera.position.clone() : null;
    const clampCameraBounds = () => {
      if (!camera) return;
      controls.target.set(0, 0, 0);
      const x = camera.position.x;
      const y = camera.position.y;
      const z = camera.position.z;
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
        if (lastValidCamPos) camera.position.copy(lastValidCamPos);
        else camera.position.set(0, 0, 350);
        camera.lookAt(0, 0, 0);
        return;
      }
      const dist = Math.hypot(x, y, z);
      if (dist < 1e-3) {
        if (lastValidCamPos) camera.position.copy(lastValidCamPos);
        else camera.position.set(0, 0, 350);
        camera.lookAt(0, 0, 0);
        return;
      }
      if (dist < MIN_CAM_DIST || dist > MAX_CAM_DIST) {
        const clamped = Math.max(MIN_CAM_DIST, Math.min(MAX_CAM_DIST, dist));
        const s = clamped / dist;
        camera.position.set(x * s, y * s, z * s);
        camera.lookAt(0, 0, 0);
      }
      if (lastValidCamPos) lastValidCamPos.copy(camera.position);
    };

    const origControlsUpdate = controls.update.bind(controls);
    controls.update = (dt) => {
      const updated = origControlsUpdate(dt);
      clampCameraBounds();
      return updated;
    };

    const origPointOfView = state.globe.pointOfView.bind(state.globe);
    state.globe.pointOfView = (pov, ms) => {
      if (!pov) return origPointOfView();
      const clampedPov = Object.assign({}, pov);
      if (clampedPov.altitude != null && Number.isFinite(+clampedPov.altitude)) {
        clampedPov.altitude = Math.max(MIN_CAM_ALT, Math.min(MAX_CAM_ALT, +clampedPov.altitude));
      }
      return origPointOfView(clampedPov, ms);
    };

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

    controls.addEventListener('change', () => {
      clampCameraBounds();
      if (hoverPointerActive && activePointers.size === 0 && !isDragging) {
        scheduleHoverFrame();
      }
    });

    controls.addEventListener('end', () => {
      clampCameraBounds();
      if (state.isRotating) {
        controls.autoRotate = true;
      }
    });

    // Block native iOS/mobile long-press text selection, callout loupe, pinch-zoom & context menu on globe
    elements.globeViz.addEventListener('wheel', (e) => {
      if (e.ctrlKey && e.cancelable) e.preventDefault();
    }, { passive: false });

    elements.globeViz.addEventListener('touchstart', (e) => {
      if (document.activeElement === elements.searchInput) {
        elements.searchInput.blur();
      }
      const sel = window.getSelection && window.getSelection();
      if (sel && sel.rangeCount > 0) sel.removeAllRanges();
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    elements.globeViz.addEventListener('gesturestart', (e) => {
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    elements.globeViz.addEventListener('gesturechange', (e) => {
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    elements.globeViz.addEventListener('gestureend', (e) => {
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    elements.globeViz.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    document.addEventListener('selectstart', (e) => {
      const target = e.target;
      const tag = target && target.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
      }
    });

    // Zero-lag O(1) Analytic Sphere + VSync-locked rAF Hover/Click Listener (60/120/144Hz Smooth)
    const activePointers = new Map();
    let downX = 0, downY = 0;
    let downPointerType = 'mouse';
    let isDragging = false;
    let multiTouchGesture = false;
    let hoverPointerActive = false;
    let hoverClientX = 0, hoverClientY = 0;
    let hoverRafId = 0;

    const flushHoverFrame = () => {
      hoverRafId = 0;
      if (!hoverPointerActive || activePointers.size > 0 || isDragging) return;
      const hit = pickTargetAtScreen(hoverClientX, hoverClientY, false);
      if (hit) {
        setGlobeCursor('pointer');
        showTooltipForCountry(hit, hoverClientX, hoverClientY);
      } else {
        hideTooltip();
      }
    };

    const scheduleHoverFrame = () => {
      if (!hoverRafId) {
        hoverRafId = requestAnimationFrame(flushHoverFrame);
      }
    };

    const cancelHoverFrame = () => {
      hoverPointerActive = false;
      if (hoverRafId) {
        cancelAnimationFrame(hoverRafId);
        hoverRafId = 0;
      }
    };

    elements.globeViz.addEventListener('pointerdown', (e) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      cancelHoverFrame();
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

    const onDesktopHoverCoord = (e) => {
      if (activePointers.size > 0 || (e.pointerType || 'mouse') === 'touch') return;
      if (!Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;
      hoverClientX = e.clientX;
      hoverClientY = e.clientY;
      hoverPointerActive = true;
      scheduleHoverFrame();
    };

    elements.globeViz.addEventListener('pointermove', (e) => {
      if (activePointers.size > 0) {
        if (activePointers.has(e.pointerId) && activePointers.size === 1) {
          const dx = e.clientX - downX;
          const dy = e.clientY - downY;
          const dragThreshSq = downPointerType === 'touch' ? 144 : 16;
          if (dx * dx + dy * dy > dragThreshSq) {
            isDragging = true;
            cancelHoverFrame();
            hideTooltip();
          }
        }
        return;
      }
      onDesktopHoverCoord(e);
    }, { passive: true });

    if ('onpointerrawupdate' in window) {
      elements.globeViz.addEventListener('pointerrawupdate', onDesktopHoverCoord, { passive: true });
    }

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
          closeCountryDrawer();
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
      cancelHoverFrame();
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

  function applyArcMeshProps() {
    if (!state.globe || !state.showArcs) return;
    const scene = state.globe.scene();
    if (!scene) return;
    scene.traverse((obj) => {
      if (obj.__globeObjType === 'arc' && obj.__data && obj.__data._arcRole && obj.children && obj.children[0]) {
        const mesh = obj.children[0];
        const mat = mesh.material;
        const role = obj.__data._arcRole;
        if (!mat) return;
        const desiredSide = role === 'casing' ? 1 : 0; // BackSide ink outline vs FrontSide core
        const desiredOrder = role === 'casing' ? 5 : (role === 'rail' ? 6 : 7);
        if (mat.side !== desiredSide || mat.transparent !== false || mat.depthWrite !== true || mesh.renderOrder !== desiredOrder) {
          mat.side = desiredSide;
          mat.transparent = false;
          mat.depthWrite = true;
          mat.depthTest = true;
          mat.needsUpdate = true;
          mesh.renderOrder = desiredOrder;
          mesh.frustumCulled = false;
        }
      }
    });
  }

  function addAnimatedRoutePair(arcs, opts) {
    const {
      from,
      to,
      originColor = '#f59e0b',
      destColor = '#38bdf8',
      wave = 1,
      index = 0,
      isPrimary = true,
      altScale
    } = opts || {};
    if (!from || !to || from.length < 2 || to.length < 2) return;
    const startLng = Number(from[0]);
    const startLat = Number(from[1]);
    const endLng = Number(to[0]);
    const endLat = Number(to[1]);
    if (!Number.isFinite(startLat) || !Number.isFinite(startLng) || !Number.isFinite(endLat) || !Number.isFinite(endLng)) {
      return;
    }
    let dLng = Math.abs(endLng - startLng);
    if (dLng > 180) dLng = 360 - dLng;
    if (Math.abs(endLat - startLat) + dLng < 0.25) return;

    const w = Math.max(1, wave || 1);
    const distRad = calcAngularDistRad(startLng, startLat, endLng, endLat);
    const stagger = (w - 1) * 0.02 + (index % 3) * 0.012;
    const baseApex = altScale != null
      ? Math.max(0.115, Math.min(0.56, distRad * 0.45 * altScale + 0.07))
      : Math.max(0.115, Math.min(0.56, distRad * 0.25 + 0.068 + stagger * 0.55));

    // 1. Dark BackSide ink casing separates arc silhouettes cleanly from land fills and overlaps
    arcs.push({
      _arcRole: 'casing',
      startLat,
      startLng,
      endLat,
      endLng,
      startAlt: 0.0085,
      endAlt: 0.0085,
      colors: ['#02050c', '#02050c'],
      stroke: isPrimary ? 1.32 : 0.96,
      arcAlt: baseApex,
      dashLength: 1,
      dashGap: 0,
      initialGap: 0,
      animateTime: 0
    });

    // 2. Crisp continuous inner guide rail keeping full trajectory legible inside dark framing
    const railOrigin = mixColorHex(originColor, '#0b1222', 0.22);
    const railDest = mixColorHex(destColor, '#0b1222', 0.16);
    arcs.push({
      _arcRole: 'rail',
      startLat,
      startLng,
      endLat,
      endLng,
      startAlt: 0.0085,
      endAlt: 0.0085,
      colors: [railOrigin, railDest],
      stroke: isPrimary ? 0.44 : 0.30,
      arcAlt: baseApex,
      dashLength: 1,
      dashGap: 0,
      initialGap: 0,
      animateTime: 0
    });

    // 3. Bolder luminous animated pulse flowing Homeland -> Destination inside dark casing
    const pulseOrigin = mixColorHex(originColor, '#ffffff', 0.26);
    const pulseDest = mixColorHex(destColor, '#ffffff', 0.28);
    arcs.push({
      _arcRole: 'pulse',
      startLat,
      startLng,
      endLat,
      endLng,
      startAlt: 0.0085,
      endAlt: 0.0085,
      colors: [pulseOrigin, pulseDest],
      stroke: isPrimary ? 0.88 : 0.62,
      arcAlt: baseApex,
      dashLength: isPrimary ? 0.38 : 0.30,
      dashGap: isPrimary ? 0.28 : 0.34,
      initialGap: ((w - 1) * 0.28 + (index % 5) * 0.16) % 0.95,
      animateTime: 1850 + (w - 1) * 280 + (index % 4) * 140
    });
  }

  function getLanguageOriginSeed(langName) {
    const ORIGINS = window.WORLD_ORIGINS;
    const HUBS = ORIGINS ? ORIGINS.HUBS : null;
    if (!HUBS || !langName) return null;
    const k = langName.toLowerCase();
    const map = {
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
    return map[k] || null;
  }

  function flyToCorridorCamera(cam) {
    if (!state.globe || !cam) return;
    const controls = state.globe.controls();
    if (controls) controls.autoRotate = false;
    const scale = Math.max(1, getDefaultAltitude() / 2.5);
    const alt = Math.min(5.0, (cam.altitude || 2.5) * (isMobileViewport() ? Math.min(1.55, scale) : 1));
    state.globe.pointOfView({ lat: cam.lat, lng: cam.lng, altitude: alt }, 650);
    if (state.isRotating && controls) {
      setTimeout(() => {
        if (state.isRotating) controls.autoRotate = true;
      }, 700);
    }
  }

  function frameCountryOriginCamera(country, origin) {
    if (!state.globe || !country || !country.centroid) return;
    const controls = state.globe.controls();
    if (controls) controls.autoRotate = false;
    const [destLng, destLat] = country.centroid;
    let targetLng = destLng;
    let targetLat = destLat;
    let alt = Math.max(getSelectAltitude(), isMobileViewport() ? 2.65 : 2.35);

    const chain = (origin && origin.chain) || [];
    if (chain.length > 0) {
      const refPt = chain[0];
      let dLng = refPt[0] - destLng;
      if (dLng > 180) dLng -= 360;
      if (dLng < -180) dLng += 360;
      const dLat = refPt[1] - destLat;
      const span = Math.hypot(dLng * Math.cos((destLat * Math.PI) / 180), dLat);
      targetLng = destLng + dLng * 0.34;
      if (targetLng > 180) targetLng -= 360;
      if (targetLng < -180) targetLng += 360;
      targetLat = destLat + dLat * 0.34;
      alt = Math.max(getSelectAltitude() + 0.35, Math.min(3.5, (isMobileViewport() ? 2.35 : 1.95) + span / 62));
    }

    if (isBottomSheetLayout()) {
      targetLat = Math.max(-72, Math.min(72, targetLat - 16));
    } else {
      targetLat = Math.max(-72, Math.min(72, targetLat));
    }

    state.globe.pointOfView({ lat: targetLat, lng: targetLng, altitude: alt }, 650);
  }

  function syncDrawerOriginButton() {
    const animBtn = document.getElementById('animateCountryOriginBtn');
    if (!animBtn) return;
    const isActive = Boolean(state.showArcs && state.selectedCountry && state.activeOriginCorridor === 'country');
    animBtn.classList.toggle('active', isActive);
    const labelSpan = animBtn.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent = isActive ? 'Animating Origin Arcs (Click to Hide)' : 'Animate Origin Arcs on Globe';
    }
  }

  function renderArcsInfoPanel(mode, payload) {
    const panel = elements.arcsInfoPanel;
    if (!panel) return;
    if (!state.showArcs) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      return;
    }

    panel.classList.add('open');
    panel.classList.toggle('collapsed', state.isArcsPanelCollapsed);
    panel.setAttribute('aria-hidden', 'false');
    if (elements.arcsToggleCollapseBtn) {
      elements.arcsToggleCollapseBtn.setAttribute('aria-expanded', state.isArcsPanelCollapsed ? 'false' : 'true');
    }

    const ORIGINS = window.WORLD_ORIGINS;
    const corridors = (ORIGINS && ORIGINS.corridors) || {};
    const chips = [];
    if (state.selectedCountry) {
      chips.push({
        id: 'country',
        label: `${state.selectedCountry.flag || ''} ${state.selectedCountry.name}`.trim(),
        color: state.selectedCountry.color || '#38bdf8'
      });
    }
    if (state.activeFilterLanguage) {
      chips.push({
        id: 'filter',
        label: `Filter: ${state.activeFilterLanguage}`,
        color: state.activeFilterColor || '#38bdf8'
      });
    }
    const order = ['all', 'indo-european', 'austronesian', 'bantu', 'afroasiatic', 'turkic', 'sino-tibetan', 'uralic', 'se-asia', 'americas'];
    for (const id of order) {
      const cor = corridors[id];
      if (cor) chips.push({ id, label: cor.shortLabel || cor.title, color: cor.color || '#38bdf8' });
    }

    if (elements.arcCorridorChips) {
      elements.arcCorridorChips.innerHTML = chips.map(ch => `
        <button type="button" class="arc-corridor-chip ${ch.id === state.activeOriginCorridor ? 'active' : ''}" data-corridor="${escapeHtml(ch.id)}" role="tab" aria-selected="${ch.id === state.activeOriginCorridor ? 'true' : 'false'}">
          <span class="legend-dot" style="background:${ch.color};"></span>
          <span>${escapeHtml(ch.label)}</span>
        </button>
      `).join('');

      elements.arcCorridorChips.querySelectorAll('.arc-corridor-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const cid = btn.getAttribute('data-corridor');
          if (!cid) return;
          state.activeOriginCorridor = cid;
          state.isArcsPanelCollapsed = false;
          updateArcs();
          const cor = corridors[cid];
          if (cor && cor.camera) {
            flyToCorridorCamera(cor.camera);
          } else if (cid === 'country' && state.selectedCountry && ORIGINS) {
            frameCountryOriginCamera(state.selectedCountry, ORIGINS.resolveCountryOrigin(state.selectedCountry));
          }
          syncDrawerOriginButton();
        });
      });
    }

    const accentColor = (payload && payload.color) || '#f59e0b';
    if (elements.arcsLiveDot) {
      elements.arcsLiveDot.style.background = accentColor;
      elements.arcsLiveDot.style.boxShadow = `0 0 8px ${accentColor}`;
    }
    if (elements.arcsPanelTitle) {
      elements.arcsPanelTitle.textContent = mode === 'filter'
        ? `Origin & Diffusion • ${state.activeFilterLanguage}`
        : mode === 'country' && state.selectedCountry
          ? `Origin • ${state.selectedCountry.name}`
          : 'Family Origin & Migration';
    }

    if (!elements.arcsInfoBody || !payload) return;

    const stagesHtml = (payload.stages && payload.stages.length > 0)
      ? `<div class="origin-stages-list">
          ${payload.stages.map(st => `
            <div class="origin-stage-item">
              <span class="origin-stage-era">${escapeHtml(st.era)}</span>
              <span>${escapeHtml(st.label)}</span>
            </div>
          `).join('')}
        </div>`
      : '';

    elements.arcsInfoBody.innerHTML = `
      <div class="arcs-route-title">${escapeHtml(payload.title || 'Language Origin & Migration')}</div>
      <div class="arcs-meta-grid">
        <div class="arcs-meta-pill">
          <span class="arcs-meta-label">Primary Homeland (Urheimat)</span>
          ${escapeHtml(payload.homeland || '')}
        </div>
        <div class="arcs-meta-pill">
          <span class="arcs-meta-label">Chronology &amp; Branches</span>
          <div><strong style="color:#f8fafc;">${escapeHtml(payload.timeframe || payload.era || '')}</strong></div>
          ${payload.branches ? `<div style="margin-top:3px;">${escapeHtml(payload.branches)}</div>` : ''}
        </div>
        <div class="arcs-meta-pill">
          <span class="arcs-meta-label">Historical Dispersal Driver</span>
          ${escapeHtml(payload.mechanism || payload.driver || '')}
        </div>
      </div>
      ${payload.summary ? `<p class="arcs-summary-text">${escapeHtml(payload.summary)}</p>` : ''}
      ${stagesHtml}
      ${payload.scholarshipNote ? `
        <div class="arcs-note-box">
          <strong style="color:#f8fafc;">Scholarly Evidence:</strong> ${escapeHtml(payload.scholarshipNote)}
        </div>
      ` : ''}
      <div class="arcs-legend-strip">
        <span class="arcs-flow-sample">
          <span class="arcs-flow-bar" style="background:linear-gradient(90deg, #f59e0b, ${accentColor});"></span>
          <span>Pulse: Homeland → Destination</span>
        </span>
        <span>${payload.routeCount || 0} animated route${payload.routeCount === 1 ? '' : 's'}</span>
      </div>
    `;
  }

  // Build / Refresh Animated Origin & Migration Arcs + Urheimat Rings
  function updateArcs() {
    if (!state.globe) return;
    const ORIGINS = window.WORLD_ORIGINS;
    if (!state.showArcs) {
      state.globe.arcsData([]);
      state.globe.ringsData([]);
      renderArcsInfoPanel('hidden', null);
      return;
    }

    const arcs = [];
    const rings = [];
    let panelMode = 'corridor';
    let panelPayload = null;

    if (state.activeOriginCorridor === 'country' && state.selectedCountry && ORIGINS) {
      const src = state.selectedCountry;
      const origin = ORIGINS.resolveCountryOrigin(src);
      const dest = src.centroid;
      const chain = (origin && origin.chain) ? [...origin.chain] : [];

      if (chain.length > 0 && dest) {
        const lastPt = chain[chain.length - 1];
        let dLng = Math.abs(dest[0] - lastPt[0]);
        if (dLng > 180) dLng = 360 - dLng;
        if (Math.abs(dest[1] - lastPt[1]) + dLng >= 0.45) {
          chain.push(dest);
        }
        rings.push({ lat: chain[0][1], lng: chain[0][0], color: '#f59e0b', radius: 6.0 });
        for (let i = 0; i < chain.length - 1; i++) {
          addAnimatedRoutePair(arcs, {
            from: chain[i],
            to: chain[i + 1],
            originColor: i === 0 ? '#f59e0b' : (origin.color || src.color || '#38bdf8'),
            destColor: origin.color || src.color || '#38bdf8',
            wave: i + 1,
            index: i,
            isPrimary: true
          });
        }
      } else if (dest) {
        rings.push({ lat: dest[1], lng: dest[0], color: (origin && origin.color) || src.color || '#f59e0b', radius: 5.5 });
      }

      if (origin && origin.secondaryRoutes && dest) {
        origin.secondaryRoutes.forEach((sr, idx) => {
          addAnimatedRoutePair(arcs, {
            from: sr.from,
            to: sr.to || dest,
            originColor: sr.color || '#c084fc',
            destColor: src.color || '#38bdf8',
            wave: 2,
            index: idx + 1,
            isPrimary: true,
            altScale: 0.28
          });
          rings.push({ lat: sr.from[1], lng: sr.from[0], color: sr.color || '#c084fc', radius: 4.0 });
        });
      }

      const ORIGIN_EXPORTERS = new Set(['ESP', 'GBR', 'FRA', 'PRT', 'SAU', 'RUS', 'ITA', 'DEU', 'NLD', 'SWE', 'TUR', 'CHN']);
      if (dest && ORIGIN_EXPORTERS.has((src.iso3 || '').toUpperCase())) {
        const canon = (src.canonicalLanguage || src.primaryLanguage || '').toLowerCase();
        let addedOut = 0;
        for (const c of state.countriesList) {
          if (!c || !c.centroid || c.iso3 === src.iso3) continue;
          const cCanon = (c.canonicalLanguage || c.primaryLanguage || '').toLowerCase();
          if (canon && cCanon === canon) {
            addAnimatedRoutePair(arcs, {
              from: dest,
              to: c.centroid,
              originColor: src.color || '#38bdf8',
              destColor: c.color || src.color || '#38bdf8',
              wave: 3,
              index: addedOut,
              isPrimary: false,
              altScale: 0.31 + (addedOut % 3) * 0.025
            });
            addedOut++;
            if (addedOut >= 10) break;
          }
        }
      }

      panelMode = 'country';
      panelPayload = {
        title: (origin && origin.title) || `${src.name} Linguistic Lineage`,
        homeland: origin && origin.homeland,
        era: origin && origin.era,
        driver: origin && origin.driver,
        summary: origin && origin.notes,
        stages: origin && origin.stages,
        scholarshipNote: `Pulses trace chronological migration hops into ${src.name}. Click any family tab above to compare global corridors.`,
        color: (origin && origin.color) || src.color || '#38bdf8',
        routeCount: arcs.filter(a => a._arcRole === 'pulse').length
      };
    } else if (state.activeOriginCorridor === 'filter' && state.activeFilterLanguage) {
      const lang = state.activeFilterLanguage;
      const langLower = lang.toLowerCase();
      const matching = state.countriesList.filter(
        c => c.centroid && (c.canonicalLanguage || c.primaryLanguage || '').toLowerCase() === langLower
      );
      const seed = getLanguageOriginSeed(lang);
      const filterColor = state.activeFilterColor || (matching[0] && matching[0].color) || '#38bdf8';

      if (seed && seed.chain && seed.chain.length > 0) {
        rings.push({ lat: seed.chain[0][1], lng: seed.chain[0][0], color: '#f59e0b', radius: 6.0 });
        for (let i = 0; i < seed.chain.length - 1; i++) {
          addAnimatedRoutePair(arcs, {
            from: seed.chain[i],
            to: seed.chain[i + 1],
            originColor: i === 0 ? '#f59e0b' : filterColor,
            destColor: filterColor,
            wave: i + 1,
            index: i,
            isPrimary: true
          });
        }
        const hubPt = seed.hub || seed.chain[seed.chain.length - 1];
        if (matching.length === 1 && matching[0].centroid) {
          addAnimatedRoutePair(arcs, {
            from: seed.chain[seed.chain.length - 1],
            to: matching[0].centroid,
            originColor: filterColor,
            destColor: filterColor,
            wave: seed.chain.length,
            index: 0,
            isPrimary: true
          });
        } else {
          let count = 0;
          for (let i = 0; i < matching.length && count < 18; i++) {
            const m = matching[i];
            if (!m.centroid) continue;
            addAnimatedRoutePair(arcs, {
              from: hubPt,
              to: m.centroid,
              originColor: filterColor,
              destColor: m.color || filterColor,
              wave: Math.min(3, seed.chain.length),
              index: count,
              isPrimary: false,
              altScale: 0.30 + (count % 4) * 0.025
            });
            count++;
          }
        }
      }

      panelMode = 'filter';
      panelPayload = {
        title: (seed && seed.title) || `${lang} Origin & Shared Distribution`,
        homeland: (seed && seed.homeland) || 'Historical Diffusion Network',
        era: (seed && seed.era) || 'Prehistoric Urheimat → Modern Distribution',
        branches: `Primary in ${matching.length} mapped countr${matching.length === 1 ? 'y' : 'ies'}`,
        mechanism: (seed && seed.mechanism) || 'Historical linguistic convergence & maritime/continental dispersal',
        scholarshipNote: (seed && seed.note) || `Tracing historical spread of ${lang}.`,
        color: filterColor,
        routeCount: arcs.filter(a => a._arcRole === 'pulse').length
      };
    } else if (ORIGINS && ORIGINS.corridors) {
      const cid = ORIGINS.corridors[state.activeOriginCorridor] ? state.activeOriginCorridor : 'all';
      state.activeOriginCorridor = cid;
      const corridor = ORIGINS.corridors[cid];

      if (corridor.nodes) {
        corridor.nodes.forEach(n => {
          if (n && n.pt) {
            rings.push({ lat: n.pt[1], lng: n.pt[0], color: n.color || corridor.color, radius: n.radius || 5 });
          }
        });
      }
      if (corridor.routes) {
        corridor.routes.forEach((rt, idx) => {
          addAnimatedRoutePair(arcs, {
            from: rt.from,
            to: rt.to,
            originColor: rt.originColor || corridor.accentColor || '#f59e0b',
            destColor: rt.color || corridor.color || '#38bdf8',
            wave: rt.wave || 1,
            index: idx,
            isPrimary: true
          });
        });
      }

      panelMode = 'corridor';
      panelPayload = {
        ...corridor,
        routeCount: (corridor.routes && corridor.routes.length) || arcs.filter(a => a._arcRole === 'pulse').length
      };
    }

    state.globe.arcsData(arcs);
    state.globe.ringsData(rings);
    requestAnimationFrame(() => {
      applyArcMeshProps();
      requestAnimationFrame(applyArcMeshProps);
    });
    renderArcsInfoPanel(panelMode, panelPayload);
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
    if (!state.selectedCountry && state.activeOriginCorridor && state.activeOriginCorridor !== 'country') {
      state._prevCorridorBeforeCountry = state.activeOriginCorridor;
    }
    state.selectedCountry = country;
    hideTooltip();
    if (state.isLegendExpandedMobile) {
      state.isLegendExpandedMobile = false;
      syncLegendResponsiveUI();
    }

    // Update merged vertex colors and raised highlight in <0.3ms
    refreshPolygonVisuals();
    if (state.globe && state.showArcs) {
      state.activeOriginCorridor = 'country';
      updateArcs();
    }

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

    // Origin & Migration History Card
    if (elements.drawerOriginSection && elements.drawerOriginCard) {
      const ORIGINS = window.WORLD_ORIGINS;
      const origin = ORIGINS && typeof ORIGINS.resolveCountryOrigin === 'function'
        ? ORIGINS.resolveCountryOrigin(c)
        : null;
      if (origin) {
        elements.drawerOriginSection.style.display = 'flex';
        if (elements.drawerOriginEra) {
          const rawEra = (origin.era || '').split('•')[0].replace(/\([^)]*\)/g, '').replace(/\s*→\s*c\.\s*/g, ' → ').replace(/\s+/g, ' ').trim();
          elements.drawerOriginEra.textContent = rawEra.length > 28 ? `${rawEra.slice(0, 26).trim()}…` : (rawEra || 'Lineage');
        }
        const isThisCountryAnimating = Boolean(
          state.showArcs &&
          state.activeOriginCorridor === 'country' &&
          state.selectedCountry &&
          getCountryKey(state.selectedCountry) === getCountryKey(c)
        );
        const hasArcPath = Boolean(
          (origin.chain && origin.chain.length > 0) ||
          (origin.secondaryRoutes && origin.secondaryRoutes.length > 0)
        );
        const secondaryHtml = (origin.secondaryRoutes && origin.secondaryRoutes.length > 0)
          ? `<div class="origin-driver-row"><span class="arcs-meta-label">Secondary / Contact Stratum</span>${origin.secondaryRoutes.map(sr => escapeHtml(sr.label)).join(' • ')}</div>`
          : '';
        elements.drawerOriginCard.innerHTML = `
          <div class="origin-homeland-banner">${escapeHtml(origin.homeland)}</div>
          <div class="origin-driver-row">
            <span class="arcs-meta-label">Era &amp; Dispersal Mechanism</span>
            <div><strong style="color:#f8fafc;">${escapeHtml(origin.era)}</strong></div>
            <div style="margin-top:3px;">${escapeHtml(origin.driver)}</div>
          </div>
          ${secondaryHtml}
          ${origin.stages && origin.stages.length > 0 ? `
            <div class="origin-stages-list">
              ${origin.stages.map(st => `
                <div class="origin-stage-item">
                  <span class="origin-stage-era">${escapeHtml(st.era)}</span>
                  <span>${escapeHtml(st.label)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <p class="origin-notes-text">${escapeHtml(origin.notes)}</p>
          ${hasArcPath ? `
            <button type="button" id="animateCountryOriginBtn" class="origin-animate-btn ${isThisCountryAnimating ? 'active' : ''}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M4 14.5c4-4.5 12-4.5 16 0"></path>
                <path d="M7 11.5c2.5-3 7.5-3 10 0"></path>
                <circle cx="4" cy="15" r="1.5"></circle>
                <circle cx="20" cy="15" r="1.5"></circle>
              </svg>
              <span>${isThisCountryAnimating ? 'Animating Origin Arcs (Click to Hide)' : 'Animate Origin Arcs on Globe'}</span>
            </button>
          ` : ''}
        `;

        const animBtn = document.getElementById('animateCountryOriginBtn');
        if (animBtn) {
          animBtn.addEventListener('click', () => {
            const currentlyActive = Boolean(state.showArcs && state.activeOriginCorridor === 'country');
            if (currentlyActive) {
              state.showArcs = false;
              if (elements.toggleArcsBtn) elements.toggleArcsBtn.classList.remove('active');
              updateArcs();
            } else {
              state.showArcs = true;
              state.activeOriginCorridor = 'country';
              if (elements.toggleArcsBtn) elements.toggleArcsBtn.classList.add('active');
              updateArcs();
              frameCountryOriginCamera(c, origin);
            }
            syncDrawerOriginButton();
          });
        }
      } else {
        elements.drawerOriginSection.style.display = 'none';
      }
    }

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

    // Open Drawer (always starts in balanced half-sheet on mobile portrait)
    elements.countryDrawer.classList.add('open');
    elements.countryDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-is-open');
    setMobileDrawerSnap('half', true);
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
          if (state.globe && state.showArcs) {
            if (!state.selectedCountry) {
              state.activeOriginCorridor = 'filter';
              state.isArcsPanelCollapsed = false;
            }
            updateArcs();
          }
        }
      });
    });

    if (elements.toggleLegendMobileBtn) {
      elements.toggleLegendMobileBtn.addEventListener('click', () => {
        state.isLegendExpandedMobile = !state.isLegendExpandedMobile;
        if (state.isLegendExpandedMobile && state.showArcs && elements.arcsInfoPanel) {
          state.isArcsPanelCollapsed = true;
          elements.arcsInfoPanel.classList.add('collapsed');
          if (elements.arcsToggleCollapseBtn) elements.arcsToggleCollapseBtn.setAttribute('aria-expanded', 'false');
        }
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
    if (state.activeOriginCorridor === 'filter') {
      state.activeOriginCorridor = state.selectedCountry ? 'country' : (state._prevCorridorBeforeCountry || 'all');
    }
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

  function closeCountryDrawer() {
    const drawer = elements.countryDrawer;
    if (!drawer) return;
    drawer.classList.remove('open', 'is-dragging', 'snap-peek', 'snap-half', 'snap-full');
    drawer.style.height = '';
    drawer.style.transform = '';
    drawer.style.borderRadius = '';
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-is-open', 'drawer-peek');
    document.documentElement.style.removeProperty('--drawer-peek-h');
    state.mobileDrawerSnap = 'half';
    state.selectedCountry = null;
    if (state.activeOriginCorridor === 'country') {
      state.activeOriginCorridor = state.activeFilterLanguage
        ? 'filter'
        : (state._prevCorridorBeforeCountry || 'all');
    }
    refreshPolygonVisuals();
    if (state.globe) {
      if (state.showArcs) updateArcs();
      if (state.isRotating) {
        const controls = state.globe.controls();
        if (controls) controls.autoRotate = true;
      }
    }
  }

  function setupMobileDrawerGestures() {
    const drawer = elements.countryDrawer;
    const header = elements.drawerHeader;
    const body = elements.drawerBody;
    if (!drawer || !header) return;

    if (elements.drawerSnapBtn) {
      elements.drawerSnapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isBottomSheetLayout() || !drawer.classList.contains('open')) return;
        const cur = state.mobileDrawerSnap;
        const next = cur === 'full' ? 'half' : (cur === 'peek' ? 'half' : 'full');
        setMobileDrawerSnap(next, true);
      });
    }

    const drag = {
      active: false,
      mode: null,
      pointerId: null,
      startSnap: 'half',
      startH: 0,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      prevY: 0,
      lastTs: 0,
      prevTs: 0,
      moved: false
    };

    const startDragState = (mode, pointerId, clientX, clientY) => {
      const metrics = getSheetMetrics();
      const measuredH = Math.round(drawer.getBoundingClientRect().height);
      const startH = Math.max(
        metrics.peekH,
        Math.min(
          metrics.fullH,
          measuredH || (state.mobileDrawerSnap === 'full' ? metrics.fullH : (state.mobileDrawerSnap === 'peek' ? metrics.peekH : metrics.halfH))
        )
      );
      const now = performance.now();
      drag.active = true;
      drag.mode = mode;
      drag.pointerId = pointerId;
      drag.startSnap = state.mobileDrawerSnap || 'half';
      drag.startH = startH;
      drag.startX = clientX;
      drag.startY = clientY;
      drag.lastX = clientX;
      drag.lastY = clientY;
      drag.prevY = clientY;
      drag.lastTs = now;
      drag.prevTs = now;
      drag.moved = false;
    };

    const applyDragFrame = (clientX, clientY) => {
      if (!drag.active) return;
      const now = performance.now();
      if (now - drag.lastTs >= 12) {
        drag.prevY = drag.lastY;
        drag.prevTs = drag.lastTs;
      }
      drag.lastX = clientX;
      drag.lastY = clientY;
      drag.lastTs = now;

      const dy = clientY - drag.startY;
      if (!drag.moved && Math.hypot(clientX - drag.startX, dy) >= 5) {
        drag.moved = true;
        drawer.classList.add('is-dragging');
        document.body.classList.remove('drawer-peek');
      }
      if (!drag.moved) return;

      const metrics = getSheetMetrics();
      const rawH = drag.startH - dy;

      if (rawH >= metrics.fullH) {
        drawer.style.height = `${metrics.fullH}px`;
        drawer.style.transform = 'translate3d(0, 0, 0)';
        drawer.style.borderRadius = '0px';
      } else if (rawH >= metrics.peekH) {
        drawer.style.height = `${Math.round(rawH)}px`;
        drawer.style.transform = 'translate3d(0, 0, 0)';
        const r = rawH >= metrics.fullH - 28
          ? Math.max(0, Math.round(18 * (metrics.fullH - rawH) / 28))
          : 18;
        drawer.style.borderRadius = `${r}px ${r}px 0 0`;
      } else {
        const extraDown = Math.max(0, metrics.peekH - rawH);
        drawer.style.height = `${metrics.peekH}px`;
        drawer.style.transform = `translate3d(0, ${Math.round(extraDown)}px, 0)`;
        drawer.style.borderRadius = '18px 18px 0 0';
      }
    };

    const finishDrag = (isCancel) => {
      if (!drag.active) return;
      const wasMoved = drag.moved;
      const startSnap = drag.startSnap;
      const startH = drag.startH;
      const startY = drag.startY;
      const lastY = drag.lastY;
      const prevY = drag.prevY;
      const dt = Math.max(10, drag.lastTs - drag.prevTs);
      const vy = (lastY - prevY) / dt; // px/ms (>0 downward, <0 upward)
      drag.active = false;
      drag.mode = null;
      drag.pointerId = null;

      if (isCancel) {
        drawer.classList.remove('is-dragging');
        setMobileDrawerSnap(startSnap, true);
        return;
      }

      if (!wasMoved) {
        drawer.classList.remove('is-dragging');
        if (startSnap === 'peek') {
          setMobileDrawerSnap('half', true);
        } else {
          setMobileDrawerSnap(startSnap, true);
        }
        return;
      }

      const metrics = getSheetMetrics();
      const dy = lastY - startY;
      const rawH = startH - dy;
      const dismissDropThreshold = Math.max(40, metrics.peekH * 0.40);

      if (
        rawH < metrics.peekH - dismissDropThreshold ||
        (startSnap === 'peek' && vy > 0.45 && dy > 20) ||
        (vy > 1.25 && rawH < metrics.halfH * 0.72)
      ) {
        drawer.classList.remove('is-dragging');
        void drawer.offsetHeight;
        closeCountryDrawer();
        return;
      }

      let nextSnap;
      if (vy < -0.55) {
        if (startSnap === 'peek') {
          nextSnap = rawH > metrics.halfH + 36 ? 'full' : 'half';
        } else {
          nextSnap = 'full';
        }
      } else if (vy > 0.55) {
        if (startSnap === 'full') {
          nextSnap = rawH < (metrics.peekH + metrics.halfH) * 0.5 ? 'peek' : 'half';
        } else {
          nextSnap = 'peek';
        }
      } else {
        const projectedH = Math.max(metrics.peekH, Math.min(metrics.fullH, rawH - vy * 130));
        const dPeek = Math.abs(projectedH - metrics.peekH);
        const dHalf = Math.abs(projectedH - metrics.halfH);
        const dFull = Math.abs(projectedH - metrics.fullH);
        if (dFull <= dHalf && dFull <= dPeek) nextSnap = 'full';
        else if (dPeek <= dHalf) nextSnap = 'peek';
        else nextSnap = 'half';
      }

      drawer.classList.remove('is-dragging');
      void drawer.offsetHeight;
      setMobileDrawerSnap(nextSnap, true);
    };

    // Primary drag handle: Drawer Header (mouse + touch via PointerEvents)
    header.addEventListener('pointerdown', (e) => {
      if (!isBottomSheetLayout() || !drawer.classList.contains('open')) return;
      if (typeof e.button === 'number' && e.button !== 0) return;
      if (e.target && e.target.closest('button, a, input, select, textarea')) return;
      if (drag.active) return;
      startDragState('pointer', e.pointerId, e.clientX, e.clientY);
    });

    window.addEventListener('pointermove', (e) => {
      if (!drag.active || drag.mode !== 'pointer' || e.pointerId !== drag.pointerId) return;
      applyDragFrame(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('pointerup', (e) => {
      if (!drag.active || drag.mode !== 'pointer' || e.pointerId !== drag.pointerId) return;
      finishDrag(false);
    }, { passive: true });

    window.addEventListener('pointercancel', (e) => {
      if (!drag.active || drag.mode !== 'pointer' || e.pointerId !== drag.pointerId) return;
      finishDrag(true);
    }, { passive: true });

    // Overscroll handoff from Drawer Body: pull down from top to minimize/close, or pull up from peek
    if (body) {
      let bodyTouch = null;

      body.addEventListener('touchstart', (e) => {
        if (!isBottomSheetLayout() || !drawer.classList.contains('open')) return;
        if (e.touches.length !== 1 || drag.active) return;
        const t = e.touches[0];
        bodyTouch = {
          id: t.identifier,
          startX: t.clientX,
          startY: t.clientY,
          engaged: false,
          rejected: false,
          canPullDown: body.scrollTop <= 1,
          isPeek: state.mobileDrawerSnap === 'peek'
        };
      }, { passive: true });

      body.addEventListener('touchmove', (e) => {
        if (!bodyTouch || !isBottomSheetLayout() || !drawer.classList.contains('open')) return;
        let t = null;
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === bodyTouch.id) {
            t = e.touches[i];
            break;
          }
        }
        if (!t) return;

        if (!bodyTouch.engaged) {
          if (bodyTouch.rejected) return;
          const dx = t.clientX - bodyTouch.startX;
          const dy = t.clientY - bodyTouch.startY;
          if (Math.abs(dx) + Math.abs(dy) < 6) return;
          if (Math.abs(dx) > Math.abs(dy) * 1.1) {
            bodyTouch.rejected = true;
            return;
          }
          const wantsMinimize = dy > 6 && (bodyTouch.canPullDown && body.scrollTop <= 1);
          const wantsExpandFromPeek = dy < -6 && bodyTouch.isPeek;
          if (wantsMinimize || wantsExpandFromPeek) {
            bodyTouch.engaged = true;
            startDragState('touch', bodyTouch.id, bodyTouch.startX, bodyTouch.startY);
            if (e.cancelable) e.preventDefault();
            applyDragFrame(t.clientX, t.clientY);
          } else {
            bodyTouch.rejected = true;
          }
          return;
        }

        if (drag.active && drag.mode === 'touch') {
          if (e.cancelable) e.preventDefault();
          applyDragFrame(t.clientX, t.clientY);
        }
      }, { passive: false });

      const onBodyTouchEnd = (e, isCancel) => {
        if (!bodyTouch) return;
        let ended = false;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === bodyTouch.id) {
            ended = true;
            break;
          }
        }
        if (!ended) return;
        const wasEngaged = bodyTouch.engaged;
        bodyTouch = null;
        if (wasEngaged && drag.active && drag.mode === 'touch') {
          finishDrag(isCancel);
        }
      };

      body.addEventListener('touchend', (e) => onBodyTouchEnd(e, false), { passive: true });
      body.addEventListener('touchcancel', (e) => onBodyTouchEnd(e, true), { passive: true });
    }
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
      state.globe.pointOfView({ altitude: Math.max(0.32, pov.altitude - 0.5) }, 240);
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

    // Toggle Animated Origin & Migration Arcs
    if (elements.toggleArcsBtn) {
      elements.toggleArcsBtn.addEventListener('click', () => {
        state.showArcs = !state.showArcs;
        elements.toggleArcsBtn.classList.toggle('active', state.showArcs);
        if (state.showArcs) {
          state.isArcsPanelCollapsed = false;
          if (isMobileViewport() && state.isLegendExpandedMobile) {
            state.isLegendExpandedMobile = false;
            syncLegendResponsiveUI();
          }
          if (state.selectedCountry) {
            state.activeOriginCorridor = 'country';
          } else if (state.activeFilterLanguage) {
            state.activeOriginCorridor = 'filter';
          } else if (state.activeOriginCorridor === 'country' || state.activeOriginCorridor === 'filter') {
            state.activeOriginCorridor = state._prevCorridorBeforeCountry || 'all';
          }
        }
        updateArcs();
        syncDrawerOriginButton();
      });
    }

    if (elements.arcsToggleCollapseBtn) {
      elements.arcsToggleCollapseBtn.addEventListener('click', () => {
        state.isArcsPanelCollapsed = !state.isArcsPanelCollapsed;
        if (elements.arcsInfoPanel) {
          elements.arcsInfoPanel.classList.toggle('collapsed', state.isArcsPanelCollapsed);
        }
        elements.arcsToggleCollapseBtn.setAttribute('aria-expanded', state.isArcsPanelCollapsed ? 'false' : 'true');
      });
    }

    if (elements.arcsCloseBtn) {
      elements.arcsCloseBtn.addEventListener('click', () => {
        state.showArcs = false;
        if (elements.toggleArcsBtn) elements.toggleArcsBtn.classList.remove('active');
        updateArcs();
        syncDrawerOriginButton();
      });
    }

    // Close Drawer & Bottom-Sheet Snap/Pull Gestures
    elements.closeDrawerBtn.addEventListener('click', closeCountryDrawer);
    setupMobileDrawerGestures();

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
        elements.infoModal.classList.remove('open');
        elements.infoModal.setAttribute('aria-hidden', 'true');
        elements.listModal.classList.remove('open');
        elements.listModal.setAttribute('aria-hidden', 'true');
        hideTooltip();
        closeCountryDrawer();
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

