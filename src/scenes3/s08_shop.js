import * as THREE from 'three';
import { mk3 } from '../lib/cast3.js';
import { idle2 } from '../lib/human2.js';
import { bucket, shelfUnit, counter, barrel, sack, timberTex, beetle, walkBug, questionMark, snowTex } from '../lib/fantasy.js';
import { walkPose } from '../lib/human.js';
import { sign, point, skyDome, particles } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { room } from '../lib/rooms.js';
import { solid } from '../lib/overlap.js';
import { TEX, M, V, setCam, kf, inv, smooth, easeOutBack, easeInOut, easeOutCubic, shake, lerp, clamp, rng, glowTex } from '../lib/util.js';

// 20.35–22.75  «Похожая история случилась с другим багом:»
export function buildExterior() {
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#2a3450', 12, 60);
  scene.add(skyDome([[0, '#141a34'], [0.42, '#3a4a78'], [0.5, '#c88a6a'], [1, '#2a3450']]));
  scene.add(new THREE.HemisphereLight('#8a9ac8', '#2a2a3a', 0.6));
  const moon = new THREE.DirectionalLight('#aabbff', 0.8); moon.position.set(-10, 14, 8); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); scene.add(moon);
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.std({ map: snowTex([20, 20]), color: '#b8c4d4', roughness: 0.95 })); gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; scene.add(gnd);
  const house = new THREE.Group();
  box(5, 3.2, 4, M.std({ map: timberTex([2, 1]), roughness: 0.85 }), 0, 1.6, 0, house);
  const roofS = new THREE.Shape(); roofS.moveTo(-2.8, 0); roofS.lineTo(0, 1.8); roofS.lineTo(2.8, 0);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofS, { depth: 4.6, bevelEnabled: false }), M.std({ map: TEX.plywood([3, 2], '#4a2e1e'), roughness: 0.9 })); roof.position.set(0, 3.2, -2.3); house.add(roof);
  const snowRoof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofS, { depth: 4.62, bevelEnabled: false }), M.col('#eef3f8', 0.8)); snowRoof.scale.set(1.02, 0.25, 1); snowRoof.position.set(0, 4.55, -2.31); house.add(snowRoof);
  box(1.1, 2.0, 0.08, M.std({ map: TEX.plywood([1, 2], '#5a3a20'), roughness: 0.8 }), -0.6, 1.0, 2.02, house);
  for (const x of [1.3]) { box(1.0, 0.8, 0.06, M.emis('#ffb860', 1.2), x, 1.6, 2.02, house); box(1.15, 0.95, 0.04, M.col('#3a2414', 0.8), x, 1.6, 2.0, house); }
  house.position.set(0, 0, -3); house.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); scene.add(solid(house, 'house', [], [house.children[0]]));
  // hanging sign on a bracket
  const br = box(1.0, 0.06, 0.06, M.col('#2a2a2a', 0.4, 0.8), -1.75, 2.75, -0.7, scene); void br;
  const plank = sign('ЛАВКА', { width: 0.9, color: '#f2e2b8', bg: '#5a3418', size: 120, pad: 24, border: '#c8a24a', double: true }); plank.position.set(-2.0, 2.35, -0.7); scene.add(plank);
  for (const x of [-2.3, -1.7]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.25, 4), M.col('#2a2a2a', 0.4, 0.8)); c.position.set(x, 2.62, -0.7); scene.add(c); }
  const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), M.emis('#ffcf80', 4)); lantern.position.set(0.3, 2.4, -0.85); scene.add(lantern);
  point(scene, '#ffb860', 14, 8, [0.3, 2.3, -0.5]);
  const b1 = barrel(); b1.position.set(1.9, 0, -0.5); scene.add(solid(b1, 'barrel')); const b2 = barrel(0.85); b2.position.set(3.05, 0, -0.55); scene.add(solid(b2, 'barrel2'));
  const bug = beetle({ s: 0.35 }); scene.add(bug);
  const snow = particles({ n: 80, seed: 2, tex: glowTex('rgba(255,255,255,1)'), color: '#ffffff', additive: false, size: [0.03, 0.06], life: [3, 5], origin: [0, 5, 0], spread: [10, 1, 10], vel: [0.2, -1.2, 0], velSpread: [0.2, 0.2, 0.2], opacity: 0.8, fade: false, turb: 0.3 }); scene.add(snow);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 200);
  function update(lt) {
    snow.userData.update(lt + 3);
    bug.position.set(-2.38 + ((lt * 0.28) % 0.8), 2.62, -0.7); bug.rotation.y = Math.PI / 2; walkBug(bug, lt, 12);
    plank.rotation.y = Math.sin(lt * 1.2) * 0.08;
    const f = kf(lt, [[0, [1.6, 1.6, 6.5], [-0.6, 1.8, -1.5], 54, 0.04], [2.4, [-0.8, 2.2, 1.8], [-2.0, 2.45, -0.7], 46, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.2 };
}

// interior shared by the next three shots
function shopSet(scene) {
  scene.background = new THREE.Color('#140e0a');
  const R = room({ w: 6.4, d: 7, h: 3.2, wall: M.std({ map: timberTex([2, 1]), roughness: 0.85 }), floor: M.std({ map: TEX.plywood([4, 4], '#5a3a22'), roughness: 0.8 }), ceil: M.col('#2a1a10', 1), open: ['front'] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#ffd9b0', '#2a1a10', 0.55));
  const key = new THREE.SpotLight('#ffcf94', 26, 10, 0.9, 0.6, 1.3); key.position.set(0.6, 3.1, 1.6); key.target.position.set(0, 0.9, -1.0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  for (const x of [-2.2, 2.2]) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), M.emis('#ffcf80', 5)); c.position.set(x, 2.3, -2.6); scene.add(c); point(scene, '#ffb060', 8, 6, [x, 2.2, -2.3]); }
  const cnt = counter(2.3); cnt.position.set(0, 0, 0); scene.add(solid(cnt, 'counter'));
  const sh1 = shelfUnit(1.7, 2.1, 0.4, 3); sh1.group.position.set(-0.95, 0, -2.25); scene.add(solid(sh1.group, 'shelf1', [], sh1.group.children.filter((c) => !sh1.items.includes(c))));
  const sh2 = shelfUnit(1.7, 2.1, 0.4, 9); sh2.group.position.set(0.95, 0, -2.25); scene.add(solid(sh2.group, 'shelf2', [], sh2.group.children.filter((c) => !sh2.items.includes(c))));
  const b = barrel(); b.position.set(-2.6, 0, -1.0); scene.add(solid(b, 'barrel')); const s1 = sack(); s1.position.set(2.6, 0, -0.6); scene.add(solid(s1, 'sack'));
  const merchant = mk3.merchant(); merchant.root.position.set(0, 0, -0.85); scene.add(merchant.root);
  const hero = mk3.hero(); scene.add(hero.root);
  const bk = bucket(1.18); scene.add(solid(bk, 'bucket', ['merchant', 'hero']));
  return { sh1, sh2, merchant, hero, bk };
}
const bucketOnHead = (bk, M2) => { M2.root.updateMatrixWorld(true); const p = M2.J.head.localToWorld(new THREE.Vector3(0, 0.29, 0.005)); bk.position.copy(p); bk.rotation.set(Math.PI, M2.root.rotation.y + M2.J.head.rotation.y, 0); };
const blindPose = (m, lt) => { const s = Math.sin(lt * 2.4); m.pose({ lSh: [-75, 0, 20 + 10 * s], rSh: [-75, 0, -20 + 10 * s], lEl: [-20, 0, 0], rEl: [-20, 0, 0], lCurl: 0.1, rCurl: 0.1, head: [0, 40 * s, 0], spine: [0, 12 * s, 0] }); idle2(m, lt, 4, 0.2); m.face({ blink: 0, brows: 1, mouth: 0.3 }); };

// 22.75–27.25  «если зайти в лавку торговца и надеть ему на голову обычное деревянное ведро,»
export function buildBucket() {
  const scene = new THREE.Scene(); const S = shopSet(scene);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  const TOSS = 2.2, LAND = 2.8; const hp = new THREE.Vector3();
  function update(lt) {
    // hero walks in, stops at the counter, tosses the bucket onto the merchant's head
    const w = clamp(inv(0, 1.5, lt)); const z = lerp(3.0, 1.0, easeInOut(w));
    S.hero.root.position.set(0.25, 0, z); S.hero.root.rotation.y = Math.PI;
    const lift = smooth(inv(1.6, TOSS, lt)), throwK = smooth(inv(TOSS, TOSS + 0.25, lt));
    if (w < 1) S.hero.pose({ ...walkPose(lt * 1.2, 0.9), rSh: [-40, 0, -10], rEl: [-50, 0, 0] }); else S.hero.pose({ rSh: [lerp(-40, -150, lift) + 40 * throwK, 0, -10], rEl: [lerp(-50, -20, lift), 0, 0], lSh: [lerp(-10, -140, lift) + 40 * throwK, 0, 10], lEl: [-20 * lift, 0, 0], spine: [10 * throwK, 0, 0], head: [-10 * lift, 0, 0], rCurl: 0.6, lCurl: 0.6 });
    idle2(S.hero, lt, 2, 0.3); S.hero.face({ blink: 0, brows: 0.3, smile: 0.8 * lift, mouth: 0.05 });
    const surprise = smooth(inv(TOSS, TOSS + 0.3, lt));
    if (lt < LAND) { S.merchant.pose({ lSh: [-20, 0, 15], rSh: [-20, 0, -15], lEl: [-60, 0, 0], rEl: [-60, 0, 0], head: [-15 * surprise, 0, 0] }); S.merchant.face({ blink: 0, brows: 0.3 + 0.7 * surprise, mouth: 0.6 * surprise, smile: 0.4 * (1 - surprise) }); }
    else blindPose(S.merchant, (lt - LAND) * 0.6);
    idle2(S.merchant, lt, 6, 0.2);
    // bucket: in the hero's hands → arc → on the merchant's head
    S.hero.root.updateMatrixWorld(true);
    const l = S.hero.J.lHand.group.getWorldPosition(new THREE.Vector3()), r = S.hero.J.rHand.group.getWorldPosition(hp); const hands = l.add(r).multiplyScalar(0.5);
    S.merchant.root.updateMatrixWorld(true); const head = S.merchant.J.head.localToWorld(new THREE.Vector3(0, 0.29, 0.005));
    if (lt < TOSS) { S.bk.position.copy(hands).add(V(0, -0.08, 0.02)); S.bk.rotation.set(lerp(0, Math.PI * 0.6, lift), 0, 0); }
    else if (lt < LAND) { const k = (lt - TOSS) / (LAND - TOSS); S.bk.position.lerpVectors(hands.clone().add(V(0, -0.08, 0.02)), head, easeOutCubic(k)); S.bk.position.y += Math.sin(k * Math.PI) * 0.45; S.bk.rotation.set(lerp(Math.PI * 0.6, Math.PI * 2 + Math.PI, k), 0, 0); }
    else { bucketOnHead(S.bk, S.merchant); const bb = Math.exp(-(lt - LAND) * 7) * Math.sin((lt - LAND) * 30) * 0.03; S.bk.position.y += bb; }
    const f = kf(lt, [[0, [1.6, 1.7, 4.4], [0, 1.4, -0.8], 54, 0.03], [1.6, [1.5, 1.6, 2.2], [0, 1.6, -0.6], 52, 0], [3.0, [0.9, 1.75, 1.5], [0, 1.85, -0.85], 46, -0.02], [4.5, [0.7, 1.8, 1.25], [0, 1.85, -0.85], 44, -0.03]]);
    const hit = lt > LAND ? Math.exp(-(lt - LAND) * 8) : 0;
    setCam(camera, f.pos.add(shake(lt, 0.004 + hit * 0.02, 14, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}

// 27.25–29.55  «продавец переставал видеть, как покупатель»
export function buildBlind() {
  const scene = new THREE.Scene(); const S = shopSet(scene);
  const qs = [questionMark(), questionMark('#9fd6ff'), questionMark()]; qs.forEach((q) => scene.add(q));
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    blindPose(S.merchant, lt + 1); bucketOnHead(S.bk, S.merchant);
    // hero tiptoes around the end of the counter toward the shelves
    const k = easeInOut(inv(0, 2.3, lt));
    const p = [V(1.7, 0, 0.9), V(1.75, 0, -0.5), V(1.05, 0, -1.4)]; const a = k < 0.5 ? p[0].clone().lerp(p[1], k * 2) : p[1].clone().lerp(p[2], (k - 0.5) * 2);
    S.hero.root.position.copy(a); S.hero.root.rotation.y = k < 0.5 ? Math.PI : Math.PI + lerp(0, 0.9, (k - 0.5) * 2);
    S.hero.pose({ ...walkPose(lt * 0.9, 0.6), hipsY: -0.12, spine: [22, 0, 0], head: [-15, -30, 0], lSh: [-40, 0, 20], rSh: [-40, 0, -20], lEl: [-90, 0, 0], rEl: [-90, 0, 0] });
    S.hero.face({ blink: 0, brows: 0.5, smile: 0.7, mouth: 0, look: [-0.3, 0] });
    qs.forEach((q, i) => { const t0 = 0.2 + i * 0.35; const kk = easeOutBack(inv(t0, t0 + 0.35, lt), 2.6); q.scale.setScalar(Math.max(0.001, kk)); q.visible = lt > t0 - 0.02; q.position.set(-0.45 + i * 0.45, 2.45 + Math.sin(lt * 3 + i) * 0.05 + (i === 1 ? 0.18 : 0), -0.85); q.rotation.z = Math.sin(lt * 4 + i) * 0.15; });
    const f = kf(lt, [[0, [-0.4, 1.7, 2.7], [0.2, 1.5, -0.8], 54, 0.02], [2.3, [-0.9, 1.75, 2.1], [0.4, 1.5, -1.0], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 6, 4)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}

// 29.55–32.10  «спокойно обчищает его собственный магазин.»
export function buildLoot() {
  const scene = new THREE.Scene(); const S = shopSet(scene);
  const bag = sack('#8a6a4a'); scene.add(bag);
  const items = [...S.sh2.items, ...S.sh1.items.slice(-4)];
  const start = items.map((it) => it.getWorldPosition(new THREE.Vector3()));
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const lp = new THREE.Vector3();
  function update(lt) {
    blindPose(S.merchant, lt + 3.3); bucketOnHead(S.bk, S.merchant);
    S.hero.root.position.set(1.15, 0, -1.2); S.hero.root.rotation.y = Math.PI + 0.9;
    S.hero.pose({ lSh: [-55, 0, 25], lEl: [-40, 0, 0], lCurl: 0.8, rSh: [-50 + Math.sin(lt * 8) * 18, 0, -10], rEl: [-40, 0, 0], rCurl: 0.5, spine: [8, 0, 0], head: [10, 10, 0] });
    idle2(S.hero, lt, 3, 0.3); S.hero.face({ blink: 0, brows: 0.4, smile: 1, mouth: 0.15 });
    S.hero.root.updateMatrixWorld(true); S.hero.J.lHand.group.getWorldPosition(lp);
    bag.position.copy(lp).add(V(0, -0.5, 0)); bag.rotation.set(0, 0.6, 0);
    const mouth = lp.clone().add(V(0, 0.0, 0));
    items.forEach((it, i) => {
      const t0 = 0.1 + i * 0.11, k = clamp(inv(t0, t0 + 0.45, lt)); const parentInv = new THREE.Matrix4().copy(it.parent.matrixWorld).invert();
      const w = start[i].clone().lerp(mouth, easeInOut(k)); w.y += Math.sin(k * Math.PI) * 0.5;
      it.position.copy(w.applyMatrix4(parentInv)); it.rotation.set(k * 6, k * 4, 0); it.scale.setScalar(k > 0.9 ? Math.max(0.001, (1 - k) * 10) : 1); it.visible = k < 1;
    });
    const f = kf(lt, [[0, [2.4, 1.6, 0.9], [0.6, 1.3, -1.8], 52, 0.03], [2.55, [2.0, 1.7, 0.4], [0.5, 1.3, -1.8], 48, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 6, 6)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}
