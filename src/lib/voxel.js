import * as THREE from 'three';
import { human2 } from './human2.js';
import { solidHuman } from './overlap.js';
import { M, canvasTex, rng, noise1, clamp } from './util.js';

// ---------- 16x16 pixel-art block textures (drawn 8px per texel, mipmapped so they stay clean) ----------
const PX = 8;
function pix(key, fn) {
  return canvasTex('vx_' + key, 16 * PX, 16 * PX, (g) => { const r = rng(key.length * 7 + key.charCodeAt(0)); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { g.fillStyle = fn(x, y, r()); g.fillRect(x * PX, y * PX, PX, PX); } }, { repeat: [1, 1] });
}
const shade = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
const T = {
  grassTop: () => pix('grassTop', (x, y, r) => shade('#6aa83a', 0.85 + r * 0.3)),
  grassSide: () => pix('grassSide', (x, y, r) => (y < 3 + ((x * 7) % 3 === 0 ? 1 : 0) ? shade('#6aa83a', 0.85 + r * 0.3) : shade('#8a5e3a', 0.8 + r * 0.35))),
  dirt: () => pix('dirt', (x, y, r) => shade('#8a5e3a', 0.8 + r * 0.35)),
  stone: () => pix('stone', (x, y, r) => shade('#8a8a8e', 0.8 + r * 0.3)),
  log: () => pix('log', (x, y, r) => shade(x % 4 === 0 ? '#4a321e' : '#6a4a2a', 0.85 + r * 0.25)),
  logTop: () => pix('logTop', (x, y, r) => { const d = Math.hypot(x - 7.5, y - 7.5); return d > 7 ? shade('#5a3e22', 0.9) : shade(Math.floor(d) % 2 ? '#b8915a' : '#a07a48', 0.9 + r * 0.15); }),
  leaves: () => pix('leaves', (x, y, r) => shade('#3a7a2a', 0.65 + r * 0.5)),
  plank: () => pix('plank', (x, y, r) => shade(y % 4 === 3 ? '#7a5a32' : '#b48a52', 0.88 + r * 0.2)),
  gold: () => pix('gold', (x, y, r) => (x === 0 || y === 0 || x === 15 || y === 15 ? '#c8961a' : shade('#ffd23a', 0.88 + r * 0.24))),
  gem: () => pix('gem', (x, y, r) => (r > 0.86 ? '#7af0ff' : shade('#8a8a8e', 0.8 + r * 0.3))),
  sand: () => pix('sand', (x, y, r) => shade('#e2d09a', 0.9 + r * 0.18)),
  water: () => pix('water', (x, y, r) => shade('#3a6ad8', 0.85 + r * 0.25)),
};
const matCache = {};
export function blockMats(type) {
  if (matCache[type]) return matCache[type];
  const S = (t, o = {}) => M.std({ map: T[t](), roughness: 0.9, ...o });
  let m;
  switch (type) {
    case 'grass': { const s = S('grassSide'); m = [s, s, S('grassTop'), S('dirt'), s, s]; break; }
    case 'log': { const s = S('log'); m = [s, s, S('logTop'), S('logTop'), s, s]; break; }
    case 'leaves': m = S('leaves'); break;
    case 'gold': m = M.std({ map: T.gold(), roughness: 0.3, metalness: 0.7, emissive: '#5a3a00', emissiveIntensity: 0.25 }); break;
    case 'water': m = M.std({ map: T.water(), roughness: 0.2, transparent: true, opacity: 0.85 }); break;
    default: m = S(type);
  }
  matCache[type] = m; return m;
}
const unit = new THREE.BoxGeometry(1, 1, 1);
export function block(type = 'grass', s = 1) { const b = new THREE.Mesh(unit, blockMats(type)); b.scale.setScalar(s); b.castShadow = true; b.receiveShadow = true; return b; }

// instanced terrain: columns of dirt topped with grass on an n×n grid, height from smooth noise.
// grow(t, cx, cz, speed) pops blocks in by distance from (cx, cz).
export function terrain(n = 24, { seed = 1, s = 1, amp = 2.5, base = 0, flat = 0, types = null } = {}) {
  const g = new THREE.Group(); const cols = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = (i - n / 2 + 0.5) * s, z = (j - n / 2 + 0.5) * s; const d = Math.hypot(x, z);
    let h = Math.round(base + amp * (0.5 + 0.5 * noise1(i * 0.21, seed) * noise1(j * 0.19, seed + 4) + 0.3 * noise1((i + j) * 0.13, seed + 9)));
    if (d < flat) h = base; h = Math.max(0, h);
    cols.push({ x, z, h, d });
  }
  const count = (k) => cols.reduce((a, c) => a + (k === 'grass' ? 1 : c.h), 0);
  const grass = new THREE.InstancedMesh(unit, blockMats((types && types.top) || 'grass'), count('grass'));
  const dirt = new THREE.InstancedMesh(unit, blockMats((types && types.under) || 'dirt'), Math.max(1, count('dirt')));
  [grass, dirt].forEach((m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); });
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const place = (t = 1e9, cx = 0, cz = 0, speed = 8, start = 0) => {
    let gi = 0, di = 0;
    for (const c of cols) {
      const k = clamp((t - start - Math.hypot(c.x - cx, c.z - cz) / speed) / 0.35); const e = k <= 0 ? 0 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
      const v = Math.max(0.0001, Math.min(1.08, e)) * s; sc.set(v, v, v); const drop = (1 - clamp(k * 1.3)) * 2 * s;
      p.set(c.x, (c.h + 0.5) * s - s + drop, c.z); grass.setMatrixAt(gi++, mtx.compose(p, q, sc));
      for (let y = 0; y < c.h; y++) { p.set(c.x, (y + 0.5) * s - s + drop, c.z); dirt.setMatrixAt(di++, mtx.compose(p, q, sc)); }
    }
    grass.instanceMatrix.needsUpdate = true; dirt.instanceMatrix.needsUpdate = true;
  };
  place();
  g.userData = { cols, grow: place, heightAt: (x, z) => { let best = null, bd = 1e9; for (const c of cols) { const d = Math.hypot(c.x - x, c.z - z); if (d < bd) { bd = d; best = c; } } return best ? best.h * s : 0; } };
  return g;
}
export function voxTree(s = 1, h = 4, seed = 1) {
  const g = new THREE.Group(); const r = rng(seed);
  for (let y = 0; y < h; y++) { const b = block('log', s); b.position.set(0, (y + 0.5) * s, 0); g.add(b); }
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) for (let y = h - 2; y <= h + 1; y++) {
    const edge = Math.abs(x) === 2 || Math.abs(z) === 2; if (y > h - 1 && edge) continue; if (y === h + 1 && (Math.abs(x) + Math.abs(z) > 1)) continue; if (x === 0 && z === 0 && y < h) continue; if (edge && Math.abs(x) === Math.abs(z) && r() > 0.4) continue;
    const b = block('leaves', s); b.position.set(x * s, (y + 0.5) * s, z * s); g.add(b);
  }
  return g;
}
// blocky screen image (for monitors): sky, sun, stepped hills of grass blocks
export function voxelDraw(g, w, h, t) {
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#6aa8f0'); sky.addColorStop(1, '#bfe0ff'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  const B = Math.round(w / 16); g.fillStyle = '#fff2a0'; g.fillRect(w * 0.75, h * 0.12, B * 1.5, B * 1.5);
  const off = (t * 20) % B;
  for (let i = -1; i < 18; i++) {
    const col = Math.floor(i + t * 20 / B); const hh = 3 + Math.round(2 * Math.sin(col * 0.7) + Math.sin(col * 0.31) * 1.5);
    const x = i * B - off;
    for (let k = 0; k < hh; k++) { const y = h - (k + 1) * B; g.fillStyle = k === hh - 1 ? '#5ea032' : (k < 2 ? '#7a7a80' : '#8a5e3a'); g.fillRect(x, y, B - 1, B - 1); }
    if (col % 7 === 0) { const ty = h - hh * B; g.fillStyle = '#6a4a2a'; g.fillRect(x, ty - 3 * B, B - 1, 3 * B); g.fillStyle = '#3a7a2a'; g.fillRect(x - B, ty - 5 * B, 3 * B - 1, 2 * B - 1); }
  }
}

// ---------- characters ----------
export const vx = {
  dev: (name = 'dev') => solidHuman(human2({ skin: '#f2cdb0', hair: '#5a3a22', hairStyle: 'short', beard: true, top: 'hoodie', topColor: '#3a3a46', pants: 'jeans', pantsColor: '#2a3a5a', shoes: '#222', eyeColor: '#3a5a7a', bulk: 1.05, belly: 0.02 }), name),
};
