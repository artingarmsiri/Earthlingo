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
  let lastTipSig = '';

  function setGlobeCursor(nextCursor) {
    const is2d = E.state && E.state.viewMode === '2d';
    const targetCursor = is2d && nextCursor === 'default' ? 'grab' : nextCursor;
    const targetEl = is2d ? E.elements.map2dCanvas : E.elements.globeViz;
    if (targetEl && lastGlobeCursor !== targetCursor) {
      lastGlobeCursor = targetCursor;
      targetEl.style.cursor = targetCursor;
    }
  }

  function positionTooltipAt(el, clientX, clientY) {
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

  function showTooltipForPin(pinObj, clientX, clientY) {
    const el = E.elements.globeHoverTooltip;
    if (!el || !pinObj || !pinObj.item) return;
    const { escapeHtml } = E.utils;
    const item = pinObj.item;
    const sig = `pin|${pinObj.kind}|${item.id}`;

    if (lastTipSig !== sig) {
      E.state.hoveredCountry = null;
      E.state.hoveredPinItem = item;
      lastTipSig = sig;
      if (pinObj.kind === 'endangered') {
        el.innerHTML = `
          <div class="custom-globe-tooltip">
            <div class="tooltip-title"><span style="color:${escapeHtml(item.color || '#ef4444')};">●</span> <span>${escapeHtml(item.name)}</span></div>
            <div class="tooltip-lang">${escapeHtml(item.status)} • <b>${escapeHtml(item.countryName || '')}</b></div>
            <div class="tooltip-hint">Click beacon to inspect revitalization profile</div>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="custom-globe-tooltip">
            <div class="tooltip-title"><span style="color:${escapeHtml(item.color || '#f59e0b')};">✦</span> <span>${escapeHtml(item.country)} — “${escapeHtml(item.word)}”</span></div>
            <div class="tooltip-lang">${escapeHtml(item.nativeScript || '')} • <b>${escapeHtml(item.era || '')}</b></div>
            <div class="tooltip-hint">Click stop for cognate etymology note</div>
          </div>
        `;
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

    positionTooltipAt(el, clientX, clientY);
  }

  function showTooltipForCountry(country, clientX, clientY) {
    const el = E.elements.globeHoverTooltip;
    if (!el || !country) return;
    const { escapeHtml } = E.utils;
    const colorBy = E.state.colorByMode || 'language';
    const eraId = E.state.activeTimeEra || 'today';
    const quizOn = Boolean(E.state.isQuizActive);
    const sig = `${country.iso3 || country.name}|${colorBy}|${eraId}|${quizOn ? 1 : 0}`;

    if (E.state.hoveredCountry !== country || lastTipSig !== sig) {
      E.state.hoveredCountry = country;
      E.state.hoveredPinItem = null;
      lastTipSig = sig;
      if (quizOn) {
        el.innerHTML = `
          <div class="custom-globe-tooltip">
            <div class="tooltip-title"><span>${country.flag || '🌐'}</span> <span>${escapeHtml(country.name)}</span></div>
            <div class="tooltip-hint">Click to submit your Quiz guess</div>
          </div>
        `;
      } else if (eraId !== 'today' && global.WORLD_HISTORICAL_ERAS) {
        const eraState = global.WORLD_HISTORICAL_ERAS.getCountryEraState(country, eraId);
        const eraMeta = global.WORLD_HISTORICAL_ERAS.ERAS.find(x => x.id === eraId);
        const yearLbl = eraMeta ? eraMeta.yearLabel : eraId;
        el.innerHTML = `
          <div class="custom-globe-tooltip">
            <div class="tooltip-title"><span>${country.flag || '🌐'}</span> <span>${escapeHtml(country.name)} (${escapeHtml(yearLbl)})</span></div>
            <div class="tooltip-lang"><b style="color: ${escapeHtml((eraState && eraState.color) || '#38bdf8')};">${escapeHtml((eraState && eraState.label) || '')}</b></div>
            <div class="tooltip-hint">${escapeHtml((eraState && eraState.family) || '')} • Click for modern profile</div>
          </div>
        `;
      } else if (country.languages) {
        const langColor = E.geo.getCountryColorForMode(country, colorBy);
        const langSummary = country.languages.length > 1
          ? country.languages.slice(0, 3).map(l => `${escapeHtml(l.name)}${l.percentage ? ` (${escapeHtml(l.percentage)})` : ''}`).join(', ')
          : escapeHtml(country.canonicalLanguage || country.primaryLanguage || '');
        const multiCount = country.languages.length;
        const accentCount = country.accents ? country.accents.length : 0;
        let modeLine = '';
        if (colorBy === 'family') {
          modeLine = `<div class="tooltip-lang">Family: <b style="color: ${langColor};">${escapeHtml(country.__familyGroup || country.languageFamily || '')}</b></div>`;
        } else if (colorBy === 'script') {
          const scrMeta = E.labelFormatter && E.labelFormatter.resolveCountryScriptMeta(country);
          modeLine = `<div class="tooltip-lang">Script: <b style="color: ${langColor};">${escapeHtml((scrMeta && scrMeta.fullDetail) || country.__scriptGroup || '')}</b></div>`;
        } else if (colorBy === 'diversity') {
          const ldiStr = country.ldiScore != null ? Number(country.ldiScore).toFixed(2) : '—';
          const livStr = country.livingLanguages || multiCount;
          modeLine = `<div class="tooltip-lang">Diversity: <b style="color: ${langColor};">${escapeHtml(country.__diversityTier || country.ldiTier || '')} (LDI ${escapeHtml(ldiStr)}, ~${escapeHtml(String(livStr))} langs)</b></div>`;
        } else {
          modeLine = `<div class="tooltip-lang">Languages: <b style="color: ${langColor};">${langSummary}</b></div>`;
        }
        el.innerHTML = `
          <div class="custom-globe-tooltip">
            <div class="tooltip-title"><span>${country.flag || '🌐'}</span> <span>${escapeHtml(country.name)}</span></div>
            ${modeLine}
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

    positionTooltipAt(el, clientX, clientY);
  }

  function hideTooltip() {
    if (E.state.hoveredCountry || E.state.hoveredPinItem || tooltipVisible) {
      E.state.hoveredCountry = null;
      E.state.hoveredPinItem = null;
      tooltipVisible = false;
      tooltipPlaceBelow = false;
      lastTipTx = NaN;
      lastTipTy = NaN;
      lastTipSig = '';
      if (E.elements.globeHoverTooltip) {
        E.elements.globeHoverTooltip.classList.remove('visible');
      }
    }
    setGlobeCursor('default');
  }

  E.tooltip = {
    setGlobeCursor,
    showTooltipForPin,
    showTooltipForCountry,
    hideTooltip
  };
})(window);

