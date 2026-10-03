import * as THREE from 'three';
import { cast8, mobaMap, sciMap, itemSword, itemOrb, itemRing, itemCombined, gameBox8 } from '../lib/sets8.js';
import { room6, desk6, chair6, plant, woodFloor, ceilingLamp, door6, screen6 } from '../lib/sets6.js';
import { crt, tower, soda, badge } from '../lib/cs.js';
import { idle3 } from '../lib/human3.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
import { box, rbox, poster } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, popOut, hud, shadows } from '../lib/shot.js';
import { walkPose } from '../lib/human.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';

export const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
export const STAND = { lSh: [0, 0, 7], rSh: [0, 0, -7] };
export const SITP = { hipsY: -0.36, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0] };
export const TYPEP = { ...SITP, lSh: [-33, 0, 10], rSh: [-33, 0, -10], lEl: [-82, 0, 0], rEl: [-82, 0, 0], lCurl: 0.35, rCurl: 0.35, spine: [8, 0, 0], head: [4, 0, 0] };
export const typing = (H, lt, seed = 2, amt = 1) => { const ty = Math.sin(lt * 14) * 4 * amt; H.pose({ ...TYPEP, lSh: [-33 + ty, 0, 10], rSh: [-33 - ty, 0, -10] }); idle3(H, lt, seed, 0.3); };

// fantasy-RTS map editor as seen on a 2003 CRT
export function editorDraw(g, w, h, t, title = 'WORLD EDITOR') {
  g.fillStyle = '#c8c8c0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a2a8a'; g.fillRect(0, 0, w, h * 0.08); g.fillStyle = '#fff'; g.font = `${h * 0.05}px Russo`; g.textAlign = 'left'; g.fillText(title, 8, h * 0.06);
  const x0 = w * 0.04, y0 = h * 0.12, s = w * 0.7; g.fillStyle = '#4a8a3a'; g.fillRect(x0, y0, s, s * 0.78); g.fillStyle = '#3a3a2a'; g.beginPath(); g.moveTo(x0 + s, y0); g.lineTo(x0 + s, y0 + s * 0.78); g.lineTo(x0, y0); g.fill();
  g.strokeStyle = '#c8a870'; g.lineWidth = 6; const k = clamp(t / 2); g.beginPath(); g.moveTo(x0 + 10, y0 + s * 0.78 - 10); g.lineTo(x0 + 10 + (s - 20) * k, y0 + s * 0.78 - 10 - (s * 0.78 - 20) * k); g.stroke();
  g.fillStyle = '#9a9a92'; g.fillRect(w * 0.77, h * 0.12, w * 0.2, h * 0.8); g.fillStyle = '#1a1a1a'; g.font = `${h * 0.035}px Russo`; ['Terrain', 'Units', 'Doodads', 'Triggers', 'Items'].forEach((s2, i) => g.fillText(s2, w * 0.79, h * (0.2 + i * 0.08)));
}
// 2003 bedroom: CRT on a desk against the back wall, modder seated facing -z
export function modRoom(scene, draw, who = 'eul', { night = true, wall = '#3a4a5a' } = {}) {
  scene.background = new THREE.Color('#08080c');
  room6(scene, { w: 5.4, d: 5.4, h: 2.7, wall, windowAt: { wall: 'left', rect: [-0.6, 1.6, 1.2, 1.0] }, night, open: ['front'] });
  scene.add(new THREE.HemisphereLight('#a8b0ff', '#1a1410', 0.3));
  const dk = desk6(1.6, 0.75, 0.75, '#b89a70', '#3a3a40'); dk.position.set(0, 0, -2.25); scene.add(solid(dk, 'desk', [], [dk.userData.top]));
  const top = 0.75;
  const c = crt(draw, 1.35); c.position.set(0, top + 0.3, -2.35); scene.add(c);
  const tw = tower(); tw.position.set(0.6, top, -2.3); scene.add(tw);
  const kb = rbox(0.42, 0.025, 0.14, 0.008, M.col('#d8d0bc', 0.6), 0, top + 0.013, -1.98, scene); void kb;
  const sd = soda('#2a6ac0'); sd.position.set(-0.6, top, -2.0); scene.add(sd);
  const p = poster((g, w, h) => { g.fillStyle = '#2a1a10'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffb04a'; g.font = '40px Russo'; g.textAlign = 'center'; g.fillText('LAN', w / 2, h * 0.35); g.fillText('2003', w / 2, h * 0.55); }, 0.5, 0.7, 'poster8'); p.position.set(1.4, 1.7, -2.69); scene.add(p);
  const ch = chair6('#2a2a34'); ch.position.set(0, 0, -1.45); scene.add(solid(ch, 'chair', [who]));
  const H = cast8[who](); H.root.position.set(0, 0, -1.48); H.root.rotation.y = Math.PI; scene.add(H.root); H.root.userData.allow = ['chair'];
  point(scene, '#8ab0ff', 4, 4, [0, 1.3, -1.9]);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), M.emis('#ffd9a0', 4)); lamp.position.set(-0.7, top + 0.4, -2.45); lamp.userData.noAO = true; scene.add(lamp); point(scene, '#ffc890', 6, 5, [-0.7, top + 0.55, -2.2]);
  const key = new THREE.SpotLight('#ffe2c0', 14, 8, 0.8, 0.6, 1.3); key.position.set(1.2, 2.5, 0.6); key.target.position.set(0, 1, -1.8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  return { H, c, top };
}

// 0.00–3.55  «В 2003 году моддер Eul сделал для Warcraft III»
export function buildModder() {
  const scene = new THREE.Scene(); const R = modRoom(scene, (g, w, h, t) => editorDraw(g, w, h, t, 'WARCRAFT III — WORLD EDITOR'));
  const yr = text3d('2003', { family: 'mont', size: 0.34, depth: 0.09, bevel: 0.013, color: '#ffffff', side: '#3a6a3a', emissive: '#6ad06a', emissiveIntensity: 0.3 }); yr.position.set(-0.45, 2.05, -2.4); scene.add(yr);
  const t1 = sign('МОДДЕР EUL', { width: 0.9, color: '#ffffff', bg: '#3a6a3a', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    R.c.userData.live.update(lt);
    typing(R.H, lt, 2); R.H.face({ blink: 0, brows: 0.3, smile: 0.5 });
    const k = easeOutElastic(inv(0.2, 0.8, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.18; yr.rotation.y = Math.sin(lt * 1.4) * 0.15;
    pop(t1, lt, 1.6, 0.3);
    const f = kf(lt, [[0, [1.9, 1.75, 0.9], [0, 1.35, -2.0], 54, 0.04], [3.55, [1.3, 1.5, -0.6], [-0.1, 1.2, -2.1], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, -0.3);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}

// shared tabletop stage for maps
function mapStage(scene, bg = '#06070c') {
  scene.background = new THREE.Color(bg);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 48), M.std({ color: '#121218', roughness: 0.4, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.9; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.55));
  const key = new THREE.DirectionalLight('#fff0dc', 2.2); key.position.set(-3, 6, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); key.shadow.bias = -0.0005; scene.add(key);
}
// 3.55–6.00  «пользовательскую карту Defense of the Ancients,»
export function buildMap() {
  const scene = new THREE.Scene(); mapStage(scene);
  const map = mobaMap(3); map.rotation.y = Math.PI / 4; scene.add(map);
  const title = text3d('DEFENSE OF THE ANCIENTS', { family: 'russo', size: 0.16, depth: 0.05, bevel: 0.008, color: '#ffd27a', side: '#8a5a1a', emissive: '#ffa040', emissiveIntensity: 0.3 }); scene.add(title);
  const t1 = sign('КАРТА ДЛЯ WARCRAFT III', { width: 1.4, color: '#ffffff', bg: '#2a3a6a', size: 90, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    map.userData.A1.userData.cr.rotation.y = lt; map.userData.A2.userData.cr.rotation.y = -lt;
    const k = easeOutBack(inv(1.35, 1.75, lt), 2.0); title.scale.setScalar(Math.max(0.001, k)); title.visible = lt > 1.33;
    pop(t1, lt, 0.2, 0.3);
    const a = 0.5 + lt * 0.18; const f = { pos: V(Math.sin(a) * 3.6, lerp(4.2, 3.2, smooth(lt / 2.45)), Math.cos(a) * 3.6), look: V(0, 0, 0) };
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, 0, 50);
    hud(title, camera, 3.0, 0, 0.95); hud(t1, camera, 3.0, 0, -0.55);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 0.8, aoRadius: 0.15 };
}

// 6.00–8.80  «взяв за основу идею карты для StarCraft.»
export function buildIdea() {
  const scene = new THREE.Scene(); mapStage(scene);
  const sci = sciMap(1.6); sci.position.set(-0.9, 0.4, -0.6); sci.rotation.y = 0.5; scene.add(sci);
  const map = mobaMap(1.6); map.position.set(0.9, 0, 0.5); map.rotation.y = Math.PI / 4; scene.add(map);
  const arrow = new THREE.Group(); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 12), M.emis('#ffd23a', 1.4)); sh.rotation.z = Math.PI / 2; arrow.add(sh); const hd = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 16), M.emis('#ffd23a', 1.4)); hd.rotation.z = -Math.PI / 2; hd.position.x = 0.55; arrow.add(hd); arrow.position.set(0, 0.95, 0); arrow.rotation.y = -0.6; scene.add(arrow);
  const t1 = sign('ИДЕЯ — КАРТА ДЛЯ STARCRAFT', { width: 1.6, color: '#1a1a1a', bg: '#ffd23a', size: 90, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    pop(sci, lt, 0.05, 0.4, 2.0); const kr = smooth(inv(0.6, 1.4, lt)); arrow.scale.set(Math.max(0.001, kr), 1, 1); arrow.visible = kr > 0.01;
    pop(map, lt, 1.2, 0.4, 2.0);
    pop(t1, lt, 2.1, 0.3);
    const f = kf(lt, [[0, [-1.4, 2.6, 3.4], [-0.5, 0.3, -0.2], 50, 0.03], [2.8, [1.4, 2.9, 3.6], [0.4, 0.2, 0.2], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3.0, 0, 0.95);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 0.8, aoRadius: 0.15 };
}

// 8.80–11.00  «Потом проект перешёл к другим авторам:»
export function buildHandoff() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#07070c');
  scene.add(new THREE.HemisphereLight('#a8b0ff', '#100810', 0.45));
  const key = new THREE.DirectionalLight('#fff0dc', 1.8); key.position.set(2, 5, 5); scene.add(key);
  const names = ['EUL', 'GUINSOO', 'ICEFROG'], cols = ['#3a6a3a', '#8a2a2a', '#2a5a8a'];
  const pcs = names.map((n, i) => { const g = new THREE.Group(); const s = screen6((c, w, h) => { c.fillStyle = '#101418'; c.fillRect(0, 0, w, h); c.fillStyle = cols[i]; c.beginPath(); c.arc(w / 2, h * 0.42, h * 0.2, 0, 7); c.fill(); c.fillStyle = '#ffffff'; c.font = `${h * 0.14}px Russo`; c.textAlign = 'center'; c.fillText(n, w / 2, h * 0.85); }, 0.7, 16 / 9, 0.7, 512); s.userData.live.update(0); g.add(s); g.position.set(i === 1 ? 0.42 : -0.42, 2.5 - i * 0.7, -i * 0.3); g.rotation.y = i === 1 ? -0.2 : 0.2; scene.add(g); return g; });
  const file = new THREE.Group(); rbox(0.3, 0.38, 0.04, 0.02, M.col('#f2eee4', 0.6), 0, 0, 0, file); const lbl = sign('DotA.w3x', { width: 0.26, color: '#1a1a1a', size: 80, pad: 8 }); lbl.position.z = 0.022; file.add(lbl); const fold = box(0.1, 0.1, 0.045, M.col('#c8c4b8', 0.6), 0.1, 0.14, 0, file); void fold; scene.add(shadows(file));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,210,120,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 })); glow.scale.setScalar(0.9); scene.add(glow);
  const t1 = sign('НОВЫЕ АВТОРЫ', { width: 1.0, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    pcs.forEach((p, i) => pop(p, lt, i * 0.2, 0.35, 2.2));
    const k = smooth(inv(0.5, 2.0, lt)) * 2; const i0 = Math.min(1, Math.floor(k)), fr = k - i0; const a = pcs[i0].position, b = pcs[Math.min(2, i0 + 1)].position;
    file.position.copy(a).lerp(b, fr).add(V(Math.sin(fr * Math.PI) * 0.45 * (i0 ? -1 : 1), 0.1, 0.45)); file.rotation.y = lt * 2; glow.position.copy(file.position);
    pop(t1, lt, 0.9, 0.3);
    const f = kf(lt, [[0, [-0.5, 2.1, 3.6], [0, 1.75, -0.3], 54, 0.03], [2.2, [0.5, 1.9, 3.4], [0, 1.75, -0.3], 54, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3.0, 0, 1.2);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.25, ao: 0.6 };
}

// 11.00–13.05  «Guinsoo добавил рецепты предметов,»
export function buildRecipes() {
  const scene = new THREE.Scene(); mapStage(scene, '#0a0710');
  const ped = rbox(2.2, 0.12, 1.0, 0.03, M.col('#2a2430', 0.5), 0, 0.06, 0, scene); void ped;
  const parts = [itemSword(), itemOrb(), itemRing()]; parts.forEach((p) => scene.add(p));
  const out = itemCombined(); scene.add(out);
  const plus = [0, 1].map(() => { const t = text3d('+', { family: 'mont', size: 0.18, depth: 0.04, bevel: 0.006, color: '#ffffff' }); scene.add(t); return t; });
  const flash = new THREE.PointLight('#c86aff', 0, 4); flash.position.set(0, 1.2, 0.6); scene.add(flash);
  const t1 = sign('РЕЦЕПТЫ ПРЕДМЕТОВ', { width: 1.3, color: '#ffffff', bg: '#8a2a2a', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('GUINSOO', { width: 0.7, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 18, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const MERGE = 1.1;
  function update(lt) {
    const m = smooth(inv(MERGE - 0.3, MERGE, lt));
    parts.forEach((p, i) => { pop(p, lt, 0.05 + i * 0.12, 0.3, 2.4); const x = (i - 1) * 0.7 * (1 - m); p.position.set(x, 0.14 + 0.25 * m, 0.1); p.rotation.y = lt * 1.5 + i; if (lt > MERGE) p.visible = false; });
    plus.forEach((p, i) => { p.visible = lt > 0.4 && lt < MERGE - 0.15; p.position.set(-0.35 + i * 0.7, 0.45, 0.2); p.scale.setScalar(1); });
    const ko = easeOutBack(inv(MERGE, MERGE + 0.35, lt), 2.6); out.scale.setScalar(Math.max(0.001, ko)); out.visible = lt > MERGE; out.position.set(0, 0.12, 0.1); out.rotation.y = lt * 1.2;
    flash.intensity = lt > MERGE ? 12 * Math.exp(-(lt - MERGE) * 4) : 0;
    pop(t1, lt, 0.2, 0.3); pop(t2, lt, 0.05, 0.3);
    const f = kf(lt, [[0, [0.4, 1.3, 3.0], [0, 0.6, 0], 50, 0.03], [2.05, [-0.3, 1.2, 2.5], [0, 0.65, 0], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, lt > MERGE && lt < MERGE + 0.25 ? 0.012 : 0.003, 14, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.9); hud(t2, camera, 2.6, 0, 0.62);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.5, bloomThreshold: 0.82, envIntensity: 0.25, ao: 0.6 };
}

// 13.05–17.00  «а в 2005 году ушёл в Riot Games делать League of Legends.»
export function buildRiot() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#9ac8f0'); scene.fog = new THREE.Fog('#b8d8f4', 18, 60);
  scene.add(new THREE.HemisphereLight('#e8f2ff', '#5a5040', 0.9));
  const sun = new THREE.DirectionalLight('#fff2dc', 2.4); sun.position.set(6, 10, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); scene.add(sun);
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.std({ map: TEX.concrete([12, 12], '#b0aca4'), roughness: 0.8 })); gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; scene.add(gnd);
  const bld = new THREE.Group(); box(8, 5, 4, M.std({ color: '#e8e4dc', roughness: 0.7 }), 0, 2.5, 0, bld); for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) box(0.9, 1.1, 0.05, M.std({ color: '#2a4a6a', roughness: 0.1, metalness: 0.5, emissive: '#3a6a9a', emissiveIntensity: 0.2 }), -3 + i * 1.2, 1.6 + r * 1.9, 2.02, bld); box(1.6, 2.2, 0.06, M.col('#2a2a30', 0.4), 0, 1.1, 2.03, bld); bld.position.set(0, 0, -6); scene.add(shadows(bld));
  const nm = sign('RIOT GAMES', { width: 3.2, color: '#ffffff', bg: '#c8282a', size: 120, pad: 22 }); nm.position.set(0, 4.55, -3.96); scene.add(nm);
  const G = cast8.guinsoo(); G.root.rotation.y = Math.PI; scene.add(G.root);
  const bx = new THREE.Group(); rbox(0.42, 0.28, 0.32, 0.01, M.std({ map: TEX.cardboard(), roughness: 0.95 }), 0, 0, 0, bx); scene.add(shadows(bx));
  const yr = text3d('2005', { family: 'mont', size: 0.5, depth: 0.12, bevel: 0.018, color: '#ffffff', side: '#8a2a2a', emissive: '#ff5a4a', emissiveIntensity: 0.2 }); scene.add(yr);
  const lol = sign('LEAGUE OF LEGENDS', { width: 1.6, color: '#ffd27a', bg: '#101820', size: 100, pad: 22, border: '#c8a24a' }); scene.add(lol);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 120);
  const wh = new THREE.Vector3(), wh2 = new THREE.Vector3();
  function update(lt) {
    const z = lerp(2.5, -2.8, smooth(clamp(lt / 3.9)));
    G.pose({ ...walkPose(lt * 1.5, 0.9), lSh: [-40, 0, 14], rSh: [-40, 0, -14], lEl: [-55, 0, 0], rEl: [-55, 0, 0], lCurl: 0.7, rCurl: 0.7 }); idle3(G, lt, 1, 0.2); G.face({ blink: 0, smile: 0.4 });
    G.root.position.set(0.3, 0, z);
    G.root.updateMatrixWorld(true); G.J.lHand.group.getWorldPosition(wh); G.J.rHand.group.getWorldPosition(wh2); bx.position.copy(wh).add(wh2).multiplyScalar(0.5).add(V(0, 0.06, -0.1));
    const k = easeOutElastic(inv(0.35, 0.95, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.33;
    pop(lol, lt, 2.95, 0.3);
    const f = kf(lt, [[0, [1.6, 1.4, 6.0], [0.3, 1.4, 1.0], 54, 0.03], [3.95, [-0.8, 1.8, 4.2], [0.2, 2.6, -4.0], 56, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 2)), f.look, f.roll, f.fov);
    hud(yr, camera, 4.0, 0, 1.6); hud(lol, camera, 3.0, 0, -0.45);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.2, bloomThreshold: 0.95, envIntensity: 0.3, ao: 0.8 };
}

// 17.00–19.10  «Он звал IceFrog с собой,»  and 19.10–21.85 «но тот отказался и продолжил развивать мод.»
function inviteSet(scene) {
  const R = modRoom(scene, (g, w, h, t) => editorDraw(g, w, h, t + 3, 'DotA ALLSTARS — v6.' + (10 + Math.floor(t * 4))), 'icefrog', { wall: '#2e3a46' });
  const dr = door6('#6a4a30'); dr.position.set(2.7 - 0.06, 0, -0.6); dr.rotation.y = -Math.PI / 2; scene.add(dr); dr.userData.leaf.rotation.y = -1.2;
  const G = cast8.guinsoo(); G.root.position.set(2.1, 0, -0.6); G.root.rotation.y = -Math.PI / 2 - 0.3; scene.add(G.root);
  return { ...R, G, dr };
}
export function buildInvite() {
  const scene = new THREE.Scene(); const S = inviteSet(scene);
  const t1 = sign('ICEFROG', { width: 0.7, color: '#ffffff', bg: '#2a5a8a', size: 100, pad: 18, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('ПОЙДЁМ С НАМИ!', { width: 0.95, color: '#1a1a1a', bg: '#f4f4f0', size: 90, pad: 18, border: '#8a2a2a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    S.c.userData.live.update(lt);
    typing(S.H, lt, 3, 0.6); S.H.face({ blink: 0, brows: 0.2 });
    const wave = Math.sin(lt * 7);
    S.G.pose({ ...STAND, rSh: [-90, 0, -20 - 20 * wave], rEl: [-60 - 20 * wave, 0, 0], rCurl: 0.2, lSh: [-10, 0, 10] }); idle3(S.G, lt, 5, 0.3); S.G.face({ blink: 0, smile: 0.8, brows: 0.6, mouth: 0.3 });
    pop(t1, lt, 0.4, 0.3); t1.position.set(0, 2.05, -1.5); pop(t2, lt, 0.2, 0.3); t2.position.set(2.1, 2.15, -0.6);
    const f = kf(lt, [[0, [-1.6, 1.75, 2.6], [1.0, 1.3, -1.0], 56, 0.03], [2.1, [-1.3, 1.65, 2.3], [0.9, 1.3, -1.0], 54, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    t1.lookAt(camera.position); t2.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}
export function buildRefuse() {
  const scene = new THREE.Scene(); const S = inviteSet(scene);
  const no = sign('НЕТ', { width: 0.5, color: '#ffffff', bg: '#d4213a', size: 120, pad: 18, border: '#ffffff' }); scene.add(no);
  const t1 = sign('ПРОДОЛЖИЛ МОД', { width: 1.1, color: '#ffffff', bg: '#2a5a8a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    S.c.userData.live.update(lt + 2);
    const turn = smooth(inv(0.1, 0.4, lt)) * (1 - smooth(inv(1.1, 1.4, lt)));
    const shakeH = Math.sin(lt * 14) * 20 * turn;
    if (lt < 1.4) { S.H.pose({ ...SITP, lSh: [-12, 0, 12], rSh: [-12, 0, -12], lEl: [-45, 0, 0], rEl: [-45, 0, 0], spine: [0, 25 * turn, 0], head: [0, 40 * turn + shakeH, 0] }); idle3(S.H, lt, 3, 0.3); } else typing(S.H, lt, 3, 1);
    S.H.face({ blink: 0, brows: turn > 0.3 ? -0.2 : 0.3, smile: turn > 0.3 ? 0.2 : 0.4 });
    const sad = smooth(inv(0.8, 1.3, lt));
    S.G.pose({ ...STAND, lSh: [-10, 0, 10], rSh: [-10, 0, -10], head: [10 * sad, 0, 0] }); idle3(S.G, lt, 5, 0.3); S.G.face({ blink: 0, brows: 0.6 * sad, smile: 0.2 });
    pop(no, lt, 0.3, 0.3); no.position.set(0, 2.0, -1.5);
    pop(t1, lt, 1.4, 0.3);
    const f = kf(lt, [[0, [0.9, 1.55, -0.2], [0, 1.3, -1.6], 50, 0.03], [2.75, [-1.0, 1.6, -0.6], [0, 1.25, -2.0], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    no.lookAt(camera.position); hud(t1, camera, 2.4, 0, 0.8);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}
export { gameBox8, badge };
