import * as THREE from 'three';
import { idle, blinkAt, talk } from '../lib/human.js';
import { SIT } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { twitchLogo, COL } from '../lib/stream.js';
import { room } from '../lib/rooms.js';
import { sign, point } from '../lib/env.js';
import { box, rbox, poster } from '../lib/props.js';
import { TEX, M, V, setCam, inv, smooth, easeInOut, easeOutBack, easeOutElastic, shake, lerp, canvasTex, rng } from '../lib/util.js';

// 38.10–42.10  «Загвоздка была в том, что ни один из них никогда не смотрел Twitch.»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0d1216');
  const wallpaper = canvasTex('wp', 256, 256, (g, w, h) => { g.fillStyle = '#6a4a3a'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = x % 64 ? '#7a5644' : '#5c3e30'; g.fillRect(x, 0, 16, h); } for (let y = 12; y < h; y += 40) for (let x = 16; x < w; x += 64) { g.fillStyle = 'rgba(230,200,150,0.5)'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); } }, { repeat: [3, 2] });
  const R = room({ w: 6, d: 6, h: 3, wall: M.std({ map: wallpaper, roughness: 0.95 }), floor: M.std({ map: TEX.plywood([4, 4], '#5a3d26'), roughness: 0.7 }), ceil: M.col('#2a2018', 1), open: ['front'] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#ffd9b0', '#2a1e14', 0.7));
  // rug, sofa, table, lamp, plant, framed photos, old phone, tea
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.8, 40), M.std({ map: TEX.carpet([3, 3], '#7a2a2a'), roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.01, -0.3); rug.scale.set(1.3, 1, 1); rug.receiveShadow = true; scene.add(rug);
  const sofaM = M.std({ map: TEX.fabric([2, 1], '#8a5a3a'), roughness: 0.95 });
  rbox(2.3, 0.45, 0.95, 0.08, sofaM, 0, 0.3, -2.3, scene).castShadow = true;
  rbox(2.3, 0.75, 0.22, 0.08, sofaM, 0, 0.78, -2.72, scene).castShadow = true;
  for (const x of [-1.2, 1.2]) rbox(0.22, 0.6, 0.95, 0.08, sofaM, x, 0.45, -2.3, scene).castShadow = true;
  for (const x of [-0.55, 0.55]) rbox(1.0, 0.16, 0.75, 0.06, M.std({ map: TEX.fabric([1, 1], '#a06a44'), roughness: 1 }), x, 0.6, -2.28, scene);
  for (const x of [-0.5, 0.5]) { const c = rbox(0.42, 0.42, 0.14, 0.06, M.col(x < 0 ? '#c9a24a' : '#4a7a6a', 0.9), x * 1.55, 0.88, -2.5, scene); c.rotation.z = x * 0.3; }
  const table = rbox(1.1, 0.06, 0.6, 0.02, M.std({ map: TEX.plywood([1, 1], '#6a4a2e'), roughness: 0.5 }), 0, 0.45, -0.9, scene); table.castShadow = true;
  for (const x of [-0.5, 0.5]) for (const z of [-1.15, -0.65]) box(0.05, 0.45, 0.05, M.col('#3a2a1c', 0.6), x, 0.225, z, scene);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.08, 16), M.col('#f4f0e6', 0.3)); cup.position.set(-0.2, 0.52, -0.9); cup.castShadow = true; scene.add(cup);
  const oldPhone = new THREE.Group(); rbox(0.2, 0.08, 0.2, 0.03, M.col('#b02a2a', 0.4), 0, 0, 0, oldPhone); const handset = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.16, 4, 8), M.col('#b02a2a', 0.4)); handset.rotation.z = Math.PI / 2; handset.position.y = 0.06; oldPhone.add(handset); oldPhone.position.set(0.25, 0.52, -0.9); oldPhone.traverse((m) => { if (m.isMesh) m.castShadow = true; }); scene.add(oldPhone);
  const lampPole = box(0.05, 1.45, 0.05, M.col('#2a2018', 0.6), 1.95, 0.72, -2.4, scene); void lampPole;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.3, 18, 1, true), M.col('#f2d9a8', 0.8, 0, { side: THREE.DoubleSide, emissive: '#ffb870', emissiveIntensity: 0.6 })); shade.position.set(1.95, 1.55, -2.4); scene.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), M.emis('#ffd9a0', 5)); bulb.position.set(1.95, 1.48, -2.4); scene.add(bulb);
  point(scene, '#ffb870', 14, 8, [1.9, 1.5, -2.0]);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.25, 14), M.col('#9a5a3a', 0.8)); pot.position.set(-2.2, 0.13, -2.4); scene.add(pot);
  for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), M.col('#3a7a3a', 0.8)); l.scale.set(0.6, 1.5, 0.3); l.position.set(-2.2 + Math.sin(i * 1.7) * 0.15, 0.55 + (i % 3) * 0.15, -2.4 + Math.cos(i * 1.7) * 0.1); l.rotation.z = Math.sin(i * 1.7) * 0.5; scene.add(l); }
  const fr = poster((g, w, h) => { g.fillStyle = '#d8c8a8'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a7a4a'; g.fillRect(20, h * 0.5, w - 40, h * 0.3); g.fillStyle = '#7ab0e0'; g.fillRect(20, 20, w - 40, h * 0.5 - 20); g.fillStyle = '#f2c84a'; g.beginPath(); g.arc(w * 0.7, h * 0.25, 28, 0, 7); g.fill(); }, 0.8, 0.6); fr.position.set(-1.1, 1.9, -2.96); scene.add(fr);
  const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 28), M.col('#f4f0e6', 0.4)); clock.rotation.x = Math.PI / 2; clock.position.set(0.9, 2.1, -2.96); scene.add(clock);
  const key = new THREE.SpotLight('#ffe6c0', 22, 9, 0.75, 0.6, 1.3); key.position.set(-0.5, 2.9, 1.0); key.target.position.set(0, 0.9, -2.3); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0006; scene.add(key, key.target);
  // the couple: grandma knits, grandpa reads the paper
  const ga = mk.grandma(); ga.root.position.set(-0.55, 0.0, -2.3); scene.add(ga.root);
  const gp = mk.grandpa(); gp.root.position.set(0.55, 0.0, -2.3); scene.add(gp.root);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.5), M.std({ map: canvasTex('news', 128, 170, (g, w, h) => { g.fillStyle = '#e6e0d0'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = '16px Russo'; g.textAlign = 'center'; g.fillText('ГАЗЕТА', w / 2, 24); for (let i = 0; i < 9; i++) g.fillRect(10, 40 + i * 14, w - 20, 5); }, { repeat: [1, 1] }), roughness: 0.9, side: THREE.DoubleSide })); paper.castShadow = true; gp.J.rWr.add(paper); paper.position.set(-0.05, -0.12, 0.12); paper.rotation.set(-0.15, 0, 0);
  const yarn = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 12), M.col('#d04a5a', 0.9)); yarn.castShadow = true; scene.add(yarn);
  // forbidden Twitch logo
  const logo = twitchLogo(0.5, 0.4); const ban = new THREE.Group(); ban.add(logo);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.045, 12, 40), M.col('#ff2a3a', 0.35, 0, { emissive: '#ff2a3a', emissiveIntensity: 0.8 })); ban.add(ring);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.09, 0.09), ring.material); bar.rotation.z = -Math.PI / 4; ban.add(bar);
  ban.position.set(0, 2.0, -1.6); scene.add(ban);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const LG = 3.35;
  function update(lt) {
    ga.pose({ ...SIT, hipsY: -0.36, lSh: [-30, 0, 10], rSh: [-30, 0, -10], lEl: [-95 + Math.sin(lt * 5) * 6, 20, 0], rEl: [-95 - Math.sin(lt * 5) * 6, -20, 0], lCurl: 0.5, rCurl: 0.5, head: [22, Math.sin(lt * 0.7) * 10, 0], spine: [8, 0, 0] });
    idle(ga, lt, 3, 0.4); ga.face({ blink: blinkAt(lt, 2), brows: 0.1, smile: 0.4, mouth: 0.05, look: [0.15, -0.3] });
    gp.pose({ ...SIT, hipsY: -0.36, lSh: [-50, 0, 20], rSh: [-50, 0, -22], lEl: [-80, -20, 0], rEl: [-80, 20, 0], lCurl: 0.6, rCurl: 0.6, head: [10, Math.sin(lt * 0.5 + 2) * 12, 0] });
    idle(gp, lt, 6, 0.4); gp.face({ blink: blinkAt(lt, 5), brows: 0.1, smile: 0.2, mouth: lt > 1.3 && lt < 1.9 ? 0.4 : 0.03, look: [-0.1, -0.35] });
    ga.root.updateMatrixWorld(true); const wp = new THREE.Vector3(); ga.J.lHand.group.getWorldPosition(wp); yarn.position.set(wp.x - 0.05, 0.55, wp.z + 0.1);
    const k = easeOutElastic(inv(LG, LG + 0.6, lt)); ban.scale.setScalar(Math.max(0.001, k) * 1.0); ban.rotation.y = Math.sin(lt * 2) * 0.12; ban.visible = lt > LG - 0.02; ban.position.y = 2.0 + Math.sin(lt * 3) * 0.02;
    // orbit around the sofa from the left, pushing in and tilting up to the banned logo
    const c = easeInOut(inv(0, 4.0, lt));
    const ang = lerp(-0.85, 0.15, c); const rad = lerp(3.6, 2.7, c);
    const pos = V(Math.sin(ang) * rad, lerp(1.35, 1.7, c), -1.6 + Math.cos(ang) * rad).add(shake(lt, 0.004, 5, 3));
    setCam(camera, pos, V(0, lerp(0.95, 1.6, smooth(inv(2.6, 3.8, lt))), -2.2), 0.04 * Math.sin(lt * 0.8));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}
