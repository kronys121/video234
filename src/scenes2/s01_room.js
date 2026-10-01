import * as THREE from 'three';
import { idle, blinkAt, talk } from '../lib/human.js';
import { TYPE } from '../lib/poses.js';
import { mk } from '../lib/cast.js';
import { streamRoom, COL } from '../lib/stream.js';
import { text3d } from '../lib/text3d.js';
import { V, setCam, path, inv, smooth, easeInOut, easeOutBack, shake, clamp } from '../lib/util.js';

// 0.00–3.00  «В 2018 году одним из самых популярных…»
export function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0912');
  const S = streamRoom(scene, { faceCam: false });
  const q = mk.quantum(); q.root.position.set(0, 0, S.seatZ); q.root.rotation.y = Math.PI; scene.add(q.root);
  const year = text3d('2018', { family: 'mont', size: 0.5, depth: 0.12, bevel: 0.018, color: '#dcd0ff', side: COL.purple, emissive: COL.purple, emissiveIntensity: 0.22 });
  year.position.set(0, 1.98, S.backZ + 0.16); scene.add(year);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 80);
  function update(lt) {
    S.update(lt);
    q.pose({ ...TYPE, head: [8 + Math.sin(lt * 2) * 3, Math.sin(lt * 0.8) * 8, 0] });
    idle(q, lt, 2, 0.5);
    q.face({ blink: blinkAt(lt, 3), mouth: talk(lt, 1, 0.6), brows: 0.2, smile: 0.4 });
    const k = easeOutBack(inv(0.25, 0.85, lt), 2.0);
    year.scale.setScalar(Math.max(0.001, k)); year.rotation.set(0, (1 - clamp(k)) * 1.4, 0); year.position.y = 1.98 + Math.sin(lt * 1.6) * 0.03;
    const c = easeInOut(inv(0, 3.0, lt));
    const pos = path([[3.4, 2.8, 3.2], [2.4, 2.0, 1.6], [1.5, 1.65, 0.3], [1.1, 1.55, -0.2]], c);
    pos.add(shake(lt, 0.006, 5, 1));
    setCam(camera, pos, V(0, 1.55, S.backZ + 0.6).lerp(V(0.1, 1.5, S.deskZ - 0.3), c), -0.1 * (1 - c) + 0.02 * Math.sin(lt));
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.92, envIntensity: 0.15 };
}
