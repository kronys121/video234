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
const A = (n) => (n.startsWith('/') ? n : `/gta5_new/assets/${n}`);
const G4 = (n) => `/gta4_ps3/assets/${n}`;
const FR = (clip, sec) => `/gta5_new/clips/${clip}/${String(Math.max(1, Math.round(sec * 30))).padStart(4, '0')}.jpg`;
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
        if (clip) { let sec = Math.max(0, t - at) * speed + off; if (fps < 30) sec = Math.floor(sec * fps) / fps; const k = Math.floor(sec * 30) % n + 1; if (k !== cur) { cur = k; im.src = `/gta5_new/clips/${clip}/${String(k).padStart(4, '0')}.jpg`; pend.push(im.decode().catch(() => {})); } }
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

// ---------- кадры клипов ----------
const N = { night_street: 463, beach_quad: 704, mountain_view: 648, gas_station: 575, city_traffic: 610, online_bike: 381, online_deadline: 400, online_sumo: 278, switch: 1349 };
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
const HEROES = (g, at, y = 60, s = 1) => { g.prop('franklin.png', 720 * s, at, -520, y + 70, { from: [-220, 0], z: 1 }); g.prop('michael.png', 740 * s, at + 0.12, 0, y + 60, { from: [0, 200], z: 2 }); g.prop('trevor.png', 760 * s, at + 0.24, 520, y + 60, { from: [220, 0], z: 1 }); };
const SWITCHCARD = (g, at, x, y, off, speed = 0.5, w = 880, o = {}) => g.card({ w, h: Math.round(w * 450 / 800), clip: 'switch', n: N.switch, off, speed }, at, x, y, { from: [0, 160], ...o });

// =====================================================================
//                         СЦЕНАРИЙ GTA 5
// =====================================================================
// 0 · после GTA 4 — GTA 5 на PS3
beat(0, 'dark:' + A('industrial_dusk.jpg'), (g) => {
  g.prop('/gta4_ps3/assets/gta4_logo.png', 330, 0.2, -560, -260, { from: [-160, 0], r: -4 });
  g.el('width:220px;height:120px', CHEV(1), 2.6, -250, -260, { shadow: false, upd: chevUpd });
  g.prop('gta5_logo.png', 480, 3.04, 280, -240, { from: [200, 0], r: 3 });
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 300, 5.4, 0, 230, { from: [0, 200] });
  g.cap('СНОВА НА PS3', 96, 6.1, 0, 440, { cps: 18, until: 7.2 });
}, { keys: [[0, 1.6, 0, 0, 1.0], [3.0, 1.0, 40, 10, 1.02]] });

// 1 · настоящее безумие
beat(7.28, 'light:' + A('los_santos_haze.jpg'), (g) => {
  g.prop('franklin.png', 880, 7.3, -640, 140, { from: [-240, 0], z: 1 });
  g.prop('trevor.png', 900, 7.4, 640, 130, { from: [240, 0], z: 1 });
  g.prop('michael.png', 800, 7.5, 0, 90, { from: [0, 200], z: 2 });
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 220, 8.6, 0, 330, { from: [0, 160], z: 4, filter: 'drop-shadow(0 30px 30px rgba(0,0,0,.4))' });
  g.cap('НАСТОЯЩЕЕ БЕЗУМИЕ', 84, 9.44, 0, -430, { cps: 26, fly: true });
});

// 2 · огромный открытый мир
beat(12.56, 'grid', (g) => {
  g.card({ w: 780, h: 439, clip: 'city_traffic', n: N.city_traffic, off: 2.0 }, 12.6, -400, -40, { from: [-240, 60], r: -3 });
  g.card({ w: 620, h: 349, clip: 'mountain_view', n: N.mountain_view, off: 3.0 }, 16.2, 420, 140, { from: [240, 60], r: 3, z: 2 });
  g.cap('ОГРОМНЫЙ МИР', 96, 12.9, -400, -350, { cps: 22 });
  [['🏙️', 15.36, -640, 330], ['🏘️', 16.0, -480, 340], ['⛰️', 16.9, 80, 380], ['🌊', 18.28, 640, -230], ['🦌', 19.1, 780, -90]].forEach(([e, at, x, y]) => g.emo(e, 120, at, x, y, {}));
}, { keys: [[16.1, 0.8, 100, 40, 0.96]] });

// 3 · железо устарело: 2006 → 2013
beat(20.88, 'dark:' + A('industrial_dusk.jpg'), (g) => {
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 280, 21.0, -420, 40, { from: [-160, 0] });
  g.emo('⚰️', 150, 23.3, -420, -170, { r: -8 });
  g.cap('УСТАРЕЛО', 100, 23.5, -420, -360, { cps: 14, until: 25.8 });
  g.cap('2006', 150, 25.92, 360, -140, { cps: 8, until: 32.0 });
  g.el('width:220px;height:120px', CHEV(1), 28.2, 360, 40, { shadow: false, upd: chevUpd });
  g.cap('2013', 150, 29.44, 360, 200, { cps: 8, until: 32.0 });
  g.cap('7 ЛЕТ', 110, 31.2, -420, 260, { cps: 10, col: '#ffb000' });
});

// 4 · 256 МБ + 256 МБ
beat(32.64, 'grid', (g) => {
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 240, 32.7, 0, -330, { from: [0, -100] });
  g.prop('/gta4_ps3/assets/ram.png', 320, 37.76, -380, 80, { from: [-200, 100], r: -6 });
  g.cap('256 МБ', 120, 38.4, -380, -170, { cps: 12 });
  g.cap('ОПЕРАТИВКА', 56, 38.9, -380, 270, { cps: 22 });
  g.el('width:300px;height:300px', CHIP('RSX', 'видеочип'), 41.84, 380, 60, { from: [200, 100], r: 4 });
  g.cap('256 МБ', 120, 42.4, 380, -170, { cps: 12 });
  g.cap('ВИДЕОПАМЯТЬ', 56, 42.9, 380, 270, { cps: 22 });
}, { z: 0.95 });

// 5 · 5 минут 4K весят больше всей памяти PS3
beat(45.2, 'grid', (g) => {
  g.emo('📱', 260, 45.3, -480, 20, { r: -8 });
  g.el('', PLATE('4K · 5 МИН', '#fff', '#2a2a2c'), 46.4, -480, 230, {});
  g.el('width:200px;height:100px', `<div style="font-family:Osw;font-weight:700;font-size:200px;color:${RED};line-height:1">&gt;</div>`, 49.0, 0, 20, { shadow: false, dur: 0.4 });
  g.prop('/gta4_ps3/assets/ram.png', 280, 50.56, 480, 20, { from: [200, 0], r: 5 });
  g.cap('256 МБ', 90, 51.0, 480, 220, { cps: 12 });
  g.cap('ВСЯ ПАМЯТЬ PS3', 70, 50.9, 480, -300, { cps: 22 });
  g.cap('ВЕСИТ БОЛЬШЕ', 96, 47.6, -140, -330, { cps: 20, until: 52.0 });
});

// 6 · масштаб в цифрах: 5 лет, $265 млн
beat(52.4, 'dark:' + A('car_collection.jpg'), (g) => {
  g.cap('МАСШТАБ', 120, 52.5, 0, -400, { cps: 12, until: 55.2 });
  g.el('', BIGNUM('5 ЛЕТ', 'разработка'), 55.28, -380, 20, { from: [0, 160], r: -3 });
  g.emo('💵', 190, 58.04, 380, -190, { r: 8 });
  g.el('', BIGNUM('$265 МЛН', 'по оценкам прессы', '#2e9e57'), 58.2, 380, 100, { from: [0, 160], r: 3 });
}, { z: 0.96 });

// 7 · карта больше трёх игр вместе
beat(63.68, 'grid', (g) => {
  g.card({ w: 1000, h: 563, src: 'los_santos_haze.jpg' }, 63.7, -140, 20, { from: [0, 160], r: -2 });
  g.cap('КАРТА БОЛЬШЕ', 100, 63.9, -140, -360, { cps: 20, until: 70.0 });
  g.prop('/gta4_ps3/assets/gta4_logo.png', 200, 66.9, 650, -250, { from: [200, 0] });
  g.prop('/gta4_ps3/assets/cj_shadow.png', 380, 68.6, 650, 80, { from: [200, 0] });
  g.emo('🤠', 150, 66.24, 650, -60, { r: 6 });
  g.cap('RDR + GTA 4 + SA', 60, 69.2, -140, 360, { cps: 22 });
}, { z: 0.95 });

// 8 · 800 млн за сутки, миллиард за три дня
beat(71.34, 'dark:' + A('car_collection.jpg'), (g) => {
  g.emo('🏆', 200, 71.4, 0, -300, {});
  g.el('', BIGNUM('$800 МЛН', 'за первые сутки', '#2e9e57'), 73.42, -400, 60, { from: [-200, 100], r: -3 });
  g.el('', BIGNUM('$1 МЛРД', 'за три дня', '#2e9e57'), 76.46, 400, 60, { from: [200, 100], r: 3 });
  g.cap('РЕКОРД', 130, 78.7, 0, 360, { fly: true, col: '#ffb000' });
}, { z: 0.96 });

// 9 · как это возможно?
beat(83.02, 'grid', (g) => {
  g.prop('gta5_box.png', 560, 83.1, -350, 40, { from: [-200, 100], r: -4 });
  g.cap('?', 520, 85.1, 330, 30, { cps: 3 });
  g.cap('КАК ВОЗМОЖНО', 96, 83.4, 0, -420, { cps: 20 });
}, { z: 0.95 });

// 10 · игра собирает мир вокруг вас и выгружает пройденное
const wp = (t) => { const k = clamp((t - 89.5) / 22); const x = lerp(1.2, 10.6, k), y = 3.5 + Math.sin(k * 6.2) * 1.8; return [x, y, 1, Math.cos(k * 6.2) * 0.6]; };
beat(89.1, 'grid', (g) => {
  g.el('', MAPG(12, 7, 66), 89.2, 0, 70, { from: [0, 160], upd: mapUpd(12, 7, 66, wp, 2.2) });
  g.cap('НЕ ВСЯ КАРТА', 96, 89.5, 0, -400, { cps: 20, until: 96.5 });
  g.cap('ВОКРУГ ВАС', 96, 96.69, 0, -400, { cps: 20, until: 104.5 });
  g.cap('ПРОЙДЕННОЕ — ВОН', 80, 105.22, 0, -400, { cps: 22 });
  g.emo('🧱', 110, 99.63, -640, 280, {}); g.emo('🗑️', 110, 105.4, 640, 300, {});
}, { z: 0.9 });

// 11 · зачем? почему не загрузить целиком?
beat(112.53, 'grid', (g) => {
  g.cap('ЗАЧЕМ?', 160, 112.6, 0, -330, { cps: 10, until: 117.9 });
  g.el('', MAPG(12, 7, 66).replace(/#e4e6ea/g, '#7fe39a'), 115.2, 0, 70, { from: [0, 160], upd: (t, d) => { d.style.filter = t > 117.0 ? 'none' : 'none'; } });
  g.el('width:260px;height:260px', XMARK(420), 116.93, 0, 70, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(116.93) });
  g.cap('ЦЕЛИКОМ — НЕЛЬЗЯ', 84, 118.2, 0, -330, { cps: 22 });
}, { z: 0.92 });

// 12 · Cell: босс PPE и рабочие SPU
beat(121.65, 'grid', (g) => {
  g.el('width:300px;height:300px', CELLCHIP, 121.7, -620, -120, { from: [0, 160], r: -4 });
  g.cap('CELL', 120, 124.05, -620, -380, { cps: 10, until: 125.7 });
  g.emo('👔', 220, 125.73, -250, -120, {});
  g.cap('PPE — БОСС', 72, 128.13, -250, 130, { cps: 22 });
  g.el('', SPUS(6), 131.09, 330, -120, { from: [200, 0], upd: spuUpd((t, i) => [t > 133.1 ? (fr(t * 2 + i * 0.3) < 0.5 ? '#ffb000' : '#7fe39a') : '#c9ccd2', 1, 'SPU']) });
  g.cap('SPU — РАБОЧИЕ', 72, 131.5, 330, 100, { cps: 22 });
  g.el('width:220px;height:120px', CHEV(1), 129.4, 40, -120, { shadow: false, upd: chevUpd, s: 0.8 });
  g.emo('🚗', 130, 133.09, -620, 250, {}); g.emo('🎞️', 110, 136.29, 40, 300, {}); g.emo('🔊', 110, 137.0, 260, 300, {});
}, { z: 0.9, keys: [[130.0, 0.9, 40, 60, 0.92]] });

// 13 · результаты → RSX → пиксели
beat(139.07, 'grid', (g) => {
  g.el('', SPUS(6), 139.1, -520, -40, { from: [-200, 0], s: 0.7 });
  g.el('width:220px;height:120px', CHEV(1), 140.6, -50, -40, { shadow: false, upd: chevUpd });
  g.el('width:300px;height:300px', CHIP('RSX', 'видеочип'), 141.58, 250, -40, { from: [200, 0], r: 3 });
  g.el('width:220px;height:120px', CHEV(1), 144.6, 560, -40, { shadow: false, upd: chevUpd, s: 0.8 });
  g.emo('🖥️', 220, 145.31, 760, -40, {});
  g.cap('RSX', 120, 143.55, 250, -300, { cps: 8, until: 145.2 });
  g.cap('ПИКСЕЛИ', 120, 147.39, 400, -300, { cps: 12 });
}, { z: 0.88 });

// 14 · подвох: быстрые, но капризные, 256 КБ
beat(148.99, 'dark:' + A('industrial_dusk.jpg'), (g) => {
  g.cap('ПОДВОХ', 140, 149.05, 0, -400, { cps: 10, until: 154.0 });
  g.el('', SPUS(1), 150.67, -480, 20, { from: [-200, 0], s: 2.6, upd: spuUpd(() => ['#ffb000', 1, 'SPU']) });
  g.emo('⚡', 160, 150.9, -150, -160, {}); g.emo('😤', 170, 153.39, -150, 140, {});
  g.el('', BIGNUM('256 КБ', 'своё рабочее место'), 154.51, 330, 40, { from: [160, 100], r: 3 });
  g.cap('БЫСТРЫЕ, НО КАПРИЗНЫЕ', 76, 153.6, 0, -400, { cps: 24 });
}, { z: 0.95 });

// 15 · босс отправляет точные данные; ошибся — простой
beat(159.95, 'grid', (g) => {
  g.emo('👔', 200, 160.0, -560, -80, {});
  g.el('width:220px;height:120px', CHEV(1), 162.19, -280, -80, { shadow: false, upd: chevUpd });
  g.el('', SPUS(1), 163.0, 40, -80, { from: [0, 160], s: 1.9, upd: spuUpd((t) => [t > 166.6 ? '#ff6a6a' : '#7fe39a', 1, t > 166.6 ? 'ЖДЁТ' : 'SPU']) });
  g.cap('ТОЧНЫЕ ДАННЫЕ', 88, 160.4, -100, -360, { cps: 22, until: 166.5 });
  g.emo('⏳', 190, 169.07, 460, -80, {});
  g.cap('ПРОСТОЙ', 120, 166.59, 120, -360, { cps: 12 });
}, { z: 0.95 });

// 16 · из восьми доступны шесть
beat(173.23, 'grid', (g) => {
  g.el('', SPUS(8), 173.3, 0, 20, { from: [0, 160], s: 1.5, upd: spuUpd((t, i) => i === 6 ? [t > 178.83 ? '#c9ccd2' : '#7fe39a', t > 178.83 ? 0.7 : 1, t > 178.83 ? '✖' : 'SPU'] : i === 7 ? [t > 181.19 ? '#ffb000' : '#7fe39a', 1, t > 181.19 ? '🔒' : 'SPU'] : ['#7fe39a', 1, 'SPU']) });
  g.cap('8 → 6', 160, 173.5, 0, -350, { cps: 6, until: 183.0 });
  g.cap('БРАК', 80, 178.83, 220, 250, { cps: 14, col: RED });
  g.cap('СИСТЕМА', 80, 181.19, 600, 250, { cps: 14, col: '#ff8a00' });
}, { z: 0.85 });

// 17 · данные порциями заранее — конвейер
beat(183.15, 'grid', (g) => {
  g.cap('ЗАРАНЕЕ', 130, 183.2, 0, -380, { cps: 12 });
  g.el('', `<div class="cv2" style="position:relative;width:1100px;height:160px;border-radius:30px;background:#fff;overflow:hidden">${Array.from({ length: 7 }, () => '<div class="ck" style="position:absolute;top:44px;width:72px;height:72px;border-radius:14px;background:#4aa8ff"></div>').join('')}<div style="position:absolute;right:0;top:0;bottom:0;width:150px;background:#7fe39a;display:flex;align-items:center;justify-content:center;font-family:Osw;font-weight:700;font-size:48px;color:#2a2a2c">SPU</div></div>`, 183.5, 0, 40, { from: [0, 160], upd: (t, d) => d.querySelectorAll('.ck').forEach((c, i) => { const u = fr((t - 183.5) * 0.35 + i / 7); c.style.left = `${u * 950}px`; }) });
  g.emo('📦', 130, 187.0, -600, 220, {});
  g.cap('ПОРЦИЯМИ', 90, 185.47, 0, 300, { cps: 18 });
}, { z: 0.95 });

// 18 · RSX от GeForce 7800; своя память; перекладывать дорого
beat(191.95, 'grid', (g) => {
  g.el('width:300px;height:300px', CHIP('RSX', 'GeForce 7800'), 192.0, 380, -20, { from: [160, 100], r: 3 });
  g.prop('/gta4_ps3/assets/ram.png', 220, 197.87, 380, 270, { r: -4 });
  g.cap('ВИДЕОПАМЯТЬ', 56, 198.2, 380, 410, { cps: 24 });
  g.el('width:300px;height:300px', CELLCHIP, 194.0, -460, -20, { from: [-200, 100], r: -4, s: 0.9 });
  g.prop('/gta4_ps3/assets/ram.png', 220, 199.0, -460, 270, { r: 4 });
  g.cap('ПАМЯТЬ ЦП', 56, 199.3, -460, 410, { cps: 24 });
  g.el('width:220px;height:120px', CHEV(1), 201.7, -40, 130, { shadow: false, upd: chevUpd });
  g.emo('💸', 170, 202.5, -40, -100, {});
  g.cap('ДОРОГО', 110, 204.43, -40, -330, { cps: 14 });
}, { z: 0.88 });

// 19 · лишний раз ничего не перекладывать
beat(205.27, 'grid', (g) => {
  g.emo('🚫', 260, 205.3, -300, 0, {});
  g.emo('🔄', 200, 205.5, -300, 0, { z: 3 });
  g.cap('НЕ ПЕРЕКЛАДЫВАТЬ', 92, 205.9, 0, -380, { cps: 22 });
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 300, 206.4, 340, 40, { from: [200, 0] });
}, { z: 0.95 });

// 20 · Blu-ray: 9 МБ/с
beat(208.29, 'dark:' + A('industrial_dusk.jpg'), (g) => {
  g.el('width:440px;height:440px', DISC, 208.4, -340, 20, { upd: (t, d) => (d.querySelector('.dk').style.transform = `rotate(${((t - 208) * 200) % 360}deg)`) });
  g.cap('BLU-RAY', 130, 208.5, -340, -330, { cps: 12 });
  g.el('', BIGNUM('9 МБ/с', 'скорость чтения', '#ff8a00'), 210.85, 360, 20, { from: [200, 0], r: 3 });
  g.emo('🐢', 190, 214.13, 360, -240, {});
}, { z: 0.95 });

// 21 · сложности для открытого мира
beat(217.33, 'grid', (g) => {
  g.card({ w: 900, h: 506, clip: 'mountain_view', n: N.mountain_view, off: 8.0, speed: 0.6 }, 217.4, 0, 30, { from: [0, 160] });
  g.cap('ТРУДНО', 130, 217.6, -400, -370, { cps: 12 });
  g.emo('🌍', 150, 220.13, 600, -280, {});
}, { z: 0.95 });

// 22 · делим работу: HDD и диск
beat(223.41, 'grid', (g) => {
  g.prop('hdd.png', 440, 223.5, -480, 20, { from: [-200, 100], r: -4 });
  g.cap('ЖЁСТКИЙ ДИСК', 64, 227.25, -480, -330, { cps: 22 });
  g.cap('МОДЕЛИ · ТЕКСТУРЫ', 56, 229.89, -480, 300, { cps: 24 });
  g.el('width:440px;height:440px', DISC, 227.4, 480, 20, { s: 0.85, upd: (t, d) => (d.querySelector('.dk').style.transform = `rotate(${((t - 227) * 150) % 360}deg)`) });
  g.cap('BLU-RAY', 64, 234.0, 480, -330, { cps: 22 });
  g.cap('ЗВУКИ · АНИМАЦИИ', 56, 235.37, 480, 300, { cps: 24 });
  g.el('width:220px;height:120px', CHEV(1), 231.6, 0, 20, { shadow: false, upd: chevUpd, s: 0.8 });
}, { z: 0.9 });

// 23 · как вода из двух кранов
beat(238.05, 'grid', (g) => {
  g.el('width:460px;height:360px', bucketTaps, 238.1, 0, 40, { from: [0, 160], s: 1.6, upd: bucketUpd(238.1) });
  g.cap('ДВА КРАНА', 130, 238.4, 0, -380, { cps: 12 });
  g.emo('🪣', 110, 239.5, -620, 280, {});
}, { z: 0.95 });

// 24 · обязательная установка ~8 ГБ
beat(243.09, 'grid', (g) => {
  g.el('width:440px;height:440px', DISC, 243.2, -520, 20, { s: 0.8, upd: (t, d) => (d.querySelector('.dk').style.transform = `rotate(${((t - 243) * 160) % 360}deg)`) });
  g.el('width:220px;height:120px', CHEV(1), 247.0, -140, 20, { shadow: false, upd: chevUpd });
  g.prop('hdd.png', 400, 245.17, 330, 20, { from: [200, 0], r: 4 });
  g.el('', BIGNUM('8 ГБ', 'установка', '#ff8a00'), 246.5, 330, -330, { from: [0, -100] });
  g.cap('УСТАНОВКА', 100, 243.4, -320, -370, { cps: 18 });
}, { z: 0.92 });

// 25 · коробки памяти
beat(254.29, 'grid', (g) => {
  g.cap('КОРОБКИ', 140, 254.4, 0, -400, { cps: 12, until: 260.4 });
  g.cap('ПАМЯТЬ ПО ОБЛАСТЯМ', 84, 260.53, 0, -400, { cps: 22 });
  [['🚗', 'МАШИНЫ', 263.65, -460], ['🧍', 'ЛЮДИ', 266.05, 0], ['🏢', 'ЗДАНИЯ', 268.85, 460]].forEach(([e, n, at, x], i) => g.el('', `<div style="width:340px;height:340px;border-radius:30px;background:#fff;border:8px solid #c9ccd2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px"><div class="emo" style="font-size:150px">${e}</div><div style="font-family:Osw;font-weight:700;font-size:54px;color:${INK}">${n}</div></div>`, at, x, 50, {
    from: [0, 200], r: (i - 1) * 3, upd: i === 2 ? (t, d) => { const k = P(t, 272.21, 0.9); d.style.translate = `${(k * 560).toFixed(1)}px ${(-Math.sin(k * Math.PI) * 220 + k * k * 700).toFixed(1)}px`; d.style.rotate = `${(k * 40).toFixed(1)}deg`; d.style.opacity = 1 - P(t, 272.9, 0.4); } : undefined }));
  g.cap('НЕТ ЗДАНИЙ → ВЫБРОСИТЬ', 76, 270.05, 0, 420, { cps: 26 });
}, { z: 0.88 });

// 26 · уровни детализации
beat(275.16, 'grid', (g) => {
  g.cap('ДЕТАЛИЗАЦИЯ', 120, 275.3, 0, -400, { cps: 14 });
  g.card({ w: 960, h: 540, src: 'industrial_dusk.jpg' }, 278.0, 0, 30, { from: [0, 160], upd: (t, c, im) => { const k = E.inOut(P(t, 280.5, 5.5)); im.style.filter = `blur(${(14 * (1 - k)).toFixed(1)}px)`; im.style.transform = `scale(${(1 + 0.25 * k).toFixed(3)})`; } });
  g.emo('🏠', 140, 278.92, -640, -100, { z: 5 });
  g.emo('⬆️', 140, 282.6, 640, 40, {});
  g.cap('ДАЛЕКО — ПРОСТО', 64, 279.2, -150, 380, { cps: 24, until: 284.6 });
  g.cap('БЛИЖЕ — ПОДРОБНЕЕ', 64, 284.88, -150, 380, { cps: 24 });
}, { z: 0.92 });

// 27 · хитрые системы работали отлично
beat(293.08, 'grid', (g) => {
  g.emo('✅', 230, 293.2, -300, 0, {});
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 300, 293.5, 300, 40, { from: [200, 0] });
}, { z: 0.95 });

// 28 · переключение персонажей
beat(296.44, 'light:' + A('los_santos_haze.jpg'), (g) => {
  SWITCHCARD(g, 296.5, 0, 40, 14.0, 0.5, 1000, { z: 3 });
  g.prop('franklin.png', 760, 297.0, -760, 150, { from: [-220, 0], z: 1 });
  g.prop('michael.png', 720, 297.2, 780, 150, { from: [220, 0], z: 1 });
  g.emo('🔄', 170, 299.16, 760, -380, { z: 8 });
  g.cap('СМЕНА ГЕРОЕВ', 96, 299.5, 0, -400, { cps: 20, until: 304.5 });
  g.cap('ДАЖЕ ЕСЛИ ДАЛЕКО', 80, 304.68, 0, -400, { cps: 22 });
}, { z: 0.9 });

// 29 · камера взлетает и опускается
beat(304.68, 'dark:' + FR('switch', 19.0), (g) => {
  SWITCHCARD(g, 304.7, 0, 20, 18.0, 0.55, 1040);
  g.emo('☁️', 170, 305.5, -620, -250, {});
  g.cap('ВЗЛЁТ', 130, 305.0, 0, -420, { cps: 12, until: 309.9 });
  g.cap('ПОСАДКА', 130, 309.96 - 0.4, 0, -420, { cps: 12 });
}, { z: 0.9 });

// 30 · но на PS3 крайне сложно
beat(309.96, 'dark:' + FR('switch', 25.0), (g) => {
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 300, 310.0, -480, 40, { from: [-200, 0] });
  g.emo('😰', 220, 311.5, -480, -250, {});
  g.cap('НА PS3 — СЛОЖНО', 90, 310.4, 220, -300, { cps: 22 });
  g.emo('⏱️', 190, 313.4, 480, 20, {});
  g.cap('СЧИТАННЫЕ СЕКУНДЫ', 76, 313.9, 330, 270, { cps: 22 });
}, { z: 0.92 });

// 31 · упаковать всё из текущей области
beat(317.4, 'grid', (g) => {
  g.cap('ВЫГРУЗКА', 130, 317.5, 0, -400, { cps: 12 });
  [['🚗', 317.6], ['🧍', 319.7], ['🔊', 321.0], ['🏢', 323.08]].forEach(([e, at], i) => g.emo(e, 150, at, -560 + i * 260, 40, { upd: (t, d) => { const k = P(t, 324.6 + i * 0.3, 0.9); d.style.translate = `${(k * 700).toFixed(1)}px ${(-k * 120).toFixed(1)}px`; d.style.opacity = 1 - P(t, 325.3 + i * 0.3, 0.4); } }));
  g.emo('🗑️', 200, 325.0, 640, 250, {});
  g.cap('ОСВОБОДИТЬ МЕСТО', 76, 325.72, 0, 330, { cps: 24 });
}, { z: 0.9 });

// 32 · загрузить новую область
beat(327.4, 'grid', (g) => {
  g.cap('ЗАГРУЗКА', 130, 327.5, 0, -400, { cps: 12, until: 332.0 });
  ['🛣️', '🚗', '🧍', '🔊'].forEach((e, i) => g.emo(e, 150, 330.08 + i * 0.9, -560 + i * 260, 40, { from: [700, -150] }));
  g.emo('📍', 200, 327.7, -640, -240, {});
  g.cap('ДРУГОЙ ГЕРОЙ', 96, 332.1, 0, -400, { cps: 22 });
}, { z: 0.9 });

// 33 · данные персонажей: одежда, позиция, занятие
beat(336.52, 'light:' + A('los_santos_haze.jpg'), (g) => {
  g.prop('franklin.png', 880, 336.6, -300, 160, { from: [-240, 0] });
  g.emo('👕', 160, 339.28, 420, -200, {});
  g.cap('ОДЕЖДА', 84, 339.3, 420, -60, { cps: 16, until: 342.6 });
  g.emo('📍', 160, 340.0, 420, 100, {});
  g.cap('ГДЕ СТОИТ', 84, 340.2, 420, 230, { cps: 16 });
  g.emo('🎯', 160, 341.2, 700, 100, {});
}, { z: 0.92 });

// 34 · мир должен оставаться последовательным
beat(342.66, 'light:' + A('industrial_dusk.jpg'), (g) => {
  g.prop('trevor.png', 920, 342.7, 380, 150, { from: [240, 0] });
  g.emo('💥', 220, 346.0, -480, 0, {});
  g.cap('ХАОС', 130, 347.26, -480, -280, { cps: 10, until: 349.4 });
  g.emo('🧠', 200, 349.54, -480, 20, { z: 7 });
  g.cap('ИГРА ПОМНИТ', 92, 349.7, -330, 270, { cps: 20 });
}, { z: 0.92 });

// 35 · всё за несколько секунд, пока камера летит
beat(352.82, 'dark:' + FR('switch', 24.0), (g) => {
  SWITCHCARD(g, 352.9, 0, 30, 24.0, 0.7, 1000);
  g.el('', `<div style="width:420px;padding:20px 30px;border-radius:26px;background:#111;color:#3cff62;font-family:Osw;font-weight:700;font-size:64px;text-align:center" class="tm">0.0 с</div>`, 353.2, -560, -300, { upd: (t, d) => { d.firstChild.textContent = (Math.min(P(t, 352.9, 3.8), 1) * 3.8).toFixed(1) + ' с'; } });
  g.cap('ПОКА КАМЕРА ЛЕТИТ', 92, 355.27, 0, -420, { cps: 22 });
}, { z: 0.92 });

// 36 · скрывает экран загрузки
beat(357.14, 'dark:' + FR('switch', 38.0), (g) => {
  g.el('', LOADING, 357.2, -420, 40, { from: [0, 160], s: 0.95, upd: (t, d) => (d.querySelector('.lb').style.width = '58%') });
  g.el('width:260px;height:260px', XMARK(300), 359.86, -420, 40, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(359.86) });
  g.cap('СКРЫВАЕТ ЗАГРУЗКУ', 84, 357.4, 0, -400, { cps: 22 });
  SWITCHCARD(g, 360.3, 430, 140, 38.0, 0.6, 700, { r: 3, ry0: -40, ry: -8 });
  g.emo('✅', 160, 369.91, 640, -230, {});
  g.cap('ВСЁ ГОТОВО К ПОСАДКЕ', 66, 369.91, 330, 380, { cps: 24 });
}, { z: 0.92 });

// 37 · Лос-Сантос: трафик, люди, разговоры, жизнь в океане
beat(373.06, 'grid', (g) => {
  g.card({ w: 860, h: 484, clip: 'city_traffic', n: N.city_traffic, off: 5.0 }, 373.1, -300, 20, { from: [-240, 60], r: -2 });
  g.cap('ЛОС-САНТОС', 100, 373.2, -300, -370, { cps: 18 });
  [['🚗', 375.54, 480, -250], ['🚶', 376.2, 640, -60], ['💬', 377.6, 760, -250], ['🐠', 379.5, 560, 190]].forEach(([e, at, x, y]) => g.emo(e, 130, at, x, y, {}));
}, { z: 0.92 });

// 38 · повторное использование моделей
beat(381.86, 'grid', (g) => {
  g.cap('ОДНИ И ТЕ ЖЕ МОДЕЛИ', 80, 382.0, 0, -400, { cps: 22 });
  for (let i = 0; i < 8; i++) g.emo('🧍', 130, 384.01 + i * 0.12, -560 + i * 160, 60, { float: 0 });
  g.cap('× ∞', 150, 385.2, 0, 280, { cps: 6 });
}, { z: 0.9 });

// 39 · визуальные трюки: дымка, свет, горизонт
beat(386.18, 'grid', (g) => {
  g.card({ w: 1000, h: 563, src: 'los_santos_haze.jpg' }, 386.2, 0, 30, { from: [0, 160], upd: (t, c, im) => { const k = P(t, 387.0, 5); im.style.filter = `contrast(${(1 + 0.2 * k).toFixed(2)}) saturate(${(1 - 0.2 * k).toFixed(2)})`; } });
  g.cap('ДЫМКА', 120, 386.4, -540, -370, { cps: 12, until: 392.0 });
  g.cap('ГОРИЗОНТ', 120, 392.06, -540, -370, { cps: 12 });
  g.emo('🌫️', 160, 388.57, 660, -250, {}); g.emo('🎭', 150, 394.61, 660, -250, {});
  g.cap('СКРЫТЬ ПРЕДЕЛЫ', 66, 394.61, 0, 380, { cps: 24 });
}, { z: 0.92 });

// 40 · сутки 48 минут
beat(397.05, 'grid', (g) => {
  g.card({ w: 640, h: 360, clip: 'gas_station', n: N.gas_station, off: 5.0 }, 397.1, -560, 20, { from: [-200, 100], r: -3, z: 2 });
  g.card({ w: 640, h: 360, clip: 'night_street', n: N.night_street, off: 4.0 }, 398.2, 220, 150, { from: [200, 100], r: 3, z: 3 });
  g.el('', `<div style="width:340px;height:340px;border-radius:50%;background:#fff;position:relative"><svg width="340" height="340" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#e4e6ea" stroke-width="3"/>${Array.from({ length: 24 }, (_, i) => `<line x1="50" y1="6" x2="50" y2="${i % 6 ? 9 : 12}" stroke="#2a2a2c" stroke-width="${i % 6 ? 0.8 : 1.6}" transform="rotate(${i * 15} 50 50)"/>`).join('')}<line class="hd" x1="50" y1="50" x2="50" y2="22" stroke="#2a2a2c" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="50" r="3.4" fill="#2a2a2c"/></svg></div>`, 399.29, 640, -180, { upd: (t, d) => d.querySelector('.hd').setAttribute('transform', `rotate(${((t - 399.29) * 360 / 120 * 6) % 360} 50 50)`) });
  g.cap('48 МИН = СУТКИ', 90, 399.29, -150, -400, { cps: 22 });
  g.cap('2 МИН = 1 ЧАС', 90, 401.77, -150, 420, { cps: 22, until: 405.9 });
  g.emo('🌅', 130, 406.63, 560, 190, {}); g.emo('💡', 120, 408.4, 700, 60, {}); g.emo('🚗', 120, 409.59, 430, 330, {});
  g.emo('🐟', 110, 412.63, -640, 330, {}); g.emo('🦈', 130, 413.5, -480, 330, {}); g.emo('🐬', 120, 414.4, -320, 330, {});
}, { z: 0.85 });

// 41 · все расчёты на 256 МБ
beat(416.31, 'dark:' + A('car_collection.jpg'), (g) => {
  g.prop('/gta4_ps3/assets/ram.png', 340, 416.4, -300, 40, { from: [-200, 100], r: -5 });
  g.cap('256 МБ', 170, 417.6, 330, -50, { cps: 8 });
  g.cap('НА ВСЁ', 100, 419.0, 330, 130, { cps: 12 });
}, { z: 0.95 });

// 42 · предсказание: игра угадывает, куда вы едете
const pp = (t) => { const k = clamp((t - 429) / 20); const turn = t > 442.47; const x = turn ? lerp(7.2, 7.2, 0) + (t - 442.47) * 0.0 : lerp(1.0, 7.2, clamp((t - 429) / 13.4)); const y = turn ? lerp(3.5, 6.0, clamp((t - 442.47) / 4)) : 3.5; return [x, y, turn ? 0 : 1, turn ? 1 : 0]; };
beat(420.55, 'grid', (g) => {
  g.cap('ПРЕДСКАЗАНИЕ', 110, 420.7, 0, -410, { cps: 14, until: 429.0 });
  g.card({ w: 760, h: 428, clip: 'city_traffic', n: N.city_traffic, off: 0.5, speed: 0.8 }, 424.0, 560, 40, { from: [240, 60], r: 3, z: 2 });
  g.emo('🔮', 190, 421.5, -640, -250, {});
  g.el('', MAPG(10, 7, 62), 429.51, -320, 70, { from: [0, 160], upd: mapUpd(10, 7, 62, pp, 1.9, true) });
  g.cap('УГАДЫВАЕТ КУДА', 84, 429.8, 0, -410, { cps: 22, until: 442.0 });
  g.cap('ПОВОРОТ → ПЕРЕСТРОИЛАСЬ', 76, 442.47, 0, -410, { cps: 24 });
}, { z: 0.88 });

// 43 · HDD и Blu-ray медленные — быть на шаг впереди
beat(450.87, 'grid', (g) => {
  g.prop('hdd.png', 360, 450.9, -520, 20, { from: [-200, 100], r: -4 });
  g.el('width:440px;height:440px', DISC, 451.4, 0, 20, { s: 0.7, upd: (t, d) => (d.querySelector('.dk').style.transform = `rotate(${((t - 451) * 90) % 360}deg)`) });
  g.emo('🐢', 170, 453.31, 520, 20, {});
  g.cap('МЕДЛЕННЫЕ', 100, 453.4, 0, -380, { cps: 14, until: 459.0 });
  g.emo('🏃', 200, 459.58, 520, 250, {});
  g.cap('НА ШАГ ВПЕРЕДИ', 96, 459.58, 0, -380, { cps: 18 });
}, { z: 0.92 });

// 45 · Cell обновляет список — плавность мира
beat(462.14, 'dark:' + A('industrial_dusk.jpg'), (g) => {
  g.el('width:300px;height:300px', CELLCHIP, 462.2, -420, 20, { from: [-200, 100], r: -4 });
  g.el('', `<div style="padding:26px 40px;border-radius:30px;background:#fff;font-family:Osw;font-weight:700;font-size:50px;color:${INK};line-height:1.7;white-space:nowrap"><div>☐ УЛИЦА ВПЕРЕДИ</div><div>☐ ТЕКСТУРЫ</div><div>☐ ЗВУКИ</div></div>`, 464.31, 330, 20, { from: [200, 0], upd: (t, d) => { const rows = d.firstChild.children; [467.0, 468.2, 469.4].forEach((a, i) => { rows[i].textContent = (t > a ? '☑ ' : '☐ ') + rows[i].textContent.slice(2); }); } });
  g.cap('СПИСОК ГОТОВНОСТИ', 84, 466.62, 0, -400, { cps: 22, until: 470.0 });
  g.cap('ПЛАВНЫЙ МИР', 110, 470.61, 0, -400, { cps: 14 });
}, { z: 0.95 });

// 46 · но за это заплатили: 720p, 30 fps
beat(479.57, 'grid', (g) => {
  g.cap('ЦЕНА', 140, 479.6, 0, -410, { cps: 10, until: 482.0 });
  g.card({ w: 860, h: 484, clip: 'beach_quad', n: N.beach_quad, off: 6.0, speed: 0.7 }, 480.6, -330, 40, { from: [-240, 60], r: -2, upd: (t, c, im) => { const k = P(t, 491.89, 1.5); im.style.filter = `blur(${(3 * k).toFixed(1)}px)`; } });
  g.el('', PLATE('720P'), 482.21, 440, -180, { r: -3 });
  g.el('', BIGNUM('30', 'кадров в секунду'), 484.8, 520, 90, { from: [200, 100], r: 3, upd: (t, d) => { const v = t > 486.8 ? 30 - Math.round(Math.abs(Math.sin(t * 6)) * 9) : 30; const nn = d.firstChild.firstChild; nn.textContent = v; nn.style.color = v < 25 ? RED : INK; } });
  g.cap('ПРОСЕДАНИЯ', 84, 488.93, 330, 340, { cps: 16 });
  g.emo('📉', 150, 487.5, 690, -250, {});
  g.cap('ПРОЩЕ ТЕНИ', 84, 491.89, -330, -420, { cps: 18 });
}, { z: 0.9 });

// 47 · зато работает
beat(495.17, 'grid', (g) => {
  g.emo('✅', 260, 495.2, -300, 0, {});
  g.cap('ЗАТО РАБОТАЕТ', 110, 495.4, 280, 0, { cps: 18 });
}, { z: 0.95 });

// 48 · GTA 5 — одна из самых популярных
beat(497.89, 'dark:' + A('industrial_dusk.jpg'), (g) => {
  g.prop('gta5_box.png', 640, 498.0, -420, 40, { from: [-200, 100], r: -4 });
  g.prop('gta5_logo.png', 420, 499.8, 330, -60, { from: [200, 0], r: 3 });
  ['⭐', '⭐', '⭐', '⭐', '⭐'].forEach((e, i) => g.emo(e, 100, 501.0 + i * 0.2, 130 + i * 120, 200, {}));
  g.cap('ПОПУЛЯРНАЯ', 100, 500.69, 330, 330, { cps: 14 });
}, { z: 0.95 });

// 49 · PS3 и Xbox 360 — пик игры
beat(511.17, 'grid', (g) => {
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 360, 511.2, -430, 80, { from: [-200, 0] });
  g.prop('/gta4_ps3/assets/x360.png', 500, 513.97 - 1.2, 430, 50, { from: [200, 0] });
  g.emo('👥', 200, 515.33, 0, -250, {});
  g.cap('МИЛЛИОНЫ ИГРОКОВ', 84, 515.9, 0, -420, { cps: 20 });
}, { z: 0.92 });

// 50 · продолжала расти
beat(519.65, 'grid', (g) => {
  g.el('', `<svg width="880" height="420" style="background:#fff;border-radius:30px"><path class="ln" d="M60 340 C 220 330, 340 280, 460 210 S 720 90, 820 60" fill="none" stroke="#2e9e57" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`, 519.7, 0, 30, { from: [0, 160], upd: (t, d) => { d.querySelector('.ln').style.strokeDashoffset = 1 - E.inOut(P(t, 521.0, 4)); } });
  g.cap('ПРОДОЛЖАЛА РАСТИ', 90, 524.29 - 3.7, 0, -380, { cps: 20 });
  g.emo('📈', 170, 524.29, 520, -160, {});
}, { z: 0.95 });

// 51 · следующие консоли: PS4/Xbox One 2014, ПК 2015, PS5/XSX 2022
beat(526.69, 'grid', (g) => {
  g.cap('2014', 120, 526.8, -500, -360, { cps: 8 });
  g.prop('ps4.png', 250, 528.3, -600, 40, { from: [-200, 0] }); g.prop('xone.png', 260, 529.9, -380, 190, { from: [-200, 0] });
  g.cap('2015', 120, 532.3, 20, -360, { cps: 8 });
  g.emo('💻', 250, 532.9, 20, 40, {});
  g.cap('2022', 120, 535.0, 520, -360, { cps: 8 });
  g.prop('ps5.png', 400, 535.86, 560, 60, { from: [200, 0] }); g.prop('xseries.png', 380, 537.2, 280, 140, { from: [200, 0] });
}, { z: 0.9 });

// 52 · пережила эпохи
beat(542.27, 'grid', (g) => {
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 200, 542.4, -640, 100, { from: [0, 160] });
  g.prop('ps4.png', 200, 543.2, -320, 100, { from: [0, 160] });
  g.prop('ps5.png', 330, 544.0, 20, 40, { from: [0, 160] });
  g.prop('/gta4_ps3/assets/x360.png', 290, 545.0, 340, 50, { from: [0, 160] });
  g.prop('xseries.png', 310, 546.0, 650, 40, { from: [0, 160] });
  g.cap('НЕСКОЛЬКО ЭПОХ', 96, 542.6, 0, -400, { cps: 18 });
}, { z: 0.85 });

// 53 · 200 млн копий
beat(549.96, 'dark:' + A('car_collection.jpg'), (g) => {
  g.prop('gta5_box.png', 560, 550.0, -380, 40, { from: [-200, 100], r: -4 });
  g.el('', BIGNUM('200 МЛН', 'проданных копий', '#2e9e57'), 551.0, 360, 20, { from: [200, 100], r: 3 });
  g.cap('ПО ДАННЫМ TAKE-TWO', 56, 552.0, 360, 280, { cps: 24 });
}, { z: 0.95 });

// 54 · игроки верны игре
beat(554.27, 'grid', (g) => {
  g.emo('📉', 220, 554.3, -300, 0, {}); g.el('width:260px;height:260px', XMARK(300), 556.4, -300, 0, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(556.4) });
  g.emo('❤️', 220, 559.23, 300, 0, {});
  g.cap('ИГРОКИ ВЕРНЫ', 110, 559.4, 0, -380, { cps: 16 });
}, { z: 0.95 });

// 55 · онлайн: зачем проходить заново?
beat(562.51, 'grid', (g) => {
  g.prop('gta5_logo.png', 380, 562.6, -400, -60, { from: [-200, 0], r: -3 });
  g.cap('ОНЛАЙН', 150, 562.8, 0, -420, { cps: 10, until: 564.8 });
  g.emo('❓', 200, 564.91, 330, -120, {});
  g.cap('ПРОХОДИТЬ ЗАНОВО?', 84, 565.2, 0, -420, { cps: 22 });
  g.emo('🥹', 170, 569.23, 330, 190, {});
  g.cap('НОСТАЛЬГИЯ', 84, 569.6, 600, 300, { cps: 18 });
  g.emo('😴', 170, 571.43, -620, 250, {});
}, { z: 0.9 });

// 56 · Rockstar ввела онлайн: 17 сентября → 1 октября
beat(577.47, 'grid', (g) => {
  g.el('', BIGNUM('17.09', 'выход игры'), 577.6, -520, 30, { from: [-200, 100], r: -3 });
  g.el('width:220px;height:120px', CHEV(1), 580.0, 0, 30, { shadow: false, upd: chevUpd });
  g.el('', BIGNUM('01.10', 'GTA Online', '#ff8a00'), 580.91, 520, 30, { from: [200, 100], r: 3 });
  g.cap('2 НЕДЕЛИ', 110, 585.31, 0, -380, { cps: 12 });
  g.emo('🌐', 190, 577.8, 700, -300, {});
}, { z: 0.92 });

// 57 · цифровой мир, свои миссии
beat(588.67, 'grid', (g) => {
  g.card({ w: 800, h: 450, clip: 'online_bike', n: N.online_bike, off: 0.3 }, 588.7, -300, -40, { from: [-240, 60], r: -3 });
  g.card({ w: 620, h: 349, clip: 'online_deadline', n: N.online_deadline, off: 1.0 }, 592.0, 480, 150, { from: [240, 60], r: 3, z: 2 });
  g.cap('СВОЙ МИР', 110, 589.0, -300, -370, { cps: 14, until: 595.2 });
  g.cap('СВОИ МИССИИ', 110, 595.23, -300, -370, { cps: 14 });
  g.emo('🛠️', 150, 597.07, 690, -200, {});
}, { z: 0.92 });

// 58 · коллекция машин и хаос с друзьями
beat(599.47, 'grid', (g) => {
  g.card({ w: 860, h: 484, src: 'car_collection.jpg' }, 599.5, -340, 30, { from: [-240, 60], r: -2 });
  g.cap('КОЛЛЕКЦИЯ МАШИН', 76, 600.0, -340, -370, { cps: 22 });
  g.card({ w: 620, h: 349, clip: 'online_sumo', n: N.online_sumo, off: 0.0 }, 603.87, 520, 130, { from: [240, 60], r: 3, z: 2 });
  g.emo('💥', 190, 604.4, 650, -200, {});
  g.cap('ХАОС С ДРУЗЬЯМИ', 76, 604.0, 330, 380, { cps: 22 });
}, { z: 0.92 });

// 59 · годами новые ограбления, машины, бизнесы
beat(606.14, 'dark:' + A('car_collection.jpg'), (g) => {
  [['💰', 'ОГРАБЛЕНИЯ', 608.3, -520], ['🚗', 'МАШИНЫ', 609.5, 0], ['🏢', 'БИЗНЕСЫ', 610.7, 520]].forEach(([e, n, at, x], i) => g.el('', `<div style="width:340px;height:340px;border-radius:30px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px"><div class="emo" style="font-size:150px">${e}</div><div style="font-family:Osw;font-weight:700;font-size:52px;color:${INK}">${n}</div></div>`, at, x, 40, { from: [0, 200], r: (i - 1) * 3 }));
  g.cap('ГОДАМИ НОВОЕ', 110, 606.2, 0, -400, { cps: 14, until: 611.0 });
  g.cap('ВСЕГДА ЕСТЬ ЗА ЧЕМ ГНАТЬСЯ', 76, 613.06, 0, -400, { cps: 24 });
  g.emo('🏃', 150, 613.5, -640, 300, {});
}, { z: 0.9 });

// 60 · онлайн-контент помогает игре оставаться актуальной
beat(618.78, 'grid', (g) => {
  g.prop('gta5_logo.png', 420, 618.9, -380, 20, { from: [-200, 0] });
  g.emo('🔄', 220, 619.6, 360, -40, { upd: (t, d) => (d.style.rotate = `${((t - 619) * 120) % 360}deg`) });
  g.cap('АКТУАЛЬНА', 100, 619.8, 0, -380, { cps: 16 });
}, { z: 0.95 });

// 61 · YouTube: паркур, трюки, карты
beat(621.9, 'grid', (g) => {
  g.card({ w: 760, h: 428, clip: 'online_bike', n: N.online_bike, off: 3.0 }, 622.0, -380, 20, { from: [-240, 60], r: -3 });
  g.card({ w: 600, h: 338, clip: 'online_deadline', n: N.online_deadline, off: 5.0 }, 625.0, 420, 150, { from: [240, 60], r: 3, z: 2 });
  g.el('', `<div style="width:170px;height:120px;border-radius:30px;background:#ff2d2d;display:flex;align-items:center;justify-content:center"><div style="width:0;height:0;border-left:54px solid #fff;border-top:34px solid transparent;border-bottom:34px solid transparent;margin-left:12px"></div></div>`, 623.7, 600, -270, { shadow: true });
  g.cap('ПАРКУР · ТРЮКИ · КАРТЫ', 80, 624.4, 0, -420, { cps: 24 });
  g.emo('🎥', 150, 626.8, -660, 300, {});
}, { z: 0.9 });

// 62 · вдохновляли новых игроков
beat(627.8, 'grid', (g) => {
  g.emo('👀', 220, 627.9, -300, 0, {});
  g.prop('gta5_box.png', 480, 628.5, 280, 20, { from: [200, 100], r: 4 });
  g.cap('НОВЫЕ ИГРОКИ', 100, 628.38, 0, -400, { cps: 16 });
}, { z: 0.95 });

// 63 · восхищаешься и игрой, и людьми
beat(630.62, 'light:' + A('los_santos_haze.jpg'), (g) => {
  HEROES(g, 630.7, 60, 1);
  g.prop('/gta4_ps3/assets/rockstar.png', 150, 636.0, 0, -320, { r: -6, z: 5 });
  g.emo('👏', 190, 638.3, 690, -280, { z: 8 });
  g.cap('ВОСХИЩАЕШЬСЯ', 100, 633.34, 0, -430, { cps: 16, until: 640.2 });
}, { z: 0.9 });

// 64 · финал: так GTA 5 уместили в PS3; а вы играли?
beat(640.46, 'dark:' + A('industrial_dusk.jpg'), (g) => {
  g.prop('gta5_box.png', 520, 640.6, -400, 30, { from: [-200, 100], r: -4 });
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 330, 641.0, 360, 150, { from: [200, 0] });
  g.prop('gta5_logo.png', 380, 641.4, 360, -190, { from: [200, 0], r: 3 });
  g.cap('А ВЫ ИГРАЛИ?', 110, 643.34, 0, -430, { cps: 18, until: 646.8 });
  g.cap('ПИШИТЕ В КОММЕНТАРИЯХ', 70, 645.5, 0, 400, { cps: 24 });
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
window.DUR = 650;
(async () => {
  await document.fonts.load('700 60px Osw', 'НАСТОЯЩЕЕ БЕЗУМИЕ 256 МБ ?!'); await document.fonts.load('900 60px Mont', 'NAUGHTY DOG');
  await document.fonts.load('60px "Noto Color Emoji"', '☀️🌧️❄️🍂🤖💬🔊🧠🖼️🌍⚠️🤲🤷👉👈🔍✊💦🎬🎭🖐️👀😵🏁💥⚙️🌿🔧🗑️⚡⏱️🥊🐢🔥📦📄🐺🎯😴⚔️📍⬅️➡️🧍‍♂️💡🔦🥵✅🦠🎨💧🏃👁️📐🧱😡😐👻');
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  window.__ready = true;
})();
