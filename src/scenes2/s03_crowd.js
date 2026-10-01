import * as THREE from 'three';
import { monitor, livePlane, twitchDraw, moneyRain, coin, COL } from '../lib/stream.js';
import { miniPerson, cheer } from '../lib/cast.js';
import { sign, point, particles } from '../lib/env.js';
import { box } from '../lib/props.js';
import { TEX, M, V, setCam, path, inv, smooth, easeInOut, easeOutBack, easeOutCubic, shake, glowTex, rng, lerp, clamp } from '../lib/util.js';

// 5.15–9.60  «Спидранеры собирали десятки тысяч зрителей и неплохо зарабатывали на донатах,»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0810');
  scene.fog = new THREE.Fog('#0a0810', 12, 40);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.std({ map: TEX.carpet([20, 20], '#1a1626'), roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // giant LED wall with the stream
  const wall = monitor(7.2, twitchDraw({ viewers: 31200, grow: 260, seed: 4, title: 'ВСЕ РЕКОРДЫ ЗА ОДИН СТРИМ' }), { emissive: 1.0 });
  wall.position.set(0, 2.9, -6.2); scene.add(wall);
  // stage + runner at a desk in front of the screen
  box(7, 0.3, 2.4, M.col('#241d38', 0.6), 0, 0.15, -5.2, scene).receiveShadow = true;
  const ctr = livePlane(3.2, 0.9, (g, w, h, t) => {
    g.fillStyle = '#0e0e10'; g.fillRect(0, 0, w, h); g.fillStyle = COL.purple; g.fillRect(0, 0, w * 0.04, h);
    g.fillStyle = '#fff'; g.font = `${h * 0.5}px Russo`; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText(String(Math.round(10400 + t * 2600 + Math.sin(t * 3) * 120)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '+', w * 0.07, h * 0.42);
    g.fillStyle = '#adadb8'; g.font = `${h * 0.22}px Russo`; g.fillText('ЗРИТЕЛЕЙ ОНЛАЙН', w * 0.07, h * 0.82);
  }, { px: 768, emissive: 1 });
  ctr.position.set(0, 5.9, -6.0); scene.add(ctr);
  // audience: 6 rows on risers, facing the screen
  const crowd = []; const r = rng(8);
  for (let row = 0; row < 6; row++) {
    const z = 0.6 + row * 1.0 - 0; const y0 = row * 0.28;
    box(9.5, y0 + 0.1, 0.9, M.col('#1c1830', 0.8), 0, (y0 + 0.1) / 2 - 0.02, z, scene).receiveShadow = true;
    for (let i = 0; i < 11; i++) { const p = miniPerson(row * 20 + i); p.position.set(-4.5 + i * 0.9 + (r() - 0.5) * 0.15, y0 + 0.08, z); p.rotation.y = Math.PI + (r() - 0.5) * 0.3; p.userData.y0 = y0 + 0.08; scene.add(p); crowd.push(p); }
  }
  // lights: warm key + coloured sweeps
  scene.add(new THREE.HemisphereLight('#6a5aa8', '#140f20', 0.8));
  const key = new THREE.SpotLight('#ffd9a8', 60, 22, 0.7, 0.6, 1.2); key.position.set(0, 7, 3); key.target.position.set(0, 1, -4); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const pp = point(scene, COL.purple, 40, 18, [-5, 4, -4]); const pc = point(scene, COL.cyan, 30, 18, [5, 4, -4]); void pp; void pc;
  const warm = point(scene, '#ffb870', 20, 14, [0, 3, 2]); void warm;
  // volumetric cones
  const cones = [];
  for (const [x, col] of [[-4.5, COL.purple], [4.5, COL.cyan], [-1.5, '#ff4fa3'], [1.5, COL.gold]]) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(1.1, 9, 24, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); c.geometry.translate(0, -4.5, 0); c.position.set(x, 7.5, -3); scene.add(c); cones.push(c);
  }
  // donation alerts + money burst from the screen
  const alerts = [];
  [['ДОНАТ  +$50', -1.7, 3.2], ['ДОНАТ  +$200', 1.5, 2.4], ['ДОНАТ  +$1 000', -0.2, 1.7]].forEach(([tx, x, y], i) => {
    const a = sign(tx, { width: 2.0, color: '#ffffff', bg: COL.purple, size: 90, pad: 24, border: '#ffffff', emissive: 0.6 }); a.position.set(x, y, -2.2 + i * 0.4); a.rotation.y = (i - 1) * 0.15; scene.add(a); alerts.push(a);
  });
  const rain = moneyRain({ n: 70, seed: 6, area: [7, 4], top: 7, floor: 0.5, life: [1.4, 2.4], center: [0, 0, -1.5], coins: 0.45 }); scene.add(rain);
  const camera = new THREE.PerspectiveCamera(58, 1080 / 1920, 0.1, 120);
  const DON = 3.7;
  function update(lt) {
    wall.userData.live.update(lt + 6); ctr.userData.live.update(lt);
    crowd.forEach((p, i) => cheer(p, lt + 2, 0.35 + 0.65 * smooth(inv(DON - 0.3, DON + 0.2, lt))));
    cones.forEach((c, i) => { c.rotation.z = Math.sin(lt * 1.3 + i * 1.7) * 0.5; c.rotation.x = Math.cos(lt * 1.1 + i) * 0.25; });
    alerts.forEach((a, i) => { const k = easeOutBack(inv(DON + i * 0.18, DON + i * 0.18 + 0.4, lt), 2.2); a.scale.setScalar(Math.max(0.001, k)); a.visible = lt > DON + i * 0.18 - 0.02; });
    rain.visible = lt > DON - 0.2; rain.userData.update(Math.max(0, lt - DON + 0.2));
    // camera: low over the audience heads flying toward the screen, then lifting
    const c = easeInOut(inv(0, 4.45, lt));
    const pos = path([[-3.2, 3.0, 7.5], [-1.4, 2.4, 4.2], [0.8, 2.7, 1.2], [1.0, 3.2, -0.4]], c).add(shake(lt, 0.01, 4, 3));
    setCam(camera, pos, V(0, 3.3 - 0.4 * c, -6), 0.06 * Math.sin(lt * 0.7) - 0.05 * (1 - c));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.9, envIntensity: 0.12 };
}
