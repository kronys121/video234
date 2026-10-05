import * as THREE from 'three';
import { cast10, console10, ramChip, levelChunk, runner, disc } from '../lib/sets10.js';
import { gameBox8 } from '../lib/sets8.js';
import { room6, desk6, woodFloor, ceilingLamp } from '../lib/sets6.js';
import { idle3 } from '../lib/human3.js';
import { gauge } from '../lib/fantasy.js';
import { motherboard } from '../lib/props.js';
import { sign, point, smoke } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, popOut, hud, shadows } from '../lib/shot.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';
import { text3d, STAND, stage } from './s01_ram.js';

// endless track: chunks appear ahead of the runner and vanish behind it
function track(scene, { labels = false } = {}) {
  scene.background = new THREE.Color('#7ab8e8'); scene.fog = new THREE.Fog('#a8d0f0', 8, 22);
  scene.add(new THREE.HemisphereLight('#e8f4ff', '#3a5a2a', 0.9));
  const sun = new THREE.DirectionalLight('#fff0d8', 2.4); sun.position.set(-4, 8, 4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); sun.shadow.bias = -0.0006; scene.add(sun); scene.add(sun.target);
  const N = 14; const chunks = []; for (let i = 0; i < N; i++) { const c = levelChunk(i * 7 + 2, 1, labels ? '64 КБ' : ''); scene.add(c); chunks.push(c); }
  const R = runner(); scene.add(R);
  return { chunks, R, sun };
}
// runner moves along -z at speed v; chunk i sits at z = -i; visible window from (pos-ahead) back to (pos+behind)
function trackTick(T, lt, { v = 2.2, ahead = 5, behind = 1.5, start = 0 } = {}) {
  const pos = -(start + lt * v);
  T.R.position.set(0, 0, pos); T.R.rotation.y = Math.PI; T.R.userData.run(lt, 1);
  T.chunks.forEach((c, i) => { const z = -i; const dAhead = pos - z; // >0 when chunk is ahead of the runner
    const kIn = smooth(clamp((ahead - dAhead) / 0.8)); const kOut = smooth(clamp((-dAhead - behind) / 0.8));
    const k = kIn * (1 - kOut); c.visible = k > 0.01; c.position.set(0, (1 - kIn) * 2.2 - kOut * 1.6, z); c.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * k)); });
  T.sun.position.set(-4, 8, pos + 4); T.sun.target.position.set(0, 0, pos);
  return pos;
}
// 21.00–24.40  «Пока Крэш бежал вперёд, консоль читала с диска следующие куски»
export function buildRun() {
  const scene = new THREE.Scene(); const T = track(scene);
  const t1 = sign('ЧИТАЕТ С ДИСКА', { width: 1.1, color: '#ffffff', bg: '#2a4ab8', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const pos = trackTick(T, lt, { v: 2.0 });
    pop(t1, lt, 2.0, 0.3);
    setCam(camera, V(1.6, 1.8, pos + 2.6).add(shake(lt, 0.004, 5, 2)), V(0, 0.5, pos - 1.8), 0.04, 54);
    hud(t1, camera, 2.6, 0, 0.92);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.3, ao: 0.6 };
}
// 24.40–27.35  «уровня размером по 64 килобайта»
export function buildChunks() {
  const scene = new THREE.Scene(); const T = track(scene, { labels: true });
  const t1 = sign('ПО 64 КБ', { width: 0.9, color: '#1a1a1a', bg: '#ffd23a', size: 120, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const pos = trackTick(T, lt, { v: 1.6, start: 6 });
    pop(t1, lt, 1.1, 0.3);
    setCam(camera, V(-1.9, 1.0, pos - 3.2).add(shake(lt, 0.003, 5, 2)), V(0, 0.1, pos - 1.2), -0.03, 50);
    hud(t1, camera, 2.6, 0, 0.92);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.3, ao: 0.6 };
}
// 27.35–30.45  «и тут же освобождала память от тех, что остались позади.»
export function buildFree() {
  const scene = new THREE.Scene(); const T = track(scene);
  const t1 = sign('ПАМЯТЬ ОСВОБОЖДАЕТСЯ', { width: 1.4, color: '#ffffff', bg: '#d4213a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const pos = trackTick(T, lt, { v: 2.0, start: 2, behind: 0.6 });
    pop(t1, lt, 0.45, 0.3);
    setCam(camera, V(0.9, 2.6, pos - 3.0).add(shake(lt, 0.003, 5, 2)), V(0, 0.2, pos + 1.4), 0.02, 54);
    hud(t1, camera, 2.6, 0, 0.92);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.3, ao: 0.6 };
}

// 30.45–33.65  «Гэвин даже сам продумал, как разложить данные на диске,»
export function buildDiscMap() {
  const scene = new THREE.Scene(); stage(scene, '#06060c');
  const d = disc(1.0); d.position.set(0, 0.6, 0); scene.add(d);
  const segs = []; for (let i = 0; i < 16; i++) { const a0 = i / 16 * Math.PI * 2; const ring = new THREE.Mesh(new THREE.RingGeometry(0.42 + (i % 4) * 0.13, 0.52 + (i % 4) * 0.13, 16, 1, a0, Math.PI / 8 - 0.04), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(i / 16, 0.8, 0.55), transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.62; scene.add(ring); segs.push(ring); }
  const laser = new THREE.Group(); box(0.12, 0.06, 0.6, M.col('#2a2a30', 0.4, 0.6), 0, 0, 0, laser); const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8), M.emis('#ff3a3a', 3)); beam.position.y = 0.2; laser.add(beam); scene.add(laser);
  const t1 = sign('РАСКЛАДКА ДАННЫХ НА ДИСКЕ', { width: 1.6, color: '#ffffff', bg: '#3a3a8a', size: 90, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    d.rotation.y = lt * 1.2; segs.forEach((s, i) => { s.rotation.z = lt * 1.2; const k = smooth(inv(0.2 + i * 0.1, 0.4 + i * 0.1, lt)); s.material.opacity = k; s.visible = k > 0.01; });
    const r = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(lt * 1.8)); laser.position.set(r, 0.45, 0); laser.rotation.y = Math.PI / 2;
    pop(t1, lt, 1.6, 0.3);
    const f = kf(lt, [[0, [0.4, 2.6, 2.0], [0, 0.6, 0], 50, 0.03], [3.2, [-0.6, 2.2, 2.2], [0, 0.6, 0], 50, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.92);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.3, ao: 0.6 };
}

// 33.65–36.05  «чтобы всё успевало подгружаться вовремя.»
export function buildOnTime() {
  const scene = new THREE.Scene(); const T = track(scene);
  const bar = new THREE.Group(); const bg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.12), new THREE.MeshBasicMaterial({ color: '#1a1a22', transparent: true, opacity: 0.8, depthTest: false })); bar.add(bg); const fill = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.08), new THREE.MeshBasicMaterial({ color: '#3aff6a', depthTest: false })); fill.position.z = 0.001; bar.add(fill); bar.renderOrder = 20; fill.renderOrder = 21; scene.add(bar);
  const t1 = sign('ВОВРЕМЯ ✓', { width: 0.9, color: '#1a1a1a', bg: '#3aff6a', size: 110, pad: 18, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const pos = trackTick(T, lt, { v: 2.4, start: 4 });
    setCam(camera, V(-1.4, 1.6, pos + 2.4).add(shake(lt, 0.004, 5, 2)), V(0, 0.5, pos - 2.0), -0.03, 54);
    const f = new THREE.Vector3(); camera.getWorldDirection(f); bar.position.copy(camera.position).addScaledVector(f, 2.4).add(V(0, 0.6, 0)); bar.quaternion.copy(camera.quaternion);
    const k = 0.15 + 0.85 * ((lt * 0.9) % 1); fill.scale.x = k; fill.position.x = -0.48 * (1 - k);
    pop(t1, lt, 1.6, 0.3); hud(t1, camera, 2.4, 0, 0.88);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.3, ao: 0.6 };
}

// 36.05–39.30  «Для этого команда почти не пользовалась библиотеками Sony»
export function buildLibs() {
  const scene = new THREE.Scene(); stage(scene);
  const shelf = new THREE.Group(); box(2.0, 1.6, 0.4, M.col('#3a2418', 0.6), 0, 0.8, -0.2, shelf); const r = rng(4); const books = []; for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const h = 0.32 + r() * 0.08; const b = box(0.17, h, 0.28, M.col(['#2a4a8a', '#3a5a9a', '#1a3a6a'][i % 3], 0.6), -0.8 + i * 0.2, 0.12 + row * 0.5 + h / 2, -0.05, shelf); books.push(b); } shelf.position.set(0, 0, -1.0); scene.add(shadows(shelf));
  const lbl = sign('SONY LIBS', { width: 0.9, color: '#ffffff', bg: '#1a2a4a', size: 100, pad: 14 }); lbl.position.set(0, 1.75, -0.95); scene.add(lbl);
  const X = new THREE.Group(); for (const s of [-1, 1]) { const b = box(2.0, 0.14, 0.04, M.emis('#ff2a3a', 1.6)); b.rotation.z = 0.65 * s; X.add(b); } X.position.set(0, 0.9, -0.7); scene.add(X);
  const t1 = sign('ПОЧТИ БЕЗ БИБЛИОТЕК', { width: 1.4, color: '#ffffff', bg: '#d4213a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const kx = easeOutBack(inv(1.9, 2.2, lt), 2.6); X.visible = lt > 1.88; X.scale.setScalar(Math.max(0.001, kx));
    pop(t1, lt, 2.1, 0.3);
    const f = kf(lt, [[0, [0.8, 1.4, 2.6], [0, 0.9, -1.0], 50, 0.03], [3.25, [-0.6, 1.3, 2.2], [0, 0.95, -1.0], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, lt > 1.9 && lt < 2.2 ? 0.012 : 0.003, 14, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, -0.45);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 1.0 };
}
// 39.30–41.35  «и писала код прямо под железо.»
export function buildMetal() {
  const scene = new THREE.Scene(); stage(scene, '#05080a');
  const mb = new THREE.Group(); const pcbT = canvasTex('pcb10', 512, 320, (c, w, h) => { c.fillStyle = '#1f5a2e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c8a24a'; c.lineWidth = 3; const rr = rng(3); for (let i = 0; i < 60; i++) { c.beginPath(); let x = rr() * w, y = rr() * h; c.moveTo(x, y); for (let k = 0; k < 4; k++) { if (k % 2) x += (rr() - 0.5) * 160; else y += (rr() - 0.5) * 120; c.lineTo(x, y); } c.stroke(); } }, { repeat: [1, 1] });
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 1.4), [M.col('#16401f', 0.5), M.col('#16401f', 0.5), M.std({ map: pcbT, roughness: 0.5 }), M.col('#16401f', 0.5), M.col('#16401f', 0.5), M.col('#16401f', 0.5)]); pcb.position.y = 0.02; mb.add(pcb);
  [[-0.5, -0.1, 0.5, 0.5, 'CPU'], [0.35, -0.25, 0.4, 0.3, 'RAM'], [0.35, 0.25, 0.4, 0.3, 'RAM'], [-0.6, 0.45, 0.3, 0.25, 'GPU'], [0.85, 0.0, 0.25, 0.6, 'CD']].forEach(([x, z, w, d, t]) => { box(w, 0.06, d, M.col('#18181c', 0.4), x, 0.07, z, mb); const l = sign(t, { width: Math.min(w, d) * 0.8, color: '#c8c8cc', size: 80, pad: 6 }); l.rotation.x = -Math.PI / 2; l.position.set(x, 0.101, z); mb.add(l); });
  scene.add(shadows(mb));
  const lines = []; for (let i = 0; i < 10; i++) { const s = sign(['MOV', 'LW', 'SW', 'ADDIU', 'JAL', 'DMA', 'GTE', 'CD_READ', 'BNE', 'NOP'][i], { width: 0.28, color: '#3aff6a', size: 80, pad: 6, emissive: 0.8 }); s.userData = { x: -1 + (i % 5) * 0.5, ph: i * 0.13 }; scene.add(s); lines.push(s); }
  const t1 = sign('КОД ПРЯМО ПОД ЖЕЛЕЗО', { width: 1.4, color: '#1a1a1a', bg: '#3aff6a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    lines.forEach((s) => { const k = ((lt * 0.8 + s.userData.ph) % 1); s.position.set(s.userData.x, 1.6 - k * 1.5, -0.3 + k * 0.5); s.rotation.x = -0.6; s.material.opacity = 1 - k; s.material.transparent = true; });
    pop(t1, lt, 1.2, 0.3);
    const f = kf(lt, [[0, [0.6, 2.2, 2.2], [0, 0.3, 0], 50, 0.03], [2.05, [-0.5, 1.9, 1.9], [0, 0.3, 0], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.88);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.25, ao: 0.6 };
}

// 41.35–45.15  «В Sony забеспокоились, что дисковод не выдержит такой нагрузки,»
export function buildWorry() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a0e');
  room6(scene, { w: 5.4, d: 5.4, h: 2.8, wall: '#c8c4bc', floor: woodFloor('#5a4030'), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#e8eeff', '#2a2018', 0.5));
  const tb = rbox(1.6, 0.06, 0.9, 0.02, M.col('#e8e8ea', 0.4), 0, 0.75, -1.3, scene); void tb; for (const x of [-0.7, 0.7]) for (const z of [-1.7, -0.9]) box(0.05, 0.72, 0.05, M.col('#2a2a30', 0.5), x, 0.36, z, scene);
  const c = console10(0.9); c.position.set(0.1, 0.78, -1.35); scene.add(c);
  const sm = smoke({ n: 26, seed: 4, origin: [0, 0.98, -1.4], spread: [0.15, 0.05, 0.15], vel: [0, 0.5, 0], size: [0.12, 0.3], life: [1.2, 2.2], color: '#8a8a90' }); scene.add(sm);
  const gg = gauge('НАГРУЗКА'); gg.scale.setScalar(0.5); gg.position.set(-0.55, 1.2, -1.55); gg.rotation.y = 0.2; scene.add(gg);
  const E = cast10.exec(); E.root.position.set(0.75, 0, -0.55); E.root.rotation.y = Math.PI + 0.6; scene.add(E.root);
  const nm = sign('SONY', { width: 0.8, color: '#1a1a1a', size: 140, pad: 10 }); nm.position.set(-1.2, 1.9, -2.68); scene.add(nm);
  const key = new THREE.SpotLight('#fff0dc', 18, 9, 0.7, 0.6, 1.2); key.position.set(1.4, 2.6, 0.8); key.target.position.set(0, 0.9, -1.3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const t1 = sign('ДИСКОВОД ВЫДЕРЖИТ?', { width: 1.3, color: '#ffffff', bg: '#d4213a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    c.userData.lid.rotation.y = lt * 6; if (sm.userData && sm.userData.update) sm.userData.update(lt); sm.visible = lt > 1.0;
    gg.userData.needle.rotation.z = lerp(0, -1.35, smooth(inv(0.5, 2.5, lt))) + Math.sin(lt * 25) * 0.04;
    E.pose({ ...STAND, rSh: [-70, 0, -10], rEl: [-110, 0, 0], rCurl: 0.4, lSh: [-30, 0, 20], lEl: [-80, 0, 0], head: [14, 0, 0], spine: [8, 0, 0] }); idle3(E, lt, 3, 0.3); E.face({ blink: 0, brows: 0.9, browTilt: 0.7, mouth: 0.15 });
    pop(t1, lt, 1.8, 0.3);
    const f = kf(lt, [[0, [-1.2, 1.6, 1.4], [0.3, 1.1, -0.9], 50, 0.03], [3.8, [-0.4, 1.55, 1.7], [0.3, 1.1, -0.9], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 6, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.85);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 45.15–48.00  «но игра вышла в 1996 году,»
export function buildRelease() {
  const scene = new THREE.Scene(); stage(scene);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.8, 32), M.col('#24242e', 0.4)); ped.position.y = 0.4; ped.castShadow = true; scene.add(ped);
  const bx = gameBox8('CRASH', '1996', '#e8862a', '#1a2a6a'); bx.scale.setScalar(2.4); bx.position.set(0, 0.8 + 0.505 + 0.01, 0); scene.add(bx);
  const yr = text3d('1996', { family: 'mont', size: 0.38, depth: 0.1, bevel: 0.014, color: '#ffffff', side: '#e8862a', emissive: '#ffa040', emissiveIntensity: 0.3 }); yr.position.set(0, 2.45, -0.3); scene.add(yr);
  const t1 = sign('ИГРА ВЫШЛА', { width: 0.9, color: '#1a1a1a', bg: '#ffd23a', size: 110, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const kb = easeOutBack(inv(0.05, 0.45, lt), 2.2); bx.scale.setScalar(2.4 * Math.max(0.001, kb)); bx.rotation.y = (1 - kb) * 3 + Math.sin(lt * 1.2) * 0.25;
    const k = easeOutElastic(inv(0.85, 1.45, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.83;
    pop(t1, lt, 1.5, 0.3);
    const f = kf(lt, [[0, [0.9, 1.6, 3.2], [0, 1.5, 0], 50, 0.03], [2.85, [-0.5, 1.6, 2.6], [0, 1.6, 0], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.45);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 0.8 };
}

// 48.00–51.00  «а Крэш стал неофициальным талисманом PlayStation.»
export function buildMascot() {
  const scene = new THREE.Scene(); stage(scene, '#0a0710');
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.5, 32), M.col('#24242e', 0.4)); ped.position.y = 0.25; ped.castShadow = true; scene.add(ped);
  const R = runner(); R.position.set(0, 0.5, 0); R.scale.setScalar(1.3); scene.add(R);
  const c = console10(0.8); c.position.set(1.0, 0, 0.3); c.rotation.y = -0.4; scene.add(c);
  const conf = []; const r = rng(4); for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.07), new THREE.MeshStandardMaterial({ color: ['#e8862a', '#2a4ab8', '#c8282a', '#ffd23a'][i % 4], side: THREE.DoubleSide })); m.userData = { x: (r() - 0.5) * 3, z: -1 + r() * 2.5, ph: r(), sp: 0.5 + r() * 0.5 }; scene.add(m); conf.push(m); }
  point(scene, '#ffb04a', 8, 5, [0, 2.2, 1.2]);
  const t1 = sign('ТАЛИСМАН PLAYSTATION', { width: 1.4, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 20, border: '#1a1a1a' }); scene.add(t1);
  const t2 = sign('НЕОФИЦИАЛЬНЫЙ', { width: 1.0, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 18, border: '#ffffff' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    R.userData.run(lt * 0.5, 0.6); R.rotation.y = Math.sin(lt * 1.5) * 0.4;
    conf.forEach((m) => { const u = m.userData; const k = ((lt * u.sp * 0.35 + u.ph) % 1); m.position.set(u.x + Math.sin(lt * 2 + u.ph * 9) * 0.15, 3.2 - k * 3.2, u.z); m.rotation.set(lt * 3 + u.ph * 6, lt * 2, 0); });
    pop(t2, lt, 0.7, 0.3); pop(t1, lt, 1.5, 0.3);
    const a = 0.3 - lt * 0.25; setCam(camera, V(Math.sin(a) * 3.2, 1.5, Math.cos(a) * 3.2).add(shake(lt, 0.003, 4, 2)), V(0, 1.1, 0), 0, 50);
    hud(t2, camera, 2.6, 0, 0.98); hud(t1, camera, 2.6, 0, 0.7);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 0.8 };
}
