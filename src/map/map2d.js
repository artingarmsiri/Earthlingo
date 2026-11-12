// src/map/map2d.js - WebGL Vector 2D World Map (3D-Matched Crisp Hairline Borders) + HUD Overlay
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  const TAU = Math.PI * 2;
  const WORLD_HALF_V = 0.3666; // Miller Cylindrical V extent at +/- 90 deg latitude
  const WORLD_ASPECT = WORLD_HALF_V * 2;
  const MIN_ZOOM = 0.92;
  const MAX_ZOOM = 18;
  const DEFAULT_CENTER_LAT = 10;
  const DEFAULT_CENTER_LNG = 12;
  const MAX_BATCH_VERTS = 54000;

  const mapState = {
    initialized: false,
    eventsBound: false,
    geometryBuilt: false,
    glUploaded: false,
    canvas: null,
    gl: null,
    hudCanvas: null,
    hudCtx: null,
    programs: null,
    quadBuf: null,
    gratBuf: null,
    gratBufCap: 0,
    fillBatches: [],
    edgeBuffer: null,
    edgePositions: null,
    edgeVertCount: 0,
    colorSig: '',
    slices: [],
    sliceByKey: new Map(),
    microPxCache: [],
    centerU: DEFAULT_CENTER_LNG / 360,
    centerV: 0,
    zoom: 1,
    isMoving: false,
    hoveredKey: '',
    arcs: [],
    rings: [],
    animRafId: 0,
    redrawRafId: 0,
    lastFrameTs: 0,
    lastMotionTs: 0,
    flyAnim: null,
    zoomAnim: null,
    panVelU: 0,
    panVelV: 0,
    lastOverlayTier: -1
  };

  function clamp(val, min, max) {
    return val < min ? min : (val > max ? max : val);
  }

  function wrapLng(lng) {
    let l = ((Number(lng) || 0) + 180) % 360;
    if (l < 0) l += 360;
    return l - 180;
  }

  function wrapUnitU(u) {
    let x = ((Number(u) || 0) + 0.5) % 1;
    if (x < 0) x += 1;
    return x - 0.5;
  }

  function latLngToUV(latDeg, lngDeg) {
    const u = wrapLng(lngDeg) / 360;
    const clampedLat = clamp(Number(latDeg) || 0, -89.85, 89.85);
    const phi = (clampedLat * Math.PI) / 180;
    const my = 1.25 * Math.log(Math.tan(Math.PI * 0.25 + 0.4 * phi));
    const v = -my / TAU;
    return [u, v];
  }

  function uvToLatLng(u, v) {
    const lng = wrapLng((Number(u) || 0) * 360);
    const my = -(Number(v) || 0) * TAU;
    const phi = 2.5 * (Math.atan(Math.exp(0.8 * my)) - Math.PI * 0.25);
    const lat = clamp((phi * 180) / Math.PI, -89.9, 89.9);
    return { lat, lng };
  }

  mapState.centerV = latLngToUV(DEFAULT_CENTER_LAT, DEFAULT_CENTER_LNG)[1];

  function parseHexRgb01(hex) {
    if (!hex || typeof hex !== 'string') return [2 / 255, 132 / 255, 199 / 255];
    const clean = hex.charAt(0) === '#' ? hex.slice(1) : hex;
    if (clean.length === 3) {
      return [
        parseInt(clean[0] + clean[0], 16) / 255,
        parseInt(clean[1] + clean[1], 16) / 255,
        parseInt(clean[2] + clean[2], 16) / 255
      ];
    }
    const n = parseInt(clean.slice(0, 6), 16);
    if (Number.isNaN(n)) return [2 / 255, 132 / 255, 199 / 255];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  // ---- Zero-Dependency Planar Polygon-with-Holes Earcut Triangulator ----
  function EarNode(i, x, y) {
    this.i = i;
    this.x = x;
    this.y = y;
    this.prev = null;
    this.next = null;
    this.z = 0;
    this.prevZ = null;
    this.nextZ = null;
    this.steiner = false;
  }

  function signedArea(data, start, end, dim) {
    let sum = 0;
    for (let i = start, j = end - dim; i < end; i += dim) {
      sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
      j = i;
    }
    return sum;
  }

  function insertNode(i, x, y, last) {
    const p = new EarNode(i, x, y);
    if (!last) {
      p.prev = p;
      p.next = p;
    } else {
      p.next = last.next;
      p.prev = last;
      last.next.prev = p;
      last.next = p;
    }
    return p;
  }

  function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;
    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
  }

  function equalsNode(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }

  function areaTri(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  }

  function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (
      (cx - px) * (ay - py) >= (ax - px) * (cy - py) &&
      (ax - px) * (by - py) >= (bx - px) * (ay - py) &&
      (bx - px) * (cy - py) >= (cx - px) * (by - py)
    );
  }

  function pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, px, py) {
    return !(ax === px && ay === py) && pointInTriangle(ax, ay, bx, by, cx, cy, px, py);
  }

  function onSegment(p, q, r) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
  }

  function signNum(num) {
    return num > 0 ? 1 : (num < 0 ? -1 : 0);
  }

  function intersects(p1, q1, p2, q2) {
    const o1 = signNum(areaTri(p1, q1, p2));
    const o2 = signNum(areaTri(p1, q1, q2));
    const o3 = signNum(areaTri(p2, q2, p1));
    const o4 = signNum(areaTri(p2, q2, q1));
    if (o1 !== o2 && o3 !== o4) return true;
    if (o1 === 0 && onSegment(p1, p2, q1)) return true;
    if (o2 === 0 && onSegment(p1, q2, q1)) return true;
    if (o3 === 0 && onSegment(p2, p1, q2)) return true;
    if (o4 === 0 && onSegment(p2, q1, q2)) return true;
    return false;
  }

  function intersectsPolygon(a, b) {
    let p = a;
    do {
      if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) {
        return true;
      }
      p = p.next;
    } while (p !== a);
    return false;
  }

  function locallyInside(a, b) {
    return areaTri(a.prev, a, a.next) < 0
      ? areaTri(a, b, a.next) >= 0 && areaTri(a, a.prev, b) >= 0
      : areaTri(a, b, a.prev) < 0 || areaTri(a, a.next, b) < 0;
  }

  function middleInside(a, b) {
    let p = a;
    let inside = false;
    const px = (a.x + b.x) / 2;
    const py = (a.y + b.y) / 2;
    do {
      if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
          (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x)) {
        inside = !inside;
      }
      p = p.next;
    } while (p !== a);
    return inside;
  }

  function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
      ((locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) &&
        (areaTri(a.prev, a, b.prev) || areaTri(a, b.prev, b))) ||
       (equalsNode(a, b) && areaTri(a.prev, a, a.next) > 0 && areaTri(b.prev, b, b.next) > 0));
  }

  function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;
    let p = start;
    let again;
    do {
      again = false;
      if (!p.steiner && (equalsNode(p, p.next) || areaTri(p.prev, p, p.next) === 0)) {
        removeNode(p);
        p = end = p.prev;
        if (p === p.next) break;
        again = true;
      } else {
        p = p.next;
      }
    } while (again || p !== end);
    return end;
  }

  function linkedList(data, start, end, dim, clockwise) {
    let last;
    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
      for (let i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
      for (let i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }
    if (last && equalsNode(last, last.next)) {
      removeNode(last);
      last = last.next;
    }
    return last;
  }

  function zOrder(x, y, minX, minY, invSize) {
    x = ((x - minX) * invSize) | 0;
    y = ((y - minY) * invSize) | 0;
    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;
    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;
    return x | (y << 1);
  }

  function sortLinked(list) {
    let inSize = 1;
    let numMerges;
    do {
      let p = list;
      list = null;
      let tail = null;
      numMerges = 0;
      while (p) {
        numMerges++;
        let q = p;
        let pSize = 0;
        for (let i = 0; i < inSize; i++) {
          pSize++;
          q = q.nextZ;
          if (!q) break;
        }
        let qSize = inSize;
        while (pSize > 0 || (qSize > 0 && q)) {
          let e;
          if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
            e = p;
            p = p.nextZ;
            pSize--;
          } else {
            e = q;
            q = q.nextZ;
            qSize--;
          }
          if (tail) tail.nextZ = e;
          else list = e;
          e.prevZ = tail;
          tail = e;
        }
        p = q;
      }
      tail.nextZ = null;
      inSize *= 2;
    } while (numMerges > 1);
    return list;
  }

  function indexCurve(start, minX, minY, invSize) {
    let p = start;
    do {
      if (p.z === 0) p.z = zOrder(p.x, p.y, minX, minY, invSize);
      p.prevZ = p.prev;
      p.nextZ = p.next;
      p = p.next;
    } while (p !== start);
    p.prevZ.nextZ = null;
    p.prevZ = null;
    sortLinked(p);
  }

  function getLeftmost(start) {
    let p = start;
    let leftmost = start;
    do {
      if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) leftmost = p;
      p = p.next;
    } while (p !== start);
    return leftmost;
  }

  function sectorContainsSector(m, p) {
    return areaTri(m.prev, m, p.prev) < 0 && areaTri(p.next, m, m.next) < 0;
  }

  function findHoleBridge(hole, outerNode) {
    let p = outerNode;
    const hx = hole.x;
    const hy = hole.y;
    let qx = -Infinity;
    let m;

    if (equalsNode(hole, p)) return p;
    do {
      if (equalsNode(hole, p.next)) return p.next;
      else if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
        const x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
        if (x <= hx && x > qx) {
          qx = x;
          m = p.x < p.next.x ? p : p.next;
          if (x === hx) return m;
        }
      }
      p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    const stop = m;
    const mx = m.x;
    const my = m.y;
    let tanMin = Infinity;

    p = m;
    do {
      if (hx >= p.x && p.x >= mx && hx !== p.x &&
          pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
        const tan = Math.abs(hy - p.y) / (hx - p.x);
        if (locallyInside(p, hole) && (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
          m = p;
          tanMin = tan;
        }
      }
      p = p.next;
    } while (p !== stop);

    return m;
  }

  function splitPolygon(a, b) {
    const a2 = new EarNode(a.i, a.x, a.y);
    const b2 = new EarNode(b.i, b.x, b.y);
    const an = a.next;
    const bp = b.prev;

    a.next = b;
    b.prev = a;
    a2.next = an;
    an.prev = a2;
    b2.next = a2;
    a2.prev = b2;
    bp.next = b2;
    b2.prev = bp;

    return b2;
  }

  function eliminateHole(hole, outerNode) {
    const bridge = findHoleBridge(hole, outerNode);
    if (!bridge) return outerNode;
    const bridgeReverse = splitPolygon(bridge, hole);
    filterPoints(bridgeReverse, bridgeReverse.next);
    return filterPoints(bridge, bridge.next);
  }

  function eliminateHoles(data, holeIndices, outerNode, dim) {
    const queue = [];
    for (let i = 0, len = holeIndices.length; i < len; i++) {
      const start = holeIndices[i] * dim;
      const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
      const list = linkedList(data, start, end, dim, false);
      if (list === list.next) list.steiner = true;
      queue.push(getLeftmost(list));
    }
    queue.sort((a, b) => a.x - b.x);
    for (let i = 0; i < queue.length; i++) {
      outerNode = eliminateHole(queue[i], outerNode);
    }
    return outerNode;
  }

  function isEar(ear) {
    const a = ear.prev;
    const b = ear;
    const c = ear.next;
    if (areaTri(a, b, c) >= 0) return false;
    const ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
    const x0 = Math.min(ax, bx, cx), y0 = Math.min(ay, by, cy);
    const x1 = Math.max(ax, bx, cx), y1 = Math.max(ay, by, cy);
    let p = c.next;
    while (p !== a) {
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 &&
          pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) &&
          areaTri(p.prev, p, p.next) >= 0) {
        return false;
      }
      p = p.next;
    }
    return true;
  }

  function isEarHashed(ear, minX, minY, invSize) {
    const a = ear.prev;
    const b = ear;
    const c = ear.next;
    if (areaTri(a, b, c) >= 0) return false;
    const ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y;
    const x0 = Math.min(ax, bx, cx), y0 = Math.min(ay, by, cy);
    const x1 = Math.max(ax, bx, cx), y1 = Math.max(ay, by, cy);
    const minZ = zOrder(x0, y0, minX, minY, invSize);
    const maxZ = zOrder(x1, y1, minX, minY, invSize);

    let p = ear.prevZ;
    let n = ear.nextZ;
    while (p && p.z >= minZ && n && n.z <= maxZ) {
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c &&
          pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) && areaTri(p.prev, p, p.next) >= 0) return false;
      p = p.prevZ;
      if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c &&
          pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) && areaTri(n.prev, n, n.next) >= 0) return false;
      n = n.nextZ;
    }
    while (p && p.z >= minZ) {
      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== a && p !== c &&
          pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, p.x, p.y) && areaTri(p.prev, p, p.next) >= 0) return false;
      p = p.prevZ;
    }
    while (n && n.z <= maxZ) {
      if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== a && n !== c &&
          pointInTriangleExceptFirst(ax, ay, bx, by, cx, cy, n.x, n.y) && areaTri(n.prev, n, n.next) >= 0) return false;
      n = n.nextZ;
    }
    return true;
  }

  function cureLocalIntersections(start, triangles, dim) {
    let p = start;
    do {
      const a = p.prev;
      const b = p.next.next;
      if (!equalsNode(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
        triangles.push((a.i / dim) | 0, (p.i / dim) | 0, (b.i / dim) | 0);
        removeNode(p);
        removeNode(p.next);
        p = start = b;
      }
      p = p.next;
    } while (p !== start);
    return filterPoints(p);
  }

  function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
    if (!ear) return;
    if (!pass && invSize) indexCurve(ear, minX, minY, invSize);

    let stop = ear;
    while (ear.prev !== ear.next) {
      const prev = ear.prev;
      const next = ear.next;
      if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
        triangles.push((prev.i / dim) | 0, (ear.i / dim) | 0, (next.i / dim) | 0);
        removeNode(ear);
        ear = next.next;
        stop = next.next;
        continue;
      }
      ear = next;
      if (ear === stop) {
        if (!pass) {
          earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
        } else if (pass === 1) {
          ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
          earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
        } else if (pass === 2) {
          splitEarcut(ear, triangles, dim, minX, minY, invSize);
        }
        break;
      }
    }
  }

  function splitEarcut(start, triangles, dim, minX, minY, invSize) {
    let a = start;
    do {
      let b = a.next.next;
      while (b !== a.prev) {
        if (a.i !== b.i && isValidDiagonal(a, b)) {
          let c = splitPolygon(a, b);
          a = filterPoints(a, a.next);
          c = filterPoints(c, c.next);
          earcutLinked(a, triangles, dim, minX, minY, invSize, 0);
          earcutLinked(c, triangles, dim, minX, minY, invSize, 0);
          return;
        }
        b = b.next;
      }
      a = a.next;
    } while (a !== start);
  }

  function earcutUV(data, holeIndices) {
    const dim = 2;
    const hasHoles = holeIndices && holeIndices.length;
    const outerLen = hasHoles ? holeIndices[0] * dim : data.length;
    let outerNode = linkedList(data, 0, outerLen, dim, true);
    const triangles = [];
    if (!outerNode || outerNode.next === outerNode.prev) return triangles;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    let minX = 0, minY = 0, invSize = 0;
    if (data.length > 80 * dim) {
      minX = data[0];
      minY = data[1];
      let maxX = minX;
      let maxY = minY;
      for (let i = dim; i < outerLen; i += dim) {
        const x = data[i];
        const y = data[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      invSize = Math.max(maxX - minX, maxY - minY);
      invSize = invSize !== 0 ? 32767 / invSize : 0;
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, invSize, 0);
    return triangles;
  }

  function extractCleanRingUV(ring) {
    if (!ring || ring.length < 3) return null;
    const pts = [];
    let prevLng = Number(ring[0][0]) || 0;
    let lngOffset = 0;
    for (let k = 0; k < ring.length; k++) {
      const rawLng = Number(ring[k][0]) || 0;
      const rawLat = Number(ring[k][1]) || 0;
      const diff = rawLng - prevLng;
      if (diff > 180) lngOffset -= 360;
      else if (diff < -180) lngOffset += 360;
      prevLng = rawLng;
      const u = (rawLng + lngOffset) / 360;
      const v = latLngToUV(rawLat, 0)[1];
      if (pts.length >= 2) {
        const lu = pts[pts.length - 2];
        const lv = pts[pts.length - 1];
        if (Math.abs(u - lu) < 1e-9 && Math.abs(v - lv) < 1e-9) continue;
      }
      pts.push(u, v);
    }
    if (pts.length >= 4 && Math.abs(pts[0] - pts[pts.length - 2]) < 1e-9 && Math.abs(pts[1] - pts[pts.length - 1]) < 1e-9) {
      pts.length -= 2;
    }
    return pts.length >= 6 ? pts : null;
  }

  // ---- Camera & Viewport Helpers ----
  function getViewportDims() {
    const rb = E.renderBatch || {};
    const container = E.elements && E.elements.map2dContainer;
    const rect = container && typeof container.getBoundingClientRect === 'function'
      ? container.getBoundingClientRect()
      : null;
    const vw = Math.max(1, Math.round((rect && rect.width) || rb.viewportW || global.innerWidth || 1200));
    const vh = Math.max(1, Math.round((rect && rect.height) || rb.viewportH || global.innerHeight || 800));
    const left = rect ? rect.left : (rb.viewportLeft || 0);
    const top = rect ? rect.top : (rb.viewportTop || 0);
    return { vw, vh, left, top };
  }

  function getBaseWorldPx(vw, vh) {
    const padX = vw <= 768 ? 0.99 : 0.96;
    return Math.max(160, Math.min(vw * padX, vh / WORLD_ASPECT));
  }

  function getDefaultZoom(vw, vh) {
    if (!vw || !vh) return 1;
    const basePx = getBaseWorldPx(vw, vh);
    const baseH = basePx * WORLD_ASPECT;
    if (vw < vh * 0.92 && baseH < vh * 0.68) {
      return clamp((vh * 0.72) / baseH, 1, 2.45);
    }
    return 1.0;
  }

  function getWorldPx(vw, vh) {
    return getBaseWorldPx(vw, vh) * mapState.zoom;
  }

  function clampCameraV(vw, vh) {
    const worldPx = getWorldPx(vw, vh);
    const halfVisV = (vh * 0.5) / worldPx;
    if (halfVisV <= WORLD_HALF_V) {
      const maxOffset = WORLD_HALF_V - halfVisV;
      mapState.centerV = clamp(mapState.centerV, -maxOffset, maxOffset);
    } else {
      mapState.centerV = clamp(mapState.centerV, -0.05, 0.05);
    }
  }

  function altitudeToZoom(alt) {
    const defAlt = (E.utils && typeof E.utils.getDefaultAltitude === 'function')
      ? E.utils.getDefaultAltitude()
      : 2.5;
    const safeAlt = Math.max(0.24, Number(alt) || defAlt);
    return clamp(Math.pow(defAlt / safeAlt, 1.75), MIN_ZOOM, MAX_ZOOM);
  }

  function zoomToAltitude(z) {
    const defAlt = (E.utils && typeof E.utils.getDefaultAltitude === 'function')
      ? E.utils.getDefaultAltitude()
      : 2.5;
    const safeZ = clamp(Number(z) || 1, MIN_ZOOM, MAX_ZOOM);
    const minAlt = (E.config && E.config.GLOBE_CONFIG)
      ? (E.config.GLOBE_CONFIG.MIN_CAM_DIST - 100) / 100
      : 0.32;
    const maxAlt = (E.config && E.config.GLOBE_CONFIG)
      ? (E.config.GLOBE_CONFIG.MAX_CAM_DIST - 100) / 100
      : 7.5;
    return clamp(defAlt / Math.pow(safeZ, 1 / 1.75), minAlt, maxAlt);
  }

  function getPov() {
    const { lat, lng } = uvToLatLng(mapState.centerU, mapState.centerV);
    return {
      lat,
      lng,
      altitude: zoomToAltitude(mapState.zoom)
    };
  }

  function getEquivAltitude() {
    return zoomToAltitude(mapState.zoom);
  }

  function computeOverlayZoomTier2d() {
    const z = mapState.zoom;
    const cur = mapState.lastOverlayTier;
    const t1Enter = 1.38, t1Exit = 1.26, t2Enter = 2.30, t2Exit = 2.12;
    let next = cur;
    if (cur < 0 || cur === 0) {
      next = z >= t2Enter ? 2 : (z >= t1Enter ? 1 : 0);
    } else if (cur === 1) {
      if (z >= t2Enter) next = 2;
      else if (z < t1Exit) next = 0;
      else next = 1;
    } else {
      if (z < t1Exit) next = 0;
      else if (z < t2Exit) next = 1;
      else next = 2;
    }
    mapState.lastOverlayTier = next;
    return next;
  }

  function getOverlayCameraState(vw, vh) {
    const worldPx = getWorldPx(vw, vh);
    return {
      centerU: mapState.centerU,
      centerV: mapState.centerV,
      zoom: mapState.zoom,
      worldPx,
      zoomTier: computeOverlayZoomTier2d(),
      moving: mapState.isMoving
    };
  }

  function projectLatLngToScreen(lat, lng, vw, vh) {
    const dims = (vw && vh) ? { vw, vh } : getViewportDims();
    const worldPx = getWorldPx(dims.vw, dims.vh);
    const [u, v] = latLngToUV(lat, lng);
    let du = u - mapState.centerU;
    if (du > 0.5) du -= 1;
    if (du < -0.5) du += 1;
    const sx = dims.vw * 0.5 + du * worldPx;
    const sy = dims.vh * 0.5 + (v - mapState.centerV) * worldPx;
    return [sx, sy];
  }

  function screenToLatLng(clientX, clientY) {
    const { vw, vh, left, top } = getViewportDims();
    const worldPx = getWorldPx(vw, vh);
    const lx = clientX - left;
    const ly = clientY - top;
    const u = mapState.centerU + (lx - vw * 0.5) / worldPx;
    const v = mapState.centerV + (ly - vh * 0.5) / worldPx;
    if (v < -WORLD_HALF_V || v > WORLD_HALF_V) return null;
    return uvToLatLng(wrapUnitU(u), v);
  }

  // ---- Geometry Build (GPU-Ready Triangulated Fills & 3D-Exact Border Edges) ----
  function buildGeometry() {
    if (mapState.geometryBuilt) return;
    const features = E.state.geoData && E.state.geoData.features;
    if (!features || !features.length) return;

    const byKey = new Map();
    const { getFeatureKey, getCountryData, resolveCountryFamilyGroup, resolveCountryScriptGroup, resolveCountryDiversityGroup } = E.geo;

    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      const key = f.__key || getFeatureKey(f);
      let list = byKey.get(key);
      if (!list) {
        list = [];
        byKey.set(key, list);
      }
      list.push(f);
    }

    const slices = [];
    const sliceByKey = new Map();
    const batches = [];
    let curBatch = { verts: [], indices: [], sliceRefs: [] };

    const pushCurrentBatch = () => {
      if (curBatch.verts.length === 0) return;
      const vLen = curBatch.verts.length / 2;
      batches.push({
        positions: new Float32Array(curBatch.verts),
        colors: new Float32Array(vLen * 3),
        indices: new Uint16Array(curBatch.indices),
        vertCount: vLen,
        idxCount: curBatch.indices.length,
        posBuf: null,
        colBuf: null,
        idxBuf: null,
        sliceRefs: curBatch.sliceRefs
      });
      curBatch = { verts: [], indices: [], sliceRefs: [] };
    };

    const edgeVertsList = [];

    for (const [key, featList] of byKey.entries()) {
      const refFeat = featList[0];
      const country = refFeat.__country || getCountryData(refFeat.properties) || { name: refFeat.properties.name, canonicalLanguage: 'Other' };
      const famGrp = resolveCountryFamilyGroup(country);
      const scrGrp = resolveCountryScriptGroup(country);
      const divGrp = resolveCountryDiversityGroup(country);

      const sliceUVVerts = [];
      const sliceTris = [];
      const edgeStart = edgeVertsList.length / 2;
      let minU = Infinity, minV = Infinity, maxU = -Infinity, maxV = -Infinity;

      for (let fi = 0; fi < featList.length; fi++) {
        const geom = featList[fi].geometry;
        if (!geom || !geom.coordinates) continue;
        const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
        for (let pi = 0; pi < polys.length; pi++) {
          const rings = polys[pi];
          if (!rings || !rings.length) continue;

          const outerUV = extractCleanRingUV(rings[0]);
          if (!outerUV) continue;

          const polyData = [];
          const holeIndices = [];
          for (let k = 0; k < outerUV.length; k += 2) {
            const u = outerUV[k], v = outerUV[k + 1];
            if (u < minU) minU = u;
            if (u > maxU) maxU = u;
            if (v < minV) minV = v;
            if (v > maxV) maxV = v;
            polyData.push(u, v);
          }

          // Outer border edges
          const oCount = outerUV.length / 2;
          for (let k = 0; k < oCount; k++) {
            const kNext = (k + 1) % oCount;
            edgeVertsList.push(outerUV[k * 2], outerUV[k * 2 + 1], outerUV[kNext * 2], outerUV[kNext * 2 + 1]);
          }

          // Holes
          for (let ri = 1; ri < rings.length; ri++) {
            const holeUV = extractCleanRingUV(rings[ri]);
            if (!holeUV) continue;
            holeIndices.push(polyData.length / 2);
            for (let k = 0; k < holeUV.length; k += 2) {
              polyData.push(holeUV[k], holeUV[k + 1]);
            }
            const hCount = holeUV.length / 2;
            for (let k = 0; k < hCount; k++) {
              const kNext = (k + 1) % hCount;
              edgeVertsList.push(holeUV[k * 2], holeUV[k * 2 + 1], holeUV[kNext * 2], holeUV[kNext * 2 + 1]);
            }
          }

          const tris = earcutUV(polyData, holeIndices.length ? holeIndices : null);
          if (tris.length > 0) {
            const localVBase = sliceUVVerts.length / 2;
            for (let k = 0; k < polyData.length; k++) sliceUVVerts.push(polyData[k]);
            for (let k = 0; k < tris.length; k++) sliceTris.push(localVBase + tris[k]);
          }
        }
      }

      const sliceVCount = sliceUVVerts.length / 2;
      if (sliceVCount > 0 && (curBatch.verts.length / 2 + sliceVCount) > MAX_BATCH_VERTS) {
        pushCurrentBatch();
      }

      const fillBatchIdx = batches.length;
      const vStart = curBatch.verts.length / 2;
      const iStart = curBatch.indices.length;

      for (let k = 0; k < sliceUVVerts.length; k++) curBatch.verts.push(sliceUVVerts[k]);
      for (let k = 0; k < sliceTris.length; k++) curBatch.indices.push(vStart + sliceTris[k]);

      const colorLanguage = country.color || '#0284c7';
      const colorFamily = famGrp.color || '#0ea5e9';
      const colorScript = scrGrp.color || '#0ea5e9';
      const colorDiversity = divGrp.color || '#4f618f';

      const slice = {
        key,
        country,
        lang: country.canonicalLanguage || country.primaryLanguage || 'Other',
        family: country.languageFamily || '',
        familyGroup: famGrp.name,
        scriptGroup: scrGrp.name,
        diversityTier: divGrp.name,
        colorLanguage,
        colorFamily,
        colorScript,
        colorDiversity,
        rgbLanguage: parseHexRgb01(colorLanguage),
        rgbFamily: parseHexRgb01(colorFamily),
        rgbScript: parseHexRgb01(colorScript),
        rgbDiversity: parseHexRgb01(colorDiversity),
        fillBatchIdx,
        vStart,
        vCount: sliceVCount,
        iStart,
        iCount: sliceTris.length,
        edgeStart,
        edgeCount: (edgeVertsList.length / 2) - edgeStart,
        minU,
        minV,
        maxU,
        maxV
      };

      curBatch.sliceRefs.push(slice);
      slices.push(slice);
      sliceByKey.set(key, slice);
    }

    pushCurrentBatch();

    const microList = E.geo.getMicrostates();
    const microPxCache = [];
    for (let i = 0; i < microList.length; i++) {
      const m = microList[i];
      const [u, v] = latLngToUV(m.lat, m.lng);
      const c = m.country || {};
      const famGrp = resolveCountryFamilyGroup(c);
      const scrGrp = resolveCountryScriptGroup(c);
      const divGrp = resolveCountryDiversityGroup(c);
      microPxCache.push({
        key: m.key || E.geo.getCountryKey(c),
        country: c,
        lat: m.lat,
        lng: m.lng,
        u,
        v,
        lang: c.canonicalLanguage || c.primaryLanguage || 'Other',
        family: c.languageFamily || '',
        familyGroup: famGrp.name,
        scriptGroup: scrGrp.name,
        diversityTier: divGrp.name,
        colorLanguage: c.color || '#38bdf8',
        colorFamily: famGrp.color || '#0ea5e9',
        colorScript: scrGrp.color || '#0ea5e9',
        colorDiversity: divGrp.color || '#4f618f'
      });
    }

    mapState.slices = slices;
    mapState.sliceByKey = sliceByKey;
    mapState.fillBatches = batches;
    mapState.edgePositions = new Float32Array(edgeVertsList);
    mapState.edgeVertCount = edgeVertsList.length / 2;
    mapState.microPxCache = microPxCache;
    mapState.colorSig = '';
    mapState.geometryBuilt = true;
  }

  // ---- WebGL Shader Compilation & GPU Upload ----
  function compileShader(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('2D Map WebGL shader error:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function createProgram(gl, vsSrc, fsSrc) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('2D Map WebGL link error:', gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }

  function initWebGLPrograms(gl) {
    if (mapState.programs) return true;

    const oceanProg = createProgram(
      gl,
      'attribute vec2 aPos; varying vec2 vNdc; void main() { vNdc = aPos; gl_Position = vec4(aPos, 0.0, 1.0); }',
      'precision mediump float;' +
      'varying vec2 vNdc;' +
      'uniform float uEqNdcY;' +
      'uniform float uSpanNdcY;' +
      'void main() {' +
      '  float d = abs(vNdc.y - uEqNdcY) / max(0.0001, uSpanNdcY);' +
      '  vec3 cEq  = vec3(0.047, 0.125, 0.239);' +
      '  vec3 cMid = vec3(0.031, 0.082, 0.169);' +
      '  vec3 cPol = vec3(0.020, 0.051, 0.110);' +
      '  vec3 col = d < 0.52 ? mix(cEq, cMid, d / 0.52) : mix(cMid, cPol, min(1.0, (d - 0.52) / 0.48));' +
      '  gl_FragColor = vec4(col, 1.0);' +
      '}'
    );

    const meshProg = createProgram(
      gl,
      'attribute vec2 aPos;' +
      'attribute vec3 aColor;' +
      'uniform vec2 uCam;' +
      'uniform vec2 uScale;' +
      'varying vec3 vColor;' +
      'void main() {' +
      '  vec2 d = aPos - uCam;' +
      '  gl_Position = vec4(d.x * uScale.x, -d.y * uScale.y, 0.0, 1.0);' +
      '  vColor = aColor;' +
      '}',
      'precision mediump float;' +
      'varying vec3 vColor;' +
      'void main() { gl_FragColor = vec4(vColor, 1.0); }'
    );

    const solidProg = createProgram(
      gl,
      'attribute vec2 aPos;' +
      'uniform vec2 uCam;' +
      'uniform vec2 uScale;' +
      'void main() {' +
      '  vec2 d = aPos - uCam;' +
      '  gl_Position = vec4(d.x * uScale.x, -d.y * uScale.y, 0.0, 1.0);' +
      '}',
      'precision mediump float;' +
      'uniform vec4 uColor;' +
      'void main() { gl_FragColor = uColor; }'
    );

    if (!oceanProg || !meshProg || !solidProg) return false;

    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const gratBuf = gl.createBuffer();

    mapState.quadBuf = quadBuf;
    mapState.gratBuf = gratBuf;
    mapState.programs = {
      ocean: {
        prog: oceanProg,
        aPos: gl.getAttribLocation(oceanProg, 'aPos'),
        uEqNdcY: gl.getUniformLocation(oceanProg, 'uEqNdcY'),
        uSpanNdcY: gl.getUniformLocation(oceanProg, 'uSpanNdcY')
      },
      mesh: {
        prog: meshProg,
        aPos: gl.getAttribLocation(meshProg, 'aPos'),
        aColor: gl.getAttribLocation(meshProg, 'aColor'),
        uCam: gl.getUniformLocation(meshProg, 'uCam'),
        uScale: gl.getUniformLocation(meshProg, 'uScale')
      },
      solid: {
        prog: solidProg,
        aPos: gl.getAttribLocation(solidProg, 'aPos'),
        uCam: gl.getUniformLocation(solidProg, 'uCam'),
        uScale: gl.getUniformLocation(solidProg, 'uScale'),
        uColor: gl.getUniformLocation(solidProg, 'uColor')
      }
    };
    return true;
  }

  function ensureGlUploaded() {
    const gl = mapState.gl;
    if (!gl || !mapState.geometryBuilt || mapState.glUploaded) return;
    if (!initWebGLPrograms(gl)) return;

    for (let i = 0; i < mapState.fillBatches.length; i++) {
      const b = mapState.fillBatches[i];
      b.posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b.posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, b.positions, gl.STATIC_DRAW);

      b.colBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b.colBuf);
      gl.bufferData(gl.ARRAY_BUFFER, b.colors, gl.DYNAMIC_DRAW);

      b.idxBuf = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.idxBuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, b.indices, gl.STATIC_DRAW);
    }

    if (mapState.edgePositions && mapState.edgeVertCount > 0) {
      mapState.edgeBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, mapState.edgeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, mapState.edgePositions, gl.STATIC_DRAW);
    }

    mapState.glUploaded = true;
  }

  // ---- Filtering, Color Resolution & Dynamic GPU Color Upload ----
  function getActiveFilterState() {
    const activeSpokenSet = E.state.activeFilterSpokenCountries;
    return {
      hasSpoken: Boolean(activeSpokenSet && activeSpokenSet.size > 0),
      activeSpokenSet,
      activeSpokenLang: E.state.activeFilterSpokenLang || '',
      activeLang: E.state.activeFilterLanguage || '',
      activeFam: E.state.activeFilterFamily || '',
      activeScr: E.state.activeFilterScript || '',
      activeDiv: E.state.activeFilterDiversityTier || ''
    };
  }

  function buildDataSignature(colorBy, isHistorical, eraId, filterState) {
    const fPart = filterState.hasSpoken
      ? `S:${filterState.activeSpokenLang || filterState.activeSpokenSet.size}`
      : (filterState.activeLang
        ? `L:${filterState.activeLang}`
        : (filterState.activeFam
          ? `F:${filterState.activeFam}`
          : (filterState.activeScr
            ? `C:${filterState.activeScr}`
            : (filterState.activeDiv ? `D:${filterState.activeDiv}` : 'ALL'))));
    return `${colorBy}|${isHistorical ? eraId : 'today'}|${fPart}`;
  }

  function matchesFilter(item, f) {
    if (f.hasSpoken) return f.activeSpokenSet.has(item.key);
    if (f.activeLang) return item.lang === f.activeLang;
    if (f.activeFam) return item.familyGroup === f.activeFam || item.family === f.activeFam;
    if (f.activeScr) return item.scriptGroup === f.activeScr;
    if (f.activeDiv) return item.diversityTier === f.activeDiv;
    return true;
  }

  function resolveFillHex(item, colorBy, isHistorical, eraId) {
    if (isHistorical) {
      const eraInfo = global.WORLD_HISTORICAL_ERAS.getCountryEraState(item.country, eraId);
      return eraInfo && eraInfo.color ? eraInfo.color : item.colorLanguage;
    }
    if (colorBy === 'family') return item.colorFamily;
    if (colorBy === 'script') return item.colorScript;
    if (colorBy === 'diversity') return item.colorDiversity;
    return item.colorLanguage;
  }

  function resolveFillRgb01(item, colorBy, isHistorical, eraId, eraCache) {
    if (isHistorical) {
      const eraInfo = global.WORLD_HISTORICAL_ERAS.getCountryEraState(item.country, eraId);
      const hex = eraInfo && eraInfo.color ? eraInfo.color : '';
      if (!hex) return item.rgbLanguage;
      let rgb = eraCache.get(hex);
      if (!rgb) {
        rgb = parseHexRgb01(hex);
        eraCache.set(hex, rgb);
      }
      return rgb;
    }
    if (colorBy === 'family') return item.rgbFamily;
    if (colorBy === 'script') return item.rgbScript;
    if (colorBy === 'diversity') return item.rgbDiversity;
    return item.rgbLanguage;
  }

  function syncFillColorsGPU(stateSig, colorBy, isHistorical, eraId, filterState) {
    if (mapState.colorSig === stateSig) return;
    mapState.colorSig = stateSig;

    const dimR = 17 / 255, dimG = 26 / 255, dimB = 46 / 255;
    const eraCache = isHistorical ? new Map() : null;
    const gl = mapState.gl;
    const batches = mapState.fillBatches;

    for (let bi = 0; bi < batches.length; bi++) {
      const b = batches[bi];
      const cols = b.colors;
      const refs = b.sliceRefs;
      for (let i = 0; i < refs.length; i++) {
        const s = refs[i];
        const match = matchesFilter(s, filterState);
        let r = dimR, g = dimG, bv = dimB;
        if (match) {
          const rgb = resolveFillRgb01(s, colorBy, isHistorical, eraId, eraCache);
          r = rgb[0];
          g = rgb[1];
          bv = rgb[2];
        }
        const start = s.vStart * 3;
        const end = (s.vStart + s.vCount) * 3;
        for (let k = start; k < end; k += 3) {
          cols[k] = r;
          cols[k + 1] = g;
          cols[k + 2] = bv;
        }
      }
      if (gl && b.colBuf) {
        gl.bindBuffer(gl.ARRAY_BUFFER, b.colBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, cols);
      }
    }
  }

  // ---- WebGL Frame Pass (Ocean + Graticule + Countries + Crisp Borders + Highlights) ----
  function drawWebGLGraticule(gl, solidProg, vw, vh, worldPx, shiftList, scaleX, scaleY) {
    const stepLat = mapState.zoom >= 3.2 ? 15 : 30;
    const stepLng = mapState.zoom >= 3.2 ? 15 : 30;
    const visU0 = mapState.centerU - (vw * 0.5) / worldPx;
    const visU1 = mapState.centerU + (vw * 0.5) / worldPx;
    const visV0 = mapState.centerV - (vh * 0.5) / worldPx;
    const visV1 = mapState.centerV + (vh * 0.5) / worldPx;

    const pts = [];
    for (let sIdx = 0; sIdx < shiftList.length; sIdx++) {
      const shift = shiftList[sIdx];
      for (let lng = -180; lng < 180; lng += stepLng) {
        const u = lng / 360 + shift;
        if (u < visU0 - 0.02 || u > visU1 + 0.02) continue;
        pts.push(u, visV0 - 0.02, u, visV1 + 0.02);
      }
    }
    for (let lat = -75; lat <= 75; lat += stepLat) {
      if (lat === 0) continue;
      const v = latLngToUV(lat, 0)[1];
      if (v < visV0 - 0.02 || v > visV1 + 0.02) continue;
      pts.push(visU0 - 0.02, v, visU1 + 0.02, v);
    }

    gl.useProgram(solidProg.prog);
    gl.enableVertexAttribArray(solidProg.aPos);
    gl.uniform2f(solidProg.uCam, mapState.centerU, mapState.centerV);
    gl.uniform2f(solidProg.uScale, scaleX, scaleY);

    if (pts.length > 0) {
      const arr = new Float32Array(pts);
      gl.bindBuffer(gl.ARRAY_BUFFER, mapState.gratBuf);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(solidProg.aPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform4f(solidProg.uColor, 56 / 255, 189 / 255, 248 / 255, 0.085);
      gl.drawArrays(gl.LINES, 0, pts.length / 2);
    }

    // Equator subtle accent line (segmented dashed on GPU)
    if (0 >= visV0 - 0.02 && 0 <= visV1 + 0.02) {
      const eqPts = [];
      const dashPeriod = 14 / worldPx;
      const dashLen = 6 / worldPx;
      for (let u = visU0; u < visU1; u += dashPeriod) {
        eqPts.push(u, 0, Math.min(visU1, u + dashLen), 0);
      }
      if (eqPts.length > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mapState.gratBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(eqPts), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(solidProg.aPos, 2, gl.FLOAT, false, 0, 0);
        gl.uniform4f(solidProg.uColor, 56 / 255, 189 / 255, 248 / 255, 0.16);
        gl.drawArrays(gl.LINES, 0, eqPts.length / 2);
      }
    }
  }

  function renderWebGL(vw, vh, targetW, targetH, worldPx, shiftList, stateSig, colorBy, isHistorical, eraId, filterState, selKey, highlightHex) {
    const gl = mapState.gl;
    if (!gl || !mapState.glUploaded || !mapState.programs) return;

    const progs = mapState.programs;
    const scaleX = worldPx / (vw * 0.5);
    const scaleY = worldPx / (vh * 0.5);

    gl.viewport(0, 0, targetW, targetH);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);

    // 1. Bathymetry Ocean Gradient Backdrop
    const eqNdcY = (mapState.centerV * worldPx) / (vh * 0.5);
    const spanNdcY = Math.max(1.1, (WORLD_HALF_V * worldPx) / (vh * 0.5));
    gl.disable(gl.BLEND);
    gl.useProgram(progs.ocean.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, mapState.quadBuf);
    gl.enableVertexAttribArray(progs.ocean.aPos);
    gl.vertexAttribPointer(progs.ocean.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(progs.ocean.uEqNdcY, eqNdcY);
    gl.uniform1f(progs.ocean.uSpanNdcY, spanNdcY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Enable standard alpha blending for graticule, border lines & selection wash
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 2. Graticule & Equator
    drawWebGLGraticule(gl, progs.solid, vw, vh, worldPx, shiftList, scaleX, scaleY);

    // 3. Ensure GPU vertex colors match active layer/era/filter
    syncFillColorsGPU(stateSig, colorBy, isHistorical, eraId, filterState);

    // 4. Country Fills (Triangulated Vector Batches - sharp at any zoom)
    gl.disable(gl.BLEND);
    gl.useProgram(progs.mesh.prog);
    gl.enableVertexAttribArray(progs.mesh.aPos);
    gl.enableVertexAttribArray(progs.mesh.aColor);
    gl.uniform2f(progs.mesh.uScale, scaleX, scaleY);

    const batches = mapState.fillBatches;
    for (let bi = 0; bi < batches.length; bi++) {
      const b = batches[bi];
      gl.bindBuffer(gl.ARRAY_BUFFER, b.posBuf);
      gl.vertexAttribPointer(progs.mesh.aPos, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.colBuf);
      gl.vertexAttribPointer(progs.mesh.aColor, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.idxBuf);

      for (let sIdx = 0; sIdx < shiftList.length; sIdx++) {
        gl.uniform2f(progs.mesh.uCam, mapState.centerU - shiftList[sIdx], mapState.centerV);
        gl.drawElements(gl.TRIANGLES, b.idxCount, gl.UNSIGNED_SHORT, 0);
      }
    }
    gl.disableVertexAttribArray(progs.mesh.aColor);

    // 5. Crisp 1px Hairline Borders (Exact match to 3D's #030712 @ 0.42 WebGL gl.LINES)
    gl.enable(gl.BLEND);
    gl.useProgram(progs.solid.prog);
    gl.enableVertexAttribArray(progs.solid.aPos);
    gl.uniform2f(progs.solid.uScale, scaleX, scaleY);

    if (mapState.edgeBuffer && mapState.edgeVertCount > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mapState.edgeBuffer);
      gl.vertexAttribPointer(progs.solid.aPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform4f(progs.solid.uColor, 3 / 255, 7 / 255, 18 / 255, 0.42);
      for (let sIdx = 0; sIdx < shiftList.length; sIdx++) {
        gl.uniform2f(progs.solid.uCam, mapState.centerU - shiftList[sIdx], mapState.centerV);
        gl.drawArrays(gl.LINES, 0, mapState.edgeVertCount);
      }
    }

    // 6. Hovered & Selected Country Highlights (Fill Wash + Crisp White/Quiz Outline)
    const drawHighlightSlice = (slice, fillRgba, lineRgba) => {
      if (!slice) return;
      const b = batches[slice.fillBatchIdx];
      const visU0 = mapState.centerU - (vw * 0.5) / worldPx;
      const visU1 = mapState.centerU + (vw * 0.5) / worldPx;

      for (let sIdx = 0; sIdx < shiftList.length; sIdx++) {
        const shift = shiftList[sIdx];
        if (slice.maxU + shift < visU0 || slice.minU + shift > visU1) continue;
        gl.uniform2f(progs.solid.uCam, mapState.centerU - shift, mapState.centerV);

        if (b && slice.iCount > 0 && fillRgba) {
          gl.bindBuffer(gl.ARRAY_BUFFER, b.posBuf);
          gl.vertexAttribPointer(progs.solid.aPos, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.idxBuf);
          gl.uniform4f(progs.solid.uColor, fillRgba[0], fillRgba[1], fillRgba[2], fillRgba[3]);
          gl.drawElements(gl.TRIANGLES, slice.iCount, gl.UNSIGNED_SHORT, slice.iStart * 2);
        }

        if (mapState.edgeBuffer && slice.edgeCount > 0 && lineRgba) {
          gl.bindBuffer(gl.ARRAY_BUFFER, mapState.edgeBuffer);
          gl.vertexAttribPointer(progs.solid.aPos, 2, gl.FLOAT, false, 0, 0);
          gl.uniform4f(progs.solid.uColor, lineRgba[0], lineRgba[1], lineRgba[2], lineRgba[3]);
          gl.drawArrays(gl.LINES, slice.edgeStart, slice.edgeCount);
        }
      }
    };

    if (mapState.hoveredKey && mapState.hoveredKey !== selKey) {
      drawHighlightSlice(
        mapState.sliceByKey.get(mapState.hoveredKey),
        [1, 1, 1, 0.14],
        [248 / 255, 250 / 255, 252 / 255, 0.65]
      );
    }

    if (selKey) {
      const selSlice = mapState.sliceByKey.get(selKey);
      const hRgb = parseHexRgb01(highlightHex);
      const washAlpha = E.state.quizHighlightIso ? 0.42 : 0.24;
      drawHighlightSlice(
        selSlice,
        [hRgb[0], hRgb[1], hRgb[2], washAlpha],
        [hRgb[0], hRgb[1], hRgb[2], 0.96]
      );
    }
  }

  // ---- HUD Overlay Canvas2D Pass (Microstate Dots, Animated Arcs & Beacon Pins) ----
  function drawArcs2d(ctx, vw, vh, worldPx, shiftList, now) {
    const arcs = mapState.arcs;
    const rings = mapState.rings;
    if (!E.state.showArcs || (!arcs.length && !rings.length)) return;

    const visU0 = mapState.centerU - (vw * 0.5) / worldPx;
    const visU1 = mapState.centerU + (vw * 0.5) / worldPx;
    const strokeScale = clamp(Math.sqrt(mapState.zoom), 0.9, 1.85);

    ctx.save();
    ctx.lineCap = 'round';

    for (let pass = 0; pass < 2; pass++) {
      const targetRole = pass === 0 ? 'rail' : 'pulse';
      for (let i = 0; i < arcs.length; i++) {
        const arc = arcs[i];
        if (arc._arcRole !== targetRole) continue;
        const [u0, v0] = latLngToUV(arc.startLat, arc.startLng);
        let dLng = Number(arc.endLng) - Number(arc.startLng);
        if (dLng > 180) dLng -= 360;
        if (dLng < -180) dLng += 360;
        const u1 = u0 + dLng / 360;
        const v1 = latLngToUV(arc.endLat, 0)[1];

        const minU = Math.min(u0, u1) - 0.14;
        const maxU = Math.max(u0, u1) + 0.14;
        const dxU = u1 - u0;
        const dyV = v1 - v0;
        const chordU = Math.hypot(dxU, dyV) || 1e-4;
        const nx = -dyV / chordU;
        const ny = dxU / chordU;
        const sign = ny <= 0.15 ? 1 : -1;
        const bend = clamp(chordU * 0.24 + 0.012, 0.014, 0.11) * sign;
        const cu = (u0 + u1) * 0.5 + nx * bend;
        const cv = (v0 + v1) * 0.5 + ny * bend;

        const c0 = (arc.colors && arc.colors[0]) || '#f59e0b';
        const c1 = (arc.colors && arc.colors[1]) || '#38bdf8';
        const sameCol = c0 === c1;
        ctx.lineWidth = (targetRole === 'rail' ? (arc.stroke || 0.44) * 3.1 : (arc.stroke || 0.8) * 3.0) * strokeScale;

        for (let sIdx = 0; sIdx < shiftList.length; sIdx++) {
          const shift = shiftList[sIdx];
          if (maxU + shift < visU0 || minU + shift > visU1) continue;

          const x0 = vw * 0.5 + (u0 + shift - mapState.centerU) * worldPx;
          const y0 = vh * 0.5 + (v0 - mapState.centerV) * worldPx;
          const x1 = vw * 0.5 + (u1 + shift - mapState.centerU) * worldPx;
          const y1 = vh * 0.5 + (v1 - mapState.centerV) * worldPx;
          const cx = vw * 0.5 + (cu + shift - mapState.centerU) * worldPx;
          const cy = vh * 0.5 + (cv - mapState.centerV) * worldPx;

          if (sameCol) {
            ctx.strokeStyle = c0;
          } else {
            const grad = ctx.createLinearGradient(x0, y0, x1, y1);
            grad.addColorStop(0, c0);
            grad.addColorStop(1, c1);
            ctx.strokeStyle = grad;
          }

          if (targetRole === 'rail') {
            ctx.globalAlpha = 0.48;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.quadraticCurveTo(cx, cy, x1, y1);
            ctx.stroke();
          } else {
            const approxPx = Math.max(40, Math.hypot(x1 - x0, y1 - y0) * 1.12);
            const dashFrac = clamp(arc.dashLength || 0.34, 0.16, 0.6);
            const gapFrac = clamp(arc.dashGap || 0.24, 0.12, 0.6);
            const dashPx = Math.max(10, approxPx * dashFrac);
            const gapPx = Math.max(8, approxPx * gapFrac);
            const period = dashPx + gapPx;
            const animMs = Math.max(600, arc.animateTime || 2000);
            const phase = ((now / animMs) + (arc.initialGap || 0)) % 1;
            ctx.globalAlpha = 0.96;
            ctx.setLineDash([dashPx, gapPx]);
            ctx.lineDashOffset = -phase * period;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.quadraticCurveTo(cx, cy, x1, y1);
            ctx.stroke();
          }
        }
      }
    }

    ctx.setLineDash([]);

    if (rings.length > 0) {
      const periodMs = 1750;
      ctx.lineWidth = 2;
      for (let i = 0; i < rings.length; i++) {
        const ring = rings[i];
        const [u, v] = latLngToUV(ring.lat, ring.lng);
        const phase = ((now + i * 240) % periodMs) / periodMs;
        const maxR = clamp((ring.radius || 4.5) * 4.2 * Math.sqrt(mapState.zoom), 10, 42);
        const rad = 3 + maxR * phase;
        const alpha = Math.max(0, 0.85 * (1 - phase));
        ctx.strokeStyle = ring.color || '#f59e0b';
        ctx.globalAlpha = alpha;

        for (let sIdx = 0; sIdx < shiftList.length; sIdx++) {
          const shift = shiftList[sIdx];
          const sx = vw * 0.5 + (u + shift - mapState.centerU) * worldPx;
          if (sx < -maxR || sx > vw + maxR) continue;
          const sy = vh * 0.5 + (v - mapState.centerV) * worldPx;
          ctx.beginPath();
          ctx.arc(sx, sy, rad, 0, TAU);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  function drawActivePins2d(ctx, vw, vh, worldPx, shiftList) {
    if (!E.pins || typeof E.pins.buildActivePinList !== 'function') return;
    const pins = E.pins.buildActivePinList();
    if (!pins || pins.length === 0) return;

    const selectedId = (E.state.activePinItem && E.state.activePinItem.id) || E.state.activeWordStopId || '';
    const hoveredId = (E.state.hoveredPinItem && E.state.hoveredPinItem.id) || '';

    ctx.save();
    for (let i = 0; i < pins.length; i++) {
      const p = pins[i];
      const item = p.item;
      if (!item) continue;
      const [u, v] = latLngToUV(item.lat, item.lng);
      const isSelected = Boolean(selectedId && item.id === selectedId);
      const isHovered = Boolean(hoveredId && item.id === hoveredId);
      const scale = (p.kind === 'word' ? 1.18 : 1.0) * (isSelected ? 1.32 : (isHovered ? 1.18 : 1.0));
      const baseR = (mapState.zoom >= 2.2 ? 5.2 : 4.2) * scale;
      const color = item.color || '#f59e0b';

      for (let sIdx = 0; sIdx < shiftList.length; sIdx++) {
        const shift = shiftList[sIdx];
        const sx = vw * 0.5 + (u + shift - mapState.centerU) * worldPx;
        if (sx < -20 || sx > vw + 20) continue;
        const sy = vh * 0.5 + (v - mapState.centerV) * worldPx;

        if (isSelected || isHovered) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, baseR + 3.8, 0, TAU);
          ctx.stroke();
        }
        ctx.fillStyle = '#060a12';
        ctx.beginPath();
        ctx.arc(sx, sy, baseR + 1.8, 0, TAU);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy, baseR, 0, TAU);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.15;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function renderHudOverlay(vw, vh, dpr, targetW, targetH, worldPx, shiftList, colorBy, isHistorical, eraId, filterState, selKey, highlightHex, ts) {
    const ctx = mapState.hudCtx;
    const hCanvas = mapState.hudCanvas;
    if (!ctx || !hCanvas) return;

    if (hCanvas.width !== targetW || hCanvas.height !== targetH) {
      hCanvas.width = targetW;
      hCanvas.height = targetH;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. Microstate Dots
    const dimHex = '#111a2e';
    const microList = mapState.microPxCache;
    const microR = mapState.zoom >= 2.2 ? 4.4 : 3.4;
    for (let i = 0; i < microList.length; i++) {
      const m = microList[i];
      const match = matchesFilter(m, filterState);
      const isSel = m.key === selKey;
      const isHov = m.key === mapState.hoveredKey;
      const dotCol = match ? resolveFillHex(m, colorBy, isHistorical, eraId) : dimHex;
      const r = isSel ? microR + 1.1 : microR;

      for (let sIdx = 0; sIdx < shiftList.length; sIdx++) {
        const shift = shiftList[sIdx];
        const sx = vw * 0.5 + (m.u + shift - mapState.centerU) * worldPx;
        if (sx < -16 || sx > vw + 16) continue;
        const sy = vh * 0.5 + (m.v - mapState.centerV) * worldPx;

        if (isSel || isHov) {
          ctx.strokeStyle = isSel ? highlightHex : '#e2e8f0';
          ctx.lineWidth = isSel ? 2.1 : 1.4;
          ctx.beginPath();
          ctx.arc(sx, sy, r + 2.8, 0, TAU);
          ctx.stroke();
        }
        ctx.fillStyle = '#060a12';
        ctx.beginPath();
        ctx.arc(sx, sy, r + 1.4, 0, TAU);
        ctx.fill();

        ctx.fillStyle = dotCol;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, TAU);
        ctx.fill();

        ctx.strokeStyle = match ? 'rgba(255, 255, 255, 0.7)' : 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    }

    // 2. Animated Arcs & Pulsing Rings
    drawArcs2d(ctx, vw, vh, worldPx, shiftList, ts);

    // 3. Hotspot & Word-Route Beacon Pins
    drawActivePins2d(ctx, vw, vh, worldPx, shiftList);
  }

  function renderFrame(now) {
    if (E.state.viewMode !== '2d' || !mapState.canvas) return;
    if (!mapState.geometryBuilt) buildGeometry();
    if (!mapState.glUploaded && mapState.gl) ensureGlUploaded();
    if (!mapState.gl) return;

    const ts = typeof now === 'number' ? now : performance.now();
    const { vw, vh } = getViewportDims();
    const dpr = E.utils && typeof E.utils.getTargetPixelRatio === 'function'
      ? Math.min(2.25, E.utils.getTargetPixelRatio())
      : Math.min(2, global.devicePixelRatio || 1);

    const targetW = Math.max(1, Math.round(vw * dpr));
    const targetH = Math.max(1, Math.round(vh * dpr));
    if (mapState.canvas.width !== targetW || mapState.canvas.height !== targetH) {
      mapState.canvas.width = targetW;
      mapState.canvas.height = targetH;
    }

    const worldPx = getWorldPx(vw, vh);
    clampCameraV(vw, vh);

    const visU0 = mapState.centerU - (vw * 0.5) / worldPx;
    const visU1 = mapState.centerU + (vw * 0.5) / worldPx;
    const firstShift = Math.floor(visU0 + 0.5) - 1;
    const lastShift = Math.ceil(visU1 - 0.5) + 1;
    const shiftList = [];
    for (let s = firstShift; s <= lastShift; s++) {
      if (0.5 + s >= visU0 - 0.05 && -0.5 + s <= visU1 + 0.05) {
        shiftList.push(s);
      }
    }
    if (shiftList.length === 0) shiftList.push(0);

    const colorBy = E.state.colorByMode || 'language';
    const eraId = E.state.activeTimeEra || 'today';
    const isHistorical = Boolean(eraId !== 'today' && global.WORLD_HISTORICAL_ERAS);
    const filterState = getActiveFilterState();
    const stateSig = buildDataSignature(colorBy, isHistorical, eraId, filterState);
    const selKey = E.state.quizHighlightIso || (E.state.selectedCountry ? E.geo.getCountryKey(E.state.selectedCountry) : '');
    const highlightHex = E.state.quizHighlightIso ? (E.state.quizHighlightColor || '#10b981') : '#ffffff';

    renderWebGL(vw, vh, targetW, targetH, worldPx, shiftList, stateSig, colorBy, isHistorical, eraId, filterState, selKey, highlightHex);
    renderHudOverlay(vw, vh, dpr, targetW, targetH, worldPx, shiftList, colorBy, isHistorical, eraId, filterState, selKey, highlightHex, ts);
  }

  // ---- Animation Loop, Momentum Pan & Cursor-Anchored Zoom ----
  function hasActiveAnimation() {
    const hasArcs = Boolean(E.state.showArcs && (mapState.arcs.length > 0 || mapState.rings.length > 0));
    const hasMotion = Boolean(
      mapState.flyAnim ||
      mapState.zoomAnim ||
      mapState.isMoving ||
      Math.abs(mapState.panVelU) > 1e-4 ||
      Math.abs(mapState.panVelV) > 1e-4
    );
    return hasArcs || hasMotion;
  }

  function ensureAnimLoop() {
    if (E.state.viewMode !== '2d') return;
    if (!hasActiveAnimation()) {
      if (mapState.animRafId) {
        cancelAnimationFrame(mapState.animRafId);
        mapState.animRafId = 0;
      }
      return;
    }
    if (mapState.animRafId || typeof requestAnimationFrame !== 'function') return;

    mapState.lastFrameTs = performance.now();

    const tick = (now) => {
      mapState.animRafId = 0;
      if (E.state.viewMode !== '2d') return;

      const dt = clamp((now - (mapState.lastFrameTs || now)) / 1000, 0.001, 0.05);
      mapState.lastFrameTs = now;

      let cameraMoved = false;
      const { vw, vh, left, top } = getViewportDims();

      if (mapState.flyAnim) {
        const fa = mapState.flyAnim;
        const t = clamp((now - fa.startTime) / fa.duration, 0, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        let du = fa.targetU - fa.startU;
        if (du > 0.5) du -= 1;
        if (du < -0.5) du += 1;
        mapState.centerU = wrapUnitU(fa.startU + du * ease);
        mapState.centerV = fa.startV + (fa.targetV - fa.startV) * ease;
        mapState.zoom = fa.startZoom + (fa.targetZoom - fa.startZoom) * ease;
        cameraMoved = true;
        if (t >= 1) {
          mapState.flyAnim = null;
          mapState.isMoving = false;
        }
      }

      if (mapState.zoomAnim) {
        const za = mapState.zoomAnim;
        const alpha = 1 - Math.exp(-34 * dt);
        const prevZ = mapState.zoom;
        const nextZ = Math.abs(za.targetZoom - prevZ) < 0.005
          ? za.targetZoom
          : (prevZ + (za.targetZoom - prevZ) * alpha);

        if (typeof za.anchorClientX === 'number' && typeof za.anchorClientY === 'number') {
          const basePx = getBaseWorldPx(vw, vh);
          const worldPxOld = basePx * prevZ;
          const worldPxNew = basePx * nextZ;
          const dxPx = (za.anchorClientX - left) - vw * 0.5;
          const dyPx = (za.anchorClientY - top) - vh * 0.5;
          const anchorU = mapState.centerU + dxPx / worldPxOld;
          const anchorV = mapState.centerV + dyPx / worldPxOld;
          mapState.centerU = wrapUnitU(anchorU - dxPx / worldPxNew);
          mapState.centerV = anchorV - dyPx / worldPxNew;
        }

        mapState.zoom = nextZ;
        clampCameraV(vw, vh);
        cameraMoved = true;
        mapState.lastMotionTs = now;

        if (Math.abs(za.targetZoom - nextZ) < 0.0025) {
          mapState.zoom = za.targetZoom;
          mapState.zoomAnim = null;
        }
      }

      if (Math.abs(mapState.panVelU) > 1e-4 || Math.abs(mapState.panVelV) > 1e-4) {
        mapState.centerU = wrapUnitU(mapState.centerU + mapState.panVelU * dt);
        mapState.centerV += mapState.panVelV * dt;
        clampCameraV(vw, vh);
        const damp = Math.exp(-9.5 * dt);
        mapState.panVelU *= damp;
        mapState.panVelV *= damp;
        if (Math.hypot(mapState.panVelU, mapState.panVelV) < 0.006) {
          mapState.panVelU = 0;
          mapState.panVelV = 0;
        }
        cameraMoved = true;
        mapState.lastMotionTs = now;
      }

      if (mapState.isMoving && !mapState.flyAnim && !mapState.zoomAnim &&
          Math.abs(mapState.panVelU) <= 1e-4 && Math.abs(mapState.panVelV) <= 1e-4 &&
          (now - mapState.lastMotionTs) >= 85) {
        mapState.isMoving = false;
        if (E.overlays) E.overlays.markOverlaysDirty(true);
      } else if (cameraMoved && E.overlays) {
        E.overlays.markOverlaysDirty(true);
      }

      renderFrame(now);
      if (hasActiveAnimation()) {
        mapState.animRafId = requestAnimationFrame(tick);
      }
    };
    mapState.animRafId = requestAnimationFrame(tick);
  }

  function requestRedraw() {
    if (E.state.viewMode !== '2d') return;
    if (typeof requestAnimationFrame !== 'function') return;
    if (mapState.animRafId) return;
    if (mapState.redrawRafId) return;
    mapState.redrawRafId = requestAnimationFrame((now) => {
      mapState.redrawRafId = 0;
      renderFrame(now);
    });
  }

  function noteMotion() {
    mapState.lastMotionTs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    mapState.isMoving = true;
    ensureAnimLoop();
  }

  function setPov(pov, ms = 0) {
    if (!pov) return;
    mapState.zoomAnim = null;
    mapState.panVelU = 0;
    mapState.panVelV = 0;
    const targetLat = pov.lat != null && Number.isFinite(+pov.lat) ? +pov.lat : uvToLatLng(mapState.centerU, mapState.centerV).lat;
    const targetLng = pov.lng != null && Number.isFinite(+pov.lng) ? +pov.lng : uvToLatLng(mapState.centerU, mapState.centerV).lng;
    const targetZoom = pov.zoom != null && Number.isFinite(+pov.zoom)
      ? clamp(+pov.zoom, MIN_ZOOM, MAX_ZOOM)
      : (pov.altitude != null && Number.isFinite(+pov.altitude) ? altitudeToZoom(+pov.altitude) : mapState.zoom);

    const [targetU, targetV] = latLngToUV(targetLat, targetLng);
    const { vw, vh } = getViewportDims();

    if (!ms || ms <= 0 || E.state.viewMode !== '2d' || typeof performance === 'undefined') {
      mapState.flyAnim = null;
      mapState.isMoving = false;
      mapState.centerU = targetU;
      mapState.centerV = targetV;
      mapState.zoom = targetZoom;
      clampCameraV(vw, vh);
      if (E.state.viewMode === '2d') {
        requestRedraw();
        if (E.overlays) E.overlays.markOverlaysDirty(true);
      }
      return;
    }

    mapState.flyAnim = {
      startU: mapState.centerU,
      startV: mapState.centerV,
      startZoom: mapState.zoom,
      targetU,
      targetV,
      targetZoom,
      startTime: performance.now(),
      duration: Math.min(820, Math.max(180, ms))
    };
    mapState.isMoving = true;
    mapState.lastMotionTs = performance.now();
    ensureAnimLoop();
  }

  function zoomBy(factor, anchorClientX, anchorClientY, ms = 160) {
    const { vw, vh, left, top } = getViewportDims();
    const baseZoom = mapState.flyAnim
      ? mapState.flyAnim.targetZoom
      : (mapState.zoomAnim ? mapState.zoomAnim.targetZoom : mapState.zoom);
    const nextZoom = clamp(baseZoom * factor, MIN_ZOOM, MAX_ZOOM);

    if (!ms || ms <= 0) {
      mapState.flyAnim = null;
      mapState.zoomAnim = null;
      if (typeof anchorClientX === 'number' && typeof anchorClientY === 'number') {
        const basePx = getBaseWorldPx(vw, vh);
        const worldPxOld = basePx * mapState.zoom;
        const worldPxNew = basePx * nextZoom;
        const dxPx = (anchorClientX - left) - vw * 0.5;
        const dyPx = (anchorClientY - top) - vh * 0.5;
        const anchorU = mapState.centerU + dxPx / worldPxOld;
        const anchorV = mapState.centerV + dyPx / worldPxOld;
        mapState.centerU = wrapUnitU(anchorU - dxPx / worldPxNew);
        mapState.centerV = anchorV - dyPx / worldPxNew;
      }
      mapState.zoom = nextZoom;
      clampCameraV(vw, vh);
      noteMotion();
      requestRedraw();
      if (E.overlays) E.overlays.markOverlaysDirty(true);
      return;
    }

    mapState.flyAnim = null;
    mapState.panVelU = 0;
    mapState.panVelV = 0;
    mapState.zoomAnim = {
      targetZoom: nextZoom,
      anchorClientX,
      anchorClientY
    };
    noteMotion();
  }

  function resetView(ms = 400) {
    const { vw, vh } = getViewportDims();
    setPov({ lat: DEFAULT_CENTER_LAT, lng: DEFAULT_CENTER_LNG, zoom: getDefaultZoom(vw, vh) }, ms);
  }

  function pickTargetAtScreen2d(clientX, clientY, isTouch = false) {
    const geo = screenToLatLng(clientX, clientY);
    if (!geo) return null;
    const { vw, vh, left, top } = getViewportDims();
    const lx = clientX - left;
    const ly = clientY - top;

    if (!E.state.isQuizActive && E.pins && typeof E.pins.pickPinAtLatLng === 'function') {
      const altEquiv = getEquivAltitude();
      const pinHit = E.pins.pickPinAtLatLng(geo.lat, geo.lng, altEquiv, isTouch);
      if (pinHit) return pinHit;
    }

    const threshPx = isTouch ? 18 : 11;
    const threshSq = threshPx * threshPx;
    let bestMicro = null;
    let bestSq = threshSq;
    const micros = mapState.microPxCache;
    for (let i = 0; i < micros.length; i++) {
      const m = micros[i];
      const [sx, sy] = projectLatLngToScreen(m.lat, m.lng, vw, vh);
      const dx = lx - sx;
      const dy = ly - sy;
      const dSq = dx * dx + dy * dy;
      if (dSq <= bestSq) {
        bestSq = dSq;
        bestMicro = m.country;
      }
    }
    if (bestMicro) return bestMicro;

    const feat = E.geo.lookupFeatureAtLatLng(geo.lat, geo.lng);
    return feat ? (feat.__country || E.geo.getCountryData(feat.properties) || { name: feat.properties.name }) : null;
  }

  function setArcsData(arcs, rings) {
    mapState.arcs = Array.isArray(arcs) ? arcs : [];
    mapState.rings = Array.isArray(rings) ? rings : [];
    if (E.state.viewMode === '2d') {
      ensureAnimLoop();
      requestRedraw();
    }
  }

  function syncViewModeUI() {
    const is2d = E.state.viewMode === '2d';
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.toggle('view-2d', is2d);
    }
    if (E.elements.map2dContainer) {
      E.elements.map2dContainer.setAttribute('aria-hidden', is2d ? 'false' : 'true');
    }
    if (E.elements.globeViz) {
      E.elements.globeViz.setAttribute('aria-hidden', is2d ? 'true' : 'false');
    }
    if (E.elements.viewModeSwitch) {
      E.elements.viewModeSwitch.querySelectorAll('.view-mode-btn').forEach((btn) => {
        const active = btn.getAttribute('data-view-mode') === E.state.viewMode;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
  }

  function setViewMode(mode, opts = {}) {
    const next = mode === '2d' ? '2d' : '3d';
    const prev = E.state.viewMode || '3d';
    E.state.viewMode = next;
    E.state.pendingZoomAlt = null;

    if (next === prev && !opts.force) {
      syncViewModeUI();
      return;
    }

    const globe = E.state.globe;

    if (next === '2d') {
      if (!mapState.geometryBuilt) buildGeometry();
      const { vw, vh } = getViewportDims();
      const defZoom = getDefaultZoom(vw, vh);

      if (globe && typeof globe._rawPointOfView === 'function' && !opts.preserve2dCamera) {
        const cur3d = globe._rawPointOfView();
        if (cur3d && Number.isFinite(cur3d.lat) && Number.isFinite(cur3d.lng)) {
          const defAlt = (E.utils && typeof E.utils.getDefaultAltitude === 'function')
            ? E.utils.getDefaultAltitude()
            : 2.5;
          const nearDefault = !E.state.selectedCountry && Math.abs((cur3d.altitude || defAlt) - defAlt) < 0.35;
          setPov({
            lat: nearDefault ? DEFAULT_CENTER_LAT : cur3d.lat,
            lng: nearDefault ? DEFAULT_CENTER_LNG : cur3d.lng,
            zoom: nearDefault ? defZoom : altitudeToZoom(cur3d.altitude)
          }, 0);
        }
      }
      if (globe && typeof globe.pauseAnimation === 'function' && E.renderBatch && E.renderBatch.merged) {
        globe.pauseAnimation();
      }
      E.tooltip.hideTooltip();
      syncViewModeUI();
      ensureAnimLoop();
      requestRedraw();
    } else {
      if (mapState.animRafId) {
        cancelAnimationFrame(mapState.animRafId);
        mapState.animRafId = 0;
      }
      mapState.flyAnim = null;
      mapState.zoomAnim = null;
      mapState.panVelU = 0;
      mapState.panVelV = 0;
      mapState.isMoving = false;
      mapState.hoveredKey = '';

      if (globe) {
        const pov = getPov();
        if (typeof globe.resumeAnimation === 'function') {
          globe.resumeAnimation();
        }
        if (typeof globe._rawPointOfView === 'function') {
          globe._rawPointOfView({ lat: pov.lat, lng: pov.lng, altitude: pov.altitude }, 0);
        }
        const controls = typeof globe.controls === 'function' ? globe.controls() : null;
        if (controls) {
          controls.autoRotate = Boolean(E.state.isRotating && !E.state.isQuizActive);
          controls.update();
        }
      }
      E.tooltip.hideTooltip();
      syncViewModeUI();
    }

    if (E.overlays) {
      E.overlays.refreshOverlayHudRects();
      E.overlays.markOverlaysDirty(true);
    }
    if (!opts.skipRouter && E.router && typeof E.router.syncUrlHash === 'function') {
      E.router.syncUrlHash();
    }
  }

  function bindCanvasEvents() {
    if (mapState.eventsBound || !mapState.canvas) return;
    mapState.eventsBound = true;
    const canvas = mapState.canvas;

    const activePointers = new Map();
    let downX = 0, downY = 0;
    let lastPanX = 0, lastPanY = 0;
    let downType = 'mouse';
    let isDragging = false;
    let pinchLastDist = 0;
    let hoverRafId = 0;
    let hoverClientX = 0, hoverClientY = 0;
    let hoverActive = false;
    let velSampleX = 0, velSampleY = 0, velSampleTs = 0;
    let smoothedVx = 0, smoothedVy = 0;

    const flushHover = () => {
      hoverRafId = 0;
      if (!hoverActive || activePointers.size > 0 || isDragging || E.state.viewMode !== '2d') return;
      const hit = pickTargetAtScreen2d(hoverClientX, hoverClientY, false);
      const nextKey = hit && !hit.__isPin ? E.geo.getCountryKey(hit) : '';
      if (nextKey !== mapState.hoveredKey) {
        mapState.hoveredKey = nextKey;
        requestRedraw();
      }
      if (hit && hit.__isPin && typeof E.tooltip.showTooltipForPin === 'function') {
        E.tooltip.setGlobeCursor('pointer');
        E.tooltip.showTooltipForPin(hit, hoverClientX, hoverClientY);
      } else if (hit) {
        E.tooltip.setGlobeCursor('pointer');
        E.tooltip.showTooltipForCountry(hit, hoverClientX, hoverClientY);
      } else {
        E.tooltip.hideTooltip();
      }
    };

    const scheduleHover = () => {
      if (!hoverRafId && typeof requestAnimationFrame === 'function') {
        hoverRafId = requestAnimationFrame(flushHover);
      }
    };

    const cancelHover = () => {
      hoverActive = false;
      if (hoverRafId && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(hoverRafId);
        hoverRafId = 0;
      }
    };

    canvas.addEventListener('pointerdown', (e) => {
      if (e.button === 2) return;
      mapState.flyAnim = null;
      mapState.zoomAnim = null;
      mapState.panVelU = 0;
      mapState.panVelV = 0;
      smoothedVx = 0;
      smoothedVy = 0;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      cancelHover();
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      }
      if (activePointers.size === 2) {
        const pts = Array.from(activePointers.values());
        pinchLastDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
        lastPanX = (pts[0].x + pts[1].x) * 0.5;
        lastPanY = (pts[0].y + pts[1].y) * 0.5;
        isDragging = true;
        E.tooltip.hideTooltip();
        return;
      }
      isDragging = false;
      downX = lastPanX = velSampleX = e.clientX;
      downY = lastPanY = velSampleY = e.clientY;
      velSampleTs = performance.now();
      downType = e.pointerType || 'mouse';
    }, { passive: true });

    canvas.addEventListener('pointermove', (e) => {
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const { vw, vh } = getViewportDims();
        const worldPx = getWorldPx(vw, vh);

        if (activePointers.size === 2) {
          const pts = Array.from(activePointers.values());
          const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1;
          const midX = (pts[0].x + pts[1].x) * 0.5;
          const midY = (pts[0].y + pts[1].y) * 0.5;

          const panDx = midX - lastPanX;
          const panDy = midY - lastPanY;
          mapState.centerU = wrapUnitU(mapState.centerU - panDx / worldPx);
          mapState.centerV -= panDy / worldPx;
          clampCameraV(vw, vh);

          const scaleFactor = clamp(dist / Math.max(10, pinchLastDist), 0.75, 1.35);
          zoomBy(scaleFactor, midX, midY, 0);

          pinchLastDist = dist;
          lastPanX = midX;
          lastPanY = midY;
          isDragging = true;
          return;
        }

        if (activePointers.size === 1) {
          const totalDx = e.clientX - downX;
          const totalDy = e.clientY - downY;
          const dragThreshSq = downType === 'touch' ? 144 : 16;
          if (!isDragging && (totalDx * totalDx + totalDy * totalDy > dragThreshSq)) {
            isDragging = true;
            E.tooltip.hideTooltip();
            E.tooltip.setGlobeCursor('grabbing');
          }
          if (isDragging) {
            const dx = e.clientX - lastPanX;
            const dy = e.clientY - lastPanY;
            mapState.centerU = wrapUnitU(mapState.centerU - dx / worldPx);
            mapState.centerV -= dy / worldPx;
            clampCameraV(vw, vh);

            const now = performance.now();
            const dtMs = now - velSampleTs;
            if (dtMs >= 8) {
              const dtSec = dtMs / 1000;
              const instVx = (e.clientX - velSampleX) / dtSec;
              const instVy = (e.clientY - velSampleY) / dtSec;
              smoothedVx = smoothedVx * 0.45 + instVx * 0.55;
              smoothedVy = smoothedVy * 0.45 + instVy * 0.55;
              velSampleX = e.clientX;
              velSampleY = e.clientY;
              velSampleTs = now;
            }

            lastPanX = e.clientX;
            lastPanY = e.clientY;
            noteMotion();
            if (E.overlays) E.overlays.markOverlaysDirty(true);
          }
        }
        return;
      }

      if ((e.pointerType || 'mouse') === 'touch') return;
      hoverClientX = e.clientX;
      hoverClientY = e.clientY;
      hoverActive = true;
      scheduleHover();
    }, { passive: true });

    const finishPointer = (e, isCancel) => {
      const wasTracked = activePointers.delete(e.pointerId);
      if (canvas.releasePointerCapture) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      if (activePointers.size === 1) {
        const rem = Array.from(activePointers.values())[0];
        lastPanX = rem.x;
        lastPanY = rem.y;
      }
      const isPrimary = (e.pointerType || downType) !== 'mouse' || e.button === 0;
      if (!isCancel && isPrimary && wasTracked && activePointers.size === 0 && !isDragging) {
        const isTouch = (e.pointerType || downType) === 'touch';
        if (E.utils.isMobileViewport() && E.state.isLegendExpandedMobile) {
          E.state.isLegendExpandedMobile = false;
          E.controls.syncLegendResponsiveUI();
        }
        const hit = pickTargetAtScreen2d(e.clientX, e.clientY, isTouch);
        if (E.state.isQuizActive && E.quiz && typeof E.quiz.handleGlobePick === 'function') {
          E.quiz.handleGlobePick(hit);
        } else if (hit && hit.__isPin && E.pins) {
          E.pins.openPinInspector(hit);
        } else if (hit && hit.languages) {
          E.drawer.selectCountry(hit);
        } else if (isTouch && E.utils.isBottomSheetLayout() && E.state.selectedCountry) {
          E.drawer.closeCountryDrawer();
        }
      } else if (!isCancel && isDragging && activePointers.size === 0) {
        const sinceLastMove = performance.now() - velSampleTs;
        if (sinceLastMove < 75 && Math.hypot(smoothedVx, smoothedVy) > 95) {
          const { vw, vh } = getViewportDims();
          const worldPx = getWorldPx(vw, vh);
          mapState.panVelU = clamp(-smoothedVx / worldPx, -1.6, 1.6);
          mapState.panVelV = clamp(-smoothedVy / worldPx, -1.2, 1.2);
          noteMotion();
        }
      }
      if (activePointers.size === 0) {
        isDragging = false;
        pinchLastDist = 0;
        smoothedVx = 0;
        smoothedVy = 0;
        E.tooltip.setGlobeCursor('grab');
      }
    };

    canvas.addEventListener('pointerup', (e) => finishPointer(e, false), { passive: true });
    canvas.addEventListener('pointercancel', (e) => finishPointer(e, true), { passive: true });

    canvas.addEventListener('pointerleave', () => {
      cancelHover();
      if (mapState.hoveredKey) {
        mapState.hoveredKey = '';
        requestRedraw();
      }
      E.tooltip.hideTooltip();
    }, { passive: true });

    canvas.addEventListener('wheel', (e) => {
      if (E.state.viewMode !== '2d') return;
      if (e.cancelable) e.preventDefault();
      cancelHover();
      E.tooltip.hideTooltip();
      const rawDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const step = clamp(-rawDelta * 0.0046, -0.56, 0.56);
      const factor = Math.exp(step);
      zoomBy(factor, e.clientX, e.clientY, 105);
    }, { passive: false });

    canvas.addEventListener('dblclick', (e) => {
      if (E.state.viewMode !== '2d') return;
      zoomBy(1.75, e.clientX, e.clientY, 200);
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  function initMap2d() {
    if (mapState.initialized) return;
    mapState.initialized = true;

    const el = E.elements;
    const { vw, vh } = getViewportDims();
    mapState.zoom = getDefaultZoom(vw, vh);
    mapState.canvas = el.map2dCanvas || document.getElementById('map2dCanvas');
    mapState.hudCanvas = el.map2dHudCanvas || document.getElementById('map2dHudCanvas');
    if (mapState.hudCanvas && typeof mapState.hudCanvas.getContext === 'function') {
      mapState.hudCtx = mapState.hudCanvas.getContext('2d');
    }
    if (mapState.canvas && typeof mapState.canvas.getContext === 'function') {
      const glOpts = {
        antialias: true,
        alpha: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance'
      };
      mapState.gl = mapState.canvas.getContext('webgl', glOpts) || mapState.canvas.getContext('experimental-webgl', glOpts);
      bindCanvasEvents();
    }

    if (el.viewModeSwitch) {
      el.viewModeSwitch.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest('.view-mode-btn[data-view-mode]');
        if (!btn) return;
        const targetMode = btn.getAttribute('data-view-mode');
        if (targetMode) setViewMode(targetMode);
      });
    }

    syncViewModeUI();
  }

  function isReady() {
    return Boolean(mapState.geometryBuilt);
  }

  E.map2d = {
    mapState,
    latLngToUV,
    uvToLatLng,
    altitudeToZoom,
    zoomToAltitude,
    getPov,
    setPov,
    zoomBy,
    resetView,
    getOverlayCameraState,
    projectLatLngToScreen,
    screenToLatLng,
    pickTargetAtScreen2d,
    setArcsData,
    setViewMode,
    syncViewModeUI,
    requestRedraw,
    renderFrame,
    isReady,
    initMap2d,
    _earcutUV: earcutUV,
    _extractCleanRingUV: extractCleanRingUV
  };
})(window);
