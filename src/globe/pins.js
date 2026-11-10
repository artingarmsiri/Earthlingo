// src/globe/pins.js - Single-Draw-Call 3D Globe Beacon Pins (Endangered Hotspots & Word-Route Stops)
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  const MAX_PINS = 64;
  const P_SEGS = 22;
  const TRIS_PER_PIN = P_SEGS * 5;
  const VERTS_PER_PIN = 1 + P_SEGS * 5;

  const pinState = {
    mesh: null,
    posArr: null,
    colArr: null,
    activePins: [],
    initialized: false
  };

  function buildActivePinList() {
    const list = [];
    if (E.state.showEndangeredPins && global.WORLD_HISTORICAL_ERAS && Array.isArray(global.WORLD_HISTORICAL_ERAS.ENDANGERED_HOTSPOTS)) {
      const spots = global.WORLD_HISTORICAL_ERAS.ENDANGERED_HOTSPOTS;
      for (let i = 0; i < spots.length; i++) {
        list.push({ kind: 'endangered', item: spots[i] });
      }
    }
    if (E.state.showArcs && E.state.activeArcTab === 'words' && global.WORLD_ETYMOLOGY) {
      const route = global.WORLD_ETYMOLOGY[E.state.activeWordRoute || 'tea'];
      if (route && Array.isArray(route.stops)) {
        for (let i = 0; i < route.stops.length; i++) {
          list.push({ kind: 'word', item: route.stops[i], routeId: route.id, routeLabel: route.label });
        }
      }
    }
    return list;
  }

  function initPins(container, BufferGeoCtor, BufferAttrCtor, MeshCtor, sampleCapMat) {
    if (pinState.initialized || !container) return;

    const posArr = new Float32Array(MAX_PINS * VERTS_PER_PIN * 3);
    const colArr = new Float32Array(MAX_PINS * VERTS_PER_PIN * 3);
    const idxArr = new Uint32Array(MAX_PINS * TRIS_PER_PIN * 3);

    for (let i = 0; i < MAX_PINS; i++) {
      const vStart = i * VERTS_PER_PIN;
      const baseCenter = vStart;
      const baseDiscRim = vStart + 1;
      const baseCollarIn = vStart + 1 + P_SEGS;
      const baseCollarOut = vStart + 1 + P_SEGS * 2;
      const baseRimIn = vStart + 1 + P_SEGS * 3;
      const baseRimOut = vStart + 1 + P_SEGS * 4;
      let idxOut = i * TRIS_PER_PIN * 3;

      for (let s = 0; s < P_SEGS; s++) {
        const sNext = (s + 1) % P_SEGS;
        idxArr[idxOut++] = baseCenter;
        idxArr[idxOut++] = baseDiscRim + s;
        idxArr[idxOut++] = baseDiscRim + sNext;

        idxArr[idxOut++] = baseCollarIn + s;
        idxArr[idxOut++] = baseCollarOut + s;
        idxArr[idxOut++] = baseCollarOut + sNext;
        idxArr[idxOut++] = baseCollarIn + s;
        idxArr[idxOut++] = baseCollarOut + sNext;
        idxArr[idxOut++] = baseCollarIn + sNext;

        idxArr[idxOut++] = baseRimIn + s;
        idxArr[idxOut++] = baseRimOut + s;
        idxArr[idxOut++] = baseRimOut + sNext;
        idxArr[idxOut++] = baseRimIn + s;
        idxArr[idxOut++] = baseRimOut + sNext;
        idxArr[idxOut++] = baseRimIn + sNext;
      }
    }

    const geo = new BufferGeoCtor();
    geo.setAttribute('position', new BufferAttrCtor(posArr, 3));
    geo.setAttribute('color', new BufferAttrCtor(colArr, 3));
    geo.setIndex(new BufferAttrCtor(idxArr, 1));
    geo.setDrawRange(0, 0);

    const mat = sampleCapMat.clone();
    mat.color.setHex(0xffffff);
    mat.vertexColors = true;
    mat.side = 0;
    mat.transparent = false;
    mat.opacity = 1;
    mat.depthWrite = true;
    mat.polygonOffset = true;
    mat.polygonOffsetFactor = -3.0;
    mat.polygonOffsetUnits = -6.0;

    const mesh = new MeshCtor(geo, mat);
    mesh.raycast = () => {};
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    mesh.visible = false;
    container.add(mesh);

    pinState.mesh = mesh;
    pinState.posArr = posArr;
    pinState.colArr = colArr;
    pinState.initialized = true;

    refreshPins();
  }

  function refreshPins() {
    const pins = buildActivePinList();
    pinState.activePins = pins;

    if (!pinState.initialized || !pinState.mesh || !E.state.globe) return;
    const count = Math.min(MAX_PINS, pins.length);
    if (count === 0) {
      pinState.mesh.visible = false;
      pinState.mesh.geometry.setDrawRange(0, 0);
      return;
    }

    const globe = E.state.globe;
    const { hexToLinearRgb, srgbToLinear } = E.utils;
    const posArr = pinState.posArr;
    const colArr = pinState.colArr;

    const colR = srgbToLinear(6 / 255);
    const colG = srgbToLinear(10 / 255);
    const colB = srgbToLinear(18 / 255);

    const selectedId = (E.state.activePinItem && E.state.activePinItem.id) || E.state.activeWordStopId || '';

    for (let i = 0; i < count; i++) {
      const p = pins[i];
      const item = p.item;
      const isSelected = selectedId && item.id === selectedId;
      const coords = globe.getCoords(item.lat, item.lng, isSelected ? 0.0068 : 0.0056);
      const px = coords.x, py = coords.y, pz = coords.z;
      const pLen = Math.hypot(px, py, pz) || 100.56;
      const nx = px / pLen, ny = py / pLen, nz = pz / pLen;

      let tx = nz, ty = 0, tz = -nx;
      const tLen = Math.hypot(tx, tz) || 1;
      tx /= tLen; tz /= tLen;
      const bx = ny * tz - nz * ty;
      const by = nz * tx - nx * tz;
      const bz = nx * ty - ny * tx;

      const scale = p.kind === 'word' ? (isSelected ? 1.48 : 1.24) : (isSelected ? 1.42 : 1.08);
      const r1 = 0.56 * scale;
      const r2 = 0.72 * scale;
      const r3 = 0.90 * scale;

      const vStart = i * VERTS_PER_PIN;
      posArr[vStart * 3] = px; posArr[vStart * 3 + 1] = py; posArr[vStart * 3 + 2] = pz;

      const baseDiscRim = vStart + 1;
      const baseCollarIn = vStart + 1 + P_SEGS;
      const baseCollarOut = vStart + 1 + P_SEGS * 2;
      const baseRimIn = vStart + 1 + P_SEGS * 3;
      const baseRimOut = vStart + 1 + P_SEGS * 4;

      const writePos = (idx, rad, cs, sn) => {
        const dx = (tx * cs + bx * sn) * rad;
        const dy = (ty * cs + by * sn) * rad;
        const dz = (tz * cs + bz * sn) * rad;
        const o = idx * 3;
        posArr[o] = px + dx; posArr[o + 1] = py + dy; posArr[o + 2] = pz + dz;
      };

      for (let s = 0; s < P_SEGS; s++) {
        const th = (s / P_SEGS) * Math.PI * 2;
        const cs = Math.cos(th), sn = Math.sin(th);
        writePos(baseDiscRim + s, r1, cs, sn);
        writePos(baseCollarIn + s, r1, cs, sn);
        writePos(baseCollarOut + s, r2, cs, sn);
        writePos(baseRimIn + s, r2, cs, sn);
        writePos(baseRimOut + s, r3, cs, sn);
      }

      const rgb = hexToLinearRgb(item.color || '#f59e0b');
      const rimRgb = isSelected
        ? [1, 1, 1]
        : [rgb[0] * 0.45 + 0.55, rgb[1] * 0.45 + 0.55, rgb[2] * 0.45 + 0.55];

      colArr[vStart * 3] = rgb[0]; colArr[vStart * 3 + 1] = rgb[1]; colArr[vStart * 3 + 2] = rgb[2];
      for (let s = 0; s < P_SEGS; s++) {
        const dIdx = (baseDiscRim + s) * 3;
        colArr[dIdx] = rgb[0]; colArr[dIdx + 1] = rgb[1]; colArr[dIdx + 2] = rgb[2];

        const ciIdx = (baseCollarIn + s) * 3;
        const coIdx = (baseCollarOut + s) * 3;
        colArr[ciIdx] = colR; colArr[ciIdx + 1] = colG; colArr[ciIdx + 2] = colB;
        colArr[coIdx] = colR; colArr[coIdx + 1] = colG; colArr[coIdx + 2] = colB;

        const riIdx = (baseRimIn + s) * 3;
        const roIdx = (baseRimOut + s) * 3;
        colArr[riIdx] = rimRgb[0]; colArr[riIdx + 1] = rimRgb[1]; colArr[riIdx + 2] = rimRgb[2];
        colArr[roIdx] = rimRgb[0]; colArr[roIdx + 1] = rimRgb[1]; colArr[roIdx + 2] = rimRgb[2];
      }
    }

    const geo = pinState.mesh.geometry;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.setDrawRange(0, count * TRIS_PER_PIN * 3);
    geo.computeBoundingSphere();
    pinState.mesh.visible = true;
  }

  function pickPinAtLatLng(lat, lng, povAlt, isTouch) {
    const pins = pinState.activePins;
    if (!pins || pins.length === 0) return null;
    const touchBoost = isTouch ? 1.42 : 1.05;
    const threshDeg = Math.max(0.75, Math.min(3.4, 1.35 * Math.sqrt(povAlt) * 0.72 * touchBoost));
    const cosLat = Math.max(0.15, Math.cos((lat * Math.PI) / 180));
    let best = null;
    let bestDistSq = threshDeg * threshDeg;

    for (let i = 0; i < pins.length; i++) {
      const p = pins[i];
      const item = p.item;
      const dLat = lat - item.lat;
      let dLng = lng - item.lng;
      if (dLng > 180) dLng -= 360;
      if (dLng < -180) dLng += 360;
      dLng *= cosLat;
      const dSq = dLat * dLat + dLng * dLng;
      if (dSq <= bestDistSq) {
        bestDistSq = dSq;
        best = p;
      }
    }
    return best ? { __isPin: true, kind: best.kind, item: best.item, routeId: best.routeId, routeLabel: best.routeLabel } : null;
  }

  function openCountryFromIso(iso3) {
    if (!iso3 || !E.state.languagesDb) return;
    const c = E.state.languagesDb[iso3.toUpperCase()];
    if (c && E.drawer) {
      closePinInspector();
      E.drawer.selectCountry(c, true);
    }
  }

  function openPinInspector(pinObj) {
    if (!pinObj || !pinObj.item) return;
    const card = E.elements.pinInspectorCard;
    const body = E.elements.pinInspectorBody;
    if (!card || !body) return;
    const { escapeHtml } = E.utils;
    const item = pinObj.item;

    E.state.activePinItem = item;
    if (pinObj.kind === 'word') {
      E.state.activeWordStopId = item.id;
    }

    if (pinObj.kind === 'endangered') {
      body.innerHTML = `
        <div class="pin-inspector-kicker" style="color:${escapeHtml(item.color || '#ef4444')};">Endangered Language Hotspot</div>
        <div class="pin-inspector-title">${escapeHtml(item.name)}</div>
        <div class="pin-inspector-native">${escapeHtml(item.endonym || '')}</div>
        <div class="pin-inspector-meta">
          <span class="pin-status-badge" style="border-color:${escapeHtml(item.color || '#ef4444')};color:${escapeHtml(item.color || '#fca5a5')};">${escapeHtml(item.status)}</span>
          <span>${escapeHtml(item.countryName || '')}</span>
          <span>• ${escapeHtml(item.family || '')}</span>
        </div>
        <div class="pin-inspector-stats">
          <div><span class="pin-stat-lbl">Speakers:</span> ${escapeHtml(item.speakers || '')}</div>
          ${item.samplePhrase ? `<div><span class="pin-stat-lbl">Voice / Note:</span> <strong>${escapeHtml(item.samplePhrase)}</strong> <span class="pin-phonetic">(${escapeHtml(item.phonetic || '')})</span></div>` : ''}
        </div>
        <p class="pin-inspector-note">${escapeHtml(item.revitalizationNote || '')}</p>
        <div class="pin-inspector-actions">
          <button type="button" class="pin-action-btn" id="pinOpenCountryBtn">Open ${escapeHtml(item.iso3 || 'Country')} Profile</button>
        </div>
      `;
    } else {
      const route = global.WORLD_ETYMOLOGY && global.WORLD_ETYMOLOGY[pinObj.routeId || E.state.activeWordRoute];
      const branchObj = route && (route.branches || []).find(b => b.id === item.branch);
      const branchLabel = branchObj ? branchObj.label : (route ? route.label : 'Word Route');
      body.innerHTML = `
        <div class="pin-inspector-kicker" style="color:${escapeHtml(item.color || '#f59e0b')};">${escapeHtml(route ? route.label : 'Word Route')} • ${escapeHtml(item.era || '')}</div>
        <div class="pin-inspector-title">${escapeHtml(item.country || '')} — “${escapeHtml(item.word || '')}”</div>
        <div class="pin-inspector-native">${escapeHtml(item.nativeScript || '')} <span class="pin-phonetic">[${escapeHtml(item.phonetic || '')}]</span></div>
        <div class="pin-inspector-meta">
          <span class="pin-status-badge" style="border-color:${escapeHtml(item.color || '#f59e0b')};color:${escapeHtml(item.color || '#fde68a')};">${escapeHtml(branchLabel)}</span>
        </div>
        <p class="pin-inspector-note">${escapeHtml(item.note || '')}</p>
        <div class="pin-inspector-actions">
          <button type="button" class="pin-action-btn" id="pinOpenCountryBtn">Open ${escapeHtml(item.iso3 || 'Country')} Profile</button>
        </div>
      `;
    }

    card.classList.add('open');
    card.setAttribute('aria-hidden', 'false');

    const btn = document.getElementById('pinOpenCountryBtn');
    if (btn) {
      btn.addEventListener('click', () => openCountryFromIso(item.iso3));
    }

    refreshPins();
    if (E.overlays) {
      E.overlays.refreshOverlayHudRects();
      E.overlays.markOverlaysDirty(true);
    }
  }

  function closePinInspector() {
    const card = E.elements.pinInspectorCard;
    E.state.activePinItem = null;
    E.state.activeWordStopId = null;
    if (card) {
      card.classList.remove('open');
      card.setAttribute('aria-hidden', 'true');
    }
    refreshPins();
    if (E.overlays) {
      E.overlays.refreshOverlayHudRects();
      E.overlays.markOverlaysDirty(true);
    }
  }

  function initPinInspectorEvents() {
    if (E.elements.pinInspectorCloseBtn) {
      E.elements.pinInspectorCloseBtn.addEventListener('click', closePinInspector);
    }
  }

  E.pins = {
    pinState,
    initPins,
    refreshPins,
    pickPinAtLatLng,
    openPinInspector,
    closePinInspector,
    initPinInspectorEvents
  };
})(window);

