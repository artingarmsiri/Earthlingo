// src/ui/compare.js - Side-by-Side Country Linguistic Comparison Mode
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  const CURATED_PRESETS = [
    { a: 'BRA', b: 'PRT', label: 'Brazil vs Portugal' },
    { a: 'JPN', b: 'KOR', label: 'Japan vs S. Korea' },
    { a: 'ESP', b: 'MEX', label: 'Spain vs Mexico' },
    { a: 'IND', b: 'PAK', label: 'India vs Pakistan' },
    { a: 'GBR', b: 'USA', label: 'UK vs USA' },
    { a: 'CHE', b: 'BEL', label: 'Switzerland vs Belgium' }
  ];

  const SMART_PARTNERS = {
    BRA: 'PRT',
    PRT: 'BRA',
    ESP: 'MEX',
    MEX: 'ESP',
    ARG: 'ESP',
    COL: 'ESP',
    PER: 'BOL',
    BOL: 'PER',
    GBR: 'USA',
    USA: 'GBR',
    CAN: 'FRA',
    FRA: 'CAN',
    AUS: 'NZL',
    NZL: 'AUS',
    DEU: 'AUT',
    AUT: 'CHE',
    CHE: 'BEL',
    BEL: 'NLD',
    NLD: 'ZAF',
    JPN: 'KOR',
    KOR: 'JPN',
    CHN: 'TWN',
    TWN: 'SGP',
    SGP: 'MYS',
    MYS: 'IDN',
    IDN: 'PHL',
    IND: 'PAK',
    PAK: 'BGD',
    IRN: 'AFG',
    AFG: 'TJK',
    TJK: 'IRN',
    EGY: 'MAR',
    SAU: 'EGY',
    MAR: 'DZA',
    TUR: 'AZE',
    AZE: 'TUR',
    RUS: 'UKR',
    UKR: 'POL',
    FIN: 'EST',
    EST: 'FIN',
    HUN: 'FIN',
    ETH: 'ERI',
    KEN: 'TZA',
    TZA: 'KEN',
    GRC: 'CYP',
    ROU: 'MDA',
    SWE: 'NOR',
    NOR: 'DNK'
  };

  function resolveCountryByKey(rawKey) {
    if (!rawKey || !E.state.languagesDb) return null;
    const db = E.state.languagesDb;
    const trimmed = String(rawKey).trim();
    if (db[trimmed]) return db[trimmed];
    const upper = trimmed.toUpperCase();
    if (db[upper]) return db[upper];
    const lower = trimmed.toLowerCase();
    const list = E.state.countriesList || [];
    return (
      list.find(c => (c.iso3 && c.iso3.toUpperCase() === upper) || (c.name && c.name.toLowerCase() === lower)) ||
      null
    );
  }

  function pickSmartComparePartner(countryA) {
    const keyA = E.geo.getCountryKey(countryA);
    const isoA = (countryA && countryA.iso3 ? countryA.iso3.toUpperCase() : '');
    if (isoA && SMART_PARTNERS[isoA]) {
      const p = resolveCountryByKey(SMART_PARTNERS[isoA]);
      if (p && E.geo.getCountryKey(p) !== keyA) return p;
    }

    const list = E.state.countriesList || [];
    const canonA = (countryA.canonicalLanguage || countryA.primaryLanguage || '').toLowerCase();
    const famA = countryA.__familyGroup || '';

    const sameCanon = list.find(c =>
      E.geo.getCountryKey(c) !== keyA &&
      ((c.canonicalLanguage || c.primaryLanguage || '').toLowerCase() === canonA)
    );
    if (sameCanon) return sameCanon;

    const sameFam = list.find(c =>
      E.geo.getCountryKey(c) !== keyA &&
      (c.__familyGroup || '') === famA
    );
    if (sameFam) return sameFam;

    const fallback = resolveCountryByKey(isoA === 'BRA' ? 'PRT' : 'BRA');
    if (fallback && E.geo.getCountryKey(fallback) !== keyA) return fallback;
    return list.find(c => E.geo.getCountryKey(c) !== keyA) || countryA;
  }

  function collectTokenMap(country) {
    const map = new Map();
    if (!country) return map;
    (country.languages || []).forEach(lang => {
      const toks = (lang.__tokens && lang.__tokens.length > 0)
        ? lang.__tokens
        : E.geo.extractSpokenLanguageTokens(lang);
      toks.forEach(tok => {
        if (!map.has(tok)) {
          map.set(tok, {
            token: tok,
            percentage: lang.percentage || '',
            type: lang.type || 'Spoken',
            family: lang.family || '',
            rawName: lang.name || tok
          });
        }
      });
    });
    return map;
  }

  function computeLanguageComparison(cA, cB) {
    const mapA = collectTokenMap(cA);
    const mapB = collectTokenMap(cB);
    const shared = [];
    const onlyA = [];
    const onlyB = [];

    mapA.forEach((infoA, tok) => {
      if (mapB.has(tok)) {
        shared.push({ token: tok, a: infoA, b: mapB.get(tok) });
      } else {
        onlyA.push(infoA);
      }
    });
    mapB.forEach((infoB, tok) => {
      if (!mapA.has(tok)) {
        onlyB.push(infoB);
      }
    });

    const scrA = E.labelFormatter ? E.labelFormatter.resolveCountryScriptMeta(cA) : { shortName: 'Latin', fullDetail: 'Latin' };
    const scrB = E.labelFormatter ? E.labelFormatter.resolveCountryScriptMeta(cB) : { shortName: 'Latin', fullDetail: 'Latin' };
    const grpScrA = cA.__scriptGroup || E.geo.resolveCountryScriptGroup(cA).name;
    const grpScrB = cB.__scriptGroup || E.geo.resolveCountryScriptGroup(cB).name;

    const famA = cA.__familyGroup || E.geo.resolveCountryFamilyGroup(cA).name;
    const famB = cB.__familyGroup || E.geo.resolveCountryFamilyGroup(cB).name;

    const canonA = cA.canonicalLanguage || cA.primaryLanguage || '';
    const canonB = cB.canonicalLanguage || cB.primaryLanguage || '';

    const ORIGINS = global.WORLD_ORIGINS;
    const origA = ORIGINS && typeof ORIGINS.resolveCountryOrigin === 'function' ? ORIGINS.resolveCountryOrigin(cA) : null;
    const origB = ORIGINS && typeof ORIGINS.resolveCountryOrigin === 'function' ? ORIGINS.resolveCountryOrigin(cB) : null;

    const samePrimary = Boolean(canonA && canonB && canonA.toLowerCase() === canonB.toLowerCase());
    const sameFamily = Boolean(famA && famB && famA === famB);
    const sameScript = Boolean(grpScrA && grpScrB && grpScrA === grpScrB);
    const sameOriginCorridor = Boolean(origA && origB && origA.corridorId && origA.corridorId === origB.corridorId);

    const normalizePhraseKind = (t) => {
      const s = String(t || '').toLowerCase();
      if (s.includes('hello') || s.includes('greet') || s.includes('hi')) return 'Greeting';
      if (s.includes('thank')) return 'Thank You';
      if (s.includes('bye') || s.includes('farewell')) return 'Goodbye';
      return t || 'Phrase';
    };

    const pA = cA.phrases || [];
    const pB = cB.phrases || [];
    const duelRows = [];
    const maxLen = Math.min(3, Math.max(pA.length, pB.length));
    for (let i = 0; i < maxLen; i++) {
      const phA = pA[i] || null;
      const phB = pB[i] || null;
      if (!phA && !phB) continue;
      duelRows.push({
        label: normalizePhraseKind((phA && phA.type) || (phB && phB.type) || `Phrase ${i + 1}`),
        a: phA,
        b: phB
      });
    }

    return {
      cA,
      cB,
      shared,
      onlyA,
      onlyB,
      scrA,
      scrB,
      grpScrA,
      grpScrB,
      famA,
      famB,
      canonA,
      canonB,
      origA,
      origB,
      samePrimary,
      sameFamily,
      sameScript,
      sameOriginCorridor,
      duelRows
    };
  }

  function populateSelects() {
    const el = E.elements;
    const list = E.state.countriesList || [];
    if (!el.compareSelectA || !el.compareSelectB || list.length === 0) return;

    const buildOpts = (selectEl) => {
      if (selectEl.options.length === list.length) return;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        const opt = document.createElement('option');
        opt.value = E.geo.getCountryKey(c);
        opt.textContent = `${c.name} — ${c.canonicalLanguage || c.primaryLanguage || ''}`;
        frag.appendChild(opt);
      }
      selectEl.innerHTML = '';
      selectEl.appendChild(frag);
    };

    buildOpts(el.compareSelectA);
    buildOpts(el.compareSelectB);
  }

  function syncPresetChipsUI(keyA, keyB) {
    const box = E.elements.comparePresets;
    if (!box) return;
    box.querySelectorAll('.compare-preset-btn').forEach(btn => {
      const a = btn.getAttribute('data-a');
      const b = btn.getAttribute('data-b');
      const active = (a === keyA && b === keyB) || (a === keyB && b === keyA);
      btn.classList.toggle('active', active);
    });
  }

  function renderPhraseDuelCell(phrase, prefixId, sideLabel) {
    const { escapeHtml } = E.utils;
    if (!phrase) {
      return `<div class="compare-phrase-empty">No phrase recorded for ${escapeHtml(sideLabel)}</div>`;
    }
    const bcp = phrase.bcp47 || 'en-US';
    const vs = E.drawer.checkVoiceSupport(bcp);
    const showNoVoice = !vs.supported || (vs.voicesLoaded && !vs.hasLocalVoice);
    return `
      <div class="phrase-card compare-phrase-card" data-bcp47="${escapeHtml(bcp)}">
        <div class="phrase-info">
          <span class="phrase-label">${escapeHtml(sideLabel)} • ${escapeHtml(phrase.type || 'Phrase')}</span>
          <span class="phrase-text">${escapeHtml(phrase.text)}</span>
          ${phrase.phonetic ? `<span class="phrase-phonetic">/${escapeHtml(phrase.phonetic)}/</span>` : ''}
          <span class="phrase-voice-hint ${showNoVoice ? 'visible' : ''}">No local audio voice — phonetic guide shown</span>
        </div>
        <button type="button" class="speak-btn compare-speak-btn ${showNoVoice ? 'no-local-voice' : ''}" data-duel-id="${escapeHtml(prefixId)}" title="${showNoVoice ? `No local audio voice for ${escapeHtml(bcp)} — phonetic guide shown` : 'Listen to pronunciation'}" aria-label="Listen to ${escapeHtml(sideLabel)} phrase">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>
      </div>
    `;
  }

  function renderCompareBody() {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    if (!el.compareBody) return;

    populateSelects();

    const cA = resolveCountryByKey(E.state.compareIsoA) || resolveCountryByKey('BRA') || (E.state.countriesList && E.state.countriesList[0]);
    const cB = resolveCountryByKey(E.state.compareIsoB) || resolveCountryByKey('PRT') || (E.state.countriesList && E.state.countriesList[1]);
    if (!cA || !cB) return;

    const keyA = E.geo.getCountryKey(cA);
    const keyB = E.geo.getCountryKey(cB);
    E.state.compareIsoA = keyA;
    E.state.compareIsoB = keyB;

    if (el.compareSelectA) el.compareSelectA.value = keyA;
    if (el.compareSelectB) el.compareSelectB.value = keyB;
    syncPresetChipsUI(keyA, keyB);

    const cmp = computeLanguageComparison(cA, cB);

    const statusTags = [];
    if (cmp.samePrimary) {
      statusTags.push('<span class="compare-status-badge is-match">Shared Primary Language</span>');
    }
    if (cmp.sameFamily) {
      statusTags.push(`<span class="compare-status-badge is-family">Same Family Branch: ${escapeHtml(cmp.famA)}</span>`);
    } else {
      statusTags.push('<span class="compare-status-badge is-diff">Distinct Language Families</span>');
    }
    if (cmp.sameScript) {
      statusTags.push(`<span class="compare-status-badge is-script">Shared Script Family: ${escapeHtml(cmp.grpScrA)}</span>`);
    } else {
      statusTags.push(`<span class="compare-status-badge is-diff">Different Scripts (${escapeHtml(cmp.scrA.shortName)} vs ${escapeHtml(cmp.scrB.shortName)})</span>`);
    }
    if (cmp.sameOriginCorridor) {
      statusTags.push('<span class="compare-status-badge is-origin">Shared Historical Migration Corridor</span>');
    }

    const renderProfileCard = (c, famGrp, scrMeta, origin, side) => {
      const col = c.color || '#38bdf8';
      const cKey = E.geo.getCountryKey(c);
      return `
        <div class="compare-country-card">
          <div class="compare-country-head">
            <span class="compare-flag">${c.flag || '🌐'}</span>
            <div class="compare-country-titles">
              <h4>${escapeHtml(c.name)}</h4>
              <div class="compare-native">${escapeHtml(c.nativeName || c.officialName || '')}</div>
            </div>
            <button type="button" class="compare-fly-btn" data-fly-country="${escapeHtml(cKey)}" title="Focus ${escapeHtml(c.name)} on 3D Globe">
              View Globe
            </button>
          </div>
          <div class="compare-meta-chips">
            <span class="meta-badge" style="background: ${col}24; border-color: ${col}; color: #fff; font-weight: 700;">
              <span class="legend-dot" style="background: ${col};"></span>
              ${escapeHtml(c.canonicalLanguage || c.primaryLanguage || '')}
            </span>
            <span class="meta-badge">${escapeHtml(famGrp)}</span>
            <span class="meta-badge">Script: ${escapeHtml(scrMeta.fullDetail || cmp[side === 'A' ? 'grpScrA' : 'grpScrB'])}</span>
            <span class="meta-badge">🌍 ${escapeHtml(c.continent || '')}</span>
          </div>
          ${origin ? `
            <div class="compare-origin-box">
              <span class="compare-origin-label">Urheimat &amp; Era</span>
              <div class="compare-origin-homeland">${escapeHtml(origin.homeland)}</div>
              <div class="compare-origin-era">${escapeHtml(origin.era)}</div>
            </div>
          ` : ''}
        </div>
      `;
    };

    const sharedPillsHtml = cmp.shared.length > 0
      ? cmp.shared.map(item => `
          <button type="button" class="compare-lang-pill is-shared" data-spotlight-lang="${escapeHtml(item.token)}" title="Spotlight ${escapeHtml(item.token)} on the 3D globe">
            <span class="legend-dot" style="background: #10b981;"></span>
            <span>${escapeHtml(item.token)}</span>
            <span class="compare-pill-sub">${escapeHtml(item.a.percentage || '')}${item.a.percentage && item.b.percentage ? ' / ' : ''}${escapeHtml(item.b.percentage || '')}</span>
          </button>
        `).join('')
      : `<div class="compare-empty-note">No direct overlap in mapped spoken languages between ${escapeHtml(cA.name)} and ${escapeHtml(cB.name)}.</div>`;

    const uniquePillsHtml = (items) => {
      if (items.length === 0) return '<div class="compare-empty-note">None unique</div>';
      return items.map(it => `
        <button type="button" class="compare-lang-pill" data-spotlight-lang="${escapeHtml(it.token)}" title="Spotlight ${escapeHtml(it.token)} on the 3D globe">
          <span>${escapeHtml(it.token)}</span>
          ${it.percentage ? `<span class="compare-pill-sub">${escapeHtml(it.percentage)}</span>` : ''}
        </button>
      `).join('');
    };

    const duelLookup = [];
    const duelHtml = cmp.duelRows.map((row, idx) => {
      const idA = `A_${idx}`;
      const idB = `B_${idx}`;
      if (row.a) duelLookup.push({ id: idA, phrase: row.a });
      if (row.b) duelLookup.push({ id: idB, phrase: row.b });
      return `
        <div class="compare-duel-row">
          <div class="compare-duel-kind">${escapeHtml(row.label)}</div>
          <div class="compare-duel-pair">
            ${renderPhraseDuelCell(row.a, idA, cA.name)}
            ${renderPhraseDuelCell(row.b, idB, cB.name)}
          </div>
        </div>
      `;
    }).join('');

    const accA = (cA.accents || []).slice(0, 2);
    const accB = (cB.accents || []).slice(0, 2);

    el.compareBody.innerHTML = `
      <div class="compare-verdict-row">${statusTags.join('')}</div>

      <div class="compare-cards-grid">
        ${renderProfileCard(cA, cmp.famA, cmp.scrA, cmp.origA, 'A')}
        ${renderProfileCard(cB, cmp.famB, cmp.scrB, cmp.origB, 'B')}
      </div>

      <section class="compare-section">
        <div class="compare-section-header">
          <span>Spoken Language Overlap</span>
          <span class="section-counter">${cmp.shared.length} Shared • ${cmp.onlyA.length} Only ${escapeHtml(cA.iso3 || cA.name)} • ${cmp.onlyB.length} Only ${escapeHtml(cB.iso3 || cB.name)}</span>
        </div>
        <div class="compare-overlap-grid">
          <div class="compare-overlap-box is-shared-box">
            <div class="compare-box-title">Shared Spoken Languages (${cmp.shared.length})</div>
            <div class="compare-pill-list">${sharedPillsHtml}</div>
          </div>
          <div class="compare-overlap-box">
            <div class="compare-box-title">Distinct to ${escapeHtml(cA.name)} (${cmp.onlyA.length})</div>
            <div class="compare-pill-list">${uniquePillsHtml(cmp.onlyA)}</div>
          </div>
          <div class="compare-overlap-box">
            <div class="compare-box-title">Distinct to ${escapeHtml(cB.name)} (${cmp.onlyB.length})</div>
            <div class="compare-pill-list">${uniquePillsHtml(cmp.onlyB)}</div>
          </div>
        </div>
      </section>

      ${cmp.duelRows.length > 0 ? `
        <section class="compare-section">
          <div class="compare-section-header">
            <span>Side-by-Side Phrase Duel</span>
            <span class="section-counter">Compare Scripts &amp; Audio</span>
          </div>
          <div class="compare-duel-list">${duelHtml}</div>
        </section>
      ` : ''}

      <section class="compare-section">
        <div class="compare-section-header">
          <span>Dialect &amp; Accent Highlights</span>
          <span class="section-counter">Regional Varieties</span>
        </div>
        <div class="compare-cards-grid">
          <div class="compare-accents-col">
            <div class="compare-box-title">${escapeHtml(cA.name)} (${(cA.accents || []).length} mapped)</div>
            ${accA.length > 0 ? accA.map(ac => `
              <div class="accent-card">
                <div class="accent-title-row">
                  <span class="accent-name">${escapeHtml(ac.name)}</span>
                  <span class="accent-region">${escapeHtml(ac.region || '')}</span>
                </div>
                <p class="accent-desc">${escapeHtml(ac.description || '')}</p>
              </div>
            `).join('') : '<div class="compare-empty-note">Minimal regional accent divergence noted.</div>'}
          </div>
          <div class="compare-accents-col">
            <div class="compare-box-title">${escapeHtml(cB.name)} (${(cB.accents || []).length} mapped)</div>
            ${accB.length > 0 ? accB.map(ac => `
              <div class="accent-card">
                <div class="accent-title-row">
                  <span class="accent-name">${escapeHtml(ac.name)}</span>
                  <span class="accent-region">${escapeHtml(ac.region || '')}</span>
                </div>
                <p class="accent-desc">${escapeHtml(ac.description || '')}</p>
              </div>
            `).join('') : '<div class="compare-empty-note">Minimal regional accent divergence noted.</div>'}
          </div>
        </div>
      </section>
    `;

    el.compareBody.querySelectorAll('.compare-fly-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.getAttribute('data-fly-country');
        const c = resolveCountryByKey(k);
        if (c) {
          closeCompareModal({ skipRouter: true });
          E.drawer.selectCountry(c, true);
        }
      });
    });

    el.compareBody.querySelectorAll('.compare-lang-pill[data-spotlight-lang]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tok = btn.getAttribute('data-spotlight-lang');
        if (tok && E.controls && typeof E.controls.filterBySpokenLanguage === 'function') {
          closeCompareModal({ skipRouter: true });
          E.controls.filterBySpokenLanguage(tok, null, { forceOn: true });
        }
      });
    });

    el.compareBody.querySelectorAll('.compare-speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const did = btn.getAttribute('data-duel-id');
        const found = duelLookup.find(d => d.id === did);
        if (found && found.phrase) {
          E.drawer.playSpeechSynthesis(found.phrase.text, found.phrase.bcp47 || 'en-US', btn);
        }
      });
    });
  }

  function openComparePair(isoA, isoB, opts = {}) {
    const el = E.elements;
    if (!el.compareModal) return;

    if (E.state.isQuizActive && E.quiz && typeof E.quiz.stopQuiz === 'function') {
      E.quiz.stopQuiz({ restoreOverlay: true, skipRouter: true });
    }
    if (el.listModal) {
      el.listModal.classList.remove('open');
      el.listModal.setAttribute('aria-hidden', 'true');
    }
    if (el.infoModal) {
      el.infoModal.classList.remove('open');
      el.infoModal.setAttribute('aria-hidden', 'true');
    }

    const cA = resolveCountryByKey(isoA) || resolveCountryByKey(E.state.compareIsoA) || resolveCountryByKey('BRA');
    let cB = resolveCountryByKey(isoB) || resolveCountryByKey(E.state.compareIsoB) || resolveCountryByKey('PRT');
    if (cA && cB && E.geo.getCountryKey(cA) === E.geo.getCountryKey(cB)) {
      cB = pickSmartComparePartner(cA);
    }

    if (cA) E.state.compareIsoA = E.geo.getCountryKey(cA);
    if (cB) E.state.compareIsoB = E.geo.getCountryKey(cB);
    E.state.isCompareOpen = true;

    renderCompareBody();
    el.compareModal.classList.add('open');
    el.compareModal.setAttribute('aria-hidden', 'false');
    if (el.openCompareBtn) el.openCompareBtn.classList.add('active');

    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function openCompareWithCountry(country) {
    if (!country) {
      openComparePair(E.state.compareIsoA || 'BRA', E.state.compareIsoB || 'PRT');
      return;
    }
    const keyA = E.geo.getCountryKey(country);
    const partner = pickSmartComparePartner(country);
    const keyB = E.geo.getCountryKey(partner);
    openComparePair(keyA, keyB);
  }

  function closeCompareModal(opts = {}) {
    const el = E.elements;
    if (!el.compareModal || !E.state.isCompareOpen) {
      if (el.compareModal) {
        el.compareModal.classList.remove('open');
        el.compareModal.setAttribute('aria-hidden', 'true');
      }
      E.state.isCompareOpen = false;
      if (el.openCompareBtn) el.openCompareBtn.classList.remove('active');
      return;
    }
    el.compareModal.classList.remove('open');
    el.compareModal.setAttribute('aria-hidden', 'true');
    E.state.isCompareOpen = false;
    if (el.openCompareBtn) el.openCompareBtn.classList.remove('active');

    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function initCompare() {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    populateSelects();

    if (el.comparePresets) {
      el.comparePresets.innerHTML = CURATED_PRESETS.map(p => `
        <button type="button" class="compare-preset-btn" data-a="${escapeHtml(p.a)}" data-b="${escapeHtml(p.b)}">
          ${escapeHtml(p.label)}
        </button>
      `).join('');

      el.comparePresets.querySelectorAll('.compare-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const a = btn.getAttribute('data-a');
          const b = btn.getAttribute('data-b');
          openComparePair(a, b);
        });
      });
    }

    if (el.openCompareBtn) {
      el.openCompareBtn.addEventListener('click', () => {
        if (E.state.isCompareOpen) {
          closeCompareModal();
        } else if (E.state.selectedCountry) {
          openCompareWithCountry(E.state.selectedCountry);
        } else {
          openComparePair(E.state.compareIsoA || 'BRA', E.state.compareIsoB || 'PRT');
        }
      });
    }

    if (el.closeCompareModalBtn) {
      el.closeCompareModalBtn.addEventListener('click', () => closeCompareModal());
    }

    if (el.compareModal) {
      el.compareModal.addEventListener('click', (e) => {
        if (e.target === el.compareModal) closeCompareModal();
      });
    }

    if (el.compareSelectA) {
      el.compareSelectA.addEventListener('change', (e) => {
        E.state.compareIsoA = e.target.value;
        renderCompareBody();
        if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
      });
    }

    if (el.compareSelectB) {
      el.compareSelectB.addEventListener('change', (e) => {
        E.state.compareIsoB = e.target.value;
        renderCompareBody();
        if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
      });
    }

    if (el.compareSwapBtn) {
      el.compareSwapBtn.addEventListener('click', () => {
        const tmp = E.state.compareIsoA;
        E.state.compareIsoA = E.state.compareIsoB;
        E.state.compareIsoB = tmp;
        renderCompareBody();
        if (E.router && typeof E.router.syncUrlHash === 'function') E.router.syncUrlHash();
      });
    }
  }

  E.compare = {
    computeLanguageComparison,
    openComparePair,
    openCompareWithCountry,
    closeCompareModal,
    initCompare
  };
})(window);

