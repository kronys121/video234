import * as THREE from 'three';
import { gameboy, gbScreen } from '../lib/gameboy.js';
import { labSet } from '../lib/sets.js';
import { motherboard } from '../lib/props.js';
import { point } from '../lib/env.js';
import { text3d } from '../lib/text3d.js';
import { V, setCam, inv, smooth, easeInOut, easeOutBack, lerp, clamp, glowTex, sprite, M } from '../lib/util.js';

// 28.45–31.85  «экран и материнская плата оказались полностью рабочими»
export function build() {
  const scene = new THREE.Scene();
  labSet(scene);
  const gb = gameboy({ burnt: 0.7 }); gb.group.position.set(0, 1.02, -0.1); gb.group.rotation.set(-0.35, 0, 0); scene.add(gb.group);
  const standM = M.col('#1a1a1a', 0.4, 0.3);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.05), standM); stand.position.set(0, 0.955, -0.11); stand.castShadow = true; scene.add(stand);
  const glow = point(scene, '#b8ff6a', 0, 0.8, [0, 1.05, 0.02]);
  const halo = sprite(glowTex('rgba(190,255,120,1)'), '#b8ff6a', 0.12, true, 0); halo.position.set(0, 1.05, -0.16); scene.add(halo);
  const mb = motherboard(); mb.group.scale.setScalar(1.1); scene.add(mb.group);
  const mbHalo = sprite(glowTex('rgba(120,255,160,1)'), '#6affb0', 0.25, true, 0); scene.add(mbHalo);
  const works = text3d('РАБОТАЕТ!', { family: 'mont', size: 0.017, depth: 0.005, bevel: 0.0008, color: '#8fe34a', side: '#2f6a14', emissive: '#6fd02a', emissiveIntensity: 0.5 });
  works.position.set(0.035, 1.14, -0.07); scene.add(works);
  const check = new THREE.Group(); const cm = M.col('#8fe34a', 0.3, 0, { emissive: '#6fd02a', emissiveIntensity: 0.6 });
  const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.01), cm); c1.position.set(-0.01, 0, 0); c1.rotation.z = 0.8; check.add(c1);
  const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.06, 0.01), cm); c2.position.set(0.012, 0.012, 0); c2.rotation.z = -0.6; check.add(c2);
  check.position.set(0.115, 1.142, -0.07); check.scale.setScalar(0.4); scene.add(check);
  const camera = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.01, 60);
  const ON = 0.12, MB = 0.5, OK = 2.0;

  function update(lt) {
    // power on: boot logo, then the game
    const mode = lt < ON ? 'off' : lt < ON + 0.9 ? 'boot' : 'tetris';
    gbScreen(gb, mode, mode === 'boot' ? lt - ON : lt, smooth(inv(ON, ON + 0.2, lt)));
    glow.intensity = lt > ON ? 0.12 : 0;
    halo.material.opacity = lt > ON ? 0.25 + 0.05 * Math.sin(lt * 9) : 0;
    // motherboard slides out to the right and explodes its chips
    const m = easeOutBack(inv(MB, MB + 0.6, lt), 1.4);
    mb.group.position.set(lerp(0, 0.11, m), lerp(1.02, 1.07, m), lerp(-0.13, -0.08, m));
    mb.group.rotation.set(-0.3, lerp(0, -0.45, m), lerp(0, 0.12, m));
    mb.group.visible = lt > MB;
    mb.parts.forEach((p, i) => { const k = easeOutBack(inv(MB + 0.5 + i * 0.05, MB + 0.85 + i * 0.05, lt), 2); p.position.z = 0.0015 + k * (0.012 + (i % 3) * 0.004); });
    mbHalo.position.copy(mb.group.position); mbHalo.material.opacity = 0.15 * smooth(inv(MB + 0.4, MB + 0.8, lt));
    // "works!" pops with bounce
    const w = easeOutBack(inv(OK, OK + 0.45, lt), 2.2);
    works.scale.setScalar(Math.max(0.001, w));
    const ck = easeOutBack(inv(OK + 0.25, OK + 0.6, lt), 2.5);
    check.scale.setScalar(Math.max(0.001, ck) * 0.35);
    // camera: push into the screen, then ease back and to the side to show board + text
    const a = easeInOut(inv(0, 0.9, lt)), b = easeInOut(inv(0.9, 2.3, lt));
    const pos = V(0.02, 1.12, 0.32).lerp(V(0.0, 1.07, 0.13), a).lerp(V(-0.08, 1.14, 0.36), b);
    const look = V(0, 1.03, -0.1).lerp(V(0.04, 1.1, -0.1), b);
    setCam(camera, pos, look, 0.03 * Math.sin(lt * 1.4));
    camera.updateMatrixWorld(); works.lookAt(camera.position); works.rotateZ((1 - clamp(w)) * 0.5); check.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 0.9, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.4 };
}
