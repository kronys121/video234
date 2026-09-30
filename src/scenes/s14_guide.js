import * as THREE from 'three';
import { human, idle, blinkAt, talk } from '../lib/human.js';
import { gbScreen } from '../lib/gameboy.js';
import { museumSet } from '../lib/sets.js';
import { TALK_A, TALK_B, CROSS, mix } from '../lib/poses.js';
import { V, setCam, inv, smooth, easeInOut, lerp } from '../lib/util.js';

// 43.05–46.30  «и историю до сих пор рассказывают, когда речь заходит о том»
export function build() {
  const scene = new THREE.Scene();
  const S = museumSet(scene);
  // guide next to the case, group in a half circle facing him
  const guide = human({ skin: '#d9a57f', top: 'suit', topColor: '#26324a', tie: '#e4000f', pants: 'slacks', pantsColor: '#1e2638', hair: '#8a8a8a', hairStyle: 'short', beard: true, shoes: '#1a1a1a' });
  guide.root.position.set(-0.75, 0, 0.2); guide.root.rotation.y = 0.9; scene.add(guide.root);
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.005), new THREE.MeshStandardMaterial({ color: '#e4000f' })); guide.J.chest.add(badge); badge.position.set(0.1, 0.12, 0.125);
  const group = [
    human({ skin: '#e2b08c', top: 'hoodie', topColor: '#1f2a44', pants: 'jeans', hair: '#6a4a30', hairStyle: 'short', shoes: '#f0f0f0' }),
    human({ skin: '#6e4630', top: 'tshirt', topColor: '#f2c400', pants: 'jeans', pantsColor: '#222a3a', hair: '#111', hairStyle: 'buzz', beard: true }),
    human({ skin: '#f0c8a8', top: 'shirt', topColor: '#c7d8ef', pants: 'slacks', pantsColor: '#333', hair: '#b8824a', hairStyle: 'long', female: true, glasses: '#6a2a2a' }),
    human({ skin: '#c89070', top: 'tshirt', topColor: '#2f8a5a', pants: 'jeans', hair: '#2a1a10', hairStyle: 'bun', female: true, height: 0.93 }),
    human({ skin: '#f2d0b8', top: 'hoodie', topColor: '#8e1c4f', pants: 'jeans', pantsColor: '#44506a', hair: '#e0c080', hairStyle: 'short', height: 0.78 }),
  ];
  const spots = [[0.9, 1.35, -2.4], [0.2, 1.75, -2.8], [1.25, 0.6, -2.0], [0.55, 1.9, -2.6], [1.45, 1.1, -2.2]];
  group.forEach((h, i) => { h.root.position.set(spots[i][0], 0, spots[i][1]); h.root.rotation.y = spots[i][2]; scene.add(h.root); });
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 80);

  function update(lt) {
    gbScreen(S.burnt, 'tetris', lt + 14, 1);
    const g = (Math.sin(lt * 3.1) + 1) / 2;
    guide.pose({ ...mix(TALK_A, TALK_B, g), spine: [0, Math.sin(lt * 1.5) * 6, 0], head: [5, -20 + Math.sin(lt * 1.2) * 20, 0] });
    idle(guide, lt, 3, 0.5);
    guide.face({ blink: blinkAt(lt, 1), mouth: talk(lt, 3), brows: 0.3 + 0.3 * Math.sin(lt * 2.3), smile: 0.3 });
    group.forEach((h, i) => {
      const nod = Math.max(0, Math.sin(lt * 2.4 + i * 1.7)) * 8;
      const base = i === 1 ? CROSS : i === 4 ? { lSh: [-20, 0, 20], rSh: [-20, 0, -20], lEl: [-30, 0, 0], rEl: [-30, 0, 0] } : { lSh: [-5, 0, 8], rSh: [-5, 0, -8] };
      h.pose({ ...base, head: [nod - (i === 4 ? 15 : 0), Math.sin(lt * 0.7 + i) * 8, 0] });
      idle(h, lt, i + 10, 0.4);
      const laugh = i === 3 && lt > 1.8 && lt < 2.6;
      h.face({ blink: blinkAt(lt, i + 3), smile: 0.4 + (laugh ? 0.5 : 0), mouth: laugh ? 0.5 * Math.abs(Math.sin(lt * 14)) : 0.05, brows: 0.2 + (i === 4 ? 0.5 : 0) });
    });
    // camera: from behind the group over their shoulders, arcing to the guide's face
    const a = easeInOut(inv(0, 3.25, lt));
    const pos = V(2.4, 2.1, -0.5).lerp(V(0.9, 2.05, 2.8), a);
    const look = V(-0.5, 1.35, 0.2).lerp(V(-0.7, 1.45, 0.25), a);
    setCam(camera, pos, look, 0.015 * Math.sin(lt));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.9, envIntensity: 0.45 };
}
