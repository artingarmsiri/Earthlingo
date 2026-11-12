// src/ui/controls.js - Toolbar Controls, Shortcuts & Unified UI Facade
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});
  let controlsEventsBound = false;

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
      if (E.state.isLegendExpandedMobile && E.legend) {
        E.state.isLegendExpandedMobile = false;
        E.legend.syncLegendResponsiveUI();
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

  function initControls() {
    if (controlsEventsBound) return;
    controlsEventsBound = true;

    const el = E.elements;
    const { GLOBE_CONFIG } = E.config;

    if (el.toggleRotateBtn) {
      el.toggleRotateBtn.addEventListener('click', () => {
        E.state.isRotating = !E.state.isRotating;
        if (E.state.globe && E.state.globe.controls) {
          E.state.globe.controls().autoRotate = E.state.isRotating;
        }
        el.toggleRotateBtn.classList.toggle('active', E.state.isRotating);
      });
    }

    if (el.zoomInBtn) {
      el.zoomInBtn.addEventListener('click', () => {
        if (E.state.viewMode === '2d' && E.map2d) {
          E.map2d.zoomBy(1.75, undefined, undefined, 150);
          return;
        }
        const now = performance.now();
        const baseAlt = (E.state.pendingZoomAlt !== null && now - E.state.pendingZoomTs < 420)
          ? E.state.pendingZoomAlt
          : E.state.globe.pointOfView().altitude;
        const nextAlt = Math.max(0.32, baseAlt - 0.5);
        E.state.pendingZoomAlt = nextAlt;
        E.state.pendingZoomTs = now;
        E.state.globe.pointOfView({ altitude: nextAlt }, GLOBE_CONFIG.ZOOM_ANIM_MS);
      });
    }

    if (el.zoomOutBtn) {
      el.zoomOutBtn.addEventListener('click', () => {
        if (E.state.viewMode === '2d' && E.map2d) {
          E.map2d.zoomBy(1 / 1.75, undefined, undefined, 150);
          return;
        }
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
    }

    if (el.resetViewBtn) {
      el.resetViewBtn.addEventListener('click', () => {
        if (E.state.viewMode === '2d' && E.map2d) {
          E.map2d.resetView(420);
          return;
        }
        E.state.pendingZoomAlt = null;
        E.state.globe.pointOfView({ lat: 20, lng: 0, altitude: E.utils.getDefaultAltitude() }, 500);
      });
    }

    if (el.toggleAtmosphereBtn) {
      el.toggleAtmosphereBtn.addEventListener('click', () => {
        E.state.showAtmosphere = !E.state.showAtmosphere;
        E.state.globe.showAtmosphere(E.state.showAtmosphere);
        el.toggleAtmosphereBtn.classList.toggle('active', E.state.showAtmosphere);
      });
    }

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
          if (E.utils.isMobileViewport() && E.state.isLegendExpandedMobile && E.legend) {
            E.state.isLegendExpandedMobile = false;
            E.legend.syncLegendResponsiveUI();
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
      el.toggleEndangeredBtn.addEventListener('click', () => toggleEndangeredPins());
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

    if (el.closeDrawerBtn) {
      el.closeDrawerBtn.addEventListener('click', E.drawer.closeCountryDrawer);
    }
    E.drawer.setupMobileDrawerGestures();

    if (el.openInfoModalBtn) {
      el.openInfoModalBtn.addEventListener('click', () => {
        if (E.utils && typeof E.utils.closeAllModals === 'function') {
          E.utils.closeAllModals({ except: el.infoModal, skipRouter: true, skipFocusRestore: true });
        }
        E.utils.openModal(el.infoModal, { initialFocus: el.closeInfoModalBtn });
      });
    }

    if (el.closeInfoModalBtn) {
      el.closeInfoModalBtn.addEventListener('click', () => E.utils.closeModal(el.infoModal));
    }

    if (el.infoModal) {
      el.infoModal.addEventListener('click', (e) => {
        if (e.target === el.infoModal) E.utils.closeModal(el.infoModal);
      });
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
          if (inOpenModal && E.utils && typeof E.utils.closeAllModals === 'function') {
            E.utils.closeAllModals();
          }
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        if (el.searchInput) el.searchInput.focus();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (el.toggleRotateBtn) el.toggleRotateBtn.click();
      } else if (e.key === 'r' || e.key === 'R') {
        if (el.resetViewBtn) el.resetViewBtn.click();
      } else if (e.key === 'm' || e.key === 'M') {
        if (E.map2d && typeof E.map2d.setViewMode === 'function') {
          E.map2d.setViewMode(E.state.viewMode === '2d' ? '3d' : '2d');
        }
      } else if (e.key === 'Escape') {
        if (E.utils && typeof E.utils.closeAllModals === 'function') {
          E.utils.closeAllModals();
        }
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

  // Facade preserving window.Earthlingo.controls API compatibility across router, drawer, and tests
  E.controls = {
    syncColorByUI: (...args) => E.legend && E.legend.syncColorByUI(...args),
    setColorByMode: (...args) => E.legend && E.legend.setColorByMode(...args),
    renderLegendChips: (...args) => E.legend && E.legend.renderLegendChips(...args),
    syncLegendResponsiveUI: (...args) => E.legend && E.legend.syncLegendResponsiveUI(...args),
    clearLanguageFilter: (...args) => E.legend && E.legend.clearLanguageFilter(...args),
    filterBySpokenLanguage: (...args) => E.legend && E.legend.filterBySpokenLanguage(...args),
    filterByScriptGroup: (...args) => E.legend && E.legend.filterByScriptGroup(...args),
    initLegend: (...args) => E.legend && E.legend.initLegend(...args),
    initSearch: (...args) => E.search && E.search.initSearch(...args),
    initTimeScrubber: (...args) => E.timeline && E.timeline.initTimeScrubber(...args),
    toggleTimeline: (...args) => E.timeline && E.timeline.toggleTimeline(...args),
    setTimeEra: (...args) => E.timeline && E.timeline.setTimeEra(...args),
    renderModalGrid: (...args) => E.listModal && E.listModal.renderModalGrid(...args),
    initListModal: (...args) => E.listModal && E.listModal.initListModal(...args),
    toggleEndangeredPins,
    initControls,
    initAccessibilityShortcuts
  };
})(window);
