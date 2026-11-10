// src/data/geo-index.js - Country Lookup, Microstate Catalog & 10-deg Spatial Hash Picking Index
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  function getCountryData(properties) {
    const db = E.state.languagesDb;
    if (!properties || !db) return null;
    return db[properties.iso_a3] || db[properties.name] || null;
  }

  function getFeatureKey(feature) {
    if (!feature) return '';
    const c = feature.__country;
    if (c) return c.iso3 || c.name;
    const p = feature.properties || {};
    return p.iso_a3 || p.name || '';
  }

  function getCountryKey(country) {
    if (!country) return '';
    return country.iso3 || country.name || '';
  }

  function resolveCountryDiversityGroup(country) {
    const groups = E.config.DIVERSITY_GROUPS || [];
    const tierName = (country && country.ldiTier) || '';
    if (tierName) {
      const hit = groups.find(g => g.name === tierName);
      if (hit) return hit;
    }
    const score = Number(country && country.diversityScore) || 15;
    return groups.find(g => score >= g.min) || groups[groups.length - 1] || { name: 'Low Diversity', color: '#4f618f' };
  }

  function resolveCountryFamilyGroup(country) {
    const groups = E.config.FAMILY_GROUPS;
    const raw = ((country && country.languageFamily) || '').trim();
    const lower = raw.toLowerCase();
    const pick = (groupName) => groups.find(g => g.name === groupName) || groups[groups.length - 1];

    if (lower.includes('slavic')) return pick('Indo-European (Slavic)');
    if (lower.includes('indo-iranian') || lower.includes('dravidian')) return pick('Indo-European (Indo-Iranian)');
    if (lower.startsWith('indo-european (germanic')) return pick('Indo-European (Germanic)');
    if (lower === 'indo-european / austronesian') return pick('Indo-European (Germanic)');
    if (lower.startsWith('indigenous american')) return pick('Indigenous, Creoles & Other');
    if (lower.includes('romance') || lower === 'indo-european / quechuan') return pick('Indo-European (Romance)');
    if (lower.includes('baltic') || lower.includes('hellenic') || lower === 'indo-european (other)') {
      return pick('Indo-European (Other)');
    }
    if (lower.startsWith('afroasiatic')) return pick('Afroasiatic');
    if (lower.startsWith('niger-congo')) return pick('Niger-Congo');
    if (lower.startsWith('austronesian')) return pick('Austronesian');
    if (lower.includes('sino-tibetan')) return pick('Sino-Tibetan');
    if (lower.includes('turkic')) return pick('Turkic');
    if (lower.includes('japonic') || lower.includes('koreanic')) return pick('Japonic & Koreanic');
    if (lower.includes('austroasiatic') || lower.includes('kra-dai')) return pick('Austroasiatic & Kra-Dai');
    if (lower.includes('uralic')) return pick('Uralic');
    if (lower.includes('mongolic')) return pick('Indigenous, Creoles & Other');
    return pick('Indigenous, Creoles & Other');
  }

  function resolveCountryScriptGroup(country) {
    const groups = E.config.SCRIPT_GROUPS;
    const pick = (groupName) => groups.find(g => g.name === groupName) || groups[0];
    const meta = (E.labelFormatter && typeof E.labelFormatter.resolveCountryScriptMeta === 'function')
      ? E.labelFormatter.resolveCountryScriptMeta(country || {})
      : { shortName: 'Latin' };
    const s = (meta.shortName || 'Latin').toLowerCase();

    if (s.startsWith('latin')) return pick('Latin');
    if (s.includes('arabic') || s.includes('perso')) return pick('Arabic & Perso-Arabic');
    if (s.startsWith('cyrillic')) return pick('Cyrillic');
    if (s.includes('hangul')) return pick('Hangul');
    if (s.includes('hanzi') || s.includes('kanji')) return pick('Hanzi & Kanji');
    if (s.includes('geʻez') || s.includes("ge'ez")) return pick('Geʻez (Ethiopic)');
    if (s.includes('thai') || s.includes('lao') || s.includes('khmer') || s.includes('burmese')) return pick('SE Asian Brahmic');
    if (s.includes('devanagari') || s.includes('bengali') || s.includes('sinhala') || s.includes('tibetan') || s.includes('thaana')) {
      return pick('Indic & Himalayan');
    }
    if (s.includes('greek') || s.includes('hebrew') || s.includes('armenian') || s.includes('georgian')) {
      return pick('Greek, Hebrew & Caucasus');
    }
    return pick('Latin');
  }

  function splitOutsideParens(str) {
    const parts = [];
    let cur = '';
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '(') depth++;
      else if (ch === ')' && depth > 0) depth--;
      if (depth === 0 && (ch === ',' || ch === '&' || ch === '/')) {
        if (cur.trim()) parts.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  }

  function matchSpokenAlias(segment) {
    const aliases = E.config.SPOKEN_TOKEN_ALIASES || [];
    for (let i = 0; i < aliases.length; i++) {
      if (aliases[i].pattern.test(segment)) {
        return aliases[i].token;
      }
    }
    return null;
  }

  function extractSpokenLanguageTokens(langEntry) {
    if (!langEntry || !langEntry.name) return [];
    const rawName = String(langEntry.name).trim();
    const tokens = [];
    const addToken = (t) => {
      if (t && !tokens.includes(t)) tokens.push(t);
    };

    const outerParts = splitOutsideParens(rawName);
    for (let i = 0; i < outerParts.length; i++) {
      const part = outerParts[i];
      const base = part.replace(/\([^)]*\)/g, '').trim();
      const matched = matchSpokenAlias(base);
      if (matched) {
        addToken(matched);
      } else if (base && !/^(indigenous|regional|other|local|minority|various|tribal)\b/i.test(base)) {
        addToken(base);
      }
      // Also check parenthetical lists (e.g. "Indigenous Languages (Guarani, Yanomami)") for multi-nation tongues
      const parenMatch = part.match(/\(([^)]+)\)/);
      if (parenMatch) {
        const innerParts = parenMatch[1].split(/[,&/]/);
        for (let j = 0; j < innerParts.length; j++) {
          const innerAlias = matchSpokenAlias(innerParts[j].trim());
          if (innerAlias) addToken(innerAlias);
        }
      }
    }
    if (tokens.length === 0) {
      addToken(rawName.replace(/\([^)]*\)/g, '').trim() || rawName);
    }
    return tokens;
  }

  function buildSpokenLanguageIndex() {
    const db = E.state.languagesDb;
    if (!db) return new Map();

    // Ensure unique countriesList is populated
    if (!E.state.countriesList || E.state.countriesList.length === 0) {
      const seen = new Set();
      E.state.countriesList = [];
      for (const key in db) {
        const c = db[key];
        if (c && c.name && !seen.has(c.name)) {
          seen.add(c.name);
          E.state.countriesList.push(c);
        }
      }
      E.state.countriesList.sort((a, b) => a.name.localeCompare(b.name));
    }

    const spokenIndex = new Map();
    const langColorMap = new Map((E.config.SHARED_LANGUAGES || []).map(l => [l.name.toLowerCase(), l.color]));

    const upsertCountryMeta = (c) => {
      if (!c) return;
      const famGrp = resolveCountryFamilyGroup(c);
      const scrGrp = resolveCountryScriptGroup(c);
      const divGrp = resolveCountryDiversityGroup(c);
      c.__familyGroup = famGrp.name;
      c.__familyColor = famGrp.color;
      c.__scriptGroup = scrGrp.name;
      c.__scriptColor = scrGrp.color;
      c.__diversityTier = divGrp.name;
      c.__diversityColor = divGrp.color;
    };

    for (let i = 0; i < E.state.countriesList.length; i++) {
      const c = E.state.countriesList[i];
      const key = getCountryKey(c);
      upsertCountryMeta(c);
      const cTokens = [];
      (c.languages || []).forEach(lang => {
        const toks = extractSpokenLanguageTokens(lang);
        lang.__tokens = toks;
        toks.forEach(tok => {
          if (!cTokens.includes(tok)) cTokens.push(tok);
          let rec = spokenIndex.get(tok);
          if (!rec) {
            rec = {
              token: tok,
              countries: new Set(),
              countryList: [],
              color: langColorMap.get(tok.toLowerCase()) || c.color || '#38bdf8'
            };
            spokenIndex.set(tok, rec);
          }
          if (!rec.countries.has(key)) {
            rec.countries.add(key);
            rec.countryList.push(c);
          }
        });
      });
      c.__spokenTokens = cTokens;
    }

    // Mirror metadata onto all alias keys in db (ISO3 and name)
    for (const k in db) {
      const c = db[k];
      if (!c) continue;
      upsertCountryMeta(c);
      if (!c.__spokenTokens && Array.isArray(c.languages)) {
        const seenT = [];
        c.languages.forEach(lang => {
          const toks = extractSpokenLanguageTokens(lang);
          lang.__tokens = toks;
          toks.forEach(t => { if (!seenT.includes(t)) seenT.push(t); });
        });
        c.__spokenTokens = seenT;
      }
    }

    E.state.spokenIndex = spokenIndex;
    return spokenIndex;
  }

  function getCountryColorForMode(country, colorByMode) {
    if (!country) return '#0284c7';
    if (colorByMode === 'family') {
      return country.__familyColor || resolveCountryFamilyGroup(country).color;
    }
    if (colorByMode === 'script') {
      return country.__scriptColor || resolveCountryScriptGroup(country).color;
    }
    if (colorByMode === 'diversity') {
      return country.__diversityColor || resolveCountryDiversityGroup(country).color;
    }
    return country.color || '#0284c7';
  }

  function getMicrostates() {
    const { MICROSTATE_ISOS } = E.config;
    const { hexToLinearRgb } = E.utils;
    const db = E.state.languagesDb;
    const list = [];
    if (!db) return list;

    for (const iso of MICROSTATE_ISOS) {
      const c = db[iso];
      if (c && c.centroid && (c.centroid[0] !== 0 || c.centroid[1] !== 0)) {
        const famColor = c.__familyColor || resolveCountryFamilyGroup(c).color;
        const scrColor = c.__scriptColor || resolveCountryScriptGroup(c).color;
        const divGrp = resolveCountryDiversityGroup(c);
        list.push({
          iso3: c.iso3,
          key: getCountryKey(c),
          name: c.name,
          flag: c.flag,
          lat: c.centroid[1],
          lng: c.centroid[0],
          lang: c.canonicalLanguage || c.primaryLanguage || '',
          family: c.languageFamily || '',
          familyGroup: c.__familyGroup || resolveCountryFamilyGroup(c).name,
          scriptGroup: c.__scriptGroup || resolveCountryScriptGroup(c).name,
          diversityTier: c.__diversityTier || divGrp.name,
          rgb: hexToLinearRgb(c.color),
          rgbLanguage: hexToLinearRgb(c.color),
          rgbFamily: hexToLinearRgb(famColor),
          rgbScript: hexToLinearRgb(scrColor),
          rgbDiversity: hexToLinearRgb(divGrp.color),
          country: c
        });
      }
    }
    return list;
  }

  function prepareFeatureMetadata() {
    buildSpokenLanguageIndex();
    const features = (E.state.geoData && E.state.geoData.features) || [];
    for (const f of features) {
      const country = getCountryData(f.properties);
      f.__country = country;
      f.__color = country ? country.color : '#0284c7';
      f.__lang = country ? (country.canonicalLanguage || country.primaryLanguage) : 'English';
      f.__family = country ? country.languageFamily : 'Indo-European (Germanic)';
      f.__familyGroup = country ? (country.__familyGroup || resolveCountryFamilyGroup(country).name) : 'Indo-European (Germanic)';
      f.__scriptGroup = country ? (country.__scriptGroup || resolveCountryScriptGroup(country).name) : 'Latin';
      f.__diversityTier = country ? (country.__diversityTier || resolveCountryDiversityGroup(country).name) : 'Low Diversity';
      f.__familyColor = country ? (country.__familyColor || '#0ea5e9') : '#0ea5e9';
      f.__scriptColor = country ? (country.__scriptColor || '#0ea5e9') : '#0ea5e9';
      f.__diversityColor = country ? (country.__diversityColor || '#4f618f') : '#4f618f';
      f.__key = getFeatureKey(f);
    }
  }

  function buildSpatialIndex() {
    prepareFeatureMetadata();
    const GRID_W = 36;
    const GRID_H = 18;
    const grid = Array.from({ length: GRID_W * GRID_H }, () => []);
    const features = (E.state.geoData && E.state.geoData.features) || [];

    for (const f of features) {
      const geom = f.geometry;
      if (!geom) continue;
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      for (const poly of polys) {
        if (!poly || !poly[0] || poly[0].length < 3) continue;
        const outer = poly[0];
        let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
        for (let i = 0; i < outer.length; i++) {
          const lng = outer[i][0];
          const lat = outer[i][1];
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
        const entry = {
          feature: f,
          outer,
          holes: poly.length > 1 ? poly.slice(1) : null,
          minLng, maxLng, minLat, maxLat
        };
        const gx0 = Math.max(0, Math.min(GRID_W - 1, Math.floor((minLng + 180) / 10)));
        const gx1 = Math.max(0, Math.min(GRID_W - 1, Math.floor((maxLng + 180) / 10)));
        const gy0 = Math.max(0, Math.min(GRID_H - 1, Math.floor((minLat + 90) / 10)));
        const gy1 = Math.max(0, Math.min(GRID_H - 1, Math.floor((maxLat + 90) / 10)));
        for (let gy = gy0; gy <= gy1; gy++) {
          const row = gy * GRID_W;
          for (let gx = gx0; gx <= gx1; gx++) {
            grid[row + gx].push(entry);
          }
        }
      }
    }
    E.renderBatch.spatialGrid = grid;
  }

  function pointInRing(px, py, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / ((yj - yi) || 1e-12) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  function lookupFeatureAtLatLng(lat, lng) {
    const grid = E.renderBatch.spatialGrid;
    if (!grid) return null;
    const gx = Math.max(0, Math.min(35, Math.floor((lng + 180) / 10)));
    const gy = Math.max(0, Math.min(17, Math.floor((lat + 90) / 10)));
    const candidates = grid[gy * 36 + gx];
    for (let i = 0; i < candidates.length; i++) {
      const poly = candidates[i];
      if (lng < poly.minLng || lng > poly.maxLng || lat < poly.minLat || lat > poly.maxLat) continue;
      if (!pointInRing(lng, lat, poly.outer)) continue;
      if (poly.holes) {
        let inHole = false;
        for (let h = 0; h < poly.holes.length; h++) {
          if (pointInRing(lng, lat, poly.holes[h])) {
            inHole = true;
            break;
          }
        }
        if (inHole) continue;
      }
      return poly.feature;
    }
    return null;
  }

  function computeCountryAreaWeights() {
    const weights = new Map();
    const features = E.state.geoData && E.state.geoData.features;
    if (!features) return weights;

    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      const key = f.__key || getFeatureKey(f);
      const geom = f.geometry;
      if (!key || !geom) continue;
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
      let total = 0;
      for (let p = 0; p < polys.length; p++) {
        const outer = polys[p] && polys[p][0];
        if (!outer || outer.length < 3) continue;
        let area = 0;
        let latSum = 0;
        for (let k = 0; k < outer.length; k++) {
          const cur = outer[k];
          const nxt = outer[(k + 1) % outer.length];
          let dx = nxt[0] - cur[0];
          if (dx > 180) dx -= 360;
          if (dx < -180) dx += 360;
          area += cur[0] * (nxt[1] - cur[1]) - cur[1] * dx;
          latSum += cur[1];
        }
        const avgLat = latSum / outer.length;
        const cosLat = Math.max(0.18, Math.cos((avgLat * Math.PI) / 180));
        total += Math.abs(area) * 0.5 * cosLat;
      }
      weights.set(key, (weights.get(key) || 0) + total);
    }
    return weights;
  }

  E.geo = {
    getCountryData,
    getFeatureKey,
    getCountryKey,
    resolveCountryFamilyGroup,
    resolveCountryScriptGroup,
    resolveCountryDiversityGroup,
    extractSpokenLanguageTokens,
    buildSpokenLanguageIndex,
    getCountryColorForMode,
    getMicrostates,
    prepareFeatureMetadata,
    buildSpatialIndex,
    pointInRing,
    lookupFeatureAtLatLng,
    computeCountryAreaWeights
  };
})(window);

