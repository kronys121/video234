import * as THREE from 'three';
import { M, TEX, canvasTex, glowTex, rng, clamp, lerp, V, smooth, inv, speckle } from './util.js';
import { box, rbox, desk } from './props.js';
import { room } from './rooms.js';
import { point } from './env.js';
import { text3d } from './text3d.js';

export const COL = { purple: '#9146ff', green: '#2ecc71', red: '#ff3b4a', amber: '#ffb347', cyan: '#2fd6ff', pink: '#ff4fa3', gold: '#ffc83a' };

const shadow = (o, cast = true) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = true; } }); return o; };

// ---------- live (per-frame canvas) surfaces. draw(g, w, h, t) must be a pure function of t ----------
export function liveScreen(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  let last = -1;
  return { tex, update(t) { const k = Math.round(t * 30); if (k === last) return; last = k; draw(g, w, h, t); tex.needsUpdate = true; } };
}
export function livePlane(w, h, draw, { px = 512, emissive = 1, transparent = false } = {}) {
  const live = liveScreen(px, Math.round(px * h / w), draw);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: live.tex, emissiveMap: live.tex, emissive: '#ffffff', emissiveIntensity: emissive, roughness: 0.4, transparent, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.userData.live = live; return m;
}
export function monitor(w = 0.62, draw, { aspect = 16 / 9, emissive = 0.9 } = {}) {
  const h = w / aspect; const g = new THREE.Group();
  rbox(w + 0.03, h + 0.03, 0.03, 0.008, M.col('#0c0c10', 0.4, 0.3), 0, 0, 0, g);
  const live = liveScreen(1024, Math.round(1024 / aspect), draw);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: live.tex, emissiveMap: live.tex, emissive: '#ffffff', emissiveIntensity: emissive, roughness: 0.3 }));
  scr.position.z = 0.0155; g.add(scr);
  box(0.04, 0.18, 0.04, M.col('#15151a', 0.4, 0.5), 0, -h / 2 - 0.08, -0.03, g);
  box(0.22, 0.012, 0.15, M.col('#15151a', 0.4, 0.5), 0, -h / 2 - 0.175, -0.01, g);
  shadow(g); scr.castShadow = false;
  g.userData = { live, w, h, bottom: h / 2 + 0.18 };
  return g;
}
export function laptop(draw, w = 0.34) {
  const g = new THREE.Group(); const h = w * 0.62;
  rbox(w, 0.015, w * 0.68, 0.006, M.col('#2a2a32', 0.35, 0.6), 0, 0.0075, 0, g);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.012, -w * 0.33); g.add(hinge);
  rbox(w, h, 0.01, 0.004, M.col('#2a2a32', 0.35, 0.6), 0, h / 2, 0, hinge);
  const live = liveScreen(768, Math.round(768 * h / (w * 0.94)), draw);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.9), new THREE.MeshStandardMaterial({ map: live.tex, emissiveMap: live.tex, emissive: '#ffffff', emissiveIntensity: 0.9, roughness: 0.3 }));
  scr.position.set(0, h / 2, 0.0055); hinge.add(scr);
  hinge.rotation.x = -0.28;
  shadow(g); scr.castShadow = false;
  g.userData = { live, hinge, w, h };
  return g;
}
export function keyboard(accent = COL.purple) {
  const g = new THREE.Group();
  rbox(0.44, 0.02, 0.15, 0.006, M.col('#121218', 0.5, 0.3), 0, 0.01, 0, g);
  const keys = M.col('#23232c', 0.5);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) box(0.026, 0.008, 0.026, keys, -0.19 + c * 0.029, 0.024, -0.05 + r * 0.033, g);
  box(0.44, 0.003, 0.004, M.emis(accent, 3), 0, 0.0215, 0.077, g);
  const mouse = rbox(0.06, 0.025, 0.1, 0.012, M.col('#16161c', 0.4), 0.33, 0.0125, 0, g); void mouse;
  box(0.006, 0.003, 0.09, M.emis(accent, 3), 0.33, 0.0255, 0, g);
  shadow(g); return g;
}

// ---------- Twitch-like UI + platformer + chat ----------
const NAMES = ['Dima_777', 'kot_pro', 'AnnaPlay', 'speedfan', 'xX_Gamer_Xx', 'Lena', 'Max2018', 'roman', 'ProRunner', 'Vika', 'Oleg', 'Sonya'];
const NCOL = ['#ff6b6b', '#ffd23f', '#6bcB77', '#4d96ff', '#c77dff', '#ff9e5e', '#2fd6ff'];
const MSGS = ['РЕКОРД!!!', 'PogChamp', 'ЛЕГЕНДА', 'ВАУ', 'LUL', 'быстрее!', 'GG', 'красиво', 'ааааа!!', 'Kappa', 'СКИП!', 'топ стример', 'вот это темп', 'WR?!', 'Pog'];

export function drawPlatformer(g, x, y, w, h, t) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#5c94fc'; g.fillRect(x, y, w, h);
  const s = h / 224; const speed = 140 * s * 1.6; const gy = y + h * 0.82;
  // hills + clouds
  g.fillStyle = '#3fae3a'; for (let i = -1; i < 4; i++) { const hx = x + ((i * 0.45 * w - t * speed * 0.3) % (w * 1.8) + w * 1.8) % (w * 1.8) - w * 0.2; g.beginPath(); g.ellipse(hx, gy, w * 0.14, h * 0.13, 0, Math.PI, 0); g.fill(); }
  g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) { const cx = x + (((i * 0.37 * w - t * speed * 0.15) % (w * 1.4)) + w * 1.4) % (w * 1.4) - w * 0.2, cy = y + h * (0.14 + (i % 2) * 0.12); g.beginPath(); g.ellipse(cx, cy, w * 0.07, h * 0.05, 0, 0, 7); g.ellipse(cx + w * 0.05, cy + 4, w * 0.05, h * 0.04, 0, 0, 7); g.fill(); }
  // ground bricks
  g.fillStyle = '#c84c0c'; g.fillRect(x, gy, w, y + h - gy);
  g.strokeStyle = '#5a1a00'; g.lineWidth = 2 * s;
  const bw = 32 * s; const off = (t * speed) % bw;
  for (let r = 0; r < 3; r++) { const yy = gy + r * bw * 0.5; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + w, yy); g.stroke(); for (let bx = -bw; bx < w + bw; bx += bw) { const xx = x + bx - off + (r % 2 ? bw / 2 : 0); g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx, yy + bw * 0.5); g.stroke(); } }
  // pipes and coins at fixed world positions
  const wx = t * speed;
  for (let i = 0; i < 6; i++) {
    const px = x + w * 0.9 + i * w * 0.62 - (wx % (w * 0.62 * 6));
    const ppx = ((px - x) % (w * 3.72) + w * 3.72) % (w * 3.72) + x - w * 0.3;
    if (i % 2 === 0) { g.fillStyle = '#18b848'; g.fillRect(ppx, gy - 46 * s, 44 * s, 46 * s); g.fillStyle = '#0a7a2a'; g.fillRect(ppx - 4 * s, gy - 52 * s, 52 * s, 14 * s); }
    else { g.fillStyle = '#ffd23f'; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(ppx + k * 26 * s, gy - 90 * s - (k === 1 ? 14 * s : 0), 8 * s, 11 * s, 0, 0, 7); g.fill(); } }
  }
  // runner (generic plumber-ish pixel hero): bob + legs alternate, periodic jumps
  const jp = (t * 1.6) % 1; const jump = jp < 0.4 ? Math.sin(jp / 0.4 * Math.PI) * 70 * s : 0;
  const hx = x + w * 0.28, hy = gy - 32 * s - jump; const px = 4 * s;
  const R = (cx, cy, cw, ch, col) => { g.fillStyle = col; g.fillRect(hx + cx * px, hy + cy * px, cw * px, ch * px); };
  const leg = Math.floor(t * 12) % 2;
  R(1, 0, 6, 1, '#d62828'); R(0, 1, 8, 1, '#d62828'); R(2, 2, 5, 2, '#f5c28a'); R(1, 3, 1, 1, '#5a3a1a'); R(5, 3, 3, 1, '#5a3a1a');
  R(1, 4, 6, 3, '#d62828'); R(2, 5, 4, 3, '#2848d8'); R(0, 5, 2, 2, '#f5c28a'); R(6, 5, 2, 2, '#f5c28a');
  R(leg ? 1 : 2, 8, 2, 1, '#5a3a1a'); R(leg ? 5 : 4, 8, 2, 1, '#5a3a1a');
  g.restore();
}
export function twitchDraw({ viewers = 12480, title = 'SPEEDRUN WR ATTEMPT', name = 'Quantum', game = true, chat = true, seed = 1, grow = 0, timer = true } = {}) {
  return (g, w, h, t) => {
    g.fillStyle = '#0e0e10'; g.fillRect(0, 0, w, h);
    const vw = chat ? w * 0.7 : w; const top = h * 0.08, vh = h * 0.78;
    g.fillStyle = '#18181b'; g.fillRect(0, 0, w, top);
    g.fillStyle = '#9146ff'; g.fillRect(w * 0.012, top * 0.2, top * 0.6, top * 0.6);
    g.fillStyle = '#fff'; g.font = `${top * 0.5}px Russo`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('twitch', w * 0.012 + top * 0.8, top / 2);
    if (game) drawPlatformer(g, 0, top, vw, vh, t + seed * 3); else { const gr = g.createLinearGradient(0, top, vw, top + vh); gr.addColorStop(0, '#2a1650'); gr.addColorStop(1, '#0d2a4a'); g.fillStyle = gr; g.fillRect(0, top, vw, vh); }
    g.fillStyle = '#eb0400'; g.fillRect(vw * 0.02, top + vh * 0.04, vw * 0.1, vh * 0.07); g.fillStyle = '#fff'; g.font = `${vh * 0.05}px Russo`; g.textAlign = 'center'; g.fillText('LIVE', vw * 0.07, top + vh * 0.075);
    const n = Math.round(viewers + grow * t);
    g.fillStyle = 'rgba(0,0,0,0.65)'; g.fillRect(vw * 0.74, top + vh * 0.04, vw * 0.24, vh * 0.07); g.fillStyle = '#fff'; g.textAlign = 'right'; g.font = `${vh * 0.05}px Russo`; g.fillText(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '), vw * 0.97, top + vh * 0.075);
    if (timer) { const tt = 42 + t; g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(vw * 0.02, top + vh * 0.86, vw * 0.3, vh * 0.1); g.fillStyle = '#7dff9a'; g.textAlign = 'left'; g.font = `${vh * 0.075}px Russo`; g.fillText(`00:${String(Math.floor(tt % 60)).padStart(2, '0')}.${String(Math.floor((tt % 1) * 100)).padStart(2, '0')}`, vw * 0.035, top + vh * 0.91); }
    g.fillStyle = '#9146ff'; g.beginPath(); g.arc(w * 0.03, top + vh + (h - top - vh) * 0.5, h * 0.045, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = `${h * 0.045}px Russo`; g.fillText(name, w * 0.065, top + vh + (h - top - vh) * 0.32); g.fillStyle = '#adadb8'; g.font = `${h * 0.032}px Russo`; g.fillText(title, w * 0.065, top + vh + (h - top - vh) * 0.7);
    if (chat) {
      const cx = vw; g.fillStyle = '#18181b'; g.fillRect(cx, top, w - cx, h - top);
      g.fillStyle = '#adadb8'; g.font = `${h * 0.032}px Russo`; g.textAlign = 'center'; g.fillText('ЧАТ', cx + (w - cx) / 2, top + h * 0.04);
      const rate = 3.6, nn = Math.floor(t * rate + seed * 50), fr = (t * rate + seed * 50) % 1; const row = h * 0.062;
      for (let i = 0; i < 13; i++) {
        const idx = nn - i; const r = rng(idx * 7 + 3); const y = h - h * 0.03 - i * row - fr * row;
        if (y < top + h * 0.07) continue;
        g.textAlign = 'left'; g.font = `${h * 0.034}px Russo`; g.fillStyle = NCOL[Math.floor(r() * NCOL.length)]; const nm = NAMES[Math.floor(r() * NAMES.length)]; g.fillText(nm + ':', cx + w * 0.012, y);
        const nw = g.measureText(nm + ': ').width; g.fillStyle = '#efeff1'; g.fillText(MSGS[Math.floor(r() * MSGS.length)], cx + w * 0.012 + nw, y);
      }
    }
  };
}

// ---------- logos / money / cards / phones ----------
export function twitchLogo(size = 1, glow = 0.6) {
  const g = new THREE.Group(); const m = M.std({ color: '#9146ff', roughness: 0.3, emissive: '#6a2ee0', emissiveIntensity: glow });
  rbox(1, 1, 0.2, 0.09, m, 0, 0, 0, g);
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.34, 0); sh.lineTo(0, -0.34); sh.lineTo(0, 0);
  const tail = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: false }), m); tail.position.set(-0.4, -0.5, -0.1); g.add(tail);
  const w = M.col('#ffffff', 0.35, 0, { emissive: '#ffffff', emissiveIntensity: 0.4 });
  rbox(0.11, 0.34, 0.22, 0.02, w, -0.13, 0.1, 0, g); rbox(0.11, 0.34, 0.22, 0.02, w, 0.14, 0.1, 0, g);
  g.scale.setScalar(size); shadow(g); return g;
}
export const billTex = () => canvasTex('bill', 256, 112, (g, w, h) => {
  g.fillStyle = '#86bd84'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2d6a3a'; g.lineWidth = 5; g.strokeRect(7, 7, w - 14, h - 14);
  g.beginPath(); g.ellipse(w / 2, h / 2, 30, 36, 0, 0, 7); g.fillStyle = '#b4dcb0'; g.fill(); g.stroke();
  g.fillStyle = '#1f5a2c'; g.font = '44px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', w / 2, h / 2 + 2); g.font = '22px Russo'; g.fillText('100', 32, 26); g.fillText('100', w - 32, h - 26);
  speckle(g, w, h, 300, ['rgba(40,90,50,0.35)'], 0.5, 1.5, 4);
}, { repeat: [1, 1] });
const sideTex = () => canvasTex('billSide', 64, 64, (g, w, h) => { g.fillStyle = '#e9efe4'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 4) { g.fillStyle = y % 8 ? '#9ec99a' : '#cfe3ca'; g.fillRect(0, y, w, 2); } g.fillStyle = '#c8a24a'; g.fillRect(0, h / 2 - 5, w, 10); }, { repeat: [1, 1] });
export function cashStack(w = 0.16, h = 0.05, d = 0.07) {
  const side = M.std({ map: sideTex(), roughness: 0.9 }), top = M.std({ map: billTex(), roughness: 0.8 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, top, top, side, side]); m.castShadow = true; m.receiveShadow = true; return m;
}
export function moneyPile(rows = 4, cols = 5, seed = 1, scale = 1) {
  const g = new THREE.Group(); const r = rng(seed); const w = 0.16 * scale, h = 0.05 * scale, d = 0.07 * scale;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols - y; x++) for (let z = 0; z < 2; z++) {
    const s = cashStack(w, h, d); s.position.set((x - (cols - y - 1) / 2) * (w + 0.004) + (r() - 0.5) * 0.006, h / 2 + y * h, (z - 0.5) * (d + 0.004)); s.rotation.y = (r() - 0.5) * 0.12; g.add(s); s.userData.order = y * 20 + x + z * 0.5;
  }
  g.userData.count = g.children.length; return g;
}
export function coin(r = 0.03) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, r * 0.16, 20), M.col(COL.gold, 0.25, 0.9, { emissive: '#8a5a00', emissiveIntensity: 0.25 })); m.rotation.x = Math.PI / 2;
  const g = new THREE.Group(); g.add(m); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return g;
}
export function moneyBag(size = 0.3, label = '$') {
  const g = new THREE.Group(); const m = M.col('#6b5a3c', 0.9);
  const body = new THREE.Mesh(new THREE.SphereGeometry(size * 0.5, 22, 16), m); body.scale.set(1, 1.05, 1); body.position.y = size * 0.5; g.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.16, size * 0.3, size * 0.25, 16), m); neck.position.y = size * 1.05; g.add(neck);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(size * 0.17, size * 0.03, 8, 20), M.col('#b8913a', 0.5)); tie.rotation.x = Math.PI / 2; tie.position.y = size * 1.0; g.add(tie);
  const top = new THREE.Mesh(new THREE.ConeGeometry(size * 0.28, size * 0.2, 14, 1, true), m); top.position.y = size * 1.25; g.add(top);
  const t = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.5, size * 0.5), new THREE.MeshBasicMaterial({ map: canvasTex('bagS' + label, 128, 128, (c, w, h) => { c.font = '110px Russo'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#e9d9a0'; c.fillText(label, w / 2, h / 2 + 4); }, { repeat: [1, 1] }), transparent: true }));
  t.position.set(0, size * 0.55, size * 0.5); g.add(t); shadow(g); g.userData.label = t; return g;
}
export function creditCard(color = '#1b4b9a', num = '4276 5500 1234 9087', scale = 1) {
  const tex = canvasTex('card' + color + num, 512, 324, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, color); gr.addColorStop(1, '#0a0f2a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(w * 0.85, h * 0.15, 130, 0, 7); g.fill();
    g.fillStyle = '#d9b44a'; g.fillRect(48, 108, 72, 54); g.strokeStyle = '#8a6a1a'; g.lineWidth = 2; g.strokeRect(48, 108, 72, 54);
    g.fillStyle = '#fff'; g.font = '44px Russo'; g.textAlign = 'left'; g.fillText(num, 40, 238); g.font = '26px Russo'; g.fillText('BANK', 40, 56); g.fillText('12/27  IVAN IVANOV', 40, 290);
  }, { repeat: [1, 1] });
  const g = new THREE.Group();
  rbox(0.0856, 0.054, 0.002, 0.0008, M.col('#0a0f2a', 0.4), 0, 0, 0, g);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.0856, 0.054), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.2 })); f.position.z = 0.0011; g.add(f);
  const b = f.clone(); b.rotation.y = Math.PI; b.position.z = -0.0011; g.add(b);
  g.scale.setScalar(scale); return g;
}
export function phone(draw, w = 0.075) {
  const g = new THREE.Group(); const h = w * 2.05;
  rbox(w, h, 0.009, 0.004, M.col('#0b0b10', 0.3, 0.6), 0, 0, 0, g);
  const live = liveScreen(360, Math.round(360 * 0.93 * h / (w * 0.94)), draw);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.94), new THREE.MeshStandardMaterial({ map: live.tex, emissiveMap: live.tex, emissive: '#fff', emissiveIntensity: 0.9, roughness: 0.25 }));
  scr.position.z = 0.0048; g.add(scr); shadow(g); scr.castShadow = false; g.userData = { live, w, h }; return g;
}

// falling money / coins, closed-form motion. update(t)
export function moneyRain({ n = 60, seed = 1, area = [3, 3], top = 3.2, floor = 0, life = [1.6, 2.6], center = [0, 0, 0], coins = 0.3 } = {}) {
  const g = new THREE.Group(); const r = rng(seed); const items = [];
  const bm = new THREE.MeshStandardMaterial({ map: billTex(), side: THREE.DoubleSide, roughness: 0.8 });
  const bgeo = new THREE.PlaneGeometry(0.16, 0.07);
  for (let i = 0; i < n; i++) {
    const isCoin = r() < coins; const m = isCoin ? coin(0.022) : new THREE.Mesh(bgeo, bm);
    if (!isCoin) { m.castShadow = false; }
    m.userData = { x: (r() - 0.5) * area[0], z: (r() - 0.5) * area[1], L: life[0] + r() * (life[1] - life[0]), off: r(), sp: [r() * 6, r() * 6, r() * 6], sw: r() * 0.4, ph: r() * 6 };
    g.add(m); items.push(m);
  }
  g.userData.update = (t) => {
    items.forEach((m) => {
      const u = m.userData; const k = ((t / u.L + u.off) % 1);
      m.position.set(center[0] + u.x + Math.sin(t * 2 + u.ph) * u.sw, lerp(top, floor, k * k * 0.4 + k * 0.6), center[2] + u.z + Math.cos(t * 1.7 + u.ph) * u.sw);
      m.rotation.set(u.sp[0] * t, u.sp[1] * t, u.sp[2] * t);
    });
  };
  return g;
}

// ---------- streamer room ----------
export function gamingChair(accent = COL.purple) {
  const g = new THREE.Group(); const dark = M.col('#17171d', 0.6), ac = M.col(accent, 0.45, 0, { emissive: accent, emissiveIntensity: 0.15 });
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const l = box(0.3, 0.035, 0.05, dark, Math.cos(a) * 0.15, 0.07, Math.sin(a) * 0.15, g); l.rotation.y = -a; const c = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), dark); c.position.set(Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3); g.add(c); }
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 12), M.col('#2a2a32', 0.4, 0.7)); st.position.y = 0.23; g.add(st);
  rbox(0.5, 0.09, 0.5, 0.04, dark, 0, 0.46, 0, g);
  const back = rbox(0.5, 0.85, 0.1, 0.05, dark, 0, 0.95, -0.24, g); back.rotation.x = -0.1;
  for (const x of [-0.17, 0.17]) { const s = rbox(0.07, 0.72, 0.11, 0.025, ac, x, 0.93, -0.235, g); s.rotation.x = -0.1; }
  const hr = rbox(0.28, 0.18, 0.09, 0.04, ac, 0, 1.46, -0.27, g); hr.rotation.x = -0.1;
  for (const x of [-0.29, 0.29]) { box(0.06, 0.04, 0.3, dark, x, 0.72, 0.0, g); box(0.04, 0.22, 0.04, dark, x, 0.6, -0.05, g); }
  shadow(g); return g;
}
export function neonStrip(len, color, intensity = 3) { return box(len, 0.025, 0.025, M.emis(color, intensity)); }

/**
 * Dark streamer room. faceCam=false: desk against the back wall, streamer seated facing -z (seen from behind).
 * faceCam=true: streamer seated against the back wall facing +z, monitors angled in on both sides.
 * draws: array of draw fns for the 2 monitors.
 */
export function streamRoom(scene, { faceCam = false, draws = null, accent = COL.purple, accent2 = COL.cyan, w = 6.4, d = 6.4 } = {}) {
  const wall = M.std({ color: '#181422', roughness: 0.92 });
  const R = room({ w, d, h: 3.1, wall, floor: M.std({ map: TEX.carpet([5, 5], '#1d1a28'), roughness: 1 }), ceil: M.col('#0e0c14', 1), open: ['front'] }); scene.add(R);
  const backZ = -d / 2;
  const dk = desk(2.2, 0.9, 0.76, '#2a2a34'); scene.add(dk);
  const deskZ = faceCam ? backZ + 1.25 : backZ + 0.7; dk.position.set(0, 0, deskZ);
  const dTop = 0.79;
  const dr = draws || [twitchDraw({ viewers: 12480, grow: 40, seed: 1 }), twitchDraw({ viewers: 12480, chat: false, seed: 5, title: 'ЗАБЕГ НА РЕКОРД' })];
  const mons = []; let kb = null;
  const mk = (i) => monitor(0.62, dr[i % dr.length]);
  if (faceCam) {
    for (const s of [-1, 1]) { const m = mk(s > 0 ? 0 : 1); m.position.set(0.82 * s, dTop + m.userData.bottom, deskZ - 0.15); m.rotation.y = Math.PI + 0.55 * s; scene.add(m); mons.push(m); }
    kb = keyboard(accent); kb.position.set(0, dTop, deskZ + 0.12); scene.add(kb);
  } else {
    for (const s of [-1, 1]) { const m = mk(s > 0 ? 0 : 1); m.position.set(0.37 * s, dTop + m.userData.bottom, deskZ - 0.15); m.rotation.y = -0.12 * s; scene.add(m); mons.push(m); }
    kb = keyboard(accent); kb.position.set(0, dTop, deskZ + 0.32); scene.add(kb);
  }
  const chair = gamingChair(accent);
  const seatZ = faceCam ? backZ + 0.95 : deskZ + 0.78;
  if (faceCam) { chair.position.set(0, 0, seatZ); } else { chair.position.set(0, 0, seatZ); chair.rotation.y = Math.PI; }
  scene.add(chair);
  // wall dressing: LED strips, neon sign, shelf with figures, posters
  const strip = neonStrip(3.4, accent, 3); strip.position.set(0, 2.55, backZ + 0.03); scene.add(strip);
  const strip2 = neonStrip(3.4, accent2, 3); strip2.position.set(0, 0.35, backZ + 0.03); scene.add(strip2);
  for (const s of [-1, 1]) { const v = box(0.025, 2.2, 0.025, M.emis(s > 0 ? accent2 : accent, 2.5), s * 1.7, 1.45, backZ + 0.03); void v; scene.add(v); }
  const r = rng(5);
  const shelf = box(1.4, 0.04, 0.22, M.col('#2a2a34', 0.5), faceCam ? -2.3 : 2.2, 1.7, faceCam ? backZ + 0.12 : backZ + 0.12, scene); shelf.castShadow = true;
  for (let i = 0; i < 6; i++) { const c = ['#ff4fa3', '#2fd6ff', '#ffc83a', '#9146ff', '#2ecc71', '#ff3b4a'][i]; const f = rbox(0.1, 0.12 + r() * 0.1, 0.1, 0.03, M.col(c, 0.5), shelf.position.x - 0.55 + i * 0.22, 1.8, shelf.position.z, scene); f.castShadow = true; }
  const lampMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), M.emis('#ffd9a0', 4)); lampMesh.position.set(faceCam ? -1.25 : 1.25, dTop + 0.3, deskZ - 0.1); scene.add(lampMesh);
  // lights
  scene.add(new THREE.HemisphereLight('#6a5aa8', '#1a1420', 0.5));
  const warm = point(scene, '#ffb870', 6, 7, [faceCam ? -1.25 : 1.25, dTop + 0.5, deskZ + 0.1]);
  const pl = point(scene, accent, 7, 6, [0, 1.6, deskZ + 0.4]);
  const cy = point(scene, accent2, 5, 7, [faceCam ? 2.2 : -2.2, 2.0, backZ + 0.8]);
  const key = new THREE.SpotLight('#ffe2c0', 22, 9, 0.8, 0.7, 1.4); key.position.set(0.6, 3.0, deskZ + 2.0); key.target.position.set(0, 0.9, faceCam ? backZ + 0.8 : deskZ); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0006; key.shadow.radius = 4; scene.add(key, key.target);
  const update = (t) => { mons.forEach((m) => m.userData.live.update(t)); };
  return { R, dk, dTop, deskZ, backZ, seatZ, mons, chair, kb, update, lights: { warm, pl, cy, key }, strips: [strip, strip2] };
}

// ---------- hackers' den ----------
export function matrixDraw(seed = 1, color = '#2dff6a') {
  const CH = '01ABCDEF$#%';
  return (g, w, h, t) => {
    g.fillStyle = '#020a05'; g.fillRect(0, 0, w, h); const cols = 26; const cw = w / cols; g.font = `${cw * 0.95}px Russo`; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let c = 0; c < cols; c++) {
      const r = rng(c * 31 + seed * 7); const sp = 0.25 + r() * 0.5; const off = r(); const head = ((t * sp + off) % 1) * (h * 1.4);
      for (let k = 0; k < 14; k++) { const y = head - k * cw * 1.05; if (y < -cw || y > h + cw) continue; const ch = CH[Math.floor(rng(c * 99 + k + Math.floor(t * 6 + k))() * CH.length)]; g.fillStyle = k === 0 ? '#eafff0' : color; g.globalAlpha = Math.max(0.05, 1 - k / 14); g.fillText(ch, c * cw + cw / 2, y); }
    }
    g.globalAlpha = 1;
  };
}
export function denSet(scene, { w = 6.4, d = 6.4 } = {}) {
  const wall = M.std({ map: TEX.brick([5, 2]), color: '#4a4a52', roughness: 0.95 });
  const R = room({ w, d, h: 3.2, wall, floor: M.std({ map: TEX.concrete([5, 5], '#3a3a42'), roughness: 0.8 }), ceil: M.col('#0c0c10', 1), open: ['front'] }); scene.add(R);
  const backZ = -d / 2; const r = rng(7);
  // server rack with blinking LEDs, pipes, neon sign
  const rack = box(0.9, 2.2, 0.6, M.col('#14141a', 0.5, 0.4), -2.2, 1.1, backZ + 0.5, scene); rack.castShadow = true;
  const leds = []; for (let i = 0; i < 14; i++) { const l = box(0.05, 0.02, 0.02, M.emis(i % 3 ? '#2dff6a' : '#ff3b4a', 3), -2.45 + (i % 5) * 0.12, 0.4 + Math.floor(i / 5) * 0.45 + r() * 0.1, backZ + 0.82, scene); leds.push(l); }
  for (const x of [-1.2, 1.9, 2.3]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 10), M.col('#3a3a42', 0.5, 0.6)); p.position.set(x, 1.6, backZ + 0.15); scene.add(p); }
  const neon = text3d('ВЗЛОМ', { family: 'mont', size: 0.34, depth: 0.05, bevel: 0.006, color: '#d8ffe4', side: '#1aaa4a', emissive: '#2dff6a', emissiveIntensity: 0.9 }); neon.position.set(1.4, 2.5, backZ + 0.12); scene.add(neon);
  scene.add(new THREE.HemisphereLight('#2a4a3a', '#10101a', 0.55));
  const g1 = point(scene, '#2dff6a', 9, 7, [0, 1.6, backZ + 1.4]); const r1 = point(scene, '#ff3b4a', 5, 7, [2.4, 1.2, backZ + 1.6]);
  const key = new THREE.SpotLight('#cfe8ff', 18, 9, 0.8, 0.7, 1.4); key.position.set(0, 3.0, 0.2); key.target.position.set(0, 1, backZ + 1.2); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0006; scene.add(key, key.target);
  return { R, backZ, leds, neon, lights: { g1, r1, key }, update(t) { leds.forEach((l, i) => { l.visible = Math.sin(t * (3 + i) + i * 2) > -0.4; }); } };
}
