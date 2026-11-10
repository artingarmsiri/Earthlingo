// src/globe/polygon-batcher.js - High-FPS Merged Country WebGL Meshes, Subdivision & Analytic Ray-Picking
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  let pickRayVec = null;

  function pickTargetAtScreen(clientX, clientY, isTouch = false) {
    const globe = E.state.globe;
    const rb = E.renderBatch;
    if (!globe || !E.elements.globeViz) return null;
    const camera = globe.camera();
    if (!camera) return null;
    if (!pickRayVec) pickRayVec = camera.position.clone();

    const w = rb.viewportW || 1;
    const h = rb.viewportH || 1;
    const ndcX = ((clientX - rb.viewportLeft) / w) * 2 - 1;
    const ndcY = -((clientY - rb.viewportTop) / h) * 2 + 1;
    camera.updateMatrixWorld();
    pickRayVec.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();

    const ox = camera.position.x, oy = camera.position.y, oz = camera.position.z;
    const dx = pickRayVec.x, dy = pickRayVec.y, dz = pickRayVec.z;
    const b = ox * dx + oy * dy + oz * dz;
    const R = 100.25;
    const c = ox * ox + oy * oy + oz * oz - R * R;
    const disc = b * b - c;
    if (disc < 0) return null;
    const t = -b - Math.sqrt(disc);
    if (t < 0) return null;

    const hx = ox + dx * t;
    const hy = oy + dy * t;
    const hz = oz + dz * t;
    const { lat, lng } = globe.toGeoCoords({ x: hx, y: hy, z: hz });

    // Check active 3D globe pins (Endangered Hotspots & Word-Route Stops) when not in Quiz
    const povAlt = Math.max(0.1, (Math.hypot(ox, oy, oz) - 100) / 100);
    if (!E.state.isQuizActive && E.pins && typeof E.pins.pickPinAtLatLng === 'function') {
      const pinHit = E.pins.pickPinAtLatLng(lat, lng, povAlt, isTouch);
      if (pinHit) return pinHit;
    }

    // Check microstate locator pins next (zoom-adaptive & touch-friendly precision)
    const touchBoost = isTouch ? 1.35 : 1.0;
    const pinThreshDeg = Math.max(0.42, Math.min(2.2, 0.85 * Math.sqrt(povAlt) * 0.68 * touchBoost));
    const cosLat = Math.max(0.15, Math.cos(lat * Math.PI / 180));
    let bestPin = null;
    let bestDistSq = pinThreshDeg * pinThreshDeg;
    const microstates = rb.microstates;
    for (let i = 0; i < microstates.length; i++) {
      const m = microstates[i];
      const dLat = lat - m.lat;
      const dLng = (lng - m.lng) * cosLat;
      const dSq = dLat * dLat + dLng * dLng;
      if (dSq <= bestDistSq) {
        bestDistSq = dSq;
        bestPin = m;
      }
    }
    if (bestPin) return bestPin.country;

    const feat = E.geo.lookupFeatureAtLatLng(lat, lng);
    return feat ? (feat.__country || E.geo.getCountryData(feat.properties) || { name: feat.properties.name }) : null;
  }

  function waitForPolygonsAndMerge() {
    const globe = E.state.globe;
    const scene = globe ? globe.scene() : null;
    if (!scene) {
      requestAnimationFrame(waitForPolygonsAndMerge);
      return;
    }

    const polygonGroups = [];
    scene.traverse(obj => {
      if (obj.__globeObjType === 'polygon' && obj.children && obj.children.length >= 2) {
        const mesh = obj.children[0];
        if (mesh && mesh.geometry && mesh.geometry.attributes && mesh.geometry.attributes.position) {
          polygonGroups.push(obj);
        }
      }
    });

    const featuresLen = (E.state.geoData && E.state.geoData.features && E.state.geoData.features.length) || 0;
    if (polygonGroups.length < featuresLen) {
      requestAnimationFrame(waitForPolygonsAndMerge);
      return;
    }

    mergeWorldPolygons(polygonGroups, scene);
    E.bathymetry.configureGlobeSurface();
    E.overlays.buildOverlayAnchors();
    E.overlays.refreshOverlayHudRects();
    E.overlays.markOverlaysDirty(false);
    if (globe && globe.camera()) {
      E.overlays.updateCountryOverlays(globe.camera(), true);
    }
    E.utils.dismissLoadingOverlay();
  }

  function mergeWorldPolygons(polygonGroups, scene) {
    const { GLOBE_CONFIG } = E.config;
    const { hexToLinearRgb } = E.utils;
    const { getFeatureKey } = E.geo;
    const rb = E.renderBatch;
    const globe = E.state.globe;

    const sampleGrp = polygonGroups[0];
    const sampleMesh = sampleGrp.children[0];
    const sampleLine = sampleGrp.children[1];
    const MeshCtor = sampleMesh.constructor;
    const LineCtor = sampleLine.constructor;
    const BufferGeoCtor = Object.getPrototypeOf(Object.getPrototypeOf(sampleMesh.geometry)).constructor;
    const BufferAttrCtor = Object.getPrototypeOf(Object.getPrototypeOf(sampleMesh.geometry.attributes.position)).constructor;
    const sampleCapMat = Array.isArray(sampleMesh.material) ? (sampleMesh.material[0] || sampleMesh.material[1]) : sampleMesh.material;
    const sampleLineMat = sampleLine.material;
    const parentGroup = sampleGrp.parent;

    const R_GLOBE = GLOBE_CONFIG.R_GLOBE;
    const CAP_SCALE = GLOBE_CONFIG.CAP_SCALE;
    const LINE_SCALE = GLOBE_CONFIG.LINE_SCALE;
    const R_CAP = R_GLOBE * CAP_SCALE;
    const R_LINE = R_GLOBE * LINE_SCALE;
    const MAX_SEG_DEG = GLOBE_CONFIG.MAX_SEG_DEG;
    const MAX_CAP_CHORD_SQ = Math.pow(2 * R_CAP * Math.sin((MAX_SEG_DEG * Math.PI / 180) * 0.5), 2);
    const MAX_LINE_CHORD_SQ = Math.pow(2 * R_LINE * Math.sin((MAX_SEG_DEG * Math.PI / 180) * 0.5), 2);

    const byKey = new Map();
    for (let gIdx = 0; gIdx < polygonGroups.length; gIdx++) {
      const grp = polygonGroups[gIdx];
      const f = grp.__data.data;
      const key = f.__key || getFeatureKey(f);
      let list = byKey.get(key);
      if (!list) {
        list = [];
        byKey.set(key, list);
      }
      list.push(grp);
    }

    const capVertChunks = [];
    const capIdxChunks = [];
    const lineVertChunks = [];
    const lineIdxChunks = [];

    let curV = 0, curI = 0, curLV = 0, curLI = 0;
    let maxV = 1, maxI = 1, maxLV = 1, maxLI = 1;

    const projectToRadius = (verts, idx3, radius) => {
      const x = verts[idx3], y = verts[idx3 + 1], z = verts[idx3 + 2];
      const len = Math.hypot(x, y, z);
      if (len > 1e-8) {
        const s = radius / len;
        verts[idx3] = x * s;
        verts[idx3 + 1] = y * s;
        verts[idx3 + 2] = z * s;
      }
    };

    const ensureOutwardTri = (verts, tri) => {
      const i0 = tri[0] * 3, i1 = tri[1] * 3, i2 = tri[2] * 3;
      const x0 = verts[i0], y0 = verts[i0 + 1], z0 = verts[i0 + 2];
      const ax = verts[i1] - x0, ay = verts[i1 + 1] - y0, az = verts[i1 + 2] - z0;
      const bx = verts[i2] - x0, by = verts[i2 + 1] - y0, bz = verts[i2 + 2] - z0;
      const cx = ay * bz - az * by;
      const cy = az * bx - ax * bz;
      const cz = ax * by - ay * bx;
      if (cx * x0 + cy * y0 + cz * z0 < 0) {
        const tmp = tri[1];
        tri[1] = tri[2];
        tri[2] = tmp;
      }
    };

    for (const [key, grpList] of byKey.entries()) {
      const f = grpList[0].__data.data;
      const vStart = curV;
      const iStart = curI;
      const lvStart = curLV;
      const liStart = curLI;

      const sVerts = [];
      let sTris = [];
      const sLineVerts = [];
      const sLineIdx = [];

      for (let g = 0; g < grpList.length; g++) {
        const grp = grpList[g];
        const mGeo = grp.children[0].geometry;
        const mPos = mGeo.attributes.position.array;
        const vCount = mGeo.attributes.position.count;
        const baseV = sVerts.length / 3;
        for (let k = 0; k < vCount; k++) {
          const p = k * 3;
          const vx = mPos[p] * CAP_SCALE;
          const vy = mPos[p + 1] * CAP_SCALE;
          const vz = mPos[p + 2] * CAP_SCALE;
          const len = Math.hypot(vx, vy, vz);
          if (len > 1e-8) {
            const s = R_CAP / len;
            sVerts.push(vx * s, vy * s, vz * s);
          } else {
            sVerts.push(vx, vy, vz);
          }
        }
        if (mGeo.index) {
          const mIdx = mGeo.index.array;
          const mIdxCount = mGeo.index.count;
          for (let k = 0; k + 2 < mIdxCount; k += 3) {
            const tri = [baseV + mIdx[k], baseV + mIdx[k + 1], baseV + mIdx[k + 2]];
            ensureOutwardTri(sVerts, tri);
            sTris.push(tri);
          }
        } else {
          for (let k = 0; k + 2 < vCount; k += 3) {
            const tri = [baseV + k, baseV + k + 1, baseV + k + 2];
            ensureOutwardTri(sVerts, tri);
            sTris.push(tri);
          }
        }

        const lGeo = grp.children[1] ? grp.children[1].geometry : null;
        if (lGeo && lGeo.attributes.position && lGeo.index && lGeo.index.count > 0) {
          const lPos = lGeo.attributes.position.array;
          const lvCount = lGeo.attributes.position.count;
          const baseLV = sLineVerts.length / 3;
          for (let k = 0; k < lvCount; k++) {
            const p = k * 3;
            const lx = lPos[p] * LINE_SCALE;
            const ly = lPos[p + 1] * LINE_SCALE;
            const lz = lPos[p + 2] * LINE_SCALE;
            const len = Math.hypot(lx, ly, lz);
            if (len > 1e-8) {
              const s = R_LINE / len;
              sLineVerts.push(lx * s, ly * s, lz * s);
            } else {
              sLineVerts.push(lx, ly, lz);
            }
          }
          const lIdx = lGeo.index.array;
          const lIdxCount = lGeo.index.count;
          const appendLineSeg = (ia, ib, depth) => {
            const ax = sLineVerts[ia * 3], ay = sLineVerts[ia * 3 + 1], az = sLineVerts[ia * 3 + 2];
            const bx = sLineVerts[ib * 3], by = sLineVerts[ib * 3 + 1], bz = sLineVerts[ib * 3 + 2];
            const dx = bx - ax, dy = by - ay, dz = bz - az;
            if (depth < 4 && (dx * dx + dy * dy + dz * dz) > MAX_LINE_CHORD_SQ) {
              const im = sLineVerts.length / 3;
              sLineVerts.push((ax + bx) * 0.5, (ay + by) * 0.5, (az + bz) * 0.5);
              projectToRadius(sLineVerts, im * 3, R_LINE);
              appendLineSeg(ia, im, depth + 1);
              appendLineSeg(im, ib, depth + 1);
            } else {
              sLineIdx.push(ia, ib);
            }
          };
          for (let k = 0; k + 1 < lIdxCount; k += 2) {
            appendLineSeg(baseLV + lIdx[k], baseLV + lIdx[k + 1], 0);
          }
        }
      }

      // Conforming crack-free spherical edge-midpoint subdivision for large triangles (fixes Greenland/Somalia chord sagitta)
      for (let pass = 0; pass < 4; pass++) {
        let splitCount = 0;
        const splitEdgeMap = new Map();
        const getEdgeKey = (ia, ib) => {
          const ax = Math.round(sVerts[ia * 3] * 1e4);
          const ay = Math.round(sVerts[ia * 3 + 1] * 1e4);
          const az = Math.round(sVerts[ia * 3 + 2] * 1e4);
          const bx = Math.round(sVerts[ib * 3] * 1e4);
          const by = Math.round(sVerts[ib * 3 + 1] * 1e4);
          const bz = Math.round(sVerts[ib * 3 + 2] * 1e4);
          const k0 = `${ax},${ay},${az}`;
          const k1 = `${bx},${by},${bz}`;
          return k0 < k1 ? `${k0}|${k1}` : `${k1}|${k0}`;
        };
        const getOrSplit = (ia, ib) => {
          const dx = sVerts[ia * 3] - sVerts[ib * 3];
          const dy = sVerts[ia * 3 + 1] - sVerts[ib * 3 + 1];
          const dz = sVerts[ia * 3 + 2] - sVerts[ib * 3 + 2];
          if (dx * dx + dy * dy + dz * dz <= MAX_CAP_CHORD_SQ) return -1;
          const ek = getEdgeKey(ia, ib);
          const cached = splitEdgeMap.get(ek);
          if (cached !== undefined) return cached;
          const im = sVerts.length / 3;
          sVerts.push(
            (sVerts[ia * 3] + sVerts[ib * 3]) * 0.5,
            (sVerts[ia * 3 + 1] + sVerts[ib * 3 + 1]) * 0.5,
            (sVerts[ia * 3 + 2] + sVerts[ib * 3 + 2]) * 0.5
          );
          projectToRadius(sVerts, im * 3, R_CAP);
          splitEdgeMap.set(ek, im);
          return im;
        };

        const nextTris = [];
        for (let t = 0; t < sTris.length; t++) {
          const tri = sTris[t];
          const a = tri[0], b = tri[1], c = tri[2];
          const mab = getOrSplit(a, b);
          const mbc = getOrSplit(b, c);
          const mca = getOrSplit(c, a);
          const cnt = (mab >= 0 ? 1 : 0) + (mbc >= 0 ? 1 : 0) + (mca >= 0 ? 1 : 0);
          if (cnt === 0) {
            nextTris.push(tri);
            continue;
          }
          splitCount++;
          if (cnt === 3) {
            const sub = [[a, mab, mca], [mab, b, mbc], [mca, mbc, c], [mab, mbc, mca]];
            for (let k = 0; k < 4; k++) { ensureOutwardTri(sVerts, sub[k]); nextTris.push(sub[k]); }
          } else if (cnt === 1) {
            const sub = mab >= 0
              ? [[a, mab, c], [mab, b, c]]
              : (mbc >= 0 ? [[b, mbc, a], [mbc, c, a]] : [[c, mca, b], [mca, a, b]]);
            for (let k = 0; k < 2; k++) { ensureOutwardTri(sVerts, sub[k]); nextTris.push(sub[k]); }
          } else {
            let p0 = a, p1 = b, p2 = c, m01 = mab, m20 = mca;
            if (mab < 0) { p0 = c; p1 = a; p2 = b; m01 = mca; m20 = mbc; }
            else if (mca < 0) { p0 = b; p1 = c; p2 = a; m01 = mbc; m20 = mab; }
            const t0 = [p0, m01, m20];
            const d1x = sVerts[m01 * 3] - sVerts[p2 * 3], d1y = sVerts[m01 * 3 + 1] - sVerts[p2 * 3 + 1], d1z = sVerts[m01 * 3 + 2] - sVerts[p2 * 3 + 2];
            const d2x = sVerts[p1 * 3] - sVerts[m20 * 3], d2y = sVerts[p1 * 3 + 1] - sVerts[m20 * 3 + 1], d2z = sVerts[p1 * 3 + 2] - sVerts[m20 * 3 + 2];
            const q = (d1x * d1x + d1y * d1y + d1z * d1z <= d2x * d2x + d2y * d2y + d2z * d2z)
              ? [[m01, p1, p2], [m01, p2, m20]]
              : [[m01, p1, m20], [p1, p2, m20]];
            ensureOutwardTri(sVerts, t0);
            ensureOutwardTri(sVerts, q[0]);
            ensureOutwardTri(sVerts, q[1]);
            nextTris.push(t0, q[0], q[1]);
          }
        }
        sTris = nextTris;
        if (splitCount === 0) break;
      }

      const sliceVCount = sVerts.length / 3;
      const sliceICount = sTris.length * 3;
      const flatSliceIdx = new Uint32Array(sliceICount);
      for (let t = 0; t < sTris.length; t++) {
        const tri = sTris[t];
        const o = t * 3;
        flatSliceIdx[o] = curV + tri[0];
        flatSliceIdx[o + 1] = curV + tri[1];
        flatSliceIdx[o + 2] = curV + tri[2];
      }
      capVertChunks.push(sVerts);
      capIdxChunks.push(flatSliceIdx);
      curV += sliceVCount;
      curI += sliceICount;

      const sliceLVCount = sLineVerts.length / 3;
      const sliceLICount = sLineIdx.length;
      if (sliceLICount > 0) {
        const flatLineIdx = new Uint32Array(sliceLICount);
        for (let k = 0; k < sliceLICount; k++) flatLineIdx[k] = curLV + sLineIdx[k];
        lineVertChunks.push(sLineVerts);
        lineIdxChunks.push(flatLineIdx);
        curLV += sliceLVCount;
        curLI += sliceLICount;
      }

      const slice = {
        key,
        feature: f,
        country: f.__country,
        lang: f.__lang,
        family: f.__family,
        familyGroup: f.__familyGroup,
        scriptGroup: f.__scriptGroup,
        diversityTier: f.__diversityTier || 'Low Diversity',
        rgb: hexToLinearRgb(f.__color),
        rgbLanguage: hexToLinearRgb(f.__color),
        rgbFamily: hexToLinearRgb(f.__familyColor || f.__color),
        rgbScript: hexToLinearRgb(f.__scriptColor || f.__color),
        rgbDiversity: hexToLinearRgb(f.__diversityColor || '#4f618f'),
        vStart,
        vCount: sliceVCount,
        iStart,
        iCount: sliceICount,
        lvStart,
        lvCount: sliceLVCount,
        liStart,
        liCount: sliceLICount
      };
      if (slice.vCount > maxV) maxV = slice.vCount;
      if (slice.iCount > maxI) maxI = slice.iCount;
      if (slice.lvCount > maxLV) maxLV = slice.lvCount;
      if (slice.liCount > maxLI) maxLI = slice.liCount;

      rb.countrySlices.push(slice);
      rb.sliceByKey.set(key, slice);
    }

    const capPositions = new Float32Array(curV * 3);
    const capColors = new Float32Array(curV * 3);
    const capIndices = new Uint32Array(curI);
    let pWrite = 0;
    for (let c = 0; c < capVertChunks.length; c++) {
      const ch = capVertChunks[c];
      capPositions.set(ch, pWrite);
      pWrite += ch.length;
    }
    let iWrite = 0;
    for (let c = 0; c < capIdxChunks.length; c++) {
      const ch = capIdxChunks[c];
      capIndices.set(ch, iWrite);
      iWrite += ch.length;
    }

    const linePositions = new Float32Array(curLV * 3);
    const lineIndices = new Uint32Array(curLI);
    let lpWrite = 0;
    for (let c = 0; c < lineVertChunks.length; c++) {
      const ch = lineVertChunks[c];
      linePositions.set(ch, lpWrite);
      lpWrite += ch.length;
    }
    let liWrite = 0;
    for (let c = 0; c < lineIdxChunks.length; c++) {
      const ch = lineIdxChunks[c];
      lineIndices.set(ch, liWrite);
      liWrite += ch.length;
    }

    const frontOrBack = 0;

    for (let i = 0; i < polygonGroups.length; i++) {
      const grp = polygonGroups[i];
      if (parentGroup) parentGroup.remove(grp);
      if (grp.children[0] && grp.children[0].geometry) grp.children[0].geometry.dispose();
      if (grp.children[1] && grp.children[1].geometry) grp.children[1].geometry.dispose();
    }

    const mergedCapGeo = new BufferGeoCtor();
    mergedCapGeo.setAttribute('position', new BufferAttrCtor(capPositions, 3));
    mergedCapGeo.setAttribute('color', new BufferAttrCtor(capColors, 3));
    mergedCapGeo.setIndex(new BufferAttrCtor(capIndices, 1));
    mergedCapGeo.computeBoundingSphere();

    const mergedCapMat = sampleCapMat.clone();
    mergedCapMat.color.setHex(0xffffff);
    mergedCapMat.vertexColors = true;
    mergedCapMat.side = frontOrBack;
    mergedCapMat.transparent = false;
    mergedCapMat.opacity = 1;
    mergedCapMat.depthWrite = true;

    const mergedCapMesh = new MeshCtor(mergedCapGeo, mergedCapMat);
    mergedCapMesh.raycast = () => {};
    mergedCapMesh.frustumCulled = false;
    mergedCapMesh.onAfterRender = (_renderer, _scene, camera) => {
      E.overlays.updateCountryOverlays(camera, false);
    };

    const mergedLineGeo = new BufferGeoCtor();
    mergedLineGeo.setAttribute('position', new BufferAttrCtor(linePositions, 3));
    mergedLineGeo.setIndex(new BufferAttrCtor(lineIndices, 1));
    mergedLineGeo.computeBoundingSphere();

    const mergedLineMat = sampleLineMat.clone();
    mergedLineMat.color.setHex(0x030712);
    mergedLineMat.transparent = true;
    mergedLineMat.opacity = 0.42;
    mergedLineMat.depthTest = true;
    mergedLineMat.depthWrite = false;
    mergedLineMat.polygonOffset = true;
    mergedLineMat.polygonOffsetFactor = -1.5;
    mergedLineMat.polygonOffsetUnits = -3.0;

    const mergedLineMesh = new LineCtor(mergedLineGeo, mergedLineMat);
    mergedLineMesh.raycast = () => {};
    mergedLineMesh.renderOrder = 2;
    mergedLineMesh.frustumCulled = false;

    const highlightPosArr = new Float32Array(maxV * 3);
    const highlightIdxArr = new Uint32Array(maxI);
    const highlightGeo = new BufferGeoCtor();
    highlightGeo.setAttribute('position', new BufferAttrCtor(highlightPosArr, 3));
    highlightGeo.setIndex(new BufferAttrCtor(highlightIdxArr, 1));
    highlightGeo.setDrawRange(0, 0);

    const highlightMat = sampleCapMat.clone();
    highlightMat.color.setHex(0xffffff);
    highlightMat.vertexColors = false;
    highlightMat.side = frontOrBack;
    highlightMat.transparent = false;
    highlightMat.opacity = 1;

    const highlightMesh = new MeshCtor(highlightGeo, highlightMat);
    highlightMesh.raycast = () => {};
    highlightMesh.frustumCulled = false;
    highlightMesh.scale.setScalar(1.0022);
    highlightMesh.visible = false;

    const highlightLPosArr = new Float32Array(maxLV * 3);
    const highlightLIdxArr = new Uint32Array(maxLI);
    const highlightLGeo = new BufferGeoCtor();
    highlightLGeo.setAttribute('position', new BufferAttrCtor(highlightLPosArr, 3));
    highlightLGeo.setIndex(new BufferAttrCtor(highlightLIdxArr, 1));
    highlightLGeo.setDrawRange(0, 0);

    const highlightLMat = sampleLineMat.clone();
    highlightLMat.color.setHex(0xffffff);
    highlightLMat.transparent = true;
    highlightLMat.opacity = 0.92;
    highlightLMat.depthWrite = false;
    highlightLMat.polygonOffset = true;
    highlightLMat.polygonOffsetFactor = -2.0;
    highlightLMat.polygonOffsetUnits = -4.0;

    const highlightLine = new LineCtor(highlightLGeo, highlightLMat);
    highlightLine.raycast = () => {};
    highlightLine.frustumCulled = false;
    highlightLine.renderOrder = 3;
    highlightLine.scale.setScalar(1.0025);
    highlightLine.visible = false;

    // Native 3D Starfield inside opaque WebGL scene
    const starCount = 260;
    const starPos = new Float32Array(starCount * 18);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const radius = 1500 + Math.random() * 450;
      const sx = radius * Math.sin(phi) * Math.cos(theta);
      const sy = radius * Math.cos(phi);
      const sz = radius * Math.sin(phi) * Math.sin(theta);
      const szHalf = 2.0 + Math.random() * 2.2;
      const o = i * 18;
      starPos[o] = sx - szHalf; starPos[o + 1] = sy; starPos[o + 2] = sz;
      starPos[o + 3] = sx + szHalf; starPos[o + 4] = sy; starPos[o + 5] = sz;
      starPos[o + 6] = sx; starPos[o + 7] = sy - szHalf; starPos[o + 8] = sz;
      starPos[o + 9] = sx; starPos[o + 10] = sy + szHalf; starPos[o + 11] = sz;
      starPos[o + 12] = sx; starPos[o + 13] = sy; starPos[o + 14] = sz - szHalf;
      starPos[o + 15] = sx; starPos[o + 16] = sy; starPos[o + 17] = sz + szHalf;
    }
    const starGeo = new BufferGeoCtor();
    starGeo.setAttribute('position', new BufferAttrCtor(starPos, 3));
    starGeo.computeBoundingSphere();
    const starMat = sampleLineMat.clone();
    starMat.color.setHex(0x94a3b8);
    starMat.transparent = true;
    starMat.opacity = 0.65;
    starMat.depthWrite = false;
    const starMesh = new LineCtor(starGeo, starMat);
    starMesh.raycast = () => {};
    starMesh.frustumCulled = false;
    scene.add(starMesh);

    // Single-Draw-Call Flush Surface Locator Badges for Small Nations
    const microstates = rb.microstates || [];
    const M_SEGS = 20;
    const vertsPerPin = 1 + M_SEGS * 5;
    const trisPerPin = M_SEGS * 5;
    const microPos = new Float32Array(Math.max(1, microstates.length * vertsPerPin) * 3);
    const microCols = new Float32Array(Math.max(1, microstates.length * vertsPerPin) * 3);
    const microIdx = new Uint32Array(Math.max(1, microstates.length * trisPerPin * 3));
    const microEntries = [];
    rb.microByKey.clear();

    const r1 = 0.30, r2 = 0.39, r3 = 0.49;
    let mV = 0, mI = 0;

    for (let i = 0; i < microstates.length; i++) {
      const m = microstates[i];
      const posObj = globe.getCoords(m.lat, m.lng, 0.0036);
      const px = posObj.x, py = posObj.y, pz = posObj.z;
      const pLen = Math.hypot(px, py, pz) || 100.36;
      const nx = px / pLen, ny = py / pLen, nz = pz / pLen;

      let tx = nz, ty = 0, tz = -nx;
      const tLen = Math.hypot(tx, tz) || 1;
      tx /= tLen; tz /= tLen;
      const bx = ny * tz - nz * ty;
      const by = nz * tx - nx * tz;
      const bz = nx * ty - ny * tx;

      const vStart = mV;
      microPos[mV * 3] = px; microPos[mV * 3 + 1] = py; microPos[mV * 3 + 2] = pz;
      mV++;

      const baseCenter = vStart;
      const baseDiscRim = vStart + 1;
      const baseCollarIn = vStart + 1 + M_SEGS;
      const baseCollarOut = vStart + 1 + M_SEGS * 2;
      const baseRimIn = vStart + 1 + M_SEGS * 3;
      const baseRimOut = vStart + 1 + M_SEGS * 4;

      const writeVert = (idx, rad, cs, sn) => {
        const dx = (tx * cs + bx * sn) * rad;
        const dy = (ty * cs + by * sn) * rad;
        const dz = (tz * cs + bz * sn) * rad;
        const o = idx * 3;
        microPos[o] = px + dx; microPos[o + 1] = py + dy; microPos[o + 2] = pz + dz;
      };

      for (let s = 0; s < M_SEGS; s++) {
        const th = (s / M_SEGS) * Math.PI * 2;
        const cs = Math.cos(th), sn = Math.sin(th);
        writeVert(baseDiscRim + s, r1, cs, sn);
        writeVert(baseCollarIn + s, r1, cs, sn);
        writeVert(baseCollarOut + s, r2, cs, sn);
        writeVert(baseRimIn + s, r2, cs, sn);
        writeVert(baseRimOut + s, r3, cs, sn);
      }

      for (let s = 0; s < M_SEGS; s++) {
        const sNext = (s + 1) % M_SEGS;
        microIdx[mI++] = baseCenter;
        microIdx[mI++] = baseDiscRim + s;
        microIdx[mI++] = baseDiscRim + sNext;

        microIdx[mI++] = baseCollarIn + s;
        microIdx[mI++] = baseCollarOut + s;
        microIdx[mI++] = baseCollarOut + sNext;
        microIdx[mI++] = baseCollarIn + s;
        microIdx[mI++] = baseCollarOut + sNext;
        microIdx[mI++] = baseCollarIn + sNext;

        microIdx[mI++] = baseRimIn + s;
        microIdx[mI++] = baseRimOut + s;
        microIdx[mI++] = baseRimOut + sNext;
        microIdx[mI++] = baseRimIn + s;
        microIdx[mI++] = baseRimOut + sNext;
        microIdx[mI++] = baseRimIn + sNext;
      }

      mV += M_SEGS * 5;

      const makeRim = (cRgb) => [
        cRgb[0] * 0.55 + 0.45,
        cRgb[1] * 0.55 + 0.45,
        cRgb[2] * 0.55 + 0.45
      ];
      const entry = {
        key: m.key,
        country: m.country,
        lang: m.lang,
        family: m.family,
        familyGroup: m.familyGroup,
        scriptGroup: m.scriptGroup,
        diversityTier: m.diversityTier || 'Low Diversity',
        rgb: m.rgb,
        rgbLanguage: m.rgbLanguage || m.rgb,
        rgbFamily: m.rgbFamily || m.rgb,
        rgbScript: m.rgbScript || m.rgb,
        rgbDiversity: m.rgbDiversity || m.rgb,
        rimRgb: makeRim(m.rgb),
        rimRgbLanguage: makeRim(m.rgbLanguage || m.rgb),
        rimRgbFamily: makeRim(m.rgbFamily || m.rgb),
        rimRgbScript: makeRim(m.rgbScript || m.rgb),
        rimRgbDiversity: makeRim(m.rgbDiversity || m.rgb),
        px, py, pz,
        nx, ny, nz,
        tx, ty, tz,
        bx, by, bz,
        vStart,
        segs: M_SEGS
      };
      microEntries.push(entry);
      rb.microByKey.set(m.key, entry);
    }

    const microGeo = new BufferGeoCtor();
    microGeo.setAttribute('position', new BufferAttrCtor(microPos, 3));
    microGeo.setAttribute('color', new BufferAttrCtor(microCols, 3));
    microGeo.setIndex(new BufferAttrCtor(microIdx, 1));
    microGeo.computeBoundingSphere();

    const microMat = sampleCapMat.clone();
    microMat.color.setHex(0xffffff);
    microMat.vertexColors = true;
    microMat.side = 0;
    microMat.transparent = false;
    microMat.opacity = 1;
    microMat.depthWrite = true;
    microMat.polygonOffset = true;
    microMat.polygonOffsetFactor = -2.0;
    microMat.polygonOffsetUnits = -4.0;

    const microMesh = new MeshCtor(microGeo, microMat);
    microMesh.raycast = () => {};
    microMesh.frustumCulled = false;
    microMesh.renderOrder = 3;

    const H_SEGS = 28;
    const hMicroPos = new Float32Array(H_SEGS * 2 * 3);
    const hMicroIdx = new Uint32Array(H_SEGS * 6);
    for (let s = 0; s < H_SEGS; s++) {
      const sNext = (s + 1) % H_SEGS;
      const b0 = s * 2, b1 = sNext * 2;
      hMicroIdx[s * 6] = b0;
      hMicroIdx[s * 6 + 1] = b0 + 1;
      hMicroIdx[s * 6 + 2] = b1 + 1;
      hMicroIdx[s * 6 + 3] = b0;
      hMicroIdx[s * 6 + 4] = b1 + 1;
      hMicroIdx[s * 6 + 5] = b1;
    }
    const hMicroGeo = new BufferGeoCtor();
    hMicroGeo.setAttribute('position', new BufferAttrCtor(hMicroPos, 3));
    hMicroGeo.setIndex(new BufferAttrCtor(hMicroIdx, 1));
    const hMicroMat = sampleCapMat.clone();
    hMicroMat.color.setHex(0xffffff);
    hMicroMat.vertexColors = false;
    hMicroMat.side = 0;
    hMicroMat.transparent = false;
    hMicroMat.opacity = 1;
    hMicroMat.polygonOffset = true;
    hMicroMat.polygonOffsetFactor = -3.0;
    hMicroMat.polygonOffsetUnits = -6.0;

    const highlightMicroMesh = new MeshCtor(hMicroGeo, hMicroMat);
    highlightMicroMesh.raycast = () => {};
    highlightMicroMesh.frustumCulled = false;
    highlightMicroMesh.renderOrder = 4;
    highlightMicroMesh.visible = false;

    const targetContainer = parentGroup || scene;
    targetContainer.add(mergedCapMesh);
    targetContainer.add(mergedLineMesh);
    targetContainer.add(highlightMesh);
    targetContainer.add(highlightLine);
    targetContainer.add(microMesh);
    targetContainer.add(highlightMicroMesh);
    if (E.pins && typeof E.pins.initPins === 'function') {
      E.pins.initPins(targetContainer, BufferGeoCtor, BufferAttrCtor, MeshCtor, sampleCapMat);
    }

    rb.capMesh = mergedCapMesh;
    rb.lineMesh = mergedLineMesh;
    rb.highlightMesh = highlightMesh;
    rb.highlightLine = highlightLine;
    rb.microMesh = microMesh;
    rb.microColors = microCols;
    rb.microEntries = microEntries;
    rb.highlightMicroMesh = highlightMicroMesh;
    rb.highlightMicroPosArr = hMicroPos;
    rb.capPositions = capPositions;
    rb.capColors = capColors;
    rb.capIndices = capIndices;
    rb.linePositions = linePositions;
    rb.lineIndices = lineIndices;
    rb.highlightPosArr = highlightPosArr;
    rb.highlightIdxArr = highlightIdxArr;
    rb.highlightLPosArr = highlightLPosArr;
    rb.highlightLIdxArr = highlightLIdxArr;
    rb.merged = true;

    refreshPolygonVisuals();
  }

  function refreshPolygonVisuals() {
    const rb = E.renderBatch;
    if (!rb.merged) return;

    const { srgbToLinear, hexToLinearRgb } = E.utils;
    const { getCountryKey } = E.geo;
    const dimR = srgbToLinear(17 / 255);
    const dimG = srgbToLinear(26 / 255);
    const dimB = srgbToLinear(46 / 255);
    const collarR = srgbToLinear(9 / 255);
    const collarG = srgbToLinear(13 / 255);
    const collarB = srgbToLinear(22 / 255);
    const dimRimR = srgbToLinear(30 / 255);
    const dimRimG = srgbToLinear(41 / 255);
    const dimRimB = srgbToLinear(59 / 255);

    const eraId = E.state.activeTimeEra || 'today';
    const isHistorical = eraId !== 'today' && global.WORLD_HISTORICAL_ERAS;
    const eraRgbCache = isHistorical ? new Map() : null;
    const getEraRgb = (hex) => {
      let arr = eraRgbCache.get(hex);
      if (!arr) {
        arr = hexToLinearRgb(hex);
        eraRgbCache.set(hex, arr);
      }
      return arr;
    };

    const colorBy = E.state.colorByMode || 'language';
    const activeSpokenSet = E.state.activeFilterSpokenCountries;
    const activeLang = E.state.activeFilterLanguage;
    const activeFam = E.state.activeFilterFamily;
    const activeScr = E.state.activeFilterScript;
    const activeDiv = E.state.activeFilterDiversityTier;
    const hasSpoken = Boolean(activeSpokenSet && activeSpokenSet.size > 0);
    const colors = rb.capColors;
    const slices = rb.countrySlices;

    for (let i = 0; i < slices.length; i++) {
      const s = slices[i];
      let modeRgb;
      if (isHistorical) {
        const eraInfo = global.WORLD_HISTORICAL_ERAS.getCountryEraState(s.country, eraId);
        modeRgb = eraInfo && eraInfo.color ? getEraRgb(eraInfo.color) : s.rgbLanguage;
      } else if (colorBy === 'family') {
        modeRgb = s.rgbFamily;
      } else if (colorBy === 'script') {
        modeRgb = s.rgbScript;
      } else if (colorBy === 'diversity') {
        modeRgb = s.rgbDiversity;
      } else {
        modeRgb = s.rgbLanguage;
      }
      let match = true;
      if (hasSpoken) {
        match = activeSpokenSet.has(s.key);
      } else if (activeLang) {
        match = (s.lang === activeLang);
      } else if (activeFam) {
        match = (s.familyGroup === activeFam || s.family === activeFam);
      } else if (activeScr) {
        match = (s.scriptGroup === activeScr);
      } else if (activeDiv) {
        match = (s.diversityTier === activeDiv);
      }

      const r = match ? modeRgb[0] : dimR;
      const g = match ? modeRgb[1] : dimG;
      const b = match ? modeRgb[2] : dimB;

      const end = (s.vStart + s.vCount) * 3;
      for (let k = s.vStart * 3; k < end; k += 3) {
        colors[k] = r;
        colors[k + 1] = g;
        colors[k + 2] = b;
      }
    }
    rb.capMesh.geometry.attributes.color.needsUpdate = true;

    if (rb.microMesh && rb.microColors) {
      const mCols = rb.microColors;
      const mList = rb.microEntries;
      for (let i = 0; i < mList.length; i++) {
        const m = mList[i];
        let modeRgb;
        let modeRim;
        if (isHistorical) {
          const eraInfo = global.WORLD_HISTORICAL_ERAS.getCountryEraState(m.country, eraId);
          modeRgb = eraInfo && eraInfo.color ? getEraRgb(eraInfo.color) : m.rgbLanguage;
          modeRim = [modeRgb[0] * 0.55 + 0.45, modeRgb[1] * 0.55 + 0.45, modeRgb[2] * 0.55 + 0.45];
        } else if (colorBy === 'family') {
          modeRgb = m.rgbFamily;
          modeRim = m.rimRgbFamily;
        } else if (colorBy === 'script') {
          modeRgb = m.rgbScript;
          modeRim = m.rimRgbScript;
        } else if (colorBy === 'diversity') {
          modeRgb = m.rgbDiversity;
          modeRim = m.rimRgbDiversity;
        } else {
          modeRgb = m.rgbLanguage;
          modeRim = m.rimRgbLanguage;
        }
        let match = true;
        if (hasSpoken) match = activeSpokenSet.has(m.key);
        else if (activeLang) match = (m.lang === activeLang);
        else if (activeFam) match = (m.familyGroup === activeFam || m.family === activeFam);
        else if (activeScr) match = (m.scriptGroup === activeScr);
        else if (activeDiv) match = (m.diversityTier === activeDiv);

        const dot = match ? modeRgb : [dimR, dimG, dimB];
        const col = match ? [collarR, collarG, collarB] : [dimR, dimG, dimB];
        const rim = match ? modeRim : [dimRimR, dimRimG, dimRimB];
        const segs = m.segs;

        const cOff = m.vStart * 3;
        mCols[cOff] = dot[0]; mCols[cOff + 1] = dot[1]; mCols[cOff + 2] = dot[2];

        const dStart = (m.vStart + 1) * 3;
        const dEnd = dStart + segs * 3;
        for (let k = dStart; k < dEnd; k += 3) {
          mCols[k] = dot[0]; mCols[k + 1] = dot[1]; mCols[k + 2] = dot[2];
        }

        const kEnd = dStart + segs * 3 * 3;
        for (let k = dEnd; k < kEnd; k += 3) {
          mCols[k] = col[0]; mCols[k + 1] = col[1]; mCols[k + 2] = col[2];
        }

        const rEnd = dStart + segs * 5 * 3;
        for (let k = kEnd; k < rEnd; k += 3) {
          mCols[k] = rim[0]; mCols[k + 1] = rim[1]; mCols[k + 2] = rim[2];
        }
      }
      rb.microMesh.geometry.attributes.color.needsUpdate = true;
    }

    const quizIso = E.state.quizHighlightIso;
    const sel = E.state.selectedCountry;
    const selKey = quizIso || (sel ? getCountryKey(sel) : '');
    const highlightHex = quizIso ? (E.state.quizHighlightColor || '#10b981') : '#ffffff';
    if (rb.highlightMesh && rb.highlightMesh.material && rb.highlightMesh.material.color) {
      rb.highlightMesh.material.color.set(highlightHex);
    }
    if (rb.highlightMicroMesh && rb.highlightMicroMesh.material && rb.highlightMicroMesh.material.color) {
      rb.highlightMicroMesh.material.color.set(highlightHex);
    }
    const slice = selKey ? rb.sliceByKey.get(selKey) : null;
    if (slice && slice.iCount > 0) {
      const pSrc = rb.capPositions;
      const pDst = rb.highlightPosArr;
      const vBytes = slice.vCount * 3;
      const pOff = slice.vStart * 3;
      for (let k = 0; k < vBytes; k++) pDst[k] = pSrc[pOff + k];

      const iSrc = rb.capIndices;
      const iDst = rb.highlightIdxArr;
      const iOff = slice.iStart;
      const vBase = slice.vStart;
      for (let k = 0; k < slice.iCount; k++) iDst[k] = iSrc[iOff + k] - vBase;

      const hGeo = rb.highlightMesh.geometry;
      hGeo.attributes.position.needsUpdate = true;
      hGeo.index.needsUpdate = true;
      hGeo.setDrawRange(0, slice.iCount);
      rb.highlightMesh.visible = true;

      if (slice.liCount > 0) {
        const lpSrc = rb.linePositions;
        const lpDst = rb.highlightLPosArr;
        const lvBytes = slice.lvCount * 3;
        const lpOff = slice.lvStart * 3;
        for (let k = 0; k < lvBytes; k++) lpDst[k] = lpSrc[lpOff + k];

        const liSrc = rb.lineIndices;
        const liDst = rb.highlightLIdxArr;
        const liOff = slice.liStart;
        const lvBase = slice.lvStart;
        for (let k = 0; k < slice.liCount; k++) liDst[k] = liSrc[liOff + k] - lvBase;

        const hlGeo = rb.highlightLine.geometry;
        hlGeo.attributes.position.needsUpdate = true;
        hlGeo.index.needsUpdate = true;
        hlGeo.setDrawRange(0, slice.liCount);
        rb.highlightLine.visible = true;
      } else {
        rb.highlightLine.visible = false;
      }
    } else {
      rb.highlightMesh.visible = false;
      rb.highlightLine.visible = false;
    }

    const selMicro = selKey ? rb.microByKey.get(selKey) : null;
    if (selMicro && rb.highlightMicroMesh) {
      const dst = rb.highlightMicroPosArr;
      const lift = 1.0020;
      const bx0 = selMicro.px * lift, by0 = selMicro.py * lift, bz0 = selMicro.pz * lift;
      const H_SEGS = 28;
      const hrIn = 0.56, hrOut = 0.78;
      for (let s = 0; s < H_SEGS; s++) {
        const th = (s / H_SEGS) * Math.PI * 2;
        const cs = Math.cos(th), sn = Math.sin(th);
        const ux = selMicro.tx * cs + selMicro.bx * sn;
        const uy = selMicro.ty * cs + selMicro.by * sn;
        const uz = selMicro.tz * cs + selMicro.bz * sn;
        const oIn = s * 6;
        dst[oIn] = bx0 + ux * hrIn; dst[oIn + 1] = by0 + uy * hrIn; dst[oIn + 2] = bz0 + uz * hrIn;
        dst[oIn + 3] = bx0 + ux * hrOut; dst[oIn + 4] = by0 + uy * hrOut; dst[oIn + 5] = bz0 + uz * hrOut;
      }
      rb.highlightMicroMesh.geometry.attributes.position.needsUpdate = true;
      rb.highlightMicroMesh.visible = true;
    } else if (rb.highlightMicroMesh) {
      rb.highlightMicroMesh.visible = false;
    }
  }

  E.polygons = {
    pickTargetAtScreen,
    waitForPolygonsAndMerge,
    mergeWorldPolygons,
    refreshPolygonVisuals
  };
})(window);
