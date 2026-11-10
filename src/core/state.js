// src/core/state.js - Centralized Application State, Cached DOM References & GPU Batch Buffers
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

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
    mapOverlayMode: 'countries',
    isOverlayMenuOpen: false,
    overlayZoomTier: 0,
    pendingZoomAlt: null,
    pendingZoomTs: 0,
    activeOriginCorridor: 'all',
    _prevCorridorBeforeCountry: 'all',
    isArcsPanelCollapsed: false,
    mobileDrawerSnap: 'half',
    globe: null,
    hoveredCountry: null,
    hoveredPolygon: null
  };

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

  const elements = {};

  function collectDomElements() {
    Object.assign(elements, {
      loadingOverlay: document.getElementById('loadingOverlay'),
      loadingText: document.getElementById('loadingText'),
      globeViz: document.getElementById('globeViz'),
      globeMapOverlays: document.getElementById('globeMapOverlays'),
      globeControlsBar: document.querySelector('.globe-controls-bar'),
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
      toggleOverlayMenuBtn: document.getElementById('toggleOverlayMenuBtn'),
      overlayActiveDot: document.getElementById('overlayActiveDot'),
      mapOverlaysPanel: document.getElementById('mapOverlaysPanel'),
      overlayModeOptions: document.getElementById('overlayModeOptions'),
      overlayZoomBadge: document.getElementById('overlayZoomBadge'),
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
    });
    return elements;
  }

  collectDomElements();

  E.state = state;
  E.renderBatch = renderBatch;
  E.elements = elements;
  E.collectDomElements = collectDomElements;
})(window);

