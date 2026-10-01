import * as THREE from 'three';
import { mk3 } from '../lib/cast3.js';
import { idle2 } from '../lib/human2.js';
import { TALK_A, TALK_B, mix } from '../lib/poses.js';
import { talk } from '../lib/human.js';
import { armchair, lightStand, tripodCam, beetle, walkBug, wrench, glassDome, pedestal, gauge, warTable, heart } from '../lib/fantasy.js';
import { sign, point, particles } from '../lib/env.js';
import { text3d } from '../lib/text3d.js';
import { box, rbox } from '../lib/props.js';
import { room } from '../lib/rooms.js';
import { solid } from '../lib/overlap.js';
import { TEX, M, V, setCam, kf, inv, smooth, easeOutBack, easeInOut, easeOutElastic, shake, lerp, clamp, glowTex } from '../lib/util.js';

const SITP = { hipsY: -0.42, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0], spine: [-4, 0, 0] };
function studio(scene) {
  scene.background = new THREE.Color('#0c0e14');
  const R = room({ w: 8, d: 8, h: 3.6, wall: M.std({ color: '#1a1e2a', roughness: 0.9 }), floor: M.std({ map: TEX.carpet([6, 6], '#2a2230'), roughness: 1 }), ceil: M.col('#0a0a10', 1), open: ['front'] }); scene.add(R);
  const back = sign('ИНТЕРВЬЮ', { width: 2.6, color: '#ffffff', size: 130, pad: 20, emissive: 1.0 }); back.position.set(0, 2.6, -3.95); scene.add(back);
  const neon = box(3.0, 0.03, 0.03, M.emis('#ff6a3a', 2.5), 0, 2.15, -3.95, scene); void neon;
  scene.add(new THREE.HemisphereLight('#b8c4e0', '#1a1420', 0.55));
  const key = new THREE.SpotLight('#fff1dc', 40, 12, 0.8, 0.6, 1.3); key.position.set(1.6, 3.4, 2.6); key.target.position.set(0, 1.0, -0.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  point(scene, '#ff8a4a', 10, 8, [-2.6, 2.0, -1.5]); point(scene, '#4a8aff', 10, 8, [2.6, 2.0, -1.5]);
  for (const [x, z, r] of [[-2.4, 0.8, 0.6], [2.4, 0.8, -0.6]]) { const l = lightStand(); l.position.set(x, 0, z); l.rotation.y = r; scene.add(solid(l, 'light' + x)); }
  return { back };
}

// 32.10–34.65  «Глава студии Bethesda Тодд Говард в интервью»
export function buildInterview() {
  const scene = new THREE.Scene(); studio(scene);
  const c1 = armchair('#5a2a3a'); c1.position.set(-0.95, 0, -0.6); c1.rotation.y = 0.75; scene.add(solid(c1, 'chairH', ['host']));
  const c2 = armchair('#2a3a5a'); c2.position.set(0.95, 0, -0.6); c2.rotation.y = -0.75; scene.add(solid(c2, 'chairB', ['boss']));
  const host = mk3.host(); host.root.position.set(-0.95, 0, -0.55); host.root.rotation.y = 0.75; scene.add(host.root); host.root.userData.allow = ['chairH'];
  const boss = mk3.boss(); boss.root.position.set(0.95, 0, -0.55); boss.root.rotation.y = -0.75; scene.add(boss.root); boss.root.userData.allow = ['chairB'];
  const tbl = new THREE.Group(); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 24), M.col('#2a2a2a', 0.3, 0.5)); top.position.y = 0.55; tbl.add(top); box(0.05, 0.55, 0.05, M.col('#1a1a1a', 0.4), 0, 0.275, 0, tbl);
  for (const x of [-0.08, 0.1]) { const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.11, 14), new THREE.MeshStandardMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.5, roughness: 0.05 })); gl.position.set(x, 0.63, 0); tbl.add(gl); }
  tbl.position.set(0, 0, 0.25); scene.add(solid(tbl, 'table'));
  const cam = tripodCam(); cam.position.set(-1.6, 0, 1.6); cam.rotation.y = -0.6; scene.add(solid(cam, 'tripod'));
  const lower = sign('ГЛАВА СТУДИИ', { width: 0.95, color: '#ffffff', bg: '#d0402a', size: 100, pad: 24, border: '#ffffff', emissive: 0.4 }); scene.add(lower);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    host.pose({ ...SITP, lSh: [-30, 0, 12], rSh: [-30, 0, -12], lEl: [-70, 0, 0], rEl: [-70, 0, 0] }); idle2(host, lt, 2, 0.3); host.face({ blink: 0, brows: 0.3, smile: 0.5, mouth: 0.05 });
    const g = (Math.sin(lt * 2.6) + 1) / 2;
    boss.pose({ ...SITP, ...mix(TALK_A, TALK_B, g) }); boss.J.hipsY; boss.pose({ ...SITP, ...mix(TALK_A, TALK_B, g), hipsY: -0.42 }); idle2(boss, lt, 5, 0.4);
    boss.face({ blink: 0, brows: 0.3 + 0.3 * Math.sin(lt * 2), smile: 0.4, mouth: talk(lt, 3, 0.8) });
    const k = easeOutBack(inv(0.35, 0.75, lt), 2.2); lower.scale.setScalar(Math.max(0.001, k)); lower.visible = lt > 0.33;
    lower.position.set(0.42, 1.78, -0.25);
    const f = kf(lt, [[0, [0.0, 1.6, 3.4], [0, 1.0, -0.6], 52, 0], [2.55, [0.35, 1.5, 2.5], [0.3, 1.0, -0.4], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 3)), f.look, f.roll, f.fov);
    lower.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.9, envIntensity: 0.25 };
}

// 34.65–37.55  «объяснял общий подход студии довольно просто:»
export function buildExplain() {
  const scene = new THREE.Scene(); studio(scene);
  const c2 = armchair('#2a3a5a'); c2.position.set(0, 0, -0.6); scene.add(solid(c2, 'chairB', ['boss']));
  const boss = mk3.boss(); boss.root.position.set(0, 0, -0.55); scene.add(boss.root); boss.root.userData.allow = ['chairB'];
  const board = new THREE.Group(); rbox(2.0, 1.1, 0.05, 0.02, M.col('#a8a49c', 0.7), 0, 0, 0, board); scene.add(board); board.position.set(0, 2.25, -3.6);
  const t1 = sign('ПОДХОД СТУДИИ', { width: 1.7, color: '#1a2a44', size: 100, pad: 16 }); t1.position.set(0, 0.32, 0.03); board.add(t1);
  const t2 = sign('баг весёлый?  →  оставить', { width: 1.7, color: '#d0402a', size: 80, pad: 16 }); t2.position.set(0, -0.15, 0.03); board.add(t2);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const g = (Math.sin(lt * 2.9) + 1) / 2;
    boss.pose({ ...SITP, ...mix(TALK_A, TALK_B, g), hipsY: -0.42, head: [0, Math.sin(lt * 1.3) * 12, 0] }); idle2(boss, lt, 5, 0.4);
    boss.face({ blink: 0, brows: 0.4 + 0.4 * Math.sin(lt * 2.3), smile: 0.5, mouth: talk(lt, 4, 0.9) });
    t1.visible = lt > 0.5; t1.scale.setScalar(Math.max(0.001, easeOutBack(inv(0.5, 0.9, lt), 2.2)));
    t2.visible = lt > 2.2; t2.scale.setScalar(Math.max(0.001, easeOutBack(inv(2.2, 2.6, lt), 2.2)));
    const f = kf(lt, [[0, [0.6, 1.35, 2.1], [0, 1.15, -0.6], 50, 0.03], [2.9, [-0.3, 1.5, 1.6], [0, 1.45, -1.5], 50, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.9, envIntensity: 0.25 };
}

function bugStage(scene) {
  scene.background = new THREE.Color('#0a0c12');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 48), M.std({ map: TEX.tiles([8, 8], '#3a3640'), roughness: 0.35, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d4f0', '#14101c', 0.5));
  const key = new THREE.SpotLight('#fff1dc', 45, 10, 0.5, 0.6, 1.2); key.position.set(0.5, 4.2, 1.8); key.target.position.set(0, 0.9, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; scene.add(key, key.target);
  point(scene, '#7aff9a', 8, 6, [-1.6, 1.8, 1.0]); point(scene, '#ff6a8a', 6, 6, [1.8, 1.6, 0.6]);
  const ped = pedestal(0.8, 0.9); scene.add(solid(ped, 'pedestal'));
  const bug = beetle({ s: 0.7 }); bug.position.set(0, 0.96, 0); scene.add(bug);
  const plq = sign('БАГ', { width: 0.5, color: '#1a1a1a', bg: '#d8b45a', size: 110, pad: 18, border: '#1a1a1a' }); plq.position.set(0, 0.55, 0.41); scene.add(plq);
  const g = gauge('ВЕСЕЛЬЕ'); g.position.set(0.0, 2.3, -0.8); scene.add(g);
  box(0.05, 1.4, 0.05, M.col('#2a2a32', 0.4, 0.6), 0, 1.6, -0.85, scene);
  return { bug, g };
}

// 37.55–42.20  «если баг никому не мешает, а его исправление сделало бы игру менее весёлой,»
export function buildFun() {
  const scene = new THREE.Scene(); const S = bugStage(scene);
  const wr = wrench(1.0); scene.add(wr);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const IN = 1.3, NEAR = 2.4;
  function update(lt) {
    const fear = smooth(inv(IN + 0.4, NEAR, lt));
    S.bug.position.y = 0.96 + Math.abs(Math.sin(lt * 6)) * 0.06 * (1 - fear); S.bug.rotation.y = Math.sin(lt * 3) * 0.4 * (1 - fear) + fear * 0.5; walkBug(S.bug, lt * (1 - fear * 0.7), 12);
    S.bug.userData.eyes.forEach((e) => { e.position.x = Math.sign(e.position.x) * 0.055 - 0.02 * fear; });
    const k = easeInOut(inv(IN, NEAR, lt));
    wr.position.set(lerp(-2.4, -0.62, k), lerp(2.2, 1.35, k), 0.2); wr.rotation.set(0, 0, lerp(0.5, -0.4, k) + Math.sin(lt * 10) * 0.05 * k);
    // fun gauge: right (green) → left (red) when the fix approaches
    S.g.userData.needle.rotation.z = lerp(-1.2, 1.25, smooth(inv(NEAR - 0.1, NEAR + 1.4, lt))) + Math.sin(lt * 14) * 0.04;
    const f = kf(lt, [[0, [1.2, 1.7, 3.3], [0, 1.3, 0], 54, 0.03], [2.4, [0.3, 1.6, 2.6], [-0.2, 1.4, 0], 52, 0], [4.65, [-0.4, 1.9, 2.8], [0, 1.9, -0.5], 52, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 6, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.9, envIntensity: 0.25 };
}

// 42.20–45.50  «такие баги в студии предпочитают просто оставлять как есть.»
export function buildKeep() {
  const scene = new THREE.Scene(); const S = bugStage(scene);
  const dome = glassDome(0.42); scene.add(dome);
  const dev2 = mk3.dev2(); dev2.root.position.set(-0.95, 0, 0.1); dev2.root.rotation.y = Math.PI / 2 - 0.2; scene.add(dev2.root);
  const keep = sign('ОСТАВИТЬ КАК ЕСТЬ', { width: 1.6, color: '#ffffff', bg: '#1e9e57', size: 100, pad: 24, border: '#ffffff', emissive: 0.4 }); keep.position.set(0, 1.95, 0.3); scene.add(keep);
  const hearts = []; for (let i = 0; i < 6; i++) { const h = heart(0.1); scene.add(h); hearts.push(h); }
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const DOWN = 1.35, KEEP = 2.35;
  function update(lt) {
    S.bug.position.y = 0.96 + Math.abs(Math.sin(lt * 6)) * 0.05; S.bug.rotation.y = Math.sin(lt * 2.5) * 0.5; walkBug(S.bug, lt, 12);
    const d = easeInOut(inv(0.2, DOWN, lt)); dome.position.set(0, lerp(1.9, 0.93, d), 0);
    const reach = 1 - smooth(inv(DOWN, DOWN + 0.5, lt));
    dev2.pose({ lSh: [-110 * reach - 10, 0, 10], rSh: [-110 * reach - 10, 0, -10], lEl: [-30, 0, 0], rEl: [-30, 0, 0], lCurl: 0.2, rCurl: 0.2, head: [10, 0, 0], spine: [8 * reach, 0, 0] }); idle2(dev2, lt, 2, 0.3);
    dev2.face({ blink: 0, brows: 0.4, smile: 0.8, mouth: 0.05 });
    S.g.userData.needle.rotation.z = lerp(1.25, -1.2, smooth(inv(DOWN, KEEP + 0.4, lt))) + Math.sin(lt * 14) * 0.03;
    const k = easeOutBack(inv(KEEP, KEEP + 0.45, lt), 2.2); keep.scale.setScalar(Math.max(0.001, k)); keep.visible = lt > KEEP - 0.02;
    hearts.forEach((h, i) => { const a = lt - KEEP - i * 0.1; h.visible = a > 0; if (a <= 0) return; h.position.set(-0.4 + i * 0.16, 1.5 + a * 0.5, 0.3); h.scale.setScalar(0.1 * easeOutBack(clamp(a / 0.3), 2.5)); h.rotation.y = Math.sin(a * 4 + i) * 0.5; });
    const f = kf(lt, [[0, [1.6, 1.8, 2.6], [0, 1.2, 0], 52, 0.03], [3.3, [0.6, 1.55, 2.4], [0, 1.4, 0], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 6, 5)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.9, envIntensity: 0.25 };
}

// 45.50–48.25  «И в этом на самом деле отличная стратегия:»
export function buildStrategy() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0e0a08');
  const R = room({ w: 7, d: 7, h: 3.4, wall: M.std({ map: TEX.brick([4, 2]), color: '#6a5a50', roughness: 0.95 }), floor: M.std({ map: TEX.plywood([4, 4], '#4a3020'), roughness: 0.8 }), ceil: M.col('#1a1208', 1), open: ['front'] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#ffd9b0', '#1a1008', 0.5));
  const key = new THREE.SpotLight('#ffd9a0', 22, 10, 0.7, 0.6, 1.3); key.position.set(0, 3.3, 0.8); key.target.position.set(0, 0.9, -0.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  for (const x of [-2.6, 2.6]) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), M.emis('#ffcf80', 5)); c.position.set(x, 2.0, -3.3); scene.add(c); point(scene, '#ffb060', 8, 6, [x, 2.0, -3.0]); }
  const tb = warTable(); tb.position.set(0, 0, -0.6); scene.add(solid(tb, 'table'));
  const boss = mk3.boss(); boss.root.position.set(-0.35, 0, -2.05); scene.add(boss.root);
  const dev = mk3.dev(); dev.root.position.set(1.55, 0, -0.5); dev.root.rotation.y = -Math.PI / 2; scene.add(dev.root);
  const title = text3d('СТРАТЕГИЯ', { family: 'mont', size: 0.3, depth: 0.07, bevel: 0.01, color: '#ffd76a', side: '#8a5a10', emissive: '#ffb020', emissiveIntensity: 0.35 }); title.position.set(0, 2.45, -3.0); scene.add(title);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const T = 1.86;
  function update(lt) {
    boss.pose({ rSh: [-65, 0, -15], rEl: [-20, 0, 0], rCurl: 0.8, rThumb: 0.8, lSh: [-30, 0, 15], lEl: [-80, 0, 0], spine: [10, 0, 0], head: [22, 0, 0] }); idle2(boss, lt, 2, 0.3);
    boss.face({ blink: 0, brows: 0.3, smile: 0.6, mouth: talk(lt, 2, 0.5) });
    dev.pose({ lSh: [-25, 0, 20], rSh: [-25, 0, -20], lEl: [-100, -40, 0], rEl: [-100, 40, 0], spine: [12, 0, 0], head: [22, 0, 0] }); idle2(dev, lt, 6, 0.3); dev.face({ blink: 0, brows: 0.5, smile: 0.5 });
    tb.userData.pieces.forEach((p, i) => { const k = easeOutBack(inv(0.2 + i * 0.18, 0.5 + i * 0.18, lt), 2.6); p.scale.setScalar(Math.max(0.001, k)); });
    const k = easeOutElastic(inv(T, T + 0.6, lt)); title.scale.setScalar(Math.max(0.001, k)); title.visible = lt > T - 0.02; title.rotation.y = (1 - clamp(k)) * 1.2;
    const f = kf(lt, [[0, [1.6, 2.6, 2.0], [0, 0.95, -0.6], 52, 0.04], [2.75, [-0.8, 2.3, 1.8], [0, 1.4, -1.2], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.9, envIntensity: 0.25 };
}
