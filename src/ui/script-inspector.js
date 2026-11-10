// src/ui/script-inspector.js - Interactive "Meet the Script" Breakdown Modal
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});
  let scriptEventsBound = false;
  let currentScriptTokens = [];
  let currentScriptInfo = null;
  let activeTokenIdx = 0;

  function selectScriptToken(idx) {
    const body = E.elements.scriptModalBody;
    const detailEl = document.getElementById('scriptTokenDetail');
    const tok = currentScriptTokens[idx];
    if (!body || !detailEl || !tok || idx === activeTokenIdx) return;

    activeTokenIdx = idx;
    const { escapeHtml } = E.utils;
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
  }

  function openScript(scriptLabel, country) {
    const modal = E.elements.scriptModal;
    const body = E.elements.scriptModalBody;
    const SCRIPTS = global.WORLD_SCRIPTS_INFO;
    if (!modal || !body || !SCRIPTS) return;

    if (E.utils && typeof E.utils.closeAllModals === 'function') {
      E.utils.closeAllModals({ except: modal, includeScript: false, skipRouter: true, skipFocusRestore: true });
    }

    const info = SCRIPTS.resolveScriptInfo(scriptLabel, country);
    const { escapeHtml } = E.utils;
    const tokens = info.tokens || [];
    const firstTok = tokens[0] || {};
    currentScriptInfo = info;
    currentScriptTokens = tokens;
    activeTokenIdx = 0;

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

    E.utils.openModal(modal, { initialFocus: E.elements.closeScriptModalBtn });
  }

  function closeScriptModal(opts = {}) {
    const modal = E.elements.scriptModal;
    if (!modal) return;
    E.utils.closeModal(modal, opts);
  }

  function initScriptInspector() {
    if (scriptEventsBound) return;
    scriptEventsBound = true;

    const el = E.elements;
    if (el.closeScriptModalBtn) {
      el.closeScriptModalBtn.addEventListener('click', () => closeScriptModal());
    }
    if (el.scriptModal) {
      el.scriptModal.addEventListener('click', (e) => {
        if (e.target === el.scriptModal) closeScriptModal();
      });
    }
    if (el.scriptModalBody) {
      el.scriptModalBody.addEventListener('click', (e) => {
        const tokBtn = e.target && e.target.closest('.script-token-btn[data-tok-idx]');
        if (tokBtn) {
          selectScriptToken(Number(tokBtn.getAttribute('data-tok-idx')));
          return;
        }
        const spotBtn = e.target && e.target.closest('#scriptSpotlightBtn');
        if (spotBtn) {
          const grpName = (currentScriptInfo && currentScriptInfo.scriptFilterGroup) || 'Latin';
          const col = (currentScriptInfo && currentScriptInfo.accentColor) || '#38bdf8';
          closeScriptModal({ skipFocusRestore: true });
          if (E.controls && typeof E.controls.filterByScriptGroup === 'function') {
            E.controls.filterByScriptGroup(grpName, col, { forceOn: true });
          }
        }
      });

      el.scriptModalBody.addEventListener('mouseover', (e) => {
        const tokBtn = e.target && e.target.closest('.script-token-btn[data-tok-idx]');
        if (tokBtn) {
          selectScriptToken(Number(tokBtn.getAttribute('data-tok-idx')));
        }
      });
    }
  }

  E.scriptInspector = {
    openScript,
    closeScriptModal,
    initScriptInspector
  };
})(window);

