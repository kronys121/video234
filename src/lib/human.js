import * as THREE from 'three';
import { TEX, M, noise1, clamp, lerp } from './util.js';

const D = THREE.MathUtils.degToRad;
const capsule = (r, len, mat, capSeg = 6, radSeg = 14) => {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, capSeg, radSeg), mat);
  m.position.y = -len / 2 - r * 0.3;
  return m;
};

function mkMat(kind, color) {
  switch (kind) {
    case 'dcu': return M.std({ map: TEX.dcu([3, 2]), roughness: 0.95 });
    case 'denim': return M.std({ map: TEX.denim([2, 3], color || '#3d5a86'), roughness: 0.9 });
    case 'fabric': return M.std({ map: TEX.fabric([2, 2], color || '#ffffff'), roughness: 0.92 });
    default: return M.col(color || '#555', 0.85);
  }
}

/**
 * Build a humanoid.
 * opts: skin, hair, hairStyle(short|buzz|long|bun|bald), top(tshirt|hoodie|uniform|labcoat|shirt|suit), topColor,
 *       pants(jeans|dcu|slacks), pantsColor, shoes, glasses, helmet, cap, beard, gloves, female, height
 */
export function human(opts = {}) {
  const o = Object.assign({ skin: '#e0b08c', hair: '#3b2a1e', hairStyle: 'short', top: 'tshirt', topColor: '#222',
    pants: 'jeans', pantsColor: '#3d5a86', shoes: '#2a2a2a', glasses: false, helmet: false, cap: false, beard: false,
    gloves: null, female: false, height: 1.0, eyeColor: '#4a3322', lip: null }, opts);
  const root = new THREE.Group();
  const J = {}; // joints
  const skin = M.col(o.skin, 0.62);
  const topMat = o.top === 'uniform' ? mkMat('dcu') : o.top === 'labcoat' ? mkMat('fabric', '#f4f4f1') : o.top === 'shirt' ? mkMat('fabric', o.topColor) : o.top === 'suit' ? mkMat('fabric', o.topColor) : mkMat('fabric', o.topColor);
  const sleeveMat = topMat;
  const pantsMat = o.pants === 'dcu' ? mkMat('dcu') : o.pants === 'jeans' ? mkMat('denim', o.pantsColor) : mkMat('fabric', o.pantsColor);
  const hairMat = M.col(o.hair, 0.8);
  const shoeMat = M.col(o.shoes, 0.55);
  const handMat = o.gloves ? M.col(o.gloves, 0.8) : skin;

  const hips = new THREE.Group(); hips.position.y = 0.95; root.add(hips); J.hips = hips;
  const pelvis = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.12, 6, 14), pantsMat);
  pelvis.rotation.z = Math.PI / 2; pelvis.scale.set(1, 1, 0.78); pelvis.position.y = 0.02; hips.add(pelvis);
  // belt
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.018, 8, 28), M.col(o.pants === 'dcu' ? '#5a4a33' : '#2b2118', 0.6));
  belt.rotation.x = Math.PI / 2; belt.scale.set(1.08, 0.82, 1); belt.position.y = 0.09; if (o.top !== 'labcoat') hips.add(belt);

  const spine = new THREE.Group(); spine.position.y = 0.1; hips.add(spine); J.spine = spine;
  const chest = new THREE.Group(); chest.position.y = 0.12; spine.add(chest); J.chest = chest;
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.26, 8, 18), topMat);
  torso.scale.set(o.female ? 1.12 : 1.28, 1, 0.74); torso.position.y = 0.05; chest.add(torso);
  const belly = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.12, 6, 16), topMat);
  belly.scale.set(1.15, 1, 0.78); belly.position.y = -0.1; chest.add(belly);

  // clothing details
  if (o.top === 'hoodie') {
    const hood = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.045, 10, 24, Math.PI * 1.3), topMat);
    hood.rotation.set(-Math.PI / 2 + 0.3, 0, Math.PI * 1.15); hood.position.set(0, 0.27, -0.04); chest.add(hood);
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.02), topMat); pocket.position.set(0, -0.13, 0.115); chest.add(pocket);
    for (const s of [-1, 1]) { const str = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 6), M.col('#ddd', 0.8)); str.position.set(0.035 * s, 0.15, 0.12); chest.add(str); }
  }
  if (o.top === 'uniform') {
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.09, 0.02), topMat); p.position.set(0.09 * s, 0.1, 0.115); chest.add(p);
      const flap = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 0.026), topMat); flap.position.set(0.09 * s, 0.15, 0.117); chest.add(flap);
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), M.col('#3a3226', 0.5)); btn.position.set(0.09 * s, 0.145, 0.132); chest.add(btn);
    }
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.02, 8, 20), topMat); collar.rotation.x = Math.PI / 2 - 0.25; collar.position.y = 0.3; collar.position.z = 0.01; chest.add(collar);
    const tape = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.01), M.col('#3b3326', 0.8)); tape.position.set(-0.09, 0.175, 0.12); chest.add(tape);
  }
  if (o.top === 'labcoat') {
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 0.5, 20, 1, true), topMat);
    skirt.scale.z = 0.72; skirt.position.y = -0.33; chest.add(skirt);
    const lap = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.36, 0.03), topMat); lap.position.set(0, 0.0, 0.12); chest.add(lap);
    for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.02), topMat); l.position.set(0.05 * s, 0.17, 0.115); l.rotation.z = 0.35 * s; chest.add(l); }
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.07, 6), M.col('#1d4fb8', 0.4)); pen.position.set(-0.1, 0.12, 0.13); chest.add(pen);
    const inner = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.02), M.col(o.topColor, 0.8)); inner.position.set(0, 0.2, 0.108); chest.add(inner);
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.005), M.col('#e8e8e8', 0.3)); badge.position.set(0.1, 0.1, 0.125); chest.add(badge);
  }
  if (o.top === 'shirt' || o.top === 'suit') {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 8, 20), M.col('#f2f2f2', 0.8)); collar.rotation.x = Math.PI / 2 - 0.2; collar.position.y = 0.3; chest.add(collar);
    if (o.tie) { const tie = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.22, 0.012), M.col(o.tie, 0.6)); tie.position.set(0, 0.17, 0.122); chest.add(tie); }
    if (o.top === 'suit') for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.02), topMat); l.position.set(0.06 * s, 0.16, 0.118); l.rotation.z = 0.3 * s; chest.add(l); }
  }
  if (o.top === 'tshirt') {
    const neckline = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 20), topMat); neckline.rotation.x = Math.PI / 2 - 0.3; neckline.position.set(0, 0.29, 0.02); chest.add(neckline);
  }

  // neck + head
  const neck = new THREE.Group(); neck.position.y = 0.3; chest.add(neck); J.neck = neck;
  const neckM = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.11, 14), skin); neckM.position.y = 0.04; neck.add(neckM);
  const head = new THREE.Group(); head.position.y = 0.1; neck.add(head); J.head = head;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.11, 28, 22), skin); skull.scale.set(0.9, 1.08, 1.0); skull.position.y = 0.07; head.add(skull);
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.085, 22, 16), skin); jaw.scale.set(o.female ? 0.9 : 1.0, 0.8, 1.0); jaw.position.set(0, 0.0, 0.018); head.add(jaw);
  // ears
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 10), skin); ear.scale.set(0.45, 1, 0.75); ear.position.set(0.098 * s, 0.06, -0.005); head.add(ear); }
  // nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 10), skin); nose.rotation.x = Math.PI / 2 * 0.72; nose.position.set(0, 0.055, 0.108); head.add(nose);
  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 10), skin); noseTip.position.set(0, 0.038, 0.118); head.add(noseTip);
  // eyes
  const eyeW = M.col('#f4f2ee', 0.25), iris = M.col(o.eyeColor, 0.3), pupil = M.col('#050505', 0.2), lidMat = skin;
  J.eyes = []; J.lids = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group(); eg.position.set(0.036 * s, 0.085, 0.084); head.add(eg);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.019, 16, 12), eyeW); eg.add(ball);
    const look = new THREE.Group(); eg.add(look); J.eyes.push(look);
    const ir = new THREE.Mesh(new THREE.SphereGeometry(0.011, 14, 10), iris); ir.position.z = 0.0163; ir.scale.z = 0.35; look.add(ir);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.0058, 10, 8), pupil); pu.position.z = 0.0192; pu.scale.z = 0.3; look.add(pu);
    const spec = new THREE.Mesh(new THREE.SphereGeometry(0.0022, 6, 6), M.emis('#ffffff', 1.2)); spec.position.set(0.004, 0.004, 0.0205); look.add(spec);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.0205, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), lidMat);
    lid.rotation.x = -0.6; eg.add(lid); J.lids.push(lid);
    if (o.female) { const lash = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.0022, 4, 12, Math.PI), M.col('#111', 0.5)); lash.rotation.set(-0.3, 0, 0); lash.position.set(0, 0.002, 0.004); eg.add(lash); }
  }
  // brows
  J.brows = [];
  for (const s of [-1, 1]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.011, 0.012), M.col(new THREE.Color(o.hair).multiplyScalar(0.7), 0.8));
    b.position.set(0.037 * s, 0.112, 0.1); b.rotation.z = -0.12 * s; b.userData.base = b.position.y; b.userData.s = s; head.add(b); J.brows.push(b);
  }
  // mouth: lips + dark opening
  const mouth = new THREE.Group(); mouth.position.set(0, 0.012, 0.1); head.add(mouth); J.mouth = mouth;
  const lipMat = M.col(o.lip || new THREE.Color(o.skin).multiplyScalar(0.75).lerp(new THREE.Color('#b0443c'), 0.35), 0.5);
  const cavity = new THREE.Mesh(new THREE.SphereGeometry(0.02, 14, 10), M.col('#3a0f10', 0.9)); cavity.scale.set(1.3, 0.12, 0.5); mouth.add(cavity); J.cavity = cavity;
  const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.007, 0.006), M.col('#f5f1e6', 0.4)); teeth.position.set(0, 0.004, 0.004); teeth.visible = false; mouth.add(teeth); J.teeth = teeth;
  const upLip = new THREE.Mesh(new THREE.CapsuleGeometry(0.0055, 0.03, 4, 8), lipMat); upLip.rotation.z = Math.PI / 2; upLip.position.y = 0.004; mouth.add(upLip); J.upLip = upLip;
  const loLip = new THREE.Mesh(new THREE.CapsuleGeometry(0.0062, 0.026, 4, 8), lipMat); loLip.rotation.z = Math.PI / 2; loLip.position.y = -0.005; mouth.add(loLip); J.loLip = loLip;
  // hair
  if (o.hairStyle !== 'bald' && !o.helmet) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.116, 26, 18, 0, Math.PI * 2, 0, o.hairStyle === 'buzz' ? Math.PI * 0.42 : Math.PI * 0.5), hairMat);
    cap.scale.set(0.93, 1.1, 1.03); cap.position.set(0, 0.075, -0.004); cap.rotation.x = -0.28; head.add(cap);
    if (o.hairStyle === 'short' || o.hairStyle === 'long' || o.hairStyle === 'bun') {
      const back = new THREE.Mesh(new THREE.SphereGeometry(0.112, 20, 14), hairMat); back.scale.set(0.93, 0.9, 0.9); back.position.set(0, 0.06, -0.025); head.add(back);
      const fringe = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.1, 4, 10), hairMat); fringe.rotation.z = Math.PI / 2 + 0.15; fringe.position.set(0.01, 0.16, 0.06); fringe.scale.z = 0.7; head.add(fringe);
    }
    if (o.hairStyle === 'long') {
      const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.16, 6, 14), hairMat); l.scale.set(1.1, 1, 0.6); l.position.set(0, -0.03, -0.06); head.add(l);
      for (const s of [-1, 1]) { const side = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.14, 4, 8), hairMat); side.position.set(0.09 * s, -0.0, 0.0); head.add(side); }
    }
    if (o.hairStyle === 'bun') { const bun = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), hairMat); bun.position.set(0, 0.16, -0.08); head.add(bun); }
    for (const s of [-1, 1]) { const sb = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, 0.03), hairMat); sb.position.set(0.1 * s, 0.075, 0.03); head.add(sb); }
  }
  if (o.beard) {
    const beard = new THREE.Mesh(new THREE.SphereGeometry(0.088, 20, 14, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), hairMat); beard.scale.set(1.02, 0.95, 1.05); beard.position.set(0, 0.012, 0.02); head.add(beard);
    const mus = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.035, 4, 8), hairMat); mus.rotation.z = Math.PI / 2; mus.position.set(0, 0.03, 0.104); head.add(mus);
  }
  if (o.glasses) {
    const gm = M.col(o.glasses === true ? '#111' : o.glasses, 0.3, 0.4);
    for (const s of [-1, 1]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.0035, 6, 20), gm); ring.scale.y = 0.8; ring.position.set(0.037 * s, 0.084, 0.108); head.add(ring);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.023, 20), new THREE.MeshStandardMaterial({ color: '#aaccee', transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.2 }));
      lens.scale.y = 0.8; lens.position.set(0.037 * s, 0.084, 0.109); head.add(lens);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.003, 0.1), gm); arm.position.set(0.1 * s, 0.088, 0.058); head.add(arm);
    }
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.004, 0.004), gm); br.position.set(0, 0.09, 0.11); head.add(br);
  }
  if (o.helmet) {
    // PASGT helmet with desert cover
    const hm = mkMat('dcu');
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.14, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hm);
    shell.scale.set(0.93, 0.9, 1.02); shell.position.set(0, 0.1, -0.012); head.add(shell);
    const brim = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.012, 8, 32), hm); brim.rotation.x = Math.PI / 2 + 0.12; brim.scale.set(0.95, 1.05, 1); brim.position.set(0, 0.105, -0.012); head.add(brim);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.137, 0.137, 0.022, 32, 1, true), M.col('#3e3a2c', 0.9)); band.scale.set(0.93, 1, 1.02); band.position.set(0, 0.13, -0.012); head.add(band);
    for (const s of [-1, 1]) { const strap = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.12, 0.012), M.col('#4a4030', 0.9)); strap.position.set(0.1 * s, 0.02, 0.0); head.add(strap); }
  }
  if (o.cap) {
    const cm = M.col(o.cap, 0.8);
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.118, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), cm); c.scale.set(0.95, 0.9, 1.05); c.position.y = 0.09; head.add(c);
    const bill = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.008, 20, 1, false, -Math.PI / 2, Math.PI), cm); bill.position.set(0, 0.1, 0.09); bill.rotation.x = 0.08; head.add(bill);
  }

  // arms
  const armSide = (s) => {
    const sh = new THREE.Group(); sh.position.set(0.215 * s, 0.24, 0); chest.add(sh);
    const shoulderBall = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 12), sleeveMat); sh.add(shoulderBall);
    const upper = capsule(0.056, 0.22, sleeveMat); sh.add(upper);
    const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
    const long = o.top !== 'tshirt';
    const fore = capsule(0.047, 0.2, long ? sleeveMat : skin); el.add(fore);
    if (!long) { const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.062, 0.08, 14), sleeveMat); sl.position.y = 0.2; el.add(sl); }
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.05, 0.04, 14), long ? sleeveMat : skin); cuff.position.y = -0.22; if (long) el.add(cuff);
    const wr = new THREE.Group(); wr.position.y = -0.27; el.add(wr);
    const hand = buildHand(handMat, s); wr.add(hand.group);
    return { sh, el, wr, hand };
  };
  const L = armSide(1), R = armSide(-1); // L = character's left (+x)
  J.lSh = L.sh; J.lEl = L.el; J.lWr = L.wr; J.lHand = L.hand;
  J.rSh = R.sh; J.rEl = R.el; J.rWr = R.wr; J.rHand = R.hand;

  // legs
  const legSide = (s) => {
    const hp = new THREE.Group(); hp.position.set(0.095 * s, 0, 0); hips.add(hp);
    const thigh = capsule(0.078, 0.34, pantsMat); hp.add(thigh);
    const kn = new THREE.Group(); kn.position.y = -0.45; hp.add(kn);
    const shin = capsule(0.062, 0.34, pantsMat); kn.add(shin);
    const an = new THREE.Group(); an.position.y = -0.45; kn.add(an);
    const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.14, 6, 12), shoeMat); shoe.rotation.x = Math.PI / 2; shoe.scale.set(1.05, 1, 0.75); shoe.position.set(0, -0.035, 0.045); an.add(shoe);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.018, 0.25), M.col(o.pants === 'dcu' ? '#2a2016' : '#e8e4dc', 0.7)); sole.position.set(0, -0.07, 0.045); an.add(sole);
    if (o.pants === 'dcu') { const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.06, 0.16, 14), M.col('#b39a72', 0.9)); boot.position.y = 0.03; an.add(boot); }
    return { hp, kn, an };
  };
  const LL = legSide(1), RL = legSide(-1);
  J.lHip = LL.hp; J.lKnee = LL.kn; J.lAnk = LL.an; J.rHip = RL.hp; J.rKnee = RL.kn; J.rAnk = RL.an;

  root.scale.setScalar(o.height);
  root.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  const H = { root, J, opts: o };
  H.pose = (p) => applyPose(H, p);
  H.face = (f) => applyFace(H, f);
  H.rest = () => applyPose(H, {});
  applyPose(H, {});
  applyFace(H, {});
  return H;
}

function buildHand(mat, s) {
  const group = new THREE.Group();
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.085, 0.03, 2, 2, 2), mat);
  palm.position.y = -0.05; group.add(palm);
  const pr = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), mat); pr.scale.set(0.95, 1.1, 0.42); pr.position.y = -0.05; group.add(pr);
  const fingers = [];
  const fx = [0.027, 0.009, -0.009, -0.027];
  const fl = [0.036, 0.044, 0.042, 0.032];
  for (let i = 0; i < 4; i++) {
    const f1 = new THREE.Group(); f1.position.set(fx[i] * s, -0.093, 0); group.add(f1);
    const seg1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, fl[i] * 0.55, 4, 8), mat); seg1.position.y = -fl[i] * 0.3; f1.add(seg1);
    const f2 = new THREE.Group(); f2.position.y = -fl[i] * 0.6; f1.add(f2);
    const seg2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, fl[i] * 0.45, 4, 8), mat); seg2.position.y = -fl[i] * 0.25; f2.add(seg2);
    fingers.push([f1, f2]);
  }
  const th = new THREE.Group(); th.position.set(0.035 * s, -0.03, 0.012); th.rotation.z = 0.7 * s; group.add(th);
  const t1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0105, 0.03, 4, 8), mat); t1.position.y = -0.02; th.add(t1);
  const th2 = new THREE.Group(); th2.position.y = -0.042; th.add(th2);
  const t2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, 0.022, 4, 8), mat); t2.position.y = -0.015; th2.add(t2);
  return { group, fingers, thumb: [th, th2], s };
}

// curl: 0 = open flat, 1 = fist ; thumb: 0..1
export function setHand(hand, curl = 0.25, thumb = 0.3, spread = 0) {
  hand.fingers.forEach(([a, b], i) => {
    a.rotation.x = curl * 1.4; b.rotation.x = curl * 1.5;
    a.rotation.z = (i - 1.5) * spread * 0.12 * hand.s;
  });
  hand.thumb[0].rotation.x = thumb * 0.9; hand.thumb[1].rotation.x = thumb * 0.8;
}

// pose angles in degrees. Joint names: spine[x,y,z], chest, neck, head, lSh, lEl, lWr, rSh, rEl, rWr, lHip, lKnee, lAnk, rHip, rKnee, rAnk, hipsY (height offset)
function applyPose(H, p) {
  const J = H.J;
  const set = (j, v, def = [0, 0, 0]) => { const a = v || def; j.rotation.set(D(a[0]), D(a[1]), D(a[2])); };
  set(J.spine, p.spine); set(J.chest, p.chest); set(J.neck, p.neck); set(J.head, p.head);
  set(J.lSh, p.lSh, [0, 0, 8]); set(J.rSh, p.rSh, [0, 0, -8]);
  set(J.lEl, p.lEl, [-8, 0, 0]); set(J.rEl, p.rEl, [-8, 0, 0]);
  set(J.lWr, p.lWr); set(J.rWr, p.rWr);
  set(J.lHip, p.lHip); set(J.rHip, p.rHip); set(J.lKnee, p.lKnee); set(J.rKnee, p.rKnee); set(J.lAnk, p.lAnk); set(J.rAnk, p.rAnk);
  J.hips.position.y = 0.95 + (p.hipsY || 0);
  J.hips.rotation.set(D((p.hips || [0, 0, 0])[0]), D((p.hips || [0, 0, 0])[1]), D((p.hips || [0, 0, 0])[2]));
  setHand(J.lHand, p.lCurl ?? 0.25, p.lThumb ?? 0.3, p.lSpread ?? 0);
  setHand(J.rHand, p.rCurl ?? 0.25, p.rThumb ?? 0.3, p.rSpread ?? 0);
}

// face: blink 0..1, brows -1..1 (raise), mouth 0..1 (open), smile -1..1, look [x,y] radians
function applyFace(H, f) {
  const J = H.J;
  const blink = f.blink ?? 0;
  J.lids.forEach((l) => { l.rotation.x = lerp(-1.45, 0.25, blink); });
  J.brows.forEach((b) => {
    b.position.y = b.userData.base + (f.brows ?? 0) * 0.012;
    b.rotation.z = -0.12 * b.userData.s + (f.browTilt ?? 0) * 0.25 * b.userData.s;
  });
  const open = f.mouth ?? 0, smile = f.smile ?? 0;
  J.cavity.scale.set(1.3 + smile * 0.3 - open * 0.25, 0.12 + open * 1.1, 0.5);
  J.loLip.position.y = -0.005 - open * 0.02;
  J.upLip.position.y = 0.004 + open * 0.002;
  J.teeth.visible = open > 0.25;
  J.mouth.scale.x = 1 + smile * 0.25;
  J.upLip.rotation.x = 0; J.loLip.rotation.x = 0;
  J.loLip.position.z = smile * 0.002;
  J.mouth.rotation.z = 0;
  J.upLip.scale.y = J.loLip.scale.y = 1;
  // smile curves corners up: bend lips by rotating small amount
  J.loLip.rotation.y = 0;
  const look = f.look || [0, 0];
  J.eyes.forEach((e) => { e.rotation.set(-look[1], look[0], 0); });
}

// procedural idle: breathing, sway, blinks, subtle head motion. t in seconds.
export function idle(H, t, seed = 0, amt = 1) {
  const b = Math.sin(t * 2.2 + seed) * 0.8 * amt;
  const J = H.J;
  J.chest.rotation.x += D(b * 0.8);
  J.chest.scale.set(1, 1 + Math.sin(t * 2.2 + seed) * 0.006 * amt, 1);
  J.head.rotation.y += D(noise1(t * 0.6, seed) * 6 * amt);
  J.head.rotation.x += D(noise1(t * 0.5, seed + 3) * 3 * amt);
  J.spine.rotation.z += D(noise1(t * 0.4, seed + 5) * 1.5 * amt);
}
export function blinkAt(t, seed = 0) {
  const period = 2.7 + (seed % 3) * 0.6;
  const ph = ((t + seed * 0.37) % period) / period;
  const d = Math.abs(ph - 0.5) * period;
  return d < 0.08 ? 1 - d / 0.08 : 0;
}
// talking mouth from pseudo-syllables
export function talk(t, seed = 0, amt = 1) {
  return clamp((Math.sin(t * 17 + seed) * 0.5 + 0.5) * (0.4 + 0.6 * Math.abs(noise1(t * 4, seed))) * amt);
}
// walking cycle pose (degrees), phase in cycles
export function walkPose(ph, stride = 1) {
  const a = Math.sin(ph * Math.PI * 2), b = Math.cos(ph * Math.PI * 2);
  return {
    lHip: [-a * 26 * stride, 0, 0], rHip: [a * 26 * stride, 0, 0],
    lKnee: [Math.max(0, -b) * 45 * stride + 5, 0, 0], rKnee: [Math.max(0, b) * 45 * stride + 5, 0, 0],
    lSh: [a * 22 * stride, 0, 8], rSh: [-a * 22 * stride, 0, -8],
    lEl: [-15 - Math.max(0, a) * 15, 0, 0], rEl: [-15 - Math.max(0, -a) * 15, 0, 0],
    hipsY: -Math.abs(Math.sin(ph * Math.PI * 2)) * 0.02, spine: [4, a * 4, 0], chest: [0, -a * 5, 0],
  };
}
