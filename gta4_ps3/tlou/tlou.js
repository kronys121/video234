// The Last of Us на PS3 — динамичный коллаж в стиле MKTS: короткие сцены, смена фонов
// (светлый лист / размытый кадр из игры), вырезанные предметы, иконки-эмодзи, печатающиеся подписи.
// window.renderAt(t) детерминированно рисует кадр.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const P = (t, a, d) => clamp((t - a) / d);
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutQuint: (x) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2),
  outBack: (x) => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const fr = (x) => x - Math.floor(x);
const rnd = (i, k = 0) => fr(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);
const A = (n) => (n.startsWith('/') ? n : `/gta4_ps3/tlou/assets/${n}`);
const G4 = (n) => `/gta4_ps3/assets/${n}`;
const FR = (clip, sec) => `/gta4_ps3/tlou/clips/${clip}/${String(Math.max(1, Math.round(sec * 30))).padStart(4, '0')}.jpg`;
const INK = '#2a2a2c', RED = '#e3262b';

const world = document.getElementById('world'), bgs = document.getElementById('bgs');
function ab(parent, css, html = '') { const d = document.createElement('div'); d.className = 'o'; d.style.cssText = css; d.innerHTML = html; parent.appendChild(d); return d; }
function place(el, { x = 0, y = 0, s = 1, r = 0, o = 1, rx = 0, ry = 0 }) {
  el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) perspective(1600px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  el.style.opacity = o;
}
// появление: влёт с перелётом; t1 — уход (вверх и в прозрачность)
function popIn(el, t, t0, x, y, o = {}) {
  const { s = 1, r = 0, dur = 0.55, from = [0, 140], r0 = 0, rx = 0, ry = 0, ry0 = ry, t1 = 1e9, out = 0.35, float = 0 } = o;
  const k = E.outBack(P(t, t0, dur)), p = E.outCubic(P(t, t0, dur));
  const gone = t >= t1 ? E.outCubic(P(t, t1, out)) : 0;
  const fl = float ? Math.sin((t - t0) * 1.6 + x * 0.01) * float : 0;
  place(el, { x: x + from[0] * (1 - p), y: y + from[1] * (1 - p) - gone * 70 + fl, s: s * (0.5 + 0.5 * k) * (1 - 0.25 * gone), r: lerp(r0, r, p), o: t >= t0 ? Math.min(1, P(t, t0, 0.12)) * (1 - gone) : 0, rx, ry: lerp(ry0, ry, p) });
}
const pend = [];
window.POPS = [];

// ---------- биты ----------
const beats = [];
function beat(t0, bg, build, cam = {}) {
  const i = beats.length;
  const cx = i * 2500, cy = [0, 260, -200, 180, -260, 90][i % 6];
  const root = ab(world, `left:${cx}px;top:${cy}px;width:0;height:0`);
  // фон в экранных координатах: 'grid' | 'dark:<img>' | 'light:<img>'
  let layer = null, dark = false;
  if (bg !== 'grid') {
    const [kind, src] = bg.split(/:(.+)/);
    dark = kind === 'dark';
    layer = ab(bgs, '');
    layer.style.backgroundImage = `url(${src})`;
    layer.style.filter = dark ? 'blur(9px) brightness(.5) saturate(.8)' : 'blur(6px) brightness(1.15) saturate(.55)';
    if (!dark) layer.innerHTML = '<div style="position:absolute;inset:0;background:rgba(240,240,242,.45)"></div>';
  }
  if (dark) root.classList.add('dark');
  const b = { i, t0, cx, cy, root, items: [], layer, dark, z: cam.z ?? 1, keys: cam.keys || [], end: 0 };
  build(G(b));
  beats.push(b);
}
function G(b) {
  const add = (el, upd) => { b.items.push({ el, upd }); return el; };
  const sh = 'drop-shadow(0 30px 30px rgba(0,0,0,.32))';
  return {
    b,
    prop(src, h, at, x, y, o = {}) { const i = new Image(); i.src = A(src); i.className = 'o'; i.style.height = h + 'px'; i.style.filter = o.filter || sh; b.root.appendChild(i); if (o.z) i.style.zIndex = o.z; return add(i, (t) => popIn(i, t, at, x, y, o)); },
    card(spec, at, x, y, o = {}) {
      const { w, h, src, clip, n, speed = 1, off = 0, pos = 'center', fps = 30 } = spec;
      const c = ab(b.root, `width:${w}px;height:${h}px`); c.classList.add('card'); if (o.z) c.style.zIndex = o.z;
      const im = new Image(); im.style.objectPosition = pos; c.appendChild(im); if (src) im.src = A(src);
      let cur = -1;
      add(c, (t) => {
        popIn(c, t, at, x, y, o);
        if (clip) { let sec = Math.max(0, t - at) * speed + off; if (fps < 30) sec = Math.floor(sec * fps) / fps; const k = Math.floor(sec * 30) % n + 1; if (k !== cur) { cur = k; im.src = `/gta4_ps3/tlou/clips/${clip}/${String(k).padStart(4, '0')}.jpg`; pend.push(im.decode().catch(() => {})); } }
        if (o.upd) o.upd(t, c, im);
      });
      return c;
    },
    // подпись: буквы печатаются; fly — буквы слетаются по кругу; уходит разлетаясь
    cap(text, size, at, x, y, o = {}) {
      const d = ab(b.root, `font-size:${size}px;z-index:20;${o.css || ''}`); d.classList.add('tx');
      const L = [...text].map((ch) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; if (o.col) s.style.color = o.col; d.appendChild(s); return s; });
      const { cps = 24, r = -2, until, fly = false } = o;
      return add(d, (t) => {
        const t1 = until ?? b.end - 0.3;
        if (t < at || t > t1 + 0.7) { d.style.opacity = 0; return; }
        place(d, { x, y, r }); d.style.opacity = 1;
        L.forEach((s, i) => {
          const a = at + i / cps;
          if (t < t1) {
            if (fly) { const k = E.outCubic(P(t, at + i * 0.025, 0.6)), ang = (i / L.length) * Math.PI * 2 + 0.6, R = 420 * (1 - k);
              s.style.transform = `translate(${(Math.cos(ang) * R).toFixed(1)}px,${(Math.sin(ang) * R).toFixed(1)}px) rotate(${((1 - k) * (rnd(i, 7) - 0.5) * 400).toFixed(1)}deg)`; s.style.opacity = Math.min(1, k * 2.5); return; }
            const k = E.outCubic(P(t, a, 0.2)); s.style.transform = `translateY(${((1 - k) * 0.55 * size).toFixed(1)}px)`; s.style.opacity = t >= a ? k : 0; return;
          }
          const u = P(t, t1 + i * 0.012, 0.5), e = u * u, ang = rnd(i, 3) * Math.PI * 2, dist = 160 + rnd(i, 4) * 260;
          s.style.transform = `translate(${(Math.cos(ang) * dist * e).toFixed(1)}px,${(Math.sin(ang) * dist * e - 80 * e).toFixed(1)}px) rotate(${((rnd(i, 5) - 0.5) * 540 * e).toFixed(1)}deg)`;
          s.style.opacity = 1 - u;
        });
      });
    },
    // иконка-эмодзи с «поп»-звуком
    emo(ch, size, at, x, y, o = {}) {
      const d = ab(b.root, `font-size:${size}px;z-index:15`, ch); d.classList.add('emo');
      d.style.filter = 'drop-shadow(0 10px 12px rgba(0,0,0,.28))';
      if (!o.silent) window.POPS.push(at);
      return add(d, (t) => { popIn(d, t, at, x, y, { dur: 0.45, from: [0, 50], float: 6, ...o }); if (o.upd) o.upd(t, d); });
    },
    el(css, html, at, x, y, o = {}) { const d = ab(b.root, css, html); if (o.shadow !== false) d.style.filter = sh; if (o.z) d.style.zIndex = o.z; return add(d, (t) => { popIn(d, t, at, x, y, o); if (o.upd) o.upd(t, d); }); },
    fx(fn) { b.items.push({ el: null, upd: fn }); },
  };
}

// ---------- готовые элементы ----------
// логотип Naughty Dog (нарисован): белая плашка «NAUGHTY», красная лапа, чёрная плашка «DOG»
const PAW = `<svg width="120" height="120" viewBox="0 0 120 120"><g fill="${RED}" stroke="#111" stroke-width="5">
 <ellipse cx="24" cy="44" rx="13" ry="17" transform="rotate(-25 24 44)"/><ellipse cx="46" cy="22" rx="13" ry="17" transform="rotate(-8 46 22)"/>
 <ellipse cx="74" cy="22" rx="13" ry="17" transform="rotate(10 74 22)"/><ellipse cx="96" cy="44" rx="13" ry="17" transform="rotate(28 96 44)"/>
 <path d="M60 50 C 82 50 100 72 92 92 C 86 106 70 100 60 100 C 50 100 34 106 28 92 C 20 72 38 50 60 50 Z"/></g></svg>`;
const NDLOGO = `<div style="display:flex;align-items:center;font-family:Mont;font-weight:900;font-size:64px;letter-spacing:-.02em;line-height:1">
 <div style="background:#fff;color:#111;border:6px solid #111;border-right:0;padding:8px 6px 8px 18px">NAUGHTY</div>
 <div style="width:118px;height:84px;position:relative;background:linear-gradient(90deg,#fff 50%,#111 50%);border-top:6px solid #111;border-bottom:6px solid #111"><div style="position:absolute;left:-6px;top:-30px">${PAW}</div></div>
 <div style="background:#111;color:#fff;border:6px solid #111;padding:8px 18px 8px 8px">DOG</div></div>`;
const CHIP = (name, sub) => `<div style="width:300px;height:300px;border-radius:26px;padding:14px;background:linear-gradient(135deg,#f6f6f8,#b9bcc4 45%,#eceef2 60%,#9fa3ab)">
 <div style="width:100%;height:100%;border-radius:16px;background:linear-gradient(160deg,#fbfbfc,#dcdde1);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Osw;color:#3a3a40">
 <div style="font-size:30px;opacity:.7;line-height:1.1">Sony Computer</div><div style="font-size:82px;line-height:1;letter-spacing:.02em">${name}</div><div style="font-size:24px;opacity:.75">${sub}</div></div></div>`;
const CELLCHIP = `<div style="width:300px;height:300px;border-radius:26px;padding:12px;background:linear-gradient(135deg,#f4f4f6,#b9bcc4 45%,#eceef2 60%,#9fa3ab)"><img src="${G4('cell_chip.png')}" style="width:276px;height:276px;display:block;border-radius:16px"></div>`;
const RINGS = `<div style="position:relative;width:520px;height:520px">${[0, 1, 2].map((i) => `<div class="rg" style="position:absolute;inset:0;border-radius:50%;border:3px solid rgba(255,255,255,.55)"></div>`).join('')}</div>`;
const ringsUpd = (t, d) => d.querySelectorAll('.rg').forEach((r, i) => { const u = fr(t * 0.45 + i / 3); r.style.transform = `scale(${(0.55 + u * 0.6).toFixed(3)})`; r.style.opacity = (1 - u).toFixed(2); });
const XMARK = (w = 260) => `<svg width="${w}" height="${w}" viewBox="0 0 100 100"><path class="x1" d="M14 14 L86 86" stroke="${RED}" stroke-width="11" stroke-linecap="round" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><path class="x2" d="M86 14 L14 86" stroke="${RED}" stroke-width="11" stroke-linecap="round" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
const xUpd = (at) => (t, d) => { d.querySelector('.x1').style.strokeDashoffset = 1 - E.outCubic(P(t, at, 0.18)); d.querySelector('.x2').style.strokeDashoffset = 1 - E.outCubic(P(t, at + 0.14, 0.18)); };
const BINARY = (w) => `<div style="width:${w}px;height:96px;overflow:hidden;background:rgba(10,40,10,.55);border-radius:10px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)"><div class="bn" style="font-family:monospace;font-weight:700;font-size:30px;line-height:32px;color:#3cff62;text-shadow:0 0 10px #3cff62;white-space:nowrap">${[0, 1, 2].map((r) => Array.from({ length: 140 }, (_, i) => Math.floor(rnd(i + r * 999, 9) * 10)).join('')).join('<br>')}</div></div>`;
const binUpd = (t, d) => { d.querySelector('.bn').style.transform = `translateX(${(-((t * 260) % 1400)).toFixed(1)}px)`; };
const CHEV = (dir = 1) => `<svg width="220" height="120" style="transform:scaleX(${dir})">${[0, 1, 2].map((i) => `<path class="cv" d="M${20 + i * 62} 15 L${70 + i * 62} 60 L${20 + i * 62} 105" fill="none" stroke="#fff" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
const chevUpd = (t, d) => d.querySelectorAll('.cv').forEach((p, i) => p.setAttribute('opacity', 0.25 + 0.75 * (fr(t * 1.6 - i * 0.22) < 0.4 ? 1 : 0)));
const WAVE = `<svg width="360" height="120">${Array.from({ length: 18 }, (_, i) => `<rect class="wv" x="${i * 20 + 4}" width="11" rx="5.5" fill="${INK}"/>`).join('')}</svg>`;
const waveUpd = (t, d) => d.querySelectorAll('.wv').forEach((r, i) => { const h = 14 + Math.abs(Math.sin(t * 7 + i * 0.7) * Math.cos(t * 3.1 + i * 0.3)) * 96; r.setAttribute('height', h.toFixed(1)); r.setAttribute('y', (60 - h / 2).toFixed(1)); });
const HANDS = (n) => Array.from({ length: n });
const CLOCK = `<svg width="300" height="300" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#f7f7f8" stroke="#2a2a2c" stroke-width="3"/>${Array.from({ length: 12 }, (_, i) => `<text x="${50 + Math.sin(i * Math.PI / 6) * 37}" y="${54 + -Math.cos(i * Math.PI / 6) * 37}" font-family="Osw" font-size="10" text-anchor="middle" fill="#2a2a2c">${i || 12}</text>`).join('')}<line class="hh" x1="50" y1="50" x2="50" y2="28" stroke="#2a2a2c" stroke-width="3.5" stroke-linecap="round"/><line class="mm" x1="50" y1="50" x2="50" y2="16" stroke="${RED}" stroke-width="2" stroke-linecap="round"/><circle cx="50" cy="50" r="3" fill="#2a2a2c"/></svg>`;
const clockUpd = (t, d) => { d.querySelector('.mm').setAttribute('transform', `rotate(${(t * 360) % 360} 50 50)`); d.querySelector('.hh').setAttribute('transform', `rotate(${(t * 30) % 360} 50 50)`); };

// =====================================================================
//                         СЦЕНАРИЙ (первая минута)
// =====================================================================
// 0 · Naughty Dog: опыт Uncharted 3 → The Last of Us
beat(0, 'dark:' + A('uc3_scene.jpg'), (g) => {
  g.el('', NDLOGO, 0.15, 0, -380, { dur: 0.5, from: [0, -80], shadow: false, s: 0.95 });
  g.prop('uc3_box.png', 470, 1.2, -470, 70, { from: [-200, 60], r: -5, ry0: 50, ry: 8 });
  g.prop('drake.png', 760, 0.6, -760, 180, { from: [-240, 0], filter: 'drop-shadow(0 30px 40px rgba(0,0,0,.6))' });
  g.el('width:220px;height:120px', CHEV(1), 4.4, 0, 80, { shadow: false, upd: chevUpd, s: 0.9 });
  g.prop('tlou_box.png', 520, 4.72, 450, 70, { from: [220, 60], r: 4, ry0: -50, ry: -8 });
}, { keys: [[4.3, 0.9, 120, 0, 0.98]] });

// 1 · «настоящее безумие»: Эли и Джоэл, коробка, PS3
beat(7.92, 'light:' + FR('beauty', 1.7), (g) => {
  g.prop('ellie.png', 900, 7.95, -620, 120, { from: [-260, 0], z: 1 });
  g.prop('joel.png', 860, 8.1, 640, 130, { from: [260, 0], z: 1 });
  g.prop('ps3_fat_flat.png', 220, 8.5, 0, 260, { from: [0, 160], z: 3, filter: 'drop-shadow(0 30px 30px rgba(0,0,0,.4))' }).src = G4('ps3_fat_flat.png');
  g.prop('tlou_box.png', 470, 8.8, 0, -10, { from: [0, 120], r: -3, z: 2 });
  g.cap('НАСТОЯЩЕЕ БЕЗУМИЕ', 84, 10.48, 0, -430, { cps: 26, fly: true });
}, { z: 1.0 });

// 2 · красивые локации, времена года
beat(12.56, 'grid', (g) => {
  g.card({ w: 860, h: 484, clip: 'beauty', n: 1073, off: 0.8 }, 12.6, 0, 20, { from: [260, 60], r: -2, ry0: -30, ry: 0 });
  g.cap('КРАСИВЫЕ ЛОКАЦИИ', 78, 12.9, 0, -330, { cps: 28 });
  ['☀️', '🌧️', '❄️', '🍂'].forEach((e, i) => g.emo(e, 84, 13.7 + i * 0.32, -210 + i * 140, 340));
});

// 3 · реалистичные анимации на основе настоящих людей
beat(14.96, 'grid', (g) => {
  g.card({ w: 700, h: 394, clip: 'trailer', n: 3199, off: 40.2, speed: 0.8 }, 15.0, -330, -60, { from: [-200, 60], r: -3 });
  g.card({ w: 640, h: 360, clip: 'trailer', n: 3199, off: 63.6, speed: 0.7 }, 16.6, 360, 150, { from: [220, 60], r: 3, z: 2 });
  g.cap('РЕАЛИСТИЧНО', 84, 15.2, -330, -340, { cps: 22 });
  g.emo('🎬', 110, 17.76, 520, -200, { r: 8 });
  g.emo('🎭', 110, 18.4, 690, -170, {});
}, { keys: [[16.6, 0.8, 120, 50, 0.97]] });

// 4 · враги с ИИ, которые общаются
beat(20.88, 'grid', (g) => {
  g.card({ w: 860, h: 484, clip: 'enemies1', n: 543, off: 0.6 }, 20.9, -40, 40, { from: [260, 60], r: 1, ry0: -30, ry: 0 });
  g.cap('УМНЫЕ ВРАГИ', 84, 21.0, -60, -320, { cps: 24 });
  g.emo('🤖', 130, 21.5, 520, -280, { r: 6 });
  g.emo('💬', 100, 22.9, -560, -230, { r: -6 });
  g.emo('💬', 80, 23.4, -470, -330, { r: 8 });
});

// 5 · динамичный звук
beat(24.88, 'grid', (g) => {
  g.card({ w: 820, h: 461, clip: 'beauty', n: 1073, off: 13.3 }, 24.9, 0, -10, { from: [260, 60], r: -1 });
  g.cap('ДИНАМИЧНЫЙ ЗВУК', 80, 25.1, 0, -330, { cps: 26 });
  g.el('width:360px;height:120px', WAVE, 25.9, 0, 340, { shadow: false, upd: waveUpd });
  g.emo('🔊', 110, 26.2, 520, 300, {});
});

// 6 · 256 МБ основная + 256 МБ графика
beat(28.72, 'dark:' + FR('beauty', 5.0), (g) => {
  g.el('', NDLOGO, 28.8, 0, -400, { shadow: false, s: 0.75, from: [0, -60], t1: 30.3 });
  g.el('width:520px;height:520px', RINGS, 30.4, -420, 0, { shadow: false, upd: ringsUpd, dur: 0.3, from: [0, 0] });
  g.el('width:300px;height:300px', CELLCHIP, 30.72, -420, 0, { from: [0, 120], r: -4 });
  g.cap('256 МБ', 76, 31.3, -420, -220, { cps: 14 });
  ['🧠', '🔊', '🤖'].forEach((e, i) => g.emo(e, 64, 32.0 + i * 0.2, -540 + i * 120, 230));
  g.el('width:520px;height:520px', RINGS, 33.4, 420, 0, { shadow: false, upd: ringsUpd, dur: 0.3, from: [0, 0] });
  g.el('width:300px;height:300px', CHIP('RSX', 'Reality Synthesizer'), 33.6, 420, 0, { from: [0, 120], r: 4 });
  g.cap('256 МБ', 76, 34.2, 420, -220, { cps: 14 });
  ['🌧️', '🖼️', '🌍'].forEach((e, i) => g.emo(e, 64, 35.44 + i * 0.2, 300 + i * 120, 230));
}, { z: 0.95 });

// 7 · их нельзя объединить
beat(37.44, 'dark:' + FR('beauty', 5.0), (g) => {
  g.el('width:300px;height:300px', CELLCHIP, 37.44, -560, -20, { dur: 0.01, from: [0, 0], r: -4, s: 0.8 });
  g.el('width:300px;height:300px', CHIP('RSX', 'Reality Synthesizer'), 37.44, 560, -20, { dur: 0.01, from: [0, 0], r: 4, s: 0.8 });
  g.el('width:760px;height:96px', BINARY(760), 37.8, 0, -20, { shadow: false, upd: binUpd, from: [0, 0] });
  g.el('width:260px;height:260px', XMARK(), 39.76, 0, -20, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(39.76) });
  g.cap('НЕЛЬЗЯ ОБЪЕДИНИТЬ', 80, 40.0, 0, 300, { cps: 26 });
}, { z: 0.95 });

// 8 · графике не хватает — занять нельзя
beat(42.16, 'dark:' + FR('beauty', 5.0), (g) => {
  g.el('width:300px;height:300px', CHIP('RSX', 'Reality Synthesizer'), 42.2, 300, -40, { from: [160, 0], r: 3 });
  g.emo('⚠️', 110, 42.9, 170, 120, { r: -6 });
  g.emo('🤲', 150, 44.44, -60, 60, { from: [-120, 0] });
  g.cap('??', 90, 44.9, -40, -110, { cps: 8 });
  g.el('width:300px;height:300px', CELLCHIP, 45.4, -560, -40, { from: [-160, 0], r: -3, s: 0.8 });
  g.el('width:260px;height:260px', XMARK(220), 45.9, -560, -40, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(45.9) });
  g.el('width:220px;height:120px', CHEV(-1), 45.6, -270, -40, { shadow: false, upd: chevUpd, s: 0.8 });
}, { z: 0.98 });

// 9 · «вы сошли с ума» → «невозможно»
beat(47.03, 'grid', (g) => {
  g.el('', NDLOGO, 47.05, 0, -330, { shadow: false, s: 0.6, from: [0, -60] });
  g.emo('🤷', 300, 47.2, 0, 60, { float: 0 });
  [[-520, -40, '👉', 0], [-560, 230, '👉', 0.1], [520, -20, '👈', 0.05], [560, 240, '👈', 0.15]].forEach(([x, y, e, d]) => g.emo(e, 150, 47.9 + d, x, y, { from: [x < 0 ? -200 : 200, 0] }));
  g.cap('СОШЛИ С УМА', 96, 49.27, 0, 420, { cps: 20, until: 51.6 });
  g.prop('tlou_box.png', 440, 51.84, 0, 40, { from: [0, 160], r: -3, z: 5 });
  g.emo('🔍', 230, 52.4, 120, 110, { r: -10, z: 6 });
  g.cap('НЕВОЗМОЖНО', 110, 51.84, 0, 420, { fly: true });
}, { z: 0.95 });

// 10 · консоли 7 лет, выжато до капли
beat(55.11, 'dark:' + FR('trailer', 61.0), (g) => {
  g.el('width:300px;height:300px', CLOCK, 55.2, -520, -60, { from: [-160, 0], upd: clockUpd });
  g.prop('ps3_fat_flat.png', 230, 55.4, 60, 60, { from: [0, 120], z: 3 }).src = G4('ps3_fat_flat.png');
  g.cap('7 ЛЕТ', 110, 55.6, 60, -260, { cps: 10, until: 59.9 });
  g.prop('uc3_box.png', 330, 57.71, 560, -80, { from: [220, 0], r: 6 });
  g.prop('uc2_box.png', 330, 58.1, 640, 140, { from: [220, 0], r: -4 });
  g.emo('✊', 220, 60.15, 60, 40, { from: [0, -200], z: 6 });
  g.emo('💦', 90, 60.6, 180, 170, { z: 6 });
  g.cap('ВЫЖАТО ДО КАПЛИ', 90, 60.4, 60, -260, { cps: 24 });
}, { z: 0.95 });

// хвост: следующая сцена (чтобы последний перелёт было куда делать)
beat(63.59, 'dark:' + FR('trailer', 22.9), (g) => {
  g.el('', NDLOGO, 63.65, 0, -40, { shadow: false, s: 1.1, from: [0, 80] });
  g.cap('ВСЁ РАВНО', 110, 64.2, 0, 140, { cps: 14 });
});

// ---------- концы, камера ----------
beats.forEach((b, i) => (b.end = i + 1 < beats.length ? beats[i + 1].t0 : 1e9));
const KEYS = [[0, 0, beats[0].cx - 40, beats[0].cy + 10, 0.86, 0]];
beats.forEach((b) => {
  if (b.i > 0) KEYS.push([b.t0, 0.7, b.cx, b.cy, b.z, b.i % 2 ? 1 : -1]);
  b.keys.forEach(([t, d, x, y, z]) => KEYS.push([t, d, b.cx + x, b.cy + y, z, b.i % 2 ? 1 : -1]));
});
KEYS.sort((a, b) => a[0] - b[0]);
KEYS.splice(1, 0, [0.0, 1.6, beats[0].cx, beats[0].cy, 1.0, -1]);
window.WHOOSH = beats.slice(1).map((b) => b.t0);
function camAt(t) {
  let c = KEYS[0].slice(2);
  for (let i = 1; i < KEYS.length; i++) {
    const [t0, d, x, y, z, r] = KEYS[i];
    if (t < t0) break;
    const k = d > 0 ? E.inOutQuint(P(t, t0, d)) : 1;
    c = [lerp(c[0], x, k), lerp(c[1], y, k), lerp(c[2], z, k), lerp(c[3], r, k)];
  }
  // постоянное мягкое движение: дрейф и «дыхание» зума
  return { x: c[0] + Math.sin(t * 0.55) * 26, y: c[1] + Math.cos(t * 0.43) * 14, z: c[2] * (1 + 0.02 * Math.sin(t * 0.5)), r: c[3] * 0.8 + Math.sin(t * 0.32) * 0.5 };
}

function frame(t) {
  const c = camAt(t);
  world.style.transform = `translate(960px,540px) rotate(${c.r.toFixed(3)}deg) scale(${c.z.toFixed(4)}) translate(${(-c.x).toFixed(1)}px,${(-c.y).toFixed(1)}px)`;
  const gs = 96 * c.z, gr = document.getElementById('grid');
  gr.style.backgroundSize = `${gs.toFixed(2)}px ${gs.toFixed(2)}px`;
  gr.style.backgroundPosition = `${(((1000 - c.x * c.z) % gs) + gs) % gs}px ${(((580 - c.y * c.z) % gs) + gs) % gs}px`;
  const c0 = camAt(t - 1 / 60), c1 = camAt(t + 1 / 60);
  const zf = Math.abs(c1.z - c0.z) / c.z * 250;
  const bx = Math.min(26, Math.abs(c1.x - c0.x) * c.z * 0.22 + zf), by = Math.min(26, Math.abs(c1.y - c0.y) * c.z * 0.22 + zf);
  document.getElementById('mbg').setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`);
  document.getElementById('cam').style.filter = bx + by > 0.6 ? 'url(#mb)' : 'none';
  let cur = 0; beats.forEach((b, i) => { if (t >= b.t0) cur = i; });
  // фоны: текущий проявляется поверх предыдущего; переход к листу — предыдущий гаснет
  const cb = beats[cur], pb = beats[cur - 1], k = E.inOut(P(t, cb.t0, 0.5));
  beats.forEach((b) => { if (b.layer) b.layer.style.display = 'none'; });
  if (pb && pb.layer) { pb.layer.style.display = 'block'; pb.layer.style.opacity = cb.layer ? 1 : 1 - k; pb.layer.style.zIndex = 1; pb.layer.style.transform = `translateX(${(-80 * k).toFixed(1)}px)`; }
  if (cb.layer) { cb.layer.style.display = 'block'; cb.layer.style.opacity = k; cb.layer.style.zIndex = 2; cb.layer.style.transform = `translateX(${(80 * (1 - k) - (t - cb.t0) * 6).toFixed(1)}px) scale(${(1.04 + (t - cb.t0) * 0.006).toFixed(4)})`; }
  beats.forEach((b, i) => {
    const on = i >= cur - 1 && i <= cur + 1;
    b.root.style.display = on ? 'block' : 'none';
    if (on) b.items.forEach((it) => it.upd(t));
  });
}

window.renderAt = async (t) => { pend.length = 0; frame(t); await Promise.all(pend); };
window.DUR = 63.6;
(async () => {
  await document.fonts.load('700 60px Osw', 'НАСТОЯЩЕЕ БЕЗУМИЕ 256 МБ ?!'); await document.fonts.load('900 60px Mont', 'NAUGHTY DOG');
  await document.fonts.load('60px "Noto Color Emoji"', '☀️🌧️❄️🍂🤖💬🔊🧠🖼️🌍⚠️🤲🤷👉👈🔍✊💦🎬🎭');
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  window.__ready = true;
})();
