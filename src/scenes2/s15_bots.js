import * as THREE from 'three';
import { monitor, twitchDraw, livePlane, COL } from '../lib/stream.js';
import { miniPerson, robot, cheer } from '../lib/cast.js';
import { sign, point } from '../lib/env.js';
import { box } from '../lib/props.js';
import { TEX, M, V, setCam, inv, smooth, easeInOut, easeOutBack, shake, rng, lerp, glowTex } from '../lib/util.js';

// 44.65–47.80  «практически весь онлайн на стриме был накручен ботами,»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#080a12');
  scene.fog = new THREE.Fog('#080a12', 10, 36);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.std({ map: TEX.carpet([20, 20], '#141a28'), roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = monitor(7.0, twitchDraw({ viewers: 12480, grow: 400, seed: 21, title: 'ОНЛАЙН' }), { emissive: 1.0 }); wall.position.set(0, 2.9, -6.2); scene.add(wall);
  const ctr = livePlane(3.4, 0.9, (g, w, h, t) => {
    g.fillStyle = '#0e0e10'; g.fillRect(0, 0, w, h); g.fillStyle = COL.red; g.fillRect(0, 0, w * 0.04, h);
    g.fillStyle = '#fff'; g.font = `${h * 0.5}px Russo`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(String(Math.round(12400 + t * 500)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '), w * 0.07, h * 0.42);
    g.fillStyle = '#adadb8'; g.font = `${h * 0.22}px Russo`; g.fillText('ЗРИТЕЛЕЙ ОНЛАЙН', w * 0.07, h * 0.82);
  }, { px: 768 });
  ctr.position.set(0, 5.9, -6.0); scene.add(ctr);
  const rows = 6, cols = 9; const people = [], bots = []; const r = rng(3);
  for (let row = 0; row < rows; row++) {
    const z = 0.2 + row * 1.0, y0 = row * 0.28;
    box(9.4, y0 + 0.1, 0.9, M.col('#1a2030', 0.8), 0, (y0 + 0.1) / 2 - 0.02, z, scene).receiveShadow = true;
    for (let i = 0; i < cols; i++) {
      const x = -4.0 + i * 1.0 + (r() - 0.5) * 0.12;
      const p = miniPerson(row * 20 + i + 3); p.position.set(x, y0 + 0.08, z); p.rotation.y = Math.PI; p.userData.y0 = y0 + 0.08; scene.add(p); people.push({ p, row });
      const b = robot(i % 2 ? COL.cyan : '#ff4fa3', row * 20 + i); b.position.set(x, y0 + 0.08, z); b.rotation.y = Math.PI; b.userData.y0 = y0 + 0.08; b.visible = false; scene.add(b); bots.push({ b, row, tag: (row * 7 + i) % 5 === 0 ? sign('BOT', { width: 0.5, color: '#ffffff', bg: '#d4213a', size: 100, pad: 18, emissive: 0.6 }) : null });
    }
  }
  bots.forEach(({ b, tag }) => { if (tag) { tag.position.set(b.position.x, b.position.y + 1.25, b.position.z); scene.add(tag); tag.visible = false; } });
  // scanner sweep plane
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.5), new THREE.MeshBasicMaterial({ color: COL.red, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); scan.rotation.x = -Math.PI / 2; scene.add(scan);
  scene.add(new THREE.HemisphereLight('#6a7ab8', '#10142a', 0.9));
  const key = new THREE.SpotLight('#dfe8ff', 60, 24, 0.7, 0.6, 1.2); key.position.set(0, 7, 3); key.target.position.set(0, 1, -2); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0005; scene.add(key, key.target);
  point(scene, COL.cyan, 40, 16, [-5, 3, -3]); point(scene, '#ff4fa3', 30, 16, [5, 3, -3]);
  const flash = point(scene, '#ff5a6a', 0, 14, [0, 3, 2]);
  const camera = new THREE.PerspectiveCamera(58, 1080 / 1920, 0.1, 120);
  const S0 = 1.7, S1 = 2.7;
  function update(lt) {
    wall.userData.live.update(lt + 44); ctr.userData.live.update(lt);
    const s = inv(S0, S1, lt);
    // the scan front travels from the stage backwards over the rows (z grows toward the camera)
    const front = lerp(-1.0, 6.2, s);
    scan.position.set(0, 0.14 + Math.max(0, front - 0.2) * 0.28, front); scan.visible = s > 0 && s < 1;
    people.forEach(({ p, row }) => { const z = 0.2 + row * 1.0; p.visible = !(s > 0 && z <= front + 0.01); cheer(p, lt, 0.5); });
    bots.forEach(({ b, row, tag }) => { const z = 0.2 + row * 1.0; const on = s > 0 && z <= front + 0.01; b.visible = on; cheer(b, lt * 1.4, 0.25); if (tag) { tag.visible = on && front - z > 0.2; const k = easeOutBack(inv(0, 0.4, front - z - 0.2), 2.4); tag.scale.setScalar(Math.max(0.001, k)); } });
    flash.intensity = s > 0 && s < 1 ? 12 : 0;
    // camera: starts at the back of the hall, sweeping over the rows toward the stage with the scanner
    const c = easeInOut(inv(0, 3.15, lt));
    const pos = V(lerp(-3.4, 2.4, c), lerp(2.6, 3.4, c), lerp(7.6, 3.2, c)).add(shake(lt, 0.008, 5, 4));
    setCam(camera, pos, V(lerp(-0.5, 0, c), 1.6, -1.5 + 2 * c), 0.07 * (1 - c) - 0.03);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.88, envIntensity: 0.12 };
}
