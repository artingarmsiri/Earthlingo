// src/ui/trip.js - Travel "Trip Cheat-Sheet" Builder & Print/Copy Pocket Phrase Exporter
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});
  const STORAGE_KEY = 'earthlingo_trip_v1';
  const MAX_STOPS = 14;

  const PRESETS = [
    { id: 'med', label: 'Spain → Morocco → Italy', isos: ['ESP', 'MAR', 'ITA'] },
    { id: 'eastasia', label: 'Japan → Korea → Taiwan', isos: ['JPN', 'KOR', 'TWN'] },
    { id: 'silkroad', label: 'Turkey → Iran → Uzbekistan', isos: ['TUR', 'IRN', 'UZB'] }
  ];

  function loadBookmarks() {
    try {
      const raw = global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          E.state.tripBookmarks = parsed.map(x => String(x).toUpperCase()).filter(Boolean).slice(0, MAX_STOPS);
          return E.state.tripBookmarks;
        }
      }
    } catch (_e) {}
    E.state.tripBookmarks = Array.isArray(E.state.tripBookmarks) ? E.state.tripBookmarks : [];
    return E.state.tripBookmarks;
  }

  function saveBookmarks() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(E.state.tripBookmarks || []));
      }
    } catch (_e) {}
    syncTripUI();
    if (E.router && E.state.tripModalOpen && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function hasBookmark(iso3) {
    if (!iso3) return false;
    return (E.state.tripBookmarks || []).includes(iso3.toUpperCase());
  }

  function addBookmark(iso3) {
    if (!iso3) return;
    const upper = iso3.toUpperCase();
    const list = E.state.tripBookmarks || [];
    if (!list.includes(upper) && list.length < MAX_STOPS) {
      list.push(upper);
      E.state.tripBookmarks = list;
      saveBookmarks();
    }
  }

  function removeBookmark(iso3) {
    if (!iso3) return;
    const upper = iso3.toUpperCase();
    E.state.tripBookmarks = (E.state.tripBookmarks || []).filter(x => x !== upper);
    saveBookmarks();
  }

  function toggleBookmark(iso3) {
    if (!iso3) return false;
    const upper = iso3.toUpperCase();
    if (hasBookmark(upper)) {
      removeBookmark(upper);
      return false;
    }
    addBookmark(upper);
    return true;
  }

  function moveBookmark(idx, delta) {
    const list = E.state.tripBookmarks || [];
    const target = idx + delta;
    if (idx < 0 || idx >= list.length || target < 0 || target >= list.length) return;
    const tmp = list[idx];
    list[idx] = list[target];
    list[target] = tmp;
    saveBookmarks();
    renderTripModal();
  }

  function importBookmarks(isos, opts = {}) {
    const db = E.state.languagesDb || {};
    const valid = (isos || []).map(x => String(x).toUpperCase()).filter(iso => db[iso]);
    if (valid.length > 0) {
      E.state.tripBookmarks = valid.slice(0, MAX_STOPS);
      saveBookmarks();
      if (opts.open) openTripModal({ skipRouter: opts.skipRouter });
    }
  }

  function clearBookmarks() {
    E.state.tripBookmarks = [];
    saveBookmarks();
    return [];
  }

  function exportTripData() {
    return {
      app: 'Earthlingo',
      kind: 'trip-itinerary',
      version: 1,
      exportedAt: new Date().toISOString(),
      bookmarks: (E.state.tripBookmarks || []).slice()
    };
  }

  function importTripData(rawOrObj) {
    let parsed = rawOrObj;
    if (typeof rawOrObj === 'string') {
      try {
        parsed = JSON.parse(rawOrObj);
      } catch (_err) {
        return { ok: false, error: 'Invalid JSON syntax in trip file.' };
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'Trip JSON must be an object or ISO array.' };
    }
    if (parsed.kind === 'linguistic-passport' || Array.isArray(parsed.visitedIsos)) {
      return { ok: false, error: 'This file is a Linguistic Passport export, not a Trip itinerary.' };
    }

    let rawList = null;
    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (Array.isArray(parsed.bookmarks)) {
      rawList = parsed.bookmarks;
    } else if (Array.isArray(parsed.tripBookmarks)) {
      rawList = parsed.tripBookmarks;
    } else if (parsed.data && Array.isArray(parsed.data.bookmarks)) {
      rawList = parsed.data.bookmarks;
    }

    if (!Array.isArray(rawList)) {
      return { ok: false, error: 'Missing bookmarks array in Trip JSON.' };
    }

    const db = E.state.languagesDb || {};
    const hasDb = Object.keys(db).length > 0;
    const seen = new Set();
    rawList.forEach(code => {
      const upper = String(code || '').trim().toUpperCase();
      if (!upper) return;
      if (hasDb ? Boolean(db[upper]) : /^[A-Z0-9-]{2,20}$/.test(upper)) {
        seen.add(upper);
      }
    });

    const valid = Array.from(seen).slice(0, MAX_STOPS);
    if (rawList.length > 0 && valid.length === 0) {
      return { ok: false, error: 'No valid country ISO codes found in file.' };
    }

    E.state.tripBookmarks = valid;
    saveBookmarks();
    return { ok: true, count: valid.length, bookmarks: valid };
  }

  function syncTripUI() {
    const count = (E.state.tripBookmarks || []).length;
    if (E.elements.tripNavCount) {
      E.elements.tripNavCount.textContent = count > 0 ? String(count) : '';
      E.elements.tripNavCount.hidden = count === 0;
    }
    const sel = E.state.selectedCountry;
    const drBtn = E.elements.drawerTripBtn;
    if (drBtn) {
      const saved = sel && sel.iso3 && hasBookmark(sel.iso3);
      drBtn.classList.toggle('active', Boolean(saved));
      drBtn.setAttribute('aria-pressed', saved ? 'true' : 'false');
      drBtn.setAttribute('title', saved ? 'Saved in Trip Cheat-Sheet (click to remove)' : 'Save country to Trip Cheat-Sheet');
    }
  }

  function buildCheatSheetText() {
    const db = E.state.languagesDb || {};
    const stops = (E.state.tripBookmarks || []).map(iso => db[iso]).filter(Boolean);
    if (stops.length === 0) return 'No countries bookmarked yet.';
    const lines = [
      'EARTHLINGO TRAVEL CHEAT-SHEET',
      `Route: ${stops.map(c => c.name).join(' → ')}`,
      '='.repeat(44),
      ''
    ];
    stops.forEach((c, idx) => {
      const topLangs = (c.languages || []).slice(0, 2).map(l => l.name).join(', ');
      lines.push(`${idx + 1}. ${c.name} — ${c.canonicalLanguage || c.primaryLanguage} (${topLangs})`);
      (c.phrases || []).slice(0, 3).forEach(ph => {
        lines.push(`   • ${ph.type}: ${ph.text}${ph.phonetic ? ` [${ph.phonetic}]` : ''}`);
      });
      if (c.accents && c.accents[0]) {
        lines.push(`   • Local Tip (${c.accents[0].name}): ${c.accents[0].description}`);
      }
      lines.push('');
    });
    return lines.join('\n');
  }

  function closeOtherOverlays() {
    if (E.compare && E.state.isCompareOpen) E.compare.closeCompareModal({ skipRouter: true, skipFocusRestore: true });
    if (E.passport && typeof E.passport.closePassportModal === 'function') E.passport.closePassportModal({ skipFocusRestore: true });
    if (E.scriptInspector && typeof E.scriptInspector.closeScriptModal === 'function') E.scriptInspector.closeScriptModal({ skipFocusRestore: true });
    if (E.elements.listModal && E.elements.listModal.classList.contains('open')) {
      E.utils.closeModal(E.elements.listModal, { skipFocusRestore: true });
    }
    if (E.elements.infoModal && E.elements.infoModal.classList.contains('open')) {
      E.utils.closeModal(E.elements.infoModal, { skipFocusRestore: true });
    }
  }

  function renderTripModal(opts = {}) {
    const body = E.elements.tripModalBody;
    if (!body) return;
    const { escapeHtml } = E.utils;
    const db = E.state.languagesDb || {};
    const list = E.state.tripBookmarks || [];
    const stops = list.map(iso => db[iso]).filter(Boolean);

    const presetButtons = PRESETS.map(pr => `
      <button type="button" class="compare-preset-btn" data-trip-preset="${escapeHtml(pr.isos.join(','))}">${escapeHtml(pr.label)}</button>
    `).join('');

    const allOptions = (E.state.countriesList || []).map(c => `
      <option value="${escapeHtml(c.iso3)}">${c.flag || ''} ${escapeHtml(c.name)} (${escapeHtml(c.canonicalLanguage || c.primaryLanguage || '')})</option>
    `).join('');

    const cardsHtml = stops.length > 0
      ? stops.map((c, idx) => {
          const phrases = (c.phrases || []).slice(0, 3).map((ph, pIdx) => {
            const vs = E.drawer && typeof E.drawer.checkVoiceSupport === 'function'
              ? E.drawer.checkVoiceSupport(ph.bcp47 || 'en-US')
              : { supported: true, voicesLoaded: false, hasLocalVoice: true };
            const showNoVoice = !vs.supported || (vs.voicesLoaded && !vs.hasLocalVoice);
            return `
              <div class="trip-phrase-row">
                <div>
                  <span class="trip-phrase-type">${escapeHtml(ph.type)}</span>
                  <strong class="trip-phrase-text">${escapeHtml(ph.text)}</strong>
                  ${ph.phonetic ? `<span class="trip-phrase-phonetic">[${escapeHtml(ph.phonetic)}]</span>` : ''}
                  ${showNoVoice ? '<span class="trip-voice-hint" title="No OS voice installed for this language">phonetic guide</span>' : ''}
                </div>
                <button type="button" class="speak-btn trip-speak-btn ${showNoVoice ? 'no-local-voice' : ''}" data-stop-idx="${idx}" data-ph-idx="${pIdx}" title="Pronounce">🔊</button>
              </div>
            `;
          }).join('');

          const langsLine = (c.languages || []).slice(0, 2).map(l => `${escapeHtml(l.name)} (${escapeHtml(l.script)})`).join(' • ');
          const tip = c.accents && c.accents[0] ? `${escapeHtml(c.accents[0].name)}: ${escapeHtml(c.accents[0].description)}` : escapeHtml(c.funFact || '');

          return `
            <article class="trip-stop-card">
              <div class="trip-stop-head">
                <button type="button" class="trip-stop-title-btn" data-jump-iso="${escapeHtml(c.iso3)}">
                  <span class="trip-stop-num">${idx + 1}</span>
                  <span>${c.flag || '🌐'}</span>
                  <span>${escapeHtml(c.name)}</span>
                </button>
                <div class="trip-stop-controls">
                  <button type="button" class="trip-ctrl-btn" data-move="${idx}" data-dir="-1" ${idx === 0 ? 'disabled' : ''} title="Move earlier">↑</button>
                  <button type="button" class="trip-ctrl-btn" data-move="${idx}" data-dir="1" ${idx === stops.length - 1 ? 'disabled' : ''} title="Move later">↓</button>
                  <button type="button" class="trip-ctrl-btn is-del" data-remove-iso="${escapeHtml(c.iso3)}" title="Remove stop">✕</button>
                </div>
              </div>
              <div class="trip-stop-langs">${langsLine}</div>
              <div class="trip-phrases-list">${phrases}</div>
              <div class="trip-stop-tip"><strong>Accent / Local Tip:</strong> ${tip}</div>
            </article>
          `;
        }).join('')
      : `<div class="trip-empty-state">Your Travel Cheat-Sheet is empty. Star any country inside its profile, search below, or load a preset itinerary above!</div>`;

    const statusClass = opts.isError ? 'is-error' : (opts.statusText ? 'is-success' : '');

    body.innerHTML = `
      <div class="trip-toolbar">
        <div class="trip-add-row">
          <select id="tripAddSelect" class="compare-select" aria-label="Add country to trip">
            <option value="">+ Add country stop to itinerary...</option>
            ${allOptions}
          </select>
          <button type="button" class="trip-primary-btn" id="tripCopyBtn">Copy Cheat-Sheet</button>
          <button type="button" class="trip-secondary-btn" id="tripPrintBtn">Print Pocket Guide</button>
        </div>
        <div class="trip-presets-row">
          <span class="trip-preset-lbl">Presets:</span>
          ${presetButtons}
        </div>
      </div>

      <div class="trip-stops-container" id="tripPrintableArea">
        ${cardsHtml}
      </div>

      <div class="passport-footer-actions trip-footer-actions">
        <span id="tripStatusMsg" class="data-io-status ${statusClass}" role="status" aria-live="polite">${escapeHtml(opts.statusText || '')}</span>
        <div class="data-io-group">
          <button type="button" class="data-io-btn" id="tripExportBtn">Export JSON</button>
          <button type="button" class="data-io-btn" id="tripImportBtn">Import JSON</button>
          <input type="file" id="tripImportInput" accept=".json,application/json" hidden>
          <button type="button" class="passport-reset-btn" id="tripResetBtn" ${stops.length === 0 ? 'disabled' : ''}>Reset Trip</button>
        </div>
      </div>
    `;

    const selEl = document.getElementById('tripAddSelect');
    if (selEl) {
      selEl.addEventListener('change', () => {
        if (selEl.value) {
          addBookmark(selEl.value);
          renderTripModal();
        }
      });
    }

    body.querySelectorAll('[data-trip-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const isos = btn.getAttribute('data-trip-preset').split(',');
        importBookmarks(isos);
        renderTripModal();
      });
    });

    body.querySelectorAll('[data-jump-iso]').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = db[btn.getAttribute('data-jump-iso')];
        if (c && E.drawer) {
          closeTripModal({ skipFocusRestore: true });
          E.drawer.selectCountry(c, true);
        }
      });
    });

    body.querySelectorAll('[data-move]').forEach(btn => {
      btn.addEventListener('click', () => {
        moveBookmark(Number(btn.getAttribute('data-move')), Number(btn.getAttribute('data-dir')));
      });
    });

    body.querySelectorAll('[data-remove-iso]').forEach(btn => {
      btn.addEventListener('click', () => {
        removeBookmark(btn.getAttribute('data-remove-iso'));
        renderTripModal();
      });
    });

    body.querySelectorAll('.trip-speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = stops[Number(btn.getAttribute('data-stop-idx'))];
        const ph = c && c.phrases && c.phrases[Number(btn.getAttribute('data-ph-idx'))];
        if (ph && E.drawer && typeof E.drawer.playSpeechSynthesis === 'function') {
          E.drawer.playSpeechSynthesis(ph.text, ph.bcp47 || 'en-US', btn);
        }
      });
    });

    const copyBtn = document.getElementById('tripCopyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const txt = buildCheatSheetText();
        const isFile = window.location.protocol === 'file:';
        if (!isFile && navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(txt).catch(() => {
            if (E.router) E.router.copyTextFallback(txt);
          });
        } else if (E.router) {
          E.router.copyTextFallback(txt);
        }
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Cheat-Sheet'; }, 1800);
      });
    }

    const printBtn = document.getElementById('tripPrintBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        if (typeof window.print === 'function') window.print();
      });
    }

    const exportBtn = document.getElementById('tripExportBtn');
    const importBtn = document.getElementById('tripImportBtn');
    const importInput = document.getElementById('tripImportInput');
    const statusEl = document.getElementById('tripStatusMsg');
    const resetBtn = document.getElementById('tripResetBtn');

    const showTripStatus = (msg, isErr) => {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.toggle('is-error', Boolean(isErr));
      statusEl.classList.toggle('is-success', !isErr && Boolean(msg));
    };

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const payload = exportTripData();
        const dateTag = new Date().toISOString().slice(0, 10);
        E.utils.downloadJsonFile(`earthlingo-trip-${dateTag}.json`, payload);
        showTripStatus(`✓ Exported ${payload.bookmarks.length} trip stops`, false);
      });
    }

    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => {
        importInput.value = '';
        importInput.click();
      });
      importInput.addEventListener('change', (e) => {
        const file = e.target && e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const res = importTripData(String(reader.result || ''));
          if (res.ok) {
            renderTripModal({ statusText: `✓ Imported ${res.count} trip stops` });
            const reBtn = document.getElementById('tripImportBtn');
            if (reBtn) reBtn.focus();
          } else {
            showTripStatus(`✕ ${res.error}`, true);
          }
        };
        reader.onerror = () => showTripStatus('✕ Unable to read selected file.', true);
        reader.readAsText(file);
      });
    }

    if (resetBtn) {
      let armed = false;
      resetBtn.addEventListener('click', () => {
        if (!armed) {
          armed = true;
          resetBtn.textContent = 'Click again to clear trip';
          resetBtn.classList.add('armed');
          return;
        }
        clearBookmarks();
        renderTripModal({ statusText: '✓ Trip stops cleared' });
        const reClose = E.elements.closeTripModalBtn;
        if (reClose) reClose.focus();
      });
    }
  }

  function openTripModal(opts = {}) {
    const modal = E.elements.tripModal;
    if (!modal) return;
    closeOtherOverlays();
    E.state.tripModalOpen = true;
    renderTripModal();
    E.utils.openModal(modal, { initialFocus: E.elements.closeTripModalBtn });
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
  }

  function closeTripModal(opts = {}) {
    const modal = E.elements.tripModal;
    E.state.tripModalOpen = false;
    if (!modal) return;
    E.utils.closeModal(modal, opts);
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
  }

  function initTrip() {
    loadBookmarks();
    syncTripUI();
    const el = E.elements;
    if (el.openTripBtn) el.openTripBtn.addEventListener('click', () => openTripModal());
    if (el.closeTripModalBtn) el.closeTripModalBtn.addEventListener('click', () => closeTripModal());
    if (el.drawerTripBtn) {
      el.drawerTripBtn.addEventListener('click', () => {
        if (E.state.selectedCountry && E.state.selectedCountry.iso3) {
          toggleBookmark(E.state.selectedCountry.iso3);
          if (E.controls && typeof E.controls.renderModalGrid === 'function' && el.listModal && el.listModal.classList.contains('open')) {
            E.controls.renderModalGrid();
          }
        }
      });
    }
    if (el.tripModal) {
      el.tripModal.addEventListener('click', (e) => {
        if (e.target === el.tripModal) closeTripModal();
      });
    }
  }

  E.trip = {
    loadBookmarks,
    hasBookmark,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearBookmarks,
    importBookmarks,
    exportTripData,
    importTripData,
    buildCheatSheetText,
    syncTripUI,
    openTripModal,
    closeTripModal,
    initTrip
  };
})(window);
