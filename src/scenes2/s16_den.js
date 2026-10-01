import * as THREE from 'three';
import { idle, blinkAt } from '../lib/human.js';
import { TYPE, STAND, CROSS, mix } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { monitor, matrixDraw, denSet, creditCard, twitchLogo, moneyBag, moneyRain, keyboard, COL } from '../lib/stream.js';
import { sign, point, particles } from '../lib/env.js';
import { desk, box } from '../lib/props.js';
import { text3d } from '../lib/text3d.js';
import { M, V, setCam, inv, smooth, easeInOut, easeOutBack, easeOutElastic, easeOutCubic, shake, lerp, rng, glowTex, sprite, clamp, path } from '../lib/util.js';

const deskAndScreens = (scene, S, z = -2.45) => {
  const dk = desk(2.6, 0.9, 0.76, '#1c1c24'); dk.position.set(0, 0, z); scene.add(dk);
  const mons = [-0.85, 0, 0.85].map((x, i) => { const m = monitor(0.78, matrixDraw(i + 1)); m.position.set(x, 0.79 + m.userData.bottom, z - 0.2); m.rotation.y = -x * 0.18; scene.add(m); return m; });
  const kb = keyboard('#2dff6a'); kb.position.set(0, 0.79, z + 0.3); scene.add(kb);
  return { dk, mons };
};

// 47.80–51.65  «а все донаты поступали именно с этих ворованных карт.»
export function buildCards() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05070a');
  const S = denSet(scene); const { mons } = deskAndScreens(scene, S);
  const h1 = mk.hacker(); h1.root.position.set(0, 0, -1.55); h1.root.rotation.y = Math.PI; scene.add(h1.root);
  const chair = new THREE.Group(); box(0.5, 0.09, 0.5, M.col('#1a1a20', 0.6), 0, 0.46, 0, chair); box(0.5, 0.8, 0.1, M.col('#1a1a20', 0.6), 0, 0.9, 0.24, chair); chair.position.set(0, 0, -1.55); chair.traverse((m) => { if (m.isMesh) m.castShadow = true; }); scene.add(chair);
  const h2 = mk.hacker('#c9c0b8'); h2.root.position.set(1.15, 0, -1.2); h2.root.rotation.y = Math.PI + 0.6; scene.add(h2.root);
  const logo = twitchLogo(0.8, 0.5); logo.position.set(0.1, 2.55, -2.7); scene.add(logo);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 10, 40), M.emis('#2dff6a', 1.6)); ring.position.set(0.0, 1.65, -2.1); scene.add(ring);
  const N = 14; const cards = [];
  for (let i = 0; i < N; i++) { const c = creditCard(['#1b4b9a', '#8a1b2a', '#1b6a3a', '#5a2a8a', '#2a2a2a'][i % 5], '4276 ' + (5500 + i * 131) + ' ' + (1100 + i * 97) + ' 9087', 2.2); scene.add(c); cards.push(c); }
  const stolen = sign('ВОРОВАННЫЕ КАРТЫ', { width: 1.55, color: '#ffffff', bg: '#d4213a', size: 90, pad: 22, border: '#ffffff', emissive: 0.6 }); stolen.position.set(-0.05, 1.05, -1.9); scene.add(stolen);
  const pulse = sprite(glowTex('rgba(255,255,255,1)'), COL.purple, 1.6, true, 0); pulse.position.copy(logo.position); scene.add(pulse);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const ST = 2.55;
  function update(lt) {
    S.update(lt); mons.forEach((m) => m.userData.live.update(lt));
    h1.pose({ ...TYPE, lSh: [-30, 0, 8], rSh: [-30, 0, -8], lEl: [-85, 0, 0], rEl: [-85, 0, 0], head: [14, Math.sin(lt * 2) * 5, 0] }); idle(h1, lt, 3, 0.3); h1.face({ blink: blinkAt(lt, 2), brows: 0.1, mouth: 0 });
    h2.pose({ ...CROSS, head: [4, 8 * Math.sin(lt), 0] }); idle(h2, lt, 6, 0.3); h2.face({ blink: blinkAt(lt, 5), smile: 0.4 });
    cards.forEach((c, i) => {
      const k = ((lt * 0.75 + i / N) % 1);
      const p = path([[-0.5 + (i % 3) * 0.25, 0.9, -2.05], [-0.4, 1.35, -2.0], [0.0, 1.65, -2.1], [0.1, 2.2, -2.5], [0.1, 2.5, -2.68]], k);
      c.position.copy(p); c.rotation.set(k * 6 + i, k * 9, Math.sin(k * 8 + i) * 0.5); c.scale.setScalar(2.2 * (k > 0.88 ? 1 - (k - 0.88) / 0.12 : 1) + 0.001);
    });
    ring.rotation.set(Math.PI / 2, 0, lt * 1.5); ring.scale.setScalar(1 + Math.sin(lt * 6) * 0.04);
    logo.rotation.y = Math.sin(lt * 1.6) * 0.3; const pl = (lt * 0.75 * N) % 1; pulse.material.opacity = 0.5 * (1 - pl) * 0.8;
    const k = easeOutBack(inv(ST, ST + 0.4, lt), 2.2); stolen.scale.setScalar(Math.max(0.001, k)); stolen.visible = lt > ST - 0.02; stolen.rotation.z = -0.1;
    S.lights.g1.intensity = 9 + Math.sin(lt * 9) * 2;
    const c = easeInOut(inv(0, 3.85, lt));
    const pos = V(lerp(-1.1, 1.0, c), lerp(1.5, 1.8, c), lerp(0.4, -0.15, c)).add(shake(lt, 0.006, 6, 3));
    setCam(camera, pos, V(0.05, lerp(1.4, 1.9, c), -2.3), 0.05 * Math.sin(lt * 0.9));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.88, envIntensity: 0.1 };
}

// 56.45–58.95  «а остальное переводил хакерам, которые изначально…»
export function buildTransfer() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05070a');
  const S = denSet(scene);
  const h1 = mk.hacker(), h2 = mk.hacker('#c9c0b8');
  h1.root.position.set(-0.5, 0, -1.4); h1.root.rotation.y = 0.2; h2.root.position.set(0.55, 0, -1.5); h2.root.rotation.y = -0.2; scene.add(h1.root, h2.root);
  const bag = moneyBag(0.34, '$'); scene.add(bag);
  const trail = particles({ n: 50, seed: 8, color: '#7dff9a', size: [0.03, 0.08], life: [0.5, 1.0], origin: [0, 0, 0], spread: [0.1, 0.1, 0.1], vel: [0, 0, 0], velSpread: [0.1, 0.1, 0.1], opacity: 0.9 }); scene.add(trail);
  const rain = moneyRain({ n: 70, seed: 5, area: [1.6, 1.2], top: 3.0, floor: 0.4, life: [1.0, 1.7], center: [0, 0, -1.0], coins: 0.4 }); scene.add(rain);
  const hk = sign('ХАКЕРЫ', { width: 1.2, color: '#7dff9a', bg: '#06180d', size: 110, pad: 22, border: '#2dff6a', emissive: 0.7 }); hk.position.set(0, 2.35, -2.0); scene.add(hk);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const ARR = 1.25;
  function update(lt) {
    S.update(lt);
    const up = smooth(inv(ARR - 0.2, ARR + 0.3, lt));
    h1.pose({ ...STAND, lSh: [-150 * up, 0, 10], rSh: [-150 * up, 0, -10], lEl: [-20 * up, 0, 0], rEl: [-20 * up, 0, 0], head: [-6 * up, 0, 0], lCurl: 0.2, rCurl: 0.2 }); idle(h1, lt, 2, 0.3); h1.face({ blink: blinkAt(lt, 3), smile: 0.8 * up });
    h2.pose({ ...STAND, lSh: [-35 * up, 0, 20 + 25 * up], rSh: [-150 * up, 0, -10], rEl: [-20 * up, 0, 0], lEl: [-70 * up, 0, 0], rCurl: 0.2 }); idle(h2, lt, 8, 0.3); h2.face({ blink: blinkAt(lt, 6), smile: 0.8 * up });
    // the bag flies in a high arc from the left edge into the hackers' hands
    const k = clamp(inv(0.1, ARR, lt)); const bagPos = V(lerp(-2.6, 0.0, k), lerp(2.9, 1.7, k) + Math.sin(k * Math.PI) * 1.1, lerp(1.2, -1.0, k));
    const landed = lt > ARR; const bb = landed ? Math.exp(-(lt - ARR) * 5) * Math.sin((lt - ARR) * 22) * 0.08 : 0;
    bag.position.copy(bagPos).add(V(0, bb, 0)); bag.rotation.set(k * 6, k * 3, 0); if (landed) bag.rotation.set(0, 0, 0); bag.position.y = landed ? 1.55 + bb : bag.position.y;
    bag.scale.setScalar(landed ? 1 + Math.exp(-(lt - ARR) * 6) * 0.25 : 1);
    trail.visible = !landed && k > 0; trail.position.copy(bagPos); trail.userData.update(lt);
    rain.visible = lt > ARR; rain.userData.update(Math.max(0, lt - ARR));
    const kk = easeOutBack(inv(0.4, 0.8, lt), 2.2); hk.scale.setScalar(Math.max(0.001, kk));
    S.lights.g1.intensity = 9 + 10 * Math.max(0, 1 - (lt - ARR) * 2) * (landed ? 1 : 0);
    const c = easeInOut(inv(0, 2.5, lt));
    const pos = V(lerp(-0.4, 0.2, c), lerp(1.2, 1.5, c), lerp(1.7, 0.9, c)).add(shake(lt, 0.008 + (landed ? 0.012 * Math.exp(-(lt - ARR) * 4) : 0), 12, 4));
    setCam(camera, pos, V(0, 1.45, -1.4), 0.05 * (1 - c));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.88, envIntensity: 0.1 };
}

// 58.95–61.60  «и предложили ему эту схему заработка.»
export function buildOffer() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05070a');
  const S = denSet(scene);
  const hk = mk.hacker(); hk.root.position.set(0, 0, -0.62); hk.root.rotation.y = 0.0; scene.add(hk.root);
  const q = mk.quantum(); q.root.position.set(0, 0, 0.42); q.root.rotation.y = Math.PI; scene.add(q.root);
  const paper = sign('СХЕМА', { width: 0.5, color: '#16365a', bg: '#dce9f8', size: 90, pad: 18, border: '#16365a', lines: ['СХЕМА', 'донаты → $$$'] });
  paper.position.set(0, 1.3, -0.2); scene.add(paper);
  const dollars = [-1, 0, 1].map((i) => { const d = text3d('$', { family: 'mont', size: 0.22, depth: 0.04, bevel: 0.006, color: '#2ecc71', side: '#0b6a30', emissive: '#2ecc71', emissiveIntensity: 0.7 }); scene.add(d); return d; });
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.05, 60);
  const OFFER = 0.15;
  function update(lt) {
    S.update(lt);
    const out = smooth(inv(OFFER, OFFER + 0.5, lt));
    hk.pose({ ...STAND, lSh: [-35, 0, 15], lEl: [-70, 0, 0], rSh: [-80 * out, 0, -12], rEl: [-30 * out, 0, 0], spine: [6, 0, 0], head: [4, 0, 0] }); idle(hk, lt, 2, 0.3); hk.face({ blink: blinkAt(lt, 3) });
    q.pose({ ...STAND, lSh: [-25, 0, 20], lEl: [-70, 0, 0], rSh: [-30, 0, -20], rEl: [-60, 0, 0], spine: [-4, 0, 0], head: [-6, 0, 0] }); idle(q, lt, 5, 0.4);
    q.face({ blink: blinkAt(lt, 1), brows: 0.7, smile: 0.4 + 0.5 * smooth(inv(1.2, 1.8, lt)), mouth: 0.1, look: [0, 0] });
    hk.root.updateMatrixWorld(true);
    const hp = new THREE.Vector3(); hk.J.rHand.group.getWorldPosition(hp);
    paper.position.copy(hp).add(V(-0.03, 0.12, 0.2)); paper.rotation.set(0, -Math.PI / 2, Math.sin(lt * 3) * 0.04);
    dollars.forEach((d, i) => { const k = easeOutBack(inv(1.0 + i * 0.2, 1.4 + i * 0.2, lt), 2.4); d.scale.setScalar(Math.max(0.001, k)); d.position.set((i - 1) * 0.28, 1.95 + Math.sin(lt * 3 + i) * 0.04, -0.15); d.rotation.y = lt * 2 + i; });
    S.lights.g1.position.set(0, 1.8, -0.4);
    const c = easeInOut(inv(0, 2.65, lt));
    const pos = V(lerp(-3.9, -3.0, c), lerp(1.45, 1.55, c), lerp(-0.6, -0.1, c)).add(shake(lt, 0.005, 6, 6));
    setCam(camera, pos, V(0, 1.4, lerp(-0.1, -0.1, c)), 0.04 * Math.sin(lt * 1.3));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.45, bloomThreshold: 0.88, envIntensity: 0.1 };
}
