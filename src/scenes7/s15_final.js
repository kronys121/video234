import * as THREE from 'three';
import { cast7, podium, heroSprite, photoFrame, nameTag, warehouse, arcadeCab, arcadeDraw } from '../lib/sets7.js';
import { room6, desk6, chair6, plant, woodFloor, screen6, ceilingLamp } from '../lib/sets6.js';
import { idle3 } from '../lib/human3.js';
import { tripodCam } from '../lib/fantasy.js';
import { sign, point } from '../lib/env.js';
import { box, rbox, building } from '../lib/props.js';
import { solid } from '../lib/overlap.js';
import { pop, hud, shadows } from '../lib/shot.js';
import { walkPose } from '../lib/human.js';
import { M, TEX, V, setCam, kf, inv, smooth, easeOutBack, easeOutElastic, shake, lerp, clamp, rng, canvasTex, glowTex } from '../lib/util.js';
import { text3d, STAND, SITP } from './s01_arcade.js';

const older = () => { const d = cast7.designer('designer'); return d; };
// press-conference stage with a podium and a screen behind
function pressStage(scene, screenDraw) {
  scene.background = new THREE.Color('#07070c');
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), M.std({ color: '#16161e', roughness: 0.35, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const stage = rbox(5, 0.25, 3, 0.03, M.col('#1e1e28', 0.5), 0, 0.125, -1, scene); void stage;
  const edge = box(5, 0.03, 0.03, M.emis('#d8281e', 2.5), 0, 0.25, 0.5, scene); edge.userData.noAO = true;
  const scr = screen6(screenDraw, 3.0, 16 / 9, 0.5, 768); scr.children.slice(2).forEach((c) => { c.visible = false; }); scr.position.set(0, 2.3, -2.4); scene.add(scr);
  scene.add(new THREE.HemisphereLight('#a8b0ff', '#100810', 0.35));
  const key = new THREE.SpotLight('#fff0dc', 34, 12, 0.5, 0.5, 1.2); key.position.set(1, 5, 3); key.target.position.set(0, 1.2, -0.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const pd = podium(''); pd.position.set(0, 0.25, -0.35); scene.add(solid(pd, 'podium', ['designer']));
  const d = older(); d.root.position.set(0, 0.25, -0.85); scene.add(d.root); d.root.userData.allow = ['podium'];
  return { scr, d };
}
const slideDraw = (txt, col = '#d8281e') => (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1a1a2a'); gr.addColorStop(1, '#2a1a2a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = col; g.font = `${h * 0.2}px Russo`; g.textAlign = 'center'; g.fillText(txt, w / 2, h * 0.58); };

// 44.15–48.00  «Сам Миямото в 2015 году подтвердил, что Марио назван»
export function buildConfirm() {
  const scene = new THREE.Scene(); const S = pressStage(scene, slideDraw('2015'));
  const yr = text3d('2015', { family: 'mont', size: 0.36, depth: 0.09, bevel: 0.013, color: '#ffffff', side: '#d8281e', emissive: '#ff5a4a', emissiveIntensity: 0.3 }); yr.position.set(0, 3.5, -2.2); scene.add(yr);
  const ok = sign('ПОДТВЕРДИЛ', { width: 1.1, color: '#ffffff', bg: '#2a8a4a', size: 100, pad: 22, border: '#ffffff' }); scene.add(ok);
  const flashes = [0, 1, 2, 3].map((i) => { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,255,255,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); f.scale.setScalar(0.6); f.position.set(-2 + i * 1.3, 1.2 + (i % 2) * 0.3, 2.6); scene.add(f); return f; });
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    S.scr.userData.live.update(lt);
    const talk = Math.abs(Math.sin(lt * 8)) * 0.4;
    const nod = smooth(inv(2.3, 2.6, lt)) * (1 - smooth(inv(2.9, 3.2, lt)));
    S.d.pose({ ...STAND, lSh: [-40, 0, 12], lEl: [-50, 0, 0], lCurl: 0.5, rSh: [-45 + Math.sin(lt * 3) * 10, 0, -14], rEl: [-60, 0, 0], rCurl: 0.2, head: [12 * nod, 0, 0] }); idle3(S.d, lt, 3, 0.3);
    S.d.face({ blink: 0, smile: 0.6, brows: 0.3, mouth: talk });
    const k = easeOutElastic(inv(1.1, 1.7, lt)); yr.scale.setScalar(Math.max(0.001, k)); yr.visible = lt > 1.08;
    pop(ok, lt, 2.4, 0.3);
    flashes.forEach((f, i) => { const ph = ((lt * 1.3 + i * 0.37) % 1); f.material.opacity = ph < 0.08 ? 1 - ph / 0.08 : 0; f.visible = f.material.opacity > 0.01; });
    const f = kf(lt, [[0, [1.5, 1.8, 3.6], [0, 1.9, -0.8], 52, 0.03], [3.85, [-0.5, 1.75, 2.2], [0, 1.85, -0.8], 46, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(ok, camera, 2.8, 0, -0.1);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.22, ao: 1.0 };
}

// 48.00–49.60  «именно в честь Сегале,»
export function buildHonor() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0a0a10');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), M.std({ color: '#1a1a22', roughness: 0.4, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#c8d0ff', '#100c10', 0.4));
  const key = new THREE.SpotLight('#fff0dc', 30, 10, 0.6, 0.5, 1.2); key.position.set(0, 5, 3); key.target.position.set(0, 1, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key, key.target);
  const L = cast7.landlord(); L.root.position.set(0.55, 0, 0); L.root.rotation.y = -0.3; scene.add(L.root);
  const hero = heroSprite(0.1); hero.position.set(-0.6, 0, 0); hero.rotation.y = 0.3; scene.add(hero);
  const eq = text3d('=', { family: 'mont', size: 0.5, depth: 0.1, bevel: 0.015, color: '#ffd23a', side: '#a8700a', emissive: '#ffb020', emissiveIntensity: 0.3 }); eq.position.set(0, 1.0, 0.3); scene.add(eq);
  const t1 = nameTag('MARIO', { w: 0.7, bg: '#d8281e', color: '#ffffff', border: '#ffffff' }); scene.add(t1);
  const t2 = nameTag('СЕГАЛЕ', { w: 0.8, bg: '#5a4632', color: '#ffffff', border: '#ffffff' }); scene.add(t2);
  const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 60);
  function update(lt) {
    L.pose({ ...STAND, lSh: [-10, 0, 10], rSh: [-10, 0, -10] }); idle3(L, lt, 2, 0.3); L.face({ blink: 0, brows: 0.1, smile: 0.2 });
    pop(eq, lt, 0.3, 0.3, 2.6); eq.rotation.y = Math.sin(lt * 3) * 0.2;
    pop(t1, lt, 0.1, 0.3); t1.position.set(-0.6, 1.9, 0.2); pop(t2, lt, 0.5, 0.3); t2.position.set(0.55, 2.05, 0.2);
    const f = kf(lt, [[0, [0.3, 1.5, 4.4], [0, 1.2, 0], 52, 0.03], [1.6, [-0.2, 1.6, 4.0], [0, 1.25, 0], 50, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    t1.lookAt(camera.position); t2.lookAt(camera.position);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.35, bloomThreshold: 0.88, envIntensity: 0.25, ao: 1.0 };
}

// 49.60–51.45  «но не рассказал, как это вышло.»
export function buildShrug() {
  const scene = new THREE.Scene(); const S = pressStage(scene, slideDraw('?', '#ffd23a'));
  const qs = [0, 1, 2].map(() => { const q = sign('?', { width: 0.2, color: '#1a1a1a', bg: '#ffd23a', size: 200, pad: 8 }); scene.add(q); return q; });
  const t1 = sign('КАК — НЕ РАССКАЗАЛ', { width: 1.3, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.05, 60);
  function update(lt) {
    S.scr.userData.live.update(lt);
    const sh = smooth(inv(0.3, 0.7, lt));
    S.d.pose({ ...STAND, lSh: [-20, 0, 18 + 40 * sh], rSh: [-20, 0, -18 - 40 * sh], lEl: [-80 - 20 * sh, 0, 0], rEl: [-80 - 20 * sh, 0, 0], lWr: [0, 0, -40 * sh], rWr: [0, 0, 40 * sh], lCurl: 0.1, rCurl: 0.1, head: [0, 0, 10 * sh] }); idle3(S.d, lt, 3, 0.3);
    S.d.face({ blink: 0, smile: 0.5, brows: 0.8, mouth: 0.05 });
    qs.forEach((q, i) => { pop(q, lt, 0.4 + i * 0.2, 0.3, 2.6); q.position.set(-0.55 + i * 0.55, 2.5 + Math.sin(lt * 3 + i) * 0.05, -0.8); });
    pop(t1, lt, 0.5, 0.3);
    const f = kf(lt, [[0, [-0.4, 1.8, 2.4], [0, 1.85, -0.8], 46, -0.02], [1.85, [0.3, 1.8, 2.7], [0, 1.85, -0.8], 48, 0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    qs.forEach((q) => q.lookAt(camera.position));
    hud(t1, camera, 2.6, 0, 0.9);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.22, ao: 1.0 };
}

const wifeDraw = (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#a8c8e8'); gr.addColorStop(1, '#e8d8c0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#5a3a24'; g.beginPath(); g.ellipse(w / 2, h * 0.36, 70, 80, 0, 0, 7); g.fill(); g.fillStyle = '#f0c8a4'; g.beginPath(); g.ellipse(w / 2, h * 0.4, 52, 62, 0, 0, 7); g.fill(); g.fillStyle = '#c84a6a'; g.beginPath(); g.ellipse(w / 2, h * 0.92, 110, 120, 0, Math.PI, 0); g.fill(); g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(w / 2 - 20, h * 0.38, 5, 0, 7); g.arc(w / 2 + 20, h * 0.38, 5, 0, 7); g.fill(); g.strokeStyle = '#a8484e'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, h * 0.44, 16, 0.2, Math.PI - 0.2); g.stroke(); };
// 54.20–57.10  «имя от жены одного из сотрудников Nintendo of America.»
export function buildWife() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0c0c10');
  room6(scene, { w: 5, d: 5, h: 2.8, wall: '#c8bca8', floor: woodFloor('#6a4a30'), windowAt: { wall: 'left', rect: [-0.5, 1.6, 1.4, 1.1] }, open: ['front'] });
  scene.add(new THREE.HemisphereLight('#f0f0ff', '#3a2a1a', 0.5));
  const dk = desk6(1.6, 0.8, 0.75, '#8a6440', '#2a2a30'); dk.position.set(0, 0, -1.6); scene.add(solid(dk, 'desk', [], [dk.userData.top]));
  const fr = photoFrame(wifeDraw); fr.position.set(-0.3, 0.75 + 0.21, -1.65); fr.rotation.y = 0.25; scene.add(fr);
  const w1 = cast7.worker1(); w1.root.position.set(0.85, 0, -0.9); w1.root.rotation.y = -0.7; scene.add(w1.root);
  const tag = nameTag('ПОЛИН', { w: 0.5, bg: '#ff6aa8', color: '#ffffff', border: '#ffffff' }); scene.add(tag);
  const t1 = sign('ИМЯ — ОТ ЖЕНЫ СОТРУДНИКА', { width: 1.6, color: '#ffffff', bg: '#d8281e', size: 90, pad: 20, border: '#ffffff' }); scene.add(t1);
  const t2 = sign('NINTENDO OF AMERICA', { width: 1.3, color: '#ffffff', bg: '#2a2a34', size: 90, pad: 18 }); t2.position.set(0.5, 2.2, -2.47); scene.add(t2);
  const key = new THREE.SpotLight('#fff0dc', 20, 8, 0.7, 0.6, 1.2); key.position.set(-1.8, 2.6, 0.4); key.target.position.set(0, 0.9, -1.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const camera = new THREE.PerspectiveCamera(48, 1080 / 1920, 0.05, 60);
  function update(lt) {
    w1.pose({ ...STAND, rSh: [-40, 0, -20], rEl: [-50, 0, 0], rCurl: 0.2, lSh: [-10, 0, 10] }); idle3(w1, lt, 4, 0.3); w1.face({ blink: 0, smile: 0.8, brows: 0.3, mouth: 0.15 });
    pop(tag, lt, 0.5, 0.3); tag.position.set(-0.3, 1.38, -1.62); tag.rotation.y = 0.25;
    pop(t1, lt, 0.9, 0.3);
    const f = kf(lt, [[0, [0.7, 1.4, 0.4], [-0.25, 1.0, -1.6], 46, 0.03], [2.9, [-0.5, 1.5, 0.6], [-0.1, 1.2, -1.6], 50, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.003, 5, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.4, 0, 0.78);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.25, ao: 1.0 };
}

// 57.10–59.45  «Сам Сегале не любил известности и хотел,»
export function buildShy() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#07070c');
  const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 48), M.std({ color: '#18181e', roughness: 0.4, metalness: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#a0a8ff', '#100810', 0.3));
  const spot = new THREE.SpotLight('#fff0dc', 40, 10, 0.35, 0.4, 1.2); spot.position.set(0, 6, 1.5); spot.target.position.set(0, 0, 0); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); scene.add(spot, spot.target);
  const circle = new THREE.Mesh(new THREE.CircleGeometry(1.0, 48), new THREE.MeshBasicMaterial({ color: '#fff4dc', transparent: true, opacity: 0.12, depthWrite: false })); circle.rotation.x = -Math.PI / 2; circle.position.y = 0.01; scene.add(circle);
  const cams = [[-1.6, 2.0], [0.0, 2.6], [1.6, 2.0]].map(([x, z], i) => { const c = tripodCam(); c.position.set(x, 0, z); c.lookAt(0, 0, 0); scene.add(solid(c, 'cam' + i)); return c; });
  const flashes = cams.map((c) => { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,255,255,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); f.scale.setScalar(0.7); f.position.copy(c.position).multiplyScalar(0.88).setY(1.38); scene.add(f); return f; });
  const L = cast7.landlord(); scene.add(L.root);
  const t1 = sign('НЕ ЛЮБИЛ ИЗВЕСТНОСТИ', { width: 1.5, color: '#ffffff', bg: '#3a3a46', size: 100, pad: 20, border: '#ffffff' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(52, 1080 / 1920, 0.05, 60);
  function update(lt) {
    const turn = smooth(inv(0.4, 1.0, lt)); const walk = smooth(inv(1.0, 2.35, lt));
    L.root.rotation.y = lerp(0, Math.PI, turn); L.root.position.set(0, 0, lerp(0, -1.6, walk));
    const wpz = walkPose(lt * 1.5, walk > 0.01 && walk < 0.99 ? 0.8 : 0);
    L.pose({ ...(walk > 0.01 ? wpz : STAND), rSh: [-90 * (1 - turn) - 10 * turn, 0, -14], rEl: [-90 * (1 - turn), 0, 0], rCurl: 0.1 }); idle3(L, lt, 2, 0.3); L.face({ blink: 0, brows: -0.5, mouth: 0.05 });
    flashes.forEach((f, i) => { const ph = ((lt * 1.6 + i * 0.31) % 1); f.material.opacity = ph < 0.08 ? (1 - ph / 0.08) * 0.8 : 0; f.visible = f.material.opacity > 0.01; });
    pop(t1, lt, 1.25, 0.3);
    const f = kf(lt, [[0, [0.3, 1.6, 4.2], [0, 1.3, 0], 50, 0.03], [2.35, [-0.6, 1.9, 4.6], [0, 1.2, -1.0], 52, -0.03]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 6, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 2.8, 0, 0.85);
  }
  return { scene, camera, update, exposure: 1.0, bloom: 0.4, bloomThreshold: 0.86, envIntensity: 0.2, ao: 1.0 };
}

// 59.45–62.45  «чтобы о нём помнили по его делам, а не по игре.»
export function buildDeeds() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#e8b48a'); scene.fog = new THREE.Fog('#e8b48a', 25, 90);
  scene.add(new THREE.HemisphereLight('#ffe0c0', '#5a4a3a', 0.9));
  const sun = new THREE.DirectionalLight('#ffd8a8', 2.6); sun.position.set(-8, 6, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); scene.add(sun);
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), M.std({ map: TEX.concrete([20, 20], '#9a968e'), roughness: 0.8 })); gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; scene.add(gnd);
  // a row of warehouses the landlord built
  const corr = canvasTex('corr7b', 256, 256, (c, W, H) => { for (let x = 0; x < W; x += 16) { const gr = c.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#8a9096'); gr.addColorStop(0.5, '#b8c0c6'); gr.addColorStop(1, '#8a9096'); c.fillStyle = gr; c.fillRect(x, 0, 16, H); } }, { repeat: [4, 1] });
  const blds = [[-7, -12, 8], [2, -14, 10], [11, -12, 8]].map(([x, z, w], i) => { const g = new THREE.Group(); box(w, 5, 7, M.std({ map: corr, roughness: 0.6, metalness: 0.3 }), 0, 2.5, 0, g); const roof = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, w, 3, 1, false, 0, Math.PI * 2), M.col('#5a5e66', 0.6)); roof.rotation.z = Math.PI / 2; roof.scale.set(1, 1, 0.3); roof.position.y = 5; g.add(roof); box(2.4, 2.8, 0.1, M.col('#c8302a', 0.6), 0, 1.4, 3.51, g); const s = sign(['СКЛАД 1', 'СКЛАД 2', 'СКЛАД 3'][i], { width: 2.2, color: '#ffffff', bg: '#2a2a34', size: 100, pad: 16 }); s.position.set(0, 4.0, 3.52); g.add(s); g.position.set(x, 0, z); scene.add(shadows(g)); return g; });
  const L = cast7.landlord(); L.root.position.set(0.2, 0, 0); L.root.rotation.y = Math.PI + 0.3; scene.add(L.root);
  const cab = arcadeCab((g, w, h, t) => arcadeDraw(g, w, h, t, { name: 'MARIO' }), 'ARCADE', '#2a4ab8'); cab.scale.setScalar(0.6); cab.position.set(-2.4, 0, 1.0); cab.rotation.y = 0.5; scene.add(solid(cab, 'cab'));
  const t1 = sign('ПО ДЕЛАМ, А НЕ ПО ИГРЕ', { width: 1.6, color: '#1a1a1a', bg: '#ffd23a', size: 100, pad: 22, border: '#1a1a1a' }); scene.add(t1);
  const camera = new THREE.PerspectiveCamera(54, 1080 / 1920, 0.05, 200);
  function update(lt) {
    cab.userData.live.update(lt);
    L.pose({ ...STAND, lSh: [-6, 0, 10], rSh: [-6, 0, -10], head: [-6, 0, 0] }); idle3(L, lt, 2, 0.3); L.face({ blink: 0, smile: 0.3 });
    blds.forEach((b, i) => { const k = easeOutBack(inv(0.1 + i * 0.2, 0.6 + i * 0.2, lt), 1.6); b.scale.set(1, Math.max(0.001, k), 1); });
    const fade = smooth(inv(1.4, 2.2, lt)); cab.scale.setScalar(Math.max(0.001, 0.6 * (1 - fade))); cab.visible = fade < 0.99;
    pop(t1, lt, 1.55, 0.3);
    const f = kf(lt, [[0, [1.4, 1.5, 4.0], [0, 1.6, -2], 54, 0.03], [3.0, [-0.6, 2.4, 6.5], [0, 3.0, -8], 58, -0.02]]);
    setCam(camera, f.pos.add(shake(lt, 0.004, 4, 2)), f.look, f.roll, f.fov);
    hud(t1, camera, 3.0, 0, 0.95);
  }
  return { scene, camera, update, exposure: 0.95, bloom: 0.25, bloomThreshold: 0.92, envIntensity: 0.3, ao: 0.8 };
}
