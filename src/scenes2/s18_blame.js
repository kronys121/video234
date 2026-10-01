import * as THREE from 'three';
import { idle, blinkAt } from '../lib/human.js';
import { SIT, STAND, POINT_R, mix } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { sign, point } from '../lib/env.js';
import { desk, box, rbox } from '../lib/props.js';
import { room } from '../lib/rooms.js';
import { TEX, M, V, setCam, inv, smooth, easeInOut, easeOutBack, easeOutElastic, shake, lerp, kf, noise1 } from '../lib/util.js';

// 61.60–64.10  «В итоге крайним оказался именно стример»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05070a');
  const R = room({ w: 8, d: 8, h: 3.4, wall: M.std({ color: '#1a2228', roughness: 0.95 }), floor: M.std({ map: TEX.concrete([6, 6], '#2a2e32'), roughness: 0.6 }), ceil: M.col('#0a0c0e', 1), open: ['front'], cz: -0.5 }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#3a4a6a', '#0a0c10', 0.45));
  const tbl = desk(1.6, 0.8, 0.76, '#3a3f46'); tbl.position.set(0, 0, 0.7); scene.add(tbl);
  const chair = new THREE.Group(); box(0.46, 0.05, 0.46, M.col('#4a4f56', 0.4, 0.6), 0, 0.46, 0, chair); box(0.46, 0.5, 0.05, M.col('#4a4f56', 0.4, 0.6), 0, 0.75, -0.2, chair);
  for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) box(0.04, 0.46, 0.04, M.col('#4a4f56', 0.4, 0.6), x, 0.23, z, chair);
  chair.position.set(0, 0, -0.1); chair.traverse((m) => { if (m.isMesh) m.castShadow = true; }); scene.add(chair);
  const q = mk.quantum(); q.root.position.set(0, 0, -0.1); scene.add(q.root);
  const tag = sign('КРАЙНИЙ', { width: 0.34, color: '#ffffff', bg: '#d4213a', size: 100, pad: 18, border: '#ffffff', emissive: 0.4 }); tag.position.set(0, 0.04, 0.135); q.J.chest.add(tag);
  // hanging lamp + cone
  const lamp = new THREE.SpotLight('#fff1dc', 70, 8, 0.38, 0.6, 1.2); lamp.position.set(0, 3.2, 0.2); lamp.target.position.set(0, 0.9, -0.1); lamp.castShadow = true; lamp.shadow.mapSize.set(1536, 1536); lamp.shadow.bias = -0.0005; scene.add(lamp, lamp.target);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.2, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#fff1dc', transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); cone.geometry.translate(0, -1.6, 0); cone.position.set(0, 3.2, -0.1); scene.add(cone);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.2, 18, 1, true), M.col('#1a1a1a', 0.5, 0.5, { side: THREE.DoubleSide })); shade.position.set(0, 3.2, -0.1); scene.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), M.emis('#fff1dc', 6)); bulb.position.set(0, 3.12, -0.1); scene.add(bulb);
  point(scene, '#4a7aff', 8, 8, [-3, 1.8, 0.5]); point(scene, '#ff3b4a', 5, 8, [3, 1.6, 0.2]);
  // accusers: hackers + agents around, pointing
  const makers = [() => mk.hacker(), () => mk.agent('#d9a57f', '#111'), () => mk.hacker('#c9c0b8'), () => mk.agent('#8a5a3c', '#0a0a0a'), () => mk.hacker('#d8d0c8')];
  const spots = [[-0.95, -1.3], [-0.42, -2.0], [0.42, -2.0], [0.95, -1.3], [0.0, -2.7]];
  const acc = makers.map((m, i) => { const h = m(); h.root.position.set(spots[i][0], 0, spots[i][1]); h.root.rotation.y = 0; scene.add(h.root); h.t0 = 0.15 + i * 0.22; return h; });
  point(scene, '#6a8aff', 22, 7, [-1.8, 1.8, -0.6]); point(scene, '#ff5a6a', 18, 7, [1.8, 1.8, -0.6]);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const sc = smooth(inv(0.9, 1.9, lt));
    q.pose({ ...SIT, lSh: [-30, 0, 10], rSh: [-30, 0, -10], lEl: [-80, 20, 0], rEl: [-80, -20, 0], lCurl: 0.4, rCurl: 0.4, head: [lerp(30, 8, sc), 0, 0], spine: [lerp(14, 4, sc), 0, 0] });
    idle(q, lt, 3, 0.4);
    q.face({ blink: blinkAt(lt, 4), brows: 0.7 * sc, browTilt: 0.8, smile: -0.4, mouth: 0.1 * sc, look: [0, lerp(-0.3, 0, sc)] });
    const k = easeOutBack(inv(0.55, 1.05, lt), 2.2); tag.scale.setScalar(Math.max(0.001, k)); tag.visible = lt > 0.52;
    acc.forEach((h, i) => {
      const a = smooth(inv(h.t0, h.t0 + 0.35, lt));
      h.root.visible = lt > h.t0 - 0.02; h.root.scale.setScalar(Math.max(0.001, a));
      h.pose({ ...STAND, ...POINT_R, rSh: [-88 * a, 0, -6], rEl: [-4, 0, 0], lSh: [-10, 0, 10], head: [0, 0, 0], spine: [0, 0, 0] }); idle(h, lt, i + 9, 0.3);
      h.face({ blink: blinkAt(lt, i + 2), brows: -0.3, browTilt: 1, mouth: 0.1 });
    });
    cone.material.opacity = 0.04 + 0.015 * Math.sin(lt * 5);
    // low push-in with a growing dutch angle
    const f = kf(lt, [[0, [0.8, 1.0, 3.4], [0, 0.95, -0.1], 52, 0.0], [1.4, [0.2, 1.05, 2.5], [0, 1.0, -0.1], 48, -0.06], [2.5, [0.0, 1.15, 1.9], [0, 1.05, -0.1], 44, -0.14]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 8, 5)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.05, bloom: 0.35, bloomThreshold: 0.92, envIntensity: 0.08 };
}
