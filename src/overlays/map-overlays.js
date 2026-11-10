// src/overlays/map-overlays.js - Jitter-Free Zoom-Adaptive Map Overlay Engine
// Features: Persistent anchor-bound DOM pooling, tier/collision hysteresis, cached HUD obstacles,
// sub-pixel active tracking with settled DPR pixel snapping, and smooth ramp-in fades.
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  const overlayState = {
    anchors: [],
    pool: [],
    slotByKey: new Map(),
    freeSlots: [],
    fadeMap: new Map(),
    prevVisibleKeys: new Set(),
    poolReady: false,
    dirty: true,
    hudInitialized: false,
    hudRects: [],
    hudSheetReservedH: 0,
    projVec: null,
    lastCamX: NaN,
    lastCamY: NaN,
    lastCamZ: NaN,
    lastQx: NaN,
    lastQy: NaN,
    lastQz: NaN,
    lastQw: NaN,
    lastW: 0,
    lastH: 0,
    lastZoomTier: -1,
    isMoving: false,
    settleTimer: 0,
    fadeRaf: 0,
    placedBoxes: [],
    stats: {
      hudReadsInsideRender: 0,
      slotSwaps: 0,
      updates: 0
    }
  };

  function setMovingState(moving) {
    if (overlayState.isMoving === moving) return;
    overlayState.isMoving = moving;
    if (E.elements.globeMapOverlays) {
      E.elements.globeMapOverlays.classList.toggle('is-moving', moving);
    }
  }

  function settleOverlays() {
    overlayState.settleTimer = 0;
    setMovingState(false);
    overlayState.dirty = true;
    const globe = E.state.globe;
    if (globe && globe.camera() && E.renderBatch.merged) {
      updateCountryOverlays(globe.camera(), false);
    }
  }

  function scheduleFadeContinuation() {
    if (overlayState.fadeRaf) return;
    overlayState.fadeRaf = requestAnimationFrame(() => {
      overlayState.fadeRaf = 0;
      const globe = E.state.globe;
      if (!globe || !globe.camera() || !E.renderBatch.merged) return;
      overlayState.dirty = true;
      updateCountryOverlays(globe.camera(), false);
    });
  }

  function initOverlayPool() {
    const container = E.elements.globeMapOverlays;
    if (!container || overlayState.poolReady) return;
    const { OVERLAY_CONFIG } = E.config;
    const frag = document.createDocumentFragment();
    const pool = [];
    const freeSlots = [];

    for (let i = 0; i < OVERLAY_CONFIG.POOL_SIZE; i++) {
      const el = document.createElement('div');
      el.className = 'map-overlay-label';
      el.style.display = 'none';
      const mainEl = document.createElement('span');
      mainEl.className = 'map-overlay-main';
      const dotEl = document.createElement('span');
      dotEl.className = 'map-overlay-dot';
      const titleEl = document.createElement('span');
      titleEl.className = 'map-overlay-title';
      const subEl = document.createElement('span');
      subEl.className = 'map-overlay-sub';
      mainEl.appendChild(dotEl);
      mainEl.appendChild(titleEl);
      el.appendChild(mainEl);
      el.appendChild(subEl);
      frag.appendChild(el);

      const slot = {
        id: i,
        el,
        dotEl,
        titleEl,
        subEl,
        visible: false,
        anchorKey: null,
        lastKey: null,
        lastSig: '',
        lastColor: '',
        lastOpacity: '',
        lastTx: NaN,
        lastTy: NaN
      };
      pool.push(slot);
      freeSlots.push(slot);
    }

    container.appendChild(frag);
    overlayState.pool = pool;
    overlayState.freeSlots = freeSlots;
    overlayState.slotByKey.clear();
    overlayState.poolReady = true;
  }

  function buildOverlayAnchors() {
    const globe = E.state.globe;
    const countries = E.state.countriesList;
    if (!globe || !countries.length) return;
    initOverlayPool();

    const { OVERLAY_ISLAND_HUBS } = E.config;
    const { getCountryKey, computeCountryAreaWeights } = E.geo;
    const { buildOverlayLabelsForCountry } = E.labelFormatter;
    const areaWeights = computeCountryAreaWeights();
    const anchors = [];

    for (let i = 0; i < countries.length; i++) {
      const c = countries[i];
      if (!c || !c.centroid || (c.centroid[0] === 0 && c.centroid[1] === 0)) continue;
      const key = getCountryKey(c);
      const iso = (c.iso3 || '').toUpperCase();
      const [lng, lat] = c.centroid;
      const coords = globe.getCoords(lat, lng, 0.005);
      if (!coords) continue;
      const rLen = Math.hypot(coords.x, coords.y, coords.z) || 100.5;
      const nx = coords.x / rLen;
      const ny = coords.y / rLen;
      const nz = coords.z / rLen;
      const areaWeight = areaWeights.get(key) || 0.05;
      const isIslandHub = OVERLAY_ISLAND_HUBS.has(iso);
      const priority = areaWeight * 10 + (isIslandHub ? 180 : 0) + (Math.abs(lat) > 74 ? -40 : 0);

      let minTier = 2;
      if (areaWeight >= 18 || isIslandHub) minTier = 0;
      else if (areaWeight >= 2.2) minTier = 1;

      const famGrp = E.geo.resolveCountryFamilyGroup(c);
      const scrGrp = E.geo.resolveCountryScriptGroup(c);
      const divGrp = E.geo.resolveCountryDiversityGroup(c);

      anchors.push({
        key,
        iso,
        country: c,
        canonLang: c.canonicalLanguage || c.primaryLanguage || '',
        familyGroup: famGrp.name,
        scriptGroup: scrGrp.name,
        diversityTier: divGrp.name,
        color: c.color || '#38bdf8',
        familyColor: famGrp.color || '#0ea5e9',
        scriptColor: scrGrp.color || '#0ea5e9',
        diversityColor: divGrp.color || '#4f618f',
        wx: coords.x,
        wy: coords.y,
        wz: coords.z,
        nx,
        ny,
        nz,
        areaWeight,
        priority,
        minTier,
        labels: buildOverlayLabelsForCountry(c)
      });
    }

    anchors.sort((a, b) => b.priority - a.priority);
    overlayState.anchors = anchors;
    overlayState.dirty = true;
  }

  function hideAllOverlaySlots() {
    const pool = overlayState.pool;
    for (let i = 0; i < pool.length; i++) {
      const slot = pool[i];
      if (slot.visible) {
        slot.el.style.display = 'none';
        slot.visible = false;
      }
      slot.anchorKey = null;
      slot.lastTx = NaN;
      slot.lastTy = NaN;
    }
    overlayState.slotByKey.clear();
    overlayState.freeSlots.length = 0;
    for (let i = pool.length - 1; i >= 0; i--) {
      overlayState.freeSlots.push(pool[i]);
    }
    overlayState.prevVisibleKeys.clear();
    overlayState.fadeMap.clear();
    if (overlayState.fadeRaf) {
      cancelAnimationFrame(overlayState.fadeRaf);
      overlayState.fadeRaf = 0;
    }
    if (overlayState.settleTimer) {
      clearTimeout(overlayState.settleTimer);
      overlayState.settleTimer = 0;
    }
    setMovingState(false);
  }

  // Called ONLY on UI layout events (resize, panel toggles, drawer open/close/snap) — NEVER per-frame during motion
  function refreshOverlayHudRects() {
    const el = E.elements;
    const isMob = E.utils.isMobileViewport();
    const drawerOpen = Boolean(el.countryDrawer && el.countryDrawer.classList.contains('open'));
    const hudRects = [];

    const addRect = (node) => {
      if (!node) return;
      const r = node.getBoundingClientRect();
      if (r.width > 10 && r.height > 10) {
        hudRects.push([r.left - 6, r.top - 6, r.right + 6, r.bottom + 6]);
      }
    };

    if (!isMob || E.state.isLegendExpandedMobile) {
      addRect(el.floatingLegend);
    }
    if (E.state.isOverlayMenuOpen) {
      addRect(el.mapOverlaysPanel);
    }
    if (E.state.showArcs && !drawerOpen) {
      addRect(el.arcsInfoPanel);
    }
    if (E.state.isQuizActive) {
      addRect(el.quizDock);
    }
    if (E.state.isTimelineOpen) {
      addRect(el.timeScrubberBar);
    }
    if (E.state.activePinItem) {
      addRect(el.pinInspectorCard);
    }
    addRect(el.globeControlsBar);

    let sheetReservedH = 0;
    if (drawerOpen && E.utils.isBottomSheetLayout() && E.drawer && typeof E.drawer.getSheetMetrics === 'function') {
      const m = E.drawer.getSheetMetrics();
      sheetReservedH = E.state.mobileDrawerSnap === 'full'
        ? m.fullH
        : (E.state.mobileDrawerSnap === 'peek' ? m.peekH : m.halfH);
    }

    overlayState.hudRects = hudRects;
    overlayState.hudSheetReservedH = sheetReservedH;
    overlayState.hudInitialized = true;
    overlayState.dirty = true;
  }

  function syncOverlayZoomBadge(tier) {
    if (overlayState.lastZoomTier === tier) return;
    overlayState.lastZoomTier = tier;
    E.state.overlayZoomTier = tier;
    if (!E.elements.overlayZoomBadge) return;
    E.elements.overlayZoomBadge.textContent =
      tier === 2 ? 'Close Detail' : (tier === 1 ? 'Regional View' : 'Global View');
  }

  function computeHysteresisZoomTier(globeScreenR, isMob) {
    const { TIER_THRESHOLDS } = E.config.OVERLAY_CONFIG;
    const th = isMob ? TIER_THRESHOLDS.mobile : TIER_THRESHOLDS.desktop;
    const cur = overlayState.lastZoomTier;

    if (cur < 0) {
      return globeScreenR >= th.t2Enter ? 2 : (globeScreenR >= th.t1Enter ? 1 : 0);
    }
    if (cur === 0) {
      if (globeScreenR >= th.t2Enter) return 2;
      if (globeScreenR >= th.t1Enter) return 1;
      return 0;
    }
    if (cur === 1) {
      if (globeScreenR >= th.t2Enter) return 2;
      if (globeScreenR < th.t1Exit) return 0;
      return 1;
    }
    // cur === 2
    if (globeScreenR < th.t1Exit) return 0;
    if (globeScreenR < th.t2Exit) return 1;
    return 2;
  }

  function markOverlaysDirty(immediate = false) {
    overlayState.dirty = true;
    const globe = E.state.globe;
    if (immediate && globe && globe.camera() && E.renderBatch.merged) {
      updateCountryOverlays(globe.camera(), true);
    }
    if (globe && globe.camera() && E.renderBatch.merged) {
      requestAnimationFrame(() => {
        const cam = E.state.globe ? E.state.globe.camera() : null;
        if (cam) updateCountryOverlays(cam, true);
      });
    }
  }

  function updateCountryOverlays(camera, forceMatrixUpdate = false) {
    if (!overlayState.poolReady || overlayState.anchors.length === 0) return;

    const mode = E.state.mapOverlayMode;
    if (mode === 'off') {
      if (overlayState.dirty) {
        hideAllOverlaySlots();
        overlayState.dirty = false;
      }
      return;
    }

    if (!camera) return;
    const rb = E.renderBatch;
    const vw = rb.viewportW || window.innerWidth;
    const vh = rb.viewportH || window.innerHeight;
    if (vw <= 0 || vh <= 0) return;

    const camX = camera.position.x;
    const camY = camera.position.y;
    const camZ = camera.position.z;
    const qx = camera.quaternion.x;
    const qy = camera.quaternion.y;
    const qz = camera.quaternion.z;
    const qw = camera.quaternion.w;

    const camMoved =
      Math.abs(camX - overlayState.lastCamX) > 1e-4 ||
      Math.abs(camY - overlayState.lastCamY) > 1e-4 ||
      Math.abs(camZ - overlayState.lastCamZ) > 1e-4 ||
      Math.abs(qx - overlayState.lastQx) > 1e-5 ||
      Math.abs(qy - overlayState.lastQy) > 1e-5 ||
      Math.abs(qz - overlayState.lastQz) > 1e-5 ||
      Math.abs(qw - overlayState.lastQw) > 1e-5;

    const viewportChanged = vw !== overlayState.lastW || vh !== overlayState.lastH;

    if (!overlayState.dirty && !camMoved && !viewportChanged) {
      return;
    }

    if (camMoved) {
      setMovingState(true);
      if (overlayState.settleTimer) clearTimeout(overlayState.settleTimer);
      overlayState.settleTimer = setTimeout(settleOverlays, E.config.OVERLAY_CONFIG.SETTLE_MS);
    }

    if (!overlayState.hudInitialized) {
      refreshOverlayHudRects();
    }

    overlayState.dirty = false;
    overlayState.lastCamX = camX;
    overlayState.lastCamY = camY;
    overlayState.lastCamZ = camZ;
    overlayState.lastQx = qx;
    overlayState.lastQy = qy;
    overlayState.lastQz = qz;
    overlayState.lastQw = qw;
    overlayState.lastW = vw;
    overlayState.lastH = vh;
    overlayState.stats.updates++;

    if (forceMatrixUpdate) {
      camera.updateMatrixWorld();
      camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    }

    if (!overlayState.projVec) overlayState.projVec = camera.position.clone();
    const projVec = overlayState.projVec;

    const camDist = Math.hypot(camX, camY, camZ) || 350;
    const ux = camX / camDist;
    const uy = camY / camDist;
    const uz = camZ / camDist;

    const horizonDot = 100.5 / Math.max(101, camDist);
    const minVisibleDot = Math.min(0.92, horizonDot + 0.16);
    const fullVisibleDot = Math.min(0.97, minVisibleDot + 0.15);
    const fadeDenom = Math.max(0.05, fullVisibleDot - minVisibleDot);

    const projScale = (vh * 0.5) / (0.46630766 * Math.max(101, camDist));
    const globeScreenR = 100 * projScale;
    const isMob = E.utils.isMobileViewport();
    const zoomTier = computeHysteresisZoomTier(globeScreenR, isMob);
    syncOverlayZoomBadge(zoomTier);

    const isDetailTier = zoomTier === 2;
    const padX = isDetailTier ? 6 : (zoomTier === 1 ? 8 : 11);
    const padY = isDetailTier ? 5 : (zoomTier === 1 ? 6 : 8);
    const dpr = window.devicePixelRatio || 1;
    const moving = overlayState.isMoving;

    // HUD safe boundaries (uses ONLY cached hudRects/sheetReservedH — zero per-frame reflow)
    const safeTop = isMob ? 116 : 74;
    const safeBottom = isMob ? vh - 76 : vh - 78;
    const drawerEl = E.elements.countryDrawer;
    const drawerOpen = Boolean(drawerEl && drawerEl.classList.contains('open'));
    const safeRight = (drawerOpen && !E.utils.isBottomSheetLayout()) ? Math.max(240, vw - 476) : vw - 10;
    const bottomSheetLimit = (drawerOpen && overlayState.hudSheetReservedH > 0)
      ? Math.min(safeBottom, vh - overlayState.hudSheetReservedH - 8)
      : safeBottom;

    const hudBoxes = overlayState.hudRects;
    const selKey = E.state.selectedCountry ? E.geo.getCountryKey(E.state.selectedCountry) : '';
    const colorBy = E.state.colorByMode || 'language';
    const eraId = E.state.activeTimeEra || 'today';
    const isHistorical = eraId !== 'today' && global.WORLD_HISTORICAL_ERAS;
    const activeSpoken = E.state.activeFilterSpokenCountries;
    const hasSpoken = Boolean(activeSpoken && activeSpoken.size > 0);
    const activeFilterLang = E.state.activeFilterLanguage;
    const activeFilterFam = E.state.activeFilterFamily;
    const activeFilterScr = E.state.activeFilterScript;
    const activeFilterDiv = E.state.activeFilterDiversityTier;
    const anchors = overlayState.anchors;
    const prevVisible = overlayState.prevVisibleKeys;
    const placed = overlayState.placedBoxes;
    placed.length = 0;

    // Gather projected candidates using viewport edge & rank hysteresis
    const candidates = [];
    for (let i = 0; i < anchors.length; i++) {
      const a = anchors[i];
      const isSelected = a.key === selKey;
      let isFiltered = false;
      if (hasSpoken) isFiltered = activeSpoken.has(a.key);
      else if (activeFilterLang) isFiltered = (a.canonLang === activeFilterLang);
      else if (activeFilterFam) isFiltered = (a.familyGroup === activeFilterFam);
      else if (activeFilterScr) isFiltered = (a.scriptGroup === activeFilterScr);
      else if (activeFilterDiv) isFiltered = (a.diversityTier === activeFilterDiv);
      if (!isSelected && !isFiltered && a.minTier > zoomTier) continue;

      const dot = a.nx * ux + a.ny * uy + a.nz * uz;
      if (dot <= minVisibleDot) continue;

      projVec.set(a.wx, a.wy, a.wz).project(camera);
      if (projVec.z < -1 || projVec.z > 1) continue;

      const sx = (projVec.x * 0.5 + 0.5) * vw;
      const sy = (-projVec.y * 0.5 + 0.5) * vh;

      const labelInfo = a.labels[mode] || a.labels.countries;
      const dims = isDetailTier ? labelInfo.c2 : labelInfo.c0;
      const halfW = dims.w * 0.5;
      const halfH = dims.h * 0.5;
      const x0 = sx - halfW;
      const y0 = sy - halfH;
      const x1 = sx + halfW;
      const y1 = sy + halfH;

      const wasVisible = prevVisible.has(a.key);
      const edgePad = wasVisible ? 0 : 4;
      if (x0 < 8 + edgePad || x1 > safeRight - edgePad || y0 < safeTop + edgePad || y1 > bottomSheetLimit - edgePad) {
        continue;
      }

      let blockedByHud = false;
      for (let h = 0; h < hudBoxes.length; h++) {
        const hb = hudBoxes[h];
        if (x0 < hb[2] && x1 > hb[0] && y0 < hb[3] && y1 > hb[1]) {
          blockedByHud = true;
          break;
        }
      }
      if (blockedByHud) continue;

      const opacity = dot >= fullVisibleDot ? 1 : Math.max(0.34, 0.34 + 0.66 * ((dot - minVisibleDot) / fadeDenom));
      const stabilityBoost = wasVisible ? Math.max(25, Math.min(180, a.priority * 0.15)) : 0;
      const rank = a.priority + (isSelected ? 1000000 : 0) + (isFiltered ? 50000 : 0) + stabilityBoost;
      candidates.push({
        a, sx, sy, x0, y0, x1, y1, w: dims.w, h: dims.h,
        opacity, isSelected, isFiltered, wasVisible, labelInfo, rank
      });
    }

    candidates.sort((x, y) => y.rank - x.rank);

    const { MAX_VISIBLE, FADE_MS } = E.config.OVERLAY_CONFIG;
    const pool = overlayState.pool;
    const maxSlots = Math.min(pool.length, (isMob ? MAX_VISIBLE.mobile : MAX_VISIBLE.desktop)[zoomTier]);

    // Collision selection with hysteresis padding
    const chosen = [];
    const chosenKeys = new Set();

    for (let i = 0; i < candidates.length && chosen.length < maxSlots; i++) {
      const cand = candidates[i];
      const pX = cand.wasVisible ? Math.max(2, padX - 2) : (padX + 4);
      const pY = cand.wasVisible ? Math.max(2, padY - 2) : (padY + 4);

      let collides = false;
      for (let p = 0; p < placed.length; p++) {
        const pb = placed[p];
        if (cand.x0 < pb[2] + pX && cand.x1 + pX > pb[0] && cand.y0 < pb[3] + pY && cand.y1 + pY > pb[1]) {
          collides = true;
          break;
        }
      }
      if (collides) continue;

      placed.push([cand.x0, cand.y0, cand.x1, cand.y1]);
      chosen.push(cand);
      chosenKeys.add(cand.a.key);
    }

    // Step 1: Release slots for anchors leaving view BEFORE assigning incoming anchors (0 swaps for persistent pins!)
    for (const [k, slot] of overlayState.slotByKey.entries()) {
      if (!chosenKeys.has(k)) {
        if (slot.visible) {
          slot.el.style.display = 'none';
          slot.visible = false;
        }
        slot.lastKey = k;
        slot.anchorKey = null;
        slot.lastTx = NaN;
        slot.lastTy = NaN;
        overlayState.slotByKey.delete(k);
        overlayState.freeSlots.push(slot);
        overlayState.fadeMap.delete(k);
      }
    }

    // Clean fade entries no longer active
    for (const k of overlayState.fadeMap.keys()) {
      if (!chosenKeys.has(k)) overlayState.fadeMap.delete(k);
    }

    const now = performance.now();
    let needsFadeRaf = false;

    // Step 2: Update persistent slots in-place & assign newly entering anchors to free slots (affinity + FIFO LRU)
    for (let i = 0; i < chosen.length; i++) {
      const cand = chosen[i];
      const key = cand.a.key;

      let slot = overlayState.slotByKey.get(key);
      if (!slot) {
        let reuseIdx = -1;
        for (let f = overlayState.freeSlots.length - 1; f >= 0; f--) {
          if (overlayState.freeSlots[f].lastKey === key) {
            reuseIdx = f;
            break;
          }
        }
        if (reuseIdx >= 0) {
          slot = overlayState.freeSlots.splice(reuseIdx, 1)[0];
        } else {
          slot = overlayState.freeSlots.shift();
        }
        if (!slot) continue;
        if (cand.wasVisible) {
          overlayState.stats.slotSwaps++;
        }
        slot.anchorKey = key;
        slot.lastKey = key;
        slot.lastTx = NaN;
        slot.lastTy = NaN;
        overlayState.slotByKey.set(key, slot);
        if (!cand.wasVisible) {
          overlayState.fadeMap.set(key, now);
        }
      }

      const el = slot.el;
      const showSub = isDetailTier && (isHistorical || Boolean(cand.labelInfo.s));
      const eraState = isHistorical
        ? global.WORLD_HISTORICAL_ERAS.getCountryEraState(cand.a.country, eraId)
        : null;
      const dotColor = eraState
        ? eraState.color
        : (colorBy === 'family'
          ? cand.a.familyColor
          : (colorBy === 'script'
            ? cand.a.scriptColor
            : (colorBy === 'diversity' ? cand.a.diversityColor : cand.a.color)));
      const subText = eraState
        ? eraState.label
        : (showSub ? cand.labelInfo.s : '');
      const sig = `${key}|${mode}|${colorBy}|${eraId}|${zoomTier}|${cand.isSelected ? 1 : 0}|${cand.isFiltered ? 1 : 0}`;
      if (slot.lastSig !== sig) {
        slot.lastSig = sig;
        slot.titleEl.textContent = cand.labelInfo.t;
        slot.subEl.textContent = subText;
        if (slot.lastColor !== dotColor) {
          slot.lastColor = dotColor;
          slot.dotEl.style.background = dotColor;
        }
        el.className =
          'map-overlay-label' +
          (mode === 'countries' ? ' is-countries' : '') +
          ` is-tier-${zoomTier}` +
          (isDetailTier ? ' is-detail' : '') +
          (cand.isSelected ? ' is-selected' : '') +
          (cand.isFiltered ? ' is-filtered' : '');
        el.setAttribute('data-key', key);
        slot.subEl.className = showSub ? 'map-overlay-sub has-sub' : 'map-overlay-sub';
      }

      // Smooth fade-in ramp over FADE_MS for newly appearing anchors
      let fadeFactor = 1;
      const fadeStart = overlayState.fadeMap.get(key);
      if (fadeStart !== undefined) {
        const rawT = Math.min(1, Math.max(0, (now - fadeStart) / FADE_MS));
        if (rawT >= 1) {
          overlayState.fadeMap.delete(key);
          fadeFactor = 1;
        } else {
          const inv = 1 - rawT;
          fadeFactor = 1 - inv * inv * inv; // easeOutCubic
          needsFadeRaf = true;
        }
      }

      const finalOpacity = cand.opacity * fadeFactor;
      const opStr = finalOpacity >= 0.99 ? '1' : finalOpacity.toFixed(2);
      if (slot.lastOpacity !== opStr) {
        slot.lastOpacity = opStr;
        el.style.opacity = opStr;
      }

      // Sub-pixel fluid tracking while moving, DPR pixel-crisp alignment at rest
      const tx = moving ? Math.round(cand.x0 * 100) / 100 : Math.round(cand.x0 * dpr) / dpr;
      const ty = moving ? Math.round(cand.y0 * 100) / 100 : Math.round(cand.y0 * dpr) / dpr;
      if (Number.isNaN(slot.lastTx) || Math.abs(tx - slot.lastTx) > 0.005 || Math.abs(ty - slot.lastTy) > 0.005) {
        slot.lastTx = tx;
        slot.lastTy = ty;
        el.style.transform = moving
          ? `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`
          : `translate3d(${tx}px, ${ty}px, 0)`;
      }

      if (!slot.visible) {
        el.style.display = 'flex';
        slot.visible = true;
      }
    }

    overlayState.prevVisibleKeys = chosenKeys;

    if (needsFadeRaf) {
      scheduleFadeContinuation();
    }
  }

  function getSyncedColorModeForOverlay(overlayMode) {
    if (overlayMode === 'families') return 'family';
    if (overlayMode === 'scripts') return 'script';
    if (overlayMode === 'off') return E.state.colorByMode || 'language';
    return 'language';
  }

  function syncOverlayMenuUI() {
    const el = E.elements;
    const mode = E.state.mapOverlayMode;
    if (el.toggleOverlayMenuBtn) {
      el.toggleOverlayMenuBtn.classList.toggle('active', E.state.isOverlayMenuOpen || mode !== 'off');
      el.toggleOverlayMenuBtn.classList.toggle('has-overlay', mode !== 'off');
      el.toggleOverlayMenuBtn.setAttribute('aria-expanded', E.state.isOverlayMenuOpen ? 'true' : 'false');
    }
    if (el.mapOverlaysPanel) {
      el.mapOverlaysPanel.classList.toggle('open', E.state.isOverlayMenuOpen);
      el.mapOverlaysPanel.setAttribute('aria-hidden', E.state.isOverlayMenuOpen ? 'false' : 'true');
    }
    if (el.overlayModeOptions) {
      el.overlayModeOptions.querySelectorAll('.overlay-mode-btn').forEach(btn => {
        const m = btn.getAttribute('data-overlay');
        const active = m === mode;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-checked', active ? 'true' : 'false');
      });
    }
    if (E.controls && typeof E.controls.syncColorByUI === 'function') {
      E.controls.syncColorByUI();
    }
    refreshOverlayHudRects();
  }

  function setMapOverlayMode(mode, opts = {}) {
    const valid = E.config.OVERLAY_CONFIG.VALID_MODES;
    const nextMode = valid.has(mode) ? mode : 'countries';
    E.state.mapOverlayMode = nextMode;

    if (!opts.skipSync && E.state.colorByAutoSync && nextMode !== 'off' && E.controls && typeof E.controls.setColorByMode === 'function') {
      const targetColor = getSyncedColorModeForOverlay(nextMode);
      if (targetColor !== E.state.colorByMode) {
        E.controls.setColorByMode(targetColor, { fromSync: true, skipRouter: true });
      }
    }

    syncOverlayMenuUI();
    if (nextMode === 'off') hideAllOverlaySlots();
    markOverlaysDirty(true);
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function initMapOverlays() {
    initOverlayPool();
    syncOverlayMenuUI();
    const el = E.elements;

    if (el.toggleOverlayMenuBtn) {
      el.toggleOverlayMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        E.state.isOverlayMenuOpen = !E.state.isOverlayMenuOpen;
        if (E.state.isOverlayMenuOpen) {
          if (E.utils.isMobileViewport() && E.state.isLegendExpandedMobile) {
            E.state.isLegendExpandedMobile = false;
            E.controls.syncLegendResponsiveUI();
          }
          if (E.utils.isMobileViewport() && E.state.showArcs && el.arcsInfoPanel) {
            E.state.isArcsPanelCollapsed = true;
            el.arcsInfoPanel.classList.add('collapsed');
            if (el.arcsToggleCollapseBtn) el.arcsToggleCollapseBtn.setAttribute('aria-expanded', 'false');
          }
        }
        syncOverlayMenuUI();
        markOverlaysDirty(true);
      });
    }

    if (el.overlayModeOptions) {
      el.overlayModeOptions.querySelectorAll('.overlay-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const mode = btn.getAttribute('data-overlay');
          setMapOverlayMode(mode);
          if (E.utils.isMobileViewport()) {
            E.state.isOverlayMenuOpen = false;
            syncOverlayMenuUI();
            markOverlaysDirty(true);
          }
        });
      });
    }

    document.addEventListener('click', (e) => {
      if (!E.state.isOverlayMenuOpen) return;
      if (
        el.mapOverlaysPanel &&
        !el.mapOverlaysPanel.contains(e.target) &&
        (!el.toggleOverlayMenuBtn || !el.toggleOverlayMenuBtn.contains(e.target))
      ) {
        E.state.isOverlayMenuOpen = false;
        syncOverlayMenuUI();
        markOverlaysDirty(true);
      }
    });
  }

  function getDebugStats() {
    return {
      activeCount: overlayState.slotByKey.size,
      freeCount: overlayState.freeSlots.length,
      poolSize: overlayState.pool.length,
      zoomTier: overlayState.lastZoomTier,
      isMoving: overlayState.isMoving,
      hudRects: overlayState.hudRects.length,
      slotSwaps: overlayState.stats.slotSwaps,
      updates: overlayState.stats.updates,
      activeAssignments: Array.from(overlayState.slotByKey.entries()).map(([key, slot]) => ({ key, slotId: slot.id }))
    };
  }

  E.overlays = {
    overlayState,
    initOverlayPool,
    buildOverlayAnchors,
    hideAllOverlaySlots,
    refreshOverlayHudRects,
    syncOverlayZoomBadge,
    markOverlaysDirty,
    updateCountryOverlays,
    getSyncedColorModeForOverlay,
    syncOverlayMenuUI,
    setMapOverlayMode,
    initMapOverlays,
    getDebugStats
  };
})(window);

