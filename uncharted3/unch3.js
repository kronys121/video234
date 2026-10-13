// Uncharted 3 на PS3 — динамичный коллаж в стиле MKTS: короткие сцены, смена фонов
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
const A = (n) => (n.startsWith('/') ? n : `/uncharted3/assets/${n}`);
const G4 = (n) => `/gta4_ps3/assets/${n}`;
const FR = (clip, sec) => `/uncharted3/clips/${clip}/${String(Math.max(1, Math.round(sec * 30))).padStart(4, '0')}.jpg`;
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
    prop(src, h, at, x, y, o = {}) { const i = new Image(); i.src = A(src); i.className = 'o'; i.style.height = h + 'px'; i.style.filter = o.filter || sh; b.root.appendChild(i); if (o.z) i.style.zIndex = o.z; return add(i, (t) => { popIn(i, t, at, x, y, o); if (o.upd) o.upd(t, i); }); },
    card(spec, at, x, y, o = {}) {
      const { w, h, src, clip, n, speed = 1, off = 0, pos = 'center', fps = 30 } = spec;
      const c = ab(b.root, `width:${w}px;height:${h}px`); c.classList.add('card'); if (o.z) c.style.zIndex = o.z;
      const im = new Image(); im.style.objectPosition = pos; c.appendChild(im); if (src) im.src = A(src);
      let cur = -1;
      add(c, (t) => {
        popIn(c, t, at, x, y, o);
        if (clip) { let sec = Math.max(0, t - at) * speed + off; if (fps < 30) sec = Math.floor(sec * fps) / fps; const k = Math.floor(sec * 30) % n + 1; if (k !== cur) { cur = k; im.src = `/uncharted3/clips/${clip}/${String(k).padStart(4, '0')}.jpg`; pend.push(im.decode().catch(() => {})); } }
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


const DISC = `<div style="position:relative;width:440px;height:440px"><div class="dk" style="position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 0deg,#d9dce2,#8fd3ff,#e7c6ff,#fff3b0,#b5ffd9,#d9dce2,#9fb4ff,#ffd1e8,#d9dce2);box-shadow:inset 0 0 0 6px rgba(255,255,255,.6)"><div style="position:absolute;left:50%;top:50%;width:150px;height:150px;margin:-75px;border-radius:50%;background:#e9eaee;box-shadow:0 0 0 6px #bfc3ca"></div><div style="position:absolute;left:62%;top:20%;width:40px;height:16px;border-radius:8px;background:rgba(255,255,255,.8)"></div></div><div style="position:absolute;left:50%;top:50%;width:60px;height:60px;margin:-30px;border-radius:50%;background:#222"></div><div style="position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,.5),transparent 45%)"></div></div>`;
const DOOR = `<div style="position:relative;width:420px;height:600px;border-radius:12px;background:#4a3324;padding:22px 22px 0"><div style="position:relative;width:100%;height:100%;background:#000"><div class="lf" style="position:absolute;inset:0;background:linear-gradient(90deg,#8a5a3a,#6d4429);transform-origin:left center;border:4px solid #3a2516"><div style="position:absolute;right:26px;top:50%;width:22px;height:22px;border-radius:50%;background:#d8b04a"></div></div></div></div>`;
const LOADING = `<div style="width:760px;padding:34px 40px;border-radius:30px;background:#111;font-family:Osw;font-weight:700;color:#fff"><div style="font-size:52px;margin-bottom:20px">ЗАГРУЗКА...</div><div style="height:30px;border-radius:15px;background:#333;overflow:hidden"><div class="lb" style="height:100%;width:0;background:#fff"></div></div></div>`;
const DOTS = `<svg width="100%" height="100%" viewBox="0 0 900 506">${Array.from({ length: 14 * 8 }, (_, i) => `<circle cx="${40 + (i % 14) * 63}" cy="${40 + Math.floor(i / 14) * 61}" r="6" fill="#3cff62" stroke="#0b3" stroke-width="2"/>`).join('')}</svg>`;
const COV = [[220, 150], [420, 120], [640, 220], [760, 330], [500, 420], [260, 420], [900, 480]];
const PLAN = `<svg width="1100" height="640"><rect width="1100" height="640" rx="30" fill="#fff"/>${Array.from({ length: 10 }, (_, i) => `<line x1="${i * 110 + 55}" y1="20" x2="${i * 110 + 55}" y2="620" stroke="#eee" stroke-width="2"/>`).join('')}${COV.map((c) => `<rect class="cv" x="${c[0] - 45}" y="${c[1] - 28}" width="90" height="56" rx="10" fill="#c9ccd2"/>`).join('')}<g class="snd" opacity="0"><circle cx="840" cy="170" r="20" fill="#e3262b"/><circle class="sw" cx="840" cy="170" r="40" fill="none" stroke="#e3262b" stroke-width="5"/></g><circle class="en" cx="120" cy="560" r="24" fill="#2a2a2c"/><circle cx="120" cy="560" r="0"/></svg>`;
const planUpd = (t, d) => {
  const u = fr(t * 1.2), sw = d.querySelector('.sw'); sw.setAttribute('r', (20 + u * 90).toFixed(1)); sw.setAttribute('opacity', (1 - u).toFixed(2));
  d.querySelector('.snd').setAttribute('opacity', t > 252.9 ? 1 : 0);
  d.querySelectorAll('.cv').forEach((r, i) => { const near = [3, 2, 6, 4].includes(i); r.setAttribute('fill', t > 255.5 && near ? (i === 2 && t > 261.2 ? '#e3262b' : '#ffb000') : '#c9ccd2'); });
  const k = E.inOut(P(t, 263.9, 2.6)), en = d.querySelector('.en'); en.setAttribute('cx', lerp(120, 640, k).toFixed(1)); en.setAttribute('cy', lerp(560, 290, k).toFixed(1));
};
const CELLDIA = `<svg width="900" height="520"><rect width="900" height="520" rx="30" fill="rgba(255,255,255,.93)"/><rect class="ppe" x="40" y="50" width="300" height="420" rx="20" fill="#ffb000"/><text x="190" y="290" text-anchor="middle" font-family="Osw" font-weight="700" font-size="84" fill="#2a2a2c">PPE</text>${Array.from({ length: 8 }, (_, i) => { const x = 390 + (i % 4) * 125, y = 50 + Math.floor(i / 4) * 215; return `<rect class="spe" x="${x}" y="${y}" width="105" height="195" rx="16" fill="#c9ccd2"/><text x="${x + 52}" y="${y + 100}" text-anchor="middle" font-family="Osw" font-weight="700" font-size="34" fill="#2a2a2c">SPE</text>`; }).join('')}${Array.from({ length: 8 }, () => `<rect class="pj" width="62" height="38" rx="7" fill="#2a2a2c" opacity="0"/>`).join('')}</svg>`;
const cellUpd = (t, d) => {
  const over = t > 354.09 && t < 367.6; d.querySelector('.ppe').setAttribute('fill', over ? (fr(t * 3) < 0.5 ? '#e3262b' : '#ff6a3d') : '#ffb000');
  d.querySelectorAll('.spe').forEach((r, i) => r.setAttribute('fill', t > 362.33 + i * 0.08 ? '#7fe39a' : '#c9ccd2'));
  d.querySelectorAll('.pj').forEach((r, i) => { const x1 = 390 + (i % 4) * 125 + 22, y1 = 50 + Math.floor(i / 4) * 215 + 135, k = E.inOut(P(t, 367.52 + i * 0.15, 0.6));
    r.setAttribute('x', lerp(70 + (i % 2) * 130, x1, k).toFixed(1)); r.setAttribute('y', lerp(80 + Math.floor(i / 2) * 95, y1, k).toFixed(1)); r.setAttribute('opacity', t > 354.09 ? 1 : 0); });
};
const WALL = (brick) => `<div style="position:relative;width:620px;height:420px;border-radius:26px;overflow:hidden;background:${brick ? 'radial-gradient(circle at 20% 70%,rgba(60,110,40,.85),transparent 22%),radial-gradient(circle at 78% 28%,rgba(60,110,40,.75),transparent 20%),radial-gradient(circle at 55% 85%,rgba(25,45,20,.85),transparent 18%),linear-gradient(0deg,rgba(0,0,0,.4) 3px,transparent 3px) 0 0/100% 46px,linear-gradient(90deg,rgba(0,0,0,.4) 3px,transparent 3px) 0 0/92px 92px,#7a4a36' : '#6b6b70'}"><div class="bm" style="position:absolute;inset:0"></div></div>`;
const beamUpd = (ph) => (t, d) => { const x = 50 + Math.sin(t * 1.4 + ph) * 28, y = 50 + Math.cos(t * 1.1 + ph) * 18; d.querySelector('.bm').style.background = `radial-gradient(circle 150px at ${x.toFixed(1)}% ${y.toFixed(1)}%,rgba(255,245,210,.35),rgba(0,0,0,.66) 100%)`; };

const G5 = (n) => `/gta4_ps3/assets/${n}`;
const TILE = (html, extra = '') => `<div style="padding:24px 40px;border-radius:30px;background:#fff;font-family:Osw;font-weight:700;font-size:54px;color:${INK};text-align:center;line-height:1.08;white-space:nowrap;${extra}">${html}</div>`;
const BIGNUM = (n, sub, col = INK) => `<div style="min-width:380px;padding:26px 40px;border-radius:34px;background:#fff;font-family:Osw;font-weight:700;color:${col};text-align:center;line-height:1"><div style="font-size:120px;white-space:nowrap">${n}</div><div style="font-size:38px;color:${INK};margin-top:8px;white-space:nowrap">${sub}</div></div>`;
const PLATE = (txt, col = '#fff', bg = '#111') => `<div style="padding:10px 34px;border-radius:16px;background:${bg};color:${col};font-family:Osw;font-weight:700;font-size:60px;white-space:nowrap">${txt}</div>`;
const SPUS = (n = 8) => `<div style="display:flex;gap:14px;padding:22px;border-radius:26px;background:#fff">${Array.from({ length: n }, (_, i) => `<div class="sp" style="width:96px;height:130px;border-radius:14px;background:#7fe39a;display:flex;align-items:center;justify-content:center;font-family:Osw;font-weight:700;font-size:30px;color:${INK}">SPU</div>`).join('')}</div>`;
const spuUpd = (cfg) => (t, d) => d.querySelectorAll('.sp').forEach((s, i) => { const c = cfg(t, i); s.style.background = c[0]; s.style.opacity = c[1]; s.textContent = c[2] || 'SPU'; });
// карта-сетка: игрок едет, вокруг подгружаются клетки, позади выгружаются, впереди — предзагрузка
const MAPG = (cols, rows, cs = 62) => `<svg width="${cols * cs + 24}" height="${rows * cs + 24}" style="border-radius:26px;background:#fff">${Array.from({ length: cols * rows }, (_, i) => `<rect class="mc" x="${12 + (i % cols) * cs + 3}" y="${12 + Math.floor(i / cols) * cs + 3}" width="${cs - 6}" height="${cs - 6}" rx="9" fill="#e4e6ea"/>`).join('')}<circle class="pl" r="15" fill="${INK}"/><path class="ah" d="" fill="none" stroke="${RED}" stroke-width="7" stroke-linecap="round" stroke-dasharray="4 14"/></svg>`;
const mapUpd = (cols, rows, cs, pathFn, R = 2.2, ahead = false) => (t, d) => {
  const [px, py, dx, dy] = pathFn(t), cells = d.querySelectorAll('.mc');
  cells.forEach((c, i) => { const cx = (i % cols) + 0.5, cy = Math.floor(i / cols) + 0.5, dist = Math.hypot(cx - px, cy - py);
    const aheadD = Math.hypot(cx - (px + dx * 3), cy - (py + dy * 3));
    c.setAttribute('fill', dist < R ? '#7fe39a' : ahead && aheadD < 1.3 ? '#ffb000' : '#e4e6ea'); });
  const pl = d.querySelector('.pl'); pl.setAttribute('cx', 12 + px * cs); pl.setAttribute('cy', 12 + py * cs);
  if (ahead) d.querySelector('.ah').setAttribute('d', `M ${12 + px * cs} ${12 + py * cs} L ${12 + (px + dx * 3.4) * cs} ${12 + (py + dy * 3.4) * cs}`);
};
const ITEMS = ['🚗', '🧍', '🔊', '🏢'];
const bucketTaps = `<svg width="460" height="360"><g class="tp1"><rect x="40" y="0" width="30" height="60" fill="#8a96a8"/><rect x="40" y="40" width="130" height="26" rx="12" fill="#8a96a8"/><circle class="dr1" cx="150" cy="96" r="9" fill="#4aa8ff"/></g><g class="tp2"><rect x="360" y="0" width="30" height="60" fill="#8a96a8"/><rect x="250" y="40" width="130" height="26" rx="12" fill="#8a96a8"/><circle class="dr2" cx="270" cy="96" r="9" fill="#4aa8ff"/></g><path d="M130 200 L160 340 H300 L330 200 Z" fill="#c9ccd2" stroke="#8a96a8" stroke-width="6"/><rect class="wt" x="140" y="340" width="170" height="0" fill="#4aa8ff"/></svg>`;
const bucketUpd = (at) => (t, d) => { const k = P(t, at, 6); const h = 120 * k; const w = d.querySelector('.wt'); w.setAttribute('y', 340 - h); w.setAttribute('height', h);
  ['dr1', 'dr2'].forEach((c, i) => { const e = d.querySelector('.' + c), u = fr(t * 1.3 + i * 0.4); e.setAttribute('cy', 90 + u * 200); e.setAttribute('opacity', 1 - u * 0.5); e.setAttribute('r', i ? 12 : 6); }); };
const SKY = (p) => { const a = lerp(Math.PI, 0, p % 1); return a; };
const NOTE = (txt) => `<div style="font-family:Osw;font-weight:700;font-size:42px;color:${INK};white-space:nowrap">${txt}</div>`;
// ---------- Uncharted 3: данные ----------
const WORDS = await (await fetch('/uncharted3/words.json')).json();
const nz = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, '');
const at = (p, after = 0, k = 0) => { p = nz(p); let n = 0; for (const x of WORDS) if (x.t >= after - 0.001 && nz(x.w).startsWith(p)) { if (n++ === k) return x.t; } throw new Error('нет слова ' + p + ' после ' + after); };
const N = { net: 532, plane: 488, storm1: 469, storm2: 553, ship1: 262, ship2: 510, water: 577, jungle: 462, mocap: 280, cut: 520 };
const U = (n) => `/uncharted3/assets/${n}`;
const TL = (n) => `/gta4_ps3/tlou/assets/${n}`;
const PS3 = '/gta4_ps3/assets/ps3_fat_flat.png';
const BG = (clip, sec) => FR(clip, sec);
const cc = (g, clip, t, x, y, w, o = {}) => g.card({ w, h: Math.round(w * 9 / 16), clip, n: N[clip], off: o.off || 0, speed: o.speed || 1 }, t, x, y, { from: o.from || [0, 160], r: o.r || 0, z: o.z, t1: o.t1 });
const cover = (g, src, t, x, y, w, h, o = {}) => g.card({ w, h, src }, t, x, y, { from: o.from || [0, 160], r: o.r || 0, z: o.z });

// ---------- нарисованные элементы ----------
const EMF = "font-family:'Noto Color Emoji';";
const PARA = (inner, sky, floor) => `<div style="position:relative;width:820px;height:460px;border-radius:30px;overflow:hidden;background:${sky}"><div class="pb" style="position:absolute;left:0;right:0;bottom:0;height:44%;background:linear-gradient(90deg,${floor} 0 50%,rgba(255,255,255,.28) 50% 100%) 0 0/280px 100% repeat-x"></div><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:190px;${EMF}line-height:1">${inner}</div></div>`;
const paraUpd = (v) => (t, d) => { d.querySelector('.pb').style.backgroundPosition = `${(-(t * v) % 280).toFixed(1)}px 0`; };
const SKEL = `<svg width="320" height="440" viewBox="0 0 320 440" style="background:#fff;border-radius:30px"><g class="sk"></g></svg>`;
const skUpd = (t, d) => {
  const ph = t * 5, a = Math.sin(ph) * 0.7, b = -a, hy = 232 + Math.abs(Math.sin(ph)) * 6;
  const sh = [160, 140], hip = [160, hy];
  const ang = (o, l, th) => [o[0] + Math.sin(th) * l, o[1] + Math.cos(th) * l];
  const k1 = ang(hip, 70, a), f1 = ang(k1, 70, a * 0.4 - 0.2), k2 = ang(hip, 70, b), f2 = ang(k2, 70, b * 0.4 - 0.2);
  const e1 = ang(sh, 55, b), h1 = ang(e1, 50, b - 0.3), e2 = ang(sh, 55, a), h2 = ang(e2, 50, a - 0.3);
  const seg = (p, q) => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
  const dot = (p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="9" fill="${RED}" stroke="#fff" stroke-width="3"/>`;
  const pts = [sh, hip, k1, f1, k2, f2, e1, h1, e2, h2, [160, 82]];
  d.querySelector('.sk').innerHTML = seg(sh, hip) + seg(hip, k1) + seg(k1, f1) + seg(hip, k2) + seg(k2, f2) + seg(sh, e1) + seg(e1, h1) + seg(sh, e2) + seg(e2, h2) + `<circle cx="160" cy="94" r="30" fill="#fff" stroke="${INK}" stroke-width="9"/>` + pts.map(dot).join('');
};
const SHIPW = (real) => `<svg width="620" height="360" viewBox="0 0 620 360" style="background:#fff;border-radius:30px;overflow:hidden"><g class="hull"><path d="M150 150 H470 L430 230 H190 Z" fill="${INK}"/><rect x="250" y="100" width="120" height="50" fill="#c9ccd2"/><rect x="280" y="70" width="20" height="30" fill="#c9ccd2"/></g><path class="wp" fill="#4aa8ff" opacity=".85"/></svg>`;
const shipUpd = (real) => (t, d) => {
  const wav = (x) => (real ? Math.sin(x * 0.02 + t * 2.2) * 26 + Math.sin(x * 0.045 - t * 3.1) * 8 : Math.sin(x * 0.02 + t * 2.2) * 26);
  let p = 'M0 360 '; for (let x = 0; x <= 620; x += 20) p += `L${x} ${(235 + wav(x)).toFixed(1)} `; p += 'L620 360 Z';
  d.querySelector('.wp').setAttribute('d', p);
  const lift = real ? wav(310) : 0, tilt = real ? (wav(380) - wav(240)) * 0.16 : 0;
  d.querySelector('.hull').setAttribute('transform', `translate(0 ${(lift * 0.9).toFixed(1)}) rotate(${tilt.toFixed(2)} 310 190)`);
};
const SKIN = `<svg width="520" height="440" viewBox="0 0 520 440" style="background:#fff;border-radius:30px"><rect x="40" y="170" width="440" height="60" fill="#f1c6a6"/><rect x="40" y="230" width="440" height="80" fill="#e29b7c"/><rect x="40" y="310" width="440" height="90" fill="#c4705f"/><text x="60" y="208" font-family="Osw" font-size="30" fill="#2a2a2c">кожа</text><polyline class="rayin" points="" fill="none" stroke="#ffb000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><polyline class="rayout" points="" fill="none" stroke="#ffb000" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 12"/><text x="40" y="60" font-family="Noto Color Emoji" font-size="64">☀️</text></svg>`;
const skinUpd = (t, d) => { const k = P(t % 3, 0, 1.2); const pts = [[150, 60], [230, 170]]; if (k > 0.35) pts.push([260, 215]); if (k > 0.55) pts.push([330, 260]); if (k > 0.75) pts.push([300, 235]); d.querySelector('.rayin').setAttribute('points', pts.map((p) => p.join(',')).join(' ')); d.querySelector('.rayout').setAttribute('points', k > 0.85 ? '300,235 360,170 420,60' : ''); };
const SLIDERS = (labels) => `<div style="width:620px;padding:30px 36px;border-radius:30px;background:#fff;font-family:Osw;font-weight:700;color:${INK}">${labels.map((l) => `<div style="display:flex;align-items:center;gap:20px;margin:16px 0;font-size:34px"><div style="width:200px">${l}</div><div style="flex:1;height:22px;border-radius:11px;background:#e4e6ea"><div class="sl" style="height:100%;width:0;border-radius:11px;background:${RED}"></div></div></div>`).join('')}</div>`;
const slUpd = (t, d) => d.querySelectorAll('.sl').forEach((s, i) => { s.style.width = (50 + 50 * Math.sin(t * (1.1 + i * 0.5) + i * 1.7)).toFixed(0) + '%'; });
const CULL = `<svg width="760" height="460" viewBox="0 0 760 460" style="background:#fff;border-radius:30px">${Array.from({ length: 60 }, (_, i) => `<rect class="ct" x="${24 + (i % 10) * 71}" y="${24 + Math.floor(i / 10) * 56}" width="62" height="46" rx="9" fill="#e4e6ea"/>`).join('')}<text x="380" y="438" font-size="60" text-anchor="middle" font-family="Noto Color Emoji">👁️</text></svg>`;
const cullUpd = (t, d) => d.querySelectorAll('.ct').forEach((r, i) => { const x = 24 + (i % 10) * 71 + 31 - 380, y = 24 + Math.floor(i / 10) * 56 + 23 - 420, a = Math.atan2(x, -y), c = Math.sin(t * 0.9) * 0.45; const on = Math.abs(a - c) < 0.42; r.setAttribute('fill', on ? '#7fe39a' : '#e4e6ea'); r.setAttribute('opacity', on ? 1 : 0.55); });
const MEMBOX = (a, b) => `<div style="display:flex;align-items:center;gap:90px"><div style="width:330px;height:300px;border-radius:30px;background:#4aa8ff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Osw;font-weight:700;color:#fff"><div style="font-size:60px">${a}</div><div style="font-size:90px">256 МБ</div></div><div style="width:330px;height:300px;border-radius:30px;background:#7fe39a;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Osw;font-weight:700;color:${INK}"><div style="font-size:60px">${b}</div><div style="font-size:90px">256 МБ</div></div></div>`;
const GROW = (label, col) => `<div style="width:560px;font-family:Osw;font-weight:700;color:${INK};font-size:44px;line-height:1"><div style="margin-bottom:10px">${label}</div><div style="height:44px;border-radius:22px;background:#e4e6ea;overflow:hidden"><div class="gb" style="height:100%;width:0;background:${col}"></div></div></div>`;
const growUpd = (at0, dur = 4, max = 1) => (t, d) => { d.querySelector('.gb').style.width = (100 * max * E.outCubic(P(t, at0, dur))).toFixed(1) + '%'; };
const PIX = `<div style="position:relative;width:760px;height:428px;border:6px solid ${INK};border-radius:14px;background:#fff"><div class="p7" style="position:absolute;left:0;top:0;width:506px;height:285px;background:#ffb000;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:Osw;font-weight:700;font-size:70px;color:${INK}">720p</div><div style="position:absolute;right:20px;bottom:14px;font-family:Osw;font-weight:700;font-size:84px;color:${INK}">1080p</div></div>`;
const FACE = (e) => `<div style="${EMF}font-size:150px;line-height:1">${e}</div>`;
const ROLE = (e, txt) => `<div style="padding:18px 30px;border-radius:26px;background:#fff;font-family:Osw;font-weight:700;font-size:44px;color:${INK};white-space:nowrap"><span style="${EMF}font-size:54px">${e}</span> ${txt}</div>`;

// =====================================================================
//                        СЦЕНАРИЙ UNCHARTED 3
// =====================================================================
const D = (clip, s) => 'dark:' + BG(clip, s), L = (clip, s) => 'light:' + BG(clip, s);
const tCrash = at('Crash', 55), tJak = at('Jak', 60);

// 0 · интро
beat(0, D('plane', 6), (g) => {
  cover(g, U('uc3_cover.png'), 0.2, -400, 20, 560, 560, { from: [-200, 0], r: -4 });
  g.prop(PS3, 300, 1.4, 400, 190, { from: [200, 0], r: 3 });
  g.cap('UNCHARTED 3', 104, 2.0, 360, -210, { cps: 16, r: 2 });
  g.emo('🎮', 130, 3.5, 700, 20, {});
}, { keys: [[0, 1.6, 0, 0, 1.0]] });
// 1 · самолёт
beat(4.6, 'grid', (g) => {
  cc(g, 'plane', 4.7, -330, 0, 900, { r: -3, off: 1 });
  g.emo('✈️', 150, 6.2, 470, -300, { r: 12 });
  g.cap('РАЗВАЛИВАЕТСЯ', 100, 6.6, 350, -80, { cps: 18, r: 3 });
  cc(g, 'net', 8.4, 420, 200, 560, { r: 4, off: 2, z: 2 });
  g.emo('👊', 130, 10.0, -700, 340, {});
});
// 2 · буря
beat(at('песчаная', 9), D('storm1', 4), (g) => {
  const t = at('песчаная', 9);
  cc(g, 'storm1', t + 0.1, -380, -20, 820, { r: -3, off: 1 });
  g.emo('🌪️', 200, t + 0.9, 480, -230, { r: 8 });
  g.cap('ПЕСЧАНАЯ БУРЯ', 98, t + 1.0, 340, 80, { cps: 18, r: 2 });
});
// 3 · океан и ИИ
beat(at('океан', 9), L('water', 6), (g) => {
  const t = at('океан', 9);
  cc(g, 'water', t + 0.1, 380, 10, 760, { r: 3, off: 3 });
  g.emo('🌊', 190, t + 0.3, -420, -170, { r: -8 });
  g.cap('ОКЕАН', 110, t + 0.5, -420, 50, { cps: 12 });
  g.emo('🤖', 170, at('искусственным', t), -420, 270, { r: 6 });
});
// 4 · консоли пять лет
beat(16.2, 'grid', (g) => {
  g.prop(PS3, 360, 16.3, -380, 40, { from: [-200, 0] });
  g.el('', BIGNUM('5 ЛЕТ', 'консоли к выходу игры'), 18.0, 380, 20, { from: [0, 160], r: 3 });
  g.cap('СТАРИЧОК', 96, 19.0, 380, -250, { cps: 14, until: 20.3 });
});
// 5 · уже делали
beat(20.5, D('cut', 5), (g) => {
  g.emo('🤔', 200, 20.6, -460, -120, { r: -8 });
  g.cap('ЭТО УЖЕ БЫЛО?', 100, 21.0, 160, -180, { cps: 16 });
  g.prop(PS3, 280, 22.4, 160, 130, { from: [0, 200] });
  g.emo('🎮', 120, 24.0, 520, 130, {});
});
// 6 · чем выделяется
beat(26.2, 'grid', (g) => {
  cover(g, U('uc3_cover.png'), 26.3, -420, 10, 500, 500, { from: [-200, 0], r: -4 });
  g.cap('ЧЕМ ВЫДЕЛЯЕТСЯ?', 104, 26.8, 280, -50, { cps: 16, r: 2 });
  g.emo('⭐', 130, 27.8, 700, 230, {});
});
// 7 · все приёмы вместе
beat(28.6, L('cut', 8), (g) => {
  g.el('', TILE('ВСЕ ПРИЁМЫ'), 28.9, -430, -170, { from: [-200, 0], r: -3 });
  g.emo('➕', 120, 31.2, 0, -170, {});
  g.el('', TILE('В ОДНОЙ ИГРЕ'), 32.0, 430, -170, { from: [200, 0], r: 3 });
  cc(g, 'cut', 33.4, 0, 150, 760, { off: 4, z: 2 });
  g.cap('ПОЧТИ КИНО', 96, 36.6, -520, 330, { cps: 14, r: -4 });
});
// 8 · интерактивное кино
beat(39.6, D('cut', 12), (g) => {
  cc(g, 'cut', 39.7, -330, 20, 860, { r: -3, off: 9, speed: 0.8 });
  g.cap('ИНТЕРАКТИВНОЕ КИНО', 92, 40.4, 300, -330, { cps: 18, r: 2 });
  g.emo('🎬', 190, 41.2, 560, -120, { r: 10 });
  g.emo('🚗', 130, at('погони', 39), 380, 180, {});
  g.emo('🏚️', 130, at('обвалы', 39), 560, 260, {});
  g.emo('🔫', 130, at('перестрелки', 39), 740, 160, {});
});
// 9 · Naughty Dog
beat(53.5, 'grid', (g) => {
  g.prop('nd_logo.png', 170, 53.6, 0, -40, { from: [0, 200] });
  g.cap('КТО ЗА ИГРОЙ?', 100, 54.4, 0, -330, { cps: 16 });
  g.emo('🐾', 150, 56.0, 560, 150, { r: 12 });
});
// 10 · Crash и Jak
beat(57.3, L('plane', 10), (g) => {
  g.prop('crash_cover.png', 480, tCrash - 0.4, -520, 0, { from: [-200, 0], r: -5 });
  g.prop('crash_logo.png', 240, tCrash, -520, -320, { r: 4 });
  g.cap('90-Е · PS1', 80, tCrash + 0.6, -520, 330, { cps: 14, r: -3 });
  g.prop('jak_cover.png', 480, tJak - 0.6, 520, 0, { from: [200, 0], r: 5 });
  g.prop('jak_logo.png', 300, tJak, 520, -330, { r: -3, z: 3 });
  g.cap('2000-Е · PS2', 80, tJak + 0.8, 520, 330, { cps: 14, r: 3 });
});
// 11 · 2001, Sony
beat(68.3, 'grid', (g) => {
  g.cap('2001', 200, 68.5, -380, -120, { cps: 8 });
  g.el('', PLATE('SONY', '#fff', '#111'), at('Sony', 68), 400, -120, { from: [200, 0], r: 3 });
  g.emo('🤝', 170, 71.0, 20, 160, {});
  g.prop('nd_logo.png', 120, 72.2, 20, 360, { from: [0, 100] });
});
// 12 · Uncharted 2007 / 2009
beat(74.1, D('jungle', 8), (g) => {
  cover(g, U('uc1_cover.png'), 76.1, -520, 40, 420, 420, { from: [-200, 0], r: -4 });
  g.cap('2007', 130, 77.1, -520, -300, { cps: 10, r: -3 });
  g.cap('2009', 130, 78.9, 520, -300, { cps: 10, r: 3 });
  cover(g, U('uc2_cover.png'), 79.9, 520, 40, 380, 437, { from: [200, 0], r: 4 });
  g.emo('🏆', 200, at('наград', 78), 0, 60, { r: -8 });
  g.cap('ИГРА ГОДА', 90, at('наград', 78) + 0.4, 0, 300, { cps: 14, r: -3 });
});
// 13 · два года
beat(84.3, 'grid', (g) => {
  g.el('', BIGNUM('2 ГОДА', 'между 2 и 3 частью'), 84.6, -400, 0, { from: [0, 160], r: -3 });
  cover(g, U('uc3_cover.png'), 86.4, 420, 0, 480, 480, { from: [200, 0], r: 3 });
  g.cap('НОЯБРЬ 2011', 80, 88.5, 420, -340, { cps: 14, r: 2 });
});
// 14 · самая безумная идея
beat(91.2, D('plane', 8), (g) => {
  g.emo('💡', 220, 91.4, -470, -120, { r: -8 });
  g.cap('САМАЯ БЕЗУМНАЯ ИДЕЯ', 92, 91.9, 100, -330, { cps: 18, r: 2 });
  cc(g, 'plane', 94.4, 200, 100, 800, { r: 2, off: 4 });
});
// 15 · самолёт падает пока внутри
beat(100.1, L('plane', 12), (g) => {
  cc(g, 'plane', 100.2, 0, 20, 1000, { off: 9, speed: 0.9 });
  g.cap('МИССИЯ: ПАДАЮЩИЙ САМОЛЁТ', 78, 101.0, 0, -470, { cps: 22 });
  g.emo('😱', 140, 103.6, 700, 330, {});
});
// 16 · мощности не хватает
beat(105.9, 'grid', (g) => {
  g.prop(PS3, 320, 106.0, -420, 30, { from: [-200, 0] });
  g.el('width:300px;height:300px', CELLCHIP, 108.8, 0, 30, { from: [0, 160], r: 3 });
  g.el('', XMARK(260), 110.6, 420, 30, { shadow: false, upd: xUpd(110.9) });
  g.cap('МОЩНОСТИ НЕ ХВАТИТ?', 84, 107.4, 0, -350, { cps: 18 });
});
// 17 · физика
beat(113.5, D('plane', 4), (g) => {
  g.cap('НАСТОЯЩАЯ ФИЗИКА', 100, 113.8, 0, -380, { cps: 16, until: 121 });
  g.emo('✈️', 150, at('самолет', 114), -520, 40, { r: -10 });
  g.emo('💨', 150, at('ветер', 114), 0, 40, {});
  g.emo('👊', 150, at('драки', 114), 520, 40, { r: 8 });
  g.el('', XMARK(420), 118.8, 0, 40, { shadow: false, z: 9, upd: xUpd(119.0) });
  g.emo('🥵', 140, 120.4, 0, 330, {});
});
// 18 · иллюзии
beat(122.7, 'grid', (g) => {
  g.emo('🎭', 260, 122.8, -420, 0, { r: -8 });
  g.cap('ИЛЛЮЗИИ', 150, 123.3, 220, -20, { cps: 12, r: 2 });
  g.emo('✨', 120, 125.6, 640, -230, {});
});
// 19 · сет-писы
beat(127.9, D('plane', 11), (g) => {
  cc(g, 'plane', 128.0, -330, 0, 840, { r: -3, off: 7 });
  g.el('', PLATE('СЕТ-ПИС', '#fff', RED), 129.0, 400, -200, { from: [200, 0], r: 3 });
  g.emo('💥', 190, 130.4, 460, 60, { r: 8 });
  g.emo('🌪️', 130, 131.6, 700, 250, {});
});
// 20 · как кадры в кино
beat(133.5, L('cut', 14), (g) => {
  cc(g, 'cut', 133.6, 0, 0, 900, { r: 2, off: 13, speed: 0.9 });
  g.cap('СЦЕНАРИЙ ПО КАДРАМ', 84, 134.4, 0, -400, { cps: 18 });
  g.emo('🎞️', 150, 137.0, -640, 260, { r: -8 });
  g.emo('📋', 140, 140.0, 650, 270, { r: 6 });
});
// 21 · зрелищнее → больше железа
beat(143.3, 'grid', (g) => {
  g.el('', GROW('ЗРЕЛИЩНОСТЬ СЦЕНЫ', '#ffb000'), 143.6, -330, -110, { upd: growUpd(144.4, 6) });
  g.el('', GROW('НАГРУЗКА НА ЖЕЛЕЗО', RED), 145.4, 330, 110, { upd: growUpd(146.2, 6), from: [0, 160] });
  g.emo('🔥', 160, at('железа', 143), 700, -230, {});
  g.cap('ПОКАЗАТЬ ≠ ПОСЧИТАТЬ', 78, at('показывают', 143), 0, 380, { cps: 18 });
});
// 22 · прошлые игры
beat(155.7, D('jungle', 6), (g) => {
  cover(g, U('uc2_cover.png'), 155.9, -420, 20, 440, 506, { from: [-200, 0], r: -4 });
  g.cap('ЧТО ВЗЯТЬ ИЗ ПРОШЛОГО?', 80, 156.4, 300, -130, { cps: 20, r: 2 });
  g.emo('🔍', 170, 158.4, 600, 150, {});
});
// 23 · поезд
beat(161.3, L('jungle', 9), (g) => {
  cc(g, 'jungle', 161.4, -340, 10, 820, { r: -3, off: 3 });
  g.cap('ПОЕЗД · UNCHARTED 2', 76, 162.0, 300, -330, { cps: 18, r: 2 });
  g.emo('🚂', 200, at('поездом', 161), 540, 40, { r: -6 });
  g.cap('ИМИТАЦИЯ ДВИЖЕНИЯ', 70, 164.4, 380, 280, { cps: 20, r: -2 });
});
// 24 · декорация + фон
beat(166.3, 'grid', (g) => {
  g.el('', PARA('🚂', 'linear-gradient(#bde3ff,#e9f6ff)', '#7fb46a'), 166.5, -330, 0, { upd: paraUpd(260), from: [-100, 100] });
  g.cap('ДЕКОРАЦИЯ СТОИТ', 64, 167.4, 470, -180, { cps: 18, r: 2 });
  g.cap('ФОН КРУТИТСЯ', 64, 169.2, 470, 20, { cps: 18, r: -2 });
  g.cap('ПАРАЛЛАКС', 130, 172.8, 330, 250, { cps: 12, r: 2 });
});
// 25 · самолёт стоит, пустыня бежит
beat(175.3, 'grid', (g) => {
  g.el('', PARA('✈️', 'linear-gradient(#9fd0ff,#e9f6ff)', '#e8c883'), 175.5, 0, -20, { upd: paraUpd(420), from: [0, 120] });
  g.cap('САМОЛЁТ СТОИТ НА МЕСТЕ', 80, 176.4, 0, -330, { cps: 18 });
  g.cap('ПУСТЫНЯ БЕЖИТ', 80, 180.0, 0, 330, { cps: 18 });
});
// 26 · камера вокруг
beat(184.0, D('plane', 5), (g) => {
  g.emo('✈️', 230, 184.2, 0, 20, {});
  g.emo('🎥', 190, 184.6, 0, 20, { upd: (t, d) => { const a = (t - 184.6) * 1.8; d.style.marginLeft = (Math.cos(a) * 330).toFixed(0) + 'px'; d.style.marginTop = (Math.sin(a) * 170).toFixed(0) + 'px'; } });
  g.cap('КАМЕРА КРУЖИТ', 100, 185.4, 0, -330, { cps: 14 });
  g.cap('ВСЁ ВЫГЛЯДИТ ОБЪЁМНЫМ', 70, 187.6, 0, 360, { cps: 20 });
});
// 27 · свет
beat(190.6, 'grid', (g) => {
  g.emo('☀️', 220, 190.8, -420, -120, { upd: (t, d) => { d.style.marginLeft = (Math.sin((t - 190.8) * 0.9) * 120).toFixed(0) + 'px'; } });
  g.el('', PARA('✈️', 'linear-gradient(#ffd9a0,#ffeed2)', '#e8c883'), 192.2, 260, 40, { upd: (t, d) => { paraUpd(380)(t, d); d.style.filter = `brightness(${(0.85 + 0.25 * Math.sin(t * 1.3)).toFixed(2)}) drop-shadow(0 30px 30px rgba(0,0,0,.32))`; }, from: [100, 100] });
  g.cap('ИГРА СВЕТА', 100, 192.0, -420, 220, { cps: 14, r: -3 });
});
// 28 · иллюзия
beat(198.0, D('plane', 9), (g) => {
  cc(g, 'plane', 198.1, 0, 10, 940, { off: 3 });
  g.cap('ИЛЛЮЗИЯ ПОЛНАЯ', 100, 198.5, 0, -420, { cps: 14 });
  g.emo('🎩', 150, 199.6, 640, 330, { r: 8 });
});
// 29 · в итоге
beat(200.5, L('plane', 13), (g) => {
  cc(g, 'plane', 200.6, -330, 0, 860, { r: -3, off: 11 });
  g.cap('ПАДАЕТ · РАЗВАЛИВАЕТСЯ · НЕСЁТСЯ', 58, 201.2, 0, -400, { cps: 30 });
  g.emo('🏜️', 170, 203.4, 520, 150, {});
});
// 30 · считается только кадр
beat(206.0, 'grid', (g) => {
  g.emo('👁️', 230, 206.2, -460, -60, {});
  g.cap('СЧИТАЕТСЯ ТОЛЬКО КАДР', 84, 206.8, 160, -250, { cps: 18, r: 2 });
  g.el('', ROLE('✈️', 'кусок самолёта'), 209.0, 160, -60, { from: [200, 0], r: -2 });
  g.el('', ROLE('🏜️', 'движущийся фон'), 210.4, 160, 60, { from: [200, 0], r: 2 });
  g.el('', ROLE('🎥', 'камера'), 212.0, 160, 180, { from: [200, 0], r: -2 });
});
// 31 · главный урок
beat(214.7, D('storm1', 8), (g) => {
  g.cap('ГЛАВНЫЙ УРОК', 120, 214.9, 0, -330, { cps: 14, until: 220 });
  g.emo('🎓', 220, 215.6, -520, 100, { r: -8 });
  g.cap('СЧИТАЙ ТО,', 96, 217.6, 150, 40, { cps: 16, r: -2 });
  g.cap('ЧТО УВИДИТ ИГРОК', 96, 218.6, 150, 160, { cps: 16, r: 2 });
});
// 32 · сетка
beat(223.6, L('net', 6), (g) => {
  cc(g, 'net', 223.7, -330, 0, 880, { r: -3, off: 3 });
  g.cap('ГРУЗОВАЯ СЕТКА', 90, 224.4, 500, -250, { cps: 16, r: 2 });
  g.emo('🧗', 200, 226.0, 520, 120, { r: 8 });
});
// 33 · Assassin's Creed + mocap
beat(227.7, D('mocap', 3), (g) => {
  g.emo('🥷', 180, 227.9, -620, -230, { r: -8 });
  g.cap("ASSASSIN'S CREED", 76, 228.4, -300, -330, { cps: 18, r: -2 });
  cc(g, 'mocap', 230.4, 200, 20, 860, { r: 3, off: 0 });
  g.cap('ЖИВОЙ ЧЕЛОВЕК В КОСТЮМЕ', 66, 232.0, -240, 280, { cps: 24, r: -2 });
});
// 34 · реалистично
beat(236.4, 'grid', (g) => {
  cc(g, 'net', 236.5, 360, 0, 760, { r: 3, off: 9 });
  g.cap('МАКСИМУМ', 120, 236.8, -380, -100, { cps: 12, r: -3 });
  g.cap('РЕАЛИЗМА', 120, 237.6, -380, 80, { cps: 12, r: -3 });
});
// 35 · костюм с метками
beat(240.0, L('mocap', 5), (g) => {
  cc(g, 'mocap', 240.1, -360, 0, 820, { r: -3, off: 3 });
  g.emo('🔴', 130, at('метками', 240), 120, -230, {});
  g.emo('📷', 150, at('камер', 241), 420, -60, { r: 6 });
  g.cap('MOCAP', 120, 244.6, 380, 150, { cps: 10, r: 3 });
});
// 36 · скелет
beat(248.7, 'grid', (g) => {
  g.el('', SKEL, 248.9, -330, 10, { upd: skUpd, from: [-100, 100] });
  g.cap('ДАННЫЕ → СКЕЛЕТ', 90, 249.6, 330, -160, { cps: 18, r: 2 });
  g.emo('🏃', 180, 252.4, 360, 130, { r: -6 });
});
// 37 · голос и движения
beat(254.4, D('mocap', 7), (g) => {
  g.emo('🎤', 190, 254.7, -440, -90, { r: -8 });
  g.emo('➕', 120, 257.8, 0, -90, {});
  g.emo('🕺', 190, 258.4, 440, -90, { r: 8 });
  g.cap('ГОЛОС И ДВИЖЕНИЯ — ВМЕСТЕ', 78, 255.4, 0, 190, { cps: 22 });
});
// 38 · Нолан Норт
beat(262.4, 'grid', (g) => {
  g.prop('nolan.png', 640, 262.5, -420, 20, { from: [-200, 0], r: -3 });
  g.prop('drake_bust.png', 640, 263.6, 420, 20, { from: [200, 0], r: 3 });
  g.cap('НОЛАН НОРТ', 100, 262.8, -420, -380, { cps: 14, r: -3 });
  g.cap('ДРЕЙК', 100, 264.0, 420, -380, { cps: 14, r: 3 });
});
// 39 · жесты совпадают
beat(266.7, L('mocap', 8), (g) => {
  cc(g, 'mocap', 266.8, -380, 0, 760, { r: -3, off: 6 });
  cover(g, U('uc3_cover.png'), 268.0, 440, 0, 420, 420, { from: [200, 0], r: 3 });
  g.cap('=', 180, 268.6, 30, -20, { cps: 6, r: 0 });
  g.cap('ЖИВОЙ ЧЕЛОВЕК', 80, 269.4, 0, -400, { cps: 18 });
});
// 40 · память
beat(272.2, D('storm2', 4), (g) => {
  g.prop(PS3, 300, 272.4, -420, 0, { from: [-200, 0] });
  g.prop('/gta4_ps3/assets/ram.png', 330, 273.6, 20, 0, { from: [0, 160], r: 4 });
  g.cap('УЗКОЕ МЕСТО: ПАМЯТЬ', 90, 273.0, 20, -320, { cps: 18, r: -2 });
  g.emo('🧠', 160, 275.4, 480, 0, { r: 6 });
});
// 41 · две порции
beat(277.5, 'grid', (g) => {
  g.el('', MEMBOX('ПРОЦЕССОР', 'ВИДЕОЧИП'), 277.8, 0, 20, { from: [0, 160] });
  g.el('', XMARK(150), 285.0, 0, 20, { shadow: false, z: 9, upd: xUpd(285.3) });
  g.cap('ДВЕ ОТДЕЛЬНЫЕ ПОРЦИИ', 84, 278.4, 0, -330, { cps: 20 });
});
// 42 · не одолжить
beat(288.8, L('storm2', 8), (g) => {
  g.el('', XMARK(300), 289.0, -380, 0, { shadow: false, upd: xUpd(289.3) });
  g.cap('СОСЕДУ', 120, 289.4, 260, -90, { cps: 12, r: -3 });
  g.cap('НЕ ЗАНЯТЬ', 120, 290.0, 260, 80, { cps: 12, r: -3 });
});
// 43 · сжимать
beat(291.0, 'grid', (g) => {
  g.prop('/gta4_ps3/assets/ram.png', 300, 291.2, -420, 20, { from: [-200, 0], r: -4 });
  g.cap('ВИДЕОПАМЯТИ НЕ ХВАТАЕТ?', 76, 291.6, 160, -300, { cps: 24, r: 2 });
  g.emo('🗜️', 180, at('сжимать', 291), 160, 60, { r: 8 });
  g.cap('СЖИМАЕМ ТЕКСТУРЫ', 76, at('сжимать', 291) + 0.5, 160, 260, { cps: 22, r: -2 });
});
// 44 · occlusion culling
beat(303.0, 'grid', (g) => {
  g.el('', CULL, 303.2, -300, 20, { upd: cullUpd, from: [-100, 100] });
  g.cap('OCCLUSION CULLING', 66, 304.0, 500, -240, { cps: 20, r: 3 });
  g.cap('ГРУЗИМ ТОЛЬКО', 64, 308.0, 480, 0, { cps: 20, r: -2 });
  g.cap('ТО, ЧТО ПЕРЕД ИГРОКОМ', 64, 309.2, 480, 90, { cps: 22, r: -2 });
  g.emo('🗑️', 130, 312.4, 700, 250, {});
});
// 45 · Sink or Swim
beat(316.3, D('ship2', 8), (g) => {
  g.cap('ЭТО БЫЛО ТОЛЬКО НАЧАЛО', 74, 316.4, 0, -450, { cps: 24, until: 318.8 });
  cc(g, 'ship2', 318.9, -330, 20, 860, { r: -3, off: 4 });
  g.cap('SINK OR SWIM', 100, 319.4, 340, -230, { cps: 14, r: 2 });
  g.emo('🚢', 190, 321.6, 520, 70, { r: 8 });
  g.emo('🌊', 150, 323.0, 700, 280, {});
});
// 46 · анимация заранее
beat(325.2, 'grid', (g) => {
  g.emo('🎞️', 220, 325.5, -440, -60, { r: -8 });
  g.cap('ГОТОВАЯ АНИМАЦИЯ', 90, 326.0, 150, -120, { cps: 18, r: 2 });
  g.emo('➡️', 110, 329.6, 150, 80, {});
  g.cap('КАК В БОЛЬШИНСТВЕ ИГР', 66, 330.4, 150, 220, { cps: 24, r: -2 });
});
// 47 · новая система океана
beat(333.1, L('water', 4), (g) => {
  cc(g, 'water', 333.2, 330, 10, 860, { r: 3, off: 8 });
  g.cap('ОКЕАН', 110, 333.6, -440, -150, { cps: 12, r: -3 });
  g.cap('В РЕАЛЬНОМ ВРЕМЕНИ', 60, 334.6, -500, 20, { cps: 20, r: -2 });
  g.emo('⚙️', 150, 337.6, -480, 250, {});
});
// 48 · не текстура
beat(341.8, 'grid', (g) => {
  g.cap('НЕ ПРОСТО', 100, 342.0, -380, -150, { cps: 12, r: -3 });
  g.cap('ПОЛЗУЩАЯ ТЕКСТУРА', 90, 343.2, -300, 40, { cps: 16, r: -2 });
  g.el('', XMARK(220), 345.0, 460, 40, { shadow: false, upd: xUpd(345.2) });
  g.emo('🖼️', 170, 344.2, 460, -200, {});
});
// 49 · двигает корабль
beat(347.7, 'grid', (g) => {
  g.el('', SHIPW(true), 347.9, 0, 30, { upd: shipUpd(true), from: [0, 140] });
  g.cap('ВОДА РАСКАЧИВАЕТ КОРАБЛЬ', 84, 348.6, 0, -330, { cps: 20 });
});
// 50 · обычно картинка
beat(353.4, 'grid', (g) => {
  g.el('', SHIPW(false), 353.6, -430, 20, { upd: shipUpd(false), from: [-100, 100], r: -2 });
  g.cap('ОБЫЧНО', 90, 354.0, -430, -330, { cps: 14, r: -3 });
  g.emo('🖼️', 130, 355.4, -430, 300, {});
  g.el('', SHIPW(true), 357.0, 430, 20, { upd: shipUpd(true), from: [100, 100], r: 2 });
  g.cap('ЗДЕСЬ', 90, 357.2, 430, -330, { cps: 14, r: 3 });
  g.emo('✅', 130, 358.6, 430, 300, {});
});
// 51 · корабль реагирует
beat(359.8, D('ship1', 4), (g) => {
  cc(g, 'ship1', 359.9, -330, 10, 800, { r: -3, off: 0 });
  g.cap('КАЧАЕТСЯ · КРЕНИТСЯ', 72, 360.4, 460, -230, { cps: 20, r: 2 });
  g.emo('↕️', 130, 363.6, 520, 20, {});
  g.cap('ВВЕРХ · ВНИЗ', 78, 365.0, 400, 170, { cps: 20, r: -2 });
});
// 52 · 1/30 секунды
beat(368.6, 'grid', (g) => {
  g.el('width:300px;height:300px', CLOCK, 368.8, -380, 0, { upd: clockUpd, from: [-100, 100] });
  g.cap('1/30 СЕКУНДЫ', 120, 372.0, 220, -80, { cps: 10, r: 2 });
  g.cap('НА КАЖДЫЙ КАДР', 70, 373.4, 220, 100, { cps: 20, r: -2 });
});
// 53 · три способа
beat(376.8, L('water', 14), (g) => {
  g.el('', ROLE('💧', 'ЛУЖИ И РЕКИ'), at('спокойных', 376), -430, -150, { from: [-200, 0], r: -3 });
  g.el('', ROLE('🌊', 'ОТКРЫТЫЙ ОКЕАН'), at('больших', 376), 0, 20, { from: [0, 160], r: 2 });
  g.el('', ROLE('🚰', 'ПОТОКИ В КОРИДОРАХ'), at('воды', 385), 430, 190, { from: [200, 0], r: -2 });
  g.cap('3 СИСТЕМЫ ВОДЫ', 100, 377.4, 0, -400, { cps: 14, until: 388 });
});
// 54 · 30 fps
beat(391.0, 'grid', (g) => {
  g.el('', BIGNUM('30 FPS', 'стабильно'), 391.3, -330, 20, { from: [0, 160], r: -3 });
  cc(g, 'water', 392.4, 380, 20, 640, { r: 3, off: 12 });
  g.emo('✅', 150, 394.0, 700, -230, {});
});
// 55 · пустыня
beat(395.7, D('storm1', 6), (g) => {
  cc(g, 'storm1', 395.8, -320, 10, 820, { r: -3, off: 4 });
  g.cap('ПУСТЫНЯ', 130, 396.0, 400, -200, { cps: 12, r: 2 });
  g.emo('🏜️', 190, 397.8, 560, 60, { r: 8 });
});
// 56 · частицы
beat(400.7, L('storm2', 10), (g) => {
  cc(g, 'storm2', 400.8, 340, 10, 820, { r: 3, off: 6 });
  g.cap('ЧАСТИЦЫ', 100, 401.2, -440, -190, { cps: 12, r: -3 });
  g.emo('🌫️', 150, at('дымка', 400), -460, 20, {});
  g.emo('☀️', 150, at('свет', 405), -460, 230, {});
});
// 57 · в каждом кадре
beat(410.9, 'grid', (g) => {
  g.cap('ВСЁ ЭТО', 110, 411.0, 0, -100, { cps: 12, r: -3 });
  g.cap('В КАЖДОМ КАДРЕ', 110, 411.8, 0, 100, { cps: 12, r: 3 });
  g.emo('🔁', 150, 412.8, 600, 0, {});
});
// 58 · выжатая консоль
beat(413.6, D('plane', 14), (g) => {
  g.prop(PS3, 360, 413.8, -380, 20, { from: [-200, 0] });
  g.emo('🥵', 200, 416.0, 380, -100, {});
  g.cap('ВЫЖАТА ДО ПРЕДЕЛА', 90, 417.0, 340, 150, { cps: 18, r: 2 });
});
// 59 · жертвы: 1080p → 720p
beat(421.6, 'grid', (g) => {
  g.cap('ПРИШЛОСЬ ЖЕРТВОВАТЬ', 84, 421.8, 0, -400, { cps: 18, until: 426 });
  g.el('', BIGNUM('1080p', 'хотели', '#2e9e57'), 426.3, -430, 20, { from: [-200, 0], r: -3 });
  g.emo('➡️', 130, 429.6, 0, 20, {});
  g.el('', BIGNUM('720p', 'получили', RED), 430.0, 430, 20, { from: [200, 0], r: 3 });
});
// 60 · 2.25×
beat(434.5, L('storm1', 12), (g) => {
  g.el('', PIX, 434.8, -300, 20, { from: [-100, 100] });
  g.el('', BIGNUM('×2,25', 'пикселей'), 437.6, 480, -100, { from: [200, 0], r: 3 });
  g.cap('ЦВЕТ И ГЛУБИНА ДЛЯ КАЖДОГО', 56, 440.4, 480, 150, { cps: 28, r: -2 });
});
// 61 · быстрый способ
beat(445.2, 'grid', (g) => {
  g.emo('⚡', 220, 445.4, -420, -20, {});
  g.cap('САМЫЙ БЫСТРЫЙ СПОСОБ', 80, 446.0, 150, -150, { cps: 20, r: 2 });
  g.cap('ОСВОБОДИТЬ ПАМЯТЬ И ВРЕМЯ', 64, 448.0, 150, 60, { cps: 22, r: -2 });
});
// 62 · 3D режим
beat(451.4, D('cut', 16), (g) => {
  g.emo('🕶️', 230, 451.6, -420, -60, { r: -8 });
  g.cap('СТЕРЕО 3D', 120, 452.2, 200, -120, { cps: 12, r: 2 });
  g.cap('ЕЩЁ ОДНА НАГРУЗКА', 70, 453.8, 200, 80, { cps: 20, r: -2 });
});
// 63 · картинка на каждый глаз
beat(456.5, 'grid', (g) => {
  cc(g, 'cut', 456.7, -400, 0, 640, { r: -3, off: 5 });
  cc(g, 'cut', 458.0, 400, 0, 640, { r: 3, off: 5.04 });
  g.cap('ЛЕВЫЙ ГЛАЗ', 56, 457.0, -400, -280, { cps: 20, r: -3 });
  g.cap('ПРАВЫЙ ГЛАЗ', 56, 458.4, 400, -280, { cps: 20, r: 3 });
  g.cap('×2 РАБОТЫ', 100, 461.0, 0, 330, { cps: 12 });
});
// 64 · Дрейк
beat(465.1, L('cut', 8), (g) => {
  g.prop('drake.png', 760, 465.2, -340, 40, { from: [-200, 0], r: -2 });
  g.cap('КАК СОЗДАЮТ ДРЕЙКА', 90, 465.8, 320, -200, { cps: 18, r: 2 });
  g.emo('🧑‍🎨', 190, 468.4, 580, 100, { r: 8 });
});
// 65 · десятки специалистов
beat(473.3, 'grid', (g) => {
  g.cap('ДЕСЯТКИ СПЕЦИАЛИСТОВ', 84, 473.5, 0, -400, { cps: 20 });
  ['👷', '🧑‍🎨', '👩‍💻', '🎭', '🎬'].forEach((e, i) => g.emo(e, 170, 475.2 + i * 0.7, -520 + i * 260, 20 + (i % 2) * 100, { r: (i % 2 ? 6 : -6) }));
  g.cap('КАЖДЫЙ — ЗА СВОЙ КУСОЧЕК', 62, 479.0, 0, 300, { cps: 24 });
});
// 66 · лепка
beat(479.7, D('cut', 12), (g) => {
  g.prop('drake_bust.png', 640, 479.8, -380, 20, { from: [-200, 0], r: -3 });
  g.emo('🗿', 200, 480.6, 380, -150, { r: 8 });
  g.cap('ЛЕПКА', 130, 481.0, 380, 60, { cps: 10, r: -2 });
  g.cap('ПО СКАНАМ АКТЁРОВ', 64, 484.2, 380, 220, { cps: 22, r: 2 });
});
// 67 · текстуры кожи
beat(488.8, 'grid', (g) => {
  g.prop('drake_bust.png', 700, 489.0, 380, 20, { from: [200, 0], r: 3 });
  g.cap('КОЖА', 130, 489.4, -420, -200, { cps: 10, r: -3 });
  g.cap('ПОРЫ', 70, 492.4, -440, -20, { cps: 12, r: -2 });
  g.cap('ВЕНЫ', 70, 493.8, -300, 90, { cps: 12, r: 2 });
  g.cap('ВЕСНУШКИ', 70, 495.2, -440, 200, { cps: 12, r: -2 });
});
// 68 · шейдеры
beat(501.9, L('storm1', 9), (g) => {
  g.emo('💡', 220, 502.1, -420, -80, { r: -8 });
  g.cap('ШЕЙДЕР', 130, 502.6, 200, -150, { cps: 10, r: 2 });
  g.cap('КАК СВЕТ ВЕДЁТ СЕБЯ НА КОЖЕ', 56, 504.2, 200, 40, { cps: 26, r: -2 });
});
// 69 · свет внутри кожи
beat(508.2, 'grid', (g) => {
  g.el('', SKIN, 508.4, -330, 20, { upd: skinUpd, from: [-100, 100] });
  g.cap('СВЕТ ЗАХОДИТ ВНУТРЬ', 76, 509.2, 370, -150, { cps: 20, r: 2 });
  g.cap('РАССЕИВАЕТСЯ', 76, 511.4, 370, 20, { cps: 16, r: -2 });
  g.cap('И ВЫХОДИТ', 76, 512.8, 370, 190, { cps: 16, r: 2 });
});
// 70 · узкое место
beat(514.9, D('cut', 4), (g) => {
  g.cap('SSS', 150, 515.0, -300, -100, { cps: 8, r: -3 });
  g.prop(PS3, 300, 516.0, 380, 40, { from: [200, 0] });
  g.emo('🐌', 150, 520.0, 380, -190, { r: 8 });
  g.cap('САМОЕ УЗКОЕ МЕСТО', 76, 518.0, -200, 150, { cps: 18, r: 2 });
});
// 71 · мимика
beat(524.4, L('cut', 13), (g) => {
  g.prop('drake_bust.png', 640, 524.5, -400, 20, { from: [-200, 0], r: -3 });
  g.cap('МИМИКА', 130, 524.9, 330, -220, { cps: 10, r: 2 });
  g.el('', FACE('😐'), 526.4, 330, 60, { shadow: false, t1: 527.4 });
  g.el('', FACE('😮'), 527.5, 330, 60, { shadow: false, t1: 528.4 });
  g.el('', FACE('😠'), 528.5, 330, 60, { shadow: false });
});
// 72 · blend shapes
beat(533.6, 'grid', (g) => {
  g.el('', SLIDERS(['БРОВЬ', 'УЛЫБКА', 'УДИВЛЕНИЕ', 'ЗЛОСТЬ']), 533.8, -330, 20, { upd: slUpd, from: [-100, 100] });
  g.cap('BLEND SHAPES', 90, 534.4, 380, -170, { cps: 14, r: 2 });
  g.cap('ЗАРАНЕЕ ВЫЛЕПЛЕННЫЕ ЛИЦА', 56, 536.6, 380, 20, { cps: 26, r: -2 });
});
// 73 · смешивает
beat(540.0, D('cut', 14), (g) => {
  g.prop('drake_bust.png', 600, 540.2, -400, 40, { from: [-200, 0], r: -3 });
  g.cap('СМЕШИВАЕТ В РЕАЛЬНОМ ВРЕМЕНИ', 66, 540.6, 280, -190, { cps: 24, r: 2 });
  g.el('', SLIDERS(['УДИВЛЕНИЕ', 'ЗЛОСТЬ']), 543.4, 340, 120, { upd: slUpd, from: [100, 100], r: -2 });
});
// 74 · это только лицо
beat(549.9, 'grid', (g) => {
  g.cap('ЭТО ТОЛЬКО ЛИЦО', 110, 550.0, 0, -400, { cps: 14, until: 555 });
  g.el('', SKEL, 551.8, -520, 20, { upd: skUpd, from: [-100, 100] });
  g.emo('👕', 190, at('одежда', 551), -80, 20, { r: -8 });
  [0, 1, 2].forEach((i) => g.prop('drake.png', 360 - i * 90, at('версии', 551) + i * 0.4, 330 + i * 230, 120 + i * 20, { filter: `blur(${i * 2.4}px) drop-shadow(0 20px 20px rgba(0,0,0,.3))`, from: [100, 100] }));
});
// 75 · сотни движений
beat(562.3, L('net', 12), (g) => {
  g.cap('СОТНИ ДВИЖЕНИЙ', 110, 562.5, 0, -400, { cps: 14 });
  [['🏃', 'бег'], ['🤸', 'прыжок'], ['🧗', 'лазание'], ['🫣', 'укрытие'], ['🥊', 'драка']].forEach(([e, w], i) => g.emo(e, 160, 563.6 + i * 0.6, -560 + i * 280, 60 + (i % 2) * 110, { r: i % 2 ? 6 : -6 }));
});
// 76 · плавные переходы
beat(568.1, 'grid', (g) => {
  g.el('', GROW('ПРЫЖОК', '#4aa8ff'), 568.4, -330, -110, { upd: (t, d) => { d.querySelector('.gb').style.width = (100 - 100 * P(t, 569.4, 3)).toFixed(0) + '%'; }, from: [-100, 100] });
  g.el('', GROW('ПРИЗЕМЛЕНИЕ', '#7fe39a'), 568.8, -330, 110, { upd: (t, d) => { d.querySelector('.gb').style.width = (100 * P(t, 569.4, 3)).toFixed(0) + '%'; }, from: [-100, 100] });
  g.cap('БЕЗ РЫВКОВ', 120, 570.0, 400, 0, { cps: 10, r: 3 });
});
// 77 · смешивает анимации
beat(574.2, D('net', 8), (g) => {
  cc(g, 'net', 574.3, -330, 20, 820, { r: -3, off: 6 });
  g.cap('ТОЖЕ СМЕШИВАЕТ', 90, 574.8, 360, -170, { cps: 16, r: 2 });
  g.cap('ПРЯМО В ИГРЕ', 90, 576.4, 360, 20, { cps: 16, r: -2 });
});
// 78 · почему дорого
beat(580.3, 'grid', (g) => {
  g.emo('💸', 230, 580.5, -420, -60, { r: -8 });
  g.cap('ПОЧЕМУ ИГРЫ ТАК ДОРОГИ?', 74, 581.0, 260, -150, { cps: 18, r: 2 });
  g.emo('❓', 150, 583.4, 140, 110, {});
});
// 79 · команда
beat(585.1, L('cut', 3), (g) => {
  g.cap('НЕ ОДНА КОМАНДА', 96, 585.3, 0, -420, { cps: 14, until: 589 });
  [['🗿', 'МОДЕЛЛЕРЫ', -520, -130], ['🖌️', 'ТЕКСТУРЫ', 0, -200], ['💻', 'ШЕЙДЕРЫ', 520, -130], ['🏃', 'АНИМАТОРЫ', -520, 90], ['🎙️', 'АКТЁРЫ', 0, 30], ['🎬', 'РЕЖИССЁРЫ', 520, 90]].forEach(([e, w, x, y], i) => g.el('', ROLE(e, w), 589.4 + i * 1.6, x, y + 160, { from: [0, 120], r: i % 2 ? 2 : -2 }));
});
// 80 · две команды
beat(601.2, 'grid', (g) => {
  cover(g, U('uc3_cover.png'), 601.4, -420, 10, 440, 440, { from: [-200, 0], r: -4 });
  g.prop('/gta4_ps3/tlou/assets/tlou_box.png', 480, 606.6, 420, 10, { from: [200, 0], r: 4 });
  g.cap('ДВЕ КОМАНДЫ', 100, 602.2, 0, -400, { cps: 14, until: 610 });
  g.emo('✂️', 150, 604.0, 0, 190, {});
});
// 81 · 24 ТБ
beat(612.3, D('storm2', 12), (g) => {
  g.el('', BIGNUM('24 ТБ', 'ресурсов одной Uncharted 3'), 612.6, 0, 0, { from: [0, 160] });
  g.emo('💾', 190, 615.0, -520, -190, { r: -8 });
  g.cap('ПО СООБЩЕНИЯМ', 56, 617.0, 0, 280, { cps: 20 });
});
// 82 · сотни специалистов
beat(619.7, 'grid', (g) => {
  g.emo('👥', 240, 619.9, -420, 0, { r: -6 });
  g.cap('СОТНИ СПЕЦИАЛИСТОВ', 90, 620.6, 160, -120, { cps: 18, r: 2 });
  g.cap('МНОГО ЛЕТ', 110, 622.4, 160, 80, { cps: 12, r: -2 });
});
// 83 · десятки миллионов
beat(624.1, L('cut', 6), (g) => {
  g.emo('💵', 220, 624.3, -420, -60, { r: -8 });
  g.el('', BIGNUM('ДЕСЯТКИ МЛН $', 'стоит AAA-игра', '#2e9e57'), 626.0, 200, 20, { from: [200, 0], r: 3 });
  g.emo('🤑', 130, 628.6, 700, -230, {});
});
// 84 · итог
beat(630.6, D('plane', 10), (g) => {
  g.cap('ИТОГ', 150, 630.8, 0, -380, { cps: 8, until: 635.8 });
  g.prop(PS3, 360, 631.4, -400, 100, { from: [-200, 0] });
  g.prop('drake.png', 760, 632.0, 330, 60, { from: [200, 0], r: 3 });
});
// 85 · показать, не считать
beat(635.9, 'grid', (g) => {
  g.el('', ROLE('✈️', 'САМОЛЁТ СТОИТ НА МЕСТЕ'), 636.6, -330, -190, { from: [-200, 0], r: -2 });
  g.el('', ROLE('🗑️', 'НЕВИДИМОЕ ВЫГРУЖАЕТСЯ'), 641.0, 330, -40, { from: [200, 0], r: 2 });
  g.el('', ROLE('📉', 'РАЗРЕШЕНИЕ ЗА ВОДУ И ПЕСОК'), 645.2, -330, 110, { from: [-200, 0], r: -2 });
});
// 86 · от пор до волн
beat(650.0, L('water', 8), (g) => {
  g.prop('drake_bust.png', 640, 650.1, -400, 20, { from: [-200, 0], r: -3 });
  cc(g, 'water', 652.6, 400, 20, 720, { r: 3, off: 10 });
  g.cap('ОТ ПОР НА КОЖЕ', 66, 650.6, 400, -300, { cps: 20, r: 2 });
  g.cap('ДО ВОЛН ВОКРУГ КОРАБЛЯ', 66, 654.0, 400, 340, { cps: 22, r: -2 });
});
// 87 · финал
beat(658.3, D('plane', 7), (g) => {
  cover(g, U('uc3_cover.png'), 658.4, -420, 20, 500, 500, { from: [-200, 0], r: -4 });
  g.prop(PS3, 320, 659.0, 420, 190, { from: [200, 0] });
  g.prop('nd_logo.png', 110, 659.6, 440, -190, { from: [200, 0], r: 3 });
  g.cap('ИЛЛЮЗИИ ВМЕСТО ФИЗИКИ', 70, 661.0, 0, -440, { cps: 24, until: 667 });
});
// 88 · комментарии
beat(667.7, 'grid', (g) => {
  g.cap('КАКИЕ ИГРЫ МЫ ПРОПУСТИЛИ?', 90, 667.9, 0, -90, { cps: 18, until: 672 });
  g.emo('💬', 200, 669.0, 0, 190, { r: 6 });
  g.cap('ПИШИТЕ В КОММЕНТАРИЯХ', 70, 670.0, 0, 400, { cps: 24 });
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
window.DUR = 674.6;
(async () => {
  await document.fonts.load('700 60px Osw', 'НАСТОЯЩЕЕ БЕЗУМИЕ 256 МБ ?!'); await document.fonts.load('900 60px Mont', 'NAUGHTY DOG');
  await document.fonts.load('60px "Noto Color Emoji"', '🎮✈️👊🌪️🌊🤖⭐➕🚗🏚️🔫🐾🤝🏆💡😱🥵🎭✨💥🎞️📋🔥🔍🚂🎥🏜️🎩🥷🧗👁️🎓🔴📷🏃🕺🎤🧠🗜️🗑️🚢⚙️🖼️↕️🚰💧📉⚡🕶️🧑‍🎨👷👩‍💻🎬🗿🖌️💻🎙️💸❓💾👥💵🤑🐌😐😮😠🤔🌫️☀️🔁🫣🤸🥊👕✂️💬✅➡️☀️🌧️❄️🍂🤖💬🔊🧠🖼️🌍⚠️🤲🤷👉👈🔍✊💦🎬🎭🖐️👀😵🏁💥⚙️🌿🔧🗑️⚡⏱️🥊🐢🔥📦📄🐺🎯😴⚔️📍⬅️➡️🧍‍♂️💡🔦🥵✅🦠🎨💧🏃👁️📐🧱😡😐👻');
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  window.__ready = true;
})();
