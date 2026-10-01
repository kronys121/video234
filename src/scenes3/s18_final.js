import * as THREE from 'three';
import { mk3 } from '../lib/cast3.js';
import { idle2 } from '../lib/human2.js';
import { sofa, beetle, walkBug, glassDome, heart } from '../lib/fantasy.js';
import { livePlane } from '../lib/stream.js';
import { gameDraw } from './s07_office.js';
import { sign, point } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { room } from '../lib/rooms.js';
import { solid } from '../lib/overlap.js';
import { TEX, M, V, setCam, kf, inv, smooth, easeOutBack, shake, lerp, clamp, canvasTex } from '../lib/util.js';

// 52.95–56.76  «и бережно сохранять то, что им, наоборот, искренне нравится.»
export function build() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#120e10');
  const wp = canvasTex('wp3', 256, 256, (g, w, h) => { g.fillStyle = '#3a4a5a'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = x % 64 ? '#40526a' : '#34445a'; g.fillRect(x, 0, 16, h); } }, { repeat: [3, 2] });
  const R = room({ w: 6.4, d: 6.4, h: 3, wall: M.std({ map: wp, roughness: 0.95 }), floor: M.std({ map: TEX.plywood([4, 4], '#6a4a2e'), roughness: 0.7 }), ceil: M.col('#1a1612', 1), open: ['front'] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#ffd9b0', '#1a1410', 0.55));
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.7, 40), M.std({ map: TEX.carpet([3, 3], '#6a3a2a'), roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.01, -0.6); rug.scale.set(1.3, 1, 1); rug.receiveShadow = true; scene.add(rug);
  // TV on a low cabinet against the back wall, sofa facing it
  const cab = rbox(1.8, 0.45, 0.45, 0.02, M.std({ map: TEX.plywood([2, 1], '#4a3020'), roughness: 0.7 }), 0, 0.225, -2.9, scene); solid(cab, 'cabinet');
  const tv = livePlane(1.5, 0.85, gameDraw, { px: 768, emissive: 1.0 }); tv.position.set(0, 1.05, -2.98); scene.add(tv);
  rbox(1.56, 0.9, 0.05, 0.01, M.col('#0e0e12', 0.4), 0, 1.05, -3.02, scene);
  const sf = sofa('#4a6a8a'); sf.position.set(0, 0, 0.6); sf.rotation.y = Math.PI; scene.add(solid(sf, 'sofa', ['gamer']));
  const gamer = mk3.gamer(); gamer.root.position.set(-0.2, 0, 0.52); gamer.root.rotation.y = Math.PI; scene.add(gamer.root); gamer.root.userData.allow = ['sofa'];
  const pad = new THREE.Group(); rbox(0.16, 0.04, 0.09, 0.02, M.col('#1a1a20', 0.4), 0, 0, 0, pad); for (const x of [-0.05, 0.05]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.015, 10), M.col('#444', 0.4)); st.position.set(x, 0.025, 0); pad.add(st); } scene.add(pad);
  // shelf with the protected bug under its dome
  const shelf = box(0.9, 0.04, 0.3, M.col('#4a3020', 0.6), 2.2, 1.5, -2.95, scene); void shelf;
  const bug = beetle({ s: 0.32 }); bug.position.set(2.2, 1.52, -2.92); scene.add(bug);
  const dome = glassDome(0.2); dome.position.set(2.2, 1.52, -2.92); scene.add(dome);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), M.emis('#ffd9a0', 4)); lamp.position.set(-2.4, 1.5, -2.6); scene.add(lamp);
  point(scene, '#ffb870', 12, 8, [-2.3, 1.6, -2.2]); point(scene, '#8ab8ff', 8, 5, [0, 1.2, -2.3]);
  const key = new THREE.SpotLight('#ffe6c0', 18, 9, 0.8, 0.6, 1.3); key.position.set(1.2, 2.9, 2.2); key.target.position.set(0, 0.8, -0.4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const hearts = []; for (let i = 0; i < 10; i++) { const h = heart(0.12); scene.add(h); hearts.push(h); }
  const love = sign('♥', { width: 0.6, color: '#ff3a6a', size: 200, pad: 10, emissive: 0.8 }); scene.add(love);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  const lh = new THREE.Vector3(), rh = new THREE.Vector3();
  function update(lt) {
    tv.userData.live.update(lt + 20);
    const laugh = Math.abs(Math.sin(lt * 10));
    gamer.pose({ hipsY: -0.42, lHip: [-80, 0, 6], rHip: [-80, 0, -6], lKnee: [80, 0, 0], rKnee: [80, 0, 0], lSh: [-35, 0, 14], rSh: [-35, 0, -14], lEl: [-75, -20, 0], rEl: [-75, 20, 0], lCurl: 0.6, rCurl: 0.6, spine: [-12 - 5 * laugh, 0, 0], head: [-6 - 8 * laugh, 0, 0] });
    idle2(gamer, lt, 3, 0.3); gamer.face({ blink: 0, brows: 0.7, smile: 1, mouth: 0.45 + 0.4 * laugh });
    gamer.root.updateMatrixWorld(true); gamer.J.lHand.group.getWorldPosition(lh); gamer.J.rHand.group.getWorldPosition(rh); pad.position.copy(lh).add(rh).multiplyScalar(0.5).add(V(0, -0.02, -0.04)); pad.rotation.set(0.6, Math.PI, 0);
    walkBug(bug, lt, 8); bug.rotation.y = Math.sin(lt * 2) * 0.6;
    hearts.forEach((h, i) => { const a = lt - 0.2 - i * 0.22; h.visible = a > 0; if (a <= 0) return; h.position.set(-0.6 + (i % 5) * 0.3 + Math.sin(a * 3 + i) * 0.06, 1.0 + a * 0.6, -2.85 + a * 0.5); h.scale.setScalar(0.12 * easeOutBack(clamp(a / 0.3), 2.5)); h.rotation.y = Math.sin(a * 4 + i) * 0.5; });
    const lk = easeOutBack(inv(2.8, 3.2, lt), 2.4); love.scale.setScalar(Math.max(0.001, lk)); love.visible = lt > 2.78; love.position.set(0, 1.85, -2.9);
    const f = kf(lt, [[0, [0.7, 1.45, 1.6], [0, 1.05, -2.9], 50, 0.02], [1.8, [-0.6, 1.25, -1.2], [-0.15, 1.0, 0.5], 50, -0.02], [3.81, [0.4, 1.8, 3.4], [0, 1.1, -1.4], 54, 0.0]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 4)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.9, envIntensity: 0.25 };
}
