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

  function getMicrostates() {
    const { MICROSTATE_ISOS } = E.config;
    const { hexToLinearRgb } = E.utils;
    const db = E.state.languagesDb;
    const list = [];
    if (!db) return list;

    for (const iso of MICROSTATE_ISOS) {
      const c = db[iso];
      if (c && c.centroid && (c.centroid[0] !== 0 || c.centroid[1] !== 0)) {
        list.push({
          iso3: c.iso3,
          key: getCountryKey(c),
          name: c.name,
          flag: c.flag,
          lat: c.centroid[1],
          lng: c.centroid[0],
          lang: c.canonicalLanguage || c.primaryLanguage || '',
          family: c.languageFamily || '',
          rgb: hexToLinearRgb(c.color),
          country: c
        });
      }
    }
    return list;
  }

  function prepareFeatureMetadata() {
    const features = (E.state.geoData && E.state.geoData.features) || [];
    for (const f of features) {
      const country = getCountryData(f.properties);
      f.__country = country;
      f.__color = country ? country.color : '#0284c7';
      f.__lang = country ? (country.canonicalLanguage || country.primaryLanguage) : 'English';
      f.__family = country ? country.languageFamily : 'Indo-European';
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
    getMicrostates,
    prepareFeatureMetadata,
    buildSpatialIndex,
    pointInRing,
    lookupFeatureAtLatLng,
    computeCountryAreaWeights
  };
})(window);

