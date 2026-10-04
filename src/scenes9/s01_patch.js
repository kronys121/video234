import * as THREE from 'three';
import { cast9, creep, wolf, tower9, battlefield, pit, holyBeam, halo } from '../lib/sets9.js';
import { room6, desk6, chair6, screen6, keyboard6, ceilingLamp, woodFloor } from '../lib/sets6.js';
import { idle3 } from '../lib/human3.js';
import { livePlane } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, popOut, hud, shadows } from '../lib/shot.js';
import { walkPose } from '../lib/human.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';

export const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
export const STAND = { lSh: [0, 0, 7], rSh: [0, 0, -7] };
export const STAFF = { rSh: [-35, 0, -14], rEl: [-50, 0, 0], rCurl: 0.85, lSh: [-6, 0, 10] };
const SITP = { hipsY: -0.36, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0] };

// hero-select row of cards, the priest card lights up
function cardTex(name, col, sel) { return canvasTex('card9' + name + sel, 300, 420, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, col); gr.addColorStop(1, '#101018'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.15)'; g.beginPath(); g.arc(w / 2, h * 0.42, 80, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,0.5)'; g.beginPath(); g.ellipse(w / 2, h * 0.36, 34, 40, 0, 0, 7); g.fill(); g.fillRect(w / 2 - 50, h * 0.46, 100, 90); g.fillStyle = '#ffffff'; g.font = '40px Russo'; g.textAlign = 'center'; g.fillText(name, w / 2, h * 0.9); if (sel) { g.strokeStyle = '#ffd23a'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); } }, { repeat: [1, 1] }); }
// 0.00–3.30  «В Dota 2 был патч, после которого достаточно было выбрать Chen»
export function buildSelect() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#07070c');
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.6));
  const key = new THREE.DirectionalLight('#ffffff', 1.4); key.position.set(1, 3, 5); scene.add(key);
  const names = [['AXE', '#8a2a2a'], ['LINA', '#c86a1a'], ['CHEN', '#c8a24a'], ['SNIPER', '#3a6a3a'], ['LION', '#4a3a8a']];
  const cards = names.map(([n, c], i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.84), new THREE.MeshStandardMaterial({ map: cardTex(n, c, false), roughness: 0.5 })); const sel = new THREE.MeshStandardMaterial({ map: cardTex(n, c, true), roughness: 0.4, emissive: '#ffffff', emissiveMap: cardTex(n, c, true), emissiveIntensity: 0.25 }); m.userData = { base: m.material, sel, i }; scene.add(m); return m; });
  const title = text3d('DOTA 2', { family: 'russo', size: 0.32, depth: 0.08, bevel: 0.012, color: '#ffffff', side: '#a8281e', emissive: '#ff3a2a', emissiveIntensity: 0.3 }); scene.add(title);
  const t1 = sign('ПАТЧ-ЛОВУШКА', { width: 1.1, color: '#ffffff', bg: '#a8281e', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,210,90,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); glow.scale.set(1.2, 1.5, 1); scene.add(glow);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const PICK = 2.95;
  function update(lt) {
    const scroll = smooth(inv(0.3, PICK, lt)) * 2; // centre index moves 0→2
    cards.forEach((m) => { const d = m.userData.i - scroll; m.position.set(d * 0.72, 1.6 - Math.abs(d) * 0.08, -Math.abs(d) * 0.35); m.rotation.y = -d * 0.35; const isSel = m.userData.i === 2 && lt > PICK; m.material = isSel ? m.userData.sel : m.userData.base; const s = isSel ? 1 + 0.2 * easeOutBack(inv(PICK, PICK + 0.3, lt), 2.5) : 1; m.scale.setScalar(s); });
    glow.position.set(0, 1.6, -0.1); glow.material.opacity = lt > PICK ? 0.3 * smooth(inv(PICK, PICK + 0.2, lt)) : 0;
    pop(title, lt, 0.1, 0.35, 2.0); pop(t1, lt, 0.9, 0.3);
    const f = kf(lt, [[0, [0, 1.7, 3.2], [0, 1.6, 0], 50, 0.02], [3.3, [0.1, 1.65, 2.5], [0, 1.6, 0], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(title, camera, 2.6, 0, 0.95); hud(t1, camera, 2.6, 0, 0.66);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.84, envIntensity: 0.25 };
}

// 3.30–6.95  «и дойти до главного босса карты, чтобы почти выиграть игру.»
export function buildToBoss() {
  const scene = new THREE.Scene(); pit(scene);
  const B = cast9.boss(); B.root.position.set(0, 0, -1.6); scene.add(B.root);
  const P = cast9.priest(); P.root.rotation.y = Math.PI; scene.add(P.root);
  const t1 = sign('ГЛАВНЫЙ БОСС', { width: 1.1, color: '#ffffff', bg: '#5a1a1a', size: 100, pad: 20, border: '#ff8a3a' }); scene.add(t1);
  const t2 = sign('ПОЧТИ ПОБЕДА', { width: 1.1, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const z = lerp(3.2, 0.6, smooth(clamp(lt / 2.6))); const walking = lt < 2.6;
    P.pose({ ...(walking ? walkPose(lt * 1.4, 0.8) : STAND), ...STAFF }); idle3(P, lt, 2, 0.3); P.face({ blink: 0, brows: -0.3, smile: 0.3 }); P.root.position.set(0.2, 0, z);
    const breathe = Math.sin(lt * 1.6);
    B.pose({ lSh: [-20, 0, 25 + breathe * 3], rSh: [-20, 0, -25 - breathe * 3], lEl: [-40, 0, 0], rEl: [-40, 0, 0], lCurl: 0.9, rCurl: 0.9, spine: [10, 0, 0], head: [10, 0, 0], lHip: [-10, 0, 8], rHip: [-10, 0, -8], lKnee: [20, 0, 0], rKnee: [20, 0, 0], hipsY: -0.04 }); idle3(B, lt, 5, 0.5);
    B.face({ blink: 0, brows: -1, mouth: 0.3 + 0.1 * breathe });
    pop(t1, lt, 0.8, 0.3); pop(t2, lt, 2.35, 0.3);
    const f = kf(lt, [[0, [1.2, 1.9, 5.8], [0, 2.4, -1.0], 56, 0.03], [3.65, [-1.4, 1.6, 4.6], [0, 2.6, -1.2], 56, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3, 0, 1.05); hud(t2, camera, 3, 0, -0.55);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.85, envIntensity: 0.25, ao: 1.0 };
}

// dev office with a big screen
function devOffice(scene, draw) {
  scene.background = new THREE.Color('#0a0a0e');
  room6(scene, { w: 5.6, d: 5.6, h: 2.8, wall: '#2e3440', floor: woodFloor('#3a2a1e'), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#1a1410', 0.35));
  const dk = desk6(1.6, 0.8, 0.75, '#2a2a30', '#1a1a1e'); dk.position.set(0, 0, -2.2); scene.add(solid(dk, 'desk', [], [dk.userData.top]));
  const s = screen6(draw, 0.9, 16 / 9, 0.6, 1024); s.position.set(0, 0.75 + s.userData.bottom, -2.4); scene.add(s);
  const kb = keyboard6('#ff8a2a'); kb.position.set(0, 0.75, -1.95); scene.add(kb);
  const ch = chair6('#2a2a34'); ch.position.set(0, 0, -1.4); scene.add(solid(ch, 'chair', ['dev']));
  const D = cast9.dev(); D.root.position.set(0, 0, -1.43); D.root.rotation.y = Math.PI; scene.add(D.root); D.root.userData.allow = ['chair'];
  const logo = sign('VALVE', { width: 1.2, color: '#ff8a2a', size: 140, pad: 14, emissive: 0.4 }); logo.position.set(0, 2.25, -2.78); scene.add(logo);
  point(scene, '#8ab0ff', 5, 4, [0, 1.3, -1.8]);
  const key = new THREE.SpotLight('#ffe2c0', 14, 8, 0.8, 0.6, 1.3); key.position.set(1.2, 2.6, 0.6); key.target.position.set(0, 1, -1.8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  return { D, s };
}
const typing = (H, lt, seed = 2) => { const ty = Math.sin(lt * 14) * 4; H.pose({ ...SITP, lSh: [-33 + ty, 0, 10], rSh: [-33 - ty, 0, -10], lEl: [-82, 0, 0], rEl: [-82, 0, 0], lCurl: 0.35, rCurl: 0.35, spine: [8, 0, 0], head: [4, 0, 0] }); idle3(H, lt, seed, 0.3); };
function notesDraw(g, w, h, t) {
  g.fillStyle = '#14161c'; g.fillRect(0, 0, w, h); g.fillStyle = '#a8281e'; g.fillRect(0, 0, w, h * 0.12); g.fillStyle = '#fff'; g.font = `${h * 0.07}px Russo`; g.textAlign = 'left'; g.fillText('PATCH NOTES 6.75', w * 0.03, h * 0.085);
  const lines = ['• Баланс героев', '• Новые предметы', '• Исправления карты', '• CHEN: изменения способностей', '• Прочие улучшения']; const n = Math.floor(t * 3); g.font = `${h * 0.06}px Russo`;
  lines.forEach((l, i) => { if (i > n) return; g.fillStyle = i === 3 ? '#ffd23a' : '#d8dce4'; g.fillText(l, w * 0.05, h * (0.26 + i * 0.14)); });
}
// 6.95–12.05  «В 2012 году Valve выпустила патч 6.75»
export function buildPatch() {
  const scene = new THREE.Scene(); const O = devOffice(scene, notesDraw);
  const yr = text3d('2012', { family: 'mont', size: 0.32, depth: 0.08, bevel: 0.012, color: '#ffffff', side: '#a8281e', emissive: '#ff4a3a', emissiveIntensity: 0.3 }); yr.position.set(-0.9, 2.2, -2.5); scene.add(yr);
  const ver = text3d('6.75', { family: 'mont', size: 0.5, depth: 0.12, bevel: 0.018, color: '#ffd23a', side: '#a8700a', emissive: '#ffb020', emissiveIntensity: 0.35 }); scene.add(ver);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    O.s.userData.live.update(lt * 0.9);
    typing(O.D, lt, 3); O.D.face({ blink: 0, brows: 0.2, smile: 0.3 });
    const k = easeOutElastic(inv(0.3, 0.9, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.28;
    const kv = easeOutBack(inv(3.75, 4.15, lt), 2.4); ver.scale.setScalar(Math.max(0.001, kv)); ver.visible = lt > 3.73;
    const f = kf(lt, [[0, [1.6, 1.8, 1.0], [0, 1.4, -2.0], 52, 0.03], [2.6, [0.8, 1.55, -0.6], [0, 1.25, -2.3], 46, 0], [5.1, [0.35, 1.4, -1.2], [0, 1.2, -2.4], 42, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(ver, camera, 1.6, 0, 0.42);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}

function abilityTex(i, changed) { return canvasTex('ab9' + i + changed, 256, 256, (g, w, h) => { const cols = ['#c8a24a', '#3a8ad8', '#8a3ad8', '#d8281e']; const gr = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.3, cols[i]); gr.addColorStop(1, '#101018'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = changed ? '#ffd23a' : '#3a3a46'; g.lineWidth = changed ? 18 : 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = '120px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(['✦', '◆', '●', '▲'][i], w / 2, h / 2 + 6); }, { repeat: [1, 1] }); }
// 12.05–15.30  «и среди прочего изменила способности героя Chen.»
export function buildAbilities() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#07070c');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 48), M.std({ color: '#141418', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.45));
  const key = new THREE.SpotLight('#ffffff', 30, 10, 0.6, 0.5, 1.2); key.position.set(1, 5, 3); key.target.position.set(0, 1, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  const P = cast9.priest(); P.root.position.set(0, 0, -0.6); scene.add(P.root);
  const icons = [0, 1, 2, 3].map((i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.05), [M.col('#1a1a22', 0.5), M.col('#1a1a22', 0.5), M.col('#1a1a22', 0.5), M.col('#1a1a22', 0.5), new THREE.MeshStandardMaterial({ map: abilityTex(i, false), emissive: '#ffffff', emissiveMap: abilityTex(i, false), emissiveIntensity: 0.4 }), M.col('#1a1a22', 0.5)]); m.userData.chg = new THREE.MeshStandardMaterial({ map: abilityTex(i, true), emissive: '#ffffff', emissiveMap: abilityTex(i, true), emissiveIntensity: 0.5 }); scene.add(m); return m; });
  const stamp = sign('ИЗМЕНЕНО', { width: 0.6, color: '#ffffff', bg: '#d4213a', size: 90, pad: 14, border: '#ffffff' }); scene.add(stamp);
  const name = sign('CHEN', { width: 0.6, color: '#1a1a1a', bg: '#ffd23a', size: 110, pad: 16, border: '#1a1a1a' }); scene.add(name);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    P.pose({ ...STAND, ...STAFF }); idle3(P, lt, 2, 0.3); P.face({ blink: 0, brows: 0.1, smile: 0.4 });
    icons.forEach((m, i) => { pop(m, lt, 0.1 + i * 0.12, 0.3, 2.4); m.position.set(-0.72 + i * 0.48, 0.55, 0.5); if (i === 1 && lt > 1.6) m.material[4] = m.userData.chg; m.rotation.y = i === 1 && lt > 1.4 && lt < 1.8 ? (lt - 1.4) / 0.4 * Math.PI * 2 : 0; });
    pop(stamp, lt, 1.75, 0.3); stamp.position.set(-0.24, 0.9, 0.55); stamp.rotation.z = 0.15;
    pop(name, lt, 2.7, 0.3); name.position.set(0, 2.25, -0.5);
    const f = kf(lt, [[0, [0.3, 1.2, 3.0], [0, 1.0, 0], 50, 0.03], [3.25, [-0.3, 1.4, 2.7], [0, 1.2, 0], 50, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.25, ao: 1.0 };
}

// 15.30–19.90  «Его умение Holy Persuasion позволяет брать под контроль нейтральных крипов.»
export function buildPersuade() {
  const scene = new THREE.Scene(); battlefield(scene);
  const P = cast9.priest(); P.root.position.set(-0.8, 0, 0.6); P.root.rotation.y = Math.PI / 2 - 0.2; scene.add(P.root);
  const W = wolf(); W.position.set(1.4, 0, 0.2); W.rotation.y = Math.PI; scene.add(solid(W, 'wolf'));
  const beam = holyBeam(); scene.add(beam);
  const hl = halo(0.45); scene.add(hl);
  const t1 = sign('HOLY PERSUASION', { width: 1.2, color: '#1a1a1a', bg: '#ffe08a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const t2 = sign('НЕЙТРАЛЬНЫЕ КРИПЫ', { width: 1.3, color: '#ffffff', bg: '#4a3a2a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 80);
  const CAST = 1.2; const sp = new THREE.Vector3();
  function update(lt) {
    const cast = smooth(inv(CAST - 0.3, CAST, lt)) * (1 - smooth(inv(CAST + 1.2, CAST + 1.6, lt)));
    P.pose({ ...STAND, rSh: [-90 * cast - 30 * (1 - cast), 0, -14], rEl: [-20 - 30 * (1 - cast), 0, 0], rCurl: 0.85, lSh: [-30 * cast, 0, 20], lEl: [-20, 0, 0], lCurl: 0.2 }); idle3(P, lt, 2, 0.3); P.face({ blink: 0, brows: -0.3, mouth: 0.2 * cast });
    P.root.updateMatrixWorld(true); P.staff.userData.orb.getWorldPosition(sp);
    const tgt = V(W.position.x, 0.6, W.position.z); beam.visible = cast > 0.05 && lt < CAST + 1.4; if (beam.visible) { const mid = sp.clone().add(tgt).multiplyScalar(0.5); beam.position.copy(mid); beam.scale.set(1, sp.distanceTo(tgt), 1); beam.quaternion.setFromUnitVectors(V(0, 1, 0), tgt.clone().sub(sp).normalize()); beam.material.opacity = 0.8 * cast; }
    const tame = smooth(inv(CAST + 0.4, CAST + 0.9, lt)); hl.visible = tame > 0.01; hl.position.set(W.position.x, 0.95, W.position.z); hl.scale.setScalar(Math.max(0.01, tame)); hl.rotation.z = lt * 2;
    // the beast turns and trots to the hero's side once persuaded
    const follow = smooth(inv(CAST + 1.3, CAST + 3.0, lt)); W.position.set(lerp(1.4, 0.0, follow), 0, lerp(0.2, 1.3, follow)); W.rotation.y = lerp(Math.PI, Math.PI + 1.4, smooth(inv(CAST + 1.0, CAST + 1.5, lt)));
    pop(t1, lt, 1.15, 0.3); pop(t2, lt, 3.45, 0.3);
    const f = kf(lt, [[0, [0.4, 1.7, 5.0], [0.2, 1.0, 0.4], 50, 0.03], [4.6, [-0.4, 1.9, 5.4], [0, 1.0, 0.6], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3.0, 0, 1.05); hud(t2, camera, 3.0, 0, -0.55);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.3, ao: 0.8 };
}

function codeDraw(g, w, h, t) {
  g.fillStyle = '#1a1c22'; g.fillRect(0, 0, w, h); g.font = `${h * 0.055}px monospace`; g.textAlign = 'left';
  const L = [['#c86aff', 'function canPersuade(target) {'], ['#9aa4b4', '  // нейтральные крипы — можно'], ['#ffd27a', '  if (target.isNeutral)'], ['#8affb0', '    return true;'], ['#9aa4b4', '  // проверка на босса'], ['#ff6a6a', '  // if (target.isBoss) ???'], ['#c86aff', '}']];
  L.forEach(([c, s], i) => { g.fillStyle = '#4a4e58'; g.fillText(String(i + 1), w * 0.02, h * (0.15 + i * 0.11)); g.fillStyle = c; g.fillText(s, w * 0.08, h * (0.15 + i * 0.11)); });
  if (t > 0.9) { const a = Math.min(1, (t - 0.9) * 3); g.fillStyle = `rgba(255,60,60,${0.25 * a})`; g.fillRect(0, h * 0.64, w, h * 0.1); g.strokeStyle = `rgba(255,60,60,${a})`; g.lineWidth = 4; g.beginPath(); for (let x = w * 0.08; x < w * 0.7; x += 16) { g.lineTo(x, h * 0.725 + ((x / 16) % 2 ? 5 : -5)); } g.stroke(); }
}
// 19.90–22.90  «Из-за ошибки в коде оно неожиданно заработало»
export function buildCode() {
  const scene = new THREE.Scene(); const O = devOffice(scene, codeDraw);
  const t1 = sign('ОШИБКА В КОДЕ', { width: 1.1, color: '#ffffff', bg: '#d4213a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(46, 1080 / 1920, 0.05, 60);
  function update(lt) {
    O.s.userData.live.update(lt);
    typing(O.D, lt, 6); O.D.face({ blink: 0, brows: 0.2 });
    pop(t1, lt, 1.0, 0.3);
    const f = kf(lt, [[0, [0.6, 1.5, -1.0], [0, 1.25, -2.4], 46, 0.02], [3.0, [0.3, 1.38, -1.3], [0, 1.22, -2.4], 40, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, lt > 1.0 && lt < 1.3 ? 0.01 : 0.002, 14, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 1.6, 0, 0.42);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}
