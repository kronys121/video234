import * as THREE from 'three';
import { cs, crt, tower, pizzaBox, soda, floppy, badge, editorDraw } from '../lib/cs.js';
import { idle2 } from '../lib/human2.js';
import { moneyPile } from '../lib/stream.js';
import { sign, point } from '../lib/env.js';
import { text3d } from '../lib/text3d.js';
import { desk, box, rbox, poster } from '../lib/props.js';
import { room, calendar } from '../lib/rooms.js';
import { solid } from '../lib/overlap.js';
import { TEX, M, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, easeInCubic, shake, lerp, clamp } from '../lib/util.js';

const SITP = { hipsY: -0.36, lHip: [-85, 0, 6], rHip: [-85, 0, -6], lKnee: [85, 0, 0], rKnee: [85, 0, 0] };
const TYPEP = { ...SITP, lSh: [-28, 0, 10], rSh: [-28, 0, -10], lEl: [-82, 0, 0], rEl: [-82, 0, 0], lCurl: 0.4, rCurl: 0.4, spine: [10, 0, 0], head: [6, 0, 0] };
function stool() { const g = new THREE.Group(); const m = M.col('#3a3e46', 0.5, 0.5); rbox(0.42, 0.06, 0.42, 0.02, M.col('#2a5a8a', 0.7), 0, 0.52, 0, g); box(0.05, 0.5, 0.05, m, 0, 0.25, 0, g); box(0.4, 0.03, 0.05, m, 0, 0.03, 0, g); box(0.05, 0.03, 0.4, m, 0, 0.03, 0, g); g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }

// dorm room: desk along the back wall with two CRTs, two students seated facing -z
function dorm(scene) {
  scene.background = new THREE.Color('#0e0c12');
  const R = room({ w: 5.6, d: 5.6, h: 2.8, wall: M.std({ color: '#5a6a5a', roughness: 0.95 }), floor: M.std({ map: TEX.carpet([4, 4], '#4a3a3a'), roughness: 1 }), ceil: M.col('#8a8a80', 1), open: [] }); scene.add(R);
  const p2 = poster((g, w, h) => { g.fillStyle = '#2a1a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff9a3a'; g.font = '40px Russo'; g.textAlign = 'center'; g.fillText('λ', w / 2, h * 0.45); g.fillStyle = '#fff'; g.font = '30px Russo'; g.fillText('GAME', w / 2, h * 0.75); }, 0.55, 0.75, 'poster2'); p2.position.set(0.9, 1.7, 2.77); p2.rotation.y = Math.PI; scene.add(p2);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#2a2018', 0.45));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), M.emis('#1a2a5a', 0.9)); win.position.set(1.7, 1.75, -2.78); scene.add(win);
  box(1.3, 1.0, 0.04, M.col('#e8e0d0', 0.6), 1.7, 1.75, -2.8, scene);
  const p1 = poster((g, w, h) => { g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e07a2a'; g.font = '44px Russo'; g.textAlign = 'center'; g.fillText('LAN', w / 2, h * 0.3); g.fillText('PARTY', w / 2, h * 0.45); g.fillStyle = '#fff'; g.font = '30px Russo'; g.fillText('1999', w / 2, h * 0.75); }, 0.6, 0.8); p1.position.set(-1.5, 1.85, -2.77); scene.add(p1);
  const cal = calendar('ЯНВАРЬ', '1999'); cal.position.set(-0.55, 1.95, -2.77); scene.add(cal);
  const bed = new THREE.Group(); rbox(1.9, 0.35, 0.9, 0.05, M.std({ map: TEX.fabric([2, 1], '#3a4a6a'), roughness: 1 }), 0, 0.3, 0, bed); rbox(0.5, 0.12, 0.35, 0.05, M.col('#e8e4dc', 0.9), -0.65, 0.53, 0, bed); bed.position.set(-2.2, 0, 0.4); bed.rotation.y = Math.PI / 2; bed.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(solid(bed, 'bed'));
  const dk = desk(2.4, 0.8, 0.74, '#b89a70'); dk.position.set(0, 0, -2.25); scene.add(solid(dk, 'desk', [], [dk.children[0]]));
  const top = 0.77;
  const c1 = crt(editorDraw); c1.position.set(-0.5, top + 0.23, -2.32); scene.add(c1);
  const c2 = crt((g, w, h, t) => { editorDraw(g, w, h, t + 2); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, h * 0.72, w, h * 0.28); g.fillStyle = '#ff9a3a'; g.font = '34px Russo'; g.textAlign = 'center'; g.fillText('HALF-LIFE MOD v0.1', w / 2, h * 0.88); }); c2.position.set(0.5, top + 0.23, -2.32); scene.add(c2);
  const t1 = tower(); t1.position.set(-1.0, top, -2.3); scene.add(t1); const t2 = tower(); t2.position.set(1.0, top, -2.3); scene.add(t2);
  const pz = pizzaBox(); pz.position.set(0.05, top, -1.95); pz.rotation.y = 0.2; scene.add(pz);
  const s1 = soda('#c0302a'); s1.position.set(-0.95, top, -1.95); scene.add(s1); const s2 = soda('#2a6ac0'); s2.position.set(0.98, top, -1.98); scene.add(s2);
  for (const x of [-0.5, 0.5]) { const kb = rbox(0.42, 0.03, 0.15, 0.01, M.col('#d8d0bc', 0.6), x, top + 0.015, -1.98, scene); void kb; }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), M.emis('#ffd9a0', 5)); lamp.position.set(1.15, top + 0.45, -2.45); scene.add(lamp);
  point(scene, '#ffc890', 9, 6, [1.1, top + 0.6, -2.2]); point(scene, '#6aa0ff', 4, 4, [0, 1.25, -1.9]);
  const key = new THREE.SpotLight('#ffe2c0', 16, 8, 0.85, 0.6, 1.3); key.position.set(0.4, 2.7, 0.8); key.target.position.set(0, 0.9, -1.8); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const st1 = stool(); st1.position.set(-0.5, 0, -1.5); scene.add(solid(st1, 'stool1', ['student1']));
  const st2 = stool(); st2.position.set(0.5, 0, -1.5); scene.add(solid(st2, 'stool2', ['student2']));
  const a = cs.student1(); a.root.position.set(-0.5, 0, -1.48); a.root.rotation.y = Math.PI; scene.add(a.root); a.root.userData.allow = ['stool1'];
  const b = cs.student2(); b.root.position.set(0.5, 0, -1.48); b.root.rotation.y = Math.PI; scene.add(b.root); b.root.userData.allow = ['stool2'];
  return { c1, c2, a, b, top };
}

// 0.00–3.50  «Два студента сделали бесплатный мод для Half-Life просто ради интереса,»
export function buildIntro() {
  const scene = new THREE.Scene(); const D = dorm(scene);
  const mod = text3d('MOD', { family: 'mont', size: 0.22, depth: 0.05, bevel: 0.008, color: '#ffb24a', side: '#8a4a10', emissive: '#ff8a1a', emissiveIntensity: 0.4 }); mod.position.set(0.5, 1.62, -2.3); scene.add(mod);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  function update(lt) {
    D.c1.userData.live.update(lt); D.c2.userData.live.update(lt);
    const fun = smooth(inv(2.3, 2.7, lt));
    D.a.pose({ ...TYPEP, rSh: [lerp(-28, -150, fun), 0, -10], rEl: [lerp(-82, -30, fun), 0, 0], head: [6, -25 * fun, 0] }); idle2(D.a, lt, 2, 0.3);
    D.a.face({ blink: 0, brows: 0.3 + 0.5 * fun, smile: 0.5 + 0.5 * fun, mouth: 0.4 * fun });
    D.b.pose({ ...TYPEP, lSh: [lerp(-28, -150, fun), 0, 10], lEl: [lerp(-82, -30, fun), 0, 0], head: [6, 25 * fun, 0] }); idle2(D.b, lt, 5, 0.3);
    D.b.face({ blink: 0, brows: 0.3 + 0.5 * fun, smile: 0.5 + 0.5 * fun, mouth: 0.4 * fun });
    const k = easeOutBack(inv(1.85, 2.25, lt), 2.4); mod.scale.setScalar(Math.max(0.001, k)); mod.visible = lt > 1.83; mod.rotation.y = Math.sin(lt * 2) * 0.2;
    const f = kf(lt, [[0, [2.2, 1.75, 0.4], [0, 1.15, -1.8], 56, 0.03], [1.8, [1.65, 1.45, -0.9], [-0.3, 1.15, -1.8], 50, 0], [3.5, [1.8, 1.55, -0.2], [-0.5, 1.2, -2.0], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}

// 3.50–7.35  «а Valve в итоге купила его и наняла обоих авторов.»
export function buildTag() {
  const scene = new THREE.Scene(); const D = dorm(scene);
  D.a.root.visible = false; D.b.root.visible = false;
  const fl = floppy('CS MOD'); fl.scale.setScalar(2.2); fl.rotation.x = -Math.PI / 2 + 0.25; fl.position.set(0, D.top + 0.12, -1.75); scene.add(fl);
  const free = sign('БЕСПЛАТНО', { width: 0.36, color: '#1a1a1a', bg: '#ffe066', size: 90, pad: 18, border: '#1a1a1a' }); free.position.set(0.17, D.top + 0.22, -1.62); free.rotation.set(-0.3, 0, -0.3); scene.add(free);
  const sold = sign('КУПЛЕНО', { width: 0.3, color: '#ffffff', bg: '#d4213a', size: 100, pad: 18, border: '#ffffff' }); sold.position.copy(free.position); sold.rotation.copy(free.rotation); scene.add(sold);
  const pile = moneyPile(3, 4, 4, 0.8); pile.position.set(-0.55, D.top, -1.8); scene.add(pile);
  const b1 = badge('СОТРУДНИК'), b2 = badge('СОТРУДНИК'); [b1, b2].forEach((b, i) => { b.scale.setScalar(2.2); scene.add(b); });
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.03, 40);
  const BUY = 1.12, HIRE = 2.14;
  function update(lt) {
    D.c1.userData.live.update(lt + 3.5); D.c2.userData.live.update(lt + 3.5);
    const flip = smooth(inv(BUY - 0.1, BUY + 0.15, lt));
    free.scale.set(Math.max(0.001, 1 - flip), 1, 1); free.visible = flip < 1;
    const ks = easeOutBack(inv(BUY + 0.1, BUY + 0.4, lt), 2.6); sold.scale.setScalar(Math.max(0.001, ks)); sold.visible = lt > BUY + 0.08;
    pile.children.forEach((s) => { const k = easeOutBack(inv(BUY + 0.15 + s.userData.order * 0.012, BUY + 0.45 + s.userData.order * 0.012, lt), 2.2); s.scale.setScalar(Math.max(0.001, k)); });
    [b1, b2].forEach((b, i) => { const t0 = HIRE + i * 0.25, k = clamp(inv(t0, t0 + 0.35, lt)); const y = lerp(D.top + 0.9, D.top + 0.012, easeOutBack(k, 1.4)); b.position.set(0.45 + i * 0.28, y, -1.68 + i * 0.1); b.rotation.set(-Math.PI / 2, 0, 0.3 - i * 0.5); b.visible = lt > t0 - 0.02; });
    const f = kf(lt, [[0, [0.9, 1.35, -0.6], [0.0, D.top + 0.12, -1.75], 48, 0.04], [3.85, [-0.6, 1.4, -0.7], [0.15, D.top + 0.1, -1.75], 46, -0.04]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}

// 7.35–10.15  «В 1999 году»  and 10.15–12.70 «Минь Ле и Джесс Клифф начали делать для Half-Life мод»
export function buildYear() {
  const scene = new THREE.Scene(); const D = dorm(scene);
  const yr = text3d('1999', { family: 'mont', size: 0.42, depth: 0.1, bevel: 0.014, color: '#ffffff', side: '#3a6ac0', emissive: '#4a8aff', emissiveIntensity: 0.3 }); yr.position.set(0, 2.25, -2.5); scene.add(yr);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 60);
  function update(lt) {
    D.c1.userData.live.update(lt + 6); D.c2.userData.live.update(lt + 6);
    D.a.pose({ ...TYPEP }); idle2(D.a, lt, 2, 0.4); D.a.face({ blink: 0, brows: 0.2, smile: 0.3 });
    D.b.pose({ ...TYPEP }); idle2(D.b, lt, 5, 0.4); D.b.face({ blink: 0, brows: 0.2, smile: 0.3 });
    const k = easeOutElastic(inv(0.3, 0.9, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 0.28;
    const f = kf(lt, [[0, [2.2, 2.3, 2.4], [0, 1.4, -2.0], 56, 0.05], [2.8, [1.0, 1.9, 1.2], [0, 1.6, -2.2], 54, 0.01]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 3)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}
export function buildWork() {
  const scene = new THREE.Scene(); const D = dorm(scene);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.05, 60);
  function update(lt) {
    D.c1.userData.live.update(lt * 1.6 + 1); D.c2.userData.live.update(lt * 1.6 + 3);
    const ty = Math.sin(lt * 14) * 4;
    D.a.pose({ ...TYPEP, lSh: [-33 + ty, 0, 10], rSh: [-33 - ty, 0, -10], head: [8, 15, 0] }); idle2(D.a, lt, 2, 0.3); D.a.face({ blink: 0, brows: 0.4, smile: 0.5, mouth: 0.1 });
    D.b.pose({ ...TYPEP, lSh: [-33 - ty, 0, 10], rSh: [-33 + ty, 0, -10], head: [8, -15, 0] }); idle2(D.b, lt, 5, 0.3); D.b.face({ blink: 0, brows: 0.4, smile: 0.5, mouth: 0.1 });
    // from beside the left monitor looking back at their faces, sliding to the right
    const f = kf(lt, [[0, [2.35, 1.6, -2.4], [-0.2, 1.1, -1.5], 54, 0.03], [2.55, [2.25, 1.7, -0.9], [-0.3, 1.1, -1.6], 54, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 5, 4)), f.look, f.roll, f.fov);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.3, bloomThreshold: 0.92, envIntensity: 0.25 };
}
