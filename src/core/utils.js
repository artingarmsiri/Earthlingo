// src/core/utils.js - Pure Color, Geo, Viewport & DOM Helper Utilities
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function srgbToLinear(c) {
    return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
  }

  function hexToLinearRgb(hex) {
    if (!hex || hex[0] !== '#' || hex.length < 7) {
      return [srgbToLinear(2 / 255), srgbToLinear(132 / 255), srgbToLinear(199 / 255)];
    }
    const n = parseInt(hex.slice(1, 7), 16);
    return [
      srgbToLinear(((n >> 16) & 255) / 255),
      srgbToLinear(((n >> 8) & 255) / 255),
      srgbToLinear((n & 255) / 255)
    ];
  }

  function hexToRgba(hex, alpha = 1) {
    if (!hex || typeof hex !== 'string') return `rgba(56, 189, 248, ${alpha})`;
    const clean = hex.trim().replace('#', '');
    let r = 56, g = 189, b = 248;
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16);
      g = parseInt(clean[1] + clean[1], 16);
      b = parseInt(clean[2] + clean[2], 16);
    } else if (clean.length >= 6) {
      const n = parseInt(clean.slice(0, 6), 16);
      if (!Number.isNaN(n)) {
        r = (n >> 16) & 255;
        g = (n >> 8) & 255;
        b = n & 255;
      }
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function mixColorHex(hexA, hexB, weightB = 0.25) {
    const parse = (hex) => {
      const clean = (hex || '#38bdf8').trim().replace('#', '');
      if (clean.length === 3) {
        return [
          parseInt(clean[0] + clean[0], 16) || 0,
          parseInt(clean[1] + clean[1], 16) || 0,
          parseInt(clean[2] + clean[2], 16) || 0
        ];
      }
      const n = parseInt(clean.slice(0, 6), 16);
      if (Number.isNaN(n)) return [56, 189, 248];
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const [r1, g1, b1] = parse(hexA);
    const [r2, g2, b2] = parse(hexB);
    const w = Math.max(0, Math.min(1, weightB));
    const r = Math.round(r1 + (r2 - r1) * w);
    const g = Math.round(g1 + (g2 - g1) * w);
    const b = Math.round(b1 + (b2 - b1) * w);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function adjustColorBrightness(hex, percent) {
    if (!hex || hex[0] !== '#') return hex;
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function calcAngularDistRad(lng1, lat1, lng2, lat2) {
    const toRad = Math.PI / 180;
    const phi1 = lat1 * toRad;
    const phi2 = lat2 * toRad;
    const dPhi = (lat2 - lat1) * toRad;
    const dLam = (lng2 - lng1) * toRad;
    const sinHalfPhi = Math.sin(dPhi * 0.5);
    const sinHalfLam = Math.sin(dLam * 0.5);
    const a = sinHalfPhi * sinHalfPhi + Math.cos(phi1) * Math.cos(phi2) * sinHalfLam * sinHalfLam;
    return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  function isMobileViewport() {
    return window.innerWidth <= 768 || window.innerHeight <= 500;
  }

  function isBottomSheetLayout() {
    return window.innerWidth <= 768 && window.innerHeight > 520;
  }

  function getSheetViewportHeight() {
    const vv = window.visualViewport;
    return Math.max(320, Math.round((vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || 800));
  }

  function getTargetPixelRatio() {
    const { GLOBE_CONFIG } = E.config;
    const rb = E.renderBatch;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, rb.viewportW || window.innerWidth || 1200);
    const h = Math.max(1, rb.viewportH || window.innerHeight || 800);
    const area = w * h;
    if (isMobileViewport()) {
      const maxByArea = Math.sqrt(GLOBE_CONFIG.MOBILE_MAX_BUFFER_PIXELS / area);
      const desired = Math.max(dpr, 2.0);
      return Math.max(Math.min(dpr, 2.0), Math.min(2.75, desired, maxByArea));
    }
    const maxByArea = Math.sqrt(GLOBE_CONFIG.DESKTOP_MAX_BUFFER_PIXELS / area);
    const desired = Math.max(dpr, Math.min(1.65, dpr * 1.5));
    return Math.max(Math.min(dpr, 1.85), Math.min(2.5, desired, maxByArea));
  }

  function getDefaultAltitude() {
    const rb = E.renderBatch;
    const w = rb.viewportW || window.innerWidth || 1200;
    const h = rb.viewportH || window.innerHeight || 800;
    const aspect = w / Math.max(1, h);
    if (aspect >= 0.9) return 2.5;
    const tanHalfV = (E.config && E.config.GLOBE_CONFIG && E.config.GLOBE_CONFIG.TAN_HALF_FOV) || 0.46630766;
    const targetTanX = Math.max(0.16, aspect * tanHalfV * 0.94);
    const dOverR = Math.sqrt(1 + 1 / (targetTanX * targetTanX));
    return Math.min(4.45, Math.max(2.5, dOverR - 1));
  }

  function getSelectAltitude() {
    const rb = E.renderBatch;
    const w = rb.viewportW || window.innerWidth || 1200;
    const h = rb.viewportH || window.innerHeight || 800;
    const aspect = w / Math.max(1, h);
    if (aspect >= 0.9) return 1.75;
    return Math.min(3.4, Math.max(2.2, getDefaultAltitude() * 0.68));
  }

  function updateLoadingText(text) {
    if (E.elements && E.elements.loadingText) {
      E.elements.loadingText.textContent = text;
    }
  }

  function dismissLoadingOverlay() {
    const overlay = E.elements && E.elements.loadingOverlay;
    if (!overlay) return;
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 320);
  }

  function shuffleArray(list) {
    const arr = Array.isArray(list) ? list.slice() : [];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function copyTextFallback(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_err) {
      return false;
    }
  }

  function copyTextToClipboard(text, onDone) {
    const finish = (ok) => {
      if (typeof onDone === 'function') onDone(ok);
      return ok;
    };
    const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
    if (!isFileProtocol && typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function' && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(
        () => finish(true),
        () => finish(copyTextFallback(text))
      );
    }
    const ok = copyTextFallback(text);
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try { navigator.clipboard.writeText(text).catch(() => {}); } catch (_e) {}
    }
    finish(ok);
    return Promise.resolve(ok);
  }

  function computeSurfaceTangentBasis(px, py, pz, out = {}) {
    let eastX = pz;
    let eastY = 0;
    let eastZ = -px;
    let eastLen = Math.hypot(eastX, eastZ);
    if (eastLen < 1e-4) {
      eastX = 1;
      eastY = 0;
      eastZ = 0;
      eastLen = 1;
    }
    eastX /= eastLen;
    eastY /= eastLen;
    eastZ /= eastLen;

    let northX = py * eastZ - pz * eastY;
    let northY = pz * eastX - px * eastZ;
    let northZ = px * eastY - py * eastX;
    const northLen = Math.hypot(northX, northY, northZ) || 1;
    out.eastX = eastX;
    out.eastY = eastY;
    out.eastZ = eastZ;
    out.northX = northX / northLen;
    out.northY = northY / northLen;
    out.northZ = northZ / northLen;
    return out;
  }

  function downloadJsonFile(filename, dataObj) {
    const json = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 250);
  }

  function isElementVisibleForFocus(el) {
    if (!el || el.disabled || el.hasAttribute('hidden') || el.closest('[hidden]')) return false;
    if (typeof window.getComputedStyle === 'function') {
      const st = window.getComputedStyle(el);
      if (st && (st.display === 'none' || st.visibility === 'hidden')) return false;
    }
    if (typeof el.getClientRects === 'function') {
      return el.getClientRects().length > 0;
    }
    return true;
  }

  function getFocusableElements(container) {
    if (!container || typeof container.querySelectorAll !== 'function') return [];
    const selector = [
      'a[href]',
      'area[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    return Array.from(container.querySelectorAll(selector)).filter(isElementVisibleForFocus);
  }

  function getTopOpenModal() {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return null;
    const openModals = document.querySelectorAll('.modal-overlay.open');
    return openModals.length > 0 ? openModals[openModals.length - 1] : null;
  }

  function openModal(modalEl, opts = {}) {
    if (!modalEl) return;
    const wasOpen = modalEl.classList.contains('open');
    if (!wasOpen) {
      const active = document.activeElement;
      const inAnyOpenModal = active && typeof active.closest === 'function' && active.closest('.modal-overlay.open');
      modalEl.__returnFocusEl = (!inAnyOpenModal && active && active !== document.body) ? active : null;
    }

    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');

    const content = modalEl.querySelector('.modal-content') || modalEl;
    let target = opts.initialFocus && isElementVisibleForFocus(opts.initialFocus) ? opts.initialFocus : null;
    if (!target) {
      const focusables = getFocusableElements(content);
      target = focusables[0] || content;
    }
    if (target && typeof target.focus === 'function') {
      target.focus({ preventScroll: true });
    }
  }

  function closeModal(modalEl, opts = {}) {
    if (!modalEl) return;
    const returnEl = modalEl.__returnFocusEl;
    modalEl.__returnFocusEl = null;

    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');

    if (!opts.skipFocusRestore && returnEl && returnEl.isConnected && typeof returnEl.focus === 'function') {
      if (isElementVisibleForFocus(returnEl)) {
        returnEl.focus({ preventScroll: true });
      }
    }
  }

  function closeAllModals(opts = {}) {
    const el = E.elements || {};
    const except = opts.except || null;
    const skipRouter = Boolean(opts.skipRouter);
    const skipFocusRestore = Boolean(opts.skipFocusRestore);

    if (el.compareModal && el.compareModal !== except && E.state.isCompareOpen) {
      if (E.compare && typeof E.compare.closeCompareModal === 'function') {
        E.compare.closeCompareModal({ skipRouter, skipFocusRestore });
      } else {
        closeModal(el.compareModal, { skipFocusRestore });
      }
    }
    if (el.passportModal && el.passportModal !== except && el.passportModal.classList.contains('open')) {
      if (E.passport && typeof E.passport.closePassportModal === 'function') {
        E.passport.closePassportModal({ skipFocusRestore });
      } else {
        closeModal(el.passportModal, { skipFocusRestore });
      }
    }
    if (el.tripModal && el.tripModal !== except && el.tripModal.classList.contains('open')) {
      if (E.trip && typeof E.trip.closeTripModal === 'function') {
        E.trip.closeTripModal({ skipRouter, skipFocusRestore });
      } else {
        closeModal(el.tripModal, { skipFocusRestore });
      }
    }
    if (opts.includeScript !== false && el.scriptModal && el.scriptModal !== except && el.scriptModal.classList.contains('open')) {
      if (E.scriptInspector && typeof E.scriptInspector.closeScriptModal === 'function') {
        E.scriptInspector.closeScriptModal({ skipFocusRestore });
      } else {
        closeModal(el.scriptModal, { skipFocusRestore });
      }
    }
    if (el.listModal && el.listModal !== except && el.listModal.classList.contains('open')) {
      if (E.listModal && typeof E.listModal.closeListModal === 'function') {
        E.listModal.closeListModal({ skipFocusRestore });
      } else {
        closeModal(el.listModal, { skipFocusRestore });
      }
    }
    if (el.infoModal && el.infoModal !== except && el.infoModal.classList.contains('open')) {
      closeModal(el.infoModal, { skipFocusRestore });
    }
  }

  let modalFocusTrapBound = false;

  function initModalFocusTrap() {
    if (modalFocusTrapBound || typeof document === 'undefined') return;
    modalFocusTrapBound = true;

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const activeModal = getTopOpenModal();
      if (!activeModal) return;

      const content = activeModal.querySelector('.modal-content') || activeModal;
      const focusables = getFocusableElements(content);
      if (focusables.length === 0) {
        e.preventDefault();
        if (typeof content.focus === 'function') content.focus({ preventScroll: true });
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!active || !activeModal.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus({ preventScroll: true });
        return;
      }

      if (e.shiftKey) {
        if (active === first || active === content) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    });
  }

  E.utils = {
    escapeHtml,
    srgbToLinear,
    hexToLinearRgb,
    hexToRgba,
    mixColorHex,
    adjustColorBrightness,
    calcAngularDistRad,
    shuffleArray,
    copyTextFallback,
    copyTextToClipboard,
    computeSurfaceTangentBasis,
    isMobileViewport,
    isBottomSheetLayout,
    getSheetViewportHeight,
    getTargetPixelRatio,
    getDefaultAltitude,
    getSelectAltitude,
    updateLoadingText,
    dismissLoadingOverlay,
    downloadJsonFile,
    getFocusableElements,
    getTopOpenModal,
    openModal,
    closeModal,
    closeAllModals,
    initModalFocusTrap
  };
})(window);

