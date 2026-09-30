import * as THREE from 'three';
import { gameboy } from '../lib/gameboy.js';
import { labSet } from '../lib/sets.js';
import { battery } from '../lib/props.js';
import { point } from '../lib/env.js';
import { text3d } from '../lib/text3d.js';
import { V, M, setCam, inv, smooth, easeInOut, easeOutBack, lerp, clamp, glowTex, sprite, rng } from '../lib/util.js';

// 31.85–35.12  «сгорел только отсек с батарейками, и то не критично»
export function build() {
  const scene = new THREE.Scene();
  labSet(scene);
  // console lying face-down on the mat, back up
  const gb = gameboy({ burnt: 1 }); gb.group.position.set(0, 0.95, -0.1); gb.group.rotation.set(Math.PI / 2, 0, 0.35); scene.add(gb.group);
  const cover = gb.parts.battCover; const cover0 = cover.position.clone();
  // batteries inside the compartment (local coords of the console)
  const bats = [];
  for (let i = 0; i < 4; i++) { const b = battery(true); b.rotation.z = Math.PI / 2; b.position.set(0, -0.058 + i * 0.0105, -0.011); b.scale.setScalar(0.75); gb.group.add(b); bats.push(b); }
  const red = point(scene, '#ff3020', 0, 0.5, [0, 0, 0]);
  const redHalo = sprite(glowTex('rgba(255,60,40,1)'), '#ff3a2a', 0.12, true, 0); scene.add(redHalo);
  const txt = text3d('НЕ КРИТИЧНО', { family: 'mont', size: 0.0085, depth: 0.003, bevel: 0.0004, color: '#ffd21f', side: '#8a6a00', emissive: '#ffb000', emissiveIntensity: 0.35 });
  txt.position.set(0.01, 1.03, -0.09); scene.add(txt);
  const camera = new THREE.PerspectiveCamera(42, 1080 / 1920, 0.01, 60);
  const OFF = 0.7, OUT = 1.15, OK = 2.4;
  const r = rng(4); const dirs = bats.map(() => V((r() - 0.5) * 0.12, 0.25 + r() * 0.1, (r() - 0.5) * 0.12));
  const spin = bats.map(() => V(r() * 12, r() * 12, r() * 12));
  const wp = new THREE.Vector3();

  function update(lt) {
    // cover pops off and flips away
    const c = inv(OFF, OFF + 0.5, lt);
    cover.position.set(cover0.x + c * 0.06, cover0.y + c * 0.02, cover0.z - Math.sin(c * Math.PI) * 0.05 - c * 0.004);
    cover.rotation.set(0, c * 2.6, c * 0.5);
    // batteries jump out one by one (world-space parabola from their slots)
    bats.forEach((b, i) => {
      const t0 = OUT + i * 0.13, a = Math.max(0, lt - t0);
      if (a <= 0) { b.position.set(0, -0.058 + i * 0.0105, -0.011); b.rotation.set(0, 0, Math.PI / 2); return; }
      const d = dirs[i]; const tt = Math.min(a, 0.55);
      const lp = V(d.x * tt * 0.6, -0.058 + i * 0.0105 + d.z * tt * 0.6, -0.011 - (d.y * tt - 0.6 * tt * tt) * 0.6);
      b.position.copy(lp);
      b.rotation.set(spin[i].x * tt, spin[i].y * tt, Math.PI / 2 + spin[i].z * tt);
    });
    // red warning glow in the compartment, turns off when "not critical"
    gb.group.updateMatrixWorld(true);
    gb.group.localToWorld(wp.set(0, -0.042, -0.03));
    const warn = smooth(inv(OFF + 0.2, OFF + 0.5, lt)) * (1 - smooth(inv(OK, OK + 0.3, lt)));
    red.position.copy(wp); red.intensity = warn * (0.25 + 0.1 * Math.sin(lt * 18));
    redHalo.position.copy(wp); redHalo.material.opacity = warn * 0.6;
    const k = easeOutBack(inv(OK, OK + 0.45, lt), 2.2);
    txt.scale.setScalar(Math.max(0.001, k));
    // camera: orbit above the back of the console
    const a = easeInOut(inv(0, 3.2, lt));
    const ang = lerp(-0.9, 0.5, a);
    const rad = lerp(0.36, 0.3, a);
    const pos = V(Math.sin(ang) * rad, lerp(1.24, 1.19, a), -0.1 + Math.cos(ang) * rad);
    setCam(camera, pos, V(0, lerp(0.97, 1.02, smooth(inv(OK - 0.2, OK + 0.3, lt))), -0.09), 0.04 * Math.sin(lt));
    txt.up.copy(camera.up); txt.lookAt(camera.position); txt.rotateZ((1 - clamp(k)) * -0.4);
  }
  return { scene, camera, update, exposure: 0.9, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.4 };
}
