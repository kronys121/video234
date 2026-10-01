import * as THREE from 'three';
import { idle, blinkAt, talk } from '../lib/human.js';
import { TYPE, STAND } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { creditCard, laptop, COL } from '../lib/stream.js';
import { room } from '../lib/rooms.js';
import { sign, point } from '../lib/env.js';
import { text3d } from '../lib/text3d.js';
import { box, rbox, poster } from '../lib/props.js';
import { TEX, M, V, setCam, inv, smooth, easeInOut, easeOutBack, shake, lerp, canvasTex } from '../lib/util.js';

// 26.90–29.60  «Примерно в это же время в полицию стали обращаться…»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a1014');
  const R = room({ w: 7, d: 7, h: 3.2, wall: M.std({ color: '#1f3a44', roughness: 0.9 }), floor: M.std({ map: TEX.tiles([6, 6], '#8d9296'), roughness: 0.45 }), ceil: M.col('#c9cfd0', 0.9), open: ['back'] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#cfe6f0', '#2a2218', 0.7));
  // counter between the officer (z<0) and the people (z>0)
  rbox(4.6, 1.05, 0.55, 0.03, M.std({ map: TEX.plywood([3, 1], '#7a5230'), roughness: 0.6 }), 0, 0.525, 0, scene).castShadow = true;
  rbox(4.7, 0.06, 0.7, 0.02, M.col('#3a2a1c', 0.4), 0, 1.08, 0, scene);
  const mon = laptop((g, w, h, t) => { g.fillStyle = '#10243a'; g.fillRect(0, 0, w, h); g.fillStyle = '#6fb0ff'; g.font = `${h * 0.1}px Russo`; g.textAlign = 'left'; g.fillText('ЗАЯВЛЕНИЕ № ' + (4200 + Math.floor(t * 3)), w * 0.06, h * 0.2); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(160,200,255,0.5)'; g.fillRect(w * 0.06, h * (0.3 + i * 0.11), w * (0.5 + (i * 37 % 40) / 100), h * 0.04); } }, 0.5);
  mon.position.set(0.25, 1.11, -0.05); mon.rotation.y = Math.PI; scene.add(mon);
  const lampMesh = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), M.emis('#ffd9a0', 4)); lampMesh.position.set(-1.6, 1.4, -0.1); scene.add(lampMesh);
  // wall: ПОЛИЦИЯ letters + bulletin board
  const pol = text3d('ПОЛИЦИЯ', { family: 'mont', size: 0.5, depth: 0.1, bevel: 0.012, color: '#ffffff', side: '#2a5ab8', emissive: '#4a8aff', emissiveIntensity: 0.35 });
  pol.position.set(0, 2.4, 3.4); pol.rotation.y = Math.PI; scene.add(pol);
  const bb = box(1.6, 1.0, 0.04, M.col('#8a6a3a', 0.9), -2.3, 1.7, 3.45, scene);
  const notice = sign('ЗАЯВЛЕНИЯ', { width: 1.2, color: '#1a1a1a', bg: '#f0ece0', size: 90, pad: 20 }); notice.position.set(-2.3, 1.75, 3.42); notice.rotation.y = Math.PI; scene.add(notice); void bb;
  const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 28), M.col('#f4f0e6', 0.4)); clock.rotation.x = Math.PI / 2; clock.position.set(-2.9, 2.9, 3.42); scene.add(clock);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 8, 28), M.col('#1a1a1a', 0.5)); rim.position.set(-2.9, 2.9, 3.4); scene.add(rim);
  const hand = box(0.02, 0.16, 0.01, M.col('#111', 0.5)); hand.position.set(-2.9, 2.9, 3.38); scene.add(hand);
  // officer + three victims
  const off = mk.officer(); off.root.position.set(0.25, 0, -0.75); scene.add(off.root);
  const vs = [mk.victimA(), mk.victimB(), mk.victimC()]; const xs = [-1.05, -0.1, 0.9];
  vs.forEach((v, i) => { v.root.position.set(xs[i], 0, 0.95 + (i === 1 ? 0.1 : 0)); v.root.rotation.y = Math.PI + (i - 1) * 0.15; scene.add(v.root); });
  const cards = vs.map((v, i) => { const c = creditCard(['#1b4b9a', '#8a1b2a', '#1b6a3a'][i], '4276 5500 ' + (1200 + i * 777) + ' 9087', 1.6); v.J.rWr.add(c); c.position.set(0, -0.1, 0.06); c.rotation.set(Math.PI / 2 - 0.2, 0, 0.2); return c; });
  point(scene, '#ffcf94', 14, 8, [-1.6, 1.8, 0.4]); point(scene, '#bfe0ff', 10, 8, [1.5, 2.8, 2.2]);
  const key = new THREE.SpotLight('#fff2dc', 30, 10, 0.9, 0.6, 1.3); key.position.set(0, 3.1, 1.2); key.target.position.set(0, 1.0, 0.2); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0006; scene.add(key, key.target);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    mon.userData.live.update(lt + 27);
    off.pose({ ...TYPE, hipsY: -0.36, lSh: [-28, 0, 10], rSh: [-28, 0, -10], head: [10, 12 * Math.sin(lt * 0.9), 0] }); idle(off, lt, 4, 0.4);
    off.face({ blink: blinkAt(lt, 2), brows: 0.2, mouth: talk(lt, 5, 0.3) });
    vs.forEach((v, i) => {
      const up = smooth(inv(0.1 + i * 0.15, 0.5 + i * 0.15, lt));
      v.pose({ ...STAND, rSh: [-80 * up, 0, -15 - 20 * (1 - up)], rEl: [-50 * up - 10, 0, 0], rCurl: 0.5, lSh: [-30 * i % 60, 0, 25], lEl: [-60, 0, 0], head: [-5, Math.sin(lt * 5 + i) * 6, 0], spine: [Math.sin(lt * 6 + i) * 2, 0, 0] });
      idle(v, lt, i + 8, 0.5);
      v.face({ blink: blinkAt(lt, i + 1), brows: 0.7, browTilt: 1, mouth: 0.35 + 0.5 * Math.abs(Math.sin(lt * 9 + i * 2)), smile: -0.5, look: [0, 0.05] });
    });
    cards.forEach((c, i) => { c.visible = true; });
    hand.rotation.z = -lt * 0.5;
    // behind the officer's shoulder, then pushing in on the people
    const c = easeInOut(inv(0, 2.7, lt));
    const pos = V(lerp(-2.4, -0.9, c), lerp(2.0, 1.55, c), lerp(-2.6, -1.0, c)).add(shake(lt, 0.006, 5, 8));
    setCam(camera, pos, V(lerp(-0.2, -0.2, c), 1.35, 1.0), 0.05 * (1 - c));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}
