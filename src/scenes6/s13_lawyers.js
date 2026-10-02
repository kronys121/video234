import * as THREE from 'three';
import { cast6, room6, ceilingLamp, briefcase, door6, secCam, plant, woodFloor, chair6 } from '../lib/sets6.js';
import { idle3 } from '../lib/human3.js';
import { moneyRain, cashStack } from '../lib/stream.js';
import { heart } from '../lib/fantasy.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, hud, shadows } from '../lib/shot.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';
import { SITP } from './s01_cheat.js';

const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
const STAND = { lSh: [0, 0, 7], rSh: [0, 0, -7] };
const HOLD_CASE = (side) => (side > 0 ? { lSh: [-6, 0, 9], lEl: [-10, 0, 0], lCurl: 0.9 } : { rSh: [-6, 0, -9], rEl: [-10, 0, 0], rCurl: 0.9 });
const wp = new THREE.Vector3();
const carry = (H, bc, side) => { H.root.updateMatrixWorld(true); (side > 0 ? H.J.lHand : H.J.rHand).group.getWorldPosition(wp); bc.position.copy(wp).add(V(0, -0.2, 0)); bc.rotation.set(0, H.root.rotation.y + Math.PI / 2, 0); };

// 42.00–45.85  «Вскоре к каждому пришли юристы Rockstar с двумя вариантами:»
export function buildKnock() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a0e');
  // apartment hallway: the cheater's door on the back wall, lawyers waiting outside it
  room6(scene, { w: 4.2, d: 6, h: 2.8, wall: '#8a7a68', floor: M.std({ map: TEX.tiles([4, 6], '#8a8478'), roughness: 0.55 }), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#f0e8ff', '#2a2018', 0.5));
  const dr = door6('#5a3a24'); dr.position.set(0, 0, -2.98); scene.add(dr);
  const num = sign('42', { width: 0.16, color: '#c8a24a', size: 120, pad: 6 }); num.position.set(0, 1.75, -2.9); scene.add(num);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.1), M.emis('#ffd8a0', 0.9)); inside.position.set(0, 1.05, -3.1); inside.userData.noAO = true; scene.add(inside);
  const ch = cast6.cheater(); ch.root.position.set(0, 0, -3.35); scene.add(ch.root);
  const lm = cast6.lawyerM(), lf = cast6.lawyerF(); lm.root.position.set(-0.55, 0, -1.4); lf.root.position.set(0.55, 0, -1.5); lm.root.rotation.y = Math.PI + 0.12; lf.root.rotation.y = Math.PI - 0.12; scene.add(lm.root, lf.root);
  const b1 = briefcase('#2a1a10'), b2 = briefcase('#1a1a1e'); scene.add(b1, b2);
  ceilingLamp(scene, 0, -1.6, 2.8, '#fff0d8');
  const key = new THREE.SpotLight('#fff0dc', 22, 10, 0.8, 0.6, 1.2); key.position.set(1.2, 2.7, 1.2); key.target.position.set(0, 1, -2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const t1 = sign('ЮРИСТЫ ROCKSTAR', { width: 1.3, color: '#ffffff', bg: '#1a1c22', size: 100, pad: 22, border: '#c8a24a' }); scene.add(t1);
  const t2 = sign('2 ВАРИАНТА', { width: 0.9, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const open = smooth(inv(0.2, 0.9, lt)); dr.userData.leaf.rotation.y = -1.45 * open;
    const step = smooth(inv(0.6, 1.3, lt)); ch.root.position.z = lerp(-3.35, -2.75, step);
    ch.pose({ ...STAND, lSh: [-20, 0, 10], lEl: [-40, 0, 0], rSh: [-50 * (1 - step) - 10, 0, -15], rEl: [-60, 0, 0] }); idle3(ch, lt, 2, 0.4); ch.face({ blink: 0, brows: 1, mouth: 0.45 * step });
    lm.pose({ ...STAND, ...HOLD_CASE(1) }); idle3(lm, lt, 4, 0.3); lm.face({ blink: 0, brows: -0.3, smile: 0.25 });
    lf.pose({ ...STAND, ...HOLD_CASE(-1) }); idle3(lf, lt, 7, 0.3); lf.face({ blink: 0, brows: -0.2, smile: 0.2 });
    carry(lm, b1, 1); carry(lf, b2, -1);
    pop(t1, lt, 1.3, 0.3); pop(t2, lt, 2.35, 0.3);
    const f = kf(lt, [[0, [1.4, 1.75, 2.4], [0, 1.25, -2.2], 52, 0.03], [3.85, [-0.6, 1.7, 1.6], [0, 1.3, -2.3], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.8, 0, 0.95); hud(t2, camera, 2.8, 0, 0.6);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}

// two doors in a dark void: charity (warm, open) and option two (red, closed)
export function twoDoors(scene) {
  scene.background = new THREE.Color('#06060a');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 64), M.std({ color: '#141418', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#8a90b0', '#100c10', 0.3));
  const mk = (x, col, glowC, label, labelBg) => {
    const d = door6(col); d.position.set(x, 0, -1.5); scene.add(d);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.1), M.emis(glowC, 0.55)); back.position.set(x, 1.05, -1.56); back.userData.noAO = true; scene.add(back);
    const wall = box(1.6, 2.6, 0.1, M.col('#1a1a20', 0.6), x, 1.3, -1.62); wall.visible = false;
    const l = new THREE.PointLight(glowC, 3, 5, 1.6); l.position.set(x, 1.3, -1.0); scene.add(l);
    const s = sign(label, { width: 1.25, color: '#ffffff', bg: labelBg, size: 90, pad: 20, border: '#ffffff' }); s.position.set(x, 2.55, -1.45); scene.add(s);
    return { d, back, l, s };
  };
  const A = mk(-0.95, '#3a6a4a', '#a8ffb0', 'БЛАГОТВОРИТЕЛЬНОСТЬ', '#2a8a4a');
  const B = mk(0.95, '#3a1a1a', '#ff2a2a', 'ВАРИАНТ 2', '#8a1a1a');
  const key = new THREE.SpotLight('#ffffff', 20, 10, 0.6, 0.6, 1.2); key.position.set(0, 4.5, 2.5); key.target.position.set(0, 1, -1); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  return { A, B };
}

// 45.85–50.60  «либо все заработанные деньги уходят на благотворительность, либо будет больно.»
export function buildOptions() {
  const scene = new THREE.Scene(); const D = twoDoors(scene);
  const law = cast6.lawyerM(); law.root.position.set(0, 0, -0.3); scene.add(law.root);
  const rain = moneyRain({ n: 50, seed: 4, area: [0.8, 0.5], top: 2.4, floor: 0.2, center: [-0.95, 0, -1.2], coins: 0.2 }); scene.add(rain);
  const hearts = []; for (let i = 0; i < 6; i++) { const h = heart(0.1); scene.add(h); hearts.push(h); }
  const hurt = sign('БУДЕТ БОЛЬНО', { width: 1.1, color: '#ffffff', bg: '#d4213a', size: 100, pad: 22, border: '#ffffff' }); scene.add(hurt);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  const L = 2.38, R = 3.38;
  function update(lt) {
    const left = smooth(inv(L - 0.2, L + 0.2, lt)) * (1 - smooth(inv(R - 0.3, R, lt))), right = smooth(inv(R - 0.1, R + 0.3, lt));
    law.pose({ ...STAND, lSh: [-70 * left, 0, 10 + 40 * left], lEl: [-10, 0, 0], lCurl: 0.1, rSh: [-70 * right, 0, -10 - 40 * right], rEl: [-10, 0, 0], rCurl: 0.1, head: [0, 30 * left - 30 * right, 0] }); idle3(law, lt, 2, 0.3);
    law.face({ blink: 0, brows: right > 0.5 ? -0.8 : 0.2, smile: right > 0.5 ? 0 : 0.5, mouth: 0.1 });
    D.A.d.userData.leaf.rotation.y = -1.2 * smooth(inv(0.3, 1.2, lt)); D.B.d.userData.leaf.rotation.y = -0.18 * smooth(inv(R, R + 0.6, lt));
    rain.userData.update(lt); rain.visible = lt > 1.4;
    hearts.forEach((h, i) => { const a = lt - 2.3 - i * 0.18; h.visible = a > 0; if (a <= 0) return; h.position.set(-0.95 + Math.sin(a * 3 + i) * 0.25, 1.0 + a * 0.5, -1.0); h.scale.setScalar(0.1 * easeOutBack(clamp(a / 0.3), 2.5)); });
    D.B.l.intensity = 3 + 6 * right * (0.8 + 0.2 * Math.sin(lt * 9)); D.B.back.material.emissiveIntensity = 0.55 + 0.8 * right;
    pop(D.A.s, lt, 0.4, 0.3); pop(D.B.s, lt, R, 0.3); pop(hurt, lt, R + 0.6, 0.3); hurt.position.set(0.95, 0.35, -0.9);
    const f = kf(lt, [[0, [0, 1.6, 4.0], [0, 1.4, -1.2], 54, 0], [2.4, [-0.9, 1.5, 2.8], [-0.6, 1.4, -1.2], 50, -0.03], [4.75, [0.9, 1.4, 2.9], [0.6, 1.2, -1.2], 50, 0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.004 + 0.01 * right, 10, 2)), f.look, f.roll, f.fov);
    hurt.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.85, envIntensity: 0.2, ao: 1.0 };
}

// 50.60–52.00  «Выбрали первый.»
export function buildChoice() {
  const scene = new THREE.Scene(); const D = twoDoors(scene);
  const ch = cast6.cheater(); ch.root.position.set(-0.95, 0, -0.55); ch.root.rotation.y = Math.PI; scene.add(ch.root);
  const stack = cashStack(0.16, 0.06, 0.07); scene.add(stack);
  const one = text3d('1', { family: 'mont', size: 0.6, depth: 0.14, bevel: 0.02, color: '#3aff8a', side: '#1a8a4a', emissive: '#2aff7a', emissiveIntensity: 0.4 }); one.position.set(-0.95, 2.35, -1.2); scene.add(one);
  const t1 = sign('ВЫБРАЛИ ПЕРВЫЙ', { width: 1.1, color: '#ffffff', bg: '#2a8a4a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const wh = new THREE.Vector3();
  function update(lt) {
    D.A.d.userData.leaf.rotation.y = -1.2; D.A.s.visible = false; D.B.s.visible = true; D.B.s.scale.setScalar(1);
    const give = smooth(inv(0.1, 0.6, lt));
    ch.pose({ ...STAND, rSh: [-60 * give - 10, 0, -10], rEl: [-30, 0, 0], rCurl: 0.8, lSh: [-60 * give - 10, 0, 10], lEl: [-30, 0, 0], lCurl: 0.8, spine: [8 * give, 0, 0] }); idle3(ch, lt, 3, 0.3); ch.face({ blink: 0, brows: 0.6, mouth: 0.1 });
    ch.root.updateMatrixWorld(true); ch.J.rHand.group.getWorldPosition(wh); stack.position.copy(wh).add(V(0.12, -0.03, -0.05)); stack.rotation.y = Math.PI / 2;
    const k = easeOutBack(inv(0.55, 0.95, lt), 2.6); one.scale.setScalar(Math.max(0.001, k)); one.visible = lt > 0.53; one.rotation.y = Math.sin(lt * 3) * 0.3;
    pop(t1, lt, 0.75, 0.3);
    const f = kf(lt, [[0, [0.3, 1.8, 2.6], [-0.9, 1.6, -1.2], 52, 0.03], [1.4, [-0.2, 1.9, 2.3], [-0.95, 1.85, -1.2], 50, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.8);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.85, envIntensity: 0.2, ao: 1.0 };
}

// 52.00–55.35  «Они остались без денег и теперь под постоянным наблюдением,»
export function buildBroke() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#08080c');
  room6(scene, { w: 4.6, d: 4.6, h: 2.7, wall: '#4a4e56', floor: woodFloor('#5a4430', [3, 3]), windowAt: { wall: 'back', rect: [-1.2, 1.6, 1.0, 1.0] }, night: true, open: ['front'] });
  scene.add(new THREE.HemisphereLight('#a0a8ff', '#1a1410', 0.3));
  const ch0 = chair6('#3a3a40'); ch0.position.set(0.1, 0, -0.9); ch0.rotation.y = Math.PI; scene.add(solid(ch0, 'chair', ['cheater']));
  const ch = cast6.cheater(); ch.root.position.set(0.1, 0, -0.95); scene.add(ch.root); ch.root.userData.allow = ['chair'];
  const wal = new THREE.Group(); rbox(0.13, 0.09, 0.02, 0.008, M.col('#3a2418', 0.6), 0, 0, 0, wal); scene.add(shadows(wal));
  const cam = secCam(); cam.position.set(1.9, 2.5, -2.2); cam.rotation.y = -0.6; scene.add(cam);
  const camLight = new THREE.SpotLight('#ff4a4a', 0, 6, 0.25, 0.6, 1.2); scene.add(camLight, camLight.target);
  const bulb = ceilingLamp(scene, 0.1, -0.9, 2.7, '#ffd8a0'); bulb.l.intensity = 3;
  const key = new THREE.SpotLight('#ffd8b0', 16, 8, 0.6, 0.6, 1.2); key.position.set(0.5, 2.6, 0.8); key.target.position.set(0.1, 0.8, -0.9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const t1 = sign('БЕЗ ДЕНЕГ', { width: 0.9, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('ПОД НАБЛЮДЕНИЕМ', { width: 1.2, color: '#ffffff', bg: '#d4213a', size: 100, pad: 22, border: '#ffffff' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const wh = new THREE.Vector3(), hp = new THREE.Vector3();
  function update(lt) {
    const open = smooth(inv(0.5, 0.9, lt));
    ch.pose({ ...SITP, rSh: [-45, 0, -12], rEl: [-60 - 20 * open, 0, 0], rCurl: 0.5, lSh: [-30, 0, 14], lEl: [-70, 0, 0], lCurl: 0.3, spine: [14, 0, 0], head: [16, 0, 0] }); idle3(ch, lt, 5, 0.3);
    ch.face({ blink: 0, brows: 0.9, browTilt: 0.6, mouth: 0.05, look: [0, -0.3] });
    ch.root.updateMatrixWorld(true); ch.J.rHand.group.getWorldPosition(wh); wal.position.copy(wh).add(V(0.02, -0.04, 0.06)); wal.rotation.set(-0.6, 0, 0.2);
    ch.J.headGroup.getWorldPosition(hp);
    const head = cam.userData.head; const lookT = smooth(inv(2.0, 2.6, lt)); head.rotation.set(0.45 * lookT + 0.1, 0.25 - 0.55 * lookT, 0);
    cam.userData.led.material.emissiveIntensity = Math.floor(lt * 2) % 2 ? 5 : 1.5;
    camLight.position.copy(cam.position).add(V(-0.1, -0.16, 0.15)); camLight.target.position.copy(hp); camLight.intensity = 25 * lookT;
    pop(t1, lt, 1.0, 0.3); pop(t2, lt, 2.4, 0.3);
    const f = kf(lt, [[0, [-1.2, 1.4, 1.4], [0.1, 1.0, -0.9], 50, -0.03], [2.0, [-0.6, 1.25, 0.8], [0.1, 0.95, -0.9], 46, 0], [3.35, [-1.3, 1.9, 1.6], [0.6, 1.4, -1.5], 52, 0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 3)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.5, 0, 0.95); hud(t2, camera, 2.5, 0, 0.58);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.2, ao: 1.0 };
}

// 55.35–57.80  «на случай если понадобится второй вариант.»
export function buildDoor2() {
  const scene = new THREE.Scene(); const D = twoDoors(scene);
  D.A.d.visible = false; D.A.back.visible = false; D.A.s.visible = false; D.A.l.intensity = 0;
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    D.B.d.userData.leaf.rotation.y = -0.22 * smooth(inv(0.3, 1.6, lt));
    D.B.l.intensity = 6 + 3 * Math.sin(lt * 5); D.B.back.material.emissiveIntensity = 1.2 + 0.3 * Math.sin(lt * 5);
    pop(D.B.s, lt, 0.9, 0.35);
    const f = kf(lt, [[0, [0.9, 1.4, 3.2], [0.95, 1.3, -1.5], 52, 0.02], [2.45, [0.95, 1.5, 1.2], [0.95, 1.55, -1.5], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 6, 1)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.5, bloomThreshold: 0.82, envIntensity: 0.2, ao: 1.0 };
}
