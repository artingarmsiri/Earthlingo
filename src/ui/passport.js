// src/ui/passport.js - Persistent "Linguistic Passport" & Daily Challenge Tracker
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});
  const STORAGE_KEY = 'earthlingo_passport_v1';

  const DEFAULT_DATA = {
    visitedIsos: [],
    unlockedScripts: [],
    quizAttempts: 0,
    quizWins: 0,
    bestStreak: 0,
    dailyResults: {}
  };

  let cache = null;

  function loadData() {
    if (cache) return cache;
    try {
      const raw = global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        cache = {
          visitedIsos: Array.isArray(parsed.visitedIsos) ? parsed.visitedIsos : [],
          unlockedScripts: Array.isArray(parsed.unlockedScripts) ? parsed.unlockedScripts : [],
          quizAttempts: Number(parsed.quizAttempts) || 0,
          quizWins: Number(parsed.quizWins) || 0,
          bestStreak: Number(parsed.bestStreak) || 0,
          dailyResults: (parsed.dailyResults && typeof parsed.dailyResults === 'object') ? parsed.dailyResults : {}
        };
        return cache;
      }
    } catch (_e) {
      // Fall back to in-memory store if storage unavailable
    }
    cache = Object.assign({}, DEFAULT_DATA, { visitedIsos: [], unlockedScripts: [], dailyResults: {} });
    return cache;
  }

  function saveData() {
    const d = loadData();
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
      }
    } catch (_e) {
      // Ignore quota / sandbox storage errors
    }
    syncNavBadge();
  }

  function syncNavBadge() {
    const d = loadData();
    if (E.elements.passportNavCount) {
      const n = d.visitedIsos.length;
      E.elements.passportNavCount.textContent = n > 0 ? String(n) : '';
      E.elements.passportNavCount.hidden = n === 0;
    }
  }

  function recordCountryExplore(country) {
    if (!country || !country.iso3) return;
    const d = loadData();
    const iso = country.iso3.toUpperCase();
    let changed = false;
    if (!d.visitedIsos.includes(iso)) {
      d.visitedIsos.push(iso);
      changed = true;
    }
    const scrGrp = country.__scriptGroup || (E.geo && E.geo.resolveCountryScriptGroup(country).name);
    if (scrGrp && !d.unlockedScripts.includes(scrGrp)) {
      d.unlockedScripts.push(scrGrp);
      changed = true;
    }
    if (changed) saveData();
  }

  function recordQuizOutcome(isCorrect, streak) {
    const d = loadData();
    d.quizAttempts += 1;
    if (isCorrect) d.quizWins += 1;
    if (streak > d.bestStreak) d.bestStreak = streak;
    saveData();
  }

  function getDailyResult(dateKey) {
    const d = loadData();
    return d.dailyResults[dateKey] || null;
  }

  function saveDailyResult(dateKey, resultObj) {
    const d = loadData();
    d.dailyResults[dateKey] = resultObj;
    saveData();
  }

  function getDailyStreakCount() {
    const d = loadData();
    const keys = Object.keys(d.dailyResults).filter(k => d.dailyResults[k] && d.dailyResults[k].completed).sort();
    return keys.length;
  }

  function closeOtherOverlays() {
    if (E.compare && E.state.isCompareOpen) E.compare.closeCompareModal({ skipRouter: true });
    if (E.trip && E.state.tripModalOpen) E.trip.closeTripModal();
    if (E.scriptInspector && typeof E.scriptInspector.closeScriptModal === 'function') E.scriptInspector.closeScriptModal();
    if (E.elements.listModal && E.elements.listModal.classList.contains('open')) {
      E.elements.listModal.classList.remove('open');
      E.elements.listModal.setAttribute('aria-hidden', 'true');
    }
  }

  function renderPassportModal() {
    const body = E.elements.passportModalBody;
    if (!body) return;
    const d = loadData();
    const { escapeHtml } = E.utils;
    const totalNations = (E.state.countriesList && E.state.countriesList.length) || 242;
    const scriptGroups = (E.config && E.config.SCRIPT_GROUPS) || [];
    const totalScripts = scriptGroups.length || 9;
    const acc = d.quizAttempts > 0 ? Math.round((d.quizWins / d.quizAttempts) * 100) : 0;
    const dailyCount = getDailyStreakCount();

    const scriptCards = scriptGroups.map(sg => {
      const unlocked = d.unlockedScripts.includes(sg.name);
      return `
        <button type="button" class="passport-script-stamp ${unlocked ? 'unlocked' : 'locked'}" data-script="${escapeHtml(sg.name)}">
          <span class="passport-stamp-dot" style="background:${unlocked ? sg.color : '#334155'};"></span>
          <span class="passport-stamp-name">${escapeHtml(sg.name)}</span>
          <span class="passport-stamp-state">${unlocked ? '✓ Unlocked' : 'Locked'}</span>
        </button>
      `;
    }).join('');

    const db = E.state.languagesDb || {};
    const recentIsos = d.visitedIsos.slice().reverse().slice(0, 36);
    const stampsHtml = recentIsos.length > 0
      ? recentIsos.map(iso => {
          const c = db[iso];
          if (!c) return '';
          return `
            <button type="button" class="passport-country-pill" data-iso="${escapeHtml(iso)}">
              <span>${c.flag || '🌐'}</span>
              <span>${escapeHtml(c.name)}</span>
            </button>
          `;
        }).join('')
      : '<p class="passport-empty">Click any country on the 3D globe to collect your first Linguistic Passport stamps!</p>';

    body.innerHTML = `
      <div class="passport-stats-grid">
        <div class="passport-stat-card">
          <div class="passport-stat-val">${d.visitedIsos.length} <span class="passport-stat-denom">/ ${totalNations}</span></div>
          <div class="passport-stat-lbl">Nations Explored</div>
        </div>
        <div class="passport-stat-card">
          <div class="passport-stat-val">${d.unlockedScripts.length} <span class="passport-stat-denom">/ ${totalScripts}</span></div>
          <div class="passport-stat-lbl">Writing Scripts Unlocked</div>
        </div>
        <div class="passport-stat-card">
          <div class="passport-stat-val">${d.quizWins} <span class="passport-stat-denom">(${acc}%)</span></div>
          <div class="passport-stat-lbl">Quiz Wins • Best Streak ${d.bestStreak}</div>
        </div>
        <div class="passport-stat-card">
          <div class="passport-stat-val">${dailyCount}</div>
          <div class="passport-stat-lbl">Daily Challenges Finished</div>
        </div>
      </div>

      <div class="passport-section-head">Writing Script Collection (Click to Spotlight)</div>
      <div class="passport-script-grid">${scriptCards}</div>

      <div class="passport-section-head">Collected Country Stamps (${d.visitedIsos.length})</div>
      <div class="passport-countries-grid">${stampsHtml}</div>

      <div class="passport-footer-actions">
        <button type="button" class="passport-reset-btn" id="passportResetBtn">Reset Progress</button>
      </div>
    `;

    body.querySelectorAll('.passport-script-stamp').forEach(btn => {
      btn.addEventListener('click', () => {
        const scr = btn.getAttribute('data-script');
        const sg = scriptGroups.find(x => x.name === scr);
        closePassportModal();
        if (E.controls && typeof E.controls.filterByScriptGroup === 'function') {
          E.controls.filterByScriptGroup(scr, (sg && sg.color) || '#38bdf8', { forceOn: true });
        }
      });
    });

    body.querySelectorAll('.passport-country-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const iso = btn.getAttribute('data-iso');
        const c = db[iso];
        if (c && E.drawer) {
          closePassportModal();
          E.drawer.selectCountry(c, true);
        }
      });
    });

    const resetBtn = document.getElementById('passportResetBtn');
    if (resetBtn) {
      let armed = false;
      resetBtn.addEventListener('click', () => {
        if (!armed) {
          armed = true;
          resetBtn.textContent = 'Click again to confirm reset';
          resetBtn.classList.add('armed');
          return;
        }
        cache = Object.assign({}, DEFAULT_DATA, { visitedIsos: [], unlockedScripts: [], dailyResults: {} });
        saveData();
        renderPassportModal();
      });
    }
  }

  function openPassportModal() {
    const modal = E.elements.passportModal;
    if (!modal) return;
    closeOtherOverlays();
    renderPassportModal();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (E.elements.closePassportModalBtn) E.elements.closePassportModalBtn.focus();
  }

  function closePassportModal() {
    const modal = E.elements.passportModal;
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function initPassport() {
    syncNavBadge();
    const el = E.elements;
    if (el.openPassportBtn) {
      el.openPassportBtn.addEventListener('click', openPassportModal);
    }
    if (el.closePassportModalBtn) {
      el.closePassportModalBtn.addEventListener('click', closePassportModal);
    }
    if (el.passportModal) {
      el.passportModal.addEventListener('click', (e) => {
        if (e.target === el.passportModal) closePassportModal();
      });
    }
  }

  E.passport = {
    loadData,
    syncNavBadge,
    recordCountryExplore,
    recordQuizOutcome,
    getDailyResult,
    saveDailyResult,
    openPassportModal,
    closePassportModal,
    initPassport
  };
})(window);

