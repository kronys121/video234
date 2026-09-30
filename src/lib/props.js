import * as THREE from 'three';
import { M, TEX, rng, labelTex } from './util.js';
import { roundedBox } from './gameboy.js';
import { sign } from './env.js';

const sh = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
const box = (w, h, d, mat, x = 0, y = 0, z = 0, parent = null) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; };
const rbox = (w, h, d, r, mat, x = 0, y = 0, z = 0, parent = null) => { const m = new THREE.Mesh(roundedBox(w, h, d, r, [3, 3, 3]), mat); m.position.set(x, y, z); if (parent) parent.add(m); return m; };
export { box, rbox };

export function humvee(color = '#c2a878') {
  const g = new THREE.Group();
  const paint = M.col(color, 0.8);
  const dark = M.col('#1c1b18', 0.7);
  rbox(2.2, 0.7, 4.6, 0.08, paint, 0, 1.0, 0, g);
  rbox(2.0, 0.55, 2.0, 0.06, paint, 0, 1.6, -0.3, g);
  const glass = M.std({ color: '#2a3440', roughness: 0.1, metalness: 0.4 });
  box(1.8, 0.4, 0.05, glass, 0, 1.65, 0.72, g);
  for (const s of [-1, 1]) box(0.05, 0.35, 1.2, glass, 1.01 * s, 1.65, -0.2, g);
  rbox(2.1, 0.4, 1.3, 0.06, paint, 0, 1.28, 1.6, g); // hood
  box(1.6, 0.35, 0.1, dark, 0, 1.0, 2.32, g); // grille
  for (const s of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16), M.col('#ffe9b0', 0.2, 0, { emissive: '#ffcc77', emissiveIntensity: 0.6 }));
    hl.rotation.x = Math.PI / 2; hl.position.set(0.6 * s, 1.1, 2.36); g.add(hl);
    for (const z of [-1.5, 1.5]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.38, 22), dark); w.rotation.z = Math.PI / 2; w.position.set(1.0 * s, 0.48, z); g.add(w);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 12), M.col('#6a5c40', 0.6)); hub.rotation.z = Math.PI / 2; hub.position.set(1.0 * s, 0.48, z); g.add(hub);
    }
  }
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.5, 4), dark); ant.position.set(-0.9, 2.6, -1.8); ant.rotation.x = -0.2; g.add(ant);
  box(0.5, 0.3, 0.8, M.col('#5a4d33', 0.9), 0.5, 1.5, -1.9, g); // cargo
  return sh(g);
}

export function tent(w = 4, h = 2.4, d = 6, color = '#b7a37a') {
  const g = new THREE.Group();
  const mat = M.std({ map: TEX.fabric([4, 4], color), roughness: 0.95, side: THREE.DoubleSide });
  const shape = new THREE.Shape(); shape.moveTo(-w / 2, 0); shape.lineTo(-w / 2, h * 0.55); shape.lineTo(0, h); shape.lineTo(w / 2, h * 0.55); shape.lineTo(w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, steps: 4 });
  geo.translate(0, 0, -d / 2);
  const m = new THREE.Mesh(geo, mat); g.add(m);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.7), M.col('#2a241a', 0.9)); door.position.set(0, 0.85, d / 2 + 0.01); g.add(door);
  const rope = M.col('#4d4535', 0.9);
  for (const s of [-1, 1]) for (const z of [-d / 3, 0, d / 3]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.9, 4), rope); r.position.set((w / 2 + 0.6) * s, h * 0.3, z); r.rotation.z = 0.8 * s; g.add(r); }
  return sh(g);
}

export function sandbags(n = 6, rows = 2, seed = 1) {
  const g = new THREE.Group(); const r = rng(seed);
  const mat = M.std({ map: TEX.fabric([1, 1], '#b59f73'), roughness: 1 });
  for (let row = 0; row < rows; row++) for (let i = 0; i < n - row; i++) {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.34, 4, 10), mat);
    b.rotation.z = Math.PI / 2; b.scale.set(1, 1, 0.6);
    b.position.set((i - (n - row - 1) / 2) * 0.64 + (r() - 0.5) * 0.04, 0.12 + row * 0.2, (r() - 0.5) * 0.05); g.add(b);
  }
  return sh(g);
}

export function derrick(h = 8) {
  const g = new THREE.Group(); const mat = M.col('#2a2622', 0.7, 0.4);
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, h * 1.02, 6), mat);
    leg.position.set(x * 0.6, h / 2, z * 0.6); leg.rotation.z = -x * 0.075; leg.rotation.x = z * 0.075; g.add(leg);
  }
  for (let y = 1; y < h; y += 1.2) { const k = 1 - y / h * 0.6; box(1.9 * k, 0.05, 0.05, mat, 0, y, 0.95 * k, g); box(1.9 * k, 0.05, 0.05, mat, 0, y, -0.95 * k, g); box(0.05, 0.05, 1.9 * k, mat, 0.95 * k, y, 0, g); box(0.05, 0.05, 1.9 * k, mat, -0.95 * k, y, 0, g); }
  return sh(g);
}

export function binoculars() {
  const g = new THREE.Group(); const mat = M.col('#2b2d22', 0.6);
  for (const s of [-1, 1]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.036, 0.14, 16), mat); t.rotation.x = Math.PI / 2; t.position.x = 0.037 * s; g.add(t);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), M.std({ color: '#223', roughness: 0.05, metalness: 0.8 })); lens.position.set(0.037 * s, 0, -0.071); lens.rotation.y = Math.PI; g.add(lens);
  }
  box(0.03, 0.03, 0.06, mat, 0, 0.0, 0, g);
  return sh(g);
}

export function bunkBed(frameColor = '#4a5a44') {
  const g = new THREE.Group();
  const fm = M.col(frameColor, 0.5, 0.6);
  const mat = M.std({ map: TEX.fabric([2, 4], '#6b7a5a'), roughness: 0.95 });
  const sheet = M.std({ map: TEX.fabric([2, 2], '#d9d4c5'), roughness: 0.95 });
  for (const x of [-0.45, 0.45]) for (const z of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.9, 10), fm); p.position.set(x, 0.95, z); g.add(p); }
  for (const y of [0.4, 1.35]) {
    for (const x of [-0.45, 0.45]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.0, 8), fm); r.rotation.x = Math.PI / 2; r.position.set(x, y, 0); g.add(r); }
    const mt = rbox(0.86, 0.14, 1.95, 0.05, mat, 0, y + 0.09, 0, g);
    const blanket = rbox(0.9, 0.05, 1.2, 0.02, M.std({ map: TEX.fabric([2, 2], '#4f5d3b'), roughness: 1 }), 0, y + 0.17, 0.35, g);
    const pillow = rbox(0.6, 0.1, 0.35, 0.05, sheet, 0, y + 0.21, -0.75, g);
    void mt; void blanket; void pillow;
  }
  for (const z of [-1, 1]) for (const y of [0.2, 0.7, 1.7]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8), fm); r.rotation.z = Math.PI / 2; r.position.set(0, y, z); g.add(r); }
  return sh(g);
}

export function footlocker(label = 'US ARMY') {
  const g = new THREE.Group();
  const mat = M.std({ map: TEX.plywood([1, 1], '#556042'), roughness: 0.7 });
  rbox(0.9, 0.4, 0.45, 0.02, mat, 0, 0.2, 0, g);
  const trim = M.col('#8a8f88', 0.4, 0.8);
  for (const x of [-0.44, 0.44]) box(0.02, 0.41, 0.46, trim, x, 0.2, 0, g);
  box(0.08, 0.06, 0.02, trim, 0, 0.33, 0.23, g);
  const s = sign(label, { width: 0.5, color: '#e6e0c8', grunge: 0.7, pad: 10 }); s.position.set(0, 0.2, 0.227); g.add(s);
  return sh(g);
}

export function hangingLamp(color = '#ffcf8a', intensity = 6) {
  const g = new THREE.Group();
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 4), M.col('#111', 0.8)); cord.position.y = 0.5; g.add(cord);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.18, 20, 1, true), M.col('#3d4a36', 0.5, 0.5, { side: THREE.DoubleSide })); shade.position.y = -0.02; g.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), M.emis(color, 6)); bulb.position.y = -0.1; g.add(bulb);
  const l = new THREE.PointLight(color, intensity, 12, 1.6); l.position.y = -0.15; l.castShadow = false; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.003; l.shadow.radius = 5; g.add(l);
  g.userData.light = l; g.userData.bulb = bulb;
  sh(g); bulb.castShadow = false; shade.castShadow = false;
  return g;
}

export function jet(color = '#6f7478') {
  const g = new THREE.Group();
  const mat = M.col(color, 0.45, 0.5);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 9, 14), mat); body.rotation.x = Math.PI / 2; g.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.2, 14), mat); nose.rotation.x = Math.PI / 2; nose.position.z = 5.6; g.add(nose);
  const can = new THREE.Mesh(new THREE.SphereGeometry(0.4, 14, 10), M.std({ color: '#223040', roughness: 0.05, metalness: 0.6 })); can.scale.set(0.8, 0.7, 2); can.position.set(0, 0.35, 2.6); g.add(can);
  const wingShape = new THREE.Shape(); wingShape.moveTo(0, 1.5); wingShape.lineTo(4.8, -1.2); wingShape.lineTo(4.8, -2.2); wingShape.lineTo(0, -2.4);
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.ExtrudeGeometry(wingShape, { depth: 0.12, bevelEnabled: false }), mat);
    w.rotation.x = Math.PI / 2; w.scale.x = s; w.position.y = 0.06; g.add(w);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 1.4), mat); tail.position.set(0.7 * s, 1.0, -3.8); tail.rotation.z = -0.35 * s; tail.rotation.x = 0.3; g.add(tail);
    const hs = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.2), mat); hs.position.set(1.3 * s, 0, -4.2); g.add(hs);
  }
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.5, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#ff9a3c', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  flame.rotation.x = -Math.PI / 2; flame.position.z = -5.8; g.add(flame); g.userData.flame = flame;
  return sh(g);
}

export function tree(seed = 1, h = 5) {
  const g = new THREE.Group(); const r = rng(seed);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, h * 0.5, 8), M.col('#5a3f2a', 0.9)); trunk.position.y = h * 0.25; g.add(trunk);
  const cols = ['#3f6b2e', '#4f7d35', '#355c26'];
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(h * (0.16 + r() * 0.1), 1), M.col(cols[i % 3], 0.9, 0, { flatShading: true }));
    c.position.set((r() - 0.5) * h * 0.3, h * (0.55 + r() * 0.3), (r() - 0.5) * h * 0.3); g.add(c);
  }
  return sh(g);
}

export function palm(seed = 1, h = 6) {
  const g = new THREE.Group(); const r = rng(seed);
  const tm = M.col('#7a6446', 0.9);
  let y = 0; let x = 0;
  for (let i = 0; i < 10; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.16 - i * 0.006, 0.19 - i * 0.006, h / 10, 8), tm); x = Math.sin(i * 0.15) * 0.3; s.position.set(x, y + h / 20, 0); g.add(s); y += h / 10; }
  const lm = M.col('#3f7a2c', 0.8, 0, { side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.6, 1, 6), lm);
    const p = leaf.geometry.attributes.position; for (let k = 0; k < p.count; k++) { const yy = p.getY(k); p.setZ(k, -Math.pow((yy + 1.3) / 2.6, 2) * 0.9); } leaf.geometry.computeVertexNormals();
    leaf.geometry.translate(0, 1.3, 0);
    const piv = new THREE.Group(); piv.position.set(x, y, 0); piv.rotation.y = i / 9 * Math.PI * 2 + r() * 0.3; g.add(piv);
    leaf.rotation.x = -1.0 - r() * 0.4; piv.add(leaf);
  }
  return sh(g);
}

// office / HQ building facade block with windows
export function building({ w = 20, h = 12, d = 10, wall = '#cdbfa8', win = '#6d8aa6', floors = 4, cols = 8, seed = 1 } = {}) {
  const g = new THREE.Group();
  const wm = M.std({ map: TEX.concrete([4, 3], wall), roughness: 0.85 });
  box(w, h, d, wm, 0, h / 2, 0, g);
  const glass = M.std({ color: win, roughness: 0.08, metalness: 0.6, envMapIntensity: 1.5 });
  const frame = M.col('#e9e4da', 0.5);
  const r = rng(seed);
  const fh = h / floors;
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const x = -w / 2 + (c + 0.5) * w / cols, y = f * fh + fh * 0.55;
    box(w / cols * 0.62, fh * 0.55, 0.08, frame, x, y, d / 2 + 0.02, g);
    const gl = box(w / cols * 0.54, fh * 0.47, 0.06, glass, x, y, d / 2 + 0.06, g);
    if (r() < 0.3) gl.material = M.col('#ffe0a8', 0.3, 0, { emissive: '#ffcf8a', emissiveIntensity: 0.4 });
  }
  box(w + 0.4, 0.4, d + 0.4, frame, 0, h + 0.2, 0, g);
  for (let f = 1; f < floors; f++) box(w + 0.1, 0.15, 0.2, frame, 0, f * fh, d / 2 + 0.05, g);
  return sh(g);
}

export function desk(w = 2.2, d = 0.9, h = 0.9, top = '#d8d4cc') {
  const g = new THREE.Group();
  rbox(w, 0.06, d, 0.015, M.std({ map: TEX.plywood([2, 1], top), roughness: 0.6 }), 0, h, 0, g);
  const lm = M.col('#3c3f44', 0.4, 0.7);
  for (const x of [-w / 2 + 0.08, w / 2 - 0.08]) for (const z of [-d / 2 + 0.08, d / 2 - 0.08]) box(0.05, h, 0.05, lm, x, h / 2, z, g);
  box(w - 0.2, 0.25, 0.03, lm, 0, h - 0.18, -d / 2 + 0.08, g);
  return sh(g);
}

export function deskLamp(color = '#ffd9a0') {
  const g = new THREE.Group(); const m = M.col('#2d3a55', 0.4, 0.6);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 20), m); base.position.y = 0.015; g.add(base);
  const a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 8), m); a1.position.set(0, 0.2, -0.05); a1.rotation.x = 0.25; g.add(a1);
  const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8), m); a2.position.set(0, 0.42, 0.06); a2.rotation.x = 1.1; g.add(a2);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.14, 20, 1, true), M.col('#2d3a55', 0.4, 0.6, { side: THREE.DoubleSide })); head.position.set(0, 0.45, 0.22); head.rotation.x = -0.6; g.add(head);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), M.emis(color, 5)); bulb.position.set(0, 0.42, 0.24); g.add(bulb);
  const l = new THREE.SpotLight(color, 12, 4, 0.8, 0.5, 1.5); l.position.set(0, 0.42, 0.24); l.target.position.set(0, 0, 0.45); l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0015;
  g.add(l, l.target);
  sh(g); bulb.castShadow = false;
  return g;
}

// motherboard with chips (DMG-ish); returns group with parts for exploded animation
export function motherboard() {
  const g = new THREE.Group(); const parts = [];
  const pcb = new THREE.Mesh(roundedBox(0.08, 0.13, 0.0016, 0.0006, [4, 4, 1]), M.std({ color: '#1f5a2e', roughness: 0.5, metalness: 0.1, map: TEX.metal([1, 1], '#2a6b3a') }));
  g.add(pcb);
  const trace = M.col('#c9a24a', 0.3, 0.9);
  const r = rng(9);
  for (let i = 0; i < 40; i++) { const t = box(0.0006 + (r() < 0.5 ? 0.03 * r() : 0), 0.0006 + (r() >= 0.5 ? 0.04 * r() : 0), 0.0003, trace, (r() - 0.5) * 0.07, (r() - 0.5) * 0.12, 0.0009, g); void t; }
  const chip = M.col('#16161a', 0.35);
  const specs = [[0.028, 0.028, 0, 0.02, 'CPU'], [0.018, 0.01, -0.02, -0.02, 'RAM'], [0.018, 0.01, 0.02, -0.02, 'RAM'], [0.012, 0.012, 0.022, -0.045, ''], [0.01, 0.006, -0.02, -0.045, '']];
  specs.forEach(([w, h, x, y, lbl]) => {
    const c = new THREE.Group(); c.position.set(x, y, 0.0015); g.add(c); parts.push(c);
    box(w, h, 0.0025, chip, 0, 0, 0.0012, c);
    for (let k = -3; k <= 3; k++) { box(0.0008, 0.002, 0.0006, M.col('#c7c7c7', 0.3, 0.9), k * w / 8, h / 2 + 0.001, 0.0005, c); box(0.0008, 0.002, 0.0006, M.col('#c7c7c7', 0.3, 0.9), k * w / 8, -h / 2 - 0.001, 0.0005, c); }
    if (lbl) { const s = sign(lbl, { width: w * 0.7, color: '#bbbbbb', size: 80, pad: 6 }); s.position.z = 0.0026; c.add(s); }
  });
  for (let i = 0; i < 10; i++) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.005, 12), M.col(i % 2 ? '#2a3f8a' : '#1a1a1a', 0.4, 0.3));
    cap.rotation.x = Math.PI / 2; cap.position.set(-0.032 + (i % 5) * 0.016, 0.052 - Math.floor(i / 5) * 0.012, 0.003); g.add(cap); parts.push(cap);
  }
  return { group: sh(g), parts };
}

export function battery(burnt = false) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.05, 20), burnt ? M.std({ color: '#fff', map: TEX.soot(), roughness: 0.9 }) : M.col('#c23a1c', 0.4, 0.3));
  g.add(body);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.002, 12), M.col(burnt ? '#222' : '#cfcfcf', 0.3, 0.9)); top.position.y = 0.026; g.add(top);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.0071, 0.0071, 0.004, 20), M.col(burnt ? '#1a1a1a' : '#bdbdbd', 0.3, 0.9)); cap.position.y = -0.023; g.add(cap);
  return sh(g);
}

export function cardboardBox(w = 0.4, h = 0.3, d = 0.3) {
  const g = new THREE.Group(); const mat = M.std({ map: TEX.cardboard(), roughness: 0.95 });
  const inner = M.std({ map: TEX.cardboard(), roughness: 1, color: '#9a8466', side: THREE.DoubleSide });
  const t = 0.006;
  box(w, t, d, mat, 0, t / 2, 0, g);
  box(w, h, t, mat, 0, h / 2, d / 2, g); box(w, h, t, mat, 0, h / 2, -d / 2, g);
  box(t, h, d, mat, w / 2, h / 2, 0, g); box(t, h, d, mat, -w / 2, h / 2, 0, g);
  const flaps = [];
  for (const s of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(0, h, (d / 2) * s); g.add(piv);
    const f = box(w, t, d / 2, inner, 0, 0, -(d / 4) * s, piv); void f; flaps.push({ piv, s });
  }
  return { group: sh(g), flaps };
}

// photo-free face poster etc: framed picture with canvas drawing
export function poster(draw, w = 0.6, h = 0.8, key = 'poster') {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = 300; c.height = 400; draw(c.getContext('2d'), 300, 400);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.std({ map: t, roughness: 0.6 })); p.position.z = 0.012; g.add(p);
  box(w + 0.05, h + 0.05, 0.02, M.col('#2b2118', 0.6), 0, 0, 0, g);
  void key; return sh(g);
}

export { labelTex };
