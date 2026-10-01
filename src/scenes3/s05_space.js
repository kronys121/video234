import * as THREE from 'three';
import { mk3, axe } from '../lib/cast3.js';
import { earthTex } from '../scenes/s08_flight.js';
import { beetle, walkBug } from '../lib/fantasy.js';
import { cloudTex, sign, particles, point } from '../lib/env.js';
import { text3d } from '../lib/text3d.js';
import { V, M, setCam, kf, inv, smooth, easeOutBack, easeInOut, shake, lerp, clamp, rng, canvasTex, glowTex, noise1 } from '../lib/util.js';

const tumble = (H, t) => { H.pose({ lSh: [-150 + Math.sin(t * 5) * 20, 0, 40], rSh: [-130 + Math.cos(t * 4) * 25, 0, -50], lEl: [-30, 0, 0], rEl: [-50, 0, 0], lHip: [-50 + Math.sin(t * 6) * 20, 0, 20], rHip: [20, 0, -25], lKnee: [70, 0, 0], rKnee: [30 + Math.sin(t * 7) * 20, 0, 0], head: [-20, 0, 0] }); H.face({ blink: 0, brows: 1, mouth: 0.6 + 0.3 * Math.abs(Math.sin(t * 9)) }); };

// 10.10–14.25  «в буквальном смысле на другую планету, кувыркаясь где-то в стратосфере.»
export function buildFlight() {
  const scene = new THREE.Scene();
  const bg = new THREE.Color('#6aa0e0'); scene.background = bg;
  scene.add(new THREE.HemisphereLight('#dfe9ff', '#3a4a6a', 0.9));
  const sunL = new THREE.DirectionalLight('#fff1dc', 2.6); sunL.position.set(-5, 6, 8); scene.add(sunL);
  const hero = mk3.hero(); scene.add(hero.root); axe(hero);
  // clouds streaming down past the hero
  const cl = []; const r = rng(4);
  for (let i = 0; i < 24; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex(), transparent: true, depthWrite: false, opacity: 0.95 })); const sc = 3 + r() * 6; s.scale.set(sc * 2, sc, 1); s.userData = { x: (r() - 0.5) * 22, z: -4 - r() * 18, y0: r() * 40 }; scene.add(s); cl.push(s); }
  // stars fade in
  const sp = []; for (let i = 0; i < 900; i++) { const v = V(r() - 0.5, r() - 0.2, r() - 0.5).normalize().multiplyScalar(120); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: '#ffffff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0 })); scene.add(stars);
  // our planet falls away below, a ringed planet grows ahead
  const earth = new THREE.Mesh(new THREE.SphereGeometry(60, 64, 48), M.std({ map: earthTex(), roughness: 0.9 })); scene.add(earth);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(61.5, 48, 32), new THREE.MeshBasicMaterial({ color: '#7ab8ff', transparent: true, opacity: 0.25, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })); earth.add(atm);
  const planet = new THREE.Group(); scene.add(planet);
  planet.add(new THREE.Mesh(new THREE.SphereGeometry(4, 48, 32), M.std({ map: canvasTex('pl2', 256, 128, (g, w, h) => { for (let y = 0; y < h; y += 8) { g.fillStyle = `hsl(${20 + (y * 7) % 30},60%,${40 + (y * 13) % 25}%)`; g.fillRect(0, y, w, 8); } }, { repeat: [1, 1] }), roughness: 0.8 })));
  const ringM = new THREE.Mesh(new THREE.RingGeometry(5, 7.5, 64), new THREE.MeshStandardMaterial({ color: '#e8d0a0', transparent: true, opacity: 0.75, side: THREE.DoubleSide, roughness: 0.8 })); ringM.rotation.x = Math.PI / 2 - 0.35; planet.add(ringM);
  const strat = sign('СТРАТОСФЕРА', { width: 2.4, color: '#ffffff', bg: '#1e3a6a', size: 100, pad: 26, border: '#9fd6ff', emissive: 0.5 }); scene.add(strat);
  const alt = sign('↑ 30 КМ', { width: 1.2, color: '#9fd6ff', size: 100, pad: 16, emissive: 0.6 }); scene.add(alt);
  const camera = new THREE.PerspectiveCamera(55, 1080 / 1920, 0.05, 900);
  const SKY = new THREE.Color('#6aa0e0'), SPACE = new THREE.Color('#05060f');
  function update(lt) {
    tumble(hero, lt); hero.root.position.set(Math.sin(lt * 1.3) * 0.3, 0, 0); hero.root.rotation.set(lt * 3.1, lt * 1.7, lt * 2.3);
    const up = smooth(inv(0.3, 3.0, lt));
    bg.copy(SKY).lerp(SPACE, up);
    cl.forEach((s) => { const u = s.userData; s.position.set(u.x, ((u.y0 - lt * 28) % 40 + 40) % 40 - 20, u.z); s.material.opacity = 0.95 * (1 - smooth(inv(1.2, 2.2, lt))); });
    stars.material.opacity = smooth(inv(1.0, 2.5, lt));
    earth.position.set(0, -75 - up * 40, -30); earth.rotation.y = lt * 0.05;
    planet.position.set(6 - up * 4, 8 - up * 4, -40 + up * 18); planet.rotation.y = lt * 0.2;
    const ks = easeOutBack(inv(3.1, 3.5, lt), 2.2); strat.scale.setScalar(Math.max(0.001, ks)); strat.visible = lt > 3.08; strat.position.set(0, 2.2, -1.5); strat.rotation.z = Math.sin(lt * 3) * 0.04;
    const ka = easeOutBack(inv(1.0, 1.4, lt), 2.2); alt.scale.setScalar(Math.max(0.001, ka)); alt.visible = lt > 0.98; alt.position.set(-0.35, -1.5 + Math.sin(lt * 2) * 0.05, -0.6);
    const f = kf(lt, [[0, [1.8, -1.0, 4.2], [0, 0.6, 0], 58, 0.2], [4.15, [-1.6, 0.6, 4.6], [0, 0.9, -2], 56, -0.2]]);
    setCam(camera, f.pos.add(shake(lt, 0.03, 6, 2)), f.look, f.roll + Math.sin(lt * 1.5) * 0.1, f.fov);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25 };
}

// 14.25–17.15  «Это был очевидный баг физики,»
export function buildBug() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05101e');
  scene.fog = new THREE.Fog('#05101e', 8, 40);
  const grid = canvasTex('dbg', 512, 512, (g, w, h) => { g.fillStyle = '#071a30'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1fa0ff'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); } }, { repeat: [12, 12] });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.std({ map: grid, emissive: '#ffffff', emissiveMap: grid, emissiveIntensity: 0.6, roughness: 0.6 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#8ac8ff', '#0a1a2a', 0.9));
  const key = new THREE.DirectionalLight('#dfefff', 1.8); key.position.set(3, 6, 5); scene.add(key);
  const hero = mk3.hero(); scene.add(hero.root); axe(hero);
  // collider wireframe + velocity arrow + error window
  const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.0, 2.0, 0.8)), new THREE.LineBasicMaterial({ color: '#3aff7a' })); scene.add(box);
  const arrow = new THREE.Group(); const am = M.emis('#ff3a4a', 1.6);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 10), am); shaft.position.y = 1.1; arrow.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 14), am); tip.position.y = 2.4; arrow.add(tip); scene.add(arrow);
  const vtxt = sign('v = 99999', { width: 1.3, color: '#ff6a7a', size: 100, pad: 12, emissive: 0.8 }); scene.add(vtxt);
  const win = new THREE.Group(); scene.add(win);
  const panel = sign('БАГ ФИЗИКИ', { width: 2.0, color: '#ffffff', bg: '#c4213a', size: 110, pad: 30, border: '#ffffff', emissive: 0.6 }); win.add(panel);
  const body = sign('error', { width: 2.0, color: '#ffd0d6', bg: '#2a0a12', size: 70, pad: 24, lines: ['velocity overflow', 'ragdoll → orbit'], emissive: 0.5 }); body.position.y = -0.62; win.add(body);
  const bug = beetle({ s: 0.6 }); bug.rotation.y = -Math.PI / 2; win.add(bug);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 100);
  function update(lt) {
    // hero frozen mid-tumble, glitching in place
    tumble(hero, 1.3); hero.face({ blink: 0, brows: 1, mouth: 0.8 });
    const gl = Math.floor(lt * 12) % 5 === 0 ? 1 : 0;
    hero.root.position.set(0.65 + gl * (noise1(lt * 40, 1) * 0.12), 2.1 + gl * noise1(lt * 40, 3) * 0.08, 0); hero.root.rotation.set(0.6, 0.4 + gl * 0.2, 0.9);
    hero.root.updateMatrixWorld(true); box.position.copy(hero.J.hips.getWorldPosition(new THREE.Vector3())); box.rotation.set(0.6, 0.4, 0.9); box.visible = Math.floor(lt * 8) % 4 !== 0;
    arrow.position.set(0.3, 2.2, 0); arrow.rotation.set(0, 0, -0.35 + Math.sin(lt * 9) * 0.03);
    vtxt.position.set(0.7, 4.75, 0);
    const k = easeOutBack(inv(0.15, 0.55, lt), 2.2); win.scale.setScalar(Math.max(0.001, k)); win.visible = lt > 0.13; win.position.set(-0.6, 4.6, -1.4);
    bug.position.set(-0.9 + ((lt * 0.6) % 1.8), 0.33, 0.05); walkBug(bug, lt);
    const f = kf(lt, [[0, [3.6, 2.6, 5.4], [0, 2.9, 0], 52, 0.06], [2.9, [-2.4, 3.2, 5.0], [-0.2, 3.1, -0.5], 50, -0.05]]);
    setCam(camera, f.pos.add(shake(lt, 0.01 + gl * 0.03, 20, 4)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.85, envIntensity: 0.2 };
}
