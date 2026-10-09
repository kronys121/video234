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
    prop(src, h, at, x, y, o = {}) { const i = new Image(); i.src = A(src); i.className = 'o'; i.style.height = h + 'px'; i.style.filter = o.filter || sh; b.root.appendChild(i); if (o.z) i.style.zIndex = o.z; return add(i, (t) => { popIn(i, t, at, x, y, o); if (o.upd) o.upd(t, i); }); },
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

// =====================================================================
//                         СЦЕНАРИЙ 
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

// 11 · Naughty Dog было всё равно
beat(63.59, 'dark:' + FR('trailer', 24.0), (g) => {
  g.el('', NDLOGO, 63.65, 0, -60, { shadow: false, s: 1.15, from: [0, 80] });
  g.cap('БЫЛО ВСЁ РАВНО', 110, 64.2, 0, 140, { cps: 18 });
});

// 12 · студии уходили от сложной PS3 → PS4 и Xbox One
beat(66.45, 'grid', (g) => {
  g.prop('/gta4_ps3/assets/rockstar.png', 200, 66.5, -640, -190, { r: -8, from: [-160, 0] });
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 230, 66.8, -120, 20, { from: [0, 120] });
  g.emo('🖐️', 170, 67.6, -440, 40, { from: [-200, 0], r: 10 });
  g.emo('🔍', 260, 68.77, -60, 10, { r: -12, z: 6 });
  g.cap('СЛОЖНАЯ АРХИТЕКТУРА', 66, 68.9, -120, 260, { cps: 28, until: 72.6 });
  g.emo('👀', 170, 70.4, 360, -260, { r: 6 });
  g.prop('ps4.png', 190, 70.77, 470, -40, { from: [220, 0], r: -3 });
  g.prop('xone.png', 200, 72.0, 760, 170, { from: [220, 0], r: 3 });
  g.cap('PS4 · XBOX ONE', 72, 72.4, 500, -400, { cps: 22 });
}, { keys: [[70.6, 0.8, 200, 0, 0.95]] });

// 13 · трата времени
beat(76.13, 'dark:' + FR('beauty', 24.2), (g) => {
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 220, 76.2, -470, 80, { from: [-160, 0] });
  g.prop('tlou_box.png', 420, 76.5, 470, 40, { from: [160, 0], r: 4 });
  g.el('width:300px;height:300px', CLOCK, 76.9, 0, -20, { upd: (t, d) => clockUpd(t * 3, d) });
  g.cap('ТРАТА ВРЕМЕНИ', 96, 78.13, 0, -370, { cps: 22 });
});

// 14 · одно преимущество
beat(80.29, 'dark:' + FR('trailer', 20.0), (g) => {
  g.el('', NDLOGO, 80.35, 0, -120, { shadow: false, s: 1.05, from: [0, 80] });
  g.emo('🤲', 190, 80.9, 0, 140, { from: [0, 120] });
  g.cap('ПРЕИМУЩЕСТВО', 80, 81.4, 0, 330, { cps: 22, col: '#ff4a3d' });
});

// 15 · 2009: Uncharted 2 на PS3
beat(83.33, 'grid', (g) => {
  g.cap('2009', 170, 83.35, -360, -300, { cps: 9 });
  g.prop('uc2_box.png', 470, 83.9, -360, 90, { from: [0, 160], r: -4, ry0: 40, ry: 8 });
  g.el('width:520px;height:96px', BINARY(520), 85.4, 120, 60, { shadow: false, upd: binUpd, from: [0, 0] });
  g.prop('/gta4_ps3/assets/ps3_fat.png', 430, 86.0, 540, 60, { from: [180, 0] });
}, { keys: [[85.2, 0.8, 120, 0, 0.97]] });

// 16 · PS3 — кошмар для программиста, стратегия
beat(88.21, 'grid', (g) => {
  g.card({ w: 820, h: 461, clip: 'trailer', n: 3199, off: 70.0, speed: 0.6 }, 88.25, -60, 50, { from: [240, 60], r: -2 });
  g.cap('КОШМАР', 110, 88.6, -60, -320, { cps: 14, until: 90.4 });
  g.emo('😵', 150, 89.2, 560, -220, { r: 8 });
  g.emo('🧠', 150, 90.65, -620, -210, { r: -8 });
  g.cap('СТРАТЕГИЯ', 110, 90.9, -60, -320, { cps: 16 });
});

// 17 · взять движок Uncharted 2 и доработать
beat(93.57, 'grid', (g) => {
  g.prop('uc2_box.png', 400, 93.6, -560, 30, { from: [-160, 0], r: -4 });
  g.emo('⚙️', 200, 94.3, -160, 20, { upd: (t, d) => (d.style.rotate = `${(t * 90) % 360}deg`) });
  g.el('width:220px;height:120px', CHEV(1).replace(/#fff/g, INK), 95.2, 100, 20, { shadow: false, upd: chevUpd });
  g.prop('tlou_box.png', 440, 95.81, 520, 30, { from: [180, 0], r: 4 });
  g.cap('ДВИЖОК UNCHARTED 2', 72, 93.8, -160, -330, { cps: 26, until: 98.2 });
  g.emo('🏁', 160, 98.45, 520, -300, { r: 8 });
  g.cap('ФОРА', 120, 98.6, -160, -330, { cps: 12 });
}, { z: 0.95 });

// 18 · план рухнул
beat(100.61, 'dark:' + FR('trailer', 11.6), (g) => {
  g.cap('ПЛАН РУХНУЛ', 130, 101.6, 0, -40, { fly: true, col: '#ff4a3d' });
  g.emo('💥', 220, 103.0, 0, 200, {});
  g.emo('⚙️', 150, 100.7, -420, -200, { upd: (t, d) => { const k = P(t, 102.6, 1.0); d.style.translate = `0 ${(k * k * 700).toFixed(1)}px`; d.style.rotate = `${(t * 140) % 360}deg`; } });
});

// 19 · мрачный постапокалипсис, природа отвоевала города
beat(104.05, 'dark:' + FR('beauty', 1.7), (g) => {
  g.card({ w: 780, h: 439, clip: 'beauty', n: 1073, off: 14.2 }, 104.1, -340, -40, { from: [-240, 60], r: -3 });
  g.card({ w: 560, h: 315, clip: 'beauty', n: 1073, off: 25.0 }, 106.6, 470, 170, { from: [240, 60], r: 3, z: 2 });
  g.cap('ПОСТАПОКАЛИПСИС', 84, 104.6, -340, -340, { cps: 22 });
  g.emo('🌿', 150, 108.05, 640, -170, { r: 10 });
}, { keys: [[106.4, 0.8, 120, 40, 0.97]] });

// 20 · код Uncharted — для яркого экшена, мрачный стиль не тянет
beat(110.28, 'light:' + A('uc3_scene.jpg'), (g) => {
  g.prop('drake.png', 760, 110.3, -340, 140, { from: [-240, 0] });
  g.emo('☀️', 170, 111.2, 120, -240, {});
  g.emo('💥', 150, 112.4, 300, -60, {});
  g.cap('ЯРКИЙ ЭКШЕН', 100, 112.41, 330, -340, { cps: 18, until: 116.9 });
  g.el('width:260px;height:260px', XMARK(320), 115.4, -340, 60, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(115.4) });
  g.cap('НЕ ДЛЯ МРАКА', 100, 117.4, 330, -340, { cps: 18 });
});

// 21 · выбросить движок и написать новый
beat(119.48, 'grid', (g) => {
  g.emo('⚙️', 220, 119.5, -420, -20, { upd: (t, d) => { const k = E.inOut(P(t, 120.3, 0.9)); d.style.translate = `${(k * 380).toFixed(1)}px ${(k * 200 - Math.sin(k * Math.PI) * 260).toFixed(1)}px`; d.style.rotate = `${(k * 540).toFixed(1)}deg`; d.style.opacity = 1 - P(t, 121.0, 0.2); } });
  g.emo('🗑️', 230, 119.9, 0, 180, {});
  g.emo('🔧', 200, 121.56, 480, 40, { r: -10 });
  g.cap('НОВЫЙ ДВИЖОК', 110, 121.7, 120, -330, { cps: 16 });
});

// 22 · месяцами 5–10 кадров в секунду
beat(123.88, 'grid', (g) => {
  g.card({ w: 860, h: 484, clip: 'beauty', n: 1073, off: 5.8, fps: 6 }, 123.9, -180, 30, { from: [240, 60], r: -2 });
  g.el('width:300px;height:300px', `<div style="width:300px;height:300px;border-radius:50%;background:#f7f7f8;display:flex;align-items:center;justify-content:center;font-family:Osw;font-weight:700;font-size:86px" class="fps">30</div>`, 125.0, 560, -60, {
    upd: (t, d) => { const v = Math.round(lerp(30, 6, E.inOut(P(t, 126.2, 2.5))) + (t > 128.7 ? Math.round(Math.sin(t * 9) * 2) : 0)); const f = d.querySelector('.fps'); f.textContent = v + ' FPS'; f.style.fontSize = '74px'; f.style.color = v < 15 ? '#e3262b' : INK; } });
  g.cap('5–10 FPS', 110, 128.3, -180, -330, { cps: 14, col: '#e3262b' });
}, { z: 0.95 });

// 23 · больше деталей — механики короче и быстрее
beat(131.23, 'grid', (g) => {
  ['МЕХАНИКА 1', 'МЕХАНИКА 2', 'МЕХАНИКА 3'].forEach((n, i) => g.el('', `<div class="mk" style="width:380px;height:120px;border-radius:24px;background:#fff;display:flex;align-items:center;justify-content:center;font-family:Osw;font-weight:700;font-size:40px;color:${INK};white-space:nowrap;overflow:hidden">${n}</div>`, 131.6 + i * 0.4, -300, -150 + i * 160, {
    from: [-200, 0], upd: (t, d) => { const k = E.inOut(P(t, 135.6 + i * 0.25, 0.8)); d.querySelector('.mk').style.width = `${lerp(380, 220, k)}px`; } }));
  g.emo('⚡', 220, 135.62, 360, -40, {});
  g.cap('КОРОЧЕ И БЫСТРЕЕ', 90, 136.0, 160, -370, { cps: 24, until: 139.8 });
  g.cap('+ ДЕТАЛИ', 110, 140.1, 160, -370, { cps: 18 });
});

// 24 · 3 мс → 0,3 мс
beat(141.62, 'dark:' + FR('enemies2', 5.0), (g) => {
  g.emo('⏱️', 180, 141.7, 0, -280, {});
  g.cap('3 МС', 170, 142.6, -460, 40, { cps: 8 });
  g.el('width:220px;height:120px', CHEV(1), 144.6, 0, 40, { shadow: false, upd: chevUpd });
  g.cap('0,3 МС', 170, 146.02, 460, 40, { cps: 8, col: '#3cff62' });
});

// 25 · больше времени на борьбу с железом, чем на уровни
beat(149.14, 'grid', (g) => {
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 230, 149.2, -380, 60, { from: [-180, 0] });
  g.emo('🥊', 190, 149.9, -40, -60, { r: -14 });
  g.emo('🥊', 190, 150.3, -700, -60, { r: 14, upd: (t, d) => (d.style.scale = '-1 1') });
  g.cap('БОРЬБА С ЖЕЛЕЗОМ', 84, 151.46, -380, -330, { cps: 24 });
  g.card({ w: 560, h: 315, clip: 'beauty', n: 1073, off: 19.2 }, 153.0, 520, 120, { from: [220, 60], r: 3 });
  g.emo('🐢', 120, 153.94, 700, -120, {});
});

// 26 · данные приходят, пока вращается диск
beat(155.38, 'dark:' + FR('beauty', 26.6), (g) => {
  g.el('width:440px;height:440px', DISC, 155.5, -300, 20, { upd: (t, d) => { const sp = t < 160.42 ? 220 : 220 + (t - 160.42) * 260; d.querySelector('.dk').style.transform = `rotate(${((t - 155) * sp) % 360}deg)`; } });
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 200, 156.0, 380, 160, { from: [180, 0] });
  g.cap('BLU-RAY', 110, 156.4, 380, -260, { cps: 14, until: 160.2 });
  g.cap('БЫСТРЕЕ = БОЛЬШЕ ДАННЫХ', 72, 160.42, 220, -260, { cps: 28 });
}, { z: 0.95 });

// 27 · привод медленный → открыл дверь — пустота
beat(164.5, 'dark:' + FR('beauty', 26.6), (g) => {
  g.el('width:440px;height:440px', DISC, 164.5, -520, 20, { dur: 0.01, from: [0, 0], s: 0.8, upd: (t, d) => (d.querySelector('.dk').style.transform = `rotate(${((t - 155) * 70) % 360}deg)`) });
  g.emo('🐢', 170, 165.2, -520, 270, {});
  g.cap('МЕДЛЕННО', 100, 166.98, -520, -300, { cps: 16, until: 168.3 });
  g.el('width:420px;height:600px', DOOR, 168.5, 400, 20, { from: [200, 0], upd: (t, d) => (d.querySelector('.lf').style.transform = `perspective(900px) rotateY(${(-80 * E.inOut(P(t, 171.2, 1.2))).toFixed(1)}deg)`) });
  g.cap('ПУСТОТА', 120, 172.98, 400, -380, { cps: 14 });
}, { keys: [[168.3, 0.8, 120, 0, 0.98]] });

// 28 · обычные игры: читает → в память → пауза → экран загрузки
beat(175.94, 'grid', (g) => {
  g.el('width:440px;height:440px', DISC, 176.0, -620, -60, { s: 0.6, upd: (t, d) => (d.querySelector('.dk').style.transform = `rotate(${((t - 175) * (t > 180.9 ? 20 : 220)) % 360}deg)`) });
  g.el('width:220px;height:120px', CHEV(1).replace(/#fff/g, INK), 177.4, -330, -60, { shadow: false, upd: chevUpd, s: 0.7 });
  g.prop('/gta4_ps3/assets/ram.png', 200, 178.22, -20, -60, { r: -6 });
  g.emo('❄️', 150, 180.9, 330, -100, {});
  g.cap('ПАУЗА', 96, 181.3, 330, -330, { cps: 14, until: 185.0 });
  g.el('', LOADING, 185.22, 0, 260, { from: [0, 140], upd: (t, d) => (d.querySelector('.lb').style.width = `${(100 * E.inOut(P(t, 185.6, 5.5))).toFixed(1)}%`) });
}, { z: 0.95 });

// 29 · в TLOU нет загрузок → привод на максимуме
beat(191.7, 'dark:' + FR('beauty', 9.2), (g) => {
  g.el('', LOADING, 191.75, -360, -40, { from: [0, 0], dur: 0.01, s: 0.85, upd: (t, d) => (d.querySelector('.lb').style.width = '62%') });
  g.el('width:260px;height:260px', XMARK(), 193.6, -360, -40, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(193.6) });
  g.cap('БЕЗ ЗАГРУЗОК', 96, 194.1, -360, -330, { cps: 20 });
  g.el('width:440px;height:440px', DISC, 196.2, 480, 20, { from: [200, 0], upd: (t, d) => (d.querySelector('.dk').style.transform = `rotate(${((t - 190) * 900) % 360}deg)`) });
  g.emo('🔥', 160, 198.69, 650, 220, {});
  g.cap('НА МАКСИМУМЕ', 84, 200.41, 480, -300, { cps: 22 });
}, { keys: [[196.0, 0.8, 140, 0, 0.97]] });

// 30 · сжали и порезали файлы
beat(202.13, 'grid', (g) => {
  g.emo('📦', 260, 202.2, -420, 20, { upd: (t, d) => { const k = E.inOut(P(t, 203.4, 0.8)); d.style.scale = `${lerp(1, 0.55, k)}`; } });
  g.cap('СЖАТИЕ', 110, 202.6, -420, -320, { cps: 14 });
  for (let i = 0; i < 9; i++) g.emo('📄', 80, 204.77 + i * 0.07, 200 + (i % 3) * 150, -150 + Math.floor(i / 3) * 150, { from: [-420, 0] });
  g.cap('НА МЕЛКИЕ ЧАСТИ', 84, 205.3, 350, -330, { cps: 24 });
});

// 31 · враги — умные охотники, а не слепые роботы
beat(208.13, 'dark:' + FR('enemies2', 9.6), (g) => {
  g.card({ w: 840, h: 473, clip: 'enemies2', n: 501, off: 8.5 }, 208.2, 160, 40, { from: [240, 60], r: 2 });
  g.emo('🤖', 170, 210.77, -640, -100, {});
  g.el('width:260px;height:260px', XMARK(220), 213.41, -640, -100, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(213.41) });
  g.emo('🐺', 170, 214.0, -640, 200, {});
  g.cap('УМНЫЕ ОХОТНИКИ', 84, 210.8, 160, -330, { cps: 24, until: 215.4 });
  g.cap('НОВЫЙ ИИ', 110, 215.65, 160, -330, { cps: 14 });
});

// 32 · в Uncharted знали где ты → в TLOU ищут
beat(219.89, 'light:' + A('uc3_scene.jpg'), (g) => {
  g.prop('drake.png', 700, 219.9, -420, 140, { from: [-240, 0] });
  g.emo('🎯', 180, 220.6, -420, -40, { z: 6 });
  g.cap('ЗНАЛИ, ГДЕ ТЫ', 92, 221.0, 280, -330, { cps: 22, until: 224.9 });
  g.card({ w: 640, h: 360, clip: 'enemies2', n: 501, off: 0 }, 225.09, 360, 60, { from: [240, 0], r: 3 });
  g.emo('🔍', 150, 227.01, 640, 240, { r: -8 });
  g.cap('ИЩУТ', 120, 227.2, 280, -330, { cps: 12 });
});

// 33 · невидимая сетка точек
beat(229.65, 'grid', (g) => {
  g.card({ w: 900, h: 506, clip: 'enemies2', n: 501, off: 3.0, speed: 0.6 }, 229.7, 0, 30, { from: [0, 160], upd: (t, c) => { if (!c.grid) { c.grid = ab(c, 'inset:0;width:100%;height:100%', DOTS); } c.grid.querySelectorAll('circle').forEach((p, i) => p.setAttribute('opacity', t > 231.0 + i * 0.012 ? 1 : 0)); } });
  g.cap('СЕТКА ТОЧЕК', 96, 231.61, 0, -330, { cps: 20 });
});

// 34 · три уровня: не замечает, расследует, сражается
beat(235.01, 'grid', (g) => {
  [['😴', 'НЕ ЗАМЕЧАЕТ', 235.9], ['🔍', 'РАССЛЕДУЕТ', 237.2], ['⚔️', 'СРАЖАЕТСЯ', 238.6]].forEach(([e, n, at], i) =>
    g.el('', `<div style="width:340px;height:340px;border-radius:30px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px"><div class="emo" style="font-size:130px">${e}</div><div style="font-family:Osw;font-weight:700;font-size:44px;color:${INK}">${n}</div></div>`, at, -560 + i * 560, 40, { from: [0, 160], r: (i - 1) * 3 }));
  g.cap('3 УРОВНЯ', 110, 235.1, 0, -360, { cps: 14 });
}, { z: 0.92 });

// 35 · спрятался → метка, где враг тебя потерял
beat(240.93, 'dark:' + FR('enemies2', 5.5), (g) => {
  g.card({ w: 880, h: 495, clip: 'enemies2', n: 501, off: 4.3, speed: 0.7 }, 241.0, 0, 40, { from: [0, 160] });
  g.emo('📍', 170, 245.81, 160, -40, { from: [0, -300] });
  g.cap('МЕТКА', 110, 246.0, 0, -330, { cps: 12, until: 247.8 });
  g.emo('😴', 140, 247.97, -470, -200, {});
  g.cap('НЕ ЗАМЕЧАЕТ', 96, 248.1, 0, -330, { cps: 18 });
});

// 36 · услышал звук → 3–4 ближайших укрытия → проверить одно
beat(250.53, 'grid', (g) => {
  g.el('width:1100px;height:640px', PLAN, 250.6, 0, 30, { from: [0, 160], upd: planUpd });
  g.cap('3–4 УКРЫТИЯ', 92, 255.49, 0, -380, { cps: 20, until: 261.0 });
  g.cap('ПРОВЕРИТЬ', 100, 261.23, 0, -380, { cps: 18 });
}, { z: 0.9 });

// 37 · заметили → переговариваются и окружают
beat(268.34, 'dark:' + FR('enemies1', 2.2), (g) => {
  g.card({ w: 860, h: 484, clip: 'enemies1', n: 543, off: 0.2 }, 268.4, 0, 40, { from: [0, 160] });
  g.emo('💬', 130, 270.46, -560, -200, { r: -8 });
  g.emo('💬', 110, 271.2, 560, -220, { r: 8 });
  g.emo('⬅️', 120, 274.62, 600, 140, {});
  g.emo('➡️', 120, 275.3, -600, 140, {});
  g.cap('ОКРУЖАЮТ', 110, 276.9, 0, -330, { cps: 16 });
});

// 38 · 12 врагов в зоне
beat(279.06, 'grid', (g) => {
  for (let i = 0; i < 12; i++) g.emo('🧍‍♂️', 110, 279.3 + i * 0.09, -500 + (i % 6) * 200, -60 + Math.floor(i / 6) * 190, { float: 0 });
  g.cap('12 ВРАГОВ', 120, 279.4, 0, -350, { cps: 16, until: 282.5 });
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 180, 282.74, 0, 380, { from: [0, 140], z: 4 });
  g.emo('🎭', 150, 285.06, 620, 340, { z: 4 });
  g.cap('ЗАКУЛИСНЫЙ ПРИЁМ', 84, 285.1, 0, -350, { cps: 24 });
});

// 39 · 8 активных + 4 за кулисами; убили одного — запасной вступает
beat(287.7, 'grid', (g) => {
  for (let i = 0; i < 8; i++) g.emo('🧍‍♂️', 100, 287.75 + i * 0.05, -620 + (i % 4) * 150, -60 + Math.floor(i / 4) * 170, { float: 0, upd: i === 0 ? (t, d) => (d.style.filter = t > 299.8 ? 'grayscale(1) opacity(.35)' : 'none') : undefined });
  for (let i = 0; i < 8; i++) g.emo('🧠', 50, 288.4 + i * 0.05, -580 + (i % 4) * 150, -120 + Math.floor(i / 4) * 170, { float: 0, upd: i === 0 ? (t, d) => { const k = E.inOut(P(t, 301.6, 1.4)); d.style.translate = `${(k * 870).toFixed(1)}px ${(-Math.sin(k * Math.PI) * 220).toFixed(1)}px`; } : undefined });
  g.el('width:560px;height:440px;border-radius:30px;background:repeating-linear-gradient(90deg,#9e1b22 0 34px,#7d1218 34px 60px);box-shadow:inset 0 -30px 50px rgba(0,0,0,.35)', '', 294.3, 470, 30, { from: [240, 0] });
  for (let i = 0; i < 4; i++) g.emo('🧍‍♂️', 100, 294.5 + i * 0.08, 360 + (i % 2) * 220, -40 + Math.floor(i / 2) * 170, { float: 0, upd: i === 0 ? (t, d) => (d.style.filter = t > 304.5 ? 'none' : 'grayscale(1) brightness(.7)') : (t, d) => (d.style.filter = 'grayscale(1) brightness(.7)') });
  g.cap('8', 150, 288.0, -390, -330, { cps: 4 });
  g.cap('4', 150, 294.4, 470, -330, { cps: 4 });
  g.el('width:260px;height:260px', XMARK(140), 299.78, -620, -60, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(299.78) });
}, { z: 0.9 });

// 40 · игроку кажется — нападает армия
beat(308.98, 'dark:' + FR('enemies1', 2.2), (g) => {
  g.card({ w: 900, h: 506, clip: 'enemies1', n: 543, off: 1.0 }, 309.0, 0, 30, { from: [0, 160] });
  g.cap('ЦЕЛАЯ АРМИЯ', 110, 309.6, 0, -340, { fly: true });
});

// 41 · освещение, тёмная атмосфера
beat(313.86, 'dark:' + FR('flashlight', 6.0), (g) => {
  g.emo('💡', 170, 313.9, -600, -240, {});
  g.cap('ОСВЕЩЕНИЕ', 120, 314.3, 0, -330, { cps: 14, until: 318.0 });
  g.card({ w: 880, h: 495, clip: 'flashlight', n: 388, off: 0 }, 318.26, 0, 40, { from: [0, 160] });
  g.cap('ТЕМНОТА', 120, 320.42, 0, -330, { cps: 14 });
});

// 42 · проще, чем яркие огни? Для консоли наоборот
beat(324.26, 'grid', (g) => {
  g.emo('💡', 120, 324.4, -560, -100, {}); g.emo('💡', 120, 324.6, -400, 60, {}); g.emo('💡', 120, 324.8, -640, 120, {});
  g.cap('ПРОЩЕ?', 100, 324.5, -500, -330, { cps: 14, until: 328.0 });
  g.emo('🔦', 220, 326.0, 480, 0, { r: -20 });
  g.el('width:260px;height:260px', XMARK(220), 328.17, -500, 20, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(328.17) });
  g.cap('НАОБОРОТ', 110, 328.4, 300, -330, { cps: 16 });
});

// 43 · луч фонарика всё время движется
beat(330.41, 'dark:' + FR('flashlight', 2.0), (g) => {
  g.card({ w: 1000, h: 563, clip: 'flashlight', n: 388, off: 2.0 }, 330.45, 0, 20, { from: [0, 160], upd: (t, c) => { if (!c.beam) c.beam = ab(c, 'inset:0;width:100%;height:100%;pointer-events:none'); const x = 50 + Math.sin(t * 1.7) * 30, y = 50 + Math.cos(t * 1.3) * 20; c.beam.style.background = `radial-gradient(circle 230px at ${x}% ${y}%,rgba(255,250,220,.25),rgba(0,0,0,.55) 100%)`; } });
  g.emo('🔦', 150, 332.57, -620, 260, { r: -20 });
  g.cap('ЛУЧ ФОНАРИКА', 100, 332.6, 0, -350, { cps: 20 });
});

// 44 · каждая тень пересчитывается → консоль зависала
beat(337.93, 'dark:' + FR('flashlight', 4.0), (g) => {
  g.card({ w: 820, h: 461, clip: 'flashlight', n: 388, off: 4.0, upd: null }, 338.0, -170, 30, { from: [-200, 0], upd: (t, c, im) => { if (t > 343.93) { c.style.filter = 'grayscale(.6)'; c.style.translate = `${(Math.sin(t * 70) * 10 * Math.exp(-(t - 343.93) * 3)).toFixed(1)}px 0`; } } });
  g.cap('×60 В СЕКУНДУ', 84, 339.45, -170, -330, { cps: 24, until: 343.6 });
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 180, 342.4, 560, 180, { from: [200, 0] });
  g.emo('⚠️', 150, 343.93, 560, 0, {});
  g.cap('ЗАВИСАЛА', 120, 344.0, -170, -330, { cps: 16, col: '#ff4a3d' });
});

// 45 · внутрь Cell: PPE — главное ядро, делало всё само
beat(346.17, 'dark:' + FR('beauty', 28.3), (g) => {
  g.el('width:300px;height:300px', CELLCHIP, 346.2, -560, -20, { from: [0, 140], r: -4, t1: 350.9 });
  g.cap('CELL', 110, 348.49, -560, -260, { cps: 10, until: 350.8 });
  g.el('width:900px;height:520px', CELLDIA, 351.29, 120, 20, { from: [200, 0], upd: cellUpd });
  g.cap('PPE', 120, 351.6, -120, -360, { cps: 8, col: '#ffb000', until: 359.9 });
  g.emo('🥵', 150, 356.57, -470, 260, {});
}, { keys: [[351.0, 0.8, 150, 0, 0.98]] });

// 46 · SPE — маленькие помощники; тени поделили между ними
beat(360.09, 'dark:' + FR('beauty', 28.3), (g) => {
  g.el('width:900px;height:520px', CELLDIA, 360.1, 0, 20, { dur: 0.01, from: [0, 0], upd: cellUpd });
  g.cap('SPE — ПОМОЩНИКИ', 84, 362.33, 0, -360, { cps: 24, until: 367.3 });
  g.cap('ТЕНИ → SPE', 96, 367.52, 0, -360, { cps: 18, until: 373.2 });
  g.emo('✅', 150, 373.37, 560, 300, {});
  g.cap('ОГРАНИЧЕНИЯ ОБОЙДЕНЫ', 72, 373.5, 0, -360, { cps: 28, col: '#3cff62' });
});

// 47 · безумное количество деталей
beat(376.64, 'grid', (g) => {
  g.card({ w: 900, h: 506, src: FR('beauty', 14.2) }, 376.7, 0, 40, { from: [0, 160], upd: (t, c, im) => (im.style.transform = `scale(${(1 + (t - 376.7) * 0.03).toFixed(3)})`) });
  g.emo('🔍', 260, 377.6, 260, 120, { r: -10, z: 6 });
  g.cap('ДЕТАЛИ', 130, 377.0, 0, -350, { cps: 12 });
});

// 48 · плесень, облупившаяся краска, пятна от воды
beat(380.8, 'grid', (g) => {
  [['🦠', 'ПЛЕСЕНЬ', 383.08, 25.0, '30% 60%'], ['🎨', 'КРАСКА', 384.6, 12.5, '60% 40%'], ['💧', 'ВОДА', 386.28, 0.9, '50% 80%']].forEach(([e, n, at, sec, pos], i) => {
    g.card({ w: 480, h: 360, src: FR('beauty', sec), pos }, at, -560 + i * 560, 40, { from: [0, 160], r: (i - 1) * 3, upd: (t, c, im) => (im.style.transform = 'scale(1.8)') });
    g.emo(e, 110, at + 0.15, -560 + i * 560 + 180, -130, {});
    g.cap(n, 64, at + 0.2, -560 + i * 560, 290, { cps: 18 });
  });
}, { z: 0.9 });

// 49 · мох на стене → заброшено десятилетиями
beat(387.6, 'dark:' + FR('beauty', 25.0), (g) => {
  g.card({ w: 860, h: 484, clip: 'beauty', n: 1073, off: 1.6 }, 387.65, 0, 30, { from: [0, 160] });
  g.emo('🌿', 160, 388.2, -520, 260, { r: -10 });
  g.cap('ДЕСЯТИЛЕТИЯ', 110, 391.92, 0, -340, { cps: 16 });
});

// 50 · мимо пробегают, но подсознание замечает — это делает игру реальной
beat(393.26, 'grid', (g) => {
  g.card({ w: 780, h: 439, clip: 'trailer', n: 3199, off: 68.2 }, 393.3, -260, 30, { from: [-240, 0], r: -2 });
  g.emo('🏃', 150, 393.6, 400, 60, { upd: (t, d) => (d.style.translate = `${(-(t - 393.6) * 40).toFixed(1)}px 0`) });
  g.emo('👁️', 190, 398.06, 500, -220, {});
  g.cap('КРАЕМ ГЛАЗА', 100, 398.1, -260, -330, { cps: 18, until: 404.9 });
  g.emo('✅', 150, 405.18, 520, 240, {});
  g.cap('ОЩУЩАЕТСЯ РЕАЛЬНОЙ', 80, 405.4, -260, -330, { cps: 26 });
});

// 51 · фонарик: гладкая стена — скучно, кирпич и плесень — фактура
beat(409.26, 'grid', (g) => {
  g.el('width:620px;height:420px', WALL(false), 411.1, -420, 40, { upd: beamUpd(0) });
  g.cap('СКУЧНО', 96, 413.6, -420, -260, { cps: 14 });
  g.el('width:620px;height:420px', WALL(true), 418.42, 420, 40, { from: [200, 0], upd: beamUpd(1.3) });
  g.cap('ФАКТУРА', 96, 421.1, 420, -260, { cps: 14 });
  g.emo('🔦', 150, 409.3, 0, -330, { r: -20 });
}, { z: 0.95 });

// 52 · треть комнаты в темноте — важны детали в свете
beat(425.74, 'dark:' + FR('flashlight', 7.0), (g) => {
  g.card({ w: 900, h: 506, clip: 'flashlight', n: 388, off: 6.6, speed: 0.7 }, 425.8, 0, 30, { from: [0, 160] });
  g.cap('ДЕТАЛИ В СВЕТЕ', 100, 428.46, 0, -340, { cps: 20 });
});

// 53 · драки динамичны, вариантов бесконечно много
beat(433.66, 'dark:' + FR('enemies1', 3.0), (g) => {
  g.card({ w: 860, h: 484, clip: 'enemies1', n: 543, off: 1.2 }, 433.7, -120, 30, { from: [-200, 0] });
  g.cap('∞', 220, 439.42, 600, -40, { cps: 4 });
  g.cap('ВАРИАНТОВ', 96, 440.0, -120, -330, { cps: 18 });
});

// 54 · удар о стену: угол, поверхность, анимация + физика
beat(443.57, 'grid', (g) => {
  g.card({ w: 900, h: 506, clip: 'enemies1', n: 543, off: 10.4, speed: 0.45 }, 443.6, -200, 40, { from: [-200, 0] });
  [['📐', 'УГОЛ', 445.94], ['🧱', 'ПОВЕРХНОСТЬ', 447.3], ['⚙️', 'ФИЗИКА', 448.86]].forEach(([e, n, at], i) => {
    g.emo(e, 100, at, 470, -220 + i * 200, {});
    g.cap(n, 60, at + 0.1, 680, -220 + i * 200, { cps: 20, r: 0 });
  });
  g.cap('НЕПРЕДСКАЗУЕМО', 84, 451.33, -200, -330, { cps: 24 });
}, { z: 0.92 });

// 55 · ИИ Эли: бесполезный — злит, идеальный — скучно
beat(455.63, 'light:' + FR('trailer', 63.8), (g) => {
  g.prop('ellie.png', 920, 455.7, -460, 130, { from: [-240, 0] });
  g.emo('🤖', 150, 456.4, -120, -220, {});
  g.cap('ИИ ЭЛИ', 120, 457.47, 360, -340, { cps: 12, until: 459.6 });
  g.emo('😡', 160, 461.0, 260, 40, {});
  g.cap('БЕСПОЛЕЗНА', 64, 461.4, 260, 200, { cps: 22 });
  g.emo('😐', 160, 463.6, 620, 40, {});
  g.cap('ИДЕАЛЬНА', 64, 463.9, 620, 200, { cps: 22 });
});

// 56 · следит за врагами, прячется вне их обзора
beat(466.59, 'grid', (g) => {
  g.card({ w: 820, h: 461, clip: 'enemies2', n: 501, off: 2.4, speed: 0.7 }, 466.6, -200, 30, { from: [-200, 0] });
  g.emo('👀', 160, 468.91, 560, -200, {});
  g.prop('ellie.png', 520, 471.55, 600, 150, { from: [200, 0] });
  g.cap('В УКРЫТИЕ', 100, 473.99, -200, -330, { cps: 18 });
});

// 57 · ИИ неидеален — выбегала на открытое место
beat(477.87, 'dark:' + FR('ellie_invisible', 2.0), (g) => {
  g.card({ w: 900, h: 507, clip: 'ellie_invisible', n: 710, off: 0.5 }, 477.9, 0, 30, { from: [0, 160] });
  g.emo('⚠️', 150, 479.0, 560, -240, {});
  g.cap('ОШИБКА ИИ', 110, 480.99, 0, -340, { cps: 16, col: '#ff4a3d' });
});

// 58 · враги её игнорируют — «невидимая Эли»
beat(483.39, 'dark:' + FR('ellie_invisible', 9.0), (g) => {
  g.card({ w: 820, h: 462, clip: 'ellie_invisible', n: 710, off: 8.6 }, 483.4, -200, 30, { from: [-200, 0] });
  g.prop('ellie.png', 760, 486.27, 560, 120, { from: [200, 0], upd: (t, d) => (d.style.opacity = Math.min(d.style.opacity, 0.42 + 0.08 * Math.sin(t * 4))) });
  g.emo('👻', 150, 488.19, 680, -260, {});
  g.cap('НЕВИДИМАЯ ЭЛИ', 96, 488.4, -200, -340, { cps: 22 });
});

// 59 · чтобы не было нечестных смертей
beat(494.27, 'grid', (g) => {
  g.el('', `<div style="width:720px;height:260px;border-radius:30px;background:#111;display:flex;align-items:center;justify-content:center;font-family:Osw;font-weight:700;font-size:110px;color:#e3262b;letter-spacing:.06em">GAME OVER</div>`, 494.3, 0, 0, { from: [0, 160] });
  g.el('width:260px;height:260px', XMARK(320), 496.15, 0, 0, { shadow: false, dur: 0.01, from: [0, 0], upd: xUpd(496.15) });
  g.cap('БЕЗ НЕЧЕСТНЫХ СМЕРТЕЙ', 72, 496.6, 0, -300, { cps: 28 });
});

// 60 · финал: самые сложные ограничения позади
beat(499.31, 'light:' + FR('beauty', 1.7), (g) => {
  g.prop('ellie.png', 880, 499.35, -640, 130, { from: [-260, 0], z: 1 });
  g.prop('joel.png', 840, 499.45, 650, 140, { from: [260, 0], z: 1 });
  g.prop('/gta4_ps3/assets/ps3_fat_flat.png', 220, 499.7, 0, 270, { from: [0, 160], z: 3 });
  g.prop('tlou_box.png', 450, 499.9, 0, 0, { from: [0, 120], r: -3, z: 2 });
  g.el('', NDLOGO, 500.2, 0, -400, { shadow: false, s: 0.8, from: [0, -80] });
  g.cap('ПРЕДЕЛ PS3 ПРОЙДЕН', 76, 501.5, 0, 430, { fly: true, until: 1e9 });
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
window.DUR = 504.2;
(async () => {
  await document.fonts.load('700 60px Osw', 'НАСТОЯЩЕЕ БЕЗУМИЕ 256 МБ ?!'); await document.fonts.load('900 60px Mont', 'NAUGHTY DOG');
  await document.fonts.load('60px "Noto Color Emoji"', '☀️🌧️❄️🍂🤖💬🔊🧠🖼️🌍⚠️🤲🤷👉👈🔍✊💦🎬🎭🖐️👀😵🏁💥⚙️🌿🔧🗑️⚡⏱️🥊🐢🔥📦📄🐺🎯😴⚔️📍⬅️➡️🧍‍♂️💡🔦🥵✅🦠🎨💧🏃👁️📐🧱😡😐👻');
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  window.__ready = true;
})();
