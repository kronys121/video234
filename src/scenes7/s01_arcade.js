import * as THREE from 'three';
import { cast7, heroSprite, ladySprite, arcadeCab, arcadeDraw, barrel7, girder, nameTag, crateStack, pallet } from '../lib/sets7.js';
import { room6, desk6, chair6, plant, woodFloor, ceilingLamp } from '../lib/sets6.js';
import { idle3 } from '../lib/human3.js';
import { usFlag } from '../lib/rooms.js';
import { heart } from '../lib/fantasy.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, hud, shadows } from '../lib/shot.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, canvasTex } from '../lib/util.js';

export const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
export const STAND = { lSh: [0, 0, 7], rSh: [0, 0, -7] };
export const SITP = { hipsY: -0.36, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0] };

// dark arcade room with a row of cabinets
function arcadeRoom(scene, draw, marquee = 'DONKEY KONG') {
  scene.background = new THREE.Color('#06060c');
  room6(scene, { w: 6, d: 6, h: 3, wall: '#1e1a2e', floor: M.std({ map: TEX.carpet([6, 6], '#2a1a4a'), roughness: 1 }), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#8a7aff', '#100818', 0.3));
  const cabs = [[-1.0, '#5a2a8a', 'GALAXY'], [0, '#2a4ab8', marquee], [1.0, '#2a7a4a', 'SPACE']].map(([x, c, m], i) => { const cb = arcadeCab(i === 1 ? draw : (g, w, h, t) => arcadeDraw(g, w, h, t + i * 3), m, c); cb.position.set(x, 0, -2.6); scene.add(solid(cb, 'cab' + i)); return cb; });
  for (const [x, c] of [[-2.5, '#ff3ad0'], [2.5, '#3ad0ff']]) { const strip = box(0.04, 2.6, 0.04, M.emis(c, 3), x, 1.4, -2.95, scene); strip.userData.noAO = true; point(scene, c, 4, 4, [x, 1.5, -2.5]); }
  const key = new THREE.SpotLight('#ffe8d0', 14, 9, 0.7, 0.6, 1.2); key.position.set(0.8, 2.9, 1.0); key.target.position.set(0, 1.2, -2.4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  return { cabs, main: cabs[1] };
}

// 0.00–2.55  «Сначала прыгающего через бочки героя»
export function buildArcade() {
  const scene = new THREE.Scene(); const A = arcadeRoom(scene, (g, w, h, t) => arcadeDraw(g, w, h, t));
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const t1 = sign('ПРЫЖКИ ЧЕРЕЗ БОЧКИ', { width: 1.3, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 22, border: '#1a1a1a' }); scene.add(t1);
  function update(lt) {
    A.cabs.forEach((c) => c.userData.live.update(lt));
    pop(t1, lt, 1.0, 0.3);
    const f = kf(lt, [[0, [1.6, 1.8, 2.4], [0, 1.4, -2.6], 52, 0.04], [2.55, [0.15, 1.55, -1.2], [0, 1.5, -2.6], 44, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.2, 0, 0.65);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.85, envIntensity: 0.2, ao: 1.0 };
}

// voxel world of sloped girders with rolling barrels and the hero sprite
export function girderWorld(scene, { lady = false } = {}) {
  scene.background = new THREE.Color('#05050c');
  scene.add(new THREE.HemisphereLight('#a0a8ff', '#100810', 0.45));
  const key = new THREE.DirectionalLight('#fff0dc', 2.2); key.position.set(3, 6, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); scene.add(key);
  const gs = [[0, 0.0, 0.06], [0.4, 1.8, -0.06], [0, 3.6, 0.06]].map(([x, y, rz]) => { const g = girder(6.5); g.position.set(x, y, 0); g.rotation.z = rz; scene.add(g); return g; });
  const ladder = new THREE.Group(); for (const s of [-1, 1]) box(0.04, 1.6, 0.04, M.emis('#3ad0ff', 0.6), 0.22 * s, 0.8, 0, ladder); for (let y = 0.15; y < 1.6; y += 0.2) box(0.44, 0.03, 0.03, M.emis('#3ad0ff', 0.6), 0, y, 0, ladder); ladder.position.set(2.3, 0.2, 0.1); scene.add(ladder);
  const barrels = [0, 1, 2].map(() => { const b = barrel7(0.55); b.rotation.x = Math.PI / 2; const w = new THREE.Group(); w.add(b); scene.add(w); return w; });
  const hero = heroSprite(0.075); scene.add(hero);
  let ld = null; if (lady) { ld = ladySprite(0.075); ld.position.set(-0.9, 3.85, 0); scene.add(ld); }
  const glow = point(scene, '#ff6a5a', 6, 6, [0, 2.5, 2]);
  void gs; void glow;
  return { hero, barrels, lady: ld };
}
const deckY = (x) => 1.8 + 0.225 - 0.06 * (x - 0.4);
export function rollBarrels(W, lt) { W.barrels.forEach((b, i) => { const k = ((lt * 0.26 + i * 0.34) % 1); const x = 3.1 - 6.2 * k; b.position.set(x, deckY(x) + 0.16, 0); b.rotation.z = (3.1 - x) / 0.16; b.visible = k > 0.02 && k < 0.98; }); }
// the hero hops whenever a barrel comes near, so the two never touch
export function heroJump(W, lt, x = -0.6) { let j = 0; W.barrels.forEach((b) => { if (!b.visible) return; const d = Math.abs(b.position.x - x); j = Math.max(j, d < 0.55 ? Math.cos(d / 0.55 * Math.PI / 2) : 0); }); W.hero.position.set(x, deckY(x) + 0.01 + j * 0.62, 0.05); }

// 2.55–4.55  «Donkey Kong называли Jumpman.»
export function buildJumpman() {
  const scene = new THREE.Scene(); const W = girderWorld(scene);
  const dk = text3d('DONKEY KONG', { family: 'russo', size: 0.17, depth: 0.08, bevel: 0.012, color: '#ffd23a', side: '#a8700a', emissive: '#ffa020', emissiveIntensity: 0.25 }); dk.position.set(0, 4.6, -0.5); scene.add(dk);
  const tag = nameTag('JUMPMAN', { w: 0.9, bg: '#ffffff', color: '#d8281e', border: '#d8281e' }); scene.add(tag);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    rollBarrels(W, lt); heroJump(W, lt);
    pop(dk, lt, 0.05, 0.4, 2.0);
    pop(tag, lt, 1.2, 0.3); tag.position.set(0.32, 2.75 + Math.sin(lt * 3) * 0.03, 0.4);
    const f = kf(lt, [[0, [1.6, 2.6, 5.4], [0, 2.8, 0], 52, 0.05], [2.0, [-0.2, 2.75, 4.6], [-0.15, 2.85, 0], 50, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 3)), f.look, f.roll, f.fov);
    tag.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.85, envIntensity: 0.25, ao: 0.8 };
}

function sketchDraw(g, w, h) { g.fillStyle = '#f4f0e4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8d8e8'; g.lineWidth = 1; for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } const p = 9; const rows = ['...RRRRR....', '..RRRRRRRR..', '..BBBSSKS...', '.BSBSSSKSSS.', '.BBSSSSKKKK.', '...SSSSSSS..', '..RRORRR....', '.RRRORRORRR.', 'RRRROOOORRRR', 'SSOOOOOOOOSS', '..OOO..OOO..', '.BBB....BBB.']; const pal = { R: '#d8281e', B: '#5a3214', S: '#f2b98a', K: '#141010', O: '#2a4ab8' }; rows.forEach((row, j) => [...row].forEach((ch, i) => { if (!pal[ch]) return; g.fillStyle = pal[ch]; g.fillRect(40 + i * p, 60 + j * p, p - 1, p - 1); })); g.strokeStyle = '#2a2a2a'; g.lineWidth = 3; g.strokeRect(36, 56, 12 * p + 8, 12 * p + 8); g.fillStyle = '#2a2a2a'; g.font = '22px Russo'; g.textAlign = 'left'; g.fillText('ГЕРОЙ — эскиз', 30, 40); g.fillText('кепка: волосы', 170, 90); g.fillText('усы: рот', 170, 130); g.fillText('комбинезон: руки', 170, 170); }
// 4.55–7.05  «Сигэру Миямото придумал его в том числе потому,»
export function buildDesigner() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0c0c10');
  room6(scene, { w: 5.6, d: 5.6, h: 2.8, wall: '#c8bfa8', floor: woodFloor('#7a5a3a'), windowAt: { wall: 'left', rect: [-0.4, 1.6, 1.6, 1.2] }, open: ['front'] });
  scene.add(new THREE.HemisphereLight('#f0f0ff', '#3a2a1a', 0.5));
  const dk = desk6(1.6, 0.8, 0.75, '#c8a878', '#3a3a40'); dk.position.set(0, 0, -2.2); scene.add(solid(dk, 'desk', [], [dk.userData.top]));
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), M.std({ map: canvasTex('sketch7', 420, 300, sketchDraw, { repeat: [1, 1] }), roughness: 0.8 })); sheet.rotation.set(-Math.PI / 2 + 0.25, 0, 0); sheet.position.set(0, 0.79, -2.02); scene.add(sheet);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), M.col('#e8e4d8', 0.7)); board.rotation.x = -Math.PI / 2 + 0.25; board.position.set(0, 0.785, -2.02); scene.add(board);
  const pens = [0, 1, 2].map((i) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8), M.col(['#d8281e', '#2a4ab8', '#1a1a1a'][i], 0.4)); p.rotation.z = Math.PI / 2; p.position.set(0.4 + i * 0.03, 0.765, -2.1 + i * 0.03); scene.add(p); return p; });
  const lamp = ceilingLamp(scene, 0, -1.8, 2.8);
  const ch = chair6('#3a3a44'); ch.position.set(0, 0, -1.45); scene.add(solid(ch, 'chair', ['designer']));
  const d = cast7.designer(); d.root.position.set(0, 0, -1.48); d.root.rotation.y = Math.PI; scene.add(d.root); d.root.userData.allow = ['chair'];
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8), M.col('#1a1a1a', 0.4)); scene.add(pen);
  const key = new THREE.SpotLight('#fff0dc', 20, 9, 0.7, 0.6, 1.2); key.position.set(-2.4, 2.6, -0.6); key.target.position.set(0, 0.9, -1.9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const t1 = sign('ГЕЙМДИЗАЙНЕР NINTENDO', { width: 1.5, color: '#ffffff', bg: '#d8281e', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const wh = new THREE.Vector3();
  function update(lt) {
    const dr = Math.sin(lt * 9) * 6;
    d.pose({ ...SITP, rSh: [-40 + dr, 0, -14], rEl: [-75, 10 + dr, 0], rCurl: 0.75, lSh: [-35, 0, 16], lEl: [-80, 0, 0], lCurl: 0.2, spine: [12, 0, 0], head: [16, 0, 0] }); idle3(d, lt, 3, 0.3);
    d.face({ blink: 0, brows: 0.3, smile: 0.4, look: [0, -0.3] });
    d.root.updateMatrixWorld(true); d.J.rHand.group.getWorldPosition(wh); pen.position.copy(wh).add(V(0, -0.04, -0.02)); pen.rotation.set(0.6, 0, 0.3);
    pop(t1, lt, 0.4, 0.3);
    const f = kf(lt, [[0, [1.7, 1.6, -0.6], [0, 1.0, -2.0], 50, 0.03], [2.5, [0.9, 1.5, -1.0], [0, 0.95, -2.0], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.75);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 7.05–9.98  «что Nintendo не смогла получить лицензию на Popeye.»
export function buildLicense() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0c0c10');
  room6(scene, { w: 5, d: 5, h: 2.8, wall: '#3a3e4a', floor: woodFloor('#4a3424'), open: ['front'] });
  scene.add(new THREE.HemisphereLight('#e8eeff', '#2a2018', 0.4));
  const dk = desk6(1.6, 0.9, 0.75, '#5a3a24', '#2a1e16'); dk.position.set(0, 0, -1.2); scene.add(dk);
  const paper = canvasTex('lic7', 300, 420, (g, w, h) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.font = '34px Russo'; g.textAlign = 'center'; g.fillText('ЛИЦЕНЗИЯ', w / 2, 60); g.font = '26px Russo'; g.fillText('POPEYE', w / 2, 100); g.fillStyle = '#9a9488'; for (let y = 140; y < 360; y += 24) g.fillRect(30, y, w - 60 - ((y * 7) % 60), 7); }, { repeat: [1, 1] });
  const doc = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.59), M.std({ map: paper, roughness: 0.8 })); doc.rotation.set(-Math.PI / 2, 0, 0.08); doc.position.set(-0.05, 0.752, -1.15); doc.receiveShadow = true; scene.add(doc);
  const stampT = sign('ОТКАЗАНО', { width: 0.38, color: '#d4213a', size: 110, pad: 12, border: '#d4213a' }); stampT.rotation.set(-Math.PI / 2, 0, 0.3); stampT.position.set(-0.05, 0.756, -1.08); scene.add(stampT);
  const stamp = new THREE.Group(); rbox(0.14, 0.05, 0.09, 0.01, M.col('#2a2a2e', 0.4), 0, 0.025, 0, stamp); const hdl = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.12, 14), M.col('#7a1a1a', 0.5)); hdl.position.y = 0.11; stamp.add(hdl); const kn = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 10), M.col('#7a1a1a', 0.5)); kn.position.y = 0.18; stamp.add(kn); scene.add(shadows(stamp));
  // tin can with a plain label
  const can = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 24), new THREE.MeshStandardMaterial({ map: canvasTex('can7', 512, 160, (g, w, h) => { g.fillStyle = '#2a8a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '54px Russo'; g.textAlign = 'center'; g.fillText('ШПИНАТ', w / 2, h * 0.6); }, { repeat: [1, 1] }), roughness: 0.4, metalness: 0.3 })); c.position.y = 0.1; can.add(c); for (const y of [0, 0.2]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.006, 6, 24), M.col('#c8c8cc', 0.3, 0.9)); r.rotation.x = Math.PI / 2; r.position.y = y; can.add(r); } can.position.set(0.48, 0.75, -1.3); scene.add(shadows(can));
  const lamp = ceilingLamp(scene, 0, -1.2, 2.8);
  const key = new THREE.SpotLight('#fff0dc', 9, 8, 0.7, 0.6, 1.2); key.position.set(1.2, 2.6, 0.6); key.target.position.set(0, 0.75, -1.2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const t1 = sign('НЕТ ЛИЦЕНЗИИ', { width: 0.7, color: '#ffffff', bg: '#d4213a', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.03, 60);
  const HIT = 1.55;
  function update(lt) {
    const down = lt < HIT ? smooth(inv(HIT - 0.4, HIT, lt)) : 1 - smooth(inv(HIT + 0.15, HIT + 0.55, lt));
    stamp.position.set(-0.05, lerp(1.25, 0.752, down), -1.08); stamp.rotation.y = 0.3;
    stampT.visible = lt > HIT; const ks = easeOutBack(inv(HIT, HIT + 0.12, lt), 3); stampT.scale.setScalar(Math.max(0.001, 1.25 - 0.25 * ks));
    pop(can, lt, 2.3, 0.35, 2.4); can.rotation.y = lt * 0.6;
    pop(t1, lt, HIT + 0.15, 0.3);
    const f = kf(lt, [[0, [0.6, 1.7, 0.1], [0.05, 0.75, -1.15], 50, 0.04], [2.93, [-0.3, 1.45, -0.2], [0.15, 0.78, -1.2], 46, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, lt > HIT && lt < HIT + 0.25 ? 0.015 : 0.003, 18, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.2, 0, 0.72);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 9.98–12.40  «Когда игру готовили к выходу в США, герою»
export function buildUSA() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#9ac8f0'); scene.fog = new THREE.Fog('#b8d8f4', 20, 70);
  scene.add(new THREE.HemisphereLight('#e8f2ff', '#5a5040', 0.9));
  const sun = new THREE.DirectionalLight('#fff2dc', 2.6); sun.position.set(6, 10, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); scene.add(sun);
  const dock = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), M.std({ map: TEX.concrete([6, 3], '#a8a49c'), roughness: 0.8 })); dock.rotation.x = -Math.PI / 2; dock.position.z = -3; dock.receiveShadow = true; scene.add(dock);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(200, 120), M.std({ color: '#2a6aa8', roughness: 0.15, metalness: 0.3 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.6, -70); scene.add(sea);
  // ship hull with containers
  const ship = new THREE.Group(); box(14, 2.2, 3.4, M.col('#c8302a', 0.5), 0, 0.4, 0, ship); box(14, 0.3, 3.4, M.col('#2a2a30', 0.5), 0, 1.6, 0, ship); [['#2a6ab8', -4], ['#e8a03a', -1.2], ['#2a8a5a', 1.6], ['#8a3a8a', 4.4]].forEach(([c, x]) => box(2.6, 1.2, 2.4, M.col(c, 0.6), x, 2.35, 0, ship)); ship.position.set(1, 0, -14); scene.add(shadows(ship));
  const stacks = [[-1.3, -1.5, 3], [0.0, -2.0, 4], [1.3, -1.4, 2]].map(([x, z, n], i) => { const s = crateStackArcade(n, i); s.position.set(x, 0, z); scene.add(solid(s, 'stack' + i)); return s; });
  const flag = usFlag(1.6); flag.position.set(2.6, 3.3, -3.0); scene.add(flag); box(0.06, 3.9, 0.06, M.col('#c8c8cc', 0.3, 0.8), 1.78, 1.95, -3.0, scene);
  const t1 = sign('ВЫХОД В США', { width: 1.1, color: '#ffffff', bg: '#2a4ab8', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 200);
  function update(lt) {
    flag.rotation.y = Math.sin(lt * 2) * 0.08;
    stacks.forEach((s, i) => { s.children.forEach((c, j) => { const k = easeOutBack(inv(j * 0.12 + i * 0.1, j * 0.12 + i * 0.1 + 0.3, lt), 2); c.scale.setScalar(Math.max(0.001, k)); }); });
    pop(t1, lt, 1.45, 0.3);
    const f = kf(lt, [[0, [3.4, 1.4, 3.8], [0, 1.4, -2], 54, 0.04], [2.42, [-1.8, 2.2, 4.6], [0.4, 1.8, -3], 56, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.8, 0, 0.85);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.2, bloomThreshold: 0.95, envIntensity: 0.3, ao: 0.8 };
}
function crateStackArcade(n, seed) { const g = new THREE.Group(); const p = pallet(); g.add(p); for (let i = 0; i < n; i++) { const c = new THREE.Group(); const b = box(0.9, 0.6, 0.8, M.std({ map: TEX.plywood([1, 1], '#b8945a'), roughness: 0.8 }), 0, 0.3, 0, c); void b; const s = sign('ARCADE', { width: 0.5, color: '#1a1a1a', size: 90, pad: 8 }); s.position.set(0, 0.3, 0.401); c.add(s); const s2 = sign('→ USA', { width: 0.35, color: '#d4213a', size: 90, pad: 8 }); s2.position.set(0, 0.12, 0.401); c.add(s2); c.position.y = 0.145 + i * 0.6; c.rotation.y = ((seed * 7 + i * 3) % 5 - 2) * 0.02; g.add(shadows(c)); } return g; }

// 12.40–16.30  «понадобилось нормальное имя, и тут появляются две версии.»
export function buildName() {
  const scene = new THREE.Scene(); const W = girderWorld(scene);
  const tag = nameTag('JUMPMAN', { w: 0.9, bg: '#ffffff', color: '#1a1a1a', border: '#1a1a1a' }); scene.add(tag);
  const cross = new THREE.Group(); for (const s of [-1, 1]) { const b = box(1.05, 0.06, 0.02, M.emis('#ff2a3a', 1.6)); b.rotation.z = 0.32 * s; cross.add(b); } scene.add(cross);
  const qs = [0, 1, 2].map(() => { const q = sign('?', { width: 0.3, color: '#1a1a1a', bg: '#ffd23a', size: 200, pad: 8 }); scene.add(q); return q; });
  const v1 = sign('ВЕРСИЯ 1', { width: 0.85, color: '#ffffff', bg: '#2a4ab8', size: 100, pad: 22, border: '#ffffff' }); scene.add(v1);
  const v2 = sign('ВЕРСИЯ 2', { width: 0.85, color: '#ffffff', bg: '#d8281e', size: 100, pad: 22, border: '#ffffff' }); scene.add(v2);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    rollBarrels(W, lt + 2); heroJump(W, lt + 2);
    tag.position.set(0.32, 2.75, 0.4); tag.scale.setScalar(1); tag.visible = true;
    const kc = easeOutBack(inv(0.4, 0.7, lt), 2.4); cross.scale.setScalar(Math.max(0.001, kc)); cross.visible = lt > 0.38; cross.position.set(0.32, 2.75, 0.43);
    qs.forEach((q, i) => { pop(q, lt, 1.0 + i * 0.25, 0.3, 2.6); q.position.set(-1.4 + i * 0.8, 3.95 + Math.sin(lt * 3 + i) * 0.05, 0.3); });
    pop(v1, lt, 2.8, 0.3); pop(v2, lt, 3.0, 0.3);
    const f = kf(lt, [[0, [-0.2, 3.0, 3.8], [-0.15, 3.0, 0], 52, 0.03], [3.9, [-0.1, 2.8, 5.4], [-0.15, 2.9, 0], 54, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    [tag, cross, ...qs].forEach((o) => o.lookAt(camera.position));
    hud(v1, camera, 3, -0.45, -0.42); hud(v2, camera, 3, 0.45, -0.42);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.85, envIntensity: 0.25, ao: 0.8 };
}

// 31.55–33.70  «а героя потом переименовали в Марио.»
export function buildRename() {
  const scene = new THREE.Scene(); const W = girderWorld(scene);
  const old = nameTag('JUMPMAN', { w: 0.9 }); scene.add(old);
  const neu = nameTag('MARIO', { w: 0.8, bg: '#d8281e', color: '#ffffff', border: '#ffffff' }); scene.add(neu);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const FLIP = 1.15;
  function update(lt) {
    rollBarrels(W, lt + 5); heroJump(W, lt + 5);
    const k = smooth(inv(FLIP - 0.15, FLIP + 0.15, lt));
    old.position.set(0.32, 2.75, 0.4); neu.position.copy(old.position);
    old.scale.set(1, Math.max(0.001, 1 - 2 * k), 1); old.visible = k < 0.5;
    neu.scale.set(1, Math.max(0.001, 2 * k - 1) * (1 + 0.15 * Math.sin(clamp(lt - FLIP - 0.15, 0, 0.5) * 12) * (lt < FLIP + 0.65 ? 1 : 0)), 1); neu.visible = k > 0.5;
    const f = kf(lt, [[0, [0.5, 2.9, 4.4], [0.0, 2.95, 0], 50, -0.03], [2.15, [-0.4, 2.8, 4.2], [0.0, 2.95, 0], 50, 0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004 + (Math.abs(lt - FLIP - 0.15) < 0.15 ? 0.01 : 0), 12, 2)), f.look, f.roll, f.fov);
    old.lookAt(camera.position); neu.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.85, envIntensity: 0.25, ao: 0.8 };
}

// 51.45–54.20  «Подруга героя Полин, кстати, получила»
export function buildPauline() {
  const scene = new THREE.Scene(); const W = girderWorld(scene, { lady: true });
  const tag = nameTag('ПОЛИН', { w: 0.8, bg: '#ff6aa8', color: '#ffffff', border: '#ffffff' }); scene.add(tag);
  const h = heart(0.28); scene.add(h);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    rollBarrels(W, lt + 8); heroJump(W, lt + 8);
    W.lady.position.y = 3.85 + 0.25 + Math.abs(Math.sin(lt * 4)) * 0.06;
    pop(tag, lt, 0.95, 0.3); tag.position.set(-0.9, 5.45, 0.3);
    const kh = easeOutBack(inv(0.4, 0.8, lt), 2.6); h.scale.setScalar(Math.max(0.001, 0.28 * kh * (1 + 0.08 * Math.sin(lt * 8)))); h.visible = lt > 0.38; h.position.set(-0.25, 4.95, 0.2);
    const f = kf(lt, [[0, [0.4, 3.6, 4.6], [-0.6, 3.6, 0], 52, 0.04], [2.75, [-1.3, 4.6, 3.6], [-0.8, 4.6, 0], 48, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    tag.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.85, envIntensity: 0.25, ao: 0.8 };
}
