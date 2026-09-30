import * as THREE from 'three';
import { human, idle, blinkAt, talk } from '../lib/human.js';
import { gameboy } from '../lib/gameboy.js';
import { labSet } from '../lib/sets.js';
import { particles } from '../lib/env.js';
import { V, setCam, inv, smooth, easeInOut, lerp, clamp, smokeTex } from '../lib/util.js';

// 25.70–28.45  «К удивлению инженеров компании, после чистки»
export function build() {
  const scene = new THREE.Scene();
  const L = labSet(scene);
  const e1 = human({ skin: '#f0c8a8', top: 'labcoat', topColor: '#6a8ab0', pants: 'slacks', pantsColor: '#3a3a44', hair: '#1a1410', hairStyle: 'short', glasses: true, shoes: '#222', eyeColor: '#2a1a10' });
  e1.root.position.set(-0.3, 0, -0.9); e1.root.rotation.y = 0.15; scene.add(e1.root);
  const e2 = human({ skin: '#e8b898', top: 'labcoat', topColor: '#b05a6a', pants: 'slacks', pantsColor: '#2a2a33', hair: '#5a3020', hairStyle: 'bun', female: true, shoes: '#222', eyeColor: '#3a5a2a', lip: '#b8484a' });
  e2.root.position.set(0.42, 0, -0.95); e2.root.rotation.y = -0.2; scene.add(e2.root);
  e1.J.rWr.add(L.brush); L.brush.position.set(0, -0.1, 0.03); L.brush.rotation.set(-1.2, 0, 0);
  const gb = gameboy({ burnt: 1 }); gb.group.position.set(0, 0.95, -0.12); gb.group.rotation.set(-Math.PI / 2 + 0.05, 0, 0.2); scene.add(gb.group);
  const dust = particles({ n: 30, seed: 7, tex: smokeTex(), color: '#2a2420', additive: false, size: [0.03, 0.07], life: [0.5, 0.9], origin: [0, 0.97, -0.12], spread: [0.06, 0.01, 0.06], vel: [0.12, 0.25, 0.08], velSpread: [0.15, 0.1, 0.12], grav: 0.3, grow: 2, opacity: 0.8 });
  scene.add(dust);
  const camera = new THREE.PerspectiveCamera(46, 1080 / 1920, 0.02, 60);
  const SURP = 0.2, BRUSH = 2.2;

  function update(lt) {
    const s = smooth(inv(SURP, SURP + 0.25, lt));
    const look2 = smooth(inv(1.0, 1.3, lt)) * (1 - smooth(inv(1.9, 2.1, lt)));
    const br = smooth(inv(BRUSH - 0.35, BRUSH, lt));
    const stroke = Math.sin((lt - BRUSH) * 16) * br;
    // engineer 1: leans back surprised, then brushes the soot off
    e1.pose({
      spine: [lerp(22, 6, s) + br * 20, 0, 0], head: [lerp(25, 5, s) + br * 15, look2 * 35, 0],
      rSh: [lerp(-30, -20, s) - br * 40 + stroke * 8, 0, -12 - br * 5], rEl: [-60 - br * 30, 10, 0], rCurl: 0.7,
      lSh: [lerp(-30, -55, s) - br * 10, 0, 18], lEl: [lerp(-60, -110, s) + br * 40, -20, 0], lCurl: lerp(0.3, 0.1, s), lSpread: s,
    });
    idle(e1, lt, 1, 0.4);
    e1.face({ blink: blinkAt(lt, 2), brows: lerp(0, 1, s) - br * 0.5, mouth: s * (1 - br) * 0.8 + talk(lt, 1, look2 * 0.5), look: [look2 * 0.3, -0.25 * (1 - s) - br * 0.3] });
    // engineer 2: hands up to the cheeks
    e2.pose({
      spine: [lerp(20, 4, s), 0, 0], head: [lerp(28, 8, s) + br * 18, -look2 * 30, 0],
      lSh: [lerp(-25, -60, s), 0, lerp(15, 25, s)], lEl: [lerp(-50, -130, s), -30, 0], rSh: [lerp(-25, -60, s), 0, lerp(-15, -25, s)], rEl: [lerp(-50, -130, s), 30, 0],
      lCurl: 0.15, rCurl: 0.15,
    });
    idle(e2, lt, 5, 0.4);
    e2.face({ blink: blinkAt(lt, 7), brows: s, mouth: s * 0.9 * (1 - br * 0.6), smile: br * 0.5, look: [-look2 * 0.3, -0.2 * (1 - s) - br * 0.25] });
    dust.visible = lt > BRUSH; dust.userData.update(Math.max(0, lt - BRUSH));
    // camera: dolly across the bench, faces in frame
    const c = easeInOut(inv(0, 2.75, lt));
    const pos = V(lerp(-0.85, 0.55, c), lerp(1.45, 1.32, c), lerp(1.35, 1.0, c));
    const look = V(lerp(-0.05, 0.1, c), lerp(1.35, 1.2, c), -0.6);
    setCam(camera, pos, look, 0.015 * Math.sin(lt));
  }
  return { scene, camera, update, exposure: 0.9, bloom: 0.25, bloomThreshold: 0.95, envIntensity: 0.4 };
}
