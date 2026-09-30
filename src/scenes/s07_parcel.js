import * as THREE from 'three';
import { human, idle, blinkAt } from '../lib/human.js';
import { gameboy } from '../lib/gameboy.js';
import { sign, point } from '../lib/env.js';
import { cardboardBox, desk, box, hangingLamp } from '../lib/props.js';
import { room } from '../lib/rooms.js';
import { TEX, M, V, setCam, inv, smooth, easeInOut, easeOutBack, easeInCubic, lerp, clamp, shake, labelTex } from '../lib/util.js';

// 20.30–23.05  «Солдат отправил приставку обратно в Nintendo»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1e1812');
  const tentMat = M.std({ map: TEX.fabric([6, 3], '#a8946c'), roughness: 0.95, side: THREE.DoubleSide });
  const R = room({ w: 5, d: 5, h: 2.6, wall: tentMat, ceil: tentMat, floor: M.std({ map: TEX.plywood([4, 4], '#6b5236'), roughness: 0.9 }), open: [] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#ffe2b8', '#3a2a1a', 0.55));
  const lamp = hangingLamp('#ffd08a', 4); lamp.position.set(0.1, 2.2, 0.1); scene.add(lamp);
  const key = new THREE.SpotLight('#ffe0b0', 7, 6, 0.7, 0.6, 1.4); key.position.set(0.4, 2.3, 0.9); key.target.position.set(0, 0.9, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0006; scene.add(key, key.target);

  const tbl = desk(1.6, 0.9, 0.85, '#9a7a52'); scene.add(tbl);
  const bx = cardboardBox(0.34, 0.2, 0.26); bx.group.position.set(0, 0.88, 0.05); scene.add(bx.group);
  // shipping label on the front face
  const lbl = sign('lbl', { width: 0.22, color: '#1a1a1a', bg: '#f4f0e4', size: 64, pad: 22, lines: ['КОМУ: NINTENDO', 'REDMOND, WA, USA', 'ОТ: SGT. / 1991'], font: 'Russo' });
  lbl.position.set(0.02, 0.1, 0.132); bx.group.add(lbl);
  // tape roll, pen, letter
  const tape = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.02, 12, 24), M.col('#c9b27a', 0.4)); tape.rotation.x = Math.PI / 2; tape.position.set(0.45, 0.9, 0.15); tape.castShadow = true; scene.add(tape);
  const letter = sign('letter', { width: 0.2, color: '#1d2a6a', bg: '#f6f2e6', size: 46, pad: 26, lines: ['Nintendo,', 'можно ли хоть', 'что-то спасти?', ''], font: 'Russo' });
  letter.rotation.x = -Math.PI / 2; letter.rotation.z = 0.3; letter.position.set(-0.45, 0.885, 0.2); scene.add(letter);
  // stamp: wooden handle + rubber
  const stamp = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.1, 16), M.col('#6b3f1f', 0.5)); handle.position.y = 0.09; stamp.add(handle);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), M.col('#6b3f1f', 0.5)); knob.position.y = 0.15; stamp.add(knob);
  const base = box(0.16, 0.03, 0.07, M.col('#5a3a20', 0.6), 0, 0.03, 0, stamp); void base;
  const rub = box(0.155, 0.01, 0.065, M.col('#b01e1e', 0.7), 0, 0.01, 0, stamp); void rub;
  stamp.traverse((m) => { if (m.isMesh) m.castShadow = true; }); scene.add(stamp);
  const { tex } = labelTex('NINTENDO', { font: 'Russo', size: 120, color: '#c8141b', pad: 24, grunge: 0.6, border: '#c8141b' });
  const imprint = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.05), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -4 }));
  imprint.rotation.x = -Math.PI / 2; imprint.position.set(0, 0.88 + 0.2 + 0.008, 0.05); scene.add(imprint);

  const sol = human({ skin: '#d9a57f', top: 'uniform', pants: 'dcu', hair: '#4a3222', hairStyle: 'buzz', shoes: '#b39a72', eyeColor: '#3a5a7a' });
  sol.root.position.set(0, 0, -0.62); scene.add(sol.root);
  const gb = gameboy({ burnt: 1 }); scene.add(gb.group);
  const inBox = V(0, 0.9, 0.05);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.02, 50);
  const l = new THREE.Vector3(), r = new THREE.Vector3();
  const STAMP = 2.08;

  function update(lt) {
    const put = smooth(inv(0.15, 0.9, lt));
    const reach = Math.sin(clamp(inv(0.0, 1.2, lt)) * Math.PI);
    sol.pose({ spine: [18 + reach * 12, 0, 0], head: [30, 0, 0], lSh: [-55 - reach * 10, 0, 20], rSh: [-55 - reach * 10, 0, -20], lEl: [-45 + reach * 20, -20, 0], rEl: [-45 + reach * 20, 20, 0], lCurl: 0.5, rCurl: 0.5 });
    idle(sol, lt, 4, 0.3);
    sol.face({ blink: blinkAt(lt, 5), brows: -0.2, mouth: 0.05, look: [0, -0.3] });
    sol.root.updateMatrixWorld(true);
    sol.J.lHand.group.getWorldPosition(l); sol.J.rHand.group.getWorldPosition(r);
    const hands = l.clone().add(r).multiplyScalar(0.5).add(V(0, -0.02, 0.06));
    gb.group.position.lerpVectors(hands, inBox, put);
    gb.group.rotation.set(lerp(-0.6, -Math.PI / 2, put), 0.2, 0);
    // flaps close
    const fk = easeOutBack(inv(1.0, 1.45, lt), 1.3);
    bx.flaps.forEach(({ piv, s }) => { piv.rotation.x = s * lerp(-2.3, 0, fk) * -1; });
    // stamp slam
    const down = inv(STAMP - 0.3, STAMP, lt), up = inv(STAMP + 0.15, STAMP + 0.5, lt);
    const sy = lt < STAMP ? lerp(0.45, 0, easeInCubic(down)) : lerp(0, 0.35, smooth(up));
    stamp.position.set(0, 0.88 + 0.2 + 0.004 + sy, 0.05); stamp.rotation.y = 0.1 * (1 - down);
    stamp.visible = lt > STAMP - 0.35;
    imprint.visible = lt >= STAMP;
    imprint.scale.setScalar(lt >= STAMP ? 1 + 0.15 * Math.exp(-(lt - STAMP) * 12) : 1);
    // camera: over-the-table high angle, then drop onto the lid for the stamp
    const c = easeInOut(inv(0, 1.4, lt)), c2 = easeInOut(inv(1.45, 2.05, lt));
    const pos = V(0.95, 1.55, 0.85).lerp(V(0.6, 1.5, 0.6), c).lerp(V(0.2, 1.42, 0.38), c2);
    const look = V(-0.05, 0.98, -0.02).lerp(V(0, 1.08, 0.05), c2);
    const hit = lt > STAMP ? Math.exp(-(lt - STAMP) * 6) : 0;
    pos.add(shake(lt, 0.002 + hit * 0.02, 20, 7));
    setCam(camera, pos, look, 0.02);
    camera.fov = 52 - 8 * c2; camera.updateProjectionMatrix();
  }
  return { scene, camera, update, exposure: 0.85, bloom: 0.25, bloomThreshold: 0.95, envIntensity: 0.25 };
}
