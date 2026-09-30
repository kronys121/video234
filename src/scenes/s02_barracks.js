import * as THREE from 'three';
import { human, idle, blinkAt, walkPose } from '../lib/human.js';
import { SIT, HOLD, STAND, mix } from '../lib/poses.js';
import { gameboy, gbScreen } from '../lib/gameboy.js';
import { bunkBed, footlocker, hangingLamp, box } from '../lib/props.js';
import { room, usFlag, calendar, beams } from '../lib/rooms.js';
import { sign, point } from '../lib/env.js';
import { M, V, setCam, path, inv, smooth, easeInOut, easeOutBack, pop, lerp } from '../lib/util.js';

// 4.07–7.45  «американский солдат оставил свой Game Boy в казарме, которая позже»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a120c');
  const R = room({ w: 6.4, d: 11, h: 3, open: [] }); R.position.z = -3; scene.add(R);
  scene.add(beams(6.4, 11, 3, M.col('#6e4f30', 0.85), 1.4).translateZ(-3));
  scene.add(new THREE.HemisphereLight('#ffdcb0', '#3a2616', 0.5));

  // bunks: right row (hero) and left row
  const beds = [];
  for (const [x, z, ry] of [[2.1, 0, -Math.PI / 2], [2.1, -2.4, -Math.PI / 2], [2.1, -4.8, -Math.PI / 2], [-2.1, 0.2, Math.PI / 2], [-2.1, -2.3, Math.PI / 2], [-2.1, -4.8, Math.PI / 2]]) {
    const b = bunkBed(); b.position.set(x, 0, z); b.rotation.y = ry; scene.add(b); beds.push(b);
  }
  for (const [x, z, ry] of [[0.7, -2.4, -Math.PI / 2], [-0.75, 0.2, Math.PI / 2], [-0.75, -4.8, Math.PI / 2]]) { const f = footlocker('US ARMY'); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); }
  // wall details
  const flag = usFlag(1.6); flag.position.set(-0.4, 1.9, -8.45); scene.add(flag);
  const plaque = sign('КАЗАРМА  № 7', { width: 1.9, color: '#f1e6c8', bg: '#3c4a30', size: 110, pad: 34, grunge: 0.35, border: '#f1e6c8' });
  plaque.position.set(3.18, 2.15, -1.2); plaque.rotation.y = -Math.PI / 2; scene.add(plaque);
  const cal = calendar('ЯНВАРЬ', '1991'); cal.position.set(3.18, 1.65, 0.9); cal.rotation.y = -Math.PI / 2; scene.add(cal);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.std({ color: '#b39a72', roughness: 0.9 }));
  helmet.position.set(1.15, 1.72, -0.45); helmet.castShadow = true; scene.add(helmet);
  // window with night outside
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), M.emis('#253a66', 0.8)); win.position.set(-3.18, 1.9, -1.2); win.rotation.y = Math.PI / 2; scene.add(win);
  box(0.06, 0.8, 1.3, M.col('#4a3522', 0.8), -3.16, 1.9, -1.2, scene).material.transparent = false;
  // radio on footlocker
  const radio = new THREE.Group(); box(0.32, 0.18, 0.12, M.col('#2f3a2a', 0.5, 0.3), 0, 0.09, 0, radio); box(0.2, 0.08, 0.01, M.col('#111', 0.4), 0, 0.1, 0.061, radio);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.5, 4), M.col('#aaa', 0.3, 0.9)); ant.position.set(0.12, 0.4, 0); ant.rotation.z = -0.4; radio.add(ant);
  radio.position.set(-0.75, 0.42, 0.2); radio.rotation.y = 0.5; radio.traverse((m) => { if (m.isMesh) m.castShadow = true; }); scene.add(radio);

  // lights: warm hanging lamps + one shadow key
  const lamps = [];
  for (const z of [0.8, -2.2, -5.5]) { const l = hangingLamp('#ffc47a', 3); l.position.set(0.3, 2.45, z); scene.add(l); lamps.push(l); }
  const key = new THREE.SpotLight('#ffcf94', 14, 12, 0.9, 0.6, 1.4); key.position.set(0.3, 2.8, 1.8); key.target.position.set(1.8, 0.5, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0008; key.shadow.radius = 4; scene.add(key, key.target);
  point(scene, '#6d8cff', 1.2, 6, [-2.6, 1.9, -1.2]);

  // hero sitting on lower bunk, facing +z
  const hero = human({ skin: '#d9a57f', top: 'uniform', pants: 'dcu', hair: '#4a3222', hairStyle: 'buzz', shoes: '#b39a72', eyeColor: '#3a5a7a' });
  hero.root.position.set(1.8, 0, 0.32); scene.add(hero.root);
  // buddy on the next bunk, facing +z, writing a letter
  const bud = human({ skin: '#8a5a3c', top: 'tshirt', topColor: '#5b6340', pants: 'dcu', hair: '#1a1210', hairStyle: 'buzz', shoes: '#b39a72', eyeColor: '#2a1a10' });
  bud.root.position.set(-1.7, 0, 0.55); bud.root.rotation.y = 0.5; scene.add(bud.root);
  const letter = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), M.col('#f4efe0', 0.9, 0, { side: THREE.DoubleSide })); bud.J.lWr.add(letter); letter.position.set(-0.03, -0.12, 0.05); letter.rotation.set(-1.1, 0, 0);

  const gb = gameboy(); scene.add(gb.group);
  const gbGlow = point(scene, '#b8e06a', 0, 1.2, [0, 0, 0]);
  const pillowSpot = V(2.35, 0.6, 0.12);

  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.02, 100);
  const hands = new THREE.Vector3(), l = new THREE.Vector3(), r = new THREE.Vector3();

  function update(lt) {
    // --- hero animation
    const place = smooth(inv(0.95, 1.6, lt));     // put console down beside him
    const rise = smooth(inv(1.75, 2.4, lt));      // stand up
    const walk = inv(2.3, 3.5, lt);
    let p = { ...SIT, ...HOLD };
    p = mix(p, { ...SIT, rSh: [-35, 0, -40], rEl: [-30, 0, 0], rCurl: 0.4, lSh: [-10, 0, 10], lEl: [-40, 0, 0], head: [15, -35, 0], spine: [15, -20, 0] }, place);
    if (rise > 0) p = mix(p, STAND, rise);
    if (walk > 0) p = mix(p, walkPose(walk * 2.3, 0.9), Math.min(1, walk * 4));
    hero.pose(p);
    idle(hero, lt, 3, 0.5);
    hero.face({ blink: blinkAt(lt, 1), smile: 0.6 * (1 - place), mouth: 0.05, look: [0, place ? -0.1 : -0.25] });
    hero.root.position.set(1.8 - walk * 1.2, 0, 0.32 + rise * 0.3 + walk * 1.6);
    hero.root.rotation.y = lerp(0, -0.9, smooth(inv(2.2, 2.6, lt)));

    // --- console position: follow hands, then settle on the blanket
    hero.root.updateMatrixWorld(true);
    hero.J.lHand.group.getWorldPosition(l); hero.J.rHand.group.getWorldPosition(r);
    hands.copy(l).add(r).multiplyScalar(0.5).add(V(0, -0.02, 0.05));
    const inHand = V().copy(hands);
    const k = smooth(inv(1.0, 1.6, lt));
    gb.group.position.lerpVectors(inHand, pillowSpot, k);
    gb.group.position.y += Math.sin(k * Math.PI) * 0.12;
    // tilted toward the face while playing, then lying face up
    gb.group.rotation.set(lerp(-0.95, -Math.PI / 2 + 0.1, k), lerp(0, 0.6, k), 0);
    // settle bounce
    const bounce = inv(1.6, 1.9, lt); if (bounce > 0 && bounce < 1) gb.group.position.y += Math.sin(bounce * Math.PI) * 0.02;
    gbScreen(gb, 'tetris', lt + 3, 1);
    gbGlow.position.copy(gb.group.position).add(V(0, 0.08, 0.05)); gbGlow.intensity = 0.25;
    // press buttons while playing
    gb.parts.ab[1].position.z = 0.0178 - (lt < 0.9 && Math.sin(lt * 20) > 0.5 ? 0.0012 : 0);

    // --- buddy
    bud.pose({ ...SIT, lSh: [-45, 0, 10], lEl: [-70, 0, 0], rSh: [-30, 0, -20], rEl: [-80, 30, 0], rCurl: 0.7, head: [20 - 25 * smooth(inv(1.8, 2.3, lt)), 25 * smooth(inv(1.8, 2.3, lt)), 0] });
    idle(bud, lt, 7, 0.4);
    bud.face({ blink: blinkAt(lt, 4), brows: 0.3 * smooth(inv(1.8, 2.3, lt)), smile: 0.4 });

    // --- camera: 3/4 orbit, then push-in onto the console
    const c1 = easeInOut(inv(0, 2.2, lt));
    const c2 = easeInOut(inv(2.1, 3.38, lt));
    const pos = path([[0.55, 1.35, 2.7], [0.95, 1.25, 2.45], [1.4, 1.15, 2.2]], c1).lerp(V(2.28, 0.9, 0.72), c2);
    const look = V(1.8, 0.95, 0.2).lerp(V(2.35, 0.62, 0.1), smooth(inv(1.2, 2.8, lt)));
    setCam(camera, pos, look, 0.02 * Math.sin(lt));
    camera.fov = lerp(52, 44, c2); camera.updateProjectionMatrix();
    lamps.forEach((lp, i) => { lp.rotation.z = Math.sin(lt * 1.3 + i) * 0.04; });
  }
  return { scene, camera, update, exposure: 0.9, bloom: 0.3, bloomThreshold: 0.95, envIntensity: 0.25 };
}
