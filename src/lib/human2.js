import * as THREE from 'three';
import { TEX, M, noise1, clamp, lerp } from './util.js';

// Second-generation character: one continuous skinned body (torso, sleeves, legs) on a bone rig,
// rigid head / hands / shoes on the bones. Same pose()/face() API as human.js.
const D = THREE.MathUtils.degToRad;
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function mat(kind, color) {
  switch (kind) {
    case 'denim': return M.std({ map: TEX.denim([2, 3], color), roughness: 0.9 });
    case 'fur': return M.std({ map: TEX.fabric([3, 3], color), roughness: 1 });
    case 'leather': return M.std({ map: TEX.fabric([2, 2], color), roughness: 0.65 });
    default: return M.std({ map: TEX.fabric([2, 2], color), roughness: 0.9 });
  }
}

// tube along a vertical chain in model space (rest pose). rings: [{y, rx, rz, x?, z?}] top→bottom.
// weight(y) → [[boneIndex, w], ...]. capTop/capBottom close the ends.
function skinTube(rings, bones, weight, material, { seg = 26, capTop = false, capBottom = true } = {}) {
  const pos = [], idx = [], si = [], sw = [];
  const push = (x, y, z) => { pos.push(x, y, z); const w = weight(y); const ii = [0, 0, 0, 0], ww = [0, 0, 0, 0]; w.slice(0, 4).forEach(([b, v], k) => { ii[k] = b; ww[k] = v; }); const s = ww.reduce((a, b) => a + b, 0) || 1; si.push(...ii); sw.push(...ww.map((v) => v / s)); };
  rings.forEach((r) => { for (let j = 0; j <= seg; j++) { const a = Math.PI + j / seg * Math.PI * 2; push((r.x || 0) + Math.sin(a) * r.rx, r.y, (r.z || 0) + Math.cos(a) * r.rz); } });
  const row = seg + 1;
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < seg; j++) { const a = i * row + j, b = a + row; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const cap = (ri, down) => { const r = rings[ri]; const c = pos.length / 3; push(r.x || 0, r.y + (down ? -r.rx * 0.35 : r.rx * 0.35), r.z || 0); for (let j = 0; j < seg; j++) { const a = ri * row + j; if (down) idx.push(a, c, a + 1); else idx.push(a, a + 1, c); } };
  if (capTop) cap(0, false); if (capBottom) cap(rings.length - 1, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  g.setIndex(idx); g.computeVertexNormals();
  const nrm = g.attributes.normal; for (let i = 0; i < rings.length; i++) { const a = i * row, b = a + seg; const n = new THREE.Vector3().fromBufferAttribute(nrm, a).add(new THREE.Vector3().fromBufferAttribute(nrm, b)).normalize(); nrm.setXYZ(a, n.x, n.y, n.z); nrm.setXYZ(b, n.x, n.y, n.z); }
  const uv = []; for (let i = 0; i < pos.length / 3; i++) uv.push((i % row) / seg, pos[i * 3 + 1] * 2); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const m = new THREE.SkinnedMesh(g, material); m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; m.userData.bones = bones;
  return m;
}

/**
 * opts: skin, hair, hairStyle(short|buzz|long|bun|bald|wild), beard(false|true|'long'), top(tshirt|longsleeve|hoodie|jacket|tunic|none|apron),
 * topColor, pants(jeans|slacks|fur|leather), pantsColor, shoes, glasses, height(scale), bulk, belly, limb, head(scale), female,
 * helmet('horned'|null), gloves, eyeColor, brows, lip
 */
export function human2(opts = {}) {
  const o = Object.assign({ skin: '#e2b08c', hair: '#3b2a1e', hairStyle: 'short', beard: false, top: 'tshirt', topColor: '#3a6ab0', pants: 'jeans', pantsColor: '#3d5a86',
    shoes: '#2a2a2a', glasses: false, height: 1, bulk: 1, belly: 0, limb: 1, head: 1, female: false, helmet: null, gloves: null, eyeColor: '#4a3322', lip: null, sleeves: null }, opts);
  const root = new THREE.Group();
  const J = {};
  const bone = (name, parent, x, y, z) => { const b = new THREE.Bone(); b.name = name; b.position.set(x, y, z); if (parent) parent.add(b); J[name] = b; return b; };
  const hips = bone('hips', null, 0, 0.95, 0); root.add(hips);
  const spine = bone('spine', hips, 0, 0.1, 0); const chest = bone('chest', spine, 0, 0.14, 0);
  const neck = bone('neck', chest, 0, 0.27, 0); const head = bone('head', neck, 0, 0.1, 0);
  const W = 0.205 * o.bulk;
  const lSh = bone('lSh', chest, W, 0.215, 0), lEl = bone('lEl', lSh, 0, -0.29, 0), lWr = bone('lWr', lEl, 0, -0.26, 0);
  const rSh = bone('rSh', chest, -W, 0.215, 0), rEl = bone('rEl', rSh, 0, -0.29, 0), rWr = bone('rWr', rEl, 0, -0.26, 0);
  const lHip = bone('lHip', hips, 0.1 * o.bulk, -0.02, 0), lKnee = bone('lKnee', lHip, 0, -0.44, 0), lAnk = bone('lAnk', lKnee, 0, -0.44, 0);
  const rHip = bone('rHip', hips, -0.1 * o.bulk, -0.02, 0), rKnee = bone('rKnee', rHip, 0, -0.44, 0), rAnk = bone('rAnk', rKnee, 0, -0.44, 0);
  const bones = [hips, spine, chest, neck, head, lSh, lEl, lWr, rSh, rEl, rWr, lHip, lKnee, lAnk, rHip, rKnee, rAnk];
  const B = Object.fromEntries(bones.map((b, i) => [b.name, i]));
  root.updateMatrixWorld(true);
  const skel = new THREE.Skeleton(bones);

  const skin = M.col(o.skin, 0.6);
  const topMat = o.top === 'none' ? skin : mat(o.top === 'tunic' ? 'fur' : 'fabric', o.topColor);
  const pantsMat = mat(o.pants === 'jeans' ? 'denim' : o.pants === 'fur' || o.pants === 'loincloth' ? 'fur' : o.pants === 'leather' ? 'leather' : 'fabric', o.pantsColor);
  const legMat = o.pants === 'loincloth' ? skin : pantsMat;
  const bulk = o.bulk, L = o.limb, belly = o.belly;
  const meshes = [];
  const add = (m) => { m.bind(skel); root.add(m); meshes.push(m); return m; };

  // torso (upper: top garment, lower: pants), elliptical rings in model space
  const wt = (y) => { if (y < 1.03) return [[B.hips, 1]]; if (y < 1.12) { const k = sm(1.03, 1.12, y); return [[B.hips, 1 - k], [B.spine, k]]; } if (y < 1.24) { const k = sm(1.15, 1.24, y); return [[B.spine, 1 - k], [B.chest, k]]; } if (y > 1.46) return [[B.neck, 1]]; return [[B.chest, 1]]; };
  const fw = o.female ? 0.9 : 1;
  const upper = [
    { y: 1.475, rx: 0.065, rz: 0.06 }, { y: 1.468, rx: 0.1 * bulk, rz: 0.08 }, { y: 1.455, rx: 0.14 * bulk, rz: 0.098 * bulk }, { y: 1.435, rx: 0.172 * bulk * fw, rz: 0.11 * bulk }, { y: 1.405, rx: 0.192 * bulk * fw, rz: 0.12 * bulk }, { y: 1.36, rx: 0.2 * bulk * fw, rz: 0.128 * bulk + (o.female ? 0.02 : 0) }, { y: 1.3, rx: 0.2 * bulk * fw, rz: 0.13 * bulk + (o.female ? 0.02 : 0) },
    { y: 1.22, rx: 0.19 * bulk * fw, rz: 0.125 * bulk + belly * 0.5 }, { y: 1.1, rx: (0.17 + belly * 0.4) * bulk, rz: 0.12 * bulk + belly }, { y: 1.0, rx: (0.168 + belly * 0.3) * bulk * (o.female ? 1.06 : 1), rz: 0.118 * bulk + belly * 0.7 }, { y: 0.965, rx: (0.17 + belly * 0.2) * bulk * (o.female ? 1.06 : 1), rz: 0.12 * bulk + belly * 0.4 },
  ];
  if (o.top === 'tunic' || o.top === 'apron' || o.top === 'robe') upper.push({ y: 0.86, rx: 0.19 * bulk, rz: 0.14 * bulk }, { y: 0.74, rx: 0.205 * bulk, rz: 0.155 * bulk });
  add(skinTube(upper, bones, wt, topMat, { capTop: false, capBottom: o.top === 'tunic' || o.top === 'robe' }));
  add(skinTube([{ y: 1.0, rx: 0.165 * bulk, rz: 0.115 * bulk }, { y: 0.93, rx: 0.17 * bulk * (o.female ? 1.06 : 1), rz: 0.12 * bulk }, { y: 0.87, rx: 0.16 * bulk, rz: 0.112 * bulk }, { y: 0.82, rx: 0.12 * bulk, rz: 0.09 * bulk }, { y: 0.795, rx: 0.06 * bulk, rz: 0.05 * bulk }], bones, () => [[B.hips, 1]], pantsMat, { capBottom: true }));
  if (o.top !== 'none' && o.top !== 'tunic') { const belt = new THREE.Mesh(new THREE.TorusGeometry(1, 0.016, 6, 28), M.col('#2b2118', 0.5)); belt.rotation.x = Math.PI / 2; belt.scale.set(0.168 * bulk, 0.12 * bulk, 1); belt.position.y = 0.985 - 0.95; hips.add(belt); }
  // neck
  add(skinTube([{ y: 1.6, rx: 0.048, rz: 0.048 }, { y: 1.52, rx: 0.052, rz: 0.05 }, { y: 1.44, rx: 0.06, rz: 0.055 }], bones, (y) => (y > 1.53 ? [[B.head, 0.5], [B.neck, 0.5]] : [[B.neck, 1]]), skin, { capBottom: false }));

  // arms: sleeve (top material) + forearm skin, one continuous chain each
  const sleeveTo = o.sleeves ?? (o.top === 'tshirt' || o.top === 'apron' ? 0.4 : o.top === 'none' ? 0 : o.top === 'tunic' ? 0.35 : 0.95);
  const armSide = (s, sh, el, wr) => {
    const x = W * s, y0 = 1.425, len = 0.585;
    const prof = (t) => (t < 0.52 ? lerp(0.064, 0.05, t / 0.52) : lerp(0.05, 0.04, (t - 0.52) / 0.48)) * L * (o.top === 'none' && bulk > 1.1 ? 1.25 : 1);
    const w = (y) => { const t = (y0 - y) / len; if (t < 0.44) return [[sh, 1]]; if (t < 0.58) { const k = sm(0.44, 0.58, t); return [[sh, 1 - k], [el, k]]; } if (t > 0.97) return [[wr, 1]]; return [[el, 1]]; };
    const ring = (t, extra = 0) => ({ y: y0 - t * len, x, rx: prof(t) + extra, rz: prof(t) + extra });
    if (sleeveTo > 0) {
      const dome = [[-0.13, 0.25], [-0.115, 0.6], [-0.09, 0.82], [-0.06, 0.95], [-0.03, 1.0]].map(([t, k]) => { const r = ring(t, 0.012); r.rx *= k; r.rz *= k; return r; });
      const rs = [...dome, ring(0, 0.012)]; for (let i = 1; i <= 8; i++) rs.push(ring(sleeveTo * i / 8, 0.012));
      add(skinTube(rs, bones, w, topMat, { capBottom: false, capTop: true }));
    }
    if (sleeveTo < 0.98) { const rs = []; if (sleeveTo === 0) [[-0.13, 0.25], [-0.115, 0.6], [-0.09, 0.82], [-0.06, 0.95], [-0.03, 1.0]].forEach(([t, k]) => { const r = ring(t); r.rx *= k; r.rz *= k; rs.push(r); }); const a = Math.max(0, sleeveTo - 0.05); for (let i = 0; i <= 10; i++) rs.push(ring(a + (1.0 - a) * i / 10)); add(skinTube(rs, bones, w, skin, { capBottom: true, capTop: sleeveTo === 0 })); }
  };
  armSide(1, B.lSh, B.lEl, B.lWr); armSide(-1, B.rSh, B.rEl, B.rWr);
  // legs: one tube hip→ankle
  const legSide = (s, hp, kn, an) => {
    const x = 0.1 * bulk * s, y0 = 0.93, len = 0.9;
    const prof = (t) => (t < 0.5 ? lerp(0.088, 0.066, t / 0.5) : lerp(0.066, 0.056, (t - 0.5) / 0.5)) * L * (bulk > 1.1 ? 1.15 : 1);
    const w = (y) => { const t = (y0 - y) / len; if (t < 0.44) return [[hp, 1]]; if (t < 0.58) { const k = sm(0.44, 0.58, t); return [[hp, 1 - k], [kn, k]]; } if (t > 0.97) return [[an, 1]]; return [[kn, 1]]; };
    const rs = []; for (let i = 0; i <= 14; i++) { const t = -0.04 + 1.04 * i / 14; rs.push({ y: y0 - t * len, x, rx: prof(t), rz: prof(t) }); }
    add(skinTube(rs, bones, w, legMat, { capTop: true }));
  };
  legSide(1, B.lHip, B.lKnee, B.lAnk); legSide(-1, B.rHip, B.rKnee, B.rAnk);

  if (o.pants === 'loincloth') {
    const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.19 * bulk, 0.24 * bulk, 0.34, 22, 1, true), M.std({ map: TEX.fabric([3, 1], o.pantsColor), roughness: 1, side: THREE.DoubleSide }));
    sk.scale.z = 0.78; sk.position.y = -0.12; hips.add(sk);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.2 * bulk, 0.028, 8, 30), M.std({ map: TEX.fabric([2, 1], o.pantsColor), roughness: 1 })); strap.rotation.set(Math.PI / 2 + 0.05, 0.75, 0); strap.scale.set(0.82, 1.25, 1); strap.position.set(0, 0.12, 0); chest.add(strap);
    for (const wr of [lWr, rWr]) { const band = new THREE.Mesh(new THREE.TorusGeometry(0.045 * L, 0.014, 6, 18), M.col('#4a3626', 0.7)); band.rotation.x = Math.PI / 2; band.position.y = 0.02; wr.add(band); }
  }
  // shoes (rigid on ankle bones)
  const shoeMat = M.col(o.shoes, 0.55);
  for (const an of [lAnk, rAnk]) {
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 18, 12), shoeMat); sh.scale.set(0.85, 0.62, 1.75); sh.position.set(0, -0.045, 0.05); an.add(sh);
    const sole = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 18), M.col('#1a1a1a', 0.8)); sole.scale.set(0.95, 1, 1.9); sole.position.set(0, -0.078, 0.05); an.add(sole);
  }
  // hands: mitten-style palm + finger block (2 segments) + thumb, rigid on wrist
  const handMat = o.gloves ? M.col(o.gloves, 0.75) : skin;
  const mkHand = (wr, s) => {
    const g = new THREE.Group(); wr.add(g);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), handMat); palm.scale.set(0.95, 1.05, 0.48); palm.position.y = -0.045; g.add(palm);
    const f1 = new THREE.Group(); f1.position.set(0, -0.085, 0); g.add(f1);
    const fa = new THREE.Mesh(new THREE.CapsuleGeometry(0.019, 0.05, 4, 10), handMat); fa.rotation.z = Math.PI / 2; fa.scale.set(1, 1, 0.75); fa.position.y = -0.015; f1.add(fa);
    const f2 = new THREE.Group(); f2.position.y = -0.03; f1.add(f2);
    const fb = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.05, 4, 10), handMat); fb.rotation.z = Math.PI / 2; fb.scale.set(1, 1, 0.72); fb.position.y = -0.014; f2.add(fb);
    const th = new THREE.Group(); th.position.set(0.034 * s, -0.035, 0.01); th.rotation.z = 0.6 * s; g.add(th);
    const tm = new THREE.Mesh(new THREE.CapsuleGeometry(0.013, 0.035, 4, 8), handMat); tm.position.y = -0.024; th.add(tm);
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return { group: g, f1, f2, th, s };
  };
  J.lHand = mkHand(lWr, 1); J.rHand = mkHand(rWr, -1);

  // head (rigid on head bone), stylised: slightly larger, big readable eyes
  const hs = o.head; const hg = new THREE.Group(); hg.scale.setScalar(hs); head.add(hg); J.headGroup = hg;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.115, 32, 24), skin); skull.scale.set(0.92, 1.06, 1.0); skull.position.y = 0.08; hg.add(skull);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 16), skin); jaw.scale.set(o.female ? 0.9 : 1.0, 0.82, 0.98); jaw.position.set(0, 0.02, 0.016); hg.add(jaw);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), skin); ear.scale.set(0.42, 1, 0.72); ear.position.set(0.104 * s, 0.07, -0.004); hg.add(ear); }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.022, 14, 10), skin); nose.scale.set(0.85, 1.1, 1.0); nose.position.set(0, 0.055, 0.112); hg.add(nose);
  const eyeW = M.col('#f6f4ef', 0.2), iris = M.col(o.eyeColor, 0.3), pupil = M.col('#060606', 0.2);
  J.eyes = []; J.lids = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(0.04 * s, 0.092, 0.09); hg.add(eg);
    eg.add(new THREE.Mesh(new THREE.SphereGeometry(0.022, 18, 14), eyeW));
    const look = new THREE.Group(); eg.add(look); J.eyes.push(look);
    const ir = new THREE.Mesh(new THREE.SphereGeometry(0.0125, 16, 12), iris); ir.position.z = 0.0185; ir.scale.z = 0.35; look.add(ir);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 12, 8), pupil); pu.position.z = 0.0218; pu.scale.z = 0.3; look.add(pu);
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.0026, 6, 6), M.emis('#ffffff', 1.2)); sp.position.set(0.004, 0.005, 0.0235); look.add(sp);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.0235, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), skin); eg.add(lid); J.lids.push(lid);
  }
  const hairCol = new THREE.Color(o.hair); const browMat = M.col(hairCol.clone().multiplyScalar(0.75), 0.8);
  J.brows = [];
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.0065, 0.032, 4, 8), browMat); b.rotation.z = Math.PI / 2 - 0.12 * s; b.position.set(0.041 * s, 0.126, 0.1); b.userData = { base: 0.126, s }; hg.add(b); J.brows.push(b); }
  const mouth = new THREE.Group(); mouth.position.set(0, 0.018, 0.103); hg.add(mouth); J.mouth = mouth;
  const lipMat = M.col(o.lip || new THREE.Color(o.skin).multiplyScalar(0.72).lerp(new THREE.Color('#b0443c'), 0.35), 0.5);
  const cav = new THREE.Mesh(new THREE.SphereGeometry(0.02, 14, 10), M.col('#3a0f10', 0.9)); cav.scale.set(1.3, 0.12, 0.5); mouth.add(cav); J.cavity = cav;
  const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.007, 0.006), M.col('#f5f1e6', 0.4)); teeth.position.set(0, 0.004, 0.004); teeth.visible = false; mouth.add(teeth); J.teeth = teeth;
  const up = new THREE.Mesh(new THREE.CapsuleGeometry(0.0055, 0.03, 4, 8), lipMat); up.rotation.z = Math.PI / 2; up.position.y = 0.004; mouth.add(up); J.upLip = up;
  const lo = new THREE.Mesh(new THREE.CapsuleGeometry(0.0062, 0.026, 4, 8), lipMat); lo.rotation.z = Math.PI / 2; lo.position.y = -0.005; mouth.add(lo); J.loLip = lo;
  const hairMat = M.col(o.hair, 0.85);
  if (o.hairStyle !== 'bald' && !o.helmet) {
    const capH = new THREE.Mesh(new THREE.SphereGeometry(0.121, 28, 18, 0, Math.PI * 2, 0, o.hairStyle === 'buzz' ? Math.PI * 0.42 : Math.PI * 0.52), hairMat);
    capH.scale.set(0.95, 1.08, 1.04); capH.position.set(0, 0.085, -0.006); capH.rotation.x = -0.32; hg.add(capH);
    if (o.hairStyle !== 'buzz') { const back = new THREE.Mesh(new THREE.SphereGeometry(0.116, 20, 14), hairMat); back.scale.set(0.95, 0.92, 0.88); back.position.set(0, 0.07, -0.03); hg.add(back); }
    if (o.hairStyle === 'long' || o.hairStyle === 'wild') { const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, o.hairStyle === 'wild' ? 0.24 : 0.16, 6, 14), hairMat); l.scale.set(1.12, 1, 0.55); l.position.set(0, -0.03, -0.065); hg.add(l); }
    if (o.hairStyle === 'bun') { const bun = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), hairMat); bun.position.set(0, 0.17, -0.08); hg.add(bun); }
  }
  if (o.beard) {
    const long = o.beard === 'long';
    const bd = new THREE.Mesh(new THREE.SphereGeometry(0.093, 22, 16, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42), hairMat); bd.scale.set(1.04, long ? 1.9 : 1.05, 1.1); bd.position.set(0, long ? 0.03 : 0.012, 0.02); hg.add(bd);
    for (const sx of [-1, 1]) { const sb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), hairMat); sb.scale.set(0.6, 1.6, 0.8); sb.position.set(0.085 * sx, 0.04, 0.03); hg.add(sb); }
    const mus = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.04, 4, 8), hairMat); mus.rotation.z = Math.PI / 2; mus.position.set(0, 0.036, 0.11); hg.add(mus);
  }
  if (o.glasses) {
    const gm = M.col(o.glasses === true ? '#111' : o.glasses, 0.3, 0.4);
    for (const s of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.027, 0.0035, 6, 22), gm); ring.scale.y = 0.82; ring.position.set(0.041 * s, 0.092, 0.112); hg.add(ring); const arm = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.003, 0.1), gm); arm.position.set(0.106 * s, 0.096, 0.06); hg.add(arm); }
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.004, 0.004), gm); br.position.set(0, 0.098, 0.115); hg.add(br);
  }
  if (o.helmet === 'horned') {
    const metal = M.col('#8a8f96', 0.35, 0.85), horn = M.col('#e8dcc0', 0.5);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.132, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), metal); shell.scale.set(0.98, 1.0, 1.05); shell.position.set(0, 0.095, -0.006); hg.add(shell);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.012, 8, 30), M.col('#6a5030', 0.6, 0.3)); band.rotation.x = Math.PI / 2; band.scale.set(0.98, 1.06, 1); band.position.set(0, 0.105, -0.006); hg.add(band);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.01), metal); guard.position.set(0, 0.085, 0.125); hg.add(guard);
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.17, 14), horn); h.position.set(0.14 * s, 0.17, 0); h.rotation.z = -s * 0.9; hg.add(h); }
  }
  root.traverse((m) => { if (m.isMesh && !m.isSkinnedMesh) { m.castShadow = true; m.receiveShadow = true; } });
  root.scale.setScalar(o.height);
  const H = { root, J, opts: o, meshes, skel };
  H.pose = (p) => applyPose(H, p);
  H.face = (f) => applyFace(H, f);
  applyPose(H, {}); applyFace(H, {});
  return H;
}

export function setHand2(hand, curl = 0.25, thumb = 0.3) {
  hand.f1.rotation.x = curl * 1.3; hand.f2.rotation.x = curl * 1.5; hand.th.rotation.x = thumb * 0.9;
}
function applyPose(H, p) {
  const J = H.J;
  const set = (j, v, def = [0, 0, 0]) => { const a = v || def; j.rotation.set(D(a[0]), D(a[1]), D(a[2])); };
  set(J.spine, p.spine); set(J.chest, p.chest); set(J.neck, p.neck); set(J.head, p.head);
  set(J.lSh, p.lSh, [0, 0, 7]); set(J.rSh, p.rSh, [0, 0, -7]); set(J.lEl, p.lEl, [-8, 0, 0]); set(J.rEl, p.rEl, [-8, 0, 0]);
  set(J.lWr, p.lWr); set(J.rWr, p.rWr); set(J.lHip, p.lHip); set(J.rHip, p.rHip); set(J.lKnee, p.lKnee); set(J.rKnee, p.rKnee); set(J.lAnk, p.lAnk); set(J.rAnk, p.rAnk);
  J.hips.position.y = 0.95 + (p.hipsY || 0);
  const h = p.hips || [0, 0, 0]; J.hips.rotation.set(D(h[0]), D(h[1]), D(h[2]));
  setHand2(J.lHand, p.lCurl ?? 0.3, p.lThumb ?? 0.3); setHand2(J.rHand, p.rCurl ?? 0.3, p.rThumb ?? 0.3);
}
function applyFace(H, f) {
  const J = H.J; const blink = f.blink ?? 0;
  J.lids.forEach((l) => { l.rotation.x = lerp(-1.5, 0.25, blink); });
  J.brows.forEach((b) => { b.position.y = b.userData.base + (f.brows ?? 0) * 0.013; b.rotation.z = Math.PI / 2 - 0.12 * b.userData.s + (f.browTilt ?? 0) * 0.3 * b.userData.s; });
  const open = f.mouth ?? 0, smile = f.smile ?? 0;
  J.cavity.scale.set(1.3 + smile * 0.3 - open * 0.25, 0.12 + open * 1.1, 0.5);
  J.loLip.position.y = -0.005 - open * 0.02; J.upLip.position.y = 0.004 + open * 0.002;
  J.teeth.visible = open > 0.25; J.mouth.scale.x = 1 + smile * 0.25;
  J.mouth.rotation.z = 0; J.upLip.rotation.y = 0;
  // smile: bend lips via slight vertical scale at the corners using a rotation on each lip
  J.upLip.rotation.x = 0; J.loLip.position.z = smile * 0.002;
  const look = f.look || [0, 0]; J.eyes.forEach((e) => e.rotation.set(-look[1], look[0], 0));
}
export function idle2(H, t, seed = 0, amt = 1) {
  const J = H.J; const b = Math.sin(t * 2.2 + seed);
  J.chest.rotation.x += D(b * 0.7 * amt);
  J.head.rotation.y += D(noise1(t * 0.6, seed) * 6 * amt); J.head.rotation.x += D(noise1(t * 0.5, seed + 3) * 3 * amt);
  J.spine.rotation.z += D(noise1(t * 0.4, seed + 5) * 1.5 * amt);
}

// collision proxies for the overlap checker: capsules between joints (world space)
export function capsules2(H) {
  const J = H.J, s = H.root.scale.x, b = H.opts.bulk;
  const w = (o) => o.getWorldPosition(new THREE.Vector3());
  const headTop = J.head.localToWorld(new THREE.Vector3(0, 0.1, 0));
  return [
    [w(J.hips), w(J.chest), 0.15 * s * b], [w(J.chest), headTop, 0.11 * s],
    [w(J.lHip), w(J.lKnee), 0.075 * s], [w(J.lKnee), w(J.lAnk), 0.06 * s], [w(J.rHip), w(J.rKnee), 0.075 * s], [w(J.rKnee), w(J.rAnk), 0.06 * s],
    [w(J.lSh), w(J.lEl), 0.05 * s], [w(J.lEl), w(J.lWr), 0.042 * s], [w(J.rSh), w(J.rEl), 0.05 * s], [w(J.rEl), w(J.rWr), 0.042 * s],
  ];
}
