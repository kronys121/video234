import * as THREE from 'three';
import { cs, crt, floppy, badge, csBox, gameView } from '../lib/cs.js';
import { idle2 } from '../lib/human2.js';
import { earthTex, ll2v } from '../scenes/s08_flight.js';
import { pedestal } from '../lib/fantasy.js';
import { livePlane } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { text3d } from '../lib/text3d.js';
import { desk, box, rbox } from '../lib/props.js';
import { room } from '../lib/rooms.js';
import { solid } from '../lib/overlap.js';
import { TEX, M, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, glowTex, canvasTex } from '../lib/util.js';

const flat = (s, k = 0.85) => { s.material = new THREE.MeshBasicMaterial({ map: s.material.map, color: new THREE.Color(k, k, k), transparent: s.material.transparent }); return s; };
const STANDP = { lSh: [0, 0, 7], rSh: [0, 0, -7] };

// 23.65–26.15  «и мод быстро разошёлся по сети.»
export function buildGlobe() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#04060e');
  const r = rng(9); const sp = []; for (let i = 0; i < 1200; i++) { const v = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(80); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#ffffff', size: 1.4, sizeAttenuation: false })));
  scene.add(new THREE.HemisphereLight('#bcd4ff', '#101018', 0.6));
  const sun = new THREE.DirectionalLight('#fff4e0', 2.4); sun.position.set(-4, 3, 5); scene.add(sun);
  const R = 2;
  const earth = new THREE.Group(); scene.add(earth);
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), M.std({ map: earthTex(), roughness: 0.85 })));
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.03, 48, 32), new THREE.MeshBasicMaterial({ color: '#6ab0ff', transparent: true, opacity: 0.22, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));
  const src = [49, -123]; // Pacific north-west / Canada
  const dst = [[40, -74], [34, -118], [51, 0], [52, 13], [55, 37], [-23, -46], [35, 139], [37, 127], [-33, 151], [48, 2], [59, 18], [19, -99], [1, 103], [28, 77], [-34, 18], [60, 30], [41, 29], [31, 121]];
  const arcs = dst.map(([la, lo], i) => {
    const a = ll2v(src[0], src[1], R), b = ll2v(la, lo, R); const mid = a.clone().add(b).multiplyScalar(0.5); const h = 0.35 + a.distanceTo(b) * 0.28; mid.normalize().multiplyScalar(R + h);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const geo = new THREE.TubeGeometry(curve, 48, 0.012, 6, false);
    const m = new THREE.Mesh(geo, M.emis(i % 3 ? '#ffb03a' : '#3affc8', 2.4)); earth.add(m);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), M.emis('#ffe08a', 3)); dot.position.copy(b); earth.add(dot);
    return { m, dot, t0: 0.15 + i * 0.09, n: geo.index.count };
  });
  const home = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), M.emis('#ff5a3a', 4)); home.position.copy(ll2v(src[0], src[1], R)); earth.add(home);
  const cv = document.createElement('canvas'); cv.width = 720; cv.height = 300; const ctx = cv.getContext('2d'); const ctex = new THREE.CanvasTexture(cv); ctex.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.79), new THREE.MeshBasicMaterial({ map: ctex, transparent: true })); scene.add(panel);
  const fl = floppy('CS'); fl.scale.setScalar(6); scene.add(fl);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 300); let last = -1;
  function update(lt) {
    earth.rotation.set(0.35, 1.9 - lt * 0.32, 0);
    arcs.forEach((a) => { const k = smooth(inv(a.t0, a.t0 + 0.55, lt)); a.m.geometry.setDrawRange(0, Math.floor(a.n * k / 6) * 6); a.m.visible = k > 0; a.dot.visible = k >= 1; a.dot.scale.setScalar(k >= 1 ? 1 + 0.4 * Math.sin(lt * 10) : 1); });
    const n = Math.round(Math.pow(smooth(inv(0.1, 2.3, lt)), 1.6) * 250000 / 1000) * 1000;
    if (n !== last) { last = n; ctx.clearRect(0, 0, 720, 300); ctx.fillStyle = 'rgba(10,14,28,0.85)'; ctx.beginPath(); ctx.roundRect(4, 4, 712, 292, 30); ctx.fill(); ctx.strokeStyle = '#3affc8'; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = '#9fffe0'; ctx.font = '56px Russo'; ctx.textAlign = 'center'; ctx.fillText('ИГРОКОВ ОНЛАЙН', 360, 100); ctx.fillStyle = '#ffffff'; ctx.font = '120px Russo'; ctx.fillText(n.toLocaleString('ru-RU').replace(/ /g, ' '), 360, 238); ctex.needsUpdate = true; }
    const f = kf(lt, [[0, [0.6, 1.2, 11.5], [0, 0.0, 0], 50, 0.05], [2.5, [-0.4, 0.4, 9.5], [0, -0.2, 0], 50, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 3)), f.look, f.roll, f.fov);
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw);
    const kp = easeOutBack(inv(0.4, 0.75, lt), 2.2); panel.scale.setScalar(Math.max(0.001, kp)); panel.position.copy(camera.position).addScaledVector(fw, 5).add(V(0, 1.75, 0)); panel.quaternion.copy(camera.quaternion);
    fl.position.copy(camera.position).addScaledVector(fw, 4).add(V(0.9, -2.1, 0)); fl.quaternion.copy(camera.quaternion); fl.rotateY(-0.5 + Math.sin(lt * 2) * 0.2); fl.rotateX(0.2);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.55, bloomThreshold: 0.8, envIntensity: 0.15 };
}

// office for the 2000 deal: table in the middle, exec on the far side, students on the near side
function office(scene) {
  scene.background = new THREE.Color('#0e0d10');
  const wall = canvasTex('offw4', 256, 256, (g, w, h) => { g.fillStyle = '#2e3440'; g.fillRect(0, 0, w, h); g.fillStyle = '#343b48'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 32, h); }, { repeat: [3, 2] });
  const R = room({ w: 7, d: 7, h: 3, wall: M.std({ map: wall, roughness: 0.9 }), floor: M.std({ map: TEX.carpet([5, 5], '#3a3f48'), roughness: 1 }), ceil: M.col('#1a1a1e', 1), open: ['front'] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#d8e0ff', '#201a14', 0.5));
  const logo = sign('VALVE', { width: 1.8, color: '#ff8a2a', size: 140, pad: 20, emissive: 0.7 }); logo.position.set(0, 2.25, -3.47); scene.add(logo);
  const plate = box(2.3, 0.7, 0.04, M.col('#1a1c22', 0.5), 0, 2.25, -3.49, scene);
  const tb = desk(2.2, 1.1, 0.76, '#5a3a24'); tb.position.set(0, 0, 0); scene.add(solid(tb, 'table', [], [tb.children[0]]));
  for (const x of [-3.0, 3.0]) { const pl = new THREE.Group(); const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.45, 18), M.col('#d8d0c0', 0.6)); pot.position.y = 0.22; pl.add(pot); for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), M.col('#2f6a3a', 0.8)); l.scale.set(0.5, 1.3, 0.25); l.position.set(Math.sin(i * 0.9) * 0.12, 0.75, Math.cos(i * 0.9) * 0.12); l.rotation.set(Math.cos(i) * 0.4, i * 0.9, Math.sin(i) * 0.4); pl.add(l); } pl.position.set(x, 0, -2.9); pl.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(pl); }
  point(scene, '#ffc890', 10, 7, [0, 2.6, 0.5]); point(scene, '#ff8a3a', 5, 4, [0, 2.0, -3.0]);
  const key = new THREE.SpotLight('#ffe6c8', 22, 10, 0.8, 0.6, 1.3); key.position.set(1.5, 2.9, 2.5); key.target.position.set(0, 0.9, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  return { top: 0.79, logo, plate };
}

// 26.15–28.25  «В 2000 году Valve выкупила проект,»
export function buildDeal() {
  const scene = new THREE.Scene(); const O = office(scene);
  const ex = cs.exec(); ex.root.position.set(0, 0, -1.0); scene.add(ex.root);
  const a = cs.student1(), b = cs.student2(); a.root.position.set(-0.45, 0, 0.95); b.root.position.set(0.5, 0, 0.95); a.root.rotation.y = Math.PI; b.root.rotation.y = Math.PI; scene.add(a.root, b.root);
  const paper = canvasTex('contract', 300, 400, (g, w, h) => { g.fillStyle = '#f4f0e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = '34px Russo'; g.textAlign = 'center'; g.fillText('ДОГОВОР', w / 2, 52); g.fillStyle = '#9a9488'; for (let y = 90; y < 330; y += 22) g.fillRect(30, y, w - 60 - ((y * 7) % 50), 6); g.strokeStyle = '#2a3a8a'; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 370); g.bezierCurveTo(80, 340, 110, 390, 150, 360); g.stroke(); }, { repeat: [1, 1] });
  const doc = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), M.std({ map: paper, roughness: 0.8 })); doc.rotation.x = -Math.PI / 2; doc.rotation.z = 0.1; doc.position.set(0, O.top + 0.003, 0.05); doc.receiveShadow = true; scene.add(doc);
  const stamp = sign('ПРОДАНО', { width: 0.36, color: '#d4213a', size: 110, pad: 14, border: '#d4213a' }); stamp.rotation.set(-Math.PI / 2, 0, 0.35); scene.add(stamp);
  const yr = text3d('2000', { family: 'mont', size: 0.42, depth: 0.1, bevel: 0.014, color: '#ffffff', side: '#c86a1a', emissive: '#ff8a2a', emissiveIntensity: 0.3 }); yr.position.set(0, 2.45, -1.8); scene.add(yr);
  const fl = floppy('CS'); fl.scale.setScalar(2); fl.rotation.set(-Math.PI / 2, 0, -0.4); fl.position.set(0.42, O.top + 0.006, 0.12); scene.add(fl);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const BUY = 1.1;
  function update(lt) {
    const ky = easeOutElastic(inv(0.1, 0.7, lt)); yr.scale.setScalar(Math.max(0.001, ky)); yr.visible = lt > 0.08; yr.rotation.y = Math.sin(lt * 1.6) * 0.15;
    // exec presses the stamp onto the contract
    const down = lt < BUY ? smooth(inv(BUY - 0.45, BUY, lt)) : 1 - smooth(inv(BUY + 0.1, BUY + 0.5, lt));
    ex.pose({ ...STANDP, spine: [12 * down, 0, 0], rSh: [-30 - 30 * down, 0, -10], rEl: [-40 + 10 * down, 0, 0], rCurl: 0.8, lSh: [-10, 0, 10], lEl: [-20, 0, 0] }); idle2(ex, lt, 4, 0.3);
    ex.face({ blink: 0, brows: 0.3, smile: 0.8, mouth: lt > BUY ? 0.3 : 0 });
    const cheer = smooth(inv(BUY, BUY + 0.3, lt));
    a.pose({ ...STANDP, rSh: [lerp(0, -160, cheer), 0, -15], rEl: [-20 * cheer, 0, 0], rCurl: 0.9 }); idle2(a, lt, 1, 0.4); a.face({ blink: 0, smile: 0.6 + 0.4 * cheer, mouth: 0.5 * cheer, brows: 0.6 * cheer });
    b.pose({ ...STANDP, lSh: [lerp(0, -160, cheer), 0, 15], lEl: [-20 * cheer, 0, 0], lCurl: 0.9 }); idle2(b, lt, 6, 0.4); b.face({ blink: 0, smile: 0.6 + 0.4 * cheer, mouth: 0.5 * cheer, brows: 0.6 * cheer });
    const ks = easeOutBack(inv(BUY, BUY + 0.18, lt), 3); stamp.scale.setScalar(Math.max(0.001, lt < BUY ? 0.001 : 1.4 - 0.4 * ks)); stamp.visible = lt > BUY; stamp.position.set(0.02, O.top + 0.008, 0.02);
    const f = kf(lt, [[0, [2.7, 1.95, 2.3], [0, 1.2, 0], 54, 0.04], [1.0, [2.9, 2.2, 1.2], [0, 1.0, -0.1], 58, 0.01], [2.1, [3.25, 2.3, 0.35], [0, 1.1, 0.05], 66, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, lt > BUY && lt < BUY + 0.3 ? 0.02 : 0.004, 18, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25 };
}

// 28.25–32.25  «наняла обоих авторов и выпустила игру как самостоятельный продукт.»
export function buildRelease() {
  const scene = new THREE.Scene(); const O = office(scene); O.logo.visible = false; O.plate.visible = false;
  scene.children.filter((o) => o.userData.solid === 'table').forEach((o) => { o.visible = false; o.userData.solid = null; });
  const a = cs.student1(), b = cs.student2(); a.root.position.set(-0.75, 0, -1.4); b.root.position.set(0.75, 0, -1.4); scene.add(a.root, b.root);
  const ba = badge('СОТРУДНИК'), bb = badge('СОТРУДНИК'); ba.scale.setScalar(1.3); bb.scale.setScalar(1.3); a.J.chest.add(ba); b.J.chest.add(bb); ba.position.set(0.09, 0.12, 0.165); bb.position.set(-0.09, 0.12, 0.165);
  const ped = pedestal(0.7, 0.85); ped.position.set(0, 0, 0.2); scene.add(solid(ped, 'pedestal'));
  const bx = csBox('COUNTER-STRIKE', '2000'); bx.scale.setScalar(1.8); scene.add(bx);
  const own = sign('САМОСТОЯТЕЛЬНАЯ ИГРА', { width: 1.25, color: '#ffffff', bg: '#c86a1a', size: 90, pad: 22, border: '#ffffff', emissive: 0.12 }); flat(own); scene.add(own);
  const hired = sign('В КОМАНДЕ VALVE', { width: 1.7, color: '#1a1a1a', bg: '#ffd23a', size: 90, pad: 20, border: '#1a1a1a' }); flat(hired); scene.add(hired);
  const spot = point(scene, '#ffd8a0', 0, 4, [0, 1.3, 1.7]);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const BOX = 1.63;
  function update(lt) {
    [a, b].forEach((h, i) => { const s = i ? 1 : -1; const clap = Math.max(0, Math.sin((lt - BOX) * 14)) * (lt > BOX + 0.2 ? 1 : 0);
      const pose = lt < BOX + 0.2 ? { ...STANDP, [i ? 'lSh' : 'rSh']: [-25, 0, 8 * s], [i ? 'lEl' : 'rEl']: [-70, 0, 0] } : { lSh: [-55, 0, 12 - clap * 10], rSh: [-55, 0, -12 + clap * 10], lEl: [-55, 25, 0], rEl: [-55, -25, 0], lCurl: 0.1, rCurl: 0.1 };
      h.pose(pose); idle2(h, lt, i * 4, 0.4); h.face({ blink: 0, smile: 1, mouth: 0.2 + 0.3 * clap, brows: 0.5 }); });
    const ka = easeOutBack(inv(0.25, 0.55, lt), 2.4) * (1 - smooth(inv(2.4, 2.65, lt))); hired.scale.setScalar(Math.max(0.001, ka)); hired.visible = lt > 0.23 && lt < 2.65; hired.position.set(0, 2.35, -1.6);
    const kb = easeOutBack(inv(BOX, BOX + 0.45, lt), 2.2); bx.scale.setScalar(Math.max(0.001, 1.8 * kb)); bx.visible = lt > BOX - 0.02; bx.position.set(0, 0.85 + 0.06 + 0.38 * 1.8 * 0.5 + 0.03 + Math.sin(lt * 2) * 0.02, 0.2); bx.rotation.y = (1 - kb) * 3 + Math.sin(lt * 1.3) * 0.25;
    spot.intensity = 14 * smooth(inv(BOX, BOX + 0.3, lt));
    const ko = easeOutBack(inv(2.65, 3.0, lt), 2.4); own.scale.setScalar(Math.max(0.001, ko)); own.visible = lt > 2.63; own.position.set(0, 1.95, 0.25);
    const f = kf(lt, [[0, [0.3, 1.6, 1.4], [0, 1.4, -1.4], 48, 0.03], [1.5, [-0.5, 1.5, 2.6], [0, 1.2, -0.6], 52, 0], [4.0, [0.5, 1.55, 3.1], [0, 1.4, 0.2], 50, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 4)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25 };
}

// 32.25–35.95  «Counter-Strike стала одной из самых популярных онлайн-игр в мире,»
export function buildArena() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05050a');
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.std({ color: '#121218', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const stage = rbox(8, 0.3, 4, 0.04, M.col('#1a1a24', 0.4), 0, 0.15, 0, scene); void stage;
  const edge = box(8, 0.04, 0.04, M.emis('#ff8a2a', 3), 0, 0.3, 2.0, scene); void edge;
  scene.add(new THREE.HemisphereLight('#a0b0ff', '#100810', 0.35));
  const screen = livePlane(5.4, 3.0, gameView, { px: 768, emissive: 0.45 }); screen.position.set(0, 3.4, -3.2); scene.add(screen);
  box(5.6, 3.2, 0.1, M.col('#0a0a0e', 0.4), 0, 3.4, -3.27, scene);
  const P = [];
  for (const side of [-1, 1]) {
    const d = desk(1.6, 0.6, 0.74, '#1e1e26'); d.position.set(side * 1.9, 0.3, -0.4); d.rotation.y = side * 0; scene.add(solid(d, 'desk' + side, [], [d.children[0]]));
    const col = side < 0 ? '#c8322a' : '#2a6ac8';
    for (const k of [-1, 1]) {
      const h = cs.pro('pro' + side + k, col, k > 0 ? '#e2b08c' : '#c08a68', k > 0 ? '#2a1a12' : '#d8b060'); const lx = side * 1.9 + k * 0.4 * Math.cos(side * 0), lz = -0.4 + 0.92 - k * 0.4 * Math.sin(side * 0) * 1;
      h.root.position.set(lx, 0.3, lz); h.root.rotation.y = Math.PI + side * 0; scene.add(h.root); P.push(h);
      const ch = new THREE.Group(); rbox(0.5, 0.08, 0.48, 0.03, M.col('#1a1a1a', 0.6), 0, 0.5, 0, ch); rbox(0.5, 0.7, 0.08, 0.03, M.col(col, 0.6), 0, 0.85, 0.24, ch); box(0.06, 0.42, 0.06, M.col('#333', 0.4, 0.6), 0, 0.21, 0, ch); ch.position.set(lx, 0.3, lz); ch.rotation.y = h.root.rotation.y + Math.PI; ch.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(solid(ch, 'chair' + side + k, ['pro' + side + k]));
      h.root.userData.allow = ['chair' + side + k];
      const mon = new THREE.Group(); rbox(0.5, 0.3, 0.03, 0.01, M.col('#111', 0.4), 0, 0.32, 0, mon); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.26), M.emis(col, 0.8)); sc.position.set(0, 0.32, 0.016); mon.add(sc); box(0.04, 0.17, 0.04, M.col('#222', 0.4), 0, 0.08, -0.02, mon);
      mon.position.set(side * 1.9 + k * 0.4 * Math.cos(side * 0), 0.3 + 0.76, -0.4 - 0.1 - k * 0.4 * Math.sin(side * 0)); mon.rotation.y = side * 0; scene.add(mon);
    }
  }
  // crowd = rows of phone lights and glow, no little figures
  const r = rng(3); const pts = [], cols = [];
  for (let i = 0; i < 1400; i++) { const row = Math.floor(r() * 9); const ang = (r() - 0.5) * 2.4; const rad = 8 + row * 0.9; pts.push(Math.sin(ang) * rad, 0.6 + row * 0.55 + r() * 0.15, 3.5 - Math.cos(ang) * 0 + Math.cos(ang) * rad * 0.6 + 2); const c = new THREE.Color(r() > 0.7 ? '#ffd28a' : r() > 0.5 ? '#ff8a3a' : '#8ab0ff'); cols.push(c.r, c.g, c.b); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); pg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const crowd = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.9, map: glowTex(), blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(crowd);
  const beams = []; for (let i = 0; i < 6; i++) { const bm = new THREE.Mesh(new THREE.ConeGeometry(0.9, 9, 24, 1, true), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ff8a2a' : '#4a8aff', transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); bm.position.set(-5 + i * 2, 7, -2); scene.add(bm); beams.push(bm); }
  point(scene, '#ff8a3a', 14, 8, [-2.5, 2.5, 1.5]); point(scene, '#4a8aff', 14, 8, [2.5, 2.5, 1.5]); point(scene, '#ffffff', 8, 8, [0, 3, 3]);
  const key = new THREE.SpotLight('#ffffff', 40, 16, 0.7, 0.6, 1.2); key.position.set(0, 7, 4); key.target.position.set(0, 0.5, -0.3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const title = text3d('COUNTER-STRIKE', { family: 'russo', size: 0.26, depth: 0.08, bevel: 0.012, color: '#ffffff', side: '#c86a1a', emissive: '#ff8a2a', emissiveIntensity: 0.3 }); title.position.set(0, 5.35, -3.0); scene.add(title);
  const one = text3d('ТОП-1', { family: 'mont', size: 0.42, depth: 0.2, bevel: 0.03, color: '#ffd23a', side: '#a8700a', emissive: '#ffb020', emissiveIntensity: 0.35, metal: 0.6, rough: 0.25 }); scene.add(one);
  const world = sign('В МИРЕ', { width: 1.4, color: '#1a1a1a', bg: '#ffd23a', size: 110, pad: 22, border: '#1a1a1a' }); scene.add(world);
  const camera = new THREE.PerspectiveCamera(58, 1080 / 1920, 0.05, 200);
  function update(lt) {
    screen.userData.live.update(lt * 1.3 + 5);
    P.forEach((h, i) => { const ty = Math.sin(lt * 15 + i) * 4; h.pose({ hipsY: -0.38, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0], lSh: [-42 + ty, 0, 12], rSh: [-42 - ty, 0, -12], lEl: [-62, 0, 0], rEl: [-62, 0, 0], lCurl: 0.5, rCurl: 0.6, spine: [12, 0, 0], head: [4, 0, 0] }); idle2(h, lt, i * 3, 0.3); h.face({ blink: 0, brows: -0.5 }); });
    beams.forEach((b, i) => { b.rotation.z = Math.sin(lt * 1.2 + i) * 0.35; });
    crowd.material.opacity = 0.75 + 0.2 * Math.sin(lt * 6);
    const k1 = easeOutElastic(inv(1.25, 1.85, lt)); one.scale.setScalar(Math.max(0.001, k1)); one.visible = lt > 1.23; one.position.set(0, 2.1, 1.9); one.rotation.y = Math.sin(lt * 2) * 0.3;
    const kw = easeOutBack(inv(3.3, 3.6, lt), 2.4); world.scale.setScalar(Math.max(0.001, kw)); world.visible = lt > 3.28; world.position.set(0, 1.35, 2.05);
    const kt = easeOutBack(inv(0.05, 0.45, lt), 2.2); title.scale.setScalar(Math.max(0.001, kt)); title.visible = lt > 0.04;
    const f = kf(lt, [[0, [0, 6.5, 11], [0, 3.2, -2], 58, 0], [1.6, [2.8, 2.6, 6.4], [0, 2.0, 0], 58, -0.05], [3.7, [-0.4, 2.2, 5.8], [0, 1.9, 0.5], 56, 0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 4, 1)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.5, bloomThreshold: 0.8, envIntensity: 0.2 };
}

// 35.95–37.72  «а серия живёт до сих пор.»
export function buildSeries() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a10');
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.std({ color: '#16161e', roughness: 0.3, metalness: 0.4 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c0c8ff', '#100c10', 0.5));
  const line = box(0.04, 0.02, 7, M.emis('#ff8a2a', 2.5), 0, 0.01, -1.0, scene); void line;
  const items = [['1.6', '2003', '#c86a1a'], ['SOURCE', '2004', '#5a7a3a'], ['GO', '2012', '#3a6aa8'], ['2', '2023', '#d8a020']].map(([t, y, c], i) => {
    const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.3, 32), M.col('#24242e', 0.4, 0.5)); p.position.y = 0.15; p.castShadow = true; p.receiveShadow = true; g.add(p);
    const bx = csBox('CS ' + t, y, c); bx.scale.setScalar(1.7); bx.position.y = 0.3 + 0.357 + 0.01; g.add(bx); g.userData.bx = bx;
    g.position.set(i % 2 ? 0.55 : -0.55, 0, 1.0 - i * 1.15); p.scale.y = 1 + i; p.position.y = 0.15 * (1 + i); bx.position.y = 0.3 * (1 + i) + 0.367; scene.add(g); return g;
  });
  items.forEach((g, i) => point(scene, i % 2 ? '#ffb070' : '#8ab0ff', 6, 4, [g.position.x, 1.8, g.position.z + 1.0]));
  const key = new THREE.SpotLight('#ffffff', 60, 16, 0.8, 0.6, 1.2); key.position.set(-1, 5, 4); key.target.position.set(0.5, 0.5, -0.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  const still = sign('ДО СИХ ПОР', { width: 1.3, color: '#1a1a1a', bg: '#ffd23a', size: 110, pad: 22, border: '#1a1a1a' }); flat(still); scene.add(still);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 100);
  function update(lt) {
    items.forEach((g, i) => { const k = easeOutBack(inv(0.05 + i * 0.22, 0.4 + i * 0.22, lt), 2.2); g.scale.setScalar(Math.max(0.001, k)); g.visible = lt > 0.04 + i * 0.22; g.userData.bx.rotation.y = -0.3 + Math.sin(lt * 1.5 + i) * 0.15; });
    const ks = easeOutBack(inv(0.95, 1.25, lt), 2.4); still.scale.setScalar(Math.max(0.001, ks)); still.visible = lt > 0.93;
    const f = kf(lt, [[0, [-1.9, 1.5, 4.4], [0, 0.9, -0.6], 54, 0.04], [1.77, [1.3, 1.8, 4.6], [0, 1.1, -0.8], 54, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 2)), f.look, f.roll, f.fov);
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); still.position.copy(camera.position).addScaledVector(fw, 3.6).add(V(0, 1.15, 0)); still.quaternion.copy(camera.quaternion);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.85, envIntensity: 0.25 };
}
