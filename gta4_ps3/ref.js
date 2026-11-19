// GTA 4 на PS3 — стиль «коллаж на бесконечном листе»: камера летает по одному большому полотну,
// вырезанные предметы с тенями, карточки с кадрами игры, короткие подписи узким шрифтом.
// window.renderAt(t) детерминированно рисует кадр.

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

const world = document.getElementById('world');
function ab(parent, css, html = '') { const d = document.createElement('div'); d.className = 'o'; d.style.cssText = css; d.innerHTML = html; parent.appendChild(d); return d; }
function img(parent, src, css) { const i = new Image(); i.src = src; i.className = 'o'; i.style.cssText = css; parent.appendChild(i); return i; }
// x,y — центр объекта в координатах полотна; rx/ry — 3D-наклон карточки
function place(el, { x = 0, y = 0, s = 1, r = 0, o = 1, rx = 0, ry = 0, blur = 0 }) {
  el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) perspective(1600px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  el.style.opacity = o;
  if (blur !== undefined) el.style.filter = el.dataset.f ? `${el.dataset.f}${blur > 0.05 ? ` blur(${blur.toFixed(1)}px)` : ''}` : (blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : '');
}
const SH = 'drop-shadow(0 34px 34px rgba(0,0,0,.30))';
function prop(src, h) { const i = img(world, src, `height:${h}px`); i.dataset.f = SH; i.style.filter = SH; return i; }
// влёт объекта: масштаб с перелётом + подъём, до t0 скрыт
function popIn(el, t, t0, x, y, o = {}) {
  const { s = 1, r = 0, dur = 0.6, from = [0, 140], r0 = 0, rx = 0, ry = 0, ry0 = ry, t1 = 1e9, out = 0.35 } = o;
  const k = E.outBack(P(t, t0, dur)), p = E.outCubic(P(t, t0, dur));
  const gone = t >= t1 ? E.outCubic(P(t, t1, out)) : 0;
  place(el, { x: x + from[0] * (1 - p), y: y + from[1] * (1 - p) - gone * 60, s: s * (0.55 + 0.45 * k) * (1 - 0.2 * gone), r: lerp(r0, r, p), o: t >= t0 ? Math.min(1, P(t, t0, 0.15)) * (1 - gone) : 0, rx, ry: lerp(ry0, ry, p) });
}
// подпись: буквы печатаются по одной (подъём из-под маски), уходят разлетаясь
function caption(text, size) {
  const d = ab(world, `font-size:${size}px`); d.classList.add('tx');
  d.letters = [...text].map((ch) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; d.appendChild(s); return s; });
  return d;
}
function captionUpd(d, t, t0, t1, x, y, o = {}) {
  const { cps = 22, r = -2, ry = 0 } = o;
  if (t < t0 || t > t1 + 0.7) { d.style.opacity = 0; return; }
  place(d, { x, y, r, ry }); d.style.opacity = 1;
  d.letters.forEach((s, i) => {
    const a = t0 + i / cps, k = E.outCubic(P(t, a, 0.22));
    if (t < t1) { s.style.transform = `translateY(${((1 - k) * 0.5 * parseFloat(d.style.fontSize)).toFixed(1)}px)`; s.style.opacity = t >= a ? k : 0; return; }
    const u = P(t, t1 + i * 0.012, 0.55), e = u * u;
    const ang = rnd(i, 3) * Math.PI * 2, dist = 160 + rnd(i, 4) * 260;
    s.style.transform = `translate(${(Math.cos(ang) * dist * e).toFixed(1)}px,${(Math.sin(ang) * dist * e - 80 * e).toFixed(1)}px) rotate(${((rnd(i, 5) - 0.5) * 540 * e).toFixed(1)}deg)`;
    s.style.opacity = 1 - u;
  });
}
const pend = [];
function clipCard(w, h, dir, n) { const c = ab(world, `width:${w}px;height:${h}px`); c.classList.add('card'); const i = new Image(); c.appendChild(i); return { c, i, dir, n, cur: -1 }; }
function clipAt(cc, sec) { const k = clamp(Math.floor(sec * 30) % cc.n + 1, 1, cc.n); if (k !== cc.cur) { cc.cur = k; cc.i.src = `/gta4_ps3/clips/${cc.dir}/${String(k).padStart(4, '0')}.jpg`; pend.push(cc.i.decode().catch(() => {})); } }
function picCard(w, h, src, pos = 'center') { const c = ab(world, `width:${w}px;height:${h}px`); c.classList.add('card'); const i = new Image(); i.src = src; i.style.objectPosition = pos; c.appendChild(i); return c; }

// ================= полотно: где что лежит =================
// A (0–12 c): PS3, Cell, память. Центр (0,0)
const ps3A = prop('/gta4_ps3/assets/ps3_fat.png', 560);
const cell = ab(world, 'width:330px;height:330px;border-radius:26px;padding:10px;background:linear-gradient(135deg,#f4f4f6,#b9bcc4 45%,#eceef2 60%,#9fa3ab);box-shadow:0 30px 40px rgba(0,0,0,.28)');
cell.innerHTML = '<img src="/gta4_ps3/assets/cell_chip.png" style="width:310px;height:310px;display:block;border-radius:18px">';
const ram = prop('/gta4_ps3/assets/ram.png', 320);
const badge = ab(world, 'width:190px;height:190px');
badge.innerHTML = `<svg width="190" height="190"><circle cx="95" cy="95" r="88" fill="#f7f7f8"/><circle cx="95" cy="95" r="70" fill="none" stroke="#d9d9dd" stroke-width="16"/><circle id="arc" cx="95" cy="95" r="70" fill="none" stroke="#3b3b40" stroke-width="16" stroke-linecap="round" transform="rotate(-90 95 95)" stroke-dasharray="0 999"/><text id="pc" x="95" y="110" text-anchor="middle" font-family="Osw" font-weight="700" font-size="44" fill="#2a2a2c">0%</text></svg>`;
badge.dataset.f = 'drop-shadow(0 18px 20px rgba(0,0,0,.25))';
const arc = badge.querySelector('#arc'), pc = badge.querySelector('#pc');
const capA1 = caption('ПОТРЯСАЮЩАЯ КОНСОЛЬ', 66);
const capA2 = caption('ОЧЕНЬ МОЩНАЯ', 84);
const capA3 = caption('НА МАКСИМУМ', 84);

// B (12–14.08): GTA IV на фоне закатного города. Центр (3200,0)
const BX = 3200, BY = 0;
const back = ab(world, 'width:2300px;height:1300px;border-radius:40px;overflow:hidden');
back.innerHTML = '<img src="/gta4_ps3/assets/city_sunset.jpg" style="width:100%;height:100%;object-fit:cover;filter:grayscale(.85) brightness(1.15) contrast(.9) blur(3px)">';
const backVeil = ab(back, 'position:absolute;inset:0;background:rgba(236,236,238,.35)');
const logo = prop('/gta4_ps3/assets/gta4_logo.png', 520);
const rock = prop('/gta4_ps3/assets/rockstar.png', 150);

// C (14.08–18.24): PS3 » игра работает. Центр (3200,1500)
const CX = 3200, CY = 1500;
const ps3C = prop('/gta4_ps3/assets/ps3_fat.png', 520);
const chev = ab(world, 'width:220px;height:120px');
chev.innerHTML = `<svg width="220" height="120">${[0, 1, 2].map((i) => `<path class="cv" d="M${20 + i * 62} 15 L${70 + i * 62} 60 L${20 + i * 62} 105" fill="none" stroke="#2a2a2c" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
const cvs = [...chev.querySelectorAll('.cv')];
const game = clipCard(700, 508, 'ps3_run_big', 65);
const capC = caption('ВПЕЧАТЛЯЕТ', 96);

// D (18.24–22.72): карта 16 км² и детали. Центр (6400,1500)
const DX = 6400, DY = 1500;
const map = picCard(940, 578, '/gta4_ps3/assets/map_blue.jpg');
const aerial = picCard(400, 640, '/gta4_ps3/assets/city_aerial.jpg', '50% 30%');
const capD1 = caption('16 КМ²', 110);
const capD2 = caption('ДЕТАЛИ', 96);

// E (22.72–): деформация машин. Центр (6400,3000)
const EX = 6400, EY = 3000;
const cr1 = clipCard(760, 522, 'crash1', 68);
const cr2 = clipCard(560, 469, 'crash2', 143);
const capE = caption('ДЕФОРМАЦИЯ МАШИН', 86);

// ================= камера =================
// [время начала перелёта, длительность, x, y, zoom, наклон]
const KEYS = [
  [0, 0, -40, 20, 0.78, 0],
  [0.0, 2.6, -40, 10, 1.0, -1],
  [2.84, 0.9, 120, -10, 0.98, 1],
  [7.44, 1.0, 160, 30, 0.86, -1],
  [12.0, 0.55, BX, BY, 1.0, 0],
  [14.08, 0.6, CX, CY, 1.0, 1],
  [18.24, 0.6, DX, DY, 0.98, -1],
  [20.6, 0.7, DX + 110, DY, 0.93, 0],
  [22.72, 0.5, EX, EY, 1.0, 1],
];
function camAt(t) {
  let c = KEYS[0].slice(2);
  for (let i = 1; i < KEYS.length; i++) {
    const [t0, d, x, y, z, r] = KEYS[i];
    if (t < t0) break;
    const k = d > 0 ? E.inOutQuint(P(t, t0, d)) : 1;
    c = [lerp(c[0], x, k), lerp(c[1], y, k), lerp(c[2], z, k), lerp(c[3], r, k)];
  }
  // постоянный медленный «дрейф», чтобы кадр никогда не стоял
  return { x: c[0] + Math.sin(t * 0.5) * 14, y: c[1] + Math.cos(t * 0.4) * 10, z: c[2] * (1 + 0.012 * Math.sin(t * 0.35)), r: c[3] + Math.sin(t * 0.3) * 0.4 };
}

// ================= кадр =================
function frame(t) {
  const c = camAt(t);
  world.style.transform = `translate(960px,540px) rotate(${c.r.toFixed(3)}deg) scale(${c.z.toFixed(4)}) translate(${(-c.x).toFixed(1)}px,${(-c.y).toFixed(1)}px)`;
  // направленное размытие в движении по скорости камеры (сдвиг за кадр в пикселях экрана)
  const c0 = camAt(t - 1 / 60), c1 = camAt(t + 1 / 60);
  const zf = Math.abs(c1.z - c0.z) / c.z * 250;
  const bx = Math.min(26, Math.abs(c1.x - c0.x) * c.z * 0.22 + zf), by = Math.min(26, Math.abs(c1.y - c0.y) * c.z * 0.22 + zf);
  document.getElementById('mbg').setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`);
  document.getElementById('cam').style.filter = bx + by > 0.6 ? 'url(#mb)' : 'none';

  // A
  popIn(ps3A, t, 0.0, -60, 30, { dur: 0.8, from: [0, 90] });
  captionUpd(capA1, t, 1.15, 2.85, -60, 380, { cps: 26 });
  popIn(cell, t, 3.36, 300, -60, { dur: 0.7, from: [120, 0], ry0: 85, ry: -14, r: 4 });
  ps3A.style.zIndex = 3; cell.style.zIndex = 2;
  captionUpd(capA2, t, 5.52, 7.3, -90, -390, { cps: 18, r: -3 });
  popIn(ram, t, 9.4, 360, 380, { dur: 0.6, from: [260, 120], r: -9, r0: -30 });
  ram.style.zIndex = 4;
  const v = E.inOut(P(t, 9.6, 10.88 - 9.6));
  popIn(badge, t, 9.55, 720, 200, { dur: 0.5, from: [0, 60] });
  badge.style.zIndex = 5;
  arc.setAttribute('stroke-dasharray', `${(v * 440).toFixed(1)} 999`); pc.textContent = Math.round(v * 100) + '%';
  arc.setAttribute('stroke', v > 0.97 ? '#e8452c' : '#3b3b40');
  captionUpd(capA3, t, 10.88, 11.9, -40, -400, { cps: 20, r: -3 });

  // B
  place(back, { x: BX, y: BY, s: 1 + (t - 12) * 0.02, o: t >= 11.9 ? 1 : 0 });
  popIn(logo, t, 12.65, BX, BY - 20, { dur: 0.7, from: [0, 60], s: 1 + Math.max(0, t - 13.3) * 0.03 });
  popIn(rock, t, 12.95, BX + 640, BY + 330, { dur: 0.5, r: 6, r0: -20 });

  // C
  popIn(ps3C, t, 14.08, CX - 470, CY + 20, { dur: 0.7, from: [-120, 0] });
  place(chev, { x: CX - 70, y: CY, o: t >= 14.6 ? 1 : 0 });
  cvs.forEach((p, i) => p.setAttribute('opacity', t >= 14.6 ? 0.25 + 0.75 * (fr((t - 14.6) * 1.4 - i * 0.22) < 0.4 ? 1 : 0) : 0));
  popIn(game.c, t, 14.75, CX + 400, CY + 10, { dur: 0.7, from: [180, 0], ry0: -60, ry: -12, r: 2 });
  clipAt(game, Math.max(0, t - 14.75) * 0.5);
  captionUpd(capC, t, 17.08, 18.2, CX + 40, CY - 380, { cps: 24, r: -3 });

  // D
  popIn(map, t, 18.3, DX - 320, DY + 20, { dur: 0.75, from: [-200, 60], ry0: 50, ry: 14, r: -3 });
  captionUpd(capD1, t, 18.68, 22.65, DX - 380, DY - 380, { cps: 14, r: -3 });
  popIn(aerial, t, 20.64, DX + 520, DY + 10, { dur: 0.7, from: [200, 80], ry0: -60, ry: -14, r: 3 });
  captionUpd(capD2, t, 21.84, 22.65, DX + 520, DY - 400, { cps: 18, r: 2 });

  // E
  popIn(cr1.c, t, 22.72, EX - 280, EY - 20, { dur: 0.6, from: [-160, 80], ry0: 40, ry: 10, r: -3 });
  popIn(cr2.c, t, 22.95, EX + 430, EY + 40, { dur: 0.6, from: [160, 80], ry0: -40, ry: -10, r: 3 });
  clipAt(cr1, Math.max(0, t - 22.72)); clipAt(cr2, Math.max(0, t - 22.95) + 0.6);
  captionUpd(capE, t, 23.44, 99, EX + 60, EY + 360, { cps: 30, r: -2 });
}

window.renderAt = async (t) => { pend.length = 0; frame(t); await Promise.all(pend); };
window.DUR = 24.2;
(async () => {
  await document.fonts.load('700 60px Osw', 'ПОТРЯСАЮЩАЯ 16 КМ²');
  await Promise.all([...document.images].filter((i) => i.src).map((i) => i.decode().catch(() => {})));
  window.__ready = true;
})();
