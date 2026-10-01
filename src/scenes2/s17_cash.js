import * as THREE from 'three';
import { idle, blinkAt, talk } from '../lib/human.js';
import { TYPE, mix } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { streamRoom, laptop, cashStack, moneyBag, COL } from '../lib/stream.js';
import { sign, point, particles } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { M, V, setCam, inv, smooth, easeInOut, easeOutBack, easeOutElastic, shake, lerp, kf, clamp } from '../lib/util.js';

// 51.65–56.45  «Стример при этом честно выводил деньги, платил с них налоги, забирал свою часть,»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07060b');
  const S = streamRoom(scene, { faceCam: true }); S.kb.visible = false;
  S.lights.key.intensity = 18;
  const q = mk.quantum(); q.root.position.set(0, 0, S.seatZ); scene.add(q.root);
  const dz = S.deskZ, top = S.dTop;
  const lap = laptop((g, w, h, t) => {
    g.fillStyle = '#0d1b12'; g.fillRect(0, 0, w, h); g.fillStyle = '#2ecc71'; g.font = `${h * 0.1}px Russo`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ВЫВОД СРЕДСТВ', w / 2, h * 0.28);
    const press = t > 1.3; g.fillStyle = press ? '#1a8f4a' : '#2ecc71'; g.fillRect(w * 0.2, h * 0.5, w * 0.6, h * 0.22); g.fillStyle = '#fff'; g.font = `${h * 0.1}px Russo`; g.fillText(press ? 'ГОТОВО' : 'ВЫВЕСТИ', w / 2, h * 0.61);
  }, 0.4);
  lap.position.set(0, top, dz - 0.05); lap.rotation.y = Math.PI; scene.add(lap);
  const taxBox = box(0.28, 0.26, 0.28, M.col('#2a4a7a', 0.5, 0.3), 0.58, top + 0.13, dz + 0.3, scene); taxBox.castShadow = true;
  const taxSign = sign('НАЛОГИ', { width: 0.26, color: '#ffffff', bg: '#1a3a6a', size: 100, pad: 18, border: '#ffffff' }); taxSign.position.set(0.58, top + 0.15, dz + 0.45); scene.add(taxSign);
  const paid = sign('ОПЛАЧЕНО', { width: 0.46, color: '#ffffff', bg: '#1e9e57', size: 100, pad: 20, border: '#ffffff', emissive: 0.5 }); paid.position.set(0.58, top + 0.55, dz + 0.3); scene.add(paid);
  const bag = moneyBag(0.28, '$'); bag.position.set(-0.58, top, dz + 0.32); scene.add(bag);
  const stacks = []; const slots = [];
  for (let i = 0; i < 9; i++) { const s = cashStack(0.16, 0.05, 0.07); scene.add(s); stacks.push(s); const col = i % 3, layer = Math.floor(i / 3); slots.push(V((col - 1) * 0.17, top + 0.025 + layer * 0.05, dz + 0.28)); }
  const burst = particles({ n: 40, seed: 5, color: '#8fffb0', size: [0.015, 0.035], life: [0.5, 1.0], origin: [0, top + 0.3, dz - 0.05], spread: [0.3, 0.1, 0.1], vel: [0, 0.6, 0.3], velSpread: [0.5, 0.3, 0.3], opacity: 1 }); scene.add(burst);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const W = 1.35, T = 2.2, P = 3.55; // beats: withdraw, taxes, own share
  const start = V(0, top + 0.2, dz - 0.12);
  const arc = (a, b, k, h) => V(lerp(a.x, b.x, k), lerp(a.y, b.y, k) + Math.sin(k * Math.PI) * h, lerp(a.z, b.z, k));
  function update(lt) {
    S.update(lt + 51.65); lap.userData.live.update(lt);
    const honest = smooth(inv(0.15, 0.55, lt)) * (1 - smooth(inv(1.1, 1.4, lt)));
    q.pose(mix({ ...TYPE }, { ...TYPE, rSh: [-20, 0, 20], rEl: [-125, 35, 0], rCurl: 0.2, head: [-4, 0, 0] }, honest));
    idle(q, lt, 4, 0.4);
    q.face({ blink: blinkAt(lt, 3), brows: 0.5, smile: 0.7, mouth: talk(lt, 1, 0.2) });
    // stacks: fly out of the laptop into the pile; 3 go to taxes, 3 go to his bag
    const taxIdx = [6, 7, 8], bagIdx = [3, 4, 5];
    stacks.forEach((s, i) => {
      const t0 = W + i * 0.09, k = clamp(inv(t0, t0 + 0.45, lt));
      let p = arc(start, slots[i], k, 0.35); let sc = k > 0 ? 1 : 0.001;
      const ti = taxIdx.indexOf(i), bi = bagIdx.indexOf(i);
      if (ti >= 0) { const k2 = clamp(inv(T + ti * 0.12, T + ti * 0.12 + 0.45, lt)); if (k2 > 0) { p = arc(slots[i], V(0.58, top + 0.3, dz + 0.3), k2, 0.3); sc = k2 > 0.9 ? Math.max(0.001, 1 - (k2 - 0.9) * 10) : 1; } }
      if (bi >= 0) { const k2 = clamp(inv(P + bi * 0.12, P + bi * 0.12 + 0.45, lt)); if (k2 > 0) { p = arc(slots[i], V(-0.58, top + 0.35, dz + 0.32), k2, 0.35); sc = k2 > 0.9 ? Math.max(0.001, 1 - (k2 - 0.9) * 10) : 1; } }
      s.position.copy(p); s.rotation.set(0, k < 1 ? k * 4 : 0, 0); s.scale.setScalar(Math.max(0.001, sc));
    });
    burst.visible = lt > W; burst.userData.update(Math.max(0, lt - W));
    const pk = easeOutBack(inv(T + 0.1, T + 0.5, lt), 2.2); taxSign.scale.setScalar(Math.max(0.001, pk)); taxSign.visible = lt > T + 0.08;
    const pd = easeOutBack(inv(T + 0.7, T + 1.1, lt), 2.4); paid.scale.setScalar(Math.max(0.001, pd)); paid.visible = lt > T + 0.68; paid.position.y = top + 0.55 + Math.sin(lt * 4) * 0.01;
    const bb = lt > P + 0.5 ? Math.exp(-(lt - P - 0.5) * 6) * Math.sin((lt - P - 0.5) * 20) * 0.04 : 0; bag.scale.setScalar(1 + bb * 3 + (lt > P + 0.5 ? 0.12 * Math.exp(-(lt - P - 0.5) * 6) : 0));
    // camera beats: wide on him, drop to the laptop, whip right to the tax box, whip left to the bag, final pull-back
    const f = kf(lt, [
      [0.0, [0.5, 1.75, S.seatZ + 2.7], [0, 1.1, S.seatZ], 50, 0.05],
      [1.1, [0.2, 1.5, S.seatZ + 2.2], [0, 1.0, S.seatZ + 0.6], 50, 0.02],
      [1.9, [0.0, 1.45, dz + 1.5], [0.0, top + 0.1, dz + 0.1], 50, 0],
      [2.4, [0.75, 1.3, dz + 1.45], [0.55, top + 0.2, dz + 0.3], 48, -0.05],
      [3.3, [0.65, 1.3, dz + 1.45], [0.5, top + 0.25, dz + 0.3], 48, -0.03],
      [3.8, [-0.7, 1.3, dz + 1.45], [-0.55, top + 0.25, dz + 0.32], 48, 0.05],
      [4.8, [0.0, 1.55, dz + 2.2], [0.0, top + 0.2, dz + 0.2], 52, 0],
    ]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 6, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.9, envIntensity: 0.15 };
}
