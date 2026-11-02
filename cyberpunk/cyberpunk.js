// RDR2 на PS4 — динамичный коллаж в стиле MKTS: короткие сцены, смена фонов
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
const WORDS = await (await fetch('/cyberpunk/' + (window.WORDS_FILE || 'words_full.json'))).json();
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

const BT = (t, bg, fn, cam = {}) => beat(t, bg, (g) => fn(g, t, (p, k = 0) => { const r = at(p, t, k); (window.WL = window.WL || []).push([t, p, r]); return r; }), cam);
const RA = (n) => '/rdr2/assets/' + n;
const DI = (p) => 'dark:' + p;
// клипы RDR2 (кадры в rdr2/clips/<имя>/0001.jpg, 30 к/с)
Object.assign(CL, {
  animals: ['rdr2/clips/animals', 1800], camp: ['rdr2/clips/camp', 902], cutscenes: ['rdr2/clips/cutscenes', 1800], fog: ['rdr2/clips/fog', 574],
  gallop: ['rdr2/clips/gallop', 457], honor: ['rdr2/clips/honor', 1800], horsedirt: ['rdr2/clips/horsedirt', 1800], nightcity: ['rdr2/clips/nightcity', 1800],
  rain: ['rdr2/clips/rain', 438], saintdenis: ['rdr2/clips/saintdenis', 1800], sandstorm: ['rdr2/clips/sandstorm', 1800], snow: ['rdr2/clips/snow', 636],
  swamp: ['rdr2/clips/swamp', 1128], valentine: ['rdr2/clips/valentine', 1800],
});
// вертикальная карточка-клип (h — высота)
const ccv = (g, k, t, x, y, h, o = {}) => g.card({ w: Math.round(h * 9 / 16), h, clip: CL[k][0], n: CL[k][1], off: o.off || 0 }, t, x, y, { from: o.from || [0, 180], r: o.r || 0, float: o.float ?? 5, t1: o.t1, upd: o.upd });
const pic = (g, n, t, x, y, w, h, o = {}) => cover(g, RA(n), t, x, y, w, h, o);
const NUM = (g, n, sub, t, x, y, col = INK, o = {}) => g.el('', BIGNUM(n, sub, col), t, x, y, { from: [0, 180], r: x < 0 ? -3 : 3, float: 6, ...o });
const ARW = (g, t, x, y, o = {}) => g.el('width:220px;height:120px', CHEV(1), t, x, y, { shadow: false, upd: chevUpd, ...o });
// линия, которая «дорисовывается» (соединение элементов, как в референсе)
const LINK = (w, ang = 0, col = '#2a2a2c') => `<svg width="${w}" height="20" style="transform:rotate(${ang}deg);overflow:visible"><line class="ln" x1="0" y1="10" x2="${w}" y2="10" stroke="${col}" stroke-width="8" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
const linkUpd = (t0, dur = 0.6) => (t, d) => { d.querySelector('.ln').style.strokeDashoffset = (1 - E.inOut(P(t, t0, dur))).toFixed(3); };
const link = (g, t, x, y, w, ang = 0, col) => g.el(`width:${w}px;height:20px`, LINK(w, ang, col), t, x, y, { shadow: false, from: [0, 0], dur: 0.01, upd: linkUpd(t, 0.45) });
// ударная надпись на весь экран
const SLAM = (g, txt, t, size = 170, col = '#fff') => g.cap(txt, size, t, 0, 0, { cps: 40, r: 0, col, css: 'text-shadow:0 10px 30px rgba(0,0,0,.6)' });
// микросхема (своя): серебристая рамка, крупная надпись
const SOCC = (top, name, sub, w = 330) => `<div style="width:${w}px;height:${w}px;border-radius:28px;padding:14px;background:linear-gradient(135deg,#f6f6f8,#b9bcc4 45%,#eceef2 60%,#9fa3ab);position:relative">
 ${Array.from({ length: 9 }, (_, i) => `<div style="position:absolute;left:${30 + i * (w - 70) / 8}px;top:-14px;width:10px;height:16px;background:#c9a24a;border-radius:3px"></div><div style="position:absolute;left:${30 + i * (w - 70) / 8}px;bottom:-14px;width:10px;height:16px;background:#c9a24a;border-radius:3px"></div>`).join('')}
 <div style="width:100%;height:100%;border-radius:16px;background:linear-gradient(160deg,#2c2d33,#121317);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Osw;color:#eee">
 <div style="font-size:${w * 0.1}px;opacity:.7;line-height:1.1">${top}</div><div style="font-size:${w * 0.24}px;line-height:1;letter-spacing:.02em">${name}</div><div style="font-size:${w * 0.08}px;opacity:.75;margin-top:6px">${sub}</div></div></div>`;
// 8 ядер: решётка, ядра загораются по очереди
const CORESG = `<div style="display:grid;grid-template-columns:repeat(4,88px);gap:14px;padding:22px;border-radius:26px;background:#fff">${Array.from({ length: 8 }, (_, i) => `<div class="cr" style="height:88px;border-radius:14px;background:#d6d8dd;display:flex;align-items:center;justify-content:center;font-family:Osw;font-size:40px;color:#fff">${i + 1}</div>`).join('')}</div>`;
const coresUpd = (t0) => (t, d) => d.querySelectorAll('.cr').forEach((c, i) => { c.style.background = t > t0 + i * 0.12 ? '#e3262b' : '#d6d8dd'; });
// жёсткий диск: вращающаяся пластина и головка
const HDDSV = `<svg width="420" height="520" viewBox="0 0 420 520"><rect x="6" y="6" width="408" height="508" rx="30" fill="#b9bcc4" stroke="#8d9099" stroke-width="6"/>
 <g class="pl"><circle cx="210" cy="210" r="170" fill="url(#hg)"/><circle cx="210" cy="210" r="168" fill="none" stroke="#9aa0aa" stroke-width="3"/>${[150, 120, 90].map((r) => `<circle cx="210" cy="210" r="${r}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>`).join('')}<path d="M210 210 L210 42" stroke="rgba(255,255,255,.7)" stroke-width="10"/></g>
 <circle cx="210" cy="210" r="34" fill="#6f737c"/><circle cx="210" cy="210" r="12" fill="#c7cad1"/>
 <g class="arm"><rect x="330" y="420" width="40" height="40" rx="8" fill="#555"/><path d="M350 440 L250 170" stroke="#444" stroke-width="16" stroke-linecap="round"/></g>
 <defs><radialGradient id="hg"><stop offset="0" stop-color="#eef1f6"/><stop offset=".6" stop-color="#b6bcc8"/><stop offset="1" stop-color="#e6e9ee"/></radialGradient></defs></svg>`;
const hddUpd = (rpm = 0.6) => (t, d) => { d.querySelector('.pl').setAttribute('transform', `rotate(${(t * 360 * rpm) % 360} 210 210)`); d.querySelector('.arm').setAttribute('transform', `rotate(${(Math.sin(t * 2.3) * 6).toFixed(2)} 350 440)`); };
// планка памяти: 8 чипов
const RAMST = `<svg width="760" height="220" viewBox="0 0 760 220"><rect x="4" y="4" width="752" height="180" rx="12" fill="#1f6b3a" stroke="#14502a" stroke-width="5"/>${Array.from({ length: 8 }, (_, i) => `<rect class="rc" x="${30 + i * 90}" y="40" width="72" height="100" rx="8" fill="#1a1b1f"/>`).join('')}${Array.from({ length: 36 }, (_, i) => `<rect x="${20 + i * 20}" y="184" width="12" height="30" fill="#d6b24f"/>`).join('')}</svg>`;
const ramUpd = (t0) => (t, d) => d.querySelectorAll('.rc').forEach((c, i) => c.setAttribute('fill', t > t0 + i * 0.1 ? '#e3262b' : '#1a1b1f'));

const MEM8 = `<div style="width:1100px;font-family:Osw;font-weight:700;color:#fff"><div style="display:flex;height:170px;border-radius:30px;overflow:hidden;background:#e4e6ea">
 <div class="ms" style="width:0;background:#6f737c;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap"><div style="font-size:40px">СИСТЕМА</div><div style="font-size:70px">~3 ГБ</div></div>
 <div class="mg" style="width:0;background:#e3262b;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap"><div style="font-size:40px">ИГРА</div><div style="font-size:70px">~5 ГБ</div></div></div></div>`;
const mem8Upd = (t1, t2) => (t, d) => { d.querySelector('.ms').style.width = (37.5 * E.outCubic(P(t, t1, 0.7))).toFixed(1) + '%'; d.querySelector('.mg').style.width = (62.5 * E.outCubic(P(t, t2, 0.7))).toFixed(1) + '%'; };
// дом: чем ближе, тем больше полигонов (сетка внутри силуэта)
const LODH = (n, w = 300) => { const s = w / 300; let l = ''; for (let i = 1; i < n; i++) { const x = 30 + (240 * i) / n, y = 150 + (150 * i) / n; l += `<line x1="${x}" y1="150" x2="${x}" y2="300"/><line x1="30" y1="${y}" x2="270" y2="${y}"/><line x1="${30 + (240 * (i - 1)) / n}" y1="150" x2="${x}" y2="300"/>`; }
  for (let i = 1; i < n; i++) l += `<line x1="${30 + (120 * i) / n}" y1="${150 - (120 * i) / n}" x2="${270 - (120 * i) / n}" y2="${150 - (120 * i) / n}"/>`;
  return `<svg width="${w}" height="${w * 1.1}" viewBox="0 0 300 330" style="background:#fff;border-radius:26px"><path d="M30 150 L150 30 L270 150 V300 H30 Z" fill="#dfe8f2" stroke="${INK}" stroke-width="6"/><g stroke="#4aa8ff" stroke-width="${n > 6 ? 1.5 : 3}">${l}</g><path d="M30 150 L150 30 L270 150 V300 H30 Z" fill="none" stroke="${INK}" stroke-width="6"/></svg>`; };
// шахматная отрисовка: половина клеток рисуется, вторая — восстанавливается
const CHECK = `<svg width="800" height="460" viewBox="0 0 800 460" style="background:#fff;border-radius:30px">${Array.from({ length: 16 * 9 }, (_, i) => `<rect class="ck" data-p="${((i % 16) + Math.floor(i / 16)) % 2}" x="${16 + (i % 16) * 48}" y="${14 + Math.floor(i / 16) * 48}" width="44" height="44" rx="6" fill="#e4e6ea"/>`).join('')}</svg>`;
const checkUpd = (t1, t2) => (t, d) => d.querySelectorAll('.ck').forEach((r, i) => { const p = r.dataset.p === '0'; const k = (i * 37) % 144 / 144; r.setAttribute('fill', p ? (t > t1 + k * 0.6 ? '#e3262b' : '#e4e6ea') : (t > t2 + k * 0.6 ? '#7fe39a' : '#e4e6ea')); });
// лесенка на краю -> ровная линия (сглаживание)
const JAG = `<svg width="560" height="340" viewBox="0 0 560 340" style="background:#fff;border-radius:30px"><path class="jg" d="M40 300 H110 V250 H180 V200 H250 V150 H320 V100 H390 V50 H520" fill="none" stroke="${RED}" stroke-width="14" stroke-linejoin="miter"/><path class="sm" d="M40 300 C200 290 330 60 520 50" fill="none" stroke="#2bb673" stroke-width="14" stroke-linecap="round" opacity="0"/></svg>`;
const jagUpd = (t0) => (t, d) => { const k = E.inOut(P(t, t0, 0.8)); d.querySelector('.jg').setAttribute('opacity', (1 - k).toFixed(2)); d.querySelector('.sm').setAttribute('opacity', k.toFixed(2)); };
// консоль-силуэт с подписью
const CONS = (name, col = '#1b1c20', w = 440) => `<div style="width:${w}px;font-family:Osw;font-weight:700;text-align:center;color:${INK}"><div style="height:${w * 0.26}px;border-radius:14px;background:linear-gradient(170deg,${col},#000);box-shadow:inset 0 -${w * 0.05}px 0 rgba(255,255,255,.08)"></div><div style="font-size:${w * 0.13}px;margin-top:16px">${name}</div></div>`;
// облака обновляются по частям
const CLOUDS = `<div style="display:grid;grid-template-columns:repeat(6,120px);gap:10px;padding:20px;border-radius:30px;background:#cfe6f7">${Array.from({ length: 18 }, () => `<div class="cl" style="height:100px;border-radius:14px;display:flex;align-items:center;justify-content:center;${EMF}font-size:64px">☁️</div>`).join('')}</div>`;
const cloudUpd = (t, d) => d.querySelectorAll('.cl').forEach((c, i) => { const on = Math.floor(t * 8) % 18 === (i * 7) % 18; c.style.background = on ? '#ffb000' : 'rgba(255,255,255,.35)'; });
// жители: подробно — только в радиусе вокруг игрока
const AISIM = `<svg width="760" height="500" viewBox="0 0 760 500" style="background:#fff;border-radius:30px"><circle class="rad" r="150" fill="rgba(227,38,43,.10)" stroke="${RED}" stroke-width="5" stroke-dasharray="14 10"/>${Array.from({ length: 46 }, (_, i) => `<circle class="np" cx="${40 + rnd(i, 1) * 680}" cy="${40 + rnd(i, 2) * 420}" r="11"/>`).join('')}<circle class="me" r="18" fill="${INK}"/></svg>`;
const aiUpd = (t, d) => { const px = 380 + Math.sin(t * 0.5) * 200, py = 250 + Math.cos(t * 0.37) * 90; const r = d.querySelector('.rad'); r.setAttribute('cx', px); r.setAttribute('cy', py); const m = d.querySelector('.me'); m.setAttribute('cx', px); m.setAttribute('cy', py);
  d.querySelectorAll('.np').forEach((c, i) => { const x = +c.getAttribute('cx'), y = +c.getAttribute('cy'), near = Math.hypot(x - px, y - py) < 150; c.setAttribute('fill', near ? RED : '#c9ccd2'); c.setAttribute('transform', near ? `translate(${(Math.sin(t * 4 + i) * 5).toFixed(1)} ${(Math.cos(t * 3 + i) * 5).toFixed(1)})` : ''); }); };
// список-итог
const ROW = (e, txt) => ROLE(e, txt);
const pl = (g, txt, t, x, y, bg = INK, o = {}) => g.el('', PLATE(txt, '#fff', bg), t, x, y, { from: [0, 120], float: 4, ...o });
const mg = (g, t, w0, x, y, h, o) => g.prop(RA(w0), h, t, x, y, { float: 4, ...o });
const WF = (() => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:0;background:#fff;opacity:0;z-index:50;pointer-events:none'; document.getElementById('view').appendChild(d); return d; })();
// =====================================================================
//   ПОДВОДКА К ИНТЕГРАЦИИ GGSEL (первые ~15.2 с; дальше — запись экрана)
//   T — время начала интеграции в общем ролике
// =====================================================================
const GGSEL = (h = 140) => `<div style="display:flex;align-items:center;gap:${h * 0.16}px;font-family:Mont;font-weight:900;font-size:${h}px;line-height:1;color:#1b1b1e;letter-spacing:-.03em;padding:${h * 0.28}px ${h * 0.45}px;border-radius:${h * 0.3}px;background:#fff">
 <svg width="${h * 0.95}" height="${h * 0.95}" viewBox="0 0 100 100"><path d="M80 30 L50 13 L19 31 V69 L50 87 L81 69 V51 H53" fill="none" stroke="#3dcd58" stroke-width="17" stroke-linejoin="round" stroke-linecap="round"/></svg><span style="margin-top:-${h * 0.12}px">ggsel</span></div>`;
const CPTILE = `<div style="width:620px;height:360px;border-radius:30px;background:#fcee0a;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Osw;font-weight:700;color:#111;line-height:.9;overflow:hidden;position:relative">
 <div style="font-size:96px;letter-spacing:.02em">CYBERPUNK</div><div style="font-size:70px;color:#00b7ff">2077</div>
 <div class="gl" style="position:absolute;left:0;right:0;height:26px;background:rgba(0,183,255,.55);mix-blend-mode:multiply"></div></div>`;
const glUpd = (t, d) => { const g = d.querySelector('.gl'); const f = Math.floor(t * 12); g.style.top = ((rnd(f, 1) * 330) | 0) + 'px'; g.style.opacity = rnd(f, 2) > 0.4 ? 1 : 0; d.style.transform += ` translateX(${((rnd(f, 3) - 0.5) * (rnd(f, 4) > 0.7 ? 18 : 0)).toFixed(1)}px)`; };
const glUpd2 = (t, d) => { const f = Math.floor(t * 12); if (rnd(f, 4) > 0.72) d.style.transform += ` translateX(${((rnd(f, 3) - 0.5) * 30).toFixed(1)}px) skewX(${((rnd(f, 5) - 0.5) * 12).toFixed(1)}deg)`; };
const SALE = (txt, bg) => `<div style="padding:14px 30px;border-radius:22px;background:${bg};color:#fff;font-family:Osw;font-weight:700;font-size:80px;transform:rotate(-6deg)">${txt}</div>`;

function AD(T) {
  const A = (p, k = 0) => at(p, T, k);
  // «Кстати, о Rockstar»
  beat(T, 'grid', (g) => {
    g.prop('/gta4_ps3/assets/rockstar.png', 300, T + 0.1, 0, -20, { from: [0, 220], r: -5, float: 6 });
    g.cap('КСТАТИ, О ROCKSTAR', 90, A('rockstar'), 0, 280, { cps: 30, r: 0 });
  }, { keys: [[T, 1.4, 0, 0, 1.08]] });
  // «пока одни студии разбираются с последствиями спешки»
  beat(A('пока') - 0.1, DI('/rdr2/assets/pcb.jpg'), (g) => {
    g.card({ w: 400, h: 513, src: '/cyberpunk/assets/cover.jpg' }, A('одни'), -520, 30, { from: [0, 220], r: -4, float: 5 });
    g.prop('/cyberpunk/assets/cp_logo.png', 190, A('студии'), 220, -170, { from: [200, 0], float: 4, filter: 'drop-shadow(0 0 30px rgba(252,238,10,.35))', upd: glUpd2 });
    ['🐛', '💥', '🐞'].forEach((e, i) => g.emo(e, 120, A('разбираются') + i * 0.18, 60 + i * 230, 120 + (i % 2) * 60, { float: 8 }));
    g.el('', PLATE('СПЕШКА', '#fff', RED), A('спешки'), 300, 320, { from: [0, 140], float: 4 });
  });
  // «Rockstar свою главную игру десятилетия уже почти довела до релиза»
  beat(A('rockstar', 1) - 0.15, 'grid', (g) => {
    g.prop('/gta4_ps3/assets/rockstar.png', 230, A('rockstar', 1), -520, -40, { r: -6, float: 6 });
    g.cap('ГЛАВНАЯ ИГРА', 120, A('главную'), 180, -120, { cps: 24 });
    g.cap('ДЕСЯТИЛЕТИЯ', 120, A('десятилетия'), 180, 30, { cps: 24, col: RED });
    g.el('', GROW('ДО РЕЛИЗА', '#2bb673'), A('довела'), 180, 220, { from: [0, 80], upd: growUpd(A('довела'), 1.2, 0.92) });
  });
  // «ГТА 6 уже на подходе»
  beat(at('г', A('релиза')) - 0.2, 'dark:/cyberpunk/clips/gta6/0040.jpg', (g) => {
    g.card({ w: 1100, h: 619, clip: 'cyberpunk/clips/gta6', n: 180 }, at('г', A('релиза')) - 0.1, -120, 20, { from: [0, 220], r: -2, float: 4 });
    g.cap('GTA 6', 200, at('6', A('релиза')), 600, -230, { cps: 12, r: 4 });
    g.el('', PLATE('УЖЕ НА ПОДХОДЕ', '#fff', RED), A('подходе'), 560, 260, { from: [0, 140], float: 4, z: 5 });
  }, { keys: [[A('подходе'), 1.0, 60, 0, 1.06]] });
  // «а в PlayStation стартовала большая распродажа»
  beat(A('playstation') - 0.15, DI('/rdr2/assets/blue.jpg'), (g) => {
    g.prop('/cyberpunk/assets/ps5.png', 760, A('playstation'), 420, 40, { from: [0, 300], float: 5 });
    g.cap('РАСПРОДАЖА', 150, A('стартовала'), -380, -150, { cps: 22 });
    g.el('', SALE('−75%', '#2a6cff'), A('большая'), -590, 90, { from: [-200, 0], float: 8 });
    g.el('', SALE('−95%', RED), A('распродажа'), -200, 160, { from: [-200, 0], float: 8 });
    g.emo('🔥', 140, A('распродажа') + 0.2, -400, 340, { float: 9 });
  });
  // «Пополнить PSN выгодно можно на ggsel» — логотип выезжает сразу вместе с надписью
  beat(A('пополнить') - 0.15, 'grid', (g) => {
    g.cap('ПОПОЛНИТЬ PSN ВЫГОДНО', 100, A('пополнить'), 0, -250, { cps: 34, r: 0, until: T + 16 });
    g.el('', GGSEL(190), A('пополнить') + 0.05, 0, 80, { from: [0, 420], dur: 0.55, float: 3 });
    // плавный уход в белый перед записью сайта (страница сайта начинается с белого)
    (window.GFX = window.GFX || []).push((t) => { WF.style.opacity = t >= T + 14.8 && t < T + 15.24 ? E.inOut(P(t, T + 14.8, 0.43)).toFixed(3) : 0; });
  }, { z: 1.1 });
}

// карточка «описание под видео» со строками из ТЗ
const DESC = `<div style="width:1040px;padding:34px 44px;border-radius:30px;background:#fff;font-family:Osw;font-weight:700;color:#1b1b1e;line-height:1.25">
 <div style="font-size:34px;color:#8a8d94;margin-bottom:14px">ОПИСАНИЕ</div>
 <div class="dl" style="font-size:44px">Успей пополнить PSN с выгодным курсом!</div><div class="dl" style="font-size:40px;color:#2a6cff">🔗 ggsel.net/…</div>
 <div class="dl" style="font-size:44px;margin-top:10px">ТВОЯ GTA VI УЖЕ ТУТ</div><div class="dl" style="font-size:40px;color:#2a6cff">🔗 ggsel.net/…</div>
 <div class="dl" style="font-size:40px;margin-top:10px">📢 ТГ-канал ggsel про консоли</div></div>`;
const descUpd = (t0) => (t, d) => d.querySelectorAll('.dl').forEach((l, i) => { const k = E.outCubic(P(t, t0 + i * 0.12, 0.3)); l.style.opacity = k; l.style.transform = `translateX(${((1 - k) * 40).toFixed(1)}px)`; l.style.background = i === 0 && t > t0 + 0.8 ? 'rgba(61,205,88,.18)' : 'none'; });
const BF = `<div style="padding:18px 40px;border-radius:20px;background:#000;border:6px solid #fff;color:#fff;font-family:Osw;font-weight:700;font-size:96px;letter-spacing:.02em;white-space:nowrap">ЧЁРНАЯ ПЯТНИЦА</div>`;

// концовка интеграции: после записи сайта (с 30.0 с от начала интеграции)
function AD_END(T) {
  const A = (p, k = 0) => at(p, T + 29.9, k);
  beat(T + 30.0, 'grid', (g) => {
    g.cap('ССЫЛКИ В ОПИСАНИИ', 100, A('ссылки'), 0, -380, { cps: 34, r: 0 });
    g.el('', DESC, A('ссылки') + 0.1, -120, 40, { from: [0, 260], float: 3, upd: descUpd(A('ссылки') + 0.25) });
    g.emo('⬇️', 130, A('описании'), 640, -150, { float: 10 });
    g.el('', ROLE('📌', 'ЗАКРЕПЛЁННЫЙ КОММЕНТАРИЙ'), A('закреплённом'), 420, 340, { from: [200, 0], float: 5, r: 2, z: 5 });
  }, { z: 0.95 });
  beat(A('успей') - 0.15, DI('/rdr2/assets/pcb.jpg'), (g) => {
    g.cap('УСПЕЙ ПОПОЛНИТЬ PSN', 120, A('успей'), 0, -330, { cps: 36, r: 0, col: '#fff' });
    g.el('', GGSEL(130), A('psn') - 0.1, -380, -40, { from: [-300, 0], float: 4 });
    g.el('', PLATE('ВЫГОДНО', '#fff', '#2bb673'), A('выгодно'), 420, -40, { from: [300, 0], float: 4 });
    g.el('', BF, A('чёрную'), 0, 230, { from: [0, 240], dur: 0.5, float: 3 });
    g.emo('🔥', 120, A('пятницу') + 0.1, 560, 230, { float: 9 });
  }, { keys: [[A('чёрную'), 1.2, 0, 40, 1.06]] });
}
// =====================================================================
//            CYBERPUNK 2077 НА PS4 — ОСНОВНОЙ РОЛИК
//   Времена сцен — по исходной озвучке; S() сдвигает всё после вставки рекламы
// =====================================================================
const TL = { INS: 198.70, ADS: 198.95, D: 36.614 };
const S = (t) => (t < TL.INS ? t : t + TL.D);
const BS = (t, bg, fn, cam) => BT(S(t), bg, fn, cam);
const CA = (n) => '/cyberpunk/assets/' + n;
Object.assign(CL, Object.fromEntries([['bugs_arm', 300], ['bugs_bike', 360], ['bugs_float', 360], ['bugs_fog', 450], ['bugs_road', 300], ['bugs_stuck', 300], ['cmp_drive', 600], ['cmp_face', 300], ['cmp_night', 450], ['demo_crowd', 450], ['demo_market', 450], ['drive_day', 600], ['drive_mid', 450], ['drive_night', 600], ['keanu_city', 300], ['keanu_date', 240], ['keanu_logo', 180], ['keanu_stage', 750]].map(([k, n]) => [k, ['cyberpunk/clips/' + k, n]])));
const cp = (g, n, t, x, y, w, h, o = {}) => cover(g, CA(n), t, x, y, w, h, o);
const cpp = (g, n, h, t, x, y, o = {}) => g.prop(CA(n), h, t, x, y, { float: 4, ...o });
const PS4 = (g, t, x, y, h = 300, o = {}) => g.prop(RA('ps4.png'), h, t, x, y, { float: 6, ...o });
const PS5 = (g, t, x, y, h = 560, o = {}) => g.prop(CA('ps5.png'), h, t, x, y, { float: 5, ...o });
const X = (g, t, x, y, s = 300) => g.el(`width:${s}px;height:${s}px`, XMARK(s), t, x, y, { shadow: false, from: [0, 0], z: 9, upd: xUpd(t) });
const D_ = (k, s) => 'dark:' + BG(k, s);
const PCB = DI(RA('pcb.jpg')), BLUE = DI(RA('blue.jpg'));
// падающий график акций
const STOCK = `<svg width="760" height="420" viewBox="0 0 760 420" style="background:#fff;border-radius:30px"><g stroke="#eee" stroke-width="2">${[1, 2, 3, 4].map((i) => `<line x1="40" x2="720" y1="${i * 80}" y2="${i * 80}"/>`).join('')}</g><polyline class="sl" points="40,90 140,70 230,110 300,80 380,150 450,210 520,190 590,300 660,330 720,370" fill="none" stroke="${RED}" stroke-width="12" stroke-linejoin="round" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
const stockUpd = (t0) => (t, d) => { d.querySelector('.sl').style.strokeDashoffset = (1 - E.inOut(P(t, t0, 1.6))).toFixed(3); };
// картинка, которая «прорисовывается»: сначала размыта, потом чёткая (по кругу)
const blurLoop = (t0, per = 2.4) => (t, c, im) => { const u = ((t - t0) % per) / per; const b = u < 0.45 ? 14 : u < 0.75 ? 14 * (1 - (u - 0.45) / 0.3) : 0; (im || c.querySelector('img')).style.filter = `blur(${b.toFixed(1)}px)`; };
const EDGE = `<div style="width:640px;height:360px;border-radius:30px;background:linear-gradient(135deg,#12051f,#3a0d5c 50%,#ff2a6d);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Osw;font-weight:700;color:#fff;line-height:.95;text-align:center"><div style="font-size:54px;color:#fcee0a">CYBERPUNK</div><div style="font-size:110px">EDGERUNNERS</div><div style="font-size:40px;opacity:.85">аниме-сериал · 2022</div></div>`;
const PATCHES = ['1.06', '1.1', '1.2', '1.5', '1.6'];

// ---------- 0:00 вступление ----------
BS(0, D_('keanu_city', 3), (g, t, w) => {
  g.cap('10 ДЕКАБРЯ 2020', 150, t + 0.1, 0, -40, { cps: 22, r: -2 });
  g.emo('🎮', 150, t + 0.6, 560, -260, { float: 8 });
}, { keys: [[0, 2.4, 0, 0, 1.08]] });
BS(2.9, 'grid', (g, t, w) => {
  cp(g, 'cover.jpg', t + 0.1, -460, 30, 440, 564, { r: -4 });
  g.cap('САМАЯ ОЖИДАЕМАЯ', 90, w('самых'), 300, -230, { cps: 26 });
  cpp(g, 'cp_logo.png', 170, w('cyberpunk'), 300, 0, { from: [200, 0] });
}, { keys: [[at('cyberpunk', 3), 0.8, 120, 0, 1.04]] });
BS(8.8, 'grid', (g, t, w) => {
  NUM(g, 'МИЛЛИОНЫ', 'предзаказов', w('миллионы'), -560, -150);
  NUM(g, '8 ЛЕТ', 'ожидания', w('восемь'), -560, 170, RED);
  cpp(g, 'johnny_cut.png', 900, w('киану'), 360, 60, { from: [300, 0] });
  g.el('', PLATE('КИАНУ РИВЗ', '#fff', INK), w('ривз'), 360, 380, { from: [0, 120], z: 5 });
});
BS(13.9, BLUE, (g, t, w) => {
  g.cap('ЧЕРЕЗ НЕДЕЛЮ', 140, w('через'), 0, -250, { cps: 22 });
  PS4(g, w('sony'), 0, 120, 320);
  g.emo('😳', 150, w('никогда'), 520, 60, { float: 8 });
});
BS(19.5, 'grid', (g, t, w) => {
  cp(g, 'refund.jpg', w('убирает'), 0, -60, 1150, 465, { r: -1 });
  g.el('', PLATE('ВОЗВРАТ ДЕНЕГ', '#fff', RED), w('деньги'), 300, 260, { from: [0, 140], float: 4, z: 5 });
  g.emo('💸', 150, w('деньги') + 0.2, -480, 260, { float: 8 });
});
BS(24.1, BLUE, (g, t, w) => {
  PS4(g, t + 0.1, -380, 80, 320);
  g.cap('ОБЫЧНО:', 90, t + 0.2, 300, -220, { cps: 20 });
  g.cap('НЕВОЗМОЖНОЕ —', 90, w('невозможное'), 300, -80, { cps: 26 });
  g.cap('УМЕЩАЮТ', 90, w('невозможное') + 0.4, 300, 50, { cps: 26, col: '#7fe39a' });
  g.emo('✅', 130, w('консоль'), 300, 230, { float: 8 });
});
BS(30.0, PCB, (g, t, w) => { SLAM(g, 'СЕГОДНЯ — НАОБОРОТ', t + 0.15, 140); g.emo('🔄', 150, t + 0.6, 0, 230, { float: 9 }); });
BS(32.1, 'grid', (g, t, w) => {
  cp(g, 'city1.jpg', t + 0.1, -280, -20, 900, 506, { r: -2 });
  PS4(g, w('консоль'), 500, 120, 230);
  X(g, w('помещается') + 0.2, 500, 120, 280);
  g.el('', PLATE('НЕ ПОМЕЩАЕТСЯ', '#fff', RED), w('помещается'), 480, -200, { from: [0, 140], float: 4 });
  g.el('', PLATE('СЛОМАН ДО СИХ ПОР', '#fff', INK), w('сломанной'), -280, 340, { from: [0, 140], float: 4, z: 5 });
});
// ---------- CD Projekt и «Ведьмак» ----------
BS(41.8, 'grid', (g, t, w) => {
  g.cap('КТО ЕЁ ДЕЛАЛ?', 110, t + 0.1, 0, -330, { cps: 20 });
  cpp(g, 'cdpr_logo.png', 420, w('делал') - 0.2, 0, 60, { filter: 'none' });
});
BS(44.1, 'grid', (g, t, w) => {
  cpp(g, 'cdpr_logo.png', 200, t + 0.1, -620, -260, { filter: 'none' });
  g.cap('2015', 140, w('пятнадцатом'), -560, 60, { cps: 12, r: -3 });
  cp(g, 'witcher_cover.jpg', w('ведьмак'), 60, 40, 420, 540, { r: 3 });
  cpp(g, 'geralt_cut.png', 860, w('дикая'), 560, 90, { from: [300, 0] });
});
BS(50.3, 'grid', (g, t, w) => {
  NUM(g, 'СОТНИ', 'наград «Игра года»', w('сотни'), -480, -140);
  g.emo('🏆', 200, w('наград'), -480, 200, { float: 8 });
  NUM(g, 'ГИГАНТСКИЙ', 'тираж', w('гигантским'), 360, -160, RED);
  g.el('', PLATE('ОДНА ИЗ САМЫХ УВАЖАЕМЫХ СТУДИЙ', '#fff', INK), w('уважаемых'), 300, 160, { from: [0, 140], float: 4 });
});
BS(57.6, 'grid', (g, t, w) => {
  g.cap('ИГРОКИ ВЕРИЛИ', 110, t + 0.1, 0, -300, { cps: 22 });
  g.el('', TILE('«ЕСЛИ CD PROJEKT ОБЕЩАЕТ —<br>ОНА ЭТО СДЕЛАЕТ»', 'font-size:60px'), w('если'), 0, 40, { from: [0, 160], float: 4 });
  g.emo('🤝', 150, w('сделает'), 0, 300, { float: 8 });
});
BS(62.7, PCB, (g, t, w) => { SLAM(g, 'ЗЛАЯ ШУТКА', w('злую') - 0.2, 170); g.emo('🃏', 150, w('шутку'), 0, 230, { float: 9 }); }, { keys: [[at('злую', 62), 1.6, 0, 0, 1.08]] });
// ---------- анонс, демо, Киану, переносы ----------
BS(66.9, 'grid', (g, t, w) => {
  g.cap('2012', 200, w('двенадцатом') - 0.3, -420, -20, { cps: 10, r: -3 });
  cpp(g, 'cp_logo.png', 160, w('анонсировали'), 320, -120, { from: [200, 0] });
  g.el('', PLATE('АНОНС', '#fff', RED), w('анонсировали') + 0.3, 320, 120, { from: [0, 140] });
  g.emo('📢', 150, w('году'), 640, 260, { float: 8 });
});
BS(71.8, 'grid', (g, t, w) => {
  g.emo('🤫', 150, w('замолчали'), -620, -230, { float: 8 });
  g.cap('2018', 150, w('восемнадцатом') - 0.2, -560, 40, { cps: 12, r: -3 });
  cc(g, 'demo_crowd', w('показали'), 280, -20, 980, { r: 2 });
  g.el('', PLATE('ПОЧТИ ЧАС ГЕЙМПЛЕЯ', '#fff', RED), w('часовую'), 280, 320, { from: [0, 140], float: 4, z: 5 });
});
BS(78.4, 'grid', (g, t, w) => {
  cp(g, 'city2.jpg', w('огромный'), -500, -170, 700, 394, { r: -3 });
  cc(g, 'demo_market', w('толпы'), 420, -200, 700, { r: 3, off: 2 });
  cc(g, 'drive_day', w('машины'), 0, 220, 760, { r: -1, off: 5 });
}, { z: 0.92 });
BS(86.4, 'grid', (g, t, w) => {
  g.cap('СЛЕДУЮЩИЙ ШАГ', 130, w('следующий'), 0, -200, { cps: 24 });
  g.cap('ДЛЯ ОТКРЫТЫХ МИРОВ', 90, w('открытым'), 0, -40, { cps: 28, col: RED });
  ARW(g, w('шаг'), 0, 170, { s: 1.4 });
});
BS(90.7, D_('keanu_stage', 4), (g, t, w) => {
  g.cap('2019', 140, w('девятнадцатом') - 0.2, -600, -300, { cps: 12, r: -3 });
  cc(g, 'keanu_stage', w('сцену'), 120, 30, 1100, { r: -1 });
}, { keys: [[at('киану', 90), 1.2, 120, 30, 1.06]] });
BS(94.4, 'grid', (g, t, w) => {
  cc(g, 'keanu_stage', t + 0.05, -380, 60, 820, { r: -2, off: 6 });
  g.cap('«YOU\'RE BREATHTAKING!»', 96, w('you'), 300, -330, { cps: 28, col: RED });
  g.el('', GROW('ОЖИДАНИЯ', '#2bb673'), w('ожидания'), 520, 180, { from: [0, 80], upd: growUpd(w('ожидания'), 1.4, 1) });
  g.emo('🚀', 140, w('небес'), 760, 0, { float: 9 });
});
BS(101.4, 'grid', (g, t, w) => {
  cc(g, 'keanu_date', w('дату') - 0.2, -200, 20, 1000, { r: -2 });
  g.el('', PLATE('АПРЕЛЬ 2020', '#fff', RED), w('апрель'), 560, -260, { from: [0, 140], float: 4, z: 5 });
});
BS(105.2, 'grid', (g, t, w) => {
  g.cap('ДАТА УПОЛЗАЕТ', 110, w('уползать') - 0.3, 0, -360, { cps: 22 });
  [['АПРЕЛЬ', t + 0.3], ['СЕНТЯБРЬ', w('сентябрь')], ['НОЯБРЬ', w('ноябрь')], ['10 ДЕКАБРЯ', w('десятое')]].forEach(([m, tt], i) => {
    const x = -560 + i * 400;
    g.el('', TILE(m, i === 3 ? `color:${RED}` : ''), tt, x, 40, { from: [0, 140], float: 4, r: i % 2 ? 2 : -2 });
    if (i < 3) X(g, [w('сентябрь'), w('ноябрь'), w('десятое')][i] - 0.15, x, 40, 200);
    if (i) link(g, tt - 0.15, x - 200, 40, 100, 0);
  });
  g.el('', PLATE('ИГРА УЖЕ ГОТОВА К ПЕЧАТИ ДИСКОВ', '#fff', INK), w('готова'), 0, 280, { from: [0, 140], float: 4 });
}, { z: 0.9, keys: [[at('сентябрь', 105), 0.5, -300, 0, 0.95], [at('ноябрь', 105), 0.5, 0, 0, 0.95], [at('десятое', 105), 0.6, 250, 0, 0.95], [at('десятое', 105) + 1.2, 0.7, 40, 20, 0.86]] });
BS(115.8, 'grid', (g, t, w) => {
  g.cap('«ЕЩЁ НЕМНОГО ВРЕМЕНИ»', 100, w('нужно'), 0, -300, { cps: 30 });
  g.el('', CLOCK, w('времени'), -380, 60, { from: [0, 200], float: 5, upd: clockUpd });
  g.el('', PLATE('НА ПОЛИРОВКУ', '#fff', '#2a6cff'), w('полировку'), 300, 60, { from: [0, 140], float: 4 });
  g.emo('✨', 140, w('полировку') + 0.3, 560, -100, { float: 9 });
});
BS(120.5, 'grid', (g, t, w) => {
  g.emo('😩', 200, w('команда'), -480, -20, { float: 7 });
  g.el('', CLOCK, w('компании'), 120, -40, { from: [0, 200], s: 0.8, float: 4, upd: (tt, d) => clockUpd(tt * 8, d) });
  g.el('', PLATE('ЖЁСТКИЕ ПЕРЕРАБОТКИ', '#fff', RED), w('переработок'), 120, 230, { from: [0, 140], float: 4 });
  g.emo('📰', 140, w('журналисты'), 600, -220, { float: 8 });
  g.el('', TILE('ХОТЯ ОБЕЩАЛИ<br>БЕЗ НИХ'), w('обещало'), 600, 60, { from: [200, 0], float: 4, r: 3 });
});
BS(130.6, PCB, (g, t, w) => { SLAM(g, 'ЧТО ПОШЛО НЕ ТАК?', w('пошло') - 0.2, 150); g.emo('🤔', 150, w('вспомнить'), 0, 230, { float: 9 }); });
// ---------- город под мощные ПК ----------
BS(135.9, 'grid', (g, t, w) => {
  cc(g, 'drive_night', t + 0.1, -300, -40, 920, { r: -2 });
  g.emo('🖥️', 200, w('мощные'), 560, -120, { float: 7 });
  g.el('', PLATE('ПОД МОЩНЫЕ ПК', '#fff', RED), w('компьютеры'), 560, 110, { from: [0, 140], float: 4 });
});
BS(141.9, 'grid', (g, t, w) => {
  cp(g, 'city2.jpg', t + 0.1, -240, 40, 980, 551, { r: -2 });
  g.cap('НАЙТ-СИТИ', 120, t + 0.2, -240, -330, { cps: 20 });
  g.emo('⬆️', 200, w('вверх'), 600, -60, { float: 10 });
  g.el('', PLATE('РАСТЁТ ВВЕРХ', '#fff', INK), w('растёт'), 600, 160, { from: [0, 140], float: 4 });
});
BS(147.0, 'grid', (g, t, w) => {
  cp(g, 'city1.jpg', t + 0.1, 0, 30, 760, 428, { r: -1 });
  [['🏙️', 'НЕБОСКРЁБЫ', 'небоскрёбы'], ['🌉', 'МОСТЫ', 'мосты'], ['🛣️', 'ЭСТАКАДЫ', 'эстакады'], ['🏪', 'РЫНКИ', 'многоэтажные'], ['💡', 'НЕОН', 'неоновые'], ['👥', 'СОТНИ ЛЮДЕЙ', 'сотни'], ['🚗', 'ПОТОК МАШИН', 'поток']].forEach(([e, txt, word], i) => {
    const a = -Math.PI / 2 + (i / 7) * Math.PI * 2;
    g.el('', ROLE(e, txt), w(word), Math.cos(a) * 720, 30 + Math.sin(a) * 380, { from: [-Math.cos(a) * 200, -Math.sin(a) * 200], float: 5, z: 5 });
  });
}, { z: 0.9 });
BS(155.2, 'grid', (g, t, w) => {
  g.cap('ВСЁ ЭТО — ОДНОВРЕМЕННО', 100, w('одновременно') - 0.4, 0, -380, { cps: 32 });
  [['city2.jpg', null, 'С КРЫШИ', 'крыши'], [null, 'drive_mid', 'ИЗ МАШИНЫ', 'машины'], [null, 'demo_market', 'С БАЛКОНА', 'балкона']].forEach(([img, clip, lab, word], i) => {
    const x = -620 + i * 620;
    if (img) cp(g, img, w(word), x, 30, 560, 315, { r: i - 1 }); else cc(g, clip, w(word), x, 30, 560, { r: i - 1, off: 3 });
    g.el('', PLATE(lab, '#fff', INK), w(word) + 0.2, x, 250, { from: [0, 120], float: 4, z: 5 });
  });
}, { z: 0.92 });
// ---------- железо PS4 ----------
BS(161.6, BLUE, (g, t, w) => {
  PS4(g, t + 0.1, -300, 80, 340);
  g.cap('PS4 В 2020', 110, w('ps4'), -300, -260, { cps: 20 });
  NUM(g, '7 ЛЕТ', 'консоли', w('семь'), 500, 40, RED);
});
BS(167.9, 'grid', (g, t, w) => {
  g.el('', SOCC('AMD', 'JAGUAR', 'центральный процессор'), t + 0.1, -470, -20, { from: [0, 220], r: -3, float: 6 });
  g.el('', CORESG, w('восемь'), 260, -170, { from: [0, 160], float: 5, upd: coresUpd(w('восемь') + 0.1) });
  g.cap('8 МЕДЛЕННЫХ ЯДЕР', 70, w('медленных'), 260, 20, { cps: 26 });
  g.emo('💻', 150, w('ноутбуки'), 260, 220, { float: 8 });
});
BS(173.9, 'grid', (g, t, w) => {
  g.el('', RAMST, t + 0.1, 0, 80, { from: [0, 220], r: -2, float: 5, upd: ramUpd(w('гигабайт')) });
  NUM(g, '~5 ГБ', 'доступно игре', w('пять'), 0, -220, RED);
});
BS(176.7, 'grid', (g, t, w) => {
  g.el('', HDDSV, t + 0.1, -420, 0, { from: [0, 240], r: -3, float: 5, upd: hddUpd(0.5) });
  NUM(g, '5400', 'оборотов в минуту', w('пять'), 380, -80);
  g.emo('🐌', 150, w('минуту'), 620, 220, { float: 8 });
});
BS(181.1, 'grid', (g, t, w) => {
  g.prop(RA('rdr2_logo.png'), 140, w('red'), -380, -300, { float: 4 });
  g.prop('/gta4_ps3/assets/rockstar.png', 170, w('rockstar'), -700, -300, { r: -6, float: 6 });
  g.prop(RA('horse.png'), 460, w('лошади'), -380, 90, { from: [-200, 0], float: 4 });
  g.el('', PLATE('ДОРОГИ ПОД ДИСК', '#fff', INK), w('дороги'), 440, -80, { from: [200, 0], float: 4 });
  g.el('', PLATE('СКОРОСТЬ ПОД ДИСК', '#fff', INK), w('скорость'), 440, 70, { from: [200, 0], float: 4 });
  g.el('', PLATE('МИР ПОД КОНСОЛЬ ✅', '#fff', '#2bb673'), w('успевала'), 440, 240, { from: [200, 0], float: 4 });
});
BS(191.5, PCB, (g, t, w) => {
  cpp(g, 'cp_logo.png', 150, t + 0.1, 0, -330, { filter: 'drop-shadow(0 0 30px rgba(252,238,10,.35))' });
  g.emo('🖥️', 200, w('мощное'), -520, 20, { float: 7 });
  g.cap('МИР МЕЧТЫ', 80, w('мощное') + 0.2, -520, 200, { cps: 20 });
  ARW(g, w('втиснуть') - 0.3, -60, 20);
  PS4(g, w('втиснуть'), 440, 40, 260);
  g.cap('СТАРАЯ КОНСОЛЬ', 80, w('старую'), 440, 220, { cps: 24 });
});
// ---------- реклама (подводка — наш монтаж, дальше ролик блогера) ----------
AD(TL.ADS);
beat(TL.ADS + 15.15, PCB, () => {});
// ---------- что получилось на PS4 ----------
BS(198.75, PCB, (g, t, w) => { SLAM(g, 'И ВОТ ЧТО ПОЛУЧИЛОСЬ', t + 0.15, 140); PS4(g, t + 0.5, 0, 240, 240); }, { keys: [[S(198.75), 1.6, 0, 0, 1.06]] });
BS(200.4, 'grid', (g, t, w) => {
  g.cap('1 · ПОДГРУЗКА', 110, t + 0.1, -300, -380, { cps: 20 });
  cc(g, 'drive_night', w('едете'), -280, 20, 920, { r: -2, off: 6 });
  g.el('', HDDSV, w('диска'), 560, 40, { from: [0, 220], s: 0.7, float: 4, upd: hddUpd(0.5) });
});
BS(208.0, 'grid', (g, t, w) => {
  g.el('', HDDSV, t + 0.1, -620, 20, { from: [0, 220], s: 0.7, float: 4, upd: hddUpd(0.6) });
  [['🏢', 'ЗДАНИЯ', 'здания'], ['🧱', 'ТЕКСТУРЫ', 'текстуры'], ['🪧', 'ВЫВЕСКИ', 'вывески'], ['👥', 'ЛЮДИ', 'людей'], ['🚗', 'МАШИНЫ', 'машины']].forEach(([e, txt, word], i) =>
    g.el('', ROLE(e, txt), w(word), 60 + (i % 2) * 380, -280 + i * 140, { from: [-500, 0], float: 5 }));
});
BS(212.0, 'grid', (g, t, w) => {
  cp(g, 'city1.jpg', t + 0.1, -320, -40, 880, 495, { r: -2 });
  g.el('', GROW('ДАННЫЕ', RED), w('данных'), 540, -40, { from: [0, 80], upd: growUpd(w('данных'), 1.5, 1) });
  g.el('', PLATE('ОГРОМНОЕ КОЛИЧЕСТВО', '#fff', INK), w('огромное'), 540, 120, { from: [0, 140], float: 4 });
});
BS(217.1, 'grid', (g, t, w) => {
  g.el('', HDDSV, t + 0.1, -380, 0, { from: [0, 240], r: -3, float: 4, upd: hddUpd(0.3) });
  g.el('', PLATE('НЕ УСПЕВАЛ', '#fff', RED), w('успевал'), 380, -40, { from: [0, 140], float: 4 });
  g.emo('🐌', 170, w('успевал') + 0.2, 380, 200, { float: 8 });
});
BS(220.5, 'grid', (g, t, w) => {
  cp(g, 'city2.jpg', t + 0.1, -240, 20, 1000, 562, { r: -2, upd: blurLoop(t + 0.1, 2.4) });
  g.el('', PLATE('СНАЧАЛА РАЗМЫТО', '#fff', INK), w('размытыми'), 600, -150, { from: [200, 0], float: 4, z: 5 });
  g.el('', PLATE('ПОТОМ ЧЁТКО', '#fff', '#2bb673'), w('прорисовывались'), 600, 20, { from: [200, 0], float: 4, z: 5 });
});
BS(225.3, 'grid', (g, t, w) => {
  cc(g, 'bugs_road', t + 0.1, -200, 20, 1050, { r: -1 });
  g.el('', PLATE('ТЕКСТУРЫ НА ГЛАЗАХ', '#fff', RED), w('глазах') - 0.3, 520, 330, { from: [0, 140], float: 4, z: 5 });
});
BS(227.7, 'grid', (g, t, w) => {
  cc(g, 'bugs_fog', t + 0.1, -200, 0, 1050, { r: 1 });
  g.emo('💨', 150, w('быстро'), 620, -280, { float: 8 });
  g.el('', PLATE('ДОРОГА НЕ УСПЕВАЕТ ПОЯВИТЬСЯ', '#fff', RED), w('дорогу'), 100, 340, { from: [0, 140], float: 4, z: 5 });
});
BS(233.2, BLUE, (g, t, w) => { SLAM(g, '2 · ПАМЯТЬ', t + 0.15, 180); g.el('', RAMST, t + 0.5, 0, 260, { s: 0.6, from: [0, 200], upd: ramUpd(t + 0.7) }); });
BS(234.8, 'grid', (g, t, w) => {
  g.el('', CULL, t + 0.1, -220, 30, { from: [0, 200], float: 4, upd: cullUpd });
  g.el('', PLATE('ЧЕГО НЕ ВИДНО — ВЫБРОСИТЬ', '#fff', RED), w('выбрасывать'), 300, -330, { from: [0, 140], float: 4 });
  g.emo('🗑️', 170, w('видите'), 620, 60, { float: 8 });
});
BS(239.4, 'grid', (g, t, w) => {
  cc(g, 'drive_mid', t + 0.1, -300, 20, 900, { r: -2, off: 4 });
  ['🚗', '🚙', '🚕'].forEach((e, i) => g.emo(e, 130, t + 0.3 + i * 0.15, 420 + i * 160, -160, { float: 6, t1: w('исчезли') }));
  g.el('', PLATE('ОТВЕРНУЛИСЬ — ИСЧЕЗЛИ', '#fff', RED), w('исчезли'), 560, 0, { from: [0, 140], float: 4, z: 5 });
  ['🚓', '🚐', '🚌'].forEach((e, i) => g.emo(e, 130, w('другие') + i * 0.15, 420 + i * 160, 200, { float: 6 }));
});
BS(246.8, 'grid', (g, t, w) => {
  cc(g, 'demo_crowd', t + 0.1, -280, 20, 920, { r: -2, off: 5 });
  g.emo('👻', 180, w('воздуха'), 560, -120, { float: 9 });
  g.el('', PLATE('ИЗ ВОЗДУХА', '#fff', INK), w('воздуха') + 0.2, 560, 110, { from: [0, 140], float: 4 });
});
BS(250.5, 'grid', (g, t, w) => {
  g.cap('«ЖИВОЙ ГОРОД»', 130, w('живой'), -120, -60, { cps: 20 });
  g.emo('🤨', 200, w('заметно'), 600, 0, { float: 8 });
});
BS(255.2, BLUE, (g, t, w) => { SLAM(g, '3 · ПРОЦЕССОР', t + 0.15, 170); g.el('', SOCC('AMD', 'JAGUAR', 'процессор', 240), t + 0.5, 0, 270, { from: [0, 200] }); });
BS(257.1, 'grid', (g, t, w) => {
  cc(g, 'demo_crowd', t + 0.1, -300, -60, 860, { r: -2, off: 9 });
  g.el('', ROLE('🧍', 'ДВИЖЕНИЕ · РЕАКЦИЯ · ПОВЕДЕНИЕ'), w('персонаж'), -300, 300, { from: [0, 140], float: 5, z: 5 });
  g.emo('🚗', 160, w('машина'), 560, -160, { float: 8 });
  g.el('', ROLE('⚙️', 'ФИЗИКА + МАРШРУТ'), w('физика'), 560, 60, { from: [200, 0], float: 5 });
});
BS(266.9, 'grid', (g, t, w) => {
  g.el('', CORESG, t + 0.1, -300, -60, { from: [0, 200], float: 5, upd: (tt, d) => d.querySelectorAll('.cr').forEach((c, i) => { c.style.background = Math.sin(tt * 9 + i) > -0.2 ? RED : '#ff8a8a'; }) });
  g.el('', PLATE('ТОЛПЫ УРЕЗАЛИ', '#fff', INK), w('урезали'), -300, 180, { from: [0, 140], float: 4 });
  g.emo('🥵', 200, w('справлялись'), 520, -40, { float: 8 });
  g.el('', PLATE('JAGUAR НЕ СПРАВЛЯЕТСЯ', '#fff', RED), w('справлялись') + 0.2, 520, 180, { from: [0, 140], float: 4 });
});
BS(273.0, 'grid', (g, t, w) => {
  cc(g, 'cmp_drive', t + 0.1, -240, 0, 1100, { r: -1 });
  NUM(g, '< 20', 'кадров в секунду', w('двадцати'), 640, -220, RED, { z: 5 });
  g.el('', PLATE('ТОРМОЗИТ В ПЕРЕСТРЕЛКАХ', '#fff', INK), w('перестрелках'), 300, 340, { from: [0, 140], float: 4, z: 5 });
});
BS(281.3, BLUE, (g, t, w) => { SLAM(g, '4 · КАРТИНКА', t + 0.15, 170); g.emo('🖼️', 150, t + 0.5, 0, 240, { float: 8 }); });
BS(283.3, 'grid', (g, t, w) => {
  g.el('', PIX, t + 0.1, -200, 20, { from: [0, 200], float: 4 });
  g.el('', PLATE('РАЗРЕШЕНИЕ ПАДАЕТ', '#fff', RED), w('разрешение'), 560, -100, { from: [200, 0], float: 4 });
  g.emo('📉', 160, w('снижала'), 560, 130, { float: 8 });
});
BS(289.7, 'grid', (g, t, w) => {
  cc(g, 'cmp_face', t + 0.1, -240, 20, 1060, { r: -1 });
  NUM(g, '~720p', 'временами', w('720'), 640, -220, RED, { z: 5 });
  g.emo('🧼', 160, w('мыло'), 660, 230, { float: 8 });
});
BS(295.9, 'grid', (g, t, w) => {
  cc(g, 'bugs_bike', w('вылеты'), -520, -200, 680, { r: -3 });
  cc(g, 'bugs_arm', w('позах'), 400, -200, 680, { r: 3 });
  cc(g, 'bugs_float', w('проваливающиеся') - 0.3, -60, 230, 720, { r: -1 });
  ['💥 ВЫЛЕТЫ', '📋 СЛОМАННЫЕ ЗАДАНИЯ', '🤸 СТРАННЫЕ ПОЗЫ'].forEach((txt, i) => g.el('', PLATE(txt, '#fff', i ? INK : RED), [w('вылеты'), w('сломанные'), w('позах')][i] + 0.2, -600 + i * 600, 60 + (i === 1 ? -330 : 0), { from: [0, 120], float: 4, z: 6 }));
  g.el('', PLATE('МАШИНЫ СКВОЗЬ АСФАЛЬТ', '#fff', RED), w('асфальт'), 520, 360, { from: [0, 120], float: 4, z: 6 });
}, { z: 0.9 });
// ---------- почему никто не знал ----------
BS(306.7, PCB, (g, t, w) => { SLAM(g, 'ПОЧЕМУ НИКТО НЕ ЗНАЛ?', t + 0.15, 140); g.emo('🕵️', 150, w('кроется'), 0, 240, { float: 8 }); });
BS(312.8, 'grid', (g, t, w) => {
  g.cap('КОПИИ ДЛЯ ОБЗОРОВ', 100, w('журналисты'), 0, -350, { cps: 28 });
  g.emo('🖥️', 220, w('компьютеров'), -380, 0, { float: 7 });
  g.emo('✅', 120, w('компьютеров') + 0.2, -250, 120, { float: 6 });
  PS4(g, w('компьютеров') + 0.4, 380, 20, 260);
  X(g, w('компьютеров') + 0.6, 380, 20, 260);
});
BS(317.1, 'grid', (g, t, w) => {
  cc(g, 'drive_day', t + 0.1, -280, 0, 940, { r: -2, off: 8 });
  g.el('', PLATE('НА ПК — ПОТРЯСАЮЩЕ', '#fff', '#2bb673'), w('потрясающе'), 560, -180, { from: [200, 0], float: 4, z: 5 });
  g.cap('⭐⭐⭐⭐⭐', 90, w('обзоры'), 560, 60, { cps: 12, r: 0 });
  g.el('', PLATE('ВЫСОКИЕ ОЦЕНКИ', '#fff', INK), w('высокие'), 560, 220, { from: [200, 0], float: 4, z: 5 });
});
BS(324.5, BLUE, (g, t, w) => {
  PS4(g, t + 0.1, -300, 60, 320);
  g.emo('🙈', 200, w('видел'), 380, -40, { float: 8 });
  g.el('', PLATE('ВЕРСИЮ ДЛЯ PS4 НЕ ПОКАЗЫВАЛИ', '#fff', RED), w('видел') + 0.2, 0, 320, { from: [0, 140], float: 4 });
});
BS(329.6, 'grid', (g, t, w) => {
  NUM(g, 'МИЛЛИОНЫ', 'предзаказов', w('миллионы'), -440, -60);
  g.emo('🛒', 160, w('предзаказ'), -440, 230, { float: 8 });
  PS4(g, w('консоли'), 420, 20, 280);
  g.cap('УЖЕ ДОМА', 80, w('дома'), 420, 220, { cps: 20 });
});
BS(336.1, 'grid', (g, t, w) => {
  g.cap('10.12.2020', 160, t + 0.1, -300, -60, { cps: 16, r: -2 });
  g.emo('💥', 220, w('взорвался'), 520, -40, { float: 8 });
  g.emo('📱', 140, w('интернет'), 380, 220, { float: 8 });
});
BS(340.5, 'grid', (g, t, w) => {
  cc(g, 'bugs_float', w('летающими'), -480, -170, 760, { r: -3, off: 2 });
  cc(g, 'bugs_stuck', w('исчезающими'), 420, -170, 760, { r: 3 });
  cc(g, 'bugs_arm', w('ти'), -60, 240, 760, { r: -1, off: 3 });
  g.el('', PLATE('ВИРУСНЫЕ ВИДЕО', '#fff', RED), w('соцсетям'), 600, 330, { from: [0, 120], float: 4, z: 6 });
}, { z: 0.9 });
BS(346.9, 'grid', (g, t, w) => {
  cpp(g, 'cdpr_logo.png', 300, t + 0.1, -440, -40, { filter: 'none' });
  g.emo('🙏', 170, w('извинения'), 320, -150, { float: 8 });
  g.el('', PLATE('ИЗВИНЕНИЯ', '#fff', INK), w('извинения') + 0.2, 320, 60, { from: [0, 140], float: 4 });
  g.el('', PLATE('ВОЗВРАТ ДЕНЕГ', '#fff', RED), w('вернуть'), 320, 210, { from: [0, 140], float: 4 });
});
BS(353.3, 'grid', (g, t, w) => {
  g.cap('18 ДЕКАБРЯ', 110, w('восемнадцатого'), -380, -370, { cps: 20 });
  cp(g, 'refund.jpg', w('sony'), 0, 0, 1250, 505, { r: -1 });
  g.el('', PLATE('СНЯТА С PS STORE', '#fff', RED), w('сняла'), 420, 330, { from: [0, 140], float: 4, z: 5 });
});
BS(361.4, PCB, (g, t, w) => {
  SLAM(g, 'ШОК', t + 0.15, 230);
  g.emo('😱', 160, t + 0.5, 0, 240, { float: 9 });
  g.cap('ГЛАВНАЯ ИГРА ГОДА — ВНЕ МАГАЗИНА', 64, w('крупнейшую'), 0, -260, { cps: 34, col: '#fff', r: 0 });
});
BS(368.2, 'grid', (g, t, w) => {
  g.el('', STOCK, t + 0.1, -320, 0, { from: [0, 200], float: 4, upd: stockUpd(w('акции')) });
  g.cap('АКЦИИ ↓', 100, w('упали'), -320, -330, { cps: 16, col: RED });
  g.emo('⚖️', 180, w('суд'), 520, -150, { float: 8 });
  g.el('', PLATE('ИСК ИНВЕСТОРОВ', '#fff', INK), w('суд') + 0.2, 520, 60, { from: [0, 140], float: 4 });
  g.el('', PLATE('МИРОВОЕ СОГЛАШЕНИЕ', '#fff', '#2a6cff'), w('мировым'), 520, 210, { from: [0, 140], float: 4 });
});
BS(376.2, BLUE, (g, t, w) => {
  g.cap('ВОЗВРАЩЕНИЕ В PS STORE', 96, t + 0.2, 0, -320, { cps: 30 });
  NUM(g, 'ЛЕТО 2021', 'через полгода', w('летом'), -380, 20);
  g.emo('⚠️', 160, w('предупреждением'), 360, -40, { float: 8 });
  g.el('', PLATE('НА ОБЫЧНОЙ PS4 МОЖЕТ РАБОТАТЬ ПЛОХО', '#fff', RED), w('предупреждением') + 0.3, 200, 220, { from: [0, 140], float: 4 });
});
// ---------- зачем выпустили ----------
BS(386.1, PCB, (g, t, w) => { SLAM(g, 'ЗАЧЕМ ВЫПУСКАТЬ НА PS4?', t + 0.15, 130); });
BS(390.7, 'grid', (g, t, w) => {
  g.cap('ОТВЕТ — В ЦИФРАХ', 100, t + 0.1, 0, -380, { cps: 26 });
  NUM(g, 'ДЕСЯТКИ МЛН', 'владельцев PS4 и Xbox One', w('десятки'), -440, -40);
  PS4(g, w('владельцев'), -440, 240, 230);
  PS5(g, w('новые'), 480, 40, 480);
  g.el('', PLATE('НЕ КУПИТЬ', '#fff', RED), w('купить'), 480, 300, { from: [0, 140], float: 4, z: 6 });
});
BS(401.1, 'grid', (g, t, w) => {
  g.emo('💸', 220, w('отказаться'), -420, 0, { float: 8 });
  g.el('', GROW('ПОКУПАТЕЛИ', RED), w('потерять'), 300, -40, { from: [0, 80], upd: (tt, d) => { d.querySelector('.gb').style.width = (100 - 70 * E.inOut(P(tt, at('потерять', S(401)), 1.4))).toFixed(1) + '%'; } });
});
BS(406.0, 'grid', (g, t, w) => {
  g.emo('🩹', 200, w('патчами'), -460, -60, { float: 8 });
  g.el('', PLATE('ИСПРАВИТЬ ПАТЧАМИ К ВЫХОДУ', '#fff', INK), w('патчами') + 0.2, -100, 180, { from: [0, 140], float: 4 });
  g.el('', CLOCK, w('успеет'), 640, -60, { from: [0, 200], s: 0.8, float: 4, upd: (tt, d) => clockUpd(tt * 6, d) });
  g.cap('НЕ УСПЕЛА', 160, at('не', at('выходу', S(406))), -60, -60, { cps: 20, col: RED, r: -4 });
});
BS(411.2, 'grid', (g, t, w) => {
  g.cap('ПАТЧ ЗА ПАТЧЕМ', 110, w('патч'), 0, -360, { cps: 22 });
  PATCHES.forEach((p, i) => g.el('', TILE(p), w('патч') + 0.2 + i * 0.35, -720 + i * 360, -100, { from: [0, 140], float: 4, r: i % 2 ? 2 : -2 }));
  g.el('', GROW('СТАБИЛЬНОСТЬ', '#2bb673'), w('стабильнее'), 0, 160, { from: [0, 80], upd: growUpd(w('стабильнее'), 4, 0.8) });
});
BS(416.8, 'grid', (g, t, w) => {
  cc(g, 'drive_mid', t + 0.1, -280, 20, 920, { r: -2, off: 8 });
  g.el('', PLATE('ВЫЛЕТОВ МЕНЬШЕ ✅', '#fff', '#2bb673'), w('вылетов'), 560, -120, { from: [200, 0], float: 4, z: 5 });
  g.el('', PLATE('ГОРОД НЕ РАССЫПАЕТСЯ ✅', '#fff', '#2bb673'), w('рассыпаться'), 520, 60, { from: [200, 0], float: 4, z: 5 });
});
BS(421.5, 'grid', (g, t, w) => {
  PS5(g, w('ps5') - 0.2, -560, 30, 560);
  cc(g, 'cmp_night', w('series'), 260, -40, 1000, { r: 1 });
  g.el('', PLATE('2022 · PS5 И XBOX SERIES', '#fff', '#2a6cff'), w('вышла'), 260, 320, { from: [0, 140], float: 4, z: 5 });
});
// ---------- Edgerunners и 2.0 ----------
BS(431.0, PCB, (g, t, w) => { SLAM(g, 'ЧЕГО НИКТО НЕ ОЖИДАЛ', t + 0.15, 130); g.emo('😮', 150, t + 0.6, 0, 230, { float: 8 }); });
BS(434.3, 'grid', (g, t, w) => {
  g.el('', EDGE, w('аниме'), -260, -40, { from: [0, 220], r: -2, float: 5 });
  g.emo('📺', 160, w('хитом'), 520, -200, { float: 8 });
  g.el('', PLATE('ВТОРОЙ ШАНС', '#fff', '#2bb673'), w('второй'), 520, 40, { from: [0, 140], float: 4 });
  NUM(g, 'МИЛЛИОНЫ', 'вернулись в игру', w('миллионы'), 520, 260, INK, { s: 0.8 });
});
BS(443.6, 'grid', (g, t, w) => {
  g.el('', GROW('ОНЛАЙН', '#2bb673'), w('онлайн'), -300, -100, { from: [0, 80], upd: growUpd(w('вырос'), 1.4, 1) });
  g.el('', GROW('ОТЗЫВЫ В STEAM', '#2a6cff'), w('отзывы'), -300, 80, { from: [0, 80], upd: growUpd(w('теплее'), 1.4, 0.85) });
  g.emo('📈', 170, w('вырос'), 500, -60, { float: 8 });
  g.emo('👍', 150, w('теплее'), 520, 170, { float: 8 });
});
BS(448.7, 'grid', (g, t, w) => {
  g.el('', BIGNUM('2.0', 'большое обновление', RED), w('обновление'), -380, -20, { from: [0, 180], float: 6 });
  g.el('', TILE('PHANTOM<br>LIBERTY', 'font-size:80px'), w('phantom'), 380, -20, { from: [0, 180], float: 5, r: 3 });
  g.cap('2023', 120, w('третьем') - 0.3, 0, -340, { cps: 12 });
});
BS(454.8, 'grid', (g, t, w) => {
  g.cap('ПЕРЕДЕЛАЛИ', 110, t + 0.1, 0, -360, { cps: 20 });
  [['📈', 'ПРОКАЧКА', 'прокачки'], ['🚓', 'ПОЛИЦИЯ', 'полицию'], ['🧠', 'ИИ', 'искусственный'], ['🚗', 'ВОЖДЕНИЕ', 'вождение']].forEach(([e, txt, word], i) =>
    g.el('', ROLE(e, txt), w(word), (i % 2 ? 360 : -360), -100 + Math.floor(i / 2) * 200, { from: [0, 140], float: 5 }));
});
BS(460.3, 'grid', (g, t, w) => {
  cc(g, 'drive_day', t + 0.1, -200, 0, 1100, { r: -1, off: 12 });
  g.el('', PLATE('ПО СУТИ — ДРУГАЯ ИГРА', '#fff', '#2bb673'), w('другая'), 300, 340, { from: [0, 140], float: 4, z: 5 });
  g.emo('✨', 150, w('цельная'), 680, -260, { float: 9 });
});
BS(464.4, BLUE, (g, t, w) => {
  g.cap('ВАЖНАЯ ДЕТАЛЬ', 110, t + 0.1, 0, -330, { cps: 20 });
  PS4(g, w('ps4'), 0, 60, 340);
  X(g, w('вышло') - 0.1, 0, 60, 380);
  g.el('', PLATE('НА PS4 И XBOX ONE — НЕТ', '#fff', RED), w('вышло'), 0, 300, { from: [0, 140], float: 4, z: 6 });
});
BS(470.2, 'grid', (g, t, w) => {
  cpp(g, 'cdpr_logo.png', 260, t + 0.1, -460, -40, { filter: 'none' });
  g.el('', TILE('«СТАРЫЕ КОНСОЛИ<br>НЕ ПОТЯНУТ»'), w('потянут') - 0.4, 340, -120, { from: [200, 0], float: 4 });
  g.el('', PLATE('ПОДДЕРЖКА ЗАВЕРШЕНА', '#fff', RED), w('прекратили'), 340, 120, { from: [200, 0], float: 4 });
});
// ---------- PS4 сегодня ----------
BS(476.9, 'grid', (g, t, w) => {
  cc(g, 'cmp_drive', t + 0.1, -200, 0, 1100, { r: -1, off: 9 });
  g.cap('PS4 СЕГОДНЯ', 110, w('сегодня'), -200, -380, { cps: 20 });
  g.emo('🕸️', 170, w('забыли'), 700, -260, { float: 8 });
});
BS(485.1, 'grid', (g, t, w) => {
  g.el('', GROW('СТАБИЛЬНОСТЬ', '#2bb673'), t + 0.1, 0, -80, { from: [0, 80], upd: growUpd(t + 0.2, 1.2, 0.75) });
  g.el('', PLATE('ЛУЧШЕ, ЧЕМ НА СТАРТЕ', '#fff', '#2bb673'), w('старте'), 0, 110, { from: [0, 140], float: 4 });
});
BS(487.8, 'grid', (g, t, w) => {
  cc(g, 'cmp_face', t + 0.1, -300, -40, 900, { r: -2, off: 4 });
  [['🧼', 'МЫЛЬНАЯ КАРТИНКА', 'мыльная'], ['📉', 'КАДРЫ ПРОСЕДАЮТ', 'проседают'], ['⏳', 'ГОРОД ГРУЗИТСЯ НА ГЛАЗАХ', 'подгружается']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), 520, -200 + i * 170, { from: [200, 0], float: 5, z: 5 }));
});
BS(495.0, 'grid', (g, t, w) => {
  PS5(g, w('ps5'), -440, 20, 560);
  g.emo('✨', 150, w('жизнь'), -200, -240, { float: 9 });
  g.el('', PLATE('ВТОРАЯ ЖИЗНЬ', '#fff', '#2bb673'), w('жизнь') + 0.2, -440, 330, { from: [0, 140], float: 4, z: 5 });
  PS4(g, w('ps4'), 440, 40, 260, { filter: 'grayscale(1) drop-shadow(0 30px 30px rgba(0,0,0,.32))' });
  g.emo('🕸️', 150, w('застряла'), 560, -160, { float: 8 });
  g.el('', PLATE('ЗАСТРЯЛА В ПРОШЛОМ', '#fff', RED), w('прошлом'), 440, 260, { from: [0, 140], float: 4, z: 5 });
});
BS(502.2, 'grid', (g, t, w) => {
  cp(g, 'cover.jpg', t + 0.1, -560, 20, 420, 538, { r: -4 });
  NUM(g, '25 МЛН+', 'проданных копий', w('двадцать'), 0, -200, RED);
  g.cap('⭐⭐⭐⭐⭐', 80, w('оценки'), 0, 40, { cps: 12, r: 0 });
  g.el('', PLATE('ИСТОРИЯ ВОЗВРАЩЕНИЯ', '#fff', '#2bb673'), w('возвращения'), 0, 220, { from: [0, 140], float: 4 });
  cpp(g, 'vi_cut.png', 760, w('спаслась') + 0.4, 700, 120, { from: [300, 0] });
});
// ---------- урок ----------
BS(518.7, PCB, (g, t, w) => { SLAM(g, 'ГЛАВНЫЙ УРОК', t + 0.15, 170); g.emo('🎓', 150, t + 0.6, 0, 240, { float: 9 }); });
BS(520.8, 'grid', (g, t, w) => {
  g.el('', TILE('ОПТИМИЗАЦИЮ НЕЛЬЗЯ<br>ДОБАВИТЬ В КОНЦЕ'), w('оптимизация'), 0, -60, { from: [0, 180], float: 4 });
  g.emo('🧱', 150, w('конце'), 0, 220, { float: 8 });
});
BS(525.1, 'grid', (g, t, w) => {
  g.prop('/gta4_ps3/assets/rockstar.png', 200, w('rockstar'), -560, -100, { r: -6, float: 6 });
  g.el('', NDLOGO, w('naughty'), 140, -100, { from: [0, 160], s: 0.7, float: 4 });
  g.el('', PLATE('С ПЕРВОГО ДНЯ — ПОД КОНСОЛЬ', '#fff', '#2bb673'), w('первого'), 0, 200, { from: [0, 140], float: 4 });
});
BS(532.9, 'grid', (g, t, w) => {
  [['👁️', 'ЧТО ИГРОК УВИДИТ', 'увидит'], ['🧠', 'СКОЛЬКО ПАМЯТИ ГОРОДУ', 'памяти'], ['💽', 'КАК БЫСТРО ГРУЗИТ ДИСК', 'диск']].forEach(([e, txt, word], i) =>
    g.el('', ROLE(e, txt), w(word), (i - 1) * 120, -200 + i * 180, { from: [i % 2 ? 300 : -300, 0], float: 5 }));
  g.cap('ЗАРАНЕЕ', 100, w('заранее'), 0, -380, { cps: 20, col: '#2bb673' });
});
BS(541.7, 'grid', (g, t, w) => {
  cp(g, 'city1.jpg', w('мечты'), -360, 40, 720, 405, { r: -3 });
  g.cap('МИР МЕЧТЫ', 90, w('мечты') + 0.2, -360, -250, { cps: 20 });
  ARW(g, w('втиснуть') - 0.2, 150, 40);
  PS4(g, w('втиснуть'), 520, 40, 250);
  g.cap('НА 7 ЛЕТ СТАРШЕ', 70, w('семь'), 520, 220, { cps: 24, col: RED });
});
BS(550.8, PCB, (g, t, w) => {
  PS4(g, t + 0.1, 0, 200, 300, { upd: (tt, d) => { if (tt > t + 0.8) d.style.transform += ` translate(${(Math.sin(tt * 70) * 4).toFixed(1)}px,${(Math.cos(tt * 63) * 3).toFixed(1)}px)`; } });
  SLAM(g, 'PS4 НЕ ВЫДЕРЖАЛА', t + 0.3, 150);
  g.emo('💥', 150, w('выдержала'), 380, 160, { float: 9 });
}, { keys: [[S(550.8), 2.2, 0, 0, 1.08]] });
BS(553.5, 'grid', (g, t, w) => {
  PS4(g, w('старой'), -440, 20, 280);
  g.cap('ИЛИ', 110, w('или'), 0, 0, { cps: 10 });
  PS5(g, w('новой'), 440, 20, 520);
  g.emo('💬', 170, w('напишите'), 0, -300, { float: 9 });
  g.el('', PLATE('ПИШИТЕ В КОММЕНТАРИЯХ', '#fff', INK), w('комментариях'), 0, 330, { from: [0, 140], float: 4, z: 5 });
});
BS(561.3, 'grid', (g, t, w) => {
  cpp(g, 'vi_cut.png', 860, t + 0.05, -540, 80, { from: [0, 260] });
  g.cap('СПАСИБО ЗА ПРОСМОТР!', 100, t + 0.3, 260, -60, { cps: 30 });
  g.emo('👋', 170, t + 0.8, 260, 180, { float: 8 });
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
  (window.GFX || []).forEach((f) => f(t));
  const c = camAt(t);
  world.style.transform = `translate(960px,540px) perspective(2400px) rotateX(${(Math.sin(t * 0.21) * 5).toFixed(3)}deg) rotateY(${(Math.cos(t * 0.17) * 7).toFixed(3)}deg) rotate(${c.r.toFixed(3)}deg) scale(${c.z.toFixed(4)}) translate(${(-c.x).toFixed(1)}px,${(-c.y).toFixed(1)}px)`;
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
  beats.forEach((b) => { if (b.layer) b.layer.style.visibility = 'hidden'; });
  if (pb && pb.layer) { pb.layer.style.visibility = 'visible'; pb.layer.style.opacity = cb.layer ? 1 : 1 - k; pb.layer.style.zIndex = 1; pb.layer.style.transform = `translateX(${(-80 * k).toFixed(1)}px)`; }
  if (cb.layer) { cb.layer.style.visibility = 'visible'; cb.layer.style.opacity = k; cb.layer.style.zIndex = 2; cb.layer.style.transform = `translateX(${(80 * (1 - k) - (t - cb.t0) * 6).toFixed(1)}px) scale(${(1.04 + (t - cb.t0) * 0.006).toFixed(4)})`; }
  beats.forEach((b, i) => {
    const on = i >= cur - 1 && i <= cur + 1;
    b.root.style.display = on ? 'block' : 'none';
    if (on) b.items.forEach((it) => it.upd(t));
  });
}

window.renderAt = async (t) => { pend.length = 0; frame(t); await Promise.all(pend); };
window.DUR = 601.0;
(async () => {
  await document.fonts.load('700 60px Osw', 'НАСТОЯЩЕЕ БЕЗУМИЕ 256 МБ ?!'); await document.fonts.load('900 60px Mont', 'NAUGHTY DOG');
  await document.fonts.load('60px "Noto Color Emoji"', '🍋💪🤯🌍📱🧠🔥🎭🔍💾🎮✈️👊🌪️🌊🤖⭐➕🚗🏚️🔫🐾🤝🏆💡😱🥵🎭✨💥🎞️📋🔥🔍🚂🎥🏜️🎩🥷🧗👁️🎓🔴📷🏃🕺🎤🧠🗜️🗑️🚢⚙️🖼️↕️🚰💧📉⚡🕶️🧑‍🎨👷👩‍💻🎬🗿🖌️💻🎙️💸❓💾👥💵🤑🐌😐😮😠🤔🌫️☀️🔁🫣🤸🥊👕✂️💬✅➡️☀️🌧️❄️🍂🤖💬🔊🧠🖼️🌍⚠️🤲🤷👉👈🔍✊💦🎬🎭🖐️👀😵🏁💥⚙️🌿🔧🗑️⚡⏱️🥊🐢🔥📦📄🐺🎯😴⚔️📍⬅️➡️🧍‍♂️💡🔦🥵✅🦠🎨💧🏃👁️📐🧱😡😐👻');
  await document.fonts.load('60px "Noto Color Emoji"', [...new Set([...document.getElementById('world').textContent])].filter((c) => c.codePointAt(0) > 0x2000).join(''));
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  // фоны сцен грузим заранее, иначе в первый кадр сцены фон ещё пустой (белая вспышка)
  await Promise.all(beats.filter((b) => b.layer).map((b) => { const i = new Image(); i.src = b.layer.style.backgroundImage.slice(5, -2); return i.decode().catch(() => {}); }));
  window.__ready = true;
})();
