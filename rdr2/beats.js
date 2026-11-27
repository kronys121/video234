// =====================================================================
//              RED DEAD REDEMPTION 2 НА PS4 — БИТЫ
// =====================================================================
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

// 0 · 2018
BT(0, 'grid', (g, t, w) => {
  g.cap('2018', 280, t + 0.1, 0, -20, { cps: 10, r: -2 });
  g.emo('🤠', 170, t + 0.5, 480, -210, { float: 8 });
}, { keys: [[0, 2.0, 0, 0, 1.05]] });
// 1 · Rockstar выпускает RDR2
BT(at('rockstar') - 0.1, 'grid', (g, t, w) => {
  g.prop('/gta4_ps3/assets/rockstar.png', 220, t + 0.05, -560, -60, { r: -6, float: 6 });
  pic(g, 'cover.jpg', w('red'), 120, 30, 420, 523, { r: 4, from: [260, 60] });
  g.prop(RA('rdr2_logo.png'), 150, w('redemption'), 120, -340, { from: [0, -120], float: 4 });
  g.prop(RA('arthur_full.png'), 760, w('red') + 0.35, 600, 120, { from: [300, 0], float: 4 });
}, { keys: [[at('red'), 0.6, 80, 0, 1.0]] });
// 2 · на PS4 (синий фон)
BT(at('playstation') - 0.6, DI(RA('blue.jpg')), (g, t, w) => {
  g.prop(RA('ps4.png'), 340, t + 0.1, -120, 70, { from: [0, 260], float: 8 });
  g.cap('PLAYSTATION 4', 120, w('playstation'), -120, -270, { cps: 28 });
  pic(g, 'cover.jpg', t + 0.5, 560, 40, 260, 324, { r: 6, from: [300, 0], float: 6 });
}, { keys: [[at('playstation'), 1.4, 0, 20, 1.07]] });
// 3 · консоли уже пять лет
BT(at('консоли') - 0.1, DI(RA('blue.jpg')), (g, t, w) => {
  g.cap('2013', 180, t + 0.05, -440, -40, { cps: 12, r: -3 });
  ARW(g, t + 0.45, 0, -40);
  g.cap('2018', 180, w('продавалась'), 440, -40, { cps: 12, r: 3 });
  g.el('', PLATE('5 ЛЕТ НА РЫНКЕ', '#fff', RED), w('пять'), 0, 230, { from: [0, 160], float: 5 });
});
// 4 · Дикий Запад, 75 км²
BT(at('внутри') - 0.1, 'grid', (g, t, w) => {
  pic(g, 'map.jpg', t + 0.05, -220, 30, 900, 622, { r: -2, from: [0, 220] });
  g.cap('ДИКИЙ ЗАПАД', 100, w('дикий'), -220, -380, { cps: 22 });
  NUM(g, '75 КМ²', 'площадь карты', w('семьдесят'), 560, 140);
}, { keys: [[at('семьдесят'), 0.8, 170, 40, 1.05]] });
// 5 · пять штатов: перевалы, болота, пустыня, города — клипы, соединённые линиями
BT(at('пять', at('километров')) - 0.15, 'grid', (g, t, w) => {
  g.cap('5 ШТАТОВ', 110, t + 0.05, 0, -420, { cps: 18 });
  [['snow', 'ПЕРЕВАЛЫ', 'заснеженные'], ['swamp', 'БОЛОТА', 'болота'], ['sandstorm', 'ПУСТЫНЯ', 'пустыня'], ['saintdenis', 'ГОРОДА', 'города']].forEach(([k, txt, word], i) => {
    const x = -690 + i * 460, y = i % 2 ? 60 : 20;
    ccv(g, k, w(word), x, y, 520, { r: i % 2 ? 3 : -3, off: k === 'saintdenis' ? 8 : 0 });
    g.el('', PLATE(txt, '#fff', INK), w(word) + 0.2, x, y + 300, { from: [0, 80], float: 4, z: 5 });
    if (i) link(g, w(word) - 0.2, x - 230, y - 20, 150, 0);
  });
}, { z: 0.9, keys: [[at('заснеженные'), 0.5, -480, 0, 1.0], [at('болота'), 0.5, -160, 0, 1.0], [at('пустыня'), 0.5, 160, 0, 1.0], [at('города'), 0.5, 480, 0, 1.0], [at('города') + 0.6, 0.6, 0, 0, 0.85]] });
// 6 · 200+ видов животных, своя погода
BT(at('больше') - 0.1, 'grid', (g, t, w) => {
  cc(g, 'animals', t + 0.05, -380, -40, 820, { r: -2 });
  NUM(g, '200+', 'видов животных', w('двухсот'), -520, 300, INK, { z: 5 });
  g.cap('СВОЯ ПОГОДА', 90, w('погода'), 520, -360, { cps: 22 });
  ccv(g, 'rain', w('погода'), 390, 60, 470, { r: 3 });
  ccv(g, 'fog', w('каждом'), 700, 100, 470, { r: -3 });
}, { keys: [[at('погода'), 0.7, 260, -20, 1.0]] });
// 7 · 1200 актёров — голоса и движения
BT(at('около') - 0.1, 'grid', (g, t, w) => {
  cc(g, 'cutscenes', t + 0.05, 330, -60, 860, { r: 2, off: 18 });
  NUM(g, '1200', 'актёров', w('тысячи'), -560, -160);
  g.prop(RA('dutch_full.png'), 620, w('актёров'), -360, 220, { from: [-200, 0], float: 4 });
  g.emo('🎙️', 130, w('голоса'), 120, 330, { float: 8 });
  g.emo('🕺', 130, w('движения'), 330, 330, { float: 8 });
  g.cap('ГОЛОСА И ДВИЖЕНИЯ', 74, w('голоса'), 330, -400, { cps: 26 });
});
// 8 · вопрос: как это поместилось? — на тёмной плате
BT(at('вопрос') - 0.1, DI(RA('pcb.jpg')), (g, t, w) => {
  g.prop(RA('ps4.png'), 300, t + 0.05, 0, 230, { from: [0, 260], float: 6 });
  SLAM(g, 'КАК ВСЁ ЭТО ПОМЕСТИЛОСЬ?', w('как'), 120);
  g.emo('❓', 150, w('поместилось'), 640, -230, { float: 10 });
}, { keys: [[at('как'), 2.4, 0, 60, 1.12]] });
// 9 · с чем пришлось работать
BT(at('сначала') - 0.1, DI(RA('blue.jpg')), (g, t, w) => {
  g.prop(RA('ps4.png'), 360, t + 0.05, 0, 60, { from: [0, 240], float: 7 });
  g.cap('ЖЕЛЕЗО PS4', 130, w('посмотрим'), 0, -300, { cps: 20 });
  g.emo('🔍', 170, w('работать'), 420, 30, { float: 10 });
});
// 10 · процессор AMD Jaguar: 8 ядер, ~1,6 ГГц
BT(at('сердце') - 0.1, 'grid', (g, t, w) => {
  g.el('', SOCC('AMD', 'JAGUAR', 'центральный процессор'), t + 0.05, -470, -40, { from: [0, 220], r: -3, float: 6 });
  g.cap('ПРОЦЕССОР', 90, w('процессор'), -470, -330, { cps: 22 });
  g.el('', CORESG, w('восьмиядерный'), 260, -170, { from: [0, 160], float: 5, upd: coresUpd(w('восьмиядерный') + 0.1) });
  g.cap('8 ЯДЕР', 80, w('восьмиядерный') + 0.3, 650, -170, { cps: 18, r: 3 });
  NUM(g, '~1,6 ГГц', 'частота', w('одной'), 340, 230, RED);
  link(g, w('одной') - 0.1, -150, 120, 240, 20);
}, { keys: [[at('восьмиядерный'), 0.6, 120, -60, 1.04], [at('одной'), 0.7, 140, 100, 1.04]] });
// 11 · ядра для ноутбуков, а ПК в разы мощнее
BT(at('эти', at('гигагерца')) - 0.1, 'grid', (g, t, w) => {
  g.emo('💻', 230, w('ноутбуков') - 0.3, -460, -20, { float: 8 });
  g.el('', PLATE('ДЛЯ НОУТБУКОВ', '#fff', INK), w('ноутбуков'), -460, 200);
  g.emo('🎮', 120, w('игр'), -150, -230, { float: 8 });
  g.el('width:260px;height:260px', XMARK(260), w('игр') + 0.15, -150, -230, { shadow: false, from: [0, 0], upd: xUpd(w('игр') + 0.15) });
  g.emo('🖥️', 260, w('пк'), 470, -40, { float: 8 });
  g.el('', PLATE('В РАЗЫ МОЩНЕЕ', '#fff', RED), w('мощнее'), 470, 200);
}, { keys: [[at('пк'), 0.7, 220, 0, 1.03]] });
// 12 · видеочип ~1,8 TFLOPS
BT(at('рядом') - 0.1, 'grid', (g, t, w) => {
  g.el('', SOCC('AMD', 'GPU', 'видеочип · 18 блоков', 360), t + 0.05, -380, -10, { from: [0, 220], r: 3, float: 6 });
  g.cap('ВИДЕОЧИП', 90, w('видеочип'), -380, -320, { cps: 22 });
  NUM(g, '~1,8', 'терафлопса', w('одну'), 400, -20, RED);
  link(g, w('одну') - 0.1, 10, -10, 160, 0);
});
// 13 · жёсткий диск 5400 об/мин — самый медленный
BT(at('жёсткий') - 0.1, 'grid', (g, t, w) => {
  g.el('', HDDSV, t + 0.05, -420, 0, { from: [0, 240], r: -3, float: 5, upd: hddUpd(0.5) });
  g.cap('ЖЁСТКИЙ ДИСК', 90, t + 0.2, -420, -340, { cps: 24 });
  NUM(g, '5400', 'оборотов в минуту', w('пять'), 380, -100);
  g.el('', PLATE('САМЫЙ МЕДЛЕННЫЙ', '#fff', RED), w('самых'), 380, 170, { from: [0, 120] });
  g.emo('🐌', 150, w('медленных'), 690, 330, { float: 8 });
}, { keys: [[at('самых'), 0.7, 120, 60, 1.04]] });
// 14 · 8 ГБ GDDR5
BT(at('наконец') - 0.3, 'grid', (g, t, w) => {
  g.el('', RAMST, w('восемь') - 0.2, 0, 60, { from: [0, 220], r: -2, float: 5, upd: ramUpd(w('гигабайт')) });
  NUM(g, '8 ГБ', 'GDDR5', w('восемь'), -40, -260, RED, { r: -2 });
  g.cap('ПАМЯТЬ', 90, w('памяти'), 460, -250, { cps: 22, r: 3 });
});
// 15 · главный подвох
BT(at('вот', at('gddr5')) - 0.2, DI(RA('pcb.jpg')), (g, t, w) => {
  SLAM(g, 'ГЛАВНЫЙ ПОДВОХ', w('главный'), 160);
  g.emo('⚠️', 160, w('подвох'), 0, 230, { float: 10 });
}, { keys: [[at('главный'), 2.0, 0, 30, 1.1]] });

// =====================================================================
//                      ДАЛЬШЕ — ПОЛНОЕ ВИДЕО
// =====================================================================
// полоса 8 ГБ: система ~3 / игра ~5
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

// 16 · память одна на всех
BT(72.2, 'grid', (g, t, w) => {
  g.el('', RAMST, t + 0.05, 0, -60, { from: [0, 220], float: 5 });
  g.cap('ОДНА НА ВСЕХ', 100, w('одна'), 0, -330, { cps: 22 });
  [['🎮', 'ИГРА', 'игра'], ['🖼️', 'ГРАФИКА', 'графика'], ['⚙️', 'СИСТЕМА', 'система']].forEach(([e, txt, word], i) => {
    g.el('', ROLE(e, txt), w(word), -520 + i * 520, 230, { from: [0, 160], float: 5, r: i - 1 });
    link(g, w(word) - 0.15, -520 + i * 520, 130, 110, 90);
  });
}, { keys: [[at('игра', 74), 0.6, 0, 60, 1.02]] });
// 17 · система забирает ~3 ГБ, игре ~5
BT(79.2, 'grid', (g, t, w) => {
  g.cap('8 ГБ', 120, t + 0.05, 0, -300, { cps: 14 });
  g.el('', MEM8, t + 0.2, 0, 0, { from: [0, 200], upd: mem8Upd(w('забирает'), w('игре')) });
  g.emo('😬', 140, w('пять'), 560, 260, { float: 8 });
});
// 18 · рюкзак
BT(84.8, 'grid', (g, t, w) => {
  g.emo('🎒', 340, t + 0.1, 0, 40, { float: 6 });
  g.cap('ПОХОД С ОДНИМ РЮКЗАКОМ', 84, w('поход'), 0, -380, { cps: 30 });
  [['🍞', 'еда'], ['⛺', 'палатка'], ['👕', 'одежда'], ['🔦', 'фонарь'], ['🩹', 'аптечка']].forEach(([e, word], i) => {
    const a = -Math.PI + (i / 4) * Math.PI;
    g.emo(e, 130, w(word), Math.cos(a) * 560, 60 + Math.sin(a) * 300, { float: 8 });
  });
  pl(g, 'БОЛЬШЕ НЕ СТАНЕТ', w('станет') - 0.3, 0, 330, RED);
}, { z: 0.95 });
// 19 · берёшь только нужное на ближайший отрезок
BT(94.6, 'grid', (g, t, w) => {
  g.emo('🎒', 220, t + 0.05, -560, 60, { float: 6 });
  link(g, w('ближайшем'), -390, 60, 300, 0);
  g.el('', TILE('БЛИЖАЙШИЙ<br>ОТРЕЗОК'), w('ближайшем'), -20, 60, { from: [0, 120], float: 5 });
  g.emo('🏕️', 200, w('базе'), 520, -170, { float: 7 });
  pl(g, 'ОСТАЛЬНОЕ — НА БАЗЕ', w('базе') + 0.2, 520, 30);
  g.emo('🐎', 150, w('забираешь'), 520, 230, { float: 8 });
});
// 20 · ровно так PS4 с миром RDR2
BT(102.0, DI(RA('blue.jpg')), (g, t, w) => {
  g.prop(RA('ps4.png'), 300, t + 0.05, -460, 80, { from: [0, 220], float: 7 });
  ARW(g, t + 0.4, -90, 60);
  pic(g, 'map.jpg', w('миром'), 430, 40, 760, 525, { r: 3 });
  g.prop(RA('rdr2_logo.png'), 110, w('red'), 430, -300, { float: 4 });
});
// 21 · в памяти никогда не лежит вся карта
BT(106.3, 'grid', (g, t, w) => {
  pic(g, 'map.jpg', t + 0.05, -260, 20, 860, 595, { r: -2 });
  g.el('width:520px;height:520px', XMARK(520), w('вся') - 0.1, -260, 20, { shadow: false, from: [0, 0], upd: xUpd(w('вся') - 0.1) });
  g.cap('ВСЯ КАРТА?', 100, w('вся'), 560, -60, { cps: 20, r: 3 });
  g.cap('НЕТ', 130, w('карта') + 0.3, 560, 120, { cps: 10, r: -3, col: RED });
});
// 22 · только то, что вокруг вас
BT(109.1, 'grid', (g, t, w) => {
  g.el('', MAPG(13, 8, 62), t + 0.05, -230, 30, { from: [0, 200], float: 4, upd: mapUpd(13, 8, 62, (tt) => [2 + (tt - 109) * 0.9, 4 + Math.sin(tt * 0.8) * 1.2, 1, 0], 2.3) });
  pl(g, 'ВОКРУГ ВАС', w('вокруг'), 560, -180, '#2bb673');
  g.emo('👁️', 130, w('видите'), 560, 20, { float: 8 });
  pl(g, 'ВОТ-ВОТ ПОЯВИТСЯ', w('появится') - 0.2, 560, 220, '#ffb000');
});
// 23 · скрытое и позади — выгружается
BT(114.8, 'grid', (g, t, w) => {
  g.emo('⛰️', 260, t + 0.05, -470, 0, { float: 6 });
  g.emo('🌳', 140, t + 0.4, -470, -40, { float: 4, t1: w('выгружается') });
  g.cap('ЗА ХОЛМОМ', 70, w('холмом'), -470, -260, { cps: 22 });
  g.emo('🏚️', 160, w('позади'), 460, 0, { float: 6, t1: w('выгружается') });
  g.cap('ДАЛЕКО ПОЗАДИ', 70, w('далеко'), 460, -260, { cps: 22 });
  pl(g, 'ВЫГРУЖАЕТСЯ 🗑️', w('выгружается'), 0, 260, RED);
});
// 24 · occlusion culling
BT(119.3, 'grid', (g, t, w) => {
  g.el('', CULL, t + 0.05, -200, 20, { from: [0, 200], float: 4, upd: cullUpd });
  g.cap('ОТСЕЧЕНИЕ НЕВИДИМОГО', 80, w('отсечением'), -200, -340, { cps: 30 });
  g.el('', TILE('OCCLUSION<br>CULLING'), w('occlusion'), 620, 60, { from: [0, 140], float: 5, r: 3 });
});
// 25 · уровни детализации
BT(123.9, 'grid', (g, t, w) => {
  g.cap('УРОВНИ ДЕТАЛИЗАЦИИ', 90, w('уровни'), 0, -390, { cps: 28 });
  [[12, 380], [6, 280], [2, 190]].forEach(([n, s], i) => {
    g.el('', LODH(n, s), w('предметы') + i * 0.3, -520 + i * 480, 40 + i * 30, { from: [0, 160], float: 5 });
  });
  g.cap('LOD', 120, w('детализации') + 0.2, 640, -220, { cps: 10, col: RED, r: 4 });
});
// 26 · дом вдали — десятки полигонов, рядом — тысячи
BT(129.4, 'grid', (g, t, w) => {
  g.el('', LODH(2, 220), t + 0.05, -480, 60, { from: [0, 160], float: 5 });
  NUM(g, 'ДЕСЯТКИ', 'полигонов · на горизонте', w('десятков'), -480, -260);
  g.el('', LODH(14, 440), w('шагах'), 380, 60, { from: [0, 160], float: 5 });
  NUM(g, 'ТЫСЯЧИ', 'полигонов · в двух шагах', w('тысяч'), 380, -300, RED);
});
// 27 · раньше это бросалось в глаза (RAGE)
BT(136.2, 'grid', (g, t, w) => {
  g.prop('/gta4_ps3/assets/rockstar.png', 200, t + 0.05, -520, -40, { r: -6, float: 6 });
  g.el('', TILE('ИГРЫ<br>ROCKSTAR'), w('играх'), 0, -40, { from: [0, 160], float: 5 });
  g.emo('👀', 170, w('глаза'), 500, -40, { float: 8 });
});
// 28 · дома и деревья вырастали из воздуха
BT(139.8, 'grid', (g, t, w) => {
  g.emo('🧍', 200, t + 0.05, -560, 120, { float: 4 });
  ['🌳', '🏠', '🌲', '🏚️'].forEach((e, i) => g.emo(e, 170, w('вырастать') + i * 0.25, -150 + i * 230, 100 - (i % 2) * 80, { from: [0, 0], s: 1, dur: 0.25, float: 5 }));
  g.cap('ИЗ ВОЗДУХА', 100, w('воздуха'), 200, -280, { cps: 20, r: -2 });
  pl(g, 'В ПАРЕ МЕТРОВ', w('метрах'), -560, -150, RED);
});
// 29 · новая цель: край-в-край без загрузок
BT(146.8, DI(RA('blue.jpg')), (g, t, w) => {
  pic(g, 'map.jpg', t + 0.05, 0, 40, 980, 678, { r: -1 });
  g.cap('ЦЕЛЬ', 110, t + 0.2, 0, -400, { cps: 12 });
  link(g, w('другого'), 0, 40, 760, -12, RED);
  pl(g, 'БЕЗ ЗАГРУЗОК', w('загрузок'), -330, 310, RED, { z: 5 });
  pl(g, 'БЕЗ ПОЯВЛЕНИЙ ИЗ НИОТКУДА', w('появляющихся'), 290, 400, INK, { z: 5 });
}, { keys: [[at('загрузок', 150), 0.6, 0, 120, 0.98]] });
// 30 · при 5 ГБ — почти невозможно
BT(156.2, DI(RA('pcb.jpg')), (g, t, w) => {
  NUM(g, '5 ГБ', 'на всё', t + 0.05, -420, 0, RED);
  SLAM(g, 'ПОЧТИ НЕВОЗМОЖНО', w('невозможным') - 0.2, 120);
}, { keys: [[at('невозможным', 156), 1.6, 0, 0, 1.08]] });
// 31 · решение — конвейер данных
BT(159.7, 'grid', (g, t, w) => {
  g.cap('НЕПРЕРЫВНЫЙ КОНВЕЙЕР', 96, w('непрерывный'), 0, -300, { cps: 30 });
  g.el('', BINARY(1300), w('данных') - 0.3, 0, 40, { shadow: false, from: [0, 0], upd: binUpd });
  g.emo('💾', 150, w('конвейер'), -720, 40, { float: 6 });
  g.emo('📺', 150, w('данных'), 720, 40, { float: 6 });
});
// 32 · ресторанная кухня: кладовая / стол / повар / официант
BT(163.0, 'grid', (g, t, w) => {
  g.cap('РЕСТОРАННАЯ КУХНЯ', 90, t + 0.1, 0, -400, { cps: 28 });
  [['🗄️', 'КЛАДОВАЯ', 'ЖЁСТКИЙ ДИСК', 'кладовая'], ['🔪', 'СТОЛ', 'ПАМЯТЬ', 'разделочный'], ['👨‍🍳', 'ПОВАР', 'ПРОЦЕССОР', 'шеф'], ['🤵', 'ОФИЦИАНТ', 'ВИДЕОЧИП', 'официант']].forEach(([e, a, b, word], i) => {
    const x = -690 + i * 460, tt = w(word);
    g.emo(e, 170, tt, x, -110, { float: 7 });
    g.el('', ROLE('', a), tt + 0.15, x, 80, { from: [0, 120], float: 5 });
    pl(g, b, tt + 0.5, x, 220, RED);
    if (i) link(g, tt - 0.1, x - 230, -110, 170, 0);
  });
}, { z: 0.9, keys: [[at('кладовая', 163), 0.6, -460, 0, 1.05], [at('разделочный', 163), 0.6, -150, 0, 1.05], [at('шеф', 163), 0.6, 160, 0, 1.05], [at('официант', 163), 0.6, 470, 0, 1.05], [at('экран', 174), 0.7, 0, 0, 0.88]] });
// 33 · скачете — кладовая выдаёт продукты
BT(178.5, 'grid', (g, t, w) => {
  ccv(g, 'gallop', t + 0.05, -480, 30, 640, { r: -3 });
  g.emo('🗄️', 170, w('кладовая'), 240, -120, { float: 6 });
  ['🥕', '🥩', '🧀', '🍅', '🥖'].forEach((e, i) => g.emo(e, 100, w('выдаёт') + i * 0.2, 400 + i * 90, 100 + (i % 2) * 60, { from: [-200, -200], float: 8 }));
  pl(g, 'БЕЗ ОСТАНОВКИ', w('остановки'), 300, 300, RED);
});
// 34 · одно дерево = модель, кора, листва, тени, анимация
BT(182.9, 'grid', (g, t, w) => {
  g.emo('🌳', 300, t + 0.05, 0, 30, { float: 5 });
  [['🧊', 'МОДЕЛЬ', 'модель'], ['🪵', 'КОРА', 'коры'], ['🍃', 'ЛИСТВА', 'листву'], ['🌑', 'ТЕНИ', 'тени'], ['🌬️', 'ВЕТЕР', 'анимацию']].forEach(([e, txt, word], i) => {
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2, x = Math.cos(a) * 560, y = Math.sin(a) * 320;
    g.el('', ROLE(e, txt), w(word), x, y + 40, { from: [-x * 0.4, -y * 0.4], float: 5 });
  });
});
// 35 · трава, камни, облака — сотни заказов в секунду
BT(190.0, 'grid', (g, t, w) => {
  [['🌾', 'трава'], ['🪨', 'камни'], ['☁️', 'облака'], ['🌲', 'следующее']].forEach(([e, word], i) => g.emo(e, 150, w(word), -660 + i * 200, -170 + (i % 2) * 70, { float: 8 }));
  g.el('', BIGNUM('0', 'заказов в секунду', RED), w('сотни'), 380, 60, { from: [0, 180], float: 6, upd: countUp(w('сотни'), 500, '+') });
  g.emo('🧾', 150, w('заказов'), -330, 200, { float: 8 });
});
// 36 · стол — повар — официант, 30 раз в секунду
BT(196.6, 'grid', (g, t, w) => {
  g.emo('🔪', 150, t + 0.05, -620, 0, { float: 6 });
  link(g, w('повар') - 0.1, -430, 0, 180, 0);
  g.emo('👨‍🍳', 170, w('повар'), -200, 0, { float: 6 });
  link(g, w('официанту') - 0.1, 30, 0, 180, 0);
  g.emo('🤵', 170, w('официанту'), 260, 0, { float: 6 });
  NUM(g, '30', 'раз в секунду', w('тридцать'), 610, 0, RED);
  pl(g, 'БЕЗ ПЕРЕРЫВА', w('перерыва'), 0, 260);
}, { keys: [[at('тридцать', 196), 0.6, 160, 0, 1.04]] });
// 37 · гул PS4
BT(206.0, DI(RA('blue.jpg')), (g, t, w) => {
  g.prop(RA('ps4.png'), 360, t + 0.05, -300, 60, { float: 4, upd: (tt, d) => { d.style.transform += ` translate(${(Math.sin(tt * 60) * 2).toFixed(1)}px,0)`; } });
  g.el('', WAVE, w('гул'), 380, 40, { from: [0, 120], upd: waveUpd });
  g.emo('🔊', 160, w('гул') + 0.2, 380, -170, { float: 8 });
  g.cap('ТОТ САМЫЙ ГУЛ', 100, w('гул'), -300, -300, { cps: 22 });
});
// 38 · узкое место — медленная кладовая
BT(209.6, 'grid', (g, t, w) => {
  g.el('', HDDSV, t + 0.05, -440, 20, { from: [0, 220], r: -3, float: 4, upd: hddUpd(0.4) });
  g.cap('УЗКОЕ МЕСТО', 100, w('узкое'), 300, -260, { cps: 22 });
  g.emo('🐌', 170, w('медленная'), 300, 60, { float: 8 });
});
// 39 · лошадь мчится быстрее, чем диск успевает
BT(213.8, 'grid', (g, t, w) => {
  ccv(g, 'gallop', t + 0.05, 420, 10, 640, { r: 3, off: 4 });
  g.el('', HDDSV, w('успевает') - 0.2, -470, 20, { from: [0, 220], r: -3, float: 4, upd: hddUpd(0.4) });
  g.el('', PLATE('НЕ УСПЕВАЕТ', '#fff', RED), w('успевает'), -470, 320, { from: [0, 120], z: 5 });
  g.emo('💨', 130, w('мчится'), 120, -230, { float: 8 });
});
// 40 · предзагрузка по направлению
BT(219.6, 'grid', (g, t, w) => {
  g.el('', MAPG(14, 8, 62), t + 0.05, -200, 40, { from: [0, 200], float: 4, upd: mapUpd(14, 8, 62, (tt) => [2 + (tt - 219.6) * 0.75, 2 + (tt - 219.6) * 0.32, 0.92, 0.39], 2.0, true) });
  g.cap('ИГРА ДУМАЕТ НАПЕРЁД', 84, w('думает'), -200, -330, { cps: 30 });
  pl(g, 'ПОДГРУЗКА ЗАРАНЕЕ', w('подгружать'), 620, 120, '#ffb000');
});
// 41 · дороги и холмы держат темп
BT(227.6, 'grid', (g, t, w) => {
  cc(g, 'horsedirt', t + 0.05, -300, -20, 860, { r: -2, off: 8 });
  [['🛤️', 'дороги'], ['🥾', 'тропы'], ['⛰️', 'холмы']].forEach(([e, word], i) => g.emo(e, 130, w(word), 450 + (i % 2) * 140, -230 + i * 150, { float: 8 }));
  pl(g, 'СКОРОСТЬ ≤ ДИСК', w('скорость'), -300, 300, RED);
});
// 42 · маршрут и темп — часть оптимизации
BT(235.0, 'grid', (g, t, w) => {
  ccv(g, 'gallop', t + 0.05, -500, 20, 600, { r: -3, off: 9 });
  g.cap('ТЕМП ПУТЕШЕСТВИЯ', 90, w('темп'), 260, -160, { cps: 26 });
  pl(g, '= ОПТИМИЗАЦИЯ', w('оптимизации'), 260, 40, RED);
  g.emo('🧠', 150, w('оптимизации') + 0.3, 260, 250, { float: 8 });
});
// 43 · 100 ГБ, а Blu-ray — 50
BT(240.6, 'grid', (g, t, w) => {
  g.cap('КЛАДОВАЯ ОГРОМНАЯ', 90, t + 0.05, 0, -390, { cps: 26 });
  NUM(g, '~100 ГБ', 'весит игра', w('ста'), -460, -20, RED);
  g.el('', DISC, w('blu'), 380, 20, { from: [0, 200], s: 0.8, float: 5, upd: (tt, d) => { const k = d.querySelector('.dk'); if (k) k.style.transform = `rotate(${(tt * 90) % 360}deg)`; } });
  pl(g, 'BLU-RAY = 50 ГБ', w('пятьдесят'), 380, 290);
});
// 44 · поэтому дисков два
BT(247.2, 'grid', (g, t, w) => {
  g.cap('ДВА ДИСКА', 110, t + 0.05, 0, -390, { cps: 18 });
  [[-420, 'ДИСК 1', 'мир · персонажи · системы', 'первого'], [420, 'ДИСК 2', 'сюжетные ролики', 'втором']].forEach(([x, a, b, word], i) => {
    g.el('', DISC, w(word), x, -20, { from: [0, 200], s: 0.7, float: 5, upd: (tt, d) => { const k = d.querySelector('.dk'); if (k) k.style.transform = `rotate(${(tt * 80) % 360}deg)`; } });
    g.el('', TILE(`${a}<br><span style="font-size:34px">${b}</span>`), w(word) + 0.4, x, 260, { from: [0, 120], float: 4 });
  });
});
// 45 · всё переносится на жёсткий диск
BT(257.5, 'grid', (g, t, w) => {
  g.el('', DISC, t + 0.05, -500, 0, { from: [0, 200], s: 0.6, float: 5 });
  ARW(g, w('переносится'), -80, 0);
  g.el('', HDDSV, w('жёсткий'), 400, 0, { from: [0, 200], float: 4, upd: hddUpd(0.6) });
  g.el('', GROW('УСТАНОВКА', '#2bb673'), w('переносится'), 0, 330, { from: [0, 80], upd: growUpd(w('переносится'), 2.6) });
});
// 46 · теперь про картинку
BT(260.4, DI(RA('pcb.jpg')), (g, t, w) => {
  SLAM(g, 'КАРТИНКА', t + 0.15, 180);
  g.emo('🖼️', 150, t + 0.5, 520, -230, { float: 8 });
});
// 47 · 1080p, 30 к/с
BT(262.0, 'grid', (g, t, w) => {
  cc(g, 'valentine', t + 0.05, 330, -20, 900, { r: 2, off: 5 });
  NUM(g, '1080p', 'обычная PS4', w('1080'), -560, -150);
  NUM(g, '30 FPS', 'кадров в секунду', w('кадрах'), -560, 170, RED);
});
// 48 · не много, но выглядит плавнее
BT(267.6, 'grid', (g, t, w) => {
  cc(g, 'valentine', t + 0.05, -300, -20, 900, { r: -2, off: 11 });
  g.cap('ВЫГЛЯДИТ ПЛАВНЕЕ', 80, w('выглядит'), 400, -300, { cps: 26, r: 3 });
  g.emo('🤔', 160, w('больше'), 560, 120, { float: 8 });
});
// 49 · два приёма
BT(271.4, DI(RA('blue.jpg')), (g, t, w) => {
  g.cap('ДВА ПРИЁМА', 150, t + 0.1, 0, -60, { cps: 18 });
  g.emo('✌️', 170, t + 0.5, 0, 200, { float: 8 });
});
// 50 · временное сглаживание
BT(273.1, 'grid', (g, t, w) => {
  g.cap('1 · ВРЕМЕННОЕ СГЛАЖИВАНИЕ', 80, t + 0.1, 0, -380, { cps: 32 });
  g.el('', JAG, w('собирается') - 0.4, -380, 40, { from: [0, 200], float: 4, upd: jagUpd(w('ровными') - 0.5) });
  pl(g, 'TAA', w('каждый'), -380, 260, RED);
  ['КАДР −2', 'КАДР −1', 'КАДР 0'].forEach((txt, i) => g.el('', TILE(txt, 'font-size:40px;padding:16px 28px'), w('предыдущие') + i * 0.2, 470, -170 + i * 140, { from: [200, 0], float: 4, r: 2 }));
});
// 51 · размытие в движении: векторы
BT(281.3, 'grid', (g, t, w) => {
  g.cap('2 · РАЗМЫТИЕ В ДВИЖЕНИИ', 80, t + 0.1, 0, -400, { cps: 32 });
  ccv(g, 'gallop', t + 0.3, -470, 40, 620, { r: -2, off: 2 });
  ['➡️', '↗️', '➡️'].forEach((e, i) => g.emo(e, 110, w('куда') + i * 0.2, -120 + i * 40, -170 + i * 160, { float: 6 }));
  g.el('', TILE('ВЕКТОРЫ<br>ДВИЖЕНИЯ'), w('векторы'), 430, -40, { from: [0, 140], float: 5 });
  pl(g, 'СМАЗЫВАЕТ ПИКСЕЛИ', w('смазывает'), 430, 220, RED);
});
// 52 · глаз видит плавное движение
BT(292.7, 'grid', (g, t, w) => {
  g.emo('👁️', 220, t + 0.05, -380, 0, { float: 6 });
  g.cap('ПЛАВНО', 150, w('плавное'), 300, 0, { cps: 14, r: -2 });
});
// 53 · галоп: пейзаж плывёт, Артур чёткий
BT(297.0, 'grid', (g, t, w) => {
  g.el('', `<img src="${RA('arthur_horse.jpg')}" style="width:900px;height:506px;object-fit:cover;border-radius:30px;display:block">`, t + 0.05, -200, 20, { from: [0, 200], float: 4, upd: (tt, d) => { const im = d.firstChild; im.style.filter = tt > at('плывёт', 297) ? `blur(${(2 + Math.sin(tt * 6)).toFixed(1)}px)` : 'none'; } });
  pl(g, 'ПЕЙЗАЖ ПЛЫВЁТ', w('плывёт'), 520, -200, '#4aa8ff');
  mg(g, w('седле'), 'arthur_bust.png', 640, 120, 520, { from: [200, 0] });
  pl(g, 'АРТУР ЧЁТКИЙ', w('чётким'), 620, 380, RED, { z: 5 });
});
// 54 · PS4 Pro: шахматная отрисовка
BT(303.0, 'grid', (g, t, w) => {
  g.el('', CONS('PS4 PRO', '#2a2b30', 380), t + 0.05, -560, -60, { from: [0, 160], float: 5 });
  g.cap('ШАХМАТНАЯ ОТРИСОВКА', 80, w('шахматной'), 200, -390, { cps: 30 });
  g.el('', CHECK, w('шахматной'), 240, 40, { from: [0, 200], float: 4, upd: checkUpd(w('рисует'), w('восстанавливает')) });
  pl(g, 'ПОЛОВИНА', w('половину'), -560, 180, RED);
  pl(g, 'ВОССТАНОВЛЕНА', w('восстанавливает'), -560, 300, '#2bb673');
});
// 55 · экономия огромная, разницы почти нет
BT(316.0, 'grid', (g, t, w) => {
  NUM(g, '×2', 'экономия', t + 0.05, -460, 0, RED);
  g.emo('🔍', 170, w('разницу'), 260, -60, { float: 8 });
  g.cap('НЕ ЗАМЕТНО', 100, w('заметить'), 260, 170, { cps: 22 });
});
// 56 · Xbox One X — полный 4K
BT(320.5, 'grid', (g, t, w) => {
  g.el('', CONS('XBOX ONE X', '#121212', 420), w('xbox'), -440, -40, { from: [0, 160], float: 5 });
  NUM(g, '4K', 'без хитростей', w('4k'), 280, -120, '#107c10');
  pl(g, 'САМАЯ КРАСИВАЯ ВЕРСИЯ', w('красивой'), 200, 210, '#107c10');
});
// 57 · но базовая PS4 слабее в разы — оптимизация под неё
BT(330.2, DI(RA('blue.jpg')), (g, t, w) => {
  g.prop(RA('ps4.png'), 330, t + 0.05, -380, 60, { float: 6 });
  g.cap('БАЗОВАЯ PS4', 100, t + 0.2, -380, -260, { cps: 22 });
  pl(g, 'СЛАБЕЕ В НЕСКОЛЬКО РАЗ', w('слабее'), 380, -80, RED);
  pl(g, 'ОПТИМИЗАЦИЯ — ПОД НЕЁ', w('оптимизация'), 380, 100, '#2bb673');
  g.emo('🎯', 150, w('неё'), 380, 280, { float: 8 });
});
// 58 · атмосфера — слой маскировки
BT(339.0, D('fog', 6), (g, t, w) => {
  SLAM(g, 'АТМОСФЕРА', t + 0.15, 170);
  g.emo('🌫️', 150, w('маскировки'), 560, -220, { float: 8 });
});
// 59 · туман, дымка, контровой свет
BT(342.1, 'grid', (g, t, w) => {
  ccv(g, 'fog', w('туман'), -560, 30, 600, { r: -3 });
  ccv(g, 'sandstorm', w('дымка'), -10, 50, 600, { r: 2, off: 20 });
  pl(g, 'ТУМАН', w('туман') + 0.2, -560, 330);
  pl(g, 'ДЫМКА', w('дымка') + 0.2, -10, 350);
  g.emo('🌅', 170, w('закате'), 520, -60, { float: 8 });
  pl(g, 'СВЕТ НА ЗАКАТЕ', w('закате') + 0.2, 520, 130);
}, { z: 0.95 });
// 60 · прячет то, что не прогрузилось
BT(346.5, 'grid', (g, t, w) => {
  cc(g, 'fog', t + 0.05, -300, 0, 860, { r: -2, off: 9 });
  g.emo('🫣', 170, w('прячет'), 470, -150, { float: 8 });
  pl(g, 'ПРЯЧЕТ ДАЛЬНИЕ ОБЪЕКТЫ', w('прогрузиться') - 0.3, 330, 160, RED);
});
// 61 · объёмные облака
BT(351.7, 'grid', (g, t, w) => {
  g.cap('ОБЪЁМНЫЕ ОБЛАКА', 90, w('облака'), 0, -400, { cps: 26 });
  g.emo('☁️', 300, w('облака'), -420, -60, { float: 10, upd: (tt, d) => { d.style.transform += ` scale(${(1 + Math.sin(tt * 1.3) * 0.06).toFixed(3)})`; } });
  [['🔄', 'МЕНЯЮТ ФОРМУ', 'форму'], ['🌑', 'ТЕНИ НА ЗЕМЛЮ', 'тени'], ['☀️', 'ЛУЧИ СКВОЗЬ НИХ', 'лучи']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), 380, -170 + i * 170, { from: [200, 0], float: 5 }));
});
// 62 · облака обновляются по частям
BT(361.4, 'grid', (g, t, w) => {
  g.el('', CLOUDS, t + 0.05, -200, 30, { from: [0, 200], float: 4, upd: cloudUpd });
  g.cap('ПО ЧАСТЯМ', 100, w('частям'), -200, -320, { cps: 18 });
  NUM(g, '1/18', 'за один кадр', w('кадров'), 640, 40, RED);
});
// 63 · глаз не замечает, видеочип экономит
BT(368.8, 'grid', (g, t, w) => {
  g.emo('👁️', 180, t + 0.05, -460, -60, { float: 6 });
  pl(g, 'НЕ ЗАМЕЧАЕТ', w('замечает'), -460, 160);
  g.el('', SOCC('AMD', 'GPU', 'видеочип', 280), w('видеочип'), 400, -60, { from: [0, 200], float: 5 });
  pl(g, 'ЭКОНОМИЯ', w('экономит'), 400, 190, '#2bb673');
});
// 64 · погода — не просто фон
BT(372.6, D('rain', 4), (g, t, w) => {
  SLAM(g, 'ПОГОДА', t + 0.15, 180);
  ['🌧️', '❄️', '⛈️'].forEach((e, i) => g.emo(e, 130, t + 0.5 + i * 0.15, -500 + i * 500, 260, { float: 8 }));
});
// 65 · дождь -> грязь, снег -> следы
BT(374.7, 'grid', (g, t, w) => {
  ccv(g, 'rain', w('дождь'), -620, 20, 580, { r: -3 });
  pl(g, 'ДОЖДЬ → ГРЯЗЬ', w('грязь'), -620, 330);
  ccv(g, 'snow', w('снег'), -60, 40, 580, { r: 2 });
  pl(g, 'СНЕГ → СЛЕДЫ', w('следы'), -60, 350);
  g.emo('🐾', 150, w('следы'), 470, -120, { float: 8 });
  g.cap('НЕ ИСЧЕЗАЮТ СРАЗУ', 64, w('исчезают'), 500, 100, { cps: 26 });
}, { z: 0.95 });
// 66 · одежда намокает и пачкается
BT(382.3, 'grid', (g, t, w) => {
  mg(g, t + 0.05, 'arthur_full.png', -380, 30, 820, { from: [0, 200] });
  g.emo('💧', 140, w('намокает'), 180, -170, { float: 8 });
  pl(g, 'НАМОКАЕТ', w('намокает'), 420, -170, '#4aa8ff');
  g.emo('🟤', 130, w('пачкается'), 180, 70, { float: 8 });
  pl(g, 'ПАЧКАЕТСЯ', w('пачкается'), 420, 70, '#7a4b2a');
});
// 67 · каждая деталь — память, всё в те же 5 ГБ
BT(385.2, 'grid', (g, t, w) => {
  g.el('', GROW('ПАМЯТЬ', RED), w('памяти'), -300, -100, { from: [0, 80], upd: growUpd(w('памяти'), 4, 0.95) });
  g.el('', GROW('ВЫЧИСЛЕНИЯ', '#ffb000'), w('вычислений'), -300, 60, { from: [0, 80], upd: growUpd(w('вычислений'), 3, 0.9) });
  NUM(g, '5 ГБ', 'всё ещё', w('пять'), 520, -20, RED);
});
// 68 · отдельное испытание — ночь
BT(393.8, D('nightcity', 12), (g, t, w) => {
  SLAM(g, 'НОЧЬ', t + 0.15, 220);
  g.emo('🌙', 170, t + 0.5, 520, -240, { float: 8 });
});
// 69 · десятки маленьких источников света
BT(396.1, 'grid', (g, t, w) => {
  cc(g, 'nightcity', t + 0.05, -260, -30, 900, { r: -2, off: 20 });
  g.cap('ДЕСЯТКИ ИСТОЧНИКОВ СВЕТА', 72, w('десятки'), -260, -350, { cps: 30 });
  [['🏮', 'фонари'], ['🪟', 'окна'], ['🔥', 'костры'], ['🪔', 'лампа']].forEach(([e, word], i) => g.emo(e, 130, w(word), 560 + (i % 2) * 150, -220 + i * 150, { float: 8 }));
});
// 70 · каждый — работа видеочипа; тени только от главных
BT(405.7, 'grid', (g, t, w) => {
  g.el('', SOCC('AMD', 'GPU', 'видеочип', 280), t + 0.05, -560, -40, { from: [0, 200], float: 5 });
  Array.from({ length: 8 }, (_, i) => g.emo('💡', 100, w('источник') + i * 0.12, -180 + (i % 4) * 190, -150 + Math.floor(i / 4) * 200, { float: 7, upd: (tt, d) => { if (tt > at('остальные', 405) && i > 1) d.style.opacity = 0.35; } }));
  pl(g, 'ТЕНИ — ТОЛЬКО ОТ ГЛАВНЫХ', w('тени'), 100, 260, RED);
  pl(g, 'ОСТАЛЬНЫЕ ЛИШЬ ПОДСВЕЧИВАЮТ', w('остальные'), 100, 380);
});
// 71 · в тёмной комнате незаметно
BT(417.4, D('nightcity', 40), (g, t, w) => {
  g.emo('🕯️', 200, t + 0.05, -420, 0, { float: 6 });
  g.cap('НЕЗАМЕТНО', 110, w('незаметно'), 220, -100, { cps: 18 });
  pl(g, 'КОНСОЛИ ЛЕГЧЕ', w('легче') - 0.3, 220, 120, '#2bb673');
});
// 72 · отражения из того, что уже на экране
BT(422.5, 'grid', (g, t, w) => {
  cc(g, 'nightcity', t + 0.05, -300, -100, 760, { r: -2, off: 32 });
  g.el('', `<div style="width:760px;height:220px;border-radius:30px;overflow:hidden;opacity:.55;transform:scaleY(-1);filter:blur(3px)"><img src="/rdr2/clips/nightcity/0960.jpg" style="width:100%;height:auto;display:block;margin-top:-210px"></div>`, w('лужах'), -300, 250, { from: [0, 0], shadow: false });
  g.cap('ОТРАЖЕНИЯ', 90, w('отражения') + 0.1, 470, -230, { cps: 22 });
  pl(g, 'ИЗ ТОГО, ЧТО НА ЭКРАНЕ', w('экране'), 470, -50);
  pl(g, 'ЕЩЁ ЭКОНОМИЯ', w('экономия'), 470, 110, '#2bb673');
});
// 73 · экономия, которую никто не замечает
BT(432.4, DI(RA('pcb.jpg')), (g, t, w) => {
  SLAM(g, 'НИКТО НЕ ЗАМЕЧАЕТ', w('никто') - 0.2, 130);
  g.emo('🤫', 150, w('замечает'), 0, 220, { float: 8 });
});
// 74 · жители делят одно лицо
BT(436.5, 'grid', (g, t, w) => {
  g.cap('ОДНО ЛИЦО', 100, w('лицо'), 0, -400, { cps: 18 });
  [['🎩', -520], ['🤠', 0], ['👒', 520]].forEach(([e, x], i) => {
    pic(g, 'dutch_face.jpg', w('лицо') + i * 0.25, x, 40, 380, 390, { r: i - 1 });
    if (i) g.emo(e, 170, w('шляпе') + i * 0.2, x, -170, { from: [0, -120], float: 3 });
  });
});
// 75 · животных 200+, рядом горстка, модели повторяются
BT(441.1, 'grid', (g, t, w) => {
  cc(g, 'animals', t + 0.05, -330, -60, 820, { r: -2, off: 26 });
  NUM(g, '200+', 'видов', t + 0.2, 520, -220);
  pl(g, 'РЯДОМ — ГОРСТКА', w('горстка'), 520, 20, RED);
  g.emo('🦌', 120, w('повторяются'), 360, 220, { float: 7 });
  g.emo('🦌', 120, w('повторяются') + 0.15, 520, 220, { float: 7 });
  g.emo('🦌', 120, w('повторяются') + 0.3, 680, 220, { float: 7 });
});
// 76 · камни, бочки, заборы — одна модель, повёрнутая
BT(448.3, 'grid', (g, t, w) => {
  [['🪨', 'камни'], ['🛢️', 'бочки'], ['🪵', 'заборы'], ['🌲', 'деревья']].forEach(([e, word], i) => {
    [0, 1, 2].forEach((j) => g.emo(e, 120, w(word) + j * 0.1, -660 + i * 440 + (j - 1) * 110, -120 + j * 20, { float: 6, r: (j - 1) * 25 }));
  });
  pl(g, 'ОДНА И ТА ЖЕ МОДЕЛЬ', w('одной'), 0, 120, RED);
  pl(g, 'ДРУГОЙ УГОЛ · ДРУГАЯ ТЕКСТУРА', w('углом'), 0, 260);
});
// 77 · мир кажется бесконечным
BT(456.8, 'grid', (g, t, w) => {
  cc(g, 'saintdenis', t + 0.05, 0, 0, 1100, { r: -1, off: 22 });
  g.cap('БЕСКОНЕЧНО РАЗНООБРАЗНЫЙ', 80, w('бесконечно'), 0, -390, { cps: 30 });
}, { keys: [[at('мир', 457), 3, 0, 0, 1.08]] });
// 78 · мир не стоит на месте; распорядок дня
BT(461.9, 'grid', (g, t, w) => {
  cc(g, 'valentine', t + 0.05, -360, -40, 820, { r: -2, off: 30 });
  g.el('', CLOCK, w('распорядок'), 520, -40, { from: [0, 200], float: 5, upd: clockUpd });
  g.cap('РАСПОРЯДОК ДНЯ', 80, w('распорядок'), 520, -300, { cps: 24 });
});
// 79 · утро-день-вечер-ночь
BT(467.6, 'grid', (g, t, w) => {
  [['🏪', 'УТРО', 'утром'], ['🔨', 'ДЕНЬ', 'днём'], ['🍺', 'ВЕЧЕР', 'вечером'], ['😴', 'НОЧЬ', 'ночью']].forEach(([e, txt, word], i) => {
    const x = -690 + i * 460, tt = w(word);
    g.emo(e, 160, tt, x, -60, { float: 7 });
    pl(g, txt, tt + 0.15, x, 140, i === 3 ? '#2a3a6a' : INK);
    if (i) link(g, tt - 0.1, x - 230, -60, 160, 0);
  });
}, { z: 0.92 });
// 80 · хитрость: подробно — только рядом
BT(473.1, 'grid', (g, t, w) => {
  g.cap('ХИТРОСТЬ', 100, t + 0.1, -200, -360, { cps: 18 });
  g.el('', AISIM, w('подробно'), -200, 30, { from: [0, 200], float: 4, upd: aiUpd });
  pl(g, 'ПОДРОБНО — ТОЛЬКО РЯДОМ', w('рядом'), 560, -130, RED);
  pl(g, 'ОСТАЛЬНЫЕ — УПРОЩЁННО', w('остальные'), 560, 30, '#8d9099');
  g.emo('🐎', 140, w('подъезжаете'), 560, 210, { float: 8 });
});
// 81 · с животными так же: экосистема
BT(486.1, 'grid', (g, t, w) => {
  cc(g, 'animals', t + 0.05, -300, -60, 840, { r: -2, off: 40 });
  [['🐺', 'ОХОТЯТСЯ', 'хищники'], ['🦌', 'УБЕГАЮТ', 'олени'], ['🦅', 'СЛЕТАЮТСЯ', 'падальщики']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), 560, -220 + i * 160, { from: [200, 0], float: 5 }));
  pl(g, 'ВСЁ — ВОКРУГ ИГРОКА', w('вокруг'), -300, 300, RED);
});
// 82 · на главном не экономили: лошадь
BT(499.1, 'grid', (g, t, w) => {
  g.cap('НА ГЛАВНОМ — НЕ ЭКОНОМИЛИ', 84, t + 0.1, 0, -400, { cps: 30 });
  mg(g, w('лошадь'), 'horse.png', -100, 60, 600, { from: [0, 200] });
  pl(g, 'ОДИН ИЗ САМЫХ ДЕТАЛЬНЫХ ПЕРСОНАЖЕЙ', w('детальных'), 0, 360, RED, { z: 5 });
});
// 83 · мышцы, дыхание, испуг, холод, грязь
BT(505.3, 'grid', (g, t, w) => {
  pic(g, 'horse_river.jpg', t + 0.05, -330, 0, 860, 484, { r: -2 });
  [['💪', 'МЫШЦЫ', 'мышц'], ['😮‍💨', 'ДЫШИТ', 'дышит'], ['😱', 'ПУГАЕТСЯ', 'пугается'], ['🥶', 'МЁРЗНЕТ', 'мёрзнет'], ['🟤', 'ГРЯЗЬ', 'грязи']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), 560, -320 + i * 155, { from: [200, 0], float: 5 }));
});
// 84 · устаёт и привязывается
BT(512.0, 'grid', (g, t, w) => {
  ccv(g, 'gallop', t + 0.05, -540, 20, 620, { r: -3, off: 6 });
  g.el('', GROW('ВЫНОСЛИВОСТЬ', RED), w('устаёт') - 0.4, 200, -150, { from: [0, 80], upd: (tt, d) => { d.querySelector('.gb').style.width = (100 - 70 * E.inOut(P(tt, at('скакать', 512), 1.5))).toFixed(1) + '%'; } });
  g.el('', GROW('ПРИВЯЗАННОСТЬ', '#2bb673'), w('заботиться'), 200, 40, { from: [0, 80], upd: growUpd(w('привязывается') - 0.3, 2) });
  g.emo('❤️', 150, w('хозяину'), 620, 240, { float: 8 });
});
// 85 · то же с людьми
BT(517.8, DI(RA('blue.jpg')), (g, t, w) => {
  SLAM(g, 'ТО ЖЕ С ЛЮДЬМИ', t + 0.15, 150);
  mg(g, t + 0.4, 'arthur_bust.png', 640, 120, 520, { from: [200, 0] });
});
// 86 · обычно — по отдельности
BT(519.0, 'grid', (g, t, w) => {
  g.cap('ОБЫЧНО — ПО ОТДЕЛЬНОСТИ', 84, t + 0.1, 0, -380, { cps: 30 });
  [['🎙️', 'ГОЛОС', 'голос'], ['🕺', 'ТЕЛО', 'тело'], ['🙂', 'ЛИЦО', 'лицо']].forEach(([e, txt, word], i) => {
    const x = -520 + i * 520;
    g.emo(e, 170, w(word), x, -40, { float: 7 });
    pl(g, txt, w(word) + 0.15, x, 160);
  });
});
// 87 · здесь — целые сцены вместе
BT(523.3, 'grid', (g, t, w) => {
  cc(g, 'cutscenes', t + 0.05, -280, -40, 900, { r: -2, off: 40 });
  g.el('', SKEL, w('сцены'), 560, -140, { from: [0, 200], s: 0.8, float: 4, upd: skUpd });
  pl(g, 'РЕЧЬ + ДВИЖЕНИЯ + МИМИКА', w('мимика') - 0.3, -100, 330, RED);
  pl(g, 'ОДНОВРЕМЕННО', w('одновременно'), 560, 200);
});
// 88 · ведут себя как живые
BT(530.2, 'grid', (g, t, w) => {
  mg(g, t + 0.05, 'dutch_full.png', -520, 40, 820, { from: [0, 200] });
  g.cap('КАК ЖИВЫЕ', 110, t + 0.3, 200, -330, { cps: 18 });
  [['🦶', 'ПЕРЕМИНАЮТСЯ', 'переминаются'], ['👀', 'ОТВОДЯТ ВЗГЛЯД', 'отводят'], ['🫱', 'ОБЛОКАЧИВАЮТСЯ', 'облокачиваются'], ['⚡', 'РЕАГИРУЮТ', 'реагируют']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), 260 + (i % 2) * 120, -170 + i * 140, { from: [200, 0], float: 5 }));
});
// 89 · 2000+ страниц сценария
BT(539.3, 'grid', (g, t, w) => {
  g.emo('📜', 260, t + 0.05, -460, 0, { float: 6 });
  g.el('', BIGNUM('0', 'страниц сценария', RED), w('двух'), 300, -100, { from: [0, 180], float: 6, upd: countUp(w('двух'), 2000, '+', 1.2) });
  pl(g, 'РАЗГОВОРЫ В НЕСКОЛЬКИХ ВАРИАНТАХ', w('вариантах') - 0.5, 200, 210);
});
// 90 · ответ зависит от поступков — система чести
BT(546.7, 'grid', (g, t, w) => {
  cc(g, 'honor', t + 0.05, -300, -20, 860, { r: -2, off: 9 });
  g.cap('СИСТЕМА ЧЕСТИ', 90, w('чести'), 470, -230, { cps: 24 });
  g.emo('⚖️', 170, w('чести') + 0.3, 470, 30, { float: 8 });
});
// 91 · поможете — поздороваются; перестрелка — коситься
BT(551.9, 'grid', (g, t, w) => {
  g.el('', ROLE('🤝', 'ПОМОГЛИ'), t + 0.1, -460, -160, { from: [0, 120], float: 5 });
  ARW(g, w('запомнят'), -460, 0, { r: 90 });
  g.el('', ROLE('👋', 'ЗДОРОВАЮТСЯ'), w('поздороваются'), -460, 170, { from: [0, 120], float: 5 });
  g.el('', ROLE('🔫', 'ПЕРЕСТРЕЛКА'), w('перестрелку'), 460, -160, { from: [0, 120], float: 5 });
  g.el('', ROLE('😒', 'КОСЯТСЯ'), w('коситься'), 460, 170, { from: [0, 120], float: 5 });
});
// 92 · несколько лет записи
BT(559.1, 'grid', (g, t, w) => {
  cc(g, 'honor', t + 0.05, -320, -20, 840, { r: -2, off: 50 });
  NUM(g, 'ГОДЫ', 'записи вариантов', w('нескольких'), 520, -40, RED);
  g.emo('🎙️', 140, w('работы'), 520, 240, { float: 8 });
});
// 93 · где-то пришлось остановиться
BT(563.1, DI(RA('pcb.jpg')), (g, t, w) => {
  SLAM(g, 'ГДЕ-ТО НАДО ОСТАНОВИТЬСЯ', t + 0.15, 100);
  pl(g, 'ИНАЧЕ — РУТИНА', w('рутину') - 0.4, 0, 200, RED);
  g.emo('✋', 150, t + 0.5, 0, -230, { float: 8 });
});
// 94 · звук
BT(569.2, 'grid', (g, t, w) => {
  g.cap('ЗВУК', 160, t + 0.1, -500, -60, { cps: 10 });
  g.el('', WAVE, t + 0.3, -500, 160, { shadow: false, upd: waveUpd });
  [['🌲', 'ВЕТЕР В ЛЕСУ', 'лесу'], ['🏜️', 'ЭХО В КАНЬОНЕ', 'каньоне'], ['🔫', 'ВЫСТРЕЛЫ ОТ СКАЛ', 'выстрелы'], ['🎸', 'МУЗЫКА У КОСТРА', 'музыкой']].forEach(([e, txt, word], i) => g.el('', ROLE(e, txt), w(word), 380, -270 + i * 165, { from: [200, 0], float: 5 }));
});
// 95 · сотни тысяч реплик — сжать и подгружать
BT(579.7, 'grid', (g, t, w) => {
  NUM(g, '100 000+', 'реплик и звуков', w('сотни'), -440, -120);
  g.emo('🗜️', 170, w('сжать'), 300, -140, { float: 8 });
  pl(g, 'СЖАТИЕ', w('сжать') + 0.2, 300, 40, RED);
  pl(g, 'ПОДГРУЗКА ПО ДОРОГЕ', w('подгружать'), 0, 260, '#ffb000');
});
// 96 · огромная команда, студии по миру, тысячи человек
BT(589.2, 'grid', (g, t, w) => {
  g.prop('/gta4_ps3/assets/rockstar.png', 200, t + 0.05, -560, -150, { r: -6, float: 6 });
  g.emo('🌍', 260, w('студий'), 0, -60, { float: 6 });
  ['📍', '📍', '📍', '📍'].forEach((e, i) => g.emo(e, 70, w('миру') + i * 0.15, -90 + rnd(i, 3) * 180, -150 + rnd(i, 4) * 160, { float: 3 }));
  NUM(g, 'ТЫСЯЧИ', 'человек', w('тысячи'), 540, -60, RED);
  g.emo('👥', 150, w('человек'), 540, 200, { float: 8 });
});
// 97 · почти 8 лет
BT(601.3, DI(RA('blue.jpg')), (g, t, w) => {
  NUM(g, '~8 ЛЕТ', 'разработки', t + 0.1, -200, 0, RED);
  g.el('', CLOCK, t + 0.3, 400, 0, { from: [0, 200], float: 5, upd: (tt, d) => clockUpd(tt * 6, d) });
});
// 98 · старт не был идеальным
BT(603.9, 'grid', (g, t, w) => {
  g.cap('СТАРТ НЕ БЫЛ ИДЕАЛЬНЫМ', 84, t + 0.1, 0, -380, { cps: 30 });
  g.el('', LOADING, w('подвисала') - 0.3, -200, 20, { from: [0, 200], float: 4 });
  g.emo('🥶', 160, w('подвисала'), 520, -100, { float: 8 });
  pl(g, 'НА ПРЕДЕЛЕ PS4', w('пределу'), 300, 270, RED);
});
// 99 · результат того стоил: октябрь 2018, быстрые продажи
BT(614.9, 'grid', (g, t, w) => {
  pic(g, 'cover.jpg', t + 0.1, -520, 20, 400, 498, { r: -4 });
  NUM(g, '26.10.2018', 'выход', w('октябре'), 200, -180);
  g.emo('📈', 170, w('продаж'), 200, 120, { float: 8 });
  pl(g, 'ОДНИ ИЗ САМЫХ БЫСТРЫХ ПРОДАЖ', w('быстрых'), 200, 300, RED);
});
// 100 · через год — ПК
BT(623.0, 'grid', (g, t, w) => {
  g.emo('🖥️', 260, w('пк'), -480, -40, { float: 6 });
  pl(g, 'ПК · 2019', w('пк') + 0.2, -480, 170, INK);
  g.el('', TILE('МОЩНОЕ ЖЕЛЕЗО'), w('мощное'), 330, -200, { from: [200, 0], float: 5 });
  g.el('', TILE('УМНЕЕ ЗАГРУЗКА'), w('умная'), 330, -20, { from: [200, 0], float: 5 });
  pl(g, 'ОБЪЕКТЫ БОЛЬШЕ НЕ ВЫРАСТАЮТ', w('появление'), 330, 170, '#2bb673');
});
// 101 · RAGE и физически корректный рендеринг
BT(632.6, 'grid', (g, t, w) => {
  g.el('', TILE('ДВИЖОК<br>RAGE'), w('rage'), -520, -40, { from: [0, 160], float: 5, r: -3 });
  g.el('', TILE('PBR<br><span style="font-size:32px">физически корректный рендеринг</span>'), w('физически'), 180, -100, { from: [0, 160], float: 5 });
  g.emo('☀️', 150, w('свет'), 180, 170, { float: 8 });
  pl(g, 'СВЕТ КАК В ЖИЗНИ', w('реальном'), 180, 320);
});
// 102 · подповерхностное рассеивание
BT(639.9, 'grid', (g, t, w) => {
  g.el('', SKIN, t + 0.05, -400, 30, { from: [0, 200], float: 4, upd: skinUpd });
  g.cap('ПОДПОВЕРХНОСТНОЕ', 80, w('подповерхностное'), 400, -200, { cps: 26 });
  g.cap('РАССЕИВАНИЕ', 80, w('рассеивание'), 400, -100, { cps: 26 });
  pic(g, 'dutch_face.jpg', w('живыми') - 1.2, 420, 180, 300, 308, { r: 3 });
});
// 103 · итог: не PS4 стала мощнее
BT(649.9, DI(RA('pcb.jpg')), (g, t, w) => {
  g.prop(RA('ps4.png'), 280, t + 0.1, 0, 230, { float: 6 });
  SLAM(g, 'СЕКРЕТ — НЕ В МОЩНОСТИ', w('секрет'), 110);
});
// 104 · Rockstar знала, что увидит игрок
BT(656.1, 'grid', (g, t, w) => {
  g.prop('/gta4_ps3/assets/rockstar.png', 220, t + 0.05, -460, -20, { r: -6, float: 6 });
  g.emo('👁️', 200, w('увидит'), 260, -60, { float: 7 });
  pl(g, 'ЧТО УВИДИТ ИГРОК', w('увидит') + 0.2, 260, 160, RED);
});
// 105 · пять пунктов
BT(659.7, 'grid', (g, t, w) => {
  [['🧠', 'ПАМЯТЬ — ТОЛЬКО ТОМУ, ЧТО РЯДОМ', 'память'], ['💽', 'ДИСК ПОЛУЧАЛ ДАННЫЕ ЗАРАНЕЕ', 'медленный'], ['🌫️', 'ДАЛЬНЕЕ — ЗА ТУМАНОМ И СВЕТОМ', 'дальние'], ['🔁', 'ПОВТОРЫ ПОД ПОВОРОТАМИ', 'повторяющиеся']].forEach(([e, txt, word], i) =>
    g.el('', ROLE(e, txt), w(word), (i % 2 ? 120 : -120), -270 + i * 180, { from: [i % 2 ? 300 : -300, 0], float: 5 }));
}, { keys: [[at('дальние', 659), 1.5, 0, 80, 0.96]] });
// 106 · ресурсы — на важное: лошадь, лица, погода, мир
BT(671.8, 'grid', (g, t, w) => {
  g.cap('ВСЁ — НА ГЛАВНОЕ', 90, t + 0.1, 0, -400, { cps: 26 });
  mg(g, w('лошадь'), 'horse.png', -620, 60, 360, {});
  pic(g, 'dutch_face.jpg', w('лица'), -200, 40, 300, 308, { r: -2 });
  ccv(g, 'rain', w('погоду'), 190, 50, 420, { r: 2 });
  cc(g, 'saintdenis', w('живой'), 620, 40, 460, { r: 3, off: 40 });
}, { z: 0.95 });
// 107 · Rockstar снова доказала
BT(679.9, DI(RA('blue.jpg')), (g, t, w) => {
  g.prop(RA('rdr2_logo.png'), 200, t + 0.1, 0, -220, { float: 4 });
  g.cap('БОЛЬШЕ, ЧЕМ ЗАЛОЖЕНО', 110, w('выжимать'), 0, 60, { cps: 28 });
  g.prop(RA('ps4.png'), 220, w('консоли'), 0, 290, { float: 6 });
});
// 108 · ГТА 4 и ГТА 5 на PS3
BT(685.1, 'grid', (g, t, w) => {
  g.cap('ЕЩЁ РАЗБОРЫ', 90, t + 0.1, 0, -380, { cps: 20 });
  g.prop(AS.g4logo, 240, w('гта'), -450, 0, { r: -5, float: 6 });
  g.prop(AS.gta5, 460, w('гта', 0, 1), 450, 20, { r: 4, float: 6 });
  pl(g, 'НА PS3', w('ps3'), 0, 300, RED);
});
// 109 · о какой игре дальше? пишите в комментариях
BT(692.9, DI(RA('pcb.jpg')), (g, t, w) => {
  SLAM(g, 'КАКУЮ ИГРУ ДАЛЬШЕ?', t + 0.15, 130);
  g.emo('💬', 160, w('пишите'), 0, 220, { float: 8 });
});
// 110 · спасибо
BT(696.3, 'grid', (g, t, w) => {
  mg(g, t + 0.05, 'arthur_full.png', -560, 40, 820, { from: [0, 200] });
  g.cap('СПАСИБО ЗА ПРОСМОТР!', 100, t + 0.3, 220, -40, { cps: 30 });
  g.emo('👋', 170, t + 0.8, 220, 200, { float: 8 });
});
