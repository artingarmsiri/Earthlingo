// src/core/router.js - URL Hash Deep-Linking Router & Share Link Copier
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  let isApplyingHash = false;
  let lastWrittenHash = null;

  function resolveCountryParam(raw) {
    if (!raw || !E.state.languagesDb) return null;
    const trimmed = String(raw).trim();
    const db = E.state.languagesDb;
    if (db[trimmed]) return db[trimmed];
    const upper = trimmed.toUpperCase();
    if (db[upper]) return db[upper];
    const lower = trimmed.toLowerCase();
    const list = E.state.countriesList || [];
    return (
      list.find(c => (c.iso3 && c.iso3.toUpperCase() === upper) || (c.name && c.name.toLowerCase() === lower)) ||
      null
    );
  }

  function findGroupColor(groups, val, fallback = '#38bdf8') {
    if (!groups || !val) return fallback;
    const hit = groups.find(g => g.name.toLowerCase() === String(val).toLowerCase());
    return hit ? hit.color : fallback;
  }

  function parseHash(hashStr) {
    const raw = String(hashStr != null ? hashStr : (window.location.hash || '')).replace(/^#/, '');
    if (!raw) return new URLSearchParams();
    try {
      return new URLSearchParams(raw);
    } catch (_err) {
      return new URLSearchParams();
    }
  }

  function buildHashString() {
    const s = E.state;
    const params = new URLSearchParams();

    if (s.viewMode === '2d') {
      params.set('view', '2d');
    }
    if (s.selectedCountry) {
      params.set('country', E.geo.getCountryKey(s.selectedCountry));
    }
    if (s.mapOverlayMode && s.mapOverlayMode !== 'countries') {
      params.set('overlay', s.mapOverlayMode);
    }
    if (s.colorByMode && s.colorByMode !== 'language') {
      params.set('color', s.colorByMode);
    }
    if (!s.colorByAutoSync) {
      params.set('sync', '0');
    }
    if (s.activeFilterSpokenLang) {
      params.set('spoken', s.activeFilterSpokenLang);
    } else if (s.activeFilterLanguage) {
      params.set('filter', s.activeFilterLanguage);
    } else if (s.activeFilterFamily) {
      params.set('fam', s.activeFilterFamily);
    } else if (s.activeFilterScript) {
      params.set('script', s.activeFilterScript);
    } else if (s.activeFilterDiversityTier) {
      params.set('div', s.activeFilterDiversityTier);
    }
    if (s.showEndangeredPins) {
      params.set('pins', '1');
    }
    if (s.activeTimeEra && s.activeTimeEra !== 'today') {
      params.set('era', s.activeTimeEra);
    }
    if (s.showArcs) {
      if (s.activeArcTab === 'words') {
        params.set('arcs', 'word');
        if (s.activeWordRoute) params.set('word', s.activeWordRoute);
      } else {
        params.set('arcs', s.activeOriginCorridor || 'all');
      }
    }
    if (s.isCompareOpen && s.compareIsoA && s.compareIsoB) {
      params.set('compare', `${s.compareIsoA},${s.compareIsoB}`);
    }
    if (Array.isArray(s.tripBookmarks) && s.tripBookmarks.length > 0 && s.tripModalOpen) {
      params.set('trip', s.tripBookmarks.join(','));
    }

    return params.toString();
  }

  function syncUrlHash() {
    if (isApplyingHash) return;
    const encoded = buildHashString();
    if (encoded === lastWrittenHash) return;
    lastWrittenHash = encoded;

    const currentRaw = String(window.location.hash || '').replace(/^#/, '');
    if (currentRaw === encoded) return;

    const targetUrl = encoded
      ? `#${encoded}`
      : `${window.location.pathname}${window.location.search}`;

    try {
      if (window.history && typeof window.history.replaceState === 'function') {
        window.history.replaceState(null, '', targetUrl);
        return;
      }
    } catch (_err) {
      // Fallback for restricted file:// environments
    }

    try {
      if (encoded) {
        window.location.hash = encoded;
      } else if (window.location.hash) {
        window.location.hash = '';
      }
    } catch (_err2) {
      // Ignore in locked down sandboxes
    }
  }

  function applyHashState(hashStr, opts = {}) {
    const raw = String(hashStr != null ? hashStr : (window.location.hash || '')).replace(/^#/, '');
    if (!raw && opts.skipEmptyAtBoot) {
      lastWrittenHash = '';
      return;
    }

    const params = parseHash(raw);
    const viewParam = params.get('view');
    const hasExplicitSync = params.has('sync');
    const syncParam = params.get('sync');
    const overlayParam = params.get('overlay');
    const colorParam = params.get('color');
    const spokenParam = params.get('spoken');
    const filterParam = params.get('filter');
    const famParam = params.get('fam');
    const scriptParam = params.get('script');
    const divParam = params.get('div');
    const pinsParam = params.get('pins');
    const eraParam = params.get('era');
    const wordParam = params.get('word');
    const tripParam = params.get('trip');
    const countryParam = params.get('country');
    const arcsParam = params.get('arcs');
    const compareParam = params.get('compare');

    isApplyingHash = true;
    try {
      const animateCam = opts.animate !== false;

      if (E.map2d && typeof E.map2d.setViewMode === 'function') {
        const nextView = viewParam === '2d' ? '2d' : '3d';
        if (nextView === '2d' || (opts.resetMissing && E.state.viewMode !== nextView)) {
          E.map2d.setViewMode(nextView, { skipRouter: true, preserve2dCamera: nextView === '2d' && !opts.resetMissing });
        }
      }

      // Reset arcs/drawer/compare cleanly if handling hashchange navigation
      if (opts.resetMissing) {
        if (!countryParam && E.state.selectedCountry && E.drawer) {
          E.drawer.closeCountryDrawer({ skipRouter: true });
        }
        if (!compareParam && E.state.isCompareOpen && E.compare) {
          E.compare.closeCompareModal({ skipRouter: true });
        }
        if (!arcsParam && E.state.showArcs) {
          E.state.showArcs = false;
          if (E.elements.toggleArcsBtn) E.elements.toggleArcsBtn.classList.remove('active');
          if (E.arcs) E.arcs.updateArcs();
        }
        if (!pinsParam && E.state.showEndangeredPins && E.controls) {
          E.controls.toggleEndangeredPins(false, { skipRouter: true });
        }
        if (!eraParam && E.controls && (E.state.isTimelineOpen || E.state.activeTimeEra !== 'today')) {
          E.controls.toggleTimeline(false, { skipRouter: true });
        }
        if (!tripParam && E.state.tripModalOpen && E.trip) {
          E.trip.closeTripModal({ skipRouter: true });
        }
        if (!spokenParam && !filterParam && !famParam && !scriptParam && !divParam && E.controls) {
          E.controls.clearLanguageFilter({ skipRouter: true });
        }
      }

      // 1. Overlay mode & Color-By sync
      const validOverlays = E.config.OVERLAY_CONFIG.VALID_MODES;
      const nextOverlay = (overlayParam && validOverlays.has(overlayParam)) ? overlayParam : 'countries';
      if (E.overlays) {
        E.overlays.setMapOverlayMode(nextOverlay, { skipSync: true, skipRouter: true });
      }

      const validColors = E.config.COLOR_BY_MODES;
      const syncedExpected = E.overlays ? E.overlays.getSyncedColorModeForOverlay(nextOverlay) : 'language';
      const nextColor = (colorParam && validColors.has(colorParam))
        ? colorParam
        : ((hasExplicitSync && syncParam === '0') ? 'language' : syncedExpected);

      if (hasExplicitSync) {
        E.state.colorByAutoSync = (syncParam !== '0');
      } else if (colorParam && validColors.has(colorParam) && colorParam !== syncedExpected) {
        E.state.colorByAutoSync = false;
      } else {
        E.state.colorByAutoSync = true;
      }

      if (E.controls) {
        E.controls.setColorByMode(nextColor, { fromSync: true, skipRouter: true });
      }

      // 2. Active Spotlight / Legend Filter
      const clearFilterFields = () => {
        if (E.legend && typeof E.legend.clearFilterFields === 'function') {
          E.legend.clearFilterFields();
          return;
        }
        E.state.activeFilterSpokenLang = null;
        E.state.activeFilterSpokenCountries = null;
        E.state.activeFilterLanguage = null;
        E.state.activeFilterFamily = null;
        E.state.activeFilterScript = null;
        E.state.activeFilterDiversityTier = null;
        E.state.activeFilterColor = null;
      };

      if (spokenParam && E.controls) {
        E.controls.filterBySpokenLanguage(spokenParam, null, {
          forceOn: true,
          skipRouter: true,
          skipCameraCheck: Boolean(countryParam),
          skipMobilePeek: true
        });
      } else if (filterParam && E.controls) {
        const matched = (E.config.SHARED_LANGUAGES || []).find(l => l.name.toLowerCase() === filterParam.toLowerCase());
        const canonical = matched ? matched.name : filterParam;
        clearFilterFields();
        E.state.activeFilterLanguage = canonical;
        E.state.activeFilterColor = matched ? matched.color : '#38bdf8';
      } else if (famParam) {
        const grp = (E.config.FAMILY_GROUPS || []).find(g => g.name.toLowerCase() === famParam.toLowerCase());
        clearFilterFields();
        E.state.activeFilterFamily = grp ? grp.name : famParam;
        E.state.activeFilterColor = grp ? grp.color : findGroupColor(E.config.FAMILY_GROUPS, famParam);
      } else if (scriptParam) {
        const grp = (E.config.SCRIPT_GROUPS || []).find(g => g.name.toLowerCase() === scriptParam.toLowerCase());
        clearFilterFields();
        E.state.activeFilterScript = grp ? grp.name : scriptParam;
        E.state.activeFilterColor = grp ? grp.color : findGroupColor(E.config.SCRIPT_GROUPS, scriptParam);
      } else if (divParam) {
        const grp = (E.config.DIVERSITY_GROUPS || []).find(g => g.name.toLowerCase() === divParam.toLowerCase());
        clearFilterFields();
        E.state.activeFilterDiversityTier = grp ? grp.name : divParam;
        E.state.activeFilterColor = grp ? grp.color : findGroupColor(E.config.DIVERSITY_GROUPS, divParam);
      }

      if (pinsParam === '1' && E.controls) {
        E.controls.toggleEndangeredPins(true, { skipRouter: true });
      }
      if (eraParam && E.controls) {
        E.controls.setTimeEra(eraParam, { skipRouter: true, openBar: true });
      }

      if (E.controls) {
        if (typeof E.controls.renderLegendChips === 'function') E.controls.renderLegendChips();
        E.controls.syncLegendResponsiveUI();
      }
      if (E.polygons) E.polygons.refreshPolygonVisuals();
      if (E.overlays) E.overlays.markOverlaysDirty(true);

      // 3. Country Selection (Drawer)
      const targetCountry = countryParam ? resolveCountryParam(countryParam) : null;
      if (targetCountry && E.drawer) {
        E.drawer.selectCountry(targetCountry, animateCam && !compareParam, { skipRouter: true });
      }

      // 4. Origin & Migration Arcs OR Word Etymology Routes
      if (arcsParam) {
        E.state.showArcs = true;
        if (arcsParam === 'word') {
          E.state.activeArcTab = 'words';
          if (wordParam && global.WORLD_ETYMOLOGY && global.WORLD_ETYMOLOGY[wordParam]) {
            E.state.activeWordRoute = wordParam;
          }
        } else {
          E.state.activeArcTab = 'origins';
          E.state.activeOriginCorridor = arcsParam;
        }
        if (E.elements.toggleArcsBtn) E.elements.toggleArcsBtn.classList.add('active');
        if (E.arcs) {
          E.arcs.updateArcs();
          E.arcs.syncDrawerOriginButton();
          if (!targetCountry && !compareParam) {
            if (E.state.activeArcTab === 'words' && global.WORLD_ETYMOLOGY) {
              const wr = global.WORLD_ETYMOLOGY[E.state.activeWordRoute];
              if (wr && wr.camera) E.arcs.flyToCorridorCamera(wr.camera);
            } else if (global.WORLD_ORIGINS && global.WORLD_ORIGINS.corridors) {
              const cor = global.WORLD_ORIGINS.corridors[E.state.activeOriginCorridor];
              if (cor && cor.camera) E.arcs.flyToCorridorCamera(cor.camera);
            }
          }
        }
      }

      // 5. Compare Modal & Trip Cheat-Sheet Modal
      if (compareParam && E.compare) {
        const parts = compareParam.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 2) {
          E.compare.openComparePair(parts[0], parts[1], { skipRouter: true });
        } else if (parts.length === 1) {
          const c = resolveCountryParam(parts[0]);
          if (c) E.compare.openCompareWithCountry(c);
        }
      }
      if (tripParam && E.trip) {
        const isos = tripParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        if (isos.length) E.trip.importBookmarks(isos, { open: true, skipRouter: true });
      }

      lastWrittenHash = buildHashString();
    } finally {
      isApplyingHash = false;
    }
  }

  function copyTextFallback(text) {
    return E.utils.copyTextFallback(text);
  }

  function flashShareFeedback(btnEl) {
    if (!btnEl) return;
    btnEl.classList.add('is-copied');
    const prevTitle = btnEl.getAttribute('title') || 'Copy shareable link';
    btnEl.setAttribute('title', 'Link copied to clipboard!');
    if (btnEl._copyTimer) clearTimeout(btnEl._copyTimer);
    btnEl._copyTimer = setTimeout(() => {
      if (!btnEl.isConnected) return;
      btnEl.classList.remove('is-copied');
      btnEl.setAttribute('title', prevTitle);
    }, 1800);
  }

  function copyCurrentShareLink(btnEl) {
    syncUrlHash();
    const url = window.location.href;
    E.utils.copyTextToClipboard(url, () => flashShareFeedback(btnEl));
    return url;
  }

  function initRouter() {
    applyHashState(window.location.hash, { skipEmptyAtBoot: true, animate: true });
    window.addEventListener('hashchange', () => {
      applyHashState(window.location.hash, { resetMissing: true, animate: true });
    });
  }

  E.router = {
    parseHash,
    buildHashString,
    syncUrlHash,
    applyHashState,
    copyTextFallback,
    copyCurrentShareLink,
    initRouter
  };
})(window);
