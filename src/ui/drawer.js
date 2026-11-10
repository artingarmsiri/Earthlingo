// src/ui/drawer.js - Country Details Drawer, Mobile Bottom-Sheet Pull Gestures & Web Speech TTS
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  let drawerEventsBound = false;
  let gesturesBound = false;
  let currentRenderedCountry = null;
  let currentRenderedHotspots = [];
  let currentRenderedPhrases = [];
  let currentRenderedOrigin = null;
  let cachedSpeechVoices = null;

  function clearDrawerHudSyncListeners() {
    const drawer = E.elements.countryDrawer;
    if (drawer) {
      if (drawer._hudSyncTimer) {
        clearTimeout(drawer._hudSyncTimer);
        drawer._hudSyncTimer = null;
      }
      if (drawer._hudTransFn) {
        drawer.removeEventListener('transitionend', drawer._hudTransFn);
        drawer._hudTransFn = null;
      }
    }
    const bar = E.elements.globeControlsBar;
    if (bar && bar._hudTransFn) {
      bar.removeEventListener('transitionend', bar._hudTransFn);
      bar._hudTransFn = null;
    }
  }

  function measureSheetPeekHeight(vh) {
    const hdr = E.elements.drawerHeader;
    const hdrH = hdr ? Math.ceil(hdr.getBoundingClientRect().height) : 116;
    return Math.max(96, Math.min(Math.round(vh * 0.29), hdrH + 4));
  }

  function getSheetMetrics() {
    const vh = E.utils.getSheetViewportHeight();
    const peekH = measureSheetPeekHeight(vh);
    const halfH = Math.min(vh - 76, Math.max(peekH + 92, Math.round(vh * 0.54)));
    return { vh, peekH, halfH, fullH: vh };
  }

  function setMobileDrawerSnap(snap, clearInline = true) {
    const drawer = E.elements.countryDrawer;
    if (!drawer) return;
    clearDrawerHudSyncListeners();
    const targetSnap = (snap === 'peek' || snap === 'half' || snap === 'full') ? snap : 'half';
    E.state.mobileDrawerSnap = targetSnap;

    if (clearInline) {
      drawer.classList.remove('is-dragging');
      drawer.style.height = '';
      drawer.style.transform = '';
      drawer.style.borderRadius = '';
    }

    if (!E.utils.isBottomSheetLayout()) {
      drawer.classList.remove('snap-peek', 'snap-half', 'snap-full');
      document.body.classList.remove('drawer-peek');
      document.documentElement.style.removeProperty('--drawer-peek-h');
      if (E.overlays && typeof E.overlays.refreshOverlayHudRects === 'function') {
        E.overlays.refreshOverlayHudRects();
      }
      return;
    }

    drawer.classList.toggle('snap-peek', targetSnap === 'peek');
    drawer.classList.toggle('snap-half', targetSnap === 'half');
    drawer.classList.toggle('snap-full', targetSnap === 'full');

    if (targetSnap === 'peek' && drawer.classList.contains('open')) {
      const vh = E.utils.getSheetViewportHeight();
      const peekH = measureSheetPeekHeight(vh);
      document.documentElement.style.setProperty('--drawer-peek-h', `${peekH}px`);
      document.body.classList.add('drawer-peek');
    } else {
      document.body.classList.remove('drawer-peek');
    }

    if (E.elements.drawerSnapBtn) {
      const isFull = targetSnap === 'full';
      E.elements.drawerSnapBtn.setAttribute(
        'aria-label',
        isFull
          ? 'Minimize country panel'
          : (targetSnap === 'peek' ? 'Restore country panel' : 'Expand country panel to full screen')
      );
      E.elements.drawerSnapBtn.setAttribute(
        'title',
        isFull ? 'Restore split view' : (targetSnap === 'peek' ? 'Expand details' : 'Full screen')
      );
    }

    if (E.overlays && typeof E.overlays.refreshOverlayHudRects === 'function') {
      const syncHud = () => {
        if (E.overlays && typeof E.overlays.refreshOverlayHudRects === 'function') {
          E.overlays.refreshOverlayHudRects();
          E.overlays.markOverlaysDirty(false);
        }
      };
      syncHud();
      if (drawer._hudSyncTimer) clearTimeout(drawer._hudSyncTimer);
      drawer._hudSyncTimer = setTimeout(syncHud, 280);
      if (drawer._hudTransFn) drawer.removeEventListener('transitionend', drawer._hudTransFn);
      drawer._hudTransFn = (ev) => {
        if (ev.target === drawer && (ev.propertyName === 'height' || ev.propertyName === 'transform')) {
          drawer.removeEventListener('transitionend', drawer._hudTransFn);
          drawer._hudTransFn = null;
          syncHud();
        }
      };
      drawer.addEventListener('transitionend', drawer._hudTransFn);
      const bar = E.elements.globeControlsBar;
      if (bar) {
        if (bar._hudTransFn) bar.removeEventListener('transitionend', bar._hudTransFn);
        bar._hudTransFn = (ev) => {
          if (ev.target === bar && ev.propertyName === 'bottom') {
            bar.removeEventListener('transitionend', bar._hudTransFn);
            bar._hudTransFn = null;
            syncHud();
          }
        };
        bar.addEventListener('transitionend', bar._hudTransFn);
      }
    }
  }

  function selectCountry(country, animateCamera = true, opts = {}) {
    if (!country) return;
    if (E.state.isQuizActive && !opts.allowDuringQuiz && E.quiz && typeof E.quiz.stopQuiz === 'function') {
      E.quiz.stopQuiz({ restoreOverlay: true, skipRouter: true });
    }
    if (!E.state.selectedCountry && E.state.activeOriginCorridor && E.state.activeOriginCorridor !== 'country') {
      E.state._prevCorridorBeforeCountry = E.state.activeOriginCorridor;
    }
    E.state.selectedCountry = country;
    E.state.quizHighlightIso = null;
    E.state.quizHighlightColor = null;
    E.tooltip.hideTooltip();

    if (E.state.isLegendExpandedMobile) {
      E.state.isLegendExpandedMobile = false;
      E.controls.syncLegendResponsiveUI();
    }
    if (E.utils.isMobileViewport() && E.state.isOverlayMenuOpen) {
      E.state.isOverlayMenuOpen = false;
      E.overlays.syncOverlayMenuUI();
    }

    E.polygons.refreshPolygonVisuals();
    E.overlays.markOverlaysDirty(true);

    if (E.state.globe && E.state.showArcs) {
      E.state.activeOriginCorridor = 'country';
      E.arcs.updateArcs();
    }

    if (animateCamera && E.state.globe && country.centroid) {
      E.state.pendingZoomAlt = null;
      const [lng, lat] = country.centroid;
      if (lat !== 0 || lng !== 0) {
        const controls = E.state.globe.controls();
        if (controls) controls.autoRotate = false;
        const selectAlt = E.utils.getSelectAltitude();
        const targetLat = E.utils.isBottomSheetLayout()
          ? Math.max(-72, Math.min(72, lat - 15))
          : lat;
        E.state.globe.pointOfView({ lat: targetLat, lng, altitude: selectAlt }, E.config.GLOBE_CONFIG.SELECT_FLY_MS);
      }
    }

    renderCountryDrawer(country, opts);
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function renderCountryDrawer(c, opts = {}) {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    currentRenderedCountry = c;
    currentRenderedHotspots = [];
    currentRenderedOrigin = null;
    currentRenderedPhrases = c.phrases || [];

    if (el.drawerBody) {
      el.drawerBody.scrollTop = 0;
    }
    el.drawerFlag.textContent = c.flag || '🌐';
    el.drawerCountryName.textContent = c.name || c.commonName || 'Unknown Country';
    el.drawerNativeName.textContent = c.officialName ? `${c.officialName} • ${c.nativeName || ''}` : (c.nativeName || '');

    const canonLang = c.canonicalLanguage || c.primaryLanguage || 'Unknown';
    const langColor = c.color || '#0284c7';
    el.drawerBadges.innerHTML = `
      <span class="meta-badge" style="background: ${langColor}28; border-color: ${langColor}; color: #ffffff; font-weight: 700;">
        <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background:${langColor}; box-shadow: 0 0 6px ${langColor}; margin-right:4px;"></span>
        ${escapeHtml(canonLang)}
      </span>
      <span class="meta-badge">${escapeHtml(c.languageFamily || 'Language Family')}</span>
      <span class="meta-badge">📍 ${escapeHtml(c.capital || 'Capital')}</span>
      <span class="meta-badge">👥 ${escapeHtml(c.population || 'Population')}</span>
      <span class="meta-badge">🌍 ${escapeHtml(c.continent || 'Continent')}</span>
    `;

    if (E.passport && typeof E.passport.recordCountryExplore === 'function') {
      E.passport.recordCountryExplore(c);
    }
    if (E.trip && typeof E.trip.syncTripUI === 'function') {
      E.trip.syncTripUI();
    }

    const divParts = [];
    if (c.ldiTier) divParts.push(c.ldiTier);
    else if (c.diversityLevel) divParts.push(c.diversityLevel);
    if (typeof c.livingLanguages === 'number' && c.livingLanguages > 0) {
      divParts.push(`~${c.livingLanguages.toLocaleString()} living`);
    }
    if (typeof c.ldiScore === 'number' && c.ldiScore > 0) {
      divParts.push(`LDI ${c.ldiScore.toFixed(2)}`);
    }
    el.drawerDiversityBadge.textContent = divParts.length > 0 ? divParts.join(' • ') : 'Multilingual Diversity';
    el.drawerSummary.textContent = c.summary || 'Rich linguistic landscape with distinct regional and national cultural varieties.';

    if (el.drawerEndangeredCallout) {
      const H = global.WORLD_HISTORICAL_ERAS;
      const cIso = (c.iso3 || '').toUpperCase();
      const hotspots = (H && Array.isArray(H.ENDANGERED_HOTSPOTS))
        ? H.ENDANGERED_HOTSPOTS.filter(h => (h.iso3 || '').toUpperCase() === cIso)
        : [];
      const activeEra = E.state.activeTimeEra || 'today';
      const eraInfo = (H && activeEra !== 'today' && typeof H.getCountryEraState === 'function')
        ? H.getCountryEraState(c, activeEra)
        : null;

      let calloutHtml = '';
      if (eraInfo) {
        const eraMeta = (H.ERAS || []).find(er => er.id === activeEra);
        calloutHtml += `
          <div class="drawer-era-callout">
            <div class="drawer-callout-head">
              <span class="drawer-callout-dot" style="background:${escapeHtml(eraInfo.color || '#38bdf8')};"></span>
              <strong>${escapeHtml((eraMeta && eraMeta.yearLabel) || activeEra)}: ${escapeHtml(eraInfo.label)}</strong>
            </div>
            <div class="drawer-callout-note">${escapeHtml(eraInfo.note)}</div>
          </div>
        `;
      }
      if (hotspots.length > 0) {
        calloutHtml += hotspots.map(h => `
          <div class="drawer-endangered-card">
            <div class="drawer-callout-head">
              <span class="drawer-callout-dot" style="background:${escapeHtml(h.color || '#ef4444')};"></span>
              <strong>Endangered Hotspot: ${escapeHtml(h.name)}</strong>
              <span class="drawer-hotspot-status">${escapeHtml(h.status)}</span>
            </div>
            <div class="drawer-callout-note">${escapeHtml(h.revitalizationNote || '')}</div>
            <button type="button" class="drawer-pin-jump-btn" data-pin-id="${escapeHtml(h.id)}">Show Pin on 3D Globe →</button>
          </div>
        `).join('');
      }
      el.drawerEndangeredCallout.innerHTML = calloutHtml;
      el.drawerEndangeredCallout.hidden = !calloutHtml;
      currentRenderedHotspots = hotspots;
    }

    if (el.drawerOriginSection && el.drawerOriginCard) {
      const ORIGINS = global.WORLD_ORIGINS;
      const origin = ORIGINS && typeof ORIGINS.resolveCountryOrigin === 'function'
        ? ORIGINS.resolveCountryOrigin(c)
        : null;
      if (origin) {
        currentRenderedOrigin = origin;
        el.drawerOriginSection.style.display = 'flex';
        if (el.drawerOriginEra) {
          const rawEra = (origin.era || '').split('•')[0].replace(/\([^)]*\)/g, '').replace(/\s*→\s*c\.\s*/g, ' → ').replace(/\s+/g, ' ').trim();
          el.drawerOriginEra.textContent = rawEra.length > 28 ? `${rawEra.slice(0, 26).trim()}…` : (rawEra || 'Lineage');
        }
        const isThisCountryAnimating = Boolean(
          E.state.showArcs &&
          E.state.activeOriginCorridor === 'country' &&
          E.state.selectedCountry &&
          E.geo.getCountryKey(E.state.selectedCountry) === E.geo.getCountryKey(c)
        );
        const hasArcPath = Boolean(
          (origin.chain && origin.chain.length > 0) ||
          (origin.secondaryRoutes && origin.secondaryRoutes.length > 0)
        );
        const secondaryHtml = (origin.secondaryRoutes && origin.secondaryRoutes.length > 0)
          ? `<div class="origin-driver-row"><span class="arcs-meta-label">Secondary / Contact Stratum</span>${origin.secondaryRoutes.map(sr => escapeHtml(sr.label)).join(' • ')}</div>`
          : '';
        el.drawerOriginCard.innerHTML = `
          <div class="origin-homeland-banner">${escapeHtml(origin.homeland)}</div>
          <div class="origin-driver-row">
            <span class="arcs-meta-label">Era &amp; Dispersal Mechanism</span>
            <div><strong style="color:#f8fafc;">${escapeHtml(origin.era)}</strong></div>
            <div style="margin-top:3px;">${escapeHtml(origin.driver)}</div>
          </div>
          ${secondaryHtml}
          ${origin.stages && origin.stages.length > 0 ? `
            <div class="origin-stages-list">
              ${origin.stages.map(st => `
                <div class="origin-stage-item">
                  <span class="origin-stage-era">${escapeHtml(st.era)}</span>
                  <span>${escapeHtml(st.label)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <p class="origin-notes-text">${escapeHtml(origin.notes)}</p>
          ${hasArcPath ? `
            <button type="button" id="animateCountryOriginBtn" class="origin-animate-btn ${isThisCountryAnimating ? 'active' : ''}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M4 14.5c4-4.5 12-4.5 16 0"></path>
                <path d="M7 11.5c2.5-3 7.5-3 10 0"></path>
                <circle cx="4" cy="15" r="1.5"></circle>
                <circle cx="20" cy="15" r="1.5"></circle>
              </svg>
              <span>${isThisCountryAnimating ? 'Animating Origin Arcs (Click to Hide)' : 'Animate Origin Arcs on Globe'}</span>
            </button>
          ` : ''}
        `;
      } else {
        el.drawerOriginSection.style.display = 'none';
      }
    }

    // Spoken Languages (First Section) — Interactive Spotlight Cards
    const languages = c.languages || [];
    el.languagesCount.textContent = `${languages.length} Language${languages.length === 1 ? '' : 's'}`;

    if (languages.length === 0) {
      el.drawerLanguagesList.innerHTML = `<div class="lang-notes">Information about spoken languages is being updated.</div>`;
    } else {
      const spokenIndex = E.state.spokenIndex;
      const activeSpoken = E.state.activeFilterSpokenLang;

      el.drawerLanguagesList.innerHTML = languages.map(lang => {
        const pctNum = parseFloat(lang.percentage) || 20;
        const scriptLabel = (E.labelFormatter && typeof E.labelFormatter.resolveLanguageScriptLabel === 'function')
          ? E.labelFormatter.resolveLanguageScriptLabel(lang, c)
          : (lang.script || 'Latin');
        const tokens = (lang.__tokens && lang.__tokens.length > 0)
          ? lang.__tokens
          : E.geo.extractSpokenLanguageTokens(lang);

        const tokenStats = tokens.map(tok => {
          const rec = spokenIndex && spokenIndex.get(tok);
          return {
            token: tok,
            count: rec ? rec.countries.size : 1,
            color: (rec && rec.color) || langColor
          };
        });

        // Default token when clicking card body: pick most distinctive multi-nation / minority token if bundled
        const defaultStat = tokenStats.length === 1
          ? tokenStats[0]
          : (tokenStats.find(s => !['English', 'Spanish', 'French'].includes(s.token)) || tokenStats[0]);
        const isCardActive = Boolean(activeSpoken && tokenStats.some(s => s.token === activeSpoken));

        const spotlightRowHtml = tokenStats.length > 1
          ? `<div class="lang-spotlight-chips" aria-label="Spotlight spoken languages">
              <span class="lang-spotlight-prefix">Spotlight:</span>
              ${tokenStats.map(s => `
                <button type="button" class="lang-spotlight-chip ${activeSpoken === s.token ? 'active' : ''}" data-spotlight-token="${escapeHtml(s.token)}" data-spotlight-color="${s.color}">
                  <span>${escapeHtml(s.token)}</span>
                  <span class="chip-count">${s.count}</span>
                </button>
              `).join('')}
            </div>`
          : `<div class="lang-spotlight-hint">
              <span class="lang-spotlight-dot" style="background: ${defaultStat.color};"></span>
              <span>${isCardActive
                ? `Highlighting all ${defaultStat.count} nation${defaultStat.count === 1 ? '' : 's'} — Click to reset`
                : (defaultStat.count > 1
                  ? `Spoken in ${defaultStat.count} nations — Click to spotlight`
                  : `Spotlight ${escapeHtml(defaultStat.token)} on globe`)
              }</span>
            </div>`;

        return `
          <div class="language-card is-interactive ${isCardActive ? 'spotlight-active' : ''}" data-default-token="${escapeHtml(defaultStat.token)}" data-default-color="${defaultStat.color}" role="button" tabindex="0" aria-pressed="${isCardActive ? 'true' : 'false'}">
            <div class="lang-header">
              <div class="lang-name-row">
                <span class="lang-name">${escapeHtml(lang.name)}</span>
                ${lang.nativeName ? `<span class="lang-native">(${escapeHtml(lang.nativeName)})</span>` : ''}
              </div>
              <span class="lang-percentage">${escapeHtml(lang.percentage || '')}</span>
            </div>

            <div class="lang-progress-bar">
              <div class="lang-progress-fill" style="width: ${Math.min(100, Math.max(5, pctNum))}%;"></div>
            </div>

            <div class="lang-tags">
              <span class="lang-tag">${escapeHtml(lang.type || 'Language')}</span>
              ${lang.family ? `<span class="lang-tag">${escapeHtml(lang.family)}</span>` : ''}
              <button type="button" class="lang-tag is-script-trigger" data-script="${escapeHtml(scriptLabel)}" title="Meet the ${escapeHtml(scriptLabel)} script — Interactive character breakdown">Script: ${escapeHtml(scriptLabel)} ⓘ</button>
              ${lang.speakers ? `<span class="lang-tag">~${escapeHtml(lang.speakers)} speakers</span>` : ''}
            </div>

            ${lang.notes ? `<div class="lang-notes">${escapeHtml(lang.notes)}</div>` : ''}
            ${spotlightRowHtml}
          </div>
        `;
      }).join('');
    }

    // Accents & Regional Dialects
    const accents = c.accents || [];
    el.accentsCount.textContent = `${accents.length} Accent${accents.length === 1 ? '' : 's'}`;

    if (accents.length === 0) {
      el.drawerAccentsList.innerHTML = `<div class="lang-notes">Regional accents and colloquial varieties exist throughout the provinces.</div>`;
    } else {
      el.drawerAccentsList.innerHTML = accents.map(acc => `
        <div class="accent-card">
          <div class="accent-title-row">
            <span class="accent-name">${escapeHtml(acc.name)}</span>
            <span class="accent-region">${escapeHtml(acc.region || '')}</span>
          </div>
          <p class="accent-desc">${escapeHtml(acc.description || '')}</p>
          ${acc.sample ? `
            <div class="accent-sample">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>${escapeHtml(acc.sample)}</span>
            </div>
          ` : ''}
        </div>
      `).join('');
    }

    // Interactive Phrasebook with Audio TTS + Voice Availability Feedback
    const phrases = c.phrases || [];
    if (phrases.length === 0) {
      el.drawerPhrasesList.innerHTML = `<div class="lang-notes">Common phrase audio is being updated.</div>`;
    } else {
      el.drawerPhrasesList.innerHTML = phrases.map((ph, idx) => {
        const bcp = ph.bcp47 || 'en-US';
        const vs = checkVoiceSupport(bcp);
        const showNoVoice = !vs.supported || (vs.voicesLoaded && !vs.hasLocalVoice);
        return `
          <div class="phrase-card" data-bcp47="${escapeHtml(bcp)}">
            <div class="phrase-info">
              <span class="phrase-label">${escapeHtml(ph.type || 'Phrase')}</span>
              <span class="phrase-text">${escapeHtml(ph.text)}</span>
              ${ph.phonetic ? `<span class="phrase-phonetic">/${escapeHtml(ph.phonetic)}/</span>` : ''}
              <span class="phrase-voice-hint ${showNoVoice ? 'visible' : ''}">No local audio voice — phonetic guide shown</span>
            </div>
            <button class="speak-btn ${showNoVoice ? 'no-local-voice' : ''}" data-phrase-idx="${idx}" title="${showNoVoice ? `No local audio voice for ${escapeHtml(bcp)} — phonetic guide shown` : 'Listen to pronunciation'}" aria-label="Listen to phrase">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
          </div>
        `;
      }).join('');
    }

    el.drawerFunFact.textContent = c.funFact || `${c.name} has a captivating linguistic history with rich local spoken traditions!`;

    el.countryDrawer.classList.add('open');
    el.countryDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-is-open');
    setMobileDrawerSnap((opts && opts.snap) || 'half', true);
    E.overlays.refreshOverlayHudRects();
    E.overlays.markOverlaysDirty(true);
  }

  function syncDrawerSpotlightCards() {
    const list = E.elements.drawerLanguagesList;
    if (!list) return;
    const active = E.state.activeFilterSpokenLang;
    const spokenIndex = E.state.spokenIndex;

    list.querySelectorAll('.language-card[data-default-token]').forEach(card => {
      const defTok = card.getAttribute('data-default-token');
      const chips = card.querySelectorAll('.lang-spotlight-chip');
      let matchedAny = false;
      if (chips.length > 0) {
        chips.forEach(ch => {
          const t = ch.getAttribute('data-spotlight-token');
          const on = Boolean(active && t === active);
          ch.classList.toggle('active', on);
          if (on) matchedAny = true;
        });
      } else {
        matchedAny = Boolean(active && defTok === active);
        const hintSpan = card.querySelector('.lang-spotlight-hint > span:last-child');
        if (hintSpan && defTok) {
          const rec = spokenIndex && spokenIndex.get(defTok);
          const count = rec ? rec.countries.size : 1;
          hintSpan.textContent = matchedAny
            ? `Highlighting all ${count} nation${count === 1 ? '' : 's'} — Click to reset`
            : (count > 1 ? `Spoken in ${count} nations — Click to spotlight` : `Spotlight ${defTok} on globe`);
        }
      }
      card.classList.toggle('spotlight-active', matchedAny);
      card.setAttribute('aria-pressed', matchedAny ? 'true' : 'false');
    });
  }

  function closeCountryDrawer(opts = {}) {
    const drawer = E.elements.countryDrawer;
    if (!drawer) return;
    clearDrawerHudSyncListeners();
    drawer.classList.remove('open', 'is-dragging', 'snap-peek', 'snap-half', 'snap-full');
    drawer.style.height = '';
    drawer.style.transform = '';
    drawer.style.borderRadius = '';
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-is-open', 'drawer-peek');
    document.documentElement.style.removeProperty('--drawer-peek-h');
    E.state.mobileDrawerSnap = 'half';
    E.state.selectedCountry = null;

    if (E.state.activeOriginCorridor === 'country') {
      E.state.activeOriginCorridor = E.state.activeFilterLanguage
        ? 'filter'
        : (E.state._prevCorridorBeforeCountry || 'all');
    }

    E.polygons.refreshPolygonVisuals();
    E.overlays.refreshOverlayHudRects();
    E.overlays.markOverlaysDirty(true);

    if (E.state.globe) {
      if (E.state.showArcs) E.arcs.updateArcs();
      if (E.state.isRotating) {
        const controls = E.state.globe.controls();
        if (controls) controls.autoRotate = true;
      }
    }
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function setupMobileDrawerGestures() {
    const drawer = E.elements.countryDrawer;
    const header = E.elements.drawerHeader;
    const body = E.elements.drawerBody;
    if (!drawer || !header || gesturesBound) return;
    gesturesBound = true;

    if (E.elements.drawerCompareBtn) {
      E.elements.drawerCompareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (E.compare && typeof E.compare.openCompareWithCountry === 'function') {
          E.compare.openCompareWithCountry(E.state.selectedCountry);
        }
      });
    }

    if (E.elements.drawerShareBtn) {
      E.elements.drawerShareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (E.router && typeof E.router.copyCurrentShareLink === 'function') {
          E.router.copyCurrentShareLink(E.elements.drawerShareBtn);
        }
      });
    }

    if (E.elements.drawerSnapBtn) {
      E.elements.drawerSnapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!E.utils.isBottomSheetLayout() || !drawer.classList.contains('open')) return;
        const cur = E.state.mobileDrawerSnap;
        const next = cur === 'full' ? 'half' : (cur === 'peek' ? 'half' : 'full');
        setMobileDrawerSnap(next, true);
      });
    }

    const drag = {
      active: false,
      mode: null,
      pointerId: null,
      startSnap: 'half',
      startH: 0,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      prevY: 0,
      lastTs: 0,
      prevTs: 0,
      moved: false
    };

    const startDragState = (mode, pointerId, clientX, clientY) => {
      const metrics = getSheetMetrics();
      const measuredH = Math.round(drawer.getBoundingClientRect().height);
      const startH = Math.max(
        metrics.peekH,
        Math.min(
          metrics.fullH,
          measuredH || (E.state.mobileDrawerSnap === 'full' ? metrics.fullH : (E.state.mobileDrawerSnap === 'peek' ? metrics.peekH : metrics.halfH))
        )
      );
      const now = performance.now();
      drag.active = true;
      drag.mode = mode;
      drag.pointerId = pointerId;
      drag.startSnap = E.state.mobileDrawerSnap || 'half';
      drag.startH = startH;
      drag.startX = clientX;
      drag.startY = clientY;
      drag.lastX = clientX;
      drag.lastY = clientY;
      drag.prevY = clientY;
      drag.lastTs = now;
      drag.prevTs = now;
      drag.moved = false;
    };

    const applyDragFrame = (clientX, clientY) => {
      if (!drag.active) return;
      const now = performance.now();
      if (now - drag.lastTs >= 12) {
        drag.prevY = drag.lastY;
        drag.prevTs = drag.lastTs;
      }
      drag.lastX = clientX;
      drag.lastY = clientY;
      drag.lastTs = now;

      const dy = clientY - drag.startY;
      if (!drag.moved && Math.hypot(clientX - drag.startX, dy) >= 5) {
        drag.moved = true;
        drawer.classList.add('is-dragging');
        document.body.classList.remove('drawer-peek');
      }
      if (!drag.moved) return;

      const metrics = getSheetMetrics();
      const rawH = drag.startH - dy;

      if (rawH >= metrics.fullH) {
        drawer.style.height = `${metrics.fullH}px`;
        drawer.style.transform = 'translate3d(0, 0, 0)';
        drawer.style.borderRadius = '0px';
      } else if (rawH >= metrics.peekH) {
        drawer.style.height = `${Math.round(rawH)}px`;
        drawer.style.transform = 'translate3d(0, 0, 0)';
        const r = rawH >= metrics.fullH - 28
          ? Math.max(0, Math.round(18 * (metrics.fullH - rawH) / 28))
          : 18;
        drawer.style.borderRadius = `${r}px ${r}px 0 0`;
      } else {
        const extraDown = Math.max(0, metrics.peekH - rawH);
        drawer.style.height = `${metrics.peekH}px`;
        drawer.style.transform = `translate3d(0, ${Math.round(extraDown)}px, 0)`;
        drawer.style.borderRadius = '18px 18px 0 0';
      }
    };

    const finishDrag = (isCancel) => {
      if (!drag.active) return;
      const wasMoved = drag.moved;
      const startSnap = drag.startSnap;
      const startH = drag.startH;
      const startY = drag.startY;
      const lastY = drag.lastY;
      const prevY = drag.prevY;
      const dt = Math.max(10, drag.lastTs - drag.prevTs);
      const vy = (lastY - prevY) / dt;
      drag.active = false;
      drag.mode = null;
      drag.pointerId = null;

      if (isCancel) {
        drawer.classList.remove('is-dragging');
        setMobileDrawerSnap(startSnap, true);
        return;
      }

      if (!wasMoved) {
        drawer.classList.remove('is-dragging');
        setMobileDrawerSnap(startSnap === 'peek' ? 'half' : startSnap, true);
        return;
      }

      const metrics = getSheetMetrics();
      const dy = lastY - startY;
      const rawH = startH - dy;
      const dismissDropThreshold = Math.max(40, metrics.peekH * 0.40);

      if (
        rawH < metrics.peekH - dismissDropThreshold ||
        (startSnap === 'peek' && vy > 0.45 && dy > 20) ||
        (vy > 1.25 && rawH < metrics.halfH * 0.72)
      ) {
        drawer.classList.remove('is-dragging');
        void drawer.offsetHeight;
        closeCountryDrawer();
        return;
      }

      let nextSnap;
      if (vy < -0.55) {
        if (startSnap === 'peek') {
          nextSnap = rawH > metrics.halfH + 36 ? 'full' : 'half';
        } else {
          nextSnap = 'full';
        }
      } else if (vy > 0.55) {
        if (startSnap === 'full') {
          nextSnap = rawH < (metrics.peekH + metrics.halfH) * 0.5 ? 'peek' : 'half';
        } else {
          nextSnap = 'peek';
        }
      } else {
        const projectedH = Math.max(metrics.peekH, Math.min(metrics.fullH, rawH - vy * 130));
        const dPeek = Math.abs(projectedH - metrics.peekH);
        const dHalf = Math.abs(projectedH - metrics.halfH);
        const dFull = Math.abs(projectedH - metrics.fullH);
        if (dFull <= dHalf && dFull <= dPeek) nextSnap = 'full';
        else if (dPeek <= dHalf) nextSnap = 'peek';
        else nextSnap = 'half';
      }

      drawer.classList.remove('is-dragging');
      void drawer.offsetHeight;
      setMobileDrawerSnap(nextSnap, true);
    };

    header.addEventListener('pointerdown', (e) => {
      if (!E.utils.isBottomSheetLayout() || !drawer.classList.contains('open')) return;
      if (typeof e.button === 'number' && e.button !== 0) return;
      if (e.target && e.target.closest('button, a, input, select, textarea')) return;
      if (drag.active) return;
      startDragState('pointer', e.pointerId, e.clientX, e.clientY);
    });

    window.addEventListener('pointermove', (e) => {
      if (!drag.active || drag.mode !== 'pointer' || e.pointerId !== drag.pointerId) return;
      applyDragFrame(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('pointerup', (e) => {
      if (!drag.active || drag.mode !== 'pointer' || e.pointerId !== drag.pointerId) return;
      finishDrag(false);
    }, { passive: true });

    window.addEventListener('pointercancel', (e) => {
      if (!drag.active || drag.mode !== 'pointer' || e.pointerId !== drag.pointerId) return;
      finishDrag(true);
    }, { passive: true });

    if (body) {
      let bodyTouch = null;

      body.addEventListener('touchstart', (e) => {
        if (!E.utils.isBottomSheetLayout() || !drawer.classList.contains('open')) return;
        if (e.touches.length !== 1 || drag.active) return;
        const t = e.touches[0];
        bodyTouch = {
          id: t.identifier,
          startX: t.clientX,
          startY: t.clientY,
          engaged: false,
          rejected: false,
          canPullDown: body.scrollTop <= 1,
          isPeek: E.state.mobileDrawerSnap === 'peek'
        };
      }, { passive: true });

      body.addEventListener('touchmove', (e) => {
        if (!bodyTouch || !E.utils.isBottomSheetLayout() || !drawer.classList.contains('open')) return;
        let t = null;
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === bodyTouch.id) {
            t = e.touches[i];
            break;
          }
        }
        if (!t) return;

        if (!bodyTouch.engaged) {
          if (bodyTouch.rejected) return;
          const dx = t.clientX - bodyTouch.startX;
          const dy = t.clientY - bodyTouch.startY;
          if (Math.abs(dx) + Math.abs(dy) < 6) return;
          if (Math.abs(dx) > Math.abs(dy) * 1.1) {
            bodyTouch.rejected = true;
            return;
          }
          const wantsMinimize = dy > 6 && (bodyTouch.canPullDown && body.scrollTop <= 1);
          const wantsExpandFromPeek = dy < -6 && bodyTouch.isPeek;
          if (wantsMinimize || wantsExpandFromPeek) {
            bodyTouch.engaged = true;
            startDragState('touch', bodyTouch.id, bodyTouch.startX, bodyTouch.startY);
            if (e.cancelable) e.preventDefault();
            applyDragFrame(t.clientX, t.clientY);
          } else {
            bodyTouch.rejected = true;
          }
          return;
        }

        if (drag.active && drag.mode === 'touch') {
          if (e.cancelable) e.preventDefault();
          applyDragFrame(t.clientX, t.clientY);
        }
      }, { passive: false });

      const onBodyTouchEnd = (e, isCancel) => {
        if (!bodyTouch) return;
        let ended = false;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === bodyTouch.id) {
            ended = true;
            break;
          }
        }
        if (!ended) return;
        const wasEngaged = bodyTouch.engaged;
        bodyTouch = null;
        if (wasEngaged && drag.active && drag.mode === 'touch') {
          finishDrag(isCancel);
        }
      };

      body.addEventListener('touchend', (e) => onBodyTouchEnd(e, false), { passive: true });
      body.addEventListener('touchcancel', (e) => onBodyTouchEnd(e, true), { passive: true });
    }
  }

  const TTS_BASE_ALIASES = {
    he: ['he', 'iw'],
    iw: ['iw', 'he'],
    id: ['id', 'in'],
    in: ['in', 'id'],
    nb: ['nb', 'no', 'nn'],
    nn: ['nn', 'no', 'nb'],
    no: ['no', 'nb', 'nn']
  };

  function getSpeechVoices() {
    if (!('speechSynthesis' in window)) return [];
    if (cachedSpeechVoices && cachedSpeechVoices.length > 0) return cachedSpeechVoices;
    cachedSpeechVoices = window.speechSynthesis.getVoices() || [];
    return cachedSpeechVoices;
  }

  function findSpeechVoice(bcp47) {
    if (!('speechSynthesis' in window)) return null;
    const voices = getSpeechVoices();
    if (voices.length === 0) return null;
    const target = String(bcp47 || 'en-US').toLowerCase().replace('_', '-');
    const base = target.split('-')[0];
    const altBases = TTS_BASE_ALIASES[base] || [base];

    return (
      voices.find(v => String(v.lang || '').toLowerCase().replace('_', '-') === target) ||
      voices.find(v => {
        const vBase = String(v.lang || '').toLowerCase().replace('_', '-').split('-')[0];
        return altBases.includes(vBase);
      }) ||
      null
    );
  }

  function checkVoiceSupport(bcp47) {
    if (!('speechSynthesis' in window)) {
      return { supported: false, voicesLoaded: false, hasLocalVoice: false, voice: null };
    }
    const voices = getSpeechVoices();
    const voice = findSpeechVoice(bcp47);
    return {
      supported: true,
      voicesLoaded: voices.length > 0,
      hasLocalVoice: Boolean(voice),
      voice
    };
  }

  function refreshVisiblePhraseHints() {
    document.querySelectorAll('.phrase-card[data-bcp47]').forEach(card => {
      const bcp = card.getAttribute('data-bcp47') || 'en-US';
      const vs = checkVoiceSupport(bcp);
      const showNoVoice = !vs.supported || (vs.voicesLoaded && !vs.hasLocalVoice);
      const hint = card.querySelector('.phrase-voice-hint');
      const btn = card.querySelector('.speak-btn');
      if (hint) hint.classList.toggle('visible', showNoVoice);
      if (btn) btn.classList.toggle('no-local-voice', showNoVoice);
    });
  }

  function handleVoicesChanged() {
    cachedSpeechVoices = null;
    refreshVisiblePhraseHints();
  }

  if ('speechSynthesis' in window && typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
  }

  function playSpeechSynthesis(text, bcp47, buttonEl, hintEl) {
    const targetCard = buttonEl ? buttonEl.closest('.phrase-card') : null;
    const resolvedHint = hintEl || (targetCard ? targetCard.querySelector('.phrase-voice-hint') : null);

    if (!('speechSynthesis' in window)) {
      if (resolvedHint) resolvedHint.classList.add('visible');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = String(text || '').split('/')[0].replace(/\([^)]*\)/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = bcp47 || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const support = checkVoiceSupport(bcp47);
    if (support.voice) {
      utterance.voice = support.voice;
    }
    if (!support.hasLocalVoice) {
      if (resolvedHint) resolvedHint.classList.add('visible');
      if (buttonEl) buttonEl.classList.add('no-local-voice');
    }

    if (buttonEl) {
      buttonEl.classList.add('speaking');
      utterance.onend = () => buttonEl.classList.remove('speaking');
      utterance.onerror = () => {
        buttonEl.classList.remove('speaking');
        if (resolvedHint) resolvedHint.classList.add('visible');
      };
    }

    try {
      window.speechSynthesis.speak(utterance);
    } catch (_err) {
      if (buttonEl) buttonEl.classList.remove('speaking');
      if (resolvedHint) resolvedHint.classList.add('visible');
    }
  }

  function initDrawer() {
    if (drawerEventsBound) return;
    drawerEventsBound = true;
    const el = E.elements;

    if (el.drawerEndangeredCallout) {
      el.drawerEndangeredCallout.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('.drawer-pin-jump-btn[data-pin-id]');
        if (!btn) return;
        const pinId = btn.getAttribute('data-pin-id');
        const pin = currentRenderedHotspots.find(h => h.id === pinId);
        if (!pin) return;
        if (!E.state.showEndangeredPins && E.controls && typeof E.controls.toggleEndangeredPins === 'function') {
          E.controls.toggleEndangeredPins(true);
        }
        if (E.pins && typeof E.pins.openPinInspector === 'function') {
          E.pins.openPinInspector(pin);
        }
        if (E.state.globe) {
          E.state.globe.pointOfView({ lat: pin.lat, lng: pin.lng, altitude: Math.min(1.6, E.utils.getSelectAltitude()) }, 650);
        }
        if (E.utils.isBottomSheetLayout()) {
          setMobileDrawerSnap('peek', true);
        }
      });
    }

    if (el.drawerOriginCard) {
      el.drawerOriginCard.addEventListener('click', (e) => {
        const animBtn = e.target && e.target.closest('#animateCountryOriginBtn');
        if (!animBtn) return;
        const c = currentRenderedCountry || E.state.selectedCountry;
        const currentlyActive = Boolean(E.state.showArcs && E.state.activeOriginCorridor === 'country');
        if (currentlyActive) {
          E.state.showArcs = false;
          if (el.toggleArcsBtn) el.toggleArcsBtn.classList.remove('active');
          E.arcs.updateArcs();
        } else {
          E.state.showArcs = true;
          E.state.activeOriginCorridor = 'country';
          if (el.toggleArcsBtn) el.toggleArcsBtn.classList.add('active');
          E.arcs.updateArcs();
          if (c && currentRenderedOrigin) {
            E.arcs.frameCountryOriginCamera(c, currentRenderedOrigin);
          }
        }
        E.arcs.syncDrawerOriginButton();
        if (E.router && typeof E.router.syncUrlHash === 'function') {
          E.router.syncUrlHash();
        }
      });
    }

    if (el.drawerLanguagesList) {
      el.drawerLanguagesList.addEventListener('click', (e) => {
        const tgt = e.target;
        if (!tgt) return;

        const scrBtn = tgt.closest('.is-script-trigger');
        if (scrBtn) {
          e.stopPropagation();
          const scr = scrBtn.getAttribute('data-script');
          if (E.scriptInspector && typeof E.scriptInspector.openScript === 'function') {
            E.scriptInspector.openScript(scr, currentRenderedCountry || E.state.selectedCountry);
          }
          return;
        }

        const chip = tgt.closest('.lang-spotlight-chip');
        if (chip) {
          e.stopPropagation();
          const tok = chip.getAttribute('data-spotlight-token');
          const col = chip.getAttribute('data-spotlight-color');
          if (tok && E.controls && typeof E.controls.filterBySpokenLanguage === 'function') {
            E.controls.filterBySpokenLanguage(tok, col);
          }
          return;
        }

        const card = tgt.closest('.language-card[data-default-token]');
        if (card) {
          const tok = card.getAttribute('data-default-token');
          const col = card.getAttribute('data-default-color');
          if (tok && E.controls && typeof E.controls.filterBySpokenLanguage === 'function') {
            E.controls.filterBySpokenLanguage(tok, col);
          }
        }
      });

      el.drawerLanguagesList.addEventListener('keydown', (e) => {
        const card = e.target && e.target.matches && e.target.matches('.language-card[data-default-token]') ? e.target : null;
        if (!card) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const tok = card.getAttribute('data-default-token');
          const col = card.getAttribute('data-default-color');
          if (tok && E.controls && typeof E.controls.filterBySpokenLanguage === 'function') {
            E.controls.filterBySpokenLanguage(tok, col);
          }
        }
      });
    }

    if (el.drawerPhrasesList) {
      el.drawerPhrasesList.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('.speak-btn[data-phrase-idx]');
        if (!btn) return;
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-phrase-idx'), 10);
        const phrase = currentRenderedPhrases[idx];
        if (phrase) {
          playSpeechSynthesis(phrase.text, phrase.bcp47 || 'en-US', btn);
        }
      });
    }
  }

  E.drawer = {
    getSheetMetrics,
    setMobileDrawerSnap,
    selectCountry,
    renderCountryDrawer,
    syncDrawerSpotlightCards,
    closeCountryDrawer,
    setupMobileDrawerGestures,
    findSpeechVoice,
    checkVoiceSupport,
    playSpeechSynthesis,
    initDrawer
  };
})(window);
