// =====================================================================
//              RED DEAD REDEMPTION 2 НА PS4 — ТЕСТ 30 СЕКУНД
// =====================================================================
const BT = (t, bg, fn, cam = {}) => beat(t, bg, (g) => fn(g, t, (p, k = 0) => at(p, t, k)), cam);
const RA = (n) => '/rdr2/assets/' + n;
const DI = (p) => 'dark:' + p;
const NUM = (g, n, sub, t, x, y, col = INK, o = {}) => g.el('', BIGNUM(n, sub, col), t, x, y, { from: [0, 180], r: x < 0 ? -3 : 3, float: 6, ...o });
const R = (g, e, txt, t, x, y, o = {}) => g.el('', ROLE(e, txt), t, x, y, { from: [0, 160], float: 5, ...o });
const ARW = (g, t, x, y, o = {}) => g.el('width:220px;height:120px', CHEV(1), t, x, y, { shadow: false, upd: chevUpd, ...o });
// заглушка обложки (до того как пришлёте настоящую): закат и название текстом
const COVERPH = `<div style="width:380px;height:480px;border-radius:22px;overflow:hidden;background:linear-gradient(#f2c14e 0%,#e46a2b 45%,#7a1f12 100%);position:relative;font-family:Osw;font-weight:700;color:#fff;text-align:center"><div style="position:absolute;left:50%;top:44%;width:190px;height:190px;margin-left:-95px;border-radius:50%;background:#ffd36b;opacity:.9"></div><div style="position:absolute;left:0;right:0;bottom:0;height:42%;background:#2a0f0a"></div><div style="position:absolute;left:0;right:0;bottom:36px;font-size:54px;line-height:1">RED DEAD<br>REDEMPTION 2</div></div>`;
// своя карта: материк, реки и озеро
const MAP = `<svg width="760" height="500" viewBox="0 0 760 500" style="border-radius:26px;background:#cfe3ef"><path d="M60 120 C140 40 300 60 420 70 C560 80 700 120 710 220 C720 330 640 430 470 450 C330 465 150 440 90 360 C40 290 20 190 60 120 Z" fill="#e9d6a8" stroke="#b89a5e" stroke-width="5"/><path d="M90 300 C200 260 260 330 360 280 C450 240 520 300 640 260" fill="none" stroke="#5aa0c8" stroke-width="12" stroke-linecap="round"/><path d="M380 90 C390 160 350 210 370 280" fill="none" stroke="#5aa0c8" stroke-width="9" stroke-linecap="round"/><ellipse cx="520" cy="170" rx="60" ry="34" fill="#5aa0c8"/><path d="M120 150 L160 110 L200 150 Z M190 160 L230 115 L270 160 Z" fill="#ffffff" stroke="#9aa" stroke-width="3"/><g class="pins"></g></svg>`;
// линия, которая «дорисовывается» (соединение элементов, как в референсе)
const LINK = (w, ang = 0) => `<svg width="${w}" height="20" style="transform:rotate(${ang}deg);overflow:visible"><line class="ln" x1="0" y1="10" x2="${w}" y2="10" stroke="#fff" stroke-width="9" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
const linkUpd = (t0, dur = 0.6) => (t, d) => { d.querySelector('.ln').style.strokeDashoffset = (1 - E.inOut(P(t, t0, dur))).toFixed(3); };
// ударная надпись на весь экран
const SLAM = (g, txt, t, size = 170, col = '#fff') => g.cap(txt, size, t, 0, 0, { cps: 40, r: 0, col, css: 'text-shadow:0 10px 30px rgba(0,0,0,.6)' });

// 0 · 2018
BT(0, 'grid', (g, t, w) => {
  g.cap('2018', 260, t + 0.1, 0, -20, { cps: 10, r: -2, until: w('rockstar') - 0.3 });
  g.emo('📅', 160, t + 0.5, 470, -200, { float: 8, t1: w('rockstar') - 0.3 });
}, { keys: [[0, 2.0, 0, 0, 1.05]] });
// 1 · Rockstar выпускает RDR2
BT(at('rockstar') - 0.1, 'grid', (g, t, w) => {
  g.prop('/gta4_ps3/assets/rockstar.png', 200, t + 0.05, -430, -40, { r: -6, float: 6 });
  g.el('', COVERPH, w('red'), 220, 20, { from: [260, 60], r: 4, float: 6 });
  g.cap('RED DEAD REDEMPTION 2', 70, w('redemption'), 220, -330, { cps: 34 });
}, { keys: [[at('red'), 0.6, 120, 0, 1.08]] });
// 2 · на PS4
BT(at('playstation') - 0.2, DI(RA('blue.jpg')), (g, t, w) => {
  g.prop(RA('ps4.png'), 320, t + 0.05, -60, 60, { from: [0, 260], float: 8 });
  g.cap('PLAYSTATION 4', 110, t + 0.3, -60, -280, { cps: 28 });
  g.el('', COVERPH, t + 0.5, 520, 40, { from: [300, 0], r: 6, s: 0.6, float: 6 });
}, { keys: [[at('playstation'), 1.2, 0, 20, 1.08]] });
// 3 · пять лет на рынке
BT(at('продавалась') - 0.2, DI(RA('blue.jpg')), (g, t, w) => {
  g.cap('2013', 170, t + 0.05, -430, -40, { cps: 12, r: -3 });
  ARW(g, t + 0.5, 0, -40);
  g.cap('2018', 170, t + 0.7, 430, -40, { cps: 12, r: 3 });
  g.el('', PLATE('5 ЛЕТ', '#fff', RED), w('пять'), 0, 220, { from: [0, 160], float: 5 });
});
// 4 · карта 75 км²
BT(at('внутри') - 0.1, 'grid', (g, t, w) => {
  g.el('', MAP, t + 0.05, -200, 30, { from: [0, 220], r: -2, float: 5 });
  g.cap('ДИКИЙ ЗАПАД', 90, w('дикий'), -200, -330, { cps: 22 });
  NUM(g, '75 КМ²', 'площадь карты', w('семьдесят'), 520, 120);
}, { keys: [[at('семьдесят'), 0.8, 160, 40, 1.06]] });
// 5 · пять штатов: снег, болота, пустыня, города (карточки с иконками, соединённые линиями)
BT(at('пять', at('километров')) - 0.1, 'grid', (g, t, w) => {
  g.cap('5 ШТАТОВ', 100, t + 0.05, 0, -390, { cps: 18 });
  [['🏔️', 'ПЕРЕВАЛЫ', 'заснеженные'], ['🌿', 'БОЛОТА', 'болота'], ['🏜️', 'ПУСТЫНЯ', 'пустыня'], ['🏙️', 'ГОРОДА', 'города']].forEach(([e, txt, word], i) => {
    const x = -690 + i * 460;
    R(g, e, txt, w(word), x, 40, { r: i % 2 ? 3 : -3, s: 1.3 });
    if (i) g.el('width:120px;height:20px', LINK(120), w(word) - 0.15, x - 230, 40, { shadow: false, from: [0, 0], upd: linkUpd(w(word) - 0.15, 0.4) });
  });
}, { z: 0.95, keys: [[at('заснеженные'), 0.5, -500, 0, 1.08], [at('болота'), 0.5, -170, 0, 1.08], [at('пустыня'), 0.5, 170, 0, 1.08], [at('города'), 0.5, 500, 0, 1.08], [at('города') + 0.6, 0.6, 0, 0, 0.9]] });
// 6 · 200+ видов животных и погода
BT(at('больше') - 0.1, 'grid', (g, t, w) => {
  NUM(g, '200+', 'видов животных', w('двухсот'), -420, -40);
  ['🦌', '🐻', '🦅', '🐺', '🐎'].forEach((e, i) => g.emo(e, 120, w('животных') + i * 0.15, -700 + i * 140, 230, { float: 7 }));
  g.cap('СВОЯ ПОГОДА', 84, w('погода'), 420, -300, { cps: 22 });
  ['☀️', '🌧️', '❄️', '🌫️'].forEach((e, i) => g.emo(e, 120, w('погода') + 0.2 + i * 0.15, 180 + i * 160, -120, { float: 8 }));
}, { keys: [[at('погода'), 0.6, 220, -60, 1.05]] });
// 7 · 1200 актёров
BT(at('около') - 0.1, 'grid', (g, t, w) => {
  NUM(g, '1200', 'актёров', w('тысячи'), -330, -40);
  g.emo('🎭', 170, w('актёров'), 300, -170, { float: 8 });
  g.emo('🎙️', 150, w('голоса'), 470, 40, { float: 8 });
  g.emo('🕺', 150, w('движения'), 260, 210, { float: 8 });
  g.cap('ГОЛОСА И ДВИЖЕНИЯ', 70, w('голоса'), 0, 360, { cps: 26 });
});
// 8 · вопрос: как? — на тёмной плате
BT(at('вопрос') - 0.1, DI(RA('pcb.jpg')), (g, t, w) => {
  g.prop(RA('ps4.png'), 300, t + 0.05, 0, 200, { from: [0, 260], float: 6 });
  SLAM(g, 'КАК ЭТО ПОМЕСТИЛОСЬ?', w('как'), 120);
  g.emo('❓', 150, w('поместилось'), 600, -220, { float: 10 });
}, { keys: [[at('как'), 2.2, 0, 60, 1.12]] });
