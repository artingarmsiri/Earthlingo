// src/ui/list-modal.js - Filterable 2D Countries & Languages Directory Modal
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});
  let listEventsBound = false;

  function populateListContinentFilter() {
    const sel = E.elements.listModalContinent;
    if (!sel || sel.options.length > 1) return;
    const continents = Array.from(new Set((E.state.countriesList || []).map(c => c.continent).filter(Boolean))).sort();
    continents.forEach(cont => {
      const opt = document.createElement('option');
      opt.value = cont;
      opt.textContent = cont === 'Global' ? 'Territories & Islands' : cont;
      sel.appendChild(opt);
    });
  }

  function renderModalGrid() {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    if (!el.modalCountriesGrid) return;

    populateListContinentFilter();

    const q = (E.state.listSearchQuery || '').trim().toLowerCase();
    const cont = E.state.listContinentFilter || 'all';
    const allCountries = E.state.countriesList || [];

    const filtered = allCountries.filter(c => {
      if (cont !== 'all' && c.continent !== cont) return false;
      if (!q) return true;
      if (c.name && c.name.toLowerCase().includes(q)) return true;
      if (c.nativeName && c.nativeName.toLowerCase().includes(q)) return true;
      if (c.primaryLanguage && c.primaryLanguage.toLowerCase().includes(q)) return true;
      if (c.languageFamily && c.languageFamily.toLowerCase().includes(q)) return true;
      if (c.__scriptGroup && c.__scriptGroup.toLowerCase().includes(q)) return true;
      if (c.continent && c.continent.toLowerCase().includes(q)) return true;
      if (c.languages && c.languages.some(l =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.script && l.script.toLowerCase().includes(q))
      )) return true;
      return false;
    });

    if (el.listModalCount) {
      el.listModalCount.textContent = filtered.length === allCountries.length
        ? `${allCountries.length} Countries`
        : `${filtered.length} of ${allCountries.length}`;
    }
    if (el.listModalClearBtn) {
      el.listModalClearBtn.style.display = q ? 'flex' : 'none';
    }

    if (filtered.length === 0) {
      el.modalCountriesGrid.innerHTML = `<div class="list-modal-empty">No countries match your current search or continent filter.</div>`;
      return;
    }

    el.modalCountriesGrid.innerHTML = filtered.map(c => {
      const contLabel = c.continent === 'Global' ? 'Territory' : (c.continent || '');
      const iso = c.iso3 || c.name;
      const inTrip = E.trip && typeof E.trip.hasBookmark === 'function' && E.trip.hasBookmark(iso);
      return `
      <div class="country-grid-card" data-iso="${escapeHtml(iso)}" role="button" tabindex="0">
        <span style="font-size: 1.6rem;">${c.flag || '🌐'}</span>
        <div style="display: flex; flex-direction: column; overflow: hidden; min-width: 0; flex: 1;">
          <strong style="font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.name)}</strong>
          <span style="font-size: 0.78rem; color: #38bdf8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.primaryLanguage || '')}</span>
          <span style="font-size: 0.7rem; color: #64748b;">${escapeHtml(contLabel)}${c.__scriptGroup ? ` • ${escapeHtml(c.__scriptGroup)}` : ''}</span>
        </div>
        <button type="button" class="grid-trip-star-btn ${inTrip ? 'active' : ''}" data-star-iso="${escapeHtml(iso)}" title="${inTrip ? 'Saved in Trip Cheat-Sheet' : 'Add to Trip Cheat-Sheet'}" aria-label="Toggle Travel Cheat-Sheet bookmark">${inTrip ? '★' : '☆'}</button>
      </div>
    `;
    }).join('');
  }

  function openListModal() {
    const el = E.elements;
    if (!el.listModal) return;
    if (E.utils && typeof E.utils.closeAllModals === 'function') {
      E.utils.closeAllModals({ except: el.listModal, skipRouter: true, skipFocusRestore: true });
    }
    renderModalGrid();
    E.utils.openModal(el.listModal, { initialFocus: el.listModalSearch || el.closeListModalBtn });
  }

  function closeListModal(opts = {}) {
    if (!E.elements.listModal) return;
    E.utils.closeModal(E.elements.listModal, opts);
  }

  function initListModal() {
    if (listEventsBound) return;
    listEventsBound = true;
    const el = E.elements;

    if (el.openListModalBtn) {
      el.openListModalBtn.addEventListener('click', openListModal);
    }
    if (el.closeListModalBtn) {
      el.closeListModalBtn.addEventListener('click', () => closeListModal());
    }
    if (el.listModal) {
      el.listModal.addEventListener('click', (e) => {
        if (e.target === el.listModal) closeListModal();
      });
    }

    if (el.modalCountriesGrid) {
      el.modalCountriesGrid.addEventListener('click', (e) => {
        const starBtn = e.target && e.target.closest('.grid-trip-star-btn[data-star-iso]');
        if (starBtn) {
          e.stopPropagation();
          const iso = starBtn.getAttribute('data-star-iso');
          if (E.trip && typeof E.trip.toggleBookmark === 'function') {
            const added = E.trip.toggleBookmark(iso);
            starBtn.classList.toggle('active', added);
            starBtn.textContent = added ? '★' : '☆';
            starBtn.title = added ? 'Saved in Trip Cheat-Sheet' : 'Add to Trip Cheat-Sheet';
          }
          return;
        }
        const card = e.target && e.target.closest('.country-grid-card[data-iso]');
        if (!card) return;
        const iso = card.getAttribute('data-iso');
        const c = E.state.languagesDb && E.state.languagesDb[iso];
        if (c) {
          closeListModal({ skipFocusRestore: true });
          E.drawer.selectCountry(c);
        }
      });

      el.modalCountriesGrid.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (e.target && e.target.closest('.grid-trip-star-btn')) return;
        const card = e.target && e.target.closest('.country-grid-card[data-iso]');
        if (!card || e.target !== card) return;
        e.preventDefault();
        const iso = card.getAttribute('data-iso');
        const c = E.state.languagesDb && E.state.languagesDb[iso];
        if (c) {
          closeListModal({ skipFocusRestore: true });
          E.drawer.selectCountry(c);
        }
      });
    }

    if (el.listModalSearch) {
      el.listModalSearch.addEventListener('input', (e) => {
        E.state.listSearchQuery = e.target.value;
        renderModalGrid();
      });
    }

    if (el.listModalClearBtn) {
      el.listModalClearBtn.addEventListener('click', () => {
        E.state.listSearchQuery = '';
        if (el.listModalSearch) {
          el.listModalSearch.value = '';
          el.listModalSearch.focus();
        }
        renderModalGrid();
      });
    }

    if (el.listModalContinent) {
      el.listModalContinent.addEventListener('change', (e) => {
        E.state.listContinentFilter = e.target.value || 'all';
        renderModalGrid();
      });
    }
  }

  E.listModal = {
    populateListContinentFilter,
    renderModalGrid,
    openListModal,
    closeListModal,
    initListModal
  };
})(window);

