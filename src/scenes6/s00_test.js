import * as THREE from 'three';
import { human3, idle3 } from '../lib/human3.js';
import { room } from '../lib/rooms.js';
import { TEX, M, setCam } from '../lib/util.js';
export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#101014');
  scene.add(room({ w: 6, d: 6, h: 3, wall: M.std({ color: '#5a6470', roughness: 0.9 }), floor: M.std({ map: TEX.plywood([4, 4], '#7a5a3a'), roughness: 0.7 }), open: ['front'] }));
  scene.add(new THREE.HemisphereLight('#dfe8ff', '#3a2a1a', 0.6));
  const key = new THREE.SpotLight('#fff0dc', 30, 12, 0.7, 0.6, 1.2); key.position.set(1.5, 3, 3); key.target.position.set(0, 1.2, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; scene.add(key, key.target);
  const rim = new THREE.PointLight('#8ab0ff', 6, 6); rim.position.set(-1.5, 2.2, -1.5); scene.add(rim);
  const a = human3({ skin: '#f0c8a8', hair: '#3a2416', hairStyle: 'short', top: 'hoodie', topColor: '#2e3a4a', pants: 'jeans', shoes: '#e8e8e8', eyeColor: '#3a5a7a' });
  const b = human3({ skin: '#d8a882', hair: '#1a1210', hairStyle: 'long', female: true, lip: '#b0505a', top: 'robe', topColor: '#b89a6a', pants: 'slacks', pantsColor: '#2a2a30', shoes: '#2a1a12', dress: true, eyeColor: '#4a3020' });
  const c = human3({ skin: '#e8c0a0', hair: '#6a6a6a', hairStyle: 'short', top: 'jacket', topColor: '#22262e', pants: 'slacks', pantsColor: '#1e2028', shoes: '#111', dress: true, tie: '#1a3a7a', eyeColor: '#3a3a3a', bulk: 1.05 });
  a.root.position.set(-0.7, 0, 0); b.root.position.set(0, 0, 0.1); c.root.position.set(0.7, 0, 0);
  scene.add(a.root, b.root, c.root);
  const camera = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.05, 50);
  const close = new URLSearchParams(location.search).get('close');
  function update(lt) {
    [a, b, c].forEach((h, i) => { h.pose({ lSh: [0, 0, 8], rSh: [-20, 0, -8], rEl: [-40, 0, 0], rCurl: 0.2 + 0.6 * i / 2 }); idle3(h, lt, i, 0.2); h.face({ blink: 0, smile: 0.4, brows: 0.2 }); });
    if (lt > 1.5) setCam(camera, new THREE.Vector3(0.9, 1.68, 1.4), new THREE.Vector3(0.7, 1.6, 0), 0, 30); else if (lt > 0.5) setCam(camera, new THREE.Vector3(-0.45, 1.68, 1.35), new THREE.Vector3(0.0, 1.6, 0), 0, 30);
    else setCam(camera, new THREE.Vector3(0, 1.25, 6.5), new THREE.Vector3(0, 1.0, 0), 0, 30);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.2, bloomThreshold: 0.95, envIntensity: 0.3, ao: 1.0 };
}
