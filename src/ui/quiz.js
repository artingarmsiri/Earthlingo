// src/ui/quiz.js - Interactive "Guess the Greeting" Listen & Locate Globe Challenge
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  const quizState = {
    scope: 'all',
    score: 0,
    streak: 0,
    bestStreak: 0,
    roundsPlayed: 0,
    target: null,
    clue: null,
    acceptedKeys: new Set(),
    roundStatus: 'idle', // 'idle' | 'playing' | 'won' | 'revealed'
    wrongGuesses: 0,
    showPhonetic: true,
    showRegionHint: false,
    prevOverlayMode: 'countries',
    hasSavedOverlay: false
  };

  function stripSpoilerParens(raw) {
    if (!raw) return '';
    return String(raw)
      .replace(/\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*\/\s*$/, '')
      .trim();
  }

  function extractGreetingClue(country) {
    const phr = country && country.phrases && country.phrases[0];
    if (!phr || !phr.text) return null;
    const rawClean = stripSpoilerParens(phr.text);
    const primaryPhrase = rawClean.split('/')[0].trim() || rawClean;
    const phonetic = phr.phonetic ? stripSpoilerParens(phr.phonetic) : '';
    const bcp47 = phr.bcp47 || 'en-US';
    return {
      display: rawClean || phr.text,
      spoken: primaryPhrase,
      phonetic,
      bcp47
    };
  }

  function isOverlyGenericGreeting(clueText) {
    if (!clueText) return true;
    const norm = clueText.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    return (
      norm === 'hello' ||
      norm === 'hello hi' ||
      norm === 'hello greetings' ||
      norm === 'good morning' ||
      norm === 'good day' ||
      norm === 'hello good morning'
    );
  }

  function buildQuizPool(scope) {
    const all = E.state.countriesList || [];
    const byScope = all.filter(c => {
      if (!c || !c.centroid || (c.centroid[0] === 0 && c.centroid[1] === 0)) return false;
      const clue = extractGreetingClue(c);
      if (!clue || !clue.spoken) return false;
      if (!scope || scope === 'all') return true;
      if (scope.startsWith('script:')) {
        return (c.__scriptGroup || E.geo.resolveCountryScriptGroup(c).name) === scope.slice(7);
      }
      return c.continent === scope;
    });

    const distinctive = byScope.filter(c => {
      const clue = extractGreetingClue(c);
      return clue && !isOverlyGenericGreeting(clue.display);
    });

    return distinctive.length >= 4 ? distinctive : byScope;
  }

  function computeDirectionHint(fromCountry, toCountry) {
    if (!fromCountry || !toCountry || !fromCountry.centroid || !toCountry.centroid) return null;
    const [lng1, lat1] = fromCountry.centroid;
    const [lng2, lat2] = toCountry.centroid;
    const distKm = Math.round(E.utils.calcAngularDistRad(lng1, lat1, lng2, lat2) * 6371);

    let dLng = lng2 - lng1;
    if (dLng > 180) dLng -= 360;
    if (dLng < -180) dLng += 360;
    const dLat = lat2 - lat1;
    const angle = (Math.atan2(dLng * Math.cos(((lat1 + lat2) * 0.5 * Math.PI) / 180), dLat) * 180) / Math.PI;
    const dirs = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
    const idx = Math.round(((angle + 360) % 360) / 45) % 8;
    return { distKm, bearing: dirs[idx] };
  }

  function speakCurrentClue(buttonEl) {
    if (!quizState.clue) return;
    const dockHint = E.elements.quizDock ? E.elements.quizDock.querySelector('.phrase-voice-hint') : null;
    E.drawer.playSpeechSynthesis(
      quizState.clue.spoken,
      quizState.clue.bcp47,
      buttonEl || (E.elements.quizDock && E.elements.quizDock.querySelector('.quiz-audio-btn')),
      dockHint
    );
  }

  function pickNextRound(autoSpeak = false) {
    const pool = buildQuizPool(quizState.scope);
    if (pool.length === 0) return;

    const prevKey = quizState.target ? E.geo.getCountryKey(quizState.target) : '';
    const candidates = pool.length > 1 ? pool.filter(c => E.geo.getCountryKey(c) !== prevKey) : pool;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const clue = extractGreetingClue(target);

    const accepted = new Set([E.geo.getCountryKey(target)]);
    const targetNorm = (clue && clue.spoken || '').toLowerCase();
    for (let i = 0; i < pool.length; i++) {
      const c = pool[i];
      const cc = extractGreetingClue(c);
      if (cc && cc.spoken.toLowerCase() === targetNorm) {
        accepted.add(E.geo.getCountryKey(c));
      }
    }

    quizState.target = target;
    quizState.clue = clue;
    quizState.acceptedKeys = accepted;
    quizState.roundStatus = 'playing';
    quizState.wrongGuesses = 0;
    quizState.showRegionHint = false;
    E.state.quizHighlightIso = null;
    E.state.quizHighlightColor = null;
    E.polygons.refreshPolygonVisuals();

    renderQuizDock();
    if (autoSpeak) {
      speakCurrentClue();
    }
  }

  function renderQuizDock(feedbackOverride = null) {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    if (!el.quizDock) return;

    el.quizDock.classList.toggle('open', E.state.isQuizActive);
    el.quizDock.setAttribute('aria-hidden', E.state.isQuizActive ? 'false' : 'true');
    if (el.openQuizBtn) el.openQuizBtn.classList.toggle('active', E.state.isQuizActive);

    if (!E.state.isQuizActive || !quizState.target || !quizState.clue) {
      E.overlays.refreshOverlayHudRects();
      return;
    }

    if (el.quizScoreBadge) el.quizScoreBadge.textContent = `Score: ${quizState.score}`;
    if (el.quizStreakBadge) el.quizStreakBadge.textContent = `Streak: ${quizState.streak}`;

    const vs = E.drawer.checkVoiceSupport(quizState.clue.bcp47);
    const showNoVoice = !vs.supported || (vs.voicesLoaded && !vs.hasLocalVoice);
    const target = quizState.target;
    const clue = quizState.clue;
    const scriptGrp = target.__scriptGroup || E.geo.resolveCountryScriptGroup(target).name;

    if (el.quizClueBox) {
      const phoneticHtml = (clue.phonetic && quizState.showPhonetic)
        ? `<div class="quiz-phonetic">Phonetic: /${escapeHtml(clue.phonetic)}/</div>`
        : '';
      const hintLineHtml = quizState.showRegionHint
        ? `<div class="quiz-hint-pill">Hint: ${escapeHtml(target.continent || 'World')} • Script: ${escapeHtml(scriptGrp)} • Family: ${escapeHtml(target.__familyGroup || target.languageFamily || '')}</div>`
        : '';

      el.quizClueBox.innerHTML = `
        <div class="quiz-clue-row phrase-card" data-bcp47="${escapeHtml(clue.bcp47)}">
          <div class="phrase-info">
            <span class="phrase-label">Locate where people say</span>
            <span class="quiz-greeting-text">${escapeHtml(clue.display)}</span>
            ${phoneticHtml}
            <span class="phrase-voice-hint ${showNoVoice ? 'visible' : ''}">No local audio voice — phonetic guide shown</span>
          </div>
          <button type="button" id="quizSpeakBtn" class="speak-btn quiz-audio-btn ${showNoVoice ? 'no-local-voice' : ''}" title="Listen to greeting">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
        </div>
        ${hintLineHtml}
      `;

      const speakBtn = document.getElementById('quizSpeakBtn');
      if (speakBtn) {
        speakBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          speakCurrentClue(speakBtn);
        });
      }
    }

    if (el.quizFeedbackBox) {
      const isDone = quizState.roundStatus === 'won' || quizState.roundStatus === 'revealed';
      if (isDone) {
        const won = quizState.roundStatus === 'won';
        el.quizFeedbackBox.innerHTML = `
          <div class="quiz-result-banner ${won ? 'is-win' : 'is-reveal'}">
            <div class="quiz-result-main">
              <span class="quiz-result-flag">${target.flag || '🌐'}</span>
              <div>
                <strong>${won ? 'Spot on!' : 'Answer:'} ${escapeHtml(target.name)}</strong>
                <div class="quiz-result-sub">${escapeHtml(target.canonicalLanguage || target.primaryLanguage || '')} • ${escapeHtml(target.continent || '')}</div>
              </div>
            </div>
            <div class="quiz-action-btns">
              <button type="button" id="quizViewProfileBtn" class="quiz-btn-secondary">Profile</button>
              <button type="button" id="quizNextBtn" class="quiz-btn-primary">Next →</button>
            </div>
          </div>
        `;
        const profBtn = document.getElementById('quizViewProfileBtn');
        const nextBtn = document.getElementById('quizNextBtn');
        if (profBtn) {
          profBtn.addEventListener('click', () => {
            const c = quizState.target;
            stopQuiz({ restoreOverlay: true, skipRouter: true });
            if (c) E.drawer.selectCountry(c, true);
          });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', () => pickNextRound(true));
        }
      } else {
        const fbHtml = feedbackOverride
          ? `<div class="quiz-guess-msg ${feedbackOverride.tone}">${escapeHtml(feedbackOverride.text)}</div>`
          : `<div class="quiz-guess-msg is-prompt">Click the matching country on the 3D globe!</div>`;
        el.quizFeedbackBox.innerHTML = `
          ${fbHtml}
          <div class="quiz-controls-row">
            <button type="button" id="quizPhoneticToggleBtn" class="quiz-mini-btn ${quizState.showPhonetic ? 'active' : ''}">${quizState.showPhonetic ? 'Hide Phonetic' : 'Show Phonetic'}</button>
            <button type="button" id="quizHintBtn" class="quiz-mini-btn" ${quizState.showRegionHint ? 'disabled' : ''}>Region Hint</button>
            <button type="button" id="quizRevealBtn" class="quiz-mini-btn">Reveal</button>
            <button type="button" id="quizSkipBtn" class="quiz-mini-btn">Skip</button>
          </div>
        `;

        const phBtn = document.getElementById('quizPhoneticToggleBtn');
        const hBtn = document.getElementById('quizHintBtn');
        const rBtn = document.getElementById('quizRevealBtn');
        const sBtn = document.getElementById('quizSkipBtn');
        if (phBtn) {
          phBtn.addEventListener('click', () => {
            quizState.showPhonetic = !quizState.showPhonetic;
            renderQuizDock(feedbackOverride);
          });
        }
        if (hBtn) {
          hBtn.addEventListener('click', () => {
            quizState.showRegionHint = true;
            renderQuizDock(feedbackOverride);
          });
        }
        if (rBtn) {
          rBtn.addEventListener('click', () => {
            quizState.roundStatus = 'revealed';
            quizState.streak = 0;
            quizState.roundsPlayed++;
            const tk = E.geo.getCountryKey(quizState.target);
            E.state.quizHighlightIso = tk;
            E.state.quizHighlightColor = '#f59e0b';
            E.polygons.refreshPolygonVisuals();
            if (E.state.globe && quizState.target.centroid) {
              const [lng, lat] = quizState.target.centroid;
              E.state.globe.pointOfView({ lat: E.utils.isBottomSheetLayout() ? Math.max(-72, lat - 14) : lat, lng, altitude: E.utils.getSelectAltitude() }, 600);
            }
            renderQuizDock();
          });
        }
        if (sBtn) {
          sBtn.addEventListener('click', () => {
            quizState.streak = 0;
            pickNextRound(true);
          });
        }
      }
    }

    E.overlays.refreshOverlayHudRects();
  }

  function handleGlobePick(hitCountry) {
    if (!E.state.isQuizActive || !quizState.target) return false;
    if (quizState.roundStatus !== 'playing') return true;
    if (!hitCountry) return true;

    const hitKey = E.geo.getCountryKey(hitCountry);
    if (quizState.acceptedKeys.has(hitKey)) {
      const matchedCountry = E.state.languagesDb[hitKey] || hitCountry;
      quizState.target = matchedCountry;
      quizState.roundStatus = 'won';
      quizState.score += Math.max(10, 30 - quizState.wrongGuesses * 5);
      quizState.streak += 1;
      quizState.bestStreak = Math.max(quizState.bestStreak, quizState.streak);
      quizState.roundsPlayed++;
      E.state.quizHighlightIso = hitKey;
      E.state.quizHighlightColor = '#10b981';
      E.polygons.refreshPolygonVisuals();
      if (E.state.globe && matchedCountry.centroid) {
        const [lng, lat] = matchedCountry.centroid;
        E.state.globe.pointOfView({ lat: E.utils.isBottomSheetLayout() ? Math.max(-72, lat - 14) : lat, lng, altitude: E.utils.getSelectAltitude() }, 550);
      }
      renderQuizDock();
      return true;
    }

    quizState.wrongGuesses++;
    quizState.streak = 0;
    const hint = computeDirectionHint(hitCountry, quizState.target);
    let tone = 'is-cold';
    let badge = 'Far away';
    if (hint && hint.distKm < 1500) {
      tone = 'is-warm';
      badge = 'Hot! Very close';
    } else if (hint && hint.distKm < 4200) {
      tone = 'is-mild';
      badge = 'Getting warmer';
    }
    const text = hint
      ? `${hitCountry.name} — ${badge} (~${hint.distKm.toLocaleString()} km ${hint.bearing})`
      : `${hitCountry.name} — Not quite, try another nation!`;
    renderQuizDock({ tone, text });
    return true;
  }

  function startQuiz(scope) {
    if (scope) quizState.scope = scope;
    if (!quizState.hasSavedOverlay) {
      quizState.prevOverlayMode = E.state.mapOverlayMode || 'countries';
      quizState.hasSavedOverlay = true;
    }

    // Close competing UI drawers/modals/filters cleanly so the globe is bright and unobscured
    E.drawer.closeCountryDrawer({ skipRouter: true });
    if (E.compare && typeof E.compare.closeCompareModal === 'function') {
      E.compare.closeCompareModal({ skipRouter: true });
    }
    if (E.controls && typeof E.controls.clearLanguageFilter === 'function') {
      E.controls.clearLanguageFilter({ skipRouter: true });
    }
    if (E.state.showArcs && E.arcs) {
      E.state.showArcs = false;
      if (E.elements.toggleArcsBtn) E.elements.toggleArcsBtn.classList.remove('active');
      E.arcs.updateArcs();
    }
    if (E.elements.listModal) {
      E.elements.listModal.classList.remove('open');
      E.elements.listModal.setAttribute('aria-hidden', 'true');
    }
    if (E.elements.infoModal) {
      E.elements.infoModal.classList.remove('open');
      E.elements.infoModal.setAttribute('aria-hidden', 'true');
    }
    if (E.state.isOverlayMenuOpen) {
      E.state.isOverlayMenuOpen = false;
      E.overlays.syncOverlayMenuUI();
    }
    if (E.state.isLegendExpandedMobile) {
      E.state.isLegendExpandedMobile = false;
      E.controls.syncLegendResponsiveUI();
    }
    E.overlays.setMapOverlayMode('off', { skipSync: true, skipRouter: true });

    if (E.state.globe) {
      const controls = E.state.globe.controls();
      if (controls) controls.autoRotate = false;
    }

    E.state.isQuizActive = true;
    if (E.elements.quizScopeSelect) E.elements.quizScopeSelect.value = quizState.scope;
    pickNextRound(true);
    E.tooltip.hideTooltip();
  }

  function stopQuiz(opts = {}) {
    if (!E.state.isQuizActive) return;
    E.state.isQuizActive = false;
    E.state.quizHighlightIso = null;
    E.state.quizHighlightColor = null;

    if (elDock()) {
      elDock().classList.remove('open');
      elDock().setAttribute('aria-hidden', 'true');
    }
    if (E.elements.openQuizBtn) E.elements.openQuizBtn.classList.remove('active');

    if (opts.restoreOverlay !== false && quizState.hasSavedOverlay) {
      const restoreMode = quizState.prevOverlayMode || 'countries';
      quizState.hasSavedOverlay = false;
      E.overlays.setMapOverlayMode(restoreMode, { skipSync: true, skipRouter: Boolean(opts.skipRouter) });
    }

    if (E.state.isRotating && E.state.globe) {
      const controls = E.state.globe.controls();
      if (controls) controls.autoRotate = true;
    }
    E.polygons.refreshPolygonVisuals();
    E.overlays.refreshOverlayHudRects();
    E.overlays.markOverlaysDirty(true);
  }

  function elDock() {
    return E.elements.quizDock;
  }

  function initQuiz() {
    const el = E.elements;
    if (el.openQuizBtn) {
      el.openQuizBtn.addEventListener('click', () => {
        if (E.state.isQuizActive) stopQuiz({ restoreOverlay: true });
        else startQuiz(quizState.scope);
      });
    }
    if (el.closeQuizBtn) {
      el.closeQuizBtn.addEventListener('click', () => stopQuiz({ restoreOverlay: true }));
    }
    if (el.quizScopeSelect) {
      el.quizScopeSelect.addEventListener('change', (e) => {
        quizState.scope = e.target.value || 'all';
        if (E.state.isQuizActive) pickNextRound(true);
      });
    }
  }

  function getDebugState() {
    return {
      isActive: E.state.isQuizActive,
      scope: quizState.scope,
      score: quizState.score,
      streak: quizState.streak,
      roundStatus: quizState.roundStatus,
      targetIso: quizState.target ? quizState.target.iso3 : null,
      targetName: quizState.target ? quizState.target.name : null,
      wrongGuesses: quizState.wrongGuesses
    };
  }

  E.quiz = {
    quizState,
    initQuiz,
    startQuiz,
    stopQuiz,
    pickNextRound,
    handleGlobePick,
    getDebugState
  };
})(window);
