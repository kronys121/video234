import * as THREE from 'three';
import { idle, blinkAt } from '../lib/human.js';
import { TYPE, mix } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { streamRoom, moneyRain, COL } from '../lib/stream.js';
import { sign, point, particles } from '../lib/env.js';
import { V, setCam, inv, smooth, easeInOut, easeOutBack, shake, rng, lerp, noise1 } from '../lib/util.js';

// 16.05–19.05  «зато донаты приходили просто сумасшедшие»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07060b');
  const S = streamRoom(scene, { faceCam: true });
  const q = mk.quantum(); q.root.position.set(0, 0, S.seatZ); scene.add(q.root);
  S.lights.key.intensity = 8;
  const r = rng(9);
  const texts = ['ДОНАТ  +$500', 'ДОНАТ  +$1 000', 'ДОНАТ  +$250', 'ДОНАТ  +$2 000', 'ДОНАТ  +$100', 'ДОНАТ  +$750', 'ДОНАТ  +$5 000', 'ДОНАТ  +$300'];
  const alerts = texts.map((tx, i) => {
    const a = sign(tx, { width: 0.8, color: '#ffffff', bg: i % 3 === 1 ? '#1e9e57' : COL.purple, size: 90, pad: 22, border: '#ffffff', emissive: 0.7 });
    const side = i % 2 ? 1 : -1; a.position.set(side * (0.5 + r() * 0.35), 0.6 + (i * 0.23) % 1.9, S.seatZ - 0.35 + r() * 0.5); a.rotation.y = -side * 0.35; scene.add(a); a.userData.t0 = 0.1 + i * 0.28; return a;
  });
  const rain = moneyRain({ n: 80, seed: 3, area: [1.6, 1.4], top: 3.0, floor: 0.4, life: [1.0, 1.7], center: [0, 0, S.seatZ + 0.35], coins: 0.4 }); scene.add(rain);
  const strobe = point(scene, COL.green, 0, 6, [0, 1.8, S.seatZ + 1.0]);
  const strobe2 = point(scene, COL.pink, 0, 6, [0.5, 1.5, S.seatZ + 1.0]);
  const burst = particles({ n: 60, seed: 5, color: '#ffe08a', size: [0.02, 0.06], life: [0.6, 1.2], origin: [0, 1.2, S.seatZ + 0.2], spread: [0.4, 0.4, 0.3], vel: [0, 0.8, 0.4], velSpread: [1.2, 0.8, 0.6], opacity: 1 }); scene.add(burst);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.05, 60);
  function update(lt) {
    S.update(lt + 16);
    const up = smooth(inv(0.2, 0.6, lt));
    q.pose(mix({ ...TYPE }, { ...TYPE, lSh: [-155, 0, 15], rSh: [-155, 0, -15], lEl: [-15, 0, 0], rEl: [-15, 0, 0], lCurl: 0.2, rCurl: 0.2, head: [-8, 0, 0], spine: [-6, 0, 0] }, up));
    idle(q, lt, 4, 0.6);
    q.root.position.y = Math.abs(Math.sin(lt * 7)) * 0.03 * up;
    q.face({ blink: blinkAt(lt, 6), brows: 1, mouth: 0.55 + 0.4 * Math.abs(Math.sin(lt * 11)), smile: 0.9 });
    alerts.forEach((a) => { const k = easeOutBack(inv(a.userData.t0, a.userData.t0 + 0.35, lt), 2.4); a.scale.setScalar(Math.max(0.001, k)); a.visible = lt > a.userData.t0 - 0.02; a.position.y += Math.sin(lt * 3 + a.userData.t0 * 9) * 0.0008; });
    rain.userData.update(lt);
    const s = Math.sin(lt * 18); strobe.intensity = s > 0.3 ? 6 : 0; strobe2.intensity = s < -0.3 ? 6 : 0;
    burst.userData.update(lt);
    // push-in with a quick orbit, heavy shake
    const c = easeInOut(inv(0, 3.0, lt));
    const ang = lerp(0.5, -0.45, c);
    const rad = lerp(2.5, 1.55, c);
    const pos = V(Math.sin(ang) * rad, lerp(1.2, 1.35, c), S.seatZ + Math.cos(ang) * rad).add(shake(lt, 0.025, 14, 2));
    setCam(camera, pos, V(0, 1.15, S.seatZ), noise1(lt * 6, 4) * 0.05);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.5, bloomThreshold: 0.85, envIntensity: 0.1 };
}
