import * as THREE from 'three';
import { cast9, creep, tower9, battlefield, pit, halo, holyBeam } from '../lib/sets9.js';
import { idle3 } from '../lib/human3.js';
import { sign, point } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, popOut, hud, shadows } from '../lib/shot.js';
import { walkPose } from '../lib/human.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';
import { text3d, STAND, STAFF } from './s01_patch.js';

const BOSS_IDLE = (b) => ({ lSh: [-20, 0, 25 + b * 3], rSh: [-20, 0, -25 - b * 3], lEl: [-40, 0, 0], rEl: [-40, 0, 0], lCurl: 0.9, rCurl: 0.9, spine: [10, 0, 0], head: [10, 0, 0], lHip: [-10, 0, 8], rHip: [-10, 0, -8], lKnee: [20, 0, 0], rKnee: [20, 0, 0], hipsY: -0.04 });
const bossWalk = (lt, k = 1) => { const w = walkPose(lt * 1.1, 0.7 * k); return { ...w, lSh: [w.lSh[0] - 20, 0, 25], rSh: [w.rSh[0] - 20, 0, -25], lEl: [-50, 0, 0], rEl: [-50, 0, 0], lCurl: 0.9, rCurl: 0.9, spine: [12, w.spine[1], 0], head: [8, 0, 0] }; };

// 22.90–24.95  «и на Рошане, главном боссе карты,»
export function buildReveal() {
  const scene = new THREE.Scene(); pit(scene);
  const B = cast9.boss(); B.root.position.set(0, 0, -1.2); scene.add(B.root);
  const hl = halo(0.9); scene.add(hl);
  const t1 = sign('РОШАН', { width: 0.9, color: '#ffffff', bg: '#5a1a1a', size: 120, pad: 20, border: '#ff8a3a' }); scene.add(t1);
  const t2 = sign('ГЛАВНЫЙ БОСС КАРТЫ', { width: 1.3, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  const hp = new THREE.Vector3();
  function update(lt) {
    const roar = smooth(inv(0.4, 0.8, lt)) * (1 - smooth(inv(1.6, 2.0, lt)));
    B.pose({ ...BOSS_IDLE(Math.sin(lt * 1.6)), lSh: [-60 * roar - 20, 0, 40 * roar + 25], rSh: [-60 * roar - 20, 0, -40 * roar - 25], head: [10 - 25 * roar, 0, 0] }); idle3(B, lt, 5, 0.4); B.face({ blink: 0, brows: -1, mouth: 0.3 + 0.6 * roar });
    B.root.updateMatrixWorld(true); B.J.headGroup.getWorldPosition(hp); hl.position.copy(hp).add(V(0, 0.75, 0)); hl.visible = lt > 1.0; hl.scale.setScalar(Math.max(0.01, smooth(inv(1.0, 1.3, lt)))); hl.rotation.z = lt * 2;
    pop(t1, lt, 0.4, 0.3); pop(t2, lt, 1.0, 0.3);
    const f = kf(lt, [[0, [0.6, 1.2, 3.2], [0, 2.6, -1.2], 56, 0.04], [2.05, [-0.5, 1.4, 3.8], [0, 2.8, -1.2], 58, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004 + 0.02 * roar, 14, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3, 0, 1.15); hud(t2, camera, 3, 0, -0.55);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.84, envIntensity: 0.25, ao: 1.0 };
}

// 24.95–27.15  «который обычно сидит в своей яме.»
export function buildPit() {
  const scene = new THREE.Scene(); pit(scene);
  const B = cast9.boss(); B.root.position.set(0, 0, -1.2); scene.add(B.root);
  const t1 = sign('ЯМА РОШАНА', { width: 1.0, color: '#ffffff', bg: '#3a2a1a', size: 100, pad: 20, border: '#c8a24a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    // seated on the ground, arms on knees, breathing slowly
    B.pose({ hipsY: -0.62, lHip: [-80, 0, 30], rHip: [-80, 0, -30], lKnee: [110, 0, 0], rKnee: [110, 0, 0], lSh: [-50, 0, 25], rSh: [-50, 0, -25], lEl: [-40, 0, 0], rEl: [-40, 0, 0], lCurl: 0.9, rCurl: 0.9, spine: [16 + Math.sin(lt * 1.3) * 2, 0, 0], head: [6, Math.sin(lt * 0.8) * 10, 0] }); idle3(B, lt, 5, 0.3);
    B.face({ blink: Math.floor(lt * 0.7) % 3 === 2 ? 1 : 0, brows: -0.6, mouth: 0.15 });
    pop(t1, lt, 0.3, 0.3);
    const f = kf(lt, [[0, [3.6, 4.2, 5.2], [0, 0.8, -1.2], 50, 0.04], [2.2, [2.0, 3.2, 4.4], [0, 1.0, -1.2], 50, 0.0]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3, 0, 1.05);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 1.0 };
}

// 27.15–29.95  «Chen брал Holy Persuasion на первом уровне,»
export function buildLevel() {
  const scene = new THREE.Scene(); battlefield(scene);
  const P = cast9.priest(); P.root.position.set(0, 0, 0.5); scene.add(P.root);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 48), new THREE.MeshBasicMaterial({ color: '#ffe08a', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.03, 0.5); scene.add(ring);
  const lvl = text3d('УРОВЕНЬ 1', { family: 'mont', size: 0.2, depth: 0.05, bevel: 0.008, color: '#ffe08a', side: '#a8700a', emissive: '#ffc040', emissiveIntensity: 0.4 }); scene.add(lvl);
  const t1 = sign('HOLY PERSUASION', { width: 1.2, color: '#1a1a1a', bg: '#ffe08a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 80);
  function update(lt) {
    const up = smooth(inv(0.3, 0.7, lt));
    P.pose({ ...STAND, ...STAFF, rSh: [-35 - 100 * up * (1 - smooth(inv(1.5, 2.0, lt))), 0, -14] }); idle3(P, lt, 2, 0.3); P.face({ blink: 0, smile: 0.5, brows: 0.2 });
    const k = (lt % 1.0); ring.scale.setScalar(0.6 + k * 1.6); ring.material.opacity = 0.9 * (1 - k);
    pop(lvl, lt, 0.2, 0.35, 2.4); pop(t1, lt, 0.75, 0.3);
    const f = kf(lt, [[0, [1.4, 1.5, 3.6], [0, 1.3, 0.5], 50, 0.03], [2.8, [-1.0, 1.6, 3.2], [0, 1.4, 0.5], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(lvl, camera, 2.6, 0, 0.95); hud(t1, camera, 2.6, 0, -0.42);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.3, ao: 0.8 };
}

// 29.95–32.55  «шёл к Рошану и приводил его на линию.»
export function buildLead() {
  const scene = new THREE.Scene(); battlefield(scene);
  const P = cast9.priest(); P.root.rotation.y = 0; scene.add(P.root);
  const B = cast9.boss(); scene.add(B.root);
  const hl = halo(0.9); scene.add(hl);
  const t1 = sign('НА ЛИНИЮ', { width: 0.9, color: '#1a1a1a', bg: '#ffd23a', size: 110, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 80);
  const hp = new THREE.Vector3();
  function update(lt) {
    const zP = lerp(-4.0, 2.6, lt / 2.6), zB = zP - 2.4;
    P.pose({ ...walkPose(lt * 1.6, 0.9), ...STAFF }); idle3(P, lt, 2, 0.2); P.face({ blink: 0, smile: 0.6 }); P.root.position.set(0.3, 0, zP);
    B.pose(bossWalk(lt)); idle3(B, lt, 5, 0.3); B.face({ blink: 0, brows: -0.8, mouth: 0.3 }); B.root.position.set(-0.3, 0, zB);
    B.root.updateMatrixWorld(true); B.J.headGroup.getWorldPosition(hp); hl.position.copy(hp).add(V(0, 0.75, 0)); hl.rotation.z = lt * 2;
    pop(t1, lt, 1.6, 0.3);
    const f = kf(lt, [[0, [2.6, 2.4, 3.0], [0, 1.6, -2.0], 56, 0.03], [2.6, [2.2, 2.2, 6.2], [0, 1.8, 0.8], 56, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 6, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3, 0, 1.0);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.3, ao: 0.8 };
}

// lane with enemy creeps and a tower; the boss charges through
function laneFight(scene) {
  battlefield(scene);
  const T = tower9('#c83a2a'); T.position.set(0.9, 0, -5.5); scene.add(solid(T, 'tower'));
  const r = rng(3); const creeps = [0, 1, 2, 3].map((i) => { const c = creep('#c83a2a'); c.position.set(-0.6 + (i % 2) * 1.0, 0, -2.2 - Math.floor(i / 2) * 0.9); c.rotation.y = 0; c.userData = { x0: c.position.x, z0: c.position.z, dir: r() > 0.5 ? 1 : -1, t0: 0.6 + i * 0.25 }; scene.add(c); return c; });
  const dust = []; for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(200,180,150,1)'), transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); dust.push(s); }
  return { T, creeps, dust };
}
const fling = (c, lt) => { const u = c.userData; const k = clamp((lt - u.t0) / 0.9); if (k <= 0) { c.position.set(u.x0, Math.abs(Math.sin(lt * 6 + u.x0)) * 0.03, u.z0); c.rotation.set(0, Math.PI, 0); return; } c.position.set(u.x0 + u.dir * k * 2.4, Math.sin(k * Math.PI) * 1.6, u.z0 - k * 1.5); c.rotation.set(k * 6, 0, u.dir * k * 4); c.visible = k < 1; };
// 32.55–35.55  «Рошан бежал за героем и атаковал всех подряд:»
export function buildRampage() {
  const scene = new THREE.Scene(); const L = laneFight(scene);
  const P = cast9.priest(); P.root.rotation.y = Math.PI; scene.add(P.root);
  const B = cast9.boss(); B.root.rotation.y = Math.PI; scene.add(B.root);
  const t1 = sign('АТАКУЕТ ВСЕХ', { width: 1.0, color: '#ffffff', bg: '#d4213a', size: 110, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 80);
  function update(lt) {
    const zB = lerp(1.2, -1.6, smooth(clamp(lt / 2.0)));
    P.pose({ ...walkPose(lt * 1.6, 0.8), ...STAFF }); idle3(P, lt, 2, 0.2); P.face({ blink: 0, smile: 0.7 }); P.root.position.set(1.2, 0, lerp(-0.4, -2.6, smooth(clamp(lt / 2.6))));
    const swing = Math.max(0, Math.sin(lt * 5));
    B.pose({ ...bossWalk(lt, 0.8), rSh: [-120 * swing - 20, 0, -30], rEl: [-30, 0, 0], lSh: [-60 * (1 - swing) - 20, 0, 30] }); idle3(B, lt, 5, 0.3); B.face({ blink: 0, brows: -1, mouth: 0.5 + 0.3 * swing }); B.root.position.set(-0.2, 0, zB);
    L.creeps.forEach((c) => fling(c, lt));
    L.dust.forEach((s, i) => { const k = ((lt * 0.8 + i * 0.07) % 1); s.position.set(-0.2 + Math.sin(i * 2.3) * (0.5 + k), 0.2 + k * 0.6, zB + 0.4 + Math.cos(i * 1.7) * 0.6); s.scale.setScalar(0.5 + k); s.material.opacity = 0.35 * (1 - k); });
    pop(t1, lt, 2.25, 0.3);
    const f = kf(lt, [[0, [-2.6, 2.2, -6.6], [0, 1.7, -0.6], 58, 0.05], [3.0, [-1.0, 2.5, -7.0], [0, 1.8, -1.6], 58, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.006 + 0.025 * swing * (lt > 0.4 ? 1 : 0), 18, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3, 0, 1.05);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.3, ao: 0.8 };
}

// 35.55–38.20  «вражеских героев, крипов и башни.»
export function buildTowers() {
  const scene = new THREE.Scene(); const L = laneFight(scene);
  L.creeps.forEach((c) => { c.visible = false; });
  L.T.visible = false; L.T.userData.solid = null;
  // the tower: we break it into a lower stump and an upper part that topples
  const top = tower9('#c83a2a'); top.position.set(0.9, 0, -3.6); scene.add(top);
  const B = cast9.boss(); B.root.position.set(-0.2, 0, -1.6); B.root.rotation.y = Math.PI + 0.25; scene.add(B.root);
  const E = cast9.enemy('enemy'); E.root.position.set(-1.6, 0, -3.4); scene.add(E.root);
  const cr = creep('#c83a2a'); cr.userData = { x0: -0.9, z0: -3.0, dir: -1, t0: 1.1 }; scene.add(cr);
  const labels = ['ГЕРОИ', 'КРИПЫ', 'БАШНИ'].map((t, i) => { const s = sign(t, { width: 0.75, color: '#ffffff', bg: ['#8a2a2a', '#c83a2a', '#5a1a1a'][i], size: 100, pad: 18, border: '#ffffff' }); scene.add(s); return s; });
  const debris = []; const r = rng(5); for (let i = 0; i < 16; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.16), M.std({ map: TEX.concrete([1, 1], '#8a8478'), roughness: 0.85 })); d.userData = { vx: (r() - 0.5) * 3, vy: 2 + r() * 2, vz: (r() - 0.2) * 2, rs: r() * 8 }; d.castShadow = true; scene.add(d); debris.push(d); }
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 80);
  const HIT = 1.9;
  function update(lt) {
    const swing = lt < HIT ? smooth(inv(HIT - 0.5, HIT, lt)) : 1 - smooth(inv(HIT + 0.2, HIT + 0.6, lt));
    B.pose({ ...BOSS_IDLE(0), rSh: [-140 * swing - 10, 0, -30], rEl: [-20, 0, 0], lSh: [-40, 0, 30], spine: [10 + 15 * swing, -15, 0] }); idle3(B, lt, 5, 0.3); B.face({ blink: 0, brows: -1, mouth: 0.4 + 0.4 * swing });
    const hitE = smooth(inv(0.5, 0.9, lt));
    E.pose({ ...STAND, lSh: [-60, 0, 40 * hitE], rSh: [-60, 0, -40 * hitE], spine: [-20 * hitE, 0, 0] }); idle3(E, lt, 7, 0.2); E.face({ blink: 0, brows: 1, mouth: 0.6 * hitE });
    E.root.position.set(-1.6 - hitE * 1.4, Math.sin(hitE * Math.PI) * 0.4, -3.4 - hitE * 0.6); E.root.rotation.set(-hitE * 0.9, 0.4, 0);
    fling(cr, lt);
    const fall = smooth(inv(HIT, HIT + 0.7, lt)); top.rotation.set(-fall * 1.25, 0, fall * 0.3); top.position.set(0.9, 0, -3.6 - fall * 0.2);
    debris.forEach((d) => { const t = lt - HIT; d.visible = t > 0 && t < 1.2; if (!d.visible) return; const u = d.userData; d.position.set(0.9 + u.vx * t, Math.max(0.08, 1.2 + u.vy * t - 4.9 * t * t), -3.4 + u.vz * t); d.rotation.set(u.rs * t, u.rs * t * 0.7, 0); });
    [0.62, 1.27, 1.87].forEach((t0, i) => { pop(labels[i], lt, t0, 0.3, 2.6); });
    const f = kf(lt, [[0, [4.4, 2.6, 1.2], [-0.2, 1.8, -2.8], 60, 0.04], [2.65, [5.0, 3.0, 0.2], [0, 1.9, -3.2], 60, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.005 + (lt > HIT && lt < HIT + 0.4 ? 0.04 : 0), 20, 2)), f.look, f.roll, f.fov);
    labels.forEach((s, i) => hud(s, camera, 3, -0.55 + i * 0.55, 1.0 - (i % 2) * 0.3));
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.3, ao: 0.8 };
}

// 38.20–41.65  «Команде на другом конце карты приходилось совсем несладко.»
export function buildEnemyBase() {
  const scene = new THREE.Scene(); battlefield(scene, { night: true });
  const anc = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 0.5, 8), M.col('#3a3a40', 0.6)); b.position.y = 0.25; anc.add(b); const crys = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), M.std({ color: '#ff4a3a', emissive: '#ff2a1a', emissiveIntensity: 1.0, roughness: 0.2 })); crys.scale.y = 1.7; crys.position.y = 1.9; anc.add(crys); anc.position.set(0, 0, -4); scene.add(solid(shadows(anc), 'ancient'));
  const E1 = cast9.enemy('e1', '#8a2a2a'), E2 = cast9.enemy('e2', '#6a2a5a', '#c89a78'); E1.root.position.set(-0.7, 0, -1.6); E2.root.position.set(0.7, 0, -1.4); E1.root.rotation.y = 0.3; E2.root.rotation.y = -0.3; scene.add(E1.root, E2.root);
  const alarm = point(scene, '#ff2a2a', 0, 10, [0, 3, -1]);
  const t1 = sign('ВРАЖЕСКАЯ БАЗА', { width: 1.2, color: '#ffffff', bg: '#5a1a1a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('СОВСЕМ НЕСЛАДКО', { width: 1.3, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 80);
  function update(lt) {
    crys.rotation.y = lt * 0.6;
    alarm.intensity = 10 * (0.5 + 0.5 * Math.sin(lt * 8));
    const panic = Math.sin(lt * 9);
    E1.pose({ ...STAND, lSh: [-160, 0, 20], rSh: [-160, 0, -20], lEl: [-30 + panic * 10, 0, 0], rEl: [-30 - panic * 10, 0, 0], lCurl: 0.1, rCurl: 0.1, head: [0, panic * 15, 0] }); idle3(E1, lt, 3, 0.4); E1.face({ blink: 0, brows: 1, mouth: 0.7 });
    E2.pose({ ...STAND, lSh: [-70, 0, 15], rSh: [-70, 0, -15], lEl: [-110, 0, 0], rEl: [-110, 0, 0], lCurl: 0.2, rCurl: 0.2, spine: [8, 0, 0], head: [6, 0, 0] }); idle3(E2, lt, 8, 0.4); E2.face({ blink: 0, brows: 1, mouth: 0.4 });
    pop(t1, lt, 0.1, 0.3); pop(t2, lt, 2.3, 0.3);
    const f = kf(lt, [[0, [0, 2.4, 4.4], [0, 1.6, -2], 54, 0.03], [3.45, [0.6, 1.8, 3.2], [0, 1.4, -1.6], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.01 + 0.01 * Math.abs(Math.sin(lt * 3)), 10, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3, 0, 1.05); hud(t2, camera, 3, 0, -0.55);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.84, envIntensity: 0.25, ao: 0.8 };
}

// 41.65–45.45  «Баг прожил недолго: Valve выпустила хотфикс меньше чем за сутки,»
export function buildHotfix() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#07070c');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), M.std({ color: '#16161e', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.45));
  const key = new THREE.SpotLight('#ffffff', 12, 10, 0.6, 0.5, 1.2); key.position.set(1, 5, 3); key.target.position.set(0, 1.2, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  // clock face counting the hours down
  const clock = new THREE.Group(); const face = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 48), M.col('#d8d4ca', 0.6)); face.rotation.x = Math.PI / 2; clock.add(face); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 10, 48), M.col('#2a2a30', 0.4, 0.6)); clock.add(rim);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; box(0.03, 0.12, 0.02, M.col('#1a1a1a', 0.5), Math.sin(a) * 0.68, Math.cos(a) * 0.68, 0.05, clock).rotation.z = -a; }
  const hand = new THREE.Group(); box(0.04, 0.6, 0.02, M.col('#d4213a', 0.4), 0, 0.28, 0.06, hand); clock.add(hand); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16), M.col('#1a1a1a', 0.4)); hub.rotation.x = Math.PI / 2; hub.position.z = 0.07; clock.add(hub);
  clock.position.set(0, 1.6, -0.5); scene.add(shadows(clock));
  const t1 = sign('ХОТФИКС', { width: 0.9, color: '#ffffff', bg: '#2a8a4a', size: 110, pad: 20, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('МЕНЬШЕ ЧЕМ ЗА СУТКИ', { width: 1.3, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const t0 = sign('БАГ ПРОЖИЛ НЕДОЛГО', { width: 1.3, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 20, border: '#ffffff' }); scene.add(t0);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    hand.rotation.z = -lt * 2.4;
    popOut(t0, lt, 0.05, 1.15); pop(t1, lt, 1.25, 0.3); pop(t2, lt, 2.75, 0.3);
    const f = kf(lt, [[0, [0.5, 1.7, 3.0], [0, 1.6, -0.5], 50, 0.03], [3.8, [-0.4, 1.6, 2.6], [0, 1.6, -0.5], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t0, camera, 2.6, 0, 0.95); hud(t1, camera, 2.6, 0, 0.95); hud(t2, camera, 2.6, 0, -0.45);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 0.8 };
}

// 45.45–48.80  «и контролируемый Рошан остался легендой.»
export function buildLegend() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#06060a');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), M.std({ color: '#141418', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.35));
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.5, 40), M.col('#2a2a32', 0.4, 0.4)); ped.position.y = 0.25; ped.castShadow = true; ped.receiveShadow = true; scene.add(ped);
  const B = cast9.boss(); B.root.position.set(0, 0.5, 0); scene.add(B.root);
  const gold = new THREE.MeshStandardMaterial({ color: '#e8b84a', roughness: 0.3, metalness: 0.9, emissive: '#5a3a00', emissiveIntensity: 0.3 }); B.root.traverse((m) => { if (m.isMesh && !(m.material && m.material.emissiveIntensity > 2)) m.material = gold; });
  const hl = halo(1.0); scene.add(hl);
  const key = new THREE.SpotLight('#fff0dc', 50, 12, 0.45, 0.5, 1.2); key.position.set(0.5, 7, 3); key.target.position.set(0, 2, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  point(scene, '#ffd27a', 10, 6, [0, 3, 2]);
  const t1 = sign('ЛЕГЕНДА', { width: 1.0, color: '#1a1a1a', bg: '#ffd23a', size: 120, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const t2 = sign('КОНТРОЛИРУЕМЫЙ РОШАН', { width: 1.4, color: '#ffffff', bg: '#5a1a1a', size: 100, pad: 20, border: '#ffd27a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const hp = new THREE.Vector3();
  function update(lt) {
    B.pose({ lSh: [-160, 0, 30], rSh: [-160, 0, -30], lEl: [-20, 0, 0], rEl: [-20, 0, 0], lCurl: 0.9, rCurl: 0.9, head: [-10, 0, 0], lHip: [-10, 0, 10], rHip: [10, 0, -10] }); B.face({ blink: 0, brows: -0.8, mouth: 0.5 });
    B.root.updateMatrixWorld(true); B.J.headGroup.getWorldPosition(hp); hl.position.copy(hp).add(V(0, 0.8, 0)); hl.rotation.z = lt * 1.5;
    pop(t2, lt, 0.25, 0.3); pop(t1, lt, 2.6, 0.35);
    const a = 0.5 - lt * 0.25; const f = { pos: V(Math.sin(a) * 5.4, lerp(1.6, 2.4, smooth(lt / 3.35)), Math.cos(a) * 5.4), look: V(0, 2.4, 0) };
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, 0, 54);
    hud(t2, camera, 3, 0, 1.1); hud(t1, camera, 3, 0, -0.5);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.84, envIntensity: 0.25, ao: 0.8 };
}
