import * as THREE from 'three';
import { idle, blinkAt, talk } from '../lib/human.js';
import { TYPE } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { streamRoom, twitchLogo, COL } from '../lib/stream.js';
import { text3d } from '../lib/text3d.js';
import { particles } from '../lib/env.js';
import { V, setCam, inv, smooth, easeInOut, easeOutBack, easeOutElastic, glowTex, shake, clamp } from '../lib/util.js';

// 3.00–5.15  «…направлений на Twitch были спидраны.»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0912');
  const S = streamRoom(scene, { faceCam: false });
  const q = mk.quantum(); q.root.position.set(0, 0, S.seatZ); q.root.rotation.y = Math.PI; scene.add(q.root);
  const logo = twitchLogo(0.55, 0.3); logo.position.set(0, 1.95, S.backZ + 0.5); scene.add(logo);
  const run = text3d('SPEEDRUN', { family: 'mont', size: 0.17, depth: 0.05, bevel: 0.008, color: '#ffffff', side: COL.purple, emissive: COL.cyan, emissiveIntensity: 0.4 });
  run.position.set(0, 1.58, S.backZ + 0.35); scene.add(run);
  const sparks = particles({ n: 40, seed: 3, color: '#b98cff', size: [0.02, 0.05], life: [0.8, 1.6], origin: [0, 1.95, S.backZ + 0.55], spread: [0.5, 0.5, 0.2], vel: [0, 0.2, 0.3], velSpread: [0.6, 0.5, 0.3], opacity: 0.9 });
  scene.add(sparks);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 80);
  const L = 0.89, SP = 1.35;
  function update(lt) {
    S.update(lt + 3);
    q.pose({ ...TYPE, head: [6, Math.sin(lt * 1.3) * 6, 0] }); idle(q, lt + 4, 2, 0.5);
    q.face({ blink: blinkAt(lt, 5), mouth: talk(lt, 4, 0.5), brows: 0.3, smile: 0.5 });
    const k = easeOutElastic(inv(L, L + 0.6, lt));
    logo.scale.setScalar(Math.max(0.001, k) * 0.55); logo.rotation.set(0, (1 - clamp(k)) * 2.5 + Math.sin(lt * 1.5) * 0.15, 0); logo.visible = lt > L - 0.02;
    const r = easeOutBack(inv(SP, SP + 0.4, lt), 2.0); run.scale.setScalar(Math.max(0.001, r)); run.visible = lt > SP - 0.02;
    sparks.visible = lt > L; sparks.userData.update(Math.max(0, lt - L));
    // dolly from the left monitor to the right one
    const c = easeInOut(inv(0, 2.15, lt));
    const pos = V(-0.95 + 1.9 * c, 1.4 + 0.05 * c, -0.75).add(shake(lt, 0.004, 6, 2));
    const look = V(-0.4 + 0.8 * c, 1.5, S.deskZ - 0.15);
    setCam(camera, pos, look, 0.05 - 0.1 * c);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.92, envIntensity: 0.15 };
}
