import * as THREE from 'three';
import { M, TEX, canvasTex, rng } from './util.js';
import { box } from './props.js';

// simple room shell: floor, 3-4 walls, ceiling. returns group
export function room({ w = 6, d = 10, h = 3, floor = null, wall = null, ceil = null, open = ['front'], cx = 0, cz = 0 } = {}) {
  const g = new THREE.Group();
  const fm = floor || M.std({ map: TEX.plywood([3, 5], '#8a6a45'), roughness: 0.8 });
  const wm = wall || M.std({ map: TEX.plywood([3, 1.5], '#b58c5c'), roughness: 0.85 });
  const cm = ceil || M.std({ map: TEX.plywood([3, 5], '#7a5c3c'), roughness: 0.9 });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), fm); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; g.add(f);
  const c = new THREE.Mesh(new THREE.PlaneGeometry(w, d), cm); c.rotation.x = Math.PI / 2; c.position.y = h; c.receiveShadow = true; g.add(c);
  const walls = {
    back: [w, h, 0, h / 2, -d / 2, 0], front: [w, h, 0, h / 2, d / 2, Math.PI],
    left: [d, h, -w / 2, h / 2, 0, Math.PI / 2], right: [d, h, w / 2, h / 2, 0, -Math.PI / 2],
  };
  for (const [k, [ww, hh, x, y, z, ry]] of Object.entries(walls)) {
    if (open.includes(k)) continue;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), wm); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; g.add(m);
  }
  g.position.set(cx, 0, cz);
  return g;
}

export function usFlag(w = 1.5) {
  const tex = canvasTex('usflag', 380, 200, (g, W, H) => {
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f4f1ea' : '#b22234'; g.fillRect(0, i * H / 13, W, H / 13 + 1); }
    g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, W * 0.4, H * 7 / 13);
    g.fillStyle = '#fff';
    for (let r = 0; r < 9; r++) for (let c = 0; c < (r % 2 ? 5 : 6); c++) { g.beginPath(); g.arc(8 + c * 25 + (r % 2 ? 12 : 0), 7 + r * 11.5, 3, 0, 7); g.fill(); }
  }, { repeat: [1, 1] });
  const geo = new THREE.PlaneGeometry(w, w * 0.53, 16, 4);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 5) * 0.03);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M.std({ map: tex, roughness: 0.9, side: THREE.DoubleSide }));
  m.receiveShadow = true; return m;
}

export function calendar(title = 'ЯНВАРЬ', year = '1991') {
  const tex = canvasTex('cal' + title + year, 240, 320, (g, W, H) => {
    g.fillStyle = '#f2ede2'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#b3261e'; g.fillRect(0, 0, W, 70);
    g.fillStyle = '#fff'; g.font = '34px Russo'; g.textAlign = 'center'; g.fillText(title, W / 2, 34); g.font = '26px Russo'; g.fillText(year, W / 2, 62);
    g.fillStyle = '#333'; g.font = '18px Russo';
    for (let d = 0; d < 31; d++) { const x = 22 + (d % 7) * 32, y = 100 + Math.floor(d / 7) * 40; g.fillText(String(d + 1), x, y); if (d < 16) { g.strokeStyle = '#b3261e'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 10, y - 14); g.lineTo(x + 10, y + 4); g.stroke(); } }
  }, { repeat: [1, 1] });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.48), M.std({ map: tex, roughness: 0.8 }));
  m.receiveShadow = true; return m;
}

// wooden studs / beams detail along walls
export function beams(w, d, h, mat, step = 1.2) {
  const g = new THREE.Group();
  for (let z = -d / 2; z <= d / 2; z += step) {
    box(0.1, 0.14, w, mat, 0, h - 0.07, z, g).rotation.y = Math.PI / 2;
    box(0.08, h, 0.1, mat, -w / 2 + 0.05, h / 2, z, g); box(0.08, h, 0.1, mat, w / 2 - 0.05, h / 2, z, g);
  }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

export function rng2(s) { return rng(s); }
