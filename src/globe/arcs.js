// src/globe/arcs.js - Animated Language Family Origin & Migration Arcs Explorer
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  function applyArcMeshProps() {
    const globe = E.state.globe;
    if (!globe || !E.state.showArcs) return;
    const scene = globe.scene();
    if (!scene) return;
    scene.traverse((obj) => {
      if (obj.__globeObjType === 'arc' && obj.__data && obj.__data._arcRole && obj.children && obj.children[0]) {
        const mesh = obj.children[0];
        const mat = mesh.material;
        const role = obj.__data._arcRole;
        if (!mat) return;
        const desiredSide = role === 'casing' ? 1 : 0; // BackSide ink outline vs FrontSide core
        const desiredOrder = role === 'casing' ? 5 : (role === 'rail' ? 6 : 7);
        if (mat.side !== desiredSide || mat.transparent !== false || mat.depthWrite !== true || mesh.renderOrder !== desiredOrder) {
          mat.side = desiredSide;
          mat.transparent = false;
          mat.depthWrite = true;
          mat.depthTest = true;
          mat.needsUpdate = true;
          mesh.renderOrder = desiredOrder;
          mesh.frustumCulled = false;
        }
      }
    });
  }

  function addAnimatedRoutePair(arcs, opts) {
    const { calcAngularDistRad, mixColorHex } = E.utils;
    const {
      from,
      to,
      originColor = '#f59e0b',
      destColor = '#38bdf8',
      wave = 1,
      index = 0,
      isPrimary = true,
      altScale
    } = opts || {};
    if (!from || !to || from.length < 2 || to.length < 2) return;
    const startLng = Number(from[0]);
    const startLat = Number(from[1]);
    const endLng = Number(to[0]);
    const endLat = Number(to[1]);
    if (!Number.isFinite(startLat) || !Number.isFinite(startLng) || !Number.isFinite(endLat) || !Number.isFinite(endLng)) {
      return;
    }
    let dLng = Math.abs(endLng - startLng);
    if (dLng > 180) dLng = 360 - dLng;
    if (Math.abs(endLat - startLat) + dLng < 0.25) return;

    const w = Math.max(1, wave || 1);
    const distRad = calcAngularDistRad(startLng, startLat, endLng, endLat);
    const stagger = (w - 1) * 0.02 + (index % 3) * 0.012;
    const baseApex = altScale != null
      ? Math.max(0.115, Math.min(0.56, distRad * 0.45 * altScale + 0.07))
      : Math.max(0.115, Math.min(0.56, distRad * 0.25 + 0.068 + stagger * 0.55));

    // 1. Dark BackSide ink casing separates arc silhouettes cleanly from land fills and overlaps
    arcs.push({
      _arcRole: 'casing',
      startLat,
      startLng,
      endLat,
      endLng,
      startAlt: 0.0085,
      endAlt: 0.0085,
      colors: ['#02050c', '#02050c'],
      stroke: isPrimary ? 1.32 : 0.96,
      arcAlt: baseApex,
      dashLength: 1,
      dashGap: 0,
      initialGap: 0,
      animateTime: 0
    });

    // 2. Crisp continuous inner guide rail keeping full trajectory legible inside dark framing
    const railOrigin = mixColorHex(originColor, '#0b1222', 0.22);
    const railDest = mixColorHex(destColor, '#0b1222', 0.16);
    arcs.push({
      _arcRole: 'rail',
      startLat,
      startLng,
      endLat,
      endLng,
      startAlt: 0.0085,
      endAlt: 0.0085,
      colors: [railOrigin, railDest],
      stroke: isPrimary ? 0.44 : 0.30,
      arcAlt: baseApex,
      dashLength: 1,
      dashGap: 0,
      initialGap: 0,
      animateTime: 0
    });

    // 3. Bolder luminous animated pulse flowing Homeland -> Destination inside dark casing
    const pulseOrigin = mixColorHex(originColor, '#ffffff', 0.26);
    const pulseDest = mixColorHex(destColor, '#ffffff', 0.28);
    arcs.push({
      _arcRole: 'pulse',
      startLat,
      startLng,
      endLat,
      endLng,
      startAlt: 0.0085,
      endAlt: 0.0085,
      colors: [pulseOrigin, pulseDest],
      stroke: isPrimary ? 0.88 : 0.62,
      arcAlt: baseApex,
      dashLength: isPrimary ? 0.38 : 0.30,
      dashGap: isPrimary ? 0.28 : 0.34,
      initialGap: ((w - 1) * 0.28 + (index % 5) * 0.16) % 0.95,
      animateTime: 1850 + (w - 1) * 280 + (index % 4) * 140
    });
  }

  function getLanguageOriginSeed(langName) {
    const ORIGINS = global.WORLD_ORIGINS;
    const HUBS = ORIGINS ? ORIGINS.HUBS : null;
    if (!HUBS || !langName) return null;
    const k = langName.toLowerCase();
    const map = {
      spanish: {
        hub: HUBS.IBERIA,
        chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.IBERIA],
        title: 'Spanish (Castilian) Lineage & Atlantic Spread',
        homeland: 'Pontic–Caspian Steppe → Rome → Iberian Peninsula',
        era: 'c. 4000 BCE (PIE) → 2nd c. BCE (Latin) → 1492+ CE',
        mechanism: 'Vulgar Latin in Roman Hispania followed by post-1492 maritime expansion across the Americas & Equatorial Guinea',
        note: 'Castilian Spanish preserves spoken Iberian Latin grammar alongside Basque, Celtic, and >4,000 Arabic loanwords before spreading across 20+ nations.'
      },
      english: {
        hub: HUBS.BRITAIN,
        chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER, HUBS.BRITAIN],
        title: 'English Lineage & Maritime Global Dispersal',
        homeland: 'Pontic Steppe → North Sea Coast → Great Britain',
        era: 'c. 4000 BCE (PIE) → 5th c. CE (Anglo-Saxon) → 1607+ CE',
        mechanism: 'Ingvaeonic West Germanic arrival in Britain, infused with Old Norse & Norman-French lexicon, then British maritime spread',
        note: 'Although over half of modern English vocabulary was borrowed from French and Latin, its core grammar and basic vocabulary remain West Germanic.'
      },
      french: {
        hub: HUBS.FRANCE,
        chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.FRANCE],
        title: 'French Lineage & Global Francophonie Diffusion',
        homeland: 'Pontic Steppe → Rome → Gaul (Northern France)',
        era: 'c. 4000 BCE (PIE) → 1st c. BCE (Gaulish Latin) → 17th–20th c. CE',
        mechanism: 'Roman Vulgar Latin adapted in Celtic Gaul (with Frankish Germanic phonology) → Atlantic, Quebec & African administrative spread',
        note: 'Across much of Francophone Africa, French serves as an administrative superstrate alongside older indigenous Niger-Congo or Afroasiatic families.'
      },
      arabic: {
        hub: HUBS.HEJAZ_ARABIA,
        chain: [HUBS.LEVANT_CORE, HUBS.HEJAZ_ARABIA],
        title: 'Arabic (Central Semitic) Origin & Diffusion',
        homeland: 'Levant Semitic Hearth → Arabian Peninsula → MENA',
        era: 'c. 3800 BCE (Proto-Semitic) → 7th–11th c. CE (Arabic Expansion)',
        mechanism: 'Central Semitic emergence in N. Arabia/Syria → 7th–11th c. CE Arab-Islamic & Banu Hilal expansions across Fertile Crescent & North Africa',
        note: 'Regional Arabic varieties preserve Coptic (Egypt), Aramaic (Levant/Iraq), Amazigh (Maghreb), and South Arabian substratal layers.'
      },
      portuguese: {
        hub: HUBS.PORTUGAL,
        chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME, HUBS.PORTUGAL],
        title: 'Portuguese Lineage & Oceanic Voyaging Arcs',
        homeland: 'Pontic Steppe → Rome → Galicia–Northern Portugal',
        era: 'c. 4000 BCE (PIE) → 9th c. CE (Galician-Portuguese) → 15th–16th c. CE',
        mechanism: 'Northwestern Iberian Romance propelled across South Atlantic & Indian Ocean maritime routes (Brazil, PALOP Africa, Timor-Leste)',
        note: 'Portuguese-lexifier creoles (Kabuverdianu, Forro) represent some of the oldest surviving Atlantic contact languages.'
      },
      russian: {
        hub: HUBS.MOSCOW_RUS,
        chain: [HUBS.PIE_STEPPE, HUBS.PRIPYAT_SLAV, HUBS.MOSCOW_RUS],
        title: 'Russian (East Slavic) Steppe-to-Eurasia Spread',
        homeland: 'Pontic Steppe → Pripyat–Dnieper Basin → Upper Volga',
        era: 'c. 4000 BCE (PIE) → 6th–9th c. CE (East Slavic) → 16th–20th c. CE',
        mechanism: 'Medieval Kyivan Rus\' & Muscovy expansion eastward across Uralic, Turkic, and Siberian language territories',
        note: 'East Slavic functions across northern Eurasia alongside indigenous Uralic, Caucasian, and Turkic families.'
      },
      german: {
        hub: HUBS.CENTRAL_EUR_GER,
        chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER],
        title: 'German (West Germanic) Continental Roots',
        homeland: 'Pontic Steppe → Elbe–Rhine Germanic Basin',
        era: 'c. 4000 BCE (PIE) → c. 500 BCE (Proto-Germanic) → 6th–16th c. CE',
        mechanism: 'High German consonant shift across Alps/Rhine and medieval Central European settlement',
        note: 'Spans Standard High German alongside Low German, Austro-Bavarian, and Alemannic Swiss varieties.'
      },
      dutch: {
        hub: HUBS.CENTRAL_EUR_GER,
        chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER],
        title: 'Dutch (Low Franconian Germanic) Maritime Arcs',
        homeland: 'Pontic Steppe → Lower Rhine–Meuse–Scheldt Delta',
        era: 'c. 4000 BCE (PIE) → Medieval Low Franconian → 17th c. CE Maritime',
        mechanism: 'Low Franconian Germanic carried along 17th-c. Dutch maritime routes to Suriname, Caribbean ABC islands, & Southern Africa (Afrikaans)',
        note: 'Afrikaans diverged in Southern Africa from 17th-century Dutch through Khoisan, Bantu, and Malay contact.'
      },
      italian: {
        hub: HUBS.ITALY_ROME,
        chain: [HUBS.PIE_STEPPE, HUBS.ITALY_ROME],
        title: 'Italian (Italo-Romance) Continental Lineage',
        homeland: 'Pontic Steppe → Central Italian Peninsula (Latium / Tuscany)',
        era: 'c. 4000 BCE (PIE) → c. 1200 BCE (Italic) → 14th c. CE (Tuscan)',
        mechanism: 'Continuous in-situ evolution from Roman Vulgar Latin with Florentine literary standardization',
        note: 'Shared across Italy, San Marino, Vatican City, and southern Switzerland alongside Gallo-Italic & Neapolitan regional languages.'
      },
      swedish: {
        hub: HUBS.SCANDINAVIA,
        chain: [HUBS.PIE_STEPPE, HUBS.CENTRAL_EUR_GER, HUBS.SCANDINAVIA],
        title: 'Swedish (East Norse North Germanic) Roots',
        homeland: 'Pontic Steppe → North European Plain → Southern Scandinavia',
        era: 'c. 4000 BCE (PIE) → c. 800 CE (Old East Norse)',
        mechanism: 'Nordic Bronze Age continuity & medieval Baltic settlement in Åland & coastal Finland',
        note: 'Closely related to Danish and Norwegian within the North Germanic continuum descending from Old Norse.'
      },
      turkish: {
        hub: HUBS.ANATOLIA_TURK,
        chain: [HUBS.ALTAI_ORKHON, HUBS.TIANSHAN_CA, HUBS.AZERBAIJAN_OGHUZ, HUBS.ANATOLIA_TURK],
        title: 'Turkish (Oghuz Turkic) Eurasian Corridor',
        homeland: 'Eastern Eurasian Steppe (Altai–Orkhon) → Central Asia → Anatolia',
        era: 'c. 500 BCE (Proto-Turkic) → 11th c. CE (Seljuk Entry)',
        mechanism: 'Nomadic Oghuz Seljuk movement from Transoxiana across Iran into Anatolia & Cyprus',
        note: 'Turkic is an independent primary family unrelated genetically to Arabic or Persian, and not part of a proven "Altaic" macro-family.'
      },
      mandarin: {
        hub: HUBS.NORTH_CHINA,
        chain: [HUBS.YELLOW_RIVER, HUBS.NORTH_CHINA],
        title: 'Mandarin (Sino-Tibetan Sinitic) Dispersal',
        homeland: 'Middle–Upper Yellow River Basin → North China Plain → South & Overseas',
        era: 'c. 4500 BCE (Sino-Tibetan) → 1st Mil. BCE–Present',
        mechanism: 'Yellow River millet agriculture & Qin–Han state spread; northern Koine standardization & maritime diaspora',
        note: 'Sino-Tibetan unites Sinitic (Mandarin, Yue, Min, Wu) with ~400 Tibeto-Burman languages across the Himalayas & Myanmar.'
      },
      hindi: {
        hub: HUBS.PUNJAB_INDIA,
        chain: [HUBS.PIE_STEPPE, HUBS.CA_STEPPE, HUBS.PUNJAB_INDIA],
        title: 'Hindi-Urdu (Indo-Aryan) & South Asian Convergence',
        homeland: 'Pontic Steppe → Central Asia → Punjab & Gangetic Plain',
        era: 'c. 4000 BCE (PIE) → c. 1500 BCE (Vedic Sanskrit) → Modern',
        mechanism: 'Indo-Aryan arrival converging structurally with indigenous Dravidian and Munda families across India',
        note: 'Hindi and Urdu share Khariboli spoken grammar while drawing learned registers from Sanskrit vs Perso-Arabic.'
      },
      swahili: {
        hub: HUBS.SWAHILI_COAST,
        chain: [HUBS.CAMEROON_BANTU, HUBS.GREAT_LAKES, HUBS.SWAHILI_COAST],
        title: 'Swahili (Sabaki Bantu) Indian Ocean Lingua Franca',
        homeland: 'Cameroon–Nigeria Borderlands → Great Lakes → East African Coast',
        era: 'c. 3000 BCE (Bantu) → 8th–10th c. CE (Coastal Swahili)',
        mechanism: 'Eastern Bantu migration meeting Indian Ocean monsoon maritime trade (Arabic/Persian contact)',
        note: 'Retains full Bantu noun-class syntax while incorporating rich maritime Arabic/Persian trade lexicon.'
      },
      persian: {
        hub: HUBS.IRAN_PLATEAU,
        chain: [HUBS.PIE_STEPPE, HUBS.CA_STEPPE, HUBS.IRAN_PLATEAU],
        title: 'Persian (Iranian Indo-European) Migration & Silk Road',
        homeland: 'Pontic Steppe → Central Asian Steppe → Iranian Plateau',
        era: 'c. 4000 BCE (PIE) → c. 1000–550 BCE (Old Persian)',
        mechanism: 'Indo-Iranian Sintashta/Andronovo movement south into the Iranian Plateau, Persia, Khorasan & Central Asia',
        note: 'Modern Persian (Iran), Dari (Afghanistan), and Tajik (Tajikistan) remain mutually intelligible varieties of one Western Iranian continuum.'
      },
      japanese: {
        hub: HUBS.TOKYO_JPN,
        chain: [HUBS.MANCHURIA_KOR, HUBS.KOREA_PEN, HUBS.KYUSHU_JPN],
        title: 'Japonic Independent Family: Yayoi Maritime Entry',
        homeland: 'Korean Peninsula / Kyushu Corridor (Independent Japonic Family)',
        era: 'c. 1000–300 BCE (Yayoi Agricultural Entry)',
        mechanism: 'Wet-rice Yayoi arrival across Korea Strait interacting with older Jōmon populations; no genetic link to Sinitic',
        note: 'Japanese & Ryukyuan form an independent primary family despite historic borrowing of Chinese characters and learned vocabulary.'
      },
      korean: {
        hub: HUBS.KOREA_PEN,
        chain: [HUBS.MANCHURIA_KOR, HUBS.KOREA_PEN],
        title: 'Koreanic Independent Family: Manchuria–Peninsula Hearth',
        homeland: 'Southern Manchuria (Liaodong) & Korean Peninsula',
        era: 'c. 1500–300 BCE (Bronze-Age Samhan)',
        mechanism: 'Independent primary Koreanic family consolidated under Silla unification (~668 CE)',
        note: 'Koreanic is unrelated genetically to Chinese or Japanese; grammatical parallels across NE Asia stem from millennia of areal contact.'
      },
      greek: {
        hub: HUBS.BALKANS,
        chain: [HUBS.PIE_STEPPE, HUBS.BALKANS],
        title: 'Greek (Hellenic Indo-European): 3,400+ Year Record',
        homeland: 'Pontic–Caspian Steppe → Northern Balkans → Aegean Basin',
        era: 'c. 4000 BCE (PIE) → c. 2200–1450 BCE (Linear B Mycenaean)',
        mechanism: 'Early Bronze-Age Indo-European arrival in the Aegean, maritime settlements across Cyprus & Mediterranean',
        note: 'Hellenic preserves an autonomous Indo-European branch continuously attested in writing since ~1450 BCE.'
      },
      vietnamese: {
        hub: HUBS.RED_RIVER_VNM,
        chain: [HUBS.RED_RIVER_VNM],
        title: 'Vietnamese (Austroasiatic): Red River Valley Roots',
        homeland: 'Red River Delta & Annamite Cordillera (Proto-Vietic / Austroasiatic)',
        era: 'c. 2500–1500 BCE (Austroasiatic) → 1st Mil. CE',
        mechanism: 'Indigenous Austroasiatic riverine rice civilization with deep Sino-Vietnamese literary contact',
        note: 'Crucially, Vietnamese is Austroasiatic—closer genetically to Khmer than to Chinese—despite areal tones and Han-Viet vocabulary.'
      },
      thai: {
        hub: HUBS.CHAO_PHRAYA,
        chain: [HUBS.GUANGXI_KRA, [102.6, 18.0], HUBS.CHAO_PHRAYA],
        title: 'Thai (Kra-Dai / Tai-Kadai) Southern China Migration',
        homeland: 'Lingnan (Guangxi–Guizhou) → Laos → Chao Phraya Basin',
        era: 'c. 1st Mil. BCE (Lingnan) → 10th–13th c. CE (Sukhothai / Chao Phraya)',
        mechanism: 'Southwestern Tai riverine migration out of southern China into Mainland SE Asia over earlier Mon-Khmer lands',
        note: 'Thai belongs to Kra-Dai (unrelated genetically to Sinitic or Austroasiatic Khmer/Vietnamese despite shared typological traits).'
      }
    };
    return map[k] || null;
  }

  function flyToCorridorCamera(cam) {
    const globe = E.state.globe;
    if (!globe || !cam) return;
    E.state.pendingZoomAlt = null;
    const controls = globe.controls();
    if (controls) controls.autoRotate = false;
    const scale = Math.max(1, E.utils.getDefaultAltitude() / 2.5);
    const alt = Math.min(5.0, (cam.altitude || 2.5) * (E.utils.isMobileViewport() ? Math.min(1.55, scale) : 1));
    globe.pointOfView({ lat: cam.lat, lng: cam.lng, altitude: alt }, E.config.GLOBE_CONFIG.CORRIDOR_FLY_MS);
    if (E.state.isRotating && controls) {
      setTimeout(() => {
        if (E.state.isRotating) controls.autoRotate = true;
      }, 700);
    }
  }

  function frameCountryOriginCamera(country, origin) {
    const globe = E.state.globe;
    if (!globe || !country || !country.centroid) return;
    const controls = globe.controls();
    if (controls) controls.autoRotate = false;
    const [destLng, destLat] = country.centroid;
    let targetLng = destLng;
    let targetLat = destLat;
    let alt = Math.max(E.utils.getSelectAltitude(), E.utils.isMobileViewport() ? 2.65 : 2.35);

    const chain = (origin && origin.chain) || [];
    if (chain.length > 0) {
      const refPt = chain[0];
      let dLng = refPt[0] - destLng;
      if (dLng > 180) dLng -= 360;
      if (dLng < -180) dLng += 360;
      const dLat = refPt[1] - destLat;
      const span = Math.hypot(dLng * Math.cos((destLat * Math.PI) / 180), dLat);
      targetLng = destLng + dLng * 0.34;
      if (targetLng > 180) targetLng -= 360;
      if (targetLng < -180) targetLng += 360;
      targetLat = destLat + dLat * 0.34;
      alt = Math.max(E.utils.getSelectAltitude() + 0.35, Math.min(3.5, (E.utils.isMobileViewport() ? 2.35 : 1.95) + span / 62));
    }

    if (E.utils.isBottomSheetLayout()) {
      targetLat = Math.max(-72, Math.min(72, targetLat - 16));
    } else {
      targetLat = Math.max(-72, Math.min(72, targetLat));
    }

    globe.pointOfView({ lat: targetLat, lng: targetLng, altitude: alt }, E.config.GLOBE_CONFIG.CORRIDOR_FLY_MS);
  }

  function syncDrawerOriginButton() {
    const animBtn = document.getElementById('animateCountryOriginBtn');
    if (!animBtn) return;
    const isActive = Boolean(E.state.showArcs && E.state.selectedCountry && E.state.activeOriginCorridor === 'country');
    animBtn.classList.toggle('active', isActive);
    const labelSpan = animBtn.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent = isActive ? 'Animating Origin Arcs (Click to Hide)' : 'Animate Origin Arcs on Globe';
    }
  }

  function renderArcsInfoPanel(mode, payload) {
    const el = E.elements;
    const { escapeHtml } = E.utils;
    const panel = el.arcsInfoPanel;
    if (!panel) return;
    if (!E.state.showArcs) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      E.overlays.refreshOverlayHudRects();
      return;
    }

    panel.classList.add('open');
    panel.classList.toggle('collapsed', E.state.isArcsPanelCollapsed);
    panel.setAttribute('aria-hidden', 'false');
    if (el.arcsToggleCollapseBtn) {
      el.arcsToggleCollapseBtn.setAttribute('aria-expanded', E.state.isArcsPanelCollapsed ? 'false' : 'true');
    }

    const ORIGINS = global.WORLD_ORIGINS;
    const corridors = (ORIGINS && ORIGINS.corridors) || {};
    const chips = [];
    if (E.state.selectedCountry) {
      chips.push({
        id: 'country',
        label: `${E.state.selectedCountry.flag || ''} ${E.state.selectedCountry.name}`.trim(),
        color: E.state.selectedCountry.color || '#38bdf8'
      });
    }
    if (E.state.activeFilterLanguage) {
      chips.push({
        id: 'filter',
        label: `Filter: ${E.state.activeFilterLanguage}`,
        color: E.state.activeFilterColor || '#38bdf8'
      });
    }
    const order = ['all', 'indo-european', 'austronesian', 'bantu', 'afroasiatic', 'turkic', 'sino-tibetan', 'uralic', 'se-asia', 'americas'];
    for (const id of order) {
      const cor = corridors[id];
      if (cor) chips.push({ id, label: cor.shortLabel || cor.title, color: cor.color || '#38bdf8' });
    }

    if (el.arcCorridorChips) {
      el.arcCorridorChips.innerHTML = chips.map(ch => `
        <button type="button" class="arc-corridor-chip ${ch.id === E.state.activeOriginCorridor ? 'active' : ''}" data-corridor="${escapeHtml(ch.id)}" role="tab" aria-selected="${ch.id === E.state.activeOriginCorridor ? 'true' : 'false'}">
          <span class="legend-dot" style="background:${ch.color};"></span>
          <span>${escapeHtml(ch.label)}</span>
        </button>
      `).join('');

      el.arcCorridorChips.querySelectorAll('.arc-corridor-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const cid = btn.getAttribute('data-corridor');
          if (!cid) return;
          E.state.activeOriginCorridor = cid;
          E.state.isArcsPanelCollapsed = false;
          updateArcs();
          const cor = corridors[cid];
          if (cor && cor.camera) {
            flyToCorridorCamera(cor.camera);
          } else if (cid === 'country' && E.state.selectedCountry && ORIGINS) {
            frameCountryOriginCamera(E.state.selectedCountry, ORIGINS.resolveCountryOrigin(E.state.selectedCountry));
          }
          syncDrawerOriginButton();
          if (E.router && typeof E.router.syncUrlHash === 'function') {
            E.router.syncUrlHash();
          }
        });
      });
    }

    const accentColor = (payload && payload.color) || '#f59e0b';
    if (el.arcsLiveDot) {
      el.arcsLiveDot.style.background = accentColor;
      el.arcsLiveDot.style.boxShadow = `0 0 8px ${accentColor}`;
    }
    if (el.arcsPanelTitle) {
      el.arcsPanelTitle.textContent = mode === 'filter'
        ? `Origin & Diffusion • ${E.state.activeFilterLanguage}`
        : mode === 'country' && E.state.selectedCountry
          ? `Origin • ${E.state.selectedCountry.name}`
          : 'Family Origin & Migration';
    }

    if (!el.arcsInfoBody || !payload) {
      E.overlays.refreshOverlayHudRects();
      return;
    }

    const stagesHtml = (payload.stages && payload.stages.length > 0)
      ? `<div class="origin-stages-list">
          ${payload.stages.map(st => `
            <div class="origin-stage-item">
              <span class="origin-stage-era">${escapeHtml(st.era)}</span>
              <span>${escapeHtml(st.label)}</span>
            </div>
          `).join('')}
        </div>`
      : '';

    el.arcsInfoBody.innerHTML = `
      <div class="arcs-route-title">${escapeHtml(payload.title || 'Language Origin & Migration')}</div>
      <div class="arcs-meta-grid">
        <div class="arcs-meta-pill">
          <span class="arcs-meta-label">Primary Homeland (Urheimat)</span>
          ${escapeHtml(payload.homeland || '')}
        </div>
        <div class="arcs-meta-pill">
          <span class="arcs-meta-label">Chronology &amp; Branches</span>
          <div><strong style="color:#f8fafc;">${escapeHtml(payload.timeframe || payload.era || '')}</strong></div>
          ${payload.branches ? `<div style="margin-top:3px;">${escapeHtml(payload.branches)}</div>` : ''}
        </div>
        <div class="arcs-meta-pill">
          <span class="arcs-meta-label">Historical Dispersal Driver</span>
          ${escapeHtml(payload.mechanism || payload.driver || '')}
        </div>
      </div>
      ${payload.summary ? `<p class="arcs-summary-text">${escapeHtml(payload.summary)}</p>` : ''}
      ${stagesHtml}
      ${payload.scholarshipNote ? `
        <div class="arcs-note-box">
          <strong style="color:#f8fafc;">Scholarly Evidence:</strong> ${escapeHtml(payload.scholarshipNote)}
        </div>
      ` : ''}
      <div class="arcs-legend-strip">
        <span class="arcs-flow-sample">
          <span class="arcs-flow-bar" style="background:linear-gradient(90deg, #f59e0b, ${accentColor});"></span>
          <span>Pulse: Homeland → Destination</span>
        </span>
        <span>${payload.routeCount || 0} animated route${payload.routeCount === 1 ? '' : 's'}</span>
      </div>
    `;
    E.overlays.refreshOverlayHudRects();
  }

  function updateArcs() {
    const globe = E.state.globe;
    if (!globe) return;
    const ORIGINS = global.WORLD_ORIGINS;
    if (!E.state.showArcs) {
      globe.arcsData([]);
      globe.ringsData([]);
      renderArcsInfoPanel('hidden', null);
      return;
    }

    const arcs = [];
    const rings = [];
    let panelMode = 'corridor';
    let panelPayload = null;

    if (E.state.activeOriginCorridor === 'country' && E.state.selectedCountry && ORIGINS) {
      const src = E.state.selectedCountry;
      const origin = ORIGINS.resolveCountryOrigin(src);
      const dest = src.centroid;
      const chain = (origin && origin.chain) ? [...origin.chain] : [];

      if (chain.length > 0 && dest) {
        const lastPt = chain[chain.length - 1];
        let dLng = Math.abs(dest[0] - lastPt[0]);
        if (dLng > 180) dLng = 360 - dLng;
        if (Math.abs(dest[1] - lastPt[1]) + dLng >= 0.45) {
          chain.push(dest);
        }
        rings.push({ lat: chain[0][1], lng: chain[0][0], color: '#f59e0b', radius: 6.0 });
        for (let i = 0; i < chain.length - 1; i++) {
          addAnimatedRoutePair(arcs, {
            from: chain[i],
            to: chain[i + 1],
            originColor: i === 0 ? '#f59e0b' : (origin.color || src.color || '#38bdf8'),
            destColor: origin.color || src.color || '#38bdf8',
            wave: i + 1,
            index: i,
            isPrimary: true
          });
        }
      } else if (dest) {
        rings.push({ lat: dest[1], lng: dest[0], color: (origin && origin.color) || src.color || '#f59e0b', radius: 5.5 });
      }

      if (origin && origin.secondaryRoutes && dest) {
        origin.secondaryRoutes.forEach((sr, idx) => {
          addAnimatedRoutePair(arcs, {
            from: sr.from,
            to: sr.to || dest,
            originColor: sr.color || '#c084fc',
            destColor: src.color || '#38bdf8',
            wave: 2,
            index: idx + 1,
            isPrimary: true,
            altScale: 0.28
          });
          rings.push({ lat: sr.from[1], lng: sr.from[0], color: sr.color || '#c084fc', radius: 4.0 });
        });
      }

      if (dest && E.config.ARC_EXPORTERS.has((src.iso3 || '').toUpperCase())) {
        const canon = (src.canonicalLanguage || src.primaryLanguage || '').toLowerCase();
        let addedOut = 0;
        for (const c of E.state.countriesList) {
          if (!c || !c.centroid || c.iso3 === src.iso3) continue;
          const cCanon = (c.canonicalLanguage || c.primaryLanguage || '').toLowerCase();
          if (canon && cCanon === canon) {
            addAnimatedRoutePair(arcs, {
              from: dest,
              to: c.centroid,
              originColor: src.color || '#38bdf8',
              destColor: c.color || src.color || '#38bdf8',
              wave: 3,
              index: addedOut,
              isPrimary: false,
              altScale: 0.31 + (addedOut % 3) * 0.025
            });
            addedOut++;
            if (addedOut >= 10) break;
          }
        }
      }

      panelMode = 'country';
      panelPayload = {
        title: (origin && origin.title) || `${src.name} Linguistic Lineage`,
        homeland: origin && origin.homeland,
        era: origin && origin.era,
        driver: origin && origin.driver,
        summary: origin && origin.notes,
        stages: origin && origin.stages,
        scholarshipNote: `Pulses trace chronological migration hops into ${src.name}. Click any family tab above to compare global corridors.`,
        color: (origin && origin.color) || src.color || '#38bdf8',
        routeCount: arcs.filter(a => a._arcRole === 'pulse').length
      };
    } else if (E.state.activeOriginCorridor === 'filter' && E.state.activeFilterLanguage) {
      const lang = E.state.activeFilterLanguage;
      const langLower = lang.toLowerCase();
      const matching = E.state.countriesList.filter(
        c => c.centroid && (c.canonicalLanguage || c.primaryLanguage || '').toLowerCase() === langLower
      );
      const seed = getLanguageOriginSeed(lang);
      const filterColor = E.state.activeFilterColor || (matching[0] && matching[0].color) || '#38bdf8';

      if (seed && seed.chain && seed.chain.length > 0) {
        rings.push({ lat: seed.chain[0][1], lng: seed.chain[0][0], color: '#f59e0b', radius: 6.0 });
        for (let i = 0; i < seed.chain.length - 1; i++) {
          addAnimatedRoutePair(arcs, {
            from: seed.chain[i],
            to: seed.chain[i + 1],
            originColor: i === 0 ? '#f59e0b' : filterColor,
            destColor: filterColor,
            wave: i + 1,
            index: i,
            isPrimary: true
          });
        }
        const hubPt = seed.hub || seed.chain[seed.chain.length - 1];
        if (matching.length === 1 && matching[0].centroid) {
          addAnimatedRoutePair(arcs, {
            from: seed.chain[seed.chain.length - 1],
            to: matching[0].centroid,
            originColor: filterColor,
            destColor: filterColor,
            wave: seed.chain.length,
            index: 0,
            isPrimary: true
          });
        } else {
          let count = 0;
          for (let i = 0; i < matching.length && count < 18; i++) {
            const m = matching[i];
            if (!m.centroid) continue;
            addAnimatedRoutePair(arcs, {
              from: hubPt,
              to: m.centroid,
              originColor: filterColor,
              destColor: m.color || filterColor,
              wave: Math.min(3, seed.chain.length),
              index: count,
              isPrimary: false,
              altScale: 0.30 + (count % 4) * 0.025
            });
            count++;
          }
        }
      }

      panelMode = 'filter';
      panelPayload = {
        title: (seed && seed.title) || `${lang} Origin & Shared Distribution`,
        homeland: (seed && seed.homeland) || 'Historical Diffusion Network',
        era: (seed && seed.era) || 'Prehistoric Urheimat → Modern Distribution',
        branches: `Primary in ${matching.length} mapped countr${matching.length === 1 ? 'y' : 'ies'}`,
        mechanism: (seed && seed.mechanism) || 'Historical linguistic convergence & maritime/continental dispersal',
        scholarshipNote: (seed && seed.note) || `Tracing historical spread of ${lang}.`,
        color: filterColor,
        routeCount: arcs.filter(a => a._arcRole === 'pulse').length
      };
    } else if (ORIGINS && ORIGINS.corridors) {
      const cid = ORIGINS.corridors[E.state.activeOriginCorridor] ? E.state.activeOriginCorridor : 'all';
      E.state.activeOriginCorridor = cid;
      const corridor = ORIGINS.corridors[cid];

      if (corridor.nodes) {
        corridor.nodes.forEach(n => {
          if (n && n.pt) {
            rings.push({ lat: n.pt[1], lng: n.pt[0], color: n.color || corridor.color, radius: n.radius || 5 });
          }
        });
      }
      if (corridor.routes) {
        corridor.routes.forEach((rt, idx) => {
          addAnimatedRoutePair(arcs, {
            from: rt.from,
            to: rt.to,
            originColor: rt.originColor || corridor.accentColor || '#f59e0b',
            destColor: rt.color || corridor.color || '#38bdf8',
            wave: rt.wave || 1,
            index: idx,
            isPrimary: true
          });
        });
      }

      panelMode = 'corridor';
      panelPayload = {
        ...corridor,
        routeCount: (corridor.routes && corridor.routes.length) || arcs.filter(a => a._arcRole === 'pulse').length
      };
    }

    globe.arcsData(arcs);
    globe.ringsData(rings);
    requestAnimationFrame(() => {
      applyArcMeshProps();
      requestAnimationFrame(applyArcMeshProps);
    });
    renderArcsInfoPanel(panelMode, panelPayload);
  }

  E.arcs = {
    applyArcMeshProps,
    addAnimatedRoutePair,
    getLanguageOriginSeed,
    flyToCorridorCamera,
    frameCountryOriginCamera,
    syncDrawerOriginButton,
    renderArcsInfoPanel,
    updateArcs
  };
})(window);

