import * as THREE from 'three';
import { M, TEX, canvasTex, rng } from './util.js';
import { box, rbox, desk, deskLamp, poster } from './props.js';
import { room } from './rooms.js';
import { sign, point } from './env.js';
import { gameboy } from './gameboy.js';

export function nintendoLogo(g, W, H, bg = '#ffffff') {
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#e4000f'; g.lineWidth = H * 0.06;
  g.beginPath(); g.ellipse(W / 2, H / 2, W * 0.42, H * 0.3, 0, 0, 7); g.stroke();
  g.fillStyle = '#e4000f'; g.font = `${H * 0.26}px Russo`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Nintendo', W / 2, H / 2 + 2);
}

// bright R&D lab with workbench centred at origin (bench top y = 0.9, engineers stand at z ≈ -0.75)
export function labSet(scene) {
  const R = room({ w: 7, d: 7, h: 3, wall: M.std({ color: '#e9e6df', roughness: 0.9 }), floor: M.std({ map: TEX.tiles([6, 6], '#b9bcc0'), roughness: 0.5 }), ceil: M.col('#f0f0ee', 0.9), open: [] });
  R.position.z = -1; scene.add(R);
  scene.add(new THREE.HemisphereLight('#ffffff', '#8a8680', 0.7));
  // ceiling light panels
  for (const [x, z] of [[-1.2, -0.5], [1.2, -0.5], [-1.2, -3], [1.2, -3], [0, 1.5]]) { const p = box(1.1, 0.03, 0.5, M.emis('#fff6e8', 2.2), x, 2.98, z, scene); p.castShadow = false; }
  const key = new THREE.DirectionalLight('#fff4e6', 1.6); key.position.set(1.5, 4, 3); key.target.position.set(0, 0.9, -0.4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 12 }); key.shadow.bias = -0.0005; scene.add(key, key.target);
  const bench = desk(2.4, 1.0, 0.9, '#d9d5cb'); bench.position.z = -0.2; scene.add(bench);
  const mat = rbox(1.2, 0.006, 0.6, 0.004, M.col('#4d6f8f', 0.7), 0, 0.93, -0.1, scene); mat.receiveShadow = true;
  const lamp = deskLamp('#ffe2b8'); lamp.position.set(0.85, 0.93, -0.55); lamp.rotation.y = -0.6; scene.add(lamp);
  // tools
  const tools = new THREE.Group(); scene.add(tools);
  const r = rng(12);
  ['#d2232a', '#f2c400', '#2a62c9', '#1f9a4a'].forEach((c, i) => {
    const sd = new THREE.Group();
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.09, 12), M.col(c, 0.35)); sd.add(h);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.08, 8), M.col('#cfd2d6', 0.2, 1)); s.position.y = 0.085; sd.add(s);
    sd.rotation.set(Math.PI / 2, 0, 1.2 + r() * 0.3); sd.position.set(-0.75 + i * 0.05, 0.95, 0.12 + r() * 0.05); tools.add(sd);
  });
  const brush = new THREE.Group();
  const bh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.16, 10), M.col('#b8864a', 0.4)); brush.add(bh);
  const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.008, 0.035, 10), M.col('#222', 0.9)); bb.position.y = -0.095; brush.add(bb);
  const bm = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.012, 10), M.col('#c9c9c9', 0.2, 1)); bm.position.y = -0.075; brush.add(bm);
  // oscilloscope
  const osc = new THREE.Group(); box(0.4, 0.26, 0.3, M.col('#c9c5bc', 0.5), 0, 0.13, 0, osc);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.15), M.std({ map: canvasTex('osc', 200, 150, (g, w, h) => { g.fillStyle = '#062010'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1b5a2c'; for (let x = 0; x < w; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.strokeStyle = '#6bff8a'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x < w; x++) g.lineTo(x, h / 2 + Math.sin(x * 0.12) * 30); g.stroke(); }, { repeat: [1, 1] }), emissive: '#ffffff', emissiveIntensity: 0.6 }));
  scr.material.emissiveMap = scr.material.map; scr.position.set(-0.05, 0.14, 0.151); osc.add(scr);
  for (let i = 0; i < 4; i++) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 12), M.col('#222', 0.4)); k.rotation.x = Math.PI / 2; k.position.set(0.12, 0.2 - i * 0.045, 0.155); osc.add(k); }
  osc.position.set(-0.8, 0.93, -0.5); osc.rotation.y = 0.3; osc.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); scene.add(osc);
  // wall: logo poster + department plaque + shelf of boxed consoles
  const logo = poster((g, W, H) => nintendoLogo(g, W, H), 1.0, 0.75); logo.position.set(-0.9, 1.95, -4.45); scene.add(logo);
  const dep = sign('ИНЖЕНЕРНЫЙ ОТДЕЛ', { width: 1.6, color: '#ffffff', bg: '#e4000f', size: 90, pad: 26 }); dep.position.set(1.0, 2.2, -4.46); scene.add(dep);
  const shelf = box(1.8, 0.04, 0.3, M.col('#8a8f96', 0.5, 0.5), 1.0, 1.55, -4.35, scene); void shelf;
  for (let i = 0; i < 5; i++) {
    const g2 = gameboy(); g2.group.scale.setScalar(1.6); g2.group.position.set(0.3 + i * 0.35, 1.69, -4.3); g2.group.rotation.y = (i - 2) * 0.12; scene.add(g2.group);
  }
  return { bench, brush, lamp };
}

// dark museum / showroom hall with a display case at origin
export function museumSet(scene) {
  const floor = M.std({ map: TEX.tiles([8, 8], '#2d2b2c'), roughness: 0.22, metalness: 0.2 });
  const wall = M.col('#3a2328', 0.9);
  const R = room({ w: 14, d: 14, h: 4.5, wall, floor, ceil: M.col('#151313', 0.9), open: [] }); scene.add(R);
  scene.add(new THREE.HemisphereLight('#ffe8d0', '#201818', 0.35));
  // wall posters (history), lit by small spots
  const r = rng(3);
  const posters = [['1989', '#9bbc0f'], ['GAME BOY', '#8e1c4f'], ['TETRIS', '#e4000f'], ['1991', '#f2c400']];
  posters.forEach(([t, c], i) => {
    const p = poster((g, W, H) => { g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, W, H); g.fillStyle = c; g.fillRect(20, 20, W - 40, H * 0.55); g.fillStyle = '#fff'; g.font = '46px Russo'; g.textAlign = 'center'; g.fillText(t, W / 2, H * 0.78); for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.3})`; g.fillRect(40 + k * 38, 60 + r() * 120, 26, 26); } }, 1.1, 1.45);
    p.position.set(-4.5 + i * 3, 2.2, -6.95); scene.add(p);
    point(scene, '#ffd9a0', 6, 3, [-4.5 + i * 3, 3.6, -6.2]);
  });
  // pedestal + glass case
  const ped = new THREE.Group(); scene.add(ped);
  rbox(0.7, 1.05, 0.7, 0.02, M.col('#f1efe9', 0.4), 0, 0.525, 0, ped);
  rbox(0.78, 0.05, 0.78, 0.01, M.col('#1a1a1a', 0.3, 0.5), 0, 1.075, 0, ped);
  const glassM = new THREE.MeshStandardMaterial({ color: '#dfefff', transparent: true, opacity: 0.1, roughness: 0.02, metalness: 0.1, depthWrite: false, envMapIntensity: 2 });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.6), glassM); glass.position.y = 1.1 + 0.275; ped.add(glass);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: '#cfd8e0', transparent: true, opacity: 0.6 }));
  edge.position.copy(glass.position); ped.add(edge);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.08), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, roughness: 0.05 })); stand.position.y = 1.115; ped.add(stand);
  const plaque = sign('ЛЕГЕНДАРНАЯ', { width: 0.6, color: '#1a1a1a', bg: '#d8b45a', size: 70, pad: 22, lines: ['ЛЕГЕНДАРНАЯ', 'ПРОЧНОСТЬ'], border: '#1a1a1a' });
  plaque.position.set(0, 0.8, 0.352); ped.add(plaque);
  ped.traverse((m) => { if (m.isMesh && m !== glass) { m.castShadow = true; m.receiveShadow = true; } });
  const spot = new THREE.SpotLight('#fff0dc', 30, 8, 0.35, 0.5, 1.2); spot.position.set(0.6, 4.2, 0.9); spot.target.position.set(0, 1.2, 0);
  spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0004; scene.add(spot, spot.target);
  const fill = point(scene, '#ff9a5a', 4, 5, [-2, 2.5, 2]); void fill;
  const burnt = gameboy({ burnt: 1 }); burnt.group.position.set(0, 1.13 + 0.074, 0); burnt.group.rotation.set(-0.08, 0, 0); ped.add(burnt.group);
  const banner = sign('ИСТОРИЯ GAME BOY', { width: 3.2, color: '#ffffff', bg: '#8e1c4f', size: 100, pad: 40 });
  banner.position.set(-6.95, 3.0, -1); banner.rotation.y = Math.PI / 2; scene.add(banner);
  return { ped, plaque, burnt, spot, glass };
}
