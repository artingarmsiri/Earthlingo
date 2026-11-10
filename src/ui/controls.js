// src/ui/controls.js - Legend Filters, Autocomplete Search, Toolbar Controls, Modals & Shortcuts
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  function syncLegendResponsiveUI() {
    const el = E.elements;
    if (!el.legendPanel) return;
    const mobile = E.utils.isMobileViewport();
    const isOpen = !mobile || E.state.isLegendExpandedMobile;

    if (el.floatingLegend) {
      el.floatingLegend.classList.toggle('mobile-open', mobile && E.state.isLegendExpandedMobile);
    }
    if (el.toggleLegendMobileBtn) {
      el.toggleLegendMobileBtn.classList.toggle('active', mobile && E.state.isLegendExpandedMobile);
      el.toggleLegendMobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      el.toggleLegendMobileBtn.classList.toggle('has-filter', Boolean(E.state.activeFilterLanguage));
    }

    const hasActive = Boolean(E.state.activeFilterLanguage);
    el.legendPanel.classList.toggle('has-active-filter', hasActive);
    if (el.legendActiveDot) {
      el.legendActiveDot.style.background = E.state.activeFilterColor || '#38bdf8';
    }
    if (el.mobileLegendFilterDot) {
      el.mobileLegendFilterDot.style.background = E.state.activeFilterColor || '#38bdf8';
    }
    if (el.legendMobileLabel) {
      el.legendMobileLabel.textContent = hasActive
        ? `Filter: ${E.state.activeFilterLanguage}`
        : 'Shared Languages';
    }
    if (E.overlays && typeof E.overlays.refreshOverlayHudRects === 'function') {
      E.overlays.refreshOverlayHudRects();
    }
  }

  function clearLanguageFilter() {
    const el = E.elements;
    E.state.activeFilterLanguage = null;
    E.state.activeFilterFamily = null;
    E.state.activeFilterColor = null;
    el.legendChips.querySelectorAll('.legend-chip').forEach(c => c.classList.remove('active'));
    el.legendResetBtn.style.display = 'none';
    if (E.state.activeOriginCorridor === 'filter') {
      E.state.activeOriginCorridor = E.state.selectedCountry
        ? 'country'
        : (E.state._prevCorridorBeforeCountry || 'all');
    }
    syncLegendResponsiveUI();
    E.polygons.refreshPolygonVisuals();
    E.overlays.markOverlaysDirty(true);
    if (E.state.globe && E.state.showArcs) E.arcs.updateArcs();
  }

  function initLegend() {
    const el = E.elements;
    const sharedLanguages = E.config.SHARED_LANGUAGES;

    el.legendChips.innerHTML = sharedLanguages.map(l => `
      <div class="legend-chip" data-lang="${l.name}" data-color="${l.color}" title="${l.name} (${l.count} countries) • Family: ${l.fam}">
        <span class="legend-dot" style="background: ${l.color};"></span>
        <span>${l.name}</span>
        <span style="font-size: 0.68rem; color: #94a3b8; margin-left: 2px;">(${l.count})</span>
      </div>
    `).join('');

    el.legendChips.querySelectorAll('.legend-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const lang = chip.getAttribute('data-lang');
        const color = chip.getAttribute('data-color');
        if (E.state.activeFilterLanguage === lang) {
          clearLanguageFilter();
        } else {
          E.state.activeFilterLanguage = lang;
          E.state.activeFilterFamily = null;
          E.state.activeFilterColor = color || '#38bdf8';
          el.legendChips.querySelectorAll('.legend-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          el.legendResetBtn.style.display = 'inline-block';
          syncLegendResponsiveUI();
          E.polygons.refreshPolygonVisuals();
          E.overlays.markOverlaysDirty(true);
          if (E.state.globe && E.state.showArcs) {
            if (!E.state.selectedCountry) {
              E.state.activeOriginCorridor = 'filter';
              E.state.isArcsPanelCollapsed = false;
            }
            E.arcs.updateArcs();
          }
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

    el.legendResetBtn.addEventListener('click', clearLanguageFilter);
    syncLegendResponsiveUI();
  }

  function initSearch() {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    const seen = new Set();
    E.state.countriesList = [];
    for (const key in E.state.languagesDb) {
      const c = E.state.languagesDb[key];
      if (c && c.name && !seen.has(c.name)) {
        seen.add(c.name);
        E.state.countriesList.push(c);
      }
    }
    E.state.countriesList.sort((a, b) => a.name.localeCompare(b.name));

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

  function renderModalGrid() {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    if (el.modalCountriesGrid.children.length > 0) return;

    el.modalCountriesGrid.innerHTML = E.state.countriesList.map(c => `
      <div class="country-grid-card" data-iso="${c.iso3 || c.name}">
        <span style="font-size: 1.6rem;">${c.flag || '🌐'}</span>
        <div style="display: flex; flex-direction: column; overflow: hidden;">
          <strong style="font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.name)}</strong>
          <span style="font-size: 0.78rem; color: #38bdf8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.primaryLanguage || '')}</span>
          <span style="font-size: 0.7rem; color: #64748b;">${escapeHtml(c.continent || '')}</span>
        </div>
      </div>
    `).join('');

    el.modalCountriesGrid.querySelectorAll('.country-grid-card').forEach(card => {
      card.addEventListener('click', () => {
        const iso = card.getAttribute('data-iso');
        const c = E.state.languagesDb[iso];
        if (c) {
          el.listModal.classList.remove('open');
          E.drawer.selectCountry(c);
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
      }
    });
  }

  function initAccessibilityShortcuts() {
    const el = E.elements;
    document.addEventListener('keydown', (e) => {
      if (document.activeElement === el.searchInput) {
        if (e.key === 'Escape') {
          el.searchInput.blur();
          el.searchResultsDropdown.style.display = 'none';
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
    syncLegendResponsiveUI,
    clearLanguageFilter,
    initLegend,
    initSearch,
    initControls,
    renderModalGrid,
    initListModal,
    initAccessibilityShortcuts
  };
})(window);

