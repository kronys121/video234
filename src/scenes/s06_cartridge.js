import * as THREE from 'three';
import { gameboy } from '../lib/gameboy.js';
import { skyDome, embers, ground, point, crate, smoke } from '../lib/env.js';
import { human } from '../lib/human.js';
import { TEX, M, V, setCam, inv, smooth, easeOutBack, easeInOut, easeOutElastic, lerp, clamp, glowTex, sprite } from '../lib/util.js';

// 17.72–20.30  «Внутри всё ещё торчал картридж с игрой»
export function build() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#2a221c', 1.5, 14);
  scene.add(skyDome([[0, '#4a3c30'], [0.5, '#5a4636'], [1, '#1a1410']], 40));
  scene.add(new THREE.HemisphereLight('#d8c0a0', '#2a1e14', 0.45));
  scene.add(ground(40, M.std({ map: TEX.soot([6, 6]), roughness: 1 })));
  const cr = crate(1.2, 0.6, 0.7, { wood: true, stencil: 'US ARMY' }); cr.position.set(0, 0.3, 0); scene.add(cr);
  // flashlight key from a soldier standing off-frame
  const flash = new THREE.SpotLight('#fff1d6', 10, 5, 0.35, 0.5, 1.2); flash.position.set(0.7, 1.4, 0.8); flash.target.position.set(0, 0.65, 0);
  flash.castShadow = true; flash.shadow.mapSize.set(1024, 1024); flash.shadow.bias = -0.0005; scene.add(flash, flash.target);
  const back = point(scene, '#ff8a3a', 1.5, 2, [-0.3, 0.9, -0.4]);
  const soldier = human({ top: 'uniform', pants: 'dcu', helmet: true, gloves: '#8e7a56', skin: '#b98060' });
  soldier.root.position.set(0.9, 0, 1.0); soldier.root.rotation.y = -2.4; scene.add(soldier.root);
  const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.18, 12), M.col('#2a2a2a', 0.4, 0.6)); soldier.J.rWr.add(torch); torch.position.set(0, -0.1, 0.03); torch.rotation.x = -1.2;
  const emb = embers({ n: 30, seed: 22, origin: [0, 0.7, 0], spread: [0.8, 0.2, 0.8], vel: [0, 0.25, 0], velSpread: [0.1, 0.1, 0.1], life: [1.5, 3], size: [0.008, 0.02], turb: 0.05 });
  scene.add(emb);
  const sm = smoke({ n: 8, seed: 9, origin: [0, 0.8, -1.5], spread: [2, 0.3, 1], vel: [0.1, 0.2, 0], size: [0.8, 1.5], life: [4, 6], grow: 2, color: '#6a5a4c', opacity: 0.3 });
  scene.add(sm);

  const gb = gameboy({ burnt: 1 }); gb.group.position.set(0, 0.6 + 0.074, 0); gb.group.rotation.set(-0.12, 0.25, 0); scene.add(gb.group);
  const cart = gb.parts.cart; const cart0 = cart.position.y;
  const halo = sprite(glowTex('rgba(255,210,120,1)'), '#ffcf80', 0.09, true, 0); gb.group.add(halo); halo.position.set(0, 0.08, -0.02);

  const camera = new THREE.PerspectiveCamera(42, 1080 / 1920, 0.01, 60);
  const OUT = 1.1;
  function update(lt) {
    // cartridge pops up with a springy bounce
    const k = easeOutElastic(inv(OUT, OUT + 0.7, lt));
    cart.position.y = cart0 + k * 0.022;
    cart.rotation.z = Math.sin(clamp(inv(OUT, OUT + 0.5, lt)) * Math.PI * 3) * 0.04 * (1 - inv(OUT, OUT + 0.6, lt));
    halo.material.opacity = 0.7 * smooth(inv(OUT, OUT + 0.3, lt)) * (0.8 + 0.2 * Math.sin(lt * 8));
    halo.scale.setScalar(0.08 + 0.02 * Math.sin(lt * 6));
    // orbit: from the front around to the back/top of the console, then push in on the cartridge
    const a = easeInOut(inv(0, 0.9, lt));
    const ang = lerp(0.3, Math.PI - 0.35, a) + (lt - 0.9) * 0.08 * (lt > 0.9 ? 1 : 0);
    const rad = lerp(0.42, 0.31, smooth(inv(0.9, 2.5, lt)));
    const h = lerp(0.72, 0.84, a);
    const center = gb.group.position.clone().add(V(0, 0.03 + 0.03 * a, 0));
    const pos = V(Math.sin(ang) * rad, h, Math.cos(ang) * rad);
    setCam(camera, pos, center, -0.05 + 0.08 * Math.sin(lt * 0.7));
    soldier.pose({ rSh: [-70, 0, -10], rEl: [-30, 0, 0], rCurl: 0.8, head: [30, 0, 0] });
    flash.intensity = 10 + Math.sin(lt * 3) * 0.6;
    back.intensity = 1.5 + Math.sin(lt * 9) * 0.4;
    emb.userData.update(lt); sm.userData.update(lt + 3);
  }
  return { scene, camera, update, exposure: 1.05, bloom: 0.35, bloomThreshold: 0.9, envIntensity: 0.35 };
}
