import * as THREE from 'three';
import { creditCard } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { box, rbox } from '../lib/props.js';
import { pop, hud, shadows } from '../lib/shot.js';
import { M, V, setCam, kf, inv, smooth, easeOutBack, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';

const coinTex = () => canvasTex('coin6', 256, 256, (g, w, h) => { const rg = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); rg.addColorStop(0, '#ffe08a'); rg.addColorStop(1, '#c8901a'); g.fillStyle = rg; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a5a0a'; g.lineWidth = 14; g.beginPath(); g.arc(w / 2, h / 2, w * 0.38, 0, 7); g.stroke(); g.fillStyle = '#8a5a0a'; g.font = '140px Russo'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('C', w / 2, h / 2 + 6); }, { repeat: [1, 1] });
function coin(s = 0.12) { const side = M.col('#c8901a', 0.3, 0.9); const face = new THREE.MeshStandardMaterial({ map: coinTex(), roughness: 0.3, metalness: 0.7, emissive: '#5a3a00', emissiveIntensity: 0.3 }); const m = new THREE.Mesh(new THREE.CylinderGeometry(s, s, s * 0.16, 28), [side, face, face]); m.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(m); return g; }
function wallet(col) { const g = new THREE.Group(); rbox(0.24, 0.17, 0.06, 0.02, M.col(col, 0.55), 0, 0, 0, g); rbox(0.1, 0.07, 0.07, 0.015, M.col('#1a1a1e', 0.4), 0.1, 0, 0.0, g); const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), M.col('#c8c8cc', 0.3, 0.8)); dot.position.set(0.12, 0, 0.04); g.add(dot); return shadows(g); }

// a cloud of ~100 wallets linked in chains; shared by both money shots
function network(scene) {
  scene.background = new THREE.Color('#05060c');
  scene.add(new THREE.HemisphereLight('#a8b8ff', '#0a0810', 0.6));
  const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(3, 5, 6); scene.add(key);
  const r = rng(12); const nodes = [];
  for (let i = 0; i < 100; i++) { const a = r() * Math.PI * 2, rr = 0.6 + r() * 2.6, y = (r() - 0.5) * 4.6; const w = wallet(i % 3 ? '#2a3a5a' : '#3a2a5a'); w.position.set(Math.cos(a) * rr, 2.0 + y, Math.sin(a) * rr - 1.5); w.rotation.set((r() - 0.5) * 0.6, r() * 6.28, (r() - 0.5) * 0.4); w.userData.t0 = r() * 0.8; w.userData.s = 1.5; scene.add(w); nodes.push(w); }
  const linkM = new THREE.LineBasicMaterial({ color: '#4a6aff', transparent: true, opacity: 0.35 });
  const pts = []; const pairs = [];
  for (let i = 0; i < 100; i++) { let best = -1, bd = 1e9; for (let j = 0; j < 100; j++) { if (j === i) continue; const d = nodes[i].position.distanceTo(nodes[j].position); if (d < bd && !pairs.some(([a, b]) => (a === j && b === i))) { bd = d; best = j; } } pairs.push([i, best]); pts.push(nodes[i].position.clone(), nodes[best].position.clone()); }
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), linkM); scene.add(lines);
  const coins = []; for (let i = 0; i < 26; i++) { const c = coin(0.07); c.userData = { p: pairs[(i * 7) % pairs.length], ph: r() }; scene.add(c); coins.push(c); }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(90,120,255,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.1 })); glow.scale.set(9, 9, 1); glow.position.set(0, 2, -3.5); scene.add(glow);
  return { nodes, coins, pairs, linkM };
}
const flow = (N, lt) => N.coins.forEach((c) => { const [a, b] = c.userData.p; const k = (lt * 0.9 + c.userData.ph) % 1; c.position.copy(N.nodes[a].position).lerp(N.nodes[b].position, k); c.rotation.y = lt * 4 + c.userData.ph * 6; });

// 33.15–37.95  «Разработчики продавали читы за криптовалюту и гоняли деньги через сотню кошельков,»
export function buildCrypto() {
  const scene = new THREE.Scene(); const N = network(scene);
  const big = coin(0.45); scene.add(big);
  const t1 = sign('КРИПТОВАЛЮТА', { width: 1.2, color: '#1a1a1a', bg: '#ffc83a', size: 100, pad: 22, border: '#1a1a1a' }); scene.add(t1);
  const t2 = sign('100 КОШЕЛЬКОВ', { width: 1.2, color: '#ffffff', bg: '#3a4aa8', size: 100, pad: 22, border: '#ffffff' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(56, 1080 / 1920, 0.05, 100);
  function update(lt) {
    N.nodes.forEach((w, i) => { const k = easeOutBack(inv(2.0 + w.userData.t0, 2.3 + w.userData.t0, lt), 2.2); w.scale.setScalar(Math.max(0.001, k * 1.5)); w.visible = k > 0.002; });
    N.linkM.opacity = 0.35 * smooth(inv(2.4, 3.2, lt)); flow(N, lt); N.coins.forEach((c) => { c.visible = lt > 3.0; });
    const kb = easeOutBack(inv(0.1, 0.5, lt), 2.2) * (1 - smooth(inv(2.1, 2.5, lt))); big.scale.setScalar(Math.max(0.001, kb)); big.visible = kb > 0.002; big.position.set(0, 2.3, 1.2); big.rotation.y = lt * 2.5;
    pop(t1, lt, 1.7, 0.3); pop(t2, lt, 3.65, 0.3);
    const f = kf(lt, [[0, [0, 2.4, 4.0], [0, 2.3, 0], 50, 0], [2.2, [1.4, 2.6, 5.6], [0, 2.1, -1.5], 56, 0.04], [4.8, [-1.3, 2.2, 6.2], [0, 2.0, -1.5], 58, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3.2, 0, 1.05); hud(t2, camera, 3.2, 0, -0.55);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.5, bloomThreshold: 0.82, envIntensity: 0.3, ao: 0.6 };
}

// 37.95–42.00  «но детективы нашли тот, с которого средства выводились на личные карты.»
export function buildFound() {
  const scene = new THREE.Scene(); const N = network(scene);
  const target = N.nodes[37]; const tp = target.position.clone();
  const hi = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 8, 40), M.emis('#ff2a3a', 2.5)); scene.add(hi);
  const red = new THREE.PointLight('#ff2a3a', 0, 3); scene.add(red);
  const cards = [0, 1, 2].map((i) => { const c = creditCard(['#1b4b9a', '#2a7a4a', '#8a2a5a'][i], ['4276 5500 1234 9087', '5469 3800 7712 0451', '2202 2061 4419 8832'][i], 2.4); scene.add(c); return c; });
  const tag = sign('КОШЕЛЁК #37', { width: 0.36, color: '#ffffff', bg: '#d4213a', size: 90, pad: 14 }); tag.material = new THREE.MeshBasicMaterial({ map: tag.material.map }); scene.add(tag);
  const t1 = sign('НАШЛИ!', { width: 0.7, color: '#ffffff', bg: '#d4213a', size: 110, pad: 20, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('ЛИЧНЫЕ КАРТЫ', { width: 1.1, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 22, border: '#1a1a1a' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 100);
  const FOUND = 0.77;
  function update(lt) {
    N.nodes.forEach((w) => { w.scale.setScalar(1.5); w.visible = true; }); flow(N, lt + 5);
    const k = smooth(inv(FOUND, FOUND + 0.3, lt)); hi.visible = k > 0.01; hi.position.copy(tp); hi.scale.setScalar(Math.max(0.001, k * (1 + 0.08 * Math.sin(lt * 8)))); hi.lookAt(camera.position);
    red.position.copy(tp).add(V(0, 0, 0.3)); red.intensity = 4 * k;
    N.nodes.forEach((w) => { w.traverse((m) => { if (m.isMesh && m.material.color) { if (!m.userData.c0) m.userData.c0 = m.material.color.clone(); } }); });
    cards.forEach((c, i) => { const t0 = 2.6 + i * 0.15; const kk = smooth(inv(t0, t0 + 0.55, lt)); c.visible = lt > t0; c.position.copy(tp).add(V(-0.35 + i * 0.35, -0.1 + kk * 0.55 + i * 0.03, 0.2 + kk * 0.6)); c.rotation.set(-0.2, (1 - kk) * 2.5 + (i - 1) * 0.2, (i - 1) * 0.15); c.scale.setScalar(2.4 * Math.max(0.001, kk)); });
    pop(t1, lt, FOUND, 0.3); pop(t2, lt, 2.95, 0.3); pop(tag, lt, FOUND + 0.2, 0.3); tag.position.copy(tp).add(V(0, 0.3, 0.1)); tag.lookAt(camera.position);
    const dive = smooth(inv(0.9, 2.6, lt));
    const from = V(-1.2, 2.4, 7.2), to = tp.clone().add(V(0.4, 0.25, 2.4));
    const pos = from.clone().lerp(to, dive), look = V(0, 2.0, -1.5).lerp(tp.clone().add(V(0, 0.25, 0)), smooth(inv(0.6, 1.8, lt)));
    setCam(camera, pos.add(shake(lt, 0.004, 4, 2)), look, 0.03 * (1 - dive), lerp(56, 46, dive));
    hud(t1, camera, 2.2, 0, 0.7); hud(t2, camera, 2.2, 0, -0.55);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.5, bloomThreshold: 0.82, envIntensity: 0.3, ao: 0.6 };
}
