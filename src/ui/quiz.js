// src/ui/quiz.js - Interactive "Guess the Greeting" Quiz, Daily Seeded Challenge, Script Detective & Dialect Trivia
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  const quizState = {
    mode: 'globe', // 'globe' | 'daily' | 'script' | 'dialect'
    scope: 'all',
    score: 0,
    streak: 0,
    bestStreak: 0,
    roundsPlayed: 0,
    target: null,
    clue: null,
    dialectChallenge: null,
    acceptedKeys: new Set(),
    roundStatus: 'idle', // 'idle' | 'playing' | 'won' | 'revealed' | 'daily_done'
    wrongGuesses: 0,
    showPhonetic: true,
    showRegionHint: false,
    prevOverlayMode: 'countries',
    hasSavedOverlay: false,
    // Daily seeded 5-round challenge state
    dailyDateKey: '',
    dailyTargets: [],
    dailyIndex: 0,
    dailyRounds: []
  };

  function getTodayDateKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function hashSeedString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

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

  function hasNonLatinScriptGlyphs(text) {
    if (!text) return false;
    return /[^\u0000-\u024F\s.,!?'"’()\/\-:;0-9]/.test(String(text));
  }

  function buildQuizPool(scope, modeOverride) {
    const mode = modeOverride || quizState.mode;
    const all = E.state.countriesList || [];
    const byScope = all.filter(c => {
      if (!c || !c.centroid || (c.centroid[0] === 0 && c.centroid[1] === 0)) return false;
      const clue = extractGreetingClue(c);
      if (!clue || !clue.spoken) return false;
      if (mode === 'daily') return true;
      if (!scope || scope === 'all') return true;
      if (scope.startsWith('script:')) {
        return (c.__scriptGroup || E.geo.resolveCountryScriptGroup(c).name) === scope.slice(7);
      }
      return c.continent === scope;
    });

    if (mode === 'script') {
      const nonLatin = byScope.filter(c => {
        const sg = c.__scriptGroup || E.geo.resolveCountryScriptGroup(c).name;
        const clue = extractGreetingClue(c);
        return sg !== 'Latin' && clue && hasNonLatinScriptGlyphs(clue.spoken);
      });
      if (nonLatin.length >= 4) return nonLatin;
      // Fallback to all non-Latin countries globally if current scope only contains Latin scripts
      const globalNonLatin = all.filter(c => {
        if (!c || !c.centroid || (c.centroid[0] === 0 && c.centroid[1] === 0)) return false;
        const sg = c.__scriptGroup || E.geo.resolveCountryScriptGroup(c).name;
        const clue = extractGreetingClue(c);
        return sg !== 'Latin' && clue && hasNonLatinScriptGlyphs(clue.spoken);
      });
      if (globalNonLatin.length >= 4) return globalNonLatin;
    }

    if (mode === 'dialect') {
      const withDialects = byScope.filter(c =>
        Array.isArray(c.accents) &&
        c.accents.some(a => a && a.name && a.description && a.description.length > 14)
      );
      if (withDialects.length >= 4) return withDialects;
      return all.filter(c =>
        c && c.centroid && Array.isArray(c.accents) && c.accents.some(a => a && a.name && a.description)
      );
    }

    const distinctive = byScope.filter(c => {
      const clue = extractGreetingClue(c);
      return clue && !isOverlyGenericGreeting(clue.display);
    });

    return distinctive.length >= 4 ? distinctive : byScope;
  }

  function sanitizeCountrySpoiler(text, country) {
    if (!text || !country) return text || '';
    let clean = String(text);
    const terms = [country.name, country.commonName, country.officialName, country.capital]
      .filter(Boolean)
      .filter(t => t.length >= 4);
    terms.forEach(term => {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      clean = clean.replace(new RegExp(`\\b${esc}\\b`, 'gi'), 'this nation');
    });
    return clean;
  }

  function buildDialectQuestion(target, pool) {
    const validAccents = (target.accents || []).filter(a => a && a.name && a.description);
    const accent = validAccents[Math.floor(Math.random() * validAccents.length)] || (target.accents && target.accents[0]);
    if (!accent) return null;

    const targetKey = E.geo.getCountryKey(target);
    const sameContinent = pool.filter(c => E.geo.getCountryKey(c) !== targetKey && c.continent === target.continent);
    const otherPool = pool.filter(c => E.geo.getCountryKey(c) !== targetKey && c.continent !== target.continent);
    const shuffledSame = sameContinent.slice().sort(() => Math.random() - 0.5);
    const shuffledOther = otherPool.slice().sort(() => Math.random() - 0.5);
    const distractors = shuffledSame.concat(shuffledOther).slice(0, 3);
    const options = [target].concat(distractors).sort(() => Math.random() - 0.5);

    return {
      accentName: sanitizeCountrySpoiler(accent.name, target),
      region: accent.region || target.continent || 'Regional variety',
      description: sanitizeCountrySpoiler(accent.description, target),
      sample: accent.sample ? sanitizeCountrySpoiler(accent.sample, target) : '',
      options: options.map(opt => ({
        iso3: E.geo.getCountryKey(opt),
        name: opt.name,
        flag: opt.flag || '🌐',
        sub: opt.canonicalLanguage || opt.primaryLanguage || ''
      })),
      pickedIso: null
    };
  }

  function ensureDailyRoster() {
    const key = getTodayDateKey();
    if (quizState.dailyDateKey === key && quizState.dailyTargets.length === 5) {
      return;
    }
    const pool = buildQuizPool('all', 'daily')
      .slice()
      .sort((a, b) => E.geo.getCountryKey(a).localeCompare(E.geo.getCountryKey(b)));

    const rng = mulberry32(hashSeedString(`earthlingo-daily-${key}`));
    const chosen = [];
    const usedLangs = new Set();
    const copy = pool.slice();

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }

    // Prefer 5 geographically/linguistically varied picks for crisp Daily 5 playability
    for (let i = 0; i < copy.length && chosen.length < 5; i++) {
      const c = copy[i];
      const canon = c.canonicalLanguage || c.primaryLanguage || c.name;
      if (chosen.length < 4 && usedLangs.has(canon)) continue;
      chosen.push(c);
      usedLangs.add(canon);
    }
    while (chosen.length < 5 && chosen.length < copy.length) {
      const next = copy.find(c => !chosen.includes(c));
      if (!next) break;
      chosen.push(next);
    }

    quizState.dailyDateKey = key;
    quizState.dailyTargets = chosen;
    quizState.dailyIndex = 0;
    quizState.dailyRounds = [];
  }

  function buildDailyEmojiGrid(rounds) {
    return (rounds || []).map(r => {
      if (!r || !r.won) return '🟥';
      return r.wrongGuesses === 0 ? '🟩' : '🟨';
    }).join('');
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

  function recordRoundCompletion(won) {
    if (E.passport && typeof E.passport.recordQuizOutcome === 'function') {
      E.passport.recordQuizOutcome(won, quizState.streak);
    }
    if (quizState.mode === 'daily') {
      quizState.dailyRounds[quizState.dailyIndex] = {
        won: Boolean(won),
        wrongGuesses: quizState.wrongGuesses,
        targetIso: quizState.target ? E.geo.getCountryKey(quizState.target) : ''
      };
      if (quizState.dailyRounds.filter(Boolean).length >= quizState.dailyTargets.length) {
        const wins = quizState.dailyRounds.filter(r => r && r.won).length;
        const grid = buildDailyEmojiGrid(quizState.dailyRounds);
        if (E.passport && typeof E.passport.saveDailyResult === 'function') {
          E.passport.saveDailyResult(quizState.dailyDateKey, {
            completed: true,
            dateKey: quizState.dailyDateKey,
            wins,
            total: quizState.dailyTargets.length,
            grid,
            rounds: quizState.dailyRounds
          });
        }
      }
    }
  }

  function finishQuizRoundWon(matchedCountry) {
    const hitKey = E.geo.getCountryKey(matchedCountry);
    quizState.target = matchedCountry;
    quizState.roundStatus = 'won';
    quizState.score += Math.max(10, 30 - quizState.wrongGuesses * 5);
    quizState.streak += 1;
    quizState.bestStreak = Math.max(quizState.bestStreak, quizState.streak);
    quizState.roundsPlayed++;
    recordRoundCompletion(true);

    E.state.quizHighlightIso = hitKey;
    E.state.quizHighlightColor = '#10b981';
    E.polygons.refreshPolygonVisuals();
    if (E.state.globe && matchedCountry.centroid) {
      const [lng, lat] = matchedCountry.centroid;
      E.state.globe.pointOfView({ lat: E.utils.isBottomSheetLayout() ? Math.max(-72, lat - 14) : lat, lng, altitude: E.utils.getSelectAltitude() }, 550);
    }
    renderQuizDock();
  }

  function finishQuizRoundReveal() {
    if (!quizState.target) return;
    quizState.roundStatus = 'revealed';
    quizState.streak = 0;
    quizState.roundsPlayed++;
    recordRoundCompletion(false);

    const tk = E.geo.getCountryKey(quizState.target);
    E.state.quizHighlightIso = tk;
    E.state.quizHighlightColor = '#f59e0b';
    E.polygons.refreshPolygonVisuals();
    if (E.state.globe && quizState.target.centroid) {
      const [lng, lat] = quizState.target.centroid;
      E.state.globe.pointOfView({ lat: E.utils.isBottomSheetLayout() ? Math.max(-72, lat - 14) : lat, lng, altitude: E.utils.getSelectAltitude() }, 600);
    }
    renderQuizDock();
  }

  function pickNextRound(autoSpeak = false) {
    if (quizState.mode === 'daily') {
      ensureDailyRoster();
      const saved = E.passport && typeof E.passport.getDailyResult === 'function'
        ? E.passport.getDailyResult(quizState.dailyDateKey)
        : null;
      if (saved && saved.completed) {
        quizState.roundStatus = 'daily_done';
        quizState.dailyRounds = saved.rounds || [];
        quizState.target = quizState.dailyTargets[quizState.dailyTargets.length - 1] || null;
        quizState.clue = quizState.target ? extractGreetingClue(quizState.target) : null;
        E.state.quizHighlightIso = null;
        E.state.quizHighlightColor = null;
        E.polygons.refreshPolygonVisuals();
        renderQuizDock();
        return;
      }

      if (quizState.roundStatus === 'won' || quizState.roundStatus === 'revealed') {
        if (quizState.dailyIndex < quizState.dailyTargets.length - 1) {
          quizState.dailyIndex += 1;
        }
      }
      const target = quizState.dailyTargets[quizState.dailyIndex];
      if (!target) return;
      const clue = extractGreetingClue(target);
      quizState.target = target;
      quizState.clue = clue;
      quizState.dialectChallenge = null;
      quizState.acceptedKeys = new Set([E.geo.getCountryKey(target)]);
      quizState.roundStatus = 'playing';
      quizState.wrongGuesses = 0;
      quizState.showRegionHint = false;
      E.state.quizHighlightIso = null;
      E.state.quizHighlightColor = null;
      E.polygons.refreshPolygonVisuals();
      renderQuizDock();
      if (autoSpeak) speakCurrentClue();
      return;
    }

    const pool = buildQuizPool(quizState.scope, quizState.mode);
    if (pool.length === 0) return;

    const prevKey = quizState.target ? E.geo.getCountryKey(quizState.target) : '';
    const candidates = pool.length > 1 ? pool.filter(c => E.geo.getCountryKey(c) !== prevKey) : pool;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const clue = extractGreetingClue(target);

    const accepted = new Set([E.geo.getCountryKey(target)]);
    if (quizState.mode !== 'dialect' && quizState.mode !== 'script') {
      const targetNorm = ((clue && clue.spoken) || '').toLowerCase();
      for (let i = 0; i < pool.length; i++) {
        const c = pool[i];
        const cc = extractGreetingClue(c);
        if (cc && cc.spoken.toLowerCase() === targetNorm) {
          accepted.add(E.geo.getCountryKey(c));
        }
      }
    }

    quizState.target = target;
    quizState.clue = clue;
    quizState.dialectChallenge = quizState.mode === 'dialect' ? buildDialectQuestion(target, pool) : null;
    quizState.acceptedKeys = accepted;
    quizState.roundStatus = 'playing';
    quizState.wrongGuesses = 0;
    quizState.showRegionHint = false;
    E.state.quizHighlightIso = null;
    E.state.quizHighlightColor = null;
    E.polygons.refreshPolygonVisuals();

    renderQuizDock();
    if (autoSpeak && quizState.mode !== 'script' && quizState.mode !== 'dialect') {
      speakCurrentClue();
    }
  }

  function setQuizMode(nextMode) {
    const valid = new Set(['globe', 'daily', 'script', 'dialect']);
    const mode = valid.has(nextMode) ? nextMode : 'globe';
    if (quizState.mode === mode && E.state.isQuizActive && quizState.target) return;
    quizState.mode = mode;
    quizState.roundStatus = 'idle';
    if (mode === 'daily') {
      quizState.dailyIndex = 0;
      quizState.dailyRounds = [];
    }
    if (E.state.isQuizActive) {
      pickNextRound(mode === 'globe');
    } else {
      renderQuizDock();
    }
  }

  function renderDailySummaryCard(el) {
    const { escapeHtml } = E.utils;
    const saved = E.passport && typeof E.passport.getDailyResult === 'function'
      ? E.passport.getDailyResult(quizState.dailyDateKey)
      : null;
    const rounds = (saved && saved.rounds) || quizState.dailyRounds;
    const wins = saved ? saved.wins : rounds.filter(r => r && r.won).length;
    const total = quizState.dailyTargets.length || 5;
    const grid = (saved && saved.grid) || buildDailyEmojiGrid(rounds);
    const db = E.state.languagesDb || {};

    const breakdownHtml = (quizState.dailyTargets || []).map((c, idx) => {
      const r = rounds[idx];
      const badge = r && r.won ? (r.wrongGuesses === 0 ? '🟩' : '🟨') : '🟥';
      const fullC = db[E.geo.getCountryKey(c)] || c;
      return `
        <div class="daily-round-pill">
          <span>${badge}</span>
          <span>${fullC.flag || '🌐'} ${escapeHtml(fullC.name)}</span>
          <span class="daily-round-lang">${escapeHtml(fullC.canonicalLanguage || '')}</span>
        </div>
      `;
    }).join('');

    if (el.quizClueBox) {
      el.quizClueBox.innerHTML = `
        <div class="daily-complete-card">
          <div class="daily-complete-head">
            <div>
              <div class="daily-complete-kicker">Daily Greeting Challenge • ${escapeHtml(quizState.dailyDateKey)}</div>
              <div class="daily-complete-score">${wins} / ${total} Solved</div>
            </div>
            <div class="daily-emoji-grid" aria-label="Emoji score summary">${grid}</div>
          </div>
          <div class="daily-breakdown-list">${breakdownHtml}</div>
        </div>
      `;
    }

    if (el.quizFeedbackBox) {
      el.quizFeedbackBox.innerHTML = `
        <div class="daily-share-actions">
          <button type="button" id="quizCopyDailyBtn" class="quiz-btn-primary">Copy Shareable Result</button>
          <button type="button" id="quizPlayFreeBtn" class="quiz-btn-secondary">Play Endless Mode →</button>
        </div>
      `;

      const copyBtn = document.getElementById('quizCopyDailyBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const shareUrl = window.location.protocol === 'file:'
            ? 'https://earthlingo.app'
            : window.location.href.split('#')[0];
          const text = `Earthlingo Daily #${quizState.dailyDateKey} ${wins}/${total}\n${grid}\n${shareUrl}`;
          const isFile = window.location.protocol === 'file:';
          if (!isFile && navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).catch(() => {
              if (E.router) E.router.copyTextFallback(text);
            });
          } else if (E.router) {
            E.router.copyTextFallback(text);
          }
          copyBtn.textContent = '✓ Copied Grid!';
          setTimeout(() => { copyBtn.textContent = 'Copy Shareable Result'; }, 2000);
        });
      }

      const playFree = document.getElementById('quizPlayFreeBtn');
      if (playFree) {
        playFree.addEventListener('click', () => setQuizMode('globe'));
      }
    }
  }

  function renderQuizDock(feedbackOverride = null) {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    if (!el.quizDock) return;

    el.quizDock.classList.toggle('open', E.state.isQuizActive);
    el.quizDock.setAttribute('aria-hidden', E.state.isQuizActive ? 'false' : 'true');
    if (el.openQuizBtn) el.openQuizBtn.classList.toggle('active', E.state.isQuizActive);

    if (el.quizModeBar) {
      el.quizModeBar.querySelectorAll('[data-quiz-mode]').forEach(btn => {
        const active = btn.getAttribute('data-quiz-mode') === quizState.mode;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    if (el.quizScopeRow) {
      el.quizScopeRow.style.display = quizState.mode === 'daily' ? 'none' : 'flex';
    }

    if (!E.state.isQuizActive) {
      E.overlays.refreshOverlayHudRects();
      return;
    }

    if (el.quizScoreBadge) el.quizScoreBadge.textContent = `Score: ${quizState.score}`;
    if (el.quizStreakBadge) {
      el.quizStreakBadge.textContent = quizState.mode === 'daily'
        ? `Round ${Math.min(quizState.dailyTargets.length, quizState.dailyIndex + 1)}/5`
        : `Streak: ${quizState.streak}`;
    }

    if (quizState.mode === 'daily' && quizState.roundStatus === 'daily_done') {
      renderDailySummaryCard(el);
      E.overlays.refreshOverlayHudRects();
      return;
    }

    if (!quizState.target || !quizState.clue) {
      E.overlays.refreshOverlayHudRects();
      return;
    }

    const target = quizState.target;
    const clue = quizState.clue;
    const scriptGrp = target.__scriptGroup || E.geo.resolveCountryScriptGroup(target).name;
    const resolvedScript = (E.labelFormatter && typeof E.labelFormatter.resolveCountryScriptMeta === 'function')
      ? E.labelFormatter.resolveCountryScriptMeta(target)
      : scriptGrp;

    // 1. Render Clue Box by Mode
    if (el.quizClueBox) {
      if (quizState.mode === 'dialect' && quizState.dialectChallenge) {
        const dc = quizState.dialectChallenge;
        const hintLineHtml = quizState.showRegionHint
          ? `<div class="quiz-hint-pill">Clue: ${escapeHtml(target.continent || 'World')} • Language Family: ${escapeHtml(target.__familyGroup || target.languageFamily || '')}</div>`
          : '';
        el.quizClueBox.innerHTML = `
          <div class="quiz-dialect-card">
            <div class="phrase-label">Dialect Detective • Which Nation Speaks:</div>
            <div class="quiz-dialect-name">${escapeHtml(dc.accentName)}</div>
            <p class="quiz-dialect-desc">${escapeHtml(dc.description)}</p>
            ${dc.sample ? `<div class="quiz-dialect-sample">“${escapeHtml(dc.sample)}”</div>` : ''}
          </div>
          ${hintLineHtml}
        `;
      } else {
        const isScriptMode = quizState.mode === 'script';
        const showPhoneticNow = !isScriptMode && (quizState.showPhonetic || quizState.roundStatus !== 'playing');
        const vs = E.drawer.checkVoiceSupport(clue.bcp47);
        const showNoVoice = !isScriptMode && (!vs.supported || (vs.voicesLoaded && !vs.hasLocalVoice));
        const phoneticHtml = (clue.phonetic && (showPhoneticNow || (isScriptMode && quizState.roundStatus !== 'playing')))
          ? `<div class="quiz-phonetic">Phonetic: /${escapeHtml(clue.phonetic)}/</div>`
          : '';
        const hintLineHtml = quizState.showRegionHint
          ? `<div class="quiz-hint-pill">Hint: ${escapeHtml(target.continent || 'World')} • ${isScriptMode ? `Family: ${escapeHtml(target.__familyGroup || '')}` : `Script: ${escapeHtml(scriptGrp)}`}</div>`
          : '';
        const promptLabel = isScriptMode
          ? `Script Detective • Identify writing system on globe (${quizState.roundStatus === 'playing' ? 'no romanization!' : resolvedScript})`
          : (quizState.mode === 'daily'
            ? `Daily Seeded Round ${quizState.dailyIndex + 1} of 5 • Locate on globe`
            : 'Locate where people say');

        el.quizClueBox.innerHTML = `
          <div class="quiz-clue-row phrase-card" data-bcp47="${escapeHtml(clue.bcp47)}">
            <div class="phrase-info">
              <span class="phrase-label">${escapeHtml(promptLabel)}</span>
              <span class="quiz-greeting-text ${isScriptMode ? 'is-script-specimen' : ''}">${escapeHtml(clue.display)}</span>
              ${phoneticHtml}
              <span class="phrase-voice-hint ${showNoVoice ? 'visible' : ''}">No local audio voice — phonetic guide shown</span>
            </div>
            ${!isScriptMode ? `
              <button type="button" id="quizSpeakBtn" class="speak-btn quiz-audio-btn ${showNoVoice ? 'no-local-voice' : ''}" title="Listen to greeting">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              </button>
            ` : ''}
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
    }

    // 2. Render Feedback / Interaction Controls Box
    if (el.quizFeedbackBox) {
      const isDone = quizState.roundStatus === 'won' || quizState.roundStatus === 'revealed';
      if (isDone) {
        const won = quizState.roundStatus === 'won';
        const isDailyLast = quizState.mode === 'daily' && quizState.dailyIndex >= quizState.dailyTargets.length - 1;
        const nextLabel = isDailyLast
          ? 'View Daily Scoreboard →'
          : (quizState.mode === 'daily' ? `Next (${quizState.dailyIndex + 2}/5) →` : 'Next →');

        el.quizFeedbackBox.innerHTML = `
          <div class="quiz-result-banner ${won ? 'is-win' : 'is-reveal'}">
            <div class="quiz-result-main">
              <span class="quiz-result-flag">${target.flag || '🌐'}</span>
              <div>
                <strong>${won ? 'Spot on!' : 'Answer:'} ${escapeHtml(target.name)}</strong>
                <div class="quiz-result-sub">${escapeHtml(target.canonicalLanguage || target.primaryLanguage || '')} • ${escapeHtml(resolvedScript)}</div>
              </div>
            </div>
            <div class="quiz-action-btns">
              ${quizState.mode === 'script' ? `<button type="button" id="quizMeetScriptBtn" class="quiz-btn-secondary" title="Open interactive script breakdown">Script ⓘ</button>` : ''}
              <button type="button" id="quizViewProfileBtn" class="quiz-btn-secondary">Profile</button>
              <button type="button" id="quizNextBtn" class="quiz-btn-primary">${escapeHtml(nextLabel)}</button>
            </div>
          </div>
        `;

        const scrBtn = document.getElementById('quizMeetScriptBtn');
        if (scrBtn && E.scriptInspector) {
          scrBtn.addEventListener('click', () => E.scriptInspector.openScript(resolvedScript, target));
        }
        const profBtn = document.getElementById('quizViewProfileBtn');
        if (profBtn) {
          profBtn.addEventListener('click', () => {
            const c = quizState.target;
            stopQuiz({ restoreOverlay: true, skipRouter: true });
            if (c) E.drawer.selectCountry(c, true);
          });
        }
        const nextBtn = document.getElementById('quizNextBtn');
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            if (isDailyLast) {
              quizState.roundStatus = 'daily_done';
              renderQuizDock();
            } else {
              pickNextRound(quizState.mode === 'globe' || quizState.mode === 'daily');
            }
          });
        }
      } else {
        const fbHtml = feedbackOverride
          ? `<div class="quiz-guess-msg ${feedbackOverride.tone}">${escapeHtml(feedbackOverride.text)}</div>`
          : `<div class="quiz-guess-msg is-prompt">${quizState.mode === 'dialect' ? 'Pick the matching nation below (or click the 3D globe):' : 'Click the matching country on the 3D globe!'}</div>`;

        const dialectOptionsHtml = (quizState.mode === 'dialect' && quizState.dialectChallenge)
          ? `<div class="quiz-dialect-options">
              ${quizState.dialectChallenge.options.map(opt => `
                <button type="button" class="quiz-dialect-opt" data-opt-iso="${escapeHtml(opt.iso3)}">
                  <span class="opt-flag">${opt.flag}</span>
                  <span class="opt-name">${escapeHtml(opt.name)}</span>
                </button>
              `).join('')}
            </div>`
          : '';

        const showPhoneticBtn = quizState.mode === 'globe' || quizState.mode === 'daily';

        el.quizFeedbackBox.innerHTML = `
          ${fbHtml}
          ${dialectOptionsHtml}
          <div class="quiz-controls-row">
            ${showPhoneticBtn ? `<button type="button" id="quizPhoneticToggleBtn" class="quiz-mini-btn ${quizState.showPhonetic ? 'active' : ''}">${quizState.showPhonetic ? 'Hide Phonetic' : 'Show Phonetic'}</button>` : ''}
            <button type="button" id="quizHintBtn" class="quiz-mini-btn" ${quizState.showRegionHint ? 'disabled' : ''}>Region Hint</button>
            <button type="button" id="quizRevealBtn" class="quiz-mini-btn">Reveal</button>
            ${quizState.mode !== 'daily' ? `<button type="button" id="quizSkipBtn" class="quiz-mini-btn">Skip</button>` : ''}
          </div>
        `;

        el.quizFeedbackBox.querySelectorAll('.quiz-dialect-opt').forEach(optBtn => {
          optBtn.addEventListener('click', () => {
            const iso = optBtn.getAttribute('data-opt-iso');
            const picked = (E.state.languagesDb && E.state.languagesDb[iso]) || { iso3: iso, name: iso };
            handleGlobePick(picked);
          });
        });

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
          rBtn.addEventListener('click', finishQuizRoundReveal);
        }
        if (sBtn) {
          sBtn.addEventListener('click', () => {
            quizState.streak = 0;
            pickNextRound(quizState.mode === 'globe');
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
      finishQuizRoundWon(matchedCountry);
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
    if (E.passport && typeof E.passport.closePassportModal === 'function') E.passport.closePassportModal();
    if (E.trip && typeof E.trip.closeTripModal === 'function') E.trip.closeTripModal();
    if (E.scriptInspector && typeof E.scriptInspector.closeScriptModal === 'function') E.scriptInspector.closeScriptModal();
    if (E.pins && typeof E.pins.closePinInspector === 'function') E.pins.closePinInspector();

    if (E.state.activeTimeEra && E.state.activeTimeEra !== 'today' && E.controls && typeof E.controls.setTimeEra === 'function') {
      E.controls.setTimeEra('today', { skipRouter: true });
    }
    if (E.state.isTimelineOpen && E.controls && typeof E.controls.toggleTimeline === 'function') {
      E.controls.toggleTimeline(false, { skipRouter: true });
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
    quizState.roundStatus = 'idle';
    if (E.elements.quizScopeSelect) E.elements.quizScopeSelect.value = quizState.scope;
    pickNextRound(quizState.mode === 'globe' || quizState.mode === 'daily');
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
    el.quizModeBar = document.getElementById('quizModeBar');
    el.quizScopeRow = document.getElementById('quizScopeRow');

    if (el.openQuizBtn) {
      el.openQuizBtn.addEventListener('click', () => {
        if (E.state.isQuizActive) stopQuiz({ restoreOverlay: true });
        else startQuiz(quizState.scope);
      });
    }
    if (el.closeQuizBtn) {
      el.closeQuizBtn.addEventListener('click', () => stopQuiz({ restoreOverlay: true }));
    }
    if (el.quizModeBar) {
      el.quizModeBar.querySelectorAll('[data-quiz-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
          setQuizMode(btn.getAttribute('data-quiz-mode'));
        });
      });
    }
    if (el.quizScopeSelect) {
      el.quizScopeSelect.addEventListener('change', (e) => {
        quizState.scope = e.target.value || 'all';
        if (E.state.isQuizActive && quizState.mode !== 'daily') {
          pickNextRound(quizState.mode === 'globe');
        }
      });
    }
  }

  function getDebugState() {
    return {
      isActive: E.state.isQuizActive,
      mode: quizState.mode,
      scope: quizState.scope,
      score: quizState.score,
      streak: quizState.streak,
      roundStatus: quizState.roundStatus,
      targetIso: quizState.target ? quizState.target.iso3 : null,
      targetName: quizState.target ? quizState.target.name : null,
      wrongGuesses: quizState.wrongGuesses,
      dailyDateKey: quizState.dailyDateKey,
      dailyIndex: quizState.dailyIndex
    };
  }

  E.quiz = {
    quizState,
    initQuiz,
    startQuiz,
    stopQuiz,
    setQuizMode,
    pickNextRound,
    handleGlobePick,
    getDebugState
  };
})(window);
