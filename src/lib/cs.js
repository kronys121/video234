import * as THREE from 'three';
import { human2 } from './human2.js';
import { solidHuman } from './overlap.js';
import { M, TEX, canvasTex, rng, speckle, V } from './util.js';
import { box, rbox } from './props.js';
import { sign, point } from './env.js';
import { liveScreen } from './stream.js';

const sh = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
const knit = () => M.std({ map: TEX.fabric([4, 4], '#1a1a1c'), roughness: 1 });

// ---------- characters ----------
function vest(H, color) { const v = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.2, 6, 16), M.std({ map: TEX.fabric([2, 2], color), roughness: 0.9 })); v.scale.set(1.22 * H.opts.bulk, 1, 0.82); v.position.y = 0.12; H.J.chest.add(v); for (const x of [-0.08, 0, 0.08]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.08, 0.04), M.col(color, 0.85)); p.position.set(x, 0.0, 0.15); H.J.chest.add(p); } sh(v); }
export function rifle() {
  const g = new THREE.Group(); const m = M.col('#26282c', 0.5, 0.4), w = M.col('#5a4030', 0.7);
  box(0.05, 0.08, 0.5, m, 0, 0, 0.12, g); box(0.04, 0.12, 0.18, w, 0, -0.02, -0.2, g); box(0.035, 0.12, 0.05, m, 0, -0.09, 0.1, g);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), m); b.rotation.x = Math.PI / 2; b.position.z = 0.5; g.add(b);
  box(0.02, 0.03, 0.08, m, 0, 0.055, 0.15, g);
  return sh(g);
}
export const HOLD_RIFLE = { rSh: [-30, 0, -12], rEl: [-75, 15, 0], rCurl: 0.8, lSh: [-60, 0, 28], lEl: [-55, -35, 0], lCurl: 0.7, head: [4, 0, 0] };
function arm(H) { const r = rifle(); r.position.set(0, -0.08, 0.02); r.rotation.set(-0.35, 0, 0); H.J.rHand.group.add(r); return r; }

export const cs = {
  student1: () => solidHuman(human2({ skin: '#e8c4a0', hair: '#141010', hairStyle: 'short', top: 'hoodie', topColor: '#3a5a8a', pants: 'jeans', shoes: '#eee', eyeColor: '#2a1a10' }), 'student1'),
  student2: () => solidHuman(human2({ skin: '#f0c8a8', hair: '#3a2214', hairStyle: 'short', glasses: true, top: 'tshirt', topColor: '#c0563a', pants: 'jeans', pantsColor: '#2a3040', shoes: '#333', eyeColor: '#3a5a7a' }), 'student2'),
  exec: () => solidHuman(human2({ skin: '#ecc4a4', hair: '#5a4a3a', hairStyle: 'short', beard: true, top: 'jacket', topColor: '#22262e', pants: 'slacks', pantsColor: '#1a1e26', shoes: '#111', eyeColor: '#3a4a5a', bulk: 1.08, belly: 0.03 }), 'exec'),
  ct: (name = 'ct', armed = true) => { const h = human2({ skin: '#d9a57f', helmet: 'tactical', top: 'longsleeve', topColor: '#2a3a5a', pants: 'slacks', pantsColor: '#2a3448', shoes: '#151515', gloves: '#1a1a1a', eyeColor: '#2a3a4a' }); vest(h, '#3a4a6a'); if (armed) h.gun = arm(h); return solidHuman(h, name); },
  t: (name = 't', armed = true) => {
    const h = human2({ skin: '#c89070', balaclava: true, hairStyle: 'bald', top: 'longsleeve', topColor: '#4a4a3a', pants: 'slacks', pantsColor: '#3a3628', shoes: '#2a2218', gloves: '#2a2a2a', eyeColor: '#2a1a10' });
    const k = knit(); h.J.headGroup.traverse((m) => { if (m.isMesh && m.material === h.skinMat) m.material = k; });
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.045, 0.03), h.skinMat); band.position.set(0, 0.092, 0.085); h.J.headGroup.add(band);
    vest(h, '#5a5440'); if (armed) h.gun = arm(h); return solidHuman(h, name);
  },
  pro: (name, color, skin = '#e2b08c', hair = '#2a1a12') => solidHuman(human2({ skin, hair, hairStyle: 'short', top: 'longsleeve', topColor: color, pants: 'jeans', pantsColor: '#1a1e26', shoes: '#eee', eyeColor: '#2a1a10' }), name),
};
// translucent "dead player" ghost
export function ghostify(H, color = '#9fd6ff') {
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.45, depthWrite: false, roughness: 0.6 });
  H.root.traverse((m) => { if (m.isMesh) { m.material = mat; m.castShadow = false; } });
  return H;
}

// ---------- 1999 dorm props ----------
export function crt(draw, s = 1) {
  const g = new THREE.Group(); const beige = M.col('#d8d0bc', 0.6);
  rbox(0.42, 0.36, 0.08, 0.02, beige, 0, 0, 0.04, g); rbox(0.36, 0.3, 0.32, 0.04, beige, 0, -0.01, -0.16, g);
  const live = liveScreen(512, 400, draw);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.26), new THREE.MeshStandardMaterial({ map: live.tex, emissiveMap: live.tex, emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.15 })); scr.position.set(0, 0.01, 0.082); g.add(scr);
  rbox(0.24, 0.03, 0.22, 0.01, beige, 0, -0.2, -0.1, g);
  g.userData.live = live; g.scale.setScalar(s); sh(g); scr.castShadow = false; return g;
}
export function tower() { const g = new THREE.Group(); rbox(0.2, 0.45, 0.45, 0.01, M.col('#d8d0bc', 0.6), 0, 0.225, 0, g); box(0.14, 0.03, 0.01, M.col('#8a8476', 0.5), 0, 0.38, 0.226, g); box(0.14, 0.03, 0.01, M.col('#8a8476', 0.5), 0, 0.33, 0.226, g); const led = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), M.emis('#3aff6a', 3)); led.position.set(0.06, 0.1, 0.227); g.add(led); return sh(g); }
export function pizzaBox() { const g = new THREE.Group(); box(0.4, 0.04, 0.4, M.std({ map: TEX.cardboard(), roughness: 0.95 }), 0, 0.02, 0, g); const s = sign('PIZZA', { width: 0.2, color: '#c0302a', size: 80, pad: 10 }); s.rotation.x = -Math.PI / 2; s.position.set(0, 0.042, 0); g.add(s); return sh(g); }
export function soda(color = '#c0302a') { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.12, 16), M.col(color, 0.35, 0.6)); c.position.y = 0.06; g.add(c); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.033, 0.01, 16), M.col('#c8c8c8', 0.3, 0.9)); t.position.y = 0.125; g.add(t); return sh(g); }
export function floppy(label = 'MOD') {
  const g = new THREE.Group(); rbox(0.09, 0.094, 0.004, 0.003, M.col('#1a1a1e', 0.45), 0, 0, 0, g);
  box(0.05, 0.03, 0.005, M.col('#b8bcc4', 0.3, 0.9), 0.008, 0.032, 0, g);
  const l = sign(label, { width: 0.07, color: '#1a1a1a', bg: '#f2f0e8', size: 80, pad: 14 }); l.position.set(0, -0.015, 0.0028); g.add(l);
  return sh(g);
}
export function badge(text = 'СОТРУДНИК', color = '#e07a2a') {
  const g = new THREE.Group(); rbox(0.08, 0.11, 0.004, 0.006, M.col('#ffffff', 0.4), 0, 0, 0, g);
  box(0.08, 0.025, 0.005, M.col(color, 0.5), 0, 0.042, 0, g);
  const s = sign(text, { width: 0.07, color: '#1a1a1a', size: 70, pad: 8 }); s.position.set(0, -0.03, 0.003); g.add(s);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), M.col('#c8a080', 0.6)); face.position.set(0, 0.008, 0.003); g.add(face);
  const clip = box(0.02, 0.01, 0.006, M.col('#9aa0a8', 0.3, 0.9), 0, 0.058, 0, g); void clip;
  return sh(g);
}

// ---------- desert town (game world) ----------
export const plasterTex = (col = '#d8b888') => canvasTex('plaster' + col, 512, 512, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); speckle(g, w, h, 4000, ['#c8a678', '#e4c89a', '#b89a6a'], 0.8, 3, 7, 0.5); g.strokeStyle = 'rgba(120,90,50,0.25)'; g.lineWidth = 2; for (let i = 0; i < 14; i++) { g.beginPath(); const x = (i * 97) % w, y = (i * 57) % h; g.moveTo(x, y); g.lineTo(x + 30, y + 12); g.stroke(); } }, { repeat: [2, 1] });
export function adobe(w, h, d, col = '#d8b888') { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.std({ map: plasterTex(col), roughness: 0.95 })); m.position.y = h / 2; return sh(m); }
export function arch(w = 3, h = 3.4, d = 0.8) {
  const g = new THREE.Group(); const mat = M.std({ map: plasterTex('#d0ae80'), roughness: 0.95 });
  box(0.7, h, d, mat, -w / 2 + 0.35, h / 2, 0, g); box(0.7, h, d, mat, w / 2 - 0.35, h / 2, 0, g); box(w, 0.8, d, mat, 0, h - 0.4, 0, g);
  return sh(g);
}
export function woodCrate(s = 1) {
  const g = new THREE.Group(); const m = M.std({ map: TEX.plywood([1, 1], '#9a7044'), roughness: 0.85 }); const t = M.col('#6b4a2a', 0.8);
  box(1, 1, 1, m, 0, 0.5, 0, g);
  for (const [x, z, rx, rz] of [[0, 0.505, 0, 0], [0, -0.505, 0, 0]]) { const a = box(1.02, 0.1, 0.02, t, x, 0.95, z, g); const b2 = box(1.02, 0.1, 0.02, t, x, 0.05, z, g); const c = box(1.3, 0.1, 0.02, t, x, 0.5, z, g); c.rotation.z = 0.78; void a; void b2; void rx; void rz; }
  g.scale.setScalar(s); return sh(g);
}
export function desertTown(scene) {
  scene.fog = new THREE.Fog('#e8d4b0', 30, 120);
  scene.background = new THREE.Color('#9cc4ea');
  const sand = canvasTex('sand2', 512, 512, (g, w, h) => { g.fillStyle = '#d4b47e'; g.fillRect(0, 0, w, h); speckle(g, w, h, 8000, ['#c4a46e', '#e0c08a', '#b8986a'], 0.5, 1.8, 11, 0.5); }, { repeat: [24, 24] });
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), M.std({ map: sand, roughness: 1 })); gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; scene.add(gnd);
  scene.add(new THREE.HemisphereLight('#cfe4ff', '#a08060', 1.0));
  const sunL = new THREE.DirectionalLight('#fff0d0', 3.0); sunL.position.set(12, 20, 8); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14 }); sunL.shadow.bias = -0.0004; scene.add(sunL);
  const walls = [[-7, -4, 3, 5, 10], [7, -4, 3, 4.2, 10], [0, -12, 16, 6, 3], [-4.5, -9, 4, 3.5, 3], [4.5, -9.5, 4, 4, 3]];
  walls.forEach(([x, z, w, h, d], i) => { const a = adobe(w, h, d, i % 2 ? '#d8b888' : '#ccaa7c'); a.position.x = x; a.position.z = z; scene.add(a); });
  const ar = arch(4, 4, 1); ar.position.set(0, 0, -8.5); scene.add(ar);
  for (let i = 0; i < 5; i++) { box(0.05, 0.8, 0.6, M.col('#3a2a1a', 0.8), -5.47, 2.6 + (i % 2) * 1.1, -7.5 + i * 1.6, scene); box(0.05, 0.8, 0.6, M.col('#3a2a1a', 0.8), 5.47, 2.4 + (i % 2) * 1.1, -7.5 + i * 1.6, scene); }
  return { gnd };
}

export function csBox(title = 'COUNTER-STRIKE', sub = '', a = '#c86a1a', b = '#1a1a22') {
  const cover = canvasTex('csbox' + title + sub, 300, 420, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.75)'; g.beginPath(); g.ellipse(w * 0.5, h * 0.42, 40, 46, 0, 0, 7); g.fill(); g.fillRect(w * 0.36, h * 0.48, w * 0.28, h * 0.32); g.fillRect(w * 0.6, h * 0.55, w * 0.3, 14);
    g.fillStyle = '#f4f0e6'; g.font = `${title.length > 10 ? 34 : 54}px Russo`; g.textAlign = 'center'; g.fillText(title, w / 2, h * 0.14); g.font = '30px Russo'; g.fillStyle = '#ffd27a'; g.fillText(sub, w / 2, h * 0.93);
  }, { repeat: [1, 1] });
  const side = M.col(b, 0.5);
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.06), [side, side, side, side, M.std({ map: cover, roughness: 0.45 }), side]);
  const g = new THREE.Group(); g.add(m); return sh(g);
}
export function gameView(g, w, h, t) {
  const gr = g.createLinearGradient(0, 0, 0, h * 0.5); gr.addColorStop(0, '#8ab8e8'); gr.addColorStop(1, '#e8d8b8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8a670'; g.fillRect(0, h * 0.55, w, h * 0.45);
  const sway = Math.sin(t * 1.2) * w * 0.03;
  g.fillStyle = '#d8b888'; g.fillRect(sway, h * 0.2, w * 0.28, h * 0.4); g.fillRect(w * 0.7 + sway, h * 0.25, w * 0.3, h * 0.35);
  g.fillStyle = '#b8966a'; g.fillRect(w * 0.42 + sway, h * 0.32, w * 0.16, h * 0.26); g.fillStyle = '#3a2a1a'; g.fillRect(w * 0.46 + sway, h * 0.4, w * 0.08, h * 0.18);
  g.fillStyle = '#9a7044'; g.fillRect(w * 0.2 + sway, h * 0.5, w * 0.14, h * 0.12);
  g.strokeStyle = '#3aff6a'; g.lineWidth = 3; const cx = w / 2, cy = h / 2; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { g.beginPath(); g.moveTo(cx + dx * 8, cy + dy * 8); g.lineTo(cx + dx * 22, cy + dy * 22); g.stroke(); }
  g.fillStyle = '#ffd27a'; g.font = `${h * 0.07}px Russo`; g.textAlign = 'left'; g.fillText('+ 100', w * 0.03, h * 0.95); g.textAlign = 'right'; g.fillText('30 | 90', w * 0.97, h * 0.95);
}
export function editorDraw(g, w, h, t) {
  g.fillStyle = '#20242a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2e343c'; g.lineWidth = 1; for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  const n = Math.min(9, 2 + Math.floor(t * 2.2)); const r = rng(5);
  for (let i = 0; i < 9; i++) { const x = 30 + r() * (w - 140), y = 40 + r() * (h - 140), bw = 40 + r() * 90, bh = 30 + r() * 70; if (i >= n) continue; g.strokeStyle = i === n - 1 ? '#ffd23a' : '#4aa0ff'; g.lineWidth = 2; g.strokeRect(x, y, bw, bh); }
  g.fillStyle = '#9fb4d8'; g.font = '18px Russo'; g.textAlign = 'left'; g.fillText('MAP EDITOR — cs_mod.map', 10, 22);
}
// keep the rifle level along the character's facing, whatever the hand bone does
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler();
export function aim(H, pitch = 0, yaw = 0) {
  if (!H.gun) return; H.root.updateMatrixWorld(true);
  H.gun.parent.getWorldQuaternion(_q1).invert(); H.root.getWorldQuaternion(_q2);
  _q2.multiply(new THREE.Quaternion().setFromEuler(_e.set(-pitch, yaw, 0)));
  H.gun.quaternion.copy(_q1.multiply(_q2));
}
