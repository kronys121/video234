// элемент не должен появляться в самом конце сцены и сразу исчезать: держим на экране минимум HOLD сек
const HOLD = 2.0;
const BT = (t, bg, fn, cam = {}) => beat(t, bg, (g) => fn(g, t, (p, k = 0) => { const r0 = at(p, t, k); const nx = (typeof BTS !== 'undefined' && BTS.find((x) => x > t + 0.01)) || 1e9; const r = Math.min(r0, Math.max(t + 0.35, nx - HOLD)); (window.WL = window.WL || []).push([t, p, r, r0]); return r; }), cam);
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
