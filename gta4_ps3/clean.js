// GTA 4 на PS3 — стиль «светлый минимал». 1920×1080, минимум текста, плоские объекты.
// window.renderAt(t) рисует кадр на момент t детерминированно.

const INK = '#1d1b19', ACC = '#ff5a1f', BGc = '#f2eee7', LINE = '#e2dbcf', MUTE = '#8a8175', BLUE = '#3a6df0', GRN = '#3fb37f';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const P = (t, a, d) => clamp((t - a) / d);
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3), inCubic: (x) => x * x * x,
  inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outBack: (x) => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const fr = (x) => x - Math.floor(x);
const rnd = (i, k = 0) => fr(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);

// ---------- оформление страницы ----------
const st = document.createElement('style');
st.textContent = `
@font-face{font-family:'Mont';font-weight:900;src:url('/node_modules/@fontsource/montserrat/files/montserrat-cyrillic-900-normal.woff2') format('woff2');unicode-range:U+0400-045F}
@font-face{font-family:'Mont';font-weight:900;src:url('/node_modules/@fontsource/montserrat/files/montserrat-latin-900-normal.woff2') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:'Mont';font-weight:600;src:url('/node_modules/@fontsource/montserrat/files/montserrat-latin-600-normal.woff2') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}
#bg{background:${BGc}!important} body{font-family:'Mont',sans-serif}`;
document.head.appendChild(st);
const stage = document.getElementById('stage');
function div(parent, css, html = '') { const d = document.createElement('div'); d.style.cssText = css; d.innerHTML = html; parent.appendChild(d); return d; }
function ab(parent, css, html = '') { const d = div(parent, 'position:absolute;left:0;top:0;' + css, html); return d; }
function tf(el, { x = 0, y = 0, s = 1, sx = null, sy = null, r = 0, o = 1, ax = 0.5, ay = 0.5 } = {}) {
  el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${-ax * 100}%,${-ay * 100}%) rotate(${r.toFixed(2)}deg) scale(${(sx ?? s).toFixed(3)},${(sy ?? s).toFixed(3)})`;
  el.style.opacity = o;
}
function img(parent, src, css) { const i = new Image(); i.src = src; i.style.cssText = 'position:absolute;left:0;top:0;' + css; parent.appendChild(i); return i; }
const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(parent, w, h, vb) { const s = document.createElementNS(SVGNS, 'svg'); s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', vb || `0 0 ${w} ${h}`); s.style.cssText = 'position:absolute;left:0;top:0;overflow:visible'; parent.appendChild(s); return s; }
function mk(par, tag, a = {}) { const e = document.createElementNS(SVGNS, tag); for (const k in a) e.setAttribute(k, a[k]); par.appendChild(e); return e; }
const shadow = (parent, w) => ab(parent, `width:${w}px;height:${w * 0.13}px;border-radius:50%;background:radial-gradient(ellipse,rgba(29,27,25,.30),rgba(29,27,25,0) 70%)`);
const big = (parent, size, col = INK) => ab(parent, `font-weight:900;font-size:${size}px;line-height:1;color:${col};letter-spacing:-.03em;white-space:nowrap`);
// появление: подъём + масштаб с лёгким перелётом
function enter(el, t, t0, x, y, o = {}) {
  const { s = 1, dur = 0.55, dy = 60, r = 0, ax = 0.5, ay = 0.5 } = o;
  const k = E.outBack(P(t, t0, dur)), p = E.outCubic(P(t, t0, dur));
  tf(el, { x, y: y + (1 - p) * dy, s: s * (0.85 + 0.15 * k), r, o: P(t, t0, 0.25), ax, ay });
}
const pend = [];

// ---------- сцены (с плавным уходом) ----------
const scenes = [];
const FADE = 0.22, END = 36.1;
function scene(t0, t1, build, fade = true) { const el = div(stage, 'position:absolute;inset:0;display:none'); const up = build(el); scenes.push({ t0, t1, el, up, fade }); }
const FLOOR = 860;
const floor = ab(document.getElementById('root'), `top:${FLOOR}px;width:1920px;height:2px;background:${LINE}`);
document.getElementById('root').insertBefore(floor, stage);

// плоская машина (вид сбоку), с деформируемым передом
function flatCar(par, col = BLUE) {
  const g = mk(par, 'g');
  const body = mk(g, 'path', { fill: col });
  const win = mk(g, 'path', { fill: '#d6e3ff' });
  const light = mk(g, 'rect', { width: 26, height: 14, rx: 6, fill: '#ffd36b' });
  const wheels = [110, 430].map(() => { const w = mk(g, 'g'); mk(w, 'circle', { r: 44, fill: INK }); mk(w, 'circle', { r: 18, fill: '#bdb6aa' }); return w; });
  const B = [[20, -40], [18, -96], [92, -112], [170, -176], [380, -176], [452, -112], [540, -100], [552, -60], [552, -40]];
  const W = [[184, -164], [368, -164], [424, -114], [152, -114]];
  const path = (pts) => 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z';
  g.set = (x, pen, sc = 1) => {
    const d = (p) => { const infl = Math.pow(clamp((p[0] - 300) / 252), 1.4); return [p[0] - pen * infl, p[1] + Math.sin(p[0] * 0.11) * 22 * (pen / 130) * infl - (p[1] < -90 ? 26 * (pen / 130) * infl : 0)]; };
    body.setAttribute('d', path(B.map(d))); win.setAttribute('d', path(W.map(d)));
    const lp = d([536, -92]); light.setAttribute('x', lp[0] - 20); light.setAttribute('y', lp[1]); light.setAttribute('opacity', pen > 40 ? 0 : 1);
    wheels[0].setAttribute('transform', 'translate(110,-44)'); wheels[1].setAttribute('transform', `translate(${430 - pen * 0.25},-44)`);
    g.setAttribute('transform', `translate(${x},${FLOOR}) scale(${sc})`);
  };
  return g;
}

// ===== S1 · PlayStation 3 (0 – 2.84) =====
scene(0, 2.84, (sc) => {
  const sh = shadow(sc, 620);
  const ps = img(sc, '/gta4_ps3/assets/ps3_fat.png', 'height:700px');
  return (t) => {
    const k = E.outCubic(P(t, 0.05, 0.8));
    tf(sh, { x: 960, y: FLOOR, s: lerp(0.6, 1, k), o: k });
    tf(ps, { x: 960, y: lerp(FLOOR + 80, FLOOR - 340, k), ay: 0.5, o: P(t, 0.05, 0.3) });
  };
}, false);

// ===== S2 · процессор Cell (2.84 – 7.44) =====
scene(2.84, 7.44, (sc) => {
  const sh = shadow(sc, 520);
  const ps = img(sc, '/gta4_ps3/assets/ps3_fat.png', 'height:620px');
  const link = svgEl(sc, 1920, 1080); const ln = mk(link, 'path', { d: 'M 760 520 C 900 520 980 500 1140 500', fill: 'none', stroke: MUTE, 'stroke-width': 5, 'stroke-dasharray': '4 14', 'stroke-linecap': 'round' });
  const chip = ab(sc, 'width:420px;height:420px');
  const pins = (side) => div(chip, `position:absolute;${side};background:repeating-linear-gradient(${side.includes('width:24px') ? '0deg' : '90deg'},#b9b1a3 0 16px,transparent 16px 40px)`);
  pins('left:70px;top:0;width:280px;height:30px'); pins('left:70px;bottom:0;width:280px;height:30px');
  pins('left:0;top:70px;width:24px;height:280px'); pins('right:0;top:70px;width:24px;height:280px');
  div(chip, `position:absolute;left:26px;top:26px;width:368px;height:368px;border-radius:44px;background:${INK};box-shadow:0 24px 40px rgba(29,27,25,.25)`);
  div(chip, `position:absolute;left:90px;top:90px;width:240px;height:240px;border-radius:26px;background:linear-gradient(135deg,#ffb36b,${ACC});display:flex;align-items:center;justify-content:center;font-weight:900;font-size:76px;color:#fff;letter-spacing:-.02em`, 'CELL');
  const rings = [0, 1, 2].map(() => ab(sc, `width:420px;height:420px;border-radius:70px;border:6px solid ${ACC}`));
  return (t) => {
    const k = E.inOut(P(t, 2.84, 0.6));
    tf(sh, { x: lerp(960, 560, k), y: FLOOR, s: lerp(1.2, 1, k) });
    tf(ps, { x: lerp(960, 560, k), y: lerp(FLOOR - 340, FLOOR - 310, k), s: lerp(1.13, 1, k) });
    ln.style.strokeDashoffset = -t * 60; ln.setAttribute('opacity', P(t, 3.4, 0.3));
    enter(chip, t, 3.36, 1340, 500, { dy: 80 });
    const pulse = t > 5.52 ? 1 + 0.035 * Math.sin((t - 5.52) * 10) * Math.exp(-(t - 5.52) * 0.6) : 1;
    chip.style.transform += ` scale(${pulse.toFixed(3)})`;
    rings.forEach((r, i) => { const u = fr((t - 5.52) * 0.9 + i / 3); tf(r, { x: 1340, y: 500, s: 1 + u * 0.6, o: t > 5.52 ? (1 - u) * 0.5 : 0 }); });
  };
});

// ===== S3 · выжимают максимум (7.44 – 12.0) =====
scene(7.44, 12.0, (sc) => {
  const R = 380, cx = 960, cy = 700;
  const s = svgEl(sc, 1920, 1080);
  const arc = (a0, a1, r) => { const p = (a) => [cx + Math.cos(a) * r, cy - Math.sin(a) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M ${x0} ${y0} A ${r} ${r} 0 ${a0 - a1 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`; };
  mk(s, 'path', { d: arc(Math.PI, 0, R), fill: 'none', stroke: LINE, 'stroke-width': 56, 'stroke-linecap': 'round' });
  const fill = mk(s, 'path', { fill: 'none', 'stroke-width': 56, 'stroke-linecap': 'round' });
  for (let i = 0; i <= 10; i++) { const a = Math.PI - (i / 10) * Math.PI; mk(s, 'line', { x1: cx + Math.cos(a) * (R - 60), y1: cy - Math.sin(a) * (R - 60), x2: cx + Math.cos(a) * (R - 84), y2: cy - Math.sin(a) * (R - 84), stroke: '#cfc6b6', 'stroke-width': 6, 'stroke-linecap': 'round' }); }
  const needle = mk(s, 'line', { x1: cx, y1: cy, stroke: INK, 'stroke-width': 16, 'stroke-linecap': 'round' });
  mk(s, 'circle', { cx, cy, r: 30, fill: INK });
  const pct = big(sc, 120, INK);
  return (t) => {
    tf(s, { x: 0, y: 0, ax: 0, ay: 0, o: P(t, 7.44, 0.3) });
    const v = clamp(E.inOut(P(t, 7.9, 10.88 - 7.9)) + (t > 10.88 ? 0 : 0.015 * Math.sin(t * 17)));
    const shake = t > 10.88 ? Math.sin(t * 60) * 0.025 * Math.exp(-(t - 10.88) * 2) : 0;
    const a = Math.PI - v * Math.PI + shake;
    fill.setAttribute('d', v > 0.002 ? arc(Math.PI, Math.PI - v * Math.PI, R) : '');
    fill.setAttribute('stroke', v > 0.85 ? ACC : v > 0.55 ? '#ffb36b' : GRN);
    needle.setAttribute('x2', cx + Math.cos(a) * (R - 110)); needle.setAttribute('y2', cy - Math.sin(a) * (R - 110));
    pct.textContent = Math.round(v * 100) + '%'; pct.style.color = v > 0.85 ? ACC : INK;
    tf(pct, { x: cx, y: cy + 120, o: P(t, 7.6, 0.3) });
  };
});

// ===== S4 · GTA IV (12.0 – 14.08) =====
scene(12.0, 14.08, (sc) => {
  const logo = img(sc, '/gta4_ps3/assets/gta4_logo.png', 'width:760px;filter:drop-shadow(0 26px 30px rgba(29,27,25,.25))');
  return (t) => { const k = E.outBack(P(t, 12.6, 0.6)); tf(logo, { x: 960, y: 500 + (1 - E.outCubic(P(t, 12.6, 0.6))) * 60, s: 0.8 + 0.2 * k + (t - 12.6) * 0.012, o: P(t, 12.6, 0.2) }); };
});

// ===== S5 · работает на PS3 (14.08 – 18.24) =====
scene(14.08, 18.24, (sc) => {
  const card = ab(sc, 'width:1100px;height:798px;border-radius:36px;overflow:hidden;box-shadow:0 40px 80px rgba(29,27,25,.28)');
  const fr0 = img(card, '', 'width:1100px;height:798px');
  const pill = ab(sc, `font-weight:900;font-size:40px;color:#fff;background:${INK};border-radius:40px;padding:14px 34px`, 'PS3');
  const ok = ab(sc, `width:150px;height:150px;border-radius:50%;background:${GRN};box-shadow:0 16px 30px rgba(29,27,25,.25)`,
    `<svg width="150" height="150"><path d="M42 78 L66 102 L110 52" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
  let cur = -1;
  return (t) => {
    enter(card, t, 14.12, 960, 495, { dy: 80 });
    const k = clamp(Math.floor((t - 14.08) * 15) + 1, 1, 65);
    if (k !== cur) { cur = k; fr0.src = `/gta4_ps3/clips/ps3_run_big/${String(k).padStart(4, '0')}.jpg`; pend.push(fr0.decode().catch(() => {})); }
    enter(pill, t, 14.5, 520, 150, { dy: 30 });
    enter(ok, t, 15.92, 1480, 830, { dy: 40, s: 1 });
  };
});

// ===== S6 · карта 16 км² (18.24 – 22.72) =====
scene(18.24, 22.72, (sc) => {
  const wrap = ab(sc, 'width:1150px;height:725px');
  const s = svgEl(wrap, 1150, 725, '0 0 1000 630');
  mk(s, 'rect', { x: 0, y: 0, width: 1000, height: 630, rx: 30, fill: '#cfe2e6' });
  const islands = [
    { d: 'M 90 120 L 300 90 L 330 220 L 300 420 L 230 560 L 110 520 L 70 300 Z', bb: [80, 100, 320, 540] },          // Alderney
    { d: 'M 430 40 L 520 30 L 560 150 L 545 380 L 500 590 L 450 595 L 420 400 L 415 160 Z', bb: [425, 50, 545, 580] },   // Algonquin
    { d: 'M 600 110 L 760 60 L 930 120 L 950 380 L 880 560 L 700 590 L 620 470 L 590 260 Z', bb: [605, 80, 940, 575] },   // Broker / Dukes
    { d: 'M 560 10 L 700 0 L 740 50 L 600 100 L 560 60 Z', bb: [570, 10, 720, 90] },                                     // Bohan
  ];
  const isG = mk(s, 'g');
  const clips = islands.map((I, i) => { const cp = mk(s, 'clipPath', { id: 'is' + i }); mk(cp, 'path', { d: I.d }); return cp; });
  islands.forEach((I, i) => {
    mk(isG, 'path', { d: I.d, fill: '#efe7d6' });
    const g = mk(isG, 'g', { 'clip-path': `url(#is${i})` });
    for (let x = I.bb[0]; x < I.bb[2]; x += 22) for (let y = I.bb[1]; y < I.bb[3]; y += 22) { const n = x * 7 + y * 13 + i; if (rnd(n, 1) < 0.1) continue; mk(g, 'rect', { x: x + 3, y: y + 3, width: 16, height: 16, rx: 3, fill: rnd(n, 2) < 0.12 ? '#b9d8a0' : '#e0d5bf' }); }
  });
  mk(isG, 'rect', { x: 465, y: 210, width: 50, height: 120, rx: 6, fill: '#b9d8a0' }); // Middle Park
  const det = [];
  islands.forEach((I, i) => { for (let k = 0; k < 26; k++) { const n = i * 100 + k; const x = lerp(I.bb[0] + 15, I.bb[2] - 15, rnd(n, 5)), y = lerp(I.bb[1] + 15, I.bb[3] - 15, rnd(n, 6)); const ty = rnd(n, 7);
    const e = ty < 0.4 ? mk(s, 'rect', { x: -11, y: -6, width: 22, height: 12, rx: 4, fill: ty < 0.2 ? ACC : BLUE }) : ty < 0.7 ? mk(s, 'circle', { r: 6, fill: INK }) : mk(s, 'circle', { r: 9, fill: GRN });
    e.setAttribute('clip-path', `url(#is${i})`); det.push({ e, x, y, d: rnd(n, 8) }); } });
  const sq = mk(s, 'rect', { x: 50, y: 15, width: 920, height: 600, rx: 20, fill: 'none', stroke: ACC, 'stroke-width': 6, 'stroke-dasharray': '18 14', 'stroke-linecap': 'round' });
  const per = 2 * (920 + 600);
  const lab = big(sc, 96, ACC);
  lab.innerHTML = '16 км²';
  lab.style.background = BGc; lab.style.padding = '6px 24px'; lab.style.borderRadius = '20px';
  return (t) => {
    enter(wrap, t, 18.26, 960, 540, { dy: 60 });
    sq.setAttribute('stroke-dasharray', `${per * E.inOut(P(t, 18.68, 1.0))} ${per}`);
    enter(lab, t, 18.9, 1440, 120, { dy: 30 });
    det.forEach(({ e, x, y, d }) => { const k = E.outBack(P(t, 20.64 + d * 1.2, 0.35)); e.setAttribute('transform', `translate(${x},${y}) scale(${k})`); e.setAttribute('opacity', t >= 20.64 + d * 1.2 ? 1 : 0); });
  };
});

// ===== S7 · деформация машины (22.72 – 24.24) =====
const TI = 23.3, POLE = 1360;
scene(22.72, 24.24, (sc) => {
  const s = svgEl(sc, 1920, 1080);
  const sh = mk(s, 'ellipse', { rx: 300, ry: 16, fill: 'rgba(29,27,25,.16)' });
  const pole = mk(s, 'g');
  mk(pole, 'rect', { x: -14, y: -620, width: 28, height: 620, rx: 10, fill: '#9a948a' });
  mk(pole, 'rect', { x: -60, y: -632, width: 90, height: 24, rx: 10, fill: '#9a948a' });
  const car = flatCar(s, BLUE);
  return (t) => {
    let x, pen;
    const S = 1.45;
    if (t < TI) { x = POLE - 14 - 552 * S - 1800 * (TI - t); pen = 0; } else { const k = E.outCubic(P(t, TI, 0.22)); pen = 150 * k; x = POLE - 14 - (552 - pen) * S - 16 * E.inOut(P(t, TI + 0.25, 0.35)); }
    car.set(x, pen, S);
    sh.setAttribute('cx', x + 290 * S); sh.setAttribute('cy', FLOOR + 4); sh.setAttribute('rx', 300 * S);
    pole.setAttribute('transform', `translate(${POLE},${FLOOR}) rotate(${(6 * E.outCubic(P(t, TI, 0.3))).toFixed(2)})`);
  };
});

// ===== S8 · прохожие с «нервной системой» (24.24 – 28.4) =====
scene(24.24, 28.4, (sc) => {
  const s = svgEl(sc, 1920, 1080);
  const car = flatCar(s, '#c9c1b3');
  const g = mk(s, 'g');
  const L = (w, c) => mk(g, 'line', { stroke: c, 'stroke-width': w, 'stroke-linecap': 'round' });
  const limbs = Array.from({ length: 10 }, () => L(34, INK));
  const nerves = Array.from({ length: 10 }, () => L(8, ACC));
  const head = mk(g, 'circle', { r: 44, fill: INK });
  const sh = mk(s, 'ellipse', { rx: 120, ry: 12, fill: 'rgba(29,27,25,.18)' }); s.insertBefore(sh, g);
  const TH = 25.35, X0 = 1000, GY = FLOOR;
  const ik = (hx, hy, fx, fy, l1, l2) => { const dx = fx - hx, dy = fy - hy; const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01); const a = Math.atan2(dy, dx); const b = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)); const k = [hx + Math.cos(a - b) * l1, hy + Math.sin(a - b) * l1]; const mx = (hx + fx) / 2; return k[0] < mx ? [2 * mx - k[0], k[1]] : k; };
  const stepX = (tau, t0, t1, a, b) => lerp(a, b, E.inOut(P(tau, t0, t1 - t0)));
  const lift = (tau, t0, t1) => (tau > t0 && tau < t1 ? Math.sin(Math.PI * (tau - t0) / (t1 - t0)) * 70 : 0);
  const setL = (l, a, b) => { l.setAttribute('x1', a[0]); l.setAttribute('y1', a[1]); l.setAttribute('x2', b[0]); l.setAttribute('y2', b[1]); };
  return (t) => {
    const tau = t - TH, hit = tau > 0;
    const cx = tau < 0 ? lerp(-700, X0 - 640, E.inCubic(P(t, 24.5, TH - 24.5))) : X0 - 640 + 50 * E.outCubic(P(tau, 0, 0.5));
    car.set(cx, 0);
    const push = hit ? 170 * (1 - Math.exp(-2.6 * tau)) : 0, wob = hit ? 26 * Math.exp(-1.5 * tau) * Math.sin(7 * tau) : 0;
    const lean = hit ? -0.7 * Math.exp(-1.9 * tau) * Math.cos(5.2 * tau) : 0.03 * Math.sin(t * 2);
    const fl = stepX(tau, 0.45, 0.8, X0 - 55, X0 + 115), frx = tau < 0.75 ? stepX(tau, 0.12, 0.45, X0 + 55, X0 + 175) : stepX(tau, 0.75, 1.05, X0 + 175, X0 + 225);
    const fly = GY - 22 - lift(tau, 0.45, 0.8), fry = GY - 22 - lift(tau, 0.12, 0.45) - lift(tau, 0.75, 1.05);
    const px = X0 + push + wob, py = GY - 250 + (hit ? 18 * Math.exp(-2 * tau) * Math.abs(Math.sin(4 * tau)) : 0);
    const chx = px + Math.sin(lean) * 210, chy = py - Math.cos(lean) * 210;
    const hx = chx + Math.sin(lean * 1.3) * 90, hy = chy - Math.cos(lean * 1.3) * 90;
    const KL = ik(px - 16, py, fl, fly, 122, 122), KR = ik(px + 16, py, frx, fry, 122, 122);
    const flail = hit ? Math.exp(-1.5 * tau) : 0;
    const arm = (side, ph) => { const a1 = Math.PI / 2 + side * 0.22 + lean + flail * 1.6 * Math.sin(9 * tau + ph) - side * flail * 0.9; const e = [chx + Math.cos(a1) * 110, chy + 14 + Math.sin(a1) * 110];
      const a2 = a1 - side * (0.3 + flail * 0.8 * Math.sin(8 * tau + ph)); return [e, [e[0] + Math.cos(a2) * 104, e[1] + Math.sin(a2) * 104]]; };
    const [EL, HL] = arm(1, 0), [ER, HR] = arm(-1, 1.7);
    const segs = [[[px, py], [chx, chy]], [[px - 16, py], KL], [KL, [fl, fly]], [[px + 16, py], KR], [KR, [frx, fry]], [[chx, chy + 14], EL], [EL, HL], [[chx, chy + 14], ER], [ER, HR], [[chx, chy], [hx, hy]]];
    segs.forEach((sg, i) => { setL(limbs[i], sg[0], sg[1]); setL(nerves[i], sg[0], sg[1]); });
    const act = hit ? Math.exp(-0.9 * tau) : 0;
    nerves.forEach((n, i) => n.setAttribute('opacity', (act * (0.55 + 0.45 * Math.sin(t * 24 + i * 1.3))).toFixed(2)));
    head.setAttribute('cx', hx); head.setAttribute('cy', hy);
    sh.setAttribute('cx', px + 10); sh.setAttribute('cy', GY + 2);
    sc.style.opacity = Math.min(1, P(t, 24.24, 0.25));
  };
});

// ===== S9 · тени от солнца (28.4 – 32.72) =====
scene(28.4, 32.72, (sc) => {
  const s = svgEl(sc, 1920, 1080);
  const sun = mk(s, 'circle', { r: 64, fill: '#ffb84d' });
  const halo = mk(s, 'circle', { r: 120, fill: 'rgba(255,184,77,.22)' }); s.insertBefore(halo, sun);
  mk(s, 'rect', { x: 0, y: 800, width: 1920, height: 280, fill: '#e9e2d5' });
  const B = [[430, 150, 300], [610, 120, 470], [760, 170, 230], [960, 140, 560], [1130, 160, 340], [1320, 130, 420], [1480, 150, 260]];
  const shadowsG = mk(s, 'g'), bG = mk(s, 'g');
  const items = B.map(([x, w, h], i) => {
    const sh = mk(shadowsG, 'path', { fill: 'rgba(29,27,25,.22)' });
    const b = mk(bG, 'g');
    mk(b, 'rect', { x, y: 800 - h, width: w, height: h, rx: 10, fill: i === 3 ? '#4a4641' : i % 2 ? '#2b2926' : '#5d574f' });
    for (let yy = 800 - h + 30; yy < 780; yy += 46) for (let xx = x + 22; xx < x + w - 30; xx += 40) mk(b, 'rect', { x: xx, y: yy, width: 18, height: 24, rx: 3, fill: 'rgba(255,214,140,.55)' });
    return { x, w, h, sh };
  });
  return (t) => {
    const p = P(t, 28.4, 32.72 - 28.4), ph = lerp(Math.PI - 0.18, 0.18, p);
    const sx = 960 + Math.cos(ph) * 820, sy = 820 - Math.sin(ph) * 640;
    sun.setAttribute('cx', sx); sun.setAttribute('cy', sy); halo.setAttribute('cx', sx); halo.setAttribute('cy', sy);
    const el = Math.max(0.22, Math.sin(ph));
    items.forEach(({ x, w, h, sh }) => {
      const len = h * 0.55 / el, dx = -Math.cos(ph) * len, dy = 150 * (1 - Math.abs(Math.cos(ph)) * 0.3);
      sh.setAttribute('d', `M ${x} 800 L ${x + w} 800 L ${x + w + dx} ${800 + dy} L ${x + dx} ${800 + dy} Z`);
    });
    sc.style.opacity = Math.min(1, P(t, 28.4, 0.25));
  };
});

// ===== S10 · 2006 (32.72 – END) =====
scene(32.72, END, (sc) => {
  const sh = shadow(sc, 560);
  const ps = img(sc, '/gta4_ps3/assets/ps3_fat.png', 'height:640px');
  const yr = big(sc, 210, ACC); yr.textContent = '2006';
  return (t) => {
    const k = E.outCubic(P(t, 32.75, 0.7));
    tf(sh, { x: 760, y: FLOOR, s: lerp(0.7, 1, k), o: k });
    tf(ps, { x: 760, y: lerp(FLOOR - 250, FLOOR - 310, k), o: P(t, 32.75, 0.3) });
    enter(yr, t, 34.16, 1330, 540, { dy: 50 });
  };
});

// ---------- главный цикл ----------
window.renderAt = async (t) => {
  pend.length = 0;
  for (const s of scenes) {
    const on = t >= s.t0 && t < s.t1;
    s.el.style.display = on ? 'block' : 'none';
    if (on) { s.el.style.opacity = 1; s.up(t); if (s.fade && s.t1 < END) s.el.style.opacity = parseFloat(s.el.style.opacity) * (1 - P(t, s.t1 - FADE, FADE)); }
  }
  floor.style.opacity = t >= 7.44 && t < 12 ? 0 : t >= 18.24 && t < 22.72 ? 0 : 1;
  await Promise.all(pend);
};
window.DUR = END;
(async () => {
  await document.fonts.load('900 40px Mont', 'Привет 2006'); await document.fonts.load('900 40px Mont', 'CELL');
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  window.__ready = true;
})();
