import * as THREE from 'three';
import { mk, miniPerson, cheer } from '../lib/cast.js';
import { COL } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { rbox, box } from '../lib/props.js';
import { canvasTex, M, V, setCam, inv, smooth, easeInOut, easeOutElastic, easeOutBack, shake, lerp, glowTex, sprite } from '../lib/util.js';

// 13.00–16.05  «Зрителей у него было не так много, как у топовых спидранеров,»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0814');
  scene.fog = new THREE.Fog('#0a0814', 10, 34);
  const grid = canvasTex('grid2', 512, 512, (g, w, h) => { g.fillStyle = '#120f22'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3b2a7a'; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * w / 8, 0); g.lineTo(i * w / 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 8); g.lineTo(w, i * h / 8); g.stroke(); } }, { repeat: [14, 14] });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.std({ map: grid, roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#7a6ab8', '#150f24', 0.9));
  const key = new THREE.SpotLight('#ffe0b8', 60, 24, 0.7, 0.6, 1.2); key.position.set(2, 9, 6); key.target.position.set(0, 1.5, 0); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0005; scene.add(key, key.target);
  point(scene, COL.purple, 40, 14, [-3, 3, 2]); point(scene, COL.cyan, 25, 14, [4, 4, 1]); point(scene, '#ffb870', 18, 10, [0, 2, 4]);

  const barQ = rbox(1.5, 1, 1.5, 0.06, M.col('#8a52ff', 0.35, 0.1, { emissive: '#5a2ad8', emissiveIntensity: 0.25 }), -1.15, 0.5, 0, scene); barQ.castShadow = true;
  const barT = rbox(1.5, 1, 1.5, 0.06, M.col('#4a5a8a', 0.4, 0.2), 1.15, 0.5, 0, scene); barT.castShadow = true;
  const hQ = 1.2, hT = 4.6;
  const q = mk.quantum(); q.root.scale.setScalar(0.45); scene.add(q.root);
  const crowd = []; for (let i = 0; i < 6; i++) { const p = miniPerson(i + 40); p.scale.setScalar(0.7); scene.add(p); crowd.push(p); }
  const lbQ = sign('КВАНТУМ', { width: 1.4, color: '#ffffff', bg: '#5a2ad8', size: 100, pad: 24 }); lbQ.position.set(-1.15, 0.45, 0.77); scene.add(lbQ);
  const lbT = sign('ТОП-СПИДРАНЕРЫ', { width: 1.45, color: '#ffffff', bg: '#34406a', size: 78, pad: 22 }); lbT.position.set(1.15, 0.45, 0.77); scene.add(lbT);
  const cnt = sign('10 000+', { width: 1.9, color: '#ffffff', bg: COL.purple, size: 120, pad: 26, border: '#ffffff', emissive: 0.5 }); scene.add(cnt);
  const eye = sprite(glowTex('rgba(255,255,255,1)'), COL.purple, 2.2, true, 0.5); eye.position.set(1.15, hT, 0); scene.add(eye);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.1, 100);
  const TQ = 0.15, TT = 1.55;
  function update(lt) {
    const kq = easeOutElastic(inv(TQ, TQ + 0.7, lt)), kt = easeOutElastic(inv(TT, TT + 0.8, lt));
    const hq = Math.max(0.001, hQ * kq), ht = Math.max(0.001, hT * kt);
    barQ.scale.y = hq; barQ.position.y = hq / 2; barT.scale.y = ht; barT.position.y = ht / 2;
    q.root.position.set(-1.15, hq, 0); q.root.rotation.y = 0.15;
    q.pose({ lSh: [-20, 0, 35], rSh: [-20, 0, -35], lEl: [-70, 40, 0], rEl: [-70, -40, 0], lCurl: 0.1, rCurl: 0.1, head: [8, 0, 6] });
    q.face({ blink: Math.max(0, Math.sin(lt * 3) - 0.9) * 10, brows: 0.5, smile: 0.3, mouth: 0.1 });
    crowd.forEach((p, i) => { p.position.set(1.15 + (i % 3 - 1) * 0.42, ht, (Math.floor(i / 3) - 0.5) * 0.5); p.userData.y0 = ht; p.rotation.y = (i - 3) * 0.12; cheer(p, lt, kt > 0.1 ? 1 : 0); p.visible = lt > TT; });
    lbQ.scale.setScalar(Math.max(0.001, easeOutBack(inv(TQ + 0.3, TQ + 0.7, lt)))); lbT.scale.setScalar(Math.max(0.001, easeOutBack(inv(TT + 0.2, TT + 0.6, lt))));
    cnt.position.set(1.15, ht + 1.5, 0.3); cnt.scale.setScalar(Math.max(0.001, easeOutBack(inv(TT + 0.6, TT + 1.0, lt), 2.2))); eye.position.y = ht + 1.5; eye.material.opacity = 0.5 * smooth(inv(TT + 0.6, TT + 1.0, lt));
    // camera: starts low on Quantum's short bar, then rockets up the tall bar
    const a = easeInOut(inv(0, 1.4, lt)), b = easeInOut(inv(1.3, 2.7, lt));
    const pos = V(-0.2 - 1.2 * (1 - a) + 0.5 * b, 1.6 + 0.2 * a + 1.5 * b, 5.6 + 0.8 * b).add(shake(lt, 0.006, 5, 3));
    const look = V(-1.15, 1.25, 0).lerp(V(0.2, 1.8, 0), b).lerp(V(1.15, 4.2, 0), smooth(inv(1.5, 3.0, lt)));
    setCam(camera, pos, look, 0.06 * Math.sin(lt * 1.5) - 0.08 * b);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.9, envIntensity: 0.15 };
}
