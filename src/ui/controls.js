// src/ui/controls.js - Legend Filters, Autocomplete Search, Toolbar Controls, Modals & Shortcuts
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  function hasAnyActiveFilter() {
    return Boolean(
      E.state.activeFilterSpokenLang ||
      E.state.activeFilterLanguage ||
      E.state.activeFilterFamily ||
      E.state.activeFilterScript
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
    return '';
  }

  function syncColorByUI() {
    const el = E.elements;
    const mode = E.state.colorByMode || 'language';
    const syncOn = Boolean(E.state.colorByAutoSync);

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
      el.legendTitle.textContent = E.state.activeFilterSpokenLang
        ? `Spoken Spotlight: ${E.state.activeFilterSpokenLang}`
        : (mode === 'family'
          ? 'Color by Family (Click to Filter)'
          : (mode === 'script' ? 'Color by Script (Click to Filter)' : 'Shared Languages (Click to Highlight)'));
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

    el.legendPanel.classList.toggle('has-active-filter', active);
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
      } else if (E.state.colorByMode === 'family') {
        el.legendMobileLabel.textContent = 'Language Families';
      } else if (E.state.colorByMode === 'script') {
        el.legendMobileLabel.textContent = 'Writing Scripts';
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
         (it.kind === 'script' && E.state.activeFilterScript === it.value))
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

    el.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      el.searchClearBtn.style.display = query ? 'block' : 'none';

      if (!query) {
        el.searchResultsDropdown.style.display = 'none';
        return;
      }

      const matches = E.state.countriesList.filter(c => {
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
        el.searchResultsDropdown.innerHTML = `<div style="padding: 12px 14px; font-size: 0.85rem; color: #94a3b8;">No matching countries or languages found.</div>`;
        el.searchResultsDropdown.style.display = 'block';
        return;
      }

      el.searchResultsDropdown.innerHTML = matches.map(c => `
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

      el.searchResultsDropdown.style.display = 'block';

      el.searchResultsDropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const iso = item.getAttribute('data-iso');
          const found = E.state.languagesDb[iso];
          if (found) {
            el.searchInput.value = found.name;
            el.searchResultsDropdown.style.display = 'none';
            el.searchInput.blur();
            E.drawer.selectCountry(found);
          }
        });
      });
    });

    el.searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
        E.scene.syncViewportSize(false);
      }, 80);
    }, { passive: true });

    el.searchClearBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      el.searchClearBtn.style.display = 'none';
      el.searchResultsDropdown.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        el.searchResultsDropdown.style.display = 'none';
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
          if (E.state.selectedCountry) {
            E.state.activeOriginCorridor = 'country';
          } else if (E.state.activeFilterLanguage) {
            E.state.activeOriginCorridor = 'filter';
          } else if (E.state.activeOriginCorridor === 'country' || E.state.activeOriginCorridor === 'filter') {
            E.state.activeOriginCorridor = E.state._prevCorridorBeforeCountry || 'all';
          }
        }
        E.arcs.updateArcs();
        E.arcs.syncDrawerOriginButton();
        E.overlays.markOverlaysDirty(true);
        if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
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
      el.infoModal.classList.add('open');
      el.infoModal.setAttribute('aria-hidden', 'false');
    });

    el.closeInfoModalBtn.addEventListener('click', () => {
      el.infoModal.classList.remove('open');
      el.infoModal.setAttribute('aria-hidden', 'true');
    });

    el.infoModal.addEventListener('click', (e) => {
      if (e.target === el.infoModal) {
        el.infoModal.classList.remove('open');
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
      return `
      <div class="country-grid-card" data-iso="${escapeHtml(c.iso3 || c.name)}" role="button" tabindex="0">
        <span style="font-size: 1.6rem;">${c.flag || '🌐'}</span>
        <div style="display: flex; flex-direction: column; overflow: hidden; min-width: 0;">
          <strong style="font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.name)}</strong>
          <span style="font-size: 0.78rem; color: #38bdf8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.primaryLanguage || '')}</span>
          <span style="font-size: 0.7rem; color: #64748b;">${escapeHtml(contLabel)}${c.__scriptGroup ? ` • ${escapeHtml(c.__scriptGroup)}` : ''}</span>
        </div>
      </div>
    `;
    }).join('');

    el.modalCountriesGrid.querySelectorAll('.country-grid-card').forEach(card => {
      const openFromCard = () => {
        const iso = card.getAttribute('data-iso');
        const c = E.state.languagesDb[iso];
        if (c) {
          el.listModal.classList.remove('open');
          el.listModal.setAttribute('aria-hidden', 'true');
          E.drawer.selectCountry(c);
        }
      };
      card.addEventListener('click', openFromCard);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFromCard();
        }
      });
    });
  }

  function initListModal() {
    const el = E.elements;
    el.openListModalBtn.addEventListener('click', () => {
      renderModalGrid();
      el.listModal.classList.add('open');
      el.listModal.setAttribute('aria-hidden', 'false');
    });

    el.closeListModalBtn.addEventListener('click', () => {
      el.listModal.classList.remove('open');
      el.listModal.setAttribute('aria-hidden', 'true');
    });

    el.listModal.addEventListener('click', (e) => {
      if (e.target === el.listModal) {
        el.listModal.classList.remove('open');
        el.listModal.setAttribute('aria-hidden', 'true');
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

  function initAccessibilityShortcuts() {
    const el = E.elements;
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement && document.activeElement.tagName;
      if (document.activeElement === el.searchInput || activeTag === 'INPUT' || activeTag === 'SELECT' || activeTag === 'TEXTAREA') {
        if (e.key === 'Escape') {
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          if (el.searchResultsDropdown) el.searchResultsDropdown.style.display = 'none';
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
        el.infoModal.classList.remove('open');
        el.infoModal.setAttribute('aria-hidden', 'true');
        el.listModal.classList.remove('open');
        el.listModal.setAttribute('aria-hidden', 'true');
        if (E.compare && typeof E.compare.closeCompareModal === 'function') {
          E.compare.closeCompareModal();
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
    initLegend,
    initSearch,
    initControls,
    renderModalGrid,
    initListModal,
    initAccessibilityShortcuts
  };
})(window);

