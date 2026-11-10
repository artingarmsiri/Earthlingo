// src/globe/arcs.js - Animated Language Family Origin & Migration Arcs Explorer
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  function applyArcMeshProps() {
    const globe = E.state.globe;
    if (!globe || !E.state.showArcs) return;
    const scene = globe.scene();
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
    const { calcAngularDistRad, mixColorHex } = E.utils;
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
    const ORIGINS = global.WORLD_ORIGINS;
    if (!ORIGINS || !langName) return null;
    if (typeof ORIGINS.resolveLanguageOrigin === 'function') {
      return ORIGINS.resolveLanguageOrigin(langName);
    }
    return null;
  }

  function flyToCorridorCamera(cam) {
    const globe = E.state.globe;
    if (!globe || !cam) return;
    E.state.pendingZoomAlt = null;
    const controls = globe.controls();
    if (controls) controls.autoRotate = false;
    const scale = Math.max(1, E.utils.getDefaultAltitude() / 2.5);
    const alt = Math.min(5.0, (cam.altitude || 2.5) * (E.utils.isMobileViewport() ? Math.min(1.55, scale) : 1));
    globe.pointOfView({ lat: cam.lat, lng: cam.lng, altitude: alt }, E.config.GLOBE_CONFIG.CORRIDOR_FLY_MS);
    if (E.state.isRotating && controls) {
      setTimeout(() => {
        if (E.state.isRotating) controls.autoRotate = true;
      }, 700);
    }
  }

  function frameCountryOriginCamera(country, origin) {
    const globe = E.state.globe;
    if (!globe || !country || !country.centroid) return;
    const controls = globe.controls();
    if (controls) controls.autoRotate = false;
    const [destLng, destLat] = country.centroid;
    let targetLng = destLng;
    let targetLat = destLat;
    let alt = Math.max(E.utils.getSelectAltitude(), E.utils.isMobileViewport() ? 2.65 : 2.35);

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
      alt = Math.max(E.utils.getSelectAltitude() + 0.35, Math.min(3.5, (E.utils.isMobileViewport() ? 2.35 : 1.95) + span / 62));
    }

    if (E.utils.isBottomSheetLayout()) {
      targetLat = Math.max(-72, Math.min(72, targetLat - 16));
    } else {
      targetLat = Math.max(-72, Math.min(72, targetLat));
    }

    globe.pointOfView({ lat: targetLat, lng: targetLng, altitude: alt }, E.config.GLOBE_CONFIG.CORRIDOR_FLY_MS);
  }

  function parseRouteStartYearCE(labelOrEra) {
    if (typeof labelOrEra === 'number' && Number.isFinite(labelOrEra)) return labelOrEra;
    const s = String(labelOrEra || '').trim();
    if (!s) return -3000;
    const bceMatch = s.match(/(\d+)\s*BCE/i);
    if (bceMatch) return -parseInt(bceMatch[1], 10);
    const milBce = s.match(/(\d+)(?:st|nd|rd|th)\s+mil\.\s*BCE/i);
    if (milBce) return -parseInt(milBce[1], 10) * 1000;
    const centCe = s.match(/(\d+)(?:st|nd|rd|th)(?:\s*[–-]\s*\d+(?:st|nd|rd|th))?\s*c\.\s*CE/i);
    if (centCe) return (parseInt(centCe[1], 10) - 1) * 100;
    const ceNum = s.match(/(\d{3,4})\+?\s*(?:[–-]\s*\d+\s*)?CE/i);
    if (ceNum) return parseInt(ceNum[1], 10);
    const milCe = s.match(/(\d+)(?:st|nd|rd|th)\s+mil\.\s*CE/i);
    if (milCe) return (parseInt(milCe[1], 10) - 1) * 1000;
    return -3000;
  }

  function getActiveMaxYearCE() {
    const eraId = E.state.activeTimeEra || 'today';
    if (eraId === 'today' || !global.WORLD_HISTORICAL_ERAS) return Infinity;
    const era = (global.WORLD_HISTORICAL_ERAS.ERAS || []).find(x => x.id === eraId);
    return era ? era.maxYearCE : Infinity;
  }

  function setArcTab(tab) {
    const next = tab === 'words' ? 'words' : 'origins';
    E.state.activeArcTab = next;
    E.state.isArcsPanelCollapsed = false;
    if (next !== 'words') {
      E.state.activeWordStopId = null;
      if (E.pins && E.state.activePinItem) E.pins.closePinInspector();
    }
    updateArcs();
    syncDrawerOriginButton();
    if (next === 'words' && global.WORLD_ETYMOLOGY) {
      const wr = global.WORLD_ETYMOLOGY[E.state.activeWordRoute || 'tea'];
      if (wr && wr.camera) flyToCorridorCamera(wr.camera);
    } else if (next === 'origins' && global.WORLD_ORIGINS && global.WORLD_ORIGINS.corridors) {
      const cor = global.WORLD_ORIGINS.corridors[E.state.activeOriginCorridor || 'all'];
      if (cor && cor.camera) flyToCorridorCamera(cor.camera);
    }
    if (E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function setWordRoute(wordId) {
    const ETYM = global.WORLD_ETYMOLOGY || {};
    if (!ETYM[wordId]) return;
    E.state.activeArcTab = 'words';
    E.state.activeWordRoute = wordId;
    E.state.activeWordStopId = null;
    E.state.isArcsPanelCollapsed = false;
    if (!E.state.showArcs) {
      E.state.showArcs = true;
      if (E.elements.toggleArcsBtn) E.elements.toggleArcsBtn.classList.add('active');
    }
    updateArcs();
    const wr = ETYM[wordId];
    if (wr && wr.camera) flyToCorridorCamera(wr.camera);
    if (E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function buildWordRouteRings(route, selectedStopId) {
    const rings = [];
    if (route && route.stops && route.stops.length > 0) {
      const originStop = route.stops[0];
      rings.push({ lat: originStop.lat, lng: originStop.lng, color: route.color || '#f59e0b', radius: 6.2 });
      if (selectedStopId) {
        const selStop = route.stops.find(s => s.id === selectedStopId);
        if (selStop && selStop !== originStop) {
          rings.push({ lat: selStop.lat, lng: selStop.lng, color: '#ffffff', radius: 5.2 });
        }
      }
    }
    return rings;
  }

  function selectWordStop(stopId) {
    const ETYM = global.WORLD_ETYMOLOGY || {};
    const route = ETYM[E.state.activeWordRoute || 'tea'];
    if (!route || !route.stops) return;
    const stop = route.stops.find(s => s.id === stopId);
    if (!stop) return;
    E.state.activeWordStopId = stop.id;
    const globe = E.state.globe;
    if (globe) {
      const controls = globe.controls();
      if (controls) controls.autoRotate = false;
      const alt = Math.max(E.utils.getSelectAltitude(), 1.85);
      globe.pointOfView({ lat: stop.lat, lng: stop.lng, altitude: alt }, 520);
      globe.ringsData(buildWordRouteRings(route, stop.id));
    }
    if (E.elements.arcsInfoBody) {
      E.elements.arcsInfoBody.querySelectorAll('.word-stop-btn').forEach(btn => {
        const active = btn.getAttribute('data-stop-id') === stop.id;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    if (E.pins) {
      E.pins.openPinInspector({
        __isPin: true,
        kind: 'word',
        item: stop,
        routeId: route.id,
        routeLabel: route.label
      });
    }
  }

  function syncDrawerOriginButton() {
    const animBtn = document.getElementById('animateCountryOriginBtn');
    if (!animBtn) return;
    const isActive = Boolean(E.state.showArcs && E.state.selectedCountry && E.state.activeOriginCorridor === 'country');
    animBtn.classList.toggle('active', isActive);
    const labelSpan = animBtn.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent = isActive ? 'Animating Origin Arcs (Click to Hide)' : 'Animate Origin Arcs on Globe';
    }
  }

  function renderArcsInfoPanel(mode, payload) {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    const panel = el.arcsInfoPanel;
    if (!panel) return;
    if (!E.state.showArcs) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      E.overlays.refreshOverlayHudRects();
      return;
    }

    panel.classList.add('open');
    panel.classList.toggle('collapsed', E.state.isArcsPanelCollapsed);
    panel.setAttribute('aria-hidden', 'false');
    if (el.arcsToggleCollapseBtn) {
      el.arcsToggleCollapseBtn.setAttribute('aria-expanded', E.state.isArcsPanelCollapsed ? 'false' : 'true');
    }

    const isWordsTab = E.state.activeArcTab === 'words';
    if (el.arcsTabOriginsBtn) {
      el.arcsTabOriginsBtn.classList.toggle('active', !isWordsTab);
      el.arcsTabOriginsBtn.setAttribute('aria-selected', !isWordsTab ? 'true' : 'false');
    }
    if (el.arcsTabWordsBtn) {
      el.arcsTabWordsBtn.classList.toggle('active', isWordsTab);
      el.arcsTabWordsBtn.setAttribute('aria-selected', isWordsTab ? 'true' : 'false');
    }
    if (el.arcCorridorChips) el.arcCorridorChips.hidden = isWordsTab;
    if (el.wordRouteChips) el.wordRouteChips.hidden = !isWordsTab;

    const ORIGINS = global.WORLD_ORIGINS;
    const corridors = (ORIGINS && ORIGINS.corridors) || {};
    const chips = [];
    if (E.state.selectedCountry) {
      chips.push({
        id: 'country',
        label: `${E.state.selectedCountry.flag || ''} ${E.state.selectedCountry.name}`.trim(),
        color: E.state.selectedCountry.color || '#38bdf8'
      });
    }
    if (E.state.activeFilterLanguage) {
      chips.push({
        id: 'filter',
        label: `Filter: ${E.state.activeFilterLanguage}`,
        color: E.state.activeFilterColor || '#38bdf8'
      });
    }
    const order = ['all', 'indo-european', 'austronesian', 'bantu', 'afroasiatic', 'turkic', 'sino-tibetan', 'uralic', 'se-asia', 'americas'];
    for (const id of order) {
      const cor = corridors[id];
      if (cor) chips.push({ id, label: cor.shortLabel || cor.title, color: cor.color || '#38bdf8' });
    }

    if (el.arcCorridorChips && !isWordsTab) {
      el.arcCorridorChips.innerHTML = chips.map(ch => `
        <button type="button" class="arc-corridor-chip ${ch.id === E.state.activeOriginCorridor ? 'active' : ''}" data-corridor="${escapeHtml(ch.id)}" role="tab" aria-selected="${ch.id === E.state.activeOriginCorridor ? 'true' : 'false'}">
          <span class="legend-dot" style="background:${ch.color};"></span>
          <span>${escapeHtml(ch.label)}</span>
        </button>
      `).join('');
    }

    if (el.wordRouteChips && isWordsTab && global.WORLD_ETYMOLOGY) {
      const wordOrder = ['tea', 'coffee', 'sugar', 'orange', 'zero', 'mother'];
      el.wordRouteChips.innerHTML = wordOrder.map(id => {
        const wr = global.WORLD_ETYMOLOGY[id];
        if (!wr) return '';
        const act = id === E.state.activeWordRoute;
        return `
          <button type="button" class="arc-corridor-chip ${act ? 'active' : ''}" data-word-route="${escapeHtml(id)}" role="tab" aria-selected="${act ? 'true' : 'false'}">
            <span class="legend-dot" style="background:${escapeHtml(wr.color || '#f59e0b')};"></span>
            <span>${escapeHtml(wr.label)}</span>
          </button>
        `;
      }).join('');
    }

    const accentColor = (payload && payload.color) || '#f59e0b';
    if (el.arcsLiveDot) {
      el.arcsLiveDot.style.background = accentColor;
      el.arcsLiveDot.style.boxShadow = `0 0 8px ${accentColor}`;
    }
    if (el.arcsPanelTitle) {
      el.arcsPanelTitle.textContent = mode === 'word' && payload
        ? `Word Route • ${payload.label}`
        : mode === 'filter'
          ? `Origin & Diffusion • ${E.state.activeFilterLanguage}`
          : mode === 'country' && E.state.selectedCountry
            ? `Origin • ${E.state.selectedCountry.name}`
            : 'Family Origin & Migration';
    }

    if (!el.arcsInfoBody || !payload) {
      E.overlays.refreshOverlayHudRects();
      return;
    }

    if (mode === 'word') {
      const branchesHtml = (payload.branches || []).map(br => `
        <span class="word-branch-pill">
          <span class="legend-dot" style="background:${escapeHtml(br.color)};"></span>
          <span>${escapeHtml(br.label)}</span>
        </span>
      `).join('');

      const stopsHtml = (payload.stops || []).map(st => {
        const isAct = E.state.activeWordStopId === st.id;
        return `
          <button type="button" class="word-stop-btn ${isAct ? 'active' : ''}" data-stop-id="${escapeHtml(st.id)}" aria-pressed="${isAct ? 'true' : 'false'}">
            <span class="word-stop-word">${escapeHtml(st.word)}</span>
            <span class="word-stop-meta">${escapeHtml(st.country)} • ${escapeHtml(st.era)}</span>
          </button>
        `;
      }).join('');

      el.arcsInfoBody.innerHTML = `
        <div class="arcs-route-title">${escapeHtml(payload.subtitle || payload.label)}</div>
        <div class="arcs-meta-grid">
          <div class="arcs-meta-pill">
            <span class="arcs-meta-label">Earliest Etymon</span>
            <strong>${escapeHtml(payload.etymon || '')}</strong>
          </div>
          <div class="arcs-meta-pill">
            <span class="arcs-meta-label">Origin Hearth</span>
            ${escapeHtml(payload.originHub || '')}
          </div>
        </div>
        <div class="word-branches-bar">${branchesHtml}</div>
        <p class="arcs-summary-text">${escapeHtml(payload.summary || '')}</p>
        <div class="word-stops-label">Click any stop or globe beacon to inspect:</div>
        <div class="word-stops-grid">${stopsHtml}</div>
        <div class="arcs-legend-strip">
          <span>Click stop to fly camera &amp; compare cognates</span>
          <span>${payload.routeCount || 0} animated hop${payload.routeCount === 1 ? '' : 's'}</span>
        </div>
      `;

      E.overlays.refreshOverlayHudRects();
      return;
    }

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

    el.arcsInfoBody.innerHTML = `
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
    E.overlays.refreshOverlayHudRects();
  }

  function updateArcs() {
    const globe = E.state.globe;
    if (!globe) return;
    const ORIGINS = global.WORLD_ORIGINS;
    if (!E.state.showArcs) {
      globe.arcsData([]);
      globe.ringsData([]);
      renderArcsInfoPanel('hidden', null);
      if (E.pins) E.pins.refreshPins();
      return;
    }

    const arcs = [];
    const rings = [];
    let panelMode = 'corridor';
    let panelPayload = null;
    const maxYearCE = getActiveMaxYearCE();

    if (E.state.activeArcTab === 'words' && global.WORLD_ETYMOLOGY) {
      const ETYM = global.WORLD_ETYMOLOGY;
      const wid = ETYM[E.state.activeWordRoute] ? E.state.activeWordRoute : 'tea';
      E.state.activeWordRoute = wid;
      const wr = ETYM[wid];

      (wr.corridors || []).forEach((rt, idx) => {
        if (rt.eraYearCE != null && rt.eraYearCE > maxYearCE) return;
        addAnimatedRoutePair(arcs, {
          from: rt.from,
          to: rt.to,
          originColor: rt.originColor || wr.color,
          destColor: rt.destColor || wr.color,
          wave: rt.wave || 1,
          index: idx,
          isPrimary: rt.isPrimary !== false
        });
      });

      const wordRings = buildWordRouteRings(wr, E.state.activeWordStopId);
      for (let i = 0; i < wordRings.length; i++) rings.push(wordRings[i]);

      panelMode = 'word';
      panelPayload = {
        ...wr,
        routeCount: arcs.filter(a => a._arcRole === 'pulse').length
      };

      globe.arcsData(arcs);
      globe.ringsData(rings);
      requestAnimationFrame(() => {
        applyArcMeshProps();
        requestAnimationFrame(applyArcMeshProps);
      });
      renderArcsInfoPanel(panelMode, panelPayload);
      if (E.pins) E.pins.refreshPins();
      return;
    }

    if (E.state.activeOriginCorridor === 'country' && E.state.selectedCountry && ORIGINS) {
      const src = E.state.selectedCountry;
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

      if (maxYearCE >= 1500 && dest && E.config.ARC_EXPORTERS.has((src.iso3 || '').toUpperCase())) {
        const canon = (src.canonicalLanguage || src.primaryLanguage || '').toLowerCase();
        let addedOut = 0;
        for (const c of E.state.countriesList) {
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
    } else if (E.state.activeOriginCorridor === 'filter' && E.state.activeFilterLanguage) {
      const lang = E.state.activeFilterLanguage;
      const langLower = lang.toLowerCase();
      const matching = E.state.countriesList.filter(
        c => c.centroid && (c.canonicalLanguage || c.primaryLanguage || '').toLowerCase() === langLower
      );
      const seed = getLanguageOriginSeed(lang);
      const filterColor = E.state.activeFilterColor || (matching[0] && matching[0].color) || '#38bdf8';

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
      const cid = ORIGINS.corridors[E.state.activeOriginCorridor] ? E.state.activeOriginCorridor : 'all';
      E.state.activeOriginCorridor = cid;
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
          if (maxYearCE < Infinity && parseRouteStartYearCE(rt.label) > maxYearCE) return;
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
        routeCount: arcs.filter(a => a._arcRole === 'pulse').length
      };
    }

    globe.arcsData(arcs);
    globe.ringsData(rings);
    requestAnimationFrame(() => {
      applyArcMeshProps();
      requestAnimationFrame(applyArcMeshProps);
    });
    renderArcsInfoPanel(panelMode, panelPayload);
    if (E.pins) E.pins.refreshPins();
  }

  let arcsEventsBound = false;

  function initArcs() {
    if (arcsEventsBound) return;
    arcsEventsBound = true;
    const el = E.elements;

    if (el.arcCorridorChips) {
      el.arcCorridorChips.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('.arc-corridor-chip[data-corridor]');
        if (!btn) return;
        const cid = btn.getAttribute('data-corridor');
        if (!cid) return;
        E.state.activeOriginCorridor = cid;
        E.state.isArcsPanelCollapsed = false;
        updateArcs();
        const ORIGINS = global.WORLD_ORIGINS;
        const corridors = (ORIGINS && ORIGINS.corridors) || {};
        const cor = corridors[cid];
        if (cor && cor.camera) {
          flyToCorridorCamera(cor.camera);
        } else if (cid === 'country' && E.state.selectedCountry && ORIGINS) {
          frameCountryOriginCamera(E.state.selectedCountry, ORIGINS.resolveCountryOrigin(E.state.selectedCountry));
        }
        syncDrawerOriginButton();
        if (E.router && typeof E.router.syncUrlHash === 'function') {
          E.router.syncUrlHash();
        }
      });
    }

    if (el.wordRouteChips) {
      el.wordRouteChips.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('.arc-corridor-chip[data-word-route]');
        if (!btn) return;
        const wid = btn.getAttribute('data-word-route');
        if (wid) setWordRoute(wid);
      });
    }

    if (el.arcsInfoBody) {
      el.arcsInfoBody.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('.word-stop-btn[data-stop-id]');
        if (!btn) return;
        selectWordStop(btn.getAttribute('data-stop-id'));
      });
    }
  }

  E.arcs = {
    applyArcMeshProps,
    addAnimatedRoutePair,
    getLanguageOriginSeed,
    flyToCorridorCamera,
    frameCountryOriginCamera,
    setArcTab,
    setWordRoute,
    selectWordStop,
    syncDrawerOriginButton,
    renderArcsInfoPanel,
    updateArcs,
    initArcs
  };
})(window);

