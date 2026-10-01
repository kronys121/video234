import * as THREE from 'three';
import { idle, blinkAt } from '../lib/human.js';
import { TYPE } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { gamingChair, keyboard, livePlane, moneyPile, coin, COL } from '../lib/stream.js';
import { desk, box } from '../lib/props.js';
import { sign, point } from '../lib/env.js';
import { TEX, M, V, setCam, inv, smooth, easeInOut, easeOutBack, shake, lerp, rng } from '../lib/util.js';

// 22.70–26.90  «тогда как коллега с десятью тысячами зрителей зарабатывал куда меньше.»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0814');
  scene.fog = new THREE.Fog('#0a0814', 9, 30);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), M.std({ map: TEX.carpet([14, 14], '#1a1626'), roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#8a7ac8', '#20183a', 1.6));
  const key = new THREE.SpotLight('#ffe0b8', 150, 24, 0.95, 0.6, 1.2); key.position.set(0, 7, 6); key.target.position.set(0, 1, 0); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0005; scene.add(key, key.target);
  point(scene, COL.purple, 60, 14, [-3, 3, 2]); point(scene, COL.green, 50, 14, [3, 3, 2]); point(scene, '#ffb870', 30, 10, [0, 2, 3]);
  const mkStation = (x, who, accent) => {
    const dk = desk(1.5, 0.7, 0.76, '#2a2a34'); dk.position.set(x, 0, -0.15); scene.add(dk);
    const ch = gamingChair(accent); ch.position.set(x, 0, -0.95); scene.add(ch);
    const h = who(); h.root.position.set(x, 0, -0.95); scene.add(h.root);
    const kb = keyboard(accent); kb.position.set(x, 0.79, -0.45); scene.add(kb);
    return h;
  };
  const xq = -1.45, xc = 1.45;
  const hq = mkStation(xq, mk.quantum, COL.purple), hc = mkStation(xc, mk.colleague, COL.green);
  const bigPile = moneyPile(5, 7, 7, 0.95); bigPile.position.set(xq, 0.79, 0.03); scene.add(bigPile);
  const small = moneyPile(1, 2, 9, 0.95); small.position.set(xc + 0.35, 0.79, 0.03); scene.add(small);
  const r = rng(4); const coins = []; for (let i = 0; i < 6; i++) { const c = coin(0.028); c.position.set(xc - 0.35 + r() * 0.5, 0.805, -0.12 + r() * 0.25); c.rotation.x = Math.PI / 2 * 0 + (r() - 0.5) * 0.3; c.rotation.z = r() * 3; scene.add(c); coins.push(c); }
  const cq = sign('$ 10 000+', { width: 1.5, color: '#7dff9a', bg: '#07210f', size: 110, pad: 24, border: '#2ecc71', emissive: 0.7 }); cq.position.set(xq, 2.5, -0.9); scene.add(cq);
  const cc = sign('10 000 зрителей', { width: 1.7, color: '#ffffff', bg: COL.purple, size: 90, pad: 24, border: '#ffffff', emissive: 0.5 }); cc.position.set(xc, 2.5, -0.9); scene.add(cc);
  const lessSign = sign('меньше…', { width: 1.1, color: '#ff8a8a', bg: '#2a0a10', size: 100, pad: 22, border: '#ff3b4a', emissive: 0.6 }); lessSign.position.set(xc, 0.18 + 0.79 + 0.5, 0.05); lessSign.visible = false; scene.add(lessSign);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 80);
  function update(lt) {
    hq.pose({ ...TYPE, head: [4, 0, 0], rSh: [-150, 0, -15], rEl: [-10, 0, 0] }); idle(hq, lt, 3, 0.5);
    hq.face({ blink: blinkAt(lt, 2), brows: 0.5, smile: 0.9, mouth: 0.4 });
    const sad = smooth(inv(2.4, 3.0, lt));
    hc.pose({ ...TYPE, head: [10 + 12 * sad, 0, 4 * sad], spine: [8 + 10 * sad, 0, 0] }); idle(hc, lt, 5, 0.4);
    hc.face({ blink: blinkAt(lt, 4), brows: -0.6 * sad + 0.2, browTilt: 1 * sad, smile: -0.4 * sad, mouth: 0.0 });
    bigPile.children.forEach((s) => { const k = easeOutBack(inv(0.1 + s.userData.order * 0.004, 0.4 + s.userData.order * 0.004, lt), 2.0); s.scale.setScalar(Math.max(0.001, k)); });
    const kq = easeOutBack(inv(0.4, 0.85, lt), 2.2); cq.scale.setScalar(Math.max(0.001, kq));
    const kc = easeOutBack(inv(1.2, 1.65, lt), 2.2); cc.scale.setScalar(Math.max(0.001, kc)); cc.visible = lt > 1.18;
    small.children.forEach((s) => { const k = easeOutBack(inv(2.0, 2.4, lt), 2); s.scale.setScalar(Math.max(0.001, k)); });
    coins.forEach((c, i) => { const k = easeOutBack(inv(2.1 + i * 0.07, 2.4 + i * 0.07, lt), 2); c.scale.setScalar(Math.max(0.001, k)); });
    const ks = easeOutBack(inv(2.6, 3.0, lt), 2.2); lessSign.scale.setScalar(Math.max(0.001, ks)); lessSign.visible = lt > 2.58;
    // wide on both desks, then slide to the colleague and drop down to his tiny pile
    const a = easeInOut(inv(0.0, 1.4, lt)), b = easeInOut(inv(1.2, 4.0, lt));
    const pos = V(lerp(-0.9, 0.2, a) + 0.7 * b, lerp(2.4, 1.6, a) - 0.35 * b, lerp(7.2, 5.2, a) - 2.3 * b).add(shake(lt, 0.005, 5, 7));
    const look = V(lerp(-0.7, 0.2, a), 1.3, -0.4).lerp(V(xc, 1.15, -0.3), b);
    setCam(camera, pos, look, 0.04 * Math.sin(lt * 1.2));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.92, envIntensity: 0.15 };
}
