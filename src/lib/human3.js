import * as THREE from 'three';
import { human2, idle2 } from './human2.js';
import { solidHuman } from './overlap.js';
import { canvasTex, rng, clamp, lerp } from './util.js';

// Third-generation character: the human2 rig and body, upgraded with a sculpted head (jaw, cheekbones, eye sockets,
// brow ridge, blush), shaped nose and ears, lashes and textured irises, layered hair, five-finger hands,
// clothing details (collars, hood, pockets, lapels and tie, belt buckle, sneakers) and sheen fabric / skin materials.
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const g2 = (dx, dy, s) => Math.exp(-(dx * dx + dy * dy) / s);

// unit-sphere point → head-space point (head group coordinates, same frame as human2's skull)
function headMap(ux, uy, uz, inflate = 0) {
  const top = uy > 0;
  let y = 0.07 + uy * (top ? 0.148 : 0.128);
  const jaw = sm(-0.05, 0.95, -uy);
  let x = ux * (0.106 * (top ? 1 - 0.06 * uy * uy : 1 - 0.4 * jaw));
  let z;
  if (uz >= 0) z = uz * (0.112 - 0.012 * jaw);
  else z = uz * 0.118 * (top ? 1.04 : 1 - 0.5 * sm(-0.15, -0.95, uy));
  if (uz > 0.35) {
    const fz = sm(0.35, 0.8, uz);
    for (const s of [-1, 1]) z -= 0.013 * fz * g2(ux - 0.37 * s, uy - 0.18, 0.024);   // eye sockets
    z += 0.006 * fz * g2(ux, uy - 0.36, 0.09) * (1 - 0.6 * g2(ux, uy - 0.36, 0.01));    // brow ridge
    z += 0.007 * fz * g2(ux, uy + 0.5, 0.09);                                             // muzzle / mouth area
    z += 0.009 * fz * g2(ux, uy + 0.86, 0.05);                                            // chin
  }
  for (const s of [-1, 1]) x += 0.006 * s * g2(ux - 0.78 * s, uy + 0.02, 0.06) * (uz > 0 ? 1 : 0.3); // cheekbones
  if (inflate) { const n = new THREE.Vector3(x, (y - 0.07) * 0.8, z).normalize(); x += n.x * inflate; y += n.y * inflate; z += n.z * inflate; }
  return [x, y, z];
}
function headGeo(skin) {
  const g = new THREE.SphereGeometry(1, 56, 40); const p = g.attributes.position; const col = [];
  const base = new THREE.Color('#ffffff'), blush = new THREE.Color('#ffd2c8'), lipC = new THREE.Color('#f0b0a4'), shade = new THREE.Color('#e8dcd4');
  for (let i = 0; i < p.count; i++) {
    const ux = p.getX(i), uy = p.getY(i), uz = p.getZ(i);
    const [x, y, z] = headMap(ux, uy, uz); p.setXYZ(i, x, y, z);
    const c = base.clone();
    if (uz > 0) { const f = sm(0, 0.6, uz); c.lerp(blush, f * Math.max(g2(ux - 0.55, uy + 0.18, 0.05), g2(ux + 0.55, uy + 0.18, 0.05)) * 0.9); c.lerp(lipC, f * g2(ux, uy + 0.55, 0.012) * 0.6); }
    c.lerp(shade, sm(-0.3, -1, uy) * 0.6); col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  return new THREE.Mesh(g, skin);
}
const HL = { short: [[0, 0.6], [0.9, 0.46], [1.4, 0.26], [2.0, -0.05], [Math.PI, -0.42]], long: [[0, 0.6], [0.9, 0.46], [1.3, 0.1], [2.0, -0.6], [Math.PI, -0.75]], buzz: [[0, 0.62], [0.9, 0.5], [1.4, 0.3], [2.0, 0.0], [Math.PI, -0.35]] };
function hairline(phi, style) { const T = HL[style] || HL.short; for (let i = 1; i < T.length; i++) if (phi <= T[i][0]) { const k = sm(T[i - 1][0], T[i][0], phi); return lerp(T[i - 1][1], T[i][1], k); } return T[T.length - 1][1]; }
// hair shell following the head with a hairline: front higher (forehead), temples, sideburns, nape
function hairGeo(style, mat) {
  const g = new THREE.SphereGeometry(1, 48, 32, 0, Math.PI * 2, 0, Math.PI * (style === 'long' ? 0.78 : 0.7)); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let ux = p.getX(i), uy = p.getY(i), uz = p.getZ(i);
    const hl = hairline(Math.abs(Math.atan2(ux, uz)), style);
    if (uy < hl) { const k = Math.sqrt(Math.max(0, 1 - hl * hl)) / Math.max(1e-4, Math.hypot(ux, uz)); ux *= k; uz *= k; uy = hl; }
    const thick = (style === 'buzz' ? 0.004 : 0.011) * (0.4 + 0.6 * sm(-0.5, 0.7, uy)) + 0.002;
    const [x, y, z] = headMap(ux, uy, uz, thick); p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); return new THREE.Mesh(g, mat);
}
const hairTex = (col) => canvasTex('hair3' + col, 256, 256, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); const r = rng(11); const c = new THREE.Color(col); for (let i = 0; i < 900; i++) { const k = 0.75 + r() * 0.5; g.strokeStyle = `rgb(${Math.min(255, c.r * 255 * k)},${Math.min(255, c.g * 255 * k)},${Math.min(255, c.b * 255 * k)})`; g.lineWidth = 1 + r() * 1.5; const x = r() * w; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + r() * 20 - 10, h * 0.3, x + r() * 20 - 10, h * 0.7, x + r() * 16 - 8, h); g.stroke(); } }, { repeat: [3, 1] });
const irisTex = (col) => canvasTex('iris3' + col, 128, 128, (g, w, h) => { const c = new THREE.Color(col); const rg = g.createRadialGradient(64, 64, 10, 64, 64, 64); rg.addColorStop(0, '#' + c.clone().multiplyScalar(1.5).getHexString()); rg.addColorStop(0.7, col); rg.addColorStop(0.93, '#' + c.clone().multiplyScalar(0.45).getHexString()); rg.addColorStop(1, '#111'); g.fillStyle = rg; g.fillRect(0, 0, w, h); const r = rng(3); g.globalAlpha = 0.25; for (let i = 0; i < 70; i++) { const a = r() * 6.283; g.strokeStyle = r() > 0.5 ? '#ffffff' : '#000000'; g.beginPath(); g.moveTo(64 + Math.cos(a) * 18, 64 + Math.sin(a) * 18); g.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56); g.stroke(); } g.globalAlpha = 1; g.fillStyle = '#050505'; g.beginPath(); g.arc(64, 64, 17, 0, 7); g.fill(); }, { repeat: [1, 1] });

const phys = (m, o = {}) => { const p = new THREE.MeshPhysicalMaterial({ color: m.color, map: m.map, roughness: m.roughness, metalness: m.metalness, ...o }); return p; };

export function human3(opts = {}) {
  const style = opts.hairStyle || 'short';
  const H = human2({ ...opts, hairStyle: 'bald', v3: true });
  const o = H.opts; o.hairStyle = style; const J = H.J, hg = J.headGroup;
  // ---- materials: soft skin with sheen, fabrics with sheen
  const skin = new THREE.MeshPhysicalMaterial({ color: o.skin, roughness: 0.52, sheen: 0.35, sheenColor: new THREE.Color('#ff9a86'), sheenRoughness: 0.55, vertexColors: false });
  const skinV = skin.clone(); skinV.vertexColors = true;
  const fab = new Map();
  H.root.traverse((m) => {
    if (!m.isMesh) return;
    if (m.material === H.skinMat) { m.material = skin; return; }
    const mt = m.material; if (!mt.isMeshStandardMaterial || mt.emissiveIntensity > 0.01 && mt.emissive && mt.emissive.getHex()) return;
    if (!fab.has(mt)) fab.set(mt, phys(mt, { sheen: mt.map ? 0.25 : 0.1, sheenRoughness: 0.8, sheenColor: mt.color.clone().lerp(new THREE.Color('#ffffff'), 0.15) }));
    m.material = fab.get(mt);
  });
  H.skinMat = skin; if (H.topMat && fab.has(H.topMat)) H.topMat = fab.get(H.topMat);
  // ---- replace skull / jaw / nose / ears with the sculpted head
  const old = hg.children.filter((m) => m.isMesh && m.geometry.type === 'SphereGeometry' && [0.115, 0.09, 0.026, 0.022].includes(m.geometry.parameters.radius));
  old.forEach((m) => hg.remove(m));
  const head = headGeo(skinV); head.castShadow = true; head.receiveShadow = true; hg.add(head);
  const nose = new THREE.Group(); nose.position.set(0, 0.06, 0.104); hg.add(nose);
  const bridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, 0.034, 6, 12), skin); bridge.rotation.x = 0.42; bridge.scale.set(1, 1.08, 0.9); bridge.position.set(0, 0.003, 0.009); nose.add(bridge);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.0105, 16, 12), skin); tip.position.set(0, -0.012, 0.013); nose.add(tip);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.SphereGeometry(0.0068, 12, 10), skin); w.scale.set(1, 0.8, 0.9); w.position.set(0.0102 * s, -0.016, 0.006); nose.add(w); const ns = new THREE.Mesh(new THREE.SphereGeometry(0.0026, 8, 6), new THREE.MeshStandardMaterial({ color: '#8a5444', roughness: 1 })); ns.scale.set(1, 0.6, 1); ns.position.set(0.0065 * s, -0.0215, 0.011); nose.add(ns); }
  for (const s of [-1, 1]) {
    const ear = new THREE.Group(); ear.position.set(0.1 * s, 0.07, -0.006); ear.rotation.y = 0.25 * s; hg.add(ear);
    const helix = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.0065, 8, 18, Math.PI * 1.55), skin); helix.rotation.set(0, Math.PI / 2 * s, Math.PI * 0.62 * (s > 0 ? 1 : 1)); helix.scale.set(0.85, 1.25, 1); ear.add(helix);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 10), skin); inner.scale.set(0.35, 1.05, 0.7); inner.position.set(0.002 * s, -0.002, 0); ear.add(inner);
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 8), skin); lobe.position.set(0.001 * s, -0.024, 0.002); ear.add(lobe);
  }
  // ---- eyes: textured iris disc, lash line on the upper lid, lower lid rim
  const iris = new THREE.MeshStandardMaterial({ map: irisTex(o.eyeColor), roughness: 0.25 });
  J.eyes.forEach((look) => {
    [...look.children].forEach((c) => { if (c.geometry.parameters.radius < 0.003) { c.position.z = 0.0232; return; } look.remove(c); });
    const R = 0.0222, ri = 0.0118, th = Math.asin(ri / R);
    const cg = new THREE.SphereGeometry(R, 28, 8, 0, Math.PI * 2, 0, th); const pp = cg.attributes.position, uv = cg.attributes.uv;
    for (let i = 0; i < pp.count; i++) uv.setXY(i, pp.getX(i) / ri * 0.5 + 0.5, -pp.getZ(i) / ri * 0.5 + 0.5);
    const d = new THREE.Mesh(cg, iris); d.rotation.x = Math.PI / 2; look.add(d);
  });
  const lash = new THREE.MeshStandardMaterial({ color: '#141010', roughness: 0.8 });
  J.lids.forEach((lid) => { lid.material = skin; const l = new THREE.Mesh(new THREE.TorusGeometry(0.0237, 0.0016, 6, 20, Math.PI), lash); l.rotation.x = Math.PI / 2; lid.add(l); const eg = lid.parent; const low = new THREE.Mesh(new THREE.TorusGeometry(0.0225, 0.0022, 6, 18, Math.PI * 0.9), skin); low.rotation.set(-Math.PI / 2 - 0.5, 0, Math.PI * 0.05); eg.add(low); });
  J.brows.forEach((b) => { b.scale.set(1.0, 1.05, 0.9); b.userData.base = 0.119; b.scale.y = 0.85; });
  J.eyes.forEach((look) => { const eg = look.parent; eg.position.z = 0.083; eg.scale.setScalar(0.9); eg.children.forEach((c) => { if (c.isMesh && c.geometry.parameters.radius === 0.022) c.material = new THREE.MeshStandardMaterial({ color: '#efe9e2', roughness: 0.15 }); }); });
  // ---- hair
  if (style !== 'bald') {
    const hm = new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: hairTex(o.hair), roughness: 0.72, sheen: 0.3, sheenColor: new THREE.Color(o.hair).lerp(new THREE.Color('#ffffff'), 0.4), sheenRoughness: 0.4 });
    const cap = hairGeo(style, hm); cap.castShadow = true; hg.add(cap);
    if (style === 'bun') { const bun = new THREE.Mesh(new THREE.SphereGeometry(0.048, 18, 14), hm); bun.position.set(0, 0.17, -0.09); hg.add(bun); }
    if (style === 'long') { const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.14, 8, 16), hm); l.scale.set(1.12, 1, 0.5); l.position.set(0, -0.04, -0.07); hg.add(l); }
  }
  // ---- hands: palm + four two-segment fingers + thumb
  const handMat = o.gloves ? H.root.getObjectByProperty('isMesh', true) && new THREE.MeshStandardMaterial({ color: o.gloves, roughness: 0.75 }) : skin;
  const mkHand = (side) => {
    const old2 = side > 0 ? J.lHand : J.rHand; const wr = old2.group.parent; wr.remove(old2.group);
    const g = new THREE.Group(); wr.add(g);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 12), handMat); palm.scale.set(1.0, 1.08, 0.5); palm.position.y = -0.045; g.add(palm);
    const fingers = [];
    [-1.5, -0.5, 0.5, 1.5].forEach((k, i) => {
      const len = [0.026, 0.03, 0.029, 0.023][i];
      const a = new THREE.Group(); a.position.set(k * 0.0165 * side, -0.083, 0); g.add(a);
      const sa = new THREE.Mesh(new THREE.CapsuleGeometry(0.0078, len, 4, 8), handMat); sa.position.y = -len / 2 - 0.003; a.add(sa);
      const b = new THREE.Group(); b.position.y = -len - 0.006; a.add(b);
      const sb = new THREE.Mesh(new THREE.CapsuleGeometry(0.0072, len * 0.85, 4, 8), handMat); sb.position.y = -len * 0.42 - 0.003; b.add(sb);
      fingers.push({ a, b });
    });
    const th = new THREE.Group(); th.position.set(0.036 * side, -0.035, 0.012); th.rotation.z = 0.65 * side; g.add(th);
    const t1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, 0.024, 4, 8), handMat); t1.position.y = -0.016; th.add(t1);
    const t2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, 0.018, 4, 8), handMat); t2.position.set(0, -0.038, 0.002); th.add(t2);
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const hand = { group: g, fingers, th, s: side, f1: new THREE.Object3D(), f2: new THREE.Object3D() };
    return hand;
  };
  J.lHand = mkHand(1); J.rHand = mkHand(-1);
  const curl = (hand, c, t) => { hand.fingers.forEach((f, i) => { f.a.rotation.x = c * (1.25 + i * 0.05); f.b.rotation.x = c * 1.5; f.a.rotation.z = (i - 1.5) * 0.05 * hand.s * (1 - c); }); hand.th.rotation.x = t * 0.9; };
  // ---- clothing details
  const top = o.top; const topM = H.topMat; const bulk = o.bulk;
  const add = (parent, mesh, x, y, z, rx = 0, ry = 0, rz = 0) => { mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh; };
  const darker = (m, k = 0.8) => { const c = m.clone(); c.color = m.color.clone().multiplyScalar(k); return c; };
  if (top === 'tshirt' || top === 'longsleeve') { const col = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.009, 8, 28), darker(topM, 0.9)); col.scale.set(1, 0.85, 1); add(J.chest, col, 0, 0.214, 0.004, Math.PI / 2 + 0.25); }
  if (top === 'hoodie') {
    const hood = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.034, 10, 28), topM); hood.scale.set(1.15 * bulk, 1, 1); add(J.chest, hood, 0, 0.215, -0.03, Math.PI / 2 + 0.45);
    const hb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), topM); hb.scale.set(1.2 * bulk, 0.7, 0.55); add(J.chest, hb, 0, 0.19, -0.1, 0.3);
    const pk = new THREE.Mesh(new THREE.BoxGeometry(0.2 * bulk, 0.09, 0.012), darker(topM, 0.92)); add(J.spine, pk, 0, -0.02, 0.118 * bulk + o.belly * 0.8, -0.05);
    for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.12, 6), new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.7 })); add(J.chest, st, 0.028 * s, 0.13, 0.12 * bulk, -0.18); }
  }
  if (top === 'jacket') {
    const shirt = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.16), new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.6, side: THREE.DoubleSide })); add(J.chest, shirt, 0, 0.13, 0.126 * bulk, -0.12);
    for (const s of [-1, 1]) { const lap = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.19, 0.008), darker(topM, 0.85)); add(J.chest, lap, 0.04 * s, 0.12, 0.128 * bulk, -0.1, 0, 0.32 * s); }
    if (o.tie !== false && top === 'jacket') { const tm = new THREE.MeshStandardMaterial({ color: o.tie || '#7a1a22', roughness: 0.5 }); const knot = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 0.012), tm); add(J.chest, knot, 0, 0.198, 0.124 * bulk, -0.2); const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.009, 0.17, 4), tm); tie.scale.z = 0.3; add(J.chest, tie, 0, 0.1, 0.132 * bulk, -0.1, Math.PI / 4); }
    for (const y of [0.0, 0.06]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 10), new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.4 })); add(J.chest, b, 0.012, y, 0.131 * bulk, Math.PI / 2); }
  }
  if (top === 'robe') {
    for (const y of [0.0, 0.06]) for (const sd of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 10), new THREE.MeshStandardMaterial({ color: '#2a1a10', roughness: 0.4 })); add(J.chest, b, 0.05 * sd, y, 0.132 * bulk, Math.PI / 2); }
    { const belt = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 6, 30), darker(topM, 0.75)); belt.scale.set(0.178 * bulk, 0.13 * bulk, 1); add(J.spine, belt, 0, -0.06, 0, Math.PI / 2); }
  }
  if (o.pants === 'jeans' || o.pants === 'slacks') { const bk = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.024, 0.008), new THREE.MeshStandardMaterial({ color: '#c8b070', metalness: 0.8, roughness: 0.3 })); if (top !== 'robe' && top !== 'hoodie') add(J.hips, bk, 0, 0.035, 0.122 * bulk); }
  // sneakers / dress shoes
  const shoeM = new THREE.MeshPhysicalMaterial({ color: o.shoes, roughness: 0.45, clearcoat: o.dress ? 0.8 : 0.1 });
  for (const an of [J.lAnk, J.rAnk]) {
    [...an.children].forEach((c) => { if (c.isMesh) an.remove(c); });
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.1, 6, 14), shoeM); up.rotation.x = Math.PI / 2; up.scale.set(1.08, 1, 0.8); up.position.set(0, -0.05, 0.045); an.add(up);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.022, 0.25), new THREE.MeshStandardMaterial({ color: o.dress ? '#1a1410' : '#f2f0ea', roughness: 0.7 })); sole.position.set(0, -0.083, 0.045); an.add(sole);
    if (!o.dress) { const lc = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.006, 0.08), new THREE.MeshStandardMaterial({ color: '#f4f2ec', roughness: 0.8 })); lc.position.set(0, -0.012, 0.07); lc.rotation.x = -0.35; an.add(lc); }
    an.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  }
  const face0 = H.face;
  H.face = (f) => { face0(f); const b = f.blink ?? 0; J.lids.forEach((l) => { l.rotation.x = lerp(-0.62, 0.78, b); }); J.cavity.scale.x *= 0.72; };
  H.face({});
  const pose0 = H.pose;
  H.pose = (p) => { pose0(p); curl(J.lHand, p.lCurl ?? 0.3, p.lThumb ?? 0.3); curl(J.rHand, p.rCurl ?? 0.3, p.rThumb ?? 0.3); };
  H.pose({});
  return H;
}
export { idle2 as idle3 };

export const c3 = {
  mk: (name, o) => solidHuman(human3(o), name),
};
