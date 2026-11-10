// src/ui/search.js - Autocomplete Country & Language Search with Keyboard Navigation
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});
  let searchEventsBound = false;

  function initSearch() {
    if (searchEventsBound) return;
    searchEventsBound = true;

    const el = E.elements;
    if (!el.searchInput || !el.searchResultsDropdown) return;
    const { escapeHtml } = E.utils;
    if (!E.state.countriesList || E.state.countriesList.length === 0) {
      E.geo.buildSpokenLanguageIndex();
    }

    let activeIndex = -1;
    let currentMatches = [];
    let transientStatus = '';

    function closeSearchDropdown() {
      activeIndex = -1;
      el.searchResultsDropdown.style.display = 'none';
      el.searchInput.setAttribute('aria-expanded', 'false');
      el.searchInput.removeAttribute('aria-activedescendant');
    }

    function updateActiveResult(nextIdx, shouldScroll = true) {
      const items = el.searchResultsDropdown.querySelectorAll('.search-result-item');
      if (items.length === 0) {
        activeIndex = -1;
        el.searchInput.removeAttribute('aria-activedescendant');
        return;
      }

      if (nextIdx < 0) nextIdx = items.length - 1;
      else if (nextIdx >= items.length) nextIdx = 0;

      activeIndex = nextIdx;
      items.forEach((item, i) => {
        const isActive = i === activeIndex;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      const activeId = items[activeIndex].id;
      if (activeId) {
        el.searchInput.setAttribute('aria-activedescendant', activeId);
      }
      if (shouldScroll && typeof items[activeIndex].scrollIntoView === 'function') {
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    }

    function pickSearchCountry(country) {
      if (!country) return;
      el.searchInput.value = country.name;
      if (el.searchClearBtn) el.searchClearBtn.style.display = 'block';
      closeSearchDropdown();
      el.searchInput.blur();
      E.drawer.selectCountry(country);
    }

    function renderSearchResults(queryRaw) {
      const query = String(queryRaw || '').trim().toLowerCase();
      if (el.searchClearBtn) el.searchClearBtn.style.display = query ? 'block' : 'none';
      transientStatus = query;

      if (!query) {
        currentMatches = [];
        closeSearchDropdown();
        return;
      }

      currentMatches = E.state.countriesList.filter(c => {
        if (c.name.toLowerCase().includes(query)) return true;
        if (c.officialName && c.officialName.toLowerCase().includes(query)) return true;
        if (c.nativeName && c.nativeName.toLowerCase().includes(query)) return true;
        if (c.primaryLanguage && c.primaryLanguage.toLowerCase().includes(query)) return true;
        if (c.languageFamily && c.languageFamily.toLowerCase().includes(query)) return true;
        if (c.continent && c.continent.toLowerCase().includes(query)) return true;
        if (c.languages && c.languages.some(l => l.name.toLowerCase().includes(query))) return true;
        if (c.accents && c.accents.some(a => a.name.toLowerCase().includes(query) || (a.region && a.region.toLowerCase().includes(query)))) return true;
        return false;
      }).slice(0, 15);

      activeIndex = -1;
      el.searchInput.removeAttribute('aria-activedescendant');

      if (currentMatches.length === 0) {
        el.searchResultsDropdown.innerHTML = `<div style="padding: 12px 14px; font-size: 0.85rem; color: #94a3b8;">No matching countries or languages found.</div>`;
        el.searchResultsDropdown.style.display = 'block';
        el.searchInput.setAttribute('aria-expanded', 'true');
        return;
      }

      el.searchResultsDropdown.innerHTML = currentMatches.map((c, idx) => `
        <div class="search-result-item" id="searchResultOpt_${idx}" role="option" aria-selected="false" data-idx="${idx}" data-iso="${escapeHtml(c.iso3 || c.name)}">
          <div class="result-main">
            <span class="result-flag">${c.flag || '🌐'}</span>
            <div class="result-info">
              <span class="result-name">${escapeHtml(c.name)}</span>
              <span class="result-lang">${escapeHtml(c.primaryLanguage || 'Official Language')}</span>
            </div>
          </div>
          <span class="result-tag">${escapeHtml(c.continent || '')}</span>
        </div>
      `).join('');

      el.searchResultsDropdown.style.display = 'block';
      el.searchInput.setAttribute('aria-expanded', 'true');
    }

    el.searchResultsDropdown.addEventListener('mouseover', (e) => {
      const item = e.target && e.target.closest('.search-result-item[data-idx]');
      if (!item) return;
      const idx = parseInt(item.getAttribute('data-idx'), 10);
      if (!Number.isNaN(idx) && idx !== activeIndex) {
        updateActiveResult(idx, false);
      }
    });

    el.searchResultsDropdown.addEventListener('click', (e) => {
      const item = e.target && e.target.closest('.search-result-item[data-idx]');
      if (!item) return;
      const idx = parseInt(item.getAttribute('data-idx'), 10);
      const iso = item.getAttribute('data-iso');
      const found = (iso && E.state.languagesDb[iso]) || currentMatches[idx];
      pickSearchCountry(found);
    });

    el.searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    el.searchInput.addEventListener('keydown', (e) => {
      const isOpen = el.searchResultsDropdown.style.display === 'block';

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen && el.searchInput.value.trim()) {
          renderSearchResults(el.searchInput.value);
        }
        if (currentMatches.length > 0) {
          updateActiveResult(activeIndex < 0 ? 0 : activeIndex + 1, true);
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen && el.searchInput.value.trim()) {
          renderSearchResults(el.searchInput.value);
        }
        if (currentMatches.length > 0) {
          updateActiveResult(activeIndex < 0 ? currentMatches.length - 1 : activeIndex - 1, true);
        }
        return;
      }

      if (e.key === 'Enter') {
        if (!isOpen && el.searchInput.value.trim() && el.searchInput.value.trim().toLowerCase() !== transientStatus) {
          renderSearchResults(el.searchInput.value);
        }
        if (el.searchResultsDropdown.style.display === 'block' && currentMatches.length > 0) {
          e.preventDefault();
          const pickIdx = activeIndex >= 0 && activeIndex < currentMatches.length ? activeIndex : 0;
          pickSearchCountry(currentMatches[pickIdx]);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeSearchDropdown();
        el.searchInput.blur();
      }
    });

    el.searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
        if (E.scene && typeof E.scene.syncViewportSize === 'function') E.scene.syncViewportSize(false);
      }, 80);
    }, { passive: true });

    if (el.searchClearBtn) {
      el.searchClearBtn.addEventListener('click', () => {
        el.searchInput.value = '';
        currentMatches = [];
        closeSearchDropdown();
        el.searchClearBtn.style.display = 'none';
        el.searchInput.focus();
      });
    }

    document.addEventListener('click', (e) => {
      if (e.target && typeof e.target.closest === 'function' && !e.target.closest('.search-container')) {
        closeSearchDropdown();
      }
    });
  }

  E.search = {
    initSearch
  };
})(window);

