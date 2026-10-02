import * as THREE from 'three';
import { cast6, room6, ceilingLamp, chair6, desk6, screen6, keyboard6, pcTower, plant } from '../lib/sets6.js';
import { idle3 } from '../lib/human3.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
import { box, rbox, poster } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, hud, shadows } from '../lib/shot.js';
import { M, V, setCam, kf, inv, smooth, easeOutElastic, shake, lerp, clamp, rng } from '../lib/util.js';

const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
export const SITP = { hipsY: -0.36, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0] };
export const TYPEP = { ...SITP, lSh: [-33, 0, 10], rSh: [-33, 0, -10], lEl: [-82, 0, 0], rEl: [-82, 0, 0], lCurl: 0.35, rCurl: 0.35, spine: [8, 0, 0], head: [4, 0, 0] };

// generic open-world city at dusk, as seen on the player's monitor
export function cityDraw(g, w, h, t) {
  const sky = g.createLinearGradient(0, 0, 0, h * 0.62); sky.addColorStop(0, '#2a1a4a'); sky.addColorStop(0.55, '#d8603a'); sky.addColorStop(1, '#ffb070'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f0a070'; g.beginPath(); g.arc(w * 0.7, h * 0.5, h * 0.07, 0, 7); g.fill();
  const r = rng(4); const off = (t * 30) % w;
  for (let layer = 0; layer < 2; layer++) { g.fillStyle = layer ? '#1a1424' : '#3a2a44'; for (let x = -off * (layer ? 1 : 0.5); x < w; x += 0) { const bw = w * (0.04 + r() * 0.06), bh = h * (0.12 + r() * (layer ? 0.3 : 0.4)); g.fillRect(x, h * 0.62 - bh, bw - 2, bh); if (layer) { g.fillStyle = '#ffd27a'; for (let wy = h * 0.62 - bh + 8; wy < h * 0.6; wy += 14) for (let wx = x + 5; wx < x + bw - 8; wx += 10) if (r() > 0.55) g.fillRect(wx, wy, 4, 6); g.fillStyle = '#1a1424'; } x += bw; } }
  g.fillStyle = '#2a2a30'; g.fillRect(0, h * 0.62, w, h * 0.38); g.fillStyle = '#ffd27a'; for (let i = 0; i < 8; i++) { const x = ((i * 160 - t * 400) % (w + 200) + w + 200) % (w + 200) - 100; g.fillRect(x, h * 0.8, 70, 8); }
  g.fillStyle = '#c8302a'; g.fillRect(w * 0.38, h * 0.7, w * 0.22, h * 0.07); g.fillStyle = '#1a1a1a'; g.fillRect(w * 0.42, h * 0.65, w * 0.13, h * 0.06); g.beginPath(); g.arc(w * 0.42, h * 0.775, h * 0.025, 0, 7); g.arc(w * 0.56, h * 0.775, h * 0.025, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 4; g.fillStyle = 'rgba(20,30,20,0.7)'; g.beginPath(); g.arc(w * 0.1, h * 0.86, h * 0.1, 0, 7); g.fill(); g.stroke();
}
// cheat menu overlay drawn on top of the game
export function menuDraw(g, w, h, t, open = 1) {
  cityDraw(g, w, h, t);
  if (open <= 0) return;
  const pw = w * 0.36, ph = h * 0.72, px = w * 0.05, py = h * 0.12 - (1 - open) * h;
  g.fillStyle = 'rgba(14,10,30,0.92)'; g.fillRect(px, py, pw, ph); g.strokeStyle = '#a86aff'; g.lineWidth = 4; g.strokeRect(px, py, pw, ph);
  g.fillStyle = '#7a3aff'; g.fillRect(px, py, pw, ph * 0.13); g.fillStyle = '#ffffff'; g.font = `${Math.round(ph * 0.08)}px Russo`; g.textAlign = 'center'; g.fillText('LUNA', px + pw / 2, py + ph * 0.095);
  const items = ['GOD MODE', 'ДЕНЬГИ +$', 'ТЕЛЕПОРТ', 'НЕВИДИМОСТЬ', 'СКОРОСТЬ x5', 'ОРУЖИЕ'];
  items.forEach((it, i) => { const y = py + ph * (0.2 + i * 0.13); const sel = i === Math.floor(t * 2.5) % items.length; if (sel) { g.fillStyle = 'rgba(168,106,255,0.35)'; g.fillRect(px + 6, y - ph * 0.06, pw - 12, ph * 0.11); } g.fillStyle = '#e8e0ff'; g.font = `${Math.round(ph * 0.055)}px Russo`; g.textAlign = 'left'; g.fillText(it, px + pw * 0.08, y + ph * 0.015); const on = (i * 7 + Math.floor(t * 3)) % 3 !== 0; g.fillStyle = on ? '#3aff8a' : '#5a5a6a'; g.beginPath(); g.roundRect(px + pw * 0.74, y - ph * 0.03, pw * 0.18, ph * 0.06, ph * 0.03); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(px + pw * (on ? 0.88 : 0.78), y, ph * 0.024, 0, 7); g.fill(); });
}

// gamer bedroom at night: desk on the back wall, player seated facing -z
export function gamerRoom(scene, draw, { player = 'cheater' } = {}) {
  scene.background = new THREE.Color('#08080c');
  room6(scene, { w: 5.4, d: 5.4, h: 2.7, wall: '#2e3440', floor: null, windowAt: { wall: 'left', rect: [-0.6, 1.6, 1.3, 1.1] }, night: true, open: ['front'] });
  scene.add(new THREE.HemisphereLight('#8a9aff', '#1a1410', 0.25));
  const dk = desk6(1.7, 0.75, 0.75, '#2a2a30', '#1a1a1e'); dk.position.set(0, 0, -2.25); scene.add(solid(dk, 'desk', [], [dk.userData.top]));
  const top = 0.75;
  const mon = screen6(draw, 0.82, 16 / 9, 0.6); mon.position.set(0, top + mon.userData.bottom, -2.42); scene.add(mon);
  const side = screen6((g, w, h) => { g.fillStyle = '#101418'; g.fillRect(0, 0, w, h); g.fillStyle = '#3aa0ff'; for (let i = 0; i < 18; i++) g.fillRect(30, 30 + i * 30, 120 + ((i * 97) % 300), 12); }, 0.5, 9 / 16, 0.6, 512); side.position.set(0.82, top + side.userData.bottom - 0.02, -2.3); side.rotation.y = -0.45; scene.add(side);
  const kb = keyboard6('#a86aff'); kb.position.set(0, top, -1.98); scene.add(kb);
  const pc = pcTower('#a86aff'); pc.position.set(-0.68, top, -2.3); scene.add(pc);
  const strip = box(1.7, 0.01, 0.01, M.emis('#a86aff', 3), 0, top - 0.03, -1.875, scene); strip.userData.noAO = true;
  const p = poster((g, w, h) => { g.fillStyle = '#1a1424'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff6a3a'; g.font = '46px Russo'; g.textAlign = 'center'; g.fillText('CITY', w / 2, h * 0.3); g.fillText('LIFE', w / 2, h * 0.45); g.fillStyle = '#fff'; g.font = '24px Russo'; g.fillText('ONLINE', w / 2, h * 0.6); }, 0.55, 0.78, 'poster6'); p.position.set(1.4, 1.75, -2.69); scene.add(p);
  const pl = plant(1); pl.position.set(2.2, 0, -2.2); scene.add(pl);
  const ch = chair6('#2a2a34'); ch.position.set(0, 0, -1.45); scene.add(solid(ch, 'chair', [player]));
  const pp = cast6[player](); pp.root.position.set(0, 0, -1.48); pp.root.rotation.y = Math.PI; scene.add(pp.root); pp.root.userData.allow = ['chair'];
  point(scene, '#a86aff', 2.5, 4, [0, 0.95, -1.75]); point(scene, '#6aa0ff', 2.5, 5, [0, 1.3, -1.95]);
  const moon = new THREE.SpotLight('#9ab0ff', 18, 9, 0.6, 0.7, 1.3); moon.position.set(-3.2, 2.6, -0.6); moon.target.position.set(0, 0.8, -1.6); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0005; scene.add(moon, moon.target);
  const key = new THREE.SpotLight('#ffd8b0', 10, 8, 0.8, 0.6, 1.3); key.position.set(1.2, 2.5, 0.6); key.target.position.set(0, 1, -1.8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  return { player: pp, mon, top };
}
const typing = (H, lt, seed = 2, amt = 1) => { const ty = Math.sin(lt * 14) * 4 * amt; H.pose({ ...TYPEP, lSh: [-33 + ty, 0, 10], rSh: [-33 - ty, 0, -10] }); idle3(H, lt, seed, 0.3); };

// 0.00–3.00  «В 2021 году самым популярным читом»
export function buildIntro() {
  const scene = new THREE.Scene(); const R = gamerRoom(scene, cityDraw);
  const yr = text3d('2021', { family: 'mont', size: 0.36, depth: 0.1, bevel: 0.014, color: '#ffffff', side: '#7a3aff', emissive: '#a86aff', emissiveIntensity: 0.35 }); yr.position.set(0, 2.15, -2.3); scene.add(yr);
  const top1 = sign('ТОП-1 ЧИТ', { width: 0.6, color: '#ffffff', bg: '#7a3aff', size: 110, pad: 22, border: '#ffffff' }); scene.add(top1);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    R.mon.userData.live.update(lt);
    typing(R.player, lt, 2); R.player.face({ blink: 0, brows: 0.4, smile: 0.6 });
    const k = easeOutElastic(inv(0.1, 0.7, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.08; yr.rotation.y = Math.sin(lt * 1.4) * 0.15;
    pop(top1, lt, 1.6, 0.35);
    const f = kf(lt, [[0, [1.9, 1.9, 1.1], [0, 1.4, -2.0], 54, 0.04], [3.0, [1.25, 1.45, -0.4], [-0.1, 1.25, -2.1], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    hud(top1, camera, 2.4, 0.0, -0.3);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.2, ao: 1.0 };
}

// 3.00–5.85  «для GTA Online было читменю Luna.»
export function buildMenu() {
  const scene = new THREE.Scene(); const R = gamerRoom(scene, (g, w, h, t) => menuDraw(g, w, h, t + 3, smooth(inv(1.0, 1.5, t))));
  const lbl = sign('ЧИТМЕНЮ', { width: 0.42, color: '#ffffff', bg: '#7a3aff', size: 100, pad: 18, border: '#ffffff', emissive: 0.15 }); scene.add(lbl);
  const camera = new THREE.PerspectiveCamera(44, 1080 / 1920, 0.03, 60);
  function update(lt) {
    R.mon.userData.live.update(lt);
    typing(R.player, lt, 5, lt > 1.0 ? 0.3 : 1); R.player.face({ blink: 0, brows: 0.6, smile: 0.9, mouth: 0.2 });
    pop(lbl, lt, 1.45, 0.3); lbl.position.set(0.28, R.top + R.mon.userData.bottom + R.mon.userData.h / 2 + 0.1, -2.38);
    const f = kf(lt, [[0, [0.55, 1.5, -1.0], [0, 1.2, -2.42], 50, 0.03], [2.85, [0.25, 1.3, -1.45], [-0.08, 1.22, -2.42], 40, -0.01]]);
    setCam(camera, f.pos.add(shake(lt, 0.002, 4, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.2, ao: 1.0 };
}
export { typing };
