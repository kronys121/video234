import * as THREE from 'three';
import { idle, blinkAt } from '../lib/human.js';
import { TYPE } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { streamRoom, twitchDraw, livePlane, moneyPile, COL } from '../lib/stream.js';
import { text3d } from '../lib/text3d.js';
import { V, setCam, inv, smooth, easeInOut, easeOutBack, easeOutElastic, shake, lerp } from '../lib/util.js';

// 19.05–22.70  «за один стрим по спидрану Марио он собирал десятки тысяч долларов,»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0912');
  const draws = [twitchDraw({ viewers: 14800, grow: 90, seed: 7, chat: false, title: 'СПИДРАН · WORLD RECORD PACE' }), twitchDraw({ viewers: 14800, grow: 90, seed: 8, game: false })];
  const S = streamRoom(scene, { faceCam: false, draws });
  const q = mk.quantum(); q.root.position.set(0, 0, S.seatZ); q.root.rotation.y = Math.PI; scene.add(q.root);
  const pile = moneyPile(4, 6, 3, 1.25); pile.position.set(0.88, S.dTop, S.deskZ + 0.05); scene.add(pile);
  const pile2 = moneyPile(3, 4, 5, 1.25); pile2.position.set(-0.85, S.dTop, S.deskZ + 0.1); scene.add(pile2);
  const total = livePlane(1.5, 0.5, (g, w, h, t) => {
    g.fillStyle = '#07210f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2ecc71'; g.lineWidth = 6; g.strokeRect(5, 5, w - 10, h - 10);
    const v = Math.min(10000, Math.max(0, (t - 1.6) / 1.6) * 10000);
    g.fillStyle = '#7dff9a'; g.font = `${h * 0.56}px Russo`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('$ ' + String(Math.round(v / 10) * 10).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (v >= 10000 ? '+' : ''), w / 2, h / 2 + 4);
  }, { px: 768, emissive: 1.2 });
  total.position.set(0, 2.15, S.backZ + 0.6); scene.add(total);
  const dollar = text3d('$', { family: 'mont', size: 0.5, depth: 0.1, bevel: 0.015, color: '#2ecc71', side: '#0b6a30', emissive: '#2ecc71', emissiveIntensity: 0.5 });
  dollar.position.set(-1.35, 1.9, S.backZ + 0.7); scene.add(dollar);
  const dollar2 = dollar.clone(); dollar2.position.set(1.35, 2.1, S.backZ + 0.7); scene.add(dollar2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 80);
  const PILE = 1.5;
  function update(lt) {
    S.update(lt + 19);
    q.pose({ ...TYPE, head: [4 + Math.sin(lt * 7) * 1.5, 0, 0], lSh: [-26 - Math.sin(lt * 9) * 3, 0, 8], rSh: [-26 + Math.sin(lt * 9 + 1) * 3, 0, -8] });
    idle(q, lt + 3, 7, 0.4);
    q.face({ blink: blinkAt(lt, 1), brows: 0.2, smile: 0.2, mouth: 0.05 });
    [pile, pile2].forEach((p, pi) => p.children.forEach((s) => { const k = easeOutBack(inv(PILE + s.userData.order * 0.015 + pi * 0.15, PILE + 0.25 + s.userData.order * 0.015 + pi * 0.15, lt), 2.2); s.scale.setScalar(Math.max(0.001, k)); }));
    total.userData.live.update(lt);
    const k = easeOutElastic(inv(PILE, PILE + 0.7, lt)); total.scale.setScalar(Math.max(0.001, k)); dollar.scale.setScalar(Math.max(0.001, k)); dollar2.scale.setScalar(Math.max(0.001, k));
    dollar.rotation.y = lt * 1.6; dollar2.rotation.y = -lt * 1.6;
    // close on the run, then pull back and up to reveal the pile
    const a = easeInOut(inv(0, 1.7, lt)), b = easeInOut(inv(1.2, 3.5, lt));
    const pos = V(1.0 - 0.1 * a - 0.75 * b, 1.4 + 0.1 * a + 0.5 * b, -1.05 + 0.4 * b + 0.8 * b).add(shake(lt, 0.004, 6, 5));
    const look = V(0.37, 1.18, S.deskZ - 0.15).lerp(V(0.0, 1.15, S.deskZ - 0.1), b);
    setCam(camera, pos, look, -0.05 + 0.1 * b);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.9, envIntensity: 0.15 };
}
