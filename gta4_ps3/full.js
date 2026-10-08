// GTA 4 на PS3 — полная версия в стиле «коллаж на бесконечном листе».
// Сцены («биты») лежат на одном полотне; камера перелетает к каждому биту в момент его начала.
// window.renderAt(t) детерминированно рисует кадр; window.WHOOSH — моменты перелётов для звука.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const P = (t, a, d) => clamp((t - a) / d);
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutQuint: (x) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2),
  outBack: (x) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const fr = (x) => x - Math.floor(x);
const rnd = (i, k = 0) => fr(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);
const A = (n) => `/gta4_ps3/assets/${n}`;
const INK = '#2a2a2c', RED = '#e8452c';

const world = document.getElementById('world');
function ab(parent, css, html = '') { const d = document.createElement('div'); d.className = 'o'; d.style.cssText = css; d.innerHTML = html; parent.appendChild(d); return d; }
function place(el, { x = 0, y = 0, s = 1, r = 0, o = 1, rx = 0, ry = 0 }) {
  el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) perspective(1600px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  el.style.opacity = o;
}
function popIn(el, t, t0, x, y, o = {}) {
  const { s = 1, r = 0, dur = 0.6, from = [0, 140], r0 = 0, rx = 0, ry = 0, ry0 = ry, t1 = 1e9 } = o;
  const k = E.outBack(P(t, t0, dur)), p = E.outCubic(P(t, t0, dur));
  const gone = t >= t1 ? E.outCubic(P(t, t1, 0.35)) : 0;
  place(el, { x: x + from[0] * (1 - p), y: y + from[1] * (1 - p) - gone * 60, s: s * (0.55 + 0.45 * k) * (1 - 0.2 * gone), r: lerp(r0, r, p), o: t >= t0 ? Math.min(1, P(t, t0, 0.15)) * (1 - gone) : 0, rx, ry: lerp(ry0, ry, p) });
}
const pend = [];

// ---------- биты ----------
const beats = [];
let NB = 0;
function beat(t0, build, cam = {}) {
  const i = NB++;
  const cx = i * 2700, cy = [0, 900, -500, 600, -900, 300][i % 6];
  const items = [];
  const root = ab(world, `left:${cx}px;top:${cy}px;width:0;height:0`);
  const b = { i, t0, cx, cy, root, items, z: cam.z ?? 1, r: cam.r ?? (i % 2 ? 1.2 : -1.2), keys: cam.keys || [], end: 0 };
  build(G(b));
  beats.push(b);
}
// конструктор содержимого бита; координаты x,y — от центра бита
function G(b) {
  const add = (el, upd) => { b.items.push({ el, upd }); return el; };
  const shadowed = (el) => { el.style.filter = 'drop-shadow(0 30px 30px rgba(0,0,0,.30))'; return el; };
  return {
    b,
    prop(src, h, at, x, y, o = {}) { const i = new Image(); i.src = A(src); i.className = 'o'; i.style.height = h + 'px'; b.root.appendChild(i); shadowed(i); if (o.css) i.style.cssText += o.css; return add(i, (t) => popIn(i, t, at, x, y, o)); },
    card(spec, at, x, y, o = {}) {
      const { w, h, src, clip, n, speed = 1, off = 0, pos = 'center', css = '' } = spec;
      const c = ab(b.root, `width:${w}px;height:${h}px;${css}`); c.classList.add('card');
      const im = new Image(); im.style.objectPosition = pos; c.appendChild(im); if (src) im.src = A(src);
      let cur = -1;
      add(c, (t) => {
        popIn(c, t, at, x, y, o);
        if (clip) { const k = Math.floor(Math.max(0, t - at) * 30 * speed + off * 30) % n + 1; if (k !== cur) { cur = k; im.src = `/gta4_ps3/clips/${clip}/${String(k).padStart(4, '0')}.jpg`; pend.push(im.decode().catch(() => {})); } }
        if (o.upd) o.upd(t, c, im);
      });
      return c;
    },
    cap(text, size, at, x, y, o = {}) {
      const d = ab(b.root, `font-size:${size}px;${o.css || ''}`); d.classList.add('tx');
      const L = [...text].map((ch) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; if (o.col) s.style.color = o.col; d.appendChild(s); return s; });
      const { cps = 22, r = -2, until } = o;
      return add(d, (t) => {
        const t1 = until ?? b.end - 0.35;
        if (t < at || t > t1 + 0.7) { d.style.opacity = 0; return; }
        place(d, { x, y, r }); d.style.opacity = 1;
        L.forEach((s, i) => {
          const a = at + i / cps, k = E.outCubic(P(t, a, 0.22));
          if (t < t1) { s.style.transform = `translateY(${((1 - k) * 0.5 * size).toFixed(1)}px)`; s.style.opacity = t >= a ? k : 0; return; }
          const u = P(t, t1 + i * 0.012, 0.55), e = u * u, ang = rnd(i, 3) * Math.PI * 2, dist = 160 + rnd(i, 4) * 260;
          s.style.transform = `translate(${(Math.cos(ang) * dist * e).toFixed(1)}px,${(Math.sin(ang) * dist * e - 80 * e).toFixed(1)}px) rotate(${((rnd(i, 5) - 0.5) * 540 * e).toFixed(1)}deg)`;
          s.style.opacity = 1 - u;
        });
      });
    },
    // круглый значок с числом: значение анимируется от from к to между v0 и v1
    badge(at, x, y, o = {}) {
      const { from = 0, to = 100, v0 = at, v1 = at + 1, suf = '%', size = 190, redAt = 1e9, ring = true, s = 1, fmt } = o;
      const d = ab(b.root, `width:${size}px;height:${size}px`);
      const R = size * 0.37, C = 2 * Math.PI * R;
      d.innerHTML = `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.46}" fill="#f7f7f8"/>${ring ? `<circle cx="${size / 2}" cy="${size / 2}" r="${R}" fill="none" stroke="#d9d9dd" stroke-width="${size * 0.085}"/><circle class="arc" cx="${size / 2}" cy="${size / 2}" r="${R}" fill="none" stroke="${INK}" stroke-width="${size * 0.085}" stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})" stroke-dasharray="0 9999"/>` : ''}<text class="pc" x="${size / 2}" y="${size * 0.58}" text-anchor="middle" font-family="Osw" font-weight="700" font-size="${size * 0.23}" fill="${INK}"></text></svg>`;
      d.style.filter = 'drop-shadow(0 18px 20px rgba(0,0,0,.25))';
      const arc = d.querySelector('.arc'), pc = d.querySelector('.pc');
      return add(d, (t) => {
        popIn(d, t, at, x, y, { dur: 0.5, from: [0, 60], s });
        const k = E.inOut(P(t, v0, v1 - v0)), v = lerp(from, to, k), red = t >= redAt;
        if (arc) { arc.setAttribute('stroke-dasharray', `${(clamp(v / 100) * C).toFixed(1)} 9999`); arc.setAttribute('stroke', red ? RED : INK); }
        pc.textContent = fmt ? fmt(v) : Math.round(v) + suf; pc.setAttribute('fill', red ? RED : INK);
      });
    },
    // произвольный блок (html/css) с появлением
    el(css, html, at, x, y, o = {}) { const d = ab(b.root, css, html); if (o.shadow !== false) shadowed(d); return add(d, (t) => { popIn(d, t, at, x, y, o); if (o.upd) o.upd(t, d); }); },
    fx(fn) { b.items.push({ el: null, upd: fn }); },
  };
}

// ---------- готовые элементы ----------
const CHEV = `<svg width="220" height="120">${[0, 1, 2].map((i) => `<path class="cv" d="M${20 + i * 62} 15 L${70 + i * 62} 60 L${20 + i * 62} 105" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
const chevUpd = (at) => (t, d) => d.querySelectorAll('.cv').forEach((p, i) => p.setAttribute('opacity', 0.25 + 0.75 * (fr((t - at) * 1.4 - i * 0.22) < 0.4 ? 1 : 0)));
const ARROW_DOWN = `<svg width="120" height="200"><path d="M35 0 H85 V120 H120 L60 200 L0 120 H35 Z" fill="${RED}"/></svg>`;
const ARROW_R = `<svg width="200" height="90"><path d="M0 30 H130 V0 L200 45 L130 90 V60 H0 Z" fill="${INK}"/></svg>`;
// Power Mac G5: алюминиевый корпус с перфорацией (рисуем сами)
const G5 = `<div style="position:relative;width:300px;height:400px;border-radius:22px;background:linear-gradient(90deg,#c9ccd1,#f1f2f4 30%,#dfe1e5 60%,#b8bbc1)">
 <div style="position:absolute;left:0;right:0;top:-18px;height:30px;border-radius:14px;background:linear-gradient(#e9eaed,#b9bcc2)"></div>
 <div style="position:absolute;left:0;right:0;bottom:-18px;height:30px;border-radius:14px;background:linear-gradient(#b9bcc2,#8d9096)"></div>
 <div style="position:absolute;left:26px;right:26px;top:34px;bottom:34px;border-radius:8px;background:radial-gradient(circle,#55585e 0 2.6px,transparent 3px) 0 0/11px 11px,linear-gradient(#d4d6da,#c3c5ca)"></div>
 <div style="position:absolute;left:50%;top:46%;width:46px;height:56px;margin-left:-23px;border-radius:50% 50% 46% 46%;background:#e9eaed;box-shadow:0 0 0 6px #d4d6da"></div></div>`;
const STAMP = (txt) => `<div style="font-family:Osw;font-weight:700;font-size:58px;color:${RED};border:8px solid ${RED};border-radius:16px;padding:4px 26px;white-space:nowrap;background:rgba(255,255,255,.75)">${txt}</div>`;
const NUM = (n, txt) => `<div style="width:300px;height:220px;border-radius:30px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Osw;font-weight:700;color:${INK}"><div style="font-size:96px;line-height:1">${n}</div><div style="font-size:34px">${txt}</div></div>`;
const CODE = `<div style="position:relative;width:560px;height:400px;border-radius:30px;background:#1f2229;overflow:hidden;box-shadow:0 30px 50px rgba(0,0,0,.3)"><div class="lines" style="position:absolute;left:34px;top:0;right:34px">${Array.from({ length: 60 }, (_, i) => `<div style="display:flex;gap:12px;margin:14px 0 0 ${(Math.floor(rnd(i, 1) * 4)) * 26}px">${Array.from({ length: 1 + Math.floor(rnd(i, 2) * 4) }, (_, k) => `<div style="height:14px;border-radius:7px;width:${40 + rnd(i * 7 + k, 3) * 120}px;background:${['#7aa2f7', '#9ece6a', '#e0af68', '#bb9af7', '#c0caf5'][Math.floor(rnd(i * 5 + k, 4) * 5)]}"></div>`).join('')}</div>`).join('')}</div></div>`;
const codeUpd = (t, d) => { const l = d.querySelector('.lines'); l.style.transform = `translateY(${(-((t * 60) % 900)).toFixed(1)}px)`; };
const SUN = `<svg width="130" height="130"><g fill="#f4b400">${Array.from({ length: 12 }, (_, i) => `<rect x="61" y="2" width="8" height="24" rx="4" transform="rotate(${i * 30} 65 65)"/>`).join('')}<circle cx="65" cy="65" r="34"/></g></svg>`;
const TEX = (n) => `<div style="width:270px;height:270px;border-radius:28px;background:#fff;display:flex;align-items:center;justify-content:center;font-family:Osw;font-weight:700;font-size:44px;color:${INK};text-align:center;line-height:1.1">${n}</div>`;

// =====================================================================
//                               СЦЕНАРИЙ
// =====================================================================
// 0 · PS3 — потрясающая консоль, Cell, «выжимают максимум»
beat(0, (g) => {
  g.prop('ps3_slim.png', 420, 0.0, -60, 40, { dur: 0.8, from: [0, 90] });
  g.cap('ПОТРЯСАЮЩАЯ КОНСОЛЬ', 66, 1.15, -60, 330, { cps: 26, until: 2.85 });
  const cell = g.el('width:330px;height:330px;border-radius:26px;padding:10px;background:linear-gradient(135deg,#f4f4f6,#b9bcc4 45%,#eceef2 60%,#9fa3ab)', `<img src="${A('cell_chip.png')}" style="width:310px;height:310px;display:block;border-radius:18px">`, 3.36, 330, -120, { dur: 0.7, from: [120, 0], ry0: 85, ry: -14, r: 4 });
  cell.style.zIndex = 0;
  g.cap('ОЧЕНЬ МОЩНАЯ', 84, 5.52, -90, -390, { cps: 18, until: 7.3 });
  const ram = g.prop('ram.png', 320, 9.4, 380, 380, { from: [260, 120], r: -9, r0: -30 }); ram.style.zIndex = 4;
  g.badge(9.55, 740, 200, { v0: 9.6, v1: 10.88, redAt: 10.88 }).style.zIndex = 5;
  g.cap('НА МАКСИМУМ', 84, 10.88, -40, -400, { cps: 20 });
}, { z: 1, keys: [[0, 0, -40, 20, 0.78], [0, 2.6, -40, 10, 1.0], [2.84, 0.9, 120, -10, 0.98], [7.44, 1.0, 160, 30, 0.86]] });

// 1 · GTA IV
beat(12.0, (g) => {
  g.el('width:2300px;height:1300px;border-radius:40px;overflow:hidden', `<img src="${A('city_sunset.jpg')}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(.85) brightness(1.15) contrast(.9) blur(3px)"><div style="position:absolute;inset:0;background:rgba(236,236,238,.35)"></div>`, 11.9, 0, 0, { dur: 0.01, from: [0, 0], shadow: false });
  g.prop('gta4_logo.png', 520, 12.65, 0, -20, { dur: 0.7, from: [0, 60] });
  g.prop('rockstar.png', 150, 12.95, 640, 330, { dur: 0.5, r: 6, r0: -20 });
});

// 2 · работает на PS3 — впечатляет
beat(14.08, (g) => {
  g.prop('ps3_fat.png', 520, 14.08, -470, 20, { dur: 0.7, from: [-120, 0] });
  g.el('width:220px;height:120px', CHEV, 14.6, -70, 0, { dur: 0.3, shadow: false, upd: chevUpd(14.6) });
  g.card({ w: 700, h: 508, clip: 'ps3_run_big', n: 65, speed: 0.5 }, 14.75, 400, 10, { from: [180, 0], ry0: -60, ry: -12, r: 2 });
  g.cap('ВПЕЧАТЛЯЕТ', 96, 17.08, 40, -380, { cps: 24 });
});

// 3 · карта 16 км² и детали
beat(18.24, (g) => {
  g.card({ w: 940, h: 578, src: 'map_blue.jpg' }, 18.3, -320, 20, { dur: 0.75, from: [-200, 60], ry0: 50, ry: 14, r: -3 });
  g.cap('16 КМ²', 110, 18.68, -380, -380, { cps: 14 });
  g.card({ w: 400, h: 640, src: 'city_aerial.jpg', pos: '50% 30%' }, 20.64, 520, 10, { from: [200, 80], ry0: -60, ry: -14, r: 3 });
  g.cap('ДЕТАЛИ', 96, 21.84, 520, -400, { cps: 18, r: 2 });
}, { keys: [[20.6, 0.7, 110, 0, 0.93]] });

// 4 · деформируемые машины
beat(22.72, (g) => {
  g.card({ w: 760, h: 522, clip: 'crash1', n: 68 }, 22.72, -280, -20, { from: [-160, 80], ry0: 40, ry: 10, r: -3 });
  g.card({ w: 560, h: 469, clip: 'crash2', n: 143, off: 0.6 }, 22.95, 430, 40, { from: [160, 80], ry0: -40, ry: -10, r: 3 });
  g.cap('ДЕФОРМАЦИЯ', 86, 23.44, 60, 360, { cps: 30 });
});

// 5 · прохожие с «нервной системой»
beat(24.24, (g) => {
  g.card({ w: 760, h: 426, clip: 'rag1', n: 105 }, 24.3, -330, -30, { from: [-160, 80], ry0: 40, ry: 10, r: -3 });
  g.card({ w: 620, h: 348, clip: 'rag2', n: 69 }, 25.2, 420, 110, { from: [160, 80], ry0: -40, ry: -10, r: 3 });
  g.cap('НЕРВНАЯ СИСТЕМА', 86, 24.93, 20, -360, { cps: 22 });
});

// 6 · тени в реальном времени
beat(28.4, (g) => {
  g.card({ w: 900, h: 608, src: 'city_sunset.jpg' }, 28.45, 0, 40, { from: [0, 140], ry0: 30, ry: 0, r: -2 });
  g.el('width:130px;height:130px', SUN, 28.9, 0, 0, { shadow: false, upd: (t, d) => { const p = P(t, 28.9, 3.8), a = lerp(Math.PI * 0.9, Math.PI * 0.1, p); place(d, { x: Math.cos(a) * 520, y: 40 - Math.sin(a) * 430, r: t * 20, o: P(t, 28.9, 0.2) }); } });
  g.cap('ТЕНИ В РЕАЛЬНОМ ВРЕМЕНИ', 76, 29.0, 0, 420, { cps: 30 });
});

// 7 · консоль 2006 года
beat(32.72, (g) => {
  g.prop('ps3_fat.png', 560, 32.75, -250, 30, { from: [0, 120] });
  g.cap('2006', 190, 34.16, 330, 0, { cps: 10 });
});

// 8 · физика забила 256 МБ
beat(36.24, (g) => {
  g.prop('ram.png', 380, 36.3, -120, 60, { from: [-200, 100], r: -6, r0: -25 });
  g.cap('256 МБ', 120, 38.4, -120, -300, { cps: 14 });
  g.badge(38.0, 520, 40, { v0: 38.6, v1: 41.6, redAt: 41.4, size: 230 });
});

// 9 · ниже 720p и 25 fps
beat(42.64, (g) => {
  g.prop('rockstar.png', 130, 42.7, -560, -330, { r: -8 });
  g.card({ w: 900, h: 506, clip: 'ps3_gameplay_lowres', n: 1008, off: 2 }, 43.0, 0, 50, { from: [0, 160] });
  g.el('width:120px;height:200px', ARROW_DOWN, 45.4, -600, 140, { from: [0, -120], shadow: false });
  g.el('width:120px;height:200px', ARROW_DOWN, 48.6, 600, 140, { from: [0, -120], shadow: false });
  g.cap('< 720P', 92, 46.0, -220, -330, { cps: 16 });
  g.cap('< 25 FPS', 92, 48.9, 230, -330, { cps: 16 });
});

// 10 · 2004 → 2006
beat(51.69, (g) => {
  g.cap('2004', 110, 54.48, -520, -300, { cps: 12 });
  g.prop('gta4_logo.png', 300, 54.6, -520, 40, { from: [-80, 80], r: -4 });
  g.el('width:540px;height:10px;background:' + INK + ';border-radius:5px', '', 56.2, 0, 40, { dur: 0.5, from: [-200, 0], shadow: false });
  g.cap('2006', 110, 58.73, 520, -300, { cps: 12 });
  g.prop('ps3_fat.png', 400, 58.85, 520, 60, { from: [120, 80] });
}, { z: 0.95 });

// 11 · консоли ещё нет
beat(61.45, (g) => {
  g.prop('ps3_fat.png', 560, 61.5, -200, 30, { css: 'filter:brightness(0) opacity(.12)', from: [0, 0] });
  g.el('width:330px;height:580px;border:8px dashed #8a8a90;border-radius:40px', '', 61.7, -200, 30, { from: [0, 0], shadow: false });
  g.cap('?', 300, 63.0, 330, 10, { cps: 4 });
  g.cap('КОНСОЛИ ЕЩЁ НЕТ', 86, 65.45, 60, -390, { cps: 20 });
});

// 12 · многоэтапный план: суперкомпьютеры → тесты → PS3
beat(70.73, (g) => {
  g.el('width:300px;height:220px', NUM(1, 'ДВИЖОК'), 74.22, -560, -80, { from: [0, 120] });
  g.el('width:300px;height:220px', NUM(2, 'ТЕСТЫ'), 81.58, 0, -80, { from: [0, 120] });
  g.el('width:300px;height:220px', NUM(3, 'PS3'), 78.86, 560, -80, { from: [0, 120] });
  g.el('width:200px;height:90px', ARROW_R, 76.0, -280, -80, { shadow: false, s: 0.7 });
  g.el('width:200px;height:90px', ARROW_R, 78.4, 280, -80, { shadow: false, s: 0.7 });
  g.cap('ПЛАН', 110, 71.2, 0, -390, { cps: 12, until: 74.0 });
  g.cap('СУПЕРКОМПЬЮТЕРЫ', 72, 76.46, -400, 160, { cps: 26, until: 81.3 });
  g.card({ w: 560, h: 314, clip: 'rag1', n: 105, off: 1 }, 83.18, 0, 260, { from: [0, 160], r: -2 });
  g.cap('ФИЗИКА', 86, 85.74, 520, 250, { cps: 18 });
}, { z: 0.9, keys: [[83.0, 0.8, 0, 120, 0.85]] });

// 13 · процессора ещё нет → альфа-девкиты
beat(87.5, (g) => {
  g.el('width:330px;height:330px;border-radius:26px;padding:10px;background:linear-gradient(135deg,#f4f4f6,#b9bcc4 45%,#eceef2 60%,#9fa3ab)', `<img src="${A('cell_chip.png')}" style="width:310px;height:310px;display:block;border-radius:18px">`, 87.6, -250, 0, { from: [0, 120], ry0: 60, ry: -10 });
  g.prop('rockstar.png', 150, 90.3, 330, -40, { r: 8 });
  g.el('width:200px;height:90px', ARROW_R, 90.3, 40, -10, { shadow: false, s: 0.8 });
  g.el('', STAMP('НЕ ПРОИЗВЕДЁН'), 93.34, -250, 0, { dur: 0.35, s: 1, r: -12, from: [0, 0], shadow: false });
  g.cap('АЛЬФА-ДЕВКИТЫ', 86, 97.82, 0, -360, { cps: 22 });
});

// 14 · девкиты = компьютеры Apple (Power Mac G5)
beat(99.74, (g) => {
  g.cap('APPLE?!', 120, 102.78, -470, -350, { cps: 14, until: 107.0 });
  g.el('width:300px;height:400px', G5, 102.9, -470, 60, { from: [0, 140] });
  g.cap('POWER MAC G5', 76, 108.38, -470, 340, { cps: 22, until: 113.9 });
  g.el('width:330px;height:330px;border-radius:26px;padding:10px;background:linear-gradient(135deg,#f4f4f6,#b9bcc4 45%,#eceef2 60%,#9fa3ab)', `<img src="${A('cell_chip.png')}" style="width:310px;height:310px;display:block;border-radius:18px">`, 110.6, 300, 40, { from: [140, 0], ry0: -50, ry: -10 });
  g.cap('≈', 200, 111.4, -70, 30, { cps: 4, until: 113.9 });
  g.cap('POWERPC', 70, 112.0, 300, 300, { cps: 20, until: 113.9 });
  // «закупила партию» — ещё два корпуса
  g.el('width:300px;height:400px', G5, 114.6, -170, 70, { from: [0, 140], s: 0.92 });
  g.el('width:300px;height:400px', G5, 115.2, 130, 80, { from: [0, 140], s: 0.86 });
  g.prop('rockstar.png', 170, 116.6, 560, -180, { r: 6 });
  g.cap('ПОКА PS3 ЕЩЁ НЕТ', 76, 119.5, 0, -400, { cps: 24 });
}, { z: 0.92 });

// 15 · глючные версии, ×10
beat(123.42, (g) => {
  g.el('width:300px;height:400px', G5, 123.5, -560, 40, { from: [-120, 80] });
  g.card({ w: 720, h: 405, clip: 'ps3_gameplay_lowres', n: 1008, off: 9 }, 124.0, 120, -20, {
    from: [0, 160], r: 2, upd: (t, c) => { const g_ = t < 128.5 && fr(t * 3.1) < 0.18; c.style.filter = g_ ? `hue-rotate(${Math.floor(rnd(Math.floor(t * 30), 2) * 360)}deg) saturate(3) contrast(1.6)` : 'none'; c.style.marginLeft = g_ ? `${(rnd(Math.floor(t * 30), 1) - 0.5) * 50}px` : '0'; } });
  g.cap('ГЛЮКИ', 96, 125.75, 120, -330, { cps: 16, until: 128.4 });
  g.badge(128.71, -560, -270, { v0: 129.0, v1: 131.2, redAt: 131.0, size: 170 });
  g.prop('ps3_fat.png', 380, 133.3, 630, 70, { from: [120, 60] });
  g.cap('×10', 140, 136.4, 630, -280, { cps: 8 });
}, { z: 0.9 });

// 16 · предсказание производительности 4 мс → 0,4 мс
beat(139.82, (g) => {
  g.el('width:300px;height:400px', G5, 139.9, -520, 40, { from: [-120, 60], s: 0.85 });
  g.prop('ps3_fat.png', 400, 140.4, 520, 40, { from: [120, 60] });
  g.card({ w: 420, h: 236, clip: 'crash1', n: 68 }, 143.66, 0, -280, { from: [0, -120], r: -2 });
  g.cap('4 МС', 110, 145.66, -520, -340, { cps: 12 });
  g.el('width:200px;height:90px', ARROW_R, 148.2, 0, 60, { shadow: false });
  g.cap('0,4 МС', 110, 149.02, 520, -340, { cps: 12 });
  g.cap('ТЕОРИЯ', 96, 153.42, 0, 330, { cps: 16 });
}, { z: 0.92 });

// 17 · через 2 года — бета-девкит, момент истины, гора кода
beat(157.18, (g) => {
  g.cap('2 ГОДА СПУСТЯ', 90, 157.3, -380, -380, { cps: 22, until: 162.4 });
  g.prop('devkits.png', 520, 159.5, -380, 40, { from: [0, 140] });
  g.cap('МОМЕНТ ИСТИНЫ', 90, 162.78, -380, -380, { cps: 22, until: 172.5 });
  g.el('width:560px;height:400px', CODE, 164.94, 470, 20, { from: [160, 60], ry0: -40, ry: -10, upd: codeUpd });
  g.el('width:200px;height:90px', ARROW_R, 169.62, 40, 30, { shadow: false, r: 180 });
}, { z: 0.92 });

// 18 · паника: 2 кадра в секунду, правда о 256 МБ
beat(172.86, (g) => {
  g.cap('ПАНИКА', 120, 172.9, -380, -360, { cps: 12, until: 179.0 });
  g.prop('devkits.png', 420, 173.0, -420, 70, { from: [-120, 60] });
  g.badge(174.94, 360, 20, { from: 30, to: 2, v0: 177.0, v1: 179.6, suf: '', size: 300, redAt: 178.6, ring: false, fmt: (v) => Math.round(v) + ' FPS' });
  g.prop('ram.png', 300, 181.9, 360, 330, { from: [160, 80], r: -6 });
  g.cap('256 МБ', 100, 184.38, -380, -360, { cps: 14 });
});

// 19 · игра больше памяти на 180 МБ
beat(187.66, (g) => {
  g.cap('СЛИШКОМ БОЛЬШАЯ', 90, 189.9, 0, -380, { cps: 24, until: 196.9 });
  g.el('width:1000px;height:120px;border-radius:24px;background:#fff;border:6px solid ' + INK, `<div class="f" style="position:absolute;left:8px;top:8px;bottom:8px;width:0;border-radius:14px;background:#5a8f3a"></div><div class="o2" style="position:absolute;left:984px;top:8px;bottom:8px;width:0;border-radius:0 14px 14px 0;background:${RED}"></div><div style="position:absolute;left:0;right:0;top:-56px;text-align:center;font-family:Osw;font-weight:700;font-size:40px;color:${INK}">ПАМЯТЬ PS3 · 256 МБ</div>`, 188.0, -120, 20, {
    from: [0, 100], upd: (t, d) => { const k = E.inOut(P(t, 190.5, 3)); d.querySelector('.f').style.width = `${976 * k}px`; d.querySelector('.f').style.background = k > 0.98 ? RED : '#5a8f3a'; d.querySelector('.o2').style.width = `${520 * E.outCubic(P(t, 197.3, 1.2))}px`; d.style.overflow = 'visible'; } });
  g.cap('+180 МБ', 130, 197.26, 560, 260, { cps: 12, col: RED });
}, { keys: [[197.0, 0.9, 200, 40, 0.88]] });

// 20 · 24 месяца разбирали игру
beat(201.62, (g) => {
  g.cap('24 МЕСЯЦА', 110, 201.7, 0, -380, { cps: 16 });
  g.el('width:560px;height:400px', CODE, 204.15, -560, 60, { from: [-120, 80], s: 0.62, upd: codeUpd });
  g.el('width:220px;height:220px', TEX('СЖАТЬ<br>ТЕКСТУРЫ'), 206.43, 0, 60, { from: [0, 120] });
  g.el('width:220px;height:220px', TEX('НИЖЕ<br>РАЗРЕШЕНИЕ'), 208.83, 560, 60, { from: [120, 80] });
  g.cap('ПЕРЕПИСАТЬ КОД', 54, 204.6, -560, 270, { cps: 26 });
}, { z: 0.95 });

// 21 · фильтр размытия, «вазелин», рядом с Xbox 360
beat(211.06, (g) => {
  g.card({ w: 640, h: 643, src: 'cmp_ps3.jpg' }, 211.1, -380, 20, { from: [-120, 80], r: -2, upd: (t, c) => { c.style.filter = `blur(${(6 * E.inOut(P(t, 213.46, 1.6))).toFixed(1)}px)`; } });
  g.cap('ФИЛЬТР РАЗМЫТИЯ', 76, 213.46, -380, -400, { cps: 24, until: 216.0 });
  g.cap('ВАЗЕЛИН', 110, 219.0, -380, -400, { cps: 14, until: 226.3 });
  g.prop('x360.png', 360, 223.78, 540, -40, { from: [140, 60] });
  g.card({ w: 960, h: 540, clip: 'cmp_ps3_x360_street', n: 286 }, 226.62, 120, 40, { from: [0, 160], r: 1 });
  g.cap('СПРЯТАТЬ ТЕКСТУРЫ', 76, 229.06, 120, -360, { cps: 24 });
}, { z: 0.92, keys: [[226.5, 0.8, 120, 0, 0.98]] });

// 22 · а игра всё равно тормозила
beat(232.1, (g) => {
  g.card({ w: 960, h: 540, clip: 'ps3_fps_counter', n: 337 }, 232.2, -150, 20, { from: [0, 160], r: -1 });
  g.cap('ТОРМОЗИТ', 100, 232.3, -150, -390, { cps: 16, until: 237.4 });
  g.badge(237.7, 560, -40, { from: 30, to: 14, v0: 240.0, v1: 242.8, suf: '', size: 280, redAt: 241.5, ring: false, fmt: (v) => Math.round(v) + ' FPS' });
  g.cap('НА ПРЕДЕЛЕ', 96, 244.59, -150, -390, { cps: 18 });
}, { z: 0.95 });

// 23 · отсечение: грузится только то, что видно
beat(247.54, (g) => {
  g.cap('ОТСЕЧЕНИЕ', 110, 249.79, 0, -400, { cps: 16, until: 255.7 });
  g.card({ w: 1000, h: 615, src: 'map_blue.jpg' }, 251.95, 0, 40, {
    from: [0, 160], upd: (t, c) => {
      if (!c.cone) { c.cone = ab(c, 'left:0;top:0;width:100%;height:100%;pointer-events:none'); c.style.position = 'absolute'; }
      const p = P(t, 258.4, 13), cx = lerp(240, 760, p), cy = lerp(440, 220, p), a = lerp(-20, -40, p);
      const on = t >= 258.4;
      c.cone.style.background = on ? `radial-gradient(circle 230px at ${cx}px ${cy}px,transparent 0 99%,rgba(20,30,50,.62) 100%)` : 'none';
    } });
  g.cap('OCCLUSION CULLING', 72, 255.95, 0, -400, { cps: 26, until: 265.6 });
  g.cap('×2', 140, 268.4, 620, -260, { cps: 6 });
}, { z: 0.95 });

// 24 · в зданиях город «замораживается»: 3D → 2D
beat(273.13, (g) => {
  g.card({ w: 480, h: 760, src: 'city_aerial.jpg', pos: '50% 30%' }, 273.2, -330, 30, {
    from: [-100, 120], ry0: -30, ry: -16, r: 2, upd: (t, c) => { const k = E.inOut(P(t, 281.86, 1.2)); c.style.filter = `grayscale(${k}) brightness(${1 + 0.15 * k})`; c.querySelector('img').style.filter = k > 0 ? `blur(${(1.5 * k).toFixed(1)}px)` : ''; } });
  g.cap('ТИШЕ', 110, 276.6, 420, -330, { cps: 12, until: 281.5 });
  g.cap('ЗАМОРОЗКА', 110, 281.86, 420, -330, { cps: 14, until: 288.6 });
  g.cap('3D → 2D', 130, 285.54, 420, 40, { cps: 10, until: 291.0 });
  g.badge(291.3, 420, 60, { from: 0, to: 70, v0: 293.0, v1: 295.6, suf: '', size: 300, ring: true, fmt: (v) => '−' + Math.round(v) + '%' });
}, { z: 0.95 });

// 25 · до GTA 4: заранее записанная анимация, как робот
beat(297.94, (g) => {
  g.cap('ФИЗИКА', 120, 298.0, 0, -380, { cps: 14, until: 302.8 });
  [-560, 0, 560].forEach((x, i) => g.card({ w: 440, h: 248, clip: 'rag2', n: 69 }, 303.5 + i * 0.25, x, 40, { from: [0, 120], css: 'filter:grayscale(1)', upd: (t, c) => { c.firstChild.style.filter = 'grayscale(1)'; } }));
  g.cap('ГОТОВАЯ АНИМАЦИЯ', 76, 303.5, 0, -380, { cps: 26, until: 306.5 });
  g.cap('КАК РОБОТ', 110, 306.74, 0, -380, { cps: 16 });
}, { z: 0.92 });

// 26 · нервная система и мышцы
beat(309.14, (g) => {
  g.card({ w: 860, h: 482, clip: 'rag1', n: 105 }, 309.2, -300, 10, { from: [-160, 80], ry0: 40, ry: 10, r: -3 });
  g.card({ w: 600, h: 336, clip: 'rag2', n: 69 }, 315.54, 500, 160, { from: [160, 80], ry0: -40, ry: -10, r: 3 });
  g.cap('НЕРВНАЯ СИСТЕМА', 86, 311.78, -300, -380, { cps: 24, until: 314.3 });
  g.cap('+ МЫШЦЫ', 86, 314.58, -300, -380, { cps: 20, until: 320.0 });
  g.cap('РЕАЛЬНЫЙ ВЕС', 86, 320.34, -300, -380, { cps: 22 });
}, { keys: [[315.4, 0.8, 100, 40, 0.92]] });

// 27 · в других играх падали одинаково → бесконечные варианты
beat(328.9, (g) => {
  g.cap('15 КМ/Ч', 76, 331.6, -420, -280, { cps: 20, until: 336.9 });
  g.cap('100 КМ/Ч', 76, 333.3, 420, -280, { cps: 20, until: 336.9 });
  g.card({ w: 560, h: 315, clip: 'rag2', n: 69, off: 1.2, speed: 0 }, 331.7, -420, 20, { from: [0, 120], upd: (t, c) => (c.firstChild.style.filter = 'grayscale(1)') });
  g.card({ w: 560, h: 315, clip: 'rag2', n: 69, off: 1.2, speed: 0 }, 333.4, 420, 20, { from: [0, 120], upd: (t, c) => (c.firstChild.style.filter = 'grayscale(1)') });
  g.cap('=', 160, 334.6, 0, 20, { cps: 4, until: 336.9 });
  g.cap('ОДИНАКОВО', 96, 335.3, 0, 330, { cps: 18, until: 336.9 });
  g.cap('∞ ВАРИАНТОВ', 120, 341.03, 0, -100, { cps: 14, css: 'z-index:5' });
}, { z: 0.92 });

// 28 · реалистичная езда: подвеска, сцепление, центр масс, крен
beat(347.11, (g) => {
  g.cap('АРКАДА → РЕАЛИЗМ', 90, 347.2, 0, -390, { cps: 22, until: 352.4 });
  g.card({ w: 860, h: 484, clip: 'ps3_gameplay_lowres', n: 1008, off: 15 }, 347.6, 0, 40, { from: [0, 160], r: -1 });
  g.el('', TEX('ПОДВЕСКА'), 352.9, -640, -170, { s: 0.75 });
  g.el('', TEX('СЦЕПЛЕНИЕ<br>КОЛЁС'), 355.5, -640, 220, { s: 0.75 });
  g.el('', TEX('ЦЕНТР<br>МАСС'), 357.8, 640, -170, { s: 0.75 });
  g.cap('КРЕН', 110, 360.6, 640, 220, { cps: 12 });
}, { z: 0.92 });

// 29 · столб на 130 км/ч, бесконечно много вариантов
beat(362.48, (g) => {
  g.cap('130 КМ/Ч', 110, 362.6, -320, -380, { cps: 14, until: 370.6 });
  g.card({ w: 860, h: 590, clip: 'crash1', n: 68 }, 362.6, -280, 30, { from: [-160, 80], ry0: 40, ry: 10, r: -3 });
  g.card({ w: 560, h: 469, clip: 'crash2', n: 143 }, 366.0, 520, 90, { from: [160, 80], ry0: -40, ry: -10, r: 3 });
  g.cap('∞', 200, 371.2, 520, -300, { cps: 4 });
});

// 30 · San Andreas: тень — просто круг
beat(375.12, (g) => {
  g.cap('СВЕТ И ВРЕМЯ СУТОК', 80, 375.2, 0, -390, { cps: 24, until: 379.7 });
  g.prop('cj_shadow.png', 720, 380.0, -350, 20, { from: [0, 140] });
  g.cap('SAN ANDREAS', 76, 380.4, 330, -330, { cps: 20, until: 391.2 });
  g.el('width:300px;height:76px;border:7px dashed ' + RED + ';border-radius:50%', '', 384.9, -350, 352, { shadow: false });
  g.cap('ПРОСТО КРУГ', 100, 385.0, 330, 0, { cps: 16, col: RED, until: 391.2 });
}, { z: 0.95 });

// 31 · GTA 4: солнце двигает тени
beat(391.64, (g) => {
  g.card({ w: 1000, h: 563, src: 'liberty_city.jpg' }, 391.7, -60, 50, { from: [0, 160], r: -1, upd: (t, c) => { const k = 1 - Math.abs(Math.sin((t - 391.7) * 0.6)) * 0.25; c.firstChild.style.filter = `brightness(${k + 0.15}) sepia(${(1 - k) * 0.8})`; } });
  g.el('width:130px;height:130px', SUN, 392.5, 0, 0, { shadow: false, upd: (t, d) => { const p = P(t, 392.5, 7), a = lerp(Math.PI * 0.92, Math.PI * 0.08, p); place(d, { x: -60 + Math.cos(a) * 600, y: 60 - Math.sin(a) * 420, r: t * 20, o: P(t, 392.5, 0.2) * (1 - P(t, 399.6, 0.3)) }); } });
  g.cap('ДВИЖУЩИЕСЯ ТЕНИ', 90, 395.0, -60, -400, { cps: 22, until: 399.6 });
  g.cap('МИЛЛИОНЫ ЛУЧЕЙ', 90, 399.84, -60, -400, { cps: 22, until: 404.0 });
  g.cap('ПРОБЛЕМА', 110, 404.16, -60, -400, { cps: 14, col: RED });
}, { z: 0.95 });

// 32 · Xbox 360: 512 общей; PS3: 256 + 256
beat(409.27, (g) => {
  g.prop('x360.png', 420, 409.3, -560, 40, { from: [-140, 60] });
  g.prop('ram.png', 210, 410.2, -560, 330, { r: -4 });
  g.cap('512 МБ', 90, 411.0, -560, -340, { cps: 14 });
  g.prop('ps3_fat.png', 440, 413.11, 300, 40, { from: [140, 60] });
  g.prop('ram.png', 170, 415.0, 120, 330, { r: -4 });
  g.prop('ram.png', 170, 416.3, 520, 330, { r: 4 });
  g.cap('256 + 256', 90, 414.4, 300, -340, { cps: 16 });
  g.cap('CPU', 56, 417.6, 120, 440, { cps: 12 });
  g.cap('GPU', 56, 419.2, 520, 440, { cps: 12 });
}, { z: 0.88 });

// 33 · видеопамяти не хватает → зернистые мерцающие тени
beat(422.39 + 0.0001, (g) => {
  g.badge(422.5, -420, 0, { v0: 424.0, v1: 430.6, redAt: 430.4, size: 300 });
  g.cap('ВИДЕОПАМЯТЬ', 90, 422.6, -420, -330, { cps: 20, until: 432.3 });
  g.el('', TEX('ТЕКСТУРЫ'), 425.2, 200, -150, { s: 0.8 });
  g.el('', TEX('ТЕНИ'), 428.2, 500, -150, { s: 0.8 });
  g.card({ w: 760, h: 428, src: 'liberty_city.jpg' }, 432.63, 300, 160, {
    from: [0, 140], upd: (t, c) => { const k = P(t, 434.0, 1.0); const im = c.firstChild; im.style.imageRendering = k > 0.5 ? 'pixelated' : 'auto'; im.style.filter = k > 0.5 ? `contrast(1.25) brightness(${(0.92 + 0.12 * (fr(t * 7.3) < 0.5 ? 1 : 0)).toFixed(2)})` : 'none'; } });
  g.cap('ЗЕРНИСТЫЕ ТЕНИ', 90, 437.03, -420, -330, { cps: 22 });
}, { z: 0.92 });

// 34 · итог: далеко не идеальна
beat(441.59, (g) => {
  g.cap('ДАЛЕКО НЕ ИДЕАЛЬНО', 90, 441.7, 0, -400, { cps: 24, until: 454.6 });
  g.el('', TEX('< 720P'), 446.0, -660, 40, { s: 0.9 });
  g.card({ w: 400, h: 402, src: 'cmp_ps3.jpg' }, 447.3, -220, 40, { r: -3, upd: (t, c) => (c.firstChild.style.filter = 'blur(4px)') });
  g.card({ w: 420, h: 236, clip: 'ps3_fps_counter', n: 337 }, 449.6, 230, 40, { r: 2 });
  g.card({ w: 300, h: 300, src: 'liberty_city.jpg', pos: '70% 60%' }, 452.0, 640, 40, { r: 4 });
  g.cap('НО…', 140, 455.0, 0, 330, { cps: 8 });
}, { z: 0.88 });

// 35 · через что прошли разработчики
beat(460.32, (g) => {
  g.el('width:300px;height:400px', G5, 460.4, -600, 30, { from: [-120, 80], s: 0.85 });
  g.cap('2 ГОДА', 90, 465.04, -600, -330, { cps: 14, until: 470.2 });
  g.el('width:1000px;height:110px;border-radius:24px;background:' + RED, `<div style="font-family:Osw;font-weight:700;font-size:60px;color:#fff;text-align:center;line-height:110px">+180 МБ</div>`, 470.48, 120, -250, { s: 0.6, r: -3 });
  g.cap('ЕЩЁ 2 ГОДА', 90, 474.5, 120, -60, { cps: 16, until: 478.6 });
  g.card({ w: 360, h: 560, src: 'city_aerial.jpg', pos: '50% 30%' }, 478.95, 560, 120, { r: 3, ry0: -40, ry: -12, upd: (t, c) => (c.firstChild.style.filter = `grayscale(${P(t, 480.5, 1)})`) });
  g.cap('КАЖДЫЙ МЕГАБАЙТ', 80, 486.47, -100, 330, { cps: 24 });
}, { z: 0.9 });

// 36 · и всё же им это удалось
beat(490.55, (g) => {
  g.cap('ПОЛУЧИЛОСЬ', 120, 490.7, 0, -400, { cps: 14, until: 505.0 });
  g.card({ w: 560, h: 344, src: 'map_blue.jpg' }, 492.95, -560, -100, { r: -4 });
  g.card({ w: 520, h: 292, clip: 'rag1', n: 105 }, 494.6, 0, -40, { r: 2 });
  g.card({ w: 520, h: 357, clip: 'crash1', n: 68 }, 498.44, 560, -90, { r: 3 });
  g.card({ w: 560, h: 315, src: 'city_sunset.jpg' }, 501.31, -40, 290, { r: -2 });
  g.cap('256 МБ', 140, 505.27, 0, -400, { cps: 12, css: 'z-index:5' });
}, { z: 0.86 });

// 37 · опыт → GTA 5 на той же консоли
beat(509.75, (g) => {
  g.prop('ps3_fat.png', 460, 509.8, -480, 30, { from: [-120, 60] });
  g.cap('ДО ПОСЛЕДНЕГО БАЙТА', 76, 512.31, -100, -390, { cps: 26, until: 518.4 });
  g.el('width:200px;height:90px', ARROW_R, 518.79, -60, 30, { shadow: false });
  g.card({ w: 420, h: 527, src: 'gta5_cover.jpg' }, 519.4, 420, 30, { from: [160, 60], ry0: -50, ry: -12, r: 3 });
  g.cap('GTA V · 2013', 86, 521.11, 420, -360, { cps: 20 });
}, { z: 0.95 });

// 38 · а вы играли?
beat(528.07, (g) => {
  g.prop('ps3_slim.png', 440, 528.1, -300, 40, { from: [0, 120] });
  g.prop('gta4_logo.png', 300, 528.6, 470, -80, { r: 4 });
  g.cap('А ВЫ ИГРАЛИ?', 100, 528.4, 0, -400, { cps: 18, until: 535.8 });
  g.cap('ПИШИТЕ В КОММЕНТАРИЯХ', 70, 536.07, 100, 330, { cps: 26, until: 1e9 });
});

// ---------- концы битов и камера ----------
beats.forEach((b, i) => (b.end = i + 1 < beats.length ? beats[i + 1].t0 : 1e9));
const KEYS = [];
beats.forEach((b) => {
  if (b.i === 0) { b.keys.forEach(([t, d, x, y, z]) => KEYS.push([t, d, b.cx + x, b.cy + y, z, -1])); return; }
  KEYS.push([b.t0, 0.6, b.cx, b.cy, b.z, b.r]);
  b.keys.forEach(([t, d, x, y, z]) => KEYS.push([t, d, b.cx + x, b.cy + y, z, b.r]));
});
KEYS.sort((a, b) => a[0] - b[0]);
window.WHOOSH = beats.slice(1).map((b) => b.t0);
function camAt(t) {
  let c = KEYS[0].slice(2);
  for (let i = 1; i < KEYS.length; i++) {
    const [t0, d, x, y, z, r] = KEYS[i];
    if (t < t0) break;
    const k = d > 0 ? E.inOutQuint(P(t, t0, d)) : 1;
    c = [lerp(c[0], x, k), lerp(c[1], y, k), lerp(c[2], z, k), lerp(c[3], r, k)];
  }
  return { x: c[0] + Math.sin(t * 0.5) * 14, y: c[1] + Math.cos(t * 0.4) * 10, z: c[2] * (1 + 0.012 * Math.sin(t * 0.35)), r: c[3] + Math.sin(t * 0.3) * 0.4 };
}

function frame(t) {
  const c = camAt(t);
  world.style.transform = `translate(960px,540px) rotate(${c.r.toFixed(3)}deg) scale(${c.z.toFixed(4)}) translate(${(-c.x).toFixed(1)}px,${(-c.y).toFixed(1)}px)`;
  // бесконечная клетка: рисуем в экранных координатах со сдвигом по камере
  const gs = 96 * c.z, gr = document.getElementById('grid');
  gr.style.backgroundSize = `${gs.toFixed(2)}px ${gs.toFixed(2)}px`;
  gr.style.backgroundPosition = `${(((1000 - c.x * c.z) % gs) + gs) % gs}px ${(((580 - c.y * c.z) % gs) + gs) % gs}px`;
  gr.style.transform = `rotate(${c.r.toFixed(3)}deg)`;
  const c0 = camAt(t - 1 / 60), c1 = camAt(t + 1 / 60);
  const zf = Math.abs(c1.z - c0.z) / c.z * 250;
  const bx = Math.min(26, Math.abs(c1.x - c0.x) * c.z * 0.22 + zf), by = Math.min(26, Math.abs(c1.y - c0.y) * c.z * 0.22 + zf);
  document.getElementById('mbg').setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`);
  document.getElementById('cam').style.filter = bx + by > 0.6 ? 'url(#mb)' : 'none';
  // активны текущий бит и соседи (видны во время перелёта)
  let cur = 0; beats.forEach((b, i) => { if (t >= b.t0) cur = i; });
  beats.forEach((b, i) => {
    const on = i >= cur - 1 && i <= cur + 1;
    b.root.style.display = on ? 'block' : 'none';
    if (on) b.items.forEach((it) => it.upd(t));
  });
}

window.renderAt = async (t) => { pend.length = 0; frame(t); await Promise.all(pend); };
window.DUR = 540.6;
(async () => {
  await document.fonts.load('700 60px Osw', 'ПОТРЯСАЮЩАЯ 16 КМ² ×∞→≈');
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  window.__ready = true;
})();
