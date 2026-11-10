// src/main.js - Earthlingo Application Entry Point
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  async function init() {
    try {
      E.collectDomElements();

      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
      E.utils.updateLoadingText('Loading geographic and linguistic databases...');

      if (window.WORLD_GEOJSON && window.WORLD_LANGUAGES) {
        E.state.geoData = window.WORLD_GEOJSON;
        E.state.languagesDb = window.WORLD_LANGUAGES;
      } else {
        const [geoResponse, langResponse] = await Promise.all([
          fetch('./data/world_countries.geojson'),
          fetch('./data/languages.json')
        ]);

        if (!geoResponse.ok || !langResponse.ok) {
          throw new Error('Failed to fetch data files. Please ensure you are running through a local web server or GitHub Pages.');
        }

        E.state.geoData = await geoResponse.json();
        E.state.languagesDb = await langResponse.json();
      }

      E.utils.updateLoadingText('Initializing 3D WebGL Globe...');
      E.geo.buildSpatialIndex();
      E.scene.initGlobe();
      E.controls.initLegend();
      E.overlays.initMapOverlays();
      E.controls.initSearch();
      E.controls.initControls();
      E.controls.initListModal();
      E.controls.initAccessibilityShortcuts();
      E.overlays.refreshOverlayHudRects();
    } catch (err) {
      console.error('Initialization error:', err);
      if (E.elements.loadingText) {
        E.elements.loadingText.innerHTML = `
          <div style="color: #f43f5e; font-weight: bold; margin-bottom: 8px;">Error loading data</div>
          <div style="font-size: 0.82rem; color: #94a3b8; max-width: 400px; text-align: center;">
            ${err.message || 'Make sure the app is opened via a web server (e.g. python -m http.server, VS Code Live Server, or GitHub Pages) so local JSON files can load without CORS restrictions.'}
          </div>
        `;
      }
    }
  }

  E.init = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);

