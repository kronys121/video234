import * as THREE from 'three';
import { human } from '../lib/human.js';
import { HOLD } from '../lib/poses.js';
import { gameboy } from '../lib/gameboy.js';
import { skyDome, smoke, embers, ground, point } from '../lib/env.js';
import { box } from '../lib/props.js';
import { TEX, M, V, setCam, inv, smooth, easeOutCubic, easeInOut, rng, lerp, clamp, noise1, shake, glowTex } from '../lib/util.js';

// 14.15–17.72  «расплавленный, покорёженный, почерневший от копоти корпус»
export function build() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#3a2e26', 2, 22);
  scene.add(skyDome([[0, '#6a5a4c'], [0.5, '#8a7056'], [1, '#2a211b']], 60));
  scene.add(new THREE.HemisphereLight('#e8d2b0', '#3a2a1e', 0.55));
  const key = new THREE.DirectionalLight('#ffd6a0', 2.6); key.position.set(-3, 4, 3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2 }); scene.add(key);
  const rim = point(scene, '#ff7a30', 6, 3, [0.4, 1.3, 1.1]);
  scene.add(ground(80, M.std({ map: TEX.soot([10, 10]), roughness: 1 })));
  const r = rng(5);
  for (let i = 0; i < 14; i++) { const b = box(0.2, 0.15, 2 + r() * 2, M.std({ map: TEX.soot([1, 2]), roughness: 0.9 }), (r() - 0.5) * 8, 0.2 + r() * 1.5, 3 + r() * 8); b.rotation.set(r() * 0.6, r() * 3, r() * 0.8); b.castShadow = true; scene.add(b); }
  const sm = smoke({ n: 16, seed: 3, origin: [0, 0.8, 4], spread: [6, 1, 4], vel: [0.2, 0.4, 0], size: [1.5, 3], life: [4, 6], grow: 2, color: '#6a5a4c', opacity: 0.35 });
  scene.add(sm);
  const emb = embers({ n: 50, seed: 12, origin: [0, 0.8, 1.2], spread: [2, 0.6, 1.5], vel: [0.05, 0.35, 0], velSpread: [0.15, 0.15, 0.15], life: [1.5, 3], size: [0.012, 0.03], turb: 0.08 });
  scene.add(emb);
  // bokeh
  for (let i = 0; i < 12; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,170,90,1)'), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(0.3 + r() * 0.5); s.position.set((r() - 0.5) * 4, 0.8 + r() * 1.6, 3 + r() * 3); scene.add(s); }

  // POV body (head hidden, camera at the eyes)
  const me = human({ skin: '#d7a47e', top: 'uniform', pants: 'dcu', gloves: '#8e7a56', helmet: true });
  me.J.head.visible = false; scene.add(me.root);
  const gb = gameboy({ burnt: 1 }); scene.add(gb.group);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.01, 100);
  const eye = new THREE.Vector3(), l = new THREE.Vector3(), rr = new THREE.Vector3();
  const HITS = [0.13, 0.71, 1.53, 2.82];
  // console orientations per beat: [x, y, z]
  const ROTS = [[0.15, Math.PI - 0.1, 0.05], [0.25, Math.PI + 0.9, -0.2], [0.1, 0.35, 0.35], [-0.2, Math.PI + 0.25, 0.1], [0.05, Math.PI - 0.15, 0.0]];

  function update(lt) {
    me.pose({ ...HOLD, lSh: [-52, 0, 20], rSh: [-52, 0, -20], lEl: [-62, -25, 0], rEl: [-62, 25, 0], lCurl: 0.6, rCurl: 0.6, lThumb: 0.8, rThumb: 0.8, head: [0, 0, 0], neck: [0, 0, 0], spine: [8, 0, 0] });
    me.J.chest.rotation.y += noise1(lt * 0.8, 2) * 0.03;
    me.root.updateMatrixWorld(true);
    me.J.lHand.group.getWorldPosition(l); me.J.rHand.group.getWorldPosition(rr);
    const mid = l.clone().add(rr).multiplyScalar(0.5);
    gb.group.position.copy(mid).add(V(0, 0.02, 0.03));
    // step between orientations on each beat with a snap
    let idx = 0; for (let i = 0; i < HITS.length; i++) if (lt >= HITS[i]) idx = i + 1;
    const from = ROTS[Math.max(0, idx - 1)], to = ROTS[idx];
    const k = idx === 0 ? 1 : easeOutCubic(inv(HITS[idx - 1], HITS[idx - 1] + 0.3, lt));
    gb.group.rotation.set(lerp(from[0], to[0], k), lerp(from[1], to[1], k), lerp(from[2], to[2], k));
    gb.group.rotation.y += Math.sin(lt * 1.3) * 0.05;

    me.J.head.getWorldPosition(eye); eye.add(V(0, 0.08, 0.1));
    // punch-in on every adjective
    let kick = 0; HITS.slice(0, 3).forEach((h) => { const a = lt - h; if (a >= 0) kick = Math.max(kick, Math.exp(-a * 5) * Math.min(1, a * 20)); });
    const push = smooth(inv(2.2, 3.5, lt));
    const pos = eye.clone().lerp(gb.group.position, 0.18 + kick * 0.22 + push * 0.12);
    pos.add(shake(lt, 0.004 + kick * 0.01, 6, 2));
    setCam(camera, pos, gb.group.position.clone().add(V(0, 0.005, 0)), noise1(lt, 3) * 0.04 + kick * 0.06);
    camera.fov = 50 - kick * 10; camera.updateProjectionMatrix();
    sm.userData.update(lt + 4); emb.userData.update(lt);
    rim.intensity = 6 + Math.sin(lt * 11) * 1.5;
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.9, envIntensity: 0.35 };
}
