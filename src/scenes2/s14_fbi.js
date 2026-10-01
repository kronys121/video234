import * as THREE from 'three';
import { idle, blinkAt } from '../lib/human.js';
import { STAND } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { monitor, twitchDraw, laptop, COL } from '../lib/stream.js';
import { room } from '../lib/rooms.js';
import { sign, point } from '../lib/env.js';
import { text3d } from '../lib/text3d.js';
import { desk, box } from '../lib/props.js';
import { TEX, M, V, setCam, inv, smooth, easeInOut, easeOutBack, easeOutCubic, shake, lerp, rng } from '../lib/util.js';

function botsDraw(g, w, h, t) {
  g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#9fb4d8'; g.font = `${h * 0.07}px Russo`; g.textAlign = 'center'; g.fillText('АНАЛИЗ ЗРИТЕЛЕЙ', w / 2, h * 0.1);
  const cx = w / 2, cy = h * 0.55, r = h * 0.3, f = Math.min(0.97, 0.2 + t * 0.35);
  g.fillStyle = '#2ecc71'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ff3b4a'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); g.fill();
  g.fillStyle = '#0b1220'; g.beginPath(); g.arc(cx, cy, r * 0.5, 0, 7); g.fill();
  g.fillStyle = '#ff6b78'; g.font = `${h * 0.1}px Russo`; g.fillText('БОТЫ', cx, cy + h * 0.035);
}
function netDraw(g, w, h, t) {
  g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h); const r = rng(5); const pts = []; for (let i = 0; i < 9; i++) pts.push([w * (0.12 + r() * 0.76), h * (0.15 + r() * 0.72)]);
  const c = [w / 2, h / 2];
  g.strokeStyle = 'rgba(255,90,100,0.7)'; g.lineWidth = 3; pts.forEach(([x, y], i) => { g.beginPath(); g.moveTo(x, y); g.lineTo(c[0], c[1]); g.stroke(); const k = (t * 0.7 + i * 0.13) % 1; g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(x + (c[0] - x) * k, y + (c[1] - y) * k, 7, 0, 7); g.fill(); g.fillStyle = '#9fb4d8'; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill(); });
  g.fillStyle = '#ff3b4a'; g.beginPath(); g.arc(c[0], c[1], 26, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = `${h * 0.08}px Russo`; g.textAlign = 'center'; g.fillText('ПЕРЕВОДЫ', w / 2, h * 0.08);
}

// 42.10–44.65  «За канал взялось ФБР, и выяснилось, что»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05080f');
  const R = room({ w: 6, d: 6, h: 3.2, wall: M.std({ color: '#0f1a2c', roughness: 0.9 }), floor: M.std({ map: TEX.tiles([6, 6], '#2a303c'), roughness: 0.4 }), ceil: M.col('#080c14', 1), open: ['front'] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#6a8ac8', '#0a0e18', 0.7));
  const mons = [
    monitor(1.5, twitchDraw({ viewers: 12480, grow: 60, seed: 12, chat: false, title: 'КАНАЛ ПОД НАБЛЮДЕНИЕМ' })),
    monitor(1.5, botsDraw), monitor(1.5, netDraw),
  ];
  mons.forEach((m, i) => { m.position.set(-1.7 + i * 1.7, 1.75, -2.85); m.rotation.y = (1 - i) * 0.22; scene.add(m); });
  const fbi = text3d('FBI', { family: 'mont', size: 0.5, depth: 0.1, bevel: 0.014, color: '#ffd21f', side: '#8a6a00', emissive: '#ffb000', emissiveIntensity: 0.4 }); fbi.position.set(0, 2.85, -2.9); scene.add(fbi);
  const tbl = desk(3.4, 0.8, 0.8, '#252a36'); tbl.position.set(0, 0, -2.2); scene.add(tbl);
  const lp = [laptop((g, w, h, t) => { g.fillStyle = '#05120a'; g.fillRect(0, 0, w, h); g.fillStyle = '#2dff6a'; g.font = `${h * 0.08}px Russo`; g.textAlign = 'left'; for (let i = 0; i < 8; i++) g.fillText('> ' + (Math.floor(t * 7 + i * 3) * 7919 % 100000), w * 0.05, h * (0.15 + i * 0.1)); }, 0.42)];
  lp[0].position.set(-0.7, 0.83, -2.15); lp[0].rotation.y = Math.PI; scene.add(lp[0]);
  point(scene, '#4a7aff', 16, 9, [-2.5, 2.4, 0]); point(scene, '#ffb870', 8, 7, [2.4, 1.6, -1.2]); point(scene, '#5a8aff', 12, 8, [0, 3.0, -2.0]);
  const key = new THREE.SpotLight('#dbe6ff', 30, 10, 0.85, 0.6, 1.3); key.position.set(0.5, 3.0, 1.5); key.target.position.set(0, 1.2, -1.8); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -0.0006; scene.add(key, key.target);
  const a1 = mk.agent('#d9a57f', '#111'), a2 = mk.agent('#8a5a3c', '#0a0a0a');
  a1.root.position.set(-0.55, 0, -1.45); a1.root.rotation.y = Math.PI + 0.1; a2.root.position.set(0.55, 0, -1.45); a2.root.rotation.y = Math.PI - 0.15; scene.add(a1.root, a2.root);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    mons.forEach((m) => m.userData.live.update(lt + 42)); lp[0].userData.live.update(lt);
    a1.pose({ ...STAND, spine: [14, 0, 0], head: [8, 0, 0], lSh: [-30, 0, 12], rSh: [-30, 0, -12], lEl: [-80, 0, 0], rEl: [-80, 0, 0], lCurl: 0.5, rCurl: 0.5 }); idle(a1, lt, 2, 0.4); a1.face({ blink: blinkAt(lt, 2), brows: 0.2 });
    const pt = smooth(inv(0.3, 0.7, lt));
    a2.pose({ ...STAND, lSh: [-25, 0, 20], lEl: [-95, 0, 0], rSh: [-95 * pt, 0, -10 - 15 * (1 - pt)], rEl: [-5, 0, 0], rCurl: 0.8, rThumb: 0.8, head: [-4, 10, 0] }); idle(a2, lt, 7, 0.3); a2.face({ blink: blinkAt(lt, 4), brows: 0.3 });
    const k = easeOutBack(inv(0.15, 0.65, lt), 2.2); fbi.scale.setScalar(Math.max(0.001, k)); fbi.rotation.y = (1 - Math.min(1, k)) * 1.3;
    // whip-style entry from the left, then slow push between the agents
    const c = easeInOut(inv(0, 2.55, lt)), e = easeOutCubic(inv(0, 0.5, lt));
    const pos = V(lerp(-3.0, -0.1, e) + 0.35 * c, lerp(1.7, 1.75, c), lerp(1.4, 0.35, c)).add(shake(lt, 0.004, 6, 5));
    setCam(camera, pos, V(lerp(-1.2, 0.0, e), 1.7, -2.9), 0.06 * (1 - e));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.9, envIntensity: 0.2 };
}
