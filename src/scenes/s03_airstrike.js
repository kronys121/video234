import * as THREE from 'three';
import { skyDome, fire, smoke, embers, ground, sign, point, crate, particles } from '../lib/env.js';
import { sandbags, jet, box } from '../lib/props.js';
import { TEX, M, V, setCam, inv, smooth, easeInOut, easeOutCubic, clamp, shake, rng, lerp, glowTex, smokeTex } from '../lib/util.js';

// barracks hut exterior (reused by the ruins scene in its burnt state)
export function hut() {
  const g = new THREE.Group();
  const wall = M.std({ map: TEX.plywood([4, 1], '#a67c50'), roughness: 0.85 });
  const roofM = M.std({ map: TEX.metal([6, 2], '#5d6150'), roughness: 0.6, metalness: 0.4 });
  const body = box(6, 3, 12, wall, 0, 1.5, 0, g);
  const roof = new THREE.Group(); g.add(roof);
  const halves = [];
  for (const s of [-1, 1]) {
    const piv = new THREE.Group(); piv.position.set(0, 4.1, 0); roof.add(piv);
    const r = box(3.6, 0.12, 12.6, roofM, s * 1.65, -0.55, 0, piv); r.rotation.z = s * -0.55; halves.push(piv);
  }
  const gableShape = new THREE.Shape(); gableShape.moveTo(-3, 0); gableShape.lineTo(0, 1.1); gableShape.lineTo(3, 0);
  for (const z of [-6, 6]) { const gm = new THREE.Mesh(new THREE.ShapeGeometry(gableShape), wall); gm.position.set(0, 3, z); if (z < 0) gm.rotation.y = Math.PI; g.add(gm); }
  const wins = [];
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const w = box(0.06, 0.7, 1.1, M.col('#ffc97a', 0.4, 0, { emissive: '#ffb45a', emissiveIntensity: 1.4 }), s * 3.02, 1.9, -4.2 + i * 2.8, g); wins.push(w);
    box(0.1, 0.85, 1.25, M.col('#4a3522', 0.8), s * 3.0, 1.9, -4.2 + i * 2.8, g);
  }
  const door = box(1.1, 2.0, 0.08, M.col('#4a3522', 0.8), 0, 1.0, 6.03, g);
  const step = box(1.8, 0.2, 0.8, M.col('#6d5a44', 0.9), 0, 0.1, 6.4, g);
  void body; void door; void step;
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  g.userData = { wall, roofM, halves, wins };
  return g;
}

// 7.45–10.45  «попала под авиаудар и полностью выгорела»
export function build() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#141a2c', 30, 140);
  scene.add(skyDome([[0, '#04060f'], [0.35, '#0c1330'], [0.5, '#27294a'], [0.55, '#1a1a24'], [1, '#0a0a0a']]));
  // stars
  const starPos = []; const r = rng(99);
  for (let i = 0; i < 500; i++) { const a = r() * Math.PI * 2, e = 0.15 + r() * 1.2; starPos.push(Math.cos(a) * Math.cos(e) * 250, Math.sin(e) * 250, Math.sin(a) * Math.cos(e) * 250); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#dfe6ff', size: 1.2, sizeAttenuation: false, fog: false })));
  scene.add(new THREE.HemisphereLight('#4a5a8a', '#1a120a', 0.35));
  const moon = new THREE.DirectionalLight('#8aa0ff', 0.6); moon.position.set(-20, 30, 10); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15 }); scene.add(moon);

  const g = ground(300, M.std({ map: TEX.sand([40, 40]), color: '#8a7760', roughness: 1 })); scene.add(g);
  const H = hut(); H.position.set(0, 0, -6); H.rotation.y = 0.5; scene.add(H);
  const sb = sandbags(8, 3, 6); sb.position.set(-1.5, 0, 3.5); sb.rotation.y = 0.3; scene.add(sb);
  const cr = crate(1.4, 0.8, 0.8, { stencil: 'АВИАУДАР', color: '#56613f' }); cr.position.set(-4.0, 0.4, 7.6); cr.rotation.y = 0.75; scene.add(cr);
  const cr2 = crate(0.9, 0.6, 0.6, { stencil: 'AMMO', color: '#56613f' }); cr2.position.set(-5.0, 0.3, 5.6); cr2.rotation.y = 0.9; scene.add(cr2);
  const cr3 = crate(1.0, 0.6, 0.6, { wood: true }); cr3.position.set(2.8, 0.3, 5.5); cr3.rotation.y = -0.4; scene.add(cr3);
  // searchlights
  const beams = [];
  for (const [x, z, ph] of [[-25, -40, 0], [20, -50, 2], [40, -30, 4]]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 4, 80, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#9fb6ff', transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    b.geometry.translate(0, 40, 0); b.position.set(x, 0, z); b.userData.ph = ph; scene.add(b); beams.push(b);
  }
  // hut window glow
  const winLight = point(scene, '#ffb45a', 25, 12, [2.5, 2, -2.5]);

  // jet + missile
  const J = jet('#9aa0a6'); J.scale.setScalar(1.2); scene.add(J);
  const jl = new THREE.HemisphereLight('#8aa0d0', '#000', 0); void jl;
  for (const [x, c] of [[5, '#ff3030'], [-5, '#30ff60']]) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,255,255,1)'), color: c, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(1.6); s.position.set(x, 0.1, -1.8); J.add(s); }
  const jetFill = point(scene, '#9fb0ff', 0, 30, [0, 0, 0]);
  const missile = new THREE.Group();
  const mb = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 10), M.col('#ddd', 0.4, 0.5)); mb.rotation.x = Math.PI / 2; missile.add(mb);
  const mf = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,190,90,1)'), blending: THREE.AdditiveBlending, depthWrite: false })); mf.scale.setScalar(2.5); mf.position.z = -1; missile.add(mf);
  scene.add(missile);
  const trail = smoke({ n: 40, seed: 12, origin: [0, 0, 0], spread: [0.2, 0.2, 0.2], vel: [0, 0.3, 0], size: [0.6, 1.0], life: [1.2, 1.6], grow: 3, color: '#8a8a90', opacity: 0.5 });
  scene.add(trail);

  // explosion pieces
  const IMPACT = 1.0;
  const hit = V(0.3, 3.2, -5.2);
  const fireballs = [];
  const fbCols = ['#ffe6a0', '#ffab3a', '#ff6a10', '#c83208'];
  for (let i = 0; i < 22; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: i % 3 ? glowTex('rgba(255,255,255,1)') : smokeTex(), color: fbCols[i % 4], transparent: true, blending: i % 3 ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false }));
    m.userData = { d: V(r() - 0.5, r() * 0.9 + 0.2, r() - 0.5).normalize(), sp: 1.5 + r() * 3.5, s: 2.5 + r() * 3, delay: r() * 0.2, add: i % 3 !== 0 };
    if (!m.userData.add) m.material.color.set('#2a1d16');
    m.visible = false; scene.add(m); fireballs.push(m);
  }
  const debris = [];
  const dm = M.std({ map: TEX.plywood([1, 1], '#3a2a1a'), roughness: 0.9 });
  for (let i = 0; i < 40; i++) {
    const m = box(0.1 + r() * 0.5, 0.05 + r() * 0.1, 0.3 + r() * 1.2, i % 3 ? dm : M.col('#4a4d40', 0.6, 0.4));
    m.castShadow = true;
    m.userData = { v: V((r() - 0.5) * 16, 6 + r() * 12, (r() - 0.5) * 16 + 3), w: V(r() * 10, r() * 10, r() * 10) };
    m.visible = false; scene.add(m); debris.push(m);
  }
  const boomLight = point(scene, '#ffa040', 0, 60, [hit.x, hit.y + 1, hit.z + 2], true);
  boomLight.shadow.mapSize.set(512, 512);
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 48), new THREE.MeshBasicMaterial({ color: '#ffd8a0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  shock.rotation.x = -Math.PI / 2; shock.position.set(hit.x, 0.2, hit.z); scene.add(shock);
  // fires spreading over the hut
  const fires = [];
  const firePts = [[0, 3.6, 0], [-1.5, 3.2, 2.5], [1.6, 3.1, -2.5], [-1.2, 3.0, -4.5], [1.2, 3.3, 4.5], [0, 1, 6.2], [2.8, 1.2, 1], [-2.8, 1.2, -1], [0, 3.4, -5.5]];
  firePts.forEach((p, i) => { const f = fire(1.4 + (i % 3) * 0.4, 20 + i); f.position.set(...p); f.userData.delay = IMPACT + 0.15 + i * 0.16; H.add(f); fires.push(f); });
  const fireLight = point(scene, '#ff7a2a', 0, 30, [1, 4, -3]);
  const sm = smoke({ n: 30, seed: 5, origin: [0.3, 4.5, -5.5], spread: [5, 1, 8], vel: [0.5, 3.5, 0], velSpread: [0.5, 0.8, 0.5], size: [3, 5], life: [2.5, 4], grow: 2.5, color: '#1c1714', opacity: 0.8 });
  scene.add(sm);
  const emb = embers({ n: 80, seed: 8, origin: [0.3, 3.5, -5.5], spread: [6, 2, 9], vel: [0.5, 3, 0], velSpread: [1.5, 1.5, 1.5], life: [1, 2.5], turb: 0.6, size: [0.06, 0.14] });
  scene.add(emb);

  const camera = new THREE.PerspectiveCamera(58, 1080 / 1920, 0.1, 600);
  const burntCol = new THREE.Color('#1a130d'), wallCol = new THREE.Color('#ffffff');

  function update(lt) {
    // jet pass: from behind the camera over the hut
    const jk = inv(-0.1, 1.3, lt);
    J.position.set(lerp(-14, 12, jk), lerp(34, 26, jk), lerp(20, -70, jk));
    J.rotation.set(0.05, Math.PI + 0.18, Math.sin(lt * 2) * 0.1 + 0.2);
    J.userData.flame.scale.set(1, 0.8 + Math.sin(lt * 40) * 0.2, 1);
    jetFill.position.copy(J.position).add(V(0, -6, 4)); jetFill.intensity = 400;
    // missile from jet to hut
    const mk = inv(0.35, IMPACT, lt);
    const m0 = V(lerp(-14, 12, 0.32), 31, lerp(20, -70, 0.32));
    missile.visible = mk > 0 && mk < 1;
    missile.position.lerpVectors(m0, hit, easeInOut(mk) * 0.3 + mk * 0.7);
    missile.lookAt(hit);
    trail.position.set(0, 0, 0);
    trail.children.forEach((s, i) => { const a = clamp(mk - i * 0.02); s.position.lerpVectors(m0, hit, a * 0.98); s.material.opacity = mk > 0 && a > 0 ? 0.35 * (1 - inv(IMPACT, IMPACT + 1.2, lt)) : 0; s.scale.setScalar(0.8 + i * 0.03 + (lt - IMPACT > 0 ? (lt - IMPACT) : 0)); });

    // explosion
    const e = lt - IMPACT;
    fireballs.forEach((m) => {
      const u = m.userData; const a = e - u.delay; m.visible = a > 0 && a < 1.6;
      if (!m.visible) return;
      const k = easeOutCubic(clamp(a / 0.9));
      m.position.copy(hit).addScaledVector(u.d, k * u.sp);
      m.scale.setScalar(u.s * (0.3 + k * 1.2));
      m.material.opacity = (u.add ? 0.5 : 0.8) * clamp(1.3 - a / 1.2);
    });
    debris.forEach((m) => {
      const u = m.userData; m.visible = e > 0 && e < 3;
      if (!m.visible) return;
      m.position.set(hit.x + u.v.x * e, Math.max(0.1, hit.y + u.v.y * e - 9.8 * e * e), hit.z + u.v.z * e);
      m.rotation.set(u.w.x * e, u.w.y * e, u.w.z * e);
    });
    boomLight.intensity = e > 0 ? 900 * Math.exp(-e * 3.5) : 0;
    shock.visible = e > 0 && e < 0.8; shock.scale.setScalar(1 + e * 30); shock.material.opacity = clamp(1 - e / 0.8);

    // burn: fires spread, walls char, roof sags
    const burn = smooth(inv(IMPACT + 0.2, 2.9, lt));
    fires.forEach((f) => { f.visible = lt > f.userData.delay; f.scale.setScalar((1.2 + burn * 1.2) * clamp((lt - f.userData.delay) * 3)); f.userData.update(lt); });
    H.userData.wall.color.copy(wallCol).lerp(burntCol, burn);
    H.userData.roofM.color.set('#ffffff').lerp(burntCol, burn);
    H.userData.wins.forEach((w) => { w.material.emissiveIntensity = e > 0 ? 3 + Math.sin(lt * 20) : 1.4; w.material.emissive.set(e > 0 ? '#ff6a1a' : '#ffb45a'); });
    H.userData.halves.forEach((h, i) => { h.rotation.z = (i ? -1 : 1) * 0.35 * smooth(inv(2.0, 2.8, lt)); h.position.y = 4.1 - 0.8 * smooth(inv(2.0, 2.8, lt)); });
    fireLight.intensity = e > 0 ? 90 * (0.8 + 0.2 * Math.sin(lt * 17)) * clamp(e * 2) : 0;
    winLight.intensity = e > 0 ? 0 : 25;
    sm.visible = e > 0; sm.userData.update(Math.max(0, e) + 1); sm.children.forEach((s) => { s.material.opacity *= clamp(e); });
    emb.visible = e > 0; emb.userData.update(Math.max(0, e));
    beams.forEach((b) => { b.rotation.z = Math.sin(lt * 0.7 + b.userData.ph) * 0.5; b.rotation.x = Math.cos(lt * 0.5 + b.userData.ph) * 0.3; });

    // camera: looking up at the jet, then whip down onto the hut, heavy shake
    const pos = V(-3.2, 1.3, 11.5).lerp(V(-2.0, 1.7, 8.8), smooth(inv(1.2, 3.0, lt)));
    const lookJet = J.position.clone();
    const lookHut = V(0.3, 2.6, -5);
    const w = easeInOut(inv(0.55, 0.95, lt));
    const look = lookJet.lerp(lookHut, w);
    const sk = e > 0 ? Math.exp(-e * 1.4) * 0.35 + 0.03 : 0.01;
    pos.add(shake(lt, sk, 18, 3));
    setCam(camera, pos, look.add(shake(lt, sk * 1.5, 14, 9)), shake(lt, sk * 0.3, 10, 5).x);
    camera.fov = 58 - 6 * smooth(inv(1.2, 3.0, lt)); camera.updateProjectionMatrix();
  }
  return { scene, camera, update, exposure: 0.9, bloom: 0.45, bloomThreshold: 0.85, envIntensity: 0.15 };
}
