// src/ui/tooltip.js - High-Frequency Desktop Hover Tooltip
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  let tooltipBoxW = 240;
  let tooltipBoxH = 64;
  let tooltipVisible = false;
  let tooltipPlaceBelow = false;
  let lastGlobeCursor = '';
  let lastTipTx = NaN;
  let lastTipTy = NaN;

  function setGlobeCursor(nextCursor) {
    const gv = E.elements.globeViz;
    if (gv && lastGlobeCursor !== nextCursor) {
      lastGlobeCursor = nextCursor;
      gv.style.cursor = nextCursor;
    }
  }

  function showTooltipForCountry(country, clientX, clientY) {
    const el = E.elements.globeHoverTooltip;
    if (!el || !country) return;
    const { escapeHtml } = E.utils;

    if (E.state.hoveredCountry !== country) {
      E.state.hoveredCountry = country;
      if (country.languages) {
        const langColor = country.color || '#38bdf8';
        const langSummary = country.languages.length > 1
          ? country.languages.slice(0, 3).map(l => `${escapeHtml(l.name)}${l.percentage ? ` (${escapeHtml(l.percentage)})` : ''}`).join(', ')
          : escapeHtml(country.canonicalLanguage || country.primaryLanguage || '');
        const multiCount = country.languages.length;
        const accentCount = country.accents ? country.accents.length : 0;
        el.innerHTML = `
          <div class="custom-globe-tooltip">
            <div class="tooltip-title"><span>${country.flag || '🌐'}</span> <span>${escapeHtml(country.name)}</span></div>
            <div class="tooltip-lang">Languages: <b style="color: ${langColor};">${langSummary}</b></div>
            <div class="tooltip-hint">${multiCount} language${multiCount === 1 ? '' : 's'} • ${accentCount} accent${accentCount === 1 ? '' : 's'} • Click for details</div>
          </div>
        `;
      } else {
        el.innerHTML = `<div class="custom-globe-tooltip"><b>${escapeHtml(country.name)}</b></div>`;
      }
      if (!tooltipVisible) {
        el.classList.add('visible');
        tooltipVisible = true;
      }
      tooltipBoxW = el.offsetWidth || 240;
      tooltipBoxH = el.offsetHeight || 64;
    } else if (!tooltipVisible) {
      el.classList.add('visible');
      tooltipVisible = true;
    }

    const vw = E.renderBatch.viewportW || window.innerWidth;
    const vh = E.renderBatch.viewportH || window.innerHeight;
    const halfW = tooltipBoxW * 0.5;
    const rawTx = Math.max(12, Math.min(vw - tooltipBoxW - 12, clientX - halfW));

    const aboveTop = clientY - tooltipBoxH - 14;
    if (!tooltipPlaceBelow && aboveTop < 12) tooltipPlaceBelow = true;
    else if (tooltipPlaceBelow && aboveTop >= 24) tooltipPlaceBelow = false;

    const rawTy = tooltipPlaceBelow
      ? Math.min(vh - tooltipBoxH - 12, clientY + 20)
      : Math.max(12, aboveTop);

    const dpr = window.devicePixelRatio || 1;
    const tx = Math.round(rawTx * dpr) / dpr;
    const ty = Math.round(rawTy * dpr) / dpr;
    if (tx !== lastTipTx || ty !== lastTipTy) {
      lastTipTx = tx;
      lastTipTy = ty;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    }
  }

  function hideTooltip() {
    if (E.state.hoveredCountry || tooltipVisible) {
      E.state.hoveredCountry = null;
      tooltipVisible = false;
      tooltipPlaceBelow = false;
      lastTipTx = NaN;
      lastTipTy = NaN;
      if (E.elements.globeHoverTooltip) {
        E.elements.globeHoverTooltip.classList.remove('visible');
      }
    }
    setGlobeCursor('default');
  }

  E.tooltip = {
    setGlobeCursor,
    showTooltipForCountry,
    hideTooltip
  };
})(window);

