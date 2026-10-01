import * as THREE from 'three';
import { human } from './human.js';
import { M, rng, V } from './util.js';
import { box, rbox } from './props.js';
import { sign } from './env.js';
import { COL } from './stream.js';

const D = THREE.MathUtils.degToRad;

export function addHeadset(h, col = COL.purple) {
  const head = h.J.head; const m = M.col('#16161c', 0.4, 0.4);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.126, 0.009, 8, 28, Math.PI), m); band.position.set(0, 0.072, 0); head.add(band);
  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 20), m); cup.rotation.z = Math.PI / 2; cup.position.set(0.118 * s, 0.062, 0); head.add(cup);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.004, 6, 20), M.emis(col, 3)); ring.rotation.y = Math.PI / 2; ring.position.set(0.134 * s, 0.062, 0); head.add(ring);
  }
  const a = V(0.12, 0.05, 0.02), b = V(0.045, 0.0, 0.1); const len = a.distanceTo(b);
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, len, 6), m); boom.position.copy(a).add(b).multiplyScalar(0.5); boom.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); head.add(boom);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), m); tip.position.copy(b); head.add(tip);
  head.traverse((o) => { if (o.isMesh) o.castShadow = true; });
}
export function addMask(h) {
  const m = M.col('#0b0b0e', 0.8);
  const mask = new THREE.Mesh(new THREE.SphereGeometry(0.092, 20, 14, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58), m); mask.scale.set(1.06, 0.98, 1.1); mask.position.set(0, 0.018, 0.02); h.J.head.add(mask);
}
export function addJacketLabel(h, text = 'FBI') {
  const s = sign(text, { width: 0.3, color: '#ffd21f', bg: '#0b0b10', size: 150, pad: 18 });
  s.position.set(0, 0.07, -0.128); s.rotation.y = Math.PI; h.J.chest.add(s);
}
export function addBadge(h, color = '#d8b24a') {
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 6), M.col(color, 0.3, 0.9)); b.rotation.x = Math.PI / 2; b.position.set(0.1, 0.12, 0.13); h.J.chest.add(b);
}

export const mk = {
  quantum: () => { const h = human({ skin: '#e2b08c', top: 'hoodie', topColor: '#6b3fd4', pants: 'jeans', pantsColor: '#222a3a', hair: '#2a1a12', hairStyle: 'short', glasses: '#1a1a1a', shoes: '#f0f0f0', eyeColor: '#2a4a6a' }); addHeadset(h); return h; },
  colleague: () => { const h = human({ skin: '#c8906a', top: 'tshirt', topColor: '#2f8a5a', pants: 'jeans', pantsColor: '#2a3040', hair: '#111', hairStyle: 'buzz', beard: true, shoes: '#222', eyeColor: '#2a1a10' }); addHeadset(h, COL.green); return h; },
  officer: () => { const h = human({ skin: '#d9a57f', top: 'shirt', topColor: '#27406b', tie: '#101018', pants: 'slacks', pantsColor: '#1b2438', hair: '#3a2a1a', hairStyle: 'short', cap: '#1b2438', shoes: '#111', eyeColor: '#3a4a6a' }); addBadge(h); return h; },
  victimA: () => human({ skin: '#e8b898', top: 'shirt', topColor: '#7a8a5a', pants: 'slacks', pantsColor: '#4a4034', hair: '#9a9a9a', hairStyle: 'short', glasses: true, shoes: '#2a2218', eyeColor: '#3a5a7a' }),
  victimB: () => human({ skin: '#f0c8a8', top: 'shirt', topColor: '#b05a6a', pants: 'slacks', pantsColor: '#3a3a4a', hair: '#7a4a2a', hairStyle: 'long', female: true, shoes: '#2a2a2a', eyeColor: '#3a5a2a', lip: '#b8484a' }),
  victimC: () => human({ skin: '#8a5a3c', top: 'tshirt', topColor: '#d9a23a', pants: 'jeans', pantsColor: '#2a3a5a', hair: '#111', hairStyle: 'buzz', beard: true, shoes: '#f0f0f0', eyeColor: '#2a1a10' }),
  victimD: () => human({ skin: '#f2d0b8', top: 'hoodie', topColor: '#2a6a4a', pants: 'jeans', pantsColor: '#44506a', hair: '#e0c080', hairStyle: 'short', shoes: '#eee', eyeColor: '#5a7aa0' }),
  victimE: () => human({ skin: '#c89070', top: 'tshirt', topColor: '#4a7ad0', pants: 'jeans', pantsColor: '#2a2a3a', hair: '#2a1a10', hairStyle: 'bun', female: true, shoes: '#ddd', eyeColor: '#3a2a1a', lip: '#a8484a' }),
  agent: (skin = '#d9a57f', hair = '#111') => { const h = human({ skin, top: 'suit', topColor: '#0c0c12', tie: '#111', pants: 'slacks', pantsColor: '#0c0c12', hair, hairStyle: 'short', glasses: '#050505', shoes: '#050505', eyeColor: '#1a1a1a' }); addJacketLabel(h, 'FBI'); return h; },
  hacker: (skin = '#d8d0c8') => { const h = human({ skin, top: 'hoodie', topColor: '#0a0a0e', pants: 'jeans', pantsColor: '#14141a', hair: '#0a0a0a', hairStyle: 'short', cap: '#0a0a0e', shoes: '#111', eyeColor: '#2a6a2a' }); addMask(h); return h; },
  grandma: () => human({ skin: '#f0cdb0', top: 'shirt', topColor: '#8a6aa8', pants: 'slacks', pantsColor: '#5a4a60', hair: '#d0d0d0', hairStyle: 'bun', female: true, glasses: '#8a5a2a', shoes: '#4a3a30', eyeColor: '#4a6a8a', lip: '#c07070' }),
  grandpa: () => human({ skin: '#e8c0a0', top: 'shirt', topColor: '#4a6a8a', pants: 'slacks', pantsColor: '#3a3a3a', hair: '#c0c0c0', hairStyle: 'short', glasses: '#333', shoes: '#2a2018', eyeColor: '#3a5a7a' }),
};

// cheap crowd member for big audiences: ~7 meshes
export function miniPerson(seed = 1) {
  const r = rng(seed * 13 + 1); const g = new THREE.Group();
  const skins = ['#f0c8a8', '#e2b08c', '#c89070', '#8a5a3c', '#f2d0b8']; const tops = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1', '#16a085', '#d35400'];
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.3, 4, 10), M.col(tops[Math.floor(r() * tops.length)], 0.85)); body.position.y = 0.4; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 10), M.col(skins[Math.floor(r() * skins.length)], 0.6)); head.position.y = 0.82; g.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), M.col(['#2a1a10', '#6a4a2a', '#c9a060', '#111', '#9a9a9a'][Math.floor(r() * 5)], 0.8)); hair.position.y = 0.84; g.add(hair);
  const arms = [];
  for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(0.19 * s, 0.58, 0); const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.28, 3, 8), body.material); a.position.y = -0.18; p.add(a); g.add(p); arms.push(p); }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData = { arms, head, ph: r() * 6, sp: 5 + r() * 4 };
  return g;
}
export function cheer(p, t, amt = 1) {
  const u = p.userData; const k = Math.sin(t * u.sp + u.ph) * 0.5 + 0.5;
  u.arms[0].rotation.z = D(-150 * amt * k); u.arms[1].rotation.z = D(150 * amt * k);
  p.position.y = (p.userData.y0 || 0) + Math.max(0, Math.sin(t * u.sp * 0.5 + u.ph)) * 0.08 * amt;
}

export function robot(color = COL.cyan, seed = 1) {
  const g = new THREE.Group(); const r = rng(seed);
  const body = M.col('#8e98a6', 0.35, 0.7), dark = M.col('#2a2f38', 0.5, 0.5);
  rbox(0.34, 0.4, 0.24, 0.04, body, 0, 0.42, 0, g);
  const head = new THREE.Group(); head.position.y = 0.78; g.add(head);
  rbox(0.3, 0.26, 0.24, 0.05, body, 0, 0, 0, head);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), M.emis(color, 3)); e.position.set(0.075 * s, 0.02, 0.12); e.scale.z = 0.5; head.add(e); }
  box(0.14, 0.02, 0.01, M.emis(color, 2), 0, -0.07, 0.122, head);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), dark); ant.position.y = 0.19; head.add(ant);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), M.emis(COL.red, 3)); ball.position.y = 0.26; head.add(ball);
  const arms = [];
  for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(0.22 * s, 0.58, 0); const a = rbox(0.07, 0.3, 0.07, 0.02, dark, 0, -0.14, 0, p); void a; g.add(p); arms.push(p); }
  for (const s of [-1, 1]) rbox(0.09, 0.2, 0.1, 0.02, dark, 0.09 * s, 0.1, 0, g);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData = { arms, head, ph: r() * 6, sp: 4 + r() * 3 };
  return g;
}
