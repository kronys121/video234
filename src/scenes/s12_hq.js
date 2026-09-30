import * as THREE from 'three';
import { human, idle, blinkAt, walkPose } from '../lib/human.js';
import { gameboy, gbScreen } from '../lib/gameboy.js';
import { skyDome, clouds, sun, ground, sign } from '../lib/env.js';
import { building, tree, box, rbox } from '../lib/props.js';
import { text3d } from '../lib/text3d.js';
import { TEX, M, V, setCam, path, inv, smooth, easeInOut, easeOutBack, lerp, clamp } from '../lib/util.js';

// 35.12–38.75  «С тех пор эта обгоревшая приставка стоит в штаб-квартире Nintendo»
export function build() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#bcd4ec', 60, 220);
  scene.add(skyDome([[0, '#2f6fc0'], [0.35, '#6aa6e6'], [0.5, '#cfe3f5'], [1, '#9aa4a8']]));
  scene.add(clouds(10, 7, 220, 45));
  scene.add(new THREE.HemisphereLight('#dcecff', '#8a8070', 1.0));
  sun(scene, { color: '#fff3dc', intensity: 3.0, pos: [30, 45, 25], target: [0, 0, -15], size: 30, mapSize: 2048 });
  scene.add(ground(400, M.std({ map: TEX.grass([60, 60]), roughness: 1 })));
  // plaza + path + steps
  const plaza = box(26, 0.1, 30, M.std({ map: TEX.tiles([13, 15], '#c9c3b8'), roughness: 0.75 }), 0, 0.05, -8, scene); plaza.receiveShadow = true;
  const runner = box(2.2, 0.02, 24, M.std({ map: TEX.carpet([1, 10], '#2a55b0'), roughness: 0.9 }), 0, 0.11, -6, scene); runner.receiveShadow = true;
  for (let i = 0; i < 5; i++) { const s = box(14 - i * 0.4, 0.18, 0.5, M.std({ map: TEX.concrete([6, 1], '#d9d4ca'), roughness: 0.7 }), 0, 0.1 + i * 0.18, -17.5 - i * 0.5, scene); s.castShadow = true; s.receiveShadow = true; }
  const hq = building({ w: 30, h: 14, d: 12, wall: '#d6cbb8', win: '#5f86ad', floors: 4, cols: 10 }); hq.position.set(0, 0.9, -26); scene.add(hq);
  const wingL = building({ w: 12, h: 10, d: 10, wall: '#c8b9a2', floors: 3, cols: 4, seed: 3 }); wingL.position.set(-20, 0, -22); wingL.rotation.y = 0.5; scene.add(wingL);
  const wingR = building({ w: 12, h: 10, d: 10, wall: '#c8b9a2', floors: 3, cols: 4, seed: 4 }); wingR.position.set(20, 0, -22); wingR.rotation.y = -0.5; scene.add(wingR);
  // entrance canopy + doors
  rbox(8, 0.35, 3, 0.05, M.col('#f2f0ea', 0.4), 0, 4.2, -19.2, scene).castShadow = true;
  for (const x of [-3.5, 3.5]) box(0.35, 3.6, 0.35, M.col('#f2f0ea', 0.4), x, 2.4, -18, scene).castShadow = true;
  box(5, 3, 0.1, M.std({ color: '#26405a', roughness: 0.05, metalness: 0.6 }), 0, 2.4, -19.98, scene);
  // roof sign: extruded NINTENDO letters on a frame, floating Game Boy above
  const letters = text3d('NINTENDO', { family: 'russo', size: 3.0, depth: 0.9, bevel: 0.12, color: '#e4000f', side: '#ffffff', metal: 0.1, rough: 0.3, emissive: '#e4000f', emissiveIntensity: 0.15 });
  letters.position.set(0, 18.4, -24); scene.add(letters);
  for (const x of [-9, -3, 3, 9]) box(0.2, 2.4, 0.2, M.col('#666', 0.4, 0.8), x, 16, -24.6, scene);
  const bigGb = gameboy(); bigGb.group.scale.setScalar(38); bigGb.group.position.set(0, 25.5, -24); scene.add(bigGb.group);
  // "HQ" monument stone near the path
  const stone = rbox(4.2, 1.3, 0.7, 0.08, M.std({ color: '#7d7973', roughness: 0.6 }), 0, 0.75, -15.2, scene); stone.castShadow = true;
  const plate = sign('ШТАБ-КВАРТИРА', { width: 3.8, color: '#f4efe4', size: 110, pad: 20 }); plate.position.set(0, 0.78, -14.84); scene.add(plate);
  const plate2 = sign('NINTENDO', { width: 1.4, color: '#e4000f', bg: '#f4efe4', size: 90, pad: 16 }); plate2.position.set(4.2 - 0.12, 1.12, -8.6); plate2.rotation.y = -0.35; plate2.visible = false; scene.add(plate2);
  // trees + lamp posts
  for (let i = 0; i < 6; i++) { for (const s of [-1, 1]) { const t = tree(i * 2 + (s > 0 ? 1 : 0), 5 + (i % 3)); t.position.set(s * (6.5 + (i % 2)), 0, -2 - i * 3.2); scene.add(t); } }
  for (const z of [-3, -9, -15]) for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 10), M.col('#2a2a2a', 0.4, 0.7)); p.position.set(s * 2.4, 1.7, z); p.castShadow = true; scene.add(p);
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), M.col('#fff8e8', 0.2, 0, { emissive: '#fff0d0', emissiveIntensity: 0.4 })); l.position.set(s * 2.4, 3.35, z); scene.add(l);
  }
  // visitors
  const walker = human({ skin: '#e2b08c', top: 'hoodie', topColor: '#1f2a44', pants: 'jeans', hair: '#6a4a30', hairStyle: 'short', shoes: '#f0f0f0' });
  scene.add(walker.root);
  const others = [
    human({ skin: '#8a5a3c', top: 'tshirt', topColor: '#c23a3a', pants: 'jeans', pantsColor: '#2a3a5a', hair: '#111', hairStyle: 'buzz' }),
    human({ skin: '#f0c8a8', top: 'shirt', topColor: '#e8e8f0', pants: 'slacks', pantsColor: '#333', hair: '#c9a060', hairStyle: 'long', female: true }),
  ];
  others[0].root.position.set(-3.2, 0.1, -12); others[0].root.rotation.y = 0.4; others[1].root.position.set(-2.4, 0.1, -12.6); others[1].root.rotation.y = -0.8;
  others.forEach((o) => scene.add(o.root));

  const camera = new THREE.PerspectiveCamera(58, 1080 / 1920, 0.1, 600);
  function update(lt) {
    const z = 1.5 - lt * 1.35;
    walker.root.position.set(0.1, 0.1, z); walker.root.rotation.y = Math.PI;
    walker.pose(walkPose(lt * 0.95, 1)); idle(walker, lt, 2, 0.2);
    others.forEach((o, i) => { o.pose({ lSh: [-10, 0, 10], rSh: [-30 * i, 0, -10], rEl: [-60 * i, 0, 0], head: [0, Math.sin(lt + i) * 15, 0] }); idle(o, lt, i + 4, 0.5); o.face({ blink: blinkAt(lt, i), mouth: i ? 0 : 0.3 * Math.abs(Math.sin(lt * 8)), smile: 0.5 }); });
    gbScreen(bigGb, 'tetris', lt, 1);
    bigGb.group.rotation.set(0.1, lt * 0.9, 0);
    bigGb.group.position.y = 25.5 + Math.sin(lt * 2) * 0.4;
    // letters pop one by one once the camera rises
    letters.scale.setScalar(Math.max(0.001, easeOutBack(inv(1.9, 2.4, lt), 1.8)));
    // camera: behind the walker (like a 3rd-person game), then crane up to the sign
    const c = easeInOut(inv(0.2, 3.6, lt));
    const pos = path([[0.9, 1.9, z + 3.2], [0.6, 2.4, z + 3.6], [0.2, 6.5, z + 9], [0, 9.5, z + 14]], c);
    const look = path([[0, 1.6, z - 6], [0, 3, z - 12], [0, 12, -24], [0, 17.5, -24]], c);
    setCam(camera, pos, look, 0.02 * Math.sin(lt * 0.8));
  }
  return { scene, camera, update, exposure: 0.85, bloom: 0.25, bloomThreshold: 0.95, envIntensity: 0.35 };
}
