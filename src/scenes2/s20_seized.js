import * as THREE from 'three';
import { idle, blinkAt } from '../lib/human.js';
import { TYPE, STAND, HOLD, mix } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { streamRoom, moneyPile, moneyBag, COL } from '../lib/stream.js';
import { sign, point, particles } from '../lib/env.js';
import { cardboardBox, box, rbox } from '../lib/props.js';
import { M, V, setCam, inv, smooth, easeInOut, easeOutBack, easeInCubic, shake, lerp, kf, clamp } from '../lib/util.js';

// 66.15–68.60  «в конце концов все деньги у него изъяли.»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07060b');
  const S = streamRoom(scene, { faceCam: true }); S.kb.visible = false;
  S.lights.key.intensity = 16;
  const q = mk.quantum(); q.root.position.set(0, 0, S.seatZ); scene.add(q.root);
  const top = S.dTop, dz = S.deskZ;
  const p1 = moneyPile(4, 5, 11, 1.0); p1.position.set(-0.3, top, dz + 0.1); scene.add(p1);
  const p2 = moneyPile(3, 4, 12, 1.0); p2.position.set(0.42, top, dz + 0.15); scene.add(p2);
  const bag = moneyBag(0.24, '$'); bag.position.set(0.62, top, dz + 0.4); scene.add(bag);
  const agents = [mk.agent('#d9a57f', '#111'), mk.agent('#8a5a3c', '#0a0a0a')];
  agents[0].root.position.set(-0.62, 0, dz + 0.75); agents[0].root.rotation.y = Math.PI + 0.75; agents[1].root.position.set(0.66, 0, dz + 0.8); agents[1].root.rotation.y = Math.PI - 0.75;
  agents.forEach((a) => scene.add(a.root));
  const boxes = agents.map((a) => { const b = cardboardBox(0.42, 0.26, 0.32); b.group.position.set(0, -0.12, 0.38); b.group.rotation.y = Math.PI; a.J.chest.add(b.group); const s = sign('УЛИКИ', { width: 0.3, color: '#ffffff', bg: '#1a1a1a', size: 90, pad: 16, border: '#ffd21f' }); s.position.set(0, 0.12, 0.17); b.group.add(s); return b; });
  // big "ИЗЪЯТО" stamp
  const stamp = new THREE.Group();
  rbox(0.66, 0.07, 0.3, 0.01, M.col('#4a2c16', 0.5), 0, 0.06, 0, stamp); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.26, 16), M.col('#6b3f1f', 0.45)); hd.position.y = 0.22; stamp.add(hd); const kn = new THREE.Mesh(new THREE.SphereGeometry(0.08, 18, 14), M.col('#6b3f1f', 0.45)); kn.position.y = 0.39; stamp.add(kn);
  stamp.traverse((m) => { if (m.isMesh) m.castShadow = true; }); scene.add(stamp);
  const imprint = sign('ИЗЪЯТО', { width: 0.56, color: '#e0182d', size: 150, pad: 18, border: '#e0182d', grunge: 0.5 }); imprint.rotation.x = -Math.PI / 2; imprint.rotation.z = 0.12; imprint.position.set(0.0, top + 0.012, dz + 0.22); scene.add(imprint);
  const flash = point(scene, '#ff3040', 0, 6, [0, 1.6, dz + 1.0]);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  const wp = new THREE.Vector3(), ST = 1.65;
  const slotP = (pile) => pile.children.map((s) => s.position.clone().add(pile.position));
  const s1 = slotP(p1), s2 = slotP(p2);
  function update(lt) {
    S.update(lt + 66.15);
    // agents scoop the cash into evidence boxes
    agents.forEach((a, i) => { const k = smooth(inv(0.0, 0.3, lt)); a.pose({ ...STAND, lSh: [-45 * k, 0, 14], rSh: [-45 * k, 0, -14], lEl: [-70 * k, -20, 0], rEl: [-70 * k, 20, 0], lCurl: 0.5, rCurl: 0.5, head: [8, 0, 0], spine: [8, 0, 0] }); idle(a, lt, i + 3, 0.25); a.face({ blink: blinkAt(lt, i), brows: 0.1 }); });
    const fly = (pile, slots, agent, base) => pile.children.forEach((s, i) => {
      const t0 = base + i * 0.045, k = clamp(inv(t0, t0 + 0.4, lt));
      if (k <= 0) { s.visible = true; return; }
      agent.root.updateMatrixWorld(true); agent.J.chest.localToWorld(wp.set(0, 0.0, 0.4)); const tgt = wp.clone().sub(pile.position);
      const from = s.userData.rest || (s.userData.rest = s.position.clone());
      s.position.set(lerp(from.x, tgt.x, k), lerp(from.y, tgt.y, k) + Math.sin(k * Math.PI) * 0.3, lerp(from.z, tgt.z, k)); s.rotation.set(k * 3, k * 5, 0);
      const sc = k > 0.88 ? Math.max(0.001, 1 - (k - 0.88) / 0.12) : 1; s.scale.setScalar(sc);
    });
    fly(p1, s1, agents[0], 0.2); fly(p2, s2, agents[1], 0.35);
    const bk = clamp(inv(0.7, 1.25, lt)); bag.position.set(lerp(0.62, 0.7, bk * bk), S.dTop + Math.sin(bk * Math.PI) * 0.35, lerp(S.deskZ + 0.4, S.deskZ + 0.8, bk)); bag.scale.setScalar(Math.max(0.001, bk > 0.92 ? 1 - (bk - 0.92) * 12 : 1));
    // Quantum: stunned, hands up, mouth open
    const sh = smooth(inv(0.15, 0.55, lt));
    q.pose(mix({ ...TYPE }, { ...TYPE, lSh: [-100, 0, 30], rSh: [-100, 0, -30], lEl: [-40, 0, 0], rEl: [-40, 0, 0], lCurl: 0.1, rCurl: 0.1, head: [-4, 0, 0] }, sh));
    idle(q, lt, 5, 0.3);
    q.face({ blink: 0, brows: 1, browTilt: 1, mouth: 0.6 * sh, smile: -0.8 * sh, look: [0, 0] });
    // stamp slam
    const down = clamp(inv(ST - 0.22, ST, lt)), up = clamp(inv(ST + 0.2, ST + 0.6, lt));
    const sy = lt < ST ? lerp(0.9, 0, easeInCubic(down)) : lerp(0, 1.2, smooth(up));
    stamp.position.set(0.0, top + 0.012 + sy, dz + 0.22); stamp.rotation.y = 0.12; stamp.visible = lt > ST - 0.25 && up < 1;
    imprint.visible = lt >= ST; imprint.scale.setScalar(lt >= ST ? 1 + 0.15 * Math.exp(-(lt - ST) * 12) : 1);
    const hit = lt >= ST ? Math.exp(-(lt - ST) * 7) : 0; flash.intensity = hit * 30;
    const f = kf(lt, [[0, [0.0, 1.65, S.seatZ + 2.5], [0, 1.1, S.seatZ + 0.2], 52, 0.04], [1.5, [0.0, 1.5, dz + 1.8], [0, 1.0, dz], 50, 0], [2.45, [0.0, 1.95, dz + 1.7], [0, top, dz + 0.2], 48, 0]]);
    setCam(camera, f.pos.add(shake(lt, 0.006 + hit * 0.04, 16, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.9, envIntensity: 0.15 };
}
