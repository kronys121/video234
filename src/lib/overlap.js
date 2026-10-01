import * as THREE from 'three';
import { capsules2 } from './human2.js';

// Tag helpers used by scenes. solid(obj, name, allow) marks a prop; humans get tagged via solidHuman.
export function solid(obj, name, allow = [], parts = null) { obj.userData.solid = name; obj.userData.allow = allow; if (parts) obj.userData.parts = parts; return obj; }
export function solidHuman(H, name, allow = []) { H.root.userData.solid = name; H.root.userData.human = H; H.root.userData.allow = allow; return H; }

const segPts = (a, b, n = 7) => Array.from({ length: n }, (_, i) => a.clone().lerp(b, i / (n - 1)));
function segDist(a1, b1, a2, b2) { let best = Infinity; const p = segPts(a1, b1), q = segPts(a2, b2); for (const x of p) for (const y of q) best = Math.min(best, x.distanceTo(y)); return best; }

// returns ["a × b (depth)"] for every pair of tagged things that interpenetrate by more than tol metres
export function checkOverlaps(scene, tol = 0.02) {
  const items = [];
  scene.traverse((o) => {
    if (!o.userData.solid || !o.visible) return;
    let vis = true; o.traverseAncestors((a) => { if (!a.visible) vis = false; }); if (!vis) return;
    if (o.userData.human) items.push({ name: o.userData.solid, allow: o.userData.allow || [], caps: capsules2(o.userData.human) });
    else { const boxes = (o.userData.parts || [o]).map((p) => new THREE.Box3().setFromObject(p)).filter((b) => !b.isEmpty()); items.push({ name: o.userData.solid, allow: o.userData.allow || [], boxes }); }
  });
  const out = [];
  const allowed = (a, b) => a.allow.includes(b.name) || b.allow.includes(a.name) || a.allow.includes('*') || b.allow.includes('*');
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const A = items[i], Bi = items[j]; if (allowed(A, Bi)) continue;
    let depth = 0;
    if (A.caps && Bi.caps) { for (const [a1, b1, r1] of A.caps) for (const [a2, b2, r2] of Bi.caps) depth = Math.max(depth, r1 + r2 - segDist(a1, b1, a2, b2)); }
    else if (A.caps || Bi.caps) { const H = A.caps ? A : Bi, P = A.caps ? Bi : A; for (const [a, b, r] of H.caps) for (const p of segPts(a, b)) for (const bx of P.boxes) depth = Math.max(depth, r - bx.distanceToPoint(p)); }
    else { for (const x of A.boxes) for (const y of Bi.boxes) { if (!x.intersectsBox(y)) continue; const I = x.clone().intersect(y); const s = I.getSize(new THREE.Vector3()); depth = Math.max(depth, Math.min(s.x, s.y, s.z)); } }
    if (depth > tol) out.push(`${A.name} × ${Bi.name} (${(depth * 100).toFixed(0)}cm)`);
  }
  return out;
}
