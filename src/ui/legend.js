// src/ui/legend.js - Floating Legend, Color-By Modes & Spoken Language Spotlight Filters
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});
  let legendEventsBound = false;

  function hasAnyActiveFilter() {
    return Boolean(
      E.state.activeFilterSpokenLang ||
      E.state.activeFilterLanguage ||
      E.state.activeFilterFamily ||
      E.state.activeFilterScript ||
      E.state.activeFilterDiversityTier
    );
  }

  function getActiveFilterDisplayLabel() {
    if (E.state.activeFilterSpokenLang) {
      const cnt = E.state.activeFilterSpokenCountries ? E.state.activeFilterSpokenCountries.size : 0;
      return `Spoken: ${E.state.activeFilterSpokenLang} (${cnt})`;
    }
    if (E.state.activeFilterLanguage) return `Language: ${E.state.activeFilterLanguage}`;
    if (E.state.activeFilterFamily) return `Family: ${E.state.activeFilterFamily}`;
    if (E.state.activeFilterScript) return `Script: ${E.state.activeFilterScript}`;
    if (E.state.activeFilterDiversityTier) return `Diversity: ${E.state.activeFilterDiversityTier}`;
    return '';
  }

  function clearFilterFields() {
    E.state.activeFilterLanguage = null;
    E.state.activeFilterFamily = null;
    E.state.activeFilterScript = null;
    E.state.activeFilterDiversityTier = null;
    E.state.activeFilterSpokenLang = null;
    E.state.activeFilterSpokenCountries = null;
    E.state.activeFilterColor = null;
  }

  function syncColorByUI() {
    const el = E.elements;
    const mode = E.state.colorByMode || 'language';
    const syncOn = Boolean(E.state.colorByAutoSync);
    const activeEra = E.state.activeTimeEra || 'today';
    const H = global.WORLD_HISTORICAL_ERAS;
    const eraObj = (activeEra !== 'today' && H && Array.isArray(H.ERAS))
      ? H.ERAS.find(er => er.id === activeEra)
      : null;

    [el.legendColorByGroup, el.overlayColorByGroup].forEach(group => {
      if (!group) return;
      group.querySelectorAll('.color-by-btn').forEach(btn => {
        const m = btn.getAttribute('data-color-by');
        const active = m === mode;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    });

    [el.colorAutoSyncBtn, el.overlayColorAutoSyncBtn].forEach(btn => {
      if (!btn) return;
      btn.classList.toggle('active', syncOn);
      btn.setAttribute('aria-pressed', syncOn ? 'true' : 'false');
      const txt = btn.querySelector('.sync-state-label');
      if (txt) txt.textContent = syncOn ? 'Auto-sync' : 'Manual';
      btn.title = syncOn
        ? 'Color-By follows Families & Scripts map overlays automatically (click to lock manual override)'
        : 'Manual Color-By lock active (click to re-enable auto-sync with overlays)';
    });

    if (el.legendTitle) {
      el.legendTitle.textContent = eraObj
        ? `Historical Era: ${eraObj.yearLabel}`
        : (E.state.activeFilterSpokenLang
          ? `Spoken Spotlight: ${E.state.activeFilterSpokenLang}`
          : (mode === 'family'
            ? 'Color by Family (Click to Filter)'
            : (mode === 'script'
              ? 'Color by Script (Click to Filter)'
              : (mode === 'diversity' ? 'Linguistic Diversity (Click to Filter)' : 'Shared Languages (Click to Highlight)'))));
    }
  }

  function syncLegendResponsiveUI() {
    const el = E.elements;
    if (!el.legendPanel) return;
    const mobile = E.utils.isMobileViewport();
    const isOpen = !mobile || E.state.isLegendExpandedMobile;

    if (el.floatingLegend) {
      el.floatingLegend.classList.toggle('mobile-open', mobile && E.state.isLegendExpandedMobile);
    }
    const active = hasAnyActiveFilter();
    if (el.toggleLegendMobileBtn) {
      el.toggleLegendMobileBtn.classList.toggle('active', mobile && E.state.isLegendExpandedMobile);
      el.toggleLegendMobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      el.toggleLegendMobileBtn.classList.toggle('has-filter', active);
    }

    const isEraActive = Boolean(E.state.activeTimeEra && E.state.activeTimeEra !== 'today');
    el.legendPanel.classList.toggle('has-active-filter', active);
    el.legendPanel.classList.toggle('has-era-legend', isEraActive);
    if (el.legendResetBtn) {
      el.legendResetBtn.style.display = active ? 'inline-block' : 'none';
    }
    if (el.legendActiveDot) {
      el.legendActiveDot.style.background = E.state.activeFilterColor || '#38bdf8';
    }
    if (el.mobileLegendFilterDot) {
      el.mobileLegendFilterDot.style.background = E.state.activeFilterColor || '#38bdf8';
    }
    if (el.legendMobileLabel) {
      if (active) {
        el.legendMobileLabel.textContent = getActiveFilterDisplayLabel();
      } else if (E.state.activeTimeEra && E.state.activeTimeEra !== 'today') {
        el.legendMobileLabel.textContent = `Era: ${E.state.activeTimeEra}`;
      } else if (E.state.colorByMode === 'family') {
        el.legendMobileLabel.textContent = 'Language Families';
      } else if (E.state.colorByMode === 'script') {
        el.legendMobileLabel.textContent = 'Writing Scripts';
      } else if (E.state.colorByMode === 'diversity') {
        el.legendMobileLabel.textContent = 'Linguistic Diversity';
      } else {
        el.legendMobileLabel.textContent = 'Shared Languages';
      }
    }
    syncColorByUI();
    if (E.overlays && typeof E.overlays.refreshOverlayHudRects === 'function') {
      E.overlays.refreshOverlayHudRects();
    }
  }

  function clearLanguageFilter(opts = {}) {
    const el = E.elements;
    clearFilterFields();

    if (E.state.activeOriginCorridor === 'filter') {
      E.state.activeOriginCorridor = E.state.selectedCountry
        ? 'country'
        : (E.state._prevCorridorBeforeCountry || 'all');
    }

    renderLegendChips();
    if (el.legendResetBtn) el.legendResetBtn.style.display = 'none';
    syncLegendResponsiveUI();
    if (E.drawer && typeof E.drawer.syncDrawerSpotlightCards === 'function') {
      E.drawer.syncDrawerSpotlightCards();
    }
    E.polygons.refreshPolygonVisuals();
    E.overlays.markOverlaysDirty(true);
    if (E.state.globe && E.state.showArcs) E.arcs.updateArcs();
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function setActiveFilter(kind, value, color, opts = {}) {
    const isSame =
      !E.state.activeFilterSpokenLang &&
      ((kind === 'lang' && E.state.activeFilterLanguage === value) ||
       (kind === 'family' && E.state.activeFilterFamily === value) ||
       (kind === 'script' && E.state.activeFilterScript === value) ||
       (kind === 'diversity' && E.state.activeFilterDiversityTier === value));

    if (!opts.forceOn && isSame) {
      clearLanguageFilter(opts);
      return false;
    }

    clearFilterFields();
    E.state.activeFilterColor = color || '#38bdf8';

    if (kind === 'lang') E.state.activeFilterLanguage = value;
    else if (kind === 'family') E.state.activeFilterFamily = value;
    else if (kind === 'script') E.state.activeFilterScript = value;
    else if (kind === 'diversity') E.state.activeFilterDiversityTier = value;

    renderLegendChips();
    syncLegendResponsiveUI();
    if (E.drawer && typeof E.drawer.syncDrawerSpotlightCards === 'function') {
      E.drawer.syncDrawerSpotlightCards();
    }
    E.polygons.refreshPolygonVisuals();
    E.overlays.markOverlaysDirty(true);

    if (kind === 'lang' && E.state.globe && E.state.showArcs) {
      if (!E.state.selectedCountry) {
        E.state.activeArcTab = 'origins';
        E.state.activeOriginCorridor = 'filter';
        E.state.isArcsPanelCollapsed = false;
      }
      E.arcs.updateArcs();
    }
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
    return true;
  }

  function renderLegendChips() {
    const el = E.elements;
    if (!el.legendChips) return;
    const { escapeHtml } = E.utils;
    const activeEra = E.state.activeTimeEra || 'today';
    const H = global.WORLD_HISTORICAL_ERAS;
    if (activeEra !== 'today' && H && Array.isArray(H.ERAS)) {
      const eraObj = H.ERAS.find(er => er.id === activeEra);
      if (eraObj && Array.isArray(eraObj.legend)) {
        const legendHtml = eraObj.legend.map(it => `
          <div class="legend-chip is-static" title="${escapeHtml(it.label)}">
            <span class="legend-dot" style="background: ${it.color};"></span>
            <span>${escapeHtml(it.label)}</span>
          </div>
        `).join('');
        el.legendChips.innerHTML = `${legendHtml}<button type="button" class="legend-chip legend-spotlight-chip" data-kind="era-reset">↩ Return to Modern Map</button>`;
        return;
      }
    }

    const mode = E.state.colorByMode || 'language';
    const countries = E.state.countriesList || [];
    const items = [];

    if (mode === 'family') {
      const counts = new Map();
      countries.forEach(c => {
        const g = c.__familyGroup || E.geo.resolveCountryFamilyGroup(c).name;
        counts.set(g, (counts.get(g) || 0) + 1);
      });
      E.config.FAMILY_GROUPS.forEach(g => {
        const count = counts.get(g.name) || 0;
        if (count > 0) {
          items.push({ kind: 'family', value: g.name, label: g.name, color: g.color, count, title: `Filter by ${g.name} (${count} countries)` });
        }
      });
    } else if (mode === 'script') {
      const counts = new Map();
      countries.forEach(c => {
        const g = c.__scriptGroup || E.geo.resolveCountryScriptGroup(c).name;
        counts.set(g, (counts.get(g) || 0) + 1);
      });
      E.config.SCRIPT_GROUPS.forEach(g => {
        const count = counts.get(g.name) || 0;
        if (count > 0) {
          items.push({ kind: 'script', value: g.name, label: g.name, color: g.color, count, title: `Filter by ${g.name} script (${count} countries)` });
        }
      });
    } else if (mode === 'diversity') {
      const counts = new Map();
      countries.forEach(c => {
        const g = c.__diversityTier || E.geo.resolveCountryDiversityGroup(c).name;
        counts.set(g, (counts.get(g) || 0) + 1);
      });
      (E.config.DIVERSITY_GROUPS || []).forEach(g => {
        const count = counts.get(g.name) || 0;
        if (count > 0) {
          items.push({ kind: 'diversity', value: g.name, label: g.name, color: g.color, count, title: `Filter ${g.label || g.name} — ${count} countries` });
        }
      });
    } else {
      const counts = new Map();
      countries.forEach(c => {
        const canon = c.canonicalLanguage || c.primaryLanguage || '';
        if (canon) counts.set(canon, (counts.get(canon) || 0) + 1);
      });
      E.config.SHARED_LANGUAGES.forEach(l => {
        const count = counts.get(l.name) || l.count;
        items.push({ kind: 'lang', value: l.name, label: l.name, color: l.color, count, title: `${l.name} (${count} countries) • Family: ${l.fam}` });
      });
    }

    let html = '';
    if (E.state.activeFilterSpokenLang) {
      const cnt = E.state.activeFilterSpokenCountries ? E.state.activeFilterSpokenCountries.size : 0;
      const col = E.state.activeFilterColor || '#38bdf8';
      html += `
        <div class="legend-chip legend-spotlight-chip active" data-kind="spoken" data-val="${escapeHtml(E.state.activeFilterSpokenLang)}" data-color="${col}" title="Showing all ${cnt} countries where ${escapeHtml(E.state.activeFilterSpokenLang)} is spoken (Click to clear)">
          <span class="legend-dot" style="background: ${col};"></span>
          <span>Spoken: ${escapeHtml(E.state.activeFilterSpokenLang)}</span>
          <span class="legend-chip-count">(${cnt})</span>
        </div>
      `;
    }

    html += items.map(it => {
      const isAct = (
        !E.state.activeFilterSpokenLang &&
        ((it.kind === 'lang' && E.state.activeFilterLanguage === it.value) ||
         (it.kind === 'family' && E.state.activeFilterFamily === it.value) ||
         (it.kind === 'script' && E.state.activeFilterScript === it.value) ||
         (it.kind === 'diversity' && E.state.activeFilterDiversityTier === it.value))
      );
      return `
        <div class="legend-chip ${isAct ? 'active' : ''}" data-kind="${it.kind}" data-val="${escapeHtml(it.value)}" data-color="${it.color}" title="${escapeHtml(it.title)}">
          <span class="legend-dot" style="background: ${it.color};"></span>
          <span>${escapeHtml(it.label)}</span>
          <span class="legend-chip-count">(${it.count})</span>
        </div>
      `;
    }).join('');

    el.legendChips.innerHTML = html;
  }

  function setColorByMode(nextMode, opts = {}) {
    const valid = E.config.COLOR_BY_MODES;
    const mode = valid.has(nextMode) ? nextMode : 'language';
    const prevMode = E.state.colorByMode;
    E.state.colorByMode = mode;

    if (!opts.fromSync) {
      if (E.state.activeTimeEra && E.state.activeTimeEra !== 'today' && E.timeline) {
        E.timeline.setTimeEra('today', { skipRouter: true });
      }
      const syncedExpected = (E.overlays && typeof E.overlays.getSyncedColorModeForOverlay === 'function')
        ? E.overlays.getSyncedColorModeForOverlay(E.state.mapOverlayMode)
        : 'language';
      if (mode !== syncedExpected) {
        E.state.colorByAutoSync = false;
      }
    }

    if (prevMode !== mode) {
      if (mode !== 'language') E.state.activeFilterLanguage = null;
      if (mode !== 'family') E.state.activeFilterFamily = null;
      if (mode !== 'script') E.state.activeFilterScript = null;
      if (mode !== 'diversity') E.state.activeFilterDiversityTier = null;
      if (!E.state.activeFilterSpokenLang) {
        E.state.activeFilterColor = null;
        if (E.state.activeOriginCorridor === 'filter') {
          E.state.activeOriginCorridor = E.state.selectedCountry
            ? 'country'
            : (E.state._prevCorridorBeforeCountry || 'all');
          if (E.state.globe && E.state.showArcs) E.arcs.updateArcs();
        }
      }
    }

    renderLegendChips();
    syncLegendResponsiveUI();
    E.polygons.refreshPolygonVisuals();
    E.overlays.markOverlaysDirty(true);
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function filterByScriptGroup(scriptGroupName, optionalColor, opts = {}) {
    if (!scriptGroupName) return false;
    const groups = E.config.SCRIPT_GROUPS || [];
    const lower = String(scriptGroupName).trim().toLowerCase();
    const grp = groups.find(g => g.name.toLowerCase() === lower || g.name.toLowerCase().includes(lower));
    const canonicalName = grp ? grp.name : scriptGroupName;
    const color = optionalColor || (grp && grp.color) || '#38bdf8';

    if (!opts.forceOn && E.state.activeFilterScript === canonicalName) {
      clearLanguageFilter();
      return false;
    }

    if (E.state.activeTimeEra && E.state.activeTimeEra !== 'today' && E.timeline) {
      E.timeline.setTimeEra('today', { skipRouter: true });
    }
    E.state.colorByMode = 'script';
    clearFilterFields();
    E.state.activeFilterScript = canonicalName;
    E.state.activeFilterColor = color;

    renderLegendChips();
    syncLegendResponsiveUI();
    if (E.drawer && typeof E.drawer.syncDrawerSpotlightCards === 'function') {
      E.drawer.syncDrawerSpotlightCards();
    }
    if (E.utils.isBottomSheetLayout() && E.elements.countryDrawer && E.elements.countryDrawer.classList.contains('open')) {
      E.drawer.setMobileDrawerSnap('peek', true);
    }
    E.polygons.refreshPolygonVisuals();
    E.overlays.markOverlaysDirty(true);
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
    return true;
  }

  function findSpokenIndexEntry(tokenQuery) {
    if (!tokenQuery || !E.state.spokenIndex) return null;
    if (E.state.spokenIndex.has(tokenQuery)) return E.state.spokenIndex.get(tokenQuery);
    const lower = String(tokenQuery).trim().toLowerCase();
    for (const [k, rec] of E.state.spokenIndex.entries()) {
      if (k.toLowerCase() === lower) return rec;
    }
    return null;
  }

  function filterBySpokenLanguage(token, optionalColor, opts = {}) {
    const rec = findSpokenIndexEntry(token);
    if (!rec || rec.countries.size === 0) return false;

    if (!opts.forceOn && E.state.activeFilterSpokenLang === rec.token) {
      clearLanguageFilter();
      return false;
    }

    clearFilterFields();
    E.state.activeFilterSpokenLang = rec.token;
    E.state.activeFilterSpokenCountries = rec.countries;
    E.state.activeFilterColor = optionalColor || rec.color || '#38bdf8';

    renderLegendChips();
    syncLegendResponsiveUI();
    if (E.drawer && typeof E.drawer.syncDrawerSpotlightCards === 'function') {
      E.drawer.syncDrawerSpotlightCards();
    }
    E.polygons.refreshPolygonVisuals();
    E.overlays.markOverlaysDirty(true);

    if (E.utils.isBottomSheetLayout() && !opts.skipMobilePeek && E.elements.countryDrawer && E.elements.countryDrawer.classList.contains('open')) {
      E.drawer.setMobileDrawerSnap('peek', true);
    }

    if (!opts.skipCameraCheck && E.state.globe && E.state.globe.camera() && rec.countryList.length > 0) {
      const cam = E.state.globe.camera();
      const cLen = Math.hypot(cam.position.x, cam.position.y, cam.position.z) || 350;
      const ux = cam.position.x / cLen, uy = cam.position.y / cLen, uz = cam.position.z / cLen;
      let bestVisibleDot = -1;
      for (let i = 0; i < rec.countryList.length; i++) {
        const mc = rec.countryList[i];
        if (!mc || !mc.centroid) continue;
        const pos = E.state.globe.getCoords(mc.centroid[1], mc.centroid[0], 0);
        if (!pos) continue;
        const plen = Math.hypot(pos.x, pos.y, pos.z) || 100;
        const dot = (pos.x / plen) * ux + (pos.y / plen) * uy + (pos.z / plen) * uz;
        if (dot > bestVisibleDot) bestVisibleDot = dot;
      }
      if (bestVisibleDot < 0.22) {
        const target = rec.countryList.find(mc => mc && mc.centroid && (mc.centroid[0] !== 0 || mc.centroid[1] !== 0));
        if (target) {
          E.state.globe.pointOfView({ lat: target.centroid[1], lng: target.centroid[0], altitude: Math.max(2.1, E.utils.getDefaultAltitude() * 0.88) }, 550);
        }
      }
    }

    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
    return true;
  }

  function initLegend() {
    const el = E.elements;
    renderLegendChips();
    if (legendEventsBound) {
      syncLegendResponsiveUI();
      return;
    }
    legendEventsBound = true;

    if (el.legendChips) {
      el.legendChips.addEventListener('click', (e) => {
        const chip = e.target && e.target.closest('.legend-chip[data-kind]');
        if (!chip) return;
        const kind = chip.getAttribute('data-kind');
        if (kind === 'era-reset') {
          if (E.timeline) E.timeline.setTimeEra('today');
          return;
        }
        if (kind === 'spoken') {
          clearLanguageFilter();
          return;
        }
        const val = chip.getAttribute('data-val');
        const color = chip.getAttribute('data-color') || '#38bdf8';
        if (kind && val) setActiveFilter(kind, val, color);
      });
    }

    [el.legendColorByGroup, el.overlayColorByGroup].forEach(group => {
      if (!group) return;
      group.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('.color-by-btn[data-color-by]');
        if (!btn) return;
        e.stopPropagation();
        const m = btn.getAttribute('data-color-by');
        if (m) setColorByMode(m, { fromSync: false });
      });
    });

    [el.colorAutoSyncBtn, el.overlayColorAutoSyncBtn].forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        E.state.colorByAutoSync = !E.state.colorByAutoSync;
        if (E.state.colorByAutoSync && E.overlays && typeof E.overlays.getSyncedColorModeForOverlay === 'function') {
          const synced = E.overlays.getSyncedColorModeForOverlay(E.state.mapOverlayMode);
          setColorByMode(synced, { fromSync: true });
        } else {
          syncColorByUI();
          if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
        }
      });
    });

    if (el.toggleLegendMobileBtn) {
      el.toggleLegendMobileBtn.addEventListener('click', () => {
        E.state.isLegendExpandedMobile = !E.state.isLegendExpandedMobile;
        if (E.state.isLegendExpandedMobile) {
          if (E.state.isOverlayMenuOpen) {
            E.state.isOverlayMenuOpen = false;
            E.overlays.syncOverlayMenuUI();
          }
          if (E.state.showArcs && el.arcsInfoPanel) {
            E.state.isArcsPanelCollapsed = true;
            el.arcsInfoPanel.classList.add('collapsed');
            if (el.arcsToggleCollapseBtn) el.arcsToggleCollapseBtn.setAttribute('aria-expanded', 'false');
          }
        }
        syncLegendResponsiveUI();
        E.overlays.markOverlaysDirty(true);
      });
    }

    if (el.legendCloseBtn) {
      el.legendCloseBtn.addEventListener('click', () => {
        E.state.isLegendExpandedMobile = false;
        syncLegendResponsiveUI();
        E.overlays.markOverlaysDirty(true);
      });
    }

    if (el.legendResetBtn) {
      el.legendResetBtn.addEventListener('click', () => clearLanguageFilter());
    }
    syncLegendResponsiveUI();
  }

  E.legend = {
    hasAnyActiveFilter,
    getActiveFilterDisplayLabel,
    clearFilterFields,
    setActiveFilter,
    syncColorByUI,
    syncLegendResponsiveUI,
    clearLanguageFilter,
    renderLegendChips,
    setColorByMode,
    filterByScriptGroup,
    filterBySpokenLanguage,
    initLegend
  };
})(window);

