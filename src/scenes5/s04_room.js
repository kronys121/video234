import * as THREE from 'three';
import { vx, voxelDraw, block } from '../lib/voxel.js';
import { cs } from '../lib/cs.js';
import { idle2 } from '../lib/human2.js';
import { gauge } from '../lib/fantasy.js';
import { monitor, phone } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { text3d as t3d } from '../lib/text3d.js';
const text3d = (...a) => { const g = t3d(...a); g.traverse((o) => { o.castShadow = false; }); return g; };
import { desk, box, rbox, poster } from '../lib/props.js';
import { room, calendar } from '../lib/rooms.js';
import { solid } from '../lib/overlap.js';
import { TEX, M, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, glowTex, canvasTex } from '../lib/util.js';
import { walkPose } from '../lib/human.js';

const STAND = { lSh: [0, 0, 7], rSh: [0, 0, -7] };
const SITP = { hipsY: -0.36, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0] };
const TYPEP = { ...SITP, lSh: [-33, 0, 10], rSh: [-33, 0, -10], lEl: [-82, 0, 0], rEl: [-82, 0, 0], lCurl: 0.4, rCurl: 0.4, spine: [10, 0, 0], head: [4, 0, 0] };
const pop = (o, lt, t0, d = 0.35, s = 2.4, base = 1) => { const k = easeOutBack(inv(t0, t0 + d, lt), s); o.scale.setScalar(Math.max(0.001, k * base)); o.visible = lt > t0 - 0.02; return k; };
const hud = (o, cam, dist, x, y) => { const f = new THREE.Vector3(); cam.getWorldDirection(f); const r = new THREE.Vector3().crossVectors(f, cam.up).normalize(); o.position.copy(cam.position).addScaledVector(f, dist).addScaledVector(r, x).add(V(0, y, 0)); o.quaternion.copy(cam.quaternion); };
function chair() { const g = new THREE.Group(); const m = M.col('#2a2a30', 0.5, 0.4); rbox(0.46, 0.07, 0.44, 0.02, M.col('#3a3a44', 0.8), 0, 0.52, 0, g); rbox(0.44, 0.55, 0.06, 0.02, M.col('#3a3a44', 0.8), 0, 0.85, 0.23, g); box(0.05, 0.5, 0.05, m, 0, 0.25, 0, g); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const l = box(0.26, 0.03, 0.04, m, Math.cos(a) * 0.13, 0.03, Math.sin(a) * 0.13, g); l.rotation.y = -a; } g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }

// small Stockholm-ish flat at night: desk on the back wall, dev seated facing -z
function flat(scene, draw = voxelDraw, emissive = 0.9) {
  scene.background = new THREE.Color('#0a0a10');
  const wp = canvasTex('wp5', 256, 256, (g, w, h) => { g.fillStyle = '#3a4a52'; g.fillRect(0, 0, w, h); g.fillStyle = '#40525a'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 30, h); }, { repeat: [3, 2] });
  const R = room({ w: 5.6, d: 5.6, h: 2.8, wall: M.std({ map: wp, roughness: 0.95 }), floor: M.std({ map: TEX.plywood([4, 4], '#7a5a3a'), roughness: 0.7 }), ceil: M.col('#6a6a64', 1), open: [] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#2a2018', 0.45));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), M.emis('#14244a', 0.9)); win.position.set(-1.6, 1.7, -2.755); scene.add(win);
  box(1.3, 1.2, 0.04, M.col('#e8e0d0', 0.6), -1.6, 1.7, -2.8, scene); box(0.04, 1.1, 0.04, M.col('#e8e0d0', 0.6), -1.6, 1.7, -2.73, scene);
  const p1 = poster((g, w, h) => { g.fillStyle = '#1a2a1a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 3 ? '#5ea032' : '#8a5e3a'; g.fillRect(30 + j * 60, 80 + i * 60, 56, 56); } g.fillStyle = '#fff'; g.font = '40px Russo'; g.textAlign = 'center'; g.fillText('PIXEL', w / 2, 56); }, 0.6, 0.85, 'poster5'); p1.position.set(1.6, 1.8, -2.77); scene.add(p1);
  const shelf = box(1.0, 0.04, 0.28, M.col('#5a3a24', 0.6), 1.7, 1.15, -2.65, scene); void shelf;
  [['grass', 1.35], ['stone', 1.55], ['gold', 1.8]].forEach(([t, x]) => { const b = block(t, 0.14); b.position.set(x, 1.24, -2.62); b.rotation.y = 0.3; scene.add(b); });
  const dk = desk(1.8, 0.8, 0.74, '#d8d0c0'); dk.position.set(0, 0, -2.25); scene.add(solid(dk, 'desk', [], [dk.children[0]]));
  const top = 0.77;
  const mon = monitor(0.7, draw, { emissive }); mon.position.set(0, top + mon.userData.bottom, -2.42); scene.add(mon);
  const kb = rbox(0.44, 0.025, 0.14, 0.008, M.col('#1a1a1e', 0.5), 0, top + 0.013, -2.0, scene); void kb;
  const mouse = rbox(0.06, 0.03, 0.1, 0.02, M.col('#1a1a1e', 0.5), 0.36, top + 0.015, -2.0, scene); void mouse;
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 18), M.col('#e8e4dc', 0.4)); mug.position.set(-0.6, top + 0.05, -2.1); mug.castShadow = true; scene.add(mug);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), M.emis('#ffd9a0', 5)); lamp.position.set(-0.75, top + 0.42, -2.45); scene.add(lamp);
  point(scene, '#ffc890', 8, 6, [-0.7, top + 0.6, -2.2]); point(scene, '#7ac0ff', 4, 4, [0, 1.25, -1.8]);
  const key = new THREE.SpotLight('#ffe2c0', 16, 8, 0.85, 0.6, 1.3); key.position.set(0.8, 2.7, 0.8); key.target.position.set(0, 0.9, -1.8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const ch = chair(); ch.position.set(0, 0, -1.48); scene.add(solid(ch, 'chair', ['dev']));
  const dev = vx.dev(); dev.root.position.set(0, 0, -1.48); dev.root.rotation.y = Math.PI; scene.add(dev.root); dev.root.userData.allow = ['chair'];
  return { dev, mon, top, chair: ch };
}
const typing = (D, lt, seed = 2) => { const ty = Math.sin(lt * 14) * 4; D.dev.pose({ ...TYPEP, lSh: [-33 + ty, 0, 10], rSh: [-33 - ty, 0, -10] }); idle2(D.dev, lt, seed, 0.3); };

// 7.42–10.20  «Маркус Перссон, известный как Нотч, начал делать»
export function buildRoom() {
  const scene = new THREE.Scene(); const D = flat(scene);
  const nick = sign('НОТЧ', { width: 0.3, color: '#1a1a1a', bg: '#ffe066', size: 120, pad: 18, border: '#1a1a1a' }); scene.add(nick);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    D.mon.userData.live.update(lt);
    typing(D, lt); D.dev.face({ blink: 0, brows: 0.3, smile: 0.4 });
    pop(nick, lt, 1.52, 0.35); nick.position.set(-0.22, 1.36, -2.39); nick.rotation.z = 0.08;
    const f = kf(lt, [[0, [2.2, 1.7, 0.6], [0, 1.15, -1.9], 54, 0.03], [2.78, [1.6, 1.45, -0.9], [-0.2, 1.25, -2.0], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}

// 10.20–12.62  «Minecraft в 2009 году в одиночку.»
export function buildSolo() {
  const scene = new THREE.Scene(); const D = flat(scene);
  const yr = text3d('2009', { family: 'mont', size: 0.38, depth: 0.1, bevel: 0.014, color: '#ffffff', side: '#3a8a2a', emissive: '#5ac03a', emissiveIntensity: 0.3 }); yr.position.set(0, 2.25, -2.5); scene.add(yr);
  const solo = sign('В ОДИНОЧКУ', { width: 1.4, color: '#ffffff', bg: '#2a6ac8', size: 100, pad: 22, border: '#ffffff' }); scene.add(solo);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 60);
  function update(lt) {
    D.mon.userData.live.update(lt * 1.5 + 3);
    typing(D, lt, 4); D.dev.face({ blink: 0, brows: 0.2, smile: 0.3 });
    const k = easeOutElastic(inv(0.1, 0.7, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.08; yr.rotation.y = Math.sin(lt * 1.6) * 0.15;
    pop(solo, lt, 1.55, 0.35);
    const f = kf(lt, [[0, [0.8, 1.7, 0.4], [0, 1.5, -2.2], 54, 0.02], [2.42, [-1.9, 2.3, 2.3], [0, 1.2, -1.6], 58, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 3)), f.look, f.roll, f.fov);
    hud(solo, camera, 3.2, 0, -0.62);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}

// dark stage with the dev standing in a spotlight
function stage(scene, col = '#100a14') {
  scene.background = new THREE.Color(col);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), M.std({ color: '#1a1820', roughness: 0.5, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#a0a8ff', '#100810', 0.35));
  const spot = new THREE.SpotLight('#ffe8d0', 34, 12, 0.42, 0.5, 1.2); spot.position.set(0.5, 6.5, 1.5); spot.target.position.set(0, 0.8, 0); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); scene.add(spot, spot.target);
  const dev = vx.dev(); scene.add(dev.root);
  return { dev, spot };
}
function bubble(text, w = 1.2) { const s = sign(text, { width: w, color: '#1a1a1a', bg: '#f4f4f0', size: 80, pad: 22, border: '#c43a3a' }); return s; }

// 18.05–20.45  «Но вместе с успехом пришли критика, давление»
export function buildCritics() {
  const scene = new THREE.Scene(); const S = stage(scene);
  const msgs = ['ВЕРНИ КАК БЫЛО!', 'ГДЕ ОБНОВЛЕНИЕ?', 'ВСЁ СЛОМАЛ!', 'ХУЖЕ НЕКУДА', 'ПОЧЕМУ ТАК?', 'ПЛОХОЕ РЕШЕНИЕ'].map((t, i) => { const b = bubble(t, 0.9); scene.add(b); return b; });
  const crit = sign('КРИТИКА', { width: 1.5, color: '#ffffff', bg: '#d4213a', size: 120, pad: 24, border: '#ffffff', emissive: 0.2 }); scene.add(crit);
  const gg = gauge('ДАВЛЕНИЕ'); gg.scale.setScalar(0.9); scene.add(gg);
  point(scene, '#ff4a4a', 10, 6, [0, 2.5, 1.5]);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 100);
  const POS = [[-0.85, 2.6, 0.4], [0.85, 2.3, 0.3], [-0.9, 1.5, 0.6], [0.85, 1.25, 0.6], [-0.75, 0.75, 0.9], [0.75, 3.15, 0.2]];
  function update(lt) {
    const shrink = smooth(inv(0.2, 1.2, lt));
    S.dev.pose({ ...STAND, lSh: [-10 * shrink, 0, 18 * shrink + 7], rSh: [-10 * shrink, 0, -18 * shrink - 7], lEl: [-40 * shrink, 0, 0], rEl: [-40 * shrink, 0, 0], spine: [10 * shrink, 0, 0], head: [14 * shrink, 0, 0] }); idle2(S.dev, lt, 3, 0.5);
    S.dev.face({ blink: 0, brows: -0.5 - 0.4 * shrink, mouth: 0.15, look: [0, -0.1] });
    msgs.forEach((b, i) => { const t0 = 0.05 + i * 0.16; const k = pop(b, lt, t0, 0.3, 2.6); const [x, y, z] = POS[i]; b.position.set(x * (1.3 - 0.3 * k), y + Math.sin(lt * 2 + i) * 0.04, z); b.rotation.z = (i % 2 ? -1 : 1) * 0.08; });
    pop(crit, lt, 1.36, 0.3); crit.position.set(0, 3.85, 0.1);
    pop(gg, lt, 1.8, 0.3, 2.4, 0.9); gg.position.set(0, 0.3, 1.2); gg.userData.needle.rotation.z = lerp(-1.3, 1.25, smooth(inv(1.9, 2.3, lt))) + Math.sin(lt * 30) * 0.03 * (lt > 2.2 ? 1 : 0);
    const f = kf(lt, [[0, [0.5, 1.9, 6.6], [0, 1.9, 0], 56, 0.03], [2.4, [-0.4, 1.7, 5.4], [0, 1.9, 0.2], 56, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004 + 0.012 * inv(1.8, 2.4, lt), 12, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.2 };
}

function notifDraw(seed) { return (g, w, h, t) => { g.fillStyle = '#101418'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a6a8a'; for (let i = 0; i < 6; i++) { g.fillRect(w * 0.08, h * (0.14 + i * 0.13), w * 0.84, h * 0.1); } g.fillStyle = '#e8423a'; g.beginPath(); g.arc(w * 0.8, h * 0.08, w * 0.16, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = `${Math.round(w * 0.14)}px Russo`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(Math.min(999, 120 + Math.floor(t * 300 + seed * 77))) + (t > 1 ? '+' : ''), w * 0.8, h * 0.085); }; }

// 20.45–22.48  «и постоянное внимание.»
export function buildAttention() {
  const scene = new THREE.Scene(); const S = stage(scene, '#0a0c14');
  const phones = []; for (let i = 0; i < 9; i++) { const p = phone(notifDraw(i), 0.22); scene.add(p); phones.push(p); }
  const beams = []; for (let i = 0; i < 4; i++) { const bm = new THREE.Mesh(new THREE.ConeGeometry(0.7, 8, 24, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe8c0', transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); scene.add(bm); beams.push(bm); }
  const att = sign('ВНИМАНИЕ', { width: 1.6, color: '#1a1a1a', bg: '#ffd23a', size: 120, pad: 24, border: '#1a1a1a' }); scene.add(att);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 100);
  const rr = rng(8); const PP = phones.map((_, i) => { const a = -1.2 + i * 0.3; return [Math.sin(a) * 1.35, 0.9 + rr() * 1.7, 0.3 + Math.cos(a) * 0.9 - 0.5]; });
  function update(lt) {
    S.dev.pose({ ...STAND, lSh: [-8, 0, 12], rSh: [-8, 0, -12], head: [0, Math.sin(lt * 1.8) * 25, 0] }); idle2(S.dev, lt, 6, 0.4);
    S.dev.face({ blink: 0, brows: 0.6, mouth: 0.2, look: [Math.sin(lt * 1.8) * 0.4, 0] });
    phones.forEach((p, i) => { p.userData.live.update(lt); const [x, y, z] = PP[i]; const k = pop(p, lt, 0.05 + i * 0.07, 0.3, 2.6); p.position.set(x, y + Math.sin(lt * 2 + i) * 0.05, z); p.lookAt(0, 1.6, 6); void k; });
    beams.forEach((b, i) => { const a = i * 1.57 + 0.6; b.position.set(Math.cos(a) * 2.2, 4.2, Math.sin(a) * 2.2 - 0.3); b.lookAt(0, 0.9, 0); b.rotateX(-Math.PI / 2); b.material.opacity = 0.035 * smooth(inv(0.6 + i * 0.1, 1.0 + i * 0.1, lt)); });
    pop(att, lt, 0.98, 0.3); att.position.set(0, 3.25, 0.2);
    const f = kf(lt, [[0, [-1.6, 1.4, 4.6], [0, 1.6, 0], 56, 0.04], [2.03, [1.2, 1.8, 5.0], [0, 1.9, 0], 56, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.005, 6, 2)), f.look, f.roll, f.fov);
    att.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.2 };
}

const POST = ['Я не чувствую себя', 'подходящим человеком', 'для руководства', 'таким огромным', 'проектом.'];
function blogDraw(g, w, h, t) {
  g.fillStyle = '#e4e2dc'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a30'; g.fillRect(0, 0, w, h * 0.12); g.fillStyle = '#ffffff'; g.font = `${Math.round(h * 0.06)}px Russo`; g.textAlign = 'left'; g.fillText('БЛОГ  •  2014', w * 0.04, h * 0.08);
  const chars = Math.floor(t * 26); let left = chars; g.fillStyle = '#1a1a1a'; g.font = `${Math.round(h * 0.085)}px Russo`;
  POST.forEach((line, i) => { if (left <= 0) return; const s = line.slice(0, left); left -= line.length; g.fillText(s, w * 0.06, h * (0.28 + i * 0.14)); if (left <= 0 && Math.floor(t * 3) % 2 === 0) { const m = g.measureText(s).width; g.fillRect(w * 0.06 + m + 4, h * (0.28 + i * 0.14) - h * 0.07, 4, h * 0.08); } });
}
// 22.48–25.75  «В 2014 году Перссон написал, что не чувствует себя»
export function buildBlog() {
  const scene = new THREE.Scene(); const D = flat(scene, blogDraw, 0.35);
  const yr = text3d('2014', { family: 'mont', size: 0.38, depth: 0.1, bevel: 0.014, color: '#ffffff', side: '#a83a2a', emissive: '#e04a3a', emissiveIntensity: 0.3 }); yr.position.set(0, 2.3, -2.5); scene.add(yr);
  const wrote = sign('НАПИСАЛ', { width: 0.55, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 20, border: '#ffffff' }); scene.add(wrote);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    D.mon.userData.live.update(Math.max(0, lt - 1.4));
    const ty = lt > 1.4 ? Math.sin(lt * 14) * 4 : 0; D.dev.pose({ ...TYPEP, lSh: [-33 + ty, 0, 10], rSh: [-33 - ty, 0, -10], head: [10, 0, 0] }); idle2(D.dev, lt, 7, 0.3);
    D.dev.face({ blink: 0, brows: -0.4, mouth: 0.05 });
    const k = easeOutElastic(inv(0.15, 0.75, lt)) * (1 - smooth(inv(1.2, 1.5, lt))); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.13 && lt < 1.5;
    pop(wrote, lt, 1.98, 0.3);
    const f = kf(lt, [[0, [1.6, 2.0, 0.8], [0, 1.7, -2.3], 54, 0.03], [1.5, [0.85, 1.65, -0.9], [-0.05, 1.22, -2.42], 46, 0], [3.27, [0.7, 1.6, -1.2], [-0.05, 1.2, -2.42], 42, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(wrote, camera, 2.0, 0, 0.5);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.12, bloomThreshold: 0.95, envIntensity: 0.25 };
}

// 29.42–32.30  «В сентябре того же года Mojang купила Microsoft»
export function buildDeal() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0e0d10');
  const wall = canvasTex('offw5', 256, 256, (g, w, h) => { g.fillStyle = '#e4e0d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#dcd8d0'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 32, h); }, { repeat: [3, 2] });
  const R = room({ w: 7, d: 7, h: 3, wall: M.std({ map: wall, roughness: 0.9 }), floor: M.std({ map: TEX.carpet([5, 5], '#4a505a'), roughness: 1 }), ceil: M.col('#d8d8d4', 1), open: ['front'] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#e8eeff', '#30281e', 0.7));
  const tb = desk(2.2, 1.1, 0.76, '#e8e8ea'); scene.add(solid(tb, 'table', [], [tb.children[0]])); const top = 0.79;
  const ex = cs.exec(); ex.root.position.set(0, 0, -1.0); scene.add(ex.root);
  const dev = vx.dev(); dev.root.position.set(0, 0, 0.98); dev.root.rotation.y = Math.PI; scene.add(dev.root);
  const cal = calendar('СЕНТЯБРЬ', '2014'); cal.scale.setScalar(2.2); cal.position.set(-1.9, 1.9, -3.47); scene.add(cal);
  const ms = sign('MICROSOFT', { width: 1.6, color: '#2a2a30', size: 120, pad: 16 }); ms.position.set(0.9, 2.3, -3.47); scene.add(ms);
  const card = sign('MOJANG', { width: 0.36, color: '#ffffff', bg: '#d8322a', size: 100, pad: 16 }); card.rotation.set(-Math.PI / 2, 0, Math.PI); card.position.set(-0.4, top + 0.004, 0.25); scene.add(card);
  const paper = canvasTex('contract5', 300, 400, (g, w, h) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = '34px Russo'; g.textAlign = 'center'; g.fillText('ДОГОВОР', w / 2, 52); g.fillStyle = '#9a9488'; for (let y = 90; y < 330; y += 22) g.fillRect(30, y, w - 60 - ((y * 7) % 50), 6); }, { repeat: [1, 1] });
  const doc = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), M.std({ map: paper, roughness: 0.8 })); doc.rotation.x = -Math.PI / 2; doc.rotation.z = 0.08; doc.position.set(0.1, top + 0.003, 0.0); doc.receiveShadow = true; scene.add(doc);
  const stamp = sign('КУПЛЕНО', { width: 0.36, color: '#d4213a', size: 110, pad: 14, border: '#d4213a' }); stamp.rotation.set(-Math.PI / 2, 0, 0.35); scene.add(stamp);
  const mb = block('grass', 0.22); mb.position.set(-0.55, top + 0.11, -0.1); scene.add(mb);
  point(scene, '#fff0dc', 10, 7, [0, 2.6, 0.5]);
  const key = new THREE.SpotLight('#fff0dc', 20, 10, 0.8, 0.6, 1.3); key.position.set(1.8, 2.9, 2.5); key.target.position.set(0, 0.9, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 60);
  const BUY = 1.76;
  function update(lt) {
    pop(cal, lt, 0.15, 0.35, 2.4, 2.2);
    const down = lt < BUY ? smooth(inv(BUY - 0.45, BUY, lt)) : 1 - smooth(inv(BUY + 0.1, BUY + 0.5, lt));
    ex.pose({ ...STAND, spine: [12 * down, 0, 0], rSh: [-30 - 30 * down, 0, -10], rEl: [-40 + 10 * down, 0, 0], rCurl: 0.8, lSh: [-10, 0, 10], lEl: [-20, 0, 0] }); idle2(ex, lt, 4, 0.3);
    ex.face({ blink: 0, brows: 0.3, smile: 0.8, mouth: lt > BUY ? 0.3 : 0 });
    dev.pose({ ...STAND, lSh: [-8, 0, 10], rSh: [-8, 0, -10], head: [8, 0, 0] }); idle2(dev, lt, 2, 0.4); dev.face({ blink: 0, smile: 0.3, brows: 0.1 });
    const ks = easeOutBack(inv(BUY, BUY + 0.18, lt), 3); stamp.scale.setScalar(Math.max(0.001, lt < BUY ? 0.001 : 1.4 - 0.4 * ks)); stamp.visible = lt > BUY; stamp.position.set(0.1, top + 0.008, 0.0);
    pop(ms, lt, 2.3, 0.3);
    const f = kf(lt, [[0, [-1.8, 2.0, 2.6], [-0.8, 1.6, -2.0], 54, 0.03], [1.4, [2.9, 2.2, 1.2], [0, 1.0, -0.1], 60, 0.0], [2.88, [3.3, 2.6, 1.5], [0, 1.1, 0], 64, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, lt > BUY && lt < BUY + 0.3 ? 0.02 : 0.004, 18, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}

// 34.80–36.92  «а сам Нотч ушёл из компании.»
export function buildExit() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0e0d10');
  const R = room({ w: 3.2, d: 9, h: 2.9, wall: M.std({ color: '#e4e0d8', roughness: 0.9 }), floor: M.std({ map: TEX.plywood([2, 6], '#9a7a5a'), roughness: 0.6 }), ceil: M.col('#d8d8d4', 1), open: ['front', 'back'] }); R.position.z = -2.5; scene.add(R);
  // back wall with a doorway full of daylight
  const wm = M.std({ color: '#e4e0d8', roughness: 0.9 });
  box(1.0, 2.9, 0.1, wm, -1.1, 1.45, -7.0, scene); box(1.0, 2.9, 0.1, wm, 1.1, 1.45, -7.0, scene); box(1.2, 0.7, 0.1, wm, 0, 2.55, -7.0, scene);
  const light = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), M.emis('#fff4dc', 3)); light.position.set(0, 1.1, -7.3); scene.add(light);
  const door = new THREE.Group(); box(1.2, 2.2, 0.05, M.col('#7a5a3a', 0.6), 0.6, 1.1, 0, door); door.position.set(-0.6, 0, -6.95); scene.add(door);
  const exitS = sign('ВЫХОД', { width: 0.5, color: '#ffffff', bg: '#1a9a4a', size: 90, pad: 14, emissive: 0.8 }); exitS.position.set(0, 2.62, -6.93); scene.add(exitS);
  const lg = text3d('MOJANG', { family: 'russo', size: 0.22, depth: 0.05, bevel: 0.006, color: '#e8423a', side: '#8a1a14' }); lg.position.set(-1.58, 1.9, -3.0); lg.rotation.y = Math.PI / 2; scene.add(lg);
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.15), M.emis('#ffffff', 1.2)); p.rotation.x = Math.PI / 2; p.position.set(0, 2.88, -1 - i * 1.6); scene.add(p); }
  scene.add(new THREE.HemisphereLight('#f0f0ff', '#3a3028', 0.8));
  const sunIn = new THREE.SpotLight('#fff0d0', 30, 12, 0.5, 0.5, 1.2); sunIn.position.set(0, 1.8, -7.6); sunIn.target.position.set(0, 0, -2); sunIn.castShadow = true; sunIn.shadow.mapSize.set(2048, 2048); scene.add(sunIn, sunIn.target);
  const dev = vx.dev(); dev.root.rotation.y = Math.PI; scene.add(dev.root);
  const box1 = new THREE.Group(); rbox(0.42, 0.28, 0.32, 0.01, M.std({ map: TEX.cardboard(), roughness: 0.95 }), 0, 0, 0, box1); const b2 = block('grass', 0.12); b2.position.set(0.08, 0.17, 0); box1.add(b2); scene.add(box1);
  const left = sign('УШЁЛ', { width: 0.9, color: '#ffffff', bg: '#d4213a', size: 120, pad: 20, border: '#ffffff' }); scene.add(left);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  const lh = new THREE.Vector3(), rh = new THREE.Vector3();
  function update(lt) {
    const z = lerp(-1.2, -6.3, smooth(inv(0, 2.1, lt)) * 0.3 + inv(0, 2.1, lt) * 0.7);
    const wp = walkPose(lt * 1.6, 0.9);
    dev.pose({ ...wp, lSh: [-40, 0, 14], rSh: [-40, 0, -14], lEl: [-55, 0, 0], rEl: [-55, 0, 0], lCurl: 0.7, rCurl: 0.7 }); idle2(dev, lt, 1, 0.2); dev.face({ blink: 0, smile: 0.2 });
    dev.root.position.set(0, 0, z);
    dev.root.updateMatrixWorld(true); dev.J.lHand.group.getWorldPosition(lh); dev.J.rHand.group.getWorldPosition(rh); box1.position.copy(lh).add(rh).multiplyScalar(0.5).add(V(0, 0.06, -0.1)); box1.rotation.y = Math.PI;
    door.rotation.y = -1.4 * (1 - smooth(inv(1.7, 2.1, lt)));
    pop(left, lt, 0.58, 0.3);
    const f = kf(lt, [[0, [0.4, 1.7, 1.6], [0, 1.3, -4], 54, 0.02], [2.12, [-0.3, 1.6, -0.6], [0, 1.4, -6.5], 52, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 3)), f.look, f.roll, f.fov);
    hud(left, camera, 2.4, 0, 0.55);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.85, envIntensity: 0.25 };
}
