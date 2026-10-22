// =====================================================================
//              RED DEAD REDEMPTION 2 НА PS4 — БИТЫ
// =====================================================================
const BT = (t, bg, fn, cam = {}) => beat(t, bg, (g) => fn(g, t, (p, k = 0) => at(p, t, k)), cam);
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
