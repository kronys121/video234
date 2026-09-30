import * as THREE from 'three';
import { canvasTex, glowTex, smokeTex, rng, M, TEX, labelTex, clamp } from './util.js';

export function skyDome(stops, radius = 300) {
  const key = 'sky' + stops.map((s) => s.join(':')).join('|');
  const tex = canvasTex(key, 8, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    stops.forEach(([p, c]) => gr.addColorStop(p, c));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }, { repeat: [1, 1] });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.renderOrder = -10;
  return m;
}

export function cloudTex() {
  return canvasTex('cloud', 256, 128, (g, w, h) => {
    const r = rng(202);
    for (let i = 0; i < 26; i++) {
      const x = w * (0.2 + r() * 0.6), y = h * (0.45 + r() * 0.25), rad = 18 + r() * 34;
      const gr = g.createRadialGradient(x, y - rad * 0.2, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(245,247,252,0.7)'); gr.addColorStop(1, 'rgba(230,235,245,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
    }
  }, { repeat: [1, 1] });
}
export function clouds(n, seed, area = 200, y = 60) {
  const g = new THREE.Group(); const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex(), transparent: true, depthWrite: false, fog: false, opacity: 0.95 }));
    const sc = 20 + r() * 30; s.scale.set(sc * 2, sc, 1);
    s.position.set((r() - 0.5) * area, y + r() * 30, -60 - r() * area * 0.6); g.add(s);
  }
  return g;
}

export function sun(scene, { color = '#fff4e0', intensity = 3, pos = [30, 50, 20], target = [0, 0, 0], size = 20, mapSize = 2048, bias = -0.0004 } = {}) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(...pos); l.target.position.set(...target);
  l.castShadow = true;
  l.shadow.mapSize.set(mapSize, mapSize);
  const c = l.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 1; c.far = 200;
  l.shadow.bias = bias; l.shadow.normalBias = 0.02; l.shadow.radius = 3;
  scene.add(l, l.target);
  return l;
}

export function point(scene, color, intensity, dist, pos, shadow = false) {
  const l = new THREE.PointLight(color, intensity, dist, 2);
  l.position.set(...pos);
  if (shadow) { l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.002; l.shadow.radius = 4; }
  scene.add(l); return l;
}

export function flameTex() {
  return canvasTex('flame', 128, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h * 0.72, 2, w / 2, h * 0.6, w * 0.5);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 0.95, h * 0.45, w * 0.95, h * 0.95, w / 2, h * 0.98); g.bezierCurveTo(w * 0.05, h * 0.95, w * 0.05, h * 0.45, w / 2, 0); g.fill();
  }, { repeat: [1, 1] });
}
// animated fire: rising flame sprites (yellow core -> orange -> red) + glow. update(t)
export function fire(scale = 1, seed = 1) {
  const g = new THREE.Group(); const r = rng(seed);
  const tex = flameTex();
  const fl = [];
  const N = 18;
  for (let i = 0; i < N; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.userData = { x: (r() - 0.5) * 0.9, z: (r() - 0.5) * 0.9, off: r(), L: 0.55 + r() * 0.4, sz: 0.5 + r() * 0.5, ph: r() * 10 };
    g.add(s); fl.push(s);
  }
  const core = new THREE.Color('#fff0b0'), mid = new THREE.Color('#ff8a1e'), end = new THREE.Color('#b8260a');
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,140,40,1)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6 }));
  glow.scale.setScalar(3.2); glow.position.y = 0.7; g.add(glow);
  g.scale.setScalar(scale);
  g.userData.update = (t) => {
    fl.forEach((s) => {
      const u = s.userData; const k = ((t / u.L + u.off) % 1);
      s.position.set(u.x * (1 - k * 0.7) + Math.sin(t * 7 + u.ph) * 0.06, k * 1.5, u.z * (1 - k * 0.7));
      const sz = u.sz * (1 - k * 0.65);
      s.scale.set(sz * 0.8, sz * 1.5, 1);
      s.material.color.copy(k < 0.35 ? core.clone().lerp(mid, k / 0.35) : mid.clone().lerp(end, (k - 0.35) / 0.65));
      s.material.opacity = Math.sin(Math.PI * Math.min(1, k * 1.2)) * 0.85;
    });
    glow.material.opacity = 0.45 + 0.15 * Math.sin(t * 13 + seed);
  };
  return g;
}

// deterministic particle system (sprites) driven by closed-form motion
export function particles({ n = 60, seed = 3, tex = null, color = '#ffffff', size = [0.1, 0.3], life = [1, 3], origin = [0, 0, 0], spread = [1, 0, 1], vel = [0, 1, 0], velSpread = [0.3, 0.3, 0.3], grav = 0, grow = 1, additive = true, opacity = 1, fade = true, turb = 0 }) {
  const g = new THREE.Group(); const r = rng(seed);
  const map = tex || glowTex();
  const ps = [];
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, opacity }));
    const L = life[0] + r() * (life[1] - life[0]);
    s.userData = {
      o: [origin[0] + (r() - 0.5) * spread[0], origin[1] + (r() - 0.5) * spread[1], origin[2] + (r() - 0.5) * spread[2]],
      v: [vel[0] + (r() - 0.5) * velSpread[0] * 2, vel[1] + (r() - 0.5) * velSpread[1] * 2, vel[2] + (r() - 0.5) * velSpread[2] * 2],
      L, off: r() * L, sz: size[0] + r() * (size[1] - size[0]), rot: r() * 6, ph: r() * 10,
    };
    s.material.rotation = s.userData.rot;
    g.add(s); ps.push(s);
  }
  g.userData.update = (t) => {
    ps.forEach((s) => {
      const u = s.userData; const a = ((t + u.off) % u.L); const k = a / u.L;
      s.position.set(u.o[0] + u.v[0] * a + Math.sin(a * 2 + u.ph) * turb, u.o[1] + u.v[1] * a - 0.5 * grav * a * a, u.o[2] + u.v[2] * a + Math.cos(a * 1.7 + u.ph) * turb);
      s.scale.setScalar(u.sz * (1 + (grow - 1) * k));
      s.material.opacity = opacity * (fade ? Math.sin(Math.PI * clamp(k)) : 1);
      s.material.rotation = u.rot + a * 0.3;
    });
  };
  return g;
}
export const smoke = (o) => particles({ tex: smokeTex(), additive: false, color: '#3a3430', grow: 3, ...o });
export const embers = (o) => particles({ tex: glowTex('rgba(255,170,60,1)'), color: '#ffb050', size: [0.03, 0.08], ...o });

// flat sign/plaque with canvas text
export function sign(text, { width = 1, font = 'Russo', color = '#fff', bg = null, size = 120, pad = 40, emissive = 0, grunge = 0, lines = null, border = null, rough = 0.6, double = false } = {}) {
  const { tex, aspect } = labelTex(text, { font, color, bg, size, pad, grunge, lines, border });
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: !bg, roughness: rough, emissive: emissive ? '#ffffff' : '#000', emissiveMap: emissive ? tex : null, emissiveIntensity: emissive, side: double ? THREE.DoubleSide : THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: -2 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width / aspect), mat);
  m.receiveShadow = true;
  return m;
}

// wooden/metal crate with optional stencil text on faces
export function crate(w = 1, h = 0.6, d = 0.6, { stencil = null, color = '#6d6a3e', wood = false } = {}) {
  const g = new THREE.Group();
  const mat = wood ? M.std({ map: TEX.plywood([1, 1], '#9b7447'), roughness: 0.85 }) : M.std({ color, roughness: 0.75, map: TEX.metal([1, 1], color), metalness: 0.2 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); g.add(b);
  const trim = wood ? M.col('#6b4e2c', 0.8) : M.col(new THREE.Color(color).multiplyScalar(0.7), 0.6, 0.3);
  for (const y of [-h / 2 + 0.03, h / 2 - 0.03]) { const t = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.05, d + 0.02), trim); t.position.y = y; g.add(t); }
  for (const x of [-w / 2 + 0.03, w / 2 - 0.03]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, d + 0.02), trim); t.position.x = x; g.add(t); }
  if (stencil) {
    const s = sign(stencil, { width: w * 0.8, color: wood ? '#1f1a12' : '#e8e2cf', grunge: 0.9, pad: 20 });
    s.position.z = d / 2 + 0.012; g.add(s);
  }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

export function ground(size, mat, seg = 1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size, seg, seg), mat);
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
}
