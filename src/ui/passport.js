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
  let passportEventsBound = false;
  let passportResetArmed = false;

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

  function showPassportStatus(msg, isErr) {
    const statusEl = document.getElementById('passportStatusMsg');
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.classList.toggle('is-error', Boolean(isErr));
    statusEl.classList.toggle('is-success', !isErr && Boolean(msg));
  }

  function renderPassportModal(opts = {}) {
    const body = E.elements.passportModalBody;
    if (!body) return;
    passportResetArmed = false;
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

    const statusClass = opts.isError ? 'is-error' : (opts.statusText ? 'is-success' : '');

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
        <span id="passportStatusMsg" class="data-io-status ${statusClass}" role="status" aria-live="polite">${escapeHtml(opts.statusText || '')}</span>
        <div class="data-io-group">
          <button type="button" class="data-io-btn" id="passportExportBtn">Export JSON</button>
          <button type="button" class="data-io-btn" id="passportImportBtn">Import JSON</button>
          <input type="file" id="passportImportInput" accept=".json,application/json" hidden>
          <button type="button" class="passport-reset-btn" id="passportResetBtn">Reset Progress</button>
        </div>
      </div>
    `;
  }

  function openPassportModal() {
    const modal = E.elements.passportModal;
    if (!modal) return;
    if (E.utils && typeof E.utils.closeAllModals === 'function') {
      E.utils.closeAllModals({ except: modal, skipRouter: true, skipFocusRestore: true });
    }
    renderPassportModal();
    E.utils.openModal(modal, { initialFocus: E.elements.closePassportModalBtn });
  }

  function closePassportModal(opts = {}) {
    const modal = E.elements.passportModal;
    if (!modal) return;
    E.utils.closeModal(modal, opts);
  }

  function initPassport() {
    syncNavBadge();
    if (passportEventsBound) return;
    passportEventsBound = true;

    const el = E.elements;
    if (el.openPassportBtn) {
      el.openPassportBtn.addEventListener('click', openPassportModal);
    }
    if (el.closePassportModalBtn) {
      el.closePassportModalBtn.addEventListener('click', () => closePassportModal());
    }
    if (el.passportModal) {
      el.passportModal.addEventListener('click', (e) => {
        if (e.target === el.passportModal) closePassportModal();
      });
    }
    if (el.passportModalBody) {
      el.passportModalBody.addEventListener('change', (e) => {
        const tgt = e.target;
        if (!tgt || tgt.id !== 'passportImportInput') return;
        const file = tgt.files && tgt.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const res = importPassportData(String(reader.result || ''));
          if (res.ok) {
            renderPassportModal({
              statusText: `✓ Imported ${res.data.visitedIsos.length} nations & ${res.data.unlockedScripts.length} scripts`
            });
            const reBtn = document.getElementById('passportImportBtn');
            if (reBtn) reBtn.focus();
          } else {
            showPassportStatus(`✕ ${res.error}`, true);
          }
        };
        reader.onerror = () => showPassportStatus('✕ Unable to read selected file.', true);
        reader.readAsText(file);
      });

      el.passportModalBody.addEventListener('click', (e) => {
        const tgt = e.target;
        if (!tgt) return;

        const scriptBtn = tgt.closest('.passport-script-stamp[data-script]');
        if (scriptBtn) {
          const scr = scriptBtn.getAttribute('data-script');
          const scriptGroups = (E.config && E.config.SCRIPT_GROUPS) || [];
          const sg = scriptGroups.find(x => x.name === scr);
          closePassportModal({ skipFocusRestore: true });
          if (E.controls && typeof E.controls.filterByScriptGroup === 'function') {
            E.controls.filterByScriptGroup(scr, (sg && sg.color) || '#38bdf8', { forceOn: true });
          }
          return;
        }

        const pillBtn = tgt.closest('.passport-country-pill[data-iso]');
        if (pillBtn) {
          const db = E.state.languagesDb || {};
          const c = db[pillBtn.getAttribute('data-iso')];
          if (c && E.drawer) {
            closePassportModal({ skipFocusRestore: true });
            E.drawer.selectCountry(c, true);
          }
          return;
        }

        if (tgt.closest('#passportExportBtn')) {
          const payload = exportPassportData();
          const dateTag = new Date().toISOString().slice(0, 10);
          E.utils.downloadJsonFile(`earthlingo-passport-${dateTag}.json`, payload);
          showPassportStatus(`✓ Exported ${payload.data.visitedIsos.length} nations`, false);
          return;
        }

        if (tgt.closest('#passportImportBtn')) {
          const importInput = document.getElementById('passportImportInput');
          if (importInput) {
            importInput.value = '';
            importInput.click();
          }
          return;
        }

        const resetBtn = tgt.closest('#passportResetBtn');
        if (resetBtn) {
          if (!passportResetArmed) {
            passportResetArmed = true;
            resetBtn.textContent = 'Click again to confirm reset';
            resetBtn.classList.add('armed');
            return;
          }
          resetPassportData();
          renderPassportModal({ statusText: '✓ Passport progress reset' });
          const reReset = document.getElementById('passportResetBtn');
          if (reReset) reReset.focus();
        }
      });
    }
  }

  function exportPassportData() {
    const d = loadData();
    return {
      app: 'Earthlingo',
      kind: 'linguistic-passport',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        visitedIsos: d.visitedIsos.slice(),
        unlockedScripts: d.unlockedScripts.slice(),
        quizAttempts: d.quizAttempts,
        quizWins: d.quizWins,
        bestStreak: d.bestStreak,
        dailyResults: JSON.parse(JSON.stringify(d.dailyResults || {}))
      }
    };
  }

  function importPassportData(rawOrObj) {
    let parsed = rawOrObj;
    if (typeof rawOrObj === 'string') {
      try {
        parsed = JSON.parse(rawOrObj);
      } catch (_err) {
        return { ok: false, error: 'Invalid JSON syntax in passport file.' };
      }
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, error: 'Passport JSON must be an object.' };
    }
    if (parsed.kind === 'trip-itinerary' || Array.isArray(parsed.bookmarks)) {
      return { ok: false, error: 'This file is a Trip Cheat-Sheet export, not a Linguistic Passport.' };
    }

    const src = (parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)) ? parsed.data : parsed;
    const hasKnownField = ['visitedIsos', 'unlockedScripts', 'quizAttempts', 'quizWins', 'bestStreak', 'dailyResults']
      .some(k => Object.prototype.hasOwnProperty.call(src, k));
    if (!hasKnownField) {
      return { ok: false, error: 'Missing expected passport fields in JSON.' };
    }

    const db = E.state.languagesDb || {};
    const hasDb = Object.keys(db).length > 0;
    const rawVisited = Array.isArray(src.visitedIsos) ? src.visitedIsos : [];
    const visitedSet = new Set();
    rawVisited.forEach(code => {
      const upper = String(code || '').trim().toUpperCase();
      if (!upper) return;
      if (hasDb ? Boolean(db[upper]) : /^[A-Z0-9-]{2,20}$/.test(upper)) {
        visitedSet.add(upper);
      }
    });

    const validScriptsSet = new Set(((E.config && E.config.SCRIPT_GROUPS) || []).map(sg => sg.name));
    const rawScripts = Array.isArray(src.unlockedScripts) ? src.unlockedScripts : [];
    const unlockedSet = new Set();
    rawScripts.forEach(scr => {
      const clean = String(scr || '').trim();
      if (!clean) return;
      if (validScriptsSet.size === 0 || validScriptsSet.has(clean)) {
        unlockedSet.add(clean);
      }
    });

    const attempts = Math.max(0, Math.floor(Number(src.quizAttempts) || 0));
    const wins = Math.min(attempts, Math.max(0, Math.floor(Number(src.quizWins) || 0)));
    const streak = Math.max(0, Math.floor(Number(src.bestStreak) || 0));

    const cleanDaily = {};
    if (src.dailyResults && typeof src.dailyResults === 'object' && !Array.isArray(src.dailyResults)) {
      Object.keys(src.dailyResults).forEach(dateKey => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
        const rec = src.dailyResults[dateKey];
        if (rec && typeof rec === 'object') {
          cleanDaily[dateKey] = Object.assign({}, rec, {
            completed: Boolean(rec.completed)
          });
        }
      });
    }

    cache = {
      visitedIsos: Array.from(visitedSet),
      unlockedScripts: Array.from(unlockedSet),
      quizAttempts: attempts,
      quizWins: wins,
      bestStreak: streak,
      dailyResults: cleanDaily
    };
    saveData();
    return { ok: true, data: cache };
  }

  function resetPassportData() {
    cache = Object.assign({}, DEFAULT_DATA, { visitedIsos: [], unlockedScripts: [], dailyResults: {} });
    saveData();
    return cache;
  }

  E.passport = {
    loadData,
    syncNavBadge,
    recordCountryExplore,
    recordQuizOutcome,
    getDailyResult,
    saveDailyResult,
    exportPassportData,
    importPassportData,
    resetPassportData,
    openPassportModal,
    closePassportModal,
    initPassport
  };
})(window);

