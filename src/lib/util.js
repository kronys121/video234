import * as THREE from 'three';

// ---------- math / easing ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const smoother = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInCubic = (t) => Math.pow(clamp(t), 3);
export const easeInOut = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const easeOutBack = (t, s = 1.9) => { t = clamp(t); const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
export const easeOutElastic = (t) => {
  t = clamp(t); if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
};
export const easeOutBounce = (t) => {
  t = clamp(t); const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};
// pop-in scale: 0 before t0, overshoot, settle
export const pop = (t, t0, d = 0.45) => easeOutBack(inv(t0, t0 + d, t));

export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// smooth 1D value noise for camera shake etc.
export function noise1(x, seed = 0) {
  const h = (n) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}
export function shake(t, amp, freq = 9, seed = 0) {
  return new THREE.Vector3(noise1(t * freq, seed) * amp, noise1(t * freq, seed + 7) * amp, noise1(t * freq, seed + 13) * amp * 0.5);
}

// ---------- canvas textures ----------
const texCache = new Map();
export function canvasTex(key, w, h, draw, { repeat = [1, 1], srgb = true, aniso = 8 } = {}) {
  const ck = key + '|' + repeat.join(',') + '|' + srgb;
  if (texCache.has(ck)) return texCache.get(ck);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = aniso;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(ck, t);
  return t;
}

export function speckle(g, w, h, n, colors, rMin, rMax, seed = 1, alpha = 1) {
  const r = rng(seed);
  g.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[Math.floor(r() * colors.length)];
    const rad = rMin + r() * (rMax - rMin);
    g.beginPath(); g.arc(r() * w, r() * h, rad, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 1;
}

export const TEX = {
  brick: (rep = [4, 4]) => canvasTex('brick', 512, 512, (g, w, h) => {
    g.fillStyle = '#b9a996'; g.fillRect(0, 0, w, h);
    const r = rng(3); const bh = 32, bw = 96;
    for (let row = 0; row < h / bh; row++) {
      const off = row % 2 ? bw / 2 : 0;
      for (let x = -bw; x < w + bw; x += bw) {
        const v = r();
        const base = [150 + v * 40, 58 + v * 22, 38 + v * 16];
        g.fillStyle = `rgb(${base[0] | 0},${base[1] | 0},${base[2] | 0})`;
        g.fillRect(x + off + 3, row * bh + 3, bw - 6, bh - 6);
      }
    }
    speckle(g, w, h, 3000, ['#5a2418', '#c77a5a', '#7d3322', '#d9a07f'], 0.5, 2.2, 4, 0.35);
  }, { repeat: rep }),
  brickBump: (rep = [4, 4]) => canvasTex('brickBump', 512, 512, (g, w, h) => {
    g.fillStyle = '#222'; g.fillRect(0, 0, w, h);
    const bh = 32, bw = 96;
    for (let row = 0; row < h / bh; row++) {
      const off = row % 2 ? bw / 2 : 0;
      for (let x = -bw; x < w + bw; x += bw) { g.fillStyle = '#ddd'; g.fillRect(x + off + 3, row * bh + 3, bw - 6, bh - 6); }
    }
    speckle(g, w, h, 4000, ['#999', '#fff'], 0.5, 1.8, 5, 0.5);
  }, { repeat: rep, srgb: false }),
  tiles: (rep = [6, 6], col = '#a7a59f') => canvasTex('tiles' + col, 512, 512, (g, w, h) => {
    g.fillStyle = '#6d6b66'; g.fillRect(0, 0, w, h);
    const r = rng(8); const s = 128;
    for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
      const v = (r() - 0.5) * 18; const c = new THREE.Color(col); c.offsetHSL(0, 0, v / 255);
      g.fillStyle = '#' + c.getHexString(); g.fillRect(x + 2, y + 2, s - 4, s - 4);
    }
    speckle(g, w, h, 2500, ['#8d8a84', '#bcb9b2', '#77746e'], 0.8, 2.2, 9, 0.12);
  }, { repeat: rep }),
  sand: (rep = [20, 20]) => canvasTex('sand', 512, 512, (g, w, h) => {
    g.fillStyle = '#c9a36b'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 16000, ['#b98f58', '#d8b37c', '#a67d49', '#e2c18e'], 0.5, 1.6, 11, 0.6);
    const r = rng(12); g.strokeStyle = 'rgba(120,85,45,0.18)'; g.lineWidth = 2;
    for (let i = 0; i < 40; i++) { const y = r() * h; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.03 + i) * 6); g.stroke(); }
  }, { repeat: rep }),
  plywood: (rep = [2, 2], tint = '#b88a58') => canvasTex('ply' + tint, 512, 512, (g, w, h) => {
    g.fillStyle = tint; g.fillRect(0, 0, w, h);
    const r = rng(21);
    for (let i = 0; i < 120; i++) {
      g.strokeStyle = `rgba(${90 + r() * 40 | 0},${55 + r() * 30 | 0},${25 + r() * 20 | 0},${0.15 + r() * 0.2})`;
      g.lineWidth = 1 + r() * 3; const y = r() * h; g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 8 + Math.sin(x * 0.07) * 2); g.stroke();
    }
    g.fillStyle = 'rgba(40,25,10,0.5)'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h);
  }, { repeat: rep }),
  // 1991 Desert Battle Dress "chocolate chip" camo
  dcu: (rep = [3, 3]) => canvasTex('dcu', 512, 512, (g, w, h) => {
    g.fillStyle = '#c4ab80'; g.fillRect(0, 0, w, h);
    const r = rng(31);
    const blob = (col, n, s) => { g.fillStyle = col; for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.ellipse(x, y, s * (0.6 + r()), s * (0.3 + r() * 0.5), r() * 3, 0, 7); g.fill(); } };
    blob('#a3875a', 40, 40); blob('#7d5e3a', 28, 30); blob('#5e442a', 16, 18);
    speckle(g, w, h, 90, ['#1e1a16'], 3, 7, 32); speckle(g, w, h, 70, ['#f4efe4'], 2, 5, 33);
  }, { repeat: rep }),
  denim: (rep = [2, 2], col = '#3d5a86') => canvasTex('denim' + col, 256, 256, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    for (let i = -h; i < w; i += 3) { g.strokeStyle = 'rgba(255,255,255,0.07)'; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); }
    speckle(g, w, h, 1500, ['rgba(255,255,255,0.12)', 'rgba(0,0,0,0.15)'], 0.4, 1.2, 41);
  }, { repeat: rep }),
  fabric: (rep = [3, 3], col = '#ffffff') => canvasTex('fabric' + col, 256, 256, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 2) { g.fillStyle = 'rgba(0,0,0,0.04)'; g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); }
    speckle(g, w, h, 800, ['rgba(0,0,0,0.06)', 'rgba(255,255,255,0.08)'], 0.5, 1.5, 42);
  }, { repeat: rep }),
  soot: (rep = [1, 1]) => canvasTex('soot', 512, 512, (g, w, h) => {
    g.fillStyle = '#2a2521'; g.fillRect(0, 0, w, h);
    const r = rng(51);
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = r() * h, rad = 20 + r() * 70; const c = ['#0e0c0b', '#3e3630', '#4e4238', '#161311'][i % 4];
      const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = 0.5; g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    g.globalAlpha = 1;
    speckle(g, w, h, 6000, ['#000', '#4a4038', '#5e5145'], 0.4, 1.3, 53, 0.55);
  }, { repeat: rep }),
  metal: (rep = [1, 1], col = '#8a8d90') => canvasTex('metal' + col, 256, 256, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    const r = rng(61);
    for (let i = 0; i < 300; i++) { g.strokeStyle = `rgba(255,255,255,${r() * 0.08})`; const y = r() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (r() - 0.5) * 4); g.stroke(); }
    speckle(g, w, h, 300, ['rgba(0,0,0,0.15)'], 0.5, 2, 62);
  }, { repeat: rep }),
  concrete: (rep = [4, 4], col = '#9a968f') => canvasTex('concrete' + col, 512, 512, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 3000, ['#85817b', '#aeaaa3', '#77736d', '#c2beb6'], 1, 3, 71, 0.18);
    speckle(g, w, h, 60, ['rgba(60,55,50,0.12)'], 20, 60, 72);
  }, { repeat: rep }),
  grass: (rep = [10, 10]) => canvasTex('grass', 256, 256, (g, w, h) => {
    g.fillStyle = '#4f7a34'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 5000, ['#3e6629', '#6a9444', '#5b8a3a', '#2f5220'], 0.5, 1.8, 81, 0.7);
  }, { repeat: rep }),
  cardboard: (rep = [1, 1]) => canvasTex('cardboard', 512, 512, (g, w, h) => {
    g.fillStyle = '#b58a57'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(90,60,30,0.08)'; g.fillRect(x, 0, 2, h); }
    speckle(g, w, h, 2000, ['#a07645', '#c79c68', '#8d6538'], 0.5, 2, 91, 0.5);
  }, { repeat: rep }),
  carpet: (rep = [6, 6], col = '#7a1f24') => canvasTex('carpet' + col, 256, 256, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 6000, ['rgba(0,0,0,0.18)', 'rgba(255,255,255,0.06)'], 0.4, 1.3, 95);
  }, { repeat: rep }),
};

// text label texture (for signs, stencils, plaques). Returns texture + aspect.
export function labelTex(text, { font = 'Russo', size = 120, color = '#fff', bg = null, pad = 40, stroke = null, strokeW = 0, w = null, h = null, lines = null, weight = '', align = 'center', grunge = 0, border = null } = {}) {
  const key = 'lbl|' + [text, font, size, color, bg, pad, stroke, strokeW, w, h, weight, grunge, border, lines ? lines.join('~') : ''].join('|');
  const ls = lines || [text];
  const mc = document.createElement('canvas').getContext('2d');
  mc.font = `${weight} ${size}px ${font}`;
  const tw = Math.max(...ls.map((l) => mc.measureText(l).width));
  const W = w || Math.ceil(tw + pad * 2), H = h || Math.ceil(size * 1.15 * ls.length + pad * 2);
  const tex = canvasTex(key, W, H, (g) => {
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, W, H); }
    if (border) { g.strokeStyle = border; g.lineWidth = size * 0.08; g.strokeRect(size * 0.12, size * 0.12, W - size * 0.24, H - size * 0.24); }
    g.font = `${weight} ${size}px ${font}`; g.textAlign = align; g.textBaseline = 'middle';
    ls.forEach((l, i) => {
      const y = H / 2 + (i - (ls.length - 1) / 2) * size * 1.15;
      const x = align === 'center' ? W / 2 : pad;
      if (stroke) { g.lineJoin = 'round'; g.strokeStyle = stroke; g.lineWidth = strokeW; g.strokeText(l, x, y); }
      g.fillStyle = color; g.fillText(l, x, y);
    });
    if (grunge) {
      g.globalCompositeOperation = 'destination-out';
      speckle(g, W, H, Math.floor(W * H / 400 * grunge), ['#000'], 0.8, 3.5, text.length * 7 + 1, 0.8);
      g.globalCompositeOperation = 'source-over';
    }
  }, { repeat: [1, 1] });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return { tex, aspect: W / H };
}

// glow sprite texture (radial gradient) for halos / fake bloom
export function glowTex(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  return canvasTex('glow' + inner + outer, 128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, inner); gr.addColorStop(0.25, inner.replace(/[\d.]+\)$/, '0.55)')); gr.addColorStop(1, outer);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }, { repeat: [1, 1] });
}
export function smokeTex() {
  return canvasTex('smoke', 256, 256, (g, w, h) => {
    const r = rng(101);
    for (let i = 0; i < 40; i++) {
      const x = w / 2 + (r() - 0.5) * w * 0.45, y = h / 2 + (r() - 0.5) * h * 0.45, rad = w * (0.12 + r() * 0.2);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(255,255,255,0.10)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }
  }, { repeat: [1, 1] });
}

// ---------- material helpers ----------
export const M = {
  std: (o) => new THREE.MeshStandardMaterial(o),
  col: (color, rough = 0.7, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }),
  emis: (color, intensity = 2) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity, roughness: 1 }),
};

export function shadowAll(obj, cast = true, receive = true) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
  return obj;
}

export function sprite(tex, color = 0xffffff, size = 1, additive = true, opacity = 1) {
  const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
  const s = new THREE.Sprite(m); s.scale.setScalar(size); return s;
}

// camera helper: position + lookAt + roll + fov
export function setCam(cam, pos, look, roll = 0, fov = null) {
  cam.position.copy(pos);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(look);
  if (fov && cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
// Catmull-Rom path evaluation for camera flights (uniform, clamped ends)
export function path(points, t) {
  const P = points.map((p) => (p.isVector3 ? p : V(...p)));
  const n = P.length - 1; const f = clamp(t) * n; const i = Math.min(Math.floor(f), n - 1); const u = f - i;
  const p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, n)];
  const c = (a, b, c2, d) => 0.5 * ((2 * b) + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u * u + (-a + 3 * b - 3 * c2 + d) * u * u * u);
  return V(c(p0.x, p1.x, p2.x, p3.x), c(p0.y, p1.y, p2.y, p3.y), c(p0.z, p1.z, p2.z, p3.z));
}

// keyframed camera: frames = [[t, [px,py,pz], [lx,ly,lz], fov?, roll?], ...] smooth-stepped between neighbours
export function kf(t, frames) {
  let i = 0; while (i < frames.length - 2 && t >= frames[i + 1][0]) i++;
  const a = frames[i], b = frames[Math.min(i + 1, frames.length - 1)];
  const k = a === b ? 0 : smooth(inv(a[0], b[0], t));
  const L = (x, y) => lerp(x, y, k);
  return { pos: V(L(a[1][0], b[1][0]), L(a[1][1], b[1][1]), L(a[1][2], b[1][2])), look: V(L(a[2][0], b[2][0]), L(a[2][1], b[2][1]), L(a[2][2], b[2][2])), fov: L(a[3] ?? 50, b[3] ?? 50), roll: L(a[4] ?? 0, b[4] ?? 0) };
}
