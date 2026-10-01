import * as THREE from 'three';
import { mk3 } from '../lib/cast3.js';
import { idle2 } from '../lib/human2.js';
import { gameBox, beetle, walkBug, hammer, heart } from '../lib/fantasy.js';
import { livePlane } from '../lib/stream.js';
import { sign, point, particles, fire, smoke } from '../lib/env.js';
import { desk, box, rbox } from '../lib/props.js';
import { room } from '../lib/rooms.js';
import { solid } from '../lib/overlap.js';
import { TEX, M, V, setCam, kf, inv, smooth, easeOutBack, easeInCubic, easeOutElastic, shake, lerp, clamp, rng, glowTex } from '../lib/util.js';

// the game on the dev's monitor: snowy valley, tiny hero tumbling into the sky
export function gameDraw(g, w, h, t) {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a6ab0'); gr.addColorStop(0.7, '#a8c8e8'); gr.addColorStop(1, '#e8eef4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8eef4'; g.beginPath(); g.moveTo(0, h * 0.8); for (let x = 0; x <= w; x += w / 8) g.lineTo(x, h * (0.72 + 0.06 * Math.sin(x * 0.02))); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  g.fillStyle = '#7a8090'; g.beginPath(); g.moveTo(w * 0.05, h * 0.78); g.lineTo(w * 0.12, h * 0.5); g.lineTo(w * 0.2, h * 0.78); g.fill();
  const k = (t * 0.45) % 1; const x = w * (0.3 + k * 0.5), y = h * (0.7 - k * 0.65);
  g.save(); g.translate(x, y); g.rotate(t * 8); g.fillStyle = '#7a5a3a'; g.fillRect(-10, -16, 20, 32); g.fillStyle = '#e2b08c'; g.beginPath(); g.arc(0, -22, 8, 0, 7); g.fill(); g.fillStyle = '#9aa0a8'; g.fillRect(-9, -31, 18, 6); g.restore();
  g.fillStyle = '#5a5248'; g.fillRect(w * 0.12, h * 0.48, w * 0.06, h * 0.24); g.beginPath(); g.arc(w * 0.15, h * 0.45, w * 0.035, 0, 7); g.fill();
  g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 0, w, h * 0.09); g.fillStyle = '#fff'; g.font = `${h * 0.06}px Russo`; g.textAlign = 'left'; g.fillText('BUILD 0.9.1  ·  physics', w * 0.03, h * 0.06);
}
export function officeSet(scene) {
  const R = room({ w: 7, d: 7, h: 3, wall: M.std({ color: '#d8dde2', roughness: 0.9 }), floor: M.std({ map: TEX.plywood([4, 4], '#8a6a4a'), roughness: 0.6 }), ceil: M.col('#eef0f2', 0.9), open: ['front'] }); scene.add(R);
  const accent = new THREE.Mesh(new THREE.PlaneGeometry(7, 3), M.col('#24485a', 0.9)); accent.position.set(0, 1.5, -3.48); scene.add(accent);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), M.emis('#cfe6ff', 1.2)); win.position.set(-3.48, 1.7, -0.5); win.rotation.y = Math.PI / 2; scene.add(win);
  box(0.05, 1.3, 1.7, M.col('#f2f2f2', 0.5), -3.47, 1.7, -0.5, scene);
  scene.add(new THREE.HemisphereLight('#f2f6ff', '#6a5a4a', 0.9));
  const key = new THREE.DirectionalLight('#fff4e6', 1.6); key.position.set(-3, 4, 2); key.target.position.set(0, 0.8, -1); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); scene.add(key, key.target);
  point(scene, '#ffcf94', 6, 6, [1.6, 2.2, -1.0]);
  const notes = new THREE.Group(); const cols = ['#ffe066', '#ff9aa8', '#9ae6a8', '#9ad0ff']; for (let i = 0; i < 12; i++) { const n = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), M.col(cols[i % 4], 0.8)); n.position.set(-1.6 + (i % 4) * 0.22, 1.7 + Math.floor(i / 4) * 0.22, -3.46); n.rotation.z = (i % 3 - 1) * 0.08; notes.add(n); } scene.add(notes);
  const poster = sign('ПЛАНЫ', { width: 0.9, color: '#ffffff', bg: '#24485a', size: 90, pad: 18 }); poster.position.set(-1.27, 2.45, -3.45); scene.add(poster);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.35, 16), M.col('#c8643a', 0.7)); pot.position.set(2.6, 0.175, -2.8); scene.add(pot);
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), M.col('#3a8a4a', 0.8)); l.scale.set(0.5, 1.6, 0.25); l.position.set(2.6 + Math.sin(i * 1.7) * 0.18, 0.6 + (i % 3) * 0.16, -2.8 + Math.cos(i * 1.7) * 0.12); l.rotation.z = Math.sin(i * 1.7) * 0.6; scene.add(l); }
  solid(pot, 'plant');
  return {};
}
function officeChair() {
  const g = new THREE.Group(); const m = M.col('#2a2e36', 0.5);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const l = box(0.3, 0.03, 0.05, m, Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15, g); l.rotation.y = -a; }
  box(0.05, 0.36, 0.05, M.col('#888', 0.3, 0.8), 0, 0.25, 0, g);
  rbox(0.48, 0.07, 0.46, 0.03, m, 0, 0.46, 0, g); const bk = rbox(0.46, 0.55, 0.06, 0.03, m, 0, 0.8, -0.22, g); bk.rotation.x = -0.1;
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g;
}

// 17.15–20.35  «но игрокам он так понравился, что разработчики решили его не трогать.»
export function buildDevs() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1a1e24');
  officeSet(scene);
  const dk = desk(1.8, 0.8, 0.75, '#e8e4dc'); dk.position.set(0, 0, -2.2); scene.add(solid(dk, 'desk', [], [dk.children[0]]));
  const mon = livePlane(1.05, 0.6, gameDraw, { px: 768, emissive: 0.9 }); mon.position.set(0, 1.27, -2.45); scene.add(mon);
  rbox(1.1, 0.65, 0.04, 0.01, M.col('#16181c', 0.4), 0, 1.27, -2.475, scene); box(0.06, 0.35, 0.06, M.col('#16181c', 0.4), 0, 0.95, -2.5, scene);
  const ch = officeChair(); ch.position.set(0, 0, -1.25); ch.rotation.y = Math.PI; scene.add(solid(ch, 'chair', ['dev']));
  const dev = mk3.dev(); dev.root.position.set(0, 0, -1.25); dev.root.rotation.y = Math.PI; scene.add(dev.root); dev.root.userData.allow = ['chair'];
  const dev2 = mk3.dev2(); dev2.root.position.set(0.9, 0, -1.45); dev2.root.rotation.y = Math.PI + 0.55; scene.add(dev2.root);
  const note = sign('НЕ ТРОГАТЬ!', { width: 0.36, color: '#1a1a1a', bg: '#ffe066', size: 90, pad: 20, lines: ['НЕ', 'ТРОГАТЬ!'] }); scene.add(note);
  const hearts = []; for (let i = 0; i < 8; i++) { const hh = heart(0.12); scene.add(hh); hearts.push(hh); }
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const NOTE = 2.4; const hp = new THREE.Vector3();
  function update(lt) {
    mon.userData.live.update(lt + 3);
    const laugh = Math.abs(Math.sin(lt * 11));
    dev.pose({ hipsY: -0.4, lHip: [-88, 0, 4], rHip: [-88, 0, -4], lKnee: [88, 0, 0], rKnee: [88, 0, 0], lSh: [-30, 0, 10], rSh: [-30, 0, -10], lEl: [-80, 0, 0], rEl: [-80, 0, 0], spine: [-6 - 4 * laugh, 0, 0], head: [-8 - 6 * laugh, 0, 0] });
    idle2(dev, lt, 2, 0.3); dev.face({ blink: 0, brows: 0.6, smile: 1, mouth: 0.4 + 0.4 * laugh });
    const reach = smooth(inv(NOTE - 0.6, NOTE, lt)) * (1 - smooth(inv(NOTE + 0.3, NOTE + 0.8, lt)));
    dev2.pose({ rSh: [lerp(-20, -95, reach), 0, -10], rEl: [lerp(-60, -10, reach), 0, 0], rCurl: 0.3, lSh: [-30, 0, 30], lEl: [-110, 0, 0], head: [6, 0, 0], spine: [10 * reach, 0, 0] });
    idle2(dev2, lt, 5, 0.3); dev2.face({ blink: 0, brows: 0.5, smile: 0.9, mouth: 0.25 + 0.3 * laugh });
    // the sticky note travels from her hand onto the screen
    dev2.root.updateMatrixWorld(true); dev2.J.rHand.group.getWorldPosition(hp);
    const k = clamp(inv(NOTE - 0.2, NOTE + 0.05, lt)); const target = V(0.32, 1.42, -2.42);
    note.position.copy(hp).lerp(target, k); note.rotation.set(0, lerp(-0.5, 0, k), lerp(0.4, 0.08, k)); note.visible = lt > NOTE - 0.6;
    note.scale.setScalar(lt > NOTE + 0.05 ? 1 + 0.15 * Math.exp(-(lt - NOTE) * 10) : 1);
    hearts.forEach((h, i) => { const t0 = 0.1 + i * 0.12, a = lt - t0; h.visible = a > 0; if (a <= 0) return; h.position.set(-0.35 + (i % 4) * 0.22 + Math.sin(a * 3 + i) * 0.05, 1.3 + a * 0.55, -2.35 + a * 0.4); h.scale.setScalar(0.12 * easeOutBack(clamp(a / 0.3), 2.5)); h.rotation.y = Math.sin(a * 4 + i) * 0.5; });
    const f = kf(lt, [[0, [0.5, 1.75, 0.6], [0, 1.25, -2.4], 50, 0.03], [1.5, [-0.7, 1.7, -0.4], [0.1, 1.3, -2.2], 50, 0], [3.2, [-1.25, 1.55, -1.75], [0.45, 1.25, -1.4], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 6, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.94, envIntensity: 0.35 };
}

// 48.25–52.95  «можно выпустить игру, а дальше чинить только то, что действительно раздражает игроков,»
export function buildRelease() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1a1e24');
  officeSet(scene);
  const pad = new THREE.Group(); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.12, 32), M.col('#3a3e46', 0.5, 0.5)); base.position.y = 0.06; pad.add(base);
  for (let i = 0; i < 8; i++) { const s = box(0.18, 0.125, 0.05, M.col(i % 2 ? '#ffd21f' : '#1a1a1a', 0.5), Math.cos(i / 8 * Math.PI * 2) * 0.5, 0.062, Math.sin(i / 8 * Math.PI * 2) * 0.5, pad); s.rotation.y = -i / 8 * Math.PI * 2 + Math.PI / 2; }
  pad.position.set(-1.0, 0, -1.6); scene.add(solid(pad, 'pad'));
  const gb = gameBox('FANTASY', 'ВЫХОДИТ СЕГОДНЯ'); gb.scale.setScalar(2.2); scene.add(gb);
  const flame = fire(0.5, 7); scene.add(flame); const sm = particles({ n: 40, seed: 3, tex: glowTex('rgba(255,255,255,1)'), color: '#d8dde2', additive: false, size: [0.3, 0.7], life: [0.8, 1.6], origin: [-1.0, 0.2, -1.6], spread: [0.6, 0.1, 0.6], vel: [0, 0.4, 0], velSpread: [1.2, 0.3, 1.2], grow: 2.5, opacity: 0.7 }); scene.add(sm);
  const rel = sign('РЕЛИЗ!', { width: 1.2, color: '#ffffff', bg: '#d4213a', size: 130, pad: 24, border: '#ffffff', emissive: 0.4 }); rel.position.set(-1.0, 2.35, -3.4); scene.add(rel);
  const bench = desk(1.6, 0.8, 0.8, '#e8e4dc'); bench.position.set(1.0, 0, -2.0); scene.add(solid(bench, 'bench', [], [bench.children[0]]));
  const bug = beetle({ angry: true, s: 0.5 }); bug.position.set(1.15, 0.83, -2.0); scene.add(solid(bug, 'bug', ['dev']));
  const dev = mk3.dev(); dev.root.position.set(0.85, 0, -1.25); dev.root.rotation.y = Math.PI; scene.add(dev.root);
  const ham = hammer(1.2); ham.rotation.x = Math.PI / 2; ham.position.set(0, -0.06, 0.05); dev.J.rHand.group.add(ham);
  const fixed = sign('ИСПРАВЛЕНО', { width: 1.0, color: '#ffffff', bg: '#1e9e57', size: 100, pad: 22, border: '#ffffff', emissive: 0.4 }); fixed.position.set(1.0, 1.55, -2.35); scene.add(fixed);
  const poof = particles({ n: 40, seed: 8, tex: glowTex('rgba(255,255,255,1)'), color: '#ffd0d6', size: [0.05, 0.12], life: [0.4, 0.8], origin: [1.15, 0.9, -2.0], spread: [0.1, 0.05, 0.1], vel: [0, 0.8, 0], velSpread: [1.5, 0.8, 1.5], grav: 2, opacity: 1 }); scene.add(poof);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  const LAUNCH = 0.4, HIT = 3.41;
  function update(lt) {
    const up = Math.max(0, lt - LAUNCH); const y = 0.12 + 0.46 + up * up * 3.2 + up * 0.6;
    gb.position.set(-1.0 + Math.sin(up * 9) * 0.01 * (up > 0 ? 1 : 0), y, -1.6); gb.rotation.y = up * 1.2; gb.visible = y < 9;
    flame.visible = up > 0 && y < 9; flame.position.set(-1.0, y - 0.52, -1.6); flame.rotation.x = Math.PI; flame.userData.update(lt);
    sm.visible = up > 0; sm.userData.update(up);
    const kr = easeOutBack(inv(LAUNCH + 0.3, LAUNCH + 0.7, lt), 2.4); rel.scale.setScalar(Math.max(0.001, kr)); rel.visible = lt > LAUNCH + 0.28;
    // dev with the hammer, smash at HIT
    const raise = smooth(inv(2.4, 3.1, lt)), down = easeInCubic(inv(3.15, HIT, lt));
    dev.pose({ rSh: [-40 - 120 * raise + 110 * down, 0, -12], rEl: [-60 + 40 * raise, 0, 0], rCurl: 0.85, lSh: [-25, 0, 18], lEl: [-70, 0, 0], spine: [8 + 14 * down, 0, 0], head: [20, 0, 0] });
    idle2(dev, lt, 4, 0.3); dev.face({ blink: 0, brows: -0.5 + 1.2 * clamp((lt - HIT) * 3), browTilt: 0.6, smile: lt > HIT ? 0.8 : -0.2, mouth: 0.1 });
    const sq = lt > HIT ? Math.max(0.15, 1 - (lt - HIT) * 8) : 1; bug.scale.set(0.5, 0.5 * sq, 0.5); bug.position.x = 1.15 + (lt < HIT ? Math.sin(lt * 3) * 0.06 : 0); walkBug(bug, lt * (lt < HIT ? 1 : 0), 14); bug.visible = lt < HIT + 0.5;
    poof.visible = lt > HIT; poof.userData.update(Math.max(0, lt - HIT));
    const kf2 = easeOutBack(inv(HIT + 0.15, HIT + 0.55, lt), 2.4); fixed.scale.setScalar(Math.max(0.001, kf2)); fixed.visible = lt > HIT + 0.13;
    const f = kf(lt, [[0, [-0.2, 1.4, 1.0], [-1.0, 1.0, -1.6], 54, 0.03], [1.3, [-0.3, 1.2, 0.9], [-1.0, 3.2, -1.6], 56, 0.05], [2.0, [0.4, 1.6, 0.6], [1.0, 0.95, -2.0], 52, -0.04], [3.3, [1.6, 1.5, -0.7], [1.1, 0.95, -2.0], 48, -0.02], [4.7, [1.7, 1.6, -0.5], [1.0, 1.1, -2.1], 50, 0]]);
    const hit = lt > HIT ? Math.exp(-(lt - HIT) * 7) : 0;
    setCam(camera, f.pos.add(shake(lt, 0.004 + hit * 0.03, 16, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.35 };
}
