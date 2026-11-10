// src/globe/bathymetry.js - Procedural Ocean Bathymetry Texture & Globe Surface Lighting
(function (global) {
  'use strict';

  const E = (global.Earthlingo = global.Earthlingo || {});

  let surfaceConfigured = false;

  function resetSurfaceFlag() {
    surfaceConfigured = false;
  }

  function createOceanBathymetryDataUrl() {
    try {
      const w = 2048;
      const h = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0.0, '#050a14');
      grad.addColorStop(0.18, '#071021');
      grad.addColorStop(0.42, '#0a162d');
      grad.addColorStop(0.50, '#0d1d38');
      grad.addColorStop(0.58, '#0a162d');
      grad.addColorStop(0.84, '#060e1e');
      grad.addColorStop(1.0, '#050a14');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Soft pelagic basin highlights for subtle cartographic bathymetry under directional lighting
      const basins = [
        [w * 0.19, h * 0.48, w * 0.22, 'rgba(56, 189, 248, 0.055)'],
        [w * 0.42, h * 0.45, w * 0.16, 'rgba(59, 130, 246, 0.045)'],
        [w * 0.72, h * 0.56, w * 0.17, 'rgba(56, 189, 248, 0.048)'],
        [w * 0.32, h * 0.74, w * 0.20, 'rgba(14, 165, 233, 0.035)'],
        [w * 0.85, h * 0.42, w * 0.18, 'rgba(56, 189, 248, 0.042)']
      ];
      for (const [bx, by, br, col] of basins) {
        const rg = ctx.createRadialGradient(bx, by, br * 0.06, bx, by, br);
        rg.addColorStop(0, col);
        rg.addColorStop(1, 'rgba(7, 11, 20, 0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      return canvas.toDataURL('image/png');
    } catch (e) {
      return null;
    }
  }

  function configureGlobeSurface() {
    const globe = E.state.globe;
    if (!globe) return;
    try {
      const globeMat = globe.globeMaterial();
      const renderer = globe.renderer();
      if (globeMat) {
        if (!globeMat.map && globeMat.color) {
          globeMat.color.set('#081020');
        }
        if (globeMat.specular) globeMat.specular.set('#224675');
        globeMat.shininess = 18;
        if (globeMat.emissive) globeMat.emissive.set('#020611');
        globeMat.emissiveIntensity = 0.55;
        globeMat.polygonOffset = true;
        globeMat.polygonOffsetFactor = 3.0;
        globeMat.polygonOffsetUnits = 3.0;
        if (globeMat.map) {
          const maxAniso = renderer && renderer.capabilities ? renderer.capabilities.getMaxAnisotropy() : 4;
          globeMat.map.anisotropy = Math.min(8, maxAniso || 4);
          globeMat.map.needsUpdate = true;
        }
        globeMat.needsUpdate = true;
      }

      const scene = globe.scene();
      const rb = E.renderBatch;
      if (scene) {
        for (let i = 0; i < scene.children.length; i++) {
          const obj = scene.children[i];
          if (
            obj &&
            obj.isLineSegments &&
            obj !== rb.lineMesh &&
            obj !== rb.highlightLine &&
            obj.geometry &&
            obj.geometry.type === 'GeoJsonGeometry'
          ) {
            if (obj.material) {
              obj.material.color.set('#38bdf8');
              obj.material.transparent = true;
              obj.material.opacity = 0.085;
              obj.material.depthWrite = false;
              obj.material.needsUpdate = true;
            }
            obj.scale.setScalar(1.0006);
            obj.renderOrder = 1;
            obj.raycast = () => {};
          }
        }
      }

      if (!surfaceConfigured && typeof globe.lights === 'function') {
        const lights = globe.lights();
        if (Array.isArray(lights) && lights.length >= 2) {
          if (lights[0]) lights[0].intensity = 1.95;
          if (lights[1]) {
            lights[1].intensity = 2.05;
            if (lights[1].position) lights[1].position.set(1.2, 0.85, 1.45);
          }
          surfaceConfigured = true;
        }
      }
    } catch (e) {
      console.warn('Globe surface setup:', e);
    }
  }

  E.bathymetry = {
    createOceanBathymetryDataUrl,
    configureGlobeSurface,
    resetSurfaceFlag
  };
})(window);

