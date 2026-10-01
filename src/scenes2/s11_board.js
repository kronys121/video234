import * as THREE from 'three';
import { COL } from '../lib/stream.js';
import { text3d } from '../lib/text3d.js';
import { sign, point, particles } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { M, V, setCam, inv, smooth, easeInOut, easeOutBack, easeOutCubic, shake, lerp, canvasTex, rng, speckle } from '../lib/util.js';

function corkTex() {
  return canvasTex('cork', 512, 512, (g, w, h) => {
    g.fillStyle = '#b8895a'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 5000, ['#8a6238', '#d2a470', '#6e4a28', '#c89a66'], 1, 4, 3, 0.7);
  }, { repeat: [1, 1] });
}
function faceTex(key, o) {
  return canvasTex('face' + key, 300, 380, (g, w, h) => {
    g.fillStyle = o.bg; g.fillRect(0, 0, w, h * 0.84);
    g.fillStyle = o.shirt; g.beginPath(); g.ellipse(w / 2, h * 0.86, w * 0.36, h * 0.24, 0, Math.PI, 0); g.fill();
    if (o.hood) { g.fillStyle = o.shirt; g.beginPath(); g.ellipse(w / 2, h * 0.52, w * 0.3, h * 0.2, 0, 0, 7); g.fill(); }
    g.fillStyle = o.skin; g.fillRect(w * 0.43, h * 0.6, w * 0.14, h * 0.1);
    g.beginPath(); g.ellipse(w / 2, h * 0.4, w * 0.23, h * 0.19, 0, 0, 7); g.fill();
    g.fillStyle = o.hair; g.beginPath(); g.ellipse(w / 2, h * 0.31, w * 0.245, h * 0.13, 0, Math.PI, 0); g.fill();
    if (o.long) { g.fillRect(w * 0.26, h * 0.3, w * 0.06, h * 0.25); g.fillRect(w * 0.68, h * 0.3, w * 0.06, h * 0.25); }
    g.fillStyle = '#fff'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(w / 2 + s * w * 0.09, h * 0.4, w * 0.045, h * 0.03, 0, 0, 7); g.fill(); }
    g.fillStyle = '#222'; for (const s of [-1, 1]) { g.beginPath(); g.arc(w / 2 + s * w * 0.09, h * 0.405, w * 0.02, 0, 7); g.fill(); }
    g.strokeStyle = o.hair; g.lineWidth = 5; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(w / 2 + s * w * 0.14, h * 0.345 - (o.sad ? 0 : 3)); g.lineTo(w / 2 + s * w * 0.045, h * 0.35 - (o.sad ? 8 : 0)); g.stroke(); }
    g.strokeStyle = '#8a3a30'; g.lineWidth = 5; g.beginPath(); if (o.sad) g.arc(w / 2, h * 0.53, w * 0.06, Math.PI * 1.15, Math.PI * 1.85); else g.arc(w / 2, h * 0.47, w * 0.07, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    if (o.glasses) { g.strokeStyle = '#222'; g.lineWidth = 4; for (const s of [-1, 1]) { g.beginPath(); g.arc(w / 2 + s * w * 0.09, h * 0.405, w * 0.065, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(w / 2 - w * 0.025, h * 0.4); g.lineTo(w / 2 + w * 0.025, h * 0.4); g.stroke(); }
    if (o.headset) { g.strokeStyle = '#16161c'; g.lineWidth = 12; g.beginPath(); g.arc(w / 2, h * 0.38, w * 0.27, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.fillStyle = '#16161c'; for (const s of [-1, 1]) g.fillRect(w / 2 + s * w * 0.27 - 10, h * 0.36, 20, 46); g.strokeStyle = '#9146ff'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h * 0.38, w * 0.27, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
    g.fillStyle = '#f4f0e4'; g.fillRect(0, h * 0.86, w, h * 0.14); g.fillStyle = '#222'; g.font = `${h * 0.075}px Russo`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.label, w / 2, h * 0.93);
  }, { repeat: [1, 1] });
}
const VICT = [
  { bg: '#3a5a7a', skin: '#e8b898', hair: '#9a9a9a', shirt: '#7a8a5a', glasses: true, sad: true, label: 'ЖЕРТВА 1' },
  { bg: '#6a4a5a', skin: '#f0c8a8', hair: '#7a4a2a', shirt: '#b05a6a', long: true, sad: true, label: 'ЖЕРТВА 2' },
  { bg: '#4a6a5a', skin: '#8a5a3c', hair: '#111', shirt: '#d9a23a', sad: true, label: 'ЖЕРТВА 3' },
  { bg: '#5a5a7a', skin: '#f2d0b8', hair: '#e0c080', shirt: '#2a6a4a', sad: true, label: 'ЖЕРТВА 4' },
];
const QUANTUM = { bg: '#2a1a5a', skin: '#e2b08c', hair: '#2a1a12', shirt: '#6b3fd4', glasses: true, headset: true, hood: false, label: 'КВАНТУМ' };

function makeString(color) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 6), M.col(color, 0.7)); return m;
}
function setString(m, a, b, k) {
  const d = b.clone().sub(a); const len = d.length();
  m.scale.set(1, Math.max(0.0001, len * k), 1); m.position.copy(a).addScaledVector(d, 0.5 * k); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); m.visible = k > 0.001;
}

function board(mode) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b1214');
  const wallM = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), M.std({ color: '#1d2b30', roughness: 0.95 })); wallM.position.set(0, 3, -3.0); wallM.receiveShadow = true; scene.add(wallM);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), M.std({ color: '#141a1c', roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const B = new THREE.Group(); B.position.set(0, 2.2, -2.9); scene.add(B);
  rbox(2.9, 4.1, 0.1, 0.04, M.col('#4a3220', 0.7), 0, 0, 0, B).castShadow = true;
  const cork = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 3.9), M.std({ map: corkTex(), roughness: 1 })); cork.position.z = 0.055; cork.receiveShadow = true; B.add(cork);
  scene.add(new THREE.HemisphereLight('#9ab8c0', '#1a1410', 0.5));
  const key = new THREE.SpotLight('#ffe6c0', 70, 12, 0.55, 0.6, 1.2); key.position.set(0, 5.5, 2.4); key.target.position.set(0, 2.1, -2.9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; scene.add(key, key.target);
  point(scene, '#ff9a5a', 10, 8, [-2, 2.5, 0]); point(scene, '#5a8aff', 6, 8, [2.2, 3.0, 0]);
  const POS = [[-0.68, 1.35], [0.68, 1.15], [-0.72, 0.1], [0.72, -0.05]]; const rot = [0.05, -0.06, -0.04, 0.05];
  const centre = V(0, -1.2, 0.12), photos = [], strings = [], stamps = [], pins = [];
  const photoMat = (tex) => M.std({ map: tex, roughness: 0.6 });
  VICT.forEach((o, i) => {
    const g = new THREE.Group(); g.position.set(POS[i][0], POS[i][1], 0.09); g.rotation.z = rot[i]; B.add(g);
    rbox(0.78, 0.98, 0.012, 0.004, M.col('#f6f2e8', 0.7), 0, 0, 0, g).castShadow = true;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7 * 380 / 300), photoMat(faceTex('v' + i, o))); p.position.set(0, 0, 0.008); g.add(p);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), M.col('#d12a2a', 0.3, 0.2)); pin.position.set(0, 0.45, 0.03); g.add(pin);
    const st = sign('ДОНАТ', { width: 0.6, color: '#d12a3a', size: 130, pad: 16, border: '#d12a3a', grunge: 0.5 }); st.position.set(0.03, -0.1, 0.03); st.rotation.z = -0.28 + i * 0.12; st.visible = false; g.add(st);
    photos.push(g); stamps.push(st); pins.push(pin);
    const s = makeString('#d12a2a'); B.add(s); strings.push(s);
  });
  // centre: "?" (wide) → Quantum photo (close)
  const q = new THREE.Group(); q.position.set(centre.x, centre.y, 0.09); B.add(q);
  rbox(1.0, 1.25, 0.012, 0.004, M.col('#f6f2e8', 0.7), 0, 0, 0, q);
  const qp = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9 * 380 / 300), photoMat(faceTex('q', QUANTUM))); qp.position.z = 0.008; q.add(qp);
  const qpin = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), M.col('#d12a2a', 0.3, 0.2)); qpin.position.set(0, 0.58, 0.03); q.add(qpin);
  const qframe = box(1.12, 1.37, 0.006, M.emis(COL.purple, 1.2), 0, 0, -0.008, q); void qframe;
  const qm = text3d('?', { family: 'mont', size: 1.1, depth: 0.1, bevel: 0.012, color: '#ff3b4a', side: '#8a1020', emissive: '#ff3b4a', emissiveIntensity: 0.4 });
  qm.position.set(centre.x, centre.y, 0.2); B.add(qm);
  const ttl = new THREE.Group(); B.add(ttl);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  return { scene, B, photos, strings, stamps, pins, q, qm, ttl, centre, camera, qpin };
}

// 32.25–35.25  «Между всеми пострадавшими нашлось кое-что общее:»
export function buildWide() {
  const o = board('wide'); const { scene, photos, strings, q, qm, ttl, camera, B } = o;
  q.visible = false;
  const pinPos = (g) => V(g.position.x, g.position.y + 0.45, 0.14);
  const cPin = V(o.centre.x, o.centre.y + 0.55, 0.14);
  function update(lt) {
    photos.forEach((g, i) => { const k = easeOutBack(inv(0.15 + i * 0.35, 0.6 + i * 0.35, lt), 2.0); g.scale.setScalar(Math.max(0.001, k)); g.position.z = 0.09 + (1 - Math.min(1, k)) * 0.5; });
    strings.forEach((s, i) => { const k = easeOutCubic(inv(0.9 + i * 0.3, 1.5 + i * 0.3, lt)); setString(s, pinPos(photos[i]), cPin, k); });
    const k = easeOutBack(inv(2.1, 2.6, lt), 2.4); qm.scale.setScalar(Math.max(0.001, k)); qm.rotation.set(0, (1 - Math.min(1, k)) * 1.5, Math.sin(lt * 6) * 0.04 * k); qm.visible = lt > 2.08;
    ttl.visible = lt > 2.3; ttl.scale.setScalar(Math.max(0.001, easeOutBack(inv(2.3, 2.7, lt), 2)));
    // tilt down the board (top row → centre) while drifting sideways
    const c = easeInOut(inv(0, 3.05, lt));
    const pos = V(lerp(-0.5, 0.45, c), lerp(3.3, 1.6, c), lerp(1.7, 1.2, c)).add(shake(lt, 0.004, 5, 3));
    setCam(camera, pos, V(lerp(0, 0, c), lerp(2.7, 1.2, c), -2.9), 0.05 - 0.1 * c);
    camera.fov = lerp(54, 46, c); camera.updateProjectionMatrix();
    void B;
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.2 };
}

// 35.25–38.10  «все они якобы донатили этому стримеру.»
export function buildClose() {
  const o = board('close'); const { scene, photos, strings, stamps, q, qm, camera, B, qpin } = o;
  qm.visible = false; o.ttl.visible = false;
  const pinPos = (g) => V(g.position.x, g.position.y + 0.45, 0.14);
  const cPin = V(o.centre.x, o.centre.y + 0.62, 0.14);
  const cm = M.col('#9146ff', 0.5, 0, { emissive: '#9146ff', emissiveIntensity: 0.8 });
  strings.forEach((s) => { s.material = cm; });
  const STAMPS = [0.1, 0.65, 1.1, 1.55]; // "все они якобы донатили"
  const fx = particles({ n: 50, seed: 3, color: '#c9a4ff', size: [0.02, 0.05], life: [0.8, 1.6], origin: [o.centre.x, o.centre.y + 2.2, 0.3], spread: [0.5, 0.5, 0.2], vel: [0, 0.1, 0.3], velSpread: [0.5, 0.5, 0.3], opacity: 0.9 }); scene.add(fx);
  const SHOW = 1.75;
  function update(lt) {
    strings.forEach((s, i) => setString(s, pinPos(photos[i]), cPin, 1));
    stamps.forEach((st, i) => { const k = easeOutBack(inv(STAMPS[i], STAMPS[i] + 0.22, lt), 2.6); st.visible = lt > STAMPS[i] - 0.01; st.scale.setScalar(Math.max(0.001, k * 1.4)); });
    const k = easeOutBack(inv(SHOW, SHOW + 0.5, lt), 2.2); q.scale.setScalar(Math.max(0.001, k)); q.visible = lt > SHOW - 0.02; q.position.z = 0.09 + (1 - Math.min(1, k)) * 0.8;
    fx.visible = lt > SHOW; fx.userData.update(Math.max(0, lt - SHOW));
    // slow push toward the centre, quick punch-in when Quantum lands
    const c = easeInOut(inv(0, 2.85, lt)); const punch = Math.exp(-Math.max(0, lt - SHOW) * 4) * (lt > SHOW ? 1 : 0);
    const pos = V(lerp(0.6, 0.0, c), lerp(2.3, 1.2, c), lerp(1.9, 0.95, c)).add(shake(lt, 0.004 + punch * 0.03, 16, 4));
    setCam(camera, pos, V(0, lerp(1.7, 1.05, c), -2.9), 0.04 * (1 - c));
    camera.fov = lerp(52, 44, c) - punch * 5; camera.updateProjectionMatrix();
    void B; void qpin;
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.9, envIntensity: 0.2 };
}
