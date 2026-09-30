import * as THREE from 'three';
import { M, TEX, canvasTex, labelTex, rng, speckle } from './util.js';

// subdivided box whose corners are rounded by projection: deformable afterwards
export function roundedBox(w, h, d, r, seg = [12, 16, 4]) {
  const g = new THREE.BoxGeometry(w, h, d, seg[0], seg[1], seg[2]);
  const p = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3();
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    c.set(THREE.MathUtils.clamp(v.x, -hx, hx), THREE.MathUtils.clamp(v.y, -hy, hy), THREE.MathUtils.clamp(v.z, -hz, hz));
    const n = v.clone().sub(c); if (n.lengthSq() > 1e-12) n.normalize().multiplyScalar(r);
    v.copy(c).add(n); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = x - ix, fy = y - iy, fz = z - iz;
  const u = (t) => t * t * (3 - 2 * t); const a = u(fx), b = u(fy), c = u(fz);
  const l = (p, q, t) => p + (q - p) * t;
  const n = (dx, dy, dz) => hash3(ix + dx, iy + dy, iz + dz);
  return l(l(l(n(0, 0, 0), n(1, 0, 0), a), l(n(0, 1, 0), n(1, 1, 0), a), b), l(l(n(0, 0, 1), n(1, 0, 1), a), l(n(0, 1, 1), n(1, 1, 1), a), b), c) * 2 - 1;
}

// DMG screen: dynamic canvas. mode: 'off' | 'tetris' | 'boot'
export function makeScreen() {
  const c = document.createElement('canvas'); c.width = 160 * 2; c.height = 144 * 2;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter;
  const P = ['#e0f0a0', '#9bbc0f', '#4f7a2a', '#1e3a18'];
  const S = 2;
  let last = -1;
  function draw(mode, t) {
    const key = mode + '|' + Math.floor(t * 12);
    if (key === last) return; last = key;
    if (mode === 'off') { g.fillStyle = '#6f7c3a'; g.fillRect(0, 0, c.width, c.height); tex.needsUpdate = true; return; }
    g.fillStyle = P[0]; g.fillRect(0, 0, c.width, c.height);
    if (mode === 'boot') {
      const y = Math.min(62, -20 + t * 55);
      g.fillStyle = P[3]; g.font = `bold ${16 * S}px Russo`; g.textAlign = 'center'; g.fillText('Nintendo', 80 * S, y * S);
      tex.needsUpdate = true; return;
    }
    // tetris: well 10x18 of 8px cells at x=16
    const cell = 7 * S, ox = 10 * S, oy = 4 * S;
    g.fillStyle = P[2]; g.fillRect(ox - 4 * S, 0, 4 * S, c.height); g.fillRect(ox + 10 * cell, 0, 4 * S, c.height);
    const r = rng(7);
    const stack = [];
    for (let row = 0; row < 7; row++) for (let col = 0; col < 10; col++) if (r() < 0.72 - row * 0.02 && !(col === 4 && row < 3)) stack.push([col, 19 - row]);
    const drawCell = (x, y, shade) => {
      g.fillStyle = P[shade]; g.fillRect(ox + x * cell, oy + y * cell - 7 * S * 1, cell - S, cell - S);
      g.fillStyle = P[0]; g.fillRect(ox + x * cell + 2 * S, oy + y * cell - 7 * S + 2 * S, cell - 5 * S, cell - 5 * S);
      g.fillStyle = P[shade]; g.fillRect(ox + x * cell + 3 * S, oy + y * cell - 7 * S + 3 * S, cell - 7 * S, cell - 7 * S);
    };
    stack.forEach(([x, y]) => drawCell(x, y, 3));
    // falling piece (T / L alternating)
    const fall = Math.floor(t * 5) % 16; const kind = Math.floor(t * 5 / 16) % 3;
    const shapes = [[[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [1, 0], [0, 1], [1, 1]]];
    shapes[kind].forEach(([x, y]) => drawCell(3 + x, fall + y + 1, 2));
    // side panel
    g.fillStyle = P[1]; g.fillRect(ox + 10 * cell + 4 * S, 0, c.width, c.height);
    g.fillStyle = P[3]; g.font = `${9 * S}px Russo`; g.textAlign = 'left';
    const px = ox + 10 * cell + 9 * S;
    g.fillText('SCORE', px, 18 * S); g.fillText(String(1991 + Math.floor(t * 40)), px, 32 * S);
    g.fillText('LEVEL', px, 60 * S); g.fillText('9', px + 10 * S, 74 * S);
    g.fillText('LINES', px, 100 * S); g.fillText(String(42 + Math.floor(t)), px + 4 * S, 114 * S);
    tex.needsUpdate = true;
  }
  draw('off', 0);
  return { tex, draw };
}

function bezelTex() {
  return canvasTex('gbBezel', 600, 470, (g, w, h) => {
    g.fillStyle = '#51535f'; g.fillRect(0, 0, w, h);
    // top stripes
    g.fillStyle = '#7b2150'; g.fillRect(24, 26, w - 48, 5);
    g.fillStyle = '#23234f'; g.fillRect(24, 37, w - 48, 5);
    g.fillStyle = '#51535f'; g.fillRect(150, 18, 300, 30);
    g.fillStyle = '#d8d8e0'; g.font = 'italic 17px Arial'; g.textAlign = 'center'; g.fillText('DOT MATRIX WITH STEREO SOUND', w / 2, 40);
    // battery led
    g.fillStyle = '#20070a'; g.beginPath(); g.arc(58, 190, 9, 0, 7); g.fill();
    g.fillStyle = '#c8c8d0'; g.font = '13px Arial'; g.fillText('BATTERY', 58, 225);
  }, { repeat: [1, 1] });
}

/**
 * DMG-01 model. Size in meters (90 x 148 x 32mm). opts.burnt = 0..1 melt/soot amount.
 * returns { group, screen, cart, parts }
 */
export function gameboy(opts = {}) {
  const burnt = opts.burnt || 0;
  const group = new THREE.Group();
  const W = 0.09, H = 0.148, Dp = 0.032;
  const sootTex = TEX.soot([1, 1]);
  const bodyMat = burnt ? M.std({ color: '#ffffff', map: sootTex, roughness: 0.75, metalness: 0.05, bumpMap: sootTex, bumpScale: 1.5 }) : M.col('#b9b4a9', 0.5);
  const darkMat = burnt ? M.col('#0d0c0b', 0.6) : M.col('#1b1b1f', 0.45);
  const abMat = burnt ? M.col('#2a0d18', 0.5) : M.col('#8e1c4f', 0.35);
  const pillMat = burnt ? M.col('#141414', 0.7) : M.col('#6b6b73', 0.6);
  const parts = {};

  const body = new THREE.Mesh(roundedBox(W, H, Dp, 0.0055, [14, 22, 5]), bodyMat); group.add(body); parts.body = body;
  // top groove lines
  for (const y of [0.066, 0.061]) { const l = new THREE.Mesh(new THREE.BoxGeometry(W * 0.96, 0.0009, 0.001), M.col(burnt ? '#050505' : '#a9a59c', 0.6)); l.position.set(0, y, Dp / 2 + 0.0002); group.add(l); }
  // bezel
  const bez = new THREE.Mesh(roundedBox(0.078, 0.06, 0.0016, 0.0007, [10, 8, 1]), burnt ? M.col('#171617', 0.5) : M.std({ map: bezelTex(), roughness: 0.4 }));
  bez.position.set(0, 0.03, Dp / 2 + 0.0004); group.add(bez); parts.bezel = bez;
  // screen
  const screen = makeScreen();
  const scrMat = new THREE.MeshStandardMaterial({ map: screen.tex, emissiveMap: screen.tex, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.25, metalness: 0 });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.047, 0.043), scrMat); scr.position.set(0.001, 0.029, Dp / 2 + 0.0014); group.add(scr); parts.screenMesh = scr;
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.058), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.08, roughness: 0.02, metalness: 0.3 }));
  glass.position.set(0, 0.03, Dp / 2 + 0.0017); group.add(glass);
  // front label
  const lab = labelTex('GAME BOY', { font: 'Russo', size: 90, color: burnt ? '#2d2c3a' : '#1f2a7a', pad: 12 });
  const labM = new THREE.Mesh(new THREE.PlaneGeometry(0.036, 0.036 / lab.aspect), new THREE.MeshStandardMaterial({ map: lab.tex, transparent: true, roughness: 0.5 }));
  labM.position.set(0.004, -0.0065, Dp / 2 + 0.0003); group.add(labM);
  const nl = labelTex('Nintendo', { font: 'Russo', size: 80, color: burnt ? '#2d2c3a' : '#1f2a7a', pad: 10 });
  const nlM = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 0.018 / nl.aspect), new THREE.MeshStandardMaterial({ map: nl.tex, transparent: true, roughness: 0.5 }));
  nlM.position.set(-0.024, -0.0065, Dp / 2 + 0.0003); group.add(nlM);
  // d-pad
  const dp = new THREE.Group(); dp.position.set(-0.024, -0.03, Dp / 2); group.add(dp); parts.dpad = dp;
  const well = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.001, 28), M.col(burnt ? '#1a1816' : '#b7b3aa', 0.6)); well.rotation.x = Math.PI / 2; dp.add(well);
  for (const r of [0, Math.PI / 2]) { const bar = new THREE.Mesh(roundedBox(0.022, 0.0072, 0.005, 0.0012, [4, 2, 2]), darkMat); bar.rotation.z = r; bar.position.z = 0.0022; dp.add(bar); }
  const dimple = new THREE.Mesh(new THREE.SphereGeometry(0.002, 10, 8), M.col('#0a0a0c', 0.5)); dimple.position.z = 0.0042; dimple.scale.z = 0.3; dp.add(dimple);
  // A/B
  parts.ab = [];
  for (const [x, y, t] of [[0.017, -0.035, 'B'], [0.031, -0.027, 'A']]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0052, 0.0052, 0.004, 24), abMat); b.rotation.x = Math.PI / 2; b.position.set(x, y, Dp / 2 + 0.0018); group.add(b); parts.ab.push(b);
    const bevel = new THREE.Mesh(new THREE.TorusGeometry(0.0052, 0.0008, 6, 24), abMat); bevel.position.set(x, y, Dp / 2 + 0.0038); group.add(bevel);
    const lt = labelTex(t, { font: 'Russo', size: 90, color: burnt ? '#222' : '#23234f', pad: 6 });
    const lm = new THREE.Mesh(new THREE.PlaneGeometry(0.0036, 0.0036 / lt.aspect), new THREE.MeshBasicMaterial({ map: lt.tex, transparent: true }));
    lm.position.set(x + 0.0015, y - 0.0085, Dp / 2 + 0.0003); group.add(lm);
  }
  // start/select
  for (const x of [-0.0075, 0.0075]) {
    const p = new THREE.Mesh(new THREE.CapsuleGeometry(0.0015, 0.007, 4, 8), pillMat); p.rotation.z = Math.PI / 2 - 0.45; p.position.set(x, -0.052, Dp / 2 + 0.0012); group.add(p);
  }
  // speaker grille
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.0018, 0.015, 0.001), M.col('#3b3a38', 0.8));
    s.rotation.z = 0.52; s.position.set(0.021 + i * 0.0035, -0.058 + i * 0.0006, Dp / 2 + 0.0002); group.add(s);
  }
  // side wheels
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.003, 20), M.col(burnt ? '#111' : '#8d8a83', 0.6)); wheel.rotation.z = Math.PI / 2; wheel.position.set(W / 2 + 0.0005, -0.035, 0.004); group.add(wheel);
  const wheel2 = wheel.clone(); wheel2.position.x = -W / 2 - 0.0005; wheel2.position.y = 0.02; group.add(wheel2);
  // back: battery cover
  const bc = new THREE.Mesh(roundedBox(0.066, 0.05, 0.002, 0.0008, [6, 5, 1]), burnt ? M.col('#070606', 0.9) : M.col('#bfbbb1', 0.55));
  bc.position.set(0, -0.042, -Dp / 2 - 0.0006); group.add(bc); parts.battCover = bc;
  for (let i = 0; i < 5; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.0012, 0.001), M.col(burnt ? '#000' : '#a19d94', 0.6)); r.position.set(0, -0.05 + i * 0.003, -Dp / 2 - 0.0018); group.add(r); }
  // cartridge (sticks out top-back)
  const cart = new THREE.Group(); group.add(cart); parts.cart = cart;
  const cartBody = new THREE.Mesh(roundedBox(0.057, 0.065, 0.008, 0.0012, [8, 10, 2]), burnt ? M.std({ color: '#fff', map: sootTex, roughness: 0.8 }) : M.col('#8f8c86', 0.55));
  cart.add(cartBody);
  const cl = labelTex('TETRIS', { font: 'Russo', size: 110, color: burnt ? '#e0cfa8' : '#f7f2e0', bg: burnt ? '#6a1a16' : '#b8262c', pad: 30, grunge: burnt ? 0.5 : 0 });
  const cartLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.046, 0.034), new THREE.MeshStandardMaterial({ map: cl.tex, roughness: 0.6 }));
  cartLabel.position.set(0, 0.004, -0.0042); cartLabel.rotation.y = Math.PI; cart.add(cartLabel);
  for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.0012, 0.0012), M.col(burnt ? '#050505' : '#777', 0.6)); r.position.set(0, 0.026 + i * 0.0022, -0.0045); cart.add(r); }
  cart.position.set(0, H / 2 - 0.022, -Dp / 2 + 0.004);
  parts.cartOut = 0; // 0 inserted, 1 pulled out (animated by scenes)

  if (burnt) {
    // melt deformation on the shell + small parts
    const melt = burnt;
    const deform = (mesh, local) => {
      const g = mesh.geometry = mesh.geometry.clone();
      const p = g.attributes.position; const v = new THREE.Vector3();
      mesh.updateMatrix();
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrix);
        const nx = v.x / (W / 2), ny = v.y / (H / 2);
        const sag = Math.max(0, nx * 0.6 + ny * 0.8 - 0.3); // top-right corner drooped
        const dz = vnoise(v.x * 60, v.y * 60, v.z * 60) * 0.0022 + vnoise(v.x * 160, v.y * 160, 3) * 0.0008;
        const dy = -sag * sag * 0.009;
        const dx = vnoise(v.y * 30, 1, 2) * 0.0014 - sag * 0.003;
        const twist = ny * 0.05;
        v.x += dx * melt; v.y += dy * melt; v.z += (dz + (v.z > 0 ? -sag * 0.004 : sag * 0.002) + Math.sin(ny * 3) * 0.0015) * melt;
        const zx = v.z; v.z = zx * Math.cos(twist * melt) - v.x * Math.sin(twist * melt) * 0.2;
        v.applyMatrix4(new THREE.Matrix4().copy(mesh.matrix).invert());
        p.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
    };
    group.children.forEach((c) => { if (c.isMesh && c.geometry.attributes.position.count > 60) deform(c); });
    // bubbles / blisters and charred crust
    const r = rng(77);
    const crust = M.std({ color: '#fff', map: sootTex, roughness: 0.9, bumpMap: sootTex, bumpScale: 2 });
    for (let i = 0; i < 40; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.002 + r() * 0.004, 10, 8), crust);
      const side = r() < 0.7 ? 1 : -1;
      b.position.set((r() - 0.5) * W * 0.95, (r() - 0.5) * H * 0.95, side * (Dp / 2 - 0.0005)); b.scale.z = 0.45; group.add(b);
    }
    // cracked screen glass
    const crack = canvasTex('crack', 256, 256, (g, w, h) => {
      g.clearRect(0, 0, w, h); const rr = rng(5); g.strokeStyle = 'rgba(230,230,210,0.55)'; g.lineWidth = 1.2;
      for (let i = 0; i < 14; i++) { let x = w * 0.62, y = h * 0.35; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rr() - 0.5) * 70; y += (rr() - 0.5) * 70; g.lineTo(x, y); } g.stroke(); }
      speckle(g, w, h, 300, ['rgba(20,15,10,0.5)'], 1, 6, 6);
    }, { repeat: [1, 1] });
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.052), new THREE.MeshBasicMaterial({ map: crack, transparent: true, depthWrite: false }));
    cm.position.set(0.001, 0.029, Dp / 2 + 0.0022); group.add(cm); parts.crack = cm;
  }

  group.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return { group, screen, scrMat, parts };
}

// set screen state; power 0..1 fades in the backlight-ish emissive
export function gbScreen(gb, mode, t, power = 1) {
  gb.screen.draw(mode, t);
  gb.scrMat.emissiveIntensity = mode === 'off' ? 0 : 0.55 * power;
}
