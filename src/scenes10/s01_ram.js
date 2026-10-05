import * as THREE from 'three';
import { cast10, console10, ramChip, levelChunk, runner } from '../lib/sets10.js';
import { room6, desk6, chair6, screen6, keyboard6, plant, woodFloor, ceilingLamp, corkBoard, note } from '../lib/sets6.js';
import { crt } from '../lib/cs.js';
import { idle3 } from '../lib/human3.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, popOut, hud, shadows } from '../lib/shot.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';

export const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
export const STAND = { lSh: [0, 0, 7], rSh: [0, 0, -7] };
export const SITP = { hipsY: -0.36, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0] };
export const typing = (H, lt, seed = 2) => { const ty = Math.sin(lt * 14) * 4; H.pose({ ...SITP, lSh: [-33 + ty, 0, 10], rSh: [-33 - ty, 0, -10], lEl: [-82, 0, 0], rEl: [-82, 0, 0], lCurl: 0.35, rCurl: 0.35, spine: [8, 0, 0], head: [4, 0, 0] }); idle3(H, lt, seed, 0.3); };

export function stage(scene, bg = '#07070c') {
  scene.background = new THREE.Color(bg);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 48), M.std({ color: '#16161e', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.5));
  const key = new THREE.SpotLight('#fff0dc', 30, 12, 0.6, 0.5, 1.2); key.position.set(1, 5, 3.5); key.target.position.set(0, 0.6, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
}

// 0.00–3.60  «У первой PlayStation было всего 2 мегабайта оперативной памяти,»
export function buildConsole() {
  const scene = new THREE.Scene(); stage(scene);
  const c = console10(1.2); c.position.set(0, 0.3, 0); scene.add(c);
  const ped = rbox(1.6, 0.3, 1.2, 0.03, M.col('#24242e', 0.4), 0, 0.15, 0, scene); void ped;
  const ram = ramChip('2 МБ'); scene.add(ram);
  const title = text3d('PLAYSTATION', { family: 'russo', size: 0.2, depth: 0.05, bevel: 0.008, color: '#e8e8ee', side: '#6a6a78', emissive: '#a0a8ff', emissiveIntensity: 0.2 }); scene.add(title);
  const t1 = sign('ОЗУ: ВСЕГО 2 МБ', { width: 1.1, color: '#ffffff', bg: '#d4213a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    c.userData.lid.rotation.y = lt * 0.3;
    const up = easeOutBack(inv(1.5, 1.9, lt), 2.0); ram.visible = lt > 1.48; ram.scale.setScalar(Math.max(0.001, up)); ram.position.set(0, lerp(0.6, 1.25, up), 0.15); ram.rotation.set(0.35, Math.sin(lt * 1.5) * 0.25, 0);
    pop(title, lt, 0.45, 0.35, 2.2); pop(t1, lt, 2.3, 0.3);
    const f = kf(lt, [[0, [1.6, 1.6, 2.8], [0, 0.6, 0], 50, 0.04], [3.6, [-0.4, 1.4, 2.2], [0, 0.9, 0.1], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(title, camera, 2.6, 0, 0.95); hud(t1, camera, 2.6, 0, -0.45);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 0.8 };
}

function officeDev(scene) {
  scene.background = new THREE.Color('#0a0a0e');
  room6(scene, { w: 5.6, d: 5.6, h: 2.8, wall: '#3a4250', floor: woodFloor('#6a4a30'), windowAt: { wall: 'left', rect: [-0.6, 1.6, 1.3, 1.1] }, open: ['front'] });
  scene.add(new THREE.HemisphereLight('#e8eeff', '#2a2018', 0.45));
  const lamp = ceilingLamp(scene, 0, -1.4, 2.8); void lamp;
  const key = new THREE.SpotLight('#fff0dc', 16, 9, 0.7, 0.6, 1.2); key.position.set(-2.2, 2.6, 0.2); key.target.position.set(0, 1, -1.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
}
// 3.60–7.30  «и многим разработчикам из-за этого приходилось резать свои идеи.»
export function buildCut() {
  const scene = new THREE.Scene(); officeDev(scene);
  const board = corkBoard(1.8, 1.1); board.position.set(0, 1.6, -2.77); scene.add(board);
  const idea = new THREE.Group(); const halves = [-1, 1].map((s) => { const h = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.6), M.std({ map: canvasTex('idea10' + s, 225, 300, (c, w, h2) => { c.fillStyle = '#fff6c8'; c.fillRect(0, 0, w, h2); c.fillStyle = '#1a1a1a'; c.font = '44px Russo'; c.textAlign = s < 0 ? 'right' : 'left'; c.fillText(s < 0 ? 'ИД' : 'ЕЯ', s < 0 ? w : 0, 70); c.strokeStyle = '#3a6ab8'; c.lineWidth = 6; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(s < 0 ? 20 : 0, 120 + i * 30); c.lineTo(s < 0 ? w : w - 20, 120 + i * 30 + (i % 2) * 10); c.stroke(); } }, { repeat: [1, 1] }), roughness: 0.8, side: THREE.DoubleSide })); h.position.x = s * 0.225; idea.add(h); return h; }); idea.position.set(0, 1.6, -2.7); scene.add(idea);
  const sc = new THREE.Group(); for (const s of [-1, 1]) { const bl = box(0.04, 0.32, 0.01, M.col('#c8ccd4', 0.2, 0.9), 0, 0.12, 0, null); const piv = new THREE.Group(); piv.add(bl); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 8, 20), M.col('#d4213a', 0.4)); ring.position.y = -0.1; piv.add(ring); piv.userData.s = s; sc.add(piv); } scene.add(sc);
  const D = cast10.dev(); D.root.position.set(0.85, 0, -1.4); D.root.rotation.y = -0.6; scene.add(D.root);
  const t1 = sign('РЕЗАТЬ ИДЕИ', { width: 1.0, color: '#ffffff', bg: '#d4213a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const CUT = 2.2;
  function update(lt) {
    const sw = smooth(inv(0.8, CUT, lt)); sc.position.set(0, lerp(2.3, 1.15, sw), -2.6); sc.children.forEach((p) => { p.rotation.z = p.userData.s * (0.35 - 0.3 * Math.abs(Math.sin(lt * 10)) * (lt < CUT + 0.2 ? 1 : 0)); });
    const sp = smooth(inv(CUT, CUT + 0.6, lt)); halves.forEach((h, i) => { const s = i ? 1 : -1; h.position.set(s * (0.225 + sp * 0.2), -sp * 0.35, 0.02); h.rotation.z = s * sp * 0.4; });
    D.pose({ ...STAND, lSh: [-20, 0, 10], rSh: [-60, 0, -10], rEl: [-90, 0, 0], head: [10, -15, 0] }); idle3(D, lt, 2, 0.3); D.face({ blink: 0, brows: 0.8, browTilt: 0.6, mouth: 0.1 });
    pop(t1, lt, 2.25, 0.3);
    const f = kf(lt, [[0, [1.2, 1.7, 1.2], [0, 1.5, -2.6], 50, 0.03], [3.7, [-0.4, 1.6, 0.8], [0.1, 1.5, -2.6], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.92);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 7.30–11.55  «Студия Naughty Dog хотела сделать большие красивые 3D-уровни,»
export function buildStudio() {
  const scene = new THREE.Scene(); officeDev(scene);
  const nm = sign('NAUGHTY DOG', { width: 1.6, color: '#ffffff', bg: '#c8282a', size: 120, pad: 18 }); nm.position.set(0, 2.3, -2.78); scene.add(nm);
  const tb = rbox(2.2, 0.08, 1.2, 0.02, M.col('#3a2418', 0.5), 0, 0.74, -1.3, scene); void tb; for (const x of [-1.0, 1.0]) for (const z of [-1.8, -0.8]) box(0.06, 0.72, 0.06, M.col('#1a1a1e', 0.5), x, 0.36, z, scene);
  const dio = new THREE.Group(); const chunks = []; for (let i = 0; i < 8; i++) { const ch = levelChunk(i + 3, 0.26); ch.position.set(-0.85 + (i % 4) * 0.27 + (i > 3 ? 0.27 * 2.2 : 0), 0.78 + 0.13, -1.3 + (i > 3 ? -0.15 : 0.15) + (i % 4 === 3 ? 0.1 : 0)); dio.add(ch); chunks.push(ch); } scene.add(dio);
  const D1 = cast10.dev('d1'), D2 = cast10.dev2('d2'); D1.root.position.set(-0.8, 0, -0.35); D1.root.rotation.y = Math.PI - 0.3; D2.root.position.set(0.8, 0, -0.35); D2.root.rotation.y = Math.PI + 0.3; scene.add(D1.root, D2.root);
  const t1 = sign('БОЛЬШИЕ 3D-УРОВНИ', { width: 1.3, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    chunks.forEach((c, i) => { const k = easeOutBack(inv(1.0 + i * 0.12, 1.4 + i * 0.12, lt), 2.2); c.scale.setScalar(0.26 * Math.max(0.001, k)); });
    [D1, D2].forEach((H, i) => { H.pose({ ...STAND, [i ? 'lSh' : 'rSh']: [-50, 0, i ? 20 : -20], [i ? 'lEl' : 'rEl']: [-40, 0, 0], head: [16, 0, 0], spine: [8, 0, 0] }); idle3(H, lt, i * 4, 0.3); H.face({ blink: 0, smile: 0.6, brows: 0.4 }); });
    pop(t1, lt, 3.3, 0.3);
    const f = kf(lt, [[0, [0, 2.0, 1.8], [0, 1.5, -2.5], 52, 0.02], [2.0, [1.2, 2.1, 1.0], [0, 0.95, -1.3], 52, 0.03], [4.25, [-1.1, 2.0, 0.9], [0, 0.95, -1.3], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.92);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 11.55–14.75  «но каждый из них весил 8–16 мегабайт»  /  14.75–17.00 «и целиком в память не помещался.»
function bigLevel() { const g = new THREE.Group(); for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) { const c = levelChunk(x * 3 + z + 1, 0.5); c.position.set((x - 1) * 0.5, 0.5, (z - 1) * 0.5); g.add(c); } return g; }
export function buildSize() {
  const scene = new THREE.Scene(); stage(scene);
  const big = bigLevel(); big.position.set(-0.55, 0, -0.3); scene.add(big);
  const ram = ramChip('2 МБ'); ram.scale.setScalar(0.7); ram.position.set(0.95, 0, 0.3); ram.rotation.y = -0.3; scene.add(ram);
  const t1 = sign('8–16 МБ', { width: 0.8, color: '#ffffff', bg: '#2a4ab8', size: 120, pad: 20, border: '#ffffff' }); scene.add(t1);
  const vs = text3d('>', { family: 'mont', size: 0.4, depth: 0.1, bevel: 0.015, color: '#ffd23a', side: '#a8700a' }); vs.position.set(0.45, 0.7, 0.2); scene.add(vs);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    big.children.forEach((c, i) => { const k = easeOutBack(inv(0.05 + i * 0.07, 0.35 + i * 0.07, lt), 2.2); c.scale.setScalar(0.5 * Math.max(0.001, k)); });
    pop(t1, lt, 1.45, 0.3); t1.position.set(-0.55, 1.5, -0.1); pop(vs, lt, 2.0, 0.3, 2.6);
    const f = kf(lt, [[0, [0.6, 2.2, 4.8], [0.25, 0.6, -0.1], 52, 0.03], [3.2, [-0.2, 2.0, 4.4], [0.25, 0.7, 0], 52, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    t1.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.25, ao: 0.8 };
}
export function buildNoFit() {
  const scene = new THREE.Scene(); stage(scene);
  // small open memory box; the big level tries to drop in and bounces off the rim
  const bx = new THREE.Group(); const wm = M.std({ color: '#2a6a3a', roughness: 0.5 }); box(0.9, 0.06, 0.9, wm, 0, 0.03, 0, bx); for (const [x, z, w, d] of [[0, 0.42, 0.9, 0.06], [0, -0.42, 0.9, 0.06], [0.42, 0, 0.06, 0.9], [-0.42, 0, 0.06, 0.9]]) box(w, 0.4, d, wm, x, 0.23, z, bx); const lbl = sign('ПАМЯТЬ 2 МБ', { width: 0.7, color: '#ffffff', bg: '#1a3a22', size: 90, pad: 12 }); lbl.position.set(0, 0.25, 0.455); bx.add(lbl); scene.add(shadows(bx));
  const big = bigLevel(); scene.add(big);
  const X = new THREE.Group(); for (const s of [-1, 1]) { const b = box(1.4, 0.14, 0.04, M.emis('#ff2a3a', 1.8)); b.rotation.z = 0.7 * s; X.add(b); } scene.add(X);
  const t1 = sign('НЕ ПОМЕЩАЕТСЯ', { width: 1.1, color: '#ffffff', bg: '#d4213a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const HIT = 0.8;
  function update(lt) {
    const fall = clamp(lt / HIT); const bounce = lt > HIT ? Math.abs(Math.sin((lt - HIT) * 7)) * Math.exp(-(lt - HIT) * 2.5) * 0.4 : 0;
    big.position.set(0, lt < HIT ? lerp(2.4, 0.46, fall * fall) : 0.46 + bounce, 0); big.rotation.z = lt > HIT ? Math.sin((lt - HIT) * 9) * 0.06 * Math.exp(-(lt - HIT) * 2) : 0;
    big.children.forEach((c) => c.scale.setScalar(0.5));
    const kx = easeOutBack(inv(HIT + 0.35, HIT + 0.65, lt), 2.6); X.visible = lt > HIT + 0.33; X.scale.setScalar(Math.max(0.001, kx)); X.position.set(0, 1.2, 0.8);
    pop(t1, lt, 1.2, 0.3);
    const f = kf(lt, [[0, [0.6, 2.0, 3.6], [0, 0.8, 0], 50, 0.03], [2.25, [-0.5, 1.7, 3.2], [0, 0.8, 0], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, lt > HIT && lt < HIT + 0.3 ? 0.02 : 0.003, 16, 2)), f.look, f.roll, f.fov);
    X.lookAt(camera.position); hud(t1, camera, 2.6, 0, 0.92);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 0.8 };
}

function streamCode(g, w, h, t) {
  g.fillStyle = '#0a1a10'; g.fillRect(0, 0, w, h); g.font = `${h * 0.065}px monospace`; g.textAlign = 'left';
  const L = ['stream_level() {', '  while (playing) {', '    load(next_chunk);  // 64 KB', '    free(behind_chunk);', '  }', '}'];
  const n = Math.floor(t * 9); let used = 0; L.forEach((l, i) => { const s = l.slice(0, Math.max(0, n - used)); used += l.length; g.fillStyle = i === 2 || i === 3 ? '#8affb0' : '#3aff6a'; g.fillText(s, w * 0.04, h * (0.16 + i * 0.13)); });
}
// 17.00–21.00  «Тогда программист Энди Гэвин написал собственную систему подгрузки.»
export function buildCoder() {
  const scene = new THREE.Scene(); officeDev(scene);
  const dk = desk6(1.6, 0.8, 0.75, '#b89a70', '#3a3a40'); dk.position.set(0, 0, -2.2); scene.add(solid(dk, 'desk', [], [dk.userData.top]));
  const c = crt(streamCode, 1.35); c.position.set(0, 0.75 + 0.3, -2.3); scene.add(c);
  const kb = rbox(0.42, 0.025, 0.14, 0.008, M.col('#d8d0bc', 0.6), 0, 0.763, -1.95, scene); void kb;
  const ch = chair6('#2a2a34'); ch.position.set(0, 0, -1.4); scene.add(solid(ch, 'chair', ['coder']));
  const H = cast10.coder(); H.root.position.set(0, 0, -1.43); H.root.rotation.y = Math.PI; scene.add(H.root); H.root.userData.allow = ['chair'];
  point(scene, '#3aff6a', 3, 3, [0, 1.2, -1.9]);
  const t1 = sign('ПРОГРАММИСТ', { width: 0.95, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('СИСТЕМА ПОДГРУЗКИ', { width: 1.3, color: '#1a1a1a', bg: '#3aff6a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    c.userData.live.update(lt);
    typing(H, lt, 3); H.face({ blink: 0, brows: 0.3, smile: 0.3 });
    popOut(t1, lt, 0.3, 2.5); pop(t2, lt, 2.8, 0.3);
    const f = kf(lt, [[0, [1.8, 1.7, 0.8], [0, 1.2, -1.9], 52, 0.03], [2.4, [1.2, 1.5, -0.7], [-0.1, 1.15, -2.1], 48, 0], [4.0, [0.45, 1.4, -1.2], [0, 1.08, -2.3], 42, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.82); hud(t2, camera, 2.4, 0, 0.82);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}
