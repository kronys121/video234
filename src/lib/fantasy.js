import * as THREE from 'three';
import { M, TEX, canvasTex, labelTex, rng, speckle, lerp, clamp, V } from './util.js';
import { box, rbox } from './props.js';
import { sign, fire, point } from './env.js';
import { roundedBox } from './gameboy.js';

const sh = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
export const snowTex = (rep = [20, 20]) => canvasTex('snow', 512, 512, (g, w, h) => { g.fillStyle = '#e6edf5'; g.fillRect(0, 0, w, h); speckle(g, w, h, 5000, ['#d2dce8', '#f8fbff', '#c8d4e2'], 0.8, 2.5, 3, 0.5); }, { repeat: rep });
const n2 = (x, z) => Math.sin(x * 0.21) * Math.cos(z * 0.17) + 0.5 * Math.sin(x * 0.53 + z * 0.37) + 0.25 * Math.cos(x * 1.1 - z * 0.9);

// snowy terrain; flat (y=0) inside radius `flat`, rolling outside. heightAt(x,z) for placing things.
export function snowField(size = 220, flat = 8, seed = 1) {
  const g = new THREE.PlaneGeometry(size, size, 120, 120); const p = g.attributes.position;
  const H = (x, z) => { const d = Math.hypot(x, z); return d < flat ? 0 : n2(x + seed, z) * 1.6 * clamp((d - flat) / 12) + Math.max(0, d - 40) * 0.25; };
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, H(x, -y)); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, M.std({ map: snowTex([30, 30]), roughness: 0.95, color: '#d6e0ec' })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  m.userData.heightAt = H; return m;
}
export function pine(h = 6, seed = 1) {
  const g = new THREE.Group(); const r = rng(seed);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, h * 0.35, 8), M.col('#4a3424', 0.9)); tr.position.y = h * 0.17; g.add(tr);
  const green = M.col('#1f4a34', 0.9), snow = M.col('#eef3f8', 0.8);
  for (let i = 0; i < 4; i++) { const rr = h * (0.3 - i * 0.055), y = h * (0.3 + i * 0.17);
    const c = new THREE.Mesh(new THREE.ConeGeometry(rr, h * 0.32, 10), green); c.position.y = y; c.rotation.y = r() * 3; g.add(c);
    const s = new THREE.Mesh(new THREE.ConeGeometry(rr * 0.75, h * 0.12, 10), snow); s.position.y = y + h * 0.1; g.add(s); }
  return sh(g);
}
export function rock(s = 1, seed = 1, col = '#7a7f86') {
  const geo = new THREE.IcosahedronGeometry(s, 1); const p = geo.attributes.position; const r = rng(seed);
  for (let i = 0; i < p.count; i++) { const k = 0.8 + r() * 0.35; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k * 0.75, p.getZ(i) * k); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, M.std({ map: TEX.concrete([1, 1], col), roughness: 0.9, flatShading: true })); return sh(m);
}
export function mountain(r = 30, h = 40, seed = 1) {
  const geo = new THREE.ConeGeometry(r, h, 14, 6); const p = geo.attributes.position; const rr = rng(seed);
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < h / 2 - 0.1) { const k = 0.82 + rr() * 0.3; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); } }
  geo.computeVertexNormals();
  const cols = []; for (let i = 0; i < p.count; i++) { const t = (p.getY(i) + h / 2) / h; const c = new THREE.Color(t > 0.55 ? '#f2f6fa' : '#5a6474'); cols.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true })); m.position.y = h / 2; return m;
}
export function campfire() {
  const g = new THREE.Group(); const wood = M.col('#4a3020', 0.9);
  for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.8, 8), wood); l.rotation.set(Math.PI / 2 - 0.35, i / 5 * Math.PI * 2, 0); l.position.set(Math.cos(i / 5 * Math.PI * 2) * 0.18, 0.12, Math.sin(i / 5 * Math.PI * 2) * 0.18); g.add(l); }
  for (let i = 0; i < 9; i++) { const st = rock(0.12, i + 3, '#5a5a5a'); st.position.set(Math.cos(i / 9 * Math.PI * 2) * 0.48, 0.05, Math.sin(i / 9 * Math.PI * 2) * 0.48); g.add(st); }
  const f = fire(0.7, 4); f.position.y = 0.05; g.add(f); g.userData.fire = f;
  const l = new THREE.PointLight('#ff9a4a', 12, 9, 1.6); l.position.y = 0.9; g.add(l); g.userData.light = l;
  return sh(g);
}
export function woodSign(text, w = 1.3, { lines = null, size = 110 } = {}) {
  const g = new THREE.Group();
  const post = box(0.1, 1.5, 0.1, M.col('#5a3a20', 0.9), 0, 0.75, 0, g);
  const plank = rbox(w, w * 0.42, 0.06, 0.015, M.std({ map: TEX.plywood([1, 1], '#9a7044'), roughness: 0.85 }), 0, 1.35, 0.06, g);
  const s = sign(text, { width: w * 0.9, color: '#2a1608', size, pad: 18, lines, grunge: 0.3 }); s.position.set(0, 1.35, 0.095); g.add(s);
  void post; void plank; return sh(g);
}
export function runestone(text, h = 2.2) {
  const g = new THREE.Group();
  const geo = roundedBox(1.1, h, 0.35, 0.08, [6, 10, 3]); const p = geo.attributes.position; const r = rng(4);
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (1 - Math.max(0, p.getY(i)) / h * 0.25) + (r() - 0.5) * 0.02);
  geo.computeVertexNormals();
  const st = new THREE.Mesh(geo, M.std({ color: '#6a6e74', roughness: 0.85, flatShading: false })); st.position.y = h / 2; g.add(st);
  const t = sign(text, { width: 0.9, color: '#9fd6ff', size: 120, pad: 16, emissive: 0.9 }); t.position.set(0, h * 0.6, 0.18); g.add(t);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.col('#f2f6fa', 0.8)); cap.scale.set(1.1, 0.25, 0.5); cap.position.y = h - 0.02; g.add(cap);
  return sh(g);
}
export function bucket(s = 1) {
  const g = new THREE.Group();
  const staves = canvasTex('staves', 256, 128, (c, w, h) => { c.fillStyle = '#9a6a3a'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 21) { c.fillStyle = x % 42 ? '#8a5c30' : '#a8743f'; c.fillRect(x, 0, 19, h); c.fillStyle = '#5a3a1a'; c.fillRect(x + 19, 0, 2, h); } speckle(c, w, h, 600, ['rgba(60,30,10,0.25)'], 0.5, 1.5, 2); }, { repeat: [2, 1] });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.28, 24, 1, true), M.std({ map: staves, roughness: 0.8, side: THREE.DoubleSide })); wall.position.y = 0.14; g.add(wall);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.14, 24), M.col('#7a5230', 0.8)); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.005; g.add(bottom);
  for (const [y, r] of [[0.05, 0.146], [0.23, 0.165]]) { const b = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 30), M.col('#3a3a3a', 0.4, 0.8)); b.rotation.x = Math.PI / 2; b.position.y = y; g.add(b); }
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.006, 6, 24, Math.PI), M.col('#3a3a3a', 0.4, 0.8)); hd.position.y = 0.28; g.add(hd);
  g.scale.setScalar(s); return sh(g);
}
export function potion(color = '#c0304a', s = 1) {
  const g = new THREE.Group();
  const glass = new THREE.MeshStandardMaterial({ color, roughness: 0.1, metalness: 0.1, emissive: color, emissiveIntensity: 0.35, transparent: true, opacity: 0.85 });
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), glass); b.position.y = 0.06; g.add(b);
  const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.06, 10), glass); nk.position.y = 0.13; g.add(nk);
  const ck = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.018, 0.025, 10), M.col('#8a6a4a', 0.9)); ck.position.y = 0.17; g.add(ck);
  g.scale.setScalar(s); return sh(g);
}
export function cheese() { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 22), M.col('#e8c04a', 0.6)); c.position.y = 0.05; g.add(c); const r = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 6, 24), M.col('#c8a03a', 0.6)); r.rotation.x = Math.PI / 2; r.position.y = 0.05; g.add(r); return sh(g); }
export function sword() { const g = new THREE.Group(); const bl = box(0.04, 0.6, 0.008, M.col('#c8ced6', 0.25, 0.9), 0, 0.42, 0, g); const gd = box(0.16, 0.025, 0.03, M.col('#8a6a2a', 0.4, 0.7), 0, 0.11, 0, g); const hl = box(0.03, 0.1, 0.03, M.col('#4a2a1a', 0.7), 0, 0.05, 0, g); void bl; void gd; void hl; return sh(g); }
export function coinPile(n = 12, seed = 2) { const g = new THREE.Group(); const r = rng(seed); const gm = M.col('#ffc83a', 0.25, 0.9, { emissive: '#7a5000', emissiveIntensity: 0.25 }); for (let i = 0; i < n; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 14), gm); c.position.set((r() - 0.5) * 0.14, 0.004 + i * 0.006, (r() - 0.5) * 0.14); c.rotation.set((r() - 0.5) * 0.4, 0, (r() - 0.5) * 0.4); g.add(c); } return sh(g); }
export function barrel(s = 1) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.8, 20), M.std({ map: TEX.plywood([2, 1], '#8a5c30'), roughness: 0.8 })); b.position.y = 0.4; g.add(b); for (const y of [0.12, 0.68]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.012, 6, 26), M.col('#333', 0.4, 0.8)); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); } g.scale.setScalar(s); return sh(g); }
export function sack(col = '#b8a07a') { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), M.std({ map: TEX.fabric([2, 2], col), roughness: 1 })); b.scale.set(1, 1.15, 0.9); b.position.y = 0.24; g.add(b); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.12, 12), b.material); t.position.y = 0.5; g.add(t); return sh(g); }

// shop shelf with goods; returns items (each a Group already placed) for loot animations
export function shelfUnit(w = 1.8, h = 2.0, d = 0.4, seed = 3) {
  const g = new THREE.Group(); const wood = M.std({ map: TEX.plywood([1, 2], '#7a5232'), roughness: 0.8 });
  box(0.05, h, d, wood, -w / 2, h / 2, 0, g); box(0.05, h, d, wood, w / 2, h / 2, 0, g); box(w, h, 0.03, wood, 0, h / 2, -d / 2, g);
  const levels = [0.45, 0.95, 1.45, 1.92]; levels.forEach((y) => box(w, 0.04, d, wood, 0, y, 0, g));
  const r = rng(seed); const items = [];
  const cols = ['#c0304a', '#2a8ad0', '#3ab05a', '#d0a020', '#8a3ad0'];
  levels.slice(0, 3).forEach((y, li) => { for (let x = -w / 2 + 0.18; x < w / 2 - 0.1; x += 0.24) {
    const k = r(); const it = k < 0.55 ? potion(cols[Math.floor(r() * cols.length)], 0.9) : k < 0.75 ? cheese() : k < 0.9 ? coinPile(8, Math.floor(r() * 99)) : potion('#e8e0a0', 1.1);
    it.position.set(x + (r() - 0.5) * 0.04, y + 0.02, (r() - 0.5) * 0.06); g.add(it); items.push(it); } });
  return { group: sh(g), items };
}
export function counter(w = 2.2) {
  const g = new THREE.Group(); const wood = M.std({ map: TEX.plywood([3, 1], '#6a4428'), roughness: 0.75 });
  box(w, 0.95, 0.6, wood, 0, 0.475, 0, g); rbox(w + 0.1, 0.06, 0.7, 0.015, M.std({ map: TEX.plywood([3, 1], '#8a5a34'), roughness: 0.6 }), 0, 0.98, 0, g);
  return sh(g);
}
export const timberTex = (rep = [3, 1.5]) => canvasTex('timber', 512, 512, (c, w, h) => { c.fillStyle = '#d8c8a4'; c.fillRect(0, 0, w, h); speckle(c, w, h, 3000, ['#c8b892', '#e4d6b6'], 0.6, 2, 5, 0.6); c.fillStyle = '#4a2e1a'; c.fillRect(0, 0, 36, h); c.fillRect(w - 36, 0, 36, h); c.fillRect(0, h * 0.45, w, 30); c.save(); c.translate(w / 2, h * 0.45); c.rotate(0.7); c.fillRect(-14, -h * 0.6, 28, h * 1.2); c.restore(); }, { repeat: rep });

// cute bug mascot (beetle). angry=true: red and spiky
export function beetle({ color = '#3fae4a', angry = false, s = 1 } = {}) {
  const g = new THREE.Group(); const shell = M.col(angry ? '#d4213a' : color, 0.3, 0.2), dark = M.col('#1a1a1a', 0.5);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 26, 18), shell); body.scale.set(1, 0.7, 1.25); body.position.y = 0.2; g.add(body);
  const line = box(0.012, 0.16, 0.5, dark, 0, 0.29, 0.0, g); void line;
  for (let i = 0; i < 4; i++) { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), dark); sp.scale.y = 0.3; sp.position.set((i % 2 ? 1 : -1) * 0.1, 0.33, -0.1 + Math.floor(i / 2) * 0.16); g.add(sp); }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), dark); head.position.set(0, 0.2, 0.27); g.add(head);
  const eyes = [];
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), M.col('#ffffff', 0.2)); e.position.set(0.055 * sx, 0.25, 0.36); g.add(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), dark); p.position.set(0.055 * sx, 0.25, 0.405); g.add(p); eyes.push(p);
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6), dark); ant.position.set(0.05 * sx, 0.36, 0.32); ant.rotation.set(0.6, 0, -0.35 * sx); g.add(ant);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), angry ? dark : M.col(color, 0.3)); tip.position.set(0.085 * sx, 0.44, 0.38); g.add(tip);
    if (angry) { const brow = box(0.07, 0.015, 0.02, dark, 0.055 * sx, 0.305, 0.395, g); brow.rotation.z = -0.5 * sx; }
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 14, Math.PI), M.col(angry ? '#ffffff' : '#ff8aa0', 0.5)); mouth.position.set(0, 0.17, 0.385); mouth.rotation.z = angry ? 0 : Math.PI; g.add(mouth);
  if (angry) for (let i = 0; i < 7; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 8), dark); const a = i / 7 * Math.PI; sp.position.set(Math.cos(a) * 0.2, 0.25 + Math.sin(a) * 0.12, -0.1 + (i % 2) * 0.12); sp.rotation.z = a - Math.PI / 2; g.add(sp); }
  const legs = [];
  for (let i = 0; i < 6; i++) { const sx = i % 2 ? 1 : -1; const piv = new THREE.Group(); piv.position.set(0.17 * sx, 0.13, -0.15 + Math.floor(i / 2) * 0.15); const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.14, 3, 6), dark); l.position.set(0.06 * sx, -0.05, 0); l.rotation.z = 0.9 * sx; piv.add(l); g.add(piv); legs.push(piv); }
  g.userData = { legs, eyes };
  g.scale.setScalar(s); return sh(g);
}
export function walkBug(b, t, speed = 10) { b.userData.legs.forEach((l, i) => { l.rotation.y = Math.sin(t * speed + i * 2.1) * 0.35; }); }
export function wrench(s = 1) {
  const g = new THREE.Group(); const m = M.col('#b8bec6', 0.25, 0.9);
  box(0.09, 0.9, 0.04, m, 0, 0, 0, g);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.045, 10, 22, Math.PI * 1.45), m); hd.position.y = 0.52; hd.rotation.z = -Math.PI * 0.22; g.add(hd);
  const grip = box(0.11, 0.35, 0.06, M.col('#d4213a', 0.5), 0, -0.3, 0, g); void grip;
  g.scale.setScalar(s); return sh(g);
}
export function hammer(s = 1) { const g = new THREE.Group(); box(0.05, 0.7, 0.05, M.col('#7a5232', 0.7), 0, 0, 0, g); rbox(0.28, 0.12, 0.12, 0.02, M.col('#5a6068', 0.3, 0.9), 0, 0.38, 0, g); g.scale.setScalar(s); return sh(g); }
export function glassDome(r = 0.5) {
  const g = new THREE.Group();
  const d = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#dff0ff', transparent: true, opacity: 0.18, roughness: 0.02, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide }));
  d.scale.y = 1.25; g.add(d);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 8, 40), M.col('#c8a24a', 0.3, 0.9)); rim.rotation.x = Math.PI / 2; g.add(rim);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), M.col('#c8a24a', 0.3, 0.9)); knob.position.y = r * 1.25; g.add(knob);
  return g;
}
export function pedestal(w = 0.9, h = 0.9) { const g = new THREE.Group(); rbox(w, h, w, 0.03, M.col('#efe9df', 0.4), 0, h / 2, 0, g); rbox(w + 0.1, 0.06, w + 0.1, 0.02, M.col('#c8a24a', 0.3, 0.9), 0, h + 0.03, 0, g); return sh(g); }
export function gauge(label = 'ВЕСЕЛЬЕ') {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 48, 0, Math.PI), M.std({ map: canvasTex('gauge', 512, 256, (c, w, h) => {
    c.fillStyle = '#f4efe4'; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h, R = h * 0.92;
    for (let i = 0; i < 60; i++) { const a = Math.PI + i / 60 * Math.PI; c.strokeStyle = `hsl(${i * 2},80%,48%)`; c.lineWidth = 34; c.beginPath(); c.arc(cx, cy, R - 22, a, a + Math.PI / 58); c.stroke(); }
    c.fillStyle = '#222'; c.font = '34px Russo'; c.textAlign = 'center'; c.fillText(label, cx, cy - R * 0.42);
  }, { repeat: [1, 1] }), roughness: 0.6 }));
  g.add(face);
  const frame = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 8, 40, Math.PI), M.col('#3a3a42', 0.4, 0.7)); g.add(frame);
  box(1.05, 0.05, 0.05, M.col('#3a3a42', 0.4, 0.7), 0, 0, 0, g);
  const needle = new THREE.Group(); const nm = box(0.025, 0.42, 0.02, M.col('#1a1a1a', 0.4), 0, 0.2, 0.02, needle); void nm; g.add(needle);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16), M.col('#1a1a1a', 0.4)); hub.rotation.x = Math.PI / 2; hub.position.z = 0.03; g.add(hub);
  g.userData.needle = needle; // rotation.z: +1.5 (left, red) … -1.5 (right, green)
  return sh(g);
}
export function gameBox(title = 'FANTASY', sub = 'ИГРА ГОДА') {
  const cover = canvasTex('cover' + title, 300, 420, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a2a44'); gr.addColorStop(0.6, '#4a6a8a'); gr.addColorStop(1, '#e8eef4'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#2a3446'; c.beginPath(); c.moveTo(0, h * 0.75); c.lineTo(w * 0.3, h * 0.45); c.lineTo(w * 0.55, h * 0.65); c.lineTo(w * 0.8, h * 0.4); c.lineTo(w, h * 0.7); c.lineTo(w, h); c.lineTo(0, h); c.fill();
    c.fillStyle = '#f2f6fa'; c.beginPath(); c.moveTo(w * 0.3, h * 0.45); c.lineTo(w * 0.37, h * 0.5); c.lineTo(w * 0.24, h * 0.52); c.fill();
    c.fillStyle = '#e8d8a8'; c.font = '52px Russo'; c.textAlign = 'center'; c.fillText(title, w / 2, h * 0.16); c.font = '24px Russo'; c.fillStyle = '#ffffff'; c.fillText(sub, w / 2, h * 0.24);
  }, { repeat: [1, 1] });
  const side = M.col('#1a2a44', 0.5);
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.06), [side, side, side, side, M.std({ map: cover, roughness: 0.45 }), side]);
  const g = new THREE.Group(); g.add(m); return sh(g);
}
export function armchair(col = '#7a2a3a') {
  const g = new THREE.Group(); const f = M.std({ map: TEX.fabric([2, 2], col), roughness: 0.95 });
  rbox(0.8, 0.4, 0.75, 0.08, f, 0, 0.3, 0, g); rbox(0.8, 0.7, 0.2, 0.08, f, 0, 0.75, -0.3, g);
  for (const x of [-0.42, 0.42]) rbox(0.16, 0.55, 0.75, 0.06, f, x, 0.42, 0, g);
  for (const x of [-0.32, 0.32]) for (const z of [-0.28, 0.28]) box(0.05, 0.1, 0.05, M.col('#2a1a10', 0.5), x, 0.05, z, g);
  return sh(g);
}
export function lightStand(color = '#fff1dc') {
  const g = new THREE.Group(); const m = M.col('#1a1a1a', 0.4, 0.6);
  for (let i = 0; i < 3; i++) { const l = box(0.025, 0.5, 0.025, m, Math.cos(i * 2.1) * 0.18, 0.2, Math.sin(i * 2.1) * 0.18, g); l.rotation.set(Math.sin(i * 2.1) * 0.6, 0, -Math.cos(i * 2.1) * 0.6); }
  box(0.03, 1.6, 0.03, m, 0, 1.0, 0, g);
  const hd = rbox(0.4, 0.3, 0.12, 0.02, m, 0, 1.85, 0, g); void hd;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.26), M.emis(color, 2.5)); panel.position.set(0, 1.85, 0.065); g.add(panel);
  return sh(g);
}
export function tripodCam() {
  const g = new THREE.Group(); const m = M.col('#1a1a1a', 0.4, 0.6);
  for (let i = 0; i < 3; i++) { const l = box(0.025, 1.3, 0.025, m, Math.cos(i * 2.1) * 0.22, 0.62, Math.sin(i * 2.1) * 0.22, g); l.rotation.set(Math.sin(i * 2.1) * 0.33, 0, -Math.cos(i * 2.1) * 0.33); }
  rbox(0.22, 0.2, 0.42, 0.03, M.col('#26262c', 0.4, 0.5), 0, 1.35, 0, g);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.16, 18), M.col('#111', 0.3, 0.6)); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.35, 0.28); g.add(lens);
  const rec = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), M.emis('#ff2a2a', 4)); rec.position.set(0.08, 1.47, 0.15); g.add(rec);
  return sh(g);
}
export function sofa(col = '#3a5a7a') {
  const g = new THREE.Group(); const f = M.std({ map: TEX.fabric([2, 1], col), roughness: 0.95 });
  rbox(2.0, 0.42, 0.9, 0.08, f, 0, 0.28, 0, g); rbox(2.0, 0.6, 0.22, 0.08, f, 0, 0.72, -0.36, g);
  for (const x of [-1.05, 1.05]) rbox(0.2, 0.58, 0.9, 0.08, f, x, 0.42, 0, g);
  for (const x of [-0.48, 0.48]) rbox(0.9, 0.14, 0.7, 0.06, M.std({ map: TEX.fabric([1, 1], col), roughness: 1, color: '#dddddd' }), x, 0.55, 0.06, g);
  return sh(g);
}
export function warTable() {
  const g = new THREE.Group();
  const map = canvasTex('wmap', 512, 340, (c, w, h) => {
    c.fillStyle = '#d8c49a'; c.fillRect(0, 0, w, h); speckle(c, w, h, 2000, ['#c4ae84', '#e4d4ae'], 0.6, 2, 7, 0.6);
    c.strokeStyle = '#7a5a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(40, 300); c.bezierCurveTo(120, 150, 250, 280, 330, 120); c.bezierCurveTo(380, 60, 450, 90, 480, 40); c.stroke();
    c.fillStyle = '#6a8a5a'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(60 + i * 50, 80 + (i * 73 % 180), 22, 0, 7); c.fill(); }
    c.fillStyle = '#7a8aa0'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(80 + i * 70, 260); c.lineTo(110 + i * 70, 200); c.lineTo(140 + i * 70, 260); c.fill(); }
    c.strokeStyle = '#c0302a'; c.lineWidth = 5; c.setLineDash([12, 8]); c.beginPath(); c.moveTo(70, 270); c.lineTo(220, 170); c.lineTo(420, 110); c.stroke();
  }, { repeat: [1, 1] });
  rbox(2.2, 0.1, 1.5, 0.03, M.std({ map: TEX.plywood([2, 1], '#5a3a20'), roughness: 0.7 }), 0, 0.9, 0, g);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.32), M.std({ map: map, roughness: 0.9 })); top.rotation.x = -Math.PI / 2; top.position.y = 0.952; g.add(top);
  for (const x of [-0.95, 0.95]) for (const z of [-0.6, 0.6]) box(0.1, 0.9, 0.1, M.col('#3a2414', 0.8), x, 0.45, z, g);
  const pieces = [];
  const cols = ['#c0302a', '#2a5ab0', '#c0302a', '#2a5ab0', '#d8a020'];
  [[-0.7, 0.4], [-0.3, 0.1], [0.2, -0.2], [0.55, -0.35], [0.8, 0.3]].forEach(([x, z], i) => { const p = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.05, 14), M.col(cols[i], 0.4)); b.position.y = 0.025; p.add(b); const f = box(0.012, 0.22, 0.012, M.col('#3a2414', 0.6), 0, 0.15, 0, p); void f; const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), M.col(cols[i], 0.6, 0, { side: THREE.DoubleSide })); fl.position.set(0.06, 0.22, 0); p.add(fl); p.position.set(x, 0.952, z); g.add(p); pieces.push(p); });
  g.userData.pieces = pieces;
  return sh(g);
}
export function questionMark(color = '#ffd21f') { return sign('?', { width: 0.32, color: '#1a1a1a', bg: color, size: 200, pad: 18, border: '#1a1a1a', emissive: 0.4 }); }
export function heart(s = 0.2) {
  const sh2 = new THREE.Shape(); sh2.moveTo(0, -0.5); sh2.bezierCurveTo(-0.9, 0.1, -0.5, 0.75, 0, 0.35); sh2.bezierCurveTo(0.5, 0.75, 0.9, 0.1, 0, -0.5);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh2, { depth: 0.2, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 3 }), M.col('#ff3a6a', 0.35, 0, { emissive: '#ff3a6a', emissiveIntensity: 0.4 }));
  m.scale.setScalar(s); return m;
}
export { V, point };
