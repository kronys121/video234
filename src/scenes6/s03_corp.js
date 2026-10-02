import * as THREE from 'three';
import { cast6, room6, ceilingLamp, chair6, desk6, screen6, plant, woodFloor } from '../lib/sets6.js';
import { idle3 } from '../lib/human3.js';
import { gauge } from '../lib/fantasy.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, hud, shadows } from '../lib/shot.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, shake, lerp, clamp, rng, canvasTex } from '../lib/util.js';
import { SITP } from './s01_cheat.js';

const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
const STAND = { lSh: [0, 0, 7], rSh: [0, 0, -7] };

function graphDraw(g, w, h, t) {
  g.fillStyle = '#0e1218'; g.fillRect(0, 0, w, h); g.strokeStyle = '#26303c'; g.lineWidth = 2; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, h * i / 6); g.lineTo(w, h * i / 6); g.stroke(); }
  g.fillStyle = '#e8eef4'; g.font = `${h * 0.08}px Russo`; g.textAlign = 'left'; g.fillText('ЧИТЕРЫ ОНЛАЙН', w * 0.05, h * 0.12);
  const n = 40, k = clamp(t / 1.6); g.strokeStyle = '#ff3a4a'; g.lineWidth = 8; g.beginPath();
  for (let i = 0; i <= n * k; i++) { const x = w * (0.05 + 0.9 * i / n), y = h * (0.85 - 0.62 * Math.pow(i / n, 1.8) - 0.04 * Math.sin(i * 1.3)); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
  g.stroke(); g.fillStyle = '#ff3a4a'; g.font = `${h * 0.12}px Russo`; g.textAlign = 'right'; g.fillText('▲ ' + Math.round(k * 340) + '%', w * 0.95, h * 0.3);
}

// 5.85–8.40  «Rockstar это очень не нравилось, но обращаться в полицию»
export function buildBoss() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0c0e12');
  room6(scene, { w: 6, d: 6, h: 3, wall: '#c8c4bc', floor: woodFloor('#5a4030', [3, 3]), windowAt: { wall: 'left', rect: [0, 1.6, 2.6, 1.6] }, blinds: false, open: ['front'] });
  scene.add(new THREE.HemisphereLight('#e8eeff', '#3a2a1e', 0.5));
  const name = sign('ROCKSTAR', { width: 1.5, color: '#1a1a1a', size: 140, pad: 10 }); name.position.set(0.55, 2.55, -2.98); scene.add(name);
  const scr = screen6(graphDraw, 1.4, 16 / 9, 0.55, 768); scr.position.set(-0.6, 1.55, -2.92); scr.children.slice(2).forEach((c) => { c.visible = false; }); scene.add(scr);
  const dk = desk6(1.8, 0.85, 0.76, '#3a2418', '#1a1a1e'); dk.position.set(0.3, 0, -1.2); scene.add(solid(dk, 'desk', [], [dk.userData.top]));
  const ch = chair6('#1a1a1e'); ch.position.set(-0.05, 0, -1.95); ch.rotation.y = Math.PI; scene.add(solid(ch, 'chair'));
  const lap = new THREE.Group(); rbox(0.36, 0.016, 0.24, 0.006, M.col('#b8bcc4', 0.3, 0.8), 0, 0.008, 0, lap); const lid = rbox(0.36, 0.23, 0.01, 0.005, M.col('#b8bcc4', 0.3, 0.8), 0, 0.12, -0.12, lap); lid.rotation.x = -0.25; lap.position.set(0.0, 0.76, -1.2); lap.rotation.y = Math.PI; scene.add(shadows(lap));
  const pl = plant(1.2); pl.position.set(2.4, 0, -2.4); scene.add(pl);
  const boss = cast6.exec(); boss.root.position.set(0.85, 0, -1.95); boss.root.rotation.y = -0.6; scene.add(boss.root);
  const sun = new THREE.SpotLight('#fff0dc', 30, 12, 0.7, 0.6, 1.2); sun.position.set(-3.6, 2.6, 0.5); sun.target.position.set(0.3, 0.9, -1.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; scene.add(sun, sun.target);
  point(scene, '#ff5a4a', 4, 4, [-0.6, 1.5, -2.4]);
  const angry = sign('НЕ НРАВИТСЯ', { width: 1.2, color: '#ffffff', bg: '#d4213a', size: 100, pad: 22, border: '#ffffff' }); scene.add(angry);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    scr.userData.live.update(lt);
    const mad = smooth(inv(0.6, 1.1, lt)); const slam = lt > 1.6 ? Math.max(0, Math.sin((lt - 1.6) * 9)) * (lt < 2.0 ? 1 : 0) : 0;
    boss.pose({ ...STAND, rSh: [lerp(0, -40, mad) + slam * 20, 0, -12], rEl: [lerp(-8, -90, mad), 0, 0], rCurl: 0.9, lSh: [-10, 0, 20], lEl: [-60, 0, 0], lCurl: 0.4, spine: [6 * mad, -10, 0], head: [0, -15 * mad, 0] }); idle3(boss, lt, 3, 0.4);
    boss.face({ blink: 0, brows: -1, browTilt: -0.8, mouth: 0.15 + 0.2 * mad });
    pop(angry, lt, 1.0, 0.3);
    const f = kf(lt, [[0, [2.4, 1.7, 1.2], [0.2, 1.4, -2.0], 52, 0.04], [2.55, [1.6, 1.62, -0.3], [0.5, 1.55, -2.2], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004 + slam * 0.01, 10, 2)), f.look, f.roll, f.fov);
    hud(angry, camera, 2.6, 0, 0.5);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

function folder(col = '#c8a86a', label = '') { const g = new THREE.Group(); box(0.32, 0.02, 0.24, M.col(col, 0.8), 0, 0.01, 0, g); if (label) { const s = sign(label, { width: 0.2, color: '#1a1a1a', bg: '#f4f0e6', size: 70, pad: 10 }); s.rotation.x = -Math.PI / 2; s.position.set(0, 0.021, 0); g.add(s); } return shadows(g); }
function policeOffice(scene) {
  scene.background = new THREE.Color('#0c0e12');
  room6(scene, { w: 6, d: 6, h: 2.9, wall: '#7a8a8a', floor: M.std({ map: TEX.tiles([6, 6], '#b8b8b2'), roughness: 0.6 }), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#e8f0ff', '#2a2a2a', 0.55));
  const badge = sign('ПОЛИЦИЯ', { width: 1.6, color: '#ffffff', bg: '#1e3a6a', size: 120, pad: 26, border: '#d8c070' }); badge.position.set(0, 2.25, -2.97); scene.add(badge);
  const dk = desk6(1.9, 0.9, 0.76, '#7a6a5a', '#3a3a40'); dk.position.set(0, 0, -1.3); scene.add(solid(dk, 'desk', [], [dk.userData.top]));
  const ch = chair6('#2a2a30'); ch.position.set(0, 0, -2.05); ch.rotation.y = Math.PI; scene.add(solid(ch, 'chair', ['cop']));
  const cop = cast6.cop(); cop.root.position.set(0, 0, -2.02); scene.add(cop.root); cop.root.userData.allow = ['chair'];
  // towers of case folders
  const piles = []; const r = rng(4);
  [[-0.62, -1.2, 14], [0.62, -1.25, 18], [0.3, -1.05, 6]].forEach(([x, z, n]) => { const pg = new THREE.Group(); for (let i = 0; i < n; i++) { const f = folder(['#c8a86a', '#b8985a', '#d8b87a'][i % 3]); f.position.set((r() - 0.5) * 0.03, i * 0.022, (r() - 0.5) * 0.03); f.rotation.y = (r() - 0.5) * 0.25; pg.add(f); } pg.position.set(x, 0.76, z); scene.add(pg); piles.push(pg); });
  for (const x of [-2.2, 2.2]) { const cab = rbox(0.6, 1.3, 0.5, 0.02, M.col('#5a6068', 0.4, 0.5), x, 0.65, -2.7, scene); void cab; for (let i = 0; i < 3; i++) box(0.2, 0.03, 0.02, M.col('#c8c8cc', 0.3, 0.8), x, 0.3 + i * 0.4, -2.44, scene); }
  const lamp = ceilingLamp(scene, 0, -1.3, 2.9, '#f0f4ff');
  const key = new THREE.SpotLight('#f0f4ff', 25, 10, 0.8, 0.6, 1.2); key.position.set(1.5, 2.8, 1.0); key.target.position.set(0, 0.9, -1.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  return { cop, piles, lamp };
}

// 8.40–11.30  «смысла не было: такими делами там почти не занимаются,»
export function buildPolice() {
  const scene = new THREE.Scene(); const P = policeOffice(scene);
  const no = sign('СМЫСЛА НЕТ', { width: 1.2, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 22, border: '#ffffff' }); scene.add(no);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const sh = smooth(inv(1.2, 1.6, lt)) * (1 - smooth(inv(2.4, 2.8, lt)));
    P.cop.pose({ ...SITP, lSh: [-20, 0, 18 + 35 * sh], rSh: [-20, 0, -18 - 35 * sh], lEl: [-70 - 30 * sh, 0, 0], rEl: [-70 - 30 * sh, 0, 0], lWr: [0, 0, -40 * sh], rWr: [0, 0, 40 * sh], lCurl: 0.1, rCurl: 0.1, spine: [-4, 0, 0], head: [-6, 0, 12 * sh] }); idle3(P.cop, lt, 2, 0.4);
    P.cop.face({ blink: 0, brows: 0.6 * sh - 0.2, mouth: 0.1 + 0.1 * sh, smile: 0.1 });
    pop(no, lt, 0.7, 0.3);
    const f = kf(lt, [[0, [1.6, 1.6, 1.4], [0, 1.2, -1.6], 52, 0.03], [2.9, [-0.8, 1.5, 0.8], [0, 1.25, -1.7], 48, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 3)), f.look, f.roll, f.fov);
    hud(no, camera, 2.8, 0, 0.35);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 11.30–14.55  «а успех был бы маловероятен.»
export function buildOdds() {
  const scene = new THREE.Scene(); const P = policeOffice(scene);
  P.cop.root.visible = false;
  const file = folder('#d8b87a', 'ДЕЛО: ЧИТЫ'); file.scale.setScalar(1.6); file.position.set(-0.05, 0.765, -1.15); file.rotation.y = 0.1; scene.add(file);
  const stamp = new THREE.Group(); rbox(0.12, 0.05, 0.08, 0.01, M.col('#2a2a2e', 0.4), 0, 0.025, 0, stamp); const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.12, 14), M.col('#7a1a1a', 0.5)); handle.position.y = 0.11; stamp.add(handle); const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 10), M.col('#7a1a1a', 0.5)); knob.position.y = 0.18; stamp.add(knob); scene.add(shadows(stamp));
  const ink = sign('МАЛОВЕРОЯТНО', { width: 0.42, color: '#d4213a', size: 110, pad: 12, border: '#d4213a' }); ink.rotation.set(-Math.PI / 2, 0, 0.25); ink.position.set(-0.03, 0.79, -1.13); scene.add(ink);
  const gg = gauge('ШАНС УСПЕХА'); gg.scale.setScalar(0.36); gg.position.set(0.42, 0.98, -1.42); gg.rotation.y = -0.2; scene.add(gg);
  const camera = new THREE.PerspectiveCamera(46, 1080 / 1920, 0.03, 60);
  const HIT = 1.92;
  function update(lt) {
    const down = lt < HIT ? smooth(inv(HIT - 0.4, HIT, lt)) : 1 - smooth(inv(HIT + 0.15, HIT + 0.55, lt));
    stamp.position.set(-0.03, lerp(1.25, 0.785, down), -1.13); stamp.rotation.y = 0.25;
    ink.visible = lt > HIT; const ks = easeOutBack(inv(HIT, HIT + 0.12, lt), 3); ink.scale.setScalar(Math.max(0.001, 1.25 - 0.25 * ks));
    gg.userData.needle.rotation.z = lerp(0, 1.35, smooth(inv(0.2, 1.4, lt))) + Math.sin(lt * 20) * 0.02;
    const f = kf(lt, [[0, [0.55, 1.5, -0.2], [0.15, 0.92, -1.25], 52, 0.04], [3.25, [-0.25, 1.4, -0.3], [0.12, 0.88, -1.25], 48, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, lt > HIT && lt < HIT + 0.25 ? 0.015 : 0.003, 18, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}
