import * as THREE from 'three';
import { gameboy, gbScreen } from '../lib/gameboy.js';
import { point, particles } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { V, M, TEX, setCam, inv, smooth, easeInOut, easeOutBack, easeInCubic, lerp, clamp, shake, rng, labelTex, glowTex, sprite } from '../lib/util.js';

// 46.30–end  «почему старую технику иногда собирали "на совесть"»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0d0a0c');
  scene.fog = new THREE.Fog('#0d0a0c', 3, 9);
  scene.add(new THREE.HemisphereLight('#ffd8b0', '#140c10', 0.25));
  const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 64), M.std({ map: TEX.tiles([10, 10], '#2a2426'), roughness: 0.3, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // two pedestals: the burnt original and the "new" one assembling
  const pedM = M.std({ map: TEX.concrete([1, 1], '#3a3336'), roughness: 0.5 });
  const pedL = rbox(0.34, 0.9, 0.34, 0.02, pedM, -0.28, 0.45, 0, scene); pedL.castShadow = true; pedL.receiveShadow = true;
  const pedR = rbox(0.34, 0.9, 0.34, 0.02, pedM, 0.28, 0.45, 0, scene); pedR.castShadow = true; pedR.receiveShadow = true;
  const old = gameboy({ burnt: 1 }); old.group.position.set(-0.28, 0.9 + 0.074, 0); old.group.rotation.set(-0.1, 0.35, 0); scene.add(old.group);
  const neu = gameboy(); neu.group.position.set(0.28, 0.9 + 0.074, 0); neu.group.rotation.set(-0.1, -0.35, 0); scene.add(neu.group);
  // record each part's rest transform and a random fly-in offset
  const r = rng(21);
  const parts = neu.group.children.map((c, i) => ({ c, p: c.position.clone(), q: c.quaternion.clone(), off: V((r() - 0.5) * 0.5, 0.15 + r() * 0.4, (r() - 0.2) * 0.5), rot: V(r() * 6, r() * 6, r() * 6), d: 0.15 + (i / neu.group.children.length) * 1.1 + r() * 0.1 }));
  // keylights: warm key, magenta + green rims (accent palette)
  const key = new THREE.SpotLight('#ffd6a0', 10, 7, 0.45, 0.6, 1.3); key.position.set(1.2, 2.6, 1.8); key.target.position.set(0, 0.95, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; scene.add(key, key.target);
  point(scene, '#c2267a', 6, 4, [-1.2, 1.5, -1.0]);
  point(scene, '#8fe34a', 3, 3, [1.2, 1.2, -0.8]);
  const orange = point(scene, '#ff8a2a', 3, 3, [-0.6, 1.2, 0.6]);
  const halo = sprite(glowTex('rgba(255,255,255,1)'), '#ffd27a', 1.4, true, 0.12); halo.position.set(0, 1.05, -0.6); scene.add(halo);
  const dust = particles({ n: 60, seed: 5, color: '#ffe0b0', size: [0.006, 0.014], life: [3, 6], origin: [0, 1.2, 0], spread: [2, 1.4, 1.5], vel: [0.02, 0.03, 0], velSpread: [0.02, 0.02, 0.02], opacity: 0.6, turb: 0.05 });
  scene.add(dust);
  // plaque on the floor in front + big stamp
  const plq = rbox(0.62, 0.02, 0.26, 0.006, M.std({ map: TEX.plywood([1, 1], '#bca880'), roughness: 0.8 }), 0, 0.912, 0.3, scene); plq.receiveShadow = true;
  const shelf = box(1.0, 0.9, 0.36, pedM, 0, 0.45, 0.3, scene); shelf.castShadow = true; shelf.receiveShadow = true; shelf.scale.set(1, 0.999, 1); shelf.position.y = 0.45 - 0.001;
  const { tex, aspect } = labelTex('«НА СОВЕСТЬ»', { font: 'Russo', size: 130, color: '#d0141b', pad: 30, grunge: 0.55, border: '#d0141b' });
  const imprint = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.58 / aspect), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -4 }));
  imprint.rotation.x = -Math.PI / 2; imprint.position.set(0, 0.923, 0.3); scene.add(imprint);
  const stamp = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.22, 20), M.col('#6b3f1f', 0.45)); handle.position.y = 0.19; stamp.add(handle);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 14), M.col('#6b3f1f', 0.45)); knob.position.y = 0.33; stamp.add(knob);
  rbox(0.62, 0.06, 0.24, 0.01, M.col('#4a2c16', 0.5), 0, 0.05, 0, stamp);
  box(0.6, 0.02, 0.22, M.col('#b01e1e', 0.7), 0, 0.012, 0, stamp);
  stamp.traverse((m) => { if (m.isMesh) m.castShadow = true; }); scene.add(stamp);
  const camera = new THREE.PerspectiveCamera(44, 1080 / 1920, 0.02, 40);
  const STAMP = 2.38;

  function update(lt) {
    parts.forEach(({ c, p, q, off, rot, d }) => {
      const k = easeOutBack(inv(d, d + 0.45, lt), 1.6);
      c.position.copy(p).addScaledVector(off, 1 - k);
      c.quaternion.copy(q); c.rotateX(rot.x * (1 - k)); c.rotateY(rot.y * (1 - k)); c.rotateZ(rot.z * (1 - k));
      c.visible = lt > d - 0.05;
    });
    gbScreen(neu, lt > 1.6 ? (lt < 2.3 ? 'boot' : 'tetris') : 'off', lt > 1.6 && lt < 2.3 ? lt - 1.6 : lt, smooth(inv(1.6, 1.8, lt)));
    gbScreen(old, 'tetris', lt + 20, 1);
    neu.group.rotation.y = -0.35 + Math.sin(lt * 0.8) * 0.08;
    // stamp slam
    const down = inv(STAMP - 0.28, STAMP, lt), up = inv(STAMP + 0.2, STAMP + 0.6, lt);
    const sy = lt < STAMP ? lerp(0.9, 0, easeInCubic(down)) : lerp(0, 1.4, smooth(up));
    stamp.position.set(0, 0.922 + sy, 0.3); stamp.rotation.y = 0.15 * (1 - clamp(down));
    stamp.visible = lt > STAMP - 0.3;
    imprint.visible = lt >= STAMP;
    const hit = lt >= STAMP ? Math.exp(-(lt - STAMP) * 7) : 0;
    imprint.scale.setScalar(1 + hit * 0.12);
    orange.intensity = 3 + hit * 20;
    dust.userData.update(lt);
    // camera: slow push, then pull back and tilt to the plaque for the stamp
    const a = easeInOut(inv(0, 2.1, lt)), b = easeInOut(inv(2.0, 2.5, lt));
    const pos = V(lerp(0.55, 0.3, a), lerp(1.2, 1.1, a), lerp(1.25, 0.95, a)).lerp(V(0.0, 1.95, 1.45), b);
    const look = V(lerp(0.18, 0.2, a), 0.98, 0).lerp(V(0, 0.93, 0.22), b);
    pos.add(shake(lt, 0.002 + hit * 0.03, 22, 4));
    setCam(camera, pos, look, 0.02 * Math.sin(lt * 0.7) + hit * 0.02);
  }
  return { scene, camera, update, exposure: 0.85, bloom: 0.35, bloomThreshold: 0.92, envIntensity: 0.3 };
}
