import * as THREE from 'three';
import { cast6, room6, ceilingLamp, desk6, plant, woodFloor, corkBoard, note, headset, cap } from '../lib/sets6.js';
import { idle3 } from '../lib/human3.js';
import { livePlane } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
import { box, rbox } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, hud, shadows } from '../lib/shot.js';
import { walkPose } from '../lib/human.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';
import { gamerRoom, typing } from './s01_cheat.js';

const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
const STAND = { lSh: [0, 0, 7], rSh: [0, 0, -7] };

function agencyOffice(scene) {
  scene.background = new THREE.Color('#0a0a0e');
  room6(scene, { w: 6.4, d: 6.4, h: 3, wall: '#4a3e36', floor: woodFloor('#4a3424', [4, 4]), windowAt: { wall: 'right', rect: [0.4, 1.7, 1.8, 1.4] }, night: true, open: ['front'] });
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#2a1e14', 0.35));
  const board = corkBoard(2.2, 1.3); board.position.set(-0.4, 1.65, -3.17); scene.add(board);
  const dk = desk6(1.7, 0.85, 0.76, '#5a3a24', '#2a1e16'); dk.position.set(0.9, 0, -1.6); scene.add(solid(dk, 'desk', [], [dk.userData.top]));
  const lampG = new THREE.Group(); box(0.04, 0.4, 0.04, M.col('#2a4a2a', 0.4, 0.6), 0, 0.2, 0, lampG); const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.12, 20, 1, true), M.std({ color: '#2a6a3a', roughness: 0.4, metalness: 0.4, side: THREE.DoubleSide })); shade.position.y = 0.42; lampG.add(shade); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), M.emis('#ffe0a0', 4)); bulb.position.y = 0.38; bulb.userData.noAO = true; lampG.add(bulb); lampG.position.set(1.5, 0.76, -1.8); scene.add(shadows(lampG));
  point(scene, '#ffcf8a', 6, 4, [1.5, 1.1, -1.7]);
  const ppr = (x, z, r) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.297), M.col('#f2eee4', 0.8)); p.rotation.set(-Math.PI / 2, 0, r); p.position.set(x, 0.762, z); p.receiveShadow = true; scene.add(p); };
  ppr(0.6, -1.5, 0.2); ppr(0.85, -1.45, -0.1); ppr(1.1, -1.7, 0.4);
  const pl = plant(1.1); pl.position.set(2.6, 0, -2.6); scene.add(pl);
  const key = new THREE.SpotLight('#ffe2c0', 26, 11, 0.75, 0.6, 1.2); key.position.set(1.8, 2.9, 1.6); key.target.position.set(-0.2, 1.1, -2.0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const blue = new THREE.SpotLight('#7a9aff', 14, 10, 0.7, 0.7, 1.3); blue.position.set(3.0, 2.0, 0.4); blue.target.position.set(0, 1, -1.5); scene.add(blue, blue.target);
  return { board };
}

// 14.55–18.95  «Поэтому компания наняла частных детективов, бывших агентов ФБР.»
export function buildDetectives() {
  const scene = new THREE.Scene(); agencyOffice(scene);
  const dm = cast6.detM(), df = cast6.detF(); dm.root.position.set(-0.55, 0, -0.5); df.root.position.set(0.55, 0, -0.35); dm.root.rotation.y = 0.15; df.root.rotation.y = -0.2; scene.add(dm.root, df.root);
  const wallet = new THREE.Group(); rbox(0.09, 0.12, 0.012, 0.004, M.col('#2a1a10', 0.6), 0, 0, 0, wallet); const shield = new THREE.Mesh(new THREE.CircleGeometry(0.03, 6), M.col('#d8b84a', 0.3, 0.9)); shield.position.set(0, 0.015, 0.007); wallet.add(shield); scene.add(shadows(wallet));
  const t1 = sign('ЧАСТНЫЕ ДЕТЕКТИВЫ', { width: 1.6, color: '#1a1a1a', bg: '#e8d8a8', size: 100, pad: 22, border: '#1a1a1a' }); scene.add(t1);
  const t2 = sign('БЫВШИЕ АГЕНТЫ ФБР', { width: 1.5, color: '#ffffff', bg: '#1e3a6a', size: 100, pad: 22, border: '#d8c070' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const wh = new THREE.Vector3();
  function update(lt) {
    const show = smooth(inv(3.2, 3.6, lt));
    dm.pose({ ...STAND, rSh: [lerp(-10, -75, show), 0, -10], rEl: [lerp(-20, -30, show), 0, 0], rCurl: 0.7, lSh: [-12, 0, 10], lEl: [-25, 0, 0] }); idle3(dm, lt, 1, 0.4); dm.face({ blink: 0, brows: -0.3, smile: 0.2 });
    df.pose({ ...STAND, lSh: [-30, 0, 30], lEl: [-95, 0, 0], rSh: [-30, 0, -30], rEl: [-95, 0, 0], lCurl: 0.5, rCurl: 0.5, head: [0, -8, 0] }); idle3(df, lt, 4, 0.4); df.face({ blink: 0, brows: -0.2, smile: 0.3 });
    dm.root.updateMatrixWorld(true); dm.J.rHand.group.getWorldPosition(wh); wallet.position.copy(wh).add(V(0, -0.05, 0.05)); wallet.rotation.set(0, 0.15, 0); wallet.visible = show > 0.05;
    pop(t1, lt, 1.9, 0.35); pop(t2, lt, 3.5, 0.35);
    const f = kf(lt, [[0, [1.6, 1.4, 3.6], [0, 1.4, -0.5], 52, 0.03], [2.2, [0.4, 1.55, 2.6], [0, 1.5, -0.5], 48, 0], [4.4, [-0.9, 1.5, 2.2], [-0.3, 1.4, -0.5], 46, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.8, 0, 0.95); hud(t2, camera, 2.8, 0, -0.45);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}

// chat window shown on the monitor
const MSGS = [[0.3, 'player_77', 'привет, хочу купить меню', '#7ab0ff'], [0.9, 'luna_dev', 'пиши, всё сделаем', '#c88aff'], [1.8, 'luna_dev', 'у нас опять ливень третий день', '#c88aff'], [2.9, 'luna_dev', 'и свет снова вырубили((', '#c88aff'], [3.6, 'player_77', 'жесть, держись', '#7ab0ff']];
export function chatDraw(g, w, h, t) {
  g.fillStyle = '#2b2d31'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e1f22'; g.fillRect(0, 0, w * 0.22, h); g.fillStyle = '#313338'; g.fillRect(w * 0.22, 0, w, h * 0.1);
  g.fillStyle = '#f2f3f5'; g.font = `${h * 0.045}px Russo`; g.textAlign = 'left'; g.fillText('# luna-support', w * 0.25, h * 0.065);
  ['# general', '# luna-support', '# updates', '# shop'].forEach((c, i) => { g.fillStyle = i === 1 ? '#f2f3f5' : '#80848e'; g.fillText(c, w * 0.02, h * (0.16 + i * 0.07)); });
  let y = h * 0.2;
  MSGS.forEach(([t0, who, txt, col]) => { if (t < t0) return; const a = clamp((t - t0) / 0.25); g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(w * 0.27, y + h * 0.02, h * 0.03, 0, 7); g.fill(); g.fillStyle = col; g.font = `${h * 0.04}px Russo`; g.fillText(who, w * 0.31, y + h * 0.01); g.fillStyle = '#dbdee1'; g.font = `${h * 0.05}px Russo`; g.fillText(txt, w * 0.31, y + h * 0.065); g.globalAlpha = 1; y += h * 0.15; });
}

// 18.95–22.40  «Они под видом обычных игроков общались с разработчиками чита»
export function buildUndercover() {
  const scene = new THREE.Scene(); const R = gamerRoom(scene, (g, w, h, t) => chatDraw(g, w, h, t * 0.6), { player: 'detM' });
  const hs = headset(); R.player.J.headGroup.add(hs); hs.position.set(0, 0.1, -0.005); hs.scale.setScalar(0.98);
  const cp = cap('#c83a3a'); R.player.J.headGroup.add(cp); cp.position.set(0, 0.13, -0.005); cp.rotation.y = Math.PI;
  const t1 = sign('ПОД ВИДОМ ИГРОКА', { width: 1.2, color: '#ffffff', bg: '#7a3aff', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    R.mon.userData.live.update(lt);
    typing(R.player, lt, 6); R.player.face({ blink: 0, brows: -0.2, smile: 0.15 });
    pop(t1, lt, 0.55, 0.3);
    const f = kf(lt, [[0, [-1.5, 1.5, -2.0], [0.1, 1.3, -1.7], 50, -0.03], [3.45, [-1.15, 1.65, -0.85], [0.05, 1.3, -1.8], 48, 0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 1)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.72);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.2, ao: 1.0 };
}

function cloudIcon() { const g = new THREE.Group(); const m = M.col('#dfe6f0', 0.6); [[0, 0, 0.16], [-0.17, -0.04, 0.12], [0.17, -0.04, 0.12], [0.08, 0.08, 0.12]].forEach(([x, y, r]) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m); s.position.set(x, y, 0); g.add(s); }); const drops = []; for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.05, 4, 8), M.col('#4a8aff', 0.3)); d.position.set(-0.2 + i * 0.08, -0.22, 0); g.add(d); drops.push(d); } g.userData.drops = drops; return shadows(g); }
function bulbIcon() { const g = new THREE.Group(); const glass = new THREE.Mesh(new THREE.SphereGeometry(0.15, 22, 16), M.std({ color: '#ffe8a0', emissive: '#ffd060', emissiveIntensity: 1.5, roughness: 0.2 })); g.add(glass); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 16), M.col('#8a8a90', 0.3, 0.8)); base.position.y = -0.18; g.add(base); g.userData.glass = glass; return shadows(g); }

// 22.40–27.20  «в Discord, а те в разговорах упоминали то погоду, то отключения электричества.»
export function buildChat() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0b10');
  scene.add(new THREE.HemisphereLight('#a0a8ff', '#100c10', 0.5));
  const key = new THREE.DirectionalLight('#ffffff', 1.4); key.position.set(2, 3, 4); scene.add(key);
  const panel = livePlane(2.4, 1.5, (g, w, h, t) => chatDraw(g, w, h, t), { px: 1024, emissive: 0.75 }); panel.position.set(0, 1.5, 0); scene.add(panel);
  box(2.5, 1.6, 0.04, M.col('#16171b', 0.4), 0, 1.5, -0.03, scene);
  const cloud = cloudIcon(); scene.add(cloud);
  const bulb = bulbIcon(); scene.add(bulb);
  const bl = new THREE.PointLight('#ffd060', 0, 3); scene.add(bl);
  const t1 = sign('ПОГОДА', { width: 0.6, color: '#ffffff', bg: '#2a6ac8', size: 100, pad: 18, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('НЕТ СВЕТА', { width: 0.65, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 18, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const W = 2.45, P = 3.1;
  function update(lt) {
    panel.userData.live.update(lt);
    const kc = pop(cloud, lt, W, 0.4, 2.2); cloud.position.set(-0.55, 2.75 + Math.sin(lt * 2) * 0.03, 0.5); cloud.userData.drops.forEach((d, i) => { d.position.y = -0.2 - ((lt * 0.8 + i * 0.17) % 0.3); }); void kc;
    pop(t1, lt, W + 0.1, 0.3); t1.position.set(-0.55, 3.15, 0.55);
    pop(bulb, lt, P, 0.35, 2.2); bulb.position.set(0.55, 2.75, 0.5); bulb.rotation.z = Math.sin(lt * 3) * 0.1;
    const off = smooth(inv(P + 0.6, P + 0.75, lt)); const fl = lt > P + 0.4 && lt < P + 0.75 ? (Math.floor(lt * 20) % 2) : 1;
    bulb.userData.glass.material.emissiveIntensity = 1.5 * (1 - off) * fl + 0.02; bl.position.set(0.55, 2.75, 0.8); bl.intensity = 3 * (1 - off) * fl * (lt > P ? 1 : 0);
    pop(t2, lt, P + 0.75, 0.3); t2.position.set(0.55, 3.15, 0.55);
    const f = kf(lt, [[0, [0.5, 1.6, 3.4], [0, 1.6, 0], 50, 0.03], [2.4, [-0.2, 2.05, 4.3], [0, 2.05, 0], 54, 0], [4.8, [0.3, 2.1, 4.1], [0, 2.1, 0], 54, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
    t1.lookAt(camera.position); t2.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 0.8 };
}

function paper(lines, w = 0.32) { return note(lines[0], { w, lines }); }
// 27.20–30.75  «Детективы всё записывали и сверяли с местными новостями,»
export function buildBoard() {
  const scene = new THREE.Scene(); const A = agencyOffice(scene);
  const items = [
    [note('ЛИВЕНЬ — 12 МАЯ', { w: 0.5, bg: '#fff3a8' }), -0.95, 1.95, 0.08],
    [note('НЕТ СВЕТА — 14 МАЯ', { w: 0.52, bg: '#fff3a8' }), -0.95, 1.45, -0.06],
    [paper(['НОВОСТИ 12.05', 'ГРОЗА НАКРЫЛА', 'ГОРОД'], 0.5), 0.2, 1.95, -0.04],
    [paper(['НОВОСТИ 14.05', 'АВАРИЯ НА ЛЭП', 'РАЙОН БЕЗ СВЕТА'], 0.5), 0.25, 1.4, 0.06],
  ];
  items.forEach(([o, x, y, r]) => { o.position.set(x, y, -3.13); o.rotation.z = r; scene.add(o); });
  const string = new THREE.Group(); scene.add(string);
  const links = [[0, 2], [1, 3]];
  const lines = links.map(([a, b]) => { const pa = items[a][0].position, pb = items[b][0].position; const geo = new THREE.CylinderGeometry(0.004, 0.004, 1, 6); const m = new THREE.Mesh(geo, M.col('#d4213a', 0.5)); string.add(m); return { m, pa: pa.clone().add(V(0, 0.08, 0.02)), pb: pb.clone().add(V(0, 0.08, 0.02)) }; });
  const det = cast6.detF(); det.root.position.set(-0.6, 0, -2.25); det.root.rotation.y = Math.PI + 0.25; scene.add(det.root);
  const t1 = sign('СВЕРЯЛИ С НОВОСТЯМИ', { width: 1.5, color: '#ffffff', bg: '#3a3e46', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    items.forEach(([o], i) => { const k = pop(o, lt, 0.1 + i * 0.35, 0.3, 2.6); void k; });
    lines.forEach((L, i) => { const k = smooth(inv(1.6 + i * 0.4, 2.0 + i * 0.4, lt)); const end = L.pa.clone().lerp(L.pb, k); const mid = L.pa.clone().add(end).multiplyScalar(0.5); const len = L.pa.distanceTo(end); L.m.visible = k > 0.01; L.m.position.copy(mid); L.m.scale.set(1, Math.max(0.001, len), 1); L.m.quaternion.setFromUnitVectors(V(0, 1, 0), end.clone().sub(L.pa).normalize()); });
    const reach = smooth(inv(0.5, 0.9, lt)) * (1 - smooth(inv(2.6, 3.0, lt)));
    det.pose({ ...STAND, rSh: [lerp(0, -140, reach), 0, -10], rEl: [lerp(-10, -20, reach), 0, 0], rCurl: 0.4, lSh: [-10, 0, 10], lEl: [-40, 0, 0], head: [-10 * reach, 0, 0] }); idle3(det, lt, 3, 0.3); det.face({ blink: 0, brows: 0.1 });
    pop(t1, lt, 1.6, 0.3);
    const f = kf(lt, [[0, [1.3, 1.7, 0.6], [-0.4, 1.7, -3.0], 52, 0.03], [3.55, [0.2, 1.75, -0.4], [-0.45, 1.75, -3.1], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.6, 0, 0.82);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.22, ao: 1.0 };
}

// 30.75–33.15  «и круг поиска постепенно сужался.»
export function buildMap() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a0e');
  scene.add(new THREE.HemisphereLight('#d8e0ff', '#1a1410', 0.25));
  const mapTex = canvasTex('map6', 1024, 1024, (g, w, h) => { g.fillStyle = '#e8e2d2'; g.fillRect(0, 0, w, h); g.fillStyle = '#cfe0c0'; g.fillRect(80, 600, 300, 300); g.fillRect(700, 120, 220, 260); g.fillStyle = '#a8c8e8'; g.beginPath(); g.moveTo(0, 420); g.bezierCurveTo(300, 380, 500, 520, 1024, 470); g.lineTo(1024, 540); g.bezierCurveTo(500, 590, 300, 450, 0, 490); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 14; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128 + 60, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 128); g.lineTo(w, i * 128 - 40); g.stroke(); } g.strokeStyle = '#f0c060'; g.lineWidth = 22; g.beginPath(); g.moveTo(0, 200); g.lineTo(w, 820); g.stroke(); g.fillStyle = '#d8cfbc'; const r = rng(2); for (let i = 0; i < 160; i++) g.fillRect(r() * w, r() * h, 20 + r() * 30, 20 + r() * 30); }, { repeat: [1, 1] });
  const table = rbox(3.2, 0.08, 3.2, 0.02, M.col('#3a2418', 0.5), 0, 0.76, 0, scene); void table;
  const map = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), M.std({ map: mapTex, roughness: 0.8 })); map.rotation.x = -Math.PI / 2; map.position.y = 0.802; map.receiveShadow = true; scene.add(map);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.96, 1.0, 64), M.emis('#ff2a3a', 2)); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.806; scene.add(ring);
  const fill = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshBasicMaterial({ color: '#ff2a3a', transparent: true, opacity: 0.12, depthWrite: false })); fill.rotation.x = -Math.PI / 2; fill.position.y = 0.805; scene.add(fill);
  const pins = []; const r = rng(7); for (let i = 0; i < 7; i++) { const p = new THREE.Group(); const h = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), M.col(i === 6 ? '#ff2a3a' : '#2a6ac8', 0.4)); h.position.y = 0.09; p.add(h); const n = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.09, 6), M.col('#c8c8cc', 0.3, 0.8)); n.position.y = 0.045; p.add(n); const a = r() * 6.28, d = i === 6 ? 0 : 0.3 + r() * 0.9; p.position.set(0.35 + Math.cos(a) * d, 0.8, -0.2 + Math.sin(a) * d); scene.add(shadows(p)); pins.push(p); }
  const lamp = new THREE.SpotLight('#fff0d8', 9, 8, 0.7, 0.5, 1.2); lamp.position.set(0.3, 3.4, 0.6); lamp.target.position.set(0.2, 0.8, -0.2); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); scene.add(lamp, lamp.target);
  const t1 = sign('КРУГ СУЖАЕТСЯ', { width: 1.0, color: '#ffffff', bg: '#d4213a', size: 100, pad: 22, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const k = smooth(inv(0.2, 2.3, lt)); const rad = lerp(1.35, 0.14, k); const cx = lerp(0, 0.35, k), cz = lerp(0, -0.2, k);
    ring.scale.setScalar(rad); fill.scale.setScalar(rad); ring.position.x = fill.position.x = cx; ring.position.z = fill.position.z = cz;
    pins.forEach((p, i) => { pop(p, lt, 0.1 + i * 0.1, 0.25, 2.6); });
    pop(t1, lt, 1.4, 0.3);
    const f = kf(lt, [[0, [0.0, 3.6, 2.0], [0, 0.8, -0.1], 52, 0], [2.4, [0.45, 2.5, 0.9], [0.32, 0.8, -0.2], 48, 0.06]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.75);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.22, ao: 0.8 };
}
