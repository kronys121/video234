import * as THREE from 'three';
import { idle, blinkAt, talk } from '../lib/human.js';
import { TYPE } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { streamRoom, COL } from '../lib/stream.js';
import { text3d } from '../lib/text3d.js';
import { particles } from '../lib/env.js';
import { V, setCam, inv, smooth, easeInOut, easeOutBack, shake, lerp, clamp } from '../lib/util.js';

// 9.60–13.00  «но особенно выделялся один стример по имени Квантум.»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07060b');
  const S = streamRoom(scene, { faceCam: true });
  const q = mk.quantum(); q.root.position.set(0, 0, S.seatZ); scene.add(q.root);
  // spotlight pool on him, rest of the room dimmed
  S.lights.warm.intensity = 1.2; S.lights.pl.intensity = 1.5; S.lights.cy.intensity = 1.5; S.lights.key.intensity = 2;
  const spot = new THREE.SpotLight('#fff1dc', 22, 9, 0.3, 0.5, 1.4); spot.position.set(0.3, 3.0, S.seatZ + 1.6); spot.target.position.set(0, 1.0, S.seatZ); spot.castShadow = true; spot.shadow.mapSize.set(1536, 1536); spot.shadow.bias = -0.0005; scene.add(spot, spot.target);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 3.2, 28, 1, true), new THREE.MeshBasicMaterial({ color: '#fff1dc', transparent: true, opacity: 0.04, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  cone.geometry.translate(0, -1.6, 0); cone.position.set(0, 3.0, S.seatZ + 0.1); scene.add(cone);
  const name = text3d('КВАНТУМ', { family: 'mont', size: 0.34, depth: 0.09, bevel: 0.012, color: '#ffffff', side: COL.purple, emissive: COL.purple, emissiveIntensity: 0.6 });
  name.position.set(0, 2.25, S.backZ + 0.3); scene.add(name);
  const fx = particles({ n: 50, seed: 11, color: '#d8c0ff', size: [0.015, 0.04], life: [1.2, 2.4], origin: [0, 1.0, S.seatZ], spread: [1.4, 1.0, 1.0], vel: [0, 0.1, 0], velSpread: [0.1, 0.1, 0.1], opacity: 0.8, turb: 0.15 }); scene.add(fx);
  const camera = new THREE.PerspectiveCamera(46, 1080 / 1920, 0.05, 60);
  const NM = 2.5;
  function update(lt) {
    S.update(lt + 9.6);
    const look = smooth(inv(0.3, 0.8, lt));
    q.pose({ ...TYPE, head: [6, 0, 0] });
    idle(q, lt, 5, 0.4);
    q.face({ blink: blinkAt(lt, 2), mouth: talk(lt, 2, 0.8), brows: 0.35, smile: 0.5, look: [0, 0] });
    const k = easeOutBack(inv(NM, NM + 0.5, lt), 2.2);
    name.scale.setScalar(Math.max(0.001, k)); name.rotation.set(0, (1 - clamp(k)) * 1.2, 0); name.visible = lt > NM - 0.02;
    fx.userData.update(lt);
    cone.material.opacity = 0.05 + 0.03 * Math.sin(lt * 3);
    // orbit from the left side of the desk to the front, closing in
    const c = easeInOut(inv(0, 3.4, lt));
    const ang = lerp(-1.0, 0.25, c);
    const rad = lerp(3.0, 1.9, c);
    const pos = V(Math.sin(ang) * rad, lerp(1.9, 1.45, c), S.seatZ + 0.2 + Math.cos(ang) * rad).add(shake(lt, 0.006, 5, 6));
    setCam(camera, pos, V(0, 1.12, S.seatZ), 0.07 * (1 - c));
    void look;
  }
  return { scene, camera, update, exposure: 0.85, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.1 };
}
