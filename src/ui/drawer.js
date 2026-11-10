// src/ui/drawer.js - Country Details Drawer, Mobile Bottom-Sheet Pull Gestures & Web Speech TTS
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

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

  function selectCountry(country, animateCamera = true) {
    if (!country) return;
    if (!E.state.selectedCountry && E.state.activeOriginCorridor && E.state.activeOriginCorridor !== 'country') {
      E.state._prevCorridorBeforeCountry = E.state.activeOriginCorridor;
    }
    E.state.selectedCountry = country;
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

    renderCountryDrawer(country);
  }

  function renderCountryDrawer(c) {
    const el = E.elements;
    const { escapeHtml } = E.utils;

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

    el.drawerDiversityBadge.textContent = c.diversityLevel || 'Multilingual Diversity';
    el.drawerSummary.textContent = c.summary || 'Rich linguistic landscape with distinct regional and national cultural varieties.';

    if (el.drawerOriginSection && el.drawerOriginCard) {
      const ORIGINS = global.WORLD_ORIGINS;
      const origin = ORIGINS && typeof ORIGINS.resolveCountryOrigin === 'function'
        ? ORIGINS.resolveCountryOrigin(c)
        : null;
      if (origin) {
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

        const animBtn = document.getElementById('animateCountryOriginBtn');
        if (animBtn) {
          animBtn.addEventListener('click', () => {
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
              E.arcs.frameCountryOriginCamera(c, origin);
            }
            E.arcs.syncDrawerOriginButton();
          });
        }
      } else {
        el.drawerOriginSection.style.display = 'none';
      }
    }

    // Spoken Languages (First Section)
    const languages = c.languages || [];
    el.languagesCount.textContent = `${languages.length} Language${languages.length === 1 ? '' : 's'}`;

    if (languages.length === 0) {
      el.drawerLanguagesList.innerHTML = `<div class="lang-notes">Information about spoken languages is being updated.</div>`;
    } else {
      el.drawerLanguagesList.innerHTML = languages.map(lang => {
        const pctNum = parseFloat(lang.percentage) || 20;
        return `
          <div class="language-card">
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
              ${lang.script ? `<span class="lang-tag">Script: ${escapeHtml(lang.script)}</span>` : ''}
              ${lang.speakers ? `<span class="lang-tag">~${escapeHtml(lang.speakers)} speakers</span>` : ''}
            </div>

            ${lang.notes ? `<div class="lang-notes">${escapeHtml(lang.notes)}</div>` : ''}
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

    // Interactive Phrasebook with Audio TTS
    const phrases = c.phrases || [];
    if (phrases.length === 0) {
      el.drawerPhrasesList.innerHTML = `<div class="lang-notes">Common phrase audio is being updated.</div>`;
    } else {
      el.drawerPhrasesList.innerHTML = phrases.map((ph, idx) => `
        <div class="phrase-card">
          <div class="phrase-info">
            <span class="phrase-label">${escapeHtml(ph.type || 'Phrase')}</span>
            <span class="phrase-text">${escapeHtml(ph.text)}</span>
            ${ph.phonetic ? `<span class="phrase-phonetic">/${escapeHtml(ph.phonetic)}/</span>` : ''}
          </div>
          <button class="speak-btn" data-phrase-idx="${idx}" title="Listen to pronunciation" aria-label="Listen to phrase">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
        </div>
      `).join('');

      el.drawerPhrasesList.querySelectorAll('.speak-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-phrase-idx'), 10);
          const phrase = phrases[idx];
          if (phrase) {
            playSpeechSynthesis(phrase.text, phrase.bcp47 || 'en-US', btn);
          }
        });
      });
    }

    el.drawerFunFact.textContent = c.funFact || `${c.name} has a captivating linguistic history with rich local spoken traditions!`;

    el.countryDrawer.classList.add('open');
    el.countryDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-is-open');
    setMobileDrawerSnap('half', true);
    E.overlays.refreshOverlayHudRects();
    E.overlays.markOverlaysDirty(true);
  }

  function closeCountryDrawer() {
    const drawer = E.elements.countryDrawer;
    if (!drawer) return;
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
  }

  function setupMobileDrawerGestures() {
    const drawer = E.elements.countryDrawer;
    const header = E.elements.drawerHeader;
    const body = E.elements.drawerBody;
    if (!drawer || !header) return;

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

  function playSpeechSynthesis(text, bcp47, buttonEl) {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser. Please try Chrome, Edge, Safari, or Firefox.');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.split('/')[0].replace(/\([^)]*\)/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = bcp47 || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const matchVoice = voices.find(v => v.lang === bcp47 || v.lang.startsWith(bcp47.split('-')[0]));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
    }

    if (buttonEl) {
      buttonEl.classList.add('speaking');
      utterance.onend = () => buttonEl.classList.remove('speaking');
      utterance.onerror = () => buttonEl.classList.remove('speaking');
    }

    window.speechSynthesis.speak(utterance);
  }

  E.drawer = {
    getSheetMetrics,
    setMobileDrawerSnap,
    selectCountry,
    renderCountryDrawer,
    closeCountryDrawer,
    setupMobileDrawerGestures,
    playSpeechSynthesis
  };
})(window);
