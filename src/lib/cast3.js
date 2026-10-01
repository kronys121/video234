import * as THREE from 'three';
import { human2 } from './human2.js';
import { M, V } from './util.js';
import { solidHuman } from './overlap.js';

const addTo = (bone, mesh, x = 0, y = 0, z = 0) => { mesh.position.set(x, y, z); bone.add(mesh); mesh.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return mesh; };

export function apron(H, color = '#d8cfb8') {
  const a = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.62, 20, 1, true, -1.1, 2.2), M.std({ color, roughness: 0.9, side: THREE.DoubleSide }));
  a.scale.set(H.opts.bulk, 1, 0.9 * H.opts.bulk + 0.25); addTo(H.J.hips, a, 0, -0.16, 0.0); return a;
}
export function club(H) {
  const g = new THREE.Group(); const wood = M.col('#6b4a2a', 0.85);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.11, 1.3, 12), wood); shaft.position.y = -0.55; g.add(shaft);
  for (let i = 0; i < 5; i++) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), wood); k.position.set(Math.sin(i * 2.4) * 0.09, -0.9 - i * 0.07, Math.cos(i * 2.4) * 0.09); g.add(k); }
  g.rotation.x = Math.PI / 2; addTo(H.J.rHand.group, g, 0, -0.07, 0.0); return g;
}
export function axe(H) {
  const g = new THREE.Group();
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.7, 10), M.col('#5a3a1e', 0.7)); h.position.y = -0.2; g.add(h);
  const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.012, 20, 1, false, 0, Math.PI), M.col('#b8bec6', 0.3, 0.9)); blade.rotation.set(Math.PI / 2, 0, Math.PI / 2); blade.position.set(0, -0.48, 0.0); g.add(blade);
  g.rotation.x = Math.PI / 2; addTo(H.J.rHand.group, g, 0, -0.07, 0); return g;
}

export const mk3 = {
  hero: () => { const h = human2({ skin: '#e2b08c', hair: '#6a4a2a', helmet: 'horned', beard: true, top: 'tunic', topColor: '#7a5a3a', pants: 'leather', pantsColor: '#4a3626', shoes: '#3a2a1c', gloves: '#5a4030', eyeColor: '#3a5a7a', bulk: 1.08 }); return solidHuman(h, 'hero'); },
  giant: () => { const h = human2({ skin: '#8a8078', hair: '#e2dcd2', hairStyle: 'wild', beard: 'long', top: 'none', pants: 'loincloth', pantsColor: '#5a4430', shoes: '#4a3a2a', bulk: 1.45, belly: 0.035, limb: 1.5, height: 2.3, eyeColor: '#2a2a2a' }); return solidHuman(h, 'giant'); },
  merchant: () => { const h = human2({ skin: '#e8c0a0', hair: '#5a4a3a', hairStyle: 'short', beard: true, top: 'longsleeve', topColor: '#6a3a4a', pants: 'slacks', pantsColor: '#4a4034', shoes: '#3a2a1c', bulk: 1.1, belly: 0.04, eyeColor: '#4a3322' }); apron(h); return solidHuman(h, 'merchant'); },
  dev: () => solidHuman(human2({ skin: '#f0c8a8', hair: '#2a1a12', hairStyle: 'short', top: 'hoodie', topColor: '#2f5a8a', pants: 'jeans', glasses: true, shoes: '#eee', eyeColor: '#3a4a2a' }), 'dev'),
  dev2: () => solidHuman(human2({ skin: '#c89070', hair: '#1a1010', hairStyle: 'bun', female: true, top: 'longsleeve', topColor: '#c0563a', pants: 'jeans', pantsColor: '#2a2a3a', shoes: '#ddd', eyeColor: '#2a1a10', lip: '#a8484a' }), 'dev2'),
  boss: () => solidHuman(human2({ skin: '#ecc4a4', hair: '#7a6a5a', hairStyle: 'short', top: 'jacket', topColor: '#1e2430', pants: 'slacks', pantsColor: '#1a1e26', shoes: '#111', eyeColor: '#4a5a6a' }), 'boss'),
  host: () => solidHuman(human2({ skin: '#f2d0b8', hair: '#c9a060', hairStyle: 'long', female: true, top: 'jacket', topColor: '#8a2a3a', pants: 'slacks', pantsColor: '#2a2a2a', shoes: '#2a1a1a', eyeColor: '#3a5a7a', lip: '#b8484a' }), 'host'),
  gamer: () => solidHuman(human2({ skin: '#8a5a3c', hair: '#111', hairStyle: 'buzz', top: 'tshirt', topColor: '#e0a020', pants: 'jeans', shoes: '#eee', eyeColor: '#2a1a10' }), 'gamer'),
};
export { V };
