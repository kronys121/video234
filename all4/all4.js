// Все 4 игры на PS3 — динамичный коллаж в стиле MKTS: короткие сцены, смена фонов
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
const FR = (clip, sec) => `/${clip}/${String(Math.max(1, Math.round(sec * 30))).padStart(4, '0')}.jpg`;
const INK = '#2a2a2c', RED = '#e3262b';

const world = document.getElementById('world'), bgs = document.getElementById('bgs');
function ab(parent, css, html = '') { const d = document.createElement('div'); d.className = 'o'; d.style.cssText = css; d.innerHTML = html; parent.appendChild(d); return d; }
function place(el, { x = 0, y = 0, s = 1, r = 0, o = 1, rx = 0, ry = 0 }) {
  el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) perspective(1600px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  el.style.opacity = o;
}
// появление: влёт с перелётом; t1 — уход (вверх и в прозрачность)
function popIn(el, t, t0, x, y, o = {}) {
  const { s = 1, r = 0, dur = 0.42, from = [0, 180], r0 = 0, rx = 0, ry = 0, ry0 = ry, t1 = 1e9, out = 0.35, float = 0 } = o;
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
  const b = { i, t0, cx, cy, root, items: [], layer, dark, z: cam.z ?? 1, tr: cam.tr ?? 0.5, keys: cam.keys || [], end: 0 };
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
        if (clip) { let sec = Math.max(0, t - at) * speed + off; if (fps < 30) sec = Math.floor(sec * fps) / fps; const k = Math.floor(sec * 30) % n + 1; if (k !== cur) { cur = k; im.src = `/${clip}/${String(k).padStart(4, '0')}.jpg`; pend.push(im.decode().catch(() => {})); } }
        if (o.upd) o.upd(t, c, im);
      });
      return c;
    },
    // подпись: буквы печатаются; fly — буквы слетаются по кругу; уходит разлетаясь
    cap(text, size, at, x, y, o = {}) {
      const d = ab(b.root, `font-size:${size}px;z-index:20;${o.css || ''}`); d.classList.add('tx');
      const L = [...text].map((ch) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; if (o.col) s.style.color = o.col; d.appendChild(s); return s; });
      const { cps = 30, r = -2, until, fly = false } = o;
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

// ---------- все 4 игры: данные ----------
const WORDS = await (await fetch('/all4/words.json')).json();
const nz = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, '');
const at = (p, after = 0, k = 0) => { p = nz(p); let n = 0; for (const x of WORDS) if (x.t >= after - 0.001 && nz(x.w).startsWith(p)) { if (n++ === k) return x.t; } (window.MISSING = window.MISSING || []).push(p + ' @' + after); return after + 0.5; };
const SHAKES = []; const shake = () => {};
// клипы: короткое имя -> [папка с кадрами, число кадров]
const CL = {
  g4crash1: ['gta4_ps3/clips/crash1', 68], g4crash2: ['gta4_ps3/clips/crash2', 143], g4rag1: ['gta4_ps3/clips/rag1', 105], g4rag2: ['gta4_ps3/clips/rag2', 69],
  g4play: ['gta4_ps3/clips/ps3_gameplay_lowres', 1008], g4fps: ['gta4_ps3/clips/ps3_fps_counter', 337], g4cmp1: ['gta4_ps3/clips/cmp_ps3_x360_park', 114], g4cmp2: ['gta4_ps3/clips/cmp_ps3_x360_street', 286], g4run: ['gta4_ps3/clips/ps3_run_big', 65],
  tlbeauty: ['gta4_ps3/tlou/clips/beauty', 1073], tlellie: ['gta4_ps3/tlou/clips/ellie_invisible', 710], tlen1: ['gta4_ps3/tlou/clips/enemies1', 543], tlen2: ['gta4_ps3/tlou/clips/enemies2', 501], tlflash: ['gta4_ps3/tlou/clips/flashlight', 388], tltrailer: ['gta4_ps3/tlou/clips/trailer', 3199],
  g5beach: ['gta5_new/clips/beach_quad', 704], g5city: ['gta5_new/clips/city_traffic', 610], g5gas: ['gta5_new/clips/gas_station', 575], g5mount: ['gta5_new/clips/mountain_view', 648], g5night: ['gta5_new/clips/night_street', 463], g5bike: ['gta5_new/clips/online_bike', 381], g5dead: ['gta5_new/clips/online_deadline', 400], g5sumo: ['gta5_new/clips/online_sumo', 278], g5switch: ['gta5_new/clips/switch', 1349],
  ucnet: ['uncharted3/clips/net', 532], ucplane: ['uncharted3/clips/plane', 488], ucstorm1: ['uncharted3/clips/storm1', 469], ucstorm2: ['uncharted3/clips/storm2', 553], ucship1: ['uncharted3/clips/ship1', 262], ucship2: ['uncharted3/clips/ship2', 510], ucwater: ['uncharted3/clips/water', 577], ucjungle: ['uncharted3/clips/jungle', 462], ucmocap: ['uncharted3/clips/mocap', 280], uccut: ['uncharted3/clips/cut', 520],
};
const BG = (k, sec) => FR(CL[k][0], ((Math.round(sec * 30) % (CL[k][1] - 1)) + 1) / 30);
const D = (k, s) => 'dark:' + BG(k, s), Lt = (k, s) => 'light:' + BG(k, s);
const cc = (g, k, t, x, y, w, o = {}) => g.card({ w, h: Math.round(w * 9 / 16), clip: CL[k][0], n: CL[k][1], off: o.off || 0, speed: o.speed || 1, fps: o.fps || 30 }, t, x, y, { from: o.from || [0, 180], r: o.r || 0, z: o.z, t1: o.t1, upd: o.upd });
const cover = (g, src, t, x, y, w, h, o = {}) => g.card({ w, h, src }, t, x, y, { from: o.from || [0, 180], r: o.r || 0, z: o.z, t1: o.t1, upd: o.upd });
const PS3 = '/gta4_ps3/assets/ps3_fat_flat.png', RAM = '/gta4_ps3/assets/ram.png';
const AS = { g4logo: '/gta4_ps3/assets/gta4_logo.png', niko: '/gta4_ps3/assets/niko_art.jpg', uc3: '/uncharted3/assets/uc3_cover.png', tlou: '/gta4_ps3/tlou/assets/tlou_box.png', gta5: '/gta5_new/assets/gta5_box.png' };
// счётчик внутри BIGNUM
const countUp = (t0, to, suf, dur = 0.9) => (t, d) => { d.firstChild.firstChild.textContent = Math.round(to * E.outCubic(P(t, t0, dur))) + suf; };
// пульсация (сжатие) для эмодзи
const squeeze = (t0) => (t, d) => { if (t > t0) { const k = Math.abs(Math.sin((t - t0) * 9)) * Math.exp(-(t - t0) * 1.2); d.style.transform += ` scale(${(1 + k * 0.25).toFixed(3)},${(1 - k * 0.35).toFixed(3)})`; } };

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
//                    ВСЕ 4 ИГРЫ: СЦЕНАРИЙ (31:22)
// =====================================================================
const ST = await (await fetch('/all4/sent_times.json')).json();
const S = (i) => ST[i];
// сцена от начала предложения i (или от абсолютного времени): fn(g, t, w), w('слово', k) — время слова после t
const B = (i, bg, fn, cam) => BT(S(i), bg, fn, cam);
const BT = (t, bg, fn, cam = {}) => beat(t, bg, (g) => fn(g, t, (p, k = 0) => at(p, t, k)), cam);
const GA = (n) => '/gta4_ps3/assets/' + n, G5A = (n) => '/gta5_new/assets/' + n, TA = (n) => '/gta4_ps3/tlou/assets/' + n, UA = (n) => '/uncharted3/assets/' + n;
const DI = (p) => 'dark:' + p, LI = (p) => 'light:' + p;
// короткие обёртки
const R = (g, e, txt, t, x, y, o = {}) => g.el('', ROLE(e, txt), t, x, y, { from: [0, 160], r: (Math.round(x + y) % 3) - 1.5, ...o });
const NUM = (g, n, sub, t, x, y, col = INK, o = {}) => g.el('', BIGNUM(n, sub, col), t, x, y, { from: [0, 180], r: x < 0 ? -3 : 3, ...o });
const PL = (g, txt, t, x, y, col = '#fff', bg = '#111', o = {}) => g.el('', PLATE(txt, col, bg), t, x, y, { from: [0, 160], ...o });
const TL = (g, txt, t, x, y, o = {}) => g.el('', TILE(txt), t, x, y, { from: [0, 160], ...o });
const X = (g, t, x, y, w = 260, o = {}) => g.el('', XMARK(w), t, x, y, { shadow: false, z: 9, upd: xUpd(t + 0.1), ...o });
const ARW = (g, t, x, y, o = {}) => g.el('width:220px;height:120px', CHEV(1), t, x, y, { shadow: false, upd: chevUpd, ...o });
const CH = (g, name, sub, t, x, y, o = {}) => g.el('width:300px;height:300px', CHIP(name, sub), t, x, y, { from: [0, 180], ...o });
const CELL = (g, t, x, y, o = {}) => g.el('width:300px;height:300px', CELLCHIP, t, x, y, { from: [0, 180], ...o });
const BIG = (g, txt, t, x, y, size = 150, o = {}) => g.cap(txt, size, t, x, y, { cps: 14, r: 0, ...o });
// дополнительные анимации
const discUpd = (v) => (t, d) => { d.querySelector('.dk').style.transform = `rotate(${(t * v) % 360}deg)`; };
const doorUpd = (t0) => (t, d) => { d.querySelector('.lf').style.transform = `perspective(900px) rotateY(${(-80 * E.inOut(P(t, t0, 0.9))).toFixed(1)}deg)`; };
const loadUpd = (t0, dur = 2, max = 1) => (t, d) => { d.querySelector('.lb').style.width = (100 * max * P(t, t0, dur)).toFixed(0) + '%'; };
const glitch = (t0) => (t, d) => { if (t > t0) { const g = fr(t * 7.3) < 0.18; d.style.filter = g ? `hue-rotate(${(rnd(Math.floor(t * 7.3)) * 300).toFixed(0)}deg) contrast(1.6)` : ''; d.style.marginLeft = g ? ((rnd(Math.floor(t * 9)) - 0.5) * 40).toFixed(0) + 'px' : '0px'; } };
const flicker = (t, d) => { d.style.opacity = (0.55 + 0.45 * (fr(t * 6.1) < 0.5 ? 1 : 0.4)).toFixed(2); };
const orbit = (t0, rx = 330, ry = 170) => (t, d) => { const a = (t - t0) * 1.8; d.style.marginLeft = (Math.cos(a) * rx).toFixed(0) + 'px'; d.style.marginTop = (Math.sin(a) * ry).toFixed(0) + 'px'; };
const slideX = (t0, dx, dur = 1.2) => (t, d) => { d.style.marginLeft = (dx * E.inOut(P(t, t0, dur))).toFixed(0) + 'px'; };
const flyAway = (t0) => (t, d) => { if (t > t0) { const k = E.outCubic(P(t, t0, 0.7)); d.style.transform += ` translate(${(k * 500).toFixed(0)}px,${(-k * 300).toFixed(0)}px) rotate(${(k * 50).toFixed(0)}deg)`; d.style.opacity = (1 - k).toFixed(2); } };
const pulse = (t, d) => { d.style.transform += ` scale(${(1 + 0.06 * Math.sin(t * 6)).toFixed(3)})`; };
// 12 врагов: 8 активных (мозг), 4 в запасе; на tOut один выбывает, его место занимает запасной
const ENEM = `<div style="display:grid;grid-template-columns:repeat(6,120px);gap:18px;padding:26px;border-radius:30px;background:#fff">${Array.from({ length: 12 }, () => `<div class="en" style="height:140px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-family:'Noto Color Emoji';font-size:70px"></div>`).join('')}</div>`;
const enemUpd = (tSplit, tOut) => (t, d) => d.querySelectorAll('.en').forEach((e, i) => {
  let st = t < tSplit ? 'on' : i < 8 ? 'on' : 'off';
  if (t > tOut) { if (i === 2) st = 'dead'; if (i === 8) st = t > tOut + 1.2 ? 'on' : 'off'; }
  e.style.background = st === 'on' ? '#7fe39a' : st === 'dead' ? '#ff8a8a' : '#d6d8dd';
  e.textContent = st === 'on' ? (t < tSplit ? '🧟' : '🧠') : st === 'dead' ? '❌' : '💤';
});
// план уровня: шум → ближайшие укрытия → враг идёт проверять
const plan2 = (tNoise, tCov, tPick, tGo) => (t, d) => {
  const u = fr(t * 1.2), sw = d.querySelector('.sw'); sw.setAttribute('r', (20 + u * 90).toFixed(1)); sw.setAttribute('opacity', (1 - u).toFixed(2));
  d.querySelector('.snd').setAttribute('opacity', t > tNoise ? 1 : 0);
  d.querySelectorAll('.cv').forEach((r, i) => { const near = [3, 2, 6, 4].includes(i); r.setAttribute('fill', t > tCov && near ? (i === 2 && t > tPick ? '#e3262b' : '#ffb000') : '#c9ccd2'); });
  const k = E.inOut(P(t, tGo, 2.6)), en = d.querySelector('.en'); en.setAttribute('cx', lerp(120, 640, k).toFixed(1)); en.setAttribute('cy', lerp(560, 290, k).toFixed(1));
};
// Cell: PPE перегружен → помощники SPE берут работу
const cell2 = (tOver, tSpe, tPj) => (t, d) => {
  const over = t > tOver && t < tPj + 0.6; d.querySelector('.ppe').setAttribute('fill', over ? (fr(t * 3) < 0.5 ? '#e3262b' : '#ff6a3d') : '#ffb000');
  d.querySelectorAll('.spe').forEach((r, i) => r.setAttribute('fill', t > tSpe + i * 0.08 ? '#7fe39a' : '#c9ccd2'));
  d.querySelectorAll('.pj').forEach((r, i) => { const x1 = 390 + (i % 4) * 125 + 22, y1 = 50 + Math.floor(i / 4) * 215 + 135, k = E.inOut(P(t, tPj + i * 0.15, 0.6));
    r.setAttribute('x', lerp(70 + (i % 2) * 130, x1, k).toFixed(1)); r.setAttribute('y', lerp(80 + Math.floor(i / 2) * 95, y1, k).toFixed(1)); r.setAttribute('opacity', t > tOver ? 1 : 0); });
};
const BOX = (e, txt) => `<div style="width:300px;height:280px;border-radius:26px;background:#c8a26e;border:6px solid #8a6a3e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font-family:Osw;font-weight:700;font-size:44px;color:#3a2a14"><div style="font-family:'Noto Color Emoji';font-size:110px;line-height:1">${e}</div>${txt}</div>`;
const SPU = (n, cfg) => ({ html: SPUS(n), upd: spuUpd(cfg) });
const ghost = 'grayscale(1) opacity(.35) drop-shadow(0 0 0 #000)';

// ---------------- 0 · ВСТУПЛЕНИЕ И УСТРОЙСТВО PS3 ----------------
B(0, 'grid', (g, t) => {
  g.prop(PS3, 380, t + 0.15, 0, 60, { from: [0, 260] });
  g.cap('PLAYSTATION 3', 130, t + 0.5, 0, -300, { cps: 26, fly: true });
  g.emo('✨', 130, t + 1.3, 520, -60, {}); g.emo('✨', 100, t + 1.6, -540, 150, {});
}, { keys: [[0, 1.4, 0, 0, 1.0], [1.3, 0.35, 0, 20, 1.08]] });
B(1, 'grid', (g, t, w) => {
  CELL(g, t + 0.1, -380, 40, { from: [-260, 0], r: -5 });
  g.cap('CELL BROADBAND ENGINE', 70, w('broadband'), -380, -250, { cps: 34, r: -2 });
  g.emo('💪', 160, w('мощной'), 170, -120, { r: -6 }); g.cap('МОЩНЫЙ', 110, w('мощной') + 0.1, 520, -120, { cps: 20, r: 2, col: '#2e9e57' });
  g.emo('🤯', 160, w('сложной'), 170, 160, { r: 6 }); g.cap('СЛОЖНЫЙ', 110, w('сложной') + 0.05, 520, 160, { cps: 20, r: -2, col: RED });
}, { keys: [[S(1) + 3.0, 0.3, 60, -50, 1.05], [S(1) + 4.6, 0.3, 60, 60, 1.08]] });
B(2, D('g5night', 4), (g, t, w) => {
  g.prop(PS3, 300, t + 0.1, -380, 140, { from: [-200, 0] });
  g.emo('🍋', 260, t + 0.8, 380, 20, { upd: squeeze(w('выжали')) });
  g.cap('ВЫЖАЛИ ВСЁ', 130, w('выжали'), 0, -330, { cps: 22 });
}, { keys: [[S(2) + 2.0, 0.3, 0, -40, 1.08]] });
B(3, 'grid', (g, t, w) => {
  g.emo('🎮', 170, t + 0.1, 0, 40, { t1: w('гта') - 0.2 });
  g.cap('СЕГОДНЯ', 90, t + 0.1, 0, -230, { cps: 20, until: w('четыре') - 0.2 });
  g.cap('4 ИГРЫ', 120, w('четыре'), 0, -400, { cps: 14 });
  cover(g, AS.niko, w('гта'), -690, 40, 330, 440, { from: [0, 260], r: -5 }); g.prop(AS.g4logo, 120, w('гта') + 0.2, -690, -210, { r: -4, z: 4 });
  cover(g, AS.uc3, w('uncharted'), -235, 40, 400, 400, { from: [0, 260], r: 3 });
  g.prop(AS.tlou, 470, w('the'), 230, 50, { from: [0, 260], r: -3 });
  g.prop(AS.gta5, 470, w('гта', 1), 690, 50, { from: [0, 260], r: 4 });
}, { z: 0.92, keys: [[at('гта', S(3)), 0.35, -420, 0, 1.0], [at('uncharted', S(3)), 0.35, -150, 0, 1.0], [at('the', S(3)), 0.35, 150, 0, 1.0], [at('гта', S(3), 1), 0.35, 420, 0, 1.0], [at('гта', S(3), 1) + 0.8, 0.4, 0, 0, 0.86]] });
B(4, Lt('ucplane', 7), (g, t, w) => {
  g.prop(PS3, 340, t + 0.1, -360, 60, { from: [-220, 0] });
  g.el('', GROW('НАГРУЗКА', RED), t + 1.4, 380, -60, { upd: growUpd(t + 1.8, 1.4), from: [200, 0] });
  g.cap('НА ПРЕДЕЛЕ', 120, w('пределе'), 380, 140, { cps: 18, r: -2 });
  g.emo('🔥', 170, w('пределе'), -360, -200, {});
}, { keys: [[at('пределе', S(4)), 0.25, 0, 0, 1.08]] });
BT(at('четыре', S(4) + 1), Lt('tlbeauty', 20), (g, t, w) => {
  g.cap('4 ИСТОРИИ', 120, t + 0.1, 0, -60, { cps: 16, until: w('обманывали') - 0.2 });
  g.emo('🎭', 210, w('обманывали'), -520, -130, { r: -8 });
  g.cap('ОБМАН ЖЕЛЕЗА', 110, w('обманывали') + 0.5, -380, 110, { cps: 20, r: -2, until: w('огромные') - 0.1 });
  cc(g, 'g5city', w('огромные') - 0.3, 360, -20, 760, { r: 3, off: 2 });
  g.emo('🌍', 170, w('миры'), 700, -280, {});
  g.cap('ОГРОМНЫЕ МИРЫ', 90, w('огромные'), 360, 300, { cps: 24, r: 2 });
});
BT(at('256', S(4)) - 0.1, 'grid', (g, t, w) => {
  g.prop(RAM, 300, t, -420, -170, { from: [-200, 0], r: -6 });
  g.el('', BIGNUM('0 МБ', 'оперативка'), t + 0.1, -420, 140, { from: [0, 200], r: -3, upd: countUp(t + 0.2, 256, ' МБ') });
  g.emo('➕', 120, w('ещё'), 0, 0, {});
  CH(g, 'RSX', 'видеочип', w('256', 1) - 0.2, 420, -170, { from: [200, 0], r: 4 });
  g.el('', BIGNUM('0 МБ', 'видеопамять'), w('256', 1), 420, 140, { from: [0, 200], r: 3, upd: countUp(w('256', 1) + 0.1, 256, ' МБ') });
}, { keys: [[at('256', S(4)), 0.4, -260, 0, 1.06], [at('ещё', at('256', S(4))), 0.35, 0, 0, 0.95], [at('256', at('ещё', at('256', S(4)))), 0.4, 260, 0, 1.06], [S(5) - 1.2, 0.4, 0, 0, 0.92]] });
B(5, D('g5beach', 9), (g, t, w) => {
  g.emo('📱', 250, t + 0.1, -520, 0, { r: -10 });
  PL(g, '4K · 10 СЕК', w('4k'), -520, 220, '#fff', RED, { r: -3 });
  g.el('width:200px;height:200px', `<div style="font-family:Osw;font-weight:700;font-size:220px;color:#fff;line-height:1">&gt;</div>`, w('больше'), -10, -20, { shadow: false, dur: 0.3 });
  g.prop(RAM, 280, w('вся'), 470, -40, { from: [200, 0], r: 6 });
  g.cap('ВСЯ ПАМЯТЬ PS3', 80, w('вся') + 0.1, 470, 190, { cps: 26, r: 2 });
}, { keys: [[at('больше', S(5)), 0.25, 0, 0, 1.08]] });
B(6, 'grid', (g, t, w) => {
  g.cap('И ВСЁ ЖЕ', 100, t + 0.1, 0, -420, { cps: 20, until: w('города') - 0.1 });
  cc(g, 'g4crash2', w('города'), -560, -60, 620, { r: -5, off: 0.5 });
  g.cap('ГОРОДА С ФИЗИКОЙ', 60, w('города') + 0.2, -560, 190, { cps: 34, r: -3, until: w('океаны') - 0.1 });
  cc(g, 'ucwater', w('океаны'), -190, 120, 620, { r: 4, off: 6, z: 2 });
  g.cap('ОКЕАНЫ', 60, w('океаны') + 0.2, -190, 360, { cps: 30, r: 2, until: w('самол') - 0.1 });
  cc(g, 'ucplane', w('самол'), 190, -80, 620, { r: -3, off: 5, z: 3 });
  g.cap('САМОЛЁТЫ', 60, w('самол') + 0.2, 190, -330, { cps: 30, r: -2, until: w('апокалипсиса') - 0.1 });
  cc(g, 'tlbeauty', w('апокалипсиса'), 560, 100, 620, { r: 5, off: 12, z: 4 });
  g.cap('АПОКАЛИПСИС', 60, w('апокалипсиса') + 0.2, 560, 340, { cps: 30, r: 3, until: w('экрана') - 0.1 });
  g.el('', LOADING, w('экрана'), 0, 0, { z: 8, from: [0, 220], upd: loadUpd(w('экрана'), 1.4, 0.6) });
  X(g, w('загрузки') + 0.15, 0, 0, 300);
}, { z: 0.9, keys: [[at('города', S(6)), 0.35, -560, -40, 1.25], [at('океаны', S(6)), 0.35, -190, 120, 1.25], [at('самол', S(6)), 0.35, 190, -80, 1.25], [at('апокалипсиса', S(6)), 0.35, 560, 100, 1.25], [at('экрана', S(6)) - 0.3, 0.45, 0, 0, 0.8]] });
B(7, D('g4play', 20), (g, t, w) => {
  g.cap('НАСКОЛЬКО ЭТО БЕЗУМНО', 90, t + 0.3, 0, -390, { cps: 26, until: w('заглянуть') - 0.2 });
  g.emo('🤯', 170, w('безумно'), 560, -240, { r: 8 });
  g.prop(PS3, 420, t + 0.2, 0, 70, { from: [0, 220] });
  g.emo('🔍', 230, w('заглянуть'), -520, 60, { z: 6, upd: slideX(w('заглянуть') + 0.2, 520, 1.1) });
  g.cap('ЗАГЛЯНЕМ ВНУТРЬ', 90, w('внутрь'), 0, 330, { cps: 24 });
}, { keys: [[S(8) - 1.0, 0.9, 0, 70, 2.2]] });
B(8, 'grid', (g, t, w) => {
  g.emo('⚠️', 190, t + 0.1, -560, -40, { r: -8 });
  g.cap('КАЖДАЯ ПРОБЛЕМА', 100, t + 0.3, 120, -110, { cps: 20, r: -2 });
  g.cap('НАЧИНАЕТСЯ С ЖЕЛЕЗА', 100, w('начинается'), 120, 60, { cps: 22, r: 2 });
  g.prop(PS3, 200, w('устройства'), 120, 290, { from: [0, 160] });
});
B(9, 'grid', (g, t, w) => {
  TL(g, 'ОБЫЧНЫЙ ПРОЦЕССОР', t + 0.1, -430, 0, { r: -3 });
  X(g, w('стоял'), -430, 0, 240);
  CELL(g, w('cell') - 0.2, 400, 0, { from: [200, 0], r: 4, s: 1.3 });
  g.cap('CELL', 130, w('cell'), 400, -300, { cps: 10 });
});
B(10, 'grid', (g, t, w) => {
  g.emo('👔', 200, w('босс'), -520, -60, { r: -6 });
  PL(g, 'PPE — БОСС', w('ppe'), -520, 160, '#2a2a2c', '#ffb000', { r: -3 });
  g.el('', SPUS(6), w('рабочим'), 330, -60, { from: [200, 0], upd: spuUpd((tt, i) => [tt > at('рабочим', S(10)) + 0.6 ? '#7fe39a' : '#c9ccd2', 1, 'SPU']) });
  PL(g, 'SPU — РАБОЧИЕ', w('spu'), 330, 160, '#2a2a2c', '#7fe39a', { r: 2 });
  g.emo('👷', 120, w('spe'), 700, -280, {});
});
B(11, D('g4play', 40), (g, t, w) => {
  cc(g, 'g4play', t + 0.1, -360, -40, 760, { r: -3, off: 30 });
  g.el('', SPUS(6), w('задания'), 360, -220, { from: [200, 0], s: 0.75, upd: spuUpd((tt, i) => [tt > at('задания', S(11)) ? (fr(tt * 2 + i * 0.3) < 0.5 ? '#ffb000' : '#7fe39a') : '#c9ccd2', 1, 'SPU']) });
  g.emo('🎞️', 150, w('анимаций'), 260, 120, { r: -6 }); g.cap('АНИМАЦИИ', 64, w('анимаций') + 0.1, 260, 270, { cps: 24 });
  g.emo('🔊', 150, w('звука'), 560, 120, { r: 6 }); g.cap('ЗВУК', 64, w('звука') + 0.1, 560, 270, { cps: 18 });
});
B(12, 'grid', (g, t, w) => {
  g.el('', SPUS(4), t + 0.1, -600, 0, { from: [-200, 0], s: 0.6 });
  ARW(g, t + 1.0, -300, 0);
  CH(g, 'RSX', 'видеочип', w('rsx') - 0.1, 30, 0, { r: 3 });
  ARW(g, w('превращает'), 330, 0);
  g.emo('🖥️', 220, w('пиксели'), 620, -10, {});
  g.cap('ПИКСЕЛИ НА ЭКРАНЕ', 70, w('пиксели') + 0.2, 400, 300, { cps: 26, r: 2 });
}, { z: 0.92 });
B(13, D('g5night', 12), (g, t, w) => {
  g.emo('⚠️', 220, t + 0.1, 0, -60, {});
  g.cap('ПОДВОХ', 140, t + 0.3, 0, 200, { cps: 12, until: S(14) - 0.15 });
  g.emo('⚡', 170, at('быстрые', S(14)), -460, -230, { r: -8 }); g.cap('БЫСТРЫЕ', 100, at('быстрые', S(14)) + 0.1, -460, -40, { cps: 18, col: '#7fe39a' });
  g.emo('😤', 170, at('капризные', S(14)), 460, -230, { r: 8 }); g.cap('КАПРИЗНЫЕ', 100, at('капризные', S(14)) + 0.1, 460, -40, { cps: 18, col: '#ff8a8a' });
});
B(15, 'grid', (g, t, w) => {
  g.el('', SPUS(1), t + 0.1, -430, 0, { from: [-200, 0], s: 2.6, upd: spuUpd(() => ['#7fe39a', 1, 'SPU']) });
  g.el('', BIGNUM('0 КБ', 'рабочее место'), w('256') - 0.1, 330, -40, { from: [200, 0], r: 3, upd: countUp(w('256'), 256, ' КБ') });
  g.emo('🤏', 170, w('крошечного'), 330, 230, {});
});
B(16, 'grid', (g, t, w) => {
  PL(g, 'PPE', t + 0.1, -600, 0, '#2a2a2c', '#ffb000', { s: 1.4 });
  g.el('', SPUS(1), t + 0.3, 600, 0, { from: [200, 0], s: 1.8, upd: spuUpd(() => ['#7fe39a', 1, 'SPU']) });
  g.emo('📦', 130, w('аккуратно'), -380, 0, { upd: slideX(w('аккуратно') + 0.3, 780, 2.2) });
  g.cap('РОВНО ТЕ ДАННЫЕ, ЧТО НУЖНЫ', 74, w('ровно'), 0, -280, { cps: 26 });
}, { z: 0.95 });
B(17, Lt('g4fps', 5), (g, t, w) => {
  g.cap('ОШИБКА — И…', 100, t + 0.2, 0, -380, { cps: 20 });
  g.el('', SPUS(4), t + 0.4, 0, -40, { from: [0, 160], s: 1.3, upd: spuUpd((tt) => [tt > at('ждут', S(17)) ? '#ff8a8a' : '#7fe39a', 1, tt > at('ждут', S(17)) ? 'ЖДЁТ' : 'SPU']) });
  g.emo('🐢', 170, w('замедляют'), 0, 260, {});
});
B(18, 'grid', (g, t, w) => {
  g.el('', SPUS(8), t + 0.1, 0, -20, { from: [0, 160], s: 1.35, upd: spuUpd((tt, i) => i === 6 ? [tt > at('отключ', S(18)) ? '#c9ccd2' : '#7fe39a', tt > at('отключ', S(18)) ? 0.7 : 1, tt > at('отключ', S(18)) ? '✖' : 'SPU'] : i === 7 ? [tt > at('зарезерв', S(18)) ? '#ffb000' : '#7fe39a', 1, tt > at('зарезерв', S(18)) ? '🔒' : 'SPU'] : ['#7fe39a', 1, 'SPU']) });
  BIG(g, '8', w('восемь'), -560, -330, 130);
  ARW(g, w('доступно'), -330, -330, { s: 0.7 });
  BIG(g, '6 ДЛЯ ИГР', w('шесть'), 100, -330, 110);
  g.cap('БРАК', 60, w('брака'), 380, 210, { cps: 12, col: RED });
  g.cap('СИСТЕМА', 60, w('систему'), 600, 210, { cps: 16, col: '#c98a00' });
});
B(19, D('ucstorm2', 4), (g, t) => {
  BIG(g, '2', t + 0.1, -460, -60, 300);
  g.prop(RAM, 300, t + 0.4, 230, -60, { from: [200, 0], r: 6 });
  g.cap('ПАМЯТЬ', 120, t + 0.8, 230, 160, { cps: 14 });
});
B(20, 'grid', (g, t, w) => {
  g.prop(GA('x360.png'), 380, t + 0.1, -420, 0, { from: [-200, 0] });
  NUM(g, '512 МБ', 'общая память', w('512'), 360, -80);
  g.emo('✅', 150, w('делить'), 360, 200, {});
});
B(21, 'grid', (g, t, w) => {
  g.prop(PS3, 220, t + 0.1, 0, -330, { from: [0, -120] });
  g.el('', MEMBOX('ПРОЦЕССОР', 'ВИДЕОЧИП'), w('256'), 0, 80, { from: [0, 180] });
  g.cap('ПОПОЛАМ', 90, w('пополам'), 560, -330, { cps: 16, r: 3 });
});
B(22, 'grid', (g, t, w) => {
  g.el('', MEMBOX('ПРОЦЕССОР', 'ВИДЕОЧИП'), t + 0.05, 0, 20, { from: [0, 120] });
  X(g, t + 0.5, 0, 20, 160);
  g.cap('У СОСЕДА НЕ ЗАНЯТЬ', 90, t + 0.6, 0, -300, { cps: 22, until: S(23) - 0.1 });
  g.cap('КОНЧИЛАСЬ ВИДЕОПАМЯТЬ — ВСЁ', 76, at('закончилась', S(23)), 0, 330, { cps: 26, col: RED });
  g.emo('🪫', 150, at('поможет', S(23)), 640, -80, {});
});
B(24, D('g4play', 60), (g, t) => {
  BIG(g, '3', t + 0.1, -460, -40, 300);
  g.el('', DISC, t + 0.4, 250, -40, { from: [200, 0], s: 0.8, upd: discUpd(200) });
  g.cap('ДИСК', 120, t + 0.8, 250, 250, { cps: 12 });
});
B(25, 'grid', (g, t, w) => {
  g.el('', DISC, t + 0.1, -420, 0, { from: [-200, 0], s: 0.9, upd: discUpd(40) });
  g.cap('BLU-RAY', 90, t + 0.3, -420, -320, { cps: 16 });
  NUM(g, '9 МБ/С', 'скорость чтения', w('девяти'), 380, -60);
  g.emo('🐢', 170, w('медленно'), 380, 220, {});
});
B(26, 'grid', (g, t, w) => {
  g.el('width:420px;height:600px', DOOR, t + 0.2, -320, 20, { from: [-200, 0], upd: doorUpd(w('открыв')) });
  g.cap('ОТКРЫЛ ДВЕРЬ…', 90, w('открыв'), 380, -160, { cps: 20, r: 2 });
  g.cap('А ТАМ ПУСТОТА', 100, w('пустоту'), 380, 40, { cps: 20, r: -2, col: RED });
  g.emo('🕳️', 150, w('пустоту') + 0.4, 380, 230, {});
});
B(27, Lt('g5mount', 10), (g, t) => {
  R(g, '🧠', 'ПРОЦЕССОР CELL', t + 0.3, -400, -180);
  R(g, '💾', 'РАЗДЕЛЁННАЯ ПАМЯТЬ', t + 1.3, 300, -20);
  R(g, '💿', 'МЕДЛЕННЫЙ ДИСК', t + 2.3, -260, 150);
  g.cap('3 ОГРАНИЧЕНИЯ', 90, t + 0.1, 0, -400, { cps: 18 });
});

// ---------------- 1 · ГТА 4 ----------------
B(28, DI(GA('liberty_city.jpg')), (g, t) => {
  g.prop(AS.g4logo, 360, t + 0.1, 0, -40, { from: [0, 220] });
  g.emo('🏙️', 150, t + 0.8, 560, 200, {});
});
B(29, 'grid', (g, t, w) => {
  cc(g, 'g4play', t + 0.1, -300, 0, 900, { r: -3, off: 100 });
  g.cap('ВПЕЧАТЛЯЕТ', 110, w('впечатляет'), 520, -300, { cps: 18, r: 3 });
  g.emo('😮', 150, w('впечатляет') + 0.4, 600, 230, {});
});
B(30, 'grid', (g, t, w) => {
  cover(g, GA('map_blue.jpg'), t + 0.1, -560, -150, 520, 380, { r: -4 });
  NUM(g, '16 КМ²', 'карта', w('квадратных'), -560, 220);
  cc(g, 'g4crash1', w('деформируемые'), -20, -170, 520, { r: 3, z: 2 });
  g.cap('ДЕФОРМАЦИЯ', 60, w('деформируемые') + 0.2, -20, 30, { cps: 26, until: w('пешеходы') - 0.1 });
  cc(g, 'g4rag1', w('пешеходы'), -20, 190, 520, { r: -2, z: 3 });
  g.cap('НЕРВНАЯ СИСТЕМА', 60, w('нервной'), -20, 380, { cps: 26 });
  g.emo('☀️', 170, w('тени'), 560, -160, {});
  g.cap('ТЕНИ ОТ СОЛНЦА', 64, w('тени') + 0.2, 560, 40, { cps: 24 });
}, { z: 0.88, keys: [[at('квадратных', S(30)), 0.35, -560, 0, 1.0], [at('деформируемые', S(30)), 0.35, -20, -120, 1.05], [at('пешеходы', S(30)), 0.35, -20, 180, 1.05], [at('тени', S(30)), 0.35, 420, 0, 1.0], [S(31) - 1.0, 0.45, 0, 0, 0.85]] });
B(31, 'grid', (g, t) => {
  g.prop(PS3, 340, t + 0.1, -330, 40, { from: [-200, 0] });
  BIG(g, '2006', t + 0.5, 380, 20, 200);
});
B(32, D('g4crash2', 2), (g, t, w) => {
  g.prop(RAM, 320, t + 0.1, -440, -150, { from: [-200, 0], r: -6 });
  g.emo('🥵', 170, w('забил'), -440, 120, {});
  g.cap('ПАМЯТЬ ЗАБИТА', 80, w('забил') + 0.2, -440, 300, { cps: 24 });
  PL(g, 'НИЖЕ 720p', w('720'), 380, -120, '#fff', RED, { r: 3 });
  NUM(g, '25 FPS', 'кадров в секунду', w('25'), 380, 140, RED);
});
B(33, 'grid', (g, t) => {
  cc(g, 'g4fps', t + 0.1, -200, 0, 860, { r: -2, off: 2 });
  g.emo('✅', 170, t + 0.8, 560, -150, {});
  g.cap('ТАК ЗАРАБОТАЛО', 80, t + 0.6, 560, 120, { cps: 24, r: 2 });
});
B(34, 'grid', (g, t, w) => {
  g.prop(PS3, 360, t + 0.1, -300, 40, { from: [-200, 0], filter: ghost });
  g.emo('❓', 200, t + 0.6, -300, -230, {});
  g.cap('КОНСОЛИ ЕЩЁ НЕТ', 100, w('нет'), 400, 30, { cps: 22, r: 2 });
});
B(35, DI(GA('city_sunset.jpg')), (g, t, w) => {
  g.prop(GA('rockstar.png'), 200, t + 0.1, -560, -200, { r: -6 });
  BIG(g, '2004', w('2004'), -330, 60, 170);
  g.cap('СТАРТ РАЗРАБОТКИ', 56, w('2004') + 0.3, -330, 220, { cps: 26 });
  ARW(g, w('ps3', 0), 50, 60);
  BIG(g, '2006', w('2006'), 420, 60, 170);
  g.cap('ГОТОВА PS3', 56, w('2006') + 0.3, 420, 220, { cps: 24 });
});
B(36, 'grid', (g, t, w) => {
  g.cap('НЕВОЗМОЖНО', 150, t + 0.2, 0, -230, { cps: 16 });
  g.prop(PS3, 300, w('пластика'), 0, 120, { from: [0, 200], filter: ghost });
  g.emo('🧱', 150, w('пластика') + 0.3, 420, 150, {});
});
B(37, 'grid', (g, t, w) => {
  g.cap('СПЕЦИФИЧЕСКИЙ ПУТЬ', 90, t + 0.1, 0, -380, { cps: 22, until: at('суперкомпьютерах', S(38)) - 0.4 });
  g.emo('🛣️', 170, t + 0.4, 0, -100, { t1: at('суперкомпьютерах', S(38)) - 0.4 });
  g.emo('🖥️', 200, at('суперкомпьютерах', S(38)) - 0.3, -560, -60, { r: -6 }); g.emo('🖥️', 160, at('суперкомпьютерах', S(38)) - 0.1, -380, 40, { r: 6 });
  g.cap('СУПЕРКОМПЬЮТЕРЫ', 80, at('суперкомпьютерах', S(38)), -440, 220, { cps: 26 });
  g.emo('🧪', 190, at('тесты', S(38)), 420, -60, {});
  g.cap('ТЕСТЫ ФИЗИКИ', 80, at('тесты', S(38)) + 0.2, 420, 160, { cps: 22 });
});
B(39, 'grid', (g, t, w) => {
  PL(g, 'SONY', w('sony'), -400, -60, '#fff', '#111', { s: 1.6 });
  g.emo('🤝', 180, w('дать'), 0, -60, {});
  g.prop(GA('rockstar.png'), 230, w('rockstar'), 400, -60, { r: 5 });
  g.cap('НА ЧЁМ ТЕСТИРОВАТЬ?', 80, w('запускать'), 0, 230, { cps: 24 });
});
B(40, D('g4play', 80), (g, t, w) => {
  CELL(g, t + 0.1, -480, -60, { filter: ghost });
  g.cap('ЧИП ЕЩЁ НЕ ВЫПУЩЕН', 64, t + 0.4, -480, 200, { cps: 26 });
  g.prop(GA('devkits.png'), 380, w('альфа'), 340, -40, { from: [200, 0] });
  g.cap('АЛЬФА-ДЕВКИТЫ', 80, w('девкит'), 340, 220, { cps: 22 });
});
B(41, 'grid', (g, t, w) => {
  g.cap('ХОТИТЕ ВЕРЬТЕ…', 90, t + 0.1, 0, -380, { cps: 20, until: w('apple') - 0.1 });
  g.prop(GA('powermac_g5.png'), 520, w('apple') - 0.3, -200, 40, { from: [0, 220] });
  g.cap('APPLE?!', 150, w('apple'), 440, -60, { cps: 12, col: RED });
  g.emo('😮', 160, w('apple') + 0.6, 460, 170, {});
});
B(42, 'grid', (g, t) => {
  g.cap('ПОЧЕМУ APPLE?', 140, t + 0.05, 0, -60, { cps: 18 });
  g.emo('🍏', 160, t + 0.4, 0, 170, {});
});
B(43, 'grid', (g, t, w) => {
  g.prop(GA('powermac_g5.png'), 420, t + 0.1, -440, 0, { from: [-200, 0] });
  g.cap('POWER MAC', 70, w('power'), -440, 290, { cps: 20 });
  BIG(g, '≈', w('процессоры'), 0, -20, 220);
  CELL(g, w('процессоры') + 0.2, 430, 0, { from: [200, 0], r: 4 });
  g.cap('ТО ЖЕ СЕМЕЙСТВО', 70, w('семейства'), 430, 290, { cps: 22 });
});
B(44, Lt('g4run', 1), (g, t, w) => {
  [0, 1, 2, 3].forEach((i) => g.prop(GA('powermac_g5.png'), 230, w('партию') + i * 0.18, -620 + i * 170, -40 + (i % 2) * 40, { r: (i - 1.5) * 4 }));
  g.emo('🛒', 160, w('купила'), -370, -300, {});
  ARW(g, w('отдала'), 170, -20);
  g.prop(GA('rockstar.png'), 240, w('rockstar'), 520, -20, { r: 4 });
});
B(45, 'grid', (g, t, w) => {
  CELL(g, t + 0.1, -380, 0, { r: -4 });
  g.emo('👨‍💻', 200, t + 0.5, 300, -80, {});
  g.cap('РАБОТАЮТ ДО ВЫХОДА КОНСОЛИ', 70, w('консоль'), 120, 220, { cps: 26 });
});
B(46, 'grid', (g, t, w) => {
  cc(g, 'g4play', t + 0.1, -160, 0, 900, { r: -3, off: 200, upd: glitch(w('глючные')) });
  g.cap('РАННИЕ ВЕРСИИ', 80, t + 0.4, 520, -330, { cps: 22, r: 3 });
  ['🐛', '🐞', '🪲'].forEach((e, i) => g.emo(e, 140, w('глючные') + i * 0.35, 520 + (i - 1) * 140, 300 - i * 60, { r: (i - 1) * 12 }));
});
B(47, 'grid', (g, t, w) => {
  g.el('', GROW('КОМПЬЮТЕР APPLE', '#4aa8ff'), w('слабее'), -20, -160, { upd: growUpd(w('слабее') + 0.2, 1.2, 0.1) });
  g.el('', GROW('БУДУЩАЯ PS3', '#7fe39a'), at('консоль', S(48)), -20, 40, { upd: growUpd(at('консоль', S(48)) + 0.2, 1.4, 1) });
  NUM(g, '×10', 'мощнее', at('десять', S(48)), 560, -60, '#2e9e57');
  g.emo('🔮', 150, at('предсказывать', S(48)), 560, 240, {});
  g.cap('ПРЕДСКАЗЫВАЛИ', 64, at('предсказывать', S(48)) + 0.2, -20, 280, { cps: 24 });
});
B(49, 'grid', (g, t, w) => {
  cc(g, 'g4crash2', t + 0.1, 0, -250, 520, { off: 1 });
  NUM(g, '4 мс', 'на компьютере', w('четыре'), -420, 160, '#4aa8ff');
  ARW(g, w('рассчитывали'), 0, 160);
  NUM(g, '0,4 мс', 'на PS3', w('0'), 420, 160, '#2e9e57');
});
B(50, D('g4cmp1', 1), (g, t) => {
  g.emo('🧮', 200, t + 0.1, -440, -40, { r: -6 });
  g.cap('ТОЛЬКО ТЕОРИЯ', 120, t + 0.4, 240, -40, { cps: 18 });
  g.emo('📐', 150, t + 1.2, 240, 200, {});
});
B(51, 'grid', (g, t, w) => {
  g.cap('2 ГОДА СПУСТЯ', 110, t + 0.1, 0, -380, { cps: 18, until: S(52) - 0.2 });
  g.prop(GA('ps3_fat.png'), 520, w('бета'), -360, 60, { from: [-200, 0] });
  g.cap('БЕТА-КОНСОЛЬ', 80, w('бета') + 0.2, 360, -80, { cps: 22 });
  g.emo('⏳', 170, S(52), 380, 120, {});
  g.cap('МОМЕНТ ИСТИНЫ', 100, S(52) + 0.2, 360, 320, { cps: 20, col: RED });
});
B(53, D('g4play', 120), (g, t, w) => {
  g.el('', BINARY(700), t + 0.1, -380, -60, { upd: binUpd });
  g.cap('2 ГОДА КОДА', 80, w('гору'), -380, 140, { cps: 20 });
  ARW(g, w('скомпилировала'), 80, -60);
  g.prop(PS3, 300, w('железо'), 470, -60, { from: [200, 0] });
  g.cap('ПЕРВЫЙ ЗАПУСК', 90, w('впервые'), 300, 220, { cps: 20 });
});
B(54, 'grid', (g, t, w) => {
  g.emo('😱', 220, t + 0.1, -520, -100, { r: -6 });
  g.cap('ПАНИКА', 140, t + 0.3, -520, 170, { cps: 14, col: RED });
  cc(g, 'g4fps', at('системы', S(55)), 300, -150, 640, { r: 3, off: 3, speed: 0.15 });
  NUM(g, '2 FPS', 'на настоящей PS3', at('два', S(55)), 300, 230, RED);
});
B(56, 'grid', (g, t, w) => {
  g.prop(RAM, 320, t + 0.1, -440, -80, { r: -6 });
  BIG(g, '256 МБ', w('256'), -440, 160, 120);
  g.cap('ЖЕСТОКАЯ ПРАВДА', 80, w('жестокую'), 330, -300, { cps: 22 });
  g.emo('🐘', 220, at('большой', S(57)), 330, -20, {});
  g.cap('СЛИШКОМ БОЛЬШАЯ', 80, at('большой', S(57)) + 0.2, 330, 230, { cps: 22, col: RED });
});
B(58, 'grid', (g, t, w) => {
  g.el('', GROW('ПАМЯТЬ PS3', RED), t + 0.1, -160, -60, { upd: (tt, d) => { const k = E.outCubic(P(tt, at('превышал', S(58)), 1.6)); const b = d.querySelector('.gb'); b.style.width = (100 * Math.min(1, k * 1.7)).toFixed(0) + '%'; d.firstChild.lastChild.style.overflow = 'visible'; b.style.boxShadow = k > 0.6 ? `${(220 * (k - 0.6) / 0.4).toFixed(0)}px 0 0 ${RED}` : 'none'; } });
  NUM(g, '+180 МБ', 'лишних', w('180'), 520, -60, RED);
  g.emo('💥', 160, w('180') + 0.3, 520, 220, {});
});
B(59, D('g4cmp2', 2), (g, t, w) => {
  NUM(g, '24 МЕСЯЦА', 'разборки игры', w('двадцать'), -460, -100);
  R(g, '✍️', 'ПЕРЕПИСАТЬ КОД', w('переписывать'), 360, -230);
  R(g, '🗜️', 'СЖАТЬ ТЕКСТУРЫ', w('сжимать'), 360, -40);
  R(g, '📉', 'СНИЗИТЬ РАЗРЕШЕНИЕ', w('снижать'), 360, 150);
});
B(60, 'grid', (g, t, w) => {
  cc(g, 'g4cmp1', t + 0.1, -250, 0, 860, { r: -2, upd: (tt, d) => { d.style.filter = `blur(${(6 * P(tt, at('размытия', S(60)), 0.8)).toFixed(1)}px)`; } });
  g.cap('ФИЛЬТР РАЗМЫТИЯ', 90, w('размытия'), 560, -280, { cps: 20, r: 3 });
  g.emo('🌫️', 170, w('размытия') + 0.4, 600, 120, {});
});
B(61, 'grid', (g, t, w) => {
  cover(g, GA('cmp_ps3.jpg'), t + 0.1, -430, 0, 760, 428, { from: [-200, 0], r: -3, upd: (tt, d) => { d.style.filter = 'blur(2.5px)'; } });
  PL(g, 'PS3', t + 0.3, -430, -270, '#fff', '#2a5bd7');
  g.emo('🧴', 170, w('вазелин'), -650, 260, { r: -10 });
  g.cap('ВАЗЕЛИН НА ОБЪЕКТИВЕ', 70, w('вазелин') + 0.1, -330, 330, { cps: 26 });
  cover(g, GA('cmp_x360.jpg'), w('xbox'), 430, 0, 760, 428, { from: [200, 0], r: 3, z: 2 });
  PL(g, 'XBOX 360', w('xbox') + 0.2, 430, -270, '#fff', '#107c10', { z: 3 });
}, { z: 0.92 });
B(62, D('g4cmp2', 4), (g, t, w) => {
  g.emo('🎩', 200, t + 0.1, -520, -60, {});
  g.cap('ХИТРЫЙ ТРЮК', 120, t + 0.3, 200, -150, { cps: 18 });
  TL(g, 'ПРЯЧЕТ СЖАТЫЕ ТЕКСТУРЫ', w('спрятать'), 200, 110, { r: 2 });
});
B(63, 'grid', (g, t, w) => {
  cc(g, 'g4run', t + 0.1, -330, -40, 760, { r: -3, fps: 8 });
  g.cap('ПОДТОРМАЖИВАЛА', 90, t + 0.3, 400, -260, { cps: 22, r: 2 });
  g.emo('🐌', 150, t + 0.9, 560, -60, {});
  g.emo('✅', 130, at('переулке', S(64)), 300, 150, {}); g.cap('В ПЕРЕУЛКЕ — НОРМ', 64, at('переулке', S(64)) + 0.1, 400, 300, { cps: 24 });
});
B(65, 'grid', (g, t, w) => {
  cc(g, 'g4crash1', t + 0.1, -330, -40, 760, { r: -3, fps: 12 });
  g.emo('💥', 190, w('взорвать'), 430, -250, {});
  g.el('', BIGNUM('30 FPS', 'падение'), w('частота'), 420, 30, { from: [200, 0], upd: (tt, d) => { d.firstChild.firstChild.textContent = Math.round(30 - 20 * E.inOut(P(tt, at('тридцати', S(65)), 1.5))) + ' FPS'; d.firstChild.firstChild.style.color = tt > at('тридцати', S(65)) + 0.6 ? RED : INK; } });
  g.cap('ПОД ОГРОМНОЙ НАГРУЗКОЙ', 70, at('нагрузкой', S(66)) - 0.4, 0, 380, { cps: 26 });
});
B(67, 'grid', (g, t, w) => {
  g.emo('🛠️', 170, t + 0.1, -620, -300, {});
  g.cap('НЕСКОЛЬКО ПРИЁМОВ', 90, t + 0.2, 0, -400, { cps: 22, until: S(68) + 1.5 });
  g.el('', CULL, at('карту', S(68)), -300, 40, { upd: cullUpd, from: [-100, 100] });
  g.cap('OCCLUSION CULLING', 66, at('occlusion', S(68)), 440, -200, { cps: 22, r: 3 });
  g.cap('ГРУЗИМ ТОЛЬКО ВИДИМОЕ', 60, at('видит', S(68)), 440, 0, { cps: 24, r: -2 });
  g.emo('🗑️', 140, at('удаляется', S(68)), 560, 200, {});
});
B(69, D('g4play', 160), (g, t, w) => {
  g.emo('🗑️', 200, w('удаляла'), -380, -60, { r: -8 }); g.emo('🗑️', 200, w('удаляла') + 0.3, -170, -40, { r: 8 });
  BIG(g, '×2', w('вдвое'), 300, -80, 220);
  g.cap('УДАЛЯЕТ ВДВОЕ БОЛЬШЕ', 76, w('вдвое') + 0.2, 0, 230, { cps: 24 });
});
B(70, 'grid', (g, t, w) => {
  g.el('width:420px;height:600px', DOOR, t + 0.2, -400, 20, { from: [-200, 0], upd: doorUpd(w('входе')) });
  g.cap('ВХОДИШЬ В ЗДАНИЕ…', 80, w('входе'), 300, -180, { cps: 22, r: 2 });
  g.emo('🔉', 170, w('тише'), 300, 40, {});
  g.cap('КОНСОЛЬ ТИШЕ', 90, w('тише') + 0.2, 300, 240, { cps: 18 });
});
B(71, 'grid', (g, t, w) => {
  cover(g, GA('city_sunset.jpg'), t + 0.1, -280, 0, 860, 484, { r: -2, upd: (tt, d) => { d.style.filter = tt > at('замораживается', S(71)) ? 'saturate(.3) brightness(1.1) hue-rotate(160deg)' : ''; } });
  g.emo('❄️', 190, at('замораживается', S(71)), 560, -220, {});
  g.cap('ГОРОД ЗАМЕРЗАЕТ', 76, at('замораживается', S(71)) + 0.2, 560, -20, { cps: 24 });
  BIG(g, '3D → 2D', at('3d', S(72)), 560, 200, 110);
}, { z: 0.95 });
B(73, 'grid', (g, t) => {
  g.emo('🖼️', 220, t + 0.1, -420, -40, {});
  g.cap('ПЛОСКИЕ КАРТИНКИ', 110, t + 0.3, 230, -40, { cps: 22 });
});
B(74, D('g4play', 220), (g, t, w) => {
  g.el('', BIGNUM('0%', 'нагрузки на консоль'), w('семьдесят') - 0.5, 0, -40, { from: [0, 180], upd: countUp(w('семьдесят') - 0.3, -70, '%', 1.2) });
  g.emo('📉', 170, w('семьдесят'), 470, -200, {});
});
B(75, 'grid', (g, t) => {
  g.emo('⚙️', 220, t + 0.1, 0, -80, {});
  g.cap('ФИЗИКА', 140, t + 0.3, 0, 190, { cps: 14 });
});
B(76, 'grid', (g, t, w) => {
  g.emo('🎞️', 180, w('записанную'), -480, -80, { r: -6 });
  g.cap('ГОТОВАЯ АНИМАЦИЯ', 76, w('анимацию'), -480, 140, { cps: 22 });
  g.emo('🤖', 220, S(77), 420, -80, { r: 6 });
  g.cap('КАК РОБОТ', 100, S(77) + 0.2, 420, 160, { cps: 16, col: RED });
});
B(78, 'grid', (g, t, w) => {
  g.el('', SKEL, t + 0.1, -560, 20, { upd: skUpd, from: [-100, 100] });
  g.cap('НЕРВНАЯ СИСТЕМА', 66, w('нервную'), -560, -300, { cps: 24 });
  g.emo('💪', 140, w('мышц'), -340, -90, {});
  cc(g, 'g4rag1', S(79), 270, -60, 760, { r: 3, off: 0.5, speed: 0.7 });
  g.cap('ДЕРЖИТ РАВНОВЕСИЕ', 70, at('равновесие', S(79)), 270, 290, { cps: 24 });
});
B(80, 'grid', (g, t, w) => {
  g.cap('СЕГОДНЯ — НОРМА', 110, t + 0.1, 0, -150, { cps: 20, r: -2 });
  g.cap('ТОГДА — БЕЗУМИЕ', 110, w('тогда'), 0, 90, { cps: 20, r: 2, col: RED });
  g.emo('🤯', 160, w('безумием'), 620, 90, {});
});
B(81, 'grid', (g, t, w) => {
  cc(g, 'g4rag2', t + 0.1, -440, -40, 620, { r: -3 });
  R(g, '⬆️', 'СПЕРЕДИ', w('спереди'), 330, -300);
  R(g, '➡️', 'СБОКУ', w('сбоку'), 330, -150);
  R(g, '🐢', '10 МИЛЬ/Ч', w('десяти'), 330, 0);
  R(g, '🏎️', '60 МИЛЬ/Ч', w('шестидесяти'), 330, 150);
  g.cap('= ОДИНАКОВО', 90, w('одинаково'), 330, 320, { cps: 18, col: RED });
}, { z: 0.92 });
B(82, D('g4rag1', 2), (g, t, w) => {
  g.emo('🎞️', 180, t + 0.1, -420, -60, {}); X(g, t + 0.6, -420, -60, 230);
  NUM(g, 'МИЛЛИОНЫ', 'вариаций', S(83), 300, -60, '#2e9e57');
  g.emo('🎲', 150, S(83) + 0.6, 300, 200, {});
});
B(84, 'grid', (g, t, w) => {
  g.prop(GA('cj.png'), 560, w('san'), -420, 40, { from: [-200, 0] });
  g.cap('SAN ANDREAS', 70, w('san') + 0.2, -420, -300, { cps: 20 });
  X(g, w('отказалась'), -420, 40, 300);
  g.emo('🚗', 200, w('реалистичной'), 380, -60, {});
  g.cap('РЕАЛИСТИЧНОЕ ВОЖДЕНИЕ', 70, w('реалистичной') + 0.2, 380, 160, { cps: 24 });
});
B(85, 'grid', (g, t, w) => {
  cc(g, 'g4play', t + 0.1, -330, -40, 760, { r: -3, off: 300 });
  R(g, '🔩', 'ПОДВЕСКА', w('подвеска'), 420, -200);
  R(g, '🛞', 'СЦЕПЛЕНИЕ ШИН', w('сцепление'), 420, -40);
  R(g, '⚖️', 'ЦЕНТР МАСС', w('центр'), 420, 120);
});
B(86, 'grid', (g, t, w) => {
  cc(g, 'g4play', t + 0.1, -420, -60, 600, { r: -5, off: 340 });
  g.cap('КРЕН В ПОВОРОТЕ', 70, w('наклоняется'), -420, 200, { cps: 24 });
  cc(g, 'g4crash1', S(87), 380, -60, 600, { r: 4, speed: 0.6 });
  g.cap('МЕТАЛЛ МНЁТСЯ', 70, at('сомнётся', S(87)), 380, 200, { cps: 24 });
  g.emo('💥', 150, at('столб', S(87)), 650, -260, {});
});
B(88, D('g4crash2', 3), (g, t) => {
  BIG(g, '∞', t + 0.1, -300, -20, 300);
  g.cap('ВАРИАНТОВ', 110, t + 0.4, 280, -20, { cps: 16 });
});
B(89, 'grid', (g, t, w) => {
  g.el('width:300px;height:300px', CLOCK, t + 0.1, -400, 0, { upd: clockUpd });
  g.emo('☀️', 170, w('освещения'), 300, -200, { upd: (tt, d) => { d.style.marginLeft = (Math.sin((tt - t) * 0.8) * 200).toFixed(0) + 'px'; } });
  g.cap('ВРЕМЯ СУТОК', 110, w('суток'), 300, 100, { cps: 18 });
});
B(90, 'grid', (g, t, w) => {
  g.prop(GA('cj_shadow.png'), 600, t + 0.1, -380, 20, { from: [-200, 0] });
  g.cap('SAN ANDREAS', 70, t + 0.3, -380, -330, { cps: 20 });
  g.cap('ПРОСТО ТЁМНЫЙ КРУГ', 76, w('круг'), 330, -180, { cps: 24, r: 2 });
  ['🕛', '🌙', '💡'].forEach((e, i) => g.emo(e, 130, [w('полдень'), w('полночь'), w('фонарём')][i], 160 + i * 180, 60, {}));
  g.cap('ВСЕГДА ОДИНАКОВО', 70, w('фонарём') + 0.6, 330, 260, { cps: 22, col: RED });
});
B(91, 'grid', (g, t, w) => {
  cover(g, GA('city_sunset.jpg'), t + 0.1, -280, -20, 900, 506, { r: -2 });
  g.emo('☀️', 150, w('солнце'), -560, -240, { upd: slideX(at('солнце', S(91)) + 0.3, 560, 4) });
  g.cap('ДЛИННЫЕ ТЕНИ', 76, w('тени'), 560, -240, { cps: 22 });
  NUM(g, 'МИЛЛИОНЫ', 'пересечений света в секунду', S(92), 520, 160);
}, { z: 0.95 });
B(93, 'grid', (g, t, w) => {
  g.emo('🎬', 180, t + 0.1, -560, -260, {});
  g.cap('КИНЕМАТОГРАФИЧНО…', 70, t + 0.2, -260, -380, { cps: 24, until: S(94) - 0.1 });
  CH(g, 'RSX', 'видеочип', S(94), -430, 20, { r: -3 });
  BIG(g, '256 МБ', S(94) + 0.4, -430, 280, 100);
  R(g, '🏙️', 'ТЕКСТУРЫ ГОРОДА', at('текстуры', S(94)), 360, -170);
  R(g, '🌗', 'ТЕНИ В РЕАЛЬНОМ ВРЕМЕНИ', at('тенях', S(94)), 360, 0);
  g.cap('МЕСТО КОНЧИЛОСЬ', 80, at('закончилось', S(94)), 360, 200, { cps: 22, col: RED });
});
B(95, 'grid', (g, t, w) => {
  cc(g, 'g4cmp2', t + 0.1, -280, 0, 860, { r: -2, off: 4 });
  g.cap('ТЕНИ ПРОЩЕ', 90, w('теней'), 560, -260, { cps: 18 });
  g.el('', `<div style="font-family:Osw;font-weight:700;font-size:96px;color:${RED};white-space:nowrap">ЗЕРНИСТЫЕ</div>`, S(96), 560, -20, { shadow: false, upd: flicker });
  g.el('', `<div style="font-family:Osw;font-weight:700;font-size:96px;color:${RED};white-space:nowrap">МЕРЦАЮТ</div>`, at('мерцали', S(96)), 560, 150, { shadow: false, upd: flicker });
});

// ---------------- 2 · UNCHARTED 3 ----------------
B(97, D('ucplane', 3), (g, t, w) => {
  g.prop(UA('nd_logo.png'), 130, w('naughty'), 0, -300, { from: [0, -160] });
  cover(g, AS.uc3, w('uncharted'), 0, 90, 460, 460, { from: [0, 220], r: 2 });
});
B(98, 'grid', (g, t, w) => {
  g.cap('ТОЖЕ ПОРАЖАЕТ', 80, t + 0.1, 0, -420, { cps: 22, until: S(99) });
  cc(g, 'ucplane', S(99), -560, -80, 560, { r: -4, off: 2 }); g.cap('САМОЛЁТ', 56, S(99) + 0.2, -560, 140, { cps: 20 });
  cc(g, 'ucstorm1', at('песчаная', S(99)), -10, 60, 560, { r: 3, z: 2, off: 3 }); g.cap('БУРЯ', 56, at('песчаная', S(99)) + 0.2, -10, 280, { cps: 16 });
  cc(g, 'ucwater', at('океан', S(99)), 560, -80, 560, { r: -2, z: 3, off: 4 }); g.cap('ОКЕАН', 56, at('океан', S(99)) + 0.2, 560, 140, { cps: 16 });
  g.emo('🤖', 150, at('интеллектом', S(99)), 560, 330, {});
}, { z: 0.9, keys: [[S(99), 0.35, -560, -40, 1.15], [at('песчаная', S(99)), 0.35, -10, 60, 1.15], [at('океан', S(99)), 0.35, 560, -40, 1.15], [at('интеллектом', S(99)), 0.45, 0, 0, 0.85]] });
B(100, 'grid', (g, t, w) => {
  g.prop(PS3, 330, t + 0.1, -380, 40, { from: [-200, 0] });
  NUM(g, '5 ЛЕТ', 'консоли к выходу игры', w('пять'), 380, 20);
});
B(101, D('uccut', 5), (g, t) => {
  g.emo('🤔', 200, t + 0.1, -500, -60, { r: -8 });
  g.cap('ЭТО УЖЕ БЫЛО?', 110, t + 0.3, 200, -100, { cps: 18 });
  g.cap('ЧЕМ ВЫДЕЛЯЕТСЯ?', 110, S(102), 200, 120, { cps: 18, col: '#ffb000' });
});
B(103, 'grid', (g, t, w) => {
  TL(g, 'ВСЕ ПРИЁМЫ', w('приёмы'), -430, -200, { r: -3 });
  g.emo('➕', 120, w('соединяет'), 0, -200, {});
  TL(g, 'В ОДНОЙ ИГРЕ', w('соединяет') + 0.3, 430, -200, { r: 3 });
  cc(g, 'uccut', w('процесс'), 0, 140, 760, { off: 4, z: 2 });
  g.emo('🎬', 160, w('кино'), 560, 250, {});
  g.cap('ПОЧТИ КИНО', 90, w('кино') + 0.1, -560, 330, { cps: 16, r: -3 });
});
B(104, D('ucplane', 8), (g, t, w) => {
  cover(g, UA('uc2_cover.png'), t + 0.1, 0, -20, 340, 391, { r: -3, t1: w('безумную') - 0.3 });
  g.cap('ПОСЛЕ УСПЕХА UNCHARTED 2', 70, t + 0.3, 0, 300, { cps: 26, until: w('безумную') - 0.3 });
  g.emo('💡', 220, w('безумную'), -480, -100, { r: -8 });
  g.cap('САМАЯ БЕЗУМНАЯ ИДЕЯ', 92, w('безумную') + 0.2, 160, -320, { cps: 20, r: 2 });
  cc(g, 'ucplane', S(105), 200, 80, 820, { r: 2, off: 9 });
  g.cap('САМОЛЁТ ПАДАЕТ, А ТЫ ВНУТРИ', 66, at('внутри', S(105)) - 0.6, 200, 390, { cps: 28 });
});
B(106, 'grid', (g, t, w) => {
  g.prop(PS3, 300, t + 0.1, -440, 30, { from: [-200, 0] });
  CELL(g, w('мощность'), 0, 30, { r: 3 });
  X(g, w('нет'), 420, 30, 250);
  g.cap('МОЩНОСТИ НЕ ХВАТИТ?', 84, w('мощность') + 0.2, 0, -320, { cps: 20 });
});
B(107, D('ucplane', 4), (g, t, w) => {
  g.cap('НАСТОЯЩАЯ ФИЗИКА', 100, t + 0.2, 0, -380, { cps: 18 });
  g.emo('✈️', 150, w('самол'), -520, 40, { r: -10 });
  g.emo('💨', 150, w('ветер'), 0, 40, {});
  g.emo('👊', 150, w('драки'), 520, 40, { r: 8 });
  X(g, w('больше') + 0.2, 0, 40, 420);
});
B(108, 'grid', (g, t) => {
  g.emo('🎭', 260, t + 0.1, -420, 0, { r: -8 });
  g.cap('ИЛЛЮЗИИ', 150, t + 0.4, 220, -20, { cps: 12, r: 2 });
  g.emo('✨', 120, t + 2.0, 640, -230, {});
});
B(109, D('ucjungle', 6), (g, t, w) => {
  cover(g, UA('uc2_cover.png'), t + 0.1, -420, 20, 400, 460, { from: [-200, 0], r: -4 });
  g.cap('ЧТО ВЗЯТЬ ИЗ ПРОШЛОГО?', 80, t + 0.4, 300, -130, { cps: 22, r: 2 });
  g.emo('🔍', 160, t + 1.6, 600, 150, {});
});
B(110, Lt('ucjungle', 9), (g, t, w) => {
  cc(g, 'ucjungle', t + 0.1, -340, 10, 820, { r: -3, off: 3 });
  g.emo('🚂', 200, w('поездом'), 540, -60, { r: -6 });
  g.cap('ИМИТАЦИЯ ДВИЖЕНИЯ', 70, w('имитация'), 400, -300, { cps: 22, r: 2 });
  g.cap('UNCHARTED 2', 70, w('uncharted'), 420, 230, { cps: 18 });
});
B(111, 'grid', (g, t, w) => {
  g.el('', PARA('🚂', 'linear-gradient(#bde3ff,#e9f6ff)', '#7fb46a'), t + 0.1, -330, 0, { upd: paraUpd(260), from: [-100, 100] });
  g.cap('ДЕКОРАЦИЯ СТОИТ', 64, w('декорация'), 470, -180, { cps: 22, r: 2 });
  g.cap('ФОН КРУТИТСЯ', 64, w('фон'), 470, 20, { cps: 20, r: -2 });
  g.cap('ПАРАЛЛАКС', 120, S(112), 400, 240, { cps: 12, r: 2 });
});
B(113, 'grid', (g, t, w) => {
  g.el('', PARA('✈️', 'linear-gradient(#9fd0ff,#e9f6ff)', '#e8c883'), t + 0.1, 0, -20, { upd: paraUpd(420), from: [0, 120] });
  g.cap('САМОЛЁТ СТОИТ НА МЕСТЕ', 80, w('стоит'), 0, -330, { cps: 22 });
  g.cap('ПУСТЫНЯ БЕЖИТ', 80, w('пустыня'), 0, 330, { cps: 20 });
});
B(114, D('ucplane', 5), (g, t, w) => {
  g.emo('✈️', 230, t + 0.1, 0, 20, {});
  g.emo('🎥', 190, w('камера'), 0, 20, { upd: orbit(at('камера', S(114))) });
  g.cap('КАМЕРА КРУЖИТ', 100, w('камера') + 0.2, 0, -330, { cps: 16 });
  g.cap('ВСЁ ВЫГЛЯДИТ ОБЪЁМНЫМ', 70, w('объёмным'), 0, 360, { cps: 22 });
});
B(115, 'grid', (g, t, w) => {
  g.emo('☀️', 220, t + 0.1, -420, -120, { upd: (tt, d) => { d.style.marginLeft = (Math.sin((tt - t) * 0.9) * 120).toFixed(0) + 'px'; } });
  g.el('', PARA('✈️', 'linear-gradient(#ffd9a0,#ffeed2)', '#e8c883'), t + 0.4, 260, 40, { upd: (tt, d) => { paraUpd(380)(tt, d); d.style.filter = `brightness(${(0.85 + 0.25 * Math.sin(tt * 1.3)).toFixed(2)}) drop-shadow(0 30px 30px rgba(0,0,0,.32))`; }, from: [100, 100] });
  g.cap('ИГРА СВЕТА', 100, w('освещения'), -420, 220, { cps: 14, r: -3 });
  g.cap('ИЛЛЮЗИЯ ПОЛНАЯ', 80, S(116), 260, -330, { cps: 20, col: RED });
});
B(117, Lt('ucnet', 6), (g, t, w) => {
  cc(g, 'ucnet', t + 0.1, -330, 0, 880, { r: -3, off: 3 });
  g.cap('ГРУЗОВАЯ СЕТКА', 84, w('сетке'), 500, -250, { cps: 18, r: 2 });
  g.emo('🧗', 200, w('лезли'), 520, 120, { r: 8 });
});
B(118, D('ucmocap', 3), (g, t, w) => {
  g.emo('🥷', 180, w('assassin'), -620, -230, { r: -8 });
  g.cap("ASSASSIN'S CREED", 70, w('assassin') + 0.1, -300, -330, { cps: 20, r: -2 });
  cc(g, 'ucmocap', w('человека') - 0.4, 200, 20, 860, { r: 3 });
  g.cap('ЗАХВАТ ДВИЖЕНИЯ', 76, w('захвата'), -280, 280, { cps: 22, r: -2 });
  g.cap('МАКСИМУМ РЕАЛИЗМА', 70, S(119), 300, 380, { cps: 22, col: '#7fe39a' });
});
B(120, 'grid', (g, t, w) => {
  g.prop(RAM, 320, t + 0.1, -420, -40, { r: -6 });
  g.cap('УЗКОЕ МЕСТО: ПАМЯТЬ', 80, w('память'), -380, 230, { cps: 22 });
  g.el('', CULL, S(121), 360, 0, { upd: cullUpd, from: [100, 100] });
  g.cap('ТОТ ЖЕ ПРИЁМ', 70, S(121) + 0.6, 360, -330, { cps: 18 });
});
B(122, D('ucship2', 8), (g, t, w) => {
  g.cap('ЭТО ТОЛЬКО НАЧАЛО', 80, t + 0.1, 0, -440, { cps: 24, until: S(123) - 0.1 });
  cc(g, 'ucship2', S(123), -330, 20, 860, { r: -3, off: 4 });
  g.cap('SINK OR SWIM', 100, at('sink', S(123)), 360, -230, { cps: 14, r: 2 });
  g.emo('🚢', 190, at('лайнер', S(123)), 520, 70, { r: 8 });
});
B(124, 'grid', (g, t, w) => {
  g.emo('🎞️', 220, t + 0.2, -440, -60, { r: -8 });
  g.cap('ГОТОВАЯ АНИМАЦИЯ', 90, w('анимацией'), 150, -120, { cps: 20, r: 2 });
  g.cap('КАК В БОЛЬШИНСТВЕ ИГР', 64, w('большинство'), 150, 80, { cps: 24, r: -2 });
});
B(125, Lt('ucwater', 4), (g, t, w) => {
  cc(g, 'ucwater', t + 0.1, 330, 10, 860, { r: 3, off: 8 });
  g.cap('НОВЫЙ ОКЕАН', 100, w('новую'), -440, -150, { cps: 14, r: -3 });
  g.cap('В РЕАЛЬНОМ ВРЕМЕНИ', 60, w('реальном'), -500, 20, { cps: 22, r: -2 });
  g.emo('⚙️', 150, w('сцены'), -480, 250, {});
});
B(126, 'grid', (g, t, w) => {
  g.cap('НЕ ПРОСТО', 100, t + 0.2, -380, -150, { cps: 14, r: -3 });
  g.cap('ПОЛЗУЩАЯ ТЕКСТУРА', 90, w('текстура'), -300, 40, { cps: 18, r: -2 });
  g.emo('🖼️', 170, w('текстура'), 460, -200, {}); X(g, w('ползёт'), 460, -200, 220);
});
B(127, 'grid', (g, t, w) => {
  g.el('', SHIPW(true), t + 0.1, 0, 30, { upd: shipUpd(true), from: [0, 140] });
  g.cap('ВОДА РАСКАЧИВАЕТ КОРАБЛЬ', 84, w('двигает'), 0, -330, { cps: 22 });
});
B(128, Lt('ucwater', 14), (g, t, w) => {
  g.cap('3 СИСТЕМЫ ВОДЫ', 100, t + 0.3, 0, -400, { cps: 16 });
  R(g, '💧', 'ЛУЖИ И РЕКИ', w('спокойных'), -430, -150);
  R(g, '🌊', 'ОТКРЫТЫЙ ОКЕАН', w('больших'), 0, 20);
  R(g, '🚰', 'ПОТОКИ В КОРИДОРАХ', w('несётся'), 430, 190);
});
B(129, 'grid', (g, t, w) => {
  NUM(g, '30 FPS', 'стабильно', w('тридцати') - 0.2, -330, 20);
  cc(g, 'ucwater', t + 0.3, 380, 20, 640, { r: 3, off: 12 });
  g.emo('✅', 150, w('секунду'), 700, -230, {});
});
B(130, D('ucstorm1', 6), (g, t, w) => {
  cc(g, 'ucstorm1', t + 0.1, -320, 10, 820, { r: -3, off: 4 });
  g.cap('ПУСТЫНЯ', 130, t + 0.3, 400, -200, { cps: 12, r: 2 });
  g.emo('🌪️', 190, at('бурь', S(131)), 560, 60, { r: 8 });
  g.cap('ПЕСЧАНЫЕ БУРИ', 70, at('бурь', S(131)) + 0.2, 400, 280, { cps: 22 });
});
B(132, D('ucplane', 14), (g, t, w) => {
  g.prop(PS3, 360, t + 0.1, -380, 20, { from: [-200, 0] });
  g.emo('🥵', 200, w('выжатой'), 380, -120, {});
  g.cap('ВЫЖАТА ДО ПРЕДЕЛА', 80, w('выжатой') + 0.2, 380, 140, { cps: 20, r: 2 });
  g.cap('ЖЕРТВЫ', 110, S(133), 0, -380, { cps: 14, col: '#ffb000' });
});
B(134, 'grid', (g, t, w) => {
  NUM(g, '1080p', 'хотели', w('1080'), -430, 20, '#2e9e57');
  g.emo('➡️', 130, w('снизить'), 0, 20, {});
  NUM(g, '720p', 'получили', w('720'), 430, 20, RED);
  g.cap('НЕ ХВАТИЛО ПАМЯТИ', 70, w('нехватки'), 0, -330, { cps: 22 });
});
B(135, Lt('uccut', 8), (g, t, w) => {
  g.prop(UA('drake.png'), 760, t + 0.1, -340, 40, { from: [-200, 0], r: -2 });
  g.cap('КАК СОЗДАЮТ ДРЕЙКА', 90, t + 0.4, 320, -200, { cps: 20, r: 2 });
  g.emo('🗿', 170, S(136), 320, 60, {});
  g.cap('НЕ ПРОСТО «СЛЕПИЛ И ВСЁ»', 64, S(136) + 0.3, 320, 260, { cps: 26 });
});
B(137, 'grid', (g, t, w) => {
  g.cap('ДЕСЯТКИ СПЕЦИАЛИСТОВ', 84, w('десятки'), 0, -400, { cps: 22 });
  ['👷', '🧑‍🎨', '👩‍💻', '🎭', '🎬'].forEach((e, i) => g.emo(e, 170, w('десятки') + 0.5 + i * 0.5, -520 + i * 260, 20 + (i % 2) * 100, { r: i % 2 ? 6 : -6 }));
  g.cap('КАЖДЫЙ — СВОЙ КУСОЧЕК', 64, w('кусочек') - 0.4, 0, 300, { cps: 24 });
});
B(138, D('uccut', 12), (g, t, w) => {
  g.prop(UA('drake_bust.png'), 640, t + 0.1, -380, 20, { from: [-200, 0], r: -3 });
  g.emo('🗿', 200, w('лепит'), 380, -150, { r: 8 });
  g.cap('ЛЕПКА', 130, w('лепит') + 0.1, 380, 60, { cps: 10, r: -2 });
  g.cap('ПО СКАНАМ АКТЁРОВ', 64, w('сканы'), 380, 220, { cps: 22, r: 2 });
});
B(139, 'grid', (g, t, w) => {
  g.prop(UA('drake_bust.png'), 700, t + 0.1, 380, 20, { from: [200, 0], r: 3 });
  g.cap('КОЖА', 130, w('кожу'), -420, -220, { cps: 10, r: -3 });
  g.cap('ПОРЫ', 70, w('поры'), -440, -40, { cps: 12, r: -2 });
  g.cap('ВЕСНУШКИ', 70, w('веснушки'), -300, 70, { cps: 14, r: 2 });
  g.cap('ВЕНЫ', 70, w('вены'), -440, 180, { cps: 12, r: -2 });
  g.cap('СЛОИ ОГРОМНЫХ КАРТИНОК', 54, w('слоями'), -360, 300, { cps: 28 });
});
B(140, Lt('ucstorm1', 9), (g, t, w) => {
  g.emo('💡', 220, t + 0.1, -420, -80, { r: -8 });
  g.cap('ШЕЙДЕР', 130, w('шейдерный'), 200, -150, { cps: 10, r: 2 });
  g.cap('КАК СВЕТ ВЕДЁТ СЕБЯ НА КОЖЕ', 56, w('свет'), 200, 40, { cps: 28, r: -2 });
});
B(141, 'grid', (g, t, w) => {
  g.el('', SKIN, t + 0.1, -330, 20, { upd: skinUpd, from: [-100, 100] });
  g.cap('СВЕТ ЗАХОДИТ ВНУТРЬ', 72, w('проникает'), 370, -150, { cps: 22, r: 2 });
  g.cap('РАССЕИВАЕТСЯ', 72, w('рассеивается'), 370, 20, { cps: 18, r: -2 });
  g.cap('И ВЫХОДИТ', 72, w('выходит'), 370, 190, { cps: 18, r: 2 });
});
B(142, D('uccut', 4), (g, t, w) => {
  g.cap('В РЕАЛЬНОМ ВРЕМЕНИ', 76, w('реальном'), -200, -150, { cps: 22, r: -2 });
  g.prop(PS3, 300, t + 0.3, 380, 60, { from: [200, 0] });
  g.emo('🐌', 150, w('узких'), 380, -190, { r: 8 });
  g.cap('САМОЕ УЗКОЕ МЕСТО', 76, w('узких') + 0.2, -200, 150, { cps: 22, r: 2, col: RED });
});
B(143, Lt('uccut', 13), (g, t, w) => {
  g.prop(UA('drake_bust.png'), 640, t + 0.1, -400, 20, { from: [-200, 0], r: -3 });
  g.cap('МИМИКА', 130, t + 0.3, 330, -220, { cps: 10, r: 2 });
  g.cap('BLEND SHAPES', 90, at('blend', S(144)), 330, 260, { cps: 14, r: -2 });
  g.el('', FACE('😐'), S(144), 330, 30, { shadow: false, t1: S(144) + 1.4 });
  g.el('', FACE('😮'), S(144) + 1.5, 330, 30, { shadow: false, t1: S(144) + 2.9 });
  g.el('', FACE('😠'), S(144) + 3.0, 330, 30, { shadow: false });
});
B(145, 'grid', (g, t, w) => {
  g.el('', SLIDERS(['БРОВЬ', 'УХМЫЛКА', 'УДИВЛЕНИЕ', 'ЗЛОСТЬ']), t + 0.1, -330, 20, { upd: slUpd, from: [-100, 100] });
  g.cap('ЗАРАНЕЕ ВЫЛЕПЛЕННЫЕ ЛИЦА', 56, t + 0.4, 380, -170, { cps: 26, r: 2 });
  g.cap('СМЕШИВАЕТ В РЕАЛЬНОМ ВРЕМЕНИ', 54, S(146), 380, 20, { cps: 28, r: -2 });
  g.el('', FACE('😮'), at('удивления', S(146)), 260, 230, { shadow: false });
  g.emo('➕', 90, at('злости', S(146)) - 0.2, 400, 230, {});
  g.el('', FACE('😠'), at('злости', S(146)), 540, 230, { shadow: false });
});
B(147, 'grid', (g, t, w) => {
  g.cap('ЭТО ТОЛЬКО ЛИЦО', 110, t + 0.1, 0, -400, { cps: 16, until: S(148) + 1.0 });
  g.el('', SKEL, at('скелет', S(148)), -560, 20, { upd: skUpd, from: [-100, 100] });
  g.emo('👕', 190, at('одежда', S(148)), -120, 20, { r: -8 });
  [0, 1, 2].forEach((i) => g.prop(UA('drake.png'), 360 - i * 90, at('версии', S(148)) + i * 0.4, 280 + i * 230, 120 + i * 20, { filter: `blur(${i * 2.4}px) drop-shadow(0 20px 20px rgba(0,0,0,.3))`, from: [100, 100] }));
});
B(149, 'grid', (g, t, w) => {
  g.emo('💸', 230, t + 0.1, -420, -60, { r: -8 });
  g.cap('ПОЧЕМУ ИГРЫ ТАК ДОРОГИ?', 74, t + 0.3, 260, -150, { cps: 22, r: 2 });
  g.cap('НЕ ОДНА КОМАНДА', 80, S(150), 260, 60, { cps: 20, col: RED });
});
B(151, Lt('uccut', 3), (g, t, w) => {
  [['🗿', 'МОДЕЛЛЕРЫ', -520, -130, 'моделлеры'], ['🖌️', 'ТЕКСТУРЫ', 0, -200, 'текстурам'], ['💻', 'ШЕЙДЕРЫ', 520, -130, 'шейдеров'], ['🏃', 'АНИМАТОРЫ', -520, 90, 'аниматоры'], ['🎙️', 'АКТЁРЫ', 0, 30, 'актёры'], ['🎬', 'РЕЖИССЁРЫ', 520, 90, 'режиссёры']].forEach(([e, txt, x, y, word]) => R(g, e, txt, w(word), x, y + 140));
  g.cap('И ДЛЯ МНОГИХ ПЕРСОНАЖЕЙ', 66, w('многих'), 0, -380, { cps: 24 });
});
B(152, 'grid', (g, t, w) => {
  g.prop(UA('nd_logo.png'), 120, t + 0.1, 0, -40, { t1: w('разделила') - 0.2 });
  g.cap('СТУДИЯ ВЫРОСЛА', 90, t + 0.3, 0, 140, { cps: 20, until: w('разделила') - 0.2 });
  cover(g, AS.uc3, at('uncharted', S(153)), -420, 10, 440, 440, { from: [-200, 0], r: -4 });
  g.prop(AS.tlou, 480, at('the', S(153)), 420, 10, { from: [200, 0], r: 4 });
  g.cap('ДВЕ КОМАНДЫ', 100, w('две'), 0, -400, { cps: 14 });
  g.emo('✂️', 150, w('разделила'), 0, 190, {});
});
B(154, D('ucstorm2', 12), (g, t, w) => {
  NUM(g, '24 ТБ', 'ресурсов одной Uncharted 3', w('двадцати'), 0, 0);
  g.emo('💾', 190, w('ресурсы'), -520, -190, { r: -8 });
  g.cap('ПО СООБЩЕНИЯМ', 56, w('сообщениям'), 0, 280, { cps: 20 });
});
B(155, 'grid', (g, t, w) => {
  g.emo('👥', 240, t + 0.1, -420, -60, { r: -6 });
  g.cap('СОТНИ ЛЮДЕЙ · ГОДЫ', 84, t + 0.3, 200, -150, { cps: 22, r: 2 });
  NUM(g, 'ДЕСЯТКИ МЛН $', 'стоит AAA-игра', S(156) + 1.0, 200, 120, '#2e9e57');
  g.emo('💵', 150, at('долларов', S(156)), 650, -280, {});
});

// ---------------- 3 · THE LAST OF US ----------------
B(157, 'grid', (g, t, w) => {
  cover(g, AS.uc3, t + 0.1, -460, 20, 400, 400, { from: [-200, 0], r: -4 });
  ARW(g, w('использовала'), 0, 20);
  g.prop(AS.tlou, 470, w('the'), 460, 30, { from: [200, 0], r: 4 });
  g.cap('ЗНАНИЯ И ПРИЁМЫ', 80, w('знания'), 0, -350, { cps: 22 });
});
B(158, Lt('tlbeauty', 30), (g, t, w) => {
  g.prop(TA('tlou_logo.png'), 200, t + 0.1, 0, -150, { from: [0, -160] });
  g.cap('НАСТОЯЩЕЕ БЕЗУМИЕ', 110, w('безумие'), 0, 130, { cps: 18 });
  g.emo('🤯', 170, w('безумие') + 0.4, 600, 300, {});
});
B(159, 'grid', (g, t, w) => {
  cc(g, 'tltrailer', t + 0.1, -330, -20, 820, { r: -3, off: 30 });
  R(g, '🍂', 'ВРЕМЕНА ГОДА', w('временами'), 480, -280);
  R(g, '🏃', 'ЖИВЫЕ ДВИЖЕНИЯ', w('движения'), 480, -120);
  R(g, '🤖', 'ИИ ВРАГОВ', w('враги'), 480, 40);
  R(g, '🔊', 'ДИНАМИЧНЫЙ ЗВУК', w('звук'), 480, 200);
});
B(160, 'grid', (g, t, w) => {
  g.el('', MEMBOX('СИСТЕМА', 'ГРАФИКА'), t + 0.1, 0, 20, { from: [0, 160] });
  X(g, S(161) + 0.2, 0, 20, 160);
  g.cap('НЕЛЬЗЯ ОБЪЕДИНИТЬ', 84, S(161), 0, -310, { cps: 22, until: S(162) });
  g.cap('ГРАФИКЕ НЕ ХВАТАЕТ — НЕ ЗАНЯТЬ', 64, S(162), 0, 320, { cps: 28, col: RED });
});
B(163, D('tlen1', 6), (g, t, w) => {
  g.emo('🤪', 220, w('сумасшедшие'), -460, -60, { r: -8 });
  g.cap('«ВЫ СУМАСШЕДШИЕ»', 96, w('сумасшедшие') + 0.2, 220, -120, { cps: 20, r: 2 });
  g.cap('«ЭТО НЕВОЗМОЖНО»', 96, w('невозможно'), 220, 100, { cps: 20, r: -2, col: '#ff8a8a' });
});
B(164, 'grid', (g, t, w) => {
  g.prop(PS3, 340, t + 0.1, -380, 40, { from: [-200, 0] });
  NUM(g, '7 ЛЕТ', 'консоли', w('семь'), 380, -80);
  g.emo('🍋', 170, w('выжимать'), 380, 210, { upd: squeeze(at('выжимать', S(164))) });
});
B(165, 'grid', (g, t, w) => {
  g.emo('😎', 230, t + 0.1, -480, -60, {});
  g.cap('А NAUGHTY DOG ВСЁ РАВНО', 76, t + 0.3, 200, -330, { cps: 24, until: S(166) + 1.5 });
  g.prop(TA('ps4.png'), 250, at('поколение', S(166)), 160, 40, { from: [0, 200], r: -3 });
  g.prop(TA('xone.png'), 220, at('поколение', S(166)) + 0.3, 520, 60, { from: [0, 200], r: 3 });
  g.cap('ВСЕ УХОДЯТ НА НОВЫЕ КОНСОЛИ', 60, at('уходили', S(166)), 300, -200, { cps: 28 });
  g.emo('⌛', 150, S(167), 340, 300, {}); g.cap('ПУСТАЯ ТРАТА ВРЕМЕНИ?', 60, S(167) + 0.2, -260, 330, { cps: 26 });
});
B(168, D('ucjungle', 20), (g, t, w) => {
  g.emo('⭐', 190, t + 0.1, -520, -200, {});
  g.cap('ПРЕИМУЩЕСТВО', 100, t + 0.2, 0, -340, { cps: 18 });
  cover(g, UA('uc2_cover.png'), S(169), -250, 100, 360, 414, { from: [-200, 0], r: -4 });
  BIG(g, '2009', at('2009', S(169)), 300, 100, 170);
});
B(170, 'grid', (g, t, w) => {
  g.prop(PS3, 260, t + 0.1, 0, -60, { t1: w('движок') - 0.3 });
  g.cap('ПОД PS3 — КОШМАР', 90, w('кошмар'), 0, 160, { cps: 20, col: RED, until: w('движок') - 0.3 });
  TL(g, 'ДВИЖОК UNCHARTED 2', w('движок'), -430, -40, { r: -3 });
  ARW(g, w('доработать'), 0, -40);
  g.prop(AS.tlou, 420, w('the'), 450, -20, { from: [200, 0], r: 3 });
  g.cap('ФОРА НА СТАРТЕ', 84, S(171), 0, 300, { cps: 20, col: '#2e9e57' });
});
B(172, 'grid', (g, t, w) => {
  g.emo('💥', 200, t + 0.1, -540, -240, {});
  g.cap('ПЛАН РУХНУЛ', 110, w('рухнул'), -200, -330, { cps: 16, col: RED });
  cc(g, 'tlbeauty', S(173), 120, 60, 860, { r: 2, off: 40 });
  g.cap('ТЁМНЫЙ МИР', 84, at('тёмный', S(173)), -560, 330, { cps: 18 });
  g.emo('🌿', 150, at('природа', S(173)), 620, 340, {});
});
B(174, 'grid', (g, t, w) => {
  cc(g, 'ucjungle', t + 0.1, -440, -80, 620, { r: -4, off: 4 });
  g.cap('ЯРКИЙ ЭКШЕН', 66, w('яркого'), -440, 160, { cps: 22 });
  cc(g, 'tlflash', w('тёмный'), 440, -80, 620, { r: 4, off: 2 });
  g.cap('ТЁМНЫЙ СТИЛЬ', 66, w('тёмный') + 0.2, 440, 160, { cps: 22 });
  X(g, w('поддерживал'), 440, -80, 220);
  g.emo('🗑️', 160, S(175), -440, 300, {});
  g.cap('НОВЫЙ ДВИЖОК С НУЛЯ', 70, S(175) + 0.3, 200, 330, { cps: 24, col: RED });
}, { z: 0.95 });
B(176, D('tlen1', 10), (g, t, w) => {
  cc(g, 'tlen1', t + 0.1, -330, 0, 780, { r: -3, fps: 6 });
  NUM(g, '5–10 FPS', 'месяцами', w('пяти'), 450, -60, RED);
  g.emo('🐌', 160, w('кадрах'), 450, 220, {});
});
B(177, 'grid', (g, t, w) => {
  g.cap('БОЛЬШЕ ДЕТАЛЕЙ →', 80, w('деталей'), 0, -330, { cps: 22 });
  g.el('', GROW('КАЖДАЯ МЕХАНИКА', '#4aa8ff'), w('механику'), 0, -60, { upd: (tt, d) => { d.querySelector('.gb').style.width = (100 - 70 * E.inOut(P(tt, at('короче', S(177)), 1.6))).toFixed(0) + '%'; } });
  g.cap('КОРОЧЕ И БЫСТРЕЕ', 80, w('короче'), 0, 200, { cps: 22, col: '#2e9e57' });
});
B(178, 'grid', (g, t, w) => {
  NUM(g, '3 мс', 'было', w('три'), -430, 0, RED);
  ARW(g, w('переписывали'), 0, 0);
  NUM(g, '0,3 мс', 'стало', w('0'), 430, 0, '#2e9e57');
  g.emo('✍️', 150, w('переписывали'), 0, -260, {});
});
B(179, 'grid', (g, t, w) => {
  g.el('', GROW('БОРЬБА С ЖЕЛЕЗОМ', RED), t + 0.1, 0, -120, { upd: growUpd(t + 0.6, 2, 0.85) });
  g.el('', GROW('СОЗДАНИЕ УРОВНЕЙ', '#7fe39a'), w('уровней'), 0, 80, { upd: growUpd(at('уровней', S(179)) + 0.2, 1.4, 0.35) });
  g.emo('⚔️', 170, t + 0.6, 560, -260, {});
});
B(180, D('tlflash', 4), (g, t, w) => {
  g.cap('ТЕПЕРЬ ПРО ДИСК', 100, t + 0.1, 0, -360, { cps: 18 });
  g.el('', DISC, t + 0.3, -300, 40, { from: [-200, 0], s: 0.8, upd: (tt, d) => discUpd(tt > at('быстрее', S(181)) ? 520 : 160)(tt, d) });
  g.cap('БЫСТРЕЕ КРУТИТСЯ — БОЛЬШЕ ДАННЫХ', 56, at('быстрее', S(181)), 340, 40, { cps: 30 });
});
B(182, 'grid', (g, t, w) => {
  g.el('', DISC, t + 0.1, -320, 0, { from: [-200, 0], s: 0.8, upd: discUpd(40) });
  g.emo('🐢', 200, w('медленно'), 380, -60, {});
  g.cap('BLU-RAY МЕДЛЕННЫЙ', 80, w('медленно') + 0.2, 380, 160, { cps: 22 });
});
B(183, 'grid', (g, t, w) => {
  g.el('', DISC, t + 0.1, -560, -60, { from: [-200, 0], s: 0.55, upd: (tt, d) => discUpd(tt > at('паузу', S(183)) ? 0 : 180)(tt, d) });
  ARW(g, w('загружает'), -260, -60, { s: 0.7 });
  g.prop(RAM, 220, w('память'), 0, -60, { r: 4 });
  g.emo('😴', 150, w('паузу'), 330, -220, {}); g.cap('ПАУЗА', 80, w('паузу') + 0.1, 330, -60, { cps: 14 });
  g.el('', LOADING, S(184), 200, 220, { s: 0.7, upd: loadUpd(S(184), 4, 1) });
});
B(185, D('tlbeauty', 60), (g, t, w) => {
  g.el('', LOADING, t + 0.1, -300, -60, { s: 0.75 });
  X(g, w('ни'), -300, -60, 280);
  g.cap('НИ ОДНОЙ ЗАГРУЗКИ', 84, w('загрузки') - 0.3, 360, -230, { cps: 22, r: 2 });
  g.el('', DISC, S(186), 380, 120, { from: [200, 0], s: 0.6, upd: discUpd(900) });
  g.emo('🔥', 140, at('максимальной', S(186)), 620, 300, {});
  g.cap('БЕЗ ОТДЫХА', 76, at('отдыхать', S(186)), -300, 260, { cps: 18, col: '#ffb000' });
});
B(187, 'grid', (g, t, w) => {
  g.emo('📦', 230, t + 0.1, -500, -40, { t1: w('разбивая') });
  g.emo('🗜️', 150, w('сжимая'), -500, -260, {});
  ['📦', '📦', '📦', '📦'].forEach((e, i) => g.emo(e, 100, w('разбивая') + 0.1 + i * 0.12, -620 + (i % 2) * 220, -120 + Math.floor(i / 2) * 150, {}));
  g.cap('СЖАТИЕ + МАЛЕНЬКИЕ ФАЙЛЫ', 70, w('маленькие'), 300, -60, { cps: 26, r: 2 });
  g.emo('✅', 150, w('обошли'), 300, 180, {});
});
B(188, D('tlen1', 14), (g, t, w) => {
  g.cap('НОВЫЕ ПРЕПЯТСТВИЯ', 90, t + 0.1, 0, -380, { cps: 20, until: S(189) });
  cc(g, 'tlen1', S(189), -330, 0, 780, { r: -3, off: 4 });
  R(g, '🐺', 'УМНЫЕ ОХОТНИКИ', at('охотники', S(189)), 480, -100, { from: [200, 0] });
  R(g, '🤖', 'А НЕ СЛЕПЫЕ РОБОТЫ', at('слепые', S(189)), 480, 80, { from: [200, 0] });
  g.cap('НОВЫЙ ИИ', 90, at('изобрести', S(189)), 480, 280, { cps: 14, col: '#ffb000' });
});
B(190, 'grid', (g, t, w) => {
  cc(g, 'ucjungle', t + 0.1, -440, -40, 620, { r: -4, off: 9 });
  g.emo('👁️', 150, w('знали'), -440, 230, {}); g.cap('ЗНАЛИ, ГДЕ ВЫ', 64, w('знали') + 0.1, -440, 340, { cps: 22 });
  cc(g, 'tlen2', S(191), 440, -40, 620, { r: 4, off: 3 });
  g.emo('🔍', 150, at('искать', S(191)), 440, 230, {}); g.cap('ИЩУТ', 64, at('искать', S(191)) + 0.1, 440, 340, { cps: 14 });
}, { z: 0.95 });
B(192, 'grid', (g, t, w) => {
  g.el('', `<div style="width:900px;height:506px;border-radius:30px;background:#fff;overflow:hidden">${DOTS}</div>`, w('сеткой'), 0, 20, { from: [0, 160], upd: (tt, d) => d.querySelectorAll('circle').forEach((c, i) => c.setAttribute('opacity', tt > at('сеткой', S(192)) + i * 0.012 ? 1 : 0)) });
  g.cap('НЕВИДИМАЯ СЕТКА ТОЧЕК', 80, w('невидимой'), 0, -340, { cps: 24 });
});
B(193, D('tlen2', 8), (g, t, w) => {
  g.cap('3 УРОВНЯ', 110, t + 0.1, 0, -380, { cps: 14 });
  R(g, '😴', 'НЕ ЗНАЕТ', w('знает'), -520, 20);
  R(g, '🔍', 'ИЩЕТ', w('ищет'), 0, 20);
  R(g, '⚔️', 'СРАЖАЕТСЯ', w('сражается'), 520, 20);
});
B(194, 'grid', (g, t, w) => {
  g.el('', PLAN, t + 0.1, 0, 40, { from: [0, 160], s: 0.95, upd: plan2(at('звук', S(195)), at('укрытия', S(195)), at('выбирает', S(196)), at('подойти', S(196))) });
  g.cap('МЕТКА: ЗДЕСЬ ПОТЕРЯЛ', 60, w('метку'), -520, -360, { cps: 26, until: S(195) });
  g.cap('ШУМ!', 80, at('звук', S(195)), 400, -360, { cps: 10, col: RED, until: S(196) });
  g.cap('3–4 БЛИЖАЙШИХ УКРЫТИЯ', 60, at('укрытия', S(195)), -420, -360, { cps: 26, until: S(196) });
  g.cap('ПОДОЙТИ И ПРОВЕРИТЬ', 70, at('подойти', S(196)), 0, -360, { cps: 24 });
});
B(197, 'grid', (g, t, w) => {
  cc(g, 'tlen2', t + 0.1, -330, -20, 780, { r: -3, off: 9 });
  R(g, '💬', 'ПЕРЕГОВАРИВАЮТСЯ', w('переговаривались'), 480, -160);
  R(g, '📍', 'ДЕЛЯТСЯ ВАШИМ МЕСТОМ', w('делились'), 480, 0);
  R(g, '↔️', 'ОБХОДЯТ С ФЛАНГОВ', w('обходили'), 480, 160);
});
B(198, 'grid', (g, t, w) => {
  g.el('', ENEM, t + 0.1, 0, 60, { from: [0, 160], upd: enemUpd(S(200), at('выводите', S(202))) });
  NUM(g, '12 ВРАГОВ', 'в одной области', w('двенадцать'), 0, -330);
  g.emo('🎭', 140, S(199), 700, -330, {});
  g.cap('8 С «МОЗГАМИ»', 76, S(200) + 0.4, -420, 380, { cps: 20, col: '#2e9e57', until: at('выводите', S(202)) - 0.2 });
  g.cap('4 ЖДУТ ЗА КАДРОМ', 76, S(201), 420, 380, { cps: 20, col: '#7a7d85', until: at('выводите', S(202)) - 0.2 });
  g.cap('ВЫБЫЛ — ВХОДИТ ЗАМЕНА', 76, at('выводите', S(202)), 0, 380, { cps: 22, col: RED });
}, { keys: [[S(199), 0.4, 0, 0, 0.95], [S(200), 0.4, 0, 40, 0.9]] });
B(203, D('tlen1', 20), (g, t) => {
  cc(g, 'tlen1', t + 0.1, 0, -40, 900, { off: 12 });
  g.cap('КАЖЕТСЯ — ЦЕЛАЯ АРМИЯ', 90, t + 0.4, 0, 340, { cps: 22 });
});
B(204, 'grid', (g, t, w) => {
  cc(g, 'tlflash', t + 0.1, -330, 0, 820, { r: -3, off: 1 });
  g.emo('💡', 170, t + 0.3, 460, -260, {}); g.cap('ОСВЕЩЕНИЕ', 90, t + 0.4, 460, -80, { cps: 16 });
  g.emo('🌑', 150, S(205), 460, 120, {}); g.cap('ОЧЕНЬ ТЁМНАЯ ИГРА', 60, S(205) + 0.2, 460, 280, { cps: 24 });
});
B(206, D('tlflash', 8), (g, t, w) => {
  g.emo('🤔', 200, t + 0.1, -460, -60, {});
  g.cap('ТЕМНОТА — ЭТО ПРОЩЕ?', 90, t + 0.3, 200, -120, { cps: 22 });
  g.cap('НАОБОРОТ!', 130, S(207), 200, 110, { cps: 14, col: RED });
});
B(208, 'grid', (g, t, w) => {
  g.el('', WALL(true), t + 0.1, -330, 0, { upd: beamUpd(0), from: [-100, 100] });
  g.emo('🔦', 170, w('фонаря'), -330, 300, {});
  g.cap('КАЖДАЯ ТЕНЬ ЗАНОВО', 76, w('тень'), 420, -160, { cps: 22, r: 2 });
  NUM(g, 'ДЕСЯТКИ', 'раз в секунду', w('десятки'), 420, 80);
  g.emo('💥', 170, S(209), 680, -320, {});
  g.cap('КОНСОЛЬ ПАДАЛА', 70, S(209) + 0.2, 420, 330, { cps: 22, col: RED });
});
B(210, 'grid', (g, t, w) => {
  g.el('', CELLDIA, t + 0.1, 0, 40, { from: [0, 160], upd: cell2(S(211), S(212), at('разделили', S(213))) });
  g.cap('ВНУТРИ CELL', 90, t + 0.3, 0, -340, { cps: 18, until: S(211) });
  g.cap('PPE ОДИН — ПЕРЕГРУЗ', 80, S(211) + 1.0, 0, -340, { cps: 22, col: RED, until: S(212) });
  g.cap('SPE — ПОМОЩНИКИ', 80, S(212), 0, -340, { cps: 22, col: '#2e9e57', until: at('разделили', S(213)) });
  g.cap('ТЕНИ ДЕЛЯТ МЕЖДУ SPE', 76, at('разделили', S(213)), 0, -340, { cps: 24 });
  g.emo('✅', 150, S(214), 560, 330, {});
}, { keys: [[S(211), 0.4, -230, 40, 1.15], [S(212), 0.4, 230, 40, 1.1], [at('разделили', S(213)), 0.45, 0, 40, 0.98]] });
B(215, 'grid', (g, t, w) => {
  cc(g, 'tlbeauty', t + 0.1, -330, -20, 780, { r: -3, off: 80 });
  g.cap('ДЕТАЛИ', 110, t + 0.2, 480, -330, { cps: 12 });
  R(g, '🍄', 'ПЛЕСЕНЬ', at('плесенью', S(216)), 480, -150);
  R(g, '🎨', 'ОБЛУПИВШАЯСЯ КРАСКА', at('облупившейся', S(216)), 480, 10);
  R(g, '💧', 'ПЯТНА ОТ ВОДЫ', at('пятнами', S(216)), 480, 170);
});
B(217, 'grid', (g, t, w) => {
  g.el('', WALL(true), t + 0.1, -330, 0, { from: [-100, 100] });
  g.emo('🌿', 170, w('мох'), -330, -280, {});
  g.cap('ЗАБРОШЕНО ДЕСЯТИЛЕТИЯМИ', 64, w('десятилетиями'), 420, -180, { cps: 26 });
  g.emo('👀', 170, S(218), 420, 30, {});
  g.cap('ЗАМЕЧАЕШЬ КРАЕМ ГЛАЗА', 64, at('краем', S(218)), 420, 230, { cps: 26 });
});
B(219, D('tltrailer', 60), (g, t, w) => {
  cc(g, 'tltrailer', t + 0.1, 0, -40, 900, { off: 60 });
  g.cap('ПОЭТОМУ ИГРА — КАК НАСТОЯЩАЯ', 76, w('реальной') - 0.5, 0, 350, { cps: 26 });
});
B(220, 'grid', (g, t, w) => {
  g.emo('🔦', 170, t + 0.1, 0, -360, {});
  g.el('', WALL(false), S(221), -440, 40, { upd: beamUpd(1), from: [-100, 100], s: 0.85 });
  g.cap('ГЛАДКО = ФАЛЬШИВО', 64, at('скучно', S(221)), -440, 330, { cps: 22, col: RED });
  g.el('', WALL(true), S(222), 440, 40, { upd: beamUpd(2), from: [100, 100], s: 0.85 });
  g.cap('ФАКТУРА = НАПРЯЖЕНИЕ', 64, at('фактуру', S(222)), 440, 330, { cps: 24, col: '#2e9e57' });
}, { z: 0.95 });
B(223, D('tlflash', 10), (g, t, w) => {
  NUM(g, '30%', 'темноты', w('тридцать'), -330, 0);
  g.cap('ВАЖНО ТО, ЧТО В СВЕТЕ', 76, w('детали'), 330, 0, { cps: 24 });
  g.emo('🔦', 160, w('свет'), 330, 200, {});
});
B(224, 'grid', (g, t, w) => {
  cc(g, 'tlen2', t + 0.1, -330, -20, 800, { r: -3, off: 14 });
  g.emo('👊', 170, t + 0.3, 480, -220, {});
  g.cap('ДИНАМИЧНЫЕ ДРАКИ', 80, t + 0.4, 480, -40, { cps: 22 });
  g.cap('БЕСЧИСЛЕННЫЕ ВАРИАНТЫ', 60, w('бесчисленное'), 480, 120, { cps: 26 });
});
B(225, 'grid', (g, t, w) => {
  g.emo('🧱', 190, w('стене'), -520, -60, {});
  R(g, '📐', 'УГОЛ УДАРА', w('угол'), 330, -220);
  R(g, '🧱', 'ТИП ПОВЕРХНОСТИ', w('поверхности'), 330, -60);
  R(g, '⚙️', 'АНИМАЦИЯ + ФИЗИКА', w('смешивает'), 330, 100);
  g.cap('НЕПРЕДСКАЗУЕМО', 90, S(226), 0, 330, { cps: 18, col: '#ffb000' });
});
B(227, Lt('tlellie', 5), (g, t, w) => {
  g.prop(TA('ellie.png'), 760, t + 0.1, -400, 60, { from: [-200, 0] });
  g.cap('ИИ ЭЛЛИ', 120, t + 0.3, 300, -300, { cps: 14 });
  R(g, '😤', 'БЕСПОЛЕЗНА — БЕСИТ', at('бесполезен', S(228)), 330, -60);
  R(g, '😐', 'ИДЕАЛЬНА — СКУЧНО', at('идеален', S(228)), 330, 120);
});
B(229, 'grid', (g, t, w) => {
  cc(g, 'tlellie', t + 0.1, -330, -20, 800, { r: -3, off: 2 });
  g.emo('👁️', 160, w('отслеживал'), 460, -230, {}); g.cap('СЛЕДИТ ЗА ВРАГАМИ', 64, w('отслеживал') + 0.2, 460, -60, { cps: 24 });
  g.emo('🫣', 160, at('укрытие', S(230)), 460, 130, {}); g.cap('ПРЯЧЕТСЯ', 70, at('укрытие', S(230)) + 0.2, 460, 290, { cps: 18 });
});
B(231, D('tlellie', 12), (g, t, w) => {
  cc(g, 'tlellie', t + 0.1, -280, -20, 860, { r: -2, off: 10 });
  g.cap('НЕ ИДЕАЛЬНА', 90, w('идеален'), 480, -200, { cps: 18 });
  g.emo('🏃‍♀️', 180, w('выбегала'), 500, 50, {});
});
B(232, 'grid', (g, t, w) => {
  g.prop(TA('ellie.png'), 720, t + 0.1, -440, 60, { from: [-200, 0], upd: (tt, d) => { if (tt > at('игнорировать', S(233))) d.style.opacity = (0.35 + 0.2 * Math.sin(tt * 4)).toFixed(2); } });
  g.cap('ПОДКРУТИЛИ ПРАВИЛА', 84, w('подкрутить'), 300, -300, { cps: 22 });
  g.emo('👻', 200, at('игнорировать', S(233)), 300, -60, {});
  g.cap('ВРАГИ ЕЁ НЕ ВИДЯТ', 76, at('игнорировать', S(233)) + 0.2, 300, 150, { cps: 22 });
  g.cap('ИНАЧЕ — НЕЧЕСТНЫЙ GAME OVER', 60, S(234), 300, 320, { cps: 28, col: RED });
});

// ---------------- 4 · ГТА 5 ----------------
B(235, Lt('tlbeauty', 90), (g, t) => {
  g.prop(TA('joel.png'), 700, t + 0.1, -420, 80, { from: [-200, 0] });
  g.prop(TA('tlou_logo.png'), 170, t + 0.3, 330, -150, {});
  g.emo('✅', 160, t + 0.8, 330, 120, {});
  g.cap('ОГРАНИЧЕНИЯ ОБОЙДЕНЫ', 70, t + 0.6, 330, 300, { cps: 24 });
});
B(236, DI(G5A('industrial_dusk.jpg')), (g, t, w) => {
  g.prop(GA('rockstar.png'), 170, t + 0.1, 0, -330, {});
  g.prop(AS.g4logo, 260, w('гта'), -480, 40, { from: [-200, 0], r: -4 });
  ARW(g, w('работу'), 0, 40);
  g.prop(G5A('gta5_logo.png'), 380, w('гта', 1), 460, 40, { from: [200, 0], r: 3 });
  g.cap('СНОВА НА PS3', 90, w('ps3'), 0, 330, { cps: 18 });
});
B(237, 'grid', (g, t, w) => {
  g.prop(G5A('gta5_logo.png'), 300, t + 0.1, 0, 40, { t1: S(238) - 0.2 });
  g.cap('НАСТОЯЩЕЕ БЕЗУМИЕ', 90, t + 0.3, 0, -420, { cps: 22, until: S(238) });
  cc(g, 'g5city', S(238), -500, -100, 600, { r: -4, off: 2 }); g.cap('ГОРОД', 56, at('город', S(238)), -500, 130, { cps: 16 });
  cc(g, 'g5mount', at('горы', S(238)), 40, 80, 600, { r: 3, z: 2, off: 3 }); g.cap('ГОРЫ', 56, at('горы', S(238)) + 0.2, 40, 310, { cps: 14 });
  cc(g, 'g5beach', at('океан', S(238)), 540, -120, 560, { r: -2, z: 3, off: 6 }); g.cap('ОКЕАН', 56, at('океан', S(238)) + 0.2, 540, 100, { cps: 14 });
  g.emo('🦌', 160, at('животные', S(238)), 600, 300, {});
}, { z: 0.9, keys: [[S(238), 0.35, -500, -60, 1.15], [at('горы', S(238)), 0.35, 40, 80, 1.15], [at('океан', S(238)), 0.35, 540, -80, 1.15], [at('животные', S(238)), 0.45, 0, 0, 0.85]] });
B(239, 'grid', (g, t, w) => {
  g.cap('УСТАРЕВШЕЕ ЖЕЛЕЗО', 84, w('устаревшим'), 0, -380, { cps: 22, until: S(240) });
  g.prop(PS3, 260, t + 0.1, -560, 60, { from: [-200, 0] });
  g.emo('🦕', 150, t + 0.6, -560, -160, {});
  BIG(g, '2006', at('2006', S(240)), -240, 60, 150);
  ARW(g, at('гта', S(240)), 30, 60, { s: 0.8 });
  BIG(g, '2013', at('2013', S(240)), 300, 60, 150);
  NUM(g, '7 ЛЕТ', 'разницы', at('семь', S(240)), 0, 300, RED);
});
B(241, D('g5night', 8), (g, t, w) => {
  g.prop(AS.gta5, 520, t + 0.1, -420, 40, { from: [-200, 0], r: -4 });
  g.emo('🏆', 160, w('продаваемых'), -100, -280, {});
  g.prop(RAM, 260, w('256'), 400, -160, { r: 5 });
  g.cap('256 + 256 МБ', 110, w('256'), 400, 100, { cps: 16 });
});
B(242, 'grid', (g, t) => {
  g.emo('❓', 220, t + 0.1, 0, -60, {});
  g.cap('КАК ЭТО ВОЗМОЖНО?', 110, t + 0.2, 0, 190, { cps: 20 });
});
const wp1 = (t0) => (t) => { const k = clamp((t - t0) / 20); const x = lerp(1.2, 10.6, k), y = 3.5 + Math.sin(k * 6.2) * 1.8; return [x, y, 1, Math.cos(k * 6.2) * 0.6]; };
B(243, 'grid', (g, t, w) => {
  g.el('', MAPG(12, 7, 66), t + 0.1, 0, 70, { from: [0, 160], upd: mapUpd(12, 7, 66, wp1(t + 0.5), 2.2) });
  g.cap('ВСЕЙ КАРТЫ В ПАМЯТИ НЕТ', 70, t + 0.3, 0, -350, { cps: 26, until: S(244) });
  g.cap('МИР СОБИРАЕТСЯ ВОКРУГ ВАС', 70, S(244), 0, -350, { cps: 26, until: S(245) });
  g.cap('🟩 ПОДТЯГИВАЕТ НУЖНОЕ', 70, S(245), 0, -350, { cps: 26, until: S(246) });
  g.cap('ПРОШЛИ — ВЫГРУЖЕНО', 70, S(246), 0, -350, { cps: 26, until: S(247) });
  g.cap('А ВЫ НЕ ЗАМЕЧАЕТЕ', 80, S(247), 0, -350, { cps: 22 });
});
B(248, 'grid', (g, t, w) => {
  PL(g, 'PPE — БОСС', t + 0.1, -430, -200, '#2a2a2c', '#ffb000', { s: 1.2 });
  g.el('', SPUS(6), t + 0.4, 300, -200, { from: [200, 0], s: 0.8, upd: spuUpd((tt, i) => [tt > S(249) ? (fr(tt * 2 + i * 0.3) < 0.5 ? '#ffb000' : '#7fe39a') : '#7fe39a', 1, 'SPU']) });
  cc(g, 'g5night', S(249), -300, 160, 560, { r: -3, off: 3 });
  g.emo('🎞️', 130, at('анимаций', S(249)), 240, 120, {}); g.emo('🔊', 130, at('звука', S(249)), 420, 120, {});
  ARW(g, at('результаты', S(249)), 260, 290, { s: 0.6 });
  CH(g, 'RSX', 'видеочип', at('графический', S(249)), 560, 220, { s: 0.7 });
});
B(250, D('g5gas', 6), (g, t, w) => {
  g.el('', DISC, t + 0.1, -330, 0, { from: [-200, 0], s: 0.75, upd: discUpd(40) });
  g.emo('🐢', 170, t + 0.4, -330, -280, {});
  g.cap('СНОВА ДИСК', 100, t + 0.3, 330, -100, { cps: 18 });
  g.cap('ОГРОМНЫЙ МИР', 80, w('огромного'), 330, 100, { cps: 20 });
  g.cap('РАЗДЕЛИЛИ РАБОТУ', 70, at('поделили', S(251)), 330, 260, { cps: 22, col: '#ffb000' });
});
B(252, 'grid', (g, t, w) => {
  g.prop(G5A('hdd.png'), 280, t + 0.1, -500, -150, { from: [-200, 0], r: -5 });
  R(g, '🏠', 'МОДЕЛИ И ТЕКСТУРЫ → HDD', w('тяжёлые'), 170, -150);
  g.el('', DISC, w('мелкие'), -500, 180, { from: [-200, 0], s: 0.5, upd: discUpd(120) });
  R(g, '🔊', 'ЗВУКИ И АНИМАЦИИ → BLU-RAY', w('мелкие') + 0.2, 170, 180);
});
B(253, 'grid', (g, t, w) => {
  g.el('width:460px;height:360px', bucketTaps, t + 0.1, -250, 40, { from: [0, 160], s: 1.5, upd: bucketUpd(t + 0.3) });
  g.cap('ДВА КРАНА', 100, w('двух'), 470, -100, { cps: 14 });
  g.cap('ОДИН СЛИШКОМ СЛАБЫЙ', 64, w('слабый'), 470, 80, { cps: 24 });
});
B(254, D('g5switch', 20), (g, t, w) => {
  g.prop(G5A('hdd.png'), 260, t + 0.1, -460, -120, { r: -5 });
  NUM(g, '8 ГБ', 'обязательная установка', w('восемь'), 260, -120);
  g.el('', LOADING.replace('ЗАГРУЗКА...', 'УСТАНОВКА...'), w('установка'), 0, 230, { s: 0.75, upd: loadUpd(at('установка', S(254)), 4, 1) });
});
B(255, 'grid', (g, t, w) => {
  g.cap('ПАМЯТЬ — ПО КОРОБКАМ', 84, t + 0.2, 0, -390, { cps: 22 });
  g.el('', BOX('🚗', 'МАШИНЫ'), at('машин', S(256)), -440, 40, { from: [0, 200], r: -3 });
  g.el('', BOX('🧍', 'ЛЮДИ'), at('людей', S(256)), 0, 40, { from: [0, 200], r: 2 });
  g.el('', BOX('🏢', 'ЗДАНИЯ'), at('зданий', S(256)), 440, 40, { from: [0, 200], r: 3, upd: flyAway(at('выбрасывается', S(257))) });
  g.emo('🗑️', 160, at('выбрасывается', S(257)), 560, 330, {});
});
B(258, 'grid', (g, t, w) => {
  g.cap('УРОВНИ ДЕТАЛИЗАЦИИ', 90, t + 0.2, 0, -390, { cps: 22 });
  g.el('', `<div style="width:110px;height:90px;background:#c9ccd2;border-radius:6px"></div>`, at('коробка', S(259)), -520, 60, { from: [0, 160] });
  g.cap('ВДАЛИ — КОРОБКА', 56, at('коробка', S(259)) + 0.2, -520, 220, { cps: 24 });
  g.emo('🏠', 170, at('ближе', S(260)), -40, 40, {});
  g.emo('🏘️', 250, at('подробнее', S(260)), 470, 30, {});
  g.cap('БЛИЖЕ — ПОДРОБНЕЕ', 56, at('подробнее', S(260)) + 0.2, 260, 230, { cps: 24 });
});
B(261, LI(G5A('los_santos_haze.jpg')), (g, t, w) => {
  g.prop(G5A('franklin.png'), 700, w('переключаться'), -520, 120, { from: [-240, 0], z: 1 });
  g.prop(G5A('michael.png'), 680, w('переключаться') + 0.15, 0, 100, { from: [0, 200], z: 2 });
  g.prop(G5A('trevor.png'), 720, w('переключаться') + 0.3, 520, 110, { from: [240, 0], z: 1 });
  g.cap('СМЕНА ГЕРОЕВ', 100, t + 0.3, 0, -400, { cps: 18, until: S(262) });
  g.cap('КАМЕРА В НЕБО — И ВНИЗ', 80, S(262), 0, -400, { cps: 24 });
});
B(263, 'grid', (g, t, w) => {
  cc(g, 'g5switch', t + 0.1, -420, -40, 680, { r: -3, off: 10, speed: 0.6 });
  g.cap('НА PS3 — КРАЙНЕ СЛОЖНО', 70, t + 0.3, 0, -400, { cps: 24 });
  R(g, '📦', 'УПАКОВАТЬ ТЕКУЩЕЕ', S(264), 420, -160);
  g.cap('машины · люди · звуки · здания', 44, at('машины', S(264)), 420, -40, { cps: 34 });
  R(g, '📥', 'ЗАГРУЗИТЬ НОВОЕ', S(265), 420, 90);
  R(g, '👕', 'ДАННЫЕ ПЕРСОНАЖЕЙ', S(266), 420, 240);
}, { z: 0.95 });
B(267, D('g5switch', 30), (g, t, w) => {
  g.emo('🧠', 200, t + 0.1, -460, -100, {});
  g.cap('МИР ЗАПОМИНАЕТ', 90, t + 0.3, 240, -160, { cps: 20 });
  g.emo('💥', 150, w('хаос'), 240, 40, {});
  g.cap('ХАОС ОСТАЁТСЯ НА МЕСТЕ', 64, w('хаос') + 0.2, 240, 200, { cps: 24 });
});
B(268, 'grid', (g, t, w) => {
  cc(g, 'g5switch', t + 0.1, -330, -40, 760, { r: -3, off: 20, speed: 0.7 });
  g.el('width:300px;height:300px', CLOCK, w('несколько'), 450, -150, { upd: (tt, d) => clockUpd(tt * 8, d) });
  g.cap('ЗА ПАРУ СЕКУНД', 70, w('секунд'), 450, 60, { cps: 22 });
  g.el('', LOADING, S(270), 400, 250, { s: 0.6, z: 8 });
  X(g, S(270) + 0.4, 400, 250, 200);
  g.cap('СКРЫТЫЙ ЭКРАН ЗАГРУЗКИ', 66, S(270) + 0.2, -330, 330, { cps: 26, col: RED });
});
B(271, 'grid', (g, t, w) => {
  cc(g, 'g5city', t + 0.1, -330, -40, 780, { r: -3, off: 6 });
  ['🚗', '🚶', '💬', '🐟'].forEach((e, i) => g.emo(e, 130, [w('трафик'), w('люди'), w('разговоры'), w('океане')][i], 330 + (i % 2) * 220, -260 + Math.floor(i / 2) * 180, {}));
  g.emo('♻️', 160, S(272), 440, 140, {});
  g.cap('ОДНИ И ТЕ ЖЕ МОДЕЛИ', 64, S(272) + 0.2, 440, 300, { cps: 24 });
});
B(273, D('g5mount', 10), (g, t, w) => {
  cc(g, 'g5mount', t + 0.1, -330, -20, 800, { r: -3, off: 10 });
  R(g, '🌫️', 'ДЫМКА ВДАЛИ', w('дымка'), 450, -180);
  R(g, '💡', 'ОСВЕЩЕНИЕ', w('освещение'), 450, -20);
  R(g, '🌅', 'ГОРИЗОНТ', w('горизонта'), 450, 140);
  g.cap('ПРЯЧЕТ ОГРАНИЧЕНИЯ', 70, w('скрыть'), 0, 380, { cps: 22, col: '#ffb000' });
});
const pp2 = (tA, tTurn) => (t) => { const turn = t > tTurn; const x = turn ? 7.2 : lerp(1.0, 7.2, clamp((t - tA) / (tTurn - tA))); const y = turn ? lerp(3.5, 6.0, clamp((t - tTurn) / 4)) : 3.5; return [x, y, turn ? 0 : 1, turn ? 1 : 0]; };
B(274, 'grid', (g, t, w) => {
  g.el('', MAPG(10, 7, 62), t + 0.1, -320, 70, { from: [0, 160], upd: mapUpd(10, 7, 62, pp2(S(276), at('повернули', S(277)) + 0.3), 1.9, true) });
  g.emo('🔮', 170, t + 0.3, 470, -260, {});
  g.cap('ПРЕДСКАЗЫВАЕТ', 80, t + 0.4, 470, -80, { cps: 18, until: S(276) });
  g.cap('ГРУЗИТ ЗАРАНЕЕ', 80, S(275) + 2, 470, 80, { cps: 18, until: S(277) });
  g.cap('🟧 УЛИЦЫ ВПЕРЕДИ', 70, S(276), 470, -80, { cps: 20 });
  g.cap('ПОВЕРНУЛИ — ПЕРЕКЛЮЧИЛАСЬ', 56, at('повернули', S(277)), 470, 120, { cps: 28, col: RED });
});
B(278, 'grid', (g, t, w) => {
  g.prop(G5A('hdd.png'), 240, t + 0.1, -520, -160, { r: -5 });
  g.el('', DISC, t + 0.3, -520, 160, { s: 0.45, upd: discUpd(40) });
  g.emo('🐢', 150, w('медленные'), -260, 0, {});
  g.cap('ЖДАТЬ НЕЛЬЗЯ', 100, S(279), 300, -120, { cps: 16, col: RED });
  g.emo('👟', 160, S(280), 300, 90, {});
  g.cap('НА ШАГ ВПЕРЕДИ', 80, S(280) + 0.2, 300, 260, { cps: 20 });
});
B(281, D('g5night', 30), (g, t, w) => {
  CELL(g, t + 0.1, -460, -40, { r: -4 });
  g.el('', `<div style="width:560px;padding:26px 34px;border-radius:30px;background:#fff;font-family:Osw;font-weight:700;font-size:44px;color:${INK};line-height:1.5">📋 СПИСОК ГОТОВНОСТИ<br><span class="li">⬜ улица впереди</span><br><span class="li">⬜ машины</span><br><span class="li">⬜ пешеходы</span></div>`, w('список'), 330, -60, { from: [200, 0], upd: (tt, d) => d.querySelectorAll('.li').forEach((s, i) => { s.textContent = (tt > at('список', S(281)) + 0.8 + i * 0.7 ? '✅' : '⬜') + s.textContent.slice(1); }) });
  g.cap('МИР ПЛАВНЫЙ', 90, S(282), 0, 340, { cps: 18, col: '#7fe39a' });
});
B(283, 'grid', (g, t, w) => {
  g.prop(AS.gta5, 520, t + 0.1, -420, 40, { from: [-200, 0], r: -4 });
  g.emo('🏆', 200, w('популярных'), 300, -200, {});
  g.cap('НА МНОЖЕСТВЕ КОНСОЛЕЙ', 70, at('доступность', S(284)), 300, 60, { cps: 24 });
});
B(285, 'grid', (g, t, w) => {
  g.prop(PS3, 280, w('playstation'), -470, -40, { from: [-200, 0] });
  g.prop(GA('x360.png'), 340, w('xbox'), 0, -40, { from: [0, 200] });
  NUM(g, 'ПИК', 'миллионы игроков каждый день', S(286), 480, -40, '#2e9e57');
  g.emo('📈', 150, at('миллионы', S(286)), 480, 230, {});
});
B(287, 'grid', (g, t, w) => {
  g.prop(AS.gta5, 360, t + 0.1, 0, 0, { t1: w('расти') - 0.3 });
  g.cap('НЕ ПРИВЯЗАНА К ОДНОЙ КОНСОЛИ', 70, t + 0.4, 0, 300, { cps: 28, until: w('расти') - 0.3 });
  g.cap('ПРОДОЛЖАЛА РАСТИ', 84, w('расти'), 0, -400, { cps: 22 });
  g.prop(G5A('ps4.png'), 230, w('playstation'), -600, -40, { r: -3 });
  g.prop(G5A('xone.png'), 200, w('xbox'), -220, -20, { r: 3 });
  g.prop(G5A('ps5.png'), 330, w('playstation', 1), 200, -40, { r: -2 });
  g.prop(G5A('xseries.png'), 300, w('series'), 560, -30, { r: 3 });
  NUM(g, '7+ ЛЕТ', 'игре к тому времени', S(288), 0, 280);
});
B(289, 'grid', (g, t, w) => {
  g.el('', GROW('ИГРОКИ', '#7fe39a'), t + 0.1, -100, -120, { upd: growUpd(t + 0.4, 6, 1) });
  g.cap('НОВЫЕ ПРИХОДЯТ, СТАРЫЕ ОСТАЮТСЯ', 60, w('новые'), -100, 60, { cps: 30 });
  g.emo('❤️', 170, at('верны', S(290)), 560, -120, {});
  g.cap('ИГРОКИ ВЕРНЫ ИГРЕ', 80, at('верны', S(290)), 0, 300, { cps: 22, col: '#2e9e57' });
});
B(291, D('g5bike', 6), (g, t, w) => {
  g.emo('🌐', 200, t + 0.1, -460, -100, {});
  g.cap('ПРИЧИНА — ОНЛАЙН', 96, t + 0.2, 220, -140, { cps: 20 });
  g.cap('ЗАЧЕМ ПЕРЕПРОХОДИТЬ?', 80, S(292), 220, 60, { cps: 22, col: '#ffb000' });
  g.emo('💭', 150, at('ностальгии', S(293)), -460, 220, {});
  g.cap('НОСТАЛЬГИЯ — НЕ У ВСЕХ', 64, at('ностальгии', S(293)) + 0.2, 220, 260, { cps: 26 });
});
B(294, 'grid', (g, t, w) => {
  cc(g, 'g5bike', t + 0.1, -330, -20, 800, { r: -3, off: 3 });
  g.cap('GTA ONLINE', 110, w('онлайн'), 470, -260, { cps: 14, r: 2 });
  R(g, '🌍', 'ЦИФРОВОЙ МИР', at('цифровой', S(295)), 470, -40);
  R(g, '✍️', 'СВОИ МИССИИ', at('свои', S(296)), 470, 130);
});
B(297, 'grid', (g, t, w) => {
  cc(g, 'g5dead', t + 0.1, -330, -20, 800, { r: -3, off: 4 });
  g.emo('🏎️', 150, w('машин'), 420, -250, {}); g.emo('💥', 150, w('хаос'), 620, -250, {});
  g.cap('ВСЕГДА ЕСТЬ ЦЕЛЬ', 84, S(298), 480, -40, { cps: 20 });
  ['💰', '🏠', '🚗'].forEach((e, i) => g.emo(e, 130, [at('деньги', S(298)), at('недвижимость', S(298)), at('машины', S(298))][i], 300 + i * 180, 160, {}));
});
B(299, D('g5sumo', 6), (g, t, w) => {
  cc(g, 'g5sumo', t + 0.1, -330, -20, 800, { r: -3, off: 2 });
  PL(g, '▶ YOUTUBE', S(300), 470, -220, '#fff', '#ff0000', { r: 3 });
  g.emo('🤸', 160, at('паркур', S(300)), 470, -20, {});
  g.cap('ВДОХНОВЛЯЛИ ПОКУПАТЬ', 64, at('вдохновляли', S(300)), 470, 180, { cps: 24 });
});

// ---------------- 5 · ИТОГ ----------------
const FOUR = (g, t, y = 40, s = 1) => {
  cover(g, AS.niko, t, -690, y, 300 * s, 400 * s, { from: [0, 260], r: -5 }); g.prop(AS.g4logo, 110 * s, t + 0.15, -690, y - 200 * s, { r: -4, z: 4 });
  cover(g, AS.uc3, t + 0.15, -235, y, 370 * s, 370 * s, { from: [0, 260], r: 3 });
  g.prop(AS.tlou, 430 * s, t + 0.3, 230, y + 10, { from: [0, 260], r: -3 });
  g.prop(AS.gta5, 430 * s, t + 0.45, 690, y + 10, { from: [0, 260], r: 4 });
};
B(301, 'grid', (g, t) => {
  FOUR(g, t + 0.1, 60);
  g.cap('ЧТО ОБЩЕГО?', 120, t + 0.6, 0, -380, { cps: 18 });
}, { z: 0.9 });
B(302, 'grid', (g, t) => {
  BIG(g, '1', t + 0.05, -620, -200, 240);
  g.cap('ВЫГРУЖАЛИ НЕВИДИМОЕ', 90, t + 0.2, 160, -330, { cps: 22 });
  R(g, '🏙️', 'ГТА 4: ГОРОД → КАРТИНКА', S(303), 160, -140);
  R(g, '🗑️', 'UNCHARTED 3: ПРОШЛОЕ УДАЛЯЕТСЯ', S(304), 160, 30);
  R(g, '🧩', 'ГТА 5: МИР СОБИРАЕТСЯ НА ХОДУ', S(305), 160, 200);
});
B(306, 'grid', (g, t, w) => {
  BIG(g, '2', t + 0.05, -620, -200, 240);
  g.emo('🎭', 160, t + 0.2, -380, -200, {});
  g.cap('ОБМАНЫВАЛИ ГЛАЗ', 90, t + 0.3, 200, -330, { cps: 22 });
  g.el('', PARA('✈️', 'linear-gradient(#9fd0ff,#e9f6ff)', '#e8c883'), S(307), -260, 120, { upd: paraUpd(420), from: [-100, 100], s: 0.6 });
  R(g, '🌫️', 'РАЗМЫТИЕ', at('размытие', S(307)), 360, 40);
  R(g, '🌅', 'ДЫМКА', at('дымка', S(307)), 360, 200);
});
B(308, 'grid', (g, t, w) => {
  BIG(g, '3', t + 0.05, -620, -200, 240);
  g.cap('ПАМЯТЬ И ДИСК', 90, t + 0.3, 160, -330, { cps: 20 });
  g.prop(G5A('hdd.png'), 200, S(309), -330, 60, { r: -5 });
  g.el('', DISC, S(309) + 0.3, -100, 60, { s: 0.4, upd: discUpd(120) });
  g.cap('ROCKSTAR: HDD + BLU-RAY', 54, S(309) + 0.4, -220, 230, { cps: 28 });
  g.emo('🗜️', 150, at('naughty', S(309)), 420, 40, {});
  g.cap('NAUGHTY DOG: СЖАТИЕ', 54, at('naughty', S(309)) + 0.2, 420, 230, { cps: 26 });
});
B(310, D('uccut', 30), (g, t, w) => {
  BIG(g, '4', t + 0.05, -620, -200, 240);
  g.emo('👥', 220, w('сотни'), -200, 0, {});
  g.cap('СОТНИ ЛЮДЕЙ', 80, w('сотни'), 300, -160, { cps: 18 });
  g.cap('ГОДЫ РАБОТЫ', 80, w('годами'), 300, 0, { cps: 18 });
  g.cap('РАДИ МИЛЛИСЕКУНД', 80, w('миллисекунд'), 300, 160, { cps: 18, col: '#ffb000' });
});
B(311, 'grid', (g, t, w) => {
  FOUR(g, t + 0.1, 80, 0.9);
  g.emo('👏', 170, w('восхищаешься'), 0, -330, {});
  g.cap('ВОСХИЩАЕШЬСЯ', 100, w('восхищаешься') + 0.2, 0, -400, { cps: 18 });
}, { z: 0.9 });
B(312, DI(G5A('industrial_dusk.jpg')), (g, t, w) => {
  g.prop(PS3, 360, t + 0.1, 0, 180, { from: [0, 220] });
  g.cap('ЗА ПРЕДЕЛАМИ', 130, w('пределы'), 0, -230, { cps: 16 });
  g.cap('ВОЗМОЖНОСТЕЙ PS3', 100, w('возможностей'), 0, -80, { cps: 18, col: '#ffb000' });
});
B(313, 'grid', (g, t) => {
  g.cap('КАКИЕ ИГРЫ МЫ ПРОПУСТИЛИ?', 90, t + 0.1, 0, -120, { cps: 20 });
  g.emo('💬', 200, S(314), 0, 120, { r: 6 });
  g.cap('ПИШИТЕ В КОММЕНТАРИЯХ', 70, S(314) + 0.2, 0, 330, { cps: 26 });
  g.emo('👋', 170, S(315), 620, 120, {});
});


// ---------- концы, камера ----------
beats.forEach((b, i) => (b.end = i + 1 < beats.length ? beats[i + 1].t0 : 1e9));
const KEYS = [[0, 0, beats[0].cx - 40, beats[0].cy + 10, 0.86, 0]];
beats.forEach((b) => {
  if (b.i > 0) KEYS.push([b.t0, b.tr, b.cx, b.cy, b.z, b.i % 2 ? 1 : -1]);
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
  // тряска камеры на ударных словах
  let sx = 0, sy = 0, sr = 0;
  SHAKES.forEach(([t0, a], i) => { if (t >= t0 && t < t0 + 0.6) { const e = a * Math.exp(-(t - t0) * 7); sx += Math.sin((t - t0) * 52 + i) * e; sy += Math.cos((t - t0) * 47 + i * 2) * e; sr += Math.sin((t - t0) * 39 + i) * e * 0.05; } });
  // постоянное мягкое движение: дрейф и «дыхание» зума
  return { x: c[0] + sx + Math.sin(t * 0.55) * 26, y: c[1] + sy + Math.cos(t * 0.43) * 14, z: c[2] * (1 + 0.02 * Math.sin(t * 0.5)), r: c[3] * 0.8 + sr + Math.sin(t * 0.32) * 0.5 };
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
window.DUR = 1882.6;
(async () => {
  await document.fonts.load('700 60px Osw', 'НАСТОЯЩЕЕ БЕЗУМИЕ 256 МБ ?!'); await document.fonts.load('900 60px Mont', 'NAUGHTY DOG');
  await document.fonts.load('60px "Noto Color Emoji"', '☀️☀️🌧️☀️🔁🫣🤸🥊👕♻️⚔️⚔️📍⚖️⚙️⚙️🌿🔧🗑️⚙️🖼️⚠️⚠️🤲🤷👉👈🔍⚡⚡🕶️🧑‍🎨👷👩‍💻🎬🗿🖌️💻🎙️💸✂️✂️💬✅✅🦠🎨💧🏃👁️📐🧱😡😐👻✈️✈️👊🌪️🌊🤖✊💦🎬🎭🖐️👀😵🏁💥✍️✖✨✨💥🎞️📋🔥🔍🚂🎥🏜️🎩🥷🧗👁️🎓🔴📷🏃🕺🎤🧠🗜️🗑️🚢❄️❄️🍂🤖💬🔊🧠🖼️🌍❌❓❓💾👥💵🤑🐌😐😮😠🤔🌫️❤️➕➕🚗🏚️🔫🐾🤝🏆💡😱🥵🎭➡️➡️🧍‍♂️💡🔦🥵⬅️⬆️⬜⭐🌅🌊🌍🌐🌑🌗🌙🌪️🌫️🌿🍂🍄🍋🍋💪🤯🌍📱🧠🔥🎭🔍💾🎮🍏🎙️🎞️🎥🎨🎩🎬🎭🎮🎲🏃🏃‍♀️🏆🏎️🏘️🏙️🏠🏢🐌🐘🐛🐞🐟🐢🐺👀👁️👊👋👏👔👕👟👥👨‍💻👩‍💻👷👻💡💤💥💧💨💪💬💭💰💵💸💻💾💿📈📉📋📍📐📥📦📱🔉🔊🔍🔒🔥🔦🔩🔮🕛🕳️🖌️🖥️🖼️🗑️🗜️🗿😎😐😠😤😮😱😴🚂🚗🚢🚰🚰💧📉🚶🛒🛞🛠️🛣️🟧🟩🤏🤔🤖🤝🤪🤯🤸🥊🐢🔥📦📄🐺🎯😴🥵🥷🦌🦕🧍🧑‍🎨🧗🧟🧠🧩🧪🧮🧱🧴🪫🪲🫣');
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  window.__ready = true;
})();
