import * as THREE from 'three';
import { human, idle, blinkAt } from '../lib/human.js';
import { skyDome, sun, fire, smoke, particles, ground, sign, point } from '../lib/env.js';
import { humvee, tent, sandbags, derrick, binoculars } from '../lib/props.js';
import { text3d } from '../lib/text3d.js';
import { TEX, M, V, setCam, path, inv, smooth, easeOutBack, easeOutBounce, easeInOut, clamp, shake, rng } from '../lib/util.js';

// 0.00–4.07  «Во время войны в Персидском заливе в 1991 году»
export function build() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#8a5a48', 40, 190);
  scene.add(skyDome([[0, '#2b2350'], [0.3, '#7a4a6a'], [0.47, '#e2874a'], [0.52, '#f4b068'], [1, '#6a4a30']]));
  scene.add(new THREE.HemisphereLight('#ffc89a', '#4a3020', 0.55));
  sun(scene, { color: '#ffb070', intensity: 2.4, pos: [-30, 14, -40], size: 18 });
  const sandMat = M.std({ map: TEX.sand([40, 40]), roughness: 1, bumpMap: TEX.sand([40, 40]), bumpScale: 0.6 });
  const g = ground(400, sandMat, 80);
  const p = g.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); const d = Math.hypot(x, y); p.setZ(i, d < 12 ? 0 : Math.sin(x * 0.05) * Math.cos(y * 0.04) * 2.5 * clamp((d - 12) / 30)); }
  g.geometry.computeVertexNormals(); scene.add(g);

  // camp
  const t1 = tent(4, 2.6, 6); t1.position.set(-6, 0, -6); t1.rotation.y = 0.3; scene.add(t1);
  const t2 = tent(4, 2.6, 6); t2.position.set(7, 0, -10); t2.rotation.y = -0.4; scene.add(t2);
  const hv = humvee(); hv.position.set(5.2, 0, -7.5); hv.rotation.y = -0.6; scene.add(hv);
  const sb = sandbags(7, 3, 4); sb.position.set(0, 0, -2.2); scene.add(sb);
  const sb2 = sandbags(5, 2, 5); sb2.position.set(-3.2, 0, -1.5); sb2.rotation.y = 0.7; scene.add(sb2);
  const flag = sign('KUWAIT  12 KM', { width: 1.6, color: '#1b1b1b', bg: '#e8dcc0', size: 90, pad: 26, grunge: 0.5, border: '#1b1b1b' });
  flag.position.set(-2.4, 1.3, -3.4); flag.rotation.y = 0.35; scene.add(flag);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 8), M.col('#5a4a33', 0.9)); post.position.set(-2.4, 0.65, -3.45); post.castShadow = true; scene.add(post);

  // burning oil wells on horizon
  const fires = [];
  const r = rng(11);
  for (let i = 0; i < 6; i++) {
    const x = -40 + i * 16 + r() * 6, z = -70 - r() * 30;
    const d = derrick(7 + r() * 3); d.position.set(x, 0, z); scene.add(d);
    const f = fire(3 + r() * 2, i + 1); f.position.set(x, 0, z); scene.add(f); fires.push(f);
    const sm = smoke({ n: 22, seed: 40 + i, origin: [x, 6, z], spread: [3, 2, 3], vel: [2.5, 4.5, 0], velSpread: [0.8, 0.6, 0.6], size: [6, 10], life: [5, 9], grow: 2.8, color: '#221c1a', opacity: 0.85 });
    scene.add(sm); fires.push(sm);
    const pl = point(scene, '#ff7a2a', 250, 45, [x, 4, z + 6]); void pl;
  }
  // anti-aircraft tracers: short glowing dashes climbing at an angle
  const tracers = [];
  const trMat = new THREE.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 2.2, 3, 6), trMat);
    const ang = (i % 2 ? 1 : -1) * (0.35 + r() * 0.35);
    m.userData = { x0: -30 + i * 10 + r() * 4, z: -55 - r() * 20, ph: r() * 1.4, ang };
    m.rotation.z = -ang; scene.add(m); tracers.push(m);
  }
  // soldier (third person, from behind)
  const sol = human({ skin: '#d7a47e', top: 'uniform', pants: 'dcu', helmet: true, shoes: '#b39a72', hair: '#3a2a1c', gloves: '#9c8a64' });
  sol.root.position.set(0, 0, 0); sol.root.rotation.y = Math.PI; scene.add(sol.root);
  const bino = binoculars(); sol.J.rWr.add(bino); bino.position.set(-0.045, -0.1, 0.05); bino.rotation.set(Math.PI / 2, 0, 0);
  // rifle on back
  const rifle = new THREE.Group();
  const rm = M.col('#1d1d1b', 0.5, 0.4);
  const rb = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.9), rm); rifle.add(rb);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8), rm); barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.6; rifle.add(barrel);
  rifle.position.set(0.05, 0.05, -0.16); rifle.rotation.set(0.2, 0, 0.75); rifle.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  sol.J.chest.add(rifle);

  // "1991" rising from the sand
  const year = text3d('1991', { family: 'mont', size: 2.2, depth: 0.6, bevel: 0.08, color: '#ffb347', side: '#9a4a12', emissive: '#ff8a2a', emissiveIntensity: 0.25 });
  year.position.set(0.3, -4, -13); scene.add(year);
  const dust = particles({ n: 40, seed: 9, tex: null, color: '#d9b27a', additive: false, size: [0.6, 1.4], life: [1.2, 2.2], origin: [0.3, 0.2, -13], spread: [7, 0.3, 1.5], vel: [0, 1.2, 0.6], velSpread: [2, 0.5, 0.8], grow: 2.5, opacity: 0.5 });
  scene.add(dust);
  const yearLight = point(scene, '#ffb060', 0, 14, [0.3, 2, -10]);

  const camera = new THREE.PerspectiveCamera(62, 1080 / 1920, 0.05, 600);
  const T_YEAR = 1.75;

  function update(lt) {
    // fly-in from the sky to over-the-shoulder
    const k = easeInOut(inv(0, 1.5, lt));
    const pos = path([[8, 26, 30], [5, 12, 14], [1.4, 3.2, 4.6], [0.75, 1.78, 2.35]], k);
    const drift = inv(1.5, 4.1, lt);
    pos.add(V(-drift * 0.35, drift * 0.05, -drift * 0.6));
    const look = V(0, 1.2 + (1 - k) * -1.0, -12).lerp(V(0.2, 2.0, -13), smooth(inv(1.6, 2.4, lt)));
    pos.add(shake(lt, 0.012, 3));
    setCam(camera, pos, look, -0.04 * (1 - k) + Math.sin(lt * 0.8) * 0.01);

    // soldier: binoculars up, then lowers and turns head
    const down = smooth(inv(2.3, 2.9, lt));
    sol.pose({
      rSh: [-75 + down * 60, 0, -35 + down * 25], rEl: [-115 + down * 85, 0, 0], rWr: [20, 0, 0],
      lSh: [-75 + down * 70, 0, 35 - down * 27], lEl: [-115 + down * 105, 0, 0], lCurl: 0.6, rCurl: 0.7,
      head: [down * -4, down * 35 * smooth(inv(3.0, 3.5, lt)), 0], spine: [2, 0, 0], lHip: [0, 0, 3], rHip: [0, 0, -3],
    });
    idle(sol, lt, 1, 0.6);
    sol.face({ blink: blinkAt(lt, 2), brows: 0.2 });

    // year pop with bounce
    const yk = inv(T_YEAR, T_YEAR + 0.8, lt);
    year.position.y = -4 + easeOutBounce(yk) * 7.2;
    year.rotation.y = (1 - easeOutBack(inv(T_YEAR, T_YEAR + 0.9, lt))) * 1.2 + Math.sin(lt * 1.5) * 0.05;
    year.scale.setScalar(0.4 + 0.6 * easeOutBack(yk));
    yearLight.intensity = 60 * smooth(yk);
    dust.visible = lt > T_YEAR; dust.userData.update(Math.max(0, lt - T_YEAR));
    dust.children.forEach((s) => { s.material.opacity *= clamp(1 - (lt - T_YEAR - 1.2)); });

    fires.forEach((f) => f.userData.update(lt + 3));
    tracers.forEach((m) => {
      const u = m.userData; const a = ((lt + u.ph) % 1.4) / 1.4;
      m.position.set(u.x0 + Math.sin(u.ang) * a * 40, 2 + Math.cos(u.ang) * a * 40, u.z);
      m.visible = a < 0.85;
    });
  }
  return { scene, camera, update, exposure: 0.85, bloom: 0.4, bloomThreshold: 0.92, envIntensity: 0.25 };
}
