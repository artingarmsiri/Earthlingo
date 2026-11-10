// src/ui/timeline.js - Historical Time-Scrubber ("Languages Before 1492" Mode)
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});
  const ERA_ORDER = ['2000bce', '100ce', '1000ce', '1492ce', 'today'];
  let timelinePlayTimer = null;
  let timelineEventsBound = false;

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

    if (E.legend) {
      E.legend.renderLegendChips();
      E.legend.syncLegendResponsiveUI();
    }
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
        if (E.legend) E.legend.syncLegendResponsiveUI();
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
    if (timelineEventsBound) return;
    timelineEventsBound = true;
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
      el.timelineEraButtons.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('[data-era]');
        if (!btn) return;
        stopTimelinePlay();
        const eraId = btn.getAttribute('data-era');
        if (eraId) setTimeEra(eraId);
      });
    }
  }

  E.timeline = {
    ERA_ORDER,
    stopTimelinePlay,
    setTimeEra,
    toggleTimeline,
    toggleTimelinePlay,
    initTimeScrubber
  };
})(window);

