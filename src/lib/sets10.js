import * as THREE from 'three';
import { human3 } from './human3.js';
import { solidHuman } from './overlap.js';
import { M, TEX, canvasTex, rng, V } from './util.js';
import { box, rbox } from './props.js';
import { sign } from './env.js';
import { shadows } from './shot.js';

export const cast10 = {
  dev: (n = 'dev') => solidHuman(human3({ skin: '#eccaa8', hair: '#3a2416', hairStyle: 'short', top: 'tshirt', topColor: '#2a4a7a', pants: 'jeans', shoes: '#e8e4dc', eyeColor: '#3a5a7a' }), n),
  dev2: (n = 'dev2') => solidHuman(human3({ skin: '#d8a882', hair: '#1a1210', hairStyle: 'short', glasses: true, top: 'hoodie', topColor: '#7a3a2a', pants: 'jeans', pantsColor: '#2a2e38', shoes: '#2a2a2a', eyeColor: '#2a1a10' }), n),
  coder: (n = 'coder') => solidHuman(human3({ skin: '#f0cfb2', hair: '#2a1a12', hairStyle: 'short', top: 'longsleeve', topColor: '#3a3a44', pants: 'jeans', pantsColor: '#2a3448', shoes: '#e8e4dc', eyeColor: '#3a4a5a' }), n),
  exec: (n = 'exec') => solidHuman(human3({ skin: '#e6c4a2', hair: '#2a2420', hairStyle: 'short', glasses: true, top: 'jacket', topColor: '#22262e', pants: 'slacks', pantsColor: '#22252c', shoes: '#111', dress: true, tie: '#2a4a8a', eyeColor: '#2a1a10' }), n),
};

// generic grey 90s disc console: flat box, round lid, two ports, power/reset buttons
export function console10(s = 1) {
  const g = new THREE.Group(); const grey = M.col('#b8b8bc', 0.55), dark = M.col('#7a7a80', 0.5);
  rbox(1.0, 0.22, 0.75, 0.04, grey, 0, 0.11, 0, g);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 48), dark); lid.position.set(-0.12, 0.232, -0.05); g.add(lid); g.userData.lid = lid;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.008, 6, 48), M.col('#5a5a60', 0.4)); ring.rotation.x = Math.PI / 2; ring.position.set(-0.12, 0.244, -0.05); g.add(ring);
  for (const x of [0.28, 0.4]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 20), dark); b.position.set(x, 0.23, 0.1); g.add(b); }
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), M.emis('#3aff6a', 3)); led.position.set(0.34, 0.225, 0.2); g.add(led);
  for (const x of [-0.2, 0.2]) box(0.16, 0.06, 0.02, M.col('#3a3a40', 0.5), x, 0.08, 0.376, g);
  g.scale.setScalar(s); return shadows(g);
}
export function ramChip(label = '2 МБ', col = '#2a6a3a') {
  const g = new THREE.Group(); rbox(0.9, 0.05, 0.35, 0.01, M.col(col, 0.5), 0, 0.025, 0, g);
  for (let i = 0; i < 4; i++) rbox(0.16, 0.04, 0.2, 0.008, M.col('#18181c', 0.4), -0.3 + i * 0.2, 0.07, 0, g);
  for (let i = 0; i < 14; i++) box(0.03, 0.01, 0.05, M.col('#e8c070', 0.2, 0.9), -0.39 + i * 0.06, 0.03, 0.17, g);
  const s = sign(label, { width: 0.4, color: '#ffffff', bg: '#d4213a', size: 110, pad: 14 }); s.position.set(0, 0.2, 0.05); s.rotation.x = -0.3; g.add(s); g.userData.label = s;
  return shadows(g);
}
// a square slice of jungle level (grass top, dirt sides, a tree or crate on top)
export function levelChunk(seed = 1, s = 1, label = '') {
  const g = new THREE.Group(); const r = rng(seed);
  const top = M.std({ map: canvasTex('lvgrass', 128, 128, (c, w, h) => { c.fillStyle = '#5aa83a'; c.fillRect(0, 0, w, h); const rr = rng(2); for (let i = 0; i < 300; i++) { c.fillStyle = rr() > 0.5 ? '#4a9030' : '#6ab848'; c.fillRect(rr() * w, rr() * h, 4, 4); } c.fillStyle = '#c8a870'; c.fillRect(w * 0.3, 0, w * 0.4, h); }, { repeat: [1, 1] }), roughness: 0.9 }); const dirt = M.col('#8a5e3a', 0.95);
  const b = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1), [dirt, dirt, top, dirt, dirt, dirt]); b.position.y = -0.25; b.castShadow = true; b.receiveShadow = true; g.add(b);
  const side = r() > 0.5 ? 1 : -1;
  if (r() > 0.35) { const t = new THREE.Group(); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.6, 8), M.col('#6a4a2a', 0.8)); tr.position.y = 0.3; t.add(tr); for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 4), M.col('#2f7a2a', 0.8)); l.position.y = 0.6; l.rotation.set(0.9, i * 1.26, 0); l.translateY(0.15); t.add(l); } t.position.set(side * 0.38, 0, (r() - 0.5) * 0.5); g.add(shadows(t)); }
  else { const cr = box(0.18, 0.18, 0.18, M.std({ map: TEX.plywood([1, 1], '#b8844a'), roughness: 0.7 }), side * 0.36, 0.09, (r() - 0.5) * 0.4, g); cr.castShadow = true; }
  if (label) for (const sd of [1, -1]) { const s = sign(label, { width: 0.42, color: '#ffffff', bg: '#2a4ab8', size: 90, pad: 12 }); s.position.set(0, -0.25, 0.502 * sd); s.rotation.y = sd > 0 ? 0 : Math.PI; g.add(s); }
  g.scale.setScalar(s); return g;
}
// original orange cartoon runner (marsupial-ish), animated by run(t)
export function runner() {
  const g = new THREE.Group(); const fur = M.std({ color: '#e8862a', roughness: 0.7 }), pants = M.std({ color: '#2a4ab8', roughness: 0.8 }), shoe = M.std({ color: '#c8282a', roughness: 0.5 }), skin = M.std({ color: '#f2d0a0', roughness: 0.7 });
  const hip = new THREE.Group(); hip.position.y = 0.55; g.add(hip);
  const pel = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), pants); pel.scale.set(1, 0.8, 0.9); hip.add(pel);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.22, 8, 16), fur); torso.position.y = 0.22; hip.add(torso);
  const head = new THREE.Group(); head.position.y = 0.52; hip.add(head);
  const sk = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), fur); sk.scale.set(1, 0.95, 1); head.add(sk);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), skin); snout.scale.set(1.1, 0.75, 1.2); snout.position.set(0, -0.06, 0.13); head.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), M.col('#1a1010', 0.4)); nose.position.set(0, -0.03, 0.25); head.add(nose);
  const grin = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16, Math.PI), M.col('#ffffff', 0.4)); grin.rotation.set(0.2, 0, Math.PI); grin.position.set(0, -0.09, 0.2); head.add(grin);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), M.col('#ffffff', 0.2)); e.position.set(0.06 * s, 0.05, 0.13); head.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), M.col('#2a6a2a', 0.2)); p.position.set(0.06 * s, 0.05, 0.172); head.add(p); const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 8), fur); ear.position.set(0.11 * s, 0.15, -0.02); ear.rotation.z = -0.5 * s; head.add(ear); const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 6), M.col('#1a1010', 0.6)); tuft.position.set(0.02 * s, 0.17, 0); tuft.rotation.z = -0.3 * s; head.add(tuft); }
  const limb = (r, len, mat) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 10), mat); m.position.y = -len / 2 - r; p.add(m); return p; };
  const arms = [-1, 1].map((s) => { const a = limb(0.04, 0.2, fur); a.position.set(0.16 * s, 0.32, 0); hip.add(a); const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), M.col('#f2f0ea', 0.6)); hand.position.y = -0.3; a.add(hand); return a; });
  const legs = [-1, 1].map((s) => { const l = limb(0.055, 0.28, pants); l.position.set(0.08 * s, -0.04, 0); hip.add(l); const sh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), shoe); sh.scale.set(1, 0.6, 1.6); sh.position.set(0, -0.42, 0.04); l.add(sh); return l; });
  g.userData.run = (t, speed = 1) => { const p = t * 9 * speed; legs.forEach((l, i) => { l.rotation.x = Math.sin(p + i * Math.PI) * 0.9; }); arms.forEach((a, i) => { a.rotation.x = -Math.sin(p + i * Math.PI) * 0.9; a.rotation.z = (i ? -1 : 1) * 0.2; }); hip.position.y = 0.55 + Math.abs(Math.sin(p)) * 0.06; torso.rotation.x = 0.2; head.rotation.x = -0.1; };
  g.userData.run(0, 0); return shadows(g);
}
export function disc(r = 0.6) { const g = new THREE.Group(); const tex = canvasTex('disc10', 512, 512, (c, w, h) => { const gr = c.createConicGradient ? c.createConicGradient(0, w / 2, h / 2) : null; if (gr) { ['#c8d8ff', '#ffd8f0', '#d8ffe8', '#fff4c8', '#c8d8ff'].forEach((col, i) => gr.addColorStop(i / 4, col)); c.fillStyle = gr; } else c.fillStyle = '#d8e0f0'; c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, 7); c.fill(); c.fillStyle = '#1a1a22'; c.beginPath(); c.arc(w / 2, h / 2, w * 0.17, 0, 7); c.fill(); c.fillStyle = '#e8e8ec'; c.beginPath(); c.arc(w / 2, h / 2, w * 0.06, 0, 7); c.fill(); }, { repeat: [1, 1] }); const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.012, 64), [M.col('#c8c8d0', 0.2, 0.8), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.15, metalness: 0.6 }), M.col('#1a1a22', 0.4)]); g.add(d); return shadows(g); }
export { V };
