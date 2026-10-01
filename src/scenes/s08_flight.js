import * as THREE from 'three';
import { jet } from '../lib/props.js';
import { point } from '../lib/env.js';
import { M, V, canvasTex, setCam, inv, smooth, easeInOut, lerp, clamp, rng, glowTex, labelTex } from '../lib/util.js';

const LAND = {
  na: [[70, -165], [72, -140], [70, -100], [75, -80], [60, -65], [47, -53], [44, -66], [30, -81], [25, -80], [30, -90], [28, -97], [20, -97], [15, -92], [8, -78], [10, -84], [15, -95], [20, -105], [30, -115], [40, -124], [48, -125], [58, -137], [60, -150], [55, -165], [65, -168]],
  gr: [[60, -45], [70, -22], [82, -30], [82, -60], [76, -70], [66, -53]],
  sa: [[12, -72], [8, -60], [0, -50], [-8, -35], [-23, -41], [-35, -55], [-55, -68], [-50, -75], [-40, -73], [-18, -70], [-5, -81], [2, -80], [8, -77]],
  eu: [[36, -9], [43, -9], [48, -4], [51, 2], [54, 8], [57, 10], [58, 5], [62, 5], [70, 20], [70, 30], [66, 40], [60, 30], [55, 20], [45, 35], [41, 28], [38, 24], [40, 20], [45, 13], [38, 16], [44, 8], [43, 3], [36, -5]],
  af: [[35, -6], [37, 10], [32, 20], [31, 32], [22, 37], [12, 43], [11, 51], [-2, 41], [-15, 40], [-26, 33], [-34, 26], [-34, 18], [-17, 12], [-5, 12], [4, 8], [5, -5], [10, -15], [21, -17], [28, -13]],
  as: [[42, 28], [45, 40], [40, 50], [30, 48], [29, 50], [27, 56], [25, 57], [22, 60], [25, 68], [8, 77], [20, 87], [16, 95], [8, 98], [1, 104], [10, 106], [22, 108], [30, 122], [40, 122], [39, 127], [43, 132], [53, 141], [60, 162], [66, 180], [72, 180], [76, 110], [73, 80], [70, 60], [67, 45], [60, 30], [50, 40], [45, 50]],
  ar: [[30, 34], [28, 35], [22, 39], [13, 43], [15, 52], [22, 59], [26, 56], [24, 52], [30, 48], [32, 40]],
  au: [[-12, 131], [-11, 142], [-18, 146], [-28, 153], [-38, 147], [-35, 137], [-32, 125], [-22, 114], [-14, 126]],
  uk: [[50, -5], [51, 1], [55, -1], [58, -3], [58, -6], [54, -5]],
  jp: [[31, 130], [35, 136], [41, 141], [45, 142], [39, 140], [34, 132]],
};
export const ll2v = (lat, lon, rad = 1) => {
  const p = THREE.MathUtils.degToRad(lat), l = THREE.MathUtils.degToRad(lon);
  return V(Math.cos(l) * Math.cos(p) * rad, Math.sin(p) * rad, -Math.sin(l) * Math.cos(p) * rad);
};

export function earthTex() {
  return canvasTex('earth', 2048, 1024, (g, w, h) => {
    const oc = g.createLinearGradient(0, 0, 0, h); oc.addColorStop(0, '#1d5a8f'); oc.addColorStop(0.5, '#1f6aa8'); oc.addColorStop(1, '#1d5a8f');
    g.fillStyle = oc; g.fillRect(0, 0, w, h);
    const r = rng(3);
    const X = (lon) => (lon + 180) / 360 * w, Y = (lat) => (90 - lat) / 180 * h;
    for (const [k, poly] of Object.entries(LAND)) {
      g.beginPath(); poly.forEach(([la, lo], i) => (i ? g.lineTo(X(lo), Y(la)) : g.moveTo(X(lo), Y(la)))); g.closePath();
      g.fillStyle = k === 'ar' || k === 'af' && false ? '#c9a86a' : '#5f8f45'; g.fill();
      g.strokeStyle = '#e8dcb0'; g.lineWidth = 3; g.stroke();
    }
    // deserts
    g.fillStyle = 'rgba(214,180,110,0.85)';
    for (const [la, lo, rx, ry] of [[23, 12, 150, 70], [24, 45, 70, 55], [40, -112, 45, 40], [-25, 133, 70, 40], [43, 100, 90, 30]]) { g.beginPath(); g.ellipse(X(lo), Y(la), rx, ry, 0, 0, 7); g.fill(); }
    g.fillStyle = '#eef3f6'; g.fillRect(0, Y(-68), w, h); g.fillRect(0, 0, w, Y(80));
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 2, 2); }
  }, { repeat: [1, 1], aniso: 8 });
}
function cloudLayerTex() {
  return canvasTex('earthClouds', 1024, 512, (g, w, h) => {
    const r = rng(8); g.clearRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const x = r() * w, y = h * (0.15 + r() * 0.7), rad = 6 + r() * 26; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  }, { repeat: [1, 1] });
}

// 23.05–25.70  «с просьбой посмотреть, можно ли хоть что-то спасти»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05070f');
  const R = 5;
  const earth = new THREE.Group(); scene.add(earth);
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), M.std({ map: earthTex(), roughness: 0.95, metalness: 0 })));
  const cl = new THREE.Mesh(new THREE.SphereGeometry(R * 1.012, 64, 48), new THREE.MeshStandardMaterial({ map: cloudLayerTex(), transparent: true, depthWrite: false, roughness: 1 })); earth.add(cl);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.06, 64, 48), new THREE.MeshBasicMaterial({ color: '#6fb4ff', transparent: true, opacity: 0.07, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })); earth.add(atm);
  // stars
  const sp = []; const r = rng(4); for (let i = 0; i < 1500; i++) { const v = V(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(150); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#cfd8ff', size: 1.5, sizeAttenuation: false })));
  const sunL = new THREE.DirectionalLight('#fff0d8', 2.2); sunL.position.set(-10, 8, 12); scene.add(sunL);
  scene.add(new THREE.AmbientLight('#3a4a70', 0.5));

  // route: Persian Gulf -> Redmond, WA
  const A = ll2v(26.5, 50.5), B = ll2v(47.6, -122.1);
  const route = (k) => { const q = new THREE.Quaternion().setFromUnitVectors(A, B); const qi = new THREE.Quaternion().slerp(q, k); return A.clone().applyQuaternion(qi).multiplyScalar(R * (1 + 0.1 * Math.sin(Math.PI * k) + 0.012)); };
  const dots = [];
  for (let i = 0; i < 90; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,255,255,1)'), color: '#ffd04a', blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(0.09); s.position.copy(route(i / 89)); s.userData.k = i / 89; earth.add(s); dots.push(s); }
  for (const [p, c] of [[A, '#ff5a3a'], [B, '#ffd04a']]) { const pin = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,255,255,1)'), color: c, blending: THREE.AdditiveBlending, depthWrite: false })); pin.scale.setScalar(0.5); pin.position.copy(p.clone().multiplyScalar(R * 1.02)); earth.add(pin); }
  const dest = labelTex('NINTENDO', { font: 'Russo', size: 90, color: '#fff', bg: '#d0121b', pad: 18 });
  const destM = new THREE.Sprite(new THREE.SpriteMaterial({ map: dest.tex, depthWrite: false })); destM.scale.set(1.3, 1.3 / dest.aspect, 1); destM.position.copy(B.clone().multiplyScalar(R * 1.18)); earth.add(destM);

  // cargo plane towing a banner
  const plane = new THREE.Group(); earth.add(plane);
  const J = jet('#8a9468'); J.scale.setScalar(0.045); plane.add(J);
  const { tex, aspect } = labelTex('МОЖНО СПАСТИ?', { font: 'Russo', size: 120, color: '#c8141b', bg: '#fbf6e8', pad: 40, border: '#c8141b' });
  const bw = 1.3, bh = bw / aspect;
  const bannerGeo = new THREE.PlaneGeometry(bw, bh, 30, 3);
  const banner = new THREE.Mesh(bannerGeo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.8 }));
  plane.add(banner);
  const base = bannerGeo.attributes.position.array.slice();
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.35, 4), M.col('#ddd', 0.5)); rope.rotation.x = Math.PI / 2; rope.position.z = -0.4; plane.add(rope);

  const camera = new THREE.PerspectiveCamera(45, 1080 / 1920, 0.02, 400);
  const planeFill = point(scene, '#ffffff', 0, 4, [0, 0, 0]);

  function update(lt) {
    const k = lerp(0.04, 0.96, easeInOut(inv(0, 2.6, lt)));
    // spin the globe a bit so the flight reads west-bound
    earth.rotation.y = -0.9 + lt * 0.12;
    earth.rotation.x = 0.25;
    cl.rotation.y = lt * 0.03;
    const p = route(k), p2 = route(Math.min(1, k + 0.01));
    plane.position.copy(p);
    const up = p.clone().normalize(); const fwd = p2.clone().sub(p).normalize();
    const m = new THREE.Matrix4().lookAt(V(0, 0, 0), fwd.clone().negate(), up); plane.quaternion.setFromRotationMatrix(m);
    plane.rotateY(Math.PI);
    // banner trails behind (local -z), waving
    banner.position.set(0, 0, -0.62 - bw / 2); banner.rotation.set(0, -Math.PI / 2, 0);
    const pos = bannerGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = base[i * 3]; const w = (x + bw / 2) / bw; pos.setZ(i, Math.sin(x * 9 - lt * 14) * 0.05 * (1 - w * 0.6)); }
    pos.needsUpdate = true; bannerGeo.computeVertexNormals();
    dots.forEach((d) => { d.visible = d.userData.k <= k; });
    earth.updateMatrixWorld(true);
    const wp = plane.getWorldPosition(V()); const wup = wp.clone().normalize();
    const wfwd = plane.localToWorld(V(0, 0, 1)).sub(wp).normalize();
    planeFill.position.copy(wp).addScaledVector(wup, 0.6); planeFill.intensity = 0.4;
    // chase camera: behind/above/side, pulling back to reveal the globe
    const pull = smooth(inv(0.6, 2.6, lt));
    const side = new THREE.Vector3().crossVectors(wup, wfwd).normalize();
    const cam = wp.clone().addScaledVector(wfwd, lerp(-1.6, -3.2, pull)).addScaledVector(wup, lerp(0.8, 5.5, pull)).addScaledVector(side, lerp(0.9, 2.2, pull));
    setCam(camera, cam, wp.clone().addScaledVector(wfwd, 0.6).addScaledVector(wup, -lerp(0.1, 1.2, pull)), 0);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.4, bloomThreshold: 0.88, envIntensity: 0.05 };
}
