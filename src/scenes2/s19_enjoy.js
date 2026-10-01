import * as THREE from 'three';
import { idle, blinkAt, talk } from '../lib/human.js';
import { TYPE, mix } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { streamRoom, moneyPile, moneyRain, moneyBag, COL } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { V, setCam, inv, smooth, easeInOut, easeOutBack, shake, lerp, kf } from '../lib/util.js';

// 64.10–66.15  «он неплохо заработал на этой схеме, но»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07060b');
  const S = streamRoom(scene, { faceCam: true }); S.kb.visible = false;
  S.lights.key.intensity = 18;
  const q = mk.quantum(); q.root.position.set(0, 0, S.seatZ); scene.add(q.root);
  const top = S.dTop, dz = S.deskZ;
  const p1 = moneyPile(4, 5, 11, 1.0); p1.position.set(-0.3, top, dz + 0.1); scene.add(p1);
  const p2 = moneyPile(3, 4, 12, 1.0); p2.position.set(0.42, top, dz + 0.15); scene.add(p2);
  const bag = moneyBag(0.24, '$'); bag.position.set(0.62, top, dz + 0.4); scene.add(bag);
  const rain = moneyRain({ n: 36, seed: 14, area: [1.4, 1.0], top: 3.0, floor: 0.5, life: [1.4, 2.2], center: [0, 0, S.seatZ + 0.4], coins: 0.5 }); scene.add(rain);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    S.update(lt + 64.1);
    // leaning back with hands behind the head
    const back = smooth(inv(0.1, 0.6, lt));
    q.pose(mix({ ...TYPE }, { ...TYPE, lSh: [-155, -60, 40], rSh: [-155, 60, -40], lEl: [-100, 0, 0], rEl: [-100, 0, 0], head: [-6, 0, 0], spine: [-10, 0, 0] }, back));
    idle(q, lt, 6, 0.4);
    q.face({ blink: blinkAt(lt, 7), brows: 0.2, smile: 0.95, mouth: 0.1 + 0.1 * talk(lt, 2, 1) });
    [p1, p2].forEach((p, pi) => p.children.forEach((s) => { const k = easeOutBack(inv(0.0 + s.userData.order * 0.01 + pi * 0.1, 0.3 + s.userData.order * 0.01 + pi * 0.1, lt), 2); s.scale.setScalar(Math.max(0.001, k)); }));
    bag.scale.setScalar(1 + 0.06 * Math.sin(lt * 5));
    rain.userData.update(lt);
    S.lights.pl.color.set(lt % 0.5 < 0.25 ? COL.green : COL.gold);
    const f = kf(lt, [[0, [-1.0, 1.65, S.seatZ + 2.9], [0, 1.1, S.seatZ], 52, 0.06], [2.05, [0.8, 1.6, S.seatZ + 2.5], [0, 1.1, S.seatZ], 48, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.006, 6, 6)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.9, envIntensity: 0.15 };
}
