import * as THREE from 'three';
import { cs, HOLD_RIFLE, ghostify, desertTown, woodCrate, aim } from '../lib/cs.js';
import { idle2 } from '../lib/human2.js';
import { sign, point } from '../lib/env.js';
import { text3d } from '../lib/text3d.js';
import { box } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { M, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, glowTex, canvasTex } from '../lib/util.js';

const AIM = { ...HOLD_RIFLE };
const ready = (H, lt, seed) => { H.pose({ ...AIM, lHip: [-8, 0, 4], rHip: [10, 0, -4], lKnee: [12, 0, 0], rKnee: [6, 0, 0] }); idle2(H, lt, seed, 0.5); aim(H, 0.05); };

// 12.70–16.70  «мод Counter-Strike, где команда террористов сражается с контртеррористами.»
export function buildTeams() {
  const scene = new THREE.Scene(); desertTown(scene);
  const crates = [[-0.2, -2.6, 1], [1.0, -2.0, 0.7]].map(([x, z, s], i) => { const c = woodCrate(s); c.position.set(x, 0, z); c.rotation.y = i * 0.4; scene.add(solid(c, 'crate' + i)); return c; });
  void crates;
  const T = [cs.t('t1'), cs.t('t2')], CT = [cs.ct('ct1'), cs.ct('ct2')];
  T.forEach((h, i) => { h.root.position.set(-1.9 - i * 0.75, 0, -0.6 + i * 1.1); h.root.rotation.y = Math.PI / 2 + 0.15 - i * 0.3; scene.add(h.root); });
  CT.forEach((h, i) => { h.root.position.set(1.9 + i * 0.75, 0, -0.4 + i * 1.1); h.root.rotation.y = -Math.PI / 2 - 0.15 + i * 0.3; scene.add(h.root); });
  const title = text3d('COUNTER-STRIKE', { family: 'russo', size: 0.155, depth: 0.12, bevel: 0.016, color: '#ffffff', side: '#c86a1a', emissive: '#ff9a3a', emissiveIntensity: 0.25 }); title.position.set(0, 3.3, -3.5); scene.add(title);
  const tS = sign('ТЕРРОРИСТЫ', { width: 1.25, color: '#ffffff', bg: '#b8322a', size: 100, pad: 24, border: '#ffffff', emissive: 0.4 }); scene.add(tS);
  const cS = sign('КОНТРТЕРРОРИСТЫ', { width: 1.5, color: '#ffffff', bg: '#2a5aa8', size: 100, pad: 24, border: '#ffffff', emissive: 0.4 }); scene.add(cS);
  const vs = text3d('VS', { family: 'mont', size: 0.5, depth: 0.12, bevel: 0.015, color: '#ffd23a', side: '#a86a10', emissive: '#ffb020', emissiveIntensity: 0.3 }); vs.position.set(0, 1.5, 0.2); scene.add(vs);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 200);
  const TT = 1.36, CTT = 2.67;
  function update(lt) {
    T.forEach((h, i) => { ready(h, lt, i * 3); h.face({ blink: 0, brows: -0.4 }); });
    CT.forEach((h, i) => { ready(h, lt, 10 + i * 3); h.face({ blink: 0, brows: -0.3 }); });
    const kt = easeOutBack(inv(0.05, 0.5, lt), 2.0); title.scale.setScalar(Math.max(0.001, kt)); title.visible = lt > 0.04; 
    const a = easeOutBack(inv(TT, TT + 0.35, lt), 2.4); tS.scale.setScalar(Math.max(0.001, a)); tS.visible = lt > TT - 0.02; tS.position.set(-1.45, 2.35, 0.3); tS.lookAt(camera.position);
    const b = easeOutBack(inv(CTT, CTT + 0.35, lt), 2.4); cS.scale.setScalar(Math.max(0.001, b)); cS.visible = lt > CTT - 0.02; cS.position.set(1.45, 2.05, 0.3); cS.lookAt(camera.position);
    const kv = easeOutElastic(inv(CTT + 0.3, CTT + 0.9, lt)); vs.scale.setScalar(Math.max(0.001, kv)); vs.visible = lt > CTT + 0.28; vs.rotation.y = Math.sin(lt * 3) * 0.3;
    const f = kf(lt, [[0, [0, 2.6, 9.5], [0, 2.4, -2], 58, 0], [1.4, [-1.6, 1.9, 6.4], [-2.4, 1.3, 0], 54, 0.04], [2.7, [1.6, 1.9, 6.4], [2.4, 1.3, 0], 54, -0.04], [4.0, [0, 2.4, 10.5], [0, 1.4, 0], 58, 0]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 4, 2)), f.look, f.roll, f.fov);
    // signs face the camera after it moves
    tS.lookAt(camera.position); cS.lookAt(camera.position);
    { const fw = new THREE.Vector3(); camera.getWorldDirection(fw); title.position.copy(camera.position).addScaledVector(fw, 4.5).add(V(0, 1.55, 0)); title.quaternion.copy(camera.quaternion); title.rotateY(Math.sin(lt * 1.5) * 0.12); }
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.2, bloomThreshold: 0.95, envIntensity: 0.3 };
}

// 16.70–18.72  «Раундов с возрождением не было:»
export function buildNoRespawn() {
  const scene = new THREE.Scene(); desertTown(scene);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 48), M.emis('#3aff9a', 2.2)); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.02, 0); scene.add(ring);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.08, 40), M.col('#3a3e46', 0.4, 0.6)); disc.position.y = 0.04; scene.add(disc); ring.position.y = 0.085;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 3.2, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#3aff9a', transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 1.7; scene.add(beam);
  const lab = sign('ВОЗРОЖДЕНИЕ', { width: 1.7, color: '#ffffff', bg: '#1e6a4a', size: 100, pad: 24, border: '#9fffd0', emissive: 0.5 }); lab.position.set(0, 3.7, 0); scene.add(lab);
  const x1 = box(2.0, 0.2, 0.06, M.emis('#ff2a3a', 2.2)), x2 = box(2.0, 0.2, 0.06, M.emis('#ff2a3a', 2.2)); const X = new THREE.Group(); X.add(x1, x2); x1.rotation.z = 0.7; x2.rotation.z = -0.7; X.position.set(0, 3.7, 0.08); scene.add(X);
  const no = sign('НЕТ', { width: 1.0, color: '#ffffff', bg: '#d4213a', size: 120, pad: 20, border: '#ffffff', emissive: 0.5 }); no.position.set(0, 2.85, 0.2); scene.add(no);
  const gl = point(scene, '#3aff9a', 8, 6, [0, 1.2, 0.4]);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 200);
  const NO = 1.29;
  function update(lt) {
    const off = smooth(inv(NO, NO + 0.3, lt)); const fl = off > 0 && off < 1 ? (Math.floor(lt * 30) % 2) : 0;
    const on = (1 - off) * (0.85 + 0.15 * Math.sin(lt * 9)) + fl * 0.5;
    ring.material.emissiveIntensity = 2.2 * on; beam.material.opacity = 0.25 * on; beam.scale.set(1, 0.4 + 0.6 * on, 1); beam.position.y = 0.1 + 1.6 * (0.4 + 0.6 * on); gl.intensity = 8 * on;
    const kx = easeOutBack(inv(NO, NO + 0.3, lt), 2.6); X.scale.setScalar(Math.max(0.001, kx)); X.visible = lt > NO - 0.02;
    const kn = easeOutBack(inv(NO + 0.15, NO + 0.45, lt), 2.6); no.scale.setScalar(Math.max(0.001, kn)); no.visible = lt > NO + 0.13;
    const f = kf(lt, [[0, [2.2, 2.0, 6.6], [0, 1.7, 0], 60, 0.06], [2.02, [-0.9, 2.3, 5.8], [0, 1.9, 0], 58, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, lt > NO ? 0.02 * (1 - inv(NO, NO + 0.5, lt)) + 0.004 : 0.004, 18, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.4, bloomThreshold: 0.85, envIntensity: 0.3 };
}

// 18.72–21.15  «погиб, значит ждёшь следующего раунда.»
export function buildGhost() {
  const scene = new THREE.Scene(); desertTown(scene);
  const body = cs.t('body'); body.root.position.set(-0.3, 0.13, 0.4); body.root.rotation.set(-Math.PI / 2, 0, 0.3); scene.add(body.root); body.root.userData.solid = null;
  body.pose({ lSh: [0, 0, 60], rSh: [0, 0, -50], lEl: [-20, 0, 0], rEl: [-30, 0, 0], lHip: [0, 0, 10], rHip: [0, 0, -8] });
  body.face({ blink: 1, mouth: 0.1 });
  const cr = woodCrate(0.5); cr.position.set(1.1, 0, -0.6); scene.add(solid(cr, 'crate', ['ghost']));
  const ghost = ghostify(cs.t('ghost', false), '#9fd6ff'); scene.add(ghost.root);
  const clock = sign('0:15', { width: 0.9, color: '#ffffff', bg: '#1a1a22', size: 120, pad: 20, border: '#ffd23a', emissive: 0.6 }); scene.add(clock);
  const live = canvasTex('round2', 512, 160, () => {}, { repeat: [1, 1] }); void live;
  const rnd = sign('СЛЕДУЮЩИЙ РАУНД', { width: 1.7, color: '#1a1a1a', bg: '#ffd23a', size: 90, pad: 22, border: '#1a1a1a' }); scene.add(rnd);
  // countdown texture redrawn from time
  const cv = document.createElement('canvas'); cv.width = 384; cv.height = 160; const ctx = cv.getContext('2d'); const ctex = new THREE.CanvasTexture(cv); ctex.colorSpace = THREE.SRGBColorSpace;
  clock.material.map = ctex; clock.material.emissiveMap = ctex; let last = -1;
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 200);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(160,214,255,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 })); glow.scale.set(1.6, 2.4, 1); scene.add(glow);
  function update(lt) {
    // ghost rises out of the body, drifts to the crate and sits down to wait
    const rise = smooth(inv(0.1, 0.9, lt)), go = smooth(inv(0.8, 1.6, lt));
    const sit = { hipsY: -0.42, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0], lSh: [-20, 0, 12], rSh: [-20, 0, -12], lEl: [-60, 0, 0], rEl: [-60, 0, 0], spine: [12, 0, 0], head: [10, 0, 0] };
    ghost.pose(go > 0.5 ? sit : { lSh: [0, 0, 20], rSh: [0, 0, -20] }); idle2(ghost, lt, 2, 0.5);
    ghost.face({ blink: 0, brows: -0.6, mouth: 0.05 });
    const px = lerp(-0.3, 1.1, go), pz = lerp(0.4, -0.45, go);
    const py = go > 0.5 ? 0.08 : lerp(0, 0.6, rise) * (1 - go * 2) + Math.sin(lt * 3) * 0.04;
    ghost.root.position.set(px, Math.max(0, py), pz); ghost.root.rotation.y = lerp(0, 0.5, go);
    ghost.root.visible = lt > 0.08;
    glow.position.set(px, 1.2 + py, pz); glow.material.opacity = 0.45 * rise;
    const sec = Math.max(0, 15 - Math.floor(lt * 4)); if (sec !== last) { last = sec; ctx.fillStyle = '#1a1a22'; ctx.fillRect(0, 0, 384, 160); ctx.strokeStyle = '#ffd23a'; ctx.lineWidth = 8; ctx.strokeRect(6, 6, 372, 148); ctx.fillStyle = '#ffffff'; ctx.font = '110px Russo'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(`0:${String(sec).padStart(2, '0')}`, 192, 86); ctex.needsUpdate = true; }
    const kc = easeOutBack(inv(0.9, 1.25, lt), 2.4); clock.scale.setScalar(Math.max(0.001, kc)); clock.visible = lt > 0.88; clock.position.set(1.1, 2.55, -0.6);
    const kr = easeOutBack(inv(0.65, 1.0, lt), 2.4); rnd.scale.setScalar(Math.max(0.001, kr)); rnd.visible = lt > 0.63; rnd.position.set(0.4, 3.3, -0.8);
    const f = kf(lt, [[0, [-1.6, 2.6, 3.8], [-0.1, 0.8, 0.0], 56, 0.05], [2.43, [0.9, 2.3, 5.2], [0.5, 1.5, -0.4], 56, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 3)), f.look, f.roll, f.fov);
    clock.lookAt(camera.position); rnd.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.3 };
}

// 21.15–23.65  «Из-за этого каждый выстрел ощущался важным,»
export function buildPeek() {
  const scene = new THREE.Scene(); desertTown(scene);
  const h = cs.ct('ct'); h.root.position.set(-6.2, 0, 1.5); h.root.rotation.y = Math.PI * 0.56; scene.add(h.root);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,220,140,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flash.scale.setScalar(0.6); scene.add(flash);
  const fl = new THREE.PointLight('#ffc070', 0, 6, 1.5); scene.add(fl);
  const hp = sign('1 ЖИЗНЬ', { width: 0.8, color: '#ffffff', bg: '#c4213a', size: 110, pad: 20, border: '#ffffff', emissive: 0.5 }); hp.material.depthTest = false; hp.renderOrder = 10; scene.add(hp);
  const shot = sign('КАЖДЫЙ ВЫСТРЕЛ', { width: 1.15, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 22, border: '#1a1a1a' }); scene.add(shot);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.03, 200);
  const SHOT = 1.21; const mz = new THREE.Vector3();
  function update(lt) {
    const peek = smooth(inv(0.2, 0.9, lt));
    const rec = lt > SHOT ? Math.exp(-(lt - SHOT) * 10) : 0;
    h.pose({ ...AIM, rSh: [AIM.rSh[0] - 12 - rec * 14, 0, -12], lSh: [AIM.lSh[0] - 12 - rec * 14, 0, 28], lHip: [-20, 0, 6], rHip: [8, 0, -4], lKnee: [30, 0, 0], rKnee: [10, 0, 0], spine: [6, 0, 8 * (1 - peek)], head: [2, -5, 0] });
    h.face({ blink: 0, brows: -0.7, mouth: 0 }); aim(h, 0.04 + rec * 0.15);
    h.root.position.set(lerp(-6.4, -5.75, peek), 0, 1.5);
    h.root.updateMatrixWorld(true); h.gun.localToWorld(mz.set(0, 0, 0.68));
    const f1 = lt > SHOT && lt < SHOT + 0.1; flash.visible = f1; flash.position.copy(mz); flash.scale.setScalar(0.7 + Math.random() * 0); fl.position.copy(mz); fl.intensity = f1 ? 30 : 0;
    const kh = easeOutBack(inv(0.3, 0.6, lt), 2.4); hp.scale.setScalar(Math.max(0.001, kh)); hp.visible = lt > 0.28;
    const ks = easeOutBack(inv(0.85, 1.15, lt), 2.4); shot.scale.setScalar(Math.max(0.001, ks)); shot.visible = lt > 0.83;
    const f = kf(lt, [[0, [-7.6, 1.9, 3.6], [-4.0, 1.2, 0.6], 56, 0.03], [2.5, [-7.3, 1.75, 3.1], [-3.6, 1.3, 0.4], 50, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003 + rec * 0.05, 25, 2)), f.look, f.roll, f.fov);
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); const rt = new THREE.Vector3().crossVectors(fw, camera.up).normalize();
    hp.position.copy(camera.position).addScaledVector(fw, 2.6).addScaledVector(rt, 0.12).add(V(0, 0.62, 0)); hp.quaternion.copy(camera.quaternion);
    shot.position.copy(camera.position).addScaledVector(fw, 3.0).addScaledVector(rt, 0.0).add(V(0, 1.15, 0)); shot.quaternion.copy(camera.quaternion);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.4, bloomThreshold: 0.85, envIntensity: 0.3 };
}
