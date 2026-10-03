import * as THREE from 'three';
import { human3 } from './human3.js';
import { solidHuman } from './overlap.js';
import { M, TEX, canvasTex, rng, V } from './util.js';
import { box, rbox } from './props.js';
import { sign } from './env.js';
import { shadows } from './shot.js';

// ---------- cast (online handles only, generic looks) ----------
export const cast8 = {
  eul: (n = 'eul') => solidHuman(human3({ skin: '#eccaa8', hair: '#5a3a1e', hairStyle: 'short', top: 'tshirt', topColor: '#3a6a3a', pants: 'jeans', pantsColor: '#2a3a5a', shoes: '#e8e4dc', eyeColor: '#3a5a7a' }), n),
  guinsoo: (n = 'guinsoo') => solidHuman(human3({ skin: '#e8c4a0', hair: '#1a1410', hairStyle: 'short', glasses: true, top: 'hoodie', topColor: '#8a2a2a', pants: 'jeans', pantsColor: '#2a2e38', shoes: '#2a2a2a', eyeColor: '#2a1a10' }), n),
  icefrog: (n = 'icefrog') => solidHuman(human3({ skin: '#f0cfb2', hair: '#3a2a1a', hairStyle: 'buzz', top: 'hoodie', topColor: '#2a5a8a', pants: 'jeans', pantsColor: '#1e2430', shoes: '#f2f0ea', eyeColor: '#3a6a5a' }), n),
  dev1: (n = 'dev1') => solidHuman(human3({ skin: '#d8a882', hair: '#2a1a12', hairStyle: 'short', beard: false, top: 'tshirt', topColor: '#3a3a44', pants: 'jeans', shoes: '#1a1a1a', eyeColor: '#2a1a10', bulk: 1.06 }), n),
  dev2: (n = 'dev2') => solidHuman(human3({ skin: '#f0cfb2', hair: '#a8582a', hairStyle: 'long', female: true, lip: '#b0505a', top: 'longsleeve', topColor: '#c86a2a', pants: 'jeans', pantsColor: '#2a3448', shoes: '#e8e4dc', eyeColor: '#3a5a3a' }), n),
  exec: (n = 'exec') => solidHuman(human3({ skin: '#e8c0a0', hair: '#6a6a66', hairStyle: 'short', top: 'jacket', topColor: '#2a2e36', pants: 'slacks', pantsColor: '#22252c', shoes: '#111', dress: true, tie: false, eyeColor: '#3a3a3a', bulk: 1.1, belly: 0.05 }), n),
  pro: (n, col, skin = '#e2b08c', hair = '#2a1a12', style = 'short') => solidHuman(human3({ skin, hair, hairStyle: style, top: 'longsleeve', topColor: col, pants: 'jeans', pantsColor: '#1a1e26', shoes: '#f2f0ea', eyeColor: '#2a1a10' }), n),
};

// ---------- MOBA-style map diorama: square board seen as a diamond, three lanes, river, two bases ----------
export function mobaMap(size = 3) {
  const g = new THREE.Group(); const s = size;
  const tex = canvasTex('moba8', 1024, 1024, (c, w, h) => {
    // light side bottom-left, dark side top-right, split along the anti-diagonal
    c.fillStyle = '#4a8a3a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#3a3a2a'; c.beginPath(); c.moveTo(w, 0); c.lineTo(w, h); c.lineTo(0, 0); c.fill();
    const r = rng(3); for (let i = 0; i < 2500; i++) { const x = r() * w, y = r() * h; const dark = y < x; c.fillStyle = dark ? (r() > 0.5 ? '#2e2e22' : '#44402e') : (r() > 0.5 ? '#3e7a32' : '#5a9a44'); c.fillRect(x, y, 6, 6); }
    c.strokeStyle = '#3a8ad8'; c.lineWidth = 60; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h); c.stroke(); // river along the split
    c.strokeStyle = '#c8a870'; c.lineWidth = 34; c.lineCap = 'round';
    c.beginPath(); c.moveTo(90, h - 90); c.lineTo(90, 90); c.lineTo(w - 90, 90); c.stroke(); // top lane
    c.beginPath(); c.moveTo(90, h - 90); c.lineTo(w - 90, h - 90); c.lineTo(w - 90, 90); c.stroke(); // bottom lane
    c.beginPath(); c.moveTo(90, h - 90); c.lineTo(w - 90, 90); c.stroke(); // middle lane over the river
  }, { repeat: [1, 1] });
  const base = rbox(s + 0.12, 0.16, s + 0.12, 0.03, M.std({ map: TEX.plywood([2, 2], '#4a3020'), roughness: 0.6 }), 0, -0.08, 0, g); void base;
  const top = new THREE.Mesh(new THREE.PlaneGeometry(s, s), M.std({ map: tex, roughness: 0.85 })); top.rotation.x = -Math.PI / 2; top.position.y = 0.002; top.receiveShadow = true; g.add(top);
  const P = (u, v) => V((u - 0.5) * s, 0, (v - 0.5) * s); // u: x 0..1, v: z 0..1 (v=1 near the light base)
  // ancients
  const anc = (u, v, col, emi) => { const a = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.12, 6), M.col('#6a6a70', 0.6)); b.position.y = 0.06; a.add(b); const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), M.std({ color: col, emissive: emi, emissiveIntensity: 0.8, roughness: 0.2 })); cr.scale.y = 1.7; cr.position.y = 0.38; a.add(cr); a.position.copy(P(u, v)); a.userData.cr = cr; g.add(shadows(a)); return a; };
  const A1 = anc(0.09, 0.91, '#8affb0', '#2aff7a'), A2 = anc(0.91, 0.09, '#ff6a4a', '#ff2a1a');
  // towers along lanes
  const tower = (u, v, col) => { const t = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.22, 8), M.col('#8a8a8e', 0.6)); b.position.y = 0.11; t.add(b); const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 8), M.col(col, 0.5)); c.position.y = 0.26; t.add(c); t.position.copy(P(u, v)); g.add(shadows(t)); };
  for (const k of [0.3, 0.55]) { tower(0.09, 1 - k, '#3aaa5a'); tower(k, 0.91, '#3aaa5a'); tower(0.09 + k * 0.35, 0.91 - k * 0.35, '#3aaa5a'); tower(1 - k, 0.09, '#c83a2a'); tower(0.91, k, '#c83a2a'); tower(0.91 - k * 0.35, 0.09 + k * 0.35, '#c83a2a'); }
  // trees in the jungle between lanes
  const r = rng(8); const treeG = new THREE.ConeGeometry(0.05, 0.16, 6);
  const treeL = new THREE.InstancedMesh(treeG, M.col('#2a6a2a', 0.8), 70), treeD = new THREE.InstancedMesh(treeG, M.col('#4a3a2a', 0.8), 70); let nl = 0, nd = 0; const m4 = new THREE.Matrix4();
  for (let i = 0; i < 400 && (nl < 70 || nd < 70); i++) { const u = 0.15 + r() * 0.7, v = 0.15 + r() * 0.7; if (Math.abs(u + v - 1) < 0.09 || Math.abs(u - v) < 0.08) continue; const p = P(u, v); const dark = v < u; if (dark && nd < 70) treeD.setMatrixAt(nd++, m4.makeTranslation(p.x, 0.08, p.z)); else if (!dark && nl < 70) treeL.setMatrixAt(nl++, m4.makeTranslation(p.x, 0.08, p.z)); }
  treeL.count = nl; treeD.count = nd; treeL.castShadow = treeD.castShadow = true; g.add(treeL, treeD);
  g.userData = { A1, A2, P };
  return g;
}
// sci-fi style board (the older idea the map grew from)
export function sciMap(size = 2) {
  const g = new THREE.Group();
  const tex = canvasTex('sci8', 512, 512, (c, w, h) => { c.fillStyle = '#1a2230'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a3a50'; c.lineWidth = 2; for (let i = 0; i < w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } c.strokeStyle = '#ff9a3a'; c.lineWidth = 18; c.beginPath(); c.moveTo(40, h - 40); c.lineTo(40, 40); c.lineTo(w - 40, 40); c.moveTo(40, h - 40); c.lineTo(w - 40, h - 40); c.lineTo(w - 40, 40); c.moveTo(40, h - 40); c.lineTo(w - 40, 40); c.stroke(); c.fillStyle = '#3ad0ff'; c.fillRect(20, h - 60, 40, 40); c.fillStyle = '#ff3a6a'; c.fillRect(w - 60, 20, 40, 40); }, { repeat: [1, 1] });
  rbox(size + 0.1, 0.12, size + 0.1, 0.02, M.col('#3a4250', 0.4, 0.6), 0, -0.06, 0, g);
  const t = new THREE.Mesh(new THREE.PlaneGeometry(size, size), M.std({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.4 })); t.rotation.x = -Math.PI / 2; t.position.y = 0.002; g.add(t);
  return shadows(g);
}
// ---------- items ----------
export function itemSword() { const g = new THREE.Group(); box(0.05, 0.5, 0.012, M.col('#c8d0d8', 0.2, 0.9), 0, 0.3, 0, g); box(0.18, 0.03, 0.04, M.col('#c8a24a', 0.3, 0.8), 0, 0.05, 0, g); box(0.035, 0.14, 0.035, M.col('#5a3a24', 0.6), 0, -0.04, 0, g); return shadows(g); }
export function itemOrb(col = '#6aa8ff') { const g = new THREE.Group(); const o = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), M.std({ color: col, emissive: col, emissiveIntensity: 0.6, roughness: 0.15, metalness: 0.2 })); o.position.y = 0.15; g.add(o); const r = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.012, 8, 32), M.col('#c8a24a', 0.3, 0.8)); r.position.y = 0.15; r.rotation.x = 1.2; g.add(r); return shadows(g); }
export function itemRing() { const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 12, 32), M.col('#ffd23a', 0.2, 0.9)); r.position.y = 0.12; g.add(r); const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), M.std({ color: '#ff3a6a', emissive: '#ff3a6a', emissiveIntensity: 0.5, roughness: 0.1 })); gem.position.y = 0.22; g.add(gem); return shadows(g); }
export function itemCombined() { const g = new THREE.Group(); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.7, 10), M.col('#5a3a24', 0.5)); st.position.y = 0.35; g.add(st); const o = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), M.std({ color: '#c86aff', emissive: '#a83aff', emissiveIntensity: 0.9, roughness: 0.1 })); o.position.y = 0.78; g.add(o); for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 6), M.col('#ffd23a', 0.2, 0.9)); const a = i * 2.094; p.position.set(Math.cos(a) * 0.09, 0.72, Math.sin(a) * 0.09); p.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(p); } return shadows(g); }
// a tall staff topped with a swirling orb (wind scepter)
export function scepter() { const g = new THREE.Group(); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.2, 12), M.col('#e8e4dc', 0.3, 0.3)); st.position.y = 0.6; g.add(st); for (const y of [0.3, 0.9]) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.012, 8, 20), M.col('#c8a24a', 0.25, 0.9)); b.rotation.x = Math.PI / 2; b.position.y = y; g.add(b); } const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), M.std({ color: '#bfefff', emissive: '#6ad0ff', emissiveIntensity: 0.45, roughness: 0.05, transparent: true, opacity: 0.85 })); orb.position.y = 1.32; g.add(orb); const swirl = []; for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.2 + i * 0.05, 0.008, 6, 40, Math.PI * 1.3), M.emis('#bfefff', 0.8)); t.position.y = 1.32; t.rotation.x = Math.PI / 2; g.add(t); swirl.push(t); } g.userData.swirl = swirl; g.userData.orb = orb; return shadows(g); }
// a dark staff with a crescent blade (hex scythe)
export function scythe() { const g = new THREE.Group(); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.3, 12), M.col('#3a2a4a', 0.4)); st.position.y = 0.65; g.add(st); const sh = new THREE.Shape(); sh.absarc(0, 0, 0.32, 0.2, 2.6, false); sh.absarc(0.04, 0.06, 0.25, 2.6, 0.2, true); const bl = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.015, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 }), M.std({ color: '#8affb0', emissive: '#2aff8a', emissiveIntensity: 0.5, roughness: 0.15, metalness: 0.6 })); bl.position.set(-0.05, 1.12, -0.01); g.add(bl); const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), M.std({ color: '#c86aff', emissive: '#a83aff', emissiveIntensity: 0.8 })); gem.position.y = 1.3; g.add(gem); return shadows(g); }
export function trophy() { const g = new THREE.Group(); const gold = M.col('#ffc83a', 0.2, 0.95, { emissive: '#7a5000', emissiveIntensity: 0.25 }); const base = rbox(0.26, 0.08, 0.26, 0.01, M.col('#1a1a1e', 0.4), 0, 0.04, 0, g); void base; const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.2, 16), gold); stem.position.y = 0.18; g.add(stem); const cup = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.02, 0), new THREE.Vector2(0.1, 0.03), new THREE.Vector2(0.16, 0.15), new THREE.Vector2(0.17, 0.3), new THREE.Vector2(0.155, 0.3)], 32), gold); cup.position.y = 0.27; g.add(cup); for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 20, Math.PI), gold); h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2; h.position.set(0.17 * s, 0.45, 0); g.add(h); } return shadows(g); }
export function prizeJar() { const g = new THREE.Group(); const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 1.4, 40, 1, true), new THREE.MeshPhysicalMaterial({ color: '#dff4ff', transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide })); glass.position.y = 0.7; glass.userData.noAO = true; g.add(glass); rbox(1.2, 0.1, 1.2, 0.02, M.col('#2a2a30', 0.4), 0, 0.05, 0, g); const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.49, 0.47, 1, 40), M.std({ color: '#ffc83a', emissive: '#a86a00', emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.7 })); fill.position.y = 0.1; g.add(fill); g.userData.fill = fill; return shadows(g); }
export function gameBox8(title, sub = '', a = '#a8281e', b = '#14141a') { const cover = canvasTex('gb8' + title + sub, 300, 420, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(1, b); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.arc(w / 2, h * 0.55, 90, 0, 7); c.fill(); c.fillStyle = '#f4f0e6'; c.font = `${title.length > 8 ? 40 : 60}px Russo`; c.textAlign = 'center'; c.fillText(title, w / 2, h * 0.18); c.font = '28px Russo'; c.fillStyle = '#ffd27a'; c.fillText(sub, w / 2, h * 0.92); }, { repeat: [1, 1] }); const side = M.col(b, 0.5); const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.06), [side, side, side, side, M.std({ map: cover, roughness: 0.45 }), side]); const g = new THREE.Group(); g.add(m); return shadows(g); }
export { V };
