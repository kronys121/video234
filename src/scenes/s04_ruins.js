import * as THREE from 'three';
import { human, idle, blinkAt } from '../lib/human.js';
import { gameboy } from '../lib/gameboy.js';
import { skyDome, smoke, ground, sign, point, sun, embers } from '../lib/env.js';
import { bunkBed, box, humvee } from '../lib/props.js';
import { TEX, M, V, setCam, path, inv, smooth, easeInOut, easeOutBack, rng, lerp, clamp, noise1 } from '../lib/util.js';

// 10.45–14.15  «Приставку нашли спустя несколько дней среди обгоревшего мусора»
export function build() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#b9a58c', 18, 110);
  scene.add(skyDome([[0, '#8e9aa6'], [0.45, '#d8c7ad'], [0.52, '#cdb89a'], [1, '#6a5a48']]));
  scene.add(new THREE.HemisphereLight('#f2e4cc', '#5a4a3a', 0.9));
  sun(scene, { color: '#ffe6c2', intensity: 2.6, pos: [18, 26, 14], size: 12 });
  scene.add(ground(300, M.std({ map: TEX.sand([40, 40]), color: '#a89274', roughness: 1 })));
  const char = M.std({ map: TEX.soot([2, 2]), color: '#ffffff', roughness: 0.95, bumpMap: TEX.soot([2, 2]), bumpScale: 2 });
  const charDark = M.std({ map: TEX.soot([1, 3]), color: '#8a8580', roughness: 0.9 });
  // burnt slab + ash
  box(6.4, 0.12, 12.4, char, 0, 0.06, -4, scene).receiveShadow = true;
  const r = rng(17);
  for (let i = 0; i < 26; i++) {
    const a = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3 + r() * 0.6, 0), char); a.scale.y = 0.35; a.position.set((r() - 0.5) * 6, 0.12, -4 + (r() - 0.5) * 11); a.rotation.y = r() * 6; a.castShadow = true; a.receiveShadow = true; scene.add(a);
  }
  // standing burnt posts and fallen beams
  for (let i = 0; i < 9; i++) {
    const h = 0.8 + r() * 2.2;
    const p = box(0.18, h, 0.18, charDark, (i % 2 ? 3 : -3) + (r() - 0.5) * 0.3, h / 2, -9 + i * 1.5); p.rotation.z = (r() - 0.5) * 0.2; p.castShadow = true; scene.add(p);
  }
  for (let i = 0; i < 10; i++) {
    const b = box(0.2, 0.16, 2 + r() * 3, charDark, (r() - 0.5) * 5, 0.3 + r() * 0.6, -8 + r() * 9); b.rotation.set((r() - 0.5) * 0.6, r() * 3, (r() - 0.5) * 0.4); b.castShadow = true; b.receiveShadow = true; scene.add(b);
  }
  // twisted bunk frames
  for (const [x, z, rz, ry] of [[-1.8, -2.5, 0.35, 1.2], [1.9, -6, -0.5, -1.4], [-1.6, -7.5, 0.2, 1.7]]) {
    const b = bunkBed('#231d18'); b.position.set(x, 0.1, z); b.rotation.set(0, ry, rz); b.scale.y = 0.75;
    b.traverse((m) => { if (m.isMesh && m.material.map) m.material = charDark; }); scene.add(b);
  }
  // corrugated roof sheet
  const sheet = box(2.5, 0.05, 3, M.col('#2b2622', 0.7, 0.5), 1.2, 0.35, -3.2); sheet.rotation.set(0.15, 0.4, -0.2); sheet.castShadow = true; scene.add(sheet);
  // sign board stuck in the rubble
  const board = new THREE.Group();
  const bs = sign('НЕСКОЛЬКО', { width: 1.5, color: '#1d1a17', bg: '#e9dfc8', size: 110, pad: 30, grunge: 0.5, lines: ['НЕСКОЛЬКО', 'ДНЕЙ СПУСТЯ'], border: '#1d1a17' });
  bs.position.y = 1.35; board.add(bs);
  const stake = box(0.08, 1.4, 0.06, M.col('#6b5236', 0.9), 0, 0.7, -0.05, board); stake.castShadow = true;
  board.position.set(1.35, 0.1, -2.4); board.rotation.y = -0.25; scene.add(board);
  const hv = humvee(); hv.position.set(-7, 0, -14); hv.rotation.y = 0.9; scene.add(hv);
  // lingering smoke + a few embers
  const sm = smoke({ n: 18, seed: 31, origin: [0, 0.5, -5], spread: [6, 0.5, 9], vel: [0.3, 0.8, 0], velSpread: [0.2, 0.2, 0.2], size: [1.5, 3], life: [4, 7], grow: 2.2, color: '#5a524a', opacity: 0.45 });
  scene.add(sm);
  const emb = embers({ n: 20, seed: 4, origin: [0, 0.3, -4], spread: [5, 0.3, 8], vel: [0, 0.4, 0], velSpread: [0.2, 0.2, 0.2], life: [1.5, 3], size: [0.03, 0.06], turb: 0.2 });
  scene.add(emb);

  // soldiers
  const dig = human({ skin: '#c8906a', top: 'uniform', pants: 'dcu', helmet: true, shoes: '#b39a72', gloves: '#8e7a56', eyeColor: '#3a2a1a' });
  dig.root.position.set(0.2, 0.12, -1.0); dig.root.rotation.y = 0.35; scene.add(dig.root);
  const std = human({ skin: '#6e4630', top: 'uniform', pants: 'dcu', helmet: true, shoes: '#b39a72', eyeColor: '#1a1010' });
  std.root.position.set(-1.3, 0.12, -2.2); std.root.rotation.y = 0.9; scene.add(std.root);
  const clip = box(0.22, 0.3, 0.015, M.col('#6b4a2a', 0.7)); std.J.lWr.add(clip); clip.position.set(0.02, -0.14, 0.06); clip.rotation.x = -1.0;
  const paper = box(0.2, 0.26, 0.004, M.col('#f2eee2', 0.9)); clip.add(paper); paper.position.z = 0.01;

  const gb = gameboy({ burnt: 1 }); gb.group.scale.setScalar(1.25); scene.add(gb.group);
  const buried = V(0.35, 0.16, -0.35);

  const camera = new THREE.PerspectiveCamera(55, 1080 / 1920, 0.05, 400);
  const hand = new THREE.Vector3();
  const LIFT = 2.45;

  function update(lt) {
    // kneel + dig, then lift the find
    const lift = smooth(inv(LIFT, LIFT + 0.5, lt));
    const d = Math.sin(lt * 9) * (1 - lift);
    dig.pose({
      hipsY: -0.5, lHip: [-95, 0, 8], lKnee: [95, 0, 0], rHip: [-5, 0, -4], rKnee: [100, 0, 0], rAnk: [40, 0, 0],
      spine: [35 - lift * 25, 0, 0], chest: [10 - lift * 10, 0, 0], head: [20 - lift * 15, 0, 0],
      rSh: [lerp(-55 + d * 12, -95, lift), 0, lerp(-10, -5, lift)], rEl: [lerp(-15, -35, lift), 0, 0], rCurl: 0.7,
      lSh: [-45 - d * 10, 0, 18], lEl: [-20, 0, 0], lCurl: 0.5,
    });
    idle(dig, lt, 2, 0.3);
    dig.face({ blink: blinkAt(lt, 6), brows: 0.6 * lift, mouth: 0.35 * lift, look: [0, -0.2 + 0.3 * lift] });
    std.pose({ lSh: [-40, 0, 12], lEl: [-70, 0, 0], rSh: [-20, 0, -10], rEl: [-60, 20, 0], rCurl: 0.6, head: [25 - 15 * lift, -20 * lift, 0] });
    idle(std, lt, 9, 0.5);
    std.face({ blink: blinkAt(lt, 3), brows: 0.3 + 0.5 * lift, mouth: 0.2 * lift });

    // console: buried, then in the right hand and raised
    dig.root.updateMatrixWorld(true);
    dig.J.rHand.group.getWorldPosition(hand);
    const k = smooth(inv(LIFT - 0.1, LIFT + 0.2, lt));
    gb.group.position.lerpVectors(buried, hand.clone().add(V(0.0, -0.06, 0.05)), k);
    gb.group.rotation.set(lerp(-1.35, -0.1, k), lerp(0.4, 0.5, k), lerp(0.25, -0.1, k));
    const popk = inv(LIFT + 0.1, LIFT + 0.5, lt);
    gb.group.scale.setScalar(1.25 * (1 + Math.sin(clamp(popk) * Math.PI) * 0.25));

    // sign board pops out of the rubble
    const bk = easeOutBack(inv(0.55, 1.05, lt), 2.2);
    board.scale.set(1, bk, 1); board.rotation.z = (1 - clamp(bk)) * 0.4;

    sm.userData.update(lt + 5); emb.userData.update(lt);
    // camera: low fly-through the rubble toward the digger, ending close on the find
    const c = easeInOut(inv(0, 3.7, lt));
    const pos = path([[-3.2, 2.6, 5.5], [-2.0, 1.6, 3.6], [-0.6, 1.15, 2.4], [0.55, 1.2, 1.15]], c);
    pos.y += noise1(lt * 2, 4) * 0.03;
    const look = path([[0.4, 0.6, -4], [0.3, 0.7, -2], [0.3, 0.7, -0.9], [0.35, 0.95, -0.55]], c);
    look.lerp(gb.group.position, smooth(inv(LIFT, LIFT + 0.6, lt)) * 0.7);
    setCam(camera, pos, look, 0.03 * Math.sin(lt * 0.9));
    camera.fov = lerp(60, 48, c); camera.updateProjectionMatrix();
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.3, bloomThreshold: 0.95, envIntensity: 0.3 };
}
