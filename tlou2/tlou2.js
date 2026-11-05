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
// появление v2 (как в референсе): плавный выезд издалека без отскока, размытие в движении,
// лёгкий 3D-разворот, который успокаивается; t1 — уход (уезжает и гаснет)
const outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
function popIn(el, t, t0, x, y, o = {}) {
  const { s = 1, r = 0, dur = 0.85, r0 = 0, rx = 0, ry = 0, t1 = 1e9, out = 0.45, float = 0 } = o;
  let [fx, fy] = o.from || [0, 180];
  // чисто вертикальный влёт превращаем в боковой по положению элемента — как в референсе
  if (fx === 0 && fy === 0) { /* появляется на месте */ }
  else if (fx === 0) { if (x < -180) { fx = -640; fy = fy * 0.4; } else if (x > 180) { fx = 640; fy = fy * 0.4; } else fy = Math.max(fy, 60) * 2.6; }
  else { fx *= 2.4; fy *= 2.4; }
  const u = P(t, t0, dur), p = outExpo(u), q = 1 - p;
  const gone = t >= t1 ? E.inOut(P(t, t1, out)) : 0;
  const fl = float ? Math.sin((t - t0) * 1.3 + x * 0.01) * float * 0.8 : 0;
  const dir = Math.sign(fx) || 0;
  // мягкое «покачивание» в 3D, пока элемент на экране
  const sway = Math.sin((t - t0) * 0.7 + x * 0.003) * 3;
  place(el, { x: x + fx * q + dir * gone * 260, y: y + fy * q + fl - gone * 40, s: s * (0.9 + 0.1 * p) * (1 - 0.08 * gone), r: lerp(r0 + dir * 4, r, p),
    o: t >= t0 ? Math.min(1, P(t, t0, 0.22)) * (1 - gone) : 0, rx: rx + (fy > 0 ? 14 : fy < 0 ? -14 : 0) * q, ry: ry - dir * 28 * q + sway });
  // размытие в движении: сильнее в начале выезда
  if (el._f0 === undefined) el._f0 = el.style.filter || '';
  const bl = t >= t0 ? Math.max(q * q * 14, gone * 8) : 0;
  el.style.filter = bl > 0.3 ? `${el._f0} blur(${bl.toFixed(1)}px)` : el._f0;
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
      const { cps = 34, r = -2, until, fly = false } = o;
      return add(d, (t) => {
        const t1 = until ?? b.end - 0.3;
        if (t < at || t > t1 + 0.7) { d.style.opacity = 0; return; }
        place(d, { x, y, r }); d.style.opacity = 1;
        L.forEach((s, i) => {
          const a = at + i / cps;
          if (t < t1) {
            if (fly) { const k = E.outCubic(P(t, at + i * 0.025, 0.6)), ang = (i / L.length) * Math.PI * 2 + 0.6, R = 420 * (1 - k);
              s.style.transform = `translate(${(Math.cos(ang) * R).toFixed(1)}px,${(Math.sin(ang) * R).toFixed(1)}px) rotate(${((1 - k) * (rnd(i, 7) - 0.5) * 400).toFixed(1)}deg)`; s.style.opacity = Math.min(1, k * 2.5); return; }
            const k = outExpo(P(t, a, 0.45)); s.style.transform = `translateX(${((1 - k) * 0.45 * size).toFixed(1)}px)`; s.style.filter = k < 0.98 ? `blur(${((1 - k) * 9).toFixed(1)}px)` : 'none'; s.style.opacity = t >= a ? Math.min(1, k * 1.4) : 0; return;
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
const WORDS = await (await fetch('/tlou2/words.json')).json();
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
// =====================================================================
//          THE LAST OF US PART 2 НА PS4 — БИТЫ (движок v2)
// =====================================================================
const S0 = (t) => t;
const TA = (n) => '/tlou2/assets/' + n;
Object.assign(CL, Object.fromEntries([['grass1', 240], ['grass2', 240], ['grass3', 300], ['dogsniff', 240], ['door', 360], ['squeeze', 180], ['horse1', 300], ['horse2', 300], ['horse3', 300], ['city1', 240], ['climb1', 300], ['climb2', 240], ['roof', 240], ['peek', 240], ['fence', 300], ['walk', 240], ['hgrass1', 210], ['hfight1', 240], ['hgrass2', 300], ['hgrass3', 240], ['hinside', 300], ['hdog', 210], ['hfight2', 240], ['houtside', 360], ['enemy1', 240], ['enemy2', 270], ['glass', 180], ['enemy3', 270], ['mc1', 240], ['mc2', 300], ['mc3', 240], ['mc4', 300], ['mc5', 240], ['mc6', 240], ['mc7', 300], ['mcteam', 240], ['e_walk', 300], ['e_guitar', 360], ['e_joel', 300], ['e_joel2', 300], ['e_window', 300], ['t_forest', 240], ['t_hands', 360], ['t_face', 180], ['t_dark', 240], ['t_ellie', 360], ['t_close', 300]].map(([k, n]) => [k, ['tlou2/clips/' + k, n]])));
const tp = (g, n, t, x, y, w, h, o = {}) => cover(g, TA(n), t, x, y, w, h, o);
const tpp = (g, n, h, t, x, y, o = {}) => g.prop(TA(n), h, t, x, y, { float: 4, ...o });
const PS4 = (g, t, x, y, h = 300, o = {}) => g.prop(RA('ps4.png'), h, t, x, y, { float: 5, ...o });
const PS3P = (g, t, x, y, h = 260, o = {}) => g.prop('/gta4_ps3/assets/ps3_fat_flat.png', h, t, x, y, { float: 5, ...o });
const X = (g, t, x, y, s = 300) => g.el(`width:${s}px;height:${s}px`, XMARK(s), t, x, y, { shadow: false, from: [0, 0], z: 9, upd: xUpd(t) });
const DK = (k, s) => 'dark:' + BG(k, s);
const PCB = DI(RA('pcb.jpg')), BLUE = DI(RA('blue.jpg'));
// клип-карточка: побольше разных нарезок, по 2–3 на сцену
const C = (g, k, t, x, y, w, o = {}) => cc(g, k, t, x, y, w, { r: o.r ?? (x < 0 ? -2 : 2), ...o });
const ND = (g, t, x, y, h = 120, o = {}) => g.prop(TA('nd_logo.png'), h, t, x, y, { float: 3, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.35))', ...o });
const LOGO = (g, t, x, y, h, dark = false) => g.prop(TA(dark ? 'logo_white.png' : 'logo_black.png'), h, t, x, y, { float: 3, filter: dark ? 'drop-shadow(0 10px 25px rgba(0,0,0,.7))' : 'none' });
const LIB = `<div style="display:grid;grid-template-columns:repeat(6,90px);gap:10px;padding:20px;border-radius:26px;background:#fff">${Array.from({ length: 24 }, (_, i) => `<div class="lb" style="height:90px;border-radius:12px;background:#e4e6ea;display:flex;align-items:center;justify-content:center;font-family:'Noto Color Emoji';font-size:52px">${['🚶', '🏃', '🧍', '🤸', '🧎', '🚶‍♀️'][i % 6]}</div>`).join('')}</div>`;
const libUpd = (t0) => (t, d) => { const pick = Math.floor((t - t0) * 6) % 24; d.querySelectorAll('.lb').forEach((c, i) => { c.style.background = t > t0 && i === (pick * 7) % 24 ? '#2bb673' : '#e4e6ea'; }); };
const MOOD = (txt, col = '#fff') => `<div style="font-family:Osw;font-weight:700;font-size:64px;color:${col};text-shadow:0 8px 24px rgba(0,0,0,.6);white-space:nowrap">${txt}</div>`;

// ---------- 0:00 вступление ----------
BT(0, DK('t_forest', 4), (g, t, w) => {
  tp(g, 'cover_ps4.jpg', t + 0.15, -520, 30, 400, 505, { r: -4 });
  LOGO(g, w('last'), 240, -80, 230, true);
  g.cap('НА PS4', 110, w('ps4'), 240, 150, { cps: 20, col: '#fff', r: 0 });
}, { keys: [[0, 2.6, 0, 0, 1.06]] });
BT(4.2, 'grid', (g, t, w) => {
  C(g, 'city1', w('живые'), -560, -190, 640);
  C(g, 'enemy1', w('враги'), 300, -200, 640);
  C(g, 'dogsniff', w('собаки'), -380, 230, 620);
  g.emo('🔊', 140, w('звук'), 520, 230, { float: 8 });
}, { z: 0.92 });
BT(10.0, BLUE, (g, t, w) => {
  PS4(g, t + 0.1, -320, 80, 330);
  g.el('', BIGNUM('7 ЛЕТ', 'консоли к выходу игры', RED), w('семь'), 420, 20, { float: 6 });
});
BT(13.4, 'grid', (g, t, w) => {
  tp(g, 'cover_ps4.jpg', t + 0.1, -500, 20, 360, 455, { r: -3 });
  g.cap('ЧЕРЕЗ НЕСКОЛЬКО МЕСЯЦЕВ', 70, w('несколько'), 260, -260, { cps: 34 });
  g.prop('/cyberpunk/assets/ps5.png', 520, w('ps5'), 360, 60, { float: 5 });
});
BT(18.0, PCB, (g, t, w) => {
  SLAM(g, 'ПОЧЕМУ НЕ НА PS5?', w('почему'), 140);
  ND(g, w('naughty'), 0, 230, 110);
}, { keys: [[S0(18.0), 2.0, 0, 0, 1.08]] });
BT(21.1, 'grid', (g, t, w) => {
  g.cap('2014', 220, w('четырнадцатом') - 0.3, -380, -40, { cps: 10, r: -3 });
  ARW(g, w('году'), 60, -40);
  g.cap('2020', 220, w('тогда'), 460, -40, { cps: 10, r: 3, col: RED });
  g.el('', PLATE('6 ЛЕТ РАЗРАБОТКИ', '#fff', INK), w('шесть'), 40, 250, { float: 4 });
});
BT(30.8, DK('t_dark', 3), (g, t, w) => {
  SLAM(g, 'А ДОЛЖНА ЛИ ОНА ВООБЩЕ ПОЯВИТЬСЯ?', w('должна') - 0.3, 96);
});
// ---------- сиквел или нет ----------
BT(34.6, 'grid', (g, t, w) => {
  tpp(g, 'joel1_cut.png', 700, w('джоэла'), -560, 120, { from: [-300, 0] });
  tpp(g, 'ellie1_cut.png', 720, w('элли'), -240, 140, { from: [-300, 0] });
  g.el('', PLATE('ИСТОРИЯ ЗАКОНЧЕНА?', '#fff', INK), w('закончена'), 420, -180, { float: 4 });
  C(g, 'e_joel', w('закончена') + 0.4, 400, 120, 620);
}, { z: 0.95 });
BT(38.8, 'grid', (g, t, w) => {
  tp(g, 'cover_ps3.jpg', t + 0.1, -440, 0, 380, 552, { r: -3 });
  g.el('', PLATE('ИДЕАЛЬНЫЙ ФИНАЛ', '#fff', '#2bb673'), w('идеальным'), 300, -150, { float: 4 });
  g.emo('💸', 150, w('денег'), 300, 120, { float: 8 });
  g.el('', PLATE('СИКВЕЛ РАДИ ДЕНЕГ?', '#fff', RED), w('денег') + 0.2, 300, 300, { float: 4 });
});
BT(45.0, PCB, (g, t, w) => {
  g.el('', `<div style="width:300px;height:300px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;font-size:80px;color:#111;letter-spacing:4px">SONY</div>`, w('sony'), -420, -40, { float: 5 });
  g.el('', PLATE('ПОЛНАЯ СВОБОДА', '#fff', '#2bb673'), w('свободу'), 320, -200, { float: 4 });
  tp(g, 'cover_ps4.jpg', w('сиквел'), 160, 140, 220, 278, { r: -3 });
  g.cap('ИЛИ', 90, at('хотите', at('сиквел', 45)), 380, 140, { cps: 12, col: '#fff' });
  g.el('', `<div style="width:220px;height:278px;border-radius:18px;background:#111;border:4px solid #fff;display:flex;align-items:center;justify-content:center;font-family:Osw;font-weight:700;font-size:150px;color:#fff">?</div>`, w('новую'), 600, 140, { float: 4 });
});
BT(51.9, 'grid', (g, t, w) => {
  g.emo('💭', 200, w('идея'), -560, -120, { float: 8 });
  g.cap('«А ЧТО, ЕСЛИ…»', 110, w('что'), 0, -300, { cps: 24 });
  C(g, 't_hands', w('сценаристы'), -120, 100, 760, { r: -2 });
  g.el('', PLATE('НОВАЯ ИСТОРИЯ', '#fff', RED), w('новая'), 420, 300, { float: 4, z: 5 });
});
BT(59.6, 'grid', (g, t, w) => {
  ND(g, w('студии'), 0, -330, 110);
  g.emo('👍', 150, w('единого'), -420, 20, { float: 8 });
  g.emo('👎', 150, w('единого') + 0.2, 420, 20, { float: 8 });
  g.cap('СПОРЫ В ОФИСЕ', 100, w('спорили'), 0, 220, { cps: 24, col: RED });
  g.emo('🗯️', 120, w('мрачной'), 0, 20, { float: 9 });
});
BT(66.3, DK('t_close', 4), (g, t, w) => {
  C(g, 't_close', t + 0.1, -300, -30, 860, { r: -2 });
  g.el('', MOOD('ЗЛОСТЬ'), w('злости'), 520, -160, { from: [300, 0], shadow: false });
  g.el('', MOOD('МЕСТЬ', RED), w('мести'), 520, 0, { from: [300, 0], shadow: false });
  g.el('', MOOD('ПРОЖИТЬ САМОМУ'), w('прожить'), 420, 170, { from: [300, 0], shadow: false });
});
BT(75.5, DK('t_dark', 6), (g, t, w) => {
  g.emo('🤫', 170, w('тишину'), -480, -40, { float: 7 });
  g.cap('ТОТАЛЬНЫЙ СЕКРЕТ', 100, w('закрытыми'), 180, -40, { cps: 24, col: '#fff' });
  g.emo('🔒', 130, w('дверями'), 180, 160, { float: 8 });
});
BT(80.2, 'grid', (g, t, w) => {
  g.cap('ДЕКАБРЬ 2016', 90, w('декабре'), -380, -330, { cps: 22 });
  C(g, 't_ellie', w('трейлер') - 0.4, -240, 30, 940, { r: -1 });
  g.el('', PLATE('PLAYSTATION EXPERIENCE', '#fff', '#2a6cff'), w('playstation'), 400, -230, { float: 4, z: 5 });
  C(g, 't_hands', w('гитарой') - 0.2, 600, 210, 420, { r: 4, z: 6 });
});
BT(87.4, 'grid', (g, t, w) => {
  C(g, 't_face', t + 0.1, -320, -40, 820);
  g.emo('🕵️', 150, w('секрете'), 480, -200, { float: 8 });
  NUM(g, '3,5 ГОДА', 'интернет строил теории', w('три'), 480, 120, RED);
});
// ---------- железо ----------
BT(91.9, BLUE, (g, t, w) => {
  SLAM(g, 'ЖЕЛЕЗО PS4', t + 0.1, 170);
  PS4(g, t + 0.5, 0, 250, 260);
}, { keys: [[S0(91.9), 2.4, 0, 0, 1.06]] });
BT(95.0, 'grid', (g, t, w) => {
  PS3P(g, w('ps3'), -480, 20, 300);
  g.el('', PLATE('ВОЙНА ЗА КАЖДЫЙ МБ', '#fff', RED), w('мегабайт'), -480, 260, { float: 4 });
  ARW(g, at('ps4', at('мегабайт', 95)) - 0.2, 0, 20);
  PS4(g, at('ps4', at('мегабайт', 95)), 480, 20, 280);
  g.el('', PLATE('БОЛЬШЕ СВОБОДЫ', '#fff', '#2bb673'), w('свободы'), 480, 260, { float: 4 });
});
BT(100.7, 'grid', (g, t, w) => {
  g.el('', SOCC('AMD', 'JAGUAR', 'процессор PS4'), w('восемь') - 0.3, -460, -20, { r: -3, float: 6 });
  g.el('', CORESG, w('ядер'), 260, -160, { float: 5, upd: coresUpd(w('ядер') + 0.1) });
  NUM(g, '~1,6 ГГц', 'низкая частота', w('частоте'), 300, 180, RED);
});
BT(108.5, 'grid', (g, t, w) => {
  g.emo('💻', 220, w('ноутбуков'), -440, -40, { float: 7 });
  g.el('', PLATE('ЯДРА ОТ НОУТБУКОВ', '#fff', INK), w('ноутбуков') + 0.2, -440, 190, { float: 4 });
  g.emo('🖥️', 200, w('игровых'), 440, -40, { float: 7 });
  X(g, w('компьютеров'), 440, -40, 260);
});
BT(111.6, 'grid', (g, t, w) => {
  tp(g, 'cover_ps3.jpg', t + 0.1, -540, 0, 300, 436, { r: -4 });
  g.cap('В РАЗЫ СЛОЖНЕЕ', 100, w('разы'), 120, -320, { cps: 22, col: RED });
  tp(g, 'cover_ps4.jpg', w('part'), -120, 20, 360, 455, { r: 3 });
  [['🗺️', 'ЛОКАЦИИ', 'локаций'], ['👥', 'ВРАГИ', 'врагов'], ['🏃', 'АНИМАЦИИ', 'анимаций'], ['💾', 'ДАННЫЕ ×2', 'данных']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), 460, -150 + i * 130, { float: 5 }));
});
BT(121.5, PCB, (g, t, w) => {
  g.el('', SOCC('AMD', 'JAGUAR', 'процессор', 300), t + 0.1, 0, -40, { float: 5 });
  g.cap('ГЛАВНАЯ ПРОБЛЕМА', 110, w('главная'), 0, -330, { cps: 24, col: '#fff' });
  g.cap('АНИМАЦИЯ', 110, w('анимации'), 0, 270, { cps: 20, col: RED });
});
// ---------- motion matching ----------
BT(125.1, 'grid', (g, t, w) => {
  g.cap('ОБЫЧНО: ГОТОВЫЕ КЛИПЫ', 84, t + 0.1, 0, -360, { cps: 32 });
  [['🚶', 'ШАГ', 'шаг'], ['↪️', 'ПОВОРОТ', 'поворот'], ['🏃', 'БЕГ', 'бег']].forEach(([e, txt, word], i) => { g.el('', ROLE(e, txt), w(word), -460 + i * 460, -40, { float: 5 }); if (i) link(g, w(word) - 0.1, -460 + i * 460 - 230, -40, 120, 0); });
  g.el('', PLATE('НОГИ СКОЛЬЗЯТ, ТЕЛО ДЁРГАЕТСЯ', '#fff', RED), w('скользят'), 0, 200, { float: 4 });
});
BT(135.6, 'grid', (g, t, w) => {
  ND(g, w('naughty'), -420, -320, 100);
  g.cap('MOTION MATCHING', 110, w('motion'), 0, -130, { cps: 26, col: RED });
  g.cap('= ПОДБОР ДВИЖЕНИЯ', 84, w('подбор'), 0, 30, { cps: 30 });
  C(g, 'walk', w('подбор') + 0.4, 0, 260, 460, { r: 0 });
});
BT(141.6, 'grid', (g, t, w) => {
  g.el('', LIB, w('библиотеку'), -380, 20, { float: 4, upd: libUpd(w('библиотеку') + 0.5) });
  C(g, 'mc2', w('актёров'), 480, -120, 600);
  g.el('', PLATE('ЗАПИСИ НАСТОЯЩИХ АКТЁРОВ', '#fff', INK), w('актёров') + 0.2, 480, 160, { float: 4 });
});
BT(144.9, 'grid', (g, t, w) => {
  C(g, 'climb1', t + 0.1, -330, -10, 820, { r: -2 });
  [['СКОРОСТЬ', 'скоростью'], ['НАПРАВЛЕНИЕ', 'поворачивает'], ['ПОВЕРХНОСТЬ', 'поверхность']].forEach(([txt, word], i) => g.el('', GROW(txt, ['#2bb673', '#2a6cff', '#ffb000'][i]), w(word), 470, -160 + i * 140, { from: [300, 0], upd: growUpd(w(word), 2.5, 0.95 - i * 0.1) }));
  g.el('', PLATE('КАЖДЫЙ КАДР', '#fff', RED), w('ищет'), 470, 300, { float: 4 });
});
BT(153.9, 'grid', (g, t, w) => {
  g.cap('ТЫСЯЧИ ПОЗ', 110, w('тысячи'), -280, -330, { cps: 22 });
  g.el('', LIB, w('фотографий'), -280, 40, { float: 4, upd: libUpd(w('фотографий') + 0.3) });
  NUM(g, '1/30 с', 'выбор следующей позы', w('тридцатую'), 440, 40, RED);
});
BT(162.3, 'grid', (g, t, w) => {
  C(g, 'climb2', t + 0.1, -320, -20, 820);
  g.el('', PLATE('ПЛАВНО И ЕСТЕСТВЕННО', '#fff', '#2bb673'), w('плавно'), 480, -120, { float: 4 });
  g.el('', SOCC('AMD', 'CPU', 'без остановки', 230), w('процессор'), 480, 140, { float: 5, upd: (tt, d) => { d.style.filter = `drop-shadow(0 0 ${(10 + Math.sin(tt * 12) * 10).toFixed(0)}px rgba(227,38,43,.8))`; } });
});
BT(166.0, 'grid', (g, t, w) => {
  tpp(g, 'ellie2_cut.png', 700, w('элли'), -620, 120, { from: [-300, 0] });
  C(g, 'enemy1', w('каждого'), -40, -150, 560, { off: 3 });
  C(g, 'hfight1', w('каждого') + 0.25, 280, 160, 560);
  C(g, 'enemy3', w('каждого') + 0.5, 600, -170, 460, { off: 2 });
}, { z: 0.93 });
// ---------- приоритеты ИИ ----------
BT(170.1, PCB, (g, t, w) => {
  g.cap('ВСЕХ СРАЗУ НЕ ПОСЧИТАТЬ', 96, w('нельзя'), 0, -60, { cps: 32, col: '#fff' });
  g.el('', PLATE('ПРИОРИТЕТЫ', '#fff', RED), w('приоритеты'), 0, 120, { float: 4 });
});
BT(175.0, 'grid', (g, t, w) => {
  g.el('', AISIM, t + 0.1, -280, 20, { float: 4, upd: aiUpd });
  g.el('', PLATE('РЯДОМ — В ПОЛНУЮ СИЛУ', '#fff', RED), w('рядом'), 440, -200, { float: 4 });
  g.el('', PLATE('ДАЛЕКО — УПРОЩЁННО', '#fff', '#8d9099'), w('далеко'), 440, -40, { float: 4 });
  g.emo('💤', 120, w('упрощённом'), 440, 140, { float: 9 });
});
BT(182.8, 'grid', (g, t, w) => {
  C(g, 'enemy2', t + 0.1, -300, -20, 860);
  g.emo('⏰', 160, w('просыпаются'), 520, -140, { float: 8 });
  g.el('', PLATE('«ПРОСЫПАЮТСЯ»', '#fff', RED), w('просыпаются') + 0.2, 520, 60, { float: 4 });
  g.emo('🙈', 140, w('замечаете'), 520, 240, { float: 8 });
});
BT(189.7, 'grid', (g, t, w) => {
  g.cap('ОДНИ ИЗ САМЫХ ЖИВЫХ ВРАГОВ', 84, t + 0.1, 0, -380, { cps: 34 });
  C(g, 'enemy3', w('живых'), -500, -40, 620);
  C(g, 'hfight2', w('противник'), 300, -60, 620);
  g.el('', ROLE('🏷️', 'У КАЖДОГО — ИМЯ'), w('имя'), 0, 300, { float: 5, z: 5 });
}, { z: 0.93 });
BT(194.5, 'grid', (g, t, w) => {
  C(g, 'hgrass2', t + 0.1, -320, -20, 860);
  g.cap('«НИК?! ГДЕ ТЫ?»', 80, w('звать'), 500, -200, { cps: 22, col: RED });
  g.emo('📢', 150, w('имени'), 500, 50, { float: 8 });
});
BT(199.6, 'grid', (g, t, w) => {
  [['💬', 'ПЕРЕГОВАРИВАЮТСЯ', 'переговариваются'], ['🔄', 'ОКРУЖАЮТ', 'окружают'], ['↗️', 'ОБХОДЯТ', 'обход']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), -520, -180 + i * 160, { from: [-300, 0], float: 5 }));
  C(g, 'hfight1', w('переговариваются'), 380, -20, 760, { off: 3 });
});
BT(203.3, 'grid', (g, t, w) => {
  C(g, 'dogsniff', t + 0.1, -320, -20, 860);
  g.emo('🐕', 170, w('собаки'), 500, -160, { float: 8 });
  g.el('', PLATE('ИДУТ ПО ЗАПАХУ', '#fff', RED), w('запаху'), 500, 60, { float: 4 });
  C(g, 'hdog', w('спрятались'), 500, 270, 380, { r: 4, z: 6 });
});
BT(207.3, 'grid', (g, t, w) => {
  C(g, 'grass1', t + 0.1, -300, -20, 860);
  g.el('', PLATE('В УКРЫТИИ НЕ ОТСИДЕТЬСЯ', '#fff', INK), w('укрытии'), 420, -100, { float: 4 });
  g.emo('🏃', 150, w('двигаться'), 480, 120, { float: 8 });
});
BT(211.2, DK('hgrass2', 2), (g, t, w) => { SLAM(g, 'СТЕЛС', t + 0.1, 220); }, { keys: [[S0(211.2), 1.4, 0, 0, 1.08]] });
BT(212.7, 'grid', (g, t, w) => {
  C(g, 'grass3', w('траву') - 0.3, -560, -160, 560);
  C(g, 'hgrass3', w('машинами') - 0.3, 0, 180, 560);
  C(g, 'glass', w('стеклом') - 0.2, 560, -160, 560);
  [['ТРАВА', 'траву', -560, 50], ['ПОД МАШИНАМИ', 'машинами', 0, 390], ['СТЕКЛО', 'стеклом', 560, 50]].forEach(([txt, word, x, y]) => g.el('', PLATE(txt, '#fff', INK), w(word) + 0.2, x, y, { float: 4, z: 6 }));
}, { z: 0.9 });
BT(217.4, 'grid', (g, t, w) => {
  C(g, 'glass', t + 0.1, -320, -100, 760, { off: 1 });
  g.el('', ROLE('💥', 'СТЕКЛО БЬЁТСЯ ПО-РАЗНОМУ'), w('разбивается'), 400, -200, { from: [300, 0], float: 5 });
  g.el('', ROLE('🪢', 'ВЕРЁВКИ КАК НАСТОЯЩИЕ'), w('верёвки'), 400, -40, { from: [300, 0], float: 5 });
  C(g, 'fence', w('цеплять') - 0.3, 380, 200, 460);
});
BT(226.0, 'grid', (g, t, w) => {
  g.el('', CORESG, t + 0.1, -300, -20, { float: 5, upd: (tt, d) => d.querySelectorAll('.cr').forEach((c, i) => { c.style.background = Math.sin(tt * 8 + i) > -0.3 ? RED : '#ff8a8a'; }) });
  g.el('', PLATE('ВСЁ — В ТЕ ЖЕ 8 ЯДЕР', '#fff', RED), w('восемь'), 380, -20, { float: 4 });
});
// ---------- мир ----------
BT(230.8, DK('horse1', 3), (g, t, w) => { SLAM(g, 'МИР', t + 0.1, 230); }, { keys: [[S0(230.8), 1.2, 0, 0, 1.08]] });
BT(231.8, 'grid', (g, t, w) => {
  C(g, 'horse1', t + 0.1, -320, -20, 860);
  g.cap('ОТКРЫТЫЙ МИР?', 90, w('открытый'), 430, -180, { cps: 22 });
  g.emo('🗺️', 150, w('куда'), 480, 60, { float: 8 });
});
BT(236.6, 'grid', (g, t, w) => {
  g.el('', PLATE('ТЕХНИЧЕСКИ — МОЖНО', '#fff', '#2bb673'), w('возможно'), -360, -180, { float: 4 });
  X(g, w('отказались'), -360, 40, 240);
  g.el('', TILE('ПРИЧИНА —<br>ИСТОРИЯ'), w('истории'), 380, 0, { from: [300, 0], float: 5 });
});
BT(241.5, 'grid', (g, t, w) => {
  C(g, 'horse2', t + 0.1, -300, -20, 860);
  g.emo('🥱', 160, w('бродит'), 500, -140, { float: 8 });
  g.el('', GROW('НАПРЯЖЕНИЕ', RED), w('напряжение'), 400, 120, { from: [300, 0], upd: (tt, d) => { d.querySelector('.gb').style.width = (100 - 90 * E.inOut(P(tt, at('исчезает', S0(241.5)), 1.2))).toFixed(1) + '%'; } });
});
BT(248.0, 'grid', (g, t, w) => {
  g.cap('ЦЕПОЧКА БОЛЬШИХ ЗОН', 96, w('цепочку'), 0, -380, { cps: 30 });
  ['e_walk', 'city1', 'roof', 'hinside'].forEach((k, i) => { const x = -690 + i * 460; C(g, k, w('цепочку') + i * 0.25, x, 20, 400, { r: i % 2 ? 2 : -2 }); if (i) link(g, w('цепочку') + i * 0.25 - 0.1, x - 230, 20, 60, 0); });
  g.el('', PLATE('ОГРАНИЧЕННЫХ', '#fff', RED), w('ограниченных'), 0, 260, { float: 4 });
}, { z: 0.9 });
BT(252.1, 'grid', (g, t, w) => {
  g.cap('ЦЕНТР СИЭТЛА', 110, w('сиэтла'), 0, -380, { cps: 22 });
  C(g, 'city1', w('территория'), -500, -40, 620);
  C(g, 'peek', w('здания'), 280, -100, 560);
  C(g, 'climb2', w('припасы'), 520, 220, 460, { off: 3 });
  g.el('', ROLE('📦', 'ПРИПАСЫ · ИСТОРИИ'), w('побочные'), -420, 300, { float: 5, z: 6 });
}, { z: 0.92 });
BT(260.1, 'grid', (g, t, w) => {
  C(g, 'walk', t + 0.1, -320, -20, 860);
  ARW(g, w('выводит'), 420, -120);
  g.el('', PLATE('СЛЕДУЮЩАЯ ГЛАВА', '#fff', INK), w('главе'), 460, 60, { float: 4 });
  g.el('', PLATE('ТЕМП КАК В КИНО', '#fff', RED), w('кино'), 460, 220, { float: 4 });
});
// ---------- спрятанные загрузки ----------
BT(266.7, PCB, (g, t, w) => { SLAM(g, 'ХИТРОСТЬ', w('хитрость') - 0.2, 190); g.emo('🤫', 150, w('немногие'), 0, 230, { float: 8 }); });
BT(268.9, 'grid', (g, t, w) => {
  tp(g, 'cover_ps3.jpg', t + 0.1, -500, 0, 330, 480, { r: -3 });
  g.el('', LOADING, w('загрузки'), 260, -140, { s: 0.75, float: 4 });
  X(g, w('загрузки') + 0.3, 260, -140, 260);
  g.el('', PLATE('ПОЧТИ БЕЗ ЭКРАНОВ ЗАГРУЗКИ', '#fff', INK), w('запомнили'), 260, 170, { float: 4 });
});
BT(272.7, 'grid', (g, t, w) => {
  tp(g, 'cover_ps4.jpg', t + 0.1, -480, 0, 330, 418, { r: 3 });
  g.el('', RAMST, w('память'), 280, -120, { s: 0.75, float: 5, upd: ramUpd(w('память') + 0.2) });
  g.el('', PLATE('ВСЁ СРАЗУ НЕ ВЛЕЗЕТ', '#fff', RED), w('невозможно'), 280, 130, { float: 4 });
});
BT(277.0, DK('door', 3), (g, t, w) => {
  g.cap('ЗАГРУЗКИ ЕСТЬ', 120, w('загрузки'), 0, -80, { cps: 22, col: '#fff' });
  g.cap('ПРОСТО СПРЯТАНЫ', 100, w('спрятаны'), 0, 90, { cps: 26, col: RED });
});
BT(280.8, 'grid', (g, t, w) => {
  C(g, 'door', t + 0.1, -280, -20, 900);
  g.el('', ROLE('🚪', 'ТЯЖЁЛАЯ ДВЕРЬ'), w('тяжёлая'), 540, -120, { from: [300, 0], float: 5 });
  g.el('', ROLE('🤝', 'ВДВОЁМ'), w('вдвоём'), 540, 50, { from: [300, 0], float: 5 });
});
BT(284.0, 'grid', (g, t, w) => {
  C(g, 'squeeze', t + 0.1, -280, -20, 900);
  g.el('', ROLE('🧱', 'УЗКАЯ ЩЕЛЬ'), w('щель'), 540, -120, { from: [300, 0], float: 5 });
  g.el('', ROLE('🐢', 'МЕДЛЕННО'), w('медленно'), 540, 50, { from: [300, 0], float: 5 });
});
BT(287.0, 'grid', (g, t, w) => {
  C(g, 'hinside', w('коридор') - 0.2, -480, -100, 620);
  C(g, 'fence', w('ворота') - 0.2, 380, 120, 620);
  g.el('', PLATE('КОРИДОРЫ И ВОРОТА', '#fff', INK), w('крутить'), -300, 300, { float: 4, z: 5 });
});
BT(289.5, 'grid', (g, t, w) => {
  C(g, 'door', t + 0.1, -460, -40, 680, { off: 6 });
  g.el('', HDDSV, w('жёсткого') - 0.6, 420, -20, { s: 0.75, float: 4, upd: hddUpd(0.6) });
  g.el('', GROW('ПОДГРУЗКА ЗОНЫ', '#2bb673'), w('выгружает'), 0, 320, { upd: growUpd(w('выгружает'), 5, 1) });
  g.el('', PLATE('ПРОШЛАЯ ЗОНА 🗑️', '#fff', '#8d9099'), w('выгружает') + 0.3, 420, -320, { float: 4 });
});
BT(297.2, 'grid', (g, t, w) => {
  g.el('', HDDSV, t + 0.1, -440, 0, { s: 0.85, float: 4, upd: hddUpd(0.5) });
  NUM(g, '+ НЕСКОЛЬКО СЕКУНД', 'форы для диска', w('форы'), 300, -120, '#2bb673');
  g.el('', PLATE('А ВЫ ДУМАЕТЕ — ЭТО АТМОСФЕРА', '#fff', INK), w('атмосферы') - 0.5, 260, 140, { float: 4 });
});
// ---------- графика ----------
BT(301.4, 'grid', (g, t, w) => {
  C(g, 'houtside', w('улицы') - 0.3, -560, -170, 560);
  C(g, 'hgrass1', w('зеленью') - 0.2, 0, 170, 560);
  C(g, 't_forest', w('пыль') - 0.3, 560, -170, 560);
  g.cap('ДЕТАЛЬНО — НО МНОГОЕ ЗАРАНЕЕ', 70, w('заранее'), 0, -400, { cps: 34 });
}, { z: 0.9 });
BT(310.7, 'grid', (g, t, w) => {
  C(g, 'hinside', t + 0.1, -320, -20, 820, { off: 4 });
  g.cap('ЗАПЕЧЁННЫЙ СВЕТ', 84, w('запечён'), 400, -260, { cps: 24 });
  g.el('', ROLE('💡', 'ПОСЧИТАН ЗАРАНЕЕ'), w('разработки'), 420, -80, { from: [300, 0], float: 5 });
  g.el('', ROLE('🖼️', 'СОХРАНЁН В ТЕКСТУРЫ'), w('текстуры'), 420, 70, { from: [300, 0], float: 5 });
  g.el('', ROLE('✅', 'КОНСОЛЬ НЕ СЧИТАЕТ'), at('кадр', at('текстуры', 310.7)), 420, 220, { from: [300, 0], float: 5 });
});
BT(318.6, 'grid', (g, t, w) => {
  [[12, 340], [6, 250], [2, 170]].forEach(([n, s], i) => g.el('', LODH(n, s), w('упрощёнными') + i * 0.25, -560 + i * 300, 20 + i * 30, { float: 5 }));
  g.el('', CULL, w('скрыто'), 460, 0, { s: 0.75, float: 4, upd: cullUpd });
});
// ---------- лица и захват ----------
BT(323.2, 'grid', (g, t, w) => {
  C(g, 'e_joel2', t + 0.1, -300, -20, 880);
  g.cap('ЛИЦА', 150, t + 0.15, 560, -150, { cps: 14 });
  g.el('', PLATE('ЭМОЦИИ БЕЗ СЛОВ', '#fff', RED), w('слов'), 540, 80, { float: 4 });
});
BT(328.5, 'grid', (g, t, w) => {
  C(g, 'mc3', w('захвата') - 0.2, -500, -140, 640);
  C(g, 'mc4', w('мимики'), 380, -140, 640);
  g.el('', PLATE('ГОЛОС · ТЕЛО · ЛИЦО — ОДНОВРЕМЕННО', '#fff', INK), w('одновременно'), 0, 230, { float: 4, z: 5 });
  g.emo('🎭', 140, w('театре'), 680, 220, { float: 8 });
}, { z: 0.93 });
BT(335.0, 'grid', (g, t, w) => {
  C(g, 'mc7', t + 0.1, -320, -40, 820);
  [['👄', 'ДРОЖАНИЕ ГУБ', 'дрожание'], ['👀', 'ВЗГЛЯД В СТОРОНУ', 'взгляд'], ['😬', 'НАПРЯЖЁННАЯ ЧЕЛЮСТЬ', 'челюсть']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), 480, -160 + i * 160, { from: [300, 0], float: 5 }));
});
// ---------- звук ----------
BT(340.3, DK('mc5', 3), (g, t, w) => {
  SLAM(g, 'ЗВУК', w('звуку') - 0.3, 220);
  g.el('', WAVE, w('звуку'), 0, 230, { shadow: false, upd: waveUpd });
});
BT(343.1, 'grid', (g, t, w) => {
  C(g, 'mc5', t + 0.1, -320, -40, 820);
  g.emo('🎙️', 160, w('студиях'), 480, -170, { float: 8 });
  g.el('', PLATE('ДНИ В ТЕСНЫХ СТУДИЯХ', '#fff', INK), w('дней'), 420, 50, { float: 4 });
  g.el('', PLATE('ТЯЖЁЛЫЕ ЗВУКИ', '#fff', RED), w('тяжёлые'), 480, 200, { float: 4 });
});
BT(351.3, 'grid', (g, t, w) => {
  C(g, 'enemy2', t + 0.1, -320, -20, 860, { off: 4 });
  g.el('', BIGNUM('0', 'вариантов криков', RED), w('сотни'), 500, -80, { float: 6, upd: countUp(w('сотни'), 100, '+') });
  g.el('', WAVE, w('вариантах'), 500, 200, { shadow: false, upd: waveUpd });
});
BT(359.3, 'grid', (g, t, w) => {
  C(g, 'mc6', t + 0.1, -320, -40, 820);
  g.emo('😢', 170, w('горе'), 480, -60, { float: 8 });
  g.el('', PLATE('НАСТОЯЩЕЕ ГОРЕ', '#fff', RED), w('горе') + 0.2, 480, 140, { float: 4 });
});
BT(362.8, 'grid', (g, t, w) => {
  C(g, 'mcteam', t + 0.1, -320, -40, 820);
  g.el('', ROLE('🎧', 'ЧАСЫ СЫРЫХ ЗАПИСЕЙ'), w('сырые'), 480, -140, { from: [300, 0], float: 5 });
  g.el('', ROLE('☕', 'ПЕРЕРЫВЫ'), w('перерывы'), 480, 20, { from: [300, 0], float: 5 });
});
BT(371.2, PCB, (g, t, w) => {
  g.cap('НЕ ЧУВСТВУЮТ АКТЁРЫ —', 90, w('чувствуют'), 0, -80, { cps: 30, col: '#fff' });
  g.cap('НЕ ПОЧУВСТВУЕТ ИГРОК', 90, w('почувствует'), 0, 70, { cps: 30, col: RED });
});
BT(378.8, 'grid', (g, t, w) => {
  C(g, 't_close', t + 0.1, -300, -20, 860, { off: 3 });
  g.el('', PLATE('СРАБОТАЛО', '#fff', '#2bb673'), w('сработало'), 500, -100, { float: 4 });
  g.el('', PLATE('СЛИШКОМ ХОРОШО', '#fff', RED), w('слишком'), 500, 80, { float: 4 });
});
// ---------- утечка ----------
BT(382.3, PCB, (g, t, w) => { SLAM(g, 'СКАНДАЛ ДО ВЫХОДА', t + 0.1, 130); g.emo('🔥', 150, t + 0.5, 0, 240, { float: 9 }); });
BT(384.5, 'grid', (g, t, w) => {
  g.cap('АПРЕЛЬ 2020', 100, w('апреле'), -320, -330, { cps: 22 });
  C(g, 'e_guitar', w('утекли'), -300, 40, 760);
  g.el('', PLATE('УТЕЧКА', '#fff', RED), w('утекли') + 0.2, 520, -100, { float: 4 });
  g.emo('📤', 140, w('сюжета'), 520, 120, { float: 8 });
});
BT(388.1, 'grid', (g, t, w) => {
  g.emo('😠', 180, w('обиженный'), -460, -60, { float: 8 });
  g.el('', TILE('«ОБИЖЕННЫЙ<br>СОТРУДНИК»'), w('сотрудник'), -460, 180, { float: 4 });
  ND(g, w('naughty'), 380, -200, 100);
  g.el('', CLOCK, w('графиком'), 380, 80, { s: 0.75, float: 4, upd: (tt, d) => clockUpd(tt * 8, d) });
});
BT(398.6, 'grid', (g, t, w) => {
  X(g, at('не', at('выяснилось', 398.6)), -460, -40, 260);
  g.cap('НЕ ТАК', 120, w('так'), -460, 200, { cps: 14, col: RED });
  g.el('', `<div style="width:620px;height:320px;border-radius:24px;background:#0b0f0b;font-family:monospace;color:#3cff62;font-size:28px;padding:30px;line-height:1.5;white-space:pre">&gt; scan vulnerability...\n&gt; access granted\n&gt; download dev_data/\n<span class="cur">█</span></div>`, w('взлома'), 380, -20, { float: 4 });
  g.el('', PLATE('ВЗЛОМ', '#fff', RED), w('взлома') + 0.2, 380, 220, { float: 4, z: 5 });
});
BT(407.5, 'grid', (g, t, w) => {
  g.el('', `<div style="width:640px;padding:30px;border-radius:24px;background:#fff;font-family:Osw;font-weight:700;font-size:44px;color:${INK};line-height:1.3">«Короткие фразы<br><span style="color:${RED}">без контекста</span>»<br><span style="font-size:30px;color:#8d9099">📱 · 💬 · 💬 · 💬</span></div>`, w('контекста') - 0.3, -360, -40, { float: 4 });
  g.emo('😡', 170, w('разозлились'), 460, -160, { float: 8 });
  NUM(g, 'ТЫСЯЧИ', 'разозлились заранее', w('тысячи'), 420, 120, RED);
});
BT(419.3, 'grid', (g, t, w) => {
  g.cap('СТРАХ СБЫЛСЯ', 110, w('боялись'), 0, -300, { cps: 22 });
  g.el('', PLATE('«СИКВЕЛ РАДИ ДЕНЕГ»', '#fff', RED), w('дешёвую'), 0, -60, { float: 4 });
  g.emo('💸', 150, w('заработать'), 0, 160, { float: 8 });
});
BT(425.1, 'grid', (g, t, w) => {
  g.el('', `<div style="width:300px;height:300px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:700;font-size:80px;color:#111;letter-spacing:4px">SONY</div>`, t + 0.1, -480, -20, { float: 5 });
  tp(g, 'cover_ps4.jpg', w('дату'), 20, 0, 320, 405, { r: -3 });
  NUM(g, '19 ИЮНЯ 2020', 'новая дата выхода', w('девятнадцатое'), 470, -100, RED);
});
// ---------- раскол ----------
BT(431.6, 'grid', (g, t, w) => {
  g.cap('АУДИТОРИЯ РАСКОЛОЛАСЬ', 96, w('расколола'), 0, -380, { cps: 30 });
  g.el('', PLATE('ШЕДЕВР', '#fff', '#2bb673'), w('шедевром'), -440, -150, { float: 4 });
  g.emo('😍', 150, w('шедевром') + 0.2, -440, 60, { float: 8 });
  g.el('', PLATE('НЕ ПРОСТИЛИ', '#fff', RED), w('простили'), 440, -150, { float: 4 });
  g.emo('😤', 150, w('простили') + 0.2, 440, 60, { float: 8 });
});
BT(438.5, 'grid', (g, t, w) => {
  tpp(g, 'abby_cut.png', 860, w('эбби') - 0.2, -420, 120, { from: [-300, 0] });
  g.cap('ЭББИ', 140, w('эбби'), 340, -240, { cps: 14 });
  g.el('', PLATE('УГРОЗЫ АКТРИСЕ', '#fff', RED), w('угрозы'), 340, -20, { float: 4 });
  g.emo('📱', 140, w('соцсетях'), 340, 190, { float: 8 });
});
BT(444.7, 'grid', (g, t, w) => {
  ND(g, t + 0.1, 0, -200, 120);
  g.emo('😳', 180, w('ожидали'), 0, 60, { float: 8 });
  g.cap('НЕ ОЖИДАЛИ', 100, w('реакции'), 0, 270, { cps: 20 });
});
BT(447.3, 'grid', (g, t, w) => {
  tp(g, 'cover_ps4.jpg', t + 0.1, -520, 0, 400, 505, { r: -3 });
  g.el('', BIGNUM('0', 'проданных копий', '#2bb673'), w('десять'), 260, -120, { float: 6, upd: countUp(w('десять'), 10, ' МЛН+') });
  g.emo('📈', 150, w('миллионов'), 260, 180, { float: 8 });
});
BT(452.8, 'grid', (g, t, w) => {
  g.el('', ROLE('⏳', 'ЖДАЛИ ГОДАМИ'), w('годами'), -420, -120, { from: [-300, 0], float: 5 });
  g.el('', ROLE('🔍', 'ПРОВЕРИТЬ «ПРАВДА ЛИ ВСЁ ТАК ПЛОХО»'), w('проверить'), 160, 60, { from: [300, 0], float: 5 });
  g.emo('🛒', 150, w('покупали'), 520, -200, { float: 8 });
});
BT(458.6, 'grid', (g, t, w) => {
  g.emo('🏆', 220, w('наград'), -420, -20, { float: 7 });
  g.el('', PLATE('ИГРА ГОДА', '#fff', '#c9a24a'), w('игры'), 260, -120, { float: 4 });
  NUM(g, 'СОТНИ', 'наград', w('огромное'), 260, 140);
});
BT(463.5, 'grid', (g, t, w) => {
  g.cap('ДОСТУПНОСТЬ', 120, w('реже') , 0, -360, { cps: 22 });
  NUM(g, '60+', 'настроек', w('шестидесяти'), -460, 0, '#2a6cff');
  [['🔎', 'КРУПНЫЙ ИНТЕРФЕЙС', 'увеличение'], ['🗣️', 'ОЗВУЧИВАНИЕ ТЕКСТА', 'озвучивание'], ['🔔', 'ЗВУКОВЫЕ ПОДСКАЗКИ', 'звуковые'], ['🌓', 'ВЫСОКИЙ КОНТРАСТ', 'контрастности']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), 330, -180 + i * 130, { from: [300, 0], float: 5 }));
});
BT(472.0, 'grid', (g, t, w) => {
  C(g, 'walk', t + 0.1, -300, -20, 860, { off: 2 });
  g.el('', TILE('ПРОШЛИ ДАЖЕ<br>НЕЗРЯЧИЕ ИГРОКИ'), w('незрячие'), 520, -60, { from: [300, 0], float: 5 });
  g.el('', PLATE('ПРОРЫВ', '#fff', '#2bb673'), w('прорывом'), 520, 180, { float: 4 });
});
// ---------- итог ----------
BT(477.8, DK('t_ellie', 5), (g, t, w) => {
  LOGO(g, t + 0.1, 0, -230, 170, true);
  SLAM(g, 'СЕКРЕТ — НЕ В МОЩНОСТИ', w('секрет'), 100);
  PS4(g, w('ps4'), 0, 250, 220);
});
BT(481.8, 'grid', (g, t, w) => {
  ND(g, t + 0.1, 0, -360, 100);
  [['🧠', 'ВРАГИ ВДАЛИ ДУМАЮТ МЕНЬШЕ', 'враги'], ['💡', 'СВЕТ ПОСЧИТАН ЗАРАНЕЕ', 'свет'], ['🚪', 'ЗАГРУЗКИ ЗА ДВЕРЯМИ', 'загрузки'], ['🗺️', 'МИР — БОЛЬШИЕ ЗОНЫ', 'мир']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), i % 2 ? 140 : -140, -190 + i * 150, { from: [i % 2 ? 300 : -300, 0], float: 5 }));
});
BT(495.7, 'grid', (g, t, w) => {
  g.cap('ВСЁ — НА ТО, ЧТО ЧУВСТВУЕШЬ', 84, t + 0.1, 0, -400, { cps: 34 });
  [['climb1', 'движения'], ['e_joel', 'лица'], ['mc5', 'звук'], ['t_close', 'историю']].forEach(([k, word], i) => C(g, k, w(word), -690 + i * 460, 20, 420, { r: i % 2 ? 2 : -2 }));
  [['ДВИЖЕНИЯ', 'движения'], ['ЛИЦА', 'лица'], ['ЗВУК', 'звук'], ['ИСТОРИЯ', 'историю']].forEach(([txt, word], i) => g.el('', PLATE(txt, '#fff', INK), w(word) + 0.2, -690 + i * 460, 200, { float: 4, z: 5 }));
}, { z: 0.9 });
BT(504.0, DK('t_forest', 2), (g, t, w) => {
  g.cap('А ЧТО ПОЧУВСТВОВАЛИ ВЫ?', 110, t + 0.1, 0, -80, { cps: 30, col: '#fff' });
  g.emo('💬', 160, t + 0.7, 0, 150, { float: 8 });
});
BT(507.3, 'grid', (g, t, w) => {
  tp(g, 'cover_ps3.jpg', t + 0.1, -440, 0, 360, 523, { r: -3 });
  PS3P(g, w('ps3'), 320, -40, 300);
  g.el('', PLATE('ОТДЕЛЬНЫЙ РАЗБОР', '#fff', RED), w('разбор'), 320, 200, { float: 4 });
});
BT(512.9, 'grid', (g, t, w) => {
  tpp(g, 'ellie2_cut.png', 860, t + 0.05, -560, 80, { from: [-300, 0] });
  g.cap('СПАСИБО ЗА ПРОСМОТР!', 100, t + 0.3, 220, -40, { cps: 30 });
  g.emo('👋', 170, t + 0.8, 220, 180, { float: 8 });
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
  // v2: в каждой сцене камера всё время едет — медленный наезд и боковой сдвиг (как в референсе);
  // при переходе дрейф прошлой сцены плавно гасится, поэтому рывка нет
  let cur = 0; for (let i = 0; i < beats.length; i++) if (t >= beats[i].t0) cur = i;
  const cb = beats[cur], pb = beats[cur - 1], V = 22, Z = 0.016;
  const dirOf = (b) => (b.i % 2 ? 1 : -1);
  const kTr = E.inOutQuint(P(t, cb.t0, cb.tr || 0.5));
  const loc = t - cb.t0, pl = pb ? cb.t0 - pb.t0 : 0;
  const sat = (u) => 110 * (1 - Math.exp(-u * V / 110)); // дрейф плавно упирается в ~110px
  const dx = dirOf(cb) * sat(loc) + (pb ? dirOf(pb) * sat(pl) * (1 - kTr) : 0);
  const dzRaw = Z * loc * kTr + (pb ? Z * pl * (1 - kTr) : 0);
  const dz = 0.14 * (1 - Math.exp(-dzRaw / 0.14));
  return { x: c[0] + sx + dx / c[2] + Math.sin(t * 0.55) * 10, y: c[1] + sy + Math.cos(t * 0.43) * 8, z: c[2] * 0.93 * (1 + dz), r: c[3] * 0.8 + sr + Math.sin(t * 0.32) * 0.4 };
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
window.DUR = 515.2;
(async () => {
  await document.fonts.load('700 60px Osw', 'НАСТОЯЩЕЕ БЕЗУМИЕ 256 МБ ?!'); await document.fonts.load('900 60px Mont', 'NAUGHTY DOG');
  await document.fonts.load('60px "Noto Color Emoji"', '🍋💪🤯🌍📱🧠🔥🎭🔍💾🎮✈️👊🌪️🌊🤖⭐➕🚗🏚️🔫🐾🤝🏆💡😱🥵🎭✨💥🎞️📋🔥🔍🚂🎥🏜️🎩🥷🧗👁️🎓🔴📷🏃🕺🎤🧠🗜️🗑️🚢⚙️🖼️↕️🚰💧📉⚡🕶️🧑‍🎨👷👩‍💻🎬🗿🖌️💻🎙️💸❓💾👥💵🤑🐌😐😮😠🤔🌫️☀️🔁🫣🤸🥊👕✂️💬✅➡️☀️🌧️❄️🍂🤖💬🔊🧠🖼️🌍⚠️🤲🤷👉👈🔍✊💦🎬🎭🖐️👀😵🏁💥⚙️🌿🔧🗑️⚡⏱️🥊🐢🔥📦📄🐺🎯😴⚔️📍⬅️➡️🧍‍♂️💡🔦🥵✅🦠🎨💧🏃👁️📐🧱😡😐👻');
  await document.fonts.load('60px "Noto Color Emoji"', [...new Set([...document.getElementById('world').textContent])].filter((c) => c.codePointAt(0) > 0x2000).join(''));
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  // фоны сцен грузим заранее, иначе в первый кадр сцены фон ещё пустой (белая вспышка)
  await Promise.all(beats.filter((b) => b.layer).map((b) => { const i = new Image(); i.src = b.layer.style.backgroundImage.slice(5, -2); return i.decode().catch(() => {}); }));
  window.__ready = true;
})();
