import * as THREE from 'three';
import { human3 } from './human3.js';
import { solidHuman } from './overlap.js';
import { M, TEX, canvasTex, rng, V } from './util.js';
import { box, rbox, cardboardBox } from './props.js';
import { sign } from './env.js';
import { liveScreen } from './stream.js';
import { shadows } from './shot.js';

// ---------- cast ----------
export const cast7 = {
  designer: (n = 'designer') => solidHuman(human3({ skin: '#ecc9a6', hair: '#141010', hairStyle: 'short', top: 'longsleeve', topColor: '#3a5a8a', pants: 'slacks', pantsColor: '#3a3a40', shoes: '#2a1a12', dress: true, eyeColor: '#2a1a10' }), n),
  landlord: (n = 'landlord') => solidHuman(human3({ skin: '#e2b896', hair: '#9a9a96', hairStyle: 'short', top: 'jacket', topColor: '#5a4632', pants: 'slacks', pantsColor: '#3a3024', shoes: '#1a120c', dress: true, tie: '#7a2a1a', eyeColor: '#3a2a1a', bulk: 1.12, belly: 0.05, height: 1.0 }), n),
  president: (n = 'president') => solidHuman(human3({ skin: '#e6c4a2', hair: '#121010', hairStyle: 'short', glasses: true, top: 'jacket', topColor: '#1e2638', pants: 'slacks', pantsColor: '#1e2638', shoes: '#0a0a0a', dress: true, tie: '#2a4a8a', eyeColor: '#2a1a10' }), n),
  worker1: (n = 'worker1') => solidHuman(human3({ skin: '#d8a882', hair: '#4a2a14', hairStyle: 'short', top: 'tshirt', topColor: '#c84a2a', pants: 'jeans', pantsColor: '#2a3a5a', shoes: '#e8e4dc', eyeColor: '#3a2a1a' }), n),
  worker2: (n = 'worker2') => solidHuman(human3({ skin: '#f0cfb2', hair: '#c89a5a', hairStyle: 'long', female: true, lip: '#b0505a', top: 'longsleeve', topColor: '#2a7a6a', pants: 'jeans', pantsColor: '#30384a', shoes: '#f2f0ea', eyeColor: '#3a6a5a' }), n),
  manager: (n = 'manager') => solidHuman(human3({ skin: '#e8c0a0', hair: '#c8c8c4', hairStyle: 'short', beard: false, top: 'hoodie', topColor: '#5a3a2a', pants: 'jeans', pantsColor: '#2a3448', shoes: '#3a2a1a', eyeColor: '#3a4a5a', bulk: 1.08, belly: 0.04 }), n),
};

// ---------- pixel sprites as voxels ----------
// grid rows top→bottom; palette maps chars to colours; '.' empty
export function pixelSprite(rows, pal, px = 0.08, depth = 1) {
  const g = new THREE.Group(); const byCol = {};
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '.' || !pal[ch]) return; (byCol[ch] ||= []).push([x, rows.length - 1 - y]); }));
  const W = rows[0].length; const geo = new THREE.BoxGeometry(px * 0.98, px * 0.98, px * depth);
  for (const [ch, cells] of Object.entries(byCol)) {
    const im = new THREE.InstancedMesh(geo, M.std({ color: pal[ch], roughness: 0.55 }), cells.length); const m4 = new THREE.Matrix4();
    cells.forEach(([x, y], i) => im.setMatrixAt(i, m4.makeTranslation((x - (W - 1) / 2) * px, (y + 0.5) * px, 0))); im.castShadow = true; im.receiveShadow = true; g.add(im);
  }
  g.userData.h = rows.length * px; g.userData.w = W * px; return g;
}
// original 12×16 hero: cap, moustache, shirt, overalls, boots
export const HERO = ['...RRRRR....', '..RRRRRRRR..', '..BBBSSKS...', '.BSBSSSKSSS.', '.BSBBSSSKSSS', '.BBSSSSKKKK.', '...SSSSSSS..', '..RRORRR....', '.RRRORRORRR.', 'RRRROOOORRRR', 'SSROYOOYORSS', 'SSSOOOOOOSSS', 'SSOOOOOOOOSS', '..OOO..OOO..', '.BBB....BBB.', 'BBBB....BBBB'];
export const HERO_PAL = { R: '#d8281e', B: '#5a3214', S: '#f2b98a', K: '#141010', O: '#2a4ab8', Y: '#ffd23a' };
export const LADY = ['...BBBB.....', '..BBBBBB....', '..BSSSSB....', '..BSKSKB....', '..BSSSSB....', '...SSSS.....', '..PPPPPP....', '.PPWPPWPP...', 'SPPPPPPPPS..', 'S.PPPPPP.S..', '..PPPPPP....', '.PPPPPPPP...', '.PPPPPPPP...', 'PPPPPPPPPP..', '..SS..SS....', '..WW..WW....'];
export const LADY_PAL = { B: '#7a3a1a', S: '#f2c9a0', K: '#141010', P: '#ff6aa8', W: '#ffffff' };
export const heroSprite = (px = 0.08) => pixelSprite(HERO, HERO_PAL, px, 1.6);
export const ladySprite = (px = 0.08) => pixelSprite(LADY, LADY_PAL, px, 1.6);

// ---------- retro arcade screen ----------
const SPR = (g, rows, pal, x, y, p) => rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '.' || !pal[ch]) return; g.fillStyle = pal[ch]; g.fillRect(x + i * p, y + j * p, p, p); }));
export function arcadeDraw(g, w, h, t, { name = '', lady = false } = {}) {
  g.fillStyle = '#05050c'; g.fillRect(0, 0, w, h);
  const gird = (y0, y1) => { g.fillStyle = '#e83a5a'; for (let i = 0; i < 12; i++) { const x = w * 0.06 + i * w * 0.074, y = y0 + (y1 - y0) * i / 11; g.fillRect(x, y, w * 0.074 - 2, h * 0.018); g.fillStyle = '#7a1a2a'; g.fillRect(x, y + h * 0.018, w * 0.074 - 2, 3); g.fillStyle = '#e83a5a'; } };
  gird(h * 0.86, h * 0.82); gird(h * 0.62, h * 0.67); gird(h * 0.44, h * 0.4); gird(h * 0.22, h * 0.26);
  g.fillStyle = '#3ad0ff'; for (let y = h * 0.67; y < h * 0.82; y += h * 0.025) g.fillRect(w * 0.8, y, w * 0.05, 4);
  // barrels roll down the second girder
  for (let i = 0; i < 3; i++) { const k = ((t * 0.35 + i * 0.33) % 1); const x = w * (0.85 - 0.75 * k), y = h * (0.6 + 0.05 * k) - h * 0.04; g.fillStyle = '#c87a2a'; g.beginPath(); g.ellipse(x, y, h * 0.022, h * 0.02, 0, 0, 7); g.fill(); g.strokeStyle = '#6a3a10'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - h * 0.02, y); g.lineTo(x + h * 0.02, y); g.stroke(); }
  const jump = Math.max(0, Math.sin(t * 5)) * h * 0.05; const p = Math.round(h * 0.0045);
  SPR(g, HERO, HERO_PAL, w * 0.35, h * 0.62 - 16 * p - jump, p);
  if (lady) SPR(g, LADY, LADY_PAL, w * 0.45, h * 0.22 - 16 * p, p);
  g.fillStyle = '#ffffff'; g.font = `${Math.round(h * 0.045)}px Russo`; g.textAlign = 'left'; g.fillText('1UP 007100', w * 0.05, h * 0.07); g.textAlign = 'right'; g.fillText('HIGH 012300', w * 0.95, h * 0.07);
  if (name) { g.fillStyle = '#ffd23a'; g.textAlign = 'center'; g.font = `${Math.round(h * 0.06)}px Russo`; g.fillText(name, w * 0.42, h * 0.62 - 18 * p - jump); }
}
export function arcadeCab(draw, marquee = 'ARCADE', col = '#2a4ab8') {
  const g = new THREE.Group(); const body = M.std({ color: col, roughness: 0.5 }); const blk = M.col('#111116', 0.5);
  rbox(0.7, 1.0, 0.65, 0.02, body, 0, 0.5, 0, g);
  rbox(0.7, 0.85, 0.42, 0.02, body, 0, 1.42, -0.12, g);
  box(0.74, 0.04, 0.4, blk, 0, 1.0, 0.13, g);
  const panel = rbox(0.66, 0.08, 0.3, 0.02, M.col('#1a1a22', 0.5), 0, 1.03, 0.16, g); panel.rotation.x = -0.25;
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), blk); stick.position.set(-0.15, 1.1, 0.18); g.add(stick); const ball = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 10), M.col('#d8281e', 0.3)); ball.position.set(-0.15, 1.15, 0.18); g.add(ball);
  for (const [x, c] of [[0.08, '#ffd23a'], [0.18, '#3ad0ff']]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 14), M.col(c, 0.3)); b.position.set(x, 1.08, 0.18); b.rotation.x = -0.25; g.add(b); }
  const live = liveScreen(512, 640, draw); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.62), new THREE.MeshStandardMaterial({ map: live.tex, emissiveMap: live.tex, emissive: '#ffffff', emissiveIntensity: 0.85, roughness: 0.2 })); scr.position.set(0, 1.45, 0.095); scr.rotation.x = -0.08; g.add(scr);
  box(0.6, 0.72, 0.01, blk, 0, 1.45, 0.088, g).rotation.x = -0.08;
  const mq = sign(marquee, { width: 0.6, color: '#ffffff', bg: '#d8281e', size: 90, pad: 18, emissive: 0.5 }); mq.position.set(0, 1.97, 0.1); g.add(mq);
  box(0.72, 0.2, 0.3, body, 0, 1.97, -0.02, g);
  for (const s of [-1, 1]) box(0.03, 2.08, 0.66, M.col('#141418', 0.4), 0.36 * s, 1.04, 0, g);
  g.userData.live = live; return shadows(g);
}
// ---------- props ----------
export function barrel7(s = 1) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.6, 24), M.std({ map: TEX.plywood([3, 1], '#b8742a'), roughness: 0.6 })); g.add(b); const bulge = new THREE.Mesh(new THREE.SphereGeometry(0.29, 24, 12), M.std({ map: TEX.plywood([3, 1], '#b8742a'), roughness: 0.6 })); bulge.scale.set(1, 0.9, 1); g.add(bulge); for (const y of [-0.22, 0.22]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.018, 8, 28), M.col('#3a2a1a', 0.4, 0.6)); h.rotation.x = Math.PI / 2; h.position.y = y; g.add(h); } g.scale.setScalar(s); return shadows(g); }
export function girder(len = 4, col = '#e83a5a') { const g = new THREE.Group(); const m = M.std({ color: col, roughness: 0.45, metalness: 0.3 }); box(len, 0.05, 0.4, m, 0, 0.2, 0, g); box(len, 0.05, 0.4, m, 0, -0.2, 0, g); for (let x = -len / 2 + 0.2; x < len / 2; x += 0.4) { const d = box(0.05, 0.42, 0.04, m, x, 0, 0.16, g); d.rotation.z = 0.6; const d2 = box(0.05, 0.42, 0.04, m, x, 0, -0.16, g); d2.rotation.z = -0.6; } return shadows(g); }
export function book(title, sub = '', col = '#1a1a2a') { const g = new THREE.Group(); const cover = canvasTex('book7' + title, 300, 420, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23a'; c.font = '52px Russo'; c.textAlign = 'center'; c.fillText(title, w / 2, h * 0.3); c.fillStyle = '#ffffff'; c.font = '26px Russo'; c.fillText(sub, w / 2, h * 0.42); c.strokeStyle = '#ffd23a'; c.lineWidth = 6; c.strokeRect(16, 16, w - 32, h - 32); }, { repeat: [1, 1] }); const side = M.col(col, 0.6), pages = M.col('#f2eee2', 0.9); const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.06), [pages, side, pages, pages, M.std({ map: cover, roughness: 0.5 }), side]); g.add(m); return shadows(g); }
export function podium(label = '') { const g = new THREE.Group(); rbox(0.6, 1.05, 0.45, 0.02, M.col('#2a2e3a', 0.5), 0, 0.525, 0, g); const top = rbox(0.66, 0.05, 0.5, 0.01, M.col('#3a3e4a', 0.4), 0, 1.07, 0.02, g); top.rotation.x = -0.2; const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.3, 8), M.col('#111', 0.4)); mic.position.set(0, 1.2, 0.12); mic.rotation.x = 0.5; g.add(mic); const head = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), M.col('#222', 0.6)); head.position.set(0, 1.33, 0.19); g.add(head); if (label) { const s = sign(label, { width: 0.5, color: '#ffffff', bg: '#d8281e', size: 90, pad: 14 }); s.position.set(0, 0.7, 0.232); g.add(s); } return shadows(g); }
export function hourglass() { const g = new THREE.Group(); const wood = M.col('#6a4422', 0.5); for (const y of [0, 0.5]) rbox(0.3, 0.04, 0.3, 0.01, wood, 0, y, 0, g); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; box(0.025, 0.5, 0.025, wood, Math.cos(a) * 0.12, 0.25, Math.sin(a) * 0.12, g); } const glass = new THREE.Mesh(new THREE.LatheGeometry([V(0.01, 0.02), V(0.1, 0.06), V(0.11, 0.14), V(0.02, 0.25), V(0.11, 0.36), V(0.1, 0.44), V(0.01, 0.48)].map((v) => new THREE.Vector2(v.x, v.y)), 24), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.25, roughness: 0.05 })); g.add(glass); const top = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.1, 20), M.col('#e8c070', 0.8)); top.rotation.x = Math.PI; top.position.y = 0.33; g.add(top); const bot = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.08, 20), M.col('#e8c070', 0.8)); bot.position.y = 0.08; g.add(bot); g.userData = { top, bot }; return shadows(g); }
export function photoFrame(draw, w = 0.3, h = 0.38) { const g = new THREE.Group(); rbox(w + 0.04, h + 0.04, 0.025, 0.006, M.col('#c8a24a', 0.3, 0.8), 0, 0, 0, g); const t = canvasTex('photo7' + w + h, 300, 380, draw, { repeat: [1, 1] }); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.std({ map: t, roughness: 0.4 })); p.position.z = 0.014; g.add(p); const leg = box(0.03, h * 0.8, 0.02, M.col('#3a2a1a', 0.5), 0, -0.05, -0.08, g); leg.rotation.x = -0.45; return shadows(g); }
export function nameTag(text, { w = 1.2, bg = '#ffffff', color = '#1a1a1a', border = '#d8281e' } = {}) { return sign(text, { width: w, color, bg, size: 120, pad: 26, border }); }
export function pallet() { const g = new THREE.Group(); const m = M.std({ map: TEX.plywood([1, 1], '#b8945a'), roughness: 0.8 }); for (let i = 0; i < 5; i++) box(1.0, 0.025, 0.14, m, 0, 0.12, -0.4 + i * 0.2, g); for (const z of [-0.4, 0, 0.4]) box(1.0, 0.1, 0.1, m, 0, 0.05, z, g); return shadows(g); }
export function crateStack(seed = 1, n = 4) { const g = new THREE.Group(); const r = rng(seed); g.add(pallet()); let y = 0.145; for (let i = 0; i < n; i++) { const b = cardboardBox(0.9, 0.42, 0.8).group; b.position.set((r() - 0.5) * 0.04, y, (r() - 0.5) * 0.04); b.rotation.y = (r() - 0.5) * 0.06; g.add(b); y += 0.42; } return shadows(g); }
// big warehouse shell: concrete floor, corrugated walls, skylights, roll-up door on the back wall
export function warehouse(scene, { w = 14, d = 14, h = 6 } = {}) {
  scene.background = new THREE.Color('#0c0c10');
  const g = new THREE.Group();
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.std({ map: TEX.concrete([5, 5], '#a8a49c'), roughness: 0.75 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  const corr = canvasTex('corr7', 256, 256, (c, W, H) => { for (let x = 0; x < W; x += 16) { const gr = c.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#7a8288'); gr.addColorStop(0.5, '#a8b0b6'); gr.addColorStop(1, '#7a8288'); c.fillStyle = gr; c.fillRect(x, 0, 16, H); } }, { repeat: [6, 2] });
  const wm = M.std({ map: corr, roughness: 0.6, metalness: 0.3 });
  [[w, 0, -d / 2, 0], [d, -w / 2, 0, Math.PI / 2], [d, w / 2, 0, -Math.PI / 2]].forEach(([len, x, z, ry]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(len, h), wm); m.position.set(x, h / 2, z); m.rotation.y = ry; m.receiveShadow = true; g.add(m); });
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.col('#2a2c30', 0.8)); roof.rotation.x = Math.PI / 2; roof.position.y = h; g.add(roof);
  for (let x = -w / 2 + 1; x < w / 2; x += 2.5) box(0.15, 0.3, d, M.col('#3a3c42', 0.5, 0.5), x, h - 0.15, 0, g);
  const door = box(3.2, 3.4, 0.08, M.std({ map: canvasTex('roll7', 128, 256, (c, W, H) => { for (let y = 0; y < H; y += 12) { c.fillStyle = y % 24 ? '#8a9096' : '#a0a6ac'; c.fillRect(0, y, W, 12); } }, { repeat: [1, 3] }), roughness: 0.5, metalness: 0.4 }), 3.5, 1.7, -d / 2 + 0.05, g); void door;
  shadows(g, false, true); scene.add(g);
  scene.add(new THREE.HemisphereLight('#e8eef8', '#3a3028', 0.55));
  for (const [x, z] of [[-3, -2], [3, -2], [0, 2]]) { const lamp = new THREE.Group(); const sh = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.3, 24, 1, true), M.std({ color: '#3a3e44', roughness: 0.4, metalness: 0.6, side: THREE.DoubleSide })); lamp.add(sh); const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), M.emis('#fff2d8', 3)); b.position.y = -0.1; b.userData.noAO = true; lamp.add(b); lamp.position.set(x, h - 0.6, z); scene.add(lamp); }
  return g;
}
export { V };
