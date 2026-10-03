import * as THREE from 'three';
import { V, inv, easeOutBack } from './util.js';

// shared per-shot helpers: pop-in scale, camera-space placement (HUD signs), facing
export const pop = (o, lt, t0, d = 0.35, s = 2.4, base = 1) => { const k = easeOutBack(inv(t0, t0 + d, lt), s); o.scale.setScalar(Math.max(0.001, k * base)); o.visible = lt > t0 - 0.02; return k; };
export const popOut = (o, lt, t0, t1, d = 0.3, base = 1) => { const k = easeOutBack(inv(t0, t0 + d, lt), 2.4) * (1 - inv(t1, t1 + 0.2, lt)); o.scale.setScalar(Math.max(0.001, k * base)); o.visible = lt > t0 - 0.02 && lt < t1 + 0.2; return k; };
export const fwd = (cam) => { const f = new THREE.Vector3(); cam.getWorldDirection(f); return f; };
// HUD signs: unlit (no blow-out from nearby lights) and shrunk to fit inside the frame width
export function hud(o, cam, dist, x, y) {
  const f = fwd(cam), r = new THREE.Vector3().crossVectors(f, cam.up).normalize(); o.position.copy(cam.position).addScaledVector(f, dist).addScaledVector(r, x).add(V(0, y, 0)); o.quaternion.copy(cam.quaternion);
  if (o.isMesh && !o.userData.flat && o.material.map) { o.userData.flat = true; o.material = new THREE.MeshBasicMaterial({ map: o.material.map, color: new THREE.Color(0.92, 0.92, 0.92), transparent: o.material.transparent, depthTest: false }); o.renderOrder = 20; }
  const w0 = o.geometry && o.geometry.parameters && o.geometry.parameters.width; if (w0) { const lim = 2 * halfW(dist, cam.fov) * 0.86 - 2 * Math.abs(x); if (w0 * o.scale.x > lim) o.scale.multiplyScalar(lim / (w0 * o.scale.x)); }
}
// visible half-width at distance d for a portrait 1080×1920 camera with vertical fov (deg)
export const halfW = (d, fov) => d * Math.tan(THREE.MathUtils.degToRad(fov / 2)) * 0.5625;
export const shadows = (o, cast = true, recv = true) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; };
