import * as THREE from 'three';
import { cast8, gameBox8, trophy, prizeJar, scepter, scythe, itemSword, itemOrb, itemRing, itemCombined } from '../lib/sets8.js';
import { room6, desk6, chair6, plant, woodFloor, screen6, keyboard6, ceilingLamp } from '../lib/sets6.js';
import { badge } from '../lib/cs.js';
import { idle3 } from '../lib/human3.js';
import { moneyPile, moneyRain, phone, livePlane } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, popOut, hud, shadows } from '../lib/shot.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';
import { text3d, STAND, SITP, typing, editorDraw } from './s01_mod.js';

// generic MOBA match view for screens
export function matchDraw(g, w, h, t) {
  g.fillStyle = '#2a3a22'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a5a2e'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % w, (i * 53) % h, 40, 30);
  g.strokeStyle = '#c8a870'; g.lineWidth = h * 0.05; g.beginPath(); g.moveTo(0, h * 0.8); g.lineTo(w, h * 0.3); g.stroke();
  const r = rng(2); for (let i = 0; i < 10; i++) { const x = ((r() * w + t * 60 * (i % 2 ? 1 : -1)) % w + w) % w, y = h * (0.3 + r() * 0.5); g.fillStyle = i % 2 ? '#3aaa5a' : '#c83a2a'; g.beginPath(); g.arc(x, y, h * 0.03, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, h * 0.86, w, h * 0.14); g.fillStyle = '#ffd27a'; g.font = `${h * 0.08}px Russo`; g.textAlign = 'center'; g.fillText(`${12 + Math.floor(t * 2)} : ${9 + Math.floor(t)}`, w / 2, h * 0.95);
}

// office with three devs playing at their desks (back wall), seated facing -z
function valveOffice(scene) {
  scene.background = new THREE.Color('#0a0a0e');
  room6(scene, { w: 7, d: 6, h: 3, wall: '#c8c4b8', floor: M.std({ map: TEX.carpet([5, 5], '#4a4e58'), roughness: 1 }), windowAt: { wall: 'back', rect: [2.4, 1.7, 1.4, 1.2] }, open: ['front'] });
  scene.add(new THREE.HemisphereLight('#f0f0ff', '#2a2420', 0.55));
  const devs = [cast8.dev1('d1'), cast8.dev2('d2'), cast8.exec('d3')];
  devs.forEach((H, i) => {
    const x = -1.6 + i * 1.5; const dk = desk6(1.2, 0.7, 0.75, '#e8e4dc', '#3a3a40'); dk.position.set(x, 0, -2.3); scene.add(solid(dk, 'desk' + i, [], [dk.userData.top]));
    const s = screen6(matchDraw, 0.6, 16 / 9, 0.6, 512); s.position.set(x, 0.75 + s.userData.bottom, -2.45); scene.add(s); H.scr = s;
    const kb = keyboard6('#c8282a'); kb.position.set(x, 0.75, -2.08); scene.add(kb);
    const ch = chair6('#2a2a30'); ch.position.set(x, 0, -1.55); scene.add(solid(ch, 'chair' + i, ['d' + (i + 1)]));
    H.root.position.set(x, 0, -1.58); H.root.rotation.y = Math.PI; scene.add(H.root); H.root.userData.allow = ['chair' + i];
  });
  const logo = sign('VALVE', { width: 1.4, color: '#ff8a2a', size: 140, pad: 14, emissive: 0.5 }); logo.position.set(-0.6, 2.4, -2.98); scene.add(logo);
  ceilingLamp(scene, -1.0, -1.6, 3); ceilingLamp(scene, 1.2, -1.6, 3);
  const key = new THREE.SpotLight('#fff0dc', 22, 11, 0.8, 0.6, 1.2); key.position.set(1.5, 2.9, 1.5); key.target.position.set(0, 1, -2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  return { devs };
}
// 21.85–25.85  «К 2009 году сотрудники Valve сами играли в DotA,»
export function buildValve() {
  const scene = new THREE.Scene(); const O = valveOffice(scene);
  const yr = text3d('2009', { family: 'mont', size: 0.34, depth: 0.09, bevel: 0.013, color: '#ffffff', side: '#c86a1a', emissive: '#ff8a2a', emissiveIntensity: 0.3 }); yr.position.set(0.8, 2.45, -2.6); scene.add(yr);
  const t1 = sign('VALVE ИГРАЕТ В DOTA', { width: 1.4, color: '#ffffff', bg: '#c86a1a', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  function update(lt) {
    O.devs.forEach((H, i) => { H.scr.userData.live.update(lt + i); typing(H, lt, i * 3, 1); H.face({ blink: 0, brows: 0.3, smile: 0.5 + 0.3 * Math.sin(lt * 2 + i) }); });
    const k = easeOutElastic(inv(0.25, 0.85, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.23;
    pop(t1, lt, 2.3, 0.3);
    const f = kf(lt, [[0, [2.8, 2.2, 2.2], [-0.4, 1.5, -2.3], 58, 0.03], [4.0, [-2.6, 2.0, 1.6], [0.3, 1.5, -2.3], 58, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.8, 0, -0.5);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.25, ao: 1.0 };
}

// 25.85–29.35  «и компания наняла IceFrog делать отдельную игру.»
export function buildHire() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a0e');
  room6(scene, { w: 6, d: 6, h: 3, wall: '#2e3440', floor: woodFloor('#4a3424'), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#d8e0ff', '#201a14', 0.45));
  const logo = sign('VALVE', { width: 1.4, color: '#ff8a2a', size: 140, pad: 14, emissive: 0.5 }); logo.position.set(0, 2.35, -2.97); scene.add(logo);
  const E = cast8.exec(), I = cast8.icefrog(); E.root.position.set(0.5, 0, -1.4); E.root.rotation.y = -Math.PI / 2 + 0.3; I.root.position.set(-0.45, 0, -1.4); I.root.rotation.y = Math.PI / 2 - 0.3; scene.add(E.root, I.root);
  const bd = badge('СОТРУДНИК', '#ff8a2a'); bd.scale.setScalar(1.3); I.J.chest.add(bd); bd.position.set(0.09, 0.12, 0.165);
  const bx = gameBox8('НОВАЯ ИГРА', 'В РАЗРАБОТКЕ', '#5a1a1a', '#14141a'); bx.scale.setScalar(1.8); scene.add(bx);
  const key = new THREE.SpotLight('#fff0dc', 24, 10, 0.7, 0.6, 1.2); key.position.set(1.2, 2.9, 1.6); key.target.position.set(0, 1, -1.4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  point(scene, '#ff8a3a', 5, 4, [0, 2.0, -2.6]);
  const t1 = sign('НАНЯЛИ ICEFROG', { width: 1.2, color: '#ffffff', bg: '#c86a1a', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('ОТДЕЛЬНАЯ ИГРА', { width: 1.1, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const shakeT = 0.6;
  function update(lt) {
    const sh = smooth(inv(shakeT, shakeT + 0.3, lt)) * (1 - smooth(inv(2.0, 2.3, lt))); const bob = Math.sin(lt * 10) * 6 * sh;
    E.pose({ ...STAND, rSh: [-45 * sh + bob, 0, -8], rEl: [-30 * sh, 0, 0], rCurl: 0.6, lSh: [-6, 0, 10] }); idle3(E, lt, 2, 0.3); E.face({ blink: 0, smile: 0.7, brows: 0.2 });
    I.pose({ ...STAND, rSh: [-45 * sh - bob, 0, -8], rEl: [-30 * sh, 0, 0], rCurl: 0.6, lSh: [-6, 0, 10] }); idle3(I, lt, 4, 0.3); I.face({ blink: 0, smile: 0.9, brows: 0.4, mouth: 0.2 });
    pop(bx, lt, 2.5, 0.4, 2.2, 1.8); bx.position.set(0.02, 1.95, -1.3); bx.rotation.y = Math.sin(lt * 1.5) * 0.3;
    pop(t1, lt, 0.75, 0.3); pop(t2, lt, 2.75, 0.3);
    const f = kf(lt, [[0, [0.3, 1.6, 1.6], [0, 1.4, -1.4], 50, 0.03], [3.5, [-0.4, 1.7, 2.0], [0, 1.6, -1.4], 52, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.92); hud(t2, camera, 2.6, 0, -0.42);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}

// 29.35–33.00  «В 2011 году, ещё до выхода Dota 2,»
export function buildSoon() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#07070c');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), M.std({ color: '#16161e', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.4));
  const ped = rbox(0.9, 0.9, 0.9, 0.03, M.col('#2a2a32', 0.4), 0, 0.45, 0, scene); void ped;
  const bx = gameBox8('DOTA 2', 'СКОРО', '#a8281e', '#14141a'); bx.scale.setScalar(2.4); bx.position.set(0, 0.9 + 0.504 + 0.01, 0); scene.add(bx);
  const tape = new THREE.Group(); for (const s of [-1, 1]) { const t = sign('В РАЗРАБОТКЕ', { width: 1.3, color: '#1a1a1a', bg: '#ffd23a', size: 70, pad: 8 }); t.rotation.z = 0.35 * s; t.position.set(0, 0, 0.09 + (s > 0 ? 0.004 : 0)); tape.add(t); } tape.position.set(0, 1.42, 0); scene.add(tape);
  const yr = text3d('2011', { family: 'mont', size: 0.36, depth: 0.09, bevel: 0.013, color: '#ffffff', side: '#a8281e', emissive: '#ff4a3a', emissiveIntensity: 0.3 }); yr.position.set(0, 2.35, -0.3); scene.add(yr);
  const spot = new THREE.SpotLight('#fff0dc', 34, 8, 0.4, 0.5, 1.2); spot.position.set(0.5, 4.5, 2); spot.target.position.set(0, 1.2, 0); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); scene.add(spot, spot.target);
  const t1 = sign('ИГРА ЕЩЁ НЕ ВЫШЛА', { width: 1.3, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const k = easeOutElastic(inv(0.15, 0.75, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.13;
    bx.rotation.y = Math.sin(lt * 0.9) * 0.25; tape.rotation.y = bx.rotation.y;
    const kt = smooth(inv(2.0, 2.3, lt)); tape.scale.setScalar(Math.max(0.001, kt)); tape.visible = kt > 0.01;
    pop(t1, lt, 2.9, 0.3);
    const f = kf(lt, [[0, [1.2, 1.6, 3.2], [0, 1.6, 0], 50, 0.03], [3.65, [-0.6, 1.5, 2.4], [0, 1.6, 0], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, -0.42);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 1.0 };
}

// esports stage shared by the tournament shots
export function tiStage(scene) {
  scene.background = new THREE.Color('#05050a');
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.std({ color: '#121218', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  rbox(8, 0.3, 4, 0.04, M.col('#1a1a24', 0.4), 0, 0.15, 0, scene); const edge = box(8, 0.04, 0.04, M.emis('#3ad0ff', 3), 0, 0.3, 2.0, scene); edge.userData.noAO = true;
  scene.add(new THREE.HemisphereLight('#a0b0ff', '#100810', 0.35));
  const scr = livePlane(5.4, 3.0, matchDraw, { px: 768, emissive: 0.45 }); scr.position.set(0, 3.4, -3.2); scene.add(scr); box(5.6, 3.2, 0.1, M.col('#0a0a0e', 0.4), 0, 3.4, -3.27, scene);
  const P = [];
  for (const side of [-1, 1]) {
    const dk = desk6(1.6, 0.6, 0.74, '#1e1e26', '#2a2a30'); dk.position.set(side * 1.9, 0.3, -0.4); scene.add(solid(dk, 'tdesk' + side, [], [dk.userData.top]));
    const col = side < 0 ? '#2a8a5a' : '#c83a2a';
    for (const k of [-1, 1]) { const n = 'pl' + side + k; const H = cast8.pro(n, col, k > 0 ? '#e2b08c' : '#c08a68', k > 0 ? '#2a1a12' : '#d8b060'); const x = side * 1.9 + k * 0.4; H.root.position.set(x, 0.3, 0.52); H.root.rotation.y = Math.PI; scene.add(H.root); P.push(H); const ch = chair6(col); ch.position.set(x, 0.3, 0.55); scene.add(solid(ch, 'tch' + n, [n])); H.root.userData.allow = ['tch' + n]; const s = screen6(matchDraw, 0.46, 16 / 9, 0.6, 384); s.position.set(x, 0.3 + 0.74 + s.userData.bottom, -0.5); scene.add(s); P[P.length - 1].scr = s; }
  }
  const r = rng(3); const pts = [], cols = [];
  for (let i = 0; i < 1400; i++) { const row = Math.floor(r() * 9); const ang = (r() - 0.5) * 2.4; const rad = 8 + row * 0.9; pts.push(Math.sin(ang) * rad, 0.6 + row * 0.55 + r() * 0.15, 5.5 + Math.cos(ang) * rad * 0.6); const c = new THREE.Color(r() > 0.7 ? '#ffd28a' : r() > 0.5 ? '#3ad0ff' : '#8ab0ff'); cols.push(c.r, c.g, c.b); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); pg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.85, map: glowTex(), blending: THREE.AdditiveBlending, depthWrite: false })));
  const beams = []; for (let i = 0; i < 6; i++) { const bm = new THREE.Mesh(new THREE.ConeGeometry(0.9, 9, 24, 1, true), new THREE.MeshBasicMaterial({ color: i % 2 ? '#3ad0ff' : '#ffb03a', transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); bm.position.set(-5 + i * 2, 7, -2); scene.add(bm); beams.push(bm); }
  point(scene, '#3ad0ff', 14, 8, [-2.5, 2.5, 1.5]); point(scene, '#ffb03a', 14, 8, [2.5, 2.5, 1.5]); point(scene, '#ffffff', 8, 8, [0, 3, 3]);
  const key = new THREE.SpotLight('#ffffff', 40, 16, 0.7, 0.6, 1.2); key.position.set(0, 7, 4); key.target.position.set(0, 0.5, -0.3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const tick = (lt) => { scr.userData.live.update(lt); beams.forEach((b, i) => { b.rotation.z = Math.sin(lt * 1.2 + i) * 0.35; }); P.forEach((H, i) => { H.scr.userData.live.update(lt + i); const ty = Math.sin(lt * 15 + i) * 4; H.pose({ hipsY: -0.38, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0], lSh: [-42 + ty, 0, 12], rSh: [-42 - ty, 0, -12], lEl: [-62, 0, 0], rEl: [-62, 0, 0], lCurl: 0.5, rCurl: 0.6, spine: [12, 0, 0], head: [4, 0, 0] }); idle3(H, lt, i * 3, 0.3); H.face({ blink: 0, brows: -0.5 }); }); };
  return { scr, P, tick };
}
// 33.00–36.65  «Valve провела на Gamescom первый турнир The International»
export function buildTI() {
  const scene = new THREE.Scene(); const S = tiStage(scene);
  const title = text3d('THE INTERNATIONAL', { family: 'russo', size: 0.3, depth: 0.08, bevel: 0.012, color: '#ffffff', side: '#3a8ad8', emissive: '#3ad0ff', emissiveIntensity: 0.3 }); scene.add(title);
  const t1 = sign('GAMESCOM 2011', { width: 1.2, color: '#ffffff', bg: '#2a3a6a', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('ПЕРВЫЙ ТУРНИР', { width: 1.2, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(58, 1080 / 1920, 0.05, 200);
  function update(lt) {
    S.tick(lt);
    const k = easeOutBack(inv(2.1, 2.5, lt), 2.0); title.scale.setScalar(Math.max(0.001, k)); title.visible = lt > 2.08;
    pop(t1, lt, 0.9, 0.3); pop(t2, lt, 1.5, 0.3);
    const f = kf(lt, [[0, [0, 6.5, 11], [0, 3.0, -2], 58, 0], [1.8, [2.6, 2.6, 6.6], [0, 1.9, 0], 58, -0.05], [3.65, [-0.4, 2.3, 6.0], [0, 2.0, 0.3], 56, 0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.005, 4, 1)), f.look, f.roll, f.fov);
    hud(title, camera, 4.5, 0, 1.6); hud(t1, camera, 3.0, 0, 0.62); hud(t2, camera, 3.0, 0, -0.5);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.5, bloomThreshold: 0.8, envIntensity: 0.2, ao: 0.6 };
}

function counterPanel(scene, w = 2.4, h = 0.8) { const cv = document.createElement('canvas'); cv.width = 900; cv.height = 300; const ctx = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false })); m.renderOrder = 20; scene.add(m); let last = null; m.userData.set = (txt, col = '#ffd27a') => { if (txt === last) return; last = txt; ctx.clearRect(0, 0, 900, 300); ctx.fillStyle = 'rgba(12,10,20,0.85)'; ctx.beginPath(); ctx.roundRect(4, 4, 892, 292, 34); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = col; ctx.font = '104px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 450, 160); tex.needsUpdate = true; }; return m; }
const fmt = (v) => '$' + Math.round(v).toLocaleString('ru-RU').replace(/ /g, ' ');

// 36.65–40.05  «с призовым фондом 1,6 миллиона долларов,»
export function buildPrize() {
  const scene = new THREE.Scene(); const S = tiStage(scene);
  const pile = moneyPile(4, 6, 5, 2.4); pile.position.set(0, 0.3, 1.2); scene.add(pile);
  const rain = moneyRain({ n: 80, seed: 6, area: [5, 3], top: 6, floor: 0.3, center: [0, 0, 0.5], coins: 0.3 }); scene.add(rain);
  const panel = counterPanel(scene);
  const t1 = sign('ПРИЗОВОЙ ФОНД', { width: 1.2, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 200);
  function update(lt) {
    S.tick(lt + 3.6);
    pile.children.forEach((s) => { const k = easeOutBack(inv(0.1 + s.userData.order * 0.01, 0.4 + s.userData.order * 0.01, lt), 2.2); s.scale.setScalar(Math.max(0.001, k)); });
    rain.userData.update(lt); rain.visible = lt > 0.3;
    panel.userData.set(fmt(1600000 * Math.pow(smooth(inv(0.05, 1.6, lt)), 0.7)));
    pop(panel, lt, 0.05, 0.3); pop(t1, lt, 0.2, 0.3);
    const f = kf(lt, [[0, [0.6, 2.4, 5.0], [0, 1.0, 0.8], 54, 0.04], [3.4, [-0.6, 1.8, 4.2], [0, 1.1, 0.8], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3.2, 0, 1.12); hud(panel, camera, 3.2, 0, 0.62);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.84, envIntensity: 0.25, ao: 0.6 };
}

// 40.05–43.20  «миллион из которых достался команде Natus Vincere.»
export function buildChamps() {
  const scene = new THREE.Scene(); const S = tiStage(scene);
  S.P.forEach((H) => { H.root.visible = false; H.root.userData.solid = null; });
  const W = [cast8.pro('w1', '#f2d23a', '#e2b08c', '#2a1a12'), cast8.pro('w2', '#f2d23a', '#d8a882', '#4a2a14'), cast8.pro('w3', '#f2d23a', '#f0cfb2', '#c89a5a')];
  W.forEach((H, i) => { H.root.position.set(-0.75 + i * 0.75, 0.3, 1.0); scene.add(H.root); });
  const cup = trophy(); cup.scale.setScalar(1.6); scene.add(cup);
  const conf = []; const r = rng(4); for (let i = 0; i < 90; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.08), new THREE.MeshStandardMaterial({ color: ['#ffd23a', '#3ad0ff', '#ff4a6a', '#ffffff'][i % 4], side: THREE.DoubleSide, roughness: 0.5 })); c.userData = { x: (r() - 0.5) * 5, z: -1 + r() * 3.5, ph: r(), sp: 0.5 + r() * 0.5 }; scene.add(c); conf.push(c); }
  const panel = counterPanel(scene);
  const t1 = sign('NATUS VINCERE', { width: 1.2, color: '#1a1a1a', bg: '#f2d23a', size: 100, pad: 22, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 200);
  const wh = new THREE.Vector3(), wh2 = new THREE.Vector3();
  function update(lt) {
    S.tick(lt + 7);
    const lift = smooth(inv(0.3, 0.8, lt)); const jump = Math.abs(Math.sin(lt * 6)) * 0.08;
    W.forEach((H, i) => { const mid = i === 1; H.pose(mid ? { ...STAND, lSh: [-170 * lift, 0, 20], rSh: [-170 * lift, 0, -20], lEl: [-10, 0, 0], rEl: [-10, 0, 0], lCurl: 0.8, rCurl: 0.8 } : { ...STAND, [i ? 'lSh' : 'rSh']: [-160, 0, i ? 30 : -30], [i ? 'lEl' : 'rEl']: [-20, 0, 0], [i ? 'lCurl' : 'rCurl']: 0.9 }); idle3(H, lt, i * 4, 0.3); H.face({ blink: 0, smile: 1, brows: 0.6, mouth: 0.4 + 0.2 * Math.sin(lt * 8 + i) }); H.root.position.y = 0.3 + (mid ? 0 : jump); });
    const M2 = W[1]; M2.root.updateMatrixWorld(true); M2.J.lHand.group.getWorldPosition(wh); M2.J.rHand.group.getWorldPosition(wh2); cup.position.copy(wh).add(wh2).multiplyScalar(0.5).add(V(0, -0.05, 0.02));
    conf.forEach((c) => { const u = c.userData; const k = ((lt * u.sp * 0.35 + u.ph) % 1); c.position.set(u.x + Math.sin(lt * 2 + u.ph * 9) * 0.2, 6 - k * 6, u.z); c.rotation.set(lt * 3 + u.ph * 6, lt * 2, u.ph * 6); c.visible = lt > 0.2; });
    panel.userData.set('$1 000 000', '#f2d23a'); pop(panel, lt, 0.1, 0.3); pop(t1, lt, 2.05, 0.3);
    const f = kf(lt, [[0, [0.4, 2.0, 5.2], [0, 1.6, 1.0], 52, 0.03], [3.15, [-0.5, 1.8, 4.2], [0, 1.7, 1.0], 48, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    hud(panel, camera, 3.2, 0, 1.0); hud(t1, camera, 3.2, 0, -0.55);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.84, envIntensity: 0.25, ao: 0.6 };
}

// 43.20–46.15  «Потом фонд стали пополнять деньгами самих игроков,»
export function buildCrowdfund() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#07070c');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), M.std({ color: '#16161e', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.45));
  const jar = prizeJar(); scene.add(jar);
  const lbl = sign('ПРИЗОВОЙ ФОНД', { width: 0.9, color: '#ffffff', bg: '#2a3a6a', size: 90, pad: 16 }); lbl.position.set(0, 0.45, 0.56); scene.add(lbl);
  const phones = []; for (let i = 0; i < 8; i++) { const a = -2.3 + i * (4.6 / 7); const p = phone((g, w, h) => { g.fillStyle = '#101418'; g.fillRect(0, 0, w, h); g.fillStyle = '#3aaa5a'; g.beginPath(); g.roundRect(w * 0.12, h * 0.4, w * 0.76, h * 0.16, 20); g.fill(); g.fillStyle = '#fff'; g.font = `${w * 0.13}px Russo`; g.textAlign = 'center'; g.fillText('КУПИТЬ', w / 2, h * 0.5); g.fillStyle = '#ffd27a'; g.fillText('$9.99', w / 2, h * 0.3); }, 0.22); p.userData.live.update(0); p.position.set(Math.sin(a) * 2.2, 1.5 + (i % 2) * 0.6, Math.cos(a) * 1.4 - 0.4); p.lookAt(0, 1.4, 4); scene.add(p); phones.push(p); }
  const coins = []; for (let i = 0; i < 24; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 18), M.col('#ffc83a', 0.25, 0.9, { emissive: '#7a5000', emissiveIntensity: 0.3 })); c.userData = { p: i % 8, ph: (i * 0.37) % 1 }; scene.add(c); coins.push(c); }
  const key = new THREE.SpotLight('#fff0dc', 30, 9, 0.6, 0.5, 1.2); key.position.set(1, 5, 3); key.target.position.set(0, 0.7, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  const t1 = sign('ДЕНЬГИ ИГРОКОВ', { width: 1.2, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const target = V(0, 1.45, 0);
  function update(lt) {
    phones.forEach((p, i) => pop(p, lt, 0.05 + i * 0.06, 0.3, 2.4));
    coins.forEach((c) => { const k = ((lt * 0.8 + c.userData.ph) % 1); const from = phones[c.userData.p].position; c.position.copy(from).lerp(target, k).add(V(0, Math.sin(k * Math.PI) * 0.5, 0)); c.rotation.set(lt * 5, lt * 3, 0); c.visible = lt > 0.5; });
    const lvl = 0.2 + 0.6 * smooth(inv(0.3, 2.9, lt)); jar.userData.fill.scale.y = lvl; jar.userData.fill.position.y = 0.1 + lvl * 0.5;
    pop(t1, lt, 1.0, 0.3);
    const f = kf(lt, [[0, [0, 2.4, 4.6], [0, 1.1, 0], 52, 0.03], [2.95, [0.8, 2.0, 3.8], [0, 1.0, 0], 50, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.8, 0, 0.95);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.25, ao: 0.6 };
}

// 46.15–49.90  «и в 2021 году он дошёл до 40 миллионов.»
export function buildForty() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#07070c');
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M.std({ color: '#14141a', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.5));
  const key = new THREE.DirectionalLight('#fff0dc', 1.8); key.position.set(-3, 6, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -5, right: 5, top: 6, bottom: -2 }); scene.add(key);
  const vals = [1.6, 1.6, 2.9, 10.9, 18.4, 20.8, 24.8, 25.5, 34.3, 40]; // millions, 2011..2021 (no event in 2020)
  const years = ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21'];
  const bars = vals.map((v, i) => { const g = new THREE.Group(); const h = v / 40 * 3.2; const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1, 0.26), M.std({ color: i === 9 ? '#ffc83a' : '#3a8ad8', emissive: i === 9 ? '#a86a00' : '#1a3a6a', emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.4 })); b.castShadow = true; g.add(b); g.userData = { h, b }; const yl = sign('20' + years[i], { width: 0.3, color: '#ffffff', size: 70, pad: 6 }); yl.position.set(0, 0.02, 0.2); yl.rotation.x = -Math.PI / 2; g.add(yl); g.position.set(-1.6 + i * 0.36, 0, -0.5); scene.add(g); return g; });
  const panel = counterPanel(scene);
  const yr = text3d('2021', { family: 'mont', size: 0.3, depth: 0.08, bevel: 0.012, color: '#ffffff', side: '#c8a24a', emissive: '#ffd27a', emissiveIntensity: 0.3 }); scene.add(yr);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    bars.forEach((g, i) => { const k = smooth(inv(0.1 + i * 0.2, 0.5 + i * 0.2, lt)); const h = Math.max(0.001, g.userData.h * k); g.userData.b.scale.y = h; g.userData.b.position.y = h / 2; });
    panel.userData.set(fmt(40000000 * Math.pow(smooth(inv(0.3, 2.4, lt)), 0.8)), '#ffc83a'); pop(panel, lt, 0.05, 0.3);
    const k = easeOutElastic(inv(0.35, 0.95, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.33; yr.position.set(1.64, 3.75, -0.5);
    const f = kf(lt, [[0, [-0.4, 1.9, 5.8], [0, 1.6, -0.5], 54, 0.03], [3.75, [0.5, 2.2, 6.0], [0, 1.8, -0.5], 54, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(panel, camera, 3.0, 0, 1.0);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.25, ao: 0.6 };
}

// item shop: shelves with glowing items
function shop(scene) {
  scene.background = new THREE.Color('#0a0710');
  room6(scene, { w: 6, d: 6, h: 3, wall: '#3a2a36', floor: woodFloor('#3a2418'), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#e8d8ff', '#1a1018', 0.4));
  const shelves = new THREE.Group(); for (let r = 0; r < 3; r++) box(3.6, 0.05, 0.4, M.col('#5a3a24', 0.6), 0, 0.6 + r * 0.7, 0, shelves); box(3.7, 2.4, 0.05, M.col('#3a2418', 0.7), 0, 1.3, -0.2, shelves); shelves.position.set(0, 0, -2.7); scene.add(shadows(shelves));
  const items = []; const mk = [itemSword, itemOrb, itemRing, itemCombined];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) { const it = mk[(r * 5 + i) % 4](); it.scale.setScalar((r * 5 + i) % 4 === 3 ? 0.55 : 0.85); it.position.set(-1.4 + i * 0.7, 0.625 + r * 0.7, -2.65); scene.add(it); items.push(it); }
  point(scene, '#c86aff', 6, 6, [0, 1.6, -1.8]); point(scene, '#ffd27a', 5, 6, [-1.6, 2.2, -1.5]);
  const key = new THREE.SpotLight('#fff0dc', 20, 9, 0.7, 0.6, 1.2); key.position.set(1.2, 2.9, 1.2); key.target.position.set(0, 1.2, -2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  return { items };
}
// 49.90–53.65  «В игре до сих пор остались предметы, названные в честь авторов мода:»
export function buildShop() {
  const scene = new THREE.Scene(); const S = shop(scene);
  const t1 = sign('ПРЕДМЕТЫ В ЧЕСТЬ АВТОРОВ', { width: 1.6, color: '#ffffff', bg: '#6a2a8a', size: 90, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    S.items.forEach((it, i) => { it.rotation.y = lt * 0.8 + i; });
    pop(t1, lt, 1.6, 0.3);
    const f = kf(lt, [[0, [-1.2, 1.5, 0.6], [-0.4, 1.3, -2.6], 50, 0.03], [3.75, [1.0, 1.7, 0.2], [0.4, 1.4, -2.6], 48, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.92);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.84, envIntensity: 0.25, ao: 0.8 };
}
function itemStage(scene, col) {
  scene.background = new THREE.Color('#06060c');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 48), M.std({ color: '#141418', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.5, 32), M.col('#24242e', 0.4, 0.4)); ped.position.y = 0.25; ped.castShadow = true; ped.receiveShadow = true; scene.add(ped);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.015, 8, 48), M.emis(col, 2)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.5; scene.add(ring);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.4));
  const key = new THREE.SpotLight('#ffffff', 30, 8, 0.45, 0.5, 1.2); key.position.set(1, 4.5, 2.5); key.target.position.set(0, 1, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  point(scene, col, 8, 4, [0, 1.6, 0.8]);
}
// 53.65–55.50  «Eul's Scepter of Divinity»
export function buildEul() {
  const scene = new THREE.Scene(); itemStage(scene, '#6ad0ff');
  const it = scepter(); it.position.set(0, 0.5, 0); scene.add(it);
  const t1 = sign("EUL'S SCEPTER OF DIVINITY", { width: 1.6, color: '#ffffff', bg: '#1a4a6a', size: 90, pad: 20, border: '#bfefff' }); scene.add(t1);
  const t2 = sign('EUL', { width: 0.5, color: '#1a1a1a', bg: '#bfefff', size: 110, pad: 16 }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.05, 60);
  function update(lt) {
    pop(it, lt, 0.05, 0.4, 2.0); it.rotation.y = lt * 0.8; it.userData.swirl.forEach((s, i) => { s.rotation.z = lt * (2 + i); s.position.y = 1.32 + Math.sin(lt * 3 + i) * 0.05; });
    pop(t1, lt, 0.1, 0.3); pop(t2, lt, 0.4, 0.3);
    const f = kf(lt, [[0, [0.6, 1.5, 3.0], [0, 1.25, 0], 48, 0.03], [1.85, [-0.4, 1.7, 2.6], [0, 1.35, 0], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.95); hud(t2, camera, 2.6, 0, 0.68);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.5, bloomThreshold: 0.82, envIntensity: 0.25, ao: 0.6 };
}
// 55.50–57.70  «и Scythe of Vyse от Guinsoo.»
export function buildVyse() {
  const scene = new THREE.Scene(); itemStage(scene, '#8affb0');
  const it = scythe(); it.position.set(0, 0.5, 0); scene.add(it);
  const t1 = sign('SCYTHE OF VYSE', { width: 1.2, color: '#ffffff', bg: '#2a5a3a', size: 100, pad: 20, border: '#bfffd0' }); scene.add(t1);
  const t2 = sign('GUINSOO', { width: 0.7, color: '#1a1a1a', bg: '#bfffd0', size: 110, pad: 16 }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.05, 60);
  function update(lt) {
    pop(it, lt, 0.05, 0.4, 2.0); it.rotation.y = -0.6 + lt * 0.7;
    pop(t1, lt, 0.1, 0.3); pop(t2, lt, 1.3, 0.3);
    const f = kf(lt, [[0, [-0.6, 1.6, 3.0], [0, 1.3, 0], 48, -0.03], [2.2, [0.5, 1.5, 2.6], [0, 1.3, 0], 46, 0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.95); hud(t2, camera, 2.6, 0, 0.66);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.5, bloomThreshold: 0.82, envIntensity: 0.25, ao: 0.6 };
}
