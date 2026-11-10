// src/ui/controls.js - Legend Filters, Autocomplete Search, Toolbar Controls, Modals & Shortcuts
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

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
    E.state.activeFilterLanguage = null;
    E.state.activeFilterFamily = null;
    E.state.activeFilterScript = null;
    E.state.activeFilterDiversityTier = null;
    E.state.activeFilterSpokenLang = null;
    E.state.activeFilterSpokenCountries = null;
    E.state.activeFilterColor = null;

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
        const rst = el.legendChips.querySelector('[data-kind="era-reset"]');
        if (rst) rst.addEventListener('click', () => setTimeEra('today'));
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
        const g = c.__diversityGroup || E.geo.resolveCountryDiversityGroup(c).name;
        counts.set(g, (counts.get(g) || 0) + 1);
      });
      (E.config.DIVERSITY_GROUPS || []).forEach(g => {
        const count = counts.get(g.name) || 0;
        if (count > 0) {
          items.push({ kind: 'diversity', value: g.name, label: g.name, color: g.color, count, title: `Filter ${g.name} (${g.minLabel} — ${count} countries)` });
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

    el.legendChips.querySelectorAll('.legend-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const kind = chip.getAttribute('data-kind');
        const val = chip.getAttribute('data-val');
        const color = chip.getAttribute('data-color') || '#38bdf8';

        if (kind === 'spoken') {
          clearLanguageFilter();
          return;
        }
        if (kind === 'lang') {
          if (E.state.activeFilterLanguage === val && !E.state.activeFilterSpokenLang) {
            clearLanguageFilter();
          } else {
            E.state.activeFilterSpokenLang = null;
            E.state.activeFilterSpokenCountries = null;
            E.state.activeFilterFamily = null;
            E.state.activeFilterScript = null;
            E.state.activeFilterDiversityTier = null;
            E.state.activeFilterLanguage = val;
            E.state.activeFilterColor = color;
            renderLegendChips();
            syncLegendResponsiveUI();
            if (E.drawer && typeof E.drawer.syncDrawerSpotlightCards === 'function') {
              E.drawer.syncDrawerSpotlightCards();
            }
            E.polygons.refreshPolygonVisuals();
            E.overlays.markOverlaysDirty(true);
            if (E.state.globe && E.state.showArcs) {
              if (!E.state.selectedCountry) {
                E.state.activeOriginCorridor = 'filter';
                E.state.isArcsPanelCollapsed = false;
              }
              E.arcs.updateArcs();
            }
            if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
          }
          return;
        }
        if (kind === 'family') {
          if (E.state.activeFilterFamily === val && !E.state.activeFilterSpokenLang) {
            clearLanguageFilter();
          } else {
            E.state.activeFilterSpokenLang = null;
            E.state.activeFilterSpokenCountries = null;
            E.state.activeFilterLanguage = null;
            E.state.activeFilterScript = null;
            E.state.activeFilterDiversityTier = null;
            E.state.activeFilterFamily = val;
            E.state.activeFilterColor = color;
            renderLegendChips();
            syncLegendResponsiveUI();
            if (E.drawer && typeof E.drawer.syncDrawerSpotlightCards === 'function') {
              E.drawer.syncDrawerSpotlightCards();
            }
            E.polygons.refreshPolygonVisuals();
            E.overlays.markOverlaysDirty(true);
            if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
          }
          return;
        }
        if (kind === 'script') {
          if (E.state.activeFilterScript === val && !E.state.activeFilterSpokenLang) {
            clearLanguageFilter();
          } else {
            E.state.activeFilterSpokenLang = null;
            E.state.activeFilterSpokenCountries = null;
            E.state.activeFilterLanguage = null;
            E.state.activeFilterFamily = null;
            E.state.activeFilterDiversityTier = null;
            E.state.activeFilterScript = val;
            E.state.activeFilterColor = color;
            renderLegendChips();
            syncLegendResponsiveUI();
            if (E.drawer && typeof E.drawer.syncDrawerSpotlightCards === 'function') {
              E.drawer.syncDrawerSpotlightCards();
            }
            E.polygons.refreshPolygonVisuals();
            E.overlays.markOverlaysDirty(true);
            if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
          }
          return;
        }
        if (kind === 'diversity') {
          if (E.state.activeFilterDiversityTier === val && !E.state.activeFilterSpokenLang) {
            clearLanguageFilter();
          } else {
            E.state.activeFilterSpokenLang = null;
            E.state.activeFilterSpokenCountries = null;
            E.state.activeFilterLanguage = null;
            E.state.activeFilterFamily = null;
            E.state.activeFilterScript = null;
            E.state.activeFilterDiversityTier = val;
            E.state.activeFilterColor = color;
            renderLegendChips();
            syncLegendResponsiveUI();
            if (E.drawer && typeof E.drawer.syncDrawerSpotlightCards === 'function') {
              E.drawer.syncDrawerSpotlightCards();
            }
            E.polygons.refreshPolygonVisuals();
            E.overlays.markOverlaysDirty(true);
            if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
          }
        }
      });
    });
  }

  function setColorByMode(nextMode, opts = {}) {
    const valid = E.config.COLOR_BY_MODES;
    const mode = valid.has(nextMode) ? nextMode : 'language';
    const prevMode = E.state.colorByMode;
    E.state.colorByMode = mode;

    if (!opts.fromSync) {
      if (E.state.activeTimeEra && E.state.activeTimeEra !== 'today') {
        setTimeEra('today', { skipRouter: true });
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

    if (E.state.activeTimeEra && E.state.activeTimeEra !== 'today') {
      setTimeEra('today', { skipRouter: true });
    }
    E.state.colorByMode = 'script';
    E.state.activeFilterSpokenLang = null;
    E.state.activeFilterSpokenCountries = null;
    E.state.activeFilterLanguage = null;
    E.state.activeFilterFamily = null;
    E.state.activeFilterDiversityTier = null;
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

    E.state.activeFilterSpokenLang = rec.token;
    E.state.activeFilterSpokenCountries = rec.countries;
    E.state.activeFilterLanguage = null;
    E.state.activeFilterFamily = null;
    E.state.activeFilterScript = null;
    E.state.activeFilterDiversityTier = null;
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

    // If none of the matched countries are currently facing the camera, pan gently to the nearest match
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

    [el.legendColorByGroup, el.overlayColorByGroup].forEach(group => {
      if (!group) return;
      group.querySelectorAll('.color-by-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const m = btn.getAttribute('data-color-by');
          if (m) setColorByMode(m, { fromSync: false });
        });
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

    el.legendResetBtn.addEventListener('click', () => clearLanguageFilter());
    syncLegendResponsiveUI();
  }

  function initSearch() {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    if (!E.state.countriesList || E.state.countriesList.length === 0) {
      E.geo.buildSpokenLanguageIndex();
    }

    let activeIndex = -1;
    let currentMatches = [];
    let transientStatus = '';

    function closeSearchDropdown() {
      activeIndex = -1;
      el.searchResultsDropdown.style.display = 'none';
      el.searchInput.setAttribute('aria-expanded', 'false');
      el.searchInput.removeAttribute('aria-activedescendant');
    }

    function updateActiveResult(nextIdx, shouldScroll = true) {
      const items = el.searchResultsDropdown.querySelectorAll('.search-result-item');
      if (items.length === 0) {
        activeIndex = -1;
        el.searchInput.removeAttribute('aria-activedescendant');
        return;
      }

      if (nextIdx < 0) nextIdx = items.length - 1;
      else if (nextIdx >= items.length) nextIdx = 0;

      activeIndex = nextIdx;
      items.forEach((item, i) => {
        const isActive = i === activeIndex;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      const activeId = items[activeIndex].id;
      if (activeId) {
        el.searchInput.setAttribute('aria-activedescendant', activeId);
      }
      if (shouldScroll && typeof items[activeIndex].scrollIntoView === 'function') {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }

    function pickSearchCountry(country) {
      if (!country) return;
      el.searchInput.value = country.name;
      el.searchClearBtn.style.display = 'block';
      closeSearchDropdown();
      el.searchInput.blur();
      E.drawer.selectCountry(country);
    }

    function renderSearchResults(queryRaw) {
      const query = String(queryRaw || '').trim().toLowerCase();
      el.searchClearBtn.style.display = query ? 'block' : 'none';
      transientStatus = query;

      if (!query) {
        currentMatches = [];
        closeSearchDropdown();
        return;
      }

      currentMatches = E.state.countriesList.filter(c => {
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

      activeIndex = -1;
      el.searchInput.removeAttribute('aria-activedescendant');

      if (currentMatches.length === 0) {
        el.searchResultsDropdown.innerHTML = `<div style="padding: 12px 14px; font-size: 0.85rem; color: #94a3b8;">No matching countries or languages found.</div>`;
        el.searchResultsDropdown.style.display = 'block';
        el.searchInput.setAttribute('aria-expanded', 'true');
        return;
      }

      el.searchResultsDropdown.innerHTML = currentMatches.map((c, idx) => `
        <div class="search-result-item" id="searchResultOpt_${idx}" role="option" aria-selected="false" data-idx="${idx}" data-iso="${escapeHtml(c.iso3 || c.name)}">
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

      el.searchResultsDropdown.style.display = 'block';
      el.searchInput.setAttribute('aria-expanded', 'true');

      el.searchResultsDropdown.querySelectorAll('.search-result-item').forEach((item, idx) => {
        item.addEventListener('mouseenter', () => {
          updateActiveResult(idx, false);
        });
        item.addEventListener('click', () => {
          const iso = item.getAttribute('data-iso');
          const found = E.state.languagesDb[iso] || currentMatches[idx];
          pickSearchCountry(found);
        });
      });
    }

    el.searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    el.searchInput.addEventListener('keydown', (e) => {
      const isOpen = el.searchResultsDropdown.style.display === 'block';

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen && el.searchInput.value.trim()) {
          renderSearchResults(el.searchInput.value);
        }
        if (currentMatches.length > 0) {
          updateActiveResult(activeIndex < 0 ? 0 : activeIndex + 1, true);
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen && el.searchInput.value.trim()) {
          renderSearchResults(el.searchInput.value);
        }
        if (currentMatches.length > 0) {
          updateActiveResult(activeIndex < 0 ? currentMatches.length - 1 : activeIndex - 1, true);
        }
        return;
      }

      if (e.key === 'Enter') {
        if (!isOpen && el.searchInput.value.trim() && el.searchInput.value.trim().toLowerCase() !== transientStatus) {
          renderSearchResults(el.searchInput.value);
        }
        if (el.searchResultsDropdown.style.display === 'block' && currentMatches.length > 0) {
          e.preventDefault();
          const pickIdx = activeIndex >= 0 && activeIndex < currentMatches.length ? activeIndex : 0;
          pickSearchCountry(currentMatches[pickIdx]);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeSearchDropdown();
        el.searchInput.blur();
      }
    });

    el.searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
        E.scene.syncViewportSize(false);
      }, 80);
    }, { passive: true });

    el.searchClearBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      currentMatches = [];
      closeSearchDropdown();
      el.searchClearBtn.style.display = 'none';
      el.searchInput.focus();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        closeSearchDropdown();
      }
    });
  }

  function initControls() {
    const el = E.elements;
    const { GLOBE_CONFIG } = E.config;

    el.toggleRotateBtn.addEventListener('click', () => {
      E.state.isRotating = !E.state.isRotating;
      E.state.globe.controls().autoRotate = E.state.isRotating;
      el.toggleRotateBtn.classList.toggle('active', E.state.isRotating);
    });

    el.zoomInBtn.addEventListener('click', () => {
      const now = performance.now();
      const baseAlt = (E.state.pendingZoomAlt !== null && now - E.state.pendingZoomTs < 420)
        ? E.state.pendingZoomAlt
        : E.state.globe.pointOfView().altitude;
      const nextAlt = Math.max(0.32, baseAlt - 0.5);
      E.state.pendingZoomAlt = nextAlt;
      E.state.pendingZoomTs = now;
      E.state.globe.pointOfView({ altitude: nextAlt }, GLOBE_CONFIG.ZOOM_ANIM_MS);
    });

    el.zoomOutBtn.addEventListener('click', () => {
      const now = performance.now();
      const maxAlt = Math.max(4.8, E.utils.getDefaultAltitude() + 1.0);
      const baseAlt = (E.state.pendingZoomAlt !== null && now - E.state.pendingZoomTs < 420)
        ? E.state.pendingZoomAlt
        : E.state.globe.pointOfView().altitude;
      const nextAlt = Math.min(maxAlt, baseAlt + 0.5);
      E.state.pendingZoomAlt = nextAlt;
      E.state.pendingZoomTs = now;
      E.state.globe.pointOfView({ altitude: nextAlt }, GLOBE_CONFIG.ZOOM_ANIM_MS);
    });

    el.resetViewBtn.addEventListener('click', () => {
      E.state.pendingZoomAlt = null;
      E.state.globe.pointOfView({ lat: 20, lng: 0, altitude: E.utils.getDefaultAltitude() }, 500);
    });

    el.toggleAtmosphereBtn.addEventListener('click', () => {
      E.state.showAtmosphere = !E.state.showAtmosphere;
      E.state.globe.showAtmosphere(E.state.showAtmosphere);
      el.toggleAtmosphereBtn.classList.toggle('active', E.state.showAtmosphere);
    });

    if (el.toggleArcsBtn) {
      el.toggleArcsBtn.addEventListener('click', () => {
        E.state.showArcs = !E.state.showArcs;
        el.toggleArcsBtn.classList.toggle('active', E.state.showArcs);
        if (E.state.showArcs) {
          E.state.isArcsPanelCollapsed = false;
          if (E.utils.isMobileViewport() && E.state.isOverlayMenuOpen) {
            E.state.isOverlayMenuOpen = false;
            E.overlays.syncOverlayMenuUI();
          }
          if (E.utils.isMobileViewport() && E.state.isLegendExpandedMobile) {
            E.state.isLegendExpandedMobile = false;
            syncLegendResponsiveUI();
          }
          if (E.state.activeArcTab === 'origins') {
            if (E.state.selectedCountry) {
              E.state.activeOriginCorridor = 'country';
            } else if (E.state.activeFilterLanguage) {
              E.state.activeOriginCorridor = 'filter';
            } else if (E.state.activeOriginCorridor === 'country' || E.state.activeOriginCorridor === 'filter') {
              E.state.activeOriginCorridor = E.state._prevCorridorBeforeCountry || 'all';
            }
          }
        }
        E.arcs.updateArcs();
        E.arcs.syncDrawerOriginButton();
        E.overlays.refreshOverlayHudRects();
        E.overlays.markOverlaysDirty(true);
        if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
      });
    }

    if (el.arcsTabOriginsBtn) {
      el.arcsTabOriginsBtn.addEventListener('click', () => {
        if (E.arcs && typeof E.arcs.setArcTab === 'function') E.arcs.setArcTab('origins');
      });
    }
    if (el.arcsTabWordsBtn) {
      el.arcsTabWordsBtn.addEventListener('click', () => {
        if (E.arcs && typeof E.arcs.setArcTab === 'function') E.arcs.setArcTab('words');
      });
    }

    if (el.toggleEndangeredBtn) {
      el.toggleEndangeredBtn.addEventListener('click', () => {
        toggleEndangeredPins();
      });
    }

    if (el.arcsToggleCollapseBtn) {
      el.arcsToggleCollapseBtn.addEventListener('click', () => {
        E.state.isArcsPanelCollapsed = !E.state.isArcsPanelCollapsed;
        if (el.arcsInfoPanel) {
          el.arcsInfoPanel.classList.toggle('collapsed', E.state.isArcsPanelCollapsed);
        }
        el.arcsToggleCollapseBtn.setAttribute('aria-expanded', E.state.isArcsPanelCollapsed ? 'false' : 'true');
        E.overlays.refreshOverlayHudRects();
        E.overlays.markOverlaysDirty(true);
      });
    }

    if (el.arcsCloseBtn) {
      el.arcsCloseBtn.addEventListener('click', () => {
        E.state.showArcs = false;
        if (el.toggleArcsBtn) el.toggleArcsBtn.classList.remove('active');
        E.arcs.updateArcs();
        E.arcs.syncDrawerOriginButton();
        E.overlays.markOverlaysDirty(true);
        if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
      });
    }

    el.closeDrawerBtn.addEventListener('click', E.drawer.closeCountryDrawer);
    E.drawer.setupMobileDrawerGestures();

    el.openInfoModalBtn.addEventListener('click', () => {
      E.utils.openModal(el.infoModal, { initialFocus: el.closeInfoModalBtn });
    });

    el.closeInfoModalBtn.addEventListener('click', () => {
      E.utils.closeModal(el.infoModal);
    });

    el.infoModal.addEventListener('click', (e) => {
      if (e.target === el.infoModal) {
        E.utils.closeModal(el.infoModal);
      }
    });
  }

  function populateListContinentFilter() {
    const sel = E.elements.listModalContinent;
    if (!sel || sel.options.length > 1) return;
    const continents = Array.from(new Set((E.state.countriesList || []).map(c => c.continent).filter(Boolean))).sort();
    continents.forEach(cont => {
      const opt = document.createElement('option');
      opt.value = cont;
      opt.textContent = cont === 'Global' ? 'Territories & Islands' : cont;
      sel.appendChild(opt);
    });
  }

  function renderModalGrid() {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    if (!el.modalCountriesGrid) return;

    populateListContinentFilter();

    const q = (E.state.listSearchQuery || '').trim().toLowerCase();
    const cont = E.state.listContinentFilter || 'all';
    const allCountries = E.state.countriesList || [];

    const filtered = allCountries.filter(c => {
      if (cont !== 'all' && c.continent !== cont) return false;
      if (!q) return true;
      if (c.name && c.name.toLowerCase().includes(q)) return true;
      if (c.nativeName && c.nativeName.toLowerCase().includes(q)) return true;
      if (c.primaryLanguage && c.primaryLanguage.toLowerCase().includes(q)) return true;
      if (c.languageFamily && c.languageFamily.toLowerCase().includes(q)) return true;
      if (c.__scriptGroup && c.__scriptGroup.toLowerCase().includes(q)) return true;
      if (c.continent && c.continent.toLowerCase().includes(q)) return true;
      if (c.languages && c.languages.some(l =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.script && l.script.toLowerCase().includes(q))
      )) return true;
      return false;
    });

    if (el.listModalCount) {
      el.listModalCount.textContent = filtered.length === allCountries.length
        ? `${allCountries.length} Countries`
        : `${filtered.length} of ${allCountries.length}`;
    }
    if (el.listModalClearBtn) {
      el.listModalClearBtn.style.display = q ? 'flex' : 'none';
    }

    if (filtered.length === 0) {
      el.modalCountriesGrid.innerHTML = `<div class="list-modal-empty">No countries match your current search or continent filter.</div>`;
      return;
    }

    el.modalCountriesGrid.innerHTML = filtered.map(c => {
      const contLabel = c.continent === 'Global' ? 'Territory' : (c.continent || '');
      const iso = c.iso3 || c.name;
      const inTrip = E.trip && typeof E.trip.hasBookmark === 'function' && E.trip.hasBookmark(iso);
      return `
      <div class="country-grid-card" data-iso="${escapeHtml(iso)}" role="button" tabindex="0">
        <span style="font-size: 1.6rem;">${c.flag || '🌐'}</span>
        <div style="display: flex; flex-direction: column; overflow: hidden; min-width: 0; flex: 1;">
          <strong style="font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.name)}</strong>
          <span style="font-size: 0.78rem; color: #38bdf8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.primaryLanguage || '')}</span>
          <span style="font-size: 0.7rem; color: #64748b;">${escapeHtml(contLabel)}${c.__scriptGroup ? ` • ${escapeHtml(c.__scriptGroup)}` : ''}</span>
        </div>
        <button type="button" class="grid-trip-star-btn ${inTrip ? 'active' : ''}" data-star-iso="${escapeHtml(iso)}" title="${inTrip ? 'Saved in Trip Cheat-Sheet' : 'Add to Trip Cheat-Sheet'}" aria-label="Toggle Travel Cheat-Sheet bookmark">${inTrip ? '★' : '☆'}</button>
      </div>
    `;
    }).join('');

    el.modalCountriesGrid.querySelectorAll('.grid-trip-star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const iso = btn.getAttribute('data-star-iso');
        if (E.trip && typeof E.trip.toggleBookmark === 'function') {
          const added = E.trip.toggleBookmark(iso);
          btn.classList.toggle('active', added);
          btn.textContent = added ? '★' : '☆';
          btn.title = added ? 'Saved in Trip Cheat-Sheet' : 'Add to Trip Cheat-Sheet';
        }
      });
    });

    el.modalCountriesGrid.querySelectorAll('.country-grid-card').forEach(card => {
      const openFromCard = () => {
        const iso = card.getAttribute('data-iso');
        const c = E.state.languagesDb[iso];
        if (c) {
          E.utils.closeModal(el.listModal, { skipFocusRestore: true });
          E.drawer.selectCountry(c);
        }
      };
      card.addEventListener('click', (e) => {
        if (e.target && e.target.closest('.grid-trip-star-btn')) return;
        openFromCard();
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFromCard();
        }
      });
    });
  }

  function toggleEndangeredPins(forceState, opts = {}) {
    const el = E.elements;
    const next = typeof forceState === 'boolean' ? forceState : !E.state.showEndangeredPins;
    E.state.showEndangeredPins = next;
    if (el.toggleEndangeredBtn) el.toggleEndangeredBtn.classList.toggle('active', next);
    if (!next && E.pins && typeof E.pins.closePinInspector === 'function') {
      E.pins.closePinInspector();
    }
    if (next && E.utils.isMobileViewport()) {
      if (E.state.isOverlayMenuOpen) {
        E.state.isOverlayMenuOpen = false;
        E.overlays.syncOverlayMenuUI();
      }
      if (E.state.isLegendExpandedMobile) {
        E.state.isLegendExpandedMobile = false;
        syncLegendResponsiveUI();
      }
    }
    if (E.pins && typeof E.pins.refreshPins === 'function') {
      E.pins.refreshPins();
    }
    E.overlays.markOverlaysDirty(true);
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  let timelinePlayTimer = null;
  const ERA_ORDER = ['2000bce', '100ce', '1000ce', '1492ce', 'today'];

  function stopTimelinePlay() {
    E.state.isTimelinePlaying = false;
    if (timelinePlayTimer) {
      clearInterval(timelinePlayTimer);
      timelinePlayTimer = null;
    }
    if (E.elements.timelinePlayBtn) {
      E.elements.timelinePlayBtn.classList.remove('active');
      E.elements.timelinePlayBtn.textContent = '▶ Play';
    }
  }

  function setTimeEra(eraId, opts = {}) {
    const idx = ERA_ORDER.indexOf(eraId);
    const validId = idx >= 0 ? eraId : 'today';
    const validIdx = idx >= 0 ? idx : ERA_ORDER.length - 1;
    const el = E.elements;
    const H = global.WORLD_HISTORICAL_ERAS;
    const eraObj = (H && Array.isArray(H.ERAS))
      ? (H.ERAS.find(er => er.id === validId) || H.ERAS[H.ERAS.length - 1])
      : null;

    if (opts.openBar && !E.state.isTimelineOpen) {
      E.state.isTimelineOpen = true;
      if (el.timeScrubberBar) {
        el.timeScrubberBar.classList.add('open');
        el.timeScrubberBar.setAttribute('aria-hidden', 'false');
      }
      if (el.toggleTimelineBtn) el.toggleTimelineBtn.classList.add('active');
    }

    E.state.activeTimeEra = validId;

    if (el.timelineRange) el.timelineRange.value = String(validIdx);
    if (el.timelineEraButtons) {
      el.timelineEraButtons.querySelectorAll('[data-era]').forEach(btn => {
        const active = btn.getAttribute('data-era') === validId;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    if (el.timelineEraTitle && eraObj) {
      el.timelineEraTitle.textContent = eraObj.yearLabel;
    }
    if (el.timelineEraSubtitle && eraObj) {
      el.timelineEraSubtitle.textContent = eraObj.headline;
    }
    if (el.toggleTimelineBtn) {
      el.toggleTimelineBtn.classList.toggle('has-era', validId !== 'today');
    }

    renderLegendChips();
    syncLegendResponsiveUI();
    E.polygons.refreshPolygonVisuals();
    E.overlays.markOverlaysDirty(true);
    if (E.state.showArcs && E.arcs) {
      E.arcs.updateArcs();
    }
    E.overlays.refreshOverlayHudRects();
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function toggleTimeline(forceOpen, opts = {}) {
    const el = E.elements;
    const next = typeof forceOpen === 'boolean' ? forceOpen : !E.state.isTimelineOpen;
    E.state.isTimelineOpen = next;

    if (el.timeScrubberBar) {
      el.timeScrubberBar.classList.toggle('open', next);
      el.timeScrubberBar.setAttribute('aria-hidden', next ? 'false' : 'true');
    }
    if (el.toggleTimelineBtn) {
      el.toggleTimelineBtn.classList.toggle('active', next);
    }

    if (next) {
      if (E.state.isOverlayMenuOpen) {
        E.state.isOverlayMenuOpen = false;
        E.overlays.syncOverlayMenuUI();
      }
      if (E.state.isLegendExpandedMobile) {
        E.state.isLegendExpandedMobile = false;
        syncLegendResponsiveUI();
      }
      if (!opts.keepEra && E.state.activeTimeEra === 'today') {
        setTimeEra('1492ce', { skipRouter: opts.skipRouter });
      }
    } else {
      stopTimelinePlay();
      if (!opts.keepEra && E.state.activeTimeEra !== 'today') {
        setTimeEra('today', { skipRouter: opts.skipRouter });
      }
    }

    E.overlays.refreshOverlayHudRects();
    E.overlays.markOverlaysDirty(true);
  }

  function toggleTimelinePlay() {
    if (E.state.isTimelinePlaying) {
      stopTimelinePlay();
      return;
    }
    E.state.isTimelinePlaying = true;
    if (E.elements.timelinePlayBtn) {
      E.elements.timelinePlayBtn.classList.add('active');
      E.elements.timelinePlayBtn.textContent = '⏸ Pause';
    }
    if (E.state.activeTimeEra === 'today') {
      setTimeEra(ERA_ORDER[0]);
    }
    timelinePlayTimer = setInterval(() => {
      const curIdx = ERA_ORDER.indexOf(E.state.activeTimeEra);
      const nextIdx = (curIdx + 1) % ERA_ORDER.length;
      setTimeEra(ERA_ORDER[nextIdx]);
    }, 1900);
  }

  function initTimeScrubber() {
    const el = E.elements;
    if (el.toggleTimelineBtn) {
      el.toggleTimelineBtn.addEventListener('click', () => toggleTimeline());
    }
    if (el.timelineCloseBtn) {
      el.timelineCloseBtn.addEventListener('click', () => toggleTimeline(false));
    }
    if (el.timelinePlayBtn) {
      el.timelinePlayBtn.addEventListener('click', toggleTimelinePlay);
    }
    if (el.timelineRange) {
      el.timelineRange.addEventListener('input', (e) => {
        stopTimelinePlay();
        const idx = parseInt(e.target.value, 10);
        if (!Number.isNaN(idx) && ERA_ORDER[idx]) {
          setTimeEra(ERA_ORDER[idx]);
        }
      });
    }
    if (el.timelineEraButtons) {
      el.timelineEraButtons.querySelectorAll('[data-era]').forEach(btn => {
        btn.addEventListener('click', () => {
          stopTimelinePlay();
          const eraId = btn.getAttribute('data-era');
          if (eraId) setTimeEra(eraId);
        });
      });
    }
  }

  function initListModal() {
    const el = E.elements;
    el.openListModalBtn.addEventListener('click', () => {
      renderModalGrid();
      E.utils.openModal(el.listModal, { initialFocus: el.listModalSearch || el.closeListModalBtn });
    });

    el.closeListModalBtn.addEventListener('click', () => {
      E.utils.closeModal(el.listModal);
    });

    el.listModal.addEventListener('click', (e) => {
      if (e.target === el.listModal) {
        E.utils.closeModal(el.listModal);
      }
    });

    if (el.listModalSearch) {
      el.listModalSearch.addEventListener('input', (e) => {
        E.state.listSearchQuery = e.target.value;
        renderModalGrid();
      });
    }

    if (el.listModalClearBtn) {
      el.listModalClearBtn.addEventListener('click', () => {
        E.state.listSearchQuery = '';
        if (el.listModalSearch) {
          el.listModalSearch.value = '';
          el.listModalSearch.focus();
        }
        renderModalGrid();
      });
    }

    if (el.listModalContinent) {
      el.listModalContinent.addEventListener('change', (e) => {
        E.state.listContinentFilter = e.target.value || 'all';
        renderModalGrid();
      });
    }
  }

  function closeAllModals(opts = {}) {
    const el = E.elements;
    if (el.infoModal && el.infoModal.classList.contains('open')) {
      E.utils.closeModal(el.infoModal, opts);
    }
    if (el.listModal && el.listModal.classList.contains('open')) {
      E.utils.closeModal(el.listModal, opts);
    }
    if (E.compare && typeof E.compare.closeCompareModal === 'function' && (E.state.isCompareOpen || (el.compareModal && el.compareModal.classList.contains('open')))) {
      E.compare.closeCompareModal(opts);
    }
    if (E.passport && typeof E.passport.closePassportModal === 'function' && el.passportModal && el.passportModal.classList.contains('open')) {
      E.passport.closePassportModal(opts);
    }
    if (E.trip && typeof E.trip.closeTripModal === 'function' && (E.state.tripModalOpen || (el.tripModal && el.tripModal.classList.contains('open')))) {
      E.trip.closeTripModal(opts);
    }
    if (E.scriptInspector && typeof E.scriptInspector.closeScriptModal === 'function' && el.scriptModal && el.scriptModal.classList.contains('open')) {
      E.scriptInspector.closeScriptModal(opts);
    }
  }

  function initAccessibilityShortcuts() {
    const el = E.elements;
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement && document.activeElement.tagName;
      if (document.activeElement === el.searchInput || activeTag === 'INPUT' || activeTag === 'SELECT' || activeTag === 'TEXTAREA') {
        if (e.key === 'Escape') {
          const inOpenModal = document.activeElement && typeof document.activeElement.closest === 'function' && document.activeElement.closest('.modal-overlay.open');
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          if (el.searchResultsDropdown) el.searchResultsDropdown.style.display = 'none';
          if (el.searchInput) el.searchInput.setAttribute('aria-expanded', 'false');
          if (inOpenModal) {
            closeAllModals();
          }
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        el.searchInput.focus();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        el.toggleRotateBtn.click();
      } else if (e.key === 'r' || e.key === 'R') {
        el.resetViewBtn.click();
      } else if (e.key === 'Escape') {
        closeAllModals();
        if (E.pins && typeof E.pins.closePinInspector === 'function') {
          E.pins.closePinInspector();
        }
        if (E.state.isQuizActive && E.quiz && typeof E.quiz.stopQuiz === 'function') {
          E.quiz.stopQuiz({ restoreOverlay: true });
        }
        if (E.state.isOverlayMenuOpen) {
          E.state.isOverlayMenuOpen = false;
          E.overlays.syncOverlayMenuUI();
        }
        E.tooltip.hideTooltip();
        E.drawer.closeCountryDrawer();
      }
    });
  }

  E.controls = {
    syncColorByUI,
    setColorByMode,
    renderLegendChips,
    syncLegendResponsiveUI,
    clearLanguageFilter,
    filterBySpokenLanguage,
    filterByScriptGroup,
    toggleEndangeredPins,
    initTimeScrubber,
    toggleTimeline,
    setTimeEra,
    initLegend,
    initSearch,
    initControls,
    renderModalGrid,
    initListModal,
    initAccessibilityShortcuts
  };
})(window);

