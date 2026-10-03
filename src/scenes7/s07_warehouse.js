import * as THREE from 'three';
import { cast7, warehouse, crateStack, arcadeCab, arcadeDraw, book, hourglass, nameTag } from '../lib/sets7.js';
import { room6, desk6, chair6, plant, woodFloor, door6 } from '../lib/sets6.js';
import { idle3 } from '../lib/human3.js';
import { lightStand, tripodCam, armchair } from '../lib/fantasy.js';
import { sign, point } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, popOut, hud, shadows } from '../lib/shot.js';
import { walkPose } from '../lib/human.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, canvasTex } from '../lib/util.js';
import { text3d, STAND, SITP } from './s01_arcade.js';

// 16.30–20.65  «По первой, известной из книги Дэвида Шеффа 1993 года,»
export function buildBook() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a0e');
  room6(scene, { w: 5, d: 5, h: 2.8, wall: '#3a2e28', floor: woodFloor('#4a3424'), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#ffe8d0', '#1a1410', 0.35));
  const tb = rbox(1.4, 0.06, 0.8, 0.02, M.std({ map: TEX.plywood([2, 1], '#5a3a24'), roughness: 0.5 }), 0, 0.75, -1.0, scene); void tb;
  for (const x of [-0.62, 0.62]) for (const z of [-1.32, -0.68]) box(0.05, 0.72, 0.05, M.col('#2a1a10', 0.5), x, 0.36, z, scene);
  const shelf = new THREE.Group(); box(2.2, 2.2, 0.32, M.col('#3a2418', 0.6), 0, 1.1, 0, shelf); const r = rng(5); for (let row = 0; row < 4; row++) for (let i = 0; i < 12; i++) { const h = 0.26 + r() * 0.1; box(0.13, h, 0.22, M.col(['#7a2a2a', '#2a4a7a', '#3a6a3a', '#8a7a4a', '#4a3a6a'][Math.floor(r() * 5)], 0.6), -0.95 + i * 0.165, 0.2 + row * 0.52 + h / 2, 0.1, shelf); } shelf.position.set(0, 0, -2.3); scene.add(shadows(shelf));
  const bk = book('GAME OVER', 'Д. ШЕФФ, 1993'); bk.scale.setScalar(1.4); scene.add(bk);
  const yr = text3d('1993', { family: 'mont', size: 0.24, depth: 0.08, bevel: 0.012, color: '#ffffff', side: '#c8a24a', emissive: '#ffd27a', emissiveIntensity: 0.3 }); yr.position.set(0, 1.62, -1.35); scene.add(yr);
  const v1 = sign('ВЕРСИЯ 1', { width: 0.8, color: '#ffffff', bg: '#2a4ab8', size: 100, pad: 22, border: '#ffffff' }); scene.add(v1);
  const t2 = sign('КНИГА', { width: 0.6, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 18, border: '#1a1a1a' }); scene.add(t2);
  const lamp = new THREE.SpotLight('#ffd8a8', 20, 7, 0.55, 0.5, 1.2); lamp.position.set(0.4, 2.6, -0.2); lamp.target.position.set(0, 0.8, -1.0); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0005; scene.add(lamp, lamp.target);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const lift = smooth(inv(0.3, 1.2, lt));
    bk.position.set(0, lerp(0.81, 1.15, lift), lerp(-1.0, -0.95, lift)); bk.rotation.set(lerp(-Math.PI / 2, -0.25, lift), Math.sin(lt * 1.2) * 0.12 * lift, 0);
    const k = easeOutElastic(inv(1.95, 2.55, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 1.93;
    popOut(v1, lt, 0.05, 1.0); pop(t2, lt, 1.1, 0.3);
    const f = kf(lt, [[0, [0.9, 1.7, 0.8], [0, 0.9, -1.0], 48, 0.03], [4.35, [-0.3, 1.4, 0.6], [0, 1.25, -1.0], 44, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(v1, camera, 2.4, 0, 0.78); hud(t2, camera, 2.4, 0, -0.28);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}

// warehouse stage: crates, an arcade cabinet; returns cast slots
export function whStage(scene) {
  warehouse(scene, { w: 14, d: 14, h: 6 });
  const stacks = [[-3.4, -4.5, 4, 1], [-2.2, -4.6, 3, 2], [3.0, -5.6, 2, 3], [-4.6, -1.5, 3, 4], [4.6, -2.0, 4, 5], [4.6, -0.6, 2, 6]].map(([x, z, n, sd], i) => { const s = crateStack(sd, n); s.position.set(x, 0, z); scene.add(solid(s, 'stack' + i)); return s; });
  const cab = arcadeCab((g, w, h, t) => arcadeDraw(g, w, h, t, { name: '' }), 'ARCADE', '#2a4ab8'); cab.position.set(-1.0, 0, -5.0); scene.add(solid(cab, 'cab'));
  const key = new THREE.SpotLight('#fff0dc', 40, 18, 0.7, 0.6, 1.2); key.position.set(3, 5.5, 4); key.target.position.set(0, 1, -1.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  point(scene, '#ffe8c8', 10, 10, [0, 4.5, -1]);
  return { stacks, cab };
}
function rentPaper() { const g = new THREE.Group(); const t = canvasTex('rent7', 300, 400, (c, w, h) => { c.fillStyle = '#f4f0e6'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.font = '40px Russo'; c.textAlign = 'center'; c.fillText('АРЕНДА', w / 2, 60); c.fillStyle = '#9a9488'; for (let y = 100; y < 300; y += 24) c.fillRect(30, y, w - 60 - ((y * 7) % 60), 7); c.save(); c.translate(w / 2, 330); c.rotate(-0.2); c.strokeStyle = '#d4213a'; c.lineWidth = 6; c.strokeRect(-120, -34, 240, 60); c.fillStyle = '#d4213a'; c.font = '34px Russo'; c.fillText('ДОЛГ', 0, 10); c.restore(); }, { repeat: [1, 1] }); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.28), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, side: THREE.DoubleSide })); g.add(p); return g; }
const wp = new THREE.Vector3();
const holdAt = (H, o, side = -1, off = V(0, 0.08, 0.06)) => { H.root.updateMatrixWorld(true); (side > 0 ? H.J.lHand : H.J.rHand).group.getWorldPosition(wp); o.position.copy(wp).add(off.clone().applyQuaternion(H.root.quaternion)); o.quaternion.copy(H.root.quaternion); };

// 20.65–24.62  «владелец склада Марио Сегале пришёл за просроченной арендой»
export function buildLandlord() {
  const scene = new THREE.Scene(); whStage(scene);
  const L = cast7.landlord(); L.root.rotation.y = Math.PI * 0.05; scene.add(L.root);
  const paper = rentPaper(); scene.add(paper);
  const t1 = sign('ВЛАДЕЛЕЦ СКЛАДА', { width: 1.3, color: '#ffffff', bg: '#5a4632', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('АРЕНДА ПРОСРОЧЕНА', { width: 1.4, color: '#ffffff', bg: '#d4213a', size: 100, pad: 22, border: '#ffffff' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 80);
  function update(lt) {
    const wk = clamp(lt / 2.2); const z = lerp(-4.0, -1.2, smooth(wk));
    const walking = lt < 2.2; const wpz = walkPose(lt * 1.5, walking ? 0.9 : 0);
    const show = smooth(inv(2.3, 2.7, lt));
    L.pose({ ...(walking ? wpz : STAND), rSh: [lerp(walking ? -20 : 0, -70, show), 0, -10], rEl: [lerp(-30, -40, show), 0, 0], rCurl: 0.8 }); idle3(L, lt, 2, 0.3);
    L.face({ blink: 0, brows: -0.6, mouth: 0.1 });
    L.root.position.set(0.2, 0, z);
    holdAt(L, paper, -1, V(0, 0.1, 0.08));
    pop(t1, lt, 0.6, 0.3); pop(t2, lt, 2.5, 0.3);
    const f = kf(lt, [[0, [1.6, 1.6, 2.6], [0.1, 1.3, -3.0], 54, 0.03], [3.97, [0.7, 1.55, 1.0], [0.2, 1.45, -1.3], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.9); hud(t2, camera, 2.6, 0, 0.62);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 24.62–29.20  «и отчитал президента Nintendo of America Минору Аракаву прямо перед сотрудниками,»
export function buildScold() {
  const scene = new THREE.Scene(); whStage(scene);
  const L = cast7.landlord(), P = cast7.president(), w1 = cast7.worker1(), w2 = cast7.worker2();
  L.root.position.set(0.55, 0, -1.2); L.root.rotation.y = -Math.PI / 2 + 0.15; P.root.position.set(-0.45, 0, -1.25); P.root.rotation.y = Math.PI / 2 - 0.1;
  w1.root.position.set(-1.6, 0, -2.6); w1.root.rotation.y = 0.9; w2.root.position.set(1.3, 0, -2.8); w2.root.rotation.y = -0.6;
  scene.add(L.root, P.root, w1.root, w2.root);
  const paper = rentPaper(); scene.add(paper);
  const t1 = sign('ПРЕЗИДЕНТ NINTENDO OF AMERICA', { width: 1.8, color: '#ffffff', bg: '#d8281e', size: 90, pad: 20, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('ПРИ СОТРУДНИКАХ', { width: 1.2, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 80);
  function update(lt) {
    const jab = Math.max(0, Math.sin(lt * 7)) * 12;
    L.pose({ ...STAND, lSh: [-75 - jab, 0, 8], lEl: [-15, 0, 0], lCurl: 0.85, lThumb: 0.8, rSh: [-30, 0, -10], rEl: [-50, 0, 0], rCurl: 0.8, spine: [6, 0, 0], head: [4, 0, 0] }); idle3(L, lt, 2, 0.4);
    L.face({ blink: 0, brows: -1, browTilt: -0.8, mouth: 0.35 + 0.25 * Math.abs(Math.sin(lt * 9)) });
    holdAt(L, paper, -1, V(0, 0.1, 0.08));
    P.pose({ ...STAND, lSh: [-12, 0, 10], rSh: [-12, 0, -10], lEl: [-30, 0, 0], rEl: [-30, 0, 0], spine: [-4, 0, 0], head: [10, 0, 0] }); idle3(P, lt, 5, 0.3);
    P.face({ blink: 0, brows: 0.8, browTilt: 0.6, mouth: 0.1, look: [0, -0.2] });
    w1.pose({ ...STAND, lSh: [-30, 0, 30], lEl: [-95, 0, 0], rSh: [-30, 0, -30], rEl: [-95, 0, 0] }); idle3(w1, lt, 8, 0.4); w1.face({ blink: 0, brows: 0.9, mouth: 0.4 });
    w2.pose({ ...STAND, rSh: [-80, 0, -10], rEl: [-120, 0, 0], rCurl: 0.3 }); idle3(w2, lt, 11, 0.4); w2.face({ blink: 0, brows: 0.9, mouth: 0.5 });
    pop(t1, lt, 0.7, 0.3); pop(t2, lt, 3.9, 0.3);
    const f = kf(lt, [[0, [0.2, 1.6, 2.2], [0.05, 1.45, -1.3], 52, 0.03], [2.4, [1.6, 1.7, 0.9], [0, 1.5, -1.6], 50, 0], [4.58, [-0.3, 2.2, 3.4], [0, 1.3, -1.8], 56, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.005, 6, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.8, 0, 0.95); hud(t2, camera, 2.8, 0, 0.6);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 29.20–31.55  «но дал время найти деньги,»
export function buildTime() {
  const scene = new THREE.Scene(); whStage(scene);
  const L = cast7.landlord(), P = cast7.president();
  L.root.position.set(0.55, 0, -1.2); L.root.rotation.y = -Math.PI / 2 + 0.25; P.root.position.set(-0.45, 0, -1.25); P.root.rotation.y = Math.PI / 2 - 0.25; scene.add(L.root, P.root);
  const hg = hourglass(); hg.scale.setScalar(1.4); scene.add(hg);
  const t1 = sign('ДАЛ ВРЕМЯ', { width: 0.9, color: '#ffffff', bg: '#2a8a4a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 80);
  function update(lt) {
    L.pose({ ...STAND, lSh: [-80, 0, 8], lEl: [-40, 0, 0], lCurl: 0.85, lThumb: 0, rSh: [-8, 0, -10] }); idle3(L, lt, 2, 0.3); L.face({ blink: 0, brows: -0.3, mouth: 0.15 });
    const relief = smooth(inv(0.6, 1.2, lt));
    P.pose({ ...STAND, lSh: [-10, 0, 10], rSh: [-10, 0, -10], spine: [-4 * relief, 0, 0], head: [10 - 14 * relief, 0, 0] }); idle3(P, lt, 5, 0.3); P.face({ blink: 0, brows: 0.6 - 0.6 * relief, smile: 0.5 * relief, mouth: 0.05 });
    pop(hg, lt, 0.1, 0.4, 2.2, 1.4); hg.position.set(0.05, 1.55, -1.0); hg.rotation.y = lt * 0.5;
    const s = clamp(lt / 2.3); hg.userData.top.scale.setScalar(Math.max(0.05, 1 - s)); hg.userData.bot.scale.setScalar(0.3 + s * 0.7);
    pop(t1, lt, 0.4, 0.3);
    const f = kf(lt, [[0, [0.3, 1.6, 1.2], [0.05, 1.5, -1.2], 48, -0.03], [2.35, [-0.4, 1.7, 1.6], [0.05, 1.55, -1.2], 50, 0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.8);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 33.70–38.45  «По второй, которую в 2012 году рассказал бывший менеджер склада Дон Джеймс,»
export function buildInterview() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a0e');
  room6(scene, { w: 6, d: 6, h: 3, wall: '#2a2e36', floor: woodFloor('#3a2a1e'), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#1a1410', 0.35));
  const chair = armchair('#6a3a2a'); chair.position.set(0, 0, -1.6); scene.add(solid(chair, 'armchair', ['manager']));
  const m = cast7.manager(); m.root.position.set(0, 0.04, -1.55); scene.add(m.root); m.root.userData.allow = ['armchair'];
  const ls1 = lightStand('#fff1dc'); ls1.position.set(-1.6, 0, -0.4); ls1.lookAt(0, 0, -1.6); scene.add(solid(ls1, 'ls1'));
  const ls2 = lightStand('#dfe8ff'); ls2.position.set(1.7, 0, -0.9); ls2.lookAt(0, 0, -1.6); scene.add(solid(ls2, 'ls2'));
  const cam = tripodCam(); cam.position.set(0.7, 0, 0.6); cam.lookAt(0, 0, -1.6); scene.add(solid(cam, 'tripod'));
  const pl = plant(1.2); pl.position.set(-1.8, 0, -2.5); scene.add(pl);
  point(scene, '#fff1dc', 8, 6, [-1.4, 1.9, -0.5]); point(scene, '#8aa8ff', 5, 6, [1.6, 1.9, -1.0]);
  const key = new THREE.SpotLight('#fff0dc', 20, 9, 0.6, 0.6, 1.2); key.position.set(-1.0, 2.8, 0.6); key.target.position.set(0, 1, -1.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const yr = text3d('2012', { family: 'mont', size: 0.32, depth: 0.08, bevel: 0.012, color: '#ffffff', side: '#d8281e', emissive: '#ff5a4a', emissiveIntensity: 0.3 }); yr.position.set(0, 2.25, -2.6); scene.add(yr);
  const v2 = sign('ВЕРСИЯ 2', { width: 0.8, color: '#ffffff', bg: '#d8281e', size: 100, pad: 22, border: '#ffffff' }); scene.add(v2);
  const t2 = sign('БЫВШИЙ МЕНЕДЖЕР СКЛАДА', { width: 1.6, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const talk = Math.abs(Math.sin(lt * 8)) * 0.4 + 0.1;
    m.pose({ ...SITP, hipsY: -0.5, lSh: [-25, 0, 18], lEl: [-70, 0, 0], rSh: [-40 + Math.sin(lt * 3) * 10, 0, -16], rEl: [-80, 0, 0], rCurl: 0.2, spine: [-4, 0, 0] }); idle3(m, lt, 4, 0.4);
    m.face({ blink: 0, brows: 0.3, smile: 0.4, mouth: talk });
    const k = easeOutElastic(inv(1.2, 1.8, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 1.18;
    popOut(v2, lt, 0.05, 1.0); pop(t2, lt, 3.0, 0.3);
    const f = kf(lt, [[0, [1.4, 1.6, 1.6], [0, 1.3, -1.6], 50, 0.03], [4.75, [-0.6, 1.45, 0.6], [0, 1.25, -1.6], 44, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(v2, camera, 2.6, 0, 0.92); hud(t2, camera, 2.6, 0, -0.25);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}

// 38.45–41.05  «имя дали в шутку, потому что»
export function buildJoke() {
  const scene = new THREE.Scene(); const S = whStage(scene);
  S.cab.visible = false; S.cab.userData.solid = null;
  const cab = arcadeCab((g, w, h, t) => arcadeDraw(g, w, h, t, { name: 'MARIO' }), 'ARCADE', '#2a4ab8'); cab.position.set(0, 0, -1.8); scene.add(solid(cab, 'cab2'));
  const w1 = cast7.worker1(), w2 = cast7.worker2(); w1.root.position.set(-0.75, 0, -0.9); w1.root.rotation.y = 0.5; w2.root.position.set(0.8, 0, -0.85); w2.root.rotation.y = -0.6; scene.add(w1.root, w2.root);
  const t1 = sign('В ШУТКУ', { width: 0.8, color: '#1a1a1a', bg: '#ffd23a', size: 110, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 80);
  function update(lt) {
    cab.userData.live.update(lt);
    const l = Math.abs(Math.sin(lt * 9));
    w1.pose({ ...STAND, lSh: [-20, 0, 20], lEl: [-100, 0, 0], rSh: [-60, 0, -20], rEl: [-40, 0, 0], rCurl: 0.2, spine: [-8 - 4 * l, 0, 0], head: [-10 - 6 * l, 0, 0] }); idle3(w1, lt, 3, 0.3); w1.face({ blink: 0, smile: 1, brows: 0.6, mouth: 0.4 + 0.3 * l });
    w2.pose({ ...STAND, rSh: [-20, 0, -20], rEl: [-110, 0, 0], lSh: [-10, 0, 25], lEl: [-50, 0, 0], spine: [6 + 4 * l, 0, 0], head: [6, 0, 0] }); idle3(w2, lt, 7, 0.3); w2.face({ blink: 0.4, smile: 1, brows: 0.5, mouth: 0.35 + 0.3 * l });
    pop(t1, lt, 0.85, 0.3);
    const f = kf(lt, [[0, [-0.5, 1.7, 2.6], [0, 1.35, -1.3], 52, -0.03], [2.6, [0.6, 1.75, 2.3], [0, 1.4, -1.4], 50, 0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 6, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.78);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.25, ao: 1.0 };
}

// 41.05–44.15  «Сегале был таким затворником, что никто из сотрудников его ни разу не видел.»
export function buildHermit() {
  const scene = new THREE.Scene(); whStage(scene);
  // office box inside the warehouse: wall with a closed door and a frosted window lit from inside
  const wall = new THREE.Group(); const wm = M.col('#c8c0b0', 0.8);
  box(1.2, 2.6, 0.12, wm, -1.6, 1.3, 0, wall); box(0.9, 2.6, 0.12, wm, 1.75, 1.3, 0, wall); box(2.1, 0.5, 0.12, wm, 0.25, 2.35, 0, wall); box(1.0, 1.0, 0.12, wm, 0.75, 0.5, 0, wall); box(0.35, 2.1, 0.12, wm, 0.075, 1.05, 0, wall);
  const frost = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.1), M.std({ map: canvasTex('frost7', 256, 280, (c, w, h) => { c.fillStyle = '#e8eef0'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(40,40,50,0.55)'; c.beginPath(); c.ellipse(w * 0.55, h * 0.4, 30, 36, 0, 0, 7); c.fill(); c.fillRect(w * 0.42, h * 0.52, 70, 140); c.fillStyle = '#1a1a1a'; c.font = '30px Russo'; c.textAlign = 'center'; c.fillText('ВЛАДЕЛЕЦ', w / 2, 40); }, { repeat: [1, 1] }), emissive: '#fff4dc', emissiveIntensity: 0.4, roughness: 0.3 })); frost.position.set(0.75, 1.55, 0.065); wall.add(frost);
  wall.position.set(0, 0, -2.6); scene.add(shadows(wall));
  const dr = door6('#6a4a30', 0.9, 2.1); dr.position.set(-0.55, 0, -2.6); scene.add(dr);
  const w1 = cast7.worker1(), w2 = cast7.worker2(); w1.root.position.set(-0.9, 0, -1.1); w1.root.rotation.y = Math.PI + 0.2; w2.root.position.set(0.35, 0, -1.2); w2.root.rotation.y = Math.PI - 0.15; scene.add(w1.root, w2.root);
  const qs = [].map(() => { const q = sign('?', { width: 0.25, color: '#1a1a1a', bg: '#ffd23a', size: 200, pad: 8 }); scene.add(q); return q; });
  const t1 = sign('ЗАТВОРНИК', { width: 1.0, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('НИКТО НЕ ВИДЕЛ', { width: 1.2, color: '#ffffff', bg: '#d4213a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 80);
  function update(lt) {
    w1.pose({ ...STAND, lSh: [-10, 0, 10], rSh: [-10, 0, -10], spine: [6, 0, -6], head: [4, 14, 0] }); idle3(w1, lt, 3, 0.3); w1.face({ blink: 0, brows: 0.8 });
    w2.pose({ ...STAND, rSh: [-70, 0, -10], rEl: [-90, 0, 0], rCurl: 0.5, spine: [4, 0, 4] }); idle3(w2, lt, 6, 0.3); w2.face({ blink: 0, brows: 0.7, mouth: 0.15 });
    qs.forEach((q, i) => { pop(q, lt, 0.5 + i * 0.3, 0.3, 2.6); q.position.set(i ? 0.35 : -0.9, 1.95 + Math.sin(lt * 3 + i) * 0.04, i ? -1.2 : -1.1); });
    pop(t1, lt, 0.1, 0.3); pop(t2, lt, 1.2, 0.3);
    const f = kf(lt, [[0, [0.9, 1.6, 1.4], [0, 1.5, -2.4], 50, 0.03], [3.1, [-0.2, 1.7, 0.9], [0.3, 1.6, -2.5], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    qs.forEach((q) => q.lookAt(camera.position));
    hud(t1, camera, 2.6, 0, 0.92); hud(t2, camera, 2.6, 0, 0.62);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.25, ao: 1.0 };
}
