import * as THREE from 'three';
import { idle, blinkAt } from '../lib/human.js';
import { STAND } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { phone, creditCard, COL } from '../lib/stream.js';
import { room } from '../lib/rooms.js';
import { sign, point } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { TEX, M, V, setCam, inv, smooth, easeInOut, easeOutBack, easeOutElastic, shake, lerp, canvasTex, rng } from '../lib/util.js';

const ROWS = [['Twitch · Донат', 480], ['Twitch · Донат', 1250], ['Twitch · Донат', 300], ['Twitch · Донат', 900], ['Twitch · Донат', 1500], ['Twitch · Донат', 700]];
function bankDraw(g, w, h, t) {
  g.fillStyle = '#0f1722'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1b2a40'; g.fillRect(0, 0, w, h * 0.2);
  g.fillStyle = '#6fb0ff'; g.font = `${h * 0.05}px Russo`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('БАНК  ·  Счёт', w * 0.06, h * 0.05);
  let bal = 4820; const seen = Math.min(ROWS.length, Math.max(0, Math.floor((t - 0.15) / 0.3) + 1));
  for (let i = 0; i < seen; i++) bal -= ROWS[i][1];
  bal = Math.max(0, bal + 2000 - 2000); const frac = ((t - 0.15) / 0.3) % 1;
  g.fillStyle = '#ffffff'; g.font = `${h * 0.085}px Russo`; g.fillText('$ ' + String(Math.max(0, 4820 - ROWS.slice(0, seen).reduce((a, b) => a + b[1], 0)) ).replace(/\B(?=(\d{3})+(?!\d))/g, ' '), w * 0.06, h * 0.14);
  void frac;
  for (let i = 0; i < seen; i++) {
    const y = h * 0.24 + i * h * 0.1; const k = Math.min(1, (t - 0.15 - i * 0.3) / 0.15);
    g.globalAlpha = Math.max(0, k); g.fillStyle = '#1b2434'; g.fillRect(w * 0.04, y, w * 0.92, h * 0.085);
    g.fillStyle = '#e8eef8'; g.font = `${h * 0.036}px Russo`; g.fillText(ROWS[i][0], w * 0.07, y + h * 0.042);
    g.fillStyle = '#ff5a6a'; g.textAlign = 'right'; g.font = `${h * 0.046}px Russo`; g.fillText('−$ ' + ROWS[i][1], w * 0.94, y + h * 0.042); g.textAlign = 'left'; g.globalAlpha = 1;
  }
  const alert = (t * 3) % 1 < 0.5 && t > 0.3; if (alert) { g.fillStyle = 'rgba(255,60,80,0.18)'; g.fillRect(0, 0, w, h); }
}

// 29.60–32.25  «…с чьих карт списывали крупные суммы денег.»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0d1216');
  const R = room({ w: 5, d: 6, h: 3, wall: M.std({ color: '#2a3a3a', roughness: 0.95 }), floor: M.std({ map: TEX.plywood([4, 4], '#6b4a2e'), roughness: 0.7 }), ceil: M.col('#1a1a1a', 1), open: ['front'], cz: 0 }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#a8c8d8', '#2a2018', 0.6));
  // window + lamp + plant
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.0), M.emis('#243a66', 0.9)); win.position.set(-1.5, 1.7, -2.97); scene.add(win);
  box(1.4, 1.1, 0.04, M.col('#e8e0d0', 0.6), -1.5, 1.7, -3.0, scene);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), M.emis('#ffd9a0', 4)); lamp.position.set(1.5, 1.55, -2.7); scene.add(lamp);
  rbox(0.1, 1.2, 0.1, 0.02, M.col('#3a2a1c', 0.6), 1.5, 0.6, -2.7, scene);
  point(scene, '#ffbf80', 16, 9, [1.4, 1.7, -2.2]); point(scene, '#7a9aff', 4, 6, [-1.5, 1.7, -2.4]);
  const key = new THREE.SpotLight('#fff0dc', 18, 9, 0.8, 0.6, 1.4); key.position.set(0.5, 2.9, 2.2); key.target.position.set(0, 1.3, 0); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0006; scene.add(key, key.target);
  const v = mk.victimA(); v.root.position.set(0, 0, -0.6); scene.add(v.root);
  const ph = phone(bankDraw, 0.11); scene.add(ph);
  const cardIn = creditCard('#1b4b9a', '4276 5500 1200 9087', 1.5); v.J.lWr.add(cardIn); cardIn.position.set(0, -0.1, 0.05); cardIn.rotation.set(Math.PI / 2, 0, 0.3);
  const ex = sign('!', { width: 0.5, color: '#ffffff', bg: '#e02a3a', size: 180, pad: 24, border: '#ffffff', emissive: 0.5 }); ex.position.set(0.6, 2.25, -0.5); scene.add(ex);
  const camera = new THREE.PerspectiveCamera(46, 1080 / 1920, 0.03, 40);
  const lh = new THREE.Vector3(), rh = new THREE.Vector3();
  function update(lt) {
    const out = smooth(inv(0.0, 0.5, lt));
    v.pose({ ...STAND, lSh: [-45, 0, 25], lEl: [-70, 0, 0], rSh: [-60 * out - 10, 15 * out, -14], rEl: [-35 * out - 10, 20 * out, 0], rCurl: 0.5, head: [0, Math.sin(lt * 25) * 1.2, 0], spine: [-4, 0, 0] });
    idle(v, lt, 4, 0.4);
    v.face({ blink: Math.max(0, Math.sin(lt * 4.5) - 0.95) * 20, brows: 1, mouth: 0.75, smile: -0.8, look: [0, -0.1] });
    v.root.updateMatrixWorld(true);
    v.J.rHand.group.getWorldPosition(rh); v.J.lHand.group.getWorldPosition(lh);
    ph.position.copy(rh).add(V(-0.02, 0.02, 0.12)); ph.rotation.set(-0.1, 0, 0.05);
    ph.userData.live.update(lt);
    const k = easeOutElastic(inv(0.5, 1.1, lt)); ex.scale.setScalar(Math.max(0.001, k)); ex.rotation.z = Math.sin(lt * 14) * 0.08; ex.visible = lt > 0.48;
    // push-in from his face to the screen
    const c = easeInOut(inv(0.2, 2.5, lt));
    const pos = V(lerp(0.3, 0.04, c), lerp(1.65, 1.45, c), lerp(1.7, 0.45, c)).add(shake(lt, 0.004 + 0.006 * c, 12, 3));
    const target = ph.position.clone();
    setCam(camera, pos, V(0, 1.55, -0.6).lerp(target, c), 0.04 * Math.sin(lt * 2) - 0.03 * c);
    camera.fov = lerp(46, 40, c); camera.updateProjectionMatrix();
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.2 };
}
