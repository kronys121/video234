import * as THREE from 'three';
import { human, idle, blinkAt, talk } from '../lib/human.js';
import { gbScreen } from '../lib/gameboy.js';
import { museumSet } from '../lib/sets.js';
import { POINT_R, CROSS } from '../lib/poses.js';
import { point } from '../lib/env.js';
import { V, setCam, inv, smooth, easeInOut, lerp, clamp, glowTex, sprite, M } from '../lib/util.js';
import { box } from '../lib/props.js';

export function visitors(scene) {
  const v = [
    human({ skin: '#e2b08c', top: 'hoodie', topColor: '#1f2a44', pants: 'jeans', hair: '#6a4a30', hairStyle: 'short', shoes: '#f0f0f0' }),
    human({ skin: '#6e4630', top: 'tshirt', topColor: '#f2c400', pants: 'jeans', pantsColor: '#222a3a', hair: '#111', hairStyle: 'buzz', beard: true }),
    human({ skin: '#f0c8a8', top: 'shirt', topColor: '#c7d8ef', pants: 'slacks', pantsColor: '#333', hair: '#b8824a', hairStyle: 'long', female: true, glasses: '#6a2a2a' }),
  ];
  v[0].root.position.set(-1.05, 0, -0.35); v[0].root.rotation.y = 1.85;
  v[1].root.position.set(0.95, 0, 0.55); v[1].root.rotation.y = -2.1;
  v[2].root.position.set(0.25, 0, -1.05); v[2].root.rotation.y = -0.2;
  v.forEach((h) => scene.add(h.root));
  const phone = box(0.07, 0.14, 0.008, M.col('#111', 0.3, 0.5)); v[2].J.rWr.add(phone); phone.position.set(0, -0.12, 0.04); phone.rotation.x = -0.3;
  return { v, phone };
}

// 38.75–43.05  «как живое доказательство легендарной прочности оригинального Game Boy»
export function build() {
  const scene = new THREE.Scene();
  const S = museumSet(scene);
  const { v, phone } = visitors(scene);
  const flash = point(scene, '#ffffff', 0, 4, [0.25, 1.5, -0.8]);
  const flashS = sprite(glowTex('rgba(255,255,255,1)'), '#ffffff', 0.25, true, 0); scene.add(flashS);
  const screenGlow = point(scene, '#b8ff6a', 0.25, 0.8, [0, 1.25, 0.1]);
  const plaqueGlow = sprite(glowTex('rgba(255,210,120,1)'), '#ffd27a', 0.9, true, 0); plaqueGlow.position.set(0, 0.8, 0.4); scene.add(plaqueGlow);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.02, 80);
  const PLAQ = 1.4, PHOTO = 2.6;
  const tmp = new THREE.Vector3();

  function update(lt) {
    gbScreen(S.burnt, 'tetris', lt + 10, 1);
    v[0].pose({ ...POINT_R, rSh: [-70 + Math.sin(lt * 2) * 5, 0, -5], head: [10, 0, 0], lSh: [-5, 0, 8] }); idle(v[0], lt, 1, 0.4);
    v[0].face({ blink: blinkAt(lt, 2), mouth: talk(lt, 2, 0.8), brows: 0.4, smile: 0.4 });
    v[1].pose({ ...CROSS, head: [12, Math.sin(lt * 0.8) * 10, 0], spine: [5, 0, 0] }); idle(v[1], lt, 3, 0.4);
    v[1].face({ blink: blinkAt(lt, 5), brows: 0.6, mouth: 0.15, smile: 0.2 });
    const ph = smooth(inv(1.8, 2.3, lt));
    v[2].pose({ rSh: [lerp(-10, -80, ph), 0, -10], rEl: [lerp(-20, -50, ph), 0, 0], rCurl: 0.6, lSh: [-10, 0, 10], head: [8, 0, 0] }); idle(v[2], lt, 6, 0.4);
    v[2].face({ blink: blinkAt(lt, 8), smile: 0.7, mouth: 0.1 });
    const f = lt > PHOTO ? Math.exp(-(lt - PHOTO) * 14) : 0;
    phone.getWorldPosition(tmp); flash.position.copy(tmp); flash.intensity = f * 40;
    flashS.position.copy(tmp).add(V(0, 0, 0.02)); flashS.material.opacity = f;
    plaqueGlow.material.opacity = 0.5 * Math.max(0, Math.sin(clamp(inv(PLAQ, PLAQ + 1.2, lt)) * Math.PI));
    screenGlow.intensity = 0.25;
    // camera: full orbit segment around the case, closing in on the console at "Game Boy"
    const a = easeInOut(inv(0, 4.3, lt));
    const ang = lerp(-0.9, 0.95, a);
    const close = smooth(inv(2.9, 3.6, lt));
    const rad = lerp(2.0, 1.2, a) - close * 0.65;
    const pos = V(Math.sin(ang) * rad, lerp(1.6, 1.4, a) - close * 0.1, Math.cos(ang) * rad);
    const look = V(0, lerp(1.05, 1.15, a) + close * 0.06, 0);
    setCam(camera, pos, look, 0.02 * Math.sin(lt * 0.9));
    camera.fov = lerp(52, 42, a); camera.updateProjectionMatrix();
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.45 };
}
