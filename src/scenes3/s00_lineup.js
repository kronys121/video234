import * as THREE from 'three';
import { mk3, club, axe } from '../lib/cast3.js';
import { idle2 } from '../lib/human2.js';
import { M, V, setCam } from '../lib/util.js';
export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#2a2f38');
  const f = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), M.col('#4a4f58', 0.9)); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; scene.add(f);
  scene.add(new THREE.HemisphereLight('#ffffff', '#404040', 1.2));
  const d = new THREE.DirectionalLight('#fff4e6', 2.5); d.position.set(3, 6, 5); d.castShadow = true; d.shadow.mapSize.set(2048, 2048); Object.assign(d.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); scene.add(d);
  const cs = [mk3.hero(), mk3.merchant(), mk3.dev(), mk3.dev2(), mk3.boss()];
  cs.forEach((h, i) => { h.root.position.set(-1.6 + i * 0.8, 0, 0.6); h.root.rotation.y = (i - 2) * 0.35; scene.add(h.root); });
  axe(cs[0]);
  const g = mk3.giant(); g.root.position.set(0, 0, -1.6); scene.add(g.root); club(g);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 80);
  function update(lt) {
    const P = [
      { lSh: [-150, 0, 20], rSh: [-150, 0, -20], lEl: [-20, 0, 0], rEl: [-20, 0, 0], lCurl: 0.1, rCurl: 0.1 },
      { lSh: [-30, 0, 20], rSh: [-30, 0, -20], lEl: [-110, -40, 0], rEl: [-110, 40, 0] },
      { hipsY: -0.4, lHip: [-88, 0, 4], rHip: [-88, 0, -4], lKnee: [88, 0, 0], rKnee: [88, 0, 0], lSh: [-30, 0, 8], rSh: [-30, 0, -8], lEl: [-80, 0, 0], rEl: [-80, 0, 0] },
      { lHip: [-30, 0, 0], rHip: [20, 0, 0], lKnee: [10, 0, 0], rKnee: [45, 0, 0], lSh: [25, 0, 8], rSh: [-25, 0, -8], lEl: [-20, 0, 0], rEl: [-30, 0, 0], spine: [5, 15, 0] },
      { rSh: [-85, 0, -10], rEl: [-5, 0, 0], rCurl: 0.8, lSh: [-10, 0, 40], lEl: [-90, 30, 0], head: [0, 20, 0] },
    ];
    cs.forEach((h, i) => { h.pose(P[i]); idle2(h, lt, i, 0.5); h.face({ blink: 0, smile: 0.5, brows: 0.2, mouth: i === 0 ? 0.6 : 0 }); });
    g.pose({ rSh: [-30, 0, -15], rEl: [-50, 0, 0], lSh: [0, 0, 12], head: [10, 0, 0] }); g.face({ brows: -0.6, browTilt: 1, mouth: 0.3 });
    setCam(camera, V(0.6 * Math.sin(lt * 0.5), 2.0, 4.8), V(0, 1.7, 0), 0);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.2, bloomThreshold: 0.95, envIntensity: 0.4 };
}
