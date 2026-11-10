// src/ui/script-inspector.js - Interactive "Meet the Script" Breakdown Modal
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  function openScript(scriptLabel, country) {
    const modal = E.elements.scriptModal;
    const body = E.elements.scriptModalBody;
    const SCRIPTS = global.WORLD_SCRIPTS_INFO;
    if (!modal || !body || !SCRIPTS) return;

    const info = SCRIPTS.resolveScriptInfo(scriptLabel, country);
    const { escapeHtml } = E.utils;
    const tokens = info.tokens || [];
    const firstTok = tokens[0] || {};

    const tokensHtml = tokens.map((tok, idx) => `
      <button type="button" class="script-token-btn ${idx === 0 ? 'active' : ''}" data-tok-idx="${idx}">
        ${tok.furigana ? `<span class="script-token-furigana">${escapeHtml(tok.furigana)}</span>` : ''}
        <span class="script-token-glyph">${escapeHtml(tok.glyph)}</span>
        <span class="script-token-read">${escapeHtml(tok.reading)}</span>
      </button>
    `).join('');

    const dirBadge = info.isRtl
      ? '<span class="script-meta-pill is-rtl">← Right-to-Left (RTL)</span>'
      : `<span class="script-meta-pill">→ ${escapeHtml(info.direction || 'LTR')}</span>`;

    body.innerHTML = `
      <div class="script-hero-row">
        <div class="script-glyph-emblem" style="border-color:${escapeHtml(info.accentColor || '#38bdf8')};color:${escapeHtml(info.accentColor || '#38bdf8')};">
          ${escapeHtml(info.glyphBadge || 'Aa')}
        </div>
        <div class="script-hero-text">
          <div class="script-hero-kicker">${escapeHtml(scriptLabel || info.name)}</div>
          <h3 class="script-hero-title">${escapeHtml(info.name)}</h3>
          <div class="script-meta-strip">
            <span class="script-meta-pill is-type">${escapeHtml(info.systemType)}</span>
            ${dirBadge}
          </div>
        </div>
      </div>

      <div class="script-origin-line"><strong>Historical Origin:</strong> ${escapeHtml(info.origin)}</div>
      <p class="script-summary-text">${escapeHtml(info.summary)}</p>
      <div class="script-mechanics-box">
        <strong>How It Works:</strong> ${escapeHtml(info.mechanics)}
      </div>

      <div class="script-breakdown-header">
        <span>Interactive Character Breakdown (Hover or Tap Any Unit)</span>
        <span class="script-sample-gloss">${escapeHtml(info.sampleGloss)}</span>
      </div>
      <div class="script-tokens-strip ${info.isRtl ? 'is-rtl' : ''}" id="scriptTokensStrip">
        ${tokensHtml}
      </div>
      <div class="script-token-detail" id="scriptTokenDetail">
        <div class="script-detail-head">
          <span class="script-detail-glyph">${escapeHtml(firstTok.glyph || '')}</span>
          <span class="script-detail-role">${escapeHtml(firstTok.role || '')}${firstTok.jamo ? ` · ${escapeHtml(firstTok.jamo)}` : ''}</span>
        </div>
        <div class="script-detail-text">${escapeHtml(firstTok.detail || '')}</div>
      </div>

      <div class="script-modal-actions">
        <button type="button" class="script-spotlight-btn" id="scriptSpotlightBtn">
          Spotlight All “${escapeHtml(info.scriptFilterGroup || 'Latin')}” Script Nations
        </button>
      </div>
    `;

    const detailEl = document.getElementById('scriptTokenDetail');
    const selectTok = (idx) => {
      const tok = tokens[idx];
      if (!tok || !detailEl) return;
      body.querySelectorAll('.script-token-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.getAttribute('data-tok-idx')) === idx);
      });
      detailEl.innerHTML = `
        <div class="script-detail-head">
          <span class="script-detail-glyph">${escapeHtml(tok.glyph)}</span>
          <span class="script-detail-role">${escapeHtml(tok.role)}${tok.jamo ? ` · ${escapeHtml(tok.jamo)}` : ''}</span>
        </div>
        <div class="script-detail-text">${escapeHtml(tok.detail)}</div>
      `;
    };

    body.querySelectorAll('.script-token-btn').forEach(btn => {
      const idx = Number(btn.getAttribute('data-tok-idx'));
      btn.addEventListener('click', () => selectTok(idx));
      btn.addEventListener('mouseenter', () => selectTok(idx));
    });

    const spotBtn = document.getElementById('scriptSpotlightBtn');
    if (spotBtn) {
      spotBtn.addEventListener('click', () => {
        const grpName = info.scriptFilterGroup || 'Latin';
        closeScriptModal();
        if (E.controls && typeof E.controls.filterByScriptGroup === 'function') {
          E.controls.filterByScriptGroup(grpName, info.accentColor || '#38bdf8', { forceOn: true });
        }
      });
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    if (E.elements.closeScriptModalBtn) E.elements.closeScriptModalBtn.focus();
  }

  function closeScriptModal() {
    const modal = E.elements.scriptModal;
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function initScriptInspector() {
    const el = E.elements;
    if (el.closeScriptModalBtn) {
      el.closeScriptModalBtn.addEventListener('click', closeScriptModal);
    }
    if (el.scriptModal) {
      el.scriptModal.addEventListener('click', (e) => {
        if (e.target === el.scriptModal) closeScriptModal();
      });
    }
  }

  E.scriptInspector = {
    openScript,
    closeScriptModal,
    initScriptInspector
  };
})(window);

