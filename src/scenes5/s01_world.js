import * as THREE from 'three';
import { vx, terrain, voxTree, block, blockMats } from '../lib/voxel.js';
import { idle2 } from '../lib/human2.js';
import { earthTex, ll2v } from '../scenes/s08_flight.js';
import { tripodCam, lightStand } from '../lib/fantasy.js';
import { moneyRain } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
import { box } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { M, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, glowTex, canvasTex } from '../lib/util.js';

const STAND = { lSh: [0, 0, 7], rSh: [0, 0, -7] };
const pop = (o, lt, t0, d = 0.35, s = 2.4, base = 1) => { const k = easeOutBack(inv(t0, t0 + d, lt), s); o.scale.setScalar(Math.max(0.001, k * base)); o.visible = lt > t0 - 0.02; return k; };
const fwd = (cam) => { const f = new THREE.Vector3(); cam.getWorldDirection(f); return f; };
const hud = (o, cam, dist, x, y) => { const f = fwd(cam), r = new THREE.Vector3().crossVectors(f, cam.up).normalize(); o.position.copy(cam.position).addScaledVector(f, dist).addScaledVector(r, x).add(V(0, y, 0)); o.quaternion.copy(cam.quaternion); };

// sunny blocky world with a flat clearing in the middle (ground top at y = 1)
function world(scene, { seed = 1, trees = true, n = 36, flat = 9.5 } = {}) {
  scene.background = new THREE.Color('#8ec4f4'); scene.fog = new THREE.Fog('#a8d2f6', 18, 45);
  scene.add(new THREE.HemisphereLight('#dceeff', '#5a6a3a', 1.0));
  const sun = new THREE.DirectionalLight('#fff2d8', 2.8); sun.position.set(8, 14, 9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, far: 50 }); sun.shadow.bias = -0.0006; scene.add(sun);
  const T = terrain(n, { seed, s: 1, amp: 3.2, base: 1, flat }); scene.add(T);
  const tr = [];
  if (trees) for (const [x, z, h] of [[-6.5, -7.5, 5], [7.5, -5.5, 4], [-11.5, 1.5, 4], [11.5, 3.5, 5], [-2.5, -11.5, 4], [4.5, -12.5, 5]]) { const t = voxTree(1, h, x * 3 + z); t.position.set(x, T.userData.heightAt(x, z), z); scene.add(t); tr.push(t); }
  return { T, trees: tr };
}

// 0.00–3.00  «Парень, который сделал Minecraft, продал свою компанию»
export function buildIntro() {
  const scene = new THREE.Scene(); const W = world(scene);
  const dev = vx.dev(); dev.root.position.set(0, 1, 0.5); scene.add(dev.root);
  const title = text3d('MINECRAFT', { family: 'russo', size: 0.5, depth: 0.22, bevel: 0.02, color: '#7ac04a', side: '#6a4a2a', emissive: '#2a5a10', emissiveIntensity: 0.2 }); title.position.set(0, 4.1, -2.2); scene.add(title);
  const sold = sign('ПРОДАЛ КОМПАНИЮ', { width: 2.0, color: '#ffffff', bg: '#d4213a', size: 100, pad: 24, border: '#ffffff' }); scene.add(sold);
  const floaters = [['grass', -1.6, 2.6], ['log', 1.7, 2.3], ['stone', 1.2, 3.3], ['gold', -1.1, 3.4]].map(([t, x, y], i) => { const b = block(t, 0.45); b.userData.p = [x, y, i]; scene.add(b); return b; });
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 200);
  function update(lt) {
    W.T.userData.grow(lt + 0.15, 0, 0, 11);
    W.trees.forEach((t, i) => { const k = easeOutBack(inv(0.7 + i * 0.08, 1.1 + i * 0.08, lt), 2); t.scale.setScalar(Math.max(0.001, k)); });
    const cheer = smooth(inv(1.5, 1.9, lt));
    dev.pose({ lSh: [lerp(0, -20, cheer), 0, lerp(7, 70, cheer)], rSh: [lerp(0, -20, cheer), 0, lerp(-7, -70, cheer)], lEl: [-10, 0, 0], rEl: [-10, 0, 0], lCurl: 0.1, rCurl: 0.1 }); idle2(dev, lt, 2, 0.6);
    dev.face({ blink: 0, smile: 0.7 + 0.3 * cheer, brows: 0.3 + 0.4 * cheer, mouth: 0.35 * cheer });
    floaters.forEach((b) => { const [x, y, i] = b.userData.p; pop(b, lt, 0.9 + i * 0.12, 0.4, 2.2, 0.45); b.position.set(x, y + Math.sin(lt * 2 + i) * 0.1, 0.4); b.rotation.set(lt * 0.6 + i, lt * 0.9 + i, 0); });
    pop(title, lt, 1.1, 0.45, 2.0); title.rotation.y = Math.sin(lt * 1.3) * 0.12;
    pop(sold, lt, 1.6, 0.35);
    const f = kf(lt, [[0, [7.5, 7.5, 11], [0, 1.8, 0], 56, 0.08], [1.4, [2.2, 3.0, 7.0], [0, 2.6, 0], 56, 0.02], [3.0, [-1.2, 2.3, 5.6], [0, 2.4, 0], 54, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 4, 2)), f.look, f.roll, f.fov);
    hud(sold, camera, 4.2, 0, -0.4);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.2, bloomThreshold: 0.95, envIntensity: 0.3 };
}

function goldPyramid(s = 0.6, n = 5) {
  const g = new THREE.Group(); let c = 0;
  for (let l = 0; l < n; l += 2) { const m = n - l; for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) { const b = block('gold', s); b.position.set((i - (m - 1) / 2) * s, (l / 2 + 0.5) * s, (j - (m - 1) / 2) * s); b.userData.o = c++; g.add(b); } }
  return g;
}

// 3.00–5.20  «за 2,5 миллиарда долларов,»
export function buildPrice() {
  const scene = new THREE.Scene(); const W = world(scene, { seed: 2 });
  const dev = vx.dev(); dev.root.position.set(0.9, 1, 1.2); dev.root.rotation.y = -0.35; scene.add(dev.root);
  const pyr = goldPyramid(0.6, 5); pyr.position.set(-0.9, 1, -1.3); scene.add(solid(pyr, 'gold'));
  const price = text3d('$2,5 МЛРД', { family: 'mont', size: 0.4, depth: 0.16, bevel: 0.02, color: '#ffd23a', side: '#a8700a', emissive: '#ffb020', emissiveIntensity: 0.3, metal: 0.6, rough: 0.25 }); scene.add(price);
  const rain = moneyRain({ n: 70, seed: 3, area: [5, 3], top: 6, floor: 1, center: [0, 0, 0], coins: 0.3 }); scene.add(rain);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 200);
  function update(lt) {
    W.T.userData.grow();
    pyr.children.forEach((b) => { const k = easeOutBack(inv(b.userData.o * 0.012, b.userData.o * 0.012 + 0.3, lt), 2); b.scale.setScalar(Math.max(0.001, 0.6 * k)); });
    const wow = smooth(inv(0.1, 0.4, lt));
    dev.pose({ ...STAND, lSh: [-20 * wow, 0, 7 + 30 * wow], rSh: [-20 * wow, 0, -7 - 30 * wow], lEl: [-60 * wow, 0, 0], rEl: [-60 * wow, 0, 0], head: [-10 * wow, 15 * wow, 0], lCurl: 0.1, rCurl: 0.1 }); idle2(dev, lt, 3, 0.5);
    dev.face({ blink: 0, brows: 1, mouth: 0.6 * wow, look: [0.25, 0.1] });
    rain.userData.update(lt); rain.visible = lt > 0.3;
    pop(price, lt, 0.08, 0.45, 2.0); price.position.set(0, 4.1, -1.0); price.rotation.y = Math.sin(lt * 1.5) * 0.15;
    const f = kf(lt, [[0, [2.6, 1.6, 6.2], [0, 2.4, -0.5], 58, -0.05], [2.2, [-1.4, 2.0, 5.6], [0, 2.6, -0.5], 56, 0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 5, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.3 };
}

// 5.20–7.42  «потому что устал быть знаменитым.»
export function buildFame() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#07070c');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 64), M.std({ color: '#16161e', roughness: 0.45, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const carpet = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), M.std({ color: '#8a1a24', roughness: 0.9 })); carpet.rotation.x = -Math.PI / 2; carpet.position.y = 0.005; carpet.receiveShadow = true; scene.add(carpet);
  scene.add(new THREE.HemisphereLight('#9aa8ff', '#100810', 0.3));
  const dev = vx.dev(); scene.add(dev.root);
  const rigs = []; const r = rng(4);
  [[-2.4, 1.6, 'cam'], [-2.0, -1.6, 'light'], [2.4, 1.6, 'cam'], [2.0, -1.6, 'light'], [0.0, -2.8, 'cam'], [-2.8, 0.0, 'light'], [2.8, 0.0, 'cam']].forEach(([x, z, k], i) => {
    const o = k === 'cam' ? tripodCam() : lightStand(); o.position.set(x, 0, z); o.lookAt(0, 0, 0); scene.add(solid(o, 'rig' + i));
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,255,255,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); fl.scale.setScalar(0.9); fl.position.set(x * 0.9, k === 'cam' ? 1.4 : 1.85, z * 0.9); scene.add(fl);
    rigs.push({ fl, ph: r() * 0.8, per: 0.5 + r() * 0.4, off: z < 0 });
  });
  const flashL = new THREE.PointLight('#ffffff', 0, 8, 1.5); flashL.position.set(0, 1.6, 3.0); scene.add(flashL);
  const spot = new THREE.SpotLight('#ffe8d0', 30, 10, 0.45, 0.5, 1.2); spot.position.set(0, 6, 1); spot.target.position.set(0, 0.8, 0); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); scene.add(spot, spot.target);
  const tired = sign('УСТАЛ ОТ СЛАВЫ', { width: 1.6, color: '#ffffff', bg: '#3a2a6a', size: 100, pad: 24, border: '#c8b0ff' }); scene.add(tired);
  const stars = []; for (let i = 0; i < 5; i++) { const s = sign('★', { width: 0.32, color: '#ffd23a', size: 200, pad: 6, emissive: 0.7 }); scene.add(s); stars.push(s); }
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 100);
  function update(lt) {
    const hide = smooth(inv(0.3, 0.7, lt));
    dev.pose({ ...STAND, rSh: [lerp(0, -95, hide), 0, lerp(-7, 20, hide)], rEl: [lerp(-8, -125, hide), 0, 0], rCurl: 0.2, lSh: [0, 0, 10], spine: [8 * hide, 0, 0], head: [12 * hide, -10 * hide, 0] }); idle2(dev, lt, 5, 0.4);
    dev.face({ blink: hide > 0.5 ? 1 : 0, brows: -0.6, mouth: 0.1 });
    let fsum = 0;
    rigs.forEach((g) => { const k = ((lt + g.ph) % g.per) / g.per; const on = g.off ? 0 : (k < 0.12 ? 1 - k / 0.12 : 0); g.fl.material.opacity = on; g.fl.visible = on > 0.01; fsum += on; });
    flashL.intensity = Math.min(1.5, fsum) * 9;
    pop(tired, lt, 0.62, 0.35); tired.position.set(0, 2.55, 0.2);
    stars.forEach((s, i) => { const a = lt * 0.8 + i * 1.2566; s.position.set(Math.cos(a) * 0.75, 2.05 + Math.sin(lt * 3 + i) * 0.05, Math.sin(a) * 0.75); s.lookAt(camera.position); s.material.opacity = 0.9; });
    const f = kf(lt, [[0, [1.6, 1.5, 4.6], [0, 1.4, 0], 52, 0.04], [2.22, [-1.3, 1.9, 4.0], [0, 1.6, 0], 50, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.005, 6, 1)), f.look, f.roll, f.fov);
    tired.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.85, envIntensity: 0.2 };
}

// 12.62–15.15  «Игра быстро выросла в мировой хит,»
export function buildHit() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#04060e');
  const r = rng(9); const sp = []; for (let i = 0; i < 1200; i++) { const v = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(80); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#ffffff', size: 1.4, sizeAttenuation: false })));
  scene.add(new THREE.HemisphereLight('#bcd4ff', '#101018', 0.7));
  const sun = new THREE.DirectionalLight('#fff4e0', 2.4); sun.position.set(-4, 3, 5); scene.add(sun);
  const R = 2; const earth = new THREE.Group(); scene.add(earth);
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), M.std({ map: earthTex(), roughness: 0.85 })));
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.03, 48, 32), new THREE.MeshBasicMaterial({ color: '#6ab0ff', transparent: true, opacity: 0.22, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));
  const home = ll2v(59, 18, 1);
  const cubes = []; const rr = rng(5); const types = ['grass', 'grass', 'grass', 'stone', 'log', 'gold'];
  for (let i = 0; i < 260; i++) {
    const v = V(rr() * 2 - 1, rr() * 2 - 1, rr() * 2 - 1); if (v.length() > 1 || v.length() < 0.1) { i--; continue; } v.normalize();
    const b = block(types[Math.floor(rr() * types.length)], 0.11); b.position.copy(v).multiplyScalar(R + 0.04); b.quaternion.setFromUnitVectors(V(0, 1, 0), v); b.userData.t0 = 0.1 + Math.acos(clamp(v.dot(home), -1, 1)) / Math.PI * 1.6 + rr() * 0.15; earth.add(b); cubes.push(b);
  }
  const hit = sign('МИРОВОЙ ХИТ', { width: 1.9, color: '#1a1a1a', bg: '#7ac04a', size: 110, pad: 24, border: '#ffffff', emissive: 0.15 }); scene.add(hit);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 300);
  function update(lt) {
    earth.rotation.set(0.25, 1.75 - lt * 0.35, 0);
    cubes.forEach((b) => { const k = easeOutBack(inv(b.userData.t0, b.userData.t0 + 0.3, lt), 2.6); b.scale.setScalar(Math.max(0.0001, 0.11 * k)); b.visible = k > 0.001; });
    const f = kf(lt, [[0, [0.8, 1.6, 10.5], [0, 0.2, 0], 50, 0.06], [2.55, [-0.5, 0.6, 8.2], [0, 0.1, 0], 50, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 3)), f.look, f.roll, f.fov);
    pop(hit, lt, 1.66, 0.35); hud(hit, camera, 5, 0, 1.6); hit.scale.multiplyScalar(1);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.85, envIntensity: 0.15 };
}

function starShape(r = 0.3) { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (i) s.lineTo(x, y); else s.moveTo(x, y); } s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }); g.center(); const m = new THREE.Mesh(g, M.col('#ffd23a', 0.25, 0.8, { emissive: '#a86a00', emissiveIntensity: 0.4 })); m.castShadow = true; return m; }

// 15.15–18.05  «а его студия Mojang стала одной из самых известных в индустрии.»
export function buildStudio() {
  const scene = new THREE.Scene(); const W = world(scene, { seed: 4, trees: true });
  const bld = new THREE.Group(); const wall = M.std({ color: '#ece6da', roughness: 0.8 }); const glass = M.std({ color: '#2a4a6a', roughness: 0.1, metalness: 0.6, emissive: '#3a6a9a', emissiveIntensity: 0.25 });
  box(7, 4.2, 3.4, wall, 0, 2.1, 0, bld);
  for (let fl = 0; fl < 2; fl++) for (let i = 0; i < 5; i++) box(1.0, 1.2, 0.05, glass, -2.6 + i * 1.3, 1.3 + fl * 1.8, 1.71, bld);
  box(1.4, 2.0, 0.06, M.col('#3a2a1a', 0.6), 0, 1.0, 1.72, bld).visible = false;
  box(7.3, 0.2, 3.7, M.col('#c8c0b0', 0.7), 0, 4.3, 0, bld);
  bld.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  bld.position.set(0, 1, -2.6); scene.add(solid(bld, 'studio'));
  const name = text3d('MOJANG', { family: 'russo', size: 0.62, depth: 0.2, bevel: 0.02, color: '#e8423a', side: '#8a1a14', emissive: '#a8201a', emissiveIntensity: 0.25 }); name.position.set(0, 6.05, -2.0); scene.add(name);
  const famous = sign('ИЗВЕСТНАЯ СТУДИЯ', { width: 2.0, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 22, border: '#1a1a1a' }); scene.add(famous);
  const stars = [0, 1, 2, 3, 4].map(() => { const s = starShape(0.32); scene.add(s); return s; });
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 200);
  function update(lt) {
    W.T.userData.grow();
    pop(name, lt, 0.12, 0.45, 2.2);
    stars.forEach((s, i) => { const k = pop(s, lt, 0.9 + i * 0.12, 0.35, 2.6); s.position.set(-1.6 + i * 0.8, 7.0 + Math.sin(lt * 3 + i) * 0.06 + (i === 2 ? 0.2 : i % 2 ? 0.1 : 0), -2.0); s.rotation.y = (1 - k) * 4 + Math.sin(lt * 2 + i) * 0.3; });
    pop(famous, lt, 1.5, 0.35);
    const f = kf(lt, [[0, [3.2, 1.8, 9.0], [0, 3.0, -2], 56, 0.04], [2.9, [-1.6, 4.0, 10.5], [0, 5.2, -2], 56, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 4, 4)), f.look, f.roll, f.fov);
    hud(famous, camera, 5, 0, -0.55);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.2, bloomThreshold: 0.95, envIntensity: 0.3 };
}

// 25.75–29.42  «подходящим человеком для руководства таким огромным проектом.»
export function buildHuge() {
  const scene = new THREE.Scene(); const W = world(scene, { seed: 6, trees: false, n: 50, flat: 21 });
  const dev = vx.dev(); dev.root.position.set(0, 1, 2.6); dev.root.rotation.y = Math.PI; scene.add(dev.root);
  // hollow tower 9×9, rising layer by layer behind the dev
  const N = 9, H = 34; const ring = []; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i === 0 || j === 0 || i === N - 1 || j === N - 1) ring.push([i - (N - 1) / 2, j - (N - 1) / 2]);
  const tower = new THREE.Group(); tower.position.set(0, 1, -4.5); scene.add(tower);
  const mats = ['stone', 'plank', 'stone', 'gem'];
  const layers = mats.map((m) => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), blockMats(m), ring.length * H)); layers.forEach((l) => { l.castShadow = true; l.receiveShadow = true; tower.add(l); });
  const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const hide = new THREE.Matrix4().makeScale(0, 0, 0);
  const huge = sign('ОГРОМНЫЙ ПРОЕКТ', { width: 2.0, color: '#ffffff', bg: '#d4213a', size: 100, pad: 24, border: '#ffffff' }); scene.add(huge);
  const lead = sign('РУКОВОДСТВО?', { width: 1.6, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 22, border: '#1a1a1a' }); scene.add(lead);
  const camera = new THREE.PerspectiveCamera(58, 1080 / 1920, 0.05, 200);
  function update(lt) {
    W.T.userData.grow();
    const lv = lt * 11; const cnt = [0, 0, 0, 0];
    for (let y = 0; y < H; y++) { const k = clamp(lv - y); const mi = Math.floor(y / 3) % 4;
      ring.forEach(([x, z]) => { const L = layers[mi]; const idx = cnt[mi]++; if (k <= 0) { L.setMatrixAt(idx, hide); return; } const s = 0.98 * Math.min(1, easeOutBack(k, 2)); sc.set(s, s, s); p.set(x, y + 0.5 + (1 - k) * 0.6, z); L.setMatrixAt(idx, mtx.compose(p, q, sc)); }); }
    layers.forEach((L, i) => { for (let j = cnt[i]; j < L.count; j++) L.setMatrixAt(j, hide); L.instanceMatrix.needsUpdate = true; });
    const up = smooth(inv(0.3, 2.0, lt));
    dev.pose({ ...STAND, head: [-30 * up, 0, 0], neck: [-12 * up, 0, 0], lSh: [-10, 0, 14], rSh: [-10, 0, -14] }); idle2(dev, lt, 2, 0.4);
    dev.face({ blink: 0, brows: 0.8, mouth: 0.3, look: [0, 0.3 * up] });
    const f = kf(lt, [[0, [1.4, 1.4, 6.2], [0, 1.8, 1.5], 58, 0.03], [2.0, [3.0, 1.5, 12.5], [0, 8.5, -4.5], 60, 0.0], [3.67, [-2.5, 2.0, 17.0], [0, 13, -4.5], 62, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 4, 1)), f.look, f.roll, f.fov);
    pop(lead, lt, 1.6, 0.35); hud(lead, camera, 5, 0, 2.1);
    pop(huge, lt, 2.44, 0.35); hud(huge, camera, 5, 0, 1.25);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.2, bloomThreshold: 0.95, envIntensity: 0.3 };
}

// 32.30–34.80  «за 2,5 миллиарда долларов,»
export function buildBillions() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0c0a06');
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.std({ color: '#1e1a14', roughness: 0.5, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#ffe0a0', '#100c06', 0.45));
  const piles = [[-2.0, -0.5, 5], [2.0, -0.7, 5], [0, -3.9, 7]].map(([x, z, n], i) => { const p = goldPyramid(0.5, n); p.position.set(x, 0, z); scene.add(solid(p, 'gold' + i)); return p; });
  const rain = moneyRain({ n: 110, seed: 7, area: [6, 4], top: 7, floor: 0, center: [0, 0, -1], coins: 0.35 }); scene.add(rain);
  point(scene, '#ffc860', 22, 10, [0, 4, 1.5]); point(scene, '#ff9a3a', 12, 8, [-3, 2, -1]);
  const key = new THREE.SpotLight('#fff0d0', 40, 18, 0.7, 0.6, 1.2); key.position.set(2, 8, 5); key.target.position.set(0, 0.5, -1.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  const cv = document.createElement('canvas'); cv.width = 900; cv.height = 300; const ctx = cv.getContext('2d'); const ctex = new THREE.CanvasTexture(cv); ctex.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.8), new THREE.MeshBasicMaterial({ map: ctex, transparent: true })); scene.add(panel);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 200); let last = -1;
  function update(lt) {
    piles.forEach((p, pi) => p.children.forEach((b) => { const t0 = pi * 0.15 + b.userData.o * 0.006; const k = easeOutBack(inv(t0, t0 + 0.3, lt), 2); b.scale.setScalar(Math.max(0.001, 0.5 * k)); }));
    rain.userData.update(lt + 1);
    const v = Math.round(Math.pow(smooth(inv(0.05, 1.6, lt)), 0.7) * 2500) * 1e6;
    if (v !== last) { last = v; ctx.clearRect(0, 0, 900, 300); ctx.fillStyle = 'rgba(20,14,4,0.85)'; ctx.beginPath(); ctx.roundRect(4, 4, 892, 292, 34); ctx.fill(); ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 8; ctx.stroke(); ctx.fillStyle = '#ffe08a'; ctx.font = '96px Russo'; ctx.textAlign = 'center'; ctx.fillText(v.toLocaleString('ru-RU').replace(/ /g, ' ') + ' $', 450, 190); ctex.needsUpdate = true; }
    const f = kf(lt, [[0, [0.4, 5.5, 7.5], [0, 1.0, -1.5], 56, 0.05], [2.5, [-0.8, 2.2, 5.6], [0, 1.4, -1.5], 54, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 5, 2)), f.look, f.roll, f.fov);
    pop(panel, lt, 0.05, 0.35); hud(panel, camera, 4.2, 0, 1.25);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.85, envIntensity: 0.25 };
}
