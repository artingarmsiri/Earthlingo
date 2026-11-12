// src/globe/scene.js - Globe.GL Bootstrap, Camera Clamping, Viewport Sync & Input Picking
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  function syncViewportSize(reframeIfUnselected = false) {
    const el = E.elements;
    const rb = E.renderBatch;
    const rect = el.globeViz ? el.globeViz.getBoundingClientRect() : null;
    const w = Math.max(1, Math.round((rect && rect.width) || (el.globeViz && el.globeViz.clientWidth) || window.innerWidth));
    const h = Math.max(1, Math.round((rect && rect.height) || (el.globeViz && el.globeViz.clientHeight) || window.innerHeight));
    const prevPortrait = (rb.viewportW / Math.max(1, rb.viewportH)) < 0.9;

    rb.viewportLeft = rect ? rect.left : 0;
    rb.viewportTop = rect ? rect.top : 0;
    rb.viewportW = w;
    rb.viewportH = h;

    if (E.state.globe) {
      E.state.globe.width(w).height(h);
      const renderer = E.state.globe.renderer();
      if (renderer) renderer.setPixelRatio(E.utils.getTargetPixelRatio());
      const nowPortrait = (w / Math.max(1, h)) < 0.9;
      if (E.state.viewMode === '2d' && E.map2d && typeof E.map2d.requestRedraw === 'function') {
        E.map2d.requestRedraw();
      } else if (reframeIfUnselected && !E.state.selectedCountry && (nowPortrait !== prevPortrait)) {
        E.state.globe.pointOfView({ altitude: E.utils.getDefaultAltitude() }, 0);
      }
    }

    if (E.controls && typeof E.controls.syncLegendResponsiveUI === 'function') {
      E.controls.syncLegendResponsiveUI();
    }
    const drawerOpen = Boolean(el.countryDrawer && el.countryDrawer.classList.contains('open'));
    if (E.drawer && typeof E.drawer.setMobileDrawerSnap === 'function') {
      if (drawerOpen) {
        E.drawer.setMobileDrawerSnap(E.state.mobileDrawerSnap, true);
      } else if (!E.utils.isBottomSheetLayout()) {
        E.drawer.setMobileDrawerSnap('half', true);
      }
    }
    if (E.overlays) {
      E.overlays.refreshOverlayHudRects();
      E.overlays.markOverlaysDirty(false);
    }
  }

  function initGlobe() {
    const el = E.elements;
    const rb = E.renderBatch;
    const { GLOBE_CONFIG } = E.config;

    const initRect = el.globeViz ? el.globeViz.getBoundingClientRect() : null;
    const initW = Math.max(1, Math.round((initRect && initRect.width) || window.innerWidth));
    const initH = Math.max(1, Math.round((initRect && initRect.height) || window.innerHeight));
    rb.viewportLeft = initRect ? initRect.left : 0;
    rb.viewportTop = initRect ? initRect.top : 0;
    rb.viewportW = initW;
    rb.viewportH = initH;

    const oceanTexUrl = E.bathymetry.createOceanBathymetryDataUrl();

    const globe = Globe({
      rendererConfig: {
        antialias: true,
        alpha: false,
        logarithmicDepthBuffer: false,
        powerPreference: 'high-performance'
      }
    })(el.globeViz)
      .width(initW)
      .height(initH)
      .backgroundColor('#090d16')
      .enablePointerInteraction(false)
      .globeCurvatureResolution(1.5)
      .showGraticules(true)
      .showAtmosphere(E.state.showAtmosphere)
      .atmosphereColor('#38bdf8')
      .atmosphereAltitude(0.16)
      .polygonsData(E.state.geoData.features)
      .polygonGeoJsonGeometry(d => d.geometry)
      .polygonCapCurvatureResolution(3)
      .polygonAltitude(0.0025)
      .polygonSideColor(() => null)
      .polygonsTransitionDuration(0)
      .polygonCapColor(d => d.__color)
      .polygonStrokeColor(() => '#030712');

    E.state.globe = globe;

    if (oceanTexUrl) {
      globe.globeImageUrl(oceanTexUrl).onGlobeReady(() => {
        E.bathymetry.configureGlobeSurface();
      });
    }

    rb.microstates = E.geo.getMicrostates();

    // Animated Origin & Migration Arcs + Pulsing Urheimat Rings (zero-cost until toggled)
    const arcCurveRes = E.utils.isMobileViewport() ? 48 : 64;
    globe
      .arcColor(d => d.colors || d.color || '#38bdf8')
      .arcAltitude(d => (d && d.arcAlt != null ? d.arcAlt : null))
      .arcAltitudeAutoScale(d => (d && d.altScale != null ? d.altScale : 0.42))
      .arcStartAltitude(d => (d && d.startAlt != null ? d.startAlt : 0.0085))
      .arcEndAltitude(d => (d && d.endAlt != null ? d.endAlt : 0.0085))
      .arcStroke(d => (d && d.stroke != null ? d.stroke : 0.72))
      .arcCurveResolution(arcCurveRes)
      .arcCircularResolution(8)
      .arcDashLength(d => (d && d.dashLength != null ? d.dashLength : 0.38))
      .arcDashGap(d => (d && d.dashGap != null ? d.dashGap : 0.26))
      .arcDashInitialGap(d => (d && d.initialGap != null ? d.initialGap : 0))
      .arcDashAnimateTime(d => (d && d.animateTime != null ? d.animateTime : 2100))
      .arcsTransitionDuration(0)
      .ringLat(d => d.lat)
      .ringLng(d => d.lng)
      .ringAltitude(0.0055)
      .ringColor(d => t => E.utils.hexToRgba(d.color || '#f59e0b', Math.max(0, 0.9 * (1 - t))))
      .ringMaxRadius(d => d.radius || 5)
      .ringPropagationSpeed(1.5)
      .ringRepeatPeriod(1500)
      .ringResolution(36);

    E.bathymetry.configureGlobeSurface();

    // WebGL Camera and Renderer Configuration
    const MIN_CAM_DIST = GLOBE_CONFIG.MIN_CAM_DIST;
    const MAX_CAM_DIST = GLOBE_CONFIG.MAX_CAM_DIST;
    const MIN_CAM_ALT = (MIN_CAM_DIST - 100) / 100;
    const MAX_CAM_ALT = (MAX_CAM_DIST - 100) / 100;
    let camera = null;
    try {
      const renderer = globe.renderer();
      if (renderer) {
        renderer.setPixelRatio(E.utils.getTargetPixelRatio());
        renderer.powerPreference = 'high-performance';
      }
      camera = globe.camera();
      if (camera) {
        camera.near = 1.5;
        camera.far = 4000;
        camera.updateProjectionMatrix();
      }
    } catch (e) {
      console.warn('Renderer configuration:', e);
    }

    const controls = globe.controls();
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.6;
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.enablePan = false;
    controls.minDistance = MIN_CAM_DIST;
    controls.maxDistance = MAX_CAM_DIST;

    const lastValidCamPos = camera ? camera.position.clone() : null;
    const clampCameraBounds = () => {
      if (!camera) return;
      controls.target.set(0, 0, 0);
      const x = camera.position.x;
      const y = camera.position.y;
      const z = camera.position.z;
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
        if (lastValidCamPos) camera.position.copy(lastValidCamPos);
        else camera.position.set(0, 0, 350);
        camera.lookAt(0, 0, 0);
        return;
      }
      const dist = Math.hypot(x, y, z);
      if (dist < 1e-3) {
        if (lastValidCamPos) camera.position.copy(lastValidCamPos);
        else camera.position.set(0, 0, 350);
        camera.lookAt(0, 0, 0);
        return;
      }
      if (dist < MIN_CAM_DIST || dist > MAX_CAM_DIST) {
        const clamped = Math.max(MIN_CAM_DIST, Math.min(MAX_CAM_DIST, dist));
        const s = clamped / dist;
        camera.position.set(x * s, y * s, z * s);
        camera.lookAt(0, 0, 0);
      }
      if (lastValidCamPos) lastValidCamPos.copy(camera.position);
    };

    const origControlsUpdate = controls.update.bind(controls);
    controls.update = (dt) => {
      const updated = origControlsUpdate(dt);
      clampCameraBounds();
      return updated;
    };

    const origPointOfView = globe.pointOfView.bind(globe);
    globe._rawPointOfView = origPointOfView;
    globe.pointOfView = (pov, ms) => {
      if (E.state.viewMode === '2d' && E.map2d) {
        if (!pov) return E.map2d.getPov();
        E.map2d.setPov(pov, ms);
        return globe;
      }
      if (!pov) return origPointOfView();
      const clampedPov = Object.assign({}, pov);
      if (clampedPov.altitude != null && Number.isFinite(+clampedPov.altitude)) {
        clampedPov.altitude = Math.max(MIN_CAM_ALT, Math.min(MAX_CAM_ALT, +clampedPov.altitude));
      }
      const res = origPointOfView(clampedPov, ms);
      if (!ms && controls) {
        controls.update();
      }
      return res;
    };

    const initialAlt = E.utils.getDefaultAltitude();
    if (initialAlt > 2.55) {
      globe.pointOfView({ lat: 20, lng: 0, altitude: initialAlt }, 0);
    }

    const activePointers = new Map();
    let downX = 0, downY = 0;
    let downPointerType = 'mouse';
    let isDragging = false;
    let multiTouchGesture = false;
    let hoverPointerActive = false;
    let hoverClientX = 0, hoverClientY = 0;
    let hoverRafId = 0;

    const flushHoverFrame = () => {
      hoverRafId = 0;
      if (!hoverPointerActive || activePointers.size > 0 || isDragging) return;
      const hit = E.polygons.pickTargetAtScreen(hoverClientX, hoverClientY, false);
      if (hit && hit.__isPin && typeof E.tooltip.showTooltipForPin === 'function') {
        E.tooltip.setGlobeCursor('pointer');
        E.tooltip.showTooltipForPin(hit, hoverClientX, hoverClientY);
      } else if (hit) {
        E.tooltip.setGlobeCursor('pointer');
        E.tooltip.showTooltipForCountry(hit, hoverClientX, hoverClientY);
      } else {
        E.tooltip.hideTooltip();
      }
    };

    const scheduleHoverFrame = () => {
      if (!hoverRafId) {
        hoverRafId = requestAnimationFrame(flushHoverFrame);
      }
    };

    const cancelHoverFrame = () => {
      hoverPointerActive = false;
      if (hoverRafId) {
        cancelAnimationFrame(hoverRafId);
        hoverRafId = 0;
      }
    };

    controls.addEventListener('start', () => {
      E.state.pendingZoomAlt = null;
      E.tooltip.hideTooltip();
      if (E.state.isRotating) {
        controls.autoRotate = false;
      }
    });

    controls.addEventListener('change', () => {
      clampCameraBounds();
      if (hoverPointerActive && activePointers.size === 0 && !isDragging) {
        scheduleHoverFrame();
      }
    });

    controls.addEventListener('end', () => {
      clampCameraBounds();
      if (E.state.isRotating) {
        controls.autoRotate = true;
      }
    });

    el.globeViz.addEventListener('wheel', (e) => {
      if (e.ctrlKey && e.cancelable) e.preventDefault();
    }, { passive: false });

    el.globeViz.addEventListener('touchstart', (e) => {
      if (document.activeElement === el.searchInput) {
        el.searchInput.blur();
      }
      const sel = window.getSelection && window.getSelection();
      if (sel && sel.rangeCount > 0) sel.removeAllRanges();
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    el.globeViz.addEventListener('gesturestart', (e) => {
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    el.globeViz.addEventListener('gesturechange', (e) => {
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    el.globeViz.addEventListener('gestureend', (e) => {
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    el.globeViz.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    document.addEventListener('selectstart', (e) => {
      const target = e.target;
      const tag = target && target.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
      }
    });

    el.globeViz.addEventListener('pointerdown', (e) => {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      cancelHoverFrame();
      if (activePointers.size > 1) {
        multiTouchGesture = true;
        isDragging = true;
        E.tooltip.hideTooltip();
        return;
      }
      isDragging = false;
      multiTouchGesture = false;
      downX = e.clientX;
      downY = e.clientY;
      downPointerType = e.pointerType || 'mouse';
    }, { passive: true });

    const onDesktopHoverCoord = (e) => {
      if (activePointers.size > 0 || (e.pointerType || 'mouse') === 'touch') return;
      if (!Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;
      hoverClientX = e.clientX;
      hoverClientY = e.clientY;
      hoverPointerActive = true;
      scheduleHoverFrame();
    };

    el.globeViz.addEventListener('pointermove', (e) => {
      if (activePointers.size > 0) {
        if (activePointers.has(e.pointerId) && activePointers.size === 1) {
          const dx = e.clientX - downX;
          const dy = e.clientY - downY;
          const dragThreshSq = downPointerType === 'touch' ? 144 : 16;
          if (dx * dx + dy * dy > dragThreshSq) {
            isDragging = true;
            cancelHoverFrame();
            E.tooltip.hideTooltip();
          }
        }
        return;
      }
      onDesktopHoverCoord(e);
    }, { passive: true });

    if ('onpointerrawupdate' in window) {
      el.globeViz.addEventListener('pointerrawupdate', onDesktopHoverCoord, { passive: true });
    }

    const handlePointerEnd = (e, isCancel) => {
      const wasTracked = activePointers.delete(e.pointerId);
      const isPrimaryMouse = (e.pointerType || downPointerType) !== 'mouse' || e.button === 0;
      if (!isCancel && isPrimaryMouse && wasTracked && activePointers.size === 0 && !isDragging && !multiTouchGesture) {
        const isTouch = (e.pointerType || downPointerType) === 'touch';
        if (E.utils.isMobileViewport() && E.state.isLegendExpandedMobile) {
          E.state.isLegendExpandedMobile = false;
          E.controls.syncLegendResponsiveUI();
        }
        const hit = E.polygons.pickTargetAtScreen(e.clientX, e.clientY, isTouch);
        if (E.state.isQuizActive && E.quiz && typeof E.quiz.handleGlobePick === 'function') {
          E.quiz.handleGlobePick(hit);
        } else if (hit && hit.__isPin && E.pins) {
          E.pins.openPinInspector(hit);
        } else if (hit && hit.languages) {
          E.drawer.selectCountry(hit);
        } else if (isTouch && E.utils.isBottomSheetLayout() && E.state.selectedCountry) {
          E.drawer.closeCountryDrawer();
        }
      }
      if (activePointers.size === 0) {
        isDragging = false;
        multiTouchGesture = false;
      }
    };

    el.globeViz.addEventListener('pointerup', (e) => handlePointerEnd(e, false), { passive: true });
    el.globeViz.addEventListener('pointercancel', (e) => handlePointerEnd(e, true), { passive: true });

    el.globeViz.addEventListener('pointerleave', () => {
      if (activePointers.size === 0) {
        isDragging = false;
        multiTouchGesture = false;
      }
      cancelHoverFrame();
      E.tooltip.hideTooltip();
    }, { passive: true });

    let resizeRaf = 0;
    const scheduleViewportSync = (reframe = true) => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        syncViewportSize(reframe);
      });
    };
    window.addEventListener('resize', () => scheduleViewportSync(true), { passive: true });
    window.addEventListener('orientationchange', () => {
      scheduleViewportSync(true);
      setTimeout(() => syncViewportSize(true), 160);
      setTimeout(() => syncViewportSize(true), 380);
    }, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => scheduleViewportSync(false), { passive: true });
    }

    requestAnimationFrame(E.polygons.waitForPolygonsAndMerge);
  }

  E.scene = {
    syncViewportSize,
    initGlobe
  };
})(window);

